"use client";
import { useActionState } from "react";
import { nachrichtSenden, type FormularStatus } from "../laden/[slug]/actions";

const startStatus: FormularStatus = { ok: false, meldung: "" };

const feld = "w-full rounded border bg-zinc-800 p-2";

export default function KontaktFormular({ slug }: { slug: string }) {
  // bind hängt den Laden-Slug als ersten Parameter an die Action
  const [status, absenden, sendetGerade] = useActionState(
    nachrichtSenden.bind(null, slug),
    startStatus,
  );

  if (status.ok) {
    return (
      <p className="rounded border border-green-500 p-4 text-center text-green-400">
        {status.meldung}
      </p>
    );
  }

  return (
    <form action={absenden} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="vorname" placeholder="Vorname *" required className={feld} />
        <input name="nachname" placeholder="Nachname *" required className={feld} />
        <input name="email" type="email" placeholder="E-Mail" className={feld} />
        <input name="telefon" type="tel" placeholder="Telefon" className={feld} />
      </div>
      <input name="betreff" placeholder="Betreff *" required className={feld} />
      <textarea
        name="inhalt"
        placeholder="Deine Nachricht"
        rows={4}
        maxLength={2000}
        className={feld}
      />

      {status.meldung && <p className="text-red-400">{status.meldung}</p>}

      <button
        disabled={sendetGerade}
        className="rounded-xl border p-2 hover:bg-zinc-700 disabled:opacity-50"
      >
        {sendetGerade ? "Wird gesendet …" : "Nachricht senden"}
      </button>
    </form>
  );
}
