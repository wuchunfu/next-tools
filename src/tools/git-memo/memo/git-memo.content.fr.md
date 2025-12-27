## Configuration

Définir la configuration globale

```shell
git config --global user.name "[name]"
git config --global user.email "[email]"
```

## Démarrer

Créer un dépôt git

```shell
git init
```

Cloner un dépôt git existant

```shell
git clone [url]
```

## Commit

Valider tous les changements suivis

```shell
git commit -am "[commit message]"
```

Ajouter de nouvelles modifications au dernier commit

```shell
git commit --amend --no-edit
```

## J'ai fait une erreur

Changer le message du dernier commit

```shell
git commit --amend
```

Annuler le commit le plus récent et conserver les changements

```shell
git reset HEAD~1
```

Annuler les `N` commits les plus récents et conserver les changements

```shell
git reset HEAD~N
```

Annuler le commit le plus récent et supprimer les changements

```shell
git reset HEAD~1 --hard
```

Réinitialiser la branche à l'état distant

```shell
git fetch origin
git reset --hard origin/[branch-name]
```

## Divers

Renommer la branche maître locale en main

```shell
git branch -m master main
```
