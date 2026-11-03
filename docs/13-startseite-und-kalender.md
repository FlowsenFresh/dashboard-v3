# Startseite, neue Pfade und der Kalender

Stand: 03.11.2026. Ziel: etwas, das man Kunden vorzeigen kann.

## 1. Neue Pfade

Vorher war `/` direkt das Dashboard. Jetzt:

| Adresse         | Wer darf     | Was                                                      |
| --------------- | ------------ | -------------------------------------------------------- |
| `/`             | jeder        | Öffentliche Startseite, stellt das Produkt vor           |
| `/dashboard`    | mit Login    | Kunden-Dashboard, startet mit dem Kalender               |
| `/admin`        | nur Flo      | Admin-Bereich (wie bisher)                               |
| `/laden/<name>` | jeder        | Laden-Seiten (wie bisher)                                |
| `/login`        | jeder        | Anmelden, danach geht es zu `/dashboard` (admin: `/admin`) |

**Wie das geht:** Die Datei `app/(dashboard)/page.tsx` ist nach
`app/(dashboard)/dashboard/page.tsx` umgezogen. Bei Next.js ist der Ordner die Adresse,
also wurde aus `/` einfach `/dashboard`. Die Klammern bei `(dashboard)` stehen weiterhin
nicht in der URL. Die neue Startseite liegt in `app/page.tsx`, außerhalb der Gruppe,
darum hat sie keine Dashboard-Kopfzeile.

Alle Stellen, die nach dem Login oder nach dem Zugangscode auf `/` geschickt haben,
schicken jetzt auf `/dashboard` (Login, Admin, Kopfzeile).

**Achtung in `proxy.ts`:** `/` ist öffentlich, aber nur genau `/`. Hätten wir `/` einfach
in die Liste `OEFFENTLICH` geschrieben, wäre wegen `startsWith("/")` jede Seite öffentlich
geworden, auch das Dashboard. Darum steht `pfad === "/"` extra davor.

## 2. Die öffentliche Startseite (`app/page.tsx`)

- Oben: Was das Produkt ist, Knöpfe „Beispiel-Laden ansehen“ und „Zum Dashboard“.
- Eine kleine Kalender-Vorschau, nur aus CSS (keine echten Daten).
- „Was drin ist“: sechs Karten mit den Funktionen.
- Beispiel-Läden mit Links zu `/laden/...`.
- Unten der **GitHub-Knopf** zu https://github.com/FlowsenFresh.

**Social Media später eintragen:** Oben in `app/page.tsx` steht die Liste `PROFILE`.
Ein neuer Eintrag, und unten erscheint ein neuer Knopf:

```ts
const PROFILE = [
  { name: "GitHub", href: "https://github.com/FlowsenFresh", icon: "github" },
  { name: "Instagram", href: "https://instagram.com/deinname", icon: "instagram" },
] as const;
```

(Für ein Instagram-Zeichen braucht es dann noch ein kleines SVG wie `GithubIcon`.)

Die Seite liest weder Cookie noch Datenbank, darum ist sie komplett statisch und lädt sofort.
Deshalb steht dort auch kein `new Date()`: Mit `cacheComponents` dürfte eine statische
Seite die Uhrzeit nicht lesen.

## 3. Der Kalender im Dashboard (`/dashboard`)

Flos Idee: Statt vieler Seiten ist der Kalender die Zentrale. Man sieht immer, was heute los ist.

**Oben, das Recap** (ohne KI, nur Zählen):
Termine heute · neue Nachrichten · liegen geblieben (älter als heute und nicht beantwortet) ·
offene Wunschtermine. Gibt es liegen gebliebene Nachrichten, steht darunter eine kurze Liste,
ein Klick springt zum Tag.

**Links das Monats-Raster:** Montag bis Sonntag, jeder Tag ein Kästchen. Punkte zeigen,
was an dem Tag ist:

- grün = Termin
- rot = Nachricht (an dem Tag eingegangen)
- gestrichelt gelb = Wunschtermin (der Tag, den sich der Kunde gewünscht hat)

Am Handy sind es nur Punkte, am großen Bildschirm steht die Anzahl daneben.
Mit ← und → wechselt man den Monat, „Heute“ springt zurück.

**Rechts der gewählte Tag** (am Handy darunter): Wochentag und Datum ausgeschrieben,
dann Termine, Wunschtermine und Nachrichten des Tages. Die Nachrichten-Karte ist dieselbe
wie auf `/nachrichten`, „Als gelesen markieren“ funktioniert also auch hier.

**Ganz unten** Knöpfe zu den Bereichen, die nicht an einem Tag hängen:
Alle Nachrichten, Alle Termine, Webseite bearbeiten, Team, Support-Zugang (je nach Recht).

### Wie der Tag gewählt wird

Der Tag steht in der Adresse: `/dashboard?tag=2026-11-03`. Jedes Kästchen ist ein `<Link>`
dorthin. Vorteil: kein `"use client"`, kein `useState`. Zurück-Knopf und Lesezeichen
funktionieren von selbst. Ohne `?tag=` ist es heute.

### Der Tag als Text "2026-11-03"

In `app/lib/kalender.ts` stehen kleine Rechen-Hilfen (wie viele Tage hat der Monat,
an welchem Wochentag beginnt er). Ein Tag ist dort immer ein Text wie `"2026-11-03"`.
Solche Texte kann man direkt vergleichen (`"2026-11-02" < "2026-11-03"`), das ist einfacher
als mit `Date` zu rechnen.

Neu in `app/lib/zeit.ts`: `tagInBerlin(zeit)`. Eine Nachricht um 00:30 Uhr deutscher Zeit
ist in UTC noch der Vortag. Darum bestimmen wir den Tag immer mit der Zeitzone Berlin.

Dafür haben `Nachricht` ein neues Feld `eingegangenTag` und `Termin` ein Feld `tag` bekommen.

### Noch einfach gehalten

Der Kalender lädt im Moment alle Termine und Nachrichten des Ladens und sortiert sie dann.
Für ein paar hundert Einträge ist das kein Problem. Wenn es viele werden, fragen wir nur
noch den gezeigten Monat aus der Datenbank ab.

## 4. Wie geht es weiter

- Wunschtermin im Kontaktformular der Laden-Seite auswählen (Tag + Uhrzeit), im Kalender
  „Bestätigen“ oder „Anderen Termin vorschlagen“.
- Schlagwörter aus den gewählten Anliegen als Etiketten über der Nachricht.
- „Termin daraus machen“ direkt an der Nachricht.
- Recap „seit deinem letzten Login“ (dafür merken wir uns den letzten Login).
- Knopf „Neuen Laden anlegen“ und Beispieldaten pro Laden.

Siehe auch den Plan in den Projektdateien: `plaene/plan-verkaufsfertig.md` und
`plaene/kalender-und-startseite-ideen.md`.
