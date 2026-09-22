# Vue3 生命周期

*类型：knowledge ｜ 难度：基础 ｜ 标签：Vue、Vue3、生命周期、onMounted*

**Vue 3 组合式 API 的生命周期是 `on` 前缀的注册函数：`onBeforeMount` → `onMounted` → `onBeforeUpdate` → `onUpdated` → `onBeforeUnmount` → `onUnmounted`。** 核心分界线是「DOM 拿不拿得到」：挂载前（`onBeforeMount`）访问模板 ref 是 undefined，挂载后才有值；更新前读到的是旧 DOM，更新后才是新内容；卸载后一切引用失效。这些函数必须在 `setup` 作用域内同步注册。

## 六个钩子的完整演示

```vue
<template>
  <div @click="change" ref="dom">{{ msg }}</div>
</template>

<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref } from 'vue';

const msg = ref('ren')
const dom = ref<HTMLDivElement>()
const change = () => {
  msg.value = 'guo'
}
// 挂载前：拿不到 dom 节点
onBeforeMount(() => {
  console.log('onBeforeMount dom.innerText :>> ', dom.value?.innerText); // undefined
})
// 挂载后
onMounted(() => {
  console.log('onMounted dom.innerText :>> ', dom.value?.innerText); // ren
})
// 更新前
onBeforeUpdate(() => {
  console.log('onBeforeUpdate dom.innerText :>> ', dom.value?.innerText); // ren
})
// 更新后
onUpdated(() => {
  console.log('onBeforeUpdate dom.innerText :>> ', dom.value?.innerText); // guo
})
// 卸载前
onBeforeUnmount(() => {
  console.log('onBeforeUnmount dom.innerText :>> ', dom.value?.innerText); // guo
})
// 卸载后
onUnmounted(() => {
  console.log('onUnmounted dom.innerText :>> ', dom.value?.innerText); // undefined
})
</script>
```

## 各阶段职责

| 钩子 | 时机 | 典型用途 | 本例中 dom 输出 |
| --- | --- | --- | --- |
| `onBeforeMount` | 挂载前 | 初始化不依赖 DOM 的数据 | `undefined` |
| `onMounted` | 挂载后 | 请求、操作 DOM、注册第三方实例 | `ren` |
| `onBeforeUpdate` | 更新前 | 读取更新前的 DOM 状态 | `ren` |
| `onUpdated` | 更新后 | 基于更新后 DOM 的操作 | `guo` |
| `onBeforeUnmount` | 卸载前 | 清理前的收尾 | `guo` |
| `onUnmounted` | 卸载后 | 清理定时器、解绑全局事件 | `undefined` |

## 使用要点

- 注册时机：生命周期钩子必须在 `setup`（或 `<script setup>`）内同步调用，不能放在异步回调里，否则无法关联到当前组件实例。
- 副作用清理：放在 `onMounted` 里的订阅/定时器，务必在 `onBeforeUnmount` 或 `onUnmounted` 中清理。
- 对应关系：Options API 的 `beforeMount` / `mounted` / `beforeUpdate` / `updated` / `beforeUnmount` / `unmounted` 与上述钩子一一对应；`setup` 本身约等于 `beforeCreate` + `created` 的合并。
- 被 `<keep-alive>` 缓存的组件另有 `onActivated` / `onDeactivated`，切换时不会重复走卸载/挂载流程。
