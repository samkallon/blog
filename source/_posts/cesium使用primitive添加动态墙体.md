---
title: cesium使用primitive添加动态墙体
date: 2023-09-04 17:53:33
tags: [Cesium]
index_img: /img/dongTaiQiangTi.png
---


踩坑记录 在网上找的教程,但是写出来怎么都不对,最后发现是geometry的 vertexFormat写错了导致shader的效果很奇怪

有点疑惑 倒是什么样子的shader 要配合 对应的顶点格式  挖个坑先


```js
/**
 * 添加动态墙体
 * @param wallList   cartesian3 list
 * @param maximumHeights 最大高度
 * @param minimumHeights 最小高度
 */
export function addWallGeojson(wallList, maximumHeights, minimumHeights, type, defaultShow) {
    const geometryInstances = wallList.map(positions => {
        positions.push(positions[0])
        return new Cesium.GeometryInstance({
            geometry: new Cesium.WallGeometry({
                positions: positions,
                maximumHeights: positions.map(e => maximumHeights),
                minimumHeights: positions.map(e => minimumHeights),
                vertexFormat: Cesium.MaterialAppearance.VERTEX_FORMAT
            })
        })
    })
    const wall = new Cesium.Primitive({
        show: defaultShow,
        geometryInstances,
        appearance: new Cesium.MaterialAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: 'DynamicWall',
                    uniforms: {
                        image: getAssetsFile('imgs/materialImg/wall.png'),
                        // image: getAssetsFile('/imgs/marker/pointMarker.png'),
                        // image: getAssetsFile('/imgs/marker/polygonMarker.png'),
                        color: new Cesium.Color.fromCssColorString(typeColorDic[type]),
                        speed: 2
                    },
                    source: `
              czm_material czm_getMaterial(czm_materialInput materialInput) {
                  czm_material material = czm_getDefaultMaterial(materialInput);
                  vec2 st = materialInput.st;
                  vec4 colorImage = texture(image, vec2((1. - fract(st.t - speed * czm_frameNumber * 0.005)), st.t));
                  vec4 fragColor;
                  fragColor.rgb = color.rgb / 1.0;
                  fragColor = czm_gammaCorrect(fragColor); // 伽马校正
                  material.alpha = colorImage.a * color.a * .5;
                  material.diffuse = color.rgb;
                  material.emission = fragColor.rgb;
                  return material;
              }
          `
                },
            })
        })
    })
    wall.name = type
    window.gViewer.scene.primitives.add(wall)
}
```