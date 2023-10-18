---
title: cesium添加gif
date: 2023-10-18 17:21:49
tags:
  cesium

---

两个思路
### 思路一: 用libgif.js解析gif中的图片,然后赋值到billboard中的image,通过callbackProperty实现
libgif这个库好像很老了,用npm安装后import好像不太对,然后我直接把那个js拷贝进来,然后引入js,修改一下把工厂函数挂到window上就可以正常使用了
```js
(function (root, factory) {
        window.SuperGif = factory();
}(this, function () {
  // 源代码xxxx
}))
```

```js
export async function addBillboard(list:Array<billboardList>) {
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    let gifDiv = document.createElement('div')
    let gifImg = document.createElement('img')

    // gif库需要img标签配置下面两个属性
    gifImg.setAttribute('rel:animated_src', getAssetsFile(e.imgUrl))
    gifImg.setAttribute('rel:auto_play', '1') // 设置自动播放属性
    gifDiv.appendChild(gifImg)
    let superGif = new SuperGif({
      gif:gifImg
    })
    superGif.load(()=>{
      window.viewer.entities.add({
        name:'companyPoint',
        position:Cesium.Cartesian3.fromDegrees(e.lng,e.lat),
        billboard:{
          image:new Cesium.CallbackProperty(()=>{
            return superGif.get_canvas().toDataURL()
          },false),
          // disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scale:0.5,
          pixelOffset:new Cesium.Cartesian2(0,-238*0.4*0.4),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      })
    })
  }
}
```
 
### 思路二: 直接生成html元素 然后通过viewer.scene.cartesianToCanvasCoordinates方法更新dom元素的位置

```js
export async function addBillboardV2(list:Array<billboardList>) {
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    // let gifImg = document.createElement('img')
    // gifImg.setAttribute('src',getAssetsFile(e.imgUrl))

    let gifImg = document.createElement('video')
    gifImg.setAttribute('src',getAssetsFile(e.videoUrl))

    gifImg.style.position = 'absolute'
    gifImg.style.zIndex = '10'
    gifImg.style.pointerEvents = 'none'
    gifImg.style.mixBlendMode = 'screen'
    gifImg.setAttribute('id',e.name)
    gifImg.setAttribute('width',250)
    gifImg.setAttribute('height',250/1.5)
    // gifImg.setAttribute('autoplay','true')
    // gifImg.setAttribute('muted','muted')
    // gifImg.setAttribute('loop','true')
    document.body.appendChild(gifImg)
    list[i].ele = gifImg
    // 必须得这样写 上面这个没用 gifImg.setAttribute('muted','muted')
    gifImg.muted = true
    gifImg.loop = true
    gifImg.autoplay = true
  }
  window.viewer.scene.preRender.addEventListener(async ()=> {
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      const position = Cesium.Cartesian3.fromDegrees(e.lng,e.lat,e.height);
      const canvasPosition = window.viewer.scene.cartesianToCanvasCoordinates(position, new Cesium.Cartesian2());
      if (Cesium.defined(canvasPosition)) {
        e.ele.style.top = canvasPosition.y - e.ele.height/1.2 + 'px';
        e.ele.style.left = canvasPosition.x - e.ele.width/2 + 'px';
        if (e.ele.paused){
          e.ele.play()
        }
      }
    }
  });
}
```
