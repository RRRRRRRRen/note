//将\替换成/
function toUnixPath(filePath) {
  return filePath.replace(/\\/g, "/");
}
const baseDir = toUnixPath(process.cwd());

class Compilation {
  constructor(webpackOptions) {
    this.options = webpackOptions;
    this.modules = [];
    this.chunks = [];
    this.assets = [];
    this.fileDependencies = [];
  }

  buildMoudle(name, moudulePath) {
    let sourceCode = fs.readFileSync(moudulePath, "utf-8");
    const moduleId = "./" + path.posix.relative(baseDir, modulePath);
    const module = {
      id: moduleId,
      names: [name],
      dependencies: [],
      _source: "",
    };
    const loaders =[]
    const rules = this.options.module.rules || [];
    rules.forEach((rule) => {
      if(moudulePath.match(rule.test)){
        loaders.push(...rule.use)
      }
    });
    sourceCode = loaders.reduceRight((source, loader) => {
      return loader(source);
    }, sourceCode);


    return module;
  }

  build(callback) {
    let entry = {};
    if (typeof this.options.entry === "string") {
      entry.main = this.options.entry;
    } else {
      entry = this.options.entry;
    }
    for (const entryName in entry) {
      const entryFilePath = path.posix.join(baseDir, entry[entryName]);
      this.fileDependencies.push(entryFilePath);
      const entryModule = this.buildMoudle(entryName, entryFilePath);
      this.modules.push(entryModule);
    }
    callback();
  }
}

module.exports = Compilation;
