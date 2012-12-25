masterSocket();

/* master socket handles all new/old connections/participants */
function masterSocket(channel, onopen) {
    var socket_config = window.socket_config;

    /* if private broadcasted room; unique channel will be passed */
    socket_config.channel = channel || global.defaultChannel;
    socket.master = io.connect('http://pubsub.pubnub.com/webrtc-experiment', socket_config);

    socket.master.on('connect', connect);
    socket.master.on('message', callback);

    function connect() {
        showListsAndBoxes();
        onopen && onopen();
    }

    function callback(data) {
        if (data.userToken == global.userToken) return;
        if (!data.participant || data.forUser != global.userToken) return;

        /* found a participant? .... open new socket for him */
        data.participant && openSocket(data.userToken);
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
        
        /* unique remote video from participant */
        video,

        /* Amazing situation!....in the same broadcasted room; one or more peers can create peer connections
        *  using opus codec; while other peers can use some other codec. Everything is working fine! */
        isopus = window.isopus;

    /* here channel === unique token of the participant (global.userToken -> of the participant) */
    socket_config.channel = channel;
    var socket = io.connect('http://pubsub.pubnub.com/webrtc-experiment', socket_config);

    socket.on('connect', opened);
    socket.on('message', callback);

    /* unique socket opened */
    function opened() {
        var config = {
            iceServers: iceServers,
            stream: global.clientStream,
            onoffer: function (sdp) { sendsdp(sdp, socket, isopus); },
            getice: function(candidate) { sendice(candidate, socket); },
            gotstream: gotstream,
            isopus: isopus
        };

        /* unique peer got video from participant; */
        video = document.createElement('video');
        video.width = (innerWidth / 4);
        video.height = (innerHeight / 3);

        /* and added in the "participants" video list: <td id="participants"></td> */
        participants.appendChild(video, participants.firstChild);
        participants.scrollIntoView(true);

        /* unique peer connection opened */
        peer = RTCPeerConnection(config);
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
                    peer.onanswer(inner.sdp);
                }
            }
            if (response.secondPart) {
                inner.secondPart = response.secondPart;
                if (inner.firstPart) {
                    inner.sdp = JSON.parse(inner.firstPart + inner.secondPart);
                    peer.onanswer(inner.sdp);
                }
            }
        }

        /* process ice candidates sent by participant */
        if (response.candidate && !isGotRemoteStream) {
            peer.addice({
                sdpMLineIndex: response.candidate.sdpMLineIndex,
                candidate: JSON.parse(response.candidate.candidate)
            });
        }

        if (response.end) 
        {
            participants.removeChild(video);
            socket = null;
        }
    }

    /* sub socket got stream */
    function gotstream(event, recheck) {
        if (event) {
            if (!navigator.mozGetUserMedia) video.src = URL.createObjectURL(event.stream);
            else video.mozSrcObject = event.stream;
            video.play();
            gotstream(null, true);
        }

        if (recheck) {
            if (!(video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || video.paused || video.currentTime <= 0)) {
                isGotRemoteStream = true;

                participants.scrollIntoView(true);

            } else setTimeout(function () { gotstream(null, true); }, 50);
        }
    }
}