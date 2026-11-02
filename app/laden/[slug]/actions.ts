"use server";

import { revalidatePath } from "next/cache";
import { ladenFinden } from "../../lib/laeden";
import { nachrichtSpeichern } from "../../lib/nachrichtenSpeicher";
import { kontaktSchema } from "../../lib/nachrichtSchema";

export type FormularStatus = {
  ok: boolean;
  meldung: string;
  // Was eingetippt wurde. React leert das Formular nach dem Absenden,
  // bei einem Fehler füllen wir es damit wieder auf.
  werte?: Record<string, string>;
};

// Läuft auf dem Server. Der Browser schickt nur die Formulardaten.
export async function nachrichtSenden(
  slug: string,
  _vorher: FormularStatus,
  formData: FormData,
): Promise<FormularStatus> {
  if (!ladenFinden(slug)) {
    return { ok: false, meldung: "Diesen Laden gibt es nicht." };
  }

  // Nie dem Browser trauen: Zod prüft alle Felder nochmal auf dem Server
  const felder = ["vorname", "nachname", "betreff", "email", "telefon", "inhalt"];
  const werte = Object.fromEntries(felder.map((feld) => [feld, String(formData.get(feld) ?? "")]));
  const ergebnis = kontaktSchema.safeParse(werte);

  if (!ergebnis.success) {
    // Die erste Fehlermeldung reicht für unser kleines Formular
    return { ok: false, meldung: ergebnis.error.issues[0].message, werte };
  }

  await nachrichtSpeichern({
    laden: slug,
    ...ergebnis.data,
    eingegangen:
      new Date().toLocaleString("de-DE", {
        timeZone: "Europe/Berlin",
        dateStyle: "medium",
        timeStyle: "short",
      }) + " Uhr",
    status: "neu",
  });

  // Dashboard-Seite neu laden, damit die Nachricht dort sofort auftaucht
  revalidatePath("/nachrichten");

  return { ok: true, meldung: "Danke! Deine Nachricht ist angekommen." };
}
