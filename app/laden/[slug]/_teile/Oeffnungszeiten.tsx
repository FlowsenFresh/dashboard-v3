import type { Laden } from "@/app/lib/laeden";
import Abschnitt, { type Ton } from "./Abschnitt";

export default function Oeffnungszeiten({ laden, ton }: { laden: Laden; ton: Ton }) {
  return (
    <Abschnitt id="zeiten" ton={ton} klein="Wann wir da sind" titel="Öffnungszeiten">
      {laden.oeffnungszeiten.length === 0 ? (
        <p className="text-xl text-gedaempft">Ruf kurz an oder schreib uns.</p>
      ) : (
        <dl className="divide-y divide-rand border-y border-rand text-xl">
          {laden.oeffnungszeiten.map(({ tage, zeit }) => (
            <div key={tage} className="flex justify-between gap-4 py-5">
              <dt>{tage}</dt>
              <dd className={zeit === "geschlossen" ? "text-gedaempft" : "font-semibold"}>
                {zeit}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {laden.hinweisZeiten && <p className="mt-6 text-gedaempft">{laden.hinweisZeiten}</p>}
    </Abschnitt>
  );
}
