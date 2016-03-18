// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.webrtc-experiment.com/licence
// Documentation - github.com/streamproc/MediaStreamRecorder
// ______________________
// MediaStreamRecorder.js
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
    // if user chosen only audio option; and he tried to pass MediaStream with
    // both audio and video tracks;
    // using a dirty workaround to generate audio-only stream so that we can get audio/ogg output.
    if (this.type === 'audio' && mediaStream.getVideoTracks && mediaStream.getVideoTracks().length && !navigator.mozGetUserMedia) {
        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(mediaStream);

        var destination = context.createMediaStreamDestination();
        mediaStreamSource.connect(destination);

        mediaStream = destination.stream;
    }

    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"

    // starting a recording session; which will initiate "Reading Thread"
    // "Reading Thread" are used to prevent main-thread blocking scenarios
    this.start = function(mTimeSlice) {
        mTimeSlice = mTimeSlice || 1000;
        isStopRecording = false;

        mediaRecorder = new MediaRecorder(mediaStream);

            mediaRecorder.ondataavailable = function(e) {
                if (isStopRecording) {
                return;
            }

            if (isPaused) {
                setTimeout(startRecording, 500);
                return;
            }
            
                console.log('ondataavailable', e.data.type, e.data.size, e.data);
                // mediaRecorder.state === 'recording' means that media recorder is associated with "session"
                // mediaRecorder.state === 'stopped' means that media recorder is detached from the "session" ... in this case; "session" will also be deleted.

                if (!e.data.size) {
                    console.warn('Recording of', e.data.type, 'failed.');
                    return;
                }

                // at this stage, Firefox MediaRecorder API doesn't allow to choose the output mimeType format!
                var blob = new window.Blob([e.data], {
                    type: e.data.type || self.mimeType || 'audio/ogg' // It specifies the container format as well as the audio and video capture formats.
                });

                // Dispatching OnDataAvailable Handler
                self.ondataavailable(blob);
            };

            mediaRecorder.onstop = function(error) {
                // for video recording on Firefox, it will be fired quickly.
                // because work on VideoFrameContainer is still in progress
                // https://wiki.mozilla.org/Gecko:MediaRecorder

                // self.onstop(error);
            };

            // http://www.w3.org/TR/2012/WD-dom-20121206/#error-names-table
            // showBrowserSpecificIndicator: got neither video nor audio access
            // "VideoFrameContainer" can't be accessed directly; unable to find any wrapper using it.
            // that's why there is no video recording support on firefox

            // video recording fails because there is no encoder available there
            // http://dxr.mozilla.org/mozilla-central/source/content/media/MediaRecorder.cpp#317

            // Maybe "Read Thread" doesn't fire video-track read notification;
            // that's why shutdown notification is received; and "Read Thread" is stopped.

            // https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html#error-handling
            mediaRecorder.onerror = function(error) {
                console.error(error);
                self.start(mTimeSlice);
            };

            mediaRecorder.onwarning = function(warning) {
                console.warn(warning);
            };

            // void start(optional long mTimeSlice)
            // The interval of passing encoded data from EncodedBufferCache to onDataAvailable
            // handler. "mTimeSlice < 0" means Session object does not push encoded data to
            // onDataAvailable, instead, it passive wait the client side pull encoded data
            // by calling requestData API.
            mediaRecorder.start(mTimeSlice);
    };

    var isStopRecording = false;

    this.stop = function() {
        isStopRecording = true;

        if (self.onstop) {
            self.onstop({});
        }
    };

    var isPaused = false;

    this.pause = function() {
        if (!mediaRecorder) {
            return;
        }

        isPaused = true;

        if (mediaRecorder.state === 'recording') {
            mediaRecorder.pause();
        }
    };

    this.resume = function() {
        if (!mediaRecorder) {
            return;
        }

        isPaused = false;

        if (mediaRecorder.state === 'paused') {
            mediaRecorder.resume();
        }
    };

    this.ondataavailable = this.onstop = function() {};

    // Reference to itself
    var self = this;

    if (!self.mimeType && !!mediaStream.getAudioTracks) {
        self.mimeType = mediaStream.getAudioTracks().length && mediaStream.getVideoTracks().length ? 'video/webm' : 'audio/ogg';
    }

    // Reference to "MediaRecorderWrapper" object
    var mediaRecorder;
}


function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Bytes';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}
