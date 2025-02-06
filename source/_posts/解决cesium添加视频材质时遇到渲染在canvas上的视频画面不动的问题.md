---
title: 解决cesium添加视频材质时遇到渲染在canvas上的视频画面不动的问题
date: 2024-09-13 15:52:46
tags: [cesium, canvas]
---

最近在做一个视频融合的功能, 主要的形式是构建视锥体,然后将视频内容作为材质贴到视锥体的far面, 我是直接使用大华的
wsplayer播放器获取视频元素,不过大华的播放器有个问题,如果视频播放出现Error101, 就会将视频渲染到
canvas元素上面,而如果直接将canvas元素作为材质贴到面上,材质画面就只有第一帧,不会更新. 

解决思路就是新建一个镜像canvas,然后视频材质使用callbackproperty, 每次切换canvas并复制原canvas的
内容到镜像canvas,最终实现效果还是不错的.
