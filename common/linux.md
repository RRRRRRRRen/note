## 启动 ubuntu

### docker 启动

#### 拉取镜像

> 用于从 Docker Hub 拉取 Ubuntu 镜像到本地系统。

```shell
docker pull ubuntu
```

#### 启动容器

> 用于基于拉取的 Ubuntu 镜像创建并启动一个新的容器，并在该容器中运行 /bin/bash 交互式 Shell。

```shell
docker docker run -t -i ubuntu /bin/bash
```

**详细说明**

• **docker**：这是 Docker 的命令行客户端。

• **run**：这是 Docker 客户端的一个子命令，用于创建并运行一个新的容器。

• **-t**：这个选项为容器分配一个伪终端（TTY）。

• **-i**：这个选项使容器保持交互式运行状态，保持标准输入（stdin）打开。

• **ubuntu**：这是要运行的镜像名称，在这里指的是 Ubuntu 镜像。

• **/bin/bash**：这是在容器内要执行的命令，这里指的是 Bash Shell。

**执行效果**Ï

1.  从本地 Docker 镜像库中查找 Ubuntu 镜像（如果没有，会尝试从 Docker Hub 拉取）。

2.  创建一个新的容器实例。

3.  在该容器内启动一个交互式的 Bash Shell。

4.  你将进入容器的 Bash Shell，能够在其中执行命令，就像在 Ubuntu 系统中一样。

### docker 容器重启

#### 步骤

1. **找到容器 ID 或名称**：

   首先，列出所有容器，包括停止的容器，以找到你之前运行的容器的 ID 或名称。

   ```bash
   docker ps -a
   ```

   这条命令会显示所有容器的列表，包括运行中的和停止的容器。找到你之前运行的 Ubuntu 容器的 ID 或名称。

2. **启动停止的容器**：

   使用 `docker start` 命令来启动已经存在的容器。假设容器的 ID 是 `abc123` 或者名称是 `mycontainer`。

   ```bash
   docker start abc123
   # 或者
   docker start mycontainer
   ```

3. **重新进入容器**：

   启动容器后，你可以使用 `docker exec` 命令重新进入容器的交互式 Shell。

   ```bash
   docker exec -it abc123 /bin/bash
   # 或者
   docker exec -it mycontainer /bin/bash
   ```

#### 示例

假设你之前运行的容器名称是 `myubuntu`：

1. **列出所有容器**：

   ```bash
   $ docker ps -a
   CONTAINER ID   IMAGE     COMMAND       CREATED        STATUS                      NAMES
   abc123def456   ubuntu    "/bin/bash"   10 minutes ago Exited (0) 5 minutes ago    myubuntu
   ```

2. **启动停止的容器**：

   ```bash
   $ docker start myubuntu
   ```

3. **重新进入容器**：

   ```bash
   $ docker exec -it myubuntu /bin/bash
   ```

#### 解释

- **`docker ps -a`**：列出所有容器，包括已停止的容器。
- **`docker start <container_id_or_name>`**：启动已停止的容器。
- **`docker exec -it <container_id_or_name> /bin/bash`**：在正在运行的容器中执行命令，这里是进入交互式 Bash Shell。

## 终端操作基础

### 终端描述

```ini
root@b00363d8639e:~#
```

1. `root`：表示用户名；
2. `b00363d8639e`：表示主机名；
3. `~`：表示目前所在目录为家目录，其中 `root` 用户的家目录是 `/root` 普通用户的家目录在 `/home` 下；
4. `#`：指示你所具有的权限（ `root` 用户为 `#` ，普通用户为 `$` ）。

【查看当前用户名】

```bash
whoami
# root
```

【查看当前主机名】

```bash
hostname
# b00363d8639e
```

### 命令格式

```bash
command parameters（命令 参数）
```

### 参数写法

- **单个参数**：ls -a（a 是英文 all 的缩写，表示“全部”）
- **多个参数**：ls -al（全部文件 + 列表形式展示）
- **单个长参数**：ls --all
- **多个长参数**：ls --reverse --all
- **长短混合参数**：ls --all -l

### 参数值写法

- **短参数**：command -p 10（例如：ssh root@121.42.11.34 -p 22）
- **长参数**：command --paramters=10（例如：ssh root@121.42.11.34 --port=22）

### 快捷键

- 通过上下方向键 ↑ ↓ 来调取过往执行过的 `Linux` 命令；
- 命令或参数仅需输入前几位就可以用 `Tab` 键补全；
- `Ctrl + R` ：用于查找使用过的命令（`history` 命令用于列出之前使用过的所有命令，然后输入 `!` 命令加上编号( `!2` )就可以直接执行该历史命令）；
- `Ctrl + L`：清除屏幕并将当前行移到页面顶部；
- `Ctrl + C`：中止当前正在执行的命令；
- `Ctrl + U`：从光标位置剪切到行首；
- `Ctrl + K`：从光标位置剪切到行尾；
- `Ctrl + W`：剪切光标左侧的一个单词；
- `Ctrl + Y`：粘贴 `Ctrl + U | K | Y` 剪切的命令；
- `Ctrl + A`：光标跳到命令行的开头；
- `Ctrl + E`：光标跳到命令行的结尾；
- `Ctrl + D`：关闭 `Shell` 会话；

## 文件系统

### 系统文件目录结构

![文件目录](https://www.runoob.com/wp-content/uploads/2014/06/d0c50-linux2bfile2bsystem2bhierarchy.jpg)

```bash
$ ls -l
bin -> usr/bin
# binary缩写。bin 是一个符号链接，指向 /usr/bin 目录。通常包含基本用户命令的二进制文件，如 ls、cp 等。
boot
# 存储启动加载器和内核相关的文件，如 grub 配置文件和内核镜像。
dev
# 包含设备文件，用于访问系统设备，如硬盘、终端等。
etc
# 包含系统配置文件和脚本，如 passwd 文件、fstab 文件等。
home
# 包含所有用户的主目录，每个用户在这里都有一个子目录，用于存储个人文件和配置。
lib -> usr/lib
# library缩写。存储共享库文件，支持二进制文件的运行。
media
# 用于自动挂载的媒体设备（如光盘、USB 驱动器）。
mnt
# mount缩写。用于临时挂载文件系统，通常是手动挂载的设备。
opt
# optional application software package缩写。用于安装附加软件包，避免与系统默认软件包产生冲突。
proc
# 虚拟文件系统，包含系统进程和系统信息，如 /proc/cpuinfo。
root
# 系统管理员（root 用户）的主目录。
run
# 包含系统运行时数据，如进程 ID 文件和锁文件。
sbin -> usr/sbin
# system binary缩写。包含系统管理员命令的二进制文件，如 ifconfig、reboot。
srv
# service缩写。存储由系统提供的服务数据，如 Web 服务器数据。
sys
# 虚拟文件系统，提供设备和系统信息接口，主要用于内核和设备管理。
tmp
# temporary缩写。存储临时文件，系统和用户在此目录下创建的临时文件在系统重新启动后可能会被删除。
usr
# unix software resource缩写。包含用户级程序和数据，如应用程序和库文件。通常有子目录如 /usr/bin、/usr/lib 等。
var
# variable缩写。包含可变数据文件，如日志文件、邮件队列、打印队列和临时文件。常见子目录有 /var/log、/var/mail 和 /var/tmp。
```

### 查看目录

#### 查看当前工作目录

```bash
pwd
# /
```

#### 查看命令的可执行文件所在路径

```bash
which ls
# /usr/bin/ls
```

#### 查看文件及目录列表

```bash
ls
# bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
```

【常用参数】

- `-a` 显示所有文件和目录包括隐藏的
- `-l` 显示详细列表
- `-h` 适合人类阅读的
- `-t` 按文件最近一次修改时间排序
- `-i` 显示文件的 `inode` （ `inode` 是文件内容的标识）

### 切换目录

```bash
cd /
# 跳转到根目录
```

【常用写法】

- `cd /`：跳转到根目录
- `cd ~`：跳转到家目录
- `cd ..`：跳转到上级目录
- `cd ./home`：跳转到当前目录的 home 目录下
- `cd /home/lion`：跳转到根目录下的 home 目录下的 lion 目录
- `cd`：不添加任何参数，也是回到家目录

### 查看磁盘占用

#### 显示文件和目录的磁盘使用情况

```bash
du
# 递归显示当前目录下所有文件的大小
```

【常用参数】

- `-h` 适合人类阅读的；
- `-a` 同时列举出目录下文件的大小信息；
- `-s` 只显示总计大小，不显示具体信息。

### 查看文件内容

#### 全部查看

```bash
cat cloud-init.log
# 打印所有的文件内容
```

【常用参数】

- `-n` 显示行号。

#### 分页查看

```bash
less xxx.md
# 显示部分文件内容
```

【快捷操作】

- `空格`键：前进一页（一个屏幕）；
- `b` 键：后退一页；
- `回车`键：前进一行；
- `y` 键：后退一行；
- `上下`键：回退或前进一行；
- `d` 键：前进半页；
- `u` 键：后退半页；
- `q` 键：停止读取文件，中止 `less` 命令；
- `=` 键：显示当前页面的内容是文件中的第几行到第几行以及一些其它关于本页内容的详细信息；
- `h` 键：显示帮助文档；
- `/` 键：进入搜索模式后，按 `n` 键跳到一个符合项目，按 `N` 键跳到上一个符合项目，同时也可以输入正则表达式匹配。

#### 显示头部几行

```bash
head cloud-init.log
# 显示文件的开头几行（默认是10行）
```

【参数】

- `-n` 指定行数 `head cloud-init.log -n 2`

#### 显示末尾几行

```bash
tail cloud-init.log
# 显示文件的结尾几行（默认是10行）
```

【参数】

- `-n` 指定行数 `tail cloud-init.log -n 2`
- `-f` 会每过 1 秒检查下文件是否有更新内容，也可以用 `-s` 参数指定间隔时间 `tail -f -s 4 xxx.log`

### 操作文件与目录

#### 创建文件

```bash
touch new_file
# 在当前目录下创建一个文件
```

#### 创建目录

```bash
mkdir new_folder
# 在当前目录下创建一个目录
```

【常用参数】

- `-p` 递归的创建目录结构 `mkdir -p one/two/three`
