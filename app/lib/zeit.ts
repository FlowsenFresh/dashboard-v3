// Uhrzeit und Datum immer nach deutscher Zeit anzeigen, egal wo der Server steht
export function uhrzeit(zeit: Date): string {
  return zeit.toLocaleTimeString("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function datumUndUhrzeit(zeit: Date): string {
  return (
    zeit.toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
      dateStyle: "medium",
      timeStyle: "short",
    }) + " Uhr"
  );
}

// Der Kalender-Tag nach deutscher Zeit als "2026-11-03".
// Eine Nachricht um 00:30 Uhr in Deutschland ist in UTC noch der Vortag,
// darum rechnen wir nicht mit toISOString, sondern mit der Zeitzone Berlin.
// "sv-SE" (Schwedisch) schreibt Datumsangaben zufällig genau so: Jahr-Monat-Tag.
export function tagInBerlin(zeit: Date): string {
  return zeit.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}
