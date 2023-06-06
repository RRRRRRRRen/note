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

需要安装node、pnpm、git

node



pnpm

git



编辑器环境

vscode

- [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) - vue 开发必备 （也可以选择 Volar）
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - 脚本代码检查
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - 代码格式化
- [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) - css 格式化



项目初始化