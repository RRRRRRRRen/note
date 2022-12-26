# Vue3

## 模板语法

```vue
<template>
  <!-- script声明的顶级变量 -->
  <div>{{ message }}</div>
  <!-- 表达式 -->
  <div>{{ message == 0 ? '我是小满0' : '我不是小满other' }}</div>
  <div>{{ message  + 1 }}</div>
  <div>{{ message.split('，') }}</div>
</template>
 
<script setup lang="ts">
const message = "我是小满"
</script>
```



## 指令

### 常用指令

```markdown
v-text： 用来显示文本
v-html： 用来展示富文本
v-if： 用来控制元素的显示隐藏（切换真假DOM）
v-else-if： 表示 v-if 的“else if 块”。可以链式调用
v-else： v-if条件收尾语句
v-show： 用来控制元素的显示隐藏（display none block Css切换）
v-on： 简写@ 用来给元素添加事件
v-bind： 简写:  用来绑定元素的属性Attr
v-model： 双向绑定
v-for： 用来遍历元素
```

### v-on修饰符

```markdown
@click.stop： 停止冒泡
@submit.prevent: 阻止默认事件
@click.self: 仅当 event.target 是元素本身时才会触发事件处理器
@click.capture: 捕获模式
@click.once: 仅触发一次
@scroll.passive: 提前告诉浏览器不拦截默认事件
```

### 绑定style

```vue
<!-- 绑定对象：小驼峰命名 -->
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
<!-- 绑定对象：连字符命名 -->
<div :style="{ 'font-size': fontSize + 'px' }"></div>
<!-- 绑定对象数组，解析的时候会合并对象 -->
<div :style="[baseStyles, overridingStyles]"></div>
```

### 绑定class

```vue
<!-- 绑定对象：属性值为布尔值的对象 -->
<div :class="{ active: isActive }"></div>
<!-- 绑定数组：可以使用表达式赋空 -->
<div :class="[isActive ? activeClass : '', errorClass]"></div>
<!-- 绑定对象数组：多个对象或者字符串 -->
<div :class="[{ active: isActive }, errorClass]"></div>
<!-- :class 指令也可以和一般的 class attribute 共存 -->
<div
  class="static"
  :class="{ active: isActive, 'text-danger': hasError }"
></div>
```

### 组件上绑定class

```vue
<!-- 【根节点唯一时：不需要在子组件中申明接受，直接赋值到根节点】 -->
<!-- 子组件模板 -->
<p class="foo bar">Hi!</p>
<!-- 在使用组件时 -->
<MyComponent class="baz boo" />
<!-- 渲染出的 HTML -->
<p class="foo bar baz boo">Hi</p>

<!-- 【根节点不唯一时：需要在子组件中使用$attrs.class申明接受】 -->
<!-- 子组件模板 -->
<p :class="$attrs.class">Hi!</p>
<span>This is a child component</span>
<!-- 在使用组件时 -->
<MyComponent class="baz" />
<!-- 渲染出的 HTML -->
<p class="baz">Hi!</p>
<span>This is a child component</span>
```



## ref

### ref

```vue
<!-- ref不同的ts表示 -->
<template>
  <div @click="change">{{ msg1 }}{{ msg2 }}{{ msg3 }}</div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
const msg1: Ref<string> = ref('abc')
const msg2 = ref<number>(123)
const msg3 = ref(true)
// 必须使用.value访问和修改属性值
const change = () => {
    msg1.value = 'def'
}
</script>
```

### shallowRef

```js
// 注意：shallowRef在和ref一同使用时，会被ref影响导致数据更新
import { onMounted, shallowRef } from 'vue'
const msg4 = shallowRef({ vue: 555 })
onMounted(() => {
  // 不具有响应式
  msg4.value.vue = 444
  // 具有响应式
  msg4.value =  { vue: 444 }
})
```

### triggerRef

```js
import { onMounted, shallowRef, triggerRef } from 'vue'
const msg4 = shallowRef({ vue: 555 })
onMounted(() => {
  msg4.value.vue = 444
  // 强制更新ref响应式
  triggerRef(msg4)
})
```

### customRef

```vue
<!-- 防抖案例 -->
<template>
  <div @click="change">{{msg}}</div>
</template>

<script setup lang="ts">
import { customRef } from 'vue'
function MyRef<T>(value: T) {
  return customRef((track, trigger) => {
    let time: any = null
    return {
      get() {
        track()
        return value
       },
      set(newValue) {
        clearTimeout(time)
        time = setTimeout(() => {
          value = newValue
          trigger()
          time = null
        }, 1000);
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

### ref DOM

```vue
<!-- 使用ref获取dom节点，属性值要和变量名一致 -->
<template>
  <div ref="dom">DOM</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
const dom = ref<HTMLDivElement>()
onMounted(() => {
  console.log('dom.value :>> ', dom.value?.innerText);
})
</script>
```

### isRef

```js
// 用于判断是否为ref对象，可以判断如下类型
// ref、customRef、ref DOM
```



## reactive

### reactive

```js
// 只支持引用类型
// 不需要使用.value访问
// 使用push等方式处理数组
import { onMounted, reactive } from 'vue'
const msg = reactive<number[]>([])
onMounted(() => {
  const res = [1, 2, 3]
  msg.push(...res)
})
```

### readOnly

```js
import { reactive, readonly } from 'vue'
const msg: { vue: string } = reactive({ vue: 'vue' })
const msg1 = readonly(msg)
// 修改失败，msg1是只读的
msg1.vue = '123'
// 修改成功并且会影响msg1，导致一同被修改
msg.vue = '123'
```

### shallowReactive

```js
// 注意：shallowReactive在和reactive一同使用时，会被ref影响导致数据更新
import { shallowReactive } from 'vue'
const msg: any = shallowReactive({
  a: {
    b: {
      c: 111
    }
  }
})
msg.a = { b: { c: '12'}} // 响应式更新
msg.a.b = { c: '12'} // 不更新
```



## toRef

### toRef

```js
// 只能用于响应式对象
// 会影响原数据
// 一般用于响应式的传参
import { onMounted, reactive, toRef } from 'vue';
const msg = reactive({abc: 123})
const abc = toRef(msg, 'abc')
onMounted(() => {
  abc.value = 666
})
```

### toRefs

```js
// 类似于toRef
// 一般用于解构响应式数据
import { onMounted, reactive, toRefs } from 'vue';
const msg = reactive({abc: 123, def: 456})
const {abc, def} = toRefs(msg)
onMounted(() => {
  abc.value = 666
  def.value = 888
})
```

### toRaw

```js
// 拿到响应式数据的原始值（不具有响应式）
import { reactive, toRaw } from 'vue';
const msg = reactive({abc: 123, def: 456})
const msgRaw = toRaw(msg)
```



## computed

```vue
<template>
  <input type="text" v-model="firstName">
  <input type="text" v-model="lastName">
  <div>{{ name1 }}</div>
  <input type="text" v-model="name2">
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
let firstName = ref('')
let lastName = ref('')
const name1 = computed(() => {
  return firstName.value + '--' + lastName.value
})
// 可以使用get、set模式编写
const name2 = computed({
  set(value:string) {
    const arr = value.split('--')
    firstName.value = arr[0]
    lastName.value = arr[1]
  },
  get() {
    return firstName.value + '--' + lastName.value
  }
})
</script>
```



## watch

### watch

```vue
<!-- 监听单个或者多个值 -->
<template>
  <input type="text" v-model="firstName">
  <input type="text" v-model="lastName">
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';
let firstName = ref('')
let lastName = ref('')
// 监听多个值
watch(firstName, (v,ov) => {
  console.log('监听单个值v, ov :>> ', v, ov);
})
// 监听单个值
watch([firstName, lastName], (v,ov) => {
  console.log('监听多个值v, ov :>> ', v, ov);
})
</script>
```

```js
<!-- 深度监听 -->
import { watch, ref, onMounted, reactive } from 'vue';

let msg1 = ref({a: {b: {c: '123'}}})
let msg2 = reactive({ a: { b: { c: '123' } } })

// 必须添加deep配置
watch(msg1, (v,ov) => {
  console.log('监听ref深层对象属性 :>> ', v, ov);
}, { deep: true })

// 默认开启deep
watch(msg2, (v,ov) => {
  console.log('监听reactive深层对象属性 ', v, ov);
})

onMounted(() => {
  msg1.value.a.b.c = '678'
  msg2.a.b.c = '999'
})
```

```js
<!-- 监听属性值 -->
import { watch, ref, onMounted } from 'vue'

let msg1 = ref({ a: { b: { c: '123' } } })

// 必须使用getter函数形式
watch(
  () => msg1.value.a.b.c,
  (v, ov) => {
    console.log('监听ref深层对象属性 :>> ', v, ov)
  }
)

onMounted(() => {
  msg1.value.a.b.c = '678'
})
```

```js
// 配置项
watch(
  () => msg1.a,
  (v, ov) => {
    // ...
  }, {
    deep: true, // 深度监听
    immediate: true, // 立即执行监听
    flush: 'pre' // pre组件更新前调用，sync同步调用，post组件更新后调用
  }
)
```

### watchEffect

```vue
<template>
  <div @click="change">{{ msg1 }}</div>
</template>

<script setup lang="ts">
// 立即运行一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行。
// 返回一个停止监听的函数
import { reactive, watchEffect } from 'vue'

let msg1 = reactive({ a: 123 })
const stop = watchEffect((cleanUp) => {
  console.log('收集依赖 :>> ', msg1.a);
  cleanUp(() => {
    console.log('清除副作用的操作,第二次执行前调用');
  })
},{ flush: 'post'})

const change = () => {
  msg1.a++
  // 停止监听
  stop()
}
</script>
```



## 生命周期

```vue
<template>
  <div @click="change" ref="dom">{{ msg }}</div>
</template>

<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref } from 'vue';

const msg = ref('ren')
const dom = ref<HTMLDivElement>()
const change = () => {
  msg.value = 'guo'
}
// 挂在前：拿不到dom节点
onBeforeMount(() => {
  console.log('onBeforeMount dom.innerText :>> ', dom.value?.innerText); // undefined
})
// 挂载后
onMounted(() => {
  console.log('onMounted dom.innerText :>> ', dom.value?.innerText); // ren
})
// 更新前
onBeforeUpdate(() => {
  console.log('onBeforeUpdate dom.innerText :>> ', dom.value?.innerText); // ren
})
// 更新后
onUpdated(() => {
  console.log('onBeforeUpdate dom.innerText :>> ', dom.value?.innerText); // guo
})
// 卸载前
onBeforeUnmount(() => {
  console.log('onBeforeUnmount dom.innerText :>> ', dom.value?.innerText); // guo
})
// 卸载后
onUnmounted(() => {
  console.log('onUnmounted dom.innerText :>> ', dom.value?.innerText); // undefined
})
</script>
```

## CSS功能

### 组件作用域

```vue
<style scoped>
.example {
  color: red;
}
</style>
```

### 深度选择器

```vue
<style scoped>
.a :deep(.b) {
  /* ... */
}
</style>
```



## 父子组件传参

### 父传子

```vue
<!-- Father -->
<template>
  <div>Father</div>
  <ChildVue :title="title" />
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import ChildVue from './Child.vue'
const title = ref('ren')
</script>
```

```vue
<!-- Child -->
<template>
  <div>Child</div>
  <div>{{ props.title }}{{ props.arr }}</div>
</template>

<script setup lang="ts">
// JS定义
const props = defineProps({
  title: {
    type: String,
    default: 'renguoqiang',
    required: true
  },
  arr: {
    type: Array,
    default: [2, 3, 4],
    required: false
  }
})
// TS定义
const props = withDefaults(
  defineProps<{
    title: string,
    arr?: number[]
  }>(),
  {
    title: () => 'renguoqiang',
    arr: () => [2,3,4]
  }
)
</script>
```

### 子传父

```vue
<template>
  <div>Father</div>
  <ChildVue @on-click="getPayload" @on-input="getPayload"/>
</template>

<script setup lang="ts">
import ChildVue from './Child.vue'

const getPayload = (payload: string) => {
  console.log('payload :>> ', payload);
}
</script>
```

```vue
<!-- Child -->
<template>
  <div>Child</div>
  <input type="text" @click="onClick" @input="onInput" />
</template>

<script setup lang="ts">
// js 声明
const emit = defineEmits(['on-click', 'on-input'])
// ts 声明
const emit = defineEmits<{
  (e: 'on-click', payload: string): void
  (e: 'on-input', payload: string): void
}>()
const onClick = () => {
  emit('on-click', 'payload-click')
}
const onInput = () => {
  emit('on-input', 'payload-input')
}
</script>
```

### 子组件暴露

```vue
<template>
  <div>Father</div>
  <ChildVue ref="dom" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ChildVue from './Child.vue'
// ts 声明方式
const dom = ref<InstanceType<typeof ChildVue>>()
onMounted(() => {
  dom.value?.func()
})
</script>
```

```vue
<!-- Child -->
<template>
  <div>Child</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const msg = ref('ren')
const func = () => {
  console.log('msg :>> ', msg);
}
defineExpose({
  msg,
  func
})

</script>
```



## 组件类型

### 全局组件

```js
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import Child from './components/Child.vue'

const app = createApp(App)
app.component('Child', Child)
app.mount('#app')
```

### 局部组件

```vue
<template>
  <div>Father</div>
  <ChildVue/>
</template>

<script setup lang="ts">
import ChildVue from './Child.vue'
</script>
```

### 递归组件

```vue
<!-- Father -->
<template>
  <div>Father</div>
  <ChildVue :data="data"/>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import ChildVue from './Child.vue'

const data = reactive({
  name: 1,
  children: {
    name: 2,
    children: {
      name:3
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
  <Child v-if="props.data.children" :data="props.data.children"/>
</template>

<script setup lang="ts">
const props = defineProps({
  data: {
    type: Object,
    required: true,
  }
})
</script>
```

### 动态组件

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
// 使用shallowRef节约资源
const cpt = shallowRef(AVue)
// 使用markRaw标记不需要响应式的数据
const data = reactive([
  { cpt: markRaw(AVue), id: 0 },
  { cpt: markRaw(BVue), id: 1 },
  { cpt: markRaw(CVue), id: 2 },
])
const change = (id: number) => {
  cpt.value = data[id].cpt
}
</script>
```

### 异步组件

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

### Suspense

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

### Teleport

```vue
<template>
  <!-- to : 指定挂在的节点位置 -->
  <!-- disabled : 是否开启传送 -->
  <Teleport to="body" :disabled="false">
    <AVue />
  </Teleport>
</template>

<script setup lang="ts">
import AVue from './A.vue'
</script>
```



## 插槽

```vue
<!-- child -->
<template>
  <div class="header">
    <slot name="header"></slot>
  </div>
  <div class="main">
    <slot></slot>
  </div>
  <div class="footer">
    <slot name="footer" :data="data" :obj="obj"></slot>
  </div>

</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
const data = ref('AAA')
const obj = reactive({a: 123})
</script>
```

```vue
<!-- Father -->
<template>
  <AVue>
    <template #header>头部插槽</template>
    <template v-slot>默认插槽</template>
    <template v-slot:[slotName]="{ data, obj }">尾部插槽{{ data }}{{ obj }}</template>
  </AVue>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AVue from './A.vue'
const slotName = ref('footer')
</script>
```



## keep-alive

### keep-alive

```vue
<template>
  <button @click="changebtn">切换</button>
  <!-- keep-alive 可以缓存组件状态 -->
  <!-- 属性：exclude 不缓存 -->
  <!-- 属性：include 只缓存 -->
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

### 生命周期

```vue
<template>
  <div>A</div>
</template>

<script setup lang="ts">
import { onActivated, onDeactivated, onMounted, onUnmounted } from 'vue';

onMounted(() => {
  // 只执行一次
  console.log('onMounted');
})
onUnmounted(() => {
  // 不执行
  console.log('onUnmounted');
})
onActivated(() => {
  // 进入时触发
  console.log('onAcitvated');
})
onDeactivated(() => {
  // 离开时触发
  console.log('onDeactivated');
})
</script>
```



## transiton

### 类名规则

```js
// v-enter-from：进入动画的起始状态

// v-enter-active：进入动画的生效状态

// v-enter-to：进入动画的结束状态

// v-leave-from：离开动画的起始状态

// v-leave-active：离开动画的生效状态

// v-leave-to：离开动画的结束状态

// 注意： v 用来指代标签name属性的值
```

### 自定义类名

```vue
<!-- Father -->
<template>
  <button @click="changebtn">切换</button>
  <keep-alive>
    <!-- appear: 初次进入就加载动画 -->
    <!-- 用于自定义类名，配合动画库做快捷动画的实现。例如animate.css -->
    <!-- enterFromClass?: string
    enterActiveClass?: string
    enterToClass?: string
    appearFromClass?: string
    appearActiveClass?: string
    appearToClass?: string
    leaveFromClass?: string
    leaveActiveClass?: string
    leaveToClass?: string -->
    <Transition name="test" appear>
      <AVue v-if="flag" />
    </Transition>
  </keep-alive>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AVue from './A.vue'
const flag = ref(true)
const changebtn = () => {
  flag.value = !flag.value
}
</script>

<style scoped>
.test-enter-from,
.test-leave-to {
  top: 15px;
  right: 20px;
}

.test-enter-active,
.test-leave-active {
  transition: all 1s ease;
}
</style>

```

### 生命周期与事件

```js
@before-enter
@before-leave
@enter
@leave
@appear
@after-enter
@after-leave
@after-appear
@enter-cancelled
@leave-cancelled (v-show only)
@appear-cancelled
```

### transition-group

```vue
<template>
  <button @click="changebtn(1)">增加</button>
  <button @click="changebtn(-1)">减少</button>
  <!-- 使用animate.css 动画库提供的效果 -->
  <TransitionGroup
    enter-active-class="animate__animated animate__zoomIn"
    leave-active-class="animate__animated animate__zoomOut"
  >
    <AVue v-if="flag" v-for="item in itemNum" :key="item" />
  </TransitionGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AVue from './A.vue'
const flag = ref(true)
const itemNum = ref(4)
const changebtn = (num: number) => {
  itemNum.value = itemNum.value + num
}
</script>
```



## provide/inject

```vue
<!-- 父级 -->
<template>
  <div>
    <HelloWorldVue />
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import HelloWorldVue from './components/Father.vue'
const value = ref('ren')
provide('value', value)
</script>
```

```vue
<!-- 子孙级 -->
<template>
  <div>{{ value }}</div>
</template>

<script setup lang="ts">
import { inject, Ref } from 'vue'
const value = inject<Ref<string>>('value')
</script>
```



## mitt

### 注册功能

```ts
// 挂载在vue的实例方案
import { createApp } from 'vue'
import App from './App.vue'
import mitt from 'mitt'

const app = createApp(App)

const Mit = mitt()
// 补充ts声明
declare module 'vue' {
  export interface ComponentCustomProperties {
    eventBus: typeof Mit
  }
}
// 挂载到vue全局变量
app.config.globalProperties.eventBus = Mit

app.mount('#app')
```

```ts
import mitt from 'mitt';

const emitter = mitt();

export default emitter;
```

### 使用

```vue
<template>
  <button @click="changebtn(1)">增加</button>
  <button @click="changebtn(-1)">减少</button>
  <AVue v-for="item in itemNum" :key="item" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import eventBus from './mitt'
import AVue from './A.vue'

const itemNum = ref(4)
const changebtn = (num: number) => {
  itemNum.value = itemNum.value + num
  // 使用emit派发事件
  eventBus.emit('goEmit', itemNum)
}
</script>
```

```vue
<template>
  <div>ren</div>
</template>

<script setup lang="ts">
import eventBus from './mitt'

// 使用on触发事件
eventBus.on('goEmit', (payload) => {
  console.log('payload :>> ', payload);
})
// 使用off删除事件
onBeforeUnmount(() => {
  eventBus.off('goEmit')
})
</script>
```



## v-model

```vue
<!-- Father -->
<template>
  <button @click="change">关闭</button>
  {{ flag }}
  <AVue v-model="flag" v-model:text.isOK="text"/>
  {{ text }}
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AVue from './A.vue'

const flag = ref(true)
const text = ref('ren')
const change = () => {
  flag.value = !flag.value
}
</script>
```

```vue
<!-- Child -->
<template>
  <div>
    <button @click="onClose">关闭</button>
    <div>{{ props.modelValue }}</div>
    <input type="text" @input="onInput" :value="props.text"/>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean,
  },
  text: {
    type: String,
  },
  textModifiers: {
    type: Object
  }
})
const emit = defineEmits(['update:modelValue', 'update:text'])
// 默认v-model => update:modelValue
const onClose = () => {
  emit('update:modelValue', !props.modelValue)
}
// 自定义v-model:name => update:name
const onInput = (e: Event) => {
  // 自定义修饰符使用nameModifiers定义即可
  console.log('props.textModifiers.isOK :>> ', props.textModifiers!.isOK);
  const target = e.target as HTMLInputElement
  emit('update:text', target.value)
}
</script>
```



## 自定义指令

### 生命周期

```vue
<!-- Father -->
<template>
  <div v-bgc:aaa.bbb="'ccc'">关闭</div>
</template>

<script setup lang="ts">
import { Directive } from 'vue'
const vBgc: Directive = {
  created() {
    console.log('created')
  },
  beforeMount() {
    console.log('beforeMount')
  },
  mounted(el, bingding) {
    console.log('mounted')
    // 当前绑定的元素
    console.log('el :>> ', el)
    // 包含 arg：aaa、modifiers：bbb、value：ccc 等
    console.log('bingding :>> ', bingding) 
  },
  beforeUpdate() {
    console.log('beforeUpdate')
  },
  updated() {
    console.log('updated')
  },
  beforeUnmount() {
    console.log('beforeUnmout')
  },
  unmounted() {
    console.log('unmounted')
  },
}
</script>
```

### 函数简写

```vue
<!-- Father -->
<template>
  <div v-bgc:aaa.bbb="'ccc'">关闭</div>
</template>

<script setup lang="ts">
import { Directive, DirectiveBinding } from 'vue'
const vBgc: Directive = (el: HTMLElement, bingding: DirectiveBinding) => {
  console.log('el :>> ', el);
  console.log('bingding :>> ', bingding);
}
</script>
```



## hooks

```js
// 本质就是个复用函数
```



## 全局变量/函数

```ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// 补充ts声明
type Filter = {
  format<T>(str: T): string
}
declare module 'vue' {
  export interface ComponentCustomProperties {
    $env: string
    $filters: Filter
  }
}
// 挂载到vue全局变量
app.config.globalProperties.$env = 'env'
app.config.globalProperties.$filters = {
  format<T>(str: T) {
    return `${str} - ren`
  },
}

app.mount('#app')
```

```vue
<!-- Father -->
<template>
  <!-- 模板上可以直接使用 -->
  <div >{{ $env}}</div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';
// ts中使用需要引入实例
const instance = getCurrentInstance()
const result = instance?.proxy?.$filters.format('ren')
console.log('result :>> ', result);
</script>
```



## 插件

```js
// 一个插件可以是一个拥有 install() 方法的对象
```



## h

```vue
<template>
  <Btn @on-click="getBtn" />
</template>

<script setup lang="ts">
import { h } from 'vue'
type Props = {
  text: string
}
const Btn = (props: Props, ctx: any) => {
  return h(
    'div',
    {
      class: 'class-a',
      onClick: () => {
        ctx.emit('on-click', '参数')
      },
    },
    props.text
  )
}

const getBtn = (str: string) => {
  console.log('str :>> ', str)
}
</script>
```



# Pinia

## 初始化

### 安装

```bash
npm install pinia
```

### 注册

```ts
import { createApp } from 'vue'
import App from './App.vue'
import {createPinia} from 'pinia'
const store = createPinia()

const app = createApp(App)

app.use(store)

app.mount('#app')
```



## 创建仓库

### 创建

```ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state() {
    return {
      name: 'ren',
      age: '23',
    }
  },
  getters: {},
  actions: {},
})
```

### 组件上使用

```vue
<template>
  <div>
    {{ UserStore.name }} - {{ UserStore.age }}
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from './store/store-user'
const UserStore = useUserStore()
</script>
```



## 使用

### 响应式解构

```vue
<template>
  <div>
    <button @click="change">修改</button>
    {{ UserStore.name }} - {{ UserStore.age }}
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from './store/store-user'
import { storeToRefs } from 'pinia'
const UserStore = useUserStore()
// storeToRefs 传入 store即可结构出具有响应式的ref对象
const { name } = storeToRefs(UserStore)
const change = () => {
  name.value = 'renguoqiang'
}
</script>
```

### state

```vue
<template>
  <div>
    <button @click="change">修改</button>
    {{ UserStore.name }} - {{ UserStore.age }}
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from './store/store-user'
const UserStore = useUserStore()

onMounted(() => {
  // 1. 支持直接修改
  UserStore.name = 'renguoqiang'
})

const change = () => {
  // 2. $patch 批量修改
  UserStore.$patch({
    name: 'pan',
    age: '22',
  })
  // 3. $patch 函数式批量修改
  UserStore.$patch(state => {
    state.name = 'ding'
    state.age = '67'
  })
  // 4. $state 全部覆盖（不推荐）
  UserStore.$state = {
    name: 'shi',
    age: '67',
  }
  // 5. 直接调用action修改
  UserStore.setName('rrrren')
}
</script>
```

### action

```ts
import { defineStore } from 'pinia'

type User = {
  name: string
  age: string
}

const Login = (): Promise<User> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        name: 'renguoqiang',
        age: '28',
      })
    }, 1000)
  })
}

export const useUserStore = defineStore('user', {
  state() {
    return {
      user: <User>{},
      name: '',
    }
  },
  getters: {},
  actions: {
    async login() {
      // 支持异步的async
      const user = await Login()
      this.user = user
      // 可以调用其他actions
      this.setName(user.name)
    },
    setName(name: string) {
      this.name = name
    },
  },
})
```

### getter

```ts
  state() {
  // ...
  },
  getters: {
    // 可以连用其他getters
    newName(): string {
      // 读取值的时候不需要执行函数
      return `${this.user.name} - ${this.newAge}`
    },
    newAge(): string {
      return this.user.age
    }
  }
```

### 实例方法

```vue
<template>
  <div>
    <button @click="change">修改</button>
    {{ UserStore.newName}}
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from './store/store-user'
const UserStore = useUserStore()
const change = () => {
  // 重置state
  UserStore.$reset()
  // state改变的回调
  UserStore.$subscribe(() => {
    // 。。。
  })
  // action触发的回调
  UserStore.$onAction(() => {
    // 。。。
  })
}
</script>
```



# Vue Router

## 初始化

### 安装

```bash
npm i vue-router@4
```

### 注册

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/father',
      name: 'father',
      component: () => import('../components/Father.vue'),
    },
  ],
})

export default router
```

```vue
<!-- App.vue -->
<template>
  <RouterView />
</template>

<script setup lang="ts"></script>
```

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router/index'
const store = createPinia()

const app = createApp(App)

app.use(store)
// 使用use注册路由
app.use(router)
app.mount('#app')
```

##  router-link

### `<router-link>`

```vue
<template>
  <!-- router name 访问 -->
  <RouterLink to="father">father1</RouterLink>
  <!-- router path 访问 -->
  <RouterLink to="/father">father2</RouterLink>
  <!-- 对象命名访问 -->
  <RouterLink :to="{name: 'father'}">father3</RouterLink>
  <RouterView />
</template>

<script setup lang="ts"></script>
```

### 编程式导航

```vue
<template>
<button @click="goRouter">跳转</button>
  <RouterView />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
// 使用 useRouter 注册路由工具
const router = useRouter()
const goRouter = () => {
  // 直接传递path
  router.push('/father')
  // 使用对象path
  router.push({
    path: '/father'
  })
  // 使用对象name
  router.push({
    name: 'father'
  })
}
</script>
```



## 历史记录

```vue
<template>
  <button @click="goRouter">跳转</button>
  <RouterView />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
// 使用 useRouter 注册路由工具
const router = useRouter()
const goRouter = () => {
  // push一条历史记录
  router.push('/father')
  // 替换一条历史记录
  router.replace('/father')
  // 前进或者返回n条记录
  router.go(1)
  // 后退
  router.back()
}
</script>
```



## 路由传参

### query参数

```vue
<!-- App.vue -->
<template>
  <button @click="goRouter">跳转</button>
  <RouterView />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goRouter = () => {
  router.push({
    // 使用name 或者 path 都可以携带query参数
    name: 'father',
    path: '/father',
    query: {
      name: 'ren',
      age: 27
    }
  })
}
</script>
```

```vue
<!-- Father.vue -->
<template>
  <div>
    {{ route.query.name }}
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
// 使用useRoute获取当前路由对象
const route = useRoute()
</script>
```

### params参数

```vue
<!-- App.vue -->
<template>
  <button @click="goRouter">跳转</button>
  <RouterView />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goRouter = () => {
  router.push({
    name: 'father',
    // !! 最新vue-router版本如果动态参数中不含该参数，则会直接丢弃
    // 不支持path 、 params组合
    params: {
      names: 'ren', // 会被直接丢弃
    }
  })
}
</script>
```

### 动态路由参数

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      // 使用:申明动态参数
      path: '/father/:id',
      name: 'father',
      component: () => import('../components/Father.vue'),
    },
  ],
})

export default router
```

```vue
<!-- App.vue -->
<template>
  <button @click="goRouter">跳转</button>
  <RouterView />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goRouter = () => {
  router.push({
    name: 'father',
    // 在params中传递动态参数
    params: {
      id: 123
    }
  })
  // 或者使用path直接拼接数据
  router.push({
    path: '/father/123',
  })
}
</script>
```

```vue
<!-- Father.vue -->
<template>
  <div>
    {{ route.params.id }}
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
// 使用useRoute获取当前路由对象
const route = useRoute()
</script>
```



## 重定向与嵌套路由

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'root',
      component: () => import('../components/Father.vue'),
      // 重定向
      redirect: '/b',
      // 嵌套路由
      children: [
        {
          path: '/b',
          name: 'b',
          component: () => import('../components/B.vue'),
        },
      ],
    },
  ],
})

export default router
```



## 别名

```ts
        {
          path: '/b',
          // 可以多个路由匹配同一个组件
          alias: ['/a', '/c'],
          name: 'b',
          component: () => import('../components/B.vue'),
        },
```



## 导航守卫

### 全局前置守卫

```ts
router.beforeEach((to, from, next) => {
  // ...
  next()
})
```

### 全局后置守卫

```ts
router.afterEach((to, from) => {
  // ...
})
```



## meta

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

// 扩展原信息接口
declare module 'vue-router' {
  interface RouteMeta {
    key?: string
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'root',
      component: () => import('../components/Father.vue'),
      redirect: '/b',
      // 定义元信息
      meta: {
        key: '1123'
      },
      children: [
        {
          path: '/b',
          alias: ['/a', '/c'],
          name: 'b',
          component: () => import('../components/B.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  // 导航守卫中读取
  console.log('to.meta.key :>> ', to.meta.key);
  next()
})

export default router
```

```vue
<!-- Father.vue -->
<template>
  <div>
    Father
    <RouterView></RouterView>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute()
// 读取原信息
const key = route.meta.key
console.log('key :>> ', key);
</script>
```











# Vite

## 构建项目

```shell
# 使用vite最新版本构建项目 
npm init vite@latest
# 使用vue脚手架构建vue专属项目
npm init vue@latest
```

## 目录介绍

```markdown
public: 存放静态资源不会被vite编译
src/assets: 存放的静态资源会被打包，例如图片被转换为base64
```

## 脚本执行

```markdown
// 脚本查询顺序 例如：npm run dev
package.json中查找dev命令为vite
node_modules/bin中查找vite脚本文件
查不到则去全局node_modules/bin中查找
```



## 环境变量

### 读取

```ts
// vue中读取
const env = import.meta.env
```

```ts
// node 中读取
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// 使用函数接受mode
export default defineConfig(({ mode }) => {
  // 使用loadEnv函数加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  // 会加载所有环境变量
  console.log('env :>> ', env);
  return {
    plugins: [vue()],
  }
})
```

### 创建

```js
// 必须添加VITE前缀
// .env.development 中创建开发环境的环境变量
VITE_BASE_URL = /somewhere
// .env.production 中创建开发环境的环境变量
VITE_BASE_URL = /anywhere
```

