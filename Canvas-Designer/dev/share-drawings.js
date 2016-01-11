// -------------------------------------------------------------
// scripts on this page directly touches DOM-elements
// removing or altering anything may cause failures in the UI event handlers
// it is used only to bring collaboration for canvas-surface
// -------------------------------------------------------------
var lastPoint = [];
var selfId = (Math.random() * 10000).toString().replace('.', '');

window.addEventListener('message', function(event) {
    if (!event.data) return;
    if (event.data.genDataURL) {
        var dataURL = context.canvas.toDataURL(event.data.format);
        window.parent.postMessage({
            dataURL: dataURL
        }, '*');
        return;
    }

    if (event.data.undo && points.length) {
        var index = event.data.index;
        if (index === -1) {
            points.length = points.length - 1;
            drawHelper.redraw();
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
        }
        return;
    }

    if (event.data.syncPoints) {
        window.parent.postMessage({
            canvasDesignerSyncData: points,
            sender: selfId
        }, '*');
        return;
    }

    if (!event.data || !event.data.canvasDesignerSyncData) return;

    if (event.data.sender && event.data.sender == selfId) return;

    // drawing is shared here (array of points)
    points = event.data.canvasDesignerSyncData;

    // to support two-way sharing
    if (!lastPoint.length) {
        lastPoint = points.join('');
    }

    // redraw the <canvas> surfaces
    drawHelper.redraw(true);
}, false);

function syncPoints() {
    if (!lastPoint.length) {
        lastPoint = points.join('');
    }

    if (points.join('') != lastPoint) {
        syncData(points || []);
        lastPoint = points.join('');
    }
}

function syncData(data) {
    window.parent.postMessage({
        canvasDesignerSyncData: data,
        sender: selfId
    }, '*');
}
