# target 构建目标

*类型：knowledge ｜ 难度：基础 ｜ 标签：webpack、target、node、多配置*

**由于 JavaScript 既可以编写服务端代码也可以编写浏览器代码，webpack 提供了多种部署 target（构建目标）来控制产物面向的运行环境。** 设置 `target: 'node'` 后，webpack 将在类 Node.js 环境编译代码——使用 Node.js 的 `require` 加载 chunk，而不加载 `fs`、`path` 等内置模块。webpack 不支持向 `target` 传多个字符串，同构 library 的构建需要导出多份配置。

## 用法

想设置 `target` 属性，只需在 webpack 配置中设置 target 字段：

```js
module.exports = {
  target: 'node',
};
```

上述示例中 target 设置为 `node`，webpack 将在类 Node.js 环境编译代码。

## 多 target：构建同构 library

webpack **不支持**向 `target` 属性传入多个字符串，但可以通过导出两个独立配置，构建对 library 进行同构：

```js
const path = require('path');

// 服务端产物：面向 Node.js 环境
const serverConfig = {
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.node.js',
  },
  // ...
};

// 浏览器产物：target 默认为 'web'，可省略
const clientConfig = {
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.js',
  },
  // ...
};

// 导出配置数组，一次构建同时产出两个环境的产物
module.exports = [serverConfig, clientConfig];
```

上述示例中，将会在 `dist` 文件夹下创建 `lib.js` 和 `lib.node.js` 两个文件，分别供浏览器与服务端使用。
