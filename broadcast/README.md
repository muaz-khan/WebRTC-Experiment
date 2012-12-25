![WebRTC Experiment!](https://muazkh.appspot.com/images/WebRTC.png)

--

[WebRTC Experiments](https://webrtc-experiment.appspot.com) using WebSocket, Socket.io and XHR for signaling. 

WebRTC video broadcasting experiment. It uses socket.io multiplexing over PubNub for signaling and allows you broadcast video over many peers.

## Preview / Demos / Experiments

* [WebRTC video broadcasting experiment](https://webrtc-experiment.appspot.com/broadcast/) - [STUN](https://webrtc-experiment.appspot.com/broadcast/) / [TURN](https://webrtc-experiment.appspot.com/broadcast/?turn=true)
* [WebRTC Experiment: Socket.io over PubNub](https://webrtc-experiment.appspot.com/socket.io/) - [STUN](https://webrtc-experiment.appspot.com/socket.io/) / [TURN](https://webrtc-experiment.appspot.com/socket.io/?turn=true)
* [WebRTC Experiment: WebSocket over PubNub](https://webrtc-experiment.appspot.com/websocket/) - [STUN](https://webrtc-experiment.appspot.com/websocket/) / [TURN](https://webrtc-experiment.appspot.com/websocket/?turn=true)
* [WebRTC Experiment: PubNub HTML5 Modern JavaScript](https://webrtc-experiment.appspot.com/javascript/) - [TURN](https://webrtc-experiment.appspot.com/javascript/?turn=true) / [STUN](https://webrtc-experiment.appspot.com/javascript/)
* [WebRTC Experiment: XHR over ASPNET MVC](https://webrtc-experiment.appspot.com/aspnet-mvc/) - [TURN](https://webrtc-experiment.appspot.com/aspnet-mvc/?turn=true) / [STUN](https://webrtc-experiment.appspot.com/aspnet-mvc/)

##Credits

* [Muaz Khan](http://github.com/muaz-khan)!
* [PubNub](https://github.com/pubnub/pubnub-api)!

##Browsers

It works fine on Google Chrome Stable 23 (and upper stable releases!)

## JavaScript code from [RTCPeerConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection.js)!

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
    peerConnection.addStream(options.stream);

    function onicecandidate(event) {
        if (!event.candidate || !peerConnection) return;
        if (options.getice) options.getice(event.candidate);
    }

    function onaddstream(event) {
        options.gotstream && options.gotstream(event);
    }

    function createOffer() {
        if (!options.onoffer) return;

        peerConnection.createOffer(function(sessionDescription) {

            /* opus? use it dear! */
            options.isopus && (sessionDescription = codecs.opus(sessionDescription));

            peerConnection.setLocalDescription(sessionDescription);
            options.onoffer(sessionDescription);

        }, null, constraints);
    }

    createOffer();

    function createAnswer() {
        if (!options.onanswer) return;

        peerConnection.setRemoteDescription(new SessionDescription(options.offer));
        peerConnection.createAnswer(function(sessionDescription) {

            /* opus? use it dear! */
            options.isopus && (sessionDescription = codecs.opus(sessionDescription));

            peerConnection.setLocalDescription(sessionDescription);
            options.onanswer(sessionDescription);

        }, null, constraints);
    }

    createAnswer();

    return {
        /* offerer got answer sdp; MUST pass sdp over this function */
        onanswer: function(sdp) {
            peerConnection.setRemoteDescription(new SessionDescription(sdp));
        },
        
        /* got ICE from other end; MUST pass those candidates over this function */
        addice: function(candidate) {
            peerConnection.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };
};
```

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

##How to use [above code](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection.js)?

```javascript
/* ---------- common configuration -------- */
var config = config = {
    getice: function(candidate) {},      /* Send ICE via XHR or WebSockets toward other peer! */
    gotstream: gotstream,       /* Play remote video */
    iceServers: iceServers,     /* STUN or TURN server: by default it is using: { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] } */
    stream: clientStream,       /* Current user's stream you want to forward to other peer! */
    isopus: window.isopus       /* if opus codec is supported; use it! */
};

/* ---------- called in case of offer -------- */
function createOffer() {
    initconfig();
    config.onoffer = function(offerSDP) {};    /* Send Offer SDP via XHR or WebSocket on the other peer */
    var peer = RTCPeerConnection(config);       /* You can use this object "peer" for later to get Answer SDP or process ICE message */
}

/* ---------- called in case of answer -------- */
function createAnswer(sdp) {
    initconfig();
    config.onanswer = function(answwerSDP) {};   /* Send Answer SDP via XHR or WebSocket on the other peer */
    config.offer = sdp;                          /* Pass offer SDP sent by other peer for you! */
    window.peer = RTCPeerConnection(config);         /* You can use this object "peer" for later to get Answer SDP or process ICE message */
}

/* ---------- getting answer SDP from 1st peer -------- */
peer.onanswer(sdp);      /* Pass Answer SDP to make the handshake complete! */

/* ---------- add /or process ice candidates sent by other peer -------- */
peer.addice({
    sdpMLineIndex: candidate.sdpMLineIndex,
    candidate: JSON.parse(candidate.candidate)  /* call JSON.parse only if you called JSON.stringify! */
});
```

##A realtime client side [example](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Python/files/demos/client-side.html) - [Preview / Demo](https://webrtc-experiment.appspot.com/demos/client-side.html)

```html
<script src="https://webrtc-experiment.appspot.com/RTCPeerConnection.js"></script>
<script src="https://webrtc-experiment.appspot.com/RTCPeerConnection-Helpers.js"></script>

<style>body{text-align: center;}</style>
<h2>Client video</h2>
<video id="client-video" autoplay></video>

<h2>Remote video getting stream from peer2</h2>
<video id="remote-video-1" autoplay></video>

<h2>Remote video getting stream from peer1</h2>
<video id="remote-video-2" autoplay></video>

<!-- First of all; get camera -->
<script>
    var clientStream;

    getUserMedia({
        video: document.getElementById('client-video'),
        onsuccess: function (stream) {
            clientStream = stream;

            /* Got access to camera; Now start creating offer sdp */
            create1stPeer();
        }
    });
</script>

<!-- First peer: the offerer -->
<script>
    /* "offerSDP" will be used by your participant! */
    var offerSDP, peer1; 

    var offerConfig = {
        onoffer: function(sdp) {
            console.log('1st peer: offer sdp: ' + sdp);
            offerSDP = sdp;

            /* Offer created: Now start 2nd peer to create its answer SDP */
            setTimeout(create2ndPeer, 400);
        },
        getice: function(candidate) {
            console.log('1st peer: candidate' + candidate);

            /* 2nd peer should process/add ice candidates sent by 1st peer! */
            peer2 && peer2.addice({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            });
        },
        gotstream: function(event) {
            console.log('1st peer: Wow! Got remote stream!');
            document.getElementById('remote-video-1').src = URL.createObjectURL(event.stream);
        }
    };
    
    function create1stPeer() {
        offerConfig.stream = clientStream;
        peer1 = RTCPeerConnection(offerConfig);
    }
</script>

<!-- Second peer: the participant -->
<script>
    var peer2;

    function  create2ndPeer() {
        var answerConfig = {
            onanswer: function(sdp) {
                console.log('2nd peer: sdp' + sdp);

                /* 1st peer should complete the handshake using answer SDP provided by 2nd peer! */
                peer1.onanswer(sdp);
            },
            getice: function(candidate) {
                console.log('2nd peer: candidate' + candidate);

                /* 1st peer should process/add ice candidates sent by 2nd peer! */
                peer1 && peer1.addice({
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: candidate.candidate
                });
            },
            gotstream: function(event) {
                console.log('2nd peer: Wow! Got remote stream!');
                document.getElementById('remote-video-2').src = URL.createObjectURL(event.stream);
            },
            stream: clientStream,

            /* You'll use offer SDP here */
            offer: offerSDP
        };

        peer2 = RTCPeerConnection(answerConfig);
    }
</script>
```

##Another realtime but advance client side [example](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Python/files/demos/client-side-socket-io.html) using socket.io over PubNub! - [Preview / Demo](https://webrtc-experiment.appspot.com/demos/client-side-socket-io.html)

```html
<script src="https://webrtc-experiment.appspot.com/RTCPeerConnection.js"></script>
<script src="https://webrtc-experiment.appspot.com/RTCPeerConnection-Helpers.js"></script>

<script src="https://dh15atwfs066y.cloudfront.net/socket.io.min.js"></script>

<script>
    function uniqueToken() {
        var s4 = function () {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }
    var uniqueChannel = uniqueToken();
</script>

<style>body{text-align: center;}</style>
<h2>Client video</h2>
<video id="client-video" autoplay></video>

<h2>Remote video getting stream from peer2</h2>
<video id="remote-video-1" autoplay></video>

<h2>Remote video getting stream from peer1</h2>
<video id="remote-video-2" autoplay></video>

<!-- First of all; get camera -->
<script>
    var socket = io.connect('http://pubsub.pubnub.com/' + uniqueChannel, {
        channel: uniqueChannel,
        publish_key: 'demo',
        subscribe_key: 'demo'
    });

    socket.on('message', function (message) {
        
        /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted into two parts */
        
        if (message.firstPart) {
            global.firstPart = message.firstPart;

            if (global.secondPart) {              
                if(message.by == 'peer1') 
                {
                    offerSDP = JSON.parse(global.firstPart + global.secondPart);
                    setTimeout(create2ndPeer, 400);
                }
                else 
                {
                    /* 1st peer should complete the handshake using answer SDP provided by 2nd peer! */
                    peer1.onanswer(JSON.parse(global.firstPart + global.secondPart));
                }
            }
        }
        
        if (message.secondPart) {
            global.secondPart = message.secondPart;
            if (global.firstPart) {
                if(message.by == 'peer1') 
                {
                    offerSDP = JSON.parse(global.firstPart + global.secondPart);
                    setTimeout(create2ndPeer, 400);
                }
                else 
                {
                    /* 1st peer should complete the handshake using answer SDP provided by 2nd peer! */
                    peer1.onanswer(JSON.parse(global.firstPart + global.secondPart));
                }
            }
        }

        if (message.candidate) {
            /* 2nd peer should process/add ice candidates sent by 1st peer! */
            if(message.by == 'peer1')
            {
                peer2 && peer2.addice({
                    sdpMLineIndex: message.sdpMLineIndex,
                    candidate: JSON.parse(message.candidate)
                });
            }
            else
            {
                peer1 && peer1.addice({
                    sdpMLineIndex: message.sdpMLineIndex,
                    candidate: JSON.parse(message.candidate)
                });
            }
        }
    });

    socket.on('connect', function () {
        getUserMedia({
            video: document.getElementById('client-video'),
            onsuccess: function (stream) {
                clientStream = stream;

                /* Got access to camera; Now start creating offer sdp */
                create1stPeer();
            }
        });
    });
    
    var clientStream;

    var global = {};
</script>

<!-- First peer: the offerer -->
<script>
    /* "offerSDP" will be used by your participant! */
    var offerSDP, peer1;

    function create1stPeer() {
        var offerConfig = {
            onoffer: function (sdp) {
                console.log('1st peer: offer sdp: ' + sdp);

                /* Transmit offer SDP toward 2nd peer */
                sendsdp(sdp, 'peer1');
            },
            getice: function (candidate) {
                console.log('1st peer: candidate' + candidate);

                socket.send({
                    by: 'peer1',
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: JSON.stringify(candidate.candidate)
                });
            },
            gotstream: function (event) {
                console.log('1st peer: Wow! Got remote stream!');
                document.getElementById('remote-video-1').src = URL.createObjectURL(event.stream);
            },
            stream: clientStream,
            isopus: window.isopus
        };

        peer1 = RTCPeerConnection(offerConfig);
    }
</script>

<!-- Second peer: the participant -->
<script>

    var peer2;

    function  create2ndPeer() {
        var answerConfig = {
            onanswer: function (sdp) {
                console.log('2nd peer: sdp' + sdp);

                /* Transmit answer SDP toward 1st peer */
                sendsdp(sdp, 'peer2');
            },
            getice: function (candidate) {
                console.log('2nd peer: candidate' + candidate);

                socket.send({
                    by: 'peer2',
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: JSON.stringify(candidate.candidate)
                });
            },
            gotstream: function (event) {
                console.log('2nd peer: Wow! Got remote stream!');
                document.getElementById('remote-video-2').src = URL.createObjectURL(event.stream);
            },
            stream: clientStream,

            /* You'll use offer SDP here */
            offer: offerSDP,
            
            isopus: window.isopus
        };
        peer2 = RTCPeerConnection(answerConfig);
    }

    function sendsdp(sdp, by) {
        sdp = JSON.stringify(sdp);

        var firstPart = sdp.substr(0, 700),
            secondPart = sdp.substr(701, sdp.length - 1);

        socket.send({
            by: by,
            firstPart: firstPart
        });

        socket.send({
            by: by,
            secondPart: secondPart
        });
    }
</script>
```

##Another realtime but advance client side [example](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Python/files/demos/client-side-websocket.html) using WebSocket over PubNub! - [Preview / Demo](https://webrtc-experiment.appspot.com/demos/client-side-websocket.html)

```html
<script>
    function uniqueToken() {
        var s4 = function () {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }
    var uniqueChannel = uniqueToken();
</script>

<script src="https://webrtc-experiment.appspot.com/RTCPeerConnection.js"></script>
<script src="https://webrtc-experiment.appspot.com/RTCPeerConnection-Helpers.js"></script>

<script src="https://pubnub.a.ssl.fastly.net/pubnub-3.1.min.js"></script>
<script src="https://webrtc-experiment.appspot.com/dependencies/websocket.js" type="text/javascript"></script>

<style>body{text-align: center;}</style>
<h2>Client video</h2>
<video id="client-video" autoplay></video>

<h2>Remote video getting stream from peer2</h2>
<video id="remote-video-1" autoplay></video>

<h2>Remote video getting stream from peer1</h2>
<video id="remote-video-2" autoplay></video>

<!-- First of all; get camera -->
<script>
    var socket = new WebSocket('wss://pubsub.pubnub.com/demo/demo/' + uniqueChannel);

    socket.onmessage = function (event) {
        var message = event.data;

        /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted into two parts */
        
        if (message.firstPart) {
            global.firstPart = message.firstPart;

            if (global.secondPart) {              
                if(message.by == 'peer1') 
                {
                    offerSDP = JSON.parse(global.firstPart + global.secondPart);
                    setTimeout(create2ndPeer, 400);
                }
                else 
                {
                    /* 1st peer should complete the handshake using answer SDP provided by 2nd peer! */
                    peer1.onanswer(JSON.parse(global.firstPart + global.secondPart));
                }
            }
        }
        
        if (message.secondPart) {
            global.secondPart = message.secondPart;
            if (global.firstPart) {
                if(message.by == 'peer1') 
                {
                    offerSDP = JSON.parse(global.firstPart + global.secondPart);
                    setTimeout(create2ndPeer, 400);
                }
                else 
                {
                    /* 1st peer should complete the handshake using answer SDP provided by 2nd peer! */
                    peer1.onanswer(JSON.parse(global.firstPart + global.secondPart));
                }
            }
        }

        if (message.candidate) {
            /* 2nd peer should process/add ice candidates sent by 1st peer! */
            if(message.by == 'peer1')
            {
                peer2 && peer2.addice({
                    sdpMLineIndex: message.sdpMLineIndex,
                    candidate: JSON.parse(message.candidate)
                });
            }
            else
            {
                peer1 && peer1.addice({
                    sdpMLineIndex: message.sdpMLineIndex,
                    candidate: JSON.parse(message.candidate)
                });
            }
        }
    };
    socket.onopen = function() {
        getUserMedia({
            video: document.getElementById('client-video'),
            onsuccess: function (stream) {
                clientStream = stream;

                /* Got access to camera; Now start creating offer sdp */
                create1stPeer();
            }
        });
    };
    
    var clientStream;

    var global = {};
</script>

<!-- First peer: the offerer -->
<script>
    /* "offerSDP" will be used by your participant! */
    var offerSDP, peer1;

    function create1stPeer() {
        var offerConfig = {
            onoffer: function (sdp) {
                console.log('1st peer: offer sdp: ' + sdp);

                /* Transmit offer SDP toward 2nd peer */
                sendsdp(sdp, 'peer1');
            },
            getice: function (candidate) {
                console.log('1st peer: candidate' + candidate);

                socket.send({
                    by: 'peer1',
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: JSON.stringify(candidate.candidate)
                });
            },
            gotstream: function (event) {
                console.log('1st peer: Wow! Got remote stream!');
                document.getElementById('remote-video-1').src = URL.createObjectURL(event.stream);
            },
            stream: clientStream,

            isopus: window.isopus
        };

        peer1 = RTCPeerConnection(offerConfig);
    }
</script>

<!-- Second peer: the participant -->
<script>

    var peer2;

    function  create2ndPeer() {
        var answerConfig = {
            onanswer: function (sdp) {
                console.log('2nd peer: sdp' + sdp);

                /* Transmit answer SDP toward 1st peer */
                sendsdp(sdp, 'peer2');
            },
            getice: function (candidate) {
                console.log('2nd peer: candidate' + candidate);

                socket.send({
                    by: 'peer2',
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: JSON.stringify(candidate.candidate)
                });
            },
            gotstream: function (event) {
                console.log('2nd peer: Wow! Got remote stream!');
                document.getElementById('remote-video-2').src = URL.createObjectURL(event.stream);
            },
            stream: clientStream,

            /* You'll use offer SDP here */
            offer: offerSDP,

            isopus: window.isopus
        };
        peer2 = RTCPeerConnection(answerConfig);
    }

    function sendsdp(sdp, by) {
        sdp = JSON.stringify(sdp);

        var firstPart = sdp.substr(0, 700),
            secondPart = sdp.substr(701, sdp.length - 1);

        socket.send({
            by: by,
            firstPart: firstPart
        });

        socket.send({
            by: by,
            secondPart: secondPart
        });
    }
</script>
```

##Spec references 

* [WebRTC 1.0: Real-time Communication Between Browsers](http://dev.w3.org/2011/webrtc/editor/webrtc.html)
* [TURN Server at Wikipedia!](http://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT)
* [STUN Server at Wikipedia!](http://en.wikipedia.org/wiki/STUN)

## License
Copyright (c) 2012 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.