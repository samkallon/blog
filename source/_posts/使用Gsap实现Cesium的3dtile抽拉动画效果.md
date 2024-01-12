---
title: 使用Gsap实现Cesium的3dtile抽拉动画效果
date: 2024-01-12 13:43:16
tags: [Cesium, gsap]
index_img: /img/gsapChouLa.png
---

> 最近在需要做一个bim的抽拉效果,模型给的是一层的3dtile,而且,中心点位置都不对,所以调位置花了点时间

> 抽拉的主要思路就是利用gsap,在间隔时间内动态生成纬度,每次重新计算tileset的modelmatrix,实现动态调整模型的效果

> 核心的方法是对tileset的modelMatrix进行计算

```js
/**
 * 动态调整模型位置,姿态,缩放, 整体思路是,将模型移动到世界坐标中心,进行旋转,缩放,
 * 然后进行从模型中心点到目标点的平移,然后再应用从世界坐标中心到模型原点的平移
 * @param tilesetId  模型primitive的id 手动赋值
 * @param sourceCenter 模型的原点中心 加载完成后默认的tileset的 tileset.boundingSphere.center属性
 * @param positionLatlng 目标位置,经纬度高度格式, 需要将模型移动到的目标位置
 * @param scale 缩放,xyz三个方向的值
 * @param rotate 旋转,xyz三个轴旋转
 */
export function updateModelMatrix({tilesetId,sourceCenter,positionLatlng,
                                      scale={x:1,y:1,z:1},rotate={x:0,y:0,z:0}}) {
    // 计算从模型默认原点到目标点的 4阶矩阵  向量相见
    const matrixMove = Cesium.Matrix4.fromTranslation(Cesium.Cartesian3.subtract(
        Cesium.Cartesian3.fromDegrees(positionLatlng.lng,positionLatlng.lat,positionLatlng.height),
        sourceCenter,
        new Cesium.Cartesian3()
    ))
    
    // 计算从世界坐标中心到模型原点的矩阵
    const backto_matrix = Cesium.Matrix4.fromTranslation(sourceCenter);
    // 计算从模型原点到世界中心的向量
    const moveto_vec = Cesium.Cartesian3.multiplyByScalar(sourceCenter, -1, new Cesium.Cartesian3());
    // 计算从模型原点到世界中心的矩阵
    const moveto_matrix = Cesium.Matrix4.fromTranslation(moveto_vec);
    // 生成缩放矩阵
    const scaleMatrix = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(scale.x, scale.y, scale.z))
    // 移动到世界坐标中心并缩放
    const tempScaleMatrix = Cesium.Matrix4.multiply(scaleMatrix,moveto_matrix,new Cesium.Matrix4())
    // 计算旋转矩阵
    const rotateZMatrix = Cesium.Matrix4.fromRotation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotate.z)))
    const rotateYMatrix = Cesium.Matrix4.fromRotation(Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(rotate.y)))
    const rotateXMatrix = Cesium.Matrix4.fromRotation(Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(rotate.x)))
    const rotateMatrixTemp = Cesium.Matrix4.multiply(rotateZMatrix,rotateYMatrix,new Cesium.Matrix4())
    const rotateMatrix = Cesium.Matrix4.multiply(rotateXMatrix,rotateMatrixTemp,new Cesium.Matrix4())
    // 在世界坐标中心,应用缩放,和旋转
    const yuanDianRotateScaleMatrix = Cesium.Matrix4.multiply(rotateMatrix,tempScaleMatrix,new Cesium.Matrix4())
    // 旋转缩放后, 将模型应用平移到目标点的矩阵
    const yuanDianMoveMatrix = Cesium.Matrix4.multiply(matrixMove,yuanDianRotateScaleMatrix,new Cesium.Matrix4())
    // 移动回原来的坐标
    const matrix4Final = Cesium.Matrix4.multiply(backto_matrix,yuanDianMoveMatrix,new Cesium.Matrix4())
    // 应用旋转
    const tileset = getTilesetById(tilesetId)
    tileset.modelMatrix = matrix4Final

}
```

> 使用gsap的to方法,在一定时间内动态改变纬度值,并在回调方法中重新计算modelMatrix

```js
// positionLatlng 为原来的位置
// chouLaPosition 为抽拉后的中心位置
const dynamicLat = {lat:currData.positionLatlng.lat}
gsap.to(dynamicLat,{
    lat:currData.chouLaPosition.lat,
    duration: 1,
    ease: "power3.inOut",
    onUpdate: function (a, b, c) {
        updateModelMatrix({
            tilesetId:currData.id,
            sourceCenter:currData.sourceCenter,
            positionLatlng: {
                lat:dynamicLat.lat,
                lng:currData.chouLaPosition.lng,
                height:currData.chouLaPosition.height,
            },
            scale:currData.scale,
            rotate:currData.rotate,
        })
    }
})
```

