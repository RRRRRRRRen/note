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

