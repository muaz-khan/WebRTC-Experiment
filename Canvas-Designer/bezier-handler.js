// -------------------------------------------------------------

var bezierHandler = {

    // -------------------------------------------------------------

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

    // -------------------------------------------------------------

    mousedown: function (e) {
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

    // -------------------------------------------------------------

    mouseup: function (e) {
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

    // -------------------------------------------------------------

    mousemove: function (e) {
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

    // -------------------------------------------------------------

    end: function (x, y) {
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

    // -------------------------------------------------------------

};

// -------------------------------------------------------------