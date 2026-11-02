"use client";
import { useActionState, useState } from "react";
import { nachrichtSenden, type FormularStatus } from "../laden/[slug]/actions";

const startStatus: FormularStatus = { ok: false, meldung: "" };

type Props = { slug: string; anliegen: string[] };

export default function KontaktFormular({ slug, anliegen }: Props) {
  // bind hängt den Laden-Slug als ersten Parameter an die Action
  const [status, absenden, sendetGerade] = useActionState(
    nachrichtSenden.bind(null, slug),
    startStatus,
  );
  // Schritt 1: Anliegen wählen. Solange null, zeigen wir nur die Auswahl.
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);

  if (status.ok) {
    return <p className="rounded-lg bg-erfolg/10 p-4 text-center text-erfolg">{status.meldung}</p>;
  }

  // Nach einem Fehler steht das Anliegen in status.werte, dann bleibt Schritt 2 offen
  const aktuell = gewaehlt ?? status.werte?.anliegen ?? null;

  if (!aktuell) {
    return (
      <div>
        <p className="mb-3 text-sm text-gedaempft">Schritt 1 von 2: Worum geht es?</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {anliegen.map((eintrag) => (
            <button
              key={eintrag}
              type="button"
              onClick={() => setGewaehlt(eintrag)}
              className="auswahl"
            >
              {eintrag}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form action={absenden} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gedaempft">
          Schritt 2 von 2: <span className="font-medium text-akzent">{aktuell}</span>
        </p>
        <button
          type="button"
          onClick={() => setGewaehlt(null)}
          className="text-sm text-gedaempft underline-offset-4 hover:text-schrift hover:underline"
        >
          ändern
        </button>
      </div>

      {/* Unsichtbares Feld: so kommt das gewählte Anliegen mit in die formData */}
      <input type="hidden" name="anliegen" value={aktuell} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="vorname"
          defaultValue={status.werte?.vorname}
          placeholder="Vorname *"
          required
          className="eingabe"
        />
        <input
          name="nachname"
          defaultValue={status.werte?.nachname}
          placeholder="Nachname *"
          required
          className="eingabe"
        />
        <input
          name="email"
          defaultValue={status.werte?.email}
          type="email"
          placeholder="E-Mail"
          className="eingabe"
        />
        <input
          name="telefon"
          defaultValue={status.werte?.telefon}
          type="tel"
          placeholder="Telefon"
          className="eingabe"
        />
      </div>
      <input
        name="betreff"
        defaultValue={status.werte?.betreff}
        placeholder="Kurz worum es geht (optional)"
        className="eingabe"
      />
      <textarea
        name="inhalt"
        defaultValue={status.werte?.inhalt}
        placeholder="Deine Nachricht"
        rows={4}
        maxLength={2000}
        className="eingabe"
      />

      {status.meldung && <p className="text-sm text-fehler">{status.meldung}</p>}

      <button disabled={sendetGerade} className="knopf self-start">
        {sendetGerade ? "Wird gesendet …" : "Nachricht senden"}
      </button>
    </form>
  );
}
