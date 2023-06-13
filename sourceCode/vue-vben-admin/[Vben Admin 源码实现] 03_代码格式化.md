# 前言

有关编辑器的设置，更像是装修中的硬装，设置好了就能用，但是想要用的好且舒心，就需要优秀的室内设计和软装，而代码格式化和代码检查就像是装修中软装。



# Prettier

Prettier 是一个流行的代码格式化工具，用于统一和美化代码的风格。

在使用Prettier前，我们首先需要理清出一个问题，那就是npm安装的prettier和vscode插件市场安装的prettier到底有什么关系和区别？

简单来说，npm包安装的prettier是一个独立的node脚本，他可以单独的在命令行运行，不需要借助任何载体就可以检查指定的文件，你甚至可以使用记事本写代码，然后在命令行执行prettier相关命令来手动完成代码格式化的操作。

vscode插件市场的prettier也具有prettier的功能，那么为什么需要这个插件呢，他解决了npm包的一个痛点，那就是需要手动的在命令行去执行相关命令，有了这个插件，我们就可以非常快速的、不需要手动输入命令的完成格式化的操作。

那么为什么我们还需要npm包的prettier呢，一个插件不就完全搞定格式化了吗？问题来了，你能保证所有的协作用户都安装了这个插件吗，你又能保证所有用户都是用vscode吗，万一人家就偏爱记事本呢，在这种情况下就不能让这些人胡作非为都提交不好看的代码，所以我们就需要在一些核心操作上自动触发prettier命令格式化他的代码，例如提交代码前。

这一点同样适用其他的插件和他对应的npm包。

## `.prettierrc.js`

根目录下的`.prettierrc.js`就是prettier的配置文件，他可以同时作用于prettier命令和prettier插件。

```js
module.exports = {
  // 指定每行的最大字符宽度，超过这个宽度的代码将被折行
  printWidth: 100,
  // 指定是否在语句末尾添加分号
  semi: true,
  // 指定在 Vue 单文件组件中的 <script> 和 <style> 标签是否要使用额外的缩进
  vueIndentScriptAndStyle: true,
  // 指定是否使用单引号来包裹字符串
  singleQuote: true,
  // 指定是否在多行数组或对象的最后一项添加逗号
  trailingComma: 'all',
  // 指定是否在 Markdown 文件中根据printWidth对文本进行换行
  proseWrap: 'never',
  // 指定对 HTML 文件中的空白符敏感度的级别
  htmlWhitespaceSensitivity: 'strict',
  // 指定换行符的类型
  endOfLine: 'auto',
  // 指定要使用的额外插件的名称
  plugins: ['prettier-plugin-packagejson'],
  // 指定针对特定文件进行的配置覆盖
  overrides: [
    // 这里示例中对以 .*rc 结尾的文件使用 JSON 解析器进行格式化。
    {
      files: '.*rc',
      options: {
        parser: 'json',
      },
    },
  ],
};
```

`htmlWhitespaceSensitivity`

这是用来处理html中的元素之间的空白的，不了解空白的可以去温习一下html中对于空白的解释，这里vben使用strict，简单看下格式化前后对比

格式化前：

![image-20230610164336412](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230610164336412.png)

格式化后：

![image-20230610164408921](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230610164408921.png)

简单来说就是，你元素之间有多少个空白我都按照一个（html中连续的空白也会视为一个空白）处理，没有空白那就是没有空白不给你加空白。这样的好处就是在页面渲染时可以准确的识别出你到底写没写空白。

给人最大的差别就在于，一个元素标签是否被打断在两行显示，打断后可以避免产生空白，例如格式化后的第二个span元素的两个标签。

`plugins`

`prettier-plugin-packagejson`该插件是专门用于处理 `package.json` 文件的格式化的，它可以确保 `package.json` 文件的结构和内容符合一致的规范和约定。

通过启用这个插件，你可以确保 `package.json` 文件在使用 Prettier 进行格式化时会遵循指定的规则，包括缩进、换行符、引号类型等。

`overrides`

是 Prettier 的一个配置选项，用于针对特定的文件或文件类型进行单独的配置覆盖。

上述配置表示针对所有以 `.rc` 结尾的文件，使用 `json` 解析器进行格式化。这意味着当你的项目中存在以 `.rc` 结尾的文件（如 `.eslintrc`, `.prettierrc` 等），这些文件会按照 JSON 格式进行解析和格式化。

## `.prettierignore`

文件是用于配置 Prettier 忽略特定文件或文件夹的规则的文件。

```glob
dist
.local
.output.js
node_modules

**/*.svg
**/*.sh

public
.npmrc
```

`xxxx`模式：`dist`、`node_modules`、`public`

匹配：任意文件层级下的该文件夹内的所有文件，就是直接忽略所有dist文件夹下的所有内容

`.xxxx`模式：`.local`、`.npmrc`

匹配：任意文件层级下的该文件，就是遇到同名文件直接忽略

`.xxxx.xxx`模式：`.output.js`

匹配：同上

`**/*.xxx`模式：`**/*.svg`、`**/*.sh`

匹配：所有以xxx结尾的文件，不管在哪个文件夹中。

成功匹配后，在控制台中会有对应的输出提示，可以用于验证：

![image-20230613101736178](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230613101736178.png)

一般而言，需要重点忽略node_modules、dist、public，这些文件夹内的文件都是不建议任何变动的，所以不需要对其进行格式化的变动。

具体语法规则可以参考gitignore的语法：[Git - gitignore Documentation (git-scm.com)](https://git-scm.com/docs/gitignore#_pattern_format)



# Stylelint

Stylelint 是一个用于检测和自动修复 CSS 和 CSS 预处理器代码规范的工具。它可以帮助开发人员确保编写的样式表符合一致的代码风格和最佳实践。

Stylelint 可以检查和报告以下内容：

1. CSS 语法错误和警告：检测 CSS 代码中的语法错误，例如缺少分号、括号不匹配等。
2. 代码风格规范：根据预定义的代码规范检查样式表中的命名、缩进、空格、换行等方面的一致性。
3. 最佳实践：检查是否存在不推荐的写法、使用过时的属性或选择器等。
4. 插件支持：通过安装插件，可以扩展 Stylelint 的功能，例如支持检查 CSS 预处理器的特定语法或样式框架的规范。

## `.stylelintrc.js`

```js
module.exports = {
  // 表示根目录
  root: true,
  // 预设规则扩展
  extends: ['@vben/stylelint-config'],
};
```

`root`

先说root到底干啥的，一般而言插件运行时，需要先搜索可以的配置文件，他会从当前作用的文件的同级目录中寻找配置文件，然后一层一层的往上找，直到找到系统的根目录（并非项目的根目录）或者遇到某个配置文件含有root：true，这告诉插件：你不用找了，我就是最后一层了，开始运行吧。

`extends`

预设的规则集，stylelint并不希望配个配置文件都冗长繁琐，他允许社区配置一些统一的规范集，给用户快速的配置机会，使用这些规则集合就可以减少很多繁琐的配置过程，也不需要记住复杂的配置项名称，做到拿来就用。

`@vben/stylelint-config`就是vben给我们提供的一个规则集。

## `.stylelintignore`

```glob
dist
public
```

这个类似于`.prettierignore`，用于配置忽略规则，忽略dist和public文件夹。

## 验证

只要你正确的安装了插件，这时候写css相关代码都应该得到stylelint的支持，我们稍微修改css属性的顺序，让他不符合stylelint的规则，看看有没有效果。

**vue文件中的样式代码：**

![image-20230613154848330](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230613154848330.png)

没有问题，触发了检查，告诉我们display应该在background-color之前声明。

**less文件中的样式代码：**

![image-20230613155048513](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230613155048513.png)

**css文件中的样式代码：**

![image-20230613155306745](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230613155306745.png)

!!!没有给出任何报错信息，没有提示我们位置顺序有问题。

我们检查配置，首先找到插件`@vben/stylelint-config`的真实文件位置，这里有一些npm工作区的知识需要学习，暂时就直接拿到这个实体文件的位置：`internal/stylelint-config/.eslintrc.js`

重点看这段代码：

```js
export default {
	// ...
  overrides: [
    {
      files: ['**/*.(css|html|vue)'],
      customSyntax: 'postcss-html',
    },
    // ...
  ]
  // ...
}
```

这里`postcss-html`也解析了`css`文件，然而postcss-html并不支持解析css文件，不仅如此，css文件不要要任何解析器，stylelint原生就支持检查css，所以我们删除css的匹配

```diff
- files: ['**/*.(css|html|vue)'],
+ files: ['**/*.(html|vue)'],
```

重启编辑器（这很重要！）,可以直接重新加载窗口

![image-20230613160159059](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230613160159059.png)

看看效果：

![image-20230613160355386](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230613160355386.png)

已经生效了，检查出一大堆不符合规范的地方，现在我们就基本验证完所有需要验证的样式文件了。



# Eslint

基于prettier和stylelint我们基本解决了代码格式问题和css部分的语法问题，那么js语法问题也需要规范。此时就需要eslint，他不但可以检查js的语法，也可以用于js代码的格式化。

ESLint是一款用于检查和修复JavaScript和JSX代码中潜在问题的工具。它可以帮助开发人员遵循一致的编码风格，并发现代码中的错误、漏洞和不规范之处。ESLint具有高度的可配置性，可以根据项目需求进行定制。

## `.eslintrc.js`

```js
module.exports = {
  root: true,
  extends: ['@vben'],
};

```

到这里想必大家都对root和extends的作用有所了解了，这里不在赘述，但是需要理解的是，extends的缩写模式，我个人非常厌恶这种缩写，就为了少敲几个字符，便让我脑壳炸裂。你说这是故意的还是不小心，还是故意不小心的。

规则：

- 以**eslint-config**开头的安装包，例如`eslint-config-standard`可以省略前面的**eslint-config**。
- 以**@+命名空间**开头的安装包，例如`@vben`表示`@vben/eslint-config`。

## `@vben/eslint-config`

现在顺利成章的找到`@vben/eslint-config`，让我们看看它到底有啥，和之前一样先找到这个文件的位置：`internal/eslint-config/src/index.ts`。

**1-6：指定运行环境**

```js
	env: {
    browser: true,
    node: true,
    es6: true,
  },
```

在 ESLint 的配置文件中，`env` 用于指定代码运行的环境，以便 ESLint 能够识别和正确处理该环境下的全局变量和语法。

在给定的示例配置中，`env` 包含了三个属性：

- `browser: true` 表示代码将在浏览器环境中运行。这将使 ESLint 能够识别和检查浏览器环境中常见的全局变量，如 `window`、`document` 等，并对浏览器相关的语法规则进行校验。
- `node: true` 表示代码将在 Node.js 环境中运行。这将使 ESLint 能够识别和检查 Node.js 环境中的全局变量，如 `process`、`module` 等，并对 Node.js 相关的语法规则进行校验。
- `es6: true` 表示代码将使用 ECMAScript 6（ES6）的语法。这将使 ESLint 能够识别和检查 ES6 中新增的语法特性，如箭头函数、模块导入导出、解构赋值等，并对 ES6 相关的语法规则进行校验。

通过在 `env` 中指定这些属性，ESLint 可以根据指定的环境来检查和校验代码，确保代码在特定环境下的兼容性和正确性。这有助于捕捉潜在的错误和遵循最佳实践，提高代码的质量和可维护性。

**7-19：解析器配置**

```js
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    jsxPragma: 'React',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.*?.json',
    createDefaultProgram: false,
    extraFileExtensions: ['.vue'],
  },
```

