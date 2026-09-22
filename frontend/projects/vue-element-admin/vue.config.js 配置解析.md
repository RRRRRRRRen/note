# vue.config.js 配置解析

*类型：practice ｜ 难度：入门 ｜ 标签：vue-element-admin、vue-cli、webpack、devServer*

**`vue.config.js` 是 vue-cli 项目的配置入口：前置部分做路径处理与端口读取，基础配置项控制打包路径、lint 与 source map，`configureWebpack` 通过对象合并追加 webpack 配置，`chainWebpack` 通过 webpack-chain 修改内置规则与插件。理解这份配置，等于理解了 vue-cli 项目构建行为的大部分来源。**

## 前置部分

### 严格模式：'use strict'

```js
'use strict'
```

用于开启严格模式。严格模式会将过失错误转为异常：

- 严格模式下无法再意外创建全局变量。
- 严格模式会使引起静默失败的赋值操作抛出异常。
- 试图删除不可删除的属性时会抛出异常。
- 严格模式要求函数的参数名唯一。
- 严格模式禁止八进制数字语法。
- ECMAScript 6 中的严格模式禁止设置基本数据类型的属性值。

严格模式简化了变量的使用：

- 严格模式禁用 `with`。
- 严格模式下的 eval 不再为上层范围（surrounding scope，包围 eval 代码块的范围）引入新变量。
- 严格模式禁止删除声明变量。

严格模式让 eval 和 arguments 变得简单：

- 名称 `eval` 和 `arguments` 不能通过程序语法被绑定（be bound）或赋值。
- 严格模式下，参数的值不会随 arguments 对象的值的改变而变化。
- 不再支持 `arguments.callee`。正常模式下，`arguments.callee` 指向当前正在执行的函数。

严格模式是更安全的 JavaScript：

- 在严格模式下通过 `this` 传递给一个函数的值不会被强制转换为一个对象。
- 在严格模式中再也不能通过广泛实现的 ECMAScript 扩展“游走于”JavaScript 的栈中。
- 严格模式下的 `arguments` 不会再提供访问与调用这个函数相关的变量的途径。

严格模式为未来的 ECMAScript 版本铺平道路：

- 在严格模式中一部分字符变成了保留的关键字。
- 禁止了不在脚本或者函数层面上的函数声明。

### 路径处理：path 与 resolve

```js
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
```

- 引入 node 内置模块 path，用于在不同操作系统下正确读取路径。
- `path.join` 使用字符串拼接成路径。
- `__dirname` 是全局变量，指向当前文件的绝对路径。
- `resolve` 提供一个函数用来返回拼接后的正确路径。

### 导入项目基本配置

```js
const defaultSettings = require('./src/settings.js')
const name = defaultSettings.title || 'vue Element Admin' // page title
```

从 `src/settings.js` 导入项目的基本配置，作为页面标题使用。

### 开发端口获取

```js
const port = process.env.port || process.env.npm_config_port || 9527 // dev port
```

- `process.env` 获取 node 运行的环境变量，包含系统的环境变量和通过配置文件添加的环境变量。
- 注意：只有 `NODE_ENV`、`BASE_URL` 和以 `VUE_APP_` 开头的变量会通过 `webpack.DefinePlugin` 静态嵌入到客户端侧代码中，但在 node 环境中可以读取全部环境变量。

## 基础配置项

### publicPath

`publicPath: '/'` 描述项目打包后的路径，会影响静态资源的请求地址。

| publicPath | 请求地址 | 备注 |
| --- | --- | --- |
| `/` | `http://111.222.333.444:8888/css/app.0b79487b.css` | 绝对路径：域名作为根目录 |
| `./` | `http://111.222.333.444:8888/test/css/app.0b79487b.css` | 相对路径：请求当前文件所在目录 |
| `static` | `http://111.222.333.444:8888/test/static/css/app.0b79487b.css` | 相对路径：请求当前文件夹下的 static 文件夹 |
| `./static` | 同上 | 同上 |

### 输出目录相关

- `outputDir: 'dist'`：设置打包生成的生产环境构建文件目录。执行打包命令时，会先删除文件夹内所有内容再生成。
- `assetsDir: 'static'`：放置生成的静态资源（js、css、img、fonts）的（相对于 `outputDir` 的）目录。

### lintOnSave

`lintOnSave: process.env.NODE_ENV === 'development'` 表示是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码，该值在安装 `@vue/cli-plugin-eslint` 之后生效，即只在开发环境中启用 ESLint 编译检查。

| lintOnSave | 行为 | 是否导致编译失败 |
| --- | --- | --- |
| true / warning | 会将 lint 错误输出为编译警告 | 警告仅仅会被输出到命令行，且不会使得编译失败 |
| default | 将 lint 错误输出为编译错误 | lint 错误将会导致编译失败 |
| error | 把 lint 警告也输出为编译错误 | lint 警告将会导致编译失败 |

### productionSourceMap

`productionSourceMap: false` 控制生产环境是否生成 source map 用于线上调试。

- Source map 是一个信息文件，储存着位置信息：转换后的代码的每一个位置所对应的转换前的位置。
- 原理是在压缩的 js 文件末尾添加注释，链接到对应的 map 文件。

### devServer 系列

- `devServer.host: '0.0.0.0'`：指定开发服务器监听哪些 host。设置为 0.0.0.0 表示同时接受本地访问和局域网访问，因为在该设置下会开启所有有效 host 的监听。
- `devServer.port: port`：设置开发环境部署的端口号，取自环境变量。
- `devServer.open: true`：在服务启动完成时打开浏览器到服务地址。
- `devServer.overlay: { warnings: false, errors: true }`：在浏览器中全屏显示编译错误或警告，这里不显示编译警告、只显示编译错误。
- `devServer.before: require('./mock/mock-server.js')`：在服务内部的所有其他中间件之前提供执行自定义中间件的功能，这里用来提供 mock 接口功能。
- `devServer.disableHostCheck`：配置是否关闭用于 DNS 重绑定的 HTTP 请求的 HOST 检查。DevServer 默认只接受来自本地的请求，关闭后可以接受来自任何 HOST 的请求。通常用于搭配 `--host 0.0.0.0` 使用：其它设备通过 IP 地址（而非 HOST）访问本地服务时，需要关闭 HOST 检查。

## configureWebpack 配置项

调整 webpack 配置最简单的方式，就是在 `vue.config.js` 中的 `configureWebpack` 选项提供一个对象，该对象将会被 webpack-merge 合并入最终的 webpack 配置。

```js
{
  configureWebpack: {
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  }
}
```

- `name: name`：配置的名称，当加载不同的配置时会被使用。
- `resolve.alias`：创建 `import` 或 `require` 的别名，让模块引入更简单。将 `@` 映射为路径 `/src`，例如：

```js
import { debounce } from '@/utils'
// 从 src/utils/index.js 中引入 debounce
```

## chainWebpack 配置项

Vue CLI 内部的 webpack 配置是通过 webpack-chain 维护的。这个库提供了 webpack 原始配置的上层抽象，可以定义具名的 loader 规则和具名插件，并在后期进入这些规则修改它们的选项。

### preload 预加载

```js
config.plugin('preload').tap(() => [
  {
    rel: 'preload',
    fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
    include: 'initial'
  }
])
```

Vue-cli 内置了 preload-webpack-plugin 插件，用于实现预加载功能提高首屏速度。

- `rel: 'preload'`：会将对应资源生成预加载链接，告知浏览器提前加载该资源。
- `fileBlacklist`：排除的文件列表，符合正则表达式的文件被排除。
- `include: 'initial'`：包含的文件。设置为 initial 时表示包含所有初始入口点的资源，一般入口文件位于 `src/main.js`，此时只加载该文件中提到的初始资源。
- `tap`：使用 `.tap()` 方法或 `.use()` 方法都可以对插件进行配置，但实现方式不同。`.tap()` 通过修改选项数组来配置插件，`.use()` 使用一个选项对象来指定插件选项。只需要指定一个选项对象时用 `.use()` 更方便，需要对选项做更复杂的修改时用 `.tap()` 更灵活。

### prefetch 取消预获取

```js
config.plugins.delete('prefetch')
```

取消预获取功能。也可以添加配置 `config.plugins.delete('preload')` 来取消预加载功能。

## 参考

- [严格模式 - JavaScript | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode)
- [Path | Node.js Documentation](https://nodejs.org/api/path.html#pathjoinpaths)
- [vue-cli 设置 publicPath 小记 - 掘金](https://juejin.cn/post/6844904126699044872)
