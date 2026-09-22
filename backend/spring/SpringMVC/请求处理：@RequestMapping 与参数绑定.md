# 请求处理：@RequestMapping 与参数绑定

*类型：knowledge ｜ 难度：基础 ｜ 标签：SpringMVC、@RequestMapping、参数绑定、文件上传*

**SpringMVC 处理请求的第一步是把请求映射到处理方法：@RequestMapping 建立 URL 与方法的映射，支持路径/请求方法/请求头/内容类型的多维匹配，并可配合通配符和 {path} 占位符做动态路由。参数绑定则通过一组注解从请求的不同部位取值：@PathVariable 取路径变量、@RequestParam 取查询参数、@RequestBody 解析 JSON 请求体、@RequestHeader/@CookieValue 取头和 Cookie，多参数时可直接封装成 JavaBean 或用 MultipartFile 接收上传文件。**

## @RequestMapping 注解

建立请求 URL 与处理方法之间的映射关系。

- **作用范围**：类上（统一路径前缀）+ 方法上（具体地址）。
- **功能**：路径控制、HTTP 方法控制、参数匹配、请求头匹配、路径变量、内容协商（produces/consumes）。

```java
@Controller
@RequestMapping("/user")       // 类级别：统一前缀
public class UserController {

    @RequestMapping("/login")  // 实际访问路径：/user/login
    public String login() {
        return "login";
    }

    // 指定请求方式：只能处理 POST
    @RequestMapping(value = "/submit", method = RequestMethod.POST)
    public String submit() {
        return "submitSuccess";
    }

    // 数组形式指定多个请求方法
    @RequestMapping(value = "/multi", method = {RequestMethod.GET, RequestMethod.POST})
    public String multi() {
        return "ok";
    }

    // 限制请求头：必须携带 token=abc123
    @RequestMapping(value = "/headerTest", headers = "token=abc123")
    public String headerTest() {
        return "headerValid";
    }

    // 限制请求内容类型：只接受 application/json
    @RequestMapping(value = "/json", consumes = "application/json")
    public String consumeJson(@RequestBody User user) {
        return "jsonReceived";
    }

    // 限制响应内容类型：返回 text/plain 并指定编码防乱码
    @RequestMapping(value = "/text", produces = "text/plain;charset=UTF-8")
    @ResponseBody
    public String produceText() {
        return "普通文本返回";
    }
}
```

### 派生注解

Spring 4.3+ 推荐用更简洁的快捷注解：

| 注解 | 等价于 |
| --- | --- |
| `@GetMapping` | `@RequestMapping(method = RequestMethod.GET)` |
| `@PostMapping` | `@RequestMapping(method = RequestMethod.POST)` |
| `@PutMapping` | `@RequestMapping(method = RequestMethod.PUT)` |
| `@DeleteMapping` | `@RequestMapping(method = RequestMethod.DELETE)` |
| `@PatchMapping` | `@RequestMapping(method = RequestMethod.PATCH)` |

```java
@GetMapping("/products/{id}")
public String getProduct(@PathVariable("id") String id) {
    return "productDetail";
}
```

## 路径匹配规则

### 通配符

| 通配符 | 含义 | 示例 |
| --- | --- | --- |
| `*` | 任意字符，不含 `/`，只匹配一层路径 | `/user/*` 匹配 `/user/abc`，不匹配 `/user/abc/def` |
| `**` | 任意路径，含 `/`，可跨多层 | `/user/**` 匹配 `/user/a/b/c` |
| `?` | 任意单个字符 | `/user/??` 匹配 `/user/ab` |

```java
@RequestMapping("/product/*")
public String oneLevel() { return "ok"; }
// /product/abc 命中，/product/abc/def 不命中

@RequestMapping("/product/**")
public String multiLevel() { return "ok"; }
// /product/abc 和 /product/abc/def 都命中
```

### 路径占位符

动态提取路径片段绑定到方法参数，`{}` 中的名字与 `@PathVariable` 对应（名字相同时可省略注解值，前提是编译保留参数名）。

```java
// 单个占位符
@RequestMapping("/user/{id}")
public String getUser(@PathVariable("id") int id) {
    // 访问 /user/1001 时 id = 1001
    return "userDetail";
}

// 多个占位符
@RequestMapping("/order/{orderId}/item/{itemId}")
public String getItem(@PathVariable String orderId, @PathVariable String itemId) {
    // 访问 /order/123/item/456 时 orderId=123, itemId=456
    return "itemDetail";
}
```

### URL 末尾斜杠

SpringMVC 默认忽略末尾 `/` 的差异（`/hello` 与 `/hello/` 等价）；需严格区分时配置 `setUseTrailingSlashMatch(false)`。

## 目标方法参数绑定

### 参数来源总览

| 来源 | 注解 | 说明 |
| --- | --- | --- |
| URL 路径变量 | `@PathVariable` | 提取路径占位符 |
| 查询参数 | `@RequestParam` | 提取 `?key=value` |
| 请求头 | `@RequestHeader` | 读取 Header |
| Cookie | `@CookieValue` | 读取 Cookie |
| 请求体 | `@RequestBody` | JSON/XML 映射为对象 |
| Session 属性 | `@SessionAttribute` | 从 Session 取数据 |
| Servlet 对象 | 无注解直接声明 | 注入 request/response 等 |

### @RequestParam

绑定查询字符串或表单中的单个参数。

| 属性 | 说明 |
| --- | --- |
| `value` / `name` | 参数名 |
| `required` | 是否必须（默认 true） |
| `defaultValue` | 默认值 |

```java
@RequestMapping("/search")
public String search(@RequestParam("q") String query) {
    // 访问 /search?q=book 时 query = "book"
    return "result";
}
```

### @RequestBody

把请求体（JSON/XML）映射成 Java 对象，常用于 POST 提交 JSON。

```java
@PostMapping("/user")
public String addUser(@RequestBody User user) {
    // 前端发送 {"id":1,"name":"Tom"}，直接得到 User 对象
    return "ok";
}
```

注意：必须有 `HttpMessageConverter`（如 Jackson）支持；请求头需设置 `Content-Type: application/json`。

### @RequestHeader 与 @CookieValue

```java
@RequestMapping("/info")
public String getInfo(@RequestHeader("User-Agent") String userAgent) {
    return "ok";
}

@RequestMapping("/cookie")
public String getCookie(@CookieValue("JSESSIONID") String sessionId) {
    return "ok";
}
```

### 原生 Servlet API 对象

直接在参数中声明即可注入：`HttpServletRequest`、`HttpServletResponse`、`HttpSession`、`Principal`、`Locale`、`InputStream/OutputStream`、`Reader/Writer`。

```java
@RequestMapping("/test")
public void test(HttpServletRequest request, HttpServletResponse response) {
    // 可直接操作 request、response
}
```

### 绑定 JavaBean

参数较多时封装成对象，SpringMVC 自动按属性名绑定：

```java
public class User {
    private String name;
    private Integer age;
    // 需要无参构造器 + getter/setter
}

@RequestMapping("/register")
public String register(User user) {
    // 访问 /register?name=Tom&age=20 时自动绑定 user.name、user.age
    return "ok";
}
```

要求：请求参数名与对象属性名一致。

### HttpEntity 参数

同时读取请求体和请求头，比 `@RequestBody` 更通用；请求体结构不明确时可用 `HttpEntity<String>` 打印原始内容排查。

```java
@PostMapping("/post")
@ResponseBody
public String handlePost(HttpEntity<String> httpEntity) {
    String body = httpEntity.getBody();                    // 请求体
    HttpHeaders headers = httpEntity.getHeaders();         // 请求头
    return "body=" + body + "\nUA=" + headers.getFirst("User-Agent");
}
```

| 功能 | @RequestBody | HttpEntity |
| --- | --- | --- |
| 读取请求体 | 支持 | 支持 |
| 获取请求头 | 不支持 | 支持（`getHeaders()`） |
| 灵活性 | 只管 body | 同时拿 header 和 body |

## 文件上传

### 原理与条件

基于 Apache Commons FileUpload 或 Servlet 3.0 Multipart API 实现。

- 表单 `enctype` 必须为 `multipart/form-data`。
- 控制器方法用 `MultipartFile` 类型接收文件。

### 上传限制配置

```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=20MB
```

### 单文件上传

```html
<form action="/upload" method="post" enctype="multipart/form-data">
  选择文件：<input type="file" name="file" />
  <button type="submit">上传</button>
</form>
```

```java
@Controller
public class FileUploadController {

    @PostMapping("/upload")
    @ResponseBody
    public String handleUpload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return "文件为空";
        }

        String originalFilename = file.getOriginalFilename();
        long size = file.getSize();

        // 保存文件（生产环境建议加异常处理、唯一命名等）
        file.transferTo(new File("D:/uploads/" + originalFilename));

        return "上传成功：" + originalFilename + " (" + size + " 字节)";
    }
}
```

### 多文件上传

```html
<form action="/upload-multi" method="post" enctype="multipart/form-data">
  <input type="file" name="files" multiple />
  <button type="submit">上传</button>
</form>
```

```java
@PostMapping("/upload-multi")
@ResponseBody
public String handleMultiUpload(@RequestParam("files") MultipartFile[] files) throws IOException {
    for (MultipartFile file : files) {
        if (!file.isEmpty()) {
            file.transferTo(new File("D:/uploads/" + file.getOriginalFilename()));
        }
    }
    return "多个文件上传成功";
}
```

### 文件与文本字段同时提交

```java
@PostMapping("/upload-form")
@ResponseBody
public String handleFormUpload(
    @RequestParam("username") String username,
    @RequestParam("file") MultipartFile file) throws IOException {

    file.transferTo(new File("D:/uploads/" + file.getOriginalFilename()));
    return username + " 上传了文件：" + file.getOriginalFilename();
}
```
