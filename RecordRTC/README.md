====
# [RecordRTC](http://bit.ly/RecordRTC): WebRTC audio/video recording / [Demo](http://bit.ly/RecordRTC-Demo)

## How to record audio?

```javascript
var recorder = RecordRTC({
	stream: stream,
	
	/* For audio, there is a worker javascript file: audio-recorder.js
	   You MUST put this file in the same directory where you put HTML; 
	   otherwise set location of this worker file like this:
	*/
	audioWorkerPath: '/audio-recorder.js'
});

/* start recording audio */
recorder.recordAudio();

/* stop recording audio */
recorder.stopAudio();   

/* save recorded audio to disk */
recorder.save();    

/* get blob URL to play audio directly in the browser */    
audio.src = recorder.getBlob();
```

## How to record video?

```javascript
var recorder = RecordRTC({
	video: video
});

/* start recording video */
recorder.recordVideo();

/* stop recording video */
recorder.stopVideo();   

/* save recorded video to disk */
recorder.save();    

/* get blob URL to play video directly in the browser */    
video.src = recorder.getBlob();
```

## Make sure that:

1. You're using Chrome [Canary](https://www.google.com/intl/en/chrome/browser/canary.html)
2. You enabled flag `Web Audio Input` via `chrome://flags`

## Possible issues/failures:

It is appeared that audio-recording has many chances of failures.

Possible audio-recording failures:

1. Different audio input/output devices
2. You're using chrome stable/dev/beta
3. `Web Audio Input` flag is not enabled on `chrome canary`

## Saving to disk failures:

1. You're using chrome `incognito` mode
2. `RecordRTC` created **duplicate** temporary file
3. the requesting scheme is none of the following: `http`, `https`, `chrome`, extension's, or `file` (only works with `--allow-file-access-from-files`)
4. the browser cannot create/initialize the metadata database for the API under the profile directory

Click `Save to Disk` button; new tab will open; right-click over video and choose `Save video as...` option from context menu.

## FAQ

**How to record audio and video in a single stream?**

It is work in progress.

**How to save audio/video in many formats?**

It is work in progress.

====
# Browser Support

[RecordRTC Demo](http://bit.ly/RecordRTC-Demo) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

====
## Credits

1. [Recorderjs](https://github.com/mattdiamond/Recorderjs) / Audio Recording
2. [whammy](https://github.com/antimatter15/whammy) / Video Recording

====
## Spec & Reference

1. [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)

====
## License

[RecordRTC](http://bit.ly/RecordRTC) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
