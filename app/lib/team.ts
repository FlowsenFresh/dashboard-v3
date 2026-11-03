import "server-only";
import { randomInt } from "node:crypto";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { benutzer, sitzungen } from "./db/schema";
import { passwortHashen } from "./passwort";

// ── Team eines Ladens ──
// Der Inhaber legt hier Logins für seine Mitarbeiter an. Alle Funktionen bekommen die ladenId
// des Inhabers aus der Sitzung (nie aus dem Formular) und ändern nur Mitarbeiter GENAU dieses
// Ladens. Andere Inhaber, fremde Läden oder der admin sind so nie erreichbar.

export type Mitglied = {
  id: number;
  email: string;
  name: string | null;
  istInhaber: boolean;
  darfWebseite: boolean;
  erstelltAm: Date;
};

// Alle Logins dieses Ladens, Inhaber zuerst
export async function teamListe(ladenId: number): Promise<Mitglied[]> {
  return db
    .select({
      id: benutzer.id,
      email: benutzer.email,
      name: benutzer.name,
      istInhaber: benutzer.istInhaber,
      darfWebseite: benutzer.darfWebseite,
      erstelltAm: benutzer.erstelltAm,
    })
    .from(benutzer)
    .where(and(eq(benutzer.ladenId, ladenId), eq(benutzer.rolle, "laden")))
    .orderBy(desc(benutzer.istInhaber), asc(benutzer.erstelltAm));
}

// Ohne Zeichen, die man leicht verwechselt (0/O, 1/l/I). Der Inhaber liest es ja vor.
const ZEICHEN = "abcdefghjkmnpqrstuvwxyz23456789";

// Zufälliges Start-Passwort, z. B. "k7mq-x3pa-9fhw-t2dn": 16 Zeichen aus 31 = ca. 79 Bit Zufall.
// randomInt ist kryptografischer Zufall, nicht Math.random.
export function startPasswort(): string {
  const gruppen = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => ZEICHEN[randomInt(ZEICHEN.length)]).join(""),
  );
  return gruppen.join("-");
}

export type AnlegenErgebnis = { ok: true; passwort: string } | { ok: false; fehler: string };

export async function mitarbeiterAnlegen(
  ladenId: number,
  daten: { email: string; name: string | null; darfWebseite: boolean },
): Promise<AnlegenErgebnis> {
  const passwort = startPasswort();
  // onConflictDoNothing: Gibt es die E-Mail schon (auch in einem anderen Laden),
  // passiert NICHTS. Sonst könnte ein Inhaber fremde Logins übernehmen.
  const neu = await db
    .insert(benutzer)
    .values({
      email: daten.email,
      name: daten.name,
      passwortHash: await passwortHashen(passwort),
      rolle: "laden",
      ladenId,
      istInhaber: false,
      darfWebseite: daten.darfWebseite,
    })
    .onConflictDoNothing({ target: benutzer.email })
    .returning({ id: benutzer.id });

  if (neu.length === 0) return { ok: false, fehler: "Diese E-Mail hat schon einen Login." };
  return { ok: true, passwort };
}

// Bedingung für alle Änderungen: dieser Mitarbeiter, in diesem Laden, und kein Inhaber
function mitarbeiterVon(ladenId: number, mitarbeiterId: number) {
  return and(
    eq(benutzer.id, mitarbeiterId),
    eq(benutzer.ladenId, ladenId),
    eq(benutzer.rolle, "laden"),
    eq(benutzer.istInhaber, false),
  );
}

export async function webseiteRechtSetzen(
  ladenId: number,
  mitarbeiterId: number,
  darf: boolean,
): Promise<void> {
  // Wirkt sofort: aktuellerBenutzer() liest das Recht bei jedem Aufruf frisch aus der Datenbank
  await db
    .update(benutzer)
    .set({ darfWebseite: darf })
    .where(mitarbeiterVon(ladenId, mitarbeiterId));
}

// Neues Passwort, z. B. wenn es vergessen wurde. Alle offenen Anmeldungen fliegen raus.
export async function passwortNeuSetzen(
  ladenId: number,
  mitarbeiterId: number,
): Promise<string | null> {
  const passwort = startPasswort();
  const geaendert = await db
    .update(benutzer)
    .set({ passwortHash: await passwortHashen(passwort) })
    .where(mitarbeiterVon(ladenId, mitarbeiterId))
    .returning({ id: benutzer.id });
  if (geaendert.length === 0) return null;
  await db.delete(sitzungen).where(eq(sitzungen.benutzerId, mitarbeiterId));
  return passwort;
}

// Login löschen. Die Sitzungen verschwinden mit (onDelete: "cascade"), er ist sofort abgemeldet.
export async function mitarbeiterEntfernen(ladenId: number, mitarbeiterId: number): Promise<void> {
  await db.delete(benutzer).where(mitarbeiterVon(ladenId, mitarbeiterId));
}
