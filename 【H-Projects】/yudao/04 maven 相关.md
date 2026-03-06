# 04 maven 相关

## maven 命令启动项目和 java 命令启动项目的区别

### 类路径的构建方式

`mvn spring-boot:run` 和 `java -jar` 的第一差异是 classpath 谁来算、何时算。

| 对比项 | `mvn spring-boot:run` | `java -jar target/app.jar` |
| --- | --- | --- |
| 计算时机 | 启动前动态计算 | 打包时基本确定 |
| classpath 来源 | `target/classes` + Maven 依赖 | Jar 内部结构（`BOOT-INF/classes` + `BOOT-INF/lib`） |
| 与 `pom.xml` 的关系 | 强依赖运行时的 `pom.xml` | 运行时通常不再读取 `pom.xml` |
| 典型场景 | 本地开发调试 | 预发/生产部署 |

- `mvn spring-boot:run` 本质是“先构建运行环境，再启动应用”。
- `java -jar` 本质是“直接执行构建产物”，更贴近部署单元。
- 同一份代码在两种方式下，如果依赖版本、profile、JVM 参数不同，行为可能不同。

### 依赖来源

依赖来源决定了“可复现性”和“环境一致性”。

- `mvn spring-boot:run`：运行时依赖本地仓库（`~/.m2/repository`）和当前 `pom.xml`。
- `java -jar`：依赖已打包进产物的库文件，独立性更强。
- 本地仓库污染或镜像差异可能导致 `mvn` 启动和线上行为不一致。

```bash
# 1) 查看当前项目依赖树，确认最终引入版本
# -Dverbose 会显示冲突仲裁细节，便于看“谁覆盖了谁”
mvn dependency:tree -Dverbose

# 2) 强制更新快照依赖，避免本地缓存导致“看起来没改动”
# -U 只影响远端快照检查，不会覆盖 release 版本
mvn -U clean package

# 3) 离线构建验证，检测是否依赖本地临时状态
# 如果离线失败，说明你依赖了未缓存的远端资源
mvn -o test
```

### 启动机制

`mvn spring-boot:run` 的执行链路：

```text
1) Maven 读取 pom.xml 与父 POM
2) 解析依赖图并确定最终版本
3) 执行 spring-boot-maven-plugin:run
4) 组装 classpath、系统属性、JVM 参数
5) 调用应用 main 方法启动
```

`java -jar` 的执行链路：

```text
1) JVM 读取 Jar Manifest 中 Main-Class
2) 进入 Spring Boot Launcher（如 JarLauncher）
3) 按 Boot 规则加载 BOOT-INF/classes 与 BOOT-INF/lib
4) 创建应用 ClassLoader
5) 调用业务主类 main 方法
```

常见差异点：

- `mvn spring-boot:run` 默认可能带上测试输出目录（取决于插件配置）。
- `java -jar` 严格依赖打包产物，不会读取源码目录。
- 若 `repackage` 未执行成功，`java -jar` 可能直接无法运行。

```bash
# 推荐开发启动：可附加 profile 和调试参数
# -Dspring-boot.run.profiles=local 指定 Spring profile
# -Dspring-boot.run.jvmArguments 传入 JVM 参数
mvn spring-boot:run \
  -Dspring-boot.run.profiles=local \
  -Dspring-boot.run.jvmArguments="-Xms512m -Xmx512m -Dfile.encoding=UTF-8"

# 推荐部署启动：固定产物 + 显式 profile
java -jar target/app.jar --spring.profiles.active=prod
```

### idea 启动 springboot项目的原理是什么

IDEA 没有创造新机制，本质是帮你“生成并执行启动命令”。

方式一：Application / Spring Boot 配置

- IDEA 先编译模块（等价于触发一次增量编译）。
- IDEA 按模块依赖拼接 classpath。
- IDEA 直接调用 JVM 启动 `main`。
- 这个模式最接近“手工 `java -cp ...` + `main`”。

方式二：Maven 配置

- IDEA 调用 Maven 可执行程序。
- Maven 继续执行 `spring-boot:run`。
- 实际行为受插件配置和 Maven 环境影响更大。

实践建议：

- 开发调试优先 `Application`，启动更快、调试体验更好。
- 验证构建一致性时用 `mvn clean package` + `java -jar`。
- CI 以命令行为准，避免只在 IDE 中“看起来能跑”。

```text
定位“IDE 能跑但命令行不能跑”的顺序
1) 对比 JDK 版本（IDEA Project SDK vs JAVA_HOME）
2) 对比 active profile
3) 对比 VM Options
4) 对比依赖版本（dependency:tree）
5) 对比构建命令是否跳过了关键阶段
```

## maven 常见命令和插件的作用

### 常见命令速查

| 命令 | 作用 | 典型场景 | 常见误区 |
| --- | --- | --- | --- |
| `mvn clean` | 清空构建产物目录 | 解决脏构建问题 | 误以为会清理本地仓库 |
| `mvn compile` | 编译主源码 | 快速检查语法/编译错误 | 不会执行测试 |
| `mvn test` | 运行单元测试 | 本地回归 | 不会生成最终可部署包 |
| `mvn package` | 打包构件 | 生成 jar/war | 默认会跑测试 |
| `mvn install` | 安装到本地仓库 | 多模块联调 | 不是发布到远程仓库 |
| `mvn deploy` | 发布到远程仓库 | CI 发布 | 需要仓库权限配置 |

```bash
# 跳过测试打包（只建议临时排障使用）
# -DskipTests: 编译测试代码但不执行测试
mvn clean package -DskipTests

# 完全跳过测试编译和执行（更激进）
# -Dmaven.test.skip=true: 测试源码也不编译
mvn clean package -Dmaven.test.skip=true
```

### 常见插件与定位

| 插件 | 核心职责 | 关键配置点 |
| --- | --- | --- |
| `maven-compiler-plugin` | Java 编译 | `source`/`target`/`release` |
| `maven-surefire-plugin` | 单元测试（test 阶段） | `includes`/`excludes` |
| `maven-failsafe-plugin` | 集成测试（integration-test/verify） | 与 surefire 分工 |
| `maven-jar-plugin` | 普通 Jar 打包 | Manifest、自定义输出 |
| `spring-boot-maven-plugin` | Boot 运行与重打包 | `mainClass`、`repackage` |
| `maven-resources-plugin` | 资源复制与过滤 | 编码、过滤变量 |
| `maven-enforcer-plugin` | 构建规则约束 | JDK/Maven 版本下限 |

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <version>3.11.0</version>
      <configuration>
        <!--
          release 比 source/target 更稳妥：
          1) 统一语言级别
          2) 同时约束可用 JDK API
          3) 避免“编译通过但低版本 JRE 运行失败”
        -->
        <release>17</release>
      </configuration>
    </plugin>
  </plugins>
</build>
```

### 生命周期与 phase 的理解

Maven 的本质是“执行 phase”，插件 goal 绑定在 phase 上被触发。

- 常用生命周期：`clean`、`default`、`site`。
- 最常用的是 `default` 生命周期。
- 执行后置 phase 会隐式执行前置 phase。

```text
default 生命周期（常见阶段）
validate
compile
test
package
verify
install
deploy
```

- `mvn test` 不会执行 `package`。
- `mvn install` 会经过 `package` 和 `verify`。
- 绑定错误 phase 会导致“该执行的检查没执行”。

### 常见排错命令

```bash
# 依赖树：定位冲突和最终版本来源
mvn dependency:tree

# 仅关注某个 groupId/artifactId，减少噪音
mvn dependency:tree -Dincludes=com.fasterxml.jackson.core:jackson-databind

# 有效 POM：查看继承和 profile 展开后的最终配置
mvn help:effective-pom

# 有效 settings：定位镜像、私服、账号读取是否正确
mvn help:effective-settings

# Debug 模式：看完整执行链路和插件参数
mvn -X clean package
```

### 实战：定位依赖冲突的固定流程

```text
1) 先用 dependency:tree 找到同库多版本
2) 判断当前生效版本是否符合预期
3) 在 dependencyManagement 锁定目标版本
4) 对不需要的传递依赖加 exclusions
5) clean 后重新构建并回归关键功能
```

## 深入了解 maven bom

### bom 作用

BOM（Bill of Materials）是“版本清单”，不负责引包，负责定版本。

- 目标是“同一技术栈版本对齐”。
- 核心收益是“升级集中化”和“冲突可控化”。
- 适合多模块、多人协作、长期维护项目。

### bom 的基本用法

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <!--
        导入第三方 BOM：
        1) groupId/artifactId/version 定位 BOM 坐标
        2) type=pom + scope=import 表示导入其依赖版本约束
        3) 仅约束版本，不自动引入依赖到 classpath
      -->
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-dependencies</artifactId>
      <version>3.2.5</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

<dependencies>
  <dependency>
    <!--
      此处省略 version，最终版本由 BOM 提供。
      若此处显式写 version，会覆盖 BOM 中的版本。
    -->
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
  </dependency>
</dependencies>
```

### bom 的运作原理

版本决策优先级（简化理解）：

```text
直接声明依赖版本 > 当前 POM 的 dependencyManagement > 父 POM 的 dependencyManagement > 传递依赖版本
```

关键点：

- BOM 本质是 `dependencyManagement` 的集中表达。
- 导入多个 BOM 时，管理同一依赖可能发生覆盖。
- 版本冲突依然可能存在，BOM 只是让冲突更可预测。

### bom 嵌套

BOM 可以分层设计，实现平台化治理。

```text
公司平台 BOM
  -> 导入 spring-boot-dependencies
  -> 统一数据库驱动、日志、监控版本
业务线 BOM
  -> 导入公司平台 BOM
  -> 追加业务框架版本
应用项目 POM
  -> 仅导入业务线 BOM
```

- 平台层关注通用稳定性。
- 业务层关注特定组件。
- 应用层尽量只声明“要用什么”，少管“具体版本号”。

### bom 的应用场景

- 多模块工程想统一依赖版本。
- 多仓库项目要保持技术栈一致。
- 团队希望做“批量可回滚”的版本升级。

### 注意事项

- 不要在子模块随意显式写版本，容易破坏版本统一。
- 引入外部 BOM 前要确认兼容矩阵（JDK、Spring、中间件）。
- BOM 升级要配合回归测试，不要只看是否编译通过。

```text
BOM 升级建议流程
1) 新建升级分支
2) 只修改 BOM 版本
3) 执行全量测试与关键链路压测
4) 记录不兼容点与替代方案
5) 分批发布、观察、回滚预案
```

## 深入了解 maven pom

### 基本概念

POM（Project Object Model）是 Maven 项目的“单一事实源”。

- 定义项目坐标：`groupId`、`artifactId`、`version`。
- 定义依赖：项目编译与运行需要哪些库。
- 定义构建：如何编译、测试、打包、发布。
- 定义规则：编码、JDK、插件版本、仓库等。

### POM 的基本结构

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

  <!-- POM 模型版本，Maven 3/4 项目通常固定为 4.0.0 -->
  <modelVersion>4.0.0</modelVersion>

  <!-- 项目唯一坐标：用于仓库检索与依赖引用 -->
  <groupId>com.example</groupId>
  <artifactId>demo-app</artifactId>
  <version>1.0.0-SNAPSHOT</version>

  <!-- 打包类型：常见 jar / war / pom -->
  <packaging>jar</packaging>

  <!-- 项目描述信息：非必须，但建议补齐提升可维护性 -->
  <name>demo-app</name>
  <description>Demo service</description>
</project>
```

### 继承与聚合

继承（parent）：

- 子模块继承父 POM 的配置。
- 典型继承内容：属性、依赖管理、插件管理、仓库配置。
- 适合“统一规范”的场景。

聚合（modules）：

- 父工程聚合多个子模块统一构建。
- 父工程 `packaging` 通常为 `pom`。
- 适合“多模块一键构建”的场景。

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>demo-parent</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <packaging>pom</packaging>

  <modules>
    <!--
      modules 决定聚合构建顺序入口。
      子模块之间的真实编译顺序仍由依赖关系决定。
    -->
    <module>demo-api</module>
    <module>demo-service</module>
  </modules>
</project>
```

### 依赖管理

| 元素 | 作用 | 是否引入依赖 |
| --- | --- | --- |
| `dependencies` | 声明当前模块要使用的依赖 | 是 |
| `dependencyManagement` | 统一版本与规则 | 否 |

作用域（scope）常用理解：

- `compile`：默认作用域，编译/测试/运行都可见。
- `provided`：编译可见，运行由容器提供（如 Servlet API）。
- `runtime`：编译不需要，运行需要（如 JDBC 驱动）。
- `test`：仅测试代码可见。

```xml
<dependencies>
  <dependency>
    <!-- 运行时依赖：编译期通常不直接引用 API -->
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
  </dependency>

  <dependency>
    <!-- 仅测试使用，避免污染生产 classpath -->
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

### 插件配置

- `plugins`：当前模块真正执行的插件。
- `pluginManagement`：只做“统一定义”，子模块声明后才执行。
- 推荐锁定插件版本，保证构建可复现。

```xml
<build>
  <pluginManagement>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.2.5</version>
      </plugin>
    </plugins>
  </pluginManagement>

  <plugins>
    <plugin>
      <!--
        子模块在 plugins 中声明后，才会真正执行。
        版本与默认配置可复用 pluginManagement 中的定义。
      -->
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-surefire-plugin</artifactId>
    </plugin>
  </plugins>
</build>
```

### 属性

`properties` 用来抽取重复配置，提升一致性。

- 常放：JDK 版本、编码、库版本。
- 依赖和插件可通过 `${xxx}` 复用。
- 建议按“平台属性、业务属性”分组命名。

```xml
<properties>
  <!-- 统一编码，避免资源过滤和日志出现乱码 -->
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>

  <!-- 统一 Java 版本，配合 compiler 插件使用 -->
  <java.version>17</java.version>

  <!-- 业务依赖版本属性，便于集中升级 -->
  <mybatis-plus.version>3.5.7</mybatis-plus.version>
</properties>
```

### 构建环境配置

`profiles` 是“按条件激活配置”，不是“运行时配置中心”。

- 常见激活方式：`-P` 指定、JDK 条件、文件存在、系统属性。
- 典型用途：不同环境仓库地址、资源过滤参数、插件行为。
- `settings.xml` 适合放镜像与凭据，避免写进项目仓库。

```xml
<profiles>
  <profile>
    <id>dev</id>
    <properties>
      <!--
        这里定义的是 Maven 构建期属性。
        运行时配置（如 Spring 的 datasource）建议由应用配置管理。
      -->
      <env.name>dev</env.name>
    </properties>
  </profile>

  <profile>
    <id>prod</id>
    <properties>
      <env.name>prod</env.name>
    </properties>
  </profile>
</profiles>
```

```bash
# 激活指定 profile 构建
mvn clean package -Pprod

# 同时激活多个 profile
mvn clean package -Pprod,aliyun-repo
```

### 其他常见元素

| 元素 | 用途 | 备注 |
| --- | --- | --- |
| `repositories` | 依赖下载仓库 | 项目级仓库声明 |
| `pluginRepositories` | 插件下载仓库 | 插件解析使用 |
| `distributionManagement` | 发布仓库地址 | `deploy` 阶段使用 |
| `scm` | 源码仓库信息 | 常用于发布元数据 |
| `licenses` | 许可证信息 | 开源项目建议补齐 |
| `developers` | 开发者信息 | 项目元数据补充 |

```text
POM 维护原则
1) 版本尽量集中在 dependencyManagement / properties
2) 插件版本必须显式固定
3) profile 只做必要差异，不堆业务逻辑
4) 变更后用 effective-pom 验证最终结果
```
