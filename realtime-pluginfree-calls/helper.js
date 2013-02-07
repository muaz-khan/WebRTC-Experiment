window.iceServers = null;
window.isopus = null;
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

function gotstream(stream) {
    if (stream) {
        if (!navigator.mozGetUserMedia) audio.src = URL.createObjectURL(stream);
        else audio.mozSrcObject = stream;

        audio.addEventListener('play', function () {
            this.muted = false;
            this.volume = 1;
			
			finallyGotStream();
			
			if (global.recordAudio) recordAudio(stream);
        }, false);
        
        audio.play();

		document.getElementById('call').innerHTML = 'Just a few seconds...';		
		
        if (global.ownerToken) 
			document.getElementById(global.ownerToken).innerHTML = 'Just a few seconds...';
    }
}

/* remote stream started flowing */
function finallyGotStream() {
	global.isGotRemoteStream = true;
    document.getElementById('call').innerHTML = 'Enjoy Calling!';
	
	if (global.ownerToken) document.getElementById(global.ownerToken).innerHTML = 'Enjoy Calling!';
}

var audio = document.getElementById('audio');
function captureCamera(callback) {
    getUserMedia({
        constraints: { audio: true, video: false },
        //constraints: window.defaults.constraints,
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
        onICE: sendice,
        onRemoteStream: gotstream,
        iceServers: iceServers,
        attachStream: global.clientStream,
        onAnswerSDP: sendsdp,
        isopus: window.isopus,
        offerSDP: sdp
    };
    global.rtc = RTCPeerConnection(config);
}

function createOffer() {
    var config = {
        onICE: sendice,
        onRemoteStream: gotstream,
        iceServers: iceServers,
        attachStream: global.clientStream,
        onOfferSDP: sendsdp,
        isopus: window.isopus
    };
    global.rtc = RTCPeerConnection(config);
}

// credit of "recorder.js" goes to someone else
window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
window.URL = window.URL || window.webkitURL;

var recorder, audioContext;

var recorderParent = document.getElementsByClassName('recorder')[0];
function recordAudio(stream) {
	if(global.recordAudio && recorderParent) 
	{
		recorderParent.innerHTML = 'Download WAV';
		recorderParent.style.cursor = 'pointer';
	}
    audioContext = new AudioContext;
    
    var input = audioContext.createMediaStreamSource(stream);
    input.connect(audioContext.destination);
    recorder = new window.Recorder(input);

    recorder && recorder.record();
}

if(recorderParent) recorderParent.onclick = function() {
	if(!global.recordAudio || !global.isGotRemoteStream) return;
	
	recorder && recorder.stop();
        
	// create WAV download link using audio data blob
	createDownloadLink();

	recorder && recorder.clear();

	if(recorderParent) recorderParent.style.display = 'none';
};

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

        if (recordings) recordings.insertBefore(li, recordings.childNodes[0]);
    });
}

/* Record voice call or audio stream */
var recordAudioCheckBox = document.getElementById('record-audio');
if (recordAudioCheckBox)
    recordAudioCheckBox.onchange = function () {
        if (this.checked) global.recordAudio = true;
        else global.recordAudio = false;
    };