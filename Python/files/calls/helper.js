var global = {};

/* helps generating unique tokens for users and rooms */
function uniqueToken() {
    var s4 = function () {
        return Math.floor(Math.random() * 0x10000).toString(16);
    };
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

/* send (i.e. transmit) offer/answer sdp */
function sendsdp(sdp) {
    sdp = JSON.stringify(sdp);

    /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted into two parts */
    var firstPart = sdp.substr(0, 700),
        secondPart = sdp.substr(701, sdp.length - 1);

    /* transmitting first sdp part */
    socket.send({
        userToken: global.userToken,
        firstPart: firstPart,

        /* let other end know that whether you support opus */
        isopus: window.isopus
    });

    /* transmitting second sdp part */
    socket.send({
        userToken: global.userToken,
        secondPart: secondPart,

        /* let other end know that whether you support opus */
        isopus: window.isopus
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

function gotstream(event) {
    if (event) {
        if (!navigator.mozGetUserMedia) audio.src = webkitURL.createObjectURL(event.stream);
        else audio.mozSrcObject = event.stream;

        audio.addEventListener('play', function () {
            this.muted = false;
            this.volume = 1;
        }, false);
        
        audio.play();

        global.isGotRemoteStream = true;
        document.getElementById('call').innerHTML = 'Enjoy Calling!';
		
        if (global.ownerToken) 
            document.getElementById(global.ownerToken).innerHTML = 'Enjoy Calling!';
    }
}

var audio = document.getElementById('audio');
function captureCamera(callback) {
    getUserMedia({
        constraints: { audio: true, video: false },
        onsuccess: function (stream) {
            global.clientStream = stream;
            callback && callback();
        },
        onerror: function () {
            alert('Either you not allowed access to your microphone or another application already using it.');
        }
    });
}

function createAnswer(sdp) {
    var config = {
        getice: sendice,
        gotstream: gotstream,
        iceServers: iceServers,
        stream: global.clientStream,
        onanswer: sendsdp,
        isopus: window.isopus,
        offer: sdp
    };
    global.rtc = RTCPeerConnection(config);
}

function createOffer() {
    var config = {
        getice: sendice,
        gotstream: gotstream,
        iceServers: iceServers,
        stream: global.clientStream,
        onoffer: sendsdp,
        isopus: window.isopus
    };
    global.rtc = RTCPeerConnection(config);
}