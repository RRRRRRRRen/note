# 虚拟 DOM 与 Diff 算法

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、虚拟DOM、VNode、Diff、patchFlag*

**虚拟 DOM 是用 JavaScript 对象描述真实 DOM 的轻量抽象：更新时先渲染出新的 VNode 树，diff 对比出最小差异，再由 patch 精准更新真实 DOM。Vue 2 用「同层比较 + 双端指针」的 Diff；Vue 3 在此之上叠加编译时优化——PatchFlag 标记动态节点、Block Tree 按块收集、静态提升与缓存，把对比范围从「整棵树」缩小到「动态节点清单」。**

## 什么是虚拟 DOM

虚拟 DOM 是一种用 JavaScript 对象来描述真实 DOM 结构的技术，是一个轻量的、抽象的 DOM 节点表示。

Vue 在视图更新时并不会立即操作真实 DOM，而是：

1. 生成新的虚拟 DOM。
2. 与旧的虚拟 DOM 比较（diff）。
3. 计算出最小差异（patch）。
4. 最后只更新变化的部分 DOM。

## VNode 结构

Vue 2 中，虚拟 DOM 的核心结构是 `VNode` 对象：

```js
const vnode = {
  tag: 'div',
  data: { attrs: { id: 'app' } },
  children: [
    { tag: undefined, text: 'hello' } // 文本节点
  ],
  key: undefined
}
```

Vue 3 的 VNode 结构更紧凑，并新增编译期标记：

```js
const vnode = {
  type: 'div',
  props: { id: 'app' },
  children: 'hello',
  patchFlag: 1 // 表示是动态文本
}
```

整体渲染流程：

```text
template → render 函数 → 虚拟 DOM（VNode） → diff → patch（真实 DOM 更新）
```

## Vue 2 的 Diff：双端比较

Vue 2 实现了一个改良版的同层比较 Diff 算法，核心逻辑是：同层比较 + 双端指针 + key 提高对比效率。

### 1. 只比较同层节点

- Vue 不会跨层级对比节点，子树被整体替换（非递归比较所有节点）。
- 节点类型不同（标签名、组件类型不同），直接销毁重建。

### 2. 核心是对比子节点数组（children）

Vue 对比子节点时使用双端比较法，维护四个指针：

```js
let oldStartIdx, oldEndIdx
let newStartIdx, newEndIdx

// 指向旧子节点的头尾索引
// 指向新子节点的头尾索引
```

### 3. 四种命中情况

| 情况 | 操作 |
| --- | --- |
| 新头 == 旧头（前面匹配） | patch，指针向后移 |
| 新尾 == 旧尾（尾部匹配） | patch，指针向前移 |
| 新尾 == 旧头（倒序移动） | patch + 移动 DOM |
| 新头 == 旧尾（前插移动） | patch + 移动 DOM |

### 4. 四种都不匹配

- 使用 `key` 建立映射表查找对应节点。
- 找不到：新建节点。
- 找到：patch 后，移动旧节点到新位置。

### 5. 扫尾处理

- 旧节点还有剩：删除。
- 新节点还有剩：添加。

Vue 2 的 Diff 没有特别细粒度的编译期优化（如 patch 标记、静态提升），性能较好，但极端场景下有冗余更新。

## Vue 3 的 Diff：编译时优化

Vue 3 重写了虚拟 DOM 引擎，核心思路是把优化从「运行时」提前到「编译时」。

### 1. Block Tree + PatchFlag

- Vue 3 编译模板时，会将模板拆成 Block Tree，按块划分动态区域。
- 并为每个动态节点打上 patchFlag，告诉虚拟 DOM 哪部分可能变化。更新时只需对动态区域进行 diff，大量静态内容直接跳过。

```js
patchFlag: TEXT | CLASS | STYLE | PROPS | FULL_PROPS | HYDRATE_EVENTS | NEED_PATCH
```

### 2. 静态提升与缓存

- 编译时判断哪些部分是静态的、哪些是动态的，静态节点被提升出 render 函数。
- 静态子树只创建一次，不参与后续 diff，提高性能。

### 3. 更灵活的结构

配合 Proxy 响应式系统，虚拟 DOM 与响应式状态结合更紧密；支持多个根节点（Fragment）、Teleport、Suspense：

```vue
<template>
  <header>...</header>
  <main>...</main>
</template>
```

## VNode Key 的作用

使用 `key` 是 Diff 算法性能的关键优化手段：

- 没有 `key`：默认按顺序比较，节点复用效果差。
- 使用 `key`：可以精准判断节点是否复用或移动。

```html
<!-- 建议永远给 v-for 加 key -->
<div v-for="item in list" :key="item.id">{{ item.name }}</div>
```

## 性能对比小结

| 项目 | Vue 2 | Vue 3 |
| --- | --- | --- |
| Diff 算法 | 双端对比，按序比较 | 编译期优化（patchFlag、Block Tree） |
| 节点复用 | key 支持，复用中等效率 | 更精准，动态 diff 只在必要部分执行 |
| 静态提升 | 有部分提升 | 全面静态提升，静态子树缓存 |
| 性能 | 足够优秀 | 复杂结构下性能提升明显 |
