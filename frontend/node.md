# Node

## NVM

**命令**

```shell
# 显示node是运行在32位还是64位
nvm arch

# 显示已安装的列表。
nvm list

# 显示nvm版本
nvm version

# 显示当前node版本
nvm current

# 显示可下载版本的部分列表
nvm list available

# 设置默认版本
nvm alias default vx.x.x

# 安装/卸载node
nvm install <version> [arch]
nvm uninstall <version>

# 安装最新版本
nvm install latest

# 开启/关闭node.js版本管理
nvm on
nvm off

# 设置node/npm镜像
nvm node_mirror [url]
nvm npm_mirror [url]

# 设置存储不同版本node的目录
nvm root [path]

# 使用指定版本node
nvm use [version] [arch]
```

**设置国内镜像**

```shell
nvm node_mirror https://npm.taobao.org/mirrors/node/
nvm npm_mirror https://npm.taobao.org/mirrors/npm/
```

**报错处理**

```shell
# 错误
C:\Users\�ι�ǿ\AppData\Roaming\nvm could not be found or does not exist. Exiting.

# 解决
# 重新设置nvm根目录
nvm root C:\Users\任国强\AppData\Roaming\nvm
```



## NRM

**安装**：首先，需要在全局安装 nrm。在命令行中执行以下命令即可：

```shell
npm install -g nrm
```

**查看可用源**：你可以使用以下命令查看当前可用的源列表：

```shell
nrm ls
```

**切换源**：要切换到某个源，可以使用以下命令：

```shell
nrm use <源名称>
```

例如，要切换到 taobao 源，可以执行：

```shell
nrm use taobao
```

**测试源的速度**：你可以通过以下命令测试各个源的响应速度：

```shell
nrm test
```

**添加自定义源**：如果你有自定义的源，可以通过以下命令添加：

```shell
nrm add <源名称> <源地址>
```

例如，添加一个名为 myregistry 的自定义源：

```shell
nrm add myregistry http://myregistry.com/
```

**删除源**：如果要删除已添加的源，可以使用以下命令：

```shell
nrm del <源名称>
```



## NPM

**设置国内镜像**

```shell
# 设置淘宝镜像
npm config set registry https://registry.npm.taobao.org

# 查看当前镜像地址
npm config get registry
```

**使用cnpm**

```shell
npm install -g cnpm --registry=https://registry.npmmirror.com
```

