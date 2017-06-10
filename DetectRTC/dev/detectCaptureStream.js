var isCanvasSupportsStreamCapturing = false;
var isVideoSupportsStreamCapturing = false;
['captureStream', 'mozCaptureStream', 'webkitCaptureStream'].forEach(function(item) {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
        return;
    }

    if (!isCanvasSupportsStreamCapturing && item in document.createElement('canvas')) {
        isCanvasSupportsStreamCapturing = true;
    }

    if (!isVideoSupportsStreamCapturing && item in document.createElement('video')) {
        isVideoSupportsStreamCapturing = true;
    }
});
