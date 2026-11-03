"use client";
import { useState } from "react";
import { useBearbeiten } from "./Kontext";

type Props = {
  pfad: string; // welches Feld, z. B. "slogan" oder "leistungen.0.preis"
  wert: string;
  mehrzeilig?: boolean; // Textfeld statt einzeiliger Eingabe
  platzhalter?: string; // was man sieht, wenn das Feld leer ist
};

// Ein Text auf der Laden-Seite. Normal einfach Text.
// Im Bearbeitungsmodus: gestrichelter Rahmen, Doppelklick macht daraus ein Eingabefeld.
// Enter oder Klick daneben übernimmt, Escape bricht ab.
export default function Bearbeitbar({ pfad, wert, mehrzeilig, platzhalter }: Props) {
  const bearbeiten = useBearbeiten();
  const [offen, setOffen] = useState(false);
  const [entwurf, setEntwurf] = useState(wert);

  if (!bearbeiten) return <>{wert}</>;

  if (offen) {
    const uebernehmen = () => {
      bearbeiten.setze(pfad, entwurf.trim());
      setOffen(false);
    };
    const gemeinsam = {
      value: entwurf,
      autoFocus: true,
      onChange: (e: { target: { value: string } }) => setEntwurf(e.target.value),
      onBlur: uebernehmen,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Escape") setOffen(false);
        // Bei mehrzeiligen Feldern macht Enter eine neue Zeile, Strg+Enter übernimmt
        if (e.key === "Enter" && (!mehrzeilig || e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          uebernehmen();
        }
      },
      placeholder: platzhalter,
      className: "eingabe text-left font-normal tracking-normal",
    };
    return mehrzeilig ? <textarea rows={4} {...gemeinsam} /> : <input {...gemeinsam} />;
  }

  return (
    <span
      onDoubleClick={() => {
        setEntwurf(wert);
        setOffen(true);
      }}
      title="Doppelklick zum Bearbeiten"
      className="cursor-text rounded-md outline-1 outline-offset-4 outline-akzent/40 outline-dashed transition hover:bg-akzent/10 hover:outline-akzent"
    >
      {wert || (
        <span className="italic text-gedaempft">{platzhalter ?? "Doppelklick zum Ausfüllen"}</span>
      )}
    </span>
  );
}
