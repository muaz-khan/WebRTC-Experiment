// https://github.com/streamproc/MediaStreamRecorder/issues/42
if (typeof module !== 'undefined' /* && !!module.exports*/ ) {
    module.exports = MediaStreamRecorder;
}

if (typeof define === 'function' && define.amd) {
    define('MediaStreamRecorder', [], function() {
        return MediaStreamRecorder;
    });
}
