# Spring 相关实践

*类型：practice ｜ 难度：进阶 ｜ 标签：yudao、Spring Boot、配置文件、SpEL、自动配置*

**yudao 项目围绕 Spring Boot 的四块核心实践：`application.yaml` 及其 profile 变体管理环境配置，SpEL 表达式支撑注解中的动态取值，`@SpringBootConfiguration`/`@EnableAutoConfiguration`/`@ComponentScan` 三件套构成启动类的自动配置与扫描基石。理解配置优先级与条件装配机制，是排查「配置不生效」「Bean 找不到」类问题的关键。**

## 深入理解 application.yaml 及其变体

### 配置文件的角色

`application.yaml` 是 Spring Boot 的主配置入口，用于声明应用运行参数：

- 服务端口、上下文路径。
- 数据源、缓存、消息中间件连接信息。
- 日志级别与业务自定义参数。

### 常见文件形态

| 文件 | 用途 |
| --- | --- |
| `application.yaml` | 默认配置，所有环境共享基线 |
| `application-{profile}.yaml` | 环境差异配置，如 `dev`、`test`、`prod` |
| `bootstrap.yaml` | 早期 Spring Cloud 场景加载的引导配置 |

### Profile 环境隔离

```yaml
spring:
  profiles:
    active: dev
```

```yaml
# application-dev.yaml
server:
  port: 8081

spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/yudao_dev
    username: root
    password: root
```

```yaml
# application-prod.yaml：敏感信息通过环境变量注入
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://10.0.0.10:3306/yudao_prod
    username: app
    password: ${DB_PASSWORD}
```

### 配置覆盖优先级

常见优先级从低到高：

- `application.yaml`
- `application-{profile}.yaml`
- 环境变量
- JVM 参数与启动参数

```bash
# 启动时显式覆盖 profile 和端口
java -jar app.jar --spring.profiles.active=prod --server.port=9090
```

### YAML 语法关键点

- 缩进必须统一使用空格，不能用 Tab。
- 同层级键不能重复。
- 字符串中包含特殊字符时建议加引号。

```yaml
app:
  security:
    # 含冒号的字符串加引号避免解析歧义
    jwt-secret: "a:b:c"
  features:
    - login
    - audit
```

### 自定义配置绑定

推荐用 `@ConfigurationProperties` 做类型安全绑定，避免 `@Value` 分散读取：

```java
@Component
@ConfigurationProperties(prefix = "app.cache")
public class CacheProperties {

    // 通过强类型字段约束配置合法性
    private Integer maxSize;

    // 支持 30s、5m、1h 这类时长表达
    private Duration ttl;

    public Integer getMaxSize() {
        return maxSize;
    }

    public void setMaxSize(Integer maxSize) {
        this.maxSize = maxSize;
    }

    public Duration getTtl() {
        return ttl;
    }

    public void setTtl(Duration ttl) {
        this.ttl = ttl;
    }
}
```

```yaml
app:
  cache:
    max-size: 1000
    ttl: 10m
```

### 占位符与多文档配置

占位符规则：`${key:default}` 表示读取 `key`，不存在时使用 `default`：

```yaml
app:
  name: yudao-admin
  endpoint: "http://${HOST:127.0.0.1}:${PORT:8080}"
```

单个 `application.yaml` 可通过 `---` 拆分多段配置：

```yaml
spring:
  application:
    name: yudao

---
spring:
  config:
    activate:
      on-profile: dev
server:
  port: 8081

---
spring:
  config:
    activate:
      on-profile: prod
server:
  port: 8080
```

### 常见问题与排查

- 配置不生效：确认激活的 profile 是否正确。
- 字段绑定失败：确认前缀、命名风格（如 `max-size` 对应 `maxSize`）。
- 启动报 YAML 解析错误：优先检查缩进和冒号后空格。

```bash
# 快速查看实际生效环境
java -jar app.jar --debug
```

实践建议：公共配置放 `application.yaml`，环境差异放 `application-{profile}.yaml`；敏感信息通过环境变量或配置中心注入，不明文写仓库。

## 深入理解 SpEL 表达式

SpEL（Spring Expression Language）是 Spring 提供的表达式语言，用于运行期读取和计算值：访问对象属性、方法、集合元素，支持逻辑运算、比较运算、三元表达式，常用于注解属性、配置注入、权限与条件判断。

### 语法速查

| 表达式 | 含义 |
| --- | --- |
| `#{...}` | SpEL 表达式入口 |
| `${...}` | 属性占位符，通常来自配置文件 |
| `#root` | 根对象 |
| `#this` | 当前上下文对象 |
| `@beanName` | 引用 Spring 容器中的 Bean |
| `T(java.time.LocalDate)` | 引用 Java 类型 |

### 使用示例

```java
@Component
public class SpELDemo {

    // 读取配置并设置默认值，避免配置缺失导致启动失败
    @Value("${app.name:yudao-default}")
    private String appName;

    // SpEL 调用字符串方法，将结果注入字段
    @Value("#{'${app.name:yudao}'.toUpperCase()}")
    private String appNameUpper;

    // 通过 SpEL 访问系统属性
    @Value("#{systemProperties['user.timezone']}")
    private String timezone;

    // 三元表达式：当配置值为空或非正时回退到 1
    @Value("#{${app.max-retry:3} > 0 ? ${app.max-retry:3} : 1}")
    private int retry;
}
```

### 典型场景：缓存 key 动态拼接

```java
// key 中拼接方法参数，保证不同用户缓存隔离
@Cacheable(cacheNames = "user", key = "'user:' + #userId")
public String findUser(Long userId) {
    return "user-" + userId;
}
```

其他场景：`@PreAuthorize` 中动态引用参数做权限判断、`@ConditionalOnExpression` 中做条件装配。

## 深入理解 @SpringBootConfiguration

`@SpringBootConfiguration` 是 Spring Boot 应用的核心配置注解，本质是 `@Configuration` 的派生注解：标记「这是 Spring Boot 的配置类」、作为启动类识别入口的一部分、配合 `@EnableAutoConfiguration`、`@ComponentScan` 完成自动配置与扫描。

通常不单独使用，而是通过 `@SpringBootApplication` 间接使用：

```java
// @SpringBootApplication 是三大注解的组合入口
@SpringBootApplication
public class YudaoApplication {
    public static void main(String[] args) {
        // 从主配置类启动，触发自动配置和组件扫描
        SpringApplication.run(YudaoApplication.class, args);
    }
}
```

基本原理：

- `@SpringBootConfiguration` 本身使用 `@Configuration`，因此该类会被当作配置类处理。
- 启动时，Spring Boot 以该类所在包为「默认扫描基线」。
- 配置类中声明的 `@Bean` 会被注册到容器。

| 注解 | 语义定位 | 使用建议 |
| --- | --- | --- |
| `@Configuration` | 通用 Spring 配置类 | 业务模块配置、第三方集成配置 |
| `@SpringBootConfiguration` | Boot 应用主配置类 | 通常只在启动类层面出现一次 |

注意事项：

- 一个应用通常只保留一个主启动配置入口，避免上下文重复加载。
- 启动类包路径应放在项目较高层级，确保子包都能被扫描到。
- 业务配置类优先使用 `@Configuration`，避免语义混淆。

## 深入理解 @EnableAutoConfiguration

`@EnableAutoConfiguration` 用于开启 Spring Boot 自动配置机制，让框架根据类路径和配置条件自动装配 Bean：减少手动配置、基于「约定优于配置」快速启动项目、支持按条件启用或禁用某些自动配置。

一般由 `@SpringBootApplication` 间接开启，必要时可单独控制排除项：

```java
@SpringBootApplication(
        excludeName = {
                // 显式关闭不需要的自动配置，避免引入错误的数据源等依赖
                "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration"
        }
)
public class YudaoApplication {
}
```

基本原理：

- 启动阶段读取自动配置元数据（`AutoConfiguration.imports`）。
- 候选自动配置类通过 `@Conditional` 系列注解判断是否生效。
- 条件满足才注册 Bean，避免「强制装配」。

常见条件注解：

| 注解 | 触发条件 | 典型用途 |
| --- | --- | --- |
| `@ConditionalOnClass` | 类路径存在指定类 | 有依赖才启用对应配置 |
| `@ConditionalOnMissingBean` | 容器中不存在某 Bean | 提供默认实现，可被覆盖 |
| `@ConditionalOnProperty` | 配置项满足条件 | 通过配置开关功能 |
| `@ConditionalOnWebApplication` | Web 应用环境 | 区分 Web/非 Web 配置 |

```java
@Configuration
public class DemoAutoConfiguration {

    // 当用户未自定义同类型 Bean 时，提供默认实现，允许业务覆盖
    @Bean
    @ConditionalOnMissingBean
    public IdGenerator idGenerator() {
        return new SnowflakeIdGenerator();
    }
}
```

注意事项：自动配置不是“无脑生效”，要先看条件是否满足；排查配置问题时先看 `--debug` 输出的条件匹配报告；需要完全自定义时，可通过 `exclude` 精确禁用冲突项。

## 深入理解 @ComponentScan

`@ComponentScan` 用于指定 Spring 组件扫描范围，将符合条件的类注册为 Bean：扫描 `@Component` 及其派生注解（`@Service`、`@Repository`、`@Controller`），支持按包、按注解、按类型过滤，是 IoC 容器发现业务组件的核心入口。

运行原理：启动时基于包路径递归扫描 `.class`，使用过滤规则判断是否为候选组件，解析并注册 BeanDefinition，最终交由容器创建实例。

### 常见属性

| 属性 | 作用 | 备注 |
| --- | --- | --- |
| `basePackages` | 指定扫描包名 | 字符串形式，最常用 |
| `basePackageClasses` | 以类定位包路径 | 重构更安全 |
| `includeFilters` | 包含过滤规则 | 常配合自定义注解 |
| `excludeFilters` | 排除过滤规则 | 过滤不希望注册的类 |
| `useDefaultFilters` | 是否启用默认注解过滤 | 默认 `true` |

```java
@ComponentScan(
        basePackages = "cn.iocoder.yudao",
        excludeFilters = {
                // 排除 Controller，适合在非 Web 子容器中复用配置
                @ComponentScan.Filter(type = FilterType.ANNOTATION, classes = Controller.class)
        }
)
public class InfraScanConfiguration {
}
```

### 默认行为与注意事项

- 未显式声明时，默认扫描当前配置类所在包及其子包。
- `@SpringBootApplication` 已内置 `@ComponentScan`，多数情况下不必重复写。
- 重复声明扫描路径可能导致 Bean 冲突或重复注册风险。

常见使用案例：多模块项目中限定基础设施层扫描范围、测试场景中只加载目标模块 Bean 缩短启动时间、插件化系统中按过滤规则按需装配。

排查要点：出现 `NoSuchBeanDefinitionException` 时先检查扫描路径与过滤规则；启动类应放在根包避免漏扫；使用 `excludeFilters` 时要确认不会误排关键 Bean。
