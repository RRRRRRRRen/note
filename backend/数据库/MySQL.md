# 其他知识点

配置路径

export PATH=${PATH}:/usr/local/mysql/bin

登录

```shell
mysql -uroot -pmysql123456
# 等价于
mysql -u root -P 3306 -h localhost -pmysql123456
```

-p 后可以不明文写入密码，根据提示再输入密码

查看版本

```shell
select version();
```

查看数据库

```shell
show databases;
```

返回

```text
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
```

**1. information_schema**

**用途：提供数据库元数据（metadata）**

这是一个 **虚拟数据库**，里面没有真实的表数据，但可以查询所有数据库的结构信息，比如表、列、索引、视图、权限等等。

**2. mysql**

**用途：核心系统信息（权限、账号、系统设置）**

**3. performance_schema**

**用途：性能统计与监控**

**4. sys**

**用途：让 performance_schema 更容易读懂**

| **数据库**         | **类型** | **用途**                 | **是否可删**              |
| ------------------ | -------- | ------------------------ | ------------------------- |
| information_schema | 虚拟库   | 查结构信息（表、字段等） | ❌ 不可删                 |
| mysql              | 实体库   | 系统账户与权限核心       | ❌ 不可删                 |
| performance_schema | 实体库   | 性能监控数据             | ❌ 不可删（可选择不开启） |
| sys                | 虚拟视图 | 友好封装性能数据         | ❌ 不可删                 |

显示当前数据库相关字符集

```shell'
show variables like 'character_%';
```

返回

```text
+--------------------------+-------------------------------------------------------+
| Variable_name            | Value                                                 |
+--------------------------+-------------------------------------------------------+
| character_set_client     | utf8mb4                                               |
| character_set_connection | utf8mb4                                               |
| character_set_database   | utf8mb4                                               |
| character_set_filesystem | binary                                                |
| character_set_results    | utf8mb4                                               |
| character_set_server     | utf8mb4                                               |
| character_set_system     | utf8mb3                                               |
| character_sets_dir       | /usr/local/mysql-8.0.41-macos15-arm64/share/charsets/ |
+--------------------------+-------------------------------------------------------+
```

8.0 使用 utf-8

5.7 使用 latin，需要手动修改字符集设置

显示比较规则

```shell
show variables like 'collation_%';
```

返回

```text
+----------------------+--------------------+
| Variable_name        | Value              |
+----------------------+--------------------+
| collation_connection | utf8mb4_0900_ai_ci |
| collation_database   | utf8mb4_0900_ai_ci |
| collation_server     | utf8mb4_0900_ai_ci |
+----------------------+--------------------+
```

## 创建数据库测试案例

```shell
# 创建一个名为dbtest的数据库
create database dbtest;

# 使用dbtest数据库
use dbtest;

# 创建一个叫做employees的表，并且设置两个字段
create table employees(id int,name varchar(15));

# 插入数据
insert into employees values(1001, 'tom');
insert into employees values(1002,'张伟');

# 查询数据
select * from employees;
```

## 导入开源测试数据库

```shell
# 克隆开源数据项目
git clone git@github.com:datacharmer/test_db.git

# 进入文件夹
cd ~/Github/test_db

# 导入数据
mysql -t -uroot -p <employees.sql
```

## 查询

### 1. 语法

`SELECT 字段1,字段2,... FROM 数据表;`

```sql
SELECT * FROM employees;
```

`*` 表示该表下的所有字段

## 列的别名（Alias）

> 在 MySQL 中，**列的别名（Alias）** 是你在查询结果中给某一列临时取的名字，常用于让输出更清晰、便于展示或用于后续处理。

### 1. 基本语法

```sql
SELECT column_name AS alias_name FROM table_name;
```

**AS** 是可选的：

```sql
-- 这两种写法效果完全一样
SELECT name AS username FROM users;
SELECT name username FROM users;
```

**双引号** 是可选的：

```sql
SELECT name "username", emp_id "emp id" FROM users;
```

### 2. 别名的用途和场景

**让列名更有意义**

```sql
SELECT first_name AS 'First Name', last_name AS 'Last Name' FROM employees;
```

## 去除重复行

> 在 MySQL 中，**去除重复行**是很常见的数据处理操作，尤其在数据清洗或报表统计场景里。下面我从不同层面来介绍如何实现去重。

### 1. 使用 DISTINCT 去除重复的结果行

这是最常见、最简单的方式，**作用于 SELECT 结果集**。

**基本语法**

```sql
SELECT DISTINCT column1, column2, ...
FROM table_name;
```

它会去除那些 **在所有选中字段中值都一样** 的行。

**示例**

```
-- 示例数据（users 表）：
+----+--------+-------+
| id | name   | city  |
+----+--------+-------+
| 1  | Tom    | NY    |
| 2  | Jerry  | LA    |
| 3  | Tom    | NY    |
+----+--------+-------+

-- 去重查询：
SELECT DISTINCT name, city FROM users;

-- 结果：
+--------+-------+
| name   | city  |
+--------+-------+
| Tom    | NY    |
| Jerry  | LA    |
+--------+-------+
```

**注意**

- DISTINCT 是对 **整行判断是否重复**，只要有一列不同就不会去掉。

- 如果你只选一列，那就是对那一列去重。

## 空值（NULL）参与运算

> 在 MySQL 中，**空值（NULL）参与运算**时的行为和普通值是完全不同的，很多初学者会因为它而踩坑。下面我来详细讲讲这个问题。

### 1. 什么是 NULL

- NULL 不是空字符串 ''、也不是数字 0，而是**未知、缺失、不可用的数据**

- 它表示“什么都没有”或“值还未确定”

- 所以：**任何和 NULL 参与的运算，结果都是 NULL（未知）**

### 2. NULL 参与算术运算

```
SELECT 100 + NULL;      -- 结果是 NULL
SELECT NULL * 5;        -- 结果是 NULL
SELECT NULL / 10;       -- 结果是 NULL
```

### 3. 解决 NULL 运算的常用方式

**用 IFNULL(expr, value)：如果为 NULL，就替换成默认值**

```sql
SELECT IFNULL(price, 0) + 100 FROM products;
```

## 与关键字重名解决方案

> 在 MySQL 中，如果你的**表名或列名和关键字重名**，会引发语法错误或意外行为。比如你把表命名为 order、select、desc 等关键词，SQL 就容易“读错”。

### 1. 解决方案

**解决方法：用 反引号 包起来**

```sql
SELECT * FROM `order`;
```

```sql
SELECT `select`, `from` FROM `table`;
```

## 查询常数

> MySQL 中的“查询常数”指的是在 SELECT 语句中查询一个固定值（常量），而**不是从数据库表中读取字段或记录**。这种查询通常用于测试、函数调用、语法练习或用于某些控制流程的构造。

### 1. 查询常数的基本形式

```sql
SELECT 1;
SELECT 'hello';
SELECT 3.14;
SELECT NOW();
```

这些查询没有涉及任何表，返回的只是一个“常量结果”。

**示例**

```
mysql> SELECT 1;
+---+
| 1 |
+---+
| 1 |
+---+

mysql> SELECT 'MySQL 是开源的';
+------------------+
| MySQL 是开源的   |
+------------------+
| MySQL 是开源的   |
+------------------+

mysql> SELECT NOW();
+---------------------+
| NOW()               |
+---------------------+
| 2025-03-16 21:30:00 |
+---------------------+
```

### 2. 常数查询的常见应用场景

**测试数据库连接/状态**

许多中间件（如连接池）会执行这句来测试数据库是否还活着。

```
SELECT 1;
```

**占位测试 / 返回固定值**

用来快速构造一个“接口返回”的假数据。

```
SELECT 'OK' AS status, 200 AS code;
```

**多列常数**

你可以一次性查多个常数值，起别名模拟一条记录。

```
SELECT 1 AS id, '张三' AS name, 5000 AS salary;
```

**混合常数和字段**

你可以把常量和字段一起查出来，这会为每一行都多出一个固定值 status = '已处理'。

```
SELECT id, name, '已处理' AS status
FROM orders;
```

## 显示表结构

> DESCRIBE（或简写成 DESC）是 MySQL 中非常常用的命令，用来**查看某张表的结构信息**，比如字段名、类型、是否可以为 NULL、主键、默认值等。

### 1. 基本语法

```
DESCRIBE 表名;
-- 或
DESC 表名;
```

### 2. 示例

假设有这样一张表：

```
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  age INT DEFAULT 18,
  created_at DATETIME
);
```

执行：

```
DESC users;
```

结果：

| **Field**  | **Type**     | **Null** | **Key** | **Default** | **Extra**      |
| ---------- | ------------ | -------- | ------- | ----------- | -------------- |
| id         | int          | NO       | PRI     | NULL        | auto_increment |
| username   | varchar(50)  | NO       |         | NULL        |                |
| email      | varchar(100) | YES      |         | NULL        |                |
| age        | int          | YES      |         | 18          |                |
| created_at | datetime     | YES      |         | NULL        |                |

### 3. 列含义

| **列名**    | **含义**                                                       |
| ----------- | -------------------------------------------------------------- |
| **Field**   | 字段名                                                         |
| **Type**    | 字段类型                                                       |
| **Null**    | 是否允许为 NULL (YES/NO)                                       |
| **Key**     | 键类型：PRI 主键、UNI 唯一键、MUL 多个值可重复的索引           |
| **Default** | 默认值（没有则为 NULL）                                        |
| **Extra**   | 额外信息，比如：auto_increment、on update CURRENT_TIMESTAMP 等 |

## 条件查询

> 在 MySQL 中，WHERE 子句用于 **过滤数据**，只返回满足条件的行，是 SELECT、UPDATE、DELETE 等语句中最常见和核心的部分之一。

### 1. 基本语法

```
SELECT 字段列表
FROM 表名
WHERE 条件;
```

### 2. 示例

**示例数据表：users**

| **id** | **name** | **age** | **gender** |
| ------ | -------- | ------- | ---------- |
| 1      | 张三     | 25      | male       |
| 2      | 李四     | 30      | female     |
| 3      | 王五     | 22      | male       |
| 4      | 赵六     | 28      | female     |

**(1) 基础条件**

```sql
SELECT * FROM users
WHERE age > 25;
```

返回年龄大于 25 岁的用户。

**(2) 多条件查询（AND / OR）**

```sql
SELECT * FROM users
WHERE age > 20 AND gender = 'male';
```

多个条件必须都满足（AND）或满足其一（OR）。

**(3) IN：匹配多个值**

```sql
SELECT * FROM users
WHERE name IN ('张三', '王五');
```

**(4) BETWEEN：范围查询**

```sql
SELECT * FROM users
WHERE age BETWEEN 20 AND 28;
```

包含边界：20 ≤ age ≤ 28。

**(5) LIKE：模糊匹配**

```sql
SELECT * FROM users
WHERE name LIKE '张%';
```

% 表示任意长度的任意字符。

**(6) IS NULL / IS NOT NULL**

```sql
SELECT * FROM users
WHERE gender IS NOT NULL;
```

用于判断字段是否为空值。

**(7) NOT：逻辑取反**

```sql
SELECT * FROM users
WHERE NOT (age < 25);
```

等价于：age >= 25

### 3. WHERE 使用范围

| **类型** | **示例**     |
| -------- | ------------ |
| SELECT   | 过滤查询结果 |
| UPDATE   | 限定更新范围 |
| DELETE   | 限定删除范围 |

**例如**

```sql
DELETE FROM users WHERE age < 18;
UPDATE users SET age = age + 1 WHERE gender = 'male';
```

# 运算符

## 算数运算符

> SQL 中的算术运算符主要用于数值类型的字段或表达式之间的计算操作，常用于 `SELECT` 查询、`UPDATE` 赋值等语句中。

### 1. 常见算术运算符

| 运算符 | 含义         | 示例    |
| ------ | ------------ | ------- |
| `+`    | 加法         | `a + b` |
| `-`    | 减法         | `a - b` |
| `*`    | 乘法         | `a * b` |
| `/`    | 除法         | `a / b` |
| `%`    | 取模（求余） | `a % b` |

### 2. 注意事项

- / 运算符在整数除法中，**结果可能是小数**，取决于字段的数据类型。

- % 运算符在 MySQL 中可直接用于模运算（不同于某些 SQL 方言，如 Oracle 使用 MOD(a, b)）。

- 空值参与计算时，结果通常为 NULL。例如：

```sql
SELECT NULL + 5;  -- 结果为 NULL
```

## 比较运算符

> 比较运算符用于在 SQL 中比较两个值的大小、是否相等等，通常出现在 `WHERE` 子句中，用于过滤符合条件的数据。

**常见的比较运算符**

| 运算符     | 含义     | 示例           |
| ---------- | -------- | -------------- |
| `=`        | 等于     | `price = 10`   |
| `<=>`      | 安全等于 | `price <=> 10` |
| `<>`/ `!=` | 不等于   | `price <> 10`  |
| `>`        | 大于     | `price > 10`   |
| `<`        | 小于     | `price < 10`   |
| `>=`       | 大于等于 | `price >= 10`  |
| `<=`       | 小于等于 | `price <= 10`  |

### 1. `=`

注意

字符串比较存在隐式准换，如果转换不成功，则视为 0

两边都是字符串的话，按照 ansi 的比较规则进行比较

只要与 null 进行比较，结果就为 null

```sql
SELECT 1 = 2, 1 = '1', 1 = 'a', 0 = 'a' FROM DUAL;
```

返回

0 1 0 1

### 2. `<=>`

注意

用于判断 null，null 与 null 判断会返回 1

只有这个比较运算符可以判断是否为 null，其他判断都返回 null

## 关键字式比较运算符

> 很好，你提到的 IS NULL 属于 **特殊的比较语法**，在 SQL 中除了基本的 =, <>, >, < 这些通用比较运算符，还有一些类似 IS NULL 的 **关键字式比较运算符**，常用于处理集合、区间、模式匹配等。

**关键字式比较运算符速查表**

| **类型**   | **运算符**                         |
| ---------- | ---------------------------------- |
| 空值判断   | IS NULL, IS NOT NULL               |
| 范围判断   | BETWEEN, NOT BETWEEN               |
| 集合判断   | IN, NOT IN                         |
| 模式匹配   | LIKE, NOT LIKE, REGEXP, NOT REGEXP |
| 布尔值判断 | IS TRUE, IS FALSE, IS UNKNOWN      |
| 子查询判断 | EXISTS, NOT EXISTS                 |

### 1. 空值判断

| **语法**    | **含义**          |
| ----------- | ----------------- |
| IS NULL     | 判断是否为 NULL   |
| IS NOT NULL | 判断是否不为 NULL |

```sql
SELECT last_name, salary
FROM employees
WHERE commission_pct IS NOT NULL;
```

```sql
SELECT last_name, salary
FROM employees
WHERE ISNULL(commission_pct);
```

### 2. 范围判断

| **语法**            | **含义**                         |
| ------------------- | -------------------------------- |
| BETWEEN a AND b     | 判断是否在区间 [a, b] 内，含边界 |
| NOT BETWEEN a AND b | 判断是否不在区间 [a, b] 内       |

**注意**

- a 和 b 即上限和下限，不能交换顺序。

**示例：**

```sql
SELECT * FROM products
WHERE price BETWEEN 3 AND 6;
```

### 3. 集合判断

| **语法**                 | **含义**                     |
| ------------------------ | ---------------------------- |
| IN (值 1, 值 2, ...)     | 判断是否属于某个集合中的值   |
| NOT IN (值 1, 值 2, ...) | 判断是否不属于某个集合中的值 |

**示例：**

```sql
SELECT * FROM products
WHERE name IN ('Apple', 'Mango');
```

### 4. 模式匹配

| **语法**       | **含义**                      |
| -------------- | ----------------------------- |
| LIKE           | 模糊匹配，支持 % 和 \_ 通配符 |
| NOT LIKE       | 不匹配给定模式                |
| REGEXP / RLIKE | 使用正则表达式进行匹配        |
| NOT REGEXP     | 正则表达式不匹配              |

**通配符说明：**

- %：匹配任意多个字符（包括 0 个）

- \_：匹配任意一个字符
- 如果需要匹配字符`_`等字符时，可是使用转义符`\`匹配

**示例：**

```sql
-- 查询以 'A' 开头的商品名
SELECT * FROM products
WHERE name LIKE 'A%';

-- 查询名称中包含 "an" 的商品
SELECT * FROM products
WHERE name LIKE '%an%';
```

### 5. 布尔判断

| **语法**   | **含义**                                        |
| ---------- | ----------------------------------------------- |
| IS TRUE    | 判断是否为 TRUE（在布尔表达式中）               |
| IS FALSE   | 判断是否为 FALSE                                |
| IS UNKNOWN | 判断布尔表达式结果是否为 UNKNOWN（通常为 NULL） |

### 6. 其它常见结构

| **语法**            | **含义**               |
| ------------------- | ---------------------- |
| EXISTS (子查询)     | 判断子查询是否有结果   |
| NOT EXISTS (子查询) | 判断子查询是否没有结果 |

## 逻辑运算符

> 逻辑运算符主要是用来组合多个判断条件的，一般用于 WHERE、HAVING 等子句中，最终返回一个布尔值：TRUE / FALSE / UNKNOWN。

### 1. 常见逻辑运算符

**AND**：并且，两个条件都成立才为真

```sql
SELECT * FROM products
WHERE price > 3 AND stock < 50;
```

**OR**：或者，只要有一个条件成立就为真

```sql
SELECT * FROM products
WHERE price < 2 OR stock > 100;
```

**NOT**：取反

```sql
SELECT * FROM products
WHERE NOT price = 5;
```

**XOR**：异或

```sql
SELECT * FROM products
WHERE price < 2 XOR stock > 100;
```

### 2. 逻辑优先级

**默认顺序**

NOT > AND > OR

**例子**

```sql
-- 这句容易歧义：
SELECT * FROM products
WHERE price > 3 OR price < 2 AND stock > 50;

-- 推荐加括号明确意图：
SELECT * FROM products
WHERE price > 3 OR (price < 2 AND stock > 50);
```

### 3. NULL 的特殊情况

- NULL 不是 TRUE，也不是 FALSE，它是 **UNKNOWN**。

- 这会导致一些逻辑判断“看起来没问题”，其实结果是 NULL，不会选中任何行。

**例如**

```sql
SELECT * FROM products
WHERE discount > 0.9;  -- 如果 discount 是 NULL，这个条件返回 NULL，不是 FALSE
```

**正确做法**

```sql
WHERE discount IS NOT NULL AND discount > 0.9;
```

## 位运算符

> 好嘞～虽然在 SQL 中不太常用，但 **位运算符** 也是 SQL 支持的一种运算方式，适用于需要处理**权限标志位**、**状态组合**、**压缩存储的整型字段**等场景。
>
> 位运算（Bitwise Operation）是直接对整数的二进制位进行操作。SQL（尤其是 MySQL）中也支持这一类操作，通常适用于整数类型字段。

### 1. 常见的位运算符

| **运算符** | **名称**     | **含义**                                        | **示例**               |
| ---------- | ------------ | ----------------------------------------------- | ---------------------- |
| &          | 按位与 AND   | 两位都为 1，则结果为 1                          | 6 & 3 = 2              |
| `          | `            | 按位或 OR                                       | 有一位为 1，则结果为 1 |
| ^          | 按位异或 XOR | 不同为 1，相同为 0                              | 6 ^ 3 = 5              |
| ~          | 按位取反 NOT | 对所有位取反（在 MySQL 中是补码）               | ~6 = -7                |
| <<         | 左移         | 所有位向左移动，低位补 0，相当于乘以 2 的幂     | 3 << 2 = 12            |
| >>         | 右移         | 所有位向右移动，高位补符号位，相当于除以 2 的幂 | 8 >> 2 = 2             |

### 2. 注意事项

- 位运算只能用于整数类型字段。

- ~ 的结果是负数，因为 MySQL 使用补码方式处理。

- 在业务层维护权限位时，最好封装好权限掩码，避免魔法数字。

## 运算符优先级

> 好问题！在 SQL 中，多个运算符组合使用时是有 **优先级**（也叫操作符优先顺序）的，了解这个可以避免写出逻辑歧义的语句，避免出现“我写的不是我想的”。

### 1. 运算符优先级表（从高到低）

| **优先级** | **运算符**                                 | **类型** | **示例**                 |
| ---------- | ------------------------------------------ | -------- | ------------------------ |
| 1          | ()                                         | 括号     | (price + tax) \* 0.9     |
| 2          | \*, /, %                                   | 算术运算 | price \* 1.05            |
| 3          | +, -                                       | 算术运算 | price - discount         |
| 4          | =, !=, <, >, <=, >=, IS, LIKE, BETWEEN, IN | 比较运算 | price >= 100             |
| 5          | NOT                                        | 逻辑非   | NOT price > 5            |
| 6          | AND                                        | 逻辑与   | price > 3 AND stock > 10 |
| 7          | OR                                         | 逻辑或   | stock < 10 OR price < 2  |

### 2. 推荐习惯

- **始终用括号明确你的逻辑组合**，特别是有 AND 和 OR 混用的时候。

- 一些数据库（包括 MySQL）虽然能根据优先级解析，但加括号更安全、清晰、可维护。

- 括号还能帮助你调试 SQL 时快速分块分析。

# 排序

## 1. 基础语法

ORDER BY 是 SQL 中用来对查询结果排序的关键字，默认是升序。

**语法结构**

```sql
SELECT column1, column2
FROM table_name
ORDER BY column1 [ASC|DESC], column2 [ASC|DESC], ...;
```

## 2. 排序顺序

| **关键词** | **说明**     |
| ---------- | ------------ |
| ASC        | 升序（默认） |
| DESC       | 降序         |

```sql
-- 按价格升序
SELECT * FROM products
ORDER BY price;

-- 按价格降序
SELECT * FROM products
ORDER BY price DESC;

-- 先按价格降序，再按库存升序
SELECT * FROM products
ORDER BY price DESC, stock ASC;
```

## 3. 使用别名排序

- 列的别名只能在`ORDER BY`中使用，不能在`WHERE`中使用。

```sql
SELECT name, price * 10 total, stock
FROM products
ORDER BY total DESC;
```

## 4. 多列排序

- 需要多个排序条件时，使用逗号隔开即可
- 使用多列排序时，首先排序的第一列必须有相同的列值，才会对第二列进行排序，如果第一列的值都是唯一的，则不会生效。

```sql
SELECT name, price * 10 total, stock
FROM products
ORDER BY total DESC, stock;
```

## 5. 配合函数排序

可以直接在排序中使用表达式、函数：

```sql
-- 按折扣价排序（price * 0.9）
SELECT *, price * 0.9 AS discount_price
FROM products
ORDER BY discount_price ASC;

-- 按名称长度排序
SELECT * FROM products
ORDER BY LENGTH(name) DESC;
```

## 6. NULL 值的排序顺序

**规则**

默认排序时，NULL 的位置依数据库略有不同，在 MySQL 中

- 升序：NULL 会排最前面

- 降序：NULL 会排最后面

**手动控制 NULL 排在最后**

```sql
-- 将 NULL 作为最大值，排在最后
ORDER BY ISNULL(some_column), some_column ASC;
```

或者：

```sql
ORDER BY CASE WHEN some_column IS NULL THEN 1 ELSE 0 END, some_column;
```

## 7. 结合 LIMIT 用法

```sql
-- 查询价格最高的前 3 个商品
SELECT * FROM products
ORDER BY price DESC
LIMIT 3;
```

```sql
-- 每页 10 条，第 2 页
SELECT * FROM products
ORDER BY id ASC
LIMIT 10 OFFSET 10;
```

## 注意事项

- 在没有使用排序操作时，默认情况下查询返回的数据时按照添加的顺序显示的。
- `WHERE`需要声明在`FROM`之后，`ORDER BY`之前
- **最好不要对文本字段排序用 LIKE '%xx%' + 排序，慢得要命。**
- 大量排序数据最好先筛选再排（加上 WHERE、LIMIT）。
- 排序字段如果为表达式或函数，不能用索引。

# 分页

> 分页在 SQL 查询中非常常用，尤其是我们在做 **后台管理系统、列表展示、无限滚动、前后端分页接口** 的时候，都是绕不开的。下面我给你系统讲讲分页的相关知识点。
>
> 分页的目标是：**只查询你当前页需要的数据**，避免一次性把所有数据都查出来。

## 1. 语法

```sql
SELECT * FROM 表名
LIMIT 偏移量, 每页条数;
```

或者：

```sql
SELECT * FROM 表名
LIMIT 每页条数 OFFSET 偏移量;
```

**参数解释**

| **参数** | **含义**                          |
| -------- | --------------------------------- |
| 偏移量   | 从第几条数据开始（从 0 开始计数） |
| 每页条数 | 一页显示多少条数据                |

**案例**

```sql
-- 第 1 页
SELECT * FROM products
ORDER BY id ASC
LIMIT 0, 10;  -- 或者 LIMIT 10 OFFSET 0;
```

```sql
-- 第 2 页
LIMIT 10, 10;  -- OFFSET 10，跳过前 10 条
```

```sql
-- 第 N 页
LIMIT (N-1)*10, 10;
```

## 2. 分页 + 排序

分页几乎总是需要配合排序一起使用，确保分页结果稳定：

```sql
SELECT id, name, price
FROM products
ORDER BY id ASC
LIMIT 20 OFFSET 40;  -- 第 3 页，每页 20 条
```

**注意**

- 关键词顺序：`FORM` -> `WHERE` -> `ORDER BY` -> `LIMIT`

## 3. 分页 + 总数查询

如果你还需要分页器（显示总页数），就得查询总条数：

```sql
SELECT COUNT(*) FROM products WHERE category = '电子产品';
```

然后根据这个总数和 pageSize 算出总页数，前端才能展示“第几页/共几页”。

# 多表查询

## 使用别名查询

- 可以在 SELECT 和 WHERE 中使用表的别名进行查询

```sql
SELECT dep.dept_name, depm.emp_no
FROM departments dep, dept_manager depm
WHERE dep.dept_no = depm.dept_no;
```

**注意**

- 一旦在 FROM 中定义了别名，则必须在 SELECT 和 WHERE 中使用别名，而不能使用原名，否则报错

## 链接条件

- 如果没有链接条件，则会出现笛卡尔积错误。
- 如果有 n 个表需要实现多表查询，则至少需要 n-1 个链接条件。

```sql
SELECT t1.dept_name, t3.first_name, t3.last_name
FROM departments t1,dept_manager t2, employees t3
WHERE t1.dept_no = t2.dept_no
	AND t2.emp_no = t3.emp_no;
```

## 多表查询的分类

### 1. 等值连接 非等值连接

#### (1) 等值连接（Equi Join）

> **连接条件是“等于” (=)** 的连接方式。
>
> 常用于两个表有外键和主键关系，比如：A.id = B.a_id

**语法**

```sql
SELECT e.name, d.name
FROM employees e
JOIN departments d ON e.dept_id = d.id;
```

**特点**

- 用的是 =

- 非常常见，几乎所有的 INNER JOIN 都是等值连接

- 可以是 INNER JOIN、LEFT JOIN、RIGHT JOIN 等形式

#### (2) 非等值连接（Non-Equi Join）

连接条件中使用的是**非等于关系**，比如：

- `>、<`

- `=、<=`

- `BETWEEN ... AND ...`

- `LIKE`

- 等等

**语法**

假设我们有一个“工资等级”表：

```
-- employees
id | name  | salary
1  | Tom   | 3500
2  | Jerry | 8000

-- salary_grades
grade | min_salary | max_salary
A     | 0          | 3999
B     | 4000       | 7999
C     | 8000       | 9999
```

要查询员工对应的工资等级：

```sql
SELECT e.name, e.salary, g.grade
FROM employees e
JOIN salary_grades g
  ON e.salary BETWEEN g.min_salary AND g.max_salary;
```

**特点**

- 条件是范围、区间、模糊等匹配

- 通常出现在某些分类、打标签、区间分组的业务中

- 不适合使用 ON A.id = B.id 的标准连接

- **性能相对差一些**（不能用等值哈希连接优化）

#### (3) 对比

| **比较项** | **等值连接（Equi Join）**  | **非等值连接（Non-Equi Join）**     |
| ---------- | -------------------------- | ----------------------------------- |
| 连接条件   | 使用 =                     | 使用 <>、>、<、BETWEEN 等           |
| 使用场景   | 主外键关联、外表字段一致时 | 区间查找、分级、标签匹配等          |
| 性能       | 一般更优（可以走索引）     | 一般较差（不能直接走索引）          |
| 常见语法   | ON A.id = B.id             | ON A.salary BETWEEN B.min AND B.max |

### 2. 自连接 非自连接

#### (1) 自连接

> 自连接就是：**一张表和自己进行 JOIN 操作**。
>
> 你可以把它想象成「把一张表复制两份，然后做 JOIN」。

**典型应用场景**

- 一张组织结构表，表示上级/下级关系（如员工与上司）

- 树形结构表（如菜单、分类）中查父子节点关系

**例子**

员工与上司的关系，我们想查询每位员工的上司名字，可以这样写：

```sql
SELECT e1.name, e2.name
FROM employees e1, employees e2
WHERE e1.manager_id = e2.employee_id;
```

本质上是把 employees 表用了两次，用别名 e1、e2，通过 manager_id 来匹配 id。

**注意**

- **必须使用别名**，否则字段重名（如两个 id）无法区分。

- 自连接可以使用任意 JOIN 类型（INNER / LEFT / RIGHT）

#### (2) 非自连接

**例子**

就是我们最常见的：**两张不同的表进行 JOIN 操作**，例如：

```sql
SELECT dep.dept_name, depm.emp_no
FROM departments dep, dept_manager depm
WHERE dep.dept_no = depm.dept_no;
```

#### (3) 对比

**🔍 对比：自连接 vs 非自连接**

| **特性**       | **自连接（Self Join）**       | **非自连接（普通 Join）**         |
| -------------- | ----------------------------- | --------------------------------- |
| 表数量         | 1 张表参与 2 次               | 2 张或更多不同表                  |
| 是否必须起别名 | ✅ 必须，否则字段重名无法区分 | 推荐使用，防止字段冲突            |
| 应用场景       | 树形结构、父子关系、上下级    | 各种实体之间的关联（如用户-订单） |
| 性能差别       | 基本一样（逻辑一样）          | 取决于索引/数据量                 |

### 3. 内连接 外连接

> 内连接 = 只返回**两个表中匹配的记录**，**不匹配的行会被过滤掉**。
>
> 外连接 = 把不匹配的行也查出来，**用 NULL 填充空位**。

#### (1) 内连接

**语法**

```sql
SELECT *
FROM 表A
INNER JOIN 表B ON 表A.字段 = 表B.字段;
```

- `INNER JOIN` 等价于 `JOIN`, `JOIN` 是 `INNER JOIN` 的简写。

**示例**

用户表 users

| **id** | **name** |
| ------ | -------- |
| 1      | Alice    |
| 2      | Bob      |
| 3      | Charlie  |

订单表 orders

| **id** | **user_id** | **order_no** |
| ------ | ----------- | ------------ |
| 101    | 1           | A001         |
| 102    | 1           | A002         |
| 103    | 2           | B001         |

查询

```sql
SELECT u.name, o.order_no
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

结果：

| **name** | **order_no** |
| -------- | ------------ |
| Alice    | A001         |
| Alice    | A002         |
| Bob      | B001         |

- Charlie 没下过订单，因此被“过滤掉了”。

#### (2) 左外连接

- 保留左表所有行

- 右表匹配不上就用 NULL 补

```sql
SELECT u.name, o.order_no
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

**结果：**

| **name** | **order_no** |
| -------- | ------------ |
| Alice    | A001         |
| Alice    | A002         |
| Bob      | B001         |
| Charlie  | NULL         |

- Charlie 被保留了，虽然没有订单，order_no 显示 NULL。

#### (3) 右外连接

- 保留右表所有行

- 左表匹配不上就 NULL 补

```
SELECT u.name, o.order_no
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
```

- 结果一样，只是**角度反过来**了。

#### (4) 全外连接

- 保留两个表的**所有行**

- 没匹配上的地方都用 NULL 补

```sql
SELECT * FROM users u
LEFT JOIN orders o ON u.id = o.user_id
UNION
SELECT * FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
```

- MySQL **不支持 FULL JOIN**，但可以用 UNION 模拟：

#### (5) 对比

| **类型**   | **保留左表** | **保留右表** | **不匹配时**                  |
| ---------- | ------------ | ------------ | ----------------------------- |
| INNER JOIN | ❌           | ❌           | 不保留                        |
| LEFT JOIN  | ✅           | ❌           | 用 NULL 补右边                |
| RIGHT JOIN | ❌           | ✅           | 用 NULL 补左边                |
| FULL JOIN  | ✅           | ✅           | 两边都补 NULL（MySQL 不支持） |

**🧠 实战建议**

- **大多数场景用 INNER JOIN**（更高效）

- **LEFT JOIN 用于查“可能不存在”的信息**

  - 比如：所有用户 + 他们的订单（有些用户可能没订单）

- **RIGHT JOIN 很少用**（多数场景可以调整顺序改写成 LEFT JOIN）

## JOIN ON 语法

### 1. JOIN 的通用语法结构

```sql
SELECT 字段列表
FROM 表A
JOIN_TYPE 表B
ON 连接条件
[WHERE 条件]
[ORDER BY ...]
[LIMIT ...];
```

其中 JOIN_TYPE 是可以变的，常见的有：

- INNER JOIN

- LEFT JOIN

- RIGHT JOIN

- FULL JOIN（MySQL 不支持，需用 UNION 实现）

- CROSS JOIN

- SELF JOIN（其实是表连接自己，仍用以上语法）

### 2. 语法示例

我们用 users 表和 orders 表举例：

```
-- users 表
id | name
1  | Alice
2  | Bob
3  | Charlie

-- orders 表
id  | user_id | order_no
101 | 1       | A001
102 | 2       | B001
```

#### (1) INNER JOIN

只选出两个表中都匹配的行。

```sql
SELECT u.name, o.order_no
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

可简写为：

```sql
SELECT u.name, o.order_no
FROM users u
JOIN orders o ON u.id = o.user_id;
```

#### (2) LEFT JOIN

保留左表全部，右表匹配不上就用 NULL。

```sql
SELECT u.name, o.order_no
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
```

#### (3) RIGHT JOIN

保留右表全部，左表匹配不上就用 NULL。

```
SELECT u.name, o.order_no
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
```

#### (4) FULL OUTER JOIN（全外连接）

保留左右表所有行，匹配不上都用 NULL 补上。

**MySQL 不支持 FULL OUTER JOIN**，可以用 UNION 模拟：

```sql
-- 模拟 FULL OUTER JOIN
SELECT u.name, o.order_no
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
UNION
SELECT u.name, o.order_no
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
```

#### (5) CROSS JOIN（笛卡尔积）

**每一行对每一行**（慎用！）

```sql
SELECT u.name, o.order_no
FROM users u
CROSS JOIN orders o;
```

如果 users 有 3 条记录，orders 有 2 条，会得到 3 x 2 = 6 条记录。

#### (6) 注意事项

**JOIN 时的小技巧**

- **强烈建议使用表别名**（u, o）避免字段冲突

- ON 是 JOIN 的连接条件，**WHERE 是过滤条件**（不要混淆）

- 如果 JOIN 逻辑不写清楚，容易导致**笛卡尔积**（数据量爆炸）

**简述**

```sql
INNER JOIN   ->  A ∩ B（都存在）
LEFT JOIN    ->  A ⟕ B（左表全保留）
RIGHT JOIN   ->  A ⟖ B（右表全保留）
FULL JOIN    ->  A ∪ B（都保留，MySQL用UNION模拟）
CROSS JOIN   ->  A × B（笛卡尔积）
```

## UNION 语法

> SQL 中的 UNION 主要用于**合并多个查询结果集**，非常适合“多个来源的数据整合到一起”的场景。

### 1. 定义

UNION 用来将 **两个或多个 SELECT 查询的结果** 拼接在一起，生成一个**新的结果集**。

**注意**

- 合并的是**行**（不是列！）

- 所有合并的 SELECT 查询**列数必须相同**，类型也要兼容

- 默认会**去重**，想保留重复记录要用 UNION ALL

### 2. UNION 与 UNION ALL 的语法

**UNION（去重）**

```sql
SELECT name FROM customers
UNION
SELECT name FROM suppliers;
```

- 得到客户和供应商中所有的姓名，但**不会重复**。

**UNION ALL（不去重，性能更好）**

```sql
SELECT name FROM customers
UNION ALL
SELECT name FROM suppliers;
```

- 得到客户和供应商中所有姓名，**保留重复**。查询更快。

### 3. 注意事项

| **限制项** | **说明**                                                                            |
| ---------- | ----------------------------------------------------------------------------------- |
| 列数       | 所有 SELECT 查询的列数必须一样                                                      |
| 列类型     | 对应列的类型应兼容（如 int 和 float，或者 varchar 和 text）                         |
| 列名       | 最终结果集的列名以第一个 SELECT 的列名为准                                          |
| 排序       | 如果想对整个合并后的结果排序，**只能写一个 ORDER BY，并且写在最后一个 SELECT 之后** |

**排序示例**

```sql
SELECT name, '客户' AS 来源 FROM customers
UNION
SELECT name, '供应商' FROM suppliers
ORDER BY name;
```

### 4. UNION 的典型用途

- 多张结构相同的表合并（例如：历史表、月表）

- 不同来源的数据整合为一个结果（如客户和员工）

- 子查询中使用多个 UNION 组合条件

### 5. UNION vs JOIN 对比

| **功能**   | **UNION**               | **JOIN**                   |
| ---------- | ----------------------- | -------------------------- |
| 合并方向   | **纵向**（按行合并）    | **横向**（按列合并）       |
| 表结构要求 | 列数一致、类型兼容      | 可不一样，但需有连接条件   |
| 常见用途   | 合并多个查询结果        | 表间数据的逻辑关联         |
| 是否去重   | 默认去重，可用 ALL 保留 | 不涉及去重，取决于连接方式 |
