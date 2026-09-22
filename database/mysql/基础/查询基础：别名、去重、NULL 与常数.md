# 查询基础：别名、去重、NULL 与常数

*类型：knowledge ｜ 难度：入门 ｜ 标签：MySQL、SELECT、SQL基础 ｜ 更新：2026-09-22*

**SELECT 查询的基础四件套：别名（AS 可省略）让输出列名更可读，但只能在 ORDER BY 中引用；DISTINCT 对整个结果行去重，只要有一列不同就会保留；NULL 表示未知，与任何值参与运算结果都是 NULL，需要用 IFNULL 兜底；查询常数不依赖任何表，SELECT 1 最常用于连接探活。标识符与关键字重名时，用反引号包裹即可。**

## SELECT 基本语法

```sql
SELECT 字段1, 字段2, ... FROM 数据表;

-- * 表示该表下的所有字段
SELECT * FROM employees;
```

## 列的别名（Alias）

给查询结果中的某一列临时取名，让输出更清晰、便于后续处理。

```sql
-- AS 可省略，两种写法效果完全一样
SELECT name AS username FROM users;
SELECT name username FROM users;

-- 别名含空格时，用双引号包裹
SELECT name "username", emp_id "emp id" FROM users;

-- 让列名更有意义
SELECT first_name AS 'First Name', last_name AS 'Last Name' FROM employees;
```

- 列的别名只能在 ORDER BY 中使用，不能在 WHERE 中使用（SELECT 在 WHERE 之后才执行）。

## 去除重复行（DISTINCT）

DISTINCT 作用于 SELECT 结果集，去除所有选中字段值都一样的行。

```sql
SELECT DISTINCT column1, column2, ...
FROM table_name;
```

```sql
-- users 表中 (name, city) 组合相同的行只保留一条
SELECT DISTINCT name, city FROM users;
```

- DISTINCT 对整行判断是否重复：只要有一列不同就不会去掉。
- 只选一列时，就是对那一列去重。

## 空值（NULL）参与运算

- NULL 不是空字符串 ''，也不是数字 0，而是未知、缺失、不可用的数据。
- 任何值与 NULL 参与运算，结果都是 NULL。

```sql
SELECT 100 + NULL;  -- 结果是 NULL
SELECT NULL * 5;    -- 结果是 NULL
SELECT NULL / 10;   -- 结果是 NULL
```

解决方式：用 IFNULL 把 NULL 替换成默认值再运算。

```sql
-- price 为 NULL 时按 0 参与计算
SELECT IFNULL(price, 0) + 100 FROM products;
```

## 与关键字重名（反引号）

表名或列名与关键字重名（如 order、select、desc）会引发语法错误，用反引号包裹即可。

```sql
SELECT * FROM `order`;

SELECT `select`, `from` FROM `table`;
```

## 查询常数

在 SELECT 中查询一个固定值而不读取任何表，常用于测试、函数调用或构造控制流程。

```sql
SELECT 1;
SELECT 'hello';
SELECT 3.14;
SELECT NOW();
```

常见应用场景：

```sql
-- 测试数据库连接/状态：连接池等中间件用它探活
SELECT 1;

-- 占位测试：快速构造一条固定返回
SELECT 'OK' AS status, 200 AS code;

-- 多列常数：起别名模拟一条记录
SELECT 1 AS id, '张三' AS name, 5000 AS salary;

-- 常量与字段混合：为每一行附加一个固定值 status = '已处理'
SELECT id, name, '已处理' AS status
FROM orders;
```
