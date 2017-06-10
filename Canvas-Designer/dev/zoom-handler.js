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
