# dashboard-v3

Dashboard für kleine Läden: öffentliche Laden-Seite mit Kontaktformular, dahinter Nachrichten und Termine.

## Starten

```bash
vp install
cp .env.example .env.local   # DATABASE_URL von Neon eintragen
vp run dev
```

## Datenbank (Neon + Drizzle)

Die Daten liegen in Neon (Postgres, Region Frankfurt `aws-eu-central-1`, Projekt `dashboard-v3`).
Die Tabellen sind in `app/lib/db/schema.ts` beschrieben.

| Befehl               | Was passiert                                                                |
| -------------------- | --------------------------------------------------------------------------- |
| `vp run db:generate` | Nach einer Änderung am Schema: schreibt eine neue SQL-Datei nach `drizzle/` |
| `vp run db:migrate`  | Spielt neue SQL-Dateien aus `drizzle/` in die Datenbank ein                 |
| `vp run db:seed`     | Legt Beispieldaten an, wenn die Datenbank leer ist                          |
| `vp run db:studio`   | Öffnet eine Tabellen-Ansicht im Browser                                     |

Tabellen: `laeden`, `kontakte` (Personendaten), `nachrichten`, `termine`. Jede Tabelle hat `laden_id`, damit später jeder Laden nur seine eigenen Daten sieht.

## Login

Alles außer `/laden/...` und `/login` braucht einen Login.

| Datei                 | Was sie macht                                                       |
| --------------------- | ------------------------------------------------------------------- |
| `proxy.ts`            | Schnelle Vorab-Prüfung: kein Cookie, dann weiter zu `/login`        |
| `app/lib/sitzung.ts`  | Echte Prüfung: Cookie gegen Tabelle `sitzungen`, wer ist angemeldet |
| `app/lib/passwort.ts` | Passwörter langsam hashen und prüfen (scrypt, in Node eingebaut)    |
| `app/login/`          | Login-Seite und die Actions `anmelden` / `abmelden`                 |

Rollen: `admin` sieht alle Läden, `laden` nur den eigenen (`laden_id`).

Login anlegen oder Passwort neu setzen (fragt E-Mail, Passwort und Laden ab):

```bash
vp run db:migrate          # einmal, legt die Tabellen benutzer und sitzungen an
vp run benutzer:anlegen    # Laden leer lassen = admin
```
