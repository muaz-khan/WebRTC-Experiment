![WebRTC Experiment!](https://muazkh.appspot.com/images/WebRTC.png)

--

[This webrtc experiment](https://webrtc-experiment.appspot.com/screen-broadcast/) uses socket.io as signaling gateway.

Pubnub is used as a wrapper for socket.io

[RTCPeerConnection.js](https://bit.ly/RTCPeerConnection) is used as JavaScript-Wrapper for RTCWeb APIs.

Stream is captured using Google Chrome experimental tabCapture APIs and transmitted over socket.

It has the ability to handle unlimited peers. So unlimited peers can get access to broadcasted screen.

Master socket handles the "broadcasting".

The process is like this:

* Master socket finds a new socket (or new user, or new peer, or whatever you name it!)
* Master socket opens an absolute unique new socket to handle offer/answer exchange model.
* That newly created socket itself creates a new peer connection object and exchanges SDP/ICE with that user.
* The same client stream is attached with offer for the sake of broadcasting same screen!

The following function is used to capture tab/screen:

```javascript
chrome.tabCapture.capture({ audio: true, video: true }, function(stream) {
    // broadcastNow(stream);
});
```

Don't forget to test it yourself!

[https://webrtc-experiment.appspot.com/screen-broadcast/](https://webrtc-experiment.appspot.com/screen-broadcast/)

##Credits

* [Muaz Khan](http://github.com/muaz-khan)!

## License
Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.