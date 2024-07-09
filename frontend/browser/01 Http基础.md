# 一、HTTP

## 1.GET 和 POST 请求的区别

### 基本区别

| 请求         | GET                     | POST                           |
| ------------ | ----------------------- | ------------------------------ |
| **应用场景** | 幂等请求[1]             | 非幂等请求                     |
| **是否缓存** | 缓存                    | 一般不缓存                     |
| **传参方式** | 查询字符串              | 请求体                         |
| **安全性**   | 相对不安全              | 相对安全                       |
| **请求长度** | 浏览器对 url 长度有限制 | 可借助请求体传参，相对限制较少 |
| **参数类型** | 只允许 ASCII 字符       | 没有限制                       |

### 什么是幂等性

在计算机科学中，**幂等性**（Idempotence）是指一个操作可以重复执行多次，而产生的结果与第一次执行的结果相同。在 HTTP 方法中，幂等性有特定的含义：

- **GET**：GET 请求是幂等的，无论执行多少次，结果都是相同的。例如，重复访问一个网页，无论访问多少次，网页的内容不会因为访问次数的增加而变化。
- **PUT**：PUT 请求也是幂等的。无论执行多少次，结果都是相同的，因为它用于更新资源。例如，重复提交一个 PUT 请求来更新某个资源，最终结果是相同的资源状态。

- **DELETE**：DELETE 请求也是幂等的。无论执行多少次，结果都是相同的资源被删除。如果资源已经被删除，再执行 DELETE 请求不会产生不同的结果。

- **POST**：POST 请求通常不是幂等的，因为它会创建资源或导致服务器状态的变化。例如，重复提交一个表单可能会导致创建多个相同的资源记录。

幂等性的重要性在于它能保证系统的可靠性和可恢复性。比如在网络不稳定的情况下，如果客户端没有收到服务器的响应，客户端可以安全地重试幂等的请求而不会产生副作用。

## 2.POST 和 PUT 请求的区别

### 基本区别

POST 和 PUT 都是用于向服务器发送数据的 HTTP 请求方法，但它们有不同的用途和行为。主要区别如下：

1. **用途**：

   - **POST**：通常用于创建资源。每次发送相同的 POST 请求可能会在服务器上创建多个资源。例如，提交一份表单来创建新用户，每次提交都会创建一个新用户。
   - **PUT**：通常用于更新资源。发送相同的 PUT 请求多次，结果是相同的，即该资源被更新为指定的状态。PUT 请求可以创建资源，如果资源在服务器上不存在的话。

2. **幂等性**：

   - **POST**：非幂等的。多次执行相同的 POST 请求可能会导致多个资源被创建。
   - **PUT**：幂等的。多次执行相同的 PUT 请求不会改变结果，资源的状态会保持一致。

3. **请求的意图**：

   - **POST**：表示请求处理可能会导致资源的创建或其他的副作用。它强调动作或过程。
   - **PUT**：表示请求会创建或替换指定的资源。它强调资源的状态。

4. **请求的结构**：

   - **POST**：请求体中包含要发送的数据，通常与目标资源的 URL 无关。服务器决定资源的具体位置和标识符。
   - **PUT**：请求体中包含要发送的数据，并且请求的 URL 通常指定了资源的具体位置或标识符。客户端决定资源的位置和标识符。

5. **资源的创建和更新**：
   - **POST**：用于向服务器提交数据以创建资源。每次请求可能会产生一个新的资源。
   - **PUT**：用于向服务器发送数据以创建或更新资源。资源存在时进行更新，不存在时进行创建。

### 举例说明

- **POST** 请求示例：

  ```
  POST /users HTTP/1.1
  Host: example.com
  Content-Type: application/json

  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

  每次执行这个请求可能会在服务器上创建一个新用户。

- **PUT** 请求示例：

  ```
  PUT /users/123 HTTP/1.1
  Host: example.com
  Content-Type: application/json

  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

  这个请求会更新 ID 为 123 的用户信息。如果该用户不存在，则可能会创建一个新的用户，并赋予其 ID 为 123。

总结来说，POST 通常用于创建资源，而 PUT 通常用于更新资源。POST 非幂等，而 PUT 幂等。

## 3.为什么 POST 会发出两次请求

### 原因

在跨域资源共享 (CORS) 的情况下，浏览器为了安全性，会在发送实际的跨域请求之前发送一个预检请求 (preflight request)。这种预检请求使用 HTTP 方法 `OPTIONS`，目的是检查目标服务器是否允许这种跨域请求。具体过程如下：

1. **预检请求**：
   浏览器发送一个 `OPTIONS` 请求到目标服务器，询问服务器是否允许当前的跨域请求。预检请求包含以下头部：

   - `Access-Control-Request-Method`：实际请求使用的方法（例如 `POST`）。
   - `Access-Control-Request-Headers`：实际请求中使用的自定义头部（如果有）。
   - `Origin`：发起请求的源（域名）。

   预检请求示例：

   ```
   OPTIONS /api/resource HTTP/1.1
   Host: example.com
   Access-Control-Request-Method: POST
   Access-Control-Request-Headers: X-Custom-Header
   Origin: http://another-domain.com
   ```

2. **服务器响应预检请求**：
   服务器响应预检请求，指示是否允许实际请求。如果允许，响应头部会包含：

   - `Access-Control-Allow-Methods`：允许的方法（例如 `POST`）。
   - `Access-Control-Allow-Headers`：允许的自定义头部（例如 `X-Custom-Header`）。
   - `Access-Control-Allow-Origin`：允许的源（例如 `http://another-domain.com`）。

   预检响应示例：

   ```
   HTTP/1.1 200 OK
   Access-Control-Allow-Methods: POST
   Access-Control-Allow-Headers: X-Custom-Header
   Access-Control-Allow-Origin: http://another-domain.com
   ```

3. **实际请求**：
   如果预检请求成功，浏览器会发送实际的 `POST` 请求到服务器。

   实际请求示例：

   ```
   POST /api/resource HTTP/1.1
   Host: example.com
   Content-Type: application/json
   X-Custom-Header: custom-value
   Origin: http://another-domain.com

   { "data": "value" }
   ```

4. **服务器响应实际请求**：
   服务器处理实际请求，并返回响应。

   实际响应示例：

   ```
   HTTP/1.1 200 OK
   Content-Type: application/json

   { "result": "success" }
   ```

### 如何避免或优化预检请求

虽然预检请求是由浏览器自动处理的，但可以通过以下方法减少或优化预检请求的频率：

1. **简化请求头**：
   避免使用复杂的或自定义的请求头。仅使用浏览器默认允许的头部，如 `Content-Type` 为 `application/x-www-form-urlencoded`、`multipart/form-data`、或 `text/plain`。

2. **使用简单方法**：
   避免使用复杂的 HTTP 方法。尽量使用 `GET`、`POST`、`HEAD` 等简单方法。

3. **服务器端配置缓存预检响应**：
   在服务器端配置 `Access-Control-Max-Age` 头部，指示浏览器缓存预检响应的时间，从而减少频繁的预检请求。

   配置示例：

   ```
   Access-Control-Max-Age: 86400  // 预检响应缓存24小时
   ```

通过以上方法，可以减少预检请求的次数，提高跨域请求的性能。

## 4.常见的 HTTP 请求头和响应头

### HTTP Request Header

#### Authorization

**简介**

HTTP Authorization 请求标头用于提供服务器验证用户代理身份的凭据，允许访问受保护的资源。

Authorization 标头通常在用户代理首次尝试请求受保护的资源（没有携带凭据）之后发送的，但并不总是发送。服务器响应一条 401 Unauthorized 信息，其中包含至少一个 WWW-Authenticate 标头。该标头表示哪些身份验证的方案可用于访问资源（以及客户端使用它们时需要的额外的信息）。用户代理应该从这些提供的身份验证方案中选择它支持的最安全的身份验证方案，并提示用户提供凭据，然后重新获取资源（包含 Authorization 标头中编码的凭据）。

**示例**

```http
Authorization: <auth-scheme> <authorization-parameters>
Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l
```

#### Accept

**简介**

Accept 请求 HTTP 标头表示客户端能够理解的内容类型，以 MIME 类型的形式表达。

**示例**

```http
Accept: <MIME_type>/<MIME_subtype>
Accept: <MIME_type>/*
Accept: */*

// 多种类型，采用权重值语法区分：
Accept: text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8
```

#### Accept-Encoding

**简介**

Accept-Encoding 请求 HTTP 标头表示客户端能够理解的内容编码（通常是某种压缩算法）。

**示例**

```http
Accept-Encoding: gzip
Accept-Encoding: compress
Accept-Encoding: deflate
Accept-Encoding: br
Accept-Encoding: zstd
Accept-Encoding: identity
Accept-Encoding: *

// 使用质量价值语法对多个算法进行加权：
Accept-Encoding: deflate, gzip;q=1.0, *;q=0.5
```

#### Accept-Language

**简介**

Accept-Language 请求 HTTP 标头表示客户端所偏好的自然语言和区域设置。

**示例**

```http
Accept-Language: <language>
Accept-Language: *

// 使用质量价值语法对多个类型进行加权：
Accept-Language: zh-CN, zh;q=0.9, en;q=0.8, en-GB;q=0.7, en-US;q=0.6
```

#### Connection

**简介**

Connection 通用标头控制网络连接在当前会话完成后是否仍然保持打开状态。如果发送的值是 keep-alive，则连接是持久的，不会关闭，允许对同一服务器进行后续请求。

在 HTTP/2 和 HTTP/3 中，禁止使用特定于连接的标头字段，如 Connection 和 Keep-Alive。Chrome 和 Firefox 会在 HTTP/2 响应中忽略它们，但 Safari 遵循 HTTP/2 规范要求，不会加载包含这些字段的任何响应。

**示例**

```http
Connection: keep-alive
Connection: close
```

#### Keep-Alive

**简介**

Keep-Alive 是一个通用消息头，允许消息发送者暗示连接的状态，还可以用来设置超时时长和最大请求数。

需要将 The Connection 首部的值设置为 "keep-alive" 这个首部才有意义。同时需要注意的是，在 HTTP/2 协议中， Connection 和 Keep-Alive 是被忽略的；在其中采用其他机制来进行连接管理。

**示例**

```http
HTTP/1.1 200 OK
Connection: Keep-Alive
Keep-Alive: timeout=5, max=1000
```

#### Cookies

**简介**

Cookie 是一个 HTTP 请求标头，其中含有先前由服务器通过 Set-Cookie 标头投放或通过 JavaScript 的 Document.cookie 方法设置，然后存储到客户端的 HTTP cookie 。

这个标头是可选的，而且可能会被忽略，例如在浏览器的隐私设置里面设置为禁用 cookie。

**示例**

```http
Cookie: <cookie-list>
Cookie: name=value
Cookie: name=value; name2=value2; name3=value3
```

#### Host

**简介**

Host 请求头指明了请求将要发送到的服务器主机名和端口号。

如果没有包含端口号，会自动使用被请求服务的默认端口（比如 HTTPS URL 使用 443 端口，HTTP URL 使用 80 端口）。

所有 HTTP/1.1 请求报文中必须包含一个 Host 头字段。对于缺少 Host 头或者含有超过一个 Host 头的 HTTP/1.1 请求，可能会收到 400（Bad Request）状态码。

**示例**

```http
Host: 172.16.1.246:8000
Host: developer.mozilla.org
```

#### Referer

**简介**

Referer 请求头包含了当前请求页面的来源页面的地址，即表示当前页面是通过此来源页面里的链接进入的。服务端一般使用 Referer 请求头识别访问来源，可能会以此进行统计分析、日志记录以及缓存优化等。

**示例**

```http
Referer: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript
```

#### If-Match

**简介**

请求首部 If-Match 的使用表示这是一个条件请求。在请求方法为 GET 和 HEAD 的情况下，服务器仅在请求的资源满足此首部列出的 ETag 值时才会返回资源。而对于 PUT 或其他非安全方法来说，只有在满足条件的情况下才可以将资源上传。

**示例**

```http
If-Match: "bfc13a64729c4290ef5b2c2730249c88ca92d82d"

If-Match: W/"67ab43", "54ed21", "7892dd"

If-Match: *
```

#### If-Modified-Since

**简介**

If-Modified-Since 是一个条件式请求首部，服务器只在所请求的资源在给定的日期时间之后对内容进行过修改的情况下才会将资源返回，状态码为 200 。
如果请求的资源从那时起未经修改，那么返回一个不带有消息主体的 304 响应，而在 Last-Modified 首部中会带有上次修改时间。不同于 If-Unmodified-Since, If-Modified-Since 只可以用在 GET 或 HEAD 请求中。

**示例**

```http
If-Modified-Since: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT
```

#### If-None-Match

**简介**

If-None-Match 是一个条件式请求首部。对于 GETGET 和 HEAD 请求方法来说，当且仅当服务器上没有任何资源的 ETag 属性值与这个首部中列出的相匹配的时候，服务器端才会返回所请求的资源，响应码为 200 。对于其他方法来说，当且仅当最终确认没有已存在的资源的 ETag 属性值与这个首部中所列出的相匹配的时候，才会对请求进行相应的处理。

当与 If-Modified-Since 一同使用的时候，If-None-Match 优先级更高（假如服务器支持的话）。

**示例**

```http
If-None-Match: <etag_value>
If-None-Match: <etag_value>, <etag_value>, …
If-None-Match: *

If-None-Match: "bfc13a64729c4290ef5b2c2730249c88ca92d82d"
If-None-Match: W/"67ab43", "54ed21", "7892dd"
If-None-Match: *
```

#### User-Agent

**简介**

User-Agent 请求标头是一个特征字符串，使得服务器和对等网络能够识别发出请求的用户代理的应用程序、操作系统、供应商或版本信息。

**示例**

```http
User-Agent: Mozilla/5.0 (<system-information>) <platform> (<platform-details>) <extensions>
```

#### Vary

**简介**

Vary HTTP 响应标头描述了除方法和 URL 之外影响响应内容的请求消息。大多数情况下，这用于在使用内容协商时创建缓存键。

给定 URL 的所有响应都应使用相同的 Vary 标头值，包括 304 Not Modified 响应和“默认”响应。

**示例**

```http
Vary: *
Vary: <header-name>, <header-name>, ...
```

### HTTP Responses Header

#### Allow

**简介**

Allow 标头列出了资源支持的方法集。

当服务器响应带有 405 Method Not Allowed 状态码时必须发送此标头，以表示可以使用哪些请求方法。Allow 空标头表示该资源不允许使用任何请求方法，例如，这种情况可能针对某个特定资源会临时出现。

**示例**

```http
Allow: GET, POST, HEAD
```

#### Cache-Control

**简介**

Cache-Control 通用消息头字段，被用于在 http 请求和响应中，通过指定指令来实现缓存机制。缓存指令是单向的，这意味着在请求中设置的指令，不一定被包含在响应中。

**示例**

```http
Cache-control: must-revalidate
Cache-control: no-cache
Cache-control: no-store
Cache-control: no-transform
Cache-control: public
Cache-control: private
Cache-control: proxy-revalidate
Cache-Control: max-age=<seconds>
Cache-control: s-maxage=<seconds>
```

#### Connection

**简介**

同请求头

#### Content-Encoding

**简介**

实体消息首部 Content-Encoding 列出了对当前实体消息（消息荷载）应用的任何编码类型，以及编码的顺序。它让接收者知道需要以何种顺序解码该实体消息才能获得原始荷载格式。Content-Encoding 主要用于在不丢失原媒体类型内容的情况下压缩消息数据。

请注意原始媒体/内容的类型通过 Content-Type 首部给出，而 Content-Encoding 应用于数据的表示，或“编码形式”。如果原始媒体以某种方式编码（例如 zip 文件），则该信息不应该被包含在 Content-Encoding 首部内。

**示例**

```http
Content-Encoding: gzip
Content-Encoding: compress
Content-Encoding: deflate
Content-Encoding: br

// 多个，按应用的编码顺序列出
Content-Encoding: deflate, gzip
```

#### Content-Type

**简介**

Content-Type 表示标头用于指示资源的原始媒体类型（在发送时应用任何内容编码之前）。

在响应中，Content-Type 标头向客户端提供返回内容的实际内容类型。例如，当浏览器执行 MIME 嗅探时，该标头的值可能会被忽略；将 X-Content-Type-Options 标头值设置为 nosniff 可防止这种行为。

**示例**

```http
Content-Type: text/html; charset=utf-8
Content-Type: multipart/form-data; boundary=something
```

#### Date

**简介**

Date 通用 HTTP 标头包含了消息创建时的日期和时间。

在 fetch 规范中，Date 被列为禁止修改的标头.

**示例**

```http
Date: <day-name>, <day> <month> <year> <hour>:<minute>:<second> GMT
Date: Wed, 21 Oct 2015 07:28:00 GMT
```

#### Expires

**简介**

Expires 响应标头包含响应应被视为过期的日期/时间。

无效的日期（比如 0）代表过去的日期，即该资源已经过期。

**示例**

```http
Expires: <http-date>
Expires: Wed, 21 Oct 2015 07:28:00 GMT
```

#### ETag

**简介**

ETag HTTP 响应头是资源的特定版本的标识符。这可以让缓存更高效，并节省带宽，因为如果内容没有改变，Web 服务器不需要发送完整的响应。而如果内容发生了变化，使用 ETag 有助于防止资源的同时更新相互覆盖（“空中碰撞”）。

如果给定 URL 中的资源更改，则一定要生成新的 ETag 值。比较这些 ETag 能快速确定此资源是否变化。

**示例**

```http
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
ETag: W/"0815"
```

#### Set-Cookie

**简介**

Set-Cookie HTTP 响应标头用于将 cookie 由服务器发送到用户代理，以便用户代理在后续的请求中可以将其发送回服务器。要发送多个 cookie，则应在同一响应中发送多个 Set-Cookie 标头。

根据 Fetch 规范，Set-Cookie 是一个禁止修改的响应标头，对应的响应在被暴露给前端代码前，必须滤除这一响应标头，即浏览器会阻止前端 JavaScript 代码访问该标头。

**示例**

```http
Set-Cookie: <cookie-name>=<cookie-value>
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly
Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<number>
Set-Cookie: <cookie-name>=<cookie-value>; Partitioned
Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
Set-Cookie: <cookie-name>=<cookie-value>; Secure

Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Strict
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Lax
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=None; Secure

// 可以同时有多个属性，例如：
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>; Secure; HttpOnly
```

## 5.常见的 Content-Type

- application/x-www-form-urlencoded：浏览器原生 form 表单，这种方式提交的数据放在`body`中，数据按照`key1=val1&key2=val2`的方式进行编码，key 和 val 都会进行`URL转码`
- multipart/form-data：通常用在表单上传文件的时候使用
- application/json：JSON 字符串格式
- text/xml：主要用来提交 XML 数据

## 6.HTTP 状态码 304

产生的原理：

客户端在请求一个文件的时候，发现自己缓存的文件有 `Last Modified`，那么在请求中会包含`If Modified Since`，这个时间是缓存文件的`Last Modified`。如果请求中包含`If Modified Since`，就说明已经有缓存在客户端，服务端只需要判断修改时间就可以返回 304 还是 200 了

产生的不良影响：

- 网站快照停止
- 收录减少
- 权重下降

## 7.常见的 HTTP 请求方法

- GET：获取数据
- POST：发送数据给服务器，一般会造成服务器资源的新增
- PUT：用于全量修改目标资源
- PATCH：用于对资源的部分修改
- DELETE：用于删除指定资源
- HEAD：获取报文首部，但是不返回报文主体内容，例如下载大文件前用于先获取文件大小，再来决定是否下载文件。
- OPTIONS：浏览器自动执行的，用来询问支持的请求方法，判断跨域请求、预检请求、目标是否安全

## 8.`HTTP1.0`和`HTTP1.1 `之间的区别

| 协议     | HTTP1.0                                | HTTP1.1                                                      |
| -------- | -------------------------------------- | ------------------------------------------------------------ |
| 链接模式 | 短链接，每次请求都需要重新建立         | 默认使用长连接                                               |
| 请求资源 | 一次性获取所有响应，不支持断点续传     | 请求头加入 range 头域，允许只请求一部分资源，返回码是 206    |
| 缓存     | If-Modified-Since Expires 控制缓存策略 | 增加 Unmodified-Since If-Match if-None-Match 来控制缓存策略  |
| host     | 认为每台服务器都只绑定一个 IP 地址     | 增加 host 字段，这样九可以将请求发送到同一服务器上的不同网站 |
| 请求方法 | GET、POST                              | 怎加了 PUT、HEAD、OPTIONS                                    |

## 9.`HTTP1.1 `和 `HTTP2.0`的区别

| 协议       | HTTP1.1                                  | HTTP2.0                                                          |
| ---------- | ---------------------------------------- | ---------------------------------------------------------------- |
| 二进制协议 | 报文头信息必须为文本，数据体可以为二进制 | 头信息和提信息都为二进制，同意称为“帧”                           |
| 多路复用   | 只能复用 TCP，但是得排队请求             | 复用 TCP 的同时，可以不按顺序的同时发送多个请求                  |
| 数据流     | -                                        | 每个数据流都有独一无二的编号，数据包发送时用来区分他属于哪个请求 |
| 头信息压缩 | -                                        | 头信息可以压缩，获知使用索引方式                                 |
| 服务器推送 | -                                        | 可以主动推送静态资源                                             |

## 10.队头堵塞

简介

HTTP 规定报文必须是“一发一收”，这就形成了先进先出的“串行"队列。队列里的请求是没有优先级的，只有入队的先后顺序，排在最前面的请求会被优先处理。如果队首的请求太慢，那么队列后面的请求就不得不一起等待，结果就是他的请求承担了不应承担的事件成本，造成队头堵塞的现象。

解决方案

- 并发链接：对于一个域名允许分配多个长连接，那么相当于怎加了任务队列，不至于一个对的任务阻塞其他所有任务。
- 域名分片：将域名分出很多二级域名，他们呢都指向同样一台服务器，并能够让并发的链接变多，解决了队头堵塞问题。

## 11.`HTTP`和`HTTPS`协议的区别

- HTTPS 需要 CA 证书，费用较贵。HTTP 则不需要。
- HTTP 是明文传输，HTTPS 具有 SSL 加密
- 端口号不同，HTTP 协议的端口是 80，HTTPS 是 443

## 12.输入 URL 到页面完成加载的过程

1. **解析 URL**：分析所需要使用的传输协议和请求资源的路径，URL 不合法则转发给搜索引擎，合法则检查是否有非法字符然后进行转义。
2. **缓存判断**：浏览器判断请求的资源是否存在缓存，如果存在且未失效则直接使用，否则向服务器发送请求。
3. **DNS 解析**：首先判断本地是否存在该域名 IP 地址的缓存，没有则请求本地 DNS 服务器=》根域名服务器=》顶级域名服务器=》权威域名服务器
4. **TCP 三次握手**：确认客户端与服务端接收与发送的能力。
5. **发送 HTTP 请求**：服务器处理请求，返回 HTTP 报文
6. **页面渲染**：并行生成 DOM 树和 CSS 树，再通过这两个树构建渲染树，再计算元素的大小和位置，最后还是绘制。
7. **TCP 四次挥手**：断开链接的过程

## 13.HTTP 请求和响应报文的结构

请求体

- 请求行：请求方法、URL、HTTP 协议版本号，例如`GET index/html HTTP1.1`
- 请求头：关键字+值的键值对，例如 `accept:application/json, text/plain`
- 空行
- 请求体：例如 post 携带的请求数据

响应体

- 响应行：网路协议版本、状态码、状态码原因短语。例如： `HTTP/1.1 200 OK`
- 响应头：同上
- 空行
- 响应体：服务器返回的数据

## 14.URL 的组成部分

- 协议：例如 HTTP、FTP
- 域名：`www.baidu.com`
- 端口：如果省略则使用默认端口，HTTP：80，HTTPS：443
- 虚拟目录：从域名的第一个”/“开始到最后一个”/“结束
- 文件名：如果省略则使用默认文件名
- 参数：例如`username=123&password=123`
- 锚部分：#后面的部分

例如：`www.aspxfans.com:8080/news/index?ID=246188&name=123#name`

## 15.强缓存与协商缓存

强缓存

- 简介：不会向服务器发送请求，直接从缓存中读取资源，在 chrome 控制台中可以看到 200 返回码，size 显示 from disk cache 或者 from memory cache（灰色表示缓存）
- 相关请求头：Expires、Cache-Control

协商缓存

- 简介：向服务器发送请求，服务器根据请求头的一些参数判断是否命中协商缓存，如果命中这返回 304 状态码，并且带上新的响应头通知浏览器读取缓存
- 相关请求头：Etag、If-None-Match、Last-Modified、If-Modified-Since

## 16.HTTP 的 keep-alive 的作用

- 开启状态：HTTP1.0 默认关闭，需要手动开启，HTTP1.1 默认开启
- 作用：使客户端到服务端的链接持续有效（长连接，用于复用 TCP 链接），当出现对服务器的后续请求时，keep-alive 功能可以避免重新建立链接
- 使用方法：请求头中添加`Connection: keep-alive`
- 优点：
  - 减少 CPU 和内存的占用（应为打开的连接数变少，复用了链接）
  - 减少了后续请求的延迟（无需再次握手）
- 缺点：本可以释放的资源被占用，有的请求已经结束了，但是还在链接。
- 解决方法：服务器设置过期事件和请求次数，超过事件或者次数直接断开链接。

```http
HTTP/1.1 200 OK
Connection: Keep-Alive
Content-Encoding: gzip
Content-Type: text/html; charset=utf-8
Date: Thu, 11 Aug 2016 15:23:13 GMT
Keep-Alive: timeout=5, max=1000
Last-Modified: Mon, 25 Jul 2016 04:32:39 GMT
Server: Apache
```

## 17.常见的 HTTP 状态码

| 类别 | 原因                          | 描述                     |
| ---- | ----------------------------- | ------------------------ |
| 1xx  | Informational 信息性状态码    | 请求正在处理             |
| 2xx  | Success 成功状态码            | 请求正常处理完毕         |
| 3xx  | Redirection 重定向状态码      | 需要进行附加操作完成请求 |
| 4xx  | Client Error 客户端错误状态码 | 服务器无法处理请求       |
| 5xx  | Server Error 服务器错误状态码 | 服务器处理请求出错       |

**2xx**

- 200 OK：表示从客户端发来的请求在服务端被正确处理
- 201 Created：请求已被实现，而且有一个新的资源已经依据请求的需要而建立。
- 202 Accepted：请求服务器已经接受，但是尚未处理，不保证完成请求，一般用于异步情况，防止 HTTP 一直被占用。
- 204 Not Content：请求成功，但响应报文不含实体的主体信息。
- 205 Rest Content：同 204，但是要求请求方重置请求。
- 206 Partial Content：表示服务器已经成功处理了部分 GET 请求，响应头中会包含获取的内容范围，一般用于分段下载。

**3xx**

- 301 Moved Permanently：永久性重定向，表示资源已经被分配了新的 URL。
- 302 Found：临时性重定向，表示资源被临时分配了新的 URL。
- 303 See Other：表示资源存在着另一个 URL，应该使用 GET 方法获取。
- 304 Not Modified：自从上次请求后，请求的网页内容未修改，服务器响应时，不会返回网页内容（协商缓存）
- 307 Temporary Redirect：同 302 ，但是希望客户端保持请求方法不变向新的地址请求。

**4xx**

- 400 Bad Request：请求报文存在语法错误，例如传参格式不正确。
- 401 Unauthorized： 无权限
- 403 Forbidden：对请求的资源被服务器拒绝
- 403 Not Found：表示服务器上没有找到请求的资源。
- 408 Request Timeout：客户端请求超时
- 409 Confict：请求的资源可能引发冲突

**5xx**

- 500 Internal Sever Error：表示服务器在执行请求时发生了错误。
- 501 Not Implemented：表示服务器不支持当前请求所需要的某个功能。
- 503 Service Unavailable：服务器处于超负载或者停机维护状态，无法处理请求。

## 18.同样时重定向 302 和 303、307 的区别

302 是 http1.0 的协议状态码，在 http1.1 版本的时候细化出 303 和 307。303 会把 POST 方法改为 GET 方法重定向请求，307 则是直接保持原样重定向请求

## 19.304 的过程

1. 浏览器请求资源时首先命中资源的 Expires 和 Cache-Control 强缓存头，Expies 受限于本地时间，如果修改了本地时间，可能会造成缓存失效，可以通过 Cache-control：max-age 指定最大神明周期。如果成功状态码仍然返回 200，但是不会去请求数据，在浏览器中能明显看到 from cache 字样。
2. 强缓存头失效，进入协商缓存阶段，首先验证 ETag，ETag 可以保证每一个资源时唯一的，资源变化会导致 ETag 变化。服务器根据客户端上送来的 If-None-Match 值来判断是否命中缓存。
3. 协商缓存 Last-Modify/If-Modify-Since 阶段，客户端第一次请求资源时，服务器返回的 header 中会加上 Last-Modify，Last-Modify 时一个时间标志该资源的最后修改时间。再次请求该资源时，request 的请求头中会包含 If-Modify-Since，该值为缓存之间的 Last-Modify。服务器收到 If-Modify-Since 后，根据时间判断是否命中缓存。命中则返回 304

## 20.DNS 协议

**概念**

DNS 是域名系统的缩写，提供的是一种主机名到 IP 地址的转换服务。他是一个有分层的 DNS 服务器组成的分布式数据库，是定义了主机如何查询这个分布式数据库的方式的应用层协议。能够使人更方便的访问互联网，而不是记住能够被机器直接读取的 IP 数字串。

**作用**

将域名解析为 IP 地址，客户端向 DNS 服务器发送域名查询服务，DNS 服务器告知客户端 Web 服务器的 IP 地址。

**查询过程**

1. 在浏览器的缓存中查找对应的 IP 地址 =》
2. 将请求发送给本地 DNS 服务器，在本地域名服务器缓存中查找 =》
3. 向顶级域名服务器发送请求，接受请求的服务器查询自己的缓存 =》
4. 向权威域名服务器发送请求，域名服务器返回对应的结果 =》
5. 本地 DNS 服务器将结果保存在本地缓存中 =》
6. 本地 DNS 服务器将结果返回给浏览器

## 21.token 是什么

**简介**

token 也可以称为令牌，一般由`uid + time + sign + payload`组成

```markdown
uid: 用户唯一身份标识
time：当前时间戳
sign：签名，使用 hash/encrypt 压缩成定长的十六进制字符串，防止第三方恶意拼接
固定参数（可选）：将一些常用的固定参数加入到 token 中，一般为了避免重复查库
```

**存放**

token 在客户端一般存放与 LocalStorage、cookie、sessionStorage 中。在服务端一般存于数据库中。

session 是有状态的，一般存于服务器内存或者硬盘中，当服务器采用分布式或者集群式时，session 就会面对负载均衡问题。负载均衡多服务器的请客，不好确认当前用户是否登录，应为多服务器不共享 session。

使用 token 时，客户端登录传递信息给服务端，服务端收到后，把用户信息加密传给客户端，客户端将 token 存放于 localStorage 等容器中。客户端每次访问都传递 token，服务端解密 token，就知道这个用户是谁了。通过 cpu 界面就不需要存储 session，解决负载均衡多服务器的问题。这个方法叫 JWT（JSON Web Token）

**认证过程**

1. 用户登录。成功后服务器返回 Token 给客户端
2. 客户端收到数据后保存在客户端
3. 客户端再次访问服务器，将 token 放在 headers 中，或者其他方式传递给服务端
4. 服务端采用 filter 过滤器校验。校验成功返回请求的数据，校验失败返回错误码。

**加密过程**

- 需要一个随机数 secret
- 后端利用 secret 和加密算法对 payload（如账号密码）生成一个字符串（token），返回给前端
- 前端每次请求都在 header 中带上 token
- 后端用同样的算法解密

**CSRF（Cross-site request forgery）跨站请求伪造**

token 可以抵挡 csrf，cookie+session 不可以。

cookie：登陆后后端生成一个 sessionid 放在 cookie 中返回给客户端, 并且服务端一直记录着这个 sessionid, 客户端以后每次请求都会带上这个 sessionid, 服务端通过这个 sessionid 来验证身份之类的操作。所以别人拿到了 cookie 就相当于拿到了 sessionid ,就可以完全替代你。同时浏览器会自动携带 cookie

token：同样是登录后服务端返回一个 token，客户端保存起来，在以后 http 请求里手动的加入到请求头里，服务端根据 token 进行身份的校验。浏览器不会自动携带 token，所以不会劫持 token。

## 22.token 过期后，页面如何实现无感刷新

**无感刷新**

本质是为了提升用户体验，当 token 过期时不需要用户跳回登录页重新登录，而是当 token 过期后，进行拦截，发送刷新 token 的 ajax，获取新的 token 并进行覆盖，让用户感觉不到 token 已经过期。

**实现方法**

- 后端返回过期时间，前端判断，主动调用刷新。缺点：本地时间容易篡改
- 写个定时器，自动刷新。缺点：浪费资源。
- 在响应拦截其中拦截，判断 token 过期后，调用刷新接口。
