# JavaScript 的加载与执行会阻塞浏览器渲染吗？

*类型：knowledge ｜ 难度：进阶 ｜ 标签：浏览器、渲染阻塞、script、CSS 阻塞、预解析*

**会，但要分清阻塞的是哪一段：JS 的加载、解析与执行会阻塞 DOM 解析（HTML 解析器遇到 script 时暂停等待）；CSS 不阻塞 DOM 解析，但阻塞 DOM 渲染，并且阻塞其后的 JS 执行——因为 JS 可能需要读取样式信息。三者的执行顺序固定为：下载并构建 CSSOM → 执行 JS → 继续 DOM 解析。**

## JS 阻塞 DOM 解析

HTML 解析器遇到 `<script>` 时暂停，等待 JS 下载并执行完毕后继续解析。

优化方案：

- 将 `<script>` 放在 `<body>` 尾部。
- `defer`：异步下载，在 `DOMContentLoaded` 前按顺序执行。
- `async`：异步下载并立即执行，不保证顺序。
- 动态加载：按需创建 script 标签。

首屏渲染优先，不应在首屏加载过多 JS 文件。

## CSS 加载与阻塞

- CSS 不阻塞 DOM 解析，但阻塞 DOM 渲染。
- CSS 阻塞 JS 执行（JS 可能需要获取样式信息，如 `getComputedStyle`）。
- JS 阻塞 DOM 解析。

执行顺序：下载并构建 CSSOM → 执行 JS → 继续 DOM 解析。

## 文档预解析（Preload Scanner）

Webkit 和 Firefox 均实现了预解析优化：主线程执行 JS 时，另一个线程继续解析剩余的文档并提前加载后续网络资源，实现资源并行加载，减轻 JS 阻塞带来的下载停滞。

- 预解析不改变 DOM 树，只解析外部资源引用（脚本、样式表、图片等）。
- 它缓解的是「阻塞期间资源无法下载」的问题，不改变脚本执行的顺序语义。
