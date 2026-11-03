import type { Laden } from "@/app/lib/laeden";
import Abschnitt from "./Abschnitt";
import { telefonLink } from "./telefonLink";

// Der "Hero": das Erste, was man sieht. Name, Slogan, zwei große Knöpfe. Mehr nicht.
export default function Held({ laden }: { laden: Laden }) {
  return (
    <Abschnitt id="start" ton="farbe">
      <div className="py-6 text-center sm:py-10">
        {laden.branche && <p className="font-medium text-akzent">{laden.branche}</p>}
        <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-7xl">{laden.name}</h1>
        {laden.slogan && <p className="mt-5 text-2xl text-schrift/90">{laden.slogan}</p>}
        {laden.beschreibung && (
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-gedaempft">
            {laden.beschreibung}
          </p>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a href="#kontakt" className="knopf-gross">
            Nachricht schreiben
          </a>
          {laden.telefon && (
            <a href={telefonLink(laden.telefon)} className="knopf-gross-rand">
              Anrufen
            </a>
          )}
        </div>
      </div>
    </Abschnitt>
  );
}
