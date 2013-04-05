/* MIT License: https://webrtc-experiment.appspot.com/licence/ */

(function() {
    var broadcast = function(config) {
        var self = { userToken: uniqueToken() },
            channels = '--',
            defaultSocket = {};

        function openDefaultSocket() {
            defaultSocket = config.openSocket({ onmessage: onDefaultSocketResponse });
        }

        function onDefaultSocketResponse(response) {
            if (response.userToken == self.userToken) return;

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
                onopen: function() {
                    if (isofferer && !peer) initPeer();
                }
            };

            var socket = config.openSocket(socketConfig),
                isofferer = _config.isofferer,
                gotstream,
                video = document.createElement('video'),
                inner = {},
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

                    video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
                    video.play();

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

                peer = RTCPeerConnection(peerConfig);
            }

            function onRemoteStreamStartsFlowing() {
                if (!(video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || video.paused || video.currentTime <= 0)) {
                    gotstream = true;

                    config.onRemoteStream({
                        video: video,
                        stream: _config.stream
                    });
                } else setTimeout(onRemoteStreamStartsFlowing, 50);
            }

            function sendsdp(sdp) {
                sdp = JSON.stringify(sdp);
                var part = parseInt(sdp.length / 3);

                var firstPart = sdp.slice(0, part),
                    secondPart = sdp.slice(part, sdp.length - 1),
                    thirdPart = '';

                if (sdp.length > part + part) {
                    secondPart = sdp.slice(part, part + part);
                    thirdPart = sdp.slice(part + part, sdp.length);
                }

                socket.send({
                    userToken: self.userToken,
                    firstPart: firstPart
                });

                socket.send({
                    userToken: self.userToken,
                    secondPart: secondPart
                });

                socket.send({
                    userToken: self.userToken,
                    thirdPart: thirdPart
                });
            }

            function socketResponse(response) {
                if (response.userToken == self.userToken) return;
                if (response.firstPart || response.secondPart || response.thirdPart) {
                    if (response.firstPart) {
                        inner.firstPart = response.firstPart;
                        if (inner.secondPart && inner.thirdPart) selfInvoker();
                    }
                    if (response.secondPart) {
                        inner.secondPart = response.secondPart;
                        if (inner.firstPart && inner.thirdPart) selfInvoker();
                    }

                    if (response.thirdPart) {
                        inner.thirdPart = response.thirdPart;
                        if (inner.firstPart && inner.secondPart) selfInvoker();
                    }
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

                inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);
                if (isofferer) peer.addAnswerSDP(inner.sdp);
                else initPeer(inner.sdp);
            }
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

                (function startTransmitting() {
                    defaultSocket.send({
                        roomToken: self.roomToken,
                        roomName: self.roomName,
                        broadcaster: self.userToken
                    });
                    setTimeout(startTransmitting, 3000);
                })();
            }
        };
    };

    var configuration = {
        openSocket: function(config) {
            var socket = io.connect('https://pubsub.pubnub.com/webrtc-rtcweb', {
                publish_key: 'pub-f986077a-73bd-4c28-8e50-2e44076a84e0',
                subscribe_key: 'sub-b8f4c07a-352e-11e2-bb9d-c7df1d04ae4a',
                channel: config.channel || 'webrtc-tab-sharing',
                ssl: true
            });
            config.onopen && socket.on('connect', config.onopen);
            config.onmessage && socket.on('message', config.onmessage);
            return socket;
        }
    };

    function startBroadcasting(stream) {
        configuration.attachStream = stream;
        broadcastUI.createRoom({
            roomName: prompt('Enter human readable room name') || 'Anonymous'
        });
    }

    window.startBroadcasting = startBroadcasting;
    var broadcastUI = broadcast(configuration);
})();