#### RecordRTC: WebRTC audio/video recording / [Demo](https://webrtc-experiment.appspot.com/RecordRTC/)

[RecordRTC](https://webrtc-experiment.appspot.com/RecordRTC.js) allows you record audio and/or video streams.

Note: For Mozilla Firefox; you can try [AudioVideoRecorder.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/AudioVideoRecorder).

=

##### Features

1. You can record audio in WAV format
2. You can record video in WebM format
3. You can record video as animated GIF image

Other features are:

1. Writes recorded file on disk and returns file URL
2. It is your choice to get file URL, DataURL, or a real `Blob` object

=

##### How to use RecordRTC?

```html
<script src="https://webrtc-experiment.appspot.com/RecordRTC.js"></script>
```

=

##### How to record video?

```javascript
var recorder = RecordRTC({
	video: HTMLVideoElement
});

/* start recording video */
recorder.recordVideo();

/* stop recording video and save recorded file to disk */
recorder.stopVideo(function(videoURL) {
   window.open(videoURL);
});
```

=

##### How to record animated GIF image?

```html
<script src="https://webrtc-experiment.appspot.com/gif-recorder.js"></script>
```

```javascript
var recorder = RecordRTC({
	video: HTMLVideoElement,
	
	// Number: frame per second
	// Default value of "frameRate" is 200
	frameRate: 200,
	
	// Sets quality of color quantization (conversion of images to the 
	// maximum 256 colors allowed by the GIF specification). 
	// -----
	// Default value of "quality" is 10
	// Lower values (minimum = 1) produce better colors
	// Values greater than 20 do not yield significant improvements in speed.
	quality: 10
});

/* start recording gif */
recorder.recordGIF();

/* stop recording gif and save recorded file to disk */
recorder.stopGIF(function(gifURL) {
   window.open(gifURL);
});
```

=

##### How to record audio?

```html
<script src="https://webrtc-experiment.appspot.com/audio-recorder.js"></script>
```

```javascript
var recorder = RecordRTC({
	stream: MediaStream || LocalMediaStream,
	audioWorkerPath: '/audio-recorder.js'
});

/* start recording audio */
recorder.recordAudio();

/* stop recording audio and save recorded file to disk */
recorder.stopAudio(function(audioURL) {
   window.open(audioURL);
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
formData.append('key', blob);

xhr.send(formData);
```

=

##### Get File URL

```javascript
window.open( recorder.toURL() );
```

=

##### Save to Disk

```javascript
recorder.save();
```

It is recommended to use `stopAudio`, `stopGIF` and `stopVideo` **callback parameter** to get recorded file URL or recorded Blob.

```javascript
recorder.stopVideo(function(videoURL) {
   window.open(videoURL);
});

recorder.stopGIF(function(gifURL) {
   window.open(gifURL);
});

recorder.stopAudio(function(audioURL) {
   window.open(audioURL);
});
```

This method is reliable and works all the time without any failure. However, it fails on `incognito` mode.

You can use like this too:

```javascript
recorder.stopVideo();
recorder.stopGIF();
recorder.stopAudio();
```

=

##### Make sure that:

1. You're using Chrome [Canary](https://www.google.com/intl/en/chrome/browser/canary.html), beta or dev
2. You enabled flag `Web Audio Input` via `chrome://flags`

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

##### Saving to disk failures:

1. You're using chrome `incognito` mode
2. **RecordRTC** created **duplicate** temporary file
3. The requesting scheme is none of the following: `http`, `https`, `chrome`, extension's, or `file` (only works with `--allow-file-access-from-files`)
4. The browser cannot create/initialize the metadata database for the API under the profile directory

Click **Save to Disk** button; new tab will open; **right-click** over video and choose **Save video as...** option from context menu.

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

[RecordRTC Demo](https://webrtc-experiment.appspot.com/RecordRTC/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

=

##### Credits

1. [Recorderjs](https://github.com/mattdiamond/Recorderjs) for audio recording
2. [whammy](https://github.com/antimatter15/whammy) for video recording

=

##### Spec & Reference

1. [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)

=

##### License

[RecordRTC](https://webrtc-experiment.appspot.com/RecordRTC/) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
