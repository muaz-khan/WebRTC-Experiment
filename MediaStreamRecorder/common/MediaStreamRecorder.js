// ______________________
// MediaStreamRecorder.js

function MediaStreamRecorder(mediaStream) {
    if (!mediaStream) {
        throw 'MediaStream is mandatory.';
    }

    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        var Recorder;

        if (typeof MediaRecorder !== 'undefined') {
            Recorder = MediaRecorderWrapper;
        } else if (IsChrome || IsOpera || IsEdge) {
            if (this.mimeType.indexOf('video') !== -1) {
                Recorder = WhammyRecorder;
            } else if (this.mimeType.indexOf('audio') !== -1) {
                Recorder = StereoAudioRecorder;
            }
        }

        // video recorder (in GIF format)
        if (this.mimeType === 'image/gif') {
            Recorder = GifRecorder;
        }

        // audio/wav is supported only via StereoAudioRecorder
        // audio/pcm (int16) is supported only via StereoAudioRecorder
        if (this.mimeType === 'audio/wav' || this.mimeType === 'audio/pcm') {
            Recorder = StereoAudioRecorder;
        }

        // allows forcing StereoAudioRecorder.js on Edge/Firefox
        if (this.recorderType) {
            Recorder = this.recorderType;
        }

        mediaRecorder = new Recorder(mediaStream);
        mediaRecorder.blobs = [];

        var self = this;
        mediaRecorder.ondataavailable = function(data) {
            mediaRecorder.blobs.push(data);
            self.ondataavailable(data);
        };
        mediaRecorder.onstop = this.onstop;
        mediaRecorder.onStartedDrawingNonBlankFrames = this.onStartedDrawingNonBlankFrames;

        // Merge all data-types except "function"
        mediaRecorder = mergeProps(mediaRecorder, this);

        mediaRecorder.start(timeSlice);
    };

    this.onStartedDrawingNonBlankFrames = function() {};
    this.clearOldRecordedFrames = function() {
        if (!mediaRecorder) {
            return;
        }

        mediaRecorder.clearOldRecordedFrames();
    };

    this.stop = function() {
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
    };

    this.ondataavailable = function(blob) {
        console.log('ondataavailable..', blob);
    };

    this.onstop = function(error) {
        console.warn('stopped..', error);
    };

    this.save = function(file, fileName) {
        if (!file) {
            if (!mediaRecorder) {
                return;
            }

            ConcatenateBlobs(mediaRecorder.blobs, mediaRecorder.blobs[0].type, function(concatenatedBlob) {
                invokeSaveAsDialog(concatenatedBlob);
            });
            return;
        }
        invokeSaveAsDialog(file, fileName);
    };

    this.pause = function() {
        if (!mediaRecorder) {
            return;
        }
        mediaRecorder.pause();
        console.log('Paused recording.', this.mimeType || mediaRecorder.mimeType);
    };

    this.resume = function() {
        if (!mediaRecorder) {
            return;
        }
        mediaRecorder.resume();
        console.log('Resumed recording.', this.mimeType || mediaRecorder.mimeType);
    };

    // StereoAudioRecorder || WhammyRecorder || MediaRecorderWrapper || GifRecorder
    this.recorderType = null;

    // video/webm or audio/webm or audio/ogg or audio/wav
    this.mimeType = 'video/webm';

    // logs are enabled by default
    this.disableLogs = false;

    // Reference to "MediaRecorder.js"
    var mediaRecorder;
}
