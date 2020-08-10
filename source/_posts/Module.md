---
title: ES6 -- Module
categories:
 - 前端
tags:
 - JS

---

### 前言

讲到模块化，大家可能对CommonJs、AMD、CMD等规范都比较熟悉，ES6也有Module的规范。本文是对Module理解的整理。那依然先是问题三连：ES6的Module是什么？用来解决什么问题？优点是什么？

<!-- more -->

### 是什么？

使用不同方式加载的JS文件，与原先脚本（script）加载方式相对。模块的真正力量在于按需导出和导入，而不在于将所有内容放在同一个文件

### 解决什么问题（切入点）

1. 命名冲突（作用域）
2. 让JS应用变得更加有条理
3. 安全问题

### 优点是什么

1. 自动运行在严格模式下，且无法跳出严格模式；
2. 在模块的顶级作用域创建的变量，不会自动添加到共享的全局作用域，只存在于模块顶级作用域的内部；
3. 模块顶级作用域的`this`为`undefined`；
4. 模块中不允许`HTML`风格的注释，该问题是早期浏览器历史遗留特性；
5. 要提供给外部访问的代码，模块必须导出它们；
6. 模块可以由别的模块导入绑定。

### 基本导出

#### export

我们可以在任意变量、函数、类声明之前加上`export`导出它们，没有被显式导出的将会在模块中保持私有

```javascript
// module.js
export let name = 'Ysom'
export function sum (num1, num2) {
    return num1 + num2
}
export class Person {
    constrcutor (name, sex) {
        this.name = name
        this.sex = sex
    }
}

function sayHello () {
    console.log('hello world')
}
// 导出引用
export { sayHello }
```

### 基本导入

#### import

可以通过`import`来导入被导出的模块，`import`语句由两部分组成，被导入的**标识符**和导入标识符的**来源**：`import { identifier1, identifier2 } from './module1.js'`

```javascript
// 导入单个绑定
import { sum } from './module.js'
// 导入多个绑定
import { sum, sayHello } from './module.js'
// 完全导入一个模块 module所有的导出绑定在example 属于命名空间导入(namespace import)
import * as example from './module.js'
```

需要注意的一点：无论使用多少次`import`引入模块，该模块只会执行一次。在导出的模块执行之后，已被实例化的模块会保留在内存中，随时可被其它`import`使用。同应用的其它模块，如使用`import`引入该模块，使用的也是同一个实例模块

```javascript
import { sum } from './module.js'
import { sayHello } from './module.js'
// 在这里modules.js只会执行一次，之后保留在内存中
```

import和export有一个限制：无法在其它语句或表达式的内部使用，即必须在顶部作用域

```javascript
if (true) {
    // error
    import xx from './xxx'
}
if (true) {
    // error
    export xx
}
```

> 题外话：在已完成的ES2020的提案中，有了新特性动态导入[dynamic-import](https://github.com/tc39/proposal-dynamic-import)，可根据条件判断支持按需导入

### 默认导入-模块的默认值

我们可以通过`default`为每一个模块设置一个且只能一个默认值

```javascript
// 普通导出
export let name = 'export'
// 1 默认导出可以不用给声明加上名称 因为代表整个模块导出
export default function (num1, num2) {}
// 2 也可先声明 再导出
function sum (num1, num2) {}
export default sum
```

```javascript
// 导入模块默认值 默认值无需加上花括号{}
import sum from './module.js'
sum(1, 11)
// 导入默认值及其它导出功能 默认名称需在位于非默认名称之前
import sum, { name } from './module.js'
console.log(name) // export
sum(1, 11)
// 重命名
import { default as sum, name } from './module.js'
```

### 绑定导入，再导出

有时候我们会需要将导入的部分功能，再导出去作为另一个模块，比如作为库，这时候可以这样操作

```javascript
// new-module.js
// 1 先导入 再导出
import { identifier1, identifier2 } from './m1.js'
export { identifier1, identifier2 }
// 2 会进入模块查看sum, sayHello的定义，并导出
export { sum, sayHello } from './module.js'
// 3 完全导出
export * from './module.js'
```

完全导出需要注意一个问题，如果目标模块`module`包含了默认值，那么就无法在当前模块`new-module`再定义一个默认导出，始终遵守一个模块只能有一个默认导出的原则

### 无绑定的导入

有时候我们会对全局作用域对象进行一些附加操作，虽然模块中的代码不会自动共享到全局，但是我们还是可以在模块中对一些JS内置对象如`Array`、`Object`等进行访问，并且对这些对象的修改，可以反映到其它模块中

```javascript
// extendArray.js
// 给数组添加一个pushAll的方法
Array.prototype.pushAll = function (items) {
    // 判断items是否为数组
    if (!Array.isArray(items)) {
        throw TypeError(`arguments must be an array`)
    }
    return this.push(...items)
}
```

再通过`import './extendArray.js' `将模块引入，这里虽然没有绑定的导出与导入，但依然是一个有效的模块，在引入该模块的模块中，所有的数组都可以使用`pushAll()`方法

这种无绑定的导入，最有可能创建用于在旧环境运行新语法时做向下兼容的`polyfill`和`shim`

### 加载方式

> ES6定义了模块的语法，但未定义如何加载。

#### 在web浏览器中使用模块

在ES6之前，已经存在多种方式可以在web应用中加载JS

1. 使用`<script>`标签以及`src`属性指定加载的位置，加载JS文件；
2. 使用`<script>`标签但不使用`src`属性，嵌入内联的JS代码；
3. 加载JS代码文件并作为`Worker`（例如`Web Worker`或`Service Worker`）来执行

##### 通过script加载模块

在使用script标签时，设置type属性为module，告诉浏览器将引入的代码作为模块。且会自动应用defer属性，将模块文件下载完后，等待网页文档全部解析完，再按照模块引入顺序依次执行。如果需要异步加载模块，则可以手动加上async属性

##### 将模块作为Worker加载

为了支持模块加载，HTML标准的开发者给worker添加了第二个参数，该参数时带有`type`属性的对象，默认值为`script`，可以设置为`module`，以此来加载模块

```javascript
// 脚本方式
let worker = new Worker('script.js')

// 模块方式
let worker = new Worker('module.js')
```

模块方式其中存在两点区别：

1. worker脚本被限制只能从同源网页加载，worker模块不受限制；
2. worker脚本可以使用`self.importScripts()`方法来将额外脚本引入worker，worker模块上的`self.importScripts()`总是失败，因为应当换用成`import`