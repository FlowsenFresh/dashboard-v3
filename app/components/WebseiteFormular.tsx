"use client";
import { useActionState, useState, type ReactNode } from "react";
// "import type" holt nur die Typen. Der Datenbank-Code aus laeden.ts kommt so nicht in den Browser.
import type { Laden, LadenInhalt, Leistung, Oeffnungszeit } from "@/app/lib/laeden";
import { webseiteSpeichern, type SpeichernStatus } from "@/app/(dashboard)/webseite/actions";

const startStatus: SpeichernStatus = { ok: false, meldung: "" };
const STANDARD_FARBE = "#10b981"; // unser Türkis-Grün, wie in globals.css

// Ein Eingabefeld mit Beschriftung darüber
function Feld({
  titel,
  hinweis,
  children,
}: {
  titel: string;
  hinweis?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium">{titel}</span>
      {children}
      {hinweis && <span className="text-xs text-gedaempft">{hinweis}</span>}
    </label>
  );
}

// Ein Kasten pro Abschnitt der Webseite
function Block({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <fieldset className="karte flex flex-col gap-4">
      <legend className="sr-only">{titel}</legend>
      <h2 className="text-lg font-semibold">{titel}</h2>
      {children}
    </fieldset>
  );
}

// Eine Zeile pro Eintrag <-> Liste. Leere Zeilen fallen weg.
const zuZeilen = (liste: string[]) => liste.join("\n");
const zuListe = (text: string) =>
  text
    .split("\n")
    .map((zeile) => zeile.trim())
    .filter(Boolean);

export default function WebseiteFormular({ laden }: { laden: Laden }) {
  const [status, speichern, speichertGerade] = useActionState(webseiteSpeichern, startStatus);

  // Alles, was man bearbeiten kann, liegt hier im Zustand (State).
  // Beim Speichern schicken wir es als JSON an den Server.
  const [inhalt, setInhalt] = useState<LadenInhalt>(laden);
  // Listen mit einer Zeile pro Eintrag tippen wir als Text, sonst verschwindet die neue leere Zeile
  const [anliegenText, setAnliegenText] = useState(zuZeilen(laden.anliegen));
  const [faktenText, setFaktenText] = useState(zuZeilen(laden.ueberUns?.fakten ?? []));
  const [ueberUnsText, setUeberUnsText] = useState(laden.ueberUns?.text ?? "");

  // Ein Feld ändern, der Rest bleibt gleich
  function setze<K extends keyof LadenInhalt>(feld: K, wert: LadenInhalt[K]) {
    setInhalt((vorher) => ({ ...vorher, [feld]: wert }));
  }

  function leistungAendern(index: number, neu: Partial<Leistung>) {
    setze(
      "leistungen",
      inhalt.leistungen.map((l, i) => (i === index ? { ...l, ...neu } : l)),
    );
  }

  function zeitAendern(index: number, neu: Partial<Oeffnungszeit>) {
    setze(
      "oeffnungszeiten",
      inhalt.oeffnungszeiten.map((z, i) => (i === index ? { ...z, ...neu } : z)),
    );
  }

  const daten = JSON.stringify({
    ...inhalt,
    anliegen: zuListe(anliegenText),
    ueberUns: { text: ueberUnsText, fakten: zuListe(faktenText) },
  });

  return (
    <form action={speichern} className="flex flex-col gap-6">
      <input type="hidden" name="daten" value={daten} />

      <a
        href={`/laden/${laden.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="knopf-rand self-start text-sm"
      >
        Seite ansehen ↗
      </a>

      <Block titel="Oben auf der Seite">
        <Feld titel="Name des Ladens">
          <input
            value={inhalt.name}
            onChange={(e) => setze("name", e.target.value)}
            required
            className="eingabe"
          />
        </Feld>
        <div className="grid gap-4 sm:grid-cols-2">
          <Feld titel="Branche" hinweis="z. B. Fahrradwerkstatt">
            <input
              value={inhalt.branche}
              onChange={(e) => setze("branche", e.target.value)}
              className="eingabe"
            />
          </Feld>
          <Feld titel="Slogan">
            <input
              value={inhalt.slogan}
              onChange={(e) => setze("slogan", e.target.value)}
              className="eingabe"
            />
          </Feld>
        </div>
        <Feld titel="Kurze Beschreibung" hinweis="Ein, zwei Sätze unter dem Namen">
          <textarea
            value={inhalt.beschreibung}
            onChange={(e) => setze("beschreibung", e.target.value)}
            rows={3}
            className="eingabe"
          />
        </Feld>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inhalt.farbe !== null}
              onChange={(e) => setze("farbe", e.target.checked ? STANDARD_FARBE : null)}
              className="size-4 accent-akzent"
            />
            Eigene Farbe
          </label>
          {inhalt.farbe !== null && (
            <input
              type="color"
              value={inhalt.farbe}
              onChange={(e) => setze("farbe", e.target.value)}
              className="h-9 w-16 cursor-pointer rounded border border-rand bg-hintergrund"
            />
          )}
          <span className="text-xs text-gedaempft">
            Am besten eine helle Farbe, die Schrift auf Knöpfen ist dunkel.
          </span>
        </div>
      </Block>

      <Block titel="Leistungen">
        {inhalt.leistungen.map((leistung, index) => (
          // Index als key ist hier ok: Einträge werden nur hinten angehängt oder gelöscht
          <div key={index} className="flex flex-col gap-2 rounded-lg border border-rand p-3">
            <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
              <input
                value={leistung.titel}
                onChange={(e) => leistungAendern(index, { titel: e.target.value })}
                placeholder="Titel, z. B. Inspektion"
                className="eingabe"
              />
              <input
                value={leistung.preis ?? ""}
                onChange={(e) => leistungAendern(index, { preis: e.target.value })}
                placeholder="Preis (optional)"
                className="eingabe"
              />
            </div>
            <textarea
              value={leistung.text}
              onChange={(e) => leistungAendern(index, { text: e.target.value })}
              placeholder="Kurz beschreiben"
              rows={2}
              className="eingabe"
            />
            <button
              type="button"
              onClick={() =>
                setze(
                  "leistungen",
                  inhalt.leistungen.filter((_, i) => i !== index),
                )
              }
              className="self-end text-sm text-gedaempft hover:text-fehler"
            >
              entfernen
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setze("leistungen", [...inhalt.leistungen, { titel: "", text: "" }])}
          className="knopf-leise self-start"
        >
          + Leistung
        </button>
      </Block>

      <Block titel="Über uns (optional)">
        <Feld titel="Text" hinweis="Leer lassen, dann gibt es den Abschnitt nicht">
          <textarea
            value={ueberUnsText}
            onChange={(e) => setUeberUnsText(e.target.value)}
            rows={3}
            className="eingabe"
          />
        </Feld>
        <Feld titel="Kurze Fakten" hinweis="Eine pro Zeile, z. B. Seit 1998, Meisterbetrieb">
          <textarea
            value={faktenText}
            onChange={(e) => setFaktenText(e.target.value)}
            rows={3}
            className="eingabe"
          />
        </Feld>
      </Block>

      <Block titel="Öffnungszeiten">
        {inhalt.oeffnungszeiten.map((zeit, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={zeit.tage}
              onChange={(e) => zeitAendern(index, { tage: e.target.value })}
              placeholder="Mo–Fr"
              className="eingabe"
            />
            <input
              value={zeit.zeit}
              onChange={(e) => zeitAendern(index, { zeit: e.target.value })}
              placeholder="9–18 Uhr oder geschlossen"
              className="eingabe"
            />
            <button
              type="button"
              onClick={() =>
                setze(
                  "oeffnungszeiten",
                  inhalt.oeffnungszeiten.filter((_, i) => i !== index),
                )
              }
              aria-label="Zeile entfernen"
              className="px-2 text-gedaempft hover:text-fehler"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setze("oeffnungszeiten", [...inhalt.oeffnungszeiten, { tage: "", zeit: "" }])
          }
          className="knopf-leise self-start"
        >
          + Zeile
        </button>
        <Feld titel="Hinweis (optional)" hinweis="z. B. Im Frühjahr lieber vorher anrufen">
          <input
            value={inhalt.hinweisZeiten ?? ""}
            onChange={(e) => setze("hinweisZeiten", e.target.value)}
            className="eingabe"
          />
        </Feld>
      </Block>

      <Block titel="Adresse & Kontakt">
        <div className="grid gap-4 sm:grid-cols-2">
          <Feld titel="Straße und Hausnummer">
            <input
              value={inhalt.strasse}
              onChange={(e) => setze("strasse", e.target.value)}
              className="eingabe"
            />
          </Feld>
          <Feld titel="PLZ und Ort">
            <input
              value={inhalt.plzOrt}
              onChange={(e) => setze("plzOrt", e.target.value)}
              className="eingabe"
            />
          </Feld>
          <Feld titel="Telefon">
            <input
              type="tel"
              value={inhalt.telefon}
              onChange={(e) => setze("telefon", e.target.value)}
              className="eingabe"
            />
          </Feld>
          <Feld titel="E-Mail (optional)">
            <input
              type="email"
              value={inhalt.email ?? ""}
              onChange={(e) => setze("email", e.target.value)}
              className="eingabe"
            />
          </Feld>
        </div>
      </Block>

      <Block titel="Kontaktformular">
        <Feld
          titel="Anliegen zur Auswahl"
          hinweis="Eins pro Zeile. Kunden wählen daraus, worum es geht."
        >
          <textarea
            value={anliegenText}
            onChange={(e) => setAnliegenText(e.target.value)}
            rows={5}
            className="eingabe"
          />
        </Feld>
      </Block>

      {/* Bleibt unten am Bildschirm kleben, damit man nicht erst runterscrollen muss */}
      <div className="sticky bottom-0 -mx-4 flex items-center gap-4 border-t border-rand bg-hintergrund/90 px-4 py-3 backdrop-blur">
        <button disabled={speichertGerade} className="knopf">
          {speichertGerade ? "Wird gespeichert …" : "Speichern"}
        </button>
        {status.meldung && (
          <p className={`text-sm ${status.ok ? "text-erfolg" : "text-fehler"}`}>{status.meldung}</p>
        )}
      </div>
    </form>
  );
}
