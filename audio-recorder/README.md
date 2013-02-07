Code is not mine! Copryright of this js-file goes to: https://github.com/mattdiamond/Recorderjs

====
# Browser Support
[WebRTC Experiments](https://webrtc-experiment.appspot.com) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

This code is used to record audio; that’s why it is included here. 

Here is how I used it in my [Plugin-free call](https://webrtc-experiment.appspot.com/calls/) experiment:

First of all, link this: https://bit.ly/webrtc-recorder [You MUST use HTTPS/SSL. Otherwise, download [both js-files](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/audio-recorder) and host on your own server]

```javascript
// credit of "recorder.js" goes to someone else
window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
window.URL = window.URL || window.webkitURL;

var recorder, audioContext;

// A button to start recording audio-stream
var recorderParent = document.getElementsByClassName('recorder')[0];

// I called this method "recordAudio" in the "peer.onaddstream" event
// when remote stream starts flowing
function recordAudio(stream) {
	if(global.recordAudio && recorderParent) 
	{
		recorderParent.innerHTML = 'Download WAV';
		recorderParent.style.cursor = 'pointer';
	}
    audioContext = new AudioContext;
    
    var input = audioContext.createMediaStreamSource(stream);
    input.connect(audioContext.destination);
    recorder = new window.Recorder(input);

    recorder && recorder.record();
}

if(recorderParent) recorderParent.onclick = function() {
	if(!global.recordAudio || !global.isGotRemoteStream) return;
	
	recorder && recorder.stop();
        
	// create WAV download link using audio data blob
	createDownloadLink();

	recorder && recorder.clear();

	if(recorderParent) recorderParent.style.display = 'none';
};

var recordings = document.getElementById('recordings');
function createDownloadLink() {
    recorder && recorder.exportWAV(function (blob) {
        var url = URL.createObjectURL(blob);
        var li = document.createElement('li');
        var au = document.createElement('audio');
        var hf = document.createElement('a');

        au.controls = true;
        au.src = url;
        hf.href = url;
        hf.download = new Date().toISOString() + '.wav';
        hf.innerHTML = hf.download;
        li.appendChild(au);
        li.appendChild(hf);

        if (recordings) recordings.insertBefore(li, recordings.childNodes[0]);
    });
}
```


| A few top-level [WebRTC Experiments](https://webrtc-experiment.appspot.com)        |
| ------------- |
| [Video Hangout](https://webrtc-experiment.appspot.com/video-conferencing/) : *many to many* |
| [Video Broadcast](https://webrtc-experiment.appspot.com/broadcast/) : *one to many* |
| [File Hangout](https://webrtc-experiment.appspot.com/file-hangout/) : *many to many* |
| [File Broadcast](https://webrtc-experiment.appspot.com/file-broadcast/) : *one to many* |
| [Chat Hangout](https://webrtc-experiment.appspot.com/chat-hangout/) : *many to many* |
| [Chat Broadcast](https://webrtc-experiment.appspot.com/chat/) : *one to many*  |
| [Audio Broadcast](https://webrtc-experiment.appspot.com/audio-broadcast/) : *one to many* |
| [Screen Sharing](https://webrtc-experiment.appspot.com/screen-broadcast/) : *one to many* |


| A few documents for newbies and beginners        |
| ------------- |
| [How to use RTCPeerConnection.js?](https://webrtc-experiment.appspot.com/docs/how-to-use-rtcpeerconnection-js-v1.1.html) |
| [RTCDataChannel for Beginners](https://webrtc-experiment.appspot.com/docs/rtc-datachannel-for-beginners.html) |
| [How to use RTCDataChannel?](https://webrtc-experiment.appspot.com/docs/how-to-use-rtcdatachannel.html) - single code for both canary and nightly |
| [WebRTC for Beginners: A getting stared guide!](https://webrtc-experiment.appspot.com/docs/webrtc-for-beginners.html) |
| [WebRTC for Newbies ](https://webrtc-experiment.appspot.com/docs/webrtc-for-newbies.html) |
| [How to broadcast video using RTCWeb APIs?](https://webrtc-experiment.appspot.com/docs/how-to-broadcast-video-using-RTCWeb-APIs.html) |
| [How to share audio-only streams?](https://webrtc-experiment.appspot.com/docs/how-to-share-audio-only-streams.html) |
| [How to broadcast files using RTCDataChannel APIs?](https://webrtc-experiment.appspot.com/docs/how-file-broadcast-works.html) |
| [How to use Plugin-free calls in your own site?](https://webrtc-experiment.appspot.com/docs/how-to-use-plugin-free-calls.html) - JUST 3 lines of code! |


====
## License & Credits

Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - A link back is MUST! - All rights reserved!
