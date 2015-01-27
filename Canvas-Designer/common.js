// -------------------------------------------------------------
var is = {
    isLine: false,
    isArc: false,
    isDragLastPath: false,
    isDragAllPaths: false,
    isRectangle: false,
    isQuadraticCurve: false,
    isBezierCurve: false,
    isPencil: false,
    isEraser: false,
    isText: false,

    set: function(shape) {
        var cache = this;

        cache.isLine = cache.isArc = cache.isDragLastPath = cache.isDragAllPaths = cache.isRectangle = cache.isQuadraticCurve = cache.isBezierCurve = is.isPencil = is.isEraser = is.isText = false;
        cache['is' + shape] = true;
    }
};

// -------------------------------------------------------------

function addEvent(element, eventType, callback) {
    if (element.addEventListener) {
        element.addEventListener(eventType, callback, !1);
        return true;
    } else if (element.attachEvent) return element.attachEvent('on' + eventType, callback);
    else element['on' + eventType] = callback;
    return this;
}

// -------------------------------------------------------------

function find(selector) {
    return document.getElementById(selector);
}

// -------------------------------------------------------------

var points = [],
    textarea = find('code-text'),
    lineWidth = 2,
    strokeStyle = '#6c96c8',
    fillStyle = 'transparent',
    globalAlpha = 1,
    globalCompositeOperation = 'source-over',
    lineCap = 'butt',
    font = '15px Verdana',
    lineJoin = 'miter';

// -------------------------------------------------------------

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

// -------------------------------------------------------------

var context = getContext('main-canvas'),
    tempContext = getContext('temp-canvas');


// -------------------------------------------------------------

var common = {

    // -------------------------------------------------------------

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

    // -------------------------------------------------------------

    toFixed: function(input) {
        return Number(input).toFixed(1);
    },

    // -------------------------------------------------------------

    getPoint: function(pointToCompare, compareWith, prefix) {
        if (pointToCompare > compareWith) pointToCompare = prefix + ' + ' + (pointToCompare - compareWith);
        else if (pointToCompare < compareWith) pointToCompare = prefix + ' - ' + (compareWith - pointToCompare);
        else pointToCompare = prefix;

        return pointToCompare;
    },



    // -------------------------------------------------------------

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
        textarea.value = 'var points = [' + output + '], length = points.length, point, p, i = 0;\n\n' + this.forLoop;

        this.prevProps = null;
    },

    // -------------------------------------------------------------

    absoluteNOTShortened: function(toFixed) {
        var tempArray = [],
            i, point, p;

        for (i = 0; i < points.length; i++) {
            p = points[i];
            point = p[1];

            if (p[0] === 'pencil') {
                tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
            }

            if (p[0] === 'eraser') {
                tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
            }

            if (p[0] === 'line') {
                tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
            }

            if (p[0] === 'text') {
                tempArray[i] = ['context.fillText(' + point[0] + ', ' + point[1] + ', ' + point[2] + ');\n' + this.strokeOrFill(p[2])];
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
        textarea.value = tempArray.join('\n\n') + this.strokeFillText;

        this.prevProps = null;
    },

    // -------------------------------------------------------------

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
        textarea.value = 'var x = ' + x + ', y = ' + y + ', points = [' + output + '], length = points.length, point, p, i = 0;\n\n' + this.forLoop;

        this.prevProps = null;
    },

    // -------------------------------------------------------------

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

                + this.strokeOrFill(p[2]);
            }

            if (p[0] === 'pencil') {
                output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                + this.strokeOrFill(p[2]);
            }

            if (p[0] === 'eraser') {
                output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                + this.strokeOrFill(p[2]);
            }

            if (p[0] === 'line') {
                output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                + this.strokeOrFill(p[2]);
            }

            if (p[0] === 'text') {
                output += 'context.fillText(' + point[0] + ', ' + getPoint(point[1], x, 'x') + ', ' + getPoint(point[2], y, 'y') + ');\n' + this.strokeOrFill(p[2]);
            }

            if (p[0] === 'rect') {
                output += this.strokeOrFill(p[2]) + '\n' + 'context.strokeRect(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n' + 'context.fillRect(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');';
            }

            if (p[0] === 'quadratic') {
                output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.quadraticCurveTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', ' + getPoint(point[4], x, 'x') + ', ' + getPoint(point[5], y, 'y') + ');\n'

                + this.strokeOrFill(p[2]);
            }

            if (p[0] === 'bezier') {
                output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.bezierCurveTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', ' + getPoint(point[4], x, 'x') + ', ' + getPoint(point[5], y, 'y') + ', ' + getPoint(point[6], x, 'x') + ', ' + getPoint(point[7], y, 'y') + ');\n'

                + this.strokeOrFill(p[2]);
            }

            if (i !== length - 1) output += '\n\n';
        }
        textarea.value = output + this.strokeFillText;

        this.prevProps = null;
    },

    // -------------------------------------------------------------

    forLoop: 'for(i; i < length; i++) {\n' + '\t p = points[i];\n' + '\t point = p[1];\n' + '\t context.beginPath();\n\n'

    // -------------------------------------------------------------
        + '\t if(p[2]) { \n' + '\t\t context.lineWidth = p[2][0];\n' + '\t\t context.strokeStyle = p[2][1];\n' + '\t\t context.fillStyle = p[2][2];\n'

        + '\t\t context.globalAlpha = p[2][3];\n' + '\t\t context.globalCompositeOperation = p[2][4];\n' + '\t\t context.lineCap = p[2][5];\n' + '\t\t context.lineJoin = p[2][6];\n' + '\t\t context.font = p[2][7];\n' + '\t }\n\n'

    // -------------------------------------------------------------

        + '\t if(p[0] === "line") { \n' + '\t\t context.moveTo(point[0], point[1]);\n' + '\t\t context.lineTo(point[2], point[3]);\n' + '\t }\n\n'

    // -------------------------------------------------------------

        + '\t if(p[0] === "pencil") { \n' + '\t\t context.moveTo(point[0], point[1]);\n' + '\t\t context.lineTo(point[2], point[3]);\n' + '\t }\n\n'

    // -------------------------------------------------------------

        + '\t if(p[0] === "text") { \n' + '\t\t context.fillText(point[0], point[1], point[2]);\n' + '\t }\n\n'


    // -------------------------------------------------------------

        + '\t if(p[0] === "eraser") { \n' + '\t\t context.moveTo(point[0], point[1]);\n' + '\t\t context.lineTo(point[2], point[3]);\n' + '\t }\n\n'

    // -------------------------------------------------------------

        + '\t if(p[0] === "arc") context.arc(point[0], point[1], point[2], point[3], 0, point[4]); \n\n'

    // -------------------------------------------------------------

        + '\t if(p[0] === "rect") {\n' + '\t\t context.strokeRect(point[0], point[1], point[2], point[3]);\n' + '\t\t context.fillRect(point[0], point[1], point[2], point[3]);\n'

        + '\t }\n\n'

    // -------------------------------------------------------------

        + '\t if(p[0] === "quadratic") {\n' + '\t\t context.moveTo(point[0], point[1]);\n' + '\t\t context.quadraticCurveTo(point[2], point[3], point[4], point[5]);\n' + '\t }\n\n'

    // -------------------------------------------------------------

        + '\t if(p[0] === "bezier") {\n' + '\t\t context.moveTo(point[0], point[1]);\n' + '\t\t context.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);\n' + '\t }\n\n'

    // -------------------------------------------------------------

        + '\t context.stroke();\n' + '\t context.fill();\n'

        + '}',

    // -------------------------------------------------------------

    strokeFillText: '\n\nfunction strokeOrFill(lineWidth, strokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin, font) { \n' + '\t if(lineWidth) { \n' + '\t\t context.globalAlpha = globalAlpha;\n' + '\t\t context.globalCompositeOperation = globalCompositeOperation;\n' + '\t\t context.lineCap = lineCap;\n' + '\t\t context.lineJoin = lineJoin;\n'

        + '\t\t context.lineWidth = lineWidth;\n' + '\t\t context.strokeStyle = strokeStyle;\n' + '\t\t context.fillStyle = fillStyle;\n' + '\t\t context.font = font;\n' + '\t } \n\n'

        + '\t context.stroke();\n' + '\t context.fill();\n'

        + '}',

    // -------------------------------------------------------------

    strokeOrFill: function(p) {
        if (!this.prevProps || this.prevProps !== p.join(',')) {
            this.prevProps = p.join(',');

            return 'strokeOrFill("' + p.join('", "') + '");';
        }

        return 'strokeOrFill();';
    },

    // -------------------------------------------------------------
    prevProps: null,
    shortenHelper: function(name, p1, p2) {
        var result = '["' + name + '", [' + p1.join(', ') + ']';

        if (!this.prevProps || this.prevProps !== p2.join(',')) {
            this.prevProps = p2.join(',');
            result += ', ["' + p2.join('", "') + '"]';
        }

        return result + '], ';
    }

    // -------------------------------------------------------------

};

// -------------------------------------------------------------

function endLastPath() {
    var cache = is;

    if (cache.isArc) arcHandler.end();
    else if (cache.isQuadraticCurve) quadraticHandler.end();
    else if (cache.isBezierCurve) bezierHandler.end();

    drawHelper.redraw();
}

// -------------------------------------------------------------

var copiedStuff = [],
    isControlKeyPressed;

// -------------------------------------------------------------

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

// -------------------------------------------------------------

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

// -------------------------------------------------------------