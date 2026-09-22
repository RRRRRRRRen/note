# brew 装的软件到底放在哪？

*类型：knowledge ｜ 难度：入门 ｜ 标签：Homebrew、包管理、macOS、依赖管理、CLI ｜ 更新：2026-09-10*

**brew 装的一切都在一个前缀目录下（Apple Silicon 是 `/opt/homebrew`）：真身在 `Cellar/<软件>/<版本>/`，`opt/<软件>` 是不带版本的稳定指路牌，`bin/` 下是命令入口的符号链接——`ls -l` 顺着链接就能看出当前生效的版本。围绕这个结构抓三条主线：渠道选对——CLI 工具归 brew、GUI 应用归 cask、语言运行时归版本管理器（nvm/fnm、uv、rustup）、语言包归语言自己的管理器；升级机制看懂——brew 从不覆盖旧版本，而是并排装入新目录、切链接，旧版本留给 `cleanup` 回收；问题会诊断——`type -a` / `which -a` 查清运行的到底是谁，动态链接的依赖断链用 `otool -L` 亲眼看。**

## 技术对照：就是 npm 的 macOS 版

如果写过前端，你已经会用 brew 了——它就是**系统级的 npm**：你报一个包名（`brew install wget`），它从 registry 拉包、解析并装好整棵依赖树。两本包清单：**formula** 收录命令行工具（≈ npm 包），**cask** 收录 GUI 应用（≈ 桌面安装器分发）；包源叫 **tap**（≈ registry）。

- **依赖** = 大多数工具不自带运行时，统一依赖系统共享库。共享库升级时，旧工具的编译产物可能对不上——这是后文一切版本故事的起点。
- **升级** = 永远是“新版本装进独立目录（Cellar），再把 bin 软链切过去”，旧版本先留着等 `cleanup`——和 node_modules 里共存多个版本、由 bin 链接决定用哪个是同一个思路。
- **边界** = 同一个工具既用 brew 又用官网 dmg 装了一遍，PATH 里谁在前就用谁——**一个工具只认一个安装渠道**，这条纪律贯穿全文。

## brew 是什么：把装软件变成一条命令

### 没有包管理器的世界

在 macOS 上手动装一个软件的完整流程是：搜索引擎找官网 → 辨别正版下载地址 → 下载 dmg 挂载、把图标拖进 Applications（或双击 pkg 一路下一步）→ 用完还得自己记得更新、卸载时自己清理残留。

这套流程有四个硬伤：**繁琐**（每个软件重复一遍）、**更新靠手动**（逐个官网检查版本）、**卸载不干净**（配置和缓存散落各处）、**来路不可控**（下载站捆绑安装包是重灾区）。

包管理器把这整件事固化成一条命令和一本账：`brew install wget` 装好、`brew upgrade` 全量更新、`brew uninstall` 干净移除。Linux 的 apt/dnf、JS 生态的 npm 都是同一个思想：集中登记 + 自动解析依赖，brew 是这个思想在 macOS 的实现。

### 三套货架：formula、cask 与 tap

brew 的世界由几类角色组成：formula 和 cask 是两类「配方」（都是 Ruby 脚本，描述去哪下载、怎么装）；tap 是存放配方的仓库，官方维护 core/cask 两个主仓库，任何人也能发布自己的 tap；bottle 是预编译好的二进制包——绝大多数安装直接用它，不在本地编译，所以才能秒装。

```text
生态拓扑 / homebrew ecosystem
            [tap 配方仓库（Ruby 脚本）]
             /                \
      收录配方            收录配方
          ▼                  ▼
[formula 命令行工具]   [cask GUI 应用]
      ▲    │                │
      │    │ install        │ install --cask
二进制分发  ▼                ▼
[bottle 预编译二进制]   [brew 命令入口]
      │
      │ 可注册为服务
      ▼
[services 后台服务]
```

日常只用记两个入口：`brew install wget` 装命令行工具，`brew install --cask google-chrome` 装 GUI 应用——cask 会自动下载 dmg、挂载、把应用拷进 /Applications，全程不用点鼠标。两者在 2019 年 Homebrew 2.0 之后合并进同一仓库，所以老教程里的 `brew cask install xxx` 写法已废弃。

### 看清自己装的 brew

两个命令就能看清自己机器上的 brew：`brew --version` 看版本，`brew config` 看完整环境。一台 Apple Silicon Mac 上的真实输出：

```bash
$ brew --version
Homebrew 6.0.20

$ brew config | grep -E "HOMEBREW_PREFIX|ORIGIN"
HOMEBREW_PREFIX: /opt/homebrew
ORIGIN: https://github.com/Homebrew/brew.git
```

`HOMEBREW_PREFIX` 是 brew 的「地盘」：Apple Silicon 机器是 `/opt/homebrew`（Intel 时代是 `/usr/local`），所有 brew 装的东西都在这个前缀下。安装时执行的 `eval "$(brew shellenv)"`，作用就是把 `/opt/homebrew/bin` 挂进 PATH——终端里能直接敲 brew 装的命令，靠的就是它。

Homebrew 4.0 起默认启用 **API 模式**：不再把完整 tap 仓库克隆到本地，而是拉取 JSON 格式的配方元数据。好处是 `brew update` 快很多、磁盘占用小；副作用是老教程里讲的「tap 的 git 目录结构」在新版机器上未必看得到。

## 依赖：软件为什么不是自包含的

### 静态与动态：两种打包哲学

一个常见误解是「软件是编译打包好的，自带完整运行能力」。这只对了一半——对应的是**静态链接**：编译期把所有库代码嵌进二进制，像 Docker 镜像把运行时整个打进镜像、产物单文件即可分发。而 C/C++ 生态的主流是**动态链接**：程序只记录「我需要哪些共享库」，运行时操作系统才去加载 .dylib 文件——类似多个项目共享同一份全局依赖，库升级一次全体生效。

用 macOS 自带的 `otool -L` 可以亲眼看到区别——同一台机器上的真实输出：

```bash
$ otool -L "$(which fzf)"
/opt/homebrew/bin/fzf:
	/usr/lib/libSystem.B.dylib (compatibility version 0.0.0, current version 0.0.0)
	/usr/lib/libresolv.9.dylib (compatibility version 0.0.0, current version 0.0.0)

$ otool -L "$(which ffmpeg)" | head -3
/opt/homebrew/bin/ffmpeg:
	/opt/homebrew/Cellar/ffmpeg/9.0.1_1/lib/libavdevice.63.dylib (compatibility version 63.0.0, ...)
	/opt/homebrew/Cellar/ffmpeg/9.0.1_1/lib/libavformat.63.dylib (compatibility version 63.0.0, ...)
```

fzf 是 Go 写的，只挂 macOS 系统基础库——全部家当自带，拷到哪台机器都能跑。ffmpeg 则明晃晃写着一串**精确到版本目录的 Cellar 路径**：运行时必须找到这些 dylib 才能启动，缺一个直接崩。注意路径里的 `9.0.1_1`——依赖记录连版本号都写死了，这就是后文一切「版本断链」故事的种子。

两种打包哲学 / linking：

| 静态链接（自包含） | 动态链接（共享库） |
| --- | --- |
| 所有库代码在编译期嵌进单个二进制（Docker 镜像式自包含） | 运行时才加载共享库 dylib（共享一份全局依赖） |
| 文件偏大，拷到哪台机器都能跑 | 二进制小，磁盘与内存共享一份库 |
| 永不缺依赖，不存在版本断链 | 库升一次级，所有用它的程序同时受益 |
| 库要升级必须重新编译整个程序 | 库版本断链即崩：Library not loaded |
| 典型：Go / Rust 产物，如 fzf | 典型：C/C++ 生态，如 ffmpeg |

依赖规模实测（brew deps 计数，仅供直觉）：ffmpeg（C 动态链接）14 个依赖；fzf（Go 静态编译）0 个依赖——在图上连一像素都分不到，这正是静态链接的含义：没有外部依赖需要 brew 记账。

### 共享的收益与代价

为什么 C/C++ 生态明知有坑还要选动态链接？两个硬收益：**省资源**——一百个程序共用一份 OpenSSL，磁盘只存一份、内存只加载一份；**统一修复**——OpenSSL 爆出漏洞时升级一份库，所有程序同时打好补丁。若各自静态打包，就要重发一百个软件。

代价则是对面那一条：运行环境必须「恰好」有那些库的对应版本，**依赖问题由此诞生**。brew 的角色正是解这道题的：formula 里的 `depends_on` 记账（=package.json 的 dependencies），安装时把整棵依赖树装进自己的前缀 `/opt/homebrew/opt`，完全不依赖随 macOS 版本漂移的系统库（=自带一份稳定运行时）。

这套模型和 npm 完全同构：`npm install react` 自动带上依赖树，没有人对此感到奇怪；brew 只是同一件事在系统层的重演。区别在于 JS 生态每个项目的 node_modules 自带一份依赖（隔离彻底、磁盘浪费），而 brew 全局共享一份（磁盘省、但有断链风险）——两种取舍，各有代价。

## 版本模型：升级不清旧，并排装新的

### Cellar：仓库与指路牌

brew 升级**从不原地覆盖**，而是把新版本装进一个新目录，与旧版本并排存在。升级刚发生后的典型状态：

```text
/opt/homebrew/
├── Cellar/xz/                      # 仓库：每个软件一个货架
│   ├── 5.6.2/                      # 旧箱子：留在磁盘上
│   └── 5.8.3/                      # 新箱子：当前真身
├── opt/xz -> ../Cellar/xz/5.8.3    # 指路牌：永远只指一个
└── bin/xz -> ../Cellar/xz/5.8.3/bin/xz   # 命令入口
```

三层结构各司其职：**Cellar/<软件>/<版本>** 是真身（多版本共存就靠目录隔离）；**opt/<软件>** 是不带版本的稳定路径（程序之间互相引用用它，不随版本变）；**bin/** 下的符号链接是终端里敲的命令入口。

真机验证——顺着符号链接就能看到命令的「真身」在哪个版本的箱子里：

```bash
$ ls -l /opt/homebrew/bin/ffmpeg
lrwxr-xr-x@ 1 ren admin 35 Aug 30 00:16 /opt/homebrew/bin/ffmpeg -> ../Cellar/ffmpeg/9.0.1_1/bin/ffmpeg
```

**记忆：升级 = 并排装新，不清旧**

- brew 升级一个软件时，旧版本目录原封不动地留在 Cellar 里，opt 指路牌改指新版本。
- 运行层面永远只有一个版本生效（链接决定），磁盘层面可以多版本并存（目录隔离）。
- 旧版本默认保留约 30 天，等 `brew cleanup` 回收。

### 一次 upgrade 的完整流转

把 `brew upgrade` 拆开看，每一步都对应上面的结构：

```text
upgrade 流转 / lifecycle
① 拉取元数据   —— brew update 刷新配方索引
② 计算依赖树   —— 比对新旧配方，得出装哪些
③ 下载 bottle  —— 预编译二进制，通常不本地编译
④ 装入新 keg   —— 解压到 Cellar/新版本，旧目录不动
⑤ 切换 opt 链接 —— 指路牌改指新版，bin/lib 跟着切
⑥ 旧 keg 留任  —— 还有软件依赖它，默认留约 30 天
⑦ cleanup 回收 —— 大扫除：删旧版本与下载缓存
```

为什么旧箱子不立刻扔？因为别的软件可能是对着旧版编译的（还记得 otool 输出里写死的版本路径吗），立刻删除会让它们当场起不来。保留旧版本是升级平滑的保险，代价是磁盘暂时膨胀——这个模型很像 git：升级 = 检出新 commit，旧对象还留在 .git 里，`brew cleanup` ≈ `git gc`。

### @版本 formula 与经典翻车

有些多版本需求是正式产品：`openssl@3`、`icu4c@77`、`python@3.13` 都是**名字里带版本的独立 formula**，设计上就允许共存——这和「同名 formula 的新旧 keg 并存」是两回事：前者是两个不同的包，后者是同一个包的两个历史版本。

理解了这一切，macOS 上的经典翻车报错就能逐字读懂了：

```bash
dyld: Library not loaded: /opt/homebrew/opt/icu4c/lib/libicuuc.76.dylib
Referenced from: /opt/homebrew/bin/node
Reason: image not found
```

逐字读一遍：node 的二进制里写死了「去 /opt/homebrew/opt/icu4c/lib/ 加载 libicuuc.76.dylib」，而依赖已经升到 77、76 的目录又被 cleanup 清掉了——动态链接器按记录的路径找不到文件，进程在启动阶段直接终止。修复两选一：`brew reinstall node`（首选，重新拿到对着新版依赖编译的版本），或 `brew install icu4c@76`（把旧版依赖目录补回来救急）。防翻车的习惯：大版本升级后顺手跑一遍 `brew outdated`，对报错的工具统一 reinstall。

## 渠道规范：一个软件只认一个渠道

### 决策清单

装任何软件前先问一句：它属于哪一层？口诀是**系统工具归 brew，GUI 归 cask，运行时归版本管理器，语言包归语言自己**。

渠道决策 / channel decision：

| 软件类型 | 安装渠道 | 典型例子 |
| --- | --- | --- |
| CLI 系统工具 | `brew install` | git、ripgrep、fd、jq、fzf、wget |
| GUI 应用 | `brew install --cask` | iterm2、google-chrome、visual-studio-code |
| 语言运行时 | 版本管理器 | node→nvm/fnm，python→uv/pyenv，rust→rustup，java→sdkman |
| 语言包 / 全局 CLI | 语言自己的管理器 | npm -g、uv tool install、cargo install |
| App Store 应用 | App Store / mas | 系统级应用，只此一渠道 |
| 冷门厂商软件 | 官网 dmg（先 brew search） | cask 未收录时才手动下载 |

两条判断依据：brew 只装「当前最新」一个版本，所以**需要多版本切换的运行时不适合**；语言包的依赖关系只有语言自己的管理器看得懂（npm 管不了 node_modules 之外的任何东西），所以**语言生态内部的事不外借 brew**。

### 为什么会乱：macOS 没有中央账本

Linux 用 apt/dnf 时很少出现「同一软件装了三份」——因为全系统只有一本账。macOS 不是：每个渠道各记各的账，互相不知情。brew 记在 `/opt/homebrew` 的收据里；dmg 拖拽安装没有任何人记账；pkg 安装包有 pkgutil 收据；curl | sh 脚本装到哪全看脚本心情（/usr/local/bin、~/.local/bin……）。

后果是真会发生的。一台真实机器上的输出：

```bash
$ which -a node
/Users/ren/.nvm/versions/node/v22.17.0/bin/node
/usr/local/bin/node
```

同一台机器上躺着两份 node：nvm 装的 v22，和一个历史遗留的 `/usr/local/bin/node`。终端里敲 `node` 执行谁，由 **PATH 里谁排在前面**决定（这台机器是 nvm 的）。版本错位、升级不生效、卸载留幽灵，根因几乎都在这。

治理三步：`type -a node` 找齐所有副本 → 决定保留哪个渠道 → 删掉其余并 `hash -r`。macOS 没有系统级强制互斥，这条纪律只能靠自己守。

**记忆：一个软件一个渠道**

- 发现重复安装时，用 `type -a` / `which -a` 列出全部副本，按渠道决策表确定唯一归属，删掉其余。
- 与其事后治理，不如装之前就问一句：这个软件归哪层管？

### 两个高频反模式

反例 vs 正例（渠道选择 / channel）：

反例——brew 只装「当前最新」一个版本，切版本等于重装；运行时和语言包混进 brew，升级卸载时两套账本互相踩：

```bash
brew install node        # brew 装运行时
npm install -g pnpm      # 全局包与 brew 账本混住
brew upgrade             # node 换版本，全局包不跟随
```

正例——一个软件一个渠道：brew、版本管理器、语言包管理器各管一层，互不越界：

```bash
brew install fnm         # brew 只装管理器本身
fnm install 22           # 运行时交给版本管理器
corepack enable pnpm     # 语言工具归语言自己管
```

反例 vs 正例（Python 工具安装 / pip vs uv tool）：

反例——污染全局 Python 环境；macOS 的系统 Python 受 PEP 668 保护，本来就禁止这样装：

```bash
pip3 install black       # 装进系统 Python
# 新版 macOS 直接拒绝：
# error: externally-managed-environment
```

正例——Python 生态的 CLI 工具用隔离安装（uv tool / pipx），项目依赖放进各自的 venv：

```bash
brew install uv          # 或 pipx
uv tool install black    # 隔离环境安装 CLI 工具
```

## 诊断命令：搞清楚运行的到底是谁

### 定位命令全家桶

五个命令覆盖「谁在运行」的全部疑问：`which -a` 列出 PATH 中所有同名命令（按命中顺序）；`type -a` 是更标准的选择，别名、函数、内建、外部文件全都暴露（which 的行为随 shell 而异，zsh 内建版能看到别名，bash 的外部版看不到）；`command -v` 是写脚本判断命令存在性的标准写法；`ls -l $(which xxx)` 顺着符号链接找到真身；`hash -r` 清掉 zsh 的命令查找缓存。

```bash
$ type -a node
node is /Users/ren/.nvm/versions/node/v22.17.0/bin/node
node is /usr/local/bin/node

$ command -v ffmpeg
/opt/homebrew/bin/ffmpeg
```

`hash -r` 解决的是另一类诡异现象：zsh 会缓存「命令 → 路径」的查找结果。刚装完新工具却提示 command not found，或删了旧命令还能「运行」，九成是缓存作祟——清一下就好。

反例 vs 正例（诊断姿势 / diagnose）：

反例——PATH 里有多份同名命令时，命中的永远是最前面那份；不看顺序就动手，越修越乱：

```bash
$ node -v
v18.19.0        # 我明明装了 v22！
# 反复重装、重启、搜攻略……
```

正例——先定位「运行的到底是谁」，再决定删谁留谁；刚装过或删过命令，先 hash -r：

```bash
$ type -a node          # 列出全部副本与顺序
node is /Users/ren/.nvm/.../bin/node
node is /usr/local/bin/node
$ hash -r               # 清查找缓存后再下结论
```

### 顺着符号链接找真身

brew 装的一切命令都是符号链接，`ls -l` 一眼看到真身：`bin/xxx → ../Cellar/xxx/版本/bin/xxx`。排查「装的哪个版本在生效」时，比任何记忆都可靠——链接指向哪个版本的目录，运行的就是哪个版本。

同理，`otool -L $(which xxx)` 看它依赖哪些库、`brew list --versions xxx` 看磁盘上存了几个版本、`brew uses --installed xxx` 反查谁在依赖它——删任何东西之前，最后这个命令值得跑一遍。

## 日常命令速查与技巧

### 四件套与升级清理

```bash
brew install wget                   # 装 CLI 工具（formula）
brew install --cask google-chrome  # 装 GUI 应用（cask）
brew info ffmpeg                   # 装前必看：版本、依赖、caveats
brew search "fuzzy finder" --desc  # 按描述搜工具

brew outdated --greedy   # 看什么旧了（含会自更新的 cask 应用）
brew upgrade             # 全部升级；brew upgrade git 只升一个
brew autoremove          # 清理不再被任何包依赖的孤儿依赖
brew cleanup -n          # 预演清理会删什么；去掉 -n 真删
```

`brew info` 输出末尾的 **caveats（注意事项）**一定要读：需要手动加 PATH、执行额外命令的提示都在那里。cask 装的 Chrome、VS Code 会自己更新，brew 的账本随之过期——`outdated` 加 `--greedy` 才会把它们算进来，属于良性噪音。

### 体检、服务与换机迁移

```bash
brew doctor                # 环境体检，任何异常先跑它
brew leaves               # 只看手动安装的顶层包
brew deps --tree ffmpeg   # 依赖树往下看
brew uses --installed xz  # 反向查：谁在依赖 xz

brew services list        # 后台服务状态
brew services start redis # 启动并设开机自启

brew bundle dump --file=~/Brewfile      # 导出全部 formula + cask 清单
brew bundle install --file=~/Brewfile   # 新机器一键装回
```

**Brewfile 是换机迁移的正式方案**：dump 出的清单文件可以进 dotfiles 仓库做版本管理，新机器上配合版本管理器的配置，几分钟恢复整套开发环境。另一个实用技巧：`brew install` 前总会先自动 update 一次、大而慢，在 `~/.zshrc` 里加 `export HOMEBREW_NO_AUTO_UPDATE=1` 关掉它，改成手动 `brew update` 即可。

## 追问链

**追问 1（深度 1）：brew install 和 brew install --cask 有什么区别？怎么判断该用哪个？**

出题意图：最基础的分诊题，筛掉只会复制粘贴命令、不清楚两套货架区别的人。

结论：前者装命令行工具（formula），后者装 GUI 图形应用（cask），判断标准就是装完后是敲命令用还是点图标用。formula 描述「去哪下载、怎么编译出命令行程序」，cask 描述「去哪下 dmg、怎么拷进 /Applications」。2019 年 Homebrew 2.0 起两者合并进同一仓库，brew search 会同时搜出两类结果。加分点：老教程里 brew cask install xxx 的写法已废弃，统一为 brew install --cask xxx。

- 加分项：知道新旧写法的迁移历史（2.0 起合并），说明真的读过文档而不是只会抄命令。

**追问 2（深度 2）：brew upgrade 之后某个工具启动报 Library not loaded: .../icu4c/lib/libicuuc.76.dylib，为什么？怎么修？**

出题意图：考察有没有真正理解动态链接与 Cellar 并排模型——只会背「重装试试」的人说不清因果链。

结论：报错的工具当初是对着旧版 icu4c 76 编译的，二进制里写死了要加载 76 版的 dylib；升级连带 cleanup 把旧版移走后，动态链接器找不到库，程序直接起不来。修复首选 brew reinstall 报错的工具，重新拿到对着新版依赖编译的版本；急用可以 brew install icu4c@76 把旧版补回来。加分点：用 otool -L 二进制路径 能亲眼看到这条精确到版本号的依赖记录，从报错倒推回 Cellar 目录，整条因果链就闭环了。

- 加分项：会用 otool -L 从报错倒推依赖记录，把「死记修复命令」升级成「读得出因果链」。

**追问 3（深度 2）：node 应该用 brew 装吗？为什么？**

出题意图：渠道规范天天在用却最常犯错，考察有没有「一个软件一个渠道」的意识。

结论：不该，node 交给版本管理器装（nvm、fnm、asdf 都行）。两个原因：一是开发常需要多版本共存随时切换，brew 只装「当前最新」一个版本；二是 brew 装了 node 再用 npm 装全局包，等于两套账本管同一个运行时，升级卸载时互相踩。同类判断口诀：系统工具归 brew，运行时归版本管理器（python→uv/pyenv，rust→rustup，java→sdkman），语言包归语言自己（uv tool、cargo install）。加分点：正确姿势是 brew install fnm——brew 只负责装「管理器」这个工具本身，被管理的运行时完全交给它。

- 加分项：说得出「brew 装管理器、管理器管运行时」的分层，而不是一刀切「brew 不能装 node 相关的任何东西」。

**追问 4（深度 3）：为什么 Apple Silicon 上 brew 装在 /opt/homebrew，Intel 机器却在 /usr/local？这个区别有什么实际影响？**

出题意图：看似冷知识，实际牵出 PATH 顺序、目录权限与双架构三个实战问题，能区分「用过」和「想明白」。

结论：历史加权限的双重原因。/usr/local 本来就是系统管理员共享目录，Intel 时代 brew 借住在此；Apple Silicon 上苹果收紧了对它的预期用途，brew 改用专属的干净前缀 /opt/homebrew。实际影响集中在 PATH：安装时执行 eval "$(brew shellenv)" 把 /opt/homebrew/bin 挂进 PATH，多份同名命令谁排在前面谁被执行——which -a 列出的顺序就是 PATH 顺序。加分点：装了 Rosetta 2 的机器可能同时存在两套 brew 前缀，PATH 里两个 bin 的先后会直接决定执行的是哪个架构的二进制，这是双架构机器经典的隐形坑。

- 加分项：延伸到 Rosetta 双前缀共存场景，说明对 PATH 解析顺序的理解已经能落地到实战排查。

## 写在最后

brew 的整套模型——**账本记录依赖、依赖树自动解析、版本目录隔离、锁定的入口链接**——与 npm 的 package.json（账本）、node_modules（依赖树）、lockfile（版本锁定）完全同构；「运行时归版本管理器」这条渠道纪律的具体落地，在版本管理器选型一篇里有完整对照。装完之后，国内网络下的**下载慢**是下一个绕不开的问题：换镜像还是挂代理、各管哪一段，是独立的一篇。

## 延伸阅读

- 《brew 下载慢怎么救：镜像与代理》——HOMEBREW_API_DOMAIN / BOTTLE_DOMAIN 与标准代理变量各管什么、镜像滞后与半镜像配置的坑。
- 《nvm、fnm、Volta、mise 差在哪？》——brew 装管理器、管理器管运行时——语言运行时渠道的正确归属与选型。
