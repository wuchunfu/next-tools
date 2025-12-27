## Конфігурація

Встановити глобальну конфігурацію

```shell
git config --global user.name "[name]"
git config --global user.email "[email]"
```

## Початок роботи

Створити git-репозиторій

```shell
git init
```

Клонувати існуючий git-репозиторій

```shell
git clone [url]
```

## Commit

Закомітити всі відстежувані зміни

```shell
git commit -am "[commit message]"
```

Додати нові зміни до останнього коміту

```shell
git commit --amend --no-edit
```

## Я допустив помилку

Змінити повідомлення останнього коміту

```shell
git commit --amend
```

Скасувати останній коміт і зберегти зміни

```shell
git reset HEAD~1
```

Скасувати `N` останніх комітів і зберегти зміни

```shell
git reset HEAD~N
```

Скасувати останній коміт і видалити зміни

```shell
git reset HEAD~1 --hard
```

Скинути гілку до стану віддаленого репозиторію

```shell
git fetch origin
git reset --hard origin/[branch-name]
```

## Різне

Перейменувати локальну гілку master на main

```shell
git branch -m master main
```
