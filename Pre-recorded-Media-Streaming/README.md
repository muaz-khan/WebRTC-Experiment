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

// we will be able to get stream from video like this:
// video.src = 'your pre-recorded webm/etc. video';
// var preRecordedStream = video.captureStream();
// peer.addStream ( preRecordedStream );
```

====
## How this experiment works?

1. Getting access to WebM video file using File API
2. Reading it as array buffer using File Reader API
3. Splitting buffers in predefined small chunks; and posting /transmitting those chunks in a loop using Firebase.
4. As soon as other party receives first chunk; MediaSource API will start playing video without waiting for all chunks to be download!
5. You can save/store/record those chunks in any database; because it is a typed array [Uint8Array] in text form.

====
## Let's say you want to:

1. Stream 5min to 7 min of video data i.e. total two minutes of video data over all sockets from first WebM file.
2. Then, quickly you want to stream 17 to 19 minutes i.e. total two minutes of data from second WebM file.
3. Then you want to stream 11 to 15 minutes i.e. total 4 minutes of data from first WebM file.

You can do all such things today!

In simple words; you can stream part of video from first WebM file; part of video from second WebM file and so on, in realtime!

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

MIT: https://webrtc-experiment.appspot.com/licence/ : Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
