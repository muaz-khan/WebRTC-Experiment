function sendsdp(sdp) {
    sdp = JSON.stringify(sdp);
    var firstPart = sdp.substr(0, 700),
        secondPart = sdp.substr(701, sdp.length - 1);

    socket.send({
        userToken: global.userToken,
        firstPart: firstPart
    });

    socket.send({
        userToken: global.userToken,
        secondPart: secondPart
    });
}

function sendice(candidate) {
    socket.send({
        userToken: global.userToken,
        candidate: {
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate: JSON.stringify(candidate.candidate)
        }
    });
}

var remoteVideo = $('#remote-video');
function gotstream(event, recheck) {

        if (event) {

            remoteVideo.css('top', 0).css('z-index', 200000).show();
            clientVideo.css('width', (innerWidth / 4) + 'px').css('height', '').css('z-index', 2000000);

            if (!navigator.mozGetUserMedia) remoteVideo.src = URL.createObjectURL(event.stream);
            else video.mozSrcObject = event.stream;

            remoteVideo.play();
        }

        if (!event && recheck) {
            if (!(remoteVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || remoteVideo.paused || remoteVideo.currentTime <= 0)) {
                finallyGotStream();
            } else setTimeout(function() {
                gotstream(null, true);
            }, 50);
        }
}

function finallyGotStream()
{
    global.isGotRemoteStream = true;

    $('table', true).hide();

    socket.send({
        userToken: global.userToken,
        gotStream: true
    });
}