/**
 * svg-editor.js SVG 编辑器 v17.5
 */

;(function () {

    function drawLineArrow(x1, y1, x2, y2) {
        let path
        let slopy, cosy, siny
        let Par = 10.0
        let x3, y3
        slopy = Math.atan2((y1 - y2), (x1 - x2))
        cosy = Math.cos(slopy)
        siny = Math.sin(slopy)

        path = "M" + x1 + "," + y1 + " L" + x2 + "," + y2

        x3 = (Number(x1) + Number(x2)) / 2
        y3 = (Number(y1) + Number(y2)) / 2

        path += " M" + x3 + "," + y3
        path += " L" + (Number(x3) + Number(Par * cosy - (Par / 2.0 * siny))) + "," + (Number(y3) + Number(Par * siny + (Par / 2.0 * cosy)))
        path += " M" + (Number(x3) + Number(Par * cosy + Par / 2.0 * siny) + "," + (Number(y3) - Number(Par / 2.0 * cosy - Par * siny)))
        path += " L" + x3 + "," + y3
        return path
    }

    // 通用 SVG 编辑器
    class SVGEditor {

        constructor(boxId, id, option) {
            let that = this

            if (!SVG.supported) {
                alert('SVG not supported')
            }

            that.$svg = $('#' + id)
            that.$box = $('#' + boxId)

            that.offsetX = this.$svg.offset().left
            that.offsetY = this.$svg.offset().top

            that.canvas = document.getElementById('bg-canvas')
            that.frontCanvas = document.getElementById('front-canvas')
            that.opts = $.extend({}, SVGEditor.DEFAULTS, option)

            let svg = SVG(id)
            that.svg = svg

            that.doc = {
                filename: '未命名'
            }
            that.setSize(option.width || 480, option.height || 480)

            that.allElem = SVG.adopt(document.getElementById('all'))
            that.lineElem = SVG.adopt(document.getElementById('line'))
            that.tmpElem = SVG.adopt(document.getElementById('tmp'))
            that.cutGroup = that.svg.group().hide(); // 保存剪切的图层
            that.copyElems = []

            that._init()

            let ellipse = that.svg.ellipse(80, 40).move(10, 10).fill('#09c')

            let mask = that.svg.mask().add(ellipse)

            //rect.maskWith(mask)

            /*let ellipse = that.svg.ellipse(80, 40).move(10, 10)

             rect.clipWith(ellipse)*/

            that._event()
        }

        _init() {
            let that = this

            /*let ty = SVG.get('ty')
             ty.rotate(270, 250, 250);*/

            //let matrix = new SVG.Matrix(ty)
            //matrix.translate(10, 20)
            //ty.setMartix(matrix)

            // 虚线箭头
            /*that.svg.line(300, 300, 400, 400).fill('#0c9').stroke({
             color: '#f06',
             dasharray: '5,5',
             opacity: 0.6, width: 5 })
             let path = drawLineArrow(300, 300, 400, 400)
             that.svg.path(path).fill('#f09').stroke('#f06');*/

            //let nested = that.svg.nested()
            // 提示工具
            that.$tipBox = $('#tip-box')

            // 公共样式
            that.fill = '#09c'
            that.stroke = '#000'
            that.strokeWidth = 1
            that.opacity = 1

            that.color = '#000'
            that.scale = 1; // 内部缩放比例
            that.scale2 = 1; // 外部缩放比例
            that.isShowGrid = false

            // 选中元素
            that.selectedElems = []

            // 插件
            that.type = null; // 模式，比如选择模式等
            that.handlers = {}; // 处理器，不同模式的事件交给不同的处理器处理

            // 圆形
            $('#editor-radius').on('input', function (e) {
                that.getCurElem().attr('r', $(this).val())
            })
            $('#editor-circle-cx').on('input', function (e) {
                that.getCurElem().attr('cx', $(this).val())
            })
            $('#editor-circle-cy').on('input', function (e) {
                that.getCurElem().attr('cy', $(this).val())
            })
            // 矩形
            $('#editor-rect-rx').on('input', function (e) {
                that.getCurElem().attr('rx', $(this).val())
            })
            $('#editor-rect-ry').on('input', function (e) {
                that.getCurElem().attr('ry', $(this).val())
            })
            // 椭圆
            $('#editor-ellipse-cx').on('input', function (e) {
                that.getCurElem().attr('cx', $(this).val())
            })
            $('#editor-ellipse-cy').on('input', function (e) {
                that.getCurElem().attr('cy', $(this).val())
            })
            // 文本
            $('#editor-font-family').on('change', function (e) {
                that.getCurElem().attr('font-family', $(this).val())
            })

            // 屏幕提示
            $('#editor-tip').on('change', function (e) {
                that.getCurElem().attr('tip', $(this).val())
            })

            $('#editor-grid').on('change', function (e) {
                that.setGrid(parseInt(this.value))
            })

            $('#editor-x').on('input', function (e) {
                let val
                if (this.value.indexOf('+') > -1) {
                    let arr = this.value.split('+')
                    val = parseInt(arr[0]) + parseInt(arr[1])
                } else {
                    val = parseInt(this.value)
                }
                that.selectedElems.forEach(function (elem) {
                    let rbox = that.rbox(elem)
                    that.moveElem(elem, val, rbox.y)
                })
            })

            $('#editor-y').on('input', function (e) {
                let y = parseInt(this.value)
                that.selectedElems.forEach(function (elem) {
                    let rbox = that.rbox(elem)
                    that.moveElem(elem, rbox.x, y)
                })
            })

            $('#editor-width').on('input', function (e) {
                let width = parseInt(this.value)
                that.selectedElems.forEach(function (elem) {
                    let rbox = that.rbox(elem)
                    that.sizeElem(elem, width, rbox.height)
                })
            })

            $('#editor-height').on('input', function (e) {
                let height = parseInt(this.value)
                that.selectedElems.forEach(function (elem) {
                    let rbox = that.rbox(elem)
                    that.sizeElem(elem, rbox.width, height)
                })
            })

            $('#pen-draw').on('click', function () {
                that.setPenMode(1)
            })
            $('#pen-point').on('click', function () {
                that.setPenMode(2)
            })
            $('#pen-delete').on('click', function () {
                that.setPenMode(3)
            })
            $('#pen-add').on('click', function () {
                that.setPenMode(4)
            })
            $('#pen-move').on('click', function () {
                that.setPenMode(5)
            })

            if (that.opts.grid) {
                //that.initGrid()
            }
            that.initText()
            that.initView()
            that.initBase()
            //that.preloadPlugin()
            //that.preview()
            //that.doScale(2, 0, 0)
        }

        tip(content, x, y) {
            let that = this
            that.$tipBox.html(content)
            that.$tipBox.css({
                left: x + 'px',
                top: y + 'px'
            })
        }

        showTip() {
            let that = this
            that.$tipBox.show()
        }

        hideTip() {
            let that = this
            that.$tipBox.hide()
        }

        scaleSize(width, height) {
            let that = this

            that.setSize(width, height, true)

            let min = that.height > that.width ? that.width : that.height
            that.rateX = that.rateY = min * 2 / 200

            that.updateA()
        }

        newSize(width, height) {
            let that = this

            that.setSize(width, height)

            let min = that.height > that.width ? that.width : that.height
            that.rateX = that.rateY = min * 2 / 200

            that.updateA()
        }

        setSize(width, height, isScale) {
            let that = this

            that.width = width
            that.height = height

            if (isScale) {

            } else {
                that.canvas.width = width
                that.canvas.height = height
                that.frontCanvas.width = width
                that.frontCanvas.height = height
                // 原始大小（文档大小）
                that.width0 = width
                that.height0 = height

                that.svg.viewbox(0, 0, that.width, that.height)
            }

            if (!isScale) {
                $('#editor-doc-width').text(width + 'px')
                $('#editor-doc-height').text(height + 'px')
            }

            $('#svg-box,#bg-canvas,#svg').css({
                width: that.width,
                height: that.height
            })

            let $wpBox = $('#workplace-box')
            let boxWidth = that.width * 2
            let boxHeight = that.height * 2
            if (boxWidth < $wpBox.outerWidth()) {
                boxWidth = $wpBox.outerWidth()
            }
            if (boxHeight < $wpBox.outerHeight()) {
                boxHeight = $wpBox.outerHeight()
            }

            $('#workplace').css({
                width: boxWidth + 'px',
                height: boxHeight + 'px'
            })
        }

        // 放大画布
        zoomIn() {
            let that = this

            that.scale2 += 0.2
            if (that.scale2 > 5) {
                that.scale2 = 5
            }

            $('#scale-num').text(Math.round(that.scale2 * 100) + '%')
            that.scaleSize(Math.round(that.width0 * that.scale2), Math.round(that.height0 * that.scale2))
        }

        // 缩小画布
        zoomOut() {
            let that = this

            that.scale2 -= 0.2
            if (that.scale2 < 0.2) {
                that.scale2 = 0.2
            }
            $('#scale-num').text(Math.round(that.scale2 * 100) + '%')
            that.scaleSize(that.width0 * that.scale2, that.height0 * that.scale2)
        }

        // 复制
        copySelectedElem() {
            let that = this
            that.copyElems = that.selectedElems; // TODO BUG
            //that.copyElem = that.getCurElem()
        }

        // 剪切
        cutSelectedElem() {
            let that = this

            that.cutGroup.clear()
            that.selectedElems.forEach(function (elem) {
                let clone = elem.clone()
                clone.hide()
                that.cutGroup.add(clone)
                that.copyElems.push(clone)
                //that.select(clone, 3)
                //elem.remove()
            })
            //that.unselectAllElem()
            that.removeSelectedElem()
        }

        // 粘贴
        pasteElem() {
            let that = this
            that.unselectAllElem()
            that.copyElems.forEach(function (elem) {
                let clone = elem.clone()
                clone.show()
                let rbox = that.rbox(clone)
                clone.move(rbox.x + that.opts.grid, rbox.y + that.opts.grid)
                clone.removeClass('elem-selected')
                that.allElem.add(clone)
                that.select(clone, 3)
            })
        }

        initView() {
            let that = this
            that.$editor = that.$svg


            /*that.$svg.on('contextmenu', '.elem', function (e) {
             if (!this.id) {
             this.id = ui.getId()
             }

             let elem = SVG.get(this.id)
             that.select(elem)

             return false
             });*/
            // 编辑元素右键菜单
            that.$editor.contextmenu({
                item: '.elem',
                content: '#elem-menu',
                show: function (ui) {
                    let elem = SVG.adopt(ui)
                    that.select(elem, 3)

                    if (that.selectedElems.length > 1) {
                        $('#elem-menu-group-cancel').parent().hide()
                        $('#elem-menu-group-add').parent().show()
                        if (that.selectedElems.length <= 1) {
                            $('#elem-menu-group-add').parent().addClass('disabled')
                        } else {
                            $('#elem-menu-group-add').parent().removeClass('disabled')
                        }
                    } else if (elem.type === 'g') {
                        $('#elem-menu-group-add').parent().hide()
                        $('#elem-menu-group-cancel').parent().show()
                    } else {
                        $('#elem-menu-group-add').parent().show().addClass('disabled')
                        $('#elem-menu-group-cancel').parent().hide()
                    }

                    if (that.copyElem) {
                        $('#elem-menu-paste').parent().removeClass('disabled')
                    } else {
                        $('#elem-menu-paste').parent().addClass('disabled')
                    }
                }
            })

            // 编辑器右键菜单
            that.$box.contextmenu({
                content: '#editor-menu',
                show: function (ui) {
                    if (that.copyElem) {
                        $('#editor-menu-paste').parent().removeClass('disabled')
                    } else {
                        $('#editor-menu-paste').parent().addClass('disabled')
                    }
                }
            })

            // 组件预览
            let $widgetList = $('.widget-list')
            $widgetList.on('mouseover', '.widget-item', function () {
                $('#widget-box').show()
                $('#widget-box').css({
                    top: $(this).offset().top
                })
                $('#widget-box-name').text($(this).find('.name').text())
            })
            $widgetList.on('mouseout', '.widget-item', function () {
                $('#widget-box').hide()
            })
            $widgetList.on('click', '.widget-item', function () {
                let svg = SVG($(this).find('svg')[0])
                let first = svg.children()[0]
                let colne = first.clone()
                that.allElem.add(colne)
                let viewbox = that.svg.viewbox()
                //colne.move(0, 0)
            })
            // drag and drop
            $widgetList.dragdrop({
                item: 'li',
                drop: function (ui, e) {

                    let svg = SVG($(ui).find('svg')[0])
                    let first = svg.children()[0]
                    let rbox = first.rbox()
                    let clone = first.clone()
                    that.allElem.add(clone)
                    let viewbox = that.svg.viewbox()
                    let pt = that.getPt(e)
                    that.moveElem(clone, pt.x, pt.y)
                }
            })

            $('#svg-position').on('click', function (e) {
                e.preventDefault()
                that.scale = 1
                that.svg.viewbox(0, 0, that.width, that.height)
            })

            let wp = document.getElementById('workplace')
            let $wp = $('#workplace')
            let $wpBox = $('#workplace-box')
            let $svgBox = $('#svg-box')

            let $tn = $('#thumbnail')
            let $tnBox = $('#thumbnail-viewbox')
            let $tnCanvas = $('#thumbnail-canvas')

            //that.rateX = $wp.outerWidth() / $tn.outerWidth()
            //that.rateY = $wp.outerHeight() / $tn.outerHeight()
            let min = that.height > that.width ? that.width : that.height
            that.rateX = that.rateY = min * 2 / 200

            that.updateA()

            that.offsetX = that.$svg.offset().left
            that.offsetY = that.$svg.offset().top

            let canScroll = true
            $wpBox.on('scroll', function () {
                that.offsetX = that.$svg.offset().left
                that.offsetY = that.$svg.offset().top

                if (canScroll) {
                    $tnBox.css({
                        width: $wpBox.outerWidth() / that.rateX,
                        height: $wpBox.outerHeight() / that.rateY,
                        left: this.scrollLeft / that.rateX,
                        top: this.scrollTop / that.rateY,
                    })
                }
            })

            // svg文件拖拽编辑
            let dropArea = document.getElementById('svg')
            dropArea.ondragover = function () {
                dropArea.classList.add('hover')
                return false
            }
            dropArea.ondragend = function () {
                dropArea.classList.remove('hover')
                return false
            }
            dropArea.ondrop = function (e) {
                e.preventDefault()
                dropArea.classList.remove('hover')

                let files = [].slice.call(e.dataTransfer.files)
                let file = files[0]

                if (!file.type.match('image/svg.*')) {
                    return
                }
                let reader = new FileReader()
                reader.onload = (function(theFile) {
                    return function(e) {
                        let doc = e.target.result

                        that.doc.filename = theFile.name
                        //document.getElementById('svg').outerHTML = doc
                        let group = that.allElem.group()
                        //group.node.innerHTML = doc

                        $('#asd')[0].innerHTML = doc
                        let svg = SVG.adopt(document.getElementById('asd').getElementsByTagName('svg')[0])
                        svg.each(function (i, child) {
                            group.add(this)
                        })
                        group.size(400, 400)
                        group.addClass('elem elem-resizable'); // TODO
                        //document.getElementById('svg').innerHTML = doc
                    }
                })(file)
                reader.readAsText(file)
                return false
            }



            /*let draw  = that.svg
             let p1 = draw.path('M100, 100, L200,100,L200,200 z')
             let p2 = draw.path('M200,200, L300,150 L100,150 Z')
             let ret = p1.intersectsLine(p2)
             if (ret) {
             console.log(ret)
             }

             line1 = draw.line(50, 50, 50, 300)
             .attr({
             stroke        : 'blueviolet',
             'stroke-width': 2
             }),
             line2 = draw.line(0, 0, 350, 250)
             .attr({
             stroke        : 'darkorange',
             'stroke-width': 2
             })

             let line1Line2Point = line2.intersectsLine(p1)
             console.log(line1Line2Point)

             line1Line2Point && _drawTestPoint(line1Line2Point)

             function _drawTestPoint(point, color, radius){
             color  = color || 'red'
             radius = radius || 5
             draw.circle(radius).move(point.x - radius / 2, point.y - radius / 2).attr({'fill': color})
             }*/
        }

        selectAllElem() {
            let that = this
            that.unselectAllElem(); // TODO hack
            that.allElem.each(function () {
                that.select(this, 3)
            })
        }

        // 为选中元素添加分组
        groupSelectedElem(e) {
            let that = this
            let group = that.allElem.group().addClass('elem')

            that.selectedElems.sort(function (elem1, elem2) {
                return that.allElem.index(elem1) - that.allElem.index(elem2)
            })
            that.selectedElems.forEach(function (elem) {
                group.add(elem)
                elem.removeClass('elem')
            })
            that.unselectAllElem()
            that.selectElem(group)
        }

        // 选中元素取消分组
        ungroupSelectedElem() {
            let that = this
            let group = that.getCurElem()
            that.unSelectElem()
            if (group.type === 'g') {
                let children = group.children()
                for (let i = 0; i < children.length; i++) {
                    that.allElem.add(children[i])
                    children[i].addClass('elem')
                }
            }
        }

        getCurElem() {
            let that = this
            if (!that.selectedElems.length) {
                return null
            }
            return that.selectedElems[0]
        }

        setGrid(grid) {
            let that = this
            that.opts.grid = grid
            that.unselectAllElem()
            that.initBg()
        }

        setShowGrid(isShow) {
            let that = this
            that.isShowGrid = isShow
            that.initBg()
        }

        initBg() {
            let that = this

            that.ctx = that.canvas.getContext('2d')

            let ctx = that.ctx

            if (!that.isShowGrid) {
                ctx.clearRect(0, 0, that.width, that.height)
                return
            }

            ctx.strokeStyle = '#ccc'
            ctx.lineWidth = 0.5
            ctx.clearRect(0, 0, that.width, that.height)
            ctx.beginPath()

            let grid = that.scale > 0.8 ? that.opts.grid : 80
            let xOffset = 0; //50
            let yOffset = 0; //43

            let viewbox = that.svg.viewbox()

            // 画网格
            let startNum = (Math.floor(viewbox.x / grid)) * grid
            let num = Math.floor(that.width / grid) + 1
            for (let i = 0; i < num; i++) {
                let num2 = startNum + i * grid
                let x = (num2 - viewbox.x) * that.scale + xOffset
                if (x < yOffset) {
                    continue
                }
                ctx.moveTo(x + 0.5, 0)
                ctx.lineTo(x + 0.5, that.width)
                ctx.lineCap = "round"
                ctx.fill()
                ctx.fillStyle = '#999'
                ctx.fillText(num2, x + 4, 20)
            }

            num = Math.floor(that.height / grid) + 1
            startNum = (Math.floor(viewbox.y / grid)) * grid
            for (let i = 0; i < num; i++) {
                let num2 = startNum + i * grid
                //let y = (i +1 )* grid
                let y = (num2 - viewbox.y) * that.scale + yOffset
                if (y < xOffset - 10) {
                    continue
                }
                ctx.moveTo(0, y + 0.5)
                ctx.lineTo(that.width, y + 0.5)
                ctx.lineCap = "round"
                ctx.stroke()
                ctx.fillStyle = '#999'
                ctx.fillText(num2, 8, y + 12)
            }

            // 画辅助线
            ctx.fillStyle = '#09c'
            let x = (0 - viewbox.y) * that.scale + yOffset
            ctx.moveTo(x + 0.5, 0)
            ctx.lineTo(x + 0.5, that.width)
            ctx.fill()
        }

        download(format) {
            format = format || 'png'

            let filename = this.doc.filename + '.' + format
            if (format === 'png') {
                this.preview(function (canvas) {
                    canvas.toBlob(function(blob) {
                        saveAs(blob, filename)
                    })
                })
            } else {
                this.unselectAllElem()
                let svg = document.getElementById('svg').outerHTML.toString()
                let file = new File([svg], {type: 'text/plain;charset=utf-8'})
                saveAs(file, filename)
            }
        }

        // 预览
        preview(onload) {
            let that = this

            this.unselectAllElem()

            let html = $('#svg')[0].outerHTML
            html = window.toUTF8(html)
            let imgSrc = 'data:image/svg+xml;base64,'+ btoa(html)

            let canvas = document.getElementById("preview-canvas")
            console.log(canvas)
            canvas.width = that.width0
            canvas.height = that.height0
            canvas.style.width = that.width0 + 'px'
            canvas.style.height = that.height0 + 'px'

            // 加载图片并绘制到画布
            let img = new Image()
            img.src = imgSrc
            img.onload = function(){
                let myctx = canvas.getContext("2d")
                myctx.drawImage(img, 0, 0, that.width0, that.height0, 0, 0, that.width0, that.height0)

                if (typeof onload == 'function') {
                    onload(canvas)
                }
            }

            /*let a = document.createElement('a')
             a.download = 'yunser.com.png'
             a.href = canvas.toDataURL('image/png')

             let clickEvent = new MouseEvent('click', {
             'view': window,
             'bubbles': true,
             'cancelable': false
             })

             a.dispatchEvent(clickEvent);*/
        }
    }

    SVGEditor.DEFAULTS = {
        grid: 40,
    }
    SVGEditor.TYPE_JOIN = 4; // 连线

    let fn = SVGEditor.prototype

    fn.setPenMode = function (mode) {
        let that = this
        that.penMode = mode
    }

    fn.get = function (elem) {
        if (!elem.id) {
            elem.id = ui.getId()
        }
        return SVG.get(elem.id)
    }

    fn.select = function (elem, ctrlKey) {
        let that = this

        function myselect() {
            //let rotateable = elem.hasClass('elem-rotateable')
            let rotateable = true
            let resizable = true
            //let resizable = elem.hasClass('elem-resizable')

            elem.selectize({
                points: resizable,
                rotationPoint: rotateable,
                //deepSelect: true
            })
            let deepSelect = (elem.type === 'line' || elem.type === 'polyline' ||  elem.type === 'polygon') ? true : false
            deepSelect = true
            if (deepSelect) {
                elem.selectize({
                    deepSelect: true
                })
            }
            elem.addClass('elem-selected')

            if (!elem.hasClass('elem-joinable')) {
                elem.draggable({
                    grid: that.opts.grid
                })
                elem.on("dragstart", function(e) {
                    that.showTip()
                    //s = elm.clone().opacity(0.2)
                    if (that.selectedElems.length > 1) {
                        that.selectedElems.forEach(function (el, i) {
                            if (elem.node.id === el.node.id) {
                                return
                            }
                            let rbox = that.rbox(el)
                            el.startBox = rbox
                        })
                    }
                })
                elem.on("dragmove", function(e) {
                    let allBox = that.rbox(that.selectedElems[0])

                    let x = Number(allBox.x).toFixed(1)
                    let y = Number(allBox.y).toFixed(1)


                    let content = '<div>X: ' + x + '</div><div>Y: ' + y + '</div>'
                    let pt = that.getPtReserve(allBox.x + allBox.width + 8, allBox.y + allBox.height + 8)
                    that.tip(content, pt.x, pt.y)

                    that.updatePosition()
                    that.updateView()

                    // 批量拖拽
                    if (that.selectedElems.length > 1) {
                        that.selectedElems.forEach(function (el, i) {
                            if (elem.node.id === el.node.id) {
                                return
                            }
                            let rbox = el.startBox
                            that.moveElem(el, rbox.x + e.detail.gx, rbox.y + e.detail.gy)
                        })
                    }

                    elem.fire('ui-change')
                })
                elem.on("dragend", function() {
                    that.hideTip()
                })

                if (rotateable || resizable) {
                    elem.resize({
                        snapToGrid: that.opts.grid,
                        snapToAngle: 45
                    })
                    elem.on("resizestart", function() {
                        that.showTip()
                        //s = elm.clone().opacity(0.2)
                    })

                    elem.on("resizing", function(data) {
                        that.updateView()

                        let allBox = that.rbox(that.selectedElems[0])

                        let w = Number(allBox.width).toFixed(1)
                        let h = Number(allBox.height).toFixed(1)

                        let content = '<div>W: ' + w + '</div><div>H: ' + h + '</div>'
                        let pt = that.getPtReserve(allBox.x + allBox.width + 8, allBox.y + allBox.height + 8)
                        that.tip(content, pt.x, pt.y)

                        // 文字居中
                        /*if (that.curElem.type === 'g') {
                         let rbox = that.rbox(that.curElem)
                         let text = that.curElem.children()[1]
                         text.move((rbox.width) / 2, (rbox.height) / 2 - 8)
                         }*/
                    })

                    elem.on("resizedone", function() {
                        that.hideTip()
                    })

                }
            }

            that.selectedElems.push(elem)
        }

        if (ctrlKey) {
            if (ctrlKey === 3) {
                if (!elem.hasClass('elem-selected')) {
                    myselect()
                }
            } else if (elem.hasClass('elem-selected')) {
                that.pureUnselectize(elem)
            } else {
                myselect()
            }
        } else {
            /*that.selectedElems.forEach(function (elem) {
               if (elem.node.id !== elem.node.id) {
                   that.pureUnselectize(elem)
               }
            });*/
            if (ctrlKey === 3) {
                return
            }
            // TODO ?????????
            if (that.getCurElem() && elem.node.id !== that.getCurElem().node.id) {
                that.getCurElem().draggable(false).resize('stop').removeClass('cur-elem')
                that.pureUnselectize(that.getCurElem())
            }

            if (!elem.hasClass('elem-selected')) {
                myselect()
            }
            //that.unselectize(elem)
        }
    }

    fn.eachAllElem = function (callback) {
        let that = this
        function group(g) {
            if (g.hasClass('elem')) {
                callback(g)
            } else {
                g.each(function () {
                    if (this instanceof SVG.G) {
                        group(this)
                    } else {
                        callback(this)
                    }
                })
            }
        }
        that.svg.each(function () {
            if (this instanceof SVG.G) {
                group(this)
            } else {
                callback(this)
            }
        })
    }

    fn.pureUnselectize = function (elem, remove) {
        if (!elem) {
            return
        }

        /*if (typeof false === 'undefined') {
            remove = true
        }*/
        remove = (remove === false) ? false : true; // TODO

        let that = this
        elem.selectize(false)
        let deepSelect = (elem.type === 'line' || elem.type === 'polyline' ||  elem.type === 'polygon') ? true : false
        elem.removeClass('elem-selected')
        elem.draggable(false).resize('stop')
        if (deepSelect) {
            elem.selectize(false, {
                deepSelect: true
            })
        }
        if (remove) {
            for (let i = 0; i < that.selectedElems.length; i++) {
                if (that.selectedElems[i].node.id === elem.node.id) {
                    that.selectedElems.splice(i, 1)
                    break
                }
            }
        }
    }

    fn.clear = function () {
        let that = this
        that.allElem.clear()
        that.lineElem.clear()
        //this.svg.clear()
    }

    // 获取位置和大小（适用于任何元素和组）
    fn.rbox = function (elem) {
        let that = this

        let box = elem.bbox()

        if (elem instanceof SVG.Nested) {
            box = this.el.rbox()
        }

        // TODO 这里不准确
        if (elem instanceof SVG.G || elem instanceof SVG.Use || elem instanceof SVG.Nested) {
            let box = elem.node.getBoundingClientRect()
            return {
                x: box.left - that.offsetX,
                y: box.top - that.offsetY,
                width: box.width,
                height: box.height
            }
        }

        return box
    }

    // 根据 event 获取鼠标在 svg 中的位置
    fn.getPt = function(e) {
        let that = this
        return {
            x: Math.floor((e.clientX - that.offsetX) * (that.width0 / that.width)),
            y: Math.floor((e.clientY - that.offsetY) * (that.height0 / that.height))
        }
    }

    fn.getPtReserve = function (x, y) {
        let that = this
        return {
            x: Math.floor(x / (that.width0 / that.width) + that.offsetX),
            y: Math.floor(y / (that.height0 / that.height) + that.offsetY)
        }
    }

    fn.getPosition = function (e) {
        let that = this
        let vb = that.svg.viewbox()
        let x = e.clientX - that.offsetX + vb.x
        let y = e.clientY - that.offsetY + vb.y
        return {
            x: x,
            y: y
        }
    }

    // 根据元素类型获取元素名称
    function getTypeName(type) {
        switch (type) {
            case 'g':
                return '组'
            case 'line':
                return '直线'
            case 'polygon':
                return '多边形'
            case 'polyline':
                return '折线'
            case 'circle':
                return '圆'
            case 'path':
                return '路径'
            case 'ellipse':
                return '椭圆'
            case 'rect':
                return '矩形'
            case 'text':
                return '文字'
            case 'image':
                return '图片'
            default:
                return type
        }
    }

    // 选择元素并更新相关数据
    fn.selectElem = function (elem, ctrlKey) {
        let that = this

        if (elem.hasClass('elem-selected')) {
            return
        }
        // 保证每个选择的元素都有 ID
        if (!elem.node.id) {
            elem.node.id = ui.getId()
        }

        that.select(elem, ctrlKey)
        that.updateView()
    }

    fn.initBase = function () {
        let that = this
        if (that.fill === 'none') {
            $('#editor-fill-none').addClass('active')
            $('#editor-fill-color').colorpicker('setValue', 'transparent')
        } else {
            $('#editor-fill-none').removeClass('active')
            $('#editor-fill-color').colorpicker('setValue', that.fill)
        }

        $('#editor-opacity').val(that.opacity * 100)
        $('#editor-stroke-width').val(that.strokeWidth)
        $('#editor-stroke-color').colorpicker('setValue', that.stroke)

        $('.editor-box').hide()
        $('.editor-base-box').show()
    }

    fn.styleElem = function (elem) {
        let that = this
        elem.fill(that.fill)
            .stroke({color: that.stroke, width: that.strokeWidth})
            .addClass('elem elem-resizable')
            .attr('opacity', that.opacity)
            .attr('stroke-dasharray', that.strokeDasharray); // 必须放在最后，执行后不是返回 this
    }



    let $editorX = $('#editor-x')
    let $editorY = $('#editor-y')
    let $editorWidth = $('#editor-width')
    let $editorHeight = $('#editor-height')
    fn.updatePosition = function () {
        let that = this
        // 大小及位置
        let rbox = that.rbox(that.selectedElems[0]); // TODO
        let viewbox = that.svg.viewbox()

        $editorX.val(Number(rbox.x + viewbox.x).toFixed(1))
        $editorY.val(Number(rbox.y + viewbox.y).toFixed(1))
        $editorWidth.val(Number(rbox.width).toFixed(1))
        $editorHeight.val(Number(rbox.height).toFixed(1))
    }

    // 更新右侧视图
    fn.updateView = function () {
        let that = this

        $('.editor-box').hide()

        if (that.selectedElems.length === 0) {
            $('.editor-base-box').show()
            return
        }

        $('.editor-common-box').show()

        let elem = that.selectedElems[0]

        // 填充 TODO 其他类型填充
        let fill = elem.attr('fill')
        if (fill === 'none') {
            $('#editor-fill-none').addClass('active')
            $('#editor-fill-color').colorpicker('setValue', 'transparent')
        } else {
            $('#editor-fill-none').removeClass('active')
            $('#editor-fill-color').colorpicker('setValue', fill)
        }

        // 渐变
        let gradient = that.svg.gradient('linear', function(stop) {
            stop.at(0, '#f06')
            stop.at(1, '#0f9')
        })
        //let rect = SVG.get('asda')
        //rect.attr({ fill: gradient })
        //console.log(elem.fill())

        // 线条
        $('#editor-stroke-color').colorpicker('setValue', elem.attr('stroke'))
        $('#editor-stroke-width').val(elem.attr('stroke-width'))
        let dasharray = elem.attr('stroke-dasharray')
        if (!dasharray) {
            dasharray = 'none'
        }
        $('#stroke-dasharray').val(dasharray)
        // 不透明度
        let opacity = elem.attr('opacity') * 100
        $('#editor-opacity').val(opacity)

        // 通用属性
        that.updatePosition()

        // 旋转
        let extract = new SVG.Matrix(that.getCurElem()).extract()
        $('#editor-rotation').val(extract.rotation)

        // 屏幕提示
        let tip = that.getCurElem().attr('tip')
        $('#editor-tip').val(tip)

        let type = that.getCurElem().type
        if (that.getCurElem().attr('data-type') === 'widget') {
            $('#editor-type').text('组件')
        } else {
            $('#editor-type').text(getTypeName(type) + '（基本形状）')
        }

        $('.editor-type-box').hide()
        $('.editor-' + type + '-box').show()
        switch (type) {
            case 'circle':
                $('#editor-radius').val(that.getCurElem().attr('r'))
                $('#editor-circle-cx').val(that.getCurElem().attr('cx'))
                $('#editor-circle-cy').val(that.getCurElem().attr('cy'))
                break
            case 'rect':
            case 'image':
                $('#editor-rect-rx').val(that.getCurElem().attr('rx'))
                $('#editor-rect-ry').val(that.getCurElem().attr('ry'))
                break
            case 'ellipse':
                $('#editor-ellipse-cx').val(that.getCurElem().attr('cx')); // TODO 100px ?
                $('#editor-ellipse-cy').val(that.getCurElem().attr('cy'))
                break
        }

        type = that.getCurElem().attr('data-type')
        if (type === 'image') {
            $('.editor-shape-box').show()
            $('.editor-image-box').show()
        } else if (type === 'text') {
            $('.editor-shape-box').show()
            $('.editor-text-box').show()
        } else {
            $('.editor-shape-box').show()
        }
    }

    // 删除所有选中的元素
    fn.removeSelectedElem = function () {
        let that = this
        if (that.selectedElems.length) {
            that.selectedElems.forEach(function (elem) {
                that.pureUnselectize(elem, false)
                elem.fire('remove')
                elem.remove()
            })
            that.selectedElems = []
            that.updateView()
        }
    }

    fn.doScale = function (newScale, x, y) {
        let that = this
        let prevScale = that.scale

        that.scale = newScale
        $('#scale-num').text((that.scale * 100) + '%')


        let vb = that.svg.viewbox()


        let w = that.width / newScale
        let h = that.height / newScale

        let prew = that.width / prevScale
        let preh = that.height / prevScale

        let vx = ((x - vb.x) * w) / prew - x
        let vy = ((y - vb.y) * h) / preh - y
        vx = 0 - vx
        vy = 0 - vy
        /*let vx = x + vb.x - (x * w  /prew)
         let vy = y + vb.y- (y * h  /preh);*/

        that.svg.viewbox(vx, vy, w, h)
        that.initBg()

        let nested = that.svg.nested()
        let rect = nested.rect(200, 200).fill('#c90').move(100, 100)
    }

    fn.dealSelectedElem = function (callback) {
        let that = this
        that.selectedElems.forEach(function (elem) {
           callback(elem)
        })
    }

    fn.deepElem = function (elem, callback) {
        function deepGroup(g) {
            g.each(function () {
                if (this instanceof SVG.G) {
                    deepGroup(this)
                } else {
                    callback(this)
                }
            })
        }
        if (elem instanceof SVG.G) {
            deepGroup(elem)
        } else {
            callback(elem)
        }
    }

    // 保存
    fn.save = function() {
        ui.msg('功能暂未实现')
    }

    // 撤销
    fn.undo = function() {
        ui.msg('功能暂未实现')
    }

    // 初始化事件
    fn._event = function () {

        let that = this

        $(document).on('keydown', function (e) {
            let handler = that.handlers[that.type]
            if (handler && handler.keydown) {
                handler.keydown(e, this)
            }
        })

        /*document.addEventListener('paste', function (e) {
            console.log(e)
        }, false);*/

        that.$svg.on('ui-change', '.elem', function (e) {
            alert('?')
        })

        let isOver = false
        /*that.$svg[0].addEventListener('mouseover', function (e) {
            e.stopPropagation()
            console.log('enter')

        }, false)*/
        function fixedMouse(e,target){
            let related,
                type=e.type.toLowerCase();//这里获取事件名字
            if(type=='mouseover'){
                related=e.relatedTarget||e.fromElement
            }else if(type='mouseout'){
                related=e.relatedTarget||e.toElement
            }else return true
            return related && related.prefix!='xul' && !contains(target,related) && related!==target
        }
        that.$svg.on('mouseenter', function (e) {
                //console.log('enter')
        })
        /*that.$svg.on('mouseover', '.elem', function (e) {
            if (e.originalEvent.fromElement.tagName !== 'svg') {
                console.log(e.originalEvent)
                console.log('enter')
            }
            let elem = SVG.adopt(this)
            let rbox = that.rbox(elem)
            //console.log(rbox)
            that.hoverElem = that.tmpElem.rect(rbox.width, rbox.height).move(rbox.x, rbox.y)
            //e.stopPropagation()
        })
        that.$svg.on('mouseout', '.elem', function (e) {
            console.log('out')
            that.hoverElem.remove()
        });*/

        that.$svg.on('click', '.elem', function (e) {
            e.stopPropagation()
            let handler = that.handlers[that.type]
            if (handler && handler.elemClick) {
                handler.elemClick(e, this)
            }
        })

        let downX = 0
        let downY = 0
        // 点击编辑区空白位置
        that.$svg.on('mousedown', function (e) {
            downX = e.clientX
            downY = e.clientY
        })
        that.$svg.on('mouseup', function (e) {
            // 两重判断
            if (e.originalEvent.srcElement.id === 'svg') {
                if (e.clientX === downX && e.clientY === downY) { // 防止拖拽时取消选择
                    that.unselectAllElem()
                    that.initBase()
                }
            }
        })

        let blankKeydown = false
        $(document).on('keydown', function (e) {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return
            }
            if (that.editing) {
                return
            }
            switch (e.keyCode) {
                case 18: // Alt
                    break
                case 37: // left
                    if (e.ctrlKey) {
                        if (that.selectedElems.length) {
                            that.widthSelectedElem(e, -1)
                            return false
                        }
                    } else {
                        if (that.selectedElems.length) {
                            that.leftSelectedElem(e)
                            return false
                        }
                    }
                    break
                case 38: // top
                    if (e.ctrlKey) {
                        if (that.selectedElems.length) {
                            that.heightSelectedElem(e, -1)
                            return false
                        }
                    } else {
                        if (that.selectedElems.length) {
                            that.topSelectedElem(e)
                            return false
                        }
                    }
                    break
                case 39: // right
                    if (e.ctrlKey) {
                        if (that.selectedElems.length) {
                            that.widthSelectedElem(e, 1)
                            return false
                        }
                    } else {
                        if (that.selectedElems.length) {
                            that.rightSelectedElem(e)
                            return false
                        }
                    }
                    break
                case 40: // down
                    if (e.ctrlKey) {
                        if (that.selectedElems.length) {
                            that.heightSelectedElem(e, 1)
                            return false
                        }
                    } else {
                        if (that.selectedElems.length) {
                            that.downSelectedElem(e)
                            return false
                        }
                    }
                    break
                case 49: // 1
                    that.getCurElem().move(0, 0).width(80).height(80)
                    return false
                case 8: // Backspace
                    that.removeSelectedElem()
                    return false
                case 32: // Space
                    if (!blankKeydown) {
                        that.usePlugin('drag')
                        blankKeydown = true
                        return false
                    }
                    break
                case 46: // Delete
                    that.removeSelectedElem()
                    return false
                case 65: // a
                    if (e.ctrlKey) {
                        that.selectAllElem()
                        return false
                    }
                    break
                case 67: // c
                    if (e.ctrlKey) {
                        that.copySelectedElem()
                        return false
                    }
                    break
                case 68: // d
                    if (e.ctrlKey) {
                        that.copySelectedElem()
                        that.pasteElem()
                        // that.removeSelectedElem()
                        return false
                    } else {
                        that.usePlugin('distance')
                        return false
                    }
                    break
                case 70: // f
                    return false
                case 71: // g
                     if (e.ctrlKey && e.shiftKey) {
                        that.ungroupSelectedElem()
                         return false
                     } else if (e.ctrlKey) {
                        that.groupSelectedElem()
                         return false
                     }
                    break
                case 74: // j
                    that.usePlugin('join')
                    $('#type-list-box').find('.active').removeClass('active')
                    $('[data-type="join"]').addClass('active')
                    return false
                case 76: // l
                    that.usePlugin('line')
                    $('#type-list-box').find('.active').removeClass('active')
                    $('[data-type="line"]').addClass('active')
                    return false
                case 78: // n
                    if (e.ctrlKey) {
                        that.clear()
                        return false
                    }
                    return false
                case 79: // o
                    that.usePlugin('ellipse')
                    $('#type-list-box').find('.active').removeClass('active')
                    $('[data-type="ellipse"]').addClass('active')
                    return false
                case 80: // p
                    that.usePlugin('path')
                    $('#type-list-box').find('.active').removeClass('active')
                    $('[data-type="path"]').addClass('active')
                    return false
                case 81: // q
                    let $header = $('#layout-header')
                    if ($header.hasClass('ui-close')) {
                        $('#layout-header').show()
                        $('#layout-tool').css('top', '50px')
                        $('#layout-body').css('top', '98px')
                        $header.removeClass('ui-close')
                        return false
                    } else {
                        $('#layout-header').hide()
                        $('#layout-tool').css('top', 0)
                        $('#layout-body').css('top', '50px')
                        $header.addClass('ui-close')
                        return false
                    }
                    break
                case 82: // r
                    that.usePlugin('rect')
                    $('#type-list-box').find('.active').removeClass('active')
                    $('[data-type="rect"]').addClass('active')
                    return false
                case 83: // s
                    if (e.ctrlKey) {
                        that.save()
                        return false
                    }
                    break
                case 86: // v
                    if (e.ctrlKey) {
                        that.pasteElem()
                        return false
                    } else {
                        that.usePlugin('select')
                        $('#type-list-box').find('.active').removeClass('active')
                        $('[data-type="select"]').addClass('active')
                        return false
                    }
                    break
                case 88: // x
                    if (e.ctrlKey) {
                        that.cutSelectedElem()
                        return false
                    }
                    break
                case 90: // z
                    if (e.ctrlKey) {
                        that.undo()
                        return false
                    }
                    break
                case 189: // -
                    if (e.ctrlKey) {
                        that.zoomOut()
                        return false
                    }
                    break
                case 187: // +
                    if (e.ctrlKey) {
                        that.zoomIn()
                        return false
                    }
                    break
            }
        })

        $(document).on('keyup', function (e) {
            switch (e.keyCode) {
                case 32: // 空白键
                    blankKeydown = false
                    that.usePlugin('select')
                    break
            }
        })

        function getScaleMultiplier(delta) {
            let speed = 0.065
            let scaleMultiplier = 1
            if (delta > 0) { // zoom out
                scaleMultiplier = (1 - speed)
            } else if (delta < 0) { // zoom in
                scaleMultiplier = (1 + speed)
            }

            return scaleMultiplier
        }

        $('#workplace-box').on('mousewheel', function(e, delta) {
            if (e.ctrlKey) {
                if (delta > 0) {
                    that.zoomIn()
                } else {
                    that.zoomOut()
                }
                return false
            }
        })

        that.svg.on('mousedown', function(e) {
            let handler = that.handlers[that.type]
            if (handler && handler.mousedown) {
                let pt = that.getPt(e)
                handler.mousedown(pt.x, pt.y, e)
            }
        }, false)

        that.svg.on('mousemove', function(e) {
            let pt = that.getPt(e)
            $('#position').text('(' + pt.x + ', ' + pt.y + ')')

            let handler = that.handlers[that.type]
            if (handler && handler.mousemove) {
                handler.mousemove(pt.x, pt.y, e)
            }

            //rect.draw(e)
        }, false)

        that.svg.on('mouseup', function(e){
            let handler = that.handlers[that.type]
            if (handler && handler.mouseup) {
                let pt = that.getPt(e)
                handler.mouseup(pt.x, pt.y, e)
            }
        }, false)

        $('#editor-fill-color').colorpicker({}).on('changeColor', function (e) {
            $('#editor-fill-none').removeClass('active')
            if (that.selectedElems.length) {
                that.dealSelectedElem(function (elem) {
                    that.deepElem(elem, function (el) {
                        el.fill(e.color.toHex())
                    })
                })
            } else {
                that.fill = e.color.toHex()
            }
        })
        $('#editor-fill-none').on('click', function () {
            $(this).addClass('active')
            if (that.selectedElems.length) {
                that.dealSelectedElem(function (elem) {
                    that.deepElem(elem, function (el) {
                        el.attr('fill', 'none')
                    })
                })
            } else {
                that.fill = 'none'
            }
        })
        // 描边
        $('#editor-stroke-color').colorpicker({}).on('changeColor', function (e) {
            if (that.selectedElems.length) {
                that.dealSelectedElem(function (elem) {
                    that.deepElem(elem, function (el) {
                        el.attr('stroke', e.color.toHex())
                    })
                })
            } else {
                that.stroke = e.color.toHex()
            }
        })
        $('#editor-stroke-width').on('input', function (e) {
            let strokeWidth = $(this).val()
            if (that.selectedElems.length) {
                that.dealSelectedElem(function (elem) {
                    that.deepElem(elem, function (el) {
                        el.attr('stroke-width', strokeWidth)
                    })
                })
            } else {
                that.strokeWidth = strokeWidth
            }
        })
        $('#stroke-dasharray').on('change', function (e) {
            let dasharray = $(this).val()
            if (that.selectedElems.length) {
                that.dealSelectedElem(function (elem) {
                    that.deepElem(elem, function (el) {
                        el.attr('stroke-dasharray', dasharray)
                    })
                })
            } else {
                that.strokeDasharray = dasharray
            }
        })
        $('#editor-opacity').on('input', function (e) {
            let opacity = $(this).val() / 100
            if (that.selectedElems.length) {
                that.dealSelectedElem(function (elem) {
                    that.deepElem(elem, function (el) {
                        el.attr('opacity', opacity)
                    })
                })
            } else {
                that.opacity = opacity
            }
        })
    }

    fn.unSelectElem = function () {
        let that = this

        if (that.getCurElem()) {
            that.pureUnselectize(that.getCurElem())
        }
    }

    fn.unselectAllElem = function () {
        let that = this
        that.selectedElems.forEach(function (elem) {
            that.pureUnselectize(elem, false)
        })
        that.selectedElems = []
    }

    // 水平翻转
    fn.flipXElem = function () {
        let that = this

        let s = that.getCurElem()
        if (!s) {
            return
        }
        
        let matrix = new SVG.Matrix(s)
        let bbox = s.bbox()
        //svg.line(bbox.x, bbox.y, bbox.x2, bbox.y2).fill('#f90').stroke({width: 1})
        let m2 = matrix.flip('x', (bbox.x + bbox.x2) / 2)
        //let m2 = matrix.rotate(90)
        s.matrix(m2)
        s.center((bbox.x + bbox.x2) / 2, (bbox.y + bbox.y2) / 2)
    }
    
    // 初始化文字工具
    fn.initText = function () {
        let that = this

        that.$svg.on('dblclick', '.elem', function () {
            let elem = SVG.adopt(this)
            if (elem.type === 'path') {
                that.usePlugin('path')
                that.setPenMode(5)
                $('#pen-move').addClass('active')
                that.pureUnselectize(that.getCurElem())
                that.unSelectElem()
                that.dealPath(elem)
                $('#type-list-box').find('.active').removeClass('active')
                $('#pen').addClass('active')
                return
            } else if (elem instanceof SVG.Text) {
                dealText(elem)
            } else if (elem.type !== 'g') {
                ui.msg('基本形状无法编辑文字')
            } else if (elem instanceof SVG.G) {
                //let text = elem.select('text'); // TODO
                let text = elem.children()[1]
                dealText(text)
            }

            function dealText(text) {
                if (text.type === 'text') {
                    let rbox = that.rbox(text.parent())

                    let $inputBox = $('#input-box')
                    let width = rbox.width
                    let height = rbox.height

                    if (text.parent().type === 'svg' || width > 200 || height > 200) {
                        let textX = text.attr('x')
                        let textY = text.attr('y')
                        width = 200
                        height = 100
                        rbox.x = textX - 100
                        rbox.y  = textY - 50
                    }
                    let position = $('#svg-box').position()
                    let offset = $('#svg').offset()
                    $inputBox.css({
                        left: rbox.x,
                        top: rbox.y,
                        width: width,
                        height: height,
                        'display': 'block'
                    })
                    let $input = $inputBox.find('.input')
                    $input.val(text.text().trim()).focus()
                    $input[0].select()
                    that.editing = true
                    $input.one('blur', function () {
                        $inputBox.hide()
                        text.plain(this.value)
                        that.editing = false
                    })
                }
            }

        })

    }

    // 更新缩略图
    fn.updateA = function () {
        let that = this

        let wp = document.getElementById('workplace')
        let $wp = $('#workplace')
        let $wpBox = $('#workplace-box')
        let $svgBox = $('#svg-box')

        // 缩略图插件
        let $tn = $('#thumbnail')
        let $tnBox = $('#thumbnail-viewbox')
        let $tnCanvas = $('#thumbnail-canvas')

        // svg 居中
        $svgBox.css({
            top: ($wp.outerHeight() - $svgBox.outerHeight()) / 2,
            left: ($wp.outerWidth() - $svgBox.outerWidth()) / 2
        })
        $wpBox[0].scrollTop = ($wp.outerHeight() - $wpBox.outerHeight()) / 2
        $wpBox[0].scrollLeft = ($wp.outerWidth() - $wpBox.outerWidth()) / 2

        $tn.css({
            width: $wp.outerWidth() / that.rateX,
            height: $wp.outerHeight() / that.rateY
        })
        $tnCanvas.css({
            width: $svgBox.outerWidth() / that.rateX,
            height: $svgBox.outerHeight() / that.rateY,
            left: $svgBox[0].offsetLeft / that.rateX,
            top: $svgBox[0].offsetTop / that.rateY,
        })
        $tnBox.css({
            width: $wpBox.outerWidth() / that.rateX,
            height: $wpBox.outerHeight() / that.rateY,
            /*/!*left: $svgBox[0].offsetLeft / that.rateX,
             top: $svgBox[0].offsetTop / that.rateX,*!/*/
        })

        $tnBox.draggable('destroy')
        $tnBox.draggable({
            containment: 'parent',
            start: function () {
                canScroll = false
            },
            drag: function (e, ui) {
                $wpBox[0].scrollTop = parseInt(ui.style.top.replace('px', '')) * that.rateY
                $wpBox[0].scrollLeft = parseInt(ui.style.left.replace('px', '')) * that.rateX
            },
            end: function () {
                canScroll = true
            }
        })

        that.initBg()
    }

    fn.initGrid = function () {
        let that = this
        let g = that.svg.group()
        let gridW = 10; // TODO
        let num = 100

        for (let i = 0; i < num; i++) {
            let x = (i + 1) * gridW
            if ((i + 1) % 10 === 0) {
                g.line(x, 0, x, 20).fill('#999').stroke('#999')
            } else {
                g.line(x, 0, x, 10).fill('#999').stroke('#999')
            }
        }
    }

    // 选中元素置于顶层
    fn.frontSelectedElem = function () {
        let that = this
        that.getCurElem().front()
    }
    
    // 选中元素置于底层
    fn.backSelectedElem = function () {
        let that = this
        that.getCurElem().back()
    }

    // 选中元素上移一层
    fn.forwardSelectedElem = function () {
        let that = this
        that.getCurElem().forward()
    }

    // 选中元素下移一层
    fn.backwardSelectedElem = function () {
        let that = this
        that.getCurElem().back()
    }

    // 移动组
    fn.moveGroup = function (group, x, y) {
        let that = this
        let oriBox = that.rbox(group)
        group.each(function(i, children) {
            if (this instanceof SVG.G) {
                that.moveGroup(this)
            } else {
                let bbox
                if (this instanceof SVG.Text) {
                    let textX = this.attr('x')
                    let textY = this.attr('y')
                    this.attr('x', textX + x - oriBox.x).attr('y', textY + y - oriBox.y)
                    group.attr('data-asd', new Date().getTime())
                } else {
                    let rbox = that.rbox(this)
                    this.move(rbox.x + x - oriBox.x, rbox.y + y - oriBox.y)
                    group.attr('data-asd', new Date().getTime())
                }
            }
        }, true)
    }

    // 调整组大小
    fn.sizeGroup = function (elem, oriBox, x, y, width, height) {
        let that = this
        elem.each(function () {
            if (this.type === 'g') {
                that.resizeGroup(this, oriBox, x, y, width, height)
            } else {
                if (this instanceof SVG.Text) {
                    let textX = this.attr('x')
                    let textY = this.attr('y')

                    let newX = width * (textX - oriBox.x) / oriBox.width + x
                    let newY = height * (textY - oriBox.y) / oriBox.height + y
                    if (this.attr('data-style') === 'fixedY') {
                        newY = textY
                    }
                    this.attr('x', newX).attr('y', newY)
                } else {
                    let bbox = this.bbox()
                    let newWidth = bbox.width * width / oriBox.width
                    let newHeight = bbox.height * height / oriBox.height
                    let newX = (bbox.x - oriBox.x) * width / oriBox.width + x
                    let newY = height * (bbox.y - oriBox.y) / oriBox.height + y

                    if (this.attr('data-style') === 'fixedHeight') {
                        newHeight = bbox.height
                    }
                    if (this.attr('data-style') === 'fixedTop') {
                        newY = bbox.y
                    }

                    this.move(newX, newY).width(newWidth).height(newHeight)
                    elem.attr('data-asd', new Date().getTime())
                }

            }
        })
    }

    // 移动元素，适用于所有元素，包括组
    fn.moveElem = function (elem, x, y) {
        let that = this
        if (elem instanceof SVG.G) {
            that.moveGroup(elem, x, y)
        } else {
            elem.move(x, y)
            //elem.fire('ui-change')
        }
        elem.fire('ui-change')
    }

    fn.sizeElem = function (elem, width, height) {
        let that = this
        if (elem instanceof SVG.G) {
            let oriBox = that.rbox(elem)
            that.sizeGroup(elem, oriBox, oriBox.x, oriBox.y, width, height)
        } else {
            if (elem instanceof SVG.Ellipse) {
                let cx = elem.attr('cx') + width / 2 - elem.attr('rx')
                let cy = elem.attr('cy') + height / 2 - elem.attr('ry')
                elem.center(cx, cy)
                //elem.attr('cx', cx)
                //let x = elem.attr('cx')
                //elem.move(0, 0)
                elem.size(width, height)
            } else {
                elem.size(width, height)
            }
        }
    }
    
    fn.widthSelectedElem = function (e, direct) {
        let that = this
        let offset = (e.shiftKey ? that.opts.grid : 1) * direct
        that.selectedElems.forEach(function (elem) {
            that.deepElem(elem, function (el) {
                let rbox = that.rbox(elem)
                that.sizeElem(elem, rbox.width + offset, rbox.height)
            })
        })
    }

    fn.heightSelectedElem = function (e, direct) {
        let that = this
        let offset = (e.shiftKey ? that.opts.grid : 1) * direct
        that.selectedElems.forEach(function (elem) {
            that.deepElem(elem, function (el) {
                let rbox = that.rbox(elem)
                that.sizeElem(elem, rbox.width, rbox.height + offset)
            })
        })
    }

    fn.snapGrid = function (num) {
        return Math.floor(num / this.opts.grid) * this.opts.grid
    }

    fn.rightSelectedElem = function (e) {
        let that = this

        that.selectedElems.forEach(function (elem) {
            let rbox = that.rbox(elem)
            let x = e.shiftKey ? (rbox.x + that.opts.grid) : (rbox.x + 1)
            //let x = e.shiftKey ? (Math.floor(rbox.x / that.opts.grid + 1) * that.opts.grid) : (rbox.x + 1)
            that.moveElem(elem, x, rbox.y)
        })
    }

    fn.leftSelectedElem = function (e) {
        let that = this
        that.selectedElems.forEach(function (elem) {
            let rbox = that.rbox(elem)
            //let x = e.shiftKey ? (Math.floor(rbox.x / that.opts.grid) * that.opts.grid) : (rbox.x + 1)
            let x = e.shiftKey ? (rbox.x - that.opts.grid) : (rbox.x - 1)
            that.moveElem(elem, x, rbox.y)
        })
    }

    fn.topSelectedElem = function (e) {
        let that = this
        let offset = e.shiftKey ? that.opts.grid : 1
        that.selectedElems.forEach(function (elem) {
            let rbox = that.rbox(elem)
            that.moveElem(elem, rbox.x, rbox.y - offset)
        })
    }

    fn.downSelectedElem = function (e) {
        let that = this
        let offset = e.shiftKey ? that.opts.grid : 1
        that.selectedElems.forEach(function (elem) {
            let rbox = that.rbox(elem)
            that.moveElem(elem, rbox.x, rbox.y + offset)
        })
    }

    /// 插件相关
    SVGEditor.plugins = {}
    SVGEditor.typeId = 100000
    SVGEditor.getTypeId = function () {
        return SVGEditor.typeId++
    }
    SVGEditor.addPlugin = function (plugin) {
        //plugin.type = DrawBoard._getTypeId()
        SVGEditor.plugins[plugin.name] = plugin
    }

    // 预加载插件
    fn.preloadPlugin = function (pluginName) {
        let that = this

        let plugin = SVGEditor.plugins[pluginName]
        if (!plugin) {
            console.error('加载不到插件：' + pluginName)
            return
        }

        // 第一次使用插件时，做初始化
        if (!plugin.hasInit) {
            plugin.hasInit = true
            plugin.init.call(this)
        }
    }
    fn.usePlugin = function (pluginName) {
        let that = this

        let plugin = SVGEditor.plugins[pluginName]
        if (!plugin) {
            console.error('加载不到插件：' + pluginName)
            return
        }

        // 第一次使用插件时，做初始化
        if (!plugin.hasInit) {
            plugin.hasInit = true
            plugin.init.call(this)
        }

        if (that.type && that.handlers[that.type] && typeof that.handlers[that.type].unselect === 'function') {
            that.handlers[that.type].unselect()
        }

        that.type = plugin.type
        if (that.handlers[that.type] && typeof that.handlers[that.type].select === 'function') {
            that.handlers[that.type].select()
        }
    }

    window.SVGEditor = SVGEditor

})(jQuery)