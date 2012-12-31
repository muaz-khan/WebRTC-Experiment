/* send (i.e. transmit) offer/answer sdp */
function sendsdp(sdp, socket, isopus) {
    sdp = JSON.stringify(sdp);

    /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted into two parts */
    var firstPart = sdp.substr(0, 700),
        secondPart = sdp.substr(701, sdp.length - 1);

    /* transmitting first sdp part */
    socket.send({
        userToken: global.userToken,
        firstPart: firstPart,

        /* let other end know that whether you support opus */
        isopus: isopus
    });

    /* transmitting second sdp part */
    socket.send({
        userToken: global.userToken,
        secondPart: secondPart,

        /* let other end know that whether you support opus */
        isopus: isopus
    });
}

/* send (i.e. transmit) ICE candidates */

function sendice(candidate, socket) {
    socket.send({
        userToken: global.userToken, /* unique ID to identify the sender */
        candidate: {
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate: JSON.stringify(candidate.candidate)
        }
    });
}

function gotstream(event, recheck) {

    if (event) {

        var video = document.createElement('audio');
        video.src = webkitURL.createObjectURL(global.clientStream);
		video.autoplay =true;
		video.controls = true;
        video.play();
		
		video.addEventListener('play', function () {
                this.muted = true;
                this.volume = 0;
                console.log('remote video as client >> Unmuting and setting volume to max level');
            }, false);

        participants.appendChild(video, participants.firstChild);

        clientVideo.pause();

        if (!navigator.mozGetUserMedia) clientVideo.src = URL.createObjectURL(event.stream);
        else clientVideo.mozSrcObject = event.stream;

        
        clientVideo.play();
		
		clientVideo.addEventListener('play', function () {
                this.muted = false;
                this.volume = 1;
                console.log('client video as remote >> Unmuting and setting volume to max level');
            }, false);

        gotstream(null, true);
    }

    if (recheck) {
        if (!(clientVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || clientVideo.paused || clientVideo.currentTime <= 0)) {
            finallyGotStream();
        } else
            setTimeout(function() {
                gotstream(null, true);
            }, 500);
    }
}

function finallyGotStream() {
    clientVideo.css('-webkit-transform', 'rotate(0deg)');
    global.isGotRemoteStream = true;
	
	console.log('successfully got remote stream');
}