# CommonJS 与 ES Module 的对比与互操作

*类型：question ｜ 难度：进阶 ｜ 标签：CommonJS、ES Module、模块化、Tree Shaking、循环依赖、动态导入*

**结论：两者最本质的分歧是加载时机——CommonJS 是运行时加载（执行到 require 才解析依赖），ES Module 是编译时静态分析（代码运行前依赖图已确定）。由此派生出全部差异：输出上 CJS 是值的拷贝、ESM 是值的引用；加载上 CJS 同步、ESM 异步；优化上只有 ESM 的静态结构能做 Tree Shaking。互操作上，Node 的 CJS 只能通过动态 `import()` 加载 ESM，ESM 中 `require` 一个 CJS 模块得到的是 `module.exports` 整体作为默认导出；`__dirname`、`require` 等 CJS 全局变量在 ESM 中不存在，需用 `import.meta.url` 等替代。**

## 核心差异总览

| 特性 | CommonJS | ES Module |
|------|----------|-----------|
| 加载时机 | 运行时加载 | 编译时加载 |
| 加载方式 | 同步加载 | 异步加载 |
| 输出 | 值的拷贝 | 值的引用 |
| this 指向 | 当前模块（exports） | undefined |
| 使用环境 | Node.js | 浏览器、Node.js |
| 动态导入 | 支持（require 可写在条件里） | 支持（import()） |
| 循环依赖 | 返回已执行部分 | 动态引用 |
| Tree Shaking | 不支持 | 支持 |

## 三个关键差异详解

### 加载时机

```js
// CommonJS：运行时加载，require 可以出现在条件分支里
const math = require('./math');
if (condition) {
  const utils = require('./utils'); // 合法：执行到才加载
}

// ES Module：静态 import 必须在顶层，编译阶段就确定依赖
import math from './math.js';
// if (condition) {
//   import utils from './utils.js'; // SyntaxError
// }

// 条件场景用动态导入补位
if (condition) {
  import('./utils.js').then(utils => utils.init());
}
```

### 值的拷贝 vs 值的引用

```js
// CommonJS：值的拷贝——导出时刻的快照
// lib.js
let counter = 0;
exports.counter = counter;
exports.increment = () => counter++;

// main.js
const lib = require('./lib');
console.log(lib.counter); // 0
lib.increment();
console.log(lib.counter); // 0 —— 内部变化不影响已导出的拷贝

// ES Module：值的引用——实时绑定
// lib.js
export let counter = 0;
export function increment() {
  counter++;
}

// main.js
import { counter, increment } from './lib.js';
console.log(counter); // 0
increment();
console.log(counter); // 1 —— 导入方同步看到内部变化
```

### Tree Shaking

静态结构让打包工具能在编译期确定「哪些导出没被用到」并整体剔除。

```js
// ES Module：支持 Tree Shaking
// utils.js
export function used() {
  return 'used';
}
export function unused() {
  return 'unused';
}

// main.js
import { used } from './utils.js';
// 打包时 unused 会被移除

// CommonJS：不支持
const utils = require('./utils');
// require 拿到整个对象，静态分析无法判定 unused 是否被调用，整个模块都会被打包
```

## 互操作

### 在 CommonJS 中加载 ES Module

Node.js 的 `require` 是同步的，而 ESM 加载是异步过程，因此 CJS 无法同步 require ESM，只能使用返回 Promise 的动态 `import()`：

```js
// main.cjs
(async () => {
  // 动态 import 可以加载 ESM，返回模块命名空间对象
  const esmModule = await import('./module.mjs');
  esmModule.hello();
})();
```

### 在 ES Module 中使用 CommonJS

ESM 中可以使用 `createRequire`，或直接用动态 `import()` 加载 CJS 模块——`module.exports` 会成为该模块的默认导出：

```js
// main.mjs
// 方式 1：动态 import 加载 CJS，module.exports 整体作为 default
const cjsModule = await import('./legacy.cjs');
const legacy = cjsModule.default; // 即 module.exports

// 方式 2：createRequire 在 ESM 中创建 require 函数
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const legacy2 = require('./legacy.cjs');
```

### CJS 环境变量在 ESM 中的替代

```js
// CommonJS 独有的全局量：__dirname、__filename、require
// ESM 中不存在，用 import.meta 替代：

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url); // 当前模块绝对路径
const __dirname = path.dirname(__filename);        // 当前模块目录
```

## 实际应用

### Node.js 项目的模块类型选择

```json
// package.json：声明后 .js 文件按 ESM 解析
{
  "type": "module"
}
```

- `.mjs` 永远是 ESM，`.cjs` 永远是 CJS，不受 `type` 影响
- 迁移旧项目时，CJS 文件改名 `.cjs` 可以与 ESM 共存

### 库的双格式发布

```json
// package.json：同时提供两种产物，按消费者环境自动选择
{
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "exports": {
    "require": "./dist/index.cjs.js",
    "import": "./dist/index.esm.js"
  }
}
```

## 最佳实践

- 新项目一律 ESM：静态分析、Tree Shaking、浏览器与 Node 通吃
- 明确命名导出优于整个对象默认导出，利于 Tree Shaking 与重构
- 按需导入而非 `import * as`，只引入用到的成员
- 循环依赖在 CJS 中返回「执行到一半的快照」、在 ESM 中靠动态引用延缓解析，两者都能「不报错」但都可能拿到 `undefined`——设计上应提取共享模块规避循环
- 常见陷阱：ESM 中误用 `require`/`__dirname`；CJS 中 `exports = xxx` 切断引用；浏览器漏写 `type="module"`
