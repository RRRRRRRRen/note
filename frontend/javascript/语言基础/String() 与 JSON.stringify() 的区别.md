# String() 与 JSON.stringify() 的区别

*类型：question ｜ 难度：入门 ｜ 标签：类型转换、JSON、序列化*

**`String()` 是类型转换，目标是「给人看的字符串」；`JSON.stringify()` 是 JSON 序列化，目标是「机器可解析的数据格式」——两者对字符串、对象、undefined 等值的处理结果截然不同。**

## 核心区别

| 类型 | `String()` | `JSON.stringify()` |
|------|-----------|-------------------|
| 字符串 | `abc` | `"abc"`（带引号） |
| 对象 | `[object Object]` | `{"key":"value"}` |
| 数组 | `1,2,3` | `[1,2,3]` |
| 用途 | 类型转换 | JSON 序列化 |

## 对比示例

```js
// 1. 字符串
String('abc');           // 'abc'
JSON.stringify('abc');   // '"abc"' - 带引号的 JSON 字符串

// 2. 对象
String({ key: 'value' });           // '[object Object]'
JSON.stringify({ key: 'value' });   // '{"key":"value"}'

// 3. 数组
String([1, 2, 3]);         // '1,2,3'
JSON.stringify([1, 2, 3]); // '[1,2,3]'

// 4. 自定义 toString
const obj = {
  title: 'devpoint',
  toString() {
    return 'custom';
  }
};
String(obj);             // 'custom' - 调用 toString()
JSON.stringify(obj);     // '{"title":"devpoint"}' - 忽略 toString()

// 5. 特殊值
String(undefined);         // 'undefined'
JSON.stringify(undefined); // undefined (不是字符串)

String(null);            // 'null'
JSON.stringify(null);    // 'null'
```

## 使用场景

- **String()**：类型转换、显示给用户
- **JSON.stringify()**：数据传输、存储、深拷贝（有限制）
