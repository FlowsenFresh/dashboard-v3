import type { Laden } from "@/app/lib/laeden";
import Bearbeitbar from "../_bearbeiten/Bearbeitbar";
import { Entfernen, Hinzufuegen } from "../_bearbeiten/ListenKnoepfe";
import Abschnitt, { type Ton } from "./Abschnitt";

type Props = { laden: Laden; ton: Ton; bearbeiten?: boolean };

export default function Oeffnungszeiten({ laden, ton, bearbeiten }: Props) {
  return (
    <Abschnitt id="zeiten" ton={ton} klein="Wann wir da sind" titel="Öffnungszeiten">
      {laden.oeffnungszeiten.length === 0 && !bearbeiten ? (
        <p className="text-xl text-gedaempft">Ruf kurz an oder schreib uns.</p>
      ) : (
        <dl className="divide-y divide-rand border-y border-rand text-xl">
          {laden.oeffnungszeiten.map(({ tage, zeit }, index) => (
            <div key={index} className="flex items-center justify-between gap-4 py-5">
              <dt>
                <Bearbeitbar
                  pfad={`oeffnungszeiten.${index}.tage`}
                  wert={tage}
                  platzhalter="Mo–Fr"
                />
              </dt>
              <dd className={zeit === "geschlossen" ? "text-gedaempft" : "font-semibold"}>
                <Bearbeitbar
                  pfad={`oeffnungszeiten.${index}.zeit`}
                  wert={zeit}
                  platzhalter="9–18 Uhr oder geschlossen"
                />
              </dd>
              <Entfernen pfad="oeffnungszeiten" index={index} />
            </div>
          ))}
        </dl>
      )}
      <Hinzufuegen pfad="oeffnungszeiten" neu={{ tage: "", zeit: "" }} text="Zeile" />
      {(laden.hinweisZeiten || bearbeiten) && (
        <p className="mt-6 text-gedaempft">
          <Bearbeitbar
            pfad="hinweisZeiten"
            wert={laden.hinweisZeiten ?? ""}
            platzhalter="Hinweis, z. B. Im Frühjahr lieber vorher anrufen"
          />
        </p>
      )}
    </Abschnitt>
  );
}
