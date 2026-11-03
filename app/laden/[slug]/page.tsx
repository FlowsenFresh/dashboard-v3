import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alleLaeden, ladenFinden } from "@/app/lib/laeden";
import Seite from "./_teile/Seite";
import Rahmen from "./_bearbeiten/Rahmen";
import BearbeitenLeiste from "./_bearbeiten/BearbeitenLeiste";

// Das ist das Template: eine Seite für alle Läden.
// Die Abschnitte stehen in _teile/ (der Unterstrich sagt Next.js: keine eigene Seite, nur Bausteine),
// zusammengesetzt in _teile/Seite.tsx. Der Bearbeitungsmodus (Doppelklick) steckt in _bearbeiten/.
// Die Inhalte kommen aus der Datenbank.

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

async function LadenInhalt({ params }: { params: PageProps<"/laden/[slug]">["params"] }) {
  const { slug } = await params;
  const laden = await ladenFinden(slug);
  if (!laden) notFound();

  return (
    <Rahmen
      laden={laden}
      seite={<Seite laden={laden} />}
      leiste={
        // Nur dieser kleine Teil liest das Login-Cookie, die Seite bleibt im Cache
        <Suspense>
          <BearbeitenLeiste slug={laden.slug} ladenId={laden.id} />
        </Suspense>
      }
    />
  );
}
