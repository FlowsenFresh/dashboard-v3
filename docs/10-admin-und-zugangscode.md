# 10. Admin-Bereich und Zugangscode

Stand 03.11.2026 (PR #12).

## Zwei getrennte Bereiche

| Bereich                                                 | Für wen      | Was man sieht                                                                 |
| ------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------- |
| `/admin`                                                | nur Flo      | Alle Läden als Karten, nur **Zahlen** (Aufrufe, Nachrichten rein/raus, offen) |
| `/`, `/nachrichten`, `/termine`, `/webseite`, `/zugang` | Ladeninhaber | Sein eigenes Dashboard mit Namen und Inhalten                                 |

Nach dem Login landet der admin auf `/admin`, ein Ladeninhaber auf `/`.

Im Code sind das zwei **Route Groups** mit eigenem Layout:
`app/(admin)/` (Kopfzeile „Admin · nur für dich“) und `app/(dashboard)/` (Kunden-Kopfzeile).
Die Klammern stehen nicht in der URL.

## Kein Blick ins Kunden-Dashboard ohne Zustimmung

Flo kann nicht einfach so Nachrichten oder Termine eines Ladens lesen. Der Inhaber muss
zustimmen, fast wie bei einer Zwei-Faktor-Anmeldung:

1. Der **Inhaber** öffnet im Dashboard **Support-Zugang** (`/zugang`) und drückt
   „Zugangscode erzeugen“. Er bekommt 6 Ziffern, die **30 Minuten** gültig sind.
2. Er sagt Flo den Code (Telefon, WhatsApp …).
3. **Flo** gibt ihn im Admin auf der Karte des Ladens ein und klickt „Dashboard öffnen“.
4. Flo hat jetzt **2 Stunden** Zugriff. Oben steht ein Streifen „Du siehst das Dashboard von …,
   Zugang bis 18:28 Uhr · Zurück zum Admin“.
5. Danach ist automatisch Schluss. Der Inhaber kann auf `/zugang` auch sofort beenden.
6. Der Inhaber sieht auf `/zugang` eine Liste, **wann** Flo Zugang hatte.

Schutz gegen Raten: Nach **5 falschen Versuchen** ist der Code gesperrt. Ein neuer Code macht den
alten ungültig.

**Die öffentliche Webseite** darf Flo weiterhin ohne Code bearbeiten (Doppelklick). Dort stehen
keine Kundendaten, und Flo baut die Seiten ja.

### Wie das im Code geprüft wird

Wichtig: Die Prüfung sitzt **an einer einzigen Stelle**, direkt vor den Daten.

- `aktuellerBenutzer()` in `app/lib/sitzung.ts` schaut bei jedem Aufruf in der Tabelle
  `freigaben` nach, ob für den gewählten Laden gerade ein Zugang läuft. Wenn nicht, ist
  `ansichtLadenId` einfach `null`, egal was in der Sitzung steht.
- `sichtbarerLaden()` gibt dann `-1` zurück. Diese id gibt es nie, also liefern
  Nachrichten und Termine **nichts**.
- Früher hieß `null` „alle Läden“. Das gibt es bewusst nicht mehr.

So kann keine Seite die Prüfung vergessen: Alle Speicher-Funktionen filtern ohnehin mit
`sichtbarerLaden()`.

Nur der Inhaber kann einen Code erzeugen (`rolle === "laden"`). Der admin nicht, sonst könnte er
sich den Zugang ja selbst geben.

### Tabelle `freigaben`

| Spalte                         | Inhalt                                                                  |
| ------------------------------ | ----------------------------------------------------------------------- |
| `laden_id`                     | Für welchen Laden                                                       |
| `code_hash`                    | SHA-256 vom Code. Den Code selbst speichern wir nie (wie beim Passwort) |
| `code_gueltig_bis`             | 30 Minuten nach dem Erzeugen                                            |
| `fehlversuche`                 | Ab 5 ist der Code gesperrt                                              |
| `eingeloest_am`, `zugriff_bis` | Wann Flo ihn eingegeben hat, und 2 Stunden später                       |
| `beendet_am`                   | Falls der Inhaber früher beendet hat                                    |

Die Zeilen bleiben stehen, daraus entsteht die Liste „Wann wir Zugang hatten“.

Der Code wird mit `timingSafeEqual` verglichen. Das dauert immer gleich lang, egal wie viele
Ziffern stimmen. So kann man nichts an der Antwortzeit ablesen.

## Zahlen im Admin

Alles in `app/lib/adminUebersicht.ts`, je eine kleine Unterabfrage pro Zahl:

| Zahl                  | Woher                                                    |
| --------------------- | -------------------------------------------------------- |
| **Aufrufe** (30 Tage) | Tabelle `aufrufe`                                        |
| **Rein** (30 Tage)    | Nachrichten, die in den letzten 30 Tagen angekommen sind |
| **Raus** (30 Tage)    | Davon die mit Status „beantwortet“                       |
| **Offen**             | Nachrichten mit Status „neu“                             |

### Aufrufe zählen, ohne Besucher zu verfolgen

Die Tabelle `aufrufe` hat nur drei Spalten: `laden_id`, `tag`, `anzahl`. Keine IP, kein Cookie,
nichts über das Gerät. Darum braucht es dafür auch **keinen Cookie-Banner**.

Ablauf: Die Laden-Seite kommt aus dem Cache, der Server sieht den Besuch also gar nicht. Darum
schickt der Browser nach dem Laden kurz `POST /laden/<slug>/aufruf`
(`_teile/AufrufZaehler.tsx` mit `navigator.sendBeacon`). Der Route Handler
`app/laden/[slug]/aufruf/route.ts` zählt dann +1 für heute („upsert“: gibt es die Zeile schon,
wird hochgezählt, sonst angelegt).

**Eigene Besuche zählen mit**, auch wenn du oder der Inhaber angemeldet seid. Ihr könntet ja auch
Kunden sein 😄

**Doppelt gezählt im Entwicklungsmodus?** `vp run dev` führt React-Effekte zum Testen absichtlich
zweimal aus. Darum zählt `AufrufZaehler` dieselbe Seite innerhalb von 2 Sekunden nur einmal.

Gut zu wissen: Suchmaschinen-Bots zählen mit. Für einen Trend reicht das.
