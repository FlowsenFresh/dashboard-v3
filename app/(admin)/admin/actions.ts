"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/app/lib/db";
import { laeden } from "@/app/lib/db/schema";
import { codeEinloesen, laufenderZugriff } from "@/app/lib/freigaben";
import { ansichtSetzen, benutzerPflicht } from "@/app/lib/sitzung";

export type OeffnenStatus = { fehler?: string };

// Vom Admin-Bereich ins Kunden-Dashboard eines Ladens gehen.
// Das geht nur mit dem Code, den der Ladeninhaber erzeugt hat (oder solange ein Zugang noch läuft).
export async function ladenOeffnen(
  ladenId: number,
  _vorher: OeffnenStatus,
  formData: FormData,
): Promise<OeffnenStatus> {
  const angemeldet = await benutzerPflicht();
  // Wichtig: nicht dem Formular glauben, dass hier ein admin klickt. Selbst prüfen.
  if (angemeldet.rolle !== "admin") return { fehler: "Nur für admin." };

  const [laden] = await db.select({ id: laeden.id }).from(laeden).where(eq(laeden.id, ladenId));
  if (!laden) return { fehler: "Diesen Laden gibt es nicht." };

  // Läuft schon ein Zugang? Dann braucht es keinen neuen Code.
  if (!(await laufenderZugriff(laden.id))) {
    const ergebnis = await codeEinloesen(laden.id, String(formData.get("code") ?? ""));
    if (!ergebnis.ok) return { fehler: ergebnis.fehler };
  }

  await ansichtSetzen(angemeldet, laden.id);
  redirect("/");
}

// Aus dem Kunden-Dashboard zurück in den Admin-Bereich.
// Der Zugang selbst läuft weiter, bis er abläuft oder der Inhaber ihn beendet.
export async function zurueckZumAdmin(): Promise<void> {
  const angemeldet = await benutzerPflicht();
  if (angemeldet.rolle !== "admin") return;
  await ansichtSetzen(angemeldet, null);
  redirect("/admin");
}
