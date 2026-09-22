# 异步组件与 defineAsyncComponent

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、异步组件、defineAsyncComponent、路由懒加载*

**异步组件是一种按需加载组件的机制：组件在真正渲染时才通过 `import()` 动态加载并单独打包成 chunk。Vue 2 用工厂函数写法，Vue 3 统一收敛到 `defineAsyncComponent`，并支持 loading / error 组件、delay / timeout 与重试。适用于减小首屏体积、路由懒加载等场景。**

## 适用场景

- 页面初始加载不想一次性引入所有组件。
- 组件体积较大，或需要延迟加载（如路由懒加载）。
- 提升首屏加载性能。

## Vue 2 异步组件

### 1. 工厂函数写法

```js
Vue.component('MyComponent', function (resolve, reject) {
  // 异步加载模块，加载完成后 resolve 组件选项
  setTimeout(() => {
    resolve({
      template: '<div>我是异步组件</div>'
    })
  }, 1000)
})
```

### 2. `import()` 写法

这种写法配合 Webpack 会自动打包成一个 chunk，在组件用到时再加载：

```js
Vue.component('MyComponent', () => import('./MyComponent.vue'))
```

## Vue 3 异步组件

### 1. 基本使用

```js
import { defineAsyncComponent } from 'vue'

const MyComponent = defineAsyncComponent(() =>
  import('./MyComponent.vue')
)
```

也可以手动返回 Promise：

```js
const AsyncComp = defineAsyncComponent(() => {
  return new Promise((resolve, reject) => {
    // ...从服务器获取组件
    resolve(/* 获取到的组件 */)
  })
})
// 像使用其他一般组件一样使用 AsyncComp
```

### 2. 详细配置

```js
const MyComponent = defineAsyncComponent({
  loader: () => import('./MyComponent.vue'),
  loadingComponent: Loading,
  errorComponent: Error,
  delay: 200,
  timeout: 3000,
  suspensible: false, // 是否启用 suspense（默认 true）
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) retry()
    else fail()
  }
})
```

| 配置项 | 含义 |
| --- | --- |
| `loader` | 加载组件的函数（返回 Promise） |
| `loadingComponent` | 组件加载中显示的组件 |
| `errorComponent` | 加载失败时显示的组件 |
| `delay` | 延迟多少毫秒后显示 loading 组件（默认 200，避免闪烁） |
| `timeout` | 超过多久未加载完成视为失败，显示 error 组件（默认 Infinity） |
| `onError` | 出错时回调，可实现重试 |
| `suspensible` | 是否配合 `<Suspense>` 使用 |

## 路由懒加载

路由组件本质就是异步组件的典型应用：

```js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/about',
    component: () => import('./views/About.vue') // 异步组件
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
```

## 配合 Suspense

Vue 3 引入 `<Suspense>` 来优雅地处理异步组件加载状态：

```vue
<Suspense>
  <template #default>
    <AsyncView />
  </template>
  <template #fallback>
    <LoadingView />
  </template>
</Suspense>
```

相关笔记：《异步组件》另见《特殊组件：递归、动态、Teleport 与 Suspense》中的 Suspense 部分。
