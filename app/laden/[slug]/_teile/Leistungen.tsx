import type { Leistung } from "@/app/lib/laeden";
import Abschnitt, { type Ton } from "./Abschnitt";

// Schlicht: eine Leistung pro Zeile, mit Linie dazwischen. Keine Kästen.
export default function Leistungen({ leistungen, ton }: { leistungen: Leistung[]; ton: Ton }) {
  if (leistungen.length === 0) return null;

  return (
    <Abschnitt id="leistungen" ton={ton} klein="Was wir machen" titel="Leistungen">
      <ul className="divide-y divide-rand border-y border-rand">
        {leistungen.map((leistung) => (
          <li key={leistung.titel} className="flex flex-col gap-1 py-6 sm:flex-row sm:gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">{leistung.titel}</h3>
              {leistung.text && <p className="mt-2 text-gedaempft">{leistung.text}</p>}
            </div>
            {leistung.preis && (
              <p className="shrink-0 text-xl font-medium text-akzent sm:pt-1">{leistung.preis}</p>
            )}
          </li>
        ))}
      </ul>
    </Abschnitt>
  );
}
