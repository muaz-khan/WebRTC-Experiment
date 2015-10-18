## [RecordRTC to PHP](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-PHP) / [Try LIVE Demo](https://www.webrtc-experiment.com/RecordRTC/PHP/)

> This demo allows you record and upload to PHP server. Files on PHP server are auto-deleted as soon as you leave this page. 
> 
> This demo runs top over RecordRTC: [https://github.com/muaz-khan/RecordRTC](https://github.com/muaz-khan/RecordRTC)
>
> This demo works in Chrome, Firefox, Opera and Microsoft Edge. It even works on Android devices.

Following snippets explains how to POST recorded audio/video files to PHP server. It captures `Blob` and POST them using XHR2/FormData.

# PHP code

```php
<?php
foreach(array('video', 'audio') as $type) {
    if (isset($_FILES["${type}-blob"])) {
        
		$fileName = $_POST["${type}-filename"];
        $uploadDirectory = DIR.'/uploads/'.$fileName;
        
        if (!move_uploaded_file($_FILES["${type}-blob"]["tmp_name"], $uploadDirectory)) {
            echo(" problem moving uploaded file");
        }
		
		echo($uploadDirectory);
    }
}
?>
```

# JavaScript code

```javascript
var fileType = 'video'; // or "audio"
var fileName = 'ABCDEF.webm';  // or "wav"

var formData = new FormData();
formData.append(fileType + '-filename', fileName);
formData.append(fileType + '-blob', blob);

xhr('save.php', formData, function (fName) {
    window.open(location.href + fName);
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

## RecordRTC Demos

1. [RecordRTC to Node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-Nodejs)
2. [RecordRTC to PHP](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-PHP)
3. [RecordRTC to ASP.NET MVC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-ASPNETMVC)
4. [RecordRTC & HTML-2-Canvas i.e. Canvas/HTML Recording!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/Canvas-Recording)
5. [MRecordRTC i.e. Multi-RecordRTC!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/MRecordRTC)
6. [RecordRTC on Ruby!](https://github.com/cbetta/record-rtc-experiment)
7. [RecordRTC over Socket.io](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-over-Socketio)
8. [ffmpeg-asm.js and RecordRTC! Audio/Video Merging & Transcoding!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/ffmpeg)
9. [RecordRTC / PHP / FFmpeg](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/PHP-and-FFmpeg)
10. [Record Audio and upload to Nodejs server](https://www.npmjs.org/package/record-audio)
11. [ConcatenateBlobs.js](https://github.com/muaz-khan/ConcatenateBlobs) - Concatenate multiple recordings in single Blob!
12. [Remote stream recording](https://www.webrtc-experiment.com/demos/remote-stream-recording.html)
13. [Mp3 or Wav Recording](https://www.webrtc-experiment.com/RecordRTC/Record-Mp3-or-Wav.html)

## RecordRTC Documentation

1. [RecordRTC API Reference](http://RecordRTC.org/RecordRTC.html)
2. [MRecordRTC API Reference](http://RecordRTC.org/MRecordRTC.html)
3. [MediaStreamRecorder API Reference](http://RecordRTC.org/MediaStreamRecorder.html)
5. [StereoAudioRecorder API Reference](http://RecordRTC.org/StereoAudioRecorder.html)
6. [WhammyRecorder API Reference](http://RecordRTC.org/WhammyRecorder.html)
7. [Whammy API Reference](http://RecordRTC.org/Whammy.html)
8. [CanvasRecorder API Reference](http://RecordRTC.org/CanvasRecorder.html)
9. [GifRecorder API Reference](http://RecordRTC.org/GifRecorder.html)
10. [Global API Reference](http://RecordRTC.org/global.html)


## License

[RecordRTC.js](https://github.com/muaz-khan/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com).
