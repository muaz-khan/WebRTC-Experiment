function webrtcHandler() {
    return {
        createOffer: function(stream, callback) {
            var peer = this.getPeer();

            if(stream) {
                if ('addStream' in peer) {
                    peer.addStream(stream);
                } else {
                    peer.addTrack(stream.getVideoTracks()[0], stream);
                }
            }

            peer.onicecandidate = function(event) {
                if (!event || event.candidate) {
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
            }).catch(function(error) {
                console.error('createOffer', error);
            });
        },
        setRemoteDescription: function(sdp) {
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp)).catch(function(error) {
                console.error('setRemoteDescription', error);
            });
        },
        createAnswer: function(sdp, callback) {
            var peer = this.getPeer();

            peer.onicecandidate = function(event) {
                if (!event || event.candidate) {
                    return;
                }

                callback({
                    sdp: peer.localDescription.sdp,
                    type: peer.localDescription.type
                });
            };
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp)).then(function() {
                peer.createAnswer({
                    OfferToReceiveAudio: true,
                    OfferToReceiveVideo: true
                }).then(function(sdp) {
                    peer.setLocalDescription(sdp);
                }).catch(function(error) {
                    console.error('createAnswer', error);
                });
            }).catch(function(error) {
                console.error('setRemoteDescription', error);
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
        getParams: function() {
            return params = {
                iceServers: [], // IceServersHandler.getIceServers()
                iceTransportPolicy: 'all',
                bundlePolicy: 'max-bundle',
                iceTransportPolicy: 0,
                rtcpMuxPolicy: 'require' // or negotiate
            };
        },
        getPeer: function() {
            var WebRTC_Native_Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
            var peer = new WebRTC_Native_Peer(null);
            this.peer = peer;
            return peer;
        }
    };
}
