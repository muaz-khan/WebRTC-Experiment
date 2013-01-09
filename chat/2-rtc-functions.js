/* send (i.e. transmit) offer/answer sdp */
function sendsdp(sdp, socket, isopus) {
    sdp = JSON.stringify(sdp);
    window.sdp = sdp;

    var part = parseInt(sdp.length / 3);

    /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted in three parts */
    var firstPart = sdp.slice(0, part),
        secondPart = sdp.slice(part + 1, sdp.length - 1),
        thirdPart = '';

    if (sdp.length > part + part) {
        secondPart = sdp.slice(part, part + part);
        thirdPart = sdp.slice(part + part + 1, sdp.length);
    }

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

    /* transmitting third sdp part */
    socket.send({
        userToken: global.userToken,
        thirdPart: thirdPart,

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

function gotstream() {
    global.isGotRemoteStream = true;
}