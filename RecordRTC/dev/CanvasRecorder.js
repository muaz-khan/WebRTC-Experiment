// _________________
// CanvasRecorder.js

/**
 * CanvasRecorder is a standalone class used by {@link RecordRTC} to bring HTML5-Canvas recording into video WebM. It uses HTML2Canvas library and runs top over {@link Whammy}.
 * @summary HTML2Canvas recording into video WebM.
 * @typedef CanvasRecorder
 * @class
 * @example
 * var recorder = new CanvasRecorder(htmlElement, { disableLogs: true });
 * recorder.record();
 * recorder.stop(function(blob) {
 *     video.src = URL.createObjectURL(blob);
 * });
 * @param {HTMLElement} htmlElement - querySelector/getElementById/getElementsByTagName[0]/etc.
 * @param {object} config - {disableLogs:true, initCallback: function}
 */

function CanvasRecorder(htmlElement, config) {
    if (typeof html2canvas === 'undefined') {
        throw 'Please link: //cdn.webrtc-experiment.com/screenshot.js';
    }

    config = config || {};

    var isRecording;

    /**
     * This method records Canvas.
     * @method
     * @memberof CanvasRecorder
     * @example
     * recorder.record();
     */
    this.record = function() {
        isRecording = true;
        whammy.frames = [];
        drawCanvasFrame();

        if (config.initCallback) {
            config.initCallback();
        }
    };

    /**
     * This method stops recording Canvas.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof CanvasRecorder
     * @example
     * recorder.stop(function(blob) {
     *     video.src = URL.createObjectURL(blob);
     * });
     */
    this.stop = function(callback) {
        isRecording = false;

        var that = this;

        /**
         * @property {Blob} blob - Recorded frames in video/webm blob.
         * @memberof CanvasRecorder
         * @example
         * recorder.stop(function() {
         *     var blob = recorder.blob;
         * });
         */
        whammy.compile(function(blob) {
            that.blob = blob;

            if (that.blob.forEach) {
                that.blob = new Blob([], {
                    type: 'video/webm'
                });
            }

            if (callback) {
                callback(that.blob);
            }

            whammy.frames = [];
        });
    };

    var isPausedRecording = false;

    /**
     * This method pauses the recording process.
     * @method
     * @memberof CanvasRecorder
     * @example
     * recorder.pause();
     */
    this.pause = function() {
        isPausedRecording = true;

        if (!config.disableLogs) {
            console.debug('Paused recording.');
        }
    };

    /**
     * This method resumes the recording process.
     * @method
     * @memberof CanvasRecorder
     * @example
     * recorder.resume();
     */
    this.resume = function() {
        isPausedRecording = false;

        if (!config.disableLogs) {
            console.debug('Resumed recording.');
        }
    };

    /**
     * This method resets currently recorded data.
     * @method
     * @memberof CanvasRecorder
     * @example
     * recorder.clearRecordedData();
     */
    this.clearRecordedData = function() {
        this.pause();

        whammy.frames = [];

        if (!config.disableLogs) {
            console.debug('Cleared old recorded data.');
        }
    };

    function drawCanvasFrame() {
        if (isPausedRecording) {
            lastTime = new Date().getTime();
            return setTimeout(drawCanvasFrame, 100);
        }

        html2canvas(htmlElement, {
            onrendered: function(canvas) {
                var duration = new Date().getTime() - lastTime;
                if (!duration) {
                    return drawCanvasFrame();
                }

                // via #206, by Jack i.e. @Seymourr
                lastTime = new Date().getTime();

                whammy.frames.push({
                    duration: duration,
                    image: canvas.toDataURL('image/webp')
                });

                if (isRecording) {
                    setTimeout(drawCanvasFrame, 0);
                }
            }
        });
    }

    var lastTime = new Date().getTime();

    var whammy = new Whammy.Video(100);
}
