masterSocket();

var openedSockets = '--';
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
        
		/* found a participant? .... open new socket for him */
		if (data.participant) {
			
			/* Fast nature of pubnub causes issue here!!! */
			if(openedSockets.indexOf(data.userToken) != -1) return;
			
			openedSockets += data.userToken + '--';           
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
            onOfferSDP: function (sdp) { sendsdp(sdp, socket, isopus); },
            onICE: function (candidate) { sendice(candidate, socket); },
            onChannelOpened: function (_channel) {
                global.channels[global.channels.length] = _channel;
				disable(false);
				_channel.send(JSON.stringify({ connected: true }));
            },
            onChannelMessage: onMessage
        };

        /* unique peer connection opened */
        peer = RTCPeerConnection(config);
    }

    var invokedOnce = false;
    function selfInvoker() {
        if (invokedOnce) return;
        
        if (!peer) setTimeout(selfInvoker, 100);
        else {
            invokedOnce = true;

            inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);
            peer.addAnswerSDP(inner.sdp);
			
			disable(true);
        }
    }

    /* unique socket got message from participant */
    function callback(response) {
        if (response.userToken == global.userToken) return;

        /* both ends MUST support opus; otherwise don't use opus! */
        response.isopus !== 'undefined' && (isopus = response.isopus && isopus);


        /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted in three parts */
        if (response.firstPart || response.secondPart || response.thirdPart) {

            /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted in three parts */
            if (response.firstPart) {
                inner.firstPart = response.firstPart;

                if (inner.secondPart && inner.thirdPart) selfInvoker();
            }
            if (response.secondPart) {
                inner.secondPart = response.secondPart;
                if (inner.firstPart && inner.thirdPart) selfInvoker();
            }

            if (response.thirdPart) {
                inner.thirdPart = response.thirdPart;
                if (inner.firstPart && inner.secondPart) selfInvoker();
            }
        }

        /* process ice candidates sent by participant */
        if (response.candidate && !isGotRemoteStream) {
            peer && peer.addICE({
                sdpMLineIndex: response.candidate.sdpMLineIndex,
                candidate: JSON.parse(response.candidate.candidate)
            });
        }

        if (response.end) console.log('A roommate left you!');
    }
}