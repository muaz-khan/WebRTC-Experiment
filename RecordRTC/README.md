# [RecordRTC](https://github.com/muaz-khan/RecordRTC): [WebRTC](https://www.webrtc-experiment.com/) audio/video recording

[RecordRTC Documentation](https://RecordRTC.org/) / [RecordRTC Wiki Pages](https://github.com/muaz-khan/RecordRTC/wiki) / [RecordRTC Demo](https://www.webrtc-experiment.com/RecordRTC/) / [WebRTC Experiments](https://www.webrtc-experiment.com/)

[![npm](https://img.shields.io/npm/v/recordrtc.svg)](https://npmjs.org/package/recordrtc) [![downloads](https://img.shields.io/npm/dm/recordrtc.svg)](https://npmjs.org/package/recordrtc) [![Build Status: Linux](https://travis-ci.org/muaz-khan/RecordRTC.png?branch=master)](https://travis-ci.org/muaz-khan/RecordRTC)

> [RecordRTC](https://www.webrtc-experiment.com/RecordRTC/) is a JavaScript-based media-recording library for modern web-browsers (supporting WebRTC getUserMedia API). It is optimized for different devices and browsers to bring all client-side (pluginfree) recording solutions in single place.

Please check [dev](https://github.com/muaz-khan/RecordRTC/tree/master/dev) directory for development files.

1. [RecordRTC API Reference](http://RecordRTC.org/RecordRTC.html)
2. [MRecordRTC API Reference](http://RecordRTC.org/MRecordRTC.html)
3. [MediaStreamRecorder API Reference](http://RecordRTC.org/MediaStreamRecorder.html)
4. [StereoRecorder API Reference](http://RecordRTC.org/StereoRecorder.html)
5. [StereoAudioRecorder API Reference](http://RecordRTC.org/StereoAudioRecorder.html)
6. [WhammyRecorder API Reference](http://RecordRTC.org/WhammyRecorder.html)
7. [Whammy API Reference](http://RecordRTC.org/Whammy.html)
8. [CanvasRecorder API Reference](http://RecordRTC.org/CanvasRecorder.html)
9. [GifRecorder API Reference](http://RecordRTC.org/GifRecorder.html)
10. [Global API Reference](http://RecordRTC.org/global.html)

## Browsers Support:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Opera | [Stable](http://www.opera.com/) / [NEXT](http://www.opera.com/computer/next)  |
| Android | [Chrome](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) / [Firefox](https://play.google.com/store/apps/details?id=org.mozilla.firefox) / [Opera](https://play.google.com/store/apps/details?id=com.opera.browser) |

## How RecordRTC encodes wav/webm?

|Media File|Bitrate/Framerate|encoders|Framesize|additional info|
| ------------- |-------------|-------------|-------------|-------------|
|Audio File (WAV) | 1411 kbps | pcm_s16le |44100 Hz|stereo, s16|
|Video File (WebM)|60 kb/s | (whammy) vp8 codec yuv420p|--|SAR 1:1 DAR 4:3, 1k tbr, 1k tbn, 1k tbc (default)|

## RecordRTC Demos

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
11. [ConcatenateBlobs.js](https://github.com/muaz-khan/ConcatenateBlobs) - Concatenate multiple recordings in single Blob!

## How to link?

```
npm install recordrtc
```

or using [Bower](http://bower.io):

```
bower install recordrtc
```

To use it:

```html
<script src="./node_modules/recordrtc/RecordRTC.js"></script>

<!-- or -->
<script src="http://RecordRTC.org/latest.js"></script>

<!-- or -->
<script src="//cdn.WebRTC-Experiment.com/RecordRTC.js"></script>

<!-- or -->
<script src="//www.WebRTC-Experiment.com/RecordRTC.js"></script>
```

There are some other NPM packages regarding RecordRTC:

* [https://www.npmjs.org/search?q=RecordRTC](https://www.npmjs.org/search?q=RecordRTC)

## Record audio+video in Firefox

You'll be recording both audio/video in single WebM container. Though you can edit RecordRTC.js to record in mp4.

```javascript
var session = {
    audio: true,
    video: true
};

var recordRTC;

navigator.getUserMedia(session, function (mediaStream) {
    recordRTC = RecordRTC(MediaStream);
    recordRTC.startRecording();
}, onError);

btnStopRecording.onclick = function () {
    recordRTC.stopRecording(function (audioVideoWebMURL) {
        video.src = audioVideoWebMURL;
        
        var recordedBlob = recordRTC.getBlob();
        recordRTC.getDataURL(function(dataURL) { });
    });
};
```

Demo: [AudioVideo-on-Firefox.html](https://www.webrtc-experiment.com/RecordRTC/AudioVideo-on-Firefox.html)

## Record only Audio

```javascript
var recordRTC = RecordRTC(mediaStream);
recordRTC.startRecording();
recordRTC.stopRecording(function(audioURL) {
    audio.src = audioURL;
   
    var recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function(dataURL) { });
});
```

Remember, you need to invoke `navigator.getUserMedia` method yourself; it is too easy to use!

```javascript
var recordRTC;

navigator.getUserMedia({audio: true}, function(mediaStream) {
   recordRTC = RecordRTC(MediaStream);
   recordRTC.startRecording();
});

btnStopRecording.onclick = function() {
   recordRTC.stopRecording(function(audioURL) {
        audio.src = audioURL;
        
        var recordedBlob = recordRTC.getBlob();
        recordRTC.getDataURL(function(dataURL) { });
   });
};
```

Also, you don't need to use prefixed versions of `getUserMedia` and `URL` objects. RecordRTC auto handles such things for you! Just use non-prefixed version:

```javascript
navigator.getUserMedia(media_constraints, onsuccess, onfailure);
URL.createObjectURL(MediaStream);
```

## Echo Issues

Simply set `volume=0` or `muted=true`:

```javascript
navigator.getUserMedia({
    audio: {
        mandatory: {
            googEchoCancellation: false,
            googAutoGainControl: false,
            googNoiseSuppression: false,
            googHighpassFilter: false
        },
        optional: []
    },
}, onSuccess, onFailure);

var recordRTC;
function onSuccess(mediaStream) {
    recordRTC = RecordRTC(mediaStream);
    recordRTC.startRecording();
}
```

* [Constraints Reference](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/mediaconstraintsinterface.cc)

## Record Video

Everything is optional except `type:'video'`:

```javascript
var options = {
   type: 'video'
};
var recordRTC = RecordRTC(mediaStream, options);
recordRTC.startRecording();
recordRTC.stopRecording(function(videoURL) {
    video.src = videoURL;
   
    var recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function(dataURL) { });
});
```

## `onAudioProcessStarted`

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
var recordRTC = RecordRTC(mediaStream, options);
recordRTC.startRecording();
recordRTC.stopRecording(function(gifURL) {
   mediaElement.src = gifURL;
});
```

## Record a Webpage

You can say it: "HTML/Canvas Recording using RecordRTC"!

```html
<script src="//cdn.WebRTC-Experiment.com/RecordRTC.js"></script>
<script src="//cdn.webrtc-experiment.com/screenshot.js"></script>

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

# API Reference

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
```

## `pauseRecording`

```javascript
recordRTC.pauseRecording();
```

## `resumeRecording`

```javascript
recordRTC.resumeRecording();
```

## `getDataURL`

```javascript
recordRTC.getDataURL(function(dataURL) {
   mediaElement.src = dataURL;
});
```

## `getBlob`

```javascript
blob = recordRTC.getBlob();
```

## `toURL`

```javascript
window.open( recordRTC.toURL() );
```

## `save`

```javascript
recordRTC.save();
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

## `sampleRate`

Here is jow to customize Sample-Rate for audio recording?

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

# Clarifications

## Is WinXP supported?

No WinXP SP2 based "Chrome" support. However, RecordRTC works on WinXP Service Pack 3.

## Is Chrome on Android supported?

RecordRTC uses WebAudio API for stereo-audio recording. AFAIK, WebAudio is not supported on android chrome releases, yet.

## Stereo or Mono?

Audio recording fails for `mono` audio. So, try `stereo` audio only.

## Possible issues/failures:

Do you know "RecordRTC" fails recording audio because following conditions fails:

1. Sample rate and channel configuration must be the same for input and output sides on Windows i.e. audio input/output devices mismatch
2. Only the Default microphone device can be used for capturing.
3. The requesting scheme is none of the following: http, https, chrome, extension's, or file (only works with `--allow-file-access-from-files`)
4. The browser cannot create/initialize the metadata database for the API under the profile directory

If you see this error message: `Uncaught Error: SecurityError: DOM Exception 18`; it means that you're using `HTTP`; whilst your webpage is loading worker file (i.e. `audio-recorder.js`) from `HTTPS`. Both files's (i.e. `RecordRTC.js` and `audio-recorder.js`) scheme MUST be same!

## Web Audio APIs requirements

1. If you're on Windows, you have to be running WinXP SP3, Windows Vista or better (will not work on Windows XP SP2 or earlier).
2. On Windows, audio input hardware must be set to the same sample rate as audio output hardware.
3. On Mac and Windows, the audio input device must be at least stereo (i.e. a mono/single-channel USB microphone WILL NOT work).

## Why stereo?

If you explorer chromium code; you'll see that some APIs can only be successfully called for `WAV` files with `stereo` audio.

Stereo audio is only supported for WAV files.

...still investigating the actual issue of failure with `mono` audio.

Media Stream Recording API (MediaRecorder object) is being implemented by both Firefox and Chrome. RecordRTC is also using MediaRecorder API for Firefox (nightly).

RecordRTC is unable to record "mono" audio on chrome; however it seems that we can covert channels from "stereo" to "mono" using WebAudio API, though. MediaRecorder API's encoder only support 48k/16k mono audio channel (on Firefox Nightly).

## Credits

1. [Recorderjs](https://github.com/mattdiamond/Recorderjs) for audio recording
2. [whammy](https://github.com/antimatter15/whammy) for video recording
3. [jsGif](https://github.com/antimatter15/jsgif) for gif recording

## Spec & Reference

1. [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
2. [MediaRecorder](https://wiki.mozilla.org/Gecko:MediaRecorder)
3. [Canvas2D](http://www.w3.org/html/wg/drafts/2dcontext/html5_canvas/)
4. [MediaStream Recording](https://dvcs.w3.org/hg/dap/raw-file/tip/media-stream-capture/MediaRecorder.html)
5. [Media Capture and Streams](http://www.w3.org/TR/mediacapture-streams/)

## Contribute in [RecordRTC.org](http://RecordRTC.org)

[![npm](https://img.shields.io/npm/v/recordrtc.org.svg)](https://npmjs.org/package/recordrtc.org) [![downloads](https://img.shields.io/npm/dm/recordrtc.org.svg)](https://npmjs.org/package/recordrtc.org)

http://recordrtc.org/ is a documentation webpage for [RecordRTC.js](https://github.com/muaz-khan/RecordRTC). It is [open-sourced in github](https://github.com/muaz-khan/RecordRTC/tree/gh-pages) and everyone can collaborate to improve documentation.

To contribute:

1. You should modify `RecordRTC.js` file (aka [`latest.js`](https://github.com/muaz-khan/RecordRTC/blob/gh-pages/latest.js) file)
2. You'll see that each function/property/method is having comments (format is chosen from http://usejsdoc.org/).
3. Using `jsdoc` tool, you can generate documentation HTML pages from `latest.js` file
4. You should NEVER modify HTML pages. You merely need to modify `latest.js` file for documentation.

Steps to contribute:

1. Modify `latest.js` file
2. Use below NPM-commands to generate HTML pages.
3. Manually copy/paste `latest.js` file in the resulting `recordrtc.org` directory
4. Copy `recordrtc.org` directory and replace in `RecordRTC` github clone's `gh-pages` section
5. Send a pull-request and done!

```
# First step: install recordrtc.org template and javascript file
npm install recordrtc.org

# Second step: generate HTML files from template & latest.js file
cd .\node_modules\recordrtc.org

# This command generates HTML pages from latest.js file
node_modules\.bin\jsdoc node_modules\recordrtc\RecordRTC.js -d .\..\..\recordrtc.org node_modules\recordrtc\README.md -t template
```

Now you'll see a directory with name `recordrtc.org`.

```
# This command runs index.html file
# You can use it to preview HTML pages (doc files)
.\..\..\recordrtc.org\index.html
```

## Send pull requests

Now, you should fork this repository:

* [https://github.com/muaz-khan/RecordRTC](https://github.com/muaz-khan/RecordRTC)

And push/pull `recordrtc.org` directory to `gh-pages`.

## How to modify `latest.js` file?

RecordRTC is using comments format from jsdoc:

* [http://usejsdoc.org/](http://usejsdoc.org/)

E.g.

```javascript
/**
* Description
* @summary Summary
* @typedef Hello
* @example
* var some = new Something();
*/
```

Example - [`stopRecording`](https://github.com/muaz-khan/RecordRTC/blob/gh-pages/latest.js#L206) method:

```javascript
/**
 * This method stops recording. It takes single "callback" argument. It is suggested to get blob or URI in the callback to make sure all encoders finished their jobs.
 * @param {function} callback - This callback function is invoked after completion of all encoding jobs.
 * @method
 * @memberof RecordRTC
 * @instance
 * @example
 * recordRTC.stopRecording(function(videoURL) {
 *     video.src = videoURL;
 * });
 * @todo Implement <code class="str">recordRTC.stopRecording().getDataURL(callback);</code>
 */
stopRecording: stopRecording,
```

## License

[RecordRTC.js](https://github.com/muaz-khan/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
