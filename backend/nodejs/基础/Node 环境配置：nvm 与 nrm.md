# Node 环境配置：nvm 与 nrm

*类型：practice ｜ 难度：入门 ｜ 标签：nvm、nrm、Node、环境配置 ｜ 更新：2026-09-22*

**Node 环境三件套分工明确：nvm 管多版本安装与切换（配国内镜像下载不卡）；nrm 管 npm 包的下载源切换与测速；corepack 管项目级包管理器（pnpm / yarn），`corepack enable` 一条命令开启。**

## NVM：多版本管理

### 常用命令

```bash
nvm list                        # 显示已安装的版本列表
nvm alias default 20.11.0       # 设置默认版本
nvm install 20.11.0             # 安装指定版本
nvm uninstall 18.17.0           # 卸载指定版本
nvm use 20.11.0                 # 当前终端使用指定版本
```

### 场景：设置 node 国内下载镜像

nvm 下载 node 官方源在国内很慢，切到 npmmirror 镜像：

1. 清空缓存，避免旧下载残留干扰：

```bash
nvm cache clear
```

1. 在 `~/.zshrc` 中添加镜像环境变量：

```bash
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/
```

1. 重新载入终端配置使变量生效：

```bash
source ~/.zshrc
```

## NRM：npm 源管理

管理 npm 的 registry 源，安装 / 切换 / 测速一条龙：

```bash
nrm ls                          # 查看可用源（带当前源标记）
nrm use taobao                  # 切换到指定源
nrm test                        # 测试各源速度，辅助选源
nrm add myreg https://my.registry.com/   # 添加自定义源（私有仓库）
nrm del myreg                   # 删除自定义源
```

- `nrm test` 的结果只是参考，实际快慢以装包体验为准

## Corepack：包管理器托管

Node 自带的包管理器版本管理器，按项目 `package.json` 自动使用对应的 pnpm / yarn 版本：

```bash
corepack enable          # 开启托管 pnpm、yarn
corepack disable         # 关闭
corepack enable npm      # 需要时把 npm 也纳入托管
```

- 开启后 pnpm / yarn 不再需要全局安装，版本跟随项目声明，团队环境一致
