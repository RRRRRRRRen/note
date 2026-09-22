# JS 内置 API 辨析速查

*类型：knowledge ｜ 难度：入门 ｜ 标签：JavaScript、API*

**易混内置 API 的核心分界线：查找元素判存在用 `includes()`（SameValueZero，能测 NaN）、要索引用 `indexOf()`（严格相等，漏 NaN）；遍历数组用 `for...of`、遍历对象用 `Object.keys()`；给人看的字符串用 `String()`、给机器解析的用 `JSON.stringify()`；字典用 `Map`、结构体用 `Object`；编码整个 URL 用 `encodeURI`、编码参数用 `encodeURIComponent`。**

## includes() vs indexOf()

```js
const arr = [1, NaN, undefined];

arr.indexOf(NaN);    // -1：内部用 === 比较，NaN 永远不等，漏检
arr.includes(NaN);   // true：SameValueZero 算法可检测 NaN

// 语义化差异
if (arr.indexOf(1) !== -1) {}   // 需要额外判断 -1
if (arr.includes(1)) {}         // 直接返回布尔值
```

| 特性 | `indexOf()` | `includes()` |
| --- | --- | --- |
| 返回值 | 索引或 -1 | true / false |
| NaN | 检测不到 | 可检测 |
| 标准 | ES5 | ES2016 |

结论：判断存在性一律 `includes()`，需要索引才用 `indexOf()` / `findIndex()`。

## for...in vs for...of

| 特性 | `for...in` | `for...of` |
| --- | --- | --- |
| 遍历内容 | 键（key） | 值（value） |
| 适用对象 | 所有对象 | 仅可迭代对象（Array、String、Map、Set） |
| 原型链 | 连原型链可枚举属性一起遍历 | 不碰原型链 |
| 顺序 | 不保证 | 按迭代器顺序 |

```js
const arr = ['a', 'b', 'c'];
arr.custom = 'x';

for (const k in arr) console.log(k);    // '0' '1' '2' 'custom'：自定义属性也被遍历
for (const v of arr) console.log(v);    // 'a' 'b' 'c'

Array.prototype.extra = 1;
for (const k in [1, 2]) console.log(k); // '0' '1' 'extra'：原型链属性也进来了

// for (const v of {}) {}  // TypeError：普通对象不可迭代
```

推荐写法：

```js
arr.forEach((v, i) => {});                       // 数组带索引
Object.keys(obj).forEach(k => {});               // 对象只遍历自身可枚举键
for (const [k, v] of Object.entries(obj)) {}     // 同时拿键值
```

## String() vs JSON.stringify()

| 输入 | `String()` | `JSON.stringify()` |
| --- | --- | --- |
| `'abc'` | `abc` | `"abc"`（带引号） |
| `{ key: 'value' }` | `[object Object]` | `{"key":"value"}` |
| `[1, 2, 3]` | `1,2,3` | `[1,2,3]` |
| `undefined` | `'undefined'` | `undefined`（不是字符串） |
| `null` | `'null'` | `'null'` |

```js
const obj = {
  title: 'devpoint',
  toString() { return 'custom'; },
};
String(obj);           // 'custom'：走 toString()
JSON.stringify(obj);   // '{"title":"devpoint"}'：忽略 toString()
```

结论：`String()` 是类型转换（显示给人），`JSON.stringify()` 是序列化（传输/存储给机器），两者不可互换。

## Map vs Object

| 特性 | Map | Object |
| --- | --- | --- |
| 键类型 | 任意类型 | 仅 string / symbol |
| 键顺序 | 插入顺序 | 整数键升序，其余按插入序 |
| 原型键污染 | 无，只有显式插入的键 | 有，需 `Object.create(null)` 规避 |
| 大小 | `map.size` | 手动 `Object.keys().length` |
| 迭代 | 直接可迭代 | 需 `Object.keys()` 等中转 |
| 增删性能 | 频繁增删更优 | 适合静态结构 |

```js
const map = new Map();
map.set(123, 'number key');   // 数字键保持数字类型
map.get(123);                 // 'number key'

const obj = { 123: 'x' };     // 键被转成字符串 '123'
obj['123'];                   // 'x'：数字键与字符串键会撞车
```

结论：频繁增删、非字符串键、要顺序 → Map；JSON 序列化、固定结构体 → Object。

## URL 编码：encodeURI vs encodeURIComponent

| 方法 | 用途 | 编码范围 |
| --- | --- | --- |
| `escape()` | 已废弃 | 不要使用 |
| `encodeURI()` | 完整 URL | 保留 `:/?#[]@!$&'()*+,;=` 等结构字符 |
| `encodeURIComponent()` | 参数值 | 编码所有特殊字符 |

```js
encodeURI('http://a.com/search?q=hello world&lang=中文');
// 'http://a.com/search?q=hello%20world&lang=%E4%B8%AD%E6%96%87'：URL 仍可用

encodeURIComponent('hello&world');
// 'hello%26world'：& 被编码，可安全作为参数值
encodeURIComponent('http://a.com');
// 'http%3A%2F%2Fa.com'：陷阱——对整个 URL 使用会破坏结构
```

结论：拼接查询串时对每个参数值用 `encodeURIComponent()`，对整条 URL 用 `encodeURI()`，用反必出 bug。

## Unicode 与字符串长度

- Unicode 是字符集（码点），UTF-8/16/32 是编码方式（码点如何存字节）。
- JS 字符串内部是 UTF-16，`length` 统计的是 16 位码元数，不是字符数。

```js
'𝌆'.length;   // 2：BMP 外字符占两个码元（代理对）
'你'.length;   // 1：BMP 内一个码元
[...'𝌆'].length;  // 1：扩展运算符按码点展开
```

陷阱：含 emoji 的字符串做 `length` 判断、`slice` 截断都可能把代理对劈成两半产生乱码。

## 类数组对象

有 `length` 和索引属性、但没有数组方法的对象：`arguments`、NodeList、HTMLCollection、字符串。

```js
function foo() {
  arguments.length;   // 3
  // arguments.push(4);  // TypeError：没有数组方法
}
foo(1, 2, 3);

const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
Array.from(arrayLike);                  // 推荐：['a', 'b', 'c']
[...arrayLike];                         // 可迭代才行
Array.prototype.slice.call(arrayLike);  // ES5 兼容写法
```

## 包装类型与自动装箱

原始值本无属性方法，访问 `str.length` 时引擎临时装箱：创建包装对象 → 调用 → 立即销毁。

```js
const str = 'hello';
typeof str;              // 'string'
str.length;              // 5：背后是 new String('hello').length

str.foo = 1;
str.foo;                 // undefined：临时对象已销毁，属性挂了也留不住

const bool = new Boolean(false);
if (bool) {}             // 陷阱：包装对象永远真值，false 也进分支

// 正确：不用 new 做类型转换
String(123);   // '123'
Number('123'); // 123
Boolean(0);    // false
```

陷阱辨析：

- `'hello' instanceof String` 为 false，`typeof new String('hello')` 为 'object'——原始值与包装对象是两种东西。
- `new Boolean(false)` 是对象、恒为真值，禁止用 `new` 包装类型做条件判断。

## 尾调用与尾递归

尾调用 = 函数的最后一步是 `return 另一个函数的调用结果`，之后无任何操作。

```js
function f(x) {
  return g(x);       // 是尾调用
}
function f(x) {
  return g(x) + 1;   // 不是：调用后还有加法，外层栈帧必须保留
}
```

原理：外层上下文不再被需要，严格模式下引擎可复用栈帧，调用栈保持 O(1)，深递归不爆栈。

```js
'use strict';
// 尾递归：用参数携带中间结果，调用栈始终一层
function factorial(n, total = 1) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

// 普通递归：return n * factorial(n - 1) 需保留 n，栈深 O(n)，大 n 会溢出
```

限制：只在严格模式生效；不能引用外层函数变量；主流引擎中仅 JavaScriptCore 完整实现，V8 支持但默认关闭——面试讲清原理即可，生产别依赖。
