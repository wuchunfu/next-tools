## Konfiguration

Globale Konfiguration festlegen

```shell
git config --global user.name "[name]"
git config --global user.email "[email]"
```

## Erste Schritte

Ein Git-Repository erstellen

```shell
git init
```

Ein bestehendes Git-Repository klonen

```shell
git clone [url]
```

## Commit

Alle verfolgten Änderungen committen

```shell
git commit -am "[commit message]"
```

Neue Änderungen zum letzten Commit hinzufügen

```shell
git commit --amend --no-edit
```

## Ich habe einen Fehler gemacht

Letzte Commit-Nachricht ändern

```shell
git commit --amend
```

Letzten Commit rückgängig machen und Änderungen behalten

```shell
git reset HEAD~1
```

Die `N` letzten Commits rückgängig machen und Änderungen behalten

```shell
git reset HEAD~N
```

Letzten Commit rückgängig machen und Änderungen verwerfen

```shell
git reset HEAD~1 --hard
```

Branch auf Remote-Status zurücksetzen

```shell
git fetch origin
git reset --hard origin/[branch-name]
```

## Verschiedenes

Lokalen Master-Branch in Main umbenennen

```shell
git branch -m master main
```
