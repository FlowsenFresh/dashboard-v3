# dashboard-v3: nächste Schritte (Stand 02.11.2026)

Repo: FlowsenFresh/dashboard-v3. PR #1 (Laden-Seite, Kontaktformular, Design rot, Zod) offen bzw. zum Mergen.
Arbeitsweise neu: Claude schreibt den Code, Flo liest und lernt (kurz erklären was und warum). Antworten auf Deutsch.

## Grenzen
- Keine Rechnungen im Dashboard. Rechnungen macht weiter die Kasse des Ladens.

## Reihenfolge
1. Neon (Postgres, Region Frankfurt) + Drizzle. Nur `app/lib/nachrichtenSpeicher.ts` austauschen.
   - Tabellen getrennt: `kontakte` (Name, E-Mail, Telefon) und `nachrichten` (Anliegen, Betreff, Inhalt, Status, Zeit, laden).
   - Formular: Auswahlfeld "Anliegen" (Reparatur, Inspektion, Frage, ...) damit man zählen kann.
2. Schutz fürs Dashboard: eigener Login gebaut (03.11., PR "Login"): scrypt-Hash, Sitzungen in Neon, httpOnly-Cookie, Rollen admin/laden mit laden_id.
   - Multi-Tenant: admin wählt in der Kopfzeile "Alle Läden" oder einen Laden (sitzungen.ansicht_laden_id), arbeitet dann in dessen Daten. Später: Inhalte der Laden-Seite (CMS) über denselben Filter.
   - Entschieden 03.11.: kein Clerk (Daten wären in den USA). Daten bleiben in Deutschland, das ist Flos Verkaufsargument.
   - Vor dem ersten zahlenden Laden: Passwort-vergessen, 2FA, Schutz gegen Passwort-Raten. Selbst bauen oder Neon Auth (Frankfurt).
   - Hinweis: Neon und Vercel sind US-Firmen, Server aber in Frankfurt. "100 % deutscher Anbieter" ginge später mit Hetzner.
3. Vercel (fra1). Nur Laden-Seite öffentlich.

## Datenschutz-Idee von Flo: erst auswerten, dann löschen
- Monatsauswertung speichert nur Zahlen (z. B. Anliegen pro Monat), keine Personendaten.
- Danach Nachrichten löschen.
- Termine: Aufbewahrung pro Laden einstellbar (z. B. 3/12/24 Monate, Garantie 2 Jahre).
- Aufbewahrungsfristen grob: Buchhaltung 10 J., Rechnungen/Belege 8 J., Geschäftsbriefe 6 J. Einfache Anfragen meist nicht betroffen. Keine Rechtsberatung, ggf. mit privacy-legal prüfen.
- Keine eigene Feldverschlüsselung: Neon verschlüsselt at rest + TLS.

## Aufbau und Hosting (besprochen 02.11.)
- Eine App, drei Bereiche: `/laden/[slug]` öffentlich, `/dashboard` für Ladenbesitzer (nur eigener Laden), `/admin` nur für Flo (alle Läden, neue anlegen). Rollen "admin" / "laden" über den Login.
- Hosting: Vercel + Neon (beide Connectoren verbunden), kein VPS.
  - Entschieden 03.11.: Flo bleibt bei Vercel + Neon, lieber etwas mehr zahlen und dafür sicher (kein eigener Server). Hetzner nur, falls Kunden "nur deutsche Anbieter" verlangen.
  - Beim ersten zahlenden Laden: Vercel Pro nötig (Hobby ist nur nicht-kommerziell).
- Kontaktformular hat jetzt Anliegen-Auswahl (PR #2), Markenfarbe Türkis-Grün, eigene Palette in globals.css.
