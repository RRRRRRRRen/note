# Git 使用指南

Git 是一个分布式版本控制系统，用于跟踪代码变更历史、协同开发和版本管理。

## 目录
- [Git 使用指南](#git-使用指南)
  - [目录](#目录)
  - [基础概念](#基础概念)
  - [基本操作命令](#基本操作命令)
    - [初始化和配置](#初始化和配置)
    - [工作区操作](#工作区操作)
    - [分支管理](#分支管理)
    - [远程仓库](#远程仓库)
    - [历史记录](#历史记录)
    - [标签管理](#标签管理)
  - [高级操作](#高级操作)
    - [变基操作](#变基操作)
    - [拣选提交](#拣选提交)
    - [交互式变基](#交互式变基)
  - [实用技巧](#实用技巧)
    - [SSH 配置](#ssh-配置)
    - [子模块管理](#子模块管理)
    - [撤销操作](#撤销操作)
  - [工作流程](#工作流程)
  - [提交规范](#提交规范)

## 基础概念

- **工作区(Working Directory)**：项目的实际文件夹
- **暂存区(Staging Area)**：准备提交的变更集合
- **本地仓库(Local Repository)**：本地的 Git 仓库
- **远程仓库(Remote Repository)**：服务器上的 Git 仓库

## 基本操作命令

### 初始化和配置

#### git init
初始化一个新的 Git 仓库。

```shell
# 在当前目录创建一个 Git 仓库
git init

# 创建一个名为 my-project 的目录并初始化 Git 仓库
git init my-project
```

#### git config
配置 Git 用户信息和行为。

```shell
# 设置全局用户名和邮箱（仅需设置一次）
git config --global user.name "your-name"
git config --global user.email "your-email@example.com"

# 查看当前配置
git config --list

# 设置别名（简化命令）
git config --global alias.st status
git config --global alias.co checkout
```

### 工作区操作

#### git add
将文件添加到暂存区。

```shell
# 添加单个文件
git add filename.txt

# 添加所有修改过的文件
git add .

# 添加特定类型的文件
git add *.js

# 交互式添加（选择性添加部分内容）
git add -p
```

#### git commit
提交暂存区的更改到本地仓库。

```shell
# 提交并输入提交信息
git commit -m "描述性的提交信息"

# 修改最后一次提交（不改变提交信息）
git commit --amend --no-edit

# 修改最后一次提交（包括提交信息）
git commit --amend -m "新的提交信息"
```

#### git status
查看工作区状态。

```shell
# 查看当前状态
git status

# 简洁输出状态
git status -s
```

#### git diff
查看文件差异。

```shell
# 查看工作区与暂存区的差异
git diff

# 查看暂存区与本地仓库的差异
git diff --staged
git diff --cached

# 查看工作区与本地仓库指定版本的差异
git diff HEAD~1
```

### 分支管理

#### git branch
管理本地分支。

```shell
# 查看本地分支（当前分支前有 * 标记）
git branch

# 查看所有分支（包括远程分支）
git branch -a

# 查看远程分支
git branch -r

# 创建新分支
git branch feature-branch

# 删除本地分支
git branch -d feature-branch

# 强制删除本地分支
git branch -D feature-branch
```

#### git checkout
切换分支或恢复工作树文件。

```shell
# 切换到指定分支
git checkout branch-name

# 创建并切换到新分支
git checkout -b new-feature

# 恢复指定文件到指定版本
git checkout HEAD~1 -- filename.txt
```

#### git switch
切换分支（较新版本 Git 提供）。

```shell
# 切换到指定分支
git switch main
git switch feature-branch

# 创建并切换到新分支
git switch -c new-feature

# 切换到上一个分支
git switch -
```

### 远程仓库

#### git clone
克隆远程仓库。

```shell
# 克隆仓库到本地
git clone https://github.com/user/repo.git

# 克隆到指定目录
git clone https://github.com/user/repo.git my-directory

# 克隆指定分支
git clone -b branch-name --single-branch https://github.com/user/repo.git
```

#### git remote
管理远程仓库。

```shell
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin https://github.com/user/repo.git

# 更改远程仓库地址
git remote set-url origin https://github.com/user/new-repo.git

# 添加上游仓库（用于同步主仓库的更新）
git remote add upstream https://github.com/original/repo.git
```

#### git fetch
从远程仓库获取更新（不自动合并）。

```shell
# 获取所有远程分支的更新
git fetch origin

# 获取特定分支的更新
git fetch origin feature-branch

# 获取所有远程仓库的更新
git fetch --all
```

#### git pull
从远程仓库获取更新并自动合并。

```shell
# 拉取并合并当前分支的远程更新
git pull origin main

# 拉取并合并指定分支的更新
git pull origin feature-branch

# 使用 rebase 方式合并
git pull --rebase origin main
```

#### git push
将本地更改推送到远程仓库。

```shell
# 推送到远程仓库的同名分支
git push origin main

# 推送并设置上游分支（首次推送时使用）
git push -u origin main

# 强制推送（谨慎使用）
git push --force origin main

# 删除远程分支
git push origin --delete feature-branch

# 推送所有标签
git push origin --tags
```

### 历史记录

#### git log
查看提交历史。

```shell
# 查看详细提交历史
git log

# 以一行显示简要历史
git log --oneline

# 查看图形化的分支历史
git log --graph --oneline --all

# 查看指定文件的历史
git log --follow filename.txt

# 显示统计信息
git log --stat

# 显示具体变化
git log -p
```

#### git reflog
查看引用日志（包含已删除的提交）。

```shell
# 查看 HEAD 移动历史
git reflog

# 查看特定分支的移动历史
git reflog show feature-branch
```

#### git reset
重置当前分支到指定状态。

```shell
# 重置暂存区（保持工作区不变）
git reset

# 重置到上一个提交（保持工作区变更）
git reset --soft HEAD~1

# 重置到上一个提交（保留修改到工作区）
git reset --mixed HEAD~1

# 重置到上一个提交（彻底删除修改）
git reset --hard HEAD~1

# 重置到指定提交
git reset --hard commit-hash
```

#### git revert
创建一个新提交来撤销指定提交的更改。

```shell
# 撤销最近一次提交
git revert HEAD

# 撤销指定提交
git revert commit-hash

# 撤销而不创建提交（准备手动提交）
git revert --no-commit commit-hash
```

### 标签管理

#### git tag
管理标签。

```shell
# 查看所有标签
git tag

# 创建轻量标签
git tag v1.0.0

# 创建附注标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签到远程仓库
git push origin v1.0.0
git push origin --tags  # 推送所有标签

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0
```

## 高级操作

### 变基操作

#### git rebase
将一个分支的更改应用到另一个分支上。

```shell
# 将当前分支变基到 main 分支
git checkout feature-branch
git rebase main

# 交互式变基（修改提交历史）
git rebase -i HEAD~3  # 修改最近三次提交
```

### 拣选提交

#### git cherry-pick
选择特定提交应用到当前分支。

```shell
# 拣选单个提交
git cherry-pick commit-hash

# 拣选多个提交
git cherry-pick commit1 commit2 commit3

# 拣选一系列提交（从 commit1 后面开始到 commit3）
git cherry-pick commit1..commit3

# 拣选包含起点的一系列提交
git cherry-pick commit1^..commit3
```

### 交互式变基

交互式变基用于修改提交历史，如合并提交、重排提交、修改提交信息等。

```shell
# 交互式变基最近 3 次提交
git rebase -i HEAD~3
```

变基指令说明：
- `pick`：保留此提交
- `reword`：保留此提交但修改提交信息
- `edit`：保留此提交但允许修改
- `squash`：与此前提交合并（保留提交信息）
- `fixup`：与此前提交合并（丢弃提交信息）
- `drop`：删除此提交

## 实用技巧

### 临时保存更改

#### git stash
临时保存未完成的工作。

```shell
# 保存当前工作区和暂存区的更改
git stash push -m "work in progress"

# 保存所有更改（包括未跟踪的文件）
git stash push -m "work in progress" --include-untracked

# 快速保存
git stash

# 查看保存的更改列表
git stash list

# 应用最近一次保存的更改
git stash pop

# 应用指定索引的更改（不删除 stash）
git stash apply stash@{1}

# 删除指定的 stash
git stash drop stash@{0}

# 清空所有 stash
git stash clear
```

### SSH 配置

SSH 密钥用于安全地连接到远程 Git 仓库。

#### 生成 SSH 密钥

```bash
# 生成新的 SSH 密钥对
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 或使用更现代的 Ed25519 算法
ssh-keygen -t ed25519 -C "your-email@example.com"
```

#### 添加 SSH 密钥到 SSH 代理

```bash
# 启动 SSH 代理
eval "$(ssh-agent -s)"

# 添加私钥到 SSH 代理
ssh-add ~/.ssh/id_ed25519
```

#### 配置 SSH

在 `~/.ssh/config` 文件中添加：

```
Host github.com
  HostName ssh.github.com
  Port 443
  User git
  IdentityFile ~/.ssh/id_ed25519

Host gitlab.com
  HostName gitlab.com
  User git
  IdentityFile ~/.ssh/id_ed25519
```

#### 更改远程仓库协议

```bash
# 从 HTTPS 改为 SSH
git remote set-url origin git@github.com:user/repo.git

# 从 SSH 改为 HTTPS
git remote set-url origin https://github.com/user/repo.git
```

### 子模块管理

子模块允许将一个 Git 仓库作为另一个仓库的子目录。

```shell
# 添加子模块
git submodule add https://github.com/user/repo.git path/to/submodule

# 克隆包含子模块的项目
git clone --recurse-submodules https://github.com/user/repo.git

# 初始化和更新子模块
git submodule update --init --recursive

# 更新所有子模块到最新提交
git submodule foreach git pull origin main

# 删除子模块
git submodule deinit path/to/submodule
git rm path/to/submodule
rm -rf .git/modules/path/to/submodule
```

### 撤销操作

#### 撤销工作区更改

```shell
# 撤销单个文件的更改
git checkout -- filename.txt

# 撤销所有更改
git checkout .
```

#### 撤销暂存区更改

```shell
# 取消暂存单个文件
git reset HEAD filename.txt

# 取消暂存所有文件
git reset HEAD
```

## 工作流程

### 功能分支工作流

```shell
# 1. 从 main 分支创建功能分支
git checkout main
git pull origin main
git checkout -b feature/new-functionality

# 2. 开发功能并提交
git add .
git commit -m "feat: implement new functionality"

# 3. 推送功能分支
git push -u origin feature/new-functionality

# 4. 在代码审查平台创建 PR/MR

# 5. 合并后删除功能分支
git checkout main
git pull origin main
git branch -d feature/new-functionality  # 删除本地分支
git push origin --delete feature/new-functionality  # 删除远程分支
```

### Git Flow

Git Flow 是一种 Git 工作流程，包含长期分支（main 和 develop）以及短期分支（feature、release、hotfix）。

## 提交规范

良好的提交信息有助于理解项目历史和协作开发。

### 提交信息格式

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### 类型说明

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整，不影响逻辑
- `refactor`: 重构，既不是修复 bug 也不是添加功能
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动
- `perf`: 性能优化
- `ci`: CI 配置或脚本更新
- `build`: 构建相关
- `revert`: 撤销提交

### 示例

```
feat(auth): add JWT authentication module

- Implement login endpoint
- Add token verification middleware
- Create user session management
- Add logout functionality

Closes #123
```