# 概览

`tsconfig.js`文件是 TypeScript 项目的配置文件，用于指定 TypeScript 编译器的选项和项目的文件包含与排除规则。

当目录中出现了 `tsconfig.json` 文件，则说明该目录是 TypeScript 项目的根目录。`tsconfig.json` 文件指定了编译项目所需的根目录下的文件以及编译选项。

JavaScript 项目可以使用 `jsconfig.json` 文件，它的作用与 `tsconfig.json` 基本相同，只是默认启用了一些 JavaScript 相关的编译选项。



# `tsconfig.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@vben/ts-config/vue-app.json",
  "compilerOptions": {
    "baseUrl": ".",
    "types": ["vite/client", "unplugin-vue-define-options/macros-global"],
    "paths": {
      "/@/*": ["src/*"],
      "/#/*": ["types/*"],
      "@/*": ["src/*"],
      "#/*": ["types/*"]
    }
  },
  "include": [
    "tests/**/*.ts",
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.tsx",
    "src/**/*.vue",
    "types/**/*.d.ts",
    "types/**/*.ts",
    "build/**/*.ts",
    "build/**/*.d.ts",
    "mock/**/*.ts",
    "vite.config.ts"
  ],
  "exclude": ["node_modules", "tests/server/**/*.ts", "dist", "**/*.js"]
}
```

## `$schema`

`$schema` 字段在配置文件中的作用是指定 JSON Schema 的 URL。JSON Schema 是一种用于定义 JSON 数据结构的规范，可以用来验证 JSON 数据的有效性、提供智能感知和自动补全等功能。可以简单理解为一个代码提示工具。

鼠标悬浮可以显示字段的含义：

![image-20230614170252250](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230614170252250.png)

键入时有输入提示：

![image-20230614170336880](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230614170336880.png)

## `extends`

表示继承，这里继承了 `@vben/ts-config/vue-app.json` 的配置，扩展了该配置文件的选项。

后面我们会详细介绍这个文件，在这之前我们先找到这个文件。和之前的eslint中的继承一致，会从命名空间中寻找，最终指向了：`internal/ts-config/vue-app.json`

### `compilerOptions`

"compilerOptions" 包含了编译器的选项设置。

**`baseUrl`**

指定模块解析的基础路径，默认为当前目录（"."）。可以使用该选项来简化模块导入的路径。

我们尝试直接使用'src/App.vue'来引入模块，发现ts可以直接显示绝对地址。

![image-20230614171520815](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230614171520815.png)

我们把baseUrl改为`"baseUrl": "./src"`再看看效果：

![image-20230614171809095](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230614171809095.png)

没有问题，依然可以正常导航到绝对路径。

**`types`**

指定要包含的类型声明文件（.d.ts）的列表。在这个例子中，包括了 "vite/client" 和 "unplugin-vue-define-options/macros-global" 这两个类型声明文件。

可以在node_modules中找到这两个文件：`vite/client.d.ts`和`unplugin-vue-define-options/macros-global.d.ts`，之后我们使用这两个文件中的类型声明时就不需要手动引入了。

**`paths`**

定义模块解析的映射规则。对于指定的路径前缀，可以将其映射到相应的文件或目录。

我们验证一下`#/*`：

![image-20230614173317477](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230614173317477.png)

可以正常识别，并且给出了智能路径补全。

我们自己在加一项试试，确实好使，这里在使用绝对路径的时候非常好用！

![image-20230614173638115](https://gitee.com/rrrrrrrren/note_image/raw/master/image-20230614173638115.png)

## include

指定要包含在编译中的文件和文件夹的匹配模式列表。

## exclude

指定要排除在编译之外的文件和文件夹的匹配模式列表。



# `vue-app.json`

之前tsconfig.json的继承了这个文件，我们来看看这里又有些什么内容。

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Vue Application",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "lib": ["ESNext", "DOM"],
    "noImplicitAny": false
  }
}
```

**`display`**

这个没啥用，就是用来表示这个文件是干啥的，ts官方也不支持这个配置项。

**`extends`**

又继承了点东西，待会去看看。

**`compilerOptions.jsx`**

指定 JSX 语法的处理方式。这里设置为 "preserve" 表示保留 JSX 语法，不进行额外的转换处理。

**`compilerOptions.lib`**

指定编译器可以使用的库文件。这里列出了两个库，分别是 "ESNext" 和 "DOM"。"ESNext" 表示使用最新的 ECMAScript 标准，"DOM" 表示使用浏览器的 DOM API。

**`compilerOptions.noImplicitAny`**

指定是否允许隐式的 any 类型。当设置为 false 时，允许在代码中不显式地声明变量的类型为 any。



# `base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Base",
  "compilerOptions": {
    // 指定编译后的目标 ECMAScript 版本为 ESNext，也就是最新的 ECMAScript 版本
    "target": "ESNext",
    // 指定模块的代码生成方式为 ESNext，也就是使用最新的模块系统。
    "module": "ESNext",
    // 指定模块解析的方式为 Node.js 风格的解析。
    "moduleResolution": "node",
    // 启用严格模式，开启更严格的类型检查和错误检查。
    "strict": true,
    // 生成声明文件（.d.ts）。
    "declaration": true,
    // 禁止显式的方法重写标记。
    "noImplicitOverride": true,
    // 检测未使用的局部变量并报错。
    "noUnusedLocals": true,
    // 允许将默认导入和命名空间导入编译为 CommonJS 的 require。
    "esModuleInterop": true,
    // 在 catch 语句中的变量类型默认为 any。
    "useUnknownInCatchVariables": false,
    // 关闭项目的组合模式。
    "composite": false,
    // 不生成声明文件的映射文件。
    "declarationMap": false,
    // 强制文件名的大小写一致。
    "forceConsistentCasingInFileNames": true,
    // 不在源文件中嵌入源码映射。
    "inlineSources": false,
    // 将每个文件作为独立的模块编译。
    "isolatedModules": true,
    // 跳过对声明文件的检查。
    "skipLibCheck": true,
    // 不报告未使用的函数参数。
    "noUnusedParameters": false,
    // 保留编译后的文件输出。
    "preserveWatchOutput": true,
    // 启用实验性的装饰器语法支持。
    "experimentalDecorators": true,
    // 允许导入 JSON 文件作为模块。
    "resolveJsonModule": true,
    // 在编译后移除注释。
    "removeComments": true
  },
  "exclude": ["**/node_modules/**", "**/dist/**"]
}
```

