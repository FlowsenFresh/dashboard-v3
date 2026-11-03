import Link from "next/link";
import { Suspense } from "react";
import { alleLaeden } from "@/app/lib/laeden";
import { benutzerPflicht } from "@/app/lib/sitzung";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="seitentitel">Willkommen zurück</h1>
      <p className="mt-2 text-gedaempft">Hier hast du deine Termine und Nachrichten im Blick.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/termine" className="karte-link">
          <h2 className="font-semibold">Termine</h2>
          <p className="mt-1 text-sm text-gedaempft">Aufträge und was ansteht</p>
        </Link>
        <Link href="/nachrichten" className="karte-link">
          <h2 className="font-semibold">Nachrichten</h2>
          <p className="mt-1 text-sm text-gedaempft">Anfragen von der Laden-Seite</p>
        </Link>
        <Link href="/webseite" className="karte-link">
          <h2 className="font-semibold">Webseite</h2>
          <p className="mt-1 text-sm text-gedaempft">Texte, Zeiten und Telefon ändern</p>
        </Link>
      </div>

      {/* Liest das Cookie, darum in Suspense */}
      <Suspense>
        <AlleLadenSeiten />
      </Suspense>
    </main>
  );
}

// Nur für admin: alle Laden-Seiten auf einen Blick
async function AlleLadenSeiten() {
  const angemeldet = await benutzerPflicht();
  if (angemeldet.rolle !== "admin") return null;
  const laeden = await alleLaeden();

  return (
    <>
      <h2 className="mt-12 text-xl font-semibold">Alle Laden-Seiten</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {laeden.map((laden) => (
          <Link
            key={laden.slug}
            href={`/laden/${laden.slug}`}
            className="karte-link flex items-center gap-3"
          >
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: laden.farbe ?? "var(--color-akzent)" }}
            />
            <div>
              <p className="font-medium">{laden.name}</p>
              <p className="text-sm text-gedaempft">{laden.branche}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
