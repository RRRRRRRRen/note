# React 生命周期

*类型：knowledge ｜ 难度：基础 ｜ 标签：React、生命周期、类组件*

**React 类组件的生命周期是组件存在期间的一系列方法调用，分为挂载（Mounting）、更新（Updating）、卸载（Unmounting）三个主要阶段，外加错误处理。** 每个阶段的钩子有固定职责与注意事项：挂载后做副作用、更新前可拦截渲染、卸载前必须清理。记住各阶段的调用顺序，是排查「请求发了两次」「定时器没清」这类问题的基本功。

## 挂载阶段（Mounting）

### constructor(props)

- 简介：构造函数，用于初始化组件的状态（state）和绑定事件处理程序。
- 用途：初始化 state，绑定方法。
- 注意事项：必须调用 `super(props)`，避免直接调用 `setState()`。

```jsx
constructor(props) {
  super(props);
  this.state = { counter: 0 };
  this.handleClick = this.handleClick.bind(this);
}
```

### static getDerivedStateFromProps(props, state)

- 简介：在每次渲染前调用，用于使 state 从 props 中同步。
- 用途：根据 props 更新 state。
- 注意事项：返回一个对象来更新 state，或返回 null 表示不更新。是静态方法，不能访问 `this`。

```jsx
static getDerivedStateFromProps(props, state) {
  if (props.someValue !== state.someValue) {
    return { someValue: props.someValue };
  }
  return null;
}
```

### render()

- 简介：React 组件的唯一必需方法，返回 React 元素以描述 UI。
- 用途：定义 UI 结构。
- 注意事项：必须是纯函数，不应修改 state 或与浏览器交互。

```jsx
render() {
  return <div>{this.state.counter}</div>;
}
```

### componentDidMount()

- 简介：在组件挂载后立即调用，适合进行副作用操作。
- 用途：数据获取、订阅事件、操作 DOM。
- 注意事项：可以调用 `setState()`，但应避免导致无限循环。

```jsx
componentDidMount() {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => this.setState({ data }));
}
```

## 更新阶段（Updating）

### static getDerivedStateFromProps(props, state)

- 挂载与更新阶段都会调用，作用与注意事项同上。

### shouldComponentUpdate(nextProps, nextState)

- 简介：决定组件是否重新渲染，用于优化性能。
- 用途：控制是否需要重新渲染。
- 注意事项：返回 true 或 false，默认返回 true。

```jsx
shouldComponentUpdate(nextProps, nextState) {
  return nextState.counter !== this.state.counter;
}
```

### render()

- 重新渲染 UI，要求与挂载阶段一致。

### getSnapshotBeforeUpdate(prevProps, prevState)

- 简介：在更新前捕获一些信息，并在更新后使用。
- 用途：捕获更新前的 DOM 状态。
- 注意事项：返回的值作为 `componentDidUpdate` 的第三个参数。

```jsx
getSnapshotBeforeUpdate(prevProps, prevState) {
  if (prevState.list.length !== this.state.list.length) {
    return { scrollPosition: this.listRef.scrollTop };
  }
  return null;
}
```

### componentDidUpdate(prevProps, prevState, snapshot)

- 简介：在组件更新后立即调用，可进行 DOM 操作或数据获取。
- 用途：基于更新后的 DOM 状态进行操作或数据获取。
- 注意事项：可以调用 `setState()`，但需条件判断避免无限循环。

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

### componentWillUnmount()

- 简介：在组件从 DOM 中移除之前调用，用于清理工作。
- 用途：清理定时器、取消网络请求、移除订阅。
- 注意事项：清理所有在 `componentDidMount` 中创建的订阅和定时器，避免内存泄漏。

```jsx
componentWillUnmount() {
  clearInterval(this.timer);
  this.eventSource.close();
}
```

## 错误处理（Error Handling）

### static getDerivedStateFromError(error)

- 简介：在后代组件抛出错误后调用，允许更新 state 以显示降级 UI。
- 用途：处理错误并更新 state 以显示错误界面。
- 注意事项：是静态方法，不能访问 `this`。返回 state 对象或 null。

```jsx
static getDerivedStateFromError(error) {
  return { hasError: true };
}
```

### componentDidCatch(error, info)

- 简介：在后代组件抛出错误后调用，可用于记录错误信息。
- 用途：记录错误日志或显示错误界面。
- 注意事项：只能捕获后代组件的错误，不能捕获自身的错误。

```jsx
componentDidCatch(error, info) {
  logErrorToMyService(error, info);
}
```

## 生命周期方法的调用顺序总结

- 挂载阶段：
  - `constructor(props)`
  - `static getDerivedStateFromProps(props, state)`
  - `render()`
  - `componentDidMount()`
- 更新阶段：
  - `static getDerivedStateFromProps(props, state)`
  - `shouldComponentUpdate(nextProps, nextState)`
  - `render()`
  - `getSnapshotBeforeUpdate(prevProps, prevState)`
  - `componentDidUpdate(prevProps, prevState, snapshot)`
- 卸载阶段：
  - `componentWillUnmount()`
- 错误处理：
  - `static getDerivedStateFromError(error)`
  - `componentDidCatch(error, info)`

- 补充：`componentWillMount`、`componentWillReceiveProps`、`componentWillUpdate` 已被标记为不安全并更名 `UNSAFE_` 前缀，新代码不要使用；函数组件中没有生命周期方法，对应职责由 `useEffect` / `useLayoutEffect` 承担。
