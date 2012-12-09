var CreateRTCPeerConnection = function (options) {

    window.RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
    window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
    window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;

    window.URL = window.webkitURL || window.URL;
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;


    var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302"}] };

    this.peerConnection = new PeerConnection(options.config || config);

    this.peerConnection.onicecandidate = onicecandidate;
    this.peerConnection.onaddstream = onaddstream;
    this.peerConnection.addStream(options.stream);

    function onicecandidate(event) {

        if (!event.candidate || !CreateRTCPeerConnection.peerConnection) return;

        if (options.onicecandidate) options.onicecandidate(event.candidate);
    }

    function onaddstream(event, recheck) {
        if (event && options.remoteVideo) options.remoteVideo.src = URL.createObjectURL(event.stream);

        if (!event && recheck && options.onaddstream) {
            if (!(options.remoteVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || options.remoteVideo.paused || options.remoteVideo.currentTime <= 0)) {
                options.onaddstream();
            } else setTimeout(onaddstream, 500);
        }
    }

    function createOffer() {
        if (!options.createOffer) return;

        CreateRTCPeerConnection.peerConnection.createOffer(function (sessionDescription) {

            CreateRTCPeerConnection.peerConnection.setLocalDescription(sessionDescription);
            options.createOffer(sessionDescription);

        }, null, { audio: true, video: true });
    }

    createOffer();

    function createAnswer() {
        if (!options.createAnswer) return;

        CreateRTCPeerConnection.peerConnection.setRemoteDescription(new SessionDescription(options.offer));
        CreateRTCPeerConnection.peerConnection.createAnswer(function (sessionDescription) {

            CreateRTCPeerConnection.peerConnection.setLocalDescription(sessionDescription);
            options.createAnswer(sessionDescription);

        }, null, { audio: true, video: true });
    }

    createAnswer();

    return this;
};

CreateRTCPeerConnection.prototype.peerConnection = null;

CreateRTCPeerConnection.prototype.onanswer = function (sdp) {
    this.peerConnection.setRemoteDescription(new SessionDescription(sdp));
};

CreateRTCPeerConnection.prototype.addICE = function (candidate) {

    this.peerConnection.addIceCandidate(new IceCandidate({
        sdpMLineIndex: candidate.sdpMLineIndex,
        candidate: candidate.candidate
    }));

};

var connection = CreateRTCPeerConnection({
    createOffer: function (sdp) {
        console.log('created offer');
    },
    onicecandidate: function (candidate) {
        console.log('ICE candidate is ready for other peer!');
    },
    onaddstream: function () {
        console.log('Got remote stream successfully!');
    }
});

connection.addICE({
    sdpMLineIndex: 1,
    candidate: candidate
});

connection.onanswer(sdp);