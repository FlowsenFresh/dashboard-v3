# 1. Architektur: der Überblick

## Die Technik

| Baustein                    | Wofür                                                | Wo im Code                   |
| --------------------------- | ---------------------------------------------------- | ---------------------------- |
| **Next.js 16** (App Router) | Seiten, Server Actions, Login-Vorprüfung             | `app/`, `proxy.ts`           |
| **React 19**                | Die Oberfläche                                       | `app/components/`            |
| **Tailwind CSS 4**          | Aussehen, mit eigenen Farben (Design-Tokens)         | `app/globals.css`            |
| **Zod**                     | Prüft Formulardaten auf dem Server                   | `app/lib/nachrichtSchema.ts` |
| **Drizzle ORM**             | Tabellen in TypeScript beschreiben und abfragen      | `app/lib/db/`                |
| **Neon**                    | Postgres-Datenbank in Frankfurt (`aws-eu-central-1`) | Adresse in `.env.local`      |
| **vp** (vite-plus)          | Befehle starten, z. B. `vp run dev`                  | `package.json`               |

Wichtig: Next.js 16 ist neuer als vieles, was man im Internet findet. Zum Beispiel heißt die
Datei für die Vorprüfung jetzt `proxy.ts` (früher `middleware.ts`). Siehe `AGENTS.md`.

## Eine App, mehrere Bereiche

```
/laden/[slug]   öffentlich   Laden-Seite mit Kontaktformular (z. B. /laden/radl-huber)
/login          öffentlich   Anmelden
/               Login nötig  Startseite mit Links zu Termine und Nachrichten
/nachrichten    Login nötig  Anfragen von der Laden-Seite, Status neu/gelesen/beantwortet
/termine        Login nötig  Aufträge und was ansteht
/webseite       Login nötig  Prüft das Recht und öffnet die Laden-Seite im Doppelklick-Modus
/team           Login nötig  Inhaber: Logins für Mitarbeiter, wer die Webseite bearbeiten darf
/zugang         Login nötig  Inhaber: Zugangscode für Flo erzeugen, Zugang beenden
/admin          nur admin    Alle Läden mit Zahlen, Dashboard nur mit Code öffnen
```

Alles außer `/laden/...` und `/login` braucht einen Login (siehe [03-login.md](03-login.md)).

## Ordner

```
app/
  layout.tsx      Rahmen für alle Seiten (html, Schrift)
  laden/[slug]/   page.tsx (das Template), actions.ts (Formular absenden)
    _teile/       Abschnitte der Laden-Seite: Kopf, Held, Leistungen, Über uns, ...
  (dashboard)/    Route Group: alles mit Kopfzeile. Die Klammern stehen NICHT in der URL.
    layout.tsx    Hängt die Kopfzeile an alle Dashboard-Seiten
    page.tsx      Startseite
    nachrichten/  page.tsx, actions.ts (Status ändern)
    termine/      page.tsx
    webseite/     page.tsx (leitet zur Laden-Seite mit ?bearbeiten weiter)
    team/         page.tsx, actions.ts (Inhaber verwaltet Mitarbeiter)
    zugang/       page.tsx, actions.ts (Inhaber erzeugt Zugangscode für Flo)
    login/        page.tsx, actions.ts (anmelden, abmelden)
  (admin)/        Route Group: Flos Admin-Bereich mit eigener Kopfzeile
    admin/        page.tsx (alle Läden mit Zahlen), actions.ts (Laden mit Code öffnen)
  components/     Karten, Formulare, Kopfzeile, MitarbeiterNeu, OeffnenFormular, CodeErzeugen
  lib/
    db/           schema.ts (Tabellen), index.ts (Verbindung zu Neon)
    sitzung.ts    Wer ist angemeldet? Welcher Laden ist sichtbar?
    passwort.ts   Passwörter hashen und prüfen
    nachrichtenSpeicher.ts, termineSpeicher.ts   Lesen und Schreiben in Neon
    nachrichtSchema.ts   Zod-Regeln fürs Formular
    laeden.ts     Laden-Inhalte aus der Datenbank lesen (mit Cache)
    ladenSchema.ts   Zod-Regeln fürs CMS-Formular
drizzle/          SQL-Dateien (Migrationen) 0000_start ... 0003_laden_inhalt
scripts/          seed.ts + beispielLaeden.ts (Beispieldaten), benutzer-anlegen.ts (Login anlegen)
proxy.ts          Läuft vor jeder Seite: ohne Cookie zu /login
```

## Design-Tokens in `globals.css`

Alle Farben der App stehen an **einer** Stelle in `app/globals.css` im Block `@theme`.
Die Standardfarben von Tailwind sind mit `--color-*: initial;` abgeschaltet. So kann niemand
aus Versehen eine fremde Farbe benutzen.

- Grautöne: `hintergrund`, `flaeche`, `rand`, `gedaempft`, `schrift` ...
- Marke: `akzent` (#10b981, Türkis-Grün) und `akzent-hell`
- Status: `erfolg`, `warnung`, `fehler`

Im Code schreibt man dann z. B. `bg-flaeche` oder `text-akzent`. Farbe ändern heißt: nur dort ändern.

Dazu gibt es **Bausteine** mit `@utility`: `karte`, `karte-link`, `eingabe`, `knopf`, `knopf-leise`
und weitere. Statt zehn Klassen schreibt man `className="knopf"`.

## Datenbank (Multi-Tenant)

"Multi-Tenant" heißt: viele Läden (Mandanten) teilen sich eine App und eine Datenbank,
aber jeder sieht nur seine eigenen Daten. Darum hat fast jede Tabelle eine Spalte `laden_id`.

| Tabelle       | Inhalt                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `laeden`      | Ein Eintrag pro Laden: `slug`, `name`, alle Inhalte der Webseite, `termine_aufbewahren_monate` |
| `kontakte`    | Personendaten (Vorname, Nachname, E-Mail, Telefon), getrennt von den Nachrichten               |
| `nachrichten` | Anliegen, Betreff, Inhalt, Status, Eingangszeit, gehört zu Kontakt und Laden                   |
| `termine`     | Auftragsnummer, Datum, Titel, Notiz, erledigt                                                  |
| `benutzer`    | Logins: E-Mail, Passwort-Hash, Rolle, `laden_id`                                               |
| `sitzungen`   | Eine Zeile pro Anmeldung, dazu `ansicht_laden_id` für den admin                                |

Warum Kontakte getrennt? Schreibt jemand zweimal, gibt es nur einen Kontakt. Und beim Löschen
sieht man genau, wo Namen liegen.

Seit PR #10 stehen auch alle Inhalte der Laden-Seite in `laeden` (Slogan, Leistungen,
Öffnungszeiten, Telefon ...). Wie das Template und das CMS funktionieren, steht in
[08-laden-template-und-cms.md](08-laden-template-und-cms.md).

## Die Laden-Seite `/laden/[slug]`

`[slug]` ist ein Platzhalter in der URL. Bei `/laden/radl-huber` ist der Slug `radl-huber`.
Die Seite ist ein Template aus mehreren Abschnitten, siehe [08-laden-template-und-cms.md](08-laden-template-und-cms.md).

Das Formular hat zwei Schritte (PR #2):

1. **Anliegen wählen**, z. B. Reparatur, Inspektion, Reifen & Schlauch. Jeder Laden hat seine eigene Liste.
2. **Daten eintragen**: Vorname, Nachname, E-Mail oder Telefon, Betreff, Nachricht.

Das Anliegen wird mitgespeichert, damit man später zählen kann ("wie viele Reparaturen im Oktober?").
