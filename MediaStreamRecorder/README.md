## MediaStreamRecorder.js / [Demo](https://www.webrtc-experiment.com/MediaStreamRecorder/)

A cross-browser implementation to record audio/video streams:

1. MediaStreamRecorder can record both audio and video in single WebM file on Firefox.
2. MediaStreamRecorder can record audio as WAV and video as either WebM or animated gif on Chrome.

=

There is a smiliar project: [RecordRTC](https://www.webrtc-experiment.com/RecordRTC/)!

=

#### Record audio+video on Firefox in single WebM

```html
<script src="//www.webrtc-experiment.com/MediaStreamRecorder.js"> </script>
```

```javascript
var mediaConstraints = {
    audio: true, // don't forget audio!
    video: true  // don't forget video!
};

navigator.mozGetUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

function onMediaSuccess(stream) {
    var mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'video/webm';
    mediaRecorder.ondataavailable = function (blob) {
        // POST/PUT "Blob" using FormData/XHR2
        window.open(URL.createObjectURL(blob));
    };
    mediaRecorder.start(3000);
}

function onMediaError(e) {
    console.error('media error', e);
}
```

=

#### Record only audio on chrome

```html
<script src="//www.webrtc-experiment.com/MediaStreamRecorder.js"> </script>
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
        window.open(URL.createObjectURL(blob));
    };
    mediaRecorder.start(3000);
}

function onMediaError(e) {
    console.error('media error', e);
}
```

=

#### Record video/gif on chrome

```html
<script src="//www.webrtc-experiment.com/MediaStreamRecorder.js"> </script>
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
        window.open(URL.createObjectURL(blob));
    };
    mediaRecorder.start(3000);
}

function onMediaError(e) {
    console.error('media error', e);
}
```

=

##### How to upload record files using PHP?

**PHP code:**

```php
<?php
foreach(array('video', 'audio') as $type) {
    if (isset($_FILES["${type}-blob"])) {
        
		$fileName = $_POST["${type}-filename"];
        $uploadDirectory = "uploads/$fileName";
        
        if (!move_uploaded_file($_FILES["${type}-blob"]["tmp_name"], $uploadDirectory)) {
            echo("problem moving uploaded file");
        }
		
		echo($uploadDirectory);
    }
}
?>
```

**JavaScript Code:**

```javascript
var fileType = 'video'; // or "audio"
var fileName = 'ABCDEF.webm';  // or "wav" or "ogg"

var formData = new FormData();
formData.append(fileType + '-filename', fileName);
formData.append(fileType + '-blob', blob);

xhr('save.php', formData, function (fileURL) {
    window.open(fileURL);
});

function xhr(url, data, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            callback(location.href + request.responseText);
        }
    };
    request.open('POST', url);
    request.send(data);
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

##### Demos using [MediaStreamRecorder.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MediaStreamRecorder) library

| Experiment Name        | Demo           | Source Code |
| ------------- |-------------|-------------|
| **Audio Recording** | [Demo](https://www.webrtc-experiment.com/msr/audio-recorder.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MediaStreamRecorder/demos/audio-recorder.html) |
| **Video/Gif Recording** | [Demo](https://www.webrtc-experiment.com/msr/video-recorder.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MediaStreamRecorder/demos/video-recorder.html) |

=

##### License

[MediaStreamRecorder.js](https://github.com/streamproc/MediaStreamRecorder) library is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://github.com/muaz-khan) and [neizerth](https://github.com/neizerth).
