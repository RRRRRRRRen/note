# Vue 中 `scoped style` 是如何实现样式隔离的？其原理是什么？

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、scoped、样式隔离、CSS*

**`<style scoped>` 的样式隔离靠编译期打标记实现：Vue 编译组件时给该组件的每个 DOM 元素追加唯一属性 `data-v-xxxxxxx`，并把样式选择器改写成 `.btn[data-v-xxxxxxx]`——选择器只能命中带同款标记的元素，因此样式只作用于当前组件，不会污染其他组件。**

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

## 三、深度选择器 :deep

子组件的根元素会带上当前组件的作用域标记，但子组件内部的元素不会。要穿透 scoped 修改子组件内部样式，使用 `:deep()`：

```vue
<style scoped>
.a :deep(.b) {
  /* ... */
}
</style>
```

编译后 `data-v` 标记只加在 `.a` 上（`.a[data-v-xxx] .b`），从而命中子组件内部的 `.b` 元素。

## 四、限制

- `@keyframes` 动画名不会自动作用域。
- 第三方样式库不会自动作用域。
- 动态添加的 class/元素（如通过 JS 修改）不会自动带上作用域属性。
