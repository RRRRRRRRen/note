# GIT使用指南

## 一、基本命令

### git stash

**简介**

用来临时保存不想提交的内容

**命令**

```shell
# 储存变更
git stash save 'xxx'

# 查看储存区所有的提交列表
git stash list

# 恢复最近一次的临时存储内容
git stash pop

# 删除指定的存储记录
git stash drop stash@{n}

# 删除所有的stash记录
git stash clear
```



### git clone

**简介**

用于克隆仓库

**命令**

```shell
# 克隆仓库到本地，默认停留到master分支
git clone xxx.git

# 克隆仓库到本地后，并切换到指定分支
git clone xxx.git -b branch_name
```



### git init

**简介**

初始化本地git仓库

**命令**

```shell
# 在当前文件夹创建一个git仓库
git init
```



### git remote

**简介**

用于和远程仓库绑定关系等操作

**命令**

```shell
# 添加远程仓库，设置远程仓库地址，并将其命名为origin
git remote add origin xxx.git

# 关联分支
git push -u origin master
```



### git branch

**简介**

用于查看分支

**命令**

```shell
# 查看本地分支
git branch

# 查看远程分支
git branch -r

# 查看本地和远程分支
git branch -a
```



### git checkout

**简介**

用于切换分支

**命令**

```shell
# 切换到指定分支
git checkout branch_name

# 切换到指定分支，如果分支不存在则直接创建
git checkout -b branch_name
```



### git add

**简介**

添加修改的文件到暂存区

**命令**

```shell
# 添加指定文件
git add file_name_1 file_name_2 ...

# 添加当前目录下所有修改的文件
git add .

# 添加当前仓库下所有修改的文件
git add -A
```



### git commit

**简介**

提交暂存区的文件到本地仓库

**命令**

```shell
# 提交并输入提交信息
git commit -m "xxx"
```



### git rm

**简介**

用于删除追踪的文件

**命令**

```shell
# 取消指定文件的追踪效果，类似强制ignore
git rm file_name

# 删除指定目录
git rm -r floder_name
```



### git push

**简介**

推送本地仓库到远程仓库

**命令**

```shell
# git push <远程主机名> <本地分支名>:<远程分支名>
git push origin locale_branch_name:remote_branch_name

# 本地分支名和远程分支名相同时可以省略远程分支名
git push origin branch_name

# 版本差异时强制推送本地版本
git push --force origin branch_name

# 删除远程分支
git push origin --delete remote_branch_name

# 本地新分支推送到远程，并建立联系
git push --set-upstream origin branch_name
```



### git pull

**简介**

获取远程分支的更新

**命令**

```shell
# 拉取指定远程分支合并到本地分支
git pull origin branch_name
```



### git fetch

**简介**

拉取远程分支的更新，但是不合并到本地，需要主动合并，获取更新后会返回一个FETCH_HEAD

**命令**

```shell
# 将远程主机的更新全部取回本地
git fetch origin

# 取回特定分支的更新
git fetch origin branch_name

# 合并fetch获取到修改
git merge origin/branch_name

# 查看FETCH_HEAD
git log -p FETCH_HEAD
```



### git merge

**简介**

用于合并fetch或者合并其他分支

**命令**

```shell
# 合并指定分支
git merge branch_name

# 取消合并
git merge --abort
```



### git log

**简介**

查看提交记录

**命令**

```shell
# 查看所有提交记录和id
git log
```



### git reflog

**简介**

查看所有提交记录，包括丢失的部分

**命令**

```shell
# 查看所有提交记录
git reflog
```



### git reset

**简介**

用于回撤版本

**命令**

```shell
# 回退到上一个版本
git reset HEAD^
# 回退到上上一个版本
git reset HEAD^^
# 回退到上n一个版本
git reset HEAD~n

# 回退后保留代码到工作区（add 前）
git reset --mixed HEAD^

# 回退后保留代码到暂存区（commit 前）
git reset --soft HEAD^

# 回退后丢弃代码
git reset --hard HEAD^
```



### git revert

**简介**

保留记录的回滚，不会让commit消失，而是产生一个新的commit

**命令**

```shell
# 回退到指定版本
git revert HEAD^
git revert commit_id
```



### git cherry-pick

**简介**

用于挑选指定提交，然后合并到当前分支上，会产生新的提交记录，且会拥有不同的commit_id

**命令**

```shell
# 获取指定commit_id
git cherry-pick commit_id

# 获取指定分支的最近一次提交
git cherry-pick branch_name

# 同时转移多个提交
git cherry-pick commit_id_1 commit_id_2 ...

# 转移连续的提交，要求1必须早于2，切不包含1
git cherry-pick commit_id_1..commit_id_2

# 包含首位的连续转移
git cherry-pick commit_id_1^..commit_id_2

# 解决相关冲突后继续合并，需要先git add
git cherry-pick --continue

# 冲突发生时放弃合并，回到之前的状态
git cherry-pick --abort

# 发生冲突时直接放弃，维持现状
git cherry-pick --quit
```



### git tag

**简介**

用来标记特定的版本

**命令**

```shell
# 快速创建一个tag
git tag tag_name

# 附注标签创建
git tag -a tag_name -m "xxx"

# 查看标签
git tag

# 推送标签到远程
git push origin tag_name

# 删除tag
git tag -d tag_name
```



### git rebase

**简介**

改建分支基点或者合并多次提交记录

**命令**

```shell
# 变基 (将当前分支的基点移到master到最新提交)
git rebase master

# 合并(合并当前分支的多次提交)
git rebase -i HEAD~n
```





## 二、经典案例

### 撤销与回滚

#### 撤销git add

```shell
# 以下命令等价
git reset
git reset HEAD
git reset --mixed HEAD
```



#### 撤销git commit

```shell
# 以下命令等价
git reset HEAD^
git reset --mixed HEAD^
```



#### 回滚到指定commit_id

```shell
# 查看需要回滚的commit_id
git log

# 直接回滚，丢弃当前未保存未提交的代码
git reset --hard commit_id
```



#### 回滚后再滚回来

```shell
# 获取回滚目标id
git log

# 执行回滚
git reset --hard commit_id

# 获取因回滚而丢失的id
git reflog

# 执行回滚
git reset --hard commit_id
```









### 本地的项目托管到远程

#### 1、配置git

```bash
git config --global user.name rrrrrrrren
git config --global user.email dittorenard@outlook.com
# 开启git颜色
git config --global color.ui true
```

#### 2、生成密钥

```bash
ssh-keygen -t rsa -b 4096 -C "dittorenard@outlook.com"
```

公钥位置： `C:\Users\任国强\.ssh\id_rsa`

密钥位置： `C:\Users\任国强\.ssh\id_rsa\id_rsa.pub`

#### 3、注册密钥

进入github设置页面：[Add new SSH keys (github.com)](https://github.com/settings/ssh/new)

将密钥内容复制进输入框中，确认后即可生效。

#### 4、初次提交

```bash
git init

git add .

git commit -m "first commit"

// 添加远程仓库并将其命名为origin
git remote add origin https://github.com/xxx/xxx.git

// 把当前仓库的 master 分支和远端仓库的 master 分支关联起来
git push -u origin master
```

如果在键入远程地址时出错，需要先删除远程地址再重新键入

```bash
git remote rem origin
git remote add origin https://github.com/xxx/xxx.git
git push -u origin master
```

切换http到ssh

```bash
git remote set-url origin git@github.com:RRRRRRRRen/what_for_dinner_frontend.git
git remote -v show // 查看当前源
```



### 删除分支

```bash
# 查看所有分支
git branch -a
```

```bash
# 删除本地分支
git branch -d  local_branch_name
# 删除远程分支
git push origin --delete origin_branch_name
```

```shell
# 删除本地tag
git tag -d tag_name
# 删除远程tag
git push origin --delete tag_name
```



### submodule

#### 添加子模块

```shell
# 添加子模块
git submodule add <git_repository_path> <submodule_path>
# git_repository_path: 子模块仓库地址
# submodule_path: 自定义子模块的文件夹与位置
```

#### 查看所有子模块

```shell
# 查看所有子模块
git submodule
```

#### 拉取子模块代码

```shell
# 拉取子模块
# 初始化子模块信息
git submodule init
# 拉取子模块代码
git submodule update

# 等同于
git submodule update --init --recursive
```

#### 克隆项目同时获取子模块代码

```shell
# 克隆项目同时获取
git clone <git_repository_path> --recursive
```

#### 删除子模块

```shell
# 1.取消子模块追踪
	git rm --cached <submodule_folder_path>
# 2.删除子模块文件
	rm -rf <submodule_folder_path>
# 3.删除子模块配置
	# 进入.gitmodules文件
	# 删除对应模块配置内容：例如
	# [submodule "assets"]
  # 	path = assets
  # 	url = https://github.com/maonx/vimwiki-assets.git
# 4.删除git模块配置
	# 进入.git/config文件
	# 删除对应模块配置内容：例如
	# [submodule "assets"]
  # 	url = https://github.com/maonx/vimwiki-assets.git
# 5.删除子模块追踪文件
	rm -rf .git/modules/<submodule_folder_path>
# 6.提交修改
	git add .
	git commit -m "message"
	git push
```







## 三、提交规范

### 规范提交信息

**1.安装`commitizen & cz-customizable`**

```shell
npm install -g commitizen cz-customizable
```



**2.配置自定义Adapter**

```shell
# 目录：根目录/.czrc
```

```json
{ "path": "cz-customizable" }
```



**3.自定义Adapter内容**

```shell
# 目录：根目录/.cz-config.js
```

```js
'use strict';

module.exports = {

  types: [
    {
      value: 'WIP',
      name : '💪  WIP:      Work in progress'
    },
    {
      value: 'feat',
      name : '✨  feat:     A new feature'
    },
    {
      value: 'fix',
      name : '🐞  fix:      A bug fix'
    },
    {
      value: 'refactor',
      name : '🛠  refactor: A code change that neither fixes a bug nor adds a feature'
    },
    {
      value: 'docs',
      name : '📚  docs:     Documentation only changes'
    },
    {
      value: 'test',
      name : '🏁  test:     Add missing tests or correcting existing tests'
    },
    {
      value: 'chore',
      name : '🗯  chore:    Changes that don\'t modify src or test files. Such as updating build tasks, package manager'
    },
    {
      value: 'style',
      name : '💅  style:    Code Style, Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)'
    },
    {
      value: 'revert',
      name : '⏪  revert:   Revert to a commit'
    }
  ],

  skipEmptyScopes: true,
  allowCustomScopes: false,
  allowBreakingChanges: ["feat", "fix"]
};
```



**4.提交规范前缀**

```shell
wip:			开发中
feat:			增加新功能
fix:			修复问题/BUG
refactor:	重构
docs:			文档/注释
test:			测试相关
chore:		依赖更新/脚手架配置修改等
style:		代码风格相关无影响运行结果的
revert:		撤销修改
```



## 四、其他配置

## [将 Visual Studio Code 用作编辑器](https://docs.github.com/zh/get-started/getting-started-with-git/associating-text-editors-with-git#将-visual-studio-code-用作编辑器)

```shell
git config --global core.editor "code --wait"
```
