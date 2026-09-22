# Glob 模式匹配

*类型：knowledge ｜ 难度：入门 ｜ 标签：Glob、通配符、gitignore、路径匹配*

**Glob 是文件路径的模式语法，广泛用于 .gitignore、打包工具、编辑器配置。最容易混淆也最关键的一点：`*` 不跨目录分隔符，`**` 才跨任意层目录；再配合「有无 `/` 前缀决定是否锚定根目录、有无 `/` 后缀决定是否只匹配目录」，就能读懂和写出绝大多数匹配规则。**

## 路径前缀规则

有无 `/` 前缀决定匹配范围是「任意位置」还是「锚定根目录」，有无 `/` 后缀决定是否只匹配目录。

| 模式 | 匹配范围 |
| --- | --- |
| `log` | 任意位置的 `log` 文件或目录 |
| `log/` | 任意位置的 `log` 目录（尾部 `/` 限定只匹配目录） |
| `/log` | 根目录下的 `log` 文件或目录（头部 `/` 锚定根目录） |
| `/log/` | 根目录下的 `log` 目录 |
| `log/sub` | 任意位置的 `log` 目录下的 `sub` 文件或目录 |
| `/log/sub` | 根目录直属 `log` 目录下的 `sub` 文件或目录 |

## 通配符

| 符号 | 含义 | 示例 | 匹配 | 不匹配 |
| --- | --- | --- | --- | --- |
| `*` | 任意数量字符，不跨路径分隔符 | `*.log` | `app.log` | `logs/app.log` |
| `?` | 任意单个字符 | `l?g` | `log`、`lag` | `lg`、`loag` |
| `[abc]` | 字符集合中的一个 | `l[ao]g` | `log`、`lag` | `lug` |
| `[a-z]` | 字符范围中的一个 | `l[a-z]g` | `log`、`lbg` | `l1g` |
| `[!abc]` | 不在字符集合中的一个 | `l[!ao]g` | `lug`、`lbg` | `log`、`lag` |
| `**` | 任意深度路径，可跨路径分隔符 | `**/*.js` | `a.js`、`src/a.js`、`src/b/a.js` | — |
| `{a,b}` | 多个模式中的一个（部分工具支持） | `*.{js,ts}` | `app.js`、`app.ts` | `app.css` |
| `!` | 否定，排除已匹配的项 | `!log` | — | `log` |

## `*` 与 `**` 的区别

这是最容易混淆的点：`*` 不跨目录，`**` 跨任意层目录。

```text
项目结构：
src/
  index.js
  utils/
    helper.js
    deep/
      tool.js
```

```text
src/*.js — 只匹配 src 直属的 .js 文件
匹配 src/index.js
不匹配 src/utils/helper.js
不匹配 src/utils/deep/tool.js

src/**/*.js — 匹配 src 下任意深度的 .js 文件
匹配 src/index.js
匹配 src/utils/helper.js
匹配 src/utils/deep/tool.js
```

### 双星号 `**` 的位置

```text
# 开头：匹配任意位置下的 .js 文件
**/*.js

# 中间：匹配 path 和目标文件之间任意深度的目录
path/**/file.txt    匹配 path/file.txt
                    匹配 path/a/file.txt
                    匹配 path/a/b/file.txt

# src 下任意深度的 .css 文件
src/**/*.css
```

## 否定模式 `!`

`!` 用于从已匹配的集合中排除特定项，但有一个重要限制：父目录被整体忽略后，无法用 `!` 恢复其中的子文件。

```text
# 正常用法：忽略所有 .log，但保留 important.log
*.log
!important.log      # 有效

# 无效用法：父目录已被忽略，子文件无法用 ! 恢复
logs/
!logs/important.log # 无效，logs/ 整个目录已被忽略
```

## `/dist/` 与 `/dist/*` 的区别

`/dist/` 忽略整个目录及其所有内容（递归）：

```text
/dist/            忽略
/dist/a.js        忽略
/dist/css/        忽略
/dist/css/x.css   忽略
```

`/dist/*` 仅忽略一级子项，不递归：

```text
/dist/a.js        忽略
/dist/img/        忽略（目录本身）
/dist/img/x.png   不忽略（需改用 /dist/** 才能递归）
```

忽略整个构建输出目录时，推荐使用 `/dist/`。

## 应用场景

### .gitignore

```text
# 日志（任意位置的 .log 文件，以及任意位置的 logs 目录）
*.log
logs/

# 依赖（任意位置的 node_modules 目录）
node_modules/

# 构建输出（锚定根目录，避免误匹配子项目的同名目录）
/dist/
/build/
/out/

# 环境变量（.env.local, .env.production 等所有变体）
.env.*

# IDE
.vscode/
.idea/
*.swp
.DS_Store

# 临时文件
*.tmp
tmp/
temp/

# 排除特定文件（不忽略 important.log，即使前面规则匹配了它）
!important.log
```

### VSCode settings.json

```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.git/**": true,
    "**/dist/**": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/*.js": { "when": "$(basename).ts" }
  }
}
```

`**/` 开头匹配任意位置，`/**` 结尾匹配目录内所有内容。

### ESLint 配置

```javascript
module.exports = {
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "**/vendor/*.js",        // 任意位置 vendor 目录下的直属 .js 文件
    "!important.config.js"   // 排除重要配置，不忽略
  ]
};
```

## 注意事项

- 路径分隔符统一使用 `/`，包括 Windows 环境。
- Unix 系统路径大小写敏感，Windows 不敏感，跨平台项目注意统一大小写。
- `**` 会遍历所有子目录，大型项目中注意性能影响。
- `{a,b}` 花括号扩展并非所有工具都支持（`.gitignore` 不支持，`glob` npm 包支持），使用前确认。
- 文件名含特殊字符（如空格、`[`、`]`）时需要转义或用引号包裹。
