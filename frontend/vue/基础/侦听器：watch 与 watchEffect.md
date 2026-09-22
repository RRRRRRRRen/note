# 侦听器：watch 与 watchEffect

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、Vue3、watch、watchEffect*

**watch 是「显式声明数据源、回调里执行逻辑」的精确侦听；watchEffect 是「立即运行函数、自动追踪其用到的依赖、变更时重跑」的隐式追踪。** 关键纪律：watch 不能直接侦听响应式对象的属性值，必须用 getter 函数；深度侦听对象时，ref 需要显式 `deep: true` 而 reactive 默认开启；watchEffect 返回停止监听的函数，回调里的 `cleanUp` 在下一次执行前清理副作用。

## watch

注意事项：

- 不能直接侦听响应式对象的属性值，需要用一个返回该属性的 getter 函数。
- 一个返回响应式对象的 getter 函数，只有在返回不同的对象时，才会触发回调。

监听单个或多个值：

```vue
<!-- 监听单个或者多个值 -->
<template>
  <input type="text" v-model="firstName">
  <input type="text" v-model="lastName">
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';
let firstName = ref('')
let lastName = ref('')
// 监听单个值
watch(firstName, (v, ov) => {
  console.log('监听单个值v, ov :>> ', v, ov);
})
// 监听多个值（传入数组，回调参数同样是数组）
watch([firstName, lastName], (v, ov) => {
  console.log('监听多个值v, ov :>> ', v, ov);
})
</script>
```

深度监听：ref 包裹的对象必须加 `deep: true`；reactive 对象默认开启 deep：

```js
import { watch, ref, onMounted, reactive } from 'vue';

let msg1 = ref({a: {b: {c: '123'}}})
let msg2 = reactive({ a: { b: { c: '123' } } })

// ref 深层对象：必须添加 deep 配置
watch(msg1, (v, ov) => {
  console.log('监听ref深层对象属性 :>> ', v, ov);
}, { deep: true })

// reactive 深层对象：默认开启 deep
watch(msg2, (v, ov) => {
  console.log('监听reactive深层属性 ', v, ov);
})

onMounted(() => {
  msg1.value.a.b.c = '678'
  msg2.a.b.c = '999'
})
```

监听属性值：必须使用 getter 函数形式：

```js
import { watch, ref, onMounted } from 'vue'

let msg1 = ref({ a: { b: { c: '123' } } })

// 侦听嵌套属性：() => msg1.value.a.b.c
watch(
  () => msg1.value.a.b.c,
  (v, ov) => {
    console.log('监听ref深层对象属性 :>> ', v, ov)
  }
)

onMounted(() => {
  msg1.value.a.b.c = '678'
})
```

配置项：

```js
watch(
  () => msg1.a,
  (v, ov) => {
    // ...
  }, {
    deep: true, // 深度监听
    immediate: true, // 立即执行监听（创建时先跑一次回调）
    flush: 'pre' // pre 组件更新前调用，sync 同步调用，post 组件更新后调用
  }
)
```

## watchEffect

特点：

- 立即运行一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行。
- 返回一个停止监听的函数。

```vue
<template>
  <div @click="change">{{ msg1 }}</div>
</template>

<script setup lang="ts">

import { reactive, watchEffect } from 'vue'

let msg1 = reactive({ a: 123 })
const stop = watchEffect((cleanUp) => {
  console.log('收集依赖 :>> ', msg1.a);
  cleanUp(() => {
    console.log('清除副作用的操作,第二次执行前调用');
  })
},{ flush: 'post'})

const change = () => {
  msg1.a++
  // 停止监听：之后 msg1 的变化不再触发重新执行
  stop()
}
</script>
```

## watch 与 watchEffect 对照

| 维度 | watch | watchEffect |
| --- | --- | --- |
| 数据源 | 显式声明（ref / getter / 数组） | 隐式收集（运行中读到的所有响应式依赖） |
| 首次执行 | 默认不执行，需 `immediate: true` | 立即执行一次 |
| 新旧值 | 回调提供 `(v, ov)` 新旧值 | 不提供旧值 |
| 副作用清理 | `onCleanup` 回调 | `cleanUp` 回调，下次执行前调用 |
| 停止监听 | 返回停止函数 | 返回停止函数 |
| 适用 | 需要旧值、条件明确、按需精确触发 | 依赖多且都相关、希望自动收集 |

- 选用结论：需要新旧值对比、或只想在特定数据变化时触发，用 watch；「多个依赖任何一个变了都要重跑」的场景（如根据多个参数拼请求），用 watchEffect 更简洁。
