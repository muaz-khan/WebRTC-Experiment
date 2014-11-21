// source code from: http://typedarray.org/wp-content/projects/WebAudioRecorder/script.js
// https://github.com/mattdiamond/Recorderjs#license-mit
// ______________________
// StereoAudioRecorder.js

/**
 * StereoAudioRecorder is a standalone class used by RecordRTC to bring "stereo" audio-recording in chrome.
 * @summary JavaScript standalone object for stereo audio recording.
 * @typedef StereoAudioRecorder
 * @class
 * @example
 * var recorder = new StereoAudioRecorder(MediaStream, {
 *     sampleRate: 44100,
 *     bufferSize: 4096
 * });
 * recorder.record();
 * recorder.stop(function(blob) {
 *     video.src = URL.createObjectURL(blob);
 * });
 * @param {MediaStream} mediaStream - MediaStream object fetched using getUserMedia API or generated using captureStreamUntilEnded or WebAudio API.
 * @param {object} config - {sampleRate: 44100, bufferSize: 4096}
 */

var __stereoAudioRecorderJavacriptNode;

function StereoAudioRecorder(mediaStream, config) {
    if (!mediaStream.getAudioTracks().length) {
        throw 'Your stream has no audio tracks.';
    }

    // variables
    var leftchannel = [];
    var rightchannel = [];
    var recording = false;
    var recordingLength = 0;

    /**
     * This method records MediaStream.
     * @method
     * @memberof StereoAudioRecorder
     * @example
     * recorder.record();
     */
    this.record = function() {
        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = 0;
        recordingLength = 0;

        recording = true;
    };

    /**
     * This method stops recording MediaStream.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof StereoAudioRecorder
     * @example
     * recorder.stop(function(blob) {
     *     video.src = URL.createObjectURL(blob);
     * });
     */
    this.stop = function(callback) {
        // stop recording
        recording = false;

        // to make sure onaudioprocess stops firing
        audioInput.disconnect();
        volume.disconnect();

        // flat the left and right channels down
        var leftBuffer = mergeBuffers(leftchannel, recordingLength);
        var rightBuffer = mergeBuffers(rightchannel, recordingLength);

        // interleave both channels together
        var interleaved = interleave(leftBuffer, rightBuffer);

        // create our wav file
        var buffer = new ArrayBuffer(44 + interleaved.length * 2);

        var view = new DataView(buffer);

        // RIFF chunk descriptor/identifier 
        writeUTFBytes(view, 0, 'RIFF');

        // RIFF chunk length
        // view.setUint32(4, 44 + interleaved.length * 2, true);
        view.setUint32(4, 36 + interleaved.length * 2, true);

        // RIFF type 
        writeUTFBytes(view, 8, 'WAVE');

        // format chunk identifier 
        // FMT sub-chunk
        writeUTFBytes(view, 12, 'fmt ');

        // format chunk length 
        view.setUint32(16, 16, true);

        // sample format (raw)
        view.setUint16(20, 1, true);

        // stereo (2 channels)
        view.setUint16(22, 2, true);

        // sample rate 
        view.setUint32(24, sampleRate, true);

        // byte rate (sample rate * block align) 
        view.setUint32(28, sampleRate * 4, true);

        // block align (channel count * bytes per sample) 
        view.setUint16(32, 4, true);

        // bits per sample 
        view.setUint16(34, 16, true);

        // data sub-chunk
        // data chunk identifier 
        writeUTFBytes(view, 36, 'data');

        // data chunk length 
        view.setUint32(40, interleaved.length * 2, true);

        // write the PCM samples
        var offset = 44;
        for (var i = 0; i < interleaved.length; i++, offset += 2) {
            var s = Math.max(-1, Math.min(1, interleaved[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        /**
         * @property {Blob} blob - The recorded blob object.
         * @memberof StereoAudioRecorder
         * @example
         * recorder.stop(function(){
         *     var blob = recorder.blob;
         * });
         */
        this.blob = new Blob([view], {
            type: 'audio/wav'
        });

        /**
         * @property {ArrayBuffer} buffer - The recorded buffer object.
         * @memberof StereoAudioRecorder
         * @example
         * recorder.stop(function(){
         *     var buffer = recorder.buffer;
         * });
         */
        this.buffer = new ArrayBuffer(view);

        /**
         * @property {DataView} view - The recorded data-view object.
         * @memberof StereoAudioRecorder
         * @example
         * recorder.stop(function(){
         *     var view = recorder.view;
         * });
         */
        this.view = view;

        this.sampleRate = sampleRate;
        this.bufferSize = bufferSize;

        // recorded audio length
        this.length = recordingLength;

        callback();

        isAudioProcessStarted = false;
    };

    function interleave(leftChannel, rightChannel) {
        var length = leftChannel.length + rightChannel.length;
        var result = new Float32Array(length);

        var inputIndex = 0;

        for (var index = 0; index < length;) {
            result[index++] = leftChannel[inputIndex];
            result[index++] = rightChannel[inputIndex];
            inputIndex++;
        }
        return result;
    }

    function mergeBuffers(channelBuffer, rLength) {
        var result = new Float32Array(rLength);
        var offset = 0;
        var lng = channelBuffer.length;
        for (var i = 0; i < lng; i++) {
            var buffer = channelBuffer[i];
            result.set(buffer, offset);
            offset += buffer.length;
        }
        return result;
    }

    function writeUTFBytes(view, offset, string) {
        var lng = string.length;
        for (var i = 0; i < lng; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    if (!Storage.AudioContextConstructor) {
        Storage.AudioContextConstructor = new Storage.AudioContext();
    }

    var context = Storage.AudioContextConstructor;

    // creates a gain node
    var volume = context.createGain();

    // creates an audio node from the microphone incoming stream
    var audioInput = context.createMediaStreamSource(mediaStream);

    // connect the stream to the gain node
    audioInput.connect(volume);

    var legalBufferValues = [256, 512, 1024, 2048, 4096, 8192, 16384];

    /**
     * From the spec: This value controls how frequently the audioprocess event is
     * dispatched and how many sample-frames need to be processed each call.
     * Lower values for buffer size will result in a lower (better) latency.
     * Higher values will be necessary to avoid audio breakup and glitches
     * The size of the buffer (in sample-frames) which needs to
     * be processed each time onprocessaudio is called.
     * Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384).
     * @property {number} bufferSize - Buffer-size for how frequently the audioprocess event is dispatched.
     * @memberof StereoAudioRecorder
     * @example
     * recorder = new StereoAudioRecorder(mediaStream, {
     *     bufferSize: 4096
     * });
     */

    // "0" means, let chrome decide the most accurate buffer-size for current platform.
    var bufferSize = config.bufferSize || 4096;

    if (legalBufferValues.indexOf(bufferSize) === -1) {
        // throw 'Legal values for buffer-size are ' + JSON.stringify(legalBufferValues, null, '\t');
    }


    /**
     * The sample rate (in sample-frames per second) at which the
     * AudioContext handles audio. It is assumed that all AudioNodes
     * in the context run at this rate. In making this assumption,
     * sample-rate converters or "varispeed" processors are not supported
     * in real-time processing.
     * The sampleRate parameter describes the sample-rate of the
     * linear PCM audio data in the buffer in sample-frames per second.
     * An implementation must support sample-rates in at least
     * the range 22050 to 96000.
     * @property {number} sampleRate - Buffer-size for how frequently the audioprocess event is dispatched.
     * @memberof StereoAudioRecorder
     * @example
     * recorder = new StereoAudioRecorder(mediaStream, {
     *     sampleRate: 44100
     * });
     */
    var sampleRate = config.sampleRate || context.sampleRate || 44100;

    if (sampleRate < 22050 || sampleRate > 96000) {
        // Ref: http://stackoverflow.com/a/26303918/552182
        // throw 'sample-rate must be under range 22050 and 96000.';
    }

    if (context.createJavaScriptNode) {
        __stereoAudioRecorderJavacriptNode = context.createJavaScriptNode(bufferSize, 2, 2);
    } else if (context.createScriptProcessor) {
        __stereoAudioRecorderJavacriptNode = context.createScriptProcessor(bufferSize, 2, 2);
    } else {
        throw 'WebAudio API has no support on this browser.';
    }

    bufferSize = __stereoAudioRecorderJavacriptNode.bufferSize;

    console.log('sample-rate', sampleRate);
    console.log('buffer-size', bufferSize);

    var isAudioProcessStarted = false,
        self = this;
    __stereoAudioRecorderJavacriptNode.onaudioprocess = function(e) {
        // if MediaStream().stop() or MediaStreamTrack.stop() is invoked.
        if (mediaStream.ended) {
            __stereoAudioRecorderJavacriptNode.onaudioprocess = function() {};
            return;
        }

        if (!recording) {
            return;
        }

        /**
         * This method is called on "onaudioprocess" event's first invocation.
         * @method {function} onAudioProcessStarted
         * @memberof StereoAudioRecorder
         * @example
         * recorder.onAudioProcessStarted: function() { };
         */
        if (!isAudioProcessStarted) {
            isAudioProcessStarted = true;
            if (self.onAudioProcessStarted) {
                self.onAudioProcessStarted();
            }
        }

        var left = e.inputBuffer.getChannelData(0);
        var right = e.inputBuffer.getChannelData(1);

        // we clone the samples
        leftchannel.push(new Float32Array(left));
        rightchannel.push(new Float32Array(right));

        recordingLength += bufferSize;
    };

    // we connect the recorder
    volume.connect(__stereoAudioRecorderJavacriptNode);

    // to prevent self audio to be connected with speakers
    __stereoAudioRecorderJavacriptNode.connect(context.destination);
}
