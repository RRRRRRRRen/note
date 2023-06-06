# 前言

首先灵魂三问

是什么：Vben-Admin是个什么样的项目？

[Vue-Vben-Admin](https://github.com/vbenjs/vue-vben-admin) 是一个基于 [Vue3.0](https://github.com/vuejs/core)、[Vite](https://github.com/vitejs/vite)、 [Ant-Design-Vue](https://2x.antdv.com/docs/vue/introduce-cn/)、[TypeScript](https://www.typescriptlang.org/) 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。包括二次封装组件、utils、hooks、动态菜单、权限校验、按钮级别权限控制等功能。项目会使用前端较新的技术栈，可以作为项目的启动模版，以帮助你快速搭建企业级中后台产品原型。也可以作为一个示例，用于学习 `vue3`、`vite`、`ts` 等主流技术。该项目会持续跟进最新技术，并将其应用在项目中。

为什么：为什么要再去实现一遍Vben-Admin？

作为一个成熟且社区活跃的后台解决方案，Vben-Admin首先使用了像Vue 3、TypeScript 和 Vite 这样先进的前端新晋技术。其次经过数次的迭代更新，Vben-Admin也提供了大量包括模块化组织、代码规范、性能优化等方面的经验。最后Vben-Admin也实现了丰富的常用业务组件，提供了一些业务组件的开发技巧和经验。通过自己逐行实现每一段代码，帮助我们熟练掌握最新的前端技术和工具，提升自己的技术能力，并且了解和学习到构建优秀前端项目的最佳实践。

怎么办：通过哪些手段来提高学习效果？

1. 逐行解析，努力理解每一段代码的作用与意义。
2. 发散学习，学习项目中所涉及到的所有技术，并且掌握其常用的api和基本原理。
3. 笔记形成，根据所学内容，形成完善的笔记，辅以git提交记录，进行渐进式的深入学习。



# 环境准备

工程化环境

需要安装node、pnpm、git、vscode

node

推荐安装最新的LTS版本的node，但是同时更加推荐使用nvm去管理各种版本的node，因为在有些过新或过旧的版本执行某些命令是会报错，需要切换推荐的版本去执行。就我使用体验来说，目前14、16版本较为合适，报错较少。

pnpm

与npm类似是一个包管理器，与npm最大的不同在于，pnpm会将所有项目的包都保存在一个位置，然后通过硬链接的方式引用到项目中，这样做避免了同一个包在不同项目中重复安装，提高了下载速度，也节省了储存空间。

至于什么是硬链接，什么又是符号链接。打个比喻，硬链接就是一个物体在水中的影子，物体在影子就在，物体消失，影子也消失；而符号链接则像是这个物体在水中影子的位置，物体和影子消失后，这个位置依然不会消失。

简单对比一下npm和pnpm的命令：

| npm命令            | pnpm命令         |
| ------------------ | ---------------- |
| npm install        | pnpm install     |
| npm install 包名   | pnpm add 包名    |
| npm uninstall 包名 | pnpm remove 包名 |
| npm run 脚本       | pnpm 脚本        |

git

在项目工程化与标准化构建过程中，会逐步使用各类git命令。



编辑器环境

vscode

前端无脑推荐使用的编辑器，具有强大的插件系统，而且免费！后续过程中会逐步介绍需要安装的插件，通过使用插件来提高我们的开发效率与舒适度。



# 项目初始化

快速初始化一个vite项目

```shell
pnpm create vite
```

根据提示输入项目名称，选择vue，在选则ts即可完成项目的初始化

安装

[tree-node-cli]([tree-node-cli - npm (npmjs.com)](https://www.npmjs.com/package/tree-node-cli))

```shell
npm install -g tree-node-cli
```

然后打印目录结构

```shell
treee -L 1
```

```shell
vue-vben-admin-analysis
├── .vscode				# vscode的相关配置文件
├── README.md	
├── index.html
├── package.json
├── public
├── src
├── tsconfig.json		# ts配置文件
├── tsconfig.node.json	# 针对node环境的ts配置文件
└── vite.config.ts		# vite配置文件
```

我们简单介绍下vben-admin的文件结构

```shell
vue-vben-admin
├── CHANGELOG.en_US.md		# 详细更新记录：英文
├── CHANGELOG.md			# 更新记录：概览
├── CHANGELOG.zh_CN.md		# 详细更新记录：中文
├── CNAME					# 用于重定向github的个人网站
├── LICENSE					# 开源协议信息
├── README.md				# 项目介绍：英文
├── README.zh-CN.md			# 项目介绍：中文
├── apps					# 子应用
├── index.html				# 入口html
├── internal				# 内部功能文件夹
├── mock					# 模拟请求
├── node_modules			# npm包
├── package.json			# npm配置
├── packages				# 项目内部使用的组件库
├── pnpm-lock.yaml			# 用于确保pnpm包的一致性的锁定文件
├── pnpm-workspace.yaml		# 用于组织内部的子应用和子项目
├── public					# 静态文件
├── src						# 项目源码
├── tsconfig.json			# ts配置文件
├── turbo.json				# 其他构建配置
├── types					# 存放类型声明文件
└── vite.config.ts			# vite配置文件
```

```SHELL
vue-vben-admin
├── .browserslistrc
├── .commitlintrc.js
├── .editorconfig
├── .env
├── .env.analyze
├── .env.development
├── .env.production
├── .env.test
├── .eslintignore
├── .eslintrc.js
├── .git
├── .gitattributes
├── .github
├── .gitignore
├── .gitpod.yml
├── .husky
├── .npmrc
├── .prettierignore
├── .prettierrc.js
├── .stylelintignore
├── .stylelintrc.js
├── .vscode
├── CHANGELOG.en_US.md
├── CHANGELOG.md
├── CHANGELOG.zh_CN.md
├── CNAME
├── LICENSE
├── README.md
├── README.zh-CN.md
├── apps
├── index.html
├── internal
├── mock
├── node_modules
├── package.json
├── packages
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── public
├── src
├── tsconfig.json
├── turbo.json
├── types
└── vite.config.ts
```

