# Git

> Git 是一个分布式版本控制系统，用于跟踪代码变更历史、协同开发和版本管理。

## 基础概念

- **工作区（Working Directory）**：项目的实际文件夹
- **暂存区（Staging Area）**：准备提交的变更集合
- **本地仓库（Local Repository）**：本地的 Git 仓库
- **远程仓库（Remote Repository）**：服务器上的 Git 仓库

---

## 初始化与配置

```shell
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

## 工作区操作

```shell
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

---

## 分支管理

```shell
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

## 远程仓库

```shell
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

---

## 历史记录

```shell
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

# 重置暂存区（保持工作区不变）
git reset
# 回退到上一个提交，变更保留在暂存区
git reset --soft HEAD~1
# 回退到上一个提交，变更保留在工作区（默认行为）
git reset --mixed HEAD~1
# 回退到上一个提交，彻底删除所有修改
git reset --hard HEAD~1
# 重置到指定提交
git reset --hard commit-hash

# 撤销最近一次提交（创建一个新的反向提交，不修改历史）
git revert HEAD
# 撤销指定提交
git revert commit-hash
# 撤销但不自动创建提交（准备手动提交）
git revert --no-commit commit-hash
```

---

## 标签管理

```shell
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

---

## 高级操作

### 变基（rebase）

```shell
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

```shell
# 将指定提交应用到当前分支
git cherry-pick commit-hash
# 拣选多个不连续的提交
git cherry-pick commit1 commit2 commit3
# 拣选一段范围的提交（不含 commit1）
git cherry-pick commit1..commit3
# 拣选一段范围的提交（含 commit1）
git cherry-pick commit1^..commit3
```

### 临时保存（stash）

```shell
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
```

---

## 撤销操作

```shell
# 撤销单个文件的工作区更改（恢复到暂存区状态）
git checkout -- filename.txt
# 撤销所有工作区更改
git checkout .

# 取消暂存单个文件（保留工作区修改）
git reset HEAD filename.txt
# 取消暂存所有文件
git reset HEAD
```

---

## SSH 配置

```bash
# 生成 Ed25519 密钥对（更现代安全，推荐）
ssh-keygen -t ed25519 -C "your-email@example.com"
# 或使用 RSA 4096 位密钥
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 启动 SSH 代理
eval "$(ssh-agent -s)"
# 将私钥添加到 SSH 代理（避免每次输入密码）
ssh-add ~/.ssh/id_ed25519
```

`~/.ssh/config` 配置：

```text
Host github.com
  HostName ssh.github.com
  Port 443                        # 使用 443 端口绕过防火墙限制
  User git
  IdentityFile ~/.ssh/id_ed25519

Host gitlab.com
  HostName gitlab.com
  User git
  IdentityFile ~/.ssh/id_ed25519
```

```bash
# 将远程仓库协议从 HTTPS 改为 SSH
git remote set-url origin git@github.com:user/repo.git
# 将远程仓库协议从 SSH 改为 HTTPS
git remote set-url origin https://github.com/user/repo.git
```

---

## 子模块

```shell
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

## 工作流程

### 功能分支工作流

```shell
# 1. 从最新的 main 分支创建功能分支
git checkout main && git pull origin main
git checkout -b feature/new-functionality

# 2. 开发功能并提交
git add .
git commit -m "feat: implement new functionality"

# 3. 推送功能分支并在平台上创建 PR/MR
git push -u origin feature/new-functionality

# 4. PR 合并后，同步本地并清理分支
git checkout main && git pull origin main
git branch -d feature/new-functionality          # 删除本地分支
git push origin --delete feature/new-functionality  # 删除远程分支
```

### Git Flow

包含长期分支（`main`、`develop`）和短期分支（`feature`、`release`、`hotfix`）。

---

## 提交规范

格式：

```text
<type>(<scope>): <subject>

<body>

<footer>
```

类型说明：

| 类型 | 说明 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `docs` | 文档更新 |
| `style` | 代码格式调整，不影响逻辑 |
| `refactor` | 重构 |
| `test` | 测试相关 |
| `chore` | 构建或辅助工具变动 |
| `perf` | 性能优化 |
| `ci` | CI 配置更新 |
| `build` | 构建相关 |
| `revert` | 撤销提交 |

示例：

```text
feat(auth): add JWT authentication module

- Implement login endpoint
- Add token verification middleware
- Create user session management
- Add logout functionality

Closes #123
```
