# 数据库与 MyBatis-Plus 注解

*类型：practice ｜ 难度：进阶 ｜ 标签：yudao、MyBatis-Plus、ORM、事务、逻辑删除*

**yudao 的持久层以 MyBatis-Plus 注解为核心：`@TableName` 声明实体映射表、`@TableId` 决定主键策略、`@TableField` 控制字段映射与自动填充、`@TableLogic` 实现逻辑删除、`@KeySequence` 适配数据库序列，配合 `@Transactional` 声明式事务和 MyBatis 主键回填构成完整的 ORM 实践。所有注解都遵循「启动期解析、运行期复用」的元数据缓存模型。**

## 深入理解 @TableName

`@TableName` 是 MyBatis-Plus 用来声明“实体类对应哪张表”的核心注解。默认按命名规则推断表名，当实体名和表名不一致时必须显式声明；多数团队会在每个实体显式标注，避免命名策略变更导致映射错误。

```java
import com.baomidou.mybatisplus.annotation.TableName;

/**
 * 用户实体。
 * 明确指定映射表名，避免依赖默认命名推断。
 */
@TableName("system_user")
public class UserDO {

    // 主键字段，省略其他注解用于演示 TableName 的最小用法
    private Long id;
}
```

### 基本原理

核心原理是“启动期解析，运行期复用”：

```text
@TableName 解析链路（简化）
1) Spring 启动时扫描实体类
2) 解析 TableName 注解
3) 构建并缓存 TableInfo 元数据
4) CRUD 方法生成 SQL 时读取 TableInfo
5) 交给 MyBatis 执行 SQL
```

运行期性能开销主要在 SQL 生成与执行，不在注解解析。

### 为什么需要显式声明

典型风险场景：

- 实体类改名了，但表没改名。
- 开启了下划线策略，部分历史表不符合规则。
- 不同模块里出现同名实体，默认推断易混淆。
- 多租户、分表、历史表迁移等场景表名策略更复杂。

### 相关全局配置

`@TableName` 常与全局 `DbConfig` 配置共同影响最终表名：

| 配置项 | 作用 | 常见值 |
| --- | --- | --- |
| `tablePrefix` | 统一表前缀 | `sys_`、`biz_` |
| `tableUnderline` | 驼峰转下划线 | `true` / `false` |
| `capitalMode` | 大写命名模式 | `true` / `false` |
| `schema` | 指定 schema | `public`、`app` |

```yaml
mybatis-plus:
  global-config:
    db-config:
      # 全局表前缀。不希望某实体拼接此前缀时，
      # 需要在 @TableName 中配置 keepGlobalPrefix 或显式表名策略
      table-prefix: system_

      # 是否开启驼峰转下划线。开启后 UserInfo -> user_info
      table-underline: true
```

## 深入理解 @TableId

`@TableId` 用于标记实体主键字段并决定主键生成策略：告诉框架“哪个字段是主键”、“插入时主键由谁生成”，是插入、更新、按 ID 查询能否正确执行的关键。

```java
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;

public class UserDO {

    /**
     * 指定主键字段和主键策略。
     * IdType.ASSIGN_ID 通常使用雪花算法生成 long 型主键。
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;
}
```

### IdType 枚举详解

| IdType | 含义 | 适用场景 | 注意点 |
| --- | --- | --- | --- |
| `AUTO` | 数据库自增 | MySQL 自增主键 | 插入前主键通常为空 |
| `ASSIGN_ID` | 框架分配 ID | 分布式系统常用 | 字段建议 `Long` |
| `ASSIGN_UUID` | 框架分配 UUID | 字符串主键 | 索引体积较大 |
| `INPUT` | 手动输入 | 外部系统给定主键 | 业务层必须赋值 |
| `NONE` | 跟随全局策略 | 使用全局配置 | 需确认全局配置是否符合预期 |

### 与数据库主键的关系

`@TableId` 是应用层映射，数据库主键是物理约束，两者必须一致：

```text
一致性检查清单
1) 字段名是否对应
2) 字段类型是否一致（Long / bigint）
3) 生成策略是否匹配数据库
4) 是否存在历史脏数据导致重复主键
```

### 底层原理与注意事项

```text
INSERT 主键处理链路
1) 判断 IdType
2) 需要框架生成则先填充实体 ID
3) 执行 SQL
4) 需要数据库回填则回写实体 ID
```

- 主键字段类型不要随意从 `Long` 改成 `Integer`，容易溢出。
- 分库分表场景优先避免数据库自增主键。
- 使用字符串 UUID 主键时，要评估索引与存储开销。
- 生产环境改主键策略前必须做灰度验证。

## 深入理解 @TableField

`@TableField` 用于描述“普通字段如何映射数据库列”：字段名与列名不一致时用 `value` 指定、可控制字段是否参与查询/插入/更新、可指定自动填充策略与更新表达式。

### 核心属性

| 属性 | 作用 | 常见值 | 典型场景 |
| --- | --- | --- | --- |
| `value` | 指定列名 | `nick_name` | 字段名不一致 |
| `exist` | 是否为表字段 | `true` / `false` | 非持久化字段 |
| `select` | 查询是否返回该列 | `true` / `false` | 隐私字段脱敏 |
| `fill` | 自动填充策略 | `INSERT`/`INSERT_UPDATE` | 审计字段 |
| `update` | 更新表达式 | `%s+1` | 计数器自增 |

### 使用示例

```java
import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;

@TableName("system_user")
public class UserDO {

    // 实体字段 nickName 对应数据库列 nick_name
    @TableField("nick_name")
    private String nickName;
}
```

```java
public class OrderDO {

    // 创建时间：插入时自动填充
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    // 更新时间：插入和更新都自动填充
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    // 非数据库字段，用于接口层展示，不参与 ORM 映射
    @TableField(exist = false)
    private String displayLabel;
}
```

### 高级技巧

```java
public class ProductDO {

    /**
     * 乐观计数示例：每次更新将 stock_version + 1。
     * %s 会被替换为字段名。
     */
    @TableField(value = "stock_version", update = "%s+1")
    private Integer stockVersion;
}
```

- 使用 `select = false` 对敏感字段默认不查出，降低误泄露风险。
- 配合 `MetaObjectHandler` 做审计字段统一填充。

注意事项：`exist = false` 字段不能用于 Wrapper 拼接 SQL 条件；`select = false` 后业务代码直接读该字段可能拿到 `null`；自动填充生效依赖 `MetaObjectHandler` 实现；字段映射改动后要验证历史 SQL、导出报表、缓存序列化是否受影响。

## 深入理解 @TableLogic

逻辑删除是“标记删除”，不是“物理删除”：删除时执行 `UPDATE` 改标记，查询时默认自动过滤已删除数据，适合审计留痕、误删恢复、历史回溯场景。

```text
物理删除 vs 逻辑删除
物理删除：DELETE FROM table WHERE id = ?
逻辑删除：UPDATE table SET deleted = 1 WHERE id = ?
```

### 基本使用

```java
@TableName("system_user")
public class UserDO {

    /**
     * deleted=0 表示未删除，1 表示已删除。
     * 具体值可通过全局配置统一。
     */
    @TableLogic
    private Integer deleted;
}
```

### 自动注入与绕过

框架会在常见查询 SQL 中自动附加逻辑删除条件：

```text
自动注入示意
SELECT * FROM system_user WHERE id = 1
-> SELECT * FROM system_user WHERE id = 1 AND deleted = 0
```

需要查询已删除数据时，常见方式是自定义 Mapper SQL 绕过，仅用于审计、恢复等受控场景，不建议全局关闭逻辑删除：

```xml
<select id="selectWithDeleted" resultType="com.example.UserDO">
  <!-- 自定义 SQL 直接查询，不走默认逻辑删除拼接 -->
  SELECT id, username, deleted
  FROM system_user
  WHERE id = #{id}
</select>
```

### 相关配置

```yaml
mybatis-plus:
  global-config:
    db-config:
      # 逻辑删除字段名
      logic-delete-field: deleted
      # 已删除值
      logic-delete-value: 1
      # 未删除值
      logic-not-delete-value: 0
```

### 缓存一致性与最佳实践

逻辑删除和缓存同时存在时，重点是“删除后缓存一致性”：

```text
推荐策略
1) 先更新数据库删除标记
2) 再删除缓存 key
3) 关键读路径增加短期兜底校验
```

执行链路：

```text
逻辑删除执行链路
1) 识别实体逻辑删除字段
2) 构造 SQL 片段（deleted 条件）
3) 合并到查询/删除 SQL
4) 执行并返回结果
```

最佳实践与注意事项：

- 逻辑删除字段建立普通索引，避免全表扫描；高频查询组合索引中包含删除标记列。
- 管理后台提供“含已删除数据”专用接口；配套数据归档策略，避免逻辑删除数据无限增长。
- 唯一索引场景要评估逻辑删除后的重复插入策略。
- 逻辑删除不等于审计日志，关键操作仍要记录操作日志；不能把逻辑删除当权限控制手段。

## 深入理解 @KeySequence

序列是数据库对象，用于生成递增或按规则分配的数值，常见于 Oracle、PostgreSQL、DM 等数据库，与 MySQL 的自增列机制不同。

```sql
-- PostgreSQL 示例：创建序列
-- START WITH 指起始值，INCREMENT BY 指步长
CREATE SEQUENCE seq_system_user_id
START WITH 1
INCREMENT BY 1;
```

`@KeySequence` 告诉 MyBatis-Plus：该实体主键应从哪个数据库序列取值。主要配合 `@TableId(type = IdType.INPUT)` 使用，插入前先取序列值再写入主键字段：

```java
@TableName("system_user")
@KeySequence("seq_system_user_id")
public class UserDO {

    // 序列场景下通常使用 INPUT，由框架在插入前填充值
    @TableId(type = IdType.INPUT)
    private Long id;
}
```

与 `@TableId` 是互补关系而非替代：`@KeySequence` 定义“去哪拿主键值”，`@TableId` 定义“主键字段是谁、采用什么策略”。

| 场景 | @TableId 建议 | 是否需要 @KeySequence |
| --- | --- | --- |
| MySQL 自增 | `IdType.AUTO` | 否 |
| PostgreSQL 序列 | `IdType.INPUT` | 是 |
| 应用雪花 ID | `IdType.ASSIGN_ID` | 否 |

注意事项：序列名要与数据库真实对象一致；序列缓存策略会影响 ID 连续性，不要依赖“无空洞”；高并发写入时评估序列吞吐能力；跨数据库迁移时优先评估是否改为应用侧 ID。

## 深入理解 @Transactional

事务用于保证一组数据库操作要么全部成功，要么全部失败，核心特性是 ACID。Spring 中 `@Transactional` 通过 AOP 实现声明式事务。

```text
ACID 简述
A: Atomicity 原子性
C: Consistency 一致性
I: Isolation 隔离性
D: Durability 持久性
```

### 基本使用

```java
@Service
public class OrderService {

    /**
     * 下单事务示例：扣库存 + 写订单任一步失败则回滚。
     * 这里演示的是默认事务属性。
     */
    @Transactional
    public void createOrder(Long userId, Long productId, Integer count) {
        // 1. 扣库存
        // 2. 写订单
        // 3. 写流水
    }
}
```

### 基本原理

```text
@Transactional 执行链路
1) 调用代理对象方法
2) 事务拦截器开启事务
3) 执行业务方法
4) 根据异常规则决定提交或回滚
5) 释放连接与事务资源
```

- Spring 在代理对象中织入事务拦截器，方法进入时开启事务。
- 方法正常结束时提交，抛出匹配异常时回滚。
- 事务上下文绑定在当前线程。

### 传播行为

| 传播行为 | 含义 | 典型使用 |
| --- | --- | --- |
| `REQUIRED` | 有事务就加入，没有就新建 | 默认，绝大多数场景 |
| `REQUIRES_NEW` | 总是新建事务，挂起外部事务 | 审计日志、补偿记录 |
| `SUPPORTS` | 有事务就加入，无事务就非事务执行 | 查询服务 |
| `NOT_SUPPORTED` | 非事务执行，挂起外部事务 | 长耗时读操作 |
| `MANDATORY` | 必须在事务中执行 | 强一致内部方法 |
| `NEVER` | 必须在非事务环境执行 | 明确禁止事务场景 |
| `NESTED` | 嵌套事务（保存点） | 局部回滚需求 |

### 隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 说明 |
| --- | --- | --- | --- | --- |
| `READ_UNCOMMITTED` | 可能 | 可能 | 可能 | 并发高但一致性弱 |
| `READ_COMMITTED` | 不可 | 可能 | 可能 | 常见默认级别之一 |
| `REPEATABLE_READ` | 不可 | 不可 | 可能 | MySQL InnoDB 默认 |
| `SERIALIZABLE` | 不可 | 不可 | 不可 | 一致性最强，性能最低 |

隔离级别越高并发性能通常越低；业务上优先通过索引和短事务优化，再考虑提高隔离级别。

### 回滚规则、只读与超时

回滚规则：默认只对 `RuntimeException` 和 `Error` 回滚，对受检异常（`Exception`）默认不回滚，可通过 `rollbackFor` 显式指定：

```java
public class PaymentService {

    /**
     * 显式声明受检异常也回滚，避免“抛了异常但数据已提交”。
     */
    @Transactional(rollbackFor = Exception.class)
    public void pay() throws Exception {
        // 业务逻辑
    }
}
```

- `readOnly = true`：表示该事务以读为主，对 ORM 框架可起优化提示作用，不等于数据库层面绝对禁止写入，建议只给纯查询方法使用。
- `timeout`：单位是秒，超时后事务回滚并抛出异常，适合防止慢 SQL 或外部调用拖垮连接池。

```java
// 报表事务最长 5 秒，超时主动失败
@Transactional(timeout = 5, readOnly = true)
public void generateReport() {
    // 查询与统计逻辑
}
```

### 最佳实践与失效场景

- 事务边界放在 Service 层，不放 Controller。
- 事务方法尽量短小，避免包含远程调用。
- 读写分离时，读方法用 `readOnly=true`。
- 关键写操作明确 `rollbackFor`，避免默认规则误判。

常见失效场景：

- 同类内部方法调用不会经过代理，事务可能不生效。
- `private` 方法上的 `@Transactional` 默认不生效。
- 异步线程不共享主线程事务上下文。
- 事务中执行外部 RPC 会放大锁持有时间。

## 深入理解 MyBatis 回填功能

“回填”是指执行插入 SQL 后，把数据库生成的值写回实体对象。最常见是主键回填；如果没回填成功，后续业务可能拿不到新纪录 ID。

```text
回填示例
插入前：entity.id = null
插入后：entity.id = 1024
```

### MyBatis 核心配置

依赖 `useGeneratedKeys` 与 `keyProperty`：

```xml
<insert id="insertUser"
        parameterType="com.example.UserDO"
        useGeneratedKeys="true"
        keyProperty="id"
        keyColumn="id">
  <!--
    useGeneratedKeys=true: 启用 JDBC 主键返回能力。
    keyProperty=id: 回写到实体的 id 字段。
    keyColumn=id: 对应数据库主键列名。
  -->
  INSERT INTO system_user(username)
  VALUES(#{username})
</insert>
```

MyBatis-Plus 中通常由框架按主键策略自动处理，无需手写 XML。

### 底层原理

```text
回填执行链路
1) 发送 INSERT
2) 获取 generated keys
3) 映射到实体字段
4) 返回业务层继续使用
```

- JDBC 执行插入时请求返回生成键。
- MyBatis 从 `ResultSet` 读取主键，按 `keyProperty` 反射写回参数对象。
- MyBatis-Plus 在此基础上结合 `IdType` 做策略封装。

### 注意事项

- 数据库和驱动必须支持 generated keys。
- 批量插入时回填行为依赖驱动与框架实现，不同数据库差异较大。
- `keyProperty` 拼写错误会导致回填失败但 SQL 可能成功。
- 分库分表或代理中间件场景要验证回填兼容性。

```text
回填失败排查顺序
1) 检查主键策略与数据库列定义
2) 检查 useGeneratedKeys / keyProperty / keyColumn
3) 打开 SQL 日志确认执行 SQL
4) 检查 JDBC 驱动版本与数据库兼容性
```
