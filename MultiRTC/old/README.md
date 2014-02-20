#### [MultiRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC) app built using [RTCMultiConnection.js](http://www.RTCMultiConnection.org/docs/) / [Demo](https://www.webrtc-experiment.com:12034/)

MultiRTC is an all-in-one demo application using RTCMultiConnection.js library. MultiRTC supports:

1. Multi-File sharing among multiple users!
2. Multi-screen sharing among multiple users; in multi-directions!
3. Audio and/or Video among multiple users; in multi-directions!

MultiRTC supports many complex renegotiation scenarios so that you can open text chat, same like skype; then you can add/remove medias (audio/video/screen) any time in any direction! 

MultiRTC currently targets maximum 8-users per conferencing room; however, it can setup about 256 connections.

<a href="https://nodei.co/npm/multirtc/">
    <img src="https://nodei.co/npm/multirtc.png">
</a>

```
// Dependencies: 
// 1) socket.io (npm install socket.io)
// 2) node-static (npm install node-static)

npm install multirtc

// to run it!
cd ./node_modules/multirtc/ && node signaler.js
```

Now, both socket.io and HTTPs servers are running at port `12034`:

```
http://localhost:12034/

// or
var socket = io.connect('http://localhost:12034/');
```

=

##### License

[RTCMultiConnection.js](http://www.RTCMultiConnection.org/) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
