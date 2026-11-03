"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/app/lib/db";
import { benutzer } from "@/app/lib/db/schema";
import { passwortHashen, passwortPruefen } from "@/app/lib/passwort";
import { sitzungBeenden, sitzungStarten } from "@/app/lib/sitzung";

export type LoginStatus = { fehler?: string; email?: string };

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  passwort: z.string().min(1).max(200),
  weiter: z.string(),
});

// Ein Hash, der zu keinem Passwort passt. Gibt es die E-Mail nicht, prüfen wir trotzdem
// gegen diesen, damit die Antwort gleich lang dauert. Sonst könnte man an der Zeit ablesen,
// welche E-Mail-Adressen es gibt.
const ersatzHash = passwortHashen("kein-echtes-passwort");

export async function anmelden(_vorher: LoginStatus, formData: FormData): Promise<LoginStatus> {
  const ergebnis = loginSchema.safeParse({
    email: formData.get("email"),
    passwort: formData.get("passwort"),
    weiter: formData.get("weiter") ?? "/",
  });
  const email = String(formData.get("email") ?? "");
  if (!ergebnis.success) return { fehler: "Bitte E-Mail und Passwort eingeben.", email };

  const daten = ergebnis.data;
  const [gefunden] = await db.select().from(benutzer).where(eq(benutzer.email, daten.email));
  const passt = await passwortPruefen(daten.passwort, gefunden?.passwortHash ?? (await ersatzHash));

  // Immer dieselbe Meldung, egal ob E-Mail oder Passwort falsch war
  if (!gefunden || !passt) return { fehler: "E-Mail oder Passwort stimmt nicht.", email };

  await sitzungStarten(gefunden.id);

  // Nur Pfade in unserer eigenen App erlauben ("/nachrichten"), keine fremden Seiten
  // ("//boese.de" oder "https://..."). Sonst könnte jemand einen Login-Link bauen,
  // der nach dem Anmelden auf eine falsche Seite weiterleitet.
  const ziel = daten.weiter.startsWith("/") && !daten.weiter.startsWith("//") ? daten.weiter : "/";
  redirect(ziel);
}

export async function abmelden(): Promise<void> {
  await sitzungBeenden();
  redirect("/login");
}
