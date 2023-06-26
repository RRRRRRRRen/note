# Vue3



## ——基础——



## 创建一个应用

### 应用实例

> 每个 Vue 应用都是通过`createApp`函数创建一个新的 **应用实例**
>
> 应用实例必须在调用了 `.mount()` 方法后才会渲染出来。
>
> `.mount()` 方法应该始终在整个应用配置和资源注册完成后被调用。

```html
<div id="app"></div>
```

```js
import { createApp } from 'vue'
// 从一个单文件组件中导入根组件
import App from './App.vue'
// 创建应用实例
const app = createApp(App)
// 挂载并且渲染应用
app.mount('#app')
```

### 应用配置

> 应用实例会暴露一个 `.config` 对象允许我们配置一些应用级的选项
>
> 应用实例还提供了一些方法来注册应用范围内可用的资源，例如注册一个组件

```js
// 配置
app.config.errorHandler = (err) => {
  /* 处理错误 */
}
// 全局组件
app.component('TodoDeleteButton', TodoDeleteButton)
```



## 模板语法

### 文本插值

> 模板中的表达式将被沙盒化，仅能够访问到有限的全局对象列表。该列表中会暴露常用的内置全局对象，比如 `Math` 和 `Date`。
>
> 绑定在表达式中的方法在组件每次更新时都会被重新调用

```vue
<template>
  <!-- script声明的顶级变量 -->
  <div>{{ message }}</div>
  <!-- 表达式 -->
  <div>{{ message == 0 ? '我是小满0' : '我不是小满other' }}</div>
  <div>{{ message  + 1 }}</div>
  <div>{{ message.split('，') }}</div>
	<!-- 调用函数 -->
	<div>{{ formatDate(date) }}</div>

</template>
 
<script setup lang="ts">
const message = "我是小满"
</script>
```

### Attribute绑定

```vue
<div v-bind:id="dynamicId"></div>
<!-- 省略写法 -->
<div :id="dynamicId"></div>
<!-- 布尔值 -->
<button :disabled="isButtonDisabled">Button</button>
<!-- 调用函数 -->
<time :title="toTitleDate(date)" :datetime="date"></time>
<!-- 动态参数 -->
<a :[attributeName]="url"> ... </a>
```

### 指令

> `v-show` 不支持在 `<template>` 元素上使用
>
> 当 `v-if` 和 `v-for` 同时存在于一个元素上的时候，`v-if` 会首先被执行。

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



## 响应式基础

### ref

> 在模板中使用 ref 时，我们**不**需要附加 `.value`
>
> Ref 可以持有任何类型的值，包括深层嵌套的对象、数组或者 JavaScript 内置的数据结构，比如 `Map`。

```js
import { ref } from 'vue'

const count = ref(0)
```

### setup

> \<script setup\> 中的顶层的导入、声明的变量和函数可在同一组件的模板中直接使用。

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">
    {{ count }}
  </button>
</template>
```

### nextTick

> DOM 更新不是同步的。Vue 会在“next tick”更新周期中缓冲所有状态的修改，以确保不管你进行了多少次状态修改，每个组件都只会被更新一次。

```js
import { nextTick } from 'vue'

async function increment() {
  count.value++
  await nextTick()
  // 现在 DOM 已经更新了
}
```

### reactive

>  与ref 不同，`reactive()` 将使对象本身具有响应性
>
> 对同一个原始对象调用 `reactive()` 会总是返回同样的代理对象
>
> 响应式对象内的嵌套对象依然是代理
>
> 当我们将响应式对象的原始类型属性解构为本地变量时，或者将该属性传递给函数时，我们将丢失响应性连接

```js
import { reactive } from 'vue'

const state = reactive({ count: 0 })
```



## 计算属性

### computed

> `computed()` 方法期望接收一个 getter 函数，返回值为一个**计算属性 ref**。
>
> **计算属性值会基于其响应式依赖被缓存**。
>
> **getter不应有副作用，不要在 getter 中做异步请求或者更改 DOM**
>
> 在计算属性中使用 `reverse()` 和 `sort()` 的时候务必小心！这两个方法将变更原始数组，计算函数中不应该这么做。

```vue
<script setup>
import { reactive, computed } from 'vue'

const author = reactive({
  name: 'John Doe',
  books: [
    'Vue 2 - Advanced Guide',
    'Vue 3 - Basic Guide',
    'Vue 4 - The Mystery'
  ]
})

// 一个计算属性 ref
const publishedBooksMessage = computed(() => {
  return author.books.length > 0 ? 'Yes' : 'No'
})
</script>

<template>
  <p>Has published books:</p>
  <span>{{ publishedBooksMessage }}</span>
</template>
```

### 可写计算属性

> 同时提供 getter 和 setter 来创建

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed({
  // getter
  get() {
    return firstName.value + ' ' + lastName.value
  },
  // setter
  set(newValue) {
    // 注意：我们这里使用的是解构赋值语法
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})
</script>
```



## 类与样式绑定

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



## 条件渲染



## 列表渲染

> 你也可以使用 `v-for` 来遍历一个对象的所有属性。

```js
const myObject = reactive({
  title: 'How to do lists in Vue',
  author: 'Jane Doe',
  publishedAt: '2016-04-10'
})
```

```html
<li v-for="(value, key, index) in myObject">
  {{ index }}. {{ key }}: {{ value }}
</li>
```



## 事件处理

### event

> 向该处理器方法传入一个特殊的 `$event` 变量，或者使用内联箭头函数：

```vue
<!-- 使用特殊的 $event 变量 -->
<button @click="warn('Form cannot be submitted yet.', $event)">
  Submit
</button>

<!-- 使用内联箭头函数 -->
<button @click="(event) => warn('Form cannot be submitted yet.', event)">
  Submit
</button>
```

```js
function warn(message, event) {
  // 这里可以访问原生事件
  if (event) {
    event.preventDefault()
  }
  alert(message)
}
```

### 事件修饰符

> 使用修饰符时需要注意调用顺序，因为相关代码是以相同的顺序生成的。因此使用 
>
> `@click.prevent.self` 会阻止**元素及其子元素的所有点击事件的默认行为**，而 
>
> `@click.self.prevent` 则只会阻止对元素本身的点击事件的默认行为。

```markdown
@click.stop： 停止冒泡
@submit.prevent: 阻止默认事件
@click.self: 仅当 event.target 是元素本身时才会触发事件处理器
@click.capture: 捕获模式
@click.once: 仅触发一次
@scroll.passive: 提前告诉浏览器不拦截默认事件
```

```vue
<!-- 单击事件将停止传递 -->
<a @click.stop="doThis"></a>

<!-- 提交事件将不再重新加载页面 -->
<form @submit.prevent="onSubmit"></form>

<!-- 修饰语可以使用链式书写 -->
<a @click.stop.prevent="doThat"></a>

<!-- 也可以只有修饰符 -->
<form @submit.prevent></form>

<!-- 仅当 event.target 是元素本身时才会触发事件处理器 -->
<!-- 例如：事件处理器不来自子元素 -->
<div @click.self="doThat">...</div>
```

```vue
<!-- 添加事件监听器时，使用 `capture` 捕获模式 -->
<!-- 例如：指向内部元素的事件，在被内部元素处理前，先被外部处理 -->
<div @click.capture="doThis">...</div>

<!-- 点击事件最多被触发一次 -->
<a @click.once="doThis"></a>

<!-- 滚动事件的默认行为 (scrolling) 将立即发生而非等待 `onScroll` 完成 -->
<!-- 以防其中包含 `event.preventDefault()` -->
<!-- .passive 修饰符一般用于触摸事件的监听器，可以用来改善移动端设备的滚屏性能 -->
<div @scroll.passive="onScroll">...</div>
```

### 按键修饰符

> `.exact` 修饰符允许控制触发一个事件所需的确定组合的系统按键修饰符。

```markdown
.enter:	
.tab:	
.delete:	
.esc:	
.space: 
.up:
.down:
.ctrl:
.alt:
.shift:
.meta:
.exact:
```

```vue
<!-- 仅在 `key` 为 `Enter` 时调用 `submit` -->
<input @keyup.enter="submit" />
```

```vue
<!-- Alt + Enter -->
<input @keyup.alt.enter="clear" />

<!-- Ctrl + 点击 -->
<div @click.ctrl="doSomething">Do something</div>
```

```vue
<!-- 当按下 Ctrl 时，即使同时按下 Alt 或 Shift 也会触发 -->
<button @click.ctrl="onClick">A</button>

<!-- 仅当按下 Ctrl 且未按任何其他键时才会触发 -->
<button @click.ctrl.exact="onCtrlClick">A</button>

<!-- 仅当没有按下任何系统按键时触发 -->
<button @click.exact="onClick">A</button>
```

### 鼠标按键修饰符

```markdown
.left:
.right:
.middle:
```



## 表单输入绑定

> - 文本类型的 `<input>` 和 `<textarea>` 元素会绑定 `value` property 并侦听 `input` 事件；
> - `<input type="checkbox">` 和 `<input type="radio">` 会绑定 `checked` property 并侦听 `change` 事件；
> - `<select>` 会绑定 `value` property 并侦听 `change` 事件。

```vue
<!-- 复选框 -->
<div>Checked names: {{ checkedNames }}</div>

<input type="checkbox" id="jack" value="Jack" v-model="checkedNames">
<label for="jack">Jack</label>

<input type="checkbox" id="john" value="John" v-model="checkedNames">
<label for="john">John</label>

<input type="checkbox" id="mike" value="Mike" v-model="checkedNames">
<label for="mike">Mike</label>
```

```vue
<!-- 单选 -->
<div>Picked: {{ picked }}</div>

<input type="radio" id="one" value="One" v-model="picked" />
<label for="one">One</label>

<input type="radio" id="two" value="Two" v-model="picked" />
<label for="two">Two</label>
```

```vue
<!-- 下拉选择 -->
<div>Selected: {{ selected }}</div>

<select v-model="selected">
  <option disabled value="">Please select one</option>
  <option>A</option>
  <option>B</option>
  <option>C</option>
</select>
```

```vue
<!-- 下拉多选 -->
<div>Selected: {{ selected }}</div>

<select v-model="selected" multiple>
  <option>A</option>
  <option>B</option>
  <option>C</option>
</select>
```

### 修饰符

>  `lazy` 修饰符来改为在每次 `change` 事件后更新数据
>
> `number` 让用户输入自动转换为数字
>
> `trim` 默认自动去除用户输入内容中两端的空格



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



## 侦听器

### watch

> 不能直接侦听响应式对象的属性值，需要用一个返回该属性的 getter 函数
>
> 一个返回响应式对象的 getter 函数，只有在返回不同的对象时，才会触发回调

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
// 监听单个值
watch(firstName, (v,ov) => {
  console.log('监听单个值v, ov :>> ', v, ov);
})
// 监听多个值
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



## 模版引用

> 你只可以**在组件挂载后**才能访问模板引用
>
> ref 数组**并不**保证与源数组相同的顺序。
>
> 模板引用也可以被用在一个子组件上。这种情况下引用中获得的值是组件实例

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 声明一个 ref 来存放该元素的引用
// 必须和模板里的 ref 同名
const input = ref(null)

onMounted(() => {
  input.value.focus()
})
</script>

<template>
  <input ref="input" />
</template>
```

```vue
<script setup>
import { ref, onMounted } from 'vue'

const list = ref([
  /* ... */
])

const itemRefs = ref([])

onMounted(() => console.log(itemRefs.value))
</script>

<template>
  <ul>
    <li v-for="item in list" ref="itemRefs">
      {{ item }}
    </li>
  </ul>
</template>
```

## 

## ——组件——



## 组件注册

### 全局注册

> 使用vue实例的app.component()方法
>
> 可以链式调用
>
> 全局注册无法tree-shaking

```js
import { createApp } from 'vue'
import MyComponent from './App.vue'

const app = createApp({})

app.component('MyComponent', MyComponent)
```

```js
app
  .component('ComponentA', ComponentA)
  .component('ComponentB', ComponentB)
  .component('ComponentC', ComponentC)
```

### 局部注册

> 支持tree-shaking

```vue
<script setup>
import ComponentA from './ComponentA.vue'
</script>

<template>
  <ComponentA />
</template>
```

### 动态组件

> 被传给 `:is` 的值可以是以下几种：被注册的组件名、导入的组件对象

```vue
<!-- currentTab 改变时组件也改变 -->
<component :is="tabs[currentTab]"></component>
```



## Props

### Props声名

> `defineProps` 是一个仅 `<script setup>` 中可用的编译宏命令

```js
<script setup>
const props = defineProps(['foo'])

console.log(props.foo)
</script>
```

### Props校验

```js
defineProps({
  // 基础类型检查
  // （给出 `null` 和 `undefined` 值则会跳过任何类型检查）
  propA: Number,
  // 多种可能的类型
  propB: [String, Number],
  // 必传，且为 String 类型
  propC: {
    type: String,
    required: true
  },
  // Number 类型的默认值
  propD: {
    type: Number,
    default: 100
  },
  // 对象类型的默认值
  propE: {
    type: Object,
    // 对象或数组的默认值
    // 必须从一个工厂函数返回。
    // 该函数接收组件所接收到的原始 prop 作为参数。
    default(rawProps) {
      return { message: 'hello' }
    }
  },
  // 自定义类型校验函数
  propF: {
    validator(value) {
      // The value must match one of these strings
      return ['success', 'warning', 'danger'].includes(value)
    }
  },
  // 函数类型的默认值
  propG: {
    type: Function,
    // 不像对象或数组的默认，这不是一个
    // 工厂函数。这会是一个用来作为默认值的函数
    default() {
      return 'Default function'
    }
  }
})
```



## 组件事件

### 事件声名

> 通过 `defineEmits`宏来声明需要抛出的事件
>
> 模版中可以直接使用$emit
>
> 组件触发的事件**没有冒泡机制**

```vue
<script setup>
const emit = defineEmits(['inFocus', 'submit'])

function buttonClick() {
  emit('submit')
}
</script>
```

```vue
<button @click="$emit('increaseBy', 1)">
  Increase by 1
</button>
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



## 透传Attributes

> 当一个组件以单个元素为根作渲染时，透传的 attribute 会自动被添加到根元素上
>
> “透传 attribute”指的是传递给一个组件，却没有被该组件声明为props 或emits的 attribute 或者 `v-on` 事件监听器。最常见的例子就是 `class`、`style` 和 `id`。
>
> 如果一个子组件的根元素已经有了 `class` 或 `style` attribute，它会和从父组件上继承的值合并。

### 访问透传Attributes

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>
```

```vue
<header>...</header>
<main v-bind="$attrs">...</main>
<footer>...</footer>
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



## provide/inject

> 需要在setup中同步调用
>
> **建议尽可能将任何对响应式状态的变更都保持在供给方组件中**，推荐在供给方组件内声明并提供一个更改数据的方法函数

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

### 应用层提供

```js
import { createApp } from 'vue'

const app = createApp({})

app.provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
```



## 异步组件

### 获取异步组件

```js
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() => {
  return new Promise((resolve, reject) => {
    // ...从服务器获取组件
    resolve(/* 获取到的组件 */)
  })
})
// ... 像使用其他一般组件一样使用 `AsyncComp`
```

```js
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() =>
  import('./components/MyComponent.vue')
)
```

### 注册异步组件

```js
app.component('MyComponent', defineAsyncComponent(() =>
  import('./components/MyComponent.vue')
))
```

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const AdminPage = defineAsyncComponent(() =>
  import('./components/AdminPageComponent.vue')
)
</script>

<template>
  <AdminPage />
</template>
```

### 错误处理

```js
const AsyncComp = defineAsyncComponent({
  // 加载函数
  loader: () => import('./Foo.vue'),

  // 加载异步组件时使用的组件
  loadingComponent: LoadingComponent,
  // 展示加载组件前的延迟时间，默认为 200ms
  delay: 200,

  // 加载失败后展示的组件
  errorComponent: ErrorComponent,
  // 如果提供了一个 timeout 时间限制，并超时了
  // 也会显示这里配置的报错组件，默认值是：Infinity
  timeout: 3000
})
```



## 

## ——逻辑复用——



## 组合式函数

> 每一个调用 `useMouse()` 的组件实例会创建其独有的 `x`、`y` 状态拷贝，因此他们不会互相影响。
>
> 组合式函数只能在 `<script setup>` 或 `setup()` 钩子中被调用。

```js
// mouse.js
import { ref, onMounted, onUnmounted } from 'vue'

// 按照惯例，组合式函数名以“use”开头
export function useMouse() {
  // 被组合式函数封装和管理的状态
  const x = ref(0)
  const y = ref(0)

  // 组合式函数可以随时更改其状态。
  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  // 一个组合式函数也可以挂靠在所属组件的生命周期上
  // 来启动和卸载副作用
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  // 通过返回值暴露所管理的状态
  return { x, y }
}
```

```vue
<script setup>
import { useMouse } from './mouse.js'

const { x, y } = useMouse()
</script>

<template>Mouse position is at: {{ x }}, {{ y }}</template>
```

### 与mixin的对比

mixins 有三个主要的短板：

1. **不清晰的数据来源**：当使用了多个 mixin 时，实例上的数据属性来自哪个 mixin 变得不清晰，这使追溯实现和理解组件行为变得困难。这也是我们推荐在组合式函数中使用 ref + 解构模式的理由：让属性的来源在消费组件时一目了然。
2. **命名空间冲突**：多个来自不同作者的 mixin 可能会注册相同的属性名，造成命名冲突。若使用组合式函数，你可以通过在解构变量时对变量进行重命名来避免相同的键名。
3. **隐式的跨 mixin 交流**：多个 mixin 需要依赖共享的属性名来进行相互作用，这使得它们隐性地耦合在一起。而一个组合式函数的返回值可以作为另一个组合式函数的参数被传入，像普通函数那样。





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





## 插件

> 一个插件可以是一个拥有 `install()` 方法的对象，也可以直接是一个安装函数本身。安装函数会接收到安装它的[应用实例](https://cn.vuejs.org/api/application.html)和传递给 `app.use()` 的额外选项作为参数

```js
import { createApp } from 'vue'

const app = createApp({})

app.use(myPlugin, {
  /* 可选的选项 */
})
```

```js
const myPlugin = {
  install(app, options) {
    // 配置此应用
  }
}
```



## 

## ——内置组件——

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

**props**

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

**useAttrs**

```js
// 可以接受(未被接受的)标签属性与事件
const attrs = useAttrs();
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

### 父组件暴露

```vue
<template>
  <div>Father</div>
  <ChildVue ref="dom" />
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

```vue
<!-- Child -->
<template>
  <div @click="handleClick($parent)">Child</div>
</template>

<script setup lang="ts">
import ChildVue from './Child.vue'
// ts 声明方式
const handleClick = ($parent) => {
  console.log($parent.msg)
}

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

