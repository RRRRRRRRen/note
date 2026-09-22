# 创建 library

*类型：practice ｜ 难度：进阶 ｜ 标签：webpack、library、umd、externals*

**除了打包应用程序，webpack 还可以打包 JavaScript library：关键在 `output.library` 暴露入口导出、`library.type: 'umd'` 兼容多模块规范、`externals` 把第三方依赖外部化交给使用者。** lodash 这类依赖应装成 devDependencies 而不是 dependencies——不打包进库，否则库体积容易失控。

## 创建项目

使用 npm 初始化项目，然后安装 `webpack`、`webpack-cli` 和 `lodash`：

```bash
npm init -y
npm install --save-dev webpack webpack-cli lodash
```

把 `lodash` 安装为 `devDependencies` 而不是 `dependencies`：不需要将其打包到库中，否则库体积很容易变大。

## 暴露 library

通过 `output.library` 配置项暴露从入口导出的内容：

```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack-numbers.js',
    // 挂到全局变量 webpackNumbers 上
    library: 'webpackNumbers',
  },
};
```

此时库可以通过 script 标签引用：

```html
<script src="https://example.org/webpack-numbers.js"></script>
<script>
  window.webpackNumbers.wordToNum('Five');
</script>
```

但它只能通过 script 标签引用而发挥作用，不能运行在 CommonJS、AMD、Node.js 等环境中。改用 `umd` 类型同时兼容多种模块规范：

```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack-numbers.js',
    library: {
      name: 'webpackNumbers',
      // 兼容 AMD、CommonJS、Script 标签三种引入方式
      type: 'umd',
    },
  },
};
```

## 外部化 lodash

执行 `webpack` 后会发现产物体积相当大——lodash 也被打包进了代码。这个场景中我们更倾向把 lodash 当作 `peerDependency`：使用者（consumer）应该已经安装过 lodash，把控制权让给使用者：

```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack-numbers.js',
    library: {
      name: 'webpackNumbers',
      type: 'umd',
    },
  },
  // 外部化配置：lodash 不打进产物，运行时按对应规范引入
  externals: {
    lodash: {
      // commonjs / commonjs2：以 CommonJS 模块规范引入时使用的模块名
      commonjs: 'lodash',
      commonjs2: 'lodash',
      // amd：以 AMD 模块规范引入时使用的模块名
      amd: 'lodash',
      // root：浏览器中直接访问该模块时使用的全局变量名
      root: '_',
    },
  },
};
```
