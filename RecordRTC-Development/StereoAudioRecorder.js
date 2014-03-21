// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC

// source code from: http://typedarray.org/wp-content/projects/WebAudioRecorder/script.js
// https://github.com/mattdiamond/Recorderjs#license-mit
// ______________________
// StereoAudioRecorder.js

// In Chrome, when the javascript node is out of scope, the onaudioprocess callback stops firing. 
// This leads to audio being significantly shorter than the generated video.
var __stereoAudioRecorderJavacriptNode;

function StereoAudioRecorder(mediaStream, root) {
    // variables
    var leftchannel = [];
    var rightchannel = [];
    var recording = false;
    var recordingLength = 0;

    this.record = function() {
        recording = true;
        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = 0;
        recordingLength = 0;
    };

    this.stop = function() {
        // stop recording
        recording = false;

        // flat the left and right channels down
        var leftBuffer = mergeBuffers(leftchannel, recordingLength);
        var rightBuffer = mergeBuffers(rightchannel, recordingLength);

        // interleave both channels together
        var interleaved = interleave(leftBuffer, rightBuffer);

        // create our wav file
        var buffer = new ArrayBuffer(44 + interleaved.length * 2);
        var view = new DataView(buffer);

        // RIFF chunk descriptor
        writeUTFBytes(view, 0, 'RIFF');
        view.setUint32(4, 44 + interleaved.length * 2, true);
        writeUTFBytes(view, 8, 'WAVE');

        // FMT sub-chunk
        writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);

        // stereo (2 channels)
        view.setUint16(22, 2, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 4, true);
        view.setUint16(32, 4, true);
        view.setUint16(34, 16, true);

        // data sub-chunk
        writeUTFBytes(view, 36, 'data');
        view.setUint32(40, interleaved.length * 2, true);

        // write the PCM samples
        var lng = interleaved.length;
        var index = 44;
        volume = 1;
        for (var i = 0; i < lng; i++) {
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }

        // final binary blob
        this.recordedBlob = new Blob([view], { type: 'audio/wav' });

        // recorded audio length
        this.length = recordingLength;
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

    // creates the audio context
    var audioContext = Storage.AudioContext;

    if (!Storage.AudioContextConstructor)
        Storage.AudioContextConstructor = new audioContext();

    var context = Storage.AudioContextConstructor;

    // creates a gain node
    if (!Storage.VolumeGainNode)
        Storage.VolumeGainNode = context.createGain();

    var volume = Storage.VolumeGainNode;

    // creates an audio node from the microphone incoming stream
    if (!Storage.AudioInput)
        Storage.AudioInput = context.createMediaStreamSource(mediaStream);

    var audioInput = Storage.AudioInput;

    // connect the stream to the gain node
    audioInput.connect(volume);

    // From the spec: This value controls how frequently the audioprocess event is 
    // dispatched and how many sample-frames need to be processed each call. 
    // Lower values for buffer size will result in a lower (better) latency. 
    // Higher values will be necessary to avoid audio breakup and glitches

    // bug: how to minimize wav size?
    // workaround? obviously ffmpeg!

    // The size of the buffer (in sample-frames) which needs to 
    // be processed each time onprocessaudio is called. 
    // Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384). 
    var legalBufferValues = [256, 512, 1024, 2048, 4096, 8192, 16384];
    var bufferSize = root.bufferSize || 4096;

    if (legalBufferValues.indexOf(bufferSize) == -1) {
        throw 'Legal values for buffer-size are ' + JSON.stringify(legalBufferValues, null, '\t');
    }

    // The sample rate (in sample-frames per second) at which the 
    // AudioContext handles audio. It is assumed that all AudioNodes 
    // in the context run at this rate. In making this assumption, 
    // sample-rate converters or "varispeed" processors are not supported 
    // in real-time processing.

    // The sampleRate parameter describes the sample-rate of the 
    // linear PCM audio data in the buffer in sample-frames per second. 
    // An implementation must support sample-rates in at least 
    // the range 22050 to 96000.
    var sampleRate = root.sampleRate || context.sampleRate || 44100;

    if (sampleRate < 22050 || sampleRate > 96000) {
        throw 'sample-rate must be under range 22050 and 96000.';
    }

    console.log('sample-rate', sampleRate);
    console.log('buffer-size', bufferSize);

    if (context.createJavaScriptNode) {
        __stereoAudioRecorderJavacriptNode = context.createJavaScriptNode(bufferSize, 2, 2);
    } else if (context.createScriptProcessor) {
        __stereoAudioRecorderJavacriptNode = context.createScriptProcessor(bufferSize, 2, 2);
    } else {
        throw 'WebAudio API has no support on this browser.';
    }

    __stereoAudioRecorderJavacriptNode.onaudioprocess = function(e) {
        if (!recording) return;

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
