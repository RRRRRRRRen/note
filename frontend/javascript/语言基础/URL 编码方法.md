# URL 编码方法

*类型：knowledge ｜ 难度：入门 ｜ 标签：URL、编码、encodeURI*

**编码整个 URL 用 `encodeURI()`（保留 URL 结构字符），编码 URL 参数用 `encodeURIComponent()`（编码所有特殊字符）——用反了会破坏 URL 结构，`escape()` 已废弃。**

## 三种方法对比

| 方法 | 用途 | 编码范围 |
|------|------|---------|
| `escape()` | 已废弃 | 不要使用 |
| `encodeURI()` | 编码完整 URL | 保留 URL 结构字符 |
| `encodeURIComponent()` | 编码 URL 参数 | 编码所有特殊字符 |

## 使用示例

```js
const url = 'http://example.com/search?q=hello world&lang=中文';

// encodeURI - 保持 URL 可用
encodeURI(url);
// 'http://example.com/search?q=hello%20world&lang=%E4%B8%AD%E6%96%87'
// 保留了 :/?#[]@!$&'()*+,;=

// encodeURIComponent - 完全编码，用于参数
const param = 'hello world&lang=中文';
`http://example.com/search?q=${encodeURIComponent(param)}`;
// 'http://example.com/search?q=hello%20world%26lang%3D%E4%B8%AD%E6%96%87'
// & 和 = 也被编码了
```

## 使用建议

```js
// 正确：编码整个 URL
const fullUrl = 'http://example.com/path with spaces';
encodeURI(fullUrl);

// 正确：编码 URL 参数
const baseUrl = 'http://example.com/search';
const query = 'hello&world';
`${baseUrl}?q=${encodeURIComponent(query)}`;

// 错误：对整个 URL 使用 encodeURIComponent
encodeURIComponent('http://example.com');  // 'http%3A%2F%2Fexample.com'
// URL 被破坏，不再是合法地址
```
