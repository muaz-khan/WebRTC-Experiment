#### RTCPeerConnection Documentation

**RTCPeerConnection.js** is a JavaScript wrapper library for **RTCWeb PeerConnection APIs**.

It not only simplifies coding but also handles complex cross browser implementations.

#### Getting started with RTCPeerConnection library

First of all; library to be linked!

```html
<script src="https://bit.ly/RTCPeerConnection-v1-5"></script>
```

**RTCPeerConnection** object's structure looks like this:

```javascript
var peer = RTCPeerConnection({
    attachStream: localMediaStream,
    offerSDP: offerSDP_sent_from_offerer,

    onICE: function (candidate) {},
    onRemmoteSteam: function (stream) {},

    onOfferSDP: function (offerSDP) {},
    onAnswerSDP: function (answerSDP) {},

    onChannelMessage: function (event) {},
    onChannelOpened: function (_RTCDataChannel) {}
});
```

#### Exploring RTCPeerConnection object

You're passing a configuration object that contains a few methods and objects.

#### `attachStream`

This object must contain `LocalMediaStream` object that will be attached to share your audio/video stream. You can skip it if you want to implement one-way streaming.

Behind the scene, **RTCPeerConnection** is calling `addStream` method:

```javascript
peerConnection.addStream(attachStream);
```

#### `offerSDP`

In one-to-one media session; this object will be used by **answerer** as soon as he will get **offer sdp** sent from **offerer*. Actually you're adding **offer sdp** here:

```javascript
offerSDP = {
   type: 'offer',
   sdp: '------'
}
```

#### `onICE`

On traversing NAT for local peer; **RTCPeerConnection** object will return ICE gathered for current peer. You can get access to all those gathered ICE using this method:

```javascript
onICE: function (_RTCIceCandidate) {
    // _RTCIceCandidate.candidate
    // _RTCIceCandidate.sdpMLineIndex
    // etc.
};
```

This file is under construction.

#### License

**RTCPeerConnection.js** is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
