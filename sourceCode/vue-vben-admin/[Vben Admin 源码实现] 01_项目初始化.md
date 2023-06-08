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
treee -L 1 -a
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

我们简单介绍下vben-admin的文件结构，在后面的学习中会逐步详细讲解

```SHELL
vue-vben-admin
├── .browserslistrc		# 浏览器兼容规则配置
├── .commitlintrc.js		# git 提交信息规范配置
├── .editorconfig		# 编辑器通用配置
├── .env		# 通用环境变量
├── .env.analyze		# analyze 专用环境变量
├── .env.development		# development 专用环境变量
├── .env.production		# production 专用环境变量
├── .env.test		# test 专用环境变量
├── .eslintignore		# eslint 忽略规则配置
├── .eslintrc.js		# eslint 规则配置
├── .git		# git 版本控制核心文件
├── .gitattributes		# git 行为和属性配置
├── .github		# github 相关配置
├── .gitignore		# git 版本控制忽略规则
├── .gitpod.yml		# Gitpod 的配置文件
├── .husky		# git 钩子工具
├── .npmrc		# npm 行为和选项配置文件
├── .prettierignore		# prettier 忽略规则
├── .prettierrc.js		# prettier 规则配置
├── .stylelintignore		# stylelint 忽略规则
├── .stylelintrc.js		# stylelint 配置规则
├── .vscode				# vscode 的相关配置文件
├── CHANGELOG.en_US.md		# 详细更新记录：英文
├── CHANGELOG.md			# 更新记录：概览
├── CHANGELOG.zh_CN.md		# 详细更新记录：中文
├── CNAME					# 用于重定向 github 的个人网站
├── LICENSE					# 开源协议信息
├── README.md				# 项目介绍：英文
├── README.zh-CN.md			# 项目介绍：中文
├── apps					# 子应用文件夹
├── index.html				# 入口 html
├── internal				# 内部功能文件夹
├── mock					# 模拟请求
├── node_modules			# npm 包
├── package.json			# npm 配置
├── packages				# 项目内部使用的组件库
├── pnpm-lock.yaml			# 用于确保 pnpm 包的一致性的锁定文件
├── pnpm-workspace.yaml		# 用于组织内部的子应用和子项目
├── public					# 静态文件
├── src						# 项目源码
├── tsconfig.json			# ts 配置文件
├── turbo.json				# 其他构建配置
├── types					# 存放类型声明文件
└── vite.config.ts			# vite 配置文件
```

对比之下，多出的这些文件和文件夹主要有这些功能，我们会依照这些功能一一实现。

- 加强了代码的风格和规范
- 配置了git行为和规范
- 配置了平台部署的相关规则
- 补充了各类环境变量的控制
- 提供了开发维护的相关功能



# pnpm配置

既然vben使用pnpm作为包管理器，那么首先我们就需要熟悉其基本命令，然后理解项目中有关pnpm的配置。

`.npmrc`

```ini
public-hoist-pattern[]=husky
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=lint-staged
public-hoist-pattern[]=*stylelint*
public-hoist-pattern[]=@commitlint/cli
public-hoist-pattern[]=@vben/eslint-config
```

首先看配置项`public-hoist-pattern`是做什么的，找到官网说明[public-hoist-pattern](https://pnpm.io/zh/npmrc#public-hoist-pattern)，简单来说就是用来做依赖提升来解决幻影依赖问题，至于什么是幻影依赖，可以参考这个文章：[NPM 存在的问题以及 PNPM 是怎么处理的 - Yuexun's Blog](https://www.yuexun.me/blog/problems-with-npm-and-how-pnpm-handles-them)。

通过删除这个配置，我们可以对比查看删除前后node_modules的文件结构。

![image-20230608153144899](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230608153144899.png)

可以看出来，这个配置可以将一些子依赖提升到根目录到node_modules中，而不是子依赖的node_modules中，以此来消除其作为幻影依赖的可能。(但是笔者在删除这个配置后，并未影响项目的运行，可能一种保险措施吧，如果有知道的小伙伴请@我)

`pnpm-lock.yaml`

这是与pnpm有关的第二个文件，这个文件其实作用和其他包管理器的lock文件类似，都是用来锁定依赖版本、加快下载和安装速度的，它在保证项目的可重现性和一致性方面起到了重要的作用。这个文件会在安装依赖时自动生成，我们不太需要关注这个文件。

`pnpm-workspace.yaml`

在之前的文件目录简介中，我们提到了一些子项目和内部使用的工具文件夹，这些文件夹也可以作为一个完整的项目来运行。如下三个

- internal

- packages

- apps

在之后学习这些子项目时我们再详细学习这些内容。目前可以简单理解这个配置文件主要的目的就是给这些子项目共享依赖。

`package.json`

这个文件相比大家都很熟悉，在其中几乎可以配置项目相关的所有设置，我们暂时不用逐行理解，在涉及到相关技术时再去学习其中相关的配置。



