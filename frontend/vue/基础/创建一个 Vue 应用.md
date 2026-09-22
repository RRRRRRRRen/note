# 创建一个 Vue 应用

*类型：knowledge ｜ 难度：基础 ｜ 标签：Vue、Vue3、createApp、应用实例*

**每个 Vue 应用都从 `createApp` 创建应用实例开始，且必须在调用 `.mount()` 后才会渲染——`.mount()` 应始终在整个应用配置和资源注册完成后调用。** 应用实例通过 `.config` 暴露应用级配置，通过 `.component` 等方法注册全局资源；「先配置、后挂载」的顺序决定了这些资源能否在首屏生效。

## 实例创建流程

- 每个 Vue 应用都是通过 `createApp` 函数创建一个新的应用实例。
- 应用实例必须在调用了 `.mount()` 方法后才会渲染出来。
- `.mount()` 方法应该始终在整个应用配置和资源注册完成后被调用。

页面挂载点：

```html
<div id="app"></div>
```

创建并挂载应用：

```js
import { createApp } from 'vue'
// 从一个单文件组件中导入根组件
import App from './App.vue'
// 创建应用实例
const app = createApp(App)
// 挂载并且渲染应用
app.mount('#app')
```

## 实例配置

- 应用实例会暴露一个 `.config` 对象，允许配置一些应用级的选项。
- 应用实例还提供了一些方法来注册应用范围内可用的资源，例如注册一个全局组件。

```js
// 配置：应用级错误处理器
app.config.errorHandler = (err) => {
  /* 处理错误 */
}
// 注册全局组件
app.component('TodoDeleteButton', TodoDeleteButton)
```

- 顺序陷阱：`mount()` 之后再用 `app.component()` 注册的全局组件，对已挂载的模板不生效——所以链式写法 `createApp(App).use(router).use(store).mount('#app')` 中，`mount` 永远放在最后。
