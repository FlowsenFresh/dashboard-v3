import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "./db";
import { kontakte, termine } from "./db/schema";
import type { Termin } from "./termine";
import { benutzerPflicht } from "./sitzung";

// Termine kommen jetzt auch aus Neon. Anlegen und Bearbeiten im Dashboard kommt später.
export async function alleTermine(): Promise<Termin[]> {
  // Wie bei den Nachrichten: Login prüfen, Ladenbesitzer sehen nur ihren Laden
  const angemeldet = await benutzerPflicht();
  const filter =
    angemeldet.rolle === "admin" ? undefined : eq(termine.ladenId, angemeldet.ladenId ?? -1);

  const zeilen = await db
    .select({ termin: termine, kontakt: kontakte })
    .from(termine)
    .innerJoin(kontakte, eq(termine.kontaktId, kontakte.id))
    .where(filter)
    .orderBy(asc(termine.datum));

  return zeilen.map(({ termin, kontakt }) => ({
    id: termin.id,
    auftragsnummer: termin.auftragsnummer,
    // Postgres liefert "2026-10-17", angezeigt wird "17.10.2026"
    datum: termin.datum.split("-").reverse().join("."),
    titel: termin.titel,
    vorname: kontakt.vorname,
    nachname: kontakt.nachname,
    telefon: kontakt.telefon ?? "",
    notiz: termin.notiz ?? undefined,
    erledigt: termin.erledigt,
  }));
}
