# TypeScript 工程化

## 1. TypeScript 在工程里到底扮演什么角色？

*难度：进阶 ｜ 标签：TypeScript、tsc、tsserver、esbuild、编译原理*

**TypeScript 在工程里不是「一个工具」，是三个各自独立的程序**：跑批审计的 `tsc`（读全项目、报类型错误、可产出声明文件）、常驻编辑器内存的语言服务 `tsserver`（画红线、给补全、不参与构建）、以及只剥类型不做检查的转译器（`esbuild` / Oxc / swc / babel）。一条铁律贯穿始终：**运行时没有 TS，构建产物里也没有 TS**。由此得到分工公式——**esbuild 管字节，tsc 管真理**：要「快产出」找剥类型转译器，要「对不对」找类型检查器。

### 一条铁律：运行时没有 TS

浏览器和 Node 执行的永远是纯 JavaScript。`const x: number = 1` 经过转译后就是 `const x = 1`——类型标注不是被「优化掉」，而是**根本不进入产物**。接口、泛型、类型别名这些纯类型结构在转译时被整体擦除；enum 这类「带运行时身体」的 TS 特性，转译器也会把它展开成普通对象再交出去。产物里找不到任何类型的痕迹，这是理解一切 TS 工程问题的起点。

由此立刻得到两个推论：

- 第一，**类型检查是纯粹的编译期行为**——它发生在你按下保存、跑下构建的时刻，运行时零参与，所以「TS 影响运行时性能」这类担忧不成立；
- 第二，**检查和转译是两件可以完全分离的事**——把类型标注从文本里抠掉不需要懂类型，正如 minifier 抠除注释不需要读懂代码逻辑，两者剥掉的都是纯编译期的元数据层。这正是现代工具链把「转译」交给快工具、把「检查」留给慢工具的合法性来源。

你在 dev 页面上写出类型错误、页面照样跑，就是这个分离的直接体现：dev 管线里只有转译器在场。

### 三个程序，三份职责

把 TypeScript 仓库的产物拆开看，它同时是三个程序：命令行编译器 `tsc`、语言服务 `tsserver`，以及生态里一堆「只剥类型」的第三方转译器。前两者共享同一个类型内核（同一个代码库导出的两个入口），第三个是彻底的外人——它不 import TypeScript 包，对类型一无所知。

| 维度 | 类型内核（tsc / tsserver） | 剥类型转译器（esbuild / Oxc / swc） |
|------|--------------------------|-----------------------------------|
| 输入视角 | 全程序：读整个模块图 + 全部声明文件 | 单文件：把 .ts 当文本逐个处理 |
| 要不要懂类型 | 要——全程序类型推断是最贵的部分 | 不要——把类型标注当注释抠掉即可 |
| 速度特征 | 秒到分钟级（无法按文件并行切片） | 毫秒级/文件（Go/Rust 全核并行） |
| 产出 | 错误清单、.d.ts、增量缓存 | 剥净类型的纯 JS |
| 失败后果 | 能挡住构建（门禁） | 永不拦截——它看不出类型错误 |

- **tsc 是跑批的审计员**：读完整的 tsconfig、解析整个模块图、加载所有依赖声明，然后全量报告类型错误——就像发布流程里的 QA 审计：全量检查、只报问题、（在 `noEmit` 模式下）不改货。跑批天然适合做门禁：审计不过，后面的打包就不该发生。
- **tsserver 是内存里的实时查询**：编辑器启动一个独立进程养着它，通过 JSON-RPC 随时提问——「这行有没有错」「这里能补全什么」「这个符号跳到哪」——它在内存里对项目做一次常驻的增量编译，用回答喂养编辑器的红线、补全、跳转。数据库做个锚点：tsserver 之于 tsc，如同常驻连接的实时查询之于定时跑批——同一个 schema（tsconfig），两种消费形态。
- **剥类型转译器是管线里的无状态转换函数**：类型被当作注释忽略，这就是它的全部工作哲学。

esbuild 官方文档对它的工作方式说得很直白：

> TypeScript types are treated as comments and are ignored by esbuild… esbuild does not do any type checking, so you will still need to run `tsc --noEmit` in parallel with esbuild to check types.（esbuild 官方文档 · content types）

但「不做检查」不等于「只会删字」：enum 展开、装饰器展开这类代码生成照做。它的硬边界只有一条——**需要类型信息的活儿一概不干**，典型是 `emitDecoratorMetadata` 与产出 `.d.ts`——前者要把参数的静态类型塞进运行时，后者要先算出类型面才能描述。

一个源文件的三条去向：

```text
                  ┌──> tsserver 语言服务（常驻内存）──> 红线 / 补全 / 跳转，零文件产出
src/**/*.{ts,tsx}─┼──> tsc -b 类型审计（跑批）──────> 错误清单 + tsbuildinfo，挡住构建
                  └──> 剥类型转译器（esbuild → Oxc）─> 浏览器执行的纯 JS
```

> **注意：红线不参与构建。** 编辑器的报错来自 tsserver 的内存编译，构建的门禁来自 build script 里的 `tsc`——两个判断源互相独立：红线永远不会拦住构建，CI 报错也不会自动出现在编辑器。它们的结论理论上趋同（读同一份 tsconfig），漂移只可能来自版本不一致（见下文「编辑器和构建的类型检查为什么会不一致」）。

### 一份 build 脚本里的分工

抽象模型落回一个所有 Vite 项目都有的实物——package.json 的 scripts。两条命令恰好是三个角色各自到岗的最小完整形态：

```javascript
// package.json
{
  "scripts": {
    // dev：管线里只有剥类型转译器到岗——类型错误照样跑，检查责任在编辑器的 tsserver
    "dev": "vite",
    // tsc -b：先全程序审计——读全 tsconfig、报类型错误、写增量缓存 tsbuildinfo
    // && 是门禁：审计不过，打包不发生；vite build 里的转译器信任上游审计，自己只管快
    "build": "tsc -b && vite build"
  }
}
```

这就是官方推荐姿势的完整语义。Vite 文档对此毫不含糊——「type checking requires knowledge of the entire module graph」，把检查塞进按请求转换的 dev 管线必然牺牲速度，所以官方建议构建时串上 `tsc --noEmit`、开发时另开一个 `tsc --noEmit --watch` 进程（或用 vite-plugin-checker 把错误投到浏览器上）。先审计、后打包，两路人马各司其职。

### 高频误区：三个角色的职责边界

**反例：dev 能跑就认为类型对**

```text
// dev 页面正常渲染，就认为类型没问题
pnpm dev
getUser(42) // 参数类型全错——页面照跑，控制台安静
```

dev 管线里只有剥类型转译器在场，它看不出任何类型错误——「能跑」不构成任何类型背书。

**正例：检查发生在另外两条链上**

```bash
tsc -b --watch          # 或编辑器 tsserver 的实时红线
tsc -b && vite build    # 构建门禁
```

红线来自 tsserver 的内存编译，拦截来自 build script 的 tsc——想要类型结论，去找这两个角色。

**反例：以为升级 typescript 包会改变构建产物**

```text
pnpm up typescript@7
pnpm build   // 产物字节与升级前完全一致
```

产物由转译器决定，typescript 包只影响检查结论——它甚至读不到 strict 这类纯检查字段。

**正例：想动产物，升级的是管线里的转译层**

```text
pnpm up vite   // 6/7 时代内嵌 esbuild，8 起内嵌 Oxc
pnpm build     // 转译语义变化才可能反映到字节
```

「谁产出产物，谁的版本才影响产物」——升级检查器是审计口径变化，不是生产行为变化。

**反例：以为过了 build 产物就类型安全**

```text
vite build
```

转译器不做任何检查，这条命令独自产出的是「未经审计的字节」。

**正例：先审计后打包**

```text
tsc -b && vite build
```

tsc 拦截类型错误并留下增量缓存，转译器放心剥类型。

### 追问链

从热身到进阶，每一问建立在前一答之上：先立「运行时无 TS」，再拆两个检查员，最后摸清转译器的边界与原生化的影响。

**浏览器能直接运行 .ts 文件吗？**

不能。运行时没有 TS：.ts 必须先经转译器把类型标注剥成纯 JS 才能执行，构建产物里同样没有类型。类型检查是纯编译期行为，运行时零参与。Node 22.6+ 的原生类型剥离（`--experimental-strip-types`）同理——它也是「剥」而不是「懂」，同样不做任何检查。

**tsc 和 tsserver 是什么关系？编辑器报错为什么拦不住构建？**

同一个类型内核的两种运行形态：tsc 是跑批（全量、产错误清单、可做门禁），tsserver 是常驻实时查询（内存增量编译、不产文件、不参与构建）。红线只是语言服务的诊断输出，构建管线里根本没有它。补充：tsserver 对不在 tsconfig include 里的散文件会自建「推断项目」去查，结论可能和 tsc -b 不一致——这是编辑器与构建漂移的第二来源（第一是版本）。

**Vite 转译 TS 用的是 tsc 吗？为什么它不检查类型？**

不是 tsc。Vite 用单文件剥类型转译器（6/7 时代是 esbuild，8 起官方文档已换成 Oxc Transformer），转译不需要懂类型；而类型检查需要整个模块图的知识，塞进按请求转换的 dev 管线必然牺牲速度。官方给的两条补检方案：dev 时另开 `tsc --noEmit --watch` 进程，或用 vite-plugin-checker 把类型错误直接投到浏览器 overlay 上。

**为什么 esbuild 产不出 .d.ts，也不支持 emitDecoratorMetadata？**

因为这两件事都需要类型信息。.d.ts 是对类型面的描述——必须先算出类型才能写声明；装饰器元数据要把参数的静态类型塞进运行时——必须先做类型推断。esbuild 把类型当注释忽略，压根没有类型概念，所以官方文档明确不支持这两项。这也是库作者发布 npm 包时仍然绕不开 tsc 的原因：.js 交给转译器，.d.ts 必须由类型检查器产出（或用 API Extractor 这类基于检查器的工具）。

**TS 7 原生化之后，「三个程序」的格局变了吗？**

没变。TS 7 原生化换的是内核的实现语言与服务协议，三角色分工一格没动：tsc 还是审计、语言服务还是投影、剥类型器还是外人——这个模型的正确抽象是「一个类型内核 + N 种运行形态」，原生化只是给内核换了个更快的运行形态。补充：同期转译器岗位的演员也从 esbuild 换成了 Oxc，岗位描述（只转译、不检查）一个字没变——两次换角都没动格局，恰是分工结构性的最好佐证。

### 记忆点

- **运行时没有 TS**——产物里也没有。类型是纯编译期存在，检查与转译可以彻底分离。
- **esbuild 管字节，tsc 管真理**——要「快产出」找剥类型转译器，要「对不对」找类型检查器，两个问题别问同一个工具。
- **红线不参与构建**——编辑器报错来自 tsserver 的内存编译，构建门禁只能来自 build script 里的 tsc——两个判断源互不知情。

延伸阅读：为什么 Vite 转译 TS 却不做类型检查、编辑器的 TS 智能是怎么来的、前端实际用得到多少 TS 功能

---

## 2. 为什么 Vite 转译 TS 却不做类型检查？

*难度：进阶 ｜ 标签：Vite、esbuild、Oxc、类型检查、Webpack*

**不是「Vite 偷懒」，是分工使然**：转译不需要懂类型（把类型标注当文本抠掉即可），检查需要全程序模块图（最贵的部分，且对产出 JS 零贡献）。Vite 官方口径毫不含糊：只转译、不检查。检查的责任外包给 build script 里的 `tsc -b`——先审计、后打包。理解了这个分离，「dev 时类型错误页面照样跑」就不再是 bug，而是设计。

> Vite only performs transpilation on .ts files and does NOT perform type checking… type checking requires knowledge of the entire module graph.（Vite 官方文档 · Features）

### 三个理由：为什么不用 tsc 当转译器

- **速度**：dev server 的契约是「每个文件请求毫秒级返回」。tsc 是单线程 JS 全程序分析，冷启动以秒计；esbuild/Oxc 是原生并行单文件转换，快一到两个数量级；
- **职责上不需要**：转译只要求「剥类型」，不要求「懂类型」——懂类型是全程序推断，是整条链最贵的部分，且对产出 JS 毫无贡献。检查已经外包给 build script 里的 tsc；
- **形态不对**：tsc 是批处理 CLI（读项目 → 产文件），dev server 需要「给一个文件、还一个字符串」的转换服务——接口形态都不匹配。

顺便校准一个正在发生的换角：Vite 6/7 时代的转译器是 esbuild（Go），Vite 8 起官方文档已换成 Oxc Transformer（Rust）。但「只转译、不检查」的岗位描述一字未变——**岗位和演员要分开看**，这也再次印证三角色模型里的分工是结构性的，不绑定任何具体工具。

| 版本区间 | 转译层归属 |
|---------|-----------|
| Vite 4-7 | esbuild 负责逐文件 TS/JSX 转译，并承担依赖预构建与压缩 |
| Vite 8+ | 官方文档：转译由 Oxc Transformer（Rust）承担——更快，岗位描述不变 |

### dev 请求的一生：检查员全程缺席

```text
1. 浏览器请求 /src/main.tsx
   dev server 无打包、按需 serve——每个文件一个请求
2. 命中 TS，交给转译器
   单文件视角：此刻它不知道、也不关心项目里还有谁
3. 剥类型，产出纯 JS
   类型标注当注释抠掉；enum 展开、JSX 转换——原生并行的毫秒级操作
4. 返回浏览器执行
   Vite 文档口径：HMR 级别的更新在 50 毫秒内反映到浏览器
5. 类型检查员缺席
   tsc -b 不在 dev 管线里，tsserver 只服务编辑器——红线与拦截都不来自这条链
```

### 转译器的能力与硬边界

「不做检查」不等于「只会删字」。转译器对 TS 特性的处理分两档：不需要类型信息的都干——包括代码生成（enum 展开成运行时对象、namespace 转换、装饰器展开）；需要类型信息的一概不干。官方文档点名的两个硬边界：`emitDecoratorMetadata`（要把参数的静态类型塞进运行时，必须先做类型推断）和产出 `.d.ts`（要先算出类型面才能描述）。

const enum 的跨文件内联同理——而且它的两档行为值得单独点名：ambient const enum 在 `isolatedModules` 下直接报 TS1209（纯类型构造留到运行时必炸，编译期就拦）；普通跨文件 const enum 则隐蔽得多——被单文件转译器静默降级成普通 enum，不报错，但内联消失、运行时多出枚举对象。

Vite 8.2.2 的 package.json 实测：dependencies 已无 esbuild，只剩 rolldown 等；esbuild 降级为可选 peerDependency。

| 版本区间 | 三份工的归属 |
|---------|-------------|
| Vite 4-7 | esbuild 一人分饰三角：transform 逐文件转译、optimizeDeps 依赖预构建、minify 产物压缩 |
| Vite 8+ | 依赖里已无 esbuild——bundle / minify / transform 全部由 rolldown（内含 oxc）承担，esbuild 仅剩可选 peer 位置 |

| 能力 | 在 Vite 里的用途 |
|------|-----------------|
| Transform | dev 逐文件 TS/JSX 转译（本篇主角）——esbuild 时代由 esbuild 承担，Vite 8 起由 oxc 承担 |
| Bundle | 依赖预构建 optimizeDeps：把 node_modules 的 CJS 包转 ESM、合并成单文件减少请求数 |
| Minify | 构建产物的代码压缩 |
| Serve | esbuild 自带简陋 dev server——Vite 从未使用，自研了完整的 dev 层 |

### Webpack 的殊途同归

webpack 本体不认识 .ts，必须配 loader，历史上三条路：ts-loader（内部真调 tsc API，检查加转译一体，全程序检查串行挂在打包关键路径上，慢；开 `transpileOnly` 退化成只剥类型）；babel-loader + preset-typescript（剥类型）；swc-loader（Rust 版，更快）。配套的 `fork-ts-checker-webpack-plugin` 起独立子进程异步跑 tsc——报错不阻塞打包。

| 维度 | 一体式：ts-loader 默认 | 分离式：loader + fork-ts-checker |
|------|----------------------|--------------------------------|
| 类比 | 把校验写成同步触发器挂在写入路径上 | 写入全速跑，异步审计另行报账 |
| 检查时机 | 打包关键路径内串行 | 独立子进程并行 |
| 速度 | 慢——全程序分析阻塞打包 | 快——转译与检查互不等待 |
| 终态 | （开 transpileOnly 后）退化成分离式 | 与 Vite 的天生分离完全一致 |

所有 bundler 生态十年演化的终点是同一条：**转译交给快转换器，检查交给慢检查器，两者解耦、异步、并行**。Vite 只是出生就在终态，Webpack 是演化到了终态。

### 陷阱：转译器视角反噬 tsconfig

**反例：dev 页面正常就认为类型没问题**

```typescript
const user: User = { name: "a", age: "x" };
// age 类型错了：页面照跑，控制台安静
```

dev 管线只有剥类型转译器在场——「能跑」不构成类型背书；红线来自编辑器、拦截来自 build script，都不在这条链上。

**正例：检查在另外两条链上**

```bash
tsc -b                 # 构建门禁
# 编辑器 tsserver 实时红线
```

dev 时想要类型反馈，另开 `tsc --noEmit --watch` 或用 vite-plugin-checker 投到浏览器。

**反例：transpileOnly 裸奔**

```javascript
// webpack 只求快：开了 transpileOnly
{
  test: /\.ts$/,
  use: {
    loader: "ts-loader",
    options: { transpileOnly: true }
  }
}
// 没配 fork-ts-checker → 全程无人检查类型
```

转译与检查解耦后，检查必须另有归属——否则项目处于零检查状态，类型错误一路漏进产物。

**正例：剥类型与审计拆成两条通路**

```javascript
{
  loader: "ts-loader",
  options: { transpileOnly: true }
},
new ForkTsCheckerWebpackPlugin() // 独立子进程异步审计
```

报错不阻塞打包，但一定会在 CI 前暴露——与 Vite 的天生分离同构。

单文件视角还会反噬配置：`import { Foo }` 分不清是值还是类型，转译器只能保守保留——纯类型导入可能运行时报「没有这个导出」。这是 `verbatimModuleSyntax` 强制 `import type` 的存在动机。

**反例：纯类型导入不带显式标记**

```typescript
import { UserConfig } from "./config";
```

转译器分不清值与类型，只能保守保留整个 import，运行时可能炸出「no exported member」。

**正例：显式 type 标记**

```typescript
import type { UserConfig } from "./config";
```

编辑期就把歧义消掉，转译器放心擦除。

### 追问链

四问从缺席现象挖到生态终态：核心始终是「转译与检查可分离」这一条。

**dev 时写出类型错误，为什么页面照样跑？**

因为 dev 管线里只有剥类型转译器在场：它把 .ts 当文本抠掉类型标注返回 JS，看不出任何类型错误。红线来自编辑器的 tsserver，拦截来自 build script 的 tsc -b——dev 链路上两个检查员都不在。

**esbuild 为什么那么快？**

Go 只是前提。设计上的四个决定更关键：全核并行、零第三方依赖全自研（数据结构自己造）、AST 只过一遍（解析一次打印一次）、单文件视角（不做任何跨文件分析，天然可并行切片）。Oxc 在 Rust 上复刻了同一套设计哲学。

**const enum 为什么被称为单文件转译器的毒药？**

const enum 的使用点要内联成字面量：a.ts 里的 Color.Red 要变成 0，必须知道 b.ts 里的定义——跨文件知识。单文件转译器看不见 b.ts，行为分两档：ambient const enum（declare const enum）在 isolatedModules 下直接报 TS1209——纯类型构造留到运行时必然炸，编译期就拦住；普通跨文件 const enum 则被静默降级成普通 enum——不报错，但内联消失、运行时多出枚举对象。这是「不需要类型信息」和「需要全程序信息」的分界案例。补充：降级那档最危险——tsc 检查照过、运行时行为也「对」，只有产物体积与内联优化悄悄变化，排查方法是看构建产物里有没有枚举对象；ambient 档报的 TS1209 则把问题挡在编译期。

**Webpack 生态是怎么收敛到和 Vite 相同终态的？**

webpack 从一体式 ts-loader（tsc API 检查加转译，串行挂打包路径）演化出两条退路：transpileOnly 退化成只剥类型，再配 fork-ts-checker 独立子进程异步审计。演化终点和 Vite 的天生分离完全一致——快转换器管剥，慢检查器管查，异步并行。终态的一致性证明「转译/检查分离」是结构性规律而非某家工具的设计品味。工程启示：当你想把慢检查塞进快管线时，正确动作不是硬塞，而是拆成两条异步通路——这个模式同样适用于 lint、格式化等一切「贵但必要」的环节。

### 记忆点

- **转译不需要懂类型**——剥类型 = 抠注释。检查才需要全程序模块图——把最贵的部分隔离在 dev 管线之外，是速度的来源。
- **先审计后打包**——tsc -b 拦截并缓存，转译器信任上游只管快——「未经审计的字节」不应该出现在你的 build script 里。

延伸阅读：tsconfig 的一份配置到底谁在读、编辑器的 TS 智能是怎么来的

---

## 3. 编辑器的 TS 智能是怎么来的？

*难度：进阶 ｜ 标签：tsserver、语言服务、VSCode、LSP、IDEA*

你在编辑器里看到的一切 TS 智能——红线、补全、跳转、重构——来自一个独立进程：**tsserver**。官方 Wiki 的定义一句话说透：「封装了 TypeScript 编译器与语言服务、通过 JSON 协议暴露它们的 node 可执行文件」。编辑器把文件生命周期（open/change/close，未保存也算）推给它，它在内存里按 tsconfig 构建一次常驻的 program，之后所有查询增量应答。**它不产出任何文件、不参与构建**——这是理解编辑器行为与构建行为差异的钥匙。

> a node executable that encapsulates the TypeScript compiler and language services, and exposes them through a JSON protocol.（TypeScript 官方 Wiki · Standalone Server (tsserver)）

### 一次补全的完整旅程

编辑器与 tsserver 的关系不是「插件调函数」，而是两个进程之间的协议对话。VSCode 的内置扩展 typescript-language-features 启动 tsserver 进程，之后每一次按键背后都是一轮请求-响应：

```text
编辑器                                tsserver 进程
  │  open：推入文件内容（未保存也算）      │
  │ ─────────────────────────────────> │
  │                          构建/增量更新内存中的 program
  │  geterr：请求诊断                    │
  │ ─────────────────────────────────> │
  │                semanticDiag：语义诊断事件 → 红线
  │ <───────────────────────────────── │
  │  completions / definition / quickinfo
  │ ─────────────────────────────────> │
  │          候选列表 / 目标位置 / 类型签名
  │ <───────────────────────────────── │
```

三个关键性质藏在这张图里：

- **未保存的缓冲区内容也算数**——编辑器推的是你正在打字的文本，所以红线跟着打字实时变；
- 协议是 TS 自定义的 JSON-RPC（请求带 seq 序号、响应带长度头，走 stdin/stdout），**不是标准 LSP**——LSP 是微软后来为通用化发明的，TS 直到 7.0 才换；
- geterr 这类命令可以分步执行——打开大项目时红线「转一会儿」才出来，就是首次全量构建 program 的成本。

### 功能从哪来：一切来自那次 program

tsserver 启动后按 tsconfig 构建一个 program：解析整个模块图、加载全部声明文件、跑类型检查器。之后它做的每件事都是这次 program 上的查询——功能不是魔法，是同一份类型内核不同角度的投影：

| 数据来源 | 典型功能 |
|---------|---------|
| 类型检查器 | 语义红线、hover 类型签名、收窄后的智能提示 |
| 模块解析器 | 补全候选、auto-import 路径生成、跳进 node_modules 的类型 |
| 符号表 / 引用图 | 跳转定义与实现、Find All References、跨文件安全重命名 |
| 重构引擎 | extract function/const、organize imports、quick fix（补 await、转 import type） |
| 语法层（不查类型） | 语法诊断、大纲与折叠、语义高亮 |

理解了「功能即查询」，重命名为什么能跨文件安全就不神秘：它查的是 program 的引用图，改的是所有引用点的符号，而不是文本替换——后者只有编辑器字面搜索的能力，遇到同名局部变量立刻出错。

### 三类项目：你的文件归谁管

tsserver 内部把文件划归三类项目，优先级 configured > external > inferred：

| 维度 | Configured Project | Inferred Project |
|------|-------------------|------------------|
| 由谁定义 | tsconfig.json / jsconfig.json 声明 | tsserver 为游离文件自建 |
| 编译选项 | 你 tsconfig 里写的 | 默认选项（宿主可改） |
| 文件范围 | include/files 圈定的 | 散文件 + 三斜线引用 + 模块导入连带 |
| 与 tsc -b 的关系 | 同一套配置，结论趋同 | tsc 根本不查这些文件——漂移源头 |

散文件一旦被新出现的 tsconfig 覆盖，会自动脱离推断项目；推断项目若是「根文件构成」的，还会整个销毁重建。所以「include 写全、别留游离文件」不只是构建洁癖，是编辑器结论可靠性的前提。

### 插件、同源与协议变迁

tsconfig 的 `plugins` 字段可以往 tsserver 里注入增强插件（styled-components 补全、css-modules 跳转一类），但插件**只能增强已有文件类型的体验**，不能让服务认识新文件类型——这就是 .vue 必须由 Volar 整体接管 tsserver 的原因。另一边，IDEA/WebStorm 的 TS 智能同理：JetBrains 内嵌同一套语言服务（可选拖捆绑版或项目版），自己只做 UI 接线和索引层叠加。所以两家 IDE 的「智能差异」是版本、配置与呈现，**不是两套类型判断**。

把「同源」再往下挖一层：tsserver 与 tsc 不止读同一份 tsconfig，它们 import 的是同一个包里的同一个类型内核——所以「编辑器结论」与「构建结论」的分歧永远不可能来自算法本身，只可能来自版本与项目归属这些**输入差异**。协议变迁的逻辑同理：TS 自定义 JSON 协议把语言服务绑在「对接 VSCode 内置扩展」这一种宿主上，LSP 则把同一份智能开放给所有编辑器——变的只是传输层，program 的构建方式与「功能即查询」的模型原样继承。理解了这一点，TS 7 换协议就不是「推倒重来」，而是同一内核换了一条更通用的出线口。

| 版本区间 | 协议形态 |
|---------|---------|
| TS ≤ 6.x | 自定义 JSON 协议走 stdin/stdout，VSCode 内置扩展专属对接 |
| TS 7.0+ | 原生语言服务改用标准 LSP——Neovim、Zed 等任意 LSP 编辑器同等受益 |

协议通用化的代价：依赖旧 tsserver 插件生态的工具需要适配期。

### 日常玄学三连

**红线转半天**

反例：红线还没出来就删依赖重装（`rm -rf node_modules && pnpm install`）——首次全量构建 program 是固有成本，重装只是把同一笔成本重新付一遍。正例：等首次 geterr 跑完（状态栏有语言服务活动指示），之后所有查询走增量应答——一次全量、此后增量，大项目冷启动的固定门票，不是卡死。

**红线失灵**

反例：重启整个 VSCode——重建成本高，还会丢工作区状态。正例：`TypeScript: Restart TS Server`——只重建语言服务进程与 program，几秒完成，玄学红线的第一处置动作。

**auto-import 路径发歪**

反例：生成路径很怪就逐个手动改（`import { a } from "../../../src/utils/a"`）——手改只修这一个文件，下一次 auto-import 继续歪。正例：回配置层核对 paths 与文件的项目归属（`"paths": { "@/*": ["./src/*"] }`）——auto-import 按当前 project 的解析规则生成导入路径，配置对了路径自然和打包器一致。

### 追问链

五问从进程模型挖到协议变迁：每答都建立在「功能即查询」这一个抽象上。

**红色波浪线是谁画的？**

tsserver。编辑器启动的独立语言服务进程，在内存里对项目做常驻增量编译，把语义诊断（semanticDiag 事件）推回编辑器渲染成红线。它不产出文件、不参与构建。

**为什么没保存的文件也有红线和补全？**

因为编辑器通过 open/change 请求把缓冲区当前内容推给 tsserver，未保存也算。语言服务是基于你正在打字的文本做分析，不是基于磁盘文件——所以红线跟打字实时变，保存动作对它无意义。

**auto-import 怎么知道全项目有哪些候选？**

来自 program 的模块图加符号表：tsserver 知道项目里所有可导入的模块及其导出符号，补全请求时按上下文过滤排序，再由模块解析器生成符合 tsconfig paths 约定的导入路径。所以 paths 配错时，auto-import 生成的路径也是歪的。

**跨文件安全重命名，为什么「全局查找替换」做不到？**

重命名走的是 program 的引用图：先解析出符号的所有真实引用点（含 import、导出、类型位置），逐一改写；同名但不同作用域的符号不会误伤。全局替换是文本操作，遇到注释、字符串、同名局部变量立刻出错。补充：Find All References 同理——它数的是引用图里的边，不是 grep 的命中数。讲清这个区别，能直接证明你理解语言服务和文本工具的分界。

**TS 7 换 LSP 后，谁受益谁阵痛？**

受益的是所有 LSP 编辑器：Neovim、Zed 不再需要第三方适配就能获得 TS 智能——因为原生服务说标准协议。阵痛的是绑定旧协议的生态：tsserver 插件和深度对接 VSCode 内置扩展的工具需要适配期，TS 7.0 暂无稳定编程 API 加剧了这一点。

### 记忆点

- **tsserver = JSON 协议封装的编译器**——官方定义背下来：封装编译器与语言服务、经 JSON 协议暴露的 node 可执行文件——进程独立、stdin/stdout、不产文件。
- **一切功能来自常驻 program**——红线、补全、跳转、重命名全是同一次内存编译上的查询——语言服务的功能不是魔法，是投影。

延伸阅读：编辑器和构建的类型检查为什么会不一致、tsconfig 的一份配置到底谁在读

---

## 4. 编辑器和构建的类型检查为什么会不一致？

*难度：进阶 ｜ 标签：TypeScript、版本漂移、tsserver、tsdk、lockfile*

**编辑器（tsserver）和构建（tsc -b）是同一个类型内核的两种运行形态**，它们结论漂移的来源只有两个：**版本不一致**（编辑器默认用自带 TS，构建用 node_modules 里的）和**推断项目**（include 外的散文件被 tsserver 自建临时项目检查）。治理手法是声明式统一：package.json 声明 → lockfile 锁死 → node_modules 落地，编辑器侧用 `typescript.tsdk` 指路（首次需一次性授权），IDEA 则默认自动探测。版本对了，两边结论天然趋同。

### 一个项目里的多份 TS

典型项目里 TS 不止一份。盘点一下你在用的副本：

- **node_modules/typescript**：package.json 声明、lockfile 锁定的那份，tsc -b 和当库用的工具都找它；
- **编辑器内置版**：VSCode 随编辑器发布一份 TS，语言服务默认用它，跟你装了哪版无关；
- 可能还有**全局安装的残留**（`npm i -g typescript` 的老习惯产物）。

「各种版本的 TS 对开发环境有什么影响」的答案主体就在这：版本错位 = 编辑器结论与构建结论漂移。漂移的具体表现有两个方向：编辑器用旧版、构建用新版——新版本的检查更严、新语法支持更多，于是「编辑器全绿、CI 红一片」；反过来则是「编辑器画的红线构建根本不认」。两边读的是同一份 tsconfig，理论上结论趋同，唯一的变量就是内核版本不同。

### 统一链条：把裁判锚到 lockfile

声明式统一的思路和你工具链里 mise 的哲学同构：声明一份来源，所有读者都对齐它。构建侧天然统一——CI 装依赖后跑的 tsc 就是 node_modules 里那份；要统一的只有编辑器侧：

```text
package.json 声明 ^7.0.2
        │ install
        ▼
pnpm-lock.yaml 锁死 7.0.2
        │ 物化
        ▼
node_modules/typescript
        ├──> tsc -b / CI 门禁
        ├──> VSCode（tsdk 指路 + 一次授权）
        └──> IDEA（默认自动探测）
```

VSCode 侧提交一个文件就完成全团队统一；IDEA 侧什么都不用做——它的语言服务默认自动探测项目的 node_modules/typescript，有项目包时自动优先使用，没有才回退内置捆绑版。两家的机制差异很大，但路的尽头是同一个事实源：

```javascript
// .vscode/settings.json —— 提交进仓库
{
  // tsdk：声明语言服务该用哪份 TS（相对路径、指向 lib 目录）——「Use Workspace Version」的持久化形态
  "typescript.tsdk": "node_modules/typescript/lib",
  // 首次打开项目时弹一次授权提示；点一次允许后永久生效，授权记录存本机不进仓库——每位成员各点一次
  "typescript.enablePromptUseWorkspaceTsdk": true,
  // javascript 同款：混着写 .js 的项目里，JS 语言服务同样要对齐版本
  "javascript.tsdk": "node_modules/typescript/lib",
  "javascript.enablePromptUseWorkspaceTsdk": true
}
```

> **注意：为什么要弹一次授权，而不是静默生效？** tsdk 指向的是 node_modules 里的代码，语言服务会以进程方式加载执行它——仓库声明的版本等于「这个仓库要求你运行它的代码」。VSCode 要求用户显式信任一次，这是供应链的信任边界：**声明 ≠ 授权**。授权记录存本机 workspaceStorage，所以每人首次打开都要点一下。

手动入口也值得知道：命令面板 `TypeScript: Select TypeScript Version` 可以随时切换——但它是**上下文敏感的**，必须先打开一个 .ts/.tsx/.js 文件它才出现在面板里；也可以直接点底部状态栏的 TS 版本号。配置好 tsdk 之后，这个菜单基本就不需要了。

### 兼容六轴：升级时两边怎么错开

版本不一致之所以危险，是因为 TS 的兼容性不是一根轴，是六根——每根轴上「编辑器旧、构建新」或反向都会产生不同的症状：

| 轴 | 方向 | 典型表现 |
|----|------|---------|
| 新编译器读旧代码 | 向后（最好） | 破坏集中大版本，且走「废弃→警告→硬移除」三级火箭提前预告 |
| 旧编译器读新代码/@types | 向前（必然差） | @types 包用新语法写声明，老 tsc 直接在 .d.ts 里报 syntax error |
| lib.d.ts 隐式 API 面 | 随版本变 | DOM 声明更新后与你 declare global 的同名成员打架——升级后「奇怪的全局错误」头号来源 |
| target/lib 与运行时 | 语法降级 | TS 只降语法不补 API（Promise 类型给了，老浏览器运行时没有，polyfill 另请） |
| tsconfig 严格校验 | 无前向兼容 | 未知 compiler option 直接报错——内置老 TS 的编辑器打开新 tsconfig 画红线 |
| 语言兼容 ≠ API 兼容 | TS 7 特有 | 代码语义兼容，但 import typescript 当库用的工具断供（vue-tsc / ts-morph / Next 检测） |

### 推断项目：第二个漂移源

就算版本完全统一，还有第二个结构性漂移源：tsserver 对**不在任何 tsconfig include 范围里的散文件**，会自建一个「推断项目」（inferred project）——用默认编译选项按引用连带收集检查，而 `tsc -b` 对 include 外的文件根本不查。选项不同，同一个文件的结论就可能不同。治理结论：**include 写全，别留散文件**。

### 高频误判

**反例：同一份配置就是同一个结论**

```text
编辑器（内置 TS 6）─┐
                    ├─ 读同一份 tsconfig → 结论漂移
CI（node_modules 7）─┘
```

配置相同、内核不同——检查语义随内核版本走，同一份 strict 喂出两个结论；「读同一份配置」不构成一致性保证。

**正例：先统一内核，再谈配置**

```bash
pnpm up typescript@7          # lockfile 锁死
```

```json
{ "typescript.tsdk": "node_modules/typescript/lib" }
```

版本一致之后，同一份 tsconfig 才只有一种语义——这是所有漂移治理的第一步。

**反例：tsdk 提交即全员静默生效**

```json
{
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

少了授权开关——VSCode 默认仍用编辑器内置版，新成员的红线依旧由旧内核画出，配置形同虚设。

**正例：声明与授权各走各的闸门**

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

首次打开弹一次授权、点一次本机永久生效。

第三个误判更隐蔽：以为 **lockfile 只锁运行时依赖**——它同样锁死 typescript 这个「裁判」。没有 lockfile，node_modules 里那份 TS 的版本都无法复现，编辑器指路（tsdk）也指了个寂寞——这正是统一链条的地基。

**反例：编辑器版本不配置**

不配置、用编辑器默认——内置 TS 版本随编辑器发布节奏走，团队里每个人编辑器版本不同，红线结论就不同。

**正例：版本锚定**

```json
{ "typescript.tsdk": "node_modules/typescript/lib" }
```

提交进仓库 + enablePromptUseWorkspaceTsdk，全团队编辑器判断收敛到 lockfile 锁定的那份。

### 追问链

五问沿「现象 → 根因 → 治理」递进：先解释症状，再拆机理，最后落到声明式统一。

**为什么编辑器没报错，CI 却红了？**

因为编辑器和构建用的不是同一份 TS。编辑器默认用自带版本（可能旧），CI 里 tsc -b 用 node_modules 里的（可能新）——新版本的检查更严，旧版放行的代码新版拦截。版本锚定到工作区即可消除。

**版本统一之后，编辑器和构建就一定一致了吗？**

不一定。版本统一只消掉了第一类漂移（主从延迟），还有推断项目这条结构性漂移源：include 外的散文件被 tsserver 自建临时项目按默认选项检查，tsc -b 却根本不查它们。版本锚定与 include 写全两件事都做干净，两边结论才真正收敛。补充：散文件多出现在新脚本、新工具目录刚创建还没进 include 的窗口期——把「include glob 与目录结构对齐」放进 code review 清单，比事后排查症状便宜得多。

**lib.d.ts 的变化怎么坑人？怎么缓解？**

每次升级标准库声明都在更新：DOM lib 会给 window 加新成员、ES lib 会加新全局。你项目里 declare global 的同名声明就会和它冲突。缓解：skipLibCheck: true 跳过对 .d.ts 的检查（挡掉一大部分），剩下撞名的自己改名或收窄声明。

**typescript 的 ^ 版本区间为什么比普通依赖更敏感？**

普通库的 minor 是加功能，编译器的 minor 可能加检查——上次能编译的代码升级 minor 后可能报新错。所以 typescript 这类「裁判型」依赖对区间更敏感：日常靠 lockfile 锁死保稳定，升级走显式 PR、读官方 breaking changes，跟数据库大版本升级一个纪律。

**VSCode 和 IDEA 在「用哪份 TS」上的机制差异是什么？**

VSCode 默认用编辑器内置版，需要仓库提交 typescript.tsdk 指向 node_modules/typescript/lib，且每人首次打开要点一次授权（供应链信任边界：声明 ≠ 授权）；IDEA/WebStorm 默认就自动探测并优先使用项目的 node_modules/typescript，无需任何配置文件。两家路的尽头都是 lockfile 锁定的那份。

### 记忆点

- **漂移只有两个来源**——版本不一致 + 推断项目——排查编辑器与构建的结论分歧，先查这两处。
- **lockfile 是版本事实源**——声明（package.json）→ 锁定（lockfile）→ 落地（node_modules）→ 编辑器指路（tsdk）——一条链，一个真相。

延伸阅读：编辑器的 TS 智能是怎么来的、类型检查、lint、格式化为什么不打架

---

## 5. tsconfig 的一份配置到底谁在读？

*难度：进阶 ｜ 标签：tsconfig、verbatimModuleSyntax、baseUrl、skipLibCheck*

**tsconfig 是一份被三类读者按需裁剪阅读的文件**：tsc 和 tsserver 全读；esbuild/Oxc/swc/babel 只读少数投影字段（target、jsx、useDefineForClassFields、paths、experimentalDecorators 等）；ts-loader 全读——因为它就是 tsc。由此得到排查配置问题的第一定律：**配置没生效时，先问「这个字段谁在读」**——strict 系纯检查字段转译器根本不认识，改了只影响 tsc/tsserver 两个读者。

### 三类读者，三种读法

| 读者 | 读多少 | 代表行为 |
|------|-------|---------|
| tsc（跑批审计） | 全读 | strict 系检查、noEmit、paths、增量缓存都按它来 |
| tsserver（编辑器） | 全读 | 红线与补全的结论理论上与 tsc 趋同——前提是版本一致 |
| esbuild / Oxc / swc / babel | 只读投影 | 认 target、jsx、paths、verbatimModuleSyntax；strict 系根本不认识 |
| ts-loader | 全读 | 内部就是 tsc 的 API 封装 |

读者矩阵立刻解释了一类经典困惑：「我明明开了 `noUnusedLocals`，为什么构建产物里还是有未使用的变量？」——因为那个字段只影响 tsc/tsserver 的检查结论，转译器读不到、也不需要读：转译的职责是把类型抠掉，变量用没用跟它无关。

这份读者差异不是实现偷懒，是职责边界的必然。tsc/tsserver 要回答「这段代码**对不对**」，而检查语义由全程序关系决定，所以必须全读；转译器只回答「这段文本**变成什么 JS**」，转换所需的信息恰好全部落在单文件内——投影字段都是「不读项目里其他文件也能执行」的变换参数。**读者读多少，由它要回答的问题决定**——这句判据比矩阵本身更值得带走。

### 转译器认得哪几个字段

投影清单短到可以背下来：

- `target`：语法降级目标；
- `jsx` 与 `jsxImportSource`：JSX 的转换形态；
- `useDefineForClassFields`：类字段语义，影响运行时行为；
- `experimentalDecorators`：旧版装饰器；
- `paths`：路径别名，转译器做模块解析时需要；
- `verbatimModuleSyntax`：决定未使用的导入是保留还是擦除。

除此之外的字段——`strict` 全家、`noUnusedLocals`、`exactOptionalPropertyTypes`、`skipLibCheck`——都是纯检查字段，转译器视而不见。

入选投影清单的判据只有一条：**这个字段的取值会改变产出的字节吗？** target 决定语法降级到哪一档、jsx 决定 JSX 展开成哪个函数调用、useDefineForClassFields 决定类字段编译成定义还是赋值——答案都会写进产物；而 strict 全家、noUnusedLocals 无论取值如何，产出的 JS 一个字节都不变，它们只存在于「报不报错」的判断层。记住判据比背清单更耐用：新字段出现时用它归类一遍，归属自动清晰。

> **注意：「认 paths」有形态前提。** 转译器「认 paths」只在 **bundling 模式**下成立——esbuild 的打包流程会解析 paths，但 Vite dev 的单文件 transform **不做 paths 解析**（每个请求独立转换，没有模块级的别名改写环节）。这正是 vite-tsconfig-paths 插件与 `resolve.alias` 存在的原因：别名要在打包器的模块解析层单独接上。

### verbatimModuleSyntax：为单文件视角而生

这是「为转译器服务」的字段里最值得深拆的一个。单文件视角下，转译器遇到 `import { Foo } from './x'` 无法判断 Foo 是值还是纯类型：类型要擦除、值要保留，而它看不见 x 模块长什么样。它的唯一安全策略是**保守保留**——但若 Foo 是纯类型，运行时 x 模块没有这个导出，可能直接报错。`verbatimModuleSyntax` 强制你把纯类型导入显式写成 `import type`，在编辑期就把歧义消掉；它的前辈 `isolatedModules` 动机相同，约束更宽。Vite 官方模板预配这个字段，就是在替转译器向你「要承诺」。

**反例：纯类型导入不写标记**

```typescript
import { UserInfo } from "./types";
```

转译器单文件视角无法判定，保守保留可能运行时炸出「no exported member」。

**正例：显式 type 标记**

```typescript
import type { UserInfo } from "./types";
```

tsc 强制你写对，转译器放心擦除——歧义在编辑期归零。

### baseUrl 的退役始末

baseUrl 是 TS 早期的「假根」机制：设置后所有裸导入都多出一条「相对 baseUrl 解析」的通道——`import 'foo/utils'` 可能命中 src/foo/utils 而不是 node_modules 里的包。它是 TS 专属发明，Node 和所有打包器都没有这个概念，直接违反「类型解析必须对齐运行时」的原则，还是大量解析诡异 bug 的源头。

| 版本区间 | baseUrl 的命运 |
|---------|---------------|
| TS ≤ 4.0 | paths 依赖 baseUrl 才能工作——要用别名就必须设假根 |
| 4.1+ | paths 独立化：路径项直接相对 tsconfig 所在目录解析，baseUrl 失去刚需 |
| 6.0+ | 进入废弃潮；「7.0 已移除」的传闻以自己仓库的实测为准（tsc -b --dry），不背二手结论 |

> **提示：删掉 baseUrl 的收益。** 裸导入从此只有一种含义——node_modules 里的包；别名只存在于 paths 一处显式声明。解析通道变少，「这个 import 到底命中了什么」的心智负担直线下降。

### types 与 skipLibCheck：两条独立旋钮

`"types": ["vite/client"]` 是**全局自动注入的白名单**：没有它，TS 会把 node_modules/@types 下所有包的全局声明自动吸进项目；写了它，全局注入只认名单上的。注意它管的是「全局注入」——**管不住 import 的解析**，显式 `import from "node:url"` 照样能找到 @types/node 的类型。`skipLibCheck: true` 则跳过所有 .d.ts 的检查——库的类型声明数量巨大且可能互相冲突，检查它们性价比为负，工程标配。

两个旋钮的默认值都是「便利与严谨」的权衡：全局注入默认全量吸入，是 @types 时代的零配置便利——装了即生效；代价是全局命名空间被动扩大，所以才需要白名单收口。skipLibCheck 默认关，是「声明也该被检查」的严谨姿态；但 .d.ts 属于第三方、数量巨大且你无法修复其中的冲突，全量检查等于替所有依赖付类型税——跳过它们**不影响你自己代码的检查严格性**，这是「工程标配」成立的机制前提。

### 排查第一定律的实操流程

- **问读者**：这个字段属于检查语义还是转译投影？（strict 系 = 检查；target/jsx/paths = 投影）
- **对读者验证**：检查字段跑 `tsc -b --dry` 或看编辑器；投影字段直接看构建产物；
- **警惕双读者字段**：paths 同时被 tsc 与部分转译器读，改一处忘另一处会出现「构建能跑编辑器红线」的分裂。

**反例：同一约定维护两处**

```javascript
// vite.config.ts 手写别名
resolve: { alias: { "@": "./src" } }
// tsconfig paths 另写一份——两份事实必然漂移
```

**正例：单一来源**

```javascript
resolve: {
  tsconfigPaths: true // Vite 8 原生读 tsconfig paths
}
```

别名只在 tsconfig 声明。

### 追问链

五问围绕第一定律展开：从读者矩阵到具体字段的归宿，再到跨版本的行为差异。

**改了 strict 没生效，第一个该问什么？**

问「这个字段谁在读」。strict 是纯检查字段，只有 tsc/tsserver 认——确认你跑的检查（tsc -b 或编辑器）用的是改过配置的那份 tsconfig、那个版本的 TS；转译器和构建产物对它完全无感。

**为什么转译器读不到 strict，还能正确处理代码？**

因为转译不需要做任何判断：类型标注一律擦除，语法转换只看 target/jsx。strict 决定的是「这段代码报不报错」，而转译器从不回答这个问题——检查语义对它是不存在的输入。

**verbatimModuleSyntax 和 isolatedModules 什么关系？**

同一动机的两代实现：单文件转译器无法跨文件判断「这个导入是不是纯类型」，isolatedModules 让 tsc 对依赖跨文件信息的用法报错，verbatimModuleSyntax 更进一步——强制所有纯类型导入显式写 import type，把歧义在源头消除。新项目直接用后者。

**types 字段为什么是「白名单」？它管住了什么、管不住什么？**

它只管全局自动注入：不写则 @types 下所有包的全局声明被自动吸进项目，写了则只认名单上的。它管不住显式 import 的解析——`import from "node:url"` 照样能找到 @types/node。两条管道互不干涉是理解这类配置的关键。补充：`types: ["vite/client"]` 就是典型用法——只要 vite/client 的全局类型（import.meta、*?raw 模块声明），不要 node 全局污染浏览器代码的命名空间。

**「baseUrl 在 TS 7 被移除了」这类传闻怎么处理？**

三级火箭的思维加实测：先查官方 release notes 确认它在哪一级（废弃/改默认/移除），再在自己仓库（或临时分支）跑 tsc -b --dry 验证——结论以你仓库的实际配置为准，任何示范仓库的现状都替代不了这一步。就 baseUrl 本身：自 4.1 起就是冗余项（paths 已独立解析），删掉是清理而非止损。

### 记忆点

- **这个字段谁在读？**——排查配置失效的第一定律：检查字段归 tsc/tsserver，投影字段才归转译器。
- **转译器只读投影**——target / jsx / paths / useDefineForClassFields / verbatimModuleSyntax——背下这份短清单，其余都是检查字段。

延伸阅读：import 的模块是怎么被解析找到的、references 和 tsc -b 解决什么

---

## 6. import 的模块是怎么被解析找到的？

*难度：进阶 ｜ 标签：moduleResolution、模块解析、paths、alias、exports*

`import { x } from "./foo"` 里的 "./foo" 如何变成磁盘上的真实文件，不同运行环境有不同算法——`moduleResolution` 就是在选这套算法，而选择的原则只有一条：**必须对齐真正会加载你代码的那个运行时**，否则「类型检查通过」推不出「运行时能跑」。现代打包器项目配 `bundler` 档——官方定义它是 CommonJS 无扩展名导入与 ESM import 条件优先的**融合算法**，不是某个打包器的私有方言。

> Most modern bundlers use a fusion of the ECMAScript module and CommonJS lookup rules in Node.js… extensionless imports work just fine just like in CommonJS, but when looking through the export conditions of a package, they'll prefer an import condition just like in an ECMAScript file.（TypeScript 5.0 Release Notes）

### 三档解析：你在选哪套文件系统规则

| 档位 | 建模对象 | 相对导入扩展名 | 认 exports 字段 |
|------|---------|---------------|----------------|
| node10（旧 node） | Node CommonJS 算法 | 可省略 | 不认——子路径导出直接找不到 |
| node16 / nodenext | Node ESM 算法 | ESM 中必须写全（./utils.mjs） | 认，严格按条件分支 |
| bundler | 打包器的融合算法 | 可省略 | 认，优先 import 条件 |

官方引入 bundler 档（TS 5.0）的动机写得很直白：node16 精确建模了 Node 的 ESM 规则，但那些规则（尤其是强制扩展名）「是 Node 与浏览器为加快文件查找而设的，打包器并没有这些限制」。于是 bundler = 无扩展名导入（CJS 风格）+ 优先 import 条件（ESM 风格）的混合体，适用于 Vite、esbuild、swc、webpack、parcel 这些实现「hybrid lookup」的工具。错配的代价立竿见影：配成 nodenext，tsc 会强迫你所有相对导入写 `.js` 扩展名——在打包器世界纯属自找麻烦。

顺带校准 node16 与 nodenext 的差异：解析规则完全一致（ESM 都强制扩展名、都严格认 exports），区别只在算法版本——node16 钉死 Node 16 的行为不再变，nodenext 跟随最新 Node 的解析语义滚动。对绝大多数项目，真正的选择发生在 nodenext 与 bundler 之间，判断依据只有一条：你的代码最终由谁加载。

**反例：nodenext 忘写扩展名**

```typescript
// moduleResolution: nodenext，源码是 ESM
import { x } from "./utils/a";
// error TS2835: Relative import paths need
// explicit file extensions
```

nodenext 按 Node 真实规则强制相对导入写全扩展名——打包器项目写惯的无扩展名导入在这里直接报错。

**正例：解析对齐运行时**

```typescript
import { x } from "./utils/a.js";
// 源码写 .js，指向编译产物同名文件
// 打包器项目换 bundler 档则免扩展名
```

跑在 Node ESM 就写 Node 认的说明符；由打包器加载就换 bundler 档。

### bundler 档下的一次解析

拿真实别名走一遍完整流程，解析器每一步在做什么、能看到什么、看不到什么：

```text
1. 读入 import { x } from "@/utils/a"
   裸说明符，先查 paths 映射
2. paths 命中 @/* → ./src/*
   别名替换，说明符变成 src/utils/a（相对 tsconfig 目录）
3. 尝试扩展名 .ts → .tsx → .d.ts
   bundler 档允许无扩展名导入——逐个试到命中为止
4. 命中 a.ts，模块图 +1
   该文件进入 program；若命中的是 .js 则找同名 .d.ts 拿类型
5. 递归解析它的 import
   整个模块图就是这样滚雪球长出来的
6. 结论
   「检查需要全程序知识」的根源：每一步都只有走完才知道下一步是什么
```

### paths 与 alias：一份事实，两处手抄

项目里可能同时存在两份别名声明：tsconfig 的 `"paths": { "@/*": ["./src/*"] }` 管 tsc/tsserver 的类型解析；vite.config 的 `resolve.alias` 管打包器的运行时解析。两边各自的读者不同、算法不同，于是必须人肉保持一致——这是 Vite 工程最经典的坑之一。

| 维度 | tsconfig paths | vite resolve.alias |
|------|---------------|--------------------|
| 谁在读 | tsc / tsserver（类型解析） | 打包器（运行时模块解析） |
| 影响什么 | 类型检查、补全、跳转、auto-import 生成 | dev 请求与构建产物能不能找到文件 |
| 改一漏一的症状 | 编辑器红线、auto-import 歪路 | dev/build 直接 module not found |
| 收敛方案 | 单一事实源：vite-tsconfig-paths 让打包器直接读 tsconfig | 同左——alias 从 vite.config 删除 |

**反例：双份事实改一漏一**

```typescript
// tsconfig 加了别名，vite.config 忘了同步
// "paths": { "@/*": ["./src/*"] }
// vite.config.ts：resolve.alias 里没有 @
import { x } from "@/utils/a"; // dev 请求 module not found
```

paths 与 alias 不一致时，类型过的路径和运行时过的路径是两套判断——「编辑器全绿、dev 一请求就炸」的症状分裂才是真坑。

**正例：单一事实源**

```javascript
// 单一事实源：打包器直接读 tsconfig
import tsconfigPaths from "vite-tsconfig-paths";

export default { plugins: [tsconfigPaths()] };
```

alias 从 vite.config 删除后两个读者同源；此后 paths 配错的症状反而响亮（编辑器红线与 tsc 报错同时出现），反而好排查。

### 发布者的特别提醒

官方对 bundler 档有一条专门警告：它会**掩盖非打包器用户的兼容问题**——你的库在 Vite 项目里一切正常，到了用 Node 原生 ESM 的消费者那里可能解析失败。所以发布 npm 库的项目应该配 `nodenext`，bundler 档是应用项目的档位。另外两类接缝要心里有数：自定义 `conditions` 与 `resolve.alias` 是打包器私有能力，tsc 不认识；`?raw` / `?url` 这类 Vite 私有语法后缀，靠 `vite/client` 类型包里的 `declare module '*?raw'` 补上类型——「标准化部分靠档位自动一致，私有部分靠声明与插件对齐」。

这条警告背后的机制是「建模对象的分野」：bundler 档建模的是打包器的宽容，而宽容成立的前提是**消费者环境被打包器统一托管**。库发布后，解析发生在消费者的环境里——你无法预设每个消费者都用打包器，Node 脚本、测试运行器都可能直接加载你的包。所以库作者要按最严格的解析器（Node 原生 ESM）声明自己：exports 条件写全（import/require/types 分支）、扩展名齐全、用 nodenext 自测。严格档位下能通过的包，在宽容档位下必然也能通过；反之不成立——这是单向蕴含，也是「应用配 bundler、发库配 nodenext」的全部逻辑。

> **提示：排查解析问题的固定动作。** VSCode 里右键「Go to Definition」看解析落点；命令面板 `workbench.action.gotoSymbol` 不够用时直接 `tsc --traceResolution` 输出完整解析轨迹——每一跳命中失败都会写明原因。

### 追问链

五问从档位语义挖到发布策略：核心原则只有一个——解析对齐运行时。

**moduleResolution 到底决定什么？**

决定导入说明符如何映射到磁盘文件：相对路径怎么试扩展名、裸导入怎么走 node_modules、包的 package.json 里认哪些字段（main/exports）。它是算法档位选择器，与类型检查的严不严毫无关系。

**bundler 和 nodenext 差在哪？什么时候会踩到？**

一句话：nodenext 的 ESM 强制相对导入写全扩展名（Node 真实规则），bundler 放宽了它（打包器不关心）。认 exports/imports 字段两档一致，customConditions 也都支持。踩法：打包器项目错配 nodenext，tsc 强迫你写 .js 扩展名，纯自找麻烦。

**为什么「解析必须对齐运行时」？不对齐会怎样？**

因为 tsc 和 tsserver 解析模块用的是 moduleResolution 算法，而真正加载文件的是运行时或打包器。两套算法不一致时，类型系统认得的导入和运行时认得的导入是两个集合——类型全绿的 import 运行时可能 module not found。对齐了，检查通过才对运行时有效力。

**exports 字段谁是读者？node10 为什么是发布事故高发档？**

exports 是包的「子路径路由表」，读者是认它的解析器：node16/nodenext/bundler 都认，node10 完全不认。用 node10 的项目 import 你的子路径（如 pkg/ui）会直接找不到——哪怕你 exports 写得完美。所以发库要测多档位，文档里写清支持范围。补充反向坑：老包只写 main 没有 exports，bundler/nodenext 照样能解析（回退 main）——exports 是增量路由，不是唯一入口。

**alias 和 paths 为什么必须两处写？能收敛到一处吗？**

因为读者不同：paths 喂 tsc/tsserver 的类型解析，alias 喂打包器的运行时解析，历史上没有一份配置两边都认。可以收敛：vite-tsconfig-paths 插件让打包器直接读 tsconfig 的 paths，alias 从 vite.config 删除——类型解析与运行时解析从此同源，改一漏一的结构性风险消失。收敛方向的选择有讲究：只能「tsconfig 为源 + 插件」，不能反过来——tsc 不会去读 vite.config。单一事实源必须选所有读者都愿意读的那份。

### 记忆点

- **解析对齐运行时**——moduleResolution 的选择原则只有一条：跟真正加载你代码的运行时用同一套算法。
- **bundler = 融合算法**——CJS 的无扩展名 + ESM 的 import 条件优先——官方定义的标准交集，不是某家打包器的私有方言。

延伸阅读：TS 是怎么找到 npm 包的类型声明的、tsconfig 的一份配置到底谁在读

---

## 7. TS 是怎么找到 npm 包的类型声明的？

*难度：进阶 ｜ 标签：类型查找、@types、typeRoots、typesVersions*

类型查找是**两条互不干涉的管道**。管道 A「按导入解析」：import 一个包时按优先级瀑布找声明——同名扩展名尝试 → exports 的 types 条件 → types/typings 字段（含 typesVersions 按 TS 版本重定向的分支）→ index.d.ts → 回退 @types → 全部落空则 noImplicitAny 报错。管道 B「全局注入」：typeRoots（默认 node_modules/@types）下所有包的全局声明被自动吸进项目，`types` 字段是白名单。关键事实：@types 与主包**没有版本自动联动**——react 18 配 @types/react 16 会真出事，对齐靠纪律。

### 管道 A：按导入的解析瀑布

写下 `import { Button } from "ui-kit"` 之后，检查器按一个严格的优先级瀑布找它的类型。每一级命中即停，全部落空且 noImplicitAny 开着（strict 包含它）就报 `TS7016`：

- **同名文件尝试**：解析落点逐个试 `.ts → .tsx → .d.ts`——仓库内的相对导入靠这级命中；
- **exports 的 types 条件**：包的 package.json 里 `"exports"` 的类型分支（现代包的标配，bundler/nodenext 档才认）；
- **types / typings 字段**：直接指向声明入口，如 `"types": "./dist/types/index.d.ts"`。这一级带一个**版本分支**：`typesVersions` 按消费方的 TS 版本重定向声明入口（老 TS 读不懂新语法 .d.ts 时给旧写法）——命中时优先于常规 types 解析，它不是瀑布后段的兜底，而是这一级内部的岔路；
- **index.d.ts 兜底**：什么都不写时看包根目录；
- **回退 @types/pkg**：包里完全没有类型时，找 DefinitelyTyped 的社区声明；
- **落空**：noImplicitAny 报错「Could not find a declaration file」——补 @types、写 declare module，或换自带类型的包。

> **提示：两个实证。** react 本体的 package.json 只有 `"main": "index.js"`、没有 types 字段——它的类型完全来自 `@types/react` 回退；而 @dagrejs/dagre 自带 types，所以 devDependencies 里的 `@types/dagre` 已是冗余，可以删。

### 管道 B：全局注入与它的白名单

第二条管道与 import 无关：TS 启动时把 `typeRoots`（默认 node_modules/@types）下**所有包**的全局声明自动吸进项目——这就是为什么装了 @types/node 就到处能用 `process`、`Buffer`。副作用是「被动吸全量」：你只想用 A 包，B 包的全局污染也一起进来。`"types": ["vite/client"]` 就是白名单开关——把全局注入限定为 vite/client 一家。再次强调两条管道的分工：`types` 管**全局注入**，管不住显式 import 的解析——`import from "node:url"` 在白名单外照样找到类型。

为什么要有「全局注入」这条管道？因为有一类类型天然不走 import：运行时全局（装了 @types/node 才有的 `process`、`Buffer`）和「模块声明增强」（`declare module '*.css'`、`*?raw` 这类给非 JS 文件发合同的 ambient 声明）——它们必须预先进入全局作用域，按导入的解析瀑布够不着。注入是启动时一次性吸入的**批处理**，不是按查询解析——这也解释了 types 白名单的生效时机：改名单影响的是编译启动面，语言服务要重启、tsc 要重跑才重新吸入。

| 配置 | 管道 | 管什么 / 不管什么 |
|------|------|-----------------|
| paths | A（按导入） | 手动别名映射，优先级最高；管住导入解析，不影响全局注入 |
| typeRoots | B（全局注入） | 去哪找 @types 式包；不决定装了哪个包，只决定去哪找 |
| types | B（全局注入） | 全局注入的白名单；管不住显式 import 的解析 |

### @types 生态：没有版本联动的水池

`@types/react` 和 `react` 是**两个独立的 npm 包、独立的 semver**——TS 不会帮你匹配版本。错位的症状非常具体：react 18 配 @types/react 16，新 API（如 useId）类型不存在、组件签名对不上、甚至反向误报老 API 还在。对齐手段：升级主包时同步升 @types（大版本对齐）、用 Renovate/Dependabot 的分组更新把两者绑进同一个 PR。

「类型声明应该归发行方管」这个判断方向正确——自带类型是现代最佳实践，选依赖时「是否自带类型」本身就是维护质量的信号。但要给 @types 三个公道：

- **历史囚徒**——npm 十年的 JS 存量不可能都自带；
- **解耦红利**——类型可独立发版，社区几小时修一个类型 bug 不用等主包下个 release，React 官方是明确选择外包给 DefinitelyTyped 的；
- **Node 特例**——运行时不可能携带 TS 类型，@types/node 是准官方。

而且信任模型没变：自带也不代表正确（TS 从不核对声明与实现），**自带的优势是与实现同步的概率高，不是正确性高**。

**反例：主包与声明包错位**

```text
pnpm up react@18  # @types/react 留在 16
```

主包与声明包无自动联动——错位的症状是新 API 类型不存在、签名对不上，且极难第一时间想到根因。

**正例：大版本对齐 + 分组更新**

```text
pnpm up react@18 @types/react@18  # 或 Renovate 分组更新
```

大版本对齐 + 分组更新进同一个 PR；顺带定期清理已自带类型的冗余 @types。

**反例：依赖没带类型，随手通配**

```typescript
declare module "legacy-lib";
```

整个模块变 any，类型检查在此处静默失明。

**正例：按真实 API 补声明**

```typescript
// types/legacy-lib.d.ts
declare module "legacy-lib" {
  export function init(opts: { port: number }): void;
}
```

手写声明也走类型系统，错误能被拦下。

### 追问链

五问沿两条管道推进：先确认分工，再钻版本联动与生态判断。

**import react 的类型是从哪来的？**

来自 node_modules/@types/react。react 本体的 package.json 没有 types 字段（只有 main: index.js），所以瀑布走到「回退 @types」一级才命中——这也是 react 项目必须装 @types/react 的原因。自带类型的包（如 @xyflow/react）则在 exports/types 一级就命中。

**types 字段为什么管不住 import 的解析？**

因为 types 只控制「全局自动注入」这条管道：决定 typeRoots 下哪些包的全局声明被吸进项目。而显式 import 走的是按导入解析的瀑布，两者独立。所以配了 `types: ["vite/client"]` 的项目，`import from "node:url"` 照样能拿到 @types/node 的类型。

**react 18 配了 @types/react 16，具体会出什么问题？**

三联症状：新 API 的类型不存在（useId 报 Property 不存在）、签名对不上（18 改过的 props 类型按 16 的合同检查）、反向误报（16 有而 18 已删的 API 类型还在，编译过但运行时炸）。根因是两个独立 semver 的包被人为错位——TS 不会替你匹配。补充：反向错位（@types 比 react 新）更隐蔽——类型里存在的 API 运行时没有，症状特征是「类型全绿但运行时 undefined is not a function」，第一时间检查 @types 与主包版本。

**typesVersions 解决什么问题？为什么需要它？**

它是 types 字段解析上的版本分支：按消费方的 TS 编译器版本重定向声明入口——老 TS 读不懂新语法写的 .d.ts（直接 syntax error），typesVersions 让同一个包对 4.x 用户发旧写法声明、对 5.x 用户发新写法；分支命中时优先于常规 types 解析。注意这根轴是「TS 编译器版本」，与主包运行时版本的轴无关——两个维度，别混。

**「类型应归发行方管」——这个判断的边界在哪？**

方向对：自带类型是趋势，也是选依赖的维护质量信号。但边界有三：历史囚徒（JS 存量海洋不可能都自带）、解耦红利（类型可独立于运行时发版，React 官方明确外包给 DefinitelyTyped）、Node 特例（运行时无法自带 TS 类型）。而且自带不等于正确——信任模型下它只是「同步概率更高」。结论：优先自带，把 @types 当必要的基础设施并用对齐纪律管理它。

### 记忆点

- **两条管道互不干涉**——types 白名单管全局注入，管不住显式 import 的解析——配置不生效时先问走的是哪条管道。
- **@types 与主包无版本联动**——两个独立 semver：主包升级时同步升 @types，Renovate 分组更新绑进同一个 PR。

延伸阅读：类型检查、lint、格式化为什么不打架、import 的模块是怎么被解析找到的

---

## 8. references 和 tsc -b 解决什么？

*难度：高级 ｜ 标签：tsc -b、project references、tsbuildinfo、monorepo*

当一份 tsconfig 装不下两套语义（浏览器代码 vs Node 配置）、或一个 monorepo 里多个包互相依赖时，`references` 负责声明「谁依赖谁」，`tsc -b` 负责按依赖图的**拓扑序增量构建**。机制核心是**契约墙**：检查依赖方时不重查被依赖方的源码，只读它的 .d.ts 声明面——这是性能的秘密，也是声明文件之所以必须存在的原因之一。没有 references 时，`tsc -b` 退化为带增量的 tsc——单 tsconfig 仓库的现状，也是日后拆分预留的门。

### tsc -b 在编排什么

裸 `tsc` 一次只认一份 tsconfig，构建一个 program。`-b`（build 模式）换了世界观：它把 tsconfig 之间的 `references` 声明读成一张 **DAG**，按拓扑序构建——被依赖的项目先行，循环引用直接报错。每个子项目有自己的 tsbuildinfo 增量缓存，没变的子项目整个跳过，依赖方只在「依赖的声明面变了」时才重查。monorepo 里 core → ui → app 的链路上，改 core 只会触发 core 重查、ui 与 app 各自增量——这是 references 存在的第一理由。

单仓库拆分蓝图（浏览器代码与 Node 配置分离）：

```text
        tsconfig.json（空壳：files: [] + references）
          │
          ├── reference ──> tsconfig.app.json
          │     src/**，lib: DOM，types: vite/client
          │     └··> 独立的 tsbuildinfo 增量缓存
          │
          └── reference ──> tsconfig.node.json
                vite.config + plugins，lib: ES，types: node
                └··> 独立的 tsbuildinfo 增量缓存
```

浏览器代码需要 DOM 类型、不该看见 process；vite.config 和构建插件跑在 Node 进程里、需要 node:url 与 process、不该看见 window——两套 lib/types 语义共享一份声明只会互相污染。拆开后 `tsc -b` 按图分别检查，tsserver 也会自动把每个文件路由到它所属的子项目，编辑器侧无需额外配置。

### 契约墙：跨项目只读 .d.ts

检查 ui 项目时，它引用的 core 怎么算？references 的答案是：**不重查 core 的源码，只读 core 的声明输出（.d.ts）**。core 对 ui 暴露的不是实现，是一份类型合同——这就是契约墙。墙的好处是双向的：core 内部怎么重构，只要声明面不变，ui 就不必重查；ui 也不该越过 import core 的内部文件——边界即模块化。

墙需要原料：被引用的项目必须产出 .d.ts。这就是传统上 `composite: true` 强制要求「声明产出 + 增量」的原因——它在为契约墙备料。现代的纯检查型项目（noEmit，不产文件）已放宽此要求，Vite 官方模板的 tsconfig.app.json 就没有 composite——检查型引用不需要真的发货，只需要各自为政地查。

> **提示：单仓库拆分的完整三文件形态。** 根 tsconfig 只做壳（`files: []` 加 references），真实配置分居 app/node 两个子文件——build script 一个字不用改，`tsc -b` 自动按图编排。

三文件形态的完整配置：

```jsonc
// tsconfig.json —— 根壳
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

```jsonc
// tsconfig.app.json —— 浏览器代码
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "types": ["vite/client"],
    "verbatimModuleSyntax": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

```jsonc
// tsconfig.node.json —— Node 侧构建配置
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "noEmit": true
  },
  "include": ["vite.config.ts", "plugins"]
}
```

### 命令三件套与缓存纪律

| 命令 | 做什么 |
|------|--------|
| tsc -b | 按引用图拓扑序增量构建——写各项目自己的 tsbuildinfo |
| tsc -b --clean | 清掉产出与缓存——缓存发臭（配置改了缓存没失效）时的重置手段 |
| tsc -b --watch | 按图监听：改哪个项目查哪个，依赖方按声明面变化决定是否重查 |

仓库没有 references 时，`tsc -b` 的实际效果是「带增量的 tsc」：全项目查一遍、写 tsconfig.tsbuildinfo、报错即中断——与裸 `tsc --noEmit` 的差别主要就是增量缓存。顺手的纪律提醒：tsbuildinfo 是本地缓存（内容含机器相关路径），应该 gitignore。

缓存纪律的机制根源在 tsbuildinfo 的内容：它记录「上次检查时的文件集合、内容指纹与配置状态」，构建时先对账再决定查谁。两个推论：

- 配置指纹参与对账——改任何 compilerOptions 让整个缓存作废是设计行为而非 bug，代价是下次全量；
- 「改了代码却没重查」的反向症状多发生在契约墙场景——下游认的是上游的**声明面**，上游内部改动不触碰声明面就不触发下游重查，这是增量性的来源；只有当缓存状态与磁盘真实状态脱节时，才需要 `--clean` 强制对账。

### 四个高频坑

**坑一：include 边界互斥**

```text
// 反例：shared/ 被两个子项目同时圈进
// tsconfig.app.json:  "include": ["src", "shared"]
// tsconfig.node.json: "include": ["shared", "plugins"]
// → 报 file is not in project 类错误
```

拆分的第一纪律：每个文件恰好属于一个子项目——边界重叠时 tsc 与 tsserver 的项目归属判定都会失灵。

```text
// 正例：边界互斥；共享代码下沉成第三个项目
"include": ["src"]      // app
"include": ["plugins"]  // node
// shared 需要被两边用时：单独成项目被双方 reference
```

拿不准归属的目录不要两边都写——单独成项目是 references 世界的标准解法。

**坑二：引用环拆环**

```text
// 反例：app 引 ui，ui 又引 app
// app.json: "references": [{ "path": "./ui.json" }]
// ui.json:  "references": [{ "path": "./app.json" }]
// error TS6202: Project references may not form a circular graph
```

DAG 直接拒绝成环——循环依赖是设计问题，references 只是把它从运行期提前到了配置期。

```text
// 正例：把双方共享的部分下沉，环变 DAG
app ──> shared <── ui
```

最小修复是提取共享层：循环的两侧各自依赖它，互不引手——这也是 monorepo 包分层的基本功。

**坑三：缓存发臭先对账**

```bash
# 反例：下游「莫名没重查」→ 反复改代码重跑
tsc -b   # 命中陈旧 tsbuildinfo，依旧跳过

# 正例：先清缓存再构建
tsc -b --clean && tsc -b
```

契约墙只认声明面变化；缓存状态与磁盘脱节时，改再多源码也不会触发重查。排除缓存失灵之后，才轮到怀疑项目配置与依赖关系。

**坑四：编辑器内存路由滞后**

项目结构大改后 tsserver 的内存路由可能滞后（文件换了所属子项目，红线还是按旧 project 给的）——`Restart TS Server` 重建路由即可，机理与常驻 program 一致。

### 追问链

五问按「是什么 → 墙 → 编排 → 治理」推进，后两问偏架构判断。

**tsc -b 和裸 tsc --noEmit 差在哪？**

无 references 时几乎等价：tsc -b 就是带增量的 tsc（多产出 tsbuildinfo，下次跳过没变的文件）。有 references 时才是完整形态：按 DAG 拓扑序编排多个子项目、执行契约墙规则。所以单 tsconfig 仓库用 -b 无害且白赚增量，还为将来拆分预留了门。

**契约墙到底省了什么？**

省的是跨项目的全量重查：ui 依赖 core，若没有墙，core 改一行 ui 就得整个重查；有了墙，ui 只依赖 core 的 .d.ts——core 内部重构只要声明面不变，ui 完全不动。检查成本从「跟着实现走」变成「跟着合同走」，monorepo 的增量性由此而来。

**composite: true 强制的是什么？为什么契约墙需要它？**

它强制两件事：声明产出（declaration）和增量信息（incremental）。前者是墙的原料——被引用项目必须交出 .d.ts，依赖方才有合同可读；后者是编排的燃料——没有每项目的增量状态就谈不上跳过。纯检查型项目（noEmit）不发货，所以现代模板允许不开 composite。

**编辑器怎么决定一个文件属于哪个项目？**

tsserver 按 references 把文件路由到唯一所属的子项目，每个子项目一个 program，避免同一文件被多个 program 重复检查。这就是拆分配置后编辑器无需任何额外配置的原因——但项目结构大改后内存路由可能滞后，Restart TS Server 重建即可。

**什么信号出现时，才值得把单 tsconfig 拆成 references？**

两个信号：一是「一份 compilerOptions 装不下两个世界」（vite.config 需要 node types 而 src 需要 DOM，互相污染检查语义）；二是多包仓库出现明确的依赖方向与增量痛点（改 core 全仓重查）。只嫌一个 tsconfig 行数多不是理由——拆分引入 references 编排的心智成本，要先有真实的痛。单配置目前能用时（vite.config 在 DOM lib 下检查是纯度问题不是正确性问题），拆分收益中等——等插件目录变大、或 Node 侧 API 用深了再拆，三文件骨架随时可套。

### 记忆点

- **契约墙：跨项目只读 .d.ts**——依赖方读的是合同不是实现——core 内部怎么重构，声明面不变 ui 就不动。composite 曾是备料要求，纯检查型已放宽。
- **tsc -b = 按图的增量编排**——references 读成 DAG、拓扑序构建、每项目独立 tsbuildinfo；无 references 时退化为带增量的 tsc。

延伸阅读：.d.ts 声明文件到底解决什么问题、编辑器和构建的类型检查为什么会不一致

---

## 9. TypeScript 7 原生化改变了什么？

*难度：高级 ｜ 标签：TypeScript 7、Go、tsgo、原生编译器、LSP*

**TS 7 不是普通的版本号跳动**：编译器用 Go 整体重写、按平台分发原生二进制（官方口径大型代码库提速 8-12 倍）、语言服务换 LSP 协议、`strict` 默认开启。但「三个角色」的分工一格没变——tsc 还是审计、语言服务还是投影、剥类型转译器还是外人。真正的破坏面只有一处：**语言兼容 ≠ API 兼容**，把 typescript 包当库嵌入的工具断供，而零 API 依赖的技术栈无感。npm 包的心智也要换：它只是**分发容器**，执行的是原生进程。

### 为什么是原生，为什么是现在

JS 工具用 JS 写是 2012 年代的引导期选择——「跑在 node 上、零编译门槛」当时是正确决策。现在原生二进制加按平台分发的基建成熟了，热路径不值得再付 JS 的运行时代价，于是浪潮席卷整个工具链：esbuild（Go）、swc、Rspack、Rolldown、oxc/oxlint/oxfmt、Biome、Lightning CSS、Tailwind v4 的 Oxide 引擎全是 Rust 系，tsgo 是 Go 系，连 Python 生态都在复制这个剧本（ruff、uv）。TS 团队选 Go 的理由很务实：GC 语义与编译器天然合拍，且官方宣称大型代码库构建提速 8-12 倍——靠的是跨核并行解析、检查与产出。

分发方式随执行形态一起换：npm 包里那 20 行 `@typescript/typescript-darwin-arm64`、`typescript-linux-x64` 平台包（optionalDependencies 装对应平台的二进制），和 esbuild、oxlint 的套路一模一样。**npm 包从「运行时容器」变成了「分发容器」**——它负责下载、解压、链接，执行的根本不是 node。

### 实测：一条启动链的完整解剖

「node 能调度 Go 吗」这个问题本身就有个隐藏误解——不需要调度，node 只是个几十毫秒的打火机。逐层实测的真实启动链：

```text
node_modules/.bin/tsc（shell 脚本）
  │ exec node
  ▼
typescript/bin/tsc（一行 node 启动器）
  │ import
  ▼
lib/tsc.js（getExePath + execve）
  │ execve 进程替换
  ▼
平台二进制 Mach-O 原生进程
```

关键在最后一跳：`lib/tsc.js` 里用的是 `process.execve`——它用原生二进制**替换掉当前进程**，连 node 都不留；失败才降级为子进程方式。所有编译工作都发生在 Go 进程里。附带一个细节：平台二进制包里连 `lib.dom.d.ts` 这类标准库声明都随身携带——类型内核的行李跟着二进制走。

### 默认值变了什么，迁移怎么走

| 版本区间 | strict 与废弃项的状态 |
|---------|---------------------|
| TS 5.x | strict 默认关闭——老项目大多显式开启 |
| 6.0 | 默认值向 7 对齐并警告；废弃项可用 `ignoreDeprecations: "6.0"` 缓冲 |
| 7.0 | strict 默认 true、module 默认 esnext、5.x 起废弃的选项硬移除 |

三级火箭的最后一站的落点：迁移 7 的第一步永远是补显式配置，否则行为静默改变。迁移步骤：

- package.json 升级到 `typescript@^7`，lockfile 锁死平台二进制；
- tsconfig 补显式配置（`strict`、`module`），清掉废弃清单里的旧选项；
- 跑 `tsc -b --dry` 实测配置合法性——别信二手 changelog 的「某某被移除」传闻；
- 编辑器升级到新版，让 TS7 的原生语言服务（LSP）接管智能；
- 排查仓库里有没有 `import ts from "typescript"` 当库用的工具——这是唯一的大破坏面。

**反例：混用期各升各的**

```json
{
  "typescript": "^7.0.2",
  "some-ts-tool": "^3"
  // 间接依赖里还拖着 typescript@6
  // lockfile 出现两个版本 → 不同工具各用一份
}
```

6/7 混用期最常见的漂移源：检查结论随「用的是哪份 TS」而变，且症状离版本层很远，很难第一时间想到根因。

**正例：用 overrides 把所有间接依赖收敛到同一版本**

```json
{
  "pnpm": {
    "overrides": { "typescript": "^7.0.2" }
  }
}
// pnpm why typescript 验证全仓只剩一份
```

裁判必须唯一：所有把 typescript 当依赖的工具读同一份内核，结论才有对齐的前提。

> **提示：谁受创，谁无感。** 受创的是把 TS 当库嵌入的工具：vue-tsc/Volar、Next.js 的 TS 检测、ts-morph 一类——TS 7.0 暂无稳定编程 API（新 API 排在 7.1）。而 Vite + Oxc + oxlint 这类技术栈零 API 依赖，升级无痛。

**反例：把 typescript 包当库**

```typescript
import ts from "typescript";

const program = ts.createProgram(/* ... */);
// 7.0 下没有稳定 JS API 可用
```

把 typescript 包当库嵌入的自研脚本与工具在 7.0 直接断供——这不是编译行为变化，是 API 面被整体移除。

**正例：按「是否 import typescript 包」给工具分清单**

```json
{
  "scripts": {
    // 依赖 TS API 的工具留在 6.x 并存通道，等 7.1 新 API
    "check:legacy": "tsc6 --noEmit"
  }
}
// 构建链（Vite + Oxc）零 API 依赖，放心升 7
```

断供面只覆盖前者，后者升级无感。

### 原生浪潮的边界

「tsc 都原生化了，是不是所有工具都该重写？」——方向对，但边界要清楚。三个「不该」：

- **插件生态是护城河**——webpack 的价值一半在插件，Rspack 必须背上兼容包袱；
- **嵌入式 API 是硬伤**——TS 7 断供 JS API 瘫痪一票嵌入式工具就是活教训；
- **跑在浏览器里的工具没法原生**。

终态是分层公式：**热路径（解析/检查/转译/压缩）下沉原生，编排层与 UX 留在 JS/TS**——JS 不会退出工具链，它从引擎退成了外壳和胶水。

**npm 包的心智升级**

```text
反例：npm 包 = node 程序
旧心智：装包就是装一段 node 代码——对 TS 7、esbuild、oxlint 都已经不成立

正例：npm 包 = 分发容器
包负责下载解压链接，执行的是平台原生进程；node 最多当一次性的启动器（execve 后连它都没了）
```

### 追问链

五问从分发机制挖到迁移实务：每一问都基于实测证据。

**npm 包里怎么会有 Go 二进制？node 是怎么「调度」它的？**

不存在调度。npm 包只是分发容器：meta 包用 optionalDependencies 装对应平台的二进制，启动链是 shell shim → 一行 node 脚本 → lib/tsc.js 里 process.execve 用原生二进制替换整个进程。所有编译工作在 Go 进程里，node 只是几十毫秒的引导。补充：esbuild、oxlint、rollup 全是同一套路——平台二进制 + 薄启动器，识别标志是 lockfile 里成排的 \*-darwin-arm64 / \*-linux-x64 平台包。

**strict 默认变 true，对老项目意味着什么？**

没显式写 strict 的老项目升级后检查突然变严，一批之前放行的代码开始报错。所以迁移 7 的第一步是补显式配置：要么显式 strict: true 接受新语义，要么显式 false 锁住旧行为——关键是让配置意图明确，而不是依赖默认。

**「语言兼容 ≠ API 兼容」具体指什么？谁受创谁无感？**

这是 TS 7 最重要的区分——很多人把「我的代码能编译」等同于「生态没破坏」。语言兼容指你的 TS 代码语义在 7 下不变（检查行为与 6 对齐），这条是稳的；API 兼容指把 typescript 包当库 import 的那批工具，7.0 断供稳定 JS API，vue-tsc/Volar、Next.js 检测、ts-morph 受创。你的技术栈若不 import typescript 包（Vite + Oxc + oxlint 正是），完全无感。过渡期生态的标准解法：框架侧提供 tsc6 并存命令，让框架工具链继续跑 JS 版编译器，等 7.1 的新 API 落地再切。

**既然 tsc 都重写了，为什么不是所有 JS 工具都该原生重写？**

三个硬边界：插件生态是护城河（webpack 的价值一半在插件，重写必须背兼容包袱）；嵌入式 API 是硬伤（TS 7 断供 API 瘫痪嵌入式工具，就是活教训）；跑在浏览器里的工具没法原生。终态是热路径下沉原生、编排层留在 JS。

**「TS 7 移除了 baseUrl」这个说法怎么鉴别真伪？**

实测，且以自己仓库的实际配置为准。「已移除」「仅废弃」「改默认」三档语义经常被二手资料混为一谈——而同一条配置在不同仓库里（显式声明、继承默认、压根没写）得到的实测结论可以完全不同，任何示范仓库的现状都替代不了你自己的验证：临时分支上跑一遍 tsc -b --dry，报不报错一目了然。通用流程：官方 release notes 查原文确认档位 → 自己仓库 --dry 或临时分支实测 → 再决定是否改配置。求证成本五分钟，远低于误改配置的排查成本。

### 记忆点

- **npm 包是分发容器**——下载解压链接二进制，执行的是原生进程——node 只是 execve 前的打火机。
- **热路径下沉原生**——解析/检查/转译/压缩交给原生二进制，编排与 UX 留在 JS——JS 从引擎退成外壳和胶水。

延伸阅读：编辑器和构建的类型检查为什么会不一致、编辑器的 TS 智能是怎么来的

---

## 10. 类型检查、lint、格式化为什么不打架？

*难度：进阶 ｜ 标签：工具治理、oxlint、oxfmt、职责分离、CI*

tsserver 画红线、oxlint 报警告、oxfmt 改格式、tsc 拦构建——多工具**重复是常态，冲突要分型**：同内核多形态（tsserver vs tsc）要防漂移；多内核抢同一职责（双 formatter）要指定唯一权威；接缝双事实（alias vs paths）要收敛单一源。治理四板斧：**投影、委托、契约、版本锚定**。原则一句话：**同一职责允许多形态，不允许多内核**。

### 先把职责摆平

讨论冲突之前先看「谁真正拥有什么」——职责矩阵一旦清晰，大部分「冲突」自动消解为「各司其职」：

| 职责 | 唯一权威 | 编辑器的角色 |
|------|---------|-------------|
| 类型语义与检查 | tsc 类型检查器内核 | tsserver 是它的交互投影 |
| 转译产出 JS | esbuild / Oxc（Vite 内嵌） | 无——tsc 因 noEmit 退出竞争 |
| 模块解析（类型侧） | tsconfig paths | tsserver 用它跳转与补全 |
| 模块解析（运行时） | vite resolve.alias | 无——需要与 paths 人肉对齐 |
| 格式化 | oxfmt | 保存时委托执行，内置 formatter 禁用 |
| lint | oxlint | 同屏第二视角（警告色） |

这张矩阵的读法是**先问归属、再谈工具**：任何一处「打架」，先定位它属于哪一行职责，再看该行的唯一权威是否真的唯一——冲突九成出在「同一行出现两个权威」（两个 formatter、两套类型诊断），而不是「行与行之间」。留意「编辑器的角色」一列：没有一行是编辑器当权威，它全部是投影或委托——这正是四板斧前两条的雏形。职责清晰的副产品是排错路径收敛：格式乱了查 oxfmt 配置、类型错了查 tsconfig，不再有「哪个工具改了我的文件」的悬案。

### 三种冲突型

| 型 | 本质 | 典型标本 | 解法 |
|----|------|---------|------|
| A 假冲突 | 同内核多形态——防的是主从延迟 | tsserver vs tsc（实时查询 vs 跑批） | 版本锚定 + include 写全 |
| B 真冲突 | 多内核抢同一职责 | prettier vs 编辑器内置 formatter；Volar vs tsserver 双诊断 | 指定唯一权威，其余降级或接管 |
| C 结构冲突 | 接缝双事实漂移 | vite alias vs tsconfig paths | 收敛单一事实源（插件化） |

A 型用数据库锚点最准：tsserver 和 tsc 是同一存储引擎的常驻查询与跑批作业——像主库与只读副本，要防的不是「打架」而是**主从延迟**。B 型最经典的现场是格式化：prettier 和 IDE 内置 formatter 同时开，保存后互相改写，每个前端都经历过；Vue 生态的 Volar 与 tsserver 给 .vue 出双份诊断，Volar 1.x 的 take-over mode 就是为消灭这个冲突而生——2.x 起 Vue - Official 已把这套整合做成默认行为。C 型则是模块解析篇讲过的双份事实——改一漏一的分裂症状。

### 四板斧

- **投影**：UI 层不另立判断，只渲染内核结论——红线与补全是 tsserver 的投影，不是编辑器自己的观点；
- **委托**：编辑器从实现者降级为触发器——保存时 exec oxfmt/oxlint，内置 formatter 禁用；
- **契约**：tsconfig 做多读者的共享事实源，接缝能用插件对齐就插件化（vite-tsconfig-paths）；
- **版本锚定**：所有裁判型工具（编译器/linter/formatter）的版本从 lockfile 和工作区取，不从编辑器内置取——mise 的「声明式单一来源」哲学在 TS 上的应用。

版本锚定值得单独展开「为什么」：裁判型工具的版本直接决定判断语义——TS 的 minor 都可能加检查，linter 的规则集随版本增删，而编辑器内置版随编辑器发布节奏走，与项目 lockfile 毫无关系。不锚定，等于把「代码对不对」的裁判权交给一个不属于项目的版本：同一份代码在不同成员的机器上得出不同结论——这正是 A 型冲突（漂移）的完整成因。锚定的本质是把**判断语义**也纳入声明式单一来源：package.json 声明、lockfile 锁定、编辑器用 tsdk 指路（VSCode）或自动探测（IDEA），与版本漂移篇的统一链条是同一条链。

### 重复检查的最佳实践

「tsserver 和 oxlint 同时报错」「CI 里 lint 和 tsc 串行跑」——这些都不是重复检测，因为两边的职责本来就不同：**tsc/tsserver 管「类型对不对」（正确性），linter 管「写法好不好」（风格、坑、框架约定）**。真实的冲突出在规则交集上，治理就是消除交集：

- **规则去重**：tsconfig 开了 `noUnusedLocals`/`noUnusedParameters`，linter 对应规则关掉；TS 项目里 no-undef 类规则全部不配（tsc 全权负责，linter 那份还会误报）；
- **编辑器三报告共存是特性**：红色波浪线（类型错）与黄色警告（写法问题）是两个视角——规则不重叠就不会同一处报两次；
- **CI 双门禁串行**：`format:check → lint → tsc -b && vite build`——便宜的先跑，正确性门禁挡在构建前，各查各的；
- **永不同时跑两个 linter**：eslint + oxlint 二选一——那才是真正的 B 型冲突。

> **提示：oxlint 为什么快。** linter 的 TS 支持分两档：语法级规则（不向编译器买类型信息，快）与类型感知规则（要请求 tsc 的类型，慢一个数量级）。oxlint 绝大多数规则是语法级——这是它快和「与 tsc 无版本耦合」的共同根源。

**格式化的唯一权威**

```text
反例：prettier + 内置 formatter 都开
B 型冲突现场：保存触发两套格式化引擎互相改写，diff 噪音与无限循环的根源

正例：default formatter = oxfmt，内置禁用
每职责唯一权威，编辑器降级为触发器——保存委托执行 oxfmt，格式永不拉锯
```

**格式规则不进 lint**

```jsonc
// 反例：把格式规则写进 lint，与格式化工具争抢同一批字符
{ "rules": { "indent": ["error", 2], "quotes": ["error", "double"] } }

// 正例：lint 管代码质量，格式全部交给 oxfmt
{ "rules": { "eqeqeq": "error" } } // 格式规则一个不留
```

### 追问链

五问从「是不是冲突」问到「怎么落到配置」：分型能力比背结论重要。

**tsserver 和 oxlint 同时在文件里报错，是冲突吗？**

不是，是两个视角。tsserver 报类型语义（红线），oxlint 报写法与坑（警告色）——只要规则清单不重叠，同一处不会被报两次。真正的重复是两边都开了 no-unused-vars 这类同语义规则，解法是规则去重而不是砍掉一边。

**prettier 和编辑器内置 formatter 打架，怎么治？**

指定唯一权威并降级其余：编辑器 default formatter 设为 prettier（或 oxfmt），禁用内置格式化，format on save 只委托一个引擎。根治判断：看 team 里格式化的事实标准是什么，让编辑器配置跟着二进制走，而不是各配各的。

**Volar 为什么要「接管」tsserver？**

因为 .vue 不在 tsserver 认识的文件类型里，且 tsserver 插件只能增强已有类型、不能认识新类型。Volar 必须包装甚至接管 tsserver 才能让类型内核服务 .vue；不接管就会出现两套诊断同屏的 B 型冲突——Volar 1.x 的 take-over mode 就是为消灭双诊断设计的，2.x 起 Vue - Official 已把这套整合做成默认行为。

**CI 里 lint 和 tsc 串行跑，算重复检测吗？门禁顺序怎么定？**

不算。lint 查风格与坑，tsc 查类型正确性，规则去重之后两者检查的是不相交的集合。顺序按成本排：format:check（最便宜）→ lint → tsc -b && vite build——让最便宜的失败最快暴露，正确性门禁挡在产出之前。补充：pre-commit 钩子只放语法级便宜检查（对暂存文件跑 oxfmt/oxlint），tsc 全量放 CI——本地反馈速度与门禁完整性两头都要。

**「允许多形态，禁止多内核」怎么落到具体配置？**

四条配置对应四板斧：投影——红线只认 tsserver，编辑器不装第二套类型诊断；委托——default formatter 指向 oxfmt、内置禁用，lint 由 oxlint 一家负责；契约——tsconfig 做共享源，alias/paths 这类接缝用 vite-tsconfig-paths 收敛；版本锚定——提交 typescript.tsdk、裁判型工具版本全部来自 lockfile。逐条自查，多内核无处藏身。

### 记忆点

- **允许多形态，禁止多内核**——tsserver 与 tsc 是同内核的两形态（防漂移）；双 formatter、双 linter 是多内核（必起冲突）。
- **四板斧：投影·委托·契约·锚定**——UI 渲染内核结论、编辑器降级为触发器、配置收敛单一源、裁判版本来自 lockfile——多工具治理的完整动作集。

延伸阅读：TypeScript 在工程里到底扮演什么角色、编辑器和构建的类型检查为什么会不一致
