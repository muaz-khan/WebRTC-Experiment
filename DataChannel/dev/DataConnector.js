function DataConnector(root, config) {
    var self = {};
    var that = this;

    self.userToken = (root.userid = root.userid || uniqueToken()).toString();
    self.sockets = [];
    self.socketObjects = {};

    var channels = '--';
    var isbroadcaster = false;
    var isGetNewRoom = true;
    var rtcDataChannels = [];

    function newPrivateSocket(_config) {
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse,
            onopen: function() {
                if (isofferer && !peer) {
                    initPeer();
                }

                _config.socketIndex = socket.index = self.sockets.length;
                self.socketObjects[socketConfig.channel] = socket;
                self.sockets[_config.socketIndex] = socket;
            }
        };

        socketConfig.callback = function(_socket) {
            socket = _socket;
            socketConfig.onopen();
        };

        var socket = root.openSignalingChannel(socketConfig);
        var isofferer = _config.isofferer;
        var gotstream;
        var inner = {};
        var peer;

        var peerConfig = {
            onICE: function(candidate) {
                if (!socket) {
                    return setTimeout(function() {
                        peerConfig.onICE(candidate);
                    }, 2000);
                }

                socket.send({
                    userToken: self.userToken,
                    candidate: {
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        candidate: JSON.stringify(candidate.candidate)
                    }
                });
            },
            onopen: onChannelOpened,
            onmessage: function(event) {
                config.onmessage(event.data, _config.userid);
            },
            onclose: config.onclose,
            onerror: root.onerror,
            preferSCTP: root.preferSCTP
        };

        function initPeer(offerSDP) {
            if (root.direction === 'one-to-one' && window.isFirstConnectionOpened) {
                return;
            }

            if (!offerSDP) {
                peerConfig.onOfferSDP = sendsdp;
            } else {
                peerConfig.offerSDP = offerSDP;
                peerConfig.onAnswerSDP = sendsdp;
            }

            peer = new RTCPeerConnection(peerConfig);
        }

        function onChannelOpened(channel) {
            channel.peer = peer.peer;
            rtcDataChannels.push(channel);

            config.onopen(_config.userid, channel);

            if (root.direction === 'many-to-many' && isbroadcaster && channels.split('--').length > 3 && defaultSocket) {
                defaultSocket.send({
                    newParticipant: socket.channel,
                    userToken: self.userToken
                });
            }

            window.isFirstConnectionOpened = gotstream = true;
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
            if (response.userToken === self.userToken) {
                return;
            }

            if (response.firstPart || response.secondPart || response.thirdPart) {
                if (response.firstPart) {
                    // sdp sender's user id passed over "onopen" method
                    _config.userid = response.userToken;

                    inner.firstPart = response.firstPart;
                    if (inner.secondPart && inner.thirdPart) {
                        selfInvoker();
                    }
                }
                if (response.secondPart) {
                    inner.secondPart = response.secondPart;
                    if (inner.firstPart && inner.thirdPart) {
                        selfInvoker();
                    }
                }

                if (response.thirdPart) {
                    inner.thirdPart = response.thirdPart;
                    if (inner.firstPart && inner.secondPart) {
                        selfInvoker();
                    }
                }
            }

            if (response.candidate && !gotstream && peer) {
                if (!inner.firstPart || !inner.secondPart || !inner.thirdPart) {
                    return setTimeout(function() {
                        socketResponse(response);
                    }, 400);
                }

                peer.addICE({
                    sdpMLineIndex: response.candidate.sdpMLineIndex,
                    candidate: JSON.parse(response.candidate.candidate)
                });

                console.debug('ice candidate', response.candidate.candidate);
            }

            if (response.left) {
                if (peer && peer.peer) {
                    peer.peer.close();
                    peer.peer = null;
                }

                if (response.closeEntireSession) {
                    leaveChannels();
                } else if (socket) {
                    socket.send({
                        left: true,
                        userToken: self.userToken
                    });
                    socket = null;
                }

                root.onleave(response.userToken);
            }

            if (response.playRoleOfBroadcaster) {
                setTimeout(function() {
                    self.roomToken = response.roomToken;
                    root.open(self.roomToken);
                    self.sockets = swap(self.sockets);
                }, 600);
            }
        }

        var invokedOnce = false;

        function selfInvoker() {
            if (invokedOnce) {
                return;
            }

            invokedOnce = true;
            inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);

            if (isofferer) {
                peer.addAnswerSDP(inner.sdp);
            } else {
                initPeer(inner.sdp);
            }

            console.debug('sdp', inner.sdp.sdp);
        }
    }

    function onNewParticipant(channel) {
        if (!channel || channels.indexOf(channel) !== -1 || channel === self.userToken) {
            return;
        }

        channels += channel + '--';

        var newChannel = uniqueToken();

        newPrivateSocket({
            channel: newChannel,
            closeSocket: true
        });

        if (!defaultSocket) {
            return;
        }

        defaultSocket.send({
            participant: true,
            userToken: self.userToken,
            joinUser: channel,
            channel: newChannel
        });
    }

    function uniqueToken() {
        return (Math.round(Math.random() * 60535) + 5000000).toString();
    }

    function leaveChannels(channel) {
        var alert = {
            left: true,
            userToken: self.userToken
        };

        var socket;

        // if room initiator is leaving the room; close the entire session
        if (isbroadcaster) {
            if (root.autoCloseEntireSession) {
                alert.closeEntireSession = true;
            } else {
                self.sockets[0].send({
                    playRoleOfBroadcaster: true,
                    userToken: self.userToken,
                    roomToken: self.roomToken
                });
            }
        }

        if (!channel) {
            // closing all sockets
            var sockets = self.sockets,
                length = sockets.length;

            for (var i = 0; i < length; i++) {
                socket = sockets[i];
                if (socket) {
                    socket.send(alert);

                    if (self.socketObjects[socket.channel]) {
                        delete self.socketObjects[socket.channel];
                    }

                    delete sockets[i];
                }
            }

            that.left = true;
        }

        // eject a specific user!
        if (channel) {
            socket = self.socketObjects[channel];
            if (socket) {
                socket.send(alert);

                if (self.sockets[socket.index]) {
                    delete self.sockets[socket.index];
                }

                delete self.socketObjects[channel];
            }
        }
        self.sockets = swap(self.sockets);
    }

    window.addEventListener('beforeunload', function() {
        leaveChannels();
    }, false);

    window.addEventListener('keydown', function(e) {
        if (e.keyCode === 116) {
            leaveChannels();
        }
    }, false);

    var defaultSocket = root.openSignalingChannel({
        onmessage: function(response) {
            if (response.userToken === self.userToken) {
                return;
            }

            if (isGetNewRoom && response.roomToken && response.broadcaster) {
                config.ondatachannel(response);
            }

            if (response.newParticipant) {
                onNewParticipant(response.newParticipant);
            }

            if (response.userToken && response.joinUser === self.userToken && response.participant && channels.indexOf(response.userToken) === -1) {
                channels += response.userToken + '--';

                console.debug('Data connection is being opened between you and', response.userToken || response.channel);
                newPrivateSocket({
                    isofferer: true,
                    channel: response.channel || response.userToken,
                    closeSocket: true
                });
            }
        },
        callback: function(socket) {
            defaultSocket = socket;
        }
    });

    return {
        createRoom: function(roomToken) {
            self.roomToken = (roomToken || uniqueToken()).toString();

            isbroadcaster = true;
            isGetNewRoom = false;

            (function transmit() {
                if (defaultSocket) {
                    defaultSocket.send({
                        roomToken: self.roomToken,
                        broadcaster: self.userToken
                    });
                }

                if (!root.transmitRoomOnce && !that.leaving) {
                    if (root.direction === 'one-to-one') {
                        if (!window.isFirstConnectionOpened) {
                            setTimeout(transmit, 3000);
                        }
                    } else {
                        setTimeout(transmit, 3000);
                    }
                }
            })();
        },
        joinRoom: function(_config) {
            self.roomToken = _config.roomToken;
            isGetNewRoom = false;

            newPrivateSocket({
                channel: self.userToken
            });

            defaultSocket.send({
                participant: true,
                userToken: self.userToken,
                joinUser: _config.joinUser
            });
        },
        send: function(message, _channel) {
            var _channels = rtcDataChannels;
            var data;
            var length = _channels.length;

            if (!length) {
                return;
            }

            data = JSON.stringify(message);

            if (_channel) {
                if (_channel.readyState === 'open') {
                    _channel.send(data);
                }
                return;
            }
            for (var i = 0; i < length; i++) {
                if (_channels[i].readyState === 'open') {
                    _channels[i].send(data);
                }
            }
        },
        leave: function(userid, autoCloseEntireSession) {
            if (autoCloseEntireSession) {
                root.autoCloseEntireSession = true;
            }
            leaveChannels(userid);
            if (!userid) {
                self.joinedARoom = isbroadcaster = false;
                isGetNewRoom = true;
            }
        }
    };
}
