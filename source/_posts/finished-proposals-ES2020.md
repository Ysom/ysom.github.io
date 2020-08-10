---

title: 振奋人心的ES2020新特性！
categories:
 - 前端
tags:
 - JS
---

ES2020已完成的[提案](https://github.com/tc39/proposals/blob/master/finished-proposals.md)中，有了比较振奋人心的新特性。下面来看看几个比较有意思的特性

### BigInt

在JS的`Number`类型中，安全值的范围为`Number.MIN_SAFE_INTEGER`-`Number.MAX_SAFE_INTEGER`，即-(2<sup>53</sup>-1)~2<sup>53</sup>-1，超出该范围整数计算或表示将会丢失精度

```javascript
let max_num = Number.MAX_SAFE_INTEGER // 9007199254740991
let more_num = max_num + 1 // 9007199254740992
let more_max_num = max_num + 2 // 9007199254740992
```

可以看到，当数值超过安全范围时，就不会正确表示，甚至还有以下情况

<!-- more -->

```javascript
9007199254740992 === 9007199254740993 // true
```

新规范`BigInt`就是用来解决大数计算问题，同时它也属于原始类型。可以在整数后面加上n或者BigInt函数来实现

```javascript
// 直接在整数后面加n
let bigNum = 9007199254740993n

// 使用BigInt函数
let bigNum = BigInt(9007199254740993)
// or 
let bigNum = BigInt('9007199254740993')

// 大数运算
let superNum = 9007199254740993n + 9007199254740993n 
// 18014398509481986n
typeof superNum // 'bigInt'
```

需要注意的是，使用`BigInt`函数实例化大数时，会将参数进行Number类型的实例化，超出安全范围的数字可能会引起精度丢失

### Promise.allSettled

用过`Promise.all`的都知道，这方法有一个比较明显的缺陷，只要其中一个Promise被`reject`，整个`Promise.all`就会挂掉，剩下的Promise都会停止执行。例如在一个用户模块中，通过并发异步请求多个版块的数据，只要其中一个服务挂了，其它的版块也就不会拿到数据。很明显，这并不是我们想要的，我们希望并发的任务，不管是异常还是正常，都可以返回对应的状态和值，这样就可以最大限度地保证服务的可访问性。新特性`Promise.allSettled`就是来满足这一要求的

```javascript
Promise.allSettled([
    Promise.reject({status: 'fail', msg: '服务异常'}),
    Promise.resolve({status: 'suc', data: {}}),
    Promise.resolve({status: 'suc', data: {}})
]).then(result => {
    /*
    * 0: {status: 'rejected', reason: {}},
    * 1: {status: 'fulfilled', value: {}},
    * 2: {status: 'fulfilled', value: {}}
    */
})
```

当服务异常时，会返回status和reason字段，reason值为reject的值，而当服务正常时，会返回status和value字段。可以通过filter函数来过滤出fulfilled状态的数据，从而实现服务正常的数据渲染

### globalThis 

一般我们很难写出可移植的js代码来访问全局对象，因为在不用的环境全局对象也不同。在web中，全局对象为`window`、`self`，在node中，为`global`，甚至很多时候会使用`this`来访问全局对象，但是`this`严重依赖上下文，还会存在各种改变`this`指向的情况，这会导致更加复杂。而现在，通过一个`globalThis`就可以轻松获取到当前环境下的全局对象，是不是很清爽？

### optional Chaining 

如果我们要使用到多层级对象中的某个属性，为了避免属性不存在时抛出错误，需要经过一系列前置的繁琐的判断

```javascript
let data = {}
if (data && data.options && data.options.name) {
    let name = data.options.name
}
```

看起来很麻烦。有了**可选链**新特性后，只需简单一句代码

```javascript
let name = data?.options?.name
```

判断`?`前的属性是否存在，存在才会继续查询`.`后面的属性。简化了大量前置校验，且更为安全

### Nullish coalescing Operator

在对某个变量或对象的属性赋值时，我们会经常做以下类似的操作

```javascript
let defaultFlag = 'default'
let obj = {
    name: defaultFlag || 'obj',
    value: 18,
    level: 0
}
```

当`defaultFlag`转换为布尔值是true的时候，就会采用`defaultFlag`代表的值，否则采用值`obj`，但是这会有一些问题，比如值为0的时候，`defaultFlag`的值就为false，这会跳过0直接赋值为后面的值，如果我们允许0的存在，那这里就会出现预想中的误差。再看新特性**空值合并运算符** `??`

```javascript
let level = obj.level ?? '暂无等级'
```

使用空值合并运算符之后，只有当值为`undefined`、`null`的时候，才会跳过，赋值为后面的值