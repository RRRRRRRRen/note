# 静态代理

> 静态代理是 AOP（面向切面编程）的实现方式之一，与动态代理相对，它在**编译期**就确定代理关系，通过手动编写代理类来实现功能增强。以下是静态代理的核心要点：

## 1. 静态代理的核心原理

静态代理通过以下方式工作：

- **代理类与被代理类实现相同接口**
- **代理类持有被代理对象的引用**
- **在调用目标方法前后插入增强逻辑**

## 2. 静态代理的优缺点

### 优点

- **编译期检查**：代理关系在编译时确定，类型安全
- **性能较高**：无运行时生成代理类的开销
- **直观可控**：代理逻辑清晰可见

### 缺点

- **代码冗余**：每个被代理类都需要手动编写代理类
- **灵活性差**：修改代理逻辑需重新编译代码
- **维护成本高**：接口变更时，代理类也需同步修改

## 3. 与动态代理的对比

| **特性**         | 静态代理                      | 动态代理（如 JDK/CGLIB）          |
|------------------|-----------------------------|---------------------------------|
| **生成时机**     | 编译期                       | 运行时                          |
| **实现方式**     | 手动编写代理类                | 自动生成代理类                   |
| **性能**         | 调用更快（无反射）            | 首次加载稍慢（需生成字节码）      |
| **适用场景**     | 简单固定需求                  | 复杂多变的需求（如 Spring AOP）    |

## 4. 示例

### 场景：为数据库操作添加事务管理

```java
// 1. 定义接口
public interface OrderDao {
    void createOrder();
}

// 2. 目标类
public class OrderDaoImpl implements OrderDao {
    public void createOrder() {
        System.out.println("执行订单入库操作");
    }
}

// 3. 静态代理类（添加事务）
public class OrderDaoProxy implements OrderDao {
    private OrderDao target;

    public OrderDaoProxy(OrderDao target) {
        this.target = target;
    }

    @Override
    public void createOrder() {
        try {
            System.out.println("【代理】开启事务...");
            target.createOrder();
            System.out.println("【代理】提交事务...");
        } catch (Exception e) {
            System.out.println("【代理】回滚事务！");
            throw e;
        }
    }
}

// 4. 使用代理
public class Main {
    public static void main(String[] args) {
        OrderDao realDao = new OrderDaoImpl();
        OrderDao proxyDao = new OrderDaoProxy(realDao);  // 创建代理
        proxyDao.createOrder();
    }
}
```

**输出结果**：

```
【代理】开启事务...
执行订单入库操作
【代理】提交事务...
```

---

# 动态代理

> 动态代理是 Spring AOP 的核心实现机制，与静态代理不同，它在**运行时动态生成代理类**，无需手动编写代理代码。以下是动态代理的深度解析：

## 1. 动态代理的两种实现方式

Spring AOP 支持两种动态代理技术，根据目标类特性自动选择：

| 代理类型         | 实现方式                      | 目标类要求  | 性能特点     | 代理类命名规则                             |
| ------------ | ------------------------- | ------ | -------- | ----------------------------------- |
| **JDK 动态代理** | `java.lang.reflect.Proxy` | 必须实现接口 | 调用快，生成慢  | `$Proxy0`、`$Proxy1`...              |
| **CGLIB 代理** | ASM 字节码操作                 | 可代理普通类 | 生成快，调用稍慢 | `TargetClass$$EnhancerByCGLIB$$...` |

## 2. JDK 动态代理原理

### 2.1 核心流程

```java
// 1. 定义接口
public interface UserService {
    void saveUser();
}

// 2. 实现类（被代理目标）
public class UserServiceImpl implements UserService {
    public void saveUser() {
        System.out.println("保存用户数据...");
    }
}

// 3. 调用处理器
public class JdkProxyHandler implements InvocationHandler {
    private Object target;  // 目标对象

    public JdkProxyHandler(Object target) {
        this.target = target;
    }

    // 4. 代理逻辑入口
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("[JDK代理] 前置处理");
        Object result = method.invoke(target, args);  // 反射调用目标方法
        System.out.println("[JDK代理] 后置处理");
        return result;
    }
}

// 5. 使用代理
public class Main {
    public static void main(String[] args) {
        UserService target = new UserServiceImpl();
        UserService proxy = (UserService) Proxy.newProxyInstance(
            target.getClass().getClassLoader(),
            target.getClass().getInterfaces(),  // 关键：获取接口数组
            new JdkProxyHandler(target)
        );
        proxy.saveUser();  // 调用代理方法
    }
}
```

### 2.2 输出结果

```
[JDK代理] 前置处理
保存用户数据...
[JDK代理] 后置处理
```

### 2.3 底层实现关键

- 通过 `ProxyGenerator` 动态生成 `$ProxyN` 类字节码
- 代理类继承 `Proxy` 并实现目标接口
- 方法调用转发给 `InvocationHandler.invoke()`

## 3. CGLIB 动态代理原理

### **3.1 核心流程**

```java
// 1. 目标类（无需实现接口）
public class OrderService {
    public void createOrder() {
        System.out.println("创建订单...");
    }
}

// 2. 方法拦截器
public class CglibInterceptor implements MethodInterceptor {
    @Override
    public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
        System.out.println("[CGLIB代理] 前置处理");
        Object result = proxy.invokeSuper(obj, args);  // 调用父类（目标类）方法
        System.out.println("[CGLIB代理] 后置处理");
        return result;
    }
}

// 3. 使用代理
public class Main {
    public static void main(String[] args) {
        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(OrderService.class);  // 设置目标类
        enhancer.setCallback(new CglibInterceptor());
        OrderService proxy = (OrderService) enhancer.create();  // 创建代理实例
        proxy.createOrder();
    }
}
```

### 3.2 输出结果

```
[CGLIB代理] 前置处理
创建订单...
[CGLIB代理] 后置处理
```

### 3.3 底层实现关键

- 通过 ASM 库直接生成目标类的子类字节码
- 重写父类方法，加入拦截逻辑
- 默认使用 `FastClass` 机制避免反射调用开销

## 4. Spring 如何选择代理方式？

Spring AOP 的代理选择逻辑（见 `DefaultAopProxyFactory`）：

```java
public AopProxy createAopProxy(AdvisedSupport config) {
    if (config.isOptimize() || config.isProxyTargetClass() || hasNoUserSuppliedProxyInterfaces(config)) {
        return new ObjenesisCglibAopProxy(config);  // 使用CGLIB
    } else {
        return new JdkDynamicAopProxy(config);      // 使用JDK代理
    }
}
```

**决策条件**：
1. 目标类未实现接口 → **强制 CGLIB**
2. 设置 `proxyTargetClass=true` → **强制 CGLIB**
3. 其他情况 → **优先 JDK 动态代理**

## 5. 动态代理的性能对比

| **维度**       | JDK 动态代理               | CGLIB                     |
|----------------|--------------------------|--------------------------|
| **生成速度**    | 慢（需生成新类）           | 快（直接修改字节码）       |
| **调用性能**    | 快（直接调用接口方法）      | 稍慢（需方法拦截）         |
| **首次加载**    | 较慢                      | 较快                     |
| **内存占用**    | 低                        | 较高（生成更多类）         |

**优化建议**：对频繁创建的代理对象，考虑缓存代理实例。

## 6. 动态代理的典型应用场景

### 6.1 Spring AOP 实现

```java
@Aspect
@Component
public class LogAspect {
    @Before("execution(* com.example.service.*.*(..))")
    public void logBefore(JoinPoint jp) {
        System.out.println("方法调用: " + jp.getSignature());
    }
}
```

### 6.2 Spring 事务管理

```java
@Transactional
public void transferMoney(Account from, Account to, double amount) {
    // 事务方法
}
```

### 6.3 MyBatis Mapper 接口代理

```java
// Mapper 接口无需实现类
UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
```

## 7. 动态代理的局限性

1. **JDK 代理的接口依赖**
   - 无法代理没有接口的类
2. **CGLIB 的 final 限制**
   - 无法代理 final 类/方法
3. **自我调用问题**

   ```java
   public class UserService {
       public void a() {
           this.b();  // 此调用不会被AOP拦截！
       }
       public void b() { ... }
   }
   ```

## 8. 动态代理 vs 静态代理

| **对比维度**     | 动态代理                          | 静态代理                  |
|----------------|----------------------------------|-------------------------|
| **生成时机**    | 运行时                            | 编译期                   |
| **代码侵入性**  | 无侵入（自动生成）                | 需手动编写代理类          |
| **灵活性**      | 高（支持动态添加逻辑）            | 低（逻辑固定）            |
| **性能**        | 首次加载稍慢                      | 调用更快                 |
| **适用场景**    | 框架级 AOP、复杂系统               | 简单代理、教学演示        |

## 9. 最佳实践建议

- **优先使用 Spring AOP 声明式代理**（`@Aspect`）
- **需要代理非接口方法时**：

```properties
spring.aop.proxy-target-class=true  # 强制使用CGLIB
```

- **性能敏感场景**：
   - 缓存代理对象
   - 避免在频繁调用的方法上使用复杂切面

---

# Spring AOP 基本使用

## 1. 什么是 AOP？

**AOP（Aspect-Oriented Programming，面向切面编程）** 是一种编程范式，旨在将程序中的横切关注点（例如：日志记录、事务管理、安全检查等）从业务逻辑中分离出来。Spring AOP 是 Spring 框架的一部分，它允许我们以声明式的方式将横切逻辑应用到目标方法上，而不需要修改目标方法的代码。

## 2. Spring AOP 主要概念

- **切面（Aspect）**：一个横切逻辑的模块，通常是一个类。切面包含了通知和切点。
- **通知（Advice）**：切面中定义的具体横切逻辑，它定义了什么时候（如方法执行前后）执行横切功能。常见的通知有 `@Before`、`@After`、`@Around` 等。
- **切点（Pointcut）**：定义了哪些方法需要应用通知的规则。它通常通过表达式来描述目标方法的匹配条件。
- **连接点（Joinpoint）**：程序执行的某个点，通常是方法的调用。AOP 通常在方法调用的前后或异常时执行切面逻辑。
- **目标对象（Target Object）**：被代理的对象，也就是你在 AOP 中希望增强的原始对象。
- **代理（Proxy）**：Spring AOP 会为目标对象创建代理类，代理类会拦截对目标对象的所有方法调用，并在合适的时机执行通知逻辑。

## 3. Spring AOP 基本使用

Spring AOP 是基于代理模式的，因此你需要配置一个切面类，指定通知（Advice）和切点（Pointcut）。然后通过 Spring 配置来启用 AOP。

### 步骤 1：添加依赖

首先，你需要确保 Spring AOP 的相关依赖已经添加到项目中。以 **Spring Boot** 为例，通常你只需要以下依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

### 步骤 2：定义目标类

假设我们有一个服务类 `UserService`，它有一个方法 `addUser`，我们想对这个方法进行日志记录。

```java
@Service
public class UserService {

    public void addUser(String username) {
        System.out.println("Adding user: " + username);
    }
}
```

### 步骤 3：定义切面类

接下来，我们定义一个切面类，用于执行横切逻辑，比如日志记录。切面类包含了通知（`@Before`、`@After` 等）和切点（`@Pointcut`）。

```java
@Aspect
@Component  // 切面类需要交给 Spring 管理
public class LoggingAspect {

    // 定义切点：匹配 UserService 中的所有方法
    @Pointcut("execution(* com.example.service.UserService.*(..))")
    public void userServiceMethods() {}

    // @Before 通知：在目标方法执行前执行
    @Before("userServiceMethods()")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("Before method: " + joinPoint.getSignature().getName());
    }

    // @After 通知：在目标方法执行后执行
    @After("userServiceMethods()")
    public void logAfter(JoinPoint joinPoint) {
        System.out.println("After method: " + joinPoint.getSignature().getName());
    }
}
```

### 步骤 4：测试

现在，我们可以测试一下。我们创建一个简单的 `Spring Boot` 控制器，调用 `UserService` 中的方法：

```java
@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/addUser")
    public String addUser(String username) {
        userService.addUser(username);
        return "User added!";
    }
}
```

### 步骤 6：运行结果

当我们访问 `/addUser?username=John` 这个接口时，控制台会输出：

```
Before method: addUser
Adding user: John
After method: addUser
```

这证明了我们的切面（LoggingAspect）已经生效，日志记录功能在 `addUser` 方法前后被正确执行了。

---

# Spring 切入点表达式

> **切入点表达式** 是 Spring AOP 中用于描述“哪些方法”需要被拦截的规则。Spring AOP 通过切入点表达式来决定哪些方法符合条件，并且可以在这些方法的前后或其他特定时机执行横切逻辑（如日志记录、事务管理等）。
>
> 切入点表达式是基于 **AspectJ** 语法的，能够灵活地匹配目标方法，支持使用多种模式来定义切点。

## 1. `execution` 表达式

`execution` 是 Spring AOP 中最常用的切入点表达式，它用于匹配方法的执行。

### 基本格式

```java
execution(访问修饰符 返回值类型 类名.方法名(参数类型))
```

- **返回值类型**：可以是具体类型或 `*`（表示任意类型）。
- **方法名**：可以是具体的方法名或 `*`（表示任意方法）。
- **参数类型**：可以是具体的参数类型或 `..`（表示任意参数）。

### 示例

1. **匹配所有方法**：

    ```java
    // 这个表达式匹配所有类的所有方法。
    
    @Pointcut("execution(* *.*(..))")
    public void allMethods() {}
    ```

2. **匹配某个类的所有方法**：

    ```java
    // 这个表达式匹配 `com.example.service.UserService` 类中的所有方法。
    
    @Pointcut("execution(* com.example.service.UserService.*(..))")
    public void userServiceMethods() {}
    ```

3. **匹配特定方法**：

    ```java
    // 这个表达式匹配 `com.example.service.UserService` 类中名为 `addUser` 且返回类型为 `void` 的方法。
    
    @Pointcut("execution(void com.example.service.UserService.addUser(..))")
    public void addUserMethod() {}
    ```

4. **匹配带有特定参数的方法**：

    ```java
    // 这个表达式匹配 `com.example.service.UserService` 类中名为 `addUser` 且有一个 `String` 类型参数的方法。
    
    @Pointcut("execution(* com.example.service.UserService.addUser(String))")
    public void addUserWithStringParam() {}
    ```

5. **匹配任何返回类型为 `void` 的方法**：

    ```java
    @Pointcut("execution(void *(..))")
    public void voidMethods() {}
    ```

## 2. `within` 表达式

`within` 用于匹配特定类或包内的方法。它匹配的范围可以是一个类、一个包或一个类的子类。

### 基本格式

```java
within(类名或包名)
```

### 示例

1. **匹配特定类的所有方法**：

    ```java
    // 这个表达式匹配 `UserService` 类中的所有方法。
    
    @Pointcut("within(com.example.service.UserService)")
    public void userServiceMethods() {}
    ```

2. **匹配某个包下的所有类的方法**：

    ```java
    // 这个表达式匹配 `com.example.service` 包下的所有类中的方法。
    
    @Pointcut("within(com.example.service..*)")
    public void servicePackageMethods() {}
    ```

## 3. `args` 表达式

`args` 用于匹配特定参数类型的方法，可以帮助我们定义切入点仅在方法有特定参数时才执行。

### 基本格式

```java
args(参数类型)
```

### 示例

1. **匹配方法参数为 `String` 类型的方法**：

    ```java
    // 这个表达式匹配所有参数为 `String` 类型的方法。
    
    @Pointcut("args(String)")
    public void stringArgumentsMethods() {}
    ```

2. **匹配方法参数包含特定类型**：

    ```java
    // 这个表达式匹配第一个参数为 `String` 类型，后续参数可以为任意类型的方法。
    
    @Pointcut("args(String, ..)")
    public void stringFirstArgumentMethods() {}
    ```

## 4. `@annotation` 表达式

`@annotation` 用于匹配带有特定注解的方法。如果目标方法被指定的注解标记，则匹配该方法。

### 基本格式

```java
@annotation(注解类型)
```

### 示例

1. **匹配带有 `@Transactional` 注解的方法**：

    ```java
    // 这个表达式匹配所有带有 `@Transactional` 注解的方法。
    @Pointcut("@annotation(org.springframework.transaction.annotation.Transactional)")
    public void transactionalMethods() {}
    ```

## 5. 逻辑运算符

切入点表达式还支持逻辑运算符，可以将多个切入点组合起来：

### 基本格式

- **&&**：表示“并且”。
- **||**：表示“或者”。
- **!**：表示“非”。

### 示例

1. **同时匹配两个条件**：

    ```java
    // 这个表达式表示同时匹配 `com.example.service.UserService` 类中的方法，且符合 `execution` 条件。
    
    @Pointcut("execution(* com.example.service.UserService.*(..)) && within(com.example.service.UserService)")
    public void userServiceMethods() {}
    ```

2. **排除某些方法**：

    ```java
    // 这个表达式表示匹配 `com.example.service.UserService` 类中的所有方法，排除以 `delete` 开头的方法。
    
    @Pointcut("execution(* com.example.service.UserService.*(..)) && !execution(* com.example.service.UserService.delete*(..))")
    public void userServiceMethodsExceptDelete() {}
    ```

---

# Spring AOP 通知方法 与 @PointCut 注解

> Spring AOP 中的 **通知（Advice）** 是定义横切逻辑的地方，它指定了在什么时机执行某些操作。Spring Aop 提供了几种类型的通知，分别在目标方法的不同执行阶段被触发。常见的通知有 `@Before`、`@After`、`@AfterReturning`、`@AfterThrowing` 和 `@Around`。

## 1. Spring AOP 通知的种类

### 1.1 `@Before` 通知

`@Before` 通知在目标方法执行 **之前** 执行。它用于在方法执行前添加一些逻辑，比如日志记录、权限检查等。

- **用途**：在目标方法执行前执行一些前置逻辑。
- **触发时机**：目标方法执行之前。

```java
@Before("execution(* com.example.service.UserService.addUser(..))")
public void logBefore(JoinPoint joinPoint) {
    System.out.println("Before executing method: " + joinPoint.getSignature().getName());
}
```

### 1.2 `@After` 通知

`@After` 通知在目标方法执行 **之后** 执行，无论目标方法是否抛出异常，它都会被执行。`@After` 通知适用于一些通用操作，如清理资源等。

- **用途**：无论目标方法是否成功执行，都会执行的后置逻辑。
- **触发时机**：目标方法执行后（不考虑方法是否抛出异常）。

```java
@After("execution(* com.example.service.UserService.addUser(..))")
public void logAfter(JoinPoint joinPoint) {
    System.out.println("After executing method: " + joinPoint.getSignature().getName());
}
```

### 1.3 `@AfterReturning` 通知

`@AfterReturning` 通知在目标方法 **正常返回** 之后执行，也就是说只有当目标方法没有抛出异常时，才会触发该通知。它常用于获取方法的返回值，进行一些后置处理。

- **用途**：目标方法成功返回后，执行逻辑。
- **触发时机**：目标方法成功执行后（没有异常抛出）。

```java
@AfterReturning(value = "execution(* com.example.service.UserService.addUser(..))", returning = "result")
public void logReturnValue(JoinPoint joinPoint, Object result) {
    System.out.println("After method returns: " + joinPoint.getSignature().getName() + ", Return value: " + result);
}
```

在这个例子中，`returning = "result"` 指定了接收目标方法返回值的参数名。你可以使用它来处理目标方法的返回值。

### 1.4 `@AfterThrowing` 通知

`@AfterThrowing` 通知在目标方法抛出异常后执行。它允许我们捕获异常并进行相应的处理，例如记录日志、处理特定异常等。

- **用途**：处理方法执行过程中抛出的异常。
- **触发时机**：目标方法抛出异常后。

```java
@AfterThrowing(value = "execution(* com.example.service.UserService.addUser(..))", throwing = "exception")
public void logException(JoinPoint joinPoint, Exception exception) {
    System.out.println("Exception thrown by method: " + joinPoint.getSignature().getName() + ", Exception: " + exception.getMessage());
}
```

在这个例子中，`throwing = "exception"` 表示接收目标方法抛出的异常对象，方便在通知方法中处理或记录异常。

### 1.5 `@Around` 通知

`@Around` 通知是最强大的通知类型，因为它能够在目标方法执行前后都进行处理，而且它可以控制目标方法是否执行。`@Around` 通知可以修改目标方法的返回值，或者决定是否执行目标方法（通过 `ProceedingJoinPoint.proceed()`）。

- **用途**：在目标方法执行前后都能执行的逻辑，并且可以控制目标方法的执行。
- **触发时机**：目标方法执行前后。
- **异常处理**：环绕通知需要将异常抛出，以免影响其他切面识别异常

```java
@Around("execution(* com.example.service.UserService.addUser(..))")
public Object aroundMethod(ProceedingJoinPoint joinPoint) throws Throwable {
    System.out.println("Before method execution: " + joinPoint.getSignature().getName());
    Object result = joinPoint.proceed();  // 执行目标方法
    System.out.println("After method execution: " + joinPoint.getSignature().getName());
    return result;
}
```

在这个例子中，`ProceedingJoinPoint.proceed()` 方法执行了目标方法并返回结果。如果你希望修改返回值，可以在目标方法执行后改变 `result` 的值。`@Around` 通知提供了对目标方法最细粒度的控制。

## 2. 通知与切点的结合

通知通常与 **切点（Pointcut）** 配合使用，切点用于指定哪些方法会触发通知。你可以在通知方法的注解中指定切点表达式，或者通过 `@Pointcut` 注解提前定义好切点，通知方法引用切点。

### 2.1 使用 `@Pointcut` 定义切点

```java
@Aspect
@Component
public class LoggingAspect {

    // 定义一个切点，匹配 UserService 中的所有方法
    @Pointcut("execution(* com.example.service.UserService.*(..))")
    public void userServiceMethods() {}

    // 在切点上应用通知
    @Before("userServiceMethods()")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("Before executing method: " + joinPoint.getSignature().getName());
    }
}
```

在上面的代码中，`@Pointcut` 定义了 `userServiceMethods()` 切点，`@Before("userServiceMethods()")` 通知使用该切点。

---

# Spring 切面执行顺序 与 @Order

> 在 Spring AOP 中，切面（Aspect）的执行顺序是由多个因素决定的，其中最重要的因素之一是 **`@Order` 注解**。切面在 Spring AOP 中执行的顺序是基于切面创建的顺序，但可以通过 `@Order` 注解来控制切面的优先级。

## 1. 切面执行顺序

在 Spring AOP 中，多个切面（Aspect）可以同时应用到同一个方法。Spring 默认会按以下顺序执行这些切面：

1. **切面顺序：** Spring AOP 在应用切面时，通常按 **定义顺序** 执行切面。如果你没有指定执行顺序，那么切面会按照定义的顺序执行，切面顺序是由 Spring 容器加载时的顺序决定的。
2. **`@Order` 注解：** 你可以使用 `@Order` 注解来显式地指定多个切面执行的优先级。`@Order` 注解的值越小，优先级越高。这样就能够控制多个切面之间的执行顺序。

## 2. `@Order` 注解

`@Order` 注解是 Spring AOP 中控制切面执行顺序的重要手段。`@Order` 可以作用在切面类上，指定该切面相对于其他切面的优先级。

- **优先级**：`@Order` 的值越小，切面的优先级越高。也就是说，值为 `1` 的切面优先于值为 `2` 的切面执行。
- **默认顺序**：如果没有给切面指定 `@Order` 注解，Spring 会使用默认的优先级，这个优先级是 `Integer.MAX_VALUE`（即最大的整数，表示最低优先级）。如果多个切面没有指定优先级，Spring 会按照它们定义的顺序来执行。

**示例**

假设我们有两个切面：`LoggingAspect` 和 `SecurityAspect`，我们希望控制它们的执行顺序。

```java
@Aspect
@Order(1) // 高优先级
@Component
public class LoggingAspect {

    @Before("execution(* com.example.service.UserService.*(..))")
    public void logBefore(JoinPoint joinPoint) {
        System.out.println("Logging before method execution.");
    }
}
```

```java
@Aspect
@Order(2) // 低优先级
@Component
public class SecurityAspect {

    @Before("execution(* com.example.service.UserService.*(..))")
    public void checkSecurity(JoinPoint joinPoint) {
        System.out.println("Checking security before method execution.");
    }
}
```

在这个例子中：

- `LoggingAspect` 的优先级为 `1`，即它会优先于 `SecurityAspect` 执行。
- `SecurityAspect` 的优先级为 `2`，它会在 `LoggingAspect` 之后执行。

当目标方法被调用时，控制台输出将是：

```
Logging before method execution.
Checking security before method execution.
```

## 3. 切面顺序与通知执行顺序

切面的顺序不仅影响切面的执行顺序，还影响其中通知的执行顺序。具体来说：

- **`@Before` 通知**：多个切面的 `@Before` 通知会按照 **切面优先级的顺序** 依次执行（优先级低的切面通知会先执行）。
- **`@After` 和 `@AfterReturning` 通知**：多个切面的 `@After` 和 `@AfterReturning` 通知会按照 **逆序** 执行（优先级高的切面通知会先执行）。
- **`@Around` 通知**：`@Around` 通知的执行顺序也受切面优先级的影响，优先级高的 `@Around` 通知会先执行，并且它可以控制目标方法是否被执行。

**示例：`@Before` 和 `@After` 通知的顺序**

假设我们有两个切面，分别是 `LoggingAspect` 和 `SecurityAspect`，并且它们都包含 `@Before` 和 `@After` 通知：

```java
@Aspect
@Order(1)
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
```

```java
@Aspect
@Order(2)
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

如果 `UserService` 中有一个方法 `addUser`，我们调用它时，控制台输出将会是：

```
Logging before method execution.
Checking security before method execution.
Checking security after method execution.
Logging after method execution.
```

## 4. 注意事项

- **`@Order` 只影响切面的执行顺序**：它只控制切面类的执行顺序，而不控制通知（Advice）本身的执行顺序。`@Order` 只适用于切面类。
- **切面通知的执行顺序**：Spring AOP 会在不同的通知类型之间按固定顺序执行。`@Before` 通知会在目标方法执行之前执行，而 `@After` 和 `@AfterReturning` 通知会在目标方法执行之后执行。
- **优先级冲突**：如果多个切面有相同的优先级（`@Order` 值相同），Spring 会按照它们在容器中的定义顺序执行。

---

# JoinPoint 连接点信息

> 在 Spring AOP 中，`JoinPoint` 是一个非常重要的接口，它提供了对目标方法的执行过程的详细信息。通过 `JoinPoint`，你可以访问关于当前方法执行的各种信息，包括方法签名、方法参数、目标对象等。这些信息对于日志记录、性能监控、事务处理等横切逻辑非常有用。

## 1. `JoinPoint` 接口主要方法

### 1.1 `getSignature()`

```java
Signature getSignature();
```

这个方法返回一个 `Signature` 对象，它可以是 `MethodSignature` 或 `ConstructorSignature`，具体取决于连接点类型。在方法连接点中，它通常返回 `MethodSignature`，通过它可以获取方法的名称、返回类型和参数类型等信息。

```java
@Before("execution(* com.example.service.UserService.*(..))")
public void logBefore(JoinPoint joinPoint) {
    MethodSignature signature = (MethodSignature) joinPoint.getSignature();
    String methodName = signature.getName();  // 获取方法名称
    Class<?> returnType = signature.getReturnType();  // 获取返回类型
    Class<?>[] parameterTypes = signature.getParameterTypes();  // 获取参数类型
}
```

### 1.2 `getArgs()`

```java
Object[] getArgs();
```

`getArgs()` 返回目标方法的参数列表。通过这个方法，你可以获取到目标方法的所有参数，并进行相应的处理（比如日志记录、权限验证等）。

```java
@Before("execution(* com.example.service.UserService.addUser(..))")
public void logBefore(JoinPoint joinPoint) {
    Object[] args = joinPoint.getArgs();
    for (Object arg : args) {
        System.out.println("Argument: " + arg);
    }
}
```

### 1.3 `getTarget()`

```java
Object getTarget();
```

`getTarget()` 方法返回连接点的目标对象，即你正在调用的实际对象。对于代理对象（如 JDK 动态代理或 CGLIB 代理），它返回的是被代理的实际对象。

```java
@Before("execution(* com.example.service.UserService.addUser(..))")
public void logBefore(JoinPoint joinPoint) {
    Object target = joinPoint.getTarget();
    System.out.println("Target object: " + target);
}
```

### 1.4 `getThis()`

```java
Object getThis();
```

`getThis()` 方法返回当前代理对象。在 Spring AOP 中，代理对象通常是通过 JDK 动态代理或者 CGLIB 代理生成的，因此你可以通过这个方法来获取代理对象。

```java
@Before("execution(* com.example.service.UserService.addUser(..))")
public void logBefore(JoinPoint joinPoint) {
    Object proxy = joinPoint.getThis();
    System.out.println("Proxy object: " + proxy);
}
```

## 2. `ProceedingJoinPoint`

在 Spring AOP 中，除了 `JoinPoint`，还有一个类似的接口叫做 **`ProceedingJoinPoint`**，它继承自 `JoinPoint`，并且提供了一个 `proceed()` 方法。

`ProceedingJoinPoint` 只在 `@Around` 通知中使用，它允许你在通知方法中执行目标方法，并返回结果。

**示例**

```java
@Around("execution(* com.example.service.UserService.addUser(..))")
public Object around(ProceedingJoinPoint pjp) throws Throwable {
    // 获取方法参数
    Object[] args = pjp.getArgs();
    System.out.println("Method args: " + Arrays.toString(args));

    // 执行目标方法
    Object result = pjp.proceed();  // 调用目标方法

    // 获取目标方法返回值
    System.out.println("Method returned: " + result);
    return result;
}
```
