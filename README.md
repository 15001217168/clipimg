# clipimg
图片裁剪，压缩
# 使用
```
<link href="clipstyle.css" rel="stylesheet" />
<script src="clipimg-1.3.js"></script>
<section id="clipImg" style="display:none;"></section>

 $("#idPersonFile").clip({
                            imgTag: "#imgPerson",
                            valueTag: "#imgurl",
                            type: "PersonImg",
                            clip:true,
                            callback: function () {
                                $.perdup.initEvent();
                            }
                        });

```