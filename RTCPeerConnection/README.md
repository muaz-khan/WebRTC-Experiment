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

In one-to-one media session; this object will be used by **answerer** as soon as he will get **offer sdp** sent from **offerer**. Actually you're adding **offer sdp** here:

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

#### `onRemmoteSteam`

This method is invoked as soon as **remote media stream** is added in peer connection object.

```javascript
onRemmoteSteam: function (remoteMediaStream) {
    // if(firefox) remoteVideo.mozSrcObject = remoteMediaStream;
    // if(firefox) remoteVideo.src = window.URL.createObjectURL(remoteMediaStream);
	
    // if(chrome) remoteVideo.src = window.webkitURL.createObjectURL(remoteMediaStream);
}
```

#### `onOfferSDP`

Use this method on the **offerer**'s side to get access to the **offer-sdp** generated using `peerConnection.createOffer` method:

```javascript
onOfferSDP: function (offerSDP) {
    // offerSDP.type === 'offer'
    // offerSDP.sdp
}
```

#### `onAnswerSDP`

As soon as offerer sends you **offer-sdp** using his preferred signaling method; you should initiate peer connection for **answerer**. That peer connection object will create **answer-sdp** accordingly. To get access to that **answer-sdp**, use `onAnswerSDP` method:

```javascript
onAnswerSDP: function (answerSDP) {
    // answerSDP.type === 'answer'
    // answerSDP.sdp
}
```

**RTCPeerConnection** library also allows you establish data connection between peers.

#### `onChannelMessage`

Use this method to get access to all text messages or data transferred over WebRTC data channels.

```javascript
onChannelMessage: function (event) {
    // to get data:	event.data
    // on chrome: JSON.parse(event.data)
}
```

#### `onChannelOpened`

Use this method if you want to be alerted when data ports get open.

```javascript
onChannelOpened: function (channel) {
    // channel.send('hi there, data ports are ready to transfer data');
}
```

#### Public instance methods

**RTCPeerConnection** library has a few instance methods to be called later at appropriate time.

Here is how to get access to those instance methods:

```javascript
var peer = RTCPeerConnection(configuration);

// using "peer" object; you can call those instance methods
peer.addICE(...);
peer.addAnswerSDP(...);
```

#### `addICE`

Use this instance method to add ICE candidates sent by other peer.

```javascript
peer.addICE({
    sdpMLineIndex: websocketMessage.sdpMLineIndex,
    candidate: websocketMessage.candidate
});
```

Use `addICE` method on both peer's side.

#### `addAnswerSDP`

Use `addAnswerSDP` instance method to add **answer-sdp** sent by answerer. This method should only be used in offerer's side.

```javascript
peer.addAnswerSDP(answerSDP);

// answer-sdp looks like this:
{
    type: 'answer',
    sdp: '-----'
}
```

#### How to send data over WebRTC Data Channels?

`peer` object has another instance method named `sendData` that allows you send only text-messages on chrome and blobs, buffers, and objects on firefox.

```javascript
peer.sendData('hi there, I am a text message');
peer.channel.send('hi there, I am a text message');

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
peer.channel.send(stringified);

// because firefox accepts blobs too, send file directly
peer.sendData(file);
```

#### `onChannelClosed`

Use this method to be alerted when data ports get close.

```javascript
onChannelClosed: function (event) { }
```

#### `onChannelError`

Use this method to catch errors expected to be occur in data channels.

```javascript
onChannelError: function (event) { }
```

#### `getUserMedia`

Use cross-browser `getUserMedia` function to get access to camera/microphone.

```javascript
getUserMedia({
    video: HTMLAudioElement || HTMLVideoElement,
    constraints: {},
    onsuccess: function (localMediaStream) {},
    onerror: function (event) {}
});
```

Use **constraints** to pass custom constraints like `chromeMediaSource` etc.

```javascript
var screen_constraints = {
    mandatory: {
        chromeMediaSource: 'screen'
    },
    optional: []
};

getUserMedia({
    constraints: {
        audio: false,
        video: screen_constraints
    }
});
```

#### History

1. [RTCPeerConnection-v1.5.js](https://bit.ly/RTCPeerConnection-v1-5)
2. [RTCPeerConnection-v1.4.js](https://bit.ly/RTCPeerConnection-v1-4)
3. [RTCPeerConnection-v1.3.js](https://bit.ly/RTCPeerConnection-v1-3)
4. [RTCPeerConnection-v1.2.js](https://bit.ly/RTCPeerConnection-v1-2)
5. [RTCPeerConnection-v1.1.js](https://bit.ly/RTCPeerConnection-v1-1)
6. [RTCPeerConnection.js](https://bit.ly/RTCPeerConnection-v1-0)

#### License

**RTCPeerConnection.js** is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
