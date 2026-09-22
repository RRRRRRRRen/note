# Linux 基础操作速查

*类型：practice ｜ 难度：入门 ｜ 标签：Linux、CentOS、Ubuntu*

**给已会用 Linux 的人的 CentOS/Ubuntu 差异与易错点速查：apt 与 yum 命令一一对应；用户管理最大差异是 Ubuntu 的 `useradd` 默认不建家目录而 CentOS 会建、管理员组 Ubuntu 用 `sudo` 组而 CentOS 用 `wheel` 组；通用易错点集中在 `rm -rf` 无回收站、`su` 与 `su -` 的环境差异、`shutdown` 可预约可取消。**

## 终端会话与快捷键

提示符一行四个信息：`root@host:~#` = 用户名@主机名:目录（`~` 是家目录，root 家目录为 `/root`），`#` 为 root、`$` 为普通用户。

```bash
whoami        # 当前用户名
hostname      # 主机名
```

```text
Tab          补全命令/路径
Ctrl + R     历史命令搜索（history 列全部，!2 执行编号 2 的命令）
Ctrl + A/E   光标跳行首/行尾
Ctrl + U/K   从光标剪切到行首/行尾；Ctrl + W 剪切左侧单词；Ctrl + Y 粘贴
Ctrl + L     清屏；Ctrl + C 中止当前命令；Ctrl + D 关闭会话
```

## 文件与目录操作

```bash
pwd; which ls       # 当前目录 / 命令真实路径
ls -alht            # 全部 + 详细 + 人类可读大小 + 按修改时间排序
cd -                # 回到上一个目录（cd 不带参数回家目录）
du -sh dir/         # 只看总计大小
cat -n file         # 带行号输出
less app.log        # 分页：空格/b 翻页，/ 搜索（n 下一个 N 上一个），q 退出
tail -f -s 4 app.log  # 持续追踪日志，每 4 秒检查一次
```

目录职责速记：`etc` 配置、`var` 可变数据（日志在 `/var/log`）、`home` 用户目录、`opt` 附加软件、`tmp` 重启即清、`proc`/`sys` 虚拟文件系统（如 `/proc/cpuinfo`）。

```bash
mkdir -p one/two/three   # 递归建目录
cp -rp src dst           # 递归复制并保留权限/时间戳；cp 默认直接覆盖目标
rm -rf dir/              # 无回收站，删除前先 pwd 核对路径
ln -s target link        # 软链接指向路径，原文件删除即失效
ln target link           # 硬链接指向实体，所有硬链接删除后文件才真正删除
```

## 查找文件

```bash
updatedb && locate '*.conf'    # locate 查数据库而非磁盘，新文件先 updatedb 才搜得到
find /var/log -name "*.log"    # 按名；-size +10M 按大小；-atime -7 按访问时间
find . -name "file" -type f    # 只查文件（-type d 只查目录）
find . -name "*.c" -exec chmod 600 {} \;   # {} 是结果占位符，\; 是必须的结尾
find . -name "*.c" -ok chmod 600 {} \;     # 同上但每条操作前确认
find . -name "*.jpg" -delete   # 无提示直接删，慎用
```

## 文件权限与归属

权限三元组：所有者 u / 群组 g / 其他 o，换算 r=4、w=2、x=1。

```bash
ls -l                  # drwxr-xr-x：d 目录、l 链接、- 普通文件
chmod 640 file         # rw- r-- ---
chmod -R u+rx dir/     # 递归生效；chmod +x file 是所有用户加执行
chown -R user:group dir/   # 递归改归属，chgrp 只改组
groups user            # 查用户所在组
usermod -aG wheel user # 追加附加组；-G 单用会把用户移出原组，务必带 -a
```

差异点：把用户加入管理员组时，Ubuntu 加 `sudo` 组，CentOS 加 `wheel` 组。

## 用户管理：useradd / passwd / userdel / id

```bash
sudo useradd -m -s /bin/bash -G wheel newuser  # 建家目录 + 指定 shell + 加附加组
sudo passwd newuser     # useradd 后必须设密码才能登录
sudo passwd -e newuser  # 强制下次登录改密；-l/-u 锁定/解锁密码
sudo userdel -r olduser # -r 才会删家目录，默认只删账户记录
id newuser              # 核对 UID/GID 与附加组；id -Gn 直接看组名
```

易错点：

- Ubuntu 的 `useradd` 默认不建家目录（要 `-m`），`adduser` 才是交互式一步到位；CentOS 的 `useradd` 默认就建家目录。
- `userdel` 默认遗留家目录和邮箱文件；遗留文件归原 UID 所有，之后新建用户可能意外继承，需 `chown` 转移或手动清理。
- `usermod -l` 只改用户名，`/home` 下的目录名不会跟着变。
- 密码强度策略由 PAM 控制：`/etc/login.defs` 设默认值，Ubuntu 的 PAM 配置在 `/etc/pam.d/common-password`。

## su / sudo / exit

```bash
su -            # 切 root 并加载其环境；不带 - 只换身份，常见「切了 root 却找不到命令」
su -c "cmd"     # 以 root 执行单条命令后回到原会话
sudo cmd        # 输自己的密码执行单条命令
exit [n]        # 退出当前 shell：0 正常，非 0 出错；嵌套 shell 逐层退出
```

| 功能 | `su` | `sudo` |
| --- | --- | --- |
| 密码 | 输目标用户密码 | 输自己的密码 |
| 环境 | 需 `su -` 才加载目标环境 | 自动加载 |
| 日志 | 无 | 逐条记录可审计 |
| 实践 | 应急排查 | 日常首选 |

`logout` 只能退出登录 shell，在非登录 shell 中会报错；`exit` 全场景通用。脚本中用 `exit 1` 返回错误码、`exit 0` 表示成功。

## 包管理：apt 与 yum 对照

模型一致：软件包集中放在仓库，包管理器负责安装与更新。Debian 系 `.deb` + `apt`，Red Hat 系 `.rpm` + `yum`。

```bash
apt update            # yum: makecache，刷新本地包索引，换源后必须执行
apt install -y xxx    # yum: install -y xxx
apt remove xxx        # yum: remove xxx
apt search xxx        # yum: search xxx
```

换源（云服务器一般已配好服务商源，无需再换；动手前先备份）：

```bash
## CentOS：备份 repo 文件，替换为镜像源，再刷缓存
mv /etc/yum.repos.d/CentOS-Base.repo{,.bak}
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
yum makecache
```

Ubuntu 的源文件在 `/etc/apt/sources.list`，改完执行 `apt update` 生效。

## 关机、重启与计划任务

```bash
sudo shutdown -h now       # -h 立即关机
sudo shutdown -r +15       # -r 重启，+15 表示 15 分钟后
sudo shutdown -h 23:30 "系统将在 23:30 关闭，请保存工作"   # 定时 + 广播给所有在线用户
sudo shutdown -c           # 取消已计划的关机
```

关键认知：关机可「预约并反悔」，生产环境先广播再关机是标准操作。

## 用 Docker 快速跑一个 Ubuntu

```bash
docker run -t -i ubuntu /bin/bash   # 拉镜像 + 建容器 + 进交互 Shell
docker ps -a                        # 列出含已停止的容器，找回 ID/名称
docker start myubuntu               # 启动已退出的容器
docker exec -it myubuntu /bin/bash  # 重新进入，必须先 start
```

易错点：容器 `exit` 后默认保留，只有 `docker rm` 才删除；`docker run` 每次都新建容器，已有容器应用 `start`；对已停止的容器 `exec` 会报错。
