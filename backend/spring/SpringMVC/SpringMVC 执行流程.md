# SpringMVC 执行流程

*类型：knowledge ｜ 难度：进阶 ｜ 标签：SpringMVC、三层架构、DispatcherServlet、异常处理、数据校验*

**SpringMVC 围绕一个前端控制器 DispatcherServlet 组织整个请求处理流程，业务代码则按 Controller → Service → DAO 三层分工。执行流程的本质是「统一分发、按需分派」：请求先经过拦截器 preHandle，再由 HandlerAdapter 反射调用 Controller 方法，返回 ModelAndView 或 @ResponseBody 数据后经视图渲染或消息转换写回响应。工程化配套有三件套：@RestControllerAdvice 全局异常处理、JSR 380 注解数据校验、Entity/DTO/VO 模型分层隔离内部结构。**

## 三层架构

| 层级 | 注解 | 职责 |
| --- | --- | --- |
| 表现层 | `@RestController` / `@Controller` | 接收请求、提取参数、返回响应 |
| 业务逻辑层 | `@Service` | 业务规则、事务处理、编排 DAO 调用 |
| 数据访问层 | `@Repository` / `@Mapper` | 封装数据库增删改查 |

三层优点：职责分明易维护、各层可独立测试、Service 可复用 DAO 可模块化、层间解耦改动影响小。

```java
// 表现层：只处理请求/响应，不含业务逻辑
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // GET /users/1
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // POST /users + JSON 请求体
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }
}

// 业务层：业务规则与事务
@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    public User createUser(User user) {
        user.setCreateTime(LocalDateTime.now()); // 业务默认值
        userMapper.insert(user);
        return user;
    }
}

// 数据访问层：只做数据操作
@Mapper
public interface UserMapper {
    User selectById(Long id);
    int insert(User user);
}
```

```xml
<select id="selectById" resultType="User">
  SELECT * FROM users WHERE id = #{id}
</select>
```

## 执行流程

一次请求在 SpringMVC 中的完整旅程：

```text
浏览器请求
   ↓
DispatcherServlet（前端控制器，统一接收所有请求）
   ↓
HandlerMapping（根据 URL 找到对应的 Handler/Controller 方法）
   ↓
HandlerInterceptor.preHandle()（拦截器前置处理，返回 false 则中断）
   ↓
HandlerAdapter（按参数绑定规则反射调用 Controller 方法）
   ↓
Controller 执行，返回 ModelAndView 或 @ResponseBody 数据
   ↓
HandlerInterceptor.postHandle()（渲染前处理）
   ↓
视图渲染（ViewResolver + View）或 HttpMessageConverter 序列化 JSON
   ↓
HandlerInterceptor.afterCompletion()（请求完成回调，清理资源）
   ↓
响应返回浏览器
```

各组件分工：

- **DispatcherServlet**：前端控制器，整个流程的调度中心。
- **HandlerMapping**：URL 与处理方法的映射器（基于 `@RequestMapping`）。
- **HandlerAdapter**：方法适配器，负责参数绑定并真正调用方法。
- **HandlerInterceptor**：横切逻辑（登录校验、日志）的挂载点。
- **ViewResolver / HttpMessageConverter**：分别负责视图渲染和 JSON 序列化。

## 全局异常处理

用 `@ControllerAdvice` + `@ExceptionHandler` 统一管理异常，避免每个 Controller 写重复的 try-catch，保证接口异常时前端拿到一致结构的 JSON。

- `@ControllerAdvice`：全局控制器增强器，拦截所有 `@Controller` / `@RestController`。
- `@ExceptionHandler`：定义某类异常的处理方法。
- `@RestControllerAdvice = @ControllerAdvice + @ResponseBody`，直接返回 JSON。

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 精确处理业务异常
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArg(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of(
          "code", 400,
          "message", "参数错误：" + e.getMessage()
        ));
    }

    // 兜底处理：捕获所有未被上面匹配的异常
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception e) {
        return ResponseEntity.status(500).body(Map.of(
          "code", 500,
          "message", "服务器内部错误：" + e.getMessage()
        ));
    }
}
```

工程化实践：错误码枚举 + 统一响应类 + 业务异常类三件套。

```java
// 1. 统一错误码
public enum ErrorCode {
    SUCCESS(200, "操作成功"),
    PARAM_ERROR(400, "参数错误"),
    NOT_FOUND(404, "资源不存在"),
    SERVER_ERROR(500, "服务器内部错误"),
    USER_NOT_FOUND(10001, "用户不存在");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() { return code; }
    public String getMessage() { return message; }
}

// 2. 业务异常：携带错误码，Service 层随时抛出
public class BizException extends RuntimeException {
    private final int code;

    public BizException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
    }

    public int getCode() { return code; }
}

// 3. 全局处理器中转成统一响应
@ExceptionHandler(BizException.class)
public ResponseResult<?> handleBizException(BizException e) {
    return ResponseResult.of(e.getCode(), e.getMessage(), null);
}
```

业务代码中的使用方式：

```java
@GetMapping("/{id}")
public ResponseResult<?> getUser(@PathVariable int id) {
    if (id < 1) {
        throw new BizException(ErrorCode.PARAM_ERROR, "用户 ID 不合法");
    }
    return ResponseResult.success("用户信息：" + id);
}
```

## 数据校验

整合 JSR 303/380 Bean Validation（Hibernate Validator 为默认实现），注解式校验字段。

### 实现步骤

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

```java
// 1. DTO 上标注校验规则
public class UserAddDTO {

    @NotBlank(message = "用户名不能为空")
    private String username;

    @Size(min = 6, message = "密码长度不能小于6位")
    private String password;

    @Min(value = 18, message = "年龄不能小于18岁")
    private Integer age;

    @Email(message = "邮箱格式不正确")
    private String email;
}

// 2. Controller 中 @Valid 触发校验，失败抛 MethodArgumentNotValidException
@PostMapping
public ResponseResult<?> addUser(@Valid @RequestBody UserAddDTO dto) {
    return ResponseResult.success("用户添加成功");
}
```

### 常用校验注解

| 注解 | 说明 |
| --- | --- |
| `@NotNull` | 对象属性不能为空 |
| `@NotBlank` | 字符串不能为空（去空格后） |
| `@Size(min, max)` | 限制字符串长度 |
| `@Min` / `@Max` | 数字最小最大值 |
| `@Email` | 邮箱格式 |
| `@Pattern(regexp)` | 正则校验 |
| `@Positive` / `@Negative` | 正数 / 负数 |
| `@Future` / `@Past` | 时间校验 |

### 校验失败的异常类型

| 异常类 | 触发场景 |
| --- | --- |
| `MethodArgumentNotValidException` | `@RequestBody + @Valid` 校验 JSON 请求体 |
| `BindException` | `@ModelAttribute + @Validated` 校验表单 |
| `ConstraintViolationException` | `@RequestParam` / `@PathVariable` + 类上 `@Validated` |

全局处理器统一格式化：

```java
@RestControllerAdvice
public class ValidExceptionHandler {

    // 处理 @RequestBody + @Valid 校验失败
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseResult<?> handleNotValid(MethodArgumentNotValidException ex) {
        String errorMsg = ex.getBindingResult().getFieldErrors().stream()
            .map(err -> err.getField() + ": " + err.getDefaultMessage())
            .collect(Collectors.joining("; "));
        return ResponseResult.fail(ErrorCode.PARAM_ERROR, errorMsg);
    }

    // 处理单个参数校验失败
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseResult<?> handleConstraint(ConstraintViolationException ex) {
        String errorMsg = ex.getConstraintViolations().stream()
            .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
            .collect(Collectors.joining("; "));
        return ResponseResult.fail(ErrorCode.PARAM_ERROR, errorMsg);
    }
}
```

### 自定义校验注解

内置注解不够用时，两步自定义：

```java
// 1. 定义注解，指定校验器
@Documented
@Constraint(validatedBy = PhoneValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface Phone {

    String message() default "手机号格式不正确";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

// 2. 实现校验器
public class PhoneValidator implements ConstraintValidator<Phone, String> {

    private static final String PHONE_REGEX = "^1[3-9]\\d{9}$"; // 中国手机号规则

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return false;
        return value.matches(PHONE_REGEX);
    }
}

// 3. 使用
public class RegisterDTO {
    @Phone(message = "请输入正确的手机号")
    private String phone;
}
```

## 模型分层：Entity / DTO / VO

接口的入参和出参不应直接暴露数据库实体，按用途拆分模型：

| 层级 | 作用 | 示例 |
| --- | --- | --- |
| Entity | 映射数据库表 | `UserEntity`（含 password 等敏感字段） |
| DTO | 接收客户端参数 | `UserAddDTO`、`UserUpdateDTO` |
| VO | 对外返回展示数据 | `UserVO`（只含前端需要的字段） |
| BO（可选） | 业务中间封装 | `UserBO` |

```java
// Entity：含敏感字段，绝不出参
public class UserEntity {
    private Long id;
    private String username;
    private String password; // 敏感字段
    private String email;
}

// VO：只暴露展示字段，不泄露密码和数据库结构
public class UserVO {
    private Long id;
    private String username;
    private String email;
}

// 转换：手动映射或 BeanUtils.copyProperties(entity, vo)
public class UserConverter {
    public static UserVO toVO(UserEntity entity) {
        UserVO vo = new UserVO();
        vo.setId(entity.getId());
        vo.setUsername(entity.getUsername());
        vo.setEmail(entity.getEmail());
        return vo;
    }
}
```

## 接口文档：Swagger / springdoc

自动生成在线接口文档，无需手动维护，支持可视化测试。

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.2.0</version>
</dependency>
```

启动后访问 `http://localhost:8080/swagger-ui/index.html`。

```java
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
              .title("用户管理系统 API 文档")
              .version("1.0")
              .description("SpringBoot + SpringMVC 示例工程"));
    }
}

// 常用注解：@Tag（Controller 分类）、@Operation（接口说明）、
//           @Parameter（参数说明）、@Schema（字段说明）
@Tag(name = "用户接口", description = "用户的增删查改操作")
@RestController
@RequestMapping("/users")
public class UserController {

    @Operation(summary = "根据 ID 获取用户信息")
    @GetMapping("/{id}")
    public ResponseResult<UserVO> getById(
        @Parameter(description = "用户ID", required = true) @PathVariable Long id) {
        return ResponseResult.success(userService.getVOById(id));
    }
}
```

## @JsonFormat 日期格式化

Jackson 注解，控制对象序列化为 JSON 时（尤其是日期字段）的格式与时区。

```java
public class UserVO {

    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private LocalDate birthday;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;
}
```

| 参数 | 说明 |
| --- | --- |
| `pattern` | 日期格式，如 `yyyy-MM-dd HH:mm:ss` |
| `timezone` | 时区，中国用 `GMT+8`，不指定默认 UTC 会差 8 小时 |

大量字段统一格式时走全局配置，字段注解优先级高于全局：

```yaml
spring:
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: GMT+8
```
