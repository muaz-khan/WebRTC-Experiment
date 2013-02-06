Code is not mine! Copryright of this js-file goes to: https://github.com/mattdiamond/Recorderjs

This code is used to record audio; that’s why it is included here. 

Here is how I used it in my [Plugin-free call](https://webrtc-experiment.appspot.com/calls/) experiment:

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