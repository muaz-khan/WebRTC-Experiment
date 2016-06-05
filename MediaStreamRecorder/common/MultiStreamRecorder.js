// ______________________
// MultiStreamRecorder.js

function MultiStreamRecorder(mediaStream) {
    if (!mediaStream) {
        throw 'MediaStream is mandatory.';
    }

    var self = this;
    var isMediaRecorder = isMediaRecorderCompatible();

    this.stream = mediaStream;

    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        audioRecorder = new MediaStreamRecorder(mediaStream);
        videoRecorder = new MediaStreamRecorder(mediaStream);

        audioRecorder.mimeType = 'audio/ogg';
        videoRecorder.mimeType = 'video/webm';

        for (var prop in this) {
            if (typeof this[prop] !== 'function') {
                audioRecorder[prop] = videoRecorder[prop] = this[prop];
            }
        }

        audioRecorder.ondataavailable = function(blob) {
            if (!audioVideoBlobs[recordingInterval]) {
                audioVideoBlobs[recordingInterval] = {};
            }

            audioVideoBlobs[recordingInterval].audio = blob;

            if (audioVideoBlobs[recordingInterval].video && !audioVideoBlobs[recordingInterval].onDataAvailableEventFired) {
                audioVideoBlobs[recordingInterval].onDataAvailableEventFired = true;
                fireOnDataAvailableEvent(audioVideoBlobs[recordingInterval]);
            }
        };

        videoRecorder.ondataavailable = function(blob) {
            if (isMediaRecorder) {
                return self.ondataavailable({
                    video: blob,
                    audio: blob
                });
            }

            if (!audioVideoBlobs[recordingInterval]) {
                audioVideoBlobs[recordingInterval] = {};
            }

            audioVideoBlobs[recordingInterval].video = blob;

            if (audioVideoBlobs[recordingInterval].audio && !audioVideoBlobs[recordingInterval].onDataAvailableEventFired) {
                audioVideoBlobs[recordingInterval].onDataAvailableEventFired = true;
                fireOnDataAvailableEvent(audioVideoBlobs[recordingInterval]);
            }
        };

        function fireOnDataAvailableEvent(blobs) {
            recordingInterval++;
            self.ondataavailable(blobs);
        }

        videoRecorder.onstop = audioRecorder.onstop = function(error) {
            self.onstop(error);
        };

        if (!isMediaRecorder) {
            // to make sure both audio/video are synced.
            videoRecorder.onStartedDrawingNonBlankFrames = function() {
                videoRecorder.clearOldRecordedFrames();
                audioRecorder.start(timeSlice);
            };
            videoRecorder.start(timeSlice);
        } else {
            videoRecorder.start(timeSlice);
        }
    };

    this.stop = function() {
        if (audioRecorder) {
            audioRecorder.stop();
        }
        if (videoRecorder) {
            videoRecorder.stop();
        }
    };

    this.ondataavailable = function(blob) {
        console.log('ondataavailable..', blob);
    };

    this.onstop = function(error) {
        console.warn('stopped..', error);
    };

    this.pause = function() {
        if (audioRecorder) {
            audioRecorder.pause();
        }
        if (videoRecorder) {
            videoRecorder.pause();
        }
    };

    this.resume = function() {
        if (audioRecorder) {
            audioRecorder.resume();
        }
        if (videoRecorder) {
            videoRecorder.resume();
        }
    };

    var audioRecorder;
    var videoRecorder;

    var audioVideoBlobs = {};
    var recordingInterval = 0;
}

if (typeof MediaStreamRecorder !== 'undefined') {
    MediaStreamRecorder.MultiStreamRecorder = MultiStreamRecorder;
}
