# CSS 布局系统

---

## 布局选型：Flex 还是 Grid

*难度：进阶 ｜ 标签：Flexbox、Grid、布局、CSS*

**内容沿一个方向排 → Flex；需要同时约束行和列 → Grid。Grid 先定网格再放内容（layout-out），Flex 先有内容再分配空间（content-out）——两种相反的布局哲学。拿不准时记住经验法则：组件内部的一维排列用 Flex，页面骨架与二维网格用 Grid；嵌套组合（外 Grid 内 Flex）是常态而非妥协。两个引擎共有的第一坑是自动最小尺寸：Flex 解法 `min-w-0`，Grid 解法 `minmax(0, 1fr)`。**

### 两种布局哲学：content-out vs layout-out

Flexbox 是**一维**布局：项目沿一条主轴排布，`flex-wrap` 虽然能换行，但换出的每一行都是一条**独立主轴**——行与行之间如何对齐、列是否要跨行看齐，Flex 一概不管。Grid 是**二维**布局：先用 `grid-template` 把行列轨道定死，再把内容放进格子里，行列天然构成体系。

这决定了两者完全相反的工作顺序：Flex 是 content-out——先有内容，再看空间怎么分；Grid 是 layout-out——先有网格，再决定内容放哪。理解这一点，「为什么 Grid 做页面骨架更舒服、Flex 做组件内部更顺手」就不言自明了。

| Flex = 一维流（content-out） | Grid = 二维网格（layout-out） |
| --- | --- |
| 先有内容，再沿主轴分配空间 | 先定行列轨道，内容填进格子 |
| 只管一条轴：wrap 后每行独立，行间关系不归它管 | 行列同时约束：跨行跨列、行间对齐成体系 |
| 项目尺寸驱动布局（flex-basis 以内容为基准） | 轨道驱动布局（grid-template 先行） |
| 适合：组件内部、工具条、导航栏、表单行 | 适合：页面骨架、卡片网格、需要行间看齐的场景 |

```text
┌─ 拿不准时的经验法则 ──────────────────┐
│ 组件内部一维排列            → Flex    │
│ 页面骨架、卡片网格、跨行对齐 → Grid   │
│ 两者都要 → 外 Grid 定骨架、内 Flex    │
└──────────────────────────────────────┘
```

- 选型不是二选一，是分工：外 Grid 定骨架、内 Flex 排细节是常态而非妥协。

### Flex 深拆：弹性三件套的分配算法

`flex-grow / flex-shrink / flex-basis` 三件套的默认值是 `0 1 auto`——只缩不涨。真正决定布局的是浏览器内部的分配顺序：先定基准，再算剩余，最后按弹性分派。

```text
① 定基准 basis（auto = 内容尺寸）
② 算剩余空间（容器 − Σbasis）
③ 正剩余 → grow（按 grow 比例分）
④ 负剩余 → shrink（shrink × basis 加权）
⑤ min/max 夹逼（触边冻结，二次分配）
```

关键在第四步：**收缩不是等比压缩**。每项承担的收缩量 = 溢出量 × (shrink × basis) ÷ 权重和——shrink 是缩放意愿，basis 是加权基数。这道公式的完整推导、逐项账本与 min/max 夹逼-冻结迭代，见下方「Flex 深拆：加权收缩与自动最小尺寸」专题。

收缩失灵还有一道更隐蔽的闸门：flex 子项默认 `min-width: auto` 的**自动最小尺寸**——子项拒绝收缩到自身 min-content 以下（图片这类替换元素则是固有尺寸），长内容直接把容器撑爆、shrink 看似失效。协议细节与 `min-w-0` 解法链同样收进下方专题。

顺带把最容易混的两个缩写掰开：`flex: 1` 是 `1 1 0%`——基准归零、纯按 grow 比例分，内容宽度完全不影响结果；`flex: auto` 是 `1 1 auto`——先按内容分，剩余再均分。等宽卡片、工具条用前者；内容自适应、不想忽略内容差异时用后者。

**反例：等宽分派用 flex:auto**

```css
.card { flex: auto; }
/* 三张卡片内容长短不一 */
/* → 宽度跟着内容走，参差不齐 */
```

`flex:auto` 以内容为基准：内容差异直接写进宽度，等宽场景翻车。

**正例：等宽分派用 flex:1**

```css
.card { flex: 1; }
/* = flex: 1 1 0% */
/* → basis 归零，纯按比例等分 */
```

`flex:1` 忽略内容宽度，剩余空间纯按 grow 比例分配。

### Grid 深拆：轨道、fr 与命名区域

`grid-template-columns` 定义**显式轨道**；塞不进显式轨道的项目会掉进**隐式行/列**（由 `grid-auto-rows` 等控制尺寸）。fr 的准确语义不是「等分单位」，而是「**剩余空间分配比例**」：浏览器先满足非弹性部分（px、auto、内容约束），剩余空间才按 fr 比例分。所以 `200px 1fr 1fr` 是「先扣 200px，余下对半」，而不是三等分。

fr 最大的红利是与 `repeat`、`minmax` 组合出**零媒体查询**的响应式网格——auto-fill 与 auto-fit 的精确差异（空轨道保留还是塌缩）见下方专题章节。另一个杀手锏是 `grid-template-areas`：用带名字的字符串直接画出页面骨架，圣杯布局一行搞定，Flex 要嵌套三层才能做到。

```css
/* 经典圣杯布局：网格区域即图纸 */
.page {
  display: grid;
  grid-template:
    "header header" auto
    "aside  main" 1fr
    "footer footer" auto
    / 220px 1fr;
}
```

### Grid 的同款坑：1fr 也会溢出

Flex 有 min-width:auto，Grid 有一模一样的孪生问题：`1fr` 轨道的默认最小尺寸是 `auto`，即**轨道内所有项目 min-content 的最大值**。往格子里塞一个长单词或宽表格，轨道被撑破，`repeat(3, 1fr)` 的「等分」瞬间失效——而且和 Flex 一样，页面不报错，只是布局悄悄走样。

解法与 Flex 同源（它们本来就是同一套自动最小尺寸协议的两副面孔）：把 fr 的隐形下限显式钉到 0——`minmax(0, 1fr)`；或者给子项加 `min-w-0`。分栏布局（如「侧栏 + 内容区」）几乎永远应该写 `minmax(0, 1fr)` 而不是裸 `1fr`，这是 Grid 时代的肌肉记忆。

**反例：裸 1fr 分栏**

```css
.layout {
  display: grid;
  grid-template-columns: 220px 1fr;
}
/* 内容区出现长 URL → 轨道被撑破 */
```

裸 1fr 的最小尺寸是 auto：内容一长，轨道不再等分。

**正例：minmax(0, 1fr) 分栏**

```css
.layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
}
/* 下限钉到 0，等分不再受内容要挟 */
```

`minmax(0, 1fr)` 与 Flex 的 `min-w-0` 异曲同工，分栏场景的默认写法。

```text
┌─ 同源陷阱：自动最小尺寸 ─────────────────────────────┐
│ Flex 的 min-w-0 与 Grid 的 minmax(0, 1fr)            │
│ 是同一个问题的两副面孔：子项/轨道默认拒绝收缩到内容   │
│ 以下。任何收缩或等分失效，先怀疑隐形下限，解法都是    │
│ 显式把下限钉到 0。                                    │
└──────────────────────────────────────────────────────┘
```

### 对齐体系：同一属性，两套语义

Flex 只有两条轴：`justify-*` 管**主轴**、`align-*` 管**交叉轴**（换 `writing-mode` 或 `flex-direction` 会换轴，属性名不变语义变）。Grid 则是行列各一套、每套三层：`-content` 管**轨道组与容器之间**、`-items` 管**项目在格子内**、`-self` 单项覆盖——共 3×2 个属性，粒度细得多。

最常见的困惑正是层次错位：Grid 里写了 `justify-content: center` 项目却没在格子里居中——因为它居中的是「整组轨道」，项目在轨道内的对齐要用 `justify-items` / `justify-self`。间距同理：格点系统里永远优先 `gap`——它不参与项目尺寸计算、不产生首尾多余间距；`margin` 留给单项偏移和 auto 吸收剩余空间（如导航栏右贴：`margin-left: auto`）。

| Flex：两轴两族 | Grid：两轴三层 |
| --- | --- |
| `justify-*` 沿主轴、`align-*` 沿交叉轴 | `-content`：轨道组 vs 容器（分布整组轨道） |
| `-content` 分配轴上的剩余/溢出空间（多行时 align-content 才生效） | `-items`：项目在格子内的默认对齐 |
| `align-items` / `align-self` 管交叉轴上的项目对齐 | `-self`：单个项目覆盖 |
| 主轴/交叉轴随 flex-direction 变化（column 时主轴即块方向），属性名不变 | `justify-*` 沿行内轴、`align-*` 沿块轴，固定不变，行列各一套 |

**反例：对齐层次错位**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 160px);
  justify-content: center; /* 想让项目在格子里居中 */
}
/* 动的是整组轨道，项目纹丝不动 */
```

`justify-content` 面向轨道组与容器之间的空间，管不着项目在格子内的位置。

**正例：用 justify-items 对齐格子内项目**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 160px);
  justify-items: center; /* 每个项目在自己格子内居中 */
}
```

`-items` / `-self` 才管格子内的项目对齐；`-content` 永远面向轨道组。

### 经典场景与选型决策

把前面所有机制收拢成一棵决策树，日常选型基本可以在十秒内完成——记住「外 Grid 内 Flex」的组合才是常态：

```text
需要同时约束行和列吗？
 ├─ 要（二维约束）→ 页面骨架 / 卡片网格 / 跨行对齐 → Grid
 └─ 不要（一维流）→ 组件内一维排列（工具条/导航/表单行）→ Flex

两条分支最终通常汇合 → 外 Grid 定骨架，内 Flex 排细节
```

典型场景逐个过一遍：**导航栏、工具条**是一维流，Flex 最顺手，右侧菜单用 `margin-left: auto` 一行解决；**卡片流**数量不定又要换行对齐，auto-fill + minmax 零断点搞定；**页面骨架**（头/侧栏/主体/脚）行列同时约束，grid-template-areas 一图胜千言；**表单行**（label + input）一维排布，Flex；**sticky footer** 用 Grid 的 `auto 1fr auto` 三行轨道，中段自动撑满。场景对上了，写法基本是唯一的：

```css
/* 导航栏：一维流，右侧菜单 auto margin 顶到最右 */
.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}
.nav .spacer { margin-left: auto; }

/* 卡片流：数量不定、自动换行、零断点 */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

/* sticky footer：三行轨道，中段自动撑满 */
.page {
  display: grid;
  min-height: 100vh;
  grid-template-rows: auto 1fr auto;
}
```

### 追问链

**flex-basis 和 width 到底谁说了算？column 方向呢？**

*考察点：basis 的本质是主轴尺寸，不是「优先级更高的 width」。*

basis 是「主轴方向的基准尺寸」，width 只是横坐标的属性名。`flex-direction: row` 时 basis 覆盖 width（basis 为 auto 才回落到 width）；column 时 basis 管的是 height，width 退居交叉轴。所以「basis 优先于 width」的背法只在 row 方向成立——本质是 basis 永远描述主轴，换方向它就换属性。

**延伸：** 完整的尺寸决定链：min/max 始终最外层夹逼；内层是 basis（auto 时依次回落到 width/height、再回落到 content）。

**flex:1 和 flex:auto 都是 grow/shrink 全开，差在哪？等宽卡片该用哪个？**

*考察点：三件套缩写的精确展开——背过「flex:1 等分」的人，多半说不出 auto 分支的基准语义。*

flex:1 展开是 `1 1 0%`——基准归零，空间纯按 grow 比例分，内容宽度完全不参与结果；flex:auto 是 `1 1 auto`——先按各自内容的基准分，剩余空间再均分。等宽卡片、工具条要「无视内容差异」用 flex:1；想让内容长短保留进宽度的自适应项用 flex:auto。

**延伸：** flex:1 的项 basis 为 0，收缩权重 shrink × basis 也是 0——它从不参与收缩分摊，容器超载时被挤压的是它的邻居。

**flex-wrap 换行之后，行与行之间的对齐和间距归谁管？**

*考察点：「一维」二字的落地：wrap 出的多行到底是不是网格、能不能跨行看齐。*

归 align-content——但只在容器真的换行出多条 flex line 时才生效，单行容器里它是无效属性。行内分布用 justify-content、行间分布用 align-content。wrap 后的每一行都是独立主轴，项目在不同行之间如何跨行看齐 Flex 一概不管——需要这种二维关系，就该换 Grid。

**延伸：** 常见的坑：容器高度富余时给单行 flex 写 `align-content: center` 毫无反应——先确认是否真的多行，单行内对齐用 align-items。

**margin:auto 为什么在 Flex 里能居中，在普通 block 布局里不行？**

*考察点：「auto margin = 吸收剩余空间」这个分配本质。*

margin 上的 auto 语义是「把该方向的剩余空间分给我」。普通 block 布局垂直方向没有「分配剩余空间」这个动作（块从上往下流），auto 退化为 0；Flex/Grid 是分配式布局，剩余空间先被 auto margin 吃掉，剩下的才轮到 justify-content——所以 auto margin 的优先级高于对齐属性。导航栏「右侧菜单」的 `margin-left: auto` 正是这个机制：把左边的剩余空间全部吃掉，自己贴到最右。

**延伸：** 推论：`justify-content: center` 与 margin:auto 并存时，auto margin 先分；Grid 里 auto margin 在项目所在轨道内分配，同样优先于 align/justify。

**subgrid 和 container queries 分别解决什么问题？它们怎么改变 Flex/Grid 分工？**

*考察点：技术雷达——各自针对的痛点与「骨架响应容器、组件响应格子」的组合关系。*

subgrid 解决「嵌套网格轨道不一致」：子网格继承父级的轨道定义，「每张卡片的标题行跨卡片对齐」不再靠魔法数字凑；container queries 解决「组件只能看视口脸色」：组件按容器宽度而非视口宽度响应，真正成为自包含单元。两者与「组件内部 Flex、页面骨架 Grid」的分工天然契合——骨架响应容器、组件响应自己的格子。

**延伸：** `@container` 查询前要先给容器声明 container-type（inline-size 最常用）；subgrid 的主要约束是兼容面——落地前查兼容性，渐进增强不阻塞主路径。

延伸阅读：《flex 子项为什么压不到预期宽度？》——加权收缩公式的完整推导与 min-width:auto 自动最小尺寸协议；《auto-fill 和 auto-fit 差在哪？》——auto-repeat 的精确行为：空轨道保留 vs 塌缩；《为什么改一个样式会引发重排：回流与重绘》——布局算完之后的成本线：脏位标记、失效传播与布局抖动的引擎机制。

---

## Grid 深拆：auto-fill 与 auto-fit

*难度：入门 ｜ 标签：Grid、CSS、布局、响应式*

> 前置：`repeat`、`minmax` 与 fr 轨道的基本语义见上方「布局选型」的 Grid 深拆小节，本篇聚焦 auto-repeat 这一个机制的精确行为。

**两者的列数计算完全相同——都由 minmax 下限和容器宽度决定；唯一差别在「项目数少于列数」时对空重复轨道的处理：auto-fill 保留空轨道占位，项目宽度稳定；auto-fit 把空轨道塌缩为 0，现有项目拉伸铺满整行。项目填满所有列时二者逐像素等价。响应式卡片流的首选写法是 `repeat(auto-fill, minmax(240px, 1fr))`——零断点、零 JS。**

### 列数是算出来的，不是写出来的

`repeat(auto-fill, minmax(240px, 1fr))` 的执行过程：引擎用「下限 240px + gap」去试除容器宽度，取不溢出的最大整数列数；每列上限是 1fr，剩余空间再均分给所有列。列数随容器宽度自动增减——**没有任何媒体查询参与**，也不需要 JS 测量。关键认知是：auto-repeat 的列数在**轨道定义阶段**就已确定，跟项目有几个、内容多宽都无关。

`minmax` 的两个分量各管一段：下限是列的**最低保障**（至少 240px），1fr 是**剩余空间的分配比例**（先保底、后均分）。下限写 `auto` 或 `min-content` 是常见错误——轨道会被最宽的内容撑破，等分随之失效（这与 Flex 的 `min-width: auto` 是同一套自动最小尺寸协议）；下限请给固定值或 0。

```css
/* 零断点响应式卡片流的标配写法 */
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
/* 容器 1000px、gap 16px：(1000 + 16) / (240 + 16) ≈ 3.96 → 3 列 */
/* 每列先拿 240px 保底，剩余 488px 由 1fr 均分 */
```

### 差别只在空轨道：保留还是塌缩

空轨道指放置完成后**没有任何项目落入**的重复轨道。auto-fill 保留它们继续占位：每个项目守着自己那份 1fr 列宽，数量变化时项目宽度稳定；auto-fit 把空轨道**塌缩为 0**（两侧 gap 一并折叠），省出来的空间被 1fr 重新均分，现有项目拉伸铺满整行。

> MDN · repeat() · auto-fit："The auto-fit value behaves the same as auto-fill, except that after placing the grid items any empty repeated tracks are collapsed. A collapsed track is treated as having a single fixed track sizing function of 0px, and the gutters on either side collapse."

注意塌缩发生的阶段：它在**布局的轨道定义阶段**由引擎完成，纯 CSS 行为——「只有 1 个项目却铺满一行」不是媒体查询魔法，是空轨道塌缩后的自然结果。而项目数不少于列数时不存在空轨道，auto-fill 与 auto-fit 的渲染逐像素相同。

真实渲染实测（同一容器、同一份 `minmax(120px, 1fr)`，切换项目数看空轨道去留）：

```css
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
/* auto-fit 版本仅把 auto-fill 换成 auto-fit */
```

```js
// 实测手段：getComputedStyle 能读出引擎算好的真实轨道尺寸
const el = document.querySelector(".grid");
const tracks = getComputedStyle(el).gridTemplateColumns;
// 配合 ResizeObserver 监听容器变化即可实时观察轨道增减
```

```text
容器约 500px、项目只有 2 个时：
auto-fill → 120px 120px 120px 120px（空轨道保留实际宽度，项目守着自己那份 1fr）
auto-fit  → 234px 234px（空轨道塌缩为 0px、两侧 gap 折叠，省下的空间被 1fr 均分）
项目数 ≥ 列数时，两者的轨道列表逐像素相同。
```

| auto-fill | auto-fit |
| --- | --- |
| 空轨道：保留占位，轨道照常计宽 | 空轨道：塌缩为 0，两侧 gap 折叠 |
| 项目宽度：稳定，不随项目数变化 | 项目宽度：拉伸铺满剩余空间 |
| 显式 line 号定位：安全，轨道线都在 | 显式 line 号定位：危险，可能掉进 0 宽轨道 |
| 适用：项目数不定的列表，宽度一致性优先 | 适用：项目少而大，展示效果优先 |

### 选型与各自的坑

选型只看一个问题：**项目数少时，你要「列宽稳定」还是「铺满整行」**。内容列表、卡片流这类「宽度一致 = 秩序感」的场景选 auto-fill；英雄区、标签行、少量大卡这类「少时更要气场」的场景选 auto-fit。写法上最常见的错误是用媒体查询手写断点列数——auto-repeat 本来就是为替代它而生的。

**反例：媒体查询手写断点**

```css
/* 手写断点：每个断点都要维护 */
.cards { grid-template-columns: 1fr; }
@media (min-width: 640px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .cards { grid-template-columns: repeat(3, 1fr); }
}
```

断点间宽度仍会浪费，断点数值与内容无关——纯手工响应式。

**正例：auto-repeat 一行声明**

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
```

一行声明：列数随容器自适应，240px 下限保证可读性。

三个高频坑：**其一**，gap 参与列数计算——容器宽在临界值 ±1px 时列数增减，项目宽度整体跳变，做宽度过渡动画时会观察到抖动，属预期行为而非 bug；**其二**，auto-fit 配显式定位（`grid-column: 3`）时，项目会落进塌缩后的 0 宽轨道——线号照常计数、轨道宽 0，元素肉眼不可见；**其三**，minmax 下限写 `min-content` 或 `auto`，内容一宽轨道就破格等分。

**反例：auto-fit 配显式线号定位**

```css
.gallery { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
.gallery .feature { grid-column: 3; }
/* 项目只有 1 个时：第 2、3 条轨道已塌缩为 0 */
```

塌缩轨道的线号仍在，feature 被塞进 0 宽轨道——渲染了但看不见。

**正例：需要显式定位就用 auto-fill**

```css
/* 需要显式定位 → 用 auto-fill，轨道永在 */
.gallery { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
.gallery .feature { grid-column: 3; }
```

auto-fill 不塌缩轨道，显式 line 号定位始终落在真实列上。

```text
┌─ auto-repeat 口诀 ────────────────────────────────────┐
│ 列数计算相同，差别只在空轨道：                         │
│ auto-fill 保留占位（宽度稳定）                         │
│ auto-fit 折叠空轨道（现有项目铺满）                    │
│ 项目填满时等价；需要显式 line 号定位就锁死 auto-fill。  │
└───────────────────────────────────────────────────────┘
```

### 追问链

**auto-fill 和 auto-fit 算出的列数什么时候不一样？**

*考察点：先把「列数不同」这个最常见的误解拆掉——两者的差异根本不在列数上。*

永远一样。两者用同一套规则计算重复次数：以 minmax 下限加 gap 试除容器宽，取不溢出的最大整数——这一步不涉及项目数量。差异出现在放置之后：auto-fill 保留没有项目的空轨道，auto-fit 把空轨道塌缩为 0 并折叠两侧 gap。

**延伸：** 规范还规定计算重复次数时轨道尺寸会向下取整到浏览器指定的最小值（如 1px），避免除零——这就是极窄容器下列数至少为 1 的来源。

**只有 1 个项目时 auto-fit 为什么能铺满整行？塌缩发生在哪个阶段？**

*考察点：塌缩的执行时机——理解布局流水线，而不是背「一个占位一个填充」。*

轨道定义阶段就完成了：引擎先按 auto-fill 的规则生成全部轨道并放置项目，随后把没有项目的重复轨道塌缩为 0px、折叠两侧 gap，剩余空间由 1fr 重新均分——单项目自然铺满整行。全程纯 CSS，没有媒体查询、没有 JS 参与。

**延伸：** 极端情况：所有重复轨道都为空时可以全部塌缩——这也是「空网格不占位」的写法依据；塌缩只作用于 auto-repeat 生成的重复轨道，显式声明的轨道不会被折。

**minmax(240px, 1fr) 的两个分量各管什么？下限能写 min-content 吗？**

*考察点：minmax 与 fr 的精确语义；指出自动最小尺寸的坑才是加分层。*

下限是每列的最低保障（240px 保底），1fr 是剩余空间的分配比例——引擎先扣掉所有保底，再把剩余空间按 fr 均分。下限不建议写 min-content 或 auto：轨道会被最宽的内容撑破，等分失效。要弹性用固定值或 0——`minmax(0, 1fr)` 就是对「下限钉到 0」的标准写法。

**延伸：** 这与 Flex 子项的 `min-width: auto` 是同一套自动最小尺寸协议的两副面孔：minmax(0, 1fr) 之于 Grid，正如 min-w-0 之于 Flex。

**auto-fit 网格里写了 grid-column: 3 的元素，最终渲染到哪了？**

*考察点：塌缩轨道与显式线号的交互——auto-fit 最隐蔽的坑。*

塌缩不删除轨道：被折叠的轨道以 0px 的固定尺寸留在轨道列表里，线号照常计数。所以 `grid-column: 3` 定位仍指向第 3 条线之间——只是那列可能宽 0、两侧 gap 也折叠了，元素被挤压成不可见或贴在缝隙里。需要显式 line 号定位的场景应该用 auto-fill（轨道永远真实存在），或改用命名区域避开裸线号。

**延伸：** 调试线索：DevTools 的 Grid 面板能直接看到 0 宽轨道与折叠后的 gap；getComputedStyle 读 gridTemplateColumns 也会把塌缩轨道显示为 0px。

延伸阅读：《Flex 还是 Grid：一维流与二维网格？》——回到布局全景：两种引擎的选型决策树、对齐体系与典型场景的标杆写法；《flex 子项为什么压不到预期宽度？》——同知识面的另一条深拆线：加权收缩算法与 min-width:auto 自动最小尺寸协议。

---

## Flex 深拆：加权收缩与自动最小尺寸

*难度：进阶 ｜ 标签：Flexbox、CSS、布局、min-width*

> 前置：本篇聚焦 Flex 收缩这条最深的主线；弹性三件套（grow/shrink/basis）的分配总览与 Grid 侧的孪生坑，见上方「布局选型：Flex 还是 Grid」。

**flex 子项压不到预期宽度，是三道闸门依次拦截的结果：基准（basis）定尺寸 → 加权收缩（shrink × basis，不是等比压缩）→ min-width:auto 自动最小尺寸。前两道按公式可预测——每项收缩量 = 溢出 × (shrink × basis) ÷ 权重和；第三道是隐形下限：子项拒绝收缩到 min-content 以下，长内容直接把布局撑爆。诊断顺序同理：先手算加权，再查 min-w-0。**

### 第一道闸门：加权收缩，不是等比压缩

先立一道例题：容器 600px，三个子项 basis 200/300/300、shrink 分别 1/2/1。基准总和 800px，超出容器 200px，引擎进入负剩余空间分配。直觉答案「等比缩到 75%」给出 150/225/225——**错的**，收缩引擎从头到尾没做过等比缩放，它做的是**加权分摊**。

推导只有三步。第一步算权重：每项权重 = shrink × basis，得 200/600/300，**权重和 1100**（既不是 shrink 之和，也不是 basis 之和）。第二步分摊溢出：每项收缩量 = 200 × 自己的权重占比，得 36.4 / 109.1 / 54.5。第三步落账：最终宽度 163.6 / 190.9 / 245.5。

| 子项 | basis | shrink | 权重 s×b | 收缩量 | 最终宽度 |
| --- | --- | --- | --- | --- | --- |
| A | 200px | 1 | 200 | 36.4px | 163.6px |
| B | 300px | 2 | 600 | 109.1px | 190.9px |
| C | 300px | 1 | 300 | 54.5px | 245.5px |

和等比答案对照能看出加权的性格：B 同时占高 shrink 和大 basis，被压得远比等比更狠（190.9 对 225）；C 与 B 同 basis、shrink 只有一半，最终反而比 B 宽 54.6px。用 MDN 的话说，shrink 因子要乘以基准尺寸再参与分摊——**shrink 是缩放意愿，basis 是加权基数**。只有 shrink 全相同时权重退化为 basis 本身，收缩才「碰巧」等比——那是特例，不是通则。

> MDN · flex-shrink："The flex shrink factor is multiplied by the flex base size; this distributes negative space in proportion to how much the item can shrink."

真实引擎在这之上还有一层**夹逼-冻结迭代**：某项被 min/max 夹住后冻结出局，它分摊不掉的量重新按权重摊给未冻结项，循环到没有违约为止。上面的手算是单轮理想值，第二道闸门（自动最小尺寸）正是触发迭代的常见来源。

### 加权收缩模拟器：公式与真实渲染对照

模拟器的默认参数就是上面这道例题（总 basis 800、容器 600、B 的 shrink 可调）：渲染条是浏览器真实 flex 布局，数值列是公式的理论值——两者对照，加权分配会从「背公式」变成「看得见」。核心计算逻辑：

```js
// 模拟器核心：收缩量 = 溢出 × (shrink × basis) ÷ 权重和
const TOTAL_BASIS = 800; // 三项 basis 之和
const items = [
  { label: "A", basis: 200, shrink: 1 },
  { label: "B", basis: 300, shrink: 2 }, // shrink 可调
  { label: "C", basis: 300, shrink: 1 },
];

const overflow = Math.max(0, TOTAL_BASIS - container); // 溢出量
const weightSum = items.reduce((sum, it) => sum + it.shrink * it.basis, 0);
const rows = items.map((it) => {
  const weight = it.shrink * it.basis;                 // 权重 = shrink × basis
  const cut = overflow > 0 && weightSum > 0
    ? (overflow * weight) / weightSum
    : 0;                                               // 按权重占比分摊溢出
  return { ...it, weight, cut, final: it.basis - cut };
});
```

```text
默认参数（容器 600px、shrink = 1/2/1）：总 basis 800px，溢出 200px → 触发加权收缩
A：basis 200 · 权重 200 · 收缩 36.4px · 最终 163.6px
B：basis 300 · 权重 600 · 收缩 109.1px · 最终 190.9px
C：basis 300 · 权重 300 · 收缩 54.5px · 最终 245.5px

若容器 ≥ 800px：无溢出（grow = 0，不做正分配），各项保持 basis 原宽。
```

上方渲染条为浏览器真实 flex 布局，数值为加权公式的理论值——子项内容不触发 min-width:auto 时二者完全一致；真实引擎在收缩触到 min/max 边界时还会冻结该项并二次分配剩余溢出。

### 第二道闸门：min-width:auto 的自动最小尺寸协议

经典事故：子项里放了一段长文本（长单词、URL、宽表格），容器被撑爆，`flex-shrink` 好像失效了。根因是 flex 子项默认 `min-width: auto`，走**自动最小尺寸**协议——这是规范有意为之的保护，防止内容被压到完全不可读，代价是收缩算法碰到这条隐形下限时提前冻结。按 MDN 的归纳，flex/grid 子项的自动最小值依次回落三档：显式指定的尺寸 → 经 `aspect-ratio` 传递的尺寸 → **min-content 尺寸**；而普通 block 的 `min-width: auto` 恒为 0——这套协议只在 flex/grid 子项上生效。

min-content 对文本是**最长不可断单元**的宽度——长单词、URL、不换行的表格列都会把它抬得很高；对图片这类替换元素则是**固有宽度**：一张 3000px 的原图，隐形下限就是 3000px，容器再窄也压不下去，所以图片溢出得比文本更极端。协议生效时，触到下限的子项被冻结，溢出被转嫁给邻居；邻居也触界时容器整体溢出——这就是「压不到预期宽度」的最终形态。

解法链按需递进：`min-w-0` 把隐形下限钉到 0，收回收缩权；需要裁剪保护再加 `overflow`；要省略号就配 `truncate`。规范还留了一条捷径——子项成为滚动容器（overflow 非 visible）时自动最小尺寸直接归 0，所以 `overflow: hidden / auto` 也能解开下限，但它们同时带入裁剪或滚动条语义，溢出呈现策略还是显式声明更可控。

```css
/* 解法链：按需递进，从①到③逐级加码 */
.item { min-width: 0; }                    /* ① 解除隐形下限，收回收缩权 */

.item {                                    /* ② 需要裁剪保护：长内容不外溢 */
  min-width: 0;
  overflow: hidden;
}

.item {                                    /* ③ 省略号收尾 */
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

img { min-width: 0; max-width: 100%; }     /* 图片：下限上限双管齐下 */
```

**反例：长文本溢出**

```html
<div class="flex">
  <span class="flex-1">
    a-very-long-unbreakable-url-slug
  </span>
</div>
<!-- 撑爆容器，shrink 无力回天 -->
```

自动最小尺寸 = min-content：长单元把下限抬到内容宽度，收缩提前冻结。

**正例：min-w-0 解除下限**

```html
<div class="flex">
  <span class="flex-1 min-w-0 truncate">
    a-very-long-unbreakable-url-slug
  </span>
</div>
<!-- min-w-0 解除下限，truncate 出省略号 -->
```

`min-w-0` 是 flex 子项处理长内容的第一反应，几乎总是需要的。

**反例：图片只压上限**

```html
<div class="flex">
  <img class="max-w-full" src="hero-3000px.png" />
</div>
<!-- 只压上限，下限仍是 auto -->
```

替换元素的隐形下限来自固有宽度：只写 max-w-full 限的是上限，3000px 原图照样撑爆。

**正例：下限上限双管齐下**

```html
<div class="flex">
  <img class="min-w-0 max-w-full object-cover" src="hero-3000px.png" />
</div>
```

`min-w-0` 解除下限 + `max-w-full` 压住上限，双管齐下才有效。

### 嵌套陷阱：下限沿 flex 链逐层传播

多层嵌套是这条协议最容易翻车的形态：最小尺寸会沿着「内容 → 最内层子项 → 中间层子项」一路向上传播，**中间任何一层 flex 项没解开下限，最深层写的 min-w-0 都救不回来**——溢出在外层那一轮收缩里就被冻结了。排查时不要只盯着出问题的那一层，从内容往外逐层确认每个 flex 子项的下限状态。

**反例：中间层没解下限**

```html
<div class="flex">
  <div class="flex flex-1">
    <!-- 中间层没解下限 -->
    <span class="min-w-0 flex-1 truncate">
      a-very-long-unbreakable-slug
    </span>
  </div>
</div>
```

内层解了也白解：外层中间项的自动最小尺寸已被内容顶起，收缩在它那一层冻结。

**正例：每一层中间项都解下限**

```html
<div class="flex">
  <div class="flex min-w-0 flex-1">
    <span class="min-w-0 flex-1 truncate">
      a-very-long-unbreakable-slug
    </span>
  </div>
</div>
```

每一层会溢出的 flex 中间项都要 `min-w-0`：下限是逐层传播的。

```text
┌─ 收缩失灵排查口诀 ────────────────────────────────────┐
│ 先算加权（shrink × basis），再查下限（min-width:auto） │
│ 长内容 flex 项的第一反应是 min-w-0；                   │
│ 图片配 max-w-full；                                    │
│ 嵌套布局每一层中间项都要解下限。                       │
│ 任何收缩失效，先怀疑隐形下限。                         │
└───────────────────────────────────────────────────────┘
```

### 追问链

**flex-shrink 全都是 1 时，收缩按什么比例分配？**

*考察点：校准「shrink = 等比压缩」的默认错觉——退化形态只是巧合。*

仍按 shrink × basis 加权。shrink 全相同时权重就是 basis 本身，退化为按基准尺寸占比收缩——所以「等比压缩」的说法只在这个特例里碰巧成立。权重公式的完整形态是：收缩量 = 溢出 × (shrink × basis) ÷ Σ(shrink × basis)。

**延伸：** 推论：flex:1（basis 为 0）的项权重恒为 0，从不参与收缩分摊；且全体 basis 归零后基准和为 0，根本不会溢出——这就是「flex:1 永不收缩」的算术根源。

**容器 500px，三个子项 basis 都是 200、shrink 分别 1/1/3，各自最终多宽？**

*考察点：验证推导是否长在手上，中间步骤不能跳。*

溢出 100px。权重 = 1×200 / 1×200 / 3×200，即 200/200/600，权重和 1000。收缩量 = 100 × 权重占比 = 20/20/60，最终宽度 180/180/140。注意 shrink 为 3 的 C 项只比邻居多缩 40px 而不是三倍——收缩量按权重占比拉开，不是按 shrink 值直接乘。

**延伸：** 对照：若三者 shrink 全为 1，权重全 200，各缩 33.3px、最终 166.7px——正是「按 basis 等比」的退化形态。

**min-width:auto 的自动最小尺寸到底取什么值？为什么图片溢出得比文本更极端？**

*考察点：自动最小尺寸协议的回落链——三档回落与替换元素差异。*

依次回落三档：显式指定的尺寸（width）→ 经 aspect-ratio 传递的尺寸 → min-content。文本的 min-content 是最长不可断单元（长单词、URL、表格列）；图片这类替换元素的 min-content 直接是固有宽度——3000px 的原图下限就是 3000px，容器再窄也压不下去。解法上文本加 min-w-0 即可；图片必须 min-w-0（解除下限）+ max-w-full（压住上限）双管齐下。

**延伸：** 这套协议只在 flex/grid 子项上生效（普通 block 的 min-width:auto 恒为 0）；表格是 min-content 重灾区，惯用做法是外面包一层 `overflow-x: auto` 的容器——顺带利用了「滚动容器自动最小尺寸归 0」的规则。

**overflow:hidden 不写 min-w-0 也能止住溢出，两者该怎么选？**

*考察点：「滚动容器 → 自动最小尺寸归 0」这条规范捷径，以及副作用意识。*

都能解开下限：子项成为滚动容器（overflow 非 visible）时，自动最小尺寸直接归 0。但 overflow 同时引入裁剪或滚动语义——hidden 把内容剪掉（屏幕阅读器也读不全）、auto 长出滚动条；min-w-0 只解除下限、不改变内容的呈现方式，溢出策略交给后续显式声明（truncate、换行、子级滚动）。工程默认用 min-w-0 表达「我只要收缩权」，需要裁剪再叠加。

**延伸：** overflow:hidden 还会建立独立的格式化上下文并成为 sticky 定位的滚动参照——把「解下限」和「裁剪」两件事耦合在一个属性里，是隐性回归的常见来源。

**手算的加权收缩，什么时候会跟浏览器实际渲染对不上？**

*考察点：夹逼-冻结迭代——答出「冻结与二次分配」才算把单轮公式升级成完整算法模型。*

有子项触到 min/max 时。引擎按轮分配：某项的目标尺寸撞上下限就被冻结，它「想吃却吃不下」的量（违约量）按权重重新摊给未冻结项，循环到没有违约为止。手算的单轮值只是无夹逼时的理想值——典型偏差场景：长文本项顶着 min-content 冻结，它本该承担的收缩被转嫁给邻居，邻居最终比手算值更窄。

**延伸：** 验证方法：给可疑项临时设 `min-width: 0`，邻居宽度随之突变即说明发生了冻结转嫁；收缩模拟器的理论值也只在无人触界时与浏览器渲染条一致。

延伸阅读：《Flex 还是 Grid：一维流与二维网格？》——把收缩放回布局全景：两种引擎的选型决策、对齐体系，以及 Grid 侧的孪生坑 minmax(0, 1fr)。
