function RTCPeerConnection(options) {
    var w = window;
    var PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection;
    var SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription;
    var IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

    var iceServers = {
        iceServers: IceServersHandler.getIceServers()
    };

    var optional = {
        optional: []
    };

    if (!navigator.onLine) {
        iceServers = null;
        console.warn('No internet connection detected. No STUN/TURN server is used to make sure local/host candidates are used for peers connection.');
    }

    var peerConnection = new PeerConnection(iceServers, optional);

    openOffererChannel();
    peerConnection.onicecandidate = onicecandidate;

    function onicecandidate(event) {
        if (!event.candidate || !peerConnection) {
            return;
        }

        if (options.onICE) {
            options.onICE(event.candidate);
        }
    }

    var constraints = options.constraints || {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    };

    function onSdpError(e) {
        var message = JSON.stringify(e, null, '\t');

        if (message.indexOf('RTP/SAVPF Expects at least 4 fields') !== -1) {
            message = 'It seems that you are trying to interop RTP-datachannels with SCTP. It is not supported!';
        }

        console.error('onSdpError:', message);
    }

    function onSdpSuccess() {}

    function createOffer() {
        if (!options.onOfferSDP) {
            return;
        }

        peerConnection.createOffer(function(sessionDescription) {
            peerConnection.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);
        }, onSdpError, constraints);
    }

    function createAnswer() {
        if (!options.onAnswerSDP) {
            return;
        }

        options.offerSDP = new SessionDescription(options.offerSDP);
        peerConnection.setRemoteDescription(options.offerSDP, onSdpSuccess, onSdpError);

        peerConnection.createAnswer(function(sessionDescription) {
            peerConnection.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);
        }, onSdpError, constraints);
    }

    if (!moz) {
        createOffer();
        createAnswer();
    }

    var channel;

    function openOffererChannel() {
        if (moz && !options.onOfferSDP) {
            return;
        }

        if (!moz && !options.onOfferSDP) {
            return;
        }

        _openOffererChannel();
        if (moz) {
            createOffer();
        }
    }

    function _openOffererChannel() {
        // protocol: 'text/chat', preset: true, stream: 16
        // maxRetransmits:0 && ordered:false
        var dataChannelDict = {};

        console.debug('dataChannelDict', dataChannelDict);

        channel = peerConnection.createDataChannel('channel', dataChannelDict);
        setChannelEvents();
    }

    function setChannelEvents() {
        channel.onmessage = options.onmessage;
        channel.onopen = function() {
            options.onopen(channel);
        };
        channel.onclose = options.onclose;
        channel.onerror = options.onerror;
    }

    if (options.onAnswerSDP && moz && options.onmessage) {
        openAnswererChannel();
    }

    if (!moz && !options.onOfferSDP) {
        openAnswererChannel();
    }

    function openAnswererChannel() {
        peerConnection.ondatachannel = function(event) {
            channel = event.channel;
            setChannelEvents();
        };

        if (moz) {
            createAnswer();
        }
    }

    function useless() {}

    return {
        addAnswerSDP: function(sdp) {
            sdp = new SessionDescription(sdp);
            peerConnection.setRemoteDescription(sdp, onSdpSuccess, onSdpError);
        },
        addICE: function(candidate) {
            peerConnection.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        },

        peer: peerConnection,
        channel: channel,
        sendData: function(message) {
            if (!channel) {
                return;
            }

            channel.send(message);
        }
    };
}
