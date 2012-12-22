var RTCPeerConnection = function (options) {
    var PeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
    var SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
    var IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;

    var iceServers = { "iceServers": [{ "url": "stun:stun.l.google.com:19302"}] };
    var constraints = { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true} };

    var peerConnection = new PeerConnection(options.iceServers || iceServers);

    peerConnection.onicecandidate = onicecandidate;
    peerConnection.onaddstream = onaddstream;
    peerConnection.addStream(options.stream);

    function onicecandidate(event) {
        if (!event.candidate || !peerConnection) return;
        if (options.getice) options.getice(event.candidate);
    }

    function onaddstream(event) {
        options.gotstream && options.gotstream(event);
    }

    function createOffer() {
        if (!options.onoffer) return;

        peerConnection.createOffer(function (sessionDescription) {
            
            /* opus? use it dear! */
            codecs && (sessionDescription.sdp = codecs.opus(sessionDescription.sdp));
            
            peerConnection.setLocalDescription(sessionDescription);
            options.onoffer(sessionDescription);

        }, null, constraints);
    }

    createOffer();

    function createAnswer() {
        if (!options.onanswer) return;

        peerConnection.setRemoteDescription(new SessionDescription(options.offer));
        peerConnection.createAnswer(function (sessionDescription) {

            /* opus? use it dear! */
            codecs && (sessionDescription.sdp = codecs.opus(sessionDescription.sdp));
            
            peerConnection.setLocalDescription(sessionDescription);
            options.onanswer(sessionDescription);

        }, null, constraints);
    }

    createAnswer();

    return {
        onanswer: function (sdp) {
            peerConnection.setRemoteDescription(new SessionDescription(sdp));
        },
        addice: function (candidate) {
            peerConnection.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };
};

function getUserMedia(options) {
    var URL = window.webkitURL || window.URL;
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

    navigator.getUserMedia(options.constraints || { audio: true, video: true },
        function (stream) {

            if (!navigator.mozGetUserMedia) options.video.src = URL.createObjectURL(stream);
            else options.video.mozSrcObject = stream;

            options.onsuccess && options.onsuccess(stream);

            return stream;
        }, options.onerror);
}