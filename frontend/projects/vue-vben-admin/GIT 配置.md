# GIT 配置

*类型：practice ｜ 难度：进阶 ｜ 标签：vue-vben-admin、Git、Commitlint、husky、lint-staged*

**Vben Admin 的 GIT 工程化是一条完整链路：`.gitattributes`/`.gitignore` 统一仓库行为，Commitlint 规范提交信息格式，czg 提供交互式提交界面，husky 暴露 git 钩子（commit-msg 校验提交信息、pre-commit 执行 lint-staged 修复代码）。多人协作时，提交记录一致、提交内容可控都靠这条链路保障。**

## GIT 基础配置

### `.gitattributes`

Git 的配置文件，用于指定特定文件或文件类型的属性和行为，例如设置文本或二进制属性、指定语言、设置换行符风格等。

主要解决不同操作系统、不同成员之间的换行符问题。之前 settings.json 中的设置只影响文件编辑和保存时的换行符，无法改变代码仓库中的换行符：git 总会把换行符转换为 lf（`\n`），checkout 代码时再根据 gitattributes 设置自动转化。

```ini
# 所有文本文件自动规范化换行符为 LF
* text=auto eol=lf

# 以下文件 checkout 时始终使用 CRLF
*.{cmd,[cC][mM][dD]} text eol=crlf
*.{bat,[bB][aA][tT]} text eol=crlf

# 真正的二进制文件，不做换行符处理
*.{ico,png,jpg,jpeg,gif,webp,svg,woff,woff2} binary
```

- `* text=auto eol=lf`：所有文本文件使用自动检测的换行符风格，规范化为 LF（Unix 风格）。
- `*.{cmd,...} text eol=crlf`：`.cmd`、`.bat` 及其大小写变体文件使用 CRLF（Windows 风格）。
- 二进制文件（图片、字体）标记为 binary，不进行换行符处理。

事实上 vben 的代码仓库中并没有 cmd 和 bat 文件，这两条属于冗余设置。

### `.gitignore`

指定 Git 忽略哪些文件和文件夹的配置文件，被列出的文件不会被添加到仓库或被跟踪：

```ini
# npm 包安装仓库，执行 install 命令后自动生成
node_modules
# macOS 生成的隐藏文件，存储文件夹自定义属性，对 git 无用
.DS_Store
# 项目打包生成的文件，执行 build 命令后自动生成
dist
# 缓存文件夹，保存编译、依赖的缓存文件
.cache
# turbo 的缓存文件
.turbo

# 服务器静态文件夹与上传文件夹
tests/server/static
tests/server/static/upload

# 本地环境相关
.local
.env.local
.env.*.local
# ESLint 的缓存文件
.eslintcache

# 各种包管理器生成的日志文件
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# 其他编辑器生成的文件，vben 只对 vscode 做配置
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# npm 包管理器生成的锁定文件
package-lock.json
# pnpm 包管理器生成的锁定文件
pnpm-lock.yaml

# vscode 安装本地缓存插件后生成的 .history 文件夹，忽略提交
.history
```

一个例外：`pnpm-lock.yaml` 声明忽略但 git 仍会捕捉。因为该文件出现的时间比 `.gitignore` 中相应规则早——git 忽略规则只会忽略从未被捕捉的文件，之前被捕获过的文件忽略规则无效。实际上这个文件也有作用：确保不同环境中安装相同的依赖版本，保证项目的一致性和可重复性。

## GIT 提交记录规范

### Commitlint

Commitlint 用于规范化提交消息格式：运行 `git commit -m 'xxx'` 时检查 `'xxx'` 是否满足团队约定的提交规范。配置文件为 `.commitlintrc.js`。

**引入 node 依赖包**

```js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
```

- `fs`：访问文件系统，读取文件、写入文件、创建目录等。
- `path`：处理和转换文件路径，获取文件名、扩展名、拼接路径等。
- `child_process`：执行外部命令，`execSync` 用于同步执行。

**获取 scopes 目录**

```js
const scopes = fs
  .readdirSync(path.resolve(__dirname, 'src'), { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name.replace(/s$/, ''));
```

- scope（作用域）是描述提交变更范围或影响的标识符，没有明确规定，按仓库作者的习惯设置。例如优化通用组件时 scope 可以是 `components` 或 `cpts`。
- `readdirSync(..., { withFileTypes: true })`：读取 src 下的文件和文件夹列表，返回详细信息对象。
- `.filter((dirent) => dirent.isDirectory())`：过滤出文件夹。
- `.map((dirent) => dirent.name.replace(/s$/, ''))`：去掉末尾 s，最终得到 `['api', 'asset', 'component', ...]`，作为后面可选的 scope。

**获取有变动的文件列表**

```js
const scopeComplete = execSync('git status --porcelain || true')
    .toString()
    .trim()
    .split('\n')
    .find((r) => ~r.indexOf('M  src'))
    ?.replace(/(\/)/g, '%%')
    ?.match(/src%%((\w|-)*)/)?.[1]
    ?.replace(/s$/, '');
```

- `git status --porcelain` 打印 git 追踪的文件变更列表，`execSync` 执行后拿到结果（Buffer 形式，toString 后可读）。
- `.find((r) => ~r.indexOf('M  src'))`：使用位运算快速判断 indexOf 是否为 -1（`~-1 => 0`），拿到第一个 src 下被修改的文件，如 `M  src/App.vue`。
- 最后通过正则提取出目录名，用于后面默认的 scope。

**JSDoc 注释提供类型提示**

```js
/** @type {import('cz-git').UserConfig} */
```

这种形式的注释是 JSDoc 注释，相当于给 js 加一层 buff 使其具有部分 ts 功能——这里引用了 cz-git 类型声明文件的 UserConfig 类，输入时提供快捷录入和属性提示。之所以不直接用 ts，是因为 node 环境没有 ts 解析过程，配置文件只能用 js。

**核心配置**

```js
module.exports = {
  // 提交信息包含 init 时直接跳过检查
  ignores: [(commit) => commit.includes('init')],
  // 继承 commitlint 官方推荐配置
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 提交消息正文之前始终需要空行
    'body-leading-blank': [2, 'always'],
    // 提交消息尾部之前始终需要空行
    'footer-leading-blank': [1, 'always'],
    // 头部最大长度限制在 108 个字符以内
    'header-max-length': [2, 'always', 108],
    // 主题不允许为空
    'subject-empty': [2, 'never'],
    // 类型不允许为空
    'type-empty': [2, 'never'],
    // 不校验主题大小写
    'subject-case': [0],
    // 允许的提交类型白名单
    'type-enum': [
      2,
      'always',
      [
        'feat', 'fix', 'perf', 'style', 'docs', 'test', 'refactor',
        'build', 'ci', 'chore', 'revert', 'wip', 'workflow', 'types', 'release',
      ],
    ],
  },
  // ...
}
```

规则写法与 ESLint 类似。使用不在 `type-enum` 范围内的 type 提交时会被拦截，提交失败。`ignores` 中的 init 规则实际意义不大：init 一般只存在于项目初始化阶段的第一次提交，后续功能的 init 完全可以用 feat 加描述信息完成。

**提示配置**

```js
prompt: {
  /** @use `yarn commit :f` */
  // 提交类型别名，可通过快捷命令快速选择
  alias: {
    f: 'docs: fix typos',
    r: 'docs: update README',
    s: 'style: update code format',
    b: 'build: bump dependencies',
    c: 'chore: update config',
  },
  // 未获取到变更 scope 时自定义项排前面，否则排后面
  customScopesAlign: !scopeComplete ? 'top' : 'bottom',
  // 默认范围：选择 custom 时的默认输入内容
  defaultScope: scopeComplete,
  // 可选的 scope 范围
  scopes: [...scopes, 'mock'],
  allowEmptyIssuePrefixs: false,
  allowCustomIssuePrefixs: false,
  // 追加额外的 type（extends 继承的 type 不够用时使用）
  typesAppend: [
    { value: 'wip', name: 'wip:      work in process' },
    { value: 'workflow', name: 'workflow: workflow improvements' },
    { value: 'types', name: 'types:    type definition file changes' },
  ],
  // 为不同 commit 结构部分提供中文描述，提升中文环境使用体验
  messages: {
    type: '选择你要提交的类型 :',
    scope: '选择一个提交范围 (可选):',
    customScope: '请输入自定义的提交范围 :',
    subject: '填写简短精炼的变更描述 :\n',
    body: '填写更加详细的变更描述 (可选)。使用 "|" 换行 :\n',
    breaking: '列举非兼容性重大的变更 (可选)。使用 "|" 换行 :\n',
    footerPrefixsSelect: '选择关联issue前缀 (可选):',
    customFooterPrefixs: '输入自定义issue前缀 :',
    footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
    confirmCommit: '是否提交或修改commit ?',
  },
  // 自定义 scope 选项的描述信息
  emptyScopesAlias: 'empty:      不填写',
  customScopesAlias: 'custom:     自定义',
}
```

### cz-git、czg

三者关系：

- **czg**：交互式命令行工具，直接调出一个界面选一选、填一填，生成标准化的 git commit message。它直接读取 commitlint 的配置文件 `.commitlintrc.js`，类似功能共用相同配置减少了开发人员的负担。
- **Commitizen**：与 czg 类似的交互界面启动器，但需要配置适配器，之后通过 `git cz` 触发。
- **cz-git**：Commitizen 的一个适配器（模板）。czg 内置了 cz-git 作为适配器，省去了配置适配器的过程。

开发者不一定都按推荐路线提交——有人喜欢用全局安装的 Commitizen，有人喜欢原生 `git commit -m "xxx"`。vben 通过 package.json 中的 `config.commitizen` 配置统一了这些触发方式的行为。

## GIT 提交内容规范

提交信息标准化了，但写了个明显 bug、错误语法、乱七八糟的样式也不能随便提交，这时需要 husky。

### husky

- Husky 是用于在 Git 仓库中添加 Git 钩子的工具。Git 钩子是在特定 Git 事件（提交代码、推送代码等）发生时触发的脚本，可用于执行自定义操作或校验，确保代码质量和一致性。
- 运作原理：初始化时 Husky 创建 `.git/hooks` 目录并添加对应的钩子脚本文件（如 `pre-commit`、`pre-push`、`commit-msg`）。执行 `git commit` 或 `git push` 时，Git 检查对应钩子脚本并在适当时机调用。
- 使用方式：借助 npm 钩子 prepare（`pnpm install` 时自动触发，也可手动 `pnpm run prepare`）执行 `husky install`，把 git 钩子暴露出来。执行后会多出 `_` 文件夹，说明 husky 准备就绪。

常用钩子：

- pre-commit：提交前先检查代码并自动修复不合适的地方。
- commit-msg：检查提交信息是否符合规范。

创建钩子的官方示例：

```bash
npx husky add .husky/pre-commit "npm test"
git add .husky/pre-commit
```

注意：在 package.json 中直接配置钩子脚本是老版本 husky 的用法，新版改变了使用方式。

**commit-msg 钩子**

```shell
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
PATH="/usr/local/bin:$PATH"

npx --no-install commitlint --edit "$1"
```

- `npx`：执行项目依赖中的可执行命令，无需全局安装，在 `node_modules/.bin` 目录下查找。
- `--no-install`：不安装依赖，本地已安装 commitlint 则直接使用。
- `--edit "$1"`：`$1` 是脚本参数，表示传入的提交消息文件路径。

即 commit-msg 钩子触发 commitlint 校验 commit message。

**pre-commit 钩子**

```shell
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
. "$(dirname "$0")/common.sh"

# CI 环境下跳过
[ -n "$CI" ] && exit 0
PATH="/usr/local/bin:$PATH"

# Format and submit code according to lintstagedrc.js configuration
pnpm exec lint-staged
```

- `pnpm exec`：在项目环境中执行指定的命令。
- `lint-staged`：对暂存文件进行 lint 检查的工具。

### lint-staged

`lint-staged` 在代码提交前自动对暂存文件运行指定的 lint 工具。工作流程：

- 执行提交操作时，检查暂存区中哪些文件将要提交。
- 对符合配置规则的文件，按预定义的 lint 命令和规则执行操作（格式化、静态分析等）。
- 如果 lint 操作失败或文件不符合规则，阻止提交并输出错误信息。

配置在 package.json 中：

```json
"lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ],
    "{!(package)*.json,*.code-snippets,.!(browserslist)*rc}": [
      "prettier --write --parser json"
    ],
    "package.json": [
      "prettier --write"
    ],
    "*.vue": [
      "prettier --write",
      "eslint --fix",
      "stylelint --fix"
    ],
    "*.{scss,less,styl,html}": [
      "prettier --write",
      "stylelint --fix"
    ],
    "*.md": [
      "prettier --write"
    ]
  }
```

- `eslint --fix`：执行 eslint 对代码进行检查和修复。
- `prettier --write`：对代码进行格式化处理。
- `stylelint --fix`：格式化、检查修复 css 语法。

## 流程总结

- 配置 git：通过 gitattributes 解决换行符显示问题，通过 gitignore 忽略不需要追踪的文件。
- 配置 commitlint：配置 `.commitlintrc.js` 文件，规范提交记录的格式。
- 配置 czg：借助 czg 提供可交互的 git 提交界面。
- 配置 husky：暴露出 git 的钩子，在 commit-msg 钩子中使用 commitlint 校验提交记录，在 pre-commit 中使用 lint-staged 修复代码。
- 配置 lint-staged：提供给 husky 使用。

## GitHub 配置

非开源项目不需要这些额外配置，简单分析。

### `.gitpod.yml`

Gitpod 是基于浏览器的在线 IDE，与 GitHub/GitLab 集成，提供预配置的开发环境，可简单理解为在线编辑器并提供了调试功能：

```yaml
ports:
  # 端口映射
  - port: 3344
    # 自动打开调试页面
    onOpen: open-preview
# 定义运行的任务
tasks:
  - init: pnpm install
    command: pnpm run dev
```

### `.github`

GitHub 专用配置目录：

```text
.github
├── ISSUE_TEMPLATE          # Issue 模板（bug、feature、中文 bug 模板及配置）
├── commit-convention.md    # 提交规范文档
├── contributing.md         # 贡献指南
├── pull_request_template.md # PR 模板
└── workflows               # GitHub Actions 工作流
    ├── deploy.yml          # 部署工作流
    ├── issue-close-require.yml
    ├── issue-labeled.yml
    └── release.yml         # 发布工作流
```

GitHub Actions 是 GitHub 提供的自动化工作流功能：在代码仓库中创建 YAML 格式的工作流配置，响应代码提交、PR 创建或合并等事件，自动执行构建、测试、部署、发布等操作，提高开发效率并保证代码质量。
