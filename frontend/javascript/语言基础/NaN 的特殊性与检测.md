# NaN 的特殊性与检测

*类型：knowledge ｜ 难度：入门 ｜ 标签：NaN、类型转换、Number*

**NaN 是 number 类型中表示「运算失败」的警戒值，也是 JS 中唯一不等于自身的值——因此 `x === NaN` 永远为 false，判断 NaN 必须使用 `Number.isNaN()` 或 `Object.is()`。**

## NaN 的特殊性

### 基本概念

```js
typeof NaN === "number"; // true - NaN 属于 number 类型
```

**NaN**（Not-a-Number）是一个警戒值，表示数学运算失败的结果。

### 重要特性：非自反性

```js
NaN === NaN;  // false - NaN 是唯一不等于自身的值
NaN !== NaN;  // true
```

### 如何判断 NaN

```js
// 错误方式：NaN 不等于任何值包括自身
value === NaN;  // 永远返回 false

// 正确方式
Number.isNaN(value);
Object.is(value, NaN);
```

## isNaN 与 Number.isNaN 的区别

### 核心区别

| 方法 | 行为 | 准确性 |
|------|------|--------|
| `isNaN()` | 会先转换为数字再判断 | 不准确 |
| `Number.isNaN()` | 只判断是否为 NaN | 准确 |

### 对比示例

```js
// isNaN - 会进行类型转换
isNaN(NaN);         // true
isNaN("A String");  // true  - 字符串转数字失败
isNaN(undefined);   // true  - undefined 转为 NaN
isNaN({});          // true  - 对象转数字失败

// Number.isNaN - 不进行类型转换，只有真正的 NaN 才返回 true
Number.isNaN(NaN);        // true
Number.isNaN("A String"); // false - 不是 NaN
Number.isNaN(undefined);  // false - 不是 NaN
Number.isNaN({});         // false - 不是 NaN
```

### 推荐

**优先使用 `Number.isNaN()`**，它更准确且不会产生意外的类型转换。
