"use server";

import { revalidatePath } from "next/cache";
import type { Nachricht } from "../lib/nachrichten";
import { nachrichtStatusSetzen } from "../lib/nachrichtenSpeicher";

const erlaubteStatus: Nachricht["status"][] = ["neu", "gelesen", "beantwortet"];

// Speichert den neuen Status auf dem Server, damit er nach dem Neuladen noch da ist
export async function statusAendern(id: number, status: Nachricht["status"]): Promise<void> {
  // Auch hier nicht blind vertrauen: nur bekannte Status annehmen
  if (!erlaubteStatus.includes(status)) return;
  await nachrichtStatusSetzen(id, status);
  revalidatePath("/nachrichten");
}
