"use server";

import { ladenInhaltSpeichern, type SpeichernStatus } from "@/app/lib/ladenSpeichern";
import { benutzerPflicht, darfWebseiteBearbeiten, sichtbarerLaden } from "@/app/lib/sitzung";

export type { SpeichernStatus };

// Speichert die Inhalte der Laden-Webseite aus dem Dashboard-Formular. Das Formular schickt
// alles als ein JSON-Text im Feld "daten", weil Listen (Leistungen, Zeiten) so viel einfacher sind.
export async function webseiteSpeichern(
  _vorher: SpeichernStatus,
  formData: FormData,
): Promise<SpeichernStatus> {
  const angemeldet = await benutzerPflicht();
  // Mitarbeiter nur, wenn der Inhaber es unter /team erlaubt hat. Hier auf dem Server prüfen,
  // nicht nur den Menüpunkt verstecken: die Action kann man auch von Hand aufrufen.
  if (!darfWebseiteBearbeiten(angemeldet)) {
    return { ok: false, meldung: "Du darfst die Webseite nicht bearbeiten. Frag den Inhaber." };
  }

  // Welcher Laden? NICHT aus dem Formular, sondern aus der Sitzung.
  // So kann ein Ladenbesitzer nie die Seite eines anderen Ladens ändern.
  const ladenId = sichtbarerLaden(angemeldet);
  if (ladenId === -1) {
    return {
      ok: false,
      meldung: "Kein Zugang zu einem Laden. Bitte über den Admin-Bereich öffnen.",
    };
  }

  return ladenInhaltSpeichern(ladenId, String(formData.get("daten") ?? ""));
}
