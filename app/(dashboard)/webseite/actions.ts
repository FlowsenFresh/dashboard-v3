"use server";

import { ladenInhaltSpeichern, type SpeichernStatus } from "@/app/lib/ladenSpeichern";
import { benutzerPflicht, sichtbarerLaden } from "@/app/lib/sitzung";

export type { SpeichernStatus };

// Speichert die Inhalte der Laden-Webseite aus dem Dashboard-Formular. Das Formular schickt
// alles als ein JSON-Text im Feld "daten", weil Listen (Leistungen, Zeiten) so viel einfacher sind.
export async function webseiteSpeichern(
  _vorher: SpeichernStatus,
  formData: FormData,
): Promise<SpeichernStatus> {
  const angemeldet = await benutzerPflicht();

  // Welcher Laden? NICHT aus dem Formular, sondern aus der Sitzung.
  // So kann ein Ladenbesitzer nie die Seite eines anderen Ladens ändern.
  const ladenId = sichtbarerLaden(angemeldet);
  if (ladenId === null) {
    return { ok: false, meldung: "Bitte wähle oben zuerst einen Laden aus." };
  }

  return ladenInhaltSpeichern(ladenId, String(formData.get("daten") ?? ""));
}
