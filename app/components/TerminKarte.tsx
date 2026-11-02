import type { Termin } from "../lib/termine";
import StatusMarke from "./StatusMarke";

export default function TerminKarte({ termin }: { termin: Termin }) {
  return (
    <article className="karte flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gedaempft">
          #{termin.auftragsnummer} · {termin.datum}
        </span>
        {termin.erledigt ? (
          <StatusMarke text="erledigt" farbe="gruen" />
        ) : (
          <StatusMarke text="offen" farbe="gelb" />
        )}
      </div>

      <div>
        <h2 className="font-semibold">{termin.titel}</h2>
        <p className="text-sm text-gedaempft">
          {termin.vorname} {termin.nachname} · {termin.telefon}
        </p>
      </div>

      {termin.notiz && <p className="mt-auto border-t border-rand pt-3 text-sm">{termin.notiz}</p>}
    </article>
  );
}
