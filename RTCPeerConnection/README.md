##### RTCPeerConnection Documentation

**RTCPeerConnection.js** is a js-wrapper library for **RTCWeb APIs**. 

It not only simplifies coding but also handles complex cross browser implementations. 

```html
<script src="https://www.webrtc-experiment.com/RTCPeerConnection-v1.5.js"></script>
```

**RTCPeerConnection** object's structure looks like this:

```javascript
var peer = RTCPeerConnection(configuration);
```

Actually you're calling a method; and passing some data over it; and that's it!

`configuration` is an object contains a few properties and methods:

```javascript
var configuration = {
    attachStream: MediaStream,
    attachStreams: [MediaStream_1, MediaStream_2, MediaStream_3],
	
    offerSDP: offerSDP_sent_from_offerer,

    onICE: function (candidate) {},
    onRemoteStream: function (stream) {},
    onRemoteStreamEnded: function (stream) {},

    onOfferSDP: function (offerSDP) {},
    onAnswerSDP: function (answerSDP) {},

    onChannelMessage: function (event) {},
    onChannelOpened: function (_RTCDataChannel) {}
};
```

=

#### attachStream

The `MediaStream` you want to attach. To understand it better; `RTCPeerConnection` will use it like this:

```javascript
var configuration = {
    attachStream: MediaStream
};
```

=

#### attachStreams

You can attach multiple streams too; see [this demo](https://www.webrtc-experiment.com/demos/screen-and-video-from-single-peer.html).

```javascript
var configuration = {
    attachStreams: [screenStream, audioStream, videoStream]
};
```

=

#### offerSDP

This object is only useful for `answerer`. As soon as you'll receive `offer sdp` sent by `offerer`; use that `offer sdp` like this:

```javascript
configuration.offerSDP = offerSDP_sent_by_offerer;
```

Where `offerSDP_sent_by_offerer` MUST be an `object` and MUST look like this:

```javascript
{
    type: 'offer',
    sdp: '.........offerer sdp.........'
}
```

=

#### onICE

`RTCPeerConnection` will call this method on each new ICE candidate. `RTCPeerConnection` will pass `RTCIceCandidate` object over this method:

```javascript
onICE: function (_RTCIceCandidate) {
    // _RTCIceCandidate.candidate
    // _RTCIceCandidate.sdpMLineIndex
    // etc.
};
```

You can use SIP or any other signaling method to send these ICE candidates on the other end.

=

#### onRemoteStream

`RTCPeerConnection` will call this method as soon as `peer.onaddstream` event will fire. `RTCPeerConnection` will pass `RemoteStream` object over this method:

```javascript
onRemmoteSteam: function (remoteMediaStream) {
    // if(moz) remoteVideo.mozSrcObject = remoteMediaStream;
    // if(!moz) remoteVideo.src = window.webkitURL.createObjectURL(remoteMediaStream);
}
```

=

#### onRemoteStreamEnded

It is fired when remote stream stops flowing.

```javascript
onRemoteStreamEnded: function (remoteMediaStream) {
    // var video = document.getElementById(remoteMediaStream.id);
    // if(video) video.parentNode.removeChild(video);
}
```

=

#### onOfferSDP

RTCPeerConnection will call this method after successfully creating offer SDP. An object of type `RTCSessionDescription` will be passed over this method:

```javascript
onOfferSDP: function (offerSDP) {
    // offerSDP.type === 'offer'
    // offerSDP.sdp
    // to POST using XHR: JSON.stringify(offerSDP)
}
```

Pass offer sdp on the answerer's side using your own preferred signaling method.

=

#### onAnswerSDP

RTCPeerConnection will call this method after successfully creating answer SDP. An object of type `RTCSessionDescription` will be passed over this method:

```javascript
onAnswerSDP: function (answerSDP) {
    // answerSDP.type === 'answer'
    // answerSDP.sdp
    // to POST using XHR: JSON.stringify(answerSDP)
}
```

Pass `answer sdp` on the `offerer's` side using your own preferred signaling method.

=

#### onChannelMessage

Pass this method only if you want to create/open (cross browser RTC) data channels to share data/text or files.

`RTCPeerConnection` object will call this method as soon as new data-message will be received over SCTP or RTP data ports.

```javascript
onChannelMessage: function (event) {
    // to get data:	event.data
    // on chrome: JSON.parse(event.data)
}
```

=

#### onChannelOpened

RTCPeerConnection object will call this method as soon as SCTP/RTP data ports will successfully get open.

```javascript
onChannelOpened: function (channel) {
    // channel.send('hi there, data ports are ready to transfer data');
}
```

=

#### Public instance methods

RTCPeerConnection object has some public methods/objects that can be used/called later.

```javascript
var peer = RTCPeerConnection(configuration);
```

You can use `peer` object to call/use those instance methods.

=

#### Add ICE candidates

As soon as you'll receive ICE candidate sent by other peer; add it like this:

```javascript
peer.addICE({
    sdpMLineIndex: websocketMessage.sdpMLineIndex,
    candidate: websocketMessage.candidate
});
```

=

#### Add Answer SDP

Whenever offerer will receive `answer sdp` sent by answerer; add that `answer sdp` like this:

```javascript
peer.addAnswerSDP(answerSDP);
```

Where `answerSDP` must look like this:

```javascript
{
    type: 'answer',
    sdp: ''
}
```

=

#### Send data/text/file over RTCDataChannel

On **Firefox**, you can send files directly; because Firefox supports `binaryType` for `RTCDataChannel`.

On Chrome, `binaryType` will be supported soon.

You can send text message like this:

```javascript
peer.sendData('hi there, I am a text message');

/* to send an object */
var object = {
    number: 0123456789,
    string: 'just a string',
    object: {},
    array: [],
    _function: function() {}
};
var stringified = JSON.stringify(object);
peer.sendData(stringified);
```

You can send same text message like this too:

```javascript
peer.channel.send(hi there, I am a text message');
```

Where `channel` is `RTCDataChannel` object.

On Firefox, you can send file directly like this:

```javascript
peer.sendData(file);
// or otherwise: 
// peer.channel.send(file);
```

You can access `[webkit|moz]RTCPeerConnection` object too to add additional events or do extra stuff:

```javascript
var rtcPeerConnection = peer.peer;
// rtcPeerConnection.getLocalStreams()[0].stop()
// rtcPeerConnection.getAudioTracks()
// rtcPeerConnection.getVideoTracks()
```

=

#### Catching RTCDataChannel Errors

To get alerted whenever a data port closes or throws an error message:

```javascript
var configuration = {
    onChannelClosed: function (event) {},
    onChannelError: function (event) {}
};
```

=

#### getUserMedia

This [js-wrapper for RTCWeb API](https://bit.ly/RTCPeerConnection-v1-4) file also contains a **cross-browser** `getUserMedia` function.

```javascript
getUserMedia(mediaConfiguration);
```

Where `mediaConfiguration` object looks like this:

```javascript
var mediaConfiguration = {
    video: HTMLAudioElement || HTMLVideoElement,
    constraints: {},
    onsuccess: function (localMediaStream) {},
    onerror: function (event) {}
};
```

Only `onsuccess` is mandatory. All other three are optional.

You can pass `video` element to play it as soon as `navigator.getUserMedia` API will give access to `LocalMediaStream`.

`constraints` object is very useful when applying custom constraints. 

For example to capture screen in Google Chrome Canary:

```javascript
var screen_constraints = {
    mandatory: {
        chromeMediaSource: 'screen'
    },
    optional: []
};

var mediaConfiguration = {
    constraints: {
        audio: false, /* MUST be false! */
        video: screen_constraints
    }
};
```

=

#### STUN/TURN servers and customization

RTCPeerConnection object uses `STUN` by default.

To understand it better; see how it is using `STUN` server:

```javascript
var STUN = {
    iceServers: [{
        url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
    }]
};
```

On chrome; it is using: `stun:stun.l.google.com:19302`

And on Firefox; it is using: `stun:23.21.150.121`


`RTCPeerConnection` object will use this `TURN` server:

```javascript
var TURN = {
    iceServers: [{
        url: 'turn:webrtc%40live.com@numb.viagenie.ca',
        credential: 'muazkh'
    }]
};
```

=

#### You MUST keep in mind that...

1. `TURN` is not yet implemented in **Firefox**.
2. `RTCDataChannel` is not yet interoperable
3. Old Firefox sometimes fails on `non-DNS STUN` servers

=

#### How to use RTCPeerConnection?

[Here is a simple, step-by-step guide](https://www.webrtc-experiment.com/docs/how-to-use-rtcpeerconnection-js-v1.1.html) that not only explains how to exchange SDP/ICE but also explains "How to write a realtime one-to-one WebRTC video chatting app using socket.io or WebSockets".

In each WebRTC session; there are two circumstances:

1. One party creates offer
2. One party creates answer

You just need to exchange offer and answer between them using your preferable signaling method like XHR/socket.io/WebSockets/etc.

=

##### History

1. [RTCPeerConnection-v1.5.js](https://www.webrtc-experiment.com/RTCPeerConnection-v1.5.js)
2. [RTCPeerConnection-v1.4.js](https://www.webrtc-experiment.com/lib/RTCPeerConnection-v1.4.js)
3. [RTCPeerConnection-v1.3.js](https://www.webrtc-experiment.com/lib/RTCPeerConnection-v1.3.js)
4. [RTCPeerConnection-v1.2.js](https://www.webrtc-experiment.com/lib/RTCPeerConnection-v1.2.js)
5. [RTCPeerConnection-v1.1.js](https://www.webrtc-experiment.com/lib/RTCPeerConnection-v1.1.js)
6. [RTCPeerConnection.js](https://www.webrtc-experiment.com/RTCPeerConnection.js)

=

##### License

**RTCPeerConnection.js** is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
