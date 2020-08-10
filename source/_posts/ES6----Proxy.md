---

title: ES6 -- Proxy
categories:
 - 前端
tags:
 - 总结
---

### 前言

本文总结了`Proxy`代理的陷阱函数和对应的`Reflect`接口默认行为函数的用法。因为目前用的最多的技术栈是`Vue`，而`Vue3.0`版本其中关于响应式原理的核心是`Proxy`，因此有必要对`Proxy`做进一步的理解和总结。

### set

拦截对象：设置属性值行为。成功返回`true`，失败返回`false`。

默认行为实现：`Reflect.set()`

<!-- more -->

接收参数：

1. **trapTarget**：设置属性的对象（代理的目标对象）
2. **key**：属性的键
3. **value**：属性的值
4. **receiver**：操作发生的对象（通常指代理对象）

### get

拦截对象：获取属性值行为。

默认行为实现：`Reflect.get()`

接收参数：

1. **trapTarget**：获取属性的对象（代理的目标对象）
2. **key**：属性的键
3. **receiver**：操作发生的对象（通常指代理对象）

骚操作：属性不存在时可明确抛出错误，而不是返回`undefined`

```javascript
let target = {}
let proxyTar = new Proxy(target, {
    get (trapTarget, key, receiver) {
        if (!(key in receiver)) {
            throw new TypeError(`property ${key} is not exist`)
        }
        return Reflect.get(trapTarget, key, receiver)
    }
})
```



### has

拦截对象：`in`操作符。成功返回`true`，失败返回`false`。

默认行为实现：`Reflect.has()`

接收参数：

1. **trapTarget**：读取属性的对象
2. **key**：需要检查的属性的键

骚操作：通过返回`false`，隐藏属性

```javascript
let target = {
    name: '小叮当',
    _age: 18
}
let proxyTar = new Proxy(target, {
    has (trapTarget, key) {
        // 隐藏_age属性
        if (key === '_age') {
            return false
        }
        return Reflect.has(trapTarget, key)
    }
})
```



### deleteProperty

拦截对象：`delete`操作符。成功返回`true`，失败返回`false`。

默认行为实现：`Reflect.deleteProperty()`

接收参数：

1. **trapTarget**：删除属性的对象
2. **key**：需要删除的属性的键

骚操作：通过返回`false`，设置属性不可删除

```javascript
let target = {
    name: '小叮当',
    age: 18,
    idCard: '75423546574xxx'
}
let proxyTar = new Proxy(target, {
    deleteProperty (trapTarget, key) {
        // idCard属性不可删除
        if (key === 'idCard') {
            return false
        }
        return Reflect.deleteProperty(trapTarget, key)
    }
})
```



### getPrototypeOf

拦截对象：`Object.getPrototypeOf()`。返回值必须是一个对象或者是`null`，其它类型返回值会引发错误。

默认行为实现：`Reflect.getPrototypeOf()`

接收参数：

1. **trapTarget**：需要获取原型的对象

骚操作：可通过返回`null`来隐藏对象原型

### setPrototypeOf

拦截对象：`Object.setPrototypeOf()`。操作不成功时应返回`false`以让`Object.setPrototypeOf()`抛出错误，若返回不为`false`，则认为操作成功。

默认行为实现：`Reflect.setPrototypeOf()`

接受参数：

1. **trapTarget**：需要设置原型的对象
2. **proto**：被用作原型的对象

骚操作：可通过返回`false`使对象原型不可被设置

**为何存在`Reflect.getPrototypeOf()`、`Reflect.setPrototypeOf()`与`Object.getPrototypeOf()`、`Object.setPrototypeOf()`两组方法？**

两组方法作用虽然相似，但还是存在一些比较显著的差别：

1. 前者属于JS引擎底层操作，后者属于高级操作；
2. `Reflect.getPrototypeOf()`接收的参数不是对象时会抛出错误；而`Object.getPrototypeOf()`操作前会先将参数转换为对象；
3. `Reflect.setPrototypeOf()`会返回布尔值`true`或`false`表示成功或失败，`Object.setPrototypeOf()`操作失败时会报错，成功时会将第一个参数作为返回值；

因此，Object两个原型操作方法并不适合用来实现代理陷阱的默认行为。

### 对象可扩展性的陷阱函数

### preventExtensions

拦截对象：`Object.preventExtensions()`。返回`true`或`false`表示操作成功或失败。

默认行为实现：`Reflect.preventExtensions()`。

接收参数：

1. **trapTarget**：设置不可扩展的对象

### isExtensible

拦截对象：`Object.isExtensible()`。返回`true`或`false`表示操作成功或失败。

默认行为实现：`Reflect.isExtensible()`。

接收参数：

1. **trapTarget**：设置可扩展的对象

**为何存在`Reflect.preventExtensions()`、`Reflect.isExtensible()`与`Object.preventExtensions()`、`Object.isExtensible()`两组方法？**

两组方法几乎一致，但有一些差别：

1. 接收的参数不为对象时，`Object.isExtensible()`是返回`false`，而`Reflect.isExtensible()`会抛出错误；
2. `Object.preventExtensions()`不管参数是否是对象，都会将参数值作为自身返回值，而`Reflect.preventExtensions() `方法则会在参数不是对象时抛出错误，在参数为对象时返回`true`或`false`表示操作成功或失败；
3. 底层功能的方法与对应的高层方法相比，会进行更为严格的校验；

### 属性描述符的陷阱函数

### definedProperty

拦截对象：`Object.defineProperty()`，返回`true`或`false`表示操作成功或失败。

默认行为实现：`Reflect.defineProperty()`。

接收参数：

1. **tarpTarget**：被定义属性的对象
2. **key**：属性的键
3. **descriptor**：为该属性准备的描述符对象

骚操作：可通过主动返回`false`让`Object.defineProperty()`抛出错误失败，也可通过返回`true`而不调用`Reflect.defineProperty()`来让`Object.defineProperty()`静默失败。

### getOwnPropertyDescriptor

拦截对象：`Object.getOwnPropertyDescriptor()`，返回对应的描述符。

默认行为实现：`Reflect.getOwnPropertyDescriptor()`。

接收参数：

1. **tarpTarget**：被检索属性的对象
2. **key**：属性的键

**为何存在`Reflect.defineProperty()`、`Reflect.getOwnPropertyDescriptor()`与`Object.defineProperty()`、`Object.getOwnPropertyDescriptor()`两组方法？**

两组方法几乎一致，但也有一些差别：

1. `Object.defineProperty()`返回第一个参数值，而`Reflect.defineProperty()`返回`true`或`false`;
2. 第一个参数不是对象时，`Object.getOwnPropertyDescriptor()`会将第一个参数转为对象，而`Reflect.getOwnPropertyDescriptor()`会抛出错误；

### ownKeys

拦截对象：内部方法`[[OwnPropertyKeys]]`，返回一个数组重写该行为。数组被用于四个方法：`Object.keys()`、`Object.getOwnPropertyNames()`、`Object.getOwnPropertySymbols()`、`Object.assign()`，也能影响到`for-in`循环。不是返回数组或类数组对象，会抛出错误。

默认行为实现：`Reflect.ownKeys()`，返回一个由全部自有属性的键构成的数组，无论键的类型是**字符串**还是**符号**。

接收参数：

1. **trapTarget**：获取属性的目标对象

骚操作：可通过设置，不返回比如拥有下划线的属性（一般被定义为私有属性）

```javascript
let target = {
    name: 'target',
    _name: 'private_target' // 私有属性
}
let proxyTarget = new Proxy(target, {
    ownKeys (trapTarget) {
        return Reflect.ownKeys(trapTarget).filter(key => {
            // 可返回符号类型、字符类型且不包含下划线的属性
            return typeOf key !== 'string' || key[0] !== '_'
        })
    }
})
```



### apply和construct

拦截对象：内部方法`[[Call]]`和`[[Construct]]`，前者会在函数被直接调用时执行，而后者会在函数被使用`new`运算符调用时执行。

apply陷阱函数(`Reflect.apply()`同样)接收参数：

1. **trapTarget** ：被执行的函数（即代理的目标对象）；
2. **thisArg** ：调用过程中函数内部的 this 值；
3. **argumentsList** ：被传递给函数的参数数组。

construct陷阱函数接收参数：

1. **trapTarget** ：被执行的函数（即代理的目标对象）；
2. **argumentsList** ：被传递给函数的参数数组。

`Reflect.construct()`除了上述两个参数，还有第三个可选参数`newTarget`，此参数指定了函数内部`new.target`的值。

骚操作：可以验证函数的类型；还可以不使用`new`来调用构造器；还可以限制函数只能通过`new`来调用等等。。。

### 撤销代理

一般代理创建之后不会被解绑，如果想要创建一个可被撤销的代理，可通过`Proxy.revocable()`方法，该方法跟`Proxy`构造器一样接收两个参数：

1. **trapTarget**：被代理的目标对象
2. **handler**：代理处理器

然后会返回一个包含以下属性的对象：

1. **proxy**：可被撤销的代理对象
2. **revoke**：用于撤销代理的函数

通过调用`revoke()`，就无法再对`proxy`进行更多的操作，任何跟`proxy`的交互都会触发陷阱函数，从而抛出错误。

