# 启动 ubuntu

## Docker 启动

### 拉取镜像

> 用于从 Docker Hub 拉取 Ubuntu 镜像到本地系统。

```shell
docker pull ubuntu
```

### 启动容器

> 用于基于拉取的 Ubuntu 镜像创建并启动一个新的容器，并在该容器中运行 /bin/bash 交互式 Shell。

```shell
docker run -t -i ubuntu /bin/bash
```

**详细说明**

- **docker**：这是 Docker 的命令行客户端。
- **run**：这是 Docker 客户端的一个子命令，用于创建并运行一个新的容器。
- **-t**：这个选项为容器分配一个伪终端（TTY）。
- **-i**：这个选项使容器保持交互式运行状态，保持标准输入（stdin）打开。
- **ubuntu**：这是要运行的镜像名称，在这里指的是 Ubuntu 镜像。
- **/bin/bash**：这是在容器内要执行的命令，这里指的是 Bash Shell。

**执行效果**

1. 从本地 Docker 镜像库中查找 Ubuntu 镜像（如果没有，会尝试从 Docker Hub 拉取）。
2. 创建一个新的容器实例。
3. 在该容器内启动一个交互式的 Bash Shell。
4. 你将进入容器的 Bash Shell，能够在其中执行命令，就像在 Ubuntu 系统中一样。

## Docker 容器重启

### 步骤

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

### 示例

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
