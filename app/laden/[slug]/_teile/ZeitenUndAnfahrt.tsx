import type { Laden } from "@/app/lib/laeden";
import Ueberschrift from "./Ueberschrift";
import { telefonLink } from "./telefonLink";

export default function ZeitenUndAnfahrt({ laden }: { laden: Laden }) {
  const { strasse, plzOrt } = laden.adresse;
  // Nur ein Link, keine eingebettete Karte: so lädt Google erst, wenn jemand klickt (Datenschutz)
  const karteLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${laden.name}, ${strasse}, ${plzOrt}`,
  )}`;

  return (
    <section id="zeiten" className="rahmen scroll-mt-20 py-16">
      <Ueberschrift klein="Komm vorbei" titel="Öffnungszeiten & Anfahrt" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="karte">
          <h3 className="mb-3 text-sm font-medium text-gedaempft">Öffnungszeiten</h3>
          <dl className="divide-y divide-rand">
            {laden.oeffnungszeiten.map(({ tage, zeit }) => (
              <div key={tage} className="flex justify-between py-2">
                <dt>{tage}</dt>
                <dd className={zeit === "geschlossen" ? "text-gedaempft" : "font-medium"}>
                  {zeit}
                </dd>
              </div>
            ))}
          </dl>
          {laden.hinweisZeiten && (
            <p className="mt-3 text-sm text-gedaempft">{laden.hinweisZeiten}</p>
          )}
        </div>

        <div className="karte flex flex-col">
          <h3 className="mb-3 text-sm font-medium text-gedaempft">Adresse & Kontakt</h3>
          <p className="font-medium">{laden.name}</p>
          <p>{strasse}</p>
          <p>{plzOrt}</p>
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <a href={telefonLink(laden.telefon)} className="text-akzent hover:underline">
                {laden.telefon}
              </a>
            </p>
            {laden.email && (
              <p>
                <a href={`mailto:${laden.email}`} className="text-akzent hover:underline">
                  {laden.email}
                </a>
              </p>
            )}
          </div>
          <a
            href={karteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="knopf-rand mt-auto self-start text-sm"
          >
            Route planen ↗
          </a>
        </div>
      </div>
    </section>
  );
}
