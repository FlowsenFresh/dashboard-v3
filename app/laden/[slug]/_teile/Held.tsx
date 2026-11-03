import Image from "next/image";
import type { Laden } from "@/app/lib/laeden";
import Bearbeitbar from "../_bearbeiten/Bearbeitbar";
import FotoKnopf from "../_bearbeiten/FotoKnopf";
import Abschnitt from "./Abschnitt";
import { telefonLink } from "./telefonLink";

// Der "Hero": das Erste, was man sieht. Name, Slogan, zwei große Knöpfe. Mehr nicht.
// bearbeiten: im Bearbeitungsmodus auch leere Felder zeigen, damit man sie ausfüllen kann.
// Mit Titelbild (z. B. Foto der Ladenfront) liegt das Foto hinter dem Text.
export default function Held({ laden, bearbeiten }: { laden: Laden; bearbeiten?: boolean }) {
  const foto = laden.titelbild;
  return (
    <Abschnitt id="start" ton="farbe" hintergrund={foto && <Hintergrund url={foto} />}>
      {bearbeiten && <FotoKnopf pfad="titelbild" slug={laden.slug} />}
      {/* Auf dem Foto: helle Schrift mit leichtem Schatten, damit man sie immer lesen kann */}
      <div className={`text-center ${foto ? "auf-foto py-16 sm:py-24" : "py-6 sm:py-10"}`}>
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

// Das Foto füllt den ganzen Streifen (fill + object-cover: zuschneiden statt verzerren).
// Darüber ein dunkler Verlauf, damit der Name auf hellen Fotos lesbar bleibt.
// preload: das ist das Erste, was man sieht, also gleich mitladen.
// sizes="100vw": Next.js liefert jedem Gerät eine passende Größe (Handy kleiner als PC).
function Hintergrund({ url }: { url: string }) {
  return (
    <>
      <Image src={url} alt="" fill preload sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-linear-to-b from-hintergrund/60 via-hintergrund/45 to-hintergrund/80" />
    </>
  );
}
