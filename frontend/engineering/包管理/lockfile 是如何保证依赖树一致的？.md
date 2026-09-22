# lockfile 是如何保证依赖树一致的？

*类型：knowledge ｜ 难度：进阶 ｜ 标签：lockfile、npm、pnpm、依赖解析 ｜ 更新：2026-09-09*

**lockfile 把解析函数在某一刻的完整输出固化成文件：每个包的精确版本、下载完整性哈希（integrity）、以及整棵依赖关系图。有了它，之后任何人在任何机器上安装都跳过解析，直接按坐标下载、逐包校验哈希、原样落盘；再配合只读安装模式（`npm ci` / `pnpm install --frozen-lockfile` / `yarn --immutable`），锁文件成为唯一事实源——这就是「人人同树」的完整机制。**

> **前置：** 本篇解决《为什么各机器装出来的依赖会不一样？》的病根三：区间乘以时间等于漂移——解药是把「解析」从每次安装都重来，变成只做一次、记录下来、永久复用。

## 解析为什么必须被记录

安装的第一步是解析：把 `^1.2.3` 这样的区间翻译成一个精确版本。这一步必须查询 registry——「区间里有哪些候选、最新的是谁」这个问题只有 registry 能回答，而 registry 是活的：每天都有新版本发布。于是解析函数有三个输入：package.json 里的区间（人写的意图）、registry 的当前状态（随时间漂移的事实）、以及解析设置。前两个输入的代码被提交进仓库，第三个输入却只存在于「执行那一刻」——不记录下来，每次安装都是重新掷骰子。

lockfile 的本职就是**把解析的输出连同输入一起存档**。区间的含义从此分层：`package.json` 说「我要 1.x 的兼容范围」，`lockfile` 说「本仓库事实上用的是 1.9.0，其内容哈希是 sha512-…」。一个是意图，一个是事实——事实一经记录，就不再随 registry 漂移。一个熟悉的技术参照：拉镜像时按 `tag` 还是按 `digest`——tag 是区间，会漂移；digest 是精确内容，永不漂移。lockfile 就是依赖世界的 digest 清单。

```text
三段机制 / resolve → lock → materialize

  [package.json]          [registry]
  区间（意图）      ─┐      此刻状态 ──┐
                    │      （会漂移）   │ 查询
                    ▼                 │（虚线）
                 [解析] ◀──────────────┘
              只发生一次
                    │ 存档
                    ▼
              [lockfile]
          精确版本 + integrity
                    │ 只读复用
                    ▼
               [物化]
            node_modules
```

图里唯一要紧的箭头标注是「只发生一次」：解析只应发生在**有意变更依赖**的时刻（add / update），其余一切安装都从 lockfile 这一站直接出发。什么情况下这条纪律会被打破、破了会长什么样，是下一篇的主题。

## lockfile 里到底记了什么

各家锁文件格式不同（npm 的 `package-lock.json`、pnpm 的 `pnpm-lock.yaml`、yarn 的 `yarn.lock`），但记录的信息高度一致。以下是一个最小项目 `pnpm add ms@2.1.3` 之后的真实锁文件片段（pnpm 10.34.5 实测）：

```yaml
# pnpm-lock.yaml（实测片段）
lockfileVersion: '9.0'

importers:            # 本项目（importer）声明的意图与解析结果
  .:
    dependencies:
      ms:
        specifier: 2.1.3        # 意图：package.json 里的版本声明
        version: 2.1.3          # 事实：解析到的精确版本

packages:             # 每个包的坐标与内容哈希
  ms@2.1.3:
    resolution: {integrity: sha512-6FlzubTLZG3J2...}

snapshots:            # 依赖关系图：每个包依赖谁（同版本号关联）
  ms@2.1.3: {}
```

三个区块各司其职：`importers` 同时保留意图（specifier）和事实（version），这份「对照表」正是包管理器检测「package.json 与 lockfile 是否脱节」的依据；`packages` 记录精确坐标和 `integrity` 哈希；`snapshots` 记录整棵依赖图。下载阶段的完整性校验就发生在 integrity 字段上：每个 tarball 下载后先算哈希再落盘，字节对不上立即报错——这既是供应链防篡改，也是「拿到不同字节」这类静默差异的天敌。

> **警告：integrity 对不上不是故障，是护栏。** 使用镜像源时若镜像同步滞后，可能出现「按坐标找不到该版本」或「哈希对不上」的报错。这是校验机制在正确工作——它拒绝用内容不同的包顶替已记录的事实。修法是统一并更新镜像源，而不是关掉校验。

## 只读安装：三大管理器的同一件事

lockfile 要兑现「人人同树」，还差最后一块拼图：安装过程必须**只读消费**它，而不是「顺手更新」它。三大管理器都有对应的严格模式，语义一致——只按 lockfile 装；lockfile 与 package.json 对不上时直接报错，绝不静默重解析。

| 严格安装对照 / strict install | 命令 | 行为特点 |
| --- | --- | --- |
| npm | npm ci | 先删除现有 node_modules 再按 lockfile 全新安装——天然杜绝增量赃状态 |
| pnpm | pnpm install --frozen-lockfile | 检测到 CI 环境（CI=true）时默认开启；本仓库实测：脱节时报 ERR_PNPM_OUTDATED_LOCKFILE 并指出不匹配项 |
| yarn | yarn install --immutable | lockfile 需要变更时失败，--immutable-cache 进一步连缓存一起只读 |

版本沿革：

```text
严格安装的来历 / history

  npm 5（2017）     内置 package-lock.json，npm 正面跟进 yarn 带来的 lockfile 范式
  npm 5.7.0（2018） 引入 npm ci——为 CI 提供先清场、只读安装的标准动作
  pnpm 9+（2024）   lockfileVersion 9.0（本仓库在用的格式）；pnpm 大版本迁移常伴随锁文件格式升级
```

注：来源为 npm 官方博客与 pnpm 发布说明。大版本升级后的首次 install 必然整本重写锁文件，属于一次性成本。

CI 安装命令正误对照：

```bash
# 反例：CI 流水线里
npm install
# lockfile 对不上时静默重解析，
# 每次构建可能拿到不同的树
```

问题：CI 是全新环境，本该是最可复现的地方——宽松安装反而让它变成随机源。

```bash
# 正例：CI 流水线里
npm ci          # 或 pnpm install --frozen-lockfile
# 只按 lockfile 装，
# 对不上立即失败
```

说明：「对不上就红」正是想要的：脱节必须在合并前被发现。

- 记忆卡：**区间是意图，lockfile 是事实**——package.json 声明兼容范围，lockfile 记录事实上解析到了哪个版本、内容哈希是什么、依赖关系如何。所有安装从「事实」出发，而不是重新解释「意图」。
- 记忆卡：**严格模式 = 只读消费**——npm ci / --frozen-lockfile / --immutable 的共同语义：lockfile 对不上就报错，绝不静默重解析。CI 环境默认严格（pnpm 实测报错文案里明说）。

## 经典追问链

有无 lockfile 的正误对照：

```js
// 反例：只有 package.json 的范围声明，没有锁文件
"react": "^19.0.0"
```

问题：每台机器各自解析到不同 patch 版本，「我这里好的」开始了。

```yaml
# 正例：pnpm-lock.yaml：范围被物化成唯一答案
react@19.2.8:
  resolution: {integrity: sha512-...}
```

说明：精确版本 + 完整性哈希，安装结果可复现。

## 追问链

**lockfile 和 package.json 各自的角色是什么？为什么两个都要？**（热身题——两者职责混为一谈的人，后面所有脱节问题都诊断不了。）

- package.json 是人写的意图声明：要哪些依赖、接受什么兼容范围，还要承担脚本、元数据等职责；lockfile 是机器写的解析档案：精确版本、integrity 哈希、完整依赖图。前者用于「声明变更意图」，后者用于「复现解析结果」。删掉任何一个，系统都退回「每次重新解析」的不确定状态。
- 延伸：两者像代码与编译产物的关系——你不会把 .o 文件当源码改，也不该手改 lockfile。

**integrity 校验失败会发生什么？为什么说这不是坏事？**（考对完整性机制的信任边界——能区分「护栏生效」与「环境故障」的人，遇到镜像源问题才不会病急乱投医。）

- 下载的字节算出的哈希与 lockfile 记录不一致，安装立即失败——这发生在任何代码执行之前。它不是故障而是护栏在正确工作：要么 registry 的内容被改动了（供应链攻击的典型信号），要么镜像源同步滞后导致拿到了不同字节。正确处置是核实来源、统一镜像，而不是删除 lockfile 重新生成——后者恰恰把「事实档案」销毁了。
- 延伸：这也是 lockfile 必须入库的原因之一：不信任「重新解析」，才能信任「每次下载的字节一致」。

**为什么 CI 必须用 npm ci / --frozen-lockfile，本地却可以偶尔宽松？**（考「严格」的适用边界——理解了这一点，才不会把「本地能跑」当成 CI 该有的标准。）

- CI 是全新环境，唯一的价值就是可复现与守门：按 lockfile 装不上、对不上，说明仓库当前状态有问题，必须当场红掉。本地开发面对的是「人正在有意变更依赖」的场景，宽松安装是 add/update 的工作方式；但普通 install 也会静默补账，所以本地日常同样建议严格模式，只在有意变更时放宽。
- 延伸：pnpm 检测到 CI=true 时 frozen-lockfile 自动为真——它的报错文案会明说这一点。

**版本区间在 lockfile 里还留着吗？留它做什么？**（压轴题，考 specifier 字段的存在意义——能答出「脱节检测」的人，读 lockfile diff 就有了抓手。）

- 留着。pnpm 的 importers 区块里，每个依赖同时记录 specifier（package.json 里的声明）和 version（解析结果）。安装时把两者对照：对不上说明有人改了 package.json 而没同步 lockfile——脱节检测的依据正是这份对照表；frozen 模式报错时也会明确列出「lockfile: 2.1.3, manifest: ^2.0.0」这样的不匹配项。
- 延伸：所以 review 别人的 PR 时，lockfile diff 里 specifier 行的变化值得重点看——它对应的是 package.json 的改动。

## 延伸阅读

- 《为什么各机器装出来的依赖会不一样？》——三个自由度与五层钉死的全景。
- 《为什么没人动 lockfile，它却自己变了？》——机制知道了，接下来是行为：add 和 install 到底什么时候写 lockfile，「补账」是怎么回事。
- 《git 为什么不存 diff：内容寻址怎么做的？》——integrity 哈希与 Git 对象库是同一个思想：以内容 hash 作为唯一坐标。
