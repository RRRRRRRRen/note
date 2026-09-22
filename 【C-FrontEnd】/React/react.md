# React

## JSX 转化为 JavaScript 的详细过程

### 一、转换步骤

> 理解 JSX 是如何被转化为 JavaScript 代码的过程可以帮助开发者更好地利用 React 及其生态系统。以下是一个更加详细的解释，涉及到每个具体步骤和工具。

**1. 编写 JSX 代码**

开发者在 React 应用中编写 JSX 代码。举个例子：

```jsx
const element = <h1>Hello, world!</h1>;
```

**2. Babel 解析 JSX 代码**

Babel 是一个 JavaScript 编译器，广泛用于转化现代 JavaScript 代码，使其在不同的环境中兼容。对于 JSX，Babel 通过插件将其解析为 AST（抽象语法树）。抽象语法树是一种描述代码结构的树状表示。

**3. 转换 AST**

Babel 使用其插件系统对 AST 进行转换。具体来说，Babel 会使用`@babel/plugin-transform-react-jsx`插件将 JSX 节点转换为 React 的函数调用。例如，将`<h1>Hello, world!</h1>`转换为`React.createElement('h1', null, 'Hello, world!')`。

具体转换过程如下：

- **JSX 解析为 AST**:

  - 输入代码：
     ```jsx
     const element = <h1>Hello, world!</h1>;
     ```
  - 转化为 AST 表示：
     ```json
     {
       "type": "VariableDeclaration",
       "declarations": [
         {
           "type": "VariableDeclarator",
           "id": { "type": "Identifier", "name": "element" },
           "init": {
             "type": "JSXElement",
             "openingElement": {
               "type": "JSXOpeningElement",
               "name": { "type": "JSXIdentifier", "name": "h1" },
               "attributes": []
             },
             "closingElement": {
               "type": "JSXClosingElement",
               "name": { "type": "JSXIdentifier", "name": "h1" }
             },
             "children": [
               {
                 "type": "JSXText",
                 "value": "Hello, world!"
               }
             ]
           }
         }
       ]
     }
     ```

- **AST 转换**:
  - Babel 插件将 JSXElement 节点转换为 React.createElement 调用：
     ```json
     {
       "type": "VariableDeclaration",
       "declarations": [
         {
           "type": "VariableDeclarator",
           "id": { "type": "Identifier", "name": "element" },
           "init": {
             "type": "CallExpression",
             "callee": {
               "type": "MemberExpression",
               "object": { "type": "Identifier", "name": "React" },
               "property": { "type": "Identifier", "name": "createElement" }
             },
             "arguments": [
               { "type": "Literal", "value": "h1" },
               { "type": "Literal", "value": null },
               { "type": "Literal", "value": "Hello, world!" }
             ]
           }
         }
       ]
     }
     ```

**4. 生成 JavaScript 代码**

Babel 将修改后的 AST 转换回 JavaScript 代码。最终生成的代码如下：

```javascript
const element = React.createElement("h1", null, "Hello, world!");
```

### 二、Babel 配置和使用

在实际项目中，你通常会使用 Babel 的配置文件和构建工具来自动完成这些转换。以下是一个详细的配置和使用示例：

**安装 Babel 及相关插件**

使用 npm 或 yarn 安装 Babel 核心、命令行工具和 React 预设插件：

```bash
npm install --save-dev @babel/core @babel/cli @babel/preset-react
```

**配置 Babel**

创建一个名为`.babelrc`的配置文件，指定使用 React 预设：

```json
{
  "presets": ["@babel/preset-react"]
}
```

**转换代码**

使用 Babel CLI 命令将 JSX 代码转换为 JavaScript 代码。假设你的源代码在`src`目录，输出到`lib`目录：

```bash
npx babel src --out-dir lib
```

这将读取`src`目录中的所有文件，应用 Babel 转换，并将结果输出到`lib`目录中。

### 三、Babel 相关库的作用

**1. @babel/core**

`@babel/core`是 Babel 的核心库，提供了所有 Babel 转换的基础功能。它主要负责以下几个方面：

- **解析**：将源代码解析成抽象语法树（AST）。
- **转换**：根据配置的插件或预设，对 AST 进行各种转换。
- **生成**：将转换后的 AST 重新生成 JavaScript 代码。

基本上，`@babel/core`是所有 Babel 操作的核心，它可以通过插件和预设来扩展其功能。

**2. @babel/cli**

`@babel/cli`是 Babel 的命令行接口（Command Line Interface）。它允许你在命令行中使用 Babel 来对文件或项目进行转换。它提供了一些命令和选项，方便开发者在终端中操作 Babel。

常用功能包括：

- **转换文件**：将 JSX 或其他现代 JavaScript 语法转换为浏览器兼容的 JavaScript 代码。
- **监听模式**：在开发过程中，监听文件变化并自动进行转换。
- **输出管理**：指定转换后的代码输出目录或文件。

例如：

```bash
npx babel src --out-dir lib
```

这条命令使用 Babel 将`src`目录中的所有文件转换后输出到`lib`目录。

**3. @babel/preset-react**

`@babel/preset-react`是一个 Babel 预设（preset），包含了一组专门用于转换 React 代码的 Babel 插件。预设是插件的集合，使用预设可以方便地配置 Babel，以适应特定的开发需求。

`@babel/preset-react`主要负责以下内容：

- **JSX 转换**：将 JSX 语法转换为 React.createElement 调用。
- **Flow 语法支持**（如果使用 Flow）：将 Flow 类型注释去除，使代码可以在 JavaScript 环境中执行。

在`.babelrc`配置文件中使用`@babel/preset-react`，可以确保你的 React 代码（包括 JSX）在转换时得到正确处理：

```json
{
  "presets": ["@babel/preset-react"]
}
```

**小结**

- `@babel/core`：Babel 的核心库，负责解析、转换和生成代码。
- `@babel/cli`：Babel 的命令行工具，允许在终端中使用 Babel 进行文件转换和其他操作。
- `@babel/preset-react`：Babel 预设，包含处理 React 和 JSX 代码所需的所有插件。

这些库一起工作，使得开发者可以方便地使用现代 JavaScript 特性和 React 语法，同时确保代码在所有环境中兼容。

## React 生命周期

> React 组件的生命周期是指组件在其存在期间经历的一系列方法调用。React 生命周期方法可以分为三个主要阶段：**挂载（Mounting）**、**更新（Updating）\*\*和\*\*卸载（Unmounting）**。每个阶段都有特定的生命周期方法。

### 挂载阶段（Mounting）

- **constructor(props)**

  - **简介**：构造函数，用于初始化组件的状态（state）和绑定事件处理程序。
  - **用途**：初始化 state，绑定方法。
  - **注意事项**：必须调用`super(props)`，避免直接调用`setState()`。

   ```jsx
   constructor(props) {
     super(props);
     this.state = { counter: 0 };
     this.handleClick = this.handleClick.bind(this);
   }
   ```

- **static getDerivedStateFromProps(props, state)**

  - **简介**：在每次渲染前调用，用于使 state 从 props 中同步。
  - **用途**：根据 props 更新 state。
  - **注意事项**：返回一个对象来更新 state，或返回 null 表示不更新。是静态方法，不能访问`this`。

   ```jsx
   static getDerivedStateFromProps(props, state) {
     if (props.someValue !== state.someValue) {
       return { someValue: props.someValue };
     }
     return null;
   }
   ```

- **render()**

  - **简介**：React 组件的唯一必需方法，返回 React 元素以描述 UI。
  - **用途**：定义 UI 结构。
  - **注意事项**：必须是纯函数，不应修改 state 或与浏览器交互。

   ```jsx
   render() {
     return <div>{this.state.counter}</div>;
   }
   ```

- **componentDidMount()**

  - **简介**：在组件挂载后立即调用，适合进行副作用操作。
  - **用途**：数据获取、订阅事件、操作 DOM。
  - **注意事项**：可以调用`setState()`，但应避免导致无限循环。

   ```jsx
   componentDidMount() {
     fetch('/api/data')
       .then(response => response.json())
       .then(data => this.setState({ data }));
   }
   ```

### 更新阶段（Updating）

- **static getDerivedStateFromProps(props, state)**
- **shouldComponentUpdate(nextProps, nextState)**

  - **简介**：决定组件是否重新渲染，优化性能。
  - **用途**：控制是否需要重新渲染。
  - **注意事项**：返回 true 或 false，默认返回 true。

   ```jsx
   shouldComponentUpdate(nextProps, nextState) {
     return nextState.counter !== this.state.counter;
   }
   ```

- **render()**
- **getSnapshotBeforeUpdate(prevProps, prevState)**

  - **简介**：在更新前捕获一些信息，并在更新后使用。
  - **用途**：捕获更新前的 DOM 状态。
  - **注意事项**：返回的值作为`componentDidUpdate`的第三个参数。

   ```jsx
   getSnapshotBeforeUpdate(prevProps, prevState) {
     if (prevState.list.length !== this.state.list.length) {
       return { scrollPosition: this.listRef.scrollTop };
     }
     return null;
   }
   ```

- **componentDidUpdate(prevProps, prevState, snapshot)**

  - **简介**：在组件更新后立即调用，可进行 DOM 操作或数据获取。
  - **用途**：基于更新后的 DOM 状态进行操作或数据获取。
  - **注意事项**：可以调用`setState()`，但需条件判断避免无限循环。

   ```jsx
   componentDidUpdate(prevProps, prevState, snapshot) {
     if (snapshot) {
       console.log('Scroll position before update:', snapshot.scrollPosition);
     }
     if (this.state.data !== prevState.data) {
       fetch('/api/new-data')
         .then(response => response.json())
         .then(data => this.setState({ newData: data }));
     }
   }
   ```

### 卸载阶段（Unmounting）

- **componentWillUnmount()**

  - **简介**：在组件从 DOM 中移除之前调用，用于清理工作。
  - **用途**：清理定时器、取消网络请求、移除订阅。
  - **注意事项**：清理所有在`componentDidMount`中创建的订阅和定时器，避免内存泄漏。

   ```jsx
   componentWillUnmount() {
     clearInterval(this.timer);
     this.eventSource.close();
   }
   ```

### 错误处理（Error Handling）

- **static getDerivedStateFromError(error)**

  - **简介**：在后代组件抛出错误后调用，允许更新 state 以显示降级 UI。
  - **用途**：处理错误并更新 state 以显示错误界面。
  - **注意事项**：是静态方法，不能访问`this`。返回 state 对象或 null。

   ```jsx
   static getDerivedStateFromError(error) {
     return { hasError: true };
   }
   ```

- **componentDidCatch(error, info)**

  - **简介**：在后代组件抛出错误后调用，可用于记录错误信息。
  - **用途**：记录错误日志或显示错误界面。
  - **注意事项**：只能捕获后代组件的错误，不能捕获自身的错误。

   ```jsx
   componentDidCatch(error, info) {
     logErrorToMyService(error, info);
   }
   ```

### 生命周期方法的调用顺序总结

- **挂载阶段**：
  - `constructor(props)`
  - `static getDerivedStateFromProps(props, state)`
  - `render()`
  - `componentDidMount()`
- **更新阶段**：
  - `static getDerivedStateFromProps(props, state)`
  - `shouldComponentUpdate(nextProps, nextState)`
  - `render()`
  - `getSnapshotBeforeUpdate(prevProps, prevState)`
  - `componentDidUpdate(prevProps, prevState, snapshot)`
- **卸载阶段**：
  - `componentWillUnmount()`
- **错误处理**：
  - `static getDerivedStateFromError(error)`
  - `componentDidCatch(error, info)`

## setState 之后 React 做了什么？

*难度：进阶 ｜ 标签：React、setState、批处理、调度*

**结论：调用 setState 只做两件事——把 update 入队、把组件标记为待更新。** 它不改任何变量的值，而是「请求一次重新渲染」。真正的渲染由**调度器**在本轮事件处理全部结束后合并执行，所以调用后立刻读 state 一定是旧值。React 18 起**自动批处理**覆盖所有场景（setTimeout/Promise/原生事件里同样合并），「立刻刷出去」的唯一逃生舱是 `flushSync`。

> **延伸阅读（前置）：** 连续 setState 为什么只加一次：批处理 —— 那篇从使用者视角讲「连续 setState 为什么只 +1」（闭包快照 + 交互演示）；本篇下潜一层，讲 React 拿到这次调用之后在内部做了什么。两篇视角互补，分界在「行为 vs 机制」。

### 第一件事：update 入队，而不是赋值

为什么不直接改值？因为 React 需要把「N 次修改」合并成「1 次渲染」，而合并的前提是先把修改**攒起来**。调用 setState 后，一个 update 对象进入该组件状态对应的**更新队列**——队列里可以存目标值，也可以存 updater 函数。到下一次渲染时，React 从当前 state 出发**逐个重放**队列：遇到值直接替换，遇到函数就拿上一步的返回值继续算。

这个「存操作、渲染期重放」的模型和数据库 WAL、事件溯源是同构的思想：记录操作日志而非最终状态，消费时从初始值 reduce 出结果。react.dev 的官方练习 `getFinalState` 就是这个重放算法的原样实现（据 react.dev《Queueing a Series of State Updates》）——理解了这段循环，函数式更新就不再是咒语：

```typescript
// react.dev 课后练习：队列重放的核心算法
function getFinalState(baseState: number, queue: (number | ((n: number) => number))[]) {
  let finalState = baseState;
  for (const update of queue) {
    if (typeof update === "function") {
      finalState = update(finalState); // 操作：基于前值计算
    } else {
      finalState = update;             // 值：直接替换
    }
  }
  return finalState;
}

getFinalState(0, [1, 1, 1]);           // 1   —— 三次「替换为 1」
getFinalState(0, [n => n + 1, n => n + 1, n => n + 1]); // 3  —— 三次操作依次重放
```

重放结果：

```text
getFinalState(0, [1, 1, 1])                             => 1
getFinalState(0, [n => n + 1, n => n + 1, n => n + 1])  => 3
```

- 结果 1：三次 update 都是「直接替换为 1」——队列里存的是目标值，最后一次替换决定结果，替换执行多少遍都与渲染次数无关。
- 结果 3：三次 update 都是函数——重放时从 baseState 出发依次计算，0 → 1 → 2 → 3，每一步吃上一步的返回值，存「操作」才保得住连续累加。

类组件的 `setState` 是同一个模型：对象式写法往队列里存目标值，函数式写法存 updater 函数——基于先前状态计算新状态时函数式更安全，因为它避开了闭包旧值的异步问题。

```jsx
// 对象式：队列里存「目标值」
this.setState({ count: this.state.count + 1 });

// 函数式：队列里存「操作」，基于前值计算
this.setState((prevState, props) => ({
  count: prevState.count + 1,
}));
```

### 第二件事：标记组件，请求渲染

入队的同时，React 把这个 Fiber 节点**标记**为待更新，并向调度器发起一次「渲染请求」。为什么不干脆直接渲染？因为「请求-合并」模型才付得起批量化的账：一个事件里改 10 个状态，标记会合并到同一次渲染请求上，最终只渲染一次。这也是「setState 不慢、重渲染才贵」的根源——贵的那部分被推迟并且只收一次费。

引擎层面的动作是：从触发更新的 Fiber 节点向上找到 root，把这次 update 的优先级记到 root 的待处理标记上（`pendingLanes`，机制见「Fiber 为什么能让渲染可中断？」一篇）。调度器拿到请求后合并去重——同一轮里第二次 setState 发现已有待处理渲染，就只追加队列、不再重复请求。一次调用的完整旅程：

```text
一次 setState 的旅程 / update flow

setState(update)
   │
   v
update 入队 ──> 标记 Fiber 待更新 ──> 调度器合并请求（本轮只发一次）
                                          │ 事件处理结束后
                                          v
                              render 阶段重放队列 ──> commit 更新 DOM
```

### 批处理：从事件系统行为到调度器行为

批处理指「一轮交互里多次 setState 只触发一次渲染」。react.dev 的表述是：React 会等事件处理函数里的**全部代码**跑完，才开始处理你积攒的状态更新；同时批处理**不跨多次有意事件**——第一次点击和第二次点击各自合并，不会攒到一起。这个边界是刻意保留的：它保证了「第一次点击禁用表单，第二次点击就不会再提交」这类时序语义可以预测。

真正的版本分界在 React 18：此前批处理是**事件系统**的行为——只有 React 合成事件处理函数内才批，setTimeout、Promise、原生事件监听里每次 setState 都独立触发渲染；18 的 `createRoot` 把批处理升级为**调度器**的行为——任何场景默认合并（官方称 automatic batching，据 React 18 发布公告）。行为差异对照：

| React 17 及以前 | React 18+ |
| --- | --- |
| 只在 React 事件处理函数内自动批处理 | createRoot 后全场景自动批处理 |
| setTimeout / Promise.then / 原生事件里逐次渲染 | setTimeout / Promise / 原生事件内同样合并 |
| 入口：ReactDOM.render（legacy 模式） | 逃生舱：flushSync 强制立即渲染 |
| 批处理是「事件系统」的行为 | 批处理升级为「调度器」的行为 |

需要绕过批处理的场景很少但真实存在：读完更新后的 DOM 尺寸再决定布局、配合第三方动画库逐帧取值。逃生舱是 `flushSync(fn)`——fn 里的更新跳过合并、同步刷进 DOM。它是**唯一**的逃生舱，而且代价明确：每次调用都打断批处理、强制一次完整渲染，滥用等于手动退回 17 之前的渲染粒度。

### 边界与陷阱

第一个坑：**在 updater 里做副作用**。updater 在渲染期才执行，而渲染随时可能被打断后从头重算——副作用跟着重放，发过的请求会重发、push 过的日志会翻倍。规避方式：updater 只做纯计算，副作用移到 useEffect 或事件处理器里。

第二个坑：**循环里逐次 flushSync**。每次调用都强制一次同步的完整渲染，循环写它等于把批处理优化亲手打穿，渲染次数从 1 回到 N。规避方式：先把更新攒完，flushSync 只留一次给「必须立刻读更新后 DOM」的那个点，用完即走。

第三个坑：**依赖 updater 外的可变量**（模块级计数器、ref 的当前值）。重放时外部世界已经变了：同一份队列重放两次，吃到不同的外部值，结果不可复现——StrictMode 的双执行正是专门暴露这类不纯。规避方式：updater 只吃入参与前值，需要的外部状态先进队列（作为闭包入参或前置 update）。

updater 使用纪律：

```tsx
// 错误：副作用进 updater + 无脑 flushSync
setCount(c => {
  api.log(c);        // 渲染重放时会重复发请求
  return c + 1;
});
flushSync(() => setA(1));   // 循环里逐次同步刷，
flushSync(() => setB(2));   // 批处理被完全打穿

// 正确：updater 保持纯，只算不做副作用
setCount(c => c + 1);

// 攒完再刷；flushSync 只留给「必须立刻读更新后的 DOM」的场景
flushSync(() => setA(1));
const h = ref.current?.clientHeight;
```

在调度模型里读值的正确姿势：

```tsx
// 错误：把 setState 当成立刻改值——它是「请求一次调度」
setCount(count + 1);
console.log(count); // 旧值：批处理还没落地

// 正确：函数式更新读到最新值；落地后再读
setCount((c) => c + 1);
useEffect(() => { console.log(count); }, [count]);
```

### 经典追问链

**Q1：setCount(count + 1) 写三次只 +1，setCount(c => c + 1) 写三次能 +3——队列里到底发生了什么？**

渲染期 React 从当前 state 出发逐个重放队列：遇到值直接替换，遇到函数就拿前一步的返回值继续算。三份 `count + 1` 都闭包捕获了同一个旧值，重放时等于三次「替换为 1」；三份 `c => c + 1` 则依次 0→1→2→3。本质区别是：队列里存的是「目标值」还是「操作」。

- 加分点：react.dev 的课后练习 getFinalState 就是这个重放算法——for 循环里 `typeof update === 'function' ? update(state) : update`，值得亲手写一遍。

**Q2：setState 的「异步生效」和 microtask 有关系吗？渲染请求排进了哪个队列？**

没有关系。它不是微任务也不是 Promise：React 用自己的 Scheduler 排渲染请求，通过 MessageChannel 的宏任务切片执行，每个时间片处理若干工作单元、片间询问是否让出主线程。事件循环只提供宏任务时间片，React 在里面做了自己的二级调度；这与微任务队列是两个完全独立的层级。

- 加分点：离散事件（click）与连续事件（scroll）的更新优先级不同——这条线索通向 Fiber 的 lane 模型，见「Fiber 为什么能让渲染可中断？」。

**Q3：为什么 updater 函数必须是纯的？StrictMode 为什么要把 updater 跑两遍？**

updater 在渲染期才执行，而渲染随时可能被打断后从头重算——updater 若带副作用（发请求、改外部变量、push 日志），重放一次就执行一次，副作用会翻倍。StrictMode 在开发模式把 updater 和组件函数各跑两遍、丢弃第二遍结果，就是在开发期暴露这类不纯。纯函数保证「算多少遍结果都一样」，这是渲染可丢弃的前提。

- 加分点：这个前提在并发渲染里是硬约束：render 阶段被高优先级插队后，半成品直接作废重来——不纯的 updater 会在用户无感知的情况下重复执行。

延伸阅读：Fiber 为什么能让渲染可中断？、用 index 做 key 为什么会状态错位？

## 连续 setState 为什么只加一次：批处理

*难度：进阶 ｜ 标签：React、Hooks、批处理、useState*

**结论：只加一次不是 React「异步」或出了 bug，而是两件事叠加。** 三次 `setCount(count + 1)` 捕获的是**同一次渲染的旧快照**（等于三次「把 state 替换成 1」），而 React 把这一轮的全部更新**批处理**成一次渲染。React 18 起**自动批处理**覆盖所有场景——事件处理器、setTimeout、Promise、原生事件里都默认合并；唯一的逃生舱是 `flushSync`。想基于最新值连续更新，写函数式更新 `setCount(c => c + 1)`。

> **延伸阅读（前置）：** setState 之后 React 做了什么？ —— 两篇视角互补：本篇讲你眼前能观察到的**行为**（为什么只加一次、什么时候才渲染）；那篇讲调用之后 React 内部的**机制**（update 入队、组件标记、调度器合并渲染请求）。

### 批处理：一轮交互只付一次渲染的钱

批处理指「一轮交互里多次 setState 只触发一次渲染」。react.dev 的表述是：React 会等你事件处理函数里的**全部代码**跑完，才开始处理积攒的状态更新。账很好算：渲染是贵操作——重新执行组件函数、diff 新旧树、commit 进真实 DOM；如果每次 setState 都立即渲染，一个事件里改 3 个状态就要付 3 次全额渲染费，而中间那两次渲染用户根本看不到——还没上屏就被最后一次覆盖了。

这个「先攒后消费」的模型和高普及度的技术参照是消息队列的批量消费：setState 像往队列**投递消息**，渲染像下游消费者——成熟的消费者不会每收一条消息就重启一次流水线，而是攒一批一起处理。你在事件处理器里调用 setState 的那一刻，改的只是队列，界面要等消费时机。所以「setState 之后立刻读 state 还是旧值」不是 React 出 bug，而是**请求已投递、批次还没开**——本节后面所有反直觉现象都从这一句推出来。

```text
一次点击的时间线 / batching

click 触发 ──────────── 进入事件处理器
setState × 3 ────────── 只入队，不渲染
事件处理结束 ────────── 批次的消费时点
一次 render + commit ── 重放队列 · 更新 DOM
浏览器绘制 ──────────── 用户看到的只有结果
```

### React 18 前后：批处理从事件系统移交给调度器

真正的版本分界在 React 18。此前批处理是**事件系统**的行为：只有 React 合成事件处理函数内才批——因为只有那里被 React 的合成事件包着。同一个 setTimeout 回调里三连 set，每次 setState 都独立触发一次渲染；原生 addEventListener、Promise.then 里同理。写惯了老版本的人会记得「定时器里 setState 不批」这条经验，它到 17 为止都是对的。

18 的 `createRoot` 把批处理升级为**调度器**的行为（官方称 automatic batching，据 React 18 发布公告）：任何场景默认合并——事件处理器、setTimeout、Promise、原生事件监听、甚至 async/await 的 await 之后，全部攒进同一批。边界也保留了一条：批处理**不跨多次有意事件**——第一次点击和第二次点击各自合并，不会攒到一起。这条边界是刻意设计的：它保证「第一次点击禁用表单，第二次点击就不会再提交」这类时序语义可预测。

- **React 17-**：只在合成事件处理函数内批；setTimeout / Promise / 原生监听里逐次渲染
- **React 18+**：createRoot 后全场景自动批处理；逃生舱 flushSync；不跨多次有意事件

变化的是「谁负责批」：从事件系统的附属行为，升级为调度器的默认行为。

React 17 及以前，setTimeout 与原生事件监听里的 setState 都是逐次同步渲染，可以拿两段旧代码验证（18 后行为反转，仅作历史对照）：

```jsx
// React 17-：setTimeout 里不批，每次 setState 立即生效并渲染
componentDidMount() {
  setTimeout(() => {
    this.setState({ count: 1 });
    console.log(this.state.count); // 1 —— 已同步生效
    this.setState({ count: 2 });
    console.log(this.state.count); // 2
  });
}
```

```jsx
// React 17-：原生 DOM 事件里同样逐次同步渲染
componentDidMount() {
  const btnEl = document.getElementById("btn");
  btnEl.addEventListener("click", () => {
    this.setState({ message: "你好" });
    console.log(this.state.message); // 你好 —— 立即生效
  });
}
```

React 18 起以上两个场景都进入自动批处理；需要「立刻刷出去」时才动用逃生舱：

```jsx
import { flushSync } from "react-dom";

flushSync(() => {
  setSomething(123);
});
```

### 面试最爱：连续 setState

现象人人背得出来，机制才是考点。关键在**闭包快照**：组件函数每次渲染是一次独立调用，本次渲染里的 `count` 是不可变快照——这三次调用捕获的是同一个 `0`。而队列重放时，值更新是「直接替换」：三份 `count + 1` 算出来都是 `1`，替换三次结果还是 `1`。

```typescript
function handle() {
  setCount(count + 1);   // 队列：[替换为 1]          —— count 是本次渲染的快照 0
  setCount(count + 1);   // 队列：[替换为 1, 替换为 1] —— 闭包里的 count 还是 0
  setCount(count + 1);   // 还是「替换为 1」          —— 三份闭包捕获同一个 0
  // 渲染时重放队列：三次直接替换，结果仍是 1 —— 只 +1

  setCount(c => c + 1);  // 队列存操作：基于前值 +1
  setCount(c => c + 1);  // 1 → 2
  setCount(c => c + 1);  // 2 → 3
  // 渲染时重放队列：0 → 1 → 2 → 3 —— +3
}
```

两种写法的本质区别是**队列里存「目标值」还是「操作」**。值写法存目标值，重复执行多少次结果都一样，所以合并成一次；函数写法存操作，重放时从当前 state 出发依次计算，每一步吃上一步的返回值。函数式更新解决的就是「本次更新依赖上一次更新结果」这个问题——它把对最新值的依赖从**闭包**（渲染那一刻已冻结）转移到**队列**（渲染那一刻才重放），这就是「基于前值计算」四个字的全部含义。

读值口径也要对齐：在 setState 之后紧跟 `console.log(count)`，打印的同样是旧快照（Chrome 实测一致）——`count` 这个绑定要等组件函数带着新 state 重新执行才会变。18 批处理之下，上面六次 setState 无论哪种写法都只触发一次渲染，「+1 还是 +3」的差别全部来自队列重放，与渲染次数无关。

### 交互演示：值写法与函数式写法对照

两个按钮各点一次，盯住两个数字：**count**（状态值）和**渲染次数**（组件真正重新执行的次数，每渲染一次才 +1）。左按钮是值写法三连，右按钮是函数式三连。

```tsx
function BatchDemo() {
  const [count, setCount] = useState(0);
  const [renderCount, setRenderCount] = useState(0); // 记录渲染次数

  // 左按钮：值写法三连 —— 三次「替换为旧值 +1」
  const addWrong = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    setRenderCount((r) => r + 1);
  };

  // 右按钮：函数式三连 —— 队列重放 0→1→2→3
  const addRight = () => {
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setRenderCount((r) => r + 1);
  };
  // 界面上展示 count 与 renderCount 两个数字（渲染部分略）
}
```

预期输出：

```text
点击「setCount(count + 1) × 3」：count 只 +1（三份「替换为 1」重放后还是 1），渲染次数 +1
点击「setCount(c => c + 1) × 3」：count +3（队列重放 0→1→2→3），渲染次数同样只 +1
```

这组对照正好把两件事拆开：**渲染几次由批处理决定**（两种写法都只渲染一次），**加几由队列里存的是值还是操作决定**——批处理和函数式更新是两个正交的机制，别再混着答。

### 边界与陷阱

使用者视角的三个高频坑，全部能用「快照 + 队列 + 批处理」三个词推出后果：绕过 setState 直接赋值（React 无感知）、依赖闭包旧值累加（只加一次）、事件外期待立即读到新值（批次还没消费）。

更新入口：

```tsx
// 错误：直接赋值，绕过队列
count = count + 1;   // 改的只是本次渲染的局部常量
// React 完全无感知：不入队、不标记、不渲染

// 正确：唯一合法的更新入口
setCount(count + 1); // 入队 + 标记待更新，本轮事件结束后统一渲染一次
```

连续累加：

```tsx
// 错误：三份闭包都是旧快照
setCount(count + 1);
setCount(count + 1);   // 三次「替换为 1」→ 只 +1
setCount(count + 1);

// 正确：队列存操作，渲染时依次重放
setCount(c => c + 1);
setCount(c => c + 1);  // 0 → 1 → 2 → 3 → +3
setCount(c => c + 1);
```

事件外读值：

```tsx
// 错误：React 18 后定时器里同样批处理，下一行读到的仍是旧快照
setTimeout(() => {
  setCount(count + 1);
  console.log(count);         // 还是旧值！
  if (count + 1 >= 3) stop(); // 拿旧快照判断，逻辑错位
}, 1000);

// 正确：要最新值就进 updater；要渲染后处理就交给 useEffect
setTimeout(() => {
  setCount(c => c + 1);       // 基于最新值算，逻辑进 updater
}, 1000);

useEffect(() => {
  if (count >= 3) stop();     // 基于「渲染完成」做副作用：声明依赖
}, [count]);
```

### 经典追问链

**Q1：setState 之后立刻 console.log(count)，为什么拿到的是旧值？**

因为本次渲染的 count 是不可变快照，而你的更新刚入队、批处理还没消费——状态要等本轮事件结束后的那次渲染，组件函数带着新值重新执行才有新值。所以「读未来的值」不该读变量：基于最新值做计算用函数式更新 `setCount(c => c + 1)`，在渲染完成后做处理用 useEffect 监听对应依赖。

- 加分点：严格表述是「同步调用、异步生效」：异步的不是 API，而是生效时机——这是调度行为，与 Promise 的异步是两回事。

**Q2：setCount(c => c + 1) 到底解决了什么问题？值写法和函数写法在队列里存的东西差在哪？**

函数式更新解决「本次更新依赖上一次更新结果」的问题。值写法在队列里存目标值——重放等于反复替换，执行三次「替换为 1」结果还是 1；函数写法存操作——渲染期从当前 state 出发依次重放，0 → 1 → 2 → 3。本质是把「对最新值的依赖」从闭包（渲染那一刻已冻结）转移到队列（渲染那一刻才重放）。

- 加分点：react.dev 的课后练习 getFinalState 就是重放算法本体：`typeof update === 'function' ? update(state) : update`，值得亲手写一遍。

**Q3：React 18 的自动批处理有没有覆盖不到的场景？**

常规代码路径全覆盖，例外只有两类。一是 flushSync 包裹的更新：跳过合并、立即同步渲染；二是批处理不跨「多次有意事件」——第一次 click 和第二次 click 各自成批，保证「第一下禁用表单、第二下就不会再提交」的时序可预测。除此之外 setTimeout、Promise.then、await 之后、原生 addEventListener 里的更新，18 后默认全部合并。

- 加分点：「setTimeout 里不批」是 React 17 及以前的经验，到 18 为止失效——面试里拿它当 18 的行为答，暴露的是版本认知过期。

**Q4：flushSync 的代价是什么？什么场景才配用它？**

每次调用都打断批处理、强制一次同步的完整渲染（render + commit 立刻走完），滥用等于手动退回 React 17 之前的渲染粒度。它唯一的正当场景是「必须立刻读到更新后的 DOM」：读完尺寸再决定布局、配合第三方动画库逐帧取值。在事件处理器里循环调用或放进生命周期，会把批处理优化亲手打穿，甚至引发级联重渲染。

- 加分点：React 对「生命周期里调 flushSync」会在开发模式发出警告——同步刷渲染的时机点从 commit 中途穿过去，行为非常难推理。

**Q5：setState 的「异步生效」和微任务有关系吗？事件处理器和 await 之后的更新会合并成一次渲染吗？**

与微任务机制无关，但微任务里的更新确实会赶上同一批。React 18 的渲染请求由自己的 Scheduler 消费（内部用 MessageChannel 排宏任务），消费点在本轮同步代码与微任务之后——所以事件处理器里 setState、随后 Promise.then / await 之后再 setState，两处更新会合并进同一次渲染；而跨宏任务（比如两个独立的 setTimeout 回调）就各自成批。批的单位是「渲染消费窗口」，不是「事件处理器函数」。

- 加分点：这也解释了为什么 18 能把批处理从事件系统解耦：以渲染消费时机为准后，更新发生在什么上下文里根本不重要——调度器只看「渲染开始前还有没有新 update 进来」。

延伸阅读：setState 之后 React 做了什么？、useLayoutEffect 到底差在哪一帧？、Hook 为什么不能写在条件语句里？、Fiber 为什么能让渲染可中断？

## Fiber 为什么能让渲染可中断？

*难度：高级 ｜ 标签：React、Fiber、并发渲染、调度*

**结论：Fiber 把「渲染」从一次不可拆的递归调用，改写成沿链表逐个处理的工作单元。** 每处理完一个单元都有机会问一句「该不该让出主线程」，让更高优先级的更新插队。算到一半的现场存在 workInProgress 树上，commit 之前随时可以**丢弃重来**；而真正改 DOM 的 commit 阶段保持同步——用户永远看不到改到一半的界面。

> **延伸阅读（前置）：** setState 之后 React 做了什么？ —— 本篇假设你已经知道「setState 只入队并请求渲染」——那渲染请求排队之后，渲染本身是怎么被切开的？这就是本篇要回答的下一问。

### 旧架构的死结：递归栈停不下来

先看为什么以前做不到。旧架构里渲染一棵组件树是**同步递归**：递归对应着真实的调用栈，栈帧一层压一层，中间没有任何暂停点——树越大，占死主线程的时间越长，期间的输入、动画、滚动全部阻塞。要可中断，就得能「停在这里，晚点从这继续」，而调用栈做不到：栈帧要么执行完、要么整个作废，没有中间态可言。

Fiber 的解法是**把调度权拿回自己手里**：不再依赖语言调用栈，而是把组件树改写成 React 自己管理的链表结构——遍历进度存成数据，而不是存成栈帧。这和操作系统用时间片调度进程、协程把调用栈显式化是同构的思路：**只有遍历状态是数据，才能随时保存、随时恢复**。架构演进分了三步走：

- **React 15-**：Stack Reconciler——递归对比 + 更新一气呵成，中途无法暂停
- **React 16**：Fiber 架构重写协调器——链表化节点 + 可分片遍历（架构就绪，默认仍同步渲染）
- **React 18**：并发特性开放——useTransition / useDeferredValue（lane 的 API 出口）、自动批处理

「架构就绪」到「特性可用」隔了两个大版本：可中断是能力，让谁中断、中断了怎么办是 18 才给齐的答案。

### Fiber 链表：把树拍平成工作单元

每个组件对应一个 Fiber 节点，节点上挂着三个指针：`child`（第一个子节点）、`sibling`（下一个兄弟）、`return`（父节点）。为什么是这三个指针？因为它们让遍历可以**随时停下来再接着走**：处理完一个节点，有 child 就下去，没有就找 sibling，兄弟用完沿 return 回上去——任何一个时刻，只要记住「当前在哪个节点」，遍历就能精确续上。树形结构 + 三指针 = 把递归 tree-walk 改写成带游标的迭代。

引擎层面的对应物是两个函数：`beginWork` 处理「进入节点」（调用组件函数、对比 props、产出子节点），`completeWork` 处理「离开节点」（收集属性变更等副作用标记）。一个节点的 beginWork + completeWork 就是一个**工作单元**，调度器以工作单元为粒度分配时间：每个单元做完都有一次「要不要继续」的检查点——这就是「可中断」在实现上的最小单位。

Fiber 也是一种数据结构，一个 fiber 就是一个 JavaScript 对象，核心字段如下：

```javascript
type Fiber = {
  // 用于标记fiber的WorkTag类型，主要表示当前fiber代表的组件类型如FunctionComponent、ClassComponent等
  tag: WorkTag,
  // ReactElement里面的key
  key: null | string,
  // ReactElement.type，调用`createElement`的第一个参数
  elementType: any,
  // 表示当前代表的节点类型
  type: any,
  // 表示当前FiberNode对应的element组件实例
  stateNode: any,

  // 指向他在Fiber节点树中的`parent`，用来在处理完这个节点之后向上返回
  return: Fiber | null,
  // 指向自己的第一个子节点
  child: Fiber | null,
  // 指向自己的兄弟结构，兄弟节点的return指向同一个父节点
  sibling: Fiber | null,
  index: number,

  // 当前处理过程中的组件props对象
  pendingProps: any,
  // 上一次渲染完成之后的props
  memoizedProps: any,

  // 该Fiber对应的组件产生的Update会存放在这个队列里面
  updateQueue: UpdateQueue<any> | null,

  // 上一次渲染的时候的state；对函数组件，这里同时是 Hook 链表的头节点
  memoizedState: any,

  // Effect
  // 用来记录Side Effect（增删改等副作用标记）
  effectTag: SideEffectTag,

  // 单链表用来快速查找下一个side effect
  nextEffect: Fiber | null,

  // 子树中第一个side effect
  firstEffect: Fiber | null,
  // 子树中最后一个side effect
  lastEffect: Fiber | null,

  // 代表任务在未来的哪个时间点应该被完成，之后版本改名为 lanes
  expirationTime: ExpirationTime,

  // 快速确定子树中是否有不在等待的变化
  childExpirationTime: ExpirationTime,

  // fiber的版本池，即记录fiber更新过程，便于恢复；双缓存的两棵树靠它互指
  alternate: Fiber | null,
};
```

### 两阶段：render 可打断，commit 一步到位

可中断不等于随便中断——React 把一次更新切成责任完全不同的两段。**render 阶段**只做纯计算：调用组件函数、算 diff、在内存里构建新树，不碰任何真实 DOM。既然是纯计算，就满足「重算 N 次结果一样」——被打断、被废弃、从头再来，代价只是时间，不会产生任何可观察的副作用。**commit 阶段**则把 diff 结果一次性写入真实 DOM 并执行对应的生命周期与 effects，全程同步不可中断——因为用户不能看到改到一半的界面。

这个责任划分解释了一个日常现象：为什么 render 阶段（组件函数体内）禁止 setState、禁止改外部状态，而 useEffect 里随便你异步——前者的代码会被重放，后者的代码一生只跑一次。一次更新的完整时间线：

```text
一次更新的生命周期 / update flow

触发更新 ──────── update 入队
调度 ──────────── 按 lane 优先级排队
render 阶段 ───── 可中断 · 算 diff
commit 阶段 ───── 同步 · 改真实 DOM
effects ───────── layout / passive 副作用
```

从编码角度看，虚拟 DOM 更新过程同样分为这两个阶段：

- **render/reconciliation 协调阶段（可中断/异步）**：通过 Diff 算法找出所有节点变更，例如节点新增、删除、属性变更等等，获得需要更新的节点信息，对应早期版本的 Diff 过程。该阶段开始于 performSyncWorkOnRoot 或 performConcurrentWorkOnRoot 方法的调用，取决于本次更新是同步更新还是异步更新。

```javascript
// performSyncWorkOnRoot会调用该方法
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

// performConcurrentWorkOnRoot会调用该方法
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    // workInProgress表示当前工作进度的树
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

两个 workLoop 唯一的区别是是否调用 `shouldYield`。如果当前浏览器帧没有剩余时间，`shouldYield` 会中止循环，直到浏览器有空闲时间后再继续遍历。

- **commit 提交阶段（不可中断/同步）**：将需要更新的节点一次过批量更新，对应早期版本的 patch 过程。

「递」阶段：从 rootFiber 开始向下深度优先遍历，为遍历到的每个 Fiber 节点调用 beginWork；当遍历到叶子节点（即没有子组件的组件）时就会进入「归」阶段。

「归」阶段：调用 completeWork 处理 Fiber 节点，内部有三个关键动作——创建 DOM 节点（CreateInstance）、将 DOM 节点插入到 DOM 树中（AppendAllChildren）、为 DOM 节点设置属性（FinalizeInitialChildren）。当某个 Fiber 节点执行完 completeWork，如果其存在兄弟 Fiber 节点（即 fiber.sibling !== null），会进入其兄弟 Fiber 的「递」阶段；如果不存在兄弟 Fiber，会进入父级 Fiber 的「归」阶段。「递」和「归」阶段交错执行直到「归」到 rootFiber，协调阶段的工作就结束了。

commit 阶段的主要工作（即 Renderer 的工作流程）分为三部分：

- **before mutation 阶段**：DOM 节点还没有被渲染到界面上，过程中会触发 getSnapshotBeforeUpdate，也会处理 useEffect 钩子相关的调度逻辑。
- **mutation 阶段**：负责 DOM 节点的渲染。渲染过程中遍历 effectList，根据 flags（effectTag）的不同执行不同的 DOM 操作。
- **layout 阶段**：处理 DOM 渲染完毕之后的收尾逻辑。比如调用 componentDidMount/componentDidUpdate，调用 useLayoutEffect 钩子函数的回调等。此外它还会把 fiberRoot 的 current 指针指向 workInProgress Fiber 树。

### 双缓存与 lane：现场保存与插队规则

中断期间屏幕还要照常显示，算到一半的新树不能碰真实 DOM——所以 Fiber 架构是**双缓存**：屏幕对应 `current` 树，更新在内存里构建 `workInProgress` 树，两棵树的对应节点用 `alternate` 指针互指。render 完成后 commit 一次性交换，中断作废时直接丢掉 workInProgress、屏幕不受影响。中断期间「旧界面照常可用」的底气就在这：current 树从头到尾没被动过。

```text
双缓存 / double buffering

current 树（屏幕正在显示）
   │
   │ alternate 指针对照复用
   v
workInProgress 树（内存中构建）
   │ render 完成（可中断 → 同步点）
   v
commit：一次性替换 current
   │
   v
真实 DOM 更新 + effects
```

那谁有资格插队？早期实现用 expirationTime（一个过期时间戳），但它只能表达「多急」，表达不了「这一批更新属于可打断的过渡」这类**并发特征**。`lane` 模型改用位图：每个优先级占一个比特位，可以精确组合与批量判定——lane 位图在**React 17 已在内部落地**，React 18 通过 `useTransition` / `useDeferredValue` 开放出 API 出口，把开发者自己的更新标进 transition lane——「可以慢，但别挡路」。把中断的完整生命周期画成状态机：

```text
render 阶段的状态迁移 / interruptible render

触发更新 ──调度取任务──> render 进行中（纯计算 · 不碰 DOM）
                          │  │
                          │  └── shouldYield ──> 让出（时间片用尽）
                          │                        ┆ 新宏任务续跑（虚线回到 render 进行中）
                          └── 更高优先级 ──> 作废重来
                                               ┆ 基于新 state 重算（虚线回到 render 进行中）
render 进行中 ── render 完成 → 同步点 ──> commit
```

Scheduler 给每个宏任务时间片设了帧预算（约 5ms）：工作循环里每处理完一个 Fiber 单元就问一次 shouldYield——时间片用尽或有更高优先级更新插入，就停止当前工作循环、把控制权还给浏览器，剩余工作通过 MessageChannel 排一个新宏任务继续。用 MessageChannel 而不是 setTimeout(0)，是因为 setTimeout 有约 4ms 的嵌套下限，MessageChannel 的宏任务调度延迟更小也不产生多余计时器。这种由浏览器分配时间片、按约定执行完毕并归还控制权的模式，是一种合作式调度——React 团队 polyfill 的 Scheduler 正是 requestIdleCallback 的功能完备版：除了在空闲时触发回调，还提供多种调度优先级供任务设置。

### 整合应用：render 的工作量从哪省

render 阶段的工作量可以近似成「节点数 × 每节点计算量」，可中断只保证大任务不挡死主线程，省钱的正道是让任务本身变小。两条路线都落在 render 的工作量上：**削减节点**（大列表虚拟化，只渲染可视区的几十行）与**跳过无变化的重渲染**（`memo` 包组件、`useMemo`/`useCallback` 稳定引用、列表用正确 key 让 diff 精准移动）。React 的重渲染由**引用比较**驱动，所以「稳定引用」才成为一等公民；但记忆化不是免费的——每次都有比较成本，先 Profiler 定位重渲染热点，再对热点动手。

- **memo**：组件级跳过渲染
- **useMemo/useCallback**：稳定引用，喂给 memo 和依赖数组
- **正确 key**：精准 diff

先 Profiler 测量再动手；大列表上虚拟化，别只靠 memo 硬扛。

2025 年 10 月 React Compiler v1.0 发布（构建期自动记忆化，兼容 React 17+，不需要改代码），正在改写「手写 memo」这一节的价值：编译器能自动完成大部分 useMemo/useCallback，且覆盖 hook 结构上无法手写的场景。但「先测量、再优化」的判断力依然值钱——工具接管的只是机械部分，什么时候该减少状态、该把状态搬到哪里，仍然是人的决策。

同一条两阶段分界线上还站着一个常被误用的角色：**错误边界**。它只在渲染阶段兜底——子组件渲染抛错、生命周期抛错，会被最近的边界捕获并降级 UI；事件处理器和异步回调里的错误它管不着，前者用 try/catch，后者各自捕获。分界思维和 Node 里「中间件错误要显式 next(err)」同构：**框架只兜它自己调用的代码**。

### 边界与陷阱

两阶段模型推出三条硬边界：**render 阶段必须纯**（可能被打断重放、被 StrictMode 双执行）；**事件闭包里的 state 是快照**（await 之后世界可能已经变了）；**commit 是同步点**（中途插同步渲染等于在手术中间换刀）。

render 阶段纪律：

```tsx
// 错误：render 期做副作用
function Search({ kw }: { kw: string }) {
  api.track(kw);                    // render 期发请求
  matchesRef.current = calc(kw);    // render 期写 ref
  inputRef.current?.focus();        // render 期读真实 DOM
  return <Matches rows={calc(kw)} />;
}
// render 可能被打断重放、StrictMode 会跑两遍——副作用翻倍执行，
// ref 读到的可能是任意时刻的旧现场

// 正确：纯计算留 render，副作用进 effect
function Search({ kw }: { kw: string }) {
  const rows = useMemo(() => calc(kw), [kw]);  // 纯计算留 render
  useEffect(() => {
    api.track(kw);                // 副作用进 effect：一生一次
    inputRef.current?.focus();    // 读写真实 DOM 也在 effect
  }, [kw]);
  return <Matches rows={rows} />;
}
// 「render 是纯计算」是可丢弃的前提：碰真实世界的操作全部移出组件函数体
```

await 之后的快照：

```tsx
// 错误：闭包里的 count 还是旧的
async function handleSave() {
  await api.save();
  if (count >= 3) return;   // 读的是点击那次渲染的闭包值
  setCount(count + 1);      // 同一个旧快照，可能覆盖新更新
}
// await 之后组件可能已重渲染多次——事件处理器不是「当前值」的可靠来源

// 正确：跨过 await 的更新一律函数式
async function handleSave() {
  await api.save();
  setCount(c => c + 1);       // 函数式：基于队列里的最新值
}
// 「依最新值分支」的逻辑放 useEffect([count])，
// 或用 ref 持续同步最新值、await 后读 ref
```

commit 期的同步渲染：

```tsx
// 错误：在生命周期/commit 期调 flushSync
useLayoutEffect(() => {
  flushSync(() => setTip(measure(ref.current)));
  // commit 尚未结束又强制开一轮同步 render + commit
}, []);
// 打断当前提交、级联渲染，开发模式直接警告，极端时死循环

// 正确：layoutEffect 里的更新本来就在 paint 前同步生效
useLayoutEffect(() => {
  setTip(measure(ref.current));  // 本就同步，无需 flushSync
}, []);
// flushSync 只在事件处理器顶层点状使用：
// 「必须立刻读更新后 DOM」的场景，用完即走
```

### 架构对生命周期的影响

Fiber 架构下，React 重新调整了一些生命周期方法。被废弃的三个方法（标记为 UNSAFE）：

- **componentWillMount**
- **componentWillReceiveProps**
- **componentWillUpdate**

它们在异步渲染过程中可能被多次调用、容易导致不一致，因此被两个纯函数式的替代者取代：

- **getDerivedStateFromProps**：静态方法，替代 componentWillReceiveProps。任何时候 props 变化都会被调用，允许组件根据新 props 更新内部状态。
- **getSnapshotBeforeUpdate**：在 DOM 更新之前调用，允许组件在 DOM 变化前获取某些信息，返回值传递给 componentDidUpdate。

调用时机按两阶段划分：

- **调和阶段（Reconciliation Phase，可中断）**：constructor（实例化，初始化状态与绑定）、static getDerivedStateFromProps（每次渲染前调用）、render（纯函数，Fiber 架构确保它可以被频繁调用）。
- **提交阶段（Commit Phase，同步）**：componentDidMount（挂载后，可安全操作 DOM）、componentDidUpdate（更新后，携带更新前的 props/state 与 snapshot）、componentWillUnmount（卸载前清理）。

由于 Fiber 支持异步渲染，render 阶段的方法可能被调用多次或不按预期顺序——这正是废弃三个旧生命周期、新方法设计为纯函数的原因。shouldComponentUpdate 则可以在更细粒度的层次上控制组件是否需要更新，从而提高性能。

### 经典追问链

**Q1：commit 阶段为什么不能中断？**

因为用户不能看到「改到一半的 DOM」。commit 要把 diff 结果一次性写入真实 DOM 并执行对应的生命周期与 effects，拆成两半，用户就会在某帧看到「文本更新了但列表还没渲染」的中间态。可中断的价值全在 render 的纯计算阶段——那里只算不改，重算没有可观察的代价。

- 加分点：commit 过长的优化方向不是「可中断」而是「少 commit」：减少 DOM 操作、拆组件让每次 diff 更小。

**Q2：render 阶段被高优先级更新打断了，已经算了一半的 diff 去哪了？**

直接丢弃。半成品存在 workInProgress Fiber 树上，它与屏幕上的 current 树完全隔离——作废时屏幕不受任何影响，等高优先级更新处理完，React 基于最新 state 重新走一遍 render。敢这么做的前提是 render 阶段全部是纯计算：同样的输入永远算出同样的输出，重算不产生任何可观察副作用。

- 加分点：这也解释了为什么 render 阶段禁止 setState、要求组件函数纯——StrictMode 双调用正是在开发期验证这个约束。

**Q3：React 怎么判断「该让出主线程了」？**

Scheduler 给每个宏任务时间片设了帧预算（约 5ms）：工作循环里每处理完一个 Fiber 单元就问一次 shouldYield——时间片用尽或有更高优先级更新插入，就停止当前工作循环、把控制权还给浏览器，剩余工作通过 MessageChannel 排一个新宏任务继续。对浏览器来说这是一段「会自己让路的长时间任务」；对 React 来说，遍历进度已经存在 workInProgress 树上，随时可续。

- 加分点：用 MessageChannel 而不是 setTimeout(0)，是因为 setTimeout 有约 4ms 的嵌套下限，MessageChannel 的宏任务调度延迟更小也不产生多余计时器。

**Q4：useTransition 到底把更新标到了哪里？isPending 期间的「旧内容」是从哪来的？**

标进 transition 优先级的 lane。isPending 期间新内容在 render 阶段慢慢算，屏幕上的「旧内容」就是 current 树——它从未被替换，所以输入框不卡、列表照常响应，render 完成后 commit 一次性切换。期间若来了更高优先级的更新（比如往搜索框打字），render 可以被打断、按新优先级重排，这就是「并发特征」的含义：不是更快，而是可插队、可废弃。

- 加分点：useDeferredValue 是同一机制的另一种封装：不标记更新本身，而是让「值的衍生计算」慢一拍，适合受控值驱动的过滤渲染。

**Q5：双缓存的两棵树在 commit 时怎么交换？alternate 指针扮演什么角色？**

每对对应节点通过 alternate 互指：current 节点指向 workInProgress 里的镜像，反之亦然，所以构建新树时能低成本复用旧节点的属性。render 完成后，commit 把 workInProgress 树的改动写入 DOM，再把 root 的 current 指针切到新树——交换只是「改一个根指针」，两棵树身份互换：原 workInProgress 升级为 current，旧 current 等下次更新时被复用为新的 workInProgress。

- 加分点：commit 要执行的副作用在 render 末尾就已作为 flags 标记在 Fiber 节点上，commit 沿树收集并依序执行——这是 commit 能同步、一次到位的原因。

延伸阅读：用 index 做 key 为什么会状态错位？、合成事件到底是什么：一套事件委托机制

## 合成事件到底是什么：一套事件委托机制

*难度：进阶 ｜ 标签：React、合成事件、事件委托*

**结论：合成事件 = React 对原生事件的统一包装 + 委托分发机制。** 你在 JSX 里写的 `onClick` 从不挂到对应的 DOM 上——React 在 root 容器挂一个总监听器，原生事件冒泡到 root 后沿 Fiber 树**模拟**捕获/冒泡顺序，找到该响应的组件处理器再调用。换来三样东西：跨浏览器行为统一、成千上万处理器只有 1 个真实监听器、事件可以**分优先级**进入调度器。

> **延伸阅读（前置）：** 事件循环是怎么调度的：从调用栈到微任务 —— 合成事件的派发时机挂在事件循环上：原生事件怎么进队列，决定了 React 什么时候看到它。

### 委托：onClick 到底挂在哪

为什么不直接 addEventListener？事件委托本是 DOM 编程的经典手法：给一千行列表每行绑一个监听器，不如在父容器上绑一个、靠冒泡分发——绑定成本从 O(n) 降到 O(1)，动态增删的节点也不用反复绑解。React 把这个手法做成了**框架默认**：所有通过 props 声明的事件处理器，最终都由一个委托体系统一分发，组件代码里完全看不到 addEventListener 的存在。

引擎层面的路径：React 16 及以前把总监听器挂在 `document` 上；React 17 起改挂到 `createRoot` 的 **root 容器**（迁移动机：多个版本 React 共存、微前端场景下事件不再全局窜台）。原生事件冒泡到 root 后，React 拿到事件目标对应的 Fiber 节点，沿树收集所有相关处理器，按模拟的捕获/冒泡顺序依次调用。一次点击的完整旅程：

```text
合成事件分发 / delegation

DOM 元素          root 总监听         Fiber 树              你的 onClick
   │                  │                  │                      │
   │ click 原生冒泡    │                  │                      │
   ├─────────────────>│                  │                      │
   │ （全应用只有这一个真实监听器）        │                      │
   │                  │ 沿 target 向上收集处理器 │               │
   │                  ├─────────────────>│                      │
   │                  │ （拿到 Fiber 链，按模拟捕获/冒泡排序）     │
   │                  │ 依序调用处理器     │                      │
   │                  │                  ├─────────────────────>│
   │                  │                  │ （传入 SyntheticEvent 包装对象）
   │                  │                  │<─────────────────────┤
   │                  │                  │ e.stopPropagation()  │
   │                  │                  │ （拦的是模拟传播，不是原生冒泡）
   │                  │                  │<─────────────────────┤
   │                  │                  │ setState：进入批处理队列
   │                  │                  │ （事件处理结束后由调度器合并渲染）
```

### 包装：SyntheticEvent 与原生事件的差别

传给你的事件对象不是浏览器原生的那份，而是 React 包装过的 `SyntheticEvent`：接口对齐 W3C 规范（`preventDefault`、`stopPropagation`、`target` 等），把各浏览器的差异在包装层抹平——这是它叫「合成」的原因：行为是合成的标准事件，不是某个浏览器的原生实现。要碰底层原对象，用 `e.nativeEvent`。对组件代码来说还有一笔隐性的账：合成事件不用 removeEventListener、不用管清理，组件卸载时委托体系自然不再分发。

包装层有两次值得记住的架构变动，都和「委托点在哪」直接相关：

- **React 16-**：委托到 document；事件池复用合成事件对象，异步回调里读 e 要先 e.persist()
- **React 17**：委托点移到 root 容器（多版本共存/微前端友好）；移除事件池，e 可随时读取
- **React 18+**：事件带优先级进入调度器：离散事件（click/keydown）同步处理，连续事件（scroll/mousemove/wheel）可被打断

三段演进是同一件事：让事件从「DOM 的通知」升级为「调度体系的一等公民」。

### 边界：两套事件体系要分开想

第一个坑：**原生监听与合成事件的顺序错位**。React 16 时代委托点在 document，你在 document 上自己绑的原生监听若调用 stopPropagation，会按注册顺序把 React 的处理器一起拦掉；React 17 把委托点内移到 root 后顺序反转——React 的处理器在 root 层先执行，document 上的原生监听后到，冒泡阶段想拦也拦不住了（要拦只能在**root 之外祖先的捕获阶段**监听——捕获自外向内先于 root 到达；冒泡阶段的 window 监听排在 root 之后触发，同样拦不住）。同一个「拦截」意图，跨版本行为相反，根因就是委托点位置变了。

第二个坑：**portal 的冒泡按 React 树走**。把模态框 portal 到 body 下，DOM 上它是外层容器的「邻居」，事件却沿**React 父子链**冒泡——外层父组件的 onClick 照样会收到 portal 内容的点击。这是刻意设计：逻辑结构优先于物理 DOM。想阻断，在 portal 内容自己的 onClick 里 stopPropagation（拦的是 React 模拟传播）。第三个坑：**自己 addEventListener 到组件 DOM 节点**的监听要自己在 cleanup 解绑——委托体系只管它自己分发的部分，合成事件「免清理」的便利不覆盖原生绑定。

portal 里的点击拦截：

```tsx
// 错误：Modal portal 到了 body 下
<div onClick={close}>        // 外层遮罩
  <Modal>...</Modal>         // 点 Modal 内部
</div>
// 期望：点 Modal 不触发 close
// 实际：事件沿 React 树冒泡 → close 被触发

// 正确：在 portal 内容内部阻断模拟传播
<div onClick={e => e.stopPropagation()}>
  <Modal>...</Modal>
</div>
// stopPropagation 拦的是 React 模拟传播：外层父组件的处理器不再收到
```

框架内用框架的事件系统：

```tsx
// 错误：绕过 React 直挂原生——委托、池化、统一语义全部失效
el.addEventListener("click", fn);

// 正确：走合成事件，统一委托到根节点
<button onClick={fn}>保存</button>
```

### React 16 时代的执行顺序验证

React 16（委托点在 document）下，合成事件与原生事件的执行顺序可以从一段代码实测：

```jsx
import React from "react";
class App extends React.Component {
  constructor(props) {
    super(props);
    this.parentRef = React.createRef();
    this.childRef = React.createRef();
  }
  componentDidMount() {
    console.log("React componentDidMount！");
    this.parentRef.current?.addEventListener("click", () => {
      console.log("原生事件：父元素 DOM 事件监听！");
    });
    this.childRef.current?.addEventListener("click", () => {
      console.log("原生事件：子元素 DOM 事件监听！");
    });
    document.addEventListener("click", (e) => {
      console.log("原生事件：document DOM 事件监听！");
    });
  }
  parentClickFun = () => {
    console.log("React 事件：父元素事件监听！");
  };
  childClickFun = () => {
    console.log("React 事件：子元素事件监听！");
  };
  render() {
    return (
      <div ref={this.parentRef} onClick={this.parentClickFun}>
        <div ref={this.childRef} onClick={this.childClickFun}>
          分析事件执行顺序
        </div>
      </div>
    );
  }
}
export default App;
```

```text
原生事件：子元素 DOM 事件监听！
原生事件：父元素 DOM 事件监听！
React 事件：子元素事件监听！
React 事件：父元素事件监听！
原生事件：document DOM 事件监听！
```

结论：React 16 所有事件都委托在 document 对象上。当真实 DOM 元素触发事件，会先执行元素自身的原生监听，冒泡到 document 后 React 再处理合成事件（子 → 父），最后才执行 document 上挂载的原生监听。React 17 委托点内移到 root 后，顺序发生反转（见上一节）。

### 经典追问链

**Q1：onClick 的监听器到底挂在哪？什么时候绑上去的？**

挂在 createRoot 的 root 容器上（React 16 及以前挂在 document），在 createRoot 初始化时绑一次，全应用只有这一个真实监听器。你写的 onClick 只是 React 组件树上的一个声明，原生事件冒泡到 root 后由 React 沿 Fiber 树模拟传播、找到对应处理器再调用。

- 加分点：所以列表渲染一千个 onClick 也只有一个真实监听器——绑定成本 O(1)，动态增删行无需绑解。

**Q2：合成事件对象和原生事件对象是什么关系？e.nativeEvent 是什么？**

SyntheticEvent 是对原生事件的包装：接口对齐 W3C 规范，把各浏览器的行为差异抹平在包装层内，所以叫「合成」——行为是合成的标准事件。e.nativeEvent 指向浏览器派发的原生对象；两者指向同一次物理事件，合成对象是 React 自己的字段视图。React 17 起事件池移除，这个对象可以安全地在异步回调里持有和读取。

- 加分点：React 16- 有事件池：合成事件对象被复用、回调结束后字段清空，异步访问前必须 e.persist()——老项目里偶尔还能见到这个 API。

**Q3：在合成事件里调 e.stopPropagation()，阻止的到底是什么？**

阻止的是 React 模拟传播：同一轮派发里排在后面的 React 处理器（外层父组件、捕获阶段的处理器）不再收到事件。React 17 后它同时会阻止原生事件继续向 root 之上冒泡（此时原生事件已经到达 root）；但它管不了已经在 DOM 上发生的冒泡过程——物理冒泡到 root 是委托的前提，模拟传播是 root 之上的逻辑重放。

- 加分点：「模拟」的直觉：事件物理上已经冒到顶了，React 拿着完整路径按逻辑规则重新路由一遍——类似应用层按协议规则重放已收到的报文。

**Q4：为什么 React 17 要把委托点从 document 挪到 root？迁移后哪个行为变了？**

动机是让多个版本/多份 React 实例能安全共存（微前端）：document 只有一个，root 各有各的，事件各归各的委托体系，不再全局窜台。行为变化也在这里：委托点内移后，React 的处理器比 document 上的原生监听先执行——16 时代「document 监听里 stopPropagation 拦住合成事件」的手段失效；要赶在 React 处理之前拦截，只能在 root 之外的祖先（window/document）上用捕获阶段监听——冒泡阶段的 window 监听排在 root 之后触发，同样拦不住。同一拦截意图跨版本行为相反。

- 加分点：root 容器委托还有个隐性收益：SSR/hydration 与并发渲染对事件路径的控制不再依赖全局 document 的状态。

**Q5：click 为什么同步处理、scroll 却可以被打断？事件优先级和 Fiber 是怎么接上的？**

React 把事件按交互特征分了优先级：click、keydown 这类离散事件（用户在等一个明确反馈）派生同步优先级的更新，事件处理结束后尽快同步渲染；scroll、mouseover 这类连续事件（高频、下一帧就过期）派生可打断的低优先级更新，交给调度器切片处理。接线点是：事件处理器里每次 setState 都带着事件的优先级标记进更新队列，Fiber 的 lane 模型据此决定谁插队、谁可中断。

- 加分点：这就是 useTransition 存在的语境：它允许开发者把自己的更新手动降级进 transition lane——「我这件事不急，别挡用户的输入」。

延伸阅读：Fiber 为什么能让渲染可中断？、setState 之后 React 做了什么？、用 index 做 key 为什么会状态错位？

## useLayoutEffect 到底差在哪一帧？

*难度：进阶 ｜ 标签：React、Hooks、useEffect、渲染*

**结论：差别在一道浏览器绘制（paint）的分界线。** 两者都在 commit 阶段、真实 DOM 更新之后执行，但 `useLayoutEffect` 在 **paint 之前同步执行**——函数体跑多久，用户就多久看不到新界面；`useEffect` 被标成 passive，交给调度器排在 **paint 之后异步执行**。所以九成场景该用 `useEffect`；唯一必须用 `useLayoutEffect` 的正当场景是「测量 DOM 并在用户看到之前调整」——比如 tooltip 定位，用错会闪烁。

> **延伸阅读（前置）：** 连续 setState 为什么只加一次：批处理 —— 本篇接着渲染往下走：批处理解决了「什么时候渲染」，这篇回答「渲染提交之后，effects 在帧里的哪个时点跑」。

### commit 阶段：effects 被排进了哪条队列

先看 effects 从哪来。render 阶段结束时，要执行的副作用已经作为 flags 标记在 Fiber 节点上；commit 阶段接过这份清单，按固定顺序走：**先把变更一次性写入真实 DOM**（mutation 段），然后立刻同步执行所有 `useLayoutEffect`——注意这一步没有任何异步间隙，它就在 commit 的调用链里；最后才是浏览器的 paint。`useEffect` 不在这条同步链上：它在 render 阶段被标成 **passive**，commit 完成后交给调度器另找一个时机——通常在 paint 之后——批量执行。

为什么要分两档？因为两类副作用对「用户什么时候必须看不到中间态」的承诺不同。commit 的 mutation 段必须同步一次到位（用户不能看到改到一半的 DOM），但 effects 的数量多、逻辑重，如果全部同步执行，每次提交的阻塞时间都会被拉长，「输入到上屏」的延迟直接劣化。React 的解法是把「必须在用户看到之前完成」的和「晚一点无所谓」的拆成两档：前者留在 commit 里同步跑（layout），后者让出 paint（passive）。这个编排和浏览器一帧的顺序吻合：JS → 样式/布局 → 绘制，useLayoutEffect 挤在 JS 与绘制之间，useEffect 排在绘制后面。

```text
一次 commit 与一帧 / effects timing

render 完成 ───────── 副作用已标记在 Fiber 上
commit：DOM 变更 ──── 同步 · 一次写入
useLayoutEffect ───── 同步执行 · 阻塞绘制
浏览器 paint ──────── 用户第一次看到新界面
useEffect ─────────── passive · paint 之后异步
```

### paint 前后：一道「用户看见」的分界线

useLayoutEffect 同步执行的代价要说透：**阻塞绘制**。它跑在 paint 之前，函数体执行多久，屏幕上就停留多久旧界面——在里面做重计算，掉的就是实打实的帧。这也是官方文档把默认推荐定为 useEffect 的原因：订阅、数据获取、事件绑定这些常见副作用都不关心 paint 时点，没必要拦在用户看画的路上。据 react.dev《useEffect vs useLayoutEffect》的表述：绝大多数场景 useEffect 是对的，useLayoutEffect 只用于「需要在浏览器绘制前进行 DOM 测量」的场景。

那「测量防闪烁」为什么非它不可？看 tooltip 的经典场景：气泡渲染后需要量一下自己的尺寸和锚点位置，再决定定位。如果测量放在 useEffect，执行时 paint **已经发生**——用户先看到一帧位置错误的气泡，再跳到正确位置，这就是闪烁。换成 useLayoutEffect，测量与调整都在 paint 前完成，浏览器画出的第一帧就是正确结果：**错误的中间帧从未存在过**。判断口诀一句话——只有「用户会看见中间帧」时才用 useLayoutEffect。

```typescript
function Tooltip({ anchor }: { anchor: DOMRect | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!anchor || !ref.current) return;
    const r = ref.current.getBoundingClientRect();  // paint 前：量自己
    setPos({                                        // paint 前同步重渲染：
      x: anchor.right + 8,                          // 调整在绘制前完成
      y: anchor.top - r.height / 2,
    });
  }, [anchor]);

  return <div ref={ref} style={{ position: "fixed", ...pos }} />;
  // 用 useEffect 的话：首帧按 pos=null 渲染 → 闪一下 → 跳到正确位置
}
```

### SSR：服务端从来跑不到这一帧

服务端渲染没有浏览器绘制，两类 effect **都不执行**——没有 DOM 可量，也没有帧可排。历史上真正的差异是警告：React 16-18 在服务端渲染遇到 useLayoutEffect 会打印警告，提醒你这段逻辑在客户端首屏水合前不会跑、依赖它的布局在首帧可能是空窗；React 19 起**警告被移除**（服务端渲染器把 useLayoutEffect 直接 stub 成 no-op——已在 react-dom 19.2 源码核实），警告没了，事实没变：hydration 完成之前它一次都不执行，「paint 前测量」的承诺在首屏水合前是空窗。SSR 应用里依赖测量定位的组件要为「首帧无位置」留好兜底（先隐藏、水合后再显示）。

- **React 16-18**：服务端渲染遇到 useLayoutEffect 打印警告（does nothing on the server）
- **React 19+**：警告移除——服务端把 useLayoutEffect stub 为 no-op；不执行的事实不变

移除的是噪音，不是语义：无论哪个版本，服务端都不会执行任何 effect。

### 边界与陷阱

除「测量放错档」外，这一对 Hook 还有三个高频坑：在 useLayoutEffect 里做重活（阻塞被自己放大成掉帧）、在 layoutEffect 里无条件 setState（paint 前同步重渲染，阻塞时间翻倍，还容易写出无限循环）、以及 SSR 首屏空窗（上一节）。

测量时机：

```tsx
// 错误：测量放 useEffect，paint 已经发生
useEffect(() => {
  const r = ref.current!.getBoundingClientRect();
  setPos(fix(r));   // 用户先看到错误位置的一帧
}, []);
// passive 执行时首帧已上屏，测量结果只能修正「下一帧」——中间帧就是闪烁本身

// 正确：测量 + 调整放 useLayoutEffect，paint 前
useLayoutEffect(() => {
  const r = ref.current!.getBoundingClientRect();
  setPos(fix(r));   // 错误的中间帧从未存在
}, []);
// layoutEffect 里 setState 会在 paint 前同步重渲染并提交——正是「画之前改好」的实现机制
```

layoutEffect 的开销：

```tsx
// 错误：重活挤在 paint 前，阻塞被自己放大成掉帧
useLayoutEffect(() => {
  const rows = heavyCalc(data);  // 同步重计算
  rows.forEach(readLayout);      // 循环读布局 → 反复强制回流
  setRows(rows);                 // paint 前全部串行做完
}, [data]);

// 正确：默认 useEffect；确实要在 paint 前做的工作，
// 先在 render 里算好，layoutEffect 只留「读一次、写一次」的测量
useEffect(() => {
  const rows = heavyCalc(data);  // paint 后：不挡上屏
  setRows(rows);
}, [data]);
```

### 经典追问链

**Q1：一句话说清两个 Hook 的执行时机差别？**

两者都在 commit 阶段、真实 DOM 更新之后执行；useLayoutEffect 在浏览器 paint 前同步执行，会阻塞绘制；useEffect 被标为 passive，由调度器安排在 paint 之后异步执行。差别不在「DOM 更新前还是后」，而在「用户看见之前还是之后」。

- 加分点：类组件的对应物：componentDidMount/Update 属于 layout 档（paint 前同步），所以迁移到 Hooks 时老代码里的测量逻辑要显式换成 useLayoutEffect。

**Q2：在 useLayoutEffect 里 setState 会发生什么？为什么它不闪烁反而成了防闪烁手段？**

它会在 paint 之前触发一次同步的 render + commit：React 把这次更新插在同一帧内、绘制发生之前处理完，所以用户看不到中间态——这正是「测量 + 调整」防闪烁的实现机制。代价同样明确：两次渲染都被压在 paint 前同步完成，阻塞时间叠加，所以测量逻辑必须轻。

- 加分点：推论：在 useLayoutEffect 里写无条件 setState（比如 setState(Date.now())）而依赖数组又包含该状态，就是 paint 前无限循环的直接配方。

**Q3：useEffect 一定在「下一帧绘制之后」执行吗？**

不保证。useEffect 是 passive 优先级，由调度器在 paint 之后的时机批量执行，但这是个「不阻塞绘制」的弱保证，不是精确帧定时：主线程忙时它会延后几帧，某些内部流程（如同步渲染路径里被提前 flush）也会让它早于预期执行。需要与帧严格对齐的工作用 requestAnimationFrame——它才是每帧绘制前回调的标准位。

- 加分点：浏览器一帧的顺序是 JS → rAF → Style/Layout → Paint；passive effects 不在这条固定链上，这就是两者定性差异的根源。

**Q4：测量为什么必须「读布局 + 写回」放在同一个 useLayoutEffect 里？拆成两个行不行？**

拆开就白测了。读布局（getBoundingClientRect）在树脏时触发强制同步布局；测量 + 写回必须在「同一次 paint 前」原子完成，浏览器只需一次额外布局、用户看不到中间帧。若读在 layoutEffect、写在 useEffect，写回落在 paint 后——错误位置照样上屏，等于没防。若全放 useEffect，则回到首帧闪烁的老问题。

- 加分点：量多个元素时遵守读写分离：先把所有几何批量读完（首个读触发唯一一次布局），再批量写回——否则在 paint 前自己制造布局抖动。

**Q5：React 19 为什么移除了 SSR 下 useLayoutEffect 的警告？警告没了，风险也没了吗？**

移除警告是因为噪音大于收益：服务端渲染器本就把 useLayoutEffect stub 成 no-op（19.2 源码可核实），执行语义从未变过，警告只是反复提醒一个无法改变的事实。风险没有消失：hydration 完成前它一次都不执行，依赖「paint 前测量」的定位逻辑在首屏水合前是空窗——SSR 应用仍要为「首帧无位置」设计兜底，比如先隐藏占位、水合后再显示。

- 加分点：更稳的做法是把「首屏就必须正确」的定位交给 CSS（固定定位、anchor 定位），把 JS 测量留给水合后的交互态——服务端能给的布局不要欠着客户端。

延伸阅读：Hook 为什么不能写在条件语句里？、Fiber 为什么能让渲染可中断？

## Hook 为什么不能写在条件语句里？

*难度：进阶 ｜ 标签：React、Hooks、Fiber、eslint-plugin-react-hooks*

**结论：Hook 的状态不存在组件函数里，而是按调用顺序挂在 Fiber 节点的 memoizedState 链表上。** React 对号入座的唯一依据是「第 N 次调用对应第 N 个节点」，Hook 没有名字也没有 key。放进条件、循环或提前 return 之后，某次渲染少调一个 Hook，后面所有 Hook 整体前移：**轻则读到别人的状态串台**（数量恰巧一致时不报错，最难排查），**重则数量对不上直接抛错**崩掉渲染。约束只有一条形态要求——每次渲染以相同顺序调用相同数量的 Hook——eslint-plugin-react-hooks 负责把它变成静态报错。

> **延伸阅读（前置）：** 连续 setState 为什么只加一次：批处理 —— 本篇回答一个 Hooks 的存储层问题：useState 保住的那些状态，到底放在哪、靠什么找回——这是 Hooks 全部调用纪律的根源。

### memoizedState：按调用序挂在 Fiber 上

函数组件没有实例——它就是每次渲染重新执行的一个函数，局部变量天然随调用结束消失。那 useState 的状态存哪？答案是**Fiber 节点**：每个 Hook 调用对应一个 hook 对象，对象上挂着该 Hook 的全部状态（useState 的值与更新队列、useEffect 的依赖数组与清理函数……），这些对象串成一条 `memoizedState` 链表，挂在组件的 Fiber 节点上。首次渲染（mount）时，React 按调用顺序逐个创建节点、依次串链；更新渲染（update）时沿这条链**按同样顺序**逐个读取——第 1 次 useState 读第 1 个节点，第 2 次读第 2 个。

为什么用顺序而不是名字或 key 标识？因为「调用即注册」是零声明成本的模型：你不需要给每个 useState 起唯一的名字参数，调用这个动作本身就完成了登记。代价是**顺序成了唯一身份**——这是一份契约：React 假设每次渲染的调用序列完全一致，才敢放心地按位置对号入座。自定义 Hook 在这套机制里没有任何特权：它就是个普通函数，内部调用的 Hook 按执行顺序串进组件的同一条链——「不能写在条件里」对自定义 Hook 内部同样生效，一点不减。

### 错位推演：中间少调一个的那次渲染

场景：组件里三个 useState（a、b、c），中间的 b 被包在 `if (cond)` 里。首次渲染 cond 为 true，链上建了三个节点；某次更新 cond 变成 false，b 不再被调用——本轮只剩两次 useState 调用。看 React 按序对号入座时发生了什么：

```text
Hook 错位推演 / hook order

[第 1 步] mount：三次调用，按序建链
  调用 1 次 useState → 节点1 = a 的状态
  调用 2 次 useState → 节点2 = b 的状态
  调用 3 次 useState → 节点3 = c 的状态
  调用序 a → b → c，与节点序一一对应。

[第 2 步] update：cond = false，b 被跳过
  调用 1：useState(a) → 读节点1  ✓
  调用 2：useState(c) → 读节点2  ← 那是 b 的节点！
  本轮只执行两次调用，React 不知道「谁没来」，
  只知道「这次只调了两次」。

[第 3 步] 对号入座：c 拿到了 b 的状态
  节点2：存的是 b 的值 → 被当成 c 读了
  节点3：c 的节点 → 本轮无人认领
  setC 更新写的也是节点2——b 与 c 的身份彻底互换：
  界面上「c 的值」其实是 b 的旧值，改 c 动的是 b 的存储。
  全程无任何报错。

[第 4 步] 更糟的一步：数量对不上直接崩
  若 cond 分支里是提前 return，本轮只调 1 个 Hook：
  调用数 1 < mount 数 3
  → throw: Rendered fewer hooks than expected
  React 无链可读，整棵子树渲染失败。
```

推演的结论分两级：**串位不报错**——数量恰巧一致时，错位表现为「数据串台」，开关控制了不相关的输入框、两个状态互相对调，这是最难排查的形态；**数量不一致抛错**——Rendered fewer/more hooks than during the previous render，组件树直接崩。前者静默污染数据，后者至少把问题暴露在控制台——两条路都不通向「能上线的代码」。

### 拦截与正确姿势

这条规则的本质是一个**运行时不变量**：调用序列每次渲染必须逐位一致。人肉保证不现实（谁能保证三个月后加的分支不跳过 Hook），所以 eslint-plugin-react-hooks 的 `react-hooks/rules-of-hooks` 把它转成静态检查：任何执行路径上，Hook 调用都不得出现在条件、循环、return 之后——它检查的不是「这一次跑不跑」，而是「写在不合法的位置」。工程里的正确姿势有三条：条件逻辑搬进 Hook 的参数（`useState(cond ? a : b)`，调用本身永远发生）；条件执行的逻辑搬进 useEffect 内部（effect 里随便你早退）；按条件渲染的有状态分支拆成子组件（子组件整个挂载或卸载，各自维护完整 Hook 链）。

条件分支：

```tsx
// 错误：withEmail 变化一次，email 与 ok 的节点身份就互换一次——串台不报错
function Form({ withEmail }: { withEmail: boolean }) {
  const [name, setName] = useState("");
  if (withEmail) {
    const [email, setEmail] = useState("");  // ← 按序错位
  }
  const [ok, setOk] = useState(false);
}

// 正确：条件进 Hook 参数，调用本身永远发生，链的顺序天然稳定
function Form({ withEmail }: { withEmail: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(withEmail ? "" : null);
  const [ok, setOk] = useState(false);
  // 调用次数恒定；「用不用」由值和渲染逻辑决定
}
```

提前返回：

```tsx
// 错误：data 为空的渲染少调一个 Hook，数量对不上直接抛错崩渲染
function Panel({ data }: { data: Data | null }) {
  if (!data) return <Empty />;        // ← return 在 Hook 之前
  const [open, setOpen] = useState(false);  // 某些路径不执行
  return <Detail data={data} open={open} />;
}

// 正确：所有 Hook 调用置于 return 之前
function Panel({ data }: { data: Data | null }) {
  const [open, setOpen] = useState(false);  // Hook 全在顶部
  if (!data) return <Empty />;              // return 放最后
  return <Detail data={data} open={open} />;
}
// 「最顶层」的准确含义是所有路径都会执行的顺序段
```

列表项有状态：

```tsx
// 错误：items 长度变化 = 调用次数变化，链必然错位
function List({ items }: { items: Item[] }) {
  items.forEach((it) => {
    const [sel, setSel] = useState(false);  // ← 循环里调 Hook
  });
}

// 正确：把状态单元拆成子组件，每行一条独立 Hook 链，数量天然稳定
function Row({ item }: { item: Item }) {
  const [sel, setSel] = useState(false);   // 每行一个组件
  return <li onClick={() => setSel(!sel)}>...</li>;
}
// List 里 <Row key={item.id} item={it} />（配稳定 key，见延伸阅读）
```

> **提示：自定义 Hook 同样受约束。** useXxx 内部调用 useState/useEffect 时，这些 Hook 会按执行顺序串进调用方的同一条链——在自定义 Hook 里写条件调用，错位的机理与组件里完全相同。规则检查器正是按这个模型工作的：自定义 Hook 名（use 前缀）就是它给静态分析留下的「这里会调 Hook」的标记。

### 经典追问链

**Q1：Rules of Hooks 的规则原文是什么？「最顶层」具体指什么？**

两条：只在最顶层调用 Hook（不要在循环、条件、嵌套函数里调）；只在 React 函数中调用（函数组件或自定义 Hook）。「最顶层」不是文件顶部，而是每次渲染都会按相同顺序走到的位置——所有 Hook 调用必须位于任何 return、分支之前，与代码写在第几行无关。

- 加分点：「只在 React 函数中调用」排除的是普通 JS 函数与类组件——它们没有 Fiber 节点，链表无处可挂。

**Q2：React 为什么用「调用顺序」标识 Hook 状态，而不是名字或 key？**

因为「调用即注册」是成本最低的契约：不需要给每个 useState 传唯一标识，调用动作本身就完成了登记，读写状态和写普通变量一样轻。代价是把「调用序列稳定」设为硬约束——React 只记住顺序，就敢在每次渲染按位置对号入座。名字或 key 方案要求每个调用显式声明标识，省下的约束又以样板代码还回去。

- 加分点：真要用过带 key 的同类机制可以对比：Vue 的组合式 API 同样依赖调用顺序（setup 里同一约束），这不是 React 独有的取舍。

**Q3：「状态串台」和「抛错崩渲染」分别在什么条件下发生？**

取决于本轮 Hook 数量与 mount 时是否一致。数量一致但顺序错位：对号入座照常完成，没人报错，表现为状态串台——读到别的 Hook 的值、更新写进别人的节点，最静默也最难查。数量不一致：React 沿链读到尽头无节点可给（或剩余节点无人认领），抛 Rendered fewer/more hooks than during the previous render，子树渲染失败。前者是慢性病，后者是急症。

- 加分点：急症反而是好消息：抛错至少把问题钉在控制台；串台只有靠用户反馈或状态对不上的业务数据才能暴露。

**Q4：自定义 Hook 里的 Hook 调用怎么算顺序？在 useXxx 里写 if 合法吗？**

不合法，机理与组件里完全相同。自定义 Hook 就是普通函数，它内部的 useState/useEffect 按执行顺序串进调用方组件的同一条 memoizedState 链——useToggle 里条件执行一个 useState，效果等同于在组件里条件执行。use 前缀不只是命名约定：它是 eslint-plugin-react-hooks 识别「这个函数里会调 Hook、规则适用」的标记。

- 加分点：正确的条件化封装是把分支包在 Hook 的返回行为里：比如 useToggle 返回的函数内部随便你判断，Hook 本身的调用序列保持恒定。

**Q5：这个「按序对账」的模型让你联想到 React 的哪个其他机制？它们的失败形态像不像？**

同层列表的 key 对账。两者都是「React 只认身份标记、按标记复用既有状态」：列表节点靠 key 找回自己的 DOM 与组件状态，Hook 靠调用序找回自己的 memoizedState。失败形态也同构——身份标记错位时都是「状态落到别人头上」：index 做 key 增删后全体顶位，输入框串行；条件调用 Hook 后整条链前移，状态串台。区别只在粒度：一个在 Fiber 节点间对账，一个在链表节点间对账。

- 加分点：所以两类问题的解法哲学也一致：身份标记必须稳定——列表用稳定业务 id，Hook 用恒定的调用序列，绝不给 React 错认身份的机会。

延伸阅读：useLayoutEffect 到底差在哪一帧？、用 index 做 key 为什么会状态错位？

## 用 index 做 key 为什么会状态错位？

*难度：进阶 ｜ 标签：React、diff、key、协调*

**结论：index 描述的是位置，而 key 要表达的是身份。** 增删或排序后所有 index 集体顶位，React 对账时只看 key——它以为「key 0 还是那个元素」，于是把旧节点（连 DOM 和组件状态一起）复用给了新数据：非受控输入残留、动画重放、选中串位全是这一个机制。纯静态只读列表用 index 无害；只要会增删、排序或列表项有内部状态，就用稳定业务 id。

> **延伸阅读（前置）：** Fiber 为什么能让渲染可中断？ —— diff 发生在 render 阶段：组件函数算出新的元素树后，协调器（reconciler）负责回答「新树和旧树怎么对上」。本篇只深挖对账算法里最锋利的一把刀——key。

### 三假设：把树 diff 从 O(n³) 压到 O(n)

先看为什么需要假设。两棵任意树的「最小编辑距离」是经典难题，精确解是 O(n³)——一棵几百个节点的组件树根本付不起。React 的破局思路不是优化算法，而是**放弃通用性换性能**：承认 UI 有三条经验规律，把它们当作前提写死——

- 不同类型的元素直接销毁重建，不尝试复用（一个 div 变成 span，子树整棵推倒）
- 同层节点比较，不跨层移动
- 同层多个子节点用 **key** 标识身份

三条假设叠加，复杂度降到 O(n)。

假设②的工程含义经常被低估：把一个子树从 `<div>` 移到另一个父节点下，React 不会「移动」它，而是旧的销毁、新的重建——组件的本地状态随之清零。要保状态，要么把状态提升到共同的父级，要么给子树一个稳定的 key 并让它留在同一层。这三条假设是 react.dev《Preserving and Resetting State》一整章反复展开的规则来源，本节聚焦其中最难缠的第③条。

### 对账规则：key 相同且类型相同才复用

「复用」在 React 里的含义比直觉重得多：key 相同且类型相同，React 会把旧节点连**真实 DOM**、连**组件实例**、连**hooks 状态链**一起留给新元素，只更新变化的 props。列表重排时，React 按 key 对账、移动既有节点，而不是销毁重建——这是 key 带来的全部好处，也是 key 用错时伤害的通道：身份一旦被错认，被「复用」的就是别人的 DOM 和状态。

引擎层面的对账分两步：先把旧子节点的 key/type 建成映射，再遍历新列表逐个判定——命中则复用，未命中则新建，旧列表里多出来的删除。移动判定上，React 用的是**单向扫描**：维护一个「最后已就位」的下标（lastPlacedIndex），遍历中新节点的旧下标比它小就标记移动。注意这与「最长递增子序列（LIS）」无关——LIS 是 Vue 3 列表 diff 的方案，追求最少移动次数；React 的算法更简单，可能多移几次 DOM，但单趟 O(n)。两个框架的方案经常被混着记，别搞混。

### 错位推演：删除头部那一帧发生了什么

场景：用户列表 `users = [alice, bob, carol]`，用 index 做 key，每个 UserRow 里有一个非受控输入框，alice 已经在里面打了字。现在删除 alice。开发者预期「剩两行原样保留」，实际发生的是：

```text
index key 错位推演 / mismatch

[第 1 步] 初始渲染：身份 = 位置
  0: <UserRow user="alice"> 输入:「hi」
  1: <UserRow user="bob">
  2: <UserRow user="carol">
  key 取 index：alice→0、bob→1、carol→2。
  React 记住的是「key 0 = alice 的节点」，身份绑定在位置上。

[第 2 步] 数据层：删除 alice
  新列表：0:「bob」 1:「carol」
  users 变为 [bob, carol]，新列表的 key 依然是 index。

[第 3 步] 对账：React 只看 key
  新 key 0 → 复用旧 0（alice 的 DOM），props 换成 bob 的数据
  新 key 1 → 复用旧 1（bob 的 DOM）
  旧 key 2 → 在新列表里找不到 → 删除

[第 4 步] 结果：DOM 没动，数据全体顶位
  0: <UserRow user="bob"> 输入:「hi」← 残留
  1: <UserRow user="carol">
  第一个输入框里 alice 打的「hi」还在（非受控内容不跟 props 走），
  选中的是「bob」却显示在「alice 的框」里——身份错认完成。
  若节点有动画或本地状态，同样串位。
```

推演的结论值得背下来：**DOM 一没动，数据全体顶位**。受控组件靠 value prop 每次渲染重置内容，能掩盖错位；非受控输入、CSS 过渡、组件内部 useState 没有 props 可依，错位就浮出水面——所以同一个列表「看起来有时正常有时乱」，差的往往就是列表项里有没有内部状态。

### 边界：什么时候 index 无害

index 无害的条件是三同时：列表**纯静态只读**、渲染后**不再增删排序**、列表项**没有内部状态**（无输入框、无动画、无 useState）。三个条件本质上是同一条判据的不同侧面——「不存在身份错认的机会」。但静态列表会变成动态列表：今天只读的表格，明天加一个行内编辑或拖拽排序，index key 就从无害变成埋雷。所以团队规范普遍直接禁 index，付的不是当下的性能账，是**演进风险的账**——禁令买到的是「以后怎么改都不会错」。

比 index 更糟的是 `key={Math.random()}`：它把三条件全判死刑——每次渲染全员换 key，React 判定「旧节点全部消失、新节点全新面孔」，所有节点连 DOM 带状态全部销毁重建。index 是「偶尔错位」，random key 是「每次都推倒」：输入框每敲一个字都失焦、动画每帧重放、性能灾难。看起来「保证唯一」了，却恰恰毁掉了 key 的唯一价值——**跨渲染的身份稳定**。

列表 key 的正误对照：

```tsx
// 错误：index 做 key，删除第一项后全体 key 顶位，复用错节点
{items.map((item, i) => (
  <UserRow key={i} user={item} />
))}
// 输入残留、动画串位

// 正确：key = 稳定业务 id，删除后其余节点身份不变，精准移动
{items.map((item) => (
  <UserRow key={item.id} user={item} />
))}
// 纯静态只读列表用 index 才无害
```

### 经典追问链

**Q1：key 是给谁看的？不加 key 会发生什么？**

key 是给 React 的协调器看的身份标识：对账时用「key 相同且类型相同」判定节点可否复用。同层多个子元素不加 key，React 只能按位置对账并警告（开发模式下提示 each child should have a unique key）；效果上等价于用 index——退化为位置对账，增删排序时同样错位。

- 加分点：key 的比较只在「同一个父节点下的同层列表」内进行，跨层不比——这是 diff 三假设的第②条。

**Q2：「复用节点」到底复用了什么？为什么受控组件看不出错位、非受控一看就穿帮？**

复用是三件套：真实 DOM 节点、组件实例、组件的 hooks 状态链全部保留，只把新 props 灌进去。受控组件的输入内容来自 value prop，每次渲染都被重置成新数据，错位被掩盖；非受控输入的内容存在 DOM 内部、动画与 useState 存在组件实例上——它们不跟 props 走，所以错位直接浮出水面。

- 加分点：调试技巧：在列表项里塞一个 useId 或 useRef 时间戳，key 用错时立刻显形，比等用户报「输入串行」快得多。

**Q3：把一个有状态的子树挪到另一个父节点下，状态会保留吗？怎么绕？**

不会保留。假设②规定只做同层比较：新位置是「另一棵子树里的新节点」，旧位置则被销毁——组件状态随之清零。绕法有二：把状态提升到两个位置共同的父级；或给需要保态的子树一个稳定的 key（配合条件渲染保持在同一层），React 会在同层内按 key 移动而非重建。React 19.2 还稳定了 Activity 组件（前身是实验性的 Offscreen）：mode="hidden" 隐藏期间保留状态、卸载 effects，「隐藏而非卸载」从此是官方 API。

- 加分点：position: fixed 拖拽回列表这类「DOM 位置变了但 React 树没变」的场景不受影响——diff 看的是 React 树，不是布局树。

**Q4：列表重排时 React 怎么决定移动还是重建？它用的是最长递增子序列吗？**

不是 LIS，那是 Vue 3 的方案。React 对同层列表做单向扫描：先把旧子节点的 key/type 建成映射，再遍历新列表逐个判定复用/新建/删除；移动判定靠一个 lastPlacedIndex（最后已就位的旧下标）——遍历中某节点的旧下标比它小，说明它要往前挪，标记移动。整趟 O(n)，代价是移动次数可能不是最优：某些重排场景 Vue 3 挪 1 个节点，React 可能挪 3 个。两者都是在「假设③ key 可靠」的前提下换性能，只是优化目标不同。

- 加分点：所以「key 稳定但不连续增长」的列表（如按时间插入）在 React 里性能没问题——对账成本是线性的，与移动优化策略无关。

**Q5：如果列表渲染后永远不再变化，用 index 到底有没有代价？那为什么规范还是要禁？**

技术上无代价：列表永不变，对账就永远不会发生「index 顶位」的错认，复用与位置对账结果一致。规范仍禁它，付的是演进风险的账：静态列表大概率会长出增删、排序或行内编辑——index key 从无害变埋雷的那天没有任何编译期警告，错位只以「用户数据串行」的形态在线上暴露。禁令的本质是消除一类不可观测的隐患，而不是优化当下。

- 加分点：折中写法：静态列表可以用 `key={item.id ?? index}` 兜底——有业务 id 用 id，真没有再退 index，并把「为什么会没有 id」作为坏味道上报。

延伸阅读：setState 之后 React 做了什么？、Fiber 为什么能让渲染可中断？

## 组件 Ref 的应用

**父组件获取子组件自身 Ref**

- 父组件可以获取类式子组件 ref
- 父组件无法获取函数式子组件 ref

```jsx
class ClassChild extends Component {
  classChildMethod = () => {};

  render() {
    return <div>ClassChild</div>;
  }
}

function FunctionChild() {
  const functionChildMethod = () => {};

  return <div>FunctionChild</div>;
}

export default class ClassFather extends Component {
  componentDidMount() {
    console.log("classChildRef", this.classChildRef); // 执行结果 子组件实例对象
    console.log("functionChildRef", this.functionChildRef); // 执行结果 undefined
  }
  render() {
    return (
      <div>
        <ClassChild ref={(x) => (this.classChildRef = x)} />
        <FunctionChild ref={(x) => (this.functionChildRef = x)} />
      </div>
    );
  }
}
```

**forwardRef 函数组件 ref**

使用 forwardRef 和 useImperativeHandle 指定 函数式组件暴露的内容

```jsx
const FunctionChild = forwardRef(function Child(props, ref) {
  const functionChildMethod = () => {};

  useImperativeHandle(ref, () => {
    return {
      functionChildMethod,
    };
  });

  return <div>FunctionChild</div>;
});

export default class ClassFather extends Component {
  componentDidMount() {
    console.log("classChildRef", this.classChildRef); // 执行结果 子组件实例对象
    console.log("functionChildRef", this.functionChildRef); // 执行结果 子组件useImperativeHandle回掉返回的对象
  }
  render() {
    return (
      <div>
        <ClassChild ref={(x) => (this.classChildRef = x)} />
        <FunctionChild ref={(x) => (this.functionChildRef = x)} />
      </div>
    );
  }
}
```

**forwardRef 函数组件 ref 转发**

直接将 forwardRef 形参赋值给 dom 节点或者组件

```jsx
import React, { useEffect, useRef, forwardRef } from "react";

const Child = forwardRef((props, ref) => {
  console.log("ref", ref); // 调用组件后，传递过来的值 null
  // 调用Child2的时候，设置的ref属性值函数
  return (
    <div>
      Child
      <button ref={ref}>点击</button>
    </div>
  );
});

function Demo() {
  let childRef = useRef(null);
  useEffect(() => {
    console.log("childRef", childRef.current);
  }, []);
  return (
    <div>
      <Child ref={childRef} />
    </div>
  );
}

export default Demo;
```
