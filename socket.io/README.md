![WebRTC Experiment!](https://muazkh.appspot.com/images/WebRTC.png)

--

This [experiment](https://webrtc-experiment.appspot.com/socket.io/) is using socket.io over PubNub for signaling! It uses Socket.IO APIs to leverage human perspective real-time data sharing mechanism on PubNub infrastructure.

The specialty of PubNub oriented Socket.IO implementation is that it doesn't require a Node.JS backend.

What you need to understand is the only JavaScript!

## Preview / Demos / Experiments

* [Socket.io over PubNub](https://webrtc-experiment.appspot.com/socket.io/) - [STUN](https://webrtc-experiment.appspot.com/socket.io/) / [TURN](https://webrtc-experiment.appspot.com/socket.io/?turn=true)
* [WebSocket over PubNub](https://webrtc-experiment.appspot.com/websocket/) - [STUN](https://webrtc-experiment.appspot.com/websocket/) / [TURN](https://webrtc-experiment.appspot.com/websocket/?turn=true)
* [PubNub HTML5 Modern JavaScript](https://webrtc-experiment.appspot.com/javascript/) - [TURN](https://webrtc-experiment.appspot.com/javascript/?turn=true) / [STUN](https://webrtc-experiment.appspot.com/javascript/)
* [XHR for ASPNET MVC](https://webrtc-experiment.appspot.com/aspnet-mvc/) - [TURN](https://webrtc-experiment.appspot.com/aspnet-mvc/?turn=true) / [STUN](https://webrtc-experiment.appspot.com/aspnet-mvc/)

##Credits

* [Muaz Khan](http://github.com/muaz-khan)!
* [PubNub](https://github.com/pubnub/pubnub-api)!

##Browsers

It works fine on Google Chrome Stable 23 (and upper stable releases!)

## JavaScript code from [5-socket.io.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socket.io/5-socket.io.js)!

```javascript
var socket_config = {
	channel: 'WebRTC Experiments Room',
	publish_key: 'demo',
	subscribe_key: 'demo',
	ssl: true
};

/* initializing the socket.io */
var socket;
pubnub.init = function (pub) {
    socket = io.connect('http://pubsub.pubnub.com/webrtc-experiment', socket_config);

    socket.on('connect', pub.connect);
    socket.on('message', pub.callback);
};

/* main wrapper function used to initialize the socket.io */
function initSocket(callback) {
    pubnub.init({
        
        /* message returned by socket.io */
        callback: function (response) {
            
            /* if same user sent message; don't get! */
            if (response.userToken === global.userToken) return;

            /* if a room is gone busy or someone joined the room. Hide room from all other peers! */
            if (response.isBusyRoom && response.ownerToken !== global.userToken) {
                
                /* Remove room from all other peers! Because it is now a busy room! */
                var owner = $('#' + response.ownerToken);
                if (owner) {
                    owner = owner.parentNode;
                    owner.parentNode.removeChild(owner);
                }
            }
            
            /* not yet joined or created any room!..search the room for current site visitor! */
            else if (global.isGetAvailableRoom && response.roomToken) getAvailableRooms(response);
            
            /* either offer or answer sdp sent by other end */
            else if (response.firstPart || response.secondPart) {
                
                /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted into two parts */
                if (response.firstPart) {
                    global.firstPart = response.firstPart;

                    if (global.secondPart) {
                        global.sdp = JSON.parse(global.firstPart + global.secondPart);

                        if (global.offerer) global.rtc.onanswer(global.sdp);
                        else createAnswer(global.sdp);
                    }
                }
                if (response.secondPart) {
                    global.secondPart = response.secondPart;
                    if (global.firstPart) {

                        global.sdp = JSON.parse(global.firstPart + global.secondPart);

                        if (global.offerer) global.rtc.onanswer(global.sdp);
                        else createAnswer(global.sdp);
                    }
                }
            }
            
            /* if someone is joining your room! */
            else if (response.participant && response.forUser == global.userToken) {
                setTimeout(function () {
                    global.participant = response.participant;

                    if (!global.isPrivateRoom) {
                        pubnub.unsubscribe();
                        pubnub.channel = global.roomToken;

                        initSocket(createOffer);
                    }
                    else createOffer();
                }, 100);
            }
            
            /* process ice candidates sent by other end */
            else if (global.rtc && response.candidate && !global.isGotRemoteStream) {
                global.rtc.addice({
                    sdpMLineIndex: response.candidate.sdpMLineIndex,
                    candidate: JSON.parse(response.candidate.candidate)
                });

            }
            
            /* if you got the stream by other user; stop getting more ice from him! */
            else if (response.gotStream) global.stopSendingICE = true;
            
            /* other end closed the webpage! The user is being informed. */
            else if (response.end && global.isGotRemoteStream) refreshUI();
        },
        
        /* socket is connected */
        connect: function () {
            callback && callback();
        }
    });
}
```

## [JavaScript code](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socket.io/3-rtc.js) calling WebRTC APIs from JS-Wrapper [RTCPeerConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection.js)!

```javascript
/* ---------- common configuration -------- */
var config = {};

function initconfig()
{
	config = {
	    getice: sendice,
	    gotstream: gotstream,
	    iceServers: iceServers,
	    stream: global.clientStream
	};
}

/* ---------- called in case of offer -------- */
function createOffer() {
	initconfig();
    config.onoffer = sendsdp;
    global.rtc = RTCPeerConnection(config);
}

/* ---------- called in case of answer -------- */
function createAnswer(sdp) {
	initconfig();
    config.onanswer = sendsdp;
    config.offer = sdp;
    global.rtc = RTCPeerConnection(config);
}
```

## [JavaScript code](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socket.io/2-rtc-functions.js) handling [RTCWeb](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection.js) stuff!

```javascript
/* send (i.e. transmit) offer/answer sdp */
function sendsdp(sdp) {
    sdp = JSON.stringify(sdp);

    /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted into two parts */
    var firstPart = sdp.substr(0, 700),
        secondPart = sdp.substr(701, sdp.length - 1);

    /* transmitting first sdp part */
    socket.send({
        userToken: global.userToken,
        firstPart: firstPart
    });

    /* transmitting second sdp part */
    socket.send({
        userToken: global.userToken,
        secondPart: secondPart
    });
}

/* send (i.e. transmit) ICE candidates */
function sendice(candidate) {
    socket.send({
        userToken: global.userToken, /* unique ID to identify the sender */
        candidate: {
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate: JSON.stringify(candidate.candidate)
        }
    });
}

/* on getting remote stream */
var remoteVideo = $('#remote-video');
function gotstream(event, recheck) {

        if (event) {

            if (!navigator.mozGetUserMedia) remoteVideo.src = URL.createObjectURL(event.stream);
            else video.mozSrcObject = event.stream;

            remoteVideo.play();

			/* check until remote stream start flowing */
            gotstream(null, true);
        }

		/* check until remote stream start flowing */
        if (recheck) {
            if (!(remoteVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || remoteVideo.paused || remoteVideo.currentTime <= 0)) {
                finallyGotStream();
            } else setTimeout(function() {
                gotstream(null, true);
            }, 50);
        }
}

/* remote stream started flowing */
function finallyGotStream()
{
	/* gesture to understand you got remote stream successfully */
    global.isGotRemoteStream = true;

	/* let other peers know your status! */
    socket.send({
        userToken: global.userToken,
        gotStream: true
    });
}
```

##Spec references 

* [WebRTC 1.0: Real-time Communication Between Browsers](http://dev.w3.org/2011/webrtc/editor/webrtc.html)
* [TURN Server at Wikipedia!](http://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT)
* [STUN Server at Wikipedia!](http://en.wikipedia.org/wiki/STUN)

## License
Copyright (c) 2012 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.