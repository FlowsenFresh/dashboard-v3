"use server";

import { revalidatePath } from "next/cache";
import { ladenFinden } from "@/app/lib/laeden";
import { nachrichtSpeichern } from "@/app/lib/nachrichtenSpeicher";
import { kontaktSchema } from "@/app/lib/nachrichtSchema";
import { ladenInhaltSpeichern, type SpeichernStatus } from "@/app/lib/ladenSpeichern";
import { aktuellerBenutzer, darfLadenBearbeiten } from "@/app/lib/sitzung";

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
  const laden = await ladenFinden(slug);
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

// Bearbeitungsmodus direkt auf der Laden-Seite: speichert alles, was per Doppelklick geändert wurde.
export async function seiteSpeichern(slug: string, daten: string): Promise<SpeichernStatus> {
  // Die Prüfung passiert hier auf dem Server. Dass der Knopf nur für Berechtigte
  // sichtbar ist, reicht nicht: jeder könnte diese Action auch von Hand aufrufen.
  const angemeldet = await aktuellerBenutzer();
  if (!angemeldet) return { ok: false, meldung: "Bitte melde dich erst an." };

  const laden = await ladenFinden(slug);
  if (!laden || !darfLadenBearbeiten(angemeldet, laden.id)) {
    return { ok: false, meldung: "Diese Seite darfst du nicht bearbeiten." };
  }

  return ladenInhaltSpeichern(laden.id, daten);
}
