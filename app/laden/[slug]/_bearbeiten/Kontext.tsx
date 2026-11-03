"use client";
import { createContext, useContext } from "react";
import type { LadenInhalt } from "@/app/lib/laeden";

// Der "Kontext" ist wie eine unsichtbare Leitung: Alle Bausteine darunter können
// den Bearbeitungsmodus abfragen, ohne dass man ihn durch jede Datei durchreichen muss.

export type Bearbeiten = {
  inhalt: LadenInhalt;
  // pfad wie "slogan", "leistungen.2.titel" oder "ueberUns.fakten"
  setze: (pfad: string, wert: unknown) => void;
  lies: (pfad: string) => unknown;
};

export const BearbeitenKontext = createContext<Bearbeiten | null>(null);

// null = nicht im Bearbeitungsmodus (normale Besucher sehen nie etwas davon)
export function useBearbeiten(): Bearbeiten | null {
  return useContext(BearbeitenKontext);
}

// Liest einen Wert über einen Pfad: lies(inhalt, "leistungen.0.titel")
export function liesPfad(objekt: unknown, pfad: string): unknown {
  return pfad
    .split(".")
    .reduce<unknown>((wert, teil) => (wert as Record<string, unknown> | null)?.[teil], objekt);
}

// Setzt einen Wert über einen Pfad und gibt ein NEUES Objekt zurück.
// React merkt Änderungen nur, wenn ein neues Objekt kommt, darum kopieren wir auf dem Weg.
export function setzePfad<T>(objekt: T, pfad: string, wert: unknown): T {
  const [kopf, ...rest] = pfad.split(".");
  const alt = (objekt ?? {}) as Record<string, unknown>;
  const neu = rest.length === 0 ? wert : setzePfad(alt[kopf], rest.join("."), wert);
  if (Array.isArray(alt)) {
    const liste = [...alt];
    liste[Number(kopf)] = neu;
    return liste as T;
  }
  return { ...alt, [kopf]: neu } as T;
}

// ── Für die Leiste unten: ist Bearbeiten an, und was ist gerade der Stand? ──
export type Modus = {
  an: boolean;
  starten: () => void;
  beenden: () => void;
  inhalt: LadenInhalt | null;
  setze: (pfad: string, wert: unknown) => void;
};

export const ModusKontext = createContext<Modus | null>(null);

export function useModus(): Modus | null {
  return useContext(ModusKontext);
}
