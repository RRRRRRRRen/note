# JS基础

## 1.js数据类型

**基本数据类型**：undefined、null、boolean、number、string、symbol、bigInt

**引用数据类型**：object

**Symbol**：代表创建一个独一无二不可变的数据类型，用来解决全局变量冲突问题。

```JS
// 不需要new，可以直接当作函数去声明一个值
var sym1 = Symbol();
var sym2 = Symbol("foo");
var sym3 = Symbol("foo");
```

**BigInt**：超过安全整数范畴的大整数。



## 2.堆栈的理解

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

```js
isNaN(NaN); // true
isNaN('A String'); // true
isNaN(undefined); // true
isNaN({}); // true

Number.isNaN(NaN); // true
Number.isNaN('A String'); // false
Number.isNaN(undefined); // false
Number.isNaN({}); // false
```



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

假值的布尔强制类型转换的结果为false。从逻辑上说，假值以外的值都为真值。



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

## 什么是闭包

官方说法：闭包就是指有权访问另一个函数作用域中的变量的函数。



## 闭包的作用

- 使我们在函数外部能够访问到函数内部的变量。通过使用闭包，可以通过在外部调用闭包函数，从而在外部访问到函数内部的变量，可以使用这种方法创建私有变量。
- 使已经结束运行的函数上下文中的变量对象继续留在内存中，因为闭包函数保留了这个变量对象的引用，所以这个变量对象不会被回收。



## 执行上下文的类型

**全局执行上下文**

任何不在函数内部的都是全局执行上下文，它首先会创建一个全局的window对象，斌且设置this的值等于这个全局变量，一个程序中只有一个全局执行上下文。

**函数执行上下文**

当一个函数被调用时，就会为该函数创建一个新的执行上下文，函数的上下文可以有任意个。

**eval函数执行上下文**

执行eval函数的代码会有属于它自己的执行上下文。



## 执行上下文栈是什么

js引擎使用执行上下文栈管理执行上下文。当js执行代码时，首先遇到全局代码，会创建一个全局执行上下文并且压入执行栈中，每当遇到一个函数调用，就会为该函数创建一个新的执行上下文并压入栈顶，引擎会执行位于执行上下文栈顶的函数，当函数执行完毕后，执行上下文从栈中弹出，继续执行下一个上下文。当所有的代码都执行完毕之后，从栈中弹出全局执行上下文。



## 执行上下文的三个阶段

**创建阶段**

this绑定

- 在全局执行上下文中，this指向全局对象window
- 在函数执行上下文中，this指向取决于函数如何被调用。

创建词法环境组件

- 词法环境是一种有标识符-变量映射的数据结构，标识符是指变量、函数名，变量是对实际对象或原始数据的引用。
- 词法环境有两个组件。环境记录器：庸才存储变量函数声明的实际位置。外部环境的引用：可以访问父级作用域。

创建变量环境组件

- 变量环境也是一个词法环境，其环境记录器持有变量声明语句在执行上下文中创建的绑定关系。

**执行阶段**

在这个阶段，执行变量的赋值、代码执行

**回收阶段**

执行上下文出栈等虚拟回收执行上下文。



## 什么是作用域

作用域可以视为一种规则，这个规则用来管理引擎如何在当前作用域以及嵌套的子作用域根据标识符名称进行变量查找。

简单来说，作用域就是变量的有效范围。在一定空间里可以对变量数据进行读写操作。



## 作用域的类型

**全局作用域**

- 直接写在script标签的JS代码，都在全局作用域。在全局作用域下声明的变量叫做全局变量（在块级外部定义的变量）。
- 全局变量在全局的任何位置下都可以使用；全局作用域中无法访问到局部作用域的中的变量。
- 全局作用域在页面打开的时候创建，在页面关闭时销毁。
- 所有 window 对象的属性拥有全局作用域
  - var和function命令声明的全局变量和函数是window对象的属性和方法
  - let命令、const命令、class命令声明的全局变量，不属于window对象的属性

**函数作用域（局部作用域）**

- 调用函数时会创建函数作用域，函数执行完毕以后，作用域销毁。每调用一次函数就会创建一个新的函数作用域，他们之间是相互独立的。
- 在函数作用域中可以访问全局变量，在函数的外面无法访问函数内的变量。
- 当在函数作用域操作一个变量时，它会先在自身作用域中寻找，如果有就直接使用，如果没有就向上一作用域中寻找，直到找到全局作用域，如果全局作用域中仍然没有找到，则会报错。

**块级作用域**

- ES6之前JavaScript采用的是函数作用域+词法作用域，ES6引入了块级作用域。
- 任何一对花括号{}中的语句集都属于一个块,**在块中使用let和const声明的变量**，外部是访问不到的，这种作用域的规则就叫块级作用域。
- 通过var声明的变量或者非严格模式下创建的函数声明没有块级作用域。

**词法作用域**

- 词法作用域是静态的作用域，无论函数在哪里被调用，也无论它如何被调用，它的词法作用域都只由**函数被声明时所处的位置**决定。
- 编译的词法分析阶段基本能够知道全部标识符在哪里以及是如何声明的，从而能够预测在执行过中如何对它们进行查找。
- 换句话说，词法作用域就是你在写代码的时候就已经决定了变量的作用域。



## 什么是作用域链

**概念**

作用域链本质上是一个指向变量对象的指针列表。变量对象是一个包含了执行环境中所有变量和函数的对象。作用域链的前端始终是当前执行上下文的变量对象。全局执行上下文的对象始终是作用域链的最后一个对象。

**作用**

作用域链的作用是保证对执行环境有权访问的所有变量和函数的有序访问。通过作用域链可以访问到外层环境的变量和函数。



## 什么是js预解析

js引擎在运行一段代码的时候，会按照下面的步骤进行：

- 把变量的声明提升到当前作用域的最前面，只会提升声明，不会提升赋值。
- 把函数的申明提升到当前作用域的最前面，只会提升声明，不会提升调用
- 优先提升function，再提升var



## 浏览器的垃圾回收机制

**回收机制**

- avascript 具有自动垃圾回收机制，会定期对那些不再使用的变量、对象所占用的内存进行释放，原理就是找到不再使用的变量，然后释放掉其占用的内存。
- JavaScript中存在两种变量：局部变量和全局变量。全局变量的生命周期会持续要页面卸载；而局部变量声明在函数中，它的生命周期从函数执行开始，直到函数执行结束，在这个过程中，局部变量会在堆或栈中存储它们的值，当函数执行结束后，这些局部变量不再被使用，它们所占有的空间就会被释放。
- 不过，当局部变量被外部函数使用时，其中一种情况就是闭包，在函数执行结束后，函数外部的变量依然指向函数内部的局部变量，此时局部变量依然在被使用，所以不会回收。

**如何减少垃圾回收**

- 对数组进行优化：清空数组时，将其长度设置为0而不是重新赋值[]
- 对对象进行优化：不用的对象设置为null

**内存泄漏**

由于疏忽或者错误造成程序未能释放已经不再需要的内存。

**内存泄漏的案例**

- 意外的全局变量
- 被遗忘的计时器或者回调
- 脱离DOM的引用
- 闭包



# 函数与函数式编程

## 什么时纯函数

**特性**

- 函数内部传入特定的值，就会返回唯一确定的值
- 不会造成超出作用域的变化

**优势**

- 使用纯函数可以产生可测试的代码
- 不依赖外部环境计算，不会有副作用，提高函数可复用性
- 可以组装成复杂任务的可能性，符合模块化的单一职责原则



## 什么是函数柯里化

柯里化时把接收多个参数的函数转换成接受一个单一参数的函数，斌且返回接受余下参数且返回结果的新函数的技术

柯里化的好处

- 参数复用
- 提前确认
- 延迟运行



## 箭头函数的特点

- 没有this，this指向定义箭头函数所处的外部环境
- 箭头函数的this不会被改变，call、apply、bind也不会改变
- 箭头函数只能申明成匿名函数，但是可以通过表达式让箭头函数具名
- 箭头函数没有原型prototype
- 箭头函数不能作为构造器new使用
- 箭头函数没有arguments，如果访问则是外部的arguments



## call、apply、bind区别

共同点

- 都可以改变this的指向
- 三者第一个参数都是this要指向的对象，如果没有这个参数或者为null、undefined，则默认指向全局window

不同点

- call和apply会调用函数，bind不会
- call、bind传参使用逗号隔开，apply使用数组传递
- bind返回一个改变this之后的函数

```js
      let obj = {
        name: this.name,
        objAge: this.age,
        myLove: function (fm, t) {
          console.log(this.name + "年龄" + this.age, "来自" + fm + "去往" + t);
        },
      };
      let obj1 = {
        name: "huang",
        age: 22,
      };
      obj.myLove.call(obj1, "达州", "成都"); //huang年龄22来自达州去往成都
      obj.myLove.apply(obj1, ["达州", "成都"]); //huang年龄22来自达州去往成都
      obj.myLove.bind(obj1, "达州", "成都")(); // huang年龄22来自达州去往成都
```



# 原型与继承

## 面向对象的特点

封装性、继承性、多态性

面向对象编程具有灵活、代码可复用、容易维护和开发的特点，更适合多人合作的大型软件项目



## 原生对象和宿主对象

**原生对象**

独立与宿主环境的ECMAScript实现提供的对象

包含：Object、Function、Array、String、Boolean、Number、Date、RegExp、Error、EvalError、RangeError、ReferenceError、SyntaxError、TypeError、URIError

**内置对象**

开发者不必明确实例化内置对象，它已被内部实例化了

包含：Global、Math

**宿主对象**

BOM和DOM都是宿主对象。



## 内置对象常用的方法

**Number**

| 方法、属性          | 描述                                                   |
| ------------------- | ------------------------------------------------------ |
| Number.parseInt()   | 将字符串转换成整型数字，和全局方法parseInt()作用一致。 |
| Number.parseFloat() | 将字符串转换成浮点数，和全局方法parseFloat()作用一致。 |
| toFixed()           | 返回指定小数位数的表示形式。                           |

**String**

| 方法、属性    | 描述                                                     |
| ------------- | -------------------------------------------------------- |
| concat()      | 连接两个或更多字符串，并返回新的字符串。                 |
| indexOf()     | 返回某个指定的字符串值在字符串中首次出现的位置。         |
| includes()    | 查找字符串中是否包含指定的子字符串。                     |
| match()       | 查找找到一个或多个正则表达式的匹配。                     |
| replace()     | 在字符串中查找匹配的子串，并替换与正则表达式匹配的子串。 |
| slice()       | 提取字符串的片断，并在新的字符串中返回被提取的部分。     |
| split()       | 把字符串分割为字符串数组。                               |
| substr()      | 从起始索引号提取字符串中指定数目的字符。                 |
| substring()   | 提取字符串中两个指定的索引号之间的字符。                 |
| toLowerCase() | 根据本地主机的语言环境把字符串转换为小写。               |
| toUpperCase() | 根据本地主机的语言环境把字符串转换为大写。               |
| trim()        | 去除字符串两边的空白。                                   |

**Array**

| 方法、属性  | 描述                                                 |
| ----------- | ---------------------------------------------------- |
| concat()    | 连接两个或更多的数组，并返回结果。                   |
| join()      | 把数组的所有元素放入一个字符串。                     |
| entries()   | 返回数组的可迭代对象。                               |
| keys()      | 返回数组的可迭代对象，包含原始数组的键(key)。        |
| some()      | 检测数组元素中是否有元素符合指定条件。               |
| every()     | 检测数值元素的每个元素是否都符合条件。               |
| filter()    | 检测数值元素，并返回符合条件所有元素的数组。         |
| find(0)     | 返回符合传入测试（函数）条件的数组元素。             |
| findIndex() | 返回符合传入测试（函数）条件的数组元素索引。         |
| forEach()   | 数组每个元素都执行一次回调函数。                     |
| map()       | 通过指定函数处理数组的每个元素，并返回处理后的数组。 |
| reduce()    | 将数组元素计算为一个值（从左到右）。                 |
| includes()  | 判断一个数组是否包含一个指定的值。                   |
| indexOf()   | 搜索数组中的元素，并返回它所在的位置。               |
| isArray()   | 判断对象是否为数组。                                 |
| pop()       | 删除数组的最后一个元素并返回删除的元素。             |
| push()      | 向数组的末尾添加一个或更多元素，并返回新的长度。     |
| shift()     | 删除并返回数组的第一个元素。                         |
| unshift()   | 向数组的开头添加一个或更多元素，并返回新的长度。     |
| reverse()   | 反转数组的元素顺序。                                 |
| slice()     | 选取数组的一部分，并返回一个新数组。                 |
| splice()    | 从数组中添加或删除元素。                             |
| sort()      | 对数组的元素进行排序。                               |
| flat()      | 数组扁平化                                           |

**Date**

| 方法、属性        | 描述                     |
| ----------------- | ------------------------ |
| getFullYear()     | 返回 Date 对象的年份字段 |
| getMonth()        | 返回 Date 对象的月份字段 |
| getDate()         | 返回一个月中的某一天     |
| getDay()          | 返回一周中的某一天       |
| getHours()        | 返回 Date 对象的小时字段 |
| getMinutes()      | 返回 Date 对象的分钟字段 |
| getSeconds()      | 返回 Date 对象的秒字段   |
| getMilliseconds() | 返回 Date 对象的毫秒字段 |
| getTime()         | 返回 Date 对象的毫秒表示 |

**Math**

| 方法、属性     | 描述                         |
| -------------- | ---------------------------- |
| Math.abs()     | 绝对值                       |
| Math.ceil()    | 向上取整(整数加 1，小数去掉) |
| Math.floor()   | 向下取整(直接去掉小数)       |
| Math.round()   | 四舍五入                     |
| Math.pow(x，y) | 求 x 的 y 次方               |
| Math.sqrt()    | 求平方根                     |



## 什么是原型对象

**概念**

构造函数的内部的`prototype`属性指向的对象，就是构造函数的原型对象。

原型对象包含了可以由该构造函数的所有实例共享的属性和方法。当构造函数新建一个实例对象后，在这个实例对象的内部包含一个指针`__proto__`，这个指针指向构造函数的原型对象，在es5中这个指针被称为对象的原型。

**关系**

- js分为函数对象和普通对象，每个对象都有`__proto__`属性，但是只有函数对象才有`prototype`属性。
- Object、Function都是js内置的函数，类似的还有Array、RegExp、Date、Boolean、Number、String等
- 属性`__proto__`是一个对象，他有两个属性，`constructor`和`__proto__`
- 原型对象`prototype`有一个默认的`constructor`属性，用于记录实例是由哪个构造函数创建的



## 什么是原型链

**概念**

原型链是一种查找规则。

当访问一个对象的属性时，如果这个对象内部不存在这个属性，那么它就会去它的原型对象里找这个属性，这个原型对象也会有自己的原型，也是这么一直找下去，这种链式查找就是原型链。

**原型链的终点**

原型链的终点是`null`。也就是`Object.prototype.__proto__`

**演示图**

![WechatIMG114.jpeg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d9afcd1172d340508d25c095b1103fac~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)











# 设计模式

## **构造器模式**

> 是一种创建型设计模式，它用于创建对象并初始化对象的属性和方法。它通过构造函数来创建对象，并使用原型链来共享方法和属性，从而提高对象的复用性和性能。

### **具体应用场景**

**1. 定义对象**

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

> 原型模式是一种创建型设计模式，它通过复制（克隆）现有的对象来创建新的对象，而不是通过实例化类来创建新对象。这样可以避免直接使用构造函数或复杂的创建过程，从而提高创建对象的效率。
>
> 在原型模式中，我们使用一个原型对象作为基础，然后通过克隆这个原型对象来创建新的对象。原型对象可以是已有的实例，也可以是一个特殊的对象，专门用于克隆。

### **具体应用场景**

**1. 原型链写法**

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

**2.Object.create()写法**

```js
// 原型对象
const carPrototype = {
  wheels: 4,
  engine: 'V6',
  color: 'white',

  start() {
    console.log('The car is starting...');
  },

  stop() {
    console.log('The car is stopping...');
  },

  getInfo() {
    return `Color: ${this.color}, Engine: ${this.engine}, Wheels: ${this.wheels}`;
  },
};

// 具体原型对象 - 克隆 carPrototype
const myCar = Object.create(carPrototype);
myCar.color = 'blue'; // 自定义color属性

const yourCar = Object.create(carPrototype);
yourCar.color = 'red'; // 自定义color属性

// 测试
console.log(myCar.getInfo()); // 输出：Color: blue, Engine: V6, Wheels: 4
console.log(yourCar.getInfo()); // 输出：Color: red, Engine: V6, Wheels: 4

myCar.start(); // 输出：The car is starting...
yourCar.stop(); // 输出：The car is stopping...
```





## **工厂模式**

> 工厂模式是一种创建对象的设计模式，它通过一个工厂函数或类来封装对象的创建过程。它可以帮助我们避免在代码中直接使用构造函数来实例化对象，从而降低耦合度，并提供一种更灵活的方式来创建对象。
>
> 在工厂模式中，我们将对象的创建抽象成一个工厂函数，该函数负责根据传递的参数或条件来创建不同的对象实例。这样，我们可以根据需要创建不同类型的对象，而不必关心对象创建的细节。

### **具体应用场景**

**1. 图表类的创建**

```js
// 定义一个抽象类
class Chart {
  render() {
    throw new Error('抽象方法不能调用')
  }
}

// 实现具体的类
class LineChart extends Chart {
  render() {
    console.log('渲染折线图')
  }
}

class BarChart extends Chart {
  render() {
    console.log('渲染柱状图')
  }
}

// 实现工厂方法
class ChartFactory {
  createChart(chartType) {
    switch (chartType) {
      case 'line':
        return new LineChart()
      case 'bar':
        return new BarChart()
      default:
        throw new Error(`没有${chartType}类型的图表`)
    }
  }
}

// 使用工厂方法创建对象
const chartFactory = new ChartFactory()
const lineChartObj = chartFactory.createChart('line')
lineChartObj.render()
const barChartObj = chartFactory.createChart('bar')
barChartObj.render()

```



## 抽象工厂模式

> 抽象工厂模式是一种创建型设计模式，它可以创建一系列相关或相互依赖的对象，而无需指定其具体类。这种模式通过提供一个接口或抽象类，定义了一组创建对象的方法，然后每个具体的工厂类实现这个接口或继承这个抽象类，并负责创建特定类型的对象。
>
> 抽象工厂模式的主要目标是提供一个接口，用于创建一族相关或互相关联的产品，而不需要显式指定其具体的类。这使得客户端代码可以与产品的具体类解耦，只需使用抽象接口进行操作，从而增强了代码的灵活性和可维护性。

### 具体应用场景

**1.不同品质的电子设备对象**

假设我们有两种不同类型的电子设备：手机（Phone）和电视（TV），每种设备又有两种不同型号：高端型（High-end）和普通型（Standard）。我们将使用抽象工厂模式来创建不同型号的手机和电视。

首先，我们定义抽象产品类 `Phone` 和 `TV`，并定义它们的共同方法：

```javascript
// 抽象产品 Phone
class Phone {
  constructor() {
    this.type = 'Phone';
  }

  getInfo() {
    return `This is a ${this.type}.`;
  }
}

// 抽象产品 TV
class TV {
  constructor() {
    this.type = 'TV';
  }

  getInfo() {
    return `This is a ${this.type}.`;
  }
}
```

然后，我们定义具体产品类 `HighEndPhone` 和 `StandardPhone`，以及 `HighEndTV` 和 `StandardTV`：

```javascript
// 具体产品 HighEndPhone
class HighEndPhone extends Phone {
  constructor() {
    super();
    this.model = 'High-end Phone';
  }

  getInfo() {
    return `${super.getInfo()} Model: ${this.model}.`;
  }
}

// 具体产品 StandardPhone
class StandardPhone extends Phone {
  constructor() {
    super();
    this.model = 'Standard Phone';
  }

  getInfo() {
    return `${super.getInfo()} Model: ${this.model}.`;
  }
}

// 具体产品 HighEndTV
class HighEndTV extends TV {
  constructor() {
    super();
    this.model = 'High-end TV';
  }

  getInfo() {
    return `${super.getInfo()} Model: ${this.model}.`;
  }
}

// 具体产品 StandardTV
class StandardTV extends TV {
  constructor() {
    super();
    this.model = 'Standard TV';
  }

  getInfo() {
    return `${super.getInfo()} Model: ${this.model}.`;
  }
}
```

接下来，我们定义抽象工厂类 `ElectronicFactory`，并在其中定义创建手机和电视的抽象方法：

```javascript
// 抽象工厂 ElectronicFactory
class ElectronicFactory {
  createPhone() {
    throw new Error('createPhone must be implemented in the concrete factory.');
  }

  createTV() {
    throw new Error('createTV must be implemented in the concrete factory.');
  }
}
```

最后，我们定义具体工厂类 `HighEndFactory` 和 `StandardFactory`，分别实现 `ElectronicFactory` 的抽象方法来创建不同型号的手机和电视：

```javascript
// 具体工厂 HighEndFactory
class HighEndFactory extends ElectronicFactory {
  createPhone() {
    return new HighEndPhone();
  }

  createTV() {
    return new HighEndTV();
  }
}

// 具体工厂 StandardFactory
class StandardFactory extends ElectronicFactory {
  createPhone() {
    return new StandardPhone();
  }

  createTV() {
    return new StandardTV();
  }
}
```

现在，我们可以在客户端代码中使用这些工厂来创建不同型号的手机和电视：

```javascript
function clientCode(factory) {
  const phone = factory.createPhone();
  const tv = factory.createTV();

  console.log(phone.getInfo());
  console.log(tv.getInfo());
}

const highEndFactory = new HighEndFactory();
clientCode(highEndFactory);

const standardFactory = new StandardFactory();
clientCode(standardFactory);
```

运行以上代码，输出结果如下：

```
This is a Phone. Model: High-end Phone.
This is a TV. Model: High-end TV.

This is a Phone. Model: Standard Phone.
This is a TV. Model: Standard TV.
```

如此，我们使用抽象工厂模式成功地实现了在电子设备制造业中创建不同型号手机和电视的需求。通过使用抽象工厂模式，我们可以轻松地添加新的具体产品类和工厂类，而无需修改客户端代码。



## 建造者模式

> 建造者模式是一种创建型设计模式，它主要用于创建复杂对象，通过将对象的构造过程拆分成多个步骤，从而使得同样的构造过程可以创建不同的表示。
>
> 在建造者模式中，有以下几个主要角色：
>
> 1. **产品（Product）**： 表示最终创建的复杂对象。产品通常包含多个组成部分。
> 2. **抽象建造者（Builder）**： 定义创建产品的接口，声明构建产品各个部分的抽象方法。
> 3. **具体建造者（Concrete Builder）**： 实现抽象建造者接口，负责具体产品部件的构造。它包含一个获取最终产品的方法。
> 4. **导演（Director）**： 负责安排具体建造者的构造步骤，以及控制产品的构造过程。
>
> 使用建造者模式的主要目的是将一个复杂对象的构建过程与其表示分离，使得构建过程和表示可以独立变化，从而可以构建不同表示的复杂对象。这种模式适用于构建的产品具有复杂的内部结构，且由相同的构建过程构造不同的表示。

### 具体使用场景

**1.菜单构建器**

```js
class MenuBuilder {
  constructor() {
    this.menu = '';
  }

  addMenuItem(name, link) {
    this.menu += `<a href="${link}">${name}</a>`;
  }

  addSubMenu(name, items) {
    this.menu += `<div>${name}: <ul>`;
    items.forEach(item => {
      this.menu += `<li>${item}</li>`;
    });
    this.menu += '</ul></div>';
  }

  getMenu() {
    return this.menu;
  }
}

// 使用示例
const menuBuilder = new MenuBuilder();
menuBuilder.addMenuItem('Home', '/');
menuBuilder.addMenuItem('About', '/about');
menuBuilder.addSubMenu('Services', ['Web Design', 'App Development', 'SEO']);
menuBuilder.addSubMenu('Contact', ['Phone', 'Email', 'Location']);

const menuHTML = menuBuilder.getMenu();
console.log(menuHTML);
```



## 单例模式

> 保证一个类仅有一个实例，并提供一个访问他的全局访问点，主要解决一个全局使用类频繁的创建和销毁，占用内存。

### **具体应用场景**

**1. 弹窗管理器**

弹窗管理器是用于管理网页上弹出的各种弹窗的实例，确保在同一时间只显示一个弹窗，防止多个弹窗同时显示或覆盖。我们可以使用单例模式来实现弹窗管理器：

定义弹窗类

```js
class PopupManager {
  constructor() {
    if (PopupManager.instance) {
      return PopupManager.instance;
    }

    this.popups = [];
    PopupManager.instance = this;
  }

  addPopup(popup) {
    this.popups.push(popup);
  }

  removePopup(popup) {
    this.popups = this.popups.filter(item => item !== popup);
  }

  showPopup(popup) {
    this.popups.forEach(item => {
      item.hide();
    });

    popup.show();
  }

  static getInstance() {
    return PopupManager.instance || new PopupManager();
  }
}
```

使用实例

```js
const popupManager1 = new PopupManager();
const popupManager2 = new PopupManager();

console.log(popupManager1 === popupManager2); // 输出：true，说明获取到同一个实例

class Popup {
  constructor(name) {
    this.name = name;
  }

  show() {
    console.log(`Showing ${this.name} popup.`);
  }

  hide() {
    console.log(`Hiding ${this.name} popup.`);
  }
}

const popup1 = new Popup('Popup 1');
const popup2 = new Popup('Popup 2');

popupManager1.addPopup(popup1);
popupManager1.addPopup(popup2);

popupManager1.showPopup(popup1); // 只显示 Popup 1
popupManager1.showPopup(popup2); // 只显示 Popup 2
```



## 装饰器模式

> 装饰模式是一种结构型设计模式，它允许你在不改变对象自身结构的情况下，动态地给对象添加额外的功能。装饰模式通过创建包装类来实现这一点，这个包装类包含了原始对象，并在其基础上添加了额外的行为。
>
> 装饰模式的主要目的是为了避免使用继承来扩展对象的功能，因为继承会导致类的层次结构变得复杂，而且在编译时就确定了类的行为。相比之下，装饰模式允许在运行时动态地组合对象的功能，使得代码更加灵活和可扩展。
>
> 在装饰模式中，通常有以下几个角色：
>
> 1. **组件接口（Component）**： 定义了原始对象和装饰器对象的公共接口。
> 2. **具体组件（ConcreteComponent）**： 实现了组件接口，是原始对象，它是我们需要扩展功能的对象。
> 3. **装饰器（Decorator）**： 实现了组件接口，并持有一个组件对象，用于装饰原始对象。在装饰器中可以增加新的行为，也可以修改原始对象的行为。
> 4. **具体装饰器（ConcreteDecorator）**： 继承自装饰器类，是具体的装饰器，实现了新的行为并在调用原始对象的方法前后添加额外的逻辑。

### **具体应用场景**

**1. 日志记录器**

```js
// 组件接口 - 日志记录器
class Logger {
  log(message) {
    console.log(`Log: ${message}`);
  }
}

// 具体组件 - 基本日志记录器
class BasicLogger extends Logger {
  log(message) {
    console.log(`Basic Log: ${message}`);
  }
}

// 装饰器 - 日志级别装饰器
class LogLevelDecorator extends Logger {
  constructor(logger, level) {
    super();
    this.logger = logger;
    this.level = level;
  }

  log(message) {
    console.log(`${this.level} Log: ${message}`);
    this.logger.log(message);
  }
}

// 使用示例
const basicLogger = new BasicLogger();
basicLogger.log('This is a basic log message');

const warningLogger = new LogLevelDecorator(basicLogger, 'Warning');
warningLogger.log('This is a warning log message');

const errorLogger = new LogLevelDecorator(basicLogger, 'Error');
errorLogger.log('This is an error log message');

```



## 适配模式

>  适配器模式是一种结构型设计模式，它用于将一个类的接口转换成客户端所期望的另一个接口。适配器模式使得原本由于接口不兼容而无法在一起工作的类能够协同工作。
>
> 在软件设计中，适配器模式有以下几个主要角色：
>
> 1. **目标接口（Target）**： 目标接口是客户端所期望的接口，也是客户端直接调用的接口。
> 2. **适配者类（Adaptee）**： 适配者类是需要被适配的类，它拥有原本不兼容的接口。
> 3. **适配器类（Adapter）**： 适配器类是适配器模式的核心，它实现了目标接口，并持有一个适配者类的实例，在目标接口的方法中调用适配者类的方法来实现适配。

### **具体应用场景**

**1. 集成第三方组件**

```js
// 第三方日志记录组件（不兼容我们的应用）
class ThirdPartyLogger {
  logMessage(message) {
    console.log(`Third Party Logger: ${message}`);
  }
}

// 我们的应用中的日志记录类
class OurLogger {
  log(message) {
    console.log(`Our Logger: ${message}`);
  }
}

// 适配器类 - 适配第三方日志记录组件到我们的应用中
class ThirdPartyLoggerAdapter extends OurLogger {
  constructor() {
    super();
    this.thirdPartyLogger = new ThirdPartyLogger();
  }

  log(message) {
    this.thirdPartyLogger.logMessage(message);
  }
}

// 使用示例
const logger = new ThirdPartyLoggerAdapter();
logger.log('This is a log message'); // 输出：Third Party Logger: This is a log message
```



## 策略模式

>  策略模式定义了一些列算法，并将每个算法封装起来，使他们可以相互替换，且算法的变化不会影响使用算法的客户。策略模式属于对象行为模式，它通过对算法的封装，把使用算法的职责和算法的实现分隔开来，并委派给不同的对象对这些算法管理。主要解决if...else过多难以管理的问题。

### **具体应用场景**

**1. 根据不同级别计算薪水**

```js
let strategry = {
    S: salary => salary*6,
    A: salary => salary*4
}
function calBonus(Level, salary) {
    return strategry[Level](salary)
}
calBonus('S', 10000)
```



## 代理模式

> 代理模式是一种结构型设计模式，它允许你提供一个代理对象，用于控制对其他对象的访问。代理对象充当了原始对象的中间人，客户端通过代理对象来访问原始对象，从而可以在访问过程中添加额外的逻辑或控制。
>
> 在代理模式中，通常有以下几个角色：
>
> 1. **抽象主题（Subject）**： 定义了代理对象和真正对象的共同接口，客户端通过它来访问真正的对象。
> 2. **真正主题（Real Subject）**： 实现了抽象主题接口，是真正的对象，执行具体的业务逻辑。
> 3. **代理（Proxy）**： 实现了抽象主题接口，持有一个真正主题的引用，并在访问真正主题之前或之后添加额外的逻辑。

### **具体应用场景**

**1. 代理请求鉴权控制**

```js
// 主题接口
class Subject {
  request() {
    console.log('Subject：处理请求');
  }
}

// 真实主题类
class RealSubject extends Subject {
  request() {
    console.log('RealSubject：处理请求');
  }
}

// 代理类
class Proxy extends Subject {
  constructor(realSubject) {
    super();
    this.realSubject = realSubject;
  }

  request() {
    if (this.checkAccess()) {
      this.realSubject.request();
      this.logAccess();
    }
  }

  checkAccess() {
    console.log('Proxy：检查访问权限');
    return true;
  }

  logAccess() {
    console.log('Proxy：记录访问日志');
  }
}

// 使用代理访问真实对象
const realSubject = new RealSubject();
const proxy = new Proxy(realSubject);

proxy.request();

```



## 观察者模式

> 观察者模式是一种行为设计模式，其中对象之间存在一对多的依赖关系。当一个对象的状态发生变化时，它的所有依赖者都得到通知并自动更新。观察者模式将对象之间的关系解耦，使得它们可以独立变化。

### **具体应用场景**

**1. 观察模式**

```js
// 目标者类
class Subject {
  constructor() {
    this.observers = [];  // 观察者列表
  }
  add(observer) {
    this.observers.push(observer);
  }
  remove(observer) {
    let idx = this.observers.findIndex(item => item === observer);
    idx > -1 && this.observers.splice(idx, 1);
  }
  notify() {
    for (let observer of this.observers) {
      observer.update();
    }
  }
}

// 观察者类
class Observer {
  constructor(name) {
    this.name = name;
  }
  // 目标对象更新时触发的回调
  update() {
    console.log(`目标者通知我更新了，我是：${this.name}`);
  }
}

// 实例化目标者
let subject = new Subject();

// 实例化两个观察者
let obs1 = new Observer('前端开发者');
let obs2 = new Observer('后端开发者');

// 向目标者添加观察者
subject.add(obs1);
subject.add(obs2);

// 目标者通知更新
subject.notify();  
```



## 发布订阅模式

基于一个事件（主题）通道，希望接收通知的对象 Subscriber 通过自定义事件订阅主题，被激活事件的对象 Publisher 通过发布主题事件的方式通知各个订阅该主题的 Subscriber 对象。

```js
// 事件中心
let pubSub = {
  list: {},
  subscribe: function (key, fn) {   // 订阅
    if (!this.list[key]) {
      this.list[key] = [];
    }
    this.list[key].push(fn);
  },
  publish: function(key, ...arg) {  // 发布
    for(let fn of this.list[key]) {
      fn.call(this, ...arg);
    }
  },
  unSubscribe: function (key, fn) {     // 取消订阅
    let fnList = this.list[key];
    if (!fnList) return false;

    if (!fn) {
      // 不传入指定取消的订阅方法，则清空所有key下的订阅
      fnList && (fnList.length = 0);
    } else {
      fnList.forEach((item, index) => {
        if (item === fn) {
          fnList.splice(index, 1);
        }
      })
    }
  }
}

// 订阅
pubSub.subscribe('onwork', time => {
  console.log(`上班了：${time}`);
})
pubSub.subscribe('offwork', time => {
  console.log(`下班了：${time}`);
})
pubSub.subscribe('launch', time => {
  console.log(`吃饭了：${time}`);
})

// 发布
pubSub.publish('offwork', '18:00:00'); 
pubSub.publish('launch', '12:00:00');

// 取消订阅
pubSub.unSubscribe('onwork');
```

## 模块模式

模块化最初被定义为在传统软件工程中为类提供私有和公有封装的一种方法。

能够使一个单独的对象拥有公共、私有的方法和变量，从而屏蔽来自全局作用域的特殊不封。这可以减少我们的函数名与在页面中的其他脚本区域内定义的函数名冲突的可能性。

```js
export default {
    name: '123'
}
import module from './xx.js'
```

## 桥接模式

将抽象部分与它的实现部分分离，使他们可以独立地变化。一个类可以存在两个或多个独立变化的维度，且这两个维度都需要进行扩展。

```js
class Toast {
    constructor(ele, animation) {
        this.ele = ele
        this.animation = animation
    }
    show() {
        this.animation.show()
    }
    hide() {
        this.animation.hide()
    }
}
class Model { ... }

const animations = {
    bounce: {
        show() {},
        hide() {}
    },
    slide: {
        show() {},
        hide() {}
    }
}

let slideToast = new Toast('.div', animations.slide)
slideToast.show()
slideToast.hide()
```

## 组合模式

又叫 “部分整体” 模式，将对象组合成树形结构，以表示 “部分-整体” 的层次结构。通过对象的多态性表现，使得用户对单个对象和组合对象的使用具有一致性。

```js
// 树对象 - 文件目录
class CFolder {
    constructor(name) {
        this.name = name;
        this.files = [];
    }

    add(file) {
        this.files.push(file);
    }

    scan() {
        for (let file of this.files) {
            file.scan();
        }
    }
}

// 叶对象 - 文件
class CFile {
    constructor(name) {
        this.name = name;
    }

    add(file) {
        throw new Error('文件下面不能再添加文件');
    }

    scan() {
        console.log(`开始扫描文件：${this.name}`);
    }
}

let mediaFolder = new CFolder('娱乐');
let movieFolder = new CFolder('电影');
let musicFolder = new CFolder('音乐');

let file1 = new CFile('钢铁侠.mp4');
let file2 = new CFile('再谈记忆.mp3');
movieFolder.add(file1);
musicFolder.add(file2);
mediaFolder.add(movieFolder);
mediaFolder.add(musicFolder);
mediaFolder.scan();

/* 输出:
开始扫描文件：钢铁侠.mp4
开始扫描文件：再谈记忆.mp3
*/
```

## 命令模式

请求以命令的形式包裹在对象中，并传给调用对象。调用对象寻找可以处理该命令的合适的对象，并把该命令传给相应的对象，该对象执行命令。

```js
class Receiver {  // 接收者类
  execute() {
    console.log('接收者执行请求');
  }
}

class Command {   // 命令对象类
  constructor(receiver) {
    this.receiver = receiver;
  }
  execute () {    // 调用接收者对应接口执行
    console.log('命令对象->接收者->对应接口执行');
    this.receiver.execute();
  }
}

class Invoker {   // 发布者类
  constructor(command) {
    this.command = command;
  }
  invoke() {      // 发布请求，调用命令对象
    console.log('发布者发布请求');
    this.command.execute();
  }
}

const warehouse = new Receiver();       // 仓库
const order = new Command(warehouse);   // 订单
const client = new Invoker(order);      // 客户
client.invoke();
```

## 宏命令模式

一组命令集合（命令模式与组合模式的产物）

```js
// 宏命令对象
class MacroCommand {
  constructor() {
    this.commandList = [];  // 缓存子命令对象
  }
  add(command) {            // 向缓存中添加子命令
    this.commandList.push(command);
  }
  exceute() {               // 对外命令执行接口
    // 遍历自命令对象并执行其 execute 方法
    for (const command of this.commandList) {
      command.execute();
    }
  }
}

const openWechat = {  // 命令对象
  execute: () => {
    console.log('打开微信');
  }
};

const openChrome = {  // 命令对象
  execute: () => {
    console.log('打开Chrome');
  }
};

const openEmail = {   // 命令对象
  execute: () => {
    console.log('打开Email');
  }
}

const macroCommand = new MacroCommand();

macroCommand.add(openWechat); // 宏命令中添加子命令
macroCommand.add(openChrome); // 宏命令中添加子命令
macroCommand.add(openEmail);  // 宏命令中添加子命令

macroCommand.execute();       // 执行宏命令
/* 输出：
打开微信
打开Chrome
打开Email
*/
```

## 模板方法模式

只需要使用集成就能实现。由两部分组成：抽象父类 + 具体的实现子类。

```js
// 抽象父类
var Beverage = function() { };
Beverage.prototype.boilWater = function() {
    console.log('煮沸水');
};
Beverage.prototype.brew = function(){
    throw new Error( '子类必须重写 brew 方法' );
}; // 空方法，应该由子类重写
Beverage.prototype.pourInCup = function(){
    throw new Error( '子类必须重写 pourInCup 方法' );
}; // 空方法，应该由子类重写
Beverage.prototype.addCondiments = function(){
    throw new Error( '子类必须重写 addCondiments 方法' );
}; // 空方法，应该由子类重写
Beverage.prototype.init = function() {
    this.boilWater();
    this.brew();
    this.pourInCup();
    this.addCondiments();
}

// 创建子类
var Coffee = function() { };
Coffee.prototype = new Beverage();
Coffee.prototype.brew = function(){
    console.log( '用沸水冲泡咖啡' );
};
Coffee.prototype.pourInCup = function(){
    console.log( '把咖啡倒进杯子' );
};
Coffee.prototype.addCondiments = function(){
    console.log( '加糖和牛奶' );
}; 

// 当调用init方法时，会找到父类的init方法进行调用。
var coffee = new Coffee();
coffee.init();
```

## 迭代器模式

提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露该对象的内部表示。

```js
// 统一遍历接口实现
var each = function(arr, callBack) {
  for (let i = 0, len = arr.length; i < len; i++) {
    // 将值，索引返回给回调函数callBack处理
    if (callBack(i, arr[i]) === false) {
      break;  // 中止迭代器，跳出循环
    }
  }
}

// 外部调用
each([1, 2, 3, 4, 5], function(index, value) {
    if (value > 3) {
      return false; // 返回false中止each
    }
    console.log([index, value]);
})

// 输出：[0, 1]  [1, 2]  [2, 3]
```

## 职责链模式

是使多个对象都有机会处理请求，从而避免请求的发送者和接受者之间的耦合关系。将这个对象连成一条链，并沿着这条链传递该请求，直到有一个对象处理他为止。

```js
function checkEmpty() {
    if(input.value.length === 0) {
        console.log('不能为空')
        return
    }
    return 'next'
}

function checkNumber() {
    if(Number.isNaN(+input.value)) {
        console.log('必须为数字')
        return
    }
    return 'next'
}

function checkLenght() {
    if(input.length < 6) {
        console.log('必须大于六位')
        return
    }
    return 'next'
}

class Chain {
    constructor(fn) {
        this.checkRule = fn || (() => 'next')
        this.nextRule = null
    }
    addRule(nextRule) {
        this.nextRule = new Chain(nextRule)
        return this.nextRule
    }
    end() {
        this.nextRule = {
            check: () => 'end'
        }
    }
    check() {
        this.checkRule() === 'next' ? this.nextRule.check() : null
    }
}

const checks = new Chain()
checks.addRule(checkEmpty).addRule(checkNumber).addRule(checkLength).end()

btn.addEventListen('click', event => {
    checks.check()
})
```



