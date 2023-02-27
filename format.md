# 构建代码规范

## ESlint

### 1.安装vscode eslint插件

### 2.全局安装/项目安装eslint包

```shell
# 全局安装可以安装最新版本
npm i -g eslint

# 项目安装跟随package.json的版本，以下以7.15.0版本为蓝本
npm i -D eslint@7.15.0
```

### 3.安装eslint插件和扩展

```shell
# 安装eslint prettier扩展，用于解决prettier与eslint的冲突
npm i -D eslint-config-prettier@8

# 安装eslint prettier插件，用于适配prettier规则
npm i -D eslint-plugin-prettier@3

# 安装eslint vue插件，用于支持vue语法的规则
npm i -D eslint-plugin-vue@7

# 安装eslint vue/cli 推荐插件（一般随脚手架自带）
npm	i -D @vue/cli-plugin-eslint@4

# 安装babel支持包（一般随脚手架自带）
npm i -D @babel-eslint@10
```

### 4.配置`.eslintrc.js`文件

```js
module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    ecmaVersion: 12,
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  // plugin:vue/recommended：vue提供的扩展与插件
  // eslint:recommended： eslint自带的扩展
  // plugin:prettier/recommended：与prettier兼容所需的扩展与插件
  extends: ['plugin:vue/recommended', 'eslint:recommended', 'plugin:prettier/recommended'],

  rules: {
    'prettier/prettier': 0, // 关闭eslint 与 prettier冲突时的校验
    // ...
  }
}
```

### 5.配置`.eslintignore`文件

```txt
build/*.js
src/assets
public
dist
```

### 6.配置vscode设置

```json
{
  // 用于保存时自动修复eslint校验的规则
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.fixAll.eslint": true,
  },
  "eslint.format.enable": true,
  "eslint.enable": true,
  "eslint.quiet": true,
  "eslint.validate": ["javascript", "javascriptreact", "html", "vue"],
  "eslint.lintTask.enable": true,
}
```

### 7.重启vscode使设置生效

```shell
command + shift + p
reload window
```



## Prettier

### 1.安装vscode prettier插件

### 2.全局安装/项目安装prettier包

```shell
# 全局安装可以安装最新版本
npm i -g prettier

# 项目安装跟随package.json的版本
npm i -D prettier@2
```

### 3.安装与eslint兼容的插件扩展

### 4.配置`.prettierrc.js`	文件

```js
// 此处为prettier全部规则
module.exports = {
  printWidth: 120, // 单行长度
  tabWidth: 2, // 缩进长度
  useTabs: false, // tab代替空格
  semi: false, // 句末分号
  singleQuote: true, // 单引号
  quoteProps: 'as-needed', // 对象的key添加引号
  jsxSingleQuote: true, // jsx中使用单引号
  trailingComma: 'all', // 多行时尽可能打印尾随逗号
  bracketSpacing: true, // 在对象前后添加空格-eg: { foo: bar }
  bracketSameLine: false, // 多属性html标签的‘>’折行放置
  jsxBracketSameLine: false, // 多属性html标签的‘>’折行放置
  arrowParens: 'avoid', // 单参数箭头函数参数周围使用圆括号-eg: (x) => x
  rangeStart: 0, // 格式化范围开始
  rangeEnd: Infinity, // 格式化范围结束
  // parser: 'none', // 特殊文件需要的解析器
  // filepath: 'none', // 特殊文件的地址
  requirePragma: false, // 无需顶部注释即可格式化
  insertPragma: false, // 在已被preitter格式化的文件顶部加上标注
  proseWrap: 'preserve', // 改变换行属性
  htmlWhitespaceSensitivity: 'ignore', // 对HTML全局空白不敏感
  vueIndentScriptAndStyle: false, // 不对vue中的script及style标签缩进
  endOfLine: 'auto', //结束行形式
  embeddedLanguageFormatting: 'auto', // 对引用代码进行格式化
  singleAttributePerLine: false // 是否强行再vue、react和html使用单行属性
};
```

### 5.配置`.prettierignore`

```json
// 基本都需要prettier美化，所以不设置忽略
```

### 6.配置vscode设置

```markdown
// 安装vscode插件
vuter 提供代码块服务
```

```json
{
  // 设置vscode格式化行为
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.formatOnType": true,
  "editor.formatOnSaveMode": "modifications",
  // 针对不同文件所设置的格式化程序
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript|react]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript|react]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[less]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  // 禁止vetur格式化与验证，让其只提供代码块
  "vetur.validation.template": false,
  "vetur.validation.style": false,
  "vetur.validation.script": false,
}
```

### 7.重启vscode使其生效



## Husky与lint-staged

### 1.安装包

```shell
npm i -D husky@4 lint-staged@10
```

### 2.配置`package.json`

```json
{
  // 提供git钩子
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  // 执行eslint修复
  "lint-staged": {
    "src/**/*.{js,vue}": [
      "eslint --fix",
      "git add"
    ]
  },
}
```



## commitizen

建议全局安装规范自己的代码提交，也可以项目安装

### 1.安装commitizen包

```shell
npm i -g commitizen
```

### 2.安装自定义配置包

```shell
npm i -g cz-customizable
```

### 3.根目录写入配置

```shell
echo '{"path":"cz-customizable"}' > .czrc
```

### 4.根目录写入自定义规则

```shell
echo '内容如下' > .cz-config.js
```

```js
'use strict';

module.exports = {

  types: [
    {
      value: 'WIP',
      name : '💪  WIP:      Work in progress'
    },
    {
      value: 'feat',
      name : '✨  feat:     A new feature'
    },
    {
      value: 'fix',
      name : '🐞  fix:      A bug fix'
    },
    {
      value: 'refactor',
      name : '🛠  refactor: A code change that neither fixes a bug nor adds a feature'
    },
    {
      value: 'docs',
      name : '📚  docs:     Documentation only changes'
    },
    {
      value: 'test',
      name : '🏁  test:     Add missing tests or correcting existing tests'
    },
    {
      value: 'chore',
      name : '🗯  chore:    Changes that don\'t modify src or test files. Such as updating build tasks, package manager'
    },
    {
      value: 'style',
      name : '💅  style:    Code Style, Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)'
    },
    {
      value: 'revert',
      name : '⏪  revert:   Revert to a commit'
    }
  ],

  skipEmptyScopes: true,
  allowCustomScopes: false,
  allowBreakingChanges: ["feat", "fix"]
};
```

### 5.重启控制台使其生效，必要时需要重启