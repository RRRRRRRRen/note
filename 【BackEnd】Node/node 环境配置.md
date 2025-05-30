# NVM

## 一、常用命令

```shell
# 显示已安装的列表。
nvm list

# 设置默认版本
nvm alias default [version]

# 安装/卸载node
nvm install <version>
nvm uninstall <version>

# 使用指定版本node
nvm use [version]
```

## 二、常用场景案例

### 1. 设置 node 国内下载镜像

**步骤一：清空缓存**

```shell
nvm cache clear
```

**步骤二 ：配置修改**

```shell
# ~/.zshrc 中添加
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/
```

**步骤三：重新载入终端配置**

```shell
source ~/.zshrc
```

# NRM

## 一、常用命令

```shell
# 查看可用源
nrm ls

# 切换源
nrm use

# 测试源速度
nrm test

# 添加自定义源
nrm add <自定义名称> <地址>

# 删除自定义源
nrm del <自定义名称>
```

# Corepack

## 一、常用场景案例

### 1. 开启 corepack 管理 pnpm、yarn

```shell
# 开启
corepack enable

# 关闭
corepack disable
```

### 2. 添加管理 npm

```
corepack enable npm
```
