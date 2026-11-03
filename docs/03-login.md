# 3. Login (selbst gebaut)

Wir haben den Login selbst gebaut, ohne fremden Anbieter wie Clerk. Grund: Die Daten sollen in
Deutschland bleiben (siehe [05-entscheidungen.md](05-entscheidungen.md)).

## Die Teile

| Datei | Aufgabe |
| ----- | ------- |
| `proxy.ts` | Schnelle Vorprüfung vor jeder Seite: kein Cookie `sitzung`, dann weiter zu `/login` |
| `app/lib/sitzung.ts` | Die echte Prüfung: Ist das Cookie gültig? Wer ist angemeldet? |
| `app/lib/passwort.ts` | Passwörter mit scrypt hashen und prüfen |
| `app/login/actions.ts` | `anmelden` und `abmelden` |
| `scripts/benutzer-anlegen.ts` | Login anlegen oder Passwort neu setzen |

## So läuft ein Login ab

1. Jemand öffnet `/nachrichten` ohne Cookie. `proxy.ts` schickt ihn zu `/login?weiter=/nachrichten`.
2. E-Mail und Passwort werden abgeschickt. `anmelden` prüft mit Zod und sucht den Benutzer.
3. `passwortPruefen` vergleicht das Passwort mit dem gespeicherten Hash.
4. Passt es, startet `sitzungStarten`:
   - erzeugt ein zufälliges Token (32 Bytes),
   - speichert **nur den SHA-256-Hash** des Tokens in `sitzungen` (30 Tage gültig),
   - räumt abgelaufene Sitzungen auf,
   - setzt das Token als Cookie.
5. Weiterleitung zurück zu `/nachrichten`.

## Die Sicherheits-Ideen (zum Lernen)

- **scrypt statt Klartext:** scrypt ist absichtlich langsam (ca. 50 ms pro Login). Wer eine
  geklaute Datenbank durchprobieren will, schafft nur wenige Versuche pro Sekunde.
  Der Hash sieht so aus: `scrypt$131072$8$1$<salz>$<hash>`. Die Parameter stehen mit drin,
  damit man sie später erhöhen kann.
- **Salz:** Zufall pro Passwort. Zwei Leute mit dem gleichen Passwort haben verschiedene Hashes.
- **timingSafeEqual:** Der Vergleich dauert immer gleich lang. Sonst könnte man an der Zeit
  ablesen, wie viel schon stimmt.
- **Ersatz-Hash:** Gibt es die E-Mail nicht, wird trotzdem gegen einen Ersatz-Hash geprüft.
  So verrät die Antwortzeit nicht, welche E-Mails es gibt. Die Fehlermeldung ist auch immer
  dieselbe: "E-Mail oder Passwort stimmt nicht."
- **Nur der Token-Hash in der Datenbank:** Wer die Datenbank liest, kann sich damit nicht anmelden.
- **Cookie-Einstellungen:** `httpOnly` (JavaScript kommt nicht dran), `secure` (nur HTTPS in
  Produktion), `sameSite: "lax"` (fremde Seiten können keine Formulare mit unserem Cookie abschicken).
- **Sicheres `weiter`:** Nur Pfade in unserer App (`/nachrichten`), keine fremden Seiten wie `//boese.de`.
- **Zwei Prüfungen:** `proxy.ts` ist nur schnell und schaut, ob ein Cookie da ist. Die echte
  Prüfung macht `benutzerPflicht()` direkt vor den Daten. Die erkennt auch gefälschte oder
  abgelaufene Cookies.
- **Abmelden** löscht die Zeile in `sitzungen`. Das geht auch "aus der Ferne".

## Rollen: admin und laden

| Rolle | Wer | Was sieht er |
| ----- | --- | ------------ |
| `admin` | Flo | Alle Läden, kann in einen Laden wechseln |
| `laden` | Inhaber oder Mitarbeiter | Nur den eigenen Laden (`benutzer.laden_id`). Wer Inhaber ist und wer die Webseite ändern darf: siehe [11-team.md](11-team.md) |

## Der Laden-Wechsler für den admin (PR #7, ersetzt in PR #12)

> **Hinweis:** Das Auswahlfeld gibt es seit PR #12 nicht mehr. Der admin hat jetzt einen eigenen
> Bereich `/admin` und kommt nur mit einem Code vom Inhaber in ein Kunden-Dashboard.
> Siehe [10-admin-und-zugangscode.md](10-admin-und-zugangscode.md). Der Text unten zeigt, wie es vorher war.

Oben in der Kopfzeile hat der admin ein Auswahlfeld: "Alle Läden" oder ein bestimmter Laden
(`app/components/LadenWechsler.tsx`). Beim Ändern läuft `ladenWechseln` (`app/admin/actions.ts`):

- prüft selbst, dass wirklich ein admin klickt (nicht dem Formular glauben),
- prüft, dass es den Laden gibt,
- speichert die Wahl in `sitzungen.ansicht_laden_id`,
- `revalidatePath("/", "layout")` baut alle Seiten neu.

Die Wahl hängt an der **Sitzung**, nicht am Benutzer. Zwei offene Browser können also
verschiedene Läden zeigen.

### `sichtbarerLaden()` – das Herzstück

```ts
export function sichtbarerLaden(angemeldet: Benutzer): number | null {
  if (angemeldet.rolle === "admin") return angemeldet.ansichtLadenId;
  return angemeldet.ladenId ?? -1; // laden-Benutzer ohne Laden sieht nichts
}
```

- Eine Zahl heißt: nur dieser Laden. `null` heißt: alle Läden.
- Ein Ladenbesitzer bekommt **immer** seinen Laden, egal was in der Sitzung steht.
- Alle Speicher-Funktionen (`alleNachrichten`, `nachrichtStatusSetzen`, `alleTermine`) filtern damit.

## Login anlegen

```bash
vp run benutzer:anlegen
```

Fragt E-Mail, Passwort (mindestens 12 Zeichen) und Laden-Slug ab. Slug leer lassen heißt admin.
Gibt es die E-Mail schon, wird das Passwort neu gesetzt. Das Passwort tippt man ein, damit es
nicht in der Befehls-Historie landet.

## Was noch fehlt

Vor dem ersten zahlenden Laden: Passwort vergessen, 2FA und Schutz gegen Passwort-Raten.
Plan: dafür Neon Auth (Frankfurt) nehmen. Siehe [06-naechste-schritte.md](06-naechste-schritte.md).
