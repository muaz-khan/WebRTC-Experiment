##### Audio+Video Recording using MediaRecorder / [Demo](https://www.webrtc-experiment.com/AudioVideoRecorder/)

Only audio-relevant parts are supported in the moment. Audio+Video recording coming soon.

Support? Current/Latest Firefox Nightly (ONLY). Understood? Download from: http://nightly.mozilla.org/

=

##### RecordRTC

Try [RecordRTC](https://www.webrtc-experiment.com/RecordRTC) which is preferred.

=

##### How to use AudioVideoRecorder?

```html
<script src="https://www.webrtc-experiment.com/AudioVideoRecorder.js"></script>
```

=

##### How to record audio?

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

=

##### Browser Support

[AudioVideoRecorder.js](https://www.webrtc-experiment.com/AudioVideoRecorder/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Nightly](http://nightly.mozilla.org/) |

=

##### License

[AudioVideoRecorder.js](https://www.webrtc-experiment.com/AudioVideoRecorder/) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
