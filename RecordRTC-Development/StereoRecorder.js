// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC

// _________________
// StereoRecorder.js

function StereoRecorder(mediaStream) {
    this.record = function() {
        mediaRecorder = new StereoAudioRecorder(mediaStream, this);
        mediaRecorder.record();
    };

    this.stop = function() {
        if (mediaRecorder) mediaRecorder.stop();
        this.recordedBlob = mediaRecorder.recordedBlob;
    };

    // Reference to "StereoAudioRecorder" object
    var mediaRecorder;
}
