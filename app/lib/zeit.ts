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
