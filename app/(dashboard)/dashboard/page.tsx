import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import NachrichtenKarte from "@/app/components/NachrichtenKarte";
import TerminKarte from "@/app/components/TerminKarte";
import {
  WOCHENTAGE_KURZ,
  langesDatum,
  leereFelderVorne,
  monatVerschieben,
  monatsName,
  tagLesen,
  tagText,
  tageImMonat,
} from "@/app/lib/kalender";
import type { Nachricht } from "@/app/lib/nachrichten";
import { alleNachrichten } from "@/app/lib/nachrichtenSpeicher";
import { aktuellerBenutzer, darfWebseiteBearbeiten, istLadenInhaber } from "@/app/lib/sitzung";
import type { Termin } from "@/app/lib/termine";
import { alleTermine } from "@/app/lib/termineSpeicher";
import { tagInBerlin } from "@/app/lib/zeit";

// Startseite des Kunden-Dashboards: der Kalender ist die Zentrale.
// Welcher Tag gewählt ist, steht in der Adresse: /dashboard?tag=2026-11-03
// So funktionieren Zurück-Knopf und Lesezeichen, und wir brauchen kein "use client".
export default function Dashboard({ searchParams }: PageProps<"/dashboard">) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      {/* admin ohne gewählten Laden gehört in den Admin-Bereich */}
      <Suspense>
        <AdminWeiterleitung />
      </Suspense>

      {/* Cookie, Adresse und Datenbank werden erst beim Aufruf gelesen, darum in Suspense */}
      <Suspense fallback={<KalenderPlatzhalter />}>
        <KalenderAnsicht searchParams={searchParams} />
      </Suspense>

      <Suspense>
        <Schnellzugriff />
      </Suspense>
    </main>
  );
}

async function AdminWeiterleitung() {
  const angemeldet = await aktuellerBenutzer();
  if (angemeldet?.rolle === "admin" && angemeldet.ansichtLadenId === null) redirect("/admin");
  return null;
}

// Was an einem Tag los ist
type TagInhalt = { termine: Termin[]; nachrichten: Nachricht[]; wunsch: Nachricht[] };

async function KalenderAnsicht({ searchParams }: Pick<PageProps<"/dashboard">, "searchParams">) {
  // Beide Abfragen gleichzeitig starten statt nacheinander. Beide prüfen selbst den Login.
  const [termine, nachrichten, parameter] = await Promise.all([
    alleTermine(),
    alleNachrichten(),
    searchParams,
  ]);

  const heute = tagInBerlin(new Date());
  const gewaehlt = tagLesen(parameter.tag) ?? tagLesen(heute)!;
  const gewaehlterTag = tagText(gewaehlt.jahr, gewaehlt.monat, gewaehlt.tag);
  const { jahr, monat } = gewaehlt;

  // Alles nach Tagen einsortieren: "2026-11-03" -> { termine, nachrichten, wunsch }
  const proTag = new Map<string, TagInhalt>();
  const inhaltVon = (tag: string) => {
    if (!proTag.has(tag)) proTag.set(tag, { termine: [], nachrichten: [], wunsch: [] });
    return proTag.get(tag)!;
  };
  for (const termin of termine) inhaltVon(termin.tag).termine.push(termin);
  for (const nachricht of nachrichten) {
    inhaltVon(nachricht.eingegangenTag).nachrichten.push(nachricht);
    // Wunschtermine zeigen wir zusätzlich an dem Tag, den der Kunde sich wünscht
    if (nachricht.wunschDatum && nachricht.status !== "beantwortet") {
      inhaltVon(nachricht.wunschDatum).wunsch.push(nachricht);
    }
  }

  const tageAnzahl = tageImMonat(jahr, monat);
  const leer = leereFelderVorne(jahr, monat);
  const amTag = proTag.get(gewaehlterTag) ?? { termine: [], nachrichten: [], wunsch: [] };

  return (
    <>
      <Rueckblick termine={termine} nachrichten={nachrichten} heute={heute} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem]">
        {/* ── Monats-Raster ─────────────────────────────── */}
        <section className="karte p-3 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <Link
              href={`/dashboard?tag=${monatVerschieben(jahr, monat, -1)}`}
              className="knopf-leise"
              aria-label="Monat davor"
            >
              ←
            </Link>
            <h2 className="text-lg font-semibold capitalize sm:text-xl">{monatsName(jahr, monat)}</h2>
            <div className="flex gap-2">
              <Link href="/dashboard" className="knopf-leise">
                Heute
              </Link>
              <Link
                href={`/dashboard?tag=${monatVerschieben(jahr, monat, 1)}`}
                className="knopf-leise"
                aria-label="Monat danach"
              >
                →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {WOCHENTAGE_KURZ.map((name) => (
              <div key={name} className="pb-1 text-center text-xs font-medium text-gedaempft">
                {name}
              </div>
            ))}
            {Array.from({ length: leer }, (_, i) => (
              <div key={`leer-${i}`} />
            ))}
            {Array.from({ length: tageAnzahl }, (_, i) => {
              const tag = tagText(jahr, monat, i + 1);
              const inhalt = proTag.get(tag);
              const istHeute = tag === heute;
              const istGewaehlt = tag === gewaehlterTag;
              return (
                <Link
                  key={tag}
                  href={`/dashboard?tag=${tag}`}
                  scroll={false}
                  className={`flex min-h-14 flex-col rounded-lg border p-1.5 transition sm:min-h-24 sm:p-2 ${
                    istGewaehlt
                      ? "border-akzent bg-akzent/10"
                      : "border-rand hover:border-rand-hover"
                  }`}
                >
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-medium sm:text-sm ${
                      istHeute ? "bg-akzent text-hintergrund" : ""
                    }`}
                  >
                    {i + 1}
                  </span>
                  {inhalt && <TagPunkte inhalt={inhalt} />}
                </Link>
              );
            })}
          </div>

          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gedaempft">
            <Legende farbe="bg-akzent" text="Termin" />
            <Legende farbe="bg-fehler" text="Nachricht" />
            <Legende farbe="border border-dashed border-warnung" text="Wunschtermin" />
          </p>
        </section>

        {/* ── Der gewählte Tag ──────────────────────────── */}
        <section aria-live="polite">
          <h2 className="text-lg font-semibold">{langesDatum(gewaehlterTag)}</h2>
          {gewaehlterTag === heute && <p className="text-sm text-akzent">Heute</p>}

          <div className="mt-4 space-y-6">
            <TagAbschnitt titel="Termine" anzahl={amTag.termine.length} leer="Keine Termine.">
              {amTag.termine.map((termin) => (
                <TerminKarte key={termin.id} termin={termin} />
              ))}
            </TagAbschnitt>

            {amTag.wunsch.length > 0 && (
              <TagAbschnitt titel="Wunschtermine" anzahl={amTag.wunsch.length} leer="">
                {amTag.wunsch.map((nachricht) => (
                  <div
                    key={nachricht.id}
                    className="rounded-xl border border-dashed border-warnung/60 p-4 text-sm"
                  >
                    <p className="font-medium">
                      {nachricht.wunschZeit ? `${nachricht.wunschZeit} Uhr · ` : ""}
                      {nachricht.betreff}
                    </p>
                    <p className="text-gedaempft">
                      {nachricht.vorname} {nachricht.nachname} wünscht sich diesen Tag
                    </p>
                  </div>
                ))}
              </TagAbschnitt>
            )}

            <TagAbschnitt
              titel="Nachrichten"
              anzahl={amTag.nachrichten.length}
              leer="An diesem Tag kam keine Nachricht."
            >
              {amTag.nachrichten.map((nachricht) => (
                <NachrichtenKarte key={nachricht.id} nachricht={nachricht} />
              ))}
            </TagAbschnitt>
          </div>
        </section>
      </div>
    </>
  );
}

// Das kleine Recap ganz oben: was ist heute los, was ist liegen geblieben?
// Dafür braucht es keine KI, nur Zählen.
function Rueckblick({
  termine,
  nachrichten,
  heute,
}: {
  termine: Termin[];
  nachrichten: Nachricht[];
  heute: string;
}) {
  const termineHeute = termine.filter((t) => t.tag === heute && !t.erledigt).length;
  const neu = nachrichten.filter((n) => n.status === "neu").length;
  const unbeantwortet = nachrichten.filter((n) => n.status !== "beantwortet");
  const liegenGeblieben = unbeantwortet.filter((n) => n.eingegangenTag < heute);
  const wunschOffen = unbeantwortet.filter((n) => n.wunschDatum && n.wunschDatum >= heute).length;

  const zahlen = [
    { zahl: termineHeute, text: termineHeute === 1 ? "Termin heute" : "Termine heute" },
    { zahl: neu, text: neu === 1 ? "neue Nachricht" : "neue Nachrichten" },
    { zahl: liegenGeblieben.length, text: "liegen geblieben", warnung: true },
    { zahl: wunschOffen, text: wunschOffen === 1 ? "Wunschtermin offen" : "Wunschtermine offen" },
  ];

  return (
    <section>
      <p className="text-sm text-gedaempft">{langesDatum(heute)}</p>
      <h1 className="seitentitel">Willkommen zurück</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {zahlen.map(({ zahl, text, warnung }) => (
          <div
            key={text}
            className={`karte p-4 ${warnung && zahl > 0 ? "border-warnung/50" : ""}`}
          >
            <p className={`text-2xl font-semibold ${warnung && zahl > 0 ? "text-warnung" : ""}`}>
              {zahl}
            </p>
            <p className="text-sm text-gedaempft">{text}</p>
          </div>
        ))}
      </div>

      {liegenGeblieben.length > 0 && (
        <div className="mt-3 karte border-warnung/40 p-4">
          <h2 className="text-sm font-semibold">Noch nicht beantwortet</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {liegenGeblieben.slice(0, 5).map((n) => (
              <li key={n.id}>
                <Link
                  href={`/dashboard?tag=${n.eingegangenTag}`}
                  className="flex flex-wrap gap-x-2 hover:text-akzent"
                >
                  <span className="text-gedaempft">{n.eingegangen}</span>
                  <span>
                    {n.vorname} {n.nachname}: {n.betreff}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// Kleine Punkte im Tages-Kästchen. Am Handy nur Punkte, am großen Bildschirm mit Zahl.
function TagPunkte({ inhalt }: { inhalt: TagInhalt }) {
  const zeilen = [
    { anzahl: inhalt.termine.length, farbe: "bg-akzent", text: "Termin" },
    { anzahl: inhalt.nachrichten.length, farbe: "bg-fehler", text: "Nachr." },
    { anzahl: inhalt.wunsch.length, farbe: "border border-dashed border-warnung", text: "Wunsch" },
  ].filter((z) => z.anzahl > 0);

  return (
    <span className="mt-auto flex flex-wrap gap-1 sm:flex-col sm:gap-0.5">
      {zeilen.map((z) => (
        <span key={z.text} className="flex items-center gap-1 text-[11px] text-gedaempft">
          <span className={`size-2 shrink-0 rounded-full ${z.farbe}`} />
          <span className="hidden sm:inline">
            {z.anzahl} {z.text}
          </span>
        </span>
      ))}
    </span>
  );
}

function Legende({ farbe, text }: { farbe: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2.5 rounded-full ${farbe}`} />
      {text}
    </span>
  );
}

function TagAbschnitt({
  titel,
  anzahl,
  leer,
  children,
}: {
  titel: string;
  anzahl: number;
  leer: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gedaempft">
        {titel} {anzahl > 0 && `(${anzahl})`}
      </h3>
      {anzahl === 0 ? <p className="text-sm text-gedaempft">{leer}</p> : <div className="space-y-3">{children}</div>}
    </div>
  );
}

function KalenderPlatzhalter() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="karte h-20" />
        ))}
      </div>
      <div className="karte h-[28rem]" />
    </div>
  );
}

// Die Bereiche, die nicht an einem Tag hängen, als kleine Knöpfe unter dem Kalender
async function Schnellzugriff() {
  const angemeldet = await aktuellerBenutzer();
  if (!angemeldet) return null;

  const links = [
    { href: "/nachrichten", text: "Alle Nachrichten" },
    { href: "/termine", text: "Alle Termine" },
    ...(darfWebseiteBearbeiten(angemeldet) ? [{ href: "/webseite", text: "Webseite bearbeiten" }] : []),
    ...(istLadenInhaber(angemeldet)
      ? [
          { href: "/team", text: "Team" },
          { href: "/zugang", text: "Support-Zugang" },
        ]
      : []),
  ];

  return (
    <nav className="mt-10 flex flex-wrap gap-2 border-t border-rand pt-6">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="knopf-rand text-sm">
          {link.text}
        </Link>
      ))}
    </nav>
  );
}
