# 为什么 tree-shaking 摇不动 CJS？

*类型：knowledge ｜ 难度：进阶 ｜ 标签：webpack、tree-shaking、ESM、CommonJS ｜ 更新：2026-09-08*

**因为 tree-shaking 的前提是不执行代码就能分析出依赖，而 CJS 做不到：`require()` 是运行时函数调用，可以放进 if、可以拼路径、`module.exports` 可以被任意改写——打包器不敢断言「这个导出没人用」。ESM 的 import/export 是语法声明，编译期就有一张静态可达图。真正删除靠三层机制配合：`sideEffects`（整模块跳过）、`usedExports`（标记未用导出）、`/*#__PURE__*/`（语句级提示），最后由生产模式的 Terser + 模块拼接完成物理删除。**

> **前置：** 本篇讨论的是依赖图的「利用」：图必须先做到静态，删除、拼接这些优化才有立足点。参见《构建工具到底解决了什么问题？》。

## 「静态」到底指什么

ESM 与 CJS 的分野不在「写法新旧」，而在**依赖关系确定的时机**。ESM 的 import/export 是语法层面的声明：import 语句只能出现在顶层、模块说明符是字符串字面量、导出的名字在编译期全部可见——引擎不执行任何代码，整张「谁导入谁、用了哪个导出」的可达图就已经确定。CJS 的 require 是普通函数调用：可以放进 if 分支、可以拼出路径、可以把 `module.exports` 改写成任意形状甚至运行时再决定——这些全部合法，也全部让「静态分析」失效。webpack 官方的表述一针见血：tree-shaking 依赖的是 **ES2015 模块语法的静态结构**（据 webpack.js.org《Tree Shaking》）。

推论一：babel 把 ESM 转译成 CJS（@babel/preset-env 的历史默认行为）等于亲手拆掉 tree-shaking 的地基——这也是现代配置必须把 modules: false 交给打包器处理的原因。推论二：TS 同理，isolatedModules 之外的那些「类型层面动态导出」技巧，落地到 JS 时若变成动态形状，同样摇不动。「静态」不是道德要求，是删除操作的安全前提：只有「编译期可证明没人用」的代码，删了才不改变行为。

## 三层删除机制：各管一段

「摇树」不是单一开关，而是三层提示各管一个粒度，最后交给压缩器执行。 webpack 官方文档对三者效力的排序很明确：sideEffects 最有效（能整棵跳过模块与子树），usedExports 靠 Terser 兜底且较吃力，PURE 注释精确到单条语句。

| 三层机制 / shaking layers | 作用粒度 | 谁执行删除 | 典型用法 |
| --- | --- | --- | --- |
| sideEffects（package.json 字段） | 整模块/整棵子树 | webpack（跳过评估） | 声明本包无副作用文件，未用模块直接不入图 |
| usedExports（优化开关） | 单个导出绑定 | 标记 + Terser 删除 | production 模式自带，标记 unused harmony export |
| `/*#__PURE__*/`（代码注释） | 单条函数调用语句 | Terser | 标记调用无副作用，返回值没人用就可删（5.107+ 另有 NO_SIDE_EFFECTS 标注整个函数声明） |

sideEffects 的语义值得单独强调：它声明的是「导入这个文件，除导出绑定外不产生任何可观察行为」。CSS 导入、polyfill、CSS-in-JS 的运行时注册，全是「导入即生效」的典型反例——所以官方示例的豁免写法是数组：`["**/*.css", "./src/polyfill.js"]`。而 usedExports 之所以「吃力」，webpack 的解释是：规范要求模块的副作用必须被评估，它无法像 sideEffects 那样直接跳过依赖子树，只能在保留评估的前提下标记无用的导出绑定（据 webpack.js.org）。

副作用声明正误对照：

```json
// 反例：package.json
{ "sideEffects": false }
// 但项目里还有：
import "./reset.css";
import "./polyfill";
/* CSS/polyfill 被 "无副作用" 摇掉了 */
```

问题：一刀切 false 会把「导入即生效」的文件摇没，且不报错——上线才发现样式丢失。

```json
// 正例：package.json
{
  "sideEffects": [
    "**/*.css",
    "./src/polyfill.js"
  ]
}
/* 其余模块按无副作用摇树
   豁免名单保留必须执行的导入 */
```

说明：声明豁免清单：副作用语义要精确，tree-shaking 才敢放心删。

## 生产模式的最后一环

前三层只做了「标记」，物理删除发生在生产模式：`mode: production` 打开 Terser 压缩，把 marked as unused 的导出从代码里真正抹掉；同时 `ModuleConcatenationPlugin`（同样是生产模式自带）把相互依赖的 ESM 模块拼接进同一个作用域（scope hoisting）——没有拼接，每个模块套一层模块包装函数，跨模块的「导出没人用」就隔着一层函数边界，分析器看不穿。

这也解释了一个经典疑问：「为什么我配了 sideEffects，dev 模式下代码还在？」——三层机制有两层（Terser 删除、模块拼接）只在生产模式生效。验证 tree-shaking 是否真的生效，要以生产构建的产物为准，在产物里搜导出名（或搜 unused harmony 注释的消失），而不是看 dev 页面的行为。

## 经典追问链

CJS 与 ESM 正误对照：

```js
// 反例：utils.cjs
module.exports = { a, b }; // 运行时才知道取谁
const { a } = require("./utils.cjs");
```

问题：CommonJS 导出是运行时对象，打包器不敢删任何东西。

```js
// 正例：utils.mjs
export const a = 1;
export const b = 2; // 静态可分析
import { a } from "./utils.mjs"; // b 被摇掉
```

说明：ESM 的导入导出编译期可判定，tree-shaking 才有得摇。

## 追问链

**tree-shaking 为什么对 CommonJS 无效？「静态」到底指什么？**（考模块系统的本质差异——「require 是运行时函数调用」这句能展开的人，模块理解才算过关。）

- CJS 的依赖关系在运行时才确定：require 可以放进 if、可以拼路径、module.exports 可以被任意改写——打包器不执行代码就无法断言「某导出没人用」，自然不敢删。ESM 的 import/export 是语法声明：import 语句只能出现在顶层、绑定的名字在编译期可见，「哪些导出被谁用」是一张静态可达图，标记 usedExports 后可达图之外的导出即可安全删除。「静态」指的就是「不执行代码即可分析出依赖」。
- 延伸：边界案例——export 的名字被动态拼接或做了计算后导出，静态分析同样失效——这也是为什么库作者要避免动态导出。

**sideEffects、usedExports、`/*#__PURE__*/` 三者怎么分工？效力排序的依据是什么？**（考三层机制的粒度模型——只背「都要配」的人说不清谁在什么阶段删了什么。）

- 粒度从大到小：sideEffects 声明在 package.json，作用于模块级——未用到的无副作用模块整棵不入图（官方明确它最有效，因为能跳过子树）；usedExports 是编译期分析，作用于导出绑定级——在模块上标记哪些导出没被引用，删除交给 Terser；PURE 注释作用于语句级——告诉 Terser 这条调用语句无副作用，返回值没人用就整条删。效力排序的依据是「跳过的范围」：整子树 > 单导出 > 单语句，越靠前越省，越靠后越精确。
- 延伸：webpack 5.107+ 新增 `/*#__NO_SIDE_EFFECTS__*/` 标注整个函数声明，5.108 起跨模块传播——PURE 的模块级升级版。

**为什么生产模式才能真正删掉代码？dev 模式下三层机制去哪了？**（考「标记」与「执行」的分离——能说清 Terser 与模块拼接角色的，配置观就不再玄学。）

- sideEffects 的模块跳过在编译期就生效（dev 也一样），但 usedExports 只是「打标」，删除由 Terser 在压缩时执行，而跨模块的删除依赖 ModuleConcatenationPlugin 把 ESM 拼进同一作用域——这两件事都是 production 模式的默认项。所以 dev 下「代码还在」不代表摇树没生效，只是删除环节没开。验证以生产产物为准：搜导出名、看 unused harmony 标记是否消失。
- 延伸：scope hoisting 的附带收益：消除模块包装函数的调用开销、让跨模块的常量内联成为可能——它不只是 tree-shaking 的配角。

**barrel file（index.js 全量 re-export）对 tree-shaking 的影响是什么？**（工程实践题——「摇树到底摇没摇」很多时候卡在 barrel 上，答得出机制才算踩过坑。）

- barrel 让所有使用方都经过同一个 index.js：一来构建时要把 barrel 指向的所有模块都解析、转换一遍（哪怕你只用一个函数），构建变慢；二来如果 barrel 链上有带副作用的模块，sideEffects 声明不当时整串都会被拉进图。导出本身如果都是纯 ESM 静态导出，最终产物仍能被摇干净——所以「影响摇树正确性」是有条件的，但「拖慢构建、放大副作用风险」是无条件的。按需直连深路径（import x from 'lib/utils/x'）是最稳的用法。
- 延伸：工具侧的缓解：webpack 5.87+ 的 nested tree-shaking 与部分导出分析在改善 barrel 场景，但「别写万桶」依然是第一原则。

**ESM 的 live binding（导出绑定是活的）会和 tree-shaking 冲突吗？**（辨析压轴题，把「静态」与「不可变」两个概念分开——混淆这两者的人会得出「ESM 也能摇不动」的错误推论。）

- 不冲突，因为「静态」说的是「绑定关系编译期可确定」，不是「值不可变」。export let count，导入方读 count 拿到的永远是最新值——绑定是活的；但「谁导出了 count、谁导入了 count」在语法层面写得明明白白，可达图照样静态。tree-shaking 删除的条件是「绑定没人引用」，与值变不变无关。真正让静态性失效的是「绑定的形状运行时才确定」（动态拼接导出名、运行时改写导出对象）——那才是摇不动的原因。
- 延伸：推论——const 导出并不比 let 导出「更好摇」；库作者选择 const 是 API 纪律，不是打包优化。

## 延伸阅读

- 《构建工具到底解决了什么问题？》——本篇讨论的是依赖图的「利用」，图必须先做到静态。
- 《HMR 是怎么做到只替换一块代码的？》——静态图不止能删：增量更新同样建立在「模块 ID 稳定」的图上。
- 《Loader 与 Plugin 的分界线在哪里？》——usedExports 这类分析与标记能力，正是通过构建过程的钩子体系实现的。
