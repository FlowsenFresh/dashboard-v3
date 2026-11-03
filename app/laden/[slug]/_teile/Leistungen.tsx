import type { Leistung } from "@/app/lib/laeden";
import Ueberschrift from "./Ueberschrift";

export default function Leistungen({ leistungen }: { leistungen: Leistung[] }) {
  if (leistungen.length === 0) return null;

  return (
    <section id="leistungen" className="rahmen scroll-mt-20 py-16">
      <Ueberschrift klein="Was wir machen" titel="Leistungen" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {leistungen.map((leistung) => (
          <div key={leistung.titel} className="karte flex flex-col">
            <h3 className="font-semibold">{leistung.titel}</h3>
            <p className="mt-1 flex-1 text-sm text-gedaempft">{leistung.text}</p>
            {leistung.preis && (
              <p className="mt-4 text-sm font-medium text-akzent">{leistung.preis}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
