## [RecordRTC to PHP](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-PHP) / [Try LIVE Demo](https://www.webrtc-experiment.com/RecordRTC/PHP/)

Please check tutorial: [RecordRTC and Upload to PHP Server](http://www.muazkhan.com/2017/08/recordrtc-and-upload-to-php-server.html)

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
    
        echo 'uploads/';
        
        $fileName = $_POST["${type}-filename"];
        $uploadDirectory = 'uploads/'.$fileName;
        
        if (!move_uploaded_file($_FILES["${type}-blob"]["tmp_name"], $uploadDirectory)) {
            echo(" problem moving uploaded file");
        }
		
        echo($fileName);
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

1. [RecordRTC to Node.js](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-Nodejs)
2. [RecordRTC to PHP](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-PHP)
3. [RecordRTC to ASP.NET MVC](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-ASPNETMVC)
4. [RecordRTC & HTML-2-Canvas i.e. Canvas/HTML Recording!](https://github.com/muaz-khan/RecordRTC/tree/master/Canvas-Recording)
5. [MRecordRTC i.e. Multi-RecordRTC!](https://github.com/muaz-khan/RecordRTC/tree/master/MRecordRTC)
6. [RecordRTC on Ruby!](https://github.com/cbetta/record-rtc-experiment)
7. [RecordRTC over Socket.io](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-over-Socketio)
8. [ffmpeg-asm.js and RecordRTC! Audio/Video Merging & Transcoding!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/ffmpeg)
9. [RecordRTC / PHP / FFmpeg](https://github.com/muaz-khan/RecordRTC/tree/master/PHP-and-FFmpeg)
10. [Record Audio and upload to Nodejs server](https://www.npmjs.org/package/record-audio)
11. [ConcatenateBlobs.js](https://github.com/muaz-khan/ConcatenateBlobs) - Concatenate multiple recordings in single Blob!
12. [Remote audio-stream recording](https://www.webrtc-experiment.com/demos/remote-stream-recording.html) or [a real p2p demo](https://www.webrtc-experiment.com/RTCMultiConnection/RecordRTC-and-RTCMultiConnection.html)
13. [Mp3 or Wav Recording](https://www.webrtc-experiment.com/RecordRTC/Record-Mp3-or-Wav.html)
14. [Record entire DIV including video, image, textarea, input, drag/move/resize, everything](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/)
15. [Record canvas 2D drawings, lines, shapes, texts, images, drag/resize/enlarge/move via a huge drawing tool!](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/record-canvas-drawings.html)
16. [Record Canvas2D Animation](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/Canvas-Animation-Recording.html)
17. [WebGL animation recording](https://www.webrtc-experiment.com/RecordRTC/webgl/)
18. [Plotly - WebGL animation recording](https://www.webrtc-experiment.com/RecordRTC/plotly.html)

## RecordRTC Documentation

1. [RecordRTC API Reference](https://RecordRTC.org/RecordRTC.html)
2. [MRecordRTC API Reference](https://RecordRTC.org/MRecordRTC.html)
3. [MediaStreamRecorder API Reference](https://RecordRTC.org/MediaStreamRecorder.html)
5. [StereoAudioRecorder API Reference](https://RecordRTC.org/StereoAudioRecorder.html)
6. [WhammyRecorder API Reference](https://RecordRTC.org/WhammyRecorder.html)
7. [Whammy API Reference](https://RecordRTC.org/Whammy.html)
8. [CanvasRecorder API Reference](https://RecordRTC.org/CanvasRecorder.html)
9. [GifRecorder API Reference](https://RecordRTC.org/GifRecorder.html)
10. [Global API Reference](https://RecordRTC.org/global.html)


## License

[RecordRTC.js](https://github.com/muaz-khan/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com).
