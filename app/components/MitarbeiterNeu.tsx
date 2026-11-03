"use client";
import { useActionState } from "react";
import { mitarbeiterHinzufuegen, type PasswortStatus } from "@/app/(dashboard)/team/actions";
import PasswortAnzeige from "./PasswortAnzeige";

// Formular "Mitarbeiter hinzufügen". Das Passwort erzeugt der Server, nicht der Inhaber:
// so ist es sicher lang genug und zufällig.
export default function MitarbeiterNeu() {
  const [status, anlegen, legtGeradeAn] = useActionState<PasswortStatus, FormData>(
    mitarbeiterHinzufuegen,
    {},
  );

  return (
    <form action={anlegen} className="flex flex-col gap-3">
      <h2 className="font-semibold">Mitarbeiter hinzufügen</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          E-Mail
          <input name="email" type="email" required autoComplete="off" className="eingabe" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Name (freiwillig)
          <input name="name" maxLength={60} placeholder="z. B. Anna" className="eingabe" />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="darfWebseite" type="checkbox" className="size-4 accent-akzent" />
        Darf die Webseite bearbeiten
      </label>

      {status.fehler && <p className="text-sm text-fehler">{status.fehler}</p>}
      {status.passwort && <PasswortAnzeige email={status.email} passwort={status.passwort} />}

      <button disabled={legtGeradeAn} className="knopf self-start">
        {legtGeradeAn ? "Lege an …" : "Login anlegen"}
      </button>
    </form>
  );
}
