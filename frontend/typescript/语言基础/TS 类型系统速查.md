# TS 类型系统速查

*类型：knowledge ｜ 难度：进阶 ｜ 标签：TypeScript、类型系统*

**结论：TS 类型系统的常考常错点集中在「容易混淆的双胞胎」上。顶层类型选 `unknown` 不选 `any`（用前必须收窄，安全版的 any）；`never` 是空集，在联合类型中被自动消除。原始类型对：`bigint` 与 `number` 不兼容需显式转换；`Symbol()` 只能函数调用、`new` 直接报错；`object` 只收引用类型，大写 `Object` 几乎啥都收、不推荐用。类型体操三件套：模板字符串类型在类型层拼字面量联合、`typeof` 在类型层拿变量类型、`T[number]` 索引访问提取元素类型。数组与元组：只读三种写法（`readonly`、`ReadonlyArray`、`as const`），元组五连——基本形态、可选成员只能后置、`...` 展开、成员别名、`['length']` 拿长度。函数类型六种写法、重载先签名后实现；`readonly` 修饰单个属性、`Readonly<T>` 批量只读，两者都是浅层；严格字面量检查只拦「直接赋值的对象字面量」，变量中转即可绕过；`interface` 支持声明合并、`type` 通吃所有类型——公共 API 用 interface，内部复杂类型用 type。**

## 顶层安全：any、unknown、never

| 类型 | 含义 | 赋值限制 | 使用限制 |
|------|------|----------|----------|
| `any` | 任意类型，关闭类型检查 | 可赋给任何类型 | 无限制，不安全 |
| `unknown` | 未知类型，类型安全的 `any` | 只能赋给 `unknown` / `any` | 使用前必须做类型收窄 |
| `never` | 永不存在的值（空集） | 可赋给任何类型 | 没有值能赋给它 |

```ts
// any：跳过类型检查，危险
let a: any = 42;
a.foo(); // 不报错，运行时可能崩溃

// unknown：使用前必须收窄
let u: unknown = "hello";
if (typeof u === "string") {
  u.toUpperCase(); // OK
}

// never：函数永不返回（抛出异常或死循环）
function fail(msg: string): never {
  throw new Error(msg);
}

// never 在联合类型中会被消除（空集是任何集合的子集）
type T = string | never; // => string
```

## 原始类型三组辨析

### bigint 与 number 不兼容

`bigint` 和 `number` 是两种独立的原始类型，不能混用；`bigint` 用于表示超过 `Number.MAX_SAFE_INTEGER` 的整数。

```ts
const big: bigint = 100n;
const num: number = 100;

// big + num; // Error: 不能混合运算
const result = big + BigInt(num); // 需要显式转换

// 字面量类型：同一个数，写不写 n 类型就不同
const x = 9007199254740991n; // bigint
const y = 9007199254740991;  // number
```

### Symbol 只能函数调用

- `Symbol()` 是函数调用，返回一个唯一的 symbol 值
- `new Symbol()` 是构造函数调用，会报错

```ts
const s1 = Symbol("desc"); // OK，类型为 symbol
const s2 = Symbol("desc");
s1 === s2; // false，每次调用都唯一

// new Symbol(); // TypeError: Symbol is not a constructor

// unique symbol：必须用 const 声明
const s3: unique symbol = Symbol();
// let s4: unique symbol = Symbol(); // Error，必须用 const
```

### object 与 Object

| 类型 | 含义 |
|------|------|
| `object` | 小写，表示所有非原始类型（引用类型） |
| `Object` | 大写，几乎所有值都能赋给它（包括原始类型），因为原始类型有包装对象 |

```ts
// object：只接受引用类型
let o: object = {};      // OK
let o2: object = [];     // OK
// let o3: object = 42;  // Error

// Object：接受几乎所有值，null/undefined 除外（不推荐使用）
let O: Object = 42;      // OK（number 有包装对象）
let O2: Object = "str";  // OK
// let O3: Object = null; // Error

// 实践中推荐用 Record<string, unknown> 或具体接口代替
```

## 类型层字符串：模板字符串类型

TypeScript 支持在类型层面使用模板字符串，可以组合和生成字符串字面量类型。

```ts
type Direction = "top" | "bottom" | "left" | "right";
type CSSProperty = `margin-${Direction}`;
// => "margin-top" | "margin-bottom" | "margin-left" | "margin-right"

type EventName = "click" | "focus";
type Handler = `on${Capitalize<EventName>}`;
// => "onClick" | "onFocus"

// 嵌套组合：两组联合做笛卡尔积
type Row = 1 | 2 | 3;
type Col = "a" | "b" | "c";
type Cell = `${Row}-${Col}`;
// => "1-a" | "1-b" | "1-c" | "2-a" | ...
```

## typeof 的两副面孔

`typeof` 在 TS 中有两种用途：

- 运行时（JavaScript 原有行为）：返回字符串，用于类型守卫
- 类型层面（TypeScript 扩展）：获取变量/函数的类型

```ts
typeof "hello" // => "string"（运行时）

const config = { host: "localhost", port: 3000 };
type Config = typeof config;
// => { host: string; port: number }

function greet(name: string) { return `Hello, ${name}`; }
type GreetFn = typeof greet;
// => (name: string) => string

// 常与 ReturnType、keyof 配合使用
type Keys = keyof typeof config; // => "host" | "port"
```

## 索引访问：Names[number] 提取元素类型

```ts
const colors = ["red", "green", "blue"] as const;
type Color = typeof colors[number];
// => "red" | "green" | "blue"

// 普通数组类型同理
type Arr = string[];
type Item = Arr[number]; // => string

// 对象类型用 keyof 获取键，用 T[keyof T] 获取值类型的联合
type Obj = { a: number; b: string };
type Values = Obj[keyof Obj]; // => number | string
```

## 只读数组的声明方式

```ts
// 方式一：readonly 修饰符
const arr1: readonly number[] = [1, 2, 3];

// 方式二：ReadonlyArray 泛型
const arr2: ReadonlyArray<number> = [1, 2, 3];

// 方式三：as const 断言（最严格，元素类型也变为字面量）
const arr3 = [1, 2, 3] as const;
// 类型为 readonly [1, 2, 3]，而非 readonly number[]

// arr1.push(4);  // Error
// arr1[0] = 10;  // Error
```

`as const` 会递归地将所有属性变为 `readonly`，且值类型收窄为字面量类型。

## 数组与元组

### 基本区别

| 特性 | 数组 `T[]` | 元组 `[T, U]` |
|------|-----------|--------------|
| 长度 | 不固定 | 固定 |
| 元素类型 | 所有元素同类型 | 每个位置类型独立 |
| 语义 | 同类数据集合 | 有结构的有序数据 |

```ts
// 数组：长度不定，元素同类型
const arr: number[] = [1, 2, 3, 4];

// 元组：长度固定，每个位置类型明确
const tuple: [string, number, boolean] = ["Alice", 30, true];
tuple[0]; // string
tuple[1]; // number
```

### 可选成员：只能后置

元组中可以用 `?` 标记可选成员，但只能放在末尾。

```ts
type Point = [x: number, y: number, z?: number];

const p1: Point = [1, 2];    // OK
const p2: Point = [1, 2, 3]; // OK

// 可选成员必须在必选成员之后
// type Bad = [x?: number, y: number]; // Error
```

### 展开运算符与可变元组

元组支持 `...` 展开其他元组或数组类型，用于组合和可变参数。

```ts
type Head = [string, number];
type Tail = [boolean, Date];
type Combined = [...Head, ...Tail];
// => [string, number, boolean, Date]

// 可变参数元组（rest 元素）
type StringsAndNumber = [...string[], number];
// 任意数量的 string，最后一个是 number

// 函数参数中使用
function log(...args: [string, ...number[]]): void {
  console.log(args[0], args.slice(1));
}
log("values:", 1, 2, 3); // OK
```

### 成员别名：不影响兼容性

元组成员可以添加标签（别名），提升可读性，不影响类型兼容性。

```ts
type Color = [
  red: number,
  green: number,
  blue: number
];

type Range = [start: number, end: number];

// 有别名和无别名的元组类型兼容
const c: Color = [255, 128, 0];
const r: [number, number] = c; // OK，别名不影响结构兼容
```

### 提取元组元素的类型

与数组相同，使用索引或 `[number]`。

```ts
type RGB = [red: number, green: number, blue: number];

type First = RGB[0];  // number
type Second = RGB[1]; // number

// 获取所有元素类型的联合
type AnyElement = RGB[number]; // number

// 获取元组长度（字面量类型）
type Len = RGB["length"]; // 3
```

## 函数类型：六种写法与重载

### 函数类型的写法

```ts
// 方式一：函数声明
function add(a: number, b: number): number {
  return a + b;
}

// 方式二：函数表达式
const add2 = function(a: number, b: number): number {
  return a + b;
};

// 方式三：箭头函数
const add3 = (a: number, b: number): number => a + b;

// 方式四：type 定义函数类型
type AddFn = (a: number, b: number) => number;
const add4: AddFn = (a, b) => a + b;

// 方式五：interface 定义（可描述重载）
interface AddInterface {
  (a: number, b: number): number;
}

// 方式六：泛型函数
const identity = <T>(x: T): T => x;
```

### 函数重载

TypeScript 函数重载需要先写多个重载签名，再写一个实现签名。

```ts
// 重载签名（只声明，不实现）
function format(value: string): string;
function format(value: number, decimals: number): string;

// 实现签名（必须兼容所有重载）
function format(value: string | number, decimals?: number): string {
  if (typeof value === "string") {
    return value.trim();
  }
  return value.toFixed(decimals ?? 2);
}

format("hello ");   // OK => "hello"
format(3.14159, 2); // OK => "3.14"
// format(3.14);    // Error，不匹配任何重载签名
```

实现签名对外不可见，调用时只能匹配重载签名。

## readonly 与 Readonly<T>

| | `readonly` | `Readonly<T>` |
|---|---|---|
| 类型 | 关键字修饰符 | 内置工具类型 |
| 作用范围 | 修饰单个属性或数组 | 将对象所有属性变为只读 |
| 深度 | 浅层 | 浅层（非递归） |

```ts
// readonly：修饰单个属性
interface User {
  readonly id: number;
  name: string;
}

// Readonly<T>：批量将所有属性变为只读
type ReadonlyUser = Readonly<User>;
// => { readonly id: number; readonly name: string }

// 注意：两者都是浅层只读
interface Nested {
  inner: { value: number };
}
type R = Readonly<Nested>;
// inner 本身只读，但 inner.value 仍可修改

// 深度只读需要递归工具类型
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
```

## 严格字面量检查与结构类型

结构类型原则（鸭子类型）：类型兼容性基于结构，而非名称。

```ts
interface Point { x: number; y: number; }

const p = { x: 1, y: 2, z: 3 }; // 多一个属性
const point: Point = p;         // OK，结构兼容
```

严格字面量检查（Fresh Object Check）：直接赋值对象字面量时，不允许有多余属性。

```ts
// 直接赋值字面量 => 触发严格检查
const point2: Point = { x: 1, y: 2, z: 3 }; // Error: 不允许多余属性

// 通过变量中转 => 绕过严格检查（结构兼容即可）
const obj = { x: 1, y: 2, z: 3 };
const point3: Point = obj; // OK
```

严格字面量检查只在对象字面量**直接赋值**时触发，目的是防止拼写错误。

## interface 与 type

| 特性 | `interface` | `type` |
|------|------------|--------|
| 声明合并 | 支持（同名自动合并） | 不支持（重复声明报错） |
| 扩展语法 | `extends` | `&`（交叉类型） |
| 描述范围 | 只能描述对象/函数/类 | 可描述任意类型（联合、元组、原始类型等） |
| 计算属性 | 不支持 | 支持（映射类型） |
| 错误提示 | 通常更友好 | 复杂类型可能较难读 |

```ts
// interface 声明合并
interface Window { title: string; }
interface Window { width: number; }
// 合并为 { title: string; width: number }

// type 不能重复声明
// type Foo = string;
// type Foo = number; // Error

// type 可以描述联合类型
type ID = string | number;
type Callback = () => void;
type Pair = [string, number];

// 扩展方式
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

type AnimalType = { name: string };
type DogType = AnimalType & { breed: string };
```

实践建议：公共 API 和库类型用 `interface`（支持扩展合并）；内部类型、联合/元组等复杂类型用 `type`。

## 延伸阅读

- 前端实际用得到多少 TS 功能？
- .d.ts 声明文件到底解决什么问题？
