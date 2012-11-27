window.PeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
window.SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
window.IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;

window.URL = window.webkitURL || window.URL;
navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

/* -------------------------------------------------------------------------------------------------------------------------- */
var global = { }, RTC = { active: false }, peerConnection;

RTC.init = function(response) {
    if(!peerConnection)
    {
        try 
        {
            peerConnection = new PeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] });
    	} catch(e) {
    		log('WebRTC is not supported in this web browser!');
            alert('WebRTC is not supported in this web browser!');
        }
    		peerConnection.onicecandidate = RTC.onicecandidate;
            peerConnection.onaddstream = RTC.onaddstream;
            peerConnection.addStream(global.clientStream);

            RTC.active = true;
    }

        if(global.offerer && response)
        {
            log('Got answer SDP from ' + global.participant);
            peerConnection.setRemoteDescription(new SessionDescription(JSON.parse(response)));
			log('Answer SDP processed successfully!');
        }
        else if(response)
        {
            peerConnection.setRemoteDescription(new SessionDescription(JSON.parse(response)));
			
            peerConnection.createAnswer(function(sessionDescription) {
                peerConnection.setLocalDescription(sessionDescription);              

                sdp = JSON.stringify(sessionDescription);
				var firstPart = sdp.substr(0, 700),
					secondPart = sdp.substr(701, sdp.length - 1);
					
                pubnub.send({
                    userToken: global.userToken,
                    firstPart: firstPart
                });
				
				pubnub.send({
                    userToken: global.userToken,
                    secondPart: secondPart
                });
				
				log('Answer SDP created & sent successfully!');

            }, null, { audio: true, video: true });		
			
        }

        if(!response && global.offerer && global.participant)
        {	
            peerConnection.createOffer(function(sessionDescription) {
                peerConnection.setLocalDescription(sessionDescription);               

                sdp = JSON.stringify(sessionDescription);
                var firstPart = sdp.substr(0, 700),
					secondPart = sdp.substr(701, sdp.length - 1);
					
                pubnub.send({
                    userToken: global.userToken,
                    firstPart: firstPart
                });
				
				pubnub.send({
                    userToken: global.userToken,
                    secondPart: secondPart
                });
				
				log('Offer created successfully!');

            }, null, { audio: true, video: true });
        }
    
};

var remoteVideo = $('#remote-video');
RTC.onaddstream = function(remoteEvent) {
    if (remoteEvent) {
        log('Got a clue for remote video stream!');		
        remoteVideo.css('top', '-100%').show().play();

        if (!navigator.mozGetUserMedia) remoteVideo.src = window.URL.createObjectURL(remoteEvent.stream);
        else remoteVideo.mozSrcObject = remoteEvent.stream;

        RTC.waitUntilRemoteStreamStartFlowing();
    }
};

RTC.waitUntilRemoteStreamStartFlowing = function() {
	log('Waiting for remote stream flow!');
    if (!(remoteVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || remoteVideo.paused || remoteVideo.currentTime <= 0)) {
        global.isGotRemoteStream = true;
		
		remoteVideo.css('top', 0);
		clientVideo.css('width', (innerWidth / 4) + 'px').css('height', '').css('z-index', 2000000);
		
		log('Finally got the remote stream!');        
        startChatting();        
    } else setTimeout(RTC.waitUntilRemoteStreamStartFlowing, 200);
};