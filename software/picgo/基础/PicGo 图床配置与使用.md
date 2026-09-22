# PicGo 图床配置与使用

*类型：practice ｜ 难度：入门 ｜ 标签：PicGo、图床、Gitee、Typora、Markdown*

**PicGo 是图床上传工具：建一个 Gitee 仓库当存储空间，生成私人令牌做鉴权，装 Gitee 图床插件并配置仓库与令牌，最后让 Typora 调用 PicGo 上传——之后在 Typora 里粘贴图片即自动转成外链，Markdown 笔记换机器也不丢图。**

## 准备

- 官网：[PicGo (molunerfinn.com)](https://molunerfinn.com/PicGo/)
- 下载地址：[Releases · Molunerfinn/PicGo (github.com)](https://github.com/Molunerfinn/picgo/releases)

## 配置流程

1. 建立 Gitee 仓库：新建一个公开仓库（如 `note_image`），作为图床的存储空间。
2. 生成私人令牌：进入 Gitee「设置 → 私人令牌」，生成新令牌，勾选 projects 权限。
3. 复制令牌：令牌只显示一次，立即复制保存，后面配置插件要用。
4. 下载图床插件：打开 PicGo 的「插件设置」，搜索 `gitee-uploader` 并安装（需 Node.js 环境）。
5. 找到对应插件：安装完成后在「图床设置」中会出现 Gitee 图床选项。
6. 配置图床仓库：填写仓库名（`用户名/仓库名`）、分支（一般 `master`）、令牌，保存。
7. 设为默认图床：将该图床设为默认，之后上传都走它。
8. 上传测试：在「上传区」拖入或粘贴一张图片，验证能生成 Gitee 外链。
9. 配置 Typora：在 Typora「偏好设置 → 图像」中选择「上传图片」，上传服务选 PicGo（app），并填入 PicGo 的上传接口路径，之后粘贴截图即自动上传并替换为外链。

## 注意事项

- 令牌等同账号凭证，不要提交进仓库或发给别人，泄露后到 Gitee 吊销重建。
- 仓库须为公开状态，否则生成的图片外链无法被访问。
- PicGo 的插件机制依赖 Node.js，安装插件报错时先检查 Node 环境。
