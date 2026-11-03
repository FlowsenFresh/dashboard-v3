"use client";
import { useActionState } from "react";
import { ladenOeffnen, type OeffnenStatus } from "@/app/(admin)/admin/actions";

type Props = { ladenId: number; zugangLaeuft: boolean };

// Auf jeder Laden-Karte im Admin-Bereich: Code eingeben und ins Dashboard.
// Läuft schon ein Zugang, reicht ein Klick.
export default function OeffnenFormular({ ladenId, zugangLaeuft }: Props) {
  const [status, oeffnen, oeffnetGerade] = useActionState<OeffnenStatus, FormData>(
    ladenOeffnen.bind(null, ladenId),
    {},
  );

  return (
    <form action={oeffnen} className="flex flex-col gap-2">
      <div className="flex gap-2">
        {!zugangLaeuft && (
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={7}
            placeholder="Code vom Inhaber"
            aria-label="Zugangscode"
            className="eingabe min-w-0 flex-1 tracking-widest"
          />
        )}
        <button disabled={oeffnetGerade} className="knopf shrink-0">
          {oeffnetGerade ? "Prüfe …" : "Dashboard öffnen"}
        </button>
      </div>
      {status.fehler && <p className="text-sm text-fehler">{status.fehler}</p>}
    </form>
  );
}
