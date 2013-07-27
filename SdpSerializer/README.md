## SdpSerializer.js / [Demo](https://www.webrtc-experiment.com/SdpSerializer/demo.html)

An easiest way to modify SDP. It is an object-oriented way of sdp declaration, manipulation and serialization.

=

##### How to use? / [Demo](https://www.webrtc-experiment.com/SdpSerializer/demo.html)

```html
<script src="https://www.webrtc-experiment.com/SdpSerializer.js"></script>
```

```javascript
var serializer = new SdpSerializer(sdp);

// remove entire audio m-line
serializer.audio.remove();

// change order of a payload type in video m-line
serializer.video.payload(117).order(0);

// inject new-line after a specific payload type; under video m-line
serializer.video.payload(117).newLine('a=ptime:10');

// remove a specific payload type; under video m-line
serializer.video.payload(100).remove();
   
// want to add/replace a crypto line?
serializer.video.crypto().newLine('a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:AAAAAAAAAAAAAAAAAAAAAAAAA');
   
// want to remove a crypto line?
serializer.video.crypto(80).remove();
   
// want to set direction?
serializer.video.direction.set('sendonly');
   
// want to get direction?
serializer.video.direction.get();
   
// want to remove entire audio or video track?
// usually, in video m-line:
// 0-track is always "video" stream
// 1-track will be screen sharing stream (if attached)
serializer.video.track(0).remove()
   
// get serialized sdp
sdp = serializer.deserialize();
```

=

##### Browser Support

[SdpSerializer.js](https://github.com/muaz-khan/SdpSerializer) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

=

##### License

[SdpSerializer.js](https://github.com/muaz-khan/SdpSerializer) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
