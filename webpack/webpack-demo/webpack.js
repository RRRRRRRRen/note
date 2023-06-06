const SyncHook = require("./node_modules/tapable/lib/SyncHook");
const Compilation = require("./webpackCompilation");

class Compiler {
  constructor(webpackOptions) {
    this.options = webpackOptions;
    this.hooks = {
      run: new SyncHook(),
      done: new SyncHook(),
    };
  }

  compile(callback) {
    const compilation = new Compilation(this.options);
    compilation.build(callback);
    // callback();
  }

  run(callBack) {
    // 广播编译开始事件
    this.hooks.run.call();

    // 完成编译的回调函数
    const onCompiled = () => {
      // 广播编译成功事件
      this.hooks.done.call();
    };

    // 执行编译
    this.compile(onCompiled);
  }
}

function webpack(webpackOptions) {
  // 创建实例
  const compiler = new Compiler(webpackOptions);

  // 运行插件，开启插件订阅
  const { plugins } = webpackOptions;
  for (const plugin of plugins) {
    plugin.apply(compiler);
  }

  // 返回实例
  return compiler;
}

module.exports = {
  webpack,
};
