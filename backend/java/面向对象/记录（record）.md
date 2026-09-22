# 记录（record）

*类型：knowledge ｜ 难度：入门 ｜ 标签：Java、record、不可变类 ｜ 更新：2026-09-22*

**record 是 JDK 14 预览、JDK 16 正式发布的不可变数据载体类：声明一组字段后自动生成构造器、访问器、equals、hashCode 和 toString，天然不可变，适合纯粹存放数据的场景。**

## 基本语法

声明 record 只需给出参数列表（即字段列表）：

```java
public record Point(int x, int y) {
}
```

编译器自动生成：

- 与参数列表对应的构造器
- 每个字段的访问器方法（方法名即字段名，不是 getXxx）
- equals()、hashCode()、toString() 基于 all fields 实现

使用示例：

```java
Point p = new Point(1, 2);
p.x();                       // 访问字段，直接用字段名
p.equals(new Point(1, 2));   // true，按值比较
System.out.println(p);       // Point[x=1, y=2]
```

## 特性

- record 的字段都是 final 的，没有 setter，创建后不可修改
- 适合替代那些只有字段、构造器、getter、equals/hashCode 的样板代码类
- record 可以定义自己的方法，也可以实现接口；可以在构造器体中做参数校验（紧凑构造器）
- 不适合需要可变状态或大量业务行为的领域对象
