# 9. Git-Ablauf: Branch, PR, testen, mergen

So arbeiten wir: **Jede neue Sache bekommt einen eigenen Branch und einen eigenen Pull Request (PR).**
Claude legt den Branch an, schreibt den Code und öffnet den PR. Du liest, testest, mergst.

In jedem PR steht ein Abschnitt **„So testest du das“** mit genau den Befehlen dafür.

## Die Wörter

| Wort                  | Was es ist                                                                              |
| --------------------- | --------------------------------------------------------------------------------------- |
| **main**              | Der Hauptstand. Was hier ist, gilt als fertig.                                          |
| **Branch**            | Eine Kopie von main, auf der man etwas Neues baut, ohne main kaputt zu machen.          |
| **Commit**            | Ein gespeicherter Schritt auf einem Branch, mit kurzer Beschreibung.                    |
| **Pull Request (PR)** | Die Bitte auf GitHub: „Nimm diesen Branch in main auf.“ Dort sieht man alle Änderungen. |
| **Merge**             | Der Branch wird in main übernommen.                                                     |
| **origin**            | Der Name für GitHub (das Repo „da draußen“).                                            |

## Die Befehle

### Neuen Stand von GitHub holen, ohne etwas zu ändern

```bash
git fetch origin
```

`fetch` lädt nur herunter, was es auf GitHub Neues gibt. Deine Dateien bleiben, wie sie sind.

### Einen PR vor dem Mergen lokal testen

```bash
git fetch origin
git checkout <branch-name>     # steht oben im PR, z. B. claude/project-thread-hy2ebq
git pull                       # falls du den Branch schon mal hattest: neuesten Stand holen
vp install                     # nur nötig, wenn package.json geändert wurde
vp run db:migrate              # nur nötig, wenn im PR eine neue Datei in drizzle/ ist
vp run dev
```

`checkout` wechselt auf den Branch. Jetzt sind deine Dateien auf dem Stand des PRs.

### Nach dem Mergen auf GitHub

```bash
git checkout main
git pull
```

Damit hast du lokal wieder main, jetzt mit den neuen Sachen drin.

## Kurz gesagt

```
Claude: neuer Branch von main ──▶ Code ──▶ PR auf GitHub
Du:     PR lesen ──▶ (optional lokal testen) ──▶ Merge ──▶ git checkout main && git pull
```

## Gut zu wissen

- Hast du lokal etwas geändert und willst auf einen anderen Branch, meckert git vielleicht.
  Dann erst `git status` anschauen. Änderungen wegwerfen geht mit `git restore .`
  (Vorsicht: dann sind sie wirklich weg). Aufheben geht mit `git stash`.
- Eine Migration (`vp run db:migrate`) ändert die **echte** Datenbank aus `.env.local`.
  Migrationen fügen bei uns nur Spalten oder Tabellen hinzu, aber trotzdem gut zu wissen.
