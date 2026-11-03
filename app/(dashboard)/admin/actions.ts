"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/app/lib/db";
import { laeden } from "@/app/lib/db/schema";
import { ansichtSetzen, benutzerPflicht } from "@/app/lib/sitzung";

// admin wählt oben in der Kopfzeile, welchen Laden er sieht. "" = alle Läden.
export async function ladenWechseln(formData: FormData): Promise<void> {
  const angemeldet = await benutzerPflicht();
  // Wichtig: nicht dem Formular glauben, dass hier ein admin klickt. Selbst prüfen.
  if (angemeldet.rolle !== "admin") return;

  const wahl = z.coerce.number().int().positive().safeParse(formData.get("laden"));
  let ladenId: number | null = null;
  if (wahl.success) {
    // Gibt es den Laden wirklich?
    const [laden] = await db.select({ id: laeden.id }).from(laeden).where(eq(laeden.id, wahl.data));
    ladenId = laden?.id ?? null;
  }

  await ansichtSetzen(angemeldet, ladenId);
  // Alle Seiten neu rendern, damit Termine und Nachrichten zum neuen Laden passen
  revalidatePath("/", "layout");
}
