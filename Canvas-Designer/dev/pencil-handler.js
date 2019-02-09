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
        pencilDrawHelper.pencil(tempContext, [t.prevX, t.prevY, x, y]);

        points[points.length] = ['pencil', [t.prevX, t.prevY, x, y], pencilDrawHelper.getOptions(), 'start'];

        t.prevX = x;
        t.prevY = y;
    },
    mouseup: function(e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;

        if (t.ismousedown) {
            tempContext.lineCap = 'round';
            pencilDrawHelper.pencil(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['pencil', [t.prevX, t.prevY, x, y], pencilDrawHelper.getOptions(), 'end'];

            t.prevX = x;
            t.prevY = y;
        }

        this.ismousedown = false;
    },
    mousemove: function(e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        var t = this;

        if (t.ismousedown) {
            tempContext.lineCap = 'round';
            pencilDrawHelper.pencil(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['pencil', [t.prevX, t.prevY, x, y], pencilDrawHelper.getOptions()];

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
