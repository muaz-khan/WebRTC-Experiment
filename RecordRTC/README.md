====
# RecordRTC: WebRTC audio/video recording / [Demo](http://bit.ly/RecordRTC-Demo)

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

1. You're using Chrome (Canary)[https://www.google.com/intl/en/chrome/browser/canary.html]
2. You enabled flag `Web Audio Input` via `chrome://flags`

## Possible issues/failures:

1. Unfortunately, (RecordRTC)[https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RecordRTC/] is unable to record videos longer than one minute.
2. It is appeared that audio-recording has 70% percent chances of failures.

Possible audio-recording failures:

1. Different audio input/output devices
2. You're using chrome stable/dev/beta
3. `Web Audio Input` flag is not enabled on `chrome canary`

Saving to disk failures occurs because blob-URL (DataURL) gets longer than what DOM-parser can imagine/understand/expect.

```javascript
video.src = LongestBlobURL;     // works fine
a.href = LongestBlobURL;   // fails; because browser can't expect a site's URL to be so long
```

For maximum URL length, not the most precise [answer](http://stackoverflow.com/questions/3721034/how-long-an-url-can-internet-explorer-9-take), but it looks like 2083 characters in the address bar and 5165 characters when following a link.

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

====
## License

(WebRTC Experiments)[https://github.com/muaz-khan/WebRTC-Experiment] are released under (MIT licence)[https://webrtc-experiment.appspot.com/licence/] . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
