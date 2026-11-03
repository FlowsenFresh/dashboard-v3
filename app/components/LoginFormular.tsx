"use client";
import { useActionState } from "react";
import { anmelden, type LoginStatus } from "../login/actions";

export default function LoginFormular({ weiter }: { weiter: string }) {
  const [status, absenden, sendetGerade] = useActionState(anmelden, {} as LoginStatus);

  return (
    <form action={absenden} className="karte flex flex-col gap-3">
      {/* Wohin es nach dem Login geht, z. B. /nachrichten */}
      <input type="hidden" name="weiter" value={weiter} />

      <label className="flex flex-col gap-1 text-sm">
        E-Mail
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={status.email}
          className="eingabe"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Passwort
        <input
          name="passwort"
          type="password"
          autoComplete="current-password"
          required
          className="eingabe"
        />
      </label>

      {status.fehler && <p className="text-sm text-fehler">{status.fehler}</p>}

      <button className="knopf mt-2" disabled={sendetGerade}>
        {sendetGerade ? "Prüfe …" : "Anmelden"}
      </button>
    </form>
  );
}
