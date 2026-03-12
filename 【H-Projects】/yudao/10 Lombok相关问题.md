# 10 Lombok相关问题

## 深入了解 lombok 相关注解的 callSuper 的作用

### 核心概念

`callSuper` 是 Lombok 注解的一个参数，用于控制生成的方法是否调用父类的对应方法。

支持 `callSuper` 参数的注解：

- `@EqualsAndHashCode(callSuper = true/false)`
- `@ToString(callSuper = true/false)`

默认值：`callSuper = false`（不调用父类方法）

### callSuper 在 @EqualsAndHashCode 中的作用

#### callSuper = false（默认）

只比较当前类的字段，忽略父类字段。

```java
// 父类
public class Animal {
    private String name;
    private int age;
}

// 子类
@EqualsAndHashCode  // 默认 callSuper = false
public class Dog extends Animal {
    private String breed;  // 品种
}

// 测试
Dog dog1 = new Dog();
dog1.setName("旺财");
dog1.setAge(3);
dog1.setBreed("金毛");

Dog dog2 = new Dog();
dog2.setName("小黑");  // 名字不同
dog2.setAge(5);        // 年龄不同
dog2.setBreed("金毛");  // 品种相同

// 结果：dog1.equals(dog2) = true
// 原因：只比较了 breed 字段，父类的 name 和 age 被忽略
```

生成的 `equals` 方法（简化版）：

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

#### callSuper = true

同时比较当前类和父类的字段。

```java
@EqualsAndHashCode(callSuper = true)  // 调用父类的 equals
public class Dog extends Animal {
    private String breed;
}

// 测试（同上）
// 结果：dog1.equals(dog2) = false
// 原因：先调用父类 equals 比较 name 和 age，发现不同，直接返回 false
```

生成的 `equals` 方法（简化版）：

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

### callSuper 在 @ToString 中的作用

#### callSuper = false（默认）

只输出当前类的字段。

```java
public class Animal {
    private String name;
    private int age;
}

@ToString  // 默认 callSuper = false
public class Dog extends Animal {
    private String breed;
}

// 测试
Dog dog = new Dog();
dog.setName("旺财");
dog.setAge(3);
dog.setBreed("金毛");

System.out.println(dog);
// 输出：Dog(breed=金毛)
// 父类的 name 和 age 没有输出
```

#### callSuper = true

同时输出父类和当前类的字段。

```java
@ToString(callSuper = true)  // 调用父类的 toString
public class Dog extends Animal {
    private String breed;
}

// 测试（同上）
System.out.println(dog);
// 输出：Dog(super=Animal(name=旺财, age=3), breed=金毛)
```

### 什么时候需要 callSuper = true

| 场景 | 是否需要 callSuper = true |
| --- | --- |
| 子类继承自 `Object` | 不需要（Object 的 equals/toString 没有业务意义） |
| 子类继承自业务父类（有业务字段） | 需要（否则父类字段被忽略） |
| 父类已经正确实现了 equals/toString | 需要（复用父类逻辑） |
| 父类没有实现 equals/toString | 不需要（调用 Object 的默认实现） |

### 常见错误示例

错误：父类有业务字段，但子类没有设置 `callSuper = true`

```java
// 父类：用户基础信息
public class BaseUser {
    private Long id;
    private String username;
}

// 子类：管理员用户
@EqualsAndHashCode  // 错误：没有设置 callSuper = true
public class AdminUser extends BaseUser {
    private String role;
}

// 问题：两个 id 和 username 不同的 AdminUser，只要 role 相同就会被判定为相等
AdminUser admin1 = new AdminUser();
admin1.setId(1L);
admin1.setUsername("admin1");
admin1.setRole("SUPER_ADMIN");

AdminUser admin2 = new AdminUser();
admin2.setId(2L);
admin2.setUsername("admin2");
admin2.setRole("SUPER_ADMIN");

// admin1.equals(admin2) = true（错误！）
```

正确写法：

```java
@EqualsAndHashCode(callSuper = true)  // 正确：包含父类字段
public class AdminUser extends BaseUser {
    private String role;
}

// admin1.equals(admin2) = false（正确）
```

### 最佳实践

- 继承自业务父类时，始终显式设置 `callSuper = true`
- 继承自 `Object` 时，可以省略（默认 false 即可）
- 在团队规范中明确要求：有继承关系的实体类必须显式声明 `callSuper`

## 深入了解 @Data 和 @Getter

### @Data 是什么

`@Data` 是一个组合注解，等价于同时使用以下注解：

```text
@Getter          → 为所有字段生成 getter 方法
@Setter          → 为所有非 final 字段生成 setter 方法
@ToString        → 生成 toString 方法
@EqualsAndHashCode → 生成 equals 和 hashCode 方法
@RequiredArgsConstructor → 为 final 字段和 @NonNull 字段生成构造方法
```

### @Getter 是什么

`@Getter` 只生成 getter 方法，可以标注在类或字段上。

- 标注在类上：为所有字段生成 getter
- 标注在字段上：只为该字段生成 getter

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

    // @ToString 生成
    @Override
    public String toString() {
        return "UserDTO(id=" + id + ", username=" + username + ", role=" + role + ")";
    }

    // @EqualsAndHashCode 生成
    @Override
    public boolean equals(Object o) { ... }

    @Override
    public int hashCode() { ... }
}
```

### @Getter 的字段级控制

```java
public class UserDTO {

    @Getter  // 只为 id 生成 getter
    private Long id;

    // username 没有 getter
    private String username;

    @Getter(AccessLevel.PROTECTED)  // 生成 protected 级别的 getter
    private String password;
}
```

### @Data 的常见问题

#### 问题 1：@Data 不包含全参构造方法

`@Data` 只生成 `@RequiredArgsConstructor`（只包含 `final` 和 `@NonNull` 字段），不生成全参构造方法。

```java
@Data
public class UserDTO {
    private Long id;
    private String username;
}

// 以下代码编译报错：没有全参构造方法
UserDTO user = new UserDTO(1L, "admin");  // 错误！

// 正确写法：需要额外加 @AllArgsConstructor
@Data
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
}
```

#### 问题 2：@Data 与继承

`@Data` 默认生成的 `@EqualsAndHashCode` 是 `callSuper = false`，继承场景下需要显式覆盖：

```java
@Data
@EqualsAndHashCode(callSuper = true)  // 覆盖 @Data 默认的 callSuper = false
public class AdminUser extends BaseUser {
    private String role;
}
```

#### 问题 3：@Data 不适合 JPA 实体类

JPA 实体类使用 `@Data` 会有以下问题：

- `@EqualsAndHashCode` 基于所有字段，而 JPA 实体应该只基于主键比较
- `@ToString` 可能触发懒加载，导致 `LazyInitializationException`

JPA 实体类推荐写法：

```java
@Getter
@Setter
@ToString(exclude = "orders")  // 排除关联集合，避免懒加载
@EqualsAndHashCode(of = "id")  // 只基于主键比较
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

## 深入了解 @EqualsAndHashCode

### 核心概念

`@EqualsAndHashCode` 自动生成 `equals()` 和 `hashCode()` 方法，基于类的字段进行比较和哈希计算。

Java 规范要求：**equals 相等的对象，hashCode 必须相同**。Lombok 保证两者始终一致。

### 常用参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `callSuper` | boolean | false | 是否调用父类的 equals/hashCode |
| `exclude` | String[] | {} | 排除指定字段 |
| `of` | String[] | {} | 只包含指定字段（与 exclude 互斥） |
| `onlyExplicitlyIncluded` | boolean | false | 只包含显式标注 `@EqualsAndHashCode.Include` 的字段 |

### 基本用法

```java
@EqualsAndHashCode
public class UserDTO {
    private Long id;
    private String username;
    private String email;
}

// 生成的 equals 方法（简化版）：
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    UserDTO other = (UserDTO) o;
    // 比较所有字段
    return Objects.equals(id, other.id)
        && Objects.equals(username, other.username)
        && Objects.equals(email, other.email);
}

@Override
public int hashCode() {
    return Objects.hash(id, username, email);
}
```

### exclude：排除指定字段

```java
@EqualsAndHashCode(exclude = {"email", "createTime"})
public class UserDTO {
    private Long id;
    private String username;
    private String email;       // 不参与比较
    private LocalDateTime createTime;  // 不参与比较
}

// 等价于只比较 id 和 username
```

也可以在字段上使用 `@EqualsAndHashCode.Exclude`：

```java
@EqualsAndHashCode
public class UserDTO {
    private Long id;
    private String username;

    @EqualsAndHashCode.Exclude  // 排除该字段
    private String email;

    @EqualsAndHashCode.Exclude  // 排除该字段
    private LocalDateTime createTime;
}
```

### of：只包含指定字段

```java
// 只基于 id 比较（适合实体类）
@EqualsAndHashCode(of = "id")
public class User {
    private Long id;
    private String username;
    private String email;
}

// 基于多个字段
@EqualsAndHashCode(of = {"username", "email"})
public class UserDTO {
    private Long id;
    private String username;
    private String email;
}
```

### 与集合的关系

`hashCode` 决定对象在 `HashMap`/`HashSet` 中的位置。如果对象放入集合后修改了参与 `hashCode` 计算的字段，会导致对象"丢失"：

```java
@EqualsAndHashCode
@Setter
public class UserDTO {
    private Long id;
    private String username;
}

Set<UserDTO> set = new HashSet<>();
UserDTO user = new UserDTO();
user.setId(1L);
user.setUsername("admin");

set.add(user);  // 放入集合，hashCode 基于 id=1, username="admin" 计算

user.setUsername("superadmin");  // 修改字段，hashCode 变了！

// 问题：set.contains(user) = false（找不到了）
// 原因：hashCode 变了，但对象还在原来的桶里
```

解决方案：

```java
// 方案 1：只基于不可变字段（如 id）计算 hashCode
@EqualsAndHashCode(of = "id")
public class UserDTO {
    private Long id;
    private String username;
}

// 方案 2：使用 final 字段
@EqualsAndHashCode
public class UserDTO {
    private final Long id;  // final 字段不可修改
    private String username;
}
```

### 继承场景

```java
// 父类
@EqualsAndHashCode
public class BaseEntity {
    private Long id;
    private LocalDateTime createTime;
}

// 子类：错误写法
@EqualsAndHashCode  // callSuper = false，父类的 id 和 createTime 被忽略
public class User extends BaseEntity {
    private String username;
}

// 子类：正确写法
@EqualsAndHashCode(callSuper = true)  // 包含父类字段
public class User extends BaseEntity {
    private String username;
}
```

### 最佳实践

- 实体类（有主键）：使用 `@EqualsAndHashCode(of = "id")`，只基于主键比较
- DTO/VO：使用默认配置或 `exclude` 排除时间戳等无关字段
- 有继承关系：显式设置 `callSuper = true`
- 避免在可变对象放入 `HashSet`/`HashMap` 后修改参与 hashCode 的字段

## 深入了解 @AllArgsConstructor 和 @NoArgsConstructor

### 核心概念

- `@NoArgsConstructor`：生成无参构造方法
- `@AllArgsConstructor`：生成包含所有字段的全参构造方法

### 基本用法

```java
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
}

// 生成的构造方法：
public class UserDTO {
    private Long id;
    private String username;
    private String email;

    // @NoArgsConstructor 生成
    public UserDTO() {
    }

    // @AllArgsConstructor 生成
    public UserDTO(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }
}
```

### 为什么经常同时使用

很多框架需要无参构造方法：

- Jackson 反序列化：默认通过无参构造创建对象
- JPA/Hibernate：实体类必须有无参构造
- Spring：某些场景下需要无参构造

但手动创建对象时，全参构造更方便：

```java
// 使用全参构造
UserDTO user = new UserDTO(1L, "admin", "admin@example.com");

// 如果只有无参构造，需要逐个 set
UserDTO user = new UserDTO();
user.setId(1L);
user.setUsername("admin");
user.setEmail("admin@example.com");
```

### 与 @Data 的冲突

`@Data` 包含 `@RequiredArgsConstructor`（只为 `final` 和 `@NonNull` 字段生成构造方法），不包含全参构造。

```java
@Data
public class UserDTO {
    private Long id;
    private String username;
}

// 只有无参构造，没有全参构造
UserDTO user = new UserDTO(1L, "admin");  // 编译错误！

// 解决方案：加上 @AllArgsConstructor
@Data
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
}
```

但这样会导致无参构造消失（Java 规则：显式定义构造方法后，编译器不再生成默认无参构造）：

```java
@Data
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
}

// 无参构造消失了
UserDTO user = new UserDTO();  // 编译错误！

// 解决方案：同时加上 @NoArgsConstructor
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
}
```

### 常用参数

#### staticName：生成静态工厂方法

```java
@AllArgsConstructor(staticName = "of")
public class UserDTO {
    private Long id;
    private String username;
}

// 生成的代码：
public class UserDTO {
    private Long id;
    private String username;

    // 构造方法变为 private
    private UserDTO(Long id, String username) {
        this.id = id;
        this.username = username;
    }

    // 生成静态工厂方法
    public static UserDTO of(Long id, String username) {
        return new UserDTO(id, username);
    }
}

// 使用：
UserDTO user = UserDTO.of(1L, "admin");
```

#### access：控制访问级别

```java
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
}

// 生成的无参构造是 protected
protected UserDTO() {
}

// 全参构造是 public
public UserDTO(Long id, String username) {
    this.id = id;
    this.username = username;
}
```

适用场景：JPA 实体类要求无参构造，但不希望外部直接调用：

```java
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // JPA 需要，但外部不可见
@AllArgsConstructor  // 业务代码使用全参构造
@Entity
public class User {
    @Id
    private Long id;
    private String username;
}
```

### final 字段的处理

`@NoArgsConstructor` 无法为 `final` 字段赋值，需要配合 `force = true`：

```java
@NoArgsConstructor(force = true)  // 强制生成，final 字段赋默认值
@AllArgsConstructor
public class UserDTO {
    private final Long id;  // final 字段
    private String username;
}

// 生成的无参构造：
public UserDTO() {
    this.id = null;  // final 字段被赋予默认值（引用类型为 null）
}
```

### 最佳实践

- DTO/VO 类：同时使用 `@NoArgsConstructor` + `@AllArgsConstructor`
- JPA 实体类：`@NoArgsConstructor(access = AccessLevel.PROTECTED)` + `@AllArgsConstructor`
- 不可变对象：只用 `@AllArgsConstructor`，所有字段声明为 `final`
- 配合 `@Builder` 时，通常不需要 `@AllArgsConstructor`（Builder 已经提供了构建方式）

## 深入了解 @ToString

### 核心概念

`@ToString` 自动生成 `toString()` 方法，输出类名和所有字段的值。

### 基本用法

```java
@ToString
public class UserDTO {
    private Long id;
    private String username;
    private String email;
}

// 生成的 toString 方法：
@Override
public String toString() {
    return "UserDTO(id=" + id + ", username=" + username + ", email=" + email + ")";
}

// 输出示例：
UserDTO user = new UserDTO(1L, "admin", "admin@example.com");
System.out.println(user);
// 输出：UserDTO(id=1, username=admin, email=admin@example.com)
```

### 常用参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `callSuper` | boolean | false | 是否包含父类的 toString |
| `exclude` | String[] | {} | 排除指定字段 |
| `of` | String[] | {} | 只包含指定字段 |
| `includeFieldNames` | boolean | true | 是否输出字段名 |
| `doNotUseGetters` | boolean | false | 直接访问字段，不调用 getter |

### exclude：排除敏感字段

```java
@ToString(exclude = {"password", "token"})
public class UserDTO {
    private Long id;
    private String username;
    private String password;  // 不输出
    private String token;     // 不输出
}

// 输出：UserDTO(id=1, username=admin)
```

也可以在字段上使用 `@ToString.Exclude`：

```java
@ToString
public class UserDTO {
    private Long id;
    private String username;

    @ToString.Exclude  // 排除该字段
    private String password;

    @ToString.Exclude  // 排除该字段
    private String token;
}
```

### of：只包含指定字段

```java
@ToString(of = {"id", "username"})
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String phone;
}

// 输出：UserDTO(id=1, username=admin)
```

### includeFieldNames：控制字段名输出

```java
@ToString(includeFieldNames = false)
public class Point {
    private int x;
    private int y;
}

// 输出：Point(10, 20)  而不是 Point(x=10, y=20)
```

### callSuper：包含父类信息

```java
@ToString
public class Animal {
    private String name;
    private int age;
}

@ToString(callSuper = true)
public class Dog extends Animal {
    private String breed;
}

// 测试
Dog dog = new Dog();
dog.setName("旺财");
dog.setAge(3);
dog.setBreed("金毛");

System.out.println(dog);
// 输出：Dog(super=Animal(name=旺财, age=3), breed=金毛)
```

### 常见问题：JPA 懒加载陷阱

JPA 实体类使用 `@ToString` 可能触发懒加载，导致 `LazyInitializationException`：

```java
@ToString  // 危险：会触发懒加载
@Entity
public class User {
    @Id
    private Long id;
    private String username;

    @OneToMany(fetch = FetchType.LAZY)  // 懒加载关联
    private List<Order> orders;
}

// 问题：
User user = userRepository.findById(1L);
System.out.println(user);  // 触发 orders 的懒加载，但 Session 已关闭 → 异常
```

解决方案：排除懒加载字段

```java
@ToString(exclude = "orders")  // 排除懒加载字段
@Entity
public class User {
    @Id
    private Long id;
    private String username;

    @OneToMany(fetch = FetchType.LAZY)
    private List<Order> orders;
}
```

### 常见问题：循环引用

双向关联的实体类会导致 `StackOverflowError`：

```java
@ToString
public class User {
    private Long id;
    private String username;
    private List<Order> orders;  // User → Order
}

@ToString
public class Order {
    private Long id;
    private User user;  // Order → User
}

// 问题：
User user = new User();
Order order = new Order();
user.setOrders(List.of(order));
order.setUser(user);

System.out.println(user);
// User.toString() → Order.toString() → User.toString() → ... 无限递归
```

解决方案：在一方排除关联字段

```java
@ToString(exclude = "orders")  // 排除关联字段
public class User {
    private Long id;
    private String username;
    private List<Order> orders;
}

@ToString
public class Order {
    private Long id;
    private User user;
}
```

### 最佳实践

- 排除敏感字段：密码、token、密钥等
- JPA 实体类：排除懒加载字段和双向关联字段
- 日志输出：确保 `toString` 不会触发副作用（如数据库查询）
- 有继承关系：根据需要设置 `callSuper = true`

## 深入了解 @Builder

### 核心概念

`@Builder` 实现建造者模式，提供链式调用的对象构建方式，代码更优雅、可读性更强。

### 基本用法

```java
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private Integer age;
}

// 生成的代码（简化版）：
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private Integer age;

    // 私有构造方法
    private UserDTO(Long id, String username, String email, Integer age) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.age = age;
    }

    // 静态方法返回 Builder
    public static UserDTOBuilder builder() {
        return new UserDTOBuilder();
    }

    // 内部 Builder 类
    public static class UserDTOBuilder {
        private Long id;
        private String username;
        private String email;
        private Integer age;

        // 链式调用方法
        public UserDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UserDTOBuilder username(String username) {
            this.username = username;
            return this;
        }

        public UserDTOBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserDTOBuilder age(Integer age) {
            this.age = age;
            return this;
        }

        // 构建对象
        public UserDTO build() {
            return new UserDTO(id, username, email, age);
        }
    }
}

// 使用示例：
UserDTO user = UserDTO.builder()
    .id(1L)
    .username("admin")
    .email("admin@example.com")
    .age(25)
    .build();
```

### 与传统方式对比

```java
// 传统方式 1：全参构造（参数顺序容易错）
UserDTO user = new UserDTO(1L, "admin", "admin@example.com", 25);

// 传统方式 2：setter（冗长）
UserDTO user = new UserDTO();
user.setId(1L);
user.setUsername("admin");
user.setEmail("admin@example.com");
user.setAge(25);

// Builder 方式（清晰、可读性强）
UserDTO user = UserDTO.builder()
    .id(1L)
    .username("admin")
    .email("admin@example.com")
    .age(25)
    .build();
```

### @Builder.Default：设置默认值

```java
@Builder
public class UserDTO {
    private Long id;
    private String username;

    @Builder.Default  // 设置默认值
    private String role = "USER";

    @Builder.Default
    private Boolean enabled = true;

    @Builder.Default
    private List<String> tags = new ArrayList<>();
}

// 使用：
UserDTO user1 = UserDTO.builder()
    .id(1L)
    .username("admin")
    .build();
// role = "USER", enabled = true, tags = []（使用默认值）

UserDTO user2 = UserDTO.builder()
    .id(2L)
    .username("guest")
    .role("GUEST")  // 覆盖默认值
    .build();
// role = "GUEST", enabled = true, tags = []
```

### toBuilder：从现有对象创建 Builder

```java
@Builder(toBuilder = true)  // 启用 toBuilder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
}

// 使用：
UserDTO user1 = UserDTO.builder()
    .id(1L)
    .username("admin")
    .email("admin@example.com")
    .build();

// 基于 user1 创建新对象，只修改部分字段
UserDTO user2 = user1.toBuilder()
    .username("superadmin")  // 只修改 username
    .build();
// user2: id=1, username=superadmin, email=admin@example.com
```

### @Builder 与 @Data 的配合

`@Builder` 会生成全参构造方法，导致无参构造消失，影响 Jackson 反序列化：

```java
@Data
@Builder
public class UserDTO {
    private Long id;
    private String username;
}

// 问题：Jackson 反序列化失败（找不到无参构造）
String json = "{\"id\":1,\"username\":\"admin\"}";
UserDTO user = objectMapper.readValue(json, UserDTO.class);  // 异常！
```

解决方案：同时加上 `@NoArgsConstructor` 和 `@AllArgsConstructor`：

```java
@Data
@Builder
@NoArgsConstructor   // Jackson 需要
@AllArgsConstructor  // @Builder 需要
public class UserDTO {
    private Long id;
    private String username;
}
```

### @Builder 在类和构造方法上的区别

标注在类上：为所有字段生成 Builder

```java
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
}
```

标注在构造方法上：只为构造方法的参数生成 Builder

```java
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime createTime;  // 不参与 Builder

    @Builder  // 只为 id、username、email 生成 Builder
    public UserDTO(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.createTime = LocalDateTime.now();  // 自动赋值
    }
}

// 使用：
UserDTO user = UserDTO.builder()
    .id(1L)
    .username("admin")
    .email("admin@example.com")
    .build();
// createTime 自动赋值为当前时间
```

### 集合字段的特殊处理

`@Singular` 注解可以为集合字段生成单个元素添加方法：

```java
@Builder
public class UserDTO {
    private Long id;
    private String username;

    @Singular  // 生成 tag() 方法
    private List<String> tags;

    @Singular("permission")  // 自定义方法名
    private Set<String> permissions;
}

// 使用：
UserDTO user = UserDTO.builder()
    .id(1L)
    .username("admin")
    .tag("VIP")           // 单个添加
    .tag("PREMIUM")       // 单个添加
    .tags(List.of("A", "B"))  // 批量添加
    .permission("READ")   // 单个添加
    .permission("WRITE")  // 单个添加
    .build();
// tags = ["VIP", "PREMIUM", "A", "B"]
// permissions = ["READ", "WRITE"]
```

### 最佳实践

- DTO/VO 类：使用 `@Builder` 提升构建对象的可读性
- 配合 `@Data` 时，记得加上 `@NoArgsConstructor` 和 `@AllArgsConstructor`
- 需要默认值时使用 `@Builder.Default`
- 需要基于现有对象修改时使用 `toBuilder = true`
- 集合字段使用 `@Singular` 提供更灵活的添加方式
- 不可变对象：`@Builder` + 所有字段声明为 `final`
