# 前言

> 灵魂三问：是什么、为什么、怎么办？

**是什么：Vben-Admin是个什么样的项目？**

[Vue-Vben-Admin](https://github.com/vbenjs/vue-vben-admin) 是一个基于 [Vue3.0](https://github.com/vuejs/core)、[Vite](https://github.com/vitejs/vite)、 [Ant-Design-Vue](https://2x.antdv.com/docs/vue/introduce-cn/)、[TypeScript](https://www.typescriptlang.org/) 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案。包括二次封装组件、utils、hooks、动态菜单、权限校验、按钮级别权限控制等功能。项目会使用前端较新的技术栈，可以作为项目的启动模版，以帮助你快速搭建企业级中后台产品原型。也可以作为一个示例，用于学习 `vue3`、`vite`、`ts` 等主流技术。该项目会持续跟进最新技术，并将其应用在项目中。

**为什么：为什么要再去实现一遍Vben-Admin？**

作为一个成熟且社区活跃的后台解决方案，Vben-Admin首先使用了像Vue 3、TypeScript 和 Vite 这样先进的前端新晋技术。其次经过数次的迭代更新，Vben-Admin也提供了大量包括模块化组织、代码规范、性能优化等方面的经验。最后Vben-Admin也实现了丰富的常用业务组件，提供了一些业务组件的开发技巧和经验。通过自己逐行实现每一段代码，帮助我们熟练掌握最新的前端技术和工具，提升自己的技术能力，并且了解和学习到构建优秀前端项目的最佳实践。

**怎么办：通过哪些手段来提高学习效果？**

1. 逐行解析，努力理解每一段代码的作用与意义。
2. 发散学习，学习项目中所涉及到的所有技术，并且掌握其常用的api和基本原理。
3. 笔记形成，根据所学内容，形成完善的笔记，辅以git提交记录，进行渐进式的深入学习。



# 一、环境准备

> 什么是环境，我的理解中就是：与项目有关的第一行代码所依存的必要条件。
>
> 我将环境简单的分为两种：工程化环境、编辑器环境。

## 1. 工程化环境

> 相比大家一定听说过一个词：前端工程化。那么什么是前端工程化呢？
>
> 前端工程化（Frontend Engineering）是指将前端开发中的代码、流程和工具进行规范化、自动化和优化的过程。它涵盖了一系列的实践和方法，旨在提高前端开发的效率、质量和可维护性。

想要搭建一个可以进行工程化开发的前端环境，最为基础的我们需要三样东西：工程化运行的系统、依赖管理工具、代码管理工具，与之对应的就是node、pnpm、git三个软件。



**工程化运行的系统：node**

> 想要实现工程化，那么就必须要有一个或者多个软件帮我们组织起来各种用于工程化的软件。
>
> 类比到现实中写毕业论文就是这样：需要word来写论文主体，需要ppt来展示论文的概括与思想，需要各种其他的工业软件来提供有效的数据佐证，而这些东西就是运行在操作系统上。
>
> node就像一个这样的系统，在这个系统上我们可以安装很多软件来帮我们搞定工程化。那么为什么选择node呢？有一个很简单的原因就是node是基于js，node更贴近前端开发人员，经过慢慢的发展，node自然而然的就承担了工程化的责任。
>
> 在我们进行工程化的开发过程中，虽然业务代码和工程管理的代码都是用的js，但是我们一定要记住，这俩有非常明确的边界。就像木工做一张凳子，node就是锤子、锯子，虽然和凳子一样都是木头和铁做的，但是锤子、锯子只是作为工具使用，当你完成凳子拿去售卖时，你不会在凳子上看到绑着一把锤子。同理项目完成拿去部署时，你不会在项目中看到任何node的代码。

【安装】

推荐直接前往官网安装[Node.js (nodejs.org)](https://nodejs.org/en)。

【注意】

推荐安装最新的LTS版本的node，但是同时更加推荐使用nvm去管理各种版本的node，因为在有些过新或过旧的版本执行某些命令是会报错，需要切换推荐的版本去执行。就我使用体验来说，目前14、16版本较为合适，报错较少。



**依赖管理工具：pnpm**

> 安装node时，就会附赠依赖管理工具npm，但是由于npm的发展总是落后前端工程化的发展，导致很多时候npm并不能匹配我们的需求，所以市场上就出现了很多其他的替代品，例如yarn和pnpm。我们可以这样理解，npm制定了依赖管理的基础规范，同时也给出了一个依赖管理的具体实现方法，yarn和pnpm都基于这个规范提供了一些加强版功能，把依赖管理的更好。
>
> pnpm与npm最大的不同在于，pnpm会将所有项目的包都保存在一个位置，然后通过硬链接的方式引用到项目中，这样做避免了同一个包在不同项目中重复安装，提高了下载速度，也节省了储存空间。
>
> 至于什么是硬链接，什么又是符号链接。打个比喻，硬链接就是一个物体在水中的影子，物体在影子就在，物体消失，影子也消失；而符号链接则像是这个物体在水中影子的位置，物体和影子消失后，这个位置依然不会消失。

【安装】

推荐使用npm全局安装：`npm install -g pnpm`

【对比】

| npm命令            | pnpm命令         |
| ------------------ | ---------------- |
| npm install        | pnpm install     |
| npm install 包名   | pnpm add 包名    |
| npm uninstall 包名 | pnpm remove 包名 |
| npm run 脚本       | pnpm 脚本        |



**代码管理工具：git**

> Git 是一个分布式版本控制系统，用于跟踪文件和文件夹的变化。它广泛应用于软件开发项目中，用于协作开发、版本管理和代码托管。
>
> 类似的代码管理工具还有svn，这两个工具虽然管理模式不一样，但是目的都一样，我们更推荐使用git，它具有更高的社区支持度。

【安装】

推荐直接去官网根据提示安装：[Git - Downloads (git-scm.com)](https://git-scm.com/downloads)

【注意】

在使用git时，我们还需要做一些配置，例如配置用户名、邮箱、SSH等。在项目工程化与标准化构建过程中，会逐步介绍使用git。



## 2. 编辑器环境

> 搞定基础的工程化环境后，就可以准备去写代码了，写代码那就需要编辑器。市场上有很多可以用于前端开发的编辑器。这里vben进行了很多vscode的配置，所以我们就以vscode为例进行编辑器环境的配置。

**编辑器：vscode**

vscode是前端推荐使用的编辑器，具有强大的插件系统，而且免费！但是其强大的功能和高度的可配置化，使得vscode并不适合开箱即用，需要进行大量的配置，下载很多插件来提高其可用性。

我们会单独开一篇文件详细介绍vscode的配置和使用。



# 二、项目初始化

> 准备好上述两个环境，我们就可以正式开始搭建工程化的项目了。
>
> 但是在此之前我们需要知道一个东西：前端构建工具。简单了解下什么是前端构建工具，前端构建工具就是一个通过模块打包、代码转换、资源管理、自动化任务等功能，提供了更高效、更优化的开发流程，帮助开发者构建高质量的前端应用程序的工具。
>
> 前端构建工具有很多，例如webpack、rollup、vite等，vben则是实用vite进行构建。

## 1. 初始化vite项目

```shell
pnpm create vite
```

根据提示输入项目名称，选择vue，再选中ts即可完成项目的初始化。

## 2. 项目结构概览

首先安装一个打印文件结构的工具：[tree-node-cli]([tree-node-cli - npm (npmjs.com)](https://www.npmjs.com/package/tree-node-cli))

```shell
npm install -g tree-node-cli
```

然后使用命令打印项目的目录结构

```shell
treee -L 1 -a
```

这就是我们刚刚初始化项目的文件结构：

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

这是vben-admin的文件结构，在后面的学习中会逐步详细讲解：

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



# 总结

经过下载安装node、git、pnpm、vscode后，我们就有了一个基础的工程化环境了，但是想要这个工程化正在做到工程化定义的那般强大，我们还需要大量的插件和工具，而这些插件和工具就是工程化的核心，我们会在后面一一学习。

之后我们有通过一个简单的命令搭建了一个工程化的模版项目，他是使用vite作为构建管理工具的项目，同样的我们也需要安装大量的插件，做大量的配置才能让这个构建工具发挥他的潜力，替我们完成大量的优化操作，我们也会在后面的学习中一一介绍。
