---
title: element背景模糊样式
date: 2024-03-20 23:33:07
tags: [css, background]
---


{% asset_img img.png 1212%}

突然发现element plus的顶部的背景模糊效果，还挺好看的，看了一下F12 是这三个属性实现的

```css
{
    background-image: radial-gradient(transparent 1px, #ffffff 1px);
    background-size: 4px 4px;
    backdrop-filter: saturate(50%) blur(4px);
}
```