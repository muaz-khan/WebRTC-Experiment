var RTCPeerConnection = function (options) {
    var STUN = {
        iceServers: [{
            url: 'stun:stun.l.google.com:19302'
        }]
    };

    var optional = {
        optional: [{
			DtlsSrtpKeyAgreement: true
		}]
    };

    var peerConnection = new webkitRTCPeerConnection(STUN, optional);
    peerConnection.onicecandidate = onicecandidate;
    peerConnection.onaddstream = onaddstream;
    peerConnection.addStream(options.attachStream);

    function onicecandidate(event) {
        if (!event.candidate || !peerConnection) return;
        if (options.onICE) options.onICE(event.candidate);
    }

    var remoteStreamEventFired = false;
    function onaddstream(event) {
        if (remoteStreamEventFired || !event || !options.onRemoteStream) return;
        remoteStreamEventFired = true;
        options.onRemoteStream(event.stream);
    }

    var constraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    function createOffer() {
        if (!options.onOfferSDP) return;
        peerConnection.createOffer(function (sessionDescription) {
            peerConnection.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);
        }, null, constraints);
    }

    createOffer();

    return {
        addAnswerSDP: function (sdp) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        },
        addICE: function (candidate) {
            peerConnection.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };
};