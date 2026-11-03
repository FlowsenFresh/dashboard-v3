import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { kontakte, laeden, nachrichten } from "./db/schema";
import type { Nachricht } from "./nachrichten";
import { benutzerPflicht, type Benutzer } from "./sitzung";

// Vorher lagen die Nachrichten in einer JSON-Datei, jetzt in Neon (Postgres).
// Seiten und Actions rufen weiter dieselben drei Funktionen auf,
// darum musste außer dieser Datei fast nichts geändert werden.

// Datum für die Karte so anzeigen wie vorher: "18.10.2026, 15:00 Uhr"
function zeitText(zeit: Date): string {
  return (
    zeit.toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
      dateStyle: "medium",
      timeStyle: "short",
    }) + " Uhr"
  );
}

// Admin sieht alle Läden, ein Ladenbesitzer nur die Zeilen mit seiner laden_id.
// undefined in .where() heißt "kein Filter".
function nurEigenerLaden(angemeldet: Benutzer) {
  return angemeldet.rolle === "admin"
    ? undefined
    : eq(nachrichten.ladenId, angemeldet.ladenId ?? -1);
}

export async function alleNachrichten(): Promise<Nachricht[]> {
  // Die Login-Prüfung sitzt hier direkt vor den Daten. So kann keine Seite sie vergessen.
  const angemeldet = await benutzerPflicht();

  // Ein JOIN holt Nachricht, Kontakt und Laden in einer einzigen Abfrage
  const zeilen = await db
    .select({ nachricht: nachrichten, kontakt: kontakte, ladenSlug: laeden.slug })
    .from(nachrichten)
    .innerJoin(kontakte, eq(nachrichten.kontaktId, kontakte.id))
    .innerJoin(laeden, eq(nachrichten.ladenId, laeden.id))
    .where(nurEigenerLaden(angemeldet))
    .orderBy(desc(nachrichten.eingegangenAm)); // neueste zuerst

  // Aus den Tabellen-Zeilen wieder das Nachricht-Objekt machen, das die Karte kennt.
  // "?? undefined" macht aus null (Datenbank) ein undefined (TypeScript-optional).
  return zeilen.map(({ nachricht, kontakt, ladenSlug }) => ({
    id: nachricht.id,
    laden: ladenSlug,
    anliegen: nachricht.anliegen ?? undefined,
    betreff: nachricht.betreff,
    vorname: kontakt.vorname,
    nachname: kontakt.nachname,
    email: kontakt.email ?? undefined,
    telefon: kontakt.telefon ?? undefined,
    inhalt: nachricht.inhalt ?? undefined,
    eingegangen: zeitText(nachricht.eingegangenAm),
    wunschDatum: nachricht.wunschDatum ?? undefined,
    wunschZeit: nachricht.wunschZeit?.slice(0, 5), // "15:00:00" -> "15:00"
    status: nachricht.status,
  }));
}

export type NeueNachricht = {
  laden: string; // slug
  anliegen: string;
  betreff: string;
  vorname: string;
  nachname: string;
  email?: string;
  telefon?: string;
  inhalt?: string;
};

export async function nachrichtSpeichern(neu: NeueNachricht): Promise<void> {
  const [laden] = await db.select({ id: laeden.id }).from(laeden).where(eq(laeden.slug, neu.laden));
  if (!laden) throw new Error(`Laden "${neu.laden}" steht nicht in der Datenbank.`);

  const kontaktId = await kontaktFindenOderAnlegen(laden.id, neu);

  // id, status ("neu") und eingegangen_am (jetzt) setzt die Datenbank selbst
  await db.insert(nachrichten).values({
    ladenId: laden.id,
    kontaktId,
    anliegen: neu.anliegen,
    betreff: neu.betreff,
    inhalt: neu.inhalt,
  });
}

// Schreibt jemand ein zweites Mal (gleicher Laden, gleiche E-Mail bzw. Telefonnummer),
// hängen wir die Nachricht an den bestehenden Kontakt statt einen doppelten anzulegen.
async function kontaktFindenOderAnlegen(ladenId: number, neu: NeueNachricht): Promise<number> {
  const gleichePerson = neu.email
    ? sql`lower(${kontakte.email}) = lower(${neu.email})`
    : eq(kontakte.telefon, neu.telefon ?? "");

  const [vorhanden] = await db
    .select({ id: kontakte.id })
    .from(kontakte)
    .where(and(eq(kontakte.ladenId, ladenId), gleichePerson))
    .limit(1);
  if (vorhanden) return vorhanden.id;

  const [angelegt] = await db
    .insert(kontakte)
    .values({
      ladenId,
      vorname: neu.vorname,
      nachname: neu.nachname,
      email: neu.email,
      telefon: neu.telefon,
    })
    .returning({ id: kontakte.id });
  return angelegt.id;
}

export async function nachrichtStatusSetzen(
  id: number,
  status: Nachricht["status"],
): Promise<void> {
  const angemeldet = await benutzerPflicht();
  // Ein UPDATE statt "alles lesen, ändern, alles zurückschreiben" wie bei der JSON-Datei.
  // Mit Laden-Filter: eine fremde Nachrichten-ID ändert einfach nichts.
  await db
    .update(nachrichten)
    .set({ status })
    .where(and(eq(nachrichten.id, id), nurEigenerLaden(angemeldet)));
}
