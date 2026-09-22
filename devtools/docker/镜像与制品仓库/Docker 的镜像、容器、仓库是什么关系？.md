# Docker 的镜像、容器、仓库是什么关系？

*类型：knowledge ｜ 难度：入门 ｜ 标签：Docker、镜像、容器、镜像仓库、tag ｜ 更新：2026-09-10*

**三个对象是一条流水线上的三个角色：镜像是只读的标准化软件包，打包了运行一个应用所需的全部文件；容器是这个包跑起来的隔离进程，一个镜像可以同时派生任意多个容器；仓库是集中存取与分发镜像的服务，`docker push` 上传、`docker pull` 下载，分工等同 npm 的 publish / install。完整镜像名由仓库地址 / 镜像名 : tag 三段拼成，每一段都有默认值，漏写就会落到公共仓库或 latest 标签上。一句话分工：仓库管存取，镜像管内容，容器管运行。**

## 三个对象各管一件事

镜像是磁盘上的一份静态产物。官方文档给的定义是——

> Docker Docs · What is an image?：A container image is a standardized package that includes all of the files, binaries, libraries, and configurations to run a container.

翻译成前端熟悉的东西：镜像 ≈ npm 上下载下来的那个包（tarball）——它是一个**只读的、自包含的成品**，nginx 程序、精简 Linux 底座、你的静态文件全在里面，本身并不运行。容器则是这个包“跑起来”的状态：官方把容器定义为**隔离的进程**——

> Docker Docs · What is a container?：Simply put, containers are isolated processes for each of your app's components.

类比面向对象：**镜像 ≈ 类，容器 ≈ 实例**。同一个镜像可以同时 `new` 出三个容器（三个 nginx 实例），互相独立、互不知晓；删掉任何一个容器，镜像毫发无损，随时再起一个。两者的维度对照：

| 维度 | 镜像 image | 容器 container |
| --- | --- | --- |
| 本质 | 只读的文件包（磁盘上的静态产物） | 运行中的隔离进程（基于镜像 + 一层可写层） |
| 数量关系 | 一个镜像可派生任意多个容器 | 每个容器必须基于某个镜像启动 |
| 删除后果 | rmi 删掉后无法再派生实例 | rm 只删运行实例和可写层，镜像不受影响 |
| 类比 | npm 包（tarball） | 依赖装好后跑起来的进程 |
| 查看命令 | docker images | docker ps |

## 镜像名三段式：漏一段就换一个世界

拿一个典型的企业内网镜像名逐段拆——部署脚本里最常见的写法就是把三个变量拼起来：`112.26.45.227:10001/cnsig-ems-ui:1.0.0`。三段各有职责，也各有默认值：

| 段 | 本例中的值 | 省略时的默认 |
| --- | --- | --- |
| 仓库地址（registry host） | 112.26.45.227:10001 | 官方仓库 docker.io |
| 命名空间 / 镜像名 | cnsig-ems-ui | docker.io 上无命名空间时归官方 library/ 所有 |
| 版本标签（tag） | 1.0.0 | latest |

也就是说你随手写的 `nginx:stable-alpine`，完整形态其实是 `docker.io/library/nginx:stable-alpine`——不写仓库地址时默认去公共仓库拉：

> Docker Docs · Build, tag, and publish an image：If no host is specified, Docker's public registry at docker.io is used by default.

最值得警惕的是第三段。`latest` 不是“最新的稳定版”这个官方概念，仅仅是一个**默认标签**——一个会漂移的指针：同名 tag 重新推送一次，它就指向新的内容，昨天和今天拉到的“同一个镜像”可能是两回事，出问题时你甚至说不清线上跑的是哪个版本。所以成熟团队的部署脚本都强制显式传版本号（比如 `-v 1.0.0`），把“这次部署到底是什么”钉死。

## 仓库：镜像世界的 npm registry

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

> Docker Docs · Build, tag, and publish an image：Before you're able to push an image to a repository, you will need to be authenticated.

## 不可变：镜像最重要的性质

三对象里还有一条贯穿一切的规则，官方一句话说死：

> Docker Docs · What is an image?：Images are immutable. Once an image is created, it can't be modified. You can only make a new image or add changes on top of it.

**镜像一旦生成不可修改**。它带来三个直接后果：其一，可追溯——`1.0.0` 永远是那次构建出来的样子，线上出问题拉同一个 tag 就能复现；其二，更新的唯一方式是**造一个新镜像**（这正是 Dockerfile 与构建流程的用武之地）；其三，运行中的容器里做的任何改动都**不会落回镜像**，容器销毁即消失——这是“改了容器里的配置文件、重启后又变回去”这类灵异现象的唯一真相。

```text
┌─ 记忆卡 ─────────────────────────────────────────────────────────┐
│  仓库管存取，镜像管内容，容器管运行                              │
└──────────────────────────────────────────────────────────────────┘
```

- 镜像是只读的标准化软件包（immutable，更新＝造新镜像）；容器是镜像跑起来的隔离进程（类与实例，一个镜像派生 N 个容器）；仓库是存取与分发的服务（push ≈ publish，pull ≈ install）
- 镜像名三段式 `仓库地址/镜像名:tag`，三段都有默认值：`docker.io`、`library/`、`latest`
- **漏写的段不会报错，只会悄悄改变目的地**

## 边界与陷阱

三个最高频的翻车点，全部源于“三段式默认值”和“不可变”这两件事没吃透——它们共同的特点是**不报错、只悄悄出错**。

### 坑 1：用 latest 部署，版本漂移无从追溯

错误写法：

```bash
$ docker build -t cnsig-ems-ui .
$ docker push cnsig-ems-ui
# 两次构建推的都是 latest
# 线上出问题想回滚？不知道该回到哪
```

- 问题：latest 只是个默认标签，永远指向最近一次推送——两次构建之间它的指向可能已经变了，回滚失去锚点

正确写法：

```bash
$ docker build -t 112.26.45.227:10001/cnsig-ems-ui:1.0.0 .
$ docker push 112.26.45.227:10001/cnsig-ems-ui:1.0.0
# 版本号来自 CI 的 tag 或构建号，可回滚可追溯
```

- 要点：部署镜像强制显式版本号（语义化版本或构建号），让每一次线上运行都对应一个明确的、不可变的镜像

### 坑 2：推送目标由镜像名第一段决定，与登录过谁无关

错误写法：

```bash
$ docker login 112.26.45.227:10001   # 登录了私服
$ docker push cnsig-ems-ui:1.0.0        # 推的时候漏了前缀
# 实际推往 docker.io/cnsig-ems-ui:1.0.0
# → 要么没权限被拒，要么业务镜像被公开
```

- 问题：登录信息不会改变推送目的地。名字第一段没有仓库地址，Docker 就按默认值去 docker.io——对业务镜像而言，这要么是失败，要么是事故

正确写法：

```bash
$ docker tag cnsig-ems-ui:1.0.0 112.26.45.227:10001/cnsig-ems-ui:1.0.0
$ docker push 112.26.45.227:10001/cnsig-ems-ui:1.0.0
# 先补全名再推送，或干脆 build 时就打全名
```

- 要点：写部署脚本时让镜像名从第一个字符起就是完整三段式，杜绝事后补名这个环节

### 坑 3：把容器当镜像改，重启后改动蒸发

错误写法：

```bash
$ docker exec -it my-app sh
/# vi /etc/nginx/nginx.conf   # 改好配置，服务正常
/# exit
$ docker rm -f my-app && docker run ...
# 配置回到旧值——改动全部蒸发
```

- 问题：exec 进容器做的修改只存在于容器的可写层；容器销毁，可写层随之销毁。下一次 run 是从不可变镜像重新长出来的全新环境

正确写法：

```bash
# 改动的正路：配置进版本库
$ vi conf/nginx.conf          # 改源文件
$ docker build -t .../cnsig-ems-ui:1.0.1 .
$ docker push .../cnsig-ems-ui:1.0.1
```

- 要点：任何想留下来的改动都必须进镜像——即进 Dockerfile/COPY 的源文件、走一次构建。这是不可变交付的核心纪律

## 动手练习

**练习 1（镜像名、tag）**

题目：内网仓库地址 `192.168.10.20:5000`，应用名 `app-web`，版本 `2.3.1`——写出完整镜像名；并回答：如果 `docker run` 时只写了 `192.168.10.20:5000/app-web`，实际会拉取什么？

- 提示：三段式逐段填空，别漏任何一段的默认值

参考答案：

完整名：`192.168.10.20:5000/app-web:2.3.1`。省略 tag 时 Docker 默认补 `latest`，于是拉取目标变成 `192.168.10.20:5000/app-web:latest`——若私服上从没人推过 latest 这个 tag，会直接报 manifest not found；若有人推过，拿到的就不是你以为的 2.3.1。

**练习 2（rm、rmi）**

题目：docker rm 和 docker rmi 分别删什么？直接 rmi 一个还有容器在跑的镜像会发生什么？

- 提示：一个删实例、一个删类；类还有实例引用时删得掉吗？

参考答案：

`rm` 删容器（运行实例 + 可写层），`rmi` 删镜像（只读包）。镜像还有容器引用时 `rmi` 会拒绝并报 conflict 错误，错误信息里列出占用它的容器 ID——正确顺序是先 `docker rm -f` 容器，再 `rmi`。

## 追问链

五问从热身到进阶，覆盖三对象、凭证与不可变引用。

**追问 1：docker pull nginx 和 docker pull nginx:stable-alpine 拉到的是同一个镜像吗？**

> 考察点：热身题，验证 tag 默认值这条规则是否真的记住了——它是镜像名三段式里最容易踩的默认行为。

不是。前者的完整名是 docker.io/library/nginx:latest，后者是 docker.io/library/nginx:stable-alpine，tag 不同就是两个不同的引用，可能指向完全不同的内容。省略 tag 时 Docker 会默认补 latest，并打印 Using default tag: latest 提示。

- 再进一步：长镜像名可以打本地短别名：docker tag 112.26.45.227:10001/app:1.0.0 app:dev，别名只是又一个指向同一镜像的 tag

**追问 2：docker login 之后，凭证存在哪里？这个存储安全吗？**

> 考察点：考察是否真的用过私服推送——部署机配过一次凭证就能一直 push，很多人天天用却不知道它落在了哪个文件里。

存在本机 ~/.docker/config.json 的 auths 字段里，按仓库地址分键，内容是 base64 编码的账号密码——是编码不是加密，能读到文件就等于拿到密码。docker logout 的作用就是删掉对应条目。

- 再进一步：生产建议配置 credential helper（如 macOS 的 docker-credential-osxkeychain、Linux 的 pass），config.json 里只存 helper 引用，真实凭证进系统钥匙串

**追问 3：一个镜像正跑着 3 个容器，此时 docker rmi 它会发生什么？**

> 考察点：检验「实例依赖类」的方向性：容器存在时镜像能不能删、删除的是引用还是实体——方向搞反的人会答反整道题。

删除被拒绝：Docker 报 conflict 错误（unable to delete ... must be forced），错误信息里列出占用它的容器 ID。必须先停掉并删除容器（docker rm -f），镜像才能真正删除。反过来 rm 容器永远不影响镜像——实例的生死与类无关。

- 再进一步：若镜像被多个 tag 引用，rmi 某个 tag 只做 Untagged（摘标签），IMAGE ID 还被其他 tag 引用着就不会真正删数据

**追问 4：docker exec 进容器改了 /etc/nginx/nginx.conf，为什么容器重建后改动消失了？**

> 考察点：本篇核心考点：不可变镜像与容器可写层的分界线。答不出这题说明把容器当成了镜像本身，后面的排查篇会处处卡壳。

容器 = 不可变镜像 + 一层薄薄的可写层，exec 里的所有改动都落在可写层；容器被 rm 时可写层随之销毁，下一次 run 是从镜像重新生成的全新环境，自然回到初始状态。改动想留下来，唯一正路是改源文件、重新 build 出新镜像再 push。

- 再进一步：docker commit 能把容器可写层固化成新镜像——应急救火可用，但配置从此脱离版本库，团队协作场景不要依赖它

**追问 5：为什么说 tag 是「会漂移的指针」？想钉死内容该怎么办？**

> 考察点：进阶题：考察 tag 与 digest 的引用模型——这是镜像回滚、构建可复现、供应链安全三个话题共同的地基。

tag 只是「名字 → IMAGE ID」的一条引用，同名 tag 重新 build/push 后引用被改指向新镜像，旧镜像降级为 \<none\> 的悬空镜像。所以同一个 tag 今天和昨天拉到的内容可能完全不同。要钉死内容用 digest 引用：镜像名@sha256:摘要——摘要由内容算出，内容变摘要必变，两次拉取结果就严格一致。

- 再进一步：docker images --digests 可查看每个 tag 对应的摘要；生产 Dockerfile 里 FROM 镜像@sha256:... 是可复现构建的标准做法

## 下一步去哪

三对象齐了，下一篇把它们放进一条真实链路：**一次前端部署是怎么从 dist 走到线上的**——构建机、私服、K8s 集群三个角色如何接力，为什么“dist + nginx”就是前端部署的全部。再往后进入镜像内部：FROM 继承与启动钩子（镜像名背后那些没写的默认行为）、离线搬运（连仓库都够不到时怎么把镜像带过去）。镜像的不可变与 digest 引用这套“内容决定身份”的思路，Git 的四大对象早就用过同一套——感兴趣的可以先去补这个类比的源头。

## 延伸阅读

- 《一次前端部署是怎么从 dist 走到线上的？》：系列下一篇：构建机 → 私服 → K8s 集群的全景链路，私服为什么省不掉
- 《git 为什么不存 diff：内容寻址怎么做的？》：「内容算出身份」的祖师爷：digest 与 Git 对象哈希是同一套思想
