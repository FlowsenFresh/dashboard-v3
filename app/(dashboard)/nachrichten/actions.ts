"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { nachrichtStatusSetzen } from "@/app/lib/nachrichtenSpeicher";
import { statusSchema } from "@/app/lib/nachrichtSchema";

// Speichert den neuen Status auf dem Server, damit er nach dem Neuladen noch da ist
export async function statusAendern(
  id: number,
  status: z.infer<typeof statusSchema>,
): Promise<void> {
  // Auch hier nicht blind vertrauen: nur eine echte Zahl und bekannte Status annehmen
  const ergebnis = z
    .object({ id: z.number().int(), status: statusSchema })
    .safeParse({ id, status });
  if (!ergebnis.success) return;
  await nachrichtStatusSetzen(ergebnis.data.id, ergebnis.data.status);
  revalidatePath("/nachrichten");
}
