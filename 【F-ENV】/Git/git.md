# Git

> Git 是一个分布式版本控制系统，用于跟踪代码变更历史、协同开发和版本管理。

## 基础概念

- **工作区（Working Directory）**：项目的实际文件夹
- **暂存区（Staging Area）**：准备提交的变更集合
- **本地仓库（Local Repository）**：本地的 Git 仓库
- **远程仓库（Remote Repository）**：服务器上的 Git 仓库

---

## 初始化与配置

```bash
# 在当前目录初始化仓库
git init
# 创建 my-project 目录并初始化仓库
git init my-project

# 设置全局用户名和邮箱（仅需设置一次）
git config --global user.name "your-name"
git config --global user.email "your-email@example.com"

# 查看当前配置
git config --list

# 设置别名（简化命令）
git config --global alias.st status
git config --global alias.co checkout
```

---

## 三区模型与日常命令

*难度：入门 ｜ 标签：Git、add、commit、status、diff、暂存区*

**日常命令的本质是三区之间搬运内容：工作区（你在编辑的文件）→ index 暂存区（下次提交的草稿，`git add` 写入）→ 本地仓库（对象库里的历史快照，`git commit` 落库），再往右是远程仓库（`git push` 同步）。status 和 diff 只是报告区与区两两之间的差异，记住「比的是哪两区」就不会懵。最关键的提交语义：commit 提交的是 index 里的草稿，不是工作区现状——没 add 的改动不进提交，不是 Git 忘了，是语义如此。**

### 技术对照：一套三环境的发布流程

把 Git 的三个区想成**一套三环境的发布流程**：**工作区** = 本地开发环境（随便改，不影响任何人）；**index 暂存区** = staging 预发环境——你挑哪些改动进入下次发布（`git add`），暂存区的内容就是「下次要上线的版本」；`git commit` = 预发内容正式**发布到生产**，进入那座内容寻址的对象库。

有了三环境，所有日常命令都能翻译成发布动作：`add` = 本地 → 预发；`commit` = 预发 → 生产；`status` = 报告本地和预发、预发和生产之间有什么差异；`diff` = 打印两个环境之间的差异清单。方向感建立之后，撤销体系也只是「从指定环境把内容回滚覆盖上游」，每把钥匙管一段（见「撤销操作」）。

### 三区模型：一切日常命令的坐标系

```text
工作区（编辑的文件）
  │ git add：把改动写入草稿
  ▼
index 暂存区（下次提交的草稿）
  │ git commit：草稿物化为快照对象
  ▼
本地仓库（对象库 + HEAD）
  │ git push：同步到远端
  ▼
远程仓库

回程两支：
远程仓库 ──git fetch / pull──▶ 本地仓库（下载缺失对象 + 更新远程书签）
本地仓库 ──checkout / restore──▶ 工作区（恢复文件，只读本地对象库，从不联网）
```

- `git add`：工作区 → index，挑改动进入草稿
- `git commit`：index → 本地仓库，草稿物化为提交
- `git push`：本地仓库 → 远程仓库，push 的只有 commit 之后的内容
- `git fetch` / `git pull`：远程 → 本地仓库，下载对象并更新远程书签
- `checkout` / `restore`：本地仓库 → 工作区，恢复文件，从不联网

读这张图有两个容易写错的箭头。**其一**：`checkout`/`restore` 从**本地仓库**恢复文件到工作区，它们只读本地对象库，**从不联网**；从远程方向来的箭头只有 `fetch`/`pull`，它们做的是「下载缺失对象 + 更新远程书签」（见「远程协作」）。**其二**：push 的是 `commit` 之后的本地仓库内容，工作区和 index 里没提交的东西 push 永远带不走。

index 的正确定位不是「缓存」而是**草稿**：commit 提交的是 index 那棵 tree 草稿，不是工作区现状——这是对象模型篇埋下的伏笔（未 add 的文件不进提交，不是 Git 忘了，是提交语义如此）。它存在的价值是**提交粒度的自由**：工作区可以同时改五个文件，只挑其中两个逻辑相关的先提交。

补一个高频技巧：`git add -p` 交互式挑改动块（hunk）——同一个文件里「要提交的修复」和「还没写完的实验」分开入库，靠的就是它。暂存区放什么，完全由你决定；反过来，随手 `git add .` 把半个工作区倒进草稿，是「提交大杂烩」的头号来源。

### status 与 diff：方向决定输出

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

| diff 形态 | 比的是哪两区 | 回答的问题 | 撤下 / 恢复 |
| --- | --- | --- | --- |
| `git diff` | 工作区 vs index | 我改了什么还没暂存；add 之后这一项会变空——不是改动丢了，是进了草稿 | `git restore <文件>` |
| `git diff --staged` | index vs HEAD | 下次 commit 会提交什么；commit 之前用它做最后检查，防手滑 | `git restore --staged <文件>` |
| `git diff HEAD` | 工作区 vs HEAD | 从上次提交到现在累计的全部改动（暂存的和未暂存的一起看），只读对比 | — |

一个典型误读：`git diff` 输出为空，不代表工作区干净——只代表「工作区和 index 一致」，改动可能已经躺在草稿里等 commit。判断「现在到底是什么状态」，永远先 `git status` 定位区与区的关系，再挑对应的 diff 形态看内容。方向搞反是新手最大的困惑源，没有之一。另外 `git diff --staged` 在旧教程里写作 `git diff --cached`，两者完全等价——cached 是历史名，暂存区曾经就叫 cache。

> **记忆：先看方向，再谈内容**
>
> - status 两列状态码 = index vs HEAD、工作区 vs index
> - diff 不带参数比工作区 vs index，带 `--staged` 比 index vs HEAD
> - 所有 diff/status 输出，先问「比的是哪两区」，再读内容

**错误做法**（diff 空输出误读）：

```bash
$ git diff
$ # 输出为空——「我刚才的改动呢？！」
$ git add app.ts && git commit
# → 提交的是 add 之前的旧草稿，新改动还躺在工作区
```

- 说明：diff 为空只说明「工作区与 index 一致」，不代表没有未提交的改动。

**正确做法**：

```bash
$ git status -s            # 先定位：两列状态码各是什么
 M app.ts                  # 第二列 M：改动在，只是已经 add 过
$ git diff --staged        # 确认草稿里的就是它
$ git commit -m "fix: ..."
```

- 说明：「改动丢了」九成是进了草稿。status 定位 → 对应方向的 diff 复核 → 再提交。

**错误做法**（提交内容核查）：

```bash
$ git add .
$ git commit -m "改了点东西"
$ git show --stat HEAD
# → 11 个文件：半个没写完的实验也进去了
```

- 说明：以为 commit 提交的是「我脑中想提交的那部分」——它提交的是 index 草稿，add 什么进去什么。

**正确做法**：

```bash
$ git status -s            # 先看两列状态码
$ git add -p               # 交互式挑块，只放该进的
$ git diff --staged        # 提交前最后确认草稿
$ git commit -m "fix: 修复 x"
```

- 说明：status 定位 → `add -p` 挑块 → `diff --staged` 复核 → commit。四步节奏固定下来，手滑提交绝迹。

> **注意：restore 覆盖不可恢复**
>
> `git restore <文件>` 会用 index 的版本**覆盖**工作区——从未 add 过的改动没有进入对象库，被覆盖就彻底没了。丢弃前先 `git diff` 确认扔掉的确实不要；拿不准就先 `git stash`（见「撤销操作」）。

### 常用命令速查

```bash
# 添加单个文件到暂存区
git add filename.txt
# 添加所有修改过的文件
git add .
# 添加特定类型的文件
git add *.js
# 交互式添加（选择性添加部分内容）
git add -p

# 提交并输入提交信息
git commit -m "描述性的提交信息"
# 修改最后一次提交（不改变提交信息）
git commit --amend --no-edit
# 修改最后一次提交（包括提交信息）
git commit --amend -m "新的提交信息"

# 查看当前状态
git status
# 简洁输出状态
git status -s

# 查看工作区与暂存区的差异
git diff
# 查看暂存区与本地仓库的差异
git diff --staged
# 查看工作区与上一个提交的差异
git diff HEAD~1
```

### 撤销呢？一句话版本

本篇只负责「搬运与对比」，撤销是一整套路由问题，答案只有一个入口问句：**改动现在到哪个区了**。没 add 用 `git restore`，add 了用 `git restore --staged`，commit 了用 `git reset`（三档决定连带清理哪两区），已 push 到共享分支用 `git revert`。这套决策树、reset 三档的真实实验与 stash 的双 parent 本质，全部在「撤销操作」展开。

另一个先埋的伏笔：上面示意图里「本地仓库」那个格子里藏着 HEAD 和分支指针，`checkout` 切分支、`reset` 回拨历史，动的都是几个 41 字节的指针文件——那是「引用与分支原理」的主题。

### 追问链

**index 到底解决了什么问题？如果没有它会怎样？**

它把「我改了什么」和「我要提交什么」解耦成两个独立决策。没有 index 的版本控制系统只能整文件甚至整工作区提交；有了 index，同一个文件里「要发布的修复」和「没写完的实验」可以被 `add -p` 拆开，五个文件的改动也能按逻辑切成三个提交。这是 Git 提交历史能保持「一个提交一个意图」的机制基础。

- 延伸：SVN 没有 stage 概念，拆 partial commit 要靠手工备份文件；Git 把这件事做成了第一等公民——比较一下就能体会 index 的设计价值。

**git commit 提交的是工作区现状吗？**

不是。commit 永远把 index 里的那棵 tree 草稿物化成提交对象，工作区现状不参与。所以「改了但没 add」的文件不进提交；「add 后又改」的文件，进提交的是 add 时刻的版本，工作区里更新的部分留在第二列等下一次 add。想提交工作区现状，得先 `git add` 把草稿对齐。

- 延伸：`git commit -a` 是「把已追踪文件的改动先 add 再 commit」的快捷方式，但它仍不碰 untracked 文件——新文件永远要显式 add。

**git diff、git diff --staged、git diff HEAD 各自在比哪两区？**

`git diff` 比工作区 vs index（未暂存的改动）；`git diff --staged` 比 index vs HEAD（下次 commit 将带入的内容）；`git diff HEAD` 比工作区 vs HEAD（从上次提交到现在累计的全部改动，暂存的和未暂存的一起看）。三者都是只读对比，不改变任何区的内容。

**为什么一个文件可以同时「已暂存」和「未暂存」？**

因为两列对比的是不同的区：add 之后你又改了同一文件，index 里是 add 时刻的版本（第一列显示已暂存 M），工作区是更新后的版本（第二列显示未暂存 M）——`status -s` 会输出两列都是 M（MM）。此时 commit 进去的是第一列那个旧版本，工作区的新改动继续留在第二列。想让两边一致，再 add 一次。

- 延伸：`git add` 后 `diff` 变空、`diff --staged` 有内容，正是「改动从第二列搬进了第一列」的直观体现——用两个 diff 就能亲手验证两列的独立性。

**index 的物理形态是什么？它也是一棵树吗？**

index 是 `.git/` 下一个名为 index 的二进制文件，内容是一张扁平的「路径 → blob 哈希 + 权限 + 元数据」有序列表，不是树形结构。`git add` 就是把文件内容写成一个 blob、在这张表里更新一行；`git commit` 是把这张表快照成一棵 tree 对象。所以 index 的官方别名就叫「staged tree 的草稿」。

- 延伸：`git ls-files --stage` 能直接打印 index 的原始内容（每行一个 blob 哈希）。

延伸阅读：git 为什么不存 diff：内容寻址怎么做的？（见「对象模型」）；restore、reset、revert 怎么选？（见「撤销操作」）；reset --hard 丢弃的提交去哪了？（见「引用与分支原理」）。

---

## 撤销操作

*难度：入门 ｜ 标签：Git、restore、reset、revert、stash、撤销*

**撤销命令的选择只有一个入口问句：改动现在到哪个区了。restore 管文件级——`restore <文件>` 用 index 覆盖工作区、`restore --staged` 把草稿撤回工作区；reset 管提交级——把分支指针回拨到目标提交，`--soft/--mixed/--hard` 三档决定 index 和工作区跟不跟着对齐；revert 管共享历史——追加一个反向提交抵消目标，不改写任何已有提交，是已 push 分支的唯一安全解。工作区里从未 add 过的内容不在对象库，任何命令都救不回来。**

### 先定位，再选命令

「撤销」不是一条命令，是四个场景四把钥匙。所有慌乱都源于跳过定位直接想「哪条命令能撤销」——先问改动躺在哪个区，再查表：

| 改动到哪了 | 工具 | 效果与边界 |
| --- | --- | --- |
| 改了文件，还没 add | `git restore <文件>` | 用 index 版本覆盖工作区，改动丢弃（从未入库，不可恢复） |
| add 错了 / 想撤下草稿 | `git restore --staged <文件>` | 改动退回工作区，内容一点不丢 |
| commit 了，还没 push | `git reset --soft/mixed/hard` | 移动分支指针，三档决定连带清理哪两区（见下） |
| 已经 push 到共享分支 | `git revert <commit>` | 新增一个反向提交抵消目标，不改写历史，安全 |
| 想改最后一次提交本身 | `git commit --amend` | 替换成新提交（哈希变），未 push 时随意，已 push 慎用 |
| 临时插入任务，改动没处放 | `git stash` | 工作区 + index 打包成一个临时提交挂到 stash 引用，三区恢复干净 |

这张表的排列顺序就是**危险度递增**的方向：restore 只碰文件，reset 动的是分支历史，revert 之所以排在最后不是因为危险，而是因为它服务于「多人已经看见这段历史」的场景——它不撤回任何东西，只是当众抵消。

### restore：文件级的两个方向

restore 负责两个方向，都是从 HEAD 或 index「取旧版本盖回去」：`git restore <文件>` 用 index 的版本覆盖工作区——「我没 add 的乱改不要了」；`git restore --staged <文件>` 用 HEAD 的版本重写 index——「add 错了，把草稿上这一行划掉」。第二个方向只动 index，工作区内容原样保留。真实实验（接三区篇同一个仓库）：

```bash
$ git restore app.ts             # index → 工作区：丢弃未暂存的修改
$ git status -s                  # app.ts 从第二列消失
A  staged.txt
?? untracked.txt

$ git restore --staged staged.txt   # HEAD → index：撤下草稿
$ git status -s                  # staged.txt 退回 untracked，文件还在磁盘上
?? staged.txt
?? untracked.txt
```

> **危险：第一个方向不可恢复**
>
> `git restore app.ts` 覆盖掉的是**从未进入对象库的内容**——没有 blob 承载它，reflog 也无从记起。这是 Git 里少数真正「没了就没」的操作。拿不准时先 `git diff` 看一眼要扔什么，或先 `git stash` 留个后路。

旧版等价写法（旧教程与脚本里常见）：`git checkout -- <文件>` ≡ `git restore <文件>`；`git reset HEAD <文件>` ≡ `git restore --staged <文件>`。

### reset：回拨分支指针的三档

reset 的核心动作只有一个：**把当前分支指针改写到目标提交**（分支只是一个 41 字节的指针文件，这正是它危险的原因——共享分支被 reset 等于改写公共历史）。三档的区别只在于「指针挪走之后，index 和工作区跟不跟着对齐」。下面用四个提交的临时仓库把三档一次性真实走完：

```bash
$ git log --oneline
6f4b24a d
d1a5658 c
296bc90 b
b7a168b a

$ git reset --soft HEAD~1        # 从 d 出发：只动分支指针
$ git status -s
M  f.txt                         ← 第一列 M：改动留在 index，随时重新 commit
$ git diff --staged | tail -4
 a
 b
 c
+d                               ← d 的改动完整躺在草稿上
$ git log --oneline | head -1
d1a5658 c

$ git reset --mixed HEAD~1       # 默认档：指针 + 重置 index
Unstaged changes after reset:
M	f.txt                       ← 改动退回工作区，需要重新 add
$ git status -s
 M f.txt
$ git log --oneline | head -1
296bc90 b

$ git reset --hard HEAD~1        # 指针 + index + 工作区，全部对齐目标
HEAD is now at b7a168b a
$ git status -s                  ← 输出为空：三区全干净
$ cat f.txt
a                                ← 工作区内容也回滚了，未提交改动彻底消失
```

- `--soft`：只动分支指针，index 与工作区原样
- `--mixed`：指针 + 重置 index（默认）
- `--hard`：指针 + index + 工作区全对齐

选档口诀：**想重新组织提交用 soft**（改动回到暂存区，换个方式再 commit）；**想撤提交但保留改动继续写用 mixed**；**hard 是三区全对齐**——按下之前确认工作区没有值得留的东西。危险度的根源不在「删提交」：哪怕 --hard，被撤的提交对象本体仍在对象库里，可达提交的 reflog 默认保留 90 天、不可达提交的记录默认 30 天（`gc.reflogExpire`/`gc.reflogExpireUnreachable`），窗口内都能从 reflog 捞回——真正的不可逆风险只有一类：hard 连工作区一起覆盖，而**从未 add 过的工作区内容没有任何对象承载**。

> **记忆：reset 动的是指针，不是对象**
>
> - 任何档位的 reset 都不删除提交对象，只是把分支文件改写到目标提交
> - 旧提交从分支链上「摘下来」，靠 reflog 维持可达
> - 真正物理消失要等 reflog 过期 + gc 修剪两个条件同时满足

### revert：在共享历史上只做加法

同样是「撤销一个提交」，revert 和 reset 走的路完全相反：**reset 把历史往回拨**（目标提交从分支链上消失）；**revert 在历史前面追加一个「反着做」的新提交**（目标提交还在，但它的效果被抵消）。前者历史干净但形状变了，后者历史变长但谁都没被背叛。

| | revert：追加抵消（安全） | reset：回拨指针（强力） |
| --- | --- | --- |
| 机制 | 生成新提交，内容 = 目标提交的反向 diff | 分支直接改指到目标提交 |
| 历史 | 不改写任何已有提交，无分叉风险 | 目标之后的提交脱离分支链（reflog 可救） |
| 适用 | 已 push / 共享分支的唯一推荐 | 仅限未 push 的本地提交 |
| 配套 | 撤销合并时需要 `-m` 指定保留哪条主线 | 配合三档决定工作区/index 怎么清理 |

撤销 merge 提交时 `git revert -m 1 <哈希>` 的原理：普通提交的撤销方向唯一（反向 diff 即可），而 merge commit 有两个 parent，Git 无法自行判断「抵消哪条线、保留哪条线」——`-m 1` 声明「沿第一个 parent（通常是合入时的主线）的方向保留」，merge 带进来的那批改动全部被反向抵消。这里「parent 的结构语义」在「三方合并」有完整展开。

**错误做法**（共享分支撤销）：

```bash
$ git push                          # 被拒：远端有同事的提交
$ git reset --hard HEAD~1           # 把同事的提交一起"撤"掉
$ git push --force                  # 强推覆盖远端
# → 同事的提交悬空，团队抓狂
```

- 说明：reset + force push 是组合灾难：你甩掉的远不止自己的提交。

**正确做法**：

```bash
$ git revert <问题提交哈希>          # 追加反向提交
$ git push                          # 正常快进推送
# → 历史完整保留，问题提交的效果被抵消
```

- 说明：共享历史上只做加法（revert），不做减法（reset）——这是协作的铁律。

### stash：一个挂在栈式引用上的临时提交

正写着 feature，线上报 bug 要马上切 main——改动没到能提交的程度，`git stash` 把工作区 + index 的现状打包存起来、三区瞬间恢复干净；忙完 `git stash pop` 原样取回。它不是什么特殊存储，看内部结构就知道：**stash 就是一个普通 commit**，被挂在 `refs/stash` 这个引用上——相当于一条「随手 push、随手 pop」的栈式临时分支，每次 stash 都生成一个新提交入栈。

```bash
$ git stash push -m "wip: 实验"
Saved working directory and index state On main: wip: 实验
$ git stash list
stash@{0}: On main: wip: 实验

$ git cat-file -p stash
tree 88887364ca953cd414058dc26177a4a444998bdb
parent f8e0226436f8eaac44f19e9788b52c4a66e7d871    ← parent₁：stash 时的 HEAD
parent e9b65e2515d19eeb9f704b071e649359d66cdab8    ← parent₂：当时的 index 状态
author dev <dev@example.com> 1788973942 +0800

On main: wip: 实验
# → 两个 parent：一个指向提交历史，一个专门记录 index 的快照
```

这个「本质是 commit」的认知直接给出三条使用纪律：**untracked 文件默认不入栈**（它不在 index 里，要带上用 `git stash -u`）；**stash 不是长期仓储**——栈会被 `git stash clear` 一键清空，塞进去的任务放久了不是丢失就是「stash@{3} 是啥来着」；**pop 有冲突时会拒绝丢弃条目**，冲突解决后手动 `git stash drop` 即可——它宁可让你留着重复，也不替你销毁内容。

```bash
# 快速保存当前工作区和暂存区的所有更改
git stash
# 保存并附加描述信息
git stash push -m "work in progress"
# 保存所有更改（包括未跟踪的新文件）
git stash push -m "wip" --include-untracked

# 查看所有保存的 stash 列表
git stash list
# 应用最近一次 stash 并从列表中删除
git stash pop
# 应用指定索引的 stash（不从列表中删除）
git stash apply stash@{1}
# 删除指定的 stash
git stash drop stash@{0}
# 清空所有 stash
git stash clear
# 把指定 stash 变成新分支上的改动（临时周转转正为工作线）
git stash branch <新分支>
```

**错误做法**（reset --hard 前的自检）：

```bash
$ git reset --hard HEAD~2    # 直接回拨
# 下班前发现：还有两个没 add 的改动没了
```

- 说明：hard 会用目标提交对齐工作区——从未 add 过的内容没有对象承载，覆盖即蒸发。

**正确做法**：

```bash
$ git status -s              # 先看工作区有没有未入库的东西
$ git stash push -m "hard 前留底"   # 拿不准的内容先入栈
$ git reset --hard HEAD~2
$ git stash pop              # 确认不需要再丢弃
```

- 说明：hard 不是不能用，而是「先盘点工作区」这个动作永远不能省。

### 撤销自查清单

- 工作区改动误删：`git restore <file>` 找回——只动工作区，不碰暂存区
- 已 add 的改动撤回：`git restore --staged <file>`——回到未暂存状态，文件内容不变
- 本地提交回退：`git reset --soft HEAD~1`——soft 保留改动在暂存区；确认不要内容时才用 mixed/hard
- 公共分支回退：`git revert <commit>`——生成反向提交，历史只增不删
- `reset --hard` 之前：先 `git rev-parse HEAD` 抄下提交号——丢了还能靠 reflog 找回，但前提是先有号

### 追问链

**git commit --amend 到底做了什么？已 push 的提交还能 amend 吗？**

amend 生成一个全新的 commit 对象替换当前分支顶端（parent 指向原提交的 parent），原提交被抛弃、只能靠 reflog 找回——所以「修改」是幻觉，实际是重建。技术上已 push 的提交也能 amend，但改写后的哈希与远端分叉，必须 force push 才能同步，等于单方面改写共享历史——共享分支上不要做；自己未推送的提交随便 amend。

- 延伸：amend 前忘 add 文件是经典场景：先 `git add` 漏的文件、再 `amend --no-edit`，一次提交补全，不用 cancel 重提。

**git reset --hard 把不想删的改动删了，还能救吗？**

分两种：被 --hard 撤掉的是「已提交的内容」→ 能救，`git reflog` 找到 reset 之前的哈希、`git branch rescue <哈希>` 或直接 reset 回去（对象在 reflog 过期前一直存活）。被删的是「从未 add 过的工作区改动」→ 救不了，那部分内容从未进入对象库，没有任何对象承载它。这正是「commit 早、commit 小」的保险价值：进过对象库的东西几乎不丢。

- 延伸：IDE 的 Local History、编辑器 undo 栈是未 add 内容的最后一线希望——但这属于编辑器的仁慈，不是 Git 的承诺。

**reset --soft、--mixed、--hard 各适合什么场景？为什么 --hard 最危险？**

soft 只动分支指针，index 与工作区原样——适合「重新组织提交」：改动留在草稿上换个方式 commit；mixed（默认）指针 + 重置 index，改动退回工作区——适合「撤回提交继续写」；hard 三区全对齐目标——适合「彻底丢弃」，最危险因为它连工作区一起覆盖，未提交的改动直接消失。危险度的根源：hard 是唯一碰工作区的档位，而工作区内容可能从未入过对象库（无备份）。

- 延伸：`git reset` 等价于 `reset --mixed HEAD`，只重置 index 不动提交——这是「全部撤下草稿」的快捷方式，与 `restore --staged` 的多文件版对应。

**revert 一个 merge commit 为什么会报错？-m 参数在选什么？**

普通提交撤销方向唯一（反向 diff 即可），merge commit 有两个 parent，Git 不知道「抵消掉的是哪条线、保留哪条线」，必须 `git revert -m 1 <哈希>` 显式声明：1 = 保留第一个 parent（你合入时的主线），2 = 保留被合入的分支。日常语义：`-m 1` 表示「这批 feature 的改动全部不要了」。

- 延伸：revert 掉 merge 之后又想重新合入这个分支，直接 merge 会「看起来无变化」（历史里已有这些提交）——需要 revert 那个 revert，或 rebase 生成新哈希再合。

**stash 和 branch 都能「先存改动再切走」，怎么选？**

按时间尺度和意图划界：stash 是几分钟到几小时的临时周转——插个 bug 修复就回来，语义是「这些改动还没想好怎么办」；branch 是以天计的正式工作线——改动值得一个名字和一段历史，语义是「这是一条并行任务」。几十分钟的插入任务 stash 顺手；超过一天、或者改动已经成型，直接开分支提交，比 stash 里躺着一条 `stash@{3}` 靠谱得多。

- 延伸：`git stash branch <新分支>` 能把指定 stash 直接变成新分支上的改动——当临时周转发现东西值得长做时，这就是 stash 到工作线的转正通道。

延伸阅读：reset --hard 丢弃的提交去哪了？（见「引用与分支原理」——reflog 与 GC 的完整生命周期）；同一文件为什么有时冲突有时不冲突？（见「三方合并」——revert -m 背后的双 parent 结构语义）。

---

## 历史记录

```bash
# 查看详细提交历史
git log
# 以一行显示简要历史
git log --oneline
# 查看图形化的分支历史
git log --graph --oneline --all
# 查看指定文件的历史（跟踪重命名）
git log --follow filename.txt
# 显示每次提交的文件变更统计
git log --stat
# 显示每次提交的具体代码变化
git log -p

# 查看 HEAD 移动历史（包含已删除的提交，用于找回误删内容）
git reflog
# 查看特定分支的移动历史
git reflog show feature-branch
```

- 撤销类命令（`reset` / `revert` / `restore`）的速查与原理见「撤销操作」章节。

---

## 分支管理

```bash
# 查看本地分支（当前分支前有 * 标记）
git branch
# 查看所有分支（包括远程分支）
git branch -a
# 查看远程分支
git branch -r

# 创建新分支
git branch feature-branch
# 删除本地分支（已合并才能删除）
git branch -d feature-branch
# 强制删除本地分支
git branch -D feature-branch

# 切换到指定分支（checkout）
git checkout branch-name
# 创建并切换到新分支
git checkout -b new-feature
# 恢复指定文件到指定版本
git checkout HEAD~1 -- filename.txt

# 切换到指定分支（switch，较新版本推荐）
git switch main
# 创建并切换到新分支
git switch -c new-feature
# 切换到上一个分支
git switch -
```

---

## 对象模型：内容寻址

*难度：入门 ｜ 标签：Git、对象模型、SHA-1、快照、blob、tree、tag*

**Git 快的本质只有一句话：它从不比较内容，只做哈希查找。每个文件的内容算出 SHA-1 哈希，哈希就是它在对象库里的地址；每次提交记录的是整个项目的快照（一棵指针树），没改的文件直接引用旧对象，所以取版本是 O(1) 定位、diff 只是展示用的临时计算。`git cat-file -p HEAD` 可以直接拆开任意一个对象看内部——理解了 blob（内容）、tree（目录）、commit（历史）、tag（锚定版本的批注）四种对象，Git 的一切行为都能从模型推出来，不再需要死记。**

### 技术对照：HTTP 缓存的 ETag 与 CDN 内容寻址

Git 的对象库用的正是 **HTTP 缓存里 ETag 的同款思路**：资源入库时不编流水号，而是直接用「内容的哈希」当地址——内容不变，ETag 不变，永远命中同一份资源，天然去重。分支只是指向某个版本的可变指针，移动指针不动任何资源。

这个对照里藏着后面所有内容的对应物：**blob** = CDN 上按哈希存的响应体（只有内容本身）；**tree** = 描述目录结构的 manifest（写着哪个名字对应哪个资源）；**commit** = 带版本号的发布清单（指向一整套 manifest，还记着上一版清单的编号）；**分支** = 一个可以随时改写的指针（如 `latest` 标签）。内容一旦入库永不修改，所有「版本变化」都只是写入新内容、重新发布一份清单。

### 快照，不是补丁

很多人对 Git 的第一印象是「它存修改记录」：第 1 版 → 打补丁 → 第 2 版 → 再打补丁……这是早期一些 VCS（以及人对「版本管理」的直觉想象）。在这个模型下，取第 1000 版要从第 1 版开始依次回放 999 个补丁，版本越老的项目越慢。

Git 的选择完全相反：**每次提交都存整个项目的完整快照**。听起来像要爆炸的磁盘开销？不会——快照里没变的文件只是「指向旧对象的引用」，物理上一个字节都不重复写。于是取任意版本都变成读一张现成的快照，成本与版本新旧无关。

| | 增量补丁模型 | 完整快照模型（Git） |
| --- | --- | --- |
| 存储对象 | 存储「变化」：每个版本 = 上一版 + 补丁 | 存储「状态」：每个版本 = 一棵完整的指针树 |
| 取旧版本 | 要从头回放全部补丁，越老越慢 | O(1) 直接定位，与版本新旧无关 |
| 当前 vs 历史 | 当前版本快，历史版本越来越慢 | 任何版本同等速度 |
| diff | 参与存储模型 | 只是展示用的临时计算，不参与存储 |
| 健壮性 | 历史链条断一环，后面全废 | 对象不可变，损坏一环不影响其他版本 |
| 代表 | 早期 CVS / 直觉想象中的 Git | Git |

一个容易忽略的推论：**diff 在 Git 的关键路径上根本不存在**。存储靠哈希、取版本靠哈希、分支靠指针，全都不需要比较内容；只有你主动敲 `git diff` 想看差异时，Git 才临时解压两个版本算一次——算完即弃。所以「Git 对比差异为什么那么快」这个问题本身就问反了：它快不是因为对比快，而是因为绝大多数操作压根不需要对比。

### 一切皆对象，地址就是内容哈希

Git 仓库的核心是 `.git/objects/` 目录——一个巨大的「内容寻址数据库」。任何内容进去，先算 SHA-1 哈希，然后用哈希当地址存放。哈希即地址意味着两件事：**内容变则地址变**（改动必然产生新对象），**内容同则地址同**（相同内容天然去重，全宇宙通用）。

验证只要一行命令。比如「空内容」的哈希在任何机器、任何仓库里都是同一个值：

```bash
$ git hash-object --stdin < /dev/null
e69de29bb2d1d6434b8b29ae775ad8c2e48c5391
```

这串 40 位十六进制不是随机 ID，是 SHA-1(空串) 的数学结果——任何人、任何时间算都会得到它。你在 `git log` 里见过的 `e69de29` 开头的 blob（比如某次提交里的空 README），全都是同一个对象。这个性质后面还会反复出现：空目录、空文件之所以「免费」，就是因为它们的哈希是确定的，无需任何特殊处理。

### blob：只管内容，不管名字

一个文件在 Git 里存为 **blob**（Binary Large OBject，数据库老术语，泛指「一坨不解释内容的数据」）：zlib 压缩后的文件内容 + 大小头，仅此而已——**没有文件名、没有路径、没有权限信息**。

「名字」存在哪？存在 tree 里。这个拆分是 Git 设计的精髓：内容与名字分离之后，改名、移动文件变得几乎免费。真机验证——把文件改名后再算哈希：

```bash
$ echo hello | git hash-object --stdin
ce013625030ba8dba906f756967f9e9ca394464a

$ git hash-object a.txt      # 内容为 hello 的 a.txt
ce013625030ba8dba906f756967f9e9ca394464a

$ mv a.txt b.txt && git hash-object b.txt
ce013625030ba8dba906f756967f9e9ca394464a    ← 一模一样
```

三个哈希完全相同。对 blob 来说 `a.txt` 和 `b.txt` 是同一个对象——改名只是 tree 里那一行文字变了，内容本体纹丝不动。这就是 Git 能自动识别 rename 的全部原理：它看到「这个 blob 哈希以前挂在别的名字下」，不需要任何启发式猜测。

### tree：目录就是一张哈希清单

**tree** 对应一个目录的快照：一张「名字 → 哈希」的映射表，每个条目是四元组——**权限模式 + 对象类型 + 哈希 + 文件名**。子目录就是指向另一个 tree 的条目，层层嵌套构成整棵快照树。用 `git cat-file` 能直接拆开一个真实仓库的根 tree：

```bash
$ git cat-file -p HEAD^{tree}
100644 blob 39fa2a5...	.dockerignore
100644 blob dfa9518...	.gitignore
040000 tree 6f00e3b...	.opencode              ← 子目录：又是一个 tree
100644 blob 0e278fd...	.oxfmtrc.json
100644 blob ca25cdb...	AGENTS.md
...
```

逐列读：第一列 `100644` 是权限模式——Git 只追踪「是否可执行」一位（`100644` 普通 / `100755` 可执行 / `040000` 目录），其余 rwx 细节一概不管；第二列是类型（blob 或 tree）；第三列是对象哈希；最后一列是文件名。这个四元组也解释了一个经典怪现象：**空目录为什么不被 Git 追踪**——tree 是「有内容的清单」，目录里没有任何文件就没有东西可指，连 tree 都不会生成。这不是功能缺失，是模型下的必然。

### 一次提交的完整结构

把 blob、tree、commit 三层拼起来，一次提交的完整结构长这样（tag 对象不参与提交图，它在引用层给某个 commit 钉锚点）：

```text
commit（第 2 次提交）
  ├── tree ────▶ tree 根目录清单 v2
  │                ├── a.txt ──▶ blob a.txt（新内容）
  │                └── b.txt ──▶ blob b.txt（复用 v1 的同一对象）
  └── parent ──▶ commit（第 1 次提交）
                    └── tree ──▶ tree 根目录清单 v1
                                   ├── a.txt ──▶ blob a.txt（旧内容）
                                   └── b.txt ──▶ blob b.txt（同一对象）
```

看第 2 次提交：只改了 `a.txt`，于是只有它是新 blob；`b.txt` 的内容没变、哈希没变，第 2 棵 tree 直接引用第 1 次提交时的同一个对象——**这就是「快照逻辑上完整、物理上只存增量」**。改 1 个文件提交 100 次，仓库只多 100 个小 blob，不会膨胀 100 倍全量。

### commit：唯一带历史的对象

blob 和 tree 都是「纯数据」，不含时间、作者、因果关系。**commit** 是唯一携带历史的对象：它指向一棵根 tree（这个时刻的完整快照）、指向一个（或合并时的两个）parent commit，外加作者、时间与提交说明。拆开一个真实 commit：

```bash
$ git cat-file -p HEAD
tree 9d186ecd31430d25dc114fba11ed557704c1e1c6
parent a266a083008bbc543b4fb79ac907998839ccdf30
author renguoqiang <dittorenard@outlook.com> 1787898618 +0800
committer renguoqiang <dittorenard@outlook.com> 1787898618 +0800

refactor: 事件循环笔记按最新规范重写……
```

四行头部信息读作：**tree 行**——「这个时刻的全部内容在这里」；**parent 行**——「我是从那个提交长出来的」（没有 parent 就是根提交，merge 提交则有两行）；**author/committer 行**——谁、什么时候。仅此而已，没有任何魔法字段。

### tag：第四种对象，给提交钉上的批注

**tag** 是四种对象里最不常被拆开看的一种：它是「指向另一个对象 + 一段批注」的封装，典型用途是给发布锚定的那个 commit 附上版本号、打签名的人和时间。注意对象模型里说的 tag 指 **annotated tag**（`git tag -a` 创建）——它自己就是一个可 `cat-file` 的对象；而轻量 tag（`git tag v0.0`）只是 `refs/tags/` 下一个直接指向 commit 的指针文件，和分支文件同构，没有对象本体。真机拆开对比：

```bash
$ git tag -a v0.1 -m "release v0.1"

$ git cat-file -t v0.1
tag                                    ← v0.1 是一个「tag 对象」

$ git cat-file -p v0.1
object 8e56b172a1571e1c91b1cc58fc846889886614a4    ← 指向哪个 commit
type commit                                        ← 指向的对象类型
tag v0.1                                           ← tag 的名字
tagger dev <dev@example.com> 1788973952 +0800      ← 谁打的、何时

release v0.1

$ git tag v0.0                         # 轻量 tag 对照
$ git cat-file -t v0.0
commit                                 ← 没有对象本体，直接就是 commit
```

tag 对象让「版本」从分支的移动状态里独立出来：分支会前进，tag 对象一经创建就钉死在那个 commit 上——发布历史因此有了不可变的锚点。批量看一个仓库的对象构成，`git cat-file --batch-all-objects --batch-check` 能列出全部对象的类型与大小，四种类型一目了然。

> **提示：签名 tag**
>
> `git tag -s` 创建 GPG 签名的 tag 对象：批注区域带上 `-----BEGIN PGP SIGNATURE-----`，任何人都能用发布者的公钥验证「这个版本确实是本人发布的」。发布不可变锚点 + 可验证来源，这是 tag 对象区别于分支文件的全部意义。

> **记忆：哈希即地址，快照即版本**
>
> - 内容决定哈希，哈希决定地址：内容变 → 必然新对象；内容同 → 必然复用
> - 每次提交是一棵完整的指针树（快照），没变的文件引用旧对象（物理增量）
> - 版本管理的一切操作——存、取、分支、同步——都建立在这条之上

### 一次 commit 之后发生了什么

把 `git commit` 放到显微镜下，它只做四步写操作，没有遍历、没有全局计算：

- **存新 blob**：改动文件算哈希、zlib 压缩入库
- **生成新 tree**：没变的条目直接复用旧 tree
- **写新 commit**：指向新 tree + 上一个 commit
- **改写分支**：分支文件指向新 commit（41 字节）

每一步的输出都是「新增几个小文件 + 改写一个 41 字节的指针文件」。这套流程快到什么程度？它不检查远程、不比对历史、不整理目录——**「快速提交」不是优化出来的，是流程里根本没有慢的步骤**。顺带一提，工作区到对象库的桥叫 index（暂存区），它的本质是「下次提交那棵 tree 的草稿」——`git add` 就是把文件写入这份草稿。

**错误做法**（心智模型校准）：

```text
# 直觉模型：Git 存的是「修改」
commit = 补丁包
取 v99 = v1 打 98 个补丁
改文件名 = 文件被「重新保存」了一遍
空目录想提交 → 加 .gitkeep 纯属 Git 有 bug
```

- 说明：把 Git 当成 diff 存储器，所有现象都会显得像补丁式特例。

**正确做法**：

```text
# 对象模型：Git 存的是「状态」
commit = 完整快照（复用未变对象）
取 v99 = 直接读 v99 的树，O(1)
改文件名 = tree 里换一行字，blob 不动
空目录 = 没有任何东西可指，自然不追踪
```

- 说明：有了正确的模型，这些行为全是推论，无需死记。

**错误做法**（海量小文件仓库）：

```bash
# 数十万文件的仓库 + 高频提交，从不整理
$ ls .git/objects/00 | wc -l
2002                        # 每个两位目录下塞满小文件
# → inode、目录项、open 调用全面吃紧
```

- 说明：松散对象是「写路径最便宜」的设计，但读路径与文件系统迟早为海量小文件买单。

**正确做法**：

```bash
$ git gc            # 打包成 packfile + idx 索引
$ ls .git/objects/pack
pack-xxx.pack  pack-xxx.idx   # 几十万个对象收敛成两个文件
```

- 说明：「日常松散、定期打包」是设计意图——写入永不整理，整理交给 gc（见「存储与回收」）。

**错误做法**（改代码前的对齐）：

```bash
# 上周 clone 的仓库，直接开工
$ vim app.ts && git commit -am "fix: ..."
$ git push
 ! [rejected] main -> main (fetch first)
```

- 说明：远端早前进了新提交，你的提交和它分叉——内容寻址下这是两个必然不同的新对象。

**正确做法**：

```bash
$ git pull --rebase   # 先对齐再开工（或开工前 fetch）
$ vim app.ts && git commit -am "fix: ..."
$ git push             # 快进关系成立，一次推过
```

- 说明：改之前先让本地 main 与远端对齐，避免制造注定要合并的分叉历史。

### 追问链

**在一个已有提交的基础上，同一文件修改并提交 10 次，仓库里存了几份？**

该文件逻辑上 11 个版本，物理上 11 个 blob 对象（首次提交 1 个 + 后续 10 次修改各 1 个），但不是 11 份完整拷贝。每次修改内容变化 → SHA-1 变化 → 生成新 blob，旧 blob 原样保留（这正是版本回溯的依据）；同时其余没改的文件一个新对象都不产生。仓库整体是 11 个 commit + 有变化的 tree + 11 个该文件的 blob，增长与「变化量」成正比，与项目大小无关。

- 延伸：Git 后台还会把松散对象打包成 packfile，对相似 blob 做字节级 delta 压缩——11 个版本在磁盘上可能只有 1 份基准 + 10 份增量。这是存储层的透明优化，不改变「每版一个对象」的逻辑模型。

**为什么 Git 改名文件不用重新存储，而某些系统「另存为」就翻倍占空间？**

因为 Git 里文件名的存储位置根本不在 blob 里。blob 只封内容的字节流，名字、路径、权限全部记录在 tree 的清单条目中——改名只是改 tree 里那一行（而 tree 本身也要按内容寻址，所以是新建一个小 tree 对象），内容对象的哈希纹丝不动，自然零拷贝。凡是把「名字 + 内容」绑定存储的系统，改名都等于产生一份新内容。

- 延伸：这也解释了 Git 的 rename 检测为什么可靠：比较新旧 tree 时发现「同一个 blob 哈希换了名字挂载」，是精确匹配而非相似度猜测。

**两个内容完全相同的文件（比如各目录下的 LICENSE），Git 存几份？**

只存一份。哈希由内容唯一决定，两个文件的内容字节完全一致 → 哈希一致 → 指向同一个 blob 对象。两份「文件」只是两棵 tree 里各自有一行清单指向同一个地址。哪怕这两个文件在不同分支、不同目录、不同提交里，去重同样生效——对象库是全仓库共享的一张地址表。

- 延伸：想验证「某个内容在历史里出现过没有」，把内容 hash-object 一遍、拿哈希去 cat-file 查即可，不需要遍历任何历史。

**SHA-1 哈希理论上会碰撞吗？Git 为什么敢把它当地址用？**

会，但 Git 的用法让碰撞的实际风险低到可忽略。SHA-1 作为校验和已被攻破（能伪造同哈希的两个文件），但 Git 2005 年起就按「防蓄意攻击的签名」以外的用途使用它：对象地址同时受内容格式约束（blob 前有长度头、tree/commit 有结构），伪造碰撞成本极高；且 Git 早已默认用 SHA-1 的加强变体（碰撞检测版）计算对象哈希，并正在推进 SHA-256 仓库格式作为彻底的出路。

- 延伸：对「寻址」而言，最重要的性质其实是单向性与确定性，而不是抗碰撞：地址由内容算出、同内容必得同地址，去重和寻址已经成立；碰撞只影响「不同内容被误判为相同」这一种极端情况。

**既然每次提交都是完整快照，为什么一个大仓库改 1000 次、提交 1000 次后，.git 目录并没有膨胀 1000 倍？**

三层机制层层削减。第一层：快照里未变化的文件只是引用，物理上不写——每次提交的增量正比于改动量，1000 次小改动只产生小对象流。第二层：tree 也按内容寻址，只有路径上有变化的目录才生成新 tree，未动的子目录整棵复用。第三层：松散对象会被 `git gc` 打包成 packfile，其中相似的历史版本做 delta 压缩，只存基准 + 增量。

- 延伸：能说出「逻辑快照、物理增量」这个分层表述，再补一句 packfile 的 delta 只是存储优化、随时可无损还原成完整对象，就同时覆盖了正确性和工程直觉两层。

延伸阅读：reset --hard 丢弃的提交去哪了？（见「引用与分支原理」）；同一文件为什么有时冲突有时不冲突？（见「三方合并」）；git 的垃圾是怎么被回收的？（见「存储与回收」）。

---

## 引用与分支原理

*难度：入门 ｜ 标签：Git、分支、HEAD、reflog、指针、detached HEAD*

**Git 的引用系统只有三层，每层都简单到不像设计：分支是一个 41 字节的文本文件，内容只有一行哈希（所以开分支、切分支近乎免费）；HEAD 是另一个文件，记录「下一个 commit 挂在哪」，它指着分支名，分支再指着 commit；reflog 是 HEAD 的移动日志，你每次切换、提交、重置都记一笔，可达提交的记录默认保留 90 天、不可达提交的记录默认 30 天——这就是 reset --hard 之后提交还能找回来的原因。看懂 `.git/HEAD` 和 `refs/` 目录，所有指针类命令（checkout / reset / rebase）都从「需要背的咒语」变成「看图说话」。**

### 分支：一个 41 字节的文件

「分支」这个词听起来像一份独立的代码副本，物理上它是什么？一个文件，一行内容。在你机器上随手验证：

```bash
$ cat .git/HEAD
ref: refs/heads/main          ← HEAD 指向「分支名」

$ cat .git/refs/heads/main
c94b1f5ad9151b404368aec5f7cc6dee6223cc09    ← 分支的全部内容：一行哈希
```

`refs/heads/main` 这个文件的整体内容，就是 main 分支的「全部定义」：指向 commit `c94b1f5`。所谓「在 main 上」没有更多含义——Git 读 HEAD，发现它说 `ref: refs/heads/main`，再去读那个文件拿到哈希，定位到提交，一切就绪。

由此直接推出几个日常体感：**创建分支** = 写一个 41 字节文件，所以 `git branch` 毫秒级完成、从不卡顿；**删除分支** = 删掉这个文件（提交对象本体毫发无损）；**分支上「领先」其他分支** = 它的哈希指向更新的提交而已。分支不是容器，是**会移动的书签**。

> **记忆：分支 = 会移动的指针**
>
> - 分支的物理实体是 `.git/refs/heads/` 下的一个文件，内容为一行 commit 哈希
> - 提交时 Git 做的唯一「分支操作」就是改写这个文件——「分支前进了」是结果，不是过程
> - 理解了这一点，fast-forward、`branch -d` 的安全性、分支对比（其实就是比哈希）全都顺理成章

### HEAD：你是谁、你在哪、commit 往哪挂

HEAD 是整个引用系统的枢纽。它也是一个文件，正常状态下内容是 `ref: refs/heads/main` 这样的**分支名**（这叫 attached 状态）。它的语义一句话：**「我接下来的操作挂在哪」**。

把 commit 的完整流程走一遍，HEAD 的角色立刻清晰：

- **读 HEAD**：`ref: refs/heads/main`
- **读 main 文件**：拿到当前提交哈希
- **写新 commit**：parent = 刚拿到的哈希
- **改写 main**：指向新 commit，分支前进
- **追加 reflog**：`HEAD@{1}` → `HEAD@{0}`

注意第三步和第四步的关系：新 commit 的 parent 永远取自「HEAD 当前指向的位置」，然后 HEAD **拽着它指的分支**一起前移。不是「提交到分支上」，是「挂在 HEAD 所指之处，顺便把那个书签挪过来」。这个细微差别在 detached HEAD 时会立刻显出威力。

### detached HEAD：没有书签拽着的提交

当你 `git checkout <某commit哈希>`（比如回到历史版本看看代码），HEAD 文件里写的就不再是分支名，而是直接一个哈希——这叫 **detached HEAD**，Git 会给一条著名的警告。此时一切照常工作：可以看代码、可以编译、甚至可以提交（parent 也会正确挂上）。唯一的区别是：**没有分支名拽着新提交**。

后果在你切走的那一刻发生：HEAD 指向别的分支后，刚才那个提交不在任何分支的引用链上——`git log` 里看不到了。很多人在这里「丢了代码」。但结合上一段就知道：**对象本体还在对象库里，reflog 里也记着这一笔**，找回只是从 reflog 里把哈希抄出来、建个分支指过去的事。真正会丢数据的场景只有一种：放着不管超过 reflog 过期时间，再被 GC 修剪（见「存储与回收」）。

**错误做法**（detached HEAD 自救）：

```bash
$ git checkout a1b2c3d
Note: switching to 'a1b2c3d'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.
...（警告其余部分略）...
HEAD is now at a1b2c3d
$ # 随便看了看，切回 main
$ git checkout main
$ # ……刚才基于 a1b2c3d 改的东西呢？log 里没有！
```

- 说明：切走之后新提交不在任何分支链上，`git log` 自然看不到——但对象还在，别慌，也别急着重做。

**正确做法**：

```bash
$ git checkout a1b2c3d
$ # ……做了些修改并提交
$ git switch -c rescue-branch     # 或 git branch rescue a1b2c3d 的后继
$ # 想找回更早「丢」的：
$ git reflog                      # 找到那笔移动记录的哈希
$ git branch rescue <哈希>
```

- 说明：发现自己在 detached 状态要做改动，第一时间建分支把书签挂上；已经切走的，去 reflog 里捞。

### reflog：HEAD 的追加写日志

reflog 是 **HEAD 的移动日志**：每次 HEAD 变化（提交、切换、重置、合并）都在本地记一笔「`HEAD@{n}` 现在指向谁、因为什么」。它的形态就是一个 **append-only 的日志文件**——和数据库的 WAL、系统的审计日志同一思路：事件只追加、永不改写，读侧随时按序号回放。真实仓库里的样子：

```bash
$ git reflog -3
c94b1f5 HEAD@{0}: commit: refactor: 事件循环笔记按最新规范重写……
a266a08 HEAD@{1}: commit: fix: 评审修复——closeOtherDomains 领域判定……
1603be9 HEAD@{2}: commit: fix: 侧栏四级条目恢复可变色竖线……
```

每一行都在说：「HEAD 在这个操作之后指向了这个哈希」。它只存在于本地（不会被 push、clone 带走），保留期分两档：**可达提交的条目默认 90 天**（`gc.reflogExpire`），**不可达提交的条目默认 30 天**（`gc.reflogExpireUnreachable`）——后者更短，因为 amend、rebase、reset 抛下的旧提交不属于当前项目，过期策略故意更激进。reflog 的存在建立在一个更强的保证上：**commit 对象一旦写入就不可变**，分支怎么移动、HEAD 怎么乱跳，都不可能销毁对象——「删除」永远只是把指针从链上摘下来。所以 reflog 才敢承诺：只要记着哈希，随时能回去。

### 一场「事故」的完整解剖

下面是真实执行的一次 reset --hard（先提交 c2，再硬重置回 c1），看数据分别在哪些地方：

```bash
$ git commit -am c2
$ git rev-parse HEAD
c2b44117a1b4f220ab92791733bbfd2c433b3932

$ git reset --hard HEAD~1        # “丢弃” c2
HEAD is now at 81b52e0 c1
$ git log --oneline
81b52e0 c1                       ← log 里没有 c2 了

$ git reflog -2
81b52e0 HEAD@{0}: reset: moving to HEAD~1
c2b4411 HEAD@{1}: commit: c2     ← reflog 里清清楚楚

$ git rev-parse 'HEAD@{1}'
c2b44117a1b4f220ab92791733bbfd2c433b3932   ← 一秒找回

$ git fsck --unreachable --no-reflogs
unreachable commit c2b44117a1b4f220ab92791733bbfd2c433b3932
unreachable tree 286e6959...                ← 同批 tree、blob 也不可达（输出节选）
unreachable blob 16f9ec00...
                                             ← 从引用视角看：它们只是“不可达”，不是“不存在”
```

三个视角对照着读：`git log` 看的是「从分支可达的提交」；`git reflog` 看的是「HEAD 走过的路」（不管可不可达）；`git fsck --unreachable` 看的是「对象库里所有没人指的对象」。c2 在第一个视角消失、在后两个视角都在。真正的物理删除要等两件事同时发生：reflog 条目过期（可达记录默认 90 天 / 不可达记录默认 30 天）+ GC 修剪可达性（判定入口的完整示意图见「存储与回收」）。

### 常用记法：三个坐标系统

HEAD 还派生出三套「寻址语法」，日常排障全靠它们：

```text
HEAD~2      代际：HEAD 往上数 2 代（~ 穿透合并，走第一父链）
HEAD^2      分叉：HEAD 的第 2 个 parent（只对 merge commit 有意义）
HEAD@{2}    时间：HEAD 两次移动之前在哪（读 reflog，等价于回放日志）
```

| | `~` 与 `^`（结构坐标） | `@{n}`（时间坐标） |
| --- | --- | --- |
| 移动依据 | 在提交图上按形状移动 | 在 reflog 上按时间回退 |
| 示例 | `HEAD~3` = 沿第一 parent 上溯 3 代；`HEAD^2` = merge 的第二个 parent | `HEAD@{1}` = 上一次移动前的位置；`main@{yesterday}` 也合法 |
| 回答的问题 | 「那个提交的祖先是谁」 | 「我昨天指过谁」——找回丢失提交的主力 |

> **记忆：reset --hard 之后先看 reflog**
>
> - 任何「提交不见了」的事故，恢复口诀：`git reflog` 找到事故前的哈希 → `git branch rescue <哈希>`（或直接 reset 回去）→ 检查无误再清理
> - reflog 是本地保险，push/clone 不携带，所以「找回」只能在出事的这台机器上做

**错误做法**（坐标系统不混用）：

```bash
# 刚 reset --hard 回退了 2 次，想反悔再回去
$ git reset --hard HEAD~1
# → 又往回退了一代！~ 是「沿 parent 上溯」，
#   reset 之后 HEAD 的祖先链已经变了
```

- 说明：想撤销「指针的移动」却用了「提交图的上溯」——两套坐标系在变动的历史上指向完全不同的地方。

**正确做法**：

```bash
$ git reflog -3
a1b2c3d HEAD@{0}: reset: moving to HEAD~1
9f8e7d6 HEAD@{1}: reset: moving to HEAD~1
4c5b6a7 HEAD@{2}: commit: 事故前的位置
$ git reset --hard HEAD@{2}   # 时间坐标：回到移动之前
```

- 说明：撤销指针移动用 `@{n}`（查日志），在历史上游走用 `~n`（查祖先）——分清这两个问题，坐标就不会用错。

### 追问链

**为什么 Git 开分支快到感觉不到延迟？**

因为创建分支的物理动作是：新建一个 41 字节的文件，内容写一行哈希。没有代码拷贝、没有目录复制、没有索引重建——对比一下「复制整个项目目录」的开销就能理解量级差异。切换分支的开销另算（需要物化差异文件），但「开」这个动作本身永远是毫秒级。

- 延伸：由此能推出分支管理的正确姿势：分支便宜到可以按想法随手开（一个实验一个分支），贵的从来不是分支数量，而是长期不合并导致的冲突面积。

**git checkout main 之后，之前 detached 状态下做的提交还在吗？去哪找？**

还在，commit 对象完好地躺在 `.git/objects` 里，只是不在任何分支的引用链上。找法：`git reflog` 列出 HEAD 的移动历史，找到那个提交的哈希，然后 `git branch rescue <哈希>`（或 `git checkout -b rescue <哈希>`）把它挂回一个书签。注意 reflog 是纯本地记录，且保留期分两档——可达提交的记录默认 90 天、不可达提交的记录默认 30 天——所以要在同一台机器、过期之前操作。

- 延伸：`git fsck --unreachable` 能列出所有不可达对象，是 reflog 也被清掉之后的最后手段；日常用 reflog 就够，因为 reflog 里连「你切过去」这个动作都记着。

**git reset --hard 和 git checkout 切分支，本质区别是什么？**

看它们动的是哪个指针。checkout 移动的是 HEAD 本身——从「指向分支 main」改成「指向分支 feature」，分支文件一个字节都没动，因此是安全的、可共享的。reset 移动的是分支文件——把 `refs/heads/main` 直接改写到另一个提交，HEAD 被拽着跟过去，等于「改写了这条分支的历史」，在共享分支上执行会制造分叉，需要强推才能同步，属于危险操作。

- 延伸：reset `--soft/--mixed/--hard` 三档的区别只是「分支挪走之后，工作区和 index 要不要跟着动」：soft 都不动、mixed 动 index、hard 全部对齐——对象库里的旧提交在任何档位下都不删，reflog 都能救。

**branch -d 和 branch -D 的区别，从引用模型怎么解释？**

`branch -d` 删指针文件前会检查：这个分支的提交是否已经合并进当前分支（即删掉书签后，那串提交是否仍从别的书签可达）。可达才允许删——因为删的只是书签，内容不丢。`branch -D` 跳过这个检查，直接删文件；如果那些提交没有别的书签指着，它们立刻变成不可达，只能靠 reflog（不可达提交的记录默认 30 天内）或 fsck 找回。

- 延伸：tag 和 branch 的唯一区别也在这里：tag 创建后从不移动。但「删 tag 永远安全」是误解——tag 没有 reflog，如果某个提交只被这个 tag 可达（没有任何分支指着），删掉 tag 后它立刻失联，reflog 里捞不到，只能靠 `git fsck --unreachable` 这类对象级扫描找回。

**reflog 会不会无限膨胀？它和对象库的 GC 是什么关系？**

会过期，不会无限膨胀。保留期分两档：可达提交的 reflog 条目默认 90 天过期（`gc.reflogExpire`），不可达提交的条目默认 30 天（`gc.reflogExpireUnreachable`）——rebase、amend、reset 抛下的旧提交走 30 天那一档，过期条目在 gc 时被清掉；对象库那边，一个提交只有在「所有引用 + 所有未过期 reflog + index 都不可达」时，才会在 gc 修剪中被物理删除。所以准确的生命周期是：提交被「丢弃」→ 成为不可达，reflog 里的记录再保它 30 天（此期间随时可救）→ 条目过期 → 下一次 gc 物理删除；仍被分支或 tag 指着的提交则走 90 天档，那是针对「引用被误删」这类事故的保险。两层机制共同保证了「后悔药有时间窗，仓库又不会无限膨胀」。

- 延伸：`gc.reflogExpire` / `gc.reflogExpireUnreachable` 两个配置可以调整保留期；团队规范里如果有人经常 rebase 共享分支，可以把窗口调长当作事故保险。

延伸阅读：git 为什么不存 diff：内容寻址怎么做的？（见「对象模型」）；restore、reset、revert 怎么选？（见「撤销操作」）；git 的垃圾是怎么被回收的？（见「存储与回收」）。

---

## 标签管理

```bash
# 查看所有标签
git tag
# 创建轻量标签（仅指向提交的指针）
git tag v1.0.0
# 创建附注标签（包含完整元数据，推荐用于发布）
git tag -a v1.0.0 -m "Release version 1.0.0"
# 推送单个标签到远程
git push origin v1.0.0
# 推送所有标签到远程
git push origin --tags
# 删除本地标签
git tag -d v1.0.0
# 删除远程标签
git push origin --delete v1.0.0
```

- 附注标签与轻量标签在对象模型层面的差异见「对象模型」章节。

---

## 三方合并

*难度：入门 ｜ 标签：Git、merge、冲突、merge-base、fast-forward、squash*

**Git 合并的精确公式：找 merge-base（共同祖先）→ 以它为参照做三方对比 → 逐区域裁决 → 结果物化成一个 commit。冲突的粒度是「区域」而不是「文件」：同一文件双方改了不同区域会自动合并，改了同一区域且内容不同才冲突。没有分叉时合并退化为快进（fast-forward）——连提交都不新建，只移动分支指针。冲突不是错误，是 Git 把「无法替你做的决策」显式摆到桌面上。**

### 技术对照：协作文档的三方合并

把合并想成**协作文档的一次冲突处理**：两位同事从同一份文档各自拷贝副本去改，回来时光把两份副本放在一起对比是不够的——A 改了第 5 段、B 没改，你看不出是「A 改了」还是「B 拿的是旧版本」。所以合并工具一定先取出**共同祖先版本**（= merge-base），然后三方对照：A 相对祖先改了什么、B 相对祖先改了什么——两边改的地方不重叠就都收下，改到同一处才需要人拍板。

这里的「共同祖先版本」就是 Git 的 merge-base：两支提交历史的最近公共祖先。后文所有规则都是它的推论。

### 为什么必须是三方对比

先看两方对比为什么不够。设 base 版本的 line5 是 `x`：feature 分支把它改成了 `y`，main 分支没动。合并时只看 main 和 feature 两个文件：一行是 `x`，一行是 `y`——**不一样，但无法归因**：是「对方改了」还是「我手里这份本来就是旧的」？裁决失去依据，只能一律当冲突，合并器退化为摆设。

引入 merge-base 之后归因立刻成立：base → main 没变、base → feature 变了，所以「只有一方改了 → 直接取改动方」，根本不需要人介入。merge-base 的求法不是遍历历史，而是在 commit 图上做拓扑计算（图上回溯找最近公共祖先），对大仓库也是毫秒级——又是「看图说话」战胜「遍历数据」的例子。

```text
merge-base（共同祖先）
  ├── diff ① ──▶ ours（当前分支，你的稿）──────┐
  └── diff ② ──▶ theirs（被合分支，对方的稿）──┤
                                               │ 逐区域裁决
                                               ▼
                                    merge 结果（新提交）
```

### 冲突判定：文件级粗筛，区域级细判

合并器对每个文件先做一轮粗筛（比较 base / ours / theirs 三个 blob 的哈希），粗筛就能解决大多数文件：

| | 粗筛即可自动解决 | 进入区域级细判 |
| --- | --- | --- |
| 触发条件 | 只有一方改动，或双方改动一致 | 双方都改了、且改出了不同的内容 |
| 具体情形 | 只有 ours 改了 → 取 ours；只有 theirs 改了 → 取 theirs；双方都改但结果一致 → 任取；双方都没改 → 保持不变；一方删了、另一方没动 → 按删除处理 | Git 不立即报冲突，而是做行级 diff，把文件切成互不重叠的区域（hunk） |
| 结果 | 直接采纳，无感 | 不同区域的改动全部自动采纳；同一区域两种改法 → 这里才产生冲突 |

所以「同样改一个文件，有时冲突有时不冲突」的答案：**冲突的判定粒度是区域，不是文件**。真实对照组实验（同一个 8 行文件的仓库建了两份，两个分支各改一行，输出原样保留）：

| | 自动合并 | 冲突 |
| --- | --- | --- |
| 改动分布 | 不同区域（第 1 行 vs 第 7 行） | 同一区域（都改第 5 行） |
| 归因 | base 对照下双方改动互不干扰，各自成立 | 同一位置两种写法，无法归因取舍 |
| 结果 | Auto-merging + Merge made by the 'ort' strategy | CONFLICT (content)，Automatic merge failed |
| 退出码与状态 | exit=0，直接产出 merge commit | exit=1，git status 显示 UU（both modified） |

```bash
# 不冲突场景：feature 改第 1 行，main 改第 7 行
$ git merge feature
Auto-merging f.txt
Merge made by the 'ort' strategy.
 f.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

# 冲突场景：main 与 feature 都改第 5 行
$ git merge feature
Auto-merging f.txt
CONFLICT (content): Merge conflict in f.txt
Automatic merge failed; fix conflicts and then commit the result.
$ git status -s
UU f.txt
$ cat f.txt
line1
line2
line3
line4
<<<<<<< HEAD
line5-MAIN
=======
line5-FEATURE
>>>>>>> feature
line6
line7
line8
```

冲突发生时，Git 做三件事：把两个版本都写进工作区（带 `<<<<<<<` 标记）、在 index 里为该文件记录多个候选版本（所以 `git status` 叫它 both modified）、然后停下等你。逐行读懂冲突标记——每个部分都有明确身份：

| 标记行 | 身份 | 解决冲突时的动作 |
| --- | --- | --- |
| `<<<<<<< HEAD` | 冲突区开始；HEAD 即当前分支（ours） | 删掉此行 |
| `line5-MAIN` | ours 的内容，来自当前分支的 blob 完整行 | 保留 / 改写 / 融合——这是裁决本体 |
| `=======` | 分隔线：上半 ours，下半 theirs | 删掉此行 |
| `line5-FEATURE` | theirs 的内容，被合并分支的写法 | 与 ours 一起参与裁决 |
| `>>>>>>> feature` | 冲突区结束，标注 theirs 来源分支 | 删掉此行 |

> **记忆：冲突 = 待人类裁决的决策点**
>
> - 冲突不是合并失败，而是三方对比走到「同一区域、两种改法、无法归因取舍」这一步时的显式上交
> - 解决冲突 = 你替 Git 做那次裁决：编辑文件留下正确版本、删掉标记行
> - 然后 `git add`（把裁决结果写回 index 草稿）、`git commit`——产出一个有两个 parent 的 merge commit

**错误做法**（标记清理核查）：

```bash
<<<<<<< HEAD
const a = computeA();
=======
const a = computeAFast();
>>>>>>> feature
# 觉得两个都要，手动删了标记但留了两行同名 const
$ git add . && git commit
# → 语法错误进入主干，CI 才发现
```

- 说明：「删标记 = 解决冲突」是最危险的错觉——裁决必须包含取舍或融合的正确结果，不是让文件回到能编译的状态就行。

**正确做法**：

```bash
const a = computeAFast();   # 融合：保留更快的一方（或两者兼用并重命名）
$ grep -rnE "^(<<<<<<<|=======|>>>>>>>)" src/  # 提交前扫一遍残留标记
$ npm test && git add . && git commit
```

- 说明：裁决 → 测试 → 全局扫残留标记 → add + commit。四步里测试和扫描一次都不能省。

**错误做法**（rebase 的适用边界）：

```bash
# 同事也基于 feature 开发，你直接：
$ git rebase main
$ git push --force
# → 别人本地的旧哈希链与远端分叉，
#   他们 pull 之后是两段「平行历史」
```

- 说明：已共享的分支被 rebase 等于换了历史的地基——每个协作者都要手工清理现场。

**正确做法**：

```bash
$ git rebase main      # 只 rebase 自己的、未共享的分支
$ git push --force-with-lease   # 确需强推时用带条件的版本
# → 只有你一个人受影响，reflog 里有旧链可退
```

- 说明：rebase 改写的是哈希链——共享即分叉。黄金法则「已 push 的共享分支不要 rebase」可以从这里直接推导。

### 快进、普通合并与 squash

「合并一定产生一个双 parent 提交」并不总成立。Git 会先看拓扑形状：如果一方已经包含另一方（merge-base 就是其中一方本身），「合并」在数学上零工作量——把落后的分支指针直接挪过来即可，这就是 **fast-forward（快进）**：一个新对象都不创建，0 个新提交。

```text
场景 A：fast-forward（merge-base 就是 main 本身）

base ──▶ feature 的新提交
          ▲
          └── main 指针直接滑过来（0 个新提交）

场景 B：--no-ff / 真分叉合并

base ──▶ main 的新提交 ────────┐
  │                            ├──▶ merge commit（parent ×2）
  └────▶ feature 的新提交 ─────┘
```

什么时候会走哪条路？合并那一刻 `git merge` 的判断只有一句：**merge-base == 其中一方 → 快进；否则才真正合并并新建双 parent 提交**。注意「快进」和「造节点」是两个独立维度：默认配置下能快进就快进，但 `--no-ff` 可以在可快进的场景里**强制**新建合并节点；而 main 有分叉时本来就只能真合并。两种场景都在临时仓库真实重放（输出原样保留）：

```bash
# 场景一：main 无新提交（merge-base 就是 main 本身），能快进
$ git merge feature
Updating bdde8e0..22a488a
Fast-forward
 f.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
# → 0 个新提交，main 指针直接滑到 feature 顶端

# 场景一（续）：可快进，但用 --no-ff 强制造节点
$ git merge --no-ff feature -m "merge: 合入 feature"
Merge made by the 'ort' strategy.
$ git cat-file -p HEAD | head -3
tree   575a88bd67420decd11e27f8f854a042c0301170
parent f101cddb964e4ff9284130aedbf7d1eadaa59f28   ← parent₁：main 原来的位置（此时恰为 merge-base）
parent a2ca8dcfea8d6aec59f70ef6830d5a2fe0ebec2a   ← parent₂：feature 顶端
```

```bash
# 场景二：main 有自己的新提交（真分叉），默认 merge 就是真合并
$ git merge feature
Auto-merging f.txt
Merge made by the 'ort' strategy.
 f.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
$ git log --oneline --graph
*   83cb49f Merge branch 'feature'
|\
| * 579ef93 feat: feature 改第 1 行
* | c869dbd fix: main 改第 3 行
|/
* 37a00ac base
$ git cat-file -p HEAD | head -3
tree   a338b16d951ccf4cbe695c7fd905901b61edcbbd
parent c869dbd51916548bce765543d0a9e45f029ad463   ← parent₁：main 的新提交（不是 merge-base！）
parent 579ef936dc624822fe5de5c11c098f73798d91e1   ← parent₂：feature 顶端
```

对照两个场景的 parent 行，merge commit 的结构语义就清楚了：**parent₁ 永远是执行合并时你所在分支（ours）的顶端，parent₂ 是被合入分支（theirs）的顶端**。场景一里 ours 尚未前进，parent₁ 恰好等于 merge-base；场景二里 ours 已经前进，parent₁ 就是那个新提交。所以「看 parent₁ 是不是 merge-base」就能反推一次合并是强造的节点还是自然分叉的结果——排查历史时这是个常用的指纹。

| | fast-forward 与 --no-ff | squash（压扁合并） |
| --- | --- | --- |
| 产出 | ff：0 个新提交，只移动分支指针；--no-ff：1 个新提交，两个 parent | 把 feature 全部提交压成 1 个全新的普通提交 |
| 历史形状 | 保留分叉气泡，能看出「这批改动来自一个 feature」 | 单 parent、不写合并关系，原提交全部弃用，历史变成干净直线 |
| 典型用途 | 团队主干常用 --no-ff 保住 feature 的边界 | GitHub PR 的「Squash and merge」即此物 |

三种方式没有绝对优劣，取舍点是**历史信息保真 vs 历史整洁**：ff 最省但丢掉「这里合过一批」的信息；--no-ff 保留完整拓扑；squash 只留最终成果。你见过「看起来只有一个 parent 的疑似 merge」，多半就是快进或 squash——它们本来就只是普通提交（或纯指针移动），不是合并节点。

### 追问链

**两个分支改了同一个文件的不同函数，合并会冲突吗？**

通常不冲突。判定流程：文件级粗筛发现「双方都改了」→ 进入行级细判，把文件切成互不重叠的区域 → 两个函数位于不同区域 → 各自改动都被采纳，自动合并完成。冲突只在「同一区域两种不同改法」时发生。

- 延伸：相邻改动是灰色地带：两处修改紧挨着（中间不足 3 行上下文），diff 算法可能把它们划进同一个区域而判冲突——这也是「改得明明不挨着却冲突了」的常见来源。

**merge-base 到底是什么？为什么没有它就没法合并？**

merge-base 是两条分支历史的最近公共祖先，充当三方对比的参照系。没有它，两份文件一比对只能知道「不一样」，无法归因「谁改的」：是对方改了，还是自己手里这份本来就是旧的？有了 base，每个位置都有三种状态（base 版 / ours 版 / theirs 版），归因成立，规则才能运转：只有一方改 → 取改动方；双方都改 → 细判区域。

- 延伸：merge-base 的求解是图拓扑计算而非历史遍历（sub-second 即便在十万提交级仓库）——这也是「Git 快靠图算法和哈希，不靠遍历」的又一例证。

**为什么 push 被拒绝说 non-fast-forward？和合并的 fast-forward 是什么关系？**

是同一个概念的两面：fast-forward 指「目标指针的当前位置是新位置的祖先，可以直接前移、不丢东西」。合并时：main 没有分叉，能直接快进到 feature。推送时：远端 main 上有你没有的提交，你的新提交不是它的后代——快进不成立，硬推（force push）会让远端那几个提交脱离分支链，所以 Git 默认拒绝。正确做法是先 pull 把远端提交合进来，让历史重新变成「远端是本地的祖先」。

- 延伸：force push 的本质就是「我知道会甩掉远端那些提交，我故意的」——后悔药只在本地：reflog 在你这台机器上记着被甩掉之前的哈希；服务端没有面向用户的 reflog，被覆盖的提交在远端没有等价的恢复入口（自建服务器的对象残留可能撑一段时间，但不能依赖）。

**解决冲突时，什么时候不该直接在冲突标记里二选一？**

冲突标记展示的是「同一区域两种写法」，但正确答案经常不是二选一而是融合：比如两边都在同一区域各自加了一条逻辑，正确结果是把两条都保留、并排写好。裁决时先看 base 版本（`git show :1:文件路径`），弄清双方各自相对 base 改了什么，再决定取舍或融合；融合完成、测试通过后 add + commit。

- 延伸：`git checkout --ours / --theirs -- 文件` 是「整体取一边」的快捷方式，只适合整文件级取舍；`git merge --abort` 可随时退回合并前状态——冲突会话中你是安全的，任何选择都可撤销。

**rebase 和 merge 都能「把 feature 带进 main」，本质区别是什么？**

merge 在分叉之上新建一个双 parent 提交，历史是「保留分叉事实」的图；rebase 把 feature 上的每个提交逐个「重放」到 main 顶端——生成一批全新的 commit 对象（tree 内容可能一样，但 parent 链和 committer 时间全变，哈希必变），原提交被抛弃，历史变成一条直线。所以 rebase 又叫「改写历史」：改的是引用链的形状，不是对象本身（旧对象依旧躺在库里等 GC）。

- 延伸：黄金法则由此可推导而非背诵：已 push 到共享分支的提交不要 rebase——别人基于旧哈希的工作会和你的新哈希分叉，且这次的冲突要在每个人的机器上各解一遍；自己的未共享分支随便 rebase，配合 reflog 永远可反悔。

延伸阅读：origin/main 是远程上的分支吗？（见「远程协作」——pull 的第一步与非快进推送）；reset --hard 丢弃的提交去哪了？（见「引用与分支原理」——merge-base 与寻址记法的引用模型基础）。

---

## 高级操作

### 变基（rebase）

```bash
# 将 feature-branch 的提交移植到 main 的最新节点上
git checkout feature-branch
git rebase main

# 交互式变基，修改最近 3 次提交历史
git rebase -i HEAD~3
```

交互式变基指令：

| 指令 | 说明 |
| --- | --- |
| `pick` | 保留此提交 |
| `reword` | 保留但修改提交信息 |
| `edit` | 保留但允许修改内容 |
| `squash` | 与前一提交合并（保留提交信息） |
| `fixup` | 与前一提交合并（丢弃提交信息） |
| `drop` | 删除此提交 |

### 拣选提交（cherry-pick）

```bash
# 将指定提交应用到当前分支
git cherry-pick commit-hash
# 拣选多个不连续的提交
git cherry-pick commit1 commit2 commit3
# 拣选一段范围的提交（不含 commit1）
git cherry-pick commit1..commit3
# 拣选一段范围的提交（含 commit1）
git cherry-pick commit1^..commit3
```

- rebase 与 merge 的本质区别、适用边界见「三方合并」章节；stash 命令速查见「撤销操作」章节。

---

## 远程协作

*难度：入门 ｜ 标签：Git、fetch、pull、push、远程分支、origin、fork*

**理解远程同步只需要接受一个设定：你和远程仓库之间从不共享任何状态，你拥有的一切都在本地。`origin/main` 不是服务器上的分支，而是「上次通信时它的 main 在哪」的本地缓存书签（一个 41 字节文件）。fetch = 询问远程的指针位置 → 下载本地缺失的对象 → 更新缓存书签，到此为止，不碰工作区、不碰本地分支、永不产生冲突；pull = fetch + merge，冲突只可能发生在第二步。`git status` 显示 behind/ahead 时没有任何网络请求——比的只是两个本地文件。**

### origin/main 的真身：远程书签的本地缓存

第一次 clone 之后，你的仓库里多出一类特殊的引用：`refs/remotes/origin/...`。它们的物理形态和你自己的分支一模一样——本地磁盘上的小文件（或打包后的引用记录），内容一行哈希：

```bash
$ git for-each-ref | grep origin
97a743dc765ba3ec3f892cc2d6ec526285e56b24 commit	refs/remotes/origin/HEAD
97a743dc765ba3ec3f892cc2d6ec526285e56b24 commit	refs/remotes/origin/main

$ git config --get remote.origin.fetch
+refs/heads/*:refs/remotes/origin/*    ← 「书签映射表」：对方的 heads/* 抄到我的 remotes/origin/*
```

逐层拆解三个名字：**origin** 是远程仓库的代号（clone 时自动注册，配置在 `.git/config` 里，存着 URL 和映射表）；**origin/main** 是「远程的 main 分支在我本地的缓存副本」；**refs/remotes/** 是这类缓存书签的命名空间。关键性质：**这些书签是只读的**——你 checkout 它们会进入 detached HEAD，Git 不允许直接在上面提交，因为它们代表「远程的状态」，只有 fetch 有资格改写。

于是「本地与远程的差距」这个概念彻底落地了：behind 3 = `refs/heads/main` 指向的提交不在 `refs/remotes/origin/main` 的历史里、而反方向有 3 个——两个 41 字节文件的指针运算，**全程零网络请求**。你离线时 `git status` 照样能告诉你「上次同步时落后了几个」，原因就在这。

> **记忆：你拥有的一切都在本地**
>
> - commit、tree、blob、分支、远程书签、reflog 全部在你机器上
> - 远程仓库只是另一台机器上的同构仓库，两边只通过「传对象 + 报指针位置」通信
> - 这条设定是理解 fetch/pull/push 一切行为的根：status 不联网、fetch 不改工作区、push 的冲突与 pull 的冲突是两回事

**错误做法**（远程书签的正确用法）：

```bash
$ git checkout origin/main
# detached HEAD（书签不是分支，不能挂提交）
$ vim fix.ts && git commit -am "fix"
$ git switch main     # 切走……
# → 那个提交不在任何分支链上了
```

- 说明：远程书签是只读的缓存指针——直接在上面提交，产物会被留在无书签拽着的悬空状态。

**正确做法**：

```bash
$ git switch -c fix/remote-main origin/main
# 基于远程书签创建本地分支，HEAD 立刻有了书签
$ vim fix.ts && git commit -am "fix"
$ git push -u origin fix/remote-main
```

- 说明：想在「远程的状态」上动手，标准动作是基于它开一个本地分支——书签本身保持只读。

### fetch 到底做了什么：四步协议

`git fetch` 的内部流程可以拆成四步，每一步都对应一个可观察的副作用：

- **① 协商**：互相报出引用位置，算出缺失对象集合
- **② 传输**：远端把缺失对象打包流式传回
- **③ 落库**：逐个校验哈希后写入对象库
- **④ 改书签**：更新 `refs/remotes/origin/*`

协商阶段利用了内容寻址的性质：**双方只要交换「我有哪些哈希」，就能精确算出「我缺哪些哈希」**——不需要版本号、不需要增量日志、不需要中央服务器仲裁，两个同构仓库天然知道如何对齐。传输时对象被打成 packfile（一次打包、批量 delta 压缩，见「存储与回收」），落库时每个对象都会重新验算哈希——对不上即损坏，立刻拒收，所以对象库不可能混入伪造内容。

真实实验：本地 clone 一个远程仓库，远端推进一个提交后，观察 fetch 前后各个部分的变化——

```bash
$ git status -sb
## main...origin/main            ← 书签还停在 clone 时刻：两侧一致

# ……此时远端有人提交了 v2 ……

$ git fetch origin
From /tmp/gitlab-origin
   97a743d..13aaf4b  main       -> origin/main    ← 书签被改写：97a743d → 13aaf4b

$ git status -sb
## main...origin/main [behind 1]  ← 差距现形

$ git rev-parse refs/remotes/origin/main
13aaf4b8d45b98fa8fba1ef541d6fb5fe4cd7e0c     ← 书签指向 v2

$ git rev-parse refs/heads/main
97a743dc765ba3ec3f892cc2d6ec526285e56b24     ← 你的 main 纹丝未动

$ git log --oneline main..origin/main
13aaf4b v2                       ← 新对象已在本地，只是 main 还没跟上
```

这就是 fetch 的完整语义：**对象库多了新对象 + 远程书签改了指向，其余一切不动**。工作区没变、index 没变、你自己的 main 没变——所以 fetch 永远安全，随时可以跑，也永远不会和你的本地修改冲突。产生冲突的从来不是 fetch，而是你随后决定做的合并。

### pull、push 与冲突的真实分工

有了 fetch 的精确语义，pull 不再是黑盒：它就是「fetch 更新书签」+「把书签指向的提交合并进当前分支」两步的语法糖。冲突只可能发生在第二步——而那正是三方合并讲过的三方对比，与网络毫无关系。

| | fetch：只更新事实 | pull：fetch + merge |
| --- | --- | --- |
| 第一步 | 下载缺失对象，校验哈希后入库 | 同 fetch |
| 第二步 | 改写 `refs/remotes/origin/*` 书签 | 把 origin/main 合并进当前分支 |
| 副作用 | 不碰工作区 / index / 本地分支 | 可能触发三方合并，可能冲突 |
| 安全性 | 永不冲突，可随时安全执行 | 本质是「同步 + 立即表态」的组合拳 |
| 适用 | 「先看远端发生了什么再决定」：fetch 后 `git log main..origin/main` | 「我信任远端、直接同步」 |

push 是 fetch 的镜像：把本地缺失的对象传给远端，请求它把 `refs/heads/main` 书签改写到你的提交。远端只答应一种请求——**快进**：新位置必须是旧位置的后代（否则等于丢弃别人的提交）。不满足就拒绝，报 non-fast-forward。

```text
共同祖先 ──▶ 远端 main（别人已推进）
    │
    └──────▶ 本地 main（你的提交）

两条历史分叉 → push 被拒（non-fast-forward）
  ├─ 正路：先 pull 合并 → 恢复「远端是本地祖先」→ push 快进成功
  └─ force push：声明「故意丢弃远端提交」（危险）
```

所以「push 冲突」和「pull 冲突」是两回事：**push 被拒是拓扑问题**（历史形状不允许快进，一个字节的内容对比都没做）；**pull 的冲突是内容问题**（三方对比遇到同区域两种改法）。前者用合并恢复形状，后者用人类裁决解决内容。真要强推（例如自己 rebase 过的个人分支），用 `--force-with-lease` 代替 `--force`：若远端书签在你上次 fetch 之后又变过，仍然拒绝——防的是「覆盖掉你不知道的新提交」。

**错误做法**（协作节奏）：

```bash
# 攒了一周的本地提交直接 push
$ git push
 ! [rejected] main -> main (fetch first)
$ git push --force            # 一时气愤强推
# → 同事基于旧 main 的提交全部悬空
```

- 说明：非快进被拒后强推，等于单方面宣布「远端上我没见过的提交作废」。

**正确做法**：

```bash
# 被拒后先看远端发生了什么
$ git fetch
$ git log --oneline main..origin/main   # 别人推了什么
$ git pull --rebase                     # 把自己的提交重放到新 main 上
$ git push                              # 历史重新线性，快进成立
```

- 说明：先 fetch 摸清差距，再选择合并或 rebase 恢复快进关系——冲突在这里才按内容裁决。

### 整合应用：fork 协作的双远程

前面所有讨论只有一个远程 origin，而开源贡献的标准姿势是两个：fork 一份到自己的账号、clone 自己的 fork（origin，有推送权），再给源仓库挂一条只读通道（upstream）。remote 只是 `.git/config` 里的配置项，多个 remote 各自拥有一套 `refs/remotes/<名字>/*` 缓存书签，fetch 互不干扰：

```bash
# 一次性配置：给现有仓库添加 upstream
$ git remote add upstream https://github.com/original/repo.git

$ git remote -v
origin	git@github.com:you/repo.git (fetch)
origin	git@github.com:you/repo.git (push)
upstream	https://github.com/original/repo.git (fetch)
upstream	https://github.com/original/repo.git (push)
```

日常同步上游的三步全是本篇机制的组合拳：`git fetch upstream` 把源仓库的新对象拉进本地、更新 `upstream/main` 书签；`git merge` 或 `git rebase` 把 `upstream/main` 整合进自己的 main；`git push origin main` 把同步结果推回自己的 fork。注意每个 remote 的 fetch 与 push URL **可以不同也可以禁用**——对 upstream 唯一合法的操作是 fetch，push 只指向 origin。

```text
upstream 源仓库（只 fetch）
   │ git fetch upstream：拉取上游更新
   ▼
本地仓库（fetch + merge 同步上游）
   │ git push：推到自己的 fork
   ▼
origin 你的 fork（fetch + push）
   │ Pull Request：fork → 源仓库
   ▼
上游评审合入
```

> **注意：误推 upstream 的唯一场景**
>
> 如果你对源仓库也有推送权限（公司内部仓库常见），remote 别名写错就会把代码直接推进上游——这也是开源 fork 场景要刻意识别两个 remote 的原因：写入权限跟着 remote 的 URL 走，不跟着你的意图走。

### 常用命令速查

```bash
# 克隆仓库到本地
git clone https://github.com/user/repo.git
# 克隆到指定目录
git clone https://github.com/user/repo.git my-directory
# 克隆指定分支（不拉取其他分支）
git clone -b branch-name --single-branch https://github.com/user/repo.git

# 查看远程仓库地址
git remote -v
# 添加远程仓库
git remote add origin https://github.com/user/repo.git
# 更改远程仓库地址
git remote set-url origin https://github.com/user/new-repo.git
# 添加上游仓库（用于同步 fork 源仓库的更新）
git remote add upstream https://github.com/original/repo.git

# 获取所有远程分支的更新（不自动合并）
git fetch origin
# 获取特定分支的更新
git fetch origin feature-branch
# 获取所有远程仓库的更新
git fetch --all

# 拉取并合并当前分支的远程更新
git pull origin main
# 使用 rebase 方式合并（保持线性历史）
git pull --rebase origin main

# 推送到远程仓库的同名分支
git push origin main
# 推送并设置上游分支（首次推送时使用）
git push -u origin main
# 强制推送（谨慎使用，会覆盖远程历史）
git push --force origin main
# 删除远程分支
git push origin --delete feature-branch
# 推送所有标签
git push origin --tags
```

### 追问链

**git status 显示 behind 3，这时候联网了吗？**

没有。behind 3 是 main 与 origin/main 两个本地引用的指针运算结果，origin/main 是上次 fetch/clone 时刻的缓存。要拿到「此刻」的最新差距，需要先 `git fetch` 刷新书签——fetch 是唯一联网的步骤，status 本身永远离线。

- 延伸：推论：status 说 up to date 只代表「与上次同步时刻一致」，不代表远端此刻没有新提交。严谨的说法是 fetch 之后再确认。

**git fetch 之后为什么必须再手动 merge？为什么不自动帮我合？**

因为合并是需要决策的操作：可能产生冲突、可能你想用 rebase 而不是 merge、可能你想先 review 远端改了什么再表态。fetch 刻意止步于「更新事实」（对象 + 书签），把「如何整合」留给你。`git pull` 是为「我信任远端、直接同步」场景提供的组合快捷键，两者各有适用场景。

- 延伸：团队实践中更推荐 fetch → 查看 → 整合的三步走：`log main..origin/main` 看新提交、`diff main origin/main` 看内容差异，再决定 merge 还是 rebase——这比盲目 pull 少很多「pull 完一团乱」的事故。

**origin/main、origin HEAD、remote tracking——这些名字到底是什么关系？**

origin 是远程仓库的代号，只是 `.git/config` 里的一个配置项（URL + 引用映射规则）。origin/main 完整写法是 `refs/remotes/origin/main`，是「远程 main 分支的本地缓存书签」。origin/HEAD 是克隆时记录的「对方的默认分支是哪个」，所以 `git checkout main` 能凭空创建本地 main 并自动关联 origin/main。三者都在本地，远程服务器从头到尾只有它自己的 `refs/heads/main`。

- 延伸：`git remote add second <url>` 可以挂多个远程，各自拥有 `refs/remotes/second/*` 命名空间——开源协作里「同时跟踪 upstream 和自己的 fork」就是这么工作的。

**git pull --rebase 和默认 pull 有什么区别？什么时候该用哪个？**

默认 pull = fetch + merge：远端新提交和你的本地提交通过一个 merge commit 汇合，历史保留分叉事实。pull --rebase = fetch + rebase：把你的本地提交逐个重放到远端新提交之上，历史保持一条直线、不产生合并节点。个人未推送过的功能分支上两者皆可——想保持线性历史用 rebase；本地已有共享的合并历史时用 merge，避免 rebase 改写哈希造成分叉。

- 延伸：`git config pull.rebase true` 可把 rebase 设为默认；新版本 Git 在 pull 会产生分歧且未配置整合策略时会直接拒绝执行并提示选择——这是它在逼你显式表态 merge 还是 rebase。

**push 的时候 Git 怎么知道该传哪些对象？会不会把整个仓库重传一遍？**

不会。push 协商和 fetch 对称：远端报出它已有的引用与哈希（它缺什么由它声明 haves），本地据此算出差集——只有远端缺失的对象会被打包传输，而且是 push 前临时生成的精简 packfile（只含差集、做好 delta 压缩）。由于内容寻址，两边仓库对「哪些对象已存在」的判断是精确的，无需任何版本号对齐。

- 延伸：大文件协作的痛点也在这里：一旦某个 100MB 的二进制进了你的提交，此后每个没有它的协作者 clone/fetch 都必然拉下它——去重救不了「别人根本没有」的对象。这正是 Git LFS 要把大文件挪出对象库的根因，细节见「大文件与 Git LFS」。

延伸阅读：同一文件为什么有时冲突有时不冲突？（见「三方合并」——non-fast-forward 与 fast-forward 的完整拓扑推导）；ssh 免密推送是怎么配出来的？（见「SSH 配置」——fetch/push 走的传输层）。

---

## SSH 配置

*难度：入门 ｜ 标签：Git、SSH、密钥、ssh-agent、远程仓库*

**Git 远程传输走 HTTPS 或 SSH 两种协议，SSH 用密钥对认证：私钥留在本机、公钥贴到平台，连接时靠「服务器出题、私钥签名」完成身份证明——全程不传输任何秘密，比密码安全且免输入。配置一次终身受益的四件事：生成 Ed25519 密钥对 → 公钥上传平台 → `~/.ssh/config` 写好主机别名与端口 → `git remote set-url` 切换协议。之后每次 push/pull 都不再需要任何身份输入。**（SSH 远程登录的底层原理不在本篇展开，这里只覆盖 Git 相关的配置。）

### 密钥对认证：不传秘密的身份证明

HTTPS 方式每次 push 都要身份证明（用户名 + token），SSH 方式把这件事一次性解决。核心是**非对称密钥对**：私钥（留在本机，谁都不给）+ 公钥（贴到 GitHub/GitLab 的设置页，随便谁看）。认证时服务器用你的公钥出一道「签名挑战」，本机私钥签出答案，服务器用公钥验证——**网络上只传输签名结果，私钥从不离开你的机器**，窃听者拿到全部流量也无法冒充你。这也是为什么私钥文件权限必须是 600：它是你数字身份的本体，不是配置文件。

```text
git push（发起连接）
   ▼
服务器：随机挑战串 + 你的公钥（挑战下发给本机）
   ▼
本机 ssh-agent：私钥签名
   ▼（回传签名，私钥不出门）
服务器：公钥验签 → 放行
```

### 生成与配置：一次做完

现代 SSH 推荐 **Ed25519** 算法（更短更快更安全），RSA 4096 只在对接古董服务器时才需要。完整流程四步：

```bash
# ① 生成密钥对（-C 只是备注，写邮箱便于识别）
ssh-keygen -t ed25519 -C "your-email@example.com"
# 交互提示：保存路径默认 ~/.ssh/id_ed25519；passphrase 可设为口令保护私钥

# ② 复制公钥内容（注意是 .pub 文件，私钥永远不外传）
cat ~/.ssh/id_ed25519.pub
# 粘贴到 GitHub → Settings → SSH and GPG keys → New SSH key

# ③ 验证连通性（第一次会问是否信任主机指纹，yes）
ssh -T git@github.com
# Hi your-name! You've successfully authenticated...

# ④ 把远程地址从 HTTPS 切到 SSH（仅当 clone 时用的是 https://）
git remote set-url origin git@github.com:user/repo.git
git remote -v        # 确认两个 URL 都已变为 git@ 开头
```

第 ③ 步的输出 `Hi your-name!` 是最可靠的验证：认证层已通，Git 层不可能再有身份问题。如果这步就失败，问题一定在 SSH 层（密钥、agent、config），与 Git 无关——分层排查后面细说。

### ssh-agent：passphrase 只输一次

给私钥设了 passphrase（口令），安全是真安全——每次 pull/push 都要输一遍也是真烦。**ssh-agent** 解这道题：它是后台进程，把解密后的私钥缓存在内存里，之后的签名请求直接用缓存，passphrase 只在首次添加时输入一次。macOS 更进一步：`UseKeychain` 选项把 passphrase 存进系统钥匙串，重启后也免输。

```bash
# 手动添加到 agent（macOS）
eval "$(ssh-agent -s)"          # 启动 agent（现代系统通常已在跑）
ssh-add --apple-use-keychain ~/.ssh/id_ed25519

# macOS 的持久化写法（~/.ssh/config）：
# Host github.com
#   AddKeysToAgent yes
#   UseKeychain yes
#   IdentityFile ~/.ssh/id_ed25519
```

> **记忆：私钥不出门，公钥随便贴**
>
> - 公钥是锁、私钥是钥匙——锁可以公开挂在网上，钥匙只在你机器里
> - 判断文件：「.pub」结尾的是公钥可外传；不带后缀的是私钥，泄露 = 身份被盗，立刻在平台吊销并重新生成

### ~/.ssh/config：多主机与防火墙

`~/.ssh/config` 是 SSH 的「主机通讯录」：为每个平台声明地址、端口、用哪把钥匙。两个最常用的场景——**多平台各用各的钥匙**，和**443 端口绕防火墙**（公司/校园网常封 22 端口，GitHub 在 ssh.github.com:443 提供了备用入口）：

```text
# ~/.ssh/config
Host github.com
  HostName ssh.github.com
  Port 443                        # 走 443 端口绕过防火墙对 22 的封锁
  User git
  IdentityFile ~/.ssh/id_ed25519

Host gitlab.com
  HostName gitlab.com
  User git
  IdentityFile ~/.ssh/id_ed25519  # 也可以给 GitLab 单独一把钥匙

# 多账号：同一个平台两个身份（公司号 + 个人号）
Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_work     # 公司账号的钥匙
# 仓库 remote 写 git@github-work:company/repo.git 即走这套配置
```

多账号配置的关键理解：`Host` 是**别名**，git@ 后面写的名字会先查这本通讯录再解析——所以 `git@github-work:...` 这种「不存在的域名」能正常工作。改完 config 验证：`ssh -T git@github.com` 的输出不变就说明切换无感。

### HTTPS 与 SSH 协议选型与切换

| | HTTPS（token 认证） | SSH（密钥认证） |
| --- | --- | --- |
| 上手 | 零配置开箱即用，clone 即可读 | 一次配置，之后 push/pull 全免认证 |
| 凭据 | 推送需 Personal Access Token（密码已废弃），依赖 credential helper | 私钥本机持有，不经过网络传输 |
| 端口 | 走 443 端口，几乎不会被防火墙拦 | 默认 22 端口可能被封锁（用 443 备用入口） |
| 多账号 | 难以精细区分 | 可用 config 精细分隔身份 |
| 适用 | CI / 临时机器 / 只读场景更方便 | 日常开发机的主流选择 |

协议切换是纯本地操作，随时可逆：`git remote set-url origin git@github.com:user/repo.git` 切到 SSH，反向传 https:// 地址切回 HTTPS。remote 只是 `.git/config` 里的一行 URL（origin 的本质见「远程协作」），换协议不产生任何对象迁移。

配置过程中第一次连接时会遇到「authenticity」提问：ssh 把服务器主机的公钥指纹展示给你确认，同意后记进 `~/.ssh/known_hosts`，之后每次连接都比对——对不上就拒绝并警告（可能是服务器重装，也可能是中间人）。这套机制叫**信任首次使用**（TOFU）：GitHub 的指纹在其官方文档公布，核对一次再 yes，就是这条信任链的全部手工环节。

### 排查与安全习惯

**错误做法**（SSH 排查路径）：

```bash
$ git push
git@github.com: Permission denied (publickey).
# 开始反复 ssh-keygen 重新生成、
# 重传公钥、重装 git……越搞越乱
```

- 说明：盲目重造密钥是最常见的绕圈：先分层定位，多数情况是 agent 没加载或 config 匹配错。

**正确做法**：

```bash
$ ssh -T git@github.com       # 先分清 SSH 层还是 Git 层
$ ssh-add -l                 # agent 里有没有钥匙？
$ ssh -vT git@github.com 2>&1 | grep -i offering
                             # 到底尝试了哪把私钥？
$ git remote -v              # URL 是 git@ 还是 https://？
```

- 说明：三层由下而上：agent 加载 → config 匹配 → remote 协议，每层一条命令定位。

排查链路展开：`Permission denied (publickey)` 90% 落在三处——agent 没加载钥匙（`ssh-add -l` 输出为空，重新 `ssh-add`）；config 的 Host 没匹配上（检查 `HostName` 拼写与 `IdentityFile` 路径）；remote 还是 https 却以为在走 SSH（`git remote -v` 一眼定案）。剩下 10% 是公钥没上传或上传错账号——重传一遍即解。

**错误做法**（私钥文件权限）：

```bash
$ ls -l ~/.ssh/id_ed25519
-rw-r--r--  1 me  staff   411  id_ed25519   # 644，全员可读
$ ssh -T git@github.com
WARNING: UNPROTECTED PRIVATE KEY FILE!
Permissions 0644 for 'id_ed25519' are too open.
```

- 说明：ssh 直接拒绝使用权限过松的私钥——它是你的数字身份，不是普通配置文件。

**正确做法**：

```bash
$ chmod 600 ~/.ssh/id_ed25519
$ ls -l ~/.ssh/id_ed25519
-rw-------  1 me  staff   411  id_ed25519   # 仅本用户可读写
```

- 说明：600 是私钥的标准权限；`.ssh` 目录本身 700。权限检查在认证之前，报错往往比配错更早出现。

**错误做法**（多账号身份混用）：

```text
# 公司、个人两把钥匙都挂在 github.com 的 Host 上
Host github.com
  IdentityFile ~/.ssh/id_work
  IdentityFile ~/.ssh/id_personal
# → ssh 按顺序逐把试，哪个先通过用哪个，
#   提交推错账号身份只差一次运气的距离
```

- 说明：共享同一个 Host 的多把钥匙，让「用哪个身份」取决于尝试顺序而非你的意图。

**正确做法**：

```text
# Host 别名一一对应，身份由 remote URL 显式选择
Host github-work
  HostName github.com
  IdentityFile ~/.ssh/id_work
Host github-personal
  HostName github.com
  IdentityFile ~/.ssh/id_personal
# clone 时写 git@github-work:company/repo.git
```

- 说明：别名机制让「哪个仓库用哪个身份」变成 remote URL 里的静态事实，不再依赖运行时匹配。

**错误做法**（重新生成密钥）：

```bash
$ ssh-keygen -t ed25519 -C "new key"
Enter file in which to save the key (~/.ssh/id_ed25519):
# 直接回车 → 旧密钥文件被静默覆盖
# → 所有还在用旧公钥的平台瞬间断联
```

- 说明：ssh-keygen 默认路径已有文件时会问一句、回车即覆盖——换钥匙请显式指定新路径。

**正确做法**：

```bash
$ ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_laptop -C "new key"
# 用 -f 指定独立路径，旧密钥原样保留
# 再在 ~/.ssh/config 里给新钥匙配 Host/IdentityFile
```

- 说明：新钥匙新路径 + config 指路，旧平台不断联；确认迁移完成后再吊销旧公钥。

### 免密推送配置自查

- `ssh-keygen -t ed25519` 生成密钥对——ed25519 是现代默认；用 rsa 要显式指定位数
- 公钥上传：平台在设置页添加；自有服务器则追加到 `~/.ssh/authorized_keys`——是追加（`>>`）不是覆盖（`>`）
- `~/.ssh` 目录 700、私钥 600——权限过松时 ssh 直接拒收
- git 推送前先用裸 ssh 验证链路——`ssh -T` 能通，git@ 的推送才有基础
- 首次连接核对主机指纹后再 yes——防中间人：指纹要对得上服务端提供的值

### 追问链

**为什么 SSH 密钥比「用户名 + 密码」安全？私钥不还是一样可能被偷吗？**

三个维度都占优：其一，传输层——认证只回传「挑战串的签名」，窃听者拿不到任何可重放的凭据，而密码本身要在网络里过一遍（TLS 保护，但一旦失误即裸奔）；其二，存储层——平台侧只存公钥，数据库泄露不伤及用户，密码库泄露则全军覆没；其三，可吊销性——私钥疑似泄露，平台上删掉公钥即断联，密码泄露往往意味着别处也在用同一密码。私钥当然可能被偷，但 passphrase 加密 + agent 缓存 + 文件权限 600 把攻击面收窄到「物理接触本机」。

- 延伸：硬件密钥（YubiKey）把私钥再收窄一层：私钥生成与签名全在硬件内完成，本机文件里只有句柄。

**ssh -T git@github.com 连接成功，但 git push 仍报 Permission denied，为什么？**

`ssh -T` 走的是你当前 shell 的环境，而 push 时 Git 实际使用的 remote URL 可能根本不是 git@github.com——先 `git remote -v` 确认协议：如果还是 https:// 开头，认证走的是 HTTPS/token，SSH 配好了也不参与。另一种常见情况：remote 写了别名（如 `git@github-work:...`），该 Host 在 config 里指向另一把钥匙，那把钥匙的公钥没传到对应账号。定位顺序永远是：`remote -v` 看 URL → `ssh -T` 那个确切的 Host 验认证 → `ssh -vT` 看实际加载了哪把 IdentityFile。

- 延伸：`GIT_SSH_COMMAND='ssh -v' git push` 可以在 push 时直接打开 SSH 调试输出，不用单独跑 ssh 命令。

**公司网络封了 22 端口，git clone git@... 直接卡死，怎么办？**

把 SSH 流量改走 443 端口：GitHub 在 ssh.github.com:443 提供完整的 SSH 服务，config 里给 github.com 配 `HostName ssh.github.com` + `Port 443` 即可，Git 命令一字不改。GitLab 同样提供 altssh.gitlab.com:443。验证：`ssh -T -p 443 git@ssh.github.com` 返回成功问候语即通。

- 延伸：如果 443 上的 SSH 也被深度包检测拦截，退路是把协议切成 HTTPS（`remote set-url`），用 PAT + credential helper——可用的出网端口决定协议选型，而不是反过来。

**一台机器上公司账号和个人账号都要用 GitHub，SSH 怎么配才不打架？**

config 的 Host 是别名而非真实域名：为两个账号各生成一对密钥，config 里写两个 Host 条目（如 github-work 与 github-personal），各自指向不同的 IdentityFile；clone 公司仓库时 remote 写 `git@github-work:company/repo.git`，个人仓库写 `git@github-personal:you/repo.git`——Git 按 remote 里的别名匹配 config，各自用各自的钥匙认证到同一个 github.com。已 clone 的仓库用 `remote set-url` 迁移到对应别名。

- 延伸：全局 git config 的 user.name/user.email 也可以按目录覆盖（includeIf + gitdir 前缀），让提交作者信息和账号身份保持一致——身份认证（SSH）与提交署名（commit author）是两套独立系统，多账号场景两者都要理顺。

**.pub 结尾的文件是公钥可以随便发，那有人拿到我的私钥文件（没有 passphrase）会怎样？怎么补救？**

拿到私钥 = 冒充你对该平台上所有仓库的读写（取决于该账号权限），且无需任何第二因素。补救动作有时序要求：一、立即在平台（GitHub/GitLab）删除该公钥并生成新密钥对、上传新公钥——旧私钥立刻作废；二、排查私钥可能泄露的途径（误提交进仓库、网盘、聊天记录发过）；三、如果私钥曾被提交进任何仓库历史，按敏感信息泄露处理：filter-repo 清史 + 强推 + 所有协作者重克隆。预防永远便宜于补救：生成时设 passphrase，本机由 agent 缓存，兼顾安全与顺手。

- 延伸：GitHub 的 Secret scanning 对 OpenSSH 私钥只产生告警、没有「检测到即自动吊销」的端点——所以别依赖平台兜底，自己的密钥自己盯。

延伸阅读：origin/main 是远程上的分支吗？（见「远程协作」——配好的通道上传输的是什么）。

---

## 团队协作工作流与提交规范

*难度：入门 ｜ 标签：Git、工作流、Conventional Commits、功能分支、PR、提交规范*

**提交历史是团队的公共基础设施，两条规范让它可读、可查、可自动化：功能分支工作流管「改动从哪进主干」——main 永远保持可用，每个功能在独立分支上演进，经 PR 评审后合并；Conventional Commits 管「每个提交怎么自我介绍」——`<type>: <描述>` 格式让 git log 可扫描（`--grep="^fix"` 直接筛出所有修复），也让 CHANGELOG 与语义化版本可以自动生成。规范的收益不在写的那一刻，而在六个月后有人 `git log` 排查问题的那一刻。**

### 为什么不能直接提交 main

一个人赶进度时，直接在 main 上小步提交看起来毫无问题。问题在多人共享的那一刻爆发：main 上混着「验证到一半的功能」「改错方向的实验」「半成品的重构」，任何一次发布都要先回答「现在这版能不能上」——而这个问题的答案藏在某次提交意图里，没人记得。工作流的本质是把**「写完」和「可用」两个状态物理隔离**：main 只接受「完成、评审过、测试过」的改动，其余一切都发生在分支上。

隔离之后，主干上每次提交都自动获得三个性质：**可发布**（随时能基于 main 出版本）、**可回滚**（revert 一个 PR 的合并提交即整体撤销一个功能）、**可归因**（历史里每个节点都对应一个经过评审的意图）。这三个性质就是后面提交规范、PR 粒度讨论的评判标准——一切规范都在保护 main 的这三个性质。

### 功能分支工作流：四步循环

主流姿势是四步循环：**开分支 → 小步提交 → 推送开 PR → 合并后清理**。每一步都对应一个 Git 机制，不是流程图上的装饰：

- **开分支**：`git switch -c feature/x`（基于最新 main）
- **小步提交**：一个逻辑一个 commit，写清 type
- **推送开 PR**：`git push -u origin feature/x`
- **合并清理**：合并后删本地与远程分支

第一步「基于最新 main」值得强调：分支只是指向某个提交的指针，从旧 main 开出来的分支天然带着落后的起点，合并时平白多出解决别人已修问题的冲突。习惯动作是开分支前 `git pull`（或 fetch 后基于 `origin/main` 开）。第三步的 `-u` 建立本地分支与远程分支的追踪关系，之后该分支上的 push/pull 不用再写全名。

第四步「合并后清理」之所以敢执行，是两层机制在兜底：`git branch -d` 删除前会检查「这串提交是否已从别的书签可达」，未合并的分支直接拒绝删除——绕过检查的 `-D` 丢掉的提交也还能从 reflog 捞回（见「引用与分支原理」）。而合并方式选 merge 还是 squash，决定这个 PR 在历史上留下的是「分叉气泡 + 一个合并节点」还是「压成单点的普通提交」——历史形状的取舍见「三方合并」。

把两条规范接起来，一次功能开发的完整命令序列（注释标出每步对应的规范点）：

```bash
$ git switch main && git pull                 # 基于「最新」main 开分支
$ git switch -c feat/toc-jump
$ git commit -m "feat: 目录支持点击跳转"       # 一个逻辑一个 commit
$ git commit -m "fix: 跳转后高亮 1.3s 后消退"  # type 路标全程在线
$ git push -u origin feat/toc-jump             # 推送开 PR
# ……评审通过，squash merge 进 main……
$ git switch main && git pull                  # 同步合并结果
$ git branch -d feat/toc-jump                  # 可达性检查通过，安全删除
$ git push origin --delete feat/toc-jump       # 清理远程分支
```

注意 PR 粒度与提交粒度是两个尺度：分支内的提交允许「小步 + 偶尔的 wip」（合并方式选 squash 时它们最终压成一个），但 **PR 本身必须对应一个完整意图**——「顺手修了三个无关 bug」的 PR 是评审和回滚的灾难，应该拆成三个分支。规范的单位从来不是提交，而是「可独立评审、可独立回滚」的改动单元。

### Git Flow

包含长期分支（`main`、`develop`）和短期分支（`feature`、`release`、`hotfix`）。相比功能分支工作流，它增加了集成分支与环境分支，适合发布周期明确的团队；小团队与持续部署场景用功能分支工作流更轻。

### 提交规范：Conventional Commits

格式一句话：`<type>: <简短描述>`，type 声明「这次提交改动了什么性质的东西」。完整格式模板：

```text
<type>(<scope>): <subject>

<body>

<footer>
```

常用七个 type：`feat`（新功能）、`fix`（修 bug）、`docs`（文档）、`refactor`（重构，不改行为）、`test`（测试）、`chore`（构建与杂务）、`perf`（性能）。描述用祈使句、一行说清「做了什么」，细节留给空一行后的 body。它源自社区约定（Conventional Commits 规范），被 semantic-release 等自动化工具当作输入契约。

它不是形式主义，价值全部在「机器可读」四个字上：**log 可扫描**——`git log --oneline --grep="^fix"` 一步筛出所有修复，排查「哪次改动引入的」时按 type 过滤比逐条读快一个量级；**CHANGELOG 可生成**——工具按 feat/fix 自动汇总两个版本间的用户可见变化；**版本号可推导**——只有 feat → minor、只有 fix → patch、出现破坏性变更（`feat!` 或 body 里的 `BREAKING CHANGE:`）→ major，语义化版本的三个数字不再靠人记。

| type | 含义 | 对版本号的含义 | 示例 |
| --- | --- | --- | --- |
| `feat` | 新增用户可见功能 | 触发 minor | `feat: 笔记页支持目录跳转` |
| `fix` | 修复 bug | 触发 patch | `fix: 目录跳转后高亮不消失` |
| `refactor` | 不改行为的重构 | 不影响版本号 | `refactor: 抽出 useTOC hook` |
| `perf` | 性能优化（通常也算修复） | 视团队约定 | `perf: 目录索引改用二分查找` |
| `docs` | 仅文档 | 不影响版本号 | `docs: 补充组件 API 说明` |
| `test` / `chore` | 测试与构建杂务 | 不影响版本号 | `chore: 升级 vite 到 7` |

其余常用 type：`style`（代码格式调整，不影响逻辑）、`ci`（CI 配置更新）、`build`（构建相关）、`revert`（撤销提交），一般均不影响版本号。

> **提示：破坏性变更的写法**
>
> 破坏性变更有专门语法：`feat!` 的感叹号，或 body 里单独一行 `BREAKING CHANGE: 迁移说明`。自动化工具靠这两个标记判断「这次要升 major」，比口头约定可靠得多。

完整示例：

```text
feat(auth): add JWT authentication module

- Implement login endpoint
- Add token verification middleware
- Create user session management
- Add logout functionality

Closes #123
```

**错误做法**（分支与提交粒度）：

```bash
$ git commit -m "改了一堆东西"
# 一个提交：重构 + 修复 + 新功能 + 格式化
$ git push origin main          # 直接推主干，没人评审
```

- 说明：大杂烩提交 + 直推主干，让「可回滚、可归因」同时失效——bisect 定位到它也无法部分撤销。

**正确做法**：

```bash
$ git commit -m "refactor: 抽出 useTOC hook"
$ git commit -m "fix: 跳转高亮残留"
# 一个逻辑一个提交，type 各就各位
$ git push -u origin feat/toc-jump   # PR 只含一个意图
```

- 说明：提交按逻辑切，PR 按意图开——评审按块读，回滚按点撤。

**错误做法**（提交信息写法）：

```text
fix bug
update
修改
wip
```

- 说明：无 type、无对象、无原因——log 变成猜谜，自动化工具完全无法解析。

**正确做法**：

```text
fix: 目录跳转后高亮不消退
refactor: 目录渲染改用 memo 化组件

长描述第二段：说明为什么这样改（body 可选）
```

- 说明：type + 祈使句一行说清做了什么；「为什么」写进 body，别挤在标题里。

> **记忆：规范保护的是六个月后的排查**
>
> - 功能分支保护「main 可发布可回滚」，type 路标保护「log 可扫描可自动化」
> - 两条规范的共同收益期都是事后——写提交信息多花的十秒，会在下一次 bisect、下一次生成 CHANGELOG 时成倍赚回

### 追问链

**团队只有两三个人，功能分支工作流是不是过重了？**

分支本身的成本近乎为零（创建是写一个 41 字节指针文件），不重的从来不是分支而是评审流程。小团队可以缩短循环——分支存活几小时而不是几天、评审可以异步——但「改动不经分支直接进 main」仍然不建议：哪怕只有你一个人提交，main 上「半成品」与「可发布」混在一起，两个月后没有人（包括你自己）能分清哪个节点能部署。

- 延伸：trunk-based development（主干开发）也不是直推 main：它用短命分支 + 特性开关隔离未完成功能，隔离的思想相同，只是尺度更小。

**squash merge 之后，分支里那些小步提交去哪了？**

分支的全部提交被「重放」成一个全新的普通提交（单 parent，内容是分支相对 main 的最终差异），原提交对象仍在对象库里，但从任何分支都不可达——只能在 reflog 里躺到过期。所以 squash 后删除分支没有数据损失，代价是分支内的中间历史不可查：适合「一串 wip 提交最终成型」的场景，不适合「分支内每步都值得留名」的场景。

- 延伸：squash 的新提交哈希必变——GitHub 上 squash 后显示的「被合并提交」只是 UI 关联，Git 层面新旧提交没有任何 parent 关系。

**type 写错了（把 feat 写成 fix）会有实际后果吗？**

有，且和错误的类型成正比：fix 误写成 feat 会让 CHANGELOG 多出一条不存在的「新功能」、版本号被多升一个 minor；反过来 feat 写成 fix 则少升版本，下游可能错过新接口。refactor/docs 这类不影响版本号的 type 之间写错基本无感。破坏性变更漏标（该 feat! 写成 feat）后果最重——依赖方按 semver 自动升级后会直接炸。人工 review type 是防不住的，值得上 commitlint 这类钩子校验。

- 延伸：commitlint + husky 的组合能在 commit 时直接拒绝不合规信息；CI 里再跑一次校验防止 `--no-verify` 绕过。

**PR 合并方式选 merge、squash 还是 rebase，团队怎么定？**

三种方式改变的是历史形状：merge 保留分叉拓扑和分支内全部提交（可追溯每个中间步骤，历史图较乱）；squash 压成单点（历史是干净的直线，但中间步骤全丢）；rebase 把分支提交重放到 main 顶端（保留每个提交、历史线性，但改写了哈希）。选型主轴是「分支内提交的价值」：wip 多的团队选 squash，提交粒度好的团队选 rebase 或 merge。多数托管平台允许按仓库统一配置，关键是全仓库一致，而不是哪种绝对正确。

- 延伸：rebase 合并要求分支上没有他人协作（哈希重写），且冲突要在重放中逐个提交解决——提交越碎冲突次数越多，这是它隐藏的成本。

延伸阅读：origin/main 是远程上的分支吗？（见「远程协作」——推送开 PR 那一步背后 fetch/push 同步了什么）；git 的三个区是怎么分工的？（见「三区模型与日常命令」——四步循环里每条命令的三区语义）。

---

## 存储与回收

*难度：入门 ｜ 标签：Git、GC、packfile、delta 压缩、松散对象、可达性*

**Git 的存储分两层：日常写入时每个对象都是 `.git/objects/` 下的独立小文件（松散对象），零整理成本，这是提交快的另一重原因；后台 GC 时打包成 packfile、对相似对象做 delta 压缩（存一份基准 + 若干增量），并按可达性修剪真正无主的对象。delta 压缩是字节级的、与文本/二进制无关，它是存储优化，不改变「每版一个完整对象」的逻辑模型。checkout 慢的根源从来不是解压，而是文件系统的逐文件操作——超大仓库的全部优化思路都是「少碰文件系统」。**

### 松散对象：日常形态，快就快在从不整理

每次 `git commit` 产生的新对象，Git 的处理方式朴素到令人意外：zlib 压缩、按哈希取前两位建目录、直接写成一个独立小文件。不排队、不合并、不重组——写完即返回。这是「提交快」在存储侧的另一半答案：**写入路径上没有任何整理工作**。

看一个真实仓库的体量统计：

```bash
$ git count-objects -v
count: 774        ← 774 个松散对象（独立小文件）
size: 3484        ← 共约 3.4 MB
in-pack: 0        ← 从未打包
packs: 0
size-pack: 0
prune-packable: 0
garbage: 0
size-garbage: 0

$ ls .git/objects/
00/ 01/ 02/ 03/ 04/ 05/ 06/ 07/ ... info/ pack/   ← 哈希前两位做目录，剩下 38 位做文件名
```

774 个小文件对文件系统毫无压力，但一个十万提交级仓库会积累数百万个松散对象——小文件本身会拖垮文件系统（inode、目录项、open 调用全是开销）。所以 Git 的设计是「日常松散、定期打包」：写入永远走最便宜的路，整理交给后台的 **git gc**（garbage collect）。

### 打包：delta 压缩登场

GC 把松散对象合并成一个 **packfile**（一个大数据包 + 一个 idx 索引），打包时做第二层压缩——**delta**：在一群相似对象（比如同一文件的 10 个历史版本）里选一个做基准，其余版本只存「相对基准的差异」。文件改 10 次，磁盘上可能是 1 份完整 + 9 份增量。

两个必须纠正的认知：**第一**，delta 压缩是字节级的，跟文本/二进制无关——决定效果的是相邻版本是否共享长段相同字节。源码、未压缩格式（BMP/WAV）效果极好；jpg/mp4/zip 这类压缩格式改一个字节整条压缩流重新洗牌，delta 找不到公共片段，效果差。**第二**，delta 只存在于 packfile 内部：随时可以无损还原出任何完整对象（`git cat-file` 就是这么工作的），「每版一个完整对象」的逻辑模型从未被破坏。

真实打包实验：一个 200 行文本文件提交 10 个版本（每次追加一行改动）——

```bash
$ git count-objects -v | grep -E "count|size"
count: 33        ← gc 前：33 个松散对象
size: 132
size-pack: 0
size-garbage: 0

$ git gc         ← 后台大扫除

$ git count-objects -v | grep -E "count|in-pack|packs"
count: 0         ← 松散对象全部收纳
in-pack: 33      ← 33 个对象进了包
packs: 1         ← 只剩 1 个 packfile（+1 个 idx 索引）
# 完整输出里 size-pack 也从 0 变为 4（KiB）——33 个对象压进 4 KB
```

10 个版本的对象最终只占一个包——其中就包含 delta 压缩的功劳。触发时机：松散对象数量超阈值（约 6700 个）自动触发、push 时服务端打包、以及你手动 `git gc`。日常开发几乎感知不到它的存在——这正是设计意图。

### 修剪：提交什么时候才真的消失

GC 的第二件事是**物理删除**。删除的判定标准不是「你执行了删除命令」，而是**可达性**：从三类入口出发顺着指针走——

```text
所有引用（分支 / 标签 / 远程书签）        ─┐
所有未过期 reflog 条目                    ─┼─▶ gc：从三个入口遍历
（可达 90 天 / 不可达 30 天）              │         │
当前 index（暂存区）                     ─┘         ├─▶ 可达 → 留下（可打包，不删除）
                                                    └─▶ 不可达 → 修剪：物理删除
```

把「引用与分支原理」的 reflog 保险串起来，一次「事故提交」的完整生命周期是：被 reset 抛弃（分支不再指着它）→ 成为不可达，reflog 里的记录默认再保 30 天（`gc.reflogExpireUnreachable`；仍被引用指着的提交走 90 天档）→ 条目过期 → 下一次 gc 物理删除。**双重条件都满足才会真的丢**——这就是「Git 里很难真正丢数据」的精确含义。

> **记忆：逻辑删除 ≠ 物理删除**
>
> - branch -d、reset、rebase 抛弃的提交，只是从引用链上摘下来；只要 reflog 未过期，随时能救回来
> - 真正的删除 = reflog 过期 + gc 修剪，两个条件缺一不可
> - 反过来，想让机密文件彻底从仓库消失，光 revert 不够——历史里的旧 blob 依然可达，必须改写历史（filter-repo）再让所有克隆重新同步

**错误做法**（清理对象库）：

```bash
# .git 目录太大，手动「清理」
$ rm -rf .git/objects/ab .git/objects/pack
# → 历史对象缺失，仓库从此 fsck 报损、
#   checkout 旧版本报错，基本只能重新克隆
```

- 说明：对象库里没有「垃圾文件」可手删——每个对象都被哈希索引着，删任意一个都是挖仓库的地基。

**正确做法**：

```bash
$ git count-objects -v      # 先看松散对象数量
$ git gc                    # 打包 + 修剪不可达对象（受 reflog 保护）
$ git gc --prune=now        # 确认不要 reflog 后悔药时的激进修剪
```

- 说明：清理只有一条正路：让 gc 自己判断可达性。`--prune=now` 会连 reflog 时间窗一起放弃，慎用。

**错误做法**（敏感文件的事后处理）：

```bash
$ git rm credentials.env
$ git commit -m "fix: 移除密钥文件"
$ git push
# → 最新版本干净了，但历史里那个 blob 仍可达，
#   checkout 旧版本即可原样取回密码
```

- 说明：删除只影响之后的版本；可达性不变，历史里的对象一个字节都不会少。

**正确做法**：

```bash
# ① 先作废泄露的凭据（改密码/换 key），再做 Git 侧清理
$ git filter-repo --path credentials.env --invert-paths
$ git push --force
# ② 通知所有协作者重新克隆
```

- 说明：改写历史让旧 blob 不可达，下一次 gc 才可能物理删除；凭据作废永远排在清理前面。

### checkout 的真实成本模型

「频繁切换分支会不会把 CPU/磁盘搞坏」——不会，因为 checkout 有一个前置步骤：**先对比当前与目标的 tree，只重写有差异的文件**。100 个文件的仓库切到只差 2 个文件的分支，Git 只解压重写那 2 个，其余 98 个原地不动。日常切分支的实际成本正比于**两棵树的差异**，不是项目大小——「频繁 checkout」不等于「频繁全量重建」，又是同一个主题：靠哈希对比跳过所有没变的东西。

就算真的要大量物化文件，成本结构也和你直觉的不同。zlib 解压单核几百 MB/s，真正的大头是**每个文件的系统调用链**（open/create/write/close、目录元数据更新，Windows 上还有杀毒扫描）。证据是业界优化超大仓库（Chromium 级，千万文件、数百 GB 历史）时，没有一家在做「解压加速」，方向清一色是「少碰文件系统」：

| | sparse-checkout：少检出 | 治本：别让仓库变大 |
| --- | --- | --- |
| 思路 | 工作区只物化你需要的子目录，对象库仍然完整（历史都在） | 大文件出库（LFS / 对象存储，见「大文件与 Git LFS」） |
| 效果 | checkout 只写选中的那部分文件 | 构建产物绝不入库（.gitignore 前置）；一个仓库一个领域，避免万物 monorepo |
| 实践 | Chromium / Android 团队的日常形态 | 历史臃肿后无法自愈——预防远便宜于治理 |
| 配套 | 配 partial clone：连用不到的 blob 都不下载 | `git filter-repo` 是事后手术，代价是全团队重克隆 |

### 与大文件问题的交界

本篇的成本模型还能推出大文件问题的根源：内容寻址按「内容是否相同」去重，二进制大文件的每个版本都是全新字节流——既没有 blob 复用，delta 压缩对已压缩格式（jpg/mp4/zip 每版字节全变）也几乎失效，于是**每个版本都是一个完整 blob 进包**，再乘上「别人没有就必须传」的同步原则，克隆体积随历史线性膨胀。

解法是把大文件请出对象库——Git LFS 的指针文件机制、数据集场景的 DVC、clone 侧的 `--filter` 部分克隆，以及已经入库后的 filter-repo 清史手术，全部在「大文件与 Git LFS」展开。

### 追问链

**git gc 会不会把我没提交的工作区改动删掉？**

不会。GC 的工作对象是 `.git/objects` 里的对象，工作区和 index 是它的「保护对象」而不是清理对象：可达性入口之一就是当前 index，暂存过的内容 gc 必然保留；工作区里未 add 的文件根本不在对象库里，与 gc 无关。gc 能删的只有「三个入口都不可达」的对象，你的工作内容几乎总能从 index 或 reflog 追溯到。

- 延伸：唯一理论例外：git stash 的悬挂暂存超过默认保留期后会被清——stash 本质是 commit 对象，可达性靠 stash 引用维持，drop 掉又过期的 stash 才真正无主。

**为什么 Git 对文本文件的存储效率这么高？说出一层以上的原因。**

至少两层。第一层（逻辑）：内容寻址的天然去重——没改的文件哈希不变、直接复用旧 blob，每次提交只新增变化部分；相同的文本（LICENSE、模板、依赖声明）全仓库只存一份。第二层（物理）：gc 打包时对相似 blob 做 delta 压缩，同一文件的多个历史版本只存一份基准加若干增量。两层叠加，源码仓库的增长率通常远低于「每次改动的工作量」。

- 延伸：zlib 还会吃掉一层：源码文本压缩比通常 2-4 倍，这是与内容无关的通用压缩，打包前后都在生效。

**频繁切换分支对 CPU 和磁盘压力大吗？成本到底花在哪？**

压力很小，因为 checkout 只物化两棵 tree 的差异：先对比当前与目标，只有哈希不同的文件才解压重写，日常切分支通常只动几个文件。成本大头不是解压（zlib 单核几百 MB/s），而是逐文件的系统调用——文件多才慢，单个文件解压极快。回到「Git 快靠不做无关工作」：切分支快不是因为解压优化好，是因为绝大多数文件根本不碰。

- 延伸：极端案例（千万文件级 monorepo）的官方解法 sparse-checkout + partial clone 全是「减少碰文件系统的数量」，从侧面证明瓶颈永远在文件系统操作而不在解压。

**误提交了一个带密码的文件后来删掉了，仓库还安全吗？**

不安全。后续的删除只是让最新版本不含密码，历史里那个 blob 完好可达（旧提交还指着它），任何有仓库的人 checkout 旧版本就能拿到。彻底清除需要改写历史：`git filter-repo` 抹掉该文件的全部历史版本 → 强推覆盖远端 → 所有协作者重新克隆 → 立刻作废泄露的密码。最后一步与 Git 无关，但最重要——历史改写只保证「新克隆看不到」，挡不住已经拉取过的人。

- 延伸：BFG Repo-Cleaner 是 filter-repo 的替代品；GitHub 对敏感数据还有官方协助渠道（撤下缓存视图）。事故处置的优先级永远是：先作废凭据，再清理历史——历史清理慢一步没关系，密码泄露多一刻都是事故。

延伸阅读：仓库为什么被几张大文件撑爆？（见「大文件与 Git LFS」）；git 为什么不存 diff：内容寻址怎么做的？（见「对象模型」——GC 修剪与打包的对象从哪来）。

---

## 大文件与 Git LFS

*难度：进阶 ｜ 标签：Git、Git LFS、大文件、二进制、partial clone、DVC*

**大文件撑爆仓库是内容寻址模型的必然死角：diff 依赖行语义，二进制没有；delta 压缩靠公共字节段，已压缩格式每版字节全变；于是每个版本都是一个完整 blob，再乘上「别人没有就必须传」的同步原则——100 MB 的文件改 50 次，每个克隆者都要为 5 GB 历史买单。出路是把大文件请出对象库：Git LFS 在仓库里只留三行指针文本、真身放内容服务器；数据集场景用 DVC；clone 侧用 `--filter` 部分克隆。已经入库的只有一条路：filter-repo 改写历史 + 全团队重克隆。**

### 二进制在 Git 里的两半：diff 没救，存储看格式

先把「Git 存不了二进制」这个流行说法拆准。Git 判定文件是否二进制的方式很朴素：内容前 8000 字节里有没有 NUL 字节。判定为二进制后，`git diff` 只会显示 `Binary files a/x and b/x differ`——这不是偷懒，而是行级 diff 算法的前提（按行切分、按行对齐）对二进制根本不成立：一行「字节」的粒度太细，两个版本之间几乎不存在「没变的行」。可以配 textconv 让 diff 前先转文本（图片比 EXIF/尺寸、docx 用 docx2txt），但那只是给人类看的近似，存储层与此无关。

存储这一半要分开说。packfile 的 **delta 压缩是字节级的**，它不认文本还是二进制——决定效果的是相邻版本是否共享长段相同字节。未压缩格式（BMP、WAV、某些 CAD 格式）改个头部，主体字节原样保留，delta 效果极好；而 jpg/mp4/zip/psd 这类**内部已经压缩过的格式**，哪怕视觉上没改，重新导出一次整条压缩流就全部洗牌，delta 找不到任何公共片段——退化成「每版存一份完整拷贝」。真正的死穴在这里，不在「二进制」三个字。

### 克隆税：每版一个完整 blob 的代价

内容寻址的去重靠「内容相同 → 哈希相同」，但二进制大文件的每个新版本都是不同的内容，必然生成新 blob——**逻辑快照、物理增量在它身上失效**。100 MB 的模型文件改 50 次 ≈ 5 GB 进包；而且对象库的同步原则是「远端报出它有的哈希，缺什么传什么」（见「远程协作」的协商机制），**去重救不了「别人根本没有」的对象**——每个新克隆、每个 CI 环境、每个新同事，都得把全部 5 GB 拉下来。仓库一旦背上这份历史，它无法自愈：后续的删除只影响之后的版本，历史里的旧 blob 依旧可达（GC 的可达性法则）。

| 同一大文件两种管理方式 | 克隆体积（数量级直觉，非精确值） |
| --- | --- |
| 直接进 Git（50 个版本） | 约 5000 MB |
| Git LFS（按需拉取当前版） | 约 100 MB |

### Git LFS：仓库里只留三行指针

**Git LFS**（Large File Storage）的机制：被 track 的文件在 commit 时被一个干净的文本指针替换，真身按哈希存进独立的内容服务器；checkout 时 smudge 过滤器按指针的哈希把真身下载回来，本地按哈希缓存去重。指针文件的格式出自 LFS 规范，只有三行——下面是一个 12 MB 二进制（oid 与 size 为该文件的实际计算值）：

```bash
# .gitattributes 声明哪些路径走 LFS（必须先 track 再 add，顺序反了会漏网）
git lfs track "*.psd"

# 仓库里实际存储的「文件」内容——三行文本指针：
# version https://git-lfs.github.com/spec/v1
# oid sha256:bc340bb394b0e991eccb19514aeac0bc620c71bc6ccbb62bb8e5a9e0ae2ada41
# size 12582912
```

指针文本大约 130 字节，随提交图正常存储、正常 diff（改了哪版一目了然）；对象库里膨胀的 `.git/objects` 变成了 LFS 服务器上按哈希寻址的存储条目。最有意思的是它的本质：LFS 自己就是一个**迷你内容寻址数据库**——哈希即地址、指针引用、天然去重，与 `.git/objects` 同构，只是后端从 packfile 换成了 HTTP 服务。等于社区承认「巨型 blob 不该住在提交图里」，但把 Git 的核心思想原样搬了过去。

```text
仓库里：只有指针文件（SHA-256 + 大小）
  ├── 普通 blob：照旧入库 ──▶ 你的 .git/objects（不膨胀）
  └── 指针 ──▶ LFS 内容服务器：存真实大文件
                    │
                    ▼ checkout 时 smudge 过滤器按哈希下载
               工作区（按需流式拉取）
```

> **注意：CI 是 LFS 最常见的翻车现场**
>
> LFS 的真身在 smudge 过滤器 checkout 时下载——CI 容器里没装 `git-lfs` 时，clone 下来的是 130 字节的指针文本，构建时才报「文件太小/格式不对」。CI 镜像必须安装 git-lfs 并在 clone 前执行 `git lfs install`（GitHub Actions 提供 actions/checkout 的 `lfs: true` 选项）。

### 两条替代路线：DVC 与 partial clone

**DVC**（Data Version Control）面向数据集场景：Git 仓库里只存 `.dvc` 元数据文件（记录数据文件的哈希与远端位置），数据本体推到 S3/GCS/SSH 等对象存储后端。它与 LFS 的差别在定位：LFS 把「代码 + 大文件」当作同一个仓库的两种资产，托管平台原生集成；DVC 把数据管线独立管理，适合几个 GB 起步、按目录整体版本化的 ML 数据集——本质同样是「Git 管元数据指针，后端管数据」。

**partial clone** 则是纯 Git 官方机制的路线：clone 时声明 `--filter=blob:none`，先不下载任何 blob，检出或查看时按需向远端补拉（需要服务端开启 `uploadpack.allowFilter`）。临时仓库实测（源仓库含 3 个 5 MB 随机文件的不同版本）：

```bash
$ git clone --filter=blob:none --no-checkout file:///tmp/bigsrc part
$ cd part && du -sh .git
120K	.git                              ← 只有 3 commit + 3 tree，blob 全没来
$ git count-objects -v | grep in-pack
in-pack: 6

# 对照：完整克隆
$ du -sh /tmp/bigfull/.git
15M	.git                              ← 9 个对象：多出 3 个 5MB blob

$ git checkout main                       # 检出触发按需补拉
$ du -sh .git
15M	.git                              ← 当前版本的 blob 此刻才到
```

注意两个前提：**必须走 `file://` 或真实网络协议**——本地路径 clone 会被 Git 降级为硬拷贝并忽略 filter（有 warning）；**要配 --no-checkout**——clone 默认检出 HEAD，检出动作会把当前版本的 blob 立刻按需拉下来，只有「先不检出」才能拿到那个 120K 的极小仓库。partial clone 省的是「历史里的版本」和「你还没用到的文件」，对稀疏检出（sparse-checkout）的 monorepo 是官方组合拳。

### 已经入库的大文件怎么清

大文件一旦进了历史，「删掉文件再提交」毫无用处——旧版本的 blob 仍被旧提交指着，可达性法则保证它继续活在每个克隆里。唯一的根治是**改写历史**：`git filter-repo --path 大文件 --invert-paths`（或 BFG Repo-Cleaner）把该文件的全部历史版本从每个提交中抹除，随后强推覆盖远端、所有协作者重新克隆。代价清单很长：全部哈希改变、挂着的 PR 和 issue 引用失效、没来得及同步的本地克隆变成孤岛。所以决策口诀永远是预防优先：**文本按行演进的进 Git；按版本演进的大二进制进 LFS 或对象存储；能重新生成的构建产物什么都不进**。

**错误做法**（历史清洗）：

```bash
$ git rm model_v7.bin
$ git commit -m "chore: 移除大文件"
$ git push
# 仓库并没有变小：旧版本的 blob 仍被历史提交可达，
# 每个克隆者照样拉全部 5 GB
```

- 说明：删除只改「之后的版本」，可达性不变——这是「逻辑删除 ≠ 物理删除」在大文件场景的直接推论。

**正确做法**：

```bash
$ git filter-repo --path model_v7.bin --invert-paths
$ git push --force
# 通知团队：全部重新克隆，旧克隆作废
```

- 说明：改写历史让旧 blob 不可达，之后的 gc 才可能回收；先备份再动手，hash 全变不可逆。

**错误做法**（LFS 的适用边界）：

```bash
$ git lfs track "*.ts" "*.json"
# 把源码交给 LFS：diff 失去行语义、每次检出多一次网络请求、
# 平台 UI 不再显示代码 diff，评审功能报废
```

- 说明：LFS 文件没有内容 diff、没有行级评审——文本源码进 LFS 是纯倒退。

**正确做法**：

```bash
$ git lfs track "*.psd" "*.mp4" "*.blend"
# 按版本演进的大二进制才进 LFS；
# 偶发的小附件（<1MB、不再改动）→ 对象存储发链接更省
```

- 说明：判断维度两个：是否二进制、是否按版本演进。二者同时成立才值得付 LFS 的集成成本。

### 追问链

**Git 为什么没法像文本那样压缩二进制文件的历史版本？**

分两类：未压缩格式（BMP/WAV）其实压得动——packfile 的 delta 是字节级 diff，相邻版本共享的长段字节会被提取为基准 + 增量。真正失效的是内部已压缩的格式（jpg/mp4/zip/psd）：压缩流的设计目标是消除字节冗余，重新导出一次全部字节重排，delta 算法找不到公共片段，只能整份存储。所以准确的说法不是「二进制压不动」，而是「压缩过的格式压不动」。

- 延伸：由此能推出一个工程技巧：必须入库的数值数据用未压缩或列存格式（如未压缩 CSV/Parquet）比 zip 打包后入库更省——前者能吃到 delta，后者每版全量。

**Git LFS 为什么能解决大文件问题？它的本质是什么？**

LFS 把大文件从提交图中剥离：仓库里只存一个小指针文件（SHA-256 哈希 + 大小的三行文本），真身放在独立的内容服务器；checkout 时由 smudge 过滤器按指针的哈希流式拉取，本地按哈希缓存去重。效果：`.git` 不膨胀、clone 不再连带全部历史版本的大文件、指针文本本身可正常 diff（能看到「哪一版换了哪个文件」）。

- 延伸：本质层面：LFS 就是一个迷你版内容寻址数据库——与 `.git/objects` 同构（哈希即地址、指针引用、天然去重），只是存储后端从本地 packfile 换成了 HTTP 服务。「内容寻址 + 指针」是可迁移的架构模式：DVC、Docker 镜像层、CAS 存储、IPFS 都在用同一套思想。

**CI 上 clone 一切正常，构建时却报「模型文件只有 130 字节」，怎么回事？**

CI 环境没装 git-lfs（或没执行 `git lfs install`），clone 时 smudge 过滤器缺席，仓库里的 LFS 指针文本被原样检出——130 字节正是指针文件的大小。修复：CI 镜像安装 git-lfs，并在 checkout 之前初始化（GitHub Actions 用 actions/checkout 的 `lfs: true`；自建流程在 clone 前 `git lfs install`）。顺带确认 LFS 服务器的认证凭据在 CI 环境可用，否则 smudge 会以 404 的形式失败。

- 延伸：`git lfs ls-files` 能列出哪些文件是 LFS 指针、哪些已检出（前面带 `-` 或 `*` 标记），是排查这类问题最快的一条命令。

**filter-repo 清完历史、强推之后，团队里每个协作者要做什么？为什么不能直接 pull？**

正确动作是删除本地克隆、重新 clone——不能 pull。filter-repo 改写了所有受影响提交的哈希，远端历史是一条全新哈希链；本地旧克隆的提交与新链没有任何公共祖先关系，pull 只会制造巨大的无意义合并或直接拒绝（divergent branches）。处置顺序：先作废泄露凭据（如果有）→ filter-repo → 强推 → 通知全员重克隆 → 旧克隆限期作废。历史改写只保证「之后的克隆干净」，挡不住已经拉取过的人手里那份。

- 延伸：GitHub 上被清除文件的 PR 引用、缓存视图可能残留（官方有协助撤下的渠道）——托管平台的边缘缓存是 filter-repo 管不到的盲区。

**partial clone 既然是官方机制，为什么不默认开启？它和 LFS 是竞争关系吗？**

不默认开启是因为它把成本转移到了运行时：每次检出、`git log --stat`、blame 都可能触发按需网络拉取，离线场景直接不可用——对「全量工作」的日常开发是负优化，只适合稀疏检出（sparse-checkout）的巨型 monorepo。它与 LFS 也不是竞争关系：partial clone 解决「历史里已有的大 blob 别急着下载」，LFS 解决「大 blob 根本不进对象库」。前者是拉取策略，后者是存储架构——大仓库实践中两者共存。

- 延伸：promisor remote 是 partial clone 的底层概念：仓库声明「缺的对象可以找某个 remote 要」，补拉动作对用户透明，`git log --filter=blob:none` 还能只列提交不展开文件。

延伸阅读：git 的垃圾是怎么被回收的？（见「存储与回收」——可达性法则与 packfile 机制的本篇源头）；origin/main 是远程上的分支吗？（见「远程协作」——克隆税的由来：同步按哈希集合求差）。

---

## 子模块

```bash
# 添加子模块到指定路径
git submodule add https://github.com/user/repo.git path/to/submodule
# 克隆项目时同时初始化所有子模块
git clone --recurse-submodules https://github.com/user/repo.git
# 在已克隆的项目中初始化并更新子模块
git submodule update --init --recursive
# 将所有子模块更新到远程最新提交
git submodule foreach git pull origin main

# 删除子模块（需三步完成）
git submodule deinit path/to/submodule   # 取消注册
git rm path/to/submodule                 # 从版本控制中移除
rm -rf .git/modules/path/to/submodule   # 删除残留的 git 数据
```

---

## Worktree

在同一仓库中同时检出多个分支到不同目录，共享 `.git` 数据库，各自拥有独立工作区和 HEAD。

适用于：并行开发多个分支（无需反复 stash 切换），或同时编译/测试不同版本。

### 常用命令

```bash
# 查看所有 worktree
git worktree list

# 添加 worktree（检出已有分支）
git worktree add ../my-feature feature/login

# 添加 worktree 并创建新分支（基于当前 HEAD）
git worktree add -b feature/new-ui ../new-ui

# 删除 worktree（先删目录，再清理元数据）
rm -rf ../my-feature
git worktree prune

# 锁定 worktree，防止被 prune（适用于 CI 临时目录）
git worktree lock ../ci-build
git worktree unlock ../ci-build
```

### 示例

正在开发 `feature/auth`，需要临时切到 `main` 查 bug：

```bash
git worktree add ../main-checkout main
cd ../main-checkout
# 调试 main，不影响 feature/auth 工作区

# 完成后清理
rm -rf ../main-checkout && git worktree prune
```

### 注意事项

- 所有 worktree 共享同一 Git 对象数据库，提交和标签对全部 worktree 可见
- 同一分支不能被两个 worktree 同时检出
- 不支持嵌套 worktree
- 需要 Git 2.5.0+
