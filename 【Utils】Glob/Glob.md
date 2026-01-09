# Glob 使用指南

Glob 是一种用于匹配文件路径的模式语法，广泛应用于各种开发工具中，如文件查找、打包工具、版本控制等。

## 目录
- [Glob 使用指南](#glob-使用指南)
  - [目录](#目录)
  - [基础匹配模式](#基础匹配模式)
    - [一级匹配](#一级匹配)
    - [多级匹配](#多级匹配)
  - [通配符](#通配符)
  - [特殊模式](#特殊模式)
  - [实际应用场景](#实际应用场景)
    - [Gitignore 文件](#gitignore-文件)
    - [构建工具](#构建工具)
    - [文件查找工具](#文件查找工具)
    - [IDE 配置](#ide-配置)
  - [常见模式详解](#常见模式详解)
  - [注意事项](#注意事项)

## 基础匹配模式

### 一级匹配

```gitignore
# 匹配：
#    1. 所有名为 log 的目录
#    2. 所有名为 log 的文件
log

# 匹配：
#    1. 所有名为 log 的目录
log/

# 匹配：
#    1. 根目录下 所有名为 log 的目录
#    2. 根目录下 所有名为 log 的文件
/log

# 匹配：
#    1. 根目录下 所有名为 log 的目录
/log/
```

### 多级匹配

```gitignore
# 匹配：
#    1. 所有 log 目录下，名为 sub 的目录
#    2. 所有 log 目录下，名为 sub 的文件
log/sub

# 匹配：
#    1. 所有 log 目录下，名为 sub 的目录
log/sub/

# 匹配：
#    1. 根目录的直属目录 log 下，所有名为 sub 的目录
#    2. 根目录的直属目录 log 下，所有名为 sub 的文件
/log/sub

# 匹配：
#    1. 根目录的直属目录 log 下，所有名为 sub 的目录
/log/sub/
```

## 通配符

```gitignore
# 匹配：
#    1. * 可以是 任意数量包括零个 字符或空格
*.log

# 匹配：
#    1. ? 可以是 任意一个 字符或空格
l?g

# 匹配：
#    1. [abc] 只能是 abc 中的一个
l[abc]g

# 匹配：
#    1. [a-z] 只能是 a到z 中的一个字符
l[a-z]g


# 匹配：
#    1. 排除 log 文件或目录
!log

# 匹配：
#    1. [!abc] 不能是 abc 中的一个
l[!abc]g
```

## 特殊模式

### 双星号模式

```gitignore
# 匹配任意深度的目录
**/*.js           # 匹配任意深度的 js 文件

# 匹配特定目录下的任意深度文件
src/**/*.css     # 匹配 src 目录下任意深度的 css 文件

# 匹配任意路径
path/**/file.txt  # 匹配 path/file.txt, path/sub/file.txt, path/sub/deep/file.txt 等
```

## 实际应用场景

### Gitignore 文件

`.gitignore` 文件使用 Glob 模式来指定 Git 应该忽略的文件和目录：

```
# 忽略所有 .log 文件
*.log

# 忽略 node_modules 目录
node_modules/

# 忽略根目录下的 config.json
/config.json

# 忽略所有 dist 目录及内容
**/dist/

# 忽略特定路径下的缓存
cache/

# 忽略编辑器配置
.vscode/
.idea/

# 排除某些特定文件
!important.log
```

### 构建工具

在构建工具中，Glob 模式用于指定需要处理或排除的文件：

#### Webpack 配置
```javascript
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,  // 排除 node_modules 目录
        use: 'babel-loader'
      }
    ]
  }
};
```

#### Vite 配置
```javascript
export default {
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        nested: './nested/index.html'
      },
      external: ['some-external-lib'],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  }
}
```

### 文件查找工具

在文件查找工具中，Glob 模式用于搜索特定模式的文件：

#### 命令行工具
```bash
# 使用 find 命令查找所有 .js 文件
find . -name "*.js"

# 使用 fd 命令查找特定文件
fd "*.test.js"        # 查找所有测试文件

# 使用 ripgrep 查找特定内容
rg -F "**/*.js"      # 在特定模式的文件中搜索
```

### IDE 配置

在 IDE 配置文件中使用 Glob 模式来指定需要忽略的文件：

#### VSCode settings.json
```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/bower_components/**": true,
    "**/.git/**": true,
    "**/dist/**": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/*.js": {"when": "$(basename).ts"},
    "**/dist": true
  }
}
```

#### ESLint 配置
```javascript
module.exports = {
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "**/vendor/*.js",
    "!important.config.js"  // 排除重要配置文件
  ],
  extends: ["eslint:recommended"],
  env: {
    node: true
  }
};
```

## 常见模式详解

### `/dist/*` 和 `/dist/` 的区别

#### `/dist/`

**匹配**

- 忽略的是：`dist` 目录及其 **全部内容**（包括子目录、文件）。
- 等价于："忽略整个目录，不管里面有什么"。

**示例**

```
/dist/          ✅ 忽略 dist/
    /dist/a.js    ✅ 忽略
    /dist/css/    ✅ 忽略
    /dist/css/x.css ✅ 忽略
```

> 推荐用这个来忽略整个构建输出目录，如 `build/`, `dist/`, `out/`

#### `/dist/*`

- 忽略的是：`dist` 目录下的 **所有文件和一级子目录**，但**不递归**。
- `dist` 本身必须存在且不被忽略。
- 可能会**保留子目录中的子文件**，除非手动加规则。

✅ 示例匹配：

```
/dist/a.js      ✅ 忽略
    /dist/img/      ✅ 忽略 img/ 这个子目录本身
    /dist/img/x.png 🚫 不忽略（除非你加了 /dist/**）
```

### 常见构建工具模式

```
# Node.js 项目
node_modules/
npm-debug.log*
.nyc_output/
coverage/
.nyc_output/

# 构建输出
/dist/
/build/
/out/
/public/bundle.js

# 环境变量
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# 日志
logs/
*.log

# 临时文件
*.tmp
*.temp
tmp/
temp/
```

## 注意事项

1. **路径分隔符**: 在不同操作系统中，Glob 模式通常使用正斜杠 `/` 作为路径分隔符，即使在 Windows 上也是如此。

2. **大小写敏感性**: 在 Unix 系统中，路径通常是大小写敏感的；在 Windows 中则不敏感。这可能会影响匹配结果。

3. **转义特殊字符**: 如果文件名包含特殊字符，可能需要进行转义。

4. **性能考虑**: 使用双星号 `**` 可能会导致性能下降，因为它需要遍历所有子目录。

5. **相对路径 vs 绝对路径**: 确保理解工具如何解释相对路径和绝对路径。

6. **否定模式**: 使用 `!` 排除模式时，确保它在正确的上下文中使用（如在 `.gitignore` 中，否定模式只会影响前面的模式）。