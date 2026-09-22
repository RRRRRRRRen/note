# 用 Vite 搭建企业级项目框架

*类型：practice ｜ 难度：进阶 ｜ 标签：Vite、Vue3、TypeScript、工程化*

**从 `npm create vite` 起步，依次完成：Vite 配置（别名、路径、端口）、规范目录、集成 vue-router 与 vuex、按需引入 Vant、封装 Axios、接入 Less、配置 Prettier 代码规范、postcss-px-to-viewport 移动端适配——一条链路搭出可直接开发的企业级骨架。** 每一步都是「安装依赖 → 写配置 → 挂载入口」的固定模式。

## 架构搭建

### 1. 使用 Vite 快速初始化项目

```bash
npm create vite/latest
```

### 2. 修改 Vite 配置文件

在 node 环境中使用 ts，首先需要安装官方支持的类型库：

```bash
npm i @types/node -D
```

添加别名、打包路径、开发服务器端口配置：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 如果编辑器提示 path 模块找不到，则可以安装一下 @types/node -> npm i @types/node -D
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src') // 设置 `@` 指向 `src` 目录
    }
  },
  base: './', // 设置打包路径
  server: {
    port: 4000, // 设置服务启动端口号
    open: true, // 设置服务启动时是否自动打开浏览器
    cors: true // 允许跨域
  }
})
```

解决 ts、vetur 对于 alias 路径报错的问题：

- 使用 vscode 插件 volar 代替 vetur，可解决 vetur 对路径的报错。
- 在 `tsconfig.json` 中增加 paths 配置解决 ts 报错：

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 3. 规范项目目录

```text
├── public/
└── src/
    ├── assets/                    // 静态资源目录
    ├── common/                    // 通用类库目录
    ├── components/                // 公共组件目录
    ├── router/                    // 路由配置目录
    ├── store/                     // 状态管理目录
    ├── style/                     // 通用 CSS 目录
    ├── utils/                     // 工具函数目录
    ├── views/                     // 页面组件目录
    ├── App.vue
    ├── main.ts
    ├── shims-vue.d.ts
├── tests/                         // 单元测试目录
├── index.html
├── tsconfig.json                  // TypeScript 配置文件
├── vite.config.ts                 // Vite 配置文件
└── package.json
```

### 4. 添加集成工具 vue-router

安装 vue-router：

```bash
npm i vue-router
```

创建 router 文件及相关视图文件：

```ts
import {
  createRouter,
  createWebHistory,
  RouteRecordRaw
} from 'vue-router'
import Home from '@/views/home.vue'
import Vuex from '@/views/vuex.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/vuex',
    name: 'Vuex',
    component: Vuex
  },
  {
    path: '/axios',
    name: 'Axios',
    component: () => import('@/views/axios.vue') // 懒加载组件
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

- 注意：使用 history 模式时，需要在服务器中配置相应的回退路由。

在 `main.ts` 中挂载路由配置：

```ts
import { createApp } from 'vue'
import App from './App.vue'

import router from './router/index'

createApp(App).use(router).mount('#app')
```

### 5. 添加集成工具 vuex

安装 vuex：

```bash
npm i vuex
```

创建 store 文件：

```ts
import { createStore } from 'vuex'

const defaultState = {
  count: 0,
}

const store = createStore({
  state() {
    return defaultState
  },
  mutations: {
    increment(state: typeof defaultState) {
      state.count++
    },
  },
  actions: {
    increment(context) {
      context.commit('increment')
    },
  },
  getters: {
    double(state: typeof defaultState) {
      return state.count * 2
    },
  },
})

export default store
```

在 `main.ts` 中挂载 store：

```ts
import { createApp } from 'vue'
import App from './App.vue'
import store from './store/index'

createApp(App).use(store).mount('#app')
```

### 6. 集成 UI 框架 Vant（按需引入）

安装 vant 及其按需引入的插件：

```bash
npm i vant
npm i unplugin-vue-components -D
```

在 `vite.config.ts` 中配置按需引入：

```ts
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    })
  ]
})
```

### 7. 集成 HTTP 工具 Axios

封装实例与请求/响应拦截器，统一错误提示：

```ts
import Axios from 'axios'
import { Toast } from 'vant'
import 'vant/es/toast/style'

const baseURL = 'https://api.github.com'

const axios = Axios.create({
  baseURL,
  timeout: 20 * 1000,
})

axios.interceptors.request.use(
  request => {
    return request
  },
  err => {
    return Promise.reject(err)
  }
)


axios.interceptors.response.use(
  response => {
    return response
  },
  err => {
    if (err.response && err.response.data) {
      const code = err.response.status
      const msg = err.response.data.message
      Toast.fail(`Code: ${code}, Message: ${msg}`)
      console.log('[Axios Error] :>> ', err.response);
    } else {
      Toast.fail(err)
    }
    return Promise.reject(err)
  }
)

export default axios
```

### 8. 集成 CSS 预编译器 Less

Vite 内部已经支持 less，只需要安装即可使用：

```bash
npm i less -D
```

## 代码规范

### 1. 集成 Prettier 配置

安装 Prettier 与 vscode 插件：

```bash
npm i prettier -D
```

根目录下新建配置文件 `.prettierrc`：

```json
{
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "none",
  "bracketSpacing": true,
  "semi": false
}
```

在 vscode 中设置默认格式化工具为 Prettier。

### 2. 配置 eslint + Prettier

- 在 Prettier 之上叠加 eslint 校验，保证「格式」与「代码质量」两层规范同时生效，避免规则互相覆盖。

## 适配移动端

使用 viewport 方案进行移动端适配。

安装 `postcss-px-to-viewport`：

```bash
npm install postcss-px-to-viewport -D
```

根目录下新建文件 `postcss.config.cjs`：

```js
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      unitToConvert: 'px', // 需要转换的单位，默认为"px"
      viewportWidth: 375, // 设计稿的视口宽度
      exclude: [/node_modules/], // 解决 vant375,设计稿750问题。忽略某些文件夹下的文件或特定文件
      unitPrecision: 5, // 单位转换后保留的精度
      propList: ['*'], // 能转化为vw的属性列表
      viewportUnit: 'vw', // 希望使用的视口单位
      fontViewportUnit: 'vw', // 字体使用的视口单位
      selectorBlackList: [], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
      minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
      mediaQuery: false, // 媒体查询里的单位是否需要转换单位
      replace: true, // 是否直接更换属性值，而不添加备用属性
      landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
      landscapeUnit: 'vw', // 横屏时使用的单位
      landscapeWidth: 1125 // 横屏时使用的视口宽度
    }
  }
}
```

## 搭建清单速查

| 步骤 | 依赖 | 配置位置 |
| --- | --- | --- |
| 初始化 | - | `npm create vite/latest` |
| 别名/端口/打包路径 | `@types/node` | `vite.config.ts` + `tsconfig.json` |
| 路由 | `vue-router` | `src/router/index.ts`，`main.ts` 挂载 |
| 状态管理 | `vuex` | `src/store/index.ts`，`main.ts` 挂载 |
| UI 按需引入 | `vant` + `unplugin-vue-components` | `vite.config.ts` plugins |
| HTTP 封装 | `axios` | `src/utils/axios.ts` 拦截器 |
| CSS 预编译 | `less` | 安装即用 |
| 代码规范 | `prettier` | `.prettierrc` |
| 移动端适配 | `postcss-px-to-viewport` | `postcss.config.cjs` |
