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
