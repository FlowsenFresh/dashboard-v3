import type { Laden } from "@/app/lib/laeden";
import Bearbeitbar from "../_bearbeiten/Bearbeitbar";
import Abschnitt from "./Abschnitt";
import { telefonLink } from "./telefonLink";

// Der "Hero": das Erste, was man sieht. Name, Slogan, zwei große Knöpfe. Mehr nicht.
// bearbeiten: im Bearbeitungsmodus auch leere Felder zeigen, damit man sie ausfüllen kann.
export default function Held({ laden, bearbeiten }: { laden: Laden; bearbeiten?: boolean }) {
  return (
    <Abschnitt id="start" ton="farbe">
      <div className="py-6 text-center sm:py-10">
        {(laden.branche || bearbeiten) && (
          <p className="font-medium text-akzent">
            <Bearbeitbar pfad="branche" wert={laden.branche} platzhalter="Branche" />
          </p>
        )}
        <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-7xl">
          <Bearbeitbar pfad="name" wert={laden.name} />
        </h1>
        {(laden.slogan || bearbeiten) && (
          <p className="mt-5 text-2xl text-schrift/90">
            <Bearbeitbar pfad="slogan" wert={laden.slogan} platzhalter="Slogan" />
          </p>
        )}
        {(laden.beschreibung || bearbeiten) && (
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-gedaempft">
            <Bearbeitbar
              pfad="beschreibung"
              wert={laden.beschreibung}
              mehrzeilig
              platzhalter="Ein, zwei Sätze über den Laden"
            />
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
