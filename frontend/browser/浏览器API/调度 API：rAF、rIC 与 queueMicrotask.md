# 调度 API：rAF、rIC 与 queueMicrotask

*类型：knowledge ｜ 难度：进阶 ｜ 标签：浏览器、调度、requestAnimationFrame、requestIdleCallback、queueMicrotask*

**三个调度 API 对应三个不同的执行时机：`requestAnimationFrame` 在下一帧渲染前执行、与屏幕刷新率同步，专为动画与视觉更新设计；`requestIdleCallback` 在主线程空闲时执行低优先级任务（用 `timeout` 兜底保证执行），适合预加载与埋点等非紧急工作；`queueMicrotask` 把任务插进微任务队列，在当前同步代码结束后、下一个宏任务开始前执行，是比 `setTimeout` 更早的「延迟一下」。选型口诀：视觉更新找 rAF，后台杂事找 rIC，同步后立即执行找微任务。**

## requestAnimationFrame

浏览器提供的异步 API，在**下一帧渲染前**执行回调，与屏幕刷新率同步，专为高性能动画设计。

### 工作原理

- 浏览器默认 60fps（约 16.67ms/帧），高刷屏幕自动适配
- 回调在每帧**绘制前**执行，与渲染管线对齐
- 标签页不活跃时**自动暂停**，节省资源

### 基本语法

```js
let animationId;

function animate() {
  drawSomething(); // 更新动画逻辑

  animationId = requestAnimationFrame(animate); // 注册下一帧回调
}

animate();                          // 启动
cancelAnimationFrame(animationId);  // 停止
```

### 对比 setTimeout / setInterval

| 特性 | `requestAnimationFrame` | `setTimeout / setInterval` |
| --- | --- | --- |
| 帧同步 | 与浏览器刷新同步 | 不同步，可能掉帧 |
| 节流 | 不活跃时自动暂停 | 持续执行 |
| 性能 | GPU 友好，少布局重排 | CPU 压力大 |
| 适用场景 | 动画、渲染相关 | 通用定时任务 |

### 常见用法

节流高频事件（scroll / resize）：

```js
// 用 rAF 把高频事件的处理对齐到每帧最多一次
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      handleScroll();
      ticking = false;
    });
    ticking = true;
  }
});
```

Vue 中使用：

```js
import { onMounted, onBeforeUnmount } from 'vue';

let animationId;

onMounted(() => {
  function update() {
    // 更新数据或 DOM
    animationId = requestAnimationFrame(update);
  }
  update();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId); // 必须取消，否则内存泄漏
});
```

### 适用场景

| 场景 | 示例 |
| --- | --- |
| 动画 | 位置、旋转、缩放、颜色变换 |
| 拖拽 | 鼠标跟随、滑块、虚拟滚动 |
| 可视化 | 数据图表、粒子动画 |
| 游戏开发 | 主循环、角色移动、碰撞检测 |
| 性能节流 | 替代 `mousemove` 高频触发 |

### 注意事项

- 每帧逻辑不要太重，否则超过 16ms 就会掉帧
- 非动画逻辑用 `setTimeout`，不要滥用 rAF
- 组件销毁时必须调用 `cancelAnimationFrame`

## requestIdleCallback

浏览器提供的异步 API，在**主线程空闲时**执行低优先级任务，不影响关键渲染路径。

### 工作原理

浏览器完成高优先级任务（交互、布局、渲染）后，若当前帧还有剩余时间，则调用注册的回调。

回调接收 `IdleDeadline` 对象，用于判断剩余空闲时间：

| 属性 / 方法 | 含义 |
| --- | --- |
| `timeRemaining()` | 当前帧剩余的空闲毫秒数 |
| `didTimeout` | 是否因超时被强制执行 |

### 基本语法

```js
// 空闲时间内尽量多处理任务，做不完留到下一个空闲期
const handle = requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    doNextTask();
  }
}, { timeout: 2000 }); // 最多等 2s，超时强制执行

cancelIdleCallback(handle); // 取消
```

`options.timeout`：若超过该毫秒数回调仍未执行，则强制放入事件循环执行（可能影响性能）。

### 对比 requestAnimationFrame

| 对比项 | `requestAnimationFrame` | `requestIdleCallback` |
| --- | --- | --- |
| 执行时机 | 下一帧渲染前 | 主线程空闲时 |
| 适用任务 | 动画、视觉更新 | 后台、非紧急任务 |
| 帧同步 | 是（约 60fps） | 否（取决于系统负载） |
| 是否保证执行 | 是（每帧都调） | 否（可能跳过，需设 timeout） |

### 使用场景

| 场景 | 示例 |
| --- | --- |
| 异步预加载 | 懒加载模块、组件、图片 |
| 缓存处理 | 本地缓存更新、预写入 |
| 非阻塞任务 | 日志上传、埋点、性能统计 |
| DOM 清理 | 虚拟 DOM diff 后清理无关节点 |
| UI 空闲优化 | 拖动结束后处理回弹动画 |

### 示例

```js
// 空闲时预加载模块
requestIdleCallback(async () => {
  const { default: heavyModule } = await import('./heavy-module.js');
  heavyModule.init();
});

// 空闲时预加载图片
requestIdleCallback(() => {
  const img = new Image();
  img.src = 'https://example.com/slow-image.jpg';
});
```

### Safari 兼容（Polyfill）

`requestIdleCallback` 在 Safari 中不支持，可用以下 polyfill：

```js
// 用 setTimeout 模拟：给 deadline 一个约 50ms 的虚拟空闲额度
window.requestIdleCallback = window.requestIdleCallback || function (cb) {
  return setTimeout(() => {
    const start = Date.now();
    cb({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  }, 1);
};

window.cancelIdleCallback = window.cancelIdleCallback || clearTimeout;
```

## queueMicrotask

将函数加入微任务队列，在当前同步代码执行完后、下一个宏任务开始前执行。

### 执行顺序

```text
同步代码 → 微任务队列（queueMicrotask / Promise.then）→ 宏任务（setTimeout / setInterval）
```

```js
console.log('1');

queueMicrotask(() => console.log('2'));

Promise.resolve().then(() => console.log('3'));

setTimeout(() => console.log('4'), 0);

console.log('5');

// 输出：1 → 5 → 2 → 3 → 4
```

`queueMicrotask` 和 `Promise.then` 都是微任务，按注册顺序执行，所以 2 在 3 之前。

### 对比 Promise.then()

| 特点 | `queueMicrotask` | `Promise.then()` |
| --- | --- | --- |
| 本质 | 直接调度微任务 | 也是微任务（基于 Promise 实现） |
| 可读性 | 简洁，适合临时调度 | 链式/嵌套，不适合临时调度 |
| 性能 | 更轻量，少一层 Promise 包装 | 相对较重 |
| 错误处理 | 异常会终止后续微任务队列 | 可通过 `.catch()` 捕获 |

```js
// 异常行为对比
queueMicrotask(() => {
  throw new Error('oops'); // 会中断后续微任务队列
});

Promise.resolve().then(() => {
  throw new Error('oops'); // 可被 .catch() 捕获
}).catch(err => console.log('捕获:', err));
```

### 使用场景

延迟到同步代码结束后执行，但比 `setTimeout` 更早：

```js
// 当前同步任务完成后立即执行，不等下一轮事件循环
queueMicrotask(() => {
  updateUI();
});
```

避免递归栈溢出：

```js
// 每次递归通过微任务让出执行权，调用栈不会持续增长
function process(data) {
  if (data.length === 0) return;
  queueMicrotask(() => process(data.slice(1)));
}
```
