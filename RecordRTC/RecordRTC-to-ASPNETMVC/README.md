#### RecordRTC to ASP.NET MVC / RecordRTC.org

This documentation explains how to POST recorded audio/video files to ASP.NET MVC (IIS) server. It captures `Blob` and POST them using XHR2/FormData.

=

##### ASP.NET MVC (CSharp) code

```csharp
[HttpPost]
public ActionResult PostRecordedAudioVideo()
{
     foreach (string upload in Request.Files)
     {
          var path = AppDomain.CurrentDomain.BaseDirectory + "uploads/";
          var file = Request.Files[upload];
          if (file == null) continue;

          file.SaveAs(Path.Combine(path, Request.Form[0]));
     }
     return Json(Request.Form[0]);
}
```

=

##### JavaScript code

```javascript
var fileType = 'video'; // or "audio"
var fileName = 'ABCDEF.webm';  // or "wav"

var formData = new FormData();
formData.append(fileType + '-filename', fileName);
formData.append(fileType + '-blob', blob);

xhr('/RecordRTC/PostRecordedAudioVideo', formData, function (fName) {
    window.open(location.href + 'uploads/' + fName);
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

1. [RecordRTC to Node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-Nodejs)
2. [RecordRTC to PHP](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-PHP)
3. [RecordRTC to ASP.NET MVC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-ASPNETMVC)
4. [RecordRTC & HTML-2-Canvas i.e. Canvas/HTML Recording!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/Canvas-Recording)
5. [MRecordRTC i.e. Multi-RecordRTC!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/MRecordRTC)
6. [RecordRTC on Ruby!](https://github.com/cbetta/record-rtc-experiment)
7. [RecordRTC over Socket.io](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-over-Socketio)

=

##### License

[RecordRTC](https://github.com/muaz-khan/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
