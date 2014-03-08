#### Simple [MultiRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC) app built using [RTCMultiConnection.js](http://www.RTCMultiConnection.org/docs/) / [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/)

Note: This MultiRTC demo is using firebase; but you can use any signaling gateway by changing JUST single method i.e. "openSignalingChannel":

https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md

In the `ui.main.js` file; goto line 75. It is using firebase to [check presence](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md#room-presence-detection) of the room; you can easily use any other signaling implementation there.

=

<img src="https://www.webrtc-experiment.com/images/MultiRTC.gif" />

MultiRTC is an all-in-one demo application using RTCMultiConnection.js library. MultiRTC supports:

1. Multi-File sharing among multiple users!
2. Multi-screen sharing among multiple users; in multi-directions!
3. Audio and/or Video among multiple users; in multi-directions!

MultiRTC supports many complex renegotiation scenarios so that you can open text chat, same like skype; then you can add/remove medias (audio/video/screen) any time in any direction! 

MultiRTC currently targets maximum 8-users per conferencing room; however, it can setup about 256 connections.

=

1. https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC
2. https://www.webrtc-experiment.com:12034/
3. https://www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/

=

##### License

[RTCMultiConnection.js](http://www.RTCMultiConnection.org/) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
