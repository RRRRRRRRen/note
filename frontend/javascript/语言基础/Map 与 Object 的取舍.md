# Map 与 Object 的取舍

*类型：knowledge ｜ 难度：入门 ｜ 标签：Map、Object、数据结构*

**Object 适合表示「结构体」（固定的字符串键、JSON 序列化），Map 适合作为「字典」使用（任意类型键、频繁增删、保持插入顺序）——两者不是替代关系，而是按场景取舍。**

## 核心区别

| 特性 | Map | Object |
|------|-----|--------|
| 键的类型 | **任意类型** | 只能是 `string` 或 `symbol` |
| 键的顺序 | **按插入顺序** | 无序（ES2015+ 有序） |
| 意外的键 | 只有显式插入的键 | 继承原型链上的键 |
| 获取大小 | `map.size` | 需手动计算 |
| 迭代 | 直接可迭代 | 需 `Object.keys()` 等 |
| 性能 | **频繁增删性能更好** | 适合静态数据 |

## 使用示例

```js
// Map - 键可以是任意类型
const map = new Map();
map.set('name', 'Alice');
map.set(123, 'number key');
map.set({}, 'object key');
map.set(true, 'boolean key');

console.log(map.size);        // 4
console.log(map.get('name')); // 'Alice'
map.delete(123);
map.has('name');              // true

// 迭代
for (const [key, value] of map) {
  console.log(key, value);
}

// Object - 键只能是字符串或 Symbol
const obj = {
  name: 'Alice',
  123: 'converted to string' // 键会被转为字符串 '123'
};
console.log(obj['123']);      // 'converted to string'
```

## 使用建议

- **使用 Map**：需要频繁增删、键不是字符串、需要保持插入顺序
- **使用 Object**：简单的键值对、JSON 序列化、作为记录/结构体
