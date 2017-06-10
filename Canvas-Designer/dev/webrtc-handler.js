var webrtcHandler = {
    createOffer: function(callback) {
        var captureStream = document.getElementById('main-canvas').captureStream(15);

        var peer = this.getPeer();
        peer.addStream(captureStream);
        peer.onicecandidate = function(event) {
            if (!event || !!event.candidate) {
                return;
            }

            callback({
                sdp: peer.localDescription.sdp,
                type: peer.localDescription.type
            });
        };
        peer.createOffer(function(sdp) {
            peer.setLocalDescription(sdp);
        }, function() {}, {
            mandatory: {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false
            }
        });
    },
    setRemoteDescription: function(sdp) {
        this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
    },
    createAnswer: function(sdp, callback) {
        var peer = this.getPeer();
        this.setRemoteDescription(sdp);
        peer.onicecandidate = function(event) {
            if (!event || !!event.candidate) {
                return;
            }

            callback({
                sdp: peer.localDescription.sdp,
                type: peer.localDescription.type
            });
        };
        peer.createAnswer(function(sdp) {
            peer.setLocalDescription(sdp);
        }, function() {}, {
            mandatory: {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: true
            }
        });
        peer.onaddstream = function(event) {
            callback(event);
        };
    },
    getPeer: function() {
        var WebRTC_Native_Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
        var peer = new WebRTC_Native_Peer(null);
        this.peer = peer;
        return peer;
    }
};
