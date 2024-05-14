# 第 03 章 Java 的基本程序设计结构

## 3.1 一个简单的 java 程序

**代码规则**

- java 区分大小写
- 每个语句必须使用分号结束
- java 中任何方法的代码都必须以 `{` 开始 `}` 结束

**类名的命名规则**

- 类名必须以字母开头，后面可以跟数字和字母的任意组合
- 类名是以大写字母开头的名词，如果名字由多个单词组成，应该使用大驼峰方式命名。
- 源代码的文件名必须与公共类的类名相同，并以`.java`作为扩展名

**执行规则**

- 修饰符用于控制程序的其他部分对这段代码的访问级别，例如`public`
- java 虚拟机总是从指定类中`main`方法的代码开始执行
- 每个 java 引用都必须有一个`main`方法

## 3.2 注释

**单行注释**

> 从//开始到本行结束都是注释

```JAVA
// 单行注释
```

**多行注释**

> 可以使用`/*` `*/` 注释界定符讲一段比较长的注释括起来
>
> 不能嵌套

```java
/*
	多行注释
	多行注释
*/
```

**文档注释**

> 可以用于自动生成文档

```java
/**
	文档注释
  	@auther: ren
*/
```

## 3.3 数据类型

### 3.3.1 整型

> 用于表示没有小数部分的数，可以是负数。
>
> java 提供了 4 种整型：`byte` / `short` / `int` / `long`

| 类型  | 占用空间      | 表数范围                   | 注意                                               |
| ----- | ------------- | -------------------------- | -------------------------------------------------- |
| byte  | 1 Byte = 8bit | -2^7 ~ 2^7-1（-128 ~ 127） |                                                    |
| short | 2 Byte        | -2^15 ~ 2^15-1             |                                                    |
| int   | 4 Byte        | -2^31 ~ 2^31-1             | 常用                                               |
| long  | 8 Byte        | -2^63 ~ 2^63-1             | 赋值需要后缀 `L` / `l`<br />`long x = 123456789L;` |

**各进制表示法**

- 十六进制：前缀`0x`或`0X`，例如`0xCAEF12`

- 八进制：前缀`0`，例如`010`

- 二进制：前缀`0b`或者`0B`，例如`0b1001`

**数字可视化表示**

使用下划线`_`方便阅读，java 编译器会忽略下划线，例如：`1_000_000`、`0b1111_0110_0010`

### 3.3.2 浮点类型

> 用于表示有小数部分的数值。
>
> java 提供了 2 种浮点类型：float、double

| 类型   | 占用空间 | 表数范围               | 注意                                                                             |
| ------ | -------- | ---------------------- | -------------------------------------------------------------------------------- |
| float  | 4 Byte   | -3.403E38 ~ 3.403E38   | 赋值需要后缀` F` / `f`<br />`float x = 123.23F;`                                 |
| double | 8 Byte   | -1.798E308 ~ 1.798E308 | 不带后缀默认 double 类型<br />可选的增加后缀 `D`/`d`<br />`double x = 123.233D;` |

**表示溢出和出错的浮点数**

- 正无穷：`DOUBLE.POSITIVE_INFINITY`
- 负无穷：`DOUBLE.NEGATIVE_INFINITY`
- 非数字：`DOUBLE.NaN`
  - 所有`NaN`都是不同的。
  - 可以使用`Double.isNaN()`判断。

### 3.3.3 字符类型

> char 类型用于表示单个字符。
>
> java 提供了 1 种字符类型：char

**特殊字符转移序列**

| 转义序列 | 名称   |
| -------- | ------ |
| `\b`     | 退格   |
| `\t`     | 制表   |
| `\n`     | 换行   |
| `\r`     | 回车   |
| `\f`     | 换页   |
| `\"`     | 双引号 |
| `\'`     | 单引号 |
| `\\`     | 反斜杠 |
| `\s`     | 空格   |

**注意**

- char 类型的字面量都需要使用单引号括起来。`''`
- char 类型可以表示为十六进制的值。\u0000 ~ \uFFFF
- 可以在加引号的字符、双引号的字符串中使用转义序列。
- 转义序列\u 可以在任意位置使用，包括注释。其他转义序列不可以。
- Unicode 转义序列会在解析代码之前执行。
- 强烈不建议在程序中使用 char 类型。

### 3.3.5 布尔类型

> boolean 类型用于判定逻辑条件。
>
> java 提供了 1 种布尔类型：boolean，且只有两个值：`true`、`false`

**注意**

整型值和布尔值不能相互转换。

```java
if(0); // 编译直接报错：int类型无法转换为boolean类型
```

## 3.4 常量与变量

### 3.4.1 声明变量

**语法**

> 先指定变量类型，再指定变量名

```java
double x;
```

**变量名的要求**

- 由字符、数字、货币符号、标点连接符组成。范围很广，但是一般是用：a~Z，0~9，\_
- 区分大小写
- 不能使用 java 关键字

**连续声明**

> 可以一行声明多个变量，但不推荐

```java
int i, j;
```

### 3.4.2 初始化变量

**语法**

> 必须使用赋值语句显示初始化变量

```java
int a;
a = 12;
```

**直接初始化**

```java
int a = 12;
```

**类型推断初始化**

> 可以直接推断出来的类型可以直接使用 var 直接初始化

```java
var x = 12;
var x = 12.3;
var x = "ren";
```

### 3.4.3 常量

**语法**

```java
final double CM_PRE_INCN = 2.54;
```

**特性**

- 关键字`final`表示这个变量只能赋值一次

**习惯做法**

- 常量使用全大写
- 使用`static final`设置一个类常量

### 3.4.4 枚举类型

**语法**

```java
enum Size { SMALL, MEDIUM };
Size s = Size.SMALL;
```

**特性**

枚举类型的变量只能存储声明中列出的值，或者 null。

## 3.5 运算符

### 3.5.1 算数运算符

| 运算符 | 运算                                                   | 案例                               | 结果                           | 注意                                                                                                       |
| ------ | ------------------------------------------------------ | ---------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| +      | 正号                                                   | +3                                 | 3                              |                                                                                                            |
| -      | 负号                                                   | -3                                 | -3                             |                                                                                                            |
| +      | 加                                                     | 5 + 5                              | 10                             |                                                                                                            |
| -      | 减                                                     | 5 - 1                              | 4                              |                                                                                                            |
| \*     | 乘                                                     | 3 \* 4                             | 12                             |                                                                                                            |
| /      | 除                                                     | 5 / 5                              | 1                              | 都是整数才使用整数除法，返回整数<br />否则使用浮点除法，返回浮点结果<br />浮点除法可以除 0，整数除法不可以 |
| %      | 取余                                                   | 7 % 5                              | 2                              |                                                                                                            |
| ++     | 自增（前）：先运算后取值<br />自增（后）：先取值后运算 | a = 2;b = ++a;<br />a = 2;b = a++; | a = 3;b = 3;<br />a = 3;b = 2; | 不会导致类变化                                                                                             |
| --     | 自减                                                   | a = 2;b = --a;<br />a = 2;b = a--; | a = 1;b = 1;<br />a = 1;b = 2; | 不会导致类变化                                                                                             |
| +      | 字符串连接                                             | "Hel" + "lo"                       | "Hello"                        |                                                                                                            |

### 3.5.2 数学函数与常量

**常用方法**

```java
double x = 4;
// 求平方根
double y = Math.sqrt(x);
// 幂运算
double y = Math.pow(x);
```

**简化导入**

> 导入后，在使用数学方和和常量前就不用添加`Math`类。

```java
import static java.lang.Math.*

System.out.println(sqrt(PI));
```

**特性**

- `Math`类使用浮点运算，不同平台可能结果不同。
- 使用`StricMath`确保不同平台有确定的值。
- 普通运算溢出后不会报错，可以使用`Math`提供整数计算方法捕获错误

### 3.5.3 数值类型之间的转换

**自动转换**

> 容量小的和容量大的变量相互运算时，自动转换为容量大的数据类型。
> 这里的容量值得是数据范围而非内存占用大小。
>
> 容量大小：`byte ---> short ---> int ---> long ---> float ---> double`

- 特殊情况 1：涉及到 byte 和 short 的相互运算需要用 int 接受

- 特殊情况 2：涉及到 char 和 byte 和 short 的相互运算也需要用 int 接受

- 特殊情况 3：布尔类型不能与其他基本数据类型相互运算。

```java
long x = 123L;
long x = 123; // 自动提升：int ---> long
long x = 123123123123123; // 自动提升失败：123123123123123超出int范围。
```

```java
float x = 12.3F;
float x = 12.3; // 自动转换失败：double ---> float 失败
```

```java
// 整型 与 常量，规定必须int类型接受
byte x = 10;
int y = x + 1;
// 浮点 与 常量，规定必须double类型接受
double z = x + 12.3;
```

### 3.5.4 强制类型转换

**语法**

```java
double x = 12.9;
int y = (int)x;
System.out.println(y); // 12
```

**特性**

- 强制转换通过截断浮点类型的小数部分来转换为整数。
- 使用 Math.round()进行舍入

```java
double x = 9.993;
// Math.round会返回一个long类型
int nx = (int) Math.round(x); // 10
```

### 3.5.5 赋值

**语法**

```java
x += 4;
// 等价于
x = x + 4;
```

**特性**

- 赋值也是一个表达式，具有返回值，返回的就是赋的值。
- 使用二元运算符赋值不会发生类型的强制转换。

### 3.5.6 自增自减运算符

| 运算符 | 运算                                                   | 案例                               | 结果                           | 注意           |
| ------ | ------------------------------------------------------ | ---------------------------------- | ------------------------------ | -------------- |
| ++     | 自增（前）：先运算后取值<br />自增（后）：先取值后运算 | a = 2;b = ++a;<br />a = 2;b = a++; | a = 3;b = 3;<br />a = 3;b = 2; | 不会导致类变化 |
| -      | 自减                                                   | a = 2;b = --a;<br />a = 2;b = a--; | a = 1;b = 1;<br />a = 1;b = 2; | 不会导致类变化 |

### 3.5.7 关系和 boolean

**相等**

- 检测相等：`==`
- 检测不相等：`!=`
- 逻辑非：`!`

**比较**

`>`、`>`、 `<=`、 `>=`

**短路逻辑**

`&&` 、`||` 按照短路的方式进行比较

### 3.5.8 条件运算符

**语法**

```java
x < y ? x : y;
```

**特性**

- 条件表达式为 Boolean 类型
- 如果 true 执行 1，否则执行 2

### 3.5.9 switch 表达式

**语法**

```java
// 普通变量语法
var x = 0;
String season1 = switch (x) {
    case 0 -> "A";
    case 1 -> "B";
};
System.out.println(season1);

// 枚举语法
enum Size { A, B, C };
Size size = Size.A;
String season2 = switch (size) {
    case A -> "A";
    case B -> "B";
    case C -> "C";
};
System.out.println(season2);
```

**特性**

- switch 中只允许使用 byte、short、char、int、枚举（JDK5）、String（JDK7）
- 使用枚举常量时，不需要为各个标签提供枚举名。
- 使用整数或者 String 操作数的 switch 必须有一个 default，因为表达式必须要生成一个值。

### 3.5.10 位运算符

| 符号 | 名称       | 备注     |
| ---- | ---------- | -------- |
| <<   | 左移       |          |
| >>   | 右移       |          |
| >>>  | 无符号右移 |          |
| &    | 且         | 不会短路 |
| \|   | 或         | 不会短路 |
| ^    | 异或       |          |
| ~    | 取反       |          |

### 3.5.11 括号和运算符级别

**特性**

- 同一级别的运算符从左到右的次序进行计算
- 除了右结合运算符。例如`+=`

## 3.6 字符串

### 3.6.1 子串

提取子串

```java
String greeting = "Hello";
String s = greeting.substring(0,3); // "Hel"
```

### 3.6.2 拼接

允许使用 `+` 拼接两个字符串。

```java
String s1 = "Hello ";
String s2 = "world";
String msg = s1 + s2; // "Hellw world"
```

当将一个字符串与一个非字符串拼接时，后者会被转换成字符串。

使用分隔符拼接

```java
String all = String.join(" / ", "aa", 'bb'); // "aa / bb"
```

### 3.6.3 字符串不可变

修改字符串需要先提取再拼接

```java
String a = "hello";
greeting = greeting.substring(0,3) + 'n'; // "heln"
```

**特性**

- String类对象不可变

### 3.6.4 检测字符串是否相等

检测相等

```java
String a = "hello";
a.equals("hello world"); // false
```

检测相等，但不区分大小写

```java
String a = "hello";
boolean result = a.equalsIgnoreCase("Hello"); // true
```

### 3.6.5 字符串与 Null 值

检测字符串为空的方法

```java
if(str.length() == 0);
// 或
if(str.equals(""));
```

检测字符串是否为null

```java
if(str == null);
```

### 3.6.6 码点与代码单元

java字符串是一个char值序列，char数据类型是采用UTF-16编码鄙视Unicode码点的一个代码单元。

常用的Unicode自负可以采用一个代码单元表示，而辅助字符需要一对代码单元表示。

length方法将返回采用UTF-16编码表示给定字符串所需要的代码单元个数。

不推荐使用char类型，过于底层。

代码单元个数：

```java
String a = "Hello";
int n = a.length(); // 5
```

码点个数：

```java
String string = "😊";
int count = string.codePointCount(0,string.length());
System.out.println(count); // 1
System.out.println(string.length()); // 2
```

位置n的代码单元：

```java
String string = "A😊A";
char first = string.charAt(0); // A
System.out.println(first);
char second = string.charAt(1); // ?
System.out.println(second);
char third = string.charAt(2); // ?
System.out.println(third);
char fourth = string.charAt(3); // A
System.out.println(fourth);
```

位置n的码点：

```java
String string = "A😊A";
int index0 = string.offsetByCodePoints(0, 0);
System.out.println(index0); // 0
int cp0 = string.codePointAt(index0); // 65
System.out.println(cp0);

int index1 = string.offsetByCodePoints(0, 1);
System.out.println(index1); // 1
int cp1 = string.codePointAt(index1);
System.out.println(cp1); // 128522

int index2 = string.offsetByCodePoints(0, 2);
System.out.println(index2); // 3
int cp2 = string.codePointAt(index2);
System.out.println(cp2); // 65
```

依次查看每一个码点

```java
String string = "A😊A";
int[] codePoints = string.codePoints().toArray();
System.out.println(Arrays.toString(codePoints)); // [65, 128522, 65]
```

码点数组转字符串

```java
int[] codePoints = {65, 128522, 65};
String str = new String(codePoints,0, codePoints.length);
System.out.println(str); // A😊A
```

### 3.6.7 String API

常用API

### 3.6.8 阅读联机API文档

[Overview (Java Platform SE 8 ) (oracle.com)](https://docs.oracle.com/javase/8/docs/api/)

### 3.6.9 构建字符串

单线程使用 StringBuilder

多线程使用 StringBuffer

```java
StringBuilder builder = new StringBuilder();
builder.append('A');
builder.append("BBC");
String str = builder.toString();
System.out.println(str); // ABBC
```

### 3.6.10 文本块

**声明文本块**

> (JDK15支持)

```java
String str = """
    Hello
    World
    !
    """;
```

**特性**

- 以`"""`开头，后面跟一个`换行符`，并以另一个`""";`结尾。
- 行尾`\`会拼接下一行。
- 行结束符会被标准化为`\n`
- 自动去除公共缩进

## 3.7 输入与输出

### 3.7.1 读取输入

```java
Scanner scan = new Scanner(System.in);
String str = scan.nextLine();
int number = scan.nextInt();
```

### 3.7.2 格式化输出

遵循一定的语法。

```java
int age = 19;
String name = "AAA";
System.out.printf("Hello %s, Next year, you'll be %d", name, age); // Hello AAA, Next year, you'll be 19
```

### 3.7.3 文件输入与输出

文件输出

```java
Scanner in = new Scanner(Path.of("myFile.txt"), StandardCharsets.UTF_8);
```

文件输出

```java
PrintWriter out = new PrintWriter("myFile.txt", StandardCharsets.UTF_8);
```

**注意：**

- 生成的文件取决于虚拟机、shell运行所在的目录、ide控制。
- 推荐使用绝对路径名。
- 每个反斜线之前需要再加一个反斜线。

## 3.8 控制流程

### 3.8.1 块作用域

块确定了变量的作用域。

不能在嵌套的两个块中声明同名的变量。

### 3.8.2 条件语句

条件必须用小括号括起来。

```java
int a = 12;
int b = 13;
if (a > b) {
    System.out.println(a);
}
```

- else子语句与最邻近的if构成一组
- 推荐使用大括号让代码更加清晰。
- 可以反复使用if...else if ...语句

### 3.8.3 循环

while循环会在条件为true时执行下一个语句或者下一个块语句。

```java
while (balance < goal)
{
  balance += payment;
  double interest = balance * interstRate / 100;
  balance += interest;
  years++;
}
```

如果希望循环体至少执行一次，可以使用do while语句。

```java
do
{
  balance += payment;
  double interest = balance * interstRate / 100;
  balance += interest;
  years++;
} while (balance < goal)
```

### 3.8.4 确定性循环

for语句第一部分：计数器初始化。

for语句第二部分：每一轮循环前要检测的循环条件。

for语句第三部分：指定如何更新计数器。

```java
for (int i = 10; i > 0; i--)
{
  // ...
  i++;
}
```

- for语句第一部分声明的变量会扩展到这个for循环的末尾。
- for循环内部定义的变量只能在for循环体中使用。

### 3.8.5 多重选择：switch 语句

case标签可以是：

- 类型为char、byte、short、int的常量表达式。
- 枚举常量。
- 字符串字面量。
- 多个字符串，用逗号分隔。

特性：

- switch语句从选项值相匹配的case标签开始执行，直到遇到下一个break语句，或者执行到switch语句结束。
- 如果没有匹配的case标签，则会执行default子句（如果有的话）。
- 有直通行为的形式中，每个case以一个冒号 `:` 结束。
- 没有直通行为的形式中，每个case以一个箭头 `->` 结束。
- switch表达式中具有yield关键字，与break蕾丝，yield会终止执行，但是yield会生成一个值，就是表达式的值。

直通表达式：

```java
int day = 2;
switch (day) {
    case 1:
        System.out.println("Monday");
        // No break, so it falls through to the next case
    case 2:
        System.out.println("Tuesday");
        // No break, so it falls through to the next case
    case 3:
        System.out.println("Wednesday");
        break;
    default:
        System.out.println("Another day");
}
```

### 3.8.6 终端控制流程的语句

不带标签的break语句。退出当前循环。

```java
while (year <= 100)
{
  balance += payment;
  // ...
  if (balance >= goal) break;
}
```

带标签break语句。退出指定循环，包括嵌套的循环。

```java
outerLoop: // Define a label for the outer loop
for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 5; j++) {
        if (j == 3) {
            break outerLoop; // Terminates the outer loop when j is 3
        }
        System.out.println("i = " + i + ", j = " + j);
    }
}
```

continue语句会越过当前循环体的剩余部分，直接跳到循环的首部。

```java
public class ContinueExample {
    public static void main(String[] args) {
        // 使用循环输出 1 到 5 的数字，但跳过数字 3
        for (int i = 1; i <= 5; i++) {
            if (i == 3) {
                // 当 i 等于 3 时，跳过当前迭代，继续下一次迭代
                continue;
            }
            System.out.println(i);
        }
    }
}
```

## 3.9 大数

构造整数：

```java
// 转换为大数
BigInteger a = BigInteger.valueOf(100);
```

```java
// 更长的数构造为大数
BigInteger a = new BigInteger("2020200202020202020202002020202020");
```

构造浮点数：

```java
BigDecimal a = new BigDecimal("0.1");
```

- 对于BigDecimal类，总是应当使用一个字符串参数来进行构造。
- 不能使用算数运算符去计算，而需要使用提供的方法。

 
