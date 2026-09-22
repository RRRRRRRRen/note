# KeepAlive 组件缓存

*类型：knowledge ｜ 难度：基础 ｜ 标签：Vue、KeepAlive、组件缓存、性能优化*

**`<keep-alive>` 是 Vue 的内置抽象组件，用于缓存组件实例：切换时保留状态与 DOM，避免频繁销毁重建。** 被缓存的组件不触发正常的 `created` / `destroyed`，取而代之的是 `activated` / `deactivated`。配合 `include` / `exclude` / `max` 可以精确控制「缓存谁、缓存多少」，配合 `router-view` 是标签页、列表页保活的标配方案。

## 基本作用

`<keep-alive>` 主要用于动态组件的缓存，它可以：

- 缓存已创建的组件实例。
- 在组件切换时保留状态、DOM，不重新渲染。
- 避免重复挂载、销毁逻辑（如 `created`、`mounted` 重复执行）。

## 使用示例

包裹动态组件：

```vue
<keep-alive>
  <component :is="currentView"></component>
</keep-alive>
```

更常见的是包裹 `<router-view>`：

```vue
<keep-alive>
  <router-view></router-view>
</keep-alive>
```

## 生命周期变化

被 `<keep-alive>` 包裹的组件不会触发正常的 `destroyed` 和 `created`，而是：

- 第一次进入：触发 `created`、`mounted`。
- 切换出去：触发 `deactivated`（组件被缓存而非销毁）。
- 再次切换回来：触发 `activated`（组件被复用而非重建）。

- 结论：需要「每次进入都刷新」的逻辑不要写在 `mounted`，应写在 `activated`；一次性初始化才放在 `mounted`。

## 常用属性

| 属性名 | 类型 | 作用说明 |
| --- | --- | --- |
| `include` | String/RegExp/Array | 匹配要缓存的组件名 |
| `exclude` | String/RegExp/Array | 匹配不缓存的组件名 |
| `max` | Number | 最多缓存的组件实例数量（LRU 策略） |

示例：

```vue
<keep-alive :include="['UserView', 'Dashboard']" :max="3">
  <component :is="currentComponent" />
</keep-alive>
```

## 实现原理

- `<keep-alive>` 自身不会渲染 DOM，它维护一个缓存对象 `cache`。
- 被包裹的子组件在第一次渲染后，会被缓存到 `cache` 中。
- 当切换组件时，若缓存中已有该组件实例，会从 `cache` 取出复用，不再重新创建。
- `max` 超限时的淘汰策略是 LRU（最近最久未使用）：最久没有被访问的缓存实例最先被清除。

## 使用建议与注意事项

- 适合缓存表单页、标签页、列表等状态需要保留的组件。
- 被缓存组件的数据应保持响应式，否则更新会失效。
- 注意避免缓存过多导致内存压力过大，可搭配 `max` 控制数量。
- `<keep-alive>` 只能包裹单个子组件。
