# 8. Laden-Template und CMS

Stand 03.11.2026 (PR #9 und #10).

**Die Idee:** Jeder Laden bekommt seine eigene Webseite. Es gibt aber nur **eine** Seite im Code
(`app/laden/[slug]/page.tsx`). Sie holt sich die Inhalte des Ladens aus der Datenbank. Neuer
Laden = neuer Eintrag in der Tabelle `laeden`, ohne neuen Code.

Die Inhalte pflegt der Ladenbesitzer selbst im Dashboard unter **Webseite**. Du musst dich also
nicht um Telefonnummern oder Öffnungszeiten kümmern.

## Wie die Seite aussieht

Schlicht, große Schrift, wenig auf einmal. Jedes Thema bekommt einen eigenen breiten
**Streifen** mit eigenem Hintergrundton. So sieht man sofort, wo ein Thema aufhört. Das ist
auch für ältere Kunden angenehm.

| Abschnitt                       | Datei in `_teile/`    | Hintergrund             |
| ------------------------------- | --------------------- | ----------------------- |
| Kopfzeile (bleibt oben stehen)  | `Kopf.tsx`            | dunkel                  |
| Name, Slogan, zwei große Knöpfe | `Held.tsx`            | Ladenfarbe, ganz leicht |
| Leistungen mit Preis            | `Leistungen.tsx`      | dunkel                  |
| Über uns (optional)             | `UeberUns.tsx`        | hell                    |
| Öffnungszeiten                  | `Oeffnungszeiten.tsx` | mittel                  |
| Anfahrt & Kontakt               | `Anfahrt.tsx`         | dunkel                  |
| Kontaktformular                 | `Kontakt.tsx`         | hell                    |
| Fußzeile                        | `Fuss.tsx`            | dunkel                  |

Der Ordner heißt `_teile` mit Unterstrich. Das sagt Next.js: Das sind keine eigenen Seiten,
nur Bausteine.

Den Streifen baut `Abschnitt.tsx`: Er bekommt einen `ton` (`dunkel`, `mittel`, `hell`, `farbe`)
und kümmert sich um Hintergrund, Breite, Abstand und Überschrift. Die Reihenfolge und die Töne
stehen unten in `page.tsx`. Umstellen heißt dort Zeilen tauschen.

**Was leer ist, wird nicht angezeigt.** Ohne „Über uns“-Text fehlt der Abschnitt, ohne Telefon
fehlt der Anrufen-Knopf.

## Farbe pro Laden

In `globals.css` heißt unsere Markenfarbe `--color-akzent` (Türkis-Grün). Hat ein Laden eine
eigene Farbe, setzt `page.tsx` diese Variable nur für seine Seite neu:

```tsx
style={{ "--color-akzent": "#f87171", "--color-akzent-hell": "color-mix(...)" }}
```

Alle Klassen wie `text-akzent`, `bg-akzent` oder `bg-akzent/10` lesen diese Variable. Darum
ändert sich die ganze Seite auf einmal. Die hellere Farbe für „Maus drüber“ mischt der Browser
selbst (`color-mix`: 25 % Weiß dazu).

Tipp: helle Farben wählen. Die Schrift auf den Knöpfen ist dunkel.

## Wo die Daten liegen

Tabelle `laeden` (Migration `drizzle/0003_laden_inhalt.sql`):

| Spalte                                      | Inhalt                                             |
| ------------------------------------------- | -------------------------------------------------- |
| `name`, `branche`, `slogan`, `beschreibung` | Text oben auf der Seite                            |
| `farbe`                                     | z. B. `#38bdf8`, leer = Türkis-Grün                |
| `leistungen`                                | Liste (JSON): Titel, Text, Preis                   |
| `ueber_uns`                                 | JSON: Text und kurze Fakten, leer = kein Abschnitt |
| `oeffnungszeiten`                           | Liste (JSON): Tage und Zeit                        |
| `hinweis_zeiten`                            | z. B. „Im Frühjahr lieber vorher anrufen“          |
| `strasse`, `plz_ort`, `telefon`, `email`    | Kontakt                                            |
| `anliegen`                                  | Liste (JSON): Auswahl im Kontaktformular           |

**Warum JSON für Listen?** Ein Laden hat vielleicht 3 bis 10 Leistungen. Dafür eigene Tabellen
zu bauen wäre viel mehr Code. `jsonb` speichert die ganze Liste in einer Spalte, und Drizzle kennt
mit `$type<Leistung[]>()` trotzdem den genauen Typ.

## Der Cache: schnell und trotzdem sofort aktuell

`ladenFinden(slug)` in `app/lib/laeden.ts` hat oben `"use cache"`. Next.js merkt sich dann das
Ergebnis und fragt die Datenbank nicht bei jedem Besucher. Jeder Eintrag bekommt einen Namen
(`cacheTag("laden-radl-huber")`).

Speichert jemand im Dashboard, ruft die Action `updateTag("laden-radl-huber")` auf. Damit ist
genau dieser Eintrag gelöscht, und der nächste Besucher sieht schon den neuen Stand. Die Seiten
der anderen Läden bleiben im Cache.

```
Besucher ──▶ /laden/radl-huber ──▶ Cache da? ── ja ──▶ sofort anzeigen
                                        │
                                       nein ──▶ Datenbank ──▶ merken ──▶ anzeigen

Dashboard „Speichern“ ──▶ Datenbank ändern ──▶ updateTag ──▶ Cache von radl-huber weg
```

## Das CMS: `/webseite` im Dashboard

- **Ladenbesitzer** sehen immer ihren eigenen Laden.
- **admin** (du) bearbeitet den Laden, für den du gerade einen Zugang per Code hast (siehe
  [10-admin-und-zugangscode.md](10-admin-und-zugangscode.md)). Ohne Zugang
  kommt ein Hinweis. Die öffentliche Seite kannst du aber immer per Doppelklick bearbeiten.

Ablauf beim Speichern (`app/(dashboard)/webseite/actions.ts`):

1. `benutzerPflicht()`: Ist jemand angemeldet?
2. Welcher Laden? **Aus der Sitzung**, nicht aus dem Formular (`sichtbarerLaden`). So kann ein
   Ladenbesitzer nie die Seite eines anderen Ladens ändern, auch wenn er am Formular herumspielt.
3. Zod prüft alles (`app/lib/ladenSchema.ts`): Längen, E-Mail, und dass die Farbe ein echter
   Farbcode wie `#38bdf8` ist. Leere Zeilen fallen weg.
4. In die Datenbank schreiben, dann `updateTag`.

Das Formular (`app/components/WebseiteFormular.tsx`) hält alles in einem `useState`. Listen wie
Leistungen oder Öffnungszeiten kann man mit „+“ erweitern und mit „entfernen“ kürzen. Beim
Absenden geht alles als ein JSON-Text im versteckten Feld `daten` an den Server. Das ist bei
Listen viel einfacher als hundert einzelne Felder.

Der Speichern-Knopf klebt unten am Bildschirm (`sticky bottom-0`), damit man nicht scrollen muss.

## Bearbeiten direkt auf der Seite (Doppelklick)

Seit PR #11 geht es noch einfacher: Auf der Laden-Seite unten steht **„✎ Seite bearbeiten“**.
Danach hat jeder Text einen gestrichelten Rahmen, und ein **Doppelklick** macht ein Eingabefeld
daraus. Enter oder ein Klick daneben übernimmt, Escape bricht ab. Bei Listen gibt es „+“ und „✕“.
Unten in der Leiste: Farbe wählen, **Verwerfen** oder **Speichern**.

**Wer sieht den Knopf?** Nur du (admin) und der Inhaber dieses Ladens. Normale Besucher bekommen
ihn gar nicht erst geschickt. Und noch wichtiger: Die Action `seiteSpeichern` prüft beim Speichern
selbst auf dem Server nochmal (`darfLadenBearbeiten` in `sitzung.ts`). Ein versteckter Knopf allein
wäre kein Schutz, weil jeder eine Action auch von Hand aufrufen kann.

**Wie das gebaut ist** (`app/laden/[slug]/_bearbeiten/`):

| Datei                  | Aufgabe                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `Rahmen.tsx`           | Schaltet um: aus = normale Seite vom Server, an = dieselbe Seite mit den geänderten Daten     |
| `Kontext.tsx`          | Die „unsichtbare Leitung“ (React Context), über die jeder Text den Modus und die Daten findet |
| `Bearbeitbar.tsx`      | Ein Text, der per Doppelklick zum Eingabefeld wird                                            |
| `ListenKnoepfe.tsx`    | „+“ und „✕“ für Listen                                                                        |
| `Leiste.tsx`           | Die Leiste unten mit Farbe, Verwerfen, Speichern                                              |
| `BearbeitenLeiste.tsx` | Läuft auf dem Server, liest das Login-Cookie, zeigt die Leiste nur Berechtigten               |

Jeder Text weiß über seinen **Pfad**, wohin er gehört, z. B. `slogan` oder `leistungen.2.titel`.
`setzePfad` in `Kontext.tsx` ändert genau diese Stelle und macht dabei eine Kopie, damit React die
Änderung bemerkt.

**Warum bleibt die Seite trotzdem schnell?** Die Seite selbst kommt weiter aus dem Cache. Nur die
kleine Leiste steht in `<Suspense>` und wird pro Besuch geprüft, weil sie das Cookie lesen muss.

Gespeichert wird über denselben Weg wie im Dashboard (`app/lib/ladenSpeichern.ts`): Zod prüfen,
in die Datenbank schreiben, `updateTag`. Das Formular unter **Webseite** im Dashboard gibt es
weiterhin, falls man lieber alles auf einmal sieht.

## Neuen Laden anlegen (bis es den admin-Bereich gibt)

1. Zeile in `laeden` mit `slug` und `name` anlegen (z. B. in `vp run db:studio`).
2. Im Dashboard oben den Laden wählen, unter **Webseite** alles ausfüllen, speichern.
3. Die Seite ist unter `/laden/<slug>` erreichbar.

## Beispiel-Läden

`scripts/beispielLaeden.ts` enthält 6 Test-Läden (Fahrradwerkstätten in Türkis, Blau und Lila,
dazu Autowerkstatt, Bäckerei und Friseur). `vp run db:seed` legt sie an. Läden, die du schon
im Dashboard bearbeitet hast, überschreibt das Skript nicht.
