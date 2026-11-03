# 11. Team: Mitarbeiter-Logins und Rechte

Stand 03.11.2026 (PR #14).

## Die Idee

Der **Ladeninhaber ist der Admin seines Ladens.** Flo legt nur ihn an (mit
`vp run benutzer:anlegen`). Alles Weitere macht der Inhaber selbst im Dashboard unter **Team**
(`/team`):

- Logins für Mitarbeiter anlegen
- pro Mitarbeiter festlegen: **darf die Webseite bearbeiten** ja oder nein
- ein neues Passwort erzeugen (z. B. wenn es vergessen wurde)
- einen Login entfernen

> Screenshots: Die Bilder liegen in den Projekt-Dateien unter `screenshots/team/`.

## Wer darf was?

| Wer                         | Nachrichten, Termine | Webseite bearbeiten       | Team     | Support-Code |
| --------------------------- | -------------------- | ------------------------- | -------- | ------------ |
| Inhaber                     | ja                   | ja, immer                 | ja       | ja           |
| Mitarbeiter                 | ja                   | nur wenn der Inhaber will | nein     | nein         |
| Flo (admin) mit Code        | ja                   | ja                        | **nein** | nein         |
| Flo (admin) auf Laden-Seite | (keine Kundendaten)  | ja, per Doppelklick       | nein     | nein         |

Warum darf Flo das Team nicht verwalten, auch nicht mit Code? Sonst könnte er sich selbst einen
Login im Laden anlegen und bräuchte nie wieder einen Code. Das wäre genau das Gegenteil von
„kein Blick ohne Zustimmung“ (siehe [10-admin-und-zugangscode.md](10-admin-und-zugangscode.md)).

## Datenbank: drei neue Spalten in `benutzer`

| Spalte          | Inhalt                                                          |
| --------------- | --------------------------------------------------------------- |
| `ist_inhaber`   | `true` beim Inhaber, `false` bei Mitarbeitern und beim admin    |
| `darf_webseite` | Darf die Webseite bearbeiten (beim Inhaber egal: er darf immer) |
| `name`          | Freiwillig, z. B. „Anna“, damit man im Team weiß, wer wer ist   |

Die Migration `drizzle/0005_team.sql` legt die Spalten an. Am Ende steht eine Zeile, die ich
**von Hand** ergänzt habe:

```sql
UPDATE "benutzer" SET "ist_inhaber" = true, "darf_webseite" = true WHERE "rolle" = 'laden';
```

Alle Laden-Logins, die es schon gibt, sind ja Inhaber. Ohne diese Zeile hätten sie nach dem
Update plötzlich keine Rechte mehr. Der Standardwert für neue Zeilen ist bewusst `false`:
vergisst man irgendwo etwas, bekommt jemand **zu wenig** Rechte, nie zu viele.

Die Rolle `laden` bleibt für beide (Inhaber und Mitarbeiter). So sehen beide ganz normal die
Daten ihres Ladens über `sichtbarerLaden()`, daran musste nichts geändert werden.

## Wo im Code geprüft wird

In `app/lib/sitzung.ts` gibt es jetzt drei kleine Funktionen:

```ts
darfLadenBearbeiten(angemeldet, ladenId); // Webseite genau dieses Ladens (Laden-Seite, Doppelklick)
darfWebseiteBearbeiten(angemeldet); // für Menü und /webseite
istLadenInhaber(angemeldet); // für /team und /zugang
```

Die Rechte stehen in der Datenbank und werden **bei jedem Aufruf frisch gelesen**
(`aktuellerBenutzer()`). Nimmt der Inhaber ein Recht weg, gilt das beim nächsten Klick sofort.

Wichtig wie immer: Das Menü versteckt nur Links, die man nicht braucht. Die **echte** Prüfung
steht in jeder Server Action noch einmal (`webseiteSpeichern`, `seiteSpeichern`, alle Team-Actions).
Eine Action kann man nämlich auch ohne Knopf von Hand aufrufen.

## Sicherheit beim Team verwalten (`app/lib/team.ts`)

- **Welcher Laden?** Kommt immer aus der Sitzung des Inhabers, nie aus dem Formular.
- **Nur eigene Mitarbeiter:** Jede Änderung hat dieselbe Bedingung
  `id = … AND laden_id = <eigener Laden> AND rolle = 'laden' AND ist_inhaber = false`.
  Ein Inhaber kann also keinen anderen Inhaber, keinen fremden Laden und nicht den admin ändern.
- **E-Mail schon vergeben?** Dann passiert nichts (`onConflictDoNothing`), mit der Meldung
  „Diese E-Mail hat schon einen Login.“ Würden wir stattdessen überschreiben (wie das Skript
  `benutzer-anlegen` es tut), könnte ein Inhaber den Login von jemand anderem übernehmen.
- **Passwort erzeugt der Server**, z. B. `k7mq-x3pa-9fhw-t2dn`: 16 Zeichen aus 31 möglichen
  (ohne 0/O und 1/l/I, damit man es gut vorlesen kann), mit `randomInt` (echter Zufall).
  Es wird **nur einmal** angezeigt, gespeichert ist nur der scrypt-Hash.
- **Neues Passwort** oder **Entfernen** meldet den Mitarbeiter auf allen Geräten sofort ab
  (seine Zeilen in `sitzungen` werden gelöscht).

## Was getestet wurde

Mit einer lokalen Postgres-Datenbank und echtem Browser (Playwright):

- Inhaber sieht im Menü „Webseite“ und „Team“, legt Anna an, bekommt ein Passwort angezeigt
- Eine E-Mail, die es schon gibt (auch in einem anderen Laden), wird abgelehnt
- Anna sieht nur Termine und Nachrichten. `/webseite`, `/team`, `/zugang` sagen „nicht für dich“,
  auf der Laden-Seite gibt es keinen „Seite bearbeiten“-Knopf
- Inhaber klickt „Erlauben“: Anna hat sofort „Webseite“ im Menü und den Knopf auf der Laden-Seite
- Ein anderer Inhaber sieht Anna nicht in seinem Team
- „Neues Passwort“: Anna ist sofort abgemeldet
- „Entfernen“: Login ist weg

## Später vielleicht

- Mehrere Inhaber (z. B. Ehepaar): ein Mitarbeiter wird zum Mit-Inhaber
- Dass der Mitarbeiter sein Passwort beim ersten Login selbst ändert
- Einladungs-Link per E-Mail statt Passwort vorlesen (braucht E-Mail-Versand)
