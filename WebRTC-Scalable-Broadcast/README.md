# [WebRTC Scalable Broadcast](https://github.com/muaz-khan/WebRTC-Scalable-Broadcast)

Scalable WebRTC peer-to-peer broadcasting demo.

[![npm](https://img.shields.io/npm/v/webrtc-scalable-broadcast.svg)](https://npmjs.org/package/webrtc-scalable-broadcast) [![downloads](https://img.shields.io/npm/dm/webrtc-scalable-broadcast.svg)](https://npmjs.org/package/webrtc-scalable-broadcast)

This module simply initializes socket.io and configures it in a way that single broadcast can be relayed over unlimited users without any bandwidth/CPU usage issues. Everything happens peer-to-peer!

```
npm install webrtc-scalable-broadcast

node .\node_modules\webrtc-scalable-broadcast\server.js
```

And now open: `http://localhost:8888`.

## How it works?

This demo runs top over [RTCMultiConnection.js](http://www.RTCMultiConnection.org/). Though, you can use it in any other [WebRTC Experiment](https://www.webrtc-experiment.com/).

It following technique mentioned here:

* https://github.com/muaz-khan/WebRTC-Experiment/issues/2

![WebRTC Scalable Broadcast](https://sites.google.com/site/webrtcexperiments/WebRTC-attach-remote-stream.png)

Assuming peers 1-to-10:

### First Peer:

Peer1 is the only peer that invokes `getUserMedia`. Rest of the peers will simply [forward/relay remote stream](https://www.webrtc-experiment.com/RTCMultiConnection/remote-stream-forwarding.html).

```
peer1 captures user-media
peer1 starts the room
```

### Second Peer:

```
peer2 joins the room
peer2 gets remote stream from peer1
peer2 opens a "parallel" broadcasting peer named as "peer2-broadcaster"
```

### Third Peer:

```
peer3 joins the room
peer3 gets remote stream from peer2
peer3 opens a "parallel" broadcasting peer named as "peer3-broadcaster"
```

### Fourth Peer:

```
peer4 joins the room
peer4 gets remote stream from peer3
peer4 opens a "parallel" broadcasting peer named as "peer4-broadcaster"
```

### Fifth Peer:

```
peer5 joins the room
peer5 gets remote stream from peer4
peer5 opens a "parallel" broadcasting peer named as "peer5-broadcaster"
```

and 10th peer:

```
peer10 joins the room
peer10 gets remote stream from peer9
peer10 opens a "parallel" broadcasting peer named as "peer10-broadcaster"
```

## Conclusion

1. Peer9 gets remote stream from peer8
2. Peer15 gets remote stream from peer14
3. Peer50 gets remote stream from peer49

and so on.

## Limitation

This demo works only with screen and video-only streams. It doesn't works with audio.

Because currently [remote audio processing](https://www.webrtc-experiment.com/demos/remote-stream-recording.html) or forwarding isn't supported in chrome.

This demo works only in Chrome; no Firefox support yet. Because Firefox isn't supporting non-APM sources for peer-streaming.

## License

[Scalable WebRTC Broadcasting Demo](https://github.com/muaz-khan/WebRTC-Scalable-Broadcast) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
