import { Suspense } from "react";
import { notFound } from "next/navigation";
import { beispielLaeden, ladenFinden } from "../../lib/laeden";
import KontaktFormular from "../../components/KontaktFormular";

// Sagt Next.js beim Build, welche Laden-Seiten es gibt
export function generateStaticParams() {
  return beispielLaeden.map((laden) => ({ slug: laden.slug }));
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
  const laden = ladenFinden(slug);
  if (!laden) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <section className="py-6 text-center">
        <p className="text-sm font-medium text-akzent">{laden.branche}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{laden.name}</h1>
        <p className="mt-3 text-lg text-gedaempft">{laden.slogan}</p>
      </section>

      <p className="karte leading-relaxed">{laden.beschreibung}</p>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="karte">
          <h2 className="mb-2 text-sm font-medium text-gedaempft">Öffnungszeiten</h2>
          <ul className="space-y-1">
            {laden.oeffnungszeiten.map((zeile) => (
              <li key={zeile}>{zeile}</li>
            ))}
          </ul>
        </div>
        <div className="karte">
          <h2 className="mb-2 text-sm font-medium text-gedaempft">Kontakt</h2>
          <p>{laden.adresse}</p>
          <p>{laden.telefon}</p>
        </div>
      </section>

      <section className="karte">
        <h2 className="text-xl font-semibold">Schreib uns</h2>
        <p className="mb-5 mt-1 text-sm text-gedaempft">Wir melden uns so schnell wie möglich.</p>
        <KontaktFormular slug={laden.slug} anliegen={laden.anliegen} />
      </section>
    </main>
  );
}
