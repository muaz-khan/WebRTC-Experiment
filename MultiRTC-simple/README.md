## MultiRTC / A Demo application for [RTCMultiConnection.js](http://www.RTCMultiConnection.org/docs/)!

1. Source Code: https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC
2. Demo: https://www.webrtc-experiment.com:12034/
3. RTCMultiConnection.js: http://www.RTCMultiConnection.org/docs/

## Note: 

This [MultiRTC demo](https://www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/) is using firebase; but you can use any signaling gateway by changing JUST single method i.e. [`openSignalingChannel`](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md):

In the [`ui.main.js`](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/MultiRTC-simple/ui.main.js) file; go to [line 75](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/MultiRTC-simple/ui.main.js#L75). It is using firebase to [check presence](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md#room-presence-detection) of the room; you can easily use any other signaling implementation there.

### How it works?

1. It opens [WebRTC](https://www.webrtc-experiment.com/) data connection same like Skype!
2. Multiple users can join same room; text chat and share multiple files concurrently!
3. Choose your own URL! Users from one room can't access data or join users from other rooms.
4. Anyone can add any media stream any-time! Whether it is screen; or audio/video.
5. An advance settings section allows you customize many RTCMultiConnection features in one place!

It is an All-in-One solution for [RTCMultiConnection.js](http://www.RTCMultiConnection.org/docs/)!

<img src="https://www.webrtc-experiment.com/images/MultiRTC.gif" />

<a href="https://nodei.co/npm/multirtc/">
    <img src="https://nodei.co/npm/multirtc.png">
</a>

```
// Dependencies: 
// 1) socket.io (npm install socket.io)
// 2) node-static (npm install node-static)

npm install multirtc

// to run it!
cd node_modules/multirtc/ && node signaler.js
```

Now, both socket.io and HTTPs servers are running at port `12034`:

```
https://localhost:12034/

// or
var socket = io.connect('https://localhost:12034/');
```

=

##### License

[RTCMultiConnection.js](http://www.RTCMultiConnection.org/) WebRTC Library is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
