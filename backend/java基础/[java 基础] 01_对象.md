# Java 基础

## 一、通用基础

**输出语句**

```java
// 输入后换行
System.out.println()
// 输入后不换行
System.out.print()
```

**注释**

```JAVA
// 单行注释

/*
	多行注释
	多行注释
*/

/**
	文档注释
  	@auther: ren
*/
```

**进制表示**

```java
int num1 = 103; // 十进制
int num2 = 0b10; // 二进制
int num3 = 023; // 八进制
int num4 = 0x10a; // 十六进制
```

## 二、数据类型

### 数据类型分类

- 基本数据类型：

  - 整型：byte / short / int / long
    | 类型 | 占用空间 | 表数范围 | 注意 |
    | --- | --- | --- | --- |
    | byte | 1 Byte = 8bit | -2^7 ~ 2^7-1（-128 ~ 127） | |
    | short | 2 Byte | -2^15 ~ 2^15-1 | |
    | int | 4 Byte | -2^31 ~ 2^31-1 | 常用 |
    | long | 8 Byte | -2^63 ~ 2^63-1 | 赋值需要后缀 L/l<br />`long x = 123456789L;` |
  - 浮点型：float / double

    | 类型   | 占用空间 | 表数范围               | 注意                                     |
    | ------ | -------- | ---------------------- | ---------------------------------------- |
    | float  | 4 Byte   | -3.403E38 ~ 3.403E38   | 赋值需要后缀 F/f<br />`float x = 3.14f;` |
    | double | 8 Byte   | -1.798E308 ~ 1.798E308 |                                          |

  - 字符型：char

    | 类型 | 占用空间 | 声明语句                                                                        | 注意                                                                                                     |
    | ---- | -------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
    | char | 2 Byte   | `char x = 'a'`<br />`char x = '\u0036'`<br />`char x = '\n'`<br />`char x = 97` | 使用的单引号<br />只能有一个字符（Unicode）<br />可以使用转义字符<br />使用具体的字符对应的数值（ASCII） |

  - 布尔型：boolean

    | 值    | 占用空间       | 声明语句           |
    | ----- | -------------- | ------------------ |
    | true  | 4 Byte(同 int) | `boolean x = true` |
    | false | 4 Byte         | `boolean x = true` |

- 引用数据类型
  - 类：class
  - 数组：array
  - 接口：interface
  - 枚举：enum
  - 注解：annotation
  - 记录：record

### 类型转换

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

**强制转换**

```java
double x = 12.9;
int y = (int)x;
System.out.println(y); // 12
```

**基本数据类型与 String 的计算**

- String 类，属于引用数据类型，俗称字符串。
- String 类型的变量，可以使用双引号`""`进行赋值。
- String 类型与基本数据类型只能做连接运算，使用加号`+`表示。

## 三、运算符

### 算数运算符

> 注意：自增自减不会导致类型变化（自动转换）。

| 运算符 | 运算                                                   | 案例                               | 结果                           |
| ------ | ------------------------------------------------------ | ---------------------------------- | ------------------------------ |
| +      | 正号                                                   | +3                                 | 3                              |
| -      | 负号                                                   | -3                                 | -3                             |
| +      | 加                                                     | 5 + 5                              | 10                             |
| -      | 减                                                     | 5 - 1                              | 4                              |
| \*     | 乘                                                     | 3 \* 4                             | 12                             |
| /      | 除                                                     | 5 / 5                              | 1                              |
| %      | 取余                                                   | 7 % 5                              | 2                              |
| ++     | 自增（前）：先运算后取值<br />自增（后）：先取值后运算 | a = 2;b = ++a;<br />a = 2;b = a++; | a = 3;b = 3;<br />a = 3;b = 2; |
| --     | 自减                                                   | a = 2;b = --a;<br />a = 2;b = a--; | a = 1;b = 1;<br />a = 1;b = 2; |
| +      | 字符串连接                                             | "Hel" + "lo"                       | "Hello"                        |

### 赋值运算符

> 注意：+=、-=这些运算不会改变数据类型

基本赋值：

```java
int a = 10;
```

连续赋值：

```java
int a;
int b;
a = b = 10;
```

合并赋值：

```java
int a = 10, b = 20;
```

| 运算符              | 运算                       | 类似              |
| ------------------- | -------------------------- | ----------------- |
| =                   | =                          | =                 |
| +=、-=、\*=、/=、&= | byte a = 10;<br />a += 5； | a = (byte)(a + 5) |

### 比较运算符

> 适用于除boolean之外的七种数据类型
>
> == 、!= 适用于引用类型

| 运算符     | 说明 | 备注                     |
| ---------- | ---- | ------------------------ |
| ==         |      |                          |
| !=         |      |                          |
| >、<       |      |                          |
| >=、<=     |      |                          |
| instanceof |      | 面向对象多态位置再做说明 |

###  逻辑运算符

> 只针对布尔值类型的计算
>
> &、&&和|、||的区别：&&、||会短路

| a     | b     | a&b（逻辑与） | a&&b  | a\|b（逻辑或） | a\|\|b | !a    | a^b（异或） |
| ----- | ----- | ------------- | ----- | -------------- | ------ | ----- | ----------- |
| true  | true  | true          | true  | true           | true   | false | false       |
| true  | false | false         | false | true           | true   | false | true        |
| false | true  | false         | false | true           | true   | true  | true        |
| false | false | false         | false | false          | false  | true  | false       |

### 位运算符

| 符号 | 名称       | 作用 | 备注 |
| ---- | ---------- | ---- | ---- |
| <<   | 左移       |      |      |
| >>   | 右移       |      |      |
| >>>  | 无符号右移 |      |      |
| &    | 且         |      |      |
| \|   | 或         |      |      |
| ^    | 异或       |      |      |
| ~    | 取反       |      |      |

### 条件运算符

> 格式：(条件表达式) ? 表达式1 : 表达式2
>
> 条件表达式为Boolean类型
>
> 如果true执行1，否则执行2

## 四、流程控制语句

### 分支

#### if else

```JAVA
    if(heartRate >= 40 && heartRate <= 80) {
      System.out.println("Heart rate is normal.");
    } else if(heartRate < 40) {
      System.out.println("Heart rate is too low.");
    } else {
      System.out.println("Heart rate is too high.");
    }
```

可以省略大括号，但是只能执行一行

```JAVA
    if(heartRate >= 40 && heartRate <= 80) 
      System.out.println("Heart rate is normal.");
    else if(heartRate < 40) {
      System.out.println("Heart rate is too low.");
    } else 
      System.out.println("Heart rate is too high.");
    
```

#### switch case

**执行顺序**

1.依次匹配case语句，一旦匹配上，则执行case语句

2.如果没有遇到break，则会穿透继续执行其他case

3.如果遇到break，则直接结束switch

**注意事项**

- switch中只允许使用 byte、short、char、int、枚举（JDK5）、String（JDK7）
- default块的位置是随意的

```JAVA
class Test {
  public static void main(String[] args) {
    int num = 1;
    switch(num) {
      case 1:
        System.out.println("1");
      case 2:
        System.out.println("2");
      case 3:
        System.out.println("3");
    }
  }
}
```

```java
class Test {
  public static void main(String[] args) {
    int num = 1;
    switch(num) {
      default:
        System.out.println("default");
        break;
      case 1:
      case 2:
      case 3:
        System.out.println("1\2\3");
        break;
    }
  }
}
```

### 循环

循环四要素

1. 初始化条件
2. 循环条件（必须为Boolean格式）
3. 循环体
4. 迭代部分

#### for

> 1.124中如果有多个语句，需要使用逗号 `,` 隔开
> 2.循环外不可使用内部变量
> 3.break可以跳出循环

```java
class Test {
  public static void main(String[] args) {
    for(int i = 0; i < 5; i++) {
      System.out.println("Hello World!");
    }
  }
}
```

#### while

```java
class Test {
  public static void main(String[] args) {
    int num = 0;
    while (num < 10) {
      System.out.println("Hello World!" + num);
      num++;
    }
  }
}
```

```JAVA
// 猜数字练习
class Test {
  public static void main(String[] args) {
    int num = (int)(Math.random() * 100) + 1;
    Scanner sc = new Scanner(System.in);

    int guess = sc.nextInt();
    while(guess != num) {
      if(guess > num) {
        System.out.println("Too high!");
      } else {
        System.out.println("Too low!");
      }
      guess = sc.nextInt();
    }
    System.out.println("You guessed it!");
    sc.close();
  }
}
```

#### do while

> 至少会执行一次循环体

```java
class Test {
  public static void main(String[] args) {
    int num = 1;
    do {
      System.out.println("Hello World!" + num);
      num++;
    } while (num < 10);
  }
}
```

### 关键字break、continue

| 关键字   | 使用范围      | 作用             |
| -------- | ------------- | ---------------- |
| break    | switch \ 循环 | 跳出当前循环结构 |
| continue | 循环          | 结束当次循环     |

```java
// 结束 带标签的循环
class Test {
  public static void main(String[] args) {
    label:for(int i=0;i<10;i++) {
      for(int j=0;j<10;j++) {
        if(j==5) {
          break label;
        }
        System.out.println("i = " + i + " j = " + j);
      }
    }
  }
}
```

## 五、数组

### 数组声明

> 数组声明后不可更改长度
>
> 数组存放的内存地址是连续的

```java
// 第一种方式：静态初始化
double[] prices;
prices = new double[]{20.12, 33.123, 23, 3};

// 第二种方式：动态初始化
String[] foods = new String[4];

// 第三种方式：类型推断
int[] number = {1, 2, 3, 4};
```

### 数组元素的调用

```java
double[] prices;
prices = new double[]{20.12, 33.123, 23, 3};

// 取值
System.out.println(prices[0]);
// 赋值
prices[1] = 15.22;
// 长度
System.out.println(prices.length);
```

### 数组的遍历

```java
double[] prices;
prices = new double[]{20.12, 33.123, 23, 3};
// 数组的遍历
for(int i = 0; i < prices.length; i++) {
    System.out.println(prices[i]);
}
```

### 数组初始化值

```java
// 整型
int[] arr1 = new int[3];
System.out.println(arr1[0]); // 初始化值为：0
// 浮点型
double[] arr2 = new double[3];
System.out.println(arr1[0]); // 初始化值为：0.0
// 字符型
char[] arr3 = new char[3];
System.out.println(arr3[0]); // 初始化值为：0 （\u0000）
// 布尔型
boolean[] arr4 = new boolean[3];
System.out.println(arr4[0]); //  初始化值为：false

// 引用数据类型
String[] arr5 = new String[3];
System.out.println(arr5[0]); //  初始化值为：null
```

### 二维数组

```java
// 动态初始化
int[][] arr_1 = new int[3][4];
System.out.println(arr_1.length); // 3
System.out.println(arr_1[0].length); // 4
// 静态初始化
int[][] arr_2 = new int[][]{{1,2,3,4},{1,2,3,4},{1,2,3,4}};
System.out.println(arr_1.length); // 3
System.out.println(arr_1[0].length); // 4
```

### Arrays工具类

**Arrays.equals(arr1, arr2)**

> 比较两个数组元素是否依次相等

```java
import java.util.Arrays;

public class HelloWorld {
    public static void main(String[] args) {
        int[] arr1 = new int[]{2,3,4,5,6};
        int[] arr2 = new int[]{2,3,4,5,6};

        System.out.println(arr1 == arr2); // false

        boolean isEquals = Arrays.equals(arr1, arr2);
        System.out.println(isEquals); // true
    }
}
```

**Arrays.toString(arr1)**

>输出数组元素信息

```java
import java.util.Arrays;

public class HelloWorld {
    public static void main(String[] args) {
        int[] arr1 = new int[]{2,3,4,5,6};
        System.out.println(arr1); // [I@4eec7777
        System.out.println(Arrays.toString(arr1)); // [2, 3, 4, 5, 6]
    }
}
```

**Arrays.fill(arr1, 20);**

>填充数组

```java
import java.util.Arrays;

public class HelloWorld {
    public static void main(String[] args) {
        int[] arr1 = new int[10];
        Arrays.fill(arr1, 20);
        System.out.println(Arrays.toString(arr1)); // [20, 20, 20, 20, 20, 20, 20, 20, 20, 20]
    }
}
```

**Arrays.sort(arr1)**

> 使用快速排序进行排序

```java
import java.util.Arrays;

public class HelloWorld {
    public static void main(String[] args) {
        int[] arr1 = new int[]{32,6,3,657,23,57,32};
        Arrays.sort(arr1);
        System.out.println(Arrays.toString(arr1)); // [3, 6, 23, 32, 32, 57, 657]
    }
}
```

**Arrays.binarySearch(arr1, 23);**

> 使用二分查找进行查找，当前数组必须是有序数组，如果没找到则返回一个负数

```java
import java.util.Arrays;

public class HelloWorld {
    public static void main(String[] args) {
        int[] arr1 = new int[]{32,6,3,657,23,57,32};
        Arrays.sort(arr1);
        int index = Arrays.binarySearch(arr1, 23);
        System.out.println(Arrays.toString(arr1)); // [3, 6, 23, 32, 32, 57, 657]
        System.out.println(index); // 2
    }
}
```

## 其他

### 使用Scanner

> 1.导包 
>
> 2.创建实例
>
> 3.调用方法
>
> 4.关闭资源

```java
import java.util.Scanner;

class Test {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    String name = sc.next();
    System.out.println("Hello " + name + "!");
  	sc.close()
  }
}
```

可以获取多种数据类型

```java
import java.util.Scanner;

class Test {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    String name = sc.next();
    System.out.println("Hello " + name + "!");
    int age = sc.nextInt();
    System.out.println("You are " + age + " years old.");
    boolean isSingle = sc.nextBoolean();
    System.out.println("You are single: " + isSingle);
    char gender = sc.next().charAt(0);
    System.out.println("You gender is: " + gender);
  	sc.close()
  }
}
```

### 获取随机数

```java
class Test {
  public static void main(String[] args) {
    int d1 = (int)(Math.random() * 101);
    System.out.println(d1);
  }
}
```

