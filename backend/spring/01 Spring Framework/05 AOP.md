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
