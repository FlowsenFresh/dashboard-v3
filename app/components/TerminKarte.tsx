import type { Termin } from "../lib/termine";

export default function TerminKarte({ termin }: { termin: Termin }) {
  return (
    <div className="bg-zinc-600 border rounded p-2">
      <div className="flex justify-between items-center">
        <span className="text-sm">
          # {termin.auftragsnummer} • {termin.datum}
        </span>
        {termin.erledigt ? (
          <span className="text-green-500 border rounded-full px-2 text-sm">erledigt</span>
        ) : (
          <span className="text-orange-500 border rounded-full px-2 text-sm">offen</span>
        )}
      </div>
      <h2 className="font-bold text-center text-xl p-2">{termin.titel}</h2>
      <div className="flex gap-1">
        <p>{termin.vorname}</p>
        <p>{termin.nachname}</p>
      </div>
      <p>{termin.telefon}</p>
      {termin.notiz && <div className="border-t p-2 mt-2">{termin.notiz}</div>}
    </div>
  );
}
