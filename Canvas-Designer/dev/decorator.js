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
    pdf: true,
    zoom: true,
    lineWidth: true,
    colorsPicker: true,
    extraOptions: true,
    code: true,
    undo: true
};

if (params.tools) {
    try {
        var t = JSON.parse(params.tools);
        tools = t;
    } catch (e) {}
}

if (tools.code === true) {
    document.querySelector('.preview-panel').style.display = 'block';
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

function setDefaultSelectedIcon() {
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
}

window.addEventListener('load', function() {
    setDefaultSelectedIcon();
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
            // pdfHandler.pdfPageContainer.style.display = 'none';

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
                selector.accept = 'image/*';
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
                            imageHandler.load(image.clientWidth, image.clientHeight);
                        };
                        image.style = 'position: absolute; top: -99999999999; left: -999999999;'
                        document.body.appendChild(image);
                        image.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                });
            }

            if (this.id === 'pdf-icon') {
                var selector = new FileSelector();
                selector.selectSingleFile(function(file) {
                    if (!file) return;

                    function onGettingPdf() {
                        var reader = new FileReader();
                        reader.onload = function(event) {
                            pdfHandler.pdf = null; // to make sure we call "getDocument" again
                            pdfHandler.load(event.target.result);
                        };
                        reader.readAsDataURL(file);
                    }
                    onGettingPdf();
                }, null, 'application/pdf');
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
    toolBox.style.height = (innerHeight) + 'px'; // -toolBox.offsetTop - 77

    function decorateDragLastPath() {
        var context = getContext('drag-last-path');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'DragLastPath');
        };
        image.src = data_uris.dragSingle;
    }

    decorateDragLastPath();

    if (tools.dragSingle === true) {
        document.getElementById('drag-last-path').style.display = 'block';
    }

    function decorateDragAllPaths() {
        var context = getContext('drag-all-paths');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'DragAllPaths');
        };
        image.src = data_uris.dragMultiple;
    }

    decorateDragAllPaths();

    if (tools.dragMultiple === true) {
        document.getElementById('drag-all-paths').style.display = 'block';
    }

    function decorateLine() {
        var context = getContext('line');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'Line');
        };
        image.src = data_uris.line;
    }

    if (tools.line === true) {
        decorateLine();
        document.getElementById('line').style.display = 'block';
    }

    function decorateUndo() {
        var context = getContext('undo');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);

            document.querySelector('#undo').onclick = function() {
                if (points.length) {
                    points.length = points.length - 1;
                    drawHelper.redraw();
                }

                // share to webrtc
                syncPoints(true);
            };
        };
        image.src = data_uris.undo;
    }

    if (tools.undo === true) {
        decorateUndo();
        document.getElementById('undo').style.display = 'block';
    }

    function decorateArrow() {
        var context = getContext('arrow');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'Arrow');
        };
        image.src = data_uris.arrow;
    }

    if (tools.arrow === true) {
        decorateArrow();
        document.getElementById('arrow').style.display = 'block';
    }

    function decoreZoomUp() {
        var context = getContext('zoom-up');
        // zoomHandler.icons.up(context);
        addEvent(context.canvas, 'click', function() {
            zoomHandler.up();
        });

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
        };
        image.src = data_uris.zoom_in;
    }

    function decoreZoomDown() {
        var context = getContext('zoom-down');
        // zoomHandler.icons.down(context);
        addEvent(context.canvas, 'click', function() {
            zoomHandler.down();
        });

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
        };
        image.src = data_uris.zoom_out;
    }

    if (tools.zoom === true) {
        decoreZoomUp();
        decoreZoomDown();

        document.getElementById('zoom-up').style.display = 'block';
        document.getElementById('zoom-down').style.display = 'block';
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

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'Pencil');
        };
        image.src = data_uris.pencil;

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
        document.getElementById('pencil-icon').style.display = 'block';
    }

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

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'Marker');
        };
        image.src = data_uris.marker;

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
        document.getElementById('marker-icon').style.display = 'block';
    }

    function decorateEraser() {
        var context = getContext('eraser-icon');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'Eraser');
        };
        image.src = data_uris.eraser;
    }

    if (tools.eraser === true) {
        decorateEraser();
        document.getElementById('eraser-icon').style.display = 'block';
    }

    function decorateText() {
        var context = getContext('text-icon');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'Text');
        };
        image.src = data_uris.text;
    }

    if (tools.text === true) {
        decorateText();
        document.getElementById('text-icon').style.display = 'block';
    }

    function decorateImage() {
        var context = getContext('image-icon');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'Image');
        };
        image.src = data_uris.image;
    }

    if (tools.image === true) {
        decorateImage();
        document.getElementById('image-icon').style.display = 'block';
    }


    function decoratePDF() {
        var context = getContext('pdf-icon');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'Pdf');
        };
        image.src = data_uris.pdf;
    }

    if (tools.pdf === true) {
        decoratePDF();
        document.getElementById('pdf-icon').style.display = 'block';
    }

    function decorateArc() {
        var context = getContext('arc');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'Arc');
        };
        image.src = data_uris.arc;
    }

    if (tools.arc === true) {
        decorateArc();
        document.getElementById('arc').style.display = 'block';
    }

    function decorateRect() {
        var context = getContext('rectangle');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'Rectangle');
        };
        image.src = data_uris.rectangle;
    }

    if (tools.rectangle === true) {
        decorateRect();
        document.getElementById('rectangle').style.display = 'block';
    }

    function decorateQuadratic() {
        var context = getContext('quadratic-curve');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'QuadraticCurve');
        };
        image.src = data_uris.quadratic;
    }

    if (tools.quadratic === true) {
        decorateQuadratic();
        document.getElementById('quadratic-curve').style.display = 'block';
    }

    function decorateBezier() {
        var context = getContext('bezier-curve');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
            bindEvent(context, 'Bezier');
        };
        image.src = data_uris.bezier;
    }

    if (tools.bezier === true) {
        decorateBezier();
        document.getElementById('bezier-curve').style.display = 'block';
    }

    function tempStrokeTheLine(context, width, mx, my, lx, ly) {
        context.beginPath();
        context.lineWidth = width;
        context.moveTo(mx, my);
        context.lineTo(lx, ly);
        context.stroke();
    }

    function decorateLineWidth() {
        var context = getContext('line-width');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
        };
        image.src = data_uris.lineWidth;

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

    if (tools.lineWidth === true) {
        decorateLineWidth();
        document.getElementById('line-width').style.display = 'block';
    }

    function decorateColors() {
        var context = getContext('colors');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
        };
        image.src = data_uris.colorsPicker;

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

    if (tools.colorsPicker === true) {
        decorateColors();
        document.getElementById('colors').style.display = 'block';
    }

    function decorateAdditionalOptions() {
        var context = getContext('additional');

        var image = new Image();
        image.onload = function() {
            context.drawImage(image, 4, 4, 32, 32);
        };
        image.src = data_uris.extraOptions;

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

    if (tools.extraOptions === true) {
        decorateAdditionalOptions();
        document.getElementById('additional').style.display = 'block';
    }

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

function setTemporaryLine() {
    var arr = ["line", [139, 261, 170, 219],
        [1, "rgba(0,0,0,0)", "rgba(0,0,0,0)", 1, "source-over", "round", "round", "15px \"Arial\""]
    ];
    points.push(arr);
    drawHelper.redraw();

    setTimeout(function() {
        setSelection(document.getElementById('line'), 'Line');
    }, 1000);

    setTimeout(setDefaultSelectedIcon, 2000);
}
