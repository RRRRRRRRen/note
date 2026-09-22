# 为什么构建上下文越大 build 越慢？

*类型：knowledge ｜ 难度：进阶 ｜ 标签：docker build、构建上下文、dockerignore、层缓存 ｜ 更新：2026-09-10*

**`docker build` 的第一步不是执行 Dockerfile，而是把整个构建上下文目录整体打包、上传给构建引擎——COPY 只是事后从这份完整拷贝里挑文件，挑的动作发生在上传之后。所以上下文里有 1GB 的 node_modules，哪怕清单只 COPY 一个 2KB 的配置，这 1GB 也要先搬完。控制上下文两条路：.dockerignore 黑名单（在仓库根构建时排除 node_modules、.git）与小目录白名单（把 Dockerfile、conf、dist 放进一个干净目录作为上下文，CI 的标准做法）。装配阶段则靠层缓存提速：少变的指令放前面、常变的放后面，改一行只重做该行及其后。**

## 前置知识

上下文上传与层缓存都发生在构建过程中：先懂指令如何分层，才懂缓存为什么按层命中。（前置篇：《5 行的 Dockerfile 是怎么变成镜像的？》）

## 上下文：build 的第一步是搬运，不是装配

命令末尾那个 `.` 大多数人都敲过，但它不是“Dockerfile 在哪”——它是**构建上下文**的路径：

> Docker Docs · Build context：The build context is the set of files that your build can access.

为什么要把一个目录“交给”Docker？因为 Docker 是客户端-服务端架构：`docker build` 只是个客户端命令，真正干活的是构建引擎——在 macOS 上它甚至运行在一台 Linux 虚拟机里。你的本地文件对引擎而言是“墙外之物”，唯一能递进墙内的通道就是上下文上传。于是 build 的第一步注定是搬运：

```text
上下文先于清单 / context before build

本机目录（上下文）
  │  docker build .
  ▼
整体打包上传
  │  全部文件，先搬完
  ▼
构建引擎（守护进程/VM）
  │  收到完整上下文
  ▼
逐行执行 Dockerfile
  │  COPY 从中挑文件
```

这解释了一个所有人都见过却很少深究的现象：构建输出第一行 `Sending build context to Docker daemon 1.2GB`（legacy builder 的输出形态；Docker 23+ 默认的 BuildKit 打印的是 `transferring context: …MB`，两者是同一件事）之后的长久等待——那是在打包上传上下文，而此时 Dockerfile 一行都还没执行。COPY 与上下文的关系，官方一句话说清：

> Docker Docs · Build context：Build instructions such as COPY and ADD can refer to any of the files and directories in the context.

注意方向：是上下文决定了 COPY 能拿到什么，而不是 COPY 决定上传什么。`COPY ../shared/xxx /app` 永远非法——上下文是一个被整体打包发送的目录，**它没有“上级目录”这个概念**。同理，构建机本机的其他路径（比如 /etc 下的文件）无论 Dockerfile 怎么写都拿不到，这是刻意的安全边界。

## .dockerignore：打包前的黑名单

控制上下文体积的第一种手段是在上下文根目录放一个 .dockerignore——语法与 .gitignore 高度相似，但作用对象完全不同：它过滤的不是“进版本库的文件”，而是“进构建的文件”：

> Docker Docs · Build context：You can use a .dockerignore file to exclude files or directories from the build context. This helps avoid sending unwanted files and directories to the builder, improving build speed.

两层收益。第一层是**速度**：把 node_modules（几十万个小文件）、.git（整个提交历史）排除掉，上传从 GB 级降到 MB 级。第二层是**安全**：上下文里的文件“有资格”被任何一条 COPY 引用——.git 里有完整提交历史、.env 里可能有密钥，今天清单没碰它们不代表明天没人加一行 `COPY . .`。黑名单挡住的不是今天的构建，是未来某次手滑的原料。

## 白名单：小目录上下文，CI 的标准做法

另一种思路更彻底——上下文目录本身就是白名单：把构建需要的文件（Dockerfile、conf、dist）挑进一个干净的小目录，**只把这个目录作为上下文**。真实项目里 CI 正是这么干的：

```bash
# CI 流水线里的真实两步：
cp -r apps/web-antd/dist docker/     # ① 只把 dist 拷进 docker/ 目录
docker build ... docker/             # ② 上下文 = docker/，
                                     #    里面只有 Dockerfile、conf/、dist/
```

此时 `docker/` 目录里**只有**构建需要的四样东西，node_modules 根本没资格上车——连 .dockerignore 都不需要存在。白名单的取舍是：多一步“挑选”的仪式（CI 里就是一行 cp），换来上下文的绝对纯净。对比两种风格：

| 维度 | .dockerignore 黑名单 | 小目录白名单 |
| --- | --- | --- |
| 形态 | 仓库根做上下文 + 排除清单 | 专门的干净目录做上下文 |
| 心智 | 全部有资格，按名单剔除 | 挑出来的才有资格 |
| 风险 | 漏排除的文件照样上车 | 少拷文件会在构建时报错（显性失败） |
| 适用 | 单仓库根目录直接构建的日常开发 | CI 流水线、对纯净度要求高的正式构建 |
| 组合 | 两者并用：小目录 + 兜底 ignore | 同左 |

## 层缓存：清单顺序为什么有讲究

上下文搬完之后才轮到装配。装配阶段每条指令产生一个层，而缓存以**指令 + 输入**为键：某条指令与它的输入和上次构建完全一致，这层直接复用；一旦失效，**该行及其后所有行**全部重做。用“只改了 dist 的一次重新构建”推演一遍：

```text
改 dist 后二次构建逐行推演 / cache walk

① FROM nginx:stable-alpine
     基础镜像没变，命中缓存，瞬间完成
② COPY ./conf/nginx.conf /etc/nginx/nginx.conf
     对比上下文里的 conf/nginx.conf：内容没改，命中缓存，复用
③ COPY ./dist /home/cnsig/cnsig-ems-ui
     对比上下文里的 dist/：文件变了，这层失效——重新执行 COPY，产出新的文件层
④ 后续所有指令
     缓存链到这里已断，本行之后（若还有）的每一层都要重做；本清单只有三行，损失到此为止
```

推演暴露的规则可以提炼成一条排序原则：**少变的指令放前面，常变的放后面**。conf 和清单本身很少动，dist 每次构建都变——把 dist 的 COPY 放最后，改动只烧掉一层；反过来若把 `COPY . .`（最容易变的）放在开头，后面所有层每次都陪葬。这条原则在 Node 后端镜像上收益巨大（依赖安装行放最前，package.json 不变就永远命中），对前端三行清单收益虽小，习惯值得现在养成。

```text
┌─ 记忆卡 ─────────────────────────────────────────────────────┐
│  上下文是入场费，缓存按「指令 + 输入」复用                    │
└──────────────────────────────────────────────────────────────┘
```

- build 第一步把上下文**整体打包上传**，COPY 从中挑文件是上传之后的事——上下文体积决定下限，与清单内容无关
- 控制手段：.dockerignore 黑名单（速度 + 安全双重收益）或干净小目录白名单
- 层缓存按「指令 + 输入」命中，一处失效其后全断：**少变在前，常变在后**

## 边界与陷阱

三个高频坑分别对应速度、作用域、安全三个维度——共同点都是“上下文”这个概念没落地。

### 坑 1：仓库根直接 build，node_modules 全程陪跑

错误写法：

```bash
$ docker build .
Sending build context to Docker daemon  1.2GB
# 卡在第一行半分钟：node_modules（几十万小文件）
# + .git（全部历史）正在被逐个打包上传
```

- 问题：清单只 COPY dist 也救不了——上传发生在 COPY 之前。上下文体积是入场费，与清单写了什么无关

正确写法：

```text
# .dockerignore
node_modules
.git
dist
.turbo
*.md
```

```bash
# 排除后重新 build：
Sending build context to Docker daemon  13.2MB
```

- 要点：一行 .dockerignore 把入场费砍掉两个数量级。dist 也排除——它应该由 CI 挑进干净目录，而不是混在源码上下文里

### 坑 2：.dockerignore 只管它所在的那个上下文

错误写法：

```bash
# 仓库根/.dockerignore 写了排除 dist
$ cp -r apps/web-antd/dist docker/
$ docker build ... docker/
# 想当然：dist 被根目录的 ignore 排除了？
# 实际：docker/ 这个上下文里根本没读过
# 根目录的 .dockerignore
```

- 问题：.dockerignore 只对「与它同处一层的上下文根」生效。build docker/ 时引擎读的是 docker/.dockerignore，仓库根那份管不到

正确写法：

```bash
# 白名单目录自带纯净性，无需 ignore：
$ cp -r apps/web-antd/dist docker/
$ docker build ... docker/
# docker/ 里只有 Dockerfile、conf/、dist/
# 若确有需要，在 docker/ 下再放专属 .dockerignore
```

- 要点：判断方法永远是「这次的上下文目录是谁」——ignore 跟着上下文根走，不跟着仓库根走

### 坑 3：敏感文件躺在上下文里

错误写法：

```bash
# 仓库根直接 build，未排除：
#   .env.production   → 含后端地址与密钥
#   .git/             → 全部提交历史
$ docker build -t app:1.0 .
$ docker push registry.corp/app:1.0
# 镜像推上私服，全公司都能 pull
```

- 问题：这些文件今天没被 COPY 进镜像，但它们「有资格」——哪天有人加一行 COPY . .（Node 镜像的标准写法），秘密就随镜像分发给所有能 pull 的人

正确写法：

```text
# .dockerignore 里显式挡掉危险原料
.git
.env*
*.pem
secrets/
```

- 要点：黑名单防手滑，白名单断根源。两者一起上：CI 用小目录构建，开发用带 ignore 的仓库根构建；同时白名单小目录构建让敏感文件物理上进不了上下文

## 动手练习

**练习 1（上下文、体积）**

题目：仓库根目录下：`src/` 10MB、`dist/` 3MB、`node_modules/` 200MB、`.git/` 50MB，Dockerfile 只有一行 `COPY ./dist /app`。① 无 .dockerignore 时上传多少？② 排除 node_modules 与 .git 后呢？③ 由此推算 CI 用 `docker/` 小目录（Dockerfile 2KB + conf 2KB + dist 3MB）构建的上传量。

- 提示：入场费按上下文目录的总和算，与 COPY 挑了什么无关

参考答案：

① 263MB 全部上传——COPY 挑的 3MB 不改变入场费；② 13MB（src + dist）；③ 约 3MB——白名单目录里只有构建必需品，这也是 CI 构建通常比开发机快得多的原因之一。

**练习 2（上下文边界、COPY）**

题目：两个前端应用想共用 `packages/shared/` 里的公共文件，Dockerfile 里写 `COPY ../packages/shared/ /app/shared` 会发生什么？正确做法是什么？

- 提示：上下文是一个被整体发送的目录，它没有上级

参考答案：

非法：`../` 试图越过上下文根，引擎不会放行——上下文被发送后是自成一体的目录树，没有“上级”。正确做法是把共用工件在构建前置步骤里拷进各自应用的上下文目录（比如 CI 里 `cp -r packages/shared web-app/`），或者干脆从 monorepo 根构建、让上下文覆盖整个仓库（代价是必须配好 .dockerignore）。

## 追问链

五问从命令参数问到缓存失效的精确规则。

**追问 1：docker build -f deploy/Dockerfile . 里的 -f 和末尾的 . 分别指定什么？**

> 考察点：热身题：90% 的人天天敲 docker build . 却说不清那个点是什么——它是上下文，不是 Dockerfile 位置。

末尾的 . 指定构建上下文路径（把哪个目录整体交给引擎），-f 指定 Dockerfile 文件本身的位置，两者独立。所以 -f deploy/Dockerfile . 的含义是：清单在 deploy/ 目录里找，但上下文仍是当前目录——COPY 只能引用当前目录树里的文件，引用不到 deploy/ 之外没被包含的内容（若 deploy/ 在当前目录内则可以）。

- 再进一步：想换 Dockerfile 又不想混目录，常见写法是把清单放子目录、上下文仍指根：docker build -f docker/Dockerfile .——此时根目录的 .dockerignore 生效

**追问 2：.dockerignore 和 .gitignore 排除了同一批文件，它们是一回事吗？**

> 考察点：考察两个 ignore 的作用时机与对象——答得出「上传与提交是两条管线」才算分清。

不是。.gitignore 作用于提交：排除的文件不进版本库，但可以继续躺在你本机磁盘上；.dockerignore 作用于构建上传：被排除的文件不进上下文，哪怕它们好好地躺在磁盘上、甚至已提交进仓库。极端情况：dist 被 .gitignore 排除（不进库），但构建时若没被 .dockerignore 排除，照样会被上传——两条管线互不越界。

- 再进一步：CI 的干净检出只有 .gitignore 之外的文件，所以「CI 构建上下文比开发机小」几乎是必然的，除非有人把产物提交进了库

**追问 3：Dockerfile 只 COPY 一个 2KB 的 nginx.conf，为什么上下文 1GB 时构建还是明显变慢？**

> 考察点：核心机制题：验证「先整包上传、后挑文件」的顺序是否真的建立——答「COPY 会跳过大文件」的人还没入门。

因为上传先于装配：build 的第一步是把上下文整体打包发送给引擎，1GB 的 node_modules 和 .git 一个字节都少不了；COPY 的「挑选」发生在引擎收到完整上下文之后。上下文体积是无论清单怎么写都躲不掉的固定成本，唯一解法是在打包之前就瘦身——.dockerignore 或干净小目录。

- 再进一步：小文件多比总字节数更致命：几十万个小文件的打包开销（逐个 stat、压缩）远超同样大小的几个大文件，node_modules 正是重灾区

**追问 4：层缓存的失效规则精确地说是什么？为什么改了 dist，后面的指令全部重做？**

> 考察点：进阶题：考察「缓存链」模型——不是每层独立判断，而是一处失效全链断；理解它才能设计指令顺序。

每条指令的缓存键是「指令内容 + 输入」（COPY 层对源文件做内容校验和，RUN 层看命令字符串）。逐行比对时，某行与上次不一致，该行失效并重新执行；更重要的是它**之后的所有行**全部视为失效——哪怕那些行的输入完全没变。因为层是叠加的，地基变了上面的层无法原样复用。这就是「少变在前、常变在后」能省钱的原因。

- 再进一步：FROM 层的缓存键是基础镜像的摘要——官方镜像更新后，哪怕你的清单一字未改，全量重建也可能发生，这是「今天 build 突然变慢」的常见解释

**追问 5：CI Runner 是一台全新的干净机器，一条缓存都不会命中，那指令顺序还有意义吗？**

> 考察点：压轴题：把缓存知识推进到工程层面——CI 缓存是可以显式搬运的，顺序原则在无缓存的机器上也仍然成立一半。

单看一台干净机器，首次构建确实全部 miss，顺序不影响这一次的耗时；但 CI 平台普遍支持构建缓存的导出与恢复（如 buildx 的 --cache-to/--cache-from 把层缓存推到仓库或对象存储），下次构建恢复后顺序原则立即生效——少变的行直接命中。此外顺序原则还有不依赖缓存的价值：少变的在前让清单的「不稳定部分」被压缩到末尾，读清单与定位问题都更容易。

- 再进一步：另一个工程化选择：把「装依赖」这类最贵又最稳定的步骤拆成独立镜像（基础镜像），上层镜像继承它——把缓存固化成了制品

## 下一步去哪

上下文与缓存理清后，清单本身的最后一块拼图是 FROM 那一行：**父镜像的默认行为（默认配置、启动命令、钩子脚本）是怎么原封不动传给你的**，为什么你的清单什么都没写容器也会自己跑起来。再往后是连仓库都够不到时的分发兜底——离线搬运 save/load。

## 延伸阅读

- 《5 行的 Dockerfile 是怎么变成镜像的？》：上一篇：清单四指令逐行拆解，COPY 目标与 nginx root 的暗约定
- 《FROM 官方镜像后，默认行为是怎么保留的？》：系列下一篇：FROM 的完整继承规则与容器启动钩子
