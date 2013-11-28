// Muaz Khan     - https://github.com/muaz-khan 
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC
// ____________
// RecordRTC.js

/*
	need to fix:
	1. chrome tabCapture and audio/video recording
	2. ffmpeg/avconv to merge webm/wav (sync time of both wav and webm)
	3. longer video issues
	4. longer audio issues
*/

function RecordRTC(mediaStream, config) {
    config = config || { };

    if (!mediaStream) throw 'MediaStream is mandatory.';
    if (!config.type) config.type = 'audio';

    function startRecording() {
        console.debug('started recording stream.');

        // Media Stream Recording API has not been implemented in chrome yet;
        // That's why using WebAudio API to record stereo audio in WAV format
        var Recorder = IsChrome ? window.StereoRecorder : window.MediaStreamRecorder;

        // video recorder (in WebM format)
        if (config.type == 'video') Recorder = window.WhammyRecorder;

        // video recorder (in Gif format)
        if (config.type == 'gif') Recorder = window.GifRecorder;

        mediaRecorder = new Recorder(mediaStream);

        // Merge all data-types except "function"
        mediaRecorder = mergeProps(mediaRecorder, config);

        mediaRecorder.record();
    }

    function stopRecording(callback) {
        console.warn('stopped recording stream.');
        mediaRecorder.stop();
        if (callback && mediaRecorder) {
            var url = URL.createObjectURL(mediaRecorder.recordedBlob);
            callback(url);
        }
    }

    var mediaRecorder;

    return {
        startRecording: startRecording,
        stopRecording: stopRecording,
        getBlob: function() {
            if (!mediaRecorder) return console.warn('RecordRTC is idle.');
            return mediaRecorder.recordedBlob;
        },
        getDataURL: function(callback) {
            if (!mediaRecorder) return console.warn('RecordRTC is idle.');

            var reader = new FileReader();
            reader.readAsDataURL(mediaRecorder.recordedBlob);
            reader.onload = function(event) {
                if (callback) callback(event.target.result);
            };
        },
        toURL: function() {
            if (!mediaRecorder) return console.warn('RecordRTC is idle.');
            return URL.createObjectURL(mediaRecorder.recordedBlob);
        },
        save: function() {
            if (!mediaRecorder) return console.warn('RecordRTC is idle.');
            console.log('saving recorded stream to disk!');
            // bug: should we use "getBlob" instead; to handle aww-snaps!
            this.getDataURL(function(dataURL) {
                var hyperlink = document.createElement('a');
                hyperlink.href = dataURL;
                hyperlink.target = '_blank';
                hyperlink.download = (Math.round(Math.random() * 9999999999) + 888888888) + '.' + mediaRecorder.recordedBlob.type.split('/')[1];

                var evt = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });

                hyperlink.dispatchEvent(evt);

                (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
            });
        }
    };
}

// __________________________
// Cross-Browser Declarations

// animation-frame used in WebM recording
requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
cancelAnimationFrame = window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;

// WebAudio API representer
AudioContext = window.webkitAudioContext || window.mozAudioContext;

URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

if (window.webkitMediaStream) window.MediaStream = window.webkitMediaStream;

IsChrome = !!navigator.webkitGetUserMedia;

// Merge all other data-types except "function"

function mergeProps(mergein, mergeto) {
    mergeto = reformatProps(mergeto);
    for (var t in mergeto) {
        if (typeof mergeto[t] !== 'function') {
            mergein[t] = mergeto[t];
        }
    }
    return mergein;
}

function reformatProps(obj) {
    var output = { };
    for (var o in obj) {
        if (o.indexOf('-') != -1) {
            var splitted = o.split('-');
            var name = splitted[0] + splitted[1].split('')[0].toUpperCase() + splitted[1].substr(1);
            output[name] = obj[o];
        } else output[o] = obj[o];
    }
    return output;
}

// ______________________
// MediaStreamRecorder.js

// encoder only supports 48k/16k mono audio channel

function MediaStreamRecorder(mediaStream) {
    var self = this;

    this.record = function() {
        // http://dxr.mozilla.org/mozilla-central/source/content/media/MediaRecorder.cpp
        // https://wiki.mozilla.org/Gecko:MediaRecorder
        mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorder.ondataavailable = function(e) {
            // pull #118
            if(self.recordedBlob) 
				self.recordedBlob = new Blob([self.recordedBlob, e.data], { type: 'audio/ogg' });
			else 
				self.recordedBlob = new Blob([e.data], { type: 'audio/ogg' });
        };

        mediaRecorder.start(0);
    };

    this.stop = function() {
        if (mediaRecorder.state == 'recording') {
            mediaRecorder.requestData();
            mediaRecorder.stop();
        }
    };

    // Reference to "MediaRecorder" object
    var mediaRecorder;
}


// _________________
// StereoRecorder.js

function StereoRecorder(mediaStream) {
    this.record = function() {
        mediaRecorder = new StereoAudioRecorder(mediaStream, this);
        mediaRecorder.record();
    };

    this.stop = function() {
        if (mediaRecorder) mediaRecorder.stop();
        this.recordedBlob = mediaRecorder.recordedBlob;
    };

    // Reference to "StereoAudioRecorder" object
    var mediaRecorder;
}

// source code from: http://typedarray.org/wp-content/projects/WebAudioRecorder/script.js
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
    var volume;
    var audioInput;
    var audioContext;
    var context;

    this.record = function() {
        recording = true;
        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = 0;
        recordingLength = 0;
    };

    this.stop = function() {
        // we stop recording
        recording = false;

        // we flat the left and right channels down
        var leftBuffer = mergeBuffers(leftchannel, recordingLength);
        var rightBuffer = mergeBuffers(rightchannel, recordingLength);
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
    audioContext = window.AudioContext || window.webkitAudioContext;
    context = new audioContext();

    // creates a gain node
    volume = context.createGain();

    // creates an audio node from the microphone incoming stream
    audioInput = context.createMediaStreamSource(mediaStream);

    // connect the stream to the gain node
    audioInput.connect(volume);

    // From the spec: This value controls how frequently the audioprocess event is 
    // dispatched and how many sample-frames need to be processed each call. 
    // Lower values for buffer size will result in a lower (better) latency. 
    // Higher values will be necessary to avoid audio breakup and glitches

    // bug: how to minimize wav size?

    // The size of the buffer (in sample-frames) which needs to 
    // be processed each time onprocessaudio is called. 
    // Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384). 
    var legalBufferValues = [256, 512, 1024, 2048, 4096, 8192, 16384];
    var bufferSize = root.bufferSize || 2048;

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

    __stereoAudioRecorderJavacriptNode = context.createJavaScriptNode(bufferSize, 2, 2);

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
    __stereoAudioRecorderJavacriptNode.connect(context.destination);
}

// _________________
// WhammyRecorder.js

function WhammyRecorder(mediaStream) {
    this.record = function() {
        if (!this.width) this.width = video.offsetWidth || 320;
        if (!this.height) this.height = video.offsetHeight || 240;

        if (!this.video) {
            this.video = {
                width: this.width,
                height: this.height
            };
        }

        if (!this.canvas) {
            this.canvas = {
                width: this.width,
                height: this.height
            };
        }

        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;

        video.width = this.video.width;
        video.height = this.video.height;

        startTime = Date.now();

        function drawVideoFrame(time) {
            lastAnimationFrame = requestAnimationFrame(drawVideoFrame);

            if (typeof lastFrameTime === undefined) {
                lastFrameTime = time;
            }

            // ~10 fps
            if (time - lastFrameTime < 90) return;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // whammy.add(canvas, time - lastFrameTime);
            whammy.add(canvas);

            lastFrameTime = time;
        }

        setTimeout(function() {
            lastAnimationFrame = requestAnimationFrame(drawVideoFrame);
        }, 500);
    };

    this.stop = function() {
        if (lastAnimationFrame) cancelAnimationFrame(lastAnimationFrame);
        endTime = Date.now();
        this.recordedBlob = whammy.compile();
        whammy.frames = [];
    };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var video = document.createElement('video');
    video.muted = true;
    video.volume = 0;
    video.autoplay = true;
    video.src = URL.createObjectURL(mediaStream);
    video.play();

    var lastAnimationFrame = null;
    var startTime, endTime, lastFrameTime;

    // Whammy.Video(speed, quality);
    var whammy = new Whammy.Video(10, 1);
}

// ______________
// GifRecorder.js

function GifRecorder(mediaStream) {
    this.record = function() {
        if (!this.width) this.width = video.offsetWidth || 320;
        if (!this.height) this.height = video.offsetHeight || 240;

        if (!this.video) {
            this.video = {
                width: this.width,
                height: this.height
            };
        }

        if (!this.canvas) {
            this.canvas = {
                width: this.width,
                height: this.height
            };
        }

        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;

        video.width = this.video.width;
        video.height = this.video.height;

        // external library to record as GIF images
        gifEncoder = new GIFEncoder();

        // void setRepeat(int iter) 
        // Sets the number of times the set of GIF frames should be played. 
        // Default is 1; 0 means play indefinitely.
        gifEncoder.setRepeat(0);

        // void setFrameRate(Number fps) 
        // Sets frame rate in frames per second. 
        // Equivalent to setDelay(1000/fps).
        // Using "setDelay" instead of "setFrameRate"
        gifEncoder.setDelay(this.frameRate || 200);

        // void setQuality(int quality) 
        // Sets quality of color quantization (conversion of images to the 
        // maximum 256 colors allowed by the GIF specification). 
        // Lower values (minimum = 1) produce better colors, 
        // but slow processing significantly. 10 is the default, 
        // and produces good color mapping at reasonable speeds. 
        // Values greater than 20 do not yield significant improvements in speed.
        gifEncoder.setQuality(this.quality || 10);

        // Boolean start() 
        // This writes the GIF Header and returns false if it fails.
        gifEncoder.start();

        startTime = Date.now();

        function drawVideoFrame(time) {
            lastAnimationFrame = requestAnimationFrame(drawVideoFrame);

            if (typeof lastFrameTime === undefined) {
                lastFrameTime = time;
            }

            // ~10 fps
            if (time - lastFrameTime < 90) return;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            gifEncoder.addFrame(context);
            lastFrameTime = time;
        }

        lastAnimationFrame = requestAnimationFrame(drawVideoFrame);
    };

    this.stop = function() {
        if (lastAnimationFrame) cancelAnimationFrame(lastAnimationFrame);

        endTime = Date.now();

        this.recordedBlob = new Blob([new Uint8Array(gifEncoder.stream().bin)], {
            type: 'image/gif'
        });

        // bug: find a way to clear old recorded blobs
        gifEncoder.stream().bin = [];
    };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var video = document.createElement('video');
    video.muted = true;
    video.autoplay = true;
    video.src = URL.createObjectURL(mediaStream);
    video.play();

    var lastAnimationFrame = null;
    var startTime, endTime, lastFrameTime;

    var gifEncoder;
}

// whammy.js


var Whammy = (function(){
    // in this case, frames has a very specific meaning, which will be
    // detailed once i finish writing the code

    function toWebM(frames, outputAsArray){
        var info = checkFrames(frames);

        //max duration by cluster in milliseconds
        var CLUSTER_MAX_DURATION = 30000;

        var EBML = [
            {
                "id": 0x1a45dfa3, // EBML
                "data": [
                    {
                        "data": 1,
                        "id": 0x4286 // EBMLVersion
                    },
                    {
                        "data": 1,
                        "id": 0x42f7 // EBMLReadVersion
                    },
                    {
                        "data": 4,
                        "id": 0x42f2 // EBMLMaxIDLength
                    },
                    {
                        "data": 8,
                        "id": 0x42f3 // EBMLMaxSizeLength
                    },
                    {
                        "data": "webm",
                        "id": 0x4282 // DocType
                    },
                    {
                        "data": 2,
                        "id": 0x4287 // DocTypeVersion
                    },
                    {
                        "data": 2,
                        "id": 0x4285 // DocTypeReadVersion
                    }
                ]
            },
            {
                "id": 0x18538067, // Segment
                "data": [
                    {
                        "id": 0x1549a966, // Info
                        "data": [
                            {
                                "data": 1e6, //do things in millisecs (num of nanosecs for duration scale)
                                "id": 0x2ad7b1 // TimecodeScale
                            },
                            {
                                "data": "whammy",
                                "id": 0x4d80 // MuxingApp
                            },
                            {
                                "data": "whammy",
                                "id": 0x5741 // WritingApp
                            },
                            {
                                "data": doubleToString(info.duration),
                                "id": 0x4489 // Duration
                            }
                        ]
                    },
                    {
                        "id": 0x1654ae6b, // Tracks
                        "data": [
                            {
                                "id": 0xae, // TrackEntry
                                "data": [
                                    {
                                        "data": 1,
                                        "id": 0xd7 // TrackNumber
                                    },
                                    {
                                        "data": 1,
                                        "id": 0x63c5 // TrackUID
                                    },
                                    {
                                        "data": 0,
                                        "id": 0x9c // FlagLacing
                                    },
                                    {
                                        "data": "und",
                                        "id": 0x22b59c // Language
                                    },
                                    {
                                        "data": "V_VP8",
                                        "id": 0x86 // CodecID
                                    },
                                    {
                                        "data": "VP8",
                                        "id": 0x258688 // CodecName
                                    },
                                    {
                                        "data": 1,
                                        "id": 0x83 // TrackType
                                    },
                                    {
                                        "id": 0xe0,  // Video
                                        "data": [
                                            {
                                                "data": info.width,
                                                "id": 0xb0 // PixelWidth
                                            },
                                            {
                                                "data": info.height,
                                                "id": 0xba // PixelHeight
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },

                    //cluster insertion point
                ]
            }
        ];


        //Generate clusters (max duration)
        var frameNumber = 0;
        var clusterTimecode = 0;
        while(frameNumber < frames.length){

            var clusterFrames = [];
            var clusterDuration = 0;
            do {
                clusterFrames.push(frames[frameNumber]);
                clusterDuration += frames[frameNumber].duration;
                frameNumber++;
            }while(frameNumber < frames.length && clusterDuration < CLUSTER_MAX_DURATION);

            var clusterCounter = 0;
            var cluster = {
                "id": 0x1f43b675, // Cluster
                "data": [
                    {
                        "data": clusterTimecode,
                        "id": 0xe7 // Timecode
                    }
                ].concat(clusterFrames.map(function(webp){
                        var block = makeSimpleBlock({
                            discardable: 0,
                            frame: webp.data.slice(4),
                            invisible: 0,
                            keyframe: 1,
                            lacing: 0,
                            trackNum: 1,
                            timecode: Math.round(clusterCounter)
                        });
                        clusterCounter += webp.duration;
                        return {
                            data: block,
                            id: 0xa3
                        };
                    }))
            }

            //Add cluster to segment
            EBML[1].data.push(cluster);
            clusterTimecode += clusterDuration;
        }

        return generateEBML(EBML, outputAsArray)
    }

    // sums the lengths of all the frames and gets the duration, woo

    function checkFrames(frames){
        var width = frames[0].width,
            height = frames[0].height,
            duration = frames[0].duration;
        for(var i = 1; i < frames.length; i++){
            if(frames[i].width != width) throw "Frame " + (i + 1) + " has a different width";
            if(frames[i].height != height) throw "Frame " + (i + 1) + " has a different height";
            if(frames[i].duration < 0 || frames[i].duration > 0x7fff) throw "Frame " + (i + 1) + " has a weird duration (must be between 0 and 32767)";
            duration += frames[i].duration;
        }
        return {
            duration: duration,
            width: width,
            height: height
        };
    }


    function numToBuffer(num){
        var parts = [];
        while(num > 0){
            parts.push(num & 0xff)
            num = num >> 8
        }
        return new Uint8Array(parts.reverse());
    }

    function strToBuffer(str){
        // return new Blob([str]);

        var arr = new Uint8Array(str.length);
        for(var i = 0; i < str.length; i++){
            arr[i] = str.charCodeAt(i)
        }
        return arr;
        // this is slower
        // return new Uint8Array(str.split('').map(function(e){
        //  return e.charCodeAt(0)
        // }))
    }


    //sorry this is ugly, and sort of hard to understand exactly why this was done
    // at all really, but the reason is that there's some code below that i dont really
    // feel like understanding, and this is easier than using my brain.

    function bitsToBuffer(bits){
        var data = [];
        var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
        bits = pad + bits;
        for(var i = 0; i < bits.length; i+= 8){
            data.push(parseInt(bits.substr(i,8),2))
        }
        return new Uint8Array(data);
    }

    function generateEBML(json, outputAsArray){
        var ebml = [];
        for(var i = 0; i < json.length; i++){
            var data = json[i].data;
            if(typeof data == 'object') data = generateEBML(data, outputAsArray);
            if(typeof data == 'number') data = bitsToBuffer(data.toString(2));
            if(typeof data == 'string') data = strToBuffer(data);

            if(data.length){
                var z = z;
            }

            var len = data.size || data.byteLength || data.length;
            var zeroes = Math.ceil(Math.ceil(Math.log(len)/Math.log(2))/8);
            var size_str = len.toString(2);
            var padded = (new Array((zeroes * 7 + 7 + 1) - size_str.length)).join('0') + size_str;
            var size = (new Array(zeroes)).join('0') + '1' + padded;

            //i actually dont quite understand what went on up there, so I'm not really
            //going to fix this, i'm probably just going to write some hacky thing which
            //converts that string into a buffer-esque thing

            ebml.push(numToBuffer(json[i].id));
            ebml.push(bitsToBuffer(size));
            ebml.push(data)


        }

        //output as blob or byteArray
        if(outputAsArray){
            //convert ebml to an array
            var buffer = toFlatArray(ebml)
            return new Uint8Array(buffer);
        }else{
            return new Blob(ebml, {type: "video/webm"});
        }
    }

    function toFlatArray(arr, outBuffer){
        if(outBuffer == null){
            outBuffer = [];
        }
        for(var i = 0; i < arr.length; i++){
            if(typeof arr[i] == 'object'){
                //an array
                toFlatArray(arr[i], outBuffer)
            }else{
                //a simple element
                outBuffer.push(arr[i]);
            }
        }
        return outBuffer;
    }

    //OKAY, so the following two functions are the string-based old stuff, the reason they're
    //still sort of in here, is that they're actually faster than the new blob stuff because
    //getAsFile isn't widely implemented, or at least, it doesn't work in chrome, which is the
    // only browser which supports get as webp

    //Converting between a string of 0010101001's and binary back and forth is probably inefficient
    //TODO: get rid of this function
    function toBinStr_old(bits){
        var data = '';
        var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
        bits = pad + bits;
        for(var i = 0; i < bits.length; i+= 8){
            data += String.fromCharCode(parseInt(bits.substr(i,8),2))
        }
        return data;
    }

    function generateEBML_old(json){
        var ebml = '';
        for(var i = 0; i < json.length; i++){
            var data = json[i].data;
            if(typeof data == 'object') data = generateEBML_old(data);
            if(typeof data == 'number') data = toBinStr_old(data.toString(2));

            var len = data.length;
            var zeroes = Math.ceil(Math.ceil(Math.log(len)/Math.log(2))/8);
            var size_str = len.toString(2);
            var padded = (new Array((zeroes * 7 + 7 + 1) - size_str.length)).join('0') + size_str;
            var size = (new Array(zeroes)).join('0') + '1' + padded;

            ebml += toBinStr_old(json[i].id.toString(2)) + toBinStr_old(size) + data;

        }
        return ebml;
    }

    //woot, a function that's actually written for this project!
    //this parses some json markup and makes it into that binary magic
    //which can then get shoved into the matroska comtainer (peaceably)

    function makeSimpleBlock(data){
        var flags = 0;
        if (data.keyframe) flags |= 128;
        if (data.invisible) flags |= 8;
        if (data.lacing) flags |= (data.lacing << 1);
        if (data.discardable) flags |= 1;
        if (data.trackNum > 127) {
            throw "TrackNumber > 127 not supported";
        }
        var out = [data.trackNum | 0x80, data.timecode >> 8, data.timecode & 0xff, flags].map(function(e){
            return String.fromCharCode(e)
        }).join('') + data.frame;

        return out;
    }

    // here's something else taken verbatim from weppy, awesome rite?

    function parseWebP(riff){
        var VP8 = riff.RIFF[0].WEBP[0];

        var frame_start = VP8.indexOf('\x9d\x01\x2a'); //A VP8 keyframe starts with the 0x9d012a header
        for(var i = 0, c = []; i < 4; i++) c[i] = VP8.charCodeAt(frame_start + 3 + i);

        var width, horizontal_scale, height, vertical_scale, tmp;

        //the code below is literally copied verbatim from the bitstream spec
        tmp = (c[1] << 8) | c[0];
        width = tmp & 0x3FFF;
        horizontal_scale = tmp >> 14;
        tmp = (c[3] << 8) | c[2];
        height = tmp & 0x3FFF;
        vertical_scale = tmp >> 14;
        return {
            width: width,
            height: height,
            data: VP8,
            riff: riff
        }
    }

    // i think i'm going off on a riff by pretending this is some known
    // idiom which i'm making a casual and brilliant pun about, but since
    // i can't find anything on google which conforms to this idiomatic
    // usage, I'm assuming this is just a consequence of some psychotic
    // break which makes me make up puns. well, enough riff-raff (aha a
    // rescue of sorts), this function was ripped wholesale from weppy

    function parseRIFF(string){
        var offset = 0;
        var chunks = {};

        while (offset < string.length) {
            var id = string.substr(offset, 4);
            var len = parseInt(string.substr(offset + 4, 4).split('').map(function(i){
                var unpadded = i.charCodeAt(0).toString(2);
                return (new Array(8 - unpadded.length + 1)).join('0') + unpadded
            }).join(''),2);
            var data = string.substr(offset + 4 + 4, len);
            offset += 4 + 4 + len;
            chunks[id] = chunks[id] || [];

            if (id == 'RIFF' || id == 'LIST') {
                chunks[id].push(parseRIFF(data));
            } else {
                chunks[id].push(data);
            }
        }
        return chunks;
    }

    // here's a little utility function that acts as a utility for other functions
    // basically, the only purpose is for encoding "Duration", which is encoded as
    // a double (considerably more difficult to encode than an integer)
    function doubleToString(num){
        return [].slice.call(
                new Uint8Array(
                    (
                        new Float64Array([num]) //create a float64 array
                        ).buffer) //extract the array buffer
                , 0) // convert the Uint8Array into a regular array
            .map(function(e){ //since it's a regular array, we can now use map
                return String.fromCharCode(e) // encode all the bytes individually
            })
            .reverse() //correct the byte endianness (assume it's little endian for now)
            .join('') // join the bytes in holy matrimony as a string
    }

    function WhammyVideo(speed, quality){ // a more abstract-ish API
        this.frames = [];
        this.duration = 1000 / speed;
        this.quality = quality || 0.8;
    }

    WhammyVideo.prototype.add = function(frame, duration){
        if(typeof duration != 'undefined' && this.duration) throw "you can't pass a duration if the fps is set";
        if(typeof duration == 'undefined' && !this.duration) throw "if you don't have the fps set, you ned to have durations here."
        if('canvas' in frame){ //CanvasRenderingContext2D
            frame = frame.canvas;
        }
        if('toDataURL' in frame){
            frame = frame.toDataURL('image/webp', this.quality)
        }else if(typeof frame != "string"){
            throw "frame must be a a HTMLCanvasElement, a CanvasRenderingContext2D or a DataURI formatted string"
        }
        if (!(/^data:image\/webp;base64,/ig).test(frame)) {
            throw "Input must be formatted properly as a base64 encoded DataURI of type image/webp";
        }
        this.frames.push({
            image: frame,
            duration: duration || this.duration
        })
    }

    WhammyVideo.prototype.compile = function(outputAsArray){
        return new toWebM(this.frames.map(function(frame){
            var webp = parseWebP(parseRIFF(atob(frame.image.slice(23))));
            webp.duration = frame.duration;
            return webp;
        }), outputAsArray)
    }

    return {
        Video: WhammyVideo,
        fromImageArray: function(images, fps, outputAsArray){
            return toWebM(images.map(function(image){
                var webp = parseWebP(parseRIFF(atob(image.slice(23))))
                webp.duration = 1000 / fps;
                return webp;
            }), outputAsArray)
        },
        toWebM: toWebM
        // expose methods of madness
    }
})()

// gifEncoder

function encode64(n){for(var o="",f=0,l=n.length,u="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",s,i,r,c,h,e,t;f<l;)s=n.charCodeAt(f++),i=n.charCodeAt(f++),r=n.charCodeAt(f++),c=s>>2,h=(s&3)<<4|i>>4,e=(i&15)<<2|r>>6,t=r&63,isNaN(i)?e=t=64:isNaN(r)&&(t=64),o=o+u.charAt(c)+u.charAt(h)+u.charAt(e)+u.charAt(t);return o}LZWEncoder=function(){var c={},it=-1,st,ht,rt,l,w,et,ut=12,ct=5003,t,ft=ut,o,ot=1<<ut,u=[],y=[],a=ct,s=0,h=!1,v,f,p,i=0,n=0,vt=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535],r,g=[],lt=c.LZWEncoder=function lt(n,t,i,r){st=n,ht=t,rt=i,l=Math.max(2,r)},nt=function(n,t){g[r++]=n,r>=254&&k(t)},at=function(n){tt(a),s=f+2,h=!0,e(f,n)},tt=function(n){for(var t=0;t<n;++t)u[t]=-1},yt=c.compress=function yt(n,i){var w,c,nt,l,rt,g,k;for(v=n,h=!1,t=v,o=b(t),f=1<<n-1,p=f+1,s=f+2,r=0,l=d(),k=0,w=a;w<65536;w*=2)++k;k=8-k,g=a,tt(g),e(f,i);n:while((nt=d())!=it){if(w=(nt<<ft)+l,c=nt<<k^l,u[c]==w){l=y[c];continue}else if(u[c]>=0){rt=g-c,c==0&&(rt=1);do if((c-=rt)<0&&(c+=g),u[c]==w){l=y[c];continue n}while(u[c]>=0)}e(l,i),l=nt,s<ot?(y[c]=s++,u[c]=w):at(i)}e(l,i),e(p,i)},pt=c.encode=function(n){n.writeByte(l),w=st*ht,et=0,yt(l+1,n),n.writeByte(0)},k=function(n){r>0&&(n.writeByte(r),n.writeBytes(g,0,r),r=0)},b=function(n){return(1<<n)-1},d=function(){if(w==0)return it;--w;var n=rt[et++];return n&255},e=function(r,u){for(i&=vt[n],n>0?i|=r<<n:i=r,n+=t;n>=8;)nt(i&255,u),i>>=8,n-=8;if((s>o||h)&&(h?(o=b(t=v),h=!1):(++t,o=t==ft?ot:b(t))),r==p){while(n>0)nt(i&255,u),i>>=8,n-=8;k(u)}};return lt.apply(this,arguments),c},NeuQuant=function(){var c={},t=256,tt=499,nt=491,rt=487,it=503,g=3*it,b=t-1,r=4,pt=100,ft=16,y=1<<ft,p=10,ii=1<<p,a=10,gt=y>>a,dt=y<<p-a,ni=t>>3,l=6,ti=1<<l,wt=ni*ti,kt=30,ut=10,e=1<<ut,et,k=8,d=1<<k,bt=ut+k,u=1<<bt,w,i,h,n,f=[],o=[],s=[],v=[],ht=c.NeuQuant=function ht(u,f,e){var c,l;for(w=u,i=f,h=e,n=new Array(t),c=0;c<t;c++)n[c]=new Array(4),l=n[c],l[0]=l[1]=l[2]=(c<<r+8)/t,s[c]=y/t,o[c]=0},ot=function(){for(var e=[],o=new Array(t),f,r,u,i=0;i<t;i++)o[n[i][3]]=i;for(f=0,r=0;r<t;r++)u=o[r],e[f++]=n[u][0],e[f++]=n[u][1],e[f++]=n[u][2];return e},ct=function(){var e,i,c,s,u,r,o,h;for(o=0,h=0,e=0;e<t;e++){for(u=n[e],c=e,s=u[1],i=e+1;i<t;i++)r=n[i],r[1]<s&&(c=i,s=r[1]);if(r=n[c],e!=c&&(i=r[0],r[0]=u[0],u[0]=i,i=r[1],r[1]=u[1],u[1]=i,i=r[2],r[2]=u[2],u[2]=i,i=r[3],r[3]=u[3],u[3]=i),s!=o){for(f[o]=h+e>>1,i=o+1;i<s;i++)f[i]=e;o=s,h=e}}for(f[o]=h+b>>1,i=o+1;i<256;i++)f[i]=b},vt=function(){var t,u,k,b,p,c,n,s,o,y,ut,a,f,ft;for(i<g&&(h=1),et=30+(h-1)/3,a=w,f=0,ft=i,ut=i/(3*h),y=ut/pt|0,s=e,c=wt,n=c>>l,n<=1&&(n=0),t=0;t<n;t++)v[t]=s*((n*n-t*t)*d/(n*n));for(o=i<g?3:i%tt!=0?3*tt:i%nt!=0?3*nt:i%rt!=0?3*rt:3*it,t=0;t<ut;)if(k=(a[f+0]&255)<<r,b=(a[f+1]&255)<<r,p=(a[f+2]&255)<<r,u=yt(k,b,p),at(s,u,k,b,p),n!=0&&lt(n,u,k,b,p),f+=o,f>=ft&&(f-=i),t++,y==0&&(y=1),t%y==0)for(s-=s/et,c-=c/kt,n=c>>l,n<=1&&(n=0),u=0;u<n;u++)v[u]=s*((n*n-u*u)*d/(n*n))},ri=c.map=function(i,r,u){var c,l,e,o,h,s,a;for(h=1e3,a=-1,c=f[r],l=c-1;c<t||l>=0;)c<t&&(s=n[c],e=s[1]-r,e>=h?c=t:(c++,e<0&&(e=-e),o=s[0]-i,o<0&&(o=-o),e+=o,e<h&&(o=s[2]-u,o<0&&(o=-o),e+=o,e<h&&(h=e,a=s[3])))),l>=0&&(s=n[l],e=r-s[1],e>=h?l=-1:(l--,e<0&&(e=-e),o=s[0]-i,o<0&&(o=-o),e+=o,e<h&&(o=s[2]-u,o<0&&(o=-o),e+=o,e<h&&(h=e,a=s[3]))));return a},ui=c.process=function(){return vt(),st(),ct(),ot()},st=function(){for(var u,i=0;i<t;i++)n[i][0]>>=r,n[i][1]>>=r,n[i][2]>>=r,n[i][3]=i},lt=function(i,r,f,e,o){var a,y,l,c,h,p,s;for(l=r-i,l<-1&&(l=-1),c=r+i,c>t&&(c=t),a=r+1,y=r-1,p=1;a<c||y>l;){if(h=v[p++],a<c){s=n[a++];try{s[0]-=h*(s[0]-f)/u,s[1]-=h*(s[1]-e)/u,s[2]-=h*(s[2]-o)/u}catch(w){}}if(y>l){s=n[y--];try{s[0]-=h*(s[0]-f)/u,s[1]-=h*(s[1]-e)/u,s[2]-=h*(s[2]-o)/u}catch(w){}}}},at=function(t,i,r,u,f){var o=n[i];o[0]-=t*(o[0]-r)/e,o[1]-=t*(o[1]-u)/e,o[2]-=t*(o[2]-f)/e},yt=function(i,u,f){var h,c,e,b,d,l,k,v,w,y;for(v=2147483647,w=v,l=-1,k=l,h=0;h<t;h++)y=n[h],c=y[0]-i,c<0&&(c=-c),e=y[1]-u,e<0&&(e=-e),c+=e,e=y[2]-f,e<0&&(e=-e),c+=e,c<v&&(v=c,l=h),b=c-(o[h]>>ft-r),b<w&&(w=b,k=h),d=s[h]>>a,s[h]-=d,o[h]+=d<<p;return s[l]+=gt,o[l]-=dt,k};return ht.apply(this,arguments),c},GIFEncoder=function(){function h(){this.bin=[]}for(var c=0,w={};c<256;c++)w[c]=String.fromCharCode(c);h.prototype.getData=function(){for(var t="",i=this.bin.length,n=0;n<i;n++)t+=w[this.bin[n]];return t},h.prototype.writeByte=function(n){this.bin.push(n)},h.prototype.writeUTFBytes=function(n){for(var i=n.length,t=0;t<i;t++)this.writeByte(n.charCodeAt(t))},h.prototype.writeBytes=function(n,t,i){for(var u=i||n.length,r=t||0;r<u;r++)this.writeByte(n[r])};var t={},o,s,v=null,g,k=-1,d=0,f=!1,n,a,i,l,rt,r,ut=[],p=7,y=-1,b=!1,e=!0,ft=!1,it=10,gt=t.setDelay=function(n){d=Math.round(n/10)},ni=t.setDispose=function(n){n>=0&&(y=n)},dt=t.setRepeat=function(n){n>=0&&(k=n)},bt=t.setTransparent=function(n){v=n},kt=t.addFrame=function(t,i){if(t==null||!f||n==null){throw new Error("Please call start method before calling addFrame");return!1}var r=!0;try{i?a=t:(a=t.getImageData(0,0,t.canvas.width,t.canvas.height).data,ft||et(t.canvas.width,t.canvas.height)),ct(),ht(),e&&(vt(),tt(),k>=0&&lt()),st(),ot(),e||tt(),at(),e=!1}catch(u){r=!1}return r},ui=t.finish=function(){if(!f)return!1;var t=!0;f=!1;try{n.writeByte(59)}catch(i){t=!1}return t},nt=function(){g=0,a=null,i=null,l=null,r=null,b=!1,e=!0},fi=t.setFrameRate=function(n){n!=15&&(d=Math.round(100/n))},ri=t.setQuality=function(n){n<1&&(n=1),it=n},et=t.setSize=function et(n,t){(!f||e)&&(o=n,s=t,o<1&&(o=320),s<1&&(s=240),ft=!0)},ti=t.start=function(){nt();var t=!0;b=!1,n=new h;try{n.writeUTFBytes("GIF89a")}catch(i){t=!1}return f=t},ii=t.cont=function(){nt();var t=!0;return b=!1,n=new h,f=t},ht=function(){var e=i.length,o=e/3,f,n,t,u;for(l=[],f=new NeuQuant(i,e,it),r=f.process(),n=0,t=0;t<o;t++)u=f.map(i[n++]&255,i[n++]&255,i[n++]&255),ut[u]=!0,l[t]=u;i=null,rt=8,p=7,v!=null&&(g=yt(v))},yt=function(n){var t;if(r==null)return-1;var c=(n&16711680)>>16,v=(n&65280)>>8,a=n&255,s=0,h=16777216,l=r.length;for(t=0;t<l;){var i=c-(r[t++]&255),e=v-(r[t++]&255),u=a-(r[t]&255),f=i*i+e*e+u*u,o=t/3;ut[o]&&f<h&&(h=f,s=o),t++}return s},ct=function(){var e=o,h=s,f,u,t,r,n;for(i=[],f=a,u=0,t=0;t<h;t++)for(r=0;r<e;r++)n=t*e*4+r*4,i[u++]=f[n],i[u++]=f[n+1],i[u++]=f[n+2]},st=function(){n.writeByte(33),n.writeByte(249),n.writeByte(4);var i,t;v==null?(i=0,t=0):(i=1,t=2),y>=0&&(t=y&7),t<<=2,n.writeByte(0|t|0|i),u(d),n.writeByte(g),n.writeByte(0)},ot=function(){n.writeByte(44),u(0),u(0),u(o),u(s),e?n.writeByte(0):n.writeByte(128|p)},vt=function(){u(o),u(s),n.writeByte(240|p),n.writeByte(0),n.writeByte(0)},lt=function(){n.writeByte(33),n.writeByte(255),n.writeByte(11),n.writeUTFBytes("NETSCAPE2.0"),n.writeByte(3),n.writeByte(1),u(k),n.writeByte(0)},tt=function(){var i,t;for(n.writeBytes(r),i=768-r.length,t=0;t<i;t++)n.writeByte(0)},u=function(t){n.writeByte(t&255),n.writeByte(t>>8&255)},at=function(){var t=new LZWEncoder(o,s,l,rt);t.encode(n)},wt=t.stream=function(){return n},pt=t.setProperties=function(n,t){f=n,e=t};return t}
