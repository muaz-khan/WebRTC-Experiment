// -------------------------------------------------------------
// scripts on this page directly touches DOM-elements
// removing or altering anything may cause failures in the UI event handlers
// it is used only to bring collaboration for canvas-surface
// -------------------------------------------------------------
var lastPoint = [];
var selfId = (Math.random() * 10000).toString().replace('.', '');

window.addEventListener('message', function(event) {
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
