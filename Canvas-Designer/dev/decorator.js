var tools = {
    line: true,
    arrow: true,
    pencil: true,
    marker: true,
    dragSingle: true,
    dragMultiple: true,
    eraser: true,
    rectangle: true,
    arc: true,
    bezier: true,
    quadratic: true,
    text: true,
    image: true,
    zoom: true
};

if (params.tools) {
    try {
        var t = JSON.parse(params.tools);
        tools = t;
    } catch (e) {}
}

function setSelection(element, prop) {
    endLastPath();
    hideContainers();

    is.set(prop);

    var selected = document.getElementsByClassName('selected-shape')[0];
    if (selected) selected.className = selected.className.replace(/selected-shape/g, '');

    if (!element.className) {
        element.className = '';
    }

    element.className += ' selected-shape';
}

/* Default: setting default selected shape!! */
is.set(window.selectedIcon);

window.addEventListener('load', function() {
    var toolBox = document.getElementById('tool-box');
    var canvasElements = toolBox.getElementsByTagName('canvas');
    var shape = window.selectedIcon.toLowerCase();


    var firstMatch;
    for (var i = 0; i < canvasElements.length; i++) {
        if (!firstMatch && (canvasElements[i].id || '').indexOf(shape) !== -1) {
            firstMatch = canvasElements[i];
        }
    }
    if (!firstMatch) {
        window.selectedIcon = 'Pencil';
        firstMatch = document.getElementById('pencil-icon');
    }

    setSelection(firstMatch, window.selectedIcon);
}, false);

(function() {
    var cache = {};

    var lineCapSelect = find('lineCap-select');
    var lineJoinSelect = find('lineJoin-select');

    function getContext(id) {
        var context = find(id).getContext('2d');
        context.lineWidth = 2;
        context.strokeStyle = '#6c96c8';
        return context;
    }

    function bindEvent(context, shape) {
        if (shape === 'Pencil' || shape === 'Marker') {
            lineCap = lineJoin = 'round';
        }

        addEvent(context.canvas, 'click', function() {
            if (textHandler.text.length) {
                textHandler.appendPoints();
            }

            if (shape === 'Text') {
                textHandler.onShapeSelected();
            } else {
                textHandler.onShapeUnSelected();
            }

            if (shape === 'Pencil' || shape === 'Marker') {
                lineCap = lineJoin = 'round';
            }

            dragHelper.global.startingIndex = 0;

            setSelection(this, shape);

            if (this.id === 'drag-last-path') {
                find('copy-last').checked = true;
                find('copy-all').checked = false;
            } else if (this.id === 'drag-all-paths') {
                find('copy-all').checked = true;
                find('copy-last').checked = false;
            }

            if (this.id === 'image-icon') {
                var selector = new FileSelector();
                selector.selectSingleFile(function(file) {
                    if (!file) return;

                    var reader = new FileReader();
                    reader.onload = function(event) {
                        var image = new Image();
                        image.onload = function() {
                            var index = imageHandler.images.length;

                            imageHandler.lastImageURL = image.src;
                            imageHandler.lastImageIndex = index;

                            imageHandler.images.push(image);
                        };
                        image.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                });
            }

            if (this.id === 'pencil-icon' || this.id === 'eraser-icon' || this.id === 'marker-icon') {
                cache.lineCap = lineCap;
                cache.lineJoin = lineJoin;

                lineCap = lineJoin = 'round';
            } else if (cache.lineCap && cache.lineJoin) {
                lineCap = cache.lineCap;
                lineJoin = cache.lineJoin;
            }

            if (this.id === 'eraser-icon') {
                cache.strokeStyle = strokeStyle;
                cache.fillStyle = fillStyle;
                cache.lineWidth = lineWidth;

                strokeStyle = 'White';
                fillStyle = 'White';
                lineWidth = 10;
            } else if (cache.strokeStyle && cache.fillStyle && typeof cache.lineWidth !== 'undefined') {
                strokeStyle = cache.strokeStyle;
                fillStyle = cache.fillStyle;
                lineWidth = cache.lineWidth;
            }
        });
    }

    var toolBox = find('tool-box');
    toolBox.style.height = (innerHeight /* - toolBox.offsetTop - 77 */ ) + 'px';

    function decorateDragLastPath() {
        var context = getContext('drag-last-path');

        var x = 10,
            y = 6,
            line = "line",
            points = [
                [line, x, y, x + 5, y + 27],
                [line, x, y, x + 18, y + 19],
                [line, x + 17, y + 19, x + 9, y + 20],
                [line, x + 9, y + 20, x + 5, y + 27],
                [line, x + 16, y + 22, x + 16, y + 31],
                [line, x + 12, y + 27, x + 20, y + 27]
            ],
            length = points.length,
            point, i;

        for (i = 0; i < length; i++) {
            point = points[i];

            if (point[0] === "line") {
                context.beginPath();
                context.moveTo(point[1], point[2]);
                context.lineTo(point[3], point[4]);
                context.closePath();
                context.stroke();
            }
        }

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Last', 18, 12);

        bindEvent(context, 'DragLastPath');
    }

    if (tools.dragSingle === true) {
        decorateDragLastPath();
    } else document.getElementById('drag-last-path').style.display = 'none';

    function decorateDragAllPaths() {
        var context = getContext('drag-all-paths');

        var x = 10,
            y = 6,
            line = "line",
            points = [
                [line, x, y, x + 5, y + 27],
                [line, x, y, x + 18, y + 19],
                [line, x + 17, y + 19, x + 9, y + 20],
                [line, x + 9, y + 20, x + 5, y + 27],
                [line, x + 16, y + 22, x + 16, y + 31],
                [line, x + 12, y + 27, x + 20, y + 27]
            ],
            length = points.length,
            point, i;

        for (i = 0; i < length; i++) {
            point = points[i];

            if (point[0] === "line") {
                context.beginPath();
                context.moveTo(point[1], point[2]);
                context.lineTo(point[3], point[4]);
                context.closePath();
                context.stroke();
            }
        }

        context.fillStyle = 'Gray';
        context.font = '10px Verdana';
        context.fillText('All', 20, 12);

        bindEvent(context, 'DragAllPaths');
    }

    if (tools.dragMultiple === true) {
        decorateDragAllPaths();
    } else document.getElementById('drag-all-paths').style.display = 'none';

    function decorateLine() {
        var context = getContext('line');

        context.moveTo(10, 15);
        context.lineTo(30, 35);
        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Line', 16, 12);

        bindEvent(context, 'Line');
    }

    if (tools.line === true) {
        decorateLine();
    } else document.getElementById('line').style.display = 'none';

    function decorateArrow() {
        var context = getContext('arrow');

        var x = 10;
        var y = 35;

        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + 20, y - 20);
        context.stroke();

        context.beginPath();
        context.moveTo(x + 15, y - 5);
        context.lineTo(x + 20, y - 20);
        context.stroke();

        context.beginPath();
        context.moveTo(x + 5, y - 15);
        context.lineTo(x + 20, y - 20);
        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Arrow', 5, 12);

        bindEvent(context, 'Arrow');
    }

    if (tools.arrow === true) {
        decorateArrow();
    } else document.getElementById('arrow').style.display = 'none';

    function decoreZoomUp() {
        var context = getContext('zoom-up');
        zoomHandler.icons.up(context);
        addEvent(context.canvas, 'click', function() {
            zoomHandler.up();
        });
    }

    function decoreZoomDown() {
        var context = getContext('zoom-down');
        zoomHandler.icons.down(context);
        addEvent(context.canvas, 'click', function() {
            zoomHandler.down();
        });
    }

    if (tools.zoom === true) {
        decoreZoomUp();
        decoreZoomDown();
    } else {
        document.getElementById('zoom-up').style.display = 'none';
        document.getElementById('zoom-down').style.display = 'none';
    }

    function decoratePencil() {

        function hexToRGBA(h, alpha) {
            return 'rgba(' + hexToRGB(h).join(',') + ',1)';
        }

        var colors = [
            ['FFFFFF', '006600', '000099', 'CC0000', '8C4600'],
            ['CCCCCC', '00CC00', '6633CC', 'FF0000', 'B28500'],
            ['666666', '66FFB2', '006DD9', 'FF7373', 'FF9933'],
            ['333333', '26FF26', '6699FF', 'CC33FF', 'FFCC99'],
            ['000000', 'CCFF99', 'BFDFFF', 'FFBFBF', 'FFFF33']
        ];

        var context = getContext('pencil-icon');

        context.lineWidth = 5;
        context.lineCap = 'round';
        context.moveTo(35, 20);
        context.lineTo(5, 35);
        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Pencil', 6, 12);

        bindEvent(context, 'Pencil');

        var pencilContainer = find('pencil-container'),
            pencilColorContainer = find('pencil-fill-colors'),
            strokeStyleText = find('pencil-stroke-style'),
            pencilColorsList = find("pencil-colors-list"),
            fillStyleText = find('pencil-fill-style'),
            pencilSelectedColor = find('pencil-selected-color'),
            pencilSelectedColor2 = find('pencil-selected-color-2'),
            btnPencilDone = find('pencil-done'),
            canvas = context.canvas,
            alpha = 0.2;

        // START INIT PENCIL



        pencilStrokeStyle = hexToRGBA(fillStyleText.value, alpha)

        pencilSelectedColor.style.backgroundColor =
            pencilSelectedColor2.style.backgroundColor = '#' + fillStyleText.value;

        colors.forEach(function(colorRow) {
            var row = '<tr>';

            colorRow.forEach(function(color) {
                row += '<td style="background-color:#' + color + '" data-color="' + color + '"></td>';
            })
            row += '</tr>';

            pencilColorsList.innerHTML += row;
        })

        // console.log(pencilColorsList.getElementsByTagName('td'))
        Array.prototype.slice.call(pencilColorsList.getElementsByTagName('td')).forEach(function(td) {
            addEvent(td, 'mouseover', function() {
                var elColor = td.getAttribute('data-color');
                pencilSelectedColor2.style.backgroundColor = '#' + elColor;
                fillStyleText.value = elColor
            });

            addEvent(td, 'click', function() {
                var elColor = td.getAttribute('data-color');
                pencilSelectedColor.style.backgroundColor =
                    pencilSelectedColor2.style.backgroundColor = '#' + elColor;

                fillStyleText.value = elColor;


                pencilColorContainer.style.display = 'none';
            });
        })

        // END INIT PENCIL

        addEvent(canvas, 'click', function() {
            hideContainers();

            pencilContainer.style.display = 'block';
            pencilContainer.style.top = (canvas.offsetTop + 1) + 'px';
            pencilContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

            fillStyleText.focus();
        });

        addEvent(btnPencilDone, 'click', function() {
            pencilContainer.style.display = 'none';
            pencilColorContainer.style.display = 'none';

            pencilLineWidth = strokeStyleText.value;
            pencilStrokeStyle = hexToRGBA(fillStyleText.value, alpha);
        });

        addEvent(pencilSelectedColor, 'click', function() {
            pencilColorContainer.style.display = 'block';
        });
    }

    if (tools.pencil === true) {
        decoratePencil();
    } else document.getElementById('pencil-icon').style.display = 'none';

    function decorateMarker() {

        function hexToRGBA(h, alpha) {
            return 'rgba(' + hexToRGB(h).join(',') + ',' + alpha + ')';
        }
        var colors = [
            ['FFFFFF', '006600', '000099', 'CC0000', '8C4600'],
            ['CCCCCC', '00CC00', '6633CC', 'FF0000', 'B28500'],
            ['666666', '66FFB2', '006DD9', 'FF7373', 'FF9933'],
            ['333333', '26FF26', '6699FF', 'CC33FF', 'FFCC99'],
            ['000000', 'CCFF99', 'BFDFFF', 'FFBFBF', 'FFFF33']
        ];

        var context = getContext('marker-icon');

        context.lineWidth = 9;
        context.lineCap = 'round';
        context.strokeStyle = 'green';
        context.moveTo(35, 20);
        context.lineTo(5, 25);
        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Marker', 6, 12);

        bindEvent(context, 'Marker');

        var markerContainer = find('marker-container'),
            markerColorContainer = find('marker-fill-colors'),
            strokeStyleText = find('marker-stroke-style'),
            markerColorsList = find("marker-colors-list"),
            fillStyleText = find('marker-fill-style'),
            markerSelectedColor = find('marker-selected-color'),
            markerSelectedColor2 = find('marker-selected-color-2'),
            btnMarkerDone = find('marker-done'),
            canvas = context.canvas,
            alpha = 0.2;

        // START INIT MARKER



        markerStrokeStyle = hexToRGBA(fillStyleText.value, alpha)

        markerSelectedColor.style.backgroundColor =
            markerSelectedColor2.style.backgroundColor = '#' + fillStyleText.value;

        colors.forEach(function(colorRow) {
            var row = '<tr>';

            colorRow.forEach(function(color) {
                row += '<td style="background-color:#' + color + '" data-color="' + color + '"></td>';
            })
            row += '</tr>';

            markerColorsList.innerHTML += row;
        })

        // console.log(markerColorsList.getElementsByTagName('td'))
        Array.prototype.slice.call(markerColorsList.getElementsByTagName('td')).forEach(function(td) {
            addEvent(td, 'mouseover', function() {
                var elColor = td.getAttribute('data-color');
                markerSelectedColor2.style.backgroundColor = '#' + elColor;
                fillStyleText.value = elColor
            });

            addEvent(td, 'click', function() {
                var elColor = td.getAttribute('data-color');
                markerSelectedColor.style.backgroundColor =
                    markerSelectedColor2.style.backgroundColor = '#' + elColor;

                fillStyleText.value = elColor;


                markerColorContainer.style.display = 'none';
            });
        })

        // END INIT MARKER

        addEvent(canvas, 'click', function() {
            hideContainers();

            markerContainer.style.display = 'block';
            markerContainer.style.top = (canvas.offsetTop + 1) + 'px';
            markerContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

            fillStyleText.focus();
        });

        addEvent(btnMarkerDone, 'click', function() {
            markerContainer.style.display = 'none';
            markerColorContainer.style.display = 'none';

            markerLineWidth = strokeStyleText.value;
            markerStrokeStyle = hexToRGBA(fillStyleText.value, alpha);
        });

        addEvent(markerSelectedColor, 'click', function() {
            markerColorContainer.style.display = 'block';
        });
    }

    if (tools.marker === true) {
        decorateMarker();
    } else document.getElementById('marker-icon').style.display = 'none';

    function decorateEraser() {
        var context = getContext('eraser-icon');

        context.lineWidth = 9;
        context.lineCap = 'round';
        context.moveTo(35, 20);
        context.lineTo(5, 25);
        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Eraser', 6, 12);

        bindEvent(context, 'Eraser');
    }

    if (tools.eraser === true) {
        decorateEraser();
    } else document.getElementById('eraser-icon').style.display = 'none';

    function decorateText() {
        var context = getContext('text-icon');

        context.font = '22px Verdana';
        context.strokeText('T', 15, 30);

        bindEvent(context, 'Text');
    }

    if (tools.text === true) {
        decorateText();
    } else document.getElementById('text-icon').style.display = 'none';

    function decorateImage() {
        var context = getContext('image-icon');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'Image');
        };
        image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAADFBMVEVYWFhVVVUAAABUVFTqqlXjAAAAA3RSTlMxdACUjPeLAAAATElEQVR42u3SQQrAMAwDQSn7/z+XFExTcOxroN3zgC4STecApy1gpP2gBgZXQMwKwJ23QITYACLlQBC9gAFNwJMXoJhVc7lBA/gsuAArEgqPcT12VgAAAABJRU5ErkJggg==';
    }

    if (tools.image === true) {
        decorateImage();
    } else document.getElementById('image-icon').style.display = 'none';

    function decorateArc() {
        var context = getContext('arc');

        context.arc(20, 20, 16.3, Math.PI * 2, 0, 1);
        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Arc', 10, 24);

        bindEvent(context, 'Arc');
    }

    if (tools.arc === true) {
        decorateArc();
    } else document.getElementById('arc').style.display = 'none';

    function decorateRect() {
        var context = getContext('rectangle');

        context.strokeRect(5, 5, 30, 30);

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Rect', 8, 24);

        bindEvent(context, 'Rectangle');
    }

    if (tools.rectangle === true) {
        decorateRect();
    } else document.getElementById('rectangle').style.display = 'none';

    function decorateQuadratic() {
        var context = getContext('quadratic-curve');

        context.moveTo(0, 0);
        context.quadraticCurveTo(50, 10, 30, 40);
        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('quad..', 2, 24);

        bindEvent(context, 'QuadraticCurve');
    }

    if (tools.quadratic === true) {
        decorateQuadratic();
    } else document.getElementById('quadratic-curve').style.display = 'none';

    function decorateBezier() {
        var context = getContext('bezier-curve');

        var x = 0,
            y = 4;

        context.moveTo(x, y);
        context.bezierCurveTo(x + 86, y + 16, x - 45, y + 24, x + 48, y + 34);

        context.stroke();

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Bezier', 10, 8);

        bindEvent(context, 'BezierCurve');
    }

    if (tools.bezier === true) {
        decorateBezier();
    } else document.getElementById('bezier-curve').style.display = 'none';

    function tempStrokeTheLine(context, width, mx, my, lx, ly) {
        context.beginPath();
        context.lineWidth = width;
        context.moveTo(mx, my);
        context.lineTo(lx, ly);
        context.stroke();
    }

    function decorateLineWidth() {
        var context = getContext('line-width');

        tempStrokeTheLine(context, 2, 5, 15, 35, 15);
        tempStrokeTheLine(context, 3, 5, 20, 35, 20);
        tempStrokeTheLine(context, 4, 5, 26, 35, 26);

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Line', 8, 12);
        context.fillText('Width', 6, 38);

        var lineWidthContainer = find('line-width-container'),
            lineWidthText = find('line-width-text'),
            btnLineWidthDone = find('line-width-done'),
            h1 = document.getElementsByTagName('h1')[0],
            canvas = context.canvas;

        addEvent(canvas, 'click', function() {
            hideContainers();

            lineWidthContainer.style.display = 'block';
            lineWidthContainer.style.top = (canvas.offsetTop + 1) + 'px';
            lineWidthContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

            lineWidthText.focus();
        });

        addEvent(btnLineWidthDone, 'click', function() {
            lineWidthContainer.style.display = 'none';
            lineWidth = lineWidthText.value;
        });
    }

    decorateLineWidth();

    function decorateColors() {
        var context = getContext('colors');

        context.fillStyle = 'red';
        context.fillRect(5, 3, 30, 10);

        context.fillStyle = 'green';
        context.fillRect(5, 15, 30, 10);

        context.fillStyle = 'blue';
        context.fillRect(5, 27, 30, 10);

        var colorsContainer = find('colors-container'),
            strokeStyleText = find('stroke-style'),
            fillStyleText = find('fill-style'),
            btnColorsDone = find('colors-done'),
            h1 = document.getElementsByTagName('h1')[0],
            canvas = context.canvas;

        addEvent(canvas, 'click', function() {
            hideContainers();

            colorsContainer.style.display = 'block';
            colorsContainer.style.top = (canvas.offsetTop + 1) + 'px';
            colorsContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

            strokeStyleText.focus();
        });

        addEvent(btnColorsDone, 'click', function() {
            colorsContainer.style.display = 'none';
            strokeStyle = strokeStyleText.value;
            fillStyle = fillStyleText.value;
        });
    }

    decorateColors();

    function decorateAdditionalOptions() {
        var context = getContext('additional');

        context.fillStyle = '#6c96c8';
        context.font = '35px Verdana';
        context.fillText('»', 10, 27);

        context.fillStyle = 'Gray';
        context.font = '9px Verdana';
        context.fillText('Extras!', 2, 38);

        var additionalContainer = find('additional-container'),
            btnAdditionalClose = find('additional-close'),
            h1 = document.getElementsByTagName('h1')[0],
            canvas = context.canvas,
            globalAlphaSelect = find('globalAlpha-select'),
            globalCompositeOperationSelect = find('globalCompositeOperation-select');

        addEvent(canvas, 'click', function() {
            hideContainers();

            additionalContainer.style.display = 'block';
            additionalContainer.style.top = (canvas.offsetTop + 1) + 'px';
            additionalContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';
        });

        addEvent(btnAdditionalClose, 'click', function() {
            additionalContainer.style.display = 'none';

            globalAlpha = globalAlphaSelect.value;
            globalCompositeOperation = globalCompositeOperationSelect.value;
            lineCap = lineCapSelect.value;
            lineJoin = lineJoinSelect.value;
        });
    }

    decorateAdditionalOptions();

    var designPreview = find('design-preview'),
        codePreview = find('code-preview');

    // todo: use this function in share-drawings.js
    // to sync buttons' states
    window.selectBtn = function(btn, isSkipWebRTCMessage) {
        codePreview.className = designPreview.className = '';

        if (btn == designPreview) designPreview.className = 'preview-selected';
        else codePreview.className = 'preview-selected';

        if (!isSkipWebRTCMessage && window.connection && connection.numberOfConnectedUsers >= 1) {
            connection.send({
                btnSelected: btn.id
            });
        } else {
            // to sync buttons' UI-states
            if (btn == designPreview) btnDesignerPreviewClicked();
            else btnCodePreviewClicked();
        }
    };

    addEvent(designPreview, 'click', function() {
        selectBtn(designPreview);
        btnDesignerPreviewClicked();
    });

    function btnDesignerPreviewClicked() {
        codeText.parentNode.style.display = 'none';
        optionsContainer.style.display = 'none';

        hideContainers();
        endLastPath();
    }

    addEvent(codePreview, 'click', function() {
        selectBtn(codePreview);
        btnCodePreviewClicked();
    });

    function btnCodePreviewClicked() {
        codeText.parentNode.style.display = 'block';
        optionsContainer.style.display = 'block';

        codeText.focus();
        common.updateTextArea();

        setHeightForCodeAndOptionsContainer();

        hideContainers();
        endLastPath();
    }

    var codeText = find('code-text'),
        optionsContainer = find('options-container');

    function setHeightForCodeAndOptionsContainer() {
        codeText.style.width = (innerWidth - optionsContainer.clientWidth - 30) + 'px';
        codeText.style.height = (innerHeight - 40) + 'px';

        codeText.style.marginLeft = (optionsContainer.clientWidth) + 'px';
        optionsContainer.style.height = (innerHeight) + 'px';
    }

    var isAbsolute = find('is-absolute-points'),
        isShorten = find('is-shorten-code');

    addEvent(isShorten, 'change', common.updateTextArea);
    addEvent(isAbsolute, 'change', common.updateTextArea);
})();

function hideContainers() {
    var additionalContainer = find('additional-container'),
        colorsContainer = find('colors-container'),
        markerContainer = find('marker-container'),
        markerColorContainer = find('marker-fill-colors'),
        pencilContainer = find('pencil-container'),
        pencilColorContainer = find('pencil-fill-colors'),
        lineWidthContainer = find('line-width-container');

    additionalContainer.style.display =
        colorsContainer.style.display =
        markerColorContainer.style.display =
        markerContainer.style.display =
        pencilColorContainer.style.display =
        pencilContainer.style.display =
        lineWidthContainer.style.display = 'none';
}
