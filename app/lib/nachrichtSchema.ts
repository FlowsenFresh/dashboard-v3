import { z } from "zod";

// Zod beschreibt, wie gültige Daten aussehen. safeParse() prüft dann echte Daten
// dagegen und sagt uns entweder "passt" (mit sauberen Daten) oder was falsch ist.

// Leere Felder aus dem Formular ("") machen wir zu undefined, also "nicht angegeben"
const optionalerText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((wert) => wert || undefined);

export const kontaktSchema = z
  .object({
    vorname: z.string().trim().min(1, "Bitte Vorname ausfüllen.").max(50),
    nachname: z.string().trim().min(1, "Bitte Nachname ausfüllen.").max(50),
    betreff: z.string().trim().min(1, "Bitte Betreff ausfüllen.").max(100),
    email: z
      .union([z.literal(""), z.email("Die E-Mail-Adresse sieht nicht richtig aus.")])
      .transform((wert) => wert || undefined),
    telefon: optionalerText(30),
    inhalt: z
      .string()
      .trim()
      .max(2000, "Die Nachricht ist zu lang (max. 2000 Zeichen).")
      .transform((wert) => wert || undefined),
  })
  .refine((daten) => daten.email || daten.telefon, {
    message: "Bitte E-Mail oder Telefon angeben, damit wir antworten können.",
  });

export const statusSchema = z.enum(["neu", "gelesen", "beantwortet"]);
