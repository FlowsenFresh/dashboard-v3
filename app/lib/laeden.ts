import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "./db";
import { laeden } from "./db/schema";

// ── Das Template ──────────────────────────────────────────────────
// Jede Laden-Webseite ist dieselbe Seite (app/laden/[slug]/page.tsx),
// nur mit anderen Daten. Die Daten stehen in der Tabelle "laeden" und werden
// direkt auf der Laden-Seite per Doppelklick bearbeitet (unser kleines CMS).
// Was leer bleibt, wird auf der Seite einfach nicht angezeigt.

export type Leistung = {
  titel: string;
  text: string;
  preis?: string; // freier Text, z. B. "ab 29 €" oder "nach Absprache"
};

export type Oeffnungszeit = {
  tage: string; // "Mo–Fr"
  zeit: string; // "9–18 Uhr" oder "geschlossen"
};

export type UeberUns = {
  text: string;
  fakten: string[]; // kleine Fakten wie "Seit 1998", "Meisterbetrieb"
};

// Alles, was der Ladenbesitzer im Dashboard bearbeiten darf
export type LadenInhalt = {
  name: string;
  branche: string;
  slogan: string;
  beschreibung: string;
  farbe: string | null; // Akzentfarbe, z. B. "#38bdf8". null = unser Türkis-Grün
  titelbild: string | null; // Adresse des Fotos oben (Ladenfront). null = kein Foto
  leistungen: Leistung[];
  ueberUns: UeberUns | null;
  oeffnungszeiten: Oeffnungszeit[];
  hinweisZeiten: string | null; // z. B. "Termine auch außerhalb nach Absprache"
  strasse: string;
  plzOrt: string;
  telefon: string;
  email: string | null;
  anliegen: string[]; // Auswahl im Kontaktformular
};

export type Laden = LadenInhalt & {
  id: number;
  slug: string; // Teil der URL: /laden/radl-huber. Ändert nur der admin.
};

// Welche Spalten wir für die Seite brauchen (nicht z. B. die Aufbewahrungsfrist)
const spalten = {
  id: laeden.id,
  slug: laeden.slug,
  name: laeden.name,
  branche: laeden.branche,
  slogan: laeden.slogan,
  beschreibung: laeden.beschreibung,
  farbe: laeden.farbe,
  titelbild: laeden.titelbild,
  leistungen: laeden.leistungen,
  ueberUns: laeden.ueberUns,
  oeffnungszeiten: laeden.oeffnungszeiten,
  hinweisZeiten: laeden.hinweisZeiten,
  strasse: laeden.strasse,
  plzOrt: laeden.plzOrt,
  telefon: laeden.telefon,
  email: laeden.email,
  anliegen: laeden.anliegen,
};

// Der Name, unter dem die Seite eines Ladens im Cache liegt.
// Speichert jemand im Dashboard, löschen wir genau diesen Eintrag (updateTag).
export function ladenTag(slug: string): string {
  return `laden-${slug}`;
}

// Für die öffentliche Seite. "use cache" = Next.js merkt sich das Ergebnis.
// Die Datenbank wird nicht bei jedem Besucher gefragt, sondern erst wieder nach dem Speichern.
export async function ladenFinden(slug: string): Promise<Laden | null> {
  "use cache";
  cacheTag(ladenTag(slug));

  const [laden] = await db.select(spalten).from(laeden).where(eq(laeden.slug, slug));
  return laden ?? null;
}

// Für das Dashboard: immer frisch, ohne Cache, nach id statt slug
export async function ladenNachId(id: number): Promise<Laden | null> {
  const [laden] = await db.select(spalten).from(laeden).where(eq(laeden.id, id));
  return laden ?? null;
}

export type LadenKurz = { slug: string; name: string; branche: string; farbe: string | null };

// Für die Liste auf der Startseite und generateStaticParams
export async function alleLaeden(): Promise<LadenKurz[]> {
  return db
    .select({ slug: laeden.slug, name: laeden.name, branche: laeden.branche, farbe: laeden.farbe })
    .from(laeden)
    .orderBy(asc(laeden.name));
}
