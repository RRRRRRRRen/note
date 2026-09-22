# 响应处理：@ResponseBody 与文件下载

*类型：knowledge ｜ 难度：基础 ｜ 标签：SpringMVC、@ResponseBody、ResponseEntity、文件下载*

**SpringMVC 的响应分两条路：返回视图或返回数据。@ResponseBody 把方法返回值直接写入 HTTP 响应体（对象自动经 Jackson 序列化为 JSON），跳过视图解析，@RestController 是 @Controller + @ResponseBody 的类级组合；文件下载则是构造带特殊响应头（Content-Disposition）的二进制响应，用 ResponseEntity<byte[]> 返回，中文文件名靠 UTF-8 编码的 ContentDisposition 解决。**

## @ResponseBody 注解

把 Controller 方法的返回值直接作为 HTTP 响应体输出给浏览器，而不是通过视图解析器跳转页面。

### 返回字符串

```java
@Controller
public class DemoController {

    @RequestMapping("/hello")
    @ResponseBody
    public String hello() {
        return "Hello, Spring!";
    }
}
```

访问 `/hello` 浏览器直接显示：

```text
Hello, Spring!
```

如果没有 `@ResponseBody`，Spring 会把 `Hello, Spring!` 当作视图名去找 JSP 页面，报错找不到视图。

### 返回对象（自动转 JSON）

```java
@Controller
public class UserController {

    @RequestMapping("/user")
    @ResponseBody
    public User getUser() {
        return new User(1, "Tom");
    }
}
```

返回结果（SpringMVC 自动用 Jackson 序列化）：

```json
{
  "id": 1,
  "name": "Tom"
}
```

### 与 @RestController 的关系

| 注解 | 含义 |
| --- | --- |
| `@ResponseBody` | 标注在方法上，返回值写入响应体 |
| `@RestController` | `@Controller + @ResponseBody` 的组合，整个类的所有方法都返回数据 |

### 配合 produces 指定响应类型

```java
@RequestMapping(
  value = "/text",
  produces = "text/plain;charset=UTF-8"
)
@ResponseBody
public String text() {
    return "你好，世界";
}
```

明确指定返回类型和字符集，防止中文乱码。

## 文件下载

### 本质与步骤

文件下载本质是返回一个带特殊响应头（`Content-Disposition`）和二进制内容流的 HTTP 响应。

1. 读取文件（本地文件、数据库、OSS 等）。
2. 设置响应头。
3. 把文件数据写入 `HttpServletResponse` 的输出流（或封装进 `ResponseEntity`）。

### ResponseEntity<byte[]> 实现

```java
// 该接口支持 GET 请求，路径 /download2
@GetMapping("/download2")
// 返回类型 ResponseEntity<byte[]>：
//   byte[] 是响应体（文件字节内容）
//   ResponseEntity 可设置响应头和状态码
public ResponseEntity<byte[]> downloadFile2() throws IOException {

    File file = new File("D:/uploads/example.pdf");

    // 文件不存在时返回 404
    if (!file.exists()) {
        return ResponseEntity.notFound().build();
    }

    // 一次性读取整个文件为字节数组（小文件安全，几十 MB 以内性能良好）
    byte[] fileBytes = Files.readAllBytes(file.toPath());

    HttpHeaders headers = new HttpHeaders();
    // Content-Type: application/octet-stream，二进制流
    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
    // Content-Disposition: attachment; filename="example.pdf"
    //   attachment() 表示以附件形式下载（触发浏览器下载而非打开）
    //   filename(..., UTF_8) 确保中文文件名不乱码（Spring 5+ 的 ContentDisposition 构建器）
    headers.setContentDisposition(ContentDisposition
      .attachment()
      .filename(file.getName(), StandardCharsets.UTF_8)
      .build());

    // 组装响应：文件字节 + 响应头 + 状态码 200
    return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
}
```

对应的 HTTP 响应报文：

```http
HTTP/1.1 200 OK
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="example.pdf"

<文件二进制内容>
```

### 中文文件名处理

Spring 5 起 `ContentDisposition.filename()` 支持字符集参数：

```java
.filename("报告.pdf", StandardCharsets.UTF_8)
```

自动生成 RFC 5987 格式的响应头，Chrome、Edge、Firefox 均可正确下载：

```http
Content-Disposition: attachment; filename*=UTF-8''%E6%8A%A5%E5%91%8A.pdf
```

## 常见问题排查

| 问题 | 可能原因 |
| --- | --- |
| 下载文件为空 | 文件路径错误、流没写入 |
| 下载中文名乱码 | 没有使用 UTF-8 编码的 `ContentDisposition.filename()` |
| 浏览器直接打开文件而不是下载 | 没有设置 `Content-Disposition: attachment` |
| 400/500 错误 | 流异常或路径非法，需要加异常处理 |

## 最佳实践

- 前后端分离项目统一使用 `@RestController`，避免每个方法重复标注 `@ResponseBody`。
- 大文件下载避免 `Files.readAllBytes()` 一次性读入内存，改用流式写出（`InputStreamResource` 或直接写 `response` 输出流）。
- 下载接口务必处理文件不存在的分支，返回明确的 404 而非抛异常堆栈。
- 文件名拼接用户输入时注意路径穿越与非法字符过滤。
