import Link from "next/link";

// Die öffentliche Startseite unter "/". Jeder darf sie sehen (siehe proxy.ts).
// Sie stellt das Produkt vor. Das Dashboard selbst liegt jetzt unter /dashboard.
// Keine Datenbank, kein Cookie: die Seite ist komplett statisch und lädt sofort.

// Hier trägst du später deine Profile ein. Was hier steht, erscheint unten als Knopf.
// Beispiel für später: { name: "Instagram", href: "https://instagram.com/...", icon: "instagram" }
const PROFILE = [{ name: "GitHub", href: "https://github.com/FlowsenFresh", icon: "github" }] as const;

const DEMO_LAEDEN = [
  { slug: "radl-huber", name: "Radl Huber", art: "Fahrradwerkstatt" },
  { slug: "kfz-brandl", name: "KFZ Brandl", art: "Autowerkstatt" },
  { slug: "haarwerk-isar", name: "Haarwerk Isar", art: "Friseur" },
  { slug: "baeckerei-moser", name: "Bäckerei Moser", art: "Bäckerei" },
];

const FUNKTIONEN = [
  {
    titel: "Kalender als Zentrale",
    text: "Termine, Nachrichten und Wunschtermine auf einen Blick, Tag für Tag.",
  },
  {
    titel: "Eigene Webseite",
    text: "Jeder Laden bekommt eine schöne Seite und ändert Texte und Fotos direkt darauf.",
  },
  {
    titel: "Anfragen mit Struktur",
    text: "Kunden wählen ihr Anliegen aus. So ist sofort klar, worum es geht.",
  },
  {
    titel: "Team und Rechte",
    text: "Logins für Mitarbeiter, und der Inhaber bestimmt, wer was darf.",
  },
  {
    titel: "Daten in Deutschland",
    text: "Datenbank und Server stehen in Frankfurt. Alles bleibt in der EU.",
  },
  {
    titel: "Fürs Handy gemacht",
    text: "Dashboard und Laden-Seite funktionieren auf jedem Bildschirm.",
  },
];

export default function Startseite() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-rand">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="size-2.5 rounded-full bg-akzent" />
            Dashboard
          </Link>
          <Link href="/login" className="knopf-leise">
            Anmelden
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* ── Oben: worum geht es ─────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:pt-24">
          <p className="text-sm font-medium text-akzent">Für kleine Läden und Werkstätten</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Dein Laden. Deine Webseite. Ein Dashboard.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-gedaempft">
            Kunden schreiben dir über deine eigene Laden-Seite. Du siehst alles in einem Kalender:
            wer sich gemeldet hat, wer einen Termin möchte und was heute ansteht.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/laden/radl-huber" className="knopf-gross">
              Beispiel-Laden ansehen
            </Link>
            <Link href="/login" className="knopf-gross-rand">
              Zum Dashboard
            </Link>
          </div>
        </section>

        {/* ── Kleine Vorschau des Kalenders, nur aus CSS ───── */}
        <section className="mx-auto max-w-6xl px-4" aria-hidden="true">
          <div className="karte grid grid-cols-7 gap-1.5 p-4 sm:gap-2 sm:p-6">
            {Array.from({ length: 28 }, (_, i) => {
              const termin = [2, 5, 9, 15, 19, 23].includes(i);
              const nachricht = [1, 5, 11, 16, 22, 26].includes(i);
              const heute = i === 9;
              return (
                <div
                  key={i}
                  className={`flex h-12 flex-col justify-between rounded-lg border p-1.5 sm:h-20 ${
                    heute ? "border-akzent bg-akzent/10" : "border-rand"
                  }`}
                >
                  <span className="text-[10px] text-gedaempft sm:text-xs">{i + 1}</span>
                  <span className="flex gap-1">
                    {termin && <span className="size-2 rounded-full bg-akzent" />}
                    {nachricht && <span className="size-2 rounded-full bg-fehler" />}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Funktionen ──────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Was drin ist</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FUNKTIONEN.map((f) => (
              <div key={f.titel} className="karte">
                <h3 className="font-semibold">{f.titel}</h3>
                <p className="mt-1 text-sm text-gedaempft">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Beispiel-Läden ──────────────────────────────── */}
        <section className="border-y border-rand bg-band">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">Beispiel-Läden</h2>
            <p className="mt-1 text-gedaempft">Alle aus derselben Vorlage, jede sieht anders aus.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {DEMO_LAEDEN.map((laden) => (
                <Link key={laden.slug} href={`/laden/${laden.slug}`} className="karte-link">
                  <p className="font-semibold">{laden.name}</p>
                  <p className="text-sm text-gedaempft">{laden.art}</p>
                  <p className="mt-3 text-sm text-akzent">Seite ansehen →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-gedaempft">
        <p>Gebaut von Flo als erstes eigenes Projekt</p>
        <div className="flex gap-2">
          {PROFILE.map((profil) => (
            <a
              key={profil.name}
              href={profil.href}
              target="_blank"
              rel="noopener noreferrer"
              className="knopf-leise flex items-center gap-2"
            >
              {profil.icon === "github" && <GithubIcon />}
              {profil.name}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

// Das GitHub-Zeichen als SVG direkt im Code: kein extra Paket, keine fremde Seite wird geladen.
function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
