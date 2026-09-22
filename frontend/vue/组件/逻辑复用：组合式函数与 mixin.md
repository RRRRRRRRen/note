# 逻辑复用：组合式函数与 mixin

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、Vue3、组合式函数、mixin、逻辑复用*

**组合式函数（以 use 开头、封装响应式状态与副作用的普通函数）是 Vue 3 推荐的逻辑复用方式；相比 mixin，它解决了三大痛点：数据来源不清晰、命名冲突、mixin 之间隐式耦合。** 组合式函数只能在 `<script setup>` 或 `setup()` 钩子中被调用，通过返回值显式暴露状态，消费方解构即用、来源一目了然。

## 组合式函数

### 1. 基本使用

特点：

- 按照惯例，组合式函数名以 use 开头。
- 组合式函数只能在 `<script setup>` 或 `setup()` 钩子中被调用。
- 可以在内部挂靠所属组件的生命周期，来启动和卸载副作用。

```js
// mouse.js
import { ref, onMounted, onUnmounted } from 'vue'

// 按照惯例，组合式函数名以“use”开头
export function useMouse() {
  // 被组合式函数封装和管理的状态
  const x = ref(0)
  const y = ref(0)

  // 组合式函数可以随时更改其状态
  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  // 挂靠所属组件的生命周期，启动和卸载副作用
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  // 通过返回值暴露所管理的状态
  return { x, y }
}
```

消费组件解构即用：

```vue
<script setup>
import { useMouse } from './mouse.js'

const { x, y } = useMouse()
</script>

<template>Mouse position is at: {{ x }}, {{ y }}</template>
```

### 2. 与 mixin 的对比

**不清晰的数据来源**

当使用了多个 mixin 时，实例上的数据属性来自哪个 mixin 变得不清晰，这使追溯实现和理解组件行为变得困难。这也是推荐在组合式函数中使用 ref + 解构模式的理由：让属性的来源在消费组件时一目了然。

**命名空间冲突**

多个来自不同作者的 mixin 可能会注册相同的属性名，造成命名冲突。若使用组合式函数，可以通过在解构变量时对变量进行重命名来避免相同的键名。

**隐式的跨 mixin 交流**

多个 mixin 需要依赖共享的属性名来进行相互作用，这使得它们隐性地耦合在一起。而一个组合式函数的返回值可以作为另一个组合式函数的参数被传入，像普通函数那样。
