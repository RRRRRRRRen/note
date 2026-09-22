# Vue3 响应式：Proxy、track 与 trigger

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、Vue3、响应式原理、Proxy*

**Vue 3 的响应式核心是用 Proxy 替代 Object.defineProperty，配合 ReactiveEffect（替代 Watcher）、`targetMap` + `track` / `trigger` 管理依赖的收集与更新。** 读取属性时 `track` 把副作用函数记进 `WeakMap → Map → Set` 三层结构，写入属性时 `trigger` 取出并重新执行。Proxy 拦截的是「对整个对象的操作」而非「单个属性」，因此新增/删除属性、数组索引都能被感知。

## 核心一：Proxy 实现响应式

Vue 3 的 `reactive` 函数接收一个对象，返回一个代理对象（Proxy），拦截 get/set 等操作。

```js
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key); // 依赖收集：读取时记录当前副作用
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key); // 派发更新：写入后通知对应副作用
      return result;
    }
  });
}
```

相比 Vue 2，Proxy 的优势：

- 支持数组和对象的新增/删除属性（Vue 2 无法拦截新增属性）。
- 支持嵌套结构的懒劫持（按需代理：读取到内层对象时才对其进行代理）。
- 不需要初始化时递归遍历对象所有属性。

## 核心二：依赖收集 track

Vue 3 用一个全局的 WeakMap 结构 `targetMap` 管理依赖关系，`track` 负责在属性被读取时登记当前正在运行的副作用函数。

```ts
const targetMap = new WeakMap();

function track(target, key) {
  const effect = activeEffect; // 当前正在运行的副作用函数
  if (!effect) return;

  let depsMap = targetMap.get(target); // 第一层：原始对象 → Map
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key); // 第二层：属性名 → Set
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(effect); // 登记：属性 → 依赖它的副作用集合
}
```

`targetMap` 的结构可以理解为：

```text
targetMap: {
  target1: {
    key1: Set(effect1, effect2),
    key2: Set(effect3)
  }
}
```

- 第一层用 WeakMap 持有原始对象：当对象没有其他引用时可被垃圾回收，依赖关系随之自动清理。

## 核心三：派发更新 trigger

当响应式数据发生变化时，`trigger` 找出对应的副作用函数并重新执行。

```ts
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key); // 取出依赖该属性的副作用集合
  if (effects) {
    effects.forEach(effect => effect());
  }
}
```

## 完整流程对照

| 步骤 | Vue 2 | Vue 3 |
| --- | --- | --- |
| 劫持方式 | `Object.defineProperty` 逐属性改写 getter/setter | Proxy 代理整个对象，拦截 get/set |
| 依赖管理器 | Dep（每属性一个实例） | targetMap（WeakMap 三层结构） |
| 副作用单元 | Watcher | ReactiveEffect |
| 收集时机 | getter 中 `dep.depend()` | get 拦截中 `track(target, key)` |
| 派发时机 | setter 中 `dep.notify()` | set 拦截中 `trigger(target, key)` |

```text
流程示意：
读取属性 → get 拦截 → track → targetMap[target][key].add(activeEffect)
写入属性 → set 拦截 → trigger → targetMap[target][key] 中的 effect 依次重新执行
```
