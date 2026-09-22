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

## 内容压缩

### gzip 为什么能压小文件

*难度：进阶 ｜ 标签：gzip、DEFLATE、LZ77、Huffman、压缩算法*

**结论：gzip 的压缩内核 DEFLATE（据 RFC 1951）是两轮性质不同的冗余消除串联：LZ77 把重复出现的序列替换成一个「回引」——往回多少字节、抄多长，序列重复在这一步被消灭；Huffman 再把高频符号分配短编码、低频符号分配长编码，频率不均在这一步被榨干。gzip 命令产出的文件只是这股比特流外面的一层包装壳。级别 1-9 只是压缩端找冗余的卖力程度旋钮，解压速度与级别无关。**

**两个极端实验：压的到底是文件，还是冗余**

先看两个真实实验。`abcdefghij` 十个字符循环 10000 次得到的 100000 字节文件，gzip 后只剩 241 字节；而 `/dev/urandom` 吐出的 100000 字节真随机数据，压完反而变成 100053 字节。同是 100KB，一个几乎归零、一个不降反升——因为压缩器吃的从来不是「文件」，是冗余：循环文本的本质是一句话在 32KB 窗口内无限自引用，随机数据则一个冗余字节都没有。

> **提示：** 没有任何算法能压小所有输入。这是鸽笼原理的直接推论：如果所有输入都能压小，反复套用就能把任意大文件压到 1 字节，而 1 字节只有 256 种取值，装不下无限多种文件。所以无损压缩必然有输有赢——赢的是低熵（高冗余）数据，输的是高熵数据。「随机数据变大」不是 gzip 失败，是数学上注定要认的账。

「压的是冗余不是文件」这个模型一路通到底：源代码是重复密度极高的文本（`function`、`console.`、JSON 的 key 反复出现），所以文本类资源能打二三折；JPEG、MP4 的内部编码已经把冗余榨干，属于高熵数据，再压只赔不赚。工程上「什么该压、什么不压」的全部判断，都是在问一个问题：这份数据的冗余还剩多少？

**第一轮：LZ77 把重复序列变成回引**

LZ77 的输出是三种东西的混合流：字面量（没被匹配掉的原始字节）、回引（一对数字：往回 distance 字节、抄 length 字节）。解码方读到回引，就回到指定位置抄写还原——逐字节精确，这就是「无损」。两个硬参数由格式刻死（据 RFC 1951 §9）：

- 窗口 32768 字节：回引的 distance 不能超过它，超出窗口的重复互相看不见
- 匹配长度 3~258 字节：短于 3 字节的重复连回引本身的开销都摊不平，不如直接存字面量

LZ77 逐步编码示意（`console.log("hello");` 重复两遍）：

```text
console.log("hello"); console.log("hello");
^^^^^^^^^^^^^^^^^^^^^ 22 个字面量（开头无历史可引用，原样进入输出流）

console.log("hello"); console.log("hello");
                      ^^^^^^^^^^^^^^^^^^^^^ 往回 22 字节、抄 21 字节（输出回引）
```

1. 扫描：压缩器从左往右扫，维护最近 32KB 的滑窗（= 已编码内容本身）。开头的 `console.log("hello");` 没有任何历史可引用，作为字面量原样进入输出流
2. 发现重复：扫到第二段的 `c` 时，压缩器在滑窗里检索：往回 22 字节处，有一段 21 字节的内容和接下来要写的完全相同
3. 输出回引 `<distance=22, length=21>`：21 字节的重复被折成一对数字。distance 22 < 32768（窗口内）、length 21 在 3~258 区间——一次合法回引。重复密度越高，字面量被替换掉的比例越高
4. 解码：解压方读到回引，回到自己输出缓冲区往回 22 字节处，抄 21 字节接在末尾。不查表、不猜语义，逐字节精确还原——无损的来源

这个思路日常开发里到处都是：CSS 把重复的内联样式抽成一个 class 到处引用、minify 给高频标识符起单字符名字——都是「重复模式 → 短引用」，LZ77 把它做成了滑动窗口内的自动化流水线。它也解释了 32KB 窗口的工程含义：1MB 的 bundle 里，同一个工具函数出现在相距 500KB 的两处，gzip 对这对重复是失明的——这是 gzip 在大文件上吃亏的机制级原因，也是 brotli 把窗口上限放大到 16 MiB 的动机之一。

**第二轮：Huffman 按频率重新分配编码长度**

LZ77 之后，流里是字面量与回引的混合符号序列，而这些符号的频率极不均匀：文本里 `e` 和空格霸榜，代码里 `;`、`(`、单字符标识符霸榜。Huffman 的动作是按频率重新分配编码长度——高频符号给短码，低频符号给长码，把「频率差异」这最后一种冗余也榨出来。minify 给高频变量起 `a`、`b` 这样的名字，就是手工版的 Huffman；算法只是把它推到了信息论的极限。

变长编码不会解错，靠的是前缀性质：任何码都不是另一个码的前缀（例如码表 `{0, 10, 110, 111}`）。解码时从比特流左往右读，一个码一成形就唯一确定，不用回溯——这是压缩和解压都能单遍顺序处理的前提，也是解压快的基础。gzip 用的是动态 Huffman：压缩器为每一块数据现场统计频率、生成定制码表，把码表放在块头一起写进输出；甚至码表本身（各符号的码长序列）还先做了一遍游程压缩再用一个小 Huffman 编码——数据的冗余用 Huffman 消，码表的冗余再套一层 Huffman 消，抠到极致。

整个 DEFLATE 流由块拼成，每块开头 3 个比特：1 bit 标记「是否最后一块」，2 bit 选块类型——原样存储（stored）、固定码表、动态码表。流水线全景：

```text
原始字节（高冗余文本）
  │ 滑窗匹配 32KB / 长度 3~258
  ▼
LZ77：字面量 + 回引（消序列重复）
  │ 符号频率统计
  ▼
Huffman：变长码流（消频率不均）
  │ 动态码表随块携带
  ▼
分块 + 码表打包成 DEFLATE 比特流
  │ RFC 1952 容器
  ▼
gzip 壳：头部 + CRC/ISIZE 尾部
```

还有一块常被忽略的拼图：stored 块（逃生舱）。当一段数据实在压不动（高熵、比特流反而更大），压缩器可以直接输出「原样存储块」，字节照抄，每块只付约 5 字节手续费。这是「JPEG 再 gzip 反而变大」的机制级解释——不是压缩器失败，是它按设计主动弃权。

**级别与不对称性：压缩贵，解压廉**

级别 1-9 调的是压缩端的搜索力度：哈希链翻多深、要不要做惰性匹配——本质是「多卖力找冗余」的旋钮。无论哪一级，产出的都是合法 DEFLATE 流，解压永远是同一套单遍算法，速度与级别无关。而压缩端要反复检索滑窗，天然比解压贵。这个不对称性是整个 CDN 模式的技术前提：一次压缩、千万次分发——贵的部分付一次，便宜的部分每个用户各跑一遍。

推论：构建期预压缩可以无脑用最贵的档位——`-9` 慢没关系，构建机的时间不值钱；甚至 zopfli 这类「用 80 倍耗时再抠 3~8% 体积」的极限 DEFLATE 编码器也值得上，因为它输出的仍是标准 DEFLATE，浏览器解压无感知。

错误写法（「有 minify 就够了，压缩是重复劳动」——两者消的是不同层的冗余，二选一等于白扔一层收益）：

```bash
vite build   # 只产出了 minify 过的 JS，服务器裸传
```

正确写法（minify 消语法层冗余：长名变短名、删空白；gzip 接着消字节层冗余）：

```bash
vite build && gzip -k9 dist/assets/*.js
```

错误写法（对高熵数据开压缩：这些格式内部已是压缩态，再压只赔手续费）：

```nginx
gzip_types
  image/png image/jpeg video/mp4 font/woff2;
```

正确写法（只让压缩器吃它擅长的高冗余文本，图片字体绕行）：

```nginx
gzip_types text/css application/javascript
  application/json image/svg+xml;
```

记忆点「压缩 = 消除冗余」：

- LZ77 管序列重复（回引，窗口 32KB，长度 3~258）
- Huffman 管频率不均（前缀码，动态码表随块走）
- stored 块是无冗余时的合法弃权
- 级别只调压缩端卖力程度——压缩贵、解压廉，一次压缩千万次分发

**追问链**

**Q：为什么 100KB 随机数据 gzip 后反而变成了 100053 字节？**

随机数据没有可消除的冗余，DEFLATE 只能选 stored 块原样照抄，另付头部尾部与块头的固定开销，净增 53 字节。这不是实现缺陷而是数学必然：无损压缩的输出空间不可能小于输入空间，否则反复压缩就能把任意文件压到 1 字节——而 1 字节装不下无限多种文件。压缩器永远在赢面大的数据上赢。

- 延伸：工程推论：nginx、CDN 对图像视频默认不压缩，不是疏忽，是替你算了这笔必输的账。

**Q：32KB 窗口对优化大体积 JS bundle 意味着什么？**

相距超过 32768 字节的两段相同内容，gzip 完全看不见它们的关系——第二段只能当全新内容重新压一遍。bundle 越大、公共代码分布越散，这种「窗口外重复」越多，压缩率越稀释。所以拆包让同源代码聚簇、把公共依赖提频（commons chunk），本质都是在帮 LZ77 把重复搬进同一个窗口。

- 延伸：brotli 的应对是窗口上限放大到 16 MiB（RFC 7932：window size = (1 << WBITS) - 16，WBITS 最高 24），常见配置 4~16 MiB——能看到窗口外重复的距离是 gzip 的 128~512 倍，这是它压缩率优势的重要来源之一。

**Q：为什么解压速度和压缩级别完全无关？**

级别调的是压缩端找冗余的搜索力度：哈希链遍历深度、惰性匹配开关等，全是「产出比特流之前」的策略。最终产出永远是同一种合法 DEFLATE 比特流，而解压器的输入只有这股流——它不知道也不需要知道压缩时用了哪一级。所以 -1 与 -9 的产物解起来一样快。

- 延伸：更极端的证明是 zopfli：比 gzip -9 多花 80 倍时间，产物仍是标准 DEFLATE，浏览器解压速度不变——压缩端可以无限卷，解压端纹丝不动。

**Q：先 minify 后 gzip，为什么这个顺序不能反？**

minify 工作在语法层：删空白、换短名、死代码消除——它必须读到「代码」才能动手。gzip 的输出是高熵比特流，minify 工具既读不懂也写不动它，顺序天然只能 minify 在前。反过来，minify 之后的代码依然是自然语言级重复密度的文本（关键字、标点、常见 token 满天飞），gzip 照样吃得动——两层消除的收益是叠加的，谁也替代不了谁。

- 延伸：同类叠加还有一层：brotli 对 JS/CSS 的收益比 gzip 大，部分原因是它内置了常见 web 词元的静态字典——相当于自带一层预置回引，与 minify 也是正交叠加的。

**Q：动态 Huffman 的码表本身也要占空间，压缩器怎么避免「码表吃掉收益」？**

三重账：第一，码表按「块」为单位生成，只有数据量大到值得定制码表时才用动态块，小数据直接用固定码表块甚至 stored 块，避免码表摊不平；第二，码表传输的不是完整编码树，而是每个符号的码长序列；第三，这个码长序列本身高度重复（大量符号码长为 0 或相同），先跑长度编码再用一个预置小 Huffman 编码后才写入——码表的冗余也被榨了一遍。RFC 1951 里这是 HLIT/HDIST/HCLEN 加码长字母表那一节。

- 延伸：这套「描述信息的再压缩」思想在 tar 里也有影子：归档元数据同样可以被外层 gzip 整体压一遍——嵌套的不是内容，是各自层面的冗余。

延伸阅读：.gz 文件里都装了什么（魔数、MTIME、CRC32 与多 member 的容器解剖）；gzip 命令行怎么用（级别 1-9 的实测数据与选择场景、-c/-k 的安全姿势）

### .gz 文件里都装了什么

*难度：进阶 ｜ 标签：gzip、文件格式、RFC 1952、CRC32、魔数*

**结论：.gz 是一层轻薄的包装壳：头部最少 10 字节（魔数 1f 8b、压缩方法、FLG 标志、MTIME 时间戳、可选的原文件名），中间是 DEFLATE 载荷，尾部固定 8 字节（CRC32 校验 + 原始长度 ISIZE）——空输入压出来整整 20 字节，一字节不多。格式还规定「一个 .gz 可以装多段独立压缩数据（member）」，所以 cat a.gz b.gz 拼接、往旧压缩包追加新段落都天然合法；CRC32 逐 member 验收保证解压结果与原文逐字节一致。**

（前置知识：中间那段载荷是 DEFLATE 比特流——LZ77 加 Huffman 的产物，见上文「gzip 为什么能压小文件」；本节拆的是它的包装壳。）

**空输入压出来 20 字节：壳的固定成本**

压缩一个空内容，得到的 .gz 恰好 20 字节——没有载荷可压，这 20 字节就是壳的全部固定开销。它解释了一个工程常识：小于 1KB 的文本不值得压缩，因为壳与码表的成本很容易吃掉压缩收益（43 字节的小脚本压完变 45 字节）。逐字段看这 20 字节（来自 `printf '' | gzip | xxd` 的真实输出）：

```text
+-------------------------------+--------------+------------------------------+
| 头部 · 10 字节                 | 载荷 · 2 字节 | 尾部 · 8 字节                 |
| ID1 ID2 CM FLG MTIME×4 XFL OS |    03 00     | CRC32 ×4      | ISIZE ×4     |
+-------------------------------+--------------+------------------------------+
  1f 8b  08  00  87 b5 a2 6a  00 03              00 00 00 00    00 00 00 00
```

- `1f 8b`：ID1/ID2，魔数，gzip 身份证
- `08`：CM，8 = DEFLATE，写死
- `00`：FLG，无附加字段
- `87 b5 a2 6a`：MTIME，压缩时刻 Unix 秒——printf 不经文件名管道输入时，Apple gzip 也嵌入了当前时间，这四字节每次压缩都不同
- `00`：XFL，压缩级别提示
- `03`：OS，3 = Unix
- `03 00`：BFINAL+BTYPE，空块 + 结束标记——空输入也有块结构与结束标记
- `00 00 00 00`：CRC32，空数据的校验和 = 0
- `00 00 00 00`：ISIZE，原始长度 mod 2^32 = 0

**头部的两个彩蛋：FNAME 与 MTIME**

FLG 是头部的能力开关位，置位就表示头部附带对应字段。最常见的是 FNAME——`gzip 文件名` 压缩本地文件时默认把原文件名嵌进头部，所以 gunzip 能还原文件名。对比三个 hexdump：

```bash
$ printf '' | gzip | xxd            # 管道输入：FLG=00，无名无日期之外还嵌了时间
00000000: 1f8b 0800 87b5 a26a 0003 0300 0000 0000
$ printf '' | gzip -n | xxd         # -n：时间清零，不嵌名字
00000000: 1f8b 0800 0000 0000 0003 0300 0000 0000
$ seq 1 100 > nv-fname.txt && gzip -c nv-fname.txt | xxd | head -2
00000000: 1f8b 0808 87b5 a26a 0003 6e76 2d66 6e61  .......j..nv-fna
00000010: 6d65 2e74 7874 0015 9049 0100 410c 83fe  me.txt...I..A...
```

命令行压缩时 FLG 变成 `08`，紧跟的名字字节 `6e 76 2d 66 ...` 正是「nv-fname.txt」的 ASCII。

MTIME 是可复现构建的隐患：它嵌的是压缩那一刻的时间戳（据 RFC 1952 §2.3：「This gives the most recent modification time of the original file being compressed.」，MTIME = 0 表示无时间戳可用）。同一份源码，今天构建和明天构建产出的 .gz 字节不同——按内容寻址的缓存、对比构建产物的 CI 都会误判「文件变了」。解法是 `gzip -n`：时间清零、不嵌文件名，让「内容相同 ⇔ 字节相同」重新成立。npm 等生态发布 .tgz 时同样受此约束。

**尾部 8 字节：解压结果的验收员**

尾部两个字段是「逐字节一致」的保障机制：

- CRC32：解压内容的校验和——解压器解完一段，对解出来的输出现场重算 CRC32，与尾部存的值比对，差一个比特就报错退出、拒绝交出结果。RFC 1952 §2.3.2 原文：「This contains a Cyclic Redundancy Check value of the uncompressed data computed according to CRC-32 algorithm.」——CRC32 针对的是未压缩的原始数据，且由解压器现场重算比对，不是可选项
- ISIZE：记录原始长度（mod 2^32）做二次核对。`gzip -l` 能不解压报出原始大小、`gzip -t` 能只验完整性，读的都是这两个字段

> **注意：** CRC32 防事故，不防攻击。CRC32 只有 4 字节、线性可构造：蓄意篡改者可以同时改写数据和校验值让它对得上。它防的是传输翻转、截断、写坏这类意外，防不了恶意伪造——传输完整性由 TLS 负责，别把 CRC 当安全机制用。

**多 member：cat 拼接与日志追加为什么合法**

.gz 格式允许多段独立压缩数据首尾相接装在同一个文件里，每段叫一个 member。RFC 1952 §2.2 原文：「A gzip file consists of a series of 'members' (compressed data sets). The members simply appear one after another in the file, with no additional information before, between, or after them.」——多 member 是格式定义的一部分，不是工具的宽容。

这意味着 `cat a.gz b.gz > c.gz` 产出的文件完全合法，解压输出就是两段原文的顺序拼接；甚至可以往已有 .gz 后面直接追加新的压缩段——历史字节一个不动。日志滚动归档「边产生边压进同一个 .gz」的玩法，建立在这一点上。

gunzip 读拼接文件的流程：

1. 读头部：开头两个字节 1f 8b 命中魔数，确认这是一段 gzip member，读 FLG 决定要跳过哪些可选字段
2. 解 DEFLATE 载荷：逐块解压比特流，边解边往输出缓冲区写。member 之间互相独立，第一段的字典进不了第二段的窗口
3. 验尾部：对解出的内容现场重算 CRC32、核对原始长度。不符 → 报 corrupt input、非零退出、拒绝输出
4. 探头：后面还有 1f 8b 吗？有 → 这是个新 member，回到第一步接着解；没有 → 干净结束。cat 拼接的 c.gz 输出 `AAA,BBB.` 就是这么来的

拼接合法，但有个代价要心里有数：每个 member 是独立压缩单元，LZ77 的窗口不跨 member——两段里就算有大量重复内容也互相看不见。实测：先压再拼（两个 member）是 48 字节，把同样的内容合并后压一次（单 member）只要 28 字节。拼接换来的从来不是压缩率，是追加能力与历史不可变性。

```bash
$ printf 'AAA,' | gzip > a.gz && printf 'BBB.' | gzip > b.gz
$ cat a.gz b.gz > c.gz && gunzip -c c.gz
AAA,BBB.                     # 拼接解压 = 原文顺序相连，逐字节一致
$ cat a.gz b.gz | wc -c      # 两个 member
48
$ printf 'AAA,BBB.' | gzip | wc -c   # 合并后单 member
28
$ cat b.gz >> a.gz && gunzip -c a.gz   # 追加日志模式：历史字节不动
AAA,BBB.
```

错误写法（可复现构建：嵌入了构建时刻的 MTIME，同一份源码两次构建字节不同，内容寻址缓存、产物对比全部误判「文件变了」）：

```bash
gzip dist/main.js
```

正确写法（MTIME=0，不嵌文件名，内容相同 ⇔ 字节相同；据 RFC 1952：MTIME = 0 means no time stamp is available）：

```bash
gzip -n dist/main.js
```

错误写法（往压缩日志追加新一天：解压 → 合并 → 重新压缩，几 GB 的归档每次都要整体搬动，IO 与 CPU 双输）：

```bash
gunzip archive.gz
cat archive today.log > merged
gzip merged
```

正确写法（新一天单独压缩，压缩态直接追加：历史字节一个不动，解压顺序输出）：

```bash
gzip -c today.log >> archive.gz
```

记忆点「壳 = 头 + DEFLATE + 尾」：

- 头部 10 字节起（魔数 1f 8b、FLG、MTIME、可选 FNAME）
- 载荷是 DEFLATE 流
- 尾部固定 8 字节（CRC32 + ISIZE）
- member 相互独立——拼接与追加合法，但窗口不跨 member，压缩率略让

**追问链**

**Q：为什么 cat 拼起来的 .gz 能解压，而随便改一个字节就不行？**

拼接是结构层面的合法操作：每段 member 的头尾完整、魔数各就各位，解压器解完一段看到下一个 1f 8b 就接着解第二段。而随手改字节破坏的是 DEFLATE 比特流或 CRC32——解压器要么解不出合法符号序列直接报错，要么解完了对不上校验和拒绝输出。前者问「结构像不像 .gz」，后者问「内容是否与压缩时逐字节一致」，两道关卡各自独立。

- 延伸：这也是 gzip -t 能「只验不解」的原因：校验和解码在同一个流程里，验完丢弃输出即可，省的只是写盘。

**Q：gunzip -t 和解压到 /tmp 再删掉，差别在哪？**

校验完全相同：都要完整跑一遍 DEFLATE 解码并重算 CRC32，CPU 成本一样。差别只在 IO：-t 不写磁盘，解压再删则要把全部原始数据写出去再删掉——对几 GB 的归档，差的这段时间和磁盘写放大很可观。脚本里的完整性检查一律 -t。

- 延伸：-t 的退出码就是脚本钩子：下载后 `gzip -t xx.gz && 处理 || 重新下载`，一行实现坏包重试。

**Q：MTIME 字段是怎么把 CI 的缓存逻辑搞坏的？**

按内容寻址的缓存（构建产物哈希、镜像层、CDN 的 etag 类机制）默认「内容相同则字节相同」。MTIME 嵌的是压缩时刻，同一份源码两次构建产出的 .gz 字节不同，哈希全变，缓存全量失效——缓存命中率归零。解法是 gzip -n（时间清零、不嵌名字）；npm publish 的 .tgz、Docker 层等场景同理，都要锁死字节稳定性。

- 延伸：验证方法：对同一文件间隔一分钟压两次 diff 一下，再用 -n 压两次 diff——前者的差异恰好落在 MTIME 那 4 个字节上。

**Q：CRC32 校验能防止文件被恶意篡改吗？**

不能。CRC32 只有 4 字节且运算是线性的：攻击者改了数据后，可以精确算出「校验值该改成多少」让整体验证通过，成本几乎为零。它防的是无意图的损坏——传输位翻转、磁盘坏块、截断，这类事故撞上 4 字节校验和还能蒙混过关的概率约 2^-32，足够低。恶意对抗是密码学校验（如 SHA-256）和传输层（TLS）的职责。

- 延伸：gzip 的安全实践结论：解压不可信来源的 .gz 时，CRC 只保证「和我声称的原文一致」，不保证「原文可信」——真正的防线在传输与签名层。

**Q：拼接方案比单文件压缩大 20 字节，那什么时候该选拼接？**

看写入模式。静态归档、一次性分发：合并后单次压缩永远更小更优。流式追加场景（日志滚动、边产生边归档）：拼接是唯一不需要搬动历史的方案——新内容独立压缩追加在尾部，已写入的字节一个不动，追加成本 O(新数据) 而非 O(全量)。窗口不跨 member 造成的压缩率损失，对追加型场景是一笔值得付的保险费。

- 延伸：反方向的专业玩法是 zstd：它的长距离匹配与「字典训练」能在类似场景下追回跨块冗余——这也是它统治现代日志管线（如 Kafka、ClickHouse）的原因之一。

延伸阅读：浏览器和服务器怎么协商压缩（Accept-Encoding 声明、Content-Encoding 宣布与 Vary 缓存）；gzip 命令行怎么用（-l 与 -t 的实操）

### 浏览器和服务器怎么协商压缩

*难度：进阶 ｜ 标签：HTTP、Content-Encoding、Accept-Encoding、Vary、nginx*

**结论：协商是两句话的对话：浏览器用请求头 Accept-Encoding: gzip, br 声明能力，服务器挑一种双方都懂的，用响应头 Content-Encoding: gzip 宣布结果——没声明就默认能拿未压缩原文，所以 curl 不带头就测不到压缩。缓存层靠 Vary: Accept-Encoding 知道「编码也是资源版本」。工程落地三件套：文本类型必压、已压缩格式与小响应排除、静态资源构建期预压缩。**

**一轮协商的完整往返**

HTTP 内容协商的原则是服务端说了算、客户端先表态。浏览器在每个文本资源请求上带上 Accept-Encoding，列出自己能解的编码与偏好顺序；服务器据此选择一种（或选择不压，回 identity），把实际采用的编码写进 Content-Encoding 响应头。浏览器收到响应后先按声明解压、再交给渲染管线——整条链路对页面代码完全透明。实测一个真实站点（Wikipedia，curl 采集）：

```bash
$ curl -s -o /dev/null -D - -H 'Accept-Encoding: gzip, br' https://zh.wikipedia.org/wiki/Gzip | grep -iE 'content-encoding|vary'
content-encoding: gzip
vary: Accept-Encoding,X-Subdomain,Cookie,Accept-Language,Authorization,User-Agent

$ curl -s -o /dev/null -D - https://zh.wikipedia.org/wiki/Gzip | grep -i 'content-encoding'
（没有任何输出——没声明，服务器就发未压缩原文）
```

协商往返时序：

```text
浏览器                                            服务器
  |  GET /assets/app.js                             |
  |  Accept-Encoding: gzip, br（声明我能解的）        |
  | -----------------------------------------------> |
  | <----------------------------------------------- |
  |  200 OK + Content-Encoding: gzip（宣布我用了哪种） |
  | <~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~  |
  |  Vary: Accept-Encoding（告诉缓存层：同一 URL 有多个编码版本）
```

**Vary：给缓存层的版本说明**

同一个 URL 现在有多个合法表示：gzip 版、brotli 版、未压缩版。浏览器私有缓存无所谓——它只存自己收到的那份。麻烦在共享缓存（代理、CDN）：如果缓存不知道「编码影响表示」，它可能把 A 用户的 brotli 版直接吐给不支持 brotli 的 B 用户。`Vary: Accept-Encoding` 就是解决这个问题的：它告诉缓存「选版本时要把 Accept-Encoding 计入缓存键」。

MDN《HTTP compression》指南原文：「As content negotiation has been used to choose a representation based on its encoding, the server must send a Vary header containing at least Accept-Encoding alongside this header in the response; that way, caches will be able to cache the different representations of the resource.」——带 Vary 是协商机制的一半，不是可选项。

上面 Wikipedia 实测里 vary 头把 Cookie、User-Agent 一并列入，说明它的缓存维度远不止编码。反过来看第二段实测：没发 Accept-Encoding 的请求拿不到 Content-Encoding——响应头里只剩 vary。这就是「没声明就没协商」的直接证据，也是排查命令的原理。

**服务器侧：默认值全是坑**

「我 nginx 配了 gzip 怎么 JS 还是没压？」——几乎都是默认值惹的祸。据 nginx 官方文档（ngx_http_gzip_module）：

- `gzip` 默认 off
- `gzip_types` 默认只有 text/html（其他 MIME 一概不压，这是个历史遗留默认）
- `gzip_comp_level` 默认是 1（不是手册惯性思维的 6）
- `gzip_min_length` 默认仅 20 字节

现代 SPA 的响应全是 application/javascript、application/json——落在默认清单之外，于是一行 `gzip on` 什么都没压到。

错误写法（就这一行——默认 off 被打开，但 types 只有 text/html，级别还是 1；JS/CSS/JSON 全部漏网，偶尔只有内联 HTML 页被压到）：

```nginx
# nginx.conf
gzip on;
```

正确写法（文本清单 + 级别 + 阈值；png/mp4/woff2 永远别进清单）：

```nginx
gzip on;
gzip_types text/css application/javascript
           application/json image/svg+xml;
gzip_comp_level 6;      # 动态响应别拉满，CPU 要钱
gzip_min_length 1024;   # 小响应手续费不划算
```

排除清单的价值不只是「省 CPU」：已压缩格式再压是净亏损（JPEG/MP4/woff2 内部已是高熵压缩态），小文件再压是负收益（43 字节压成 45 字节的固定开销账）。清单的本质是把压缩器对准它擅长的高冗余文本，其余全部绕行。

错误写法（curl 默认不发 Accept-Encoding，服务器自然回未压缩——协商的前提是声明）：

```bash
$ curl -I https://site.com/app.js
# 没有 Content-Encoding 就断定「没开压缩」
```

正确写法（主动声明能力，才能测出协商链路是否通畅）：

```bash
$ curl -sI -H 'Accept-Encoding: gzip' \
  https://site.com/app.js | grep -i content-encoding
content-encoding: gzip
```

**动态现压 vs 静态预压缩**

服务器拿到请求再现场压缩，CPU 开销每个请求都要付一遍；而静态资源的内容在构建时就已确定——更优的分工是构建期把 .gz 提前压好放在旁边，nginx 直接吐现成文件，零压缩开销。nginx 为此提供了独立模块，据官方文档：「The ngx_http_gzip_static_module module allows sending precompressed files with the '.gz' filename extension instead of regular files.」——请求 app.js 时若旁边有 app.js.gz 就直接回它，协商仍然照常进行。

| 维度 | 动态现压 | 静态预压缩 |
| --- | --- | --- |
| 谁来压 | nginx 每个请求现场压 | vite 等构建工具在 CI 里压好 |
| CPU 成本 | 每个请求都付一遍 | 构建时付一次，服务期零成本 |
| 内容时效 | 永远与源一致（现算的） | 源文件更新必须重新生成 .gz |
| 适用 | 动态接口、个性化响应 | 带 hash 文件名的静态资源 |
| nginx 模块 | ngx_http_gzip_module | ngx_http_gzip_static_module |

两种方式在浏览器里汇合成一个日常景象：DevTools Network 面板的 Size 列显示两个数字（如 `1.2 MB / 300 kB`）——斜杠前是解压后的真实大小，斜杠后是网络上实际传输的压缩后大小，两者的比值就是压缩协商给你省下的流量。构建期还能比 nginx 更激进：不计时间用最高级别（甚至 zopfli 这类极限 DEFLATE 编码）压一次，服务期零成本白拿最小体积——「压缩贵、解压廉」的不对称性在架构上的全部兑现。

> **提示：** br 与 zstd 只在 HTTPS 协商。浏览器只在安全上下文（HTTPS，localhost 亦视为安全）的广告里放 br/zstd——Chromium 官方表述：「like Brotli, Zstd is only available in secure contexts i.e. over https」。纯 HTTP 环境协商只能落在 gzip。算法间的取舍见下文「gzip、brotli、zstd 怎么选」。

**追问链**

**Q：浏览器不发 Accept-Encoding，服务器会主动压缩吗？**

不会。内容协商由客户端声明驱动：没有 Accept-Encoding，服务器按未压缩表示响应（不写 Content-Encoding）。本节实测里对 Wikipedia 不带头的 curl 请求就没有任何编码头。这一设计让「不支持压缩的古老客户端」天然安全——它们根本不会声明。

- 延伸：浏览器永远主动声明，curl 默认不声明——所以「用 curl 验证压缩」必须手动加 `-H 'Accept-Encoding: gzip'`，这是最常见的验证乌龙。

**Q：响应少了 Vary: Accept-Encoding 会出什么事故？**

共享缓存（代理、CDN）默认按 URL 做缓存键。A 用户（支持 br）的 brotli 响应被缓存后，B 用户（老客户端，只懂 gzip）请求同一 URL，缓存直接回 brotli 字节——B 无法解码，页面白屏或乱码。Vary: Accept-Encoding 把编码纳入缓存键，强制不同编码版本分开存。MDN 压缩指南把它定为「must」。

- 延伸：反向事故也存在：无脑 Vary 一大堆头（如 Wikipedia 连 User-Agent 都 Vary）会让缓存键爆炸，命中率暴跌——Vary 是正确性与命中率的权衡。

**Q：nginx 明明 gzip on 了，为什么 JS 响应还是没压缩？**

按官方文档：gzip_types 默认只有 text/html，application/javascript 不在清单里，压不到；另外 gzip_static、gzip 模块都默认关闭。SPA 场景必须显式列 gzip_types（css/javascript/json/svg），配 gzip_comp_level 与 gzip_min_length。调试顺序：先 `curl -H 'Accept-Encoding: gzip'` 看有没有 Content-Encoding，再核对响应的 Content-Type 是否在 gzip_types 清单里——两者对不上是最常见断点。

- 延伸：还有个隐蔽断点：中间层（如某些代理）会剥离 Accept-Encoding 或替你重新压缩，本地 curl 直连正常、过 CDN 失效时先查中间层。

**Q：DevTools 的 Size 列显示 1.2 MB / 300 kB，各是什么？**

斜杠前是资源解压后的真实大小（渲染管线拿到的字节），斜杠后是网络上实际传输的字节数（Content-Encoding 生效后的压缩流）。两者差值即压缩收益；如果两个数字相等，说明这条请求没走压缩（类型不在清单、体积低于阈值、或中间层剥了协商）——Size 列是协商链路最直观的体检表。

- 延伸：配合 Protocol 列还能看到 h2/h3：HTTP/2 下头部由 HPACK 单独压缩，与 Content-Encoding 的 body 压缩是两套互不相干的机制。

**Q：动态 JSON 接口的压缩策略和静态资源有什么不同？**

动态接口该压（JSON 是高冗余文本），但只能现压，账要算清：级别 6 以上压缩耗时陡增，高并发下 CPU 先于带宽成为瓶颈。可执行策略：响应体小于 1KB 的不压（手续费大于收益，nginx gzip_min_length 兜住）；常规接口 gzip_comp_level 4~6；大响应、大流量的接口优先考虑 CDN 边缘压缩或 zstd 这类「同级更快」的算法，把现压成本压下来。

- 延伸：个别场景反着来：已经被业务层压缩过的响应（服务端手写了压缩、或返回的是压缩文件内容）务必从 gzip_types 排除，双重压缩纯烧 CPU。

延伸阅读：gzip、brotli、zstd 怎么选（三代算法的参数、格局与选型策略）；nginx.conf 解读（部署线里逐行拆 nginx 配置文件）

### gzip、brotli、zstd 怎么选

*难度：进阶 ｜ 标签：gzip、brotli、zstd、算法选型、HTTP*

**结论：三代算法不是替代关系，是分工格局：gzip 是地板——写进 HTTP 标准，任何客户端都保证会，永远兜底；brotli 是 web 文本的天花板——窗口更大、内置 web 词元字典，静态资源预压缩的首选；zstd 在基础设施开疆——同级更快、长距离匹配与训练字典适合容器、日志、数据库。2026 年的默认策略：静态资源 brotli 最高档预压缩，gzip 全量兜底，内部数据管线交给 zstd。**

**gzip 凭什么统治三十年：一场专利危机的遗产**

gzip 的诞生动机写在 gzip.org 官方简史里：「Jean-loup Gailly and Mark Adler wrote the gzip utility to replace the Unix compress utility. At the time the continued use of compress was threatened by giant corporations holding patents on the LZW algorithm used by compress.」——前辈 compress 用的 LZW 算法（Welch 1984 年发表）握在 Unisys 手里，Unix 世界需要一个法律上安全的替代品。1992 年 gzip 发布，1996 年 5 月 DEFLATE（RFC 1951）与 gzip 格式（RFC 1952）定稿，1997 年起 Content-Encoding: gzip 写进 HTTP/1.1——恰好在 web 爆发前夜完成了标准化。

压缩算法三十年：

```text
1984 ──── LZW 发表，专利阴影埋下
1992 ──── gzip 诞生，为绕开专利而生
1996 ──── RFC 1951/1952 定稿
1997 ──── 写进 HTTP/1.1 标准
2003 ──── LZW 专利到期，格局已定
2015-16 ── brotli 与 zstd 登场
2024 ──── zstd 进主流浏览器
```

此后的故事是「挑战者定律」的两次重演：挑战者从不正面打赢 gzip，而是攻下 gzip 的短板场景。brotli 赢在压缩率（窗口更大、内置 web 字典），锁定静态资源预压缩；zstd 赢在速度（同级压缩比 gzip 快得多），锁定实时与基础设施。gzip 的护城河与算法优劣无关：免费出身 × HTTP 标准地位 × 够用的性能 × 无处不在的实现——它不是最好的压缩，是最不可能不在场的压缩。LZW 专利 2003 年到期时，一切已尘埃落定。

**三代参数对照**

| 维度 | gzip | brotli | zstd |
| --- | --- | --- | --- |
| 算法内核 | LZ77 + Huffman | LZ77 + Huffman + 上下文建模 | LZ77 + FSE(ANS) + Huffman |
| 规范 | RFC 1951/1952（1996） | RFC 7932（2016-07） | RFC 8878（2021-02） |
| 滑动窗口 | 32 KB（固定） | 上限 16 MiB−16 B（window size = (1 << WBITS) − 16） | 实现层可配，长距离匹配默认扩到 128 MB |
| 内置字典 | 无 | 静态字典 122,784 字节（web/html 常用词串） | 支持按业务数据训练专用字典 |
| Content-Encoding 值 | gzip | br | zstd |
| 浏览器支持 | 全部（标准保底） | 现代浏览器全支持 | Chrome 123 / Firefox 126 / Safari 26.3 起 |

参数差异直接对应压缩率来源：brotli 的大窗口让它「看得见」gzip 窗口外的重复（上限是 gzip 的 512 倍），122,784 字节的静态字典相当于把 web 文本高频词串预置成回引——HTML 里的 `<button`、常见 CSS 属性名不必再花比特去编码。zstd 则换了熵编码引擎：RFC 8878 原文「Two types of entropy encoding are used by the Zstandard format: FSE and Huffman coding.」——FSE 基于 ANS，用更少的 CPU 拿到接近算术编码的压缩率，这是它「同级更快」的机制根基。

压缩比直觉（Cloudflare 生产环境数十亿请求实测，HTML/CSS/JS，2024；数值越大压得越小，仅供直觉）：

```text
gzip    ██████████████   2.56:1
zstd    ███████████████  2.86:1
brotli  █████████████████ 3.08:1
```

生产数据与本地实测互相印证：Cloudflare 全网统计 zstd 平均压缩比 2.86:1，介于 gzip 的 2.56:1 与 brotli 的 3.08:1 之间，但压缩耗时与 gzip 持平、比 brotli 快 42%。本地同一份 57 万字节 seq 文本的 Node 实测更夸张：gzip -9 得 212816 字节，brotli 最高档 118159 字节——小了 44%。对 HTTP Archive 头部站点的统计（Paul Calvano，2024）给出了工程口径：brotli 最高档比 gzip 常用档再小约 15~25%，而「zstd 12 ≈ brotli 5」——体积相当、速度快得多。

**地板与天花板：协商清单里的分工**

三代算法的共存形式就写在协商头里：`Accept-Encoding: gzip, br, zstd`。浏览器只在安全上下文（HTTPS；localhost 亦视为安全）广告 br 与 zstd——Chromium 的官方表述是「like Brotli, Zstd is only available in secure contexts i.e. over https」——服务器按自己的支持情况从声明里挑最优先的编码。于是形成稳定分层：brotli/zstd 是天花板，能谈下来就用；gzip 是地板，任何客户端都保证会。连浏览器端的 JS 生态也是这个分层：Compression Streams API 目前只提供 gzip 与 deflate（MDN：Baseline「available across browsers since May 2023」），zstd 形态仍标 Experimental——网页里自己压数据，兜底依旧是 gzip。

- 静态资源（JS/CSS/字体子集/JSON 快照）：构建期用 brotli 最高档生成 .br，同名再产一份 .gz 兜底，nginx 按协商二选一直接吐文件——零现压成本
- 动态接口：现压选 gzip 4~6 档或 zstd/brotli 低档，别碰最高档（耗时陡增）；小于 1KB 的响应不压
- 基础设施（容器层、日志管线、数据库备份、CI 产物缓存）：zstd 的主场——速度与压缩比的平衡点远优于 gzip，训练字典对同构数据收益巨大
- 兼容兜底：永远保留 gzip 一条路——老代理、嵌入式客户端、不支持 br 的环境全靠它；测过协商链路再上线

错误写法（每个动态请求都现压 brotli 最高档：q11 是为「压一次发千万次」的预压缩设计的，压缩耗时可达 gzip 数倍，高并发下 CPU 先崩）：

```bash
brotli -q 11
```

正确写法（现压用低档位，或交给同级更快的 zstd：「zstd 12 ≈ brotli 5」体积相当、更快；现压的预算是单请求毫秒级，静态预压才配得上最高档）：

```nginx
gzip_comp_level 6;    # 或 brotli -q 5 / zstd -12
```

错误写法（只生成一份压缩格式赌兼容：br 没有 gzip 那样的标准保底，老客户端/特殊代理解不开，单发等于放弃兜底）：

```text
dist/app.js.br
```

正确写法（双格式同名共存，协商机制自动选最优、兜底永不缺席）：

```text
dist/app.js.br       # brotli 主力（现代浏览器）
dist/app.js.gz       # gzip 兜底（永远保留）
# nginx gzip_static / brotli_static 按协商回
```

记忆点「地板、天花板与新大陆」：

- gzip 是地板（HTTP 标准，人人会，永远兜底）
- brotli 是 web 静态文本天花板（大窗口 + 122 KB 字典，预压缩首选）
- zstd 在基础设施开疆（ANS 熵编码，同级更快，长距离匹配 + 训练字典）

**追问链**

**Q：gzip 技术上早不是最优，为什么 2026 年还没被淘汰？**

因为它的地位是标准合同给的，不是性能挣的：Content-Encoding: gzip 写在 HTTP/1.1 起的规范里，每个浏览器、每个服务端生态都保证支持。算法会被超越，合同不会被轻易作废——替换 gzip 意味着说服全世界所有历史客户端升级。事实上挑战者们也确实没有替换它，而是加入协商清单排在它前面：gzip 从霸主退居兜底，但兜底位置无比稳固。

- 延伸：同构案例：IPv4、HTTP/1.1、TLS 1.2 都是「被架空而非被淘汰」——标准地位的半衰期远长于技术优势。

**Q：brotli 的「内置字典」到底是什么？为什么对 web 文本特别有效？**

RFC 7932 附录 A 内嵌了一份 122,784 字节的静态字典，内容是人工收集的 web 文本高频词串——HTML 标签与属性、常见英文词、HTTP 头字段、JS/CSS 关键 token。它在压缩框架里的角色是「预置的窗口历史」：数据还没开始压，解码器就已经持有这份公共上下文，遇到字典里的词串直接引用，连第一个字节都不用写进输出流。gzip 的窗口永远从零开始，brotli 从 122 KB 的 web 先验起步——这是小文件上 brotli 优势尤其明显的原因（gzip 还没把窗口焐热，文件就结束了）。

- 延伸：同思路的动态版是 zstd 的训练字典：对自家业务的同构数据（如大量相似 JSON）离线训练一份专用字典，Meta 官方数据把某 JSON 场景压缩比从 2.8x 提到 6.9x。

**Q：zstd 凭什么做到压缩比 gzip 高、速度快还差不多？**

三个来源。第一是熵编码换引擎：zstd 用 FSE（基于 ANS 有限状态熵）替代纯 Huffman，RFC 8878 原文明确「Two types of entropy encoding are used by the Zstandard format: FSE and Huffman coding.」——ANS 以接近算术编码的压缩率、接近 Huffman 的速度工作，这直接改写了压缩率-耗时的权衡曲线。第二是长距离匹配：实现层打开后窗口默认扩到 128 MB（zstd 手册：designed to improve compression ratio for large inputs, by finding large matches at long distance），大文件里 gzip 窗口外的重复它能抓住。第三是工程实现本身经过极限调优，同级速度全面领先（Cloudflare 实测 zstd 压缩 0.848ms vs gzip 0.872ms，压缩比却高一个档次）。

- 延伸：代价是格式复杂度：ANS 的查表比 Huffman 分支难推理，早期浏览器对引入 libzstd 的体积与攻击面有顾虑——这正是 zstd 进浏览器比进服务器晚了八年的原因。

**Q：为什么浏览器只在 HTTPS 上广告 br 和 zstd？纯 HTTP 就不能协商吗？**

Chromium 的官方口径：「we'll be advertising support for 'zstd' encoding only if transferred data is opaque to proxies」，brotli 同理。原因是 Accept-Encoding 走在明文里，中间代理看得见却可能不认识：不支持 br 的旧代理会原样转发 br 字节流，或按自己的规则改写响应破坏协议一致性。HTTPS 让数据对中间层不透明——代理无法根据编码头做任何「聪明事」，协商才安全。推论：localhost 被浏览器视为安全上下文，本地 HTTP 开发环境照样能吃到 brotli。

- 延伸：同一逻辑的镜像面：HTTPS 普及本身就是 br/zstd 得以铺开的前提——2015 年前明文 HTTP 为主的时代，这类「代理不认识的新编码」根本无法安全推广。

**Q：2026 年给一个新站点做压缩选型，给出完整决策。**

静态资源：构建期生成双格式——brotli 最高档（q11）的 .br 与 gzip -9 的 .gz 同名共存，服务器按协商回最优、永远有兜底；构建期不计压缩耗时，白拿最小体积。动态接口：现压用低档位（gzip 6 或 zstd 12 / brotli 5 一档），配 gzip_min_length 免掉小响应；大流量接口把压缩卸载给 CDN 边缘。内部链路（镜像层、日志、备份、CI 缓存）全面 zstd。上线后用 `curl -H 'Accept-Encoding: …'` 逐格式验证协商链路，并保留 gzip 兜底回归测试。

- 延伸：长期观察项：Compression Streams API 的 zstd 支持与 Safari 的推进节奏——浏览器端 JS 压缩一旦全面 zstd 化，前端侧的选型也要跟着重排。

延伸阅读：gzip 为什么能压小文件（三代共同的算法地基：LZ77 回引与 Huffman 编码）；nginx.conf 解读（选型落地的地方：部署线里逐行拆 nginx 配置与压缩模块）

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
