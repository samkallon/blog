---
title: git交互式变基的使用
date: 2025-06-10 20:21:28
tags: [git]
---

## 背景

最近遇到一个问题, 改好的代码提交上去后, 被jenkins提示有代码规范的问题, 修改后需要提交代码, 并且要和之前push的在一块, 才能继续之前的review流程

```shell
git commit --amend --no-edit
```

amend命令指的是修正最近一次提交, --no-edit表示不修改提交信息, 也就是将之前的提交信息保留. 但是问题来了, 我出问题的不是最近一次提交,而是倒数第二次.
问了ai 说是要使用交互式变基 
```shell
git rebase -i HEAD~2
```
然后出来一个文本编辑器,将需要修改的分支前面的pick 改为edit, 保存退出, 然后修改代码,git add
然后继续变基
```shell
git rebase --continue
```
若没有冲突,则自动完成变基
变基完成后, git push即可
