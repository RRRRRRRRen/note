# 包与 JAR 文件

*类型：knowledge ｜ 难度：入门 ｜ 标签：Java、package、import、JAR、classpath ｜ 更新：2026-09-22*

**包的唯一目的是确保类名唯一性（域名逆序命名），import 只能消除类名前缀、不搬运文件；类的访问权限分 public / 包级私有 / private 三层；JAR 用 ZIP 格式把应用打包为一个文件，可用 -e 指定入口做成可执行 JAR。**

## 包名

- 使用包的主要原因是确保类名的唯一性
- 推荐用因特网域名的逆序形式作为包名，例如 `com.horstmann.corejava`

## 类的导入

一个类可以使用所属包中的所有类，以及其他包中的公共类（public class）。

方式一：完全限定名，包名后跟类名：

```java
java.time.LocalDate today = java.time.LocalDate.now();
```

方式二：import 导入整个包或特定类：

```java
import java.time.*;       // 导入包中所有类

LocalDate today = LocalDate.now();
```

```java
import java.time.LocalDate; // 只导入特定类
```

命名冲突处理：两个包都有 Date 时——

- 只用其中一个：增加一条特定 import 指明：

```java
import java.util.*;
import java.sql.*;
import java.util.Date; // 指明使用 java.util 的 Date
```

- 两个都要用：类名前加完整包名：

```java
var startTime = new java.util.Date();
var today = new java.sql.Date(...);
```

## 静态导入

import 也能导入静态方法和静态字段，使用时不必加类名前缀：

```java
import static java.lang.System.*;

out.println("可以直接使用 System 的静态成员 out");
```

## 在包中增加类

- 必须将包名放在源文件的开头：

```java
package com.horstmann.corejava;

public class Employee {
}
```

- 源文件应放到与完整包名相匹配的子目录中，包层级与目录层级一致
- 一个源文件只能有一个公共类，且文件名必须与公共类名匹配

## 包访问与类路径

访问权限层级：

| 修饰 | 可访问范围 |
| --- | --- |
| public | 任意类 |
| 无修饰（包级私有） | 同一个包中的所有方法 |
| private | 仅定义它们的类 |

- 类路径必须与包名匹配，IDE（如 IDEA）已自动处理
- 不建议手动设置类路径

## JAR 文件

JAR 可以将一个应用程序打包为一个文件，使用 ZIP 压缩格式。

创建 JAR：

```bash
## 语法
jar options file1 file2 ...
## 示例
jar cvf CalculatorClasses.jar *.class icon.gif
```

每个 JAR 还包含一个清单文件（manifest），用于描述归档文件的特殊特性。

可执行 JAR：用 jar 命令的 `e` 选项指定程序入口点，然后直接运行：

```bash
jar cvfe MyProgram.jar com.mycompany.myapp.MainAppClass
java -jar MyProgram.jar
```

多版本 JAR：使用 `--release` 标志构建包含不同版本类文件的 JAR。
