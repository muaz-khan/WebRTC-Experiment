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
