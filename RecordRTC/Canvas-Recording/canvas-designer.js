// Last time updated: 2017-07-03 1:56:26 PM UTC

// _______________
// Canvas-Designer

// https://github.com/muaz-khan/Canvas-Designer

'use strict';

(function() {

    var is = {
        isLine: false,
        isArrow: false,
        isArc: false,
        isDragLastPath: false,
        isDragAllPaths: false,
        isRectangle: false,
        isQuadraticCurve: false,
        isBezierCurve: false,
        isPencil: false,
        isMarker: true,
        isEraser: false,
        isText: false,
        isImage: false,

        set: function(shape) {
            var cache = this;

            cache.isLine = cache.isArrow = cache.isArc = cache.isDragLastPath = cache.isDragAllPaths = cache.isRectangle = cache.isQuadraticCurve = cache.isBezierCurve = cache.isPencil = cache.isMarker = cache.isEraser = cache.isText = cache.isImage = false;
            cache['is' + shape] = true;
        }
    };

    function addEvent(element, eventType, callback) {
        if (eventType.split(' ').length > 1) {
            var events = eventType.split(' ');
            for (var i = 0; i < events.length; i++) {
                addEvent(element, events[i], callback);
            }
            return;
        }

        if (element.addEventListener) {
            element.addEventListener(eventType, callback, !1);
            return true;
        } else if (element.attachEvent) {
            return element.attachEvent('on' + eventType, callback);
        } else {
            element['on' + eventType] = callback;
        }
        return this;
    }

    function find(selector) {
        return document.getElementById(selector);
    }

    var points = [],
        textarea = find('code-text'),
        lineWidth = 2,
        strokeStyle = '#6c96c8',
        fillStyle = 'white',
        globalAlpha = 1,
        globalCompositeOperation = 'source-over',
        lineCap = 'round',
        font = '15px "Arial"',
        lineJoin = 'round';

    function getContext(id) {
        var canv = find(id),
            ctx = canv.getContext('2d');

        canv.setAttribute('width', innerWidth);
        canv.setAttribute('height', innerHeight);

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        ctx.font = font;

        return ctx;
    }

    var context = getContext('main-canvas'),
        tempContext = getContext('temp-canvas');

    window.canvasElementToBeRecorded = context.canvas; // either use "tempContext.canvas" or "context.canvas"
    
    context._clearRect = context.clearRect;
    context.clearRect = function(x, y, width, height) {
        context._clearRect(0, 0, context.canvas.width, context.canvas.height);
        fillStyle = 'white';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height); // fill white background
    };

    var common = {
        updateTextArea: function() {
            var c = common,
                toFixed = c.toFixed,
                getPoint = c.getPoint,

                isAbsolutePoints = find('is-absolute-points').checked,
                isShortenCode = find('is-shorten-code').checked;

            if (isAbsolutePoints && isShortenCode) c.absoluteShortened();
            if (isAbsolutePoints && !isShortenCode) c.absoluteNOTShortened(toFixed);
            if (!isAbsolutePoints && isShortenCode) c.relativeShortened(toFixed, getPoint);
            if (!isAbsolutePoints && !isShortenCode) c.relativeNOTShortened(toFixed, getPoint);
        },
        toFixed: function(input) {
            return Number(input).toFixed(1);
        },
        getPoint: function(pointToCompare, compareWith, prefix) {
            if (pointToCompare > compareWith) pointToCompare = prefix + ' + ' + (pointToCompare - compareWith);
            else if (pointToCompare < compareWith) pointToCompare = prefix + ' - ' + (compareWith - pointToCompare);
            else pointToCompare = prefix;

            return pointToCompare;
        },
        absoluteShortened: function() {
            var output = '',
                length = points.length,
                i = 0,
                point;
            for (i; i < length; i++) {
                point = points[i];
                output += this.shortenHelper(point[0], point[1], point[2]);
            }

            output = output.substr(0, output.length - 2);
            textarea.value = 'var points = [' + output + '], length = points.length, point, p, i = 0;\n\n' + drawArrow.toString() + '\n\n' + this.forLoop;

            this.prevProps = null;
        },
        absoluteNOTShortened: function(toFixed) {
            var tempArray = [],
                i, point, p;

            for (i = 0; i < points.length; i++) {
                p = points[i];
                point = p[1];

                if (p[0] === 'pencil') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'marker') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'eraser') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'line') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'text') {
                    tempArray[i] = [this.strokeOrFill(p[2]) + '\ncontext.fillText(' + point[0] + ', ' + point[1] + ', ' + point[2] + ');'];
                }

                if (p[0] === 'arrow') {
                    tempArray[i] = ['drawArrow(' + point[0] + ', ' + point[1] + ', ' + point[2] + ', ' + point[3] + ', \'' + p[2].join('\',\'') + '\');'];
                }

                if (p[0] === 'arc') {
                    tempArray[i] = ['context.beginPath(); \n' + 'context.arc(' + toFixed(point[0]) + ',' + toFixed(point[1]) + ',' + toFixed(point[2]) + ',' + toFixed(point[3]) + ', 0,' + point[4] + '); \n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'rect') {
                    tempArray[i] = [this.strokeOrFill(p[2]) + '\n' + 'context.strokeRect(' + point[0] + ', ' + point[1] + ',' + point[2] + ',' + point[3] + ');\n' + 'context.fillRect(' + point[0] + ', ' + point[1] + ',' + point[2] + ',' + point[3] + ');'];
                }

                if (p[0] === 'quadratic') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.quadraticCurveTo(' + point[2] + ', ' + point[3] + ', ' + point[4] + ', ' + point[5] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'bezier') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.bezierCurveTo(' + point[2] + ', ' + point[3] + ', ' + point[4] + ', ' + point[5] + ', ' + point[6] + ', ' + point[7] + ');\n' + this.strokeOrFill(p[2])];
                }

            }
            textarea.value = tempArray.join('\n\n') + this.strokeFillText + '\n\n' + drawArrow.toString();

            this.prevProps = null;
        },
        relativeShortened: function(toFixed, getPoint) {
            var i = 0,
                point, p, length = points.length,
                output = '',
                x = 0,
                y = 0;

            for (i; i < length; i++) {
                p = points[i];
                point = p[1];

                if (i === 0) {
                    x = point[0];
                    y = point[1];
                }

                if (p[0] === 'text') {
                    x = point[1];
                    y = point[2];
                }

                if (p[0] === 'pencil') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'marker') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'eraser') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'line') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'arrow') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'text') {
                    output += this.shortenHelper(p[0], [
                        point[0],
                        getPoint(point[1], x, 'x'),
                        getPoint(point[2], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'arc') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        point[2],
                        point[3],
                        point[4]
                    ], p[2]);
                }

                if (p[0] === 'rect') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'quadratic') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y'),
                        getPoint(point[4], x, 'x'),
                        getPoint(point[5], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'bezier') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y'),
                        getPoint(point[4], x, 'x'),
                        getPoint(point[5], y, 'y'),
                        getPoint(point[6], x, 'x'),
                        getPoint(point[7], y, 'y')
                    ], p[2]);
                }
            }

            output = output.substr(0, output.length - 2);
            textarea.value = 'var x = ' + x + ', y = ' + y + ', points = [' + output + '], length = points.length, point, p, i = 0;\n\n' + drawArrow.toString() + '\n\n' + this.forLoop;

            this.prevProps = null;
        },
        relativeNOTShortened: function(toFixed, getPoint) {
            var i, point, p, length = points.length,
                output = '',
                x = 0,
                y = 0;

            for (i = 0; i < length; i++) {
                p = points[i];
                point = p[1];

                if (i === 0) {
                    x = point[0];
                    y = point[1];

                    if (p[0] === 'text') {
                        x = point[1];
                        y = point[2];
                    }

                    output = 'var x = ' + x + ', y = ' + y + ';\n\n';
                }

                if (p[0] === 'arc') {
                    output += 'context.beginPath();\n' + 'context.arc(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + point[2] + ', ' + point[3] + ', 0, ' + point[4] + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'pencil') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'marker') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'eraser') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'line') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'arrow') {
                    output += 'drawArrow(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', \'' + p[2].join('\',\'') + '\');\n';
                }

                if (p[0] === 'text') {
                    output += this.strokeOrFill(p[2]) + '\n' + 'context.fillText(' + point[0] + ', ' + getPoint(point[1], x, 'x') + ', ' + getPoint(point[2], y, 'y') + ');';
                }

                if (p[0] === 'rect') {
                    output += this.strokeOrFill(p[2]) + '\n' + 'context.strokeRect(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n' + 'context.fillRect(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');';
                }

                if (p[0] === 'quadratic') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.quadraticCurveTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', ' + getPoint(point[4], x, 'x') + ', ' + getPoint(point[5], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'bezier') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.bezierCurveTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', ' + getPoint(point[4], x, 'x') + ', ' + getPoint(point[5], y, 'y') + ', ' + getPoint(point[6], x, 'x') + ', ' + getPoint(point[7], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (i !== length - 1) output += '\n\n';
            }
            textarea.value = output + this.strokeFillText + '\n\n' + drawArrow.toString();

            this.prevProps = null;
        },
        forLoop: 'for(i; i < length; i++) {\n' + '    p = points[i];\n' + '    point = p[1];\n' + '    context.beginPath();\n\n'

            // globals
            +
            '    if(p[2]) { \n' + '\tcontext.lineWidth = p[2][0];\n' + '\tcontext.strokeStyle = p[2][1];\n' + '\tcontext.fillStyle = p[2][2];\n'

            +
            '\tcontext.globalAlpha = p[2][3];\n' + '\tcontext.globalCompositeOperation = p[2][4];\n' + '\tcontext.lineCap = p[2][5];\n' + '\tcontext.lineJoin = p[2][6];\n' + '\tcontext.font = p[2][7];\n' + '    }\n\n'

            // line

            +
            '    if(p[0] === "line") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'

            // arrow

            +
            '    if(p[0] === "arrow") { \n' + '\tdrawArrow(point[0], point[1], point[2], point[3], p[2]);\n' + '    }\n\n'

            // pencil

            +
            '    if(p[0] === "pencil") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'

            // marker

            +
            '    if(p[0] === "marker") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'


            // text

            +
            '    if(p[0] === "text") { \n' + '\tcontext.fillText(point[0], point[1], point[2]);\n' + '    }\n\n'

            // eraser

            +
            '    if(p[0] === "eraser") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'

            // arc

            +
            '    if(p[0] === "arc") context.arc(point[0], point[1], point[2], point[3], 0, point[4]); \n\n'

            // rect

            +
            '    if(p[0] === "rect") {\n' + '\tcontext.strokeRect(point[0], point[1], point[2], point[3]);\n' + '\tcontext.fillRect(point[0], point[1], point[2], point[3]);\n'

            +
            '    }\n\n'

            // quadratic

            +
            '    if(p[0] === "quadratic") {\n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.quadraticCurveTo(point[2], point[3], point[4], point[5]);\n' + '    }\n\n'

            // bezier

            +
            '    if(p[0] === "bezier") {\n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);\n' + '    }\n\n'

            // end-fill

            +
            '    context.stroke();\n' + '    context.fill();\n'

            +
            '}',

        strokeFillText: '\n\nfunction strokeOrFill(lineWidth, strokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin, font) { \n' + '    if(lineWidth) { \n' + '\tcontext.globalAlpha = globalAlpha;\n' + '\tcontext.globalCompositeOperation = globalCompositeOperation;\n' + '\tcontext.lineCap = lineCap;\n' + '\tcontext.lineJoin = lineJoin;\n'

            +
            '\tcontext.lineWidth = lineWidth;\n' + '\tcontext.strokeStyle = strokeStyle;\n' + '\tcontext.fillStyle = fillStyle;\n' + '\tcontext.font = font;\n' + '    } \n\n'

            +
            '    context.stroke();\n' + '    context.fill();\n'

            +
            '}',
        strokeOrFill: function(p) {
            if (!this.prevProps || this.prevProps !== p.join(',')) {
                this.prevProps = p.join(',');

                return 'strokeOrFill(\'' + p.join('\', \'') + '\');';
            }

            return 'strokeOrFill();';
        },
        prevProps: null,
        shortenHelper: function(name, p1, p2) {
            var result = '[\'' + name + '\', [' + p1.join(', ') + ']';

            if (!this.prevProps || this.prevProps !== p2.join(',')) {
                this.prevProps = p2.join(',');
                result += ', [\'' + p2.join('\', \'') + '\']';
            }

            return result + '], ';
        }
    };

    function drawArrow(mx, my, lx, ly, options) {
        function getOptions(opt) {
            opt = opt || {};

            return [
                opt.lineWidth || 2,
                opt.strokeStyle || '#6c96c8',
                opt.fillStyle || 'transparent',
                opt.globalAlpha || 1,
                opt.globalCompositeOperation || 'source-over',
                opt.lineCap || 'round',
                opt.lineJoin || 'round',
                opt.font || '15px "Arial"'
            ];
        }

        function handleOptions(opt, isNoFillStroke) {
            opt = opt || getOptions();

            context.globalAlpha = opt[3];
            context.globalCompositeOperation = opt[4];

            context.lineCap = opt[5];
            context.lineJoin = opt[6];
            context.lineWidth = opt[0];

            context.strokeStyle = opt[1];
            context.fillStyle = opt[2];

            context.font = opt[7];

            if (!isNoFillStroke) {
                context.stroke();
                context.fill();
            }
        }

        var arrowSize = 10;
        var angle = Math.atan2(ly - my, lx - mx);

        context.beginPath();
        context.moveTo(mx, my);
        context.lineTo(lx, ly);

        handleOptions();

        context.beginPath();
        context.moveTo(lx, ly);
        context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));
        context.lineTo(lx - arrowSize * Math.cos(angle + Math.PI / 7), ly - arrowSize * Math.sin(angle + Math.PI / 7));
        context.lineTo(lx, ly);
        context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));

        handleOptions();
    }

    function endLastPath() {
        var cache = is;

        if (cache.isArc) arcHandler.end();
        else if (cache.isQuadraticCurve) quadraticHandler.end();
        else if (cache.isBezierCurve) bezierHandler.end();

        drawHelper.redraw();

        if (textHandler.text && textHandler.text.length) {
            textHandler.appendPoints();
            textHandler.onShapeUnSelected();
        }
        textHandler.showOrHideTextTools('hide');
    }

    var copiedStuff = [],
        isControlKeyPressed;

    function copy() {
        endLastPath();

        dragHelper.global.startingIndex = 0;

        if (find('copy-last').checked) {
            copiedStuff = points[points.length - 1];
            setSelection(find('drag-last-path'), 'DragLastPath');
        } else {
            copiedStuff = points;
            setSelection(find('drag-all-paths'), 'DragAllPaths');
        }
    }

    function paste() {
        endLastPath();

        dragHelper.global.startingIndex = 0;

        if (find('copy-last').checked) {
            points[points.length] = copiedStuff;

            dragHelper.global = {
                prevX: 0,
                prevY: 0,
                startingIndex: points.length - 1
            };

            dragHelper.dragAllPaths(0, 0);
            setSelection(find('drag-last-path'), 'DragLastPath');
        } else {

            dragHelper.global.startingIndex = points.length;
            points = points.concat(copiedStuff);
            setSelection(find('drag-all-paths'), 'DragAllPaths');
        }
    }

    // marker + pencil
    function hexToR(h) {
        return parseInt((cutHex(h)).substring(0, 2), 16)
    }

    function hexToG(h) {
        return parseInt((cutHex(h)).substring(2, 4), 16)
    }

    function hexToB(h) {
        return parseInt((cutHex(h)).substring(4, 6), 16)
    }

    function cutHex(h) {
        return (h.charAt(0) == "#") ? h.substring(1, 7) : h
    }

    function clone(obj) {
        if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
            return obj;

        if (obj instanceof Date)
            var temp = new obj.constructor(); //or new Date(obj);
        else
            var temp = obj.constructor();

        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                obj['isActiveClone'] = null;
                temp[key] = clone(obj[key]);
                delete obj['isActiveClone'];
            }
        }

        return temp;
    }

    function hexToRGB(h) {
        return [
            hexToR(h),
            hexToG(h),
            hexToB(h)
        ]
    }

    var drawHelper = {
        redraw: function() {
            tempContext.clearRect(0, 0, innerWidth, innerHeight);
            context.clearRect(0, 0, innerWidth, innerHeight);

            var i, point, length = points.length;
            for (i = 0; i < length; i++) {
                point = points[i];
                if (point && point.length && this[point[0]]) {
                    this[point[0]](context, point[1], point[2]);
                }
                // else warn
            }
        },
        getOptions: function(opt) {
            opt = opt || {};
            return [
                opt.lineWidth || lineWidth,
                opt.strokeStyle || strokeStyle,
                opt.fillStyle || fillStyle,
                opt.globalAlpha || globalAlpha,
                opt.globalCompositeOperation || globalCompositeOperation,
                opt.lineCap || lineCap,
                opt.lineJoin || lineJoin,
                opt.font || font
            ];
        },
        handleOptions: function(context, opt, isNoFillStroke) {
            opt = opt || this.getOptions();

            context.globalAlpha = opt[3];
            context.globalCompositeOperation = opt[4];

            context.lineCap = opt[5];
            context.lineJoin = opt[6];
            context.lineWidth = opt[0];

            context.strokeStyle = opt[1];
            context.fillStyle = opt[2];

            context.font = opt[7];

            if (!isNoFillStroke) {
                context.stroke();
                context.fill();
            }
        },
        line: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.lineTo(point[2], point[3]);

            this.handleOptions(context, options);
        },
        marker: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.lineTo(point[2], point[3]);

            this.handleOptions(context, options);
        },
        arrow: function(context, point, options) {
            var mx = point[0];
            var my = point[1];

            var lx = point[2];
            var ly = point[3];

            var arrowSize = arrowHandler.arrowSize;

            if (arrowSize == 10) {
                arrowSize = (options ? options[0] : lineWidth) * 5;
            }

            var angle = Math.atan2(ly - my, lx - mx);

            context.beginPath();
            context.moveTo(mx, my);
            context.lineTo(lx, ly);

            this.handleOptions(context, options);

            context.beginPath();
            context.moveTo(lx, ly);
            context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));
            context.lineTo(lx - arrowSize * Math.cos(angle + Math.PI / 7), ly - arrowSize * Math.sin(angle + Math.PI / 7));
            context.lineTo(lx, ly);
            context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));

            this.handleOptions(context, options);
        },
        text: function(context, point, options) {
            this.handleOptions(context, options);
            context.fillStyle = textHandler.getFillColor(options[2]);
            context.fillText(point[0].substr(1, point[0].length - 2), point[1], point[2]);
        },
        arc: function(context, point, options) {
            context.beginPath();
            context.arc(point[0], point[1], point[2], point[3], 0, point[4]);

            this.handleOptions(context, options);
        },
        rect: function(context, point, options) {
            this.handleOptions(context, options, true);

            context.strokeRect(point[0], point[1], point[2], point[3]);
            context.fillRect(point[0], point[1], point[2], point[3]);
        },
        image: function(context, point, options) {
            this.handleOptions(context, options, true);

            var image = imageHandler.images[point[5]];
            if (!image) {
                var image = new Image();
                image.onload = function() {
                    var index = imageHandler.images.length;

                    imageHandler.lastImageURL = image.src;
                    imageHandler.lastImageIndex = index;

                    imageHandler.images.push(image);
                    context.drawImage(image, point[1], point[2], point[3], point[4]);
                };
                image.src = point[0];
                return;
            }

            context.drawImage(image, point[1], point[2], point[3], point[4]);
        },
        quadratic: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.quadraticCurveTo(point[2], point[3], point[4], point[5]);

            this.handleOptions(context, options);
        },
        bezier: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);

            this.handleOptions(context, options);
        }
    };

    var dragHelper = {
        global: {
            prevX: 0,
            prevY: 0,
            ismousedown: false,
            pointsToMove: 'all',
            startingIndex: 0
        },
        mousedown: function(e) {
            if (isControlKeyPressed) {
                copy();
                paste();
                isControlKeyPressed = false;
            }

            var dHelper = dragHelper,
                g = dHelper.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            g.prevX = x;
            g.prevY = y;

            g.pointsToMove = 'all';

            if (points.length) {
                var p = points[points.length - 1],
                    point = p[1];

                if (p[0] === 'line') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'head';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = 'tail';
                    }
                }

                if (p[0] === 'arrow') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'head';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = 'tail';
                    }
                }

                if (p[0] === 'rect') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'stretch-first';
                    }

                    if (dHelper.isPointInPath(x, y, point[0] + point[2], point[1])) {
                        g.pointsToMove = 'stretch-second';
                    }

                    if (dHelper.isPointInPath(x, y, point[0], point[1] + point[3])) {
                        g.pointsToMove = 'stretch-third';
                    }

                    if (dHelper.isPointInPath(x, y, point[0] + point[2], point[1] + point[3])) {
                        g.pointsToMove = 'stretch-last';
                    }
                }

                if (p[0] === 'image') {

                    if (dHelper.isPointInPath(x, y, point[1], point[2])) {
                        g.pointsToMove = 'stretch-first';
                    }

                    if (dHelper.isPointInPath(x, y, point[1] + point[3], point[2])) {
                        g.pointsToMove = 'stretch-second';
                    }

                    if (dHelper.isPointInPath(x, y, point[1], point[2] + point[4])) {
                        g.pointsToMove = 'stretch-third';
                    }

                    if (dHelper.isPointInPath(x, y, point[1] + point[3], point[2] + point[4])) {
                        g.pointsToMove = 'stretch-last';
                    }
                }

                if (p[0] === 'quadratic') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'starting-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = 'control-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[4], point[5])) {
                        g.pointsToMove = 'ending-points';
                    }
                }

                if (p[0] === 'bezier') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'starting-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = '1st-control-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[4], point[5])) {
                        g.pointsToMove = '2nd-control-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[6], point[7])) {
                        g.pointsToMove = 'ending-points';
                    }
                }
            }

            g.ismousedown = true;
        },
        mouseup: function() {
            var g = this.global;

            if (is.isDragLastPath) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);
                context.clearRect(0, 0, innerWidth, innerHeight);
                this.end();
            }

            g.ismousedown = false;
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop,
                g = this.global;

            drawHelper.redraw();

            if (g.ismousedown) {
                this.dragShape(x, y);
            }

            if (is.isDragLastPath) this.init();
        },
        init: function() {
            if (!points.length) return;

            var p = points[points.length - 1],
                point = p[1],
                g = this.global;

            if (g.ismousedown) tempContext.fillStyle = 'rgba(255,85 ,154,.9)';
            else tempContext.fillStyle = 'rgba(255,85 ,154,.4)';

            if (p[0] === 'quadratic') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[4], point[5], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'bezier') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[4], point[5], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[6], point[7], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'line') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'arrow') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'text') {
                tempContext.font = "15px Verdana";
                tempContext.fillText(point[0], point[1], point[2]);
            }

            if (p[0] === 'rect') {

                tempContext.beginPath();
                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[0] + point[2], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[0], point[1] + point[3], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[0] + point[2], point[1] + point[3], 10, Math.PI * 2, 0, !1);
                tempContext.fill();
            }

            if (p[0] === 'image') {
                tempContext.beginPath();
                tempContext.arc(point[1], point[2], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1] + point[3], point[2], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1], point[2] + point[4], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1] + point[3], point[2] + point[4], 10, Math.PI * 2, 0, !1);
                tempContext.fill();
            }
        },
        isPointInPath: function(x, y, first, second) {
            return x > first - 10 && x < first + 10 && y > second - 10 && y < second + 10;
        },
        getPoint: function(point, prev, otherPoint) {
            if (point > prev) {
                point = otherPoint + (point - prev);
            } else {
                point = otherPoint - (prev - point);
            }

            return point;
        },
        getXYWidthHeight: function(x, y, prevX, prevY, oldPoints) {
            if (oldPoints.pointsToMove == 'stretch-first') {
                if (x > prevX) {
                    oldPoints.x = oldPoints.x + (x - prevX);
                    oldPoints.width = oldPoints.width - (x - prevX);
                } else {
                    oldPoints.x = oldPoints.x - (prevX - x);
                    oldPoints.width = oldPoints.width + (prevX - x);
                }

                if (y > prevY) {
                    oldPoints.y = oldPoints.y + (y - prevY);
                    oldPoints.height = oldPoints.height - (y - prevY);
                } else {
                    oldPoints.y = oldPoints.y - (prevY - y);
                    oldPoints.height = oldPoints.height + (prevY - y);
                }
            }

            if (oldPoints.pointsToMove == 'stretch-second') {
                if (x > prevX) {
                    oldPoints.width = oldPoints.width + (x - prevX);
                } else {
                    oldPoints.width = oldPoints.width - (prevX - x);
                }

                if (y < prevY) {
                    oldPoints.y = oldPoints.y + (y - prevY);
                    oldPoints.height = oldPoints.height - (y - prevY);
                } else {
                    oldPoints.y = oldPoints.y - (prevY - y);
                    oldPoints.height = oldPoints.height + (prevY - y);
                }
            }

            if (oldPoints.pointsToMove == 'stretch-third') {
                if (x > prevX) {
                    oldPoints.x = oldPoints.x + (x - prevX);
                    oldPoints.width = oldPoints.width - (x - prevX);
                } else {
                    oldPoints.x = oldPoints.x - (prevX - x);
                    oldPoints.width = oldPoints.width + (prevX - x);
                }

                if (y < prevY) {
                    oldPoints.height = oldPoints.height + (y - prevY);
                } else {
                    oldPoints.height = oldPoints.height - (prevY - y);
                }
            }

            return oldPoints;
        },
        dragShape: function(x, y) {
            if (!this.global.ismousedown) return;

            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            if (is.isDragLastPath) {
                this.dragLastPath(x, y);
            }

            if (is.isDragAllPaths) {
                this.dragAllPaths(x, y);
            }

            var g = this.global;

            g.prevX = x;
            g.prevY = y;
        },
        end: function() {
            if (!points.length) return;

            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            var point = points[points.length - 1];
            drawHelper[point[0]](context, point[1], point[2]);
        },
        dragAllPaths: function(x, y) {
            var g = this.global,
                prevX = g.prevX,
                prevY = g.prevY,
                p, point,
                length = points.length,
                getPoint = this.getPoint,
                i = g.startingIndex;

            for (i; i < length; i++) {
                p = points[i];
                point = p[1];

                if (p[0] === 'line') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3])
                        ], p[2]
                    ];
                }

                if (p[0] === 'arrow') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3])
                        ], p[2]
                    ];
                }

                if (p[0] === 'text') {
                    points[i] = [p[0],
                        [
                            point[0],
                            getPoint(x, prevX, point[1]),
                            getPoint(y, prevY, point[2])
                        ], p[2]
                    ];
                }

                if (p[0] === 'arc') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            point[2],
                            point[3],
                            point[4]
                        ], p[2]
                    ];
                }

                if (p[0] === 'rect') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            point[2],
                            point[3]
                        ], p[2]
                    ];
                }

                if (p[0] === 'image') {
                    points[i] = [p[0],
                        [
                            point[0],
                            getPoint(x, prevX, point[1]),
                            getPoint(y, prevY, point[2]),
                            point[3],
                            point[4],
                            point[5]
                        ], p[2]
                    ];
                }

                if (p[0] === 'quadratic') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3]),
                            getPoint(x, prevX, point[4]),
                            getPoint(y, prevY, point[5])
                        ], p[2]
                    ];
                }

                if (p[0] === 'bezier') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3]),
                            getPoint(x, prevX, point[4]),
                            getPoint(y, prevY, point[5]),
                            getPoint(x, prevX, point[6]),
                            getPoint(y, prevY, point[7])
                        ], p[2]
                    ];
                }
            }
        },
        dragLastPath: function(x, y) {
            var g = this.global,
                prevX = g.prevX,
                prevY = g.prevY,
                p = points[points.length - 1],
                point = p[1],
                getPoint = this.getPoint,
                getXYWidthHeight = this.getXYWidthHeight,
                isMoveAllPoints = g.pointsToMove === 'all';

            if (p[0] === 'line') {

                if (g.pointsToMove === 'head' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'tail' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'arrow') {

                if (g.pointsToMove === 'head' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'tail' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'text') {

                if (g.pointsToMove === 'head' || isMoveAllPoints) {
                    point[1] = getPoint(x, prevX, point[1]);
                    point[2] = getPoint(y, prevY, point[2]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'arc') {
                point[0] = getPoint(x, prevX, point[0]);
                point[1] = getPoint(y, prevY, point[1]);

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'rect') {

                if (isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'stretch-first') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[0],
                        y: point[1],
                        width: point[2],
                        height: point[3],
                        pointsToMove: g.pointsToMove
                    });

                    point[0] = newPoints.x;
                    point[1] = newPoints.y;
                    point[2] = newPoints.width;
                    point[3] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-second') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[0],
                        y: point[1],
                        width: point[2],
                        height: point[3],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.y;
                    point[2] = newPoints.width;
                    point[3] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-third') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[0],
                        y: point[1],
                        width: point[2],
                        height: point[3],
                        pointsToMove: g.pointsToMove
                    });

                    point[0] = newPoints.x;
                    point[2] = newPoints.width;
                    point[3] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-last') {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'image') {

                if (isMoveAllPoints) {
                    point[1] = getPoint(x, prevX, point[1]);
                    point[2] = getPoint(y, prevY, point[2]);
                }

                if (g.pointsToMove === 'stretch-first') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.x;
                    point[2] = newPoints.y;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-second') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[2] = newPoints.y;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-third') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.x;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-last') {
                    point[3] = getPoint(x, prevX, point[3]);
                    point[4] = getPoint(y, prevY, point[4]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'quadratic') {

                if (g.pointsToMove === 'starting-points' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'control-points' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                if (g.pointsToMove === 'ending-points' || isMoveAllPoints) {
                    point[4] = getPoint(x, prevX, point[4]);
                    point[5] = getPoint(y, prevY, point[5]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'bezier') {

                if (g.pointsToMove === 'starting-points' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === '1st-control-points' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                if (g.pointsToMove === '2nd-control-points' || isMoveAllPoints) {
                    point[4] = getPoint(x, prevX, point[4]);
                    point[5] = getPoint(y, prevY, point[5]);
                }

                if (g.pointsToMove === 'ending-points' || isMoveAllPoints) {
                    point[6] = getPoint(x, prevX, point[6]);
                    point[7] = getPoint(y, prevY, point[7]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }
        }
    };

    var pencilHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;

            // make sure that pencil is drawing shapes even 
            // if mouse is down but mouse isn't moving
            tempContext.lineCap = 'round';
            pencilDrawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['line', [t.prevX, t.prevY, x, y], pencilDrawHelper.getOptions()];

            t.prevX = x;
            t.prevY = y;
        },
        mouseup: function(e) {
            this.ismousedown = false;
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
                pencilDrawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

                points[points.length] = ['line', [t.prevX, t.prevY, x, y], pencilDrawHelper.getOptions()];

                t.prevX = x;
                t.prevY = y;
            }
        }
    }

    var pencilLineWidth = document.getElementById('pencil-stroke-style').value,
        pencilStrokeStyle = '#' + document.getElementById('pencil-fill-style').value;

    var pencilDrawHelper = clone(drawHelper);

    pencilDrawHelper.getOptions = function() {
        return [pencilLineWidth, pencilStrokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin, font];
    }

    var markerHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;

            // make sure that pencil is drawing shapes even 
            // if mouse is down but mouse isn't moving
            tempContext.lineCap = 'round';
            markerDrawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['line', [t.prevX, t.prevY, x, y], markerDrawHelper.getOptions()];

            t.prevX = x;
            t.prevY = y;
        },
        mouseup: function(e) {
            this.ismousedown = false;
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
                markerDrawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

                points[points.length] = ['line', [t.prevX, t.prevY, x, y], markerDrawHelper.getOptions()];

                t.prevX = x;
                t.prevY = y;
            }
        }
    }

    var markerLineWidth = document.getElementById('marker-stroke-style').value,
        markerStrokeStyle = '#' + document.getElementById('marker-fill-style').value,
        markerGlobalAlpha = 0.7;

    var markerDrawHelper = clone(drawHelper);

    markerDrawHelper.getOptions = function() {
        return [markerLineWidth, markerStrokeStyle, fillStyle, markerGlobalAlpha, globalCompositeOperation, lineCap, lineJoin, font];
    }

    var eraserHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;

            tempContext.lineCap = 'round';
            drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

            t.prevX = x;
            t.prevY = y;
        },
        mouseup: function(e) {
            this.ismousedown = false;
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
                drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

                points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

                t.prevX = x;
                t.prevY = y;
            }
        }
    };

    var textHandler = {
        text: '',
        selectedFontFamily: 'Arial',
        selectedFontSize: '15',
        onShapeSelected: function() {
            tempContext.canvas.style.cursor = 'text';
            this.x = this.y = this.pageX = this.pageY = 0;
            this.text = '';
        },
        onShapeUnSelected: function() {
            this.text = '';
            this.showOrHideTextTools('hide');
            tempContext.canvas.style.cursor = 'default';

            if (typeof this.blinkCursorInterval !== 'undefined') {
                clearInterval(this.blinkCursorInterval);
            }
        },
        getFillColor: function(color) {
            color = (color || fillStyle).toLowerCase();

            if (color == 'rgba(255, 255, 255, 0)' || color == 'transparent' || color === 'white') {
                return 'black';
            }

            return color;
        },
        writeText: function(keyPressed, isBackKeyPressed) {
            if (!is.isText) return;

            if (isBackKeyPressed) {
                textHandler.text = textHandler.text.substr(0, textHandler.text.length - 1);
                textHandler.fillText(textHandler.text);
                return;
            }

            textHandler.text += keyPressed;
            textHandler.fillText(textHandler.text);
        },
        fillText: function(text) {
            if (!is.isText) return;

            tempContext.clearRect(0, 0, tempContext.canvas.width, tempContext.canvas.height);

            var options = textHandler.getOptions();
            drawHelper.handleOptions(tempContext, options);
            tempContext.fillStyle = textHandler.getFillColor(options[2]);
            tempContext.font = textHandler.selectedFontSize + 'px "' + textHandler.selectedFontFamily + '"';

            tempContext.fillText(text, textHandler.x, textHandler.y);
        },
        blinkCursorInterval: null,
        index: 0,
        blinkCursor: function() {
            textHandler.index++;
            if (textHandler.index % 2 == 0) {
                textHandler.fillText(textHandler.text + '|');
            } else {
                textHandler.fillText(textHandler.text);
            }
        },
        getOptions: function() {
            var options = {
                font: textHandler.selectedFontSize + 'px "' + textHandler.selectedFontFamily + '"',
                fillStyle: textHandler.getFillColor(),
                strokeStyle: '#6c96c8',
                globalCompositeOperation: 'source-over',
                globalAlpha: 1,
                lineJoin: 'round',
                lineCap: 'round',
                lineWidth: 2
            };
            font = options.font;
            return options;
        },
        appendPoints: function() {
            var options = textHandler.getOptions();
            points[points.length] = ['text', ['"' + textHandler.text + '"', textHandler.x, textHandler.y], drawHelper.getOptions(options)];
        },
        mousedown: function(e) {
            if (!is.isText) return;

            if (textHandler.text.length) {
                this.appendPoints();
            }

            textHandler.x = textHandler.y = 0;
            textHandler.text = '';

            textHandler.pageX = e.pageX;
            textHandler.pageY = e.pageY;

            textHandler.x = e.pageX - canvas.offsetLeft - 5;
            textHandler.y = e.pageY - canvas.offsetTop + 10;

            if (typeof textHandler.blinkCursorInterval !== 'undefined') {
                clearInterval(textHandler.blinkCursorInterval);
            }

            textHandler.blinkCursor();
            textHandler.blinkCursorInterval = setInterval(textHandler.blinkCursor, 700);

            this.showTextTools();
        },
        mouseup: function(e) {},
        mousemove: function(e) {},
        showOrHideTextTools: function(show) {
            this.fontFamilyBox.style.display = show == 'show' ? 'block' : 'none';
            this.fontSizeBox.style.display = show == 'show' ? 'block' : 'none';

            this.fontSizeBox.style.left = this.x + 'px';
            this.fontFamilyBox.style.left = (this.fontSizeBox.clientWidth + this.x) + 'px';

            this.fontSizeBox.style.top = this.y + 'px';
            this.fontFamilyBox.style.top = this.y + 'px';
        },
        showTextTools: function() {
            if (!this.fontFamilyBox || !this.fontSizeBox) return;

            this.unselectAllFontFamilies();
            this.unselectAllFontSizes();

            this.showOrHideTextTools('show');

            this.eachFontFamily(function(child) {
                child.onclick = function(e) {
                    e.preventDefault();

                    textHandler.showOrHideTextTools('hide');

                    textHandler.selectedFontFamily = this.innerHTML;
                    this.className = 'font-family-selected';
                };
                child.style.fontFamily = child.innerHTML;
            });

            this.eachFontSize(function(child) {
                child.onclick = function(e) {
                    e.preventDefault();

                    textHandler.showOrHideTextTools('hide');

                    textHandler.selectedFontSize = this.innerHTML;
                    this.className = 'font-family-selected';
                };
                // child.style.fontSize = child.innerHTML + 'px';
            });
        },
        eachFontFamily: function(callback) {
            var childs = this.fontFamilyBox.querySelectorAll('li');
            for (var i = 0; i < childs.length; i++) {
                callback(childs[i]);
            }
        },
        unselectAllFontFamilies: function() {
            this.eachFontFamily(function(child) {
                child.className = '';
                if (child.innerHTML === textHandler.selectedFontFamily) {
                    child.className = 'font-family-selected';
                }
            });
        },
        eachFontSize: function(callback) {
            var childs = this.fontSizeBox.querySelectorAll('li');
            for (var i = 0; i < childs.length; i++) {
                callback(childs[i]);
            }
        },
        unselectAllFontSizes: function() {
            this.eachFontSize(function(child) {
                child.className = '';
                if (child.innerHTML === textHandler.selectedFontSize) {
                    child.className = 'font-size-selected';
                }
            });
        },
        onReturnKeyPressed: function() {
            if (!textHandler.text || !textHandler.text.length) return;
            var fontSize = parseInt(textHandler.selectedFontSize) || 15;
            this.mousedown({
                pageX: this.pageX,
                // pageY: parseInt(tempContext.measureText(textHandler.text).height * 2) + 10
                pageY: this.pageY + fontSize + 5
            });
            drawHelper.redraw();
        },
        fontFamilyBox: document.querySelector('.fontSelectUl'),
        fontSizeBox: document.querySelector('.fontSizeUl')
    };

    var arcHandler = {
        global: {
            ismousedown: false,
            prevX: 0,
            prevY: 0,
            prevRadius: 0,
            isCircleDrawn: false,
            isCircledEnded: true,
            isClockwise: false,
            arcRangeContainer: null,
            arcRange: null
        },
        mousedown: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            g.prevX = x;
            g.prevY = y;

            g.ismousedown = true;
        },
        mouseup: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (g.ismousedown) {
                if (!g.isCircleDrawn && g.isCircledEnded) {
                    var prevX = g.prevX,
                        prevY = g.prevY,
                        radius = ((x - prevX) + (y - prevY)) / 3;

                    g.prevRadius = radius;
                    g.isCircleDrawn = true;
                    g.isCircleEnded = false;

                    var c = (2 * Math.PI * radius) / 21,
                        angle,
                        xx = prevX > x ? prevX - x : x - prevX,
                        yy = prevY > y ? prevY - y : y - prevY;

                    angle = (xx + yy) / (2 * c);
                    points[points.length] = ['arc', [prevX + radius, prevY + radius, radius, angle, 1], drawHelper.getOptions()];

                    var arcRange = g.arcRange,
                        arcRangeContainer = g.arcRangeContainer;

                    arcRangeContainer.style.display = 'block';
                    arcRange.focus();

                    arcRangeContainer.style.top = (y + canvas.offsetTop + 20) + 'px';
                    arcRangeContainer.style.left = x + 'px';

                    arcRange.value = 2;
                } else if (g.isCircleDrawn && !g.isCircleEnded) {
                    this.end();
                }
            }

            g.ismousedown = false;

            this.fixAllPoints();
        },
        mousemove: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var ismousedown = g.ismousedown,
                isCircleDrawn = g.isCircleDrawn,
                isCircleEnded = g.isCircledEnded;

            if (ismousedown) {
                if (!isCircleDrawn && isCircleEnded) {
                    var prevX = g.prevX,
                        prevY = g.prevY,
                        radius = ((x - prevX) + (y - prevY)) / 3;

                    tempContext.clearRect(0, 0, 2000, 2000);

                    drawHelper.arc(tempContext, [prevX + radius, prevY + radius, radius, Math.PI * 2, true]);
                }
            }
        },
        fixAllPoints: function() {
            var toFixed = this.toFixed;

            for (var i = 0; i < points.length; i++) {
                var p = points[i],
                    point;
                if (p[0] === 'arc') {
                    point = p[1];
                    points[i] = ['arc', [toFixed(point[0]), toFixed(point[1]), toFixed(point[2]), toFixed(point[3]), point[4]],
                        p[2]
                    ];
                }
            }
        },
        init: function() {
            var markIsClockwise = find('is-clockwise'),
                g = this.global;

            g.arcRangeContainer = find('arc-range-container');
            g.arcRange = find('arc-range');

            addEvent(markIsClockwise, 'change', function(e) {
                g.isClockwise = markIsClockwise.checked;

                g.arcRange.value = arcHandler.toFixed(g.arcRange.value);
                g.arcRange.focus();

                arcHandler.arcRangeHandler(e);

                if (!points.length) return;

                var p = points[points.length - 1],
                    point = p[1];

                tempContext.clearRect(0, 0, innerWidth, innerHeight);
                drawHelper.arc(tempContext, [point[0], point[1], point[2], point[3], point[4]]);
            });

            var arcRange = g.arcRange;
            addEvent(arcRange, 'keydown', this.arcRangeHandler);
            addEvent(arcRange, 'focus', this.arcRangeHandler);
        },
        arcRangeHandler: function(e) {
            var g = arcHandler.global,
                arcRange = g.arcRange;

            var key = e.keyCode,
                value = +arcRange.value;
            if (key == 39 || key == 40) arcRange.value = (value < 2 ? value : 1.98) + .02;
            if (key == 37 || key == 38) arcRange.value = (value > 0 ? value : .02) - .02;

            if (!key || key == 13 || key == 39 || key == 40 || key == 37 || key == 38) {
                var range = Math.PI * arcHandler.toFixed(value);
                var p = points[points.length - 1];

                if (p[0] === 'arc') {
                    var point = p[1];
                    points[points.length - 1] = ['arc', [point[0], point[1], point[2], range, g.isClockwise ? 1 : 0],
                        p[2]
                    ];

                    drawHelper.redraw();
                }
            }
        },
        toFixed: function(input) {
            return Number(input).toFixed(1);
        },
        end: function() {
            var g = this.global;

            g.arcRangeContainer.style.display = 'none';
            g.arcRange.value = 2;

            g.isCircleDrawn = false;
            g.isCircleEnded = true;

            drawHelper.redraw();
        }
    };

    arcHandler.init();

    var lineHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

                t.ismousedown = false;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);

                drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);
            }
        }
    };

    var arrowHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        arrowSize: 10,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['arrow', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

                t.ismousedown = false;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);

                drawHelper.arrow(tempContext, [t.prevX, t.prevY, x, y]);
            }
        }
    };

    var rectHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['rect', [t.prevX, t.prevY, x - t.prevX, y - t.prevY], drawHelper.getOptions()];

                t.ismousedown = false;
            }

        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);

                drawHelper.rect(tempContext, [t.prevX, t.prevY, x - t.prevX, y - t.prevY]);
            }
        }
    };

    var quadraticHandler = {
        global: {
            ismousedown: false,
            prevX: 0,
            prevY: 0,
            controlPointX: 0,
            controlPointY: 0,
            isFirstStep: true,
            isLastStep: false
        },
        mousedown: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (!g.isLastStep) {
                g.prevX = x;
                g.prevY = y;
            }

            g.ismousedown = true;

            if (g.isLastStep && g.ismousedown) {
                this.end(x, y);
            }
        },
        mouseup: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (g.ismousedown && g.isFirstStep) {
                g.controlPointX = x;
                g.controlPointY = y;

                g.isFirstStep = false;
                g.isLastStep = true;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var g = this.global;

            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            if (g.ismousedown && g.isFirstStep) {
                drawHelper.quadratic(tempContext, [g.prevX, g.prevY, x, y, x, y]);
            }

            if (g.isLastStep) {
                drawHelper.quadratic(tempContext, [g.prevX, g.prevY, g.controlPointX, g.controlPointY, x, y]);
            }
        },
        end: function(x, y) {
            var g = this.global;

            if (!g.ismousedown) return;

            g.isLastStep = false;

            g.isFirstStep = true;
            g.ismousedown = false;

            x = x || g.controlPointX || g.prevX;
            y = y || g.controlPointY || g.prevY;

            points[points.length] = ['quadratic', [g.prevX, g.prevY, g.controlPointX, g.controlPointY, x, y], drawHelper.getOptions()];
        }
    };

    var bezierHandler = {
        global: {
            ismousedown: false,
            prevX: 0,
            prevY: 0,

            firstControlPointX: 0,
            firstControlPointY: 0,
            secondControlPointX: 0,
            secondControlPointY: 0,

            isFirstStep: true,
            isSecondStep: false,
            isLastStep: false
        },
        mousedown: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (!g.isLastStep && !g.isSecondStep) {
                g.prevX = x;
                g.prevY = y;
            }

            g.ismousedown = true;

            if (g.isLastStep && g.ismousedown) {
                this.end(x, y);
            }

            if (g.ismousedown && g.isSecondStep) {
                g.secondControlPointX = x;
                g.secondControlPointY = y;

                g.isSecondStep = false;
                g.isLastStep = true;
            }
        },
        mouseup: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (g.ismousedown && g.isFirstStep) {
                g.firstControlPointX = x;
                g.firstControlPointY = y;

                g.isFirstStep = false;
                g.isSecondStep = true;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var g = this.global;

            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            if (g.ismousedown && g.isFirstStep) {
                drawHelper.bezier(tempContext, [g.prevX, g.prevY, x, y, x, y, x, y]);
            }

            if (g.ismousedown && g.isSecondStep) {
                drawHelper.bezier(tempContext, [g.prevX, g.prevY, g.firstControlPointX, g.firstControlPointY, x, y, x, y]);
            }

            if (g.isLastStep) {
                drawHelper.bezier(tempContext, [g.prevX, g.prevY, g.firstControlPointX, g.firstControlPointY, g.secondControlPointX, g.secondControlPointY, x, y]);
            }
        },
        end: function(x, y) {
            var g = this.global;

            if (!g.ismousedown) return;

            g.isLastStep = g.isSecondStep = false;

            g.isFirstStep = true;
            g.ismousedown = false;

            g.secondControlPointX = g.secondControlPointX || g.firstControlPointX;
            g.secondControlPointY = g.secondControlPointY || g.firstControlPointY;

            x = x || g.secondControlPointX;
            y = y || g.secondControlPointY;

            points[points.length] = ['bezier', [g.prevX, g.prevY, g.firstControlPointX, g.firstControlPointY, g.secondControlPointX, g.secondControlPointY, x, y], drawHelper.getOptions()];
        }
    };

    var zoomHandler = {
        scale: 1.0,
        up: function(e) {
            this.scale += .01;
            this.apply();
        },
        down: function(e) {
            this.scale -= .01;
            this.apply();
        },
        apply: function() {
            tempContext.scale(this.scale, this.scale);
            context.scale(this.scale, this.scale);
            drawHelper.redraw();
        },
        icons: {
            up: function(ctx) {
                ctx.font = '22px Verdana';
                ctx.strokeText('+', 10, 30);
            },
            down: function(ctx) {
                ctx.font = '22px Verdana';
                ctx.strokeText('-', 15, 30);
            }
        }
    };

    var FileSelector = function() {
        var selector = this;

        selector.selectSingleFile = selectFile;
        selector.selectMultipleFiles = function(callback) {
            selectFile(callback, true);
        };

        function selectFile(callback, multiple) {
            var file = document.createElement('input');
            file.type = 'file';

            if (multiple) {
                file.multiple = true;
            }

            file.accept = 'image/*';

            file.onchange = function() {
                if (multiple) {
                    if (!file.files.length) {
                        console.error('No file selected.');
                        return;
                    }
                    callback(file.files);
                    return;
                }

                if (!file.files[0]) {
                    console.error('No file selected.');
                    return;
                }

                callback(file.files[0]);

                file.parentNode.removeChild(file);
            };
            file.style.display = 'none';
            (document.body || document.documentElement).appendChild(file);
            fireClickEvent(file);
        }

        function fireClickEvent(element) {
            var evt = new window.MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                button: 0,
                buttons: 0,
                mozInputSource: 1
            });

            var fired = element.dispatchEvent(evt);
        }
    };

    var imageHandler = {
        lastImageURL: null,
        lastImageIndex: 0,
        images: [],

        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['image', [imageHandler.lastImageURL, t.prevX, t.prevY, x - t.prevX, y - t.prevY, imageHandler.lastImageIndex], drawHelper.getOptions()];

                t.ismousedown = false;
            }

        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);

                drawHelper.image(tempContext, [imageHandler.lastImageURL, t.prevX, t.prevY, x - t.prevX, y - t.prevY, imageHandler.lastImageIndex]);
            }
        }
    };

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

    var canvas = tempContext.canvas,
        isTouch = 'createTouch' in document;

    addEvent(canvas, isTouch ? 'touchstart mousedown' : 'mousedown', function(e) {
        if (isTouch) e = e.pageX ? e : e.touches.length ? e.touches[0] : {
            pageX: 0,
            pageY: 0
        };

        var cache = is;

        if (cache.isLine) lineHandler.mousedown(e);
        else if (cache.isArc) arcHandler.mousedown(e);
        else if (cache.isRectangle) rectHandler.mousedown(e);
        else if (cache.isQuadraticCurve) quadraticHandler.mousedown(e);
        else if (cache.isBezierCurve) bezierHandler.mousedown(e);
        else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mousedown(e);
        else if (cache.isPencil) pencilHandler.mousedown(e);
        else if (cache.isEraser) eraserHandler.mousedown(e);
        else if (cache.isText) textHandler.mousedown(e);
        else if (cache.isImage) imageHandler.mousedown(e);
        else if (cache.isArrow) arrowHandler.mousedown(e);
        else if (cache.isMarker) markerHandler.mousedown(e);

        drawHelper.redraw();

        preventStopEvent(e);
    });

    function preventStopEvent(e) {
        if (!e) {
            return;
        }

        if (typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        if (typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }
    }

    addEvent(canvas, isTouch ? 'touchend touchcancel mouseup' : 'mouseup', function(e) {
        if (isTouch) e = e.pageX ? e : e.touches.length ? e.touches[0] : {
            pageX: 0,
            pageY: 0
        };

        var cache = is;

        if (cache.isLine) lineHandler.mouseup(e);
        else if (cache.isArc) arcHandler.mouseup(e);
        else if (cache.isRectangle) rectHandler.mouseup(e);
        else if (cache.isQuadraticCurve) quadraticHandler.mouseup(e);
        else if (cache.isBezierCurve) bezierHandler.mouseup(e);
        else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mouseup(e);
        else if (cache.isPencil) pencilHandler.mouseup(e);
        else if (cache.isEraser) eraserHandler.mouseup(e);
        else if (cache.isText) textHandler.mouseup(e);
        else if (cache.isImage) imageHandler.mouseup(e);
        else if (cache.isArrow) arrowHandler.mouseup(e);
        else if (cache.isMarker) markerHandler.mouseup(e);

        drawHelper.redraw();

        syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);

        preventStopEvent(e);
    });

    addEvent(canvas, isTouch ? 'touchmove mousemove' : 'mousemove', function(e) {
        if (isTouch) e = e.pageX ? e : e.touches.length ? e.touches[0] : {
            pageX: 0,
            pageY: 0
        };

        var cache = is;

        if (cache.isLine) lineHandler.mousemove(e);
        else if (cache.isArc) arcHandler.mousemove(e);
        else if (cache.isRectangle) rectHandler.mousemove(e);
        else if (cache.isQuadraticCurve) quadraticHandler.mousemove(e);
        else if (cache.isBezierCurve) bezierHandler.mousemove(e);
        else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mousemove(e);
        else if (cache.isPencil) pencilHandler.mousemove(e);
        else if (cache.isEraser) eraserHandler.mousemove(e);
        else if (cache.isText) textHandler.mousemove(e);
        else if (cache.isImage) imageHandler.mousemove(e);
        else if (cache.isArrow) arrowHandler.mousemove(e);
        else if (cache.isMarker) markerHandler.mousemove(e);

        preventStopEvent(e);
    });

    var keyCode;

    function onkeydown(e) {
        keyCode = e.which || e.keyCode || 0;

        if (keyCode == 8 || keyCode == 46) {
            if (isBackKey(e, keyCode)) {
                // back key pressed
            }
            return;
        }

        if (e.metaKey) {
            isControlKeyPressed = true;
            keyCode = 17;
        }

        if (!isControlKeyPressed && keyCode === 17) {
            isControlKeyPressed = true;
        }
    }

    function isBackKey(e, keyCode) {
        var doPrevent = false;
        var d = e.srcElement || e.target;
        if ((d.tagName.toUpperCase() === 'INPUT' &&
                (
                    d.type.toUpperCase() === 'TEXT' ||
                    d.type.toUpperCase() === 'PASSWORD' ||
                    d.type.toUpperCase() === 'FILE' ||
                    d.type.toUpperCase() === 'SEARCH' ||
                    d.type.toUpperCase() === 'EMAIL' ||
                    d.type.toUpperCase() === 'NUMBER' ||
                    d.type.toUpperCase() === 'DATE')
            ) ||
            d.tagName.toUpperCase() === 'TEXTAREA') {
            doPrevent = d.readOnly || d.disabled;
        } else {
            doPrevent = true;
        }

        if (doPrevent) {
            e.preventDefault();
        }
        return doPrevent;
    }

    addEvent(document, 'keydown', onkeydown);

    function onkeyup(e) {
        if (e.which == null && (e.charCode != null || e.keyCode != null)) {
            e.which = e.charCode != null ? e.charCode : e.keyCode;
        }

        keyCode = e.which || e.keyCode || 0;

        if (keyCode === 13 && is.isText) {
            textHandler.onReturnKeyPressed();
            return;
        }

        if (keyCode == 8 || keyCode == 46) {
            if (isBackKey(e, keyCode)) {
                textHandler.writeText(textHandler.lastKeyPress, true);
            }
            return;
        }

        // Ctrl + t
        if (isControlKeyPressed && keyCode === 84 && is.isText) {
            textHandler.showTextTools();
            return;
        }

        // Ctrl + z
        if (isControlKeyPressed && keyCode === 90) {
            if (points.length) {
                points.length = points.length - 1;
                drawHelper.redraw();

                syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);
            }
        }

        // Ctrl + a
        if (isControlKeyPressed && keyCode === 65) {
            dragHelper.global.startingIndex = 0;

            endLastPath();

            setSelection(find('drag-all-paths'), 'DragAllPaths');
        }

        // Ctrl + c
        if (isControlKeyPressed && keyCode === 67 && points.length) {
            copy();
        }

        // Ctrl + v
        if (isControlKeyPressed && keyCode === 86 && copiedStuff.length) {
            paste();

            syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);
        }

        // Ending the Control Key
        if (typeof e.metaKey !== 'undefined' && e.metaKey === false) {
            isControlKeyPressed = false;
            keyCode = 17;
        }

        if (keyCode === 17) {
            isControlKeyPressed = false;
        }
    }

    addEvent(document, 'keyup', onkeyup);

    function onkeypress(e) {
        if (e.which == null && (e.charCode != null || e.keyCode != null)) {
            e.which = e.charCode != null ? e.charCode : e.keyCode;
        }

        keyCode = e.which || e.keyCode || 0;

        var inp = String.fromCharCode(keyCode);
        if (/[a-zA-Z0-9-_ !?|\/'",.=:;(){}\[\]`~@#$%^&*+-]/.test(inp)) {
            textHandler.writeText(String.fromCharCode(keyCode));
        }
    }

    addEvent(document, 'keypress', onkeypress);

    function onTextFromClipboard(e) {
        if (!is.isText) return;
        var pastedText = undefined;
        if (window.clipboardData && window.clipboardData.getData) { // IE
            pastedText = window.clipboardData.getData('Text');
        } else if (e.clipboardData && e.clipboardData.getData) {
            pastedText = e.clipboardData.getData('text/plain');
        }
        if (pastedText && pastedText.length) {
            textHandler.writeText(pastedText);
        }
    }

    addEvent(document, 'paste', onTextFromClipboard);

    // scripts on this page directly touches DOM-elements
    // removing or altering anything may cause failures in the UI event handlers
    // it is used only to bring collaboration for canvas-surface
    var lastPointIndex = 0;

    var uid;

    window.addEventListener('message', function(event) {
        if (!event.data) return;

        if (!uid) {
            uid = event.data.uid;
        }

        if (event.data.captureStream) {
            webrtcHandler.createOffer(function(sdp) {
                sdp.uid = uid;
                window.parent.postMessage(sdp, '*');
            });
            return;
        }

        if (event.data.sdp) {
            webrtcHandler.setRemoteDescription(event.data);
            return;
        }

        if (event.data.genDataURL) {
            var dataURL = context.canvas.toDataURL(event.data.format, 1);
            window.parent.postMessage({
                dataURL: dataURL,
                uid: uid
            }, '*');
            return;
        }

        if (event.data.undo && points.length) {
            var index = event.data.index;

            if (index === 'all') {
                points = [];
                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (index.numberOfLastShapes) {
                try {
                    points.length -= index.numberOfLastShapes;
                } catch (e) {
                    points = [];
                }

                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (index === -1) {
                points.length = points.length - 1;
                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (points[index]) {
                var newPoints = [];
                for (var i = 0; i < points.length; i++) {
                    if (i !== index) {
                        newPoints.push(points[i]);
                    }
                }
                points = newPoints;
                drawHelper.redraw();
                syncPoints(true);
            }
            return;
        }

        if (event.data.syncPoints) {
            syncPoints(true);
            return;
        }

        if (!event.data.canvasDesignerSyncData) return;

        // drawing is shared here (array of points)
        var d = event.data.canvasDesignerSyncData;

        if (d.startIndex !== 0) {
            for (var i = 0; i < d.points.length; i++) {
                points[i + d.startIndex] = d.points[i];
            }
        } else {
            points = d.points;
        }

        lastPointIndex = points.length;

        // redraw the <canvas> surfaces
        drawHelper.redraw();
    }, false);

    function syncPoints(isSyncAll) {
        if (isSyncAll) {
            lastPointIndex = 0;
        }

        if (lastPointIndex == points.length) return;

        var pointsToShare = [];
        for (var i = lastPointIndex; i < points.length; i++) {
            pointsToShare[i - lastPointIndex] = points[i];
        }

        if (pointsToShare.length) {
            syncData({
                points: pointsToShare || [],
                startIndex: lastPointIndex
            });
        }

        if (!pointsToShare.length && points.length) return;

        lastPointIndex = points.length;
    }

    function syncData(data) {
        window.parent.postMessage({
            canvasDesignerSyncData: data,
            uid: uid
        }, '*');
    }

    var webrtcHandler = {
        createOffer: function(callback) {
            var captureStream = document.getElementById('main-canvas').captureStream(15);

            var peer = this.getPeer();
            peer.addStream(captureStream);
            peer.onicecandidate = function(event) {
                if (!event || !!event.candidate) {
                    return;
                }

                callback({
                    sdp: peer.localDescription.sdp,
                    type: peer.localDescription.type
                });
            };
            peer.createOffer(function(sdp) {
                peer.setLocalDescription(sdp);
            }, function() {}, {
                mandatory: {
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: false
                }
            });
        },
        setRemoteDescription: function(sdp) {
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
        },
        createAnswer: function(sdp, callback) {
            var peer = this.getPeer();
            this.setRemoteDescription(sdp);
            peer.onicecandidate = function(event) {
                if (!event || !!event.candidate) {
                    return;
                }

                callback({
                    sdp: peer.localDescription.sdp,
                    type: peer.localDescription.type
                });
            };
            peer.createAnswer(function(sdp) {
                peer.setLocalDescription(sdp);
            }, function() {}, {
                mandatory: {
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: true
                }
            });
            peer.onaddstream = function(event) {
                callback(event);
            };
        },
        getPeer: function() {
            var WebRTC_Native_Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
            var peer = new WebRTC_Native_Peer(null);
            this.peer = peer;
            return peer;
        }
    };

})();
