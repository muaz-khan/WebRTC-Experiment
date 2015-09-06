# MultiRTC / A demo application for [RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection)

This demo application runs similarly like Skype. However it isn't having contacts section.

It works as following:

1. A user can start a room and anyone with the URL can join.
2. Initially only text-chat is shared.
3. Anyone can select to share/enable his own microphone or camera or screen.
4. Anyone can click to "view-shared-media" or share his-own-media as well.

Last point means, you can view or hear someone's shared camera without sharing your own camera.

# Wanna Report a Bug?

* https://github.com/muaz-khan/MultiRTC/issues

MultiRTC Firebase: [![npm](https://img.shields.io/npm/v/multirtc-firebase.svg)](https://npmjs.org/package/multirtc-firebase) [![downloads](https://img.shields.io/npm/dm/multirtc-firebase.svg)](https://npmjs.org/package/multirtc-firebase)

MultiRTC WebSockets: [![npm](https://img.shields.io/npm/v/multirtc-websocket.svg)](https://npmjs.org/package/multirtc-websocket) [![downloads](https://img.shields.io/npm/dm/multirtc-websocket.svg)](https://npmjs.org/package/multirtc-websocket)

MultiRTC Socketio: [![npm](https://img.shields.io/npm/v/multirtc.svg)](https://npmjs.org/package/multirtc) [![downloads](https://img.shields.io/npm/dm/multirtc.svg)](https://npmjs.org/package/multirtc)

1. Source Code: https://github.com/muaz-khan/MultiRTC
2. Simpler Demo: https://www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/
3. RTCMultiConnection.js: https://github.com/muaz-khan/RTCMultiConnection

# Gif Presentation

<img src="https://cdn.webrtc-experiment.com/images/MultiRTC.gif" />

# Demos Sources

1. [MultiRTC Firebase](https://github.com/muaz-khan/MultiRTC/tree/master/MultiRTC-firebase)
2. [MultiRTC WebSocket](https://github.com/muaz-khan/MultiRTC/tree/master/MultiRTC-websocket)
3. [MultiRTC Socketio](https://github.com/muaz-khan/MultiRTC/tree/master/MultiRTC-socketio)

# NPM

```
# socket.io based solution
npm install multirtc

# firebase based solution----simplest one; requires nothing; JUST copy/paste!
npm install multirtc-firebase

# websockets based solution
npm install multirtc-websocket
```

# What is MultiRTC?

1. It is a skype-like demo using WebRTC for realtime connections!
2. It allows you enable/disable webcams; and join with or without webcams!
3. It allows you share screen using existing peer connections!
4. It allows you share files with preview and download links!
5. It allows you **auto translate incoming messages** in [your own language](http://www.rtcmulticonnection.org/docs/language/)!
6. It gives you full control over bandwidth and screen resolutions!
7. It allows you adjust file sharing speed yourself by setting [chunk-size](http://www.rtcmulticonnection.org/docs/chunkSize/) and [chunk-intervals](http://www.rtcmulticonnection.org/docs/chunkInterval/)!
8. It allows you test all WebRTC features by enabling/disabling some check-boxes!

Demo here: https://www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/

# How it works?

1. It opens [WebRTC](https://www.webrtc-experiment.com/) data connection same like Skype!
2. Multiple users can join same room; text chat and share multiple files concurrently!
3. Choose your own URL! Users from one room can't access data or join users from other rooms.
4. Anyone can add any media stream any-time! Whether it is screen; or audio/video.
5. An advance settings section allows you customize many RTCMultiConnection features in one place!

It is an All-in-One solution for [RTCMultiConnection.js](http://www.RTCMultiConnection.org/docs/)!


# License

[RTCMultiConnection.js](http://www.RTCMultiConnection.org/) WebRTC Library is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com).
