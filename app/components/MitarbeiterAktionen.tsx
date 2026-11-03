"use client";
import { useActionState } from "react";
import { entfernen, neuesPasswort, type PasswortStatus } from "@/app/(dashboard)/team/actions";
import PasswortAnzeige from "./PasswortAnzeige";

// Knöpfe pro Mitarbeiter, die etwas zurückgeben (neues Passwort) oder nachfragen (entfernen)
export default function MitarbeiterAktionen({ id, email }: { id: number; email: string }) {
  const [status, zuruecksetzen, setztGerade] = useActionState<PasswortStatus>(
    neuesPasswort.bind(null, id),
    {},
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <form action={zuruecksetzen}>
          <button disabled={setztGerade} className="knopf-leise">
            Neues Passwort
          </button>
        </form>
        <form
          action={entfernen.bind(null, id)}
          // Nachfragen, bevor ein Login wirklich weg ist
          onSubmit={(e) => {
            if (!confirm(`Login von ${email} wirklich entfernen?`)) e.preventDefault();
          }}
        >
          <button className="knopf-leise hover:border-fehler hover:text-fehler">Entfernen</button>
        </form>
      </div>
      {status.fehler && <p className="text-sm text-fehler">{status.fehler}</p>}
      {status.passwort && <PasswortAnzeige passwort={status.passwort} />}
    </div>
  );
}
