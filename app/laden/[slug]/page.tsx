import type { CSSProperties } from "react";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { beispielLaeden, ladenFinden, type Laden } from "@/app/lib/laeden";
import Kopf from "./_teile/Kopf";
import Held from "./_teile/Held";
import Leistungen from "./_teile/Leistungen";
import UeberUns from "./_teile/UeberUns";
import ZeitenUndAnfahrt from "./_teile/ZeitenUndAnfahrt";
import Kontakt from "./_teile/Kontakt";
import Fuss from "./_teile/Fuss";

// Das ist das Template: eine Seite für alle Läden.
// Jeder Abschnitt ist eine eigene Datei in _teile/ (der Unterstrich sagt Next.js:
// das ist keine eigene Seite, nur Bausteine). Reihenfolge ändern = Zeilen unten tauschen.

// Sagt Next.js beim Build, welche Laden-Seiten es gibt
export function generateStaticParams() {
  return beispielLaeden.map((laden) => ({ slug: laden.slug }));
}

// Titel und Beschreibung für Google und den Browser-Tab, pro Laden
export async function generateMetadata({ params }: PageProps<"/laden/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const laden = ladenFinden(slug);
  if (!laden) return {};
  return {
    title: `${laden.name} · ${laden.branche}`,
    description: `${laden.slogan}. ${laden.beschreibung}`,
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
function farbVariablen(laden: Laden): CSSProperties | undefined {
  if (!laden.farben) return undefined;
  return {
    "--color-akzent": laden.farben.akzent,
    "--color-akzent-hell": laden.farben.akzentHell,
  } as CSSProperties;
}

async function LadenInhalt({ params }: { params: PageProps<"/laden/[slug]">["params"] }) {
  const { slug } = await params;
  const laden = ladenFinden(slug);
  if (!laden) notFound();

  return (
    <div style={farbVariablen(laden)} className="flex flex-1 flex-col">
      <Kopf laden={laden} />
      <main className="flex-1">
        <Held laden={laden} />
        <Leistungen leistungen={laden.leistungen} />
        {laden.ueberUns && <UeberUns ueberUns={laden.ueberUns} />}
        <ZeitenUndAnfahrt laden={laden} />
        <Kontakt laden={laden} />
      </main>
      <Fuss laden={laden} />
    </div>
  );
}
