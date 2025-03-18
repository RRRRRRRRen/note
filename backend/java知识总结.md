# 注释

> Java 中的注释（Comments）是对代码的说明或解释，不会被编译器编译，主要是为了**提高代码可读性、便于维护与协作开发**。

## 一、Java 中的三种注释类型

| **类型** | **写法**      | **用途与特点**                             | **快捷键**                 |
| -------- | ------------- | ------------------------------------------ | -------------------------- |
| 单行注释 | //            | 用于对某一行代码进行简单说明               | Command + /（Mac）         |
| 多行注释 | /\* ... \*/   | 用于大段说明、临时注释掉多行代码等         | Command + Shift + /（Mac） |
| 文档注释 | /\*\* ... \*/ | 用于自动生成 API 文档（配合 javadoc 使用） | IDEA 输入 /\*\* 自动补全   |

### 1. 单行注释

```java
int age = 18; // 定义年龄变量
```

- 用于简洁地注释一行代码

### 2. 多行注释

```java
/*
  以下是用户信息变量定义
  包括姓名、年龄、邮箱等
*/
String name = "张三";
int age = 20;
```

- 用于注释多行内容
- 可用于暂时屏蔽代码块

### 3. 文档注释

```java
/**
 * 这是一个用户类
 * @author Zhang
 * @version 1.0
 */
public class User {
  /**
   * 获取用户名
   * @return name 用户名
   */
  public String getName() {
    return name;
  }
}
```

**特性**

- 专用于类、方法、字段的注释

- 可以通过 javadoc 命令生成 HTML 格式的说明文档

## 二、文档注释实践

> javadoc 是 Java 官方提供的工具，可以根据你写的 **文档注释** 自动生成 **HTML 格式的 API 说明文档**，非常适合写 SDK、组件、接口说明书等。

### 1. 文档注释注意事项

- `javadoc` 命令只能为 public 和 protected 修饰的字段、方法和类生成文档。
- 文档注释只能用于**类**、**接口**、**方法**、**字段（属性）**
- 文档注释中可以嵌入一些 HTML 标记，比如说段落标记 `<p>`，超链接标记 `<a></a>` 等等，但不要使用标题标记，比如说 `<h1>`，因为 javadoc 会插入自己的标题，容易发生冲突。
- 文档注释中可以插入一些 `@` 注解，比如说 `@see` 引用其他类，`@version` 版本号，`@param` 参数标识符，`@author` 作者标识符，`@deprecated` 已废弃标识符，等等。

**示例代码：**

```java
/**
 * 用户类，表示系统中的注册用户
 * @author YourName
 * @version 1.0
 */
public class User {

  /**
   * 用户名，唯一标识
   */
  private String username;

  /**
   * 年龄，单位：岁
   */
  private int age;

  /**
   * 获取用户名
   * @return 用户名字符串
   */
  public String getUsername() {
    return username;
  }

  /**
   * 设置用户名
   * @param username 用户名
   */
  public void setUsername(String username) {
    this.username = username;
  }
}
```

### 2. 如何生成文档

**方法一：用命令行**

1.  打开终端（命令行）

2.  定位到 .java 文件所在目录

3.  执行命令：

```
javadoc -d ./docs User.java
```

• -d ./docs 表示输出到 docs 目录

• User.java 是你的 Java 源文件

4. 执行后会生成一堆 .html 文件，用浏览器打开 index.html 即可看到文档

**方法二：在 IDEA 中自动生成（推荐）**

1.  Tools ➜ Generate JavaDoc

2.  选择输出目录（Output Directory）

3.  配置选项（一般保持默认即可）

4.  点击 OK，就会生成 HTML 文档

### 3. 文档注释常用标签

| **标签**    | **作用说明**                 |
| ----------- | ---------------------------- |
| @param      | 方法参数说明                 |
| @return     | 方法返回值说明               |
| @throws     | 方法可能抛出的异常           |
| @author     | 作者名                       |
| @version    | 版本号                       |
| @see        | 引用相关类或方法             |
| @deprecated | 标记过时的方法，会有警告     |
| @since      | 指出自哪个版本开始有这个功能 |
| @link       | 内联链接引用                 |

### 4. 文档注释约定

- **类、字段、方法必须使用文档注释**，不能使用单行注释和多行注释。因为注释文档在 IDE 编辑窗口中可以悬浮提示，提高编码效率。
- **所有的抽象方法和接口必须要用文档注释**，除了返回值、参数、 异常说明外，还必须指出该方法做什么事情，实现什么功能。
- **所有的类都必须添加创建者和创建日期**。
- **所有的枚举类型字段必须要用文档注释**，说明每个数据项的用途。
- 代码修改的同时，注释也要进行相应的修改。

# 数据类型

## 一、基本数据类型

### 1. 整型

> 用于表示没有小数部分的数，可以是负数。java 提供了 4 种整型：`byte` / `short` / `int` / `long`

| 类型  | 占用空间      | 表数范围                   | 默认值 |
| ----- | ------------- | -------------------------- | ------ |
| byte  | 1 Byte = 8bit | -2^7 ~ 2^7-1（-128 ~ 127） | 0      |
| short | 2 Byte        | -2^15 ~ 2^15-1             | 0      |
| int   | 4 Byte        | -2^31 ~ 2^31-1             | 0      |
| long  | 8 Byte        | -2^63 ~ 2^63-1             | 0L     |

**注意**

- long 末尾要加 L，如：10000L

**各进制表示法**

- 十六进制：前缀`0x`或`0X`，例如`0xCAEF12`

- 八进制：前缀`0`，例如`010`

- 二进制：前缀`0b`或者`0B`，例如`0b1001`

**数字可视化表示**

使用下划线`_`方便阅读，java 编译器会忽略下划线，例如：`1_000_000`、`0b1111_0110_0010`

### 2. 浮点类型

> 用于表示有小数部分的数值。java 提供了 2 种浮点类型：`float`、`double`

| 类型   | 占用空间 | 表数范围               | 默认值 |
| ------ | -------- | ---------------------- | ------ |
| float  | 4 Byte   | -3.403E38 ~ 3.403E38   | 0.0f   |
| double | 8 Byte   | -1.798E308 ~ 1.798E308 | 0.0d   |

**注意**

- **float** 赋值需要后缀` F` / `f`。例如：`float x = 123.23F;`
- **double** 默认不带后缀，也可选的增加后缀 `D`/`d`。例如：`double x = 123.233D;`

**表示溢出和出错的浮点数**

- 正无穷：`Double.POSITIVE_INFINITY`
- 负无穷：`Double.NEGATIVE_INFINITY`
- 非数字：`Double.NaN`
  - 所有`NaN`都是不同的。
  - 可以使用`Double.isNaN()`判断。

### 3. 字符类型

> char 类型用于表示单个字符。java 提供了 1 种字符类型：`char`

| 类型 | 占用空间 | 默认值 |
| ---- | -------- | ------ |
| char | 2 Byte   | \u0000 |

**特殊字符转移序列**

| 转义序列 | 名称   | 英文       |
| :------- | ------ | ---------- |
| `\b`     | 退格   | back       |
| `\t`     | 制表   | tabulation |
| `\n`     | 换行   | newline    |
| `\r`     | 回车   | return     |
| `\f`     | 换页   | form feed  |
| `\"`     | 双引号 |            |
| `\'`     | 单引号 |            |
| `\\`     | 反斜杠 |            |
| `\s`     | 空格   | space      |

**注意**

- char 类型的字面量都需要使用单引号括起来。`''`
- char 类型可以表示为十六进制的值。\u0000 ~ \uFFFF
- 可以在加引号的字符、双引号的字符串中使用转义序列。
- 转义序列\u 可以在任意位置使用，包括注释。其他转义序列不可以。
- Unicode 转义序列会在解析代码之前执行。
- 强烈不建议在程序中使用 char 类型。

### 4. 布尔类型

> boolean 类型用于判定逻辑条件。
>
> java 提供了 1 种布尔类型：boolean，且只有两个值：`true`、`false`

**注意**

整型值和布尔值不能相互转换。

```java
if(0); // 编译直接报错：int类型无法转换为boolean类型
```

## 二、引用数据类型

> 引用类型是 **对象的引用（地址）**，不是实际的值

| **类型**           | **说明**                   | **示例**                   |
| ------------------ | -------------------------- | -------------------------- |
| 类（Class）        | 你定义的类或 Java 内置的类 | String name = "Tom";       |
| 接口（Interface）  | 变量可以是接口类型的引用   | Runnable r = new Thread(); |
| 数组（Array）      | 所有数组都是对象           | int[] arr = new int[3];    |
| 枚举（Enum）       | 枚举值                     | Day day = Day.MONDAY;      |
| 注解（Annotation） | 元数据标签                 | @Override 等               |

## 三、部分转义符详解

### 1. 转义符详解

**\b（退格 Backspace）**:

- 字母 b 来源于 “back”（向后），表示移动光标到当前字符的左边并覆盖原来的字符。最早的键盘设计中，退格键用于将光标移到字符的前一个位置。

**\t（制表 Tab）**:

- 字母 t 来源于 “tabulation”（制表），表示跳到下一个制表符的位置，通常用于对齐文本。制表符是传统打印机和打字机中的标准功能，用来帮助格式化文本的排版。

**\n（换行 Newline）**:

- 字母 n 来自于 “newline”（新行），表示光标移动到下一行的起始位置。这是一个常见的控制字符，用于文本的行分隔，尤其在 Unix 和类 Unix 系统中，换行符作为行尾标志。

**\r（回车 Carriage Return）**:

- 字母 r 来源于 “return”（回车），表示将光标移动到当前行的开头。这一符号源于早期的打字机和打印机中，回车动作是将打印头返回到当前行的最左边。

**\f（换页 Form Feed）**:
由于换页符（\f）的行为取决于终端或控制台的设置，它通常会导致输出跳到下一页面。在普通的命令行或终端中可能看不到明显的效果，但如果输出到某些支持换页的环境（如打印机模拟器或某些高级编辑器），Page 1 和 Page 2 会出现在不同的“页面”上。

```java
public class ControlCharactersDemo {
    public static void main(String[] args) {
        // 退格（\b）
        System.out.println("Hello\bWorld");  // 会退格到 "Hello" 后，覆盖 "o"，显示 "HellWorld"

        // 换行（\n）
        System.out.println("Line 1\nLine 2");  // 会换行输出 "Line 2" 到下一行

        // 制表（\t）
        System.out.println("Column1\tColumn2");  // 会在 "Column1" 和 "Column2" 之间插入一个制表符（水平跳动）

        // 回车（\r）
        System.out.println("Hello\rWorld");  // 会回到行首，覆盖 "Hello" 变成 "World"："Worldo"

        // 换页（\f）
        System.out.println("Page 1\fPage 2");  // 输出 "Page 1"，然后会插入一个换页符，跳到下一页，显示 "Page 2"
    }
}
```

### 2. 换行和回车的区别

> 在 Java 中，**回车 (\r)** 和 **换行 (\n)** 是两个不同的控制字符，它们有不同的作用，主要用于控制文本的布局和光标的位置。

**(1)回车 (\r):**

• **回车**是指将光标移到当前行的最开始位置，通常用来覆盖当前行的内容。

• 在传统的打字机和早期的打印机中，回车意味着将打印头回到行的起始位置。

• 在 Java 中，'\r' 会让光标回到当前行的起始位置，但并不会移动到下一行。

**(2)换行 (\n):**

• **换行**是指将光标移动到下一行的起始位置。

• 在 Unix 和 Linux 系统中，换行符用于标识行的结束。

• 在 Java 中，'\n' 会使光标跳到下一行的开始位置。

**区别:**

• **回车 (\r)**：将光标移到当前行的开头，不会换行。

• **换行 (\n)**：将光标移到下一行的开始位置。

**常见组合:**

在不同操作系统中，回车和换行有不同的组合方式来表示行结束：

• **Unix/Linux** 和现代的 macOS 系统使用 **\n** 作为换行符。

• **Windows** 系统使用 **\r\n** 作为行结束符。

• **老式的 Mac 系统（Mac OS 9 及以前）** 使用 **\r** 作为换行符。

## 四、char 类型注意事项

### 1. 赋值方式

| **方式**            | **示例**              | **说明**                                            |
| ------------------- | --------------------- | --------------------------------------------------- |
| 1. 字符字面量       | `char c = 'A';`       | 最常见，直接写一个字符，必须用 **单引号** '         |
| 2. Unicode 转义符   | `char c = '\u4E2D';`  | 用 Unicode 十六进制码点赋值（这里是 “中”）          |
| 3. 整数（十进制）   | `char c = 65;`        | 直接赋一个整数，代表对应的 Unicode 字符（65 = ‘A’） |
| 4. 整数（十六进制） | `char c = 0x41;`      | 十六进制方式赋值（0x41 = 65 = ‘A’）                 |
| 5. 强制类型转换     | `char c = (char) 97;` | 将一个整数强转为 char（97 = ‘a’）                   |
| 6. 表达式运算结果   | `char c = 'A' + 1;`   | 表达式结果是 char 类型（‘A’ + 1 = ‘B’）             |

```java
public class CharAssignments {
    public static void main(String[] args) {
        char a = 'A';               // 字符
        char b = '\u4E2D';          // Unicode：中
        char c = 65;                // 整数表示 A
        char d = 0x41;              // 十六进制表示 A
        char e = (char) 97;         // 强制类型转换，97 = 'a'
        char f = 'A' + 1;           // 表达式结果 = 'B'

        System.out.println("a = " + a);  // a = A
        System.out.println("b = " + b);  // b = 中
        System.out.println("c = " + c);  // c = A
        System.out.println("d = " + d);  // d = A
        System.out.println("e = " + e);  // e = a
        System.out.println("f = " + f);  // f = B
    }
}
```

### 2. 容量特征

char 类型的字面量范围是从 '\u0000' 到 '\uffff'，对应 Unicode 编码的前 65536 个字符。对于超出这个范围的字符（例如一些扩展 Unicode 字符），Java 会使用两个 char 来表示（称为 **代理对**）。

```java
public class CharBeyond65535 {
    public static void main(String[] args) {
        // 😀 的 Unicode 是 U+1F600，十进制是 128512
        String emoji = "😀";

        System.out.println("字符： " + emoji);
        System.out.println("长度： " + emoji.length());  // 2 个 char，因为是代理对

        // 查看每个 char 的值
        char high = emoji.charAt(0);  // 高代理
        char low = emoji.charAt(1);   // 低代理

        System.out.printf("高位代理: 0x%04X\n", (int) high);  // D83D
        System.out.printf("低位代理: 0x%04X\n", (int) low);   // DE00

        // 正确获取 Unicode 码点
        int codePoint = emoji.codePointAt(0);
        System.out.println("完整码点（十进制）: " + codePoint);       // 128512
        System.out.printf("完整码点（十六进制）: U+%04X\n", codePoint); // U+1F600
    }
}
```

## 五、包装类与装箱

### 1. 什么是包装类

> Java 的 **包装类** 是为 8 种基本类型提供的 **对象封装版本**，让它们也能像对象一样使用。

- 包装类属于 Java 中的 **引用类型**，位于 java.lang 包下。

| **基本类型** | **包装类** |
| ------------ | ---------- |
| byte         | Byte       |
| short        | Short      |
| int          | Integer    |
| long         | Long       |
| float        | Float      |
| double       | Double     |
| char         | Character  |
| boolean      | Boolean    |

### 2. 为什么需要包装类

- **集合类只能存对象**（如 ArrayList，不能放 int，只能放 Integer）

- **使用类的方法和属性**（比如 Integer.parseInt()）

- **在泛型中使用**（基本类型不能作为泛型参数）

- **可以为 null**（基本类型不能为 null）

### 3. 装箱与拆箱

**装箱**

> 把 基本类型 ➜ 包装类对象

```java
int a = 10;
Integer obj = a;  // 自动装箱：int ➜ Integer
// 相当于手动写：
Integer obj = Integer.valueOf(a);
```

**拆箱**

> 把 包装类对象 ➜ 基本类型

```java
Integer obj = 20;
int b = obj;  // 自动拆箱：Integer ➜ int
// 等价于：
int b = obj.intValue();
```

**实际应用场景**

```java
List<Integer> nums = new ArrayList<>();
nums.add(1);      // 自动装箱
nums.add(2);
int x = nums.get(0); // 自动拆箱
```

### 4. 装箱和拆箱中可能出现的问题

**拆箱必须保证包装类不为 null**

- 拆箱时遇到 null ➜ 报空指针异常！

```
Integer a = null;
int b = a; // ❌ 运行时报 NullPointerException
```

**包装类比较陷阱**

- Java 对于 -128 ~ 127 范围内的整数做了缓存（IntegerCache），超出范围就不一定相等了。
- 包装类比较要用 `.equals()`，不要用 `==`！

```java
Integer a = 100;
Integer b = 100;
System.out.println(a == b); // ✅ true：因为缓存池

Integer x = 1000;
Integer y = 1000;
System.out.println(x == y); // ❌ false：不在缓存范围内
```

## 六、基本数据类型缓存池

> 在 Java 中，**基本数据类型的缓存池（也叫常量池、装箱缓存）** 是 JVM 的一项性能优化机制，主要针对包装类对象的频繁创建和比较。

### 1. 缓存池

> Java 为了避免频繁创建包装类对象，在一定范围内会复用这些对象，这块被称为「缓存池」。

### 2. 缓存池适用范围

| **包装类** | **缓存范围** | **是否可配置**     |
| ---------- | ------------ | ------------------ |
| Boolean    | true/false   | 固定               |
| Byte       | -128 ~ 127   | 固定               |
| Short      | -128 ~ 127   | 固定               |
| Integer    | -128 ~ 127   | ✅ 可配置 JVM 参数 |
| Long       | -128 ~ 127   | 固定               |
| Character  | 0 ~ 127      | 固定               |
| Float      | ❌ 无缓存    | 不支持             |
| Double     | ❌ 无缓存    | 不支持             |

**配置缓存范围**

- 可以通过 JVM 参数将 Integer 缓存范围扩大到 -128 ~ 255，但不能改下限。

### 3. Integer 缓存池机制详解

**示例**

```java
Integer a = 100;
Integer b = 100;
System.out.println(a == b); // ✅ true，使用缓存对象

Integer x = 200;
Integer y = 200;
System.out.println(x == y); // ❌ false，超出缓存范围，创建新对象
```

**原理**

- 自动装箱时自动调用 valueOf()

```java
Integer a = 127;  // 自动装箱，使用缓存池
// 等价于
Integer b = Integer.valueOf(127); // 显式调用
```

- 简化源码释义：当不在-128 ~ 127 范围时，再新建对象

```java
public static Integer valueOf(int i) {
  if (i >= -128 && i <= 127) {
    return IntegerCache.cache[i + 128]; // 缓存对象
  }
  return new Integer(i); // 创建新对象
}
```

### 4.比较方法

**用 .equals() 比较值，避免缓存池陷阱：**

```
Integer a = 200;
Integer b = 200;
System.out.println(a.equals(b)); // ✅ true
System.out.println(a == b);      // ❌ false
```

# 数据类型转换

## 一、自动类型转换

> Java 中的 **自动类型转换**（也叫 **隐式类型转换 / widening conversion**），这是 Java 的一个非常基础但非常关键的知识点。搞懂它可以帮你避免很多隐藏的 Bug。

### 1. 自动转换的适用条件

- 两种类型 **兼容**（比如数值类型之间）

- 目标类型的 **表示范围更大**（不会丢精度）

### 2. 自动动类型转换规则

- 如果任一操作数是 double 类型，其他操作数将被转换为 double 类型。
- 否则，如果任一操作数是 float 类型，其他操作数将被转换为 float 类型。
- 否则，如果任一操作数是 long 类型，其他操作数将被转换为 long 类型。
- 否则，所有操作数将被转换为 int 类型。

### 3. 转换顺序

```text
byte → short → int → long → float → double
                ↑
          char（char → int）
```

```java
int a = 100;
long b = a;        // ✅ int → long，自动类型转换

float f = b;       // ✅ long → float，自动类型转换

double d = f;      // ✅ float → double，自动转换

char c = 65;
int x = c;         // ✅ char → int（输出 x 为 65）

byte b1 = 10;
short s = b1;      // ✅ byte → short
```

## 二、强制类型转换

> 强制类型转换（**explicit type casting** 或 **narrowing conversion**）是指 **显式地将某个类型转换为另一种类型**，通常是在较大类型转换为较小类型时使用。与自动类型转换不同，强制类型转换需要开发者显式地告诉编译器你想要进行这种转换。

### 1. 概念

> **强制类型转换** 是指把一个数据类型转换为另一个数据类型，特别是将一个**大范围的类型转换为小范围的类型**时，编译器需要你手动进行转换，因为转换可能会丢失数据（比如精度丢失）。为了避免编译器自动进行这类转换，Java 强制要求你明确指定转换，确保你意识到可能出现的问题。

**语法：**

```
targetType variable = (targetType) expression;
```

- targetType 是目标类型，即你想转换成的类型。

- expression 是被转换的变量或值。

### 2. 转换规则

**从大类型转换为小类型（会丢失数据）**

- 当你从较大的数据类型转换为较小的数据类型时，编译器不会自动进行转换，因为这样可能会丢失数据。**例如**，从 long 转换为 int、从 double 转换为 int，这些都可能丢失数据。

- 需要你手动强制转换，且**必须确保目标类型的范围能够容纳原值**，否则会发生溢出或数据丢失。

```java
long l = 100000L;
int i = (int) l; // 强制转换，可能丢失数据
System.out.println(i); // 输出：100000

double d = 9.99;
int j = (int) d; // 强制转换，丢失小数部分
System.out.println(j); // 输出：9
```

**从浮点数类型转换为整数类型**

- 从 float 或 double 转为 int 类型时，会丢失小数部分。Java 不允许自动转换，必须显式强制转换。

```java
double f = 3.14;
int g = (int) f; // 强制转换，丢失小数部分
System.out.println(g); // 输出：3
```

**从 char 到数字类型的转换**

- char 类型可以直接转换为 int 类型，因为 char 实际上是一个 16 位的无符号整数，int 可以容纳所有 char 的值。

```java
char c = 'A'; // 'A' 的 ASCII 值是 65
int x = (int) c; // char 转 int，得到 65
System.out.println(x); // 输出：65
```

### 3. 强制类型转换的风险

**数据丢失**：

- 当转换的值超出了目标类型的表示范围时，转换结果就会发生溢出。

- 例如，int 转 byte 时，超出了 byte 范围的值会变为负数，甚至完全丢失。

**类型不兼容**：

- 强制转换不当会导致 ClassCastException 错误。例如，错误地将一个对象转换为错误的类型。

```java
Object obj = new Integer(100);
String str = (String) obj; // ❌ 运行时错误：ClassCastException
```

**精度丢失**：

- 当从 double 或 float 转换到 int 类型时，所有小数部分都会丢失。

## 三、常量表达式自动类型转换

> Java 编译器会**在编译阶段**对常量表达式做类型检查与自动转换。

### 1. 概念

**常量表达式**：是指在编译时可以被完全计算出来的表达式。常见的例子有字面量、常量变量、常量运算等。它们的值在编译时就能确定。

```java
50   // 这是一个字面量常量
10 + 20  // 常量表达式，编译时计算为 30
```

### 2. 转换规则

1.  **常量表达式的结果类型** 会根据表达式中最宽的操作数类型来决定。例如，如果你进行加法 50 + 10，那么结果就是 int 类型，因为 50 和 10 都是 int 类型。

2.  **如果常量表达式的结果在目标类型范围内**（如 byte 范围是 -128 到 127），编译器允许自动将结果转换为目标类型。如果超出了范围，则会报错。

---

### 3. 示例

**简单字面量常量（byte）**

```
byte a = 50; // ✅ 合法，50 在 byte 范围内 (-128 ~ 127)
```

- 50 是一个字面量常量，Java 编译器知道它是 int 类型，但因为值在 byte 的范围内（-128 ~ 127），所以会自动转换为 byte 类型。

**常量运算的结果（int）**

```
byte b = 50 + 30; // ✅ 合法，50 + 30 是常量表达式，结果为 80，自动转为 byte
```

- 50 和 30 都是 int，所以 50 + 30 的结果是 int 类型。

- Java 会检查常量表达式 50 + 30 的结果（80）是否在 byte 范围内，如果在，则允许转换。

**超出范围的常量（byte）**

```
byte c = 128; // ❌ 编译错误，128 超出了 byte 范围
```

- 这里，128 是一个字面量常量，它是 int 类型，超出了 byte 的范围，因此无法自动转换。

**char 类型常量**

```
char e = 'A' + 1; // ✅ 合法，'A' 是 65，'A' + 1 结果为 66，自动转换为 char
```

- 这里 'A' 是 char 类型，但是在加法操作中，它会先被提升为 int，然后得到 66，这个值在 char 范围内，因此可以直接赋值给 char。

**long 和 float 类型常量**

```
long f = 50L + 100L; // ✅ 合法，50L + 100L 结果是 long 类型
```

- 50L 和 100L 是 long 类型，所以它们相加的结果是 long 类型，可以直接赋值给 long。

```
float g = 10.5f + 2.5f; // ✅ 合法，常量表达式 10.5f + 2.5f 的结果是 float
```

- 10.5f 和 2.5f 是 float 类型，所以它们的结果也是 float，可以直接赋值给 float。

## 四、复合赋值运算符的自动转换

**复合赋值运算符（如 \*=、+=、-=) 在 Java 中会自动进行隐式强制转换。**

```java
byte b = 50;
b *= 2; // ✅ 不报错，编译通过
// 等价于
b = (byte)(b * 2); // ✅ 强制类型转换
```

# 运算符

# 流程控制

# 数组

# 字符串
