function getMixedStream() {
    isStopDrawingFrames = false;
    var mixedVideoStream = getMixedVideoStream();

    var mixedAudioStream = getMixedAudioStream();
    if (mixedAudioStream) {
        mixedAudioStream.getTracks().filter(function(t) {
            return t.kind === 'audio';
        }).forEach(function(track) {
            mixedVideoStream.addTrack(track);
        });
    }

    var fullcanvas;
    arrayOfMediaStreams.forEach(function(stream) {
        if (stream.fullcanvas) {
            fullcanvas = true;
        }
    });

    return mixedVideoStream;
}
