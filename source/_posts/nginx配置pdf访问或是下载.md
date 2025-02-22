---
title: nginx配置pdf访问或是下载
date: 2024-04-10 11:00:28
tags: [nginx, pdf]
---

最近遇到一个问题,在服务器上配置了静态资源路径,但是访问里面的pdf后,却是直接下载,但是pdf文件,浏览器应该是能够支持直接预览的才对
经过搜索最终解决, 修改nginx配置, 如果访问路径中含有pdf,则添加响应头 content-type 为application/pdf即可

```text
location ^~ /staticFiles/ {
    alias /usr/share/nginx/html/staticFiles/;
    if ($request_filename ~* ^.*?\.(pdf)$) {
        add_header Content-Type application/pdf;
    }
}
```
附上nginx常用变量
```text
全局变量
$args ： 这个变量等于请求行中的参数，同$query_string
$content_length ： 请求头中的Content-length字段
$content_type ： 请求头中的Content-Type字段
$document_root ： 当前请求在root指令中指定的值
$host ： 请求主机头字段，否则为服务器名称
$http_user_agent ： 客户端agent信息
$http_cookie ： 客户端cookie信息
$limit_rate ： 这个变量可以限制连接速率
$request_method ： 客户端请求的动作，通常为GET或POST
$remote_addr ： 客户端的IP地址
$remote_port ： 客户端的端口
$remote_user ： 已经经过Auth Basic Module验证的用户名
$request_filename ： 当前请求的文件路径，由root或alias指令与URI请求生成
$scheme ： HTTP方法（如http，https）
$server_protocol ： 请求使用的协议，通常是HTTP/1.0或HTTP/1.1
$server_addr ： 服务器地址，在完成一次系统调用后可以确定这个值
$server_name ： 服务器名称
$server_port ： 请求到达服务器的端口号
$request_uri ： 包含请求参数的原始URI，不包含主机名，如/foo/bar.php?arg=baz
$uri ： 不带请求参数的当前URI，$uri不包含主机名，如/foo/bar.html
$document_uri ： 与$uri相同

假设请求为http://www.qq.com:8080/a/b/c.php，则
$host：www.qq.com
$server_port：8080
$request_uri：http://www.qq.com:8080/a/b/c.php
$document_uri：/a/b/c.php
$document_root：/var/www/html
$request_filename：/var/www/html/a/b/c.php
```



