"use client";
import { useActionState } from "react";
import { nachrichtSenden, type FormularStatus } from "../laden/[slug]/actions";

const startStatus: FormularStatus = { ok: false, meldung: "" };

const feld = "eingabe";

export default function KontaktFormular({ slug }: { slug: string }) {
  // bind hängt den Laden-Slug als ersten Parameter an die Action
  const [status, absenden, sendetGerade] = useActionState(
    nachrichtSenden.bind(null, slug),
    startStatus,
  );

  if (status.ok) {
    return (
      <p className="rounded-lg bg-emerald-500/10 p-4 text-center text-emerald-400">
        {status.meldung}
      </p>
    );
  }

  return (
    <form action={absenden} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="vorname"
          defaultValue={status.werte?.vorname}
          placeholder="Vorname *"
          required
          className={feld}
        />
        <input
          name="nachname"
          defaultValue={status.werte?.nachname}
          placeholder="Nachname *"
          required
          className={feld}
        />
        <input
          name="email"
          defaultValue={status.werte?.email}
          type="email"
          placeholder="E-Mail"
          className={feld}
        />
        <input
          name="telefon"
          defaultValue={status.werte?.telefon}
          type="tel"
          placeholder="Telefon"
          className={feld}
        />
      </div>
      <input
        name="betreff"
        defaultValue={status.werte?.betreff}
        placeholder="Betreff *"
        required
        className={feld}
      />
      <textarea
        name="inhalt"
        defaultValue={status.werte?.inhalt}
        placeholder="Deine Nachricht"
        rows={4}
        maxLength={2000}
        className={feld}
      />

      {status.meldung && <p className="text-sm text-red-400">{status.meldung}</p>}

      <button disabled={sendetGerade} className="knopf self-start">
        {sendetGerade ? "Wird gesendet …" : "Nachricht senden"}
      </button>
    </form>
  );
}
