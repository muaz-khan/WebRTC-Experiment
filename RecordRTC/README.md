## RecordRTC: WebRTC audio/video recording / [Demo](https://www.webrtc-experiment.com/RecordRTC/)

**RecordRTC** is a javascript-only (entire client-side) **library** for **cross-browser** audio/video recording.

=

## Features

1. **Audio recording** (both for chrome and Firefox)
2. **Video/Gif recording** (for chrome only)

=

## How to use RecordRTC?

```html
<script src="https://www.webrtc-experiment.com/RecordRTC.js"></script>
```

=

#### How to record audio?

```javascript
var recordRTC = RecordRTC(mediaStream);
recordRTC.startRecording();
recordRTC.stopRecording(function(audioURL) {
   window.open(audioURL);
});
```

=

#### How to record video?

Everything is optional except `type:'video'`:

```javascript
var options = {
   type: 'video',
   video: {
      width: 320,
      height: 240
   },
   canvas: {
      width: 320,
      height: 240
   }
};
var recordRTC = RecordRTC(mediaStream, options);
recordRTC.startRecording();
recordRTC.stopRecording(function(videoURL) {
   window.open(videoURL);
});
```

You can write same thing like this:

```javascript
var options = {
   type: 'video'
};
var recordRTC = RecordRTC(mediaStream, options);
recordRTC.startRecording();
recordRTC.stopRecording();
var blob = recordRTC.getBlob();
```

=

##### How to record animated GIF image?

Everything is optional except `type:'gif'`:

```javascript
var options = {
   type: 'gif',
   video: {
      width: 320,
      height: 240
   },
   canvas: {
      width: 320,
      height: 240
   },
   frameRate: 200,
   quality: 10
};
var recordRTC = RecordRTC(mediaStream, options);
recordRTC.startRecording();
recordRTC.stopRecording(function(gifURL) {
   window.open(gifURL);
});
```

=

##### Get Data URL

```javascript
window.open( recorder.getDataURL() );
```

=

##### Get Blob object

```javascript
blob = recorder.getBlob();
```

=

##### POST on server

Try [RecordRTC-to-PHP](https://www.webrtc-experiment.com/RecordRTC/PHP/), a demo to POST recorded audio/video files to PHP server.

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

```javascript
var fileType = 'video'; // or "audio"
var fileName = 'ABCDEF.webm';  // or "wav"

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

##### Get Virtual URL

```javascript
window.open( recorder.toURL() );
```

=

##### Save to Disk

```javascript
recorder.save();
```

=

##### Customize Buffer-Size

```javascript
var options = {
   bufferSize: 16384
};
var recordRTC = RecordRTC(audioStream, options);
```

Following values are allowed for buffer-size:

```javascript
// Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384)
```

You can write like this:

```javascript
var options = {
   'buffer-size': 16384
};
```

=

##### Customize Sample-Rate

```javascript
var options = {
   sampleRate: 96000
};
var recordRTC = RecordRTC(audioStream, options);
```

Values for sample-rate must be greater than or equal to 22050 and less than or equal to 96000.

You can write like this:

```javascript
var options = {
   'sample-rate': 16384
};
```

=

##### WinXP?

No WinXP support. Try to use Vista, Windows 7 or Windows 8.

=

##### Stereo or Mono?

Audio recording fails for `mono` audio. So, try `stereo` audio only.

=

##### Possible issues/failures:

Do you know "RecordRTC" fails recording audio because following conditions fails:

1. Sample rate and channel configuration must be the same for input and output sides on Windows i.e. audio input/output devices mismatch
2. Only the Default microphone device can be used for capturing.
3. The requesting scheme is none of the following: http, https, chrome, extension's, or file (only works with `--allow-file-access-from-files`)
4. The browser cannot create/initialize the metadata database for the API under the profile directory

If you see this error message: `Uncaught Error: SecurityError: DOM Exception 18`; it means that you're using `HTTP`; whilst your webpage is loading worker file (i.e. `audio-recorder.js`) from `HTTPS`. Both files's (i.e. `RecordRTC.js` and `audio-recorder.js`) scheme MUST be same!

=

##### Web Audio APIs requirements

1. If you're on Windows, you have to be running Windows Vista or better (will not work on Windows XP).
2. On Windows, audio input hardware must be set to the same sample rate as audio output hardware.
3. On Mac and Windows, the audio input device must be at least stereo (i.e. a mono/single-channel USB microphone WILL NOT work).

=

##### Why stereo?

If you explorer chromium code; you'll see that some APIs can only be successfully called for `WAV` files with `stereo` audio.

Stereo audio is only supported for WAV files.

...still investigating the actual issue of failure with `mono` audio.

=

We need a stream merger like ffmpeg/avconv to merge audio/video files in MKV/AVI/etc. on the server end. A few developers already implemented such thing in PHP. A demo coming soon.

Media Stream Recording API (MediaRecorder object) is being implemented by both Firefox and Chrome. RecordRTC is also using MediaRecorder API for Firefox (nightly).

RecordRTC is unable to record "mono" audio on chrome; however it seems that we can covert channels from "stereo" to "mono" using WebAudio API, though. MediaRecorder API's encoder only support 48k/16k mono audio channel (on Firefox Nightly).

=

##### Browser Support

[RecordRTC Demo](https://www.webrtc-experiment.com/RecordRTC/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |

=

##### Credits

1. [Recorderjs](https://github.com/mattdiamond/Recorderjs) for audio recording
2. [whammy](https://github.com/antimatter15/whammy) for video recording
3. [jsGif](https://github.com/antimatter15/jsgif) for video recording

=

##### Spec & Reference

1. [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
2. [MediaRecorder](https://wiki.mozilla.org/Gecko:MediaRecorder)
3. [Canvas2D](http://www.w3.org/html/wg/drafts/2dcontext/html5_canvas/)
4. [MediaStream Recording](https://dvcs.w3.org/hg/dap/raw-file/tip/media-stream-capture/MediaRecorder.html)
5. [Media Capture and Streams](http://www.w3.org/TR/mediacapture-streams/)

=

#### Apps/Libraries using RecordRTC

1. [RTCMultiConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection#recordrtc)
2. [Realtime Plugin-free Calls](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/realtime-pluginfree-calls)
3. [RecordRTC to PHP](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-PHP)

=

## License

[RecordRTC.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
