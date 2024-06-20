# JSX 转化为 JavaScript 的详细过程

## 一、转换步骤

> 理解 JSX 是如何被转化为 JavaScript 代码的过程可以帮助开发者更好地利用 React 及其生态系统。以下是一个更加详细的解释，涉及到每个具体步骤和工具。

### 1. 编写 JSX 代码

开发者在 React 应用中编写 JSX 代码。举个例子：

```jsx
const element = <h1>Hello, world!</h1>;
```

### 2. Babel 解析 JSX 代码

Babel 是一个 JavaScript 编译器，广泛用于转化现代 JavaScript 代码，使其在不同的环境中兼容。对于 JSX，Babel 通过插件将其解析为 AST（抽象语法树）。抽象语法树是一种描述代码结构的树状表示。

### 3. 转换 AST

Babel 使用其插件系统对 AST 进行转换。具体来说，Babel 会使用`@babel/plugin-transform-react-jsx`插件将 JSX 节点转换为 React 的函数调用。例如，将`<h1>Hello, world!</h1>`转换为`React.createElement('h1', null, 'Hello, world!')`。

具体转换过程如下：

1. **JSX 解析为 AST**:

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

2. **AST 转换**:
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

### 4. 生成 JavaScript 代码

Babel 将修改后的 AST 转换回 JavaScript 代码。最终生成的代码如下：

```javascript
const element = React.createElement("h1", null, "Hello, world!");
```

## 二、Babel 配置和使用

在实际项目中，你通常会使用 Babel 的配置文件和构建工具来自动完成这些转换。以下是一个详细的配置和使用示例：

### 安装 Babel 及相关插件

使用 npm 或 yarn 安装 Babel 核心、命令行工具和 React 预设插件：

```bash
npm install --save-dev @babel/core @babel/cli @babel/preset-react
```

### 配置 Babel

创建一个名为`.babelrc`的配置文件，指定使用 React 预设：

```json
{
  "presets": ["@babel/preset-react"]
}
```

### 转换代码

使用 Babel CLI 命令将 JSX 代码转换为 JavaScript 代码。假设你的源代码在`src`目录，输出到`lib`目录：

```bash
npx babel src --out-dir lib
```

这将读取`src`目录中的所有文件，应用 Babel 转换，并将结果输出到`lib`目录中。

## 三、Babel 相关库的作用

### 1. @babel/core

`@babel/core`是 Babel 的核心库，提供了所有 Babel 转换的基础功能。它主要负责以下几个方面：

- **解析**：将源代码解析成抽象语法树（AST）。
- **转换**：根据配置的插件或预设，对 AST 进行各种转换。
- **生成**：将转换后的 AST 重新生成 JavaScript 代码。

基本上，`@babel/core`是所有 Babel 操作的核心，它可以通过插件和预设来扩展其功能。

### 2. @babel/cli

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

### 3. @babel/preset-react

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

### 小结

- `@babel/core`：Babel 的核心库，负责解析、转换和生成代码。
- `@babel/cli`：Babel 的命令行工具，允许在终端中使用 Babel 进行文件转换和其他操作。
- `@babel/preset-react`：Babel 预设，包含处理 React 和 JSX 代码所需的所有插件。

这些库一起工作，使得开发者可以方便地使用现代 JavaScript 特性和 React 语法，同时确保代码在所有环境中兼容。

# React 生命周期

> React 组件的生命周期是指组件在其存在期间经历的一系列方法调用。React 生命周期方法可以分为三个主要阶段：**挂载（Mounting）**、**更新（Updating）\*\*和\*\*卸载（Unmounting）**。每个阶段都有特定的生命周期方法。

## 挂载阶段（Mounting）

1. **constructor(props)**

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

2. **static getDerivedStateFromProps(props, state)**

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

3. **render()**

   - **简介**：React 组件的唯一必需方法，返回 React 元素以描述 UI。
   - **用途**：定义 UI 结构。
   - **注意事项**：必须是纯函数，不应修改 state 或与浏览器交互。

   ```jsx
   render() {
     return <div>{this.state.counter}</div>;
   }
   ```

4. **componentDidMount()**

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

## 更新阶段（Updating）

1. **static getDerivedStateFromProps(props, state)**
2. **shouldComponentUpdate(nextProps, nextState)**

   - **简介**：决定组件是否重新渲染，优化性能。
   - **用途**：控制是否需要重新渲染。
   - **注意事项**：返回 true 或 false，默认返回 true。

   ```jsx
   shouldComponentUpdate(nextProps, nextState) {
     return nextState.counter !== this.state.counter;
   }
   ```

3. **render()**
4. **getSnapshotBeforeUpdate(prevProps, prevState)**

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

5. **componentDidUpdate(prevProps, prevState, snapshot)**

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

## 卸载阶段（Unmounting）

1. **componentWillUnmount()**

   - **简介**：在组件从 DOM 中移除之前调用，用于清理工作。
   - **用途**：清理定时器、取消网络请求、移除订阅。
   - **注意事项**：清理所有在`componentDidMount`中创建的订阅和定时器，避免内存泄漏。

   ```jsx
   componentWillUnmount() {
     clearInterval(this.timer);
     this.eventSource.close();
   }
   ```

## 错误处理（Error Handling）

1. **static getDerivedStateFromError(error)**

   - **简介**：在后代组件抛出错误后调用，允许更新 state 以显示降级 UI。
   - **用途**：处理错误并更新 state 以显示错误界面。
   - **注意事项**：是静态方法，不能访问`this`。返回 state 对象或 null。

   ```jsx
   static getDerivedStateFromError(error) {
     return { hasError: true };
   }
   ```

2. **componentDidCatch(error, info)**

   - **简介**：在后代组件抛出错误后调用，可用于记录错误信息。
   - **用途**：记录错误日志或显示错误界面。
   - **注意事项**：只能捕获后代组件的错误，不能捕获自身的错误。

   ```jsx
   componentDidCatch(error, info) {
     logErrorToMyService(error, info);
   }
   ```

## 生命周期方法的调用顺序总结

1. **挂载阶段**：
   - `constructor(props)`
   - `static getDerivedStateFromProps(props, state)`
   - `render()`
   - `componentDidMount()`
2. **更新阶段**：
   - `static getDerivedStateFromProps(props, state)`
   - `shouldComponentUpdate(nextProps, nextState)`
   - `render()`
   - `getSnapshotBeforeUpdate(prevProps, prevState)`
   - `componentDidUpdate(prevProps, prevState, snapshot)`
3. **卸载阶段**：
   - `componentWillUnmount()`
4. **错误处理**：
   - `static getDerivedStateFromError(error)`
   - `componentDidCatch(error, info)`

# React 事件机制

> React 基于浏览器的事件机制自身实现了一套事件机制，包括事件注册、事件的合成、事件冒泡、事件派发等。

## 1. 合成事件（SyntheticEvent）

### 概念

合成事件是 React 实现的一种跨浏览器的事件包装器。它包装了原生的浏览器事件，提供了一致的接口，使得开发者可以不必担心浏览器的差异。

### 特性

- **一致性**：提供跨浏览器的一致事件 API。
- **性能优化**：通过事件池化和事件委托机制提高性能。

### 示例

```jsx
class MyComponent extends React.Component {
  handleClick = (event) => {
    console.log(event); // 合成事件对象
    console.log(event.nativeEvent); // 原生事件对象
  };

  render() {
    return <button onClick={this.handleClick}>Click me</button>;
  }
}
```

在这个示例中，`handleClick`函数接收到的`event`是一个合成事件对象，它具有与原生事件对象相同的属性和方法。

### 执行顺序

关于 React 合成事件与原生事件执行顺序，可以看看下面一个例子：

**例子**

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

**输出顺序**

```int
原生事件：子元素 DOM 事件监听！
原生事件：父元素 DOM 事件监听！
React 事件：子元素事件监听！
React 事件：父元素事件监听！
原生事件：document DOM 事件监听！
```

**结论**

React 所有事件都挂载在 document 对象上
当真实 DOM 元素触发事件，会冒泡到 document 对象后，再处理 React 事件
所以会先执行原生事件，然后处理 React 事件
最后真正执行 document 上挂载的事件

## 2. 事件委托（Event Delegation）

### 概念

事件委托是一种将事件处理器添加到一个父级元素上，而不是每个子元素上，从而提高性能的方法。在 React 中，所有事件处理器都被委托到组件树的根节点。

### 工作原理

- React 在顶层（如`document`或根组件，React16 的事件绑定在 document 上， React17 以后事件绑定在 container）注册事件监听器。
- 当事件触发时，事件会沿着 DOM 树冒泡到顶层。Ï
- React 捕获事件并决定哪个组件的回调函数应该被调用。

### 示例

```jsx
class App extends React.Component {
  handleEvent = (event) => {
    // React会在内部处理事件委托，并调用正确的回调函数
    console.log("Event:", event);
  };

  render() {
    return (
      <div onClick={this.handleEvent}>
        <button id="btn1">Button 1</button>
        <button id="btn2">Button 2</button>
      </div>
    );
  }
}
```

在这个示例中，`div`元素上的点击事件监听器可以处理其子元素的点击事件。

## 3. 事件池化（Event Pooling）

### 概念

事件池化是 React 用来优化性能的一种技术，通过重复使用事件对象，减少垃圾回收的开销。

### 工作原理

- React 创建一个事件对象池。
- 当事件触发时，从池中取出一个事件对象并进行初始化。
- 事件处理完后，事件对象被重置并返回到池中。

### 示例

```jsx
class MyComponent extends React.Component {
  handleClick = (event) => {
    event.persist(); // 保留事件对象，防止被重用
    setTimeout(() => {
      console.log(event.type); // 事件类型
    }, 1000);
  };

  render() {
    return <button onClick={this.handleClick}>Click me</button>;
  }
}
```

`event.persist()`方法可以保留事件对象，使其不会被池化和重用。

## 4. 在 React 中处理事件

### 基本使用

在 React 中，事件处理器可以像处理原生 DOM 事件一样使用，但有一些区别：

- 事件属性使用驼峰命名法（如`onClick`、`onMouseEnter`）。
- 事件处理器通常定义为类的一个方法或函数组件的一个回调函数。

### 示例

```jsx
class MyComponent extends React.Component {
  handleClick = (event) => {
    console.log("Button clicked:", event);
    event.preventDefault(); // 阻止默认行为
    event.stopPropagation(); // 阻止事件传播
  };

  render() {
    return <button onClick={this.handleClick}>Click me</button>;
  }
}
```

在这个示例中，`handleClick`方法使用`event.preventDefault()`阻止按钮的默认行为，并使用`event.stopPropagation()`阻止事件冒泡。

## 注意事项

- **事件命名**：使用驼峰命名法，而不是小写字母。
- **异步操作**：由于事件池化机制，异步操作中访问事件对象时需要调用`event.persist()`。
- **事件传播和默认行为**：可以使用`event.stopPropagation()`和`event.preventDefault()`来控制事件的传播和默认行为。不能通过 return false 阻止事件的默认行为，因为 React 基于浏览器的事件机制实现了一套自己的事件机制，和原生 DOM 事件不同，它采用了事件委托的思想，通过 dispatch 统一分发事件处理函数。
- **访问原生**：虽然合成事件不是原生 DOM 事件，但它包含了原生 DOM 事件的引用，可以通过 e.nativeEvent 访问。

# setState 更新机制

> 在 React 中，`setState`是更新组件状态的主要方法。了解`setState`的执行机制对于编写高效、正确的 React 应用程序至关重要。以下是`setState`的详细执行机制，包括批处理、异步更新和合并等方面。

## `setState`的基本用法

`setState`有两种常用的用法：对象式和函数式。

**对象式用法**

```jsx
this.setState({ count: this.state.count + 1 });
```

**函数式用法**

```jsx
this.setState((prevState, props) => ({
  count: prevState.count + 1,
}));
```

函数式用法在基于先前状态计算新状态时更安全，因为它避免了潜在的异步问题。

## 异步特性

`setState`在 React 中的执行通常是异步的。这意味着当你调用`setState`后，`this.state`不会立即更新。相反，React 会将状态更新加入一个队列，并在适当的时候批量处理这些更新。

**异步更新示例**

```jsx
handleClick = () => {
  this.setState({ count: this.state.count + 1 });
  console.log(this.state.count); // 这里可能不会反映最新的状态
};
```

## 批处理机制

React 会对生命周期方法、事件处理器以及合成事件中的`setState`调用进行批处理。在这些环境中，多次调用`setState`不会导致多次渲染，而是将所有的状态更新合并到一起，在一次渲染中完成。

**批处理示例**

```jsx
handleClick = () => {
  this.setState({ count: 1 });
  this.setState({ count: 2 });
  // 实际上，只有一次渲染
};
```

## 执行机制详解

**调用`setState`**

当你调用`setState`时，React 会将传递的状态更新加入一个队列。

**合并更新**

React 会将多个`setState`调用的更新合并在一起，以提高性能。

**更新队列处理**

React 会在适当的时候处理更新队列，通常是在事件循环的空闲时刻。

**渲染**

处理完更新队列后，React 会计算新的状态并触发重新渲染。

## 特殊情况：同步更新

**setTimeout、setInterval 等异步回调中**

```jsx
import { Component } from "react";

class Dong extends Component {
  constructor() {
    super();
    this.state = {
      count: 0,
    };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        count: 1,
      });
      console.log(this.state.count);
      this.setState({
        count: 2,
      });
      console.log(this.state.count);
    });
  }
  render() {
    console.log("render:", this.state.count);
    return <div>{this.state.count}</div>;
  }
}

// 执行结果顺序
// render：0
// render：1
// 1
// render：2
// 2
```

**原生 DOM 事件中**

```jsx
import { Component } from "react";

class Dong extends Component {
  constructor() {
    super();
    this.state = {
      message: "",
    };
  }
  componentDidMount() {
    const btnEl = document.getElementById("btn");
    btnEl.addEventListener("click", () => {
      this.setState({
        message: "你好",
      });
      console.log(this.state.message); // 你好
    });
  }
  render() {
    return <div id="btn"></div>;
  }
}

// 执行结果
// 你好
```

## React 18 中的更新机制

React 18 引入了并发模式和自动批处理功能，进一步增强了`setState`的性能和可预测性。

**自动批处理**

在 React 18 中，自动批处理不仅限于事件处理器和生命周期方法，还包括 Ï 所有的事件回调，如`Promise`、`setTimeout`等。

```jsx
setTimeout(() => {
  this.setState({ count: this.state.count + 1 });
  this.setState({ count: this.state.count + 2 });
  // 这些更新将被批处理
}, 1000);
```

**flushSync**

调用 `flushSync` 以强制 React 刷新所有待处理的工作并同步更新 DOM。

```jsx
import { flushSync } from "react-dom";

flushSync(() => {
  setSomething(123);
});
```

# Fiber 架构的原理和工作模式

## Fiber 是什么

Fiber 的中文翻译叫纤程，与进程、线程同为程序执行过程，Fiber 就是比线程还要纤细的一个过程。纤程意在对渲染过程实现进行更加精细的控制。
从架构角度来看，Fiber 是对 React 核心算法（即调和过程）的重写。
从编码角度来看，Fiber 是 React 内部所定义的一种数据结构，它是 Fiber 树结构的节点单位，也就是 React 16 新架构下的"虚拟 DOM"。
一个 fiber 就是一个 JavaScript 对象，Fiber 的数据结构如下：

```javascript
type Fiber = {
  // 用于标记fiber的WorkTag类型，主要表示当前fiber代表的组件类型如FunctionComponent、ClassComponent等
  tag: WorkTag,
  // ReactElement里面的key
  key: null | string,
  // ReactElement.type，调用`createElement`的第一个参数
  elementType: any,
  // The resolved function/class/ associated with this fiber.
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

  ref: null | (((handle: mixed) => void) & { _stringRef: ?string }) | RefObject,

  // 当前处理过程中的组件props对象
  pendingProps: any,
  // 上一次渲染完成之后的props
  memoizedProps: any,

  // 该Fiber对应的组件产生的Update会存放在这个队列里面
  updateQueue: UpdateQueue<any> | null,

  // 上一次渲染的时候的state
  memoizedState: any,

  // 一个列表，存放这个Fiber依赖的context
  firstContextDependency: ContextDependency<mixed> | null,

  mode: TypeOfMode,

  // Effect
  // 用来记录Side Effect
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

  // fiber的版本池，即记录fiber更新过程，便于恢复
  alternate: Fiber | null,
};
```

## Fiber 解决什么问题

首先要知道的是，JavaScript 引擎和页面渲染引擎两个线程是互斥的，当其中一个线程执行时，另一个线程只能挂起等待。在这样的机制下，如果 JavaScript 线程长时间地占用了主线程，那么渲染层面的更新就不得不长时间地等待，界面长时间不更新，会导致页面响应度变差，用户可能会感觉到卡顿。

而这正是 React 15 的 Stack Reconciler 所面临的问题，即是 JavaScript 对主线程的超时占用问题。Stack Reconciler 是一个同步的递归过程，使用的是 JavaScript 引擎自身的函数调用栈，它会一直执行到栈空为止，所以当 React 在渲染组件时，从开始到渲染完成整个过程是一气呵成的。如果渲染的组件比较庞大，js 执行会占据主线程较长时间，会导致页面响应度变差。

而且所有的任务都是按照先后顺序，没有区分优先级，这样就会导致优先级比较高的任务无法被优先执行。

Fiber 把一个渲染任务分解为多个渲染任务，而不是一次性完成，把每一个分割得很细的任务视作一个"执行单元"，React 就会检查现在还剩多少时间，如果没有时间就将控制权让出去，故任务会被分散到多个帧里面，中间可以返回至主进程控制执行其他任务，最终实现更流畅的用户体验。
即是实现了"增量渲染"，实现了可中断与恢复，恢复后也可以复用之前的中间状态，并给不同的任务赋予不同的优先级，其中每个任务更新单元为 React Element 对应的 Fiber 节点。

## Fiber 实现原理

实现的方式是 requestIdleCallback 这一 API，但 React 团队 polyfill 了这个 API，使其对比原生的浏览器兼容性更好且拓展了特性。

> window.requestIdleCallback()方法将在浏览器的空闲时段内调用的函数排队。这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。
> requestIdleCallback 回调的执行的前提条件是当前浏览器处于空闲状态。

即 requestIdleCallback 的作用是在浏览器一帧的剩余空闲时间内执行优先度相对较低的任务。首先 React 中任务切割为多个步骤，分批完成。
在完成一部分任务之后，将控制权交回给浏览器，让浏览器有时间再进行页面的渲染。等浏览器忙完之后有剩余时间，再继续之前 React 未完成的任务，是一种合作式调度。

简而言之，由浏览器给我们分配执行时间片，我们要按照约定在这个时间内执行完毕，并将控制权还给浏览器。

React 16 的 Reconciler 基于 Fiber 节点实现，被称为 Fiber Reconciler。

作为静态的数据结构来说，每个 Fiber 节点对应一个 React element，保存了该组件的类型（函数组件/类组件/原生组件等等）、对应的 DOM 节点等信息。
作为动态的工作单元来说，每个 Fiber 节点保存了本次更新中该组件改变的状态、要执行的工作。

## Fiber 架构核心

**Fiber 架构的核心**

- 可中断
- 可恢复
- 优先级

**Fiber 架构可以分为三层：**

- Scheduler 调度器 —— 调度任务的优先级，高优任务优先进入 Reconciler

- Reconciler 协调器 —— 负责找出变化的组件
- Renderer 渲染器 —— 负责将变化的组件渲染到页面上

**React15 与 React16 的区别**

相比 React15，React16 多了 Scheduler（调度器），调度器的作用是调度更新的优先级。

**Fiber 工作流**

1. 每个更新任务都会被赋予一个优先级。

2. 当更新任务抵达调度器时，高优先级的更新任务（记为 A）会更快地被调度进 Reconciler 层；
3. 此时若有新的更新任务（记为 B）抵达调度器，调度器会检查它的优先级，若发现 B 的优先级高于当前任务 A，那么当前处于 Reconciler 层的 A 任务就会被中断，调度器会将 B 任务推入 Reconciler 层。
4. 当 B 任务完成渲染后，新一轮的调度开始，之前被中断的 A 任务将会被重新推入 Reconciler 层，继续它的渲染之旅，即“可恢复”。

### Scheduler 调度器

这个需要上面提到的`requestIdleCallback`，React 团队实现了功能更完备的 `requestIdleCallback` polyfill，这就是 Scheduler。除了在空闲时触发回调的功能外，Scheduler 还提供了多种调度优先级供任务设置。

### Reconciler 协调器

**可中断循环**

在 React 15 中是递归处理虚拟 DOM 的，React 16 则是变成了可以中断的循环过程，每次循环都会调用 shouldYield 判断当前是否有剩余时间。

```javascript
function workLoopConcurrent() {
  // Perform work until Scheduler asks us to yield
  while (workInProgress !== null && !shouldYield()) {
    // workInProgress表示当前工作进度的树。
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

**React 16 是如何解决中断更新时 DOM 渲染不完全的问题呢？**

在 React 16 中，Reconciler 与 Renderer 不再是交替工作。当 Scheduler 将任务交给 Reconciler 后，Reconciler 会为变化的虚拟 DOM 打上的标记。

```javascript
export const Placement = /*             */ 0b0000000000010;
export const Update = /*                */ 0b0000000000100;
export const PlacementAndUpdate = /*    */ 0b0000000000110;
export const Deletion = /*              */ 0b0000000001000;
```

- Placement：表示插入操作

- PlacementAndUpdate：表示替换操作
- Update：表示更新操作
- Deletion：表示删除操作

整个 Scheduler 与 Reconciler 的工作都在内存中进行，所以即使反复中断，用户也不会看见更新不完全的 DOM。只有当所有组件都完成 Reconciler 的工作，才会统一交给 Renderer。

### Renderer 渲染器

Renderer 根据 Reconciler 为虚拟 DOM 打的标记，同步执行对应的 DOM 操作。

## Fiber 架构对生命周期的影响

### 1. 生命周期方法的细化和调整

> 在 Fiber 架构下，React 重新调整了一些生命周期方法，并引入了新的生命周期方法，以便更好地控制组件的挂载和更新过程。

**被废弃的生命周期方法**

- **`componentWillMount`**
- **`componentWillReceiveProps`**
- **`componentWillUpdate`**

这些方法在 Fiber 架构中被标记为不推荐使用（UNSAFE），因为它们容易导致不稳定的行为，特别是在异步渲染过程中。

**新的生命周期方法**

- **`getDerivedStateFromProps`**：这是一个静态方法，替代了 `componentWillReceiveProps`。它在任何时候 props 发生变化时都会被调用，并允许组件根据新的 props 更新其内部状态。
- **`getSnapshotBeforeUpdate`**：这个方法在 DOM 更新之前调用，允许组件在 DOM 发生变化前获取某些信息。该方法的返回值会作为参数传递给 `componentDidUpdate`。

### 2. 生命周期方法的调用时机

> Fiber 架构使得 React 可以在需要时中断和恢复渲染，这对生命周期方法的调用时机有重要影响。

#### 调和阶段（Reconciliation Phase）

- **`constructor`**：在组件实例化时调用，用于初始化状态和绑定事件处理程序。
- **`static getDerivedStateFromProps`**：在每次渲染前调用，用于更新状态。
- **`render`**：这个方法是纯函数，返回要渲染的 React 元素。Fiber 架构确保它可以被频繁调用。

#### 提交阶段（Commit Phase）

- **`componentDidMount`**：在组件第一次挂载后调用。在 Fiber 架构中，这个方法保证在 DOM 更新完成后调用，因此可以安全地操作 DOM。
- **`componentDidUpdate`**：在组件更新后调用，提供了更新前的 props 和 state，以及由 `getSnapshotBeforeUpdate` 返回的任何值。

- **`componentWillUnmount`**：在组件从 DOM 中移除前调用，用于执行清理操作。

### 3. 异步渲染对生命周期方法的影响

> 由于 Fiber 支持异步渲染，组件的生命周期方法可能会被调用多次或不按预期的顺序调用。这尤其影响以下几个方面：

- **`componentWillMount`** 和 **`componentWillUpdate`** 方法容易导致不一致性，因为它们在异步渲染过程中可能被多次调用。因此，这些方法在 Fiber 架构中被标记为不安全，并被新的生命周期方法所取代。

- **`getDerivedStateFromProps`** 和 **`getSnapshotBeforeUpdate`** 方法设计为纯函数且不会产生副作用，因此在异步渲染过程中更加稳定。

### 4. 其他影响

Fiber 架构使得 React 能够更细粒度地控制组件更新和渲染，这也影响了生命周期方法的执行时机。例如，`shouldComponentUpdate` 可以在更细粒度的层次上控制组件是否需要更新，从而提高性能。

### 总结

Fiber 架构对 React 组件生命周期方法的影响主要体现在方法的细化、调用时机的调整和异步渲染的支持上。新的生命周期方法如 `getDerivedStateFromProps` 和 `getSnapshotBeforeUpdate` 提供了更安全和稳定的方式来处理组件的状态和更新，而废弃的生命周期方法则反映了对异步渲染和细粒度控制的适应。通过这些调整，React 能够在不影响性能的情况下，实现更灵活和高效的组件更新机制。

## Fiber 更新过程

虚拟 DOM 更新过程分为 2 个阶段：

1. render/reconciliation 协调阶段(可中断/异步)：通过 Diff 算法找出所有节点变更，例如节点新增、删除、属性变更等等, 获得需要更新的节点信息，对应早期版本的 Diff 过程。
2. commit 提交阶段(不可中断/同步)：将需要更新的节点一次过批量更新，对应早期版本的 patch 过程。

### 协调阶段

在协调阶段会进行 Diff 计算，会生成一棵 Fiber 树。

该阶段开始于 performSyncWorkOnRoot 或 performConcurrentWorkOnRoot 方法的调用。这取决于本次更新是同步更新还是异步更新。

```js
// performSyncWorkOnRoot会调用该方法
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

// performConcurrentWorkOnRoot会调用该方法
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

它们唯一的区别是是否调用`shouldYield`。如果当前浏览器帧没有剩余时间，`shouldYield`会中止循环，直到浏览器有空闲时间后再继续遍历。

**递阶段**

首先从 rootFiber 开始向下深度优先遍历。为遍历到的每个 Fiber 节点调用 beginWork 方法。

当遍历到叶子节点（即没有子组件的组件）时就会进入"归"阶段。

**归阶段**

在"归"阶段会调用 completeWork 处理 Fiber 节点。

completeWork 内部有 3 个关键动作：

- 创建 DOM 节点（CreateInstance）

- 将 DOM 节点插入到 DOM 树中（AppendAllChildren）
- 为 DOM 节点设置属性（FinalizeInitialChildren）

当某个 Fiber 节点执行完 completeWork，如果其存在兄弟 Fiber 节点（即 fiber.sibling !== null），会进入其兄弟 Fiber 的"递"阶段。
如果不存在兄弟 Fiber，会进入父级 Fiber 的"归"阶段。

"递"和"归"阶段会交错执行直到"归"到 rootFiber。至此，协调阶段的工作就结束了。

### 提交阶段

commit 阶段的主要工作（即 Renderer 的工作流程）分为三部分：

- before mutation 阶段，这个阶段 DOM 节点还没有被渲染到界面上去，过程中会触发 getSnapshotBeforeUpdate，也会处理 useEffect 钩子相关的调度逻辑。
- mutation 阶段，这个阶段负责 DOM 节点的渲染。在渲染过程中，会遍历 effectList，根据 flags（effectTag）的不同，执行不同的 DOM 操作。
- layout 阶段，这个阶段处理 DOM 渲染完毕之后的收尾逻辑。比如调用 componentDidMount/componentDidUpdate，调用 useLayoutEffect 钩子函数的回调等。除了这些之外，它还会把 fiberRoot 的 current 指针指向 workInProgress Fiber 树。
