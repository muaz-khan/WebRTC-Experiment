// _________________
// StereoRecorder.js

/**
 * StereoRecorder is a standalone class used by {@link RecordRTC} to bring audio-recording in chrome. It runs top over {@link StereoAudioRecorder}.
 * @summary JavaScript standalone object for stereo audio recording.
 * @typedef StereoRecorder
 * @class
 * @example
 * var recorder = new StereoRecorder(MediaStream);
 * recorder.record();
 * recorder.stop(function(blob) {
 *     video.src = URL.createObjectURL(blob);
 * });
 * @param {MediaStream} mediaStream - MediaStream object fetched using getUserMedia API or generated using captureStreamUntilEnded or WebAudio API.
 */

function StereoRecorder(mediaStream) {
    var self = this;

    /**
     * This method records MediaStream.
     * @method
     * @memberof StereoRecorder
     * @example
     * recorder.record();
     */
    this.record = function() {
        mediaRecorder = new StereoAudioRecorder(mediaStream, this);
        mediaRecorder.onAudioProcessStarted = function() {
            if (self.onAudioProcessStarted) {
                self.onAudioProcessStarted();
            }
        };
        mediaRecorder.record();
    };

    /**
     * This method stops recording MediaStream.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof StereoRecorder
     * @example
     * recorder.stop(function(blob) {
     *     video.src = URL.createObjectURL(blob);
     * });
     */
    this.stop = function(callback) {
        if (!mediaRecorder) {
            return;
        }

        mediaRecorder.stop(function() {
            for (var item in mediaRecorder) {
                self[item] = mediaRecorder[item];
            }

            if (callback) {
                callback();
            }
        });
    };

    /**
     * This method pauses the recording process.
     * @method
     * @memberof StereoRecorder
     * @example
     * recorder.pause();
     */
    this.pause = function() {
        if (!mediaRecorder) {
            return;
        }

        mediaRecorder.pause();
    };

    /**
     * This method resumes the recording process.
     * @method
     * @memberof StereoRecorder
     * @example
     * recorder.resume();
     */
    this.resume = function() {
        if (!mediaRecorder) {
            return;
        }

        mediaRecorder.resume();
    };

    // Reference to "StereoAudioRecorder" object
    var mediaRecorder;
}
