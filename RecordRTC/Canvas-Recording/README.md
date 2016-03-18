## Record Entire WebPage or Canvas2D

Demos:

1. [Record entire DIV including video, image, textarea, input, drag/move/resize, everything](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/)
2. [Record canvas 2D drawings, lines, shapes, texts, images, drag/resize/enlarge/move via a huge drawing tool!](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/record-canvas-drawings.html)

This [WebRTC](https://www.webrtc-experiment.com/) experiment is using [RecordRTC.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) to record HTML/Canvas into webm; where [html2canvas.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/part-of-screen-sharing) is used to capture HTML-snapshots. Those snapshots are encoded in webp; and then encoded again in webm.

You can say it: "HTML/Canvas Recording using RecordRTC"!

<a href="https://www.webrtc-experiment.com/getMediaElement/">
	<img src="https://lh5.googleusercontent.com/-mZGcj67_NTE/UtY2vw9bljI/AAAAAAAAAl0/T6lvI68bfb8/s0-I/RecordRTC-Canvas-Recording.gif" />
</a>

=

```html
<script src="https://cdn.WebRTC-Experiment.com/RecordRTC.js"></script>
<script src="https://cdn.webrtc-experiment.com/screenshot.js"></script>
<div id="elementToShare" style="width:100%;height:100%;background:green;"></div>
<script>
var elementToShare = document.getElementById('elementToShare');
var recorder = RecordRTC(elementToShare, {
    type: 'canvas',
    showMousePointer: true
});
recorder.startRecording();
recorder.stopRecording(function(url) {
    window.open(url);
});
</script>
```

=

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

Live Demo:

* https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/record-canvas-drawings.html

Watch a video: https://vimeo.com/152119435

=

[RecordRTC](https://www.webrtc-experiment.com/RecordRTC/) is a server-less (entire client-side) JavaScript library can be used to record WebRTC audio/video media streams. It supports cross-browser audio/video recording.

1. [RecordRTC to Node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-Nodejs)
2. [RecordRTC to PHP](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-PHP)
3. [RecordRTC to ASP.NET MVC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-ASPNETMVC)
4. [RecordRTC & HTML-2-Canvas i.e. Canvas/HTML Recording!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/Canvas-Recording)
5. [MRecordRTC i.e. Multi-RecordRTC!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/MRecordRTC)
6. [RecordRTC on Ruby!](https://github.com/cbetta/record-rtc-experiment)
7. [RecordRTC over Socket.io](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-over-Socketio)

=

## License

[RecordRTC.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
