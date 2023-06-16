# 前言

作为拿到项目第一眼就该看的文件，为什么到现在才去讲这个文件的内容？我们看一眼scripts：

![image-20230616161848104](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230616161848104.png)

然后你可能会问自己，什么是pnpm、czg、turbo、husky等等等？没点背景你敢看package，出来混要有背景！

我们给package.json的各类属性做一个简单分类然后一一介绍。

# 仓库描述类：1-17

这些属性都比较简单，代码托管平台上会读取这些字段现在是仓库页面，仅仅作为一个描述性的信息来使用，使其他开发者和工具能够了解项目的基本属性和配置。

```json
  // 项目的名称
	"name": "vben-admin",
	// 项目的版本号
  "version": "2.10.0",
	// 项目的主页，通常是指向项目的官方网站或代码仓库
  "homepage": "https://github.com/vbenjs/vue-vben-admin",
	// 用于指定项目的问题追踪地址
  "bugs": {
    // 这是指向项目的问题追踪页面的 URL
    "url": "https://github.com/vbenjs/vue-vben-admin/issues"
  },
	// 项目代码仓库信息的对象
  "repository": {
    // 代码仓库的类型
    "type": "git",
    // 代码仓库的 URL
    "url": "git+https://github.com/vbenjs/vue-vben-admin.git"
  },
	// 项目的授权方式和使用限制
  "license": "MIT",
	// 项目的作者信息
  "author": {
    "name": "vben",
    "email": "anncwb@126.com",
    "url": "https://github.com/anncwb"
  },
```

我们额外介绍下`"license": "MIT"`：

"license" 字段用于指定项目的许可证类型，它定义了项目的授权方式和使用限制。许可证是法律文本，规定了其他人可以在何种条件下使用、修改和分发你的软件。

在示例中，"license" 字段的值是 "MIT"，表示项目采用 MIT 许可证。MIT 许可证是一种宽松的开源许可证，允许用户自由地使用、修改和分发项目的源代码，包括商业用途，而且通常没有太多限制。下面是 MIT 许可证的一些关键特点：

1. 使用自由：任何人都可以免费使用项目的源代码，无论是个人还是组织，也包括商业用途。
2. 修改自由：用户可以自由修改项目的源代码，以满足自己的需求。修改后的代码可以保留原有的 MIT 许可证。
3. 分发自由：用户可以自由地将项目的源代码分发给其他人，包括在开源或闭源项目中使用。
4. 免责声明：MIT 许可证提供的软件是"按原样"提供的，作者不承担任何责任。

需要注意的是，不同的许可证类型具有不同的条款和限制。在选择许可证类型时，您应该考虑到您希望对代码的控制程度、对其他开发者的要求以及您对项目的未来发展的预期。建议您在选择许可证类型时，仔细阅读和理解相应的许可证条款，并确保您的选择符合您的意图和项目的需求。

此外我们注意到项目的根目录下有一个`LICENSE`文件，那么这俩有什么联系呢？

"license" 字段和根目录下的 "LICENSE" 文件之间存在联系。这两者都涉及项目的许可证信息，但在具体的实现上有一些区别：

1. "license" 字段：这是 `package.json` 文件中的一个字段，用于在项目描述中声明项目所采用的许可证类型。它是一个简单的文本字段，指定了许可证的名称或缩写，如 "MIT"、"GPL-3.0" 等。该字段主要用于提供项目的许可证信息，使其他开发者在查看项目描述时能够快速了解许可证类型。
2. "LICENSE" 文件：这是一个实际的文本文件，通常位于项目根目录下，用于详细说明项目的许可证条款和条件。该文件包含了完整的许可证文本，描述了项目源代码的使用和分发方式、版权信息、免责声明等。"LICENSE" 文件的内容具有法律效力，用户在使用和分发项目代码时需要遵守其中的规定。

通常，"LICENSE" 文件中的许可证文本和 "license" 字段中指定的许可证类型是一致的。"LICENSE" 文件提供了详细的许可证条款，而 "license" 字段则简要说明了许可证类型。这样做可以使其他开发者快速了解项目的许可证类型，并在需要时查阅完整的许可证文本以获取更详细的信息。

因此，"license" 字段和根目录下的 "LICENSE" 文件一起提供了项目的许可证信息，从简要说明到详细条款，以满足项目的许可证要求和合规性。



# 运行脚本类：18-38

```json
  "scripts": {
    "bootstrap": "pnpm install",
    "build": "cross-env NODE_ENV=production pnpm vite build",
    "build:analyze": "pnpm vite build --mode analyze",
    "build:no-cache": "pnpm clean:cache && npm run build",
    "build:test": "pnpm vite build --mode test",
    "commit": "czg",
    "dev": "pnpm vite",
    "preinstall": "npx only-allow pnpm",
    "postinstall": "turbo run stub",
    "lint": "turbo run lint",
    "lint:eslint": "eslint --cache --max-warnings 0  \"{src,mock}/**/*.{vue,ts,tsx}\" --fix",
    "lint:prettier": "prettier --write .",
    "lint:stylelint": "stylelint \"**/*.{vue,css,less.scss}\" --fix --cache --cache-location node_modules/.cache/stylelint/",
    "prepare": "husky install",
    "preview": "npm run build && vite preview",
    "reinstall": "rimraf pnpm-lock.yaml && rimraf package.lock.json && rimraf node_modules && npm run bootstrap",
    "serve": "npm run dev",
    "test:gzip": "npx http-server dist --cors --gzip -c-1",
    "type:check": "vue-tsc --noEmit --skipLibCheck"
  },
```

**执行原理**

使用npm run script执行脚本的时候都会创建一个shell，然后在shell中执行指定的脚本。

这个shell会将当前项目的可执行依赖目录（即node_modules/.bin）添加到环境变量path中，当执行之后之后再恢复原样。就是说脚本命令中的依赖名会直接找到node_modules/.bin下面的对应脚本，而不需要加上路径。

`bootstrap`

这个脚本使用 `pnpm` 来执行依赖安装的命令。

`build`

1. "cross-env" 是一个跨平台设置环境变量的工具。它允许我们在不同操作系统上使用相同的方式来设置环境变量。在这个脚本中，"cross-env" 用于设置环境变量 `NODE_ENV` 的值为 "production"，表示我们正在进行生产环境的构建。
2. "NODE_ENV=production" 是设置环境变量 `NODE_ENV` 的语法。`NODE_ENV` 是一个常用的环境变量，在许多构建工具和框架中用于判断当前运行的环境。将其设置为 "production" 表示我们正在进行生产环境的构建，这可以触发一些优化和压缩的行为，以生成更小、更高效的代码。
3. "vite build" 是执行项目构建的命令。Vite 是一个现代化的前端构建工具，它通过利用浏览器原生的 ES 模块支持来提供快速的开发和构建体验。"vite build" 命令会基于项目的配置文件（一般是 vite.config.js）执行项目的构建过程，生成最终的生产环境代码。

综合起来，"build" 脚本的目的是在生产环境下构建项目。它通过设置 `NODE_ENV=production` 环境变量，指示构建工具和框架执行与生产环境相关的优化和压缩行为。然后使用 "pnpm" 执行 "vite build" 命令，调用 Vite 构建工具来生成最终的生产环境代码。

`build:analyze`

默认情况下，开发服务器 (`dev` 命令) 运行在 `development` (开发) 模式，而 `build` 命令则运行在 `production` (生产) 模式。

这意味着当执行 `vite build` 时，它会自动加载 `.env.production` 中可能存在的环境变量，你可以通过传递 `--mode` 选项标志来覆盖命令使用的默认模式。

"--mode analyze" 是传递给 "vite build" 命令的参数之一。通过指定 "--mode analyze" 参数，我们告诉构建工具在构建过程中执行代码分析，生成与构建相关的统计信息和报告。例如：

![image-20230616172258444](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230616172258444.png)

`build:no-cache`

呃，报错了：

![image-20230616172526447](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230616172526447.png)

翻看之前的提交记录，发现`clean:cache在某一次提交中被删除了

![image-20230616172846879](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230616172846879.png)

目的就是清除缓存。清除缓存可以有助于解决一些与依赖项、构建过程或缓存数据相关的问题。当遇到构建或运行问题时，清除缓存是一个常见的排除故障的步骤。但在清除缓存之前，建议先备份重要数据，并确保了解清除缓存的影响和可能的风险。

在使用pnpm时，我们也有同样可以使用其他命令来清空缓存：`pnpm cache clear`

执行该命令后，pnpm 将清空本地缓存目录，删除所有已下载的包和缓存的依赖项。这将强制 pnpm 在接下来的操作中重新下载和构建项目的依赖项。

`build:test`

构建测试环境使用的代码。

`commit`

使用czg提交代码。

`dev`

运行开发模式。

`preinstall`

"preinstall" 脚本是npm的一个钩子，是在安装依赖项之前执行的脚本。

"only-allow" 是一个工具，它可以用于限制项目中使用的包管理器。在这个脚本中，"only-allow" 被用来确保只允许使用 pnpm 来管理项目的依赖项。

综合起来，"preinstall" 脚本的目的是在安装项目的依赖项之前检查当前的包管理器是否为 pnpm。如果当前使用的包管理器不是 pnpm，脚本可能会中断安装过程，并给出相应的错误或警告消息。这样可以强制确保使用正确的包管理器来管理项目的依赖项，以避免可能的兼容性问题或不一致性。

`postinstall`

"postinstall" 脚本是npm的一个钩子，是在安装依赖项之后执行的脚本。

1. "turbo" 是一个任务运行器工具，用于在项目中定义和运行各种任务。它提供了一种简化和组织项目中任务的方式。
2. "run" 是 "turbo" 工具提供的一个命令，用于运行指定的任务。
3. "stub" 是在 "turbo" 任务配置中定义的一个任务名称。在这个脚本中，"turbo run stub" 命令会执行名为 "stub" 的任务。

综合起来，"postinstall" 脚本的目的是在安装项目的依赖项之后运行 "turbo" 工具中定义的名为 "stub" 的任务。这个任务可能会执行一些特定的操作，具体取决于项目的配置和需求。根据提供的信息，无法确定 "stub" 任务的具体行为，因此您需要查看项目中的 "turbo.json" 配置文件或其他相关文档来了解 "stub" 任务的功能和作用。

我们之后会介绍turbo。

`lint`

借助turbo完成lint相关操作。

`lint:eslint`

"lint:eslint" 脚本是用于执行 ESLint 工具进行代码检查和修复的任务。让我们逐步解释该脚本的内容：

1. "eslint" 是一个流行的 JavaScript 代码检查工具，用于发现和修复代码中的潜在问题、错误和风格违规。
2. "--cache" 参数表示在运行 ESLint 时启用缓存，以提高后续运行的速度。
3. "--max-warnings 0" 参数表示在检查过程中，如果出现任何警告都将被视为错误。这样可以确保代码符合严格的规范要求，不允许有任何警告存在。
4. "{src,mock}/**/*.{vue,ts,tsx}" 是指定需要进行检查的文件或文件夹路径的模式。在这个例子中，它指定了在 "src" 和 "mock" 文件夹下的所有 ".vue"、".ts" 和 ".tsx" 文件。
5. "--fix" 参数表示在进行代码检查时尝试自动修复一些常见的问题和风格违规。这样可以自动应用一些修复，使代码符合规范。

综合起来，"lint:eslint" 脚本的目的是运行 ESLint 工具，使用预定义的规则和配置对指定的文件进行代码检查，并尽可能地自动修复一些问题和风格违规。通过运行该脚本，可以帮助保持代码的质量和一致性，减少潜在的错误和问题。