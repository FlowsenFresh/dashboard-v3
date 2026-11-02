import type { Nachricht } from "../lib/nachrichten";
import { statusAendern } from "../nachrichten/actions";
import StatusMarke from "./StatusMarke";

const statusFarbe = {
  neu: "rot",
  gelesen: "gelb",
  beantwortet: "gruen",
} as const;

// Kein "use client" und kein useState: der Status kommt vom Server.
// Der Knopf schickt ein Formular an die Server Action, die speichert dauerhaft.
export default function NachrichtenKarte({ nachricht }: { nachricht: Nachricht }) {
  const status = nachricht.status;

  return (
    <article className="karte flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gedaempft">{nachricht.eingegangen}</span>
        <StatusMarke text={status} farbe={statusFarbe[status]} />
      </div>

      <div>
        {nachricht.anliegen && nachricht.anliegen !== nachricht.betreff && (
          <p className="text-xs font-medium text-akzent">{nachricht.anliegen}</p>
        )}
        <h2 className="font-semibold">{nachricht.betreff}</h2>
        <p className="text-sm text-gedaempft">
          {nachricht.vorname} {nachricht.nachname}
        </p>
      </div>

      {nachricht.inhalt && <p className="text-sm">{nachricht.inhalt}</p>}

      <dl className="mt-auto space-y-1 text-sm text-gedaempft">
        {nachricht.email && <dd>{nachricht.email}</dd>}
        {nachricht.telefon && <dd>{nachricht.telefon}</dd>}
        {nachricht.wunschDatum && (
          <dd>
            Wunschtermin: {nachricht.wunschDatum} {nachricht.wunschZeit}
          </dd>
        )}
      </dl>

      {status === "neu" && (
        <form action={statusAendern.bind(null, nachricht.id, "gelesen")}>
          <button className="knopf-leise">Als gelesen markieren</button>
        </form>
      )}
    </article>
  );
}
