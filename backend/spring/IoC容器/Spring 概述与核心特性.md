# Spring 概述与核心特性

*类型：knowledge ｜ 难度：基础 ｜ 标签：Spring、IoC、DI、Bean*

**Spring 的核心价值是简化开发：IoC 容器接管对象的创建与依赖管理，DI 实现组件解耦，AOP 处理横切关注点，再辅以模块化设计、声明式事务和完善的生态整合。理解「容器（Container）管理组件（Bean）」这一基本模型，是掌握整个 Spring 体系的起点。**

## Spring 的核心优点

- **控制反转（IoC）与依赖注入（DI）**：容器管理对象的创建和依赖关系，开发者无需手动 `new` 对象；依赖可被 Mock 替换，单元测试更容易。
- **面向切面编程（AOP）**：日志、事务、权限等横切关注点集中到切面管理，减少重复代码。

```java
@Aspect
@Component
public class LogAspect {
    // 拦截 service 包下所有类的所有方法，方法调用前打印日志
    @Before("execution(* com.example.service.*.*(..))")
    public void logMethodCall(JoinPoint jp) {
        System.out.println("方法调用: " + jp.getSignature());
    }
}
```

- **模块化设计**：Core、MVC、Data、Security 等模块按需引入，避免臃肿；与 Spring Boot、Spring Cloud、Spring Data 无缝集成。
- **声明式事务**：`@Transactional` 一个注解即可管理事务，支持 `REQUIRED`、`REQUIRES_NEW`、`NESTED` 等多种传播行为。
- **技术整合**：数据访问（JDBC、JPA、MyBatis、MongoDB）、Web（Spring MVC、RESTful）、消息队列（Kafka、RabbitMQ）、缓存（Spring Cache + Redis）。
- **测试友好**：`@SpringBootTest` 提供容器环境测试，`@MockBean` 支持模拟依赖。

```java
@SpringBootTest
class UserServiceTest {
    @Autowired
    private UserService userService;

    @MockBean
    private UserRepository userRepo;  // 模拟依赖，不连真实数据库
}
```

- **高度可扩展**：`BeanPostProcessor`、`FactoryBean` 可深度定制容器行为；基于 `ApplicationEvent` 的事件机制实现模块间松耦合通信。

## 对比传统开发的改进

| 传统开发痛点 | Spring 的解决方案 |
| --- | --- |
| 手动管理对象和依赖 | IoC 容器自动管理 |
| 事务代码侵入业务逻辑 | AOP 声明式事务 |
| 重复的样板代码（如 JDBC） | `JdbcTemplate` 等模板类封装 |
| 配置繁琐（如 XML） | 注解驱动 + Spring Boot 自动配置 |

## Spring 容器（Container）

容器是 Spring 框架的核心，通过 IoC 机制管理应用中所有组件的生命周期、依赖关系及配置。

- **BeanFactory**：基础容器，提供最基本的 DI 支持（懒加载）；`XmlBeanFactory` 已过时，不推荐。
- **ApplicationContext**：`BeanFactory` 的子接口，功能更丰富（推荐使用），支持事件发布、国际化、资源加载。常见实现：

```text
ClassPathXmlApplicationContext   // XML 配置（类路径）
AnnotationConfigApplicationContext // 注解配置
FileSystemXmlApplicationContext  // XML 配置（文件系统路径）
```

容器的作用：

- 实例化、配置和组装 Bean。
- 解决 Bean 之间的依赖关系（依赖注入）。
- 管理 Bean 的生命周期（初始化、销毁）。

## Spring 组件（Bean）

由容器管理的对象统称为 Bean，可以是 Service、DAO、Controller 等任何需要被 Spring 管理的类。

### Bean 的定义方式

```xml
<!-- 方式一：XML 配置（传统） -->
<bean id="userService" class="com.example.UserService">
    <property name="userDao" ref="userDao" />
</bean>
```

```java
// 方式二：注解配置（现代主流）
// @Component：通用组件；衍生注解：@Service（业务层）、@Repository（数据层）、@Controller（Web 层）
@Service
public class UserService {
    @Autowired
    private UserDao userDao;
}

// 方式三：Java Config（基于代码的配置）
@Configuration
public class AppConfig {
    @Bean
    public UserService userService() {
        return new UserService(userDao());
    }
}
```

### Bean 的核心特性

- **作用域（Scope）**：`singleton`（默认，单例）、`prototype`（每次请求新实例）、`request` / `session`（Web 环境）。

```java
@Scope("prototype")
@Component
public class TaskProcessor {}
```

- **生命周期回调**：`@PostConstruct` 初始化后执行，`@PreDestroy` 销毁前执行。
- **依赖注入方式**：字段注入（简洁但不易测试）、构造器注入（推荐）、Setter 注入（适合可选依赖）。

## IoC 与 DI

### 核心思想

```java
// 传统方式：主动创建依赖，硬编码耦合
class UserService {
    private UserDao userDao = new UserDao();
}

// IoC 方式：依赖由容器提供，控制权反转
class UserService {
    private UserDao userDao;  // 依赖由容器注入
}
```

- **IoC 是设计原则**：将对象创建和依赖管理的责任从开发者转移给容器。
- **DI 是实现方式**：IoC 的具体技术手段，通过注入依赖实现控制反转。
- **实现方式**：依赖查找（`context.getBean()`，较少使用）与依赖注入（主流）。

### 三种注入方式

```java
// 构造器注入（推荐）：依赖不可变（final），Spring 4.3+ 可省略 @Autowired
@Service
public class OrderService {
    private final PaymentService paymentService;

    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}

// Setter 注入：适合可选依赖
@Service
public class NotificationService {
    private EmailService emailService;

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
}

// 字段注入：代码简洁但不易测试，不推荐
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}
```

## 容器与组件的协作流程

```text
1. 启动容器：读取配置（XML/注解/Java Config），扫描 @Component 类
2. 创建 Bean：按作用域实例化，解析依赖并注入（@Autowired）
3. 生命周期管理：调用初始化方法（@PostConstruct），运行期通过 getBean() 获取
4. 销毁容器：调用销毁方法（@PreDestroy）
```

完整示例：

```java
// 1. 定义组件
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public String getUserName(Long id) {
        return userRepository.findNameById(id);
    }
}

// 2. 配置容器（注解方式）
@Configuration
@ComponentScan("com.example")
public class AppConfig {}

// 3. 启动容器
public class Main {
    public static void main(String[] args) {
        ApplicationContext context =
            new AnnotationConfigApplicationContext(AppConfig.class);
        UserService userService = context.getBean(UserService.class);
        System.out.println(userService.getUserName(1L));
    }
}
```

## 总结

- **容器**：Spring 的大脑，负责管理所有 Bean。
- **Bean**：Spring 管理的基本单元，通过 DI 实现松耦合。
- **推荐实践**：优先使用注解（`@Service` + `@Autowired`）和构造器注入。
