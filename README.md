# dashboard-v3

Dashboard für kleine Läden: öffentliche Laden-Seite mit Kontaktformular, dahinter Nachrichten und Termine.

## Starten

```bash
pnpm install
cp .env.example .env.local   # DATABASE_URL von Neon eintragen
pnpm dev
```

## Datenbank (Neon + Drizzle)

Die Daten liegen in Neon (Postgres, Region Frankfurt `aws-eu-central-1`, Projekt `dashboard-v3`).
Die Tabellen sind in `app/lib/db/schema.ts` beschrieben.

| Befehl             | Was passiert                                                                |
| ------------------ | --------------------------------------------------------------------------- |
| `pnpm db:generate` | Nach einer Änderung am Schema: schreibt eine neue SQL-Datei nach `drizzle/` |
| `pnpm db:migrate`  | Spielt neue SQL-Dateien aus `drizzle/` in die Datenbank ein                 |
| `pnpm db:seed`     | Legt Beispieldaten an, wenn die Datenbank leer ist                          |
| `pnpm db:studio`   | Öffnet eine Tabellen-Ansicht im Browser                                     |

Tabellen: `laeden`, `kontakte` (Personendaten), `nachrichten`, `termine`. Jede Tabelle hat `laden_id`, damit später jeder Laden nur seine eigenen Daten sieht.
