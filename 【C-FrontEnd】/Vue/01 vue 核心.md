# Vue 响应式原理

## 一、Vue 2 响应式原理

> Vue 2 的响应式系统主要通过以下三个部分协作实现：数据劫持、依赖收集、派发更新

### 1. 核心一：数据劫持

Vue 初始化数据时，会对 `data` 对象中的所有属性使用 `Object.defineProperty` 进行劫持，将属性转为带有 getter 和 setter 的形式。

```js
function defineReactive(obj, key, val) {
  const dep = new Dep(); // 每个属性对应一个 Dep 实例

  Object.defineProperty(obj, key, {
    get() {
      dep.depend(); // 收集依赖
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal;
        dep.notify(); // 通知更新
      }
    }
  });
}
```

这个函数是 Vue 内部的响应式实现基础。每个属性都被包装成响应式的，能感知 get 和 set 行为。

### 2. 核心二：依赖收集

`Dep` 是依赖管理器，用于收集哪些观察者（Watcher）依赖了当前属性。每个响应式属性都有一个对应的 `Dep` 实例。

```js
class Dep {
  constructor() {
    this.subs = []; // 存放 Watcher 实例
  }

  depend() {
    if (Dep.target) {
      this.subs.push(Dep.target);
    }
  }

  notify() {
    this.subs.forEach(sub => sub.update());
  }
}
```

其中 `Dep.target` 是当前正在计算的 Watcher，用于完成依赖收集。

### 3. 核心三：观察者

Watcher 是观察者对象，在模板渲染、计算属性、watch 函数中都会用到。每个 Watcher 对象持有一个回调函数用于数据变更后的视图更新。

```js
class Watcher {
  constructor(updateFn) {
    this.updateFn = updateFn;
    Dep.target = this;     // 当前 Watcher 设为全局目标
    updateFn();            // 触发 getter，完成依赖收集
    Dep.target = null;     // 清除全局目标
  }

  update() {
    this.updateFn();       // 响应式数据变化时触发
  }
}
```

当 Watcher 被创建时，它会读取响应式数据（执行 updateFn），从而触发属性的 getter。getter 中调用 `dep.depend()`，把该 Watcher 收集到对应属性的 Dep 中。

### 4. 执行过程

1. Vue 在初始化时会遍历 `data`，对每个属性使用 `Object.defineProperty` 转为响应式。
2. 每个属性内部维护一个 `Dep`，用于管理依赖这个属性的 Watcher。
3. 当组件渲染或计算属性求值时，会创建一个 Watcher，并通过读取数据完成依赖收集。
4. 当数据变化时，通过 setter 调用 `dep.notify()`，触发所有 Watcher 的 `update()` 方法，完成视图更新。

## 二、Vue 3 响应式原理

> Vue 3 的响应式原理核心是使用了 **Proxy 替代 Object.defineProperty**。Vue 3 的响应式系统由以下几部分组成：
>     1. 使用 `Proxy` 实现响应式（核心）；
>     2. 使用 `ReactiveEffect` 替代 Watcher；
>     3. 使用 `targetMap` + `track` / `trigger` 管理依赖收集和更新

### 1. 核心一：使用 Proxy 实现响应式

Vue 3 的 `reactive` 函数会接收一个对象，返回一个代理对象（Proxy）。拦截 get/set 等操作。

```js
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key); // 依赖收集
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key); // 派发更新
      return result;
    }
  });
}
```

相比 Vue 2，Proxy 的优势：

- 支持数组和对象的新增/删除属性（Vue 2 无法拦截新增属性）
- 支持嵌套结构的懒劫持（按需代理）
- 不需要递归遍历对象所有属性

### 2. 核心二：依赖收集：track 函数

Vue 3 用一个全局的 Map 结构 `targetMap` 来管理依赖关系。

```ts
const targetMap = new WeakMap();

function track(target, key) {
  const effect = activeEffect; // 当前正在运行的副作用函数
  if (!effect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(effect);
}
```

这个结构可以理解为：

```txt
targetMap: {
  target1: {
    key1: Set(effect1, effect2),
    key2: Set(effect3)
  }
}
```

### 3. 核心三：派发更新：trigger 函数

当响应式数据发生变化时，Vue 会调用 `trigger`，找出对应的副作用函数并重新执行。

```ts
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  if (effects) {
    effects.forEach(effect => effect());
  }
}
```

# Vue 组件缓存

> `<keep-alive>` 是 Vue 的一个**内置抽象组件**，用于缓存组件实例，避免组件频繁销毁和重建，提高性能。

## 一、基本作用

`<keep-alive>` 主要用于 **动态组件的缓存**，它可以：

- 缓存已创建的组件实例
- 在组件切换时保留状态、DOM，不重新渲染
- 避免重复挂载、销毁逻辑（如 `created`、`mounted` 重复执行）

## 二、使用示例

```vue
<keep-alive>
  <component :is="currentView"></component>
</keep-alive>
```

或者更常见地包裹 `<router-view>`：

```vue
<keep-alive>
  <router-view></router-view>
</keep-alive>
```

## 三、生命周期变化

被 `<keep-alive>` 包裹的组件不会触发正常的 `destroyed` 和 `created`，而是：

- 第一次进入：触发 `created`、`mounted`
- 切换出去：触发 `deactivated`
- 再次切换回来：触发 `activated`

## 四、常用属性

|属性名|类型|作用说明|
|---|---|---|
|`include`|String/RegExp/Array|匹配要缓存的组件名|
|`exclude`|String/RegExp/Array|匹配不缓存的组件名|
|`max`|Number|最多缓存的组件实例数量（LRU 策略）|

**示例：**

```vue
<keep-alive :include="['UserView', 'Dashboard']" :max="3">
  <component :is="currentComponent" />
</keep-alive>
```

## 五、实现原理

- `<keep-alive>` 自身不会渲染 DOM，它会维护一个缓存对象 `cache`。
- 被包裹的子组件在第一次渲染后，会被缓存到 `cache` 中。
- 当切换组件时，若缓存中已有该组件实例，会从 `cache` 取出复用，不再重新创建。

## 六、使用建议与注意事项

- 适合缓存表单页、标签页、列表等状态需要保留的组件
- 被缓存组件的数据应保持响应式，否则更新会失效
- 注意避免缓存过多导致内存压力过大，可搭配 `max` 控制数量
- `<keep-alive>` 只能包裹**单个子组件**

# Vue 常用指令

## 一、Vue 2 常用指令

### 1. `v-bind`

**作用**：动态绑定 HTML 属性、组件 prop 等。可绑定任何合法属性。

**语法**：

```html
<a v-bind:href="url">链接</a>
<!-- 简写 -->
<a :href="url">链接</a>
```

**常见使用**：

```html
<div :class="{ active: isActive }"></div>
<div :style="{ color: textColor }"></div>
```

### 2. `v-on`

**作用**：绑定事件监听器。

**语法**：

```html
<button v-on:click="doSomething">点击</button>
<!-- 简写 -->
<button @click="doSomething">点击</button>
```

**修饰符**：

- `.stop`：阻止事件冒泡
- `.prevent`：阻止默认事件
- `.once`：只触发一次
- `.capture`：使用捕获模式
- `.self`：仅自身触发时触发事件

**示例**：

```html
<form @submit.prevent="onSubmit"></form>
<div @click.stop="onDivClick"></div>
```

### 3. `v-model`

**作用**：实现表单控件与数据的双向绑定。

**适用控件**：`<input>`、`<textarea>`、`<select>` 等。

**语法**：

```html
<input v-model="message">
<select v-model="selected">
  <option>选项A</option>
</select>
```

### 4. `v-if` / `v-else-if` / `v-else`

**作用**：条件控制组件或元素是否创建、销毁。

**语法**：

```html
<p v-if="score > 90">优秀</p>
<p v-else-if="score >= 60">及格</p>
<p v-else>不及格</p>
```

**注意**：`v-if` 是真实的 DOM 创建/销毁，会影响性能，适合运行时条件判断较少的情况。

### 5. `v-show`

**作用**：通过 CSS 的 `display` 属性控制显示/隐藏。

**语法**：

```html
<p v-show="isVisible">这段内容可见</p>
```

**特点**：

- 元素始终存在于 DOM 中
- 仅切换 `display: none`
- 性能开销小，适合频繁切换

### 6. `v-for`

**作用**：基于数组、对象、字符串、数字进行列表渲染。

**语法**：

```html
<li v-for="(item, index) in items" :key="index">
  {{ item }}
</li>
```

**对象遍历**：

```html
<div v-for="(value, key, index) in obj" :key="key">
  {{ key }}: {{ value }}
</div>
```

**注意**：必须提供唯一的 `:key`，以优化渲染性能。

### 7. `v-pre`

**作用**：跳过该元素和子元素的编译过程，提升性能或展示原始 Mustache。

**语法**：

```html
<span v-pre>{{ 未编译 }}</span>
```

### 8. `v-cloak`

**作用**：防止 Vue 未挂载前模板闪烁。

**用法**：

```html
<div v-cloak>{{ msg }}</div>
```

结合 CSS 隐藏：

```css
[v-cloak] { display: none; }
```

### 9. `v-once`

**作用**：只渲染一次，数据变化不再更新。

**语法**：

```html
<h1 v-once>{{ title }}</h1>
```

**适合**：展示静态数据，节省性能消耗。

### 10. 其他内置指令

|指令|功能简述|
|---|---|
|`v-html`|输出 HTML 字符串并渲染|
|`v-text`|替代 Mustache 输出纯文本|

```html
<div v-html="htmlContent"></div>
<div v-text="plainText"></div>
```

## 二、Vue 3 指令新特性

### 1. `v-model` 的增强

**特性**

- 支持多个 `v-model` 绑定，配合 `v-model:propName` 使用。
- 默认绑定的是 `modelValue` 和 `update:modelValue`。

**示例**

父组件写法：

```vue
<MyForm v-model:title="bookTitle" v-model:author="bookAuthor" />
```

子组件写法：

```ts
const props = defineProps(['title', 'author'])
const emit = defineEmits(['update:title', 'update:author'])
```

### 2. `v-on` 支持对象绑定

**特性**

- `v-on` 可绑定整个事件对象，类似 React 的 props 传法。

**示例**

```html
<button v-on="{ click: handleClick, mouseenter: handleHover }">按钮</button>
```

**总结**

- 提高可读性，特别适合封装组件、统一处理事件。

### 3. 组件事件修饰符语法增强

**特性**

Vue 3 中组件的 `v-on` 事件绑定支持更细的控制，尤其是 `.once`、`.number`、`.trim` 修饰符仍然支持，但在自定义组件中绑定也可以直接传入修饰符。

**示例**

```html
<MyInput @update:modelValue.once="handleChange" />
```

# Vue 自定义指令

## 一、Vue 2 自定义指令

### 1. 注册方式

```js
Vue.directive('focus', {
  // 指令第一次绑定到元素时调用
  bind(el) {
    console.log('绑定')
  },
  // 元素插入到 DOM 时调用
  inserted(el) {
    el.focus()
  },
  // 所在组件更新时调用
  update(el, binding) {
    console.log('更新', binding.value)
  },
  // 指令所在组件的 VNode 更新完成后调用
  componentUpdated(el) {
    console.log('组件更新完')
  },
  // 指令与元素解绑时调用
  unbind(el) {
    console.log('解绑')
  }
})
```

### 2. 使用方式

```html
<input v-focus>
```

### 3. 生命周期

|钩子名|调用时机|
|---|---|
|`bind`|指令绑定到元素上时|
|`inserted`|元素插入父节点时|
|`update`|VNode 更新前|
|`componentUpdated`|VNode 及其子组件全部更新后|
|`unbind`|指令解绑时|

## 二、Vue 3 自定义指令

### 1. 定义方式

```js
const vFocus = {
  mounted(el) {
    el.focus()
  },
  updated(el, binding) {
    console.log('更新', binding.value)
  }
}
```

或使用函数形式简写（仅一个 `mounted`）：

```js
const vFocus = (el) => {
  el.focus()
}
```

### 2. 注册方式

```js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.directive('focus', vFocus)
```

### 3. 生命周期

|钩子名|调用时机|
|---|---|
|`created`|指令绑定但未挂载元素前|
|`beforeMount`|元素挂载前|
|`mounted`|元素挂载后|
|`beforeUpdate`|更新前|
|`updated`|更新后|
|`unmounted`|元素卸载后|

## 三、对比总结

|对比项|Vue 2|Vue 3|
|---|---|---|
|注册方式|`Vue.directive(name, options)`|`app.directive(name, options)`|
|生命周期钩子|bind、inserted、update、...|mounted、updated、unmounted、...|
|函数简写|不支持|支持简写函数形式|
|与组合式兼容性|较差|更好|

# Vue 自定义插件

## 一、Vue 2 插件开发与使用

### 1. 插件结构

```js
// myPlugin.js
const MyPlugin = {
  install(Vue, options) {
    // 添加全局方法
    Vue.myGlobalMethod = function () {
      console.log('全局方法')
    }

    // 添加全局指令
    Vue.directive('focus', {
      inserted(el) {
        el.focus()
      }
    })

    // 添加实例方法
    Vue.prototype.$hello = function (msg) {
      console.log(`Hello, ${msg}`)
    }
  }
}

export default MyPlugin
```

### 2. 注册插件

```js
import Vue from 'vue'
import MyPlugin from './myPlugin'

Vue.use(MyPlugin, { someOption: true })
```

## 二、Vue 3 插件开发与使用

### 1. 对象插件

```js
const MyPlugin = {
  install(app, options) {
    // 添加全局方法
    app.config.globalProperties.$hello = (msg) => {
      console.log(`Hello, ${msg}`)
    }

    // 注册全局指令
    app.directive('focus', {
      mounted(el) {
        el.focus()
      }
    })

    // 注册全局组件
    app.component('MyButton', {
      template: `<button><slot /></button>`
    })
  }
}
```

### 2. 函数式插件

```js
function MyPlugin(app, options) {
  app.config.globalProperties.$msg = () => alert('Hi')
}
```

### 3. 注册插件

```js
import { createApp } from 'vue'
import App from './App.vue'
import MyPlugin from './myPlugin'

const app = createApp(App)
app.use(MyPlugin, { option: true })
app.mount('#app')
```

# Vue 组件间通信

## 一、父子通信

### 1. Vue 2

- **父传子：props**
- **子传父：$emit**

```vue
<!-- 父组件 -->
<Child :msg="message" @child-click="handleClick" />

<!-- 子组件 -->
props: ['msg']
this.$emit('child-click', data)
```

### 2. Vue 3

- **父传子：props =》defineProps**
- **子传父：emit =》defineEmits**

```vue
<script setup>
const props = defineProps(['msg'])
const emit = defineEmits(['childClick'])

function onClick() {
  emit('childClick', 'hello')
}
</script>
```

## 二、兄弟通信

### 1. Vue 2

- 把值或方法提升到父组件，再通过 props 传下去。
- 借助 Event Bus

### 2. Vue 3

- 把值或方法提升到父组件，再通过 props 传下去。
- 借助 mitt 库

## 三、祖孙通信

### 1. Vue 2

- 使用 `provide` / `inject`（响应性较弱）

```js
// 祖先组件
provide() {
  return { msg: this.message }
}

// 子孙组件
inject: ['msg']
```

### 2. Vue 3

- 使用增强了响应式支持的 `provide` / `inject`

```js
<script setup>
// 父组件
provide('name', ref('张三'))

// 子组件
const name = inject('name')
</script>
```

## 四、全局状态管理

### 1. Vue 2

- Vue 2 推荐使用 **Vuex 3/4**

### 2. Vue 3

- Vue 3 推荐使用 **Pinia（新一代状态管理）**

## 五、`ref` 获取子组件实例

### 1. Vue 2

- `this.$refs` 中获取实例

```html
<Child ref="child" />
this.$refs.child.someMethod()
```

### 2. Vue 3

- 定义一个同名 `ref(null)`

```html
<Child ref="childRef" />

import { ref, onMounted } from 'vue'

const childRef = ref(null)
onMounted(() => {
  childRef.value.someMethod()
})
```

# Vue 生命周期

## 一、Vue 2 生命周期

### 生命周期钩子

|钩子函数|说明|
|---|---|
|`beforeCreate`|实例初始化完成，`data`/`props`/`methods` 尚未初始化|
|`created`|实例已创建，`data` 可用，未挂载到 DOM|
|`beforeMount`|组件模板编译完成，DOM 未渲染|
|`mounted`|DOM 挂载完成，可以操作 DOM|
|`beforeUpdate`|数据更新前，DOM 仍是旧的|
|`updated`|视图更新后，DOM 已同步|
|`beforeDestroy`|实例销毁前调用，此时组件仍可访问|
|`destroyed`|实例销毁后，所有绑定/事件监听器等被移除|

### 执行顺序

```text
创建阶段：
beforeCreate → created

挂载阶段：
beforeMount → mounted

更新阶段：
beforeUpdate → updated

销毁阶段：
beforeDestroy → destroyed
```

## 二、Vue 3 生命周期（）

### 选项式 API

Vue 3 选项式 API 与 Vue 2 一致，仅将 `beforeDestroy` 改名为 `beforeUnmount`，`destroyed` 改为 `unmounted`。

|Vue 2 名称|Vue 3 对应名称|
|---|---|
|`beforeDestroy`|`beforeUnmount`|
|`destroyed`|`unmounted`|

### 组合式 API

```js
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

onMounted(() => {
  console.log('组件已挂载')
})
```

| 组合式函数名            | 选项式名称                        |
| ----------------- | ---------------------------- |
| `onBeforeMount`   | `beforeMount`                |
| `onMounted`       | `mounted`                    |
| `onBeforeUpdate`  | `beforeUpdate`               |
| `onUpdated`       | `updated`                    |
| `onBeforeUnmount` | `beforeUnmount`              |
| `onUnmounted`     | `unmounted`                  |
| `onActivated`     | `activated`（配合 keep-alive）   |
| `onDeactivated`   | `deactivated`（配合 keep-alive） |

## 三、父子组件生命周期钩子执行顺序

### 1. 挂载阶段

```text
父 beforeCreate
父 created
  子 beforeCreate
  子 created
  
  子 beforeMount
父 beforeMount
  子 mounted
父 mounted
```

### 2. 更新阶段

```text
父 beforeUpdate
  子 beforeUpdate
  
  子 updated
父 updated
```

### 3. 销毁阶段

```text
父 beforeDestroy / beforeUnmount
  子 beforeDestroy / beforeUnmount
  
  子 destroyed / unmounted
父 destroyed / unmounted
```

# Vue 插槽

**子组件**

```vue
// 默认插槽
<slot></slot>
// 具名插槽
<slot name="xxx"></slot>
// 作用域插槽
<slot name="xxx" :value="msg"></slot>
```

**父组件**

```vue
// 默认插槽
<Child>
	<template>123</template>
</Child>
// 具名插槽
<Child>
	<template #xxx>123</template>
</Child>
// 作用域插槽
<Child>
	<template #xxx="slotPros">{{ slotPros.value }}</template>
	<template #xxx="{value}">{{ value }}</template>
</Child>
```

# Vue nextTick

> `nextTick` 是 Vue 提供的一个用于**延迟执行代码到下一个 DOM 更新周期之后**的方法，适用于 Vue 2 和 Vue 3。它常用于在数据变化后，等待视图更新完成再执行某些操作（如访问 DOM）。

## 一、为什么需要 `nextTick`

Vue 在响应式数据更新后，**不会立即同步更新 DOM**，而是采用**异步更新队列**，为了性能优化会进行**批量 DOM 更新**。因此，在你修改数据后立即访问 DOM，拿到的还是**旧的 DOM**。

使用 `nextTick` 可确保 DOM 已经更新完毕。

## 二、基本使用语法

### 1. Vue 2

```js
this.message = 'Hello'
this.$nextTick(() => {
  // DOM 已更新
  console.log(this.$refs.text.innerText)
})
```

### 2. Vue 3

```js
import { nextTick } from 'vue'

count.value++
await nextTick()
// 此时 DOM 已更新
console.log(document.querySelector('#count').textContent)
```

## 三、应用场景

### 1. 获取更新后的 DOM

```vue
<template>
  <div ref="box">{{ message }}</div>
</template>

<script>
export default {
  data() {
    return { message: '原始内容' }
  },
  methods: {
    update() {
      this.message = '更新后的内容'
      this.$nextTick(() => {
        console.log(this.$refs.box.textContent) // 确保是新内容
      })
    }
  }
}
</script>
```

### 2. 配合动画

```js
this.showModal = true
this.$nextTick(() => {
  this.initThirdPartyLib() // 等待 DOM 存在再初始化
})
```

# Vue 2 响应式数据使用陷阱

## 一、对象相关

### 1. 选项 `data` 必须是函数

**原因**

- 每次创建组件实例时，都会调用这个函数，返回一个**全新的对象**。
- 如果写成对象形式，所有组件实例将共享同一个 `data`，导致数据污染。

**❌ 错误写法：**

```js
export default {
  data: {
    count: 0
  }
}
```

**✅ 正确写法：**

```js
export default {
  data() {
    return {
      count: 0
    }
  }
}
```

### 2. 新增和删除属性不是响应式的

**原因**

Vue 2 初始化时只对 `data` 中**已有属性**做响应式处理。

**❌ 错误写法：**

```js
this.obj.newKey = 'abc'

delete this.obj.key
```

**✅ 正确写法：**

```js
this.$set(this.obj, 'newKey', 'abc')
Vue.set(this.obj, 'newKey', 'abc')

this.$delete(this.obj, 'key')
Vue.delete(this.obj, 'key')
```

### 3. 嵌套对象属性新增也不会响应式

**❌ 错误写法：**

```js
this.user.info = { age: 18 } // ❌
this.user.info.age = 18      // ❌
```

**✅ 正确写法：**

```js
this.$set(this.user, 'info', { age: 18 })
```

### 4. 使用 `Object.freeze()` 会让数据变成非响应式

```js
data() {
  return {
    frozen: Object.freeze({ a: 1 }) // ❌ Vue 不会追踪
  }
}
```

## 二、数组相关

### 1. 修改数组索引和长度，不会触发更新

**原因**

这是因为 **Vue 2 的响应式系统基于 `Object.defineProperty` 实现**，它只能劫持对象的属性访问（getter/setter），而**无法监听数组的索引赋值和 length 属性变化**。

Vue 2 在初始化数组时，重写了部分变更方法以拦截变更并通知视图更新，如下：

- `push()` / `pop()`
- `shift()` / `unshift()`
- `splice()` / `sort()` / `reverse()`

**❌ 错误写法：**

```js
this.arr[1] = 'new' // ❌

this.arr.length = 0 // ❌
```

**✅ 正确写法：**

```js
this.$set(this.arr, 1, 'new')
this.arr.splice(1, 1, 'new')
this.arr.splice(0, this.arr.length)
```

## 三、watch / computed 的相关注意

### 1. 监听对象需要加 `deep: true` 才能监听内部变更

```js
watch: {
  obj(newVal) { ... } // ❌ 只能监听引用变化
  // ✅ 正确写法
  obj: {
    handler(newVal) { ... },
    deep: true
  }
}
```

### 2. computed 不能追踪未初始化的属性

```js
computed: {
  sum() {
    return this.obj.x + this.obj.y // 如果 x/y 是动态添加的，会失效
  }
}
```

# Vue template 模板编译流程

> Vue 的 `template` 模板编译，是将我们写的模板语法（HTML 结构 + 指令）转换为渲染函数 `render` 的过程。Vue 内部会将这个过程分为几个阶段，称为 **模板编译过程（template compilation）**。

## 1. Parse：生成 AST 抽象语法树

- 输入：HTML 模板字符串
- 输出：AST（Abstract Syntax Tree）对象结构
- 工作：解析 HTML 标签、属性、指令（如 `v-if`、`v-for`）、插值 `{{}}`

## 2. Optimize：标记静态节点

- Vue 会遍历 AST，判断哪些节点是**静态节点**，做静态提升优化
- 静态节点标记：`static: true`，`staticRoot: true`

## 3. Generate：生成 render 函数

1. 步骤一：将 AST 转换成 JS 代码字符串，即 `render` 函数源码
2. 步骤二：运行时通过 `new Function(code)` 变成真正的可执行函数。

## 4. Render：配合 diff 算法渲染

`render` 函数每次组件更新时会执行，返回 **VNode 虚拟 DOM 树**，Vue 再通过 diff 算法对比并更新真实 DOM。

# Vue 初始化页面闪动

## 一、表现

Vue 项目在首次加载页面时出现“**初始化页面闪动**”，通常表现为：

页面短暂显示原始 HTML 模板内容（未被 Vue 渲染的数据、指令等），然后才变成正常内容。

## 二、原因

Vue 是在页面加载后才执行 JS 脚本挂载、解析模板、渲染数据。在这之前，HTML 中的模板仍是原样输出：

```html
<!-- 页面刚加载时 -->
<div id="app">
  {{ msg }}
</div>
```

- 还没被 Vue 接管时，浏览器会直接把 `{{ msg }}` 渲染出来。

## 三、解决方法

### 1. 使用 `v-cloak` + CSS 隐藏初始模板

**添加 `v-cloak` 指令**

```html
<div id="app" v-cloak>
  {{ msg }}
</div>
```

**配合 CSS 样式隐藏未编译完成的内容**

```css
[v-cloak] {
  display: none;
}
```

### 2. 移除根节点子元素

只要根节点（Vue 实例挂载的 DOM 元素）内没有内容，页面加载时就不会出现模板闪烁的问题

<body>
  <div id="app"></div>
  <script src="main.js"></script>
</body>
```vue
<body>
  <div id="app"></div>
  <script src="main.js"></script>
</body>
```

### 3. 服务端渲染

闪动本质是 “**客户端渲染延迟**” 问题，可以使用服务端渲染的方式直接输出编译后的 HTML，提高首屏速度，并避免闪动：

- 使用 Vue SSR（服务器端渲染）
- 或 Nuxt（Vue 的 SSR 框架）

# Vue 虚拟 DOM

## 一、什么是虚拟 DOM？

虚拟 DOM 是一种 **用 JavaScript 对象来描述真实 DOM 结构** 的技术。它是一个轻量的、抽象的 DOM 节点表示。

Vue 在视图更新时并不会立即操作真实 DOM，而是：

1. 生成新的虚拟 DOM；
2. 与旧的虚拟 DOM 比较（diff）；
3. 计算出最小差异（patch）；
4. 最后只更新变化的部分 DOM。

## 二、Vue 2 的虚拟 DOM 实现

### 1. 基本结构（VNode）

Vue 2 中，虚拟 DOM 的核心结构是 `VNode` 对象：

```js
const vnode = {
  tag: 'div',
  data: { attrs: { id: 'app' } },
  children: [
    { tag: undefined, text: 'hello', ... } // 文本节点
  ],
  key: undefined,
  ...
}
```

### 2. 渲染流程

```js
template → render 函数 → 虚拟 DOM（VNode） → diff → patch（真实 DOM 更新）
```

### 3. Diff 算法特点

- 使用简单的双端比较算法（基于同层级 key）
- 没有特别细粒度的优化（如 patch 标记、静态提升等）
- 性能较好，但在极端场景下有冗余更新

## 三、Vue 3 的虚拟 DOM 改进

Vue 3 使用了 **完全重写的虚拟 DOM 引擎**，进行了诸多底层优化，目标是更快、更小、更可扩展。

### 1. Block Tree + PatchFlag

- Vue 3 编译模板时，会将模板拆成 **block tree**，按块划分动态区域。
- 并为每个动态节点打上 **patchFlag**，告诉虚拟 DOM 哪部分可能变化。这样更新时只需对动态区域进行 diff，大量静态内容直接跳过。

### 2. 更轻量的 VNode 结构

VNode 的结构更紧凑，例如：

```js
const vnode = {
  type: 'div',
  props: { id: 'app' },
  children: 'hello',
  patchFlag: 1, // 表示是动态文本
  ...
}
```

### 3. 使用 Proxy 代理对象

响应式系统更强大，虚拟 DOM 和响应式状态结合更紧密。

### 4. 支持多个根节点

支持多个根节点（Fragment）、Teleport、Suspense。这些特性使得虚拟 DOM 更灵活，比如：

```vue
<template>
  <>
    <header>...</header>
    <main>...</main>
  </>
</template>
```

# Vue Diff 算法

> Vue 的 Diff 算法是虚拟 DOM 高效更新的核心，它的目的是：
>
> **在新旧两棵虚拟 DOM 树之间找出最小的差异，并把这些差异应用到真实 DOM 上。**

## 一、整体流程

1. Vue 在数据更新时，会调用组件的 `render()` 生成新的虚拟 DOM（VNode）。
2. 与上一次的虚拟 DOM 进行 **diff 对比**。
3. 得到变更记录，通过 **patch 机制** 更新真实 DOM。

## 二、Vue 2 的 Diff - 双端比较

Vue 2 实现了一个**改良版的同层比较 Diff 算法**，核心逻辑是：

**同层比较 + 双端指针 + key 提高对比效率**

### 1. 只比较同层节点

- Vue 不会跨层级对比节点 → 子树被整体替换（非递归比较所有节点）
- 节点类型不同（标签名、组件类型不同） → 直接销毁重建

### 2. 核心是对比子节点数组（children）

Vue 对比子节点时使用**双端比较法**：

```js
let oldStartIdx, oldEndIdx
let newStartIdx, newEndIdx

// 指向旧子节点的头尾索引
// 指向新子节点的头尾索引
```

### 3. 四种命中情况

|情况|操作|
|---|---|
|新头 == 旧头（前面匹配）|patch，指针向后移|
|新尾 == 旧尾（尾部匹配）|patch，指针向前移|
|新尾 == 旧头（倒序移动）|patch + 移动 DOM|
|新头 == 旧尾（前插移动）|patch + 移动 DOM|

### 4. 四种都不匹配

- 使用 `key` 建立映射表查找对应节点
- 找不到：新建节点
- 找到：patch 后，移动旧节点到新位置

### 5. 扫尾处理

- 旧节点还有剩 → 删除
- 新节点还有剩 → 添加

## 三、Vue 3 的 Diff - 带 patchFlag 的编译优化

Vue 3 在 Vue 2 的基础上进行了**彻底重写和增强**，核心改进点：

### 1. 编译时静态提升 + patchFlag

- 在编译模板时判断哪些部分是静态的，哪些是动态的
- 为动态部分打上 `patchFlag`，告诉 runtime 哪些节点需要 patch
- **大幅减少对比开销，只 patch 有变动的部分**

```js
patchFlag: TEXT | CLASS | STYLE | PROPS | FULL_PROPS | HYDRATE_EVENTS | NEED_PATCH
```

### 2. 分块结构（Block Tree）

- 组件模板编译成树形块结构，每个 block 只关心自身动态节点
- patch 只在必要的 block 范围内递归

### 3. 静态内容缓存

静态子树只创建一次，不参与后续 diff，提高性能

## 四、VNode Key 的作用

使用 `key` 是 Diff 算法性能的关键优化手段：

- 没有 `key`：默认按顺序比较 → 节点复用效果差
- 使用 `key`：可以精准判断节点是否复用或移动

```html
<!-- 建议 always 给 v-for 加 key -->
<div v-for="item in list" :key="item.id">{{ item.name }}</div>
```

## 五、性能对比小结

|项目|Vue 2|Vue 3|
|---|---|---|
|Diff 算法|双端对比，按序比较|编译期优化（patchFlag、Block Tree）|
|节点复用|key 支持，复用中等效率|更精准、动态 diff 只在必要部分执行|
|静态提升|有部分提升|全面静态提升，静态子树缓存|
|性能|足够优秀|复杂结构下性能提升明显|

# Vue 异步组件

在 Vue 中，**异步组件（Async Component）** 是一种**按需加载组件**的机制，适用于：

- 页面初始加载不想一次性引入所有组件；
- 组件体积较大，或需要延迟加载（如路由懒加载）；
- 提升首屏加载性能。

## 一、Vue 2 异步组件

### 1. 工厂函数写法

```js
Vue.component('MyComponent', function (resolve, reject) {
  // 异步加载模块
  setTimeout(() => {
    resolve({
      template: '<div>我是异步组件</div>'
    })
  }, 1000)
})
```

### 2. `import()` 写法

这种写法配合 Webpack，会自动打包成一个 chunk，在组件用到时再加载。

```js
Vue.component('MyComponent', () => import('./MyComponent.vue'))
```

## 二、Vue 3 异步组件

### 1. 基本使用

```js
import { defineAsyncComponent } from 'vue'

const MyComponent = defineAsyncComponent(() =>
  import('./MyComponent.vue')
)
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

|配置项|含义|
|---|---|
|`loader`|加载组件的函数（返回 Promise）|
|`loadingComponent`|组件加载中显示的组件|
|`errorComponent`|加载失败时显示的组件|
|`delay`|延迟多少毫秒后显示 loading 组件（默认 200）|
|`timeout`|超过多久未加载完成视为失败|
|`onError`|出错时回调，可实现重试|
|`suspensible`|是否配合 `<Suspense>` 使用|

## 三、路由懒加载

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

## 四、配合 Suspense

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

# Vue Style 标签的 scoped 作用

## 一、作用

当你在 `<style>` 标签中添加 `scoped` 属性时：

```vue
<template>
  <div class="btn">点击</div>
</template>

<style scoped>
.btn {
  color: red;
}
</style>
```

这段样式只会应用到当前组件的 `.btn` 元素，而不会影响其他组件中同样 class 名的元素。

## 二、原理

Vue 在编译阶段会做以下处理：

1. **给组件 DOM 添加一个唯一的属性标记（如 `data-v-xxxxxxx`）**

```html
<div class="btn" data-v-abc123>点击</div>
```

1. **给样式规则选择器自动添加这个属性**

```css
.btn[data-v-abc123] {
  color: red;
}
```

## 三、限制

- `@keyframes` 动画名不会自动作用域
- 第三方样式库不会自动作用域
- 动态添加的 class/元素（如通过 JS 修改）不会自动带上作用域属性
