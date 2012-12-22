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

        remoteVideo.css('top', 0).css('z-index', 200000).show();
        clientVideo.css('width', (innerWidth / 4) + 'px').css('height', '').css('z-index', 2000000);

        if (!navigator.mozGetUserMedia) remoteVideo.src = URL.createObjectURL(event.stream);
        else video.mozSrcObject = event.stream;

        remoteVideo.play();

        /* check until remote stream start flowing */
        gotstream(null, true);
    }

    if (recheck) {
        if (!(remoteVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || remoteVideo.paused || remoteVideo.currentTime <= 0)) {
            finallyGotStream();
        } else setTimeout(function () {
            gotstream(null, true);
        }, 50);
    }
}

/* remote stream started flowing */
function finallyGotStream() {
    global.isGotRemoteStream = true;

    $('table', true).hide();

    socket.send({
        userToken: global.userToken,
        gotStream: true
    });
}