# Lombok 相关注解

*类型：practice ｜ 难度：入门 ｜ 标签：yudao、Lombok、@Data、@Builder、@EqualsAndHashCode*

**yudao 大量使用 Lombok 消除样板代码，但有几个高频坑：`@Data` 默认 `callSuper = false` 导致继承场景父类字段被忽略；`@Data` 与 `@Builder`、`@AllArgsConstructor` 组合会让无参构造消失，进而导致 Jackson 反序列化失败；实体类的 equals/hashCode 应只基于主键。掌握「注解组合后的构造方法生成规则」是用好 Lombok 的关键。**

## callSuper 的作用

`callSuper` 是 Lombok 注解的一个参数，用于控制生成的方法是否调用父类的对应方法。支持的注解：`@EqualsAndHashCode(callSuper = ...)`、`@ToString(callSuper = ...)`，默认值都是 `false`（不调用父类方法）。

### @EqualsAndHashCode 中的行为

`callSuper = false`（默认）只比较当前类的字段，忽略父类字段：

```java
// 父类
public class Animal {
    private String name;
    private int age;
}

// 子类：默认 callSuper = false
@EqualsAndHashCode
public class Dog extends Animal {
    private String breed;  // 品种
}

// dog1(name=旺财, age=3, breed=金毛) 与 dog2(name=小黑, age=5, breed=金毛)
// dog1.equals(dog2) = true
// 原因：只比较了 breed 字段，父类的 name 和 age 被忽略
```

生成的 equals 方法（简化版）：

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Dog dog = (Dog) o;
    // 只比较当前类的字段
    return Objects.equals(breed, dog.breed);
}
```

`callSuper = true` 同时比较当前类和父类的字段：

```java
@EqualsAndHashCode(callSuper = true)  // 调用父类的 equals
public class Dog extends Animal {
    private String breed;
}
```

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    // 先调用父类的 equals
    if (!super.equals(o)) return false;
    Dog dog = (Dog) o;
    // 再比较当前类的字段
    return Objects.equals(breed, dog.breed);
}
```

### @ToString 中的行为

- `callSuper = false`：只输出当前类字段，输出 `Dog(breed=金毛)`。
- `callSuper = true`：同时输出父类和当前类字段，输出 `Dog(super=Animal(name=旺财, age=3), breed=金毛)`。

### 什么时候需要 callSuper = true

| 场景 | 是否需要 callSuper = true |
| --- | --- |
| 子类继承自 `Object` | 不需要（Object 的 equals/toString 没有业务意义） |
| 子类继承自业务父类（有业务字段） | 需要（否则父类字段被忽略） |
| 父类已经正确实现了 equals/toString | 需要（复用父类逻辑） |
| 父类没有实现 equals/toString | 不需要（调用 Object 的默认实现） |

典型错误：父类有业务字段但子类没有设置 `callSuper = true`，两个 id 和 username 不同的对象只要子类字段相同就会被判定相等。最佳实践：继承自业务父类时始终显式设置 `callSuper = true`；团队规范中要求有继承关系的实体类必须显式声明 `callSuper`。

## @Data 和 @Getter

### @Data 是什么

`@Data` 是一个组合注解，等价于同时使用：

```text
@Getter                  → 为所有字段生成 getter 方法
@Setter                  → 为所有非 final 字段生成 setter 方法
@ToString                → 生成 toString 方法
@EqualsAndHashCode       → 生成 equals 和 hashCode 方法
@RequiredArgsConstructor  → 为 final 字段和 @NonNull 字段生成构造方法
```

`@Getter` 只生成 getter 方法，可标注在类上（所有字段）或字段上（仅该字段），并可用 `AccessLevel` 控制访问级别。

### 生成代码对比

```java
// 使用 @Data
@Data
public class UserDTO {
    private Long id;
    private String username;
    private final String role;  // final 字段：只有 getter，没有 setter
}

// Lombok 实际生成的代码（等价于）：
public class UserDTO {
    private Long id;
    private String username;
    private final String role;

    // @RequiredArgsConstructor 生成（只包含 final 字段）
    public UserDTO(String role) {
        this.role = role;
    }

    // @Getter 生成
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getRole() { return role; }

    // @Setter 生成（final 字段没有 setter）
    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }

    // @ToString / @EqualsAndHashCode 同理生成
}
```

### @Data 的常见问题

问题 1：`@Data` 不包含全参构造方法。只生成 `@RequiredArgsConstructor`（仅 final 和 `@NonNull` 字段），需要全参构造时额外加 `@AllArgsConstructor`。

问题 2：`@Data` 与继承。默认生成的 `@EqualsAndHashCode` 是 `callSuper = false`，继承场景需要显式覆盖：

```java
@Data
@EqualsAndHashCode(callSuper = true)  // 覆盖 @Data 默认的 callSuper = false
public class AdminUser extends BaseUser {
    private String role;
}
```

问题 3：`@Data` 不适合 JPA 实体类：

- `@EqualsAndHashCode` 基于所有字段，而 JPA 实体应该只基于主键比较。
- `@ToString` 可能触发懒加载，导致 `LazyInitializationException`。

```java
// JPA 实体类推荐写法
@Getter
@Setter
@ToString(exclude = "orders")   // 排除关联集合，避免懒加载
@EqualsAndHashCode(of = "id")   // 只基于主键比较
@Entity
public class User {

    @Id
    private Long id;

    private String username;

    @OneToMany(fetch = FetchType.LAZY)
    private List<Order> orders;
}
```

### 何时用 @Data，何时用 @Getter

| 场景 | 推荐注解 |
| --- | --- |
| DTO / VO / 请求参数类 | `@Data` |
| JPA 实体类 | `@Getter` + `@Setter` + 单独配置 `@EqualsAndHashCode` |
| 只读对象（不需要 setter） | `@Getter` |
| 需要精细控制每个方法 | 分开使用各个注解 |

## @EqualsAndHashCode

`@EqualsAndHashCode` 自动生成 `equals()` 和 `hashCode()` 方法。Java 规范要求 equals 相等的对象 hashCode 必须相同，Lombok 保证两者始终一致。

### 常用参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `callSuper` | boolean | false | 是否调用父类的 equals/hashCode |
| `exclude` | String[] | {} | 排除指定字段 |
| `of` | String[] | {} | 只包含指定字段（与 exclude 互斥） |
| `onlyExplicitlyIncluded` | boolean | false | 只包含显式标注 Include 的字段 |

### exclude 与 of

```java
// 排除指定字段：等价于只比较 id 和 username
@EqualsAndHashCode(exclude = {"email", "createTime"})
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime createTime;
}

// 只基于 id 比较（适合实体类）
@EqualsAndHashCode(of = "id")
public class User {
    private Long id;
    private String username;
    private String email;
}
```

也可以在字段上使用 `@EqualsAndHashCode.Exclude` 注解排除。

### 与集合的关系

hashCode 决定对象在 `HashMap`/`HashSet` 中的位置。对象放入集合后修改参与 hashCode 计算的字段，会导致对象“丢失”：

```java
Set<UserDTO> set = new HashSet<>();
UserDTO user = new UserDTO();
user.setId(1L);
user.setUsername("admin");

set.add(user);  // hashCode 基于 id=1, username="admin" 计算

user.setUsername("superadmin");  // 修改字段，hashCode 变了！

// set.contains(user) = false：hashCode 变了，但对象还在原来的桶里
```

解决方案：只基于不可变字段（如 id）计算 hashCode（`of = "id"`），或使用 final 字段。

### 最佳实践

- 实体类（有主键）：使用 `@EqualsAndHashCode(of = "id")`，只基于主键比较。
- DTO/VO：使用默认配置或 `exclude` 排除时间戳等无关字段。
- 有继承关系：显式设置 `callSuper = true`。
- 避免在可变对象放入 `HashSet`/`HashMap` 后修改参与 hashCode 的字段。

## @AllArgsConstructor 和 @NoArgsConstructor

- `@NoArgsConstructor`：生成无参构造方法。
- `@AllArgsConstructor`：生成包含所有字段的全参构造方法。

### 为什么经常同时使用

很多框架需要无参构造方法：Jackson 反序列化默认通过无参构造创建对象、JPA/Hibernate 实体类必须有无参构造。但手动创建对象时全参构造更方便，不用逐个 set。

### 与 @Data 的冲突

`@Data` 只包含 `@RequiredArgsConstructor`，不包含全参构造。加上 `@AllArgsConstructor` 后又会因 Java 规则（显式定义构造方法后不再生成默认无参构造）导致无参构造消失。所以三者经常一起出现：

```java
@Data
@NoArgsConstructor   // 保证无参构造（Jackson 需要）
@AllArgsConstructor  // 提供全参构造（手动构建方便）
public class UserDTO {
    private Long id;
    private String username;
}
```

### 常用参数

`staticName`：生成静态工厂方法，构造方法变为 private：

```java
@AllArgsConstructor(staticName = "of")
public class UserDTO {
    private Long id;
    private String username;
}

// 使用：UserDTO.of(1L, "admin")
```

`access`：控制访问级别。JPA 实体类要求无参构造但不希望外部直接调用时使用 `PROTECTED`：

```java
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // JPA 需要，但外部不可见
@AllArgsConstructor                                                  // 业务代码使用全参构造
@Entity
public class User {
    @Id
    private Long id;
    private String username;
}
```

`force`：`@NoArgsConstructor` 无法为 final 字段赋值，`force = true` 强制生成并赋默认值（引用类型为 null）。

### 最佳实践

- DTO/VO 类：同时使用 `@NoArgsConstructor` + `@AllArgsConstructor`。
- JPA 实体类：`@NoArgsConstructor(access = AccessLevel.PROTECTED)` + `@AllArgsConstructor`。
- 不可变对象：只用 `@AllArgsConstructor`，所有字段声明为 `final`。
- 配合 `@Builder` 时通常不需要 `@AllArgsConstructor`（Builder 已提供构建方式）。

## @ToString

`@ToString` 自动生成 `toString()` 方法，输出类名和字段值。

### 常用参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `callSuper` | boolean | false | 是否包含父类的 toString |
| `exclude` | String[] | {} | 排除指定字段 |
| `of` | String[] | {} | 只包含指定字段 |
| `includeFieldNames` | boolean | true | 是否输出字段名 |
| `doNotUseGetters` | boolean | false | 直接访问字段，不调用 getter |

```java
// 排除敏感字段：密码不输出到日志
@ToString(exclude = {"password", "token"})
public class UserDTO {
    private Long id;
    private String username;
    private String password;
    private String token;
}

// 只包含指定字段：输出 Point(10, 20)（includeFieldNames = false 时不带字段名）
@ToString(of = {"id", "username"})
```

### 两个经典陷阱

陷阱 1：JPA 懒加载。`@ToString` 输出懒加载关联字段会触发数据库查询，Session 关闭后抛 `LazyInitializationException`。解决：排除懒加载字段（`exclude = "orders"`）。

陷阱 2：循环引用。双向关联的实体类会导致 `StackOverflowError`：

```java
@ToString
public class User {
    private Long id;
    private List<Order> orders;  // User → Order
}

@ToString
public class Order {
    private Long id;
    private User user;  // Order → User，无限递归
}
```

解决：在一方排除关联字段。

### 最佳实践

- 排除敏感字段：密码、token、密钥等。
- JPA 实体类：排除懒加载字段和双向关联字段。
- 日志输出：确保 `toString` 不会触发副作用（如数据库查询）。
- 有继承关系：根据需要设置 `callSuper = true`。

## @Builder

`@Builder` 实现建造者模式，提供链式调用的对象构建方式。

### 基本用法

```java
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private Integer age;
}

// 使用：可读性强，不受参数顺序影响
UserDTO user = UserDTO.builder()
    .id(1L)
    .username("admin")
    .email("admin@example.com")
    .age(25)
    .build();
```

与传统方式对比：全参构造参数顺序容易错，setter 冗长，Builder 清晰可读。

### @Builder.Default 与 toBuilder

```java
@Builder(toBuilder = true)  // 启用 toBuilder
public class UserDTO {
    private Long id;
    private String username;

    @Builder.Default           // 设置默认值
    private String role = "USER";

    @Builder.Default
    private List<String> tags = new ArrayList<>();
}

// 不设置 role 时使用默认值 "USER"，tags 为空列表
UserDTO user1 = UserDTO.builder().id(1L).username("admin").build();

// 基于现有对象创建新对象，只修改部分字段
UserDTO user2 = user1.toBuilder().username("superadmin").build();
```

### @Builder 与 @Data 的配合

`@Builder` 会生成全参构造方法，导致无参构造消失，影响 Jackson 反序列化：

```java
// 错误组合：Jackson 反序列化失败（找不到无参构造）
@Data
@Builder
public class UserDTO { ... }

// 正确组合：同时补上两个构造方法
@Data
@Builder
@NoArgsConstructor   // Jackson 需要
@AllArgsConstructor  // @Builder 需要
public class UserDTO {
    private Long id;
    private String username;
}
```

### 类上与构造方法上的区别

- 标注在类上：为所有字段生成 Builder。
- 标注在构造方法上：只为构造方法的参数生成 Builder，未包含的字段（如 `createTime`）在构造方法内自动赋值。

### @Singular：集合字段

`@Singular` 为集合字段生成单个元素添加方法：

```java
@Builder
public class UserDTO {
    private Long id;
    private String username;

    @Singular                     // 生成 tag() 方法
    private List<String> tags;

    @Singular("permission")       // 自定义方法名
    private Set<String> permissions;
}

// 单个添加与批量添加混用
UserDTO user = UserDTO.builder()
    .id(1L)
    .tag("VIP")
    .tag("PREMIUM")
    .tags(List.of("A", "B"))
    .permission("READ")
    .build();
```

### 最佳实践

- DTO/VO 类：使用 `@Builder` 提升构建对象的可读性。
- 配合 `@Data` 时，记得加上 `@NoArgsConstructor` 和 `@AllArgsConstructor`。
- 需要默认值时使用 `@Builder.Default`；基于现有对象修改时使用 `toBuilder = true`。
- 集合字段使用 `@Singular` 提供更灵活的添加方式。
- 不可变对象：`@Builder` + 所有字段声明为 `final`。
