# AOP 面向切面编程

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Spring AOP、切面、切入点表达式、通知*

**AOP（Aspect-Oriented Programming）把日志、事务、权限等横切关注点从业务逻辑中剥离到切面中，Spring AOP 基于动态代理在方法前后织入这些逻辑，业务代码零侵入。掌握它需要四件事：分清六个核心概念（切面/通知/切点/连接点/目标/代理）、会写 execution 等切入点表达式、用对五种通知类型、用 @Order 控制多切面顺序。注意 @Around 中必须调用 proceed() 并把异常抛出。**

## 核心概念

- **切面（Aspect）**：横切逻辑的模块化载体，通常是一个 `@Aspect` 类，包含通知和切点。
- **通知（Advice）**：切面中定义的具体横切逻辑，指定在什么时机执行（如 `@Before`、`@After`、`@Around`）。
- **切点（Pointcut）**：定义哪些方法需要被拦截的匹配规则，通常用表达式描述。
- **连接点（Joinpoint）**：程序执行的某个点，Spring AOP 中通常是一次方法调用。
- **目标对象（Target Object）**：被代理增强的原始对象。
- **代理（Proxy）**：Spring AOP 为目标对象创建的代理类，拦截所有方法调用并在合适时机执行通知。

## 基本使用步骤

### 1. 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

### 2. 定义目标类

```java
@Service
public class UserService {

    public void addUser(String username) {
        System.out.println("Adding user: " + username);
    }
}
```

### 3. 定义切面类

```java
@Aspect
@Component  // 切面类必须交给 Spring 管理
public class LoggingAspect {

    // 定义切点：匹配 UserService 中的所有方法，通知里直接引用方法名即可复用
    @Pointcut("execution(* com.example.service.UserService.*(..))")
    public void userServiceMethods() {}

    // 前置通知：目标方法执行前执行
    @Before("userServiceMethods()")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("Before method: " + joinPoint.getSignature().getName());
    }

    // 后置通知：目标方法执行后执行（无论是否抛异常）
    @After("userServiceMethods()")
    public void logAfter(JoinPoint joinPoint) {
        System.out.println("After method: " + joinPoint.getSignature().getName());
    }
}
```

### 4. 验证效果

访问 `/addUser?username=John` 时控制台输出：

```text
Before method: addUser
Adding user: John
After method: addUser
```

切面已生效，日志逻辑在 `addUser` 前后被织入，业务类没有任何改动。

## 切入点表达式

基于 AspectJ 语法，描述「哪些方法」需要被拦截。

### execution 表达式

最常用的表达式，匹配方法执行。

```text
execution(访问修饰符 返回值类型 类名.方法名(参数类型))
```

```java
// 匹配所有类的所有方法
@Pointcut("execution(* *.*(..))")

// 匹配 UserService 类中的所有方法
@Pointcut("execution(* com.example.service.UserService.*(..))")

// 匹配 addUser 且返回类型为 void 的方法
@Pointcut("execution(void com.example.service.UserService.addUser(..))")

// 匹配 addUser 且带一个 String 参数的方法
@Pointcut("execution(* com.example.service.UserService.addUser(String))")

// 匹配所有返回类型为 void 的方法
@Pointcut("execution(void *(..))")
```

通配符：`*` 匹配任意返回值/方法名，`..` 匹配任意参数（或任意层级的包）。

### within 表达式

按类或包匹配，范围粒度比 `execution` 粗。

```java
// 匹配 UserService 类中的所有方法
@Pointcut("within(com.example.service.UserService)")

// 匹配 com.example.service 包（含子包，注意两个点）下所有类的方法
@Pointcut("within(com.example.service..*)")
```

### args 表达式

按方法参数类型匹配。

```java
// 匹配参数为一个 String 的方法
@Pointcut("args(String)")

// 匹配第一个参数为 String、后续参数任意的方法
@Pointcut("args(String, ..)")
```

### @annotation 表达式

按方法上的注解匹配。

```java
// 匹配所有带有 @Transactional 注解的方法
@Pointcut("@annotation(org.springframework.transaction.annotation.Transactional)")
public void transactionalMethods() {}
```

### 逻辑运算符

- `&&`：并且；`||`：或者；`!`：非。

```java
// 组合条件：同时满足两个表达式
@Pointcut("execution(* com.example.service.UserService.*(..)) && within(com.example.service.UserService)")

// 排除 delete 开头的方法
@Pointcut("execution(* com.example.service.UserService.*(..)) && !execution(* com.example.service.UserService.delete*(..))")
```

## 五种通知类型

| 通知 | 触发时机 | 典型用途 |
| --- | --- | --- |
| `@Before` | 目标方法执行前 | 日志、权限检查 |
| `@After` | 执行后（无论是否异常） | 资源清理 |
| `@AfterReturning` | 正常返回后（无异常才触发） | 处理返回值 |
| `@AfterThrowing` | 抛出异常后 | 记录/处理异常 |
| `@Around` | 前后都执行，可控制是否执行 | 事务、性能监控、修改返回值 |

```java
// @Before：方法执行前
@Before("execution(* com.example.service.UserService.addUser(..))")
public void logBefore(JoinPoint joinPoint) {
    System.out.println("Before executing method: " + joinPoint.getSignature().getName());
}

// @AfterReturning：returning 指定接收返回值的参数名
@AfterReturning(value = "execution(* com.example.service.UserService.addUser(..))", returning = "result")
public void logReturnValue(JoinPoint joinPoint, Object result) {
    System.out.println("Return value: " + result);
}

// @AfterThrowing：throwing 指定接收异常的参数名
@AfterThrowing(value = "execution(* com.example.service.UserService.addUser(..))", throwing = "exception")
public void logException(JoinPoint joinPoint, Exception exception) {
    System.out.println("Exception: " + exception.getMessage());
}

// @Around：最强大，可控制目标方法是否执行、修改返回值
// 注意：必须调用 proceed()；异常要继续抛出，否则影响其他切面和事务识别
@Around("execution(* com.example.service.UserService.addUser(..))")
public Object aroundMethod(ProceedingJoinPoint joinPoint) throws Throwable {
    System.out.println("Before method execution: " + joinPoint.getSignature().getName());
    Object result = joinPoint.proceed();  // 执行目标方法
    System.out.println("After method execution: " + joinPoint.getSignature().getName());
    return result; // 可修改后返回
}
```

## JoinPoint 连接点信息

通过 `JoinPoint` 可获取目标方法执行的详细信息，是日志与监控的基础。

```java
@Before("execution(* com.example.service.UserService.*(..))")
public void logBefore(JoinPoint joinPoint) {
    // 1. 方法签名：可强转为 MethodSignature 获取更详细信息
    MethodSignature signature = (MethodSignature) joinPoint.getSignature();
    String methodName = signature.getName();                 // 方法名
    Class<?> returnType = signature.getReturnType();         // 返回类型
    Class<?>[] parameterTypes = signature.getParameterTypes(); // 参数类型

    // 2. 方法参数列表
    Object[] args = joinPoint.getArgs();

    // 3. 目标对象（被代理的原始对象）
    Object target = joinPoint.getTarget();

    // 4. 代理对象本身
    Object proxy = joinPoint.getThis();
}
```

`ProceedingJoinPoint` 继承自 `JoinPoint`，额外提供 `proceed()`，**只在 `@Around` 通知中使用**：

```java
@Around("execution(* com.example.service.UserService.addUser(..))")
public Object around(ProceedingJoinPoint pjp) throws Throwable {
    Object[] args = pjp.getArgs();      // 获取方法参数
    Object result = pjp.proceed();      // 执行目标方法
    return result;                      // 返回结果
}
```

## 切面执行顺序与 @Order

多个切面作用于同一方法时，用 `@Order` 控制优先级：**值越小优先级越高**，未指定时默认 `Integer.MAX_VALUE`（最低），同优先级按容器定义顺序执行。

```java
@Aspect
@Order(1) // 高优先级
@Component
public class LoggingAspect {
    @Before("execution(* com.example.service.UserService.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("Logging before method execution.");
    }

    @After("execution(* com.example.service.UserService.*(..))")
    public void logAfter(JoinPoint joinPoint) {
        System.out.println("Logging after method execution.");
    }
}

@Aspect
@Order(2) // 低优先级
@Component
public class SecurityAspect {
    @Before("execution(* com.example.service.UserService.*(..))")
    public void checkSecurityBefore(JoinPoint joinPoint) {
        System.out.println("Checking security before method execution.");
    }

    @After("execution(* com.example.service.UserService.*(..))")
    public void checkSecurityAfter(JoinPoint joinPoint) {
        System.out.println("Checking security after method execution.");
    }
}
```

调用 `addUser` 的实际输出（`@Before` 按优先级正序、`@After` 按优先级逆序执行）：

```text
Logging before method execution.
Checking security before method execution.
Checking security after method execution.
Logging after method execution.
```

注意事项：

- `@Order` 只控制**切面之间**的顺序，不改变单个切面内各通知类型的固定执行次序。
- 优先级相同时按切面在容器中的定义顺序执行。

## 注意事项与最佳实践

- 切面类必须同时标注 `@Aspect` 和 `@Component`（交给 Spring 管理才能被织入）。
- `@Around` 中漏调 `proceed()` 会导致目标方法不执行；吞掉异常会导致事务回滚失效。
- 切点表达式尽量精确（按包/类/注解限定），`execution(* *.*(..))` 拦截所有方法性能开销大。
- Spring AOP 只能拦截**经过代理调用的方法**，同类内部 `this` 方法互调不会被拦截。
- 底层依赖：目标类有接口默认走 JDK 动态代理，无接口走 CGLIB（详见代理机制篇）。
