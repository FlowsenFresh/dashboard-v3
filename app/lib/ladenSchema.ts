import { z } from "zod";

// Prüft alles, was im Dashboard unter /webseite gespeichert wird.
// Wie beim Kontaktformular: nie dem Browser trauen, der Server prüft nochmal.

const text = (max: number) => z.string().trim().max(max, `Höchstens ${max} Zeichen.`);
// Leer ("") wird zu null, also "nicht angegeben"
const optional = (max: number) => text(max).transform((wert) => wert || null);

export const ladenInhaltSchema = z.object({
  name: text(80).min(1, "Bitte einen Namen eintragen."),
  branche: text(60),
  slogan: text(120),
  beschreibung: text(500),
  // Nur echte Farbcodes wie #38bdf8, sonst könnte jemand beliebiges CSS einschleusen
  farbe: z
    .union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/, "Farbe sieht nicht richtig aus.")])
    .nullable()
    .transform((wert) => wert || null),
  // Nur Adressen aus unserem eigenen Bildspeicher, keine fremden Bilder von irgendwo.
  // Dass das Bild auch zu DIESEM Laden gehört, prüft ladenInhaltSpeichern.
  // Fehlt das Feld ganz (undefined), lassen wir das Foto in der Datenbank, wie es ist.
  titelbild: z
    .union([
      z.literal(""),
      z.url({
        protocol: /^https$/,
        hostname: /\.public\.blob\.vercel-storage\.com$/,
        error: "Das Foto kommt nicht aus unserem Bildspeicher.",
      }),
    ])
    .nullish()
    .transform((wert) => (wert === undefined ? undefined : wert || null)),
  leistungen: z
    .array(
      z.object({
        titel: text(60),
        text: text(300),
        preis: text(40)
          .optional()
          .transform((wert) => wert || undefined),
      }),
    )
    .max(12, "Höchstens 12 Leistungen.")
    // Leere Zeilen (ohne Titel) einfach weglassen
    .transform((liste) => liste.filter((l) => l.titel)),
  ueberUns: z
    .object({ text: text(800), fakten: z.array(text(40)).max(6).default([]) })
    .nullable()
    .transform((wert) => {
      if (!wert || !wert.text) return null; // ohne Text kein Abschnitt
      return { text: wert.text, fakten: wert.fakten.filter(Boolean) };
    }),
  oeffnungszeiten: z
    .array(z.object({ tage: text(30), zeit: text(40) }))
    .max(10)
    .transform((liste) => liste.filter((z) => z.tage)),
  hinweisZeiten: optional(200).nullable(),
  strasse: text(100),
  plzOrt: text(100),
  telefon: text(30),
  email: z
    .union([z.literal(""), z.email("Die E-Mail-Adresse sieht nicht richtig aus.")])
    .nullable()
    .transform((wert) => wert || null),
  anliegen: z
    .array(text(40))
    .max(10, "Höchstens 10 Anliegen.")
    .transform((liste) => liste.filter(Boolean))
    .refine((liste) => liste.length > 0, "Bitte mindestens ein Anliegen fürs Kontaktformular."),
});
