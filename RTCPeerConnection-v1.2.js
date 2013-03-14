/* MIT License: https://webrtc-experiment.appspot.com/licence/ */

window.PeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
window.SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
window.IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;

window.defaults = {
    iceServers: { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] },
    constraints: { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } },
    optional: { optional: [{ RtpDataChannels: true}] }
};

var RTCPeerConnection = function (options) {

    var iceServers = options.iceServers || defaults.iceServers;
    var constraints = options.constraints || defaults.constraints;
    var optional = options.optional || defaults.optional;

    var peerConnection = new PeerConnection(iceServers, optional);
    openDataChannel();

    peerConnection.onicecandidate = onicecandidate;

    if (options.attachStream) {
        peerConnection.onaddstream = onaddstream;
        peerConnection.addStream(options.attachStream);
    }

    function onicecandidate(event) {
        if (!event.candidate || !peerConnection) return;
        if (options.onICE) options.onICE(event.candidate);
    }

    function onaddstream(event) {
        event && options.onRemoteStream && options.onRemoteStream(event.stream);
    }

    function createOffer() {
        if (!options.onOfferSDP) return;

        peerConnection.createOffer(function (sessionDescription) {

            /* opus? use it dear! */
            options.isopus && (sessionDescription = codecs.opus(sessionDescription));

            peerConnection.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);

        }, null, constraints);
    }

    createOffer();

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        peerConnection.setRemoteDescription(new SessionDescription(options.offerSDP));
        peerConnection.createAnswer(function (sessionDescription) {

            /* opus? use it dear! */
            options.isopus && (sessionDescription = codecs.opus(sessionDescription));

            peerConnection.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);

        }, null, constraints);
    }

    createAnswer();

    var channel;
    function openDataChannel() {
		if (!options.onChannelMessage)return;
        if (!peerConnection || typeof peerConnection.createDataChannel == 'undefined') {
            if (options.onChannelMessage) {
                var error = 'RTCDataChannel is not enabled. Use Chrome Canary and enable this flag via chrome://flags';
                console.error(error);
            }
            return;
        }

        channel = peerConnection.createDataChannel(options.channel || 'RTCDataChannel', { reliable: false });

        channel.onmessage = function (event) {
            if (options.onChannelMessage) options.onChannelMessage(event);
        };

        channel.onopen = function (event) {
            console.log('RTCDataChannel opened.');
            if (options.onChannelOpened) options.onChannelOpened(event);
        };
        channel.onclose = function (event) {
            console.log('RTCDataChannel closed.');
            if (options.onChannelClosed) options.onChannelClosed(event);
        };
        channel.onerror = function (event) {
            console.error(event);
            if (options.onChannelError) options.onChannelError(event);
        };

        peerConnection.ondatachannel = function () {
            console.log('peerConnection.ondatachannel event fired.');
        };
    }

    return {
        /* offerer got answer sdp; MUST pass sdp over this function */
        addAnswerSDP: function (sdp) {
            peerConnection.setRemoteDescription(new SessionDescription(sdp));
        },

        /* got ICE from other end; MUST pass those candidates over this function */
        addICE: function (candidate) {
            peerConnection.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        },
        peer: peerConnection,
        channel: channel,
        sendData: function (message) {
            channel && channel.send(message);
        }
    };
};

var URL = window.webkitURL || window.URL;
navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

function getUserMedia(options) {
    navigator.getUserMedia(options.constraints || { audio: true, video: true },
        function (stream) {

            if (options.video)
                if (!navigator.mozGetUserMedia) options.video.src = URL.createObjectURL(stream);
                else options.video.mozSrcObject = stream;

            options.onsuccess && options.onsuccess(stream);

            return stream;
        }, options.onerror);
}