# 组件 Ref 的应用

*类型：knowledge ｜ 难度：基础 ｜ 标签：React、Ref、forwardRef、useImperativeHandle*

**ref 挂在 DOM 元素上拿到的是节点本身，挂在类组件上拿到的是组件实例，挂在函数组件上默认是 undefined——函数组件没有实例。** 要让函数组件支持 ref，必须用 `forwardRef` 转发：要么配合 `useImperativeHandle` 精确控制暴露的内容，要么直接把 ref 挂到内部 DOM 节点上。

## 父组件获取子组件自身 Ref

- 父组件可以获取类子组件 ref（值为子组件实例对象）。
- 父组件无法获取函数子组件 ref（值为 undefined）。

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
    console.log("classChildRef", this.classChildRef); // 执行结果：子组件实例对象
    console.log("functionChildRef", this.functionChildRef); // 执行结果：undefined
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

- 原因：类组件有实例，ref 就是实例；函数组件每次渲染只是重新执行函数，没有实例概念，React 会拒绝并告警。

## forwardRef + useImperativeHandle：控制暴露内容

使用 `forwardRef` 和 `useImperativeHandle` 指定函数组件暴露的内容——ref 拿到的不再是整个组件内部，而是回调返回的对象：

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
    console.log("classChildRef", this.classChildRef); // 执行结果：子组件实例对象
    console.log("functionChildRef", this.functionChildRef); // 执行结果：useImperativeHandle 回调返回的对象
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

- 价值：暴露面由子组件自己声明，内部实现完全封死，避免父组件随意调用子组件内部成员。

## forwardRef：直接转发到 DOM

将 `forwardRef` 的形参 `ref` 直接赋值给内部 DOM 节点或子组件，父组件拿到的就是被转发目标：

```jsx
import React, { useEffect, useRef, forwardRef } from "react";

const Child = forwardRef((props, ref) => {
  console.log("ref", ref); // 调用组件后，传递过来的值为 null
  // 调用 Child 时设置的 ref 属性对应的对象
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
    console.log("childRef", childRef.current); // 指向 Child 内部的 button DOM 节点
  }, []);
  return (
    <div>
      <Child ref={childRef} />
    </div>
  );
}

export default Demo;
```

## 使用要点

- ref 的三种目标对应三种结果：DOM 元素 → 节点本身；类组件 → 实例；函数组件 → 需 `forwardRef`，否则为 null/undefined。
- `useImperativeHandle(ref, () => ({ ... }))` 自定义暴露对象，第一个参数就是 `forwardRef` 的形参 ref。
- 传给函数组件的 ref 在挂载前为 null，读取时机放在 `componentDidMount` 或 `useEffect` 中。
- ref 属于「逃生舱」：命令式操作会绕过 React 的数据流，优先考虑 props/state 能否解决问题。
