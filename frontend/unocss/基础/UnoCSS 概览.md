# UnoCSS 概览

*类型：knowledge ｜ 难度：基础 ｜ 标签：UnoCSS、原子化 CSS、Tailwind*

**UnoCSS 是一个即时（on-demand）的原子化 CSS 引擎：不写语义化 class，而是用一小组工具类在模板里直接描述样式，按需生成、只打包用到的规则。** 它解决的是传统 CSS 的三大痛点——命名负担、样式冗余、全局污染；与 Tailwind/Windi 同属原子化思想，但 UnoCSS 把「匹配器 + 规则」做成了完全可编程的引擎，性能更快、扩展更自由。约定俗成也常把这个流派统称为 atomically CSS（原子化 CSS）：每个 class 对应一条不可再分的样式规则。

## 什么是 UnoCSS

- UnoCSS 是原子化 CSS 引擎，由 Vite/VitePress 等项目的作者 Anthony Fu 开发，定位是「The instant on-demand Atomic CSS engine」。
- 它提供 utility-first（实用类优先）的书写方式：样式写在模板的 class 里，构建工具扫描后按需生成对应 CSS。
- 没有预设值、不解析你的代码：它通过「规则（rules）」把匹配到的 class 名翻译成 CSS，一切能力皆可通过预设（presets）与自定义规则组合。

## 解决什么问题

传统「组件 class + 语义命名」模式的三类老问题：

- 命名负担：每写一个样式都要先想 BEM 类名（`.card__title--highlight`），心智成本高。
- 样式冗余：项目膨胀后大量 CSS 规则不再被引用，却仍被打包；改样式常在删除与新增之间犹豫。
- 全局污染：样式作用域依赖命名约定或 CSS Modules，深层覆盖需要特异性竞赛。

原子化 CSS 的对应解法：

- class 即样式：`flex`、`mt-2`、`text-sm` 每个类是一条声明，无需设计命名体系。
- 按需生成：只生成模板中实际出现的类，产物体积极小，删模板即删样式。
- 一致性约束：间距、字号、颜色收敛到主题（theme）令牌，避免随手写 `margin: 13px` 这类魔法数。

## 核心理念：原子化 CSS 思想

- 原子（atomic）：一条 CSS 声明就是一个「原子」，class 是它的名字；组合原子即可拼装任意样式，而不是为每个组件造一个新类。
- 按需（on-demand）：扫描源码 → 提取候选 class → 匹配规则 → 即时生成 CSS，全程不产出未使用的规则。
- 确定性（deterministic）：同一个类名永远生成同一段样式，覆盖靠「换类名」而非「堆优先级」。
- 组合优于覆盖：需要新样式时优先组合现有原子类，而不是新建一个语义类再去覆盖旧类。

```html
<!-- 传统写法：先写 HTML，再去 CSS 文件里补 .login-card -->
<div class="login-card">...</div>

<!-- 原子化写法：样式直接组合在模板中，样式即所见 -->
<div class="flex items-center gap-2 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
  <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Login</span>
</div>
```

## 与 Tailwind CSS / Windi CSS 的区别

| 维度 | UnoCSS | Tailwind / Windi |
| --- | --- | --- |
| 架构 | 引擎：规则匹配器，按需即时生成 | 完整框架：内置一套固定工具类体系 |
| 生成方式 | 完全按需，扫描到才生成（无解析 AST） | Tailwind 依赖内容扫描；Windi 靠预测生成 |
| 性能 | 快，增量生成，无需缓存冷启动 | Windi 为提速引入缓存与预测机制 |
| 扩展 | 规则、变体、预设均为纯函数，可编程 | 主要通过配置文件与插件扩展 |
| 兼容 | presetUno/presetWind 兼容 Tailwind 语法 | 原生生态 |
| 上手成本 | 引擎按需组装，可只取所需预设 | 官方体系完整，约定成熟 |

- 结论：想要「Tailwind 的书写体验 + 更快构建 + 完全可定制的规则」，UnoCSS 是更轻的底座；迁移 Tailwind 项目时用 `presetWind` 即可平滑过渡。

## 基本用法

### 安装（以 Vite 为例）

```bash
npm i -D unocss
```

```ts
// vite.config.ts
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [UnoCSS()]
})
```

### 配置 uno.config.ts

```ts
// uno.config.ts
import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  // 预设：presetUno 提供 Tailwind/Windi 兼容的默认工具类
  presets: [
    presetUno(),
    presetAttributify() // attributify 模式：样式也可写在属性上
  ],
  // 自定义规则：匹配到的 class 名 → 输出的 CSS 声明
  rules: [
    ['m-1', { margin: '0.25rem' }],
    [/^text-(\d+)$/, ([, d]) => ({ 'font-size': `${d}px` })]
  ],
  // 快捷方式：一组原子类的组合别名
  shortcuts: {
    'btn': 'px-4 py-2 rounded inline-block bg-blue-500 text-white cursor-pointer'
  }
})
```

### 在入口引入样式

```ts
// main.ts
import 'virtual:uno.css'
```

### 在模板中使用

```html
<button class="btn m-1 text-14">Button</button>

<!-- attributify 模式：以属性形式书写样式 -->
<button
  text="sm white"
  bg="blue-500 hover:blue-600"
  p="x-4 y-2"
>
  Button
</button>
```

- 条件变体（variants）如 `dark:bg-gray-800`、`group-hover:opacity-100`、`md:flex` 会在类名前缀上做前缀变换，配合主题令牌实现响应式与暗色模式。

## 学习路线（对应目录页）

- 初识与快速上手：安装、预设选择、写出第一个原子化样式。
- 配置详解：presets、rules、variants、shortcuts、theme 五大件。
- 核心预设：preset-mini / preset-uno / preset-wind / preset-icons（图标即类名）。
- 高级特性：Layers 层级控制、Safelist 安全列表、自定义 Extractors 提取器。
- 工程化集成：与 Vue / React / Svelte 集成，基于 Vite 插件机制的开发与生产优化。
- 实战与调优：响应式布局、组件库封装、构建性能分析与 CSS 体积策略。
