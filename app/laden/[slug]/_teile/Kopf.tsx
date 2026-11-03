import type { Laden } from "@/app/lib/laeden";

// Leiste oben. "sticky" = bleibt beim Scrollen stehen.
// Die Links springen zu den Abschnitten (#leistungen usw. sind deren id).
export default function Kopf({ laden }: { laden: Laden }) {
  return (
    <header className="sticky top-0 z-10 border-b border-rand bg-hintergrund/80 backdrop-blur">
      <nav className="rahmen flex items-center justify-between py-4">
        <a href="#start" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="size-2.5 rounded-full bg-akzent" />
          {laden.name}
        </a>
        <div className="flex items-center gap-6 text-sm text-gedaempft">
          {/* Auf dem Handy nur der Knopf, sonst wird es zu eng */}
          <a href="#leistungen" className="hidden transition hover:text-schrift sm:block">
            Leistungen
          </a>
          <a href="#zeiten" className="hidden transition hover:text-schrift sm:block">
            Öffnungszeiten
          </a>
          <a href="#kontakt" className="knopf text-sm">
            Nachricht schreiben
          </a>
        </div>
      </nav>
    </header>
  );
}
