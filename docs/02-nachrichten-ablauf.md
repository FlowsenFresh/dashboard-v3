# 2. Ablauf: vom Formular ins Dashboard

Was passiert, wenn jemand auf der Laden-Seite eine Nachricht abschickt?

```
Browser                 Server                                   Neon (Frankfurt)
───────                 ──────                                   ────────────────
KontaktFormular  ──►  nachrichtSenden()          (Server Action)
                        1. Laden finden
                        2. Zod prüft alle Felder
                        3. Anliegen erlaubt?
                        4. nachrichtSpeichern()  ──────────────►  kontakte, nachrichten
                        5. revalidatePath("/nachrichten")
             ◄──────  "Danke! Deine Nachricht ist angekommen."

Dashboard /nachrichten  ◄── alleNachrichten() ◄──────────────────  JOIN der Tabellen
```

## Die Schritte im Detail

**1. Formular** (`app/components/KontaktFormular.tsx`)
Ein Client-Baustein. `useActionState` verbindet das Formular mit der Server Action.
Mit `nachrichtSenden.bind(null, slug)` bekommt die Action den Laden-Slug mit.

**2. Server Action** (`app/laden/[slug]/actions.ts`, Funktion `nachrichtSenden`)
Läuft nur auf dem Server. Der Browser schickt nur die Formulardaten.

- Gibt es den Laden?
- **Nie dem Browser trauen:** Zod (`kontaktSchema`) prüft alle Felder nochmal. Pflicht sind
  Vorname, Nachname, Anliegen und E-Mail **oder** Telefon.
- Ist das Anliegen eins, das dieser Laden anbietet?
- Bei einem Fehler kommt die Meldung zurück, und die eingetippten Werte (`werte`) füllen das
  Formular wieder auf.

**3. Speichern** (`app/lib/nachrichtenSpeicher.ts`, Funktion `nachrichtSpeichern`)

- Sucht den Laden in der Tabelle `laeden` (über den Slug).
- `kontaktFindenOderAnlegen`: Gibt es schon einen Kontakt mit gleicher E-Mail (oder Telefon)
  in diesem Laden? Dann wird die Nachricht an ihn gehängt. Sonst neuer Kontakt.
- Fügt die Nachricht ein. `id`, Status `neu` und die Uhrzeit setzt die Datenbank selbst.
- Kein Betreff angegeben? Dann wird das Anliegen als Betreff genommen.

**4. `revalidatePath("/nachrichten")`**
Next merkt sich fertige Seiten. Dieser Aufruf sagt: "Die Seite /nachrichten ist veraltet,
beim nächsten Aufruf neu bauen." So taucht die Nachricht sofort im Dashboard auf.

**5. Anzeigen** (`alleNachrichten`)
Holt mit einem JOIN Nachricht, Kontakt und Laden in einer Abfrage, neueste zuerst.
Vorher prüft die Funktion den Login (`benutzerPflicht`) und filtert nach dem sichtbaren Laden
(siehe [03-login.md](03-login.md)).

## Status ändern

Im Dashboard kann man eine Nachricht auf `neu`, `gelesen` oder `beantwortet` setzen.

- `app/nachrichten/actions.ts` → `statusAendern(id, status)` prüft mit Zod, dass die ID eine Zahl
  und der Status bekannt ist.
- `nachrichtStatusSetzen` macht ein `UPDATE` **mit Laden-Filter**. Eine fremde Nachrichten-ID
  ändert einfach nichts.
- Danach wieder `revalidatePath("/nachrichten")`.

## Warum ist das so gebaut?

- Seiten und Actions kennen nur die Funktionen im "Speicher". Als wir von der JSON-Datei auf
  Neon umgezogen sind (PR #3), musste fast nur `nachrichtenSpeicher.ts` geändert werden.
- Die Login-Prüfung sitzt **direkt vor den Daten**. So kann keine Seite sie vergessen.
