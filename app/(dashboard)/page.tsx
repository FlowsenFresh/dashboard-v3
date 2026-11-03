import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { aktuellerBenutzer, darfWebseiteBearbeiten, istLadenInhaber } from "@/app/lib/sitzung";

// Startseite des Kunden-Dashboards. Genau das sieht auch der Ladeninhaber.
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      {/* admin ohne gewählten Laden gehört in den Admin-Bereich */}
      <Suspense>
        <AdminWeiterleitung />
      </Suspense>

      <h1 className="seitentitel">Willkommen zurück</h1>
      <p className="mt-2 text-gedaempft">Hier hast du deine Termine und Nachrichten im Blick.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/termine" className="karte-link">
          <h2 className="font-semibold">Termine</h2>
          <p className="mt-1 text-sm text-gedaempft">Aufträge und was ansteht</p>
        </Link>
        <Link href="/nachrichten" className="karte-link">
          <h2 className="font-semibold">Nachrichten</h2>
          <p className="mt-1 text-sm text-gedaempft">Anfragen von der Laden-Seite</p>
        </Link>
        {/* Diese Karten hängen von den Rechten ab, darum lesen sie das Cookie (in Suspense) */}
        <Suspense>
          <KartenMitRechten />
        </Suspense>
      </div>
    </main>
  );
}

async function AdminWeiterleitung() {
  const angemeldet = await aktuellerBenutzer();
  if (angemeldet?.rolle === "admin" && angemeldet.ansichtLadenId === null) redirect("/admin");
  return null;
}

async function KartenMitRechten() {
  const angemeldet = await aktuellerBenutzer();
  if (!angemeldet) return null;
  return (
    <>
      {darfWebseiteBearbeiten(angemeldet) && (
        <Link href="/webseite" className="karte-link">
          <h2 className="font-semibold">Webseite</h2>
          <p className="mt-1 text-sm text-gedaempft">Texte, Zeiten und Telefon ändern</p>
        </Link>
      )}
      {istLadenInhaber(angemeldet) && (
        <>
          <Link href="/team" className="karte-link">
            <h2 className="font-semibold">Team</h2>
            <p className="mt-1 text-sm text-gedaempft">
              Logins für Mitarbeiter, wer die Webseite ändern darf
            </p>
          </Link>
          <Link href="/zugang" className="karte-link">
            <h2 className="font-semibold">Support-Zugang</h2>
            <p className="mt-1 text-sm text-gedaempft">
              Code für uns erzeugen, wenn du Hilfe brauchst
            </p>
          </Link>
        </>
      )}
    </>
  );
}
