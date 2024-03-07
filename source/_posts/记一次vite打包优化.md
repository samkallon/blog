---
title: 记一次vite打包优化
date: 2024-03-07 14:05:43
tags: [vite, 打包优化]
---

> 最近的项目打包越来越慢,甚至达到了5分多钟,但是项目并不是很大,感到很奇怪
> 于是便开始搜索打包相关的问题

## 1.分析打包产物
> 使用 rollup-plugin-visualizer 插件分析打包产物

```shell
npm i rollup-plugin-visualizer -D
```
> 在vite.config.ts中
```ts
import { visualizer } from 'rollup-plugin-visualizer'

plugins: [
    visualizer()
]
```
> 然后开始打包,打包结束会在根目录生成一个stats.html文件,打开后可以
> 看到打包产物

{% asset_img img1.png 1121%}

> 然后我发现几个geojson的文件巨大,最大的50多m,看来罪魁祸首就是他了
## 2.解决超大json问题
> 对于这些文件,我一开始是直接import到代码中的,这可能导致
> 性能问题,之后我就通过axios请求的方式获取这些数据,并删除
> import, 经过这样处理,打包速度快了很多,从之前的3-8分钟稳定
> 到40多秒
## 3.使用gzip进行压缩

> 最后还通过gzip对产物进一步优化,提升加载速度
> 
> 安装并引入

```shell
npm install vite-plugin-compression -D
```

```ts
plugins: [visualizer(),viteCompression()]
```

参数
1. filter：过滤器，对哪些类型的文件进行压缩，默认为/.(js|mjs|json|css|html)$/i
2. verbose: true：是否在控制台输出压缩结果，默认为 true
3. threshold ：启用压缩的文件大小限制，单位是字节，默认为 0
4. disable : false：是否禁用压缩，默认为 false
5. deleteOriginFile ：压缩后是否删除原文件，默认为 false
6. algorithm ：采用的压缩算法，默认是 gzip
7. ext ：生成的压缩包后缀