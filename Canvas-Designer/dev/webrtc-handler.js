var webrtcHandler = {
    createOffer: function(callback) {
        var captureStream = document.getElementById('main-canvas').captureStream(15);

        var peer = this.getPeer();
        if ('addStream' in peer) {
            peer.addStream(captureStream);
        } else {
            peer.addTrack(captureStream.getVideoTracks()[0], captureStream);
        }

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
        this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
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

        if ('onaddstream' in peer) {
            peer.onaddstream = function(event) {
                callback({
                    stream: event.stream
                });
            };
        } else {
            peer.onaddtrack = function(event) {
                callback({
                    stream: event.streams[0]
                });
            };
        }
    },
    getPeer: function() {
        var WebRTC_Native_Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
        var peer = new WebRTC_Native_Peer(null);
        this.peer = peer;
        return peer;
    }
};
