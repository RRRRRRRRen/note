# Vite 配置

*类型：knowledge ｜ 难度：进阶 ｜ 标签：vue-vben-admin、Vite、构建工具、monorepo*

**Vite 是 Vben Admin 的构建工具，`vite.config.ts` 是其配置入口。该主题的源码笔记暂为空，本篇从项目结构角度梳理 Vite 配置在 vben 中的定位：它向下对接 vite 本身的 server/build/plugin 能力，向上串联 UnoCSS、turbo 任务、环境变量等周边体系。**

## Vite 在 Vben Admin 中的定位

Vite 是利用浏览器原生 ES 模块支持提供快速开发和构建体验的现代化前端构建工具：

- 开发阶段：基于原生 ESM 按需编译，启动快、HMR 快。
- 构建阶段：`vite build` 基于 Rollup 生成生产环境代码。
- 配置入口：项目根目录的 `vite.config.ts`，使用 TypeScript 编写可获得类型提示。

在 vben 的项目结构中，与 Vite 配置直接相关的文件：

- `vite.config.ts`：构建工具配置，指定插件和优化选项。
- `turbo.json`：monorepo 任务运行器配置，与 Vite 的 build/dev 脚本协同。
- `.env.development`、`.env.production`、`.env.test` 等：各环境变量文件，Vite 按 mode 加载。
- `uno.config.ts`：UnoCSS 原子化 CSS 的配置，作为 Vite 插件接入。

## vite.config.ts 的典型结构

Vben 这类企业级项目的 Vite 配置通常包含以下模块（学习时可对照源码逐个验证）：

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // 插件：Vue 支持、组件自动注册、UnoCSS 等都在这里挂载
  plugins: [vue()],
  // 开发服务器：代理后端接口，避免跨域
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  // 路径别名：与 tsconfig.json 的 paths 保持一致
  resolve: {
    alias: {
      '/@': new URL('./src', import.meta.url).pathname,
    },
  },
  // 构建优化：分包、产物目录等
  build: {
    outDir: 'dist',
  },
});
```

- `plugins`：Vite 生态的核心扩展点，vben 大量依赖插件实现自动导入、样式注入、压缩等能力。
- `server.proxy`：前后端分离项目的标准配置，开发环境将接口请求转发到后端服务。
- `resolve.alias`：路径别名需要与 tsconfig.json 的 `paths` 同步配置，否则编辑器能识别但构建失败（或相反）。
- `build`：控制产物输出、分包策略、压缩行为。

## 与环境变量的配合

Vite 通过 mode 机制加载环境变量文件，脚本中的 `--mode analyze`、`--mode test` 就是在切换加载哪份 `.env.*`：

- 只有以 `VITE_` 开头的变量会暴露给客户端代码，通过 `import.meta.env.VITE_XXX` 访问。
- 代码中 `createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH)` 就是典型用法：部署基础路径由环境变量注入。

## 学习建议

- 先读 `vite.config.ts` 主文件，理清插件清单，每个插件单独查文档。
- 路径别名、代理、环境变量是最先会用到的三块，优先掌握。
- turbo 与 Vite 的关系：turbo 管 monorepo 中「哪个包先执行哪个任务」，Vite 管「单个应用如何构建」，职责不同、互不替代。
