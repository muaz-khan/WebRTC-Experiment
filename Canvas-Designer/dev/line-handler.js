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
