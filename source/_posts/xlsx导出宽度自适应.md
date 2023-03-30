---
title: xlsx导出宽度自适应
date: 2023-03-17 15:18:53
tags:
- xlsx
- 前端
- js

---

前端导出element表格

```ecmascript 6
// 传入表格元素的id和要导出的文件名
function exportExcel1(id, fileName) {
    const tableDom = document.querySelector(`#${id}`)
    let sheet  = XLSX.utils.table_to_sheet(tableDom, { raw: true })
    let curColKey = ''
    let widthListObj = {}
    Object.keys(sheet).forEach(key=>{
        // keys a1 b1 ...aa1
        if (/[A-Z].*[0-9]$/.test(key)){
            curColKey = /[A-Z]+/.exec(key)[0]
            if(!widthListObj[curColKey]){
                widthListObj[curColKey] = []
            }
            // 计算列宽,存储
            const width = getCellWidth(sheet[key].v)
            widthListObj[curColKey].push(width)
        }
    })
    Object.keys(widthListObj).forEach(colKey=>{
        sheet['!cols'].push({ wch: Math.max(...widthListObj[colKey]) })
    })
    let workBook = {
        SheetNames: [fileName],
        Sheets: {
            [fileName]: sheet
        }
    }
    XLSX.writeFile(workBook, fileName)
}
// 计算宽度
function getCellWidth(value) {
  // 判断是否为null或undefined
  if (value == null) {
    return 10;
  } else if (/.*[\u4e00-\u9fa5]+.*$/.test(value)) {
    // 中文的长度
    const chineseLength = value.match(/[\u4e00-\u9fa5]/g).length;
    // 其他不是中文的长度
    const otherLength = value.length - chineseLength;
    return chineseLength * 2.1 + otherLength * 1.1;
  } else {
    return value.toString().length * 1.1;
    /* 另一种方案
    value = value.toString()
    return value.replace(/[\u0391-\uFFE5]/g, 'aa').length
    */
  }
}
```

