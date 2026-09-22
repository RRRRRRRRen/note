# 观察者 API：Intersection/Resize/MutationObserver

*类型：knowledge ｜ 难度：进阶 ｜ 标签：浏览器、观察者、IntersectionObserver、ResizeObserver、MutationObserver*

**三个 Observer 分别盯三种变化，共同点是异步回调、由浏览器调度、替代手写高频监听：`IntersectionObserver` 监听元素与视口（或指定容器）的交叉状态，替代 scroll 监听，懒加载与曝光统计的标准解法；`ResizeObserver` 监听元素自身布局尺寸变化，替代 window resize 监听，做容器级响应式；`MutationObserver` 监听 DOM 结构与属性变化，替代轮询 DOM。性能铁律一致：及时 `disconnect()`、变化频繁加防抖、回调里避免改回被观察的目标以免死循环。**

## IntersectionObserver

异步监听目标元素与视口（或指定容器）的交叉状态变化，替代滚动事件监听，性能更优。

### 核心原理

- 观察元素与根元素的交叉情况，触发异步回调
- 浏览器底层优化调度，不阻塞主线程
- 避免了手写 `scrollTop` 判断带来的性能瓶颈

### 基本语法

```js
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('元素进入视口');
      observer.unobserve(entry.target); // 触发一次后取消监听
    }
  });
}, {
  root: null,        // null 表示浏览器视口
  rootMargin: '0px', // 类似 CSS margin，可提前/延后触发
  threshold: 0.1     // 交叉比例 0~1，可传数组
});

observer.observe(element);
```

### 参数说明

| 参数 | 说明 |
| --- | --- |
| `root` | 基准容器，默认为浏览器视口 |
| `rootMargin` | 偏移量，`'100px'` 表示提前 100px 触发 |
| `threshold` | 交叉比例，`0` 一进入就触发，`1` 完全进入才触发 |

### 典型场景与参数建议

| 场景 | rootMargin | threshold |
| --- | --- | --- |
| 图片懒加载 | `'200px'` | `0` |
| 滚动加载更多 | `'0px 0px 300px 0px'` | `0` |
| 曝光统计 | `'0px'` | `0.5` 或 `1` |
| 动画触发 | `'50px'` | `0.3` |

### 图片懒加载示例

```js
const images = document.querySelectorAll('img[data-src]');

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;   // 进入视口才加载真实图片
      observer.unobserve(img);     // 加载后停止观察
    }
  });
}, { rootMargin: '100px', threshold: 0.1 });

images.forEach(img => observer.observe(img));
```

### 兼容性

IE 不支持，需使用 polyfill。现代浏览器全面支持。

## ResizeObserver

异步监听 DOM 元素的**布局尺寸变化**（宽/高），不监听内容变化。

### 使用场景

- 响应式布局：元素尺寸变化后重新排版
- 图表自适应：容器缩放时重新绘制
- 虚拟滚动：滚动区域尺寸更新
- Canvas / 游戏：自动缩放适配

### 基本用法

```js
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`尺寸变化：${width}px x ${height}px`);
  }
});

resizeObserver.observe(document.querySelector('#box'));
resizeObserver.disconnect(); // 停止所有监听
```

### Vue 3 示例

```vue
<template>
  <div ref="elRef" class="resize-box">
    当前宽度：{{ size.width }}，高度：{{ size.height }}
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const elRef = ref(null);
const size = ref({ width: 0, height: 0 });
let observer;

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    size.value = { width, height };
  });
  if (elRef.value) observer.observe(elRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect(); // 卸载前停止监听，防止泄漏
});
</script>
```

### entry.contentRect 属性

| 属性 | 含义 |
| --- | --- |
| `width` / `height` | 元素可见区域尺寸（不含滚动条） |
| `top` / `left` | 相对于元素本身的位置（通常为 0） |
| `x` / `y` | 同 `top` / `left` |

### 注意事项

| 注意点 | 说明 |
| --- | --- |
| 频繁触发 | 变化频繁时建议加防抖 |
| `display: none` | 元素隐藏时不触发 |
| 避免死循环 | 回调中修改元素尺寸会再次触发回调 |
| 及时清理 | 组件卸载前调用 `disconnect()` |

防抖写法：

```js
let timer;
const resizeObserver = new ResizeObserver(entries => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    for (const entry of entries) {
      console.log(entry.contentRect.width);
    }
  }, 100);
});
```

## MutationObserver

监听 DOM 的**结构或属性变化**，无需轮询，高效捕捉子节点增删、属性修改、文本变更等。

### 可监听的变化类型

| 配置项 | 描述 |
| --- | --- |
| `childList` | 子元素新增或删除 |
| `attributes` | 属性变化 |
| `characterData` | 文本节点内容变化 |
| `subtree` | 递归监听所有后代节点 |
| `attributeOldValue` | 记录属性变化前的旧值 |
| `characterDataOldValue` | 记录文本变化前的旧值 |

### 基本用法

```js
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      console.log('子节点变化:', mutation.addedNodes, mutation.removedNodes);
    } else if (mutation.type === 'attributes') {
      console.log('属性变化:', mutation.attributeName);
    } else if (mutation.type === 'characterData') {
      console.log('文本变化:', mutation.target.data);
    }
  }
});

observer.observe(document.getElementById('box'), {
  childList: true,
  attributes: true,
  characterData: true,
  subtree: true,
});

observer.disconnect(); // 停止监听
```

### Vue 3 示例

```vue
<template>
  <div ref="targetEl">内容</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const targetEl = ref(null);
let observer;

onMounted(() => {
  observer = new MutationObserver((mutations) => {
    console.log('变化：', mutations);
  });
  observer.observe(targetEl.value, {
    childList: true,
    attributes: true,
    subtree: true,
  });
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>
```

### 使用场景

| 场景 | 说明 |
| --- | --- |
| 动态渲染检测 | 监听第三方组件或 iframe 插入的内容 |
| 自动表单校验 | 属性变化时触发校验逻辑 |
| 元素出现/消失 | 弹窗、提示、广告位插入检测 |
| 页面数据注入 | Chrome 插件修改页面时触发 |

### 性能建议

| 方法 | 说明 |
| --- | --- |
| `disconnect()` | 不再需要时立即停止监听 |
| `takeRecords()` | 立即获取待处理记录但不触发回调 |
| 防抖处理 | 变化频繁时手动 debounce |
| 精准目标 | 避免监听整个 `document.body`，选择具体容器 |
