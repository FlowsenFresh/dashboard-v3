import { Suspense } from "react";
import CodeErzeugen from "@/app/components/CodeErzeugen";
import { laufenderZugriff, zugangsProtokoll } from "@/app/lib/freigaben";
import { benutzerPflicht } from "@/app/lib/sitzung";
import { datumUndUhrzeit, uhrzeit } from "@/app/lib/zeit";
import { zugangSofortBeenden } from "./actions";

// Für den Ladeninhaber: Support-Zugang für Flo freigeben, beenden und nachsehen.
export default function Zugang() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="seitentitel">Support-Zugang</h1>
      <p className="mt-2 text-gedaempft">
        Dein Dashboard mit Nachrichten und Terminen sieht nur du. Brauchst du Hilfe, erzeugst du
        hier einen Code und sagst ihn uns. Damit haben wir für 2 Stunden Zugang, danach ist
        automatisch Schluss.
      </p>
      <Suspense fallback={<p className="mt-8 text-gedaempft">Lade …</p>}>
        <Inhalt />
      </Suspense>
    </main>
  );
}

async function Inhalt() {
  const angemeldet = await benutzerPflicht();
  if (angemeldet.rolle !== "laden" || angemeldet.ladenId === null) {
    return (
      <p className="karte mt-8 text-gedaempft">
        Diese Seite ist für den Inhaber des Ladens. Nur er kann Zugang geben.
      </p>
    );
  }

  const [laeuftBis, protokoll] = await Promise.all([
    laufenderZugriff(angemeldet.ladenId),
    zugangsProtokoll(angemeldet.ladenId),
  ]);

  return (
    <div className="mt-8 flex flex-col gap-6">
      {laeuftBis ? (
        <div className="karte flex flex-wrap items-center justify-between gap-4 border-akzent/40">
          <p>
            <span className="font-semibold text-akzent">Zugang läuft</span> bis {uhrzeit(laeuftBis)}{" "}
            Uhr.
          </p>
          <form action={zugangSofortBeenden}>
            <button className="knopf-rand">Jetzt beenden</button>
          </form>
        </div>
      ) : (
        <div className="karte">
          <CodeErzeugen />
        </div>
      )}

      <div className="karte">
        <h2 className="mb-3 font-semibold">Wann wir Zugang hatten</h2>
        {protokoll.length === 0 ? (
          <p className="text-sm text-gedaempft">Noch nie.</p>
        ) : (
          <ul className="divide-y divide-rand text-sm">
            {protokoll.map((eintrag) => (
              <li key={eintrag.von.toISOString()} className="flex justify-between gap-4 py-2">
                <span>{datumUndUhrzeit(eintrag.von)}</span>
                <span className="text-gedaempft">
                  {eintrag.beendet
                    ? `von dir beendet um ${uhrzeit(eintrag.beendet)} Uhr`
                    : `bis ${uhrzeit(eintrag.bis)} Uhr`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
