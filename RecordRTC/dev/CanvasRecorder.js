// _________________
// CanvasRecorder.js

/**
 * CanvasRecorder is a standalone class used by {@link RecordRTC} to bring HTML5-Canvas recording into video WebM. It uses HTML2Canvas library and runs top over {@link Whammy}.
 * @summary HTML2Canvas recording into video WebM.
 * @typedef CanvasRecorder
 * @class
 * @example
 * var recorder = new CanvasRecorder(htmlElement);
 * recorder.record();
 * recorder.stop(function(blob) {
 *     video.src = URL.createObjectURL(blob);
 * });
 * @param {HTMLElement} htmlElement - querySelector/getElementById/getElementsByTagName[0]/etc.
 */

function CanvasRecorder(htmlElement) {
    if (!window.html2canvas) {
        throw 'Please link: //cdn.webrtc-experiment.com/screenshot.js';
    }

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

        if (!this.disableLogs) {
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

        if (!this.disableLogs) {
            console.debug('Resumed recording.');
        }
    };

    function drawCanvasFrame() {
        if (isPausedRecording) {
            lastTime = new Date().getTime();
            return setTimeout(drawCanvasFrame, 100);
        }

        window.html2canvas(htmlElement, {
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
                    requestAnimationFrame(drawCanvasFrame);
                }
            }
        });
    }

    var lastTime = new Date().getTime();

    var whammy = new Whammy.Video(100);
}
