## Configuración

Establecer la configuración global

```shell
git config --global user.name "[name]"
git config --global user.email "[email]"
```

## Comenzar

Crear un repositorio git

```shell
git init
```

Clonar un repositorio git existente

```shell
git clone [url]
```

## Commit

Hacer commit de todos los cambios rastreados

```shell
git commit -am "[commit message]"
```

Agregar nuevas modificaciones al último commit

```shell
git commit --amend --no-edit
```

## He cometido un error

Cambiar el mensaje del último commit

```shell
git commit --amend
```

Deshacer el commit más reciente y mantener los cambios

```shell
git reset HEAD~1
```

Deshacer los `N` commits más recientes y mantener los cambios

```shell
git reset HEAD~N
```

Deshacer el commit más reciente y descartar los cambios

```shell
git reset HEAD~1 --hard
```

Restablecer la rama al estado remoto

```shell
git fetch origin
git reset --hard origin/[branch-name]
```

## Varios

Renombrar la rama maestra local a main

```shell
git branch -m master main
```
