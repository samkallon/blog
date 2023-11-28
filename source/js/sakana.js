const sakanaScrip = document.createElement('script')
sakanaScrip.src = "https://cdn.jsdelivr.net/npm/sakana"
document.head.append(sakanaScrip)
const divSakana = document.createElement('div')
divSakana.classList.add('sakana-box')
document.body.append(divSakana)
setTimeout(()=>{
    Sakana.init({
        el: '.sakana-box',     // 启动元素 node 或 选择器
        scale: .5,                // 缩放倍数
        canSwitchCharacter: true,      // 允许换角色
    });
},500)
