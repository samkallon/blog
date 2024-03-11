---
title: 使用IndexDB优化大量Billboard的加载
date: 2024-03-11 17:17:05
tags: [IndexDB, 性能优化, Cesium]
---

## 背景
最近客户反应有个图层加载比较慢,大概要等待5秒左右,这个图层就是每个企业的名字,加载的实体数量大概在1500左右. 于是着手优化 
## 验证
一开始是使用entity中的label来加载的,label的文本是企业的名称,同时注意到控制台有800多个警告

{% asset_img img.png 1231%}

然后我就到cesium的sandcastle里验证一下,我的label的text属性是Math.random(), 发现一点也不卡, 经过搜索发现,
这个label的text属性,如果是相似的文本,会有优化,由于每个label在cesium中都会调用canvas的getImageData方法,
造成了性能损失

同时我还尝试了LabelCollection看看是否有提升,结果是还不如entity,第一次加载同样需要等待,而且之后的加载也需
要等待一样的时间,entity方式加载,后续加载会比较快

于是我打算自己通过canvas生成企业的名称,并使用billboard的方式来加载.同时将生成的图片存储下来,这样下次就不用再次生成了, 优化后的加载速度在1s左右

大体逻辑如下

1. 去db中获取所有的企业图片键值对数据
2. 若没有找到,说明该企业未生成过,使用canvas生成图片,并存储到db中
3. 若找到,直接使用存储的图片

```ts
// 数据库连接,使用游标获取localforage库中的keyvaluepairs表中的全部数据
async function getAllPic() {
  return new Promise((resolve, reject) =>{
    let imgObj = {}
    try {
      const request = window.indexedDB.open("localforage");
      request.onsuccess = function (e) {
        let db = e.target.result
        try {
          const objectStore = db.transaction("keyvaluepairs").objectStore("keyvaluepairs");
          objectStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              imgObj[cursor.key] = cursor.value
              cursor.continue();
            } else {
              resolve(imgObj)
              db.close()
            }
          };
        }catch (e) {
          resolve(imgObj)
          db.close()
        }
      }
      request.onerror = function (event) {
        console.log('error')
      }
    }catch (e){
      resolve()
    }
  })
}
```


```ts
const imgObj = await getAllPic()
for (let i = 0; i < data.length; i++) {
    const e = data[i];
    // 求中心点
    if (!e?.qymc?.length){
        continue
    }
    // if (i< 10){
    // 判断是否已经生成过图像
    let imgsrc
    if (imgObj['qymcImg'+ e.qymc]){
        imgsrc = imgObj['qymcImg'+ e.qymc]
    }else{
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')
        const width = e.qymc.length * 21.5
        canvas.width = width
        canvas.height = 40
        ctx.fillStyle = color || colorDic[e.fxdjmc] || 'rgb(70,113,246)'
        ctx.fillRect(0, 0, width, 40)
        ctx.font = '800 20px 微软雅黑'
        ctx.fillStyle = '#fff'
        ctx.fillText(e.qymc, 10, 25);
        imgsrc = canvas.toDataURL("image/png")
        // 这里使用了一个库 localforage来简单的添加数据,存储base64
        localforage.setItem('qymcImg'+ e.qymc, imgsrc)
    }
    let image = new Image();
    image.src = imgsrc
    window.viewer.entities.add({
        name,
        position: Cesium.Cartesian3.fromDegrees(+e.jd,+e.wd, 25),
        billboard:{
            image,
            disableDepthTestDistance:Number.POSITIVE_INFINITY,
            translucencyByDistance:new Cesium.NearFarScalar(3000,1,3001,0)
        },
        qymc: e.qymc,
        qyid: e.id
    })

    window.viewer.entities.add({
        name,
        position: Cesium.Cartesian3.fromDegrees(+e.jd,+e.wd, 25),
        point:{
            pixelSize:8,
            color:Cesium.Color.fromCssColorString(color || colorDic[e.fxdjmc] || 'rgb(70,113,246)'),
            disableDepthTestDistance:Number.POSITIVE_INFINITY,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        qymc: e.qymc,
        qyid: e.id
    })
}

```


可以在f12中看到存储的数据

{% asset_img img_1.png 1231%}