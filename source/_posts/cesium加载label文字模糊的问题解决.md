---
title: cesium加载label文字模糊的问题解决
date: 2023-09-05 10:52:24
tags:
---


使用canvas生成要展示的标签, 一般是背景图片加上文字 然后塞入billbord的image中 

调用 
```js
const img = getAssetsFile('imgs/marker/pointMarker.png')
const text = f.properties['qymc']
const canvas = await getBillbordCanvas({ img, text, ratio: 1, width: 465, height: 60 })
const entity = window.gViewer.entities.add({
    show: false,
    name: type,
    position: Cesium.Cartesian3.fromDegrees(...f.geometry.coordinates, 40),
    billboard: {
        image: canvas,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        // scale: 0.6,
        scaleByDistance: new Cesium.NearFarScalar(1800, 0.6, 3000, 0.4),
        // translucencyByDistance: new Cesium.NearFarScalar(1800, 1, 3000, 0.1)
    }
})
```
函数
```js

/**
 * 生成billbodr 的canvas
 * @param img
 * @param text
 */
async function getBillbordCanvas({
  img,
  ratio,
  width,
  height,
  text,
  textFontSize = '36px',
  textPositionX = width / 10 + 10,
  textPositionY = height / 2 + 15
}) {
  return new Promise(resolve => {
    const canvas = document.createElement("canvas"); //创建canvas标签
    const ctx = canvas.getContext("2d");

    canvas.style.opacity = 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    //然后将画布缩放，将图像放大ratio倍画到画布上 目的 使图片文字更加清晰
    ctx.scale(ratio, ratio);
    const image = new Image();
    image.src = img;
    // 图片创建是异步操作，需要在图片完成之后，再写入文字，能保证文字在图片上方。
    // 如果不在里面，会出现图片覆盖文字
    image.onload = function () {
      ctx.drawImage(image, 0, 0, width, height);
      // 名称文字
      ctx.font = `bold ${textFontSize} YouSheBiaoTiHei`;
      const gradient = ctx.createLinearGradient(0, 5, 0, canvas.height - 45);
      gradient.addColorStop(0, "#FFFFFF");
      gradient.addColorStop(1, "#ffffff");
      ctx.fillStyle = gradient;
      ctx.fillText(text, textPositionX, textPositionY);
      resolve(canvas)
    };
  })
}
```
