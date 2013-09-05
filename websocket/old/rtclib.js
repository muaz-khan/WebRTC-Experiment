// 2013, @muazkh » github.com/muaz-khan
// MIT License » https://webrtc-experiment.appspot.com/licence/
// Documentation » https://github.com/muaz-khan/WebRTC-Experiment/tree/master/video-conferencing

var RTCLib = function(config) {
    var self = {
        userToken: uniqueToken()
    };

    var isbroadcaster,
        isGetNewRoom = true,
        sockets = [],
        isGotRemoteStream = false,
        defaultSocket = { };

    function openDefaultSocket() {
        defaultSocket = config.openSocket({
            onmessage: onDefaultSocketResponse,
            callback: function(socket) {
                defaultSocket = socket;
            }
        });
    }

    function onDefaultSocketResponse(response) {
        if (response.userToken == self.userToken) return;

        if (isGetNewRoom && response.roomToken && response.broadcaster) config.onRoomFound(response);

        if (response.newParticipant) onNewParticipant(response.newParticipant);

        if (response.userToken && response.joinUser == self.userToken && response.participant) {
            openSubSocket({
                isofferer: true,
                channel: response.channel || response.userToken
            });
        }
    }

    function openSubSocket(_config) {
        if (!_config.channel) return;
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse,
            onopen: function() {
                if (isofferer && !peer) initPeer();
                sockets[sockets.length] = socket;
            }
        };

        socketConfig.callback = function(_socket) {
            socket = _socket;
            this.onopen();
        };

        var socket = config.openSocket(socketConfig),
            isofferer = _config.isofferer,
            video = document.createElement('video'),
            inner = { },
            peer;

        var peerConfig = {
            attachStream: config.attachStream,
            onICE: function(candidate) {
                socket.send({
                    userToken: self.userToken,
                    candidate: {
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        candidate: JSON.stringify(candidate.candidate)
                    }
                });
            },
            onRemoteStream: function(stream) {
                if (!stream) return;

                video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : webkitURL.createObjectURL(stream);
                video.play();

                _config.stream = stream;
                onRemoteStreamStartsFlowing();
            },
            onRemoteStreamEnded: function(stream) {
                if (config.onRemoteStreamEnded)
                    config.onRemoteStreamEnded(stream);

                isGotRemoteStream = false;
            }
        };

        function initPeer(offerSDP) {
            if (!offerSDP) {
                peerConfig.onOfferSDP = sendsdp;
            } else {
                peerConfig.offerSDP = offerSDP;
                peerConfig.onAnswerSDP = sendsdp;
            }

            peer = RTCPeerConnection(peerConfig);
        }

        function onRemoteStreamStartsFlowing() {
            if (!(video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || video.paused || video.currentTime <= 0)) {
                isGotRemoteStream = true;

                if (config.onRemoteStream)
                    config.onRemoteStream({
                        video: video,
                        stream: _config.stream
                    });
            } else setTimeout(onRemoteStreamStartsFlowing, 50);
        }

        function sendsdp(sdp) {
            socket.send({
                userToken: self.userToken,
                sdp: JSON.stringify(sdp)
            });
        }

        function socketResponse(response) {
            if (response.userToken == self.userToken) return;
            if (response.sdp) {
                inner.sdp = JSON.parse(response.sdp);
                selfInvoker();
            }

            if (response.candidate && !isGotRemoteStream) {
                if (!peer) console.error('missed an ice', response.candidate);
                else
                    peer.addICE({
                        sdpMLineIndex: response.candidate.sdpMLineIndex,
                        candidate: JSON.parse(response.candidate.candidate)
                    });
            }

            if (response.left) {
                if (peer && peer.peer) {
                    peer.peer.close();
                    peer.peer = null;
                }
            }
        }

        var invokedOnce = false;

        function selfInvoker() {
            if (invokedOnce) return;

            invokedOnce = true;

            if (isofferer) peer.addAnswerSDP(inner.sdp);
            else initPeer(inner.sdp);
        }
    }

    function leave() {
        var length = sockets.length;
        for (var i = 0; i < length; i++) {
            var socket = sockets[i];
            if (socket) {
                socket.send({
                    left: true,
                    userToken: self.userToken
                });
                delete sockets[i];
            }
        }
    }

    window.onbeforeunload = function() {
        leave();
    };

    window.onkeyup = function(e) {
        if (e.keyCode == 116) leave();
    };

    function startBroadcasting() {
        if (!isGotRemoteStream && defaultSocket) {
            defaultSocket.send({
                roomToken: self.roomToken,
                roomName: self.roomName,
                broadcaster: self.userToken
            });
        }
        setTimeout(startBroadcasting, 3000);
    }

    function uniqueToken() {
        var s4 = function() {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    openDefaultSocket();
    return {
        createRoom: function(_config) {
            self.roomName = _config.roomName || 'Anonymous';
            self.roomToken = uniqueToken();

            isbroadcaster = true;
            isGetNewRoom = false;
            startBroadcasting();
        },
        joinRoom: function(_config) {
            self.roomToken = _config.roomToken;
            isGetNewRoom = false;

            openSubSocket({
                channel: self.userToken
            });

            defaultSocket.send({
                participant: true,
                userToken: self.userToken,
                joinUser: _config.joinUser
            });
        }
    };
};
