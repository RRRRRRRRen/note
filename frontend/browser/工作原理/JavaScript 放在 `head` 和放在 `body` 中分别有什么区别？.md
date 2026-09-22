# JavaScript 放在 `head` 和放在 `body` 中分别有什么区别？

*类型：knowledge ｜ 难度：进阶 ｜ 标签：浏览器、渲染阻塞、script、DOM 解析*

**区别在阻塞时机：放在 `head` 中会阻塞后续 DOM 解析（脚本下载执行完之前，页面内容迟迟出不来，容易出现白屏）；放在 `body` 尾部则先渲染完已有内容再执行脚本，首屏更快，且执行时 DOM 已就绪。** 现代做法是配合 `defer` / `async` 把脚本放 `head`，兼得提前下载与不阻塞解析。

## 放在 head 中

HTML 解析器遇到 `<script>` 时暂停解析，等待脚本下载并执行完毕才继续。此时 `<body>` 尚未解析：

- 页面短暂白屏，首屏时间被拉长。
- 脚本执行时其后的 DOM 元素还不存在，直接查询会拿到 null。

```html
<head>
  <script>useFooter();</script> <!-- body 还没解析，undefined -->
</head>
```

脚本在 DOM 未就绪时执行，这是典型的反例。

## 放在 body 尾部

脚本前面的内容先完成解析与渲染：

- 用户能更早看到页面内容。
- 脚本执行时其前的 DOM 已解析完毕，可以安全查询。

## 优化方案

- 将 `<script>` 放在 `<body>` 尾部。
- `defer`：异步下载，在 `DOMContentLoaded` 前按顺序执行——推荐放 head 中，下载与解析并行。
- `async`：异步下载并立即执行，不保证顺序，适合独立脚本。
- 动态加载：按需创建 script 标签。

```html
<script defer src="app.js"></script>
<!-- defer：HTML 解析完才执行，且保持声明顺序 -->
```

## 补充：CSS 与 JS 的阻塞关系

- CSS 不阻塞 DOM 解析，但阻塞 DOM 渲染。
- CSS 阻塞 JS 执行（JS 可能需要获取样式信息）。

执行顺序：下载并构建 CSSOM → 执行 JS → 继续 DOM 解析。因此 head 中的 CSS 同样会拖慢其后脚本的执行时机。

## 文档预解析

Webkit 和 Firefox 均实现了预解析优化：执行 JS 时，另一个线程解析剩余文档并加载后续网络资源，实现资源并行加载。预解析不改变 DOM 树，只解析外部资源引用（脚本、样式表、图片等）——这也是「脚本放 head 配合 defer」不会损失下载时机的原因。
