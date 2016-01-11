// RecordingHandler.js

var RecordingHandler = (function() {
    var recorders = {};

    function record(stream) {
        var recorder = new MultiStreamRecorder(stream);
        recorder.start(5 * 50000 * 500000 * 500000);
        recorders[stream.id] = recorder;
    }

    function stop(stream, callback) {
        if (!recorders[stream.id]) return;
        var recorder = recorders[stream.id];
        recorder.ondataavailable = callback;
        recorder.stop();
    }

    return {
        record: record,
        stop: stop
    };
})();
