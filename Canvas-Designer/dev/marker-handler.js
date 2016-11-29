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
