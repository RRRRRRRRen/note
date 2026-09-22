# 响应式 API 进阶

*类型：knowledge ｜ 难度：进阶 ｜ 标签：Vue、Vue3、shallowRef、customRef、toRefs、readonly*

**Vue 3 的响应式 API 进阶围绕「控制追踪深度与时机」展开：`shallowRef` / `shallowReactive` 只代理第一层，`triggerRef` 手动强制触发更新，`customRef` 自定义 track/trigger 时机（典型如防抖），`toRef` / `toRefs` 保持解构后的响应性连接，`toRaw` 取回原始对象，`readonly` / `isRef` 提供只读代理与类型判断。**

## Ref 增强

### 1. ref 的 TS 标注

必须使用 `.value` 访问和修改属性值：

```vue
<template>
  <div @click="change">{{ msg1 }}{{ msg2 }}{{ msg3 }}</div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
// 三种等价的类型标注方式
const msg1: Ref<string> = ref('abc')
const msg2 = ref<number>(123)
const msg3 = ref(true)
const change = () => {
  msg1.value = 'def'
}
</script>
```

### 2. shallowRef

浅层 ref：只有 `.value` 的整体替换是响应式的，内部属性变化不被追踪：

```js
import { onMounted, shallowRef } from 'vue'
const msg4 = shallowRef({ vue: 555 })
onMounted(() => {
  // 不具有响应式：只改了内部属性
  msg4.value.vue = 444
  // 具有响应式：整体替换 .value
  msg4.value = { vue: 444 }
})
```

注意：shallowRef 在和 ref 一同使用时，会被 ref 影响导致数据更新。

### 3. triggerRef

手动强制触发 shallowRef 的更新，用于「改了内部属性、又不想整体替换」的场景：

```js
import { onMounted, shallowRef, triggerRef } from 'vue'
const msg4 = shallowRef({ vue: 555 })
onMounted(() => {
  msg4.value.vue = 444
  // 强制更新 ref 响应式
  triggerRef(msg4)
})
```

### 4. customRef

自定义 ref：显式控制依赖追踪（track）与触发更新（trigger）的时机。典型场景是防抖：

```vue
<template>
  <div @click="change">{{ msg }}</div>
</template>

<script setup lang="ts">
import { customRef } from 'vue'

function MyRef<T>(value: T) {
  return customRef((track, trigger) => {
    let time: any = null
    return {
      get() {
        track() // 追踪依赖
        return value
      },
      set(newValue) {
        clearTimeout(time)
        time = setTimeout(() => {
          value = newValue
          trigger() // 触发更新
          time = null
        }, 1000)
      }
    }
  })
}

const msg = MyRef<string>('等待触发')
const change = () => {
  msg.value = '防抖'
}
</script>
```

### 5. ref 获取 DOM

使用 ref 获取 DOM 节点，模板 ref 属性值要和变量名一致：

```vue
<template>
  <div ref="dom">DOM</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
const dom = ref<HTMLDivElement>()
onMounted(() => {
  console.log('dom.value :>> ', dom.value?.innerText)
})
</script>
```

### 6. isRef

用于判断是否为 ref 对象，可判断的类型：ref、customRef、ref DOM。

```js
import { isRef, ref } from 'vue'
const count = ref(0)
isRef(count) // true
```

## reactive 增强

### 1. reactive 基本特征

- 只支持引用类型。
- 不需要使用 `.value` 访问。
- 数组用 push 等方法处理：

```js
import { onMounted, reactive } from 'vue'
const msg = reactive<number[]>([])
onMounted(() => {
  const res = [1, 2, 3]
  msg.push(...res)
})
```

### 2. readonly

创建只读代理：代理本身不可改，但会跟随源对象的变化（改源对象会同步影响只读代理）：

```js
import { reactive, readonly } from 'vue'
const msg = reactive({ vue: 'vue' })
const msg1 = readonly(msg)
// 修改失败，msg1 是只读的
msg1.vue = '123'
// 修改源对象成功，并且 msg1 一同被修改
msg.vue = '123'
```

### 3. shallowReactive

浅层响应式：只有第一层属性是响应式的，嵌套属性的修改不被追踪：

```js
import { shallowReactive } from 'vue'
const msg = shallowReactive({
  a: {
    b: {
      c: 111
    }
  }
})
msg.a = { b: { c: '12' } } // 响应式更新（第一层）
msg.a.b = { c: '12' }      // 不更新（第二层）
```

## toRef 系列

### 1. toRef

- 只能用于响应式对象。
- 会影响原数据（保持响应式连接）。
- 一般用于响应式的传参：

```js
import { onMounted, reactive, toRef } from 'vue'
const msg = reactive({ abc: 123 })
const abc = toRef(msg, 'abc')
onMounted(() => {
  abc.value = 666 // msg.abc 同步变为 666
})
```

### 2. toRefs

类似于 toRef，批量转换对象的所有属性，一般用于解构响应式数据：

```js
import { onMounted, reactive, toRefs } from 'vue'
const msg = reactive({ abc: 123, def: 456 })
const { abc, def } = toRefs(msg)
onMounted(() => {
  abc.value = 666
  def.value = 888
})
```

### 3. toRaw

拿到响应式数据的原始对象（不具有响应式），适合对大对象做只读操作、避免代理开销：

```js
import { reactive, toRaw } from 'vue'
const msg = reactive({ abc: 123, def: 456 })
const msgRaw = toRaw(msg)
```
