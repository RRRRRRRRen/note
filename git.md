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

