---
title: vue3动态引入文件夹下的所有文件
date: 2024-02-26 14:27:40
tags: [vue, 动态]
---
> 有时我们会将相似的数据都放在同一个文件夹下,引用时如果一个一个引用就会有很多的重复代码,这时我们可以使用动态引入来解决这个问题

> 比如 我们想引用public文件夹下qiYeJianKongPoint文件夹下的所有json文件,可以这样写

```js
const allQiYePoint = import.meta.glob('/public/qiYeJianKongPoint/*.json', { eager: true})
```

> 打印出来是一个对象,key是路径,value中的default是数据

{% asset_img img.png %}