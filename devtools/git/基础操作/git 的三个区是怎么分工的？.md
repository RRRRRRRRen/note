# git 的三个区是怎么分工的？

*类型：knowledge ｜ 难度：入门 ｜ 标签：Git、add、commit、status、diff、暂存区 ｜ 更新：2026-09-10*

**日常命令的本质是三区之间搬运内容：工作区（你在编辑的文件）→ index 暂存区（下次提交的草稿，`git add` 写入）→ 本地仓库（对象库里的历史快照，`git commit` 落库），再往右是远程仓库（`git push` 同步）。status 和 diff 只是报告区与区两两之间的差异，记住「比的是哪两区」就不会懵。最关键的一条提交语义：commit 提交的是 index 里的草稿，不是工作区现状——没 add 的改动不进提交，不是 Git 忘了，是语义如此。**

## 技术对照：一套三环境的发布流程

把 Git 的三个区想成**一套三环境的发布流程**：**工作区** = 本地开发环境（随便改，不影响任何人）；**index 暂存区** = staging 预发环境——你挑哪些改动进入下次发布（`git add`），暂存区的内容就是「下次要上线的版本」；`git commit` = 预发内容正式**发布到生产**，进入那座内容寻址的对象库。

有了三环境，所有日常命令都能翻译成发布动作：`add` = 本地 → 预发；`commit` = 预发 → 生产；`status` = 报告本地和预发、预发和生产之间有什么差异；`diff` = 打印两个环境之间的差异清单。方向感建立之后，撤销体系也只是「从指定环境把内容回滚覆盖上游」，每把钥匙管一段（见撤销篇）。

## 三区模型：一切日常命令的坐标系

```text
三区流转 / three areas

工作区 Working Directory
  │ git add
  ▼
index 暂存区（下次提交的草稿）
  │ git commit
  ▼
本地仓库（对象库 + HEAD）
  │ git push
  ▼
远程仓库

反向（虚线）：
远程仓库 ──git fetch / pull──▶ 本地仓库
本地仓库 ──checkout / restore 恢复文件──▶ 工作区
```

读这张图有两个容易写错的箭头。**其一**：`checkout`/`restore` 从**本地仓库**恢复文件到工作区，它们只读本地对象库，**从不联网**；从远程方向来的箭头只有 `fetch`/`pull`，它们做的是「下载缺失对象 + 更新远程书签」（远程协作篇展开）。**其二**：push 的是 `commit` 之后的本地仓库内容，工作区和 index 里没提交的东西 push 永远带不走。

index 的正确定位不是「缓存」而是**草稿**：commit 提交的是 index 那棵 tree 草稿，不是工作区现状——这是对象模型篇埋下的伏笔（未 add 的文件不进提交，不是 Git 忘了，是提交语义如此）。它存在的价值是**提交粒度的自由**：工作区可以同时改五个文件，只挑其中两个逻辑相关的先提交。

补一个高频技巧：`git add -p` 交互式挑改动块（hunk）——同一个文件里「要提交的修复」和「还没写完的实验」分开入库，靠的就是它。暂存区放什么，完全由你决定；反过来，随手 `git add .` 把半个工作区倒进草稿，是「提交大杂烩」的头号来源。

## status 与 diff：方向决定输出

`git status -s` 的两列状态码就是三区视角：第一列对比 index vs HEAD，第二列对比工作区 vs index。真实实验——一个仓库同时存在三种状态的文件：

```bash
$ git status -s
 M app.ts           ← 第二列 M：工作区改了，还没 add
A  staged.txt       ← 第一列 A：已 add，草稿上有它
?? untracked.txt    ← 未追踪：三区里都没有它
```

`git diff` 的三种形态同理，只是把「比哪两区」说得更明白。同一个仓库，三条命令三个视角：

```bash
$ git diff               # 工作区 vs index：app.ts 的改动（未 add）
diff --git a/app.ts b/app.ts
index 83db48f..8792505 100644
--- a/app.ts
+++ b/app.ts
@@ -1,3 +1,3 @@
 line1
-line2
+line2 changed
 line3

$ git diff --staged      # index vs HEAD：staged.txt 的新增（已 add、未 commit）
diff --git a/staged.txt b/staged.txt
new file mode 100644
--- /dev/null
+++ b/staged.txt
@@ -0,0 +1 @@
+staged

$ git diff HEAD~1        # 当前工作区 vs 上一个提交：两次改动合起来看
```

| git diff（工作区 vs index） | git diff --staged（index vs HEAD） |
| --- | --- |
| 回答「我改了什么还没暂存」 | 回答「下次 commit 会提交什么」 |
| add 之后这一项会变空——不是改动丢了，是进了草稿 | commit 之前用它做最后检查，防手滑 |
| 恢复这层改动：git restore <文件> | 撤下草稿：git restore --staged <文件> |

一个典型误读：`git diff` 输出为空，不代表工作区干净——只代表「工作区和 index 一致」，改动可能已经躺在草稿里等 commit。判断「现在到底是什么状态」，永远先 `git status` 定位区与区的关系，再挑对应的 diff 形态看内容。方向搞反是新手最大的困惑源，没有之一。

> **记忆锚点：先看方向，再谈内容**
>
> status 两列状态码 = index vs HEAD、工作区 vs index；diff 不带参数比工作区 vs index，带 --staged 比 index vs HEAD。所有 diff/status 输出，先问「比的是哪两区」，再读内容。

**反例：diff 空输出误读**

```bash
$ git diff
$ # 输出为空——「我刚才的改动呢？！」
$ git add app.ts && git commit
# → 提交的是 add 之前的旧草稿，新改动还躺在工作区
```

> 说明：diff 为空只说明「工作区与 index 一致」，不代表没有未提交的改动。

**正例：**

```bash
$ git status -s            # 先定位：两列状态码各是什么
 M app.ts                  # 第二列 M：改动在，只是已经 add 过
$ git diff --staged        # 确认草稿里的就是它
$ git commit -m "fix: ..."
```

> 说明：「改动丢了」九成是进了草稿。status 定位 → 对应方向的 diff 复核 → 再提交。

**反例：提交内容核查**

```bash
$ git add .
$ git commit -m "改了点东西"
$ git show --stat HEAD
# 11 个文件：半个没写完的实验也进去了
```

> 说明：以为 commit 提交的是「我脑中想提交的那部分」——它提交的是 index 草稿，add 什么进去什么。

**正例：**

```bash
$ git status -s            # 先看两列状态码
$ git add -p                # 交互式挑块，只放该进的
$ git diff --staged         # 提交前最后确认草稿
$ git commit -m "fix: 修复 x"
```

> 说明：status 定位 → add -p 挑块 → diff --staged 复核 → commit。四步节奏固定下来，手滑提交绝迹。
<!---->
> **注意：restore 覆盖不可恢复**
>
> `git restore <文件>` 会用 index 的版本**覆盖**工作区——从未 add 过的改动没有进入对象库，被覆盖就彻底没了。丢弃前先 `git diff` 确认扔掉的确实不要；拿不准就先 `git stash`（撤销篇细讲）。

## 撤销呢？一句话版本

本篇只负责「搬运与对比」，撤销是一整套路由问题，答案只有一个入口问句：**改动现在到哪个区了**。没 add 用 `git restore`，add 了用 `git restore --staged`，commit 了用 `git reset`（三档决定连带清理哪两区），已 push 到共享分支用 `git revert`。这套决策树、reset 三档的真实实验与 stash 的双 parent 本质，全部在撤销篇展开。

另一个先埋的伏笔：上面流程图里「本地仓库」那个格子里藏着 HEAD 和分支指针，`checkout` 切分支、`reset` 回拨历史，动的都是几个 41 字节的指针文件——那是引用系统篇的主题。

## 追问链

**Q1：index 到底解决了什么问题？如果没有它会怎样？**

*考察点：热身题，检验是否把暂存区理解为「提交粒度的控制器」，而不是一个被迫经过的中间站。*

它把「我改了什么」和「我要提交什么」解耦成两个独立决策。没有 index 的版本控制系统只能整文件甚至整工作区提交；有了 index，同一个文件里「要发布的修复」和「没写完的实验」可以被 add -p 拆开，五个文件的改动也能按逻辑切成三个提交。这是 Git 提交历史能保持「一个提交一个意图」的机制基础。

补充：SVN 没有 stage 概念，拆 partial commit 要靠手工备份文件；Git 把这件事做成了第一等公民——比较一下就能体会 index 的设计价值。

**Q2：git commit 提交的是工作区现状吗？**

*考察点：本篇最核心的提交语义，答错的人后面所有「为什么我的改动没进提交」都会问错方向。*

不是。commit 永远把 index 里的那棵 tree 草稿物化成提交对象，工作区现状不参与。所以「改了但没 add」的文件不进提交；「add 后又改」的文件，进提交的是 add 时刻的版本，工作区里更新的部分留在第二列等下一次 add。想提交工作区现状，得先 git add 把草稿对齐。

补充：git commit -a 是「把已追踪文件的改动先 add 再 commit」的快捷方式，但它仍不碰 untracked 文件——新文件永远要显式 add。

**Q3：git diff、git diff --staged、git diff HEAD 各自在比哪两区？**

*考察点：考察「diff 是纯对比、无副作用」的定位是否清楚，以及三区坐标系能否随口套用。*

git diff 比工作区 vs index（未暂存的改动）；git diff --staged 比 index vs HEAD（下次 commit 将带入的内容）；git diff HEAD 比工作区 vs HEAD（从上次提交到现在累计的全部改动，暂存的和未暂存的一起看）。三者都是只读对比，不改变任何区的内容。

补充：git diff --staged 在旧教程里写作 git diff --cached，两者完全等价——cached 是历史名，暂存区曾经就叫 cache。

**Q4：为什么一个文件可以同时「已暂存」和「未暂存」？**

*考察点：进阶题。两列状态码独立工作这个细节，很多人用了几年 Git 都没意识到。*

因为两列对比的是不同的区：add 之后你又改了同一文件，index 里是 add 时刻的版本（第一列显示已暂存 M），工作区是更新后的版本（第二列显示未暂存 M）——status -s 会输出两列都是 M（MM）。此时 commit 进去的是第一列那个旧版本，工作区的新改动继续留在第二列。想让两边一致，再 add 一次。

补充：git add 后 diff 变空、diff --staged 有内容，正是「改动从第二列搬进了第一列」的直观体现——用两个 diff 就能亲手验证两列的独立性。

**Q5：index 的物理形态是什么？它也是一棵树吗？**

*考察点：压轴题，把三区模型压到磁盘层面，检验是否真的把「草稿」落到对象模型上。*

index 是 .git/ 下一个名为 index 的二进制文件，内容是一张扁平的「路径 → blob 哈希 + 权限 + 元数据」有序列表，不是树形结构。git add 就是把文件内容写成一个 blob、在这张表里更新一行；git commit 是把这张表快照成一棵 tree 对象。所以 index 的官方别名就叫「staged tree 的草稿」。

补充：git ls-files --stage 能直接打印 index 的原始内容（每行一个 blob 哈希）；Duy 库时代的 git 写过「index 是下一步提交的原料清单」，这句话就是它的全部语义。

## 延伸阅读

- 前置：《git 为什么不存 diff：内容寻址怎么做的？》——本篇反复提到「对象库」与「tree 草稿」，先知道 commit 是一棵快照树，三区模型才有落点。
- 关联：《restore、reset、revert 怎么选？》——撤销四场景决策树、reset 三档真实实验、stash 的双 parent 本质。
- 关联：《reset --hard 丢弃的提交去哪了？》——分支与 HEAD 是 41 字节指针文件，reflog 是一切后悔药的物理基础。
