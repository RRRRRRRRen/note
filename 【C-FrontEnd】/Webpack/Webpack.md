# Webpack

## 概念

### 入口起点(entry points)

> **入口起点(entry point)** 指示 webpack 应该使用哪个模块，来作为构建其内部 [依赖图(dependency graph)](https://www.webpackjs.com/concepts/dependency-graph/) 的开始。进入入口起点后，webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖的。

**单个入口语法**

```js
module.exports = {
  entry: './path/to/my/entry/file.js'
};
```

**多页面应用程序入口语法**

```js
module.exports = {
  entry: {
    pageOne: './src/pageOne/index.js',
    pageTwo: './src/pageTwo/index.js',
    pageThree: './src/pageThree/index.js'
  }
};
```



### 输出(output)

> 配置 `output` 选项可以控制 webpack 如何向硬盘写入编译文件。注意，即使可以存在多个 `entry` 起点，但只指定一个 `output` 配置。

**单个输出语法**

```js
module.exports = {
  output: {
    filename: 'bundle.js',
  }
};
```

此配置将一个单独的 `bundle.js` 文件输出到 `dist` 目录中。

**多个输出语法**

```js
module.exports = {
  entry: {
    app: './src/app.js',
    search: './src/search.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  }
};
// 写入到硬盘：./dist/app.js, ./dist/search.js
```

如果配置创建了多个单独的 “chunk”（例如，使用多个入口起点，则应该使用占位符(如`[name]`，`[hash]`)来确保每个文件具有唯一的名称。



### 模式(mode)

> 提供 `mode` 配置选项，告知 webpack 使用相应环境的内置优化。可能的值有：`none`, `development` 或 `production`（默认）。

**通过配置设置**

```js
module.exports = {
  mode: 'production'
};
```

**通过cli参数传入**

```zsh
webpack --mode=production
```



### loader

> loader 用于对模块的源代码进行转换。loader 可以使你在 `import` 或”加载”模块时预处理文件。loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript ，或将内联图像转换为 data URL。loader 甚至允许你直接在 JavaScript 模块中 `import` CSS文件！

**通过配置使用**

> 在 **webpack.config.js** 文件中指定 loader。

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          { loader: 'sass-loader' }
        ]
      }
    ]
  }
};
```

`module.rules`允许你在 webpack 配置中指定多个 loader。 这种方式是展示 loader 的一种简明方式，并且有助于使代码变得简洁和易于维护。同时让你对各个 loader 有个全局概览：

*loader 从右到左地取值(evaluate)/执行(execute)。*在下面的示例中，从 sass-loader 开始执行，然后继续执行 css-loader，最后以 style-loader 为结束。

**通过内联语句使用(不推荐)**

> 可以在 `import` 语句或任何 [等同于 “import” 的方法](https://www.bookstack.cn/read/webpack-v4.44.1-zh/d390b5c9bf1ce165.md) 中指定 loader。使用 `!` 将资源中的 loader 分开。每个部分都会相对于当前目录解析。

```js
import Styles from 'style-loader!css-loader?modules!./styles.css';
```

**通过命令行使用**

> 还可以通过 CLI 使用 loader

```zsh
webpack --module-bind jade-loader --module-bind 'css=style-loader!css-loader'
```



### 插件(plugin)

> loader 用于转换某些类型的模块，而插件则可以用于执行范围更广的任务。包括：打包优化，资源管理，注入环境变量。

```js
const HtmlWebpackPlugin = require('html-webpack-plugin'); //通过 npm 安装
const webpack = require('webpack'); //访问内置的插件
const path = require('path');
module.exports = {
  entry: './path/to/my/entry/file.js',
  output: {
    filename: 'my-first-webpack.bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({template: './src/index.html'})
  ]
};
```

由于**插件**可以携带参数/选项，你必须在 webpack 配置中，向 `plugins` 属性传入 `new` 实例。



## 配置：output

> `output` 位于对象最顶级键(key)，包括了一组选项，指示 webpack 如何去输出、以及在哪里输出你的「bundle、asset 和其他你所打包或使用 webpack 载入的任何内容」。

### `output.auxiliaryComment`

> 在和 [`output.library`](https://www.bookstack.cn/read/webpack-v4.44.1-zh/dfea437cfda7390c.md#output-library) 和 [`output.libraryTarget`](https://www.bookstack.cn/read/webpack-v4.44.1-zh/dfea437cfda7390c.md#output-librarytarget) 一起使用时，此选项允许用户向导出容器(export wrapper)中插入注释。要为 `libraryTarget` 每种类型都插入相同的注释，将 `auxiliaryComment` 设置为一个字符串：

```js
module.exports = {
  //...
  output: {
    library: 'someLibName',
    libraryTarget: 'umd',
    filename: 'someLibName.js',
    auxiliaryComment: 'Test Comment'
  }
};
```

将会生成如下：

```js
(function webpackUniversalModuleDefinition(root, factory) {
  // Test Comment
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory(require('lodash'));
  // Test Comment
  else if(typeof define === 'function' && define.amd)
    define(['lodash'], factory);
  // Test Comment
  else if(typeof exports === 'object')
    exports['someLibName'] = factory(require('lodash'));
  // Test Comment
  else
    root['someLibName'] = factory(root['_']);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
  // ...
});
```

对于 `libraryTarget` 每种类型的注释进行更细粒度地控制，请传入一个对象：

```js
module.exports = {
  //...
  output: {
    //...
    auxiliaryComment: {
      root: 'Root Comment',
      commonjs: 'CommonJS Comment',
      commonjs2: 'CommonJS2 Comment',
      amd: 'AMD Comment'
    }
  }
};
```

### `output.chunkFilename`

> 此选项决定了非入口(non-entry) chunk 文件的名称。

### `output.chunkLoadTimeout`

> chunk 请求到期之前的毫秒数，默认为 120 000。

### `output.crossOriginLoading`

> 只用于 [`target`](https://www.bookstack.cn/read/webpack-v4.44.1-zh/172f68b0be6c8f1a.md) 是 web，使用 JSONP 来按需加载 chunk。

`crossOriginLoading: false` - 禁用跨域加载（默认）

`crossOriginLoading: 'anonymous'` - **不带凭据(credential)**启用跨域加载

`crossOriginLoading: 'use-credentials'` - **带凭据(credential)**启用跨域加载 **with credentials**

### `output.jsonpScriptType`

> 允许自定义 `script` 的类型，webpack 会将 `script` 标签注入到 DOM 中以下载异步 chunk。

- `'text/javascript'`（默认）
- `'module'`：与 ES6 就绪代码一起使用。

### `output.devtoolFallbackModuleFilenameTemplate`

> 当上面的模板字符串或函数产生重复时使用的备用内容。

### `output.devtoolLineToLine`(即将弃用)

> 对所有或某些模块启用「行到行映射(line to line mapping)」。这将生成基本的源映射(source map)，即生成资源(generated source)的每一行，映射到原始资源(original source)的同一行。这是一个性能优化点，并且应该只需要输入行(input line)和生成行(generated line)相匹配时才使用。

传入 boolean 值，对所有模块启用或禁用此功能（默认 `false`）。对象可有 `test`, `include`, `exclude` 三种属性。例如，对某个特定目录中所有 javascript 文件启用此功能：

```js
module.exports = {
  //...
  output: {
    devtoolLineToLine: { test: /\.js$/, include: 'src/utilities' }
  }
};
```

### `output.devtoolModuleFilenameTemplate`

> 此选项仅在 「[`devtool`](https://www.bookstack.cn/read/webpack-v4.44.1-zh/7328c477e15116ca.md) 使用了需要模块名称的选项」时使用。
>
> 自定义每个 source map 的 `sources` 数组中使用的名称。可以通过传递模板字符串(template string)或者函数来完成。

### `output.devtoolNamespace`

> 此选项确定 [`output.devtoolModuleFilenameTemplate`](https://www.bookstack.cn/read/webpack-v4.44.1-zh/dfea437cfda7390c.md#output-devtoolmodulefilenametemplate) 使用的模块名称空间。未指定时的默认值为：[`output.library`](https://www.bookstack.cn/read/webpack-v4.44.1-zh/dfea437cfda7390c.md#output-library)。在加载多个通过 webpack 构建的 library 时，用于防止 source map 中源文件路径冲突。

例如，如果你有两个 library，分别使用命名空间 `library1` 和 `library2`，并且都有一个文件 `./src/index.js`（可能具有不同内容），它们会将这些文件暴露为 `webpack://library1/./src/index.js` 和 `webpack://library2/./src/index.js`。

### `output.filename`

> 此选项决定了每个输出 bundle 的名称。这些 bundle 将写入到 [`output.path`](https://www.bookstack.cn/read/webpack-v4.44.1-zh/dfea437cfda7390c.md#output-path) 选项指定的目录下。

对于单个[`入口`](https://www.bookstack.cn/read/webpack-v4.44.1-zh/41011893b347e0b7.md#entry)起点，filename 会是一个静态名称。

```js
module.exports = {
  //...
  output: {
    filename: 'bundle.js'
  }
};
```

当通过多个入口起点(entry point)、代码拆分(code splitting)或各种插件(plugin)创建多个 bundle

```js
module.exports = {
  //...
  output: {
    // 使用入口名称
    filename: '[name].bundle.js'
    // 使用内部 chunk id
    filename: '[id].bundle.js'
    // 模块标志符的hash值
    filename: '[name].[hash].bundle.js'
    // 生成的chunk的hash值
    filename: '[chunkhash].bundle.js'
    // 文件内容的hash值
    filename: '[contenthash].bundle.css'
    // 使用函数自定义命名
    filename: (chunkData) => {
      return chunkData.chunk.name === 'main' ? '[name].js': '[name]/[name].js';
    },
  }
};
```

### `output.globalObject`

> ？

### `output.hashDigest`

> 在生成 hash 时使用的编码方式，默认为 `'hex'`。

### `output.hashDigestLength`

> 生成的hash长度，默认为 `20`。

### `output.hashFunction`

> 生成hash使用的算法，默认为 `'md4'`。

### `output.hashSalt`

> 一个可选的加盐值

### `output.hotUpdateChunkFilename`

> 自定义热更新 chunk 的文件名。占位符只能是 `[id]` 和 `[hash]`。

```js
// 默认值
module.exports = {
  //...
  output: {
    hotUpdateChunkFilename: '[id].[hash].hot-update.js'
  }
};
```

### `output.hotUpdateFunction`

> 只在 [`target`](https://www.bookstack.cn/read/webpack-v4.44.1-zh/172f68b0be6c8f1a.md) 是 web 时使用，用于加载热更新(hot update)的 JSONP 函数。

### `output.hotUpdateMainFilename`

> 自定义热更新的主文件名(main filename)。

```js
// 默认值
module.exports = {
  //...
  output: {
    hotUpdateMainFilename: '[hash].hot-update.json'
  }
};
```

### `output.jsonpFunction`

> 只在 [`target`](https://www.bookstack.cn/read/webpack-v4.44.1-zh/172f68b0be6c8f1a.md) 是 web 时使用，用于按需加载(load on-demand) chunk 的 JSONP 函数。

### `output.library`

> `output.library` 的值的作用，取决于[`output.libraryTarget`](https://www.bookstack.cn/read/webpack-v4.44.1-zh/dfea437cfda7390c.md#output-librarytarget) 选项的值；



## 构建工具到底解决了什么问题？

*难度：入门 ｜ 标签：webpack、构建、依赖图、工程化*

**构建工具解决的是「浏览器只认 HTML/CSS/JS，而工程代码不是这三样」的落差**：把几百个模块静态分析成**依赖图**、把 TS/JSX/Sass 转译成浏览器能跑的形态、再把图组装优化成少量高缓存友好的产物。webpack 的一次构建是五步流水线：初始化 → 从 entry 转换模块 → 递归建图 → 封装 chunk → 渲染输出。理解了「依赖图是核心数据结构」，loader/plugin/tree-shaking/HMR 全都是挂在这张图上的不同介入点。

延伸阅读：从输入 URL 到页面渲染，中间发生了什么？——本篇讲「源码怎么变成产物」，那篇讲「产物怎么变成页面」，构建与渲染是同一条链路的上下游。

### 三件事：模块化、转译、打包优化

第一件**模块化**：ES Module 虽已是浏览器原生标准，但工程代码的依赖形态远超原生加载的能力——几百个模块在 HTTP 上逐个请求是瀑布灾难，且依赖关系需要一张**完整的静态图**才能做删除、分割、缓存哈希这些优化，浏览器不会替你建这张图。构建工具从 entry 出发解析 import，把整个项目折成一（或几）个文件。

第二件**转译**：TS、JSX、Sass 根本不是浏览器认识的语言——TS 要降成 JS、JSX 标签要变成 createElement 调用——转译不只是语法替换，还包含降级（把新语法编译成旧语法以兼容目标浏览器，按 browserslist 精确控制）。

第三件**打包优化**：压缩混淆、内容指纹命名（文件内容变 → 文件名变 → HTTP 缓存精准失效）、代码分割（首屏只下首屏要用的 chunk）。

三件事共用同一张依赖图，所以现代构建工具的全部差异，本质上都是「建图方式」与「图的利用方式」的差异。

### webpack 的一次构建：从 entry 到 dist

webpack 的构建流程分五步：**初始化**（读配置、合并命令行参数、实例化 Compiler）→ 从 entry 出发调用 loader 转换每个模块并解析依赖 → **递归建依赖图**（每个文件是一个 module，解析出的新依赖继续走转换，直到图闭合）→ **封装 chunk**（按 entry 与分割规则把模块分组）→ **渲染输出**（生成 bundle 代码、压缩、写 dist）。整条流水线由 Tapable 事件流驱动——这就是 plugin 能在任意时机介入的原因。

```text
初始化：合并配置 → 实例化 Compiler
        │
        ▼
从 entry 出发，调用 loader 转换模块 ◄────────┐
        │                                   │
        ▼                                   │ 新依赖继续转换
解析 import/require → 递归建依赖图 ──────────┘
        │  依赖图完成
        ▼
封装 chunk（entry + 代码分割规则）
        │
        ▼
渲染输出：压缩、指纹、写 dist
```

### 「翻译」的内部：babel 的三步

转译环节以 babel 为代表，是编译原理的最小实用集：**parse**（词法分析切 token 流、语法分析建 AST）→ **transform**（`@babel/traverse` 深度优先遍历 AST，visitor 模式对命中节点增删改——所有语法降级、JSX 转换都发生在这里）→ **generate**（把新 AST 反代回代码字符串并生成 sourcemap）。插件写的就是 visitor 里的节点处理函数。

这条管线的截取思维很有解释力：eslint 只到 AST 就停（检查而不生成代码）、prettier 用 AST 做排版、压缩器在 AST 层做死代码消除——同一套编译管线，截取不同阶段就是不同工具。看懂这一点，工程化工具链的文档就都能按同一个骨架去读。

### 整合应用：让构建保持快

构建慢的根源是「依赖图太大、每个节点都做了贵操作」。提速三板斧对应三个治法：

- **缩小范围**：loader 配 include/exclude（node_modules 不必过 babel）、精简 resolve.modules/extensions、用 alias 减少查找
- **持久化缓存**：webpack 5 的 `cache: { type: 'filesystem' }` 把模块图与产物缓存到磁盘，二次构建只重建变更子图（更早的 dll 方案已被它淘汰）
- **并行/换引擎**：thread-loader 多进程，或 esbuild-loader 直接换掉重负载环节

Vite 的答案是釜底抽薪：dev 阶段**不打包**——浏览器原生 ESM 按需请求，Vite 只做 esbuild 预构建依赖（把 CJS 依赖合并成单 ESM 文件）和按请求即时编译源码，启动时间与项目规模解耦；生产仍打包（Rollup）。代价与边界见下方追问链。

```text
┌────────────── 提速三板斧 ──────────────┐
│ ① 缩小范围     ② 持久化缓存    ③ 并行/换引擎 │
│ include/       filesystem     thread-loader │
│ exclude        cache          esbuild-loader │
└────────────────────────────────────────┘
```

- 定位慢在哪一步用 `--profile` / speed-measure，先测量再优化

### 经典追问链

错误写法：

```html
<!-- index.html：手工维护依赖顺序 -->
<script src="jquery.js"></script>
<script src="app.js"></script> <!-- 依赖 cart.js，顺序错了就 undefined -->
```

说明：几十个标签手工排序、依赖关系靠脑记——这正是构建工具要解决的原始问题。

正确写法：

```js
// app.js
import $ from "jquery"; // 依赖显式声明
import { initCart } from "./cart.js"; // 工具按依赖图自动排序去重
```

说明：声明式依赖：顺序、去重、循环检测全部交给工具。

**module、chunk、bundle 三个概念到底是什么关系？**

*考点：热身题，校准词汇——这三个词混用的人，构建流程的叙述一定会串。*

module 是依赖图的节点（每个文件经 loader 转换后的单元）；chunk 是输出阶段的分组——按 entry 和分割规则把一批 module 打包在一起；bundle 是 chunk 渲染成的最终文件。一句话：构建阶段操作 module，输出阶段组织 chunk，落盘的是 bundle。一个 chunk 通常产出一个 bundle，但内联小 chunk 等场景下不必一一对应。

延伸：splitChunks 优化的对象是 chunk 的划分策略——说「优化 bundle」是外行话，说「调整 chunk 拆分」才是准确的。

**babel 把字符串变成可运行代码分几步？AST 在哪一步？**

*考点：考编译原理最小集——词法/语法/转换/生成四个词能说出来是及格，说清 visitor 遍历替换才是进阶。*

三步：parse（词法分析切成 token 流，语法分析建 AST）→ transform（`@babel/traverse` 深度优先遍历 AST，visitor 模式对命中节点做增删改——所有语法降级、React JSX 转换都发生在这一层）→ generate（把新 AST 反代回代码字符串并生成 sourcemap）。插件写的就是 visitor 里的节点处理函数。

延伸：推论：eslint 只到 AST 就停了（检查不生成代码），prettier 用 AST 排版——同一条编译管线，截取不同阶段就是不同工具。

**动态 import() 在依赖图里是什么？它和普通 import 的建图行为差在哪？**

*考点：考「图怎么被切割」——答得出「分割点」说明理解代码分割的机制而非只会写 lazy()。*

静态 import 是建图阶段就直接连上的边（模块进主 chunk）；动态 import() 是一个「标记为分割点」的边——webpack 仍会静态分析出目标模块（所以路径不能完全运行时拼接），但把它切进独立 chunk，运行时按需以 JSONP/fetch 方式加载。这就是路由懒加载的全部机制：React.lazy 包的就是这个动态 import 返回的 Promise。

延伸：魔法注释 `/* webpackPrefetch: true */` / `/* webpackPreload: true */` 控制的是这个新 chunk 的加载时机：prefetch 闲时拉（未来可能用），preload 当前导航就要（关键依赖）。

**两个模块循环引用，webpack 怎么处理？运行时行为是什么？**

*考点：考依赖图的边界情况——能说清「图能建出来但执行顺序有讲究」的，是真的想过模块语义。*

建图不成问题（a 引 b、b 引 a，两条边都记录），问题在执行顺序：webpack 按深度优先从 entry 执行模块，循环处后回来的那个模块会先拿到「尚未执行完」的对方的导出——ESM 下表现为 live binding（绑定存在，值待填），访问时机不当就是 undefined。CJS 下拿到的是不完整的 module.exports 副本。工程解法是打破循环：把共享逻辑抽到第三个模块，或把「需要对方」的操作推迟到函数调用时（运行时图已闭合）。

延伸：ESM 的 live binding 让循环比 CJS 友好：导出的是绑定而非值拷贝，只要「使用时机」晚于「赋值时机」就能拿到正确值——TDZ 报错也发生在这一层。

**Vite dev 为什么快？它付出的代价是什么？**

*考点：压轴题，考「按需编译」与「请求瀑布」的权衡——能同时说出代价与补救手段，说明理解了架构而非站队。*

快在把「打包」从启动路径上拿掉了：webpack 启动要先把整个依赖图打包完才能给你看页面；Vite 启动只起一个 dev server，页面按原生 ESM 的 import 链路现用现编译——入口小，启动时间与项目规模解耦。依赖（node_modules）用 esbuild 预构建成单个 ESM 文件，避免几百个请求的瀑布。代价有三：首次访问某路由仍要现场编译（有短暂等待）；深层 import 链在 HTTP/1.1 下请求瀑布明显（靠预构建和 HTTP/2 缓解）；生产仍要打包（Rollup），dev 与 prod 的行为差异偶尔踩坑。

延伸：生态动向：Vite 团队正在用 Rust（rolldown/oxc）替换 Rollup 与 esbuild 环节，目标是 dev/prod 统一引擎——「双引擎行为不一致」这个最后的代价也在被消解。

延伸阅读：Loader 与 Plugin 的分界线在哪里？——依赖图的两种介入方式：转换单个文件，还是钩住构建生命周期。

延伸阅读：为什么 tree-shaking 摇不动 CJS？——图的利用方式之一：依赖图必须「静态」才能安全删代码。



## Loader 与 Plugin 的分界线在哪里？

*难度：进阶 ｜ 标签：webpack、loader、plugin、Tapable*

**分界线一句话：loader 管单个文件内容的转换，plugin 管构建过程的介入**。loader 是「源码字符串进、目标字符串出」的纯函数，按管道串联（从右到左 = 函数组合），无状态、可缓存；plugin 是带 `apply(compiler)` 的对象，通过 Tapable 钩子挂在编译启动、模块转换完成、chunk 生成、产物落盘等任意时机，拥有构建全局视角。判断标准：只需要「这一个文件的内容」就是 loader；需要「别的模块的信息 / 产物的操作 / 构建时机的控制」就只能 plugin。

延伸阅读：构建工具到底解决了什么问题？——依赖图是本篇的坐标系：loader 作用在图的节点（module）上，plugin 作用在图的构建过程（compiler/compilation）上。

### 一句话分界：内容 vs 过程

webpack 的两大扩展机制各管一段：loader 出现在「节点转换」环节——每个文件被读进来后、变成 module 之前，必须经过 loader 管道把 TS/JSX/Sass 翻译成 webpack 能分析的 JavaScript；plugin 出现在其余一切环节——从编译启动到产物写盘的每个时机都是 Tapable 事件流上的一个钩子，plugin 订阅钩子拿到控制权。HtmlWebpackPlugin 生成 HTML、MiniCssExtractPlugin 抽离 CSS、DefinePlugin 注入常量，全是「管流程」而非「转文件」。

这个分界不是「功能强弱」，而是**数据可见范围**的差异：loader 的输入只有当前文件的内容（加上通过 this 上下文拿到的 options 与查询参数），看不到别的模块、看不到产物；plugin 手里的 compiler/compilation 引用通向整张依赖图与全部 assets。你写的逻辑如果需要「跨模块的信息」或「产物的操作」，写成 loader 在架构上就不成立。

| 维度 | Loader = 文件转换器 | Plugin = 生命周期钩子 |
| --- | --- | --- |
| 本质 | 输入源码、输出代码的纯函数 | apply(compiler) + Tapable 钩子订阅 |
| 组织方式 | 管道式串联，执行顺序从右到左 | 介入任意构建阶段，可改产物、注资源、发日志 |
| 视角 | 只面对单个文件内容，无全局视角 | 拥有构建全局视角（compiler/compilation） |
| 典型代表 | babel-loader、sass-loader、ts-loader | HtmlWebpackPlugin、MiniCssExtractPlugin、DefinePlugin |

### Loader 的数据流与纪律

管道的执行顺序是函数组合：`use: ['style-loader', 'css-loader']` 等价于 `styleLoader(cssLoader(source))`——后写的包在外层，内容先经过 css-loader。两个常被追问的细节都在这里：loader 的**无状态纪律**（同一个文件可能被编译多次——HMR、缓存失效、并发 worker 都会重跑，loader 内绝不能依赖「上次调用」留下的可变状态）；以及 `this.cacheable()`——告诉 webpack「相同输入不必重跑我」，这是 loader 层面最重要的性能契约，有副作用的 loader 必须声明不可缓存。

进阶一层的机制是 **pitch**：每个 loader 除了正常阶段还可选实现 pitch 阶段，pitch 才是真正「从左到右」执行的——style-loader 正是利用 pitch 先执行、拦截掉剩余 loader 的返回，把 CSS 包装成注入样式的模块。另外两个写法常识：异步转换用 `this.async()` 拿 callback（不走同步返回值）；loader 里返回多个值时用 `this.callback(err, content, sourceMap, meta)` 额外交出 sourcemap——丢了 sourcemap 的转换链，调试体验直接塌方。

### Plugin 的能力来源：Tapable 钩子体系

Tapable 是 webpack 内置的发布订阅引擎，钩子按「调用方式 × 执行方式」分家族：同步的 `SyncHook`、异步串行的 `AsyncSeriesHook`、异步并行的 `AsyncParallelHook`，订阅端对应 `tap` / `tapAsync` / `tapPromise` 三种注册形态。plugin 的骨架因此固定：class 里实现 `apply(compiler)`，在钩子上 tap 回调，回调参数里拿 compilation 做事——比如 `compiler.hooks.emit.tap` 在写盘前拿到全部 assets，加文件、改内容、算统计都在这一步。

compiler 与 compilation 的区分是 plugin 的坐标系：**compiler** 对应一次完整的构建生命周期（配置不变它就不变），**compilation** 对应一次「资源版本的编译」——watch 模式下文件一变就产生新 compilation，而 compiler 还是同一个。理解了这点就能解释为什么「只在首次构建做的事」tap 在 compiler 钩子上、「每轮都要重做的事」tap 在 compilation 钩子上。

### 经典追问链

错误写法：

```js
// 想给所有模块注入环境变量，写成了 loader
use: [{ test: /\.js$/, loader: "env-inject-loader" }]
```

说明：loader 是单文件转换器，管不了「编译之外」的横切流程。

正确写法：

```js
// 编译之外的事挂插件钩子
new webpack.DefinePlugin({
  "process.env.API": JSON.stringify(api),
})
```

说明：plugin 挂在构建生命周期上，全局生效一次。

**loader 的执行顺序为什么是从右到左（从下到上）？**

*考点：热身题，考你对「管道 = 函数组合」的理解——答 compose 的人理解了设计，答「规定如此」的人只是背了。*

loader 数组本质是函数组合：`use: ['style-loader', 'css-loader']` 等价于 `styleLoader(cssLoader(source))`——后写的包在外层。选择从右到左是刻意贴合 compose 的数学习惯（与 Unix 管道从左到右相反），让「先转换内容的」写在右边。理解了这一点，异步 loader 用 this.async 返回 callback 串联的写法也就自然了。

延伸：pitch 阶段才是真正「从左到右」执行的钩子：style-loader 正是利用 pitch 先执行、把剩余 loader 的结果包装成注入样式模块。

**为什么 loader 必须写成无状态纯函数？this.cacheable() 改变了什么？**

*考点：考 loader 的性能契约——知道「会被重跑」的人才会真正管住副作用。*

同一文件在构建生命周期里可能被多次编译：HMR 增量更新、缓存失效、多进程 worker 各自跑一遍——loader 若依赖内部可变状态（计数器、上次的中间结果），每次重跑结果都可能不同，构建直接不可复现。this.cacheable() 是向 webpack 声明「我的输出只由输入决定，可以按输入做缓存键」；反过来，读了外部时间、随机值的 loader 必须显式声明不可缓存，否则缓存会放大它的不确定性。

延伸：判断自己写的 loader 纯不纯，用一个测试：同一输入跑两遍，输出与副作用（外部世界的变化）是否都一致。

**什么需求会「只能写成 plugin」？给出判断流程。**

*考点：考机制选型的边界——能把「数据可见范围」作为判断依据的，是真理解了分界线。*

三问：① 需要别的模块/整张依赖图的信息吗？loader 只见当前文件，需要跨模块视角就只能是 plugin。② 需要操作产物（assets）吗？加文件、改 HTML、抽 CSS、出报告，发生在「模块已组装成 chunk 之后」，loader 管不到。③ 需要控制构建时机吗（写盘前后、编译完成后、watch 触发时）？时机是 Tapable 钩子的事。三问有任一是「是」，loader 方案就不成立；反过来，纯粹的「文件 A 进、代码出」写成 plugin 反而是绕远——它放弃了缓存与管道复用。

延伸：灰色地带示例：给 Markdown 的链接做全局校验——看似「转换文件」，实际要汇总所有文件的链接做去重检查，跨模块信息 → plugin。

**tap、tapAsync、tapPromise 三种注册形态怎么选？用错了会怎样？**

*考点：考 Tapable 的同步异步家族——能说清「钩子类型决定注册形态」才算读过源码级文档。*

形态由钩子类型决定：SyncHook 只接受 tap，回调同步执行、返回值即结果；AsyncSeriesHook/AsyncParallelHook 三种都能注册，但异步回调必须显式通知完成——tapAsync 用末位 callback 参数，tapPromise 返回 Promise。用错了不是报错而是「静默不等待」：在异步串行钩子上用了 tap，webpack 不会等你的同步函数，你的逻辑没做完流程就走了——这类 bug 表现为产物时有时无，极难排查。

延伸：AsyncParallelHook 在某个回调失败（callback(err)）时会立即终止——但「已并行发出的任务无法撤销」，错误处理语义要在设计 plugin 时就想清楚。

**写一个 plugin 在产物写盘前删除所有体积为 0 的空 chunk，思路是什么？**

*考点：实操收尾题，检验 compiler/compilation 坐标系与钩子时序是否真的串起来了。*

挂 compiler.hooks.emit（写盘前、assets 已就绪）→ 回调参数 compilation.assets 拿到全部产物文件 → 按 size 为 0 筛出目标 → delete compilation.assets[name]，并在 compilation.hooks.processAssets 或 emit 里同步打印日志。要点有二：emit 阶段的 assets 是「最终形态」，之后就是写盘，改这里是最后窗口；删 chunk 级文件还要考虑 HTML 里的引用——那就得再联合 HtmlWebpackPlugin 的钩子同步改引用，单删文件会留下 404。

延伸：这道题的完整版正是 clean-webpack-plugin / webpack-bundle-analyzer 的核心原理——读它们的源码，验证你脑中的钩子时序图。

延伸阅读：为什么 tree-shaking 摇不动 CJS？——转换之后是分析：依赖图的「静态性」决定了哪些代码能被安全删除。

延伸阅读：HMR 是怎么做到只替换一块代码的？——构建过程介入的极致应用：增量编译与模块热替换的完整链路。



## 为什么 tree-shaking 摇不动 CJS？

*难度：进阶 ｜ 标签：webpack、tree-shaking、ESM、CommonJS*

**因为 tree-shaking 的前提是不执行代码就能分析出依赖，而 CJS 做不到**：`require()` 是运行时函数调用，可以放进 if、可以拼路径、`module.exports` 可以被任意改写——打包器不敢断言「这个导出没人用」。ESM 的 import/export 是语法声明，编译期就有一张静态可达图。真正删除靠三层机制配合：`sideEffects`（整模块跳过）、`usedExports`（标记未用导出）、`/*#__PURE__*/`（语句级提示），最后由生产模式的 Terser + 模块拼接完成物理删除。

延伸阅读：构建工具到底解决了什么问题？——本篇讨论的是依赖图的「利用」：图必须先做到静态，删除、拼接这些优化才有立足点。

### 「静态」到底指什么

ESM 与 CJS 的分野不在「写法新旧」，而在**依赖关系确定的时机**。ESM 的 import/export 是语法层面的声明：import 语句只能出现在顶层、模块说明符是字符串字面量、导出的名字在编译期全部可见——引擎不执行任何代码，整张「谁导入谁、用了哪个导出」的可达图就已经确定。CJS 的 require 是普通函数调用：可以放进 if 分支、可以拼出路径、可以把 `module.exports` 改写成任意形状甚至运行时再决定——这些全部合法，也全部让「静态分析」失效。webpack 官方的表述一针见血：tree-shaking 依赖的是 **ES2015 模块语法的静态结构**（据 webpack.js.org《Tree Shaking》）。

推论一：babel 把 ESM 转译成 CJS（@babel/preset-env 的历史默认行为）等于亲手拆掉 tree-shaking 的地基——这也是现代配置必须把 modules: false 交给打包器处理的原因。推论二：TS 同理，isolatedModules 之外的那些「类型层面动态导出」技巧，落地到 JS 时若变成动态形状，同样摇不动。「静态」不是道德要求，是删除操作的安全前提：只有「编译期可证明没人用」的代码，删了才不改变行为。

### 三层删除机制：各管一段

「摇树」不是单一开关，而是三层提示各管一个粒度，最后交给压缩器执行。webpack 官方文档对三者效力的排序很明确：sideEffects 最有效（能整棵跳过模块与子树），usedExports 靠 Terser 兜底且较吃力，PURE 注释精确到单条语句：

| 机制 | 作用粒度 | 谁执行删除 | 典型用法 |
| --- | --- | --- | --- |
| sideEffects（package.json 字段） | 整模块/整棵子树 | webpack（跳过评估） | 声明本包无副作用文件，未用模块直接不入图 |
| usedExports（优化开关） | 单个导出绑定 | 标记 + Terser 删除 | production 模式自带，标记 unused harmony export |
| /*#__PURE__*/（代码注释） | 单条函数调用语句 | Terser | 标记调用无副作用，返回值没人用就可删（5.107+ 另有 NO_SIDE_EFFECTS 标注整个函数声明） |

sideEffects 的语义值得单独强调：它声明的是「导入这个文件，除导出绑定外不产生任何可观察行为」。CSS 导入、polyfill、CSS-in-JS 的运行时注册，全是「导入即生效」的典型反例——所以官方示例的豁免写法是数组：`["**/*.css", "./src/polyfill.js"]`。而 usedExports 之所以「吃力」，webpack 的解释是：规范要求模块的副作用必须被评估，它无法像 sideEffects 那样直接跳过依赖子树，只能在保留评估的前提下标记无用的导出绑定（据 webpack.js.org）。

错误写法：

```js
// package.json
{ "sideEffects": false }
// 但项目里还有：
import "./reset.css";
import "./polyfill";
/* CSS/polyfill 被 "无副作用" 摇掉了 */
```

说明：一刀切 false 会把「导入即生效」的文件摇没，且不报错——上线才发现样式丢失。

正确写法：

```js
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

### 生产模式的最后一环

前三层只做了「标记」，物理删除发生在生产模式：`mode: production` 打开 Terser 压缩，把 marked as unused 的导出从代码里真正抹掉；同时 `ModuleConcatenationPlugin`（同样是生产模式自带）把相互依赖的 ESM 模块拼接进同一个作用域（scope hoisting）——没有拼接，每个模块套一层模块包装函数，跨模块的「导出没人用」就隔着一层函数边界，分析器看不穿。

这也解释了一个经典疑问：「为什么我配了 sideEffects，dev 模式下代码还在？」——三层机制有两层（Terser 删除、模块拼接）只在生产模式生效。验证 tree-shaking 是否真的生效，要以生产构建的产物为准，在产物里搜导出名（或搜 unused harmony 注释的消失），而不是看 dev 页面的行为。

### 经典追问链

错误写法：

```js
// utils.cjs
module.exports = { a, b }; // 运行时才知道取谁
const { a } = require("./utils.cjs");
```

说明：CommonJS 导出是运行时对象，打包器不敢删任何东西。

正确写法：

```js
// utils.mjs
export const a = 1;
export const b = 2; // 静态可分析
import { a } from "./utils.mjs"; // b 被摇掉
```

说明：ESM 的导入导出编译期可判定，tree-shaking 才有得摇。

**tree-shaking 为什么对 CommonJS 无效？「静态」到底指什么？**

*考点：考模块系统的本质差异——「require 是运行时函数调用」这句能展开的人，模块理解才算过关。*

CJS 的依赖关系在运行时才确定：require 可以放进 if、可以拼路径、module.exports 可以被任意改写——打包器不执行代码就无法断言「某导出没人用」，自然不敢删。ESM 的 import/export 是语法声明：import 语句只能出现在顶层、绑定的名字在编译期可见，「哪些导出被谁用」是一张静态可达图，标记 usedExports 后可达图之外的导出即可安全删除。「静态」指的就是「不执行代码即可分析出依赖」。

延伸：边界案例：export 的名字被动态拼接或做了计算后导出，静态分析同样失效——这也是为什么库作者要避免动态导出。

**sideEffects、usedExports、/*#__PURE__*/ 三者怎么分工？效力排序的依据是什么？**

*考点：考三层机制的粒度模型——只背「都要配」的人说不清谁在什么阶段删了什么。*

粒度从大到小：sideEffects 声明在 package.json，作用于模块级——未用到的无副作用模块整棵不入图（官方明确它最有效，因为能跳过子树）；usedExports 是编译期分析，作用于导出绑定级——在模块上标记哪些导出没被引用，删除交给 Terser；PURE 注释作用于语句级——告诉 Terser 这条调用语句无副作用，返回值没人用就整条删。效力排序的依据是「跳过的范围」：整子树 > 单导出 > 单语句，越靠前越省，越靠后越精确。

延伸：webpack 5.107+ 新增 /*#__NO_SIDE_EFFECTS__*/ 标注整个函数声明，5.108 起跨模块传播——PURE 的模块级升级版。

**为什么生产模式才能真正删掉代码？dev 模式下三层机制去哪了？**

*考点：考「标记」与「执行」的分离——能说清 Terser 与模块拼接角色的，配置观就不再玄学。*

sideEffects 的模块跳过在编译期就生效（dev 也一样），但 usedExports 只是「打标」，删除由 Terser 在压缩时执行，而跨模块的删除依赖 ModuleConcatenationPlugin 把 ESM 拼进同一作用域——这两件事都是 production 模式的默认项。所以 dev 下「代码还在」不代表摇树没生效，只是删除环节没开。验证以生产产物为准：搜导出名、看 unused harmony 标记是否消失。

延伸：scope hoisting 的附带收益：消除模块包装函数的调用开销、让跨模块的常量内联成为可能——它不只是 tree-shaking 的配角。

**barrel file（index.js 全量 re-export）对 tree-shaking 的影响是什么？**

*考点：工程实践题——「摇树到底摇没摇」很多时候卡在 barrel 上，答得出机制才算踩过坑。*

barrel 让所有使用方都经过同一个 index.js：一来构建时要把 barrel 指向的所有模块都解析、转换一遍（哪怕你只用一个函数），构建变慢；二来如果 barrel 链上有带副作用的模块，sideEffects 声明不当时整串都会被拉进图。导出本身如果都是纯 ESM 静态导出，最终产物仍能被摇干净——所以「影响摇树正确性」是有条件的，但「拖慢构建、放大副作用风险」是无条件的。按需直连深路径（import x from 'lib/utils/x'）是最稳的用法。

延伸：工具侧的缓解：webpack 5.87+ 的 nested tree-shaking 与部分导出分析在改善 barrel 场景，但「别写万桶」依然是第一原则。

**ESM 的 live binding（导出绑定是活的）会和 tree-shaking 冲突吗？**

*考点：辨析压轴题，把「静态」与「不可变」两个概念分开——混淆这两者的人会得出「ESM 也能摇不动」的错误推论。*

不冲突，因为「静态」说的是「绑定关系编译期可确定」，不是「值不可变」。export let count，导入方读 count 拿到的永远是最新值——绑定是活的；但「谁导出了 count、谁导入了 count」在语法层面写得明明白白，可达图照样静态。tree-shaking 删除的条件是「绑定没人引用」，与值变不变无关。真正让静态性失效的是「绑定的形状运行时才确定」（动态拼接导出名、运行时改写导出对象）——那才是摇不动的原因。

延伸：推论：const 导出并不比 let 导出「更好摇」；库作者选择 const 是 API 纪律，不是打包优化。

延伸阅读：HMR 是怎么做到只替换一块代码的？——静态图不止能删——增量更新同样建立在「模块 ID 稳定」的图上。

延伸阅读：Loader 与 Plugin 的分界线在哪里？——usedExports 这类分析与标记能力，正是通过构建过程的钩子体系实现的。



## HMR 是怎么做到只替换一块代码的？

*难度：进阶 ｜ 标签：webpack、HMR、热更新、dev-server*

**靠三件事咬合：增量编译——runtime 对账——accept 边界**。增量编译：文件变更只重编译受影响的模块，产出「更新清单（manifest：新 hash + 变更 chunk 列表）+ 补丁 chunk」；runtime 对账：浏览器里的 HMR runtime 收到 WebSocket 通知后，按清单下载补丁、把变更模块标为失效；accept 边界：每个模块可以声明「我变了怎么处理」，有边界就局部替换并保留内存状态，没有边界就沿依赖图向上冒泡，一路冒到入口还没有，退化为整页刷新。

延伸阅读：构建工具到底解决了什么问题？——HMR 建立在「模块 ID 跨构建保持稳定」这张图上——先知道依赖图怎么建，热替换才有着力点。

### live reload 与 HMR 的分界

live reload 的模型是「文件变了 → 通知浏览器 → location.reload()」：整页刷新，内存里的 JS 状态全部清零——表单填到一半、调试断点、组件内部状态，全部陪葬。HMR 的目标只有一个：**把「重新执行」的范围从整页缩小到模块**，页面其他部分的内存状态原样保留。这两者不是对立功能——dev-server 的 hot 模式总是先试 HMR，失败才回退整页刷新；「HMR 是热替换的常态，刷新是它的兜底」这个关系要摆正。

实现层面的关键障碍是：浏览器里跑着旧代码，新代码在服务器上，谁来执行「替换」？答案是打包时预埋进 bundle 的 **HMR runtime**：它是产物的一部分，常驻页面，与 dev-server 之间维持 WebSocket 长连接。「编译在服务端、应用在客户端、通知靠推送、补丁靠拉取」——四个角色先分清，流程就不乱了。

### 一次热更新的完整旅程

服务端：watch 到文件变化 → 增量编译 → 产出更新的两件套：**manifest（JSON）**与**一个或多个 update chunk（JS）**。manifest 里是新编译 hash 与全部变更 chunk 的列表，每个 update chunk 装着对应模块的新代码（或「已删除」标记）；跨构建的模块 ID、chunk ID 保持一致——这是 runtime 能把补丁「对号入座」的前提（据 webpack.js.org《Hot Module Replacement》）。

客户端：runtime 通过 WebSocket 收到通知（推的只有 hash 变化事件，不是代码），发起 check——按 manifest 拉取补丁，与当前已加载 chunk 对账后进入 ready 状态；随后 apply 把所有变更模块标记为 invalid、调用 dispose 处理器清理旧模块、更新当前 hash、依次调用 accept 处理器——apply 是同步的，check 是异步的。整个过程对页面上的其他模块零打扰。

```text
文件变化                 生成补丁                WebSocket 通知
watch 触发增量编译  ──►  新 hash + manifest/update ──►  runtime check 拉取补丁
                                                                │
accept 边界执行           ◄──  apply：失效与处置  ◄──────────────┘
局部替换，状态保留              dispose 清旧模块
```

### accept 边界与冒泡

HMR 是**opt-in** 的：`module.hot.accept` 声明「这个模块（或它依赖的某个模块）变更时，由我来处理替换」。没有声明的模块，更新沿依赖图**向上冒泡**——找到最近一个有处理器的祖先模块；官方文档的表述是：每个失效模块要么自己有处理器、要么冒泡失效其父级，逐级向上直到入口或某个处理器为止；从入口冒出，流程失败，dev-server 回退整页刷新。这个模型解释了为什么组件库（react-refresh、vue-loader）只在「组件」这一层声明边界：一个边界托管整棵子树。

```text
                    ┌──────────────┐
                    │  补丁到达     │
                    └──────┬───────┘
                           │ WS 通知 hash 变化
                           ▼
                    ┌──────────────┐
                    │ runtime check│  拉 manifest 与补丁
                    └──────┬───────┘
          有 accept │              │ 无人认领
                   ▼               ▼
        ┌────────────────┐   ┌───────────────┐
        │ accept 边界热替换│   │ 无边界，向上冒泡 │
        └────────────────┘   └───────┬───────┘
                       ▲      祖先声明 accept │ │ 冒泡至入口
                       │                     ▼ ▼
                       │        [整页刷新（兜底）]
                       └────────────（或被祖先 accept 接管）
```

### dispose：状态怎么交棒

替换意味着旧模块的代码即将作废，但它可能还攥着运行时资源——定时器、事件订阅、与 DOM 的关联。`module.hot.dispose` 处理器在旧模块卸载前执行，负责清理与「交棒」：把要延续的数据挂到 `module.hot.data` 上，新模块执行时从 data 里取回。CSS 是最典型的免费受益者：webpack 内置的 CSS 支持替你实现了 HMR 接口，样式更新就是替换 style 节点，无需你写一行 accept。

组件框架把这层又包了一层：react-refresh 在组件模块上声明 accept，用新定义重渲染既有组件实例——状态保在 Hook 链上。它的保守降级规则值得知道：Hook 的调用数量与顺序必须稳定，改动 Hook 结构会触发整组件重挂载——宁可贵一点，也不让状态错位（机制见 Fiber 的 memoizedState 链表）。

### 经典追问链

错误写法：

```js
// 改了一行样式，直接整页刷新
location.reload(); // 表单输入、滚动位置、组件状态全丢
```

说明：全量刷新是 HMR 要消灭的体验。

正确写法：

```css
/* vite: [hmr-update] src/style.css */
/* 只替换这一份样式表，DOM 与组件状态原样保留 */
```

说明：模块边界内的热替换，状态不丢。

**HMR 为什么能保留组件状态？live reload 做不到的是什么？**

*考点：考增量更新的机制层——「accept 边界」与「谁负责重新执行」答得出来才算理解 HMR 而不是背流程。*

live reload 是整页刷新：内存里所有 JS 状态清零。HMR 只把「变化的模块」沿模块图向上交给最近的 module.hot.accept 声明边界：边界回调拿到新模块并自己决定怎么应用（如 react-refresh 用新定义重渲染组件实例）——DOM 之外的组件状态、模块级缓存都在浏览器内存里原样保留，所以改代码不打断正在填的表单。若一路上没有任何边界接受，HMR runtime 退化成整页刷新。

延伸：react-refresh 的精细处：组件的 Hook 调用顺序必须稳定，否则状态对不上——所以改 Hook 数量/顺序时会强制整组件重挂载，这是它「保守降级」的安全设计。

**module.hot.accept 有两种调用形态，分别声明了什么责任？**

*考点：考「谁来处理替换」的所有权模型——只会写 accept() 括号里什么都不放的人，答不出这题。*

自更新形态 accept() 无参数：模块自己变了，由自己的代码原地重新执行，旧的全局副作用要靠 dispose 清理；依赖更新形态 accept('./dep.js', callback)：声明「我依赖的 dep 变了，别冒泡，把新模块交给我，我在 callback 里决定怎么用」。前者适合叶子工具模块，后者适合「管理子模块的容器」——路由文件 accept 各页面模块、样式入口 accept 各 CSS，都是后者的形态。

延伸：accept 了却不处理，更新等于被「吞掉」：页面还在跑旧逻辑、没有任何报错——排查「改了代码没反应」时先怀疑有人乱 accept。

**冒泡到入口为什么会演变成整页刷新？runtime 判断的依据是什么？**

*考点：考冒泡模型的终点——「图向上走到头」这个几何事实与「兜底策略」的因果关系。*

accept 边界是「局部替换」的许可：没有许可，失效标记只能向上传染——因为父模块引用着失效模块的导出，子模块换了、父模块不重新执行就可能出现新旧混杂。一路到入口仍然无人认领，意味着这次变更事实上无法局部应用（入口已经没有「父级」可以接管）；HMR 对这种失败没有更聪明的办法，dev-server 只能退回 live reload 整页刷新——先试热替换、再试刷新正是 hot 模式的既定顺序。

延伸：所以「改什么都整页刷新」的排查方向：从被改文件沿 import 链向上找，看断在哪一层没人 accept——常见是入口直连的工具模块没被任何边界托管。

**dispose 处理器负责什么？module.hot.data 的交棒机制是怎么设计的？**

*考点：考状态延续的实现——答「清理资源」只对一半，能说出 data 交棒的是完整版。*

两件事：清理与交接。dispose 在旧模块失效后、新模块执行前同步运行——清定时器、解绑监听、销毁副作用实例；要延续的状态写进 module.hot.data（同一引用贯穿新旧两代模块），新模块执行时先读 data 里的遗留值恢复现场。这套约定的意义在于把「替换」变成有秩序的新陈代谢：旧代码自己收拾自己，新代码凭遗物接手，浏览器里没有任何全局注册表参与。

延伸：推论：dispose 里抛错会让这次热更新失败退化成整页刷新——它和 accept 回调一样在关键的同步路径上，不能随意省 try/catch。

**WebSocket 推的是什么？为什么不直接把新代码从 WS 推下来，而要走 HTTP 拉补丁？**

*考点：压轴题，考「通知」与「传输」的分层——把推送模型画对的人，对整套协议的理解是真懂。*

WS 只推轻量事件：新编译的 hash（以及无效、错误等状态信号），代码本身由 runtime 发起普通 HTTP 请求按 manifest 清单拉取。分层的原因有三个：① 补丁是静态资源，HTTP 的缓存协商、CDN、断点续传白拿；② manifest/补丁走 HTTP 意味着与「页面加载产物」同源同管线，代理、鉴权、压缩策略一致；③ WS 保持轻量只做信号通道，断了重连的成本和复杂度都最低——信号与数据分离，是分布式系统的通用分层直觉。

延伸：Vite 的 HMR 同样是 WS 信号 + HTTP 拉模块的分层，只是补丁粒度从 chunk 细化到原生 ESM 模块——架构同构，粒度不同。

延伸阅读：为什么 tree-shaking 摇不动 CJS？——同一张依赖图的另一种利用：模块 ID 的稳定性同样支撑着死代码删除。

延伸阅读：Fiber 为什么能让渲染可中断？——react-refresh 保状态的底层：Hook 状态链为什么必须按顺序对号入座。