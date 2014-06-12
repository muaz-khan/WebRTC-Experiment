## Hark.js is part of <a href="http://www.RTCMultiConnection.org/">RTCMultiConnection.js</a>

```
// original source code is taken from:
// https://github.com/SimpleWebRTC/hark
// copyright goes to &yet team
```

=

## How to use?

```javascript
// https://www.rtcmulticonnection.org/hark.js

var options = {};
var speechEvents = hark(stream, options);

speechEvents.on('speaking', function () {});
speechEvents.on('stopped_speaking', function () {});
speechEvents.on('volume_change', function (volume, threshold) {});
```

=

## License

[RTCMultiConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
