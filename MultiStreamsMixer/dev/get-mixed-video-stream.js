function getMixedVideoStream() {
    resetVideoStreams();

    var capturedStream;

    if ('captureStream' in canvas) {
        capturedStream = canvas.captureStream();
    } else if ('mozCaptureStream' in canvas) {
        capturedStream = canvas.mozCaptureStream();
    } else if (!self.disableLogs) {
        console.error('Upgrade to latest Chrome or otherwise enable this flag: chrome://flags/#enable-experimental-web-platform-features');
    }

    var videoStream = new MediaStream();

    capturedStream.getVideoTracks().forEach(function(track) {
        videoStream.addTrack(track);
    });

    canvas.stream = videoStream;

    return videoStream;
}
