#### RecordRTC to ASP.NET MVC / [Demo](https://www.webrtc-experiment.com/RecordRTC/RecordRTC-to-ASPNETMVC/)

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

=

##### License

[RecordRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
