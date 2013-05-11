/*
 2013, @muazkh » github.com/muaz-khan
 MIT License » https://webrtc-experiment.appspot.com/licence/
 Documentation » https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel
*/

(function () {
    window.DataChannel = function (channel, extras) {
        if (channel) this.automatic = true;
        this.channel = channel;

        extras = extras || {};

        var self = this, dataConnector, fileReceiver, textReceiver;

        this.onmessage = function (message, userid) {
            console.debug(userid, 'sent message:', message);
        };

        this.channels = {};
        this.onopen = function (userid) {
            console.debug(userid, 'is connected with you.');
        };

        this.onclose = function (event) {
            console.error('data channel closed:', event);
        };

        this.onerror = function (event) {
            console.error('data channel error:', event);
        };

        this.onFileReceived = function (fileName) {
            console.debug('File <', fileName, '> received successfully.');
        };

        this.onFileSent = function (file) {
            console.debug('File <', file.name, '> sent successfully.');
        };

        this.onFileProgress = function (packets) {
            console.debug('<', packets.remaining, '> items remaining.');
        };

        function prepareInit(callback) {
            for (var extra in extras) {
                self[extra] = extras[extra];
            }
            self.direction = self.direction || 'many-to-many';
            if(self.userid) window.userid = self.userid;

            if (!self.openSignalingChannel) {
                if (typeof self.transmitRoomOnce == 'undefined') self.transmitRoomOnce = true;

                // socket.io over node.js: https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs
                self.openSignalingChannel = function (config) {
                    config = config || {};

                    channel = config.channel || self.channel || 'default-channel';
                    var socket = new window.Firebase('https://' + (self.firebase || 'chat') + '.firebaseIO.com/' + channel);
                    socket.channel = channel;

                    socket.on('child_added', function (data) {
                        config.onmessage(data.val());
                    });

                    socket.send = function (data) {
                        this.push(data);
                    };

                    if (!self.socket) self.socket = socket;
                    if (channel != self.channel || (self.isInitiator && channel == self.channel))
                        socket.onDisconnect().remove();

                    if (config.onopen) setTimeout(config.onopen, 1);

                    return socket;
                };

                if (!window.Firebase) {
                    var script = document.createElement('script');
                    script.src = 'https://cdn.firebase.com/v0/firebase.js';
                    script.onload = callback;
                    document.documentElement.appendChild(script);
                } else callback();
            } else callback();
        }

        function init() {
            if (self.config) return;

            self.config = {
                onroom: function (room) {
                    if (!dataConnector) {
                        self.room = room;
                        return;
                    }

                    if (self.joinedARoom) return;
                    self.joinedARoom = true;

                    dataConnector.joinRoom({
                        roomToken: room.roomToken,
                        joinUser: room.broadcaster
                    });
                },
                onopen: function (userid, _channel) {
                    self.onopen(userid, _channel);
                    self.channels[userid] = {
                        channel: _channel,
                        send: function (data) {
                            self.send(data, this.channel);
                        }
                    };
                },
                onmessage: function (data, userid) {
                    if (IsDataChannelSupported && !data.size) data = JSON.parse(data);

                    if (!IsDataChannelSupported) {
                        if (data.userid === window.userid) return;
                        data = data.message;
                    }

                    if (data.type === 'text')
                        textReceiver.receive(data, self.onmessage, userid);

                    else if (data.size || data.type === 'file')
                        fileReceiver.receive(data, self.config);

                    else self.onmessage(data, userid);
                },
                onclose: function (event) {
                    var myChannels = self.channels,
                        closedChannel = event.currentTarget;

                    for (var userid in myChannels) {
                        if (closedChannel === myChannels[userid].channel) {
                            delete myChannels[userid];
                        }
                    }

                    self.onclose(event);
                }
            };

            dataConnector = IsDataChannelSupported ?
                new DataConnector(self, self.config) :
                new SocketConnector(self.channel, self.config);

            fileReceiver = new FileReceiver();
            textReceiver = new TextReceiver();

            if (self.room) self.config.onroom(self.room);
        }

        this.open = function (_channel) {
            self.joinedARoom = true;

            if (self.socket) self.socket.onDisconnect().remove();
            else self.isInitiator = true;

            if (_channel) self.channel = _channel;

            prepareInit(function () {
                init();
                if (IsDataChannelSupported) dataConnector.createRoom();
            });
        };

        this.connect = function (_channel) {
            if (_channel) self.channel = _channel;
            prepareInit(init);
        };

        this.send = function (data, _channel) {
            if (!data) throw 'No file, data or text message to share.';
            if (data.size)
                FileSender.send({
                    file: data,
                    channel: dataConnector,

                    onFileSent: function (file) {
                        self.onFileSent(file);
                    },
                    onFileProgress: function (packets) {
                        self.onFileProgress(packets);
                    },

                    _channel: _channel
                });
            else
                TextSender.send({
                    text: data,
                    channel: dataConnector,
                    _channel: _channel
                });
        };

        this.onleave = function (userid) {
            console.debug(userid, 'left!');
        };

        this.leave = this.eject = function (userid) {
            dataConnector.leave(userid, self.autoCloseEntireSession);
        };

        this.openNewSession = function (isOpenNewSession, isNonFirebaseClient) {
            if (isOpenNewSession) {
                if (self.isNewSessionOpened) return;
                self.isNewSessionOpened = true;

                if (!self.joinedARoom) self.open();
            }

            if (!isOpenNewSession || isNonFirebaseClient) self.connect();

            // for non-firebase clients
            if (isNonFirebaseClient) setTimeout(function () {
                    self.openNewSession(true);
                }, 5000);
        };

        if (self.automatic) {
            if (window.Firebase) {
                console.debug('checking presence of the room..');
                new window.Firebase('https://' + (extras.firebase || self.firebase || 'chat') + '.firebaseIO.com/' + self.channel).once('value', function (data) {
                    console.debug('room is present?', data.val() != null);
                    self.openNewSession(data.val() == null);
                });
            } else self.openNewSession(false, true);
        }
    };

    function DataConnector(root, config) {
        var self = {};
        var that = this;

        self.userToken = root.userid || uniqueToken();
        self.sockets = [];
        self.socketObjects = {};

        var channels = '--',
            isbroadcaster, isGetNewRoom = true,
            RTCDataChannels = [];

        function newPrivateSocket(_config) {
            var socketConfig = {
                channel: _config.channel,
                onmessage: socketResponse,
                onopen: function () {
                    if (isofferer && !peer) initPeer();

                    _config.socketIndex = socket.index = self.sockets.length;
                    self.socketObjects[socketConfig.channel] = socket;
                    self.sockets[_config.socketIndex] = socket;
                }
            };

            socketConfig.callback = function (_socket) {
                socket = _socket;
                socketConfig.onopen();
            };

            var socket = root.openSignalingChannel(socketConfig),
                isofferer = _config.isofferer,
                gotstream, inner = {}, peer;

            var peerConfig = {
                onICE: function (candidate) {
                    socket && socket.send({
                        userToken: self.userToken,
                        candidate: {
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            candidate: JSON.stringify(candidate.candidate)
                        }
                    });
                },
                onopen: onChannelOpened,
                onmessage: function (event) {
                    config.onmessage(event.data, _config.userid);
                },
                onclose: config.onclose,
                onerror: root.onerror
            };

            function initPeer(offerSDP) {
                if (root.direction === 'one-to-one' && window.isFirstConnectionOpened) return;

                if (!offerSDP) peerConfig.onOfferSDP = sendsdp;
                else {
                    peerConfig.offerSDP = offerSDP;
                    peerConfig.onAnswerSDP = sendsdp;
                }

                peer = RTCPeerConnection(peerConfig);
            }

            function onChannelOpened(channel) {
                channel.peer = peer.peer;
                RTCDataChannels[RTCDataChannels.length] = channel;

                config.onopen(_config.userid, channel);

                if (root.direction === 'many-to-many' && isbroadcaster && channels.split('--').length > 3) {
                    defaultSocket && defaultSocket.send({
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
                if (response.userToken == self.userToken) return;

                if (response.firstPart || response.secondPart || response.thirdPart) {
                    if (response.firstPart) {
                        // sdp sender's user id passed over "onopen" method
                        _config.userid = response.userToken;

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

                    console.debug('ice candidate', response.candidate.candidate);
                }

                if (response.left) {
                    if (peer && peer.peer) {
                        peer.peer.close();
                        peer.peer = null;
                    }

                    if (response.closeEntireSession) leaveChannels();
                    else if (socket) {
                        socket.send({
                            left: true,
                            userToken: self.userToken
                        });
                        socket = null;
                    }

                    root.onleave(response.userToken);
                }

                if (response.playRoleOfBroadcaster) setTimeout(function () {
                        self.roomToken = response.roomToken;
                        root.open(self.roomToken);
                        self.sockets = self.sockets.swap();
                    }, 600);
            }

            var invokedOnce = false;

            function selfInvoker() {
                if (invokedOnce) return;

                invokedOnce = true;
                inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);

                if (isofferer) peer.addAnswerSDP(inner.sdp);
                else initPeer(inner.sdp);

                console.debug('sdp', inner.sdp.sdp);
            }
        }

        function onNewParticipant(channel) {
            if (!channel || channels.indexOf(channel) != -1 || channel == self.userToken) return;
            channels += channel + '--';

            var new_channel = uniqueToken();

            newPrivateSocket({
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
            return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
        }

        function leaveChannels(channel) {
            var alert = {
                left: true,
                userToken: self.userToken
            };

            // if room initiator is leaving the room; close the entire session
            if (isbroadcaster) {
                if (root.autoCloseEntireSession) alert.closeEntireSession = true;
                else self.sockets[0].send({
                        playRoleOfBroadcaster: true,
                        userToken: self.userToken,
                        roomToken: self.roomToken
                    });
            }

            if (!channel) {
                // closing all sockets
                var sockets = self.sockets,
                    length = sockets.length;

                for (var i = 0; i < length; i++) {
                    var socket = sockets[i];
                    if (socket) {
                        socket.send(alert);

                        if (self.socketObjects[socket.channel])
                            delete self.socketObjects[socket.channel];

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

                    if (self.sockets[socket.index])
                        delete self.sockets[socket.index];

                    delete self.socketObjects[channel];
                }
            }
            self.sockets = self.sockets.swap();
        }

        window.onunload = function () {
            leaveChannels();
        };

        var defaultSocket = root.openSignalingChannel({
            onmessage: function (response) {
                if (response.userToken == self.userToken) return;

                if (isGetNewRoom && response.roomToken && response.broadcaster) config.onroom(response);

                if (response.newParticipant) onNewParticipant(response.newParticipant);

                if (response.userToken && response.joinUser == self.userToken && response.participant && channels.indexOf(response.userToken) == -1) {
                    channels += response.userToken + '--';

                    console.debug('Data connection is being opened between you and', response.userToken || response.channel);
                    newPrivateSocket({
                        isofferer: true,
                        channel: response.channel || response.userToken,
                        closeSocket: true
                    });
                }
            },
            callback: function (socket) {
                defaultSocket = socket;
            }
        });

        return {
            createRoom: function () {
                self.roomToken = uniqueToken();

                isbroadcaster = true;
                isGetNewRoom = false;

                (function transmit() {
                    defaultSocket && defaultSocket.send({
                        roomToken: self.roomToken,
                        broadcaster: self.userToken
                    });

                    if (!root.transmitRoomOnce && !that.leaving) {
                        if (root.direction === 'one-to-one') {
                            if (!window.isFirstConnectionOpened) setTimeout(transmit, 3000);
                        } else setTimeout(transmit, 3000);
                    }
                })();
            },
            joinRoom: function (_config) {
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
            send: function (message, _channel) {
                var _channels = RTCDataChannels,
                    data, length = _channels.length;
                if (!length) return;

                if (moz && message.file) data = message.file;
                else data = JSON.stringify(message);

                if (_channel) _channel.send(data);
                else for (var i = 0; i < length; i++) _channels[i].send(data);
            },
            leave: function (userid, autoCloseEntireSession) {
                if (autoCloseEntireSession) root.autoCloseEntireSession = true;
                leaveChannels(userid);
                if (!userid) {
                    self.joinedARoom = isbroadcaster = false;
                    isGetNewRoom = true;
                }
            }
        };
    }

    function SocketConnector(_channel, config) {
        var channel = config.openSocket({
            channel: _channel,
            onopen: config.onopen,
            onmessage: config.onmessage
        });

        return {
            send: function (message) {
                channel && channel.send({
                    userid: userid,
                    message: message
                });
            }
        };
    }

    window.userid = (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');

    var FileSender = {
        send: function (config) {
            var channel = config.channel,
                _channel = config._channel,
                file = config.file;

            /* if firefox nightly: share file blob directly */
            if (moz && IsDataChannelSupported) {
                /* used on the receiver side to set received file name */
                channel.send({
                    fileName: file.name,
                    type: 'file'
                }, _channel);

                /* sending entire file at once */
                channel.send({
                    file: file
                }, _channel);

                if (config.onFileSent) config.onFileSent(file);
            }

            /* if chrome */
            if (!IsDataChannelSupported || !moz) {
                var reader = new window.FileReader();
                reader.readAsDataURL(file);
                reader.onload = onReadAsDataURL;
            }

            var packetSize = 1000,
                textToTransfer = '',
                numberOfPackets = 0,
                packets = 0;

            function onReadAsDataURL(event, text) {
                var data = {
                    type: 'file'
                };

                if (event) {
                    text = event.target.result;
                    numberOfPackets = packets = data.packets = parseInt(text.length / packetSize);
                }

                if (config.onFileProgress)
                    config.onFileProgress({
                        remaining: packets--,
                        length: numberOfPackets,
                        sent: numberOfPackets - packets
                    });

                if (text.length > packetSize) data.message = text.slice(0, packetSize);
                else {
                    data.message = text;
                    data.last = true;
                    data.name = file.name;

                    if (config.onFileSent) config.onFileSent(file);
                }

                channel.send(data, _channel);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length)
                    setTimeout(function () {
                        onReadAsDataURL(null, textToTransfer);
                    }, 500);
            }
        }
    };

    function FileReceiver() {
        var content = [],
            fileName = '',
            packets = 0,
            numberOfPackets = 0;

        function receive(data, config) {
            /* if firefox nightly & file blob shared */
            if (moz) {
                if (data.fileName) fileName = data.fileName;
                if (data.size) {
                    var reader = new window.FileReader();
                    reader.readAsDataURL(data);
                    reader.onload = function (event) {
                        FileSaver.SaveToDisk(event.target.result, fileName);
                        if (config.onFileReceived) config.onFileReceived(fileName);
                    };
                }
            }

            if (!moz) {
                if (data.packets) numberOfPackets = packets = parseInt(data.packets);

                if (config.onFileProgress)
                    config.onFileProgress({
                        remaining: packets--,
                        length: numberOfPackets,
                        received: numberOfPackets - packets
                    });

                content.push(data.message);

                if (data.last) {
                    FileSaver.SaveToDisk(content.join(''), data.name);
                    if (config.onFileReceived) config.onFileReceived(data.name);
                    content = [];
                }
            }
        }

        return {
            receive: receive
        };
    }

    var FileSaver = {
        SaveToDisk: function (fileUrl, fileName) {
            var save = document.createElement('a');
            save.href = fileUrl;
            save.target = '_blank';
            save.download = fileName || fileUrl;

            var evt = document.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

            save.dispatchEvent(evt);

            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        }
    };

    var TextSender = {
        send: function (config) {
            var channel = config.channel,
                _channel = config._channel,
                initialText = config.text,
                packetSize = 1000 /* chars */ ,
                textToTransfer = '',
                isobject = false;

            if (typeof initialText !== 'string') {
                isobject = true;
                initialText = JSON.stringify(initialText);
            }

            if (IsDataChannelSupported && (moz || initialText.length <= packetSize)) channel.send(config.text, _channel);
            else sendText(initialText);

            function sendText(textMessage, text) {
                var data = {
                    type: 'text'
                };

                if (textMessage) {
                    text = textMessage;
                    data.packets = parseInt(text.length / packetSize);
                }

                if (text.length > packetSize)
                    data.message = text.slice(0, packetSize);
                else {
                    data.message = text;
                    data.last = true;
                    data.isobject = isobject;
                }

                channel.send(data, _channel);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length)
                    setTimeout(function () {
                        sendText(null, textToTransfer);
                    }, 500);
            }
        }
    };

    function TextReceiver() {
        var content = [];

        function receive(data, onmessage, userid) {
            content.push(data.message);
            if (data.last) {
                content = content.join('');
                if (data.isobject) content = JSON.parse(content);
                if (onmessage) onmessage(content, userid);
                content = [];
            }
        }

        return {
            receive: receive
        };
    }

    Array.prototype.swap = function () {
        var swapped = [],
            arr = this,
            length = arr.length;
        for (var i = 0; i < length; i++) if (arr[i]) swapped[swapped.length] = arr[i];
        return swapped;
    };

    window.moz = !! navigator.mozGetUserMedia;
    window.IsDataChannelSupported = !((moz && !navigator.mozGetUserMedia) || (!moz && !navigator.webkitGetUserMedia));

    function RTCPeerConnection(options) {
        var w = window,
            PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
            SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
            IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

        var iceServers = {
            iceServers: [{
                    url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
                }
            ]
        };

        var optional = {
            optional: []
        };

        if (!moz) {
            optional.optional = [{
                    RtpDataChannels: true
                }
            ];
        }

        var peerConnection = new PeerConnection(iceServers, optional);

        openOffererChannel();
        peerConnection.onicecandidate = onicecandidate;

        function onicecandidate(event) {
            if (!event.candidate || !peerConnection) return;
            if (options.onICE) options.onICE(event.candidate);
        }

        var constraints = options.constraints || {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: !! moz,
                OfferToReceiveVideo: !! moz
            }
        };

        function createOffer() {
            if (!options.onOfferSDP) return;

            peerConnection.createOffer(function (sessionDescription) {
                peerConnection.setLocalDescription(sessionDescription);
                options.onOfferSDP(sessionDescription);
            }, null, constraints);
        }

        function createAnswer() {
            if (!options.onAnswerSDP) return;

            options.offerSDP = new SessionDescription(options.offerSDP);
            peerConnection.setRemoteDescription(options.offerSDP);

            peerConnection.createAnswer(function (sessionDescription) {
                peerConnection.setLocalDescription(sessionDescription);
                options.onAnswerSDP(sessionDescription);
            }, null, constraints);
        }

        if (!moz) {
            createOffer();
            createAnswer();
        }

        var channel;

        function openOffererChannel() {
            if (moz && !options.onOfferSDP) return;

            _openOffererChannel();
            if (moz) {
                navigator.mozGetUserMedia({
                    audio: true,
                    fake: true
                }, function (stream) {
                    peerConnection.addStream(stream);
                    createOffer();
                }, useless);
            }
        }

        function _openOffererChannel() {
            channel = peerConnection.createDataChannel(
                options.channel || 'RTCDataChannel',
                moz ? {} : {
                reliable: false
            });
            if (moz) channel.binaryType = 'blob';
            setChannelEvents();
        }

        function setChannelEvents() {
            channel.onmessage = options.onmessage;
            channel.onopen = function () {
                options.onopen(channel);
            };
            channel.onclose = options.onclose;
            channel.onerror = options.onerror;
        }

        if (options.onAnswerSDP && moz) openAnswererChannel();

        function openAnswererChannel() {
            peerConnection.ondatachannel = function (event) {
                channel = event.channel;
                channel.binaryType = 'blob';
                setChannelEvents();
            };

            if (moz) {
                navigator.mozGetUserMedia({
                    audio: true,
                    fake: true
                }, function (stream) {
                    peerConnection.addStream(stream);
                    createAnswer();
                }, useless);
            }
        }

        function useless() {}

        return {
            addAnswerSDP: function (sdp) {
                sdp = new SessionDescription(sdp);
                peerConnection.setRemoteDescription(sdp);
            },
            addICE: function (candidate) {
                peerConnection.addIceCandidate(new IceCandidate({
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: candidate.candidate
                }));
            },

            peer: peerConnection,
            channel: channel,
            sendData: function (message) {
                channel && channel.send(message);
            }
        };
    }
})();