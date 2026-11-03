import { Suspense } from "react";
import { adminUebersicht, type LadenKarte } from "@/app/lib/adminUebersicht";
import OeffnenFormular from "@/app/components/OeffnenFormular";
import { uhrzeit } from "@/app/lib/zeit";

// Deine Startseite als admin: alle Läden auf einen Blick.
// Du siehst nur Zahlen. Ins Dashboard eines Ladens (mit Namen und Nachrichten) kommst du
// nur mit dem Code, den dir der Inhaber gibt.
export default function Admin() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <h1 className="text-4xl font-semibold tracking-tight">Deine Läden</h1>
      <p className="mt-3 text-lg text-gedaempft">
        Zahlen der letzten 30 Tage. Ins Dashboard eines Ladens kommst du mit dem Code vom Inhaber.
      </p>
      <Suspense fallback={<p className="mt-10 text-gedaempft">Lade Läden …</p>}>
        <Uebersicht />
      </Suspense>
    </main>
  );
}

async function Uebersicht() {
  const laeden = await adminUebersicht();
  const summe = (feld: "aufrufe30" | "rein30" | "raus30" | "offen") =>
    laeden.reduce((gesamt, laden) => gesamt + laden[feld], 0);

  return (
    <>
      {/* Die wichtigsten Zahlen über alle Läden. Nur Zahlen, keine Personendaten. */}
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Zahl titel="Aufrufe (30 Tage)" wert={summe("aufrufe30")} />
        <Zahl titel="Nachrichten rein (30 Tage)" wert={summe("rein30")} />
        <Zahl titel="Beantwortet (30 Tage)" wert={summe("raus30")} />
        <Zahl titel="Noch offen" wert={summe("offen")} hervorheben />
      </div>

      <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {laeden.map((laden) => (
          <li key={laden.id}>
            <Karte laden={laden} />
          </li>
        ))}
      </ul>
    </>
  );
}

function Zahl({
  titel,
  wert,
  hervorheben,
}: {
  titel: string;
  wert: number;
  hervorheben?: boolean;
}) {
  return (
    <div className="karte p-6">
      <p className="text-sm text-gedaempft">{titel}</p>
      <p className={`mt-1 text-4xl font-semibold ${hervorheben && wert > 0 ? "text-akzent" : ""}`}>
        {wert}
      </p>
    </div>
  );
}

function Karte({ laden }: { laden: LadenKarte }) {
  return (
    <div className="karte flex h-full flex-col gap-5 p-6">
      <div className="flex items-start gap-3">
        <span
          className="mt-1.5 size-3 shrink-0 rounded-full"
          style={{ backgroundColor: laden.farbe ?? "var(--color-akzent)" }}
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{laden.name}</h2>
          <p className="text-gedaempft">{laden.branche || "Branche fehlt noch"}</p>
        </div>
        <a
          href={`/laden/${laden.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="knopf-leise shrink-0"
        >
          Webseite ↗
        </a>
      </div>

      <dl className="grid grid-cols-4 gap-2 text-center">
        <KleineZahl titel="Aufrufe" wert={laden.aufrufe30} />
        <KleineZahl titel="Rein" wert={laden.rein30} />
        <KleineZahl titel="Raus" wert={laden.raus30} />
        <KleineZahl titel="Offen" wert={laden.offen} hervorheben />
      </dl>

      <div className="mt-auto border-t border-rand pt-5">
        {laden.zugriffBis ? (
          <p className="mb-3 text-sm text-erfolg">
            Zugang läuft bis {uhrzeit(laden.zugriffBis)} Uhr
          </p>
        ) : (
          <p className="mb-3 text-sm text-gedaempft">
            Fürs Dashboard brauchst du einen Code vom Inhaber.
          </p>
        )}
        <OeffnenFormular ladenId={laden.id} zugangLaeuft={laden.zugriffBis !== null} />
      </div>
    </div>
  );
}

function KleineZahl({
  titel,
  wert,
  hervorheben,
}: {
  titel: string;
  wert: number;
  hervorheben?: boolean;
}) {
  return (
    <div className="rounded-lg bg-hintergrund px-2 py-3">
      <dd className={`text-xl font-semibold ${hervorheben && wert > 0 ? "text-akzent" : ""}`}>
        {wert}
      </dd>
      <dt className="text-xs text-gedaempft">{titel}</dt>
    </div>
  );
}
