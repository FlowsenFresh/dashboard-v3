"use server";

import { revalidatePath } from "next/cache";
import { ladenFinden } from "@/app/lib/laeden";
import { nachrichtSpeichern } from "@/app/lib/nachrichtenSpeicher";
import { kontaktSchema } from "@/app/lib/nachrichtSchema";

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
  const laden = ladenFinden(slug);
  if (!laden) {
    return { ok: false, meldung: "Diesen Laden gibt es nicht." };
  }

  // Nie dem Browser trauen: Zod prüft alle Felder nochmal auf dem Server
  const felder = ["anliegen", "vorname", "nachname", "betreff", "email", "telefon", "inhalt"];
  const werte = Object.fromEntries(felder.map((feld) => [feld, String(formData.get(feld) ?? "")]));
  const ergebnis = kontaktSchema.safeParse(werte);

  if (!ergebnis.success) {
    // Die erste Fehlermeldung reicht für unser kleines Formular
    return { ok: false, meldung: ergebnis.error.issues[0].message, werte };
  }

  const daten = ergebnis.data;
  // Nur Anliegen annehmen, die dieser Laden auch anbietet
  if (!laden.anliegen.includes(daten.anliegen)) {
    return { ok: false, meldung: "Bitte wähle ein Anliegen aus der Liste.", werte };
  }

  // Speichert Kontakt und Nachricht in Neon. Zeit und Status "neu" setzt die Datenbank.
  await nachrichtSpeichern({
    laden: slug,
    ...daten,
    betreff: daten.betreff ?? daten.anliegen, // ohne Betreff nehmen wir das Anliegen
  });

  // Dashboard-Seite neu laden, damit die Nachricht dort sofort auftaucht
  revalidatePath("/nachrichten");

  return { ok: true, meldung: "Danke! Deine Nachricht ist angekommen." };
}
