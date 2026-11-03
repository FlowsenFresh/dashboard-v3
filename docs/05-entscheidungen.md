# 5. Entscheidungen

Hier steht, **was** wir entschieden haben und **warum**. So muss man später nicht nochmal
überlegen. Keine Rechtsberatung: Rechtliche Punkte ggf. nochmal prüfen lassen.

| Datum | Entscheidung | Warum |
| ----- | ------------ | ----- |
| 02.11. | **Keine Rechnungen im Dashboard** | Rechnungen macht weiter die Kasse des Ladens. Das Dashboard bleibt schlank. |
| 02.11. | **Eine App, mehrere Bereiche** (öffentliche Laden-Seite, Dashboard, admin) | Einfacher zu pflegen als mehrere Apps. Rollen trennen die Bereiche. |
| 02.11. | **Neon (Postgres, Frankfurt) + Drizzle** statt JSON-Datei | Echte Datenbank, mehrere Läden, Daten in Deutschland. |
| 02.11. | **Kontakte getrennt von Nachrichten** | Keine doppelten Personen, beim Löschen sieht man genau, wo Namen liegen. |
| 02.11. | **Anliegen-Auswahl im Formular** | Damit man zählen und auswerten kann. |
| 02.11. | **Keine eigene Feldverschlüsselung** | Neon verschlüsselt die Daten auf der Platte und unterwegs (TLS). Reicht für den Anfang. |
| 03.11. | **Kein Clerk, eigener Login** | Bei Clerk lägen die Logins in den USA. **Daten in Deutschland** ist Flos Verkaufsargument. |
| 03.11. | **Bei Vercel + Neon bleiben**, kein eigener Server | Lieber etwas mehr zahlen und dafür sicher. Server stehen in Frankfurt (`fra1` bzw. `aws-eu-central-1`). |
| 03.11. | **Vercel Pro beim ersten zahlenden Laden** | Der kostenlose Hobby-Plan ist nur für nicht-kommerzielle Projekte erlaubt. |
| 03.11. | **Neon Auth vor dem ersten zahlenden Laden** | Für Passwort vergessen und 2FA. Neon Auth läuft auch in Frankfurt. |
| 03.11. | **Erst auswerten, dann löschen** (Datenschutz) | Siehe unten. |
| 03.11. | **Fotos in Vercel Blob (Frankfurt), nicht in der Datenbank** | Kein neues Konto, Speicher in `fra1`. In Neon steht nur die Adresse. Siehe [12-fotos-und-bildspeicher.md](12-fotos-und-bildspeicher.md). |
| 03.11. | **Fotos im Browser verkleinern** | Schneller Upload, schnelle Seite, und der GPS-Ort im Foto fällt weg. |

## Hinweis zu "Daten in Deutschland"

Neon und Vercel sind US-Firmen, ihre Server für uns stehen aber in Frankfurt.
"100 % deutscher Anbieter" ginge später mit Hetzner. Das machen wir nur, falls Kunden das verlangen.

## Datenschutz-Idee: erst auswerten, dann löschen

- Eine **Monatsauswertung** speichert nur Zahlen (z. B. Anliegen pro Monat), keine Personendaten.
- Danach werden die Nachrichten gelöscht.
- **Termine:** Aufbewahrung pro Laden einstellbar (z. B. 3, 12 oder 24 Monate; Garantie = 2 Jahre).
  Die Spalte gibt es schon: `laeden.termine_aufbewahren_monate` (Standard 24).
- Grobe gesetzliche Fristen: Buchhaltung 10 Jahre, Rechnungen/Belege 8 Jahre, Geschäftsbriefe
  6 Jahre. Einfache Anfragen sind meist nicht betroffen.

## Hosting, Domain und E-Mail

Der ausführliche Plan steht in einem eigenen Dokument:
[Hosting, Domain & E-Mail: Plan für Läden](https://claude.ai/artifact/71iJniso3uZ2fjZDqB37JB).
