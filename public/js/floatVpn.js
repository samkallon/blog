// 浮窗 vpn推荐 点击跳转到置顶文章
const div = document.createElement('div')
div.innerText = '高性价比梯子/翻墙推荐!'
div.style.cssText = `
position:fixed;
right:0;
top:50%;
height:100px;
width:100px;
border:1px solid red;
padding: 8px;
background: rgba(255, 255, 255, .7);
-webkit-backdrop-filter: blur(10px);
backdrop-filter: blur(5px);
border-radius: 5px;
cursor: pointer;
text-align: center;
`
div.onclick = function () {
    window.open('https://samkallon.top/2023/11/14/高性价比稳定梯子推荐/')
}
document.body.append(div)