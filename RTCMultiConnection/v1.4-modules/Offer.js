// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

// var offer = Offer.createOffer({stream, session, onicecandidate, onsdp, onstream});
// offer.setRemoteDescription(sdp);
// offer.addIceCandidate(candidate);

var Offer = {
    createOffer: function(config) {
        var renegotiating = !!this.peer;

        // if not renegotiating
        if (!renegotiating)
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            // if renegotiating
        else
            var peer = this.peer;

        var session = config.session;

        if (session.data)
            DataChannel.createDataChannel(peer, config);

        function sdpCallback() {
            config.onsdp({
                sdp: peer.localDescription,
                userid: config.to,
                extra: config.extra
            });
        }

        if (config.stream)
            peer.addStream(config.stream);

        peer.onaddstream = function(event) {
            config.onstream({
                stream: event.stream,
                userid: config.to,
                extra: config.extra,

                // used to make sure we're not forwaring
                // details of renegotiated streams
                renegotiated: !!config.renegotiated
            });
        };

        peer.onicecandidate = function(event) {
            if (!event.candidate && !renegotiating) sdpCallback();
        };

        peer.ongatheringchange = function(event) {
            if (event.currentTarget && event.currentTarget.iceGatheringState === 'complete')
                sdpCallback();
        };

        if (isChrome || !session.data) {

            peer.createOffer(function(sdp) {
                sdp = serializeSdp(sdp, config);
                peer.setLocalDescription(sdp);
                if (renegotiating) sdpCallback();
            }, null, offerAnswerConstraints);

        } else if (isFirefox && session.data) {
            navigator.mozGetUserMedia({
                    audio: true,
                    fake: true
                }, function(stream) {
                    peer.addStream(stream);
                    peer.createOffer(function(sdp) {
                        peer.setLocalDescription(sdp);
                        config.onsdp({
                            sdp: sdp,
                            userid: config.to,
                            extra: config.extra,

                            // used to make sure we're not forwaring
                            // details of renegotiated streams
                            renegotiated: !!config.renegotiated
                        });
                    }, null, offerAnswerConstraints);

                }, mediaError);
        }

        this.peer = peer;

        return this;
    },
    setRemoteDescription: function(sdp) {
        this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
    },
    addIceCandidate: function(candidate) {
        this.peer.addIceCandidate(new RTCIceCandidate({
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate: candidate.candidate
        }));
    },
    renegotiate: function(config) {
        config.renegotiated = true;
        this.createOffer(config);
    }
};
