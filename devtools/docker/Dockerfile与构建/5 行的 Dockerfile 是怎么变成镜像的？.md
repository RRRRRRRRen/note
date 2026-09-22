# 5 行的 Dockerfile 是怎么变成镜像的？

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Dockerfile、docker build、COPY、FROM、nginx ｜ 更新：2026-09-10*

**Dockerfile 是一份装配清单，`docker build` 从上到下逐行执行：取基础镜像、执行命令、拷入文件，最终打 tag 存成镜像。对一份典型的 nginx 前端镜像清单，要抓三件事：FROM 继承的是全套家当（文件系统、默认配置、启动命令——所以五行里没写“启动”它也能跑）；COPY 拷目录拷的是内容（dist 的 index.html 直接铺在目标目录下）；真正承重的只有三行（FROM + 两行 COPY），模板里的 RUN mkdir 和 WORKDIR 删掉行为不变。另有一条生死暗约定：COPY 的目标目录必须与 nginx.conf 的 root 完全一致，否则容器正常启动、页面 404。**

## 前置知识

镜像是 Dockerfile 的产出物：先有三个概念的关系，再看构建指令怎么一层层堆出来。（前置篇：《Docker 的镜像、容器、仓库是什么关系？》）

## 五行清单逐行读

一份真实生产在用的前端镜像清单只有五行（外加注释）——它要做的事用一句话概括：**复制一份官方 nginx 系统盘，换掉里面的配置，塞进你的 dist**。先看全貌：

```dockerfile
# 基础镜像
FROM nginx:stable-alpine

# 创建目录
RUN mkdir -p /home/cnsig/cnsig-ems-ui

# 指定路径
WORKDIR /home/cnsig/cnsig-ems-ui

# 复制conf文件到路径
COPY ./conf/nginx.conf /etc/nginx/nginx.conf

# 复制html文件到路径
COPY ./dist /home/cnsig/cnsig-ems-ui
```

逐行批注：

- `FROM nginx:stable-alpine`（定底座）：复制一份官方 nginx 镜像作为起点。继承的不只是文件系统，还有它的默认配置与启动命令——这个清单里没有任何「启动」字样，容器却能自动跑 nginx，能力就是这行带来的
- `RUN mkdir -p ...`（建目录）：构建期在镜像内建目录，给 dist 安家。RUN 与 CMD 的区别：前者在构建时执行一次、产物固化进镜像，后者是容器启动时跑的命令
- `WORKDIR ...`（指定路径）：设定后续指令的工作目录（相当于持久生效的 cd）。对本清单而言它是仪式性的一行——后面两条 COPY 全用绝对路径，不参考工作目录
- `COPY ./conf/nginx.conf ...`（灵魂行）：用你的配置覆盖官方默认配置。nginx 镜像默认读 /etc/nginx/nginx.conf，这行一执行，容器的全部行为就由你的这份文件决定了
- `COPY ./dist ...`（塞产物）：把构建产物塞进镜像。源是目录时拷的是「内容」——dist 里的 index.html 直接铺在目标目录下，这决定了 nginx root 该指向哪

四条指令各管一件事。官方参考对每条的职责都有明确界定——

> Docker Docs · Dockerfile reference：The FROM instruction initializes a new build stage and sets the base image for subsequent instructions.

`FROM` 决定“你是谁的儿子”。选 `nginx:stable-alpine` 意味着：nginx 程序、它的默认配置、日志软链、启动钩子脚本全部随包附赠，你只做增量。`RUN` 是构建期的手脚——它在构建过程中临时起一个容器执行命令，然后把造成的文件变化固化进镜像。`WORKDIR` 与 `COPY` 的精确语义官方也说得直白：

> Docker Docs · Dockerfile reference：The WORKDIR instruction sets the working directory for any RUN, CMD, ENTRYPOINT, COPY and ADD instructions that follow it in the Dockerfile. If the WORKDIR doesn't exist, it will be created even if it's not used in any subsequent Dockerfile instruction.

把 `docker build` 摊开看是三步，五行清单在第二步被消费：

```text
docker build 三步 / build stages

① 收材料
  │  CLI 把构建上下文目录整体打包交给引擎
  ▼
② 逐行装配
  │  从上到下执行清单，逐层叠加文件变化
  ▼
③ 打标入库
  │  写入元数据，按 -t 打 tag，存入本机镜像库
```

## COPY 的目录语义：拷的是内容，不是目录

COPY 最容易想当然的一条规则，官方白纸黑字：

> Docker Docs · Dockerfile reference：If the source is a directory, the contents of the directory are copied, including filesystem metadata. The directory itself isn't copied, only its contents.

也就是说 `COPY ./dist /home/cnsig/cnsig-ems-ui` 执行后，镜像里**不存在** /home/cnsig/cnsig-ems-ui/dist 这一层目录，dist 里的东西直接铺在目标目录下：

```text
/home/cnsig/cnsig-ems-ui/
├── index.html          ← dist/index.html
├── assets/
│   ├── index-3fa2.js
│   └── index-8b1c.css
└── favicon.ico

# 没有 /home/cnsig/cnsig-ems-ui/dist/ 这一层！
```

这条语义正是整套配置能跑通的原因之一：nginx.conf 里 `root /home/cnsig/cnsig-ems-ui` 指向的目录下**直接就是 index.html**。由此产生本篇最重要的暗约定——**Dockerfile 的 COPY 目标路径与 nginx.conf 的 root 路径是同一件事的两个写法**，改动任何一边都必须同步另一边。它们分属两个文件、没有任何机制校验一致性，是前端镜像“容器活着但页面 404”的头号来源。

## 点评：五行里只有三行承重

用「删除实验」逐行检验——心里把这行划掉，预测什么会坏：`RUN mkdir` 划掉，什么也不坏（COPY 写绝对路径时自动创建目标目录，WORKDIR 也会自建目录）；`WORKDIR` 划掉，同样什么也不坏（后续 COPY 全是绝对路径，绝对路径不参考工作目录）。真正承重的只有 FROM 和两行 COPY——**FROM 提供 nginx 与它的默认行为，第一行 COPY 决定容器“怎么表现”，第二行 COPY 提供站点内容**。等价的最小版本：

```dockerfile
FROM nginx:stable-alpine
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./dist /home/cnsig/cnsig-ems-ui
```

模板瘦身对照：

错误写法：

```dockerfile
FROM nginx:stable-alpine
RUN mkdir -p /home/cnsig/cnsig-ems-ui
WORKDIR /home/cnsig/cnsig-ems-ui
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./dist /home/cnsig/cnsig-ems-ui
# 两行仪式性指令：读清单的人会误以为
# 它们承担了什么
```

- 问题：模板继承来的习惯写法不算错，但每行不承重的指令都会抬高阅读成本——清单越长，「哪行在起作用」越难判断

正确写法：

```dockerfile
FROM nginx:stable-alpine
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./dist /home/cnsig/cnsig-ems-ui
# 三行，每行都承重
```

- 要点：行为与五行版完全一致。判断标准就一条：删掉这行，镜像会变吗？不变的行就该删

顺带一个好消息：这套清单有内置安全网——如果构建时忘了先产出 dist（或目录为空），COPY 找不到源会**直接报错终止构建**，而不是打出一个空站点镜像。另外文件拷贝一律用 COPY 而非 ADD：官方参考对两者的评语是「功能相似、用途有别」，ADD 多出的远程 URL 下载与自动解压 tar 两个能力行为不可预期，最佳实践明确建议常规拷贝用 COPY。

```text
┌─ 记忆卡 ─────────────────────────────────────────────────────┐
│  FROM 定底座，COPY 定内容，root 与 COPY 目标必须一致          │
└──────────────────────────────────────────────────────────────┘
```

- 五行清单里承重的三行：**FROM**（继承 nginx 程序 + 默认配置 + 启动命令）、**COPY conf → /etc/nginx/nginx.conf**（覆盖默认配置，决定容器行为）、**COPY dist → 站点目录**（拷的是内容不是目录，index.html 直接铺在目标下）
- COPY 目标与 nginx root 是一对暗约定，改一边必改另一边

## 边界与陷阱

四个高频坑：一个来自暗约定失守，两个来自对指令语义的想当然，一个来自对构建期环境的高估。

### 坑 1：COPY 目标与 nginx root 不一致

错误写法：

```text
# Dockerfile
COPY ./dist /usr/share/nginx/html
# nginx.conf（改版时 root 单独改了）
root /home/cnsig/cnsig-ems-ui;
# 结果：容器正常启动，所有页面 404
```

- 问题：两个文件分属两处、构建不校验一致性——nginx 会以「配置合法」的姿态启动，只是静态文件目录里空空如也

正确写法：

```text
# Dockerfile
COPY ./dist /usr/share/nginx/html
# nginx.conf
root /usr/share/nginx/html;
# 两边永远指向同一个目录
```

- 要点：改动口诀：改 root 必改 COPY，改 COPY 必改 root。验收方式是在容器里 curl 首页，而非只看容器状态

### 坑 2：以为会拷出 dist 这层目录

错误写法：

```text
COPY ./dist /home/cnsig/cnsig-ems-ui
# 以为镜像里是：
#   /home/cnsig/cnsig-ems-ui/dist/index.html
# 实际是：
#   /home/cnsig/cnsig-ems-ui/index.html
```

- 问题：源是目录时拷的是目录的内容。想连 dist 这层目录一起拷，得写 COPY ./dist /home/cnsig/cnsig-ems-ui/dist

正确写法：

```text
# 与 root 对齐的两种写法二选一：
COPY ./dist /home/cnsig/cnsig-ems-ui
#   root /home/cnsig/cnsig-ems-ui;

COPY ./dist /home/cnsig/cnsig-ems-ui/dist
#   root /home/cnsig/cnsig-ems-ui/dist;
```

- 要点：两种都对，关键是「COPY 落点」与「root 指向」逐字一致。拿不准时进容器 ls 一下落点，眼见为实

### 坑 3：在 nginx 镜像里 RUN pnpm build

错误写法：

```dockerfile
FROM nginx:stable-alpine
COPY . /home/cnsig/cnsig-ems-ui
RUN pnpm install && pnpm build
# → /bin/sh: pnpm: not found
# 基础镜像里没有 Node，更没有 pnpm
```

- 问题：构建期命令跑在基础镜像的环境里。nginx:stable-alpine 是个精简 Linux + nginx，没有 Node.js 运行时——前端构建无法在这里执行

正确写法：

```bash
# 两阶段各干各的：前端构建在宿主机/CI 完成
$ pnpm build          # 产出 dist/
$ docker build .      # 清单里只 COPY dist
# 或用多阶段构建把两步装进一个清单：
# FROM node:22-slim AS build
# ... RUN pnpm build
# FROM nginx:stable-alpine
# COPY --from=build /app/dist /home/cnsig/cnsig-ems-ui
```

- 要点：多阶段构建（multi-stage）是「一个清单、两个基础镜像」的标准解法：第一阶段有 Node 负责构建，第二阶段只搬运产物，最终镜像依旧精简

### 坑 4：用 ADD 拷常规文件

错误写法：

```dockerfile
ADD https://example.com/robots.txt /home/cnsig/cnsig-ems-ui/
ADD ./assets.tar.gz /home/cnsig/cnsig-ems-ui/
# 前者：构建时发起一次远程下载（不可复现、不走缓存）
# 后者：自动解压——读清单的人看不出这层魔法
```

- 问题：ADD 在 COPY 的基础上多了远程 URL 下载与本地 tar 自动解压两个隐藏行为，它们让清单的语义变隐晦、构建变得依赖外部网络

正确写法：

```dockerfile
COPY robots.txt /home/cnsig/cnsig-ems-ui/
# 需要 tar 解压时，显式写出来：
COPY assets.tar.gz /tmp/
RUN tar -xzf /tmp/assets.tar.gz -C /home/cnsig/cnsig-ems-ui
```

- 要点：官方对两者的评语是「功能相似、用途有别」——常规文件拷贝用 COPY，把所有魔法留在明面上

## 动手练习

**练习 1（暗约定、COPY）**

题目：安全要求站点文件挪到 `/srv/www`。给出需要改动的所有位置和改后的两行内容。

- 提示：两个文件，一个约定，改哪边都行——但必须同步

参考答案：

两处：`Dockerfile` 的 `COPY ./dist /srv/www` 与 `nginx.conf` 的 `root /srv/www;`。只改一边就会出现“容器正常启动、页面 404”——COPY 落点与 root 指向必须逐字一致。改完 build 后进容器用 `curl localhost` 验证首页，而不是只看容器状态。

**练习 2（COPY、语义）**

题目：想在站点根目录多放一个 `robots.txt`（它已存在于构建上下文里），在五行清单基础上加哪一行？

- 提示：robots.txt 要出现在站点根目录下，也就是 root 指向的目录里

参考答案：

`COPY robots.txt /home/cnsig/cnsig-ems-ui/robots.txt`。源是构建上下文里的单文件，目标是镜像内的绝对路径；因为 COPY 写绝对路径会自动补齐中间目录，它前面不需要任何 mkdir。放在两行 COPY 之间或之后都可以——robots.txt 很少变，放前面还能多吃到一层构建缓存。

## 追问链

五问从继承之谜问到装配与行为的分界。

**追问 1：这份清单里没有任何「启动 nginx」的指令，容器启动后 nginx 是怎么跑起来的？**

> 考察点：热身题，检验是否理解 FROM 的继承范围——文件清单只描述「装了什么」，不描述「怎么跑」，后者来自父镜像。

FROM 继承的不只是文件系统，还有父镜像的元数据，其中包括启动命令（CMD/ENTRYPOINT）。nginx 官方镜像自带「以前台方式运行 nginx」的默认命令，子镜像没写就原样继承，所以容器启动时自动执行 nginx。换句话说，这份清单定制的是「装什么」，「怎么跑」完全是继承来的。

- 再进一步：用 docker inspect 镜像能看到继承来的 Cmd/Entrypoint 字段；机制细节在「继承与启动钩子」一篇展开

**追问 2：RUN mkdir 建出来的目录，进容器后为什么能摸到？它和 docker exec 进去后手动 mkdir 有什么区别？**

> 考察点：考察构建期与运行期的时间线概念——两者的产物都「在文件系统里」，但生命周期与可见范围完全不同。

RUN 在构建期执行，它造成的文件变化被固化进镜像层，之后从这个镜像启动的每一个容器都天生带着这个目录；docker exec 里的 mkdir 发生在运行期，只写入当前容器私有的可写层，容器销毁即消失，镜像和其他容器都不受影响。一句话：RUN 的产物归镜像（永久、共享），exec 的产物归容器（临时、私有）。

- 再进一步：这也解释了为什么「进容器改配置」救不了一个镜像的问题——见「边界与陷阱」里的可写层话题

**追问 3：dist 里是 index.html、assets/ 和 favicon.ico，COPY ./dist /app 之后，/app/dist 存在吗？为什么？**

> 考察点：本篇核心语义点：目录拷贝拷的是内容。答出「不存在」并能解释的人，才真正读懂了 COPY。

不存在。COPY 的源是目录时，拷贝的是目录的内容——/app/index.html、/app/assets/、/app/favicon.ico 直接铺在目标下，dist 这层壳被剥掉了。这正是 nginx root 指向 /app 就能直接命中 index.html 的原因；如果误以为会多一层 dist，root 就会写错一级。

- 再进一步：想保留 dist 这层目录，写 COPY ./dist /app/dist 即可——目标目录不存在时 COPY 会自动创建

**追问 4：构建机上有 pnpm，为什么不能在 Dockerfile 里写 RUN pnpm build 一并构建？**

> 考察点：检验「构建期环境 = 基础镜像的环境」是否入脑——这是前端工程师写镜像清单时最想当然的一步。

因为 RUN 的执行环境是基础镜像，不是构建机：nginx:stable-alpine 里没有 Node.js 也没有 pnpm，这条命令必然报 not found。构建机上的 pnpm build 与镜像构建是两个隔离的阶段，前者的产物（dist）通过 COPY 交接。想让清单自己完成前端构建，用多阶段构建：第一个 FROM 用 node:22-slim 装依赖并构建，第二个 FROM 用 nginx:stable-alpine，COPY --from=build 把 dist 搬过来。

- 再进一步：多阶段构建的最终镜像只含最后一个阶段的文件——node_modules、devDependencies 全部留在构建阶段，这正是它比「全塞一个 Node 镜像」优雅的原因

**追问 5：把 COPY conf 那一行整个删掉，镜像还能构建、容器还能跑吗？跑起来的是什么？**

> 考察点：压轴题：区分「装配」（文件）与「行为」（元数据/配置）两层。能推演出「欢迎页」的人，把继承机制想透了。

能构建，也能跑——只是跑的是官方 nginx 的默认配置：80 端口、默认站点目录 /usr/share/nginx/html 的欢迎页。因为 COPY conf 是「覆盖默认配置」的动作，删掉它只是不覆盖，容器行为完全回落到继承的默认值。这个推演反过来是排查利器：如果容器里的页面是 Welcome to nginx，说明你的 nginx.conf 根本没生效（COPY 路径错、或 root 指错），而不是 nginx 挂了。

- 再进一步：同理可推：删掉 COPY dist，容器照样跑欢迎页；两行 COPY 全删，得到的就是原封不动的 nginx:stable-alpine

## 下一步去哪

清单读完了，还剩两个“清单之外的机制”：COPY 里那个 `./` 到底相对谁（构建上下文），以及为什么同样的清单有时秒构建、有时卡半分钟（层缓存）——下一篇**构建上下文与缓存**把这两件事讲透。再往后是 FROM 那行的深水区：父镜像的默认行为（默认配置、启动命令）是怎么原封不动传给你的。

## 延伸阅读

- 《一次前端部署是怎么从 dist 走到线上的？》：回看链路：本篇清单正是链路第二步 docker build 的输入
- 《为什么构建上下文越大 build 越慢？》：系列下一篇：COPY 的 ./ 相对谁、.dockerignore 与层缓存的机制
