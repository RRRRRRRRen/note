# 组件基础：注册、Props 与事件

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、Vue3、组件注册、props、事件、v-model、透传*

**组件的组织围绕「注册 → 传参 → 事件 → 透传」展开：全局注册用 `app.component`（无法 tree-shaking），局部注册在 `<script setup>` 中 import 即用；父传子用 `defineProps` 声明并校验，子传父用 `defineEmits` 抛事件（组件事件没有冒泡）；`v-model` 本质是 modelValue prop + update:modelValue 事件的语法糖；未被声明为 props/emits 的 attribute 与事件会自动透传到根元素，可用 `useAttrs` 接管。**

## 组件注册

### 1. 全局注册

特点：

- 使用 app 实例的 `app.component()` 方法，可以链式调用。
- 全局注册无法 tree-shaking（即使未使用也会被打包）。

```js
import { createApp } from 'vue'
import MyComponent from './App.vue'

const app = createApp({})

app.component('MyComponent', MyComponent)
```

```js
app
  .component('ComponentA', ComponentA)
  .component('ComponentB', ComponentB)
  .component('ComponentC', ComponentC)
```

### 2. 局部注册

`<script setup>` 中导入即可直接在模板中使用：

```vue
<script setup>
import ComponentA from './ComponentA.vue'
</script>

<template>
  <ComponentA />
</template>
```

### 3. 动态组件

被传给 `:is` 的值可以是：被注册的组件名、导入的组件对象。

```vue
<!-- currentTab 改变时组件也改变 -->
<component :is="tabs[currentTab]"></component>
```

动态组件切换时，建议用 shallowRef 存组件对象、markRaw 标记不需要响应式代理的数据：

```vue
<script setup>
import { markRaw, reactive, shallowRef } from 'vue'
import AVue from './A.vue'
import BVue from './B.vue'
// 使用 shallowRef 节约资源（避免组件对象被深度代理）
const cpt = shallowRef(AVue)
// 使用 markRaw 标记不需要响应式的数据
const data = reactive([
  { cpt: markRaw(AVue), id: 0 },
  { cpt: markRaw(BVue), id: 1 }
])
const change = (id) => {
  cpt.value = data[id].cpt
}
</script>

<template>
  <div @click="change(item.id)" v-for="item in data" :key="item.id">
    {{ item.id }}
  </div>
  <component :is="cpt"></component>
</template>
```

## Props

### 1. Props 声明

`defineProps` 是仅 `<script setup>` 中可用的编译宏命令：

```vue
<script setup>
const props = defineProps(['foo'])

console.log(props.foo)
</script>
```

### 2. Props 校验

```js
defineProps({
  // 基础类型检查
  // （给出 `null` 和 `undefined` 值则会跳过任何类型检查）
  propA: Number,
  // 多种可能的类型
  propB: [String, Number],
  // 必传，且为 String 类型
  propC: {
    type: String,
    required: true
  },
  // Number 类型的默认值
  propD: {
    type: Number,
    default: 100
  },
  // 对象类型的默认值
  propE: {
    type: Object,
    // 对象或数组的默认值必须从一个工厂函数返回，
    // 该函数接收组件所接收到的原始 prop 作为参数
    default(rawProps) {
      return { message: 'hello' }
    }
  },
  // 自定义类型校验函数
  propF: {
    validator(value) {
      // The value must match one of these strings
      return ['success', 'warning', 'danger'].includes(value)
    }
  },
  // 函数类型的默认值：不是一个工厂函数，
  // 而是直接返回一个作为默认值的函数
  propG: {
    type: Function,
    default() {
      return 'Default function'
    }
  }
})
```

TS 泛型写法配合 `withDefaults` 提供默认值：

```js
const props = withDefaults(
  defineProps<{
    title: string,
    arr?: number[]
  }>(),
  {
    title: () => 'renguoqiang',
    arr: () => [2, 3, 4]
  }
)
```

## 组件事件

### 1. 事件声明

特点：

- 通过 `defineEmits` 宏来声明需要抛出的事件。
- 模板中可以直接使用 `$emit`。
- 组件触发的事件没有冒泡机制。

```vue
<script setup>
const emit = defineEmits(['inFocus', 'submit'])

function buttonClick() {
  emit('submit')
}
</script>
```

```vue
<button @click="$emit('increaseBy', 1)">
  Increase by 1
</button>
```

TS 声明可约束事件名与载荷类型：

```js
const emit = defineEmits<{
  (e: 'on-click', payload: string): void
  (e: 'on-input', payload: string): void
}>()
```

### 2. 自定义 v-model

`v-model` 的本质：默认绑定 `modelValue` prop，监听 `update:modelValue` 事件；`v-model:xxx` 绑定 `xxx` prop 与 `update:xxx` 事件；自定义修饰符通过 `xxxModifiers` prop 接收。

```vue
<!-- Father -->
<template>
  <button @click="change">关闭</button>
  {{ flag }}
  <AVue v-model="flag" v-model:text.isOK="text" />
  {{ text }}
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AVue from './A.vue'

const flag = ref(true)
const text = ref('ren')
const change = () => {
  flag.value = !flag.value
}
</script>
```

```vue
<!-- Child -->
<template>
  <div>
    <button @click="onClose">关闭</button>
    <div>{{ props.modelValue }}</div>
    <input type="text" @input="onInput" :value="props.text" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean
  },
  text: {
    type: String
  },
  // v-model:text.isOK 的修饰符通过 textModifiers 接收
  textModifiers: {
    type: Object
  }
})
const emit = defineEmits(['update:modelValue', 'update:text'])
// 默认 v-model => update:modelValue
const onClose = () => {
  emit('update:modelValue', !props.modelValue)
}
// 自定义 v-model:name => update:name
const onInput = (e: Event) => {
  // 自定义修饰符通过 nameModifiers 定义即可
  console.log('props.textModifiers.isOK :>> ', props.textModifiers!.isOK)
  const target = e.target as HTMLInputElement
  emit('update:text', target.value)
}
</script>
```

## 透传 Attributes

### 1. 特点

- 透传 attribute 指的是传递给一个组件、却没有被该组件声明为 props 或 emits 的 attribute 或 `v-on` 事件监听器。最常见的例子是 `class`、`style` 和 `id`。
- 当组件以单个元素为根渲染时，透传的 attribute 会自动添加到根元素上。
- 如果子组件根元素已有 `class` 或 `style`，会与从父组件继承的值合并。

### 2. 访问透传 Attributes

`<script setup>` 中用 `useAttrs` 接管；对多根组件，需显式绑定 `$attrs` 否则浏览器会警告：

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>
```

```vue
<header>...</header>
<main v-bind="$attrs">...</main>
<footer>...</footer>
```

## provide / inject（跨层级传参）

跨层级的组件传参走 provide / inject，父级 provide 响应式数据，子孙级 inject 使用：

```vue
<!-- 父级 -->
<script setup lang="ts">
import { ref, provide } from 'vue'
import HelloWorldVue from './components/Father.vue'
const value = ref('ren')
provide('value', value)
</script>
```

```vue
<!-- 子孙级 -->
<template>
  <div>{{ value }}</div>
</template>

<script setup lang="ts">
import { inject, Ref } from 'vue'
const value = inject<Ref<string>>('value')
</script>
```

应用级 provide：

```js
import { createApp } from 'vue'

const app = createApp({})

app.provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
```

## 相关笔记

- 插槽的默认 / 具名 / 作用域用法见《插槽：默认、具名与作用域》。
- 异步组件与 defineAsyncComponent 见《异步组件与 defineAsyncComponent》。
- 父子通信的完整选型（含 mitt、ref + defineExpose）见《组件间通信方式》。
