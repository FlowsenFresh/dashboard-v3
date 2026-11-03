"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { benutzerPflicht, istLadenInhaber } from "@/app/lib/sitzung";
import {
  mitarbeiterAnlegen,
  mitarbeiterEntfernen,
  passwortNeuSetzen,
  webseiteRechtSetzen,
} from "@/app/lib/team";

// Das Start-Passwort zeigen wir genau einmal. In der Datenbank steht nur der Hash.
export type PasswortStatus = { email?: string; passwort?: string; fehler?: string };

// Nur der Inhaber darf sein Team verwalten. Welcher Laden, steht in der Sitzung,
// nicht im Formular. So kann niemand Logins in einem fremden Laden anlegen.
async function inhaberLaden(): Promise<number | null> {
  const angemeldet = await benutzerPflicht();
  return istLadenInhaber(angemeldet) ? angemeldet.ladenId : null;
}

const neuSchema = z.object({
  email: z.email("Bitte eine gültige E-Mail eingeben.").trim().toLowerCase(),
  name: z.string().trim().max(60, "Der Name ist zu lang."),
  darfWebseite: z.boolean(),
});

export async function mitarbeiterHinzufuegen(
  _vorher: PasswortStatus,
  formData: FormData,
): Promise<PasswortStatus> {
  const ladenId = await inhaberLaden();
  if (ladenId === null) return { fehler: "Das darf nur der Inhaber des Ladens." };

  const ergebnis = neuSchema.safeParse({
    email: formData.get("email") ?? "",
    name: formData.get("name") ?? "",
    darfWebseite: formData.get("darfWebseite") === "on", // Häkchen: "on" oder gar nicht da
  });
  if (!ergebnis.success) return { fehler: ergebnis.error.issues[0].message };

  const { email, name, darfWebseite } = ergebnis.data;
  const angelegt = await mitarbeiterAnlegen(ladenId, { email, name: name || null, darfWebseite });
  if (!angelegt.ok) return { fehler: angelegt.fehler };

  revalidatePath("/team");
  return { email, passwort: angelegt.passwort };
}

export async function neuesPasswort(mitarbeiterId: number): Promise<PasswortStatus> {
  const ladenId = await inhaberLaden();
  if (ladenId === null) return { fehler: "Das darf nur der Inhaber des Ladens." };
  const passwort = await passwortNeuSetzen(ladenId, mitarbeiterId);
  if (!passwort) return { fehler: "Diesen Mitarbeiter gibt es nicht." };
  return { passwort };
}

export async function webseiteRechtUmschalten(mitarbeiterId: number, darf: boolean): Promise<void> {
  const ladenId = await inhaberLaden();
  if (ladenId === null) return;
  await webseiteRechtSetzen(ladenId, mitarbeiterId, darf);
  revalidatePath("/team");
}

export async function entfernen(mitarbeiterId: number): Promise<void> {
  const ladenId = await inhaberLaden();
  if (ladenId === null) return;
  await mitarbeiterEntfernen(ladenId, mitarbeiterId);
  revalidatePath("/team");
}
