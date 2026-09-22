# for...in 与 for...of 的区别

*类型：question ｜ 难度：入门 ｜ 标签：遍历、迭代器、for...of*

**`for...in` 遍历对象的可枚举键（会连原型链一起遍历、不保证顺序），`for...of` 遍历可迭代对象的值（按迭代器顺序、不碰原型链）——遍历数组用 `for...of`，遍历对象用 `Object.keys()` 或 `for...in` 配合 `hasOwnProperty()`。**

## 核心区别

| 特性 | `for...in` | `for...of` |
|------|-----------|-----------|
| 遍历内容 | 对象的**键**（key） | 可迭代对象的**值**（value） |
| 适用对象 | 所有对象 | 可迭代对象（Array、String、Map、Set 等） |
| 原型链 | 会遍历原型链上的可枚举属性 | 不会 |
| 顺序 | 不保证顺序 | 按迭代器顺序 |

## 使用示例

```js
const arr = ['a', 'b', 'c'];
arr.custom = 'custom property';

// for...in - 遍历键（索引），连自定义属性也一并遍历
for (const key in arr) {
  console.log(key);  // '0', '1', '2', 'custom'
}

// for...of - 遍历值，只按迭代器顺序
for (const value of arr) {
  console.log(value);  // 'a', 'b', 'c'（不包括 custom）
}

// 对象遍历
const obj = { a: 1, b: 2, c: 3 };

// for...in - 遍历对象键
for (const key in obj) {
  console.log(key, obj[key]);  // 'a' 1, 'b' 2, 'c' 3
}

// for...of - 普通对象不可迭代
// for (const value of obj) {}  // TypeError
```

## for...in 的陷阱

`for...in` 会遍历原型链上的可枚举属性，给数组或对象的原型添加属性时会被一并遍历出来：

```js
Array.prototype.custom = 'inherited';
const arr = [1, 2, 3];

for (const key in arr) {
  console.log(key);  // '0', '1', '2', 'custom' - 包括原型链属性！
}

// 解决方案：使用 hasOwnProperty 过滤
for (const key in arr) {
  if (arr.hasOwnProperty(key)) {
    console.log(key);  // '0', '1', '2'
  }
}

// 更好的方案：使用 for...of
for (const value of arr) {
  console.log(value);  // 1, 2, 3
}
```

## 使用建议

- **遍历数组**：使用 `for...of` 或 `forEach()`
- **遍历对象**：使用 `for...in` + `hasOwnProperty()` 或 `Object.keys()`
- **需要索引**：使用 `forEach()` 或传统 `for` 循环

```js
// 推荐：遍历数组
arr.forEach((value, index) => {
  console.log(index, value);
});

// 推荐：遍历对象
Object.keys(obj).forEach(key => {
  console.log(key, obj[key]);
});

// 或使用 Object.entries() 同时拿到键和值
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value);
}
```
