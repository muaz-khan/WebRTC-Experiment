# [WebRTC Scalable Broadcast](https://github.com/muaz-khan/WebRTC-Scalable-Broadcast)

Scalable WebRTC peer-to-peer broadcasting demo.

[![npm](https://img.shields.io/npm/v/webrtc-scalable-broadcast.svg)](https://npmjs.org/package/webrtc-scalable-broadcast) [![downloads](https://img.shields.io/npm/dm/webrtc-scalable-broadcast.svg)](https://npmjs.org/package/webrtc-scalable-broadcast)

This module simply initializes socket.io and configures it in a way that single broadcast can be relayed over unlimited users without any bandwidth/CPU usage issues. Everything happens peer-to-peer!

![WebRTC Scalable Broadcast](https://cdn.webrtc-experiment.com/images/WebRTC-Scalable-Broadcast.png)

In the image, you can see that each NEW-peer is getting stream from most-recent peer instead of getting stream directly from the moderator.

```
npm install webrtc-scalable-broadcast

# goto node_modules>webrtc-scalable-broadcast
cd node_modules
cd webrtc-scalable-broadcast

# and run the server.js file
node server.js
```

Or install using WGet:

```
mkdir webrtc-scalable-broadcast && cd webrtc-scalable-broadcast
wget http://dl.webrtc-experiment.com/webrtc-scalable-broadcast.tar.gz
tar -zxvf webrtc-scalable-broadcast.tar.gz
ls -a
node server.js
```

Or directly download the TAR/archive on windows:

* http://dl.webrtc-experiment.com/webrtc-scalable-broadcast.tar.gz

And now open: `http://localhost:8888` or '127.0.0.1:8888'.

If `server.js` fails to run:

```
# if fails,
lsof -n -i4TCP:8888 | grep LISTEN
kill process-ID

# and try again
node server.js
```

## Is stream keeps quality?

Obviously "nope". It will have minor side-effects (e.g. latency in milliseconds/etc.).

If you'll be testing across tabs on the same system, then you'll obviously notice quality lost; however it will NOT happen if you test across different systems.

## What I can share?

You can share screen (using Firefox/Chrome screen-capturing APIs), video (using getUserMedia API), stream (using video.captureStream and canvas.captureStream API).

Currently you can't share audio in Chrome of of [this big](https://www.webrtc-experiment.com/demos/remote-stream-recording.html).

## How it works?

Above image showing terminal logs explains it better.

For more details, to understand how this broadcasting technique works:

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

[Scalable WebRTC Broadcasting Demo](https://github.com/muaz-khan/WebRTC-Scalable-Broadcast) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
