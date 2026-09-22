# Java 约定与习惯

*类型：practice ｜ 难度：入门 ｜ 标签：yudao、Java、编码规范、LocalDateTime、异常*

**yudao 项目在 Java 语言层面沉淀了一组约定：时间统一用 `LocalDateTime`、公共 API 必须补齐 Javadoc、错误码用常量接口按模块组织、外部失败转业务异常、排序统一走 `Comparator.comparing`。这些约定本身不复杂，但一致性带来的可读性和可维护性收益巨大。**

## LocalDateTime 使用约定

### 设计背景

Java 8 之前时间处理依赖 `Date`、`Calendar`、`Timestamp`，常见问题：

- 可变对象，线程安全差。
- API 语义混杂，日期、时间、时区边界不清晰。
- 使用体验不一致，例如月份从 0 开始。

Java 8 引入 `java.time`（JSR-310）后，`LocalDateTime` 用于表示不带时区的本地日期时间，具备不可变和线程安全特性。

### 典型场景与类型选择

| 场景 | 推荐类型 | 说明 |
| --- | --- | --- |
| 用户本地输入时间 | `LocalDateTime` | 预约、日程等本地语义时间 |
| 数据库 `DATETIME` 字段 | `LocalDateTime` | 与 MySQL `DATETIME` 语义一致 |
| 业务规则中的本地时间 | `LocalDateTime` | 例如每天 9:00 开门 |
| 全局统一时间点 | `Instant` / `OffsetDateTime` / `ZonedDateTime` | 跨时区系统统一基准时间 |

### Java 与 MySQL 映射

| Java 类型 | MySQL 类型 | 时区语义 | 说明 |
| --- | --- | --- | --- |
| `LocalDateTime` | `DATETIME` | 不带时区 | 最常用业务时间存储方式 |
| `LocalDate` | `DATE` | 不带时区 | 仅日期 |
| `LocalTime` | `TIME` | 不带时区 | 仅时间 |
| `Instant` / `OffsetDateTime` | `TIMESTAMP` | 与会话时区相关 | 适合绝对时间点 |

### 常用 API

```java
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class LocalDateTimeExample {

    public static void main(String[] args) {
        // 1) 获取系统默认时区下的当前本地时间
        LocalDateTime now = LocalDateTime.now();

        // 2) 构造固定时间，适合测试与业务边界验证
        LocalDateTime fixed = LocalDateTime.of(2026, 1, 21, 20, 30, 45);

        // 3) 解析 ISO-8601 标准格式字符串
        LocalDateTime isoParsed = LocalDateTime.parse("2026-01-21T20:30:45");

        // 4) 解析自定义格式字符串，用于接口与数据库文本互转
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        LocalDateTime customParsed = LocalDateTime.parse("2026-01-21 20:30:45", formatter);

        // 5) 格式化输出，保证日志与接口返回格式稳定
        String formatted = now.format(formatter);

        // 6) 时间运算返回新对象，不会修改原对象（不可变特性）
        LocalDateTime tomorrow = now.plusDays(1);
        LocalDateTime oneHourAgo = now.minusHours(1);

        // 7) 比较方法表达业务规则判断
        boolean afterFixed = now.isAfter(fixed);

        // 8) 提取字段
        int year = now.getYear();
        int month = now.getMonthValue();
        int day = now.getDayOfMonth();
        int hour = now.getHour();

        // 9) LocalDate + LocalTime 合并
        LocalDateTime merged = LocalDateTime.of(LocalDate.of(2026, 1, 21), LocalTime.of(8, 30, 0));

        // 10) 显式绑定时区，用于跨时区场景
        ZonedDateTime shanghaiTime = now.atZone(ZoneId.of("Asia/Shanghai"));

        System.out.println(shanghaiTime + " / " + merged + " / " + formatted);
    }
}
```

### 项目建议

- 实体字段映射 MySQL `DATETIME` 时，优先使用 `LocalDateTime`。
- 需要全局统一时刻时，优先使用 `Instant`，避免本地时区歧义。
- 跨服务传输时间时，明确约定格式和时区语义。

## Javadoc 书写约定

### 常用标签

| 标签 | 用途 | 示例 |
| --- | --- | --- |
| `@param` | 参数说明 | `@param id 用户 ID` |
| `@return` | 返回值说明 | `@return 用户对象` |
| `@throws` | 异常说明 | `@throws IllegalArgumentException 参数非法` |
| `@see` | 关联引用 | `@see UserService#findById(long)` |
| `{@link ...}` | 内联链接 | `详见 {@link java.time.LocalDateTime}` |
| `{@code ...}` | 内联代码 | `调用 {@code list.size()}` |
| `@deprecated` | 废弃声明 | `@deprecated 使用新接口` |
| `@since` | 引入版本 | `@since 1.0.0` |
| `@author` | 作者信息 | `@author ren` |
| `@version` | 版本信息 | `@version 1.0` |

### 标准写法示例

```java
/**
 * 用户服务，封装用户查询与创建逻辑。
 * <p>
 * 约定：参数校验失败抛出 {@link IllegalArgumentException}。
 *
 * @author ren
 * @since 1.0.0
 */
public class UserService {

    /**
     * 根据用户 ID 查询用户。
     *
     * @param id 用户 ID，必须大于 0
     * @return 用户对象；不存在时返回 {@code null}
     * @throws IllegalArgumentException 当 id 小于等于 0 时抛出
     * @see #deleteUser(long)
     */
    public User findById(long id) {
        // 参数前置校验，避免无意义的下游调用
        if (id <= 0) {
            throw new IllegalArgumentException("id must be greater than 0");
        }
        // 真实项目应替换为仓储查询
        return null;
    }

    /**
     * 创建用户（旧版接口）。
     *
     * @param name 用户名
     * @return 创建后的用户
     * @deprecated 请使用 {@link #createUser(String, String)} 并补充邮箱参数
     */
    @Deprecated
    public User createUser(String name) {
        // 兼容旧接口，内部可委托新接口实现
        return new User(name);
    }
}
```

### 文档生成命令

```bash
# 扫描源码中的 /** */ 注释并生成 HTML 文档
javadoc -d docs src/com/example/*.java
```

### 项目建议

- 对公共 API 必须补齐 `@param`、`@return`、`@throws`。
- 废弃 API 必须说明替代方案和迁移方向。
- 以“行为契约”描述为主，不写实现细节。

## 错误码常量组织约定

使用接口承载常量，本质是“常量容器”，不是枚举。接口字段默认是 `public static final`：

```java
public interface ErrorCodeConstants {

    // 错误码分段编号（如 1_002_000_000），便于按模块划分与检索
    ErrorCode AUTH_LOGIN_BAD_CREDENTIALS =
            new ErrorCode(1_002_000_000, "登录失败，账号密码不正确");

    ErrorCode AUTH_LOGIN_USER_DISABLED =
            new ErrorCode(1_002_000_001, "登录失败，账号已被禁用");
}
```

与 enum 的对比：

| 维度 | 常量容器（interface / final class） | enum |
| --- | --- | --- |
| 跨模块聚合 | 强 | 一般 |
| 类型约束 | 弱 | 强 |
| 整数错误码管理 | 灵活 | 需额外字段 |
| 与现有错误体系兼容 | 强 | 中 |

推荐写法：

- 不要让业务类 `implements` 常量接口（避免常量渗入子类命名空间）。
- 优先通过 `final class` + `public static final` 定义常量，私有化构造器。
- 按模块分组常量，避免单文件无限膨胀。

```java
public final class ErrorCodes {

    private ErrorCodes() {
        // 工具类不允许实例化
    }

    public static final class Auth {

        private Auth() {
        }

        // 按模块分组，便于维护与检索
        public static final ErrorCode BAD_CREDENTIALS =
                new ErrorCode(1_002_000_000, "登录失败，账号密码不正确");

        public static final ErrorCode USER_DISABLED =
                new ErrorCode(1_002_000_001, "登录失败，账号已被禁用");
    }
}
```

## 无界通配符 `<?>` 约定

`<?>` 表示“具体类型未知但确定存在”的泛型参数：可读（读取结果按 `Object` 处理），不可写（除 `null` 外不能添加元素）。

```java
public class WildcardDemo {

    public static void main(String[] args) {
        List<String> names = Arrays.asList("a", "b");
        List<Integer> ids = Arrays.asList(1, 2);

        // 一个方法同时接受不同元素类型的 List
        printSize(names);
        printSize(ids);

        List<?> unknown = new ArrayList<String>();
        // unknown.add("x"); // 编译错误：类型未知，写入不安全
        unknown.add(null); // 仅允许写入 null
    }

    // 只依赖集合结构，不依赖元素具体类型
    public static void printSize(List<?> list) {
        System.out.println("size=" + list.size());
        // 读取时只能按 Object 处理
        Object first = list.isEmpty() ? null : list.get(0);
        System.out.println("first=" + first);
    }
}
```

适用场景：只读工具方法（统计、判空、遍历）、接口入参对元素类型无关、反射中的 `Class<?>`。

与原始类型对比：`List<?>` 有编译期类型检查、未检查警告少；raw type `List` 两者皆反，不推荐。

## 异常使用约定

| 类型 | 是否强制处理 | 典型场景 |
| --- | --- | --- |
| 受检异常（Checked） | 是 | IO、数据库、网络等外部失败 |
| 非受检异常（Unchecked） | 否 | 参数错误、状态错误、编码缺陷 |

项目实践：

- 外部依赖失败：在基础设施层捕获受检异常并转换为业务异常。
- 参数和状态校验：抛出非受检异常，快速失败。
- 控制器层：统一异常处理，输出标准错误响应。

```java
public class ExceptionDemo {

    public void execute() {
        try {
            // 调用文件或网络 API，可能抛出受检异常
            performIoOperation();
        } catch (IOException e) {
            // 转换为项目统一异常类型，保留根因便于排查
            throw new RuntimeException("I/O operation failed", e);
        }
    }

    private void performIoOperation() throws IOException {
        throw new IOException("disk not available");
    }
}
```

业务异常：继承 `RuntimeException`，语义明确，便于全局异常处理映射状态码。

## Comparator.comparing 排序约定

```java
// 先按年龄升序，再按姓名升序：多字段统一使用 thenComparing 链式表达
people.sort(
        Comparator.comparing(Person::getAge)
                .thenComparing(Person::getName)
);

// 逆序统一在末尾调用 reversed，表达更清晰
people.sort(Comparator.comparing(Person::getAge).reversed());

// 多字段混合方向：先按年龄升序，再按创建时间倒序
people.sort(
        Comparator.comparing(Person::getAge)
                .thenComparing(Person::getCreatedAt, Comparator.reverseOrder())
);
```

空值处理：可空字段必须显式使用 `nullsFirst` 或 `nullsLast`，避免排序时空指针。

```java
// name 可能为 null 时，null 排在最后
people.sort(
        Comparator.comparing(
                Person::getName,
                Comparator.nullsLast(String::compareTo)
        )
);
```

项目建议：

- 多字段排序统一使用 `thenComparing` 链式表达。
- 可空字段必须显式使用 `nullsFirst` 或 `nullsLast`。
- 不可比较字段需要提供自定义比较器。

## Collections 工具类约定

`Collections.singleton(T)` 返回仅包含一个元素的不可变 Set，常用于权限判断等只需单元素集合的场景：

```java
// roles.add("USER") 会抛 UnsupportedOperationException，返回集合不可变
Set<String> roles = Collections.singleton("ADMIN");
```

常用 API 速查：

| 场景 | API |
| --- | --- |
| 单元素不可变集合 | `singleton` / `singletonList` / `singletonMap` |
| 空集合返回 | `emptyList` / `emptySet` / `emptyMap` |
| 排序与重排 | `sort` / `reverse` / `shuffle` / `swap` |
| 不可变视图 | `unmodifiableList` / `unmodifiableSet` / `unmodifiableMap` |
| 同步包装 | `synchronizedList` / `synchronizedSet` / `synchronizedMap` |
| 统计与查找 | `max` / `min` / `frequency` / `binarySearch` |

```java
List<Integer> nums = new ArrayList<>(Arrays.asList(3, 1, 2, 2));

// 排序与反转
Collections.sort(nums);
Collections.reverse(nums);

// 统计元素出现次数
int count = Collections.frequency(nums, 2);

// 二分查找前必须有序
Collections.sort(nums);
int index = Collections.binarySearch(nums, 2);

// 不可变视图：通常先 copy 再包装，原集合不被外部修改
List<Integer> readonly = Collections.unmodifiableList(new ArrayList<>(nums));

// 空集合返回：避免返回 null
List<String> empty = Collections.emptyList();
```

使用注意：

- `unmodifiableXxx` 是视图不可变，原集合仍可变。
- `binarySearch` 之前必须确保集合有序。
- 优先返回空集合，避免返回 `null`。

## 接口 `default` 方法约定

`default` 方法用于在不破坏已有实现类的前提下为接口扩展新能力：

```java
public interface MyInterface {

    // 抽象方法：实现类必须提供实现
    void execute();

    // default 方法：实现类可直接继承，也可覆盖
    default void logStart() {
        System.out.println("start");
    }
}
```

JDK 场景示例：`forEach` 是 `Iterable` 接口的 default 方法，集合实现类可直接使用：

```java
List<String> names = Arrays.asList("A", "B", "C");
names.forEach(System.out::println);
```

多接口冲突处理：两个接口都有同名 default 方法时，必须显式选择调用路径，消除二义性：

```java
class C implements A, B {

    @Override
    public void foo() {
        // 显式指定调用 A 接口的实现
        A.super.foo();
    }
}
```

项目建议：

- `default` 用于行为扩展，不承载共享状态。
- 需要共享字段或构造逻辑时，使用抽象类。
- 接口新增方法时优先考虑 `default` 兼容历史实现。
