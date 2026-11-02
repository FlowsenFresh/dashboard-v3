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
    <Suspense fallback={<p className="p-4 text-center">Lade Laden …</p>}>
      <LadenInhalt params={params} />
    </Suspense>
  );
}

async function LadenInhalt({ params }: { params: PageProps<"/laden/[slug]">["params"] }) {
  const { slug } = await params;
  const laden = ladenFinden(slug);
  if (!laden) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <section className="rounded-xl border p-6 text-center">
        <p className="text-sm uppercase tracking-wide text-zinc-400">{laden.branche}</p>
        <h1 className="text-5xl font-bold">{laden.name}</h1>
        <p className="mt-2 text-xl">{laden.slogan}</p>
      </section>

      <section className="rounded-xl border p-4">
        <p>{laden.beschreibung}</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h2 className="mb-2 font-bold">Öffnungszeiten</h2>
          <ul>
            {laden.oeffnungszeiten.map((zeile) => (
              <li key={zeile}>{zeile}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="mb-2 font-bold">Kontakt</h2>
          <p>{laden.adresse}</p>
          <p>{laden.telefon}</p>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="mb-4 text-2xl font-bold">Schreib uns</h2>
        <KontaktFormular slug={laden.slug} />
      </section>
    </main>
  );
}
