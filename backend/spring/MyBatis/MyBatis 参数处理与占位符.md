# MyBatis 参数处理与占位符

*类型：knowledge ｜ 难度：基础 ｜ 标签：MyBatis、参数绑定、#{}、${}、动态 SQL*

**MyBatis 的参数体系回答两个问题：参数怎么传进来，值怎么拼进 SQL。传参按个数和形态选择写法——单参数直接引用、多参数用 @Param 命名、对象按属性名取值、Map 按 key 取值；拼值则必须分清两种占位符：#{} 走预编译（转成 ? 后安全绑定），防 SQL 注入，是默认选择；${} 是字符串直接拼接，只用于列名、表名、ORDER BY 字段等无法参数化的 SQL 结构，且值必须来自白名单。动态 SQL 标签（if/where/set/foreach 等）负责按条件拼接语句结构。**

## 参数传递的四种形态

### 单个简单参数

方法只有一个基本类型/包装类参数时，SQL 中直接用 `#{参数名}`，名字随意但建议与形参一致。

```java
User selectUserById(Long id);
```

```xml
<select id="selectUserById" resultType="User">
  SELECT * FROM user WHERE id = #{id}
</select>
```

### 多个参数

MyBatis 会把多个参数封装成 `param1`、`param2`...，但推荐用 `@Param` 指定可读名称：

```java
// @Param 给参数命名，XML 里按名字取值
User selectByNameAndAge(@Param("name") String name, @Param("age") int age);
```

```xml
<select id="selectByNameAndAge" resultType="User">
  SELECT * FROM user WHERE name = #{name} AND age = #{age}
</select>
```

### Java 对象参数

传入对象时，MyBatis 按属性名自动取值（底层走 getter）：

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

### Map 参数

传 `Map<String, Object>` 时按 key 取值：

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

## #{} 与 ${} 的区别

两种占位符的本质差异决定了安全性：

| 写法 | 作用 | 安全性 | 用途 |
| --- | --- | --- | --- |
| `#{}` | 预编译参数占位符（转成 `?`） | 安全，防 SQL 注入 | 普通参数传递（默认选它） |
| `${}` | 字符串直接拼进 SQL | 不安全，可能被注入 | 动态表名、列名、排序字段 |

### #{}：预编译参数

- MyBatis 把它转成 JDBC 预处理语句的 `?` 占位符，值由 JDBC 安全绑定。
- 自动防止 SQL 注入，自动处理类型转换。

```java
@Select("SELECT * FROM user WHERE name = #{name}")
User findByName(String name);
```

实际执行的 SQL：

```sql
SELECT * FROM user WHERE name = ?
-- JDBC 将 "张三" 安全绑定到参数中，值永远只是值，不会改变 SQL 结构
```

### ${}：字符串拼接

- 值不做转义、不加引号，直接拼进 SQL 文本，天然存在注入风险。
- 仅用于 SQL 结构本身无法参数化的部分：列名、表名、排序字段等。

```java
@Select("SELECT * FROM user ORDER BY ${column}")
List<User> orderByColumn(@Param("column") String column);
```

传入 `"name"` 时生成的 SQL：

```sql
SELECT * FROM user ORDER BY name
```

安全要求：`${}` 的取值必须来自代码白名单校验（如只允许 `name`/`age` 两个排序字段），绝不能直接透传用户输入。

## 动态 SQL 标签

SQL 的条件、更新字段、IN 集合等按运行时参数动态拼接。

| 标签 | 用途 |
| --- | --- |
| `<if>` | 根据条件包含某段 SQL |
| `<choose>/<when>/<otherwise>` | 类似 if-else-if 分支 |
| `<where>` | 自动拼接 WHERE 并去掉多余的 AND/OR |
| `<set>` | 更新语句专用，自动去除尾部逗号 |
| `<trim>` | 自定义前缀/后缀及覆盖规则 |
| `<foreach>` | 遍历集合，多用于 IN 查询和批量操作 |
| `<bind>` | 绑定临时变量，常用于模糊查询 |

### 条件查询：if + where

```xml
<select id="getUsers" resultType="User">
  SELECT * FROM users
  <where>
    <!-- test 里是 OGNL 表达式：条件成立才拼接这段 SQL -->
    <if test="name != null and name != ''">
      AND name = #{name}
    </if>
    <if test="age != null">
      AND age = #{age}
    </if>
  </where>
</select>
```

`<where>` 会智能处理：内部有内容才加 WHERE，且去掉开头多余的 `AND`，拼出 `WHERE type = ? AND score > ?` 这样的干净语句。

### 分支选择：choose / when / otherwise

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

### 更新语句：set

```xml
<update id="updateUser">
  UPDATE users
  <set>
    <!-- 只更新传了值的字段，<set> 自动去掉末尾多余逗号 -->
    <if test="name != null"> name = #{name}, </if>
    <if test="age != null"> age = #{age}, </if>
  </set>
  WHERE id = #{id}
</update>
```

### 遍历集合：foreach

```xml
<select id="getUsersByIds" resultType="User">
  SELECT * FROM users WHERE id IN
  <!-- collection 指参数名，item 是元素变量，open/close 补括号，separator 定分隔符 -->
  <foreach collection="idList" item="id" open="(" separator="," close=")">
    #{id}
  </foreach>
</select>
```

### 自定义拼接：trim 与 bind

```xml
<!-- trim 等价手写版 where：prefix 加前缀，prefixOverrides 去掉开头多余的 AND/OR -->
<trim prefix="WHERE" prefixOverrides="AND |OR ">
  <if test="name != null"> AND name = #{name} </if>
  <if test="status != null"> AND status = #{status} </if>
</trim>

<!-- bind 绑定临时变量：拼接 LIKE 的通配符 -->
<select id="searchUserByName" resultType="User">
  <bind name="likeName" value="'%' + name + '%'" />
  SELECT * FROM users WHERE name LIKE #{likeName}
</select>
```

## 批量操作

利用 `<foreach>` 遍历集合生成批量 SQL。

### 批量插入

```xml
<insert id="insertUsers">
  INSERT INTO users (name, age)
  VALUES
  <!-- 每个元素生成一组 (值, 值)，逗号分隔，一条 SQL 插入多行 -->
  <foreach collection="userList" item="user" separator=",">
    (#{user.name}, #{user.age})
  </foreach>
</insert>
```

生成的 SQL，效率远高于逐条插入：

```sql
INSERT INTO users (name, age) VALUES
('张三', 20),
('李四', 22),
('王五', 25);
```

### 批量更新

```xml
<update id="updateUsers">
  <!-- 分号分隔多条 UPDATE，需开启 allowMultiQueries 支持多语句 -->
  <foreach collection="userList" item="user" separator=";">
    UPDATE users
    SET name = #{user.name}, age = #{user.age}
    WHERE id = #{user.id}
  </foreach>
</update>
```

特点：执行的是多条 SQL 而非一条更新多行，可读性好但性能提升有限。

### 批量删除

```xml
<delete id="deleteUsersByIds">
  DELETE FROM users WHERE id IN
  <foreach collection="idList" item="id" open="(" separator="," close=")">
    #{id}
  </foreach>
</delete>
```

生成：

```sql
DELETE FROM users WHERE id IN (1, 2, 3, 4)
```

大批量操作优化：开启批处理执行模式（ExecutorType.BATCH）、手动提交事务、分批提交防止内存溢出。

## SQL 片段复用

`<sql>` 定义可复用片段，`<include>` 引用，减少重复。

```xml
<!-- 定义：查询字段与公共条件 -->
<sql id="userColumns">
  id, name, age, email
</sql>

<sql id="userWhereClause">
  WHERE age > #{age} AND status = #{status}
</sql>

<!-- 引用 -->
<select id="getUserByAgeAndStatus" resultType="User">
  SELECT
  <include refid="userColumns" />
  FROM users
  <include refid="userWhereClause" />
</select>
```

注意事项：

- 片段保持简单，避免过度嵌套。
- 命名要有描述性，便于理解片段功能。
- 复用不等于免优化，动态拼接层数过多仍会影响性能。
