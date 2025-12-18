1.  `any`  `unknown` `never` 区别
2. bigint 与 number 类型不兼容。
3. `Symbol()` `new Symbol()` 区别
4. `object` 和 `Object` 的区别
5. `type` 可是使用模板字符串嵌套
6. `typeof` 运算符在 ts 中的重写
7. 数组类型可以使用 `type Name = Names[number];` 获取元素的类型
8. 只读数组的声明方法 `readonly number[]`，泛型的声明方法 `ReadonlyArray`, `as const` 断言
9. 数组和元组的区别
10. 元组后置问号表示可选的成员
11. 元组扩展运算符
12. 元组成员别名

```typescript
type Color = [
  red: number,
  green: number,
  blue: number
];
```

13. 获取元组类型元素的类型同数组
14. 函数类型的几种写法
15. 函数重载的写法
16. readonly 和 Readonly 的区别
17. 对象类型的严格字面量检查和结构类型原则
18. interface 和 type 的区别