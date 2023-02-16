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

只拉取远程分支的更改，但是不合并到本地

**命令**

```shell
# 获取远程分支修改的内容
git fetch 
```











## 如何将本地的项目托管到github

### 1、配置git

```bash
git config --global user.name rrrrrrrren
git config --global user.email dittorenard@outlook.com
```

### 2、生成密钥

```bash
ssh-keygen -t rsa -b 4096 -C "dittorenard@outlook.com"
```

公钥位置： `C:\Users\任国强\.ssh\id_rsa`

密钥位置： `C:\Users\任国强\.ssh\id_rsa\id_rsa.pub`

### 3、注册密钥

进入github设置页面：[Add new SSH keys (github.com)](https://github.com/settings/ssh/new)

将密钥内容复制进输入框中，确认后即可生效。

### 4、初次提交

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



## 删除分支

查看所有分支

```bash
git branch -a
```

删除本地分支

```bash
git branch -d  local_branch_name
```

删除远程分支

```bash
 git push origin --delete origin_branch_name
```



## 挑选合并

用法

```shell
git cherry-pick [<options>] <commit-ish>...

常用options:
    --quit                退出当前的chery-pick序列
    --continue            继续当前的chery-pick序列
    --abort               取消当前的chery-pick序列，恢复当前分支
    -n, --no-commit       不自动提交
    -e, --edit            编辑提交信息
```






## 提交规范

```
feat 增加新功能
fix 修复问题/BUG
style 代码风格相关无影响运行结果的
perf 优化/性能提升
refactor 重构
revert 撤销修改
test 测试相关
docs 文档/注释
chore 依赖更新/脚手架配置修改等
workflow 工作流改进
ci 持续集成
types 类型定义文件更改
wip 开发中
```
