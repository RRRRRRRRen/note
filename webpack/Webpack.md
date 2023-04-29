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