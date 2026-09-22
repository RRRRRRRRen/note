# 内置组件：transition 过渡

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、Vue3、transition、transition-group、动画*

**`<Transition>` 在元素插入 / 移除时自动搬运 CSS 过渡与动画：进入与离开各有 from / active / to 三个类名（前缀默认 v-，可通过 name 属性或 enter-from-class 等属性自定义，常用于对接 animate.css）；`appear` 让初次渲染也走动画；`<TransitionGroup>` 则为列表的增删与排序提供过渡。** 另有 8 个 JS 钩子事件可完全接管动画时机。

## Transition 类名规则

六个类名对应进入 / 离开动画的三个阶段：

```js
// v-enter-from：进入动画的起始状态
// v-enter-active：进入动画的生效状态
// v-enter-to：进入动画的结束状态
// v-leave-from：离开动画的起始状态
// v-leave-active：离开动画的生效状态
// v-leave-to：离开动画的结束状态
// 注意：v 用来指代标签 name 属性的值
```

## 自定义类名与 name

配合动画库（如 animate.css）做快捷动画，或自定义类名前缀时使用：

```vue
<!-- Father -->
<template>
  <button @click="changebtn">切换</button>
  <keep-alive>
    <!-- appear: 初次进入就加载动画 -->
    <!-- 用于自定义类名，配合动画库做快捷动画的实现，例如 animate.css -->
    <!-- 可用属性：
      enterFromClass / enterActiveClass / enterToClass
      appearFromClass / appearActiveClass / appearToClass
      leaveFromClass / leaveActiveClass / leaveToClass -->
    <Transition name="test" appear>
      <AVue v-if="flag" />
    </Transition>
  </keep-alive>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AVue from './A.vue'
const flag = ref(true)
const changebtn = () => {
  flag.value = !flag.value
}
</script>

<style scoped>
.test-enter-from,
.test-leave-to {
  top: 15px;
  right: 20px;
}

.test-enter-active,
.test-leave-active {
  transition: all 1s ease;
}
</style>
```

## 生命周期与事件

```text
@before-enter
@before-leave
@enter
@leave
@appear
@after-enter
@after-leave
@after-appear
@enter-cancelled
@leave-cancelled (v-show only)
@appear-cancelled
```

## TransitionGroup 列表过渡

`<TransitionGroup>` 支持包裹列表元素（v-for 渲染的多个节点），同样支持自定义类名属性对接动画库：

```vue
<template>
  <button @click="changebtn(1)">增加</button>
  <button @click="changebtn(-1)">减少</button>
  <!-- 使用 animate.css 动画库提供的效果 -->
  <TransitionGroup
    enter-active-class="animate__animated animate__zoomIn"
    leave-active-class="animate__animated animate__zoomOut"
  >
    <AVue v-if="flag" v-for="item in itemNum" :key="item" />
  </TransitionGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AVue from './A.vue'
const flag = ref(true)
const itemNum = ref(4)
const changebtn = (num: number) => {
  itemNum.value = itemNum.value + num
}
</script>
```
