---
title: 使用自定义DC绘制一个钻石
date: 2025-02-06 17:13:01
tags: [cesium]
index_img: /img/dimond.png
---

{% dplayer "url=dc.mp4" %}

DC（Draw Command），是Cesium的一个内部API，并没有在文档中暴露，参考了岭南大佬的文章后，绘制了一个可以旋转跳跃的钻石，主要思路如下

1. 确定钻石最底部坐标为[0, 0, 0]，并通过极坐标计算 中间层及最顶层的两个六边形的坐标
2. 依据顶点顺序，生成顶点数据，以及每个顶点的颜色
3. 计算顶点索引，生成Geometry，通过GeometryPipeline的computeNormal方法计算法线
4. 将顶点位置，顶点颜色，及顶点法线分别构造为vbo，再关联好属性位置，构建vao
5. 顶点着色器中控制顶点的旋转和上下，片元着色器混合颜色，计算光照
6. 构建DC后 配合自定义Primitive添加到地图
