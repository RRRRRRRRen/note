# TS 配置

*类型：practice ｜ 难度：入门 ｜ 标签：vue-vben-admin、TypeScript、tsconfig、路径映射*

**Vben Admin 的 TypeScript 配置采用三层继承：项目 `tsconfig.json` 继承 `@vben/ts-config/vue-app.json`，后者再继承 `base.json`——通用编译选项收敛在 base，Vue 应用选项在中间层，项目只声明路径映射和类型入口。目录中出现 `tsconfig.json` 即意味着该目录是 TypeScript 项目的根目录。**

## `tsconfig.json`

`tsconfig.json` 文件是 TypeScript 项目的配置文件，用于指定编译器的选项和项目的文件包含与排除规则。JavaScript 项目可使用 `jsconfig.json`，作用基本相同，只是默认启用了一些 JavaScript 相关的编译选项。

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

### 关键配置项

- `$schema`：指定 JSON Schema 的 URL，用于验证 JSON 数据有效性、提供智能感知和自动补全，可简单理解为代码提示工具。配置后鼠标悬浮可显示字段含义，键入时有输入提示。
- `extends`：继承 `@vben/ts-config/vue-app.json` 的配置，与 ESLint 中的继承一致，最终指向 `internal/ts-config/vue-app.json`。
- `baseUrl`：指定模块解析的基础路径，默认为当前目录（"."），用于简化模块导入。
- `types`：指定要包含的类型声明文件列表。包括 `vite/client` 和 `unplugin-vue-define-options/macros-global`，可在 node_modules 中找到对应 `.d.ts` 文件，使用其中类型声明时不需要手动引入。
- `paths`：定义模块解析的映射规则，将路径前缀映射到相应目录。如 `#/*` 映射到 `types/*`，配置后可正常识别并给出智能路径补全，使用绝对路径导入时非常好用。
- `include`：指定要包含在编译中的文件和文件夹的匹配模式列表。
- `exclude`：指定要排除在编译之外的文件和文件夹的匹配模式列表。

## `vue-app.json`

继承链的第二层，位于 `internal/ts-config/vue-app.json`：

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

- `display`：仅用于说明该文件的用途，TS 官方不支持此配置项。
- `extends`：继续继承 base.json。
- `jsx: "preserve"`：指定 JSX 语法的处理方式，preserve 表示保留 JSX 语法，不进行额外转换。
- `lib`：指定编译器可使用的库文件。"ESNext" 表示使用最新的 ECMAScript 标准，"DOM" 表示使用浏览器的 DOM API。
- `noImplicitAny: false`：允许隐式的 any 类型，即允许不显式声明变量类型为 any。

## `base.json`

继承链的底层，收敛所有通用编译选项：

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Base",
  "compilerOptions": {
    // 编译目标为最新的 ECMAScript 版本
    "target": "ESNext",
    // 使用最新的模块系统
    "module": "ESNext",
    // 模块解析方式为 Node.js 风格
    "moduleResolution": "node",
    // 启用严格模式，开启更严格的类型检查
    "strict": true,
    // 生成声明文件（.d.ts）
    "declaration": true,
    // 禁止显式的方法重写标记缺失
    "noImplicitOverride": true,
    // 检测未使用的局部变量并报错
    "noUnusedLocals": true,
    // 允许默认导入和命名空间导入编译为 CommonJS 的 require
    "esModuleInterop": true,
    // catch 语句中的变量类型默认为 any
    "useUnknownInCatchVariables": false,
    // 关闭项目的组合模式
    "composite": false,
    // 不生成声明文件的映射文件
    "declarationMap": false,
    // 强制文件名大小写一致
    "forceConsistentCasingInFileNames": true,
    // 不在源文件中嵌入源码映射
    "inlineSources": false,
    // 每个文件作为独立模块编译
    "isolatedModules": true,
    // 跳过对声明文件的检查
    "skipLibCheck": true,
    // 不报告未使用的函数参数
    "noUnusedParameters": false,
    // 保留编译后的文件输出
    "preserveWatchOutput": true,
    // 启用实验性的装饰器语法支持
    "experimentalDecorators": true,
    // 允许导入 JSON 文件作为模块
    "resolveJsonModule": true,
    // 编译后移除注释
    "removeComments": true
  },
  "exclude": ["**/node_modules/**", "**/dist/**"]
}
```

核心选项速记：

| 选项 | 作用 |
| --- | --- |
| `strict` | 开启严格模式，一组严格检查的总开关 |
| `isolatedModules` | 每个文件作为独立模块，配合转译工具（如 Vite/esbuild）更安全 |
| `skipLibCheck` | 跳过声明文件检查，加快编译 |
| `esModuleInterop` | 兼容 CommonJS 的默认导入语义 |
| `experimentalDecorators` | 支持装饰器语法 |
| `resolveJsonModule` | 允许 import JSON 文件 |
