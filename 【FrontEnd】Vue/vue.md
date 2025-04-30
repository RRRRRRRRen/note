# Vue2

## 1.vue的基本原理

当一个Vue实例创建时，Vue会编辑data中的属性，用Object.defineProperty将他们转化为getter/setter，并且在内部追踪相关依赖，在属性被访问或者修改的时候，通知变化。每个组件实例都有相应的watcher程序实例，他会在组件渲染的过程中把属性记录为以来，之后当依赖项的setter被调用时，会通知watcher重新计算，从而使它相关的组件得以更新。



## 2.vue优点

- 轻量化框架：大小只有几十kb
- 简单易学：国人开发，文档齐全
- 双向数据绑定：操作数据更方便
- 组件化：利于封装和重用，在构建单页面应用具有独特的优势
- 视图、数据、结构分离：利于维护
- 虚拟DOM：解放dom操作，最大程度利用性能
- 性能较好：相对于react来说，虚拟dom性能更好



## 3.响应式原理

数据劫持

利用Object.defineProperty劫持对象的访问器，在属性值发生变化时我们可以获取变化，从而进行进一步的操作。

发布订阅模式

在软件架构中，发布订阅时一种消息模式，消息的发送者（称为发布者）不会将消息直接发送给特定的接受这（称为订阅者）。而是将发布的信息分为不同的类型，无需了解哪些订阅者是否存在。同样订阅者可以表达对一个或者对各类型的兴趣。只接受感兴趣的消息，无需了解哪些发布者是否存在。发布者和订阅者是互相不知道对方的存在，发布者只需要把消息发送到订阅器中，订阅者只管接受自己需要订阅的内容。

响应式原理

MVVM作为数据绑定的入口，整合**Observer**、**Compile**和**Watcher**三者，通过**Observer**来监听自己的**model**数据变化，通过**Compile**来解析编译模板指令，最终利用**Watcher**搭起**Observer**和**Compile**之间的通信桥梁



## 4.Object.defineProperty的使用与缺点

使用

`Object.defineProperty(obj, prop, descriptor)`

descriptor对象参数

- value：设置初始值
- get：getter
- set：setter
- writable：是否可写
- enumerable：是否可枚举
- configurable：是否可修改descriptor

缺点

部分操作无法拦截，例如对象属性的新增，数组下标方式修改数据。数组绝大部分的功能都进过vue改写。



## 5.MVC、MVP、MVVM的区别

**MVC**

M：model数据模型、V：view视图模型、C：controller控制器

当用户与页面发生交互时，controller中的事件触发器开始工作，通过调用Model完成数据修改，Model层通知View视图层更新。

**MVP**

M：model数据模型、 V：view视图模型、P： Presenter 控制器

MVC中VC一般耦合在一起，MVP中将MV同步更新。

**MVVM**

M：Model数据模型，包含业务逻辑

V：UI视图

VM：viewModel负责监听model中数据的变化并且控制视图的更新，处理交互

可以自动同步M和V



## 6.vue常用指令

- v-on： 给标签绑定函数，可以缩写为@，例如绑定一个点击函数 函数必须写在methods里面
- v-bind： 动态绑定 作用： 及时对页面的数据进行更改, 可以简写成：冒号
- v-slot： 缩写为#, 组件插槽
- v-for： 根据数组的个数, 循环数组元素的同时还生成所在的标签
- v-show： 显示内容
- v-if： 显示与隐藏
- v-else： 必须和v-if连用 不能单独使用 否则报错
- v-text： 解析文本
- v-html： 解析html标签



## 7.动态绑定Class与Style

class

```vue
// 对象语法
<div :class="{ active: isActive, 'text-danger': hasError }"></div>
// 数组语法
<div :class="[activeClass, errorClass]"></div>
```

style

```vue
// 对象语法
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
// 数组语法（传递多个对象）
<div :style="[baseStyles, overridingStyles]"></div>
```



## 8.vue修饰符

**v-on**

- .stop：调用`event.stopPropagation()`停止冒泡
- .prevent：调用`event.preventDefault()`阻止默认事件
- .native：监听组件根元素原生事件

**v-bind**

- .prop：作为一个 DOM property 绑定而不是作为 attribute 绑定
- .camel： 将 kebab-case attribute 名转换为 camelCase
- .sync： 将 kebab-case attribute 名转换为 camelCase

**v-model**

- .lazy：使用change事件代替input事件去更新数据
- .number：转化为数字
- .trim：过滤首位空格



## 9.内置组件

- **component**：用于渲染动态组件，使用is属性的值来判断渲染哪个组件
- **transition**：过度动画
- **transition-group**：给列表设置统一的过度动画
- **keep-alive**：保留组件状态避免重新渲染
- **slot**：插槽



## 10.v-for为什么需要绑定key

- key 的作用主要是为了更高效的更新虚拟 DOM，因为它可以非常精确的找到相同节点，因此 patch 过程会非常高效
- Vue 在 patch 过程中会判断两个节点是不是相同节点时，key 是一个必要条件。比如渲染列表时，如果不写 key，Vue 在比较的时候，就可能会导致频繁更新元素，使整个 patch 过程比较低效，影响性能
- 应该避免使用数组下标作为 key，因为 key 值不是唯一的话可能会导致上面图中表示的 bug，使 Vue 无法区分它他，还有比如在使用相同标签元素过渡切换的时候，就会导致只替换其内部属性而不会触发过渡效果



## 11.v-model的原理

表单元素上

```vue
<input v-model="message" />
// 等价于
<input :value="message" @input="message = $event.target.value"
```

组件上

```vue
// 子组件
<template>
	<input :value="value" @input="$emit('input', $event.target.value)" />
</template>
<script>
export default {
    props: ['value']
 }
</script>

// 父组件
<child v-model="message" />
//等价于
<child :value="message" @input="message = $event" />
```



## 12.sync修饰符的用法

```vue
// 子组件
<template>
	<Drawer :visible="visible" @close="handleClose"></Drawer>
</template>
<script>
export default {
    props: ['visible']
    methods: {
        handleClose: () => {
            this.$emit('updata:visible', false)
        }
    }
 }
</script>
```

```vue
// 父组件
<My-Drawer :visible.sync="visible"></Drawer>
// 等价于
<My-Drawer :visible="visible" @update:visible="visble = $event.target.value"></Drawer>
```



## 13.computed和watch的区别

| 区别 | computed   | watch        |
| ---- | ---------- | ------------ |
| 缓存 | 支持缓存   | 不支持缓存   |
| 异步 | 不支持异步 | 支持异步     |
| 返回 | 返回一个值 | 不需要有返回 |



## 14.如何注册全局组件

```js
Vue.component('Name', Cpt)
```



## 15.如何封装插件

开发一个函数式组件为例子

1.定义组件

```vue
//Toast.vue
<template>
  <div class="toast" v-show="isShow">
    <div class="toastText">{{message}}</div>
  </div>
</template>

<script>
export default {
  name:"Toast",
  data(){
    return{
      isShow:false,
      message:""
    }
  },
  methods:{
    show(message,duration){
      this.message=message;
      this.isShow=true;
      setTimeout(()=>{
        this.message="";
        this.isShow=false;
      },duration)
    }
  }
}
</script>
```

2.将组件挂在到元素上

```js
// index.js (与Toast.vue在同一个目录下)
import Toast from './Toast'
export default {
    install: (Vue) => {
        const ToastConstructor = Vue.extend(Toast)
        const toast = new ToastContructor()
        toast.$mount(document.createElement('div'))
        document.body.appendChild(toast.$el)
        Vue.prototype.$toast = toast
    }
}
```

3.在Vue中注册插件

```js
import Vue from 'vue'
import Toast from 'components/common/toast'
Vue.use(Toast)
```

4.使用该插件

```vue
<script>
export default {
	methods: {
        handleFunc(){
          this.$toast.show("xxx", 1000)
        }
    }
}
</script>
```



## 16.组件通信

- props / $emit

- provide / inject

  ```js
  // 使用provide钩子函数传递
  provide() {
      return {
          num: this.num
      }
  }
  
  // 使用inject配置接受
  inject: ['num']
  
  ```

  

- ref / $refs

  ```vue
  <template>
      <div>
        <Child ref="childRef" />
      </div>
  </template>
  <script>
  export default {
      mounted() {
          this.$refs.childRef.xxx
      }
  }
  </script>
  
  ```

  

- $parent / $children

  ```js
  this.$parent.xxx
  this.$children[0].xxx
  ```

  

- $attrs / $listeners

  - $attrs：继承所有父组件属性（除了prop传递的属性、class、style）
  - $listeners：包含作用在这个组件上的所有监听器

- eventBus

  ```js
  // 创建EventBus
  import Vue from 'vue'
  const EventBus = new Vue()
  // 发送事件
  EventBus.$emit('eventName', props)
  // 接受事件
  EventBus.$on('eventName', props => {xxx})
  // 销毁事件
  EventBus.$off('eventName', callback)
  ```



## 17.生命周期

- beforeCreate：初始化生命周期
- created：初始化响应式，可以访问data，无法访问el
- beforeMount：编译模板
- mounted：挂载模板
- beforeUpdate：更新前
- updated：更新后
- beforeDestory：摧毁前
- destoryed：摧毁后
- deactivated：离开缓存组件
- activate：进入缓存组件



## 18.vue父子组件生命周期执行顺序

加载过程

1. 父组件 beforeCreate
2. 父组件 created
3. 父组件 beforeMount
4. 子组件 beforeCreate
5. 子组件 create
6. 子组件 beforeMount
7. 子组件 mounted
8. 父组件 mounted

更新过程

- 父组件 beforeUpdate
- 子组件 beforeUpdate
- 子组件 updated
- 父组件 updated

销毁过程

- 父组件 beforeDestroy
- 子组件 beforeDestroy
- 子组件 destroyed
- 父组件 destoryed



## 19.组件缓存keep-alive

简介

使用`<keep-alive>`组件进行包裹的组件可以被缓存，组件缓存可以在进行动态组件切换的时候对组件内部数据进行缓存，而不是走销毁的流程，一般使用在多表单的切换，用于对表单数据进行保存

参数

- include：被匹配的组件名（name属性）才会被缓存
- exclude：被匹配的组件名不会被缓存
- max：最大缓存数量



## 20.过滤器

```html
<!-- 使用 -->
<li>商品的价格{{price | filterPrice}}</li>
```

```js
// 定义
{
    filter: {
        filterPrice(v) {
            return price ? ('￥' + price) : '--'
        }
    }
}
```



## 21.插槽

子组件

```vue
// 默认插槽
<slot></slot>
// 具名插槽
<slot name="xxx"></slot>
// 作用域插槽
<slot name="xxx" :value="msg"></slot>
```

父组件

```vue
// 默认插槽
<Child>
	<template>123</template>
</Child>
// 具名插槽
<Child>
	<template #xxx>123</template>
</Child>
// 作用域插槽
<Child>
	<template #xxx="slotPros">123</template>
	<template #xxx="{prop1, prop2}">123</template>
</Child>
```



## 22.介绍nextTick

简介：

放在$nextTick当中的操作不会立即执行，而是等待数据更新和DOM更新后再执行，可以确保拿到最新的数据。

一般用于：

- 在数据变化后执行的某个操作，而这个操作需要使用数据变化后的新DOM结构，这个时候就需要放在nextTick中操作
- 在生命周期created()中进行DOM操作，也需要放在nextTick()中操作



## 23.自定义指令

**如何定义**

全局定义：`Vue.directive('focus', {})`

局部定义：`directive: {focus: {}}`

**钩子函数**

一个指令定义对象可以提供如下几个钩子函数（均为可选）

- bind：只调用一次，指令第一次绑定到元素时调用。这里可以进行一次性初始化设置。
- inserted：被绑定元素插入父节点时调用。仅保证父节点存在，但不一定插入到文档中。
- update：所在组件的VNode更新时调用
- componentUpdated：指令所在组件的VNode及其子VNode全部更新后调用。
- unbind：之嗲用过一次，指定与元素解绑时调用。

**钩子函数参数**

- el：指令所绑定的元素，可以用来直接操作DOM
- bing：一个包含以下属性的对象
  - ​	name：指令名，不包含“v-"前缀。例如`v-focus:foo="1+1"`中的`focus`
  - ​	value：指令绑定的值。例如`v-focus:foo="1+1"`中的`2`
  - ​	oldValue：旧值
  - ​	expression：字符串形式的表达式。例如`v-focus:foo="1+1"`中的`1+1`
  - ​	arg：指令参数。例如`v-focus:foo="1+1"`中的`foo`
  - ​	modifiers：修饰符对象。例如`v-focus.foo.bar="1+1"`中的`{foo: true, bar: true}`
- Vnode：Vue编译的虚拟节点
- oldVnode：旧的虚拟节点

**使用场景**

用来进行底层的DOM元素的操作

**使用案例**

鼠标聚焦、下拉菜单、相对时间转换、滑动动画、图片懒加载



## 24.mixin

**简介**

接受一个混入对象数组，其中混入的对象可以像正常的实例对象一样包含实例选项。这些选项会被合并到最终选项中。Mixin钩子按照传入的顺序一次调用，并在调用组件自身钩子之前调用。

**选项合并**

数据：在内部进行递归合并，发生冲突时以组件数据优先。

钩子：同名钩子函数合并为一个数组，都会被调用，混入对象优先执行。

选项：合并为一个对象，并且冲突时组件优先。

**mixin和mixins**

mixin：用于全局合并`Vue.mixin({})`

mixins：用于局部合并`mixins: []`



## 25.data为什么是函数而不是对象

对象为引用类型，当复用组件时，由于数据对象都指向同一个data对象，当在一个组件中修改data时，其他重用的组件中的data也会被修改。而使用返回对象的函数时，由于每次都会返回一个新的对象，引用地址不同，因此互不影响。



## 26.给data添加新属性

**问题**

数据更新了，但是视图没有更新

**原因**

vue2是通过Object.defineProperty实现数据响应式的。当我们访问定义的属性或者修改属性的值时，都是触发器setter和getter，当我们为obj添加新的属性的时候，无法触发拦截，因为初始化的时候只为obj上已有的属性进行了响应式拦截，新的属性无法监视。

**解决方案**

- 使用Vue.set()为对象设置一个新的属性
- 使用Object.assign()合并两个对象重新添加在data中
- $forceUpdate强制更新视图



## 27.数据改变会立即更新视图吗

不会立即同步执行重新渲染。Vue实现响应式并不是数据发生变化之后DOM立即改变，而是按照一定的策略进行更新。

Vue更新DOM是异步执行的。只要侦听到数据变化，Vue将会开启一个队列，并缓冲在同一个事件循环中。

如果同一个Watcher被多次触发，只会被推入队列一次。这种去重的缓冲避免了不必要的计算和DOM操作。然后在下一个时间循环中，Vue刷新队列并执行已去重的工作。



## 28.vue如何监听数组的某个属性的变化

使用$set

```js
this.$set(this.arr, 0, 'xxx')
```

调用已经改写的数组方法

```mark
splice() push() pop() shift() unshift() sort() reverse()
```



## 29.assets和static的区别

assets会进行打包压缩然后整合到static中，而static不进行打包压缩



## 30.Vue的template模板编译原理

模板编译分为三个阶段，解析、优化、生成，最终生成可执行的render函数。

**解析阶段**

使用大量的正则表达式对template字符串进行解析，将标签、指令、属性等转化为抽象语法树AST

**优化阶段**

遍历AST，找到其中的一些静态节点并标记，方便在页面重新渲染的时候进行diff比较时，可以直接跳过静态节点。

**生成阶段**

将AST转化为render函数



## 31.template和jsx的区别

对于runtime来说，只需要保证组件存在render函数即可，而有了预编译之后，只需要保证构建过程中生成render函数即可。

在webpack中，使用vue-loader编译`.vue`文件，内部依赖的`vue-template-compiler`模块，在webpack构建过程中，将template预编译为render函数。与react类似，在添加了jsx语法糖解析器`babel-plugin-transform-vue-jsx`之后，就可以直接手写render函数。

所以，template和jsx都是render的一种表现新式，不同的是：jsx相对于template而言，具有更高的灵活性，在复杂组件中，更有优势，而template虽然显得呆滞，但是template的代码结构更符合逻辑视图分离的习惯，更好维护。



## 32.什么是SSR

**简介**

SSR就是服务端渲染，也就是将Vue在客户端吧标签渲染成HTML的工作放到服务端完成，然后再把html返回给客户端。

**优势**

- 具有更好的SEO
- 首屏加载速度更快

**缺点**

- 开发条件受限，服务端渲染只支持beforeCreate和created两个钩子
- 当需要一些外部扩展库的时候需要特殊处理，服务端渲染应用程序也需要除以Node.js环境
- 需要更多的服务端负载



## 33.vue初始化页面闪动问题

**简介**

在vue初始化之前，由于div不归vue管，所以我们写的代码还没有解析的情况下，容易出现花屏的现象，类似于`{{message}}`的字样，虽然时间短，但是也需要解决。

**解决方案**

- 使用`v-cloak`指令

```css
[v-cloak] {
    display: none
}
```

```html
<div v-cloak>
    {{message}}
</div>
```

- 根元素处理

```html
<div class="app" style="display:none" :style="{display: 'block'}">
    {{message}}
</div>
```



## 34.虚拟DOM

**什么是虚拟DOM**

虚拟DOM其实就是一颗以JavaScript对象作为基础的树，用对象属性来描述节点，相当于在js和真实DOM中加一个缓存，利用diff算法避免没有必要的DOM操作，从而提高性能。

在vue中一般都是通过修改元素的state，订阅者根据state的变化进行编译渲染，底层的实现可以简单的分为三个步骤：

1. 用JavaScript对象结构表述dom树结构，然后用这树构建一个真正的dom树，然后插入到浏览器的页面中
2. 当状态改变了，也就是我们的state做出了修改，vue便会重新构建一对象树，然后用这个新构建出来的树和旧树进行对比，记录两棵树之间的差异。
3. 把记录的差异再重新应用到所构建的真正的dom树，视图就更新了。

他的表达方式就是把每一个标签都转化为一个对象，这个对象可以有三个属性：

- tag：必选。就是标签，也可以是组件，或者函数。
- props：非必选。就是标签上的属性和方法。
- children：非必选。就是标签的内容或者子节点，如果是文本就是字符串，如果是子节点就是数组。

**虚拟DOM的解析过程**

- 首先对将要超如到文档中的DOM树结构进行分析，然后用js对象将其表达出来，之后再将其保存起来，最后再将DOM片段插入到文档中。
- 当页面的状态发生改变，需要对页面的DOM的结果进行调整的时候，首先根据变更的状态，重建一个对象树，然后将棵树新的对象树和旧的进行比较，记录下两颗树的差异。
- 最后将差异的地方运用的真正的DOM树中，这样视图就更新了。

**为什么要用虚拟DOM**

- 保证性能下限，在不进行手动优化的情况下，提供过得去的性能。
- 提供跨平台能力

**虚拟DOM的性能比真实DOM的性能好吗**

- 首次渲染大量DOM时，由于多一次虚拟DOM的计算，会比innerHTML插入慢。
- 在真实DOM操作的时候进行针对性优化，还是更快的。



## 35.Diff算法

在新老虚拟DOM对比时：

- 首先，对比节点本身，判断是否为同一节点，如果不为相同节点，则删除该节点重新创建节点进行替换。
- 如果为相同节点，则判断如何对该节点的子节点进行处理。先判断一方有子节点，另一方没有子节点的情况。
- 若果新的children没有子节点，将旧的子节点移除。
- 如果都有子节点，判断如何对这些新老节点的子节点进行操作（diff核心）
- 匹配时，找到相同的子节点，然后递归比较子节点。

在diff中，只对同层的子节点进行比较，放弃比较跨级别节点。也就是说，只有当新旧children都为多个子节点时才需要使用核心的diff算法进行同层级比较。



## 36.SPA单页面应用

**概念**

- SPA单页面应用（Single Page Web Application），指的是只有一个主页面的应用，一开始只需要加载一次js、css等相关资源。所有内容都包含在这个主页面，对每一个功能模块组件化。单页面跳转，就是切换相关组件，仅仅刷新局部资源。
- MPA多页面应用（Multi Page Web Application），指的是有多个独立页面的应用，每个页面必须重新加载js、css等资源。多页面跳转，需要整页资源刷新

**优点**

- 具有桌面应用的及时性，网站的可移植性和可访问性。
- 用户体验好、块，内容改变不需要重新加载整个页面。

**缺点**

- 首次渲染速度较慢
- 不利于SEO

**如何解决首次加载慢的问题**

- 减少入口文件体积
- 静态资源本地缓存
- UI框架按需加载
- 路由懒加载



## 37.使用异步组件有什么好处

- 节省打包出的结果，异步组件分开打包，采用jsonp的方式进行加载，有效解决文件过大的问题。
- 核心就是把组件定义成一个函数，依赖`import()`预发，可以实现文件的分割加载。



# Vue-Router

## 1.对前端路由的理解

**出现背景**

在前端技术早期，一个 url 对应一个页面，如果要从 A 页面切换到 B 页面，那么必然伴随着页面的刷新。这个体验并不好，不过在最初也是无奈之举——用户只有在刷新页面的情况下，才可以重新去请求数据。

后来，改变发生了——Ajax 出现了，它允许人们在不刷新页面的情况下发起请求；与之共生的，还有“不刷新页面即可更新页面内容”这种需求。在这样的背景下，出现了 **SPA（单页面应用**）。

SPA极大地提升了用户体验，它允许页面在不刷新的情况下更新页面内容，使内容的切换更加流畅。但是在 SPA 诞生之初，人们并没有考虑到“定位”这个问题——在内容切换前后，页面的 URL 都是一样的，这就带来了两个问题：

- SPA 其实并不知道当前的页面“进展到了哪一步”。可能在一个站点下经过了反复的“前进”才终于唤出了某一块内容，但是此时只要刷新一下页面，一切就会被清零，必须重复之前的操作、才可以重新对内容进行定位。
- 由于有且仅有一个 URL 给页面做映射，这对 SEO 也不够友好，搜索引擎无法收集全面的信息

**先决条件**

前端路由可以帮助我们在仅有一个页面的情况下，“记住”用户当前走到了哪一步——为 SPA 中的各个视图匹配一个唯一标识。这意味着用户前进、后退触发的新内容，都会映射到不同的 URL 上去。此时即便他刷新页面，因为当前的 URL 可以标识出他所处的位置，因此内容也不会丢失。

那么如何实现这个目的呢？首先要解决两个问题：

- 当用户刷新页面时，浏览器会默认根据当前 URL 对资源进行重新定位（发送请求）。这个动作对 SPA 是不必要的，因为我们的 SPA 作为单页面，无论如何也只会有一个资源与之对应。此时若走正常的请求-刷新流程，反而会使用户的前进后退操作无法被记录。
- 单页面应用对服务端来说，就是一个URL、一套资源，那么如何做到用“不同的URL”来映射不同的视图内容呢？

**解决方案**

从这两个问题来看，服务端已经完全救不了这个场景了。所以要靠咱们前端自力更生，作为前端，可以提供这样的解决思路：

- 拦截用户的刷新操作，避免服务端盲目响应、返回不符合预期的资源内容。把刷新这个动作完全放到前端逻辑里消化掉。
- 感知 URL 的变化。这里不是说要改造 URL、凭空制造出 N 个 URL 来。而是说 URL 还是那个 URL，只不过我们可以给它做一些微小的处理——这些处理并不会影响 URL 本身的性质，不会影响服务器对它的识别，只有我们前端感知的到。一旦我们感知到了，我们就根据这些变化、用 JS 去给它生成不同的内容。



## 2.VueRouter是什么，有哪些组件

**简介**

Vue Router是Vue官方提供的路由管理器。它和Vue.js的核心深度集成，路径和组件的映射关系，让构建单页面应用更快捷。

**组件**

- `<router-link>`：实质上最后会被渲染为`<a>`标签
- `<router-view>`：子级路由显示
- `<keep-alive>`：包裹组件缓存



## 3.route和router的区别

$route：是**路由信息对象**，包括path params hash query fullPath matched name 等路由信息参数

$router：是**路由实例对象**，包括了路由的跳转方法，钩子函数等。



## 4.路由开发的优缺点

**优点**

- 整体不刷新页面，用户体验好
- 数据传递容易，开发效率高

**缺点**

- 具有学习成本
- 首次加载慢
- 不利于SEO



## 5.VueRouter的使用方式

```js
// 0. 如果使用模块化机制编程，导入Vue和VueRouter，要调用 Vue.use(VueRouter)

// 1. 定义 (路由) 组件。
const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }

// 2. 定义路由
const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
]

// 3. 创建 router 实例
const router = new VueRouter({
  routes
})

// 4. 创建和挂载根实例。
const app = new Vue({
  router
}).$mount('#app')
```



## 6.路由模式

**hash**

【简介】

是指 url 尾巴后的 # 号以及后面的字符。hash 虽然出现在url中，但不会被包括在http请求中，对后端完全没有影响，因此改变hash不会被重新加载页面。

【原理】

基于浏览器的hashchange事件，地址变化是，通过window.location.hash获取地址上的hash值，并通过构造Router类，配置routes对象设置hash值与之对应的组件内容。

【优点】

- hash值出现在URL中，但是不会被包含在http请求中，因此hash值的改变不会重新加载页面。
- hash值的改变会触发hashchange事件，能控制浏览器的前进后退
- 兼容性好

【缺点】

- 地址栏中携带`#`，不美观
- 只可修改#后面的部分，因此只能设置与当前URL同文档的URL
- hash有体积限制，故只可添加短字符串
- 设置的新值必须与原来的不一样才会触发hashchange事件，并记录到栈中
- 每次URL的改变不属于一次http请求，所以不利于seo优化

**history**

【简介】

URL 就像正常的 url, 不过这种模式要玩好，还需要后台配置支持，防止出现404问题。

【原理】

基于HTML5新增的`pushState()`和`replaceState()`两个api，以及浏览器的`popstate`事件，当地址栏变化时，通过window.location.pathname找到对应的组件。并通过Router类，配置routes对象设置的`pathname`值与对应的组件内容。

【优点】

- 没有`#`，显得美观
- `pushState()`设置的新URL可以是与当前URL同源的任意URL
- `pushState()`设置的新URL可以与当前URL一致，也会把这条记录添加到栈中
- `pushState()`通过`stateObject`参数可以添加任意类型的数据到记录中
- `pushState()`可以设置`title`属性供后续使用
- 浏览器的进图后退能触发`popstate`事件

【缺点】

- 需要服务端配置，应为URL变化了，当用户刷新或者直接进入这个URL，会重新请求该地址的资源，如果未作配置则会返回404
- 兼容性相对较差



## 7.路由跳转的方式

- 路由跳转：this.$router.push()
- 路由替换：this.$router.replace()
- 后退：this.$router.back()
- 前进：this.$router.forward()
- 连续后退前进：this.$router.go(n)



## 8.Vue-Router跳转和location.href有什么区别

使用`location.href="/url"`来跳转页面，简单方便，但是会刷新页面

使用`history.pushState()`无刷新页面，静态跳转。

引进router，然后使用`router.push('/url')`来跳转，使用了diff算法，实现了按需加载，减少dom的消耗。其实使用router跳转和使用`history.pushState()`没有差别。



## 9.如何获取页面的hash变化

**监听$route的变化**

```js
{
    watch: {
        $route: {
            handler(v) {
                ...
            },
            deep: true
        }
    }
}
```

**window.location.hash读取**

window.location.hash的值可读可写，读取来判断是否改变，写入时，可以在不重新加载网页的前提下，添加一条历史记录。



## 10.路由的传参方式

**声明式导航传参**

在router-link上的to属性传参

- `/path?key=value`：接受传递过来的值`$route.query.key`
- `/path/value1/value2`：接受传来的值`$route.params.key`(需要提前配置路由参数)

**编程式导航传参**

- name+params方式传参

```js
this.$router.push({
    name:'XXX',
    params: {
        key: value
    }
})
// this.$route.params.key
```

- path+query方式传参

```js
this.$router.push({
    name:'XXX',
    query: {
        key: value
    }
})
// this.$route.query.key
```



## 11.params和query的区别

**用法**

query需要path来引入，params需要用name来引入，接收参数都是类似的，分别是`this.$route.query.key`,`this.$route.params.key`

**url地址显示**

query类似ajax的get传参，params类似与post，前者地址栏显示参数，后者不显示参数

**参数保存**

query参数刷新页面不会丢失，params参数刷新页面会丢失



## 12.路由配置项常用属性和作用

- path：跳转路径
- component：与路径相对的组件
- name：命名路由
- children：子路由配置
- props：路由解耦
- redirect：重定向路由



## 13.路由重定向和404

**路由重定向**

1. 匹配path后, 强制切换到另一个目标path上
2. redirect 是设置要重定向到哪个路由路径
3. 网页默认打开, 匹配路由"/", 强制切换到"/find"上
4. redirect配置项, 值为要强制切换的路由路径
5. 强制重定向后, 还会重新来数组里匹配一次规则

**404页面**

1. 如果路由hash值, 没有和数组里规则匹配
2. path: ' * ' (任意路径)
3. 默认给一个404页面
4. 如果路由未命中任何规则, 给出一个兜底的404页面



## 14.Vue-Router路由钩子

**简介**

有的时候，需要通过路由来进行一些操作，比如常见的登录鉴权验证，当用户满足条件时，才让其进入导航，否则就取消跳转，并跳到登录页面让其登录。为此有很多方法可以植入路由的导航过程：全局、单个路由、组件级

**全局路由钩子**

- beforeEach：全局前置守卫，进入路由前触发

```js
const router = new VueRouter({ ... })
router.beforeEach((to, from, next) => {
  // ...
})
```

- beforeResolve：全局解析首位，在beforeRouteEnter之后调用

- afterEach：全局后置守卫，进入路由后出啊发

```js
router.beforeEach((to, from, next) => {
  if (to.name !== 'Login' && !isAuthenticated) {
      next({ name: 'Login' })
  } else {
      next()
  }
})
```

**单个路由独享钩子**

- beforeEnter：进入路由前调用

```js
const router = new VueRouter({
    routes:[
        {
            path: '/foo',
            component: Foo,
            beforeEnter: (to, from, next) => {...}
        }
    ]
})
```

**组件内钩子**

beforeRouteEnter：进入组件前触发（访问不到this）

beforeRouteUpdate：当前地址改变并且组件被复用的时候触发

beforeRouteLeave：离开组件触发



## 15.路由导航解析流程

1. 导航被触发
2. 在是活的组件里调用`beforeRouteLeave`守卫
3. 调用全局`beforeEach`首位
4. 在复用的组件中调用`beforeRouteUpdate`守卫
5. 在路由配置里调用`beforeEnter`
6. 解析异步路由组件
7. 在被激活的路由组件中调用`beforeRouteEnter`守卫
8. 调用全局的`beforeResolve`守卫
9. 导航被确认
10. 调用全局`afterEach`钩子
11. 触发DOM更新
12. 调用`beforeRouteEnter`守卫传给`next`的回调函数



# Vuex

## 1.介绍Vuex

**简介**

Vuex是一个专门为Vue.js应用程序开发的状态管理模式。它采用集中式储存管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。Vuex也集成到Vue官方调试工具devtools extension，提供了诸如零配置的time-travel调试、状态快照导入导出等高级调试工具。

**特点**

- 首先vuex的出现是为了解决web组件化开发的过程中，各组件之间传值的混乱和发杂的问题。
- 将我们在多个组件中需要共享数据放到state中
- 要获取或者格式化的数据需要使用getters
- 改变state中的数据，可以使用mutation，但是只能包含同步的操作，在具体组件里面的调用方式是`this.$store.commit('xxx')`
- Action也是可以改变state中的数据，不过是提交到mutation，斌且可以包含异步操作，在组件中调用的方式是：`this.$store.dispatch('xxx')`，在action中使用`commit('xxx')`调用mutation



## 2.Vuex各模块在核心流程中的主要功能

**Vue Components**

Vue组件。HTML页面上，负责接受用户的操作和交互行为，执行dispatch方法触发相应的action进行回应。

**dispatch**

操作行为触发方法，是唯一能够执行action的方法

**actions**

操作行为处理模块。负责处理Vue Components接收到的所有交互行为。包含同步、异步操作，支持多个同名方法，按照注册的顺序依次触发。向后台API请求的操作就在这个模块中进行，包括触发其他action以及提交mutation的操作。该模块提供了Promise的封装，以支持action的链式触发。

**commit**

状态改变操作方法。是Vuex修改state的唯一推荐方法，其他修改方式在严格模式下将会报错。该方法只能进行同步操作，且方法名只能全局唯一。操作中会有一些hook暴露出来，以进行state的监控。

**state**

页面状态管理容器对象。集中储存Vue Components中data对象的零散数据，全局唯一，以进行统一的状态管理。页面显示所需的数据从该对象中读取，利用Vue的细粒度数据响应机制进行搞笑的状态更新。

**getters**

state对象读取方法。类似与vue配置项中的computed



## 3.Vuex数据传输流程

- 当组件中进行数据修改的时候我们需要调用dispatch来触发actions中的方法。
- actions里面的每个方法都会有一个commit方法，当方法执行的时候会通过commit来触发mutations里面的方法进行数据的修改。
- mutations里面的每个函数都会有一个state参数，这样就可以在mutations中进行state的数据修改。
- 当数据修改完毕后，回传导给页面，页面的数据也会发生改变。



## 4.Vuex中的核心属性

**state**

唯一的数据源，Vue实例中的data也遵循同样的规则

**mutations**

更改Vuex的store中的状态的唯一方法就是提交mutation

**actions**

在action中进行同步或异步操作后，再执行mutation

**getters**

类似于计算属性

**modules**

由于使用单一状态树，应用的所有状态都会集中到一个较大的对象上。当应用变得非常复杂时，store对象就有可能变得相当臃肿。为了解决这个问题，Vuex允许我们将store分割成模块



## 5.action和mutation的区别

- mutation专注于修改state，action用来处理业务代码、异步请求。
- mutation必须同步执行；action可以做异步操作，但是不能直接修改state。
- 在视图更新时，先出发actions，actions再触发mutation。
- mutation的参数时state，它包含store中的数据；actions的参数时context，它时state的父级，包含state、getters等。



## 6.getter的作用

getter优点类似Vue.js的计算属性，当我们需要从state中派生出一些状态，那么我们就需要使用getter，getter会接受state作为第一参数，而且getter的返回值会根据它的依赖缓存起来，只有getter的依赖值发生改变的是时候才会被重新计算。

```js
// 接受state和其他getters作为参数
getters: {
  doneTodosCount: (state, getters) => {
    return getters.doneTodos.length
  },
  // 也可以是一个方法，此时不会缓存结果
  getTodoById: (state) => (id) => {
    return state.todos.find(todo => todo.id === id)
  }
}
```



## 7.Vuex和LocalStorage的区别

**存储**

vuex存储在内存中，localStorage存储在本地，且只能存储字符串。

**应用场景**

vuex用于组件间传值。localStorage一般用于跨页面传递数据

**响应式**

vuex具有vue的响应式特点，localStorage没有响应式。

**永久性**

vuex刷新会丢失，localStorage不会。



## 8.Vuex和单纯的全局对象的区别

Vuex的状态存储时响应式的。当Vue组件从store中读取状态的时候，若store中的状态发生改变，那么响应的组件也会得到高效的更新。

不能直接改变store中的state，需要经过commit触发mutation。



## 9.为什么要使用Vuex

由于传参的方式对于多层嵌套的组件会非常繁琐，斌且对于兄弟组件间的状态传递无能为力。我们进场会采用父子组件直接引用或者通过事件来变更和同步状态的多份拷贝。以上这种方式非常脆弱，通常会导致代码无法维护。

所以需要把组件共享的状态抽离出来，以一个全局单例模式进行管理。在这种模式下，组件树构成了一个巨大的视图，不管在树的哪个位置，任何组件都能获取状态或者触发行为。

另外，通过定义和隔离状态管理中的各种概念并强制遵守一定的规则，代码会变得更为结构化也便于维护。



## 10.为什么Vuex中的mutations不能做异步处理

- Vuex中所有的状态更新的唯一途径都是mutation，异步操作通过 Action 来提交 mutation实现，这样可以方便地跟踪每一个状态的变化，从而能够实现一些工具帮助更好地了解我们的应用。
- 每个mutation执行完成后都会对应到一个新的状态变更，这样devtools就可以打个快照存下来，然后就可以实现 time-travel 了。如果mutation支持异步操作，就没有办法知道状态是何时更新的，无法很好的进行状态的追踪，给调试带来困难。



## 11.Vuex的严格模式

**作用**

再严格模式下，无论何时发生了状态变更，且不是由mutation函数引起的，都将会抛出错误。这样保证所有状态变更都能被调试工具记录跟踪到。

**开启方式**

```js
const store = new Vuex.Store({
    strict: true
})
```



## 12.Vuex中的辅助函

**state**

```js
import { mapState } from 'vuex'
export default {
    computed: {
        ...mapState(['xxx1', 'xxx2']),
        ...mapState({
            // 箭头函数
            count: state => state.count,
            // 别名
            countAlias: 'count',
            // 常规函数可以使用this获取局部状态
            countPlusLocalState(state) {
                return state.count + this.localCount
            }
        })
    }
}
```

**getter**

```js
import { mapGetters } from 'vuex'
export default {
    computed: {
        ...mapGetters(['xxx1', 'xxx2']),
        ...mapGetters({
            a: 'xxx3'
        })
    }
}
```

**mutation**

```js
import { mapMutations } from 'vuex'
export default {
    methods: {
        ...mapMutations(['xx1', 'xxx2']),
        ...mapMutations({
            add: 'increment'
        })
    }
}
```

**action**

```js
import { mapActions } from 'vuex'
export default {
    methods: {
        ...mapActions(['xx1', 'xxx2']),
        ...mapActions({
            add: 'increment'
        })
    }
}
```



# Vue2其他面试题

## 1.vue性能优化

**编码阶段优化**

- 减少data中的数据，data重的数据会增加getter和setter，会收集对应的watcher

- v-if和v-for不放一起用，会优先渲染v-for，造成不必要的计算

- v-for元素使用事件代理

- 使用keep-alive缓存

- 使用路由懒加载、异步组件

- 防抖、节流

- 第三方模块按需引入

- 长列表可视区域加载

- 图片懒加载


**SEO优化**

- 预渲染

- SSR


**打包优化**

- 代码压缩

- tree shaking

- cdn

- 多线程打包happypack

- splitChunks抽离公共文件

- sourceMap优化


**用户体验**

- 骨架屏

- PWA

- 使用魂村

- 开启gzip



## 2.如何理解vue单项数据流

所有的prop都使得其父子prop之间形成了一个单向下行的绑定：父级prop的更新会向下流动到子组件中，但是反过来不行。这样会防止从子组件意外改变父级组件的状态，从而导致你的应用数据流难以理解。

**如何在子组件中尝试修改props：**

1.data中重新定义数据

这种情况下用于用prop传递一个初始值，这个子组件希望其作为本地属性来使用。这种情况下，最好定义一个本地的data property 并将这个prop作为初始值。

```js
export default {
    props: ['initialCount'],
    data() {
        return {
            counter: this.initalCount
        }
    }
}
```

2.这个prop以一种初始的值传入但是需要转换。这种情况下，最好使用这个prop的值定义一个计算属性。

```js
export default {
    props: ['initialCount'],
    computed: {
        count() {
            return this.initalCount + 1
        }
    }
}
```



## 3.在什么阶段才可以访问操作DOM

在钩子函数`mounted`被调用前，Vue已经将编译好的模板挂载到页面上了，所以在`mounted`中可以访问和操作DOM。



## 4.父组件可以监听到子组件的生命周期吗

1. 使用自定义事件

   ```js
   // Parent.vue
   <Child @mounted="doSomething"/>
       
   // Child.vue
   mounted() {
     this.$emit("mounted");
   }
   ```

2. 使用@hook监听

   ```js
   //  Parent.vue
   <Child @hook:mounted="doSomething" ></Child>
   
   doSomething() {
      console.log('父组件监听到 mounted 钩子函数 ...');
   },
       
   //  Child.vue
   mounted(){
      console.log('子组件触发 mounted 钩子函数 ...');
   },    
       
   // 以上输出顺序为：
   // 子组件触发 mounted 钩子函数 ...
   // 父组件监听到 mounted 钩子函数 ...     
   ```

   

## 5.vm.$set()是怎么工作的

- 如果目标是数组，直接使用改写后的`splice`触发响应式
- 如果是对象，先判断属性是否存在、对象是否是响应式，如果判断需要对其进行响应式处理，则会调用defineReactive方法处理



## 6.组件命名规范

链式命名：`<my-component>`

大驼峰命名：`<MyComponent>`

W3C规范：同链式命名，字母全小写，且必须包含一个连字符



## 7.style标签的scoped作用与原理

**作用**

- 组件css作用域，避免子组件内部的css样式被父组件覆盖
- 默认情况下，如果子组件和父组件css选择器权重相同，会优先加载父组件css样式

**原理**

- 给元素添加一个自定义属性`v-data-xxx`
- 通过属性选择器提高css权重



## 8.组件中的name属性的作用

- 项目使用`keep-alive`的时候，可搭配组件的name进行缓存过滤。
- DOM做递归组件时需要调用自身name
- 方便Vue-devtools调试，其工具中显示的组件名就是name决定的
- 用于动态切换组件



## 9.Vue2怎么监听内部生命周期钩子

在Vue中，可以使用`$on, $once`去监听所有神明周期钩子函数，如监听`updated`钩子可以写成`this.$on('hook:updated', () => {})`