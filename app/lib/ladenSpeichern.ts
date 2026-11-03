import "server-only";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "./db";
import { laeden } from "./db/schema";
import { ladenTag } from "./laeden";
import { ladenInhaltSchema } from "./ladenSchema";

export type SpeichernStatus = { ok: boolean; meldung: string };

// Gemeinsamer Teil fürs Speichern, egal ob aus dem Dashboard (/webseite)
// oder direkt auf der Laden-Seite (Bearbeitungsmodus).
// WICHTIG: Wer das aufruft, hat vorher geprüft, dass die Person diesen Laden ändern darf.
export async function ladenInhaltSpeichern(
  ladenId: number,
  json: string,
): Promise<SpeichernStatus> {
  let roh: unknown;
  try {
    roh = JSON.parse(json);
  } catch {
    return { ok: false, meldung: "Die Daten sind kaputt angekommen. Bitte nochmal versuchen." };
  }

  // Zod prüft alles nochmal auf dem Server: Längen, E-Mail, echte Farbcodes
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
