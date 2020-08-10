---

title: 浅析HTTP缓存
categories:
 - 网络
tags:
 - HTTP
---

### 前言

> 浏览器缓存机制有**四个方面**，按照资源获取优先级排列，分别是`Memory Cache`、`Service Worker Cache`、`HTTP Cache`、`Push Cache`。我们经常使用，也比较熟悉的是HTTP Cache。这里单独分析HTTP Cache。

<!-- more -->

### HTTP Cache

HTTP Cache又分为**强缓存**和**协商缓存**，强缓存优先级比较高，未命中强缓存时才走协商缓存。

#### 强缓存

强缓存是通过http头的`expires`和`cache-control`来实现控制。当再发出请求时，浏览器会根据`expires`和`cache-control`来判断是否命中强缓存，若命中直接从缓存中获取资源，而不再与服务端进行通信。

在http1.0版本中，服务器响应时会返回一个缓存过期时间戳字段`expires`，再次发起请求时浏览器通过本地时间与`expires`时间戳对比，来判断缓存是否过期，这种依赖本地时间的方式会存在一个弊端，如果修改了本地时间，或者本地时间与服务端时间不同步，这将达不到我们预期的缓存效果。

因此，在http1.1版本中，引入了`expires`的替代方案：`Cache-Control`。`Cache-Control`能做`expires`做的事，也能做`expires`做不到的事情，目前`expires`还存在是为了做向下兼容。

`Cache-Control`的格式为：

```js
Cache-Control: max-age=3600
```

在`Cache-Control`中，`max-age`字段表示资源最大缓存时间（秒），上面例子表示在3600秒内该资源都是有效的。`Cache-Control`表示的时间比`expires`时间戳更为准确，同时`Cache-Control`优先级更高，两者存在时以`Cache-Control`为准。

`Cache-Control`还有其它的缓存方式：`no-cache`和`no-store`。

如果给资源设置了`no-cache`，则会绕开浏览器，直接询问服务器该资源是否过期，即走**协商缓存**。`no-store`顾名思义，就比较绝情了，不设置任何缓存，每次发起请求不经过浏览器与服务端缓存，直接想服务器发送请求，并下载完整的响应。

#### 协商缓存

协商缓存，顾名思义就是浏览器与服务器合作的缓存策略，它依赖于浏览器与服务器之间的通信，浏览器需要向服务器询问缓存的相关信息，进而判断是读取本地缓存的资源还是重新发起请求，下载完整的响应。

##### 协商缓存的实现

**Last-Modified**

`Last-Modified`是一个时间戳，在启用协商缓存之后，会在首次请求的时候，随着Response Headers返回

```javascript
Last-Modified: Wed, 12 Feb 2020 09:21:28 GMT
```

随后每次请求会带上`If-Modified-Since`时间戳字段，值为上一次Response返回的`Last-Modified`值

```javascript
If-Modified-Since: Wed, 12 Feb 2020 09:21:28 GMT
```

服务器收到这个时间戳之后，会根据该时间戳与服务器的资源的最后修改时间对比，如果时间改变，则返回一个新的完整的响应，并在Response Headers返回新的`Last-Modified`值；如果时间没有变化，则返回一个304状态码，提示资源并未改动，然后重定向到浏览器缓存，Response Headers也不会再返回`Last-Modified`字段，如下图：

![304](/images/304.png)

但是使用`Last-Modified`也会存在弊端：

- 资源文件改动了，但是并没有改变内容，文件的最后修改时间会变化，导致该资源会被重新请求
- `If-Modified-Since`是以秒为单位做检验，如果改动文件的时间小于1000ms，那么该资源有可能被认为是未改变的，导致无法重新请求

这两种情况反映了一个问题，无法准确感知文件是否发生改变。

为了解决该问题，`Etag`出现了。

`Etag`是服务器为每个资源生成的唯一的**标识字符串**，这个标识字符串是基于文件内容编码的，文件内容不同，对应的 `Etag` 就是不同的，因此`Etag` 能够精准地感知文件的变化。

`Etag` 和 `Last-Modified` 类似，当首次请求时，我们会在响应头里获取到一个最初的标识符字符串，它可以是这个样子

```javascript
ETag: W/"1q2w-108946715"
```

在下一次请求时，会带上与之相同值的字段`if-None-Match`，提供给服务器对比

```javascript
If-None-Match: W/"1q2w-108946715"
```

很明显，`Etag`有利也有弊，它的生成需要服务器付出额外的开销，会影响服务器的性能，`Etag`并不能直接代替`Last-Modified`，而是作为补充，它的优先级比`Last-Modified`高，两者共存时，以`Etag`为准。

### HTTP缓存策略

对于上面讲的知识点，要如何对应到实际的开发中呢，这边拿了谷歌官方的一张图：

![缓存策略](/images/缓存策略.png)

这张图片清楚地给我们展示了缓存策略流程。

首先看看资源的可复用性，如果是不可复用的话，很干脆，直接把`Cache-control`设置为`no-store`，不需要任何形式的缓存。

如果是可复用的资源，那么看看是否需要每次都向服务器去验证缓存是否有效，如果需要，则设置`Cache-control`为`no-store`，不需要的，则进行下一步，考虑资源是否可被代理服务器缓存，根据情况设置`private`或`public`；接着考虑资源的过期时间，设置资源的`max-age`；最后一步配置协商缓存，设置`Last-Modified`和`Etag`。

### 结语

HTTP缓存的知识点比较琐碎，很多人过段时间很容易忘记。只有多分析多总结，才能够把握这些知识。