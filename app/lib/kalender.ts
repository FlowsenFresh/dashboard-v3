// Reine Rechen-Hilfen für den Monatskalender. Keine Datenbank, darum leicht zu verstehen.
// Ein Tag ist bei uns immer ein Text wie "2026-11-03" (Jahr-Monat-Tag).
// So kann man Tage einfach vergleichen und sortieren, ganz ohne Zeitzonen-Ärger.

export const WOCHENTAGE_KURZ = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const zweistellig = (zahl: number) => String(zahl).padStart(2, "0");

export function tagText(jahr: number, monat: number, tag: number): string {
  return `${jahr}-${zweistellig(monat)}-${zweistellig(tag)}`;
}

// "2026-11-03" -> { jahr: 2026, monat: 11, tag: 3 }. Unsinn wird null.
export function tagLesen(text: unknown): { jahr: number; monat: number; tag: number } | null {
  if (typeof text !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const [jahr, monat, tag] = text.split("-").map(Number);
  if (monat < 1 || monat > 12 || tag < 1 || tag > tageImMonat(jahr, monat)) return null;
  return { jahr, monat, tag };
}

// Tag 0 vom nächsten Monat = letzter Tag von diesem Monat. Klappt auch mit Schaltjahren.
export function tageImMonat(jahr: number, monat: number): number {
  return new Date(Date.UTC(jahr, monat, 0)).getUTCDate();
}

// Wie viele leere Kästchen kommen vor dem 1.? Unsere Woche beginnt am Montag.
// getUTCDay() zählt ab Sonntag (0), darum schieben wir um 6 weiter.
export function leereFelderVorne(jahr: number, monat: number): number {
  return (new Date(Date.UTC(jahr, monat - 1, 1)).getUTCDay() + 6) % 7;
}

// Für die Pfeile < und >: der 1. des Monats davor bzw. danach
export function monatVerschieben(jahr: number, monat: number, um: number): string {
  const ziel = new Date(Date.UTC(jahr, monat - 1 + um, 1));
  return tagText(ziel.getUTCFullYear(), ziel.getUTCMonth() + 1, 1);
}

export function monatsName(jahr: number, monat: number): string {
  return new Date(Date.UTC(jahr, monat - 1, 1)).toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// "2026-11-03" -> "Dienstag, 3. November 2026"
export function langesDatum(text: string): string {
  const [jahr, monat, tag] = text.split("-").map(Number);
  return new Date(Date.UTC(jahr, monat - 1, tag)).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
