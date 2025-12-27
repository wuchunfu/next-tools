## Конфигурация

Установить глобальную конфигурацию

```shell
git config --global user.name "[name]"
git config --global user.email "[email]"
```

## Начало работы

Создать git-репозиторий

```shell
git init
```

Клонировать существующий git-репозиторий

```shell
git clone [url]
```

## Commit

Закоммитить все отслеживаемые изменения

```shell
git commit -am "[commit message]"
```

Добавить новые изменения к последнему коммиту

```shell
git commit --amend --no-edit
```

## Я допустил ошибку

Изменить сообщение последнего коммита

```shell
git commit --amend
```

Отменить последний коммит и сохранить изменения

```shell
git reset HEAD~1
```

Отменить `N` последних коммитов и сохранить изменения

```shell
git reset HEAD~N
```

Отменить последний коммит и удалить изменения

```shell
git reset HEAD~1 --hard
```

Сбросить ветку до состояния удаленного репозитория

```shell
git fetch origin
git reset --hard origin/[branch-name]
```

## Разное

Переименовать локальную ветку master в main

```shell
git branch -m master main
```
