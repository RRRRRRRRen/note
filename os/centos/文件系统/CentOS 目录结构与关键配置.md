# CentOS 目录结构与关键配置

*类型：knowledge ｜ 难度：入门 ｜ 标签：CentOS、文件系统、FHS、目录结构、配置文件*

**CentOS 7 的目录结构遵循 Linux 文件系统层次结构标准（FHS），一切从根 `/` 出发：`/etc` 放配置、`/var` 放日志等可变数据、`/home` 与 `/root` 分属普通用户和 root、`/usr` 放系统软件而 `/usr/local` 放手动安装的软件。记住「配置在 etc、数据在 var、日志在 var/log」这三条，就能定位绝大多数系统文件。**

## 核心系统目录

| 目录 | 用途 |
| --- | --- |
| `/`（根目录） | 整个文件系统的起点，所有其他目录挂载在其下 |
| `/bin` | 基础用户命令（如 `ls`、`cp`、`bash`），所有用户可用 |
| `/sbin` | 系统管理命令（如 `fdisk`、`iptables`），通常需 root 权限 |
| `/boot` | 内核文件（`vmlinuz`）、引导加载器（GRUB）与初始化内存盘（`initramfs`） |
| `/dev` | 设备文件（如 `/dev/sda` 代表磁盘，`/dev/tty` 代表终端） |
| `/etc` | 系统配置文件（如 `/etc/passwd`、`/etc/fstab`） |
| `/lib` 与 `/lib64` | 系统共享库文件（32 位库在 `/lib`，64 位在 `/lib64`） |
| `/proc` | 虚拟文件系统，实时反映内核和进程信息（如 `/proc/cpuinfo`） |
| `/sys` | 虚拟文件系统，用于与内核交互（如管理硬件设备） |
| `/run` | 运行时数据（如 PID 文件、锁文件），重启后清空 |

## 用户与数据目录

| 目录 | 用途 |
| --- | --- |
| `/home` | 普通用户的家目录（如 `/home/username`），存储个人文件 |
| `/root` | 超级用户 root 的家目录，与普通用户的 `/home` 分离 |
| `/var` | 可变数据文件（日志 `/var/log`、邮件 `/var/mail`、数据库 `/var/lib`） |
| `/tmp` | 临时文件，所有用户可读写（默认重启后清空） |
| `/usr` | 用户程序与只读数据：`/usr/bin` 用户命令、`/usr/sbin` 管理命令、`/usr/lib` 库文件、`/usr/local` 手动安装的软件（优先级高于系统自带） |

## 系统运行与存储目录

| 目录 | 用途 |
| --- | --- |
| `/opt` | 第三方大型软件的安装目录（如 Oracle、VMware） |
| `/srv` | 服务数据（如 Web 的 `/srv/www`、FTP 的 `/srv/ftp`） |
| `/mnt` 与 `/media` | 临时挂载点：`/mnt` 手动挂载设备，`/media` 自动挂载可移动设备（如 U 盘） |

## 特殊目录

| 目录 | 用途 |
| --- | --- |
| `/lost+found` | 文件系统修复时恢复的碎片文件（每个磁盘分区下都有） |
| `/selinux` | SELinux 安全子系统的配置文件 |

## CentOS 7 特有目录

| 目录 | 用途 |
| --- | --- |
| `/etc/sysconfig` | 系统服务配置（如网卡 `/etc/sysconfig/network-scripts/ifcfg-eth0`） |
| `/var/log` | 系统日志：`messages` 常规日志、`secure` 安全日志（SSH 登录记录）、`boot.log` 启动日志 |

## 关键配置文件

- 用户管理：`/etc/passwd`（用户信息）、`/etc/shadow`（密码哈希）、`/etc/group`（用户组）。
- 网络配置：`/etc/sysconfig/network-scripts/ifcfg-eth0`（网卡配置）。
- 启动服务：`/etc/systemd/system/`（systemd 服务单元文件）。

## 目录结构示意

```text
/
├── bin    # 基础命令
├── boot   # 内核与引导
├── dev    # 设备文件
├── etc    # 配置文件
├── home   # 用户数据
├── lib    # 系统库
├── mnt    # 临时挂载
├── opt    # 第三方软件
├── root   # root用户家目录
├── sbin   # 系统命令
├── tmp    # 临时文件
├── usr    # 用户程序
└── var    # 可变数据（日志、数据库）
```

## 常见问题

- `/usr` 与 `/usr/local` 的区别：`/usr` 放系统自带软件（如 YUM 安装的包）；`/usr/local` 放用户手动编译安装的软件（优先级更高）。
- 日志文件在哪里：主要在 `/var/log/`，用 `journalctl` 或 `tail -f /var/log/messages` 查看。
- 查看目录大小：

```bash
du -sh /var  # 查看 /var 目录大小
df -h        # 查看磁盘整体使用情况
```
