# Vue2 响应式：数据劫持与依赖收集

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、Vue2、响应式原理、Object.defineProperty*

**Vue 2 的响应式系统由三个核心协作实现：数据劫持（Object.defineProperty）、依赖收集（Dep）、派发更新（Watcher）。** 初始化时遍历 `data`，把每个属性转成 getter/setter；getter 里收集「谁在用我」（Watcher 进入 Dep），setter 里通知「用我的人更新」（Dep 通知 Watcher）。这条「劫持 → 收集 → 派发」的链路是 Vue2 响应式的全部骨架，也解释了它「新增属性检测不到」的天然缺陷。

## 核心一：数据劫持

Vue 初始化数据时，会对 `data` 对象中的所有属性使用 `Object.defineProperty` 进行劫持，将属性转为带有 getter 和 setter 的形式。

```js
function defineReactive(obj, key, val) {
  const dep = new Dep(); // 每个属性对应一个 Dep 实例

  Object.defineProperty(obj, key, {
    get() {
      dep.depend(); // 收集依赖：属性被读取时，记录当前正在计算的 Watcher
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal;
        dep.notify(); // 通知更新：属性被写入且值变化时，通知所有订阅者
      }
    }
  });
}
```

- 这个函数是 Vue 内部响应式实现的基础。每个属性都被包装成响应式的，能感知 get 和 set 行为。
- 局限也源于此：`Object.defineProperty` 只能劫持「已存在的属性」，新增/删除属性、数组下标赋值都无法被拦截，需要 `$set` / `$delete` 等辅助手段。

## 核心二：依赖收集（Dep）

`Dep` 是依赖管理器，用于收集哪些观察者（Watcher）依赖了当前属性。每个响应式属性都有一个对应的 `Dep` 实例。

```js
class Dep {
  constructor() {
    this.subs = []; // 存放 Watcher 实例
  }

  depend() {
    if (Dep.target) {
      this.subs.push(Dep.target); // 只在「有 Watcher 正在计算」时收集
    }
  }

  notify() {
    this.subs.forEach(sub => sub.update());
  }
}
```

- `Dep.target` 是当前正在计算的 Watcher，用于完成依赖收集。它是模块级的全局变量，同一时刻只指向一个 Watcher。

## 核心三：观察者（Watcher）

Watcher 是观察者对象，在模板渲染、计算属性、watch 函数中都会用到。每个 Watcher 持有一个回调函数，用于数据变更后的视图更新。

```js
class Watcher {
  constructor(updateFn) {
    this.updateFn = updateFn;
    Dep.target = this;     // 把当前 Watcher 设为全局目标
    updateFn();            // 执行更新函数：读取响应式数据，触发 getter，完成依赖收集
    Dep.target = null;     // 清除全局目标
  }

  update() {
    this.updateFn();       // 响应式数据变化时由 Dep.notify 触发
  }
}
```

- 关键机制：Watcher 被创建时会立刻执行 `updateFn` 读取响应式数据，从而触发属性的 getter；getter 中调用 `dep.depend()`，把该 Watcher 收集进对应属性的 Dep。「读取」这个动作本身就是注册依赖的过程。

## 完整执行过程

1. Vue 初始化时遍历 `data`，对每个属性使用 `Object.defineProperty` 转为响应式。
2. 每个属性内部维护一个 `Dep`，用于管理依赖这个属性的 Watcher。
3. 组件渲染或计算属性求值时，会创建一个 Watcher，并通过读取数据完成依赖收集。
4. 数据变化时，setter 调用 `dep.notify()`，触发所有 Watcher 的 `update()`，完成视图更新。

```text
流程示意：
初始化：data 属性 → defineReactive → [getter/setter + Dep]
依赖收集：创建 Watcher → 读取属性 → getter → dep.depend() → subs 收集 Watcher
派发更新：写入属性 → setter → dep.notify() → watcher.update() → 视图更新
```
