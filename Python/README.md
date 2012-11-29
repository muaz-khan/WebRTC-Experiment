![WebRTC Experiment!](https://sites.google.com/site/muazkh/logo.png)

Real-time [WebRTC Experiment](https://webrtc-experiment.appspot.com) that exposes the power of yours and mine favorite client, the [WebRTC](http://www.webrtc.org/)! 

## Preview / Demo

* [WebRTC Experiments: All](https://webrtc-experiment.appspot.com)
* [JavaScript Only WebRTC Experiment](https://webrtc-experiment.appspot.com/javascript/)
* [ASPNET MVC specific WebRTC Experiment](https://webrtc-experiment.appspot.com/aspnet-mvc/)

## Screenshot

![WebRTC Screenshot 2](https://muazkh.appspot.com/images/WebRTC.png)

![WebRTC Screenshot 1](https://sites.google.com/site/muazkh/Introducntion.png)

##Credits

* Everything: [Muaz Khan](http://github.com/muaz-khan)
* WebRTC APIs: [WebRTC.org](http://www.webrtc.org/) - Thank you Google!

##Browsers

It works in Chrome 23 and upper. You'll see the support of Mozilla Firefox soon!

## JavaScript code!

```javascript
window.PeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
window.SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
window.IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;

window.URL = window.webkitURL || window.URL;
navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

/* -------------------------------------------------------------------------------------------------------------------------- */
var global = { };

var RTC = { }, peerConnection;

RTC.init = function() {
    try {
        peerConnection = new window.PeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] });
        peerConnection.onicecandidate = RTC.checkLocalICE;

        peerConnection.onaddstream = RTC.checkRemoteStream;
        peerConnection.addStream(global.clientStream);
    } catch(e) {
		document.title = 'WebRTC is not supported in this web browser!';
        alert('WebRTC is not supported in this web browser!');
    }
};

RTC.createOffer = function() {
	document.title = 'Creating offer...';
	
    RTC.init();

    peerConnection.createOffer(function(sessionDescription) {
        peerConnection.setLocalDescription(sessionDescription);
		
		document.title = 'Created offer successfully!';
        sdp = JSON.stringify(sessionDescription);

        var data = {
            sdp: sdp,
            userToken: global.userToken,
            roomToken: global.roomToken
        };
		
        $.ajax('/WebRTC/PostSDP', {
            data: data,
            success: function(response) {
                if (response) {
					document.title = 'Posted offer successfully!';
					
					RTC.checkRemoteICE();
					RTC.waitForAnswer();
				}
            }
        });

    }, null, { audio: true, video: true });
};

RTC.waitForAnswer = function() {
	document.title = 'Waiting for answer...';
	
    var data = {
        userToken: global.userToken,
        roomToken: global.roomToken
    };

    $.ajax('/WebRTC/GetSDP', {
        data: data,
        success: function(response) {
            if (response !== false) {
				document.title  = 'Got answer...';
				response = response.sdp;
                try {
                    sdp = JSON.parse(response);
                    peerConnection.setRemoteDescription(new window.SessionDescription(sdp));
                } catch(e) {
                    sdp = response;
                    peerConnection.setRemoteDescription(new window.SessionDescription(sdp));
                }
            } else
                setTimeout(RTC.waitForAnswer, 100);
        }
    });
};

RTC.waitForOffer = function() {
	document.title = 'Waiting for offer...';
    var data = {
        userToken: global.userToken,
        roomToken: global.roomToken
    };

    $.ajax('/WebRTC/GetSDP', {
        data: data,
        success: function(response) {
            if (response !== false) 
			{
				document.title = 'Got offer...';								
				RTC.createAnswer(response.sdp);
			}
            else setTimeout(RTC.waitForOffer, 100);
        }
    });
};

RTC.createAnswer = function(sdpResponse) {
	RTC.init();
	
	document.title = 'Creating answer...';
	
    var sdp;
    try {
        sdp = JSON.parse(sdpResponse);

        peerConnection.setRemoteDescription(new window.SessionDescription(sdp));
    } catch(e) {
        sdp = sdpResponse;

        peerConnection.setRemoteDescription(new window.SessionDescription(sdp));
    }

    peerConnection.createAnswer(function(sessionDescription) {
        peerConnection.setLocalDescription(sessionDescription);
		
		document.title = 'Created answer successfully!';

        sdp = JSON.stringify(sessionDescription);

        var data = {
            sdp: sdp,
            userToken: global.userToken,
            roomToken: global.roomToken
        };

        $.ajax('/WebRTC/PostSDP', {
            data: data,
            success: function() {
				document.title = 'Posted answer successfully!';
			}
        });

    }, null, { audio: true, video: true });
};

RTC.checkRemoteICE = function() {
    if (global.isGotRemoteStream) return;

    if (!peerConnection) {
        setTimeout(RTC.checkRemoteICE, 1000);
        return;
    }

    var data = {
        userToken: global.userToken,
        roomToken: global.roomToken
    };

    $.ajax('/WebRTC/GetICE', {
        data: data,
        success: function(response) {
            if (response === false && !global.isGotRemoteStream) setTimeout(RTC.checkRemoteICE, 1000);
            else {
                try {
                    candidate = new window.IceCandidate({ sdpMLineIndex: response.label, candidate: JSON.parse(response.candidate) });
                    peerConnection.addIceCandidate(candidate);

                    !global.isGotRemoteStream && setTimeout(RTC.checkRemoteICE, 10);
                } catch(e) {
                    try {
                        candidate = new window.IceCandidate({ sdpMLineIndex: response.label, candidate: JSON.parse(response.candidate) });
                        peerConnection.addIceCandidate(candidate);

                        !global.isGotRemoteStream && setTimeout(RTC.checkRemoteICE, 10);
                    } catch(e) {
                        !global.isGotRemoteStream && setTimeout(RTC.checkRemoteICE, 1000);
                    }
                }
            }
        }
    });
};

RTC.checkLocalICE = function(event) {
    if (global.isGotRemoteStream) return;

    var candidate = event.candidate;

    if (candidate) {
        var data = {
            candidate: JSON.stringify(candidate.candidate),
            label: candidate.sdpMLineIndex,
            userToken: global.userToken,
            roomToken: global.roomToken
        };

        $.ajax('/WebRTC/PostICE', {
            data: data,
            success: function() {
				document.title = 'Posted an ICE candidate!';
			}
        });
    }
};

var remoteVideo = $('#remote-video');

RTC.checkRemoteStream = function(remoteEvent) {
    if (remoteEvent) {
		document.title = 'Got a clue for remote video stream!';
		
        remoteVideo.css('top', '-100%').show().play();

        if (!navigator.mozGetUserMedia) remoteVideo.src = window.URL.createObjectURL(remoteEvent.stream);
        else remoteVideo.mozSrcObject = remoteEvent.stream;

        RTC.waitUntilRemoteStreamStartFlowing();
    }
};

RTC.waitUntilRemoteStreamStartFlowing = function() {
	document.title = 'Waiting for remote stream flow!';
    if (!(remoteVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || remoteVideo.paused || remoteVideo.currentTime <= 0)) {
        global.isGotRemoteStream = true;
		
		remoteVideo.css('top', 0);
		clientVideo.css('width', (innerWidth / 4) + 'px').css('height', '').css('z-index', 2000000);
		
		document.title = 'Finally got the remote stream!';
        
        startChatting();        
    } else setTimeout(RTC.waitUntilRemoteStreamStartFlowing, 200);
};
```

##Spec references 

* [http://dev.w3.org/2011/webrtc/editor/webrtc.html](http://dev.w3.org/2011/webrtc/editor/webrtc.html)


## License
Copyright (c) 2012 Muaz Khan
Licensed under the MIT license.