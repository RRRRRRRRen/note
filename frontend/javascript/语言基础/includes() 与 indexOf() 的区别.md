# includes() 与 indexOf() 的区别

*类型：question ｜ 难度：入门 ｜ 标签：数组方法、includes、indexOf*

**两者都用于查找元素，但 `indexOf()` 内部用严格相等比较、无法检测 NaN，`includes()` 使用 SameValueZero 算法、可以检测 NaN——判断存在性优先用 `includes()`，需要索引才用 `indexOf()`。**

## 核心区别

```js
const arr = [1, 2, 3, NaN];

// indexOf - 无法检测 NaN
arr.indexOf(NaN);     // -1（漏检）

// includes - 可以检测 NaN
arr.includes(NaN);    // true
```

## 详细对比

| 特性 | `indexOf()` | `includes()` |
|------|------------|-------------|
| 返回值 | 索引或 -1 | `true` / `false` |
| NaN 检测 | 无法检测 | 可以检测 |
| 语义化 | 不够直观 | 更清晰 |
| 兼容性 | ES5 | ES7 (ES2016) |

## 使用示例

```js
const arr = [1, 2, 3, NaN, undefined];

// indexOf
arr.indexOf(2);         // 1
arr.indexOf(5);         // -1
arr.indexOf(NaN);       // -1（NaN 用 === 比较永远不等）
arr.indexOf(undefined); // 4

// includes
arr.includes(2);        // true
arr.includes(5);        // false
arr.includes(NaN);      // true
arr.includes(undefined);// true

// 语义化对比
// 不够直观：需要额外判断 -1
if (arr.indexOf(2) !== -1) {
  console.log('找到了');
}

// 更清晰：直接返回布尔值
if (arr.includes(2)) {
  console.log('找到了');
}
```

## 使用建议

- **只需判断存在性**：使用 `includes()`
- **需要获取索引**：使用 `indexOf()` 或 `findIndex()`
