## 配置

设置全局配置

```shell
git config --global user.name "[name]"
git config --global user.email "[email]"
```

## 入门

创建一个 git 仓库

```shell
git init
```

克隆一个已有的 git 仓库

```shell
git clone [url]
```

## 提交

提交所有已追踪的变更

```shell
git commit -am "[commit message]"
```

将新修改追加到上一次提交

```shell
git commit --amend --no-edit
```

## 出错时

修改上一条提交信息

```shell
git commit --amend
```

撤销最近一次提交且保留修改

```shell
git reset HEAD~1
```

撤销最近的 `N` 次提交且保留修改

```shell
git reset HEAD~N
```

撤销最近一次提交并丢弃修改

```shell
git reset HEAD~1 --hard
```

将分支重置到远端状态

```shell
git fetch origin
git reset --hard origin/[branch-name]
```

## 杂项

将本地 master 分支重命名为 main

```shell
git branch -m master main
```
