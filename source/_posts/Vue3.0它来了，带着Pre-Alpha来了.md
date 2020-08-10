---
title: Vue3.0，它来了
categories:
 - 前端
tags:
 - 源码
 - vue
---

> 10月5号凌晨，尤雨溪大大发布了[vue3.0源码](https://github.com/vuejs/vue-next)

![尤雨溪sina微博](/images/sina_yyx.jpg)

现在抓住国庆的小尾巴，来看一看vue3.0到底有啥东西

### 整体状态

- 目前发布的vue3.0是`Pre-Alpha`版本，后续还有`Alpha`、`Beta`版本
- 打包后的代码是ES2015+，不支持IE11
- 拥抱TypeScript，98%代码使用了TypeScript编写



<!-- more -->



### 代码目录

![目录树结构](/images/vue-next-code-tree.png)

由上图看到（安装了`Octotree`插件，浏览github时可以在浏览器左侧清晰展示项目结构），vue3.0仓库有一个`packages`目录，里面包含了vue3.0主要实现的功能：

- **compiler-core**：平台无关的编译器. 它既包含可扩展的基础功能，也包含所有平台无关的插件
- **compiler-dom**：针对浏览器而写的编译器
- **reactivity**：数据响应式系统。一个单独的系统，可以与任何框架配合使用
- **runtime-core**：与平台无关的运行时。其实现的功能有虚拟 DOM 渲染器、Vue 组件和 Vue 的各种API
- **runtime-dom**： 针对浏览器的 runtime。其功能包括处理原生 DOM API、DOM 事件和 DOM 属性等
- **runtime-test**：一个专门为了测试而写的轻量级 runtime
- **server-renderer**：用于 SSR（还未实现）
- **shared**：没有暴露任何 API，主要包含了一些平台无关的内部帮助方法
- **template-explorer**：用于模板编译输出
- **vue**： 用于构建「完整构建」版本

由上可知，vue3.0 代码仓库结构比较清晰，代码也是模块化的。简单过一遍目录，了解vue3.0主要的内容，后面再对部分源码进行通读。