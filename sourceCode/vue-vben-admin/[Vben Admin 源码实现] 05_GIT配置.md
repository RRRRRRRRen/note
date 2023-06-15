# 前言

vben使用git作为版本管理工具，在使用git管理大型的多人项目时，我们希望git具有一致的行为，并且同时希望大家的提交信息具有一定的规范，让成员能够轻松的了解每次提交做了哪些事情。

这时候我们就需要对git进行一定的配置。



# GIT基础配置

## `.gitattributes`

`.gitattributes` 文件是 Git 版本控制系统中的一个配置文件，用于指定特定文件或文件类型的属性和行为。该文件位于 Git 仓库的根目录，用于定义文件的行为，例如设置文件的文本或二进制属性、指定文件的语言、设置文件的换行符风格等。

在这里主要还是为了解决不同操作系统中或不同成员之间的换行符问题，确保代码在不同环境中具有一致的换行符。虽然之前我们已经在settings.json中对换行符进行了设置，但是settings.json中只是影响文件的编辑和保存时的换行符，无法改变代码仓库中的换行符，git总是会把换行符转换为lf（\n）,所以无论我们编辑时使用何种换行符，git代码仓库中总是以lf保存，而在我们checkout代码时，会根据gitattributes设置的自动转化换行符为设置的内容。

我们分析一下它的内容：

```ini
# Automatically normalize line endings (to LF) for all text-based files.
* text=auto eol=lf

# Declare files that will always have CRLF line endings on checkout.
*.{cmd,[cC][mM][dD]} text eol=crlf
*.{bat,[bB][aA][tT]} text eol=crlf

# Denote all files that are truly binary and should not be modified.
*.{ico,png,jpg,jpeg,gif,webp,svg,woff,woff2} binary
```

这是一个示例的 `.gitattributes` 文件内容，它包含了一些常见的配置：

- `* text=auto eol=lf`：这一行指定所有文本文件使用自动检测的换行符风格，并将其规范化为 LF（Unix 风格的换行符）。
- `*.{cmd,[cC][mM][dD]} text eol=crlf`：这一行指定以 `.cmd`、`.CMD` 或 `.cmd` 大小写变体结尾的文件都使用 CRLF（Windows 风格的换行符）。
- `*.{bat,[bB][aA][tT]} text eol=crlf`：这一行指定以 `.bat`、`.BAT` 或 `.bat` 大小写变体结尾的文件都使用 CRLF。
- `*.{ico,png,jpg,jpeg,gif,webp,svg,woff,woff2} binary`：这一行指定以 `.ico`、`.png`、`.jpg`、`.jpeg`、`.gif`、`.webp`、`.svg`、`.woff` 或 `.woff2` 结尾的文件都被视为二进制文件，不进行换行符处理。

该 `.gitattributes` 文件的目的是配置 Git 在处理文件时的行为。它使用模式匹配来匹配文件，并根据文件类型指定相应的属性，例如换行符风格。这样可以确保在不同的操作系统或团队成员之间保持一致的文件行尾风格，减少因换行符导致的差异和问题。

但事实上vben的代码仓库中并没有cmd和bat文件，所以以上的设置应该也是冗余设置，无效哒。



## `.gitignore`

`.gitignore` 是一个用于指定 Git 版本控制系统忽略哪些文件和文件夹的配置文件。在项目中创建 `.gitignore` 文件后，您可以列出您希望 Git 忽略的文件和文件夹，这样它们就不会被添加到 Git 仓库中或被跟踪。

之前提到的大不跟ignore文件都是按照gitignore标准去解读的，这里逐行解析下：

```ini
# npm包安装仓库，不需要追踪，会在执行install命令后自动生成
node_modules
# 是 macOS 操作系统生成的一个隐藏文件，用于存储文件夹的自定义属性和元数据，例如文件夹的图标位置、背景颜色和窗口视图选项等，对于git来说毫无卵用。
.DS_Store
# npm项目打包生成的文件，会在执行build命令后自动生成
dist
# 缓存文件夹，一般保存了编译、依赖的缓存文件，git也不需要
.cache
# turbo的缓存文件，之后会介绍turbo
.turbo

# 服务器中的静态文件夹
tests/server/static
# 忽略测试服务器中的上传文件夹
tests/server/static/upload

# 本地环境相关的文件夹
.local
# 本地环境配置文件
.env.local
.env.*.local
# ESLint 的缓存文件
.eslintcache

# Log files
# 各种包管理器生成的日志文件
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
# 各种编辑器生成的文件夹，vben推荐使用了vscode，不对其他编辑器进行配置，也不接受其配置
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# npm包管理器生成的锁定文件
package-lock.json
# pnpm包管理器生成的锁定文件
pnpm-lock.yaml

# 根据vben的提交记录：应该是插件导致的不需要的额外文件
# fix: vscode安装本地缓存插件后，项目根目录下会生成.history文件夹，忽略提交
.history
```

这些文件要么被`settings.json`中的`files.exclude`设置给隐藏了，要么就是执行某些操作，例如install和build命令后自动生成，而被vscode显示为灰色文件夹和文件：

![image-20230615111930579](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230615111930579.png)

然而出现了一个例外，我们看到了一个`pnpm-lock.yaml`文件，明明被声明忽略，还是会git捕捉。

其实是应为这个文件出现的时间比`.gitignore`中相应的规则要早，git忽略规则只会忽略从未被捕捉的文件，而`pnpm-lock.yaml`之前被捕获过，所以忽略规则就对其无效了。

其实也无伤大雅，这个文件还是有其一定作用的，他可以确保在不同的环境中安装相同的依赖版本，以保证项目的一致性和可重复性。



# GIT提交记录规范

git的基础配置一点搞定，现在git可以根据我们的要求来追踪需要追踪的文件，那么现在就需要规范提交记录了。

## Commitlint

Commitlint 是一个用于规范化提交消息格式的工具。它可以帮助团队在版本控制系统中创建一致、清晰和易于理解的提交记录。Commitlint 可以在每次提交代码时，通过配置的规则检查提交消息的格式是否符合预定义的规范。它基于规则和规范，强制要求提交消息遵循特定的格式和约定，例如使用规定的前缀、遵循特定的提交消息模板、添加必要的信息等。

就是当我们运行`git commmit -m 'xxx'`时，来检查`'xxx'`是不是满足团队约定好的提交规范的工具。

我们找到Commitlint的配置文件：`.commitlintrc.js`，然后老规矩逐行解析：

**1-3：引入node依赖包**

```js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
```

如果你对node有一定了解，一定知道这个三个包的作用。

- `fs`模块提供了访问文件系统的方法，例如读取文件、写入文件、创建目录等。
- `path`模块提供了处理和转换文件路径的方法，例如获取文件名、获取扩展名、拼接路径等。
- `child_process`模块用于执行外部命令，并可以同步或异步地获取命令的输出。
  - `execSync`用于同步执行外部命令



**4-8：获取scopes目录**

```js
const scopes = fs
  .readdirSync(path.resolve(__dirname, 'src'), { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name.replace(/s$/, ''));
```

首先介绍下什么是scoped：

"scoped"通常指的是提交的作用域（scope），作用域是用于描述提交的变更范围或影响的标识符。这个作用于没有明确的规定，一般按照仓库作者的习惯自行设置。

例如我提交了一个用于优化了一些通用组件的代码，这时候，我的scoped就可以是`components`或者`cpts`，具体叫什么一切看作者的约定了。

在这里，作者就给了明确的约定：

`.readdirSync(path.resolve(__dirname, 'src'), { withFileTypes: true })`

读取src文件夹下的文件和文件夹列表，withFileTypes表示为返回每个文件和文件夹的详细信息对象。看看这一步输出的结果：

```js
scopes :>>  [
  Dirent { name: '.DS_Store', [Symbol(type)]: 1 },
  Dirent { name: 'App.vue', [Symbol(type)]: 1 },
  Dirent { name: 'api', [Symbol(type)]: 2 },
  Dirent { name: 'assets', [Symbol(type)]: 2 },
  Dirent { name: 'components', [Symbol(type)]: 2 },
  Dirent { name: 'design', [Symbol(type)]: 2 },
  Dirent { name: 'directives', [Symbol(type)]: 2 },
  Dirent { name: 'dist', [Symbol(type)]: 2 },
  Dirent { name: 'enums', [Symbol(type)]: 2 },
  Dirent { name: 'hooks', [Symbol(type)]: 2 },
  Dirent { name: 'layouts', [Symbol(type)]: 2 },
  Dirent { name: 'locales', [Symbol(type)]: 2 },
  Dirent { name: 'logics', [Symbol(type)]: 2 },
  Dirent { name: 'main.ts', [Symbol(type)]: 1 },
  Dirent { name: 'router', [Symbol(type)]: 2 },
  Dirent { name: 'settings', [Symbol(type)]: 2 },
  Dirent { name: 'store', [Symbol(type)]: 2 },
  Dirent { name: 'utils', [Symbol(type)]: 2 },
  Dirent { name: 'views', [Symbol(type)]: 2 }
]
```

```js
.filter((dirent) => dirent.isDirectory())
```

这一步用于过滤出上一步返回结果中是文件夹的项目：

```js
scopes :>>  [
  Dirent { name: 'api', [Symbol(type)]: 2 },
  Dirent { name: 'assets', [Symbol(type)]: 2 },
  Dirent { name: 'components', [Symbol(type)]: 2 },
  Dirent { name: 'design', [Symbol(type)]: 2 },
  Dirent { name: 'directives', [Symbol(type)]: 2 },
  Dirent { name: 'dist', [Symbol(type)]: 2 },
  Dirent { name: 'enums', [Symbol(type)]: 2 },
  Dirent { name: 'hooks', [Symbol(type)]: 2 },
  Dirent { name: 'layouts', [Symbol(type)]: 2 },
  Dirent { name: 'locales', [Symbol(type)]: 2 },
  Dirent { name: 'logics', [Symbol(type)]: 2 },
  Dirent { name: 'router', [Symbol(type)]: 2 },
  Dirent { name: 'settings', [Symbol(type)]: 2 },
  Dirent { name: 'store', [Symbol(type)]: 2 },
  Dirent { name: 'utils', [Symbol(type)]: 2 },
  Dirent { name: 'views', [Symbol(type)]: 2 }
]
```

```js
  .map((dirent) => dirent.name.replace(/s$/, ''));
```

用于去掉末尾s：

```js
scopes :>>  [
  'api',       'asset',
  'component', 'design',
  'directive', 'dist',
  'enum',      'hook',
  'layout',    'locale',
  'logic',     'router',
  'setting',   'store',
  'util',      'view'
]
```

简而言之就是把src下的文件夹作为scoped的可选项保留，等后面使用。



**9-18：获取有变动的文件列表**

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

```js
execSync('git status --porcelain || true')
```

我们看一下这个命令：`git status --porcelain || true`做了什么：

![image-20230615161441317](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230615161441317.png)我们手动执行这个命令，他打印出来一个git追踪的文件列表。

`execSync('git status --porcelain || true')`

这一步就容易理解了，他执行外部的这个命令，然后拿到结果，大概率是这样的东西：

```js
<Buffer 4d 20 20 2e 63 6f 6d 6d 69 74 6c 69 6e 74 72 63 2e 6a 73 0a 4d 20 20 73 72 63 2f 41 70 70 2e 76 75 65 0a>
```

我们简单介绍下Buffer，他是Node.js中的一个类，用于保存二进制数据，我们可以对他进行转换变成可读的内容。

```js
.find((r) => ~r.indexOf('M  src'))
```

这里使用位运算快速判断indexOf是否为-1（`~-1 => 0`）,这样就可以拿到第一个src下被修改的文件目录了。

假设我们只修改了src/App.vue文件，到这一步的返回结果就是：`M  src/App.vue`

最后通过三个正则判断提取出App，这里的正则也很有意思，包含了贪婪匹配的运用，有兴趣的可以研究下正则，这就不做介绍了，不然无限套娃，然后迷失在知识的海洋中。

总结下，这里就是获取一个src下直属子目录的文件夹名称（我们的案例src/App.vue算是个特例，他不是文件夹，但是不影响返回的结果），用于后面需要使用的默认的scoped。



**21-22：提供注释功能**

```js
/** @type {import('cz-git').UserConfig} */
```

乍一看就是个注释，有啥好研究的，但是vscode给这个注释上了一层颜色，那么这段注释肯定不简单，一定有他的作用，比较带色的注释可不多见。

![image-20230615163701254](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230615163701254.png)

这种形式的注释在 JavaScript 中被称为 JSDoc 注释。JSDoc 是一种用于描述 JavaScript 代码的标记语言，可以用来提供文档和类型信息。它通常在函数、变量或类的定义之前使用，以提供关于代码功能、参数、返回值和类型的注释。

其实就是给js上一层buff，让他具有ts的部分功能，这里给处理代码提示的功能，他引用了node_modules下cz-git中的类型声明文件的*UserConfig*类。

![image-20230615164024789](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230615164024789.png)

效果就是我在输入是，提供快捷录入功能，并介绍属性来源：

![image-20230615164151135](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230615164151135.png)

那么为什么不直接用ts呢，要知道这里是node，不存在ts解析的过程，所以node环境下没法识别js，所以就只能用js作为配置文件了。



**21-22：忽略设置**

```js
module.exports = {
  ignores: [(commit) => commit.includes('init')],
  // ...
}
```

直接表示，提交信息中有init的话，直接忽略检查，不对提交信息进行校验。然而实际使用上，当我们的提交信息中包含了init就会跳过检查，即便是一段很明显不符合规范的提交：

![image-20230615164923169](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230615164923169.png)

所以这段忽略规则大可不必，init一般指存在于项目初始化阶段的第一次提交，后续的其他功能的init，完全可以使用feat加上其他描述信息来完成。



**23：继承配置**

```js
extends: ['@commitlint/config-conventional'],
```

好家伙，又来继承了，不过这个配置是commitlint提供一个推荐配置，一般不需要过度深究，理解为增加了默认配置即可。



**24-52：规则**

```js
  rules: {
    // 提交消息正文之前是否需要空行，这里配置为始终需要空行。
    'body-leading-blank': [2, 'always'],
    // 提交消息尾部之前是否需要空行，这里配置为始终需要空行。
    'footer-leading-blank': [1, 'always'],
    // 提交消息头部的最大长度限制，这里配置为始终限制在108个字符以内。
    'header-max-length': [2, 'always', 108],
    // 提交消息的主题是否允许为空，这里配置为不允许为空。
    'subject-empty': [2, 'never'],
    // 提交消息的类型是否允许为空，这里配置为不允许为空。
    'type-empty': [2, 'never'],
    // 提交消息的主题大小写校验规则，这里配置为不校验大小写。
    'subject-case': [0],
    // 提交消息的类型校验规则，这里配置了一组允许的类型。
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'perf',
        'style',
        'docs',
        'test',
        'refactor',
        'build',
        'ci',
        'chore',
        'revert',
        'wip',
        'workflow',
        'types',
        'release',
      ],
    ],
  },
```

乍一看，梦回eslint，其实比较类似，Commitlint也提供了内置的功能选项来快速完成规则配置。

看一下最后一条：`type-enum`规则，我们使用不在范围的type：ok，然后尝试提交，检测出不是给定范围的type，提交失败。唉，好使。

![image-20230615170107821](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230615170107821.png)



**53-108：提示配置**

```js
  prompt: {
    /** @use `yarn commit :f` */
    alias: {
      f: 'docs: fix typos',
      r: 'docs: update README',
      s: 'style: update code format',
      b: 'build: bump dependencies',
      c: 'chore: update config',
    },
    customScopesAlign: !scopeComplete ? 'top' : 'bottom',
    defaultScope: scopeComplete,
    scopes: [...scopes, 'mock'],
    allowEmptyIssuePrefixs: false,
    allowCustomIssuePrefixs: false,

    // English
    typesAppend: [
      { value: 'wip', name: 'wip:      work in process' },
      { value: 'workflow', name: 'workflow: workflow improvements' },
      { value: 'types', name: 'types:    type definition file changes' },
    ],
  }
```

`alias`

提交类型的别名，可以通过快捷命令进行选择。

例如，我们通过package.json中配置的commit脚本运行时，可以快速完成提交信息的键入。

![image-20230615171103036](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230615171103036.png)

`customScopesAlign`

用于自定义scoped的排序方式，这里的意思就是，如果没获取到之前计算得到的scopeComplete，那么在选择scoped的时候前面的选项更推荐你自己输入一下或者为空：

![image-20230615172336043](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230615172336043.png)

如果有的话，那么推荐你选一个吧：

![image-20230615172440753](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230615172440753.png)

`defaultScope`

默认范围，子啊选择custom时，默认输入的内容。

`scopes`

定义可选的scoped范围。

`allowEmptyIssuePrefixs`、`allowCustomIssuePrefixs`

呃，我没找到在哪配置可以提供选择issue的功能。# TODO

`typesAppend`

用于添加额外的type，我们使用了extends来获取type，但是继承来的extends不够用，这时就需要使用这个字段增加一些配置。

**注释部分**

注释部分还提供了一些其他配置，其实可以开放来时用，提高中文环境下的使用体验。

```js
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
```

messages属性配置为不同的commit结构部分提供描述信息：

![image-20230615175338177](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230615175338177.png)

```js
    emptyScopesAlias: 'empty:      不填写',
    customScopesAlias: 'custom:     自定义',
```

这两给配置为自定义选项的scoped提供描述信息：

![image-20230615175518748](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230615175518748.png)













# Github配置

## `.gitpod.yml `

`.gitpod.yml` 是 Gitpod 配置文件，用于定义在 Gitpod 中运行的开发环境和任务。它位于项目的根目录下，告诉 Gitpod 如何设置开发环境、安装依赖和执行任务。

那么Gitpod是什么呢？

Gitpod 是一个基于浏览器的集成开发环境（Integrated Development Environment，IDE），旨在提供无缝的在线开发体验。它与 GitHub 和 GitLab 集成，可以让开发人员在浏览器中直接进行代码编写、调试和构建。Gitpod 提供了预配置的开发环境，无需手动设置和安装依赖项，开发者可以快速启动并与团队成员共享工作环境。

使用 Gitpod，开发者可以轻松地在云端进行代码编写和协作，无需在本地设置开发环境。Gitpod 提供了强大的功能，如自动保存、预览窗口、终端集成、调试器和扩展支持，使开发过程更高效和便捷。

Gitpod 的目标是提供一致、可靠和可扩展的开发环境，让开发者可以随时随地访问他们的项目，并与团队成员无缝协作。无论是个人开发者还是团队，Gitpod 都可以提供一个统一的开发环境，简化开发流程并提高生产力。

可以简单理解为在线编辑器，并且提供了调试功能。

```yml
ports:
	# 端口映射
  - port: 3344
  # 自动打开调试页面
    onOpen: open-preview
# 定义了运行的任务
tasks:
  - init: pnpm install
    command: pnpm run dev
```

