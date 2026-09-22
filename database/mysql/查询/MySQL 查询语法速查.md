# MySQL 查询语法速查

*类型：knowledge ｜ 难度：基础 ｜ 标签：MySQL、查询*

**单表查询的完整骨架是 SELECT -> FROM -> WHERE -> ORDER BY -> LIMIT：WHERE 先过滤行，再排序，最后截取条数。三大高频易错点：判空只能用 IS NULL，与 NULL 的任何比较结果都是 UNKNOWN，该行不会被返回；AND 优先级高于 OR，混用时不加括号必踩坑；分页必须搭配稳定的 ORDER BY，否则翻页会出现重复或遗漏。**

## WHERE 条件过滤

**WHERE 对每一行求值，只保留条件为 TRUE 的行；结果为 FALSE 或 UNKNOWN（NULL）的行都被丢弃。它同时服务于 SELECT、UPDATE、DELETE。**

- WHERE 在 SELECT 之前执行，因此不能使用 SELECT 里定义的列别名。

```sql
-- 比较与逻辑组合
SELECT * FROM users WHERE age > 25;
SELECT * FROM users WHERE age > 20 AND gender = 'male';

-- IN：多值匹配，等价于多个 OR
SELECT * FROM users WHERE name IN ('张三', '王五');

-- BETWEEN：闭区间 [20, 28]，含边界，上下限不能写反
SELECT * FROM users WHERE age BETWEEN 20 AND 28;

-- LIKE：'%' 匹配任意多个字符，'_' 匹配一个字符，匹配符号本身用 '\' 转义
SELECT * FROM users WHERE name LIKE '张%';
SELECT * FROM users WHERE name LIKE '%an%';

-- NOT：取反，等价于 age >= 25
SELECT * FROM users WHERE NOT (age < 25);

-- WHERE 同样用于限定更新和删除的范围
DELETE FROM users WHERE age < 18;
UPDATE users SET age = age + 1 WHERE gender = 'male';
```

## 排序 ORDER BY

**ORDER BY 在 SELECT 之后执行，可以使用列别名；ASC 升序是默认值，DESC 降序。多列排序只有在前一列值相同时，后面的列才参与比较。**

```sql
-- 多列排序：先按 price 降序，价格相同再按 stock 升序
SELECT * FROM products ORDER BY price DESC, stock ASC;

-- 按别名 / 表达式排序：表达式排序无法使用该列的索引
SELECT name, price * 0.9 AS discount_price
FROM products
ORDER BY discount_price ASC;

-- 按函数排序
SELECT * FROM products ORDER BY LENGTH(name) DESC;
```

易错点：NULL 的排序位置。

- MySQL 中升序时 NULL 排最前、降序时排最后；要固定 NULL 位置需手动控制：

```sql
-- 把 NULL 视为最大值，排在最后
SELECT * FROM products
ORDER BY ISNULL(stock), stock ASC;

-- 用 CASE 显式标记，意图更清晰
SELECT * FROM products
ORDER BY CASE WHEN stock IS NULL THEN 1 ELSE 0 END, stock;
```

- 不写 ORDER BY 时结果顺序不可靠（不应依赖默认返回顺序）。
- 排序是资源消耗大户：先 WHERE 筛选、再 LIMIT 截取，避免对大结果集整体排序。

## 分页 LIMIT

**LIMIT 控制返回条数，OFFSET 控制跳过行数；第 N 页（每页 size 条）的偏移量是 (N-1)*size。OFFSET 越大需要扫描并丢弃的行越多，深分页性能差。**

```sql
-- 两种等价写法，偏移量从 0 开始
SELECT * FROM products LIMIT 0, 10;           -- 第 1 页
SELECT * FROM products LIMIT 10 OFFSET 0;

-- 第 2 页：跳过前 10 条
SELECT * FROM products ORDER BY id ASC LIMIT 10, 10;

-- 第 N 页通式（每页 10 条）
SELECT * FROM products ORDER BY id ASC LIMIT (N-1)*10, 10;

-- 分页器展示「共几页」还需要一条总数查询
SELECT COUNT(*) FROM products WHERE category = '电子产品';
```

易错点：

- 分页不加 ORDER BY 时，页与页之间可能重复或遗漏；排序键还需保证唯一性（必要时补 id 作 tiebreaker）。
- 关键词书写顺序固定：FROM -> WHERE -> ORDER BY -> LIMIT。

## 运算符速查

**运算符分算术、比较、逻辑、位运算四类。与 NULL 相关的两个特殊符号：判空用 IS NULL；安全等于 <=> 是唯一能正确比较 NULL 的比较符（NULL <=> NULL 结果为 1）。**

### 算术与比较

| 运算符 | 说明 |
| --- | --- |
| `+` `-` `*` `/` `%` | 算术；任一操作数为 NULL，结果为 NULL |
| `=` `<>` `!=` `>` `<` `>=` `<=` | 比较；任一边为 NULL，结果为 NULL |
| `<=>` | 安全等于，可正确比较 NULL |
| `&` `\|` `^` `~` `<<` `>>` | 位运算，仅用于整数字段 |

```sql
SELECT 1 = '1', 1 = 'a', 0 = 'a' FROM DUAL;
-- 结果：1  0  1 —— 字符串与数字比较触发隐式转换，'a' 转不成数字按 0 处理
SELECT NULL + 5;        -- NULL
SELECT NULL <=> NULL;   -- 1
```

### 关键字式比较

| 类型 | 运算符 |
| --- | --- |
| 空值 | IS NULL、IS NOT NULL（等价函数写法 ISNULL(col)） |
| 范围 | BETWEEN、NOT BETWEEN（闭区间） |
| 集合 | IN、NOT IN |
| 模式 | LIKE、NOT LIKE、REGEXP |
| 布尔 | IS TRUE、IS FALSE、IS UNKNOWN |
| 子查询 | EXISTS、NOT EXISTS |

```sql
SELECT * FROM employees WHERE commission_pct IS NOT NULL;
SELECT * FROM products WHERE price BETWEEN 3 AND 6;
SELECT * FROM products WHERE name IN ('Apple', 'Mango');
```

### 逻辑运算符与优先级

```sql
-- AND / OR / NOT / XOR（XOR：恰好一个条件成立才为真）
SELECT * FROM products WHERE price > 3 AND stock < 50;
SELECT * FROM products WHERE price < 2 OR stock > 100;
SELECT * FROM products WHERE price < 2 XOR stock > 100;
```

| 优先级 | 运算符 |
| --- | --- |
| 1 | `()` |
| 2 | `*` `/` `%` |
| 3 | `+` `-` |
| 4 | 比较、IS、LIKE、BETWEEN、IN |
| 5 | NOT |
| 6 | AND |
| 7 | OR |

易错点：AND 先于 OR 结合，混用时不加括号，实际语义往往不是想要的。

```sql
-- 实际被解析为 price > 3 OR (price < 2 AND stock > 50)
SELECT * FROM products WHERE price > 3 OR price < 2 AND stock > 50;

-- 加括号明确意图，更安全、可维护
SELECT * FROM products WHERE price > 3 OR (price < 2 AND stock > 50);
```

## NULL 三值逻辑

**SQL 谓词的返回值是 TRUE / FALSE / UNKNOWN 三值，NULL 参与任何比较的结果都是 UNKNOWN 而非 FALSE；WHERE 只保留 TRUE 的行，所以含 NULL 的行会被静默过滤，这是大量「看起来没问题」的查询失效的根源。**

```sql
-- discount 为 NULL 时，条件结果是 UNKNOWN，该行不会出现
SELECT * FROM products WHERE discount > 0.9;

-- 正确做法：先显式排除 NULL
SELECT * FROM products
WHERE discount IS NOT NULL AND discount > 0.9;
```

- `WHERE name != '张三'` 查不出 name 为 NULL 的行（UNKNOWN 被过滤），需补 `OR name IS NULL`。
- `NOT IN` 的子查询结果中若含 NULL，整个 NOT IN 恒为 UNKNOWN，一行都查不到。
- NULL 参与算术运算结果也是 NULL，用 IFNULL 兜底：`SELECT IFNULL(price, 0) + 100 FROM products;`
- 判空唯一正确写法：IS NULL / IS NOT NULL / ISNULL() / <=>。
