![WebRTC Experiment!](http://goo.gl/eHcyi)
![WebRTC Experiment!](https://sites.google.com/site/muazkh/logo.png)

--

Real-time [WebRTC Experiment](https://webrtc-experiment.appspot.com) that exposes the power of yours and mine favorite technology: [WebRTC](http://www.webrtc.org/)! 

## Preview / Demo

* [WebRTC Experiments: All](https://webrtc-experiment.appspot.com)
* [JavaScript Only WebRTC Experiment](https://webrtc-experiment.appspot.com/javascript/) - [TURN](https://webrtc-experiment.appspot.com/javascript/?turn=true) / [STUN](https://webrtc-experiment.appspot.com/javascript/)
* [ASPNET MVC specific WebRTC Experiment](https://webrtc-experiment.appspot.com/aspnet-mvc/) - [TURN](https://webrtc-experiment.appspot.com/aspnet-mvc/?turn=true) / [STUN](https://webrtc-experiment.appspot.com/aspnet-mvc/)

## Screenshot

![WebRTC Screenshot 2](https://muazkh.appspot.com/images/WebRTC.png)

##Credits

* A to Zee - Everything: [Muaz Khan](http://github.com/muaz-khan)!

##Browsers

It works fine on Google Chrome Stable 23 (and upper stable releases!)

## JavaScript code!

```javascript
var CreateRTCPeerConnection = function (options) {

    window.RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
    window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
    window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;

    window.URL = window.webkitURL || window.URL;
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

	// TURN:     { "iceServers": [{ "url": "turn:webrtc%40live.com@numb.viagenie.ca", "credential": "muazkh" }] }
    var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302"}] };

    this.peerConnection = new PeerConnection(options.config || config);

    this.peerConnection.onicecandidate = onicecandidate;
    this.peerConnection.onaddstream = onaddstream;
    this.peerConnection.addStream(options.stream);

    function onicecandidate(event) {

        if (!event.candidate || !CreateRTCPeerConnection.peerConnection) return;

        if (options.onicecandidate) options.onicecandidate(event.candidate);
    }

    function onaddstream(event, recheck) {
        if (event && options.remoteVideo) options.remoteVideo.src = URL.createObjectURL(event.stream);

        if (!event && recheck && options.onaddstream) {
            if (!(options.remoteVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || options.remoteVideo.paused || options.remoteVideo.currentTime <= 0)) {
                options.onaddstream();
            } else setTimeout(onaddstream, 500);
        }
    }

    function createOffer() {
        if (!options.createOffer) return;

        CreateRTCPeerConnection.peerConnection.createOffer(function (sessionDescription) {

            CreateRTCPeerConnection.peerConnection.setLocalDescription(sessionDescription);
            options.createOffer(sessionDescription);

        }, null, { audio: true, video: true });
    }

    createOffer();

    function createAnswer() {
        if (!options.createAnswer) return;

        CreateRTCPeerConnection.peerConnection.setRemoteDescription(new SessionDescription(options.offer));
        CreateRTCPeerConnection.peerConnection.createAnswer(function (sessionDescription) {

            CreateRTCPeerConnection.peerConnection.setLocalDescription(sessionDescription);
            options.createAnswer(sessionDescription);

        }, null, { audio: true, video: true });
    }

    createAnswer();

    return this;
};

CreateRTCPeerConnection.prototype.peerConnection = null;

CreateRTCPeerConnection.prototype.onanswer = function (sdp) {
    this.peerConnection.setRemoteDescription(new SessionDescription(sdp));
};

CreateRTCPeerConnection.prototype.addICE = function (candidate) {

    this.peerConnection.addIceCandidate(new IceCandidate({
        sdpMLineIndex: candidate.sdpMLineIndex,
        candidate: candidate.candidate
    }));

};


// Here is how to use above function!

var connection = CreateRTCPeerConnection({
    createOffer: function (sdp) {
        console.log('created offer');
    },
    onicecandidate: function (candidate) {
        console.log('ICE candidate is ready for other peer!');
    },
    onaddstream: function () {
        console.log('Got remote stream successfully!');
    }
});

// Pass ICE sent by other peer to process it!

connection.addICE({
    sdpMLineIndex: 1,
    candidate: candidate
});

// Pass SDP sent by other peer to finalize the handshake!

connection.onanswer(sdp);
```

##Spec references 

* [WebRTC 1.0: Real-time Communication Between Browsers](http://dev.w3.org/2011/webrtc/editor/webrtc.html)
* [TURN Server at Wikipedia!](http://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT)
* [STUN Server at Wikipedia!](http://en.wikipedia.org/wiki/STUN)

Don't forget [PubNub for Signalling](http://www.pubnub.com/tutorial/javascript-push-api)!!

## License
Copyright (c) 2012 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.