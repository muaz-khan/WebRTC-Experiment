![WebRTC Experiment!](https://muazkh.appspot.com/images/WebRTC.png)

--

[This webrtc experiment](https://webrtc-experiment.appspot.com/calls/) uses socket.io as signaling gateway.

Pubnub is used as a wrapper for socket.io

[RTCPeerConnection.js](https://bit.ly/RTCPeerConnection) is used as JavaScript-Wrapper for RTCWeb APIs.

Allow your visitors to call you directly. No flash! No Plugin. A realtime calling method for everyone! 

Following trick is used to make audio-only stream flow possible:

```javascript
audio.src = webkitURL.createObjectURL(event.stream);

audio.addEventListener('play', function () {
	this.muted = false;
	this.volume = 1;
}, false);

audio.play();
```

Don't forget to test it yourself!

[https://webrtc-experiment.appspot.com/calls/](https://webrtc-experiment.appspot.com/calls/)

##Credits

* [Muaz Khan](http://github.com/muaz-khan)!

## License
Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.