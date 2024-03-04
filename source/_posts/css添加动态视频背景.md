---
title: css添加动态视频背景
date: 2024-03-04 09:13:18
tags: [css, html]
---

> 通常我们的系统顶部会有UI切图的背景，但是有的时候我们需要动态的背景，
> 这个时候我们可以使用css来添加动态视频背景,但是如果直接添加MP4,即使
> 是透明背景的mp4也会有黑边, 如下

{% asset_img img.png 1212%}

> 如果使用css样式
```css
video{
    mix-blend-mode: screen;
}
```


> 背景又会过于透明

{% asset_img img_1.png 1212%}

> 可以考虑在底部叠加一个背景实现融合,实现了效果
```html
<div class="father" style="position: relative">
    <div style="background: url('xxx');position: absolute;z-index: 1" ></div>
    <video src="xxx" autoplay muted loop 
           style="position: absolute;z-index: 2;mix-blend-mode: screen"></video>
</div>
```

{% asset_img img_2.png 1212%}