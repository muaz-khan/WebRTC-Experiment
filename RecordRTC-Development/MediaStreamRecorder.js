// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC

// ______________________
// MediaStreamRecorder.js

// todo: need to show alert boxes for incompatible cases
// encoder only supports 48k/16k mono audio channel

/**
* Implementation of https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html
* The MediaRecorder accepts a mediaStream as input source passed from UA. When recorder starts,
* a MediaEncoder will be created and accept the mediaStream as input source.
* Encoder will get the raw data by track data changes, encode it by selected MIME Type, then store the encoded in EncodedBufferCache object.
* The encoded data will be extracted on every timeslice passed from Start function call or by RequestData function.
* Thread model:
* When the recorder starts, it creates a "Media Encoder" thread to read data from MediaEncoder object and store buffer in EncodedBufferCache object.
* Also extract the encoded data and create blobs on every timeslice passed from start function or RequestData function called by UA.
*/

function MediaStreamRecorder(mediaStream) {
    var self = this;

    var dataAvailable = false;
    this.record = function() {
        // http://dxr.mozilla.org/mozilla-central/source/content/media/MediaRecorder.cpp
        // https://wiki.mozilla.org/Gecko:MediaRecorder
        // https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html

        // starting a recording session; which will initiate "Reading Thread"
        // "Reading Thread" are used to prevent main-thread blocking scenarios
        mediaRecorder = new MediaRecorder(mediaStream);

        // Dispatching OnDataAvailable Handler
        mediaRecorder.ondataavailable = function(e) {
            if (dataAvailable) return;

            console.log(e.data.type, e.data);

            if (!e.data.size) {
                console.warn('Recording of', e.data.type, 'failed.');
                return;
            }

            // todo: need to check who commented following two lines and why?
            // pull #118
            // if (self.recordedBlob) self.recordedBlob = new Blob([self.recordedBlob, e.data], { type: e.data.type || 'audio/ogg' });

            dataAvailable = true;
            self.recordedBlob = new Blob([e.data], { type: e.data.type || 'audio/ogg' });
            self.callback();
        };

        mediaRecorder.onerror = function(error) {
            console.warn(error);
            mediaRecorder.stop();
            self.record(0);
        };

        // void start(optional long mTimeSlice)
        // The interval of passing encoded data from EncodedBufferCache to onDataAvailable
        // handler. "mTimeSlice < 0" means Session object does not push encoded data to
        // onDataAvailable, instead, it passive wait the client side pull encoded data
        // by calling requestData API.
        mediaRecorder.start(0);

        // Start recording. If timeSlice has been provided, mediaRecorder will
        // raise a dataavailable event containing the Blob of collected data on every timeSlice milliseconds.
        // If timeSlice isn't provided, UA should call the RequestData to obtain the Blob data, also set the mTimeSlice to zero.
    };

    this.stop = function(callback) {
        this.callback = callback;
        // mediaRecorder.state == 'recording' means that media recorder is associated with "session"
        // mediaRecorder.state == 'stopped' means that media recorder is detached from the "session" ... in this case; "session" will also be deleted.

        if (mediaRecorder.state == 'recording') {
            mediaRecorder.requestData();
            mediaRecorder.stop();
        }
    };

    // Reference to "MediaRecorder" object
    var mediaRecorder;
}
