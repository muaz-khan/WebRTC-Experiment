masterSocket();

/* master socket handles all new/old connections/participants */
function masterSocket(channel, onopen) {
    var socket_config = window.socket_config;

    /* if private broadcasted room; unique channel will be passed */
    socket_config.channel = channel || global.defaultChannel;
    socket.master = io.connect('https://pubsub.pubnub.com/webrtc-experiment', socket_config);

    socket.master.on('connect', connect);
    socket.master.on('message', callback);

    function connect() {
        showListsAndBoxes();
        onopen && onopen();
    }

    function callback(data) {
        if (data.roomToken || data.userToken == global.userToken) return;
        if (!data.participant || data.forUser != global.userToken) return;
        if (data.participant) {
            /* found a participant? .... open new socket for him */
            openSocket(data.userToken);
        }
    }
}

/* this function creates unique sockets and unique peers to handle the real broadcasting!
*  in this case; participant closes his old (public) socket; and creates new socket and sets channel === his own unique token (global.userToken) */
function openSocket(channel) {
    var socket_config = window.socket_config,
        isGotRemoteStream,
        peer,

        /* inner variable stores firstPart and secondPart of the answer SDP sent by the participant */
        inner = {},
        
        /* unique remote audio from participant */
        audio,

        /* Amazing situation!....in the same broadcasted room; one or more peers can create peer connections
        *  using opus codec; while other peers can use some other codec. Everything is working fine! */
        isopus = window.isopus;

    /* here channel === unique token of the participant (global.userToken -> of the participant) */
    socket_config.channel = channel;
    var socket = io.connect('https://pubsub.pubnub.com/webrtc-experiment', socket_config);

    socket.on('connect', opened);
    socket.on('message', callback);

    /* unique socket opened */
    function opened() {
        var config = {
            iceServers: iceServers,
            attachStream: global.clientStream,
            onOfferSDP: function (sdp) { sendsdp(sdp, socket, isopus); },
            getice: function(candidate) { sendice(candidate, socket); },
            onRemoteStream: gotstream,
            isopus: isopus
        };

        /* unique peer got audio from participant; */
        audio = document.createElement('audio');
        audio.css('-webkit-transform', 'rotate(0deg)');
        audio.autoplay = true;
		audio.controls = true;

		audio.addEventListener('play', function () {
		    this.muted = false;
		    this.volume = 1;
		}, false);
		

        /* and added in the "participants" audio list: <td id="participants"></td> */
        participants.appendChild(audio, participants.firstChild);

        /* unique peer connection opened */
        peer = RTCPeerConnection(config);
    }

    var invokedOnce = false;
    function selfInvoker() {
        if (invokedOnce) return;
        
        if (!peer) setTimeout(selfInvoker, 100);
        else {
            invokedOnce = true;
            peer.addAnswerSDP(inner.sdp);
        }
    }

    /* unique socket got message from participant */
    function callback(response) {
        if (response.userToken == global.userToken) return;

        /* both ends MUST support opus; otherwise don't use opus! */
        response.isopus !== 'undefined' && (isopus = response.isopus && isopus);

        /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted into two parts */
        if (response.firstPart || response.secondPart) {
            if (response.firstPart) {
                inner.firstPart = response.firstPart;
                if (inner.secondPart) {
                    inner.sdp = JSON.parse(inner.firstPart + inner.secondPart);
                    selfInvoker();
                }
            }
            if (response.secondPart) {
                inner.secondPart = response.secondPart;
                if (inner.firstPart) {
                    inner.sdp = JSON.parse(inner.firstPart + inner.secondPart);
                    selfInvoker();
                }
            }
        }

        /* process ice candidates sent by participant */
        if (response.candidate && !isGotRemoteStream) {
            peer && peer.addICE({
                sdpMLineIndex: response.candidate.sdpMLineIndex,
                candidate: JSON.parse(response.candidate.candidate)
            });
        }

        if (response.end) audio && participants.removeChild(audio);
    }

    /* sub socket got stream */
    function gotstream(stream) {
        if (stream) {
            if (!navigator.mozGetUserMedia) audio.src = URL.createObjectURL(stream);
            else audio.mozSrcObject = stream;
			
			audio.addEventListener('play', function () {
				this.muted = false;
				this.volume = 1;
			}, false);

            isGotRemoteStream = true;
            audio.css('-webkit-transform', 'rotate(360deg)');
            audio.play();
        }
    }
}