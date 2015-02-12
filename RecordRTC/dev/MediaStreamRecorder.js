// ______________________
// MediaStreamRecorder.js

// todo: need to show alert boxes for incompatible cases
// encoder only supports 48k/16k mono audio channel

/*
 * Implementation of https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html
 * The MediaRecorder accepts a mediaStream as input source passed from UA. When recorder starts,
 * a MediaEncoder will be created and accept the mediaStream as input source.
 * Encoder will get the raw data by track data changes, encode it by selected MIME Type, then store the encoded in EncodedBufferCache object.
 * The encoded data will be extracted on every timeslice passed from Start function call or by RequestData function.
 * Thread model:
 * When the recorder starts, it creates a "Media Encoder" thread to read data from MediaEncoder object and store buffer in EncodedBufferCache object.
 * Also extract the encoded data and create blobs on every timeslice passed from start function or RequestData function called by UA.
 */

/**
 * MediaStreamRecorder is an abstraction layer for "MediaRecorder API". It is used by {@link RecordRTC} to record MediaStream(s) in Firefox.
 * @summary Runs top over MediaRecorder API.
 * @typedef MediaStreamRecorder
 * @class
 * @example
 * var recorder = new MediaStreamRecorder(MediaStream);
 * recorder.mimeType = 'video/webm'; // audio/ogg or video/webm
 * recorder.record();
 * recorder.stop(function(blob) {
 *     video.src = URL.createObjectURL(blob);
 *
 *     // or
 *     var blob = recorder.blob;
 * });
 * @param {MediaStream} mediaStream - MediaStream object fetched using getUserMedia API or generated using captureStreamUntilEnded or WebAudio API.
 */

function MediaStreamRecorder(mediaStream) {
    var self = this;

    // if user chosen only audio option; and he tried to pass MediaStream with
    // both audio and video tracks;
    // using a dirty workaround to generate audio-only stream so that we can get audio/ogg output.
    if (self.mimeType && self.mimeType !== 'video/webm' && mediaStream.getVideoTracks && mediaStream.getVideoTracks().length) {
        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(mediaStream);

        var destination = context.createMediaStreamDestination();
        mediaStreamSource.connect(destination);

        mediaStream = destination.stream;
    }

    var dataAvailable = false;

    /**
     * This method records MediaStream.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.record();
     */
    this.record = function() {
        // http://dxr.mozilla.org/mozilla-central/source/content/media/MediaRecorder.cpp
        // https://wiki.mozilla.org/Gecko:MediaRecorder
        // https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html

        // starting a recording session; which will initiate "Reading Thread"
        // "Reading Thread" are used to prevent main-thread blocking scenarios
        mediaRecorder = new window.MediaRecorder(mediaStream);

        // Dispatching OnDataAvailable Handler
        mediaRecorder.ondataavailable = function(e) {
            if (dataAvailable) {
                return;
            }

            if (!e.data.size) {
                if (!self.disableLogs) {
                    console.warn('Recording of', e.data.type, 'failed.');
                }
                return;
            }

            dataAvailable = true;

            /**
             * @property {Blob} blob - Recorded frames in video/webm blob.
             * @memberof MediaStreamRecorder
             * @example
             * recorder.stop(function() {
             *     var blob = recorder.blob;
             * });
             */
            self.blob = new Blob([e.data], {
                type: e.data.type || self.mimeType || 'audio/ogg'
            });

            if (self.callback) {
                self.callback();
            }
        };

        mediaRecorder.onerror = function(error) {
            if (!self.disableLogs) {
                console.warn(error);
            }

            // When the stream is "ended" set recording to 'inactive' 
            // and stop gathering data. Callers should not rely on 
            // exactness of the timeSlice value, especially 
            // if the timeSlice value is small. Callers should 
            // consider timeSlice as a minimum value

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

        if (self.onAudioProcessStarted) {
            self.onAudioProcessStarted();
        }
    };

    /**
     * This method stops recording MediaStream.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.stop(function(blob) {
     *     video.src = URL.createObjectURL(blob);
     * });
     */
    this.stop = function(callback) {
        if (!mediaRecorder) {
            return;
        }

        this.callback = callback;
        // mediaRecorder.state === 'recording' means that media recorder is associated with "session"
        // mediaRecorder.state === 'stopped' means that media recorder is detached from the "session" ... in this case; "session" will also be deleted.

        if (mediaRecorder.state === 'recording') {
            // "stop" method auto invokes "requestData"!
            // mediaRecorder.requestData();
            mediaRecorder.stop();
        }
    };

    /**
     * This method pauses the recording process.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.pause();
     */
    this.pause = function() {
        if (!mediaRecorder) {
            return;
        }

        if (mediaRecorder.state === 'recording') {
            mediaRecorder.pause();

            if (!this.disableLogs) {
                console.debug('Paused recording.');
            }
        }
    };

    /**
     * This method resumes the recording process.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.resume();
     */
    this.resume = function() {
        if (!mediaRecorder) {
            return;
        }

        if (mediaRecorder.state === 'paused') {
            mediaRecorder.resume();

            if (!this.disableLogs) {
                console.debug('Resumed recording.');
            }
        }
    };

    // Reference to "MediaRecorder" object
    var mediaRecorder;
}
