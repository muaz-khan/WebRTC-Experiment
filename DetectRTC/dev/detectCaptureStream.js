
var isCanvasSupportsStreamCapturing = false;
var isVideoSupportsStreamCapturing = false;
['captureStream', 'mozCaptureStream', 'webkitCaptureStream'].forEach(function(item) {
    // asdf
    if(item in document.createElement('canvas')) {
        isCanvasSupportsStreamCapturing = true;
    }

    if(item in document.createElement('video')) {
        isVideoSupportsStreamCapturing = true;
    }
});
