# ES Module 规范

*类型：knowledge ｜ 难度：进阶 ｜ 标签：ES Module、ESM、import、export、动态导入、import.meta*

**结论：ES Module（ESM）是 ES6 引入的语言级模块规范，与 CommonJS 相反的四个基本盘：静态加载（import/export 必须在顶层，编译时即确定依赖关系图，为此换来 Tree Shaking）、值的引用（导出的是实时绑定，模块内变化会同步到导入方）、导入只读（导入的变量不可赋值）、自动严格模式（顶层 this 为 undefined）。语法上区分命名导出/默认导出/混合导出；ES2020 的动态导入 `import()` 返回 Promise，补上了条件加载与按需加载的能力缺口。浏览器需 `<script type="module">`，Node.js 靠 `.mjs` 或 `package.json` 的 `"type": "module"`。**

## 概述

ES Module 是 ECMAScript 官方模块化规范，特点：

- 静态加载（编译时确定依赖）
- 输出的是值的引用（实时绑定）
- 异步加载
- 浏览器和 Node.js 都支持

## 基本语法

### 命名导出

```js
// math.js

// 方式 1：声明时直接导出
export const PI = 3.14159;
export function add(a, b) {
  return a + b;
}
export class Calculator {
  multiply(a, b) {
    return a * b;
  }
}

// 方式 2：统一导出
const PI = 3.14159;
function add(a, b) {
  return a + b;
}
export { PI, add, Calculator };

// 方式 3：重命名导出
export { add as sum, Calculator as Calc };
```

### 默认导出

每个模块最多一个默认导出，导入方可任意命名。

```js
// user.js

// 导出函数
export default function(name) {
  return `Hello, ${name}`;
}

// 导出类
export default class User {
  constructor(name) {
    this.name = name;
  }
}

// 导出对象
export default {
  name: 'Alice',
  age: 25
};
```

### 混合导出

```js
// module.js
export const version = '1.0.0';
export function helper() {
  return 'helper';
}
export default class Main {
  constructor() {
    this.version = version;
  }
}
```

### 导入模块

```js
// 命名导入：名称必须与导出一致
import { add, PI } from './math.js';

// 重命名导入
import { add as sum } from './math.js';

// 导入所有命名导出到一个命名空间对象
import * as math from './math.js';
console.log(math.add(2, 3));
console.log(math.PI);

// 默认导入：任意命名
import User from './user.js';
import MyUser from './user.js'; // 名称可以不同

// 混合导入：默认导出在前，命名导出在后
import Main, { version, helper } from './module.js';
import Main2 from './module.js';
import { version as v } from './module.js';

// 仅执行模块（副作用导入），不绑定任何变量
import './init.js';
```

## 动态导入（import()）

ES2020 引入，返回 Promise，是静态 import 唯一允许的「运行时加载」补充。

```js
// 用户交互触发按需加载
button.addEventListener('click', async () => {
  const module = await import('./module.js');
  module.doSomething();
});

// 条件导入
if (condition) {
  import('./moduleA.js').then(module => module.init());
} else {
  import('./moduleB.js').then(module => module.init());
}

// 按需加载与错误处理
async function loadModule(moduleName) {
  try {
    return await import(`./modules/${moduleName}.js`);
  } catch (error) {
    console.error('加载失败:', error);
  }
}
```

## 复合导出

在一个模块中导入并重新导出其他模块的内容（当前模块不持有这些绑定）。

```js
export { add, subtract } from './math.js';     // 转发指定成员
export { add as sum } from './math.js';        // 重命名转发
export * from './math.js';                     // 转发所有命名导出
export { default } from './user.js';           // 转发默认导出（保持匿名）
export { default as User } from './user.js';   // 转发默认导出并命名
```

## import.meta

`import.meta` 包含当前模块的元信息，最常用的是模块自身的 URL。

```js
console.log(import.meta.url);
// file:///path/to/module.js（Node）
// http://localhost:3000/module.js（浏览器）

// 实际应用：基于模块 URL 定位相对资源
const imageUrl = new URL('./image.png', import.meta.url);
```

## ES Module 的核心特性

### 静态加载（编译时加载）

import/export 必须出现在模块顶层，代码运行前依赖关系就已确定，打包工具据此做 Tree Shaking。

```js
// 正确：顶层静态导入
import { add } from './math.js';

// 错误：条件语句中的静态导入
// if (condition) {
//   import { add } from './math.js'; // SyntaxError
// }

// 条件场景改用动态导入
if (condition) {
  import('./math.js').then(({ add }) => {
    // 使用 add
  });
}
```

### 值的引用（实时绑定）

导入方拿到的是对导出变量的「只读引用」，模块内部变化会实时反映。

```js
// counter.js
export let counter = 0;
export function increment() {
  counter++;
}

// main.js
import { counter, increment } from './counter.js';
console.log(counter); // 0
increment();
console.log(counter); // 1 —— 值更新了（引用，非拷贝）
```

### 导入的变量是只读的

```js
// module.js
export let value = 1;

// main.js
import { value } from './module.js';
// value = 2; // TypeError: Assignment to constant variable
```

### 自动严格模式

模块代码默认运行在严格模式下，无需 `'use strict'`。

```js
function test() {
  undeclaredVar = 1; // ReferenceError：不允许隐式全局变量
}
```

### 顶层 this 是 undefined

```js
// CommonJS：顶层 this 指向当前模块的 exports
console.log(this === exports); // true

// ES Module：顶层 this 是 undefined
console.log(this); // undefined
```

## 运行环境

### Node.js 中使用

```js
// 方式 1：.mjs 扩展名
// module.mjs
export function hello() {
  console.log('Hello');
}
// main.mjs
import { hello } from './module.mjs';
hello();
```

```json
// 方式 2：package.json 声明后，.js 默认按 ESM 解析
{
  "type": "module"
}
```

### 浏览器中使用

```html
<!DOCTYPE html>
<html>
<body>
  <!-- 内联模块脚本 -->
  <script type="module">
    import { add } from './math.js';
    console.log(add(2, 3));
  </script>

  <!-- 引入外部模块文件：默认 defer，自动处理依赖顺序 -->
  <script type="module" src="./main.js"></script>
</body>
</html>
```

## 实践要点

- 优先命名导出而非默认导出：命名与源码一致，利于重构与 IDE 提示
- 依赖关系静态可分析是 ESM 最大优势，条件加载一律用 `import()`
- 忘写 `type="module"` 是浏览器端最常见的翻车点（报「Cannot use import statement outside a module」）
- 打包时只有 ESM 能被 Tree Shaking，库发布建议同时提供 CJS 与 ESM 两种产物
