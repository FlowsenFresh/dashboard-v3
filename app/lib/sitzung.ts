import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { db } from "./db";
import { benutzer, freigaben, sitzungen } from "./db/schema";

// Name des Cookies. proxy.ts schaut nur, ob es da ist. Ob es gültig ist, prüft diese Datei.
export const SITZUNG_COOKIE = "sitzung";
const DAUER_TAGE = 30;

export type Benutzer = {
  id: number;
  email: string;
  rolle: "admin" | "laden";
  ladenId: number | null; // eigener Laden (nur bei rolle "laden")
  istInhaber: boolean; // rolle "laden": der Inhaber, verwaltet das Team
  darfWebseite: boolean; // rolle "laden": darf die Webseite bearbeiten (Inhaber immer)
  // admin: der Laden, in den er gerade schaut. Nur gesetzt, wenn der Inhaber ihm per Code
  // Zugang gegeben hat und der noch läuft. Sonst null.
  ansichtLadenId: number | null;
  zugriffBis: Date | null; // admin: bis wann der Zugang zu diesem Laden gilt
  sitzungId: string; // Hash des Tokens, damit ladenOeffnen die richtige Zeile ändert
};

// Welche Daten darf diese Person gerade sehen? Zahl = nur dieser Laden.
// Alle Speicher-Funktionen filtern damit. Ein Ladenbesitzer bekommt immer seinen Laden,
// egal was sonst in der Sitzung steht. Der admin sieht nur einen Laden, für den er gerade
// einen gültigen Zugang (Code vom Inhaber) hat. Sonst -1: diese id gibt es nie, also keine Daten.
// (null hieß früher "alle Läden". Das gibt es bewusst nicht mehr: keine Kundendaten ohne Zustimmung.)
export function sichtbarerLaden(angemeldet: Benutzer): number {
  if (angemeldet.rolle === "admin") return angemeldet.ansichtLadenId ?? -1;
  return angemeldet.ladenId ?? -1; // laden-Benutzer ohne Laden sieht nichts
}

// Darf diese Person die Webseite dieses Ladens bearbeiten?
// admin darf alle. Aus dem Laden: der Inhaber, und Mitarbeiter nur, wenn der Inhaber es erlaubt hat.
export function darfLadenBearbeiten(angemeldet: Benutzer, ladenId: number): boolean {
  if (angemeldet.rolle === "admin") return true;
  return angemeldet.ladenId === ladenId && darfWebseiteBearbeiten(angemeldet);
}

// Für Menü und Seiten im Dashboard: Webseite bearbeiten ja oder nein (ohne bestimmten Laden).
// Der admin darf es, sobald er per Code in einem Laden ist.
export function darfWebseiteBearbeiten(angemeldet: Benutzer): boolean {
  if (angemeldet.rolle === "admin") return true;
  return angemeldet.istInhaber || angemeldet.darfWebseite;
}

// Ist das der Inhaber eines Ladens? Nur er verwaltet das Team und gibt den Support-Code.
// Der admin (Flo) ist das nie, auch nicht mit Zugang: sonst könnte er sich selbst Logins anlegen.
export function istLadenInhaber(
  angemeldet: Benutzer,
): angemeldet is Benutzer & { ladenId: number } {
  return angemeldet.rolle === "laden" && angemeldet.istInhaber && angemeldet.ladenId !== null;
}

// In der Datenbank steht nur der Hash vom Token (siehe schema.ts).
// SHA-256 reicht hier, weil das Token 32 zufällige Bytes hat: das kann niemand erraten.
// Bei Passwörtern ist das anders, die sind kurz und von Menschen ausgedacht, darum dort scrypt.
function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function sitzungStarten(benutzerId: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const laeuftAbAm = new Date(Date.now() + DAUER_TAGE * 24 * 60 * 60 * 1000);

  await db.insert(sitzungen).values({ id: tokenHash(token), benutzerId, laeuftAbAm });
  // Bei der Gelegenheit abgelaufene Sitzungen aufräumen
  await db.delete(sitzungen).where(lt(sitzungen.laeuftAbAm, new Date()));

  (await cookies()).set(SITZUNG_COOKIE, token, {
    httpOnly: true, // JavaScript im Browser kommt nicht dran (Schutz gegen XSS)
    secure: process.env.NODE_ENV === "production", // nur über HTTPS (lokal gibt es kein HTTPS)
    sameSite: "lax", // fremde Seiten können keine Formulare mit unserem Cookie abschicken
    path: "/",
    expires: laeuftAbAm,
  });
}

// Wer ist gerade angemeldet? null, wenn niemand (oder Sitzung abgelaufen/gelöscht).
// Liest das Cookie, darum nur innerhalb von <Suspense> oder in Server Actions aufrufen.
export async function aktuellerBenutzer(): Promise<Benutzer | null> {
  const token = (await cookies()).get(SITZUNG_COOKIE)?.value;
  if (!token) return null;
  // Sagt Next: ab hier nur beim echten Aufruf rechnen, nie vorab beim Bauen der Seite
  await connection();

  const [zeile] = await db
    .select({
      id: benutzer.id,
      email: benutzer.email,
      rolle: benutzer.rolle,
      ladenId: benutzer.ladenId,
      istInhaber: benutzer.istInhaber,
      darfWebseite: benutzer.darfWebseite,
      ansichtLadenId: sitzungen.ansichtLadenId,
      sitzungId: sitzungen.id,
      // Läuft gerade ein Zugang (Code eingelöst, noch nicht abgelaufen oder beendet)
      // für den Laden, in den der admin schaut? Dann bis wann. Sonst leer.
      zugriffBis: sql<string | Date | null>`(
        select max(${freigaben.zugriffBis}) from ${freigaben}
        where ${freigaben.ladenId} = ${sitzungen.ansichtLadenId}
          and ${freigaben.zugriffBis} > now()
          and ${freigaben.beendetAm} is null
      )`,
    })
    .from(sitzungen)
    .innerJoin(benutzer, eq(sitzungen.benutzerId, benutzer.id))
    // "now()" = die Uhrzeit der Datenbank. Abgelaufene Sitzungen zählen nicht.
    .where(and(eq(sitzungen.id, tokenHash(token)), gt(sitzungen.laeuftAbAm, sql`now()`)));

  if (!zeile) return null;

  // Ohne gültigen Zugang zählt die gewählte Ansicht nicht
  const zugriffBis = zeile.zugriffBis ? new Date(zeile.zugriffBis) : null;
  const ansichtLadenId = zeile.rolle === "admin" && zugriffBis ? zeile.ansichtLadenId : null;
  return { ...zeile, ansichtLadenId, zugriffBis: ansichtLadenId ? zugriffBis : null };
}

// Für Seiten und Actions, die nur Angemeldete sehen dürfen: ohne Login geht es zur Login-Seite.
// proxy.ts leitet zwar schon um, aber das ist nur eine schnelle Vorab-Prüfung.
// Die echte Prüfung passiert hier, direkt vor den Daten.
export async function benutzerPflicht(): Promise<Benutzer> {
  const angemeldet = await aktuellerBenutzer();
  if (!angemeldet) redirect("/login");
  return angemeldet;
}

export async function sitzungBeenden(): Promise<void> {
  const speicher = await cookies();
  const token = speicher.get(SITZUNG_COOKIE)?.value;
  if (token) await db.delete(sitzungen).where(eq(sitzungen.id, tokenHash(token)));
  speicher.delete(SITZUNG_COOKIE);
}

// admin schaut in einen bestimmten Laden (oder mit null in keinen).
// Das allein gibt noch keinen Zugriff: aktuellerBenutzer prüft zusätzlich die Freigabe.
export async function ansichtSetzen(angemeldet: Benutzer, ladenId: number | null): Promise<void> {
  if (angemeldet.rolle !== "admin") return;
  await db
    .update(sitzungen)
    .set({ ansichtLadenId: ladenId })
    .where(eq(sitzungen.id, angemeldet.sitzungId));
}
