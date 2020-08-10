---
title: vue3.0-beta尝鲜
categories:
 - 前端
tags:
 - vue

---

## 前言

尤大大前段时间发布了vue3.0-beta版本，现在趁着五一假期尝尝鲜，记录一下。

## vue3设计更新点

先回顾官方提出的vue3.0设计目标

- 更小
  - 全局 API 和内置组件
  - 支持 tree-shaking
  - 常驻代码大小控制在 10kb gzipped 左右
- 更快
  - 基于 Proxy 的变动侦测
  - Virtual DOM 重构
  - 编译器架构重构，更多的编译时优化
- 加强API设计一致性
- 加强TypeScript支持
- 提高自身可维护性
  - 代码采用 monorepo 结构，内部分层更清晰
  - TypeScript 使得外部贡献者更有信心做改动
- 开放更多底层功能

<!-- more -->

## 开始

### 创建项目

```js
// 升级vue-cli到4.0版本
cnpm install -g @vue/cli

// 创建项目（注意，这里的vue版本还是2.x）
vue create vue-3.0-beta-test

// 切换到项目目录 通过vue add 命令添加3.0版本
vue add vue-next
```

然后打开项目，可以看到vue的版本已经变成`^3.0.0-beta.1`，还有一些插件版本的更新和新增了两个插件

![vue升级3.0-beta](/images/vue升级3.0-beta.png)

### 对比项目结构

再从项目的整体结构来看，对比2.x版本基本没有变化，主要看下变化了的`main.js`文件

![main.js](/images/mainjs对比.png)

通过图片可以看到，这里只解构出一个`createApp`函数，因为vue3.0支持`tree-shaking`，可以把每一个用到的API抽取出来，让vue变得更小

### Composition API

原先是叫`Vue-Function-API`，后面经社区意见收集，更改为`Vue-Composition-API`，这里面有几个变化比较大的：

- 生命周期钩子
- reactive API
- ref API
- watch API
- computed API

#### 生命周期

在3.0中，生命周期发生了很大变化：

| 2.x  | 3.0  |
| ---- | ---- |
|  beforeCreate    |   setup   |
|  created    |   setup   |
| beforeMount | onBeforeMount |
| mounted | onMounted |
| beforeUpdate | onBeforeUpdate |
| updated | onUpdated |
| beforeDestroy | onBeforeUnmount |
| destroyed | onUnmounted |

#### reactive

> 该API作用是创建响应式对象，类似之前在`data`中声明变量

```vue
// App.vue
<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <h3>{{ info.msg }}</h3>
  </div>
</template>

<script>
import { reactive } from "vue";
export default {
  name: "App",
  setup() {
    let info = reactive({
      msg: `vue3.0-beta尝鲜`
    });
    return {
      info
    };
  }
};
</script>
```

效果：

![reactive效果](/images/效果图-1.png)

#### ref

> 创建一个包装式对象，含有一个响应式属性value，通过修改value来修改值

```vue
// App.vue
<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <h3>{{ info.msg }}</h3>
    <h3>{{ tip }}</h3>
  </div>
</template>

<script>
import { reactive, ref } from "vue";
export default {
  name: "App",
  setup() {
    let info = reactive({
      msg: `vue3.0-beta尝鲜`
    });
    let tip = ref(`value of ref`);
    // 通过修改value属性来修改值
    tip.value = `change ref of value`;
    return {
      info,
      tip
    };
  }
};
</script>
```

效果：

![ref效果](/images/ref效果图.png)

#### 事件处理

3.0没有`methods`对象，也是写在`setup`里面

```vue
// App.vue
<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <h3>{{ info.msg }}</h3>
    <h3>tip：{{ tip }}</h3>
    <input v-model="inputValue" />
    <button @click="handleClick">click me</button>
  </div>
</template>

<script>
import { reactive, ref } from "vue";
export default {
  name: "App",
  setup() {
    let info = reactive({
      msg: `vue3.0-beta尝鲜`
    });
    let tip = ref(`value of ref`);
    tip.value = `change ref of value`;
    let inputValue = ref("");
    const handleClick = () => {
      tip.value = inputValue.value;
    };
    return {
      info,
      tip,
      inputValue,
      handleClick
    };
  }
};
</script>
```

上面写了一个方法，绑定一个点击事件来改变变量`tip`的值，效果如图：

![绑定事件](/images/事件效果图.png)

#### onMounted钩子

我们在vue项目中用得最多的生命钩子就是`created`和`mounted`，在`created`发送请求，接收、处理参数之类，在`mounted`页面渲染后进行相关的业务处理，在上面有提过，现在`beforeCreate`和`created` 都是`setup`了，现在看下新的`onMounted`怎么用：

```vue
<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <h3>{{ info.msg }}</h3>
    <h3>tip：{{ tip }}</h3>
    <input v-model="inputValue" />
    <button @click="handleClick">click me</button>
  </div>
</template>

<script>
import { reactive, ref, onMounted } from "vue";
export default {
  name: "App",
  setup() {
    // 省略上面例子的代码
    // ...  
    onMounted(() => {
      console.log(`mounted`);
      // 页面渲染完 获取所有h3元素  
      let h3List = document.querySelectorAll("h3");
      console.log({
        h3List: h3List
      });
    });
    return {
        // ...
    };
  }
};
</script>

```

#### computed

```vue
<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <h3>{{ info.msg }}</h3>
    <h3>tip：{{ tip }}</h3>
    <h3>computed num：{{ num }}</h3>
    <input v-model="inputValue" />
    <button @click="handleClick">click me</button>
    <button @click="incrementNum">increment</button>
  </div>
</template>

<script>
import { reactive, ref, onMounted, computed } from "vue";
export default {
  name: "App",
  setup() {
	// ...
    let initNum = ref(0);
    const incrementNum = () => {
      initNum.value++;
    };
    // 让num成为计算属性
    let num = computed(() => {
      return initNum.value * 2;
    });
    return {
      // ...
      incrementNum,
      num
    };
  }
};
</script>

```

看下效果：

![](/images/钩子效果图.png)

### 总结

从上面的例子可以看到，3.0的语法更加简洁精炼！总的来说，3.0会兼容2.x，我们的学习成本基本就只集中在composition这一块，而更具体、更详细的内容，可访问[composition-api](https://composition-api.vuejs.org/#summary)，上面还有很丰富的内容等着我们探索，包括对`TypeScript`的更好支持等。