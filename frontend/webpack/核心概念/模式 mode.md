# 模式 mode

*类型：knowledge ｜ 难度：基础 ｜ 标签：webpack、mode、production、development*

**提供 `mode` 配置选项，告知 webpack 使用相应环境的内置优化；可能的值有 `none`、`development` 或 `production`（默认）。** 不同模式会启用不同的内置插件与行为：development 侧重构建速度与调试体验，production 侧重产物体积与运行性能，none 则不做任何额外优化。

## 通过配置设置

```js
module.exports = {
  mode: 'production',
};
```

## 通过 CLI 参数传入

```bash
webpack --mode=production
```

## 三个取值

| 取值 | 特性 |
| --- | --- |
| `production` | 默认值，启用生产环境内置优化（压缩、tree shaking 等） |
| `development` | 启用开发环境内置优化（更快的构建、更友好的报错定位） |
| `none` | 不启用任何默认优化，一切按未加工状态输出 |
