# MyBatis 集成与 CRUD

*类型：knowledge ｜ 难度：基础 ｜ 标签：MyBatis、Spring Boot、CRUD、ResultMap*

**MyBatis 与 Spring Boot 集成的核心是三件套：配置数据源与 mapper-locations、@Mapper 接口、XML 映射文件，三者靠「namespace = 接口全限定名 + id = 方法名」绑定。CRUD 写法的关键点只有两个：参数统一用 #{} 预编译占位符传值；结果映射用 resultType 驼峰自动映射或 resultMap 手工对齐，字段名不一致、嵌套关联、主键回填分别对应 map-underscore-to-camel-case、association/collection、useGeneratedKeys 三种解法。**

## 基础集成步骤

### 1. 引入依赖

在 `pom.xml` 中添加 MyBatis（或 mybatis-spring-boot-starter）和数据库驱动依赖。

### 2. 配置数据库连接

```properties
# 数据源
spring.datasource.url=jdbc:mysql://localhost:3306/employees
spring.datasource.username=root
spring.datasource.password=mysql123456
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# XML 映射文件的扫描路径
mybatis.mapper-locations=classpath:mapper/**.xml
# 数据库下划线字段自动映射为 Java 驼峰属性：user_name -> userName
mybatis.configuration.map-underscore-to-camel-case=true
```

### 3. 编写实体类

在 bean 包中配合 Lombok 编写实体类。

### 4. 编写 Mapper 接口

在 mapper 包中使用 `@Mapper` 注解标注接口（或启动类加 `@MapperScan` 批量扫描）。

### 5. 编写 XML 映射文件

放在 `resources/mapper` 目录下（与 `mapper-locations` 配置对应）。

## CRUD 完整示例

### 建表与实体类

```sql
CREATE TABLE user (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  age INT
);
```

```java
package com.example.demo.model;

public class User {
    private Long id;
    private String name;
    private Integer age;

    // Getters and Setters
}
```

### Mapper 接口

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

### XML 映射文件

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<!-- namespace 必须是 Mapper 接口的全限定名，通过它绑定接口 -->
<mapper namespace="com.example.demo.mapper.UserMapper">

  <!-- 插入：useGeneratedKeys + keyProperty 把自增主键回填到 user.id -->
  <insert id="insertUser" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO user(name, age)
    VALUES(#{name}, #{age})
  </insert>

  <!-- 查询单个：resultType 指定返回类型 -->
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

### 调用

```java
@Autowired
private UserMapper userMapper;

// 增：插入后 user.id 已被自动回填
User user = new User();
user.setName("张三");
user.setAge(20);
userMapper.insertUser(user);

// 查
User u = userMapper.selectUserById(user.getId());

// 改
u.setAge(22);
userMapper.updateUser(u);

// 删
userMapper.deleteUser(u.getId());
```

## 返回值处理

| 场景 | 接口返回类型 | XML 写法 |
| --- | --- | --- |
| 单条记录 | `User` | `resultType` 指实体类 |
| 多条记录 | `List<User>` | `resultType` 仍指实体类，MyBatis 自动装 List |
| 单行转 Map | `Map<String, Object>` | `resultType="map"`，列名为 key |
| 多行转 Map | `@MapKey("id") Map<Long, User>` | `resultType` 指实体类，注解指定哪个字段作 key |

```java
// 多行转 Map：@MapKey 指定实体属性作为外层 Map 的 key
@MapKey("id")
Map<Long, User> selectAllUsersAsMap();
```

## ResultMap 结果映射

`resultType` 依赖「列名 = 属性名」的约定，遇到字段名不一致、字段重复、嵌套结构时需要 `resultMap` 手工对齐。

### 基本语法

```xml
<!-- id 供 select 引用，type 指定 Java 对象类型 -->
<resultMap id="userMap" type="com.example.User">
  <id column="user_id" property="id"/>      <!-- id 标签：主键映射 -->
  <result column="user_name" property="name"/> <!-- result 标签：普通字段 -->
  <result column="age" property="age"/>
</resultMap>

<select id="selectUser" resultMap="userMap">
  SELECT user_id, user_name, age FROM user WHERE user_id = #{id}
</select>
```

### 嵌套对象（一对一）

```java
public class User {
    private Long id;
    private String name;
    private Address address; // 嵌套对象
}

public class Address {
    private String city;
    private String street;
}
```

```xml
<!-- association 处理「有一个」的关联 -->
<resultMap id="userWithAddress" type="User">
  <id column="id" property="id"/>
  <result column="name" property="name"/>

  <association property="address" javaType="Address">
    <result column="city" property="city"/>
    <result column="street" property="street"/>
  </association>
</resultMap>
```

### 一对多集合

```xml
<!-- collection 处理「有一堆」的关联，ofType 指定集合元素类型 -->
<resultMap id="deptWithUsers" type="Department">
  <id column="dept_id" property="id"/>
  <result column="dept_name" property="name"/>

  <collection property="users" ofType="User">
    <id column="user_id" property="id"/>
    <result column="user_name" property="name"/>
  </collection>
</resultMap>
```

## 主键回填

需求：`INSERT` 后把数据库生成的自增 `id` 填回 Java 对象。

```xml
<insert id="insert" parameterType="com.example.demo.model.User"
        useGeneratedKeys="true" keyProperty="id">
  INSERT INTO user(name) VALUES(#{name})
</insert>
```

- `useGeneratedKeys="true"`：使用数据库自增主键机制。
- `keyProperty="id"`：指定回填到对象的哪个属性。

生效条件：

| 条件 | 要求 |
| --- | --- |
| 数据库列 | 必须是 `AUTO_INCREMENT`（MySQL）或等价机制 |
| Java 属性 | 有可写的 `setId()` |
| 插入语句 | 不包含 `id` 字段，否则数据库不会生成 |

## 分步查询与懒加载

把一条多表 JOIN 拆成多个单表查询，通过关联属性的首次访问触发后续查询，避免一次性加载全部关联数据。

```xml
<!-- StudentMapper.xml：主查询只查学生，班级字段交给分步查询 -->
<resultMap id="studentMap" type="Student">
  <id property="id" column="id"/>
  <result property="name" column="name"/>

  <!-- column="class_id" 把主查询的该列传给子查询；fetchType="lazy" 懒加载 -->
  <association property="clazz" column="class_id"
               select="com.example.ClazzMapper.getClazzById"
               fetchType="lazy"/>
</resultMap>

<select id="getStudentById" resultMap="studentMap">
  SELECT * FROM student WHERE id = #{id}
</select>
```

```xml
<!-- ClazzMapper.xml：子查询按 id 查班级 -->
<select id="getClazzById" resultType="Clazz">
  SELECT * FROM clazz WHERE id = #{id}
</select>
```

全局懒加载配置：

```xml
<settings>
  <setting name="lazyLoadingEnabled" value="true"/>
  <setting name="aggressiveLazyLoading" value="false"/>
</settings>
```

优点：减少一次性加载无用数据、提高响应速度；适用一对一/一对多关联、关联数据量大但不一定访问的场景。

## 缓存机制

MyBatis 提供两级缓存，分别由 `SqlSession` 和 `SqlSessionFactory` 层管理：

- 缓存是存储在内存中的数据副本，能避免频繁访问数据库，减少数据库压力、提升响应速度
- 一级缓存默认开启，二级缓存需要手动开启

### 一级缓存

一级缓存是 `SqlSession` 级别的缓存，MyBatis 默认启用。只要 `SqlSession` 没有关闭或提交，通过该 `SqlSession` 执行的所有查询都会先查一级缓存，没有命中再去查数据库。作用范围仅限于当前的 `SqlSession`：同一个 `SqlSession` 中多次查询相同数据，直接从缓存获取，不再执行 SQL。

工作原理：

1. 第一次查询：执行 SQL，结果存入当前 `SqlSession` 的一级缓存
2. 第二次查询：同一个 `SqlSession` 中执行相同查询，直接从一级缓存获取，不再执行 SQL
3. 提交或关闭 `SqlSession`：一级缓存中的数据被清空

### 二级缓存

二级缓存是 `SqlSessionFactory` 级别的缓存，作用范围是整个 `SqlSessionFactory`，可以跨 `SqlSession` 共享缓存数据。默认禁用，需要手动开启。

开启步骤：

```xml
<!-- 步骤一：在 Mapper 映射文件中加 <cache/> 标签 -->
<mapper namespace="com.example.UserMapper">
  <cache/>
  <!-- 其他 SQL 查询语句 -->
</mapper>
```

```xml
<!-- 步骤二：确保全局配置中二级缓存开启 -->
<configuration>
  <settings>
    <setting name="cacheEnabled" value="true"/>
  </settings>
</configuration>
```

工作原理：

1. 第一次查询：结果存入二级缓存
2. 第二次查询：不同 `SqlSession` 之间共享二级缓存，查询条件相同时直接从二级缓存获取，不查数据库
3. 缓存失效：`SqlSession` 提交或关闭时一级缓存失效，二级缓存内容依然保留，直到缓存超时或手动清除
