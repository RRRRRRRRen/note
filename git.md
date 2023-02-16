# GIT使用指南



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
git remote add origin https://github.com/xxx/xxx.git
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



## 临时存储

上面也有初步介绍这个命令的用法，就是用来临时存一下不想被提交的代码变更的，常用命令如下：

- `git stash save 'xxx'`: 储存变更
- `git stash list`: 查看储存区所有提交列表
- `git stash pop`: 弹出并应用最近的一次储存区的代码提交
- `git stash drop stash@{n}`: 删除某次储存记录
- `git stash clear`: 清楚所有 stash 信息

它的数据将被存在你仓库 .git 文件下的 refs/stash 里。





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
