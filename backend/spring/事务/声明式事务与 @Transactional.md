# 声明式事务与 @Transactional

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Spring、事务、@Transactional、AOP*

**声明式事务把「开启、提交、回滚」这套模板代码从业务逻辑中剥离，基于 AOP 实现：Spring 为标注 `@Transactional` 的方法生成代理对象，在方法前后自动织入事务控制。核心要记三件事：注解加在类上则类中所有方法都纳入事务；默认只回滚 `RuntimeException` 和 `Error`（所以生产上习惯写 `rollbackFor = Exception.class`）；传播行为和隔离级别决定多事务交互时的正确性。另一个高频坑是同类方法自调用不走代理，事务会失效。**

## 基本概念

声明式事务通过配置和注解声明事务，不需要在代码中显式控制事务的开始、提交或回滚。核心基于 **AOP**：Spring 在标注了事务注解的方法上自动添加事务管理逻辑。

实现原理：

- Spring 会为标注 `@Transactional` 的 Bean 生成一个**代理对象**。
- 调用方法时，代理对象在方法执行前开启事务、执行后提交、抛出（默认的）异常时回滚。
- 事务操作被包装成切面，与业务代码完全解耦。

## 启用与基本使用

### 启用事务注解支持

非 Boot 项目需要在配置类上加 `@EnableTransactionManagement`：

```java
@Configuration
@EnableTransactionManagement
public class AppConfig {
    @Bean
    public DataSource dataSource() {
        // 数据源配置
    }

    @Bean
    public PlatformTransactionManager transactionManager() {
        return new DataSourceTransactionManager(dataSource());
    }
}
```

### 注解位置

- 加在**类上**：类中所有方法都被事务管理。
- 加在**方法上**：只有该方法被事务管理。

```java
// 方法级别：只控制单个方法
@Service
public class UserService {

    @Transactional
    public void transferMoney(Long fromAccountId, Long toAccountId, Double amount) {
        // 执行转账操作：扣款 + 加款，要么都成功要么都回滚
    }
}

// 类级别：所有公共方法都纳入事务
@Service
@Transactional
public class OrderService {

    public void createOrder() {
        // 事务方法
    }

    public void cancelOrder() {
        // 也是事务方法
    }
}
```

## 常用属性

### propagation 事务传播行为

定义当前事务方法如何与外部事务交互，最常用两个：

- **`REQUIRED`（默认）**：当前有事务就加入，没有就新建。加入后报错会影响共用的事务。
- **`REQUIRES_NEW`**：挂起当前事务，总是开一个新事务。新事务的回滚不影响外层事务，外层的回滚也不影响已提交的新事务。

```java
// 独立事务：如操作日志，即使主业务回滚，日志也要保留
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void recordLog() {
    // 在独立的新事务中执行
}
```

### isolation 事务隔离级别

控制事务之间的可见性，对应数据库隔离级别：

| 隔离级别 | 效果 |
| --- | --- |
| `READ_UNCOMMITTED` | 最低，可读未提交数据，可能脏读 |
| `READ_COMMITTED` | 只读已提交数据，避免脏读，可能不可重复读 |
| `REPEATABLE_READ` | 事务内重复读取一致，可能幻读 |
| `SERIALIZABLE` | 完全隔离，避免所有并发问题，性能开销大 |

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public void someMethod() {
    // 在事务中读取已提交的数据
}
```

### timeout 事务超时时间

单位秒，超时自动回滚。计时区间是**进入方法到最后一次 DAO 操作结束**，数据库操作之后的代码不计时。

```java
@Transactional(timeout = 30) // 30 秒内未完成则回滚
public void someMethod() {}
```

### rollbackFor 与 noRollbackFor 回滚规则

- 默认只回滚 `RuntimeException` 和 `Error`；`SQLException` 等检查型异常**不会**触发回滚。
- 开发中通常建议「只要报错就回滚」，即指定 `rollbackFor = Exception.class`。

```java
// 指定额外回滚的异常
@Transactional(rollbackFor = SQLException.class)
public void someMethod() throws SQLException {}

// 多个异常 + 排除不回滚的异常
@Transactional(
    rollbackFor = {SQLException.class, MyCustomException.class},
    noRollbackFor = IgnoreException.class
)
public void complexMethod() throws SQLException {}
```

### readOnly 只读事务

告诉 Spring 该事务只做查询，数据库可据此做优化（不加锁等），用于查询方法。

```java
@Transactional(readOnly = true)
public List<User> getUsers() {
    return userMapper.selectAll();
}
```

### value 事务管理器

多数据源场景下指定使用哪个事务管理器，单数据源时 Spring 自动选择。

```java
@Transactional(value = "myTransactionManager")
public void someMethod() {}
```

## 异常回滚的默认行为

- **默认回滚**：`RuntimeException` 及其子类、`Error`。
- **默认不回滚**：检查型异常（如 `SQLException`、`IOException`）。
- 通过 `rollbackFor` 扩大回滚范围，`noRollbackFor` 排除特定异常。

```java
// 推荐写法：显式指定回滚所有异常，避免检查型异常漏回滚
@Transactional(rollbackFor = Exception.class)
public void businessMethod() throws Exception {
    // 任何异常都回滚
}
```

## 事务失效的常见场景

事务基于 AOP 代理实现，凡是「绕过了代理」的调用都会失效：

- **同类方法自调用**：`this.b()` 不经过代理，`b()` 上的 `@Transactional` 不生效。解决：拆分类、或自注入代理对象后调用。
- **方法非 public**：代理只增强 public 方法。
- **异常被 try-catch 吞掉**：代理看不到异常，正常提交。确需捕获时在 catch 中手动 `throw` 或 `TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()`。
- **抛出检查型异常**：默认不回滚，需 `rollbackFor = Exception.class`。
- **类未被 Spring 管理**：对象不是容器中的 Bean，没有代理。

## 总结

- `@Transactional` 通过 AOP 代理在方法前后自动处理事务的开启、提交、回滚，业务代码与事务管理解耦。
- 常用属性：`propagation`（传播行为）、`isolation`（隔离级别）、`timeout`（超时）、`rollbackFor` / `noRollbackFor`（回滚规则）、`readOnly`（只读优化）。
- 默认回滚 `RuntimeException` 和 `Error`；生产实践建议 `rollbackFor = Exception.class`。
- 传播行为决定事务边界如何嵌套：默认 `REQUIRED` 共享事务，`REQUIRES_NEW` 开独立事务。
- 事务失效的根源是绕过代理：自调用、非 public、吞异常、检查型异常未声明。
