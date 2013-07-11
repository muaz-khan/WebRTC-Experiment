#### Audio+Video Recording using MediaRecorder / [Demo](https://webrtc-experiment.appspot.com/AudioVideoRecorder/)

Only audio-relevant parts are supported in the moment. Audio+Video recording coming soon.

Support? Current/Latest Firefox Nightly (ONLY). Understood? Download from: http://nightly.mozilla.org/

----

##### How to use RecordRTC?

```html
<script src="https://webrtc-experiment.appspot.com/AudioVideoRecorder.js"></script>
```

----

#### How to record audio?

```javascript
AudioVideoRecorder({

    // MediaStream object
    stream: MediaStream,

    // mime-type of the output blob
    mimeType: 'audio/ogg',

    // set time-interval to get the blob
    interval: 5000,

    // get access to the recorded blob
    onRecordedMedia: function (blob) {
        // POST/PUT blob using FormData/XMLHttpRequest

        // or readAsDataURL
        var reader = new FileReader();
        reader.onload = function (e) {
            hyperlink.href = e.target.result;
        };
        reader.readAsDataURL(blob);
    }

});
```

----

#### Browser Support

[AudioVideoRecorder.js](https://webrtc-experiment.appspot.com/AudioVideoRecorder/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Nightly](http://nightly.mozilla.org/) |

----

#### License

[AudioVideoRecorder.js](https://webrtc-experiment.appspot.com/AudioVideoRecorder/) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
