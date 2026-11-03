"use client";
import { useState, type ReactNode } from "react";
import type { Laden } from "@/app/lib/laeden";
import Seite from "../_teile/Seite";
import {
  BearbeitenKontext,
  ModusKontext,
  liesPfad,
  setzePfad,
  type Bearbeiten,
  type Modus,
} from "./Kontext";

// Hält den Bearbeitungsmodus für die ganze Laden-Seite.
// - aus: zeigt die normale Seite vom Server (seite), so wie jeder Besucher sie sieht
// - an:  zeigt dieselbe Seite mit den gerade geänderten Daten, jeder Text per Doppelklick änderbar
// leiste: die Leiste unten. Sie kommt vom Server und ist nur für Berechtigte gefüllt.

type Props = { laden: Laden; seite: ReactNode; leiste: ReactNode };

export default function Rahmen({ laden, seite, leiste }: Props) {
  const [inhalt, setInhalt] = useState<Laden | null>(null); // null = Bearbeiten ist aus

  const setze = (pfad: string, wert: unknown) =>
    setInhalt((alt) => alt && setzePfad(alt, pfad, wert));

  const modus: Modus = {
    an: inhalt !== null,
    starten: () => setInhalt(laden), // mit dem aktuellen Stand vom Server anfangen
    beenden: () => setInhalt(null),
    inhalt,
    setze,
  };

  const bearbeiten: Bearbeiten | null = inhalt && {
    inhalt,
    setze,
    lies: (pfad) => liesPfad(inhalt, pfad),
  };

  return (
    <ModusKontext.Provider value={modus}>
      {bearbeiten && inhalt ? (
        <BearbeitenKontext.Provider value={bearbeiten}>
          {/* Links sollen beim Bearbeiten nicht wegspringen, ein Doppelklick fängt ja mit einem Klick an */}
          <div
            className="flex flex-1 flex-col"
            onClickCapture={(e) => {
              if ((e.target as HTMLElement).closest("a")) e.preventDefault();
            }}
          >
            <Seite laden={inhalt} bearbeiten />
          </div>
        </BearbeitenKontext.Provider>
      ) : (
        seite
      )}
      {leiste}
    </ModusKontext.Provider>
  );
}
