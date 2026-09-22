# WSL Windows 开发环境搭建

*类型：practice ｜ 难度：入门 ｜ 标签：WSL、Windows、终端、Zsh、VS Code、Chocolatey*

**在 Windows 上搭建顺手的开发环境，主线只有一条：装 WSL 2 拿到真正的 Linux 内核 → Windows Terminal 当入口 → 配 Git/GitHub 凭据 → Zsh + OhMyZsh 美化 Shell → NVM 管 Node → VS Code 装 Remote-WSL 远程开发 → Chocolatey 管 Windows 软件。项目文件放 Linux 文件系统内，性能远好于跨系统访问。**

## 概述与先决条件

- 目标：在 Windows 上获得接近原生的 Linux 开发体验，各工具不深入展开、只覆盖搭建主线。
- 先决条件：
  - Windows 10 版本 2004 及更高版本 或 Windows 11。
  - 一个 GitHub 账户。

## WSL

设置 Windows 开发环境最重要的部分是安装 Windows Linux 子系统（WSL）。推荐使用 Ubuntu；一次安装多个发行版也没有问题。

### 安装 WSL 2

WSL 2 带有完整 Linux 内核和全系统调用兼容性。现在只需一条命令：

```bash
wsl --install
```

该命令会：

- 启用可选的 WSL 和虚拟机平台组件。
- 下载并安装最新的 Linux 内核。
- 将 WSL 2 设置为默认值。
- 下载并安装 Ubuntu 发行版（可能需要重启）。

`--install` 默认安装 Ubuntu，且仅在尚未安装 WSL 时有效；要换发行版参考微软官方文档。

### 用户配置

安装完成后从开始菜单打开发行版，按提示创建用户名和密码（输入密码时终端不显示任何内容，键盘仍在工作，这是安全功能）：

- 该用户名密码只属于这个发行版，与 Windows 账户无关。
- 创建后该账户成为默认用户，启动时自动登录。
- 此账户可运行 sudo 管理命令，视作 Linux 管理员。
- 每个发行版各自维护用户账户；重新安装或重置都要重新配置。

### 更新 Linux

Windows 不会自动更新发行版内的软件包，需定期手动执行：

```bash
sudo apt update && sudo apt upgrade
```

### 映射 Linux 驱动器

在文件资源管理器地址栏打开 `\\wsl$\` 位置，右键 Ubuntu 文件夹选择「映射网络驱动器」，选一个驱动器号并保持「登录时重新连接」勾选，完成后 Ubuntu 文件系统会出现在资源管理器中，可拖放/复制文件。

反向访问：Linux 终端里 Windows 文件在 `/mnt/` 下，Windows 用户目录位于 `/mnt/c/Users/username`。

- 建议把项目文件放在 Linux 文件系统内：从 Windows 侧跨系统访问速度慢且易出错。
- 技巧：在 Ubuntu 用户目录建一个 `code` 目录，拖到资源管理器左侧「快速访问」，方便 Windows 与 Linux 间传文件。

### 重启 WSL

WSL 停止工作时，在 PowerShell/命令提示符执行：

```bash
wsl.exe --shutdown
wsl.exe
```

## Windows 终端

开始菜单的 Ubuntu 图标或 `wsl`/`bash` 命令都能进 Linux，但 Windows Terminal 提供标签页、分屏、主题、透明度与键绑定，体验更好。

- 安装：Windows 11 自带；Windows 10 从微软商店下载。

### 默认配置文件

让终端启动直接进 WSL：设置 → 启动 → 默认配置文件选 Ubuntu，同时把默认终端应用程序设为 Windows 终端。

### 开始目录

默认 Ubuntu 配置文件打开在根目录，改为打开主目录：

1. 设置 → 配置文件 → Ubuntu → 常规 → 「起始目录」填入 `\\wsl$\Ubuntu\home\用户名`。
2. 取消勾选「使用父进程目录」。
3. 若仍打开 `/`，把「命令行」改为 `wsl.exe -d Ubuntu`。

## Git 配置

Git 一般已预装在 WSL 发行版中，确保最新：

```bash
sudo apt install git
```

三项基础配置：

```bash
git config --global user.name "Your Name"
git config --global user.email "youremail@domain.com"
git config --global user.username "GitHub username"
```

注意 `user.username` 与 `user.name` 是两个配置项，写错会覆盖姓名导致无法同步 GitHub 账户。检查任意配置：`git config --global user.name`。

## GitHub 凭据

### 个人访问令牌

GitHub 已移除命令行使用密码的能力，需创建个人访问令牌（PAT）代替密码做 HTTPS 认证，按 GitHub 文档的步骤生成。

### Git 凭据管理器

令牌首次输入后可交给 Git 凭据管理器（GCM）存储，免去重复认证。「适用于 Windows 的 Git」自带 GCM，是推荐的安装方式；也可下载 GCM 独立安装包。

安装后在 WSL 终端设置使用 Windows 侧的 GCM：

```bash
git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/libexec/git-core/git-credential-manager-core.exe"
```

## Zsh 与 OhMyZsh

Zsh 用法与 Bash 几乎一致，优势在插件、主题、拼写更正等扩展能力。

### 安装与启用

```bash
sudo apt install zsh
```

输入 `zsh` 首次运行会进入配置向导，选 0 创建空配置文件即可（后面交给 OhMyZsh）。

### 安装 OhMyZsh

先确保有 cURL（`sudo apt install curl`），再执行安装脚本：

```bash
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

装完后主目录出现 `.oh-my-zsh` 目录，改插件与主题编辑 `~/.zshrc`。

### 常用插件

- zsh-autosuggestions：根据历史与补全在键入时灰色建议命令。

```bash
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

- zsh-syntax-highlighting：命令实时语法高亮，输错在回车前就能看出。

```bash
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

在 `~/.zshrc` 中启用后重开终端生效：

```bash
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
```

## Node.js（NVM 管理）

不同项目需要不同 Node 版本，用 Node Version Manager 切换：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
# 验证：command -v nvm 应输出 nvm；若无输出，重开终端再试

nvm ls              # 查看已装版本
nvm install --lts   # 安装 LTS 版本（生产推荐）
nvm install node    # 安装最新版（尝鲜，稳定性略低）

node --version      # 验证 node
npm --version       # 验证 npm
```

切换版本：

```bash
nvm use node    # 切到最新版
nvm use --lts   # 切到 LTS 版
nvm use v8.2.1  # 切到指定版本
nvm ls-remote   # 列出所有可安装版本
```

## VS Code

### 安装与远程扩展

- 下载安装稳定版 VS Code（Windows 侧）。
- 安装 Remote-WSL 扩展：以 WSL 作为集成开发环境，自动处理兼容性与路径；同时提供 `code` 命令，可从 WSL 终端直接打开项目：

```bash
cd my-project
code .
```

- 默认 Shell 切为 zsh：`Ctrl + Shift + P` 打开命令面板，选择「终端：选择默认配置文件」→ zsh。
- 注意：Remote-WSL 场景下扩展需要装在 WSL 端，本地已装的扩展不会自动可用。

### 常用扩展

- Live Server：本地开发服务器，静态页实时重载。
- GitLens：查看每行代码是谁、何时、为何改动。
- Prettier / ESLint：格式化与代码检查。
- Docker：容器应用的创建、管理与调试。
- Markdown All in One / markdownlint：Markdown 编辑与检查。

## Chocolatey

Chocolatey 是 Windows 上的包管理器（类似 macOS 的 Homebrew），所有 `choco` 命令都必须在**管理员** PowerShell 中执行。

### 安装

1. 打开管理员 PowerShell（开始菜单右键 → 终端(管理员)，或搜索 powershell 后选「以管理员身份运行」）。
2. 运行 `Get-ExecutionPolicy`，若返回 `Restricted`，执行 `Set-ExecutionPolicy AllSigned` 或 `Set-ExecutionPolicy Bypass -Scope Process`。

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

3. 执行完无报错即安装成功，`choco -?` 查看用法。

### 基本命令

```powershell
choco install filename    # 安装
choco uninstall filename  # 卸载
choco list                # 列出已安装包
choco upgrade filename    # 更新单个包
choco upgrade all         # 更新全部
```

### 批量安装常用应用

```powershell
choco install wox runjs responsively zeal figma drawio github-desktop postman notion powertoys -y
```

## Chrome 扩展

以下扩展在 Firefox 中也都有对应版本。

- React DevTools：在 Chrome 开发者工具中加入 React 调试面板。
- ColorZilla：高级吸管、颜色选择器、渐变生成器。
- Axe Accessibility：面向开发、测试与设计的网页可访问性检查器。
- daily.dev：个性化的热门开发者新闻提要。
- Nimbus Capture：截取完整网页或任意区域。
- WhatFont：鼠标悬停即可检查网页字体。
- JSON Formatter：让 JSON 响应易于阅读。

## VetsWhoCode Web App

以 VetsWhoCode 的开源应用为例，走一遍「克隆开源项目到本地跑起来」的完整流程，也是为该组织做开源贡献的第一步。

```bash
# 1. 克隆仓库
git clone https://github.com/Vets-Who-Code/vets-who-code-app.git
cd vets-who-code-app

# 2. 按项目声明的版本安装 Node.js
nvm install

# 3. 安装依赖（React、Next、Bootstrap 等，需要几分钟）
npm install

# 4. 创建本地环境变量（连接 Contentful API 的密钥从这里配置；
#    默认的 .env 使用模拟数据，本地跑博客无需真实密钥）
cp .env.example .env

# 5. 启动开发服务器
npm run dev
```

- 启动后访问 `http://localhost:3000/` 查看应用；`Ctrl + C` 关闭开发服务器。
- `npm install` 会输出大量警告与消息，属于正常现象。

## 其他环境

JavaScript 与 Web 开发之外，各语言/工具在 WSL 上的官方搭建指南（本笔记不展开，按需查阅）：

- Python：在 Windows 上使用 Python 进行 Web 开发（WSL 版）——参见微软文档 `docs.microsoft.com/windows/python/web-frameworks`。
- R：在 Windows WSL2 中使用 RStudio Server——参见 RStudio 官方支持文章。
- PHP 7：在 WSL 2 上安装和配置 LAMP（Apache + MySQL + PHP）Web 服务器。
- PHP 8：面向 Laravel 开发的 Windows PHP8 + WSL2 环境设置。
- 数据库：在 WSL 中安装并连接 MySQL、PostgreSQL、MongoDB、Redis、SQL Server、SQLite——参见微软文档 `docs.microsoft.com/windows/wsl/tutorials/wsl-database`。

## 注意事项

- 项目代码放 Linux 文件系统（如 `~/code`），跨系统访问 `mnt/c` 慢且易出权限问题。
- WSL 发行版的账户密码与 Windows 账户完全独立，忘了可重置。
- Chocolatey 必须用管理员 Shell，普通终端执行 `choco` 会报权限错误。
- VS Code 扩展分「本地」与「WSL 端」两套，WSL 里缺扩展先检查是否装到了 WSL 端。
