import type { Laden } from "@/app/lib/laeden";
import Bearbeitbar from "../_bearbeiten/Bearbeitbar";
import Abschnitt, { type Ton } from "./Abschnitt";
import { telefonLink } from "./telefonLink";

type Props = { laden: Laden; ton: Ton; bearbeiten?: boolean };

export default function Anfahrt({ laden, ton, bearbeiten }: Props) {
  const { strasse, plzOrt } = laden;
  if (!strasse && !laden.telefon && !bearbeiten) return null;

  // Nur ein Link, keine eingebettete Karte: so lädt Google erst, wenn jemand klickt (Datenschutz)
  const karteLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${laden.name}, ${strasse}, ${plzOrt}`,
  )}`;

  return (
    <Abschnitt id="anfahrt" ton={ton} klein="So findest du uns" titel="Anfahrt & Kontakt">
      <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
        {(strasse || bearbeiten) && (
          <div className="flex flex-col text-xl leading-relaxed">
            <p className="font-semibold">{laden.name}</p>
            <p>
              <Bearbeitbar pfad="strasse" wert={strasse} platzhalter="Straße und Hausnummer" />
            </p>
            <p>
              <Bearbeitbar pfad="plzOrt" wert={plzOrt} platzhalter="PLZ und Ort" />
            </p>
            {!bearbeiten && (
              <a
                href={karteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="knopf-gross-rand mt-6 self-start"
              >
                Route planen ↗
              </a>
            )}
          </div>
        )}
        <div className="flex flex-col gap-4 text-xl">
          {(laden.telefon || bearbeiten) && (
            <div>
              <p className="text-base text-gedaempft">Telefon</p>
              {/* Beim Bearbeiten kein Link, sonst öffnet der Klick die Telefon-App */}
              {bearbeiten ? (
                <p className="font-semibold text-akzent">
                  <Bearbeitbar pfad="telefon" wert={laden.telefon} platzhalter="Telefon" />
                </p>
              ) : (
                <a href={telefonLink(laden.telefon)} className="font-semibold text-akzent">
                  {laden.telefon}
                </a>
              )}
            </div>
          )}
          {(laden.email || bearbeiten) && (
            <div>
              <p className="text-base text-gedaempft">E-Mail</p>
              {bearbeiten ? (
                <p className="font-semibold text-akzent">
                  <Bearbeitbar
                    pfad="email"
                    wert={laden.email ?? ""}
                    platzhalter="E-Mail (optional)"
                  />
                </p>
              ) : (
                <a href={`mailto:${laden.email}`} className="font-semibold text-akzent">
                  {laden.email}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Abschnitt>
  );
}
