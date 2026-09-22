# loader

*类型：knowledge ｜ 难度：基础 ｜ 标签：webpack、loader、module.rules*

**webpack 只能理解 JavaScript 和 JSON 文件，这是它开箱可用的自带能力；loader 让 webpack 能够处理其他类型的文件，并把它们转换为有效模块，以供应用程序使用、被添加到依赖图中。** 配置层面 loader 只有两个属性：`test` 识别哪些文件会被转换，`use` 定义转换时使用哪个 loader。链式调用从右到左执行，链中最后一个 loader 必须返回 webpack 所期望的 JavaScript。

## 通过配置使用

在 `webpack.config.js` 的 `module.rules` 中指定 loader，这是推荐方式——集中声明、对各个 loader 有全局概览、简洁易维护：

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
              modules: true, // 开启 css modules
            },
          },
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
};
```

**loader 从右到左地取值（evaluate）/ 执行（execute）**：上例从 `sass-loader` 开始执行，然后 `css-loader`，最后以 `style-loader` 结束。

## 通过内联语句使用（不推荐）

可以在 `import` 语句中指定 loader，用 `!` 分隔各部分，每个部分相对于当前目录解析：

```js
import Styles from 'style-loader!css-loader?modules!./styles.css';
```

通过为内联 `import` 语句添加前缀，可以覆盖配置中的所有 loader、preLoader 和 postLoader：

```js
// ! 前缀：禁用所有已配置的 normal loader（普通 loader）
import Styles from '!style-loader!css-loader?modules!./styles.css';
// !! 前缀：禁用所有已配置的 loader（preLoader、loader、postLoader）
import Styles from '!!style-loader!css-loader?modules!./styles.css';
// -! 前缀：禁用所有已配置的 preLoader 和 loader，但不禁用 postLoader
import Styles from '-!style-loader!css-loader?modules!./styles.css';
```

## loader 特性

- loader 支持链式调用：链中每个 loader 将转换应用在已处理过的资源上，一组链式 loader 按相反顺序执行，第一个 loader 将结果传递给下一个，最后一个 loader 返回 webpack 所期望的 JavaScript。
- loader 可以是同步的，也可以是异步的。
- loader 运行在 Node.js 中，并且能够执行任何操作。
- loader 可以通过 `options` 对象配置（仍支持用 `query` 参数设置选项，但该方式已被废弃）。
- 除了通过 `package.json` 的 `main` 将 npm 模块导出为 loader，还可以在 `module.rules` 中用 `loader` 字段直接引用一个模块。
- 插件（plugin）可以为 loader 带来更多特性。
- loader 能够产生额外的任意文件。
