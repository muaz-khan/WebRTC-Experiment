var dragHelper = {
    global: {
        prevX: 0,
        prevY: 0,
        ismousedown: false,
        pointsToMove: 'all',
        startingIndex: 0
    },
    mousedown: function(e) {
        if (isControlKeyPressed) {
            copy();
            paste();
            isControlKeyPressed = false;
        }

        var dHelper = dragHelper,
            g = dHelper.global;

        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop;

        g.prevX = x;
        g.prevY = y;

        g.pointsToMove = 'all';

        if (points.length) {
            var p = points[points.length - 1],
                point = p[1];

            if (p[0] === 'line') {

                if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                    g.pointsToMove = 'head';
                }

                if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                    g.pointsToMove = 'tail';
                }
            }

            if (p[0] === 'arrow') {

                if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                    g.pointsToMove = 'head';
                }

                if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                    g.pointsToMove = 'tail';
                }
            }

            if (p[0] === 'rect') {

                if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                    g.pointsToMove = 'stretch-first';
                }

                if (dHelper.isPointInPath(x, y, point[0] + point[2], point[1])) {
                    g.pointsToMove = 'stretch-second';
                }

                if (dHelper.isPointInPath(x, y, point[0], point[1] + point[3])) {
                    g.pointsToMove = 'stretch-third';
                }

                if (dHelper.isPointInPath(x, y, point[0] + point[2], point[1] + point[3])) {
                    g.pointsToMove = 'stretch-last';
                }
            }

            if (p[0] === 'image') {

                if (dHelper.isPointInPath(x, y, point[1], point[2])) {
                    g.pointsToMove = 'stretch-first';
                }

                if (dHelper.isPointInPath(x, y, point[1] + point[3], point[2])) {
                    g.pointsToMove = 'stretch-second';
                }

                if (dHelper.isPointInPath(x, y, point[1], point[2] + point[4])) {
                    g.pointsToMove = 'stretch-third';
                }

                if (dHelper.isPointInPath(x, y, point[1] + point[3], point[2] + point[4])) {
                    g.pointsToMove = 'stretch-last';
                }
            }

            if (p[0] === 'quadratic') {

                if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                    g.pointsToMove = 'starting-points';
                }

                if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                    g.pointsToMove = 'control-points';
                }

                if (dHelper.isPointInPath(x, y, point[4], point[5])) {
                    g.pointsToMove = 'ending-points';
                }
            }

            if (p[0] === 'bezier') {

                if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                    g.pointsToMove = 'starting-points';
                }

                if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                    g.pointsToMove = '1st-control-points';
                }

                if (dHelper.isPointInPath(x, y, point[4], point[5])) {
                    g.pointsToMove = '2nd-control-points';
                }

                if (dHelper.isPointInPath(x, y, point[6], point[7])) {
                    g.pointsToMove = 'ending-points';
                }
            }
        }

        g.ismousedown = true;
    },
    mouseup: function() {
        var g = this.global;

        if (is.isDragLastPath) {
            tempContext.clearRect(0, 0, innerWidth, innerHeight);
            context.clearRect(0, 0, innerWidth, innerHeight);
            this.end();
        }

        g.ismousedown = false;
    },
    mousemove: function(e) {
        var x = e.pageX - canvas.offsetLeft,
            y = e.pageY - canvas.offsetTop,
            g = this.global;

        drawHelper.redraw();

        if (g.ismousedown) {
            this.dragShape(x, y);
        }

        if (is.isDragLastPath) this.init();
    },
    init: function() {
        if (!points.length) return;

        var p = points[points.length - 1],
            point = p[1],
            g = this.global;

        if (g.ismousedown) tempContext.fillStyle = 'rgba(255,85 ,154,.9)';
        else tempContext.fillStyle = 'rgba(255,85 ,154,.4)';

        if (p[0] === 'quadratic') {

            tempContext.beginPath();

            tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[4], point[5], 10, Math.PI * 2, 0, !1);

            tempContext.fill();
        }

        if (p[0] === 'bezier') {

            tempContext.beginPath();

            tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[4], point[5], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[6], point[7], 10, Math.PI * 2, 0, !1);

            tempContext.fill();
        }

        if (p[0] === 'line') {

            tempContext.beginPath();

            tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);

            tempContext.fill();
        }

        if (p[0] === 'arrow') {

            tempContext.beginPath();

            tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
            tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);

            tempContext.fill();
        }

        if (p[0] === 'text') {
            tempContext.font = "15px Verdana";
            tempContext.fillText(point[0], point[1], point[2]);
        }

        if (p[0] === 'rect') {

            tempContext.beginPath();
            tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
            tempContext.fill();

            tempContext.beginPath();
            tempContext.arc(point[0] + point[2], point[1], 10, Math.PI * 2, 0, !1);
            tempContext.fill();

            tempContext.beginPath();
            tempContext.arc(point[0], point[1] + point[3], 10, Math.PI * 2, 0, !1);
            tempContext.fill();

            tempContext.beginPath();
            tempContext.arc(point[0] + point[2], point[1] + point[3], 10, Math.PI * 2, 0, !1);
            tempContext.fill();
        }

        if (p[0] === 'image') {
            tempContext.beginPath();
            tempContext.arc(point[1], point[2], 10, Math.PI * 2, 0, !1);
            tempContext.fill();

            tempContext.beginPath();
            tempContext.arc(point[1] + point[3], point[2], 10, Math.PI * 2, 0, !1);
            tempContext.fill();

            tempContext.beginPath();
            tempContext.arc(point[1], point[2] + point[4], 10, Math.PI * 2, 0, !1);
            tempContext.fill();

            tempContext.beginPath();
            tempContext.arc(point[1] + point[3], point[2] + point[4], 10, Math.PI * 2, 0, !1);
            tempContext.fill();
        }
    },
    isPointInPath: function(x, y, first, second) {
        return x > first - 10 && x < first + 10 && y > second - 10 && y < second + 10;
    },
    getPoint: function(point, prev, otherPoint) {
        if (point > prev) {
            point = otherPoint + (point - prev);
        } else {
            point = otherPoint - (prev - point);
        }

        return point;
    },
    getXYWidthHeight: function(x, y, prevX, prevY, oldPoints) {
        if (oldPoints.pointsToMove == 'stretch-first') {
            if (x > prevX) {
                oldPoints.x = oldPoints.x + (x - prevX);
                oldPoints.width = oldPoints.width - (x - prevX);
            } else {
                oldPoints.x = oldPoints.x - (prevX - x);
                oldPoints.width = oldPoints.width + (prevX - x);
            }

            if (y > prevY) {
                oldPoints.y = oldPoints.y + (y - prevY);
                oldPoints.height = oldPoints.height - (y - prevY);
            } else {
                oldPoints.y = oldPoints.y - (prevY - y);
                oldPoints.height = oldPoints.height + (prevY - y);
            }
        }

        if (oldPoints.pointsToMove == 'stretch-second') {
            if (x > prevX) {
                oldPoints.width = oldPoints.width + (x - prevX);
            } else {
                oldPoints.width = oldPoints.width - (prevX - x);
            }

            if (y < prevY) {
                oldPoints.y = oldPoints.y + (y - prevY);
                oldPoints.height = oldPoints.height - (y - prevY);
            } else {
                oldPoints.y = oldPoints.y - (prevY - y);
                oldPoints.height = oldPoints.height + (prevY - y);
            }
        }

        if (oldPoints.pointsToMove == 'stretch-third') {
            if (x > prevX) {
                oldPoints.x = oldPoints.x + (x - prevX);
                oldPoints.width = oldPoints.width - (x - prevX);
            } else {
                oldPoints.x = oldPoints.x - (prevX - x);
                oldPoints.width = oldPoints.width + (prevX - x);
            }

            if (y < prevY) {
                oldPoints.height = oldPoints.height + (y - prevY);
            } else {
                oldPoints.height = oldPoints.height - (prevY - y);
            }
        }

        return oldPoints;
    },
    dragShape: function(x, y) {
        if (!this.global.ismousedown) return;

        tempContext.clearRect(0, 0, innerWidth, innerHeight);

        if (is.isDragLastPath) {
            this.dragLastPath(x, y);
        }

        if (is.isDragAllPaths) {
            this.dragAllPaths(x, y);
        }

        var g = this.global;

        g.prevX = x;
        g.prevY = y;
    },
    end: function() {
        if (!points.length) return;

        tempContext.clearRect(0, 0, innerWidth, innerHeight);

        var point = points[points.length - 1];
        drawHelper[point[0]](context, point[1], point[2]);
    },
    dragAllPaths: function(x, y) {
        var g = this.global,
            prevX = g.prevX,
            prevY = g.prevY,
            p, point,
            length = points.length,
            getPoint = this.getPoint,
            i = g.startingIndex;

        for (i; i < length; i++) {
            p = points[i];
            point = p[1];

            if (p[0] === 'line') {
                points[i] = [p[0],
                    [
                        getPoint(x, prevX, point[0]),
                        getPoint(y, prevY, point[1]),
                        getPoint(x, prevX, point[2]),
                        getPoint(y, prevY, point[3])
                    ], p[2]
                ];
            }

            if (p[0] === 'arrow') {
                points[i] = [p[0],
                    [
                        getPoint(x, prevX, point[0]),
                        getPoint(y, prevY, point[1]),
                        getPoint(x, prevX, point[2]),
                        getPoint(y, prevY, point[3])
                    ], p[2]
                ];
            }

            if (p[0] === 'text') {
                points[i] = [p[0],
                    [
                        point[0],
                        getPoint(x, prevX, point[1]),
                        getPoint(y, prevY, point[2])
                    ], p[2]
                ];
            }

            if (p[0] === 'arc') {
                points[i] = [p[0],
                    [
                        getPoint(x, prevX, point[0]),
                        getPoint(y, prevY, point[1]),
                        point[2],
                        point[3],
                        point[4]
                    ], p[2]
                ];
            }

            if (p[0] === 'rect') {
                points[i] = [p[0],
                    [
                        getPoint(x, prevX, point[0]),
                        getPoint(y, prevY, point[1]),
                        point[2],
                        point[3]
                    ], p[2]
                ];
            }

            if (p[0] === 'image') {
                points[i] = [p[0],
                    [
                        point[0],
                        getPoint(x, prevX, point[1]),
                        getPoint(y, prevY, point[2]),
                        point[3],
                        point[4],
                        point[5]
                    ], p[2]
                ];
            }

            if (p[0] === 'quadratic') {
                points[i] = [p[0],
                    [
                        getPoint(x, prevX, point[0]),
                        getPoint(y, prevY, point[1]),
                        getPoint(x, prevX, point[2]),
                        getPoint(y, prevY, point[3]),
                        getPoint(x, prevX, point[4]),
                        getPoint(y, prevY, point[5])
                    ], p[2]
                ];
            }

            if (p[0] === 'bezier') {
                points[i] = [p[0],
                    [
                        getPoint(x, prevX, point[0]),
                        getPoint(y, prevY, point[1]),
                        getPoint(x, prevX, point[2]),
                        getPoint(y, prevY, point[3]),
                        getPoint(x, prevX, point[4]),
                        getPoint(y, prevY, point[5]),
                        getPoint(x, prevX, point[6]),
                        getPoint(y, prevY, point[7])
                    ], p[2]
                ];
            }
        }
    },
    dragLastPath: function(x, y) {
        var g = this.global,
            prevX = g.prevX,
            prevY = g.prevY,
            p = points[points.length - 1],
            point = p[1],
            getPoint = this.getPoint,
            getXYWidthHeight = this.getXYWidthHeight,
            isMoveAllPoints = g.pointsToMove === 'all';

        if (p[0] === 'line') {

            if (g.pointsToMove === 'head' || isMoveAllPoints) {
                point[0] = getPoint(x, prevX, point[0]);
                point[1] = getPoint(y, prevY, point[1]);
            }

            if (g.pointsToMove === 'tail' || isMoveAllPoints) {
                point[2] = getPoint(x, prevX, point[2]);
                point[3] = getPoint(y, prevY, point[3]);
            }

            points[points.length - 1] = [p[0], point, p[2]];
        }

        if (p[0] === 'arrow') {

            if (g.pointsToMove === 'head' || isMoveAllPoints) {
                point[0] = getPoint(x, prevX, point[0]);
                point[1] = getPoint(y, prevY, point[1]);
            }

            if (g.pointsToMove === 'tail' || isMoveAllPoints) {
                point[2] = getPoint(x, prevX, point[2]);
                point[3] = getPoint(y, prevY, point[3]);
            }

            points[points.length - 1] = [p[0], point, p[2]];
        }

        if (p[0] === 'text') {

            if (g.pointsToMove === 'head' || isMoveAllPoints) {
                point[1] = getPoint(x, prevX, point[1]);
                point[2] = getPoint(y, prevY, point[2]);
            }

            points[points.length - 1] = [p[0], point, p[2]];
        }

        if (p[0] === 'arc') {
            point[0] = getPoint(x, prevX, point[0]);
            point[1] = getPoint(y, prevY, point[1]);

            points[points.length - 1] = [p[0], point, p[2]];
        }

        if (p[0] === 'rect') {

            if (isMoveAllPoints) {
                point[0] = getPoint(x, prevX, point[0]);
                point[1] = getPoint(y, prevY, point[1]);
            }

            if (g.pointsToMove === 'stretch-first') {
                var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                    x: point[0],
                    y: point[1],
                    width: point[2],
                    height: point[3],
                    pointsToMove: g.pointsToMove
                });

                point[0] = newPoints.x;
                point[1] = newPoints.y;
                point[2] = newPoints.width;
                point[3] = newPoints.height;
            }

            if (g.pointsToMove === 'stretch-second') {
                var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                    x: point[0],
                    y: point[1],
                    width: point[2],
                    height: point[3],
                    pointsToMove: g.pointsToMove
                });

                point[1] = newPoints.y;
                point[2] = newPoints.width;
                point[3] = newPoints.height;
            }

            if (g.pointsToMove === 'stretch-third') {
                var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                    x: point[0],
                    y: point[1],
                    width: point[2],
                    height: point[3],
                    pointsToMove: g.pointsToMove
                });

                point[0] = newPoints.x;
                point[2] = newPoints.width;
                point[3] = newPoints.height;
            }

            if (g.pointsToMove === 'stretch-last') {
                point[2] = getPoint(x, prevX, point[2]);
                point[3] = getPoint(y, prevY, point[3]);
            }

            points[points.length - 1] = [p[0], point, p[2]];
        }

        if (p[0] === 'image') {

            if (isMoveAllPoints) {
                point[1] = getPoint(x, prevX, point[1]);
                point[2] = getPoint(y, prevY, point[2]);
            }

            if (g.pointsToMove === 'stretch-first') {
                var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                    x: point[1],
                    y: point[2],
                    width: point[3],
                    height: point[4],
                    pointsToMove: g.pointsToMove
                });

                point[1] = newPoints.x;
                point[2] = newPoints.y;
                point[3] = newPoints.width;
                point[4] = newPoints.height;
            }

            if (g.pointsToMove === 'stretch-second') {
                var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                    x: point[1],
                    y: point[2],
                    width: point[3],
                    height: point[4],
                    pointsToMove: g.pointsToMove
                });

                point[2] = newPoints.y;
                point[3] = newPoints.width;
                point[4] = newPoints.height;
            }

            if (g.pointsToMove === 'stretch-third') {
                var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                    x: point[1],
                    y: point[2],
                    width: point[3],
                    height: point[4],
                    pointsToMove: g.pointsToMove
                });

                point[1] = newPoints.x;
                point[3] = newPoints.width;
                point[4] = newPoints.height;
            }

            if (g.pointsToMove === 'stretch-last') {
                point[3] = getPoint(x, prevX, point[3]);
                point[4] = getPoint(y, prevY, point[4]);
            }

            points[points.length - 1] = [p[0], point, p[2]];
        }

        if (p[0] === 'quadratic') {

            if (g.pointsToMove === 'starting-points' || isMoveAllPoints) {
                point[0] = getPoint(x, prevX, point[0]);
                point[1] = getPoint(y, prevY, point[1]);
            }

            if (g.pointsToMove === 'control-points' || isMoveAllPoints) {
                point[2] = getPoint(x, prevX, point[2]);
                point[3] = getPoint(y, prevY, point[3]);
            }

            if (g.pointsToMove === 'ending-points' || isMoveAllPoints) {
                point[4] = getPoint(x, prevX, point[4]);
                point[5] = getPoint(y, prevY, point[5]);
            }

            points[points.length - 1] = [p[0], point, p[2]];
        }

        if (p[0] === 'bezier') {

            if (g.pointsToMove === 'starting-points' || isMoveAllPoints) {
                point[0] = getPoint(x, prevX, point[0]);
                point[1] = getPoint(y, prevY, point[1]);
            }

            if (g.pointsToMove === '1st-control-points' || isMoveAllPoints) {
                point[2] = getPoint(x, prevX, point[2]);
                point[3] = getPoint(y, prevY, point[3]);
            }

            if (g.pointsToMove === '2nd-control-points' || isMoveAllPoints) {
                point[4] = getPoint(x, prevX, point[4]);
                point[5] = getPoint(y, prevY, point[5]);
            }

            if (g.pointsToMove === 'ending-points' || isMoveAllPoints) {
                point[6] = getPoint(x, prevX, point[6]);
                point[7] = getPoint(y, prevY, point[7]);
            }

            points[points.length - 1] = [p[0], point, p[2]];
        }
    }
};
