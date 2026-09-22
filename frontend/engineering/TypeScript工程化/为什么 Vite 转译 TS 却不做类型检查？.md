# 为什么 Vite 转译 TS 却不做类型检查？

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vite、esbuild、Oxc、类型检查、Webpack ｜ 更新：2026-09-10*

**不是「Vite 偷懒」，是分工使然：转译不需要懂类型（把类型标注当文本抠掉即可），检查需要全程序模块图（最贵的部分，且对产出 JS 零贡献）。Vite 官方口径毫不含糊：只转译、不检查。检查的责任外包给 build script 里的 `tsc -b`——先审计、后打包。理解了这个分离，「dev 时类型错误页面照样跑」就不再是 bug，而是设计。**

## 规格定义

```text
Vite 官方文档 · Features

"Vite only performs transpilation on .ts files and does NOT perform
 type checking… type checking requires knowledge of the entire module
 graph."
```

## 三个理由：为什么不用 tsc 当转译器

1. **速度**：dev server 的契约是「每个文件请求毫秒级返回」。tsc 是单线程 JS 全程序分析，冷启动以秒计；esbuild/Oxc 是原生并行单文件转换，快一到两个数量级；
2. **职责上不需要**：转译只要求「剥类型」，不要求「懂类型」——懂类型是全程序推断，是整条链最贵的部分，且对产出 JS 毫无贡献。检查已经外包给 build script 里的 tsc；
3. **形态不对**：tsc 是批处理 CLI（读项目→产文件），dev server 需要「给一个文件、还一个字符串」的转换服务——接口形态都不匹配。

顺便校准一个正在发生的换角：Vite 6/7 时代的转译器是 esbuild（Go），Vite 8 起官方文档已换成 Oxc Transformer（Rust）。但「只转译、不检查」的岗位描述一字未变——**岗位和演员要分开看**，这也再次印证三角色模型里的分工是结构性的，不绑定任何具体工具。

```text
Vite 转译层换角 / the transformer seat

Vite 4-7 ──► esbuild 负责逐文件 TS/JSX 转译，
             并承担依赖预构建与压缩

Vite 8+ ───► 官方文档：转译由 Oxc Transformer（Rust）承担——
             更快，岗位描述不变
```

- Vite 4-7：esbuild 负责逐文件 TS/JSX 转译，并承担依赖预构建与压缩；
- Vite 8+：官方文档——转译由 Oxc Transformer（Rust）承担——更快，岗位描述不变。

## dev 请求的一生：检查员全程缺席

把「类型错误页面照样跑」放到一次真实的请求生命周期里看，缺席的是谁一目了然：

```text
一次 dev 请求 / request lifecycle

① 浏览器请求 /src/main.tsx
   dev server 无打包、按需 serve——每个文件一个请求。
② 命中 TS，交给转译器
   单文件视角：此刻它不知道、也不关心项目里还有谁。
③ 剥类型，产出纯 JS
   类型标注当注释抠掉；enum 展开、JSX 转换——原生并行的毫秒级操作。
④ 返回浏览器执行
   Vite 文档口径：HMR 级别的更新在 50 毫秒内反映到浏览器。
⑤ 类型检查员缺席
   tsc -b 不在 dev 管线里，tsserver 只服务编辑器——红线与拦截都不来自这条链。
```

- ① 浏览器请求 /src/main.tsx——dev server 无打包、按需 serve，每个文件一个请求；
- ② 命中 TS，交给转译器——单文件视角，此刻它不知道、也不关心项目里还有谁；
- ③ 剥类型，产出纯 JS——类型标注当注释抠掉，enum 展开、JSX 转换，原生并行的毫秒级操作；
- ④ 返回浏览器执行——HMR 级别的更新在 50 毫秒内反映到浏览器；
- ⑤ 类型检查员缺席——tsc -b 不在 dev 管线里，tsserver 只服务编辑器。

## 转译器的能力与硬边界

「不做检查」不等于「只会删字」。转译器对 TS 特性的处理分两档：不需要类型信息的都干——包括代码生成（enum 展开成运行时对象、namespace 转换、装饰器展开）；需要类型信息的一概不干。官方文档点名的两个硬边界：`emitDecoratorMetadata`（要把参数的静态类型塞进运行时，必须先做类型推断）和产出 `.d.ts`（要先算出类型面才能描述）。const enum 的跨文件内联同理——而且它的两档行为值得单独点名：ambient const enum 在 `isolatedModules` 下直接报 TS1209（纯类型构造留到运行时必炸，编译期就拦）；普通跨文件 const enum 则隐蔽得多——被单文件转译器静默降级成普通 enum，不报错，但内联消失、运行时多出枚举对象。

```text
三份工的归属变迁 / who does the jobs

Vite 4-7 ──► esbuild 一人分饰三角：transform 逐文件转译、
             optimizeDeps 依赖预构建、minify 产物压缩

Vite 8+ ───► 依赖里已无 esbuild——bundle / minify / transform
             全部由 rolldown（内含 oxc）承担，esbuild 仅剩可选 peer 位置
```

- Vite 4-7：esbuild 一人分饰三角——transform 逐文件转译、optimizeDeps 依赖预构建、minify 产物压缩；
- Vite 8+：依赖里已无 esbuild——bundle / minify / transform 全部由 rolldown（内含 oxc）承担，esbuild 仅剩可选 peer 位置。

对照本仓库 node_modules/vite 的 package.json（8.2.2）：dependencies 已无 esbuild，只剩 rolldown 等；esbuild 降级为可选 peerDependency。

| 能力 | 在 Vite 里的用途 |
| --- | --- |
| Transform | dev 逐文件 TS/JSX 转译（本篇主角）——esbuild 时代由 esbuild 承担，Vite 8 起由 oxc 承担 |
| Bundle | 依赖预构建 optimizeDeps：把 node_modules 的 CJS 包转 ESM、合并成单文件减少请求数 |
| Minify | 构建产物的代码压缩 |
| Serve | esbuild 自带简陋 dev server——Vite 从未使用，自研了完整的 dev 层 |

## Webpack 的殊途同归

webpack 本体不认识 .ts，必须配 loader，历史上三条路：

- ts-loader（内部真调 tsc API，检查加转译一体，全程序检查串行挂在打包关键路径上，慢；开 `transpileOnly` 退化成只剥类型）；
- babel-loader + preset-typescript（剥类型）；
- swc-loader（Rust 版，更快）。

配套的 `fork-ts-checker-webpack-plugin` 起独立子进程异步跑 tsc——报错不阻塞打包。

| 对比 | 一体式：ts-loader 默认 | 分离式：loader + fork-ts-checker |
| --- | --- | --- |
| 类比 | 把校验写成同步触发器挂在写入路径上 | 写入全速跑，异步审计另行报账 |
| 检查时机 | 打包关键路径内串行 | 独立子进程并行 |
| 速度 | 慢——全程序分析阻塞打包 | 快——转译与检查互不等待 |
| 终态 | （开 transpileOnly 后）退化成分离式 | 与 Vite 的天生分离完全一致 |

所有 bundler 生态十年演化的终点是同一条：**转译交给快转换器，检查交给慢检查器，两者解耦、异步、并行**。Vite 只是出生就在终态，Webpack 是演化到了终态。

## 陷阱：转译器视角反噬 tsconfig

**dev 链上没有检查员（no checker on dev chain）**

```ts
// 反例：dev 页面正常 → 认为类型没问题
const user: User = { name: "a", age: "x" };
// age 类型错了：页面照跑，控制台安静
```

- dev 管线只有剥类型转译器在场——「能跑」不构成类型背书；红线来自编辑器、拦截来自 build script，都不在这条链上。

```bash
# 正例：检查在另外两条链上
tsc -b                 # 构建门禁
# 编辑器 tsserver 实时红线
```

- dev 时想要类型反馈，另开 tsc --noEmit --watch 或用 vite-plugin-checker 投到浏览器。

**transpileOnly 裸奔（checkerless pipeline）**

```js
// 反例：webpack 只求快——开了 transpileOnly
{
  test: /\.ts$/,
  use: {
    loader: "ts-loader",
    options: { transpileOnly: true }
  }
}
// 没配 fork-ts-checker → 全程无人检查类型
```

- 转译与检查解耦后，检查必须另有归属——否则项目处于零检查状态，类型错误一路漏进产物。

```js
// 正例：剥类型与审计拆成两条通路
{ loader: "ts-loader", options: { transpileOnly: true } },
new ForkTsCheckerWebpackPlugin() // 独立子进程异步审计
```

- 报错不阻塞打包，但一定会在 CI 前暴露——与 Vite 的天生分离同构。

单文件视角还会反噬配置：`import { Foo }` 分不清是值还是类型，转译器只能保守保留——纯类型导入可能运行时报「没有这个导出」。这是 `verbatimModuleSyntax` 强制 `import type` 的存在动机；它与 `isolatedModules` 的关系、Vite 模板为何预配，完整深拆见「tsconfig 的一份配置到底谁在读？」一篇。

**单文件视角的纪律（explicit type imports）**

```ts
// 反例
import { UserConfig } from "./config"
```

- 纯类型导入不带显式标记——转译器分不清值与类型，只能保守保留整个 import，运行时可能炸出「no exported member」。

```ts
// 正例
import type { UserConfig } from "./config"
```

- 显式 type 标记：编辑期就把歧义消掉，转译器放心擦除——本仓库 verbatimModuleSyntax 已开启。

## 追问链

四问从缺席现象挖到生态终态：核心始终是「转译与检查可分离」这一条。

**1. dev 时写出类型错误，为什么页面照样跑？**

考察点：本篇的现象级问题——答「Vite 宽容」的人还没建立管线视角。

因为 dev 管线里只有剥类型转译器在场：它把 .ts 当文本抠掉类型标注返回 JS，看不出任何类型错误。红线来自编辑器的 tsserver，拦截来自 build script 的 tsc -b——dev 链路上两个检查员都不在。

**2. esbuild 为什么那么快？**

考察点：区分「语言快」和「设计快」——只答 Go 的人漏了更重要的一半。

Go 只是前提。设计上的四个决定更关键：全核并行、零第三方依赖全自研（数据结构自己造）、AST 只过一遍（解析一次打印一次）、单文件视角（不做任何跨文件分析，天然可并行切片）。Oxc 在 Rust 上复刻了同一套设计哲学。

**3. const enum 为什么被称为单文件转译器的毒药？**

考察点：「需要类型信息的活儿转译器干不了」的最佳试金石——内联看似不需要类型，其实需要全程序。

const enum 的使用点要内联成字面量：a.ts 里的 Color.Red 要变成 0，必须知道 b.ts 里的定义——跨文件知识。单文件转译器看不见 b.ts，行为分两档：ambient const enum（declare const enum）在 isolatedModules 下直接报 TS1209——纯类型构造留到运行时必然炸，编译期就拦住；普通跨文件 const enum 则被静默降级成普通 enum——不报错，但内联消失、运行时多出枚举对象。这是「不需要类型信息」和「需要全程序信息」的分界案例。

补充：降级那档最危险——tsc 检查照过、运行时行为也「对」，只有产物体积与内联优化悄悄变化，排查方法是看构建产物里有没有枚举对象；ambient 档报的 TS1209 则把问题挡在编译期。

**4. Webpack 生态是怎么收敛到和 Vite 相同终态的？**

考察点：演化视角——终态的一致性证明「转译/检查分离」是结构性规律而非某家工具的设计品味。

webpack 从一体式 ts-loader（tsc API 检查加转译，串行挂打包路径）演化出两条退路：transpileOnly 退化成只剥类型，再配 fork-ts-checker 独立子进程异步审计。演化终点和 Vite 的天生分离完全一致——快转换器管剥，慢检查器管查，异步并行。

补充：工程启示——当你想把慢检查塞进快管线时，正确动作不是硬塞，而是拆成两条异步通路——这个模式同样适用于 lint、格式化等一切「贵但必要」的环节。

## 记忆锚点

- **转译不需要懂类型**：剥类型 = 抠注释。检查才需要全程序模块图——把最贵的部分隔离在 dev 管线之外，是速度的来源。
- **先审计后打包**：tsc -b 拦截并缓存，转译器信任上游只管快——「未经审计的字节」不应该出现在你的 build script 里。

## 延伸阅读

前置阅读：

- TypeScript 在工程里到底扮演什么角色？——本篇展开三角色模型中的第三角色（剥类型转译器），并把「为什么不用 tsc 当转译器」讲透。

后续阅读：

- tsconfig 的一份配置到底谁在读？——verbatimModuleSyntax 的完整深拆在这篇——一份 tsconfig 被三类读者裁剪阅读的地图。
- 编辑器的 TS 智能是怎么来的？——dev 补检方案之外，编辑器实时红线的完整原理链。
