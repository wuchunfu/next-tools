## Configuração

Definir a configuração global

```shell
git config --global user.name "[name]"
git config --global user.email "[email]"
```

## Começar

Criar um repositório git

```shell
git init
```

Clonar um repositório git existente

```shell
git clone [url]
```

## Commit

Fazer commit de todas as alterações rastreadas

```shell
git commit -am "[commit message]"
```

Adicionar novas modificações ao último commit

```shell
git commit --amend --no-edit
```

## Cometi um erro

Alterar a mensagem do último commit

```shell
git commit --amend
```

Desfazer o commit mais recente e manter as alterações

```shell
git reset HEAD~1
```

Desfazer os `N` commits mais recentes e manter as alterações

```shell
git reset HEAD~N
```

Desfazer o commit mais recente e descartar as alterações

```shell
git reset HEAD~1 --hard
```

Redefinir o branch para o estado remoto

```shell
git fetch origin
git reset --hard origin/[branch-name]
```

## Diversos

Renomear o branch mestre local para main

```shell
git branch -m master main
```
