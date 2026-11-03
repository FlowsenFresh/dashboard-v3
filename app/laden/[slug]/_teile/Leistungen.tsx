import type { Leistung } from "@/app/lib/laeden";
import Bearbeitbar from "../_bearbeiten/Bearbeitbar";
import { Entfernen, Hinzufuegen } from "../_bearbeiten/ListenKnoepfe";
import Abschnitt, { type Ton } from "./Abschnitt";

type Props = { leistungen: Leistung[]; ton: Ton; bearbeiten?: boolean };

// Schlicht: eine Leistung pro Zeile, mit Linie dazwischen. Keine Kästen.
export default function Leistungen({ leistungen, ton, bearbeiten }: Props) {
  if (leistungen.length === 0 && !bearbeiten) return null;

  return (
    <Abschnitt id="leistungen" ton={ton} klein="Was wir machen" titel="Leistungen">
      <ul className="divide-y divide-rand border-y border-rand">
        {leistungen.map((leistung, index) => (
          // Index als key: beim Bearbeiten kann der Titel kurz leer oder doppelt sein
          <li key={index} className="flex flex-col gap-1 py-6 sm:flex-row sm:gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">
                <Bearbeitbar
                  pfad={`leistungen.${index}.titel`}
                  wert={leistung.titel}
                  platzhalter="Titel"
                />
              </h3>
              {(leistung.text || bearbeiten) && (
                <p className="mt-2 text-gedaempft">
                  <Bearbeitbar
                    pfad={`leistungen.${index}.text`}
                    wert={leistung.text}
                    mehrzeilig
                    platzhalter="Kurz beschreiben"
                  />
                </p>
              )}
            </div>
            {(leistung.preis || bearbeiten) && (
              <p className="shrink-0 text-xl font-medium text-akzent sm:pt-1">
                <Bearbeitbar
                  pfad={`leistungen.${index}.preis`}
                  wert={leistung.preis ?? ""}
                  platzhalter="Preis"
                />
              </p>
            )}
            <Entfernen pfad="leistungen" index={index} />
          </li>
        ))}
      </ul>
      <Hinzufuegen pfad="leistungen" neu={{ titel: "", text: "" }} text="Leistung" />
    </Abschnitt>
  );
}
