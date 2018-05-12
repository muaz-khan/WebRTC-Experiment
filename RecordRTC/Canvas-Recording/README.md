# Canvas+WebPage Recording using RecordRTC

Record entire webpage, part of webpage eg. a DIV, Canvas2D animatino, WebGL animation, videos+webpage, or any activity on the webpage.

## Demos

1. [WebPage+Canvas Recording](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/webpage-recording.html)
2. [HTML5 Canvas Dashboard + 2D Animation Recording](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/record-canvas-drawings.html)
3. [HTML5 2D Animation Recording](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/Canvas-Animation-Recording.html)
4. [HTML5 2D Animation + Microphone Recording](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/Canvas-Animation-Recording-Plus-Microphone.html)
5. [HTML5 2D Animation + Mp3 Recording](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/Canvas-Animation-Recording-Plus-Mp3.html)
6. [HTML5 2D Animation + Microphone + Mp3 Recording](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/Canvas-Animation-Recording-Plus-Microphone-Plus-Mp3.html)
7. [WebGL Animation Recording](https://www.webrtc-experiment.com/RecordRTC/webgl/)
8. [plotly - WebGL Recording](https://www.webrtc-experiment.com/RecordRTC/plotly.html)

# How to use?

```html
<script src="https://cdn.WebRTC-Experiment.com/RecordRTC.js"></script>
<script src="https://cdn.webrtc-experiment.com/screenshot.js"></script>
<div id="element-to-record" style="width:100%;height:100%;background:green;"></div>
<script>
var elementToRecord = document.getElementById('element-to-record');
var recorder = RecordRTC(elementToRecord, {
    type: 'canvas',
    showMousePointer: true,
    useWhammyRecorder: true
});
recorder.startRecording();
recorder.stopRecording(function(url) {
    window.open(url);
});
</script>
```

## Record `<canvas>`

```html
<script src="https://cdn.webrtc-experiment.com/RecordRTC/Whammy.js"></script>
<script src="https://cdn.webrtc-experiment.com/RecordRTC/CanvasRecorder.js"></script>
<canvas></canvas>
<script>
var canvas = document.querySelector('canvas');
var recorder = new CanvasRecorder(window.canvasElementToBeRecorded, {
    disableLogs: false
});

// start recording <canvas> drawings
recorder.record();

// a few minutes later
recorder.stop(function(blob) {
    var url = URL.createObjectURL(blob);
    window.open(url);
});
</script>
```

Watch a video: https://vimeo.com/152119435


## License

[RecordRTC.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
