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

# 函数

## 字符串函数

### 1. 常用函数

| **函数名**                 | **说明**           | **示例**                              |
| -------------------------- | ------------------ | ------------------------------------- |
| CONCAT(a, b, …)            | 字符串拼接         | CONCAT('Hello', 'World') → HelloWorld |
| LENGTH(str)                | 字节长度           | LENGTH('abc') → 3                     |
| CHAR_LENGTH(str)           | 字符长度（推荐用） | CHAR_LENGTH('你好') → 2               |
| LOWER(str)                 | 转小写             | LOWER('AbC') → abc                    |
| UPPER(str)                 | 转大写             | UPPER('AbC') → ABC                    |
| TRIM(str)                  | 去除前后空格       | TRIM(' abc ') → 'abc'                 |
| LEFT(str, n)               | 从左取 n 位        | LEFT('hello', 2) → he                 |
| RIGHT(str, n)              | 从右取 n 位        | RIGHT('hello', 3) → llo               |
| SUBSTRING(str, start, len) | 截取子串           | SUBSTRING('abcdef', 2, 3) → bcd       |
| REPLACE(str, a, b)         | 替换字符串         | REPLACE('abcabc', 'a', 'x') → xbcxbc  |
| INSTR(str, substr)         | 查找子串位置       | INSTR('hello', 'e') → 2               |

### 2. 案例

**LENGTH**

用于返回字符串的字节数

```sql
SELECT LENGTH('😄') FROM DUAL; -- 4

SELECT LENGTH('abc') FROM DUAL; -- 3

SELECT LENGTH('我们') FROM DUAL; -- 6
```

**CONCAT**

用于拼接字符串

```sql
SELECT CONCAT(employees.first_name, ' ', employees.last_name) AS fullName
FROM employees
```

**CONCAT_WS**

使用指定符号连接字符串

```sql
SELECT CONCAT_WS('_', employees.first_name, employees.last_name) AS fullName
FROM employees
```

**LOWER**

忽略大小写对比的筛选，但是 mysql 默认大小写不敏感。

```sql
SELECT last_name
FROM employees
WHERE LOWER(last_name) = 'king';
```

## 数值函数

| **函数名**  | **说明**                | **示例**                |
| ----------- | ----------------------- | ----------------------- |
| ABS(n)      | 绝对值                  | ABS(-3) → 3             |
| CEIL(n)     | 向上取整（天花板）      | CEIL(3.14) → 4          |
| FLOOR(n)    | 向下取整（地板）        | FLOOR(3.9) → 3          |
| ROUND(n, d) | 四舍五入，保留 d 位小数 | ROUND(3.1416, 2) → 3.14 |
| MOD(a, b)   | 求余                    | MOD(10, 3) → 1          |
| RAND()      | 生成随机小数 [0, 1)     | RAND() → 0.4567...      |
| SQRT(n)     | 平方根                  | SQRT(9) → 3             |
| POW(x, y)   | 幂运算（x^y）           | POW(2, 3) → 8           |

## 日期时间函数

| **函数名**                  | **说明**            | **示例**                                           |
| --------------------------- | ------------------- | -------------------------------------------------- |
| NOW()                       | 当前日期和时间      | 2025-03-17 10:33:00                                |
| CURDATE()                   | 当前日期            | 2025-03-17                                         |
| CURTIME()                   | 当前时间            | 10:33:00                                           |
| YEAR(date)                  | 提取年份            | YEAR('2024-01-01') → 2024                          |
| MONTH(date)                 | 提取月份            | MONTH('2024-01-01') → 1                            |
| DAY(date)                   | 提取日              | DAY('2024-01-01') → 1                              |
| DATE_FORMAT(dt, format)     | 格式化日期          | DATE_FORMAT(NOW(), '%Y-%m-%d')                     |
| DATEDIFF(d1, d2)            | 相差天数（d1 - d2） | DATEDIFF('2024-03-01', '2024-02-01') → 29          |
| TIMESTAMPDIFF(unit, d1, d2) | 精确时间差          | TIMESTAMPDIFF(MINUTE, '10:00:00', '10:30:00') → 30 |

## 控制流函数

> MySQL 中的 **控制流函数（Control Flow Functions）**，可以让我们像写程序一样，在 SQL 语句中做条件判断、分支处理，非常适用于 **条件列展示**、**动态赋值**、**分组处理逻辑** 等场景。

| **函数名**                          | **说明**                              | **示例**                            |
| ----------------------------------- | ------------------------------------- | ----------------------------------- |
| IF(cond, t, f)                      | 如果 cond 为 true，返回 t，否则返回 f | IF(1 < 2, 'yes', 'no') → yes        |
| IFNULL(expr, alt)                   | expr 为 null 返回 alt                 | IFNULL(NULL, 'N/A') → N/A           |
| NULLIF(a, b)                        | 如果 a = b，返回 NULL；否则返回 a     | NULLIF(1,1) → NULL；NULLIF(1,2) → 1 |
| CASE WHEN ... THEN ... ELSE ... END | 多条件判断                            | 见下方示例                          |

### 1. IF

就像 Java 的三目运算符：condition ? a : b

```sql
SELECT name,
       IF(score >= 60, '及格', '不及格') AS result
FROM students;
```

如果 score >= 60，结果是“及格”，否则是“不及格”。

### 2. IFNULL

用于处理 NULL 值的情况：

```sql
SELECT name,
       IFNULL(nickname, '无昵称') AS display_name
FROM users;
```

如果 nickname 是 NULL，就显示“无昵称”。

### 3. CASE WHEN

**简单 CASE：**

```sql
SELECT name,
       CASE gender
         WHEN 'M' THEN '男'
         WHEN 'F' THEN '女'
         ELSE '未知'
       END AS gender_text
FROM employees;
```

**搜索 CASE：**

```sql
SELECT name, score,
       CASE
         WHEN score >= 90 THEN '优秀'
         WHEN score >= 60 THEN '及格'
         ELSE '不及格'
       END AS result
FROM students;
```

## 加密函数

**常用函数**

| **函数名**    | **说明**                          |
| ------------- | --------------------------------- |
| MD5(str)      | 生成 MD5 哈希                     |
| SHA1(str)     | 生成 SHA1 哈希                    |
| PASSWORD(str) | 用于旧版 MySQL 密码加密（不推荐） |

**注意**

- 不建议使用 MySQL 函数，推荐在 Java 中使用 BCrypt / Argon2 等

## 系统信息函数

> 你可能是想问 **MySQL 信息函数**，也就是一些 **系统信息类函数**，用于获取当前数据库、用户、版本、连接状态等运行时信息。这类函数不直接处理业务数据，但在调试、监控、权限控制中非常实用。

| **函数名**       | **含义说明**                                     |
| ---------------- | ------------------------------------------------ |
| DATABASE()       | 当前默认数据库的名称（即 USE 的那个）            |
| USER()           | 当前连接的用户（包括主机）                       |
| CURRENT_USER()   | MySQL 实际授权使用的用户（可能和 USER() 不一样） |
| VERSION()        | 当前 MySQL 数据库版本                            |
| CONNECTION_ID()  | 当前会话的唯一连接 ID                            |
| CHARSET(str)     | 返回字符串 str 的字符集                          |
| COLLATION(str)   | 返回字符串 str 的排序规则                        |
| LAST_INSERT_ID() | 返回最近一次插入的自增 ID 值                     |
| FOUND_ROWS()     | 返回上条 SQL 查询中匹配的行数（即使 LIMIT 了）   |
| ROW_COUNT()      | 返回上条 SQL 影响的行数（如 UPDATE、DELETE）     |

## 聚合函数

> 聚合函数（Aggregate Functions）是 MySQL 中 **用于对一列数据执行汇总计算** 的函数，常用于 GROUP BY 分组、统计分析、报表处理等场景。

| **函数名**     | **作用说明**           |
| -------------- | ---------------------- |
| COUNT()        | 统计数量               |
| SUM()          | 求和                   |
| AVG()          | 计算平均值             |
| MAX()          | 获取最大值             |
| MIN()          | 获取最小值             |
| GROUP_CONCAT() | 将同组数据拼接成字符串 |

### 1. COUNT()

**统计数量**

```sql
SELECT COUNT(*) FROM employees;
```

- COUNT(\*)：统计总行数（包括 NULL）

- COUNT(column)：统计某列非 NULL 的数量

```sql
SELECT COUNT(salary) FROM employees; -- 忽略 salary 为 NULL 的行
```

### 2. SUM()

**求和**

```sql
SELECT SUM(salary) FROM employees;
```

- 汇总一列数值的总和

- NULL 会被忽略

### 3. AVG()

**平均值**

```sql
SELECT AVG(salary) FROM employees;
```

- 返回某列的平均值（= SUM / COUNT）

- NULL 会被忽略

### 4. MAX() / MIN()

**最大值 / 最小值**

```sql
SELECT MAX(salary), MIN(salary) FROM employees;
```

- 适用于查询数值类型、字符串类型、日期时间类型

### 5. GROUP BY

聚合函数 常与 GROUP BY 配合使用

**示例：单个分组条件**

每个部门的平均薪资

```sql
SELECT department_id, AVG(salary)
FROM employees
GROUP BY department_id;
```

**示例：多个分组条件**

每个部门中每个岗位的平均薪资

```sql
SELECT department_id, job_id, AVG(salary)
FROM employees
GROUP BY department_id, job_id;
```

**注意**

- 支持多维度分组
- 如果`SELECT`存在未包含在`GROUP BY`的字段，则会报错
- `GROUP BY`的顺序不影响结果，只影响显示效果

### 6. GROUP_CONCAT()

**分组拼接字符串**

```sql
SELECT department_id, GROUP_CONCAT(last_name)
FROM employees
GROUP BY department_id;
```

- 把同一部门的员工名字拼接起来

- 默认用逗号分隔，可自定义分隔符：

```sql
GROUP_CONCAT(last_name SEPARATOR ' | ')
```

**注意**

- 有最大长度限制，默认 1024 字节，可通过设置调整：

```sql
SET SESSION group_concat_max_len = 10000;
```

### 7. HAVING

**📌 示例：按部门统计人数和总薪资**

```sql
SELECT department_id,
       COUNT(*) AS num_employees,
       SUM(salary) AS total_salary,
       AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id
HAVING total_salary > 100000;
```

**注意**

- 如果过滤条件中使用了聚合函数，就需要使用`HAVING`代替`WHERE`，否则就会报错。
- `HAVING`必须放在`GROUP BY`后面，并且总是推荐出现在一起使用。
- 极其不推荐将普通过滤条件写进`HAVING`中，应当保持使用`WHERE`过滤普通条件。

### 8. WHERE 对比 HAVING

> WHERE 和 HAVING 都用于 **筛选数据**，但它们的应用时机和作用对象不同，是 SQL 中一个很常见、但也容易混淆的点。

**核心区别**

- WHERE 是在 **分组/聚合之前** 过滤行，

- HAVING 是在 **分组/聚合之后** 过滤组。

**使用语法结构位置对比**

```
SELECT ...
FROM ...
WHERE ...        -- 行级过滤（还没分组）
GROUP BY ...
HAVING ...       -- 组级过滤（已分组、可用聚合函数）
```

**WHERE 示例：过滤原始行**

```
SELECT *
FROM employees
WHERE department_id = 90;
```

**HAVING 示例：过滤聚合结果**

```
SELECT department_id, AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id
HAVING avg_salary > 10000;
```

**同时使用 WHERE 和 HAVING**

```
SELECT department_id, COUNT(*) AS emp_count
FROM employees
WHERE salary > 5000             -- 先筛选行
GROUP BY department_id
HAVING emp_count > 3;           -- 再筛选组
```

# SQL 执行顺序

**例子**

```sql
SELECT department_id, AVG(salary) AS avg_salary
FROM employees
WHERE salary > 5000
GROUP BY department_id
HAVING avg_salary > 10000
ORDER BY avg_salary DESC
LIMIT 3;
```

## 第 1 步：FROM（确定数据来源）

```
FROM employees
```

- **确定主查询表**

- 数据库先去找这张表，把所有原始数据拿出来

- 如果有 **多表连接（JOIN）**，也会在这一步处理连接

## 第 2 步：JOIN 和 ON（连接其他表）

```
FROM employees
JOIN departments ON employees.department_id = departments.id
```

- 多表连接在 FROM 阶段就已经处理

- JOIN 的种类（INNER、LEFT、RIGHT）影响结果集的行数

- ON 是连接条件，**不能用于行筛选**（不要在 ON 中写 salary > 5000）

## 第 3 步：WHERE（行级过滤）

```
WHERE salary > 5000
```

- 在数据还**没分组、没聚合之前**，对原始数据进行行筛选

- **不能用聚合函数**，如 AVG()、SUM() 等（此时还没开始聚合）

## 第 4 步：GROUP BY（分组）

```
GROUP BY department_id
```

- 把上一阶段留下的记录，按某个字段（或表达式）分组

- 每个组之后会成为一行结果

- **这个阶段才开始产生聚合函数的“分组结果”**

## 第 5 步：HAVING（组级过滤）

```
HAVING avg_salary > 10000
```

- 过滤的是每个分组的“统计值”，不是原始行

- 可以使用聚合函数（如 SUM()、AVG()）

- **WHERE 不能做的聚合条件判断，在这里可以做**

## 第 6 步：SELECT（选择返回的字段）

```
SELECT department_id, AVG(salary) AS avg_salary
```

- 到这一步，系统已经知道每组统计后的结果了

- 执行字段选择、聚合计算

- 你也可以起别名（如 AS avg_salary），不过这个别名要等下一步才能被识别

## 第 7 步：DISTINCT（可选，去重）

```
SELECT DISTINCT ...
```

- 如果你用了 DISTINCT，会在 SELECT 之后、ORDER BY 之前去重

- 注意性能问题：去重操作可能非常耗资源

## 第 8 步：ORDER BY（排序）

```
ORDER BY avg_salary DESC
```

- 按照前面 SELECT 出来的字段进行排序

- 此时可以使用 SELECT 中的别名

- 可以排序多个字段：ORDER BY a DESC, b ASC

## 第 9 步：LIMIT（限制结果数量）

```
LIMIT 3
```

- 最后一步，控制结果数量

- 通常用于分页或截取前几名

## 总结

```
① FROM           -- 从哪张表查数据
② JOIN           -- 多表连接处理
③ ON             -- 联结条件
④ WHERE          -- 行筛选（不能用聚合函数）
⑤ GROUP BY       -- 分组
⑥ HAVING         -- 组筛选（可用聚合函数）
⑦ SELECT         -- 选择字段（聚合、表达式、别名）
⑧ DISTINCT       -- 可选，去重
⑨ ORDER BY       -- 排序（可用别名）
⑩ LIMIT          -- 截取返回数据
```

# 子查询

## 1. 什么是子查询

子查询就是嵌套在 **另一个 SQL 查询中的查询语句**。你可以把它看成一个“临时产生的结果表”，这个表在主查询中被引用。

**关键点**

- 子查询必须被包含在括号 () 中

- 可以出现在 `SELECT`、`FROM`、`WHERE`、`HAVING` 等地方

## 2. 子查询的三种常见类型

**① 标量子查询（Scalar Subquery）**

> 子查询只返回 **一个值（一个单元格）**

```sql
SELECT first_name, salary
FROM employees
WHERE salary > (
  SELECT AVG(salary)
  FROM employees
);
```

- 比较每位员工的工资是否高于全体平均值

- SELECT AVG(salary) 返回一个标量

**② 列子查询（Column Subquery）**

> 子查询返回 **一列**

```sql
SELECT first_name, department_id
FROM employees
WHERE department_id IN (
  SELECT department_id
  FROM departments
  WHERE location_id = 1700
);
```

- 拿出所有在 1700 地点的部门中的员工

- 子查询返回的是一个 department_id 列表

**③ 行/表子查询（Row or Table Subquery）**

> 子查询返回 **一整张表或一整行**

```sql
SELECT *
FROM (
  SELECT department_id, AVG(salary) AS avg_sal
  FROM employees
  GROUP BY department_id
  HAVING AVG(salary) > 10000
) AS high_salary_departments;
```

- 整个子查询结果被当成一张临时表 high_salary_departments

- 外层可以继续做筛选、排序等操作

## 3. 相关操作符搭配子查询

| **操作符** | **用法说明**             |
| ---------- | ------------------------ |
| IN         | 是否属于子查询返回的列表 |
| EXISTS     | 子查询是否返回了至少一行 |
| =, <, >    | 搭配标量子查询使用       |
| ANY, ALL   | 与集合比较（高级用法）   |

**示例：EXISTS 子查询**

```
SELECT d.department_name
FROM departments d
WHERE EXISTS (
  SELECT 1
  FROM employees e
  WHERE e.department_id = d.department_id
);
```

- 只要某个部门下存在员工，就返回该部门

- EXISTS 比 IN 更高效一些，尤其子查询大时

## 4. 子查询 vs JOIN 的选择

| **情况**                   | **建议用法**                        |
| -------------------------- | ----------------------------------- |
| 只取结果，不用关联额外字段 | ✅ 子查询（简洁）                   |
| 需要拿子表中的字段一起展示 | ✅ JOIN（扩展性强）                 |
| 数据量大、性能敏感         | ✅ JOIN 通常更好（尤其 IN vs JOIN） |

## 5. 注意事项

**注意事项**

- 子查询 **不能返回多列**（除非用在 FROM 中）

- 某些上下文中，子查询必须 **只返回一个值**（如 =、> 等运算符）

- 子查询的 **性能可能不如 JOIN**，尤其在大数据量时

- 有些数据库（比如早期 MySQL）对子查询优化能力较弱

**应用场景**

- 比较某个值是否高于平均（标量）

- 从另一个表中取一列做过滤（列子查询）

- 构造临时表进行进一步查询（表子查询）

- 替代 JOIN 做权限或数据隔离（比如多租户）

# 管理数据库

## 1. 创建数据库

**基本的语法**

```sql
CREATE DATABASE database_name;
```

**可选的参数**

如果需要为数据库指定特定的字符集和排序规则，可以在创建时加入 CHARACTER SET 和 COLLATE 参数。例如：

```sql
CREATE DATABASE my_database
    CHARACTER SET utf8
    COLLATE utf8_general_ci;
```

- CHARACTER SET 用来指定字符集（例如 utf8）。

- COLLATE 用来指定排序规则（例如 utf8_general_ci）。

**最佳实践**

```sql
CREATE DATABASE
IF NOT EXISTS my_database
CHARACTER SET utf8
```

- 判断数据库是否存在
- 如果存在则不创建，但是不报错
- 如果不存在则创建成功

## 2. 查看数据库

**查看所有数据库的列表**

```sql
SHOW DATABASES;
```

**查看置顶数据库的创建信息**

```sql
SHOW CREATE DATABASE my_database;
```

- 可以查看数据库的字符集设置等信息

## 3. 选择数据库

```sql
USE my_database;
```

## 4. 查看当前使用的数据库

```sql
SELECT DATABASE() FROM DUAL;
```

## 5. 查看数据表

**当前数据库的数据表**

```sql
SHOW TABLES;
```

**指定数据库的数据表**

```sql
SHOW TABLES FROM my_database;
```

## 6. 修改数据库

### 修改数据库字符集

```sql
ALTER DATABASE my_database CHARACTER SET 'utf-8';
```

## 7. 删除数据库

**基础语法**

```sql
DROP DATABASE my_database;
```

**推荐做法**

```sql
DROP DATABASE IF EXISTS my_database;
```

- 如果数据库存在则删除成功

## 8. 登录数据库

```shell
mysql -uroot -pmysql123456
# 等价于
mysql -u root -P 3306 -h localhost -pmysql123456
```

- -p 后可以不明文写入密码，根据提示再输入密码

# 管理数据表

## 1. 创建数据表

**方式 1：创建新表**

```sql
CREATE TABLE IF NOT EXISTS test_table(
	id INT,
  emp_name VARCHAR(15),
  hire_date DATE
);
```

**方式 2：基于现有表，同时导入数据**

```sql
CREATE TABLE test_table
AS
SELECT employee_id a, last_name b
FROM employee;
```

- 可以使用 select 的结果作为表数据进行对新表的填充

- 当使用别名时，新表也会使用别名作为字段

- 创建表时可以指定表的字符集，包括表的字符集或者字段的字符集

## 2. 查看数据表结构

```sql
DESC test_table;
```

## 3. 修改表

**语法**

```sql
ALTER TABLE
```

**关键字**

| **操作**     | **语法关键词** | **说明**                 |
| ------------ | -------------- | ------------------------ |
| 添加字段     | ADD COLUMN     | 新增一个字段             |
| 修改字段类型 | MODIFY COLUMN  | 改字段类型或约束，不改名 |
| 重命名字段   | CHANGE COLUMN  | 改字段名，可以顺便改类型 |
| 删除字段     | DROP COLUMN    | 删除指定字段             |

### 添加字段

**语法**

```sql
ALTER TABLE 表名 ADD COLUMN 字段名 数据类型 [约束] [位置];
```

- 位置 可选：

- FIRST：添加到最前面

- AFTER 某字段名：添加到指定字段之后

**示例**

```sql
ALTER TABLE users
ADD COLUMN age INT
AFTER username;

ALTER TABLE users
ADD COLUMN created_at DATETIME
DEFAULT CURRENT_TIMESTAMP;
```

### 修改字段

**语法**

```sql
ALTER TABLE 表名 MODIFY COLUMN 字段名 新数据类型 [约束];
```

**示例**

```sql
ALTER TABLE users MODIFY COLUMN age TINYINT UNSIGNED NOT NULL;
```

### 重命名字段

**语法**

```sql
ALTER TABLE 表名 CHANGE COLUMN 原字段名 新字段名 新数据类型 [约束];
```

**注意**

- 必须提供新字段名和完整的数据类型。
- 可以同时修改字段名和字段类型

**示例**

```sql
ALTER TABLE users CHANGE COLUMN username user_name VARCHAR(100) NOT NULL;
```

### 删除字段

**语法**

```sql
ALTER TABLE 表名 DROP COLUMN 字段名;
```

**示例**

```sql
ALTER TABLE users DROP COLUMN age;
```

## 4. 重命名表

**语法 1**

```sql
RENAME TABLE 原表名 TO 新表名;
```

**语法 2**

```sql
ALTER TABLE 原表名 RENAME TO 新表名;
```

**示例**

```sql
RENAME TABLE users TO members;

-- 或者
ALTER TABLE users RENAME TO members;
```

**注意事项**

- 重命名表不会影响表的数据或结构。

- 表被重命名后，所有依赖旧表名的 SQL 语句（如外部查询）需要修改。

- 若新表名已存在，则重命名会失败。

## 5. 删除表

**语法**

```sql
DROP TABLE 表名;
```

**示例**

```sql
DROP TABLE users;
```

**注意事项**

- 表和其数据会**被永久删除**，**不可恢复**（慎用！）。

- 如果你不确定表是否存在，可以加上 IF EXISTS：

```sql
DROP TABLE IF EXISTS users;
```

## 6. 清空表

**语法**

```sql
TRUNCATE TABLE 表名;
```

**示例**

```sql
TRUNCATE TABLE users;
```

**注意事项**

| **特点** | **与** DELETE **区别**                           |
| -------- | ------------------------------------------------ |
| 高速     | TRUNCATE 是**重新创建表**，删除速度比 DELETE 快  |
| 无日志   | 不记录每一行删除操作，几乎不可恢复               |
| 无触发器 | 不会触发 DELETE 触发器                           |
| 自增重置 | 会将 AUTO_INCREMENT 的值重置为初始值（通常是 1） |
| 无条件   | 不能带 WHERE 条件，**清空就是全部清空**          |

# 数据库操作术语分类

在 SQL 中，我们经常会看到一些缩写术语，比如 **DDL、DML、DCL、TCL** 等，它们是对 SQL 不同类型语句的分类，分别表示不同的操作范围和作用。

## DDL（Data Definition Language）

**数据定义语言** → 用来定义或修改数据库结构：数据库、表、字段、索引等。

**常见 DDL 语句：**

| **语句** | **作用说明**           |
| -------- | ---------------------- |
| CREATE   | 创建数据库、表、视图等 |
| ALTER    | 修改数据库结构         |
| DROP     | 删除数据库或表         |
| TRUNCATE | 清空表数据，但保留结构 |
| RENAME   | 重命名表或字段         |

**原子化**

**DDL 原子化**（Atomic DDL）是指：**DDL（数据定义语言）语句在执行时具备事务原子性**——**要么全部成功，要么全部失败，不会留下中间状态**。\*\*\*\*

## DML（Data Manipulation Language）

**数据操作语言** → 用来对表中的数据进行增、删、改、查。

**常见 DML 语句：**

| **语句** | **作用说明**                 |
| -------- | ---------------------------- |
| INSERT   | 插入新数据行                 |
| UPDATE   | 修改已有数据                 |
| DELETE   | 删除数据                     |
| SELECT   | 查询数据（有时也归类为 DRL） |

## DCL（Data Control Language）

**数据控制语言** → 用来定义权限和安全级别。

**常见 DCL 语句：**

| **语句** | **作用说明**         |
| -------- | -------------------- |
| GRANT    | 授权用户执行某些操作 |
| REVOKE   | 撤销用户权限         |

## TCL（Transaction Control Language）

**事务控制语言** → 用于控制事务的执行和一致性。

**常见 TCL 语句：**

| **语句**          | **作用说明**                 |
| ----------------- | ---------------------------- |
| BEGIN             | 开始一个事务（某些数据库用） |
| START TRANSACTION | 开启事务（MySQL 推荐）       |
| COMMIT            | 提交事务，保存修改           |
| ROLLBACK          | 回滚事务，撤销未提交的修改   |
| SAVEPOINT         | 设置一个事务保存点           |
| RELEASE SAVEPOINT | 删除保存点                   |

## DRL（Data Retrieval Language）

**数据查询语言** → 也叫 **查询语言**，有时将 SELECT 单独列为一类：

| **语句** | **作用说明**   |
| -------- | -------------- |
| SELECT   | 从表中查询数据 |

## 小结对比

| **缩写** | **全称**                     | **作用范围**     | **常见关键字**              |
| -------- | ---------------------------- | ---------------- | --------------------------- |
| DDL      | Data Definition Language     | 定义结构         | CREATE, ALTER, DROP, RENAME |
| DML      | Data Manipulation Language   | 操作数据         | INSERT, UPDATE, DELETE      |
| DCL      | Data Control Language        | 权限控制         | GRANT, REVOKE               |
| TCL      | Transaction Control Language | 控制事务         | BEGIN, COMMIT, ROLLBACK     |
| DRL      | Data Retrieval Language      | 查询数据（可选） | SELECT                      |

## 回滚与提交

### 1. 基本情况

| **语句类型** | **语句**                                  | **是否可回滚**           | **说明**                             |
| ------------ | ----------------------------------------- | ------------------------ | ------------------------------------ |
| ✅ DML       | INSERT / UPDATE / DELETE                  | ✔️ 是                    | 只要未提交，都可以通过 ROLLBACK 撤销 |
| ❌ DDL       | CREATE / DROP / ALTER / TRUNCATE / RENAME | ❌ 否                    | 一执行就立即生效，**不可回滚**       |
| ❌ DCL       | GRANT / REVOKE                            | ❌ 否                    | 权限变更一旦执行即生效，不能撤销     |
| ✅ TCL       | COMMIT / ROLLBACK / SAVEPOINT             | ✔️ 是                    | 本身就是用于事务控制                 |
| ✅ SELECT    | SELECT 查询                               | 不涉及数据更改，无需回滚 |                                      |

### 2. 特别说明

- **DDL 语句是隐式提交事务的**，执行 DDL 会自动提交当前事务，然后再执行自己，所以**即使你写在事务中也无法回滚**。

- TRUNCATE 虽然只是清空表，看似像 DELETE，但其实是 DDL 操作，**不能回滚！**

- 如果你用的是 MyISAM 引擎的表（而不是 InnoDB），是不支持事务的，回滚也不会生效。

# 数据增删改

## 插入数据

> 在 MySQL 中，**添加数据**主要通过 INSERT 语句来实现，它属于 **DML（数据操作语言）** 的一部分。

### 1. 基本插入语法（INSERT INTO）

#### 方式一：不指明添加的字段

**语法**

```sql
INSERT INTO 表名 VALUES (值1, 值2, ...);
```

**示例**

```sql
INSERT INTO users VALUES (1, '张三', 25);
```

**注意**

- 一定要按照声明字段的顺序进行添加
- 不推荐省略字段名！字段顺序改变时容易出错

#### 方式二：指明添加的字段

**语法**

```sql
INSERT INTO 表名 (字段1, 字段2, ...) VALUES (值1, 值2, ...);
```

**示例**

```sql
INSERT INTO users (id, name, age) VALUES (1, '张三', 25);
```

**注意**

- 没有被指定的字段会根据约束和默认值进行处理

### 2. 批量插入多条数据

**语法**

```sql
INSERT INTO 表名 (字段1, 字段2, ...) VALUES
(值1, 值2, ...),
(值1, 值2, ...),
(值1, 值2, ...);
```

**示例**

```sql
INSERT INTO users (id, name, age) VALUES
(3, '王五', 28),
(4, '赵六', 22),
(5, '钱七', 35);
```

### 3. 将查询结果插入数据

**示例**

```sql
INSERT INTO new_users (id, name, age)
SELECT id, name, age FROM users WHERE age > 30;
```

**注意**

- 字段数量和名称必须一一对应
- 需要确认数据类型和范围，可以防止风险

### 4. 处理重复

**1. INSERT IGNORE：忽略错误（如主键重复）**

主键冲突时跳过这一行，其他行继续插入。

```
INSERT IGNORE INTO users (id, name, age) VALUES (1, '重复', 20);
```

**2. REPLACE INTO：主键冲突时先删除旧数据再插入新数据**

有点暴力，会触发删除和插入，**主键/唯一键冲突时才生效**。

```
REPLACE INTO users (id, name, age) VALUES (1, '替换', 26);
```

**3. INSERT ... ON DUPLICATE KEY UPDATE：主键冲突时更新**

```
INSERT INTO users (id, name, age)
VALUES (1, '张三', 25)
ON DUPLICATE KEY UPDATE age = 26;
```

### 5. 注意事项

**使用 DEFAULT 或 NULL 显式指定**

```sql
INSERT INTO users (id, name, age) VALUES (6, '吴九', DEFAULT);
-- 或者
INSERT INTO users (id, name, age) VALUES (7, '郑十', NULL);
```

## 更新数据

> **MySQL 中修改数据** 的操作，这通常是通过 **UPDATE 语句** 来实现的，它属于 **DML（数据操作语言）** 的一部分。

### 1. UPDATE 语法格式

```
UPDATE 表名
SET 字段1 = 新值1, 字段2 = 新值2, ...
[WHERE 条件];
```

**注意**

- 更新数据可能不成功，可能是由于存在约束的原因。

### 2. 基本使用示例

```
UPDATE users
SET age = 28
WHERE name = '张三';
```

### 3. WHERE 条件

**示例**

```
UPDATE users
SET age = 0;
```

没有 WHERE 会更新全表，这将把所有用户的 age 全部修改为 0

**注意**

- **一定要加 WHERE 限定条件**

- 最好先用 SELECT 查询确认影响的行

- 复杂修改前可以考虑加事务（START TRANSACTION）

### 4. 更新多个字段

```
UPDATE users
SET name = '李四', age = 30
WHERE id = 1;
```

### 5. 特殊更新方法

**基于原值更新**

```
UPDATE users
SET age = age + 1
WHERE id = 1;
```

**结合条件更新多个记录**

```
UPDATE users
SET age = age + 2
WHERE age < 25 AND name LIKE '张%';
```

**配合 ORDER BY 和 LIMIT**

更新前 3 条记录，可用于定向修改。

```
UPDATE users
SET age = age + 1
ORDER BY created_at
LIMIT 3;
```

**结合子查询更新**

```
UPDATE users
SET age = (
  SELECT AVG(age) FROM users
)
WHERE id = 1;
```

## 删除数据

> **MySQL 中删除数据** 的操作，主要通过 DELETE 和 TRUNCATE 两种方式实现，它们虽然都能删数据，但作用范围、性能、可回滚性等方面都有区别。

### DELETE —— 有选择地删除数据（DML）

**语法**

```
DELETE FROM 表名 WHERE 条件;
```

**示例**

```
DELETE FROM users WHERE id = 3;
```

只删除 id = 3 的那一行。

**注意**

- 可以回滚
- 如果不加 WHERE 条件, 这将删除表中 **所有数据**，但表结构仍然保留！

```
DELETE FROM users;
```

## 计算列(MySQL8 特性)

> MySQL8 中的“计算列”，也叫作 生成列（Generated Columns）。
> 这是一个很实用的功能，可以让你在表中定义由其他字段计算出来的列，比如自动拼接、自动求和、状态映射等 —— 而且这些列 不需要你每次手动更新，MySQL 会自动处理。

### 1. 什么是计算列

**定义**

计算列是指一个字段的值 由其他字段计算得出，你在建表时定义好表达式，MySQL 自动生成。

### 2. 语法

```sql
列名 数据类型 [GENERATED ALWAYS] AS (表达式) [VIRTUAL | STORED] [UNIQUE | NOT NULL | ...]
```

### 3. 虚拟列与持久列

#### (1) VIRTUAL（虚拟）

> 不存储，只在用到时动态计算（默认）

**示例**

```sql
CREATE TABLE products (
  name VARCHAR(50),
  price DECIMAL(10,2),
  quantity INT,
  total_cost DECIMAL(12,2) AS (price * quantity) VIRTUAL
);
```

#### (2) STORED（持久）

> 计算后存储在磁盘上，提高查询性能

**示例**

```sql
CREATE TABLE users (
  first_name VARCHAR(20),
  last_name VARCHAR(20),
  full_name VARCHAR(50) AS (CONCAT(first_name, ' ', last_name)) STORED
);
```

### 4. 修改为计算列

**语法**

```sql
ALTER TABLE users
ADD full_name VARCHAR(50) AS (CONCAT(first_name, ' ', last_name)) STORED;
```

### 5. 注意事项

- VIRTUAL 一般不能建索引（除非是主键/唯一键）,STORED 可以建索引
- 生成列不能引用其他生成列（不能套娃）
- 表达式不能包含子查询、变量、函数如 RAND()、NOW()（不确定）
- VIRTUAL 不占空间但计算开销大，STORED 反之
- 若你用的是 STORED，插入或更新行时会自动计算好并存储

# 数据类型

## 数值类型

### 1. 整数类型

| **类型**      | **占用空间** | **范围（有符号）** | **范围（无符号）** |
| ------------- | ------------ | ------------------ | ------------------ |
| TINYINT       | 1 字节       | -128 ~ 127         | 0 ~ 255            |
| SMALLINT      | 2 字节       | -32,768 ~ 32,767   | 0 ~ 65,535         |
| MEDIUMINT     | 3 字节       | -8 百万 ~ 8 百万   | 0 ~ 1670 万        |
| INT / INTEGER | 4 字节       | -21 亿 ~ 21 亿     | 0 ~ 42 亿          |
| BIGINT        | 8 字节       | 非常大             | 更大               |

### 2. 浮点型 & 定点型

| **类型**     | **说明**                               |
| ------------ | -------------------------------------- |
| FLOAT        | 单精度浮点数（4 字节）                 |
| DOUBLE       | 双精度浮点数（8 字节）                 |
| DECIMAL(m,d) | 定点数，**用于存储精确小数**（如金额） |

**注意**

- 金额类数据 **必须用 DECIMAL**，不要用 FLOAT/DOUBLE，因为后者有精度误差
- DECIMAL 的范围由 m 和 d 决定，占用空间为 m+2
- DECIMAL 不指定 m 和 d 时，默认为(10,0)

## 字符串类型

| **类型**   | **说明**                                  |
| ---------- | ----------------------------------------- |
| CHAR(n)    | 定长字符串，最多 255 字符                 |
| VARCHAR(n) | 变长字符串，最多 65535 字节（受编码限制） |
| TEXT       | 长文本，最多 64KB                         |
| TINYTEXT   | 最多 255 字节                             |
| MEDIUMTEXT | 最多 16MB                                 |
| LONGTEXT   | 最多 4GB                                  |

### 1. CHAR VARCHAR

| **类型** | **全称**        | **说明**                 |
| -------- | --------------- | ------------------------ |
| CHAR     | Fixed-length    | **定长**字符串，长度固定 |
| VARCHAR  | Variable-length | **变长**字符串，长度可变 |

**语法格式**

```sql
-- CHAR(n)：固定 n 个字符
name CHAR(10);

-- VARCHAR(n)：最多 n 个字符
nickname VARCHAR(50);
```

> 注意：这里的 “字符” 不是字节，和字符集有关（比如 utf8 一个汉字是 3 个字节）。

**对比**

| **比较项**   | CHAR(n)                                    | VARCHAR(n)                          |
| ------------ | ------------------------------------------ | ----------------------------------- |
| 是否定长     | ✅ 是                                      | ❌ 否，变长                         |
| 空间占用     | 固定分配 n 个字符的空间                    | 实际内容长度 + 1~2 字节的长度信息   |
| 存储性能     | ✅ 更快（定长结构，容易缓存）              | ❌ 稍慢（每行长度不一致，处理复杂） |
| 末尾空格处理 | 会自动填充并保留                           | 不保留末尾空格（自动截断）          |
| 适用场景     | 长度基本一致的短字符串，如国家代码、性别等 | 可变长度的字符串，如用户名、邮箱等  |
| 最大长度     | 最多 255 个字符                            | 最多 65535 字节（受行最大限制影响） |

**示例**

```sql
CREATE TABLE country (
  code CHAR(2),          -- 如 'CN', 'US'
  name VARCHAR(100)
);
```

- CHAR(2) 永远占两个字符，不管是 'US' 还是 'U'，后者会补空格 'U '。

```sql
CREATE TABLE user (
  id INT,
  nickname VARCHAR(20)  -- 实际长度随内容变
);
```

- 插入 'Tom'：占 3 个字符 + 1 个长度字节

- 插入 'AlexanderTheGreat'：占 19 字符 + 1 个长度字节

**末尾空格处理**

```sql
-- CHAR 会保留末尾空格
SELECT LENGTH(CHAR_FIELD) FROM table;

-- VARCHAR 会自动截掉末尾空格
SELECT LENGTH(VARCHAR_FIELD) FROM table;
```

**使用场景**

| **场景**                               | **推荐类型** |
| -------------------------------------- | ------------ |
| 性别、国别码、身份证位数固定的字段     | CHAR         |
| 用户名、邮箱、地址等长度不定字段       | VARCHAR      |
| 性能更重要（数据量很大且字段长度一致） | CHAR         |
| 节省空间更重要                         | VARCHAR      |

### 2. TEXT 类

| **类型名称** | **最大长度**               | **存储空间**   | **用途示例**                                 |
| ------------ | -------------------------- | -------------- | -------------------------------------------- |
| TINYTEXT     | 255 字符（255 字节）       | 1 字节长度信息 | 短文本，类似评论、标签、标题等               |
| TEXT         | 65,535 字符（64 KB）       | 2 字节长度信息 | 一般的文章内容、评论等                       |
| MEDIUMTEXT   | 16,777,215 字符（16 MB）   | 3 字节长度信息 | 中等长度的文本，例如日志、文章等             |
| LONGTEXT     | 4,294,967,295 字符（4 GB） | 4 字节长度信息 | 用于存储非常长的文本，例如小说、数据库备份等 |

**语法示例**

```sql
CREATE TABLE articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  content TEXT
);

-- 插入文本内容
INSERT INTO articles (title, content) VALUES
('My First Article', 'This is the content of my first article. It is quite long...');
```

**注意事项**

- **不能使用 TEXT 字段作为 PRIMARY KEY 或 UNIQUE KEY**：

  - 由于 TEXT 类型存储较大，因此它不能用作索引字段，除非你指定索引的前缀长度（比如 VARCHAR(255)）。但需要注意的是，即使 TEXT 字段可以部分索引，它的索引性能可能会很差。

- **性能问题**：

  - TEXT 类型字段由于存储在外部，查询时需要额外的 I/O 操作，因此在查询长文本时可能会导致性能问题，尤其是在没有索引的情况下。

- **不适用于存储短文本**：

  - 如果字段内容较短，建议使用 VARCHAR，因为它会更高效，不会浪费存储空间。

- **没有默认长度限制**：

  - TEXT 类型的字段不像 VARCHAR 一样有字符数限制（最大为 65535 字节），它可以存储非常大的文本内容。

- **与 BLOB 的比较**：
  - TEXT 和 BLOB 都是变长字段，区别在于 TEXT 存储字符数据（通常使用字符集编码），而 BLOB 存储二进制数据。它们的存储方式和容量限制相似，但用途不同。

## 日期和时间类型

> MySQL 中的日期和时间类型，是做数据开发时非常常用的一类字段，特别是在记录创建时间、更新时间、业务时间线（比如订单时间、签到时间等）时。

| **类型**  | **示例**              | **描述**                      | **精度支持（MySQL 5.6.4+）** |
| --------- | --------------------- | ----------------------------- | ---------------------------- |
| DATE      | '2025-03-20'          | 只包含日期，格式：YYYY-MM-DD  | ❌ 无小数秒                  |
| TIME      | '12:34:56'            | 只包含时间，格式：hh:mm:ss    | ✅ 支持毫秒~微秒             |
| DATETIME  | '2025-03-20 12:34:56' | 日期 + 时间，常用于业务记录   | ✅ 支持毫秒~微秒             |
| TIMESTAMP | '2025-03-20 12:34:56' | 类似 DATETIME，但和时区强相关 | ✅ 支持毫秒~微秒             |
| YEAR      | 2025                  | 只存年份（1901–2155）         | ❌ 无小数秒                  |

### 1. YEAR

**YEAR 类型基本特性**

- 用于存储年份，例如 2025

- 格式为：**YEAR(4)**（默认写作 YEAR）

- 实际存储的是 **4 位整数**，但属于日期类型
- 0000 也可以被存储，但必须是明确指定（比如做占位符时），不是默认行为。

**存储范围**

| **最小值** | **最大值** |
| ---------- | ---------- |
| 1901       | 2155       |

**语法**

```sql
INSERT INTO t (graduation_year) VALUES (2025);
INSERT INTO t (graduation_year) VALUES ('2025');
INSERT INTO t (graduation_year) VALUES ('25'); -- 自动补成 2025
```

MySQL 会根据你插入的值自动转化：

| **插入值** | **实际存储为** |
| ---------- | -------------- |
| '70'       | 1970           |
| '99'       | 1999           |
| '00'       | 2000           |
| '69'       | 2069           |

**重点：**

- 插入两位数字时，MySQL 会使用 “切换点规则”：
  - 00–69 → 2000–2069
  - 70–99 → 1970–1999
- **尽量避免插入两位年份，容易造成歧义**

### 2. DATE

**基本特性**

| **特性**       | **说明**                                   |
| -------------- | ------------------------------------------ |
| 类型名         | DATE                                       |
| 格式           | 'YYYY-MM-DD'                               |
| 占用空间       | 3 字节                                     |
| 范围           | **1000-01-01 ~ 9999-12-31**                |
| 是否有时间部分 | ❌ 没有（只有年月日）                      |
| 是否支持默认值 | ✅ 可以设置默认值，如 DEFAULT CURRENT_DATE |

**插入语法**

```sql
INSERT INTO holidays (name, holiday_date) VALUES ('元旦', '2025-01-01');
```

**查询语法**

```sql
-- 查询所有今天的记录
SELECT * FROM events WHERE event_date = CURRENT_DATE;

-- 查询某个月的数据（比如 2025年3月）
SELECT * FROM events
WHERE event_date BETWEEN '2025-03-01' AND '2025-03-31';
```

**常用函数**

| **函数**       | **作用**                      |
| -------------- | ----------------------------- |
| CURRENT_DATE() | 当前日期（和 CURDATE() 一样） |
| DATE(NOW())    | 从 DATETIME 中提取出日期部分  |
| DATE_ADD()     | 日期加天数/月份等             |
| DATE_SUB()     | 日期减天数/月份等             |
| DATEDIFF()     | 计算两个日期相差多少天        |
| YEAR(date)     | 提取年份                      |
| MONTH(date)    | 提取月份                      |
| DAY(date)      | 提取日                        |

```sql
-- 计算距离今天还有几天
SELECT DATEDIFF('2025-12-25', CURRENT_DATE) AS days_left;

-- 提取年月日
SELECT YEAR(birthday), MONTH(birthday), DAY(birthday) FROM users;
```

**注意事项**

| **注意点**      | **说明**                                                                   |
| --------------- | -------------------------------------------------------------------------- |
| ❗ 插入非法日期 | MySQL 默认会报错，如 '2025-02-30' 会报错或变成 '0000-00-00'（看 SQL 模式） |
| ❗ 空值问题     | NULL 和 '0000-00-00' 是不同的（是否允许取决于你的 SQL 模式）               |
| ❗ 时区无关     | DATE 类型和系统时区无关，不会因时区偏移而改变                              |
| ✅ 可以索引     | DATE 是常见的索引字段（比如订单日期、注册日期）                            |

### 3. TIME

**基本特性**

| **特性**       | **说明**                       |
| -------------- | ------------------------------ |
| 类型名         | TIME                           |
| 格式           | 'hh:mm:ss'                     |
| 范围           | -838:59:59 到 838:59:59        |
| 占用空间       | 3~5 字节（取决于是否有小数秒） |
| 是否有日期     | ❌ 没有，纯时间                |
| 是否受时区影响 | ❌ 不受时区影响                |

**时间范围 & 精度**

- 最大支持：**838 小时 59 分 59 秒**（不是 24 小时！）

- 可选精度（MySQL 5.6.4+ 起支持小数秒）：

```sql
TIME(0)  -- 默认，精度到秒
TIME(3)  -- 精确到毫秒
TIME(6)  -- 精确到微秒
```

```sql
'12:34:56.789'  -- TIME(3)
'99:59:59.123456' -- TIME(6)
```

**插入与显示**

```sql
INSERT INTO schedule (start_time) VALUES ('08:30:00');
```

MySQL 接受多种格式：

| **插入值** | **实际存储**     |
| ---------- | ---------------- |
| '10:20'    | '10:20:00'       |
| '3:5:9'    | '03:05:09'       |
| -12:00:00  | 负时间段（合法） |
| '90:00:00' | 支持超过 24 小时 |

**常用函数**

| **函数**       | **描述**                 |
| -------------- | ------------------------ |
| CURTIME()      | 返回当前时间（不带日期） |
| SEC_TO_TIME(n) | 将秒数转为时间格式       |
| TIME_TO_SEC(t) | 将时间格式转为秒数       |
| ADDTIME()      | 时间相加                 |
| SUBTIME()      | 时间相减                 |
| HOUR(t)        | 提取小时                 |
| MINUTE(t)      | 提取分钟                 |
| SECOND(t)      | 提取秒                   |

```sql
-- 获取当前时间
SELECT CURTIME();  -- 例如 '16:45:22'

-- 将 3661 秒转为时间
SELECT SEC_TO_TIME(3661);  -- '01:01:01'

-- 计算两个时间差
SELECT SUBTIME('08:30:00', '07:15:00');  -- '01:15:00'
```

### 4. DATETIME

> DATETIME 是 MySQL 中最通用的时间类型，用来准确记录“一个具体时间点”，**不受时区影响、支持微秒精度**，是你设计数据库时间字段的首选！

**基本特性**

| **特性**                 | **内容**                                              |
| ------------------------ | ----------------------------------------------------- |
| 类型名                   | DATETIME                                              |
| 格式                     | 'YYYY-MM-DD HH:MM:SS'                                 |
| 范围                     | '1000-01-01 00:00:00' ~ '9999-12-31 23:59:59'         |
| 占用空间                 | 8 字节（无小数秒） / 9~13 字节（带小数秒）            |
| 精度支持（MySQL 5.6.4+） | 可选精度：DATETIME(fsp)，fsp 可为 0~6，表示小数秒位数 |
| 是否与时区有关           | ❌ 不受时区影响（不同于 TIMESTAMP）                   |

**常用场景**

| **场景**                   | **是否推荐用** DATETIME |
| -------------------------- | ----------------------- |
| 用户注册时间、更新时间     | ✅ 推荐                 |
| 博客发布时间               | ✅ 推荐                 |
| 订单生成时间               | ✅ 推荐                 |
| 记录某年某月某日几点的事情 | ✅ 推荐                 |
| 表示时间段（不含日期）     | ❌ 不推荐，用 TIME      |

**插入与查询**

```sql
-- 插入 DATETIME 字面量
INSERT INTO logs (log_time) VALUES ('2025-03-20 14:45:00');

-- 获取当前时间（不带时区影响）
INSERT INTO logs (log_time) VALUES (NOW());
```

**常用函数**

| **函数**               | **含义**                               |
| ---------------------- | -------------------------------------- |
| NOW()                  | 当前日期时间（同 CURRENT_TIMESTAMP()） |
| DATE(NOW())            | 提取日期部分                           |
| TIME(NOW())            | 提取时间部分                           |
| YEAR(), MONTH(), DAY() | 提取年月日                             |
| DATE_FORMAT()          | 自定义格式输出                         |

```sql
-- 查询今天的记录
SELECT * FROM logs WHERE DATE(log_time) = CURDATE();

-- 查询 2024 年 12 月的记录
SELECT * FROM logs
WHERE log_time BETWEEN '2024-12-01 00:00:00' AND '2024-12-31 23:59:59';
```

**小数秒精度**

支持精确到微秒：

```sql
CREATE TABLE t (
  created_at DATETIME(3)  -- 精确到毫秒，例如 2025-03-20 14:45:30.123
);
```

可选精度范围是 DATETIME(0) 到 DATETIME(6)，对应秒、小数秒、毫秒、微秒级别。

**设计建议**

```sql
-- 可以自动记录插入和更新时间，常见于“记录最后修改时间”场景。
CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**注意事项**

| **注意点**                   | **说明**                                         |
| ---------------------------- | ------------------------------------------------ |
| 插入非法格式会报错           | 比如 '2025-02-30 00:00:00' 是非法的              |
| 不支持 'YYYY-MM-DD' 直接插入 | 少了时间部分会默认补成 '00:00:00'                |
| 不支持时区自动换算           | 与 TIMESTAMP 不同                                |
| 可以加索引/做范围查询        | 日期区间查询效率很好                             |
| 不推荐存文本时间             | 用字符串如 '2025-03-20 14:00' 会失去时间函数支持 |

### 5. TIMESTAMP

> TIMESTAMP 是一种紧凑、高效、支持自动更新时间戳的时间类型，**适合记录服务器时间点、日志、审计信息，受时区影响、最大支持到 2038 年**，相比 DATETIME 更偏系统层面用途。

**基本特性**

| **特性**       | **内容**                                                         |
| -------------- | ---------------------------------------------------------------- |
| 类型名         | TIMESTAMP                                                        |
| 格式           | 'YYYY-MM-DD HH:MM:SS'                                            |
| 时间范围       | '1970-01-01 00:00:01' ~ '2038-01-19 03:14:07'（Unix 时间戳限制） |
| 占用空间       | 4 字节（无小数秒） / 5~9 字节（有小数秒）                        |
| 是否受时区影响 | ✅ **受时区影响（存 UTC，显示按本地转换）**                      |
| 默认值         | ✅ 支持 CURRENT_TIMESTAMP                                        |

**举例**

```sql
CREATE TABLE logs (
  id INT PRIMARY KEY,
  message VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

- 插入数据时记录当前时间

- 每次更新行时自动更新 updated_at

**小数秒支持**

和 DATETIME 一样，可以加小数秒精度（最多 6 位）：

```sql
CREATE TABLE t (
  ts TIMESTAMP(3)  -- 精确到毫秒
);
```

插入：

```sql
INSERT INTO t VALUES ('2025-03-20 14:22:33.789');
```

**与时区有关**

- TIMESTAMP 实际存储的是 **UTC 时间**

- 查询时会根据 MySQL 的 time_zone 设置自动转换成本地时间

```sql
SET time_zone = '+00:00';
SELECT CURRENT_TIMESTAMP;  -- 比北京时间少 8 小时

SET time_zone = '+08:00';
SELECT CURRENT_TIMESTAMP;  -- 显示北京时间
```

**注意事项**

| **⚠️ 注意点**                         | **说明**                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| 1️⃣ 超过 2038 年会出错                 | 因为底层是 32 位 Unix 时间戳                                                           |
| 2️⃣ 时区切换会影响显示值               | 比如迁移数据或修改时区配置前要小心                                                     |
| 3️⃣ 默认只能有一个自动更新的字段       | 一个表中只能有一个字段设置 ON UPDATE CURRENT_TIMESTAMP（除非 MySQL 5.6.5+ 并显式声明） |
| 4️⃣ 如果默认值未设置，插入 NULL 会报错 | 除非声明为 NULL 类型                                                                   |

### 6. DATETIME vs TIMESTAMP

| **对比点**   | DATETIME                           | TIMESTAMP                         |
| ------------ | ---------------------------------- | --------------------------------- |
| 存储方式     | 存储**本地时间**，格式化后存储     | 存储**UTC 时间戳（Unix time）**   |
| 时区影响     | ✅ 不受时区影响                    | ❌ 和当前系统时区有关             |
| 存储范围     | 1000-01-01 ~ 9999-12-31            | 1970-01-01 ~ 2038-01-19           |
| 默认值支持   | ❌ 不支持 CURRENT_TIMESTAMP 默认值 | ✅ 支持 DEFAULT CURRENT_TIMESTAMP |
| 占用空间     | 8 字节                             | 4 字节（或更多，取决于精度）      |
| 推荐使用场景 | 普通业务逻辑时间（创建时间等）     | 系统日志、事件时间戳（含时区）    |

**开发建议**

- 一般建议使用 DATETIME，避免时区干扰。

- 如果做系统日志同步，涉及多个服务器，适合用 TIMESTAMP。

**✅ 四、布尔类型（Boolean）**

MySQL 没有真正的 BOOLEAN 类型，它是 TINYINT(1) 的别名。

```
CREATE TABLE example (
  is_active BOOLEAN -- 实际就是 TINYINT(1)
);
```

​ • TRUE = 1，FALSE = 0

## 枚举与集合

### 1. ENUM 类型

> ENUM 是一个**枚举类型**，用于存储从一组预定义的值中选择一个值。它本质上是一个字符串类型，但是它的值是从定义时指定的值集合中选出的。

**语法**

```sql
CREATE TABLE user (
  id INT PRIMARY KEY,
  gender ENUM('Male', 'Female', 'Other') NOT NULL
);
```

在这个例子中，gender 字段只能是 'Male'、'Female' 或 'Other' 中的一个。

**特性**

| **特性** | **内容**                                                          |
| -------- | ----------------------------------------------------------------- |
| 允许的值 | 从定义的值集合中选择一个值                                        |
| 存储方式 | 以整数形式存储，使用 1 字节、2 字节、3 字节等空间，取决于值的个数 |
| 默认值   | 可以指定默认值，也可以为空（NULL）                                |
| 空间占用 | 根据定义的可选项数量占用不同字节空间                              |
| 比较操作 | 比较时，ENUM 值会按定义的顺序转换为整数进行比较                   |
| 适用场景 | 用于表示有限的选择，如性别、状态、等级等                          |

**优点：**

- **存储效率**：由于 ENUM 值是按整数存储的，因此它比 VARCHAR 更节省空间，尤其是在有多个选项时。

- **数据验证**：只能选择定义的几个值，有效避免无效数据的插入。

**缺点：**

- **灵活性差**：如果需要更改 ENUM 类型的值集合（例如，添加或删除选项），需要修改表结构。

- **扩展性差**：随着选择项的增加，ENUM 字段可能变得不那么方便，尤其在值的集合变化较多的情况下。

### 2. SET 类型

> SET 类型用于存储从一组预定义的值中选择**零个或多个**值。和 ENUM 不同的是，SET 可以包含多个值，允许组合多个选项，而不是单一选项。

**语法**

```sql
CREATE TABLE user (
  id INT PRIMARY KEY,
  hobbies SET('Reading', 'Swimming', 'Traveling', 'Gaming') NOT NULL
);
```

在这个例子中，hobbies 字段可以包含多个选项，比如 'Reading, Traveling' 或 'Swimming, Gaming'。

**特性**

| **特性** | **内容**                                                        |
| -------- | --------------------------------------------------------------- |
| 允许的值 | 从定义的值集合中选择零个或多个值                                |
| 存储方式 | 每个 SET 值以整数位图（bitmap）存储，这使得它比 ENUM 更节省空间 |
| 默认值   | 可以指定默认值，也可以为空（NULL）                              |
| 空间占用 | 存储多个值时，存储效率较高，适用于存储多个组合数据              |
| 比较操作 | 采用位图方式，操作多个选项时，效率较高                          |
| 适用场景 | 用于表示多个选项的组合，如兴趣爱好、权限控制等                  |

**优点：**

- **存储多个值**：可以同时存储多个选项，而不需要创建多个字段或表。

- **灵活性**：非常适合存储可以组合的选项，例如用户的多个爱好或权限。

**缺点：**

- **查询和操作复杂**：与 ENUM 相比，SET 类型的查询和操作更加复杂，尤其是涉及到多选项的查询时。

- **空间浪费**：如果选择的选项很多，但实际选择的值较少，可能会浪费存储空间。

- **无法轻松修改**：如果要增加或删除选项，也需要修改表结构。

### 3. ENUM 和 SET 对比

| **特性**         | ENUM                                   | SET                                         |
| ---------------- | -------------------------------------- | ------------------------------------------- |
| 存储方式         | 用整数存储选项（一个整数代表一个选项） | 用位图存储选项（每个选项占一位）            |
| 值的选择         | 每个字段只能选一个值                   | 每个字段可以选多个值                        |
| 适用场景         | 适合表示互斥的选项（例如性别、状态）   | 适合表示可组合的选项（例如兴趣爱好、权限）  |
| 查询和操作复杂度 | 较简单，只能查询单一选项               | 较复杂，通常需要使用 FIND_IN_SET() 或位操作 |
| 最大选择项数     | 最多 65,535 个选项（实际使用时较少）   | 最多 64 个选项                              |
| 空间占用         | 占用 1~3 字节，取决于选项数量          | 占用较小的空间，取决于选项数量和选中的组合  |
| 修改字段         | 需要修改表结构才能修改选项集           | 修改选项集时需要修改表结构                  |

**适用场景**

| **场景**                       | **推荐使用** |
| ------------------------------ | ------------ |
| **性别、状态等单一选择项**     | ENUM         |
| **多个权限、兴趣爱好等多选项** | SET          |
| **固定的、有序的选择项**       | ENUM         |
| **需要组合多个选项的场景**     | SET          |

**示例**

```sql
-- ENUM 示例：性别字段
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  gender ENUM('Male', 'Female', 'Other') NOT NULL
);
-- 在这个例子中，gender 字段只能存储 'Male'、'Female' 或 'Other'，适合用于性别字段。
```

```sql
-- SET 示例：兴趣爱好字段
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  hobbies SET('Reading', 'Swimming', 'Traveling', 'Gaming') NOT NULL
);
-- 在这个例子中，hobbies 字段可以存储多个选项，比如 'Reading, Traveling' 或 'Swimming, Gaming'，适合存储用户的多重兴趣爱好。
```

**总结**

- **ENUM**：适合表示互斥的、有限选择项（如性别、状态、等级等），每个字段只能选择一个值。

- **SET**：适合表示可以选择多个选项的场景（如兴趣爱好、权限等），每个字段可以选择一个或多个值。

**✅ 六、JSON 类型（MySQL 5.7+）**

```
CREATE TABLE config (
  id INT,
  settings JSON
);
```

​ • 可以存储结构化数据，MySQL 支持 JSON 查询

​ • 不适合频繁更新、搜索的字段，适合存配置、嵌套数据

---

## 位类型（BIT）

BIT 是一种**位类型（bit type）**，用来存储 **二进制位（0 和 1）**，非常适合表示开关、权限、状态等信息。

```sql
CREATE TABLE users (
  id INT,
  permissions BIT(8)
);
```

- 用于存储位图，比如权限、开关等

- 操作复杂，一般不推荐新手使用

---

**✅ 八、小结表格**

| **类型分类** | **常见类型**              | **使用场景**               |
| ------------ | ------------------------- | -------------------------- |
| 数值         | INT、BIGINT、DECIMAL      | ID、计数、金额等           |
| 字符串       | VARCHAR、TEXT、CHAR       | 名称、描述、内容           |
| 时间         | DATE、DATETIME、TIMESTAMP | 创建时间、修改时间等       |
| 布尔         | BOOLEAN（TINYINT）        | 状态开关                   |
| 枚举         | ENUM、SET                 | 状态、分类标签             |
| 特殊         | JSON、BIT                 | 配置、嵌套结构、位图权限等 |

---

如果你在做表设计，我可以帮你分析字段应该选什么类型、是否加索引、是否需要规范化等 —— 你也可以直接抛个例子给我看看 👀
