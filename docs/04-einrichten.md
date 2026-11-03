# 4. Einrichten: das Projekt starten

So startest du das Projekt auf einem Rechner, auf dem es noch nicht läuft.

## 1. Pakete installieren

```bash
vp install
```

## 2. Datenbank-Adresse eintragen

```bash
cp .env.example .env.local
```

In `.env.local` die echte `DATABASE_URL` von Neon eintragen
(Neon Console → Projekt `dashboard-v3` → **Connect**). Sie sieht ungefähr so aus:

```
DATABASE_URL="postgresql://BENUTZER:PASSWORT@HOST.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

`.env.local` kommt **nie** ins Git, weil das Passwort drinsteht.

## 3. Tabellen anlegen

```bash
vp run db:migrate
```

Spielt die SQL-Dateien aus `drizzle/` in die Datenbank ein (Tabellen, Login, Laden-Ansicht).
Schon eingespielte Dateien werden übersprungen. Man kann es also gefahrlos nochmal starten.

## 4. Beispieldaten (optional)

```bash
vp run db:seed
```

Legt den Laden "Radl Huber" mit Beispiel-Nachrichten und Terminen an, wenn die Datenbank leer ist.

## 5. Login anlegen

```bash
vp run benutzer:anlegen
```

Laden-Slug leer lassen, dann bist du admin.

## 6. Starten

```bash
vp run dev
```

Dann im Browser öffnen:

- http://localhost:3000/laden/radl-huber (öffentliche Laden-Seite)
- http://localhost:3000 (Dashboard, leitet zum Login)

## Alle Befehle auf einen Blick

| Befehl | Was passiert |
| ------ | ------------ |
| `vp install` | Pakete installieren |
| `vp run dev` | Entwicklungs-Server starten |
| `vp run build` | Produktions-Build bauen |
| `vp run lint` | Code prüfen (ESLint) |
| `vp run db:generate` | Nach einer Änderung an `schema.ts`: neue SQL-Datei in `drizzle/` schreiben |
| `vp run db:migrate` | Neue SQL-Dateien in die Datenbank einspielen |
| `vp run db:seed` | Beispieldaten anlegen |
| `vp run db:studio` | Tabellen im Browser ansehen |
| `vp run benutzer:anlegen` | Login anlegen oder Passwort neu setzen |

## Wenn du die Tabellen änderst

1. `app/lib/db/schema.ts` ändern
2. `vp run db:generate` (schreibt eine neue SQL-Datei)
3. SQL-Datei kurz ansehen
4. `vp run db:migrate`
5. SQL-Datei mit ins Git nehmen
