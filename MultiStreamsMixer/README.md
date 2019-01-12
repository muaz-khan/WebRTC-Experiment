# [MultiStreamsMixer.js](https://github.com/muaz-khan/MultiStreamsMixer) | [LIVE DEMO](https://www.webrtc-experiment.com/MultiStreamsMixer/)

* Mix Multiple Cameras or Videos
* Mix Multiple Microphones or Audios (Mp3/Wav/Ogg)
* Mix Multiple Screens or Screen+Video
* Mix Canvas 2D Animation + Camera + Screen
* and **GET SINGLE STREAM!!**

[![npm](https://img.shields.io/npm/v/multistreamsmixer.svg)](https://npmjs.org/package/multistreamsmixer) [![downloads](https://img.shields.io/npm/dm/multistreamsmixer.svg)](https://npmjs.org/package/multistreamsmixer) [![Build Status: Linux](https://travis-ci.org/muaz-khan/MultiStreamsMixer.png?branch=master)](https://travis-ci.org/muaz-khan/MultiStreamsMixer)

# All Demos

1. **Main Demo:** https://www.webrtc-experiment.com/MultiStreamsMixer/
2. [Record Multiple Cameras](https://www.webrtc-experiment.com/RecordRTC/simple-demos/multi-cameras-recording.html)
3. [Record Camera+Screen](https://www.webrtc-experiment.com/RecordRTC/simple-demos/video-plus-screen-recording.html)

> Pass multiple streams (e.g. screen+camera or multiple-cameras) and get single stream. 

# Link the library

```html
<script src="https://cdn.webrtc-experiment.com/MultiStreamsMixer.js"></script>

<!-- or min.js -->
<script src="https://cdn.webrtc-experiment.com/MultiStreamsMixer.min.js"></script>

<!-- or without CDN -->
<script src="https://www.webrtc-experiment.com/MultiStreamsMixer.js"></script>

<!-- or rawgit -->
<script src="https://rawgit.com/muaz-khan/MultiStreamsMixer/master/MultiStreamsMixer.js"></script>
```

Or link specific build:

* https://github.com/muaz-khan/MultiStreamsMixer/releases

```html
<script src="https://github.com/muaz-khan/MultiStreamsMixer/releases/download/1.0.4/MultiStreamsMixer.js"></script>
```

Or install using NPM:

```sh
npm install multistreamsmixer
```

# How to mix audios?

```javascript
var audioMixer = new MultiStreamsMixer([microphone1, microphone2]);

// record using MediaRecorder API
var recorder = new MediaRecorder(audioMixer.getMixedStream());

// or share using WebRTC
rtcPeerConnection.addStream(audioMixer.getMixedStream());
```

# How to mix screen+camera?

```javascript
screenStream.fullcanvas = true;
screenStream.width = screen.width; // or 3840
screenStream.height = screen.height; // or 2160 

cameraStream.width = parseInt((20 / 100) * screenStream.width);
cameraStream.height = parseInt((20 / 100) * screenStream.height);
cameraStream.top = screenStream.height - cameraStream.height;
cameraStream.left = screenStream.width - cameraStream.width;

var mixer = new MultiStreamsMixer([screenStream, cameraStream]);

rtcPeerConnection.addStream(audioMixer.getMixedStream());

mixer.frameInterval = 1;
mixer.startDrawingFrames();

btnStopStreams.onclick = function() {
    mixer.releaseStreams();
};

btnAppendNewStreams.onclick = function() {
    mixer.appendStreams([anotherStream]);
};

btnStopScreenSharing.onclick = function() {
    // replace all old streams with this one
    // it will replace only video tracks
    mixer.resetVideoStreams([cameraStreamOnly]);
};
```

# How to mix multiple cameras?

```javascript
var mixer = new MultiStreamsMixer([camera1, camera2]);

rtcPeerConnection.addStream(audioMixer.getMixedStream());

mixer.frameInterval = 1;
mixer.startDrawingFrames();
```

# API

1. `getMixedStream`: (function) returns mixed MediaStream object
2. `frameInterval`: (property) allows you set frame interval
3. `startDrawingFrames`: (function) start mixing video streams
4. `resetVideoStreams`: (function) replace all existing video streams with new ones
5. `releaseStreams`: (function) stop mixing streams
6. `appendStreams`: (function) append extra/new streams (anytime)

# TypeScript / Angular
```javascript
import {MultiStreamsMixer} from 'yourPath/MultiStreamsMixer';
use normally ex:
let mixer = new MultiStreamsMixer([stream1,stream2]);
mixer.appendStreams(stream3);
let mixed = mixer.getMixedStream();
```
P.S: pollyfills are removed (except for AudioContext) use adapter instead
## License

[MultiStreamsMixer.js](https://github.com/muaz-khan/MultiStreamsMixer) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com).
