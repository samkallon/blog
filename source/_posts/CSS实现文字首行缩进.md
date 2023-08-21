---
title: CSS实现文字首行缩进
date: 
tags: 
- CSS
- css
---

css中提供了首行缩进的属性，只要将​text-indent​设置一个值，就能实现首行缩进的效果。最常用的值是以em为单位的值，​2em​表示二倍当前字体大小，以​16px​为例，​2em​就是​32px​，也就是两个字符的距离。

```html
<div class="text">
    测试文本吼吼吼吼吼吼吼吼吼吼吼吼吼吼吼
</div>
```

```css
.text{
    text-indent: 2em; //首行缩进 2em表示二倍当前字体大小
}
```

