import type { Laden } from "@/app/lib/laeden";
import { telefonLink } from "./telefonLink";

// Der "Hero": das Erste, was man sieht. Name, Slogan, zwei Knöpfe.
export default function Held({ laden }: { laden: Laden }) {
  return (
    <section id="start" className="relative overflow-hidden">
      {/* Weicher Farbschein im Hintergrund, nimmt automatisch die Ladenfarbe */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-akzent/15 blur-3xl" />

      <div className="rahmen py-20 text-center sm:py-28">
        <span className="inline-block rounded-full border border-akzent/30 bg-akzent/10 px-3 py-1 text-sm font-medium text-akzent">
          {laden.branche}
        </span>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">{laden.name}</h1>
        <p className="mt-4 text-xl text-schrift/90">{laden.slogan}</p>
        <p className="mx-auto mt-3 max-w-xl text-gedaempft">{laden.beschreibung}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#kontakt" className="knopf">
            Nachricht schreiben
          </a>
          <a href={telefonLink(laden.telefon)} className="knopf-rand">
            Anrufen: {laden.telefon}
          </a>
        </div>
      </div>
    </section>
  );
}
