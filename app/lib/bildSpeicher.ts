import "server-only";
import { del, put } from "@vercel/blob";

// ── Bildspeicher ──────────────────────────────────────────────────
// Fotos liegen NICHT in der Datenbank, sondern in Vercel Blob (ein Speicher für Dateien,
// angelegt in Frankfurt, Region fra1). In der Datenbank steht nur die Adresse (URL).
// Warum? Datenbanken sind für Text und Zahlen gebaut. Bilder sind groß, und Blob liefert
// sie über das schnelle Vercel-Netz direkt an den Browser aus.
//
// Damit das klappt, braucht die App den Schlüssel BLOB_READ_WRITE_TOKEN (oder BLOB_STORE_ID,
// je nachdem, was Vercel einträgt, sobald der Blob-Speicher mit dem Projekt verbunden ist).
const eingerichtet = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export const MAX_BILD_BYTES = 1.5 * 1024 * 1024; // der Browser verkleinert vorher, das reicht locker
const ERLAUBTE_TYPEN = ["image/jpeg", "image/png", "image/webp"];

export type HochladenErgebnis = { ok: true; url: string } | { ok: false; meldung: string };

// Ordner pro Laden: laeden/<id>/... So sieht man sofort, welches Bild zu wem gehört,
// und wir können prüfen, dass niemand das Bild eines anderen Ladens einträgt.
function ordner(ladenId: number): string {
  return `laeden/${ladenId}/`;
}

export async function titelbildHochladen(
  ladenId: number,
  datei: unknown,
): Promise<HochladenErgebnis> {
  if (!eingerichtet()) {
    return { ok: false, meldung: "Der Bildspeicher ist noch nicht eingerichtet (siehe docs/12)." };
  }
  // Nie dem Browser trauen: Typ und Größe prüfen wir hier nochmal
  if (!(datei instanceof File) || datei.size === 0) {
    return { ok: false, meldung: "Es ist kein Foto angekommen." };
  }
  if (!ERLAUBTE_TYPEN.includes(datei.type)) {
    return { ok: false, meldung: "Bitte ein Foto als JPG, PNG oder WebP." };
  }
  if (datei.size > MAX_BILD_BYTES) {
    return { ok: false, meldung: "Das Foto ist zu groß." };
  }

  const endung = datei.type.split("/")[1].replace("jpeg", "jpg");
  // addRandomSuffix: jedes neue Foto bekommt eine neue Adresse. Sonst würden Browser
  // und Netz noch lange das alte Foto aus ihrem Zwischenspeicher zeigen.
  const blob = await put(`${ordner(ladenId)}titelbild.${endung}`, datei, {
    access: "public",
    addRandomSuffix: true,
    contentType: datei.type,
  });
  return { ok: true, url: blob.url };
}

// Gehört diese Adresse zu einem Bild, das wir für diesen Laden hochgeladen haben?
export function istBildVonLaden(url: string, ladenId: number): boolean {
  try {
    const adresse = new URL(url);
    return (
      adresse.protocol === "https:" &&
      adresse.hostname.endsWith(".public.blob.vercel-storage.com") &&
      adresse.pathname.startsWith(`/${ordner(ladenId)}`)
    );
  } catch {
    return false;
  }
}

// Altes Foto wegräumen, wenn ein neues gespeichert oder es entfernt wurde.
// Klappt das nicht, ist das kein Drama: Die Seite zeigt es ja nicht mehr.
export async function bildLoeschen(url: string): Promise<void> {
  if (!eingerichtet()) return;
  try {
    await del(url);
  } catch (fehler) {
    console.error("Altes Foto konnte nicht gelöscht werden:", fehler);
  }
}
