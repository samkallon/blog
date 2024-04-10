---
title: nginx配置pdf访问或是下载
date: 2024-04-10 11:00:28
tags: [nginx, pdf]
---

最近遇到一个问题,在服务器上配置了静态资源路径,但是访问里面的pdf后,却是直接下载,但是pdf文件,浏览器应该是能够支持直接预览的才对
经过搜索最终解决, 修改nginx配置, 如果访问路径中含有pdf,则添加响应头 content-type 为application/pdf即可


location ^~ /staticFiles/ {
    alias /usr/share/nginx/html/staticFiles/;
    if ($request_filename ~* ^.*?\.(pdf)$) {
        add_header Content-Type application/pdf;
    }
}

