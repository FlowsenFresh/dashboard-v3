"use client";
import { useActionState } from "react";
import { neuerCode, type CodeStatus } from "@/app/(dashboard)/zugang/actions";

// Knopf "Zugangscode erzeugen". Danach steht der Code groß da, damit man ihn vorlesen kann.
export default function CodeErzeugen() {
  const [status, erzeugen, erzeugtGerade] = useActionState<CodeStatus>(neuerCode, {});

  return (
    <form action={erzeugen} className="flex flex-col gap-4">
      {status.code ? (
        <div>
          <p className="text-sm text-gedaempft">Sag uns diesen Code:</p>
          {/* Leerzeichen in der Mitte, dann liest man ihn leichter vor: 482 913 */}
          <p className="mt-1 font-mono text-5xl font-semibold tracking-widest text-akzent">
            {status.code.slice(0, 3)} {status.code.slice(3)}
          </p>
          <p className="mt-2 text-sm text-gedaempft">Gültig bis {status.gueltigBis} Uhr.</p>
        </div>
      ) : (
        <p className="text-gedaempft">Gerade hat niemand Zugang zu deinem Dashboard.</p>
      )}
      {status.fehler && <p className="text-sm text-fehler">{status.fehler}</p>}
      <button disabled={erzeugtGerade} className="knopf self-start">
        {status.code ? "Neuen Code erzeugen" : "Zugangscode erzeugen"}
      </button>
    </form>
  );
}
