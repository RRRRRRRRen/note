# Http基础

## 请求方法

### 常见 HTTP 请求方法

| 方法 | 用途 |
| --- | --- |
| `GET` | 获取数据 |
| `POST` | 发送数据，一般造成服务器资源新增 |
| `PUT` | 全量修改目标资源 |
| `PATCH` | 部分修改目标资源 |
| `DELETE` | 删除指定资源 |
| `HEAD` | 获取报文首部，不返回报文主体（如先获取文件大小再决定是否下载） |
| `OPTIONS` | 浏览器自动执行，询问支持的请求方法，用于跨域预检 |

### GET 和 POST 的区别

| 特性 | GET | POST |
| --- | --- | --- |
| 应用场景 | 幂等请求 | 非幂等请求 |
| 是否缓存 | 缓存 | 一般不缓存 |
| 传参方式 | 查询字符串 | 请求体 |
| 安全性 | 相对不安全 | 相对安全 |
| 请求长度 | 浏览器对 URL 长度有限制 | 相对限制较少 |
| 参数类型 | 只允许 ASCII 字符 | 没有限制 |

### 幂等性

幂等性（Idempotence）是指一个操作可以重复执行多次，结果与第一次执行相同。

- `GET`、`PUT`、`DELETE`：幂等
- `POST`：非幂等，多次执行可能创建多个资源

### POST 和 PUT 的区别

| 特性 | POST | PUT |
| --- | --- | --- |
| 用途 | 创建资源 | 更新（或创建）资源 |
| 幂等性 | 非幂等 | 幂等 |
| 资源位置 | 由服务器决定 | 由客户端在 URL 中指定 |

### 为什么 POST 会发出两次请求

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

---

## 请求头与响应头

### 常见请求头

| 请求头 | 说明 |
| --- | --- |
| `Authorization` | 提供身份凭据，用于访问受保护资源 |
| `Accept` | 客户端能理解的内容类型（MIME） |
| `Accept-Encoding` | 客户端支持的内容编码（压缩算法） |
| `Accept-Language` | 客户端偏好的语言和区域 |
| `Connection` | 控制连接是否持久（`keep-alive` / `close`） |
| `Keep-Alive` | 设置持久连接的超时时长和最大请求数 |
| `Cookie` | 携带服务器之前设置的 Cookie |
| `Host` | 请求目标服务器的主机名和端口 |
| `Referer` | 当前请求的来源页面地址 |
| `If-Match` | 条件请求，ETag 匹配时才处理 |
| `If-Modified-Since` | 条件请求，资源在指定时间后修改才返回 |
| `If-None-Match` | 条件请求，ETag 不匹配时才返回资源 |
| `User-Agent` | 客户端应用程序、操作系统等信息 |
| `Vary` | 指定影响响应内容的请求头字段 |

### 常见响应头

| 响应头 | 说明 |
| --- | --- |
| `Allow` | 资源支持的请求方法列表 |
| `Cache-Control` | 缓存策略指令 |
| `Content-Encoding` | 响应体的编码方式（如 gzip） |
| `Content-Type` | 响应体的媒体类型 |
| `Date` | 消息创建的日期时间 |
| `Expires` | 响应过期的日期时间 |
| `ETag` | 资源的特定版本标识符 |
| `Set-Cookie` | 服务器向客户端设置 Cookie |

### 常见 Content-Type

| 值 | 说明 |
| --- | --- |
| `application/x-www-form-urlencoded` | 浏览器原生 form 表单，`key=val&key2=val2` 格式 |
| `multipart/form-data` | 表单文件上传 |
| `application/json` | JSON 字符串 |
| `text/xml` | XML 数据 |

---

## HTTP 版本差异

### HTTP/1.0 vs HTTP/1.1

| 特性 | HTTP/1.0 | HTTP/1.1 |
| --- | --- | --- |
| 连接模式 | 短连接，每次请求重新建立 | 默认长连接 |
| 断点续传 | 不支持 | 支持（`Range` 头，返回 206） |
| 缓存控制 | `If-Modified-Since`、`Expires` | 增加 `If-None-Match`、`ETag` 等 |
| Host 字段 | 不支持 | 必须包含 `Host` 头 |
| 请求方法 | `GET`、`POST` | 增加 `PUT`、`HEAD`、`OPTIONS` 等 |

### HTTP/1.1 vs HTTP/2.0

| 特性 | HTTP/1.1 | HTTP/2.0 |
| --- | --- | --- |
| 协议格式 | 文本 | 二进制帧 |
| 多路复用 | 不支持（需排队） | 支持，可乱序并发请求 |
| 数据流 | 无 | 每个数据流有唯一编号 |
| 头信息压缩 | 不支持 | 支持（HPACK） |
| 服务器推送 | 不支持 | 支持 |

### 队头阻塞

HTTP 规定报文"一发一收"，形成串行队列。队首请求太慢会阻塞后续所有请求。

解决方案：

- **并发连接**：对同一域名允许多个长连接
- **域名分片**：将资源分散到多个子域名，增加并发连接数

---

## 缓存机制

### 强缓存与协商缓存

| 类型 | 说明 | 相关头部 |
| --- | --- | --- |
| 强缓存 | 不请求服务器，直接读取本地缓存，返回 200 | `Expires`、`Cache-Control` |
| 协商缓存 | 请求服务器验证，命中则返回 304 | `ETag`/`If-None-Match`、`Last-Modified`/`If-Modified-Since` |

### 304 的过程

1. 浏览器命中强缓存（`Expires` / `Cache-Control: max-age`），直接使用，返回 200（from cache）
2. 强缓存失效，进入协商缓存，携带 `If-None-Match` 验证 `ETag`
3. 若 `ETag` 未变化，再验证 `If-Modified-Since` / `Last-Modified`
4. 服务器判断资源未修改，返回 304，浏览器使用本地缓存

### HTTP keep-alive

- HTTP/1.0 默认关闭，需手动开启；HTTP/1.1 默认开启
- 作用：复用 TCP 连接，避免重复握手，减少延迟
- 使用：请求头添加 `Connection: keep-alive`
- 缺点：连接占用资源，需服务器设置超时时间和最大请求数

```http
HTTP/1.1 200 OK
Connection: Keep-Alive
Keep-Alive: timeout=5, max=1000
```

---

## 状态码

### 状态码分类

| 类别 | 描述 |
| --- | --- |
| 1xx | 请求正在处理 |
| 2xx | 请求成功 |
| 3xx | 重定向 |
| 4xx | 客户端错误 |
| 5xx | 服务器错误 |

### 常见状态码

**2xx**

| 状态码 | 说明 |
| --- | --- |
| 200 OK | 请求成功 |
| 201 Created | 资源已创建 |
| 202 Accepted | 请求已接受，尚未处理（异步场景） |
| 204 No Content | 请求成功，无响应体 |
| 206 Partial Content | 部分内容，用于分段下载 |

**3xx**

| 状态码 | 说明 |
| --- | --- |
| 301 Moved Permanently | 永久重定向 |
| 302 Found | 临时重定向（HTTP/1.0） |
| 303 See Other | 重定向，强制使用 GET |
| 304 Not Modified | 协商缓存命中 |
| 307 Temporary Redirect | 临时重定向，保持原请求方法 |

302 是 HTTP/1.0 状态码，HTTP/1.1 细化为 303（POST 改 GET）和 307（保持原方法）。

**4xx**

| 状态码 | 说明 |
| --- | --- |
| 400 Bad Request | 请求语法错误 |
| 401 Unauthorized | 未授权 |
| 403 Forbidden | 禁止访问 |
| 404 Not Found | 资源不存在 |
| 408 Request Timeout | 请求超时 |
| 409 Conflict | 请求冲突 |

**5xx**

| 状态码 | 说明 |
| --- | --- |
| 500 Internal Server Error | 服务器内部错误 |
| 501 Not Implemented | 不支持该功能 |
| 503 Service Unavailable | 服务不可用（超负载或维护） |

---

## 其他

### 输入 URL 到页面加载的过程

1. **解析 URL**：检查合法性，非法则转发搜索引擎，合法则转义特殊字符
2. **缓存判断**：检查本地缓存是否存在且有效
3. **DNS 解析**：浏览器缓存 → 本地 DNS → 根域名服务器 → 顶级域名服务器 → 权威域名服务器
4. **TCP 三次握手**：建立连接
5. **发送 HTTP 请求**：服务器处理并返回响应
6. **页面渲染**：并行构建 DOM 树和 CSSOM 树 → 渲染树 → 布局 → 绘制
7. **TCP 四次挥手**：断开连接

### HTTP 报文结构

请求报文：

- 请求行：方法、URL、协议版本（如 `GET /index.html HTTP/1.1`）
- 请求头：键值对（如 `Accept: application/json`）
- 空行
- 请求体（POST 等携带数据）

响应报文：

- 响应行：协议版本、状态码、原因短语（如 `HTTP/1.1 200 OK`）
- 响应头
- 空行
- 响应体

### URL 组成

```text
协议://域名:端口/虚拟目录/文件名?参数#锚点
www.example.com:8080/news/index?id=123&name=abc#section
```

- 端口省略时使用默认端口（HTTP: 80，HTTPS: 443）

### DNS 协议

DNS（Domain Name System）将域名解析为 IP 地址。

查询过程：

1. 浏览器缓存
2. 本地 DNS 服务器缓存
3. 根域名服务器
4. 顶级域名服务器
5. 权威域名服务器
6. 结果返回并缓存

### Token 与 JWT

token 组成：`uid + time + sign + payload`

```text
uid:     用户唯一身份标识
time:    当前时间戳
sign:    签名，hash/encrypt 压缩成定长十六进制字符串，防止恶意拼接
payload: 常用固定参数（可选）
```

存放位置：客户端存于 `LocalStorage`、`Cookie` 或 `SessionStorage`；服务端存于数据库。

JWT（JSON Web Token）认证流程：

1. 用户登录，服务器返回 Token
2. 客户端保存 Token
3. 后续请求在 `headers` 中携带 Token
4. 服务器校验 Token，成功则返回数据

Token vs Cookie+Session：

- Cookie 由浏览器自动携带，易被 CSRF 利用
- Token 需手动加入请求头，浏览器不自动携带，可抵御 CSRF

### Token 无感刷新

当 Token 过期时，不跳转登录页，而是自动刷新 Token，用户无感知。

实现方式：

- 后端返回过期时间，前端主动刷新（缺点：本地时间可被篡改）
- 定时器自动刷新（缺点：浪费资源）
- 在响应拦截器中拦截 401，调用刷新接口获取新 Token 后重试原请求（推荐）
