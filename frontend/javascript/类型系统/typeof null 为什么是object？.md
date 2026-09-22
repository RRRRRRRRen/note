# typeof null 为什么是"object"？

*类型：knowledge ｜ 难度：进阶 ｜ 标签：类型系统、typeof、instanceof、面试 ｜ 更新：2026-09-10*

**结论：`typeof null === "object"` 是第一版实现的历史产物：JS 值用「类型标签 + 数据」表示，对象的标签是 000，而 null 是全零的空指针、标签恰好也是 000——被顺理成章识别成了对象。 这个行为因 web 兼容性无法修改：typeof 的返回值被海量存量代码依赖，修复提案曾被提出又因破坏兼容被否决。 工程结论三句话：判 null 用 `x === null`，判数组用 `Array.isArray`（读内部槽，跨 realm、防伪造），判内建子类型用 `Object.prototype.toString.call`。**

## 第一把尺子：typeof——按类型标签快判

typeof 的机制不在「语法」层，而在值的**内存表示**层。 第一版 JS 引擎里，一个值由「类型标签 + 数据」两部分组成，引擎读一下低位标签就能回答「你是什么」。 这套设计决定了 typeof 的两个性格：极快（一次标签读取），但粗糙（标签的粒度只有引擎当初定下的那几档）。 它能返回的值是穷尽的——七种原始类型的名字、加上 "object" 与 "function"。

返回值列表里唯一的例外是函数： 数组、日期、正则统统返回 "object"，唯独函数有专属的 "function"。 原因是函数有内部方法 `[[Call]]`（可调用），typeof 对「可调用对象」做了特判——这是按**能力**而不是按**标签**分类的唯一返回值。 代价是：typeof 分不清数组与普通对象，而 null 的历史 bug 也出自同一套标签系统。

```javascript
typeof null            // "object" —— 历史 bug，永不修复
typeof []              // "object" —— 数组和普通对象在这里没有区别
typeof function () {}  // "function" —— 唯一按「能力」分类的返回值
typeof undeclaredVar   // "undefined" —— 未声明变量不抛错
// （Node 22.17 验证；typeof 是唯一安全的存在性检查，
//   但 let/const 的暂时性死区内照样抛 ReferenceError）
```

规范原文（MDN · typeof）：

```text
In the first implementation of JavaScript, JavaScript values were represented
as a type tag and a value. The type tag for objects was 0. null was represented
as the NULL pointer (0x00 in most platforms). Consequently, null had 0 as type
tag, hence the typeof return value "object".
```

## typeof null：改不动的历史快照

把标签系统展开看： 对象的标签是 `000`，整数 1、双精度浮点 010、字符串 100、布尔 110。 而 null 在引擎里的表示是**全零的空指针**——与大多数平台的 NULL（0x00）一致。 低位标签恰好也是 000，typeof 便按「对象」汇报。 这不是逻辑错误，是当初的设计里 null 压根没打算有独立标签：一个「什么都不指」的占位值，撞上了「对象」的编码。

为什么明知是 bug 也不修？ 因为 **web 兼容性的约束是单向阀**：typeof 是使用频率最高的运算符之一，返回值列表早已被海量存量代码硬编码依赖——无数老页面用 `typeof x === "object"` 做分支判断，任何返回值变化都会让它们行为改变。 让 `typeof null === "null"` 的修复提案曾被正式提出，最终因破坏存量网页被否决（据 MDN typeof 文档）。 同一逻辑的活标本是 `document.all`：它不是 undefined，但 `typeof document.all === "undefined"`——Web 标准把它明文归类为对规范的「willful violation（故意违约）」，同样为了兼容老页面。

> **技巧：记忆口诀。** 标签 000 是对象，null 全零撞个正着；想改？存量网页不答应。

判空与判数组（null & array check）正误对照：

**错误写法：**

```javascript
const isObj = (v) => typeof v === "object";
isObj(null)  // true —— null 中招
isObj([])    // true —— 数组也中招
// 一个判断拦不住两个坑
```

问题：typeof 分不清数组/日期/正则，null 又恰好混进 object。

**正确写法：**

```javascript
if (x === null) { /* 判空用全等 */ }
if (Array.isArray(x)) { /* 判数组用专用检查 */ }
// typeof 只留给原始值
```

要点：=== 判 null、Array.isArray 判数组，各司其职。

## 第二把尺子：instanceof——沿原型链找构造函数

instanceof 回答的是另一个问题： 「这份数据**从哪条生产线下来**的？」 算法是沿左侧值的原型链逐级向上取 `__proto__`，与右侧构造函数的 `prototype` 属性做同一引用比较，命中即 true，走到原型链尽头（null）仍无则 false。 两个直接推论： 原始值没有原型链，`"abc" instanceof String` 返回 false（实测）； 它判断的是「引用关系」而非「数据形态」。

「信引用」带来了它的两个盲区。 其一**跨 realm 失效**： 每个全局环境（iframe、Web Worker、Node 的 vm 沙箱）各有一套内建构造器，两个 realm 的 `Array` 是两个不同的函数对象——A realm 的数组到了 B realm，原型链上找不到 B 的 Array.prototype，判断返回 false（下方实测）。 其二**原型可被篡改**： `Object.setPrototypeOf` 可以改变任何对象的原型链，判断结果随之漂移； 函数还能通过 `Symbol.hasInstance` 完全自定义 instanceof 的行为——它既是灵活性，也是不可靠性。

```javascript
const vm = require("node:vm");
// 在另一个 realm（独立全局环境）里创建的数组
const arr = vm.runInNewContext("[1, 2, 3]");

arr instanceof Array  // false！构造函数是另一个 realm 的
Array.isArray(arr)    // true —— 读内部槽，与 realm 无关
// （Node 22.17 验证；浏览器里 iframe 场景同理）
```

跨 realm 判断（cross-realm）正误对照：

**错误写法：**

```javascript
// iframe 传过来的数组
iframeWin.arr instanceof Array  // false！
// 两个 realm 各有一套 Array 构造函数
```

问题：instanceof 依赖构造函数引用，跨 realm（iframe/worker）必然失效。

**正确写法：**

```javascript
Array.isArray(iframeWin.arr)  // true
Object.prototype.toString.call(iframeWin.arr)
// '[object Array]'
```

要点：两者读的都是内部数据而非构造函数引用，与 realm 无关。

## 第三把尺子：toString.call——读内部标签

最可靠的一把尺子绕开了「引用」与「标签」两套问题： `Object.prototype.toString.call(x)` 读取对象内部的规格化标签，返回 `'[object Array]'`、`'[object Map]'` 这类字符串。 标签的来源是内部槽 `Symbol.toStringTag`——内建对象由引擎按规范写入默认值，自定义对象也可以自己定义。 它不依赖原型链（防篡改），也不依赖 realm（防跨环境），是「穿透一切」的通用兜底。

一个精妙的细节： `Object.prototype.toString.call(null)` 为什么不报错？ null 明明点不出任何属性。 因为 `call` 只是把 null 绑定为函数的 this、不发生属性访问，而 toString 的规范算法第一步就特判 Undefined 与 Null 两个类型，直接返回 `'[object Undefined]'` / `'[object Null]'`（据 ECMA-262 该方法的算法描述）。 但这把尺子也非绝对可靠： Symbol.toStringTag 是普通属性，自定义一个返回 "Array" 的就能伪造出 `'[object Array]'`（实测可复现）。 真正的最后防线是 `Array.isArray`——它读的是引擎内部槽 IsArray，由数组的创建路径写入，JS 代码没有任何办法改写内部槽，所以防得住一切伪造。

选型决策（which ruler）：

| 判断目标 | 用哪把尺子 | 原因 |
| --- | --- | --- |
| 判原始值 / 判 null | `typeof` / `===` | typeof 对原始值可靠；null 是唯一例外，用全等 |
| 判数组 | `Array.isArray` | 读内部 IsArray 槽：跨 realm 安全、无法伪造 |
| 判内建子类型（Map/Set/Date…） | `Object.prototype.toString.call` | 规格化内部标签，不受原型篡改与 realm 影响 |
| 判自定义类实例 | `instanceof` | 本 realm 内的原型链检查，语义最直白 |

> **记住：类型判断决策。** 判 null 用 `===`；判数组用 `Array.isArray`；判内建子类型用 `toString.call`；判自定义类才用 `instanceof`。 三把尺子的分野：**typeof 信标签、instanceof 信引用、toString.call 信数据**。

## 经典追问链

**追问一：typeof null 为什么是 'object'？后来为什么不修？**

考察点：热身题，筛只会背结论的人——能讲出类型标签实现与兼容性约束的，才是理解了语言的历史包袱。

第一版实现里 JS 值由「类型标签 + 数据」表示，对象的标签是 000； 而 null 的表示是全零空指针（NULL = 0x00），低位标签恰好也是 000，于是被识别成对象。 这个行为自第一版定型后无法修改——typeof 的返回值被海量存量页面依赖，修改会破坏 web 兼容性，改成 'null' 的修复提案曾因兼容性问题被否决（据 MDN typeof 文档）。

- 加分项：同源的兼容性故事还有 document.all——`typeof document.all === 'undefined'`，虽然它并不是 undefined，Web 标准明文承认这是「willful violation（故意违约）」。两个案例共同说明：JS 的类型怪癖几乎都是「历史表示 + 兼容性锁死」的产物。

**追问二：Object.prototype.toString.call(null) 为什么不报错？null 明明点不出任何属性。**

考察点：考规范阅读量——「call 只借用函数」与「toString 的类型特判分支」两层都说出来才算完整。

两层原因： 其一，call 只是把 null 绑定为 toString 的 this，这个绑定动作本身不发生任何属性访问； 其二，toString 的规范算法在开头就特判了 Type(arg) 为 Undefined 与 Null 的情形，直接返回 '[object Undefined]' / '[object Null]'——根本走不到读内部标签那一步（据 ECMA-262 该方法的算法描述）。

- 加分项：对比记忆——Object.keys(null) 这类方法会先做 ToObject，null/undefined 直接抛 TypeError。「这个参数可能不是对象」的宽容只留给了少数像 toString 这样的底层方法。

**追问三：Symbol.toStringTag 能伪造 '[object Array]' 吗？Array.isArray 为什么防得住？**

考察点：区分「看起来可靠」与「真的可靠」——考内部槽与普通属性的本质差异。

toString.call 可以被伪造： 给对象定义 Symbol.toStringTag 返回 'Array'，就能得到 '[object Array]'（实测可复现），因为它读的只是一个可自定义的普通属性。 Array.isArray 防得住： 它读的是引擎内部槽 IsArray，由数组的创建路径写入，JS 代码没有任何语法能改写内部槽。 所以「判数组用 Array.isArray」是安全结论，toString.call 适合防误判而非防伪造。

- 加分项：「引擎能看到的比 JS 层多」是贯穿性原理——structuredClone 判定哪些值可克隆、JSON.stringify 过滤非 JSON 类型，依据的都是内部数据形态而非可篡改的 JS 层属性。

**追问四：typeof 对未声明变量为什么返回 'undefined' 而不抛 ReferenceError？它在什么情况下失效？**

考察点：考规范细节的两面——「唯一安全的存在性检查」为何成立，以及 let/const 时代它在哪失守。

规范明文规定： typeof 的求值对「无法解析的引用」特殊处理，直接返回 'undefined' 而不抛错——这让它成为唯一安全的存在性检查手段（如探测某个全局特性是否存在）。 但它防的是「不存在」而非「未初始化」： let/const 声明的暂时性死区内，`typeof x` 照样抛 ReferenceError（实测），因为绑定已经存在、只是尚未初始化。

- 加分项：探测全局变量的现代替代写法——`'fetch' in globalThis`，用 in 操作符查属性，语义直白且不受死区干扰，也不依赖 typeof 的特殊豁免。

**追问五：instanceof 的原理是什么？手写一个要考虑哪些边界？**

考察点：压轴题考原型链的真理解——只会背「沿原型链找」不够，边界处理与规范入口才是分水岭。

原理： 沿左侧值的原型链逐级取 `__proto__`（Object.getPrototypeOf），与右侧函数的 prototype 属性做同一引用比较，命中返回 true，走到 null 仍未命中返回 false。 手写的三个边界： ① 左侧是原始值直接返回 false（没有原型链，`'abc' instanceof String` 为 false 是实测行为）； ② 右侧不是函数要抛 TypeError（`'x' instanceof null` → TypeError: Right-hand side of 'instanceof' is not an object，实测）； ③ 规范里 instanceof 的第一步是询问右侧的 Symbol.hasInstance，函数的默认实现才是原型链遍历——完整模拟要从它开始。

- 加分项：与三把尺子的主线呼应——instanceof 沿链查「引用」，所以跨 realm 失效；Array.isArray 与 toString.call 查「内部数据」，与 realm 无关。判断方式的选择本质是在回答「你信引用，还是信数据」。

## 延伸阅读

- 「1」+ 1 为什么等于「11」：隐式转换规则
- 属性是怎么被继承的：原型链查找
