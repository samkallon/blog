---
title: vite打包时ts找不到文件导致eslint报错解决
date: 2023-09-11 16:46:54
tags:
  - vite
  - eslint
---


最近新建了一个项目,启用了eslint 打包的时候,eslint一直报错,解决如下

首先是eslint可能会检测到npm包里的一些代码,这些代码改不了,可以通过添加eslintignore文件来 告诉eslint,哪些文件不用检查

vite中配置@ 符号指向 src目录 此时引用ts会找不到  
首先在src 目录下的  env.d.ts文件下 添加如下代码
```ts
    declare module '*.vue' {
    import type { DefineComponent } from 'vue'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
      const component: DefineComponent<{}, {}, any>
    export default component
    }
```

然后在tsconfig.json文件的compilerOptions中添加 baseUrl 和 paths

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
  }
}
```

这样ts就能够识别  这样的语句了
```js
import FogEffect from '@/core/weather/FogEffect'
```
