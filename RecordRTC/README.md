#### RecordRTC: WebRTC audio/video recording / [Demo](https://www.webrtc-experiment.com/RecordRTC/)

**RecordRTC** is a library for cross-browser audio/video recording.

=

Try [RecordRTC-to-PHP](https://www.webrtc-experiment.com/RecordRTC/PHP/).

=

##### Features

1. Audio recording both for chrome and Firefox
2. Video/Gif recording for chrome; (firefox has a little bit issues, will be recovered soon)

We need a stream merger like ffmpeg/avconv to merge audio/video files in MKV/AVI/etc. on the server end. A few developers already implemented such thing in PHP. A demo coming soon.

Media Stream Recording API (MediaRecorder object) is being implemented by both Firefox and Chrome. RecordRTC is also using MediaRecorder API for Firefox (nightly).

RecordRTC is unable to record "mono" audio on chrome; however it seems that we can covert channels from "stereo" to "mono" using WebAudio API, though. MediaRecorder API's encoder only support 48k/16k mono audio channel (on Firefox Nightly).

=

##### How to use RecordRTC?

```html
<script src="https://www.webrtc-experiment.com/RecordRTC.js"></script>
```

=

##### How to record audio?

```javascript
var recordRTC = RecordRTC(mediaStream);
recordRTC.startRecording();
recordRTC.stopRecording(function(audioURL) {
   window.open(audioURL);
});
```

=

##### How to record video?

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
var recordRTC = RecordRTC(mediaStream, options);
recordRTC.startRecording();
recordRTC.stopRecording(function(videoURL) {
   window.open(videoURL);
});
```

=

##### How to record animated GIF image?

```javascript
var options = {
   type: 'gif',
   video: {
      width: 320,
      height: 240
   },
   canvas: {
      width: 320,
      height: 240
   },
   frameRate: 200,
   quality: 10
};
var recordRTC = RecordRTC(mediaStream, options);
recordRTC.startRecording();
recordRTC.stopRecording(function(gifURL) {
   window.open(gifURL);
});
```

=

##### Get Data URL

```javascript
window.open( recorder.getDataURL() );
```

=

##### Get Blob object

```javascript
blob = recorder.getBlob();
```

=

##### POST on server

```javascript
blob = recorder.getBlob();

formData = new FormData();
formData.append('file-name', blob);

xhr.send(formData);
```

=

##### Get Virtual URL

```javascript
window.open( recorder.toURL() );
```

=

##### Save to Disk

```javascript
recorder.save();
```

=

##### WinXP?

No WinXP support. Try to use Vista, Windows 7 or Windows 8.

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

1. If you're on Windows, you have to be running Windows Vista or better (will not work on Windows XP).
2. On Windows, audio input hardware must be set to the same sample rate as audio output hardware.
3. On Mac and Windows, the audio input device must be at least stereo (i.e. a mono/single-channel USB microphone WILL NOT work).

=

##### Why stereo?

If you explorer chromium code; you'll see that some APIs can only be successfully called for `WAV` files with `stereo` audio.

Stereo audio is only supported for WAV files.

...still investigating the actual issue of failure with `mono` audio.

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
3. [jsGif](https://github.com/antimatter15/jsgif) for video recording

=

##### Spec & Reference

1. [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
2. [MediaRecorder](https://wiki.mozilla.org/Gecko:MediaRecorder)
3. [Canvas2D](http://www.w3.org/html/wg/drafts/2dcontext/html5_canvas/)
4. [MediaStream Recording](https://dvcs.w3.org/hg/dap/raw-file/tip/media-stream-capture/MediaRecorder.html)
5. [Media Capture and Streams](http://www.w3.org/TR/mediacapture-streams/)

=

##### License

[RecordRTC](https://www.webrtc-experiment.com/RecordRTC/) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
