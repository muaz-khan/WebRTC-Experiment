![WebRTC Experiment!](https://muazkh.appspot.com/images/WebRTC.png)

--

https://webrtc-experiment.appspot.com/video-conferencing/

A many-to-many WebRTC "video-conferencing" experiment. Unlimited people can join a single room and all of them can talk/see each other ... same like Google+ Hangout!

[How to video conferencing in WebRTC?](https://webrtc-experiment.appspot.com/docs/how-to-WebRTC-video-conferencing.html)

## Just copy HTML and enjoy video-conferencing in your own site!

```html
<input type="text" id="conference-name" placeholder="Conference Name">
<button id="start-conferencing">Start video-conferencing</button>

<div id="rooms-list"></div>
<div id="participants"></div>

<!-- <optional> -->
<script>
    var iceServers = null;
    var socket_config = {
        publish_key: 'demo',
        subscribe_key: 'demo',
        ssl: true
    };
</script>
<!-- </optional> -->

<div id=pubnub ssl=on></div><script src="https://bit.ly/socket-io"></script>

<script src="https://bit.ly/RTCPeerConnection-v1-3"></script>
<script src="https://webrtc-experiment.appspot.com/RTCPeerConnection-Helpers.js"></script>

<script src="https://webrtc-experiment.appspot.com/video-conferencing/conference.js"> </script>
<script src="https://webrtc-experiment.appspot.com/video-conferencing/conference-ui.js"></script>
```

##Credits

* [Muaz Khan](http://github.com/muaz-khan)!

## License
Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.