import type { ReactNode } from "react";

// Jeder Abschnitt der Laden-Seite ist ein breiter Streifen mit eigenem Hintergrundton.
// So sieht man sofort, wo ein Thema aufhört und das nächste anfängt.
// Die Töne stehen in globals.css: hintergrund (am dunkelsten), band, flaeche, und die Ladenfarbe.
const toene = {
  dunkel: "bg-hintergrund",
  mittel: "bg-band",
  hell: "bg-flaeche",
  farbe: "bg-akzent/10",
} as const;

export type Ton = keyof typeof toene;

type Props = {
  id: string; // Sprungziel für die Links oben, z. B. #leistungen
  ton: Ton;
  klein?: string; // kleine farbige Zeile über dem Titel
  titel?: string;
  hintergrund?: ReactNode; // z. B. ein Foto, liegt hinter dem Inhalt
  children: ReactNode;
};

export default function Abschnitt({ id, ton, klein, titel, hintergrund, children }: Props) {
  return (
    // scroll-mt: beim Springen nicht unter der festen Kopfzeile verschwinden
    // relative + overflow-hidden: damit ein Hintergrund-Foto genau in den Streifen passt
    <section id={id} className={`${toene[ton]} relative scroll-mt-20 overflow-hidden`}>
      {hintergrund}
      {/* relative: der Inhalt liegt so ÜBER dem Hintergrund */}
      <div className="relative mx-auto w-full max-w-3xl px-5 py-20 sm:py-24">
        {titel && (
          <div className="mb-10">
            {klein && <p className="font-medium text-akzent">{klein}</p>}
            <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{titel}</h2>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
