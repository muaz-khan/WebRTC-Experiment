/* MIT License: https://webrtc-experiment.appspot.com/licence/  */

var hangout = function (config) {
    var self = {
        userToken: uniqueToken(),
        userName: 'Anonymous'
    },
        channels = '--',
        isbroadcaster,
        isGetNewRoom = true,
        sockets = [],
        defaultSocket = {}, RTCDataChannels = [];

    function openDefaultSocket() {
        defaultSocket = config.openSocket({
                onmessage: onDefaultSocketResponse,
                callback: function (socket) {
                    defaultSocket = socket;
                }
            });
    }

    function onDefaultSocketResponse(response) {
        if (response.userToken == self.userToken) return;

        if (isGetNewRoom && response.roomToken && response.broadcaster) config.onRoomFound(response);

        if (response.newParticipant) onNewParticipant(response.newParticipant);

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
                sockets[sockets.length] = socket;
            }
        };

        socketConfig.callback = function (_socket) {
            socket = _socket;
            this.onopen();
        };

        var socket = config.openSocket(socketConfig),
            isofferer = _config.isofferer,
            gotstream,
            inner = {},
            peer;

        var peerConfig = {
            onICE: function (candidate) {
                socket.send({
                        userToken: self.userToken,
                        candidate: {
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            candidate: JSON.stringify(candidate.candidate)
                        }
                    });
            },
            onChannelOpened: onChannelOpened,
            onChannelMessage: function (event) {
                config.onChannelMessage(JSON.parse(event.data));
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

        function onChannelOpened(channel) {
            RTCDataChannels[RTCDataChannels.length] = channel;
            channel.send(JSON.stringify({
                        message: 'Hi, I\'m <strong>' + self.userName + '</strong>!',
                        sender: self.userName
                    }));

            if (config.onChannelOpened) config.onChannelOpened(channel);

            if (isbroadcaster && channels.split('--').length > 3) {
                /* broadcasting newly connected participant for video-conferencing! */
                defaultSocket.send({
                        newParticipant: socket.channel,
                        userToken: self.userToken
                    });
            }

            gotstream = true;
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

            inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);

            if (isofferer) peer.addAnswerSDP(inner.sdp);
            else initPeer(inner.sdp);
        }
    }

    function leave() {
        length = sockets.length;
        for (var i = 0; i < length; i++) {
            socket = sockets[i];
            if (socket) {
                socket.send({
                        left: true,
                        userToken: self.userToken
                    });
                delete sockets[i];
            }
        }
    }

    window.onunload = function () {
        leave();
    };

    window.onkeyup = function (e) {
        if (e.keyCode == 116) leave();
    };

    (function () {
            var anchors = document.querySelectorAll('a'),
                length = anchors.length;
            for (var i = 0; i < length; i++) {
                a = anchors[i];
                if (a.href.indexOf('#') !== 0 && a.getAttribute('target') != '_blank')
                    a.onclick = function () {
                        leave();
                };
            }
        })();

    function startBroadcasting() {
        defaultSocket && defaultSocket.send({
                roomToken: self.roomToken,
                roomName: self.roomName,
                broadcaster: self.userToken
            });
        setTimeout(startBroadcasting, 3000);
    }

    function onNewParticipant(channel) {
        if (!channel || channels.indexOf(channel) != -1 || channel == self.userToken) return;
        channels += channel + '--';

        var new_channel = uniqueToken();
        openSubSocket({
                channel: new_channel,
                closeSocket: true
            });

        defaultSocket.send({
                participant: true,
                userToken: self.userToken,
                joinUser: channel,
                channel: new_channel
            });
    }

    function uniqueToken() {
        var s4 = function () {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    openDefaultSocket();
    return {
        createRoom: function (_config) {
            self.roomName = _config.roomName || 'Anonymous';
            self.roomToken = uniqueToken();
            if (_config.userName) self.userName = _config.userName;

            isbroadcaster = true;
            isGetNewRoom = false;
            startBroadcasting();
        },
        joinRoom: function (_config) {
            self.roomToken = _config.roomToken;
            if (_config.userName) self.userName = _config.userName;
            isGetNewRoom = false;

            openSubSocket({
                    channel: self.userToken
                });

            defaultSocket.send({
                    participant: true,
                    userToken: self.userToken,
                    joinUser: _config.joinUser
                });
        },
        send: function (message) {
            console.log('list of data channels', RTCDataChannels);
            var length = RTCDataChannels.length,
                data = JSON.stringify({
                        message: message,
                        sender: self.userName
                    });
            if (!length) return;
            for (var i = 0; i < length; i++) {
                RTCDataChannels[i].send(data);
            }
        }
    };
};
