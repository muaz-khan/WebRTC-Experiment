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
        if (!navigator.mozGetUserMedia) audio.src = URL.createObjectURL(event.stream);
        else audio.mozSrcObject = event.stream;

        audio.addEventListener('play', function () {
            this.muted = false;
            this.volume = 1;
        }, false);

        finallyGotStream();
    }
}

function finallyGotStream() {
    audio.css('-webkit-transform', 'rotate(0deg)');
    global.isGotRemoteStream = true;
	
	console.log('successfully got remote stream');
}