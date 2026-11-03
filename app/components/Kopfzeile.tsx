import Link from "next/link";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { abmelden } from "@/app/(dashboard)/login/actions";
import { zurueckZumAdmin } from "@/app/(admin)/admin/actions";
import { db } from "../lib/db";
import { laeden } from "../lib/db/schema";
import {
  aktuellerBenutzer,
  darfWebseiteBearbeiten,
  istLadenInhaber,
  type Benutzer,
} from "../lib/sitzung";
import { uhrzeit } from "../lib/zeit";

// Welche Links jemand sieht, hängt von seinen Rechten ab. Das ist nur fürs Auge:
// die echte Prüfung steht auf jeder Seite und in jeder Action noch einmal.
function linksFuer(angemeldet: Benutzer) {
  return [
    { href: "/dashboard", text: "Kalender" },
    { href: "/termine", text: "Termine" },
    { href: "/nachrichten", text: "Nachrichten" },
    ...(darfWebseiteBearbeiten(angemeldet) ? [{ href: "/webseite", text: "Webseite" }] : []),
    ...(istLadenInhaber(angemeldet) ? [{ href: "/team", text: "Team" }] : []),
  ];
}

// Kopfzeile des Kunden-Dashboards. So sieht es auch der Ladeninhaber.
export default function Kopfzeile() {
  return (
    <>
      {/* Liest das Cookie, darum in Suspense. Der Rest der Seite wartet nicht darauf. */}
      <Suspense>
        <AdminStreifen />
      </Suspense>
      <header className="border-b border-rand">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="size-2.5 rounded-full bg-akzent" />
            Dashboard
          </Link>
          <Suspense>
            <Menue />
          </Suspense>
        </nav>
      </header>
    </>
  );
}

// Nur Angemeldete sehen die Links. Auf der Login-Seite steht nur das Logo.
async function Menue() {
  const angemeldet = await aktuellerBenutzer();
  if (!angemeldet) return null;

  return (
    <div className="flex items-center gap-4 text-sm text-gedaempft sm:gap-6">
      {linksFuer(angemeldet).map((link) => (
        <Link key={link.href} href={link.href} className="transition hover:text-schrift">
          {link.text}
        </Link>
      ))}
      <form action={abmelden}>
        <button className="knopf-leise" title={angemeldet.email}>
          Abmelden
        </button>
      </form>
    </div>
  );
}

// Nur für admin: schmaler Streifen ganz oben, damit klar ist,
// dass du gerade beim Kunden reinschaust und nicht in deinem Admin-Bereich bist.
async function AdminStreifen() {
  const angemeldet = await aktuellerBenutzer();
  if (angemeldet?.rolle !== "admin") return null;

  return (
    <div className="bg-akzent/15 text-sm">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        {angemeldet.ansichtLadenId !== null && angemeldet.zugriffBis ? (
          <p>
            Du siehst das Dashboard{" "}
            <span className="font-semibold">von {await ladenName(angemeldet.ansichtLadenId)}</span>,
            so wie der Kunde. Zugang bis {uhrzeit(angemeldet.zugriffBis)} Uhr.
          </p>
        ) : (
          <p>Du hast gerade keinen Zugang zu einem Laden. Hier siehst du keine Kundendaten.</p>
        )}
        <form action={zurueckZumAdmin}>
          <button className="font-medium text-akzent underline-offset-4 hover:underline">
            ← Zurück zum Admin
          </button>
        </form>
      </div>
    </div>
  );
}

async function ladenName(ladenId: number): Promise<string> {
  const [laden] = await db.select({ name: laeden.name }).from(laeden).where(eq(laeden.id, ladenId));
  return laden?.name ?? "?";
}
