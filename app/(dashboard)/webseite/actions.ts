"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "@/app/lib/db";
import { laeden } from "@/app/lib/db/schema";
import { ladenTag } from "@/app/lib/laeden";
import { ladenInhaltSchema } from "@/app/lib/ladenSchema";
import { benutzerPflicht, sichtbarerLaden } from "@/app/lib/sitzung";

export type SpeichernStatus = { ok: boolean; meldung: string };

// Speichert die Inhalte der Laden-Webseite. Das Formular schickt alles als ein
// JSON-Text im Feld "daten", weil Listen (Leistungen, Zeiten) so viel einfacher sind.
export async function webseiteSpeichern(
  _vorher: SpeichernStatus,
  formData: FormData,
): Promise<SpeichernStatus> {
  const angemeldet = await benutzerPflicht();

  // Welcher Laden? NICHT aus dem Formular, sondern aus der Sitzung.
  // So kann ein Ladenbesitzer nie die Seite eines anderen Ladens ändern.
  const ladenId = sichtbarerLaden(angemeldet);
  if (ladenId === null) {
    return { ok: false, meldung: "Bitte wähle oben zuerst einen Laden aus." };
  }

  let roh: unknown;
  try {
    roh = JSON.parse(String(formData.get("daten") ?? ""));
  } catch {
    return { ok: false, meldung: "Die Daten sind kaputt angekommen. Bitte nochmal versuchen." };
  }

  const ergebnis = ladenInhaltSchema.safeParse(roh);
  if (!ergebnis.success) {
    return { ok: false, meldung: ergebnis.error.issues[0].message };
  }

  const [gespeichert] = await db
    .update(laeden)
    .set(ergebnis.data)
    .where(eq(laeden.id, ladenId))
    .returning({ slug: laeden.slug });
  if (!gespeichert) return { ok: false, meldung: "Diesen Laden gibt es nicht mehr." };

  // Den Cache der öffentlichen Seite löschen. Der nächste Besucher sieht sofort den neuen Stand.
  updateTag(ladenTag(gespeichert.slug));

  return { ok: true, meldung: "Gespeichert. Die Webseite ist schon aktuell." };
}
