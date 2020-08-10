---

title: JavaScript整理总结(持续更新)
categories:
 - 前端
tags:
 - 总结
---

### 数据类型、存储方式

- 原始（基本）类型，变量存储的是在栈内存的值`string`、`number`、`boolean`、`undefined`、`null`、`symbol`、（以及提案新增的`BigInt`）

- 引用（复杂）类型，变量存储的是在栈内存中的指针（地址），指向存储的地址，地址所在的堆内存存放着值。引用类型都是`object`

### typeof和instanceof

<!-- more -->

#### typeof

- 原始类型：除了`null`判断为`object`，其它的原始类型可以正确判断

- 对象类型：除了函数判断为`function`，其它的对象类型都为`object`

#### instanceof

判断操作符右边的函数的原型是否存在于左边的对象的原型链上可以准确判断引用类型，无法正确判断原始类型

### 正确判断变量类型的方式

1. `Object.prototype.toString.apply(target)` // `'[object xxx]'`获取索引的第八位到最后一位

2. 先通过`typeof`判断是否为复杂类型，是则使用`instanceof`判断

   ```javascript
   data && (typeof(data) === 'object' || typeof(data) === 'function')
   
   class PrimitiveUndefined {
      static [Symbol.hasInstance](data) {
          return typeof data === 'undefined';
      }
   }
   
   data instanceof PrimitiveUndefined
   // 其它基本类型...
   ```

### ==、===

- `==`符号只判断两个变量的值是否相等，`===`判断两个变量的类型和值
- `==`判断过程中，若两变量的类型不同，则会涉及到变量类型转换

### 类型转换

在JS中，类型转换只有三种情况

1. 转换为布尔值

2. 转换为数字

3. 转换为字符串

下面图为转换规则

![转换规则](/images/转换规则.png)

### var、let、const

- `var`声明的变量会被提升到作用域顶部，声明了全局变量则会挂载在window上面

- `let`跟`const`声明的变量存在暂时性死区，因此在变量声明前调用会报错
- `const`声明的变量是常量，为基础类型时值不能改变，复杂类型时地址不能改变

### 变量提升

1. 变量还没有被声明，但是可以被使用（值为`undefined`），提升的是声明（`var`声明）

2. 函数也会被提升到作用域顶部，因此函数可以在声明之前调用，且函数提升优先于变量提升

### this指向

1. 指向全局对象window

2. 指向调用方法的对象

3. 指向new操作符赋值后的对象

4. 箭头函数没有this，也无法使用bind，this指向包裹该箭头函数的第一个普通函数

5. 函数绑定多层bind的情况，由第一个bind决定

   ```javascript
   fn.bind().bind(a)()
   ```

6. 多个规则下this指向优先级：`new` > `bind` > `obj.fn` > `fn`

### apply、call、bind

#### apply

#### call

#### bind

### 闭包

#### 闭包是什么

> 闭包是函数和声明该函数的词法环境的组合 --MDN

我的理解是，函数+该函数体可以访问的变量总和；函数不一定是在另一个函数里面声明，它也可以在外部声明，在另一个函数内部重新赋值

#### 闭包的作用

闭包的最多用途还是在于隐藏变量，常用于实现私有变量

### 深、浅拷贝

> 深、浅拷贝的区别就是拷贝的值存在引用类型时，浅拷贝会把地址复制，而深拷贝不会

#### 浅拷贝

##### `Object.assign()`

#####  `...`扩展运算符

#### 深拷贝

##### `JSON.parse(JSON.stringify(obj))`

局限性：

1. 不能序列化undefined、函数和symbol，会忽略

2. 存在对象循环引用时，会报错

##### `MessageChannel`

当有内置类型，且不包含函数时使用

```javascript
function MesCalDeepClone (obj) {
    return new Promise((resolve) => {
      let {port1, port2} = new MessageChannel()
      port2.onmessage = (ev) => resolve(ev.data)
      port1.postMessage(obj)
    })
}
```

### 原型

原型`__proto__`是一个对象，里面预设了一些函数和属性，包括了构造函数`constructor`；而构造函数拥有`prototype`属性，指回了原型对象，通过构造函数生成的实例对象，会自动将构造函数的原型设置为实例对象的原型。

### 原型链

对象拥有原型对象，而原型对象也会拥有自己的原型，依次类推形成一条原型链，直到原型对象为`null`时结束即`Object.prototype.__proto__`

### 继承

> 在新的对象上复用现有对象的属性和方法，有助于避免重复代码和重复数据。

#### 原型继承

将函数A的原型赋值为函数B的实例，函数B的实例具有函数的全部属性以及指向超类的原型，以此实现原型继承。

这里借用《js忍者秘籍》第二版里面的一个例子

```javascript
function Person () {}
Person.prototype.dance = function () {}
function Ninja () {}
// Ninja的原型赋值为Person的实例
Ninja.prototype = new Person()
```

![img](/images/原型继承例子.png)

这里有一个要注意的地方，当把`Ninja`的原型设置为`Person`的实例对象之后，`Ninja`和它原来的原型失去了联系，现有的原型的构造函数`constructor`也是指向`Person`而不是指向`Ninja`，所以需要做一步操作，重新建立起Ninja实例与Ninja的联系

```javascript
Object.definedProperty(Ninja.prototype, 'constructor', {
  enumerable: false, // 不可枚举
  value: Ninja, // 值为Ninja
  writable: true
})
```

#### class

class的出现是为了解决什么问题？为了让其它面向对象语言开发者适应和熟悉，ES6增加了关键字class来模拟类，class是语法糖，它的底层实现原理还是**原型继承**，使用`extends`也可以更优雅地继承

### new操作符的过程

1. 创建一个空对象
2. 将该空对象作为上下文`this`传入构造函数
3. 对该对象进行一系列初始化
4. 返回该对象或函数指定的其它对象（非对象会忽略）

### 事件循环

事件循环中包含着几个比较重要的概念：

任务：宏任务、微任务

事件队列：宏任务队列、微任务队列

### 用setTimeout延迟执行事件、setInterval间隔执行事件

1. `setTimeout`：延迟设定的时间执行，实际延迟时间大于等于设定的时间
2. `setInterval`：间隔设定的时间执行，实际执行次数并不等于时间内间隔时间次数；当宏任务队列里面已经存在等待执行的该间隔任务，则不会再将该间隔任务添加进宏任务队列

### 事件捕获、冒泡

1. **捕获**：事件自顶向下传递，从顶部元素到目标元素
2. **冒泡**：事件自底向上传递，从目标元素到顶部元素若没指定捕获模式，则事件默认为冒泡模式 

### 事件处理器中的this和event.target的区别

1. `this`指向注册事件处理器的元素
2. `event.target`指向事件发生的元素

### 自定义事件

通过内置的`CustomEvent`构造函数和`dispatchEvent`方法实现自定义事件的**创建**和**分发**；

自定义事件的优势是**代码解耦**，可以编写共享代码，且更易于维护、调试

```html
<script>
  /*
  * @params
  * target绑定事件的对象名称 eventName事件名称 eventDetail事件参数
  */
  function triggerEvent (target, eventName, eventDetail) {
    let event = new CustomEvent(eventName, {
      detail: eventDetail
    })
    // 向指定元素派发事件
    target.dispatchEvent(event)
  }
  // 给document绑定myEvent事件
  triggerEvent(document, 'myEvent', {customName: 'my-event'})
</script>
```





