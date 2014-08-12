// -------------------------------------------------------------
var drawHelper = {

    // -------------------------------------------------------------

    redraw: function () {
        tempContext.clearRect(0, 0, innerWidth, innerHeight);
        context.clearRect(0, 0, innerWidth, innerHeight);

        var i, point, length = points.length;
        for (i = 0; i < length; i++) {
            point = points[i];
            this[point[0]](context, point[1], point[2]);
        }
    },

    // -------------------------------------------------------------

    getOptions: function () {
        return [lineWidth, strokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin];
    },

    // -------------------------------------------------------------

    handleOptions: function (context, opt, isNoFillStroke) {
        opt = opt || this.getOptions();

        context.globalAlpha = opt[3];
        context.globalCompositeOperation = opt[4];

        context.lineCap = opt[5];
        context.lineJoin = opt[6];
        context.lineWidth = opt[0];

        context.strokeStyle = opt[1];
        context.fillStyle = opt[2];
        
        if (!isNoFillStroke) {
            context.stroke();
            context.fill();
        }
    },

    // -------------------------------------------------------------

    line: function (context, point, options) {
        context.beginPath();
        context.moveTo(point[0], point[1]);
        context.lineTo(point[2], point[3]);

        this.handleOptions(context, options);
    },

    // -------------------------------------------------------------

    arc: function (context, point, options) {
        context.beginPath();
        context.arc(point[0], point[1], point[2], point[3], 0, point[4]);

        this.handleOptions(context, options);
    },

    // -------------------------------------------------------------

    rect: function (context, point, options) {
        this.handleOptions(context, options, true);

        context.strokeRect(point[0], point[1], point[2], point[3]);
        context.fillRect(point[0], point[1], point[2], point[3]);
    },

    // -------------------------------------------------------------

    quadratic: function (context, point, options) {
        context.beginPath();
        context.moveTo(point[0], point[1]);
        context.quadraticCurveTo(point[2], point[3], point[4], point[5]);

        this.handleOptions(context, options);
    },

    // -------------------------------------------------------------

    bezier: function (context, point, options) {
        context.beginPath();
        context.moveTo(point[0], point[1]);
        context.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);

        this.handleOptions(context, options);
    }

    // -------------------------------------------------------------
};
// -------------------------------------------------------------