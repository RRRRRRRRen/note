# note-viz slug 映射表

本仓库目录为中文命名；迁移回 note-viz（英文 slug）时按下表换算。

| note-viz 路径 | 本仓库文件 |
| --- | --- |
| backend/nodejs/stream/backpressure | backend/nodejs/流与缓冲/write() 返回 false 之后会怎样？.md |
| backend/spring/autoconfigure/auto-configuration | backend/spring/自动配置/starter 加个依赖为什么就能生效？.md |
| database/mysql/index/covering-index | database/mysql/索引原理/为什么有了索引还要回表？.md |
| devtools/docker/basics/deploy-pipeline | devtools/docker/基础概念/一次前端部署是怎么从 dist 走到线上的？.md |
| devtools/docker/deploy/container-debug-502 | devtools/docker/部署实战/容器跑起来后页面 502，怎么一步步排查？.md |
| devtools/docker/deploy/deploy-script-anatomy | devtools/docker/部署实战/部署脚本 deploy.sh 每一步在做什么？.md |
| devtools/docker/deploy/nginx-conf-anatomy | devtools/docker/部署实战/nginx.conf 是怎么让页面和接口都通的？.md |
| devtools/docker/dockerfile/build-anatomy | devtools/docker/Dockerfile与构建/5 行的 Dockerfile 是怎么变成镜像的？.md |
| devtools/docker/dockerfile/build-context-cache | devtools/docker/Dockerfile与构建/为什么构建上下文越大 build 越慢？.md |
| devtools/docker/dockerfile/inheritance-entrypoint | devtools/docker/Dockerfile与构建/FROM 官方镜像后，默认行为是怎么保留的？.md |
| devtools/docker/registry/image-container-registry | devtools/docker/镜像与制品仓库/Docker 的镜像、容器、仓库是什么关系？.md |
| devtools/docker/registry/image-transport | devtools/docker/镜像与制品仓库/镜像怎么从构建机到部署机？.md |
| devtools/docker/registry/nexus | devtools/docker/镜像与制品仓库/Nexus 是什么：为什么公司都要自建制品仓库？.md |
| devtools/docker/registry/offline-transfer | devtools/docker/镜像与制品仓库/没有外网的服务器怎么拿到 Docker 镜像？.md |
| devtools/docker/registry/registry-selection | devtools/docker/镜像与制品仓库/制品仓库怎么选：Nexus 还是专项工具？.md |
| devtools/git/basics/collab-workflow | devtools/git/基础操作/团队的提交历史要遵守什么规范？.md |
| devtools/git/basics/daily-commands | devtools/git/基础操作/git 的三个区是怎么分工的？.md |
| devtools/git/basics/undo-commands | devtools/git/基础操作/restore、reset、revert 怎么选？.md |
| devtools/git/merge/three-way-merge | devtools/git/合并/同一文件为什么有时冲突有时不冲突？.md |
| devtools/git/object-model/content-addressing | devtools/git/对象模型/git 为什么不存 diff：内容寻址怎么做的？.md |
| devtools/git/refs/branch-head | devtools/git/引用系统/reset --hard 丢弃的提交去哪了？.md |
| devtools/git/remote/fetch-pull | devtools/git/远程协作/originmain 是远程上的分支吗？.md |
| devtools/git/remote/ssh-setup | devtools/git/远程协作/ssh 免密推送是怎么配出来的？.md |
| devtools/git/storage/gc-and-lfs | devtools/git/存储与回收/git 的垃圾是怎么被回收的？.md |
| devtools/git/storage/large-files | devtools/git/存储与回收/仓库为什么被几张大文件撑爆？.md |
| devtools/homebrew/basics/brew-essentials | devtools/homebrew/基础/brew 装的软件到底放在哪？.md |
| devtools/homebrew/basics/mirror-proxy | devtools/homebrew/基础/brew 下载慢怎么救：镜像与代理.md |
| devtools/shell/file-basics/file-type-magic | devtools/shell/文件与压缩/文件类型由什么决定？.md |
| devtools/shell/file-basics/gzip-cli | devtools/shell/文件与压缩/gzip 命令行怎么用？.md |
| devtools/shell/file-basics/tar-cli | devtools/shell/文件与压缩/tar 命令行怎么用？.md |
| devtools/shell/file-basics/tar-vs-gzip | devtools/shell/文件与压缩/为什么有了 gzip 还需要 tar？.md |
| devtools/shell/file-basics/zip-central-directory | devtools/shell/文件与压缩/zip 为什么能只看清单不解压？.md |
| devtools/shell/file-basics/zip-cli | devtools/shell/文件与压缩/zip 命令行怎么用？.md |
| devtools/shell/file-basics/zip-filename-encoding | devtools/shell/文件与压缩/Windows 压的 zip 为什么中文乱码？.md |
| devtools/shell/text-pipeline/grep-pipe-basics | devtools/shell/文本搜索与管道/AI 拼的 grep 管道怎么读懂？.md |
| devtools/ssh/fundamentals/file-transfer | devtools/ssh/基础原理/scp 和 rsync 怎么选？.md |
| devtools/ssh/fundamentals/remote-access | devtools/ssh/基础原理/SSH 是怎么保证远程登录安全的？.md |
| devtools/ssh/security/bastion-audit | devtools/ssh/访问安全/堡垒机为什么看得到加密流量？.md |
| devtools/ssh/security/ssh-certificates | devtools/ssh/访问安全/SSH 证书和普通密钥差在哪？.md |
| devtools/ssh/security/zero-trust | devtools/ssh/访问安全/零信任网络到底「零」了什么？.md |
| devtools/ssh/tunneling/jump-host | devtools/ssh/隧道与转发/跳板机是怎么控制访问的？.md |
| devtools/ssh/tunneling/port-forwarding | devtools/ssh/隧道与转发/ssh -L 的两个端口号分别是谁的？.md |
| frontend/browser/fundamentals/reflow-repaint | frontend/browser/工作原理/为什么改一个样式会引发重排：回流与重绘.md |
| frontend/browser/fundamentals/url-to-render | frontend/browser/工作原理/从输入 URL 到页面渲染，中间发生了什么？.md |
| frontend/css/layout/auto-fill-auto-fit | frontend/css/布局/auto-fill 和 auto-fit 差在哪？.md |
| frontend/css/layout/flex-shrink-min-width | frontend/css/布局/flex 子项为什么压不到预期宽度？.md |
| frontend/css/layout/flex-vs-grid | frontend/css/布局/Flex 还是 Grid：一维流与二维网格？.md |
| frontend/engineering/build/build-problem | frontend/engineering/构建/构建工具到底解决了什么问题？.md |
| frontend/engineering/build/hmr-incremental | frontend/engineering/构建/HMR 是怎么做到只替换一块代码的？.md |
| frontend/engineering/build/loader-vs-plugin | frontend/engineering/构建/Loader 与 Plugin 的分界线在哪里？.md |
| frontend/engineering/build/tree-shaking-cjs | frontend/engineering/构建/为什么 tree-shaking 摇不动 CJS？.md |
| frontend/engineering/package-management/cache-desync | frontend/engineering/包管理/为什么删了 node_modules 重装就好了？.md |
| frontend/engineering/package-management/different-deps | frontend/engineering/包管理/为什么各机器装出来的依赖会不一样？.md |
| frontend/engineering/package-management/lockfile-changes | frontend/engineering/包管理/为什么没人动 lockfile，它却自己变了？.md |
| frontend/engineering/package-management/lockfile-consistency | frontend/engineering/包管理/lockfile 是如何保证依赖树一致的？.md |
| frontend/engineering/package-management/pnpm-structure | frontend/engineering/包管理/pnpm 凭什么又快又省还封杀幽灵依赖？.md |
| frontend/engineering/package-management/unified-toolchain | frontend/engineering/包管理/几十个项目版本各异，心智怎么统一？.md |
| frontend/engineering/package-management/version-managers | frontend/engineering/包管理/nvm、fnm、Volta、mise 差在哪？.md |
| frontend/engineering/typescript/module-resolution | frontend/engineering/TypeScript工程化/import 的模块是怎么被解析找到的？.md |
| frontend/engineering/typescript/project-references | frontend/engineering/TypeScript工程化/references 和 tsc -b 解决什么？.md |
| frontend/engineering/typescript/tool-conflicts | frontend/engineering/TypeScript工程化/类型检查、lint、格式化为什么不打架？.md |
| frontend/engineering/typescript/ts-native-compiler | frontend/engineering/TypeScript工程化/TypeScript 7 原生化改变了什么？.md |
| frontend/engineering/typescript/ts-roles | frontend/engineering/TypeScript工程化/TypeScript 在工程里到底扮演什么角色？.md |
| frontend/engineering/typescript/ts-version-drift | frontend/engineering/TypeScript工程化/编辑器和构建的类型检查为什么会不一致？.md |
| frontend/engineering/typescript/tsconfig-readers | frontend/engineering/TypeScript工程化/tsconfig 的一份配置到底谁在读？.md |
| frontend/engineering/typescript/tsserver-internals | frontend/engineering/TypeScript工程化/编辑器的 TS 智能是怎么来的？.md |
| frontend/engineering/typescript/type-lookup | frontend/engineering/TypeScript工程化/TS 是怎么找到 npm 包的类型声明的？.md |
| frontend/engineering/typescript/vite-transpile-ts | frontend/engineering/TypeScript工程化/为什么 Vite 转译 TS 却不做类型检查？.md |
| frontend/javascript/closure/closure-basics | frontend/javascript/闭包/闭包到底是什么：词法环境的快照.md |
| frontend/javascript/closure/closure-patterns | frontend/javascript/闭包/闭包在工程里怎么用：私有状态与模块模式.md |
| frontend/javascript/event-loop/event-loop-basics | frontend/javascript/事件循环/事件循环是怎么调度的：从调用栈到微任务.md |
| frontend/javascript/memory/gc-and-leaks | frontend/javascript/内存管理/JS 是怎么释放内存的：GC 与泄漏排查.md |
| frontend/javascript/patterns/bind-new-priority | frontend/javascript/常用模式/手写 bind 时，new 为什么能「打败」它？.md |
| frontend/javascript/patterns/concurrency-pool | frontend/javascript/常用模式/怎么把并发请求数限制在 N 以内？.md |
| frontend/javascript/patterns/debounce-throttle | frontend/javascript/常用模式/防抖和节流到底差在哪？.md |
| frontend/javascript/patterns/event-emitter | frontend/javascript/常用模式/发布订阅是怎么实现的：手写事件总线.md |
| frontend/javascript/prototype/inheritance | frontend/javascript/原型链/class 是语法糖吗：从原型链到 class.md |
| frontend/javascript/prototype/prototype-chain | frontend/javascript/原型链/属性是怎么被继承的：原型链查找.md |
| frontend/javascript/scope/execution-context | frontend/javascript/作用域/变量提升是怎么发生的：执行上下文.md |
| frontend/javascript/scope/scope-chain | frontend/javascript/作用域/变量是怎么被找到的：作用域与作用域链.md |
| frontend/javascript/scope/this-binding | frontend/javascript/作用域/this 到底指向谁？.md |
| frontend/javascript/types/deep-clone | frontend/javascript/类型系统/为什么改了副本，原对象也跟着变：深浅拷贝.md |
| frontend/javascript/types/float-precision | frontend/javascript/类型系统/0.1 + 0.2 为什么不等于 0.3？.md |
| frontend/javascript/types/type-coercion | frontend/javascript/类型系统/「1」+ 1 为什么等于「11」：隐式转换规则.md |
| frontend/javascript/types/typeof-null | frontend/javascript/类型系统/typeof null 为什么是object？.md |
| frontend/react/core/fiber-rendering | frontend/react/核心机制/Fiber 为什么能让渲染可中断？.md |
| frontend/react/core/setstate-scheduling | frontend/react/核心机制/setState 之后 React 做了什么？.md |
| frontend/react/core/synthetic-events | frontend/react/核心机制/合成事件到底是什么：一套事件委托机制.md |
| frontend/react/hooks/effect-vs-layout-effect | frontend/react/Hooks原理/useLayoutEffect 到底差在哪一帧？.md |
| frontend/react/hooks/hooks-order-rules | frontend/react/Hooks原理/Hook 为什么不能写在条件语句里？.md |
| frontend/react/hooks/hooks-render | frontend/react/Hooks原理/连续 setState 为什么只加一次：批处理.md |
| frontend/react/reconcile/key-index-mismatch | frontend/react/协调与Diff/用 index 做 key 为什么会状态错位？.md |
| frontend/typescript/basics/declaration-files | frontend/typescript/语言基础/.d.ts 声明文件到底解决什么问题？.md |
| frontend/typescript/basics/ts-feature-surface | frontend/typescript/语言基础/前端实际用得到多少 TS 功能？.md |
| frontend/typescript/basics/ts-version-history | frontend/typescript/语言基础/TypeScript 的各个版本都迭代了什么？.md |
| network/http/compression/brotli-zstd | network/http/内容压缩/gzip、brotli、zstd 怎么选？.md |
| network/http/compression/content-negotiation | network/http/内容压缩/浏览器和服务器怎么协商压缩？.md |
| network/http/compression/gz-file-format | network/http/内容压缩/.gz 文件里都装了什么？.md |
| network/http/compression/gzip-deflate | network/http/内容压缩/gzip 为什么能压小文件？.md |
