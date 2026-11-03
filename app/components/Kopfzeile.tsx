import Link from "next/link";
import { Suspense } from "react";
import { abmelden } from "../login/actions";
import { asc } from "drizzle-orm";
import { db } from "../lib/db";
import { laeden } from "../lib/db/schema";
import { aktuellerBenutzer } from "../lib/sitzung";
import LadenWechsler from "./LadenWechsler";

const links = [
  { href: "/termine", text: "Termine" },
  { href: "/nachrichten", text: "Nachrichten" },
  { href: "/laden/radl-huber", text: "Laden-Seite" },
];

export default function Kopfzeile() {
  return (
    <header className="border-b border-rand">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="size-2.5 rounded-full bg-akzent" />
          Dashboard
        </Link>
        {/* Liest das Cookie, darum in Suspense. Der Rest der Seite wartet nicht darauf. */}
        <Suspense>
          <Menue />
        </Suspense>
      </nav>
    </header>
  );
}

// Nur Angemeldete sehen die Links. Kunden auf der Laden-Seite sehen nur das Logo.
async function Menue() {
  const angemeldet = await aktuellerBenutzer();
  if (!angemeldet) return null;

  // Für admin: alle Läden für das Auswahlfeld
  const alleLaeden =
    angemeldet.rolle === "admin"
      ? await db.select({ id: laeden.id, name: laeden.name }).from(laeden).orderBy(asc(laeden.name))
      : [];

  return (
    <div className="flex items-center gap-4 text-sm text-gedaempft sm:gap-6">
      {angemeldet.rolle === "admin" && (
        // key: bei einem Wechsel neu aufbauen, damit die Auswahl zum Server passt
        <LadenWechsler
          key={angemeldet.ansichtLadenId ?? "alle"}
          laeden={alleLaeden}
          aktuell={angemeldet.ansichtLadenId}
        />
      )}
      {links.map((link) => (
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
