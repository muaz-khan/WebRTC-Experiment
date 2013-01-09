![WebRTC Experiment!](https://muazkh.appspot.com/images/WebRTC.png)

--

This repository is a collection of small realtime working "server-less" WebRTC experiments.

"Server-Less" means "No Server Coding" i.e. No PHP, No ASP.NET MVC, No Java, No Python or No Node.js!

You can find here experiments like screen broadcasting (over many peers); audio/video broadcasting too; also audio only experiments.

For each experiment, you can see that code is splitted in many JS-files.

* "rtc-functions.js" and "rtc.js" contains RTCWeb APIs relevant code.
* "socket.js" opens socket and handles the flow of offer/answer exchange.
* "ui.js" contains code to handle UI tasks. This file also contains a method to capture camera. This file contains functions to handle transmission of room/channel and to join any room.

For the sake of simplicity and reusability, all experiments are using a js-wrapper library for RTCWeb APIs: 

* [RTCPeerConnection.js](https://bit.ly/RTCPeerConnection) - a simple js-wrapper for RTCWeb APIs 
* [RTCPeerConnection-Helpers.js](https://bit.ly/RTCPeerConnection-Helpers) - to prefer codecs like OPUS, to take advantage of all useful codecs, and stuff.

## How this app manages to broadcast stream?

Nothing special; it is super easy. If you look at those projects, you can see that there are two js files:

* answer-socket.js
* master-socket.js

Master socket is the main player here. It handles all upcoming requests and it opens a new socket for each new user/peer. Now it is that newly created peer's job to handle SDP/ICE exchange between that user and itself. Note that the "same client stream" is attached here to make it a real broadcast.

Video conferencing is also super-easy. You can ask each "answer socket" to play a role of "master socket" in case they find other roommates.

## Here is the list of all experiments:

* [Realtime Chat using RTCDataChannel APIs](https://webrtc-experiment.appspot.com/chat/) - [STUN](https://webrtc-experiment.appspot.com/chat/) / [TURN](https://webrtc-experiment.appspot.com/chat/?turn=true)
* [Plugin-free calls](https://webrtc-experiment.appspot.com/calls/) - [STUN](https://webrtc-experiment.appspot.com/calls/) / [TURN](https://webrtc-experiment.appspot.com/calls/?turn=true)
* [Screen Broadcasting using WebRTC](https://webrtc-experiment.appspot.com/screen-broadcast/) - [STUN](https://webrtc-experiment.appspot.com/screen-broadcast/) / [TURN](https://webrtc-experiment.appspot.com/screen-broadcast/?turn=true)
* [Voice/Audio Broadcasting using WebRTC](https://webrtc-experiment.appspot.com/audio-broadcast/) - [STUN](https://webrtc-experiment.appspot.com/audio-broadcast/) / [TURN](https://webrtc-experiment.appspot.com/audio-broadcast/?turn=true)
* [Video Broadcasting using WebRTC](https://webrtc-experiment.appspot.com/broadcast/) - [STUN](https://webrtc-experiment.appspot.com/broadcast/) / [TURN](https://webrtc-experiment.appspot.com/broadcast/?turn=true)
* [WebRTC Experiment using Socket.io for signalling](https://webrtc-experiment.appspot.com/socket.io/) - [STUN](https://webrtc-experiment.appspot.com/socket.io/) / [TURN](https://webrtc-experiment.appspot.com/socket.io/?turn=true)
* [WebRTC Experiment using WebSocket for signalling](https://webrtc-experiment.appspot.com/websocket/) - [STUN](https://webrtc-experiment.appspot.com/websocket/) / [TURN](https://webrtc-experiment.appspot.com/websocket/?turn=true)
* [WebRTC Experiment using XHR over ASPNET MVC](https://webrtc-experiment.appspot.com/aspnet-mvc/) - [TURN](https://webrtc-experiment.appspot.com/aspnet-mvc/?turn=true) / [STUN](https://webrtc-experiment.appspot.com/aspnet-mvc/)

If you're new to WebRTC; following demos are for you!

* [Runs in only one tab; uses JavaScript variables directly for signalling.](https://webrtc-experiment.appspot.com/demos/client-side.html)
* [Runs in only one tab; uses socket.io for signalling.](https://webrtc-experiment.appspot.com/demos/client-side-socket-io.html)
* [Runs in only one tab; uses WebSocket for signalling.](https://webrtc-experiment.appspot.com/demos/client-side-websocket.html)

##Credits

* [Muaz Khan](http://github.com/muaz-khan)!

The app is using following js-wrapper library for RTCWeb APIs:

## JavaScript code from [RTCPeerConnection-v1.1.js](https://webrtc-experiment.appspot.com/lib/RTCPeerConnection-v1.1.js)!

```javascript
window.PeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
window.SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
window.IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;

window.defaults = {
    iceServers: { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] },
    constraints: { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
};

var RTCPeerConnection = function(options) {

    var iceServers = options.iceServers || defaults.iceServers;
    var constraints = options.constraints || defaults.constraints;

    var peerConnection = new PeerConnection(iceServers);

    peerConnection.onicecandidate = onicecandidate;
    peerConnection.onaddstream = onaddstream;
    peerConnection.addStream(options.attachStream);

    function onicecandidate(event) {
        if (!event.candidate || !peerConnection) return;
        if (options.onICE) options.onICE(event.candidate);
    }

    function onaddstream(event) {
        options.onRemoteStream && options.onRemoteStream(event.stream);
    }

    function createOffer() {
        if (!options.onOfferSDP) return;

        peerConnection.createOffer(function(sessionDescription) {

            /* opus? use it dear! */
            options.isopus && (sessionDescription = codecs.opus(sessionDescription));

            peerConnection.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);

        }, null, constraints);
    }

    createOffer();

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        peerConnection.setRemoteDescription(new SessionDescription(options.offerSDP));
        peerConnection.createAnswer(function(sessionDescription) {

            /* opus? use it dear! */
            options.isopus && (sessionDescription = codecs.opus(sessionDescription));

            peerConnection.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);

        }, null, constraints);
    }

    createAnswer();

    return {
        /* offerer got answer sdp; MUST pass sdp over this function */
        addAnswerSDP: function(sdp) {
            peerConnection.setRemoteDescription(new SessionDescription(sdp));
        },
        
        /* got ICE from other end; MUST pass those candidates over this function */
        addICE: function(candidate) {
            peerConnection.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };
};

function getUserMedia(options) {
    var URL = window.webkitURL || window.URL;
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

    navigator.getUserMedia(options.constraints || { audio: true, video: true },
        function (stream) {

            if (options.video)
                if (!navigator.mozGetUserMedia) options.video.src = URL.createObjectURL(stream);
                else options.video.mozSrcObject = stream;

            options.onsuccess && options.onsuccess(stream);

            return stream;
        }, options.onerror);
}
```

And to take advantage of useful codecs:

## JavaScript code from [RTCPeerConnection-Helpers.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection-Helpers.js)!

```javascript
var codecs = {};

/* this function credit goes to Google Chrome WebRTC team! */
codecs.opus = function (sessionDescription) {

    /* no opus? use other codec! */
    if (!isopus) return sessionDescription;

    var sdp = sessionDescription.sdp;

    /* Opus? use it! */
    function preferOpus() {
        var sdpLines = sdp.split('\r\n');

        // Search for m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                var mLineIndex = i;
                break;
            }
        }
        if (mLineIndex === null)
            return sdp;

        // If Opus is available, set it as the default in m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('opus/48000') !== -1) {
                var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                if (opusPayload)
                    sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                break;
            }
        }

        // Remove CN in m line and sdp.
        sdpLines = removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');
        return sdp;
    }

    function extractSdp(sdpLine, pattern) {
        var _result = sdpLine.match(pattern);
        return (_result && _result.length == 2) ? _result[1] : null;
    }

    // Set the selected codec to the first in m line.
    function setDefaultCodec(mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = new Array();
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
            if (index === 3) // Format of media starts from the fourth.
                newLine[index++] = payload; // Put target payload to the first.
            if (elements[i] !== payload)
                newLine[index++] = elements[i];
        }
        return newLine.join(' ');
    }

    // Strip CN from sdp before CN constraints is ready.
    function removeCN(sdpLines, mLineIndex) {
        var mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length - 1; i >= 0; i--) {
            var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
                var cnPos = mLineElements.indexOf(payload);
                if (cnPos !== -1) {
                    // Remove CN payload from m line.
                    mLineElements.splice(cnPos, 1);
                }
                // Remove CN line in sdp
                sdpLines.splice(i, 1);
            }
        }

        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
    }


    var result;

    /* in case of error; use default codec; otherwise use opus */
    try {
        result = preferOpus();
        console.log('using opus codec!');
    }
    catch (e) {
        console.error(e);
        result = sessionDescription.sdp;
    }

    return new SessionDescription({
        sdp: result,
        type: sessionDescription.type
    });
};

/* check support of opus codec */
codecs.isopus = function () {
    var result = true;
    new PeerConnection(defaults.iceServers).createOffer(function (sessionDescription) {
        result = sessionDescription.sdp.indexOf('opus') !== -1;
    }, null, defaults.constraints);
    return result;
};

/* used to know opus codec support */
var isopus = !!codecs.isopus();
```

##[How to use RTCPeerConnection-v1.1.js](https://webrtc-experiment.appspot.com/docs/how-to-use-rtcpeerconnection-js-v1.1.html)?


##Spec references 

* [WebRTC 1.0: Real-time Communication Between Browsers](http://dev.w3.org/2011/webrtc/editor/webrtc.html)
* [TURN Server at Wikipedia!](http://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT)
* [STUN Server at Wikipedia!](http://en.wikipedia.org/wiki/STUN)

## License
Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.