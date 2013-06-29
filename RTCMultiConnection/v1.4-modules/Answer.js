// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

// var answer = Answer.createAnswer({stream, session, onicecandidate, onsdp, onstream});
// answer.setRemoteDescription(sdp);
// answer.addIceCandidate(candidate);

var Answer = {
    createAnswer: function(config) {
        var renegotiating = !!this.peer;

        // if not renegotiating
        if (!renegotiating)
            var peer = new RTCPeerConnection(iceServers, optionalArgument), channel;

            // if renegotiating
        else
            var peer = this.peer;

        var session = config.session;

        if (isChrome && session.data) {
            DataChannel.createDataChannel(peer, config);
        } else if (isFirefox && session.data) {
            peer.ondatachannel = function(event) {
                channel = event.channel;
                channel.binaryType = 'blob';
                DataChannel.setChannelEvents(channel, config);
            };

            navigator.mozGetUserMedia({
                    audio: true,
                    fake: true
                }, function(stream) {

                    peer.addStream(stream);
                    peer.setRemoteDescription(new RTCSessionDescription(config.sdp));
                    peer.createAnswer(function(sdp) {
                        peer.setLocalDescription(sdp);
                        if (config.onsdp)
                            config.onsdp({
                                sdp: sdp,
                                userid: config.to,
                                extra: config.extra
                            });
                    }, null, offerAnswerConstraints);
                }, mediaError);
        }

        if (config.stream)
            peer.addStream(config.stream);

        peer.onaddstream = function(event) {
            config.onstream({
                stream: event.stream,
                userid: config.to,
                extra: config.extra
            });
        };

        peer.onicecandidate = function(event) {
            if (!renegotiating)
                config.onicecandidate({
                    candidate: event.candidate,
                    userid: config.to,
                    extra: config.extra
                });
        };

        if (isChrome || !session.data) {
            peer.setRemoteDescription(new RTCSessionDescription(config.sdp));
            peer.createAnswer(function(sdp) {
                sdp = serializeSdp(sdp, config);

                peer.setLocalDescription(sdp);

                config.onsdp({
                    sdp: sdp,
                    userid: config.to,
                    extra: config.extra
                });
            }, null, offerAnswerConstraints);
        }

        this.peer = peer;

        return this;
    },
    addIceCandidate: function(candidate) {
        this.peer.addIceCandidate(new RTCIceCandidate({
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate: candidate.candidate
        }));
    }
};
