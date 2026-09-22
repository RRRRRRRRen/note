# SELECT 执行顺序

*类型：knowledge ｜ 难度：基础 ｜ 标签：MySQL、执行顺序、SQL ｜ 更新：2026-09-22*

**一条 SELECT 的书写顺序是 SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ... LIMIT，但实际执行顺序是 FROM/JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT。所有「为什么 WHERE 里不能用聚合函数和 SELECT 别名、而 ORDER BY 里可以」的问题，答案都在这条顺序里：别名诞生于 SELECT 阶段，只有排在其后的 ORDER BY、LIMIT 能看到它。**

## 示例语句

```sql
SELECT department_id, AVG(salary) AS avg_salary
FROM employees
WHERE salary > 5000
GROUP BY department_id
HAVING avg_salary > 10000
ORDER BY avg_salary DESC
LIMIT 3;
```

## 逐步执行过程

### 第 1 步：FROM，确定数据来源

```sql
FROM employees
```

- 确定主查询表，把原始数据拿出来。
- 如果有多表连接（JOIN），也在这一步处理。

### 第 2 步：JOIN 和 ON，连接其他表

```sql
FROM employees
JOIN departments ON employees.department_id = departments.id
```

- 多表连接在 FROM 阶段处理。
- JOIN 种类（INNER、LEFT、RIGHT）影响结果集的行数。
- ON 是连接条件，不要把行筛选条件（如 salary > 5000）写进 ON。

### 第 3 步：WHERE，行级过滤

```sql
WHERE salary > 5000
```

- 在分组、聚合之前对原始数据做行筛选。
- 不能使用聚合函数（AVG、SUM 等），此时还没有开始聚合。

### 第 4 步：GROUP BY，分组

```sql
GROUP BY department_id
```

- 把筛选后的记录按字段或表达式分组，每组之后成为一行结果。
- 聚合函数的「分组结果」从这个阶段开始产生。

### 第 5 步：HAVING，组级过滤

```sql
HAVING avg_salary > 10000
```

- 过滤的是每个分组的统计值，不是原始行。
- 可以使用聚合函数，WHERE 做不了的聚合条件判断在这里做。

### 第 6 步：SELECT，选择返回的字段

```sql
SELECT department_id, AVG(salary) AS avg_salary
```

- 执行字段选择、聚合计算。
- 别名在这一步产生，但要等后面的步骤才能被识别。

### 第 7 步：DISTINCT，去重（可选）

```sql
SELECT DISTINCT ...
```

- 在 SELECT 之后、ORDER BY 之前去重。
- 去重操作可能非常耗资源，注意性能。

### 第 8 步：ORDER BY，排序

```sql
ORDER BY avg_salary DESC
```

- 对 SELECT 产出的结果排序，此时可以使用 SELECT 中的别名。
- 可以排序多个字段：ORDER BY a DESC, b ASC。

### 第 9 步：LIMIT，限制数量

```sql
LIMIT 3
```

- 最后一步，控制返回条数，通常用于分页或截取前几名。

## 总结

```text
FROM          -- 从哪张表查数据
JOIN / ON     -- 多表连接与联结条件
WHERE         -- 行筛选（不能用聚合函数）
GROUP BY      -- 分组
HAVING        -- 组筛选（可用聚合函数）
SELECT        -- 选择字段（聚合、表达式、别名在此产生）
DISTINCT      -- 可选，去重
ORDER BY      -- 排序（可用别名）
LIMIT         -- 截取返回数据
```
