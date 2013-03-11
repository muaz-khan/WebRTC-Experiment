====
## Pre-recorded media streaming / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/Pre-recorded-Media-Streaming/)

1. Streaming pre-recorded video (media file)
2. Currently, using Firebase for streaming chunks of data because MediaSource APIs are only supported on chrome canary which has unreliable RTP (RTCDataChannel) streams.
3. Streaming WebM files only (in the moment!)
4. WebM file's size must be less than 1000KB; otherwise it will fail. It is a bug will be fixed soon.

====
## It is an early release!

This experiment is an early release. In future, RTCDataChannel APIs will be used to stream pre-recorded media in realtime!

Media Stream APIs are not made for streaming pre-recorded Medias, though!

We are waiting "video.captureStream" implementation that is proposed for pre-recorded media streaming, unfortunately still in draft!

====
## In future, to stream pre-recorded medias

```javascript
partial interface HTMLMediaElement {
    readonly attribute MediaStream stream;

    MediaStream captureStream();
    MediaStream captureStreamUntilEnded();
    readonly attribute boolean audioCaptured;

    attribute any src;
};
```

====
## Spec Reference

1. http://www.w3.org/TR/streamproc/
2. https://dvcs.w3.org/hg/html-media/raw-file/tip/media-source/media-source.html

====
## Browser Support
[WebRTC Experiments](https://webrtc-experiment.appspot.com) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

====
## License & Credits

Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - A link back is MUST! - All rights reserved!
