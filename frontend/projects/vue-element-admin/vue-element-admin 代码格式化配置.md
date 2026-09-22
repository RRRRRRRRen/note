# vue-element-admin 代码格式化配置

*类型：practice ｜ 难度：入门 ｜ 标签：vue-element-admin、ESLint、EditorConfig、Babel、PostCSS*

**vue-element-admin 用一组配置文件统一团队代码风格：`.eslintrc.js` 负责语法校验、`.editorconfig` 统一不同编辑器行为、`babel.config.js` 做语法降级、`jsconfig.json` 帮 VSCode 识别路径、`postcss.config.js` 自动补全 CSS 前缀。创建利于团队协作的项目，需要统一代码风格和代码规范，这样可以减少因为代码风格改变产生的 git 提交，同时减少低级错误的发生。**

## ESLint 配置

文件：`.eslintrc.js`。ESLint 是一个代码检查工具，用来检查代码是否符合指定的规范，`.eslintrc.js` 则是它在项目中的配置文件。

基本属性：

```js
module.exports = {
  root: true,
  parserOptions: {},
  env: {},
  extends: [],
  rules: {}
}
```

### 配置项：root

```js
root: true,
```

- `root` 用于声明当前 ESLint 的配置文件是否为根目录的配置文件。
- 默认情况下，ESLint 会在所有父级目录里寻找配置文件，一直到根目录；一旦发现配置文件中有 `"root": true`，就会停止向上查找。
- 一般一个项目只存在一个 ESLint 配置文件，声明 `root: true` 表示只有这个配置文件中的配置在此项目中生效。

### 配置项：parserOptions

`parserOptions` 是解析器的配置选项，用于对 ESLint 的解析器进行配置。

```js
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
```

**parser**

- 解析器可以将代码转化为 ESLint 可以识别的语法树，ESLint 再对生成的语法树进行规则校验，可以使用特定的解析器来解析特定的文件类型。
- `parser: 'babel-eslint'`：npm 包 `npm i babel-eslint -D`，该解析器用于解析 babel 语法。

**sourceType**

- 表示使用哪种规范的模块化语法。
- `sourceType: 'module'` 表示使用 ES 模块化语法。

### 配置项：env

`env` 用于配置全局变量。JS 可以运行在多个平台，例如运行在 node 中时全局没有 `document` 对象，此时就需要告诉 ESLint 代码运行在什么平台、可以使用哪些全局变量。

```js
  env: {
    browser: true,
    node: true,
    es6: true,
  },
```

- `browser: true`：支持 BOM 和 DOM 对象。
- `node: true`：支持 node 环境中的变量。
- `es6: true`：支持 ES6 中的变量。

### 配置项：extends

`extends` 提供一整套方案用于处理某些文件。

```js
extends: ['plugin:vue/recommended', 'eslint:recommended'],
```

- 一般而言 ESLint 只能解析 js 文件，无法识别 vue 文件；`plugin:vue/recommended` 提供了一整套方案用来处理 vue 文件，将 vue 解析成 ESLint 可以识别的语法树，同时提供建议的校验规则。
- `plugin:vue/recommended`：npm 包 `npm i eslint-plugin-vue -D`，提供 vue 文件解析功能和 vue 文件中的 ESLint 规则集。
- `eslint:recommended`：ESLint 内置的推荐规则集。

### 配置项：rules

针对 ESLint 内置的规则进行配置，也可以对插件提供的规则进行配置。

```js
    "vue/no-v-html": "off",
    'accessor-pairs': 2,
```

- `vue/no-v-html` 是 eslint-plugin-vue 提供的规则，ESLint 要求非内置规则必须加上前缀用于区分。该规则声明是否可以使用 `v-html` 指令。
- `accessor-pairs` 是内置规则，用于声明 getter 和 setter 是否强制成对出现。

## EditorConfig 配置

文件：`.editorconfig`，用于统一不同代码编辑器的一些行为。

```ini
# https://editorconfig.org
root = true

[*]
# 字符集
charset = utf-8
# 制表符形式采用空格代替
indent_style = space
# 缩进的大小
indent_size = 2
# 换行符形式
end_of_line = lf
# 文件尾增加空行
insert_final_newline = true
# 删除行尾空格
trim_trailing_whitespace = true

[*.md]
insert_final_newline = false
trim_trailing_whitespace = false
```

### 配置项：root

同 ESLint 的配置文件类似，EditorConfig 也会向上查找配置文件，直到遇到 `root = true` 配置时停止，表示当前文件就是根配置。

## Babel 配置

Vue-cli 已经集成了推荐的 babel 配置，如果需要其他配置，可以使用 `babel.config.js` 进行额外的配置。该文件用于对代码进行版本降级和特殊处理。

```js
module.exports = {
  presets: [
    // https://github.com/vuejs/vue-cli/tree/master/packages/@vue/babel-preset-app
    '@vue/cli-plugin-babel/preset'
  ],
  'env': {
    'development': {
      // babel-plugin-dynamic-import-node plugin only does one thing by converting all import() to require().
      // This plugin can significantly increase the speed of hot updates, when you have a large number of pages.
      // https://panjiachen.github.io/vue-element-admin-site/guide/advanced/lazy-loading.html
      'plugins': ['dynamic-import-node']
    }
  }
}
```

### 配置项：presets

Babel 的预设（preset）可以被看作是一组 Babel 插件和/或 options 配置的可共享模块。

- `presets: ['@vue/cli-plugin-babel/preset']`：npm 包 `npm i -D @vue/cli-plugin-babel`，vue-cli 官方使用的预设，一般不需要修改。

### 配置项：plugins

- `'dynamic-import-node'`：npm 包 `npm i -D babel-plugin-dynamic-import-node`。
- 作用是将 JavaScript 中的动态导入（dynamic import）语句转换为对 Node.js 的 require 函数的调用，页面较多时可显著提升热更新速度。

## Jsconfig 配置

`jsconfig.json` 用于告诉 VSCode 该项目是一个 js 项目，针对 VSCode 优化地址识别和模块识别。

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
        "@/*": ["src/*"]
    }
  },
  "exclude": ["node_modules", "dist"]
}
```

### 配置项：baseUrl 与 paths

- `baseUrl` 用于设置 paths 中映射路径的根目录。
- `"@/*": ["src/*"]` 用于识别 `@/views/xxx` 这类目录。
- 配置后 VSCode 可以识别路径并提供跳转，未配置时无法识别。

### 配置项：exclude

对 `exclude` 中配置的文件夹不生效。

## PostCSS 配置

文件：`postcss.config.js`，用于对 CSS 进行处理。

```js
module.exports = {
  plugins: {
    autoprefixer: {}
  }
}
```

- `autoprefixer`：npm 包 `npm i -D autoprefixer`，用于自动添加 CSS 前缀来支持不同的浏览器或提供兼容性前缀。

## VSCode 插件配合

### ESLint 插件

在 `settings.json` 增加配置后，可以使文件在保存时使用 ESLint 尝试自动修复校验的问题：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.fixAll.eslint": true
  }
}
```

### EditorConfig 插件

VSCode 需要安装 EditorConfig 插件，`.editorconfig` 文件才能生效。

## 参考

- [ESLint 中 plugins 和 extends 的区别 - 掘金](https://juejin.cn/post/6859291468138774535)
