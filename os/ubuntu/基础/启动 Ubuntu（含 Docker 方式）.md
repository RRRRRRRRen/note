# 启动 Ubuntu（含 Docker 方式）

*类型：practice ｜ 难度：入门 ｜ 标签：Ubuntu、Docker、容器、docker run*

**用 Docker 跑 Ubuntu 是最快的体验方式：`docker run -t -i ubuntu /bin/bash` 一条命令拉镜像、建容器、进交互 Shell。容器退出后并不会消失，用 `docker ps -a` 找回、`docker start` 重启、`docker exec -it` 再进入，数据和状态都还在。**

## Docker 方式启动

### 拉取镜像

从 Docker Hub 拉取 Ubuntu 镜像到本地：

```bash
docker pull ubuntu
```

### 启动容器

基于镜像创建并启动容器，进入交互式 Shell：

```bash
docker run -t -i ubuntu /bin/bash
```

参数说明：

- `docker`：Docker 命令行客户端。
- `run`：创建并运行一个新容器。
- `-t`：为容器分配一个伪终端（TTY）。
- `-i`：保持标准输入（stdin）打开，使容器交互式运行。
- `ubuntu`：要运行的镜像名称。
- `/bin/bash`：容器内执行的命令，即 Bash Shell。

执行效果：

1. 从本地镜像库查找 Ubuntu 镜像（没有则自动从 Docker Hub 拉取）。
2. 创建一个新的容器实例。
3. 在容器内启动交互式 Bash Shell。
4. 进入容器的 Shell，可像在 Ubuntu 系统中一样执行命令。

## 容器重启与重新进入

容器退出后处于停止状态，但仍保留着，三步找回：

1. 找到容器 ID 或名称：

```bash
docker ps -a
# 列出所有容器（含已停止的），找到目标容器的 ID 或名称
```

2. 启动已停止的容器：

```bash
docker start abc123
# 或者
docker start mycontainer
```

3. 重新进入容器的交互式 Shell：

```bash
docker exec -it abc123 /bin/bash
# 或者
docker exec -it mycontainer /bin/bash
```

### 完整示例

假设之前运行的容器名为 `myubuntu`：

```text
$ docker ps -a
CONTAINER ID   IMAGE     COMMAND       CREATED        STATUS                      NAMES
abc123def456   ubuntu    "/bin/bash"   10 minutes ago Exited (0) 5 minutes ago    myubuntu

$ docker start myubuntu

$ docker exec -it myubuntu /bin/bash
```

命令含义：

- `docker ps -a`：列出所有容器，包括已停止的容器。
- `docker start <容器ID或名称>`：启动已停止的容器。
- `docker exec -it <容器ID或名称> /bin/bash`：在运行中的容器内执行命令，进入交互式 Bash Shell。

## 常见误区

- 容器 `exit` 退出后以为数据丢了：容器默认保留，`start` + `exec` 即可回来；只有 `docker rm` 才会删除。
- 用 `docker run` 重复启动：`run` 每次都新建容器，已存在的容器应使用 `start`。
- `exec` 用于已停止的容器会报错：必须先 `start` 再 `exec`。
