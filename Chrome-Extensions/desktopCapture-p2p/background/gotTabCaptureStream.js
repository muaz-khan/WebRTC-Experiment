function gotTabCaptureStream(stream, constraints) {
    if (!stream) {
        if (constraints.audio === true) {
            enableSpeakers = false;
            captureTabUsingTabCapture(resolutions);
            return;
        }
        return alert('still no tabCapture stream');
        // chrome.runtime.reload();
    }

    var newStream = new MediaStream();

    stream.getTracks().forEach(function(track) {
        newStream.addTrack(track);
    });

    initVideoPlayer(newStream);

    gotStream(newStream);
}
