# 特殊组件：递归、动态、Teleport 与 Suspense

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、Vue3、递归组件、动态组件、Teleport、Suspense*

**按组件的使用形态分四类：递归组件在自身模板中引用自己（文件名即组件名，无需 import），适合树形数据；动态组件用 `<component :is>` 在多个组件间切换；Teleport 把组件渲染到指定 DOM 节点（如 body），突破父级层叠上下文；Suspense 为异步组件提供统一的 fallback 展示。**

## 全局组件与局部组件

全局注册后任何组件可用：

```js
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import Child from './components/Child.vue'

const app = createApp(App)
app.component('Child', Child)
app.mount('#app')
```

局部注册：`<script setup>` 中 import 即用：

```vue
<template>
  <div>Father</div>
  <ChildVue />
</template>

<script setup lang="ts">
import ChildVue from './Child.vue'
</script>
```

## 递归组件

组件模板中使用的标签名和文件名一致时不需要引入，可直接自我递归渲染：

```vue
<!-- Father -->
<template>
  <div>Father</div>
  <ChildVue :data="data" />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import ChildVue from './Child.vue'

const data = reactive({
  name: 1,
  children: {
    name: 2,
    children: {
      name: 3
    }
  }
})
</script>
```

```vue
<!-- Child -->
<template>
  <div>Child</div>
  <div>{{ props.data.name }}</div>
  <!-- 标签名和文件名一致，不需要引入 -->
  <Child v-if="props.data.children" :data="props.data.children" />
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})
</script>
```

注意递归必须有终止条件（此处的 `v-if="props.data.children"`），否则会无限递归。

## 动态组件

`<component :is>` 根据数据切换渲染的组件：

```vue
<!-- Father -->
<template>
  <div>Father</div>
  <div @click="change(item.id)" v-for="item in data" :key="item.id">
    {{ item.id }}
  </div>
  <component :is="cpt"></component>
</template>

<script setup lang="ts">
import { markRaw, reactive, shallowRef } from 'vue'
import AVue from './A.vue'
import BVue from './B.vue'
import CVue from './C.vue'
// 使用 shallowRef 节约资源（避免组件对象被深度代理）
const cpt = shallowRef(AVue)
// 使用 markRaw 标记不需要响应式的数据
const data = reactive([
  { cpt: markRaw(AVue), id: 0 },
  { cpt: markRaw(BVue), id: 1 },
  { cpt: markRaw(CVue), id: 2 }
])
const change = (id: number) => {
  cpt.value = data[id].cpt
}
</script>
```

## 异步组件

异步组件会单独打包成 chunk，在用到时才加载：

```vue
<template>
  <AVue />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
// 异步组件会单独打包
const AVue = defineAsyncComponent(() => import('./A.vue'))
</script>
```

详细配置（loading / error 组件、timeout、重试）见《异步组件与 defineAsyncComponent》。

## Suspense

配合异步组件使用：加载过程中展示 `#fallback` 插槽的内容：

```vue
<template>
  <Suspense>
    <template v-slot>
      <AVue />
    </template>
    <template #fallback>
      异步组件加载过程中显示这个插槽的内容
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
// 异步组件会单独打包
const AVue = defineAsyncComponent(() => import('./A.vue'))
</script>
```

## Teleport

把组件的 DOM 传送到指定节点渲染：

```vue
<template>
  <!-- to : 指定挂载的节点位置 -->
  <!-- disabled : 是否开启传送 -->
  <Teleport to="body" :disabled="false">
    <AVue />
  </Teleport>
</template>

<script setup lang="ts">
import AVue from './A.vue'
</script>
```

典型场景：弹窗、通知等浮层挂在 body 下，避免被父级的 transform / overflow 影响。

## keep-alive

keep-alive 可以缓存组件状态；`exclude` 不缓存、`include` 只缓存：

```vue
<template>
  <button @click="changebtn">切换</button>
  <keep-alive>
    <AVue v-if="flag" />
    <BVue v-else />
  </keep-alive>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AVue from './A.vue'
import BVue from './B.vue'
const flag = ref(true)
const changebtn = () => {
  flag.value = !flag.value
}
</script>
```

被缓存组件的生命周期变化：mounted 只执行一次，unmounted 不执行；进入时触发 `onActivated`、离开时触发 `onDeactivated`：

```vue
<template>
  <div>A</div>
</template>

<script setup lang="ts">
import { onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'

onMounted(() => {
  // 只执行一次
  console.log('onMounted')
})
onUnmounted(() => {
  // 不执行
  console.log('onUnmounted')
})
onActivated(() => {
  // 进入时触发
  console.log('onActivated')
})
onDeactivated(() => {
  // 离开时触发
  console.log('onDeactivated')
})
</script>
```

完整原理与 include / exclude / max 属性见《KeepAlive 组件缓存》。
