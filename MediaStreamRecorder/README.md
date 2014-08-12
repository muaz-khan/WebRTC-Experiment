## [MediaStreamRecorder.js](https://github.com/streamproc/MediaStreamRecorder) - [Demos](https://www.webrtc-experiment.com/msr/)

A cross-browser implementation to record audio/video streams:

1. MediaStreamRecorder can record both audio and video in single WebM file on Firefox.
2. MediaStreamRecorder can record audio as WAV and video as either WebM or animated gif on Chrome.

MediaStreamRecorder is useful in scenarios where you're planning to submit/upload recorded blobs in realtime to the server! You can get blobs after specific time-intervals.

=

##### [Demos](https://www.webrtc-experiment.com/msr/) using [MediaStreamRecorder.js](https://github.com/streamproc/MediaStreamRecorder) library

| Experiment Name        | Demo           | Source Code |
| ------------- |-------------|-------------|
| **Audio Recording** | [Demo](https://www.webrtc-experiment.com/msr/audio-recorder.html) | [Source](https://github.com/streamproc/MediaStreamRecorder/tree/master/demos/audio-recorder.html) |
| **Video Recording** | [Demo](https://www.webrtc-experiment.com/msr/video-recorder.html) | [Source](https://github.com/streamproc/MediaStreamRecorder/tree/master/demos/video-recorder.html) |
| **Gif Recording** | [Demo](https://www.webrtc-experiment.com/msr/gif-recorder.html) | [Source](https://github.com/streamproc/MediaStreamRecorder/tree/master/demos/gif-recorder.html) |

=

There is a similar project: **RecordRTC**! [Demo](https://www.webrtc-experiment.com/RecordRTC/) - [Documentation](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC)

=

## How to link scripts?

```html
<script src="/MediaStreamRecorder-v1.2.js" data-require="MediaRecorder" data-scripts-dir="/"> </script>
```

`data-require`: Comma separated modules names. Supported values are `StereoRecorder,MediaRecorder,WhammyRecorder,GifRecorder`.

```html
// to record audio only on chrome
data-require="StereoRecorder"

// to record audio only on firefox
data-require="MediaRecorder"

// to record audio both on chrome and firefox
data-require="MediaRecorder,StereoRecorder"

// to record only video (both on chrome and firefox)
data-require="MediaRecorder,WhammyRecorder"

// to record only gif
data-require="GifRecorder"

// to record everything
data-require="StereoRecorder,MediaRecorder,WhammyRecorder,GifRecorder"
```

`data-scripts-dir="/"`: Location of the directory where all required script files resides.

```html
// root-directory
data-scripts-dir="/"

// sub/nested directory
data-scripts-dir="../subdir/"

// same directory where HTML-file is placed
data-scripts-dir="../"

// you can use absolute-URIs
data-scripts-dir="//cdn.webrtc-experiment.com/msr/"
```

You can manually link the files as well; use `data-manual=true`:

```html
<!--
    This file provides public-API for all recording scenarios
    You need to use "data-manual" only with this script.
-->
<script src="MediaStreamRecorder-v1.2.js" data-manual="true"> </script>

<!-- cross-browser getUserMedia/AudioContext declarations -->
<script src="../common/Cross-Browser-Declarations.js"> </script>

<!-- stores AudioContext-level objects in memory for re-usability purposes -->
<script src="../common/ObjectStore.js"> </script>

<!-- both these files are used to support audio recording in chrome -->        
<script src="../AudioStreamRecorder/StereoRecorder.js"> </script>
<script src="../AudioStreamRecorder/StereoAudioRecorder.js"> </script>

<!-- this one uses MediaRecorder draft for voice & video recording (works only in Firefox) -->
<script src="../AudioStreamRecorder/MediaRecorder.js"> </script>

<!-- these files are supporting video-recording in chrome (webm) -->        
<script src="../VideoStreamRecorder/WhammyRecorder.js"> </script>
<script src="../VideoStreamRecorder/WhammyRecorderHelper.js"> </script>
<script src="../VideoStreamRecorder/lib/whammy.js"> </script>

<!-- these files are used to support gif-recording in both chrome & firefox -->
<script src="../VideoStreamRecorder/GifRecorder.js"> </script>
<script src="../VideoStreamRecorder/lib/gif-encoder.js"> </script>
```

=

#### Record audio+video on Firefox in single WebM

```html
<script src="//cdn.webrtc-experiment.com/MediaStreamRecorder-v1.2.js" data-require="MediaRecorder" data-scripts-dir="/msr/"> </script>
```

```javascript
var mediaConstraints = {
    audio: !!navigator.mozGetUserMedia, // don't forget audio!
    video: true                         // don't forget video!
};

navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

function onMediaSuccess(stream) {
    var mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'video/webm';
    mediaRecorder.ondataavailable = function (blob) {
        // POST/PUT "Blob" using FormData/XHR2
        var blobURL = URL.createObjectURL(blob);
        document.write('&lt;a href="' + blobURL + '"&gt;' + blobURL + '&lt;/a&gt;');
    };
    mediaRecorder.start(3000);
}

function onMediaError(e) {
    console.error('media error', e);
}
```

=

#### How to manually stop recordings?

```javascript
mediaRecorder.stop();
```

=

#### Record only audio on Chrome/Firefox

```html
<script src="//cdn.webrtc-experiment.com/MediaStreamRecorder-v1.2.js" data-require="StereoRecorder,MediaRecorder" data-scripts-dir="/msr/"> </script>
```

```javascript
var mediaConstraints = {
    audio: true
};

navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

function onMediaSuccess(stream) {
    var mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'audio/ogg';
    mediaRecorder.ondataavailable = function (blob) {
        // POST/PUT "Blob" using FormData/XHR2
        var blobURL = URL.createObjectURL(blob);
        document.write('&lt;a href="' + blobURL + '"&gt;' + blobURL + '&lt;/a&gt;');
    };
    mediaRecorder.start(3000);
}

function onMediaError(e) {
    console.error('media error', e);
}
```

=

#### Record only-video on chrome

```html
<script src="//cdn.webrtc-experiment.com/MediaStreamRecorder-v1.2.js" data-require="WhammyRecorder" data-scripts-dir="/msr/"> </script>
```

```javascript
var mediaConstraints = {
    video: true
};

navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

function onMediaSuccess(stream) {
    var mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'video/webm';
	
    // for gif recording
    // mediaRecorder.mimeType = 'image/gif';
	
    mediaRecorder.videoWidth = 320;
    mediaRecorder.videoHeight = 240;
	
    mediaRecorder.ondataavailable = function (blob) {
        // POST/PUT "Blob" using FormData/XHR2
        var blobURL = URL.createObjectURL(blob);
        document.write('&lt;a href="' + blobURL + '"&gt;' + blobURL + '&lt;/a&gt;');
    };
    mediaRecorder.start(3000);
}

function onMediaError(e) {
    console.error('media error', e);
}
```

=

##### How to upload recorded files using PHP?

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
| Opera | [Stable](http://www.opera.com/) / [NEXT](http://www.opera.com/computer/next)  |
| Android | [Chrome](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) / [Firefox](https://play.google.com/store/apps/details?id=org.mozilla.firefox) / [Opera](https://play.google.com/store/apps/details?id=com.opera.browser) |

=

##### Contributors

1. [Muaz Khan](https://github.com/muaz-khan)
2. [neizerth](https://github.com/neizerth)
3. [andersaloof](https://github.com/andersaloof)

=

##### License

[MediaStreamRecorder.js](https://github.com/streamproc/MediaStreamRecorder) library is released under [MIT licence](https://www.webrtc-experiment.com/licence/).
