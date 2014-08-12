// ======================
// StereoAudioRecorder.js

// source code from: http://typedarray.org/wp-content/projects/WebAudioRecorder/script.js

function StereoAudioRecorder(mediaStream, root) {
    // variables
    var leftchannel = [];
    var rightchannel = [];
    var scriptprocessornode;
    var recording = false;
    var recordingLength = 0;
    var volume;
    var audioInput;
    var sampleRate = 44100;
    var audioContext;
    var context;

    this.record = function() {
        recording = true;
        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = 0;
        recordingLength = 0;
    };
    
    this.requestData = function() {
        if(recordingLength == 0) {
            requestDataInvoked = false;
            return;
        }
        
        requestDataInvoked = true;
        // clone stuff
        var internal_leftchannel = leftchannel.slice(0);
        var internal_rightchannel = rightchannel.slice(0);
        var internal_recordingLength = recordingLength;
        
        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = [];
        recordingLength = 0;
        requestDataInvoked = false;
        
        // we flat the left and right channels down
        var leftBuffer = mergeBuffers(internal_leftchannel, internal_recordingLength);
        var rightBuffer = mergeBuffers(internal_leftchannel, internal_recordingLength);
        
        // we interleave both channels together
        var interleaved = interleave(leftBuffer, rightBuffer);

        // we create our wav file
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
        var volume = 1;
        for (var i = 0; i < lng; i++) {
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }

        // our final binary blob
        var blob = new Blob([view], { type: 'audio/wav' });

        root.ondataavailable(blob);
    };

    this.stop = function() {
        // we stop recording
        recording = false;
        this.requestData();
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

    function mergeBuffers(channelBuffer, recordingLength) {
        var result = new Float32Array(recordingLength);
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
    
    // creates the audio context
    var audioContext = ObjectStore.AudioContext;

    if (!ObjectStore.AudioContextConstructor)
        ObjectStore.AudioContextConstructor = new audioContext();

    var context = ObjectStore.AudioContextConstructor;

    // creates a gain node
    if (!ObjectStore.VolumeGainNode)
        ObjectStore.VolumeGainNode = context.createGain();

    var volume = ObjectStore.VolumeGainNode;

    // creates an audio node from the microphone incoming stream
    if (!ObjectStore.AudioInput)
        ObjectStore.AudioInput = context.createMediaStreamSource(mediaStream);

    // creates an audio node from the microphone incoming stream
    var audioInput = ObjectStore.AudioInput;
    
    // connect the stream to the gain node
    audioInput.connect(volume);

    /* From the spec: This value controls how frequently the audioprocess event is
    dispatched and how many sample-frames need to be processed each call.
    Lower values for buffer size will result in a lower (better) latency.
    Higher values will be necessary to avoid audio breakup and glitches 
    Legal values are 256, 512, 1024, 2048, 4096, 8192, and 16384.*/
    var bufferSize = 2048;
    if (context.createJavaScriptNode) {
        scriptprocessornode = context.createJavaScriptNode(bufferSize, 2, 2);
    } else if (context.createScriptProcessor) {
        scriptprocessornode = context.createScriptProcessor(bufferSize, 2, 2);
    } else {
        throw 'WebAudio API has no support on this browser.';
    }

    var requestDataInvoked = false;
    
    // sometimes "scriptprocessornode" disconnects from he destination-node
    // and there is no exception thrown in this case.
    // and obviously no further "ondataavailable" events will be emitted.
    // below global-scope variable is added to debug such unexpected but "rare" cases.
    window.scriptprocessornode = scriptprocessornode;
    
    // http://webaudio.github.io/web-audio-api/#the-scriptprocessornode-interface
    scriptprocessornode.onaudioprocess = function(e) {
        if (!recording || requestDataInvoked) return;
        
        var left = e.inputBuffer.getChannelData(0);
        var right = e.inputBuffer.getChannelData(1);
        // we clone the samples
        leftchannel.push(new Float32Array(left));
        rightchannel.push(new Float32Array(right));
        recordingLength += bufferSize;
    };
    
    volume.connect(scriptprocessornode);
    scriptprocessornode.connect(context.destination);
}
