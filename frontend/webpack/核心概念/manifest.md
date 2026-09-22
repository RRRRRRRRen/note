# manifest

*类型：knowledge ｜ 难度：进阶 ｜ 标签：webpack、runtime、manifest、模块加载*

**webpack 构建的典型应用由三种代码组成：你编写的源码、源码依赖的第三方 library 或 vendor 代码，以及管理所有模块交互的 webpack runtime 和 manifest。** 打包、压缩、延迟加载拆分之后，`/src` 目录的文件结构已不复存在——runtime 通过 manifest 里保存的模块标识符映射，才知道每个 `__webpack_require__` 调用背后要加载哪个模块。

## runtime 是什么

runtime，以及伴随的 manifest 数据，主要指：在浏览器运行过程中，webpack 用来连接模块化应用程序所需的所有代码。它包含模块交互时连接模块所需的加载和解析逻辑：

- 已经加载到浏览器中的模块的连接逻辑。
- 尚未加载的模块的延迟加载逻辑。

## manifest 是什么

一旦应用在浏览器中以 `index.html` 文件的形式被打开，一些 bundle 和应用需要的各种资源都需要用某种方式被加载与链接起来。经过打包、压缩、为延迟加载而拆分为细小的 chunk 这些优化之后，你精心安排的 `/src` 目录的文件结构都已经不再存在——webpack 如何管理所有所需模块之间的交互？这就是 manifest 数据的用途。

当 compiler 开始执行、解析和映射应用程序时，它会保留所有模块的详细要点，这个数据集合称为 **manifest**：

- 打包发送到浏览器后，runtime 通过 manifest 来解析和加载模块。
- 无论使用哪种模块语法，`import` 或 `require` 语句都会转换为 `__webpack_require__` 方法，此方法指向模块标识符（module identifier）。
- runtime 借助 manifest 中的数据检索这些标识符，找出每个标识符背后对应的模块。
