"use client";
import { useEffect, useState, useTransition } from "react";
import { seiteSpeichern } from "../actions";
import { useModus } from "./Kontext";

const STANDARD_FARBE = "#10b981"; // unser Türkis-Grün, wie in globals.css

// Die Leiste unten auf der Laden-Seite. Nur wer bearbeiten darf, bekommt sie überhaupt
// (das entscheidet BearbeitenLeiste.tsx auf dem Server).
export default function Leiste({ slug }: { slug: string }) {
  const modus = useModus();
  const [speichertGerade, startTransition] = useTransition();
  const [meldung, setMeldung] = useState<{ ok: boolean; text: string } | null>(null);

  // Kommt man über "Webseite" im Dashboard (/laden/<slug>?bearbeiten), ist Bearbeiten gleich an.
  // Danach nehmen wir ?bearbeiten wieder aus der Adresse, sonst startet es beim Neuladen wieder.
  const starten = modus?.starten;
  useEffect(() => {
    const adresse = new URL(window.location.href);
    if (!starten || !adresse.searchParams.has("bearbeiten")) return;
    starten();
    adresse.searchParams.delete("bearbeiten");
    window.history.replaceState(null, "", adresse);
  }, [starten]);

  if (!modus) return null;

  if (!modus.an) {
    return (
      <div className="fixed bottom-5 left-1/2 z-20 -translate-x-1/2">
        <button
          type="button"
          onClick={() => {
            setMeldung(null);
            modus.starten();
          }}
          className="knopf-gross shadow-lg shadow-black/40"
        >
          ✎ Seite bearbeiten
        </button>
        {meldung && (
          <p className="mt-2 rounded-lg bg-hintergrund/90 px-3 py-1 text-center text-sm text-erfolg">
            {meldung.text}
          </p>
        )}
      </div>
    );
  }

  const farbe = modus.inhalt?.farbe ?? null;

  function speichern() {
    startTransition(async () => {
      const ergebnis = await seiteSpeichern(slug, JSON.stringify(modus!.inhalt));
      setMeldung({ ok: ergebnis.ok, text: ergebnis.meldung });
      // Bei Erfolg zurück zur normalen Seite. Der Server schickt sie schon mit den neuen Daten.
      if (ergebnis.ok) modus!.beenden();
    });
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-rand bg-hintergrund/95 text-base backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
        <p className="mr-auto text-gedaempft">
          <span className="font-medium text-schrift">Bearbeiten an.</span> Doppelklick auf einen
          Text, um ihn zu ändern.
        </p>

        <label className="flex items-center gap-2 text-sm text-gedaempft">
          Farbe
          <input
            type="color"
            value={farbe ?? STANDARD_FARBE}
            onChange={(e) => modus.setze("farbe", e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border border-rand bg-hintergrund"
          />
        </label>
        {farbe && (
          <button
            type="button"
            onClick={() => modus.setze("farbe", null)}
            className="text-sm text-gedaempft underline-offset-4 hover:text-schrift hover:underline"
          >
            Standardfarbe
          </button>
        )}

        {meldung && !meldung.ok && <p className="text-sm text-fehler">{meldung.text}</p>}

        <button type="button" onClick={modus.beenden} className="knopf-rand">
          Verwerfen
        </button>
        <button type="button" onClick={speichern} disabled={speichertGerade} className="knopf">
          {speichertGerade ? "Speichert …" : "Speichern"}
        </button>
      </div>
    </div>
  );
}
