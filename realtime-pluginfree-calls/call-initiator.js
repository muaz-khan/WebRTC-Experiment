/* MIT License: https://webrtc-experiment.appspot.com/licence/ */

var CallInitiator = function (config) {
    var self = {
        userToken: uniqueToken()
    },
        channels = '--',
        isbroadcaster,
        isGetNewRoom = true,
        publicSocket = {};

    function openPublicSocket() {
        publicSocket = config.openSocket({
                onmessage: onPublicSocketResponse,
                callback: function (socket) {
                    publicSocket = socket;
                }
            });
    }

    function onPublicSocketResponse(response) {
        if (response.userToken == self.userToken) return;

        if (isGetNewRoom && response.roomToken && response.broadcaster) config.onRoomFound(response);

        if (response.userToken && response.joinUser == self.userToken && response.participant && channels.indexOf(response.userToken) == -1) {
            channels += response.userToken + '--';
            openSubSocket({
                    isofferer: true,
                    channel: response.channel || response.userToken,
                    closeSocket: true
                });
        }
    }

    function openSubSocket(_config) {
        if (!_config.channel) return;
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse,
            onopen: function () {
                if (isofferer && !peer) initPeer();
            }
        };

        socketConfig.callback = function (_socket) {
            socket = _socket;
            this.onopen();
        };

        var socket = config.openSocket(socketConfig),
            isofferer = _config.isofferer,
            gotstream,
            audio = document.createElement('audio'),
            inner = {},
            peer;

        var peerConfig = {
            attachStream: config.attachStream,
            onICE: function (candidate) {
                socket.send({
                        userToken: self.userToken,
                        candidate: {
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            candidate: JSON.stringify(candidate.candidate)
                        }
                    });
            },
            onRemoteStream: function (stream) {
                if (!stream) return;

                audio[moz ? 'mozSrcObject' : 'src'] = moz ? stream : webkitURL.createObjectURL(stream);
                audio.play();

                _config.stream = stream;
                onRemoteStreamStartsFlowing();
            }
        };

        function initPeer(offerSDP) {
            if (!offerSDP) {
                peerConfig.onOfferSDP = sendsdp;
            } else {
                peerConfig.offerSDP = offerSDP;
                peerConfig.onAnswerSDP = sendsdp;
            }
            /* OfferToReceiveVideo MUST be false for audio-only streaming */
            peerConfig.constraints = {
                optional: [],
                mandatory: {
                    OfferToReceiveAudio: true,
                    OfferToReceiveVideo: false
                }
            };

            peer = RTCPeerConnection(peerConfig);
        }

        function onRemoteStreamStartsFlowing() {
            audio.addEventListener('play', function () {
                    setTimeout(function () {
                            audio.muted = false;
                            audio.volume = 1;

                            window.audio = audio;

                            gotstream = true;
                            self.stopBroadcasting = true;

                            config.onRemoteStream({
                                    audio: audio,
                                    stream: _config.stream
                                });
                        }, 3000);
                }, false);
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
                inner.sdp = response.sdp;
                selfInvoker();
            }

            if (response.candidate && !gotstream) {
                peer && peer.addICE({
                        sdpMLineIndex: response.candidate.sdpMLineIndex,
                        candidate: JSON.parse(response.candidate.candidate)
                    });
            }
        }

        var invokedOnce = false;

        function selfInvoker() {
            if (invokedOnce) return;

            invokedOnce = true;

            inner.sdp = JSON.parse(inner.sdp);
            if (isofferer) peer.addAnswerSDP(inner.sdp);
            else initPeer(inner.sdp);
        }
    }

    function startBroadcasting() {
        publicSocket && publicSocket.send({
                roomToken: self.roomToken,
                roomName: self.roomName,
                broadcaster: self.userToken
            });
        !self.stopBroadcasting && setTimeout(startBroadcasting, 3000);
    }

    function uniqueToken() {
        var s4 = function () {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    openPublicSocket();
    return {
        createRoom: function (_config) {
            self.roomName = _config.roomName || 'Anonymous';
            self.roomToken = uniqueToken();

            isbroadcaster = true;
            isGetNewRoom = false;
            startBroadcasting();
        },
        joinRoom: function (_config) {
            self.roomToken = _config.roomToken;
            isGetNewRoom = false;

            openSubSocket({
                    channel: self.userToken
                });

            publicSocket.send({
                    participant: true,
                    userToken: self.userToken,
                    joinUser: _config.joinUser
                });
        }
    };
};
