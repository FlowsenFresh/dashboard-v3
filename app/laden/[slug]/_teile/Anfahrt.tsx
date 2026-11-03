import type { Laden } from "@/app/lib/laeden";
import Abschnitt, { type Ton } from "./Abschnitt";
import { telefonLink } from "./telefonLink";

export default function Anfahrt({ laden, ton }: { laden: Laden; ton: Ton }) {
  const { strasse, plzOrt } = laden;
  if (!strasse && !laden.telefon) return null;

  // Nur ein Link, keine eingebettete Karte: so lädt Google erst, wenn jemand klickt (Datenschutz)
  const karteLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${laden.name}, ${strasse}, ${plzOrt}`,
  )}`;

  return (
    <Abschnitt id="anfahrt" ton={ton} klein="So findest du uns" titel="Anfahrt & Kontakt">
      <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
        {strasse && (
          <div className="text-xl leading-relaxed">
            <p className="font-semibold">{laden.name}</p>
            <p>{strasse}</p>
            <p>{plzOrt}</p>
            <a
              href={karteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="knopf-gross-rand mt-6 inline-block"
            >
              Route planen ↗
            </a>
          </div>
        )}
        <div className="flex flex-col gap-4 text-xl">
          {laden.telefon && (
            <div>
              <p className="text-base text-gedaempft">Telefon</p>
              <a href={telefonLink(laden.telefon)} className="font-semibold text-akzent">
                {laden.telefon}
              </a>
            </div>
          )}
          {laden.email && (
            <div>
              <p className="text-base text-gedaempft">E-Mail</p>
              <a href={`mailto:${laden.email}`} className="font-semibold text-akzent">
                {laden.email}
              </a>
            </div>
          )}
        </div>
      </div>
    </Abschnitt>
  );
}
