# Vue2 生命周期与父子执行顺序

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、Vue2、生命周期*

**Vue 2 生命周期分四个阶段八个钩子：创建（beforeCreate → created）、挂载（beforeMount → mounted）、更新（beforeUpdate → updated）、销毁（beforeDestroy → destroyed）。父子组件嵌套时遵循「父先创建、子先挂载；更新与销毁都子先完成」的规律——mounted 父组件最后执行，因此要在父 mounted 后才能保证所有子组件挂载完毕。** Vue 3 仅把销毁系列改名为 `beforeUnmount` / `unmounted`，顺序规律不变。

## Vue 2 生命周期钩子

| 钩子函数 | 说明 |
| --- | --- |
| `beforeCreate` | 实例初始化完成，`data` / `props` / `methods` 尚未初始化 |
| `created` | 实例已创建，`data` 可用，未挂载到 DOM |
| `beforeMount` | 组件模板编译完成，DOM 未渲染 |
| `mounted` | DOM 挂载完成，可以操作 DOM |
| `beforeUpdate` | 数据更新前，DOM 仍是旧的 |
| `updated` | 视图更新后，DOM 已同步 |
| `beforeDestroy` | 实例销毁前调用，此时组件仍可访问（适合清除定时器、解绑事件） |
| `destroyed` | 实例销毁后，所有绑定、事件监听器等被移除 |

### 执行顺序

```text
创建阶段：
beforeCreate → created

挂载阶段：
beforeMount → mounted

更新阶段：
beforeUpdate → updated

销毁阶段：
beforeDestroy → destroyed
```

## Vue 3 中的对应关系

Vue 3 选项式 API 与 Vue 2 一致，仅将销毁系列钩子改名：

| Vue 2 名称 | Vue 3 对应名称 |
| --- | --- |
| `beforeDestroy` | `beforeUnmount` |
| `destroyed` | `unmounted` |

组合式 API 对应关系：

| 组合式函数名 | 选项式名称 |
| --- | --- |
| `onBeforeMount` | `beforeMount` |
| `onMounted` | `mounted` |
| `onBeforeUpdate` | `beforeUpdate` |
| `onUpdated` | `updated` |
| `onBeforeUnmount` | `beforeUnmount` |
| `onUnmounted` | `unmounted` |
| `onActivated` | `activated`（配合 keep-alive） |
| `onDeactivated` | `deactivated`（配合 keep-alive） |

```js
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

onMounted(() => {
  console.log('组件已挂载')
})
```

## 父子组件生命周期钩子执行顺序

### 1. 挂载阶段

```text
父 beforeCreate
父 created
  子 beforeCreate
  子 created

  子 beforeMount
父 beforeMount
  子 mounted
父 mounted
```

规律：created 由父到子，mounted 由子到父——父组件先完成初始化才能渲染子组件，而子组件先挂载完毕后父组件才算挂载完成。

### 2. 更新阶段

```text
父 beforeUpdate
  子 beforeUpdate

  子 updated
父 updated
```

### 3. 销毁阶段

```text
父 beforeDestroy / beforeUnmount
  子 beforeDestroy / beforeUnmount

  子 destroyed / unmounted
父 destroyed / unmounted
```

规律：销毁由外向内触发、由内向外完成——父组件先收到销毁通知，子组件先完成销毁。
