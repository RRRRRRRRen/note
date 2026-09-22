# ref、reactive 与响应式基础

*类型：knowledge ｜ 难度：基础 ｜ 标签：Vue、Vue3、ref、reactive、setup、nextTick*

**`ref` 用 `.value` 包装任意值使其响应式（模板中自动解包），`reactive` 把对象本身变成 Proxy 代理（仅限对象类型）；配合 `<script setup>` 的顶层声明直接在模板使用，配合 `nextTick` 在 DOM 更新后取值。** 两者最大的差异在「响应性的连接方式」：ref 永远通过 `.value` 保持连接，reactive 一旦解构或传参就会丢失响应性。

## ref

特征：

- 在模板中使用 ref 时，我们不需要附加 `.value`（自动解包）。
- Ref 可以持有任何类型的值，包括深层嵌套的对象、数组或者 JavaScript 内置的数据结构，比如 `Map`。

```js
import { ref } from 'vue'

const count = ref(0)
// script 中读写必须经过 .value
count.value++
```

## setup

特征：

- `<script setup>` 中的顶层导入、声明的变量和函数可在同一组件的模板中直接使用。

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">
    {{ count }}
  </button>
</template>
```

## nextTick

特征：

- DOM 更新不是同步的。Vue 会在「next tick」更新周期中缓冲所有状态的修改，以确保不管你进行了多少次状态修改，每个组件都只会被更新一次。
- 需要在状态变化后立刻访问更新后的 DOM 时，使用 `await nextTick()`。

```js
import { nextTick } from 'vue'

async function increment() {
  count.value++
  await nextTick()
  // 现在 DOM 已经更新了
}
```

## reactive

特征：

- 与 ref 不同，`reactive()` 将使对象本身具有响应性，读写无需 `.value`。
- 对同一个原始对象调用 `reactive()` 会总是返回同样的代理对象。
- 响应式对象内的嵌套对象依然是代理。
- 当我们将响应式对象的原始类型属性解构为本地变量时，或者将该属性传递给函数时，将丢失响应性连接。

```js
import { reactive } from 'vue'

const state = reactive({ count: 0 })

// 反例：解构丢失响应性
// const { count } = state  // count 只是当时的数字快照
// 正例：解构请使用 toRefs(state)
```

## ref 与 reactive 选用对照

| 维度 | ref | reactive |
| --- | --- | --- |
| 适用类型 | 任意值（含原始类型） | 仅对象/数组/Map/Set 等集合类型 |
| script 中读写 | 必须通过 `.value` | 直接读写属性 |
| 模板中使用 | 自动解包，无需 `.value` | 直接使用 |
| 解构/传参 | `.value` 引用不变，保持响应 | 解构后丢失响应性（需 toRefs） |
| 重新赋值整体 | 支持（替换 `.value`） | 不支持替换整个代理对象 |

## 模版引用

用 ref 直接拿到模板中的 DOM 元素或子组件实例：

- 只可以在组件挂载后才能访问模板引用（`onMounted` 之后）。
- 模板 ref 的属性值必须和声明的 ref 变量同名。
- ref 数组并不保证与源数组相同的顺序。
- 模板引用也可以用在一个子组件上，此时引用中获得的值是组件实例。

### 获取单个元素

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 声明一个 ref 来存放该元素的引用
// 必须和模板里的 ref 同名
const input = ref(null)

onMounted(() => {
  input.value.focus()
})
</script>

<template>
  <input ref="input" />
</template>
```

### v-for 中的模板引用

```vue
<script setup>
import { ref, onMounted } from 'vue'

const list = ref([
  /* ... */
])

const itemRefs = ref([])

onMounted(() => console.log(itemRefs.value))
</script>

<template>
  <ul>
    <li v-for="item in list" ref="itemRefs">
      {{ item }}
    </li>
  </ul>
</template>
```

更多响应式 API（shallowRef、customRef、toRefs 等）见《响应式 API 进阶》。
