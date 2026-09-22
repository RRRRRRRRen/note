# 子模块、Worktree 与 Git Flow

*类型：practice ｜ 难度：入门 ｜ 标签：Git、submodule、worktree、Git Flow、多仓库、并行开发 ｜ 更新：2026-09-22*

**三者解决的都是「一个工作现场不够用」：子模块让一个仓库引用另一个仓库（主仓库只记录子仓库的路径与 commit 哈希）；worktree 让同一仓库同时检出多个分支到不同目录（共享 `.git` 数据库，省去反复 stash 切换）；Git Flow 则在时间维度上用长期分支加短期分支编排发布。子模块的提交记录是「固定到某个哈希」而非「跟随最新」——这是理解它一切坑的关键。**

## 子模块

主仓库通过 gitlink（一个指向子仓库特定 commit 的特殊条目）引用子仓库，克隆主仓库时子模块默认不会被拉取。

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

- 子模块记录的是**固定的 commit 哈希**，不是分支名：主仓库里更新子模块，需要进入子模块目录切到新提交，再在主仓库提交这个变化。
- 协作者 pull 主仓库后看到子模块目录为空（或旧版本），是正常现象——需要再执行 `git submodule update --init --recursive`。

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

## Git Flow

包含长期分支（`main`、`develop`）和短期分支（`feature`、`release`、`hotfix`）。相比功能分支工作流，它增加了集成分支与环境分支，适合发布周期明确的团队；小团队与持续部署场景用功能分支工作流更轻。

| 分支类型 | 生命周期 | 从哪切出 | 合入哪里 | 用途 |
| --- | --- | --- | --- | --- |
| `main` | 长期 | — | — | 每个提交都可发布，打版本标签 |
| `develop` | 长期 | main | main | 日常集成分支，功能在此汇合 |
| `feature/*` | 短期 | develop | develop | 单个功能的开发 |
| `release/*` | 短期 | develop | develop + main | 发布前测试与修复，版本号在此定稿 |
| `hotfix/*` | 短期 | main | main + develop | 线上紧急修复，双线合入防止丢失 |

## 延伸阅读

- 关联：《团队的提交历史要遵守什么规范？》——功能分支工作流四步循环，Git Flow 的轻量替代方案。
- 关联：《命令速查：初始化、日志与高级操作》——branch、tag 等本篇涉及的指针类命令速查。
