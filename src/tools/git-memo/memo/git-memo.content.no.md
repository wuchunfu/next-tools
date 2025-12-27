## Konfigurasjon

Sett global konfigurasjon

```shell
git config --global user.name "[name]"
git config --global user.email "[email]"
```

## Kom i gang

Opprett et git-arkiv

```shell
git init
```

Klon et eksisterende git-arkiv

```shell
git clone [url]
```

## Commit

Commit alle sporede endringer

```shell
git commit -am "[commit message]"
```

Legg til nye endringer i den siste commiten

```shell
git commit --amend --no-edit
```

## Jeg har gjort en feil

Endre siste commit-melding

```shell
git commit --amend
```

Angre den siste commiten og behold endringene

```shell
git reset HEAD~1
```

Angre de `N` siste commitene og behold endringene

```shell
git reset HEAD~N
```

Angre den siste commiten og fjern endringene

```shell
git reset HEAD~1 --hard
```

Tilbakestill gren til fjernstatus

```shell
git fetch origin
git reset --hard origin/[branch-name]
```

## Diverse

Gi den lokale master-grenen nytt navn til main

```shell
git branch -m master main
```
