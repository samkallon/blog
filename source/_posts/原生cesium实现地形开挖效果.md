---
title: 原生cesium实现地形开挖效果
date: 2023-01-13 15:18:53
tags: [前端, cesium]
index_img: /img/kaiWa.png
---
参考
>https://blog.csdn.net/u013869554/article/details/120535940

## 效果
{% asset_img img.png 这是一个测试图片%}

### 总结
1. 对于凹多边形,地形裁切会有bug
2. 无法同时裁切多个洞
3. 边界放大看会有细小的偏差


### 扩展
在cesium的github中发现有人实现了多个挖洞的效果,可以参考
> https://github.com/CesiumGS/cesium/issues/8751

{% asset_img multiDig.gif 1212%}

## 实现思路
1. 通过绘制得到封闭的多边形
2. 通过多边形的坐标计算裁切平面并裁切地形
3. 地形采样,获取最低点的高度,生成开挖底面并贴材质
4. 通过地形采样,生成侧面墙体并贴材质


## 图片资源
{% asset_img bottom.jpg 1212%}
{% asset_img wall.jpg 1212%}

## 代码
调用
```js
import TerrainClipPlan from "@/widgets/TerrainClipPlan";

const terrainClipPlanInstance = new TerrainClipPlan(viewer, {
  height: 100,
  splitNum: 1000,
  bottomImg: require('@/assets/img/dig_terrian_img/bottom.jpg'),
  wallImg: require('@/assets/img/dig_terrian_img/wall.jpg')
})
terrainClipPlanInstance.updateTerrainClipData(pointList)
```
类文件
```js
import * as turf from '@turf/turf'
import * as booleanClockwise from '@turf/boolean-clockwise'

function TerrainClipPlan(t ,i) {
    this.viewer = t,this.options = i || {},this._positions = i.positions,this._height = this.options.height || 0,
    this.bottomImg = i.bottomImg,this.wallImg = i.wallImg,this.splitNum = Cesium.defaultValue(i.splitNum, 50),
    this._positions && this._positions.length > 0 && this.updateTerrainClipData(this._positions)
}

Object.defineProperties(TerrainClipPlan.prototype, {
    show: {
        get: function () {
            return this._show
        },
        set: function (e) {
            this._show = e, this.viewer.scene.globe.clippingPlanes && (this.viewer.scene.globe.clippingPlanes.enabled = e), this._switchExcavate(e)
        }
    },

    height: {
        get: function () {
            return this._height
        },
        set: function (e) {
            this._height = e
        }
    }
})

/**
 *
 * @param pointList  cartesian3 数组
 */
TerrainClipPlan.prototype.updateTerrainClipData = function (pointList) {
    this.clear();
    // 对点做处理,如果不是逆时针 变为逆时针
    if(this.ifAntiClockwise(pointList)){
        pointList.reverse()
    }
    var t = [],
        pointLength = pointList.length,
        a = new Cesium.Cartesian3,
        n = Cesium.Cartesian3.subtract(pointList[0], pointList[1], a);
        n = n.x > 0, this.excavateMinHeight = 9999;
    for (let i = 0; i < pointLength; ++i) {
        var nextPointIndex = (i + 1) % pointLength,
        u = Cesium.Cartographic.fromCartesian(pointList[i]),
        c = this.viewer.scene.globe.getHeight(u) || u.height;
        c < this.excavateMinHeight && (this.excavateMinHeight = c);

        var midpoint = Cesium.Cartesian3.add(pointList[i], pointList[nextPointIndex], new Cesium.Cartesian3());
        midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);

        var up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());

        var right = Cesium.Cartesian3.subtract(pointList[nextPointIndex], midpoint, new Cesium.Cartesian3());
        if(right.x===0 && right.y===0 && right.z===0){
            continue;
        }
        right = Cesium.Cartesian3.normalize(right, right);

        var normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
        normal = Cesium.Cartesian3.normalize(normal, normal);

        var originCenteredPlane = new Cesium.Plane(normal, 0.0);
        var distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint);

        t.push(new Cesium.ClippingPlane(normal, distance));
    }
    const clippingPlaneCollection = new Cesium.ClippingPlaneCollection({
        planes: t,
        edgeWidth: 1,
        edgeColor: Cesium.Color.WHITE,
        enabled: true
    })
    this.viewer.scene.globe.clippingPlanes = clippingPlaneCollection

    try {
        if (window.sjswTileset){
            const clipTileset = new Cesium.ClippingPlaneCollection({
                planes: t,
                edgeWidth: 1,
                edgeColor: Cesium.Color.WHITE,
                modelMatrix: Cesium.Matrix4.inverse(
                  Cesium.Transforms.eastNorthUpToFixedFrame(window.sjswTileset.boundingSphere.center),
                  new Cesium.Matrix4()
                )
            })
            window.sjswTileset.clippingPlanes = clipTileset
        }
    }catch (e) {

    }

    this._prepareWell(pointList)
    this._createWell(this.wellData)
}

TerrainClipPlan.prototype.clear = function () {

    if(this.viewer.scene.globe.clippingPlanes){
        this.viewer.scene.globe.clippingPlanes.enabled = false
        if (!this.viewer.scene.globe.clippingPlanes.isDestroyed()){
            this.viewer.scene.globe.clippingPlanes.removeAll()
            // this.viewer.scene.globe.clippingPlanes.destroy()
        }
    }
    if (window?.sjswTileset?.clippingPlanes?.removeAll){
        window.sjswTileset.clippingPlanes.removeAll()
    }
    if(this.bottomSurface){
        this.viewer.scene.primitives.remove(this.bottomSurface)
        delete this.bottomSurface
    }
    if (this.wellWall){
        this.viewer.scene.primitives.remove(this.wellWall)
        delete this.wellWall
    }
    this.viewer.scene.render()
}

TerrainClipPlan.prototype._prepareWell = function (e) {
    var t = this.splitNum,
        i = e.length;
    if (0 != i) {
        for (var a = this.excavateMinHeight - this.height, n = [], r = [], s = [], l = 0; l < i; l++) {
            var u = l == i - 1 ? 0 : l + 1,
                c = Cesium.Cartographic.fromCartesian(e[l]),
                d = Cesium.Cartographic.fromCartesian(e[u]),
                h = [c.longitude, c.latitude],
                f = [d.longitude, d.latitude];

            0 == l && (
                s.push(new Cesium.Cartographic(h[0], h[1])),
                    r.push(Cesium.Cartesian3.fromRadians(h[0], h[1], a)),
                    n.push(Cesium.Cartesian3.fromRadians(h[0], h[1], 0)));

            for (var p = 1; p <= t; p++) {
                var m = Cesium.Math.lerp(h[0], f[0], p / t),
                    g = Cesium.Math.lerp(h[1], f[1], p / t);
                l == i - 1 && p == t || (
                    s.push(new Cesium.Cartographic(m, g)),
                        r.push(Cesium.Cartesian3.fromRadians(m, g, a)),
                        n.push(Cesium.Cartesian3.fromRadians(m, g, 0)))
            }
        }
        this.wellData = {
            lerp_pos: s,
            bottom_pos: r,
            no_height_top: n
        }
    }
}

TerrainClipPlan.prototype._createWell = function (e) {
    if (Boolean(this.viewer.terrainProvider._layers)) {
        var t = this;
        this._createBottomSurface(e.bottom_pos);
        var i = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, e.lerp_pos);
        i.then(ies=>{
            for (var a = ies.length, n = [], r = 0; r < a; r++) {
                var s = Cesium.Cartesian3.fromRadians(ies[r].longitude, ies[r].latitude, ies[r].height);
                n.push(s)
            }
            t._createWellWall(e.bottom_pos, n)
        })
    } else {
        this._createBottomSurface(e.bottom_pos);
        this._createWellWall(e.bottom_pos, e.no_height_top)
    }
}


TerrainClipPlan.prototype._getMinHeight = function (e) {
    let minHeight = 50000000;
    let minPoint = null;
    for (let i = 0; i < e.length; i++) {
        let height = e[i]['z'];
        if (height < minHeight) {
            minHeight = height;
            minPoint = this._ellipsoidToLonLat(e[i]);
        }
    }
    return minPoint.altitude;
}


TerrainClipPlan.prototype._ellipsoidToLonLat = function (c) {
    let ellipsoid = this.viewer.scene.globe.ellipsoid;
    let cartesian3 = new Cesium.Cartesian3(c.x, c.y, c.z);
    let cartographic = ellipsoid.cartesianToCartographic(cartesian3);
    let lat = Cesium.Math.toDegrees(cartographic.latitude);
    let lng = Cesium.Math.toDegrees(cartographic.longitude);
    let alt = cartographic.height;
    return {
        longitude: lng,
        latitude: lat,
        altitude: alt
    }
}
TerrainClipPlan.prototype._createBottomSurface = function (e) {
    if (e.length) {
        let minHeight = this._getMinHeight(e);
        let positions = [];
        for (let i = 0; i < e.length; i++) {
            let p = this._ellipsoidToLonLat(e[i]);
            positions.push(p.longitude);
            positions.push(p.latitude);
            positions.push(minHeight);
        }

        let polygon = new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArrayHeights(positions)
            ),
            perPositionHeight: true,
            closeBottom: false
        });
        let geometry = Cesium.PolygonGeometry.createGeometry(polygon);


        var i = new Cesium.Material({
                fabric: {
                    type: "Image",
                    uniforms: {
                        image: this.bottomImg
                    }
                }
            }),
            a = new Cesium.MaterialAppearance({
                translucent: !1,
                flat: !0,
                material: i
            });
        this.bottomSurface = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: geometry
            }),
            appearance: a,
            asynchronous: !1
        }), this.viewer.scene.primitives.add(this.bottomSurface)
    }
}

TerrainClipPlan.prototype._createWellWall = function (e, t) {
    let minHeight = this._getMinHeight(e);
    let maxHeights = [];
    let minHeights = [];
    for (let i = 0; i < t.length; i++) {
        maxHeights.push(this._ellipsoidToLonLat(t[i]).altitude);
        minHeights.push(minHeight);
    }
    let wall = new Cesium.WallGeometry({
        positions: t,
        maximumHeights: maxHeights,
        minimumHeights: minHeights,
    });
    let geometry = Cesium.WallGeometry.createGeometry(wall);
    var a = new Cesium.Material({
            fabric: {
                type: "Image",
                uniforms: {
                    image: this.wallImg
                }
            }
        }),
        n = new Cesium.MaterialAppearance({
            translucent: !1,
            flat: !0,
            material: a
        });
    this.wellWall = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: geometry,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.GREY)
            },
            id: "PitWall"
        }),
        appearance: n,
        asynchronous: !1
    }), this.viewer.scene.primitives.add(this.wellWall)
}
TerrainClipPlan.prototype._switchExcavate = function (e) {
    e ? (this.viewer.scene.globe.material = Cesium.Material.fromType("WaJue"), this.wellWall.show = !0, this.bottomSurface.show = !0) : (this.viewer.scene.globe.material = null, this.wellWall.show = !1, this.bottomSurface.show = !1)
}

TerrainClipPlan.prototype._updateExcavateDepth = function (e) {
    this.bottomSurface && this.viewer.scene.primitives.remove(this.bottomSurface), this.wellWall && this.viewer.scene.primitives.remove(this.wellWall);
    for (var t = this.wellData.lerp_pos, i = [], a = t.length, n = 0; n < a; n++) i.push(Cesium.Cartesian3.fromRadians(t[n].longitude, t[n].latitude, this.excavateMinHeight - e));
    this.wellData.bottom_pos = i, this._createWell(this.wellData), this.viewer.scene.primitives.add(this.bottomSurface), this.viewer.scene.primitives.add(this.wellWall)
}

// 判断坐标串是否为逆时针
TerrainClipPlan.prototype.ifAntiClockwise = function (e) {
    //找凸点
    let pointList = JSON.parse(JSON.stringify(e))
    pointList.push(pointList[0])
    let pointListGeo = turf.lineString(pointList.map((point,index)=>{
        return this.getLatLngFromXZY(point)
    }))
    let dirRes = booleanClockwise.default(pointListGeo)
    return dirRes
}

// 世界坐标转经纬度
TerrainClipPlan.prototype.getLatLngFromXZY = function (e) {
    var ellipsoid = this.viewer.scene.globe.ellipsoid;
    var cartesian3 = new Cesium.Cartesian3(e.x,e.y,e.z);
    var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
    var latitude = Cesium.Math.toDegrees(cartographic.latitude);
    var longitude = Cesium.Math.toDegrees(cartographic.longitude);
    var height = cartographic.height;
    return [longitude,latitude]
}


export default TerrainClipPlan

```






