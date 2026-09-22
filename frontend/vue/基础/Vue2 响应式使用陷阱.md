# Vue2 响应式使用陷阱

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、Vue2、响应式、$set、Object.freeze*

**Vue 2 的响应式基于 `Object.defineProperty`，初始化时递归劫持 `data` 中已有属性——因此「初始化之后新增/删除属性」「数组索引与 length 赋值」「`Object.freeze` 过的对象」都不在追踪范围内，必须用 `$set` / `$delete` 或重写的数组方法操作。** `data` 必须是函数、watch 深层对象要 `deep: true`、computed 不能依赖未初始化属性，这些坑同源。

## 对象相关

### 1. 选项 `data` 必须是函数

原因：

- 每次创建组件实例时，都会调用这个函数，返回一个全新的对象。
- 如果写成对象形式，所有组件实例将共享同一个 `data`，导致数据污染。

错误写法：

```js
export default {
  data: {
    count: 0
  }
}
```

正确写法：

```js
export default {
  data() {
    return {
      count: 0
    }
  }
}
```

### 2. 新增和删除属性不是响应式的

原因：Vue 2 初始化时只对 `data` 中已有属性做响应式处理。

错误写法：

```js
this.obj.newKey = 'abc'  // 不是响应式

delete this.obj.key      // 不是响应式
```

正确写法：

```js
this.$set(this.obj, 'newKey', 'abc')
Vue.set(this.obj, 'newKey', 'abc')

this.$delete(this.obj, 'key')
Vue.delete(this.obj, 'key')
```

### 3. 嵌套对象属性新增也不会响应式

错误写法：

```js
this.user.info = { age: 18 } // 不响应
this.user.info.age = 18      // 不响应
```

正确写法：

```js
this.$set(this.user, 'info', { age: 18 })
```

### 4. 使用 `Object.freeze()` 会让数据变成非响应式

Vue 初始化时检测到属性不可配置（frozen 对象无法重写 getter/setter）会跳过劫持：

```js
data() {
  return {
    frozen: Object.freeze({ a: 1 }) // Vue 不会追踪
  }
}
```

适合用于纯展示的大数据结构：跳过响应式转换本身就是一种性能优化。

## 数组相关

### 1. 修改数组索引和长度，不会触发更新

原因：Vue 2 的响应式系统基于 `Object.defineProperty` 实现，它只能劫持对象的属性访问（getter/setter），而无法监听数组的索引赋值和 length 属性变化。

Vue 2 在初始化数组时，重写了部分变更方法以拦截变更并通知视图更新：

- `push()` / `pop()`
- `shift()` / `unshift()`
- `splice()` / `sort()` / `reverse()`

错误写法：

```js
this.arr[1] = 'new'  // 不响应

this.arr.length = 0  // 不响应
```

正确写法：

```js
this.$set(this.arr, 1, 'new')
this.arr.splice(1, 1, 'new')
this.arr.splice(0, this.arr.length) // 清空数组
```

## watch / computed 相关

### 1. 监听对象需要加 `deep: true` 才能监听内部变更

```js
watch: {
  obj(newVal) { /* 只能监听引用变化 */ },
  // 正确写法
  obj: {
    handler(newVal) { /* ... */ },
    deep: true
  }
}
```

### 2. computed 不能追踪未初始化的属性

依赖在首次求值时收集，之后动态添加的属性没有依赖记录，其变化不会触发重算：

```js
computed: {
  sum() {
    return this.obj.x + this.obj.y // 如果 x/y 是动态添加的，会失效
  }
}
```
