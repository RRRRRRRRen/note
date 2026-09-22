# Vben Admin 项目初始化

*类型：practice ｜ 难度：入门 ｜ 标签：vue-vben-admin、Vite、pnpm、工程化、项目初始化*

**Vben Admin 是基于 Vue3、Vite、Ant-Design-Vue、TypeScript 的后台解决方案。项目初始化分两步：先准备工程化环境（node + pnpm + git）与编辑器环境（vscode），再用 `pnpm create vite` 生成模板项目，之后补充代码规范、git 规范、环境变量、部署规则等配置。这套环境准备思路适用于任何前端工程化项目的起步阶段。**

## 项目是什么与为什么重写

**是什么**：Vue-Vben-Admin 是一个基于 Vue 3.0、Vite、Ant-Design-Vue、TypeScript 的后台解决方案，目标是为开发中大型项目提供开箱即用的解决方案，包括二次封装组件、utils、hooks、动态菜单、权限校验、按钮级别权限控制等功能。可以作为项目的启动模版快速搭建企业级中后台产品原型，也可以作为学习 `vue3`、`vite`、`ts` 等主流技术的示例。

**为什么重写一遍**：

- Vben-Admin 使用了 Vue 3、TypeScript 和 Vite 这样先进的前端技术。
- 经过数次迭代更新，提供了大量包括模块化组织、代码规范、性能优化等方面的经验。
- 实现了丰富的常用业务组件，提供了业务组件的开发技巧和经验。

**学习手段**：

- 逐行解析，努力理解每一段代码的作用与意义。
- 发散学习，掌握项目中涉及的所有技术的常用 API 和基本原理。
- 笔记形成，根据所学内容形成完善的笔记，辅以 git 提交记录渐进式深入学习。

## 工程化环境

前端工程化（Frontend Engineering）是指将前端开发中的代码、流程和工具进行规范化、自动化和优化的过程，涵盖一系列实践和方法，旨在提高前端开发的效率、质量和可维护性。搭建工程化环境最基础需要三样东西：工程化运行的系统、依赖管理工具、代码管理工具，对应 node、pnpm、git 三个软件。

### node：工程化运行的系统

- 工程化需要一个软件来组织各种工程化工具，node 承担了这个角色。node 基于 js，更贴近前端开发人员，随发展自然承担了工程化的责任。
- 边界意识：业务代码和工程管理代码都用 js，但有非常明确的边界。就像木工做凳子，node 是锤子、锯子，只是工具；项目完成拿去部署时，项目中不会看到任何 node 的代码。
- 安装：推荐直接前往官网安装，并推荐使用 nvm 管理多个版本的 node——有些过新或过旧的版本执行某些命令会报错，需要切换版本。

### pnpm：依赖管理工具

- 安装 node 时附赠 npm，但 npm 的发展落后于前端工程化的发展，市场上出现了 yarn、pnpm 等替代品。npm 制定了依赖管理的基础规范并给出一种实现，yarn 和 pnpm 基于该规范提供了加强功能。
- pnpm 与 npm 最大的不同：pnpm 会将所有项目的包保存在一个位置，通过硬链接的方式引用到项目中，避免同一个包在不同项目中重复安装，提高下载速度、节省存储空间。
- 硬链接与符号链接的比喻：硬链接像物体在水中的影子，物体在影子就在，物体消失影子也消失；符号链接像影子所在的位置，物体和影子消失后，这个位置依然不会消失。
- 安装：`npm install -g pnpm`。

npm 与 pnpm 命令对照：

| npm 命令 | pnpm 命令 |
| --- | --- |
| npm install | pnpm install |
| npm install 包名 | pnpm add 包名 |
| npm uninstall 包名 | pnpm remove 包名 |
| npm run 脚本 | pnpm 脚本 |

### git：代码管理工具

- Git 是分布式版本控制系统，用于跟踪文件和文件夹的变化，广泛应用于软件开发项目中，用于协作开发、版本管理和代码托管。
- 类似工具还有 svn，两者管理模式不一样但目的一样；git 具有更高的社区支持度，更推荐使用。
- 使用 git 时还需要配置用户名、邮箱、SSH 等，会在工程化与标准化构建过程中逐步介绍。

## 编辑器环境

vscode 是前端推荐使用的编辑器，具有强大的插件系统且免费。但强大的功能和高度的可配置化使得 vscode 不适合开箱即用，需要大量配置和插件来提高可用性。同一个项目、同一个编辑器写出的代码可能千人千面，统一编辑器行为至关重要（详见编辑器设置篇）。

## 初始化 Vite 项目

前端构建工具通过模块打包、代码转换、资源管理、自动化任务等功能提供更高效、更优化的开发流程，常见有 webpack、rollup、vite 等，vben 使用 vite 构建。

```bash
pnpm create vite
```

根据提示输入项目名称，选择 vue，再选中 ts 即可完成项目的初始化。

## 项目结构概览

可以使用 tree-node-cli 打印文件结构：

```bash
npm install -g tree-node-cli
treee -L 1 -a
```

初始化项目的文件结构：

```text
vue-vben-admin-analysis
├── .vscode              # vscode 的相关配置文件
├── README.md
├── index.html
├── package.json
├── public
├── src
├── tsconfig.json        # ts 配置文件
├── tsconfig.node.json   # 针对 node 环境的 ts 配置文件
└── vite.config.ts       # vite 配置文件
```

vben-admin 在此基础上的文件结构（节选关键项）：

```text
vue-vben-admin
├── .browserslistrc      # 定义项目支持的浏览器范围，用于 Babel 和 Autoprefixer
├── .commitlintrc.cjs    # 配置 CommitLint 规则，规范提交信息格式
├── .dockerignore        # 构建 Docker 镜像时排除的文件或目录
├── .editorconfig        # 编辑器配置：缩进、换行符等，保证团队一致性
├── .env / .env.development / .env.production / .env.test  # 各环境环境变量
├── .eslintrc.cjs        # ESLint 配置：代码规范和检查规则
├── .husky               # Git Hooks 工具 Husky 配置，管理 Git 钩子
├── .npmrc               # npm 配置文件
├── .prettierrc.cjs      # Prettier 配置：代码格式化规则
├── .stylelintrc.cjs     # Stylelint 配置：样式规范和检查规则
├── internal             # 项目内部使用的工具模块
├── mock                 # 模拟数据和接口目录
├── packages             # 多个独立 npm 包
├── pnpm-lock.yaml       # pnpm 锁定文件，记录精确依赖版本
├── pnpm-workspace.yaml  # pnpm 多包工作区配置
├── turbo.json           # turbo 任务运行器配置
└── uno.config.ts        # UnoCSS 配置
```

对比模板项目，vben 多出的配置主要实现五类功能：

- 加强代码的风格和规范。
- 配置 git 行为和规范。
- 配置平台部署的相关规则。
- 补充各类环境变量的控制。
- 提供开发维护的相关功能。
