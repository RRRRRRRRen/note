# SEO 优化手段

*类型：knowledge ｜ 难度：入门 ｜ 标签：SEO、浏览器、HTML、爬虫*

**SEO 的核心是让爬虫「看得懂、抓得到、信得过」：结构上用语义化标签和层级化标题建立页面骨架，元信息上打磨 TDK（Title 60 字符内、Description 155 字符内、Keywords 3-5 个），URL 保持扁平短小用连字符分词，技术上靠 sitemap、robots.txt、结构化数据和 HTTPS 建立信任。性能也是排名因素——压缩资源、启用缓存与 CDN、延迟加载非关键内容都直接影响抓取与排名。**

## 网页结构

- 使用语义化标签：`<header>`、`<nav>`、`<main>`、`<article>`、`<section>`、`<aside>`、`<footer>`
- 使用 `<h1>`-`<h6>` 建立内容层级
- 网页层级不超过 3 层，保持扁平化 URL 结构

## TDK 优化

- `Title`：简洁明了，包含关键词，60 字符以内
- `Description`：准确描述页面内容，155 字符以内
- `Keywords`：选择相关性强的关键词，3-5 个为宜

## 性能优化

- 压缩 HTML、CSS、JS，优化图片（使用 WebP）
- 合并文件，减少 HTTP 请求，启用 HTTP/2
- 使用浏览器缓存、Gzip 压缩、CDN 加速
- 延迟加载非关键资源

## URL 优化

- 使用简短、描述性的 URL
- 用连字符（`-`）分隔单词
- 避免特殊字符和中文，使用小写字母

## 技术优化

- 提交 XML 格式的 sitemap
- 配置 `robots.txt` 指导爬虫抓取规则
- 使用 Schema.org 结构化数据
- 使用响应式设计，优化移动端体验
- 使用 HTTPS（搜索引擎优先索引 HTTPS 网站）
