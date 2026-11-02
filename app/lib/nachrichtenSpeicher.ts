import "server-only";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { beispielNachrichten, type Nachricht } from "./nachrichten";

// Übergangslösung: Nachrichten liegen in einer JSON-Datei.
// Wenn die Datenbank (Neon) kommt, ändern wir NUR diese Datei.
// Seiten und Actions rufen weiter alleNachrichten() / nachrichtSpeichern() auf.
const ordner = path.join(process.cwd(), "daten");
const datei = path.join(ordner, "nachrichten.json");

export async function alleNachrichten(): Promise<Nachricht[]> {
  try {
    const text = await readFile(datei, "utf-8");
    return JSON.parse(text) as Nachricht[];
  } catch {
    // Datei gibt es noch nicht: mit den Beispielen starten
    return beispielNachrichten;
  }
}

export async function nachrichtSpeichern(neu: Omit<Nachricht, "id">): Promise<void> {
  const nachrichten = await alleNachrichten();
  const id = Math.max(0, ...nachrichten.map((n) => n.id)) + 1;
  nachrichten.unshift({ id, ...neu }); // neueste zuerst
  await mkdir(ordner, { recursive: true });
  await writeFile(datei, JSON.stringify(nachrichten, null, 2));
}

export async function nachrichtStatusSetzen(
  id: number,
  status: Nachricht["status"],
): Promise<void> {
  const nachrichten = await alleNachrichten();
  const nachricht = nachrichten.find((n) => n.id === id);
  if (!nachricht) return;
  nachricht.status = status;
  await mkdir(ordner, { recursive: true });
  await writeFile(datei, JSON.stringify(nachrichten, null, 2));
}
