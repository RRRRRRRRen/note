# 前言

在配置好包管理之后，我们就可以随意下载和安装依赖去书写代码了，但是vben作为一个大型项目，必定存在协作开发的情况，为此必须要统一代码风格和规则，至于好处也不用多说了。所以在正式写代码前，先配置好相关的代码规范可以起到一劳永逸的效果。



# 编辑器配置

在这之前我们已经初始化了项目，已经完全可以上手写代码了，但是为了达到一个规范代码的目的，我们还需要规范所有参与开发当前项目的人，所使用的编辑器具有相同的行为，防止出现风格各异的代码。

虽然我们之后会提到一系列代码检查工具和格式化工具，使用这些工具可以确保具有相同的代码风格，但这些工具都需要主动在命令行中调用才可以做这些格式化的工作，所以我们需要vscode这款强大的编辑器实时的去完成这些工作，让我们在编写代码的同时也可以做好格式化代码、检查代码这些工作。

## `settings.json`

如果你是独自开发一整个项目，不需要和别人写作，那么你可以直接在vscode左下角按钮进入全局的设置文件进行配置

![image-20230608174337421](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230608174337421.png)

此时就可以在这个窗口中根据提供好的分类去一一设置了

![image-20230608174520640](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230608174520640.png)

这对于一些常用的设置项进行更改时还是比较容易的，但是一旦需要设置的内容很多时，我们并不推荐在这里修改，而是前往其源头文件`settings.json`中去修改。

至于怎么进入`settings.json`，有很多快捷方法，这里笔者认为最快的方式就是通过命令面板快捷键（command + shift + P）进入，只需要输入settings前几个字符就可以快速进入了。

![image-20230608174925569](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230608174925569.png)

这个文件是一个全局的配置文件，我们可以把通用的配置和常用的配置都放在这个文件，这里的配置对我来说主要三个作用：

- 设置一些通用的配置，例如字体、主题、终端配置、编辑器的行为等
- 定义各种文件的默认格式化工具和编辑器本身的格式化行为
- 通用插件的配置选项，例如better-comments（给注释加上各种强调色）

这里不过多介些这些配置，我们可以在这种论坛上找到大神们分享的配置文件。

总之，我们将与项目无关的配置放在这里，或者提前为可能与项目有关的配置设置好默认值。

## `.vscode`

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

2-4：这些是volar插件提供的功能。

```json
  // 配置ts开发工具包的地址，vben的ts是项目安装的，配置后就可以指定项目安装的ts版本运行，而不是使用可能存在于全局的ts版本
	"typescript.tsdk": "./node_modules/typescript/lib", 
	// 开启ts，该选项已经弃用了，默认开启
  "volar.tsPlugin": true,
	// 开启ts状态栏，该选项已经弃用了
  "volar.tsPluginStatus": false,
```

5-8：配置

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













# editorconfig

EditorConfig 是一种用于定义和维护跨多个编辑器和 IDE 的代码风格和格式化规则的文件。它提供了一种统一的方式来配置和管理代码文件的缩进、换行符、字符编码、文件格式等方面的规范。

通过 `.editorconfig` 文件，你可以指定项目中的每个文件的编辑器配置选项。

但是为什么找不到这个文件呢，其实是应为vscode的设置项可以指定隐藏哪些文件。我们找到`.vscode`文件夹

```tree

```



