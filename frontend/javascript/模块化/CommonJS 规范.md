# CommonJS 规范

*类型：knowledge ｜ 难度：进阶 ｜ 标签：CommonJS、Node.js、require、module.exports、模块缓存、循环依赖*

**结论：CommonJS 是为服务器端（Node.js）设计的模块规范，四个关键词概括：同步加载（本地磁盘读文件，快到无需异步）、值的拷贝（导出时刻的快照，导出后模块内变化不影响已导出值）、运行时加载（require 可以写在条件语句里，执行到才加载）、模块缓存（每个模块只执行一次，重复 require 返回同一实例）。核心 API 是 `require`/`module.exports`/`exports`；`exports` 只是 `module.exports` 的引用，重新赋值会切断连接。循环依赖时返回「已执行部分」的 exports，依赖书写顺序。**

## 概述

CommonJS 最初为服务器端 JavaScript（Node.js）设计，特点：

- 同步加载模块
- 模块输出的是值的拷贝
- 运行时加载
- 主要用于服务器端

## 基本语法

### 导出模块

方式 1：`module.exports`

```js
// math.js
function add(a, b) {
  return a + b;
}
function subtract(a, b) {
  return a - b;
}

// 导出对象
module.exports = { add, subtract };

// 或者直接导出单个函数
module.exports = function(x) {
  return x * x;
};
```

方式 2：`exports`

```js
// math.js
exports.add = function(a, b) {
  return a + b;
};
exports.subtract = function(a, b) {
  return a - b;
};
```

`exports` 与 `module.exports` 的关系是高频考点：

```js
// 模块加载时存在这样的初始化：exports 是 module.exports 的引用
var exports = module.exports;

// 正确：给 exports 添加属性，仍在修改同一个对象
exports.add = function() {};

// 错误：重新赋值切断了与 module.exports 的引用关系，导出无效
exports = function() {};

// 正确：换掉导出对象必须用 module.exports
module.exports = function() {};
```

### 导入模块

```js
// main.js
const math = require('./math');
console.log(math.add(2, 3));      // 5
console.log(math.subtract(5, 2)); // 3

// 解构导入
const { add, subtract } = require('./math');
console.log(add(2, 3)); // 5
```

## module 对象

每个模块内部都有一个 `module` 对象，代表当前模块：

```js
console.log(module);
// {
//   id: '.',
//   exports: {},
//   parent: null,
//   filename: '/path/to/file.js',
//   loaded: false,
//   children: [],
//   paths: [...]
// }
```

- `module.id`：模块标识符，通常是带绝对路径的文件名
- `module.filename`：模块文件名（绝对路径）
- `module.loaded`：模块是否已加载完成
- `module.parent`：调用该模块的模块
- `module.children`：该模块依赖的其他模块
- `module.exports`：模块对外输出的接口

## require 加载规则

### 路径规则

```js
require('/home/user/module.js'); // 绝对路径
require('./module.js');          // 相对路径
require('../module.js');

require('fs');     // Node.js 核心模块
require('lodash'); // node_modules 中的第三方模块
```

### 文件扩展名

```js
// 查找顺序：.js → .json → .node
require('./module.js');
require('./module');
require('./module.json');
```

### 目录加载

```js
// 加载目录时的查找顺序：
// 1. package.json 的 main 字段
// 2. index.js
// 3. index.json
// 4. index.node
require('./myModule');
```

### node_modules 查找

```js
// 从当前目录逐级向上查找 node_modules，直到根目录：
// /home/user/project/node_modules/lodash
// /home/user/node_modules/lodash
// /home/node_modules/lodash
// /node_modules/lodash
require('lodash');
```

## 模块缓存机制

模块在第一次被 `require` 后会缓存，后续加载直接从缓存读取——同一个模块全应用只有一个实例。

```js
// counter.js
let count = 0;
module.exports = {
  increment() { count++; },
  getCount() { return count; }
};

// main.js
const counter1 = require('./counter');
const counter2 = require('./counter');

counter1.increment();
console.log(counter1.getCount()); // 1
console.log(counter2.getCount()); // 1 —— 共享同一个实例
console.log(counter1 === counter2); // true
```

```js
// 查看缓存
console.log(require.cache);

// 清除指定模块的缓存（下次 require 会重新执行模块）
delete require.cache[require.resolve('./module')];

// 清除所有缓存
Object.keys(require.cache).forEach(key => {
  delete require.cache[key];
});
```

## 循环依赖

循环依赖时，CommonJS 返回「已执行部分」的 exports——拿到的是加载时刻的快照，未执行到的导出为初始值。

```js
// a.js
exports.done = false;
const b = require('./b'); // 此处转去加载 b，a 暂停在「done: false」状态
console.log('在 a.js 中，b.done =', b.done);
exports.done = true;
console.log('a.js 执行完毕');

// b.js
exports.done = false;
const a = require('./a'); // a 未执行完，拿到 a 当前的部分导出（done: false）
console.log('在 b.js 中，a.done =', a.done);
exports.done = true;
console.log('b.js 执行完毕');

// main.js
const a = require('./a');
const b = require('./b');
console.log('在 main.js 中，a.done =', a.done, ', b.done =', b.done);

// 输出：
// 在 b.js 中，a.done = false
// b.js 执行完毕
// 在 a.js 中，b.done = true
// a.js 执行完毕
// 在 main.js 中，a.done = true , b.done = true
```

## CommonJS 的特点

### 同步加载

- 适合服务器端：文件在本地磁盘，读取耗时可忽略
- 不适合浏览器端：网络请求慢，同步阻塞会卡死页面

### 值的拷贝

导出的是值的快照，模块内部后续变化不影响已导出的值。

```js
// lib.js
let counter = 0;
function increment() {
  counter++;
}
module.exports = {
  counter: counter,   // 导出的是 0 这个值的拷贝
  increment: increment
};

// main.js
const lib = require('./lib');
console.log(lib.counter); // 0
lib.increment();
console.log(lib.counter); // 仍然是 0（值的拷贝，不随模块内部变化）
```

### 运行时加载

模块在代码执行到 `require` 时才加载，因此可以写在条件分支里实现动态加载。

```js
if (condition) {
  const module = require('./moduleA');
} else {
  const module = require('./moduleB');
}
```

## 实践要点

- 需要替换单一导出对象时用 `module.exports`，多成员导出用 `exports.xxx`，切忌给 `exports` 重新赋值
- 「值的拷贝」意味着用 getter 或导出对象引用才能暴露动态状态
- 缓存即单例：模块顶层代码只执行一次，适合放连接池、全局配置
- 循环依赖能规避就规避，提取共享代码到第三个模块是最干净的解法
