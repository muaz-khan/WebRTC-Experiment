var global = {
    recordAudio: false
};

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

        if (global.recordAudio)
            recordAudio(event.stream);
		
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

window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
window.URL = window.URL || window.webkitURL;

var recorder, audioContext;
function recordAudio(stream) {
    audioContext = new AudioContext;
    
    var input = audioContext.createMediaStreamSource(stream);
    input.connect(audioContext.destination);
    recorder = new window.Recorder(input);

    recorder && recorder.record();

    setTimeout(function () {
        recorder && recorder.stop();
        
        // create WAV download link using audio data blob
        createDownloadLink();

        recorder.clear();

        recordAudio(global.clientStream);
    }, 120000);
}

var recordings = document.getElementById('recordings');
function createDownloadLink() {
    recorder && recorder.exportWAV(function (blob) {
        var url = URL.createObjectURL(blob);
        var li = document.createElement('li');
        var au = document.createElement('audio');
        var hf = document.createElement('a');

        au.controls = true;
        au.src = url;
        hf.href = url;
        hf.download = new Date().toISOString() + '.wav';
        hf.innerHTML = hf.download;
        li.appendChild(au);
        li.appendChild(hf);
        recordings.appendChild(li);
    });
}