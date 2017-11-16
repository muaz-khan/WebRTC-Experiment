// ==================
// MediaRecorder.js

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

function MediaRecorderWrapper(mediaStream) {
    var self = this;

    /**
     * This method records MediaStream.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.start(5000);
     */
    this.start = function(timeSlice, __disableLogs) {
        this.timeSlice = timeSlice || 5000;

        if (!self.mimeType) {
            self.mimeType = 'video/webm';
        }

        if (self.mimeType.indexOf('audio') !== -1) {
            if (mediaStream.getVideoTracks().length && mediaStream.getAudioTracks().length) {
                var stream;
                if (!!navigator.mozGetUserMedia) {
                    stream = new MediaStream();
                    stream.addTrack(mediaStream.getAudioTracks()[0]);
                } else {
                    // webkitMediaStream
                    stream = new MediaStream(mediaStream.getAudioTracks());
                }
                mediaStream = stream;
            }
        }

        if (self.mimeType.indexOf('audio') !== -1) {
            self.mimeType = IsChrome ? 'audio/webm' : 'audio/ogg';
        }

        self.dontFireOnDataAvailableEvent = false;

        var recorderHints = {
            mimeType: self.mimeType
        };

        if (!self.disableLogs && !__disableLogs) {
            console.log('Passing following params over MediaRecorder API.', recorderHints);
        }

        if (mediaRecorder) {
            // mandatory to make sure Firefox doesn't fails to record streams 3-4 times without reloading the page.
            mediaRecorder = null;
        }

        if (IsChrome && !isMediaRecorderCompatible()) {
            // to support video-only recording on stable
            recorderHints = 'video/vp8';
        }

        // http://dxr.mozilla.org/mozilla-central/source/content/media/MediaRecorder.cpp
        // https://wiki.mozilla.org/Gecko:MediaRecorder
        // https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html

        // starting a recording session; which will initiate "Reading Thread"
        // "Reading Thread" are used to prevent main-thread blocking scenarios
        try {
            mediaRecorder = new MediaRecorder(mediaStream, recorderHints);
        } catch (e) {
            // if someone passed NON_supported mimeType
            // or if Firefox on Android
            mediaRecorder = new MediaRecorder(mediaStream);
        }

        if ('canRecordMimeType' in mediaRecorder && mediaRecorder.canRecordMimeType(self.mimeType) === false) {
            if (!self.disableLogs) {
                console.warn('MediaRecorder API seems unable to record mimeType:', self.mimeType);
            }
        }

        // i.e. stop recording when <video> is paused by the user; and auto restart recording 
        // when video is resumed. E.g. yourStream.getVideoTracks()[0].muted = true; // it will auto-stop recording.
        if (self.ignoreMutedMedia === true) {
            mediaRecorder.ignoreMutedMedia = true;
        }

        var firedOnDataAvailableOnce = false;

        // Dispatching OnDataAvailable Handler
        mediaRecorder.ondataavailable = function(e) {
            // how to fix FF-corrupt-webm issues?
            // should we leave this?          e.data.size < 26800
            if (!e.data || !e.data.size || e.data.size < 26800 || firedOnDataAvailableOnce) {
                return;
            }

            firedOnDataAvailableOnce = true;

            var blob = self.getNativeBlob ? e.data : new Blob([e.data], {
                type: self.mimeType || 'video/webm'
            });

            self.ondataavailable(blob);

            // self.dontFireOnDataAvailableEvent = true;

            if (!!mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
            mediaRecorder = null;

            if (self.dontFireOnDataAvailableEvent) {
                return;
            }

            // record next interval
            self.start(timeSlice, '__disableLogs');
        };

        mediaRecorder.onerror = function(error) {
            if (!self.disableLogs) {
                if (error.name === 'InvalidState') {
                    console.error('The MediaRecorder is not in a state in which the proposed operation is allowed to be executed.');
                } else if (error.name === 'OutOfMemory') {
                    console.error('The UA has exhaused the available memory. User agents SHOULD provide as much additional information as possible in the message attribute.');
                } else if (error.name === 'IllegalStreamModification') {
                    console.error('A modification to the stream has occurred that makes it impossible to continue recording. An example would be the addition of a Track while recording is occurring. User agents SHOULD provide as much additional information as possible in the message attribute.');
                } else if (error.name === 'OtherRecordingError') {
                    console.error('Used for an fatal error other than those listed above. User agents SHOULD provide as much additional information as possible in the message attribute.');
                } else if (error.name === 'GenericError') {
                    console.error('The UA cannot provide the codec or recording option that has been requested.', error);
                } else {
                    console.error('MediaRecorder Error', error);
                }
            }

            // When the stream is "ended" set recording to 'inactive' 
            // and stop gathering data. Callers should not rely on 
            // exactness of the timeSlice value, especially 
            // if the timeSlice value is small. Callers should 
            // consider timeSlice as a minimum value

            if (!!mediaRecorder && mediaRecorder.state !== 'inactive' && mediaRecorder.state !== 'stopped') {
                mediaRecorder.stop();
            }
        };

        // void start(optional long mTimeSlice)
        // The interval of passing encoded data from EncodedBufferCache to onDataAvailable
        // handler. "mTimeSlice < 0" means Session object does not push encoded data to
        // onDataAvailable, instead, it passive wait the client side pull encoded data
        // by calling requestData API.
        try {
            mediaRecorder.start(3.6e+6);
        } catch (e) {
            mediaRecorder = null;
        }

        setTimeout(function() {
            if (!mediaRecorder) {
                return;
            }

            if (mediaRecorder.state === 'recording') {
                // "stop" method auto invokes "requestData"!
                mediaRecorder.requestData();
                // mediaRecorder.stop();
            }
        }, timeSlice);

        // Start recording. If timeSlice has been provided, mediaRecorder will
        // raise a dataavailable event containing the Blob of collected data on every timeSlice milliseconds.
        // If timeSlice isn't provided, UA should call the RequestData to obtain the Blob data, also set the mTimeSlice to zero.
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

        // mediaRecorder.state === 'recording' means that media recorder is associated with "session"
        // mediaRecorder.state === 'stopped' means that media recorder is detached from the "session" ... in this case; "session" will also be deleted.

        if (mediaRecorder.state === 'recording') {
            // "stop" method auto invokes "requestData"!
            mediaRecorder.requestData();

            setTimeout(function() {
                self.dontFireOnDataAvailableEvent = true;
                if (!!mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
                mediaRecorder = null;
                self.onstop();
            }, 2000);
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
        }

        this.dontFireOnDataAvailableEvent = true;
    };

    /**
     * The recorded blobs are passed over this event.
     * @event
     * @memberof MediaStreamRecorder
     * @example
     * recorder.ondataavailable = function(data) {};
     */
    this.ondataavailable = function(blob) {
        console.log('recorded-blob', blob);
    };

    /**
     * This method resumes the recording process.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.resume();
     */
    this.resume = function() {
        if (this.dontFireOnDataAvailableEvent) {
            this.dontFireOnDataAvailableEvent = false;

            var disableLogs = self.disableLogs;
            self.disableLogs = true;
            this.start(this.timeslice || 5000);
            self.disableLogs = disableLogs;
            return;
        }

        if (!mediaRecorder) {
            return;
        }

        if (mediaRecorder.state === 'paused') {
            mediaRecorder.resume();
        }
    };

    /**
     * This method resets currently recorded data.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.clearRecordedData();
     */
    this.clearRecordedData = function() {
        if (!mediaRecorder) {
            return;
        }

        this.pause();

        this.dontFireOnDataAvailableEvent = true;
        this.stop();
    };

    this.onstop = function() {};

    // Reference to "MediaRecorder" object
    var mediaRecorder;

    function isMediaStreamActive() {
        if ('active' in mediaStream) {
            if (!mediaStream.active) {
                return false;
            }
        } else if ('ended' in mediaStream) { // old hack
            if (mediaStream.ended) {
                return false;
            }
        }
        return true;
    }

    // this method checks if media stream is stopped
    // or any track is ended.
    (function looper() {
        if (!mediaRecorder) {
            return;
        }

        if (isMediaStreamActive() === false) {
            self.stop();
            return;
        }

        setTimeout(looper, 1000); // check every second
    })();
}

if (typeof MediaStreamRecorder !== 'undefined') {
    MediaStreamRecorder.MediaRecorderWrapper = MediaRecorderWrapper;
}
