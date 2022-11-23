# 使用vite快速搭建企业级项目框架

## 一、架构搭建

### 1、使用vite快速初始化项目

```bash
npm create vite/latest
```

### 2、修改vite配置文件

1.在node环境中使用ts，首先需要安装官方支持的类型库

```bash
npm i @types/node -D
```

2.添加别名、打包路径、开发服务器端口配置

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

3.解决ts、vetur对于alias路径报错的问题

使用vscode插件volar代替vetur可以解决vetur对于路径的报错

在`tsconfig.json`中增加配置解决ts报错

```json
{
  "compilerOptions": {
    "target": "ESNext",
	// ...
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```



### 3、规范项目目录

```
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

### 4、添加集成工具vue-router

1.安装vue-router

```bash
npm i vue-router
```

2.创建router文件及其相关视图文件

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

在使用history模式时，需要在服务器中配置相应的回退路由或者

3.在`main.ts`中挂在路由配置

```ts
import { createApp } from 'vue'
import App from './App.vue'

import router from './router/index'

createApp(App).use(router).mount('#app')
```

### 5、添加集成工具vuex

1.安装vuex

```bash
npm i vuex
```

2.创建store文件

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

3.在`main.ts`中挂载`store`

```ts
import { createApp } from 'vue'
import App from './App.vue'
import store from './store/index'

createApp(App).use(store).mount('#app')
```

### 6、继承UI框架`Vant`

1.安装vant及其按需引入的插件

```bash
npm i vant
npm i unplugin-vue-components -D
```

2.在`vite.config.ts`中配置按需引入

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

### 7、集成HTTP工具Axios

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

### 8、继承CSS预编译器Less

vite内部已经支持less，只需要安装即可使用

```bash
npm i less -D
```



## 二、代码规范

### 1、集成Prettier配置

1.安装Prettier

```bash
npm i prettier -D
```

2.安装vscode Prettier插件

3.根目录下新建配置文件`.prettierrc`

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

4.在vscode中设置默认格式化工具为Prettier

### 2、配置eslint+Prettier

详见：[vue3+ts+EsLint+Prettier规范代码的方法实现 - javascript - 脚本 - 球儿工具 (qetool.com)](https://www.qetool.com/scripts/view/12456.html)



## 三、适配移动端

使用viewport方案进行移动端适配

1.安装`postcss-px-to-viewport`

```bash
npm install postcss-px-to-viewport -D
```

2.根目录下新建文件`postcss.config.cjs`

```js
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      unitToConvert: 'px', // 需要转换的单位，默认为"px"
      viewportWidth: 375, // 设计稿的视口宽度
      exclude: [/node_modules/], // 解决vant375,设计稿750问题。忽略某些文件夹下的文件或特定文件
      unitPrecision: 5, // 单位转换后保留的精度
      propList: ['*'], // 能转化为vw的属性列表
      viewportUnit: 'vw', // 希望使用的视口单位
      fontViewportUnit: 'vw', // 字体使用的视口单位
      selectorBlackList: [], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
      minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
      mediaQuery: false, // 媒体查询里的单位是否需要转换单位
      replace: true, //  是否直接更换属性值，而不添加备用属性
      landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
      landscapeUnit: 'vw', // 横屏时使用的单位
      landscapeWidth: 1125 // 横屏时使用的视口宽度
    }
  }
}
```

