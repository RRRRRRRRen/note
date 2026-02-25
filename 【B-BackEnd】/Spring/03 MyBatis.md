# 基础集成步骤

## 1. 引入依赖

在 `pom.xml` 中添加 MyBatis 和数据库驱动依赖

## 2. 配置数据库连接

**`aapplication.properties` 示例：**

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/employees  
spring.datasource.username=root  
spring.datasource.password=mysql123456  
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver  
  
# 配置映射路径  
mybatis.mapper-locations=classpath:mapper/**.xml  
# 配置数据库字段映射规则，下划线转驼峰  
mybatis.configuration.map-underscore-to-camel-case=true
```

## 3. 编写实体类

在 bean 包中配合 lombok 编写实体类

## 4. 编写 Mapper 接口

在 mapper 包中使用@Mapper 注解编写接口

## 5. 编写 XML 映射文件

在 resources/mapper 中编写映射文件

---

# CRUD 示例

## 1. 创建 `user` 表

```sql
CREATE TABLE user (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  age INT
);
```

## 2. 创建 User 实体类

```java
package com.example.demo.model;

public class User {
  private Long id;
  private String name;
  private Integer age;

  // Getters and Setters
}
```

## 3. 创建 UserMapper 接口

```java
package com.example.demo.mapper;

import com.example.demo.model.User;
import java.util.List;

public interface UserMapper {
  void insertUser(User user);         // 增
  User selectUserById(Long id);       // 查（单个）
  List<User> selectAllUsers();        // 查（全部）
  int updateUser(User user);          // 改
  int deleteUser(Long id);            // 删
}
```

## 4. 创建 UserMapper XML 映射

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.demo.mapper.UserMapper">

  <!-- 插入 -->
  <insert id="insertUser" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO user(name, age)
    VALUES(#{name}, #{age})
  </insert>

  <!-- 查询单个 -->
  <select id="selectUserById" resultType="com.example.demo.model.User">
    SELECT * FROM user WHERE id = #{id}
  </select>

  <!-- 查询全部 -->
  <select id="selectAllUsers" resultType="com.example.demo.model.User">
    SELECT * FROM user
  </select>

  <!-- 更新 -->
  <update id="updateUser">
    UPDATE user
    SET name = #{name}, age = #{age}
    WHERE id = #{id}
  </update>

  <!-- 删除 -->
  <delete id="deleteUser">
    DELETE FROM user WHERE id = #{id}
  </delete>

</mapper>
```

## 5. 调用

```java
@Autowired
private UserMapper userMapper;

// 增加用户
User user = new User();
user.setName("张三");
user.setAge(20);
userMapper.insertUser(user);  // 此时 user.getId() 已被自动填充

// 查询用户
User u = userMapper.selectUserById(user.getId());

// 更新用户
u.setAge(22);
userMapper.updateUser(u);

// 删除用户
userMapper.deleteUser(u.getId());
```

# 参数处理

## 1. 单个简单参数

当方法只有一个参数（且是基本类型或包装类），可以直接在 SQL 中使用 `#{参数名}`，**参数名随意但最好匹配方法参数名**。

```java
User selectUserById(Long id);
```

```xml
<select id="selectUserById" resultType="User">
  SELECT * FROM user WHERE id = #{id}
</select>
```

## 2. 多个参数

MyBatis 会自动将多个参数封装成 `param1`, `param2`, ...，你可以使用：

- `#{param1}`、`#{param2}`（默认名）
- 或者使用 `@Param("自定义名")` 指定

```java
User selectByNameAndAge(@Param("name") String name, @Param("age") int age);
```

```xml
<select id="selectByNameAndAge" resultType="User">
  SELECT * FROM user WHERE name = #{name} AND age = #{age}
</select>
```

## 3. Java 对象参数

如果你传入的是一个对象（如 User），MyBatis 会根据属性名自动映射：

```java
int updateUser(User user);
```

```xml
<update id="updateUser">
  UPDATE user
  SET name = #{name}, age = #{age}
  WHERE id = #{id}
</update>
```

## 4. Map 参数

你可以传入一个 `Map<String, Object>`，然后通过键访问参数：

```java
int updateUserByMap(Map<String, Object> param);
```

```xml
<update id="updateUserByMap">
  UPDATE user
  SET name = #{name}, age = #{age}
  WHERE id = #{id}
</update>
```

---

# 参数处理 - 传参占位符

## 占位符种类

|写法|作用|安全性|用途|
|---|---|---|---|
|`#{}`|预编译参数，占位符|安全|普通参数传递（推荐）|
|`${}`|直接字符串拼接|不安全（可能被 SQL 注入）|动态 SQL 片段（如列名、表名）|

## 详细说明

### 1. `#{}`

**特点**

- MyBatis 会将其转为 **JDBC 的预处理参数**（`?` 占位符）。
- 自动防止 SQL 注入。
- 自动处理类型转换。

**示例**

```java
@Select("SELECT * FROM user WHERE name = #{name}")
User findByName(String name);
```

**底层原理**

```sql
SELECT * FROM user WHERE name = ?
-- JDBC 将 "张三" 安全绑定到参数中
```

### 2. `${}`

**特点**

- MyBatis 会将其当做字符串拼接到 SQL 语句中，**不会加引号或做任何转义**。
- 非常容易造成 SQL 注入，需要手动处理 SQL 注入问题。

**适用情况**

- 列名
- 表名
- 排序字段
- 其他不能用 `#{}` 的动态部分

**示例**

```java
@Select("SELECT * FROM user ORDER BY ${column}")
List<User> orderByColumn(@Param("column") String column);
```

传入 `"name"` 时：

```sql
SELECT * FROM user ORDER BY name
```

---

# 返回处理

## 1. 返回单个对象

当你查询的是一条记录时，返回单个 Java 对象：

```java
User selectUserById(Long id);
```

```xml
<select id="selectUserById" resultType="com.example.User">
  SELECT * FROM user WHERE id = #{id}
</select>
```

## 2. 返回列表 List

查询多条记录时，返回 `List<T>`：

```java
List<User> selectAllUsers();
```

```xml
<select id="selectAllUsers" resultType="com.example.User">
  SELECT * FROM user
</select>
```

## 3. 返回单行数据 Map

用于返回一行数据到 Map 中，列名为 key：

```java
Map<String, Object> selectUserAsMap(Long id);
```

```xml
<select id="selectUserAsMap" resultType="map">
  SELECT * FROM user WHERE id = #{id}
</select>
```

## 4. 返回多行数据 Map

使用 `@MapKey("id")` 指定哪个字段作为 map 的 key：

```java
@MapKey("id")
Map<Long, User> selectAllUsersAsMap();
```

依然使用 resultType 指定实体对象的类型

```xml
<select id="selectAllUsersAsMap" resultType="com.example.User">
  SELECT * FROM user
</select>
```

---

# 返回处理 - ResultMap

## 1. 为什么要用 `resultMap`

用于处理实际开发中常遇到以下情况：

- 数据库字段名和 Java 属性名不一致（如：`user_name` → `userName`）
- 表连接后有字段重复（如两个表都有 `id`）
- 嵌套结构（如：一个 `User` 里包含一个 `Address`）
- 一对多 / 多对一 等复杂结构

## 2. 基本语法

**Xml 语法**

```xml
<resultMap id="userMap" type="com.example.User">
  <id column="user_id" property="id"/>
  <result column="user_name" property="name"/>
  <result column="age" property="age"/>
</resultMap>

<select id="selectUser" resultMap="userMap">
  SELECT user_id, user_name, age FROM user WHERE user_id = #{id}
</select>
```

**标签含义**

|标签|含义|
|---|---|
|`<id>`|指定主键字段映射|
|`<result>`|普通字段的映射|
|`type`|指定 Java 对象类型|

## 3. 使用场景

**嵌套对象**

```java
public class User {
  private Long id;
  private String name;
  private Address address;  // 嵌套对象
}

public class Address {
  private String city;
  private String street;
}
```

```xml
<resultMap id="userWithAddress" type="User">
  <id column="id" property="id"/>
  <result column="name" property="name"/>
  
  <association property="address" javaType="Address">
    <result column="city" property="city"/>
    <result column="street" property="street"/>
  </association>
</resultMap>
```

**一对多集合**

```java
public class Department {
  private Long id;
  private String name;
  private List<User> users;
}
```

```xml
<resultMap id="deptWithUsers" type="Department">
  <id column="dept_id" property="id"/>
  <result column="dept_name" property="name"/>
  
  <collection property="users" ofType="User">
    <id column="user_id" property="id"/>
    <result column="user_name" property="name"/>
  </collection>
</resultMap>
```

# 返回处理 - 回填机制

## 需求说明

我们希望在执行 `INSERT INTO user (name) VALUES ('张三')` 后，把数据库生成的 `id` 填充回 Java 对象的 `user.setId(...)` 中。

## 实现方式

使用 XML 映射

```xml
<insert id="insert" parameterType="com.example.demo.model.User" useGeneratedKeys="true" keyProperty="id">
  INSERT INTO user(name) VALUES(#{name})
</insert>
```

- `useGeneratedKeys="true"`：表示使用数据库自增主键机制。
- `keyProperty="id"`：指定回填字段。

## 注意事项

| 条件         | 要求                                        |
| ---------- | ----------------------------------------- |
| 数据库列       | 必须设置为 `AUTO_INCREMENT`（MySQL）或等价的机制       |
| Java 属性    | 要有 `setId()` 方法（可写）                       |
| MyBatis 配置 | `useGeneratedKeys` 和 `keyProperty` 必须正确设置 |
| 插入语句       | 不包含 `id` 字段，否则数据库不会生成                     |

---

# 返回处理 - 分步查询

> MyBatis 提供的 **分步查询（Stepwise Query / Step Query）** 是一种延迟加载（懒加载）机制，用于处理对象之间复杂的关联关系，比如一对一或一对多关系时，将查询拆分成多个步骤执行，避免一次性查出全部数据，提升性能与灵活性。

## 1. 分步查询的核心思想

将原本一条 SQL 完成的多表查询 **拆成多个单表查询**，并通过对象之间的调用触发后续查询，从而实现 **懒加载**。

## 2. 适用场景

- 一对一 / 一对多关联映射
- 查询数据量大，不希望一次查出所有关联信息
- 提高查询效率、减少冗余数据

## 3. 示例

**场景**

查询一个学生和他的班级信息

**表结构**

```sql
学生表：student(id, name, class_id)
班级表：clazz(id, class_name)
```

**Java 实体类**

```java
public class Student {
  private Integer id;
  private String name;
  private Clazz clazz; // 对应班级信息（延迟加载）
}

public class Clazz {
  private Integer id;
  private String className;
}
```

**Mapper 映射**

```xml
<!-- StudentMapper.xml -->

<!-- 主查询：查询学生 -->
<select id="getStudentById" resultMap="studentMap">
  SELECT * FROM student WHERE id = #{id}
</select>

<!-- 分步查询：定义 ResultMap -->
<resultMap id="studentMap" type="Student">
  <id property="id" column="id"/>
  <result property="name" column="name"/>
  
  <!-- 分步查询：根据 class_id 查询班级 -->
  <association property="clazz" column="class_id"
               select="com.example.ClazzMapper.getClazzById"
               fetchType="lazy"/>
</resultMap>
```

```xml
<!-- ClazzMapper.xml -->

<select id="getClazzById" resultType="Clazz">
  SELECT * FROM clazz WHERE id = #{id}
</select>
```

## 4. 全局懒加载配置

在 `mybatis-config.xml` 中启用懒加载：

```xml
<settings>
  <setting name="lazyLoadingEnabled" value="true"/>
  <setting name="aggressiveLazyLoading" value="false"/>
</settings>
```

## 5. 优点

- 减少一次性加载大量无用数据
- 提高查询效率和响应速度
- 模型清晰，便于扩展和维护

# 动态查询

## 1. 概念

动态 SQL 是指 SQL 语句的一部分根据条件动态拼接，比如：

- 只查询用户指定的字段
- 条件查询中某些 where 子句是可选的
- 更新语句中只更新被修改的字段

## 2. 动态 SQL 标签

|标签|用途|
|---|---|
|`<if>`|根据条件包含某段 SQL|
|`<choose>/<when>/<otherwise>`|类似 Java 的 if-else-if 语句|
|`<where>`|自动拼接 `WHERE` 且去除多余的 `AND/OR`|
|`<set>`|用于更新语句，自动去除尾部的逗号|
|`<trim>`|自定义前缀、后缀、前缀覆盖等|
|`<foreach>`|遍历集合（如列表、数组），多用于 `IN` 查询|
|`<bind>`|绑定临时变量，常用于字符串模糊查询等|

## 3. 各标签示例

### `<if>`

```xml
<select id="getUsers" resultType="User">
  SELECT * FROM users
  <where>
    <if test="name != null and name != ''">
      AND name = #{name}
    </if>
    <if test="age != null">
      AND age = #{age}
    </if>
  </where>
</select>
```

### `<choose>/<when>/<otherwise>`

```xml
<choose>
  <when test="status != null">
    WHERE status = #{status}
  </when>
  <otherwise>
    WHERE status != 'DELETED'
  </otherwise>
</choose>
```

### `<where>`

```xml
<where>
  <if test="type != null"> AND type = #{type} </if>
  <if test="score != null"> AND score &gt; #{score} </if>
</where>
```

等价于拼出的 SQL：

```sql
WHERE type = ? AND score > ?
```

### `<set>`

```xml
<update id="updateUser">
  UPDATE users
  <set>
    <if test="name != null"> name = #{name}, </if>
    <if test="age != null"> age = #{age}, </if>
  </set>
  WHERE id = #{id}
</update>
```

### `<foreach>`

```xml
<select id="getUsersByIds" resultType="User">
  SELECT * FROM users WHERE id IN
  <foreach collection="idList" item="id" open="(" separator="," close=")">
    #{id}
  </foreach>
</select>
```

### `<trim>`

```xml
<trim prefix="WHERE" prefixOverrides="AND |OR ">
  <if test="name != null"> AND name = #{name} </if>
  <if test="status != null"> AND status = #{status} </if>
</trim>
```

### `<bind>`

```xml
<select id="searchUserByName" resultType="User">
  <bind name="likeName" value="'%' + name + '%'" />
  SELECT * FROM users WHERE name LIKE #{likeName}
</select>
```

# 动态查询 - 批量操作

> MyBatis 在批量操作方面支持 **批量插入（Insert）、批量更新（Update）和批量删除（Delete）**，其核心是利用 `<foreach>` 标签遍历集合生成 SQL 语句。掌握这部分内容对于提升数据库操作性能尤为关键，尤其是在大数据量处理场景下。

## 批量操作

### 批量插入

**语法**

```xml
<insert id="insertUsers">
  INSERT INTO users (name, age)
  VALUES
  <foreach collection="userList" item="user" separator=",">
    (#{user.name}, #{user.age})
  </foreach>
</insert>
```

传入参数是一个 `List<User>`，MyBatis 会拼成：

```sql
INSERT INTO users (name, age) VALUES 
('张三', 20),
('李四', 22),
('王五', 25);
```

**优势**

- 一条 SQL 插入多条数据，**效率远高于逐条插入**
- 被多数数据库引擎优化支持

### 批量更新

**语法**

```xml
<update id="updateUsers">
  <foreach collection="userList" item="user" separator=";">
    UPDATE users
    SET name = #{user.name}, age = #{user.age}
    WHERE id = #{user.id}
  </foreach>
</update>
```

**特点**

- 会执行多条 SQL（不是一条 SQL 更新多行）
- 可读性好，但性能提升有限（相较于批量插入）

### 批量删除

```xml
<delete id="deleteUsersByIds">
  DELETE FROM users WHERE id IN
  <foreach collection="idList" item="id" open="(" separator="," close=")">
    #{id}
  </foreach>
</delete>
```

传入 `List<Integer> idList`，生成：

```sql
DELETE FROM users WHERE id IN (1, 2, 3, 4)
```

## 优化建议

- 开启批处理执行模式
- 手动提交事务（批处理模式中必须）
- 防止内存溢出：分批提交、分页处理

# 动态查询 - sql 片段复用

## 1. 定义 SQL 片段

`<sql>` 标签用来定义可复用的 SQL 片段。可以在 XML 中任意位置定义 SQL 片段。

**示例**

定义查询字段和查询条件片段

```xml
<sql id="userColumns">
  id, name, age, email
</sql>

<sql id="userWhereClause">
  WHERE age > #{age} AND status = #{status}
</sql>
```

## 2. 引用 SQL 片段

使用 `<include>` 标签引用定义好的 SQL 片段。

**示例**

在 `SELECT` 语句中引入查询字段和条件片段

```xml
<select id="getUserByAgeAndStatus" resultType="User">
  SELECT
  <include refid="userColumns" />
  FROM users
  <include refid="userWhereClause" />
</select>
```

这样生成的 SQL 将是：

```sql
SELECT id, name, age, email
FROM users
WHERE age > ? AND status = ?
```

## 注意事项

- **避免复杂嵌套**：尽量保持 SQL 片段的简单性，避免过度嵌套。
- **命名规范**：为了可维护性，命名应具有描述性，便于理解 SQL 片段的功能。
- **性能**：虽然 SQL 片段可以提升代码的复用性，但在实际应用中仍然要考虑 SQL 查询的优化，避免过多的动态 SQL 拼接影响性能。

---

# 缓存机制

> MyBatis 的缓存机制是其性能优化的重要组成部分，它能够减少数据库的查询压力，提高应用的响应速度。MyBatis 提供了两级缓存机制：**一级缓存**和**二级缓存**。理解和使用好缓存机制，能够显著提升应用的性能，尤其是在高并发场景下。

## 缓存的基本概念

- **缓存**是存储在内存中的数据副本，能够避免频繁访问数据库。缓存机制有助于提升数据访问速度，减少数据库的负担。
- MyBatis 中的缓存通过 `SqlSession` 和 `SqlSessionFactory` 层来管理，分别对应 **一级缓存** 和 **二级缓存**。

## 一级缓存

### 简介

**一级缓存**是 **SqlSession** 级别的缓存，它是 MyBatis 默认启用的缓存机制。

只要 `SqlSession` 没有关闭或提交，所有通过该 `SqlSession` 执行的查询都会先在一级缓存中查找，如果没有再去数据库查询。

一级缓存的作用范围仅限于 **当前的 SqlSession**。也就是说，在同一个 `SqlSession` 中，多次查询相同的数据，会直接从缓存中获取，而不会再执行 SQL 查询。

### 工作原理

1. **第一次查询**：执行 SQL 查询，结果会存入一级缓存（即当前 `SqlSession`）。
2. **第二次查询**：如果在同一个 `SqlSession` 中执行相同查询，MyBatis 会先从一级缓存中获取数据，而不再执行 SQL。
3. **提交或关闭 `SqlSession`**：一旦 `SqlSession` 被提交或关闭，一级缓存中的数据会被清空。

## 二级缓存

### 简介

**二级缓存**是 **SqlSessionFactory** 级别的缓存，它可以跨 `SqlSession` 共享缓存数据。换句话说，二级缓存的作用范围是 **整个 SqlSessionFactory**（即应用程序中共享的缓存）。
二级缓存可以缓存多个 `SqlSession` 查询的结果，它默认是 **禁用的**，需要手动开启。

### 开启二级缓存

**步骤一：启用二级缓存**

在 `Mapper` 文件中，设置 `<cache/>` 标签来启用二级缓存：

```xml
<mapper namespace="com.example.UserMapper">
  <cache/>
  <!-- 其他 SQL 查询语句 -->
</mapper>
```

**步骤二：配置 MyBatis 使用二级缓存**

在 `mybatis-config.xml` 中，确保二级缓存开启。

```xml
<configuration>
  <settings>
    <setting name="cacheEnabled" value="true"/>
  </settings>
</configuration>
```

### 工作原理

1. **第一次查询**：查询的结果会存入二级缓存中（例如，存储在内存中）。
2. **第二次查询**：不同 `SqlSession` 之间会共享二级缓存，如果查询条件相同，MyBatis 会从二级缓存中获取数据，而不会查询数据库。
3. **缓存失效**：当 `SqlSession` 提交或关闭时，一级缓存会失效，但二级缓存的内容会依然保留，直到 **缓存超时** 或手动清除。
