# Doku: dashboard-v3

Hier steht, wie das Dashboard aufgebaut ist und warum es so gebaut ist.
Stand: 03.11.2026 (nach PR #1 bis #15).

**Was ist das Projekt?** Ein Dashboard für kleine Läden (zum Beispiel eine Fahrradwerkstatt).
Jeder Laden hat eine öffentliche Seite mit Kontaktformular. Die Nachrichten landen im Dashboard,
wo der Laden sie liest und abhakt. Dazu kommen Termine.

## Die Seiten der Doku

| Datei                                                        | Worum es geht                                                         |
| ------------------------------------------------------------ | --------------------------------------------------------------------- |
| [01-architektur.md](01-architektur.md)                       | Überblick: Technik, Ordner, Seiten, Datenbank                         |
| [02-nachrichten-ablauf.md](02-nachrichten-ablauf.md)         | Was passiert, wenn jemand das Formular abschickt                      |
| [03-login.md](03-login.md)                                   | Eigener Login, Rollen, Laden-Wechsler für den admin                   |
| [04-einrichten.md](04-einrichten.md)                         | Projekt auf einem neuen Rechner starten (Befehle)                     |
| [05-entscheidungen.md](05-entscheidungen.md)                 | Was wir entschieden haben und warum                                   |
| [06-naechste-schritte.md](06-naechste-schritte.md)           | Was als Nächstes kommt                                                |
| [07-plan-original.md](07-plan-original.md)                   | Kopie des Plans aus dem Projekt (Stand 02./03.11.)                    |
| [08-laden-template-und-cms.md](08-laden-template-und-cms.md) | Die Laden-Seite als Template, und wie man sie im Dashboard bearbeitet |
| [09-git-ablauf.md](09-git-ablauf.md)                         | Branch, PR, testen, mergen: die Befehle für jeden Schritt             |
| [10-admin-und-zugangscode.md](10-admin-und-zugangscode.md)   | Admin-Bereich, Zugang zum Kunden-Dashboard nur mit Code, Zahlen       |
| [11-team.md](11-team.md)                                     | Team: Inhaber legt Mitarbeiter-Logins an und vergibt Rechte           |
| [12-fotos-und-bildspeicher.md](12-fotos-und-bildspeicher.md) | Eigene Fotos hochladen (Ladenfront oben), Bildspeicher Vercel Blob    |

Der Plan für Hosting, Domain und E-Mail liegt als eigenes Dokument:
[Hosting, Domain & E-Mail: Plan für Läden](https://claude.ai/artifact/71iJniso3uZ2fjZDqB37JB).

## Was heute passiert ist (Pull Requests)

| PR  | Was neu kam                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------- |
| #1  | Öffentliche Laden-Seite `/laden/[slug]` mit Kontaktformular, schlichtes Design, Prüfung mit Zod                     |
| #2  | Anliegen-Auswahl in zwei Schritten, eigene Farbpalette, Markenfarbe Türkis-Grün                                     |
| #3  | Nachrichten und Termine in Neon (Postgres) statt JSON-Datei, README mit `vp`-Befehlen                               |
| #4  | Buildskript von esbuild erlaubt (braucht drizzle-kit und tsx)                                                       |
| #5  | Neue Beispiel-Nachrichten mit Anliegen im Seed-Skript                                                               |
| #6  | Login fürs Dashboard: Passwort (scrypt), Sitzungen in Neon, Rollen admin/laden                                      |
| #7  | admin kann in einen Laden wechseln (Multi-Tenant)                                                                   |
| #8  | Diese Doku                                                                                                          |
| #9  | Laden-Seite als Template: Abschnitte, Farbe pro Laden, 6 Test-Läden                                                 |
| #10 | CMS: Laden-Inhalte in der Datenbank, im Dashboard unter „Webseite“ bearbeiten. Neues schlichtes Design mit Streifen |
| #11 | Laden-Seite direkt bearbeiten: „Seite bearbeiten“-Knopf, Texte per Doppelklick ändern (nur admin und Ladeninhaber)  |
| #12 | Eigener Admin-Bereich `/admin` mit Zahlen, Kunden-Dashboard nur mit Zugangscode vom Inhaber, Aufrufe zählen         |
| #13 | Aufrufe im Entwicklungsmodus nicht doppelt zählen                                                                   |
| #14 | Team-Seite: Inhaber legt Mitarbeiter-Logins an und vergibt das Webseiten-Recht. Bearbeiten nur noch per Doppelklick |
