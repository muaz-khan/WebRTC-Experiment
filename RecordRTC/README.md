====
# [RecordRTC: WebRTC audio/video recording](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RecordRTC/)

## How to record audio?

```javascript
var recorder = RecordRTC({
	stream: stream
});

/* start recording audio */
recorder.recordAudio();

/* stop recording audio */
recorder.stopAudio();   

/* save recorded audio to disk */
recorder.save();    

/* get blob URL to play audio directly in the browser */    
audio.src = recorder.getBlob();

/* For audio, there is a worker javascript file: audio-recorder.js
   You MUST put this file in the same directory where you put HTML; 
   otherwise set location of this worker file like this:
*/
window.AudioRecorder = ‘/audio-recorder.js’;
window.AudioRecorder = ‘/js/audio-recorder.js’;
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

## FAQ

**How to record audio and video in a single stream?**

It is work in progress.

**How to save audio/video in many formats?**

It is work in progress.

====
# Browser Support

This [WebRTC Experiment](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RecordRTC/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

====
## Credits

1. [Audio Recording](https://github.com/mattdiamond/Recorderjs)
2. [Video Recording](https://github.com/antimatter15/whammy)

====
## Demo

[RecordRTC: WebRTC audio/video recording](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RecordRTC/)

====
## Spec & Reference

1. [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
2. [Audio Recorder](http://webaudiodemos.appspot.com/AudioRecorder/index.html)