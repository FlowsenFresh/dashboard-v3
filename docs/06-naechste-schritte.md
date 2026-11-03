# 6. Nächste Schritte

Stand 03.11.2026. Erledigt ist: Laden-Seite als Template, CMS, Formular mit Anliegen, Neon, Login, Laden-Wechsler.

## Als Nächstes

1. **Auf Vercel bringen** (Region `fra1`)
   - Projekt mit dem GitHub-Repo verbinden
   - `DATABASE_URL` als Umgebungsvariable eintragen
   - Nur die Laden-Seite ist öffentlich, der Rest braucht Login (macht `proxy.ts` schon)
2. ~~**Laden-Inhalte in die Datenbank (CMS)**~~ erledigt in PR #10, siehe
   [08-laden-template-und-cms.md](08-laden-template-und-cms.md).
   - Später vielleicht: Bilder (Logo, Fotos), Abschnitte ein- und ausschalten, Reihenfolge wählen.
3. ~~**Team-Seite für den Ladeninhaber**~~ erledigt in PR #14, siehe [11-team.md](11-team.md).
4. **admin-Bereich**: neue Läden anlegen (Name + Slug), Logins für Ladenbesitzer anlegen
   (statt nur per Skript). Die Inhalte füllt man danach im CMS.
5. **Termine im Dashboard anlegen und bearbeiten** (bisher nur anzeigen).
6. **Monatsauswertung + Löschen** (siehe [05-entscheidungen.md](05-entscheidungen.md)).

## Vor dem ersten zahlenden Laden (Pflicht)

- [ ] Passwort vergessen
- [ ] 2FA
- [ ] Schutz gegen Passwort-Raten (Rate Limit)
- [ ] Dafür Neon Auth (Frankfurt) prüfen und einbauen
- [ ] Vercel Pro buchen
- [ ] Domain und E-Mail nach dem [Hosting-Plan](https://claude.ai/artifact/71iJniso3uZ2fjZDqB37JB)
- [ ] Datenschutz-Texte (Impressum, Datenschutzerklärung) für die Laden-Seite

## Arbeitsweise

Claude schreibt den Code, Flo liest und lernt. Zu jeder Änderung gibt es eine kurze Erklärung:
was und warum. Antworten auf Deutsch.

Der ursprüngliche Plan aus dem Projekt liegt als Kopie in [07-plan-original.md](07-plan-original.md).
