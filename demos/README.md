![WebRTC Experiment!](https://muazkh.appspot.com/images/WebRTC.png)

--

[WebRTC Experiments](https://webrtc-experiment.appspot.com) using WebSocket, Socket.io and XHR for signaling. Also screen, video and audio broadcasting experiments!

## Preview / Demos / Experiments

* [Screen Broadcasting using WebRTC](https://webrtc-experiment.appspot.com/screen-broadcast/) - [STUN](https://webrtc-experiment.appspot.com/screen-broadcast/) / [TURN](https://webrtc-experiment.appspot.com/screen-broadcast/?turn=true)
* [Voice/Audio Broadcasting using WebRTC](https://webrtc-experiment.appspot.com/audio-broadcast/) - [STUN](https://webrtc-experiment.appspot.com/audio-broadcast/) / [TURN](https://webrtc-experiment.appspot.com/audio-broadcast/?turn=true)
* [Video Broadcasting using WebRTC](https://webrtc-experiment.appspot.com/broadcast/) - [STUN](https://webrtc-experiment.appspot.com/broadcast/) / [TURN](https://webrtc-experiment.appspot.com/broadcast/?turn=true)
* [WebRTC Experiment using Socket.io for signalling](https://webrtc-experiment.appspot.com/socket.io/) - [STUN](https://webrtc-experiment.appspot.com/socket.io/) / [TURN](https://webrtc-experiment.appspot.com/socket.io/?turn=true)
* [WebRTC Experiment using WebSocket for signalling](https://webrtc-experiment.appspot.com/websocket/) - [STUN](https://webrtc-experiment.appspot.com/websocket/) / [TURN](https://webrtc-experiment.appspot.com/websocket/?turn=true)
* [WebRTC Experiment using PubNub](https://webrtc-experiment.appspot.com/javascript/) - [TURN](https://webrtc-experiment.appspot.com/javascript/?turn=true) / [STUN](https://webrtc-experiment.appspot.com/javascript/)
* [WebRTC Experiment using XHR over ASPNET MVC](https://webrtc-experiment.appspot.com/aspnet-mvc/) - [TURN](https://webrtc-experiment.appspot.com/aspnet-mvc/?turn=true) / [STUN](https://webrtc-experiment.appspot.com/aspnet-mvc/)

If you're new to WebRTC; following demos are for you!

* [Runs in only one tab; uses JavaScript variables directly for signalling.](https://webrtc-experiment.appspot.com/demos/client-side.html) - no server for signalling!
* [Runs in only one tab; uses socket.io for signalling.](https://webrtc-experiment.appspot.com/demos/client-side-socket-io.html) - no server for signalling!
* [Runs in only one tab; uses WebSocket for signalling.](https://webrtc-experiment.appspot.com/demos/client-side-websocket.html) - no server for signalling!

##Credits

* [Muaz Khan](http://github.com/muaz-khan)!
* [PubNub](https://github.com/pubnub/pubnub-api)!

##[A realtime browser only example](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Python/files/demos/client-side.html) - [Preview / Demo](https://webrtc-experiment.appspot.com/demos/client-side.html)

```html
<script src="https://webrtc-experiment.appspot.com/RTCPeerConnection.js"></script>
<script src="https://webrtc-experiment.appspot.com/RTCPeerConnection-Helpers.js"></script>

<h2>Client video</h2><video id="client-video" autoplay></video>
<h2>Remote video getting stream from peer2</h2><video id="remote-video-1" autoplay></video>
<h2>Remote video getting stream from peer1</h2><video id="remote-video-2" autoplay></video>

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
        },
		
		isopus: window.isopus
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
            offer: offerSDP,
			
			isopus: window.isopus
        };

        peer2 = RTCPeerConnection(answerConfig);
    }
</script>
```

##[Client side demo using socket.io](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Python/files/demos/client-side-socket-io.html) using socket.io over PubNub! - [Preview / Demo](https://webrtc-experiment.appspot.com/demos/client-side-socket-io.html)

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

<h2>Client video</h2><video id="client-video" autoplay></video>
<h2>Remote video getting stream from peer2</h2><video id="remote-video-1" autoplay></video>
<h2>Remote video getting stream from peer1</h2><video id="remote-video-2" autoplay></video>

<!-- First of all; get camera -->
<script>
    var socket;
    function openSocket() {
        socket = io.connect('http://pubsub.pubnub.com/' + uniqueChannel, {
            channel: uniqueChannel,
            publish_key: 'demo',
            subscribe_key: 'demo'
        });

        socket.on('message', function (message) {

            /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted into two parts */

            if (message.firstPart) {
                global.firstPart = message.firstPart;

                if (global.secondPart) {
                    if (message.by == 'peer1') {
                        offerSDP = JSON.parse(global.firstPart + global.secondPart);
                        setTimeout(create2ndPeer, 400);
                    }
                    else {
                        /* 1st peer should complete the handshake using answer SDP provided by 2nd peer! */
                        peer1.onanswer(JSON.parse(global.firstPart + global.secondPart));
                    }
                }
            }

            if (message.secondPart) {
                global.secondPart = message.secondPart;
                if (global.firstPart) {
                    if (message.by == 'peer1') {
                        offerSDP = JSON.parse(global.firstPart + global.secondPart);
                        setTimeout(create2ndPeer, 400);
                    }
                    else {
                        /* 1st peer should complete the handshake using answer SDP provided by 2nd peer! */
                        peer1.onanswer(JSON.parse(global.firstPart + global.secondPart));
                    }
                }
            }

            if (message.candidate) {
                /* 2nd peer should process/add ice candidates sent by 1st peer! */
                if (message.by == 'peer1') {
                    peer2 && peer2.addice({
                        sdpMLineIndex: message.sdpMLineIndex,
                        candidate: JSON.parse(message.candidate)
                    });
                }
                else {
                    peer1 && peer1.addice({
                        sdpMLineIndex: message.sdpMLineIndex,
                        candidate: JSON.parse(message.candidate)
                    });
                }
            }
        });

        socket.on('connect', function () {
            /* Socket opened; Now start creating offer sdp */
            create1stPeer();
        });
    }

    getUserMedia({
        video: document.getElementById('client-video'),
        onsuccess: function (stream) {
            clientStream = stream;

            openSocket();
        }
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

##[Client side demo using WebSocket](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/Python/files/demos/client-side-websocket.html) using WebSocket over PubNub! - [Preview / Demo](https://webrtc-experiment.appspot.com/demos/client-side-websocket.html)

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

<h2>Client video</h2><video id="client-video" autoplay></video>
<h2>Remote video getting stream from peer2</h2><video id="remote-video-1" autoplay></video>
<h2>Remote video getting stream from peer1</h2><video id="remote-video-2" autoplay></video>

<!-- First of all; get camera -->
<script>
    var socket;
    function openSocket() {
        socket = new WebSocket('wss://pubsub.pubnub.com/demo/demo/' + uniqueChannel);

        socket.onmessage = function (event) {
            var message = event.data;

            /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted into two parts */

            if (message.firstPart) {
                global.firstPart = message.firstPart;

                if (global.secondPart) {
                    if (message.by == 'peer1') {
                        offerSDP = JSON.parse(global.firstPart + global.secondPart);
                        setTimeout(create2ndPeer, 400);
                    }
                    else {
                        /* 1st peer should complete the handshake using answer SDP provided by 2nd peer! */
                        peer1.onanswer(JSON.parse(global.firstPart + global.secondPart));
                    }
                }
            }

            if (message.secondPart) {
                global.secondPart = message.secondPart;
                if (global.firstPart) {
                    if (message.by == 'peer1') {
                        offerSDP = JSON.parse(global.firstPart + global.secondPart);
                        setTimeout(create2ndPeer, 400);
                    }
                    else {
                        /* 1st peer should complete the handshake using answer SDP provided by 2nd peer! */
                        peer1.onanswer(JSON.parse(global.firstPart + global.secondPart));
                    }
                }
            }

            if (message.candidate) {
                /* 2nd peer should process/add ice candidates sent by 1st peer! */
                if (message.by == 'peer1') {
                    peer2 && peer2.addice({
                        sdpMLineIndex: message.sdpMLineIndex,
                        candidate: JSON.parse(message.candidate)
                    });
                }
                else {
                    peer1 && peer1.addice({
                        sdpMLineIndex: message.sdpMLineIndex,
                        candidate: JSON.parse(message.candidate)
                    });
                }
            }
        };
        socket.onopen = function () {
            /* Socket opened; Now start creating offer sdp */
            create1stPeer();
        };
    }

    getUserMedia({
        video: document.getElementById('client-video'),
        onsuccess: function (stream) {
            clientStream = stream;

            openSocket();
        }
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

Remember: Don't forget to check: [How to use RTCPeerConnection.js? A short guide](https://webrtc-experiment.appspot.com/howto/)

##Spec references 

* [WebRTC 1.0: Real-time Communication Between Browsers](http://dev.w3.org/2011/webrtc/editor/webrtc.html)
* [TURN Server at Wikipedia!](http://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT)
* [STUN Server at Wikipedia!](http://en.wikipedia.org/wiki/STUN)

## License
Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.