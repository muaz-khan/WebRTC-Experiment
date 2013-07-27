## MediaStreamRecorder.js / [Demo](https://www.webrtc-experiment.com/MediaStreamRecorder/)

A cross-browser implementation to record audio/video streams.

=

#### Record audio using MediaStreamRecorder.js

```html
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder.js"> </script>
```

```javascript
var mediaConstraints = {
    audio: true
};

navigator.mozGetUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

function onMediaSuccess(stream) {
    var mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'audio/ogg';
    mediaRecorder.ondataavailable = function (blob) {
        // POST/PUT "Blob" using FormData/XHR2

        // or read as DataURL
        var reader = new FileReader();
        reader.onload = function (e) {
            var dataURL = e.target.result;
            window.open(dataURL);
        };
        reader.readAsDataURL(blob);
    };
    mediaRecorder.start(3000);
}

function onMediaError(e) {
    console.error('media error', e);
}
```

=

#### Record video/gif using MediaStreamRecorder.js

```html
<script src="https://www.webrtc-experiment.com/MediaStreamRecorder.js"> </script>
```

```javascript
var mediaConstraints = {
    video: true
};

navigator.mozGetUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

function onMediaSuccess(stream) {
    var mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'video/webm';
	
    // for gif recording
    // mediaRecorder.mimeType = 'image/gif';
	
    mediaRecorder.videoWidth = 320;
    mediaRecorder.videoHeight = 240;
	
    mediaRecorder.ondataavailable = function (blob) {
        // POST/PUT "Blob" using FormData/XHR2

        // or read as DataURL
        var reader = new FileReader();
        reader.onload = function (e) {
            var dataURL = e.target.result;
            window.open(dataURL);
        };
        reader.readAsDataURL(blob);
    };
    mediaRecorder.start(3000);
}

function onMediaError(e) {
    console.error('media error', e);
}
```

=

##### Browser Support

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

#### Demos

1. [Audio Recording using MediaStreamRecorder](https://www.webrtc-experiment.com/MediaStreamRecorder/demos/audio-recorder.html)
2. [Video/Gif Recording using MediaStreamRecorder](https://www.webrtc-experiment.com/MediaStreamRecorder/demos/video-recorder.html)

=

##### License

[MediaStreamRecorder.js](https://github.com/streamproc/MediaStreamRecorder) library is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://github.com/muaz-khan) and [neizerth](https://github.com/neizerth).
