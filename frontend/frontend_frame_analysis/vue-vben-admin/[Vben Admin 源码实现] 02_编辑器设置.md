# 前言

在配置好包管理之后，我们就可以自行下载和安装依赖去书写代码了，但是vben作为一个大型项目，必定存在协作开发的情况，为此必须要统一代码风格和规则。

我们知道像vscode这类编辑器是具有非常多的高级功能的，例如代码提示、格式化等等。这类编辑器他不像记事本那样，记事本几乎所有的东西都不可配置，也没有高级功能，一切都看起来那么纯粹。而vscode这类编辑器，具有非常多的可配置功能，这会造成同一个项目、同一个编辑器写出的代码千人千面，就连现实的效果也会天差地别。正因为如此，统一编辑器的行为就成了至关重要的一步。



# 一、全局配置

> 在我们学习vben是如何配置vscode之前，我们先了解一些概念和做一些简单的全局配置。

## 1. 进入设置

**可交互的设置界面**

如果你是独自开发一整个项目，不需要和别人写作，那么你可以直接在vscode左下角按钮进入全局的设置文件进行配置

![image-20230608174337421](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230608174337421.png)

此时就可以在这个窗口中根据提供好的分类去一一设置了

![image-20230608174520640](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230608174520640.png)

**编辑器的配置文件**

这对于一些常用的设置项进行更改时还是比较容易的，但是一旦需要设置的内容很多时，我们并不推荐在这里修改，而是前往其源头文件`settings.json`中去修改。

至于怎么进入`settings.json`，有很多快捷方法，这里笔者认为最快的方式就是通过命令面板快捷键（command + shift + P）进入，只需要输入settings前几个字符就可以快速进入了。

![image-20230608174925569](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230608174925569.png)

这个文件是一个全局的配置文件，我们可以把通用的配置和常用的配置都放在这个文件，这里的配置对我来说主要三个作用：

- 设置一些通用的配置，例如字体、主题、终端配置、编辑器的行为等
- 定义各种文件的默认格式化工具和编辑器本身的格式化行为
- 通用插件的配置选项，例如better-comments（给注释加上各种强调色）

这里不过多介些这些配置，我们可以在这种论坛上找到大神们分享的配置文件。

总之，我们将与项目无关的配置放在这里，或者提前为可能与项目有关的配置设置好默认值。



## 2. 通用配置

这里还是补充一份笔者自用的一个全局设置，配置项不多，想要尽量维持全局配置的纯粹。

```json
{
  // ! 外观
  "window.zoomLevel": 1,
  "editor.fontSize": 16,
  "editor.lineHeight": 24,
  "workbench.iconTheme": "material-icon-theme",
  "workbench.colorTheme": "Dracula Soft",
  
  // ! 编辑器
  "editor.tabSize": 2,
  "editor.dragAndDrop": false,
  "editor.guides.bracketPairs": true,

  // ! 保存行为
  "editor.formatOnSave": false,
  "editor.formatOnPaste": false,
  "editor.formatOnType": false,
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.fixAll.eslint": true
  },

  // ! 代码校验
  "javascript.validate.enable": false,
  "typescript.validate.enable": false,

  // ! 文件资源管理器
  "files.exclude": {
    "**/.svn": true,
    "**/.hg": true,
    "**/.DS_Store": true,
    "**/.sass-cache": true,
    "**/.vscode": false,
    "**/node_modules": false
  },

  // ! 代码格式化
  "editor.defaultFormatter": "esbenp.prettier-vscode",
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

  // ! 插件 - Eslint
  "eslint.enable": true,
  "eslint.quiet": true,
  "eslint.validate": ["javascript", "javascriptreact", "vue"],
  "eslint.format.enable": true,
  "eslint.lintTask.enable": true,
}
```

这里做一些简单的分类，详细的配置作用我们稍后介绍。



# 二、项目级配置

> 在这之前我们已经初始化了项目，已经完全可以上手写代码了，但是为了达到一个规范代码的目的，我们还需要规范所有参与开发当前项目的人，所使用的编辑器具有相同的行为，防止出现风格各异的代码。
>
> 虽然我们之后会提到一系列代码检查工具和格式化工具，使用这些工具可以确保具有相同的代码风格，但这些工具都需要主动在命令行中调用才可以做这些格式化的工作，所以我们需要vscode这款强大的编辑器实时的去完成这些工作，让我们在编写代码的同时也可以做好格式化代码、检查代码这些工作。



## 1. `.vscode`文件夹

我们可以通过编辑器内置的设置选项来设置一些通用的配置，那么和项目强相关的配置该怎么处理呢，我们并不希望为了适配某个项目而使得整个通用配置被改的面目全非。

这个时候就需要针对vscode这个编辑器的项目级的设置，在项目根目录下创建文件夹`.vscode`就可以实现这样的功能，在这其中进行的各种配置的优先级都是最高的。

查看vben的.vscode文件夹结构，可以看到三个文件，我们接下来就逐步讲解这三个文件的作用。

```tree
.vscode
├── extensions.json
├── launch.json
└── settings.json
```

### `extensions.json`

```json
{
  "recommendations": [
    "vue.volar",
    "dbaeumer.vscode-eslint",
    "stylelint.vscode-stylelint",
    "esbenp.prettier-vscode",
    "mrmlnc.vscode-less",
    "lokalise.i18n-ally",
    "antfu.iconify",
    "mikestead.dotenv",
    "heybourn.headwind"
  ]
}
```

1. **`vue.volar`**:
   - 这是一个针对 Vue.js 项目的 VS Code 插件，提供了对 Volar 的支持。Volar 是一个基于 TypeScript 的 Vue 3 编辑器插件，提供了更快速、更智能的 Vue 3 语法高亮、智能感知和类型检查等功能。
2. **`dbaeumer.vscode-eslint`**:
   - 这是一个用于集成 ESLint 到 VS Code 的插件。它会根据你的 ESLint 配置文件来检测和提示代码中的 JavaScript 或 TypeScript 错误和风格问题，并提供快速修复建议。
3. **`stylelint.vscode-stylelint`**:
   - 这是一个用于集成 Stylelint 到 VS Code 的插件。Stylelint 是一个强大的 CSS 和样式表 lint 工具，该插件可以在编辑器中实时检测 CSS、SCSS 或 LESS 文件中的语法和风格问题。
4. **`esbenp.prettier-vscode`**:
   - 这是一个集成 Prettier 到 VS Code 的插件。Prettier 是一个代码格式化工具，该插件可以在保存文件时自动格式化代码，帮助保持项目的代码风格一致。
5. **`mrmlnc.vscode-less`**:
   - 这是一个用于在 VS Code 中提供对 LESS (Leaner Style Sheets) 文件的语法高亮和语法检查支持的插件。
6. **`lokalise.i18n-ally`**:
   - 这是一个用于国际化（i18n）开发的插件，支持在 VS Code 中管理和编辑多语言字符串，同时提供了国际化资源的自动化功能。
7. **`antfu.iconify`**:
   - 这是一个 VS Code 插件，用于集成 Iconify 图标系统，允许你在编辑器中快速搜索、预览和插入图标。
8. **`antfu.unocss`**:
   - 这是一个用于 VS Code 的 Unocss 插件，Unocss 是一个自动删除未使用 CSS 样式的工具，该插件可以与 Unocss 集成，帮助优化项目的 CSS 样式表。
9. **`mikestead.dotenv`**:
   - 这是一个用于在 VS Code 中提供对 `.env` 文件的语法高亮和语法检查支持的插件，使得环境变量文件更易于编辑和管理。
10. **`warmthsea.vscode-custom-code-color`**:
    - 这是一个自定义代码颜色的 VS Code 插件，允许你根据自定义规则和配置，调整编辑器中代码的颜色和外观，以适应个人或团队的喜好和需求。

在这个文件中，我们可以设置项目推荐安装的插件和不推荐安装的插件，只要在数组中添加这个插件的标识符就可以让他出现在vscode插件市场的推荐菜单下：

![image-20230609160721218](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230609160721218.png)

但是需要注意的是，已经安装的插件是不会出现在这个推荐菜单下。至于插件的标识符怎么获取，也很简单，直接右击插件然后选择复制扩展id即可

![image-20230609160920783](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230609160920783.png)

我们简单介绍下这几个推荐插件的作用：

1. `vue.volar`：Vue 语言支持插件，提供了更好的 Vue 3 开发支持、语法高亮、智能提示等功能。
2. `dbaeumer.vscode-eslint`：ESLint 插件，用于 JavaScript 和 TypeScript 代码的静态代码分析和格式化。它可以帮助你遵循一致的代码风格和检测常见的代码错误。
3. `stylelint.vscode-stylelint`：Stylelint 插件，用于 CSS 和预处理器（如 Sass、Less）代码的静态代码分析和格式化。它可以帮助你确保 CSS 代码的一致性和规范性。
4. `esbenp.prettier-vscode`：Prettier 插件，提供了代码格式化功能，支持多种语言和文件类型。它可以帮助你自动格式化代码，使其符合统一的代码风格。
5. `mrmlnc.vscode-less`：LESS 插件，提供了 LESS 语言支持和代码编辑功能，包括语法高亮、智能提示等。
6. `lokalise.i18n-ally`：国际化插件，用于帮助开发人员管理和翻译多语言项目。它提供了查找、替换、验证和导出多语言资源的功能。
7. `antfu.iconify`：Iconify 图标插件，提供了丰富的图标库和图标使用功能。它可以帮助你轻松地在代码中使用矢量图标。
8. `mikestead.dotenv`：dotenv 文件支持插件，用于编辑和管理 `.env` 文件。它提供了语法高亮、智能提示和验证等功能，方便你在开发过程中管理环境变量。
9. `heybourn.headwind`：Headwind CSS 插件，用于帮助你整理和排序 CSS 类名。它可以根据你的 HTML 和 CSS 文件自动排序类名，使得样式表更加有序和可读性更高。

### `launch.json`

`.vscode/launch.json` 文件是 Visual Studio Code 的调试配置文件，用于配置和定义调试器的行为和设置。它提供了一种在 Visual Studio Code 中调试应用程序的方式，允许你设置断点、观察变量、逐步执行代码等调试操作。

配置完成后就可以在vscode中进行浏览器端的调试：

![image-20230609163504674](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230609163504674.png)

不过笔者还是比较喜欢直接在浏览器中进行调试，日常开发基本都是两块屏幕，一块调试，一块写代码。如果有习惯在编辑器中进行调试的小伙伴，这一块应该非常熟悉了。

### `settings.json`

主要的设置功能都放在这个文件内， `.vscode/settings.json`中的配置优先级都是高于全局配置的，在这里就可以进行项目的个性化定制了。

我们来逐行看：

**1-4：这些是volar插件提供的功能。**

```json
  // 配置ts开发工具包的地址，vben的ts是项目安装的，配置后就可以指定项目安装的ts版本运行，而不是使用可能存在于全局的ts版本
	"typescript.tsdk": "./node_modules/typescript/lib", 
	// 开启ts，该选项已经弃用了，默认开启
  "volar.tsPlugin": true,
	// 开启ts状态栏，该选项已经弃用了
  "volar.tsPluginStatus": false,
```

**5-8：配置**

```json
  // 	指定包管理器，但并不能限制项目使用其他包管理器
	"npm.packageManager": "pnpm",
	// 编辑器中制表符或空格缩进的宽度为 2 个空格
  "editor.tabSize": 2,
	// 默认使用 Prettier 插件来格式化代码
  "editor.defaultFormatter": "esbenp.prettier-vscode",
	// 设置了文本文件的行尾符为换行符 "\n"
  "files.eol": "\n",
```

`npm.packageManager`

只能用于改变vscode触发行为，而非终端中使用的命令行行为，例如下面的操作就会使用我们配置的pnpm去运行。

![image-20230609173744952](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230609173744952.png)

![image-20230609174058771](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230609174058771.png)

`files.eol`

在不同的操作系统中，文本文件的行尾符可能有所区别：

- 在 Unix 和 Linux 系统中，行尾符为换行符（`\n`）。
- 在 Windows 系统中，行尾符为回车符加换行符（`\r\n`）。
- 在旧版的 Mac OS（Mac OS 9 及之前）中，行尾符为回车符（`\r`）。

当在跨平台的开发环境中共享代码时，使用不同的行尾符可能会导致一些问题，统一换行符有助于代码的一致性方便跨平台协作。

**9-56: 文件系统管理**

```json
	// 全局搜索是忽略的文件夹和文件
  "search.exclude": {
    "**/node_modules": true,
		// ...
    "**/.yarn": true
  },
	// 用于设置哪些文件和文件夹在工作区隐藏，隐藏后避免了手动修改这些文件的情况
  "files.exclude": {
    "**/.cache": true,
		// ...
    "**/.DS_Store": true,
  },
	// 用于设置vscode文件监视器忽略的文件。
  "files.watcherExclude": {
    "**/.git/objects/**": true,
		// ...
    "**/yarn.lock": true
  },
```

`files.watcherExclude`

在查阅大量资料后，我发现这个设置非常诡异，按照文档说明，被匹配的文件不会被vscode文件监视器所监视，意味着文件的删除、修改、移动不会被vscode感知，也就不会出发代码格式化、自动保存等操作，也不会出发git文件状态的改变。

但实际上，在设置后依然会出发这些操作，stackoverflow中有个相关问题提到这个，解释说vscode的插件扩展是可以覆盖这个设置也可以绕过这个设置，所以有些插件和扩展在被排除的文件中依然可以正常工作，因此给人一种该设置不生效的感觉。

[Stack Overflow 问题地址](https://stackoverflow.com/questions/56863731/do-we-really-need-vs-codes-file-watchers-what-do-they-do-how-can-they-be-disa)

**57-58：stylelint配置**

```json
  // 启用 Stylelint 插件，使其对当前项目进行样式代码的检查和验证
	"stylelint.enable": true,
	// 定义了需要进行样式验证的文件类型
  "stylelint.validate": ["css", "less", "postcss", "scss", "vue", "sass"],
```

简单介绍下stylelint，Stylelint 是一个强大的样式代码检查工具，用于检测和纠正样式文件中的错误、警告和风格问题。

Stylelint 的主要功能包括：

1. 语法检查：检查样式代码的语法错误，例如缺少分号、括号不匹配等。
2. 风格规则：根据预定义的规则集，检查样式代码是否符合一致的编码风格，例如缩进、命名约定、属性顺序等。
3. 错误提示：提供详细的错误信息和位置指示，帮助开发者快速定位和修复问题。
4. 自定义规则：允许开发者定义自己的规则集，以满足项目的特定需求和样式规范。
5. 插件扩展：支持通过插件扩展来增加额外的规则和功能。

**59-61：path-intellisense插件配置**

```json
  // 配置特定文件类型的路径映射规则
	"path-intellisense.mappings": {
    "/@/": "${workspaceRoot}/src"
  },
```

"Path Intellisense" 是一个提供路径自动补全和导航功能的插件，可以帮助开发者更快地输入和浏览文件路径。

但你配置了mappings后，输入前缀就可以自动识别为对应的映射目录，然后就可以快速键入目录了。

![image-20230610110933615](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230610110933615.png)

但是还有很多其他配置可以影响这个提示，例如在tsconfig.json中compilerOptions.paths设置也可以起到同样的作用，经过测试tsconfig.json的优先级可能更高。但是`compilerOptions.paths`的作用不止如此，之后会继续介绍。

**62-85：为不同文件类型分别制定默认的格式化工具**

```json
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[less]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
```

`[javascriptreact]`

这种类型的设置，可以为不同类型的文件设置配置不同的vscode设置，而不是仅限于指定格式化程序，但是一般而言不需要设置其他的选项。

这里我们将所有的默认格式化程序设置为prettier，在执行格式化命令后，会自动调用相关的扩展。

例如，在对main.ts文件右击选择使用...格式化文档，就可以看到prettier被设置为默认选项。

![image-20230610112353828](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230610112353828.png)

![image-20230610112244818](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230610112244818.png)

但是如果你没有安装对应的插件，那么在执行格式化时就会有如下提示：

![image-20230610112614821](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230610112614821.png)

**86-95：文件保存后的行为** 

```json
  // 在保存文件时自动执行的代码操作
	"editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  },
	// 针对vue文件进行的定制化设置
  "[vue]": {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
      "source.fixAll.stylelint": "explicit"
    }
  },
```

该设置项允许你指定一系列代码操作（Code Actions），当你保存文件时，编辑器将自动执行这些操作。代码操作可以是格式化代码、修复错误、应用代码片段等。你可以使用该设置项根据自己的需求来定义要执行的代码操作。

`source.fixAll.eslint`

在保存文件时，自动修复 ESLint 检测到的问题。

`source.fixAll.stylelint`

在保存文件时，自动修复 Stylelint 检测到的问题

**96-104：国际化插件配置**

```json
  // 指定存放语言文件的路径
	"i18n-ally.localesPaths": ["src/locales/lang"],
	// 指定键名的样式，这里设置为嵌套样式
  "i18n-ally.keystyle": "nested",
	// 启用键名排序
  "i18n-ally.sortKeys": true,
	// 启用命名空间功能
  "i18n-ally.namespace": true,
	// 指定语言文件的匹配模式
  "i18n-ally.pathMatcher": "{locale}/{namespaces}.{ext}",
	// 启用的解析器列表
  "i18n-ally.enabledParsers": ["ts"],
	// 源语言设置为英语
  "i18n-ally.sourceLanguage": "en",
	// 显示语言设置为中文
  "i18n-ally.displayLanguage": "zh-CN",
	// 启用的框架列表，这里启用了 Vue 和 React
  "i18n-ally.enabledFrameworks": ["vue", "react"],
```

以上是关于 Visual Studio Code 中 i18n-ally 插件的一些配置选项。根据你的项目需求，你可以根据以上示例进行相应的配置，并根据具体情况进行调整。i18n-ally 插件可以帮助你管理和处理多语言的翻译工作，提供方便的国际化开发体验。

我们将会在国际化部分深入了解这个插件，对于国际化来说这个插件可以说是必须的。

**105-138：**

```json
  // 自定义的单词列表
	"cSpell.words": [
    "vben",
		// ...
    "antd"
  ],
```

`cSpell.words` 是 Visual Studio Code 中 CSpell 插件的配置选项之一。它用于指定自定义的单词列表，这些单词将被视为正确的拼写，不会触发拼写检查的警告。

需要注意的是，Visual Studio Code 的拼写检查功能依赖于当前活动的语言环境和所安装的相关插件。确保你的工作区或文件中已选择正确的语言，并安装了相应的语言支持插件，以便获得最佳的拼写检查体验。

感人感觉用处不大，并且在使用ts时，其提供的检查功能更为实际。

**139-141：插件Vetur配置项**

```json
  // 格式化 Vue 单文件组件中的 <script> 部分时，会自动缩进第一行
	"vetur.format.scriptInitialIndent": true,
	// 表示在格式化 Vue 单文件组件中的 <style> 部分时，会自动缩进第一行。
  "vetur.format.styleInitialIndent": true,
	// 表示关闭对 <script> 部分的语法验证
  "vetur.validation.script": false,
```

在vue3项目中，我们并不推荐同时使用vetur，更推荐使用volar。并且两个有关缩进的设置其实在我们后面学习的prettier和eslint都可以设置，不使用vetur插件时，不需要关注这些配置。个人认为这是一个保险的冗余配置。

**142-159：MicroPython配置**

```json
  "MicroPython.executeButton": [
    {
      "text": "▶",
      "tooltip": "运行",
      "alignment": "left",
      "command": "extension.executeFile",
      "priority": 3.5
    }
  ],
  "MicroPython.syncButton": [
    {
      "text": "$(sync)",
      "tooltip": "同步",
      "alignment": "left",
      "command": "extension.execute",
      "priority": 4
    }
  ],
```

MicroPython 是一种精简版的 Python 解释器，专为嵌入式系统和微控制器设计的。它提供了一种在资源有限的环境中运行 Python 代码的方式，使开发者可以在小型设备上使用高级编程语言进行开发。

所以我们为什么需要Python的设置，why？会不会是某个提交者的失误呢。

**161-170：资源管理器的配置**

```json
  // 启用文件嵌套功能
	"explorer.fileNesting.enabled": true,
	// 不自动展开嵌套的文件夹
  "explorer.fileNesting.expand": false,
	// 定义文件嵌套的规则模式
  "explorer.fileNesting.patterns": {
    "*.ts": "$(capture).test.ts, $(capture).test.tsx",
    "*.tsx": "$(capture).test.ts, $(capture).test.tsx",
    "*.env": "$(capture).env.*",
    "CHANGELOG.md": "CHANGELOG*",
    "package.json": "pnpm-lock.yaml,pnpm-workspace.yaml,LICENSE,.gitattributes,.gitignore,.gitpod.yml,CNAME,README*,.npmrc,.browserslistrc",
    ".eslintrc.js": ".eslintignore,.prettierignore,.stylelintignore,.commitlintrc.js,.prettierrc.js,.stylelintrc.js"
  },
```

一定有人拿到项目后第一时间会看一眼package.json，然后wtf，为什么是个文件夹，而且这个文件夹居然又是个有内容的文件，难道npm更新了吗？

其实就是这个配置导致的，可以让项目的文件夹结构看起来更加清爽，让根目录下相关的配置文件尽量组织在一起，但是只是观感上的差异，实际上文件目录并没有改变。

![image-20230610151948188](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230610151948188.png)

**171：终端配置**

```json
  // 	终端可以回滚查看的历史输出行数，默认1000，这里设置为10000
	"terminal.integrated.scrollback": 10000
```

到这里全部的settings.json文件就解读完了，设计到了不少的插件设置，想要完全体验出这些设置的作用，还需要理解相关插件的作用，我们继续学习。

**174-175：自定义颜色**

```json
  "vscodeCustomCodeColor.highlightValue": "v-auth",
  "vscodeCustomCodeColor.highlightValueColor": "#6366f1"
```

通过使用插件自定义某些代码片段的颜色。

![image-20240506150430456](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20240506150430456.png)

![image-20240506150202346](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20240506150202346.png)

## 2. `.editorconfig`文件

EditorConfig 是一种用于定义和维护跨多个编辑器和 IDE 的代码风格和格式化规则的文件。它提供了一种统一的方式来配置和管理代码文件的缩进、换行符、字符编码、文件格式等方面的规范。

不像.vscode文件夹只能作用于vscode，editorconfig可以作用所有的编辑器。

通过 `.editorconfig` 文件，你可以指定项目中的每个文件的编辑器配置选项。

但是为什么找不到这个文件呢，其实是应为vscode的设置项可以指定隐藏哪些文件，当然也不建议修改这个文件，我们简单看看这个文件。

```ini
# 指示此文件为顶级文件，表示 EditorConfig 配置的起始点。
root = true

# 所有文件的通用设置
[*]
# 指定字符编码为 UTF-8
charset=utf-8
# 指定换行符为 LF（Line Feed）
end_of_line=lf
# 在文件末尾插入空行
insert_final_newline=true
# 使用空格进行缩进
indent_style=space
# 指定缩进的空格数为 2
indent_size=2
# 指定最大行长度为 100，超过该长度的行将被视为过长。
max_line_length = 100

# 适用于所有扩展名为 .yml、.yaml 和 .json 的文件。
[*.{yml,yaml,json}]
indent_style = space
indent_size = 2

# 适用于所有扩展名为 .md 的 Markdown 文件。
[*.md]
# 不移除 Markdown 文件末尾的空格。
trim_trailing_whitespace = false

# 适用于名为 Makefile 的文件。
[Makefile]
# 对于 Makefile 文件，使用制表符进行缩进。
indent_style = tab
```

再次简单介绍少两个东西：

换行符：一种是LF（\n），另一种是CRLF（\r\n），不同的操作系统换行符是不一样的，为了统一不同系统的一致行为，就需要统一换行符。个人认为另一个好处就是在进行全局搜索时，使用正则匹配换行情况时更为准确。

制表符：简单说制表符占据的字符宽度是自适应的，而不是固定的，所以自适应的宽度在编码文件中非常不友好，可能会导致奇奇怪怪的缩进。所以我们需要使用固定宽度的空格来代替制表符`tab`



