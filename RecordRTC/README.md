## [RecordRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC): [WebRTC](https://www.webrtc-experiment.com/) audio/video recording / [Demo](https://www.webrtc-experiment.com/RecordRTC/) [![npm](https://img.shields.io/npm/v/recordrtc.svg)](https://npmjs.org/package/recordrtc) [![downloads](https://img.shields.io/npm/dm/recordrtc.svg)](https://npmjs.org/package/recordrtc)

[RecordRTC](https://www.webrtc-experiment.com/RecordRTC/) is a server-less (entire client-side) JavaScript library can be used to record WebRTC audio/video media streams. It supports cross-browser audio/video recording.

```javascript
// Browsers Support::
// Chrome (all versions) [ audio/video individually ]
// Firefox ( >= 29 ) [ audio/video in single webm/mp4 container or only audio in ogg ]
// Opera (all versions) [ same as chrome ]
// Android (Chrome) [ only video ]
// Android (Opera) [ only video ]
// Android (Firefox) [ only video ]
```

<a href="https://nodei.co/npm/recordrtc/">
    <img src="https://nodei.co/npm/recordrtc.png">
</a>

```
npm install recordrtc
```

To use it:

```htm
<script src="./node_modules/recordrtc/RecordRTC.js"></script>
```

There are some other NPM packages regarding RecordRTC:

* https://www.npmjs.org/search?q=RecordRTC

=

## How RecordRTC encodes wav/webm?

|Media File|Bitrate/Framerate|encoders|Framesize|additional info|
| ------------- |-------------|-------------|-------------|-------------|
|Audio File (WAV) | 1411 kbps | pcm_s16le |44100 Hz|stereo, s16|
|Video File (WebM)|60 kb/s | (whammy) vp8 codec yuv420p|--|SAR 1:1 DAR 4:3, 1k tbr, 1k tbn, 1k tbc (default)|

=

1. [RecordRTC to Node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-Nodejs)
2. [RecordRTC to PHP](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-PHP)
3. [RecordRTC to ASP.NET MVC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-ASPNETMVC)
4. [RecordRTC & HTML-2-Canvas i.e. Canvas/HTML Recording!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/Canvas-Recording)
5. [MRecordRTC i.e. Multi-RecordRTC!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/MRecordRTC)
6. [RecordRTC on Ruby!](https://github.com/cbetta/record-rtc-experiment)
7. [RecordRTC over Socket.io](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-over-Socketio)
8. [ffmpeg-asm.js and RecordRTC! Audio/Video Merging & Transcoding!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/ffmpeg)
9. [RecordRTC / PHP / FFmpeg](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/PHP-and-FFmpeg)
10. [Record Audio and upload to Nodejs server](https://www.npmjs.org/package/record-audio)

=

```html
<script src="//cdn.WebRTC-Experiment.com/RecordRTC.js"></script>
```

=

#### How to record audio+video on Firefox >= 29?

You'll be recording both audio/video in single WebM container. Though you can edit RecordRTC.js to record in mp4.

```javascript
var session = {
    audio: true,
    video: true
};

navigator.getUserMedia(session, function (mediaStream) {
    window.recordRTC = RecordRTC(MediaStream);
    recordRTC.startRecording();
}, onError);

btnStopRecording.onclick = function () {
    recordRTC.stopRecording(function (audioVideoWebMURL) {
        window.open(audioVideoWebMURL);
    });
};
```

Demo: https://www.webrtc-experiment.com/RecordRTC/AudioVideo-on-Firefox.html

=

#### How to record audio?

```javascript
var recordRTC = RecordRTC(mediaStream);
recordRTC.startRecording();
recordRTC.stopRecording(function(audioURL) {
   mediaElement.src = audioURL;
});
```

Remember, you need to invoke `navigator.getUserMedia` method yourself; it is too easy to use!

```javascript
navigator.getUserMedia({audio: true}, function(mediaStream) {
   window.recordRTC = RecordRTC(MediaStream);
   recordRTC.startRecording();
});

btnStopRecording.onclick = function() {
   recordRTC.stopRecording(function(audioURL) {
      window.open(audioURL);
   });
};
```

Also, you don't need to use prefixed versions of `getUserMedia` and `URL` objects. RecordRTC auto handles such things for you! Just use non-prefixed version:

```javascript
navigator.getUserMedia(media_constraints, onsuccess, onfailure);
URL.createObjectURL(MediaStream);
```

#### How to fix audio echo issues?

Simply set `volume=0` or `muted=true`:

```javascript
navigator.getUserMedia({audio: true}, function(mediaStream) {
   audioElement.volume = 0;
   audioElement.src = URL.createObjectURL(mediaStream);
   audioElement.play();
});
```

Or otherwise use `googEchoCancellation` and other experimental constraints from [here](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/mediaconstraintsinterface.cc).

=

#### How to record video?

Everything is optional except `type:'video'`:

```javascript
var options = {
   type: 'video'
};
var recordRTC = RecordRTC(mediaStream, options);
recordRTC.startRecording();
recordRTC.stopRecording(function(videoURL) {
   mediaElement.src = videoURL;
});
```

=

#### How to fix audio/video sync issues on chrome?

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

=

##### How to record animated GIF image?

Everything is optional except `type:'gif'`:

```javascript
// you must link:
// https://cdn.webrtc-experiment.com/gif-recorder.js

var options = {
   type: 'gif',
   frameRate: 200,
   quality: 10
};
var recordRTC = RecordRTC(mediaStream, options);
recordRTC.startRecording();
recordRTC.stopRecording(function(gifURL) {
   mediaElement.src = gifURL;
});
```

=

##### How to record HTML2Canvas?

You can say it: "HTML/Canvas Recording using RecordRTC"!

```html
<script src="//www.WebRTC-Experiment.com/RecordRTC.js"></script>
<script src="//www.webrtc-experiment.com/screenshot.js"></script>
<div id="elementToShare" style="width:100%;height:100%;background:green;"></div>
<script>
var elementToShare = document.getElementById('elementToShare');
var recordRTC = RecordRTC(elementToShare, {
    type: 'canvas'
});
recordRTC.startRecording();
recordRTC.stopRecording(function(url) {
    window.open(url);
});
</script>
```

See a demo: https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/

=

##### `autoWriteToDisk`

Using `autoWriteToDisk`; you can suggest RecordRTC to auto-write to indexed-db as soon as you call `stopRecording` method.

```javascript
var recordRTC = RecordRTC(MediaStream, {
    autoWriteToDisk: true
});
```

`autoWriteToDisk` is helpful for single stream recording and writing to disk; however for `MRecordRTC`; `writeToDisk` is preferred one.

=

##### `writeToDisk`

You can write recorded blob to disk using `writeToDisk` method:

```javascript
recordRTC.stopRecording();
recordRTC.writeToDisk();
```

=

##### `getFromDisk`

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

For [MRecordRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/MRecordRTC); you can use word `MRecordRTC` instead of `RecordRTC`!

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

=

##### How to set video width/height?

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
```

=

##### How to get DataURL?

```javascript
recordRTC.getDataURL(function(dataURL) {
   mediaElement.src = dataURL;
});
```

=

##### How to get `Blob` object?

```javascript
blob = recordRTC.getBlob();
```

=

##### How to get Virtual-URL?

```javascript
window.open( recordRTC.toURL() );
```

=

##### How to invoke save-to-disk dialog?

```javascript
recordRTC.save();
```

=

##### How to customize Buffer-Size for audio recording?

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
   bufferSize: 16384
};
var recordRTC = RecordRTC(audioStream, options);
```

Following values are allowed for buffer-size:

```javascript
// Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384)
```

You can write like this:

```javascript
var options = {
   'buffer-size': 16384
};
```

=

##### How to customize Sample-Rate for audio recording?

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
   sampleRate: 96000
};
var recordRTC = RecordRTC(audioStream, options);
```

Values for sample-rate must be greater than or equal to 22050 and less than or equal to 96000.

You can write like this:

```javascript
var options = {
   'sample-rate': 16384
};
```

=

##### Is WinXP supported?

No WinXP SP2 support. However, RecordRTC works on WinXP Service Pack 3.

=

##### Is Chrome on Android supported?

RecordRTC uses WebAudio API for stereo-audio recording. AFAIK, WebAudio is not supported on android chrome releases, yet.

=

##### Stereo or Mono?

Audio recording fails for `mono` audio. So, try `stereo` audio only.

=

##### Possible issues/failures:

Do you know "RecordRTC" fails recording audio because following conditions fails:

1. Sample rate and channel configuration must be the same for input and output sides on Windows i.e. audio input/output devices mismatch
2. Only the Default microphone device can be used for capturing.
3. The requesting scheme is none of the following: http, https, chrome, extension's, or file (only works with `--allow-file-access-from-files`)
4. The browser cannot create/initialize the metadata database for the API under the profile directory

If you see this error message: `Uncaught Error: SecurityError: DOM Exception 18`; it means that you're using `HTTP`; whilst your webpage is loading worker file (i.e. `audio-recorder.js`) from `HTTPS`. Both files's (i.e. `RecordRTC.js` and `audio-recorder.js`) scheme MUST be same!

=

##### Web Audio APIs requirements

1. If you're on Windows, you have to be running WinXP SP3, Windows Vista or better (will not work on Windows XP SP2 or earlier).
2. On Windows, audio input hardware must be set to the same sample rate as audio output hardware.
3. On Mac and Windows, the audio input device must be at least stereo (i.e. a mono/single-channel USB microphone WILL NOT work).

=

##### Why stereo?

If you explorer chromium code; you'll see that some APIs can only be successfully called for `WAV` files with `stereo` audio.

Stereo audio is only supported for WAV files.

...still investigating the actual issue of failure with `mono` audio.

=

Media Stream Recording API (MediaRecorder object) is being implemented by both Firefox and Chrome. RecordRTC is also using MediaRecorder API for Firefox (nightly).

RecordRTC is unable to record "mono" audio on chrome; however it seems that we can covert channels from "stereo" to "mono" using WebAudio API, though. MediaRecorder API's encoder only support 48k/16k mono audio channel (on Firefox Nightly).

=

##### Browser Support

[RecordRTC Demo](https://www.webrtc-experiment.com/RecordRTC/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |

=

##### Credits

1. [Recorderjs](https://github.com/mattdiamond/Recorderjs) for audio recording
2. [whammy](https://github.com/antimatter15/whammy) for video recording
3. [jsGif](https://github.com/antimatter15/jsgif) for gif recording

=

##### Spec & Reference

1. [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
2. [MediaRecorder](https://wiki.mozilla.org/Gecko:MediaRecorder)
3. [Canvas2D](http://www.w3.org/html/wg/drafts/2dcontext/html5_canvas/)
4. [MediaStream Recording](https://dvcs.w3.org/hg/dap/raw-file/tip/media-stream-capture/MediaRecorder.html)
5. [Media Capture and Streams](http://www.w3.org/TR/mediacapture-streams/)

=

## License

[RecordRTC.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
