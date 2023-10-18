---
title: 优化cesium的3dtile加载速度
date: 2023-09-12 17:54:59
tags:
---

之前加载3dtile 总是要等到网络请求把第一层的json文件请求完后才会开始在底图上加载,经过如下优化,速度快了一些

```js
 const tileset2 = await Cesium.Cesium3DTileset.fromUrl(
  "http://xxxxxxxxxxxxxx/tileset.json",
  {
    maximumScreenSpaceError: 48, //决定精细度,同样的距离,值越小越精细
    skipLevels: 5,
    skipLevelOfDetail: true,  //让cesium在遍历请求tile.json的时候可以加载图块
    skipScreenSpaceErrorFactor: 128,//这三个skip的配置可以让模型立即加载
    backFaceCulling: true,
    maximumMemoryUsage: 200
  }
);

```

最快的还是下面这个 
加载时 有个merge_tile.json 加这个就会非常快
