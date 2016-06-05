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
        markerDrawHelper.marker(tempContext, [t.prevX, t.prevY, x, y]);

        points[points.length] = ['marker', [t.prevX, t.prevY, x, y], markerDrawHelper.getOptions()];

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
            markerDrawHelper.marker(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['marker', [t.prevX, t.prevY, x, y], markerDrawHelper.getOptions()];

            t.prevX = x;
            t.prevY = y;
        }
    }
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
        drawHelper.marker(tempContext, [t.prevX, t.prevY, x, y]);

        points[points.length] = ['marker', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

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
            drawHelper.marker(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['marker', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

            t.prevX = x;
            t.prevY = y;
        }
    }
};

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

var markerLineWidth = 8,
    markerGlobalAlpha = 0.1,
    markerStrokeStyle = '#FF7373';

var markerDrawHelper = clone(drawHelper);

markerDrawHelper.getOptions = function() {
    return [markerLineWidth, markerStrokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin, font];
}
