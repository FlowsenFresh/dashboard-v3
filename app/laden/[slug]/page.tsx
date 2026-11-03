import type { CSSProperties } from "react";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alleLaeden, ladenFinden } from "@/app/lib/laeden";
import Kopf from "./_teile/Kopf";
import Held from "./_teile/Held";
import Leistungen from "./_teile/Leistungen";
import UeberUns from "./_teile/UeberUns";
import Oeffnungszeiten from "./_teile/Oeffnungszeiten";
import Anfahrt from "./_teile/Anfahrt";
import Kontakt from "./_teile/Kontakt";
import Fuss from "./_teile/Fuss";

// Das ist das Template: eine Seite für alle Läden.
// Jeder Abschnitt ist eine eigene Datei in _teile/ (der Unterstrich sagt Next.js:
// das ist keine eigene Seite, nur Bausteine). Reihenfolge ändern = Zeilen unten tauschen.
// Die Inhalte kommen aus der Datenbank und werden im Dashboard unter /webseite bearbeitet.

// Sagt Next.js beim Build, welche Laden-Seiten es schon gibt. Läden, die später
// dazukommen, baut Next.js beim ersten Besuch und merkt sie sich dann.
export async function generateStaticParams() {
  const laeden = await alleLaeden();
  return laeden.map((laden) => ({ slug: laden.slug }));
}

// Titel und Beschreibung für Google und den Browser-Tab, pro Laden
export async function generateMetadata({ params }: PageProps<"/laden/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const laden = await ladenFinden(slug);
  if (!laden) return {};
  return {
    title: laden.branche ? `${laden.name} · ${laden.branche}` : laden.name,
    description: [laden.slogan, laden.beschreibung].filter(Boolean).join(". "),
  };
}

// Die Seite selbst wartet auf nichts. So kann Next.js sofort einen Rahmen zeigen
// und den Inhalt nachliefern, sobald der slug aus der URL bekannt ist.
export default function LadenSeite({ params }: PageProps<"/laden/[slug]">) {
  return (
    <Suspense fallback={<p className="p-10 text-center text-gedaempft">Lade Laden …</p>}>
      <LadenInhalt params={params} />
    </Suspense>
  );
}

// Überschreibt unsere Akzentfarbe nur für diese Seite. Alle Klassen wie
// text-akzent oder bg-akzent/10 lesen die CSS-Variable und ziehen automatisch mit.
// Die Farbe beim Drüberfahren mischt der Browser selbst: 25 % Weiß dazu.
function farbVariablen(farbe: string | null): CSSProperties | undefined {
  if (!farbe) return undefined;
  return {
    "--color-akzent": farbe,
    "--color-akzent-hell": `color-mix(in oklab, ${farbe}, white 25%)`,
  } as CSSProperties;
}

async function LadenInhalt({ params }: { params: PageProps<"/laden/[slug]">["params"] }) {
  const { slug } = await params;
  const laden = await ladenFinden(slug);
  if (!laden) notFound();

  // Die Abschnitte wechseln sich im Hintergrund ab (siehe _teile/Abschnitt.tsx).
  // Wenig auf einmal: jedes Thema bekommt seinen eigenen Streifen.
  return (
    // text-lg: auf der Laden-Seite ist alles etwas größer, angenehm auch für ältere Kunden
    <div style={farbVariablen(laden.farbe)} className="flex flex-1 flex-col text-lg">
      <Kopf laden={laden} />
      <main className="flex-1">
        <Held laden={laden} />
        <Leistungen leistungen={laden.leistungen} ton="dunkel" />
        {laden.ueberUns && <UeberUns ueberUns={laden.ueberUns} ton="hell" />}
        <Oeffnungszeiten laden={laden} ton="mittel" />
        <Anfahrt laden={laden} ton="dunkel" />
        <Kontakt laden={laden} ton="hell" />
      </main>
      <Fuss laden={laden} />
    </div>
  );
}
