# class 是语法糖吗：从原型链到 class

*类型：knowledge ｜ 难度：进阶 ｜ 标签：继承、原型链、class、面试 ｜ 更新：2026-09-10*

**结论：继承方案的演进是一部修补史：原型链继承（引用类型属性被所有实例共享）→ 借用构造函数（修了共享，丢了原型方法）→ 组合继承（两者结合，但父构造执行两次）→ 寄生组合式（用 Object.create 造中间原型——正解，也就是 `class extends` 的引擎层等价物）。理解一切的前提是 new 的四步语义：创建对象 → 挂原型链 → 以新对象为 this 执行 → 按返回值类型决定结果。**

前置篇目（见文末延伸阅读）：new 四步里的「挂原型链」与 [[Prototype]]/prototype/**proto** 三者关系，是本篇一切方案的地基。

## new 的四步语义：一切继承的地基

`new Ctor(args)` 在引擎里做四件事： **① 创建空对象**； **② 把它的 \_\_proto\_\_ 指向 Ctor.prototype**（挂原型链，instanceof 由此生效）； **③ 以该对象为 this 执行构造函数**（this 绑定的 new 规则来源）； **④ 检查返回值**——构造函数 return 一个引用类型则用它替换结果，return 原始值则忽略、仍用第①步的对象。

四步解释了两个高频怪象： 为什么给构造函数 return 一个对象能「劫持」new 的结果（第④步），以及为什么实例能访问原型方法而不会共享 this 上的引用属性——属性写进 this（第③步，每实例一份），方法挂在 prototype（第②步，全体共享）。 「属性进 this、方法进 prototype」正是后面所有继承方案反复权衡的分界线。

## 方案演进：一部修补史

每种方案都是为了修上一个方案的洞： **原型链继承**（`Child.prototype = new Parent()`）让实例共享父构造的 this 属性——引用类型一改全改； **借用构造函数**（`Parent.call(this)`）把属性搬回各实例，但方法只能定义在构造函数里，prototype 上的方法完全够不着； **组合继承**把两者叠加，功能齐了，代价是 `Child.prototype = new Parent()` 这一步让父构造**执行了两次**，原型上还留着一层多余的实例属性。

**寄生组合式**是终点： 原型这一侧不再用「new Parent()」，改用 `Object.create(Parent.prototype)` 造一个**干净的中间原型**——不调用父构造、不带多余属性； 实例这一侧照旧 `Parent.call(this)`。 父构造只执行一次，属性各享、方法共享。 class extends 在引擎层做的正是这件事，外加静态属性链——所以面试说「class 是语法糖」，指的就是它等价于寄生组合式的自动化版本。

方案演进时间线（evolution）：

```text
原型链 ────► 借用构造 ────► 组合继承 ────► 寄生组合
（引用类型   （够不着原型   （父构造执行    （正解 = class 内核）
  共享）       方法）        两次）
```

引用共享（shared reference）正误对照：

**错误写法：**

```javascript
function Parent() {
  this.hobbies = [];      // this 上的引用类型
}
function Child() {}
Child.prototype = new Parent(); // 原型链继承

const a = new Child(), b = new Child();
a.hobbies.push("swim");
b.hobbies // ["swim"] ← 一改全改
```

问题：hobbies 挂在共享的原型对象上——所有实例读写同一份数组。

**正确写法：**

```javascript
function Child() {
  Parent.call(this);  // 属性进各实例
}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

const a = new Child(), b = new Child();
a.hobbies.push("swim");
b.hobbies // [] ← 互不影响
```

要点：寄生组合——属性走 Parent.call 各自创建，方法走中间原型共享。

父构造执行两次（double call）正误对照：

**错误写法：**

```javascript
function Child(name, age) {
  Parent.call(this, name);      // 第 2 次执行
}
Child.prototype = new Parent(); // 第 1 次执行
// 原型上躺着多余的 name/hobbies
// （实测 Node 22.17：Object.keys(Child.prototype)
//   → ['name', 'hobbies', 'constructor']）
```

问题：组合继承——父构造跑两遍，第一遍创建的实例属性全浪费在原型上。

**正确写法：**

```javascript
Child.prototype =
  Object.create(Parent.prototype); // 不调用 Parent
Child.prototype.constructor = Child;
// 中间原型是空壳，父构造只在实例化时执行一次
```

要点：寄生组合消掉了第一次执行——这正是它成为正解的原因之一。

寄生组合式完整实现：

```javascript
function Parent(name) {
  this.name = name;
  this.hobbies = []; // 引用类型，必须在实例上创建
}
Parent.prototype.say = function () {
  return `I am ${this.name}`;
};

function Child(name, age) {
  Parent.call(this, name); // ② 借用构造函数：实例属性各自独立
  this.age = age;
}

// ① 寄生式：中间原型继承 Parent.prototype，但不调用 Parent
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child; // ③ 修复 constructor 指回

const c = new Child("ada", 3);
c.say(); // 原型方法可用；hobbies 修改不影响其他实例
```

整体重写 prototype 忘修 constructor（constructor fix）正误对照：

**错误写法：**

```javascript
Child.prototype =
  Object.create(Parent.prototype);
// 少了修复行：

const c = new Child("ada");
c.constructor // Parent —— 沿原型链找到父类
// （实测 Node 22.17：c.constructor === Parent 为 true）
```

问题：靠 constructor 做类型判断或 `new c.constructor()` 复制实例的代码会翻车。

**正确写法：**

```javascript
Child.prototype =
  Object.create(Parent.prototype);
Child.prototype.constructor = Child; // 指回
```

要点：或者直接用 class——语法糖自动维护 constructor。

方法写在实例上（methods on instance）正误对照：

**错误写法：**

```javascript
function Child(name) {
  Parent.call(this, name);
  this.say = function () {   // 每个实例
    return `I am ${this.name}`; // 一份新函数
  };
}
```

问题：1000 个实例 = 1000 个函数对象，内存与创建成本双高。

**正确写法：**

```javascript
Child.prototype.say = function () {
  return `I am ${this.name}`;
}; // 全体实例共享同一份

class Child { say() {} } // class 默认挂原型
```

要点：「属性进 this、方法进 prototype」不只是约定，也是性能决策。

> **记住：一句选型。** 手写场景直接背结论：**Object.create(Parent.prototype) + Parent.call(this) + 修复 constructor**——这是面试要求的「寄生组合式」，也是 class extends 的行为内核。 写 class 的时代它仍是理解 super、静态继承与混入的底层模型。

## class 是语法糖：等价与不等价

`class A extends B` 在引擎层做了两条原型链： 实例链（A.prototype 的 \_\_proto\_\_ 指向 B.prototype——实例方法沿它查找）和**静态链**（A 自身的 \_\_proto\_\_ 指向 B——静态方法因此可继承）。 寄生组合式只覆盖了实例链，静态链是 class 的加赠。 `super` 就是沿着这两条链向上找方法并把 this 绑向当前对象。

也有**不等价**的部分，面试常当辨析题： class 声明不会提升（有暂时性死区）、类体内部强制严格模式、方法默认不可枚举（构造函数手挂的方法是可枚举的）、class 必须用 new 调用（直接调用抛 TypeError）。 这些差异让 class 不只是「好看的原型」，而是带约束的正式类型语义——理解了底层模型，这些约束就都成了可推导的结论而不是死记项。

## 经典追问链

**追问一：new 一个构造函数时，构造函数里 return 一个对象会发生什么？return 原始值呢？**

考察点：考 new 四步的第④步——背过「创建对象挂原型」只是及格线，return 覆盖规则才是分水岭。

new 的返回值由第④步决定： 构造函数返回引用类型（对象/函数）时，用它替换第①步创建的实例——原型链、instanceof 全部跟着变； 返回原始值则被忽略，正常返回 this。 因此「单例缓存实例」「返回代理包装」这类模式都借道这一步实现。 手写 new 的核心就是把四步 + 这个判断写全。

- 加分项：箭头函数不能 new 的根源在第①步之前——它没有 [[Construct]] 内部方法，引擎直接抛 TypeError，与「没有 prototype」是因果两件事。

**追问二：组合继承为什么说父构造执行了两次？多出来的那层是什么？**

考察点：考对中间产物的洞察——能指出「原型上多了一层无用的实例属性」才算真看懂了组合继承。

组合继承 = 原型链 + 借用构造： `Child.prototype = new Parent()` 执行第一次（属性挂到了原型上，纯浪费）； 实例化 Child 时 `Parent.call(this)` 又执行第二次（属性再挂到实例上，遮蔽原型同名属性）。 副作用是原型对象上躺着一层永远用不到的 name/hobbies——它们只被实例属性遮蔽。 寄生组合用 `Object.create(Parent.prototype)` 造空原型，第一次执行被彻底消掉。

- 加分项：遮蔽（shadowing）机制顺手解释了另一个现象——实例属性永远优先于原型属性，这也是「属性进 this、方法进 prototype」约定能和平共处的原因。

**追问三：Child.prototype.constructor = Child 这行不写会怎样？**

考察点：考 constructor 的真实角色——多数人背了「要修复」，说不出不修的后果就是背的。

替换整个 prototype 对象后，新对象上没有 constructor，沿原型链向上会找到 Parent.prototype.constructor——也就是 Parent。 后果： ① `obj.constructor` 语义错误，靠它做类型判断或 `new obj.constructor()` 复制实例的代码会翻车； ② 序列化/调试信息里类名错乱。 语言运行本身不依赖 constructor（它只是 prototype 上的一个普通属性），所以不写也不报错——这正是它总被忘掉的原因。

- 加分项：更稳的替代——别整体替换 prototype，用 Object.defineProperty 往现有 prototype 上加方法，constructor 自然保留；或直接用 class，语法糖替你维护好了这条链。

**追问四：class A extends B 在引擎层建了几条原型链？super 是怎么找到方法的？**

考察点：压轴题，考「双链」模型——只答得出实例链说明对静态继承与 super 没有完整认识。

两条。 实例链：`A.prototype.__proto__ === B.prototype`——实例方法沿它向上查找； 静态链：`A.__proto__ === B`——静态方法与静态属性因此可被继承（A.staticFn() 找不到时沿静态链到 B）。 super 的本质是沿对应链向上取值： 实例方法里 `super.fn()` 从 B.prototype 取 fn 并以当前 this 调用； 构造器里 `super()` 调 B 的构造函数并把 this（new.target 侧）传给它——所以 super() 之前不能碰 this 是规范级的顺序约束。

- 加分项：推论题——寄生组合式没有静态链。用 class 的项目里手写「继承静态方法」的老代码其实是无效操作，static 成员必须靠 extends 或显式 Object.setPrototypeOf。

**追问五：class 和构造函数写法还有哪些行为差异？为什么说它不只是语法糖？**

考察点：收尾辨析题，考工程判断——列出不可枚举/强制严格模式/不提升三件套，说明你真的两边都写过。

四个行为差异： ① class 声明不提升（暂时性死区，定义前访问直接 ReferenceError）； ② 类体强制严格模式； ③ 类的方法默认不可枚举（构造函数手挂方法是可枚举的，影响 for...in 与浅拷贝展开）； ④ class 只能 new、不能当普通函数调用。 这些约束让 class 的行为更可预测——「语法糖」说的是原型模型等价，「不只是」说的是这层语义收紧。

- 加分项：工程影响最实际的是不可枚举——Object.keys 与 `{...instance}` 不会把方法拷出去，这也让 class 实例更容易安全地做 structuredClone 之外的数据提取。

## 延伸阅读

- 属性是怎么被继承的：原型链查找
- 手写 bind 时，new 为什么能「打败」它？
