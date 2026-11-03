"use client";
import { useRef, useState, useTransition } from "react";
import { fotoHochladen } from "../actions";
import { useBearbeiten } from "./Kontext";

const MAX_BREITE = 2000; // Pixel. Reicht für große Bildschirme, Handyfotos sind oft 4000 breit
const ZIEL_BYTES = 1.4 * 1024 * 1024; // knapp unter der Grenze auf dem Server (1,5 MB)

// Knopf im Bearbeitungsmodus: Foto wählen (am Handy auch direkt mit der Kamera),
// im Browser verkleinern, hochladen, dann auf der Seite anzeigen.
// Gespeichert wird es erst mit "Speichern" in der Leiste unten.
export default function FotoKnopf({ pfad, slug }: { pfad: string; slug: string }) {
  const bearbeiten = useBearbeiten();
  const eingabe = useRef<HTMLInputElement>(null);
  const [laedtGerade, startTransition] = useTransition();
  const [fehler, setFehler] = useState<string | null>(null);
  if (!bearbeiten) return null;

  const aktuell = bearbeiten.lies(pfad) as string | null;

  function gewaehlt(datei: File | undefined) {
    if (!datei) return;
    setFehler(null);
    startTransition(async () => {
      try {
        const klein = await verkleinern(datei);
        const formData = new FormData();
        formData.set("foto", klein, "foto.jpg");
        const ergebnis = await fotoHochladen(slug, formData);
        if (ergebnis.ok) bearbeiten!.setze(pfad, ergebnis.url);
        else setFehler(ergebnis.meldung);
      } catch {
        setFehler("Das Foto konnte nicht gelesen werden. Bitte ein anderes probieren.");
      }
      // Leeren, damit man dasselbe Foto nochmal wählen kann
      if (eingabe.current) eingabe.current.value = "";
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-base">
      {/* accept="image/*": am Handy bietet das Kamera und Galerie an */}
      <input
        ref={eingabe}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => gewaehlt(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => eingabe.current?.click()}
        disabled={laedtGerade}
        className="knopf-leise bg-hintergrund/80"
      >
        {laedtGerade ? "Lädt hoch …" : aktuell ? "📷 Anderes Foto" : "📷 Foto als Hintergrund"}
      </button>
      {aktuell && !laedtGerade && (
        <button
          type="button"
          onClick={() => bearbeiten.setze(pfad, null)}
          className="knopf-leise bg-hintergrund/80"
        >
          Foto entfernen
        </button>
      )}
      {fehler && <p className="w-full text-center text-sm text-fehler">{fehler}</p>}
    </div>
  );
}

// Verkleinert das Foto im Browser und macht ein JPG daraus. Das hat drei Vorteile:
// 1. schneller Upload, auch mit schlechtem Handynetz
// 2. die Seite lädt schnell
// 3. Datenschutz: beim Neuzeichnen fallen die versteckten Fotodaten (EXIF) weg,
//    also auch der GPS-Ort, an dem das Foto gemacht wurde.
async function verkleinern(datei: File): Promise<Blob> {
  // imageOrientation: Handyfotos stehen sonst manchmal auf dem Kopf oder liegen quer
  const bild = await createImageBitmap(datei, { imageOrientation: "from-image" });
  const faktor = Math.min(1, MAX_BREITE / bild.width);
  const leinwand = document.createElement("canvas");
  leinwand.width = Math.round(bild.width * faktor);
  leinwand.height = Math.round(bild.height * faktor);
  leinwand.getContext("2d")!.drawImage(bild, 0, 0, leinwand.width, leinwand.height);
  bild.close();

  // Erst gute Qualität, und nur wenn es zu groß ist, etwas weniger
  for (const qualitaet of [0.85, 0.75, 0.65, 0.5]) {
    const blob = await new Promise<Blob | null>((fertig) =>
      leinwand.toBlob(fertig, "image/jpeg", qualitaet),
    );
    if (blob && blob.size <= ZIEL_BYTES) return blob;
  }
  throw new Error("Foto zu groß");
}
