"use client";
import { useBearbeiten } from "./Kontext";

// Kleine Knöpfe für Listen (Leistungen, Öffnungszeiten, Fakten, Anliegen).
// Außerhalb vom Bearbeitungsmodus zeigen sie nichts.

export function Hinzufuegen({ pfad, neu, text }: { pfad: string; neu: unknown; text: string }) {
  const bearbeiten = useBearbeiten();
  if (!bearbeiten) return null;
  const liste = (bearbeiten.lies(pfad) as unknown[] | undefined) ?? [];
  return (
    <button
      type="button"
      onClick={() => bearbeiten.setze(pfad, [...liste, neu])}
      className="knopf-leise mt-6"
    >
      + {text}
    </button>
  );
}

export function Entfernen({ pfad, index }: { pfad: string; index: number }) {
  const bearbeiten = useBearbeiten();
  if (!bearbeiten) return null;
  const liste = (bearbeiten.lies(pfad) as unknown[] | undefined) ?? [];
  return (
    <button
      type="button"
      onClick={() =>
        bearbeiten.setze(
          pfad,
          liste.filter((_, i) => i !== index),
        )
      }
      aria-label="Entfernen"
      title="Entfernen"
      className="shrink-0 px-2 text-base text-gedaempft transition hover:text-fehler"
    >
      ✕
    </button>
  );
}
