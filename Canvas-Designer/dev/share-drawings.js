// scripts on this page directly touches DOM-elements
// removing or altering anything may cause failures in the UI event handlers
// it is used only to bring collaboration for canvas-surface
var lastPointIndex = 0;

var uid;

window.addEventListener('message', function(event) {
    if (!event.data) return;

    if (!uid) {
        uid = event.data.uid;
    }

    if (event.data.captureStream) {
        webrtcHandler.createOffer(function(sdp) {
            sdp.uid = uid;
            window.parent.postMessage(sdp, '*');
        });
        return;
    }

    if (event.data.renderStream) {
        setTemporaryLine();
        return;
    }

    if (event.data.sdp) {
        webrtcHandler.setRemoteDescription(event.data);
        return;
    }

    if (event.data.genDataURL) {
        var dataURL = context.canvas.toDataURL(event.data.format, 1);
        window.parent.postMessage({
            dataURL: dataURL,
            uid: uid
        }, '*');
        return;
    }

    if (event.data.undo && points.length) {
        var index = event.data.index;

        if (event.data.tool) {
            var newArray = [];
            var length = points.length;
            var reverse = points.reverse();
            for (var i = 0; i < length; i++) {
                var point = reverse[i];
                if (point[0] !== event.data.tool) {
                    newArray.push(point);
                }
            }
            points = newArray.reverse();
            drawHelper.redraw();
            syncPoints(true);
            return;
        }

        if (index === 'all') {
            points = [];
            drawHelper.redraw();
            syncPoints(true);
            return;
        }

        if (index.numberOfLastShapes) {
            try {
                points.length -= index.numberOfLastShapes;
            } catch (e) {
                points = [];
            }

            drawHelper.redraw();
            syncPoints(true);
            return;
        }

        if (index === -1) {
            if (points.length && (points[points.length - 1][0] === 'pencil' || points[points.length - 1][0] === 'marker')) {
                var newArray = [];
                var length = points.length;

                /* modification start*/
                var index;
                for (var i = 0; i < length; i++) {
                    var point = points[i];
                    if (point[3] === 'start') index = i;
                }
                var copy = [];
                for (var i = 0; i < index; i++) {
                    copy.push(points[i]);
                }
                points = copy;
                /*modification ends*/

                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            points.length = points.length - 1;
            drawHelper.redraw();
            syncPoints(true);
            return;
        }

        if (points[index]) {
            var newPoints = [];
            for (var i = 0; i < points.length; i++) {
                if (i !== index) {
                    newPoints.push(points[i]);
                }
            }
            points = newPoints;
            drawHelper.redraw();
            syncPoints(true);
        }
        return;
    }

    if (event.data.syncPoints) {
        syncPoints(true);
        return;
    }

    if (event.data.clearCanvas) {
        points = [];
        drawHelper.redraw();
        return;
    }

    if (!event.data.canvasDesignerSyncData) return;

    // drawing is shared here (array of points)
    var d = event.data.canvasDesignerSyncData;

    if (d.startIndex !== 0) {
        for (var i = 0; i < d.points.length; i++) {
            points[i + d.startIndex] = d.points[i];
        }
    } else {
        points = d.points;
    }

    lastPointIndex = points.length;

    // redraw the <canvas> surfaces
    drawHelper.redraw();
}, false);

function syncPoints(isSyncAll) {
    if (isSyncAll) {
        lastPointIndex = 0;
    }

    if (lastPointIndex == points.length) return;

    var pointsToShare = [];
    for (var i = lastPointIndex; i < points.length; i++) {
        pointsToShare[i - lastPointIndex] = points[i];
    }

    if (pointsToShare.length) {
        syncData({
            points: pointsToShare || [],
            startIndex: lastPointIndex
        });
    }

    if (!pointsToShare.length && points.length) return;

    lastPointIndex = points.length;
}

function syncData(data) {
    window.parent.postMessage({
        canvasDesignerSyncData: data,
        uid: uid
    }, '*');
}
