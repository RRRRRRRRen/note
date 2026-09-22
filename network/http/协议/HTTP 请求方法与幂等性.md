# HTTP 请求方法与幂等性

*类型：knowledge ｜ 难度：入门 ｜ 标签：HTTP、请求方法、幂等性、CORS*

**HTTP 方法各自绑定语义：`GET` 取数、`POST` 新增、`PUT` 全量替换、`PATCH` 部分更新、`DELETE` 删除。幂等性（重复执行多次与执行一次结果相同）是方法设计的核心属性——`GET`、`PUT`、`DELETE` 幂等，`POST` 非幂等，这直接决定缓存与重试策略。跨域场景下「POST 发出两次请求」是浏览器先发 `OPTIONS` 预检的 CORS 机制，不是 bug。**

## 常见 HTTP 请求方法

| 方法 | 用途 |
| --- | --- |
| `GET` | 获取数据 |
| `POST` | 发送数据，一般造成服务器资源新增 |
| `PUT` | 全量修改目标资源 |
| `PATCH` | 部分修改目标资源 |
| `DELETE` | 删除指定资源 |
| `HEAD` | 获取报文首部，不返回报文主体（如先获取文件大小再决定是否下载） |
| `OPTIONS` | 浏览器自动执行，询问支持的请求方法，用于跨域预检 |

## GET 和 POST 的区别

| 特性 | GET | POST |
| --- | --- | --- |
| 应用场景 | 幂等请求 | 非幂等请求 |
| 是否缓存 | 缓存 | 一般不缓存 |
| 传参方式 | 查询字符串 | 请求体 |
| 安全性 | 相对不安全 | 相对安全 |
| 请求长度 | 浏览器对 URL 长度有限制 | 相对限制较少 |
| 参数类型 | 只允许 ASCII 字符 | 没有限制 |

## 幂等性

幂等性（Idempotence）是指一个操作可以重复执行多次，结果与第一次执行相同。

- `GET`、`PUT`、`DELETE`：幂等
- `POST`：非幂等，多次执行可能创建多个资源

## POST 和 PUT 的区别

| 特性 | POST | PUT |
| --- | --- | --- |
| 用途 | 创建资源 | 更新（或创建）资源 |
| 幂等性 | 非幂等 | 幂等 |
| 资源位置 | 由服务器决定 | 由客户端在 URL 中指定 |

## 为什么 POST 会发出两次请求

跨域场景下，浏览器会先发送 `OPTIONS` 预检请求（preflight），确认服务器允许后再发送实际请求。

预检请求携带的头部：

```http
OPTIONS /api/resource HTTP/1.1
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-Custom-Header
Origin: http://another-domain.com
```

服务器响应：

```http
HTTP/1.1 200 OK
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: X-Custom-Header
Access-Control-Allow-Origin: http://another-domain.com
```

减少预检请求的方法：

- 避免使用自定义请求头
- 使用简单方法（`GET`、`POST`、`HEAD`）
- 服务器配置 `Access-Control-Max-Age` 缓存预检响应

```http
Access-Control-Max-Age: 86400
```
