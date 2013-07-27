// Muaz Khan     - https://github.com/muaz-khan 
// neizerth      - https://github.com/neizerth
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/streamproc/MediaStreamRecorder
// ==========================================================
// MediaRecorder.js

function MediaRecorder(mediaStream) {
    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        timeSlice = timeSlice || 1000;

        mediaRecorder = new MediaRecorderWrapper(mediaStream);
        mediaRecorder.ondataavailable = function(e) {
            if (mediaRecorder.state == 'recording') {
                var blob = new window.Blob([e.data], {
                    type: self.mimeType || 'audio/ogg'
                });
                self.ondataavailable(blob);
                mediaRecorder.stop();
            }
        };

        mediaRecorder.onstop = function() {
            if (mediaRecorder.state == 'inactive') {
                // bug: it is a temporary workaround; it must be fixed.
                mediaRecorder = new MediaRecorder(mediaStream);
                mediaRecorder.ondataavailable = self.ondataavailable;
                mediaRecorder.onstop = self.onstop;
                mediaRecorder.mimeType = self.mimeType;
                mediaRecorder.start(timeSlice);
            }

            self.onstop();
        };

        // void start(optional long timeSlice)
        mediaRecorder.start(timeSlice);
    };

    this.stop = function() {
        if (mediaRecorder && mediaRecorder.state == 'recording') {
            mediaRecorder.stop();
        }
    };

    this.ondataavailable = function() {};
    this.onstop = function() {};

    // Reference to itself
    var self = this;

    // Reference to "MediaRecorderWrapper" object
    var mediaRecorder;
}
