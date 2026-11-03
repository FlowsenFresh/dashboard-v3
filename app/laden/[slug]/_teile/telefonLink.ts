// "08171 123456" -> "tel:08171123456". Auf dem Handy öffnet das direkt die Telefon-App.
export function telefonLink(telefon: string): string {
  return `tel:${telefon.replace(/[^\d+]/g, "")}`;
}
