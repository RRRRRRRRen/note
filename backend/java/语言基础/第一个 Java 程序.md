# 第一个 Java 程序
*类型：knowledge ｜ 难度：入门 ｜ 标签：Java、main、语法规则 ｜ 更新：2026-09-22*

**Java 程序以类为基本单位：源代码文件名必须与公共类同名并以 .java 结尾，JVM 总是从指定类的 main 方法开始执行，语句以分号结束、方法体用花括号包裹。**

## 最简单的程序

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

- 文件必须保存为 `Hello.java`，与公共类名完全一致

编译与运行：

```bash
javac Hello.java   # 编译，生成 Hello.class
java Hello         # 运行，JVM 从 main 方法开始执行
```

## 代码规则

- Java 区分大小写
- 每个语句必须使用分号 `;` 结束
- 任何方法的代码都必须以 `{` 开始、用 `}` 结束

## 类名的命名规则

- 类名必须以字母开头，后面可以跟字母和数字的任意组合
- 类名是以大写字母开头的名词；由多个单词组成时使用大驼峰命名
- 源代码的文件名必须与公共类的类名相同，并以 `.java` 作为扩展名

## 执行规则

- `public` 是访问修饰符，用于控制程序的其他部分对这段代码的访问级别
- Java 虚拟机总是从指定类的 `main` 方法开始执行
- 每个应用程序都必须有一个 `main` 方法
