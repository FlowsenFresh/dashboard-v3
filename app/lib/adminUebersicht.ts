import "server-only";
import { asc, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "./db";
import { aufrufe, freigaben, laeden, nachrichten } from "./db/schema";
import { benutzerPflicht } from "./sitzung";

export type LadenKarte = {
  id: number;
  slug: string;
  name: string;
  branche: string;
  farbe: string | null;
  // Nur Zahlen, nie Namen oder Inhalte. Die darf der admin auch ohne Code sehen.
  aufrufe30: number; // Aufrufe der Webseite, letzte 30 Tage
  rein30: number; // Nachrichten eingegangen, letzte 30 Tage
  raus30: number; // davon als "beantwortet" markiert
  offen: number; // stehen noch auf "neu"
  zugriffBis: Date | null; // läuft gerade ein Zugang per Code? bis wann
};

// Zählt in einer Unterabfrage pro Laden. "::int", weil Postgres count() als großen Zahlentyp
// zurückgibt, der in JavaScript als Text ankommen würde.
const zahl = (abfrage: ReturnType<typeof sql>) => sql<number>`(${abfrage})::int`;

// Alles für die Startseite im Admin-Bereich. Nur für admin.
// Ein Ladenbesitzer, der /admin aufruft, landet in seinem eigenen Dashboard.
export async function adminUebersicht(): Promise<LadenKarte[]> {
  const angemeldet = await benutzerPflicht();
  if (angemeldet.rolle !== "admin") redirect("/");

  const seit30Tagen = sql`now() - interval '30 days'`;

  const zeilen = await db
    .select({
      id: laeden.id,
      slug: laeden.slug,
      name: laeden.name,
      branche: laeden.branche,
      farbe: laeden.farbe,
      aufrufe30: zahl(
        sql`select coalesce(sum(${aufrufe.anzahl}), 0) from ${aufrufe}
            where ${aufrufe.ladenId} = ${laeden.id} and ${aufrufe.tag} > (${seit30Tagen})::date`,
      ),
      rein30: zahl(
        sql`select count(*) from ${nachrichten}
            where ${nachrichten.ladenId} = ${laeden.id} and ${nachrichten.eingegangenAm} > ${seit30Tagen}`,
      ),
      raus30: zahl(
        sql`select count(*) from ${nachrichten}
            where ${nachrichten.ladenId} = ${laeden.id} and ${nachrichten.eingegangenAm} > ${seit30Tagen}
              and ${nachrichten.status} = 'beantwortet'`,
      ),
      offen: zahl(
        sql`select count(*) from ${nachrichten}
            where ${nachrichten.ladenId} = ${laeden.id} and ${nachrichten.status} = 'neu'`,
      ),
      zugriffBis: sql<string | Date | null>`(
        select max(${freigaben.zugriffBis}) from ${freigaben}
        where ${freigaben.ladenId} = ${laeden.id}
          and ${freigaben.zugriffBis} > now() and ${freigaben.beendetAm} is null
      )`,
    })
    .from(laeden)
    .orderBy(asc(laeden.name));

  return zeilen.map((z) => ({ ...z, zugriffBis: z.zugriffBis ? new Date(z.zugriffBis) : null }));
}
