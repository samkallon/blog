---
title: vite打包后找不到图片
date: 2023-09-06 09:59:55
tags:
---


最近启了一个vite新项目 打包之后,项目里通过getAssetsFile动态引入的静态资源全都找不到了,最后发现是路径的问题

我是这么写的
```js
export function getAssetsFile(url) {
    return new URL('../assets/' + url, import.meta.url).href;
};

```

一开始没有理解官方文档的意思，其实文档里这里已经说了，这里是不能用变量的
{% asset_img img.png 这是一个测试图片%}

只有用模板字面量的写法，才能确保是静态的路径
```js
export function getAssetsFile(url) {
    return new URL(`../assets/${url}`, import.meta.url).href;
};

```
