// Muaz Khan     - https://github.com/muaz-khan 
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC
// ==========================================================
// RecordRTC.js

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

            var reader = new window.FileReader();
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
            this.getDataURL(function(dataURL) {
                var hyperlink = document.createElement('a');
                hyperlink.href = dataURL;
                hyperlink.target = '_blank';
                hyperlink.download = (Math.round(Math.random() * 9999999999) + 888888888) + '.' + mediaRecorder.recordedBlob.type.split('/')[1];

                var evt = new window.MouseEvent('click', {
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

// ==========================
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
    for (var t in mergeto) {
        if (typeof mergeto[t] !== 'function') {
            mergein[t] = mergeto[t];
        }
    }
    return mergein;
}

// Muaz Khan - https://github.com/muaz-khan 
// ======================================== MediaStreamRecorder.js

// encoder only support 48k/16k mono audio channel

function MediaStreamRecorder(mediaStream) {
    var self = this;

    this.record = function() {
        // http://dxr.mozilla.org/mozilla-central/source/content/media/MediaRecorder.cpp
        // https://wiki.mozilla.org/Gecko:MediaRecorder
        mediaRecorder = new window.MediaRecorder(mediaStream);
        mediaRecorder.ondataavailable = function(e) {
            self.recordedBlob = new window.Blob([self.recordedBlob, e.data], { type: 'audio/ogg' });
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


// Muaz Khan - https://github.com/muaz-khan
// ======================================== StereoRecorder.js

function StereoRecorder(mediaStream) {
    this.record = function() {
        mediaRecorder = new StereoAudioRecorder(mediaStream);
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

function StereoAudioRecorder(mediaStream) {
    // variables
    var leftchannel = [];
    var rightchannel = [];
    var recorder;
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

    this.stop = function() {
        // we stop recording
        recording = false;

        // we flat the left and right channels down
        var leftBuffer = mergeBuffers(leftchannel, recordingLength);
        var rightBuffer = mergeBuffers(rightchannel, recordingLength);
        // we interleave both channels together
        var interleaved = interleave(leftBuffer, rightBuffer);

        // we create our wav file
        var buffer = new window.ArrayBuffer(44 + interleaved.length * 2);
        var view = new window.DataView(buffer);

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
        this.recordedBlob = new window.Blob([view], { type: 'audio/wav' });
    };

    function interleave(leftChannel, rightChannel) {
        var length = leftChannel.length + rightChannel.length;
        var result = new window.Float32Array(length);

        var inputIndex = 0;

        for (var index = 0; index < length;) {
            result[index++] = leftChannel[inputIndex];
            result[index++] = rightChannel[inputIndex];
            inputIndex++;
        }
        return result;
    }

    function mergeBuffers(channelBuffer, rLength) {
        var result = new window.Float32Array(rLength);
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

    /* From the spec: This value controls how frequently the audioprocess event is 
    dispatched and how many sample-frames need to be processed each call. 
    Lower values for buffer size will result in a lower (better) latency. 
    Higher values will be necessary to avoid audio breakup and glitches */
    var bufferSize = 2048;
    recorder = context.createJavaScriptNode(bufferSize, 2, 2);

    recorder.onaudioprocess = function(e) {
        if (!recording) return;
        var left = e.inputBuffer.getChannelData(0);
        var right = e.inputBuffer.getChannelData(1);
        // we clone the samples
        leftchannel.push(new window.Float32Array(left));
        rightchannel.push(new window.Float32Array(right));
        recordingLength += bufferSize;
    };

    // we connect the recorder
    volume.connect(recorder);
    recorder.connect(context.destination);
}


// Muaz Khan - https://github.com/muaz-khan 
// ======================================== WhammyRecorder.js

function WhammyRecorder(mediaStream) {
    this.record = function() {
        var imageWidth = this.width || 320;
        var imageHeight = this.height || 240;

        canvas.width = video.width = imageWidth;
        canvas.height = video.height = imageHeight;

        startTime = Date.now();

        function drawVideoFrame(time) {
            lastAnimationFrame = requestAnimationFrame(drawVideoFrame);

            if (typeof lastFrameTime === undefined) {
                lastFrameTime = time;
            }

            // ~10 fps
            if (time - lastFrameTime < 90) return;

            context.drawImage(video, 0, 0, imageWidth, imageHeight);

            // whammy.add(canvas, time - lastFrameTime);
            whammy.add(canvas);

            // console.log('Recording...' + Math.round((Date.now() - startTime) / 1000) + 's');
            // console.log("fps: ", 1000 / (time - lastFrameTime));

            lastFrameTime = time;
        }

        lastAnimationFrame = requestAnimationFrame(drawVideoFrame);
    };

    this.stop = function() {
        if (lastAnimationFrame)
            cancelAnimationFrame(lastAnimationFrame);

        endTime = Date.now();
        console.log('frames captured: ' + whammy.frames.length + ' => ' +
            ((endTime - startTime) / 1000) + 's video');

        this.recordedBlob = whammy.compile();

        whammy.frames = [];
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
    var whammy = new window.Whammy.Video(10, 0.6);
}


// Muaz Khan - https://github.com/muaz-khan 
// ======================================== GifRecorder.js

function GifRecorder(mediaStream) {
    this.record = function() {
        var imageWidth = this.width || 320;
        var imageHeight = this.height || 240;

        canvas.width = video.width = imageWidth;
        canvas.height = video.height = imageHeight;

        // external library to record as GIF images
        gifEncoder = new window.GIFEncoder();

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

            context.drawImage(video, 0, 0, imageWidth, imageHeight);

            gifEncoder.addFrame(context);

            // console.log('Recording...' + Math.round((Date.now() - startTime) / 1000) + 's');
            // console.log("fps: ", 1000 / (time - lastFrameTime));

            lastFrameTime = time;
        }

        lastAnimationFrame = requestAnimationFrame(drawVideoFrame);
    };

    this.stop = function() {
        if (lastAnimationFrame) cancelAnimationFrame(lastAnimationFrame);

        endTime = Date.now();

        this.recordedBlob = new window.Blob([new window.Uint8Array(gifEncoder.stream().bin)], {
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

// Muaz Khan - https://github.com/muaz-khan 
// ======================================== whammy.js
// whammy.js is an "external library" 
// and has its own copyrights. Taken from "Whammy" project.

var Whammy=function(){function g(a){for(var b=a[0].width,e=a[0].height,c=a[0].duration,d=1;d<a.length;d++){if(a[d].width!=b)throw"Frame "+(d+1)+" has a different width";if(a[d].height!=e)throw"Frame "+(d+1)+" has a different height";if(0>a[d].duration)throw"Frame "+(d+1)+" has a weird duration";c+=a[d].duration}var f=0,a=[{id:440786851,data:[{data:1,id:17030},{data:1,id:17143},{data:4,id:17138},{data:8,id:17139},{data:"webm",id:17026},{data:2,id:17031},{data:2,id:17029}]},{id:408125543,data:[{id:357149030,
data:[{data:1E6,id:2807729},{data:"whammy",id:19840},{data:"whammy",id:22337},{data:[].slice.call(new Uint8Array((new Float64Array([c])).buffer),0).map(function(a){return String.fromCharCode(a)}).reverse().join(""),id:17545}]},{id:374648427,data:[{id:174,data:[{data:1,id:215},{data:1,id:25541},{data:0,id:156},{data:"und",id:2274716},{data:"V_VP8",id:134},{data:"VP8",id:2459272},{data:1,id:131},{id:224,data:[{data:b,id:176},{data:e,id:186}]}]}]},{id:524531317,data:[{data:0,id:231}].concat(a.map(function(a){var b;
b=a.data.slice(4);var c=Math.round(f);b=[129,c>>8,c&255,128].map(function(a){return String.fromCharCode(a)}).join("")+b;f+=a.duration;return{data:b,id:163}}))}]}];return j(a)}function m(a){for(var b=[];0<a;)b.push(a&255),a>>=8;return new Uint8Array(b.reverse())}function k(a){for(var b=[],a=(a.length%8?Array(9-a.length%8).join("0"):"")+a,e=0;e<a.length;e+=8)b.push(parseInt(a.substr(e,8),2));return new Uint8Array(b)}function j(a){for(var b=[],e=0;e<a.length;e++){var c=a[e].data;"object"==typeof c&&
(c=j(c));"number"==typeof c&&(c=k(c.toString(2)));if("string"==typeof c){for(var d=new Uint8Array(c.length),f=0;f<c.length;f++)d[f]=c.charCodeAt(f);c=d}f=c.size||c.byteLength;d=Math.ceil(Math.ceil(Math.log(f)/Math.log(2))/8);f=f.toString(2);f=Array(7*d+8-f.length).join("0")+f;d=Array(d).join("0")+"1"+f;b.push(m(a[e].id));b.push(k(d));b.push(c)}return new Blob(b,{type:"video/webm"})}function l(a){for(var b=a.RIFF[0].WEBP[0],e=b.indexOf("\u009d\u0001*"),c=0,d=[];4>c;c++)d[c]=b.charCodeAt(e+3+c);c=d[1]<<
8|d[0];e=c&16383;c=d[3]<<8|d[2];return{width:e,height:c&16383,data:b,riff:a}}function h(a){for(var b=0,e={};b<a.length;){var c=a.substr(b,4),d=parseInt(a.substr(b+4,4).split("").map(function(a){a=a.charCodeAt(0).toString(2);return Array(8-a.length+1).join("0")+a}).join(""),2),f=a.substr(b+4+4,d),b=b+(8+d);e[c]=e[c]||[];"RIFF"==c||"LIST"==c?e[c].push(h(f)):e[c].push(f)}return e}function i(a,b){this.frames=[];this.duration=1E3/a;this.quality=b||0.8}i.prototype.add=function(a,b){if("undefined"!=typeof b&&
this.duration)throw"you can't pass a duration if the fps is set";if("undefined"==typeof b&&!this.duration)throw"if you don't have the fps set, you ned to have durations here.";a.canvas&&(a=a.canvas);if(a.toDataURL)a=a.toDataURL("image/webp",this.quality);else if("string"!=typeof a)throw"frame must be a a HTMLCanvasElement, a CanvasRenderingContext2D or a DataURI formatted string";if(!/^data:image\/webp;base64,/ig.test(a))throw"Input must be formatted properly as a base64 encoded DataURI of type image/webp";
this.frames.push({image:a,duration:b||this.duration})};i.prototype.compile=function(){return new g(this.frames.map(function(a){var b=l(h(atob(a.image.slice(23))));b.duration=a.duration;return b}))};return{Video:i,fromImageArray:function(a,b){return g(a.map(function(a){a=l(h(atob(a.slice(23))));a.duration=1E3/b;return a}))},toWebM:g}}();

// Muaz Khan - https://github.com/muaz-khan 
// ======================================== gif-encoder.js
// All libraries listed in this file are "external libraries" 
// and has their own copyrights. Taken from "jsGif" project.

function encode64(n){for(var o="",f=0,l=n.length,u="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",s,i,r,c,h,e,t;f<l;)s=n.charCodeAt(f++),i=n.charCodeAt(f++),r=n.charCodeAt(f++),c=s>>2,h=(s&3)<<4|i>>4,e=(i&15)<<2|r>>6,t=r&63,isNaN(i)?e=t=64:isNaN(r)&&(t=64),o=o+u.charAt(c)+u.charAt(h)+u.charAt(e)+u.charAt(t);return o}LZWEncoder=function(){var c={},it=-1,st,ht,rt,l,w,et,ut=12,ct=5003,t,ft=ut,o,ot=1<<ut,u=[],y=[],a=ct,s=0,h=!1,v,f,p,i=0,n=0,vt=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535],r,g=[],lt=c.LZWEncoder=function lt(n,t,i,r){st=n,ht=t,rt=i,l=Math.max(2,r)},nt=function(n,t){g[r++]=n,r>=254&&k(t)},at=function(n){tt(a),s=f+2,h=!0,e(f,n)},tt=function(n){for(var t=0;t<n;++t)u[t]=-1},yt=c.compress=function yt(n,i){var w,c,nt,l,rt,g,k;for(v=n,h=!1,t=v,o=b(t),f=1<<n-1,p=f+1,s=f+2,r=0,l=d(),k=0,w=a;w<65536;w*=2)++k;k=8-k,g=a,tt(g),e(f,i);n:while((nt=d())!=it){if(w=(nt<<ft)+l,c=nt<<k^l,u[c]==w){l=y[c];continue}else if(u[c]>=0){rt=g-c,c==0&&(rt=1);do if((c-=rt)<0&&(c+=g),u[c]==w){l=y[c];continue n}while(u[c]>=0)}e(l,i),l=nt,s<ot?(y[c]=s++,u[c]=w):at(i)}e(l,i),e(p,i)},pt=c.encode=function(n){n.writeByte(l),w=st*ht,et=0,yt(l+1,n),n.writeByte(0)},k=function(n){r>0&&(n.writeByte(r),n.writeBytes(g,0,r),r=0)},b=function(n){return(1<<n)-1},d=function(){if(w==0)return it;--w;var n=rt[et++];return n&255},e=function(r,u){for(i&=vt[n],n>0?i|=r<<n:i=r,n+=t;n>=8;)nt(i&255,u),i>>=8,n-=8;if((s>o||h)&&(h?(o=b(t=v),h=!1):(++t,o=t==ft?ot:b(t))),r==p){while(n>0)nt(i&255,u),i>>=8,n-=8;k(u)}};return lt.apply(this,arguments),c},NeuQuant=function(){var c={},t=256,tt=499,nt=491,rt=487,it=503,g=3*it,b=t-1,r=4,pt=100,ft=16,y=1<<ft,p=10,ii=1<<p,a=10,gt=y>>a,dt=y<<p-a,ni=t>>3,l=6,ti=1<<l,wt=ni*ti,kt=30,ut=10,e=1<<ut,et,k=8,d=1<<k,bt=ut+k,u=1<<bt,w,i,h,n,f=[],o=[],s=[],v=[],ht=c.NeuQuant=function ht(u,f,e){var c,l;for(w=u,i=f,h=e,n=new Array(t),c=0;c<t;c++)n[c]=new Array(4),l=n[c],l[0]=l[1]=l[2]=(c<<r+8)/t,s[c]=y/t,o[c]=0},ot=function(){for(var e=[],o=new Array(t),f,r,u,i=0;i<t;i++)o[n[i][3]]=i;for(f=0,r=0;r<t;r++)u=o[r],e[f++]=n[u][0],e[f++]=n[u][1],e[f++]=n[u][2];return e},ct=function(){var e,i,c,s,u,r,o,h;for(o=0,h=0,e=0;e<t;e++){for(u=n[e],c=e,s=u[1],i=e+1;i<t;i++)r=n[i],r[1]<s&&(c=i,s=r[1]);if(r=n[c],e!=c&&(i=r[0],r[0]=u[0],u[0]=i,i=r[1],r[1]=u[1],u[1]=i,i=r[2],r[2]=u[2],u[2]=i,i=r[3],r[3]=u[3],u[3]=i),s!=o){for(f[o]=h+e>>1,i=o+1;i<s;i++)f[i]=e;o=s,h=e}}for(f[o]=h+b>>1,i=o+1;i<256;i++)f[i]=b},vt=function(){var t,u,k,b,p,c,n,s,o,y,ut,a,f,ft;for(i<g&&(h=1),et=30+(h-1)/3,a=w,f=0,ft=i,ut=i/(3*h),y=ut/pt|0,s=e,c=wt,n=c>>l,n<=1&&(n=0),t=0;t<n;t++)v[t]=s*((n*n-t*t)*d/(n*n));for(o=i<g?3:i%tt!=0?3*tt:i%nt!=0?3*nt:i%rt!=0?3*rt:3*it,t=0;t<ut;)if(k=(a[f+0]&255)<<r,b=(a[f+1]&255)<<r,p=(a[f+2]&255)<<r,u=yt(k,b,p),at(s,u,k,b,p),n!=0&&lt(n,u,k,b,p),f+=o,f>=ft&&(f-=i),t++,y==0&&(y=1),t%y==0)for(s-=s/et,c-=c/kt,n=c>>l,n<=1&&(n=0),u=0;u<n;u++)v[u]=s*((n*n-u*u)*d/(n*n))},ri=c.map=function(i,r,u){var c,l,e,o,h,s,a;for(h=1e3,a=-1,c=f[r],l=c-1;c<t||l>=0;)c<t&&(s=n[c],e=s[1]-r,e>=h?c=t:(c++,e<0&&(e=-e),o=s[0]-i,o<0&&(o=-o),e+=o,e<h&&(o=s[2]-u,o<0&&(o=-o),e+=o,e<h&&(h=e,a=s[3])))),l>=0&&(s=n[l],e=r-s[1],e>=h?l=-1:(l--,e<0&&(e=-e),o=s[0]-i,o<0&&(o=-o),e+=o,e<h&&(o=s[2]-u,o<0&&(o=-o),e+=o,e<h&&(h=e,a=s[3]))));return a},ui=c.process=function(){return vt(),st(),ct(),ot()},st=function(){for(var u,i=0;i<t;i++)n[i][0]>>=r,n[i][1]>>=r,n[i][2]>>=r,n[i][3]=i},lt=function(i,r,f,e,o){var a,y,l,c,h,p,s;for(l=r-i,l<-1&&(l=-1),c=r+i,c>t&&(c=t),a=r+1,y=r-1,p=1;a<c||y>l;){if(h=v[p++],a<c){s=n[a++];try{s[0]-=h*(s[0]-f)/u,s[1]-=h*(s[1]-e)/u,s[2]-=h*(s[2]-o)/u}catch(w){}}if(y>l){s=n[y--];try{s[0]-=h*(s[0]-f)/u,s[1]-=h*(s[1]-e)/u,s[2]-=h*(s[2]-o)/u}catch(w){}}}},at=function(t,i,r,u,f){var o=n[i];o[0]-=t*(o[0]-r)/e,o[1]-=t*(o[1]-u)/e,o[2]-=t*(o[2]-f)/e},yt=function(i,u,f){var h,c,e,b,d,l,k,v,w,y;for(v=2147483647,w=v,l=-1,k=l,h=0;h<t;h++)y=n[h],c=y[0]-i,c<0&&(c=-c),e=y[1]-u,e<0&&(e=-e),c+=e,e=y[2]-f,e<0&&(e=-e),c+=e,c<v&&(v=c,l=h),b=c-(o[h]>>ft-r),b<w&&(w=b,k=h),d=s[h]>>a,s[h]-=d,o[h]+=d<<p;return s[l]+=gt,o[l]-=dt,k};return ht.apply(this,arguments),c},GIFEncoder=function(){function h(){this.bin=[]}for(var c=0,w={};c<256;c++)w[c]=String.fromCharCode(c);h.prototype.getData=function(){for(var t="",i=this.bin.length,n=0;n<i;n++)t+=w[this.bin[n]];return t},h.prototype.writeByte=function(n){this.bin.push(n)},h.prototype.writeUTFBytes=function(n){for(var i=n.length,t=0;t<i;t++)this.writeByte(n.charCodeAt(t))},h.prototype.writeBytes=function(n,t,i){for(var u=i||n.length,r=t||0;r<u;r++)this.writeByte(n[r])};var t={},o,s,v=null,g,k=-1,d=0,f=!1,n,a,i,l,rt,r,ut=[],p=7,y=-1,b=!1,e=!0,ft=!1,it=10,gt=t.setDelay=function(n){d=Math.round(n/10)},ni=t.setDispose=function(n){n>=0&&(y=n)},dt=t.setRepeat=function(n){n>=0&&(k=n)},bt=t.setTransparent=function(n){v=n},kt=t.addFrame=function(t,i){if(t==null||!f||n==null){throw new Error("Please call start method before calling addFrame");return!1}var r=!0;try{i?a=t:(a=t.getImageData(0,0,t.canvas.width,t.canvas.height).data,ft||et(t.canvas.width,t.canvas.height)),ct(),ht(),e&&(vt(),tt(),k>=0&&lt()),st(),ot(),e||tt(),at(),e=!1}catch(u){r=!1}return r},ui=t.finish=function(){if(!f)return!1;var t=!0;f=!1;try{n.writeByte(59)}catch(i){t=!1}return t},nt=function(){g=0,a=null,i=null,l=null,r=null,b=!1,e=!0},fi=t.setFrameRate=function(n){n!=15&&(d=Math.round(100/n))},ri=t.setQuality=function(n){n<1&&(n=1),it=n},et=t.setSize=function et(n,t){(!f||e)&&(o=n,s=t,o<1&&(o=320),s<1&&(s=240),ft=!0)},ti=t.start=function(){nt();var t=!0;b=!1,n=new h;try{n.writeUTFBytes("GIF89a")}catch(i){t=!1}return f=t},ii=t.cont=function(){nt();var t=!0;return b=!1,n=new h,f=t},ht=function(){var e=i.length,o=e/3,f,n,t,u;for(l=[],f=new NeuQuant(i,e,it),r=f.process(),n=0,t=0;t<o;t++)u=f.map(i[n++]&255,i[n++]&255,i[n++]&255),ut[u]=!0,l[t]=u;i=null,rt=8,p=7,v!=null&&(g=yt(v))},yt=function(n){var t;if(r==null)return-1;var c=(n&16711680)>>16,v=(n&65280)>>8,a=n&255,s=0,h=16777216,l=r.length;for(t=0;t<l;){var i=c-(r[t++]&255),e=v-(r[t++]&255),u=a-(r[t]&255),f=i*i+e*e+u*u,o=t/3;ut[o]&&f<h&&(h=f,s=o),t++}return s},ct=function(){var e=o,h=s,f,u,t,r,n;for(i=[],f=a,u=0,t=0;t<h;t++)for(r=0;r<e;r++)n=t*e*4+r*4,i[u++]=f[n],i[u++]=f[n+1],i[u++]=f[n+2]},st=function(){n.writeByte(33),n.writeByte(249),n.writeByte(4);var i,t;v==null?(i=0,t=0):(i=1,t=2),y>=0&&(t=y&7),t<<=2,n.writeByte(0|t|0|i),u(d),n.writeByte(g),n.writeByte(0)},ot=function(){n.writeByte(44),u(0),u(0),u(o),u(s),e?n.writeByte(0):n.writeByte(128|p)},vt=function(){u(o),u(s),n.writeByte(240|p),n.writeByte(0),n.writeByte(0)},lt=function(){n.writeByte(33),n.writeByte(255),n.writeByte(11),n.writeUTFBytes("NETSCAPE2.0"),n.writeByte(3),n.writeByte(1),u(k),n.writeByte(0)},tt=function(){var i,t;for(n.writeBytes(r),i=768-r.length,t=0;t<i;t++)n.writeByte(0)},u=function(t){n.writeByte(t&255),n.writeByte(t>>8&255)},at=function(){var t=new LZWEncoder(o,s,l,rt);t.encode(n)},wt=t.stream=function(){return n},pt=t.setProperties=function(n,t){f=n,e=t};return t}
