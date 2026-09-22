# Python 核心语法速查

*类型：knowledge ｜ 难度：入门 ｜ 标签：Python、语法速查*

**给已会编程者的 Python 速查：动态类型 + 鸭子类型，赋值即声明，缩进即语法；内置容器只有 list / tuple / dict / set 四种，围绕它们的语法糖是 Python 的核心体验——切片 `seq[start:stop:step]`、推导式、序列解包 `a, b = b, a`、f-string、`with` 资源管理；字典 3.7+ 保序且默认遍历键；字符串与元组不可变，所有方法返回新对象；固定假值 `0`、`''`、`[]`、`{}`、`None` 让 `if lst:` 成为惯用判空。**

## 数据结构

### 变量与赋值

- 无需声明类型，赋值即创建；变量是对象的引用，类型跟着值走（鸭子类型）
- 逗号分隔一行多赋值，右侧按位置一一对应；同一语法直接交换变量，无需临时变量
- 数字字面量可用下划线分位；常量无语言级支持，靠全大写命名约定表达

```python
x, y, z = 1, 2, 3        # 序列解包：按位置一一对应
x, y = y, x              # 交换变量
big = 1_000_000          # 1000000，下划线仅提升可读性，打印时消失
MAX_RETRIES = 3          # 约定常量：全大写，不应再对其赋值
```

### 数字与运算

- `/` 相除恒返回浮点数，即使能整除；`**` 是幂运算；`%` 取余（奇偶判断、周期分组）
- `+=` `-=` `*=` `/=` 增强赋值；操作数含浮点数则结果为浮点数
- `int()` 转换失败直接抛异常；浮点转 int 直接截断，不四舍五入

```python
4 / 2          # 2.0 —— 能整除也是浮点数
2 ** 10        # 1024
int("42")      # 42
int(3.9)       # 3 —— 截断
int("abc")     # ValueError
```

### 字符串与 f-string

- 单双引号完全等价，按内容选外层引号避免转义；不可变：所有方法返回新字符串，可链式调用
- f-string 在串前加 `f`，`{}` 内可直接写表达式
- 索引与切片规则对所有序列（list / tuple / str）通用

```python
s = " hello world "
s.title()                        # ' Hello World ' —— 每个单词首字母大写
s.strip().upper()                # 'HELLO WORLD' —— 去空白再转大写
"test_backup.py".removeprefix("test_")   # 'backup.py'（3.9+）

name, age = "Tom", 12
f"{name} is {age + 1} next year" # 'Tom is 13 next year'
```

### 列表

- 有序可变序列：`del` 删完即丢，`pop` 弹出并返回元素；`sort()` 原地排序返回 `None`，`sorted()` 返回新列表不改原数据，两者均支持 `reverse=True`

| 操作 | 写法 | 说明 |
|---|---|---|
| 末尾添加 | `lst.append(x)` | |
| 指定位置插入 | `lst.insert(i, x)` | |
| 弹出 | `lst.pop(i)` | 默认弹出末尾并返回该元素 |
| 按值删除 | `lst.remove(x)` | 只删第一个匹配项 |
| 按索引删除 | `del lst[i]` | 无返回值 |
| 长度 | `len(lst)` | 内置函数 |

### 切片

- 语法 `seq[start:stop:step]`，左闭右开，省略即取到边界

```python
nums = [0, 1, 2, 3, 4, 5]
nums[1:4]     # [1, 2, 3] —— 含头不含尾
nums[::2]     # [0, 2, 4] —— 步长 2
nums[::-1]    # [5, 4, 3, 2, 1, 0] —— 步长 -1 即反转
nums[:]       # 整份浅拷贝，切断与其他变量共享的引用
```

### 推导式

- 一行完成「循环 + 过滤 + 构建」，Python 最具辨识度的语法糖；dict / set 同理

```python
squares = [x**2 for x in range(1, 6)]           # [1, 4, 9, 16, 25]
evens = [x for x in range(10) if x % 2 == 0]    # [0, 2, 4, 6, 8] —— 带 if 过滤
uniq = {x for x in [1, 1, 2]}                   # 集合推导式 {1, 2}
```

### 元组

- 不可变序列：支持索引和切片，声明后不能增删改，误改直接报错而非悄悄生效
- 单元素必须带逗号：`(1,)` 是元组，`(1)` 只是分组括号包着的整数

```python
t = (1, 2, 3)
t[0]          # 1 —— 索引、切片与列表相同，切片返回的仍是元组
t[0] = 9      # TypeError: 'tuple' object does not support item assignment
type((1,))    # <class 'tuple'>
type((1))     # <class 'int'>
```

### 字典

- 键值对容器，3.7+ 保留插入顺序；`d[key]` 赋值时「键存在则修改、不存在则新增」
- 访问两派：`d[key]` 键不存在抛 `KeyError`；`d.get(key, default)` 安全访问返回默认值
- 遍历三通道：默认遍历键，`values()` 取值，`items()` 键值对一起拿（最常用）

```python
user = {"name": "Tom", "age": 18}
user["city"] = "Hangzhou"       # 键不存在 → 新增
user["age"] = 19                # 键已存在 → 修改
del user["city"]                # 删除键值对
user.get("email", "N/A")        # 'N/A' —— 键不存在返回默认值，不报错

for k, v in user.items():
    print(f"{k}: {v}")
```

### 集合

- 无序 + 不重复，核心用途是去重与成员检测；无序故不支持索引访问
- 空集合必须写 `set()`——`{}` 创建的是空字典

```python
nums = set([1, 2, 2, 3])    # {1, 2, 3} —— 列表去重标准写法，顺序不保证
"py" in nums                # 成员检测
```

- 内置函数对各类容器通用：`len()` / `in` / `min()` / `max()` / `sum()` / `sorted()`

## 控制流

### 条件与真值

- 分支结构 `if` / `elif` / `else`，命中一个分支后不再检查后续
- 逻辑运算符是单词：`and` / `or` / `not`；`in` / `not in` 做成员检测，适用于字符串与各类容器
- 固定假值：`0`、`0.0`、`''`、`[]`、`()`、`{}`、`None`，其余一切为真

```python
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("C")

if lst:            # 惯用判空，无需 len(lst) == 0
    ...
```

### for / while 循环

- `for item in iterable:` 遍历可迭代对象，循环体用缩进表示归属；`range(start, stop, step)` 含头不含尾
- `while` 条件为真持续执行，循环体内记得推进条件，避免死循环
- `break` 立即退出整个循环；`continue` 跳过本轮进入下一轮

```python
for lang in ["python", "go"]:
    print(lang)

for i in range(0, 10, 2):   # 0 2 4 6 8
    print(i)

for i in range(10):
    if i == 3:
        continue    # 跳过 3
    if i == 6:
        break       # 终止整个循环
```

- 数值统计直接作用于列表：`min(nums)` / `max(nums)` / `sum(nums)`

### 缩进与风格

- 缩进即语法：统一 4 空格、禁用 Tab，两者混用直接报错
- PEP 8 硬规则：每行不超过 80 字符，注释每行不超过 72 字符
- `#` 单行注释；行尾注释与代码至少隔两空格；注释解释「为什么」而非复述代码

## 函数与类

### 函数定义与参数

- `def` 定义；首行 `"""..."""` 文档字符串可通过 `__doc__` 或 `help()` 查看
- 参数不声明类型（鸭子类型）：传入对象支持所需操作即可
- 位置实参按顺序对应；关键字实参按名传值、顺序无关，须写在位置实参之后
- `*args` 收集多余位置实参为元组；`**kwargs` 收集关键字实参为字典；`*` 与 `**` 才是语法本体，名字只是惯例

```python
def intro(name, age):
    """返回自我介绍"""
    return f"{name}, {age}"

intro("Tom", 18)             # 位置实参：顺序决定对应关系
intro(age=18, name="Tom")    # 关键字实参：顺序无关

def total(*args, **kwargs):
    print(args, kwargs)      # (1, 2) {'sep': ','}

total(1, 2, sep=",")
```

- 可变对象参数陷阱：函数内修改列表直接影响原列表；传 `lst[:]` 切片副本可保护原数据

```python
def process(items):
    items.append("new")      # 改的是调用方传入的同一个列表

process(my_list[:])          # 传副本，原列表不受影响；大列表且无需保护时可直传引用
```

### 类与继承

- `class` 定义，类名大驼峰；`__init__` 创建实例时自动执行；`self` 指向实例，调用方法时自动传入
- 属性通过 `self.属性名` 挂载，每个实例各自一份
- 继承：`class Child(Parent):` 自动获得父类全部方法；定义同名方法即重写；`super()` 复用父类初始化逻辑

```python
class Dog:
    """一次模拟小狗的简单尝试"""

    def __init__(self, name, age):
        self.name = name     # 实例属性
        self.age = age

    def sit(self):
        print(f"{self.name} is now sitting.")

my_dog = Dog("Willie", 6)    # 创建实例，__init__ 自动执行

class ElectricCar(Car):
    def __init__(self, make, model, year, battery_size=75):
        super().__init__(make, model, year)   # 复用父类 __init__
        self.battery_size = battery_size      # 扩展子类自己的属性
```

- 风格：类内方法之间空一行，模块中类与类之间空两行

## 模块与异常

### 模块与导入

- `import 模块`：导入整个模块，调用须带前缀；`from 模块 import 名称`：只导入特定名称，直接按名调用
- `as` 设别名，`import numpy as np` 是社区通用惯例；`from 模块 import *` 污染命名空间，不推荐
- 模块顶部、`import` 之前的文档字符串描述模块用途，`help(模块名)` 首先展示

```python
import math
math.sqrt(16)                    # 4.0 —— 必须带前缀

from math import sqrt, ceil      # 只导入需要的名称
from car import Car as C         # 导入类并设别名，语法对函数 / 类通用
```

### 异常处理

- `try` 放可能出错的代码，`except` 按类型捕获，`else` 仅在无异常时执行
- 必须指明异常类型：裸 `except:` 会连 bug 一起吞掉，难以排查
- 可预期且无需处理的情况，`pass` 静默跳过即可

```python
try:
    num = int(input("输入数字: "))   # 可能抛 ValueError
except ValueError:
    print("输入无效")
else:
    print(f"你输入了: {num}")        # 仅无异常时执行，失败路径一目了然

try:
    with open("missing.txt") as f:   # with：退出代码块自动关闭文件
        content = f.read()
except FileNotFoundError:
    pass
```

## 文件与 JSON

### pathlib 文件读写

- 推荐用 `pathlib.Path` 对象代替字符串路径；`exists()` 先检查存在性再读，避免报错
- `read_text()` 读全部内容为字符串（不存在则报错）；`write_text()` 写入字符串（不存在自动创建，已存在整体覆盖）

```python
from pathlib import Path

path = Path("data/note.txt")     # 相对路径相对当前工作目录解析
if path.exists():
    content = path.read_text()

path.write_text("hello\nworld")  # 自动创建 / 整体覆盖
lines = content.splitlines()     # ['hello', 'world'] —— 按行分割为列表
"world" in content               # True —— in 检查子串是否出现
```

### JSON 序列化

- 方向记法：`dumps` 出去（对象 → JSON 字符串）、`loads` 进来（JSON 字符串 → 对象）

```python
import json

text = json.dumps({"name": "Tom", "age": 18})   # '{"name": "Tom", "age": 18}'
restored = json.loads(text)                     # 还原为字典，正常按键访问
```

- 类型对应：dict / list ↔ object / array，`None` ↔ `null`，`True` ↔ `true`
- 典型场景：配置落盘 `dumps` 写、启动 `loads` 读；接口收发同理
