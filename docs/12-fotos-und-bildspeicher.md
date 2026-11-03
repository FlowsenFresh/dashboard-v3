# 12. Fotos auf der Laden-Seite (Bildspeicher)

Stand 03.11.2026.

**Die Idee:** Du machst selbst ein Foto (z. B. von der Ladenfront) und lädst es auf der
Laden-Seite hoch. Das Foto liegt dann ganz oben hinter Name, Slogan und den zwei Knöpfen.

## So geht's (für dich und die Ladeninhaber)

1. Laden-Seite öffnen, unten **„✎ Seite bearbeiten“**.
2. Oben im ersten Streifen: **„📷 Foto als Hintergrund“**. Am Handy kannst du direkt die Kamera
   nehmen oder ein Foto aus der Galerie.
3. Kurz warten („Lädt hoch …“), dann siehst du das Foto schon hinter dem Text.
4. **Speichern** in der Leiste unten. Erst jetzt sehen es auch die Besucher.

„Anderes Foto“ tauscht es aus, „Foto entfernen“ nimmt es weg (auch erst nach dem Speichern).

Tipp für gute Fotos: **quer** fotografieren, und so, dass in der Mitte nicht zu viel los ist.
Dort steht ja der Name. Bei Sonne nicht gegen das Licht.

## Müssen wir am Server was ändern?

Ja, ein bisschen: Bilder brauchen einen **Speicher für Dateien**. Die Datenbank (Neon) ist für
Text und Zahlen gebaut, nicht für große Bilder. Darum:

- Das **Foto** liegt in **Vercel Blob**, einem Dateispeicher von Vercel.
- In der **Datenbank** steht nur die **Adresse** des Fotos (neue Spalte `laeden.titelbild`).

### Warum Vercel Blob?

| Möglichkeit                    | Daten wo?                   | Aufwand                 | Kosten                                               |
| ------------------------------ | --------------------------- | ----------------------- | ---------------------------------------------------- |
| **Vercel Blob** (gewählt)      | Frankfurt (`fra1`)          | klein, kein neues Konto | im Vercel-Plan enthalten, erst bei viel Nutzung mehr |
| Bilder in der Datenbank (Neon) | Frankfurt                   | klein                   | frisst den Neon-Speicher, langsam                    |
| Hetzner Object Storage         | Deutschland, deutsche Firma | mehr Code, neues Konto  | ab ca. 5 € im Monat                                  |

Vercel Blob passt am besten: Wir haben Vercel schon, es gibt **kein neues Konto und keinen
neuen Vertrag**, und wir legen den Speicher in **Frankfurt** an. Wie bei Neon gilt (siehe
[05-entscheidungen.md](05-entscheidungen.md)): Vercel ist eine US-Firma, der Speicher steht aber in Frankfurt.
Die Fotos werden von Vercels schnellem Netz ausgeliefert (CDN), also auch aus Kopien in der Nähe
des Besuchers. Für öffentliche Ladenfotos ist das kein Problem, Personendaten liegen da nicht.

Wenn ein Kunde später „100 % deutsche Firma“ verlangt: Nur `app/lib/bildSpeicher.ts` müsste
dann auf Hetzner umgebaut werden. Der Rest bleibt gleich.

## Einmal einrichten (macht Flo)

Noch gibt es auf Vercel **kein Projekt**. Darum zuerst das Projekt anlegen, dann den Bildspeicher.

### Schritt 1: Projekt auf Vercel anlegen (ca. 5 Minuten)

1. [vercel.com/new](https://vercel.com/new) öffnen und mit GitHub anmelden.
2. Bei **Import Git Repository** `dashboard-v3` wählen → **Import**. (Taucht es nicht auf: „Adjust GitHub
   App Permissions“ und dem Vercel-Zugang das Repo erlauben.)
3. Framework erkennt Vercel selbst (Next.js). Build-Befehl usw. so lassen.
4. **Environment Variables** aufklappen und eintragen:
   - Name `DATABASE_URL`, Wert: dieselbe Zeile wie in deiner `.env.local` (die Neon-Adresse,
     ohne Anführungszeichen).
5. **Deploy**. Nach 1 bis 2 Minuten gibt es eine Adresse wie `dashboard-v3-xyz.vercel.app`.

**Region Frankfurt:** Die Datei `vercel.json` im Repo sagt Vercel `"regions": ["fra1"]`. Damit
laufen die Server-Teile in Frankfurt, direkt neben Neon. Ohne die Datei wäre der Standard
Washington (USA). Prüfen: Projekt → **Settings** → **Functions** → Function Region sollte
Frankfurt zeigen.

**Datenbank vorher aktuell machen:** Vercel ändert die Datenbank nicht selbst. Die neuen Spalten
legst du wie immer von deinem Rechner aus an (`vp run db:migrate`, siehe unten bei den Befehlen).

**Hobby-Plan:** Zum Ausprobieren reicht der kostenlose Plan. Beim ersten zahlenden Laden auf Pro
wechseln (siehe [05-entscheidungen.md](05-entscheidungen.md)).

### Schritt 2: Bildspeicher anlegen (ca. 3 Minuten)

1. Im neuen Projekt oben **Storage** → **Create Database** → **Blob**.
2. Name z. B. `dashboard-fotos`, **Region: Frankfurt (fra1)** auswählen. Wichtig, das kann man
   später nicht mehr ändern! Zugriff: **Public** (die Fotos sind ja für alle Besucher).
3. Mit dem Projekt verbinden (Connect), alle Umgebungen anhaken. Vercel trägt den Schlüssel
   `BLOB_READ_WRITE_TOKEN` selbst bei den Umgebungsvariablen ein.
4. Für **lokal**: Bei Storage → dein Blob → Reiter **.env.local** die Zeile
   `BLOB_READ_WRITE_TOKEN="..."` kopieren und in deine `.env.local` einfügen.
5. Projekt → **Deployments** → beim obersten „…“ → **Redeploy**, damit der neue Schlüssel greift.
   (Oder einfach den PR mergen, dann baut Vercel sowieso neu.)

Ohne Schlüssel kommt beim Hochladen die Meldung „Der Bildspeicher ist noch nicht eingerichtet“.
Sonst funktioniert alles wie vorher.

## Wie es gebaut ist

```
Handy/PC                         Server (Vercel, Frankfurt)              Speicher
────────                         ─────────────────────────              ────────
Foto wählen
   │
verkleinern (FotoKnopf.tsx)
   │  max. 2000 px, JPG, < 1,4 MB
   ▼
fotoHochladen (actions.ts) ──▶  darf diese Person den Laden bearbeiten?
                                Typ und Größe nochmal prüfen
                                put() ──────────────────────────────▶  Vercel Blob
                                                                       laeden/<id>/titelbild-xyz.jpg
   ◀──────────── Adresse (URL) ─┘
Foto sofort anzeigen
   │
Speichern ───────────────────▶  ladenInhaltSpeichern
                                Adresse gehört zu DIESEM Laden?
                                in die Datenbank (laeden.titelbild)
                                altes Foto löschen (del) ───────────▶  weg
                                Cache der Seite leeren (updateTag)
```

| Datei                                        | Aufgabe                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `app/lib/bildSpeicher.ts`                    | Hochladen (`put`), Löschen (`del`), prüfen ob ein Bild zum Laden gehört |
| `app/laden/[slug]/actions.ts`                | Action `fotoHochladen`: erst Berechtigung prüfen, dann hochladen        |
| `app/laden/[slug]/_bearbeiten/FotoKnopf.tsx` | Knopf, Foto im Browser verkleinern, hochladen, anzeigen                 |
| `app/laden/[slug]/_teile/Held.tsx`           | Zeigt das Foto hinter dem Text, mit dunklem Verlauf darüber             |
| `app/laden/[slug]/_teile/Abschnitt.tsx`      | Neu: `hintergrund`, damit ein Foto in einen Streifen passt              |
| `app/lib/ladenSchema.ts`                     | Zod: nur Adressen aus unserem Blob-Speicher                             |
| `drizzle/0005_laden_titelbild.sql`           | Neue Spalte `titelbild`                                                 |
| `next.config.ts`                             | `images.remotePatterns` (nur unser Speicher), Upload-Grenze 2 MB        |

### Warum wird das Foto im Browser verkleinert?

Ein Handyfoto hat oft 4000 × 3000 Pixel und 5 MB. Der Browser rechnet es vorher auf höchstens
2000 Pixel Breite und speichert es als JPG (meist 200 bis 600 KB). Das bringt drei Dinge:

1. **Schneller Upload**, auch mit schlechtem Netz im Laden.
2. **Schnelle Seite** für die Besucher.
3. **Datenschutz:** Fotos tragen versteckte Daten mit (EXIF), oft auch den **GPS-Ort** und das
   Handymodell. Beim Neuzeichnen fallen die weg.

Dazu verkleinert `<Image>` von Next.js das Foto nochmal passend fürs Gerät: ein Handy bekommt
eine kleinere Datei als ein großer Bildschirm.

### Sicherheit, kurz

- Hochladen darf nur, wer den Laden auch bearbeiten darf (`darfLadenBearbeiten`, wie beim Speichern).
- Der Server prüft Typ (JPG, PNG, WebP) und Größe nochmal. Dem Browser glauben wir nie.
- Jeder Laden hat seinen eigenen Ordner `laeden/<id>/`. Beim Speichern prüfen wir, dass die
  Adresse aus genau diesem Ordner kommt. So kann niemand ein fremdes Bild „ausleihen“.
- `remotePatterns` in `next.config.ts` erlaubt nur Bilder aus unserem Speicher.

### Gut zu wissen

- Jedes neue Foto bekommt eine **neue Adresse** (`addRandomSuffix`). Sonst würden Browser noch
  tagelang das alte Foto aus ihrem Zwischenspeicher zeigen.
- Lädst du ein Foto hoch und drückst dann **Verwerfen**, bleibt die Datei im Speicher liegen,
  wird aber nirgends gezeigt. Das kostet fast nichts. Aufräumen könnte man später mit einem
  kleinen Skript (alle Dateien in `laeden/`, die in keiner Zeile von `titelbild` stehen).
- Im Dashboard unter **Webseite** gibt es (noch) keinen Foto-Knopf. Das Formular lässt das Foto
  aber in Ruhe, es geht beim Speichern dort nicht verloren.

## Ideen für danach

- Mehr Fotos: Galerie-Streifen („So sieht's bei uns aus“) oder ein Foto pro Leistung.
- Foto-Ausschnitt wählen (welcher Teil oben/unten sichtbar bleibt).
- Ein Logo statt des grünen Punkts in der Kopfzeile.
