# 03 spring 相关

## 深入理解Spring Boot的配置文件application.yaml及其变体

### 配置文件的角色

`application.yaml` 是 Spring Boot 的主配置入口，用于声明应用运行参数。

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
# application-prod.yaml
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
    jwt-secret: "a:b:c"
  features:
    - login
    - audit
```

### 自定义配置绑定

推荐用 `@ConfigurationProperties` 做类型安全绑定。

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;

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

### 占位符与默认值

```yaml
app:
  name: yudao-admin
  endpoint: "http://${HOST:127.0.0.1}:${PORT:8080}"
```

规则：`${key:default}` 表示读取 `key`，不存在时使用 `default`。

### 多文档配置

单个 `application.yaml` 可通过 `---` 拆分多段配置。

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

### 常见问题与排查步骤

- 配置不生效：确认激活的 profile 是否正确。
- 字段绑定失败：确认前缀、命名风格（如 `max-size` 对应 `maxSize`）。
- 启动报 YAML 解析错误：优先检查缩进和冒号后空格。

```bash
# 快速查看实际生效环境
java -jar app.jar --debug
```

### 实践建议

- 公共配置放 `application.yaml`，环境差异放 `application-{profile}.yaml`。
- 敏感信息通过环境变量或配置中心注入，不明文写仓库。
- 自定义配置统一走 `@ConfigurationProperties`，避免 `@Value` 分散读取。
