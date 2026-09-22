# Docker

## 基础概念

### 一次前端部署是怎么从 dist 走到线上的？

*难度：入门 ｜ 标签：Docker、前端部署、nginx、CI、K8s*

**一条链路五个动作：pnpm build 产出 dist → docker build 把 dist 装进 nginx 镜像 → docker push 推上镜像仓库 → 运行集群 docker pull 拉取 → 按新镜像重建容器。** 链路上的三个角色各司其职：构建机负责产出与装配、镜像仓库是所有机器都能到达的中转站、运行集群只管拉镜像把容器跑起来。前端产物本质是静态文件，所以部署的全部内容就是：让 nginx 托管 dist，并把接口请求反代给后端——同域部署顺带消灭了 CORS。

**五步链路：每个动作产出下一动作的原料**

把一次典型的前端容器部署摊开，数据流是这样的——每一步的输出恰好是下一步的输入，断在哪一步，排查就只需要看那一步：

```text
[代码仓库]         git push / 手动打包触发
    │
    ▼
[构建机]           pnpm build → 产出 dist/
    │
    ▼
[docker build]     COPY dist 装配成镜像
    │
    ▼
[镜像仓库（私服）]  docker push 中转
    │
    ▼
[K8s 集群]         docker pull + 更新 Pod
    │
    ▼
[用户浏览器]       HTTP :80/:443 拿到页面
```

逐段走读：`pnpm build` 在构建机里产出 `dist/`（按环境可能是 dist-prod / dist-fat）；`docker build` 依据 Dockerfile 把 dist 与 nginx.conf 装配成镜像、打上版本 tag；`docker push` 把镜像推上内网私服；运行侧（K8s Deployment 的滚动更新或一台服务器上的 `docker run`）拉取新镜像、用它重建容器；最后浏览器拿到 nginx 托管的页面。前两步产出"内容"，后三步完成"分发与运行"。

一个容易忽略的事实：**push 完成不等于部署完成**。镜像进了仓库只是到了中转站，运行侧还差两步——K8s 场景是更新工作负载的镜像版本（或对同名 tag 强制滚动重启），单机场景是 `docker pull` 后用新镜像重建容器。部署脚本报"推送成功"之后线上没变化，先检查的就是这半截链路。

**三角色拓扑：构建机、仓库、运行集群**

把五步按机器归位，就是三个角色。它们的职责边界非常清晰，**没有任何一个角色既构建又运行**——构建机不需要能访问数据库，运行集群不需要装 Node，仓库只做存取：

| 角色 | 职责 | 关键命令 | 典型形态 |
|---|---|---|---|
| 构建机 | 产出 dist、装配镜像并推送 | pnpm build → docker build → docker push | CI Runner、跳板服务器或开发机 |
| 镜像仓库 | 集中存取镜像，全链路中转站 | docker login / push / pull | 内网 Nexus / Harbor（如 112.26.45.227:10001） |
| 运行集群 | 拉镜像并保持容器按期望运行 | kubectl rollout restart（或 docker run） | K8s / k3s 集群，Deployment 定义副本 |

**仓库是唯一省不掉的角色**。原因有二：其一，**可达性**——运行集群往往是多台机器，镜像必须放在所有节点都能到达的位置，"直接把镜像拷到每台机器"在规模一大后就不可维护；其二，**信任边界**——集群侧可以只允许运行来自私服的镜像，仓库因此成为准入关卡：外来镜像、未扫描镜像一律进不来。加上私服里的每个镜像都有不可变的 digest 摘要（内容算出的指纹），"这个版本到底是什么"从此有据可查。仓库服务的存取协议对所有 Docker 都一样，所以自建 Nexus / Harbor 还是云托管，对部署脚本完全透明。

构建发生在哪一台机器上，决定了两套常见的通道形态：**CI 通道**（git push 触发流水线，CI 机器完成 build + push）和**服务器通道**（把 dist 传上一台跳板服务器，在服务器上执行 build + push 的部署脚本）。产物一致的前提下两者等价，差别在环境一致性（CI 从干净检出构建）与权限管理（私服凭证只发给 CI 或跳板机）——这也是成熟团队逐步把服务器通道收编进 CI 的原因。两套通道用的是同一批 docker 命令，学会一条就等于学会两条。

**为什么 dist + nginx 就是前端部署的全部**

SPA 构建产物 `dist/` 是纯粹的静态文件：一个 index.html 加若干 js/css 资源。它不需要 Node、不需要进程管理，缺的只是一个 HTTP 服务把请求映射到这些文件——这就是 nginx 在链路里承担的第一个角色（静态托管）。第二个角色是**反向代理**：前端代码里接口地址写成 `/admin-api` 这样的相对路径，请求先落到同域的 nginx，再由 nginx 转发给后端服务。浏览器视角下页面和接口永远同源，**跨域问题从根上不存在**——不需要后端配 CORS 响应头，也不需要开发期代理的线上替代品。这两个角色如何由一份 nginx.conf 精确落地，是部署实战篇的主角。

基础镜像选 `nginx:stable-alpine` 而不是默认的 `nginx:latest`，看一眼解压后的体积就有直觉了（具体数值随版本浮动，仅供量级感受）：

| 镜像 | 解压后体积（MB）· 仅供直觉 |
|---|---|
| nginx:latest（Debian） | 190 MB |
| nginx:stable-alpine | 45 MB |
| 其中 alpine 底座 | 8 MB |

小镜像的收益是三重的：push / pull 传输量小一个数量级（集群滚动更新时每个节点都要拉一次）；磁盘占用小（一个节点上常年堆着多个版本）；攻击面小（alpine 砍掉了 Debian 里上百个用不到的包，能藏问题的地方更少）。alpine 的代价是它用 musl 而非 glibc，极少数依赖 glibc 特性的二进制会不兼容——纯静态托管场景完全碰不到，所以前端镜像放心用。

> **记忆卡：五步链路：build → build → push → pull → run**
> `pnpm build` 产 dist（内容）；`docker build` 装成镜像（装配）；`docker push` 推私服（分发）；集群 `pull` + 重建容器（运行）。三个角色：构建机管产出、仓库管中转（可达性 + 信任边界，省不掉）、集群管运行。**push 成功 ≠ 部署完成**——后半截 pull 与重建容器没做完，线上就是旧版本。

**边界与陷阱**

链路上的三个高频翻车点，分别出现在"内容生产""镜像不可变""分发闭环"三个环节。

**坑 1：接口地址写死完整域名，同域反代白做了**

反例——接口地址写死后端域名：

```bash
# .env.production
VITE_GLOB_API_URL=https://api.corp.example.com
# 页面部署在 web.corp.example.com
# 浏览器发起跨域请求 → CORS 拦截
```

接口地址写死另一个源，浏览器每次请求都要面对同源策略——后端被迫配 CORS，配置一多就是事故源。

正解——只留路径前缀，同域转发：

```bash
# .env.production：只留路径前缀
VITE_GLOB_API_URL=/admin-api
# nginx.conf：同域路径转发给后端
location /admin-api/ {
  proxy_pass http://cnsig-ems-boot:21080/admin-api/;
}
```

页面与接口同域，请求在浏览器眼里没有跨域这回事；转发是 nginx 在服务端做的，不受同源策略约束。

**坑 2：在宿主机上替换 dist，容器纹丝不动**

反例——绕过镜像改宿主机文件：

```bash
# 服务器上直接覆盖旧目录
$ scp -r dist/* root@node:/home/app/cnsig-ems-ui/
$ docker restart my-app
# 页面还是旧的——容器读的是镜像里的文件，
# 不是宿主机目录
```

镜像 immutable，容器启动后读的是自己文件系统里的那份拷贝。宿主机目录只是当年 COPY 的原料，改它对已运行的容器毫无作用。

正解——换内容就换镜像：

```bash
$ docker build -t .../cnsig-ems-ui:1.0.1 .
$ docker push .../cnsig-ems-ui:1.0.1
# 然后让运行侧用新镜像重建容器
$ kubectl rollout restart deployment/cnsig-ems-ui
```

重建 → 推送 → 滚动更新。这条纪律同时保住了「线上版本可追溯」。

**坑 3：把「推送成功」当「部署完成」**

反例——断在半截的链路：

```bash
$ ./deploy.sh -n cnsig-ems-ui -v 1.2.0
[INFO] 镜像推送成功！
# 看线上：还是 1.1.x 的页面
# ——集群还在跑旧容器，没人 pull 新镜像
```

私服只是中转站。运行侧没有触发 pull + 重建，新镜像就只是躺在仓库里，线上跑的仍是旧容器。

正解——在运行侧验证滚动更新：

```bash
# K8s：改 Deployment 的镜像 tag 后
$ kubectl rollout restart deployment/cnsig-ems-ui
$ kubectl rollout status deployment/cnsig-ems-ui
Waiting for deployment ... successfully rolled out
```

部署的完成标志是滚动更新成功（rollout status 通过），或单机场景新容器已用新镜像跑起来。验证要在运行侧做，不看推送日志。

**动手练习**

- 练习 1（链路、排查）：线上页面仍是旧版本，但 `deploy.sh` 输出了「镜像推送成功」。把这五个环节（pnpm build / docker build / docker push / pull / 重建容器）按"逐个验证成本从低到高"排一个排查顺序，并指出最可能断在哪一环。
- 答案：顺序：① 查 `docker images` 确认私服上（或构建机本地）有新版本 tag——排除 build / push 断裂；② 到运行节点 `docker images`（或 kubectl describe pod 看镜像）确认新镜像有没有被 pull 下来——定位是分发断裂还是重建断裂；③ 查运行侧容器的创建时间与镜像 ID——确认有没有用新镜像重建。推送已报成功时，最常见断点是**最后一环**：没人触发 pull / 滚动更新，容器还是老的。
- 练习 2（同域反代、CORS）：团队把前端部署到 `web.corp.com`，后端只有 `api.corp.com`，且后端无法改造加 CORS 头。用本篇的两个角色（静态托管 + 反向代理）设计一条让页面正常调接口的方案。
- 答案：把接口收敛到前端自己的域名下：前端代码里接口地址只写路径前缀（如 `/admin-api`），打包进 dist；nginx.conf 增加一条 `location /admin-api/` 把该前缀 `proxy_pass` 给 `api.corp.com`。浏览器只见 web.corp.com→web.corp.com 的同源请求，跨域无从谈起；真正出站到 api.corp.com 的请求由 nginx 在服务端完成，同源策略管不到它。

**追问链**

五问沿链路铺开，从两阶段构建问到镜像版本一致性。

**pnpm build 和 docker build 都叫构建，它们各产出什么？**

pnpm build 是前端构建：源码 → dist 静态产物；docker build 是镜像构建：按 Dockerfile 把（已有的）dist、nginx.conf 和基础镜像装配成一个镜像文件。前者是后者的原料供应商，顺序固定：先 pnpm build 后 docker build。

追问：两阶段可以拆在两台机器上做——CI 上 pnpm build，跳板机上 docker build；它们唯一的交接物就是 dist 目录。

**K8s 里 Deployment 的镜像 tag 没变（还是 1.0.0），执行 rollout restart 后新 Pod 一定用的是新镜像吗？**

不一定。K8s 默认 imagePullPolicy 是 IfNotPresent：节点上已存在同名同 tag 的镜像时不再去仓库拉取。如果旧 Pod 所在节点缓存过旧的 1.0.0，rollout restart 重建的 Pod 会直接复用本地那份旧镜像。可靠做法是镜像 tag 用不可重复的版本（每次构建新 tag），或把策略设为 Always 强制每次都去仓库核对。

追问：tag 每次都换新版本号时，IfNotPresent 反而是最优解——未变化的节点不浪费拉取时间；这是「版本号唯一性」比「拉取策略」更根本的原因。

**为什么接口地址只写 /admin-api 这样的相对路径，跨域就消失了？**

同源策略是浏览器的安全机制，只约束「页面里的脚本向别的源发请求」。接口地址写成相对路径时，请求的源与页面完全相同（同协议同域名同端口），浏览器按同源请求放行；至于这个请求在 nginx 收到后再转发到哪个后端，那是服务器之间的行为，浏览器不知情也不管辖。跨域不是被「解决」了，而是被「绕到浏览器看不见的地方」了。

追问：反过来说，如果某些请求必须由浏览器直连第三方域（如 OAuth 跳转），同源策略依然生效——反代方案覆盖不到浏览器直连的场景。

**从「开发机也能装 Docker」推出「人人都可以本地构建生产镜像」，这步推理哪里有问题？**

问题在三点：其一，本地工作区不干净——未提交的改动、本地环境变量会被打进镜像，产物不可复现；其二，凭证面扩大——私服 push 权限发放到每台开发机，泄露面与审计难度同步扩大；其三，平台差异——macOS 上构建的镜像架构（arm64）与线上节点（amd64）可能不一致。所以规范通道是 CI 从干净检出构建，本地构建只用于自测。

追问：确需本地构建跨架构镜像时用 `docker buildx --platform linux/amd64`，它模拟目标架构——能用，但比 CI 原生构建慢得多。

**这条链路里，如果运行集群连私服的 10001 端口都不通（完全隔离的内网），五步链路还能走通吗？**

能，但分发环节要整体替换：在能同时访问私服与隔离网的机器上 docker save 把镜像导出成 tar 包，物理拷贝（或内部 FTP）进隔离网，目标机器 docker load 导入本地镜像库，后续重建容器不变。代价是失去仓库的版本管理与自动分发能力，每次更新都要人工搬运——这正是完全隔离环境用「离线搬运」的原因，也是私服存在价值的反面印证。

追问：tar 包保留全部镜像数据，load 后镜像与 push/pull 得到的完全一致；两台机器间也可以用 ssh 管道直传：`docker save 镜像 | ssh 目标机 docker load`。

延伸阅读：《Docker 的镜像、容器、仓库是什么关系？》（三对象与镜像名三段式，本篇链路里每个环节都用到了它们）、《5 行的 Dockerfile 是怎么变成镜像的？》（进入 docker build 内部，看四条指令怎么装配出前端镜像）。

## Dockerfile 与构建

### 5 行的 Dockerfile 是怎么变成镜像的？

*难度：进阶 ｜ 标签：Dockerfile、docker build、COPY、FROM、nginx*

**Dockerfile 是一份装配清单，docker build 从上到下逐行执行：取基础镜像、执行命令、拷入文件，最终打 tag 存成镜像。** 对一份典型的 nginx 前端镜像清单，要抓三件事：**FROM 继承的是全套家当**（文件系统、默认配置、启动命令——所以五行里没写"启动"它也能跑）；**COPY 拷目录拷的是内容**（dist 的 index.html 直接铺在目标目录下）；**真正承重的只有三行**（FROM + 两行 COPY），模板里的 RUN mkdir 和 WORKDIR 删掉行为不变。另有一条生死暗约定：**COPY 的目标目录必须与 nginx.conf 的 root 完全一致**，否则容器正常启动、页面 404。

前置概念：镜像是 Dockerfile 的产出物，三对象的关系见延伸阅读。

**五行清单逐行读**

一份真实生产在用的前端镜像清单只有五行（外加注释）——它要做的事用一句话概括：**复制一份官方 nginx 系统盘，换掉里面的配置，塞进你的 dist**。先看全貌：

```dockerfile
# 基础镜像
# 定底座：复制一份官方 nginx 镜像作为起点。继承的不只是文件系统，
# 还有它的默认配置与启动命令——这个清单里没有任何「启动」字样，
# 容器却能自动跑 nginx，能力就是这行带来的。
FROM nginx:stable-alpine

# 创建目录
# 构建期在镜像内建目录，给 dist 安家。RUN 与 CMD 的区别：
# 前者在构建时执行一次、产物固化进镜像，后者是容器启动时跑的命令。
RUN mkdir -p /home/cnsig/cnsig-ems-ui

# 指定路径
# 设定后续指令的工作目录（相当于持久生效的 cd）。对本清单而言
# 它是仪式性的一行——后面两条 COPY 全用绝对路径，不参考工作目录。
WORKDIR /home/cnsig/cnsig-ems-ui

# 复制conf文件到路径
# 灵魂行：用你的配置覆盖官方默认配置。nginx 镜像默认读
# /etc/nginx/nginx.conf，这行一执行，容器的全部行为就由你的这份文件决定了。
COPY ./conf/nginx.conf /etc/nginx/nginx.conf

# 复制html文件到路径
# 把构建产物塞进镜像。源是目录时拷的是「内容」——dist 里的
# index.html 直接铺在目标目录下，这决定了 nginx root 该指向哪。
COPY ./dist /home/cnsig/cnsig-ems-ui
```

四条指令各管一件事。官方参考对每条的职责都有明确界定——

> The FROM instruction initializes a new build stage and sets the base image for subsequent instructions.（Docker Docs · Dockerfile reference）

`FROM` 决定"你是谁的儿子"。选 `nginx:stable-alpine` 意味着：nginx 程序、它的默认配置、日志软链、启动钩子脚本全部随包附赠，你只做增量。`RUN` 是构建期的手脚——它在构建过程中临时起一个容器执行命令，然后把造成的文件变化固化进镜像。`WORKDIR` 与 `COPY` 的精确语义官方也说得直白：

> The WORKDIR instruction sets the working directory for any RUN, CMD, ENTRYPOINT, COPY and ADD instructions that follow it in the Dockerfile. If the WORKDIR doesn't exist, it will be created even if it's not used in any subsequent Dockerfile instruction.（Docker Docs · Dockerfile reference）

把 `docker build` 摊开看是三步，五行清单在第二步被消费：

```text
[① 收材料]   CLI 把构建上下文目录整体打包交给引擎
    │
    ▼
[② 逐行装配] 从上到下执行清单，逐层叠加文件变化
    │
    ▼
[③ 打标入库] 写入元数据，按 -t 打 tag，存入本机镜像库
```

**COPY 的目录语义：拷的是内容，不是目录**

COPY 最容易想当然的一条规则，官方白纸黑字：

> If the source is a directory, the contents of the directory are copied, including filesystem metadata. The directory itself isn't copied, only its contents.（Docker Docs · Dockerfile reference）

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

这条语义正是整套配置能跑通的原因之一：nginx.conf 里 `root /home/cnsig/cnsig-ems-ui` 指向的目录下**直接就是 index.html**。由此产生本篇最重要的暗约定——**Dockerfile 的 COPY 目标路径与 nginx.conf 的 root 路径是同一件事的两个写法**，改动任何一边都必须同步另一边。它们分属两个文件、没有任何机制校验一致性，是前端镜像"容器活着但页面 404"的头号来源。

**点评：五行里只有三行承重**

用「删除实验」逐行检验——心里把这行划掉，预测什么会坏：`RUN mkdir` 划掉，什么也不坏（COPY 写绝对路径时自动创建目标目录，WORKDIR 也会自建目录）；`WORKDIR` 划掉，同样什么也不坏（后续 COPY 全是绝对路径，绝对路径不参考工作目录）。真正承重的只有 FROM 和两行 COPY——**FROM 提供 nginx 与它的默认行为，第一行 COPY 决定容器"怎么表现"，第二行 COPY 提供站点内容**。等价的最小版本：

```dockerfile
FROM nginx:stable-alpine
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./dist /home/cnsig/cnsig-ems-ui
```

模板瘦身对照：

反例——两行仪式性指令：

```dockerfile
FROM nginx:stable-alpine
RUN mkdir -p /home/cnsig/cnsig-ems-ui
WORKDIR /home/cnsig/cnsig-ems-ui
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./dist /home/cnsig/cnsig-ems-ui
# 两行仪式性指令：读清单的人会误以为
# 它们承担了什么
```

模板继承来的习惯写法不算错，但每行不承重的指令都会抬高阅读成本——清单越长，「哪行在起作用」越难判断。

正解——三行，每行都承重：

```dockerfile
FROM nginx:stable-alpine
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./dist /home/cnsig/cnsig-ems-ui
# 三行，每行都承重
```

行为与五行版完全一致。判断标准就一条：删掉这行，镜像会变吗？不变的行就该删。

顺带一个好消息：这套清单有内置安全网——如果构建时忘了先产出 dist（或目录为空），COPY 找不到源会**直接报错终止构建**，而不是打出一个空站点镜像。另外文件拷贝一律用 COPY 而非 ADD：官方参考对两者的评语是「功能相似、用途有别」，ADD 多出的远程 URL 下载与自动解压 tar 两个能力行为不可预期，最佳实践明确建议常规拷贝用 COPY。

> **记忆卡：FROM 定底座，COPY 定内容，root 与 COPY 目标必须一致**
> 五行清单里承重的三行：**FROM**（继承 nginx 程序 + 默认配置 + 启动命令）、**COPY conf → /etc/nginx/nginx.conf**（覆盖默认配置，决定容器行为）、**COPY dist → 站点目录**（拷的是内容不是目录，index.html 直接铺在目标下）。COPY 目标与 nginx root 是一对暗约定，改一边必改另一边。

**边界与陷阱**

四个高频坑：一个来自暗约定失守，两个来自对指令语义的想当然，一个来自对构建期环境的高估。

**坑 1：COPY 目标与 nginx root 不一致**

反例：

```dockerfile
# Dockerfile
COPY ./dist /usr/share/nginx/html
# nginx.conf（改版时 root 单独改了）
root /home/cnsig/cnsig-ems-ui;
# 结果：容器正常启动，所有页面 404
```

两个文件分属两处、构建不校验一致性——nginx 会以「配置合法」的姿态启动，只是静态文件目录里空空如也。

正解：

```dockerfile
# Dockerfile
COPY ./dist /usr/share/nginx/html
# nginx.conf
root /usr/share/nginx/html;
# 两边永远指向同一个目录
```

改动口诀：改 root 必改 COPY，改 COPY 必改 root。验收方式是在容器里 curl 首页，而非只看容器状态。

**坑 2：以为会拷出 dist 这层目录**

反例：

```dockerfile
COPY ./dist /home/cnsig/cnsig-ems-ui
# 以为镜像里是：
#   /home/cnsig/cnsig-ems-ui/dist/index.html
# 实际是：
#   /home/cnsig/cnsig-ems-ui/index.html
```

源是目录时拷的是目录的内容。想连 dist 这层目录一起拷，得写 `COPY ./dist /home/cnsig/cnsig-ems-ui/dist`。

正解——与 root 对齐的两种写法二选一：

```dockerfile
COPY ./dist /home/cnsig/cnsig-ems-ui
#   root /home/cnsig/cnsig-ems-ui;

COPY ./dist /home/cnsig/cnsig-ems-ui/dist
#   root /home/cnsig/cnsig-ems-ui/dist;
```

两种都对，关键是「COPY 落点」与「root 指向」逐字一致。拿不准时进容器 ls 一下落点，眼见为实。

**坑 3：在 nginx 镜像里 RUN pnpm build**

反例：

```dockerfile
FROM nginx:stable-alpine
COPY . /home/cnsig/cnsig-ems-ui
RUN pnpm install && pnpm build
# → /bin/sh: pnpm: not found
# 基础镜像里没有 Node，更没有 pnpm
```

构建期命令跑在基础镜像的环境里。nginx:stable-alpine 是个精简 Linux + nginx，没有 Node.js 运行时——前端构建无法在这里执行。

正解——两阶段各干各的：

```bash
# 前端构建在宿主机/CI 完成
$ pnpm build          # 产出 dist/
$ docker build .      # 清单里只 COPY dist
# 或用多阶段构建把两步装进一个清单：
# FROM node:22-slim AS build
# ... RUN pnpm build
# FROM nginx:stable-alpine
# COPY --from=build /app/dist /home/cnsig/cnsig-ems-ui
```

多阶段构建（multi-stage）是「一个清单、两个基础镜像」的标准解法：第一阶段有 Node 负责构建，第二阶段只搬运产物，最终镜像依旧精简。

**坑 4：用 ADD 拷常规文件**

反例：

```dockerfile
ADD https://example.com/robots.txt /home/cnsig/cnsig-ems-ui/
ADD ./assets.tar.gz /home/cnsig/cnsig-ems-ui/
# 前者：构建时发起一次远程下载（不可复现、不走缓存）
# 后者：自动解压——读清单的人看不出这层魔法
```

ADD 在 COPY 的基础上多了远程 URL 下载与本地 tar 自动解压两个隐藏行为，它们让清单的语义变隐晦、构建变得依赖外部网络。

正解：

```dockerfile
COPY robots.txt /home/cnsig/cnsig-ems-ui/
# 需要 tar 解压时，显式写出来：
COPY assets.tar.gz /tmp/
RUN tar -xzf /tmp/assets.tar.gz -C /home/cnsig/cnsig-ems-ui
```

官方对两者的评语是「功能相似、用途有别」——常规文件拷贝用 COPY，把所有魔法留在明面上。

**动手练习**

- 练习 1（暗约定、COPY）：安全要求站点文件挪到 `/srv/www`。给出需要改动的所有位置和改后的两行内容。
- 答案：两处：`Dockerfile` 的 `COPY ./dist /srv/www` 与 `nginx.conf` 的 `root /srv/www;`。只改一边就会出现"容器正常启动、页面 404"——COPY 落点与 root 指向必须逐字一致。改完 build 后进容器用 `curl localhost` 验证首页，而不是只看容器状态。
- 练习 2（COPY、语义）：想在站点根目录多放一个 `robots.txt`（它已存在于构建上下文里），在五行清单基础上加哪一行？
- 答案：`COPY robots.txt /home/cnsig/cnsig-ems-ui/robots.txt`。源是构建上下文里的单文件，目标是镜像内的绝对路径；因为 COPY 写绝对路径会自动补齐中间目录，它前面不需要任何 mkdir。放在两行 COPY 之间或之后都可以——robots.txt 很少变，放前面还能多吃到一层构建缓存。

**追问链**

五问从继承之谜问到装配与行为的分界。

**这份清单里没有任何「启动 nginx」的指令，容器启动后 nginx 是怎么跑起来的？**

FROM 继承的不只是文件系统，还有父镜像的元数据，其中包括启动命令（CMD/ENTRYPOINT）。nginx 官方镜像自带「以前台方式运行 nginx」的默认命令，子镜像没写就原样继承，所以容器启动时自动执行 nginx。换句话说，这份清单定制的是「装什么」，「怎么跑」完全是继承来的。

追问：用 docker inspect 镜像能看到继承来的 Cmd/Entrypoint 字段；机制细节见下一篇「继承与启动钩子」。

**RUN mkdir 建出来的目录，进容器后为什么能摸到？它和 docker exec 进去后手动 mkdir 有什么区别？**

RUN 在构建期执行，它造成的文件变化被固化进镜像层，之后从这个镜像启动的每一个容器都天生带着这个目录；docker exec 里的 mkdir 发生在运行期，只写入当前容器私有的可写层，容器销毁即消失，镜像和其他容器都不受影响。一句话：RUN 的产物归镜像（永久、共享），exec 的产物归容器（临时、私有）。

追问：这也解释了为什么「进容器改配置」救不了一个镜像的问题——见「边界与陷阱」里的可写层话题。

**dist 里是 index.html、assets/ 和 favicon.ico，COPY ./dist /app 之后，/app/dist 存在吗？为什么？**

不存在。COPY 的源是目录时，拷贝的是目录的内容——/app/index.html、/app/assets/、/app/favicon.ico 直接铺在目标下，dist 这层壳被剥掉了。这正是 nginx root 指向 /app 就能直接命中 index.html 的原因；如果误以为会多一层 dist，root 就会写错一级。

追问：想保留 dist 这层目录，写 `COPY ./dist /app/dist` 即可——目标目录不存在时 COPY 会自动创建。

**构建机上有 pnpm，为什么不能在 Dockerfile 里写 RUN pnpm build 一并构建？**

因为 RUN 的执行环境是基础镜像，不是构建机：nginx:stable-alpine 里没有 Node.js 也没有 pnpm，这条命令必然报 not found。构建机上的 pnpm build 与镜像构建是两个隔离的阶段，前者的产物（dist）通过 COPY 交接。想让清单自己完成前端构建，用多阶段构建：第一个 FROM 用 node:22-slim 装依赖并构建，第二个 FROM 用 nginx:stable-alpine，COPY --from=build 把 dist 搬过来。

追问：多阶段构建的最终镜像只含最后一个阶段的文件——node_modules、devDependencies 全部留在构建阶段，这正是它比「全塞一个 Node 镜像」优雅的原因。

**把 COPY conf 那一行整个删掉，镜像还能构建、容器还能跑吗？跑起来的是什么？**

能构建，也能跑——只是跑的是官方 nginx 的默认配置：80 端口、默认站点目录 /usr/share/nginx/html 的欢迎页。因为 COPY conf 是「覆盖默认配置」的动作，删掉它只是不覆盖，容器行为完全回落到继承的默认值。这个推演反过来是排查利器：如果容器里的页面是 Welcome to nginx，说明你的 nginx.conf 根本没生效（COPY 路径错、或 root 指错），而不是 nginx 挂了。

追问：同理可推，删掉 COPY dist，容器照样跑欢迎页；两行 COPY 全删，得到的就是原封不动的 nginx:stable-alpine。

延伸阅读：《Docker 的镜像、容器、仓库是什么关系？》（前置：三对象关系）、《为什么构建上下文越大 build 越慢？》（COPY 的 ./ 相对谁、.dockerignore 与层缓存的机制）。

### 为什么构建上下文越大 build 越慢？

*难度：进阶 ｜ 标签：docker build、构建上下文、dockerignore、层缓存*

**docker build 的第一步不是执行 Dockerfile，而是把整个构建上下文目录整体打包、上传给构建引擎**——COPY 只是事后从这份完整拷贝里挑文件，挑的动作发生在上传之后。所以上下文里有 1GB 的 node_modules，哪怕清单只 COPY 一个 2KB 的配置，这 1GB 也要先搬完。控制上下文两条路：**.dockerignore 黑名单**（在仓库根构建时排除 node_modules、.git）与**小目录白名单**（把 Dockerfile、conf、dist 放进一个干净目录作为上下文，CI 的标准做法）。装配阶段则靠**层缓存**提速：少变的指令放前面、常变的放后面，改一行只重做该行及其后。

**上下文：build 的第一步是搬运，不是装配**

命令末尾那个 `.` 大多数人都敲过，但它不是"Dockerfile 在哪"——它是**构建上下文**的路径：

> The build context is the set of files that your build can access.（Docker Docs · Build context）

为什么要把一个目录"交给"Docker？因为 Docker 是客户端-服务端架构：`docker build` 只是个客户端命令，真正干活的是构建引擎——在 macOS 上它甚至运行在一台 Linux 虚拟机里。你的本地文件对引擎而言是"墙外之物"，唯一能递进墙内的通道就是上下文上传。于是 build 的第一步注定是搬运：

```text
[本机目录（上下文）]        docker build .
    │
    ▼
[整体打包上传]              全部文件，先搬完
    │
    ▼
[构建引擎（守护进程/VM）]   收到完整上下文
    │
    ▼
[逐行执行 Dockerfile]      COPY 从中挑文件
```

这解释了一个所有人都见过却很少深究的现象：构建输出第一行 `Sending build context to Docker daemon 1.2GB`（legacy builder 的输出形态；Docker 23+ 默认的 BuildKit 打印的是 `transferring context: …MB`，两者是同一件事）之后的长久等待——那是在打包上传上下文，而此时 Dockerfile 一行都还没执行。COPY 与上下文的关系，官方一句话说清：

> Build instructions such as COPY and ADD can refer to any of the files and directories in the context.（Docker Docs · Build context）

注意方向：是上下文决定了 COPY 能拿到什么，而不是 COPY 决定上传什么。`COPY ../shared/xxx /app` 永远非法——上下文是一个被整体打包发送的目录，**它没有"上级目录"这个概念**。同理，构建机本机的其他路径（比如 /etc 下的文件）无论 Dockerfile 怎么写都拿不到，这是刻意的安全边界。

**.dockerignore：打包前的黑名单**

控制上下文体积的第一种手段是在上下文根目录放一个 .dockerignore——语法与 .gitignore 高度相似，但作用对象完全不同：它过滤的不是"进版本库的文件"，而是"进构建的文件"：

> You can use a .dockerignore file to exclude files or directories from the build context. This helps avoid sending unwanted files and directories to the builder, improving build speed.（Docker Docs · Build context）

两层收益。第一层是**速度**：把 node_modules（几十万个小文件）、.git（整个提交历史）排除掉，上传从 GB 级降到 MB 级。第二层是**安全**：上下文里的文件"有资格"被任何一条 COPY 引用——.git 里有完整提交历史、.env 里可能有密钥，今天清单没碰它们不代表明天没人加一行 `COPY . .`。黑名单挡住的不是今天的构建，是未来某次手滑的原料。

**白名单：小目录上下文，CI 的标准做法**

另一种思路更彻底——上下文目录本身就是白名单：把构建需要的文件（Dockerfile、conf、dist）挑进一个干净的小目录，**只把这个目录作为上下文**。真实项目里 CI 正是这么干的：

```bash
# CI 流水线里的真实两步：
cp -r apps/web-antd/dist docker/     # ① 只把 dist 拷进 docker/ 目录
docker build ... docker/             # ② 上下文 = docker/，
                                     #    里面只有 Dockerfile、conf/、dist/
```

此时 `docker/` 目录里**只有**构建需要的四样东西，node_modules 根本没资格上车——连 .dockerignore 都不需要存在。白名单的取舍是：多一步"挑选"的仪式（CI 里就是一行 cp），换来上下文的绝对纯净。对比两种风格：

| 维度 | .dockerignore 黑名单 | 小目录白名单 |
|---|---|---|
| 形态 | 仓库根做上下文 + 排除清单 | 专门的干净目录做上下文 |
| 心智 | 全部有资格，按名单剔除 | 挑出来的才有资格 |
| 风险 | 漏排除的文件照样上车 | 少拷文件会在构建时报错（显性失败） |
| 适用 | 单仓库根目录直接构建的日常开发 | CI 流水线、对纯净度要求高的正式构建 |
| 组合 | 两者并用：小目录 + 兜底 ignore | 同左 |

**层缓存：清单顺序为什么有讲究**

上下文搬完之后才轮到装配。装配阶段每条指令产生一个层，而缓存以**指令 + 输入**为键：某条指令与它的输入和上次构建完全一致，这层直接复用；一旦失效，**该行及其后所有行**全部重做。用"只改了 dist 的一次重新构建"推演一遍：

- `FROM nginx:stable-alpine`：基础镜像没变，命中缓存，瞬间完成。
- `COPY ./conf/nginx.conf /etc/nginx/nginx.conf`：对比上下文里的 conf/nginx.conf：内容没改，命中缓存，复用。
- `COPY ./dist /home/cnsig/cnsig-ems-ui`：对比上下文里的 dist/：文件变了，这层失效——重新执行 COPY，产出新的文件层。
- 后续所有指令：缓存链到这里已断，本行之后（若还有）的每一层都要重做。本清单只有三行，损失到此为止。

推演暴露的规则可以提炼成一条排序原则：**少变的指令放前面，常变的放后面**。conf 和清单本身很少动，dist 每次构建都变——把 dist 的 COPY 放最后，改动只烧掉一层；反过来若把 `COPY . .`（最容易变的）放在开头，后面所有层每次都陪葬。这条原则在 Node 后端镜像上收益巨大（依赖安装行放最前，package.json 不变就永远命中），对前端三行清单收益虽小，习惯值得现在养成。

> **记忆卡：上下文是入场费，缓存按「指令 + 输入」复用**
> build 第一步把上下文**整体打包上传**，COPY 从中挑文件是上传之后的事——上下文体积决定下限，与清单内容无关。控制手段：.dockerignore 黑名单（速度 + 安全双重收益）或干净小目录白名单。层缓存按「指令 + 输入」命中，一处失效其后全断：**少变在前，常变在后**。

**边界与陷阱**

三个高频坑分别对应速度、作用域、安全三个维度——共同点都是"上下文"这个概念没落地。

**坑 1：仓库根直接 build，node_modules 全程陪跑**

反例——无 ignore 的重上下文：

```bash
$ docker build .
Sending build context to Docker daemon  1.2GB
# 卡在第一行半分钟：node_modules（几十万小文件）
# + .git（全部历史）正在被逐个打包上传
```

清单只 COPY dist 也救不了——上传发生在 COPY 之前。上下文体积是入场费，与清单写了什么无关。

正例——.dockerignore 排除：

```bash
# .dockerignore
node_modules
.git
dist
.turbo
*.md
# 排除后重新 build：
Sending build context to Docker daemon  13.2MB
```

一行 .dockerignore 把入场费砍掉两个数量级。dist 也排除——它应该由 CI 挑进干净目录，而不是混在源码上下文里。

**坑 2：.dockerignore 只管它所在的那个上下文**

反例：

```bash
# 仓库根/.dockerignore 写了排除 dist
$ cp -r apps/web-antd/dist docker/
$ docker build ... docker/
# 想当然：dist 被根目录的 ignore 排除了？
# 实际：docker/ 这个上下文里根本没读过
# 根目录的 .dockerignore
```

.dockerignore 只对「与它同处一层的上下文根」生效。build docker/ 时引擎读的是 docker/.dockerignore，仓库根那份管不到。

正例：

```bash
# 白名单目录自带纯净性，无需 ignore：
$ cp -r apps/web-antd/dist docker/
$ docker build ... docker/
# docker/ 里只有 Dockerfile、conf/、dist/
# 若确有需要，在 docker/ 下再放专属 .dockerignore
```

判断方法永远是「这次的上下文目录是谁」——ignore 跟着上下文根走，不跟着仓库根走。

**坑 3：敏感文件躺在上下文里**

反例：

```bash
# 仓库根直接 build，未排除：
#   .env.production   → 含后端地址与密钥
#   .git/             → 全部提交历史
$ docker build -t app:1.0 .
$ docker push registry.corp/app:1.0
# 镜像推上私服，全公司都能 pull
```

这些文件今天没被 COPY 进镜像，但它们「有资格」——哪天有人加一行 `COPY . .`（Node 镜像的标准写法），秘密就随镜像分发给所有能 pull 的人。

正例：

```bash
# .dockerignore 里显式挡掉危险原料
.git
.env*
*.pem
secrets/
# 同时：白名单小目录构建，敏感文件物理上进不了上下文
```

黑名单防手滑，白名单断根源。两者一起上：CI 用小目录构建，开发用带 ignore 的仓库根构建。

**动手练习**

- 练习 1（上下文、体积）：仓库根目录下：`src/` 10MB、`dist/` 3MB、`node_modules/` 200MB、`.git/` 50MB，Dockerfile 只有一行 `COPY ./dist /app`。① 无 .dockerignore 时上传多少？② 排除 node_modules 与 .git 后呢？③ 由此推算 CI 用 `docker/` 小目录（Dockerfile 2KB + conf 2KB + dist 3MB）构建的上传量。
- 答案：① 263MB 全部上传——COPY 挑的 3MB 不改变入场费；② 13MB（src + dist）；③ 约 3MB——白名单目录里只有构建必需品，这也是 CI 构建通常比开发机快得多的原因之一。
- 练习 2（上下文边界、COPY）：两个前端应用想共用 `packages/shared/` 里的公共文件，Dockerfile 里写 `COPY ../packages/shared/ /app/shared` 会发生什么？正确做法是什么？
- 答案：非法：`../` 试图越过上下文根，引擎不会放行——上下文被发送后是自成一体的目录树，没有"上级"。正确做法是把共用工件在构建前置步骤里拷进各自应用的上下文目录（比如 CI 里 `cp -r packages/shared web-app/`），或者干脆从 monorepo 根构建、让上下文覆盖整个仓库（代价是必须配好 .dockerignore）。

**追问链**

五问从命令参数问到缓存失效的精确规则。

**docker build -f deploy/Dockerfile . 里的 -f 和末尾的 . 分别指定什么？**

末尾的 `.` 指定构建上下文路径（把哪个目录整体交给引擎），`-f` 指定 Dockerfile 文件本身的位置，两者独立。所以 `-f deploy/Dockerfile .` 的含义是：清单在 deploy/ 目录里找，但上下文仍是当前目录——COPY 只能引用当前目录树里的文件，引用不到 deploy/ 之外没被包含的内容（若 deploy/ 在当前目录内则可以）。

追问：想换 Dockerfile 又不想混目录，常见写法是把清单放子目录、上下文仍指根：`docker build -f docker/Dockerfile .`——此时根目录的 .dockerignore 生效。

**.dockerignore 和 .gitignore 排除了同一批文件，它们是一回事吗？**

不是。.gitignore 作用于提交：排除的文件不进版本库，但可以继续躺在你本机磁盘上；.dockerignore 作用于构建上传：被排除的文件不进上下文，哪怕它们好好地躺在磁盘上、甚至已提交进仓库。极端情况：dist 被 .gitignore 排除（不进库），但构建时若没被 .dockerignore 排除，照样会被上传——两条管线互不越界。

追问：CI 的干净检出只有 .gitignore 之外的文件，所以「CI 构建上下文比开发机小」几乎是必然的，除非有人把产物提交进了库。

**Dockerfile 只 COPY 一个 2KB 的 nginx.conf，为什么上下文 1GB 时构建还是明显变慢？**

因为上传先于装配：build 的第一步是把上下文整体打包发送给引擎，1GB 的 node_modules 和 .git 一个字节都少不了；COPY 的「挑选」发生在引擎收到完整上下文之后。上下文体积是无论清单怎么写都躲不掉的固定成本，唯一解法是在打包之前就瘦身——.dockerignore 或干净小目录。

追问：小文件多比总字节数更致命：几十万个小文件的打包开销（逐个 stat、压缩）远超同样大小的几个大文件，node_modules 正是重灾区。

**层缓存的失效规则精确地说是什么？为什么改了 dist，后面的指令全部重做？**

每条指令的缓存键是「指令内容 + 输入」（COPY 层对源文件做内容校验和，RUN 层看命令字符串）。逐行比对时，某行与上次不一致，该行失效并重新执行；更重要的是它**之后的所有行**全部视为失效——哪怕那些行的输入完全没变。因为层是叠加的，地基变了上面的层无法原样复用。这就是「少变在前、常变在后」能省钱的原因。

追问：FROM 层的缓存键是基础镜像的摘要——官方镜像更新后，哪怕你的清单一字未改，全量重建也可能发生，这是「今天 build 突然变慢」的常见解释。

**CI Runner 是一台全新的干净机器，一条缓存都不会命中，那指令顺序还有意义吗？**

单看一台干净机器，首次构建确实全部 miss，顺序不影响这一次的耗时；但 CI 平台普遍支持构建缓存的导出与恢复（如 buildx 的 --cache-to/--cache-from 把层缓存推到仓库或对象存储），下次构建恢复后顺序原则立即生效——少变的行直接命中。此外顺序原则还有不依赖缓存的价值：少变的在前让清单的「不稳定部分」被压缩到末尾，读清单与定位问题都更容易。

追问：另一个工程化选择：把「装依赖」这类最贵又最稳定的步骤拆成独立镜像（基础镜像），上层镜像继承它——把缓存固化成了制品。

延伸阅读：《5 行的 Dockerfile 是怎么变成镜像的？》（前置：清单四指令逐行拆解，COPY 目标与 nginx root 的暗约定）、《FROM 官方镜像后，默认行为是怎么保留的？》（FROM 的完整继承规则与容器启动钩子）。

### FROM 官方镜像后，默认行为是怎么保留的？

*难度：进阶 ｜ 标签：FROM、ENTRYPOINT、CMD、启动钩子、继承*

**FROM 继承的是全套家当**：父镜像的文件系统加上它的全部元数据（ENV、EXPOSE、WORKDIR、ENTRYPOINT、CMD、STOPSIGNAL……）。覆盖规则是**同键覆盖、后写者赢**——用前端的话说就是浅合并 `{ ...parent, CMD: myCmd }`，没写的键原样保留。容器启动时 Docker 把 **ENTRYPOINT 和 CMD 拼成一条命令执行**；nginx 官方镜像的 ENTRYPOINT 是一个钩子脚本，先依次运行 /docker-entrypoint.d/ 下的初始化脚本、再把控制权交给 nginx——这就是"清单里没写启动命令，容器却自动跑起来"的完整答案。

**继承的不是文件系统，是全套家当**

用一份真实的清单做删除实验：把 `COPY conf` 和 `COPY dist` 都删掉，只留 FROM——构建照样成功，容器照样启动欢迎页。文件没带进来，行为却全在：因为随 FROM 传下来的还有一层看不见的东西——**元数据**。它决定了默认环境变量、暴露端口、工作目录、启动命令。这不是理论推演，nginx 官方镜像自己就是活案例——它也是分层继承的：

```dockerfile
# nginx:stable-alpine 的清单（简化）：
FROM nginx:1.30.4-alpine-slim     ← ENTRYPOINT/CMD 不在这一层！
ENV NJS_VERSION=...

# 而 ENTRYPOINT 等定义在它的父层 alpine-slim 里：
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80
STOPSIGNAL SIGQUIT
COPY docker-entrypoint.sh /
COPY 10-listen-on-ipv6-by-default.sh /docker-entrypoint.d/
COPY 20-envsubst-on-templates.sh /docker-entrypoint.d/
...
```

你的前端镜像 FROM stable-alpine，stable-alpine FROM alpine-slim——ENTRYPOINT 和 CMD **隔着两层照样传到你手里**。整个继承链像一摞透明的玻璃片：每一层只画自己的增量，从顶往下看，看到的是所有层叠加后的合并视图；某层没画的部分，露出的是底下的图案：

```text
自上而下叠加：上层遮罩同路径的下层文件，元数据后写者赢

┌─ 你的清单（COPY conf + dist）
│    只贡献 2 个文件层，元数据一条没写 → 全盘继承
├─ nginx:1.30.4-alpine-slim 之上加装 nginx 的层
│    安装 nginx；ENTRYPOINT / CMD / EXPOSE 80 / STOPSIGNAL 在这一层声明
└─ alpine 底座
     约 8MB 的精简 Linux 根文件系统
```

覆盖规则也和浅合并一致：你的清单写哪条元数据，哪条就以后写的值为准；一条不写，全部沿用父镜像。官方对「同键冲突」的裁决规则（LABEL 一节原文，ENV/EXPOSE 等其余元数据同规则）——

> If a label already exists but with a different value, the most-recently-applied value overrides any previously-set value.（Docker Docs · Dockerfile reference）

用 JS 的心智模型写出来就是一行：`const child = { ...parent, CMD: myCmd }`——只覆盖明确给出的键，其余键（包括启动命令）原样继承。

**启动命令：ENTRYPOINT 与 CMD 的分工**

容器启动时，Docker 把两者拼成一条完整命令执行。它们的官方定位：

> The purpose of a CMD is to provide defaults for an executing container. There can only be one CMD instruction in a Dockerfile.（Docker Docs · Dockerfile reference）
>
> An ENTRYPOINT allows you to configure a container that will run as an executable.（Docker Docs · Dockerfile reference）

分工可以记成：**ENTRYPOINT 是固定主程序，CMD 是默认参数**。nginx 镜像的教科书示范：`ENTRYPOINT ["/docker-entrypoint.sh"]` + `CMD ["nginx", "-g", "daemon off;"]`——主程序是钩子脚本，默认参数是把 nginx 拉起来。而 `docker run` 时在镜像名后面敲的内容，会**顶替 CMD 的位置**，ENTRYPOINT 纹丝不动：

> Command line arguments to docker run will be appended after all elements in an exec form ENTRYPOINT, and will override all elements specified using CMD.（Docker Docs · Dockerfile reference）

docker run 传参对照：

| 你敲的命令 | 容器里实际执行 | 说明 |
|---|---|---|
| docker run nginx | /docker-entrypoint.sh nginx -g daemon off; | 默认值：ENTRYPOINT + CMD 原样拼接 |
| docker run nginx nginx -t | /docker-entrypoint.sh nginx -t | 命令行参数顶替 CMD，主程序不动（验证配置的经典用法） |
| docker run --entrypoint sh nginx | sh | --entrypoint 连主程序都换掉，调试镜像时用 |

**启动钩子：docker-entrypoint.sh 在忙什么**

nginx 镜像的启动命令主角不是 nginx，而是那个钩子脚本。它干两件事：先**按文件名顺序**执行 /docker-entrypoint.d/ 目录下的所有初始化脚本，最后用 `exec` 把自己替换成 nginx。四个官方脚本各管一件事：

```text
Docker 引擎 ──── 启动容器：执行 ENTRYPOINT（PID 1）────▶ docker-entrypoint.sh
docker-entrypoint.sh ── 按文件名顺序执行初始化脚本 ──▶ entrypoint.d/*.sh
entrypoint.d/*.sh ── 10-ipv6 / 20-envsubst / 30-worker 完成 ──▶ docker-entrypoint.sh
docker-entrypoint.sh ── exec nginx -g daemon off;（进程替换）──▶ nginx
nginx ──── 前台运行，监听 80 端口 ────▶ Docker 引擎
```

两个细节值得盯住。**其一，daemon off**：nginx 默认会把自己变成后台守护进程，而容器的生命线是 PID 1 进程——主进程一退容器就停。所以容器里必须让 nginx 前台运行，这条参数不是风格偏好，是容器化 nginx 的生死线。**其二，exec 与信号**：官方用 exec 形式书写启动命令，理由官方文档说得清楚——

> Using the exec form doesn't automatically invoke a command shell. This means that normal shell processing, such as variable substitution, doesn't happen.（Docker Docs · Dockerfile reference）

不经 shell 包裹，nginx 就是容器里的 PID 1，`docker stop` 发出的停止信号直达它本人；nginx 镜像还声明了 `STOPSIGNAL SIGQUIT`——对 nginx 来说这是"处理完存量请求再退"的优雅退出信号。整个停机链路：引擎发 SIGQUIT → PID 1（nginx）收到 → 现有请求处理完 → 进程退出 → 容器停止，全程无强杀。

> **记忆卡：完整启动命令 = ENTRYPOINT + CMD，元数据同键覆盖**
> FROM 传家当：文件系统 + 全部元数据，覆盖规则 = `{ ...parent, ...mine }` 浅合并。启动 = ENTRYPOINT（主程序）+ CMD（默认参数）拼接；`docker run 镜像 参数` 顶替 CMD，`--entrypoint` 才换主程序。nginx 镜像的 ENTRYPOINT 是钩子脚本：先跑 /docker-entrypoint.d/*.sh 再 exec nginx；daemon off + exec form + STOPSIGNAL SIGQUIT 三件套保证"前台可活、停机优雅"。

**边界与陷阱**

三个高频坑都在"覆盖与信号"这条线上——覆盖了不该覆盖的元数据，或者让信号送不到该收的人手里。

**坑 1：写 CMD 调试，忘了它已经顶掉 nginx**

反例——silent override：

```dockerfile
# 想在镜像里保留个调试入口，加了一行：
FROM nginx:stable-alpine
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./dist /home/cnsig/cnsig-ems-ui
CMD ["sleep", "3600"]
# 推上仓库后：容器起来了，页面全挂
# —— nginx 从未被启动
```

CMD 顶替的是父镜像的默认参数，这次顶替的直接后果是「没人去启动 nginx 了」。容器活着 ≠ 服务活着。

正例——清单里永远不写调试用 CMD：

```bash
# 临时调试用 run 参数，不进镜像：
$ docker run --rm -it --entrypoint sh my-image
/# nginx -t && ls /home/cnsig/cnsig-ems-ui
```

清单是交付物，调试是现场行为——用 --entrypoint 和 run 参数满足临时需求，镜像保持与父镜像一致的默认启动。

**坑 2：shell 形式的 CMD，让优雅停机失效**

反例：

```dockerfile
# 看起来等价的一行改动：
CMD nginx -g "daemon off;"
# 实际执行的是：/bin/sh -c "nginx -g ..."
# PID 1 是 sh，nginx 只是它的子进程
# docker stop → SIGQUIT 发给 sh → 被无视
# 10 秒后 SIGKILL 强杀，存量请求被腰斩
```

shell 形式会多包一层 sh -c，信号发给了不转发信号的 shell——10 秒宽限期后所有未完成的请求被硬切。

正例：

```dockerfile
# exec 形式（数组写法），nginx 亲自当 PID 1：
CMD ["nginx", "-g", "daemon off;"]
# docker stop → SIGQUIT 直达 nginx
# → 处理完存量请求 → 优雅退出
```

官方镜像全部使用 exec 形式正是为了信号链路。判断口诀：看到不带数组的 CMD，先想一层「谁在当 PID 1」。

**坑 3：把 EXPOSE 当成端口开关**

反例：

```dockerfile
# 「容器访问不通，是不是清单里
#  忘了 EXPOSE 8080？」
EXPOSE 8080
# 加了这行，访问还是不通；
# 反过来删掉 EXPOSE 80，80 端口照样通
```

EXPOSE 是文档性元数据：声明「本镜像约定使用哪个端口」，供人阅读和工具提示，不建立也不封锁任何网络通路。

正例：

```bash
# 端口通不通由映射决定：
$ docker run -d -p 8080:80 nginx:stable-alpine
# 宿主机 8080 → 容器 80
# K8s 里则由 Service/containerPort 决定
```

排查端口问题的正确位置是运行时配置（-p / Service），不是清单里的 EXPOSE——它只是说明书的一行。

**动手练习**

- 练习 1（inspect、拼接）：用 `docker inspect nginx:stable-alpine` 查到 `Entrypoint: ["/docker-entrypoint.sh"]`、`Cmd: ["nginx", "-g", "daemon off;"]`。写出容器启动时实际执行的完整命令，并回答 `docker run my-image nginx -v` 会执行什么、还能看到页面吗。
- 答案：完整命令：`/docker-entrypoint.sh nginx -g "daemon off;"`（钩子脚本最终 exec 成 nginx）。执行 `docker run my-image nginx -v` 时，命令行参数顶替 CMD：实际执行 `/docker-entrypoint.sh nginx -v`——钩子照常运行，随后 exec 成 `nginx -v` 打印版本号退出，容器随之停止。没有任何 nginx 服务在跑，自然也看不到页面——这是一次性的"跑完即退"。
- 练习 2（钩子、初始化）：团队要求每次容器启动时先向配置中心注册自己（跑一段 `register.sh`）。不动 ENTRYPOINT、不改官方脚本，只改自己的清单，怎么接入？
- 答案：利用钩子机制：把脚本放进清单并丢进钩子目录——`COPY register.sh /docker-entrypoint.d/40-register.sh`。官方入口脚本会按文件名顺序执行 /docker-entrypoint.d/ 下的所有脚本，40 号排在官方四个脚本之后、exec nginx 之前，正好完成"注册后开机"的时序。命名前缀（40-）就是执行顺序，这是这套机制最优雅的地方：不改任何既有文件，靠目录约定插入自己的逻辑。

**追问链**

五问从元数据拼接到继承规则的特例。

**一份前端镜像清单 FROM 官方 nginx 后一行元数据都没写，它是怎么做到「启动即服务」的？**

启动行为由父镜像的 ENTRYPOINT 与 CMD 定义：前者是钩子脚本 /docker-entrypoint.sh，后者是 nginx -g daemon off;。子镜像一条元数据没写，浅合并后两个键原样保留，容器启动即执行钩子 → exec nginx 前台运行。清单里的两行 COPY 只是往文件系统里加了自己的文件，对行为零改动。

追问：docker history 能看到每一层：元数据指令表现为 0B 的层——它们不改文件，只改「身份」。

**docker run my-image echo hello 会不会启动 nginx？输出什么？**

不会启动 nginx。命令行参数 echo hello 顶替的是 CMD 的位置，ENTRYPOINT 保留：实际执行 /docker-entrypoint.sh echo hello。钩子脚本照常初始化，最后一行 exec "$@" 把自己替换成 echo hello，输出 hello 后进程退出、容器停止。整个过程 nginx 二进制从未运行。

追问：想让容器既执行自己的命令又不经过钩子脚本，用 `--entrypoint echo my-image hello` 直接换主程序。

**daemon off; 这条参数删掉会怎样？为什么容器里必须前台运行？**

nginx 默认会 fork 出后台守护进程、把控制终端交还——如果放任它这么做，容器里的 PID 1（启动脚本）执行完启动命令就退出了，PID 1 一退容器立即停止，表现为「容器启动即退出」。daemon off 禁用了守护进程化，让 nginx 本体留在前台充当常驻进程。通用法则：容器的主进程必须是前台进程，容器的寿命 = PID 1 的寿命。

追问：排查「容器秒退」第一件事就是 docker logs 看主进程说了什么，其次确认启动命令是不是一个会退出的短命命令。

**docker stop 时停止信号是谁发给谁的？写清单时怎么保证它能送到业务进程手里？**

docker stop 先向容器的 PID 1 发送 STOPSIGNAL 指定的信号（nginx 镜像配的是 SIGQUIT，对 nginx 意为优雅退出），等一个宽限期（默认 10 秒）后仍未退出才 SIGKILL 强杀。信号只能被 PID 1 接收——所以必须保证业务进程自己就是 PID 1：用 exec 形式写 CMD/ENTRYPOINT，不用 shell 形式（shell 形式下 PID 1 是 sh，它默认不转发信号给子进程）。

追问：必须用 shell 形式做变量展开时，在命令前加 exec（如 CMD exec nginx ... 写进 sh -c 里），用 exec 替换让业务进程接管 PID 1；或调大 docker stop -t 的宽限期。

**「元数据继承 = 浅合并」有没有例外？子镜像写一行 ENTRYPOINT 后，父镜像的 CMD 会怎样？**

有例外。官方规则明确：If CMD is defined from the base image, setting ENTRYPOINT will reset CMD to an empty value——子镜像一旦声明 ENTRYPOINT，父镜像的 CMD 会被清空而不是保留。原因是两者语义上要拼成一条命令：既然你换了主程序，父镜像的默认参数多半不再适配，Docker 选择清空以防「新主程序 + 旧参数」的错配。想保留参数就必须在新清单里重写 CMD。

追问：官方给的最佳组合：两条例子都用 exec 形式（ENTRYPOINT ["app"] + CMD ["--default"]），并用 `docker run 镜像 --help` 这类方式验证默认参数是否仍然适配新主程序。

延伸阅读：《为什么构建上下文越大 build 越慢？》（上下文、黑白名单与层缓存——清单之外的构建机制）、《没有外网的服务器怎么拿到 Docker 镜像？》（save/load 离线搬运全流程，与 export/import 的经典考点）。

## 镜像与制品仓库

### Docker 的镜像、容器、仓库是什么关系？

*难度：入门 ｜ 标签：Docker、镜像、容器、镜像仓库、tag*

**三个对象是一条流水线上的三个角色：镜像是只读的标准化软件包**，打包了运行一个应用所需的全部文件；**容器是这个包跑起来的隔离进程**，一个镜像可以同时派生任意多个容器；**仓库是集中存取与分发镜像的服务**，`docker push` 上传、`docker pull` 下载，分工等同 npm 的 publish / install。完整镜像名由**仓库地址 / 镜像名 : tag** 三段拼成，每一段都有默认值，漏写就会落到公共仓库或 latest 标签上。一句话分工：**仓库管存取，镜像管内容，容器管运行**。

**三个对象各管一件事**

镜像是磁盘上的一份静态产物。官方文档给的定义是——

> A container image is a standardized package that includes all of the files, binaries, libraries, and configurations to run a container.（Docker Docs · What is an image?）

翻译成前端熟悉的东西：镜像 ≈ npm 上下载下来的那个包（tarball）——它是一个**只读的、自包含的成品**，nginx 程序、精简 Linux 底座、你的静态文件全在里面，本身并不运行。容器则是这个包"跑起来"的状态：官方把容器定义为**隔离的进程**——

> Simply put, containers are isolated processes for each of your app's components.（Docker Docs · What is a container?）

类比面向对象：**镜像 ≈ 类，容器 ≈ 实例**。同一个镜像可以同时 `new` 出三个容器（三个 nginx 实例），互相独立、互不知晓；删掉任何一个容器，镜像毫发无损，随时再起一个。两者的维度对照：

| 维度 | 镜像 image | 容器 container |
|---|---|---|
| 本质 | 只读的文件包（磁盘上的静态产物） | 运行中的隔离进程（基于镜像 + 一层可写层） |
| 数量关系 | 一个镜像可派生任意多个容器 | 每个容器必须基于某个镜像启动 |
| 删除后果 | rmi 删掉后无法再派生实例 | rm 只删运行实例和可写层，镜像不受影响 |
| 类比 | npm 包（tarball） | 依赖装好后跑起来的进程 |
| 查看命令 | docker images | docker ps |

**镜像名三段式：漏一段就换一个世界**

拿一个典型的企业内网镜像名逐段拆——部署脚本里最常见的写法就是把三个变量拼起来：`112.26.45.227:10001/cnsig-ems-ui:1.0.0`。三段各有职责，也各有默认值：

| 段 | 本例中的值 | 省略时的默认 |
|---|---|---|
| 仓库地址（registry host） | 112.26.45.227:10001 | 官方仓库 docker.io |
| 命名空间 / 镜像名 | cnsig-ems-ui | docker.io 上无命名空间时归官方 library/ 所有 |
| 版本标签（tag） | 1.0.0 | latest |

也就是说你随手写的 `nginx:stable-alpine`，完整形态其实是 `docker.io/library/nginx:stable-alpine`——不写仓库地址时默认去公共仓库拉：

> If no host is specified, Docker's public registry at docker.io is used by default.（Docker Docs · Build, tag, and publish an image）

最值得警惕的是第三段。`latest` 不是"最新的稳定版"这个官方概念，仅仅是一个**默认标签**——一个会漂移的指针：同名 tag 重新推送一次，它就指向新的内容，昨天和今天拉到的"同一个镜像"可能是两回事，出问题时你甚至说不清线上跑的是哪个版本。所以成熟团队的部署脚本都强制显式传版本号（比如 `-v 1.0.0`），把"这次部署到底是什么"钉死。

**仓库：镜像世界的 npm registry**

仓库（registry）是集中存放镜像的服务，push / pull 与 npm 的 publish / install 完全对应。业务镜像通常推到公司内网自建的私服（如 `112.26.45.227:10001`）而不是公共 Docker Hub——镜像里是业务代码与内部配置，推公共仓库等于公开源码。围绕三对象的最小命令集一共六条：

```bash
# ① 登录私服：推镜像的前提，凭证存在本机 ~/.docker/config.json
$ docker login 112.26.45.227:10001
Username: deployer
Password: ********
Login Succeeded

# ② 下载镜像到本地（≈ npm install）
$ docker pull 112.26.45.227:10001/cnsig-ems-ui:1.0.0
1.0.0: Pulling from cnsig-ems-ui
Digest: sha256:9f2a1c...c41d
Status: Downloaded newer image for 112.26.45.227:10001/cnsig-ems-ui:1.0.0

# ③ 查看本地镜像：REPOSITORY 列是完整名，TAG 是版本
$ docker images
REPOSITORY                            TAG             IMAGE ID       CREATED      SIZE
112.26.45.227:10001/cnsig-ems-ui      1.0.0           3f8a12d9b7c1   2 days ago   46MB
nginx                                 stable-alpine   9cee1a8caa02   3 weeks ago  43MB

# ④ 删除本地镜像：正被某个容器使用时会拒绝删除
$ docker rmi 112.26.45.227:10001/cnsig-ems-ui:1.0.0
Untagged: 112.26.45.227:10001/cnsig-ems-ui:1.0.0
```

```bash
# ⑤ 把本地镜像推上仓库（≈ npm publish）
$ docker push 112.26.45.227:10001/cnsig-ems-ui:1.0.0
The push refers to repository [112.26.45.227:10001/cnsig-ems-ui]
1.0.0: digest: sha256:9f2a1c...c41d size: 1571

# ⑥ 启动容器：把镜像跑起来（-p 把宿主机 8080 端口映射到容器的 80）
$ docker run -d -p 8080:80 112.26.45.227:10001/cnsig-ems-ui:1.0.0
a1b2c3d4e5f6
```

注意 ⑤ 之前必须先完成 ① 的 `docker login`——推送是要身份的：

> Before you're able to push an image to a repository, you will need to be authenticated.（Docker Docs · Build, tag, and publish an image）

**不可变：镜像最重要的性质**

三对象里还有一条贯穿一切的规则，官方一句话说死：

> Images are immutable. Once an image is created, it can't be modified. You can only make a new image or add changes on top of it.（Docker Docs · What is an image?）

**镜像一旦生成不可修改**。它带来三个直接后果：其一，可追溯——`1.0.0` 永远是那次构建出来的样子，线上出问题拉同一个 tag 就能复现；其二，更新的唯一方式是**造一个新镜像**（这正是 Dockerfile 与构建流程的用武之地）；其三，运行中的容器里做的任何改动都**不会落回镜像**，容器销毁即消失——这是"改了容器里的配置文件、重启后又变回去"这类灵异现象的唯一真相。

> **记忆卡：仓库管存取，镜像管内容，容器管运行**
> 镜像是只读的标准化软件包（immutable，更新＝造新镜像）；容器是镜像跑起来的隔离进程（类与实例，一个镜像派生 N 个容器）；仓库是存取与分发的服务（push ≈ publish，pull ≈ install）。镜像名三段式 `仓库地址/镜像名:tag`，三段都有默认值：`docker.io`、`library/`、`latest`——**漏写的段不会报错，只会悄悄改变目的地**。

**边界与陷阱**

三个最高频的翻车点，全部源于"三段式默认值"和"不可变"这两件事没吃透——它们共同的特点是**不报错、只悄悄出错**。

**坑 1：用 latest 部署，版本漂移无从追溯**

反例：

```bash
$ docker build -t cnsig-ems-ui .
$ docker push cnsig-ems-ui
# 两次构建推的都是 latest
# 线上出问题想回滚？不知道该回到哪
```

latest 只是个默认标签，永远指向最近一次推送——两次构建之间它的指向可能已经变了，回滚失去锚点。

正例：

```bash
$ docker build -t 112.26.45.227:10001/cnsig-ems-ui:1.0.0 .
$ docker push 112.26.45.227:10001/cnsig-ems-ui:1.0.0
# 版本号来自 CI 的 tag 或构建号，可回滚可追溯
```

部署镜像强制显式版本号（语义化版本或构建号），让每一次线上运行都对应一个明确的、不可变的镜像。

**坑 2：推送目标由镜像名第一段决定，与登录过谁无关**

反例：

```bash
$ docker login 112.26.45.227:10001   # 登录了私服
$ docker push cnsig-ems-ui:1.0.0        # 推的时候漏了前缀
# 实际推往 docker.io/cnsig-ems-ui:1.0.0
# → 要么没权限被拒，要么业务镜像被公开
```

登录信息不会改变推送目的地。名字第一段没有仓库地址，Docker 就按默认值去 docker.io——对业务镜像而言，这要么是失败，要么是事故。

正例：

```bash
$ docker tag cnsig-ems-ui:1.0.0 112.26.45.227:10001/cnsig-ems-ui:1.0.0
$ docker push 112.26.45.227:10001/cnsig-ems-ui:1.0.0
# 先补全名再推送，或干脆 build 时就打全名
```

写部署脚本时让镜像名从第一个字符起就是完整三段式，杜绝事后补名这个环节。

**坑 3：把容器当镜像改，重启后改动蒸发**

反例：

```bash
$ docker exec -it my-app sh
/# vi /etc/nginx/nginx.conf   # 改好配置，服务正常
/# exit
$ docker rm -f my-app && docker run ...
# 配置回到旧值——改动全部蒸发
```

exec 进容器做的修改只存在于容器的可写层；容器销毁，可写层随之销毁。下一次 run 是从不可变镜像重新长出来的全新环境。

正例：

```bash
# 改动的正路：配置进版本库
$ vi conf/nginx.conf          # 改源文件
$ docker build -t .../cnsig-ems-ui:1.0.1 .
$ docker push .../cnsig-ems-ui:1.0.1
```

任何想留下来的改动都必须进镜像——即进 Dockerfile/COPY 的源文件、走一次构建。这是不可变交付的核心纪律。

**动手练习**

- 练习 1（镜像名、tag）：内网仓库地址 `192.168.10.20:5000`，应用名 `app-web`，版本 `2.3.1`——写出完整镜像名；并回答：如果 `docker run` 时只写了 `192.168.10.20:5000/app-web`，实际会拉取什么？
- 答案：完整名：`192.168.10.20:5000/app-web:2.3.1`。省略 tag 时 Docker 默认补 `latest`，于是拉取目标变成 `192.168.10.20:5000/app-web:latest`——若私服上从没人推过 latest 这个 tag，会直接报 manifest not found；若有人推过，拿到的就不是你以为的 2.3.1。
- 练习 2（rm、rmi）：docker rm 和 docker rmi 分别删什么？直接 rmi 一个还有容器在跑的镜像会发生什么？
- 答案：`rm` 删容器（运行实例 + 可写层），`rmi` 删镜像（只读包）。镜像还有容器引用时 `rmi` 会拒绝并报 conflict 错误，错误信息里列出占用它的容器 ID——正确顺序是先 `docker rm -f` 容器，再 `rmi`。

**追问链**

五问从热身到进阶，覆盖三对象、凭证与不可变引用。

**docker pull nginx 和 docker pull nginx:stable-alpine 拉到的是同一个镜像吗？**

不是。前者的完整名是 docker.io/library/nginx:latest，后者是 docker.io/library/nginx:stable-alpine，tag 不同就是两个不同的引用，可能指向完全不同的内容。省略 tag 时 Docker 会默认补 latest，并打印 Using default tag: latest 提示。

追问：长镜像名可以打本地短别名：`docker tag 112.26.45.227:10001/app:1.0.0 app:dev`，别名只是又一个指向同一镜像的 tag。

**docker login 之后，凭证存在哪里？这个存储安全吗？**

存在本机 ~/.docker/config.json 的 auths 字段里，按仓库地址分键，内容是 base64 编码的账号密码——是编码不是加密，能读到文件就等于拿到密码。docker logout 的作用就是删掉对应条目。

追问：生产建议配置 credential helper（如 macOS 的 docker-credential-osxkeychain、Linux 的 pass），config.json 里只存 helper 引用，真实凭证进系统钥匙串。

**一个镜像正跑着 3 个容器，此时 docker rmi 它会发生什么？**

删除被拒绝：Docker 报 conflict 错误（unable to delete ... must be forced），错误信息里列出占用它的容器 ID。必须先停掉并删除容器（docker rm -f），镜像才能真正删除。反过来 rm 容器永远不影响镜像——实例的生死与类无关。

追问：若镜像被多个 tag 引用，rmi 某个 tag 只做 Untagged（摘标签），IMAGE ID 还被其他 tag 引用着就不会真正删数据。

**docker exec 进容器改了 /etc/nginx/nginx.conf，为什么容器重建后改动消失了？**

容器 = 不可变镜像 + 一层薄薄的可写层，exec 里的所有改动都落在可写层；容器被 rm 时可写层随之销毁，下一次 run 是从镜像重新生成的全新环境，自然回到初始状态。改动想留下来，唯一正路是改源文件、重新 build 出新镜像再 push。

追问：docker commit 能把容器可写层固化成新镜像——应急救火可用，但配置从此脱离版本库，团队协作场景不要依赖它。

**为什么说 tag 是「会漂移的指针」？想钉死内容该怎么办？**

tag 只是「名字 → IMAGE ID」的一条引用，同名 tag 重新 build/push 后引用被改指向新镜像，旧镜像降级为 \<none\> 的悬空镜像。所以同一个 tag 今天和昨天拉到的内容可能完全不同。要钉死内容用 digest 引用：镜像名@sha256:摘要——摘要由内容算出，内容变摘要必变，两次拉取结果就严格一致。

追问：`docker images --digests` 可查看每个 tag 对应的摘要；生产 Dockerfile 里 FROM 镜像@sha256:... 是可复现构建的标准做法。

延伸阅读：《一次前端部署是怎么从 dist 走到线上的？》（构建机 → 私服 → K8s 集群的全景链路，私服为什么省不掉）、《git 为什么不存 diff：内容寻址怎么做的？》（「内容算出身份」的祖师爷：digest 与 Git 对象哈希是同一套思想）。

### 镜像怎么从构建机到部署机？

*难度：入门 ｜ 标签：Docker、镜像搬运、docker save、Registry、CI/CD*

**两条通道：救急用 `docker save/load` 人工搬 tar 包，日常用仓库 push/pull。** save 把镜像的完整分层和元数据打成 tar、零基础设施依赖，但丢掉制品语义——版本谱系、来源、分发能力全没了；push/pull 以 registry 为中心，把镜像当「制品」管理，是 CI/CD 的标准环节。多机部署里 registry 中转站省不掉：只要不止一台机器要 pull、或流程要自动化，人工搬运就到顶了。

**通道一：save/load——零依赖的文件搬运**

三个命令的骨架：`docker save` 把镜像打成 tar 包（一个 tar 可以装多个镜像，大镜像可配 gzip 压体积），scp 或 U 盘物理拷到目标机，`docker load` 导回本地镜像库。它存在的意义是**零依赖**：目标机不需要网络可达任何仓库、不需要任何账号权限，一个 tar 包就是全部——新环境交付、离线隔离机房、网络故障救急，都是它的主场；很多公司的内网仓库，第一批基础镜像历史上也是这么灌进去的。

与 export 的分界是最常见的混淆点：`save/load` 操作**镜像**，完整保留分层图与元数据（history、CMD、tag）；`export/import` 操作**容器的文件系统**，把所有层打平成一个单层快照，history、CMD、tag 全部丢失。前者是「把镜像搬过去」，后者是「把这个容器当下的文件系统状态快照下来」——镜像搬运一律用 save/load（据 Docker 官方文档对两组命令的定位）。

**通道二：push/pull——以仓库为中心的制品流转**

正规通道的骨架：构建机 `docker build` 完直接 `docker push` 到 registry，部署机从同一个地址 `docker pull`。tag 与 digest 构成版本谱系（tag 指向版本、digest 锁定唯一内容），push/pull 是标准化的 API 语义，CI 流水线原生集成——有哪些版本、谁推的、什么时候推的，仓库服务端全部可查。

```text
日常通道： 构建机 docker build ──push（日常通道）──▶ Registry：镜像唯一的家
                                                          （tag / digest / 推送记录）
                                                              │
                                                              │ pull：版本可查、可回滚
                                                              ▼
                                                      部署机：pull → run

救急通道： 构建机 ──save（救急通道）──▶ docker save → tar 包 ──▶ scp / U 盘人工拷贝
                                                              │
                                                              ▼
                                          部署机 ◀── 目标机 docker load（导入本地，无服务端账本）
```

两条通道的分野一目了然：上半条搬的是「文件」——tar 包拷完即终点，没有任何服务端状态；下半条管的是「制品」——仓库有一本账：有哪些 tag、谁推的、什么时候。把差异压进四个维度：

| 维度 | save / load 人工搬运 | 仓库 push / pull |
|---|---|---|
| 版本管理 | tag 覆盖即丢，历史靠人记 | tag + digest 原生版本谱系，可回滚 |
| 自动化 | 脚本搬运，无标准语义 | build → push → pull 是 CI/CD 标准环节 |
| 多机协作 | 每台机人肉传一遍 | 任何机器一条 pull 命令拉取 |
| 适用场景 | 救急、离线隔离环境、一次性迁移 | 企业日常部署通道 |

**registry 中转站为什么省不掉**

单机部署确实可以完全绕开仓库：构建机上 save，scp 到目标机 load，一步到位——这时 registry 是纯开销。但条件稍微放宽它就失效：部署节点多于一个，每个节点都要人肉传一遍；要回滚，就得翻出历史 tar 包对着文件名猜；要回答「线上跑的到底是哪个版本」，tar 包给不出任何凭证。

多机与自动化场景里，仓库是所有能力的锚点：每个部署节点都要能 pull、CI 每次构建都要 push、镜像来源校验（digest、签名）要以仓库为前提。所以企业部署脚本里「构建完 push 到内网私有仓库」那个动作不是仪式，是整条通道的枢纽——单机可以直灌，多机必经仓库。

> **记忆卡：save 搬文件，仓库管制品**
> 判断用哪条通道只需一个问题：这是一次性救急，还是可重复的部署流程？救急 → save/load（零依赖最快）；流程 → push/pull（版本、自动化、审计都在服务端）。单机可以直灌，多机必经仓库。

**边界与陷阱**

**同名 tag 覆盖，save 拉不回旧版本**

反例：

```bash
docker build -t .../cnsig-ems-ui:1.0.0 .   # 第二次构建，tag 没换
docker push .../cnsig-ems-ui:1.0.0
# 仓库里 1.0.0 已改指新内容，旧版本被覆盖
# 这时才想起 save 一份旧镜像？已经拉不回来了
```

同名 tag 重新 push 后，仓库里旧镜像被覆盖（降级为无 tag 的悬空数据），save 导出的只能是覆盖后的当前内容——想回到旧版本，从 tar 这条路已经走不通。

正例：

```bash
$ docker push .../cnsig-ems-ui:1.0.0
1.0.0: digest: sha256:9f2a1c... size: 1571
# push 输出的 digest 记进部署日志；需要回滚时：
$ docker pull .../cnsig-ems-ui@sha256:9f2a1c...
```

digest 由内容算出、内容变摘要必变——tag 被覆盖后它仍精确指向当时的镜像，这是同名 tag 场景下唯一可靠的历史锚点。

> **提示：tar 包不是备份。** 把 save 出的 tar 当长期备份是错觉：它没有版本谱系（哪个 tag、什么来源、何时构建全靠文件名自觉）、没有完整性校验（无 digest 可对）。备份的正解仍是仓库——tar 只该活在「救急的这几分钟」里。

**commit 容器做镜像 ≠ 走构建**

反例：

```bash
$ docker commit debug-container my-app:1.0
$ docker push my-app:1.0
# commit 容器做镜像：调试残留进镜像、不可复现、层历史一团黑
```

正例：

```bash
$ docker build -t my-app:1.0 .
$ docker push my-app:1.0
# Dockerfile 是声明式配方，任何机器都能构建出同一结果
```

**追问链**

**save 和 export 都能导出 tar 包，差别到底是什么？**

操作对象不同：save/load 针对镜像、保留分层与元数据，export/import 针对容器文件系统、打平成单层丢掉全部元数据——搬镜像永远 save/load（对照表与恢复命令的完整展开见《没有外网的服务器怎么拿到 Docker 镜像？》）。

追问：export 出的 tar 比 save 略小，正因为打平丢掉了分层——这个「小」不是优化，是信息损失。

**为什么 docker save 按镜像 ID 导出，load 回来 tag 就没了？**

因为 tag 是 registry 元数据层的「名字 → 内容」映射，不属于镜像数据本身——按 ID 导出只有内容、没有名字，load 回来自然成了 \<none\>:\<none\>（完整机制与补救命令见《没有外网的服务器怎么拿到 Docker 镜像？》）。

追问：同一逻辑的另一半是 digest：它是按内容算出的哈希，跟着镜像数据走，所以跨机器、跨仓库校验「是不是同一个镜像」要认 digest 而不是 tag。

**仓库不可达（断网、registry 宕机）时，部署机怎么拿到镜像？**

分层回答：短期靠部署机本地已有镜像的缓存（之前 pull 过的层和镜像都还在）；根本解是让仓库本身高可用——proxy 预热缓存、registry 多实例与磁盘治理，而不是换通道。save/load 只在「仓库从未存在或彻底不可修复」的环境里才是正解，日常拿它当仓库的容灾方案，会把版本谱系和审计能力一起丢掉。

追问：Nexus 这类仓库的 proxy 缓存命中部分断网也能拉到——「离线可用」是缓存能力的副产品，前提是提前预热（断网前完整跑一遍构建）。

**什么条件下可以完全没有 registry？什么时候它必须回来？**

三个条件同时成立时可以没有：部署节点只有一台、没有 CI 自动化诉求（人工构建人工部署）、没有版本审计诉求。任何一条被打破它就得回来——多节点 pull 靠仓库分发、CI 集成靠标准 push/pull 语义、回滚与审计靠服务端账本。所以个人玩具项目直灌没问题，公司环境里 registry 是必选项而非可选项。

追问：K8s 场景把这点推到极致：调度到哪个节点不确定，每个节点都要能 pull——镜像预缓存到全部节点是特例优化，不是常规方案。

延伸阅读：《没有外网的服务器怎么拿到 Docker 镜像？》（save/load 通道的机制：五步流程、tag 保持细节、压缩与 ssh 直传，以及 export/import 经典考点）、《Nexus 是什么：为什么公司都要自建制品仓库？》（中转站的内部机制：proxy / hosted / group 三种角色怎么分工协作）、《制品仓库怎么选：Nexus 还是专项工具？》（五个主流工具的定位边界与「格式广度 × 安全深度」决策轴）。

### Nexus 是什么：为什么公司都要自建制品仓库？

*难度：入门 ｜ 标签：Nexus、制品仓库、Docker Registry、npm 私服、供应链安全*

**Nexus 是一台自建的私有制品仓库服务器**：把 npm registry、Docker Hub、Maven Central 这类公共仓库的能力搬进公司内网，一台服务同时充当 npm 私服、Maven 仓库和 Docker Registry，官方支持 20 多种包格式（据 Sonatype 官方文档）。公司要自建它，是因为公共源在规模面前有四个绕不开的问题：外网依赖慢且抖、私包没处放、依赖入口不可控、制品不可追溯。而理解这台服务器只需要抓住三种仓库角色：**proxy** 缓存外网公共源、**hosted** 存放自家制品（发布的唯一目的地）、**group** 把前两者拼成对外的统一 URL。

**为什么需要私有仓库**

每次 `npm install`，包来自 registry.npmjs.org；每次 `docker pull`，镜像来自 Docker Hub。个人项目这样没问题，但换到公司场景，公共源有四个绕不开的问题：

- **外网依赖慢且抖**——几百个开发者每天重复下载同一批包，公共源限流、网络抖动、服务故障，任何一样都会让全公司 CI 排队干等。
- **私包没处放**——内部工具库、未开源的业务镜像不能发公共源（内部私有包发到公共源等于公开源码，Docker Hub 私有仓库有配额限制），总不能靠拷贝目录传包。
- **依赖入口不可控**——每台开发机各自直连外网，供应链攻击面就是所有机器；哪个包是谁在什么时候引入的，无从审计。
- **制品不可追溯**——线上跑的镜像是哪个版本、从哪台机器构建的、依赖里有没有被动过手脚，公共源体系回答不了。

解法是把「仓库」收口成公司内网的一台服务器：所有人的下载和发布只跟它打交道。Nexus（Sonatype 出品，社区版 OSS 免费）就是干这个的软件——公司里 Java、前端、运维各用各的生态，它一台全接住：npm、Maven、Docker、PyPI、Go、Helm 等 20 多种格式（据 help.sonatype.com 的支持格式列表）。它本身也常以 Docker 容器的形式部署（官方镜像 `sonatype/nexus3`），数据挂 volume。

**三种仓库角色：proxy · hosted · group**

Nexus 里的「仓库」是一个可以任意新建的实例，而不是一个生态一个池子：你可以建 3 个 npm 仓库、2 个 Docker 仓库，每个实例都必须是三种角色之一。这三个词是整台服务器的骨架，官方定义如下：

> "A proxy repository caches content from a remote repository."
> "A hosted repository is a repository that stores components in Nexus Repository as the authoritative location."
> "A group repository combines multiple repositories, including other repository groups, into a single repository."（Sonatype Nexus Repository 官方文档 · Repository Types）

**proxy：外网源的缓存与收口**。proxy 缓存外网公共源：有人第一次要 `lodash`，它去 npmjs 拉一份存下来；之后全公司所有人要 `lodash` 都直接命中缓存，不再出外网。机制上可以拿 HTTP 缓存来对照（=给外网仓库加了一层带过期策略的浏览器缓存/CDN）：本地有且未过期就直出，过期了拿版本信息回源核对——Nexus 里的 Maximum Component Age / Maximum Metadata Age 配置就是「缓存多久后需要回源检查」的过期语义（据官方文档 Repository Types）。两个价值：一是**快和稳**——同一个包的回源从几百人次收敛成 1 次，公共源抖动不再传导到每一次构建；二是**收口**——外网依赖有了唯一进口，审计、白名单、断网构建这些能力都从这里才谈得上。注意 proxy 是只读的，使用方不能向它发布任何东西。

**hosted：自家制品的权威存放点**。hosted 是自家制品的**权威存放点**（官方措辞 authoritative location）：内部工具库 `npm publish` 到这里，业务镜像 `docker push` 到这里。还有一种容易被忽略的用途——存放公共源没有、或不允许二次分发的东西，官方文档给的例子是商业数据库驱动：买来的 jar 包不能随意转发到外网，得有个内网地方统一存放、统一分发。

**group：使用方看到的统一门面**。group 本身不存任何东西，是一个**组合视图**：把若干 proxy 和 hosted 拼成一个 URL，查找时按成员列表顺序依次检索（官方文档明确 search order 按成员顺序）。经典布局是给使用方一个 `npm-public` 组：成员先后是 npm-internal（hosted）和 npm-proxy（proxy）——`npm install` 只配 group 这一个源地址，先命中内网私包、再落缓存、最后才是 proxy 回源，使用方完全不用关心「这个包到底在哪个仓库」。

```text
[开发机 / CI：只配一个源地址]
    │
    │ ① install / pull（拉取）                    publish / push（发布直达，绕过 group）
    ▼                                                        │
[group：统一门面，不存数据] ◀──────────────────────────────┘
    │                      │
    │ ② 先查内部            │ ③ 未命中走代理
    ▼                      ▼
[hosted：内部私包/业务镜像] [proxy：外网源缓存（只读）]
                               │
                               │ ④ 仍未命中则回源
                               ▼
                    [npmjs / Docker Hub（外网）]
```

一次 `npm install` 的寻址顺序就是这张图自上而下：group 先查 hosted（内部包优先，防止被同名包覆盖），未命中交给 proxy，proxy 缓存有就直出、没有才出外网——外网流量被收敛成「缓存未命中的那一次」。发布（publish/push）则绕过 group 直达 hosted，因为自家制品的权威存放点只能有一个。

> **记忆卡：proxy 收口、hosted 权威、group 组合**
> 三个词覆盖 Nexus 90% 的日常问题：「包从哪来」→ proxy（外网缓存）；「包发到哪」→ hosted（权威存放）；「源地址填哪个」→ group（统一门面）。其余能力（权限、清理、扫描）都是挂在这三种角色上的运维配置。

**边界与陷阱**

**Docker 仓库端口陷阱**

反例：

```bash
docker login nexus.corp.com:8081
# 8081 是 Nexus 主端口，按 /repository/仓库名/ 路径区分仓库
# ——而 Docker 客户端不允许 URL 里带仓库路径，登录与拉取全部失败
```

正例：

```bash
docker login nexus.corp.com:8082
# 每个 Docker 仓库配独立的「连接器」端口（8082 → docker-hosted），
# 或用子域名连接器按域名分流（据官方文档 Docker Registry）
```

为什么会这样：npm、Maven 的仓库地址可以带路径（`域名/repository/npm-public/`），Docker 客户端却把 registry 地址写死为「根路径 + 命名空间/镜像名」——同一个端口装不下多个 Docker 仓库，Nexus 只好用端口（或子域名）来区分。这是自建 Nexus 后最常撞的第一堵墙：docker login 打到 8081 报错，查半天以为自己配错了仓库。

**proxy ≠ 安全体检**

反例：`依赖只从 proxy 进 = 供应链安全达标`——收口只是入口管理，不含体检——一个被投毒的包一旦进入缓存，会被分发给全公司。

正例：`proxy 收口 + 扫描与白名单策略`——在入口之上叠加漏洞扫描、来源白名单、发布审批，收口是前提不是全部。

**仓库不是备份**

反例：`镜像 push 上去就永久在了`——Nexus 依赖所在磁盘 / volume：磁盘满 = 全公司构建瘫痪；proxy 缓存默认只增不减。

正例：`独立 volume + 磁盘监控 + 清理策略`——按仓库配清理任务（如只保留最近 N 个快照版本），把磁盘水位当核心监控项。

> **提示：断网 ≠ 全部可用。** proxy 的「离线构建」能力有前提：只有**缓存命中**的组件才离线可用，缓存未命中的包在断网时照样拉不到。真要对外网故障免疫，得靠提前预热缓存（断网前完整跑一遍全量构建），而不是装上 proxy 就完事。

**追问链**

**hosted 和 proxy 仓库各自放什么？**

hosted 放自家制品，是内部包和业务镜像的权威存放点，publish/push 打到这里；proxy 放外网公共源的缓存，只读、不能发布。判断方法很简单：看东西的源头是自己还是外网——是自己就进 hosted，是外网的就是 proxy 的缓存。

追问：group 不是存储实体，不存任何组件，只是把多个仓库拼成一个 URL 的组合视图——它不能替代前两者的任何功能。

**为什么 npm 仓库共用一个端口就行，Docker 仓库却要每个单独配端口？**

因为 Docker 客户端不允许 registry 地址里带仓库路径：它把地址写死为「根路径 + 命名空间/镜像名」，而 Nexus 默认靠 /repository/仓库名/ 这样的路径区分仓库，两者天然冲突。npm、Maven 的客户端支持路径式地址，所以全走 8081 主端口；Docker 只能另开通道——每个 Docker 仓库配独立的端口连接器（或子域名连接器），按端口把流量导到对应仓库。

追问：Nexus 3.83.0 起新增了 Docker 的路径路由支持，但同一部署里混用多种路由类型不被支持；存量运维口径仍是「一个 Docker 仓库一个端口」。

**CI 构建出的镜像，docker push 应该打到 group、hosted 还是 proxy？**

打到 hosted（发布目标是权威存放点，自家制品的「家」只能有一个）。proxy 是只读缓存，语义上不可能接收发布；group 的本职是给拉取方一个统一 URL，发布永远落到其成员 hosted。

追问：新版 Nexus 文档化了「推送到 Docker group」的能力（由 group 路由到目标成员仓库；Pro 功能，OSS 社区版发布仍直达 hosted），但团队约定仍建议发布直达 hosted：少一层路由语义，权限边界也更清晰。

**proxy 缓存被投毒了怎么办？一个带恶意代码的上游版本被 Nexus 缓存后，如何止损、如何防复发？**

止损三步：① 摘除——删除该恶意版本（hosted 可直接删，proxy 缓存用 Invalidate cache 强制丢弃，回源时该版本若已被上游下架即拉不到）；② 钉住——依赖以 lockfile 钉到已知良好版本，CI 拒绝 lockfile 之外的浮动升级；③ 排查——按 Nexus 访问记录找出投毒窗口内拉过该版本的构建与制品，评估波及面。防复发是另一层：proxy 只指向官方上游（不配来路不明的源）、CI 里叠加依赖审计（npm audit、外挂漏洞扫描）——收口解决的是「入口唯一」，安全还要求「入口有检查」。

追问：判断波及面的一条线索是 Nexus 的访问记录：谁在何时拉过被投毒的版本——这正是「制品不可追溯」痛点在私服上被解掉的部分。

延伸阅读：《镜像怎么从构建机到部署机？》（save/load 与 push/pull 两条通道的机制与取舍——仓库正是正规通道的中转站）、《制品仓库怎么选：Nexus 还是专项工具？》（五个主流工具的定位边界与选型决策轴）。

### 制品仓库怎么选：Nexus 还是专项工具？

*难度：入门 ｜ 标签：制品仓库、Nexus、Harbor、Verdaccio、选型*

**一条决策轴：先数制品种类，再定安全深度。** 只有 npm 用 Verdaccio；只要镜像存储，个人用 registry:2、团队用 Harbor；两种以上生态用 Nexus 一台全包；K8s 重度、要扫描签名准入时补 Harbor；企业级合规与多站点复制才轮到 Artifactory。没有万能赢家，只有「最小满足」。

**五个工具各自站在哪**

**Nexus**（Sonatype 出品）是「一台管所有格式」的多面手：npm、Maven、Docker、PyPI、Go、Helm 等 20 多种格式统一入口，社区版 OSS 免费自建。**Harbor** 是容器专属的云原生镜像仓库、CNCF 毕业项目：OCI 镜像与 Helm Chart 之外什么都不管，换来的是安全纵深——Trivy 漏洞扫描、镜像签名、「未签名镜像不准上生产」的策略门禁。**Verdaccio** 是极简 npm 私服：零配置启动、无需数据库，上游代理缓存 npmjs（据 verdaccio.org 官方定位），但出了 npm 生态就无能为力。**registry:2** 是 Docker 官方的最小 Distribution：一个纯镜像存储进程，无 UI、无权限、无清理策略。**JFrog Artifactory** 是企业级通用制品平台：全格式之外卖的是治理——Xray 深度扫描、多站点复制、合规审计与商业支持。

| 工具 | 定位 | 管什么 | 什么时候选它 |
|---|---|---|---|
| Nexus | 多格式制品仓库 | npm / Maven / Docker / PyPI / Go 等 20+ 格式 | 多技术栈要统一入口；OSS 版免费，一台全包 |
| Harbor | 云原生镜像仓库（CNCF 毕业项目） | OCI 镜像、Helm Chart | K8s 重度场景，要漏洞扫描、镜像签名、部署策略门禁 |
| Verdaccio | 轻量 npm 私服 | 仅 npm | 前端小团队快速起步，零配置启动 |
| registry:2 | Docker 官方最小 Registry | 仅镜像 | 只要纯镜像存储，不需要 UI 与权限管控 |
| JFrog Artifactory | 企业级通用制品平台 | 全格式 + 商业支持 | 大规模企业的合规审计、多站点复制、深度扫描 |

registry:2 和 Verdaccio 的共同点值得点破：它们都是**单一生态的最小实现**——这正是它们轻的原因，也是边界所在。生态一旦越界（Verdaccio 碰镜像、registry:2 碰权限治理），就该换位置的信号就出现了。

**决策轴：格式广度 × 安全深度**

**轴一：格式广度。** 先盘点公司要管哪些制品。只有 npm → Verdaccio 足够；只有镜像 → 个人实验 registry:2、团队或 K8s 场景用 Harbor；两种以上生态（前端 npm + Java Maven + 运维镜像，几乎是公司的标配组合）→ Nexus 起步，一个入口管全部，省掉 N 套工具的运维。

**轴二：安全深度。** 只要「依赖入口收口」→ Nexus OSS 的三角色就够；要漏洞扫描、镜像签名、不准未签名镜像上生产 → Harbor（或商业路线 Artifactory + Xray）。两轴都拉满时，答案往往是**并存而非二选一**：大厂常见 Harbor 专管镜像（运行时分发 + 安全纵深），Nexus 或 Artifactory 管其余格式（企业治理）——分开部署，各自站在最优区间。

> **记忆卡：先数制品，再看安全**
> 选型只问两件事：①要管几种制品？决定「专项工具还是全家桶」；②安全要多深？决定「开源 OSS 够不够、要不要 Harbor 或商业版」。两问的答案直接落在工具格子里——不看出身，不看名气。

**边界与陷阱**

**按名气选型**

反例：`大厂都用 Artifactory，我们也上`——企业级平台的运维与授权成本对小团队是反噬——它在为合规审计、多站点复制这些你还没有的问题付费。

正例：`先盘点：npm？镜像？Maven？`——按制品种类选：单一生态用专项工具，多生态用 Nexus 一台全包起步，规模到了再加码。

**registry:2 当企业仓库**

反例：`docker run -d -p 5000:5000 registry:2`——无 UI、无权限、无清理策略——镜像谁都能推、磁盘满了没人知道。它只适合个人实验。

正例：`企业及格线 = 权限 + 可视 + 清理`——多用户、多项目环境至少选带认证、界面与磁盘治理的工具（Nexus / Harbor）。

> **提示：有仓库 ≠ 有安全。** Harbor 的扫描、签名、准入是**能力上限**，不是装完默认生效——策略不配照样裸奔；Nexus OSS 同样不带镜像漏洞扫描。把「我们有自己的仓库了」当成安全达标，是选型环节最后的错觉。

**追问链**

**Verdaccio 零配置又免费，为什么不能顺手拿来管 Docker 镜像？**

因为 Verdaccio 是 npm 生态的专用实现，说 npm 的协议（tarball 分发、npm publish/packument 语义）；Docker 镜像走的是另一套分发协议（OCI distribution spec，manifest + blob 拉取）。两者从存储结构到客户端交互完全不同——不是 Verdaccio「不想」管镜像，是 docker 客户端根本不会跟它对话。管镜像的最小实现是 registry:2，不是它。

追问：OCI（Open Container Initiative）distribution 规范是镜像仓库的通用语言：Harbor、registry:2、Nexus 的 Docker 仓库、云厂商镜像服务都说这门语言，所以 docker 客户端可以无差别对接。

**同样都「有 UI、有权限」，Harbor 和 Nexus 的能力分界在哪？**

分界在管什么与深到哪：Harbor 容器专属但安全纵深强——Trivy 扫描、镜像签名、部署策略门禁是原生能力；Nexus 格式广（20+ 生态一个入口）但 OSS 版不带镜像漏洞扫描。所以容器占绝对大头、K8s 重度 → Harbor；多生态要统一入口 → Nexus；两头都要 → 并存。

追问：Nexus 的镜像扫描在商业版里（Pro 层），开源团队常用组合是 Nexus 管包 + 外挂 trivy 在 CI 里扫镜像——用流水线补齐 Harbor 式能力。

**为什么很多大厂让 Harbor 和 Artifactory 并存，而不是统一成一家？**

因为两者的最优区间不重叠：容器运行时分发要的是扫描、签名、准入策略（Harbor 的主场），全格式企业治理要的是合规审计、多站点复制、统一权限（Artifactory 的主场）。强行统一成一家，必然有一头退化为「凑合能用」——统一入口省下的运维成本，抵不过深度能力损失的坑。并存时两者各有清晰职责，边界反而更干净。

追问：中小团队的对应折中是 Nexus 一台全包：放弃 Harbor 的安全纵深，换取「只运维一套」的简单——决策轴没变，只是权重不同。

**团队已用 Nexus OSS 管镜像，现在要扫描、签名、准入——从 Nexus 迁到 Harbor 的稳妥路径是什么？**

按「新版本只进新仓库、旧版本按需迁移」四步走：① Harbor 建好项目与权限后，把 CI 的 push 目标切到 Harbor，新版本只进新仓库；② 在用的存量 tag 用 skopeo copy 搬进 Harbor，历史版本留在 Nexus 只读归档、不搬；③ 迁移期运行侧双仓库并行，等 Pod 随滚动更新自然改指 Harbor 后，把 Nexus 的 Docker hosted 关掉发布权限、降级为归档；④ npm/Maven 等其余格式原地不动——迁移只发生在「安全深度不够」的镜像这条线上，格式广度的职责仍在 Nexus。这正是决策轴的用法：安全深度缺口归 Harbor，多格式收口留 Nexus。

追问：镜像搬运优先用 skopeo copy 而非 pull→push：不经本地 Docker 守护进程、不落盘，且完整保留架构信息与 digest——跨仓库同步是它的本职。

延伸阅读：《Nexus 是什么：为什么公司都要自建制品仓库？》（选出来的这台服务器内部怎么运转：proxy / hosted / group 三角色协作拓扑）、《镜像怎么从构建机到部署机？》（仓库在部署链路里的位置：save/load 与 push/pull 两条通道的取舍）。

### 没有外网的服务器怎么拿到 Docker 镜像？

*难度：入门 ｜ 标签：docker save、docker load、离线部署、镜像搬运*

**镜像仓库不可达时（完全隔离的内网、连私服都不通的交付环境），唯一的分发手段是离线搬运**：`docker save` 把镜像导出成 tar 包 → 拷贝到目标机 → `docker load` 恢复成镜像。两条铁律：**搬镜像永远用 save/load**——它保留全部分层、元数据和 tag，load 回来的镜像与 pull 到的完全等价；**save/export 是两族命令**——export 作用于容器、导出打平后的文件系统快照，丢掉分层与启动配置，用途是备份容器现场而非搬运镜像。与仓库的关系不是替代而是配合：私服里的第一批基础镜像，正是有人这样人工灌进去的。

**什么时候轮到离线搬运**

正常链路里镜像靠仓库分发（build → push → pull），仓库不可达的场景其实很常见：**完全物理隔离的交付内网**（政企生产环境，连内部私服都够不到）、**私服的初始化**（私服还没灌进任何镜像，第一台构建机连基础镜像都拉不到）、以及**备份与迁移**（把镜像固化成文件归档）。这些场景的共同点是：网络这条分发通道断了，得改用"文件"这条最古老的通道。

完整流程五个动作，中间那步"搬运"用什么手段都行（scp、U 盘、内部 FTP）：

```text
[① save 导出] 有网机器：镜像 → tar 文件
    │
    ▼
[② 搬运]      scp / U 盘 / 内部 FTP
    │
    ▼
[③ load 导入] 目标机：tar → 本地镜像
    │
    ▼
[④ 验证]      docker images 核对名字与 tag
    │
    ▼
[⑤ 使用]      run 起容器，或 tag 后 push 进内网私服
```

```bash
# ① 有网机器：确认本地有镜像，导出为 tar
$ docker pull nginx:stable-alpine
$ docker save nginx:stable-alpine -o nginx-stable-alpine.tar
$ ls -lh nginx-stable-alpine.tar
-rw-r--r--  1 ren  staff  46M  9  8 10:12 nginx-stable-alpine.tar

# ② 拷到目标机器（内网 scp / U 盘均可）
$ scp nginx-stable-alpine.tar root@10.20.0.5:/tmp/

# ③ 目标机（无外网）：导入
$ docker load -i /tmp/nginx-stable-alpine.tar
Loaded image: nginx:stable-alpine

# ④ 验证：名字与 tag 原样出现
$ docker images nginx
REPOSITORY        TAG             IMAGE ID       CREATED      SIZE
nginx             stable-alpine   9cee1a8caa02   3 weeks ago  43MB
```

官方对 save 产物的描述点出了它为什么能"原样恢复"：

> Contains all parent layers, and all tags + versions, or specified repo:tag, for each argument provided.（Docker Docs · docker image save）

tar 包里是**完整的分层结构加上全部元数据**，所以 load 回来的镜像和从仓库 pull 到的没有任何差别——分层还在（后续构建继续共享底座）、tag 还在、启动命令还在。

**三个实用细节**

**一个 tar 装多个镜像**。save 天生支持多参数，交付一组基础镜像时不用打 N 个包——官方示例就是两个镜像进一个归档：

```bash
$ docker save -o base-images.tar nginx:stable-alpine node:22-slim redis:7
$ docker load -i base-images.tar
Loaded image: nginx:stable-alpine
Loaded image: node:22-slim
Loaded image: redis:7
```

**大镜像先压缩**。save 默认输出未压缩 tar，配合管道可以边导出边压：导出端 `docker save 镜像 | gzip > x.tar.gz`，导入端 `gunzip -c x.tar.gz | docker load`。几十 MB 的前端镜像没必要，几 GB 的后端镜像能省一半传输时间。更进一步，两台机器网络互通时连落盘都省了，**ssh 管道直传**：

```bash
$ docker save nginx:stable-alpine | gzip | ssh root@10.20.0.5 'gunzip | docker load'
Loaded image: nginx:stable-alpine
```

**tag 是否保留，取决于你 save 的时候写的是什么**。用镜像名保存，tag 跟着走；用 IMAGE ID 保存，归档里只有内容没有名字——load 出来就是一个 `\<none\>:\<none\>` 的无名镜像，需要手动 `docker tag` 补名。搬运交付包时永远按**名字**保存。

**经典考点：save/load vs export/import**

Docker 还有另一对长得几乎一样的命令：export / import。区别只有一个字但全是天壤——**save 的对象是镜像，export 的对象是容器**：

> Export a container's filesystem as a tar archive. The docker export command doesn't export the contents of volumes associated with the container.（Docker Docs · docker container export）

export 导出的是**某个容器此刻的文件系统快照**：分层被拍平、镜像的元数据（tag、启动命令、环境变量）全部不在包里。它配对的也不是 load 而是 `docker import`——把快照导入成一个全新的裸文件系统镜像，连默认启动命令都没有，run 时必须显式给命令。两者的正确分工：

| 维度 | save / load（镜像族） | export / import（容器族） |
|---|---|---|
| 作用对象 | 镜像 image | 容器 container（运行中或已停止均可） |
| 分层结构 | 完整保留 | 拍平为单层文件系统快照 |
| 元数据与 tag | 保留（tag、启动命令、环境变量） | 丢失（import 后无 CMD，run 必须显式给命令） |
| 恢复命令 | docker load | docker import |
| 典型用途 | 镜像分发、离线部署、备份 | 备份容器现场、把调试过的容器固化为新基础镜像 |
| 类比 | 把 npm 包原件拷给同事 | 把跑了一半的 node_modules 目录打包带走 |

> **记忆卡：搬镜像用 save/load，export 只用于容器现场**
> save 按名字导出才带 tag；tar 里是完整分层 + 元数据，load 与 pull 等价。export 导出的是容器的打平快照（不含 volume 内容），import 进来的是没有启动命令的裸镜像——两者用途完全不同，**「离线部署」四个字对应的永远是 save/load**。

**边界与陷阱**

三个高频坑：一个丢名字，一个认错对象族，一个架构不符——第三个对 Mac 开发者尤其致命。

**坑 1：按 IMAGE ID 导出，load 回来变成无名镜像**

反例：

```bash
$ docker images --format "{{.ID}} {{.Repository}}"
3f8a12d9b7c1 112.26.45.227:10001/cnsig-ems-ui
$ docker save 3f8a12d9b7c1 -o app.tar
$ docker load -i app.tar
Loaded image ID: sha256:3f8a12d9b7c1...
$ docker images
<none>                       <none>    3f8a12d9b7c1   ...   46MB
```

ID 只标识内容不携带名字——归档里没有 repo 与 tag，load 只能恢复出一具没有身份的镜像。

正例：

```bash
$ docker save 112.26.45.227:10001/cnsig-ems-ui:1.0.0 -o app.tar
$ docker load -i app.tar
Loaded image: 112.26.45.227:10001/cnsig-ems-ui:1.0.0
```

按「名字:tag」导出，名字随包走。已经变成 \<none\> 的也能救：`docker tag 3f8a12d9b7c1 完整名:tag` 补回来。

**坑 2：两族命令认错对象**

反例：

```bash
$ docker save my-running-container -o c.tar
Error: No such image: my-running-container
$ docker export nginx:stable-alpine -o n.tar
Error: No such container: nginx:stable-alpine
# 各自只认自己一族的对象
```

save/pull/load/rmi 后面跟镜像名，export/rm/logs/exec 后面跟容器名——报 No such image / No such container 时，第一反应检查对象族。

正例：

```bash
# 先分清手里是什么：
$ docker ps        # 容器清单（export 的原料）
$ docker images    # 镜像清单（save 的原料）
# 容器现场想固化成镜像再搬运：
$ docker commit my-container snapshot:1.0   # 容器 → 镜像
$ docker save snapshot:1.0 -o snapshot.tar  # 镜像 → tar
```

commit 是两族之间的桥：先把容器固化为镜像，之后就能走 save/load 的正规搬运通道（应急场景再用，常规交付走构建）。

**坑 3：Apple Silicon 上导出的镜像，x86 服务器跑不动**

反例：

```bash
# M 系列 Mac 上：
$ docker pull nginx:stable-alpine && docker save ... -o n.tar
# 拷到 amd64 服务器 load 后 run：
exec format error
# 镜像是 arm64 架构，服务器是 amd64 CPU
```

镜像天生带架构属性。Mac（arm64）上 pull 到的默认就是 arm64 版本，save 保存的只是这一个架构。

正例：

```bash
# 导出前显式指定目标平台：
$ docker pull --platform linux/amd64 nginx:stable-alpine
$ docker save nginx:stable-alpine -o nginx-amd64.tar
# docker save 也支持 --platform linux/amd64（需 Docker Engine 25+）
```

交付给 x86 服务器的镜像，在有网机器上就要按 linux/amd64 拉取或导出；镜像 inspect 里的 Architecture 字段是验收依据。

**动手练习**

- 练习 1（ssh 管道、save/load）：构建机可以 ssh 到内网目标机但不能用仓库。写出一条命令，把 `app:1.0.0` 边压缩边传到目标机并完成导入（不产生中间文件）。
- 答案：

```bash
$ docker save app:1.0.0 | gzip | \
    ssh root@10.20.0.5 'gunzip | docker load'
Loaded image: app:1.0.0
```

- 练习 2（初始灌注、私服）：公司新搭了一台内网私服 `registry.corp:5000`，它本身也访问不了外网。描述把 nginx 基础镜像「灌」进去的完整步骤。
- 答案：五步：① 在有外网的机器 `docker pull nginx:stable-alpine`（注意 --platform 要与内网服务器架构一致）；② `docker save` 成 tar；③ 搬运进内网；④ `docker load` 后 `docker tag nginx:stable-alpine registry.corp:5000/library/nginx:stable-alpine` 把名字改成私服地址形态；⑤ `docker login` 后 `docker push`。此后内网所有 Dockerfile 的 FROM 都指向私服地址，外网通道彻底断开也不影响构建。

**追问链**

五问从工具分工问到分发链路的尽头。

**有了 docker save，为什么生产环境还是用私服 push/pull？**

一句话：save/load 是点对点的人工兜底，push/pull 是服务化分发——版本谱系、权限、扫描、并发拉取都在仓库侧，规模化后人工搬运不可维护（通道取舍的完整论证见《镜像怎么从构建机到部署机？》）。本篇只负责机制这一半：仓库不可达时，save/load 是唯一走得通的路。

追问：规模化的隔离环境会用「内网 registry + 人工同步」折中：tar 搬进内网后 push 进私服，集群内照常 pull。

**save 出来的 tar 里到底装了什么？为什么 load 回来的镜像能和 pull 的完全等价？**

tar 里是完整镜像结构：每一层的文件内容 + 层与层之间的顺序关系 + 描述镜像的清单（元数据：入口命令、环境变量、暴露端口）+ tag 映射。pull 从仓库下载的也是同样这套数据（仓库本质就是存这些层和清单的地方），所以 load 与 pull 得到的镜像逐字节等价——分层结构保留意味着后续构建照样共享底座。

追问：想亲眼看看：docker save -o n.tar 后 tar -tf n.tar，能直接看到 manifest 与每一层。

**docker export 出来的 tar，能不能用 docker load 恢复？为什么？**

不能。load 只认镜像归档格式——里面有层清单和镜像元数据；export 的 tar 是打平的容器文件系统快照，没有这些结构，load 会直接报错。export 的产物只能配对 docker import，导入成一个全新的裸文件系统镜像：单层、无 tag、无启动命令，run 时必须显式指定要执行的命令。

追问：反过来，save 的 tar 也不能 docker import——import 面向的是文件系统快照语义；两对命令各自闭环，不能交叉。

**内网私服刚搭建、里面一个镜像都没有时，团队的 Dockerfile 写 FROM nginx:stable-alpine 会发生什么？完整的解决链路是什么？**

构建机解析 FROM 时本地无缓存、私服里也没有这个镜像，拉取失败，构建直接报 manifest not found / pull access denied。完整链路：有网机器按目标架构 pull 基础镜像 → save 成 tar → 搬运进内网 → load 后用 docker tag 把名字改成私服地址形态（如 registry.corp:5000/library/nginx:stable-alpine）→ login + push 进私服。此后全团队的 FROM 改指向私服地址，外网依赖被彻底切断。

追问：成熟团队会定期批量灌注并扫描这批基础镜像（升级 nginx 修复 CVE 时重复一次该链路），基础镜像的「进货」本身就是一项需要管理的工程。

**镜像有 5GB，连 tar 都难拷，有哪些工程化的缓解手段？**

按成本从低到高：① 管道压缩（docker save | gzip，文本层多的镜像能省一半）；② ssh 直传免落盘，配合 rsync 断点续传；③ 分层复用——基础镜像层单独 save 一次长期不动，只定期搬业务层，目标机 load 两包合并；④ 从源头瘦身——多阶段构建、slim/alpine 基础镜像，5GB 的镜像多半是没清理的构建缓存与依赖，搬运优化之前先查镜像本身该不该这么大。

追问：Extreme 场景用 docker buildx 的 OCI 布局输出或 registry mirror 中转，让「搬运」重新变回「同步」，但这些需要内网有对应基础设施。

离线搬运全链路演练清单：

- `docker save <img> | gzip > img.tar.gz` 并记录体积——gzip 通常再砍一半，对照磁盘与网络预算
- 传输到目标机并校验完整性——rsync -P 可断点续传；shasum 两端比对
- `gunzip -c | docker load` 后 `docker images` 确认——load 输出的镜像名要与预期一致
- 目标机 `docker run --rm <img> <cmd>` 冒烟——能跑起一个命令，搬运才算完成
- 清理中转 tar 包——最常忘的一步，磁盘就是这么悄悄满的

延伸阅读：《镜像怎么从构建机到部署机？》（两条通道取舍的论证：save 与 push/pull 的机制对比、「registry 中转站省不掉」的完整边界）、《Docker 的镜像、容器、仓库是什么关系？》（前置：三对象与不可变镜像——本篇 save/load 的前提概念）、《nginx.conf 是怎么让页面和接口都通的？》（搬进镜像的那份配置文件逐行拆解）。

## 部署实战

### nginx.conf 是怎么让页面和接口都通的？

*难度：进阶 ｜ 标签：nginx、try_files、反向代理、CORS、history 路由*

**整份配置只有两个 location 在干活，分工一句话：location / 把 URL 映射到磁盘上的 dist（静态托管），location /admin-api/ 把接口请求转发给后端容器（反向代理）。** 其中 `try_files $uri $uri/ /index.html` 是 SPA 的生命线——history 路由的地址在磁盘上并不存在，全部靠它兜底回 index.html，交给前端路由接手。proxy_pass 的末尾斜杠决定转发时保不保留路径前缀，差一个字符就 404。页面与接口同域之后，**浏览器眼里不存在跨域**，配置里那段 CORS 响应头实际是无人消费的冗余代码。

**全貌：骨架、两个 location、一份逐行批注**

nginx.conf 的骨架是固定的三层：worker 进程设置、events（连接模型）、http（真正的业务配置都在这，其中的 server 块代表一个虚拟主机）。一份生产在用的前端配置全文不长，逐行看：

```nginx
# worker 进程数。容器里配 1：静态托管 + 反代单进程足够；
# 设 auto 让 nginx 按 CPU 数自定也可以。
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    # 引入 mime 类型表——js/css 的 Content-Type 全靠它。
    # 官方镜像自带这份文件（你的清单只覆盖了主配置，没动它）。
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout  65;
    # 请求体上限 300MB：文件上传接口的守门员。
    # 超过即返回 413 Request Entity Too Large——「大文件传不上去」先查这行。
    client_max_body_size 300m;

    server {
        # 容器内监听 80。用户访问的端口是 docker run -p / K8s Service
        # 映射出来的，跟这个数字是两回事。
        listen       80;

        location / {
            # URL → 磁盘的映射基准：请求 /assets/a.js 到这里找
            # /home/cnsig/cnsig-ems-ui/assets/a.js。
            # 必须与 Dockerfile 的 COPY 目标一致（暗约定）。
            root   /home/cnsig/cnsig-ems-ui;
            # SPA 生命线：按顺序找 $uri 文件 → $uri/ 目录 →
            # 都没有就内部重定向到 /index.html，前端路由接手。
            try_files $uri $uri/ /index.html;
            index  index.html index.htm;
        }

        # 前缀匹配：所有以 /admin-api/ 开头的请求离开静态托管，进入反向代理。
        location /admin-api/ {
            proxy_set_header Host $http_host;              # 让后端知道原始域名
            proxy_set_header X-Real-IP $remote_addr;       # 传递真实客户端 IP
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            # 以 HTTP/1.1 与后端通信——WebSocket 升级头（下两行）要求 1.1，
            # nginx 默认用 1.0 会握手失败。
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            # 转发目的地。末尾带 /admin-api/（带 URI）：location 匹配到的前缀
            # 原样保留，后端收到的路径与浏览器发出的一致。
            proxy_pass http://cnsig-ems-boot:21080/admin-api/;
        }

        # 服务端错误（含 502：后端挂了）统一渲染 nginx 默认的 50x.html。
        # 看到这张页面的含义是「nginx 活着，但它身后死了」。
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```

**location /：静态托管与 history 路由回退**

静态托管的核心是 `root`——它定义了「URL 路径 → 磁盘路径」的拼接基准：请求 `/assets/index.js`，nginx 去 `root/assets/index.js` 找文件。真正的难点在 `try_files`，官方定义是：

> Checks the existence of files in the specified order and uses the first found file for request processing. If none of the files were found, an internal redirect to the uri specified in the last parameter is made.（nginx docs · ngx_http_core_module — try_files）

对照 `try_files $uri $uri/ /index.html`：先找 `$uri` 对应的文件，再找它对应的目录，都找不到就**内部重定向**到 /index.html——浏览器完全无感，拿到的永远是一份能跑的前端入口。为什么要这么兜底？因为 history 模式的路由地址（/login、/order/detail）**磁盘上并不存在对应文件**，它们只是前端路由表里的记录；没有这条兜底，用户刷新 /login 就是一张 404。用三个真实请求推演一遍：

- `GET /assets/index-3fa2.js`：$uri 命中真实文件 → 直接返回 js 内容（Content-Type 由 mime.types 决定）。静态资源走的是第一优先级。
- `GET /login`（history 路由刷新）：磁盘上没有 login 文件也没有 login 目录 → 兜底生效，内部重定向 /index.html → 返回 HTML → 前端路由接管，渲染登录页。地址栏不变。
- `GET /images/missing.png`（资源真丢了）：同样落进兜底 → 返回的是 index.html 的内容、状态 200。注意：真正缺失的静态资源也会拿到 HTML——这就是「图片请求返回了网页」这类怪象的来源。

**location /admin-api/：反向代理与斜杠语义**

反向代理的行为由 `proxy_pass` 一行决定，而它有**带 URI 与不带 URI**两种语义，官方规则：

> If the proxy_pass directive is specified with a URI, then when a request is passed to the server, the part of a normalized request URI matching the location is replaced by a URI specified in the directive.（nginx docs · ngx_http_proxy_module — proxy_pass）

套用到本配置：location 是 `/admin-api/`，proxy_pass 写的是 `http://cnsig-ems-boot:21080/admin-api/`（带了 URI）——location 匹配到的前缀 /admin-api/ 被替换为 /admin-api/，等于**原样保留**，后端收到的路径和浏览器发出的完全一致。如果末尾只写到端口，则是另一种语义，对照：

```nginx
# 浏览器请求：GET /admin-api/user

location /admin-api/ {
  proxy_pass http://cnsig-ems-boot:21080/admin-api/;
}   → 后端收到 /admin-api/user   （前缀保留，前缀换前缀）

location /admin-api/ {
  proxy_pass http://cnsig-ems-boot:21080;
}   → 后端收到 /admin-api/user   （不带 URI，原样透传）

location /admin-api/ {
  proxy_pass http://cnsig-ems-boot:21080/;
}   → 后端收到 /user             （前缀被剥掉！）
```

差一个斜杠，后端收到的路径就少一段——「接口 404 但 nginx 日志里请求明明存在」的经典根因。本配置还带了四组 `proxy_set_header`：`Host` 让后端知道原始域名；`X-Real-IP` 与 `X-Forwarded-For` 传递真实客户端 IP（否则后端眼里所有请求都来自 nginx 这一个地址）；`Upgrade / Connection` 是 WebSocket 握手所需——HTTP/1.1 的连接升级是逐跳头（hop-by-hop），代理默认不转发，必须显式带上，前端的长连接才能穿过反代。

```text
浏览器 ── GET /admin-api/user（同源请求）──▶ nginx 容器
nginx 容器 ── 前缀匹配 location /admin-api/ ──▶ nginx 容器
nginx 容器 ── GET /admin-api/user（附 Host / X-Forwarded-For）──▶ 后端 cnsig-ems-boot
后端 cnsig-ems-boot ── 200 JSON ──▶ nginx 容器
nginx 容器 ── 200 JSON（原样回传）──▶ 浏览器
```

**同域之后，CORS 头是冗余的**

配置原文里 location / 还带了一段 CORS 响应头（Access-Control-Allow-Origin 等）。理解它为什么冗余，只需要回到 CORS 的执行者：**同源策略与 CORS 检查都发生在浏览器**。本部署里页面来自 nginx、接口也发往同一个 nginx（路径前缀不同不影响源），协议、域名、端口三元组完全一致——这是**同源请求**，浏览器根本不会发起 CORS 检查，那些响应头没有任何消费者。它们只有在「页面与接口真跨域、浏览器直连后端」的架构里才有意义。保留它无害但误导读者，规范的做法是删除或注明来历——通常它是从某个「跨域演示配置」模板里抄来的遗迹。

> **记忆卡：location / 管静态，/admin-api/ 管转发，try_files 兜底 SPA**
> root 是 URL→磁盘的拼接基准（必须与 COPY 目标一致）；`try_files $uri $uri/ /index.html` 让 history 路由刷新不 404，但也让「缺失的资源」拿到 HTML（排查时先看响应类型）。proxy_pass 末尾斜杠决定前缀去留：带 URI = 替换前缀，不带 = 原样透传。同域部署下 CORS 头无消费者——跨域从来不是被解决了，是被反代绕开了。

**边界与陷阱**

三个高频坑：一个在转发路径上，一个在兜底逻辑的副作用里，一个在请求体限制上。

**坑 1：proxy_pass 末尾多写一个斜杠，接口前缀被剥**

反例：

```nginx
location /admin-api/ {
  proxy_pass http://boot:21080/;   # 末尾带了 /
}
# 浏览器：GET /admin-api/user
# 后端收到：GET /user  → 404
# nginx 日志里却看得到这条请求
```

带 URI（哪怕只有一个 /）就触发「前缀替换」：/admin-api/ 被换成 /，前缀没了。后端路由表里根本没有 /user，只能 404。

正例：

```nginx
location /admin-api/ {
  proxy_pass http://boot:21080/admin-api/;
}
# 后端收到 /admin-api/user，与前端约定一致
# 或干脆不带 URI：proxy_pass http://boot:21080;
```

验证方法很简单：在后端或 tcp 层看真实收到的路径；改斜杠前后对比一次，这条规则就再也不用背了。

**坑 2：缺失的资源不报 404，返回了一份 HTML**

反例：

```javascript
// 前端代码：
fetch('/api/data')        // 命中 location / （没配反代）
//  ← 返回 200，body 是 index.html！
img.src = '/images/logo.png'  // 资源没打进 dist
//  ← 200，body 还是 index.html，图片解析失败
```

try_files 把「找不到」全部变成「返回首页」，404 从此绝迹——问题被藏起来了。SPA 架构下「状态 200 但内容不对」是常态，排查必须看响应类型与内容。

正例：

```bash
# 排查口诀：先看响应是什么，再看状态码
$ curl -sI https://site.corp.com/api/data
Content-Type: text/html     ← 拿到的是网页不是接口！
# 说明请求落进了 location / 的兜底：
# 检查反代 location 是否存在、前缀是否写对
```

SPA 的 404 长着 200 的脸。凡是「接口/资源返回了网页」，第一嫌疑就是请求没进预期的 location。

**坑 3：上传接口报 413，后端毫无感知**

反例：

```text
# 用户上传 500MB 视频文件
# 请求根本没到后端——nginx 直接拒了：
HTTP/1.1 413 Request Entity Too Large
# 后端日志：一片安静
```

nginx 默认请求体上限只有 1MB，本配置放宽到 300m。超过上限的请求在代理层就被拒绝，后端不会有任何日志——「后端说没收到请求」时的第一嫌疑人。

正例：

```nginx
http {
  client_max_body_size 300m;   # 按业务上限留余量
}
# 配置是 COPY 进镜像的，改它 = 改源文件
# → 重新 build → push → 更新容器（不能 exec 里改完就算）
```

记住这条配置在镜像里：改它要走一次完整构建。另外 K8s 入口若还有一层 ingress，两层都要放行，任何一层拒了都是 413。

> **提示：改配置的正确姿势。** 这份 nginx.conf 是被 Dockerfile `COPY` 进镜像的——在容器里 `vi` 改它只影响那一个容器实例，重建即蒸发。正确路径永远是：改仓库里的 conf 源文件 → 重新构建镜像 → 更新容器。想快速验证一段配置语法，用 `docker run --rm -v 配置:/etc/nginx/nginx.conf nginx nginx -t`（把本地配置挂载进一次性容器做语法检查），不会污染任何现有容器。

**动手练习**

- 练习 1（反代、前缀约定）：后端团队决定接口前缀从 `/admin-api/` 改为 `/api/`（后端路由本身不变，仍接受 /admin-api/ 开头）。前端与 nginx.conf 各需要改什么？
- 答案：前端改环境变量 `VITE_GLOB_API_URL=/api` 并重新构建；nginx.conf 把 `location /admin-api/` 改为 `location /api/`，proxy_pass 写法二选一：`proxy_pass http://cnsig-ems-boot:21080/admin-api/;`（带 URI，把 /api/ 前缀替换回后端认的 /admin-api/——正适合"后端路由不变"的场景）。注意 proxy_pass 的替换逻辑在这里从「原样保留」变成了「改写前缀」，改完用 curl 核对后端实际收到的路径。
- 练习 2（WebSocket、location）：前端要连 `wss://site.corp.com/ws` 长连接（后端 21080 端口提供 /ws 服务），当前配置下会发生什么？补上缺失的配置。
- 答案：当前配置没有 location /ws，握手请求（GET /ws + Upgrade 头）落进 location / 的兜底，返回的是 index.html——WebSocket 握手失败，前端报连接错误。需要新增：`location /ws { proxy_pass http://cnsig-ems-boot:21080/ws; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "Upgrade"; }`——升级头虽然全局有了，但逐跳头必须在该 location 的代理层显式存在，缺一握手必失败。

**追问链**

五问沿一次请求的路径，从回退逻辑问到配置的批判性阅读。

**用户在 /login 页面按下 F5 刷新，nginx 返回的是什么？磁盘上有 login 这个文件吗？**

磁盘上没有 login 文件。nginx 按 try_files 顺序检查 $uri（login，不存在）、$uri/（login/ 目录，不存在），最后内部重定向到 /index.html——返回的是首页的 HTML，浏览器加载完整前端后由 vue-router/react-router 接管，渲染出登录页。地址栏里的 /login 从头到尾只是前端路由的记号，从未对应过一个真实文件。

追问：hash 模式（/#/login）不需要这条兜底——# 后的部分不发给服务器，服务器永远只见到 /。

**这份配置下，浏览器请求 /admin-api/user 属于跨域吗？CORS 检查发生在哪一层？**

不属于。同源判定看协议、域名、端口三元组：页面来自 nginx 的 80 端口，接口也发往同一个 nginx 的 80 端口，前缀 /admin-api 只是路径——三元组完全一致，是同源请求，浏览器不会发起 CORS 检查。真正改变源的「跨域请求」根本没发生：跨到后端的那一跳是 nginx 在服务端完成的，同源策略管不到服务器之间的通信。配置里那段 CORS 响应头在同域部署下没有任何消费者，是冗余的。

追问：反推也成立：如果接口地址写成了 http://api.corp.com（另一个源），浏览器直连后端，此时后端必须配 CORS——反代方案正是为了把这个场景彻底消灭。

**location /admin-api/ 下，proxy_pass 写 http://boot:21080 与 http://boot:21080/ 有什么区别？请求 /admin-api/user 分别转发成什么？**

不带 URI（写到端口为止）：请求 URI 原样透传，后端收到 /admin-api/user。带 URI（哪怕只有一个 /）：location 匹配到的前缀 /admin-api/ 被替换成指令里的 URI——写 / 就替换成 /，后端收到 /user，前缀被剥掉。所以「带不带斜杠」的本质是「带不带 URI」，差一个字符就是两种转发语义。

追问：写 /admin-api（结尾无斜杠）替换后等于把前缀改成 /admin-api，视觉上与原样透传一样——但语义已变，后端路径约定变了时要特别小心。

**为什么普通 HTTP 接口不用配 Upgrade/Connection 头，WebSocket 就必须配？**

WebSocket 复用 HTTP 握手：客户端发一个带 Upgrade: websocket 的 GET，要求把这条连接从「一问一答」升级为「持久双向」。而 Connection/Upgrade 属于 hop-by-hop 头——语义只作用于当前这一跳，代理默认不转发它们。nginx 不转发，握手就到不了后端。所以反代配置必须显式 proxy_set_header Upgrade 与 Connection，并升级到 HTTP/1.1（nginx 默认用 1.0 与后端通信，1.0 没有升级机制）。

追问：生产上还要注意代理层与后端之间的读超时：长连接空闲期间没有数据，proxy_read_timeout 到期会掐断连接，做法是调大超时或让业务层发心跳。

**用批判的眼光重读这份配置：哪些行其实可以删或值得商榷？**

至少三处。① CORS 响应头整段冗余（同域部署无消费者），应删或注明来历；② server_name localhost（原文里还有这一行，未入上文节选）在容器里意义有限——匹配靠的是 location 与端口，这个值只在多虚拟主机时才起作用；③ worker_processes 1 是保守值，CPU 有富余时写 auto 更合理。反过来 error_page 的 50x 页面、client_max_body_size 都是有真实职能的行——批评的前提是逐行问过「它在防什么事故」。

追问：可改进而不仅是可删的：静态资源若由构建期压缩（VITE_COMPRESS）或 nginx gzip 提供，还应补上强缓存策略（assets/ 带 hash 可长缓存），这是这类模板配置普遍缺失的一块。

延伸阅读：《5 行的 Dockerfile 是怎么变成镜像的？》（前置：root 与 COPY 目标的暗约定——本篇 location / 的前置条件）、《部署脚本 deploy.sh 每一步在做什么？》（把这份配置装进镜像并推上仓库的脚本逐段精读）。

### 部署脚本 deploy.sh 每一步在做什么？

*难度：入门 ｜ 标签：shell、deploy.sh、set -e、getopts、docker push*

**一百多行的部署脚本，真正干活的只有最后两条命令**：`docker build` 和 `docker push`——前面全是外壳：参数解析、防呆校验、彩色输出。读它的正确姿势是抓四件事：**set -e** 保证任何一步失败立即中止（绝不带病续跑）；**getopts** 把 -n 镜像名、-v 版本号收进变量；**材料目录的暗约定**——镜像名叫什么就去 /home 下找同名目录；最后在材料目录里 build 出镜像、push 上私服。脚本是调用命令的人机接口，**装配的智能在 Dockerfile，分发的智能在仓库**。

**逐段精读：从 130 行到一张骨架**

原脚本大段篇幅是颜色定义、帮助信息和错误提示函数，逻辑骨架抽出来长这样（保留全部关键语句；唯一展开：原脚本把 docker build 包在 if 里、失败显式报错退出，骨架里写成裸调用，见末行注释）：

```bash
#!/bin/bash
# 全脚本最重要的一行：任何命令以非零状态结束，整个脚本立即中止。
# 没有它，build 失败后脚本会继续 push——把旧镜像推上去还报告成功。
set -e

# 环境约定写成常量：仓库地址与材料根目录，换环境才需要改；
# 每次运行会变的输入（镜像名、版本号）则从参数来。
REGISTRY="112.26.45.227:10001"   # 镜像推往的私有仓库
BASE_DIR="/home"                 # 镜像材料所在的根目录

IMAGE_NAME=""
VERSION="1.0.0"

# getopts 是 bash 的内置参数解析器（会认即可，现代脚本已少手写）：
# 引号串是参数清单，字母带冒号表示「该参数必须跟一个值」。
while getopts "n:v:h" opt; do
    case $opt in
        n) IMAGE_NAME="$OPTARG" ;;
        v) VERSION="$OPTARG" ;;
        h) show_usage ;;
    esac
done

# [ -z xxx ] 判断字符串为空。必填参数缺失就在入口拦住并打印用法
# ——防呆逻辑前置，而不是跑到一半才炸。
if [ -z "$IMAGE_NAME" ]; then
    echo "镜像名称不能为空！"
    show_usage
fi

# 两行拼出全程的路标：镜像全名三段式「仓库/名字:tag」；
# 材料目录 = /home + 镜像名——目录名必须与镜像名一致，
# 这是个没写在注释里的暗约定。
IMAGE_TAG="${REGISTRY}/${IMAGE_NAME}:${VERSION}"
IMAGE_DIR="${BASE_DIR}/${IMAGE_NAME}"

# 存在性检查：目录、Dockerfile 不在就立即退出。
# 把「环境没准备好」的失败拦在构建开始之前。
if [ ! -d "$IMAGE_DIR" ]; then
    echo "目录不存在: ${IMAGE_DIR}"; exit 1
fi
if [ ! -f "${IMAGE_DIR}/Dockerfile" ]; then
    echo "Dockerfile 不存在"; exit 1
fi

# 从这一刻起，脚本的「当前位置」就是材料目录——后面 build 的那个 .
# 指向的就是这里，COPY 的 ./conf、./dist 也从这里算。
cd "$IMAGE_DIR"

# 清理段：本地有同仓库旧镜像就删掉当前 tag。实际上可以整段删——
# 同名 tag 重新 build 会自动顶掉旧的；它只是保持列表干净的化妆步骤。
if docker images | grep -q "${REGISTRY}/${IMAGE_NAME}"; then
    docker rmi "${IMAGE_TAG}" 2>/dev/null || echo "旧镜像不存在，继续"
fi

# 干活 ①：在材料目录装配镜像并打上完整三段式 tag。
# 上下文就是 cd 进来的这个目录。
docker build -t "${IMAGE_TAG}" .
# 干活 ②：推上私服。前提是这台机器 docker login 过——凭证存在
# ~/.docker/config.json，脚本里没有 login，换新机器跑第一步就会死在这里。
docker push "${IMAGE_TAG}"

# 注：原脚本把 docker build 包在 if 里，失败分支 print_error + exit 1；
# 骨架为省篇幅展开成裸调用，快速失败由 set -e 兜底（见追问链第 2 问）。
```

**getopts 拆解：用 JS 翻译一遍**

那个让很多人卡壳的 while/case 组合，功能用 JS 一行就能说清——

```javascript
// getopts "n:v:h" 循环的整体效果 ≈
const args = parseArgs(["-n", "cnsig-ems-ui", "-v", "1.0.1"])
//           → { n: "cnsig-ems-ui", v: "1.0.1" }
```

引号里的 `"n:v:h"` 是参数说明表：**字母后带冒号 = 这个参数必须跟一个值**，值自动存入 `$OPTARG`；case 分支只是把解析结果填进变量。h 是惯例的帮助开关。两个分支你没见过但值得认识：`\?` 接住「传了清单外的参数」、`:` 接住「该带值的没带值」——都算用法错误，原脚本在这两个分支里打印用法并退出。这套机制是 bash 内置的，不依赖任何工具，但可读性确实差——看懂「它在收参数」这个结论即可，实际工作中没人手写它，新脚本普遍用现成的参数库或环境变量。

**set -e 的精确规则：三个豁免场景**

「失败即退」听起来绝对，实际上 set -e 有明确的豁免清单——理解豁免才能解释脚本里那行 `docker rmi ... || echo 继续` 为什么不会让脚本中止：

| 场景 | 失败时会退出吗 | 原因 |
|---|---|---|
| 普通命令失败（如 docker push 断网） | 退出 | 默认规则：非零状态即中止 |
| if 条件里的命令失败 | 不退出 | 进入 else/跳过分支是预期行为，失败是「合法结果」 |
| A \|\| B 中 A 失败 | 不退出 | 执行 B——脚本的 \|\| echo 正是利用这一点让删除失败「不算失败」 |
| 管道 A \| B 中 A 失败（B 成功） | 不退出 | 默认只看最后一段的退出码；要连中间一起查需 set -o pipefail |

最后一行是脚本里真实的暗坑：`docker images | grep -q xxx` 若 docker images 失败，默认下 set -e 毫无察觉。严格脚本会在开头加 `set -o pipefail`（管道任一段失败即视为失败），与 set -e 搭配使用。

**真实执行一次：输出逐条解读**

在材料齐备的服务器上执行 `./deploy.sh -n cnsig-ems-ui -v 1.0.1`，输出如下，每一条都对应脚本的一个阶段：

```text
$ ./deploy.sh -n cnsig-ems-ui -v 1.0.1

[INFO] 镜像名称: cnsig-ems-ui                                     ← 校验阶段
[WARNING] 旧镜像不存在或删除失败，继续构建...                       ← 清理阶段
Sending build context to Docker daemon  12.3MB                    ← 构建阶段
Successfully tagged 112.26.45.227:10001/cnsig-ems-ui:1.0.1        ← 构建阶段
The push refers to repository [112.26.45.227:10001/cnsig-ems-ui]  ← 推送阶段
1.0.1: digest: sha256:9f2a1c... size: 1571                        ← 推送阶段
```

- 校验——`[INFO] 镜像名称: cnsig-ems-ui`：getopts 已收完参数，[ -z ] 校验通过后脚本回显拼好的信息——这一步过了，说明参数与目录检查全部通过。
- 清理——`[WARNING] 旧镜像不存在或删除失败，继续构建...`：清理段分支：本地没有同名旧镜像（或 rmi 失败）。|| echo 让它「失败也不中止」，脚本继续。
- 构建——`Sending build context to Docker daemon 12.3MB`：docker build 第一步：把材料目录（上下文）整体打包交给引擎。这里出现的是 conf + dist + Dockerfile 的体积。注：这行是 legacy builder 的输出，BuildKit（Docker 23+ 默认）下同一过程打印 transferring context 等不同形态。
- 构建——`Successfully tagged ...:1.0.1`：逐行执行清单完毕（FROM 底座 + COPY conf + COPY dist），镜像按 -t 参数打好标签存入本机镜像库。Successfully tagged 同为 legacy builder 输出，BuildKit 下对应的是 naming to … 一类的行。
- 推送——`The push refers to repository [...]`：docker push 开始：引擎把本地层与仓库比对，只上传仓库里没有的层（底座层早已存在时几乎零传输）。
- 推送——`1.0.1: digest: sha256:9f2a1c... size: 1571`：推送完成的标志：digest 是内容的哈希指纹，等价于这次构建的「身份证号」。脚本此后打印成功横幅并退出。

> **记忆卡：脚本是接口，不是引擎**
> 部署脚本的骨架四件事：**set -e 快速失败 → getopts 收参 → 校验拦错 → cd 进材料目录 build + push**。材料目录暗约定：`/home/镜像名` 目录里必须有 Dockerfile、conf/、dist/。push 的前提是本机 login 过；推送成功的标志是拿到 digest，不是脚本那句横幅。

**它和 CI 通道是什么关系**

同一个仓库里往往两套通道并存：**脚本通道**（dist 传上跳板服务器，人执行 deploy.sh）与**CI 通道**（git push 触发流水线，CI 机器执行同样的 build + push，随后 kubectl 滚动更新）。它们的 Docker 命令完全同源——CI 的流水线脚本里就是 `docker build -f docker/Dockerfile -t 私服:tag` 加 `docker push`，差别只有两处：原料来源（CI 从干净检出拷 dist，脚本吃上传上来的 dist）与凭证管理（私服 push 权限发给 CI 还是发给跳板机）。理解了这一点，读任何团队的部署脚本都能秒懂骨架——也就能判断哪些环节值得搬进 CI、哪些校验值得抄回脚本。

**边界与陷阱**

三个高频坑：两个出在 shell 语义上，一个出在脚本作者的手上。

**坑 1：以为有 set -e 就万事大吉**

反例——管道盲区：

```bash
#!/bin/bash
set -e
docker build -t app:1.0 . | tee build.log
# build 真的失败了，但 tee 成功
# → 脚本看到退出码 0，继续往下跑 push
```

管道的退出码取最后一段。build 的失败被 tee 的成功掩盖，set -e 全程不知情——这是「我明明写了 set -e 为什么没拦住」的头号原因。

正例：

```bash
#!/bin/bash
set -e
set -o pipefail   # 管道任一段失败即视为失败
docker build -t app:1.0 . | tee build.log
# build 失败 → 管道失败 → 立即中止
```

两条开关是一对：set -e 管「失败要退」，pipefail 管「失败能被看见」。生产脚本两个都写。

**坑 2：改脚本时丢掉变量两侧的双引号**

反例：

```bash
cd $IMAGE_DIR
# 若目录名是 /home/my app（带空格）
# bash 会拆成两个词：
# cd /home/my 和 app 两个参数
# → cd: too many arguments
```

未加引号的变量会经历单词拆分与通配符展开——空格、星号都是地雷。原脚本处处 "$变量" 就是防这个。

正例：

```bash
cd "$IMAGE_DIR"
docker build -t "${IMAGE_TAG}" .
# 引号让变量永远是一个整体
```

给脚本提 PR 时的自查项：新加的每一处变量引用，两侧都有双引号吗？这条纪律能消灭 shell 脚本一整类诡异 bug。

**坑 3：grep 的 pattern 里藏着正则通配符**

反例：

```bash
docker images | grep -q "112.26.45.227:10001/cnsig-ems-ui"
# grep 的 . 是「任意字符」：
# 这个 pattern 也能匹配 112x26y45z227...
# 恰好无同形仓库，纯属侥幸
```

IP 地址里的点在 grep 正则里是任意字符通配符。想按字面匹配用 grep -F（fixed string），或转义每个点。

正例：

```bash
docker images | grep -qF "112.26.45.227:10001/cnsig-ems-ui"
# -F：按固定字符串匹配，. 就是 .
```

顺便一个更严格的写法：grep -qF 用在脚本里既准确又自文档——「我要找的就是这串字面量」。

> **提示：凭证在脚本之外。** 脚本没有处理 `docker login`——它默认这台机器登录过私服。换新机器或凭证过期时，失败点会精确出现在 push 这一步（denied / unauthorized）。部署机的凭证管理（~/.docker/config.json 或 credential helper）是脚本的前置条件，属于交接文档必须写清的一项。

**动手练习**

- 练习 1（getopts、改造）：给脚本增加 `-r` 参数指定仓库地址（不传时用默认 `112.26.45.227:10001`）。写出需要改动的三处。
- 答案：

```bash
REGISTRY="112.26.45.227:10001"      # ① 保留作默认值

while getopts "n:v:r:h" opt; do     # ② 清单加 r:
    case $opt in
        ...
        r) REGISTRY="$OPTARG" ;;    # ③ 新分支：覆盖默认值
    esac
done
# 镜像全名一行不用改——它引用的就是 $REGISTRY
```

- 练习 2（失败分析、set -e）：执行到 `docker push` 时网络中断失败。此刻本地镜像库里有什么？私服上有什么？正确的恢复动作是什么？
- 答案：build 已成功：本地镜像库里有打好 1.0.1 tag 的完整镜像；push 失败触发 set -e 立即中止，私服上没有 1.0.1（或只有不完整的中间状态）。恢复动作：确认网络后直接重跑同一条命令——build 阶段全部命中层缓存秒过，push 从断点层继续。这正是「快速失败」的价值：失败被拦在当前动作，不会污染前序环节的成果。

**追问链**

五问从防呆入口问到 shell 失败语义的精确规则。

**直接执行 ./deploy.sh 不带任何参数，会发生什么？**

getopts 循环零次通过（没有参数可解析），IMAGE_NAME 保持空串，[ -z ] 判空命中，打印「镜像名称不能为空」并调用 show_usage 展示用法后退出。整个流程发生在任何 docker 命令之前——不消耗构建资源，也不产生任何副作用。

追问：show_usage 里通常还带 -h 分支：主动打印帮助而不算错误，这是脚本人机接口的礼貌。

**build 失败了，脚本为什么一定不会执行 push？如果有同事把 set -e 删了呢？**

set -e 在 docker build 以非零状态结束时立即中止脚本。删掉 set -e 后，原脚本仍安全：build 被包在 if 里，失败分支显式 print_error 并 exit 1。这叫双重保险——但两道保险都删了，脚本就会带着失败的镜像继续 push（推上去的是上一个 tag 的内容，危害极大）。结论：快速失败至少要有一道，最好两道。

追问：CI 通道里同样的保障来自流水线本身：任一步骤非零退出即终止流水线，等价于天然 set -e。

**-n 传的镜像名和材料目录是什么关系？./deploy.sh -n training-ui 会发生什么？**

脚本拼出 IMAGE_DIR=/home/training-ui，然后要求这个目录存在、里面有 Dockerfile。也就是说材料目录的名字必须与 -n 参数完全一致——约定由这两行拼接与校验代码隐式执行，没有任何注释说明。传 training-ui 就去 /home/training-ui 找材料；材料实际放在别处时，只能迁就目录名或改脚本。

追问：改进方向：加 -d 参数显式传材料目录，镜像名与目录名解耦——很多团队的脚本演化史就是从这个坑开始的。

**这套脚本通道与 CI 通道的边界怎么划？哪些环节天然属于 CI？**

脚本通道的原料是「人工上传的 dist」——不可追溯、无法审计是谁的什么提交构建的；CI 通道从 git 干净检出构建，每个镜像都能回溯到一次提交。所以与「内容正确性」相关的环节（构建 dist、跑测试、打版本 tag）天然属于 CI；脚本通道的合理残留是「内网操作」——在内网机器上 load/重建容器这类 CI 够不到的动作。私有仓库凭证只应发给 CI 服务账号或一台跳板机，而不是每个开发者的机器。

追问：折中形态：CI 只负责 build+push，内网用 watchtower 类工具或 webhook 触发拉取——通道合并成一条，人工环节归零。

**精确说出 set -e 的豁免规则；管道中间失败为什么它看不见，怎么补？**

豁免三条：命令出现在 if/while 的条件位置时，失败只是「条件为假」不触发退出；命令出现在 && 或 || 链中间时，由短路逻辑决定（只有链条最终的失败才触发）；命令在管道中间时，默认只有最后一段的退出码算数。补法是 set -o pipefail：管道中任何一段失败，整条管道即以失败告终，与 set -e 组合后盲区消除。

追问：还有一条冷规则：set -e 在子 shell（命令替换 $(...)）里的失败同样不会传染给父 shell——关键命令的退出码要么显式 if 判断，要么写进管道让 pipefail 兜住。

deploy.sh 逐段过手清单：

- getopts 段：-n/-v 参数各演练一遍——缺参数时的 usage 提示要真的触发
- 验证 set -euo pipefail 的行为——任一步失败立刻停，不带病继续
- 构建段失败时不会推送旧镜像——顺序依赖靠 && 链或 set -e 保证
- 回滚入口演练：上上个版本号能用——没演练过的回滚等于没有回滚

延伸阅读：《nginx.conf 是怎么让页面和接口都通的？》（前置：脚本 build 进镜像的那份配置，逐行拆解）、《AI 拼的 grep 管道怎么读懂？》（脚本里 grep -q、管道、退出码的完整原理与更多玩法）。

### 容器跑起来后页面 502，怎么一步步排查？

*难度：入门 ｜ 标签：docker exec、docker logs、502、排障、端口映射*

**排障的钥匙是理解 502 的本义——nginx 活着，但它身后的服务死了或答非所问**（它作为网关从上游拿到了无效响应）。所以排查方向永远是**从 nginx 往回游**：先确认容器层面谁在跑（`docker ps -a`），再听主进程的口供（`docker logs`），然后钻进 nginx 容器直接探测后端（`docker exec ... curl 后端:端口`）。三条典型故障各有起点：**502 查后端连通**、**容器秒退查 logs**、**页面 404 或欢迎页查配置生效**（root 与 COPY 的暗约定、conf 是否真的被覆盖）。一句纪律压轴：在容器里改动验证出来的"正常"都是假阳性，配置必须进镜像才算数。

**前置：请求是怎么到达容器的（-p 端口映射）**

排查访问问题前，先建立端口模型。容器默认并不对宿主机以外暴露任何端口：

> Use the --publish or -p flag to make a port available outside the host, and to containers in other bridge networks.（Docker Docs · Network overview）

`docker run -d -p 8080:80 镜像` 的含义是**宿主机 8080 → 容器 80**（冒号左边是宿主机，右边是容器，nginx 在容器里监听的是 80）。用户访问 host:8080，Docker 把流量转进容器的 80。K8s 里同构的概念是 Service 的端口映射（NodePort/LB）——模型一致，命令不同。凡「连接被拒/超时」，第一件事是看映射是否存在：

```bash
$ docker ps
CONTAINER ID   IMAGE                          ...   PORTS
b3f2c1aa90e2   cnsig-ems-ui:1.0.0             ...   0.0.0.0:8080->80/tcp
                                         ↑ 有映射：宿主机 8080 → 容器 80
# PORTS 列为空 = 没发布端口：容器内服务只有
# 宿主机和同网络容器能访问，外部一律连不上
```

**工具四件套：每条命令回答一个问题**

排障命令不在多，在知道「哪句话问谁」。四件套正好覆盖容器的四个侧面：

| 命令 | 回答的问题 | 一行示例 |
|---|---|---|
| docker ps -a | 谁在跑？谁退了？退出码是多少？ | docker ps -a --format table（看 STATUS 列：Up / Exited (1)） |
| docker logs | 主进程说了什么（stdout/stderr）？ | docker logs --tail 100 -f 容器名 |
| docker exec | 进到容器里现场验证 | docker exec -it 容器名 sh |
| docker inspect | 容器的配置真相（端口/挂载/镜像 ID） | docker inspect 容器名 \| grep -A5 Ports |

```bash
# 状态：Up（活着）与 Exited (1)（退出，退出码 1）
$ docker ps -a
CONTAINER ID   STATUS                     NAMES
b3f2c1aa90e2   Up 3 minutes               cnsig-ems-ui
71c9d0e4f5a1   Exited (1) 5 seconds ago   cnsig-ems-ui-old

# 口供：nginx 容器的日志（访问日志+错误日志都在这）
$ docker logs --tail 3 cnsig-ems-ui
10.244.0.11 - - "GET /admin-api/user HTTP/1.1" 502 559
2026/09/08 10:22:31 [error] 31#31: connect() failed (111: Connection refused)
while connecting to upstream, client: 10.244.0.11, server: localhost,
request: "GET /admin-api/user HTTP/1.1", upstream: "http://10.96.3.7:21080/admin-api/user"
```

这几行口供信息量极大：nginx 把请求转给上游 `cnsig-ems-boot:21080` 时收到**Connection refused**——连接被拒绝，所以给浏览器回了 502。注意错误信息里 upstream 的地址被解析成了具体 IP：nginx 启动时就把容器名解析好了。看懂一条 error 日志，排查就完成了大半。

**故障一：502——nginx 活着，身后死了**

502 的权威定义来自 HTTP 规范：

> The 502 (Bad Gateway) status code indicates that the server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed while attempting to fulfill the request.（RFC 9110 §15.6.2）

翻译到本架构：nginx 收到了浏览器的请求（所以它活着），但作为代理去连后端 `cnsig-ems-boot:21080` 时失败了（连不上，或拿到无效响应）。可能性按概率排：后端容器挂了、后端服务没起来（端口没监听）、后端容器名写错（DNS 解析不到）。决策树：

```text
                 [页面 502]
                     │ docker exec
                     ▼
          [exec 进 nginx 容器探后端]
              │              │
        网络是通的        拒绝/超时
        curl 后端:端口 通   Connection refused / 不通
              │              │
              ▼              ▼
     [查后端应用日志]   [查后端容器状态与名字解析]
     （问题在后端应用层） （问题在容器/网络层）
```

探测命令一行——从 nginx 容器内部直接打后端（同网络的容器可以用容器名互相访问，这是 Docker 内置 DNS 的能力）：

```bash
$ docker exec cnsig-ems-ui wget -qO- --timeout=3 \
    http://cnsig-ems-boot:21080/admin-api/actuator/health
wget: server returned error: HTTP/1.1 503
# 或 BusyBox 无 curl 时用 wget；通了说明网络层无恙，
# 问题在后端应用（看它的日志），不通就看它的容器还在不在
```

**故障二：容器秒退（起了就死 / 重启循环）**

另一类问题走不到 502——nginx 自己就没活下来。`docker ps` 里看不到它，`docker ps -a` 里看到 `Exited (1)` 或 K8s 里的 CrashLoopBackOff。口供永远是第一步：

```bash
$ docker logs cnsig-ems-ui
nginx: [emerg] unknown directive "provxy_pass" in
/etc/nginx/nginx.conf:30

# 典型口供对照：
# [emerg] unknown directive   → 配置打错字/版本不支持该指令
# [emerg] open() "/etc/nginx/.../cert.pem" failed   → 证书文件没进镜像
# [emerg] host not found in upstream "cnsig-ems-boot" → 启动时解析不到后端
```

nginx 对配置是**零容错**的：一条指令拼错，进程拒绝启动，容器随之秒退。预防手段是上线前做语法预检——用一次性容器验证挂进去的配置，通过再构建正式镜像：

```bash
$ docker run --rm -v "$PWD/conf/nginx.conf:/etc/nginx/nginx.conf:ro" \
    nginx:stable-alpine nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**故障三：容器活着，页面 404 或显示欢迎页**

最迷惑的一类：容器健康、请求 200，但页面不对。两种形态对应两个诊断：**404**——root 指的目录里没有 index.html，查 Dockerfile 的 COPY 目标与 nginx.conf 的 root 是否一致（系列里反复出现的暗约定）；**Welcome to nginx**——看到的是官方默认欢迎页，说明你的 nginx.conf 根本没被加载（COPY 目标写错、没覆盖成功）。现场验证只需一条命令——直接看容器里的配置长什么样：

```bash
$ docker exec cnsig-ems-ui head -30 /etc/nginx/nginx.conf
worker_processes  1;
...
location / {
    root   /home/cnsig/cnsig-ems-ui;   ← 是你的配置，还是官方默认？
}
# 再验证文件真的在：
$ docker exec cnsig-ems-ui ls /home/cnsig/cnsig-ems-ui
index.html  assets/
```

> **记忆卡：三层排查：容器层 → 网络层 → 配置层**
> **容器层**：`ps -a` 看生死与退出码，`logs` 听口供（秒退原因几乎全在日志第一屏）。**网络层**：`exec` 进 nginx 容器探后端（容器名即域名），502=身后死了、504=身后太慢。**配置层**：`cat` 容器里的 conf 对照暗约定（root↔COPY），欢迎页 = 配置未生效。

**边界与陷阱**

排障本身的三个坑——都发生在「以为验证过了」的时刻。

**坑 1：exec 改配置 + restart 验证，得到的正常是假阳性**

反例：

```bash
$ docker exec -it cnsig-ems-ui vi /etc/nginx/nginx.conf
$ docker restart cnsig-ems-ui
# 页面正常了！下班。
# ——两周后节点重建/换机部署：改动蒸发，事故复发
```

restart 只是重启主进程，容器的可写层原样保留——exec 改的文件还在。rm + run（或换节点调度）才是真实环境，那时配置回到镜像里的旧版。

正例：

```bash
# 临时验证后，立刻把改动固化进镜像：
$ vi conf/nginx.conf          # 同样的改动写进源文件
$ docker build -t .../cnsig-ems-ui:1.0.2 .
$ docker push .../cnsig-ems-ui:1.0.2 && 更新容器
# 从此任何节点拉起的容器都带着这份配置
```

exec+restart 只能证明「这段配置能修问题」，不能证明「问题已修复」。配置生效的唯一凭证是它进了镜像。

**坑 2：-p 冒号两侧写反**

反例：

```bash
$ docker run -d -p 80:8080 cnsig-ems-ui:1.0.0
# 本意：宿主机 8080 → 容器 80
# 实际：宿主机 80   → 容器 8080
# 访问 8080 → Connection refused
# （容器里 nginx 只听 80，8080 无人监听）
```

-p 的顺序是「宿主机:容器」。写反后连接到达的是容器里没人监听的端口，症状是拒绝连接而非 502——因为请求根本没碰到 nginx。

正例：

```bash
$ docker run -d -p 8080:80 cnsig-ems-ui:1.0.0
$ docker ps
PORTS: 0.0.0.0:8080->80/tcp
# 记法：从外到内读——先宿主机，后容器
```

验收靠 docker ps 的 PORTS 列：箭头左边是宿主机端口（你访问的），右边是容器端口（nginx 监听的）。

**坑 3：进容器装 curl 排障，等于给现场镀金**

反例：

```bash
$ docker exec -it cnsig-ems-ui sh
/# apk add curl      # 现场装工具
/# curl http://boot:21080/health
# 排障结束。次日另一节点上的同版本容器：
# 没有 curl，步骤复现不了
```

exec 里的安装写进该容器的可写层——它不可复制、不可追溯，还让「线上到底跑了什么」失去准头。

正例：

```bash
# 用镜像自带的工具（alpine 自带 BusyBox wget）：
$ docker exec cnsig-ems-ui wget -qO- http://boot:21080/health
# 或起一个一次性排障容器，用完即焚：
$ docker run --rm --network container:cnsig-ems-ui \
    curlimages/curl http://localhost:80/health
```

排障工具不进业务容器——要么用现成的，要么用一次性容器共享目标容器的网络栈，用完 --rm 消失。

> **提示：K8s 环境的对照命令。** 这套四件套在 K8s 里一一对应：`docker ps` ≈ `kubectl get pods`（CrashLoopBackOff 就是「秒退重启循环」）、`docker logs` ≈ `kubectl logs`、`docker exec` ≈ `kubectl exec -it`、`docker inspect` ≈ `kubectl describe pod`。-p 端口映射的角色由 Service 接管。学完 Docker 层的排查，K8s 层只是换了套动词。

**动手练习**

- 练习 1（端口映射、docker ps）：`docker ps` 显示某容器 PORTS 列为空，浏览器访问宿主机 8080 被拒绝。给出诊断与两种修复命令。
- 答案：诊断：容器启动时没有发布端口（漏了 -p），按默认规则只有宿主机和同网络容器能访问它，外部全部拒绝。修复二选一：① 重新 run 并带上 `-p 8080:80`（容器不能事后追加端口映射，只能重建）；② K8s 场景检查 Service 的 port/targetPort 配置。另注意 8080:80 与 80:8080 的方向——拒绝连接时用 `docker exec` 确认 nginx 实际监听的端口。
- 练习 2（502、排查顺序）：页面 502。按顺序写出你会执行的前三条命令（每条注明「想确认什么」），以及 `docker logs` 里出现 `connect() failed (111: Connection refused)` 时你的结论。
- 答案：① `docker ps`——nginx 容器与后端容器谁在跑（想确认后端是否活着）；② `docker logs --tail 50 nginx 容器`——看 upstream 错误详情（想确认失败环节是连接还是响应）；③ `docker exec nginx 容器 wget -qO- 后端:21080/health`——从网络层直接探测（想区分「容器死了」还是「服务没监听」）。日志出现 Connection refused 的结论：nginx 到后端的连接被拒绝，通常是后端进程没在监听（挂了或没起来）——网络通、DNS 通，去后端容器查应用日志。

**追问链**

五问从命令语义问到排障方法论的边界。

**docker ps 和 docker ps -a 的区别是什么？Exited (1) 里的 1 是什么？**

ps 只显示运行中的容器，ps -a 显示全部（含已退出）。Exited (1) 的 1 是主进程的退出码：nginx 配置错误时进程以 1 退出并带走容器。退出码是惯例语言——0 正常退出，非 0 异常，这与 shell 脚本的 set -e 判断的是同一套编码。

追问：`docker inspect 容器名` 的 State 字段还有 ExitCode、Error、OOMKilled 等细节，比 ps 更完整。

**docker logs 看到的日志是从哪来的？为什么 nginx 的访问日志也能用它看？**

docker logs 读取的是容器主进程（PID 1）及其子进程写到 stdout/stderr 的内容，Docker 把它们落成 JSON 文件按需回放。nginx 官方镜像把 /var/log/nginx/access.log 软链到 /dev/stdout、error.log 软链到 /dev/stderr——nginx 写日志文件时实际写进了标准输出流，于是被 Docker 收编。这是容器日志最佳实践（只写 stdout）的实物示范。

追问：logs 默认不跟随，-f 等价 tail -f；文件驱动默认无轮转，久了会撑爆磁盘，生产要配 logging 选项或专门的日志采集。

**502 和 504 都是 nginx 给的，分别对应后端的什么状态？排查动作有什么不同？**

502 = nginx 连上了后端但拿到无效响应，或干脆连接被拒（connect refused 时 nginx 也回 502）——指向后端死了/没监听/协议不对，排查方向是后端进程与端口。504 = 连接成功但后端在超时时间内没回话——指向后端太慢或 nginx 的 proxy_read_timeout 太短，排查方向是后端耗时与超时配置。一个是「没有人接电话」，一个是「接了电话不说话」。

追问：网关类错误码都出自代理层：看到 502/504，先确认它是不是 nginx 发的（响应头 Server 字段），再决定往哪边查。

**K8s 里这套排查怎么对应？CrashLoopBackOff 大概率对应本篇的哪个故障？**

一一对应：docker ps → kubectl get pods；docker logs → kubectl logs；docker exec → kubectl exec -it；docker inspect → kubectl describe pod。-p 端口映射由 Service 承担。CrashLoopBackOff 就是本篇「容器秒退」的集群形态：主进程反复退出，kubelet 按退避策略不断重启——排查动作完全相同：kubectl logs 看口供（往往第一屏就是 nginx: [emerg] 配置错误）。

追问：describe pod 的 Events 段会告诉你镜像拉取失败、探针失败等非应用层原因——它比 inspect 更会「说话」。

**排障时 exec 进容器装了个 curl，问题解决了但隐患埋下了——这套操作的根本问题是什么？**

根本问题：容器被当成了持久的机器而非不可变交付物。exec 安装写进可写层——它不在镜像里，任何重建/迁移/扩容都拿不到这份「修复」；同时它让线上容器的真实内容偏离镜像，审计与复现全部失真。正确姿势：临时探测用容器自带工具或一次性排障容器；定位根因后把修复落到配置/代码，走构建出镜像，让「修复」通过分发系统到达所有节点。

追问：这套纪律的名字叫不可变基础设施（immutable infrastructure）：东西只被替换、不被修改——与镜像 immutable 的设计动机一脉相承。

502 排查链路自查清单：

- `docker ps`：容器 Up 且端口映射如预期——Exited/Restarting 直接转看 logs
- `docker logs`：上游应用自身有没有报错——502 多数是上游挂了，先看上游日志
- 容器内 `curl 127.0.0.1:<应用端口>`——通则问题在 nginx 段，不通在应用段
- 宿主机 `curl 容器 IP:PORT`——验证 docker 网段可达性
- `curl -I` 分清 502 与 504——502=上游不可达，504=上游超时，排查方向不同

延伸阅读：《部署脚本 deploy.sh 每一步在做什么？》（前置：跑在本篇容器之前的那个脚本，set -e 与骨架精读）、《Docker 的镜像、容器、仓库是什么关系？》（回到起点：系列第一篇的三对象）。
