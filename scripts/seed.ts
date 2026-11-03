// Füllt eine leere Datenbank mit Beispieldaten: pnpm db:seed
// Läuft außerhalb von Next.js, darum eigene Verbindung statt app/lib/db.
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq } from "drizzle-orm";
import { kontakte, laeden, nachrichten, termine } from "../app/lib/db/schema";
import { beispielLaeden } from "./beispielLaeden";

config({ path: ".env.local" });
const db = drizzle(neon(process.env.DATABASE_URL!));

async function main() {
  // Alle Beispiel-Läden aus scripts/beispielLaeden.ts anlegen.
  // "onConflictDoNothing" = gibt es ihn schon, passiert nichts. Darum gefahrlos wiederholbar.
  await db.insert(laeden).values(beispielLaeden).onConflictDoNothing();

  // Läden, die es schon vor dem CMS gab (z. B. radl-huber), haben noch leere Inhalte.
  // Die füllen wir einmal. Wer schon etwas im Dashboard eingetragen hat (branche nicht leer),
  // dem überschreiben wir nichts.
  for (const { slug, ...inhalt } of beispielLaeden) {
    await db
      .update(laeden)
      .set(inhalt)
      .where(and(eq(laeden.slug, slug), eq(laeden.branche, "")));
  }
  console.log(`${beispielLaeden.length} Beispiel-Läden sind da.`);
  const [laden] = await db.select().from(laeden).where(eq(laeden.slug, "radl-huber"));

  // Nur füllen, wenn noch keine Nachrichten da sind. So kann man das Skript gefahrlos nochmal starten.
  const vorhanden = await db.select({ id: nachrichten.id }).from(nachrichten).limit(1);
  if (vorhanden.length > 0) {
    console.log("Es gibt schon Daten, nichts zu tun.");
    return;
  }

  const [sabine, jonas, lena, thomas, aylin, peter, max, moritz, manfred] = await db
    .insert(kontakte)
    .values([
      {
        ladenId: laden.id,
        vorname: "Sabine",
        nachname: "Wagner",
        email: "sabine.wagner@web.de",
        telefon: "0171 4455667",
      },
      { ladenId: laden.id, vorname: "Jonas", nachname: "Berger", telefon: "0151 2233445" },
      { ladenId: laden.id, vorname: "Lena", nachname: "Hofmann", email: "lena.hofmann@gmx.de" },
      {
        ladenId: laden.id,
        vorname: "Thomas",
        nachname: "Maier",
        email: "t.maier@t-online.de",
        telefon: "08171 98765",
      },
      {
        ladenId: laden.id,
        vorname: "Aylin",
        nachname: "Demir",
        email: "aylin.demir@gmail.com",
        telefon: "0176 3344556",
      },
      { ladenId: laden.id, vorname: "Peter", nachname: "Schmid", telefon: "0160 7788990" },
      { ladenId: laden.id, vorname: "Max", nachname: "Mustermann", telefon: "0160 1234567" },
      { ladenId: laden.id, vorname: "Moritz", nachname: "Mustermann", telefon: "0160 1234567" },
      { ladenId: laden.id, vorname: "Manfred", nachname: "Mustermann", telefon: "0160 1234567" },
    ])
    .returning();

  // Jede Nachricht hat ein Anliegen aus der Liste des Ladens, damit man später zählen kann
  await db.insert(nachrichten).values([
    {
      ladenId: laden.id,
      kontaktId: sabine.id,
      anliegen: "Reparatur",
      betreff: "Hinterradbremse quietscht",
      inhalt:
        "Servus, meine Scheibenbremse hinten quietscht seit ein paar Tagen ziemlich laut. Könnt ihr euch das anschauen?",
      status: "neu",
      eingegangenAm: new Date("2026-11-02T17:42:00+01:00"),
    },
    {
      ladenId: laden.id,
      kontaktId: jonas.id,
      anliegen: "Reifen & Schlauch",
      betreff: "Platten am Kinderrad",
      inhalt: "Mein Sohn hat einen Platten am 20-Zoll-Rad. Habt ihr den Schlauch da?",
      status: "neu",
      eingegangenAm: new Date("2026-11-02T09:15:00+01:00"),
    },
    {
      ladenId: laden.id,
      kontaktId: lena.id,
      anliegen: "Inspektion",
      betreff: "Inspektion E-Bike",
      inhalt:
        "Mein E-Bike (Cube, 2 Jahre alt) braucht die jährliche Inspektion. Wie lange dauert das ungefähr?",
      wunschDatum: "2026-11-08",
      wunschZeit: "10:00",
      status: "gelesen",
      eingegangenAm: new Date("2026-11-01T14:30:00+01:00"),
    },
    {
      ladenId: laden.id,
      kontaktId: thomas.id,
      anliegen: "Termin anfragen",
      betreff: "Termin für Wintercheck",
      inhalt: "Hätte gern einen Termin nächste Woche, am liebsten Dienstag Nachmittag.",
      wunschDatum: "2026-11-10",
      wunschZeit: "15:30",
      status: "beantwortet",
      eingegangenAm: new Date("2026-10-31T11:05:00+01:00"),
    },
    {
      ladenId: laden.id,
      kontaktId: aylin.id,
      anliegen: "Sonstige Frage",
      betreff: "Gebrauchte Räder?",
      inhalt: "Verkauft ihr auch gebrauchte Räder oder nehmt ihr mein altes in Zahlung?",
      status: "gelesen",
      eingegangenAm: new Date("2026-10-30T19:20:00+01:00"),
    },
    {
      ladenId: laden.id,
      kontaktId: peter.id,
      anliegen: "Reparatur",
      betreff: "Schaltung springt",
      inhalt: "Die Kette springt bei den kleinen Gängen ständig raus.",
      status: "neu",
      eingegangenAm: new Date("2026-10-29T08:50:00+01:00"),
    },
    {
      ladenId: laden.id,
      kontaktId: sabine.id,
      anliegen: "Reifen & Schlauch",
      betreff: "Winterreifen montieren",
      inhalt: "Könnt ihr mir Spikereifen aufziehen? Die Reifen bringe ich selber mit.",
      status: "beantwortet",
      eingegangenAm: new Date("2026-10-27T16:10:00+01:00"),
    },
  ]);

  await db.insert(termine).values([
    {
      ladenId: laden.id,
      kontaktId: max.id,
      auftragsnummer: 1,
      datum: "2026-10-17",
      titel: "Schaltung neu",
      notiz: "Nachricht zu Termin 1",
      erledigt: true,
    },
    {
      ladenId: laden.id,
      kontaktId: moritz.id,
      auftragsnummer: 2,
      datum: "2026-10-19",
      titel: "Bremsen neu",
    },
    {
      ladenId: laden.id,
      kontaktId: manfred.id,
      auftragsnummer: 3,
      datum: "2026-10-21",
      titel: "Schaltung einstellen",
      notiz: "Nachricht zu Termin 3",
      erledigt: true,
    },
  ]);

  console.log("Beispieldaten angelegt.");
}

main();
