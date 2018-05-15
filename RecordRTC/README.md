# RecordRTC: WebRTC JavaScript Library for Audio+Video+Screen Recording

# Demo: https://www.webrtc-experiment.com/RecordRTC/

[RecordRTC Documentation](https://RecordRTC.org/) / [RecordRTC Wiki Pages](https://github.com/muaz-khan/RecordRTC/wiki) / [RecordRTC Demo](https://www.webrtc-experiment.com/RecordRTC/) / [WebRTC Experiments](https://www.webrtc-experiment.com/)

[![npm](https://img.shields.io/npm/v/recordrtc.svg)](https://npmjs.org/package/recordrtc) [![downloads](https://img.shields.io/npm/dm/recordrtc.svg)](https://npmjs.org/package/recordrtc) [![Build Status: Linux](https://travis-ci.org/muaz-khan/RecordRTC.png?branch=master)](https://travis-ci.org/muaz-khan/RecordRTC)

> [RecordRTC](https://www.webrtc-experiment.com/RecordRTC/) is a JavaScript-based media-recording library for modern web-browsers (supporting WebRTC getUserMedia API). It is optimized for different devices and browsers to bring all client-side (pluginfree) recording solutions in single place.

<a href="https://www.youtube.com/watch?v=YrLzTgdJ-Kg"><img src="https://cdn.webrtc-experiment.com/images/RecordRTC-YouTube.png" alt="YouTube Video Tutorial for RecordRTC!" /></a>

# Check all releases:

* https://github.com/muaz-khan/RecordRTC/releases

Please check [dev](https://github.com/muaz-khan/RecordRTC/tree/master/dev) directory for development files.

1. [RecordRTC API Reference](https://RecordRTC.org/RecordRTC.html)
2. [MediaStreamRecorder API Reference](https://RecordRTC.org/MediaStreamRecorder.html)
3. [StereoAudioRecorder API Reference](https://RecordRTC.org/StereoAudioRecorder.html)
4. [WhammyRecorder API Reference](https://RecordRTC.org/WhammyRecorder.html)
5. [Whammy API Reference](https://RecordRTC.org/Whammy.html)
6. [CanvasRecorder API Reference](https://RecordRTC.org/CanvasRecorder.html)
7. [MultiStreamRecorder API Reference](https://RecordRTC.org/MultiStreamRecorder.html)
8. [MRecordRTC API Reference](https://RecordRTC.org/MRecordRTC.html)
9. [RecordRTCPromisesHandler API Reference](https://RecordRTC.org/RecordRTCPromisesHandler.html)
10. [GifRecorder API Reference](https://RecordRTC.org/GifRecorder.html)
11. [Global API Reference](https://RecordRTC.org/global.html)
12 [RecordRTC and Upload to PHP Server](http://www.muazkhan.com/2017/08/recordrtc-and-upload-to-php-server.html)

## Browsers Support:

| Browser        | Support           | Features |
| ------------- |-------------|-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) | Audio+Video (Both local/remote) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) | Audio+Video (Both local/remote) |
| Opera | [Stable](http://www.opera.com/) / [NEXT](http://www.opera.com/computer/next)  | Audio+Video (Both local/remote) |
| Android | [Chrome](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) / [Firefox](https://play.google.com/store/apps/details?id=org.mozilla.firefox) / [Opera](https://play.google.com/store/apps/details?id=com.opera.browser) | Audio+Video (Both local/remote) |
| Microsoft Edge | [Normal Build](https://www.microsoft.com/en-us/windows/microsoft-edge) | **Only Audio** - No Video - No Canvas - No Screen |
| Safari 11 | preview/beta (OSX/iOS11) | [Only StereoAudioRecorder](https://www.webrtc-experiment.com/RecordRTC/simple-demos/audio-recording.html) - No Video - No Canvas - No Screen |

## Frameworks

1. Angular2 - [check article](https://medium.com/@SumanthShankar/integrate-recordrtc-with-angular-2-typescript-942c9c4ca93f#.7x5yf2nr5) and [demo github repository](https://github.com/ShankarSumanth/Angular2-RecordRTC) - via [#186](https://github.com/muaz-khan/RecordRTC/issues/186)
2. React.js - [check this article](http://suzannewang.com/recordrtc/) and [demo github repository](https://github.com/szwang/recordrtc-react)
3. Video.js - [check this github repository](https://github.com/collab-project/videojs-record)
4. meteor - [check an old github repository](https://github.com/launchbricklabs/recordrtc-meteor-demo)

> Want to add more? Please make a pull-request to update [`README.md`](https://github.com/muaz-khan/RecordRTC/blob/master/README.md)

## Tests?

* https://travis-ci.org/muaz-khan/RecordRTC

Tests source code:

* https://github.com/muaz-khan/RecordRTC/tree/master/test

## Free?

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product, free of cost.

## RecordRTC Containers Format

> RecordRTC supports vp9, vp8, h264, mkv, opus/vorbis, and pcm (mono/stereo).

#### vp9

```javascript
var options = {
    recorderType: MediaStreamRecorder,
    mimeType: 'video/webm\;codecs=vp9'
};
var recordRTC = RecordRTC(stream, options);
```

<a href="https://www.webrtc-experiment.com/images/RecordRTC-vp9.png"><img src="https://www.webrtc-experiment.com/images/RecordRTC-vp9.png" alt="RecordRTC vp9" /></a>

#### vp8

```javascript
var options = {
    recorderType: MediaStreamRecorder,
    mimeType: 'video/webm\;codecs=vp8'
};
var recordRTC = RecordRTC(stream, options);
```

<a href="https://www.webrtc-experiment.com/images/RecordRTC-vp8.png"><img src="https://www.webrtc-experiment.com/images/RecordRTC-vp8.png" alt="RecordRTC vp8" /></a>

#### h264

```javascript
var options = {
    recorderType: MediaStreamRecorder,
    mimeType: 'video/webm\;codecs=h264'
};
var recordRTC = RecordRTC(stream, options);
```

<a href="https://www.webrtc-experiment.com/images/RecordRTC-h264.png"><img src="https://www.webrtc-experiment.com/images/RecordRTC-h264.png" alt="RecordRTC h264" /></a>

#### pcm

```javascript
var options = {
    recorderType: StereoAudioRecorder,
    mimeType: 'audio/wav'
};
var recordRTC = RecordRTC(stream, options);
```

<a href="https://www.webrtc-experiment.com/images/RecordRTC-pcm.png"><img src="https://www.webrtc-experiment.com/images/RecordRTC-pcm.png" alt="RecordRTC pcm" /></a>

#### opus

```javascript
var options = {
    recorderType: MediaStreamRecorder,
    mimeType: 'audio/webm' // Firefox also supports: "audio/ogg"
};
var recordRTC = RecordRTC(stream, options);
```

<a href="https://www.webrtc-experiment.com/images/RecordRTC-opus.png"><img src="https://www.webrtc-experiment.com/images/RecordRTC-opus.png" alt="RecordRTC opus" /></a>

|Media File|Bitrate/Framerate|encoders|Framesize|additional info|
| ------------- |-------------|-------------|-------------|-------------|
|Audio File (WAV) | 1411 kbps | pcm_s16le |44100 Hz|stereo, s16|
|Video File (WebM)|60 kb/s | (whammy) vp8 codec yuv420p|--|SAR 1:1 DAR 4:3, 1k tbr, 1k tbn, 1k tbc (default)|

## RecordRTC Demos

1. [RecordRTC to Node.js](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-Nodejs)
2. [RecordRTC to PHP](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-PHP)
3. [RecordRTC to ASP.NET MVC](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-ASPNETMVC)
4. [RecordRTC & HTML-2-Canvas i.e. Canvas/HTML Recording!](https://github.com/muaz-khan/RecordRTC/tree/master/Canvas-Recording)
5. [MRecordRTC i.e. Multi-RecordRTC!](https://github.com/muaz-khan/RecordRTC/tree/master/MRecordRTC)
6. [RecordRTC on Ruby!](https://github.com/cbetta/record-rtc-experiment)
7. [RecordRTC over Socket.io](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-over-Socketio)
8. [ffmpeg-asm.js and RecordRTC! Audio/Video Merging & Transcoding!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/ffmpeg)
9. [RecordRTC / PHP / FFmpeg](https://github.com/muaz-khan/RecordRTC/tree/master/PHP-and-FFmpeg)
10. [Record Audio and upload to Nodejs server](https://www.npmjs.org/package/record-audio)
11. [ConcatenateBlobs.js](https://github.com/muaz-khan/ConcatenateBlobs) - Concatenate multiple recordings in single Blob!
12. [Remote audio-stream recording](https://www.webrtc-experiment.com/demos/remote-stream-recording.html) or [a real p2p demo](https://www.webrtc-experiment.com/RTCMultiConnection/RecordRTC-and-RTCMultiConnection.html)
13. [Mp3 or Wav Recording](https://www.webrtc-experiment.com/RecordRTC/Record-Mp3-or-Wav.html)
14. [Record entire DIV including video, image, textarea, input, drag/move/resize, everything](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/)
15. [Record canvas 2D drawings, lines, shapes, texts, images, drag/resize/enlarge/move via a huge drawing tool!](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/record-canvas-drawings.html)
16. [Record Canvas2D Animation](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/Canvas-Animation-Recording.html)
17. [WebGL animation recording](https://www.webrtc-experiment.com/RecordRTC/webgl/)
18. [Plotly - WebGL animation recording](https://www.webrtc-experiment.com/RecordRTC/plotly.html)

You can also try a chrome extension for screen recording:

* https://chrome.google.com/webstore/detail/recordrtc/ndcljioonkecdnaaihodjgiliohngojp

# How to link?

## [NPM](https://www.npmjs.com/package/recordrtc) install

```
npm install recordrtc

# you can use with "require" (browserify/nodejs)
var RecordRTC = require('recordrtc');

var recorder = RecordRTC({}, {
    type: 'video',
    recorderType: RecordRTC.WhammyRecorder
});

console.log('\n--------\nRecordRTC\n--------\n');
console.log(recorder);

console.log('\n--------\nstartRecording\n--------\n');
recorder.startRecording();
console.log('\n--------\nprocess.exit()\n--------\n');

process.exit()
```

* https://tonicdev.com/npm/recordrtc

Here is how to use `require`:

```javascript
var RecordRTC = require('recordrtc');
var Whammy = RecordRTC.Whammy;
var WhammyRecorder = RecordRTC.WhammyRecorder;
var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
// and so on

var video = new Whammy.Video(100);
var recorder = new StereoAudioRecorder(stream, options);
```

```html
<!-- link npm package scripts -->
<script src="./node_modules/recordrtc/RecordRTC.js"></script>
```

There are some other NPM packages regarding RecordRTC:

* [https://www.npmjs.org/search?q=RecordRTC](https://www.npmjs.org/search?q=RecordRTC)

## [bower](http://bower.io) install

```
bower install recordrtc
```

```html
<!-- link bower package scripts -->
<script src="./bower_components/recordrtc/RecordRTC.js"></script>
```

## CDN

```html
<!-- CDN -->
<script src="https://cdn.WebRTC-Experiment.com/RecordRTC.js"></script>

<!-- non-CDN -->
<script src="https://www.WebRTC-Experiment.com/RecordRTC.js"></script>
```

Otherwise check cdnjs below.

## Releases

You can even link specific [releases](https://github.com/muaz-khan/RecordRTC/releases):

```html
<!-- use 5.4.6 or any other version on cdnjs -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/RecordRTC/5.4.6/RecordRTC.js"></script>
```

Note: You can use `RecordRTC.min.js` as well. (on webrtc-experiment or cdnjs)

## How to capture stream?

```html
<script src="https://cdn.webrtc-experiment.com/gumadapter.js"></script>

<script>
function successCallback(stream) {
    // RecordRTC usage goes here
}

function errorCallback(error) {
    // maybe another application is using the device
}

var mediaConstraints = { video: true, audio: true };

navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
</script>
```

## Record audio+video

You'll be recording both audio/video in single WebM or Mp4 container.

```javascript
var recordRTC;

function successCallback(stream) {
    // RecordRTC usage goes here

    var options = {
      mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 128000,
      bitsPerSecond: 128000 // if this line is provided, skip above two
    };
    recordRTC = RecordRTC(stream, options);
    recordRTC.startRecording();
}

function errorCallback(error) {
    // maybe another application is using the device
}

var mediaConstraints = { video: true, audio: true };

navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);

btnStopRecording.onclick = function () {
    recordRTC.stopRecording(function (audioVideoWebMURL) {
        video.src = audioVideoWebMURL;

        var recordedBlob = recordRTC.getBlob();
        recordRTC.getDataURL(function(dataURL) { });
    });
};
```

## Record only Audio

```javascript
var recordRTC = RecordRTC(audioStream, { type: 'audio' });
recordRTC.startRecording();
recordRTC.stopRecording(function(audioURL) {
    audio.src = audioURL;

    var recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function(dataURL) { });
});
```

## `options`

RecordRTC requires a second parameter named as `options` or `configuration` or `hints` or `preferences`:

```javascript
var options = {
    recorderType: MediaStreamRecorder,
    mimeType: 'video/webm\;codecs=vp9'
};
var recordRTC = RecordRTC(stream, options);
```

You can pass `options` object over `startRecording` method as well:

```javascript
var recordRTC = RecordRTC(stream);

var options = {
    recorderType: MediaStreamRecorder,
    mimeType: 'video/webm\;codecs=vp9'
};
recordRTC.startRecording(options);
```

* `type` accepts `video` or `audio` or `canvas` or `gif`
* `mimeType` accepts [all these values](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/mimeType)
* `recorderType` accepts `MediaStreamRecorder` or `StereoAudioRecorder` or `WhammyRecorder` or `GifRecorder` or any recorder type from [this page](https://github.com/muaz-khan/RecordRTC/tree/master/dev)
* `timeSlice` accepts numbers in milliseconds; use this to force intervals-based blobs
* `ondataavailable` pass this function along with `timeSlice` to get intervals based blobs
* `checkForInactiveTracks` accepts `true` or `false`; use this to disable default inactive-stream-checker functions
* `onTimeStamp` it is a function that is called-back by the MediaStreamRecorder; `timeSlice` parameter is required for this function
* `bitsPerSecond` accepts numbers in bits; applies both to audio and video tracks
* `audioBitsPerSecond` accepts numbers in bits; applies only to audio tracks
* `videoBitsPerSecond` accepts numbers in bits; applies only to video tracks
* `disableLogs` accepts `true` or `false`; use this to disable console logs
* `frameInterval` accepts numbers in milliseconds; use this with MultiStreamRecorder, CanvasRecorder and WhammyRecorder
* `previewStream` it is a function that is called-back by the MultiStreamRecorder
* `video` accepts object similar to this: `{width: 320, height: 240}`; pass this parameter for MultiStreamRecorder, CanvasRecorder and WhammyRecorder
* `canvas` accepts object similar to this: `{width: 320, height: 240}`; pass this parameter for MultiStreamRecorder, CanvasRecorder and WhammyRecorder
* `sampleRate` used only by the StereoAudioRecorder
* `bufferSize` used only by the StereoAudioRecorder
* `numberOfAudioChannels` used only by the StereoAudioRecorder

## Record Multiple Videos

Demos:

1. [Record all your cameras](https://github.com/muaz-khan/RecordRTC/blob/master/simple-demos/multi-cameras-recording.html)
2. [Record screen as well as your video!](https://github.com/muaz-khan/RecordRTC/blob/master/simple-demos/video-plus-screen-recording.html)

You can record many videos/streams in single WebM/Mp4 file (**WebRTC Conference Recording**):

```javascript
var arrayOfStreams = [localStream, remoteStream1, remoteStream2, remoteStream3];

var recordRTC = RecordRTC(arrayOfStreams, {
  type: 'video',
  mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
  previewStream: function(stream) {
    // it is optional
    // it allows you preview the recording video
  }
});
recordRTC.startRecording();
recordRTC.stopRecording(function(singleWebM) {
    video.src = singleWebM;

    var recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function(dataURL) { });
});
```

Points:

1. Instead of passing single `MediaStream`, you are passing array of `MediaStreams`
2. You will get single webm or mp4 according to your `mimeType`

`MultiStreamRecorder.js` supports two extra methods:

1. `addStreams`
2. `resetVideoStreams`

```javascript
var msRecorder = recorder.getInternalRecorder();
if (msRecorder instanceof MultiStreamRecorder) {
    msRecorder.addStreams([newAudioStream]);
    msRecorder.resetVideoStreams([screenStream]);
}
```

Usecases:

1. You can add more audio and/or video streams during live recording (using `addStreams` method)
2. You can reset/remove/replace old videos using `resetVideoStreams`

`resetVideoStreams` can be used to recorded screenStream in full-screen mode e.g.

```javascript
if (yourScreen.isScreen === true) {
    yourScreen.fullcanvas = true;
    yourScreen.width = window.screen.width;
    yourScreen.height = window.screen.height;

    // now it will record all audios + only_this_screen
    internalRecorder.resetVideoStreams([yourScreen]);
}
```

As soon as [screen is stopped](https://www.webrtc-experiment.com/webrtcpedia/#stream-ended-listener):

```javascript
addStreamStopListener(yourScreen, function() {
    var cameraStreams = getSingleOrMultipleCameraStreams();

    // now it will record all audios + all_your_cameras
    internalRecorder.resetVideoStreams(cameraStreams);
});
```

## `getInternalRecorder`

You can get access to internal recorders e.g. MultiStreamRecorder, MediaStreamRecorder, StereoAudioRecorder, WhammyRecorder etc.

> Use `getInternalRecorder` only after `startRecording`. It may return `NULL` according to RecordRTC current state.

```javascript
// if RecordRTC recording in-progress
if (recorder.state === 'recording') {
    // get MediaStreamRecorder
    var msRecorder = recorder.getInternalRecorder();

    // always check for NULL or verify the recorder type
    if (msRecorder instanceof MultiStreamRecorder) {
        // it is NOT NULL
        // also it is MultiStreamRecorder instance
        // now we can use these extra methods
        msRecorder.addStreams([newAudioStream]);
        msRecorder.resetVideoStreams([screenStream]);
    }
}
```

Internal recorders can add extra methods. Same as MultiStreamRecorder which is supporting two extra methods:

1. `addStreams`
2. `resetVideoStreams`

## `onStateChanged`

Use this method to detect status of the recording:

```javascript
recorder = RecordRTC(stream, {
    type: 'video',
    onStateChanged: function(state) {
        alert('Current recorder status: ' + state);
    }
});

recorder.startRecording();
```

## `state`

Use this property to detect status of the recording:

```javascript
recorder = RecordRTC(stream, {
    type: 'video'
});

alert('Current recorder status: ' + recorder.state);

recorder.startRecording();

alert('Current recorder status: ' + recorder.state);

recorder.stopRecording(function() {
    alert('Current recorder status: ' + recorder.state);
});
```

You can even use `getState` method:

```javascript
alert('Current recorder status: ' + recorder.getState());
```

## `version`

Detect current RecordRTC version:

```javascript
recorder = RecordRTC(stream, {
    type: 'video'
});

alert('Current recorder version: ' + recorder.version);
```

You can even use `RecordRTC.version`:

```javascript
alert('Current recorder version: ' + RecordRTC.version);
```

## Echo Issues

Simply set `volume=0` or `muted=true` over `<audio>` or `<video>` element:

```javascript
videoElement.muted = true;
audioElement.muted = true;
```

Otherwise, you can pass some media constraints:

```javascript
function successCallback(stream) {
    // RecordRTC usage goes here
}

function errorCallback(error) {
    // maybe another application is using the device
}

var mediaConstraints = {
    audio: {
        mandatory: {
            echoCancellation: false,
            googAutoGainControl: false,
            googNoiseSuppression: false,
            googHighpassFilter: false
        },
        optional: [{
          googAudioMirroring: false
        }]
    },
};

navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
```

* [Constraints Reference](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/mediaconstraintsinterface.cc)

## Record Video

Everything is optional except `type:'video'`:

```javascript
var options = {
   type: 'video',
   frameInterval: 20 // minimum time between pushing frames to Whammy (in milliseconds)
};
var recordRTC = RecordRTC(mediaStream, options);
recordRTC.startRecording();
recordRTC.stopRecording(function(videoURL) {
    video.src = videoURL;

    var recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function(dataURL) { });
});
```

## Record animated GIF image

Everything is optional except `type:'gif'`:

```javascript
// you must "manually" link:
// https://cdn.webrtc-experiment.com/gif-recorder.js

var options = {
   type: 'gif',
   frameRate: 200,
   quality: 10
};
var recordRTC = RecordRTC(mediaStream || canvas || context, options);
recordRTC.startRecording();
recordRTC.stopRecording(function(gifURL) {
   mediaElement.src = gifURL;
});
```

## Record a Webpage

You can say it: "HTML/Canvas Recording using RecordRTC"!

```html
<script src="https://cdn.WebRTC-Experiment.com/RecordRTC.js"></script>
<script src="https://cdn.webrtc-experiment.com/screenshot.js"></script>

<div id="elementToShare" style="width:100%;height:100%;background:green;"></div>
<script>
var elementToShare = document.getElementById('elementToShare');
var recordRTC = RecordRTC(elementToShare, {
    type: 'canvas'
});
recordRTC.startRecording();
recordRTC.stopRecording(function(videoURL) {
    video.src = videoURL;

    var recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function(dataURL) { });
});
</script>
```

See a demo: [/Canvas-Recording/](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/)

## Record `<canvas>`

You can even record Canvas2D drawings:

```html
<script src="https://cdn.webrtc-experiment.com/RecordRTC/Whammy.js"></script>
<script src="https://cdn.webrtc-experiment.com/RecordRTC/CanvasRecorder.js"></script>
<canvas></canvas>
<script>
var canvas = document.querySelector('canvas');
var recorder = new CanvasRecorder(window.canvasElementToBeRecorded, {
    disableLogs: false
});

// start recording <canvas> drawings
recorder.record();

// a few minutes later
recorder.stop(function(blob) {
    var url = URL.createObjectURL(blob);
    window.open(url);
});
</script>
```

Live Demo:

* https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/record-canvas-drawings.html

Watch a video: https://vimeo.com/152119435

# API Reference

## `initRecorder`

It is a function that can be used to initiate recorder however skip getting recording outputs. It will provide maximum accuracy in the outputs after using `startRecording` method. Here is how to use it:

```javascript
var audioRecorder = RecordRTC(mediaStream, {
  recorderType: StereoAudioRecorder
});

var videoRecorder = RecordRTC(mediaStream, {
  recorderType: WhammyRecorder
});

videoRecorder.initRecorder(function() {
  audioRecorder.initRecorder(function() {
    // Both recorders are ready to record things accurately
    videoRecorder.startRecording();
    audioRecorder.startRecording();
  });
});
```

After using `stopRecording`, you'll see that both WAV/WebM blobs are having following charachteristics:

1. Both are having same recording duration i.e. length
2. Video recorder is having no blank frames
3. Audio recorder is having no empty buffers

This method is really useful to sync audio/video outputs.

## `setRecordingDuration`

You can ask RecordRTC to auto stop recording after specific duration. It accepts one mandatory and one optional argument:

```javascript
recordRTC.setRecordingDuration(milliseconds, stoppedCallback);

// the easiest one:
recordRTC.setRecordingDuration(milliseconds).onRecordingStopped(stoppedCallback);
```

Try a simple demo; paste in the chrome console:

```javascript
navigator.mediaDevices.getUserMedia({
    video: true
}).then(function(stream) {
    var recordRTC = RecordRTC(stream, {
        recorderType: WhammyRecorder
    });

    // auto stop recording after 5 seconds
    recordRTC.setRecordingDuration(5 * 1000).onRecordingStopped(function(url) {
        console.debug('setRecordingDuration', url);
        window.open(url);
    })

    recordRTC.startRecording();
}).catch(function(error) {
    console.error(error);
});
```

## `clearRecordedData`

This method can be used to clear old recorded frames/buffers. Snippet:

```javascript
recorder.clearRecordedData();
```

## `recorderType`

If you're using `recorderType` then you don't need to use `type`. Second one will be redundant i.e. skipped.

You can force any Recorder by passing this object over RecordRTC constructor:

```javascript
var audioRecorder = RecordRTC(mediaStream, {
  recorderType: StereoAudioRecorder
})
```

It means that ALL_BROWSERS will be using [StereoAudioRecorder](https://RecordRTC.org/StereoAudioRecorder.html) i.e. WebAudio API for audio recording.

This feature brings remote audio recording support in Firefox, and local audio recording support in Microsoft Edge.

Note: Chrome `>=50` supports remote audio+video recording.

You can even force `WhammyRecorder` on Firefox however webp format isn't yet supported in standard Firefox builds. It simply means that, you're skipping MediaRecorder API in Firefox.

## `type`

If you are NOT using `recorderType` parameter then `type` parameter can be used to ask RecordRTC choose best recorder-type for recording.

```javascript
// if it is Firefox, then RecordRTC will be using MediaStreamRecorder.js
// if it is Chrome or Opera, then RecordRTC will be using WhammyRecorder.js
var recordVideo = RecordRTC(mediaStream, {
  type: 'video'
});

// if it is Firefox, then RecordRTC will be using MediaStreamRecorder.js
// if it is Chrome or Opera or Edge, then RecordRTC will be using StereoAudioRecorder.js
var recordVideo = RecordRTC(mediaStream, {
  type: 'audio'
});
```

## `frameInterval`

Set minimum interval (in milliseconds) between each time we push a frame to Whammy recorder.

```javascript
var whammyRecorder = RecordRTC(videoStream, {
  recorderType: WhammyRecorder,
  frameInterval: 1   // setTimeout interval
});
```

## `disableLogs`

You can disable all the RecordRTC logs by passing this Boolean:

```javascript
var recorder = RecordRTC(mediaStream, {
  disableLogs: true
});
```

## `numberOfAudioChannels`

You can force [StereoAudioRecorder](https://RecordRTC.org/StereoAudioRecorder.html) to record single-audio-channel only. It allows you reduce WAV file size to half.

```javascript
var audioRecorder = RecordRTC(audioStream, {
  recorderType: StereoAudioRecorder,
  numberOfAudioChannels: 1 // or leftChannel:true
});
```

**It will reduce WAV size to half!**

This feature is useful only in Chrome and Microsoft Edge (WAV-recorders). It can work in Firefox as well.

## How to set video width/height?

```javascript
var options = {
   type: 'video',
   video: {
      width: 320,
      height: 240
   },
   canvas: {
      width: 320,
      height: 240
   }
};

var recordVideo = RecordRTC(MediaStream, options);
```

## `pauseRecording`

> Note: Firefox seems has a bug. It is unable to pause the recording. Seems internal bug because they correctly changes `mediaRecorder.state` from `recording` to `paused` but they are unable to pause internal recorders.

RecordRTC pauses recording buffers/frames.

```javascript
recordRTC.pauseRecording();
```

## `resumeRecording`

If you're using "initRecorder" then it asks RecordRTC that now its time to record buffers/frames. Otherwise, it asks RecordRTC to not only initialize recorder but also record buffers/frames.

```javascript
recordRTC.resumeRecording();
```

## `getDataURL`

Optionally get "DataURL" object instead of "Blob".

```javascript
recordRTC.getDataURL(function(dataURL) {
   mediaElement.src = dataURL;
});
```

## `getBlob`

Get "Blob" object. A blob object looks similar to `input[type=file]`. Which means that you can append it to `FormData` and upload to server using XMLHttpRequest object. Even socket.io nowadays supports blob-transmission.

```javascript
blob = recordRTC.getBlob();
```

## `toURL`

A virtual URL. It can be used only inside the same browser. You can't share it. It is just providing a preview of the recording.

```javascript
window.open( recordRTC.toURL() );
```

## `save`

Invoke save-as dialog. You can pass "fileName" as well; though fileName argument is optional.

```javascript
recordRTC.save('File Name');
```

## `bufferSize`

Here is how to customize Buffer-Size for audio recording?

```javascript
// From the spec: This value controls how frequently the audioprocess event is
// dispatched and how many sample-frames need to be processed each call.
// Lower values for buffer size will result in a lower (better) latency.
// Higher values will be necessary to avoid audio breakup and glitches
// bug: how to minimize wav size?
// workaround? obviously ffmpeg!
// The size of the buffer (in sample-frames) which needs to
// be processed each time onprocessaudio is called.

// Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384).

var options = {
   type: 'audio',
   recorderType: StereoAudioRecorder,
   bufferSize: 16384
};
var recordRTC = RecordRTC(audioStream, options);
```

Following values are allowed for buffer-size:

```javascript
// Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384)
```

If you passed invalid value then you'll get blank audio.

## `sampleRate`

Here is how to customize Sample-Rate for audio recording?

```javascript
// The sample rate (in sample-frames per second) at which the
// AudioContext handles audio. It is assumed that all AudioNodes
// in the context run at this rate. In making this assumption,
// sample-rate converters or "varispeed" processors are not supported
// in real-time processing.
// The sampleRate parameter describes the sample-rate of the
// linear PCM audio data in the buffer in sample-frames per second.

// An implementation must support sample-rates in at least
// the range 22050 to 96000.

var options = {
   type: 'audio',
   recorderType: StereoAudioRecorder,
   sampleRate: 96000
};
var recordRTC = RecordRTC(audioStream, options);
```

Values for sample-rate must be greater than or equal to 22050 and less than or equal to 96000.

If you passed invalid value then you'll get blank audio.

You can pass custom sample-rate values only on Mac (or additionally maybe on Windows 10).

## `desiredSampRate`

Set sample rates such as 8K or 16K. Reference: http://stackoverflow.com/a/28977136/552182

```javascript
// record 16khz audio
var options = {
   type: 'audio',
   recorderType: StereoAudioRecorder,
   desiredSampRate: 16 * 1000 // bits-per-sample * 1000
};
var recordRTC = RecordRTC(audioStream, options);
```

## `mimeType`

This option allows you set MediaRecorder output format:

```javascript
var options = {
  mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
  bitsPerSecond: 128000
};
var recorder = RecordRTC(mediaStream, options);
```

Note: For chrome, it will simply auto-set `type:audio or video` parameters to keep supporting `StereoAudioRecorder.js` and `WhammyRecorder.js`.

That is, you can skip passing `type:audio` parameter when you're using `mimeType` parameter.

## `isMimeTypeSupported`

```javascript
function isMimeTypeSupported(mimeType) {
    // if (webrtcDetectedBrowser === 'edge') return false;

    if (typeof MediaRecorder.isTypeSupported !== 'function') {
        return true;
    }

    return MediaRecorder.isTypeSupported(mimeType);
}
```

**Detect Audio Formats:**

```javascript
var mimeType = 'audio/mpeg';
var recorderType = MediaStreamRecorder;

if (isMimeTypeSupported(mimeType) === false) {
    console.log(mimeType, 'is not supported.');
    mimeType = 'audio/ogg';

    if (isMimeTypeSupported(mimeType) === false) {
        console.log(mimeType, 'is not supported.');
        mimeType = 'audio/webm';

        if (isMimeTypeSupported(mimeType) === false) {
            console.log(mimeType, 'is not supported.');

            // fallback to WebAudio solution
            mimeType = 'audio/wav';
            recorderType = StereoAudioRecorder;
        }
    }
}

var recorder = RecordRTC(mediaStream, {
    mimeType: mimeType,
    recorderType: recorderType
});
```

**Detect Video Formats:**

```javascript
var mimeType = 'video/x-matroska;codecs=avc1'; // MKV
var recorderType = MediaStreamRecorder;

if (isMimeTypeSupported(mimeType) === false) {
    console.log(mimeType, 'is not supported.');
    mimeType = 'video/webm\;codecs=h264'; // H264

    if (isMimeTypeSupported(mimeType) === false) {
        console.log(mimeType, 'is not supported.');
        mimeType = 'video/webm\;codecs=vp9'; // VP9

        if (isMimeTypeSupported(mimeType) === false) {
            console.log(mimeType, 'is not supported.');
            mimeType = 'video/webm\;codecs=vp8'; // VP8

            if (isMimeTypeSupported(mimeType) === false) {
                console.log(mimeType, 'is not supported.');
                mimeType = 'video/webm'; // do NOT pass any codecs (vp8 by default)

                if (isMimeTypeSupported(mimeType) === false) {
                    console.log(mimeType, 'is not supported.');

                    // fallback to Whammy (WebP+WebM) solution
                    mimeType = 'video/webm';
                    recorderType = WhammyRecorder;
                }
            }
        }
    }
}

var recorder = RecordRTC(mediaStream, {
    mimeType: mimeType,
    recorderType: recorderType
});
```

## `bitsPerSecond`

The chosen bitrate for the audio and video components of the media. If this is specified along with one or the other of the above properties, this will be used for the one that isn't specified.

```javascript
var options = {
  mimeType 'video/webm', // or video/mp4 or audio/ogg
  bitsPerSecond: 128000
};
var recorder = RecordRTC(mediaStream, options);
```

## `audioBitsPerSecond`

The chosen bitrate for the audio component of the media.

```javascript
var options = {
  mimeType 'audio/ogg',
  audioBitsPerSecond: 128000
};
var recorder = RecordRTC(mediaStream, options);
```

## `videoBitsPerSecond`

The chosen bitrate for the video component of the media.

```javascript
var options = {
  mimeType 'video/webm', // or video/mp4
  videoBitsPerSecond: 128000
};
var recorder = RecordRTC(mediaStream, options);
```

## `onAudioProcessStarted`

Note: "initRecorder" is preferred over this old hack. Both works similarly.

Useful to recover audio/video sync issues inside the browser:

```javascript
recordAudio = RecordRTC( stream, {
     onAudioProcessStarted: function( ) {
         recordVideo.startRecording();
     }
});

recordVideo = RecordRTC(stream, {
    type: 'video'
});

recordAudio.startRecording();
```

`onAudioProcessStarted` fixes shared/exclusive audio gap (a little bit). Because shared audio sometimes causes 100ms delay...
sometime about 400-to-500 ms delay.
Delay depends upon number of applications concurrently requesting same audio devices and CPU/Memory available.
Shared mode is the only mode currently available on 90% of windows systems especially on windows 7.

## `autoWriteToDisk`

Using `autoWriteToDisk`; you can suggest RecordRTC to auto-write to indexed-db as soon as you call `stopRecording` method.

```javascript
var recordRTC = RecordRTC(MediaStream, {
    autoWriteToDisk: true
});
```

`autoWriteToDisk` is helpful for single stream recording and writing to disk; however for `MRecordRTC`; `writeToDisk` is preferred one.

## `writeToDisk`

You can write recorded blob to disk using `writeToDisk` method:

```javascript
recordRTC.stopRecording();
recordRTC.writeToDisk();
```

## `getFromDisk`

You can get recorded blob from disk using `getFromDisk` method:

```javascript
// get all blobs from disk
RecordRTC.getFromDisk('all', function(dataURL, type) {
   type == 'audio'
   type == 'video'
   type == 'gif'
});

// or get just single blob
RecordRTC.getFromDisk('audio', function(dataURL) {
   // only audio blob is returned from disk!
});
```

For [MRecordRTC](https://RecordRTC.org/MRecordRTC.html); you can use word `MRecordRTC` instead of `RecordRTC`!

Another possible situation!

```javascript
var recordRTC = RecordRTC(mediaStream);
recordRTC.startRecording();
recordRTC.stopRecording(function(audioURL) {
   mediaElement.src = audioURL;
});

// "recordRTC" instance object to invoke "getFromDisk" method!
recordRTC.getFromDisk(function(dataURL) {
   // audio blob is automaticlaly returned from disk!
});
```

In the above example; you can see that `recordRTC` instance object is used instead of global `RecordRTC` object.

## `destroy`

Destroy all internal recorders. Clear memory and ask RecordRTC to stop doing anything internally:

```javascript
recorder.destroy();
```

Note: You can use this method anytime, anywhere; even during recording a stream.

## Promises

```html
<script src="https://cdn.WebRTC-Experiment.com/RecordRTC.js"></script>

<script>
// use "RecordRTCPromisesHandler" instead of "RecordRTC"
var recorder = new RecordRTCPromisesHandler(mediaStream, options);
recorder.startRecording().then(function() {

}).catch(function(error) {
    //
});

recorder.stopRecording().then(function(url) {
    var blob = recorder.blob;

    recorder.getDataURL().then(function(dataURL) {
        //
    }).catch(function(error) {})
}).catch(function(error) {
    //
});
</script>
```

Demo:

* [simple-demos/RecordRTCPromisesHandler.html](https://github.com/muaz-khan/RecordRTC/blob/master/simple-demos/RecordRTCPromisesHandler.html)

## Credits

1. [Recorderjs](https://github.com/mattdiamond/Recorderjs) for audio recording
2. [whammy](https://github.com/antimatter15/whammy) for video recording
3. [jsGif](https://github.com/antimatter15/jsgif) for gif recording

## Spec & Reference

1. [MediaRecorder API](https://w3c.github.io/mediacapture-record/MediaRecorder.html)
2. [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
3. [Canvas2D](http://www.w3.org/html/wg/drafts/2dcontext/html5_canvas/)
4. [Media Capture and Streams](http://www.w3.org/TR/mediacapture-streams/)

## Contribute in [RecordRTC.org](https://RecordRTC.org) domain

The domain https://RecordRTC.org is open-sourced here:

* https://github.com/muaz-khan/RecordRTC/tree/gh-pages

## Issues/Questions?

* Stackoverflow: http://stackoverflow.com/questions/tagged/recordrtc
* Github: https://github.com/muaz-khan/RecordRTC/issues
* Disqus: https://www.webrtc-experiment.com/RecordRTC/#ask
* Email: muazkh@gmail.com

# Travis Failed?

Steps to fix it (for your private projects only):

Modify `package.json` and search this line:

```json
{
    "test": "./node_modules/.bin/protractor test/browserstack.config.js"
}
```

Replace it with (i.e. ignore all "test"):

```json
{
    "test": "node npm-test.js"
}
```

Why? Reason is this file: `test/browserstack.config.js`

```javascript
'browserstack.user': process.env.BROWSERSTACK_USERNAME,
'browserstack.key': process.env.BROWSERSTACK_KEY,
```

**Your travis do NOT have these environment variables. That's why your travis builds fails.**

More info: https://github.com/muaz-khan/RecordRTC/pull/283#issuecomment-308757116

> Caution: NEVER make pull-request for modified `package.json`. Modify this file only for your own private projects.

# Tests sponsored by

<a href="https://www.browserstack.com"><img src="https://webrtcweb.com/browserstack.svg" height="32px" /></a>

**Check all tests here:** https://travis-ci.org/muaz-khan/RecordRTC

**Source code:** https://github.com/muaz-khan/RecordRTC/tree/master/test

## License

[RecordRTC.js](https://github.com/muaz-khan/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com).
