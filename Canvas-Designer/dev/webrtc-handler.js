var webrtcHandler = {
    createOffer: function(callback) {
        var captureStream = document.getElementById('main-canvas').captureStream();
        var peer = this.getPeer();

        captureStream.getTracks().forEach(function(track) {
            peer.addTrack(track, captureStream);
        });

        peer.onicecandidate = function(event) {
            if (!event || !!event.candidate) {
                return;
            }

            callback({
                sdp: peer.localDescription.sdp,
                type: peer.localDescription.type
            });
        };
        peer.createOffer({
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }).then(function(sdp) {
            peer.setLocalDescription(sdp);
        });
    },
    setRemoteDescription: function(sdp) {
        this.peer.setRemoteDescription(new RTCSessionDescription(sdp)).then(function() {
            if (typeof setTemporaryLine === 'function') {
                setTemporaryLine();
            }
        });
    },
    createAnswer: function(sdp, callback) {
        var peer = this.getPeer();
        peer.onicecandidate = function(event) {
            if (!event || !!event.candidate) {
                return;
            }

            callback({
                sdp: peer.localDescription.sdp,
                type: peer.localDescription.type
            });
        };
        this.peer.setRemoteDescription(new RTCSessionDescription(sdp)).then(function() {
            peer.createAnswer({
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: true
            }).then(function(sdp) {
                peer.setLocalDescription(sdp);
            });
        });

        peer.ontrack = function(event) {
            callback({
                stream: event.streams[0]
            });
        };
    },
    getPeer: function() {
        var WebRTC_Native_Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
        var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
        var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

        var peer = new WebRTC_Native_Peer(null);
        this.peer = peer;
        return peer;
    }
};
