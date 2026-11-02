"use server";

import { revalidatePath } from "next/cache";
import { ladenFinden } from "../../lib/laeden";
import { nachrichtSpeichern } from "../../lib/nachrichtenSpeicher";

export type FormularStatus = {
  ok: boolean;
  meldung: string;
};

// Läuft auf dem Server. Der Browser schickt nur die Formulardaten.
export async function nachrichtSenden(
  slug: string,
  _vorher: FormularStatus,
  formData: FormData,
): Promise<FormularStatus> {
  // Nie dem Browser trauen: alles hier nochmal prüfen
  const text = (feld: string) => String(formData.get(feld) ?? "").trim();

  const vorname = text("vorname");
  const nachname = text("nachname");
  const email = text("email");
  const telefon = text("telefon");
  const betreff = text("betreff");
  const inhalt = text("inhalt");

  if (!ladenFinden(slug)) {
    return { ok: false, meldung: "Diesen Laden gibt es nicht." };
  }
  if (!vorname || !nachname || !betreff) {
    return { ok: false, meldung: "Bitte Vorname, Nachname und Betreff ausfüllen." };
  }
  if (!email && !telefon) {
    return { ok: false, meldung: "Bitte E-Mail oder Telefon angeben, damit wir antworten können." };
  }
  if (inhalt.length > 2000) {
    return { ok: false, meldung: "Die Nachricht ist zu lang (max. 2000 Zeichen)." };
  }

  await nachrichtSpeichern({
    laden: slug,
    vorname,
    nachname,
    betreff,
    email: email || undefined,
    telefon: telefon || undefined,
    inhalt: inhalt || undefined,
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
