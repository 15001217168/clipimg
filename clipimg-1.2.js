$.fn.clip = function (ops) {
    var _self = $(this);
    var _id = _self.attr("id");
    var defaults = {
        imgTag: "",
        valueTag: "",
        scale: 600 / 450,
        width: 0.70,
        callback: null
    };
    var options = $.extend(defaults, ops);
    if (options.imgTag.length == 0) {
        throw "empty";
    }
    if (options.valueTag.length == 0) {
        throw "empty";
    }

    var config = {
        c_w: $(window).width(),
        c_h: $(window).height(),
        clipHtml: '<img id="canvas_img" class="canvas_img" style="width:100%;" /><div class="canvas_bg"></div><canvas id="canvas" class="canvas" width="358" height="441"></canvas><div id="canvas_div" class="canvas_div"></div><div class="canvas_btn"><a href="javascript:void(0);" id="btnCancel" class="canvas_cancel">取消</a><a href="javascript:void(0);" id="btnClip" class="canvas_ok">完成</a></div>',
    };
    var main = {
        initEvent: function () {
            if (options.callback) {
                options.callback();
            }
            _self.off().on("change", function () {
                $.loading.open();
                $("#clipImg").html("");
                var _this = $(this)[0],
                    _file = _this.files[0],
                    fileType = _file.type;
                var max = 2 * 1000 * 1024;
                if (_file.size > max) {
                    $.toast({ message: "选择的图片不能超过2M大小" });
                    $.loading.close();
                    return false;
                }
                if (/image\/\w+/.test(fileType)) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(_file);
                    fileReader.onload = function (event) {
                        var result = event.target.result;//返回的dataURL
                        $("#clipImg").html(config.clipHtml);
                        $("#canvas_img")[0].src = result;
                        $("#clipImg").show();
                        main.init();
                        $.loading.close();
                        $("#btnClip").off().on("click", function () {
                            main.clipImg();
                        });
                        $("#btnCancel").off().on("click", function () {
                            $("#clipImg").hide();
                            _self.parent().html('<input style="display:none;" type="file" id="' + _id + '" name="' + _id + '" />选择');
                            $("#clipImg").html("");
                            _self = $("#" + _id);
                            main.initEvent();
                        });
                    }
                } else {
                    $.toast({ message: "请选择图片格式文件" });
                }
            });
        },
        clipHtml: '',
        init: function () {
            var c_w = config.c_w,
                c_h = config.c_h,
                $canvas = $("canvas"),
                $img = $("#canvas_img"),
                $canvasDiv = $("#canvas_div");

            var posX = 0, posY = 0;//相对坐标
            var scale = 0;//记录在缩放动作执行前的 缩放值
            var start_X1 = 0, start_Y1 = 0, start_X2 = 0, start_Y2 = 0;
            var start_sqrt = 0;//开始缩放比例
            var sqrt = 1;
            var left_x = 0, left_y = 0;


            $canvas[0].width = c_w * options.width;
            $canvas[0].height = parseInt($canvas[0].width * options.scale);


            //设置canvas上下左右居中显示
            $canvas.css("top", (c_h - $canvas[0].height) / 2 + "px")
            .css("left", (c_w - $canvas[0].width) / 2 + "px");

            function init(event) {
                var event = event || window.event;
                event.preventDefault();//阻止浏览器或body 其他冒泡事件
                var mv_x1 = 0, mv_y1 = 0;
                mv_x1 = event.clientX;
                mv_y1 = event.clientY;//鼠标坐标
                var img_left = $img[0].left, img_top = $img[0].top;//图片坐标
                posX = mv_x1 - $img[0].offsetLeft; //获取img相对坐标
                posY = mv_y1 - $img[0].offsetTop;
                $(this).on("mousemove", function (event) {
                    var event = event || window.event;
                    event.preventDefault();//阻止浏览器或body 其他冒泡事件
                    var mv_x1 = 0, mv_y1 = 0;
                    mv_x1 = event.clientX;
                    mv_y1 = event.clientY;
                    var _x = mv_x1 - posX; //移动坐标
                    var _y = mv_y1 - posY;
                    $img[0].style.left = _x + "px";
                    $img[0].style.top = _y + "px";
                    ctx_img.clearRect(0, 0, $canvas[0].width, $canvas[0].height);//清除画布
                    ctx_img.drawImage($img[0], _x + left_x / 2, _y - parseFloat($canvas[0].style.top) + left_y / 2, $img[0].width * sqrt, $img[0].height * sqrt);//画布内图片移动
                });
                $(this).on("mouseup", function () {
                    $(this).off();
                    $(this).on('mousedown', function (event) {
                        init(event);
                    });
                });
            }
            $canvas.on('mousedown', function (event) {
                init(event);
            });


            //设置图片自适应大小及图片的居中显示
            // $.clip.autoImg(c_h, c_w, $img);
            var d_h = c_h - $img[0].height;
            var d_w = c_w - $img[0].width;
            $img.css("top", (d_h > 0 ? d_h : 0) / 2 + "px")
            .css("left", (d_w > 0 ? d_w : 0) / 2 + "px");



            var ctx_img = $canvas[0].getContext("2d");
            var ctx_X = ($canvas.width() - $img.width()) / 2, ctx_Y = ($canvas.height() - $img.height()) / 2;
            ctx_img.drawImage($img[0], ctx_X, ctx_Y, $img.width(), $img.height());//初
        },
        autoImg: function (maxHeight, maxWidth, $img) {
            var img = new Image();
            img.src = $img.attr("src");
            var hRatio;
            var wRatio;
            var ratio = 1;
            var w = $img[0].width;
            var h = $img[0].height;
            wRatio = maxWidth / w;
            hRatio = maxHeight / h;
            if (w < maxWidth && h < maxHeight) {
                return;
            }
            if (maxWidth == 0 && maxHeight == 0) {
                ratio = 1;
            } else if (maxWidth == 0) {
                if (hRatio < 1) {
                    ratio = hRatio;
                }
            } else if (maxHeight == 0) {
                if (wRatio < 1) {
                    ratio = wRatio;
                }
            } else if (wRatio < 1 || hRatio < 1) {
                ratio = (wRatio <= hRatio ? wRatio : hRatio);
            } else {
                ratio = (wRatio <= hRatio ? wRatio : hRatio) - Math.floor(wRatio <= hRatio ? wRatio : hRatio);
            }
            if (ratio < 1) {
                if (ratio < 0.5 && w < maxWidth && h < maxHeight) {
                    ratio = 1 - ratio;
                }
                w = w * ratio;
                h = h * ratio;
            }
            //$img[0].height = maxHeight;
            //$img[0].width = maxWidth;
        },
        clipImg: function () {
            var base64 = $("#canvas")[0].toDataURL('image/jpeg', 1);
            $(options.imgTag).attr("src", base64);
            base64 = base64.split(',')[1];
            try {
                $.post("/UploadFile/SaveImgToMongoDB", { file: base64 }, function (res) {
                    if (res.Code == 0) {
                        //$(options.imgTag).attr("src", res.Data.url) + "?t=" + new Date().getTime();
                        $(options.valueTag).val(res.Data.url)
                        var parent = $(options.imgTag).parent();
                        parent.find("em,span").hide();
                    }
                    else {
                        $.toast({ message: res.Message });
                    }
                });
            } catch (e) {
                $.toast({ message: "服务器异常,请重试" });
            }
            //$(options.valueTag).val(base64)
            var parent = $(options.imgTag).parent();
            parent.find("em,span").hide();
            $("#clipImg").hide();
            _self.parent().html('<input style="display:none;" type="file" id="' + _id + '" name="' + _id + '" />选择');
            $("#clipImg").html("");
            _self = $("#" + _id);
            main.initEvent();
        }
    };

    main.initEvent();
};