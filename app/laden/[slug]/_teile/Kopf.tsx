import type { Laden } from "@/app/lib/laeden";

// Leiste oben. "sticky" = bleibt beim Scrollen stehen.
// Die Links springen zu den Abschnitten (#leistungen usw. sind deren id).
export default function Kopf({ laden }: { laden: Laden }) {
  return (
    <header className="sticky top-0 z-10 border-b border-rand bg-hintergrund/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
        <a href="#start" className="flex items-center gap-3 text-xl font-semibold tracking-tight">
          <span className="size-3 rounded-full bg-akzent" />
          {laden.name}
        </a>
        <div className="flex items-center gap-8 text-gedaempft">
          {/* Auf dem Handy nur der Knopf, sonst wird es zu eng */}
          <a href="#leistungen" className="hidden transition hover:text-schrift md:block">
            Leistungen
          </a>
          <a href="#zeiten" className="hidden transition hover:text-schrift md:block">
            Öffnungszeiten
          </a>
          <a href="#kontakt" className="knopf">
            Schreib uns
          </a>
        </div>
      </nav>
    </header>
  );
}
