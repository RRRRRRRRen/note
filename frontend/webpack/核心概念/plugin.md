# plugin

*类型：knowledge ｜ 难度：基础 ｜ 标签：webpack、plugin、compiler、hooks*

**loader 用于转换某些类型的模块，插件（plugin）则可以用于执行范围更广的任务：打包优化、资源管理、注入环境变量。** webpack 插件本质是一个具有 `apply` 方法的 JavaScript 对象——`apply` 方法会被 webpack compiler 调用，并且在**整个**编译生命周期都可以访问 compiler 对象。使用时 `require()` 插件、`new` 出实例加入 `plugins` 数组即可。

## 剖析：插件长什么样

```js
const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ConsoleLogOnBuildWebpackPlugin {
  apply(compiler) {
    // 在 run 钩子上挂回调：构建启动时打印一行日志
    compiler.hooks.run.tap(pluginName, (compilation) => {
      console.log('webpack 构建正在启动！');
    });
  }
}

module.exports = ConsoleLogOnBuildWebpackPlugin;
```

compiler hook 的 `tap` 方法第一个参数应是驼峰式命名的插件名称，建议用一个常量保存，以便在所有 hook 中重复使用。

## 用法

使用一个插件只需要 `require()` 它，然后添加到 `plugins` 数组。多数插件可以通过选项（option）自定义；也可以在一个配置文件中因不同目的多次使用同一个插件，这时需要通过 `new` 操作符创建独立的插件实例：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 通过 npm 安装的插件
const webpack = require('webpack'); // 访问 webpack 内置插件
const path = require('path');

module.exports = {
  entry: './path/to/my/entry/file.js',
  output: {
    filename: 'my-first-webpack.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(), // 内置插件：输出构建进度
    new HtmlWebpackPlugin({ template: './src/index.html' }), // 生成 html 并注入产物
  ],
};
```

由于插件可以携带参数/选项，必须在 webpack 配置中向 `plugins` 属性传入 `new` 实例，而不是裸的构造函数。
