# Java 核心语法速查

*类型：knowledge ｜ 难度：入门 ｜ 标签：Java、语法速查*

**面向已会编程者的 Java 语法速查：程序以类为基本单位，变量必须显式初始化；内容比较用 equals 而非 ==；类型转换要警惕复合赋值的隐式强转与常量表达式的编译期转换；switch 箭头形式无直通；数组引用赋值不拷贝、真正拷贝用 Arrays.copyOf；频繁拼接字符串用 StringBuilder；大数只能用方法运算而不能用算术运算符。**

## 程序结构与编译运行

最简程序，源文件名必须与公共类同名并以 `.java` 结尾：

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

编译与运行：

```bash
javac Hello.java   # 编译，生成 Hello.class
java Hello         # 运行，JVM 从 main 方法开始执行
```

基本规则：

- Java 区分大小写，每个语句以分号 `;` 结束，方法体以 `{` 开始、`}` 结束
- 一个源文件只能有一个公共类，文件名与公共类名完全一致；类名大写字母开头，多单词用大驼峰
- JVM 总是从指定类的 `main` 方法开始执行，每个应用程序必须有一个 main
- 命令行参数按顺序传入 `args`，程序名不在其中：`java Message -g world` 中 `args[0]` 是 `-g`

## 类型系统

8 种基本类型（4 整型、2 浮点、char、boolean），其余皆为引用类型：

| 类型 | 空间 | 范围 / 说明 | 默认值 |
| --- | --- | --- | --- |
| byte | 1B | -128 ~ 127 | 0 |
| short | 2B | -2^15 ~ 2^15-1 | 0 |
| int | 4B | -2^31 ~ 2^31-1 | 0 |
| long | 8B | 字面量需后缀 `L` | 0L |
| float | 4B | 字面量需后缀 `F` / `f` | 0.0f |
| double | 8B | 不带后缀的浮点字面量默认 double | 0.0d |
| char | 2B | 单引号，UTF-16 代码单元 | '\u0000' |
| boolean | - | 只有 true / false，不能与整数互转 | false |

```java
0xCAFE       // 十六进制；八进制前缀 0、二进制前缀 0b
1_000_000    // 下划线分隔便于阅读，编译器忽略
Double.NaN   // 非数字；所有 NaN 互不相等，判断要用 Double.isNaN(x)
```

- 引用类型（类、接口、数组、枚举、注解）保存对象的引用而非值本身，可以为 null
- 枚举把变量取值限定在一组命名常量内：`enum Size { SMALL, MEDIUM };`
- 局部变量可用 `var` 由右值推断类型（Java 10+，仅限局部变量，不能用于字段与参数）

## 变量与常量

- 变量先声明类型再声明名字，必须显式初始化后才能使用，否则编译报错
- 常量用 `final` 修饰，只能赋值一次，习惯全大写；类常量加 `static final`，属于类而不属于单个对象：

```java
public static final double CM_PER_INCH = 2.54;
```

## 运算符

| 运算符 | 注意 |
| --- | --- |
| `+` `-` `*` | 加、减、乘 |
| `/` | 两个操作数都是整数才做整数除法；浮点除法可除 0，整数除法不可 |
| `%` | 取余，`7 % 5` 结果为 2 |
| `++` `--` | 前缀先运算后取值，后缀先取值后运算 |
| `+` | 字符串连接，非字符串操作数自动转字符串 |
| `<<` `>>` `>>>` | 左移、右移（符号位跟随）、无符号右移（高位补 0） |
| `&` `^` `~` | 与、异或、取反；`&` `|` 用于布尔值时不短路 |

- `&&`、`||` 按短路方式求值；条件运算符 `x < y ? x : y` 的条件必须为 boolean 类型
- 数学函数：`Math.sqrt(x)`、`Math.pow(x, 2)`；`import static java.lang.Math.*;` 后可省略前缀
- Math 用浮点运算，不同平台结果可能不同，需要跨平台确定值用 `StrictMath`
- 整数运算溢出不报错，可用 `Math.addExact` 等方法捕获溢出错误
- 同一级别运算符从左到右计算，例外是右结合运算符如 `+=`；不确定时用括号

## 类型转换的易错点

自动类型转换：小范围与大范围运算时自动转为大范围（容量指数据范围而非内存占用）：

```text
byte → short → int → long → float → double
                ↑
          char（char → int）
```

二元运算提升规则：有 double 按 double，否则有 float 按 float，否则有 long 按 long，否则一律按 int：

```java
long x = 123;             // 自动提升：int → long
long y = 123123123123123; // 编译报错：字面量超出 int 范围，需加 L
float f = 12.3;           // 编译报错：double 字面量不能自动转 float，需 12.3F

byte b = 10;
int r = b + 1;            // byte 与整数运算，结果必须用 int 接收
double d = b + 12.3;      // 与浮点常量运算，结果必须用 double 接收
```

复合赋值的隐式强转：`op=` 等价于「先运算、再做一次强制转换」，所以能编译通过：

```java
byte b = 50;
b *= 2; // 编译通过，等价于 b = (byte)(b * 2)
```

常量表达式的编译期转换：结果在编译期计算，落在目标类型范围内时允许直接赋值：

```java
byte a = 50;       // 合法：50 在 byte 范围内
byte b2 = 50 + 30; // 合法：常量表达式结果 80 在 byte 范围内
byte c = 128;      // 编译错误：128 超出 byte 范围
char e = 'A' + 1;  // 合法：结果 66 在 char 范围内
```

强制转换：`(targetType) expression`，用于大范围转小范围：

```java
double x = 12.9;
int y = (int) x;                  // 12：截断小数部分，不是四舍五入
int nx = (int) Math.round(9.993); // 需要舍入用 Math.round，它返回 long
```

风险：

- 值超出目标类型范围时溢出（如 int 转 byte 变为意外负数）
- 浮点转整数丢失全部小数部分
- 对象强转类型不兼容抛 ClassCastException

## 控制流程

- 块（一对大括号）确定变量的作用域，嵌套的两个块中不能声明同名变量
- 条件必须用小括号括起，推荐始终使用大括号；else 子句与最邻近的 if 配对
- while 先判断后执行；do while 先执行一次再判断，循环体至少执行一次
- for 三部分：计数器初始化、每轮前检测的条件、更新计数器；第一部分声明的变量作用域只延伸到循环末尾

switch 的 case 标签可以是 char、byte、short、int 的常量表达式、枚举常量、字符串字面量。

直通（fall through）形式：case 以冒号 `:` 结束，从匹配项一直执行到 break 或 switch 结束：

```java
switch (day) {
    case 1:
        System.out.println("Monday"); // 没有 break，直通到下一个 case
    case 2:
        System.out.println("Tuesday");
        break;
    default:
        System.out.println("Another day");
}
```

无直通与表达式形式：case 以箭头 `->` 结束只执行匹配分支；switch 可作为表达式生成值，块形式用 `yield` 终止并给出值：

```java
String season = switch (x) {
    case 0 -> "A";
    case 1, 2 -> "B";
    default -> {
        yield "C";
    }
};
```

- 没有匹配的 case 时执行 default 子句（如果有）
- 整数或 String 操作数的 switch 表达式必须有 default，因为表达式必须生成一个值
- 枚举 switch 无需写枚举名，default 非必须

break 退出当前循环；带标签的 break 可跳出多层嵌套；continue 越过本轮剩余部分：

```java
outerLoop: // 标签定义在外层循环之前
for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 5; j++) {
        if (j == 3) break outerLoop; // 直接终止外层循环
        if (i == j) continue;        // 跳过本轮剩余语句，进入下一轮
    }
}
```

## 数组

声明与初始化，长度在创建后固定不可变：

```java
int[] a = new int[100];
var b = new int[100];
int[] c = {1, 2, 3, 4}; // 字面量初始化，此时不能写长度
```

- 允许长度为 0 的数组 `new int[0]`，与 null 不同
- 元素默认值：数字 0、布尔 false、对象 null
- 合法下标 0 ~ length-1，越界访问直接抛数组索引越界异常

for each 遍历的是元素本身而不是下标；需要下标或要修改元素时仍用传统 for：

```java
for (int item : array) {
    System.out.println(item);
}
```

拷贝：直接赋值只是两个引用指向同一数组；`Arrays.copyOf` 才是真正拷贝，第二个参数是新长度，可用于截断与扩展：

```java
int[] ref = array;                               // 同一数组，array == ref 为 true
int[] copy = Arrays.copyOf(array, array.length); // 完整拷贝
int[] longer = Arrays.copyOf(array, 10);         // 扩展，补 0
```

排序与打印：

```java
Arrays.sort(array);                              // 优化的快速排序
System.out.println(Arrays.toString(array));
System.out.println(Arrays.deepToString(matrix)); // 二维数组用 deepToString
```

多维数组本质是「数组的数组」，每行长度可以不同，可单独 `new` 每一行：

```java
int[][] matrix = {
    {1, 2, 3},
    {1, 2, 3, 4}, // 不规则数组
};
// 访问单个元素用 a[1][2]，其中 a[i] 本身就是一维数组引用
```

## 字符串与 StringBuilder

子串与拼接：

```java
String s = greeting.substring(0, 3);        // "Hel"，区间前含后不含
String msg = "Hello " + "world";            // + 拼接，非字符串自动转字符串
String all = String.join(" / ", "a", "b");  // "a / b"，分隔符拼接
```

不可变性：

- String 对象不可变，修改字符串实际是提取再拼接生成新对象
- 优点：编译器可让字符串共享，也保证 hashCode 的稳定性

内容比较必须用 equals；== 比较的是引用位置，字符串可能共享，结果不可靠：

```java
a.equals("hello");           // true
a.equalsIgnoreCase("Hello"); // true，不区分大小写
```

空串与 null 是两件事，通常一起判断：

```java
if (str != null && str.length() != 0) { }
```

码点与代码单元：字符串按 UTF-16 编码，常用字符占 1 个代码单元，辅助字符（如 emoji）占 2 个（代理对）：

```java
String s = "😊";
s.length();                      // 2：代码单元数
s.codePointCount(0, s.length()); // 1：码点数
```

- `charAt` 按代码单元访问，代理对会被拆开得到无意义的 char
- 按码点访问：`offsetByCodePoints` 先求码点下标，再 `codePointAt` 取码点值；或 `codePoints().toArray()` 遍历全部码点

频繁拼接用 StringBuilder（单线程；多线程用 StringBuffer），避免产生大量中间对象：

```java
StringBuilder builder = new StringBuilder();
builder.append('A').append("BBC");
String str = builder.toString(); // "ABBC"
```

文本块（JDK 15+）：以 `"""` 开头后跟换行符、以 `"""` 结尾，自动去除公共缩进，行尾 `\` 拼接下一行，行结束符标准化为 `\n`：

```java
String block = """
    Hello
    World
    """;
```

## 输入与输出

读取输入用 Scanner 包装 System.in，每个读取方法都阻塞等待用户输入：

```java
Scanner scan = new Scanner(System.in);
String line = scan.nextLine(); // 读一行字符串
int number = scan.nextInt();   // 读一个整数
```

格式化输出 printf，占位符按顺序对应参数：

```java
System.out.printf("Hello %s, age %d", name, age);
// %s 字符串、%d 整数、%f 浮点，可加宽度与精度如 %8.2f
```

文件输入显式指定字符集，文件输出用 PrintWriter：

```java
Scanner in = new Scanner(Path.of("myFile.txt"), StandardCharsets.UTF_8);
PrintWriter out = new PrintWriter("myFile.txt", StandardCharsets.UTF_8);
```

- 生成文件的相对位置取决于虚拟机、shell 或 IDE，推荐使用绝对路径
- Windows 路径中每个反斜线之前需要再加一个反斜线转义

## 大数

基本类型范围不够用时用大数：BigInteger 表示任意精度整数，BigDecimal 表示任意精度浮点数。

```java
BigInteger a = BigInteger.valueOf(100);        // 值在常规范围内用静态方法 valueOf
BigInteger big = new BigInteger("2020200202"); // 超长数字用字符串构造
BigDecimal d = new BigDecimal("0.1");          // 必须用字符串构造，避免 double 字面量先引入误差
```

- 大数不能使用 `+`、`-`、`*` 等算术运算符，只能调用 add、subtract、multiply、divide 等方法
- 方法都不改变原对象，运算结果是新对象：

```java
BigInteger b = a.add(a);      // 200
BigInteger c = a.multiply(a); // 10000
```
