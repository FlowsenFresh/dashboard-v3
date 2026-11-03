"use server";

import { revalidatePath } from "next/cache";
import { codeErzeugen, zugangBeenden } from "@/app/lib/freigaben";
import { benutzerPflicht, istLadenInhaber } from "@/app/lib/sitzung";
import { uhrzeit } from "@/app/lib/zeit";

export type CodeStatus = { code?: string; gueltigBis?: string; fehler?: string };

// Nur der Ladeninhaber selbst darf einen Code erzeugen oder den Zugang beenden.
// Der admin nicht: sonst könnte er sich den Zugang ja selbst geben.
async function inhaberLaden(): Promise<number | null> {
  const angemeldet = await benutzerPflicht();
  if (!istLadenInhaber(angemeldet)) return null;
  return angemeldet.ladenId;
}

export async function neuerCode(): Promise<CodeStatus> {
  const ladenId = await inhaberLaden();
  if (ladenId === null) return { fehler: "Das darf nur der Inhaber des Ladens." };
  const { code, gueltigBis } = await codeErzeugen(ladenId);
  // Den Code zeigen wir genau einmal. In der Datenbank steht nur sein Hash.
  return { code, gueltigBis: uhrzeit(gueltigBis) };
}

export async function zugangSofortBeenden(): Promise<void> {
  const ladenId = await inhaberLaden();
  if (ladenId === null) return;
  await zugangBeenden(ladenId);
  revalidatePath("/zugang");
}
