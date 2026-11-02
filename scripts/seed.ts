// Füllt eine leere Datenbank mit Beispieldaten: pnpm db:seed
// Läuft außerhalb von Next.js, darum eigene Verbindung statt app/lib/db.
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { kontakte, laeden, nachrichten, termine } from "../app/lib/db/schema";

config({ path: ".env.local" });
const db = drizzle(neon(process.env.DATABASE_URL!));

async function main() {
  // Laden anlegen. "onConflictDoNothing" = gibt es ihn schon, passiert nichts.
  await db.insert(laeden).values({ slug: "radl-huber", name: "Radl Huber" }).onConflictDoNothing();
  const [laden] = await db.select().from(laeden).where(eq(laeden.slug, "radl-huber"));

  // Nur füllen, wenn noch keine Nachrichten da sind. So kann man das Skript gefahrlos nochmal starten.
  const vorhanden = await db.select({ id: nachrichten.id }).from(nachrichten).limit(1);
  if (vorhanden.length > 0) {
    console.log("Es gibt schon Daten, nichts zu tun.");
    return;
  }

  const [michael, menni, max, moritz, manfred] = await db
    .insert(kontakte)
    .values([
      {
        ladenId: laden.id,
        vorname: "Michael",
        nachname: "Mustermann",
        email: "email@email.de",
        telefon: "0160 1234567",
      },
      { ladenId: laden.id, vorname: "Menni", nachname: "Mustermann", email: "menni@email.de" },
      { ladenId: laden.id, vorname: "Max", nachname: "Mustermann", telefon: "0160 1234567" },
      { ladenId: laden.id, vorname: "Moritz", nachname: "Mustermann", telefon: "0160 1234567" },
      { ladenId: laden.id, vorname: "Manfred", nachname: "Mustermann", telefon: "0160 1234567" },
    ])
    .returning();

  await db.insert(nachrichten).values([
    {
      ladenId: laden.id,
      kontaktId: michael.id,
      anliegen: "Reparatur",
      betreff: "Bremsen wechseln",
      wunschDatum: "2026-10-19",
      wunschZeit: "15:00",
      status: "neu",
      eingegangenAm: new Date("2026-10-18T15:00:00+02:00"),
    },
    {
      ladenId: laden.id,
      kontaktId: menni.id,
      anliegen: "Reifen & Schlauch",
      betreff: "Reifenwechseln kosten?",
      inhalt: "Servus habts ihr was frei ?",
      status: "gelesen",
      eingegangenAm: new Date("2026-10-18T15:30:00+02:00"),
    },
    {
      ladenId: laden.id,
      kontaktId: michael.id,
      anliegen: "Inspektion",
      betreff: "Frühjahrscheck",
      status: "beantwortet",
      eingegangenAm: new Date("2026-10-18T14:00:00+02:00"),
    },
    {
      ladenId: laden.id,
      kontaktId: michael.id,
      anliegen: "Termin anfragen",
      betreff: "Was frei am 18.10 - 16:00 Uhr",
      inhalt: "Servus habts ihr was frei ?",
      status: "neu",
      eingegangenAm: new Date("2026-10-18T16:00:00+02:00"),
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
