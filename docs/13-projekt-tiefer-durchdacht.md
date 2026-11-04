# 13. Das ganze Projekt tiefer durchdacht

Stand 04.11.2026. Diese Seite macht den Plan nicht **größer**, sondern **tiefer**: Sie fragt, was ein
Spitzenfachmann an dieser Stelle anders machen würde, womit er anfangen würde, mit welchen
Werkzeugen er arbeitet und wer außer uns beiden prüfen kann, ob das Ergebnis stimmt. Am Ende steht
der Projektplan, neu geschrieben.

Gemeint ist das ganze Produkt dashboard-v3: Laden-Webseiten, Dashboard für Ladeninhaber, Admin
für Flo, und der Verkauf an Läden.

## Kurzfassung

Bisher bauen wir das Produkt von den **Funktionen** her (Kalender, Team, Fotos, Pakete A bis G).
Ein Profi würde es von **einem Versprechen** her bauen und dieses Versprechen messbar machen:

> **„Bei deinem Laden geht keine Kundenanfrage mehr verloren, und jede wird schnell beantwortet.
> Die Daten bleiben in Deutschland.“**

Daraus folgen drei Dinge, die im Code heute fehlen, und die wichtiger sind als jedes neue Feature:

1. **Der Laden erfährt nicht, dass eine Nachricht da ist.** Es gibt keine E-Mail oder
   Push-Benachrichtigung. Wer das Dashboard nicht öffnet, verpasst Anfragen. Genau das
   Versprechen bricht damit.
2. **Wir können nicht messen, ob es schneller geht.** `nachrichten` hat `eingegangen_am`, aber keine
   Zeit für „beantwortet“. Also kennen wir keine Antwortzeit, und die ist der eigentliche Nutzen.
3. **Nichts beweist, dass Laden A nie die Daten von Laden B sieht.** Die Trennung steckt in
   `sichtbarerLaden()` und `laden_id`-Filtern, aber es gibt keinen einzigen Test und kein CI.
   Für ein Produkt, das „Datenschutz“ verkauft, ist das das größte Risiko.

---

## (1) Was ein Spitzenfachmann hier tun würde, worum du aber nicht gebeten hast

Ein erfahrener Produktentwickler für kleine Betriebe (jemand, der schon SaaS an Handwerker,
Friseure und Werkstätten verkauft hat) würde:

- **Vor dem nächsten Feature mit 5 echten Läden reden.** Nicht „Wie findest du mein Dashboard?“,
  sondern „Wie ist die letzte Anfrage bei dir reingekommen, und was ist dann passiert?“. Die meisten
  Anfragen kommen bei kleinen Läden per **Telefon, WhatsApp und Google Maps**, nicht über ein
  Webseiten-Formular. Das entscheidet, ob das Kontaktformular der richtige Kern ist.
- **Den Preis früh testen, nicht am Ende.** Pakete A bis G sind gut für die Vorführung, aber keins
  davon klärt, ob jemand 19 € oder 49 € im Monat zahlt. Ein Profi fragt nach der Vorführung
  „Willst du ab 1. Dezember starten?“ und schaut, was passiert.
- **Die Mandanten-Trennung beweisen, bevor echte Daten kommen.** Automatische Tests, die sich als
  Laden A anmelden und versuchen, Nachrichten, Termine, Team und Fotos von Laden B zu lesen oder zu
  ändern. Dazu als zweiter Zaun **Row-Level Security** in Postgres, damit ein vergessener
  `where`-Filter nicht reicht, um Daten zu verraten.
- **Die rechtliche Rolle klar machen.** Sobald ein Laden echte Kundendaten bei uns speichert, ist
  Flo **Auftragsverarbeiter** (DSGVO Art. 28). Das heißt: ein Vertrag (AVV) mit jedem Laden, eine
  Liste der technischen Maßnahmen (TOMs) und eine Liste der Unterauftragnehmer (Vercel, Neon).
  „Daten in Deutschland“ ist nur ein Verkaufsargument, wenn man es schriftlich belegen kann.
- **Den Betrieb mitdenken.** Was passiert um 22 Uhr, wenn die Seite nicht lädt? Fehler-Meldungen,
  Backups (Neon hat Point-in-Time-Restore, aber hat es jemand einmal ausprobiert?), und wer
  Support macht.
- **Weglassen.** Tischplan, Schlagwörter, Recap, KI: alles gute Ideen, aber ein Profi würde sie
  erst bauen, wenn ein zahlender Laden danach fragt.

## (2) Das Rohmaterial, von dem er ausgehen würde

Bisher arbeiten wir mit **aufbereitetem** Material: Beispiel-Läden aus `scripts/beispielLaeden.ts`,
erfundene Nachrichten aus dem Seed, Pläne, die wir zusammen geschrieben haben. Ein Profi geht an die
Quellen:

| Rohmaterial | Warum | Wie man drankommt |
| ----------- | ----- | ----------------- |
| **Echte Anfragen** eines Ladens aus 2 Wochen (WhatsApp, Anrufliste, Mails, Google-Maps-Fragen) | Zeigt, welche Kanäle es gibt, welche Anliegen wirklich vorkommen und wie viele verloren gehen | Inhaber fragen, ob er dir die Liste zeigt (Namen schwärzen) |
| **Einen Vormittag im Laden** zuschauen | Wann schaut der Inhaber aufs Handy? Hat er die Hände frei? Daraus folgt, ob Dashboard, Handy oder Mail der richtige Ort ist | Hingehen, Kaffee mitbringen |
| **Google-Unternehmensprofile** der Ziel-Läden | Dort finden Kunden die Läden heute. Viele haben schon „Website“ und „Termin buchen“ verlinkt | maps.google.com, öffentlich |
| **Preislisten der Konkurrenz** (z. B. Jimdo, Wix, Shore, Treatwell, Planity, lokale Webdesigner) | Was zahlen Läden schon, und wofür? | Webseiten der Anbieter |
| **Gesetzestexte selbst** statt Zusammenfassungen: DSGVO Art. 6, 13, 28, 32; DDG § 5 (Impressum); TDDDG § 25 (Cookies) | Damit Impressum, Datenschutz und AVV stimmen | gesetze-im-internet.de, dsgvo-gesetz.de |
| **AVV und Unterauftragnehmer-Listen von Vercel und Neon** | Belegen, wo die Daten wirklich liegen und wer drankommt | vercel.com/legal/dpa, neon.tech/dpa |
| **Unsere eigenen Daten** in Neon: Aufrufe pro Laden, Nachrichten pro Laden, Status | Zeigt, ob die Test-Läden überhaupt benutzt werden | Neon-Konsole oder `vp run db:studio` |
| **Der Code selbst** (alle Stellen, die `laden_id` filtern) | Grundlage für die Prüfung der Mandanten-Trennung | `grep -rn "ladenId" app/` |

## (3) Konkrete Methoden und Werkzeuge

**Produkt und Verkauf**

- **„The Mom Test“** (Buch von Rob Fitzpatrick): Fragen nach Vergangenem stellen („Wann hast du
  zuletzt eine Anfrage verpasst?“), nie nach Meinungen („Würdest du das nutzen?“).
- **Jobs to be Done**: Welchen „Job“ stellt der Laden das Dashboard ein? Wahrscheinlich: „Mir
  sagen, wer auf eine Antwort wartet.“
- **Concierge-Pilot**: Flo richtet die ersten 3 Läden selbst ein, schreibt die Texte, ruft nach
  einer Woche an. Kein Selbst-Anmelden nötig, das spart Paket A vorerst sogar teilweise.
- **Eine Kennzahl** für alles: **Zeit von Eingang bis Antwort** (Median pro Laden und Woche).
  Dazu: Anteil Nachrichten, die nach 48 Stunden noch offen sind.

**Technik**

- **Vitest** für Tests der Speicher-Funktionen, **Playwright** (ist hier schon installiert) für
  Klick-Tests im Browser: „Als Laden A anmelden, `/nachrichten` von Laden B versuchen“.
- **Neon-Branch pro Testlauf**: eine Kopie der Datenbank, in der Tests alles dürfen.
- **GitHub Actions** als CI: Bei jedem PR laufen `lint`, `tsc` und die Tests. Grün = darf gemergt
  werden.
- **Postgres Row-Level Security** als zweiter Zaun für die Mandanten-Trennung.
- **OWASP ASVS Level 1** als Checkliste für Login, Sitzungen und Formulare (Rate-Limit,
  Passwort vergessen, Cookie-Einstellungen).
- **Kleines Bedrohungsmodell (STRIDE light)**: einmal pro Bereich aufschreiben, wer angreifen
  könnte und wie (Spam übers Formular, Passwort-Raten, Laden-Wechsel per manipuliertem Cookie).
- **E-Mail-Versand aus der EU** für Benachrichtigungen, z. B. Brevo, Mailjet oder Scaleway TEM.
- **Lighthouse / PageSpeed Insights** für die Laden-Seite (am Handy schnell und zugänglich).
- **Fehler-Meldungen**: Vercel Logs reichen zuerst. Später ein Dienst mit EU-Speicher.

**Recht und Datenschutz**

- **Verzeichnis der Verarbeitungstätigkeiten** (eine Tabelle: welche Daten, wofür, wie lange).
- **AVV-Vorlage** für die Läden (z. B. Muster der Landesdatenschutzbehörden oder des GDD).
- **TOMs-Liste**: Was steht schon im Code (scrypt, Token-Hash, TLS, Region Frankfurt) und was fehlt.
- Das `privacy-legal`-Plugin in diesem Projekt kann eine **PIA** und eine **Lücken-Analyse** dafür
  vorbereiten. Ersetzt keine Rechtsberatung.

## (4) Wer außer dir oder mir nachweisen kann, dass das Ergebnis richtig ist

| Was soll stimmen | Wer kann es nachweisen | Woran man es sieht |
| ---------------- | ---------------------- | ------------------ |
| Das Produkt löst ein echtes Problem | **Die Ladeninhaber**, durch ihr Verhalten | Sie benutzen es nach 30 Tagen noch und zahlen. Lob in der Vorführung zählt nicht |
| Anfragen werden schneller beantwortet | **Die Daten** und die **Endkunden** | Antwortzeit vorher (aus dem Rohmaterial) gegen nachher (aus Neon). Endkunden: „Ging schnell“ |
| Laden A sieht nie Daten von Laden B | **Automatische Tests im CI** und ein **zweiter Entwickler** oder **Pentester** | Tests sind grün auf GitHub, ein Fremder findet beim Versuch keinen Weg |
| Login ist sicher genug | **OWASP-ASVS-Checkliste**, später ein **Pentest** | Jeder Punkt abgehakt mit Fundstelle im Code |
| Impressum, Datenschutz, AVV sind korrekt | **Anwalt für IT-Recht** oder **externer Datenschutzbeauftragter**, Erstberatung bei der **IHK** | Unterschriebene AVV, geprüfte Texte |
| Daten liegen in Frankfurt | **Vercel und Neon selbst** (ihre AVV, SOC-2/ISO-27001-Berichte) und die Projekt-Einstellungen | Screenshot der Region in beiden Konsolen, Link zu den Dokumenten |
| Die Laden-Seite ist schnell und zugänglich | **Lighthouse** (Google) | Werte über 90 am Handy |
| Preis und Steuern stimmen | **Steuerberater** | Klarheit zu Kleinunternehmerregelung und Gewerbe |

Der wichtigste Prüfer ist der **erste zahlende Laden**. Alles andere ist Vorbereitung darauf.

---

## Der Projektplan, tiefer umgeschrieben

Der alte Plan (`plan-verkaufsfertig.md`, Pakete A bis G) bleibt gültig, wird aber **eingeordnet**.
Jede Stufe hat ein „Fertig, wenn …“ und einen Prüfer, der nicht Claude ist.

### Stufe 0: Das Versprechen messbar machen (klein, zuerst)

| Was | Fertig, wenn … | Prüfer |
| --- | -------------- | ------ |
| Spalte `beantwortet_am` in `nachrichten`, wird beim Status „beantwortet“ gesetzt | Admin zeigt pro Laden die mittlere Antwortzeit | Neon-Daten |
| **E-Mail an den Laden bei neuer Nachricht** (EU-Mailanbieter), ohne Kundendaten im Text, nur „Neue Anfrage: Reparatur. Im Dashboard ansehen“ | Testnachricht kommt innerhalb einer Minute im Postfach an | Flo mit eigenem Postfach |

### Stufe 1: Das Fundament beweisen (bevor echte Daten kommen)

| Was | Fertig, wenn … | Prüfer |
| --- | -------------- | ------ |
| Tests für die Mandanten-Trennung (jede Seite und jede Action, zwei Läden) | Alle Tests grün, und ein absichtlich entfernter Filter lässt einen Test rot werden | GitHub Actions |
| CI auf GitHub (`lint`, `tsc`, Tests) | Jeder PR zeigt einen grünen Haken | GitHub |
| Rate-Limit für Login und Kontaktformular, Spam-Schutz (Honeypot-Feld) | 10 falsche Passwörter sperren für einige Minuten | Test + ASVS-Checkliste |
| Backup einmal zurückspielen (Neon-Branch aus der Vergangenheit) | Flo hat es einmal selbst gemacht und aufgeschrieben | Flo |

### Stufe 2: Rohmaterial holen (parallel zu Stufe 1, ohne Code)

| Was | Fertig, wenn … | Prüfer |
| --- | -------------- | ------ |
| 5 Gespräche mit Läden nach dem Mom Test | 5 Notizen in `plaene/gespraeche/`, je: Kanäle, verpasste Anfragen, was sie heute zahlen | Die Läden |
| Konkurrenz und Preise in einer Tabelle | Preis-Vorschlag mit Begründung | Ein Laden reagiert auf den Preis |

### Stufe 3: Pflicht vor dem ersten zahlenden Laden

| Was | Fertig, wenn … | Prüfer |
| --- | -------------- | ------ |
| Impressum und Datenschutz pro Laden (Felder im CMS, Seiten unter `/laden/<name>/impressum`) | Fußzeile verlinkt beide, Texte geprüft | Anwalt / IHK |
| AVV-Vorlage, TOMs, Verzeichnis der Verarbeitungen, Liste der Unterauftragnehmer | Als PDF für den Laden fertig | Datenschutzbeauftragter |
| Passwort vergessen, 2FA (Neon Auth oder selbst) | Im Test durchgeklickt | ASVS-Checkliste |
| Vercel Pro, eigene Domain | Laden-Seite läuft unter eigener Adresse | Vercel-Konsole |

### Stufe 4: Concierge-Pilot mit 3 Läden

Flo richtet die Läden selbst ein (dafür reicht zuerst das Skript, Paket A kann warten).
Nach 2 und nach 4 Wochen: Antwortzeit und offene Nachrichten anschauen, Inhaber anrufen.
**Fertig, wenn** mindestens ein Laden sagt „Ich zahle ab nächstem Monat“, oder wir wissen, warum nicht.

### Stufe 5: Die alten Pakete, gefiltert durch den Pilot

| Paket | Jetzt | Warum |
| ----- | ----- | ----- |
| C Kalender, D Nachricht → Termin | Hoch, falls die Läden Termine vergeben | Passt zum Versprechen (nichts geht verloren) |
| „Unbeantwortet“-Kasten, Recap beim Login | Hoch, klein | Direkt das Versprechen |
| A Neuen Laden anlegen, B Beispieldaten | Mittel | Erst nötig, wenn Flo mehr als 3 Läden einrichtet oder viel vorführt |
| E, F Design-Runden | Mittel | Nach dem Pilot, mit echtem Feedback |
| Wunschtermin, Schlagwörter, Tischplan, KI | Später | Erst wenn ein Laden danach fragt |
| G Funktions-Durchgang | Wird ersetzt | Durch die Tests aus Stufe 1 und den Pilot |

## Deine Aufgabenstellung, neu geschrieben

**Bisher** (sinngemäß, aus `plan-verkaufsfertig.md`):

> Mach das Dashboard verkaufsfertig: neuen Laden anlegen, Beispieldaten, Monats-Kalender,
> Nachricht → Termin, Design-Runden, Funktions-Durchgang.

**Neu**, so dass genau die Tiefe gefragt wird. Diesen Text kannst du so in einen neuen Thread kopieren:

> Mein Produkt dashboard-v3 soll kleinen Läden ein Versprechen halten: **Keine Kundenanfrage geht
> verloren, jede wird schnell beantwortet, und die Daten bleiben in Deutschland.**
>
> Bau nicht zuerst neue Funktionen. Zeig mir stattdessen, ob das Versprechen stimmt, und mach es
> überprüfbar:
>
> 1. **Messen:** Woran sehe ich in den Daten, wie schnell ein Laden antwortet und wie viele
>    Anfragen liegen bleiben? Bau, was dafür fehlt (z. B. `beantwortet_am`, Benachrichtigung bei
>    neuer Nachricht).
> 2. **Beweisen:** Schreib Tests, die zeigen, dass Laden A nie Daten von Laden B sieht oder
>    ändert, und lass sie bei jedem PR automatisch laufen. Prüf den Login gegen OWASP ASVS Level 1.
> 3. **Rohmaterial:** Sag mir, welche echten Daten ich von 5 Läden holen soll (Anfrage-Kanäle,
>    verpasste Anfragen, was sie heute zahlen) und gib mir einen Gesprächsleitfaden nach dem Mom Test.
> 4. **Recht:** Liste auf, was ich als Auftragsverarbeiter vor dem ersten zahlenden Laden brauche
>    (AVV, TOMs, Impressum, Datenschutz), mit den Gesetzesstellen und wer es prüfen soll.
> 5. **Prüfer:** Nenne für jedes Ergebnis jemanden außer dir und mir, der nachweisen kann, dass es
>    stimmt, und woran man das sieht.
>
> Erst danach: Ordne meine bisherigen Pakete A bis G danach, was die Pilot-Läden wirklich brauchen.
> Jede Stufe hat ein „Fertig, wenn …“. Eigener Branch, PR mit Git-Befehlen, Doku in `docs/`.

## Was du heute Abend lesen kannst

1. Die Kurzfassung oben: Das sind die drei Lücken.
2. Punkt (4): Wer prüft was. Das ist der Kern von „tiefer statt umfangreicher“.
3. Stufe 0 und 1: Das würde ich als Nächstes bauen, jeweils als eigenen PR.
