# JS基础

## 1.js数据类型

**基本数据类型**：undefined、null、boolean、number、string、symbol、bigInt

**引用数据类型**：object

**Symbol**：代表创建一个独一无二不可变的数据类型，用来解决全局变量冲突问题。

**BigInt**：超过安全整数范畴的大整数。



## 2.堆栈的理解

**操作系统内存中**

栈区：由编译器自动分配，存放函数的参数值，局部变量的值等。

堆区：一般由开发着分配释放，若开发者不是放，程序结束时可能由垃圾回收机制回收。

**数据结构中**

栈：栈中的数据存取方式为先进后出

堆：是一个优先队列，按照优先级来进行排序。

**储存方式**

栈：原始数据类型直接存放在栈中，占据空间、大小固定。

堆：引用数据类型存放在堆中，占据空间大、大小不固定。引用数据类型在栈中存放指针，该指针指向堆中的实体。



## 3.检测数据类型的方法

| 方法                           | 优点                                | 缺点                                                         |
| ------------------------------ | ----------------------------------- | ------------------------------------------------------------ |
| typeof                         | 使用简单                            | 只能检测出出了null外的基本数据类型，和引用数据类型中的function |
| instanceof                     | 用于检测引用类型                    | 不能检测基本类型，其而不能跨iframe                           |
| constructor                    | 能检测除了null和undefined的所有类型 | constructor容易被修改，也不能跨iframe                        |
| Object.prototype.toString.call | 能检测所有的类型                    | IE6下，undefined和null均为Object                             |



## 4.typeof null的结果是什么，为什么

**结果**

```js
typeof null === 'object' // true
```

**原因**

在JavaScript的最初版中，使用32位系统，js为了性能优化，使用低位来存储变量的类型信息。

- 对象：000
- 整数：1
- 浮点数：010
- 字符串：100
- 布尔：110
- undefined：-2^31(全为1)
- null：全为0

所以在使用低位标志判断时，null和对象都被判断为000，所以都被认为时对象



## 5.为什么0.1+ 0.2 !== 0.3

**原因**

双精度浮点数精度问题

**解决方案**

ES6中提供Number.EPSILON属性，只需要判断差值是否需要这个值，如果小于就可以判等。

```js
function numerepsilon(arg1, arg2) {
    return Math.abs(arg1 -arg2) < Number.EPSILON
}
```



## 6.typeof NaN 的结果是什么

**结果**

```js
typeof NaN === 'number' // true
```

**原因**

NaN是一个警戒值，用于表示数字类型的错误情况，即指数学运算没有成功，这是失败后的返回。

**注意**

NaN是唯一一个非自反的值，即

```js
NaN !== NaN // true
```



## 7.isNaN和Number.isNaN的区别

isNaN函数在接受到参数后，会尝试将这个参数转换为数值，任何不能被转换为数值的值都会被返回true，因此非数值传入也会被认为时true，不够准确。

Number.isNaN会先判断传入的参数是否为数字，如果是数字在继续判断是否为NaN，不会进行数据类型的转换，这种方法对于NaN更加准确。



## 8.==操作符的强制转换规则

对于`==`来说，如果双方对比的类型不一样，就会进行类型转换。按照如下判断流程：

1. 首先判断两者类型是否相同，如果相同则直接比较
2. 如果类型不同则会进行类型转换
3. 先判断是否在对比null和undefined，是的话就返回true
4. 判断两者是否为string和number，是的话则会将字符串转换为number
5. 判断其中一方是否为boolean，如果是就把Boolean转换为number
6. 判断一方是否为object，且另一方是否为string、number、symbol，是的话把object转换为原始类型，如`'[object Object]'`



## 9.其他值的类型转换为字符串的规则

- Null 和 Undefined 类型 ，null 转换为 "null"，undefined 转换为 "undefined"，
- Boolean 类型，true 转换为 "true"，false 转换为 "false"。
- Number 类型的值直接转换，不过那些极小和极大的数字会使用指数形式。
- Symbol 类型的值直接转换，但是只允许显式强制类型转换，使用隐式强制类型转换会产生错误。
- 对普通对象来说，除非自行定义 toString() 方法，否则会调用 toString()（Object.prototype.toString()）来返回内部属性 [[Class]] 的值，如"[object Object]"。如果对象有自己的 toString() 方法，字符串化时就会调用该方法并使用其返回值。



## 10.其他值类型转成数字的转换规则

- Undefined 类型的值转换为 NaN。
- Null 类型的值转换为 0。
- Boolean 类型的值，true 转换为 1，false 转换为 0。
- String 类型的值转换如同使用 Number() 函数进行转换，如果包含非数字值则转换为 NaN，空字符串为 0。
- Symbol 类型的值不能转换为数字，会报错。
- 对象（包括数组）会首先被转换为相应的基本类型值，如果返回的是非数字的基本类型值，则再遵循以上规则将其强制转换为数字。

为了将值转换为相应的基本类型值， 隐式转换会首先检查该值是否有valueOf()方法。如果有并且返回基本类型值，就使用该值进行强制类型转换。如果没有就使用 toString() 的返回值（如果存在）来进行强制类型转换。如果 valueOf() 和 toString() 均不返回基本类型值，会产生 TypeError 错误。



## 11.其他值类型转成布尔类型的转换规则？

以下这些是假值：undefined、null、false、0、NaN、""

假值的布尔强制类型转换的结果为false。从逻辑上说，假值以为的值都为真值。



## 12.||操作符和&&的返回值

**||**

- 会返回最早遇到的非假值
- 如果都为假值，则返回第二个

**&&**

- 会返回最早遇到的假值
- 如果都不为价假值，则返回第二个



## 13.Object.is() 与比较操作符 “===”、“==” 的区别？

**判断规则**

- 都是`undefined`或都是`null`
- 都是 `true` 或都是 `false`
- 都是相同长度、相同字符、按相同顺序排列的字符串
- 都是相同对象（意味着都是同一个对象的值引用）
- 都是数字且
  - 都是 `+0`
  - 都是 `-0`
  - 都是 `NaN`
  - 都是同一个值，非零且都不是`NaN`

**与`==`的区别**

`Object.is`不会强制转换类型

**与`===`的区别**

他们对待0和NaN的规则不同，`===`认为`+0 -0`相等，`NaN`不与自身相对，而`Object.is`恰恰相反



## 14.什么是 JavaScript 中的包装类型？

在Javascript中，基本类型是没有属性和方法的，但是为了便于操作基本类型的值，在调用基本类型的属性或者方法时，JavaScript会在后台隐式的将基本类型包装为对象，例如

```js
const a = 'abc'
a.length // 3
// 在访问a.length时，js在后台将'abc'转化为
String('abc')
```



## 15.如何判断this的指向

- 第一种是**函数调用模式**，当一个函数不是一个对象的属性时，直接作为函数来调用时，this 指向全局对象。
- 第二种是**方法调用模式**，如果一个函数作为一个对象的方法来调用时，this 指向这个对象。
- 第三种是**构造器调用模式**，如果一个函数用 new 调用时，函数执行前会新创建一个对象，this 指向这个新创建的对象。
- 第四种是 **apply 、 call 和 bind 调用模式**，这三个方法都可以显示的指定调用函数的 this 指向。
  - 其中 apply 方法接收两个参数：一个是 this 绑定的对象，一个是参数数组。
  - call 方法接收的参数，第一个是 this 绑定的对象，后面的其余参数是传入函数执行的参数。也就是说，在使用 call() 方法时，传递给函数的参数必须逐个列举出来。
  - bind 方法通过传入一个对象，返回一个 this 绑定了传入对象的新函数。这个函数的 this 指向除了使用 new 时会被改变，其他情况下都不会改变。
- this绑定的优先级：new 》 显示绑定 》 隐式绑定 》 默认绑定



## 16.Map和Object的区别

| 区别     | Map                        | Object               |
| -------- | -------------------------- | -------------------- |
| 意外的键 | 只包含显示插入的键         | 原型链上的键         |
| 键的类型 | 可以是任意类型             | 必须时string、symbol |
| 键的顺序 | 按照插入的时间排序         | 无序                 |
| 键的数量 | 通过size获取               | 必须手动计算         |
| 迭代     | Map默认可迭代              | 必须获取键再迭代     |
| 性能     | 频繁增删键值对的情况性能好 | 未优化               |



## 17.String和JSON.stringify的区别

```js
// 字符串
console.log(String("abc")); // abc
console.log(JSON.stringify("abc")); // "abc"
// 对象
console.log(String({ key: "value" })); // [object Object]
console.log(JSON.stringify({ key: "value" })); // {"key":"value"}
// 数组
console.log(String([1, 2, 3])); // 1,2,3
console.log(JSON.stringify([1, 2, 3])); // [1,2,3]
// 面对toString
const obj = {
    title: "devpoint",
    toString() {
        return "obj";
    },
};
console.log(String(obj)); // obj
console.log(JSON.stringify(obj)); // {"title":"devpoint"}
```



## 18.伪数组

**简介**

一个拥有length属性和若干索引属性的对象就可以被称为数组对象，类数组对象和数组类似，但是不能调用数组的方法。

常见的类数组对象由arguments和DOM方法的返回结果。

**转化为数组**

```js
// slice
Array.prototype.slice.call(arguments)
// Array.from
Array.from(arguments)
// 扩展运算符
[...arguments]
```



## 19.Unicode、UTF-8、UTF-16、UTF-32的区别

Unicode是字符集

UTF-8等是字符集编码，也就是编码的规则



## 20.escape、encodeURI、encodeURIComponent 的区别

**escape**

用于编码字符串，一般不用于编码URL

**encodeURI**

编码掉URL，但是保持URL的可用性

**encodeURIComponent**

完全编码掉URL，使其可以作为URL的参数使用

```js
encodeURI("http://www.cnblogs.com/season-huang/some other thing");
// 'http://www.cnblogs.com/season-huang/some%20other%20thing'

escape("http://www.cnblogs.com/season-huang/some other thing")
// 'http%3A//www.cnblogs.com/season-huang/some%20other%20thing'

encodeURIComponent("http://www.cnblogs.com/season-huang/some other thing")
// 'http%3A%2F%2Fwww.cnblogs.com%2Fseason-huang%2Fsome%20other%20thing'
```



## 21.尾调用

**简介**

尾调用指的是函数的最后一步调用另一个函数。

**优点**

代码执行是基于执行栈的，所以当在一个函数里调用另一个函数时，会保留当前的执行上下文，然后再新建一个执行上下文加入栈中。使用尾调用的话，因为已经是函数的最后一步了，所以这时候可以不必考虑保留当前的执行上下文，从而节省了内存，这就是尾调用优化。

但是ES6的尾调用优化旨在严格模式下开启，正常模式是无效的。



## 22.严格模式

**开启**

- 为整个脚本开启

```js
"use strict";
var v = "Hi!  I'm a strict mode script!";
```

- 为函数开启

```js
function strict() {
  'use strict';
  //  ...
  return "Hi!  I'm a strict mode function!  "
}
```

**目的**

- 消除js语法的不合理、不严谨之处，减少怪异行为
- 消除代码运行的不安全之处
- 提高编译器效率，增加运行速度
- 用于为新版本js做铺垫

**区别**

- 禁止使用with语句
- 禁止this指向全局对象
- 对象不能由重名属性



## 23.`for in` 和 `for of` 的区别

**for in**

- 只遍历可枚举属性，包括原型链上的可枚举属性。
- 一般用于遍历对象的key

**for of**

- 在可迭代对象上创建一个迭代循环，调用自定义迭代钩子，并为每个不同属性的值执行语句
- 一般用于遍历数组的value



## 24.JSON.stringify深拷贝的缺点

- 时间对象会被转化为字符串
- 正则会被转化为空对象
- 函数和undefined会被忽略
- 会丢失construction



## 25.includes 比 indexOf 好在哪

includes可以检测出NaN



## 26.移动端如何实现下拉刷新，上拉加载

**上拉加载**

上拉加载的本质是页面触底，或者快要触底时的动作，判断页面触底需要了解几个属性：

- 可见区域高度：clientHeight
- 全文高度：scrollHeight
- 包括边线的可见区域高度：offsetHeight
- 网页被卷去的高度：scrollTop

触底条件

```js
scrollTop + clientHeight >= scrollHeight
```

**下拉刷新**

下拉刷新的本质时页面本身置于顶部时，用户下拉触发的动作，需要三步

监听原生`touchstart`事件，记录初始位置：`e.touches[0].pageY`

监听原生`touchmove`事件，记录与初始位置的差值，并借助`translateY`使元素偏移。

监听原生`touchend`事件，判断差值是否符合条件，如果符合则加载，同时重置`translateY`



# 闭包与作用域





# 设计模式

## **构造器模式**

```js
function Employee(name, age) {
    this.name = name
    this.age = age
    this.say = function() {
        console.log(this.name + "-" + this.age)
    }
}
const employee1 = new Employee('ren', 22)
```

## **原型模式**

```js
function Employee(name, age) {
    this.name = name
    this.age = age
}
Employee.prototype.say = function() {
    console.log(this.name + "-" + this.age)
}
const employee1 = new Employee('ren', 22)
```

```js
class Employee {
    constructor(name, age) {
        this.name = name
        this.age = age
    }
    say() {
        console.log(this.name + "-" + this.age)
    }
}
const employee1 = new Employee('ren', 22)
```

## **工厂模式**

```js
class User {
    constructor(role, pages) {
        this.role = role
        this.pages = pages
    }
    static UserFactory(role) {
        switch (role) {
            case "admin":
                return new User('admin', "[1,2,3]")
                break
            case "editor":
                return new User('editor', "[1]")
                break
            default:
                throw new Error('error')
        }
    }
}
const user = User.UserFactory('admin')
```

## 抽象工厂模式

```js
class User {
    constructor(role, pages) {
        this.role = role
        this.pages = pages
    }
    say() {
        console.log(this.name + "-" + this.age)
    }
}
class Admin extends User {
    constructor(name) {
        super(name, 'admin', [1,2,3])
    }
    dataShow1() {}
}
class SuperAdmin extends User {
    constructor(name) {
        super(name, 'super-admin', [1,2,3])
    }
    dataShow2() {}
}
function getAbstractUserFactory(role) {
    switch(role) {
        case 'admin':
            return Admin
        case 'superAdmin'
            return SuperAdmin
        default:
            throw new Error('error')
    }
}
const AdminClass = getAbstractUserFactory('admin')
const admin = new AdminClass('ren')
```



