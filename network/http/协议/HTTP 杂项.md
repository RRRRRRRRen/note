# HTTP 杂项

*类型：knowledge ｜ 难度：入门 ｜ 标签：HTTP、DNS、JWT、Token、渲染流程*

**杂项收拢五块高频常识：输入 URL 到页面渲染是缓存 → DNS → TCP 握手 → HTTP 请求 → 渲染 → 挥手的完整链路；HTTP 报文由「行 + 头 + 空行 + 体」四段构成；URL 各段有默认端口（HTTP 80 / HTTPS 443）；DNS 按浏览器缓存 → 本地 DNS → 根 → 顶级 → 权威的顺序递归解析；Token/JWT 认证靠请求头手动携带而非浏览器自动携带 Cookie，因此天然抵御 CSRF，Token 过期时用响应拦截器拦截 401 自动刷新。**

## 输入 URL 到页面加载的过程

1. **解析 URL**：检查合法性，非法则转发搜索引擎，合法则转义特殊字符
2. **缓存判断**：检查本地缓存是否存在且有效
3. **DNS 解析**：浏览器缓存 → 本地 DNS → 根域名服务器 → 顶级域名服务器 → 权威域名服务器
4. **TCP 三次握手**：建立连接
5. **发送 HTTP 请求**：服务器处理并返回响应
6. **页面渲染**：并行构建 DOM 树和 CSSOM 树 → 渲染树 → 布局 → 绘制
7. **TCP 四次挥手**：断开连接

## HTTP 报文结构

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

```text
GET /index.html HTTP/1.1        ← 请求行
Host: example.com               ← 请求头
Accept: text/html
                                ← 空行（头与体的分界）
（请求体，GET 通常为空）
```

## URL 组成

```text
协议://域名:端口/虚拟目录/文件名?参数#锚点
www.example.com:8080/news/index?id=123&name=abc#section
```

- 端口省略时使用默认端口（HTTP: 80，HTTPS: 443）

## DNS 协议

DNS（Domain Name System）将域名解析为 IP 地址。

查询过程：

1. 浏览器缓存
2. 本地 DNS 服务器缓存
3. 根域名服务器
4. 顶级域名服务器
5. 权威域名服务器
6. 结果返回并缓存

## Token 与 JWT

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

## Token 无感刷新

当 Token 过期时，不跳转登录页，而是自动刷新 Token，用户无感知。

实现方式：

- 后端返回过期时间，前端主动刷新（缺点：本地时间可被篡改）
- 定时器自动刷新（缺点：浪费资源）
- 在响应拦截器中拦截 401，调用刷新接口获取新 Token 后重试原请求（推荐）
