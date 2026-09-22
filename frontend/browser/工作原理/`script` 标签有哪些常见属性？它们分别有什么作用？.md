# `script` 标签有哪些常见属性？它们分别有什么作用？

*类型：knowledge ｜ 难度：进阶 ｜ 标签：浏览器、script、defer、async、渲染阻塞*

**核心是三个控制加载/执行时机的属性：默认（无属性）下载并执行都阻塞 DOM 解析；`async` 下载不阻塞、下载完立即执行（不保证顺序，适合独立脚本）；`defer` 下载不阻塞、DOM 解析完后按顺序执行（DOMContentLoaded 之前）。** 其余常见属性包括 `src`、`type`、`crossorigin`、`integrity`、`nomodule` 等。

## 属性一览

| 属性 | 作用 |
| --- | --- |
| `src` | 引入外部脚本地址；内联脚本不能用 |
| `type` | 脚本类型，`module` 表示 ES Module；`text/javascript` 为默认 |
| `defer` | 异步下载，HTML 解析完后、`DOMContentLoaded` 之前按声明顺序执行 |
| `async` | 异步下载，下载完立即执行，不保证顺序 |
| `crossorigin` | 跨域脚本请求的凭据模式，配合 CORS 错误日志上报 |
| `integrity` | 子资源完整性（SRI），校验 CDN 资源的 hash，防篡改 |
| `nomodule` | 指示不支持 ES Module 的旧浏览器才执行该脚本 |
| `referrerpolicy` | 请求脚本时的 Referer 策略 |

## defer 与 async 的阻塞语义

JS 的加载、解析与执行会阻塞 DOM 解析，HTML 解析器遇到 `<script>` 时暂停，等待 JS 执行完毕后继续。两种异步属性的差别：

- `defer`：异步下载，在 `DOMContentLoaded` 前按顺序执行——适合有依赖关系的业务脚本。
- `async`：异步下载并立即执行，不保证顺序——适合统计、埋点等独立脚本。
- 动态加载：按需创建 script 标签。

```html
<script defer src="app.js"></script>
<!-- defer：HTML 解析完才执行，且保持声明顺序 -->
```

首屏渲染优先，不应在首屏加载过多 JS 文件。

反例：不感知解析流水线——

```html
<head>
  <script>useFooter();</script> <!-- body 还没解析，undefined -->
</head>
```

## 与 CSS 的阻塞关系

- CSS 不阻塞 DOM 解析，但阻塞 DOM 渲染。
- CSS 阻塞 JS 执行（JS 可能需要获取样式信息）。
- JS 阻塞 DOM 解析。

执行顺序：下载并构建 CSSOM → 执行 JS → 继续 DOM 解析。

## 文档预解析

Webkit 和 Firefox 均实现了预解析优化：执行 JS 时，另一个线程解析剩余文档并加载后续网络资源，实现资源并行加载。预解析不改变 DOM 树，只解析外部资源引用（脚本、样式表、图片等），因此 `defer` / `async` 的下载可以与 HTML 解析并行推进。
