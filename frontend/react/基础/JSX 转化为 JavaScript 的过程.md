# JSX 转化为 JavaScript 的过程

*类型：knowledge ｜ 难度：基础 ｜ 标签：React、JSX、Babel*

**JSX 不是浏览器能直接识别的语法，它只是 `React.createElement` 的语法糖。** Babel 在构建阶段完成「解析 → 转换 → 生成」三步：把 JSX 解析成 AST（抽象语法树），用 `@babel/plugin-transform-react-jsx` 把 JSXElement 节点转换为 `React.createElement` 调用，再把修改后的 AST 生成普通 JavaScript。理解这条流水线，就能明白「写的是标签、跑的是函数调用」的全部含义。

## 转换的完整步骤

### 1. 编写 JSX 代码

开发者在 React 应用中编写 JSX 代码：

```jsx
const element = <h1>Hello, world!</h1>;
```

### 2. Babel 解析为 AST

Babel 是一个 JavaScript 编译器，广泛用于转化现代 JavaScript 代码，使其在不同的环境中兼容。对于 JSX，Babel 通过插件将其解析为 AST（抽象语法树）——一种描述代码结构的树状表示。

输入代码解析后的 AST 结构（节选）：

```json
{
  "type": "VariableDeclaration",
  "declarations": [
    {
      "type": "VariableDeclarator",
      "id": { "type": "Identifier", "name": "element" },
      "init": {
        "type": "JSXElement",
        "openingElement": {
          "type": "JSXOpeningElement",
          "name": { "type": "JSXIdentifier", "name": "h1" },
          "attributes": []
        },
        "closingElement": {
          "type": "JSXClosingElement",
          "name": { "type": "JSXIdentifier", "name": "h1" }
        },
        "children": [
          {
            "type": "JSXText",
            "value": "Hello, world!"
          }
        ]
      }
    }
  ]
}
```

### 3. 转换 AST

Babel 使用其插件系统对 AST 进行转换：`@babel/plugin-transform-react-jsx` 插件将 JSXElement 节点转换为 `React.createElement` 的调用表达式（CallExpression）：

```json
{
  "type": "VariableDeclaration",
  "declarations": [
    {
      "type": "VariableDeclarator",
      "id": { "type": "Identifier", "name": "element" },
      "init": {
        "type": "CallExpression",
        "callee": {
          "type": "MemberExpression",
          "object": { "type": "Identifier", "name": "React" },
          "property": { "type": "Identifier", "name": "createElement" }
        },
        "arguments": [
          { "type": "Literal", "value": "h1" },
          { "type": "Literal", "value": null },
          { "type": "Literal", "value": "Hello, world!" }
        ]
      }
    }
  ]
}
```

### 4. 生成 JavaScript 代码

Babel 将修改后的 AST 转换回 JavaScript 代码，最终生成的代码如下：

```javascript
const element = React.createElement("h1", null, "Hello, world!");
```

- 补充：React 17+ 的 automatic runtime 下，编译产物改为从 `react/jsx-runtime` 导入的 `jsx("h1", { children: "Hello, world!" })`，组件不再需要手动引入 React。函数形态不同，但「JSX 在构建期被编译为函数调用」的思想完全一致。

## Babel 的配置与使用

实际项目中通常使用 Babel 配置文件和构建工具自动完成转换。

安装 Babel 核心、命令行工具和 React 预设插件：

```bash
npm install --save-dev @babel/core @babel/cli @babel/preset-react
```

创建一个名为 `.babelrc` 的配置文件，指定使用 React 预设：

```json
{
  "presets": ["@babel/preset-react"]
}
```

使用 Babel CLI 将 JSX 代码转换为 JavaScript 代码（源码在 `src` 目录，输出到 `lib` 目录）：

```bash
npx babel src --out-dir lib
```

这会读取 `src` 目录中的所有文件，应用 Babel 转换，并将结果输出到 `lib` 目录。

## Babel 相关库的作用

### @babel/core

Babel 的核心库，提供所有 Babel 转换的基础功能，主要负责三个方面：

- 解析：将源代码解析成抽象语法树（AST）。
- 转换：根据配置的插件或预设，对 AST 进行各种转换。
- 生成：将转换后的 AST 重新生成 JavaScript 代码。

### @babel/cli

Babel 的命令行接口（CLI），允许在终端中对文件或项目进行转换。常用功能包括：

- 转换文件：将 JSX 或其他现代 JavaScript 语法转换为浏览器兼容的代码。
- 监听模式：监听文件变化并自动进行转换。
- 输出管理：指定转换后的代码输出目录或文件。

```bash
npx babel src --out-dir lib
```

### @babel/preset-react

Babel 预设（preset）是插件的集合，`@babel/preset-react` 包含处理 React 代码所需的插件：

- JSX 转换：将 JSX 语法转换为 `React.createElement` 调用。
- Flow 语法支持（如果使用 Flow）：去除 Flow 类型注释，使代码可以在 JavaScript 环境中执行。

## 小结

| 库 | 职责 |
| --- | --- |
| `@babel/core` | 核心库：解析、转换、生成代码 |
| `@babel/cli` | 命令行工具：终端中执行文件转换、监听、输出管理 |
| `@babel/preset-react` | 预设：包含处理 React 与 JSX 代码所需的插件 |

- 这些库协同工作：cli 调用 core，core 按 preset-react 配置的插件完成 JSX → createElement 的转换，开发者因此可以放心使用 JSX 而浏览器端运行的始终是普通 JavaScript。
