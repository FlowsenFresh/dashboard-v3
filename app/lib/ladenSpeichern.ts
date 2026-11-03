import "server-only";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { bildLoeschen, istBildVonLaden } from "./bildSpeicher";
import { db } from "./db";
import { laeden } from "./db/schema";
import { ladenTag } from "./laeden";
import { ladenInhaltSchema } from "./ladenSchema";

export type SpeichernStatus = { ok: boolean; meldung: string };

// Speichert die Inhalte aus dem Bearbeitungsmodus (Doppelklick auf der Laden-Seite).
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

  // Das Foto muss aus dem Ordner DIESES Ladens kommen (siehe bildSpeicher.ts)
  const neuesBild = ergebnis.data.titelbild;
  if (neuesBild && !istBildVonLaden(neuesBild, ladenId)) {
    return { ok: false, meldung: "Dieses Foto gehört nicht zu deinem Laden." };
  }

  // Altes Foto merken, damit wir es nach dem Speichern aufräumen können
  const [vorher] = await db
    .select({ titelbild: laeden.titelbild })
    .from(laeden)
    .where(eq(laeden.id, ladenId));
  if (!vorher) return { ok: false, meldung: "Diesen Laden gibt es nicht mehr." };

  const [gespeichert] = await db
    .update(laeden)
    .set(ergebnis.data)
    .where(eq(laeden.id, ladenId))
    .returning({ slug: laeden.slug });
  if (!gespeichert) return { ok: false, meldung: "Diesen Laden gibt es nicht mehr." };

  // Neues Foto oder Foto entfernt: das alte aus dem Bildspeicher löschen.
  // undefined heißt "Feld nicht mitgeschickt", dann bleibt alles, wie es war.
  if (neuesBild !== undefined && vorher.titelbild && vorher.titelbild !== neuesBild) {
    if (istBildVonLaden(vorher.titelbild, ladenId)) await bildLoeschen(vorher.titelbild);
  }

  // Den Cache der öffentlichen Seite löschen. Der nächste Besucher sieht sofort den neuen Stand.
  updateTag(ladenTag(gespeichert.slug));

  return { ok: true, meldung: "Gespeichert. Die Webseite ist schon aktuell." };
}
