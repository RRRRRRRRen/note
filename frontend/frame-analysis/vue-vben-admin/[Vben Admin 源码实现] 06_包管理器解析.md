# 前言

作为拿到项目第一眼就该看的文件，为什么到现在才去讲这个文件的内容？我们看一眼scripts：

![image-20230616161848104](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230616161848104.png)

然后你可能会问自己，什么是pnpm、czg、turbo、husky等等等？没点背景你敢看package，出来混要有背景！

我们给package.json的各类属性做一个简单分类然后一一介绍。



# pnpm初始化配置

既然vben使用pnpm作为包管理器，那么首先我们就需要熟悉其基本命令，然后理解项目中有关pnpm的配置。

`.npmrc`

```ini
public-hoist-pattern[]=husky
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
public-hoist-pattern[]=lint-staged
public-hoist-pattern[]=*stylelint*
public-hoist-pattern[]=@commitlint/cli
public-hoist-pattern[]=@vben/eslint-config
```

首先看配置项`public-hoist-pattern`是做什么的，找到官网说明[public-hoist-pattern](https://pnpm.io/zh/npmrc#public-hoist-pattern)，简单来说就是用来做依赖提升来解决幻影依赖问题，至于什么是幻影依赖，可以参考这个文章：[NPM 存在的问题以及 PNPM 是怎么处理的 - Yuexun's Blog](https://www.yuexun.me/blog/problems-with-npm-and-how-pnpm-handles-them)。

通过删除这个配置，我们可以对比查看删除前后node_modules的文件结构。

![image-20230608153144899](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230608153144899.png)

可以看出来，这个配置可以将一些子依赖提升到根目录到node_modules中，而不是子依赖的node_modules中，以此来消除其作为幻影依赖的可能。(但是笔者在删除这个配置后，并未影响项目的运行，可能一种保险措施吧，如果有知道的小伙伴请@我)

`pnpm-lock.yaml`

这是与pnpm有关的第二个文件，这个文件其实作用和其他包管理器的lock文件类似，都是用来锁定依赖版本、加快下载和安装速度的，它在保证项目的可重现性和一致性方面起到了重要的作用。这个文件会在安装依赖时自动生成，我们不太需要关注这个文件。

`pnpm-workspace.yaml`

在之前的文件目录简介中，我们提到了一些子项目和内部使用的工具文件夹，这些文件夹也可以作为一个完整的项目来运行。如下三个

- internal

- packages

- apps

在之后学习这些子项目时我们再详细学习这些内容。目前可以简单理解这个配置文件主要的目的就是给这些子项目共享依赖。

`package.json`

这个文件相比大家都很熟悉，在其中几乎可以配置项目相关的所有设置，我们暂时不用逐行理解，在涉及到相关技术时再去学习其中相关的配置。





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

`lint:prettier`
"lint:prettier" 脚本用于执行 Prettier 工具进行代码格式化的任务。让我们逐步解释该脚本的内容：

1. "prettier" 是一个流行的代码格式化工具，用于自动调整代码的格式，使其符合预定义的规范和样式。
2. "--write" 参数表示在运行 Prettier 时对指定的文件进行格式化，并在必要时进行更改。
3. "." 表示指定当前目录下的所有文件进行格式化。这意味着该脚本会对整个项目中的文件进行格式化操作。

`lint:stylelint`

"lint:stylelint" 脚本用于执行 Stylelint 工具进行样式检查和修复的任务。让我们逐步解释该脚本的内容：

1. "stylelint" 是一个用于检查 CSS、SCSS 和 Less 样式的工具，它可以帮助发现并纠正样式表中的问题和违规。
2. ""**/*.{vue,css,less.scss}"" 是一个用于指定需要进行样式检查的文件模式。在这个例子中，它指定了所有 ".vue"、".css" 和 ".less.scss" 文件，包括项目中的所有子文件夹。
3. "--fix" 参数表示在进行样式检查时尝试自动修复一些常见的问题和违规。这样可以自动应用一些修复，使样式符合规范。
4. "--cache" 参数表示在运行 Stylelint 时启用缓存，以提高后续运行的速度。
5. "--cache-location node_modules/.cache/stylelint/" 参数指定了缓存文件的位置，这里是在项目的 "node_modules/.cache/stylelint/" 目录下。

`prepare`

"prepare" 脚本是npm的一个钩子，是在安装项目依赖项之前执行的脚本。

1. "husky" 是一个用于在 Git 项目中添加和管理 Git 钩子的工具。Git 钩子可以在特定的 Git 事件（如提交、推送等）发生时触发自定义脚本。
2. "install" 是 "husky" 工具提供的一个命令，用于安装和配置 Git 钩子。

`preview`

"preview" 脚本用于在构建项目后通过 Vite 进行预览。让我们逐步解释该脚本的内容：

1. "npm run build" 是一个先前定义的脚本，用于构建项目。它会执行构建过程，生成生产环境所需的文件和资源。
2. "vite preview" 是一个 Vite 提供的命令，用于启动一个本地开发服务器，并在浏览器中预览构建后的项目。

`reinstall`

"reinstall" 脚本用于重新安装项目的依赖项。让我们逐步解释该脚本的内容：

1. "rimraf" 是一个用于删除文件和文件夹的工具。它可以递归地删除指定的文件或文件夹。
2. "reinstall" 脚本的目的是执行一系列的删除操作，包括删除 pnpm-lock.yaml、package.lock.json 和 node_modules 文件夹。然后，通过运行 "npm run bootstrap" 脚本，重新安装项目的依赖项。这个脚本通常在需要重新安装项目依赖项时使用，例如在切换分支、更新包管理器或解决依赖冲突等情况下。通过执行这些步骤，可以确保项目依赖项的重新安装，并消除可能的问题或冲突，使项目能够在干净的状态下重新开始。

`serve`

用于启动开发服务器。

`test:gzip`

首先简单介绍下gzip：

Gzip（GNU zip）是一种文件压缩算法和文件格式，用于将文件或数据流压缩为较小的尺寸，以减少传输时间和网络带宽消耗。它是一种通用的压缩算法，广泛应用于文件压缩和网络传输中。

那么如何开启gzip呢？

Gzip 压缩可以在前端和服务端两个层面上进行配置和开启。让我为你解释一下这两种情况：

1. 前端开启：在前端开启 Gzip 压缩意味着在构建过程中，前端开发人员通过配置构建工具（例如 webpack）来启用 Gzip 压缩。通常，前端构建工具会提供相应的配置选项来启用 Gzip 压缩。当前端应用程序构建完成后，生成的资源文件（例如 HTML、CSS、JavaScript）将会被压缩为 Gzip 格式，并在服务器上提供给客户端。
2. 服务端开启：在服务端开启 Gzip 压缩意味着服务器端配置了 Gzip 压缩功能。当客户端发起请求并获取响应时，服务器会检查请求的资源类型，并根据配置决定是否将响应内容进行 Gzip 压缩。如果服务器开启了 Gzip 压缩，并且客户端支持 Gzip 解压缩，服务器将会对响应的内容进行压缩，并将压缩后的内容传输给客户端。

"test:gzip" 脚本用于在本地启动一个服务器，并测试构建后的项目是否启用了 Gzip 压缩。让我们逐步解释该脚本的内容：

1. "npx http-server" 是一个使用 http-server 工具启动本地服务器的命令。http-server 是一个简单的命令行工具，用于在本地快速启动一个基于 HTTP 的文件服务器。
2. "dist" 是一个指定的目录路径，表示需要启动服务器的目标目录。在这种情况下，它指的是构建后的项目输出目录。
3. "--cors" 参数表示允许跨域资源共享。这允许从其他域访问服务器上的资源。
4. "--gzip" 参数表示启用 Gzip 压缩。当请求资源时，服务器会尝试以 Gzip 格式进行压缩，并将压缩后的资源传输给客户端，从而减少传输的数据量。
5. "-c-1" 参数表示禁用缓存。服务器将发送响应头以禁用客户端的缓存，确保每次请求都能获取到最新的资源。

`type:check`

脚本 "type:check" 的含义是运行类型检查器来检查 TypeScript 类型错误。让我详细解释一下该脚本的内容：

"vue-tsc" 是一个命令行工具，用于运行 Vue.js 项目中的 TypeScript 类型检查器。它会分析项目中的 TypeScript 代码，并检查是否存在类型错误或不一致的问题。

选项 "--noEmit" 指示 TypeScript 类型检查器在检查代码时不生成任何输出文件。这意味着它仅执行类型检查而不进行实际的编译或转译操作。

选项 "--skipLibCheck" 表示跳过对引入的库文件进行类型检查。通常，引入的库文件已经经过类型检查，因此可以跳过对它们的检查，以加快类型检查的速度。



# 代码修复类：39-67

```json
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ],
    "{!(package)*.json,*.code-snippets,.!(browserslist)*rc}": [
      "prettier --write--parser json"
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
  },
```

提供给husky暴露的git钩子per-commit使用的。当触发git的commit时，会自动根据这个配置去执行代码修复的功能，写法比较固定，不需要深究。



# 提交信息类：63-67

```json
  "config": {
    "commitizen": {
      "path": "node_modules/cz-git"
    }
  },
```

vben推荐使用czg来进行代码提交的操作，但是也不排斥使用commitizen来提交代码，vben通过这个配置项配置好了commitizen，喜欢使用commitizen的成员也可以无感切换到vben到统一配置。



# 依赖项目类：68-149

根据项目进展逐一介绍



# 环境描述类：150-154

```json
  "packageManager": "pnpm@8.1.0",
  "engines": {
    "node": ">=16.15.1",
    "pnpm": ">=8.1.0"
  }
```

这些字段的目的是为了确保你的项目在正确的环境中运行，但是也仅仅是提供了对所需工具和环境的建议，你依然可以无视危险继续安装其他版本。

`"packageManager": "pnpm@8.1.0",`

这个字段指定了项目使用的包管理器是 pnpm，并且版本号是 8.1.0。

这意味着vben希望我们在项目中使用 pnpm 来管理依赖项的安装和管理。

`engines`

这个字段指定了你的项目所需的 Node.js 和 pnpm 的最低版本要求。根据你的设置：

- Node.js 版本需求是 `>=16.15.1`，这表示你的项目需要 Node.js 版本大于等于 16.15.1 才能正常运行。
- pnpm 版本需求是 `>=8.1.0`，这表示你的项目需要 pnpm 版本大于等于 8.1.0 才能正常工作。