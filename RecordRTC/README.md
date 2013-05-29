#### RecordRTC: WebRTC audio/video recording / [Demo](https://webrtc-experiment.appspot.com/RecordRTC/)

[RecordRTC](https://webrtc-experiment.appspot.com/RecordRTC.js) allows you record audio and/or video streams.

#### Features

1. Writes recorded file on disk and returns file URL
2. It is your choice to get URL blob or file URL

##### How to use RecordRTC?

```html
<script src="https://webrtc-experiment.appspot.com/RecordRTC.js"></script>
```

#### How to record video?

```javascript
var recorder = RecordRTC({
	video: HTMLVideoElement
});

/* start recording video */
recorder.recordVideo();

/* stop recording video and save recorded file to disk */
recorder.stopVideo(function(recordedFileURL) {
   window.open(recordedFileURL);
});
```

##### How to record audio?

```javascript
var recorder = RecordRTC({
	stream: MediaStream || LocalMediaStream
});

/* start recording audio */
recorder.recordAudio();

/* stop recording audio and save recorded file to disk */
recorder.stopAudio(function(recordedFileURL) {
   window.open(recordedFileURL);
});
```

#### Additional Features

```javascript
/* getting URL Blob */
window.open( recorder.getBlob() );

/* getting recorded file URL */
window.open( recorder.toURL() );

/* save recorded Blob to disk */
recorder.save();
```

It is recommended to use `stopAudio` and `stopVideo` **callback parameter** to get recorded file URL or recorded Blob.

```javascript
recorder.stopVideo(function(recordedFileURL) {
   window.open(recordedFileURL);
});

recorder.stopAudio(function(recordedFileURL) {
   window.open(recordedFileURL);
});
```

This method is reliable and works all the time without any failure.

#### Make sure that:

1. You're using Chrome [Canary](https://www.google.com/intl/en/chrome/browser/canary.html), beta or dev
2. You enabled flag `Web Audio Input` via `chrome://flags`

#### Possible issues/failures:

Do you know "RecordRTC" fails recording audio because following conditions fails:

1. Sample rate and channel configuration must be the same for input and output sides on Windows i.e. audio input/output devices mismatch
2. Only the Default microphone device can be used for capturing.
3. The requesting scheme is none of the following: http, https, chrome, extension's, or file (only works with `--allow-file-access-from-files`)
4. The browser cannot create/initialize the metadata database for the API under the profile directory

If you see this error message: `Uncaught Error: SecurityError: DOM Exception 18`; it means that you're using `HTTP`; whilst your webpage is loading worker file (i.e. `audio-recorder.js`) from `HTTPS`. Both files's (i.e. `RecordRTC.js` and `audio-recorder.js`) scheme MUST be same!

#### Saving to disk failures:

1. You're using chrome `incognito` mode
2. **RecordRTC** created **duplicate** temporary file
3. The requesting scheme is none of the following: `http`, `https`, `chrome`, extension's, or `file` (only works with `--allow-file-access-from-files`)
4. The browser cannot create/initialize the metadata database for the API under the profile directory

Click **Save to Disk** button; new tab will open; **right-click** over video and choose **Save video as...** option from context menu.

#### Browser Support

[RecordRTC Demo](https://webrtc-experiment.appspot.com/RecordRTC/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

#### Credits

1. [Recorderjs](https://github.com/mattdiamond/Recorderjs) for audio recording
2. [whammy](https://github.com/antimatter15/whammy) for video recording

#### Spec & Reference

1. [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)

#### License

[RecordRTC](https://webrtc-experiment.appspot.com/RecordRTC/) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
