# Tree Shaking 指南

*类型：practice ｜ 难度：进阶 ｜ 标签：webpack、tree shaking、dead-code、ESM、sideEffects*

**Tree shaking 是移除 JavaScript 上下文中未引用代码（dead-code）的术语，它依赖 ES2015 模块语法的静态结构特性（`import` / `export`）——这个术语和概念由 ES2015 模块打包工具 rollup 普及。** 能摇干净的前提有两个：模块依赖必须在构建期静态可分析（这也是 CJS 摇不动的原因），以及通过 `package.json` 的 `sideEffects` 声明代码无副作用，让 webpack 敢于整文件剔除。

## 前提：使用 ESM 静态模块语法

tree shaking 依赖 ES2015 模块的静态结构：`import` 和 `export` 必须写在顶层、不能再被条件包裹，webpack 才能在不执行代码的情况下确定「哪些导出没人用」。CommonJS 的 `require` 是运行时动态解析，静态分析失效——详见工程化篇《为什么 tree-shaking 摇不动 CJS？》。

```js
// math.js：只导出了 add 和 minus
export const add = (a, b) => a + b;
export const minus = (a, b) => a - b;
export const multiply = (a, b) => a * b; // 未被引用，生产构建中被摇掉
```

```js
// index.js：只导入用到的导出
import { add } from './math.js';
add(1, 2);
```

## 标记 sideEffects

`package.json` 中声明 `sideEffects: false`，告诉 webpack 所有文件都是「无副作用」的——未使用的导入可以安全整文件删除：

```json
{
  "name": "webpack-demo",
  "sideEffects": false
}
```

存在副作用的文件需要单独列出（样式文件、带 polyfill 的模块等），避免被误删：

```json
{
  "sideEffects": ["*.css", "./src/polyfill.js"]
}
```

## 开启生产优化

`mode: 'production'` 下 webpack 会自动启用相关内置优化（模块导出信息标记 + 压缩阶段的删除），无需手动加插件：

```js
module.exports = {
  mode: 'production',
};
```

## 完整示例与验证

```js
// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  mode: 'production',
};
```

```bash
# 构建后检查产物：multiply 未出现在 bundle.js 中即为生效
npm run build
grep -c "multiply" dist/bundle.js || echo "tree shaking 生效"
```

排查「摇不掉」时的检查顺序：

- 确认引用方与被引用方都是 ESM（`import` / `export`），没有经过 babel 转成 CJS。
- 确认 `package.json` 的 `sideEffects` 配置与代码事实一致。
- 确认 `mode` 为 `production`（或手动引入压缩阶段执行删除）。
- 确认依赖库自身提供 ESM 产物，且没有被 `require` 引入。
