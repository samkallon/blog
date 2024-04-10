---
title: cesium生成视锥体实现视频投射
date: 2024-04-10 11:07:39
tags: [cesium]
index_img: /img/cesium生成视锥体实现视频投射.png

---
### 效果

{% asset_img img.png 1212%}

### 直接上代码
```ts
export function addPerspectiveFrustum({
                                          position,
                                          fov = 90,
                                          near = 1,
                                          far = 100,
                                          aspectRatio = 600 / 1080,
                                          heading = 60,
                                          pitch = -70,
                                          roll = 0,
                                          videoUrl


                                      }) {
    removePrimitiveById('frustum')
    const frustum = new Cesium.PerspectiveFrustum({
        fov: Cesium.Math.toRadians(fov),
        aspectRatio,
        near,
        far,
    });

    const frustumGeometry = new Cesium.FrustumOutlineGeometry({
        frustum: frustum,
        origin: position,
        orientation: Cesium.Quaternion.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(heading),
            Cesium.Math.toRadians(pitch),
            Cesium.Math.toRadians(roll)
        )),
    });
    // 取出视锥体的顶点坐标
    const geometry = Cesium.FrustumOutlineGeometry.createGeometry(frustumGeometry)
    const result = []
    for (let i = 0; i < geometry.attributes.position.values.length; i+=3) {
        result.push(Array.from(geometry.attributes.position.values).slice(i,i+3))
    }
    removaEntitiesAndPrimitivesByName('frustumPoint')
    const videoPolygon = []
    result.forEach((e,i)=>{
        if (i>3){
            //取后四个坐标, 即远面的坐标
            const position1 = new Cesium.Cartesian3(...e)
            // 生成射线和globe相交,计算交点
            const ray = new Cesium.Ray(position,Cesium.Cartesian3.subtract(position1,position,new Cesium.Cartesian3()))
            const pickPosition = window.viewer.scene.globe.pick(ray,window.viewer.scene)
            if (pickPosition){
                videoPolygon.push(pickPosition)
                window.viewer.entities.add({
                    name:'frustumPoint',
                    position:pickPosition,
                    point:{
                        pixelSize: 10,
                        color: Cesium.Color.fromCssColorString('rgb(255,255,255)'),
                        outlineColor: Cesium.Color.fromCssColorString('rgb(255,255,255)'),
                        outlineWidth: 2,
                    },
                    polyline:{
                        positions:[position,pickPosition],
                        width:2,
                        material:Cesium.Color.fromCssColorString('rgb(255,255,255)')
                    }
                })
            }

        }
    })
    removaEntitiesAndPrimitivesByName('videoFrustumPolygon')
    // 获得视锥体和地面的交点,构成平面,并使用video标签做为材质
    if (videoPolygon.length === 4){
        const videoEle = document.createElement('video')
        videoEle.muted = true
        videoEle.autoplay = true
        videoEle.src = videoUrl || '/busVisulizer/video/chejianVideo.mp4'
        videoEle.loop = true
        videoEle.id = "videoFrustumPolygon"
        document.body.append(videoEle)
        window.viewer.entities.add({
            name:'videoFrustumPolygon',
            polygon:{
                hierarchy:videoPolygon,
                material:document.getElementById("videoFrustumPolygon"),
            }
        })
        // 需要同步时钟,否则视频不会动
        let synchronizer = new Cesium.VideoSynchronizer({
            clock : window.viewer.clock,
            element : videoEle
        });
        window.viewer.clock.shouldAnimate = true;
    }

    const frustumGeometryInstance = new Cesium.GeometryInstance({
        geometry: frustumGeometry,
        attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString('rgb(255,255,255)')),
        },
        id: "frustum",
    });


    const primitive = new Cesium.Primitive({
        geometryInstances: frustumGeometryInstance,
        appearance: new Cesium.PerInstanceColorAppearance({
            closed: false,
            flat: true,
        }),
        asynchronous:false
    })
    primitive.id = "frustum"
    primitive.position = position
    window.viewer.scene.primitives.add(primitive);

}
```