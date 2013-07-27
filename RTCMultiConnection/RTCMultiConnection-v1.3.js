// 2013, @muazkh - https://github.com/muaz-khan
// MIT License   - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.3.md

// RTCMultiConnection-v1.3
(function() {
    window.RTCMultiConnection = function(channel) {
        this.channel = channel;

        this.open = function(_channel) {
            if (_channel)
                self.channel = _channel;

            if (self.socket)
                self.socket.onDisconnect().remove();

            self.isInitiator = true;

            prepareInit(function() {
                init();
                captureUserMedia(rtcSession.initSession);
            });
        };

        this.connect = function(_channel) {
            if (_channel)
                self.channel = _channel;

            prepareInit(init);
        };

        this.join = joinSession;

        this.send = function(data, _channel) {
            if (!data)
                throw 'No file, data or text message to share.';

            if (data.size)
                FileSender.send({
                    file: data,
                    channel: rtcSession,
                    onFileSent: self.onFileSent,
                    onFileProgress: self.onFileProgress,
                    _channel: _channel
                });
            else
                TextSender.send({
                    text: data,
                    channel: rtcSession,
                    _channel: _channel
                });
        };

        var self = this,
            rtcSession, fileReceiver, textReceiver;

        function prepareInit(callback) {
            if (!self.openSignalingChannel) {
                if (typeof self.transmitRoomOnce == 'undefined')
                    self.transmitRoomOnce = true;

                // for custom socket.io over node.js implementation - visit - https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs
                self.openSignalingChannel = function(config) {
                    var channel = config.channel || self.channel || 'default-channel';
                    var firebase = new window.Firebase('https://' + (self.firebase || 'chat') + '.firebaseIO.com/' + channel);
                    firebase.channel = channel;
                    firebase.on('child_added', function(data) {
                        config.onmessage(data.val());
                    });

                    firebase.send = function(data) {
                        this.push(data);
                    };

                    if (!self.socket)
                        self.socket = firebase;

                    if (channel != self.channel || (self.isInitiator && channel == self.channel))
                        firebase.onDisconnect().remove();

                    if (config.onopen)
                        setTimeout(config.onopen, 1);

                    return firebase;
                };

                if (!window.Firebase) {
                    var script = document.createElement('script');
                    script.src = 'https://cdn.firebase.com/v0/firebase.js';
                    script.onload = callback;
                    document.documentElement.appendChild(script);
                } else
                    callback();
            } else
                callback();
        }

        function init() {
            if (self.config)
                return;

            self.config = {
                onNewSession: function(session) {
                    if (self.channel !== session.sessionid)
                        return false;

                    if (!rtcSession) {
                        self._session = session;
                        return;
                    }

                    if (self.onNewSession)
                        return self.onNewSession(session);

                    if (self.joinedARoom)
                        return false;
                    self.joinedARoom = true;

                    return joinSession(session);
                },
                onmessage: function(e) {
                    if (!e.data.size)
                        e.data = JSON.parse(e.data);

                    if (e.data.type === 'text')
                        textReceiver.receive({
                            data: e.data,
                            connection: self
                        });

                    else if (e.data.size || e.data.type === 'file')
                        fileReceiver.receive({
                            data: e.data,
                            connection: self
                        });
                    else
                        self.onmessage(e);
                }
            };
            rtcSession = new RTCMultiSession(self);

            // bug: these two must be fixed. Must be able to receive many files concurrently.
            // Note: this bug is fixed in v1.4
            fileReceiver = new FileReceiver();
            textReceiver = new TextReceiver();

            if (self._session)
                self.config.onNewSession(self._session);
        }

        function joinSession(session) {
            if (!session || !session.userid || !session.sessionid)
                throw 'invalid data passed.';

            self.session = session.session;

            extra = self.extra || session.extra || { };

            if (session.oneway || session.data)
                rtcSession.joinSession(session, extra);
            else
                captureUserMedia(function() {
                    rtcSession.joinSession(session, extra);
                });
        }

        function captureUserMedia(callback, _session) {
            var constraints, video_constraints;
            var session = _session || self.session;

            log(JSON.stringify(session, null, '\t'));

            if (self.dontAttachStream)
                return callback();

            if (isData(session) || (!self.isInitiator && session.oneway)) {
                self.attachStream = null;
                return callback();
            }

            if (session.audio && !session.video) {
                constraints = {
                    audio: true,
                    video: false
                };
            } else if (session.screen) {
                video_constraints = {
                    mandatory: {
                        chromeMediaSource: 'screen'
                    },
                    optional: []
                };
                constraints = {
                    audio: false,
                    video: video_constraints
                };
            } else if (session.video && !session.audio) {
                video_constraints = {
                    mandatory: { },
                    optional: []
                };
                constraints = {
                    audio: false,
                    video: video_constraints
                };
            }
            var mediaElement = document.createElement(session.audio && !session.video ? 'audio' : 'video');
            var mediaConfig = {
                video: mediaElement,
                onsuccess: function(stream) {
                    self.attachStream = stream;
                    var streamid = self.token();

                    self.onstream({
                        stream: stream,
                        streamid: streamid,
                        mediaElement: mediaElement,
                        blobURL: mediaElement.mozSrcObject || mediaElement.src,
                        type: 'local'
                    });

                    self.streams[streamid] = self._getStream({
                        stream: stream,
                        userid: self.userid
                    });

                    if (callback)
                        callback(stream);

                    mediaElement.autoplay = true;
                    mediaElement.controls = true;
                    mediaElement.muted = true;
                },
                onerror: function() {
                    if (session.audio && !session.video)
                        throw 'Microphone access is denied.';
                    else if (session.screen) {
                        if (location.protocol === 'http:')
                            throw '<https> is mandatory to capture screen.';
                        else
                            throw 'Multi-capturing of screen is not allowed. Capturing process is denied. Are you enabled flag: "Enable screen capture support in getUserMedia"?';
                    } else
                        throw 'Webcam access is denied.';
                }
            };

            if (constraints)
                mediaConfig.constraints = constraints;

            return getUserMedia(mediaConfig);
        }

        this.captureUserMedia = captureUserMedia;

        this.leave = this.eject = function(userid) {
            rtcSession.leave(userid);

            self.attachStream.stop();
            currentUserMediaRequest.streams = [];
        };

        this.close = function() {
            self.autoCloseEntireSession = true;
            rtcSession.leave();
        };

        this.addStream = function(session, socket) {
            captureUserMedia(function(stream) {
                rtcSession.addStream({
                    stream: stream,
                    renegotiate: session,
                    socket: socket
                });
            }, session);
        };

        Defaulter(self);
    };

    function RTCMultiSession(root) {
        var config = root.config;
        var session = root.session;

        var self = { };
        var socketObjects = { };
        var sockets = [];

        self.userid = root.userid = root.userid || root.token();
        self.sessionid = root.channel;

        var channels = '--',
            isbroadcaster,
            isAcceptNewSession = true,
            RTCDataChannels = [];

        function newPrivateSocket(_config) {
            var socketConfig = {
                channel: _config.channel,
                onmessage: socketResponse,
                onopen: function() {
                    if (isofferer && !peer)
                        initPeer();

                    _config.socketIndex = socket.index = sockets.length;
                    socketObjects[socketConfig.channel] = socket;
                    sockets[_config.socketIndex] = socket;
                }
            };

            socketConfig.callback = function(_socket) {
                socket = _socket;
                socketConfig.onopen();
            };

            var socket = root.openSignalingChannel(socketConfig),
                isofferer = _config.isofferer,
                peer,
                mediaElement;

            var peerConfig = {
                onopen: onChannelOpened,
                onICE: function(candidate) {
                    socket && socket.send({
                        userid: self.userid,
                        candidate: {
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            candidate: JSON.stringify(candidate.candidate)
                        }
                    });
                },
                onmessage: function(event) {
                    config.onmessage({
                        data: event.data,
                        userid: _config.userid,
                        extra: _config.extra
                    });
                },
                onstream: function(stream) {
                    mediaElement = document.createElement(session.audio && !session.video ? 'audio' : 'video');
                    mediaElement[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
                    mediaElement.autoplay = true;
                    mediaElement.controls = true;
                    mediaElement.play();

                    _config.stream = stream;
                    if (session.audio && !session.video)
                        mediaElement.addEventListener('play', function() {
                            setTimeout(function() {
                                mediaElement.muted = false;
                                mediaElement.volume = 1;
                                afterRemoteStreamStartedFlowing();
                            }, 3000);
                        }, false);
                    else
                        afterRemoteStreamStartedFlowing();
                },

                onclose: function(e) {
                    e.extra = _config.extra;
                    e.userid = _config.userid;
                    root.onclose(e);
                },
                onerror: function(e) {
                    e.extra = _config.extra;
                    e.userid = _config.userid;
                    root.onerror(e);
                },

                attachStream: root.attachStream,
                iceServers: root.iceServers,
                bandwidth: root.bandwidth
            };

            function initPeer(offerSDP) {
                if (!offerSDP)
                    peerConfig.onOfferSDP = function(sdp) {
                        sendsdp({
                            sdp: sdp,
                            socket: socket
                        });
                    };
                else {
                    peerConfig.offerSDP = offerSDP;
                    peerConfig.onAnswerSDP = function(sdp) {
                        sendsdp({
                            sdp: sdp,
                            socket: socket
                        });
                    };
                }

                if (!session.data)
                    peerConfig.onmessage = null;
                peerConfig.session = session;
                peer = new RTCPeerConnection(peerConfig);
            }

            function afterRemoteStreamStartedFlowing() {
                _config.stream.onended = function() {
                    root.onstreamended(streamedObject);
                };

                var streamid = root.token();
                var streamedObject = {
                    mediaElement: mediaElement,

                    stream: _config.stream,
                    streamid: streamid,
                    session: session,

                    blobURL: mediaElement.mozSrcObject || mediaElement.src,
                    type: 'remote',

                    extra: _config.extra,
                    userid: _config.userid
                };
                root.onstream(streamedObject);

                // connection.streams['stream-id'].mute({audio:true})
                root.streams[streamid] = root._getStream({
                    stream: _config.stream,
                    userid: _config.userid,
                    socket: socket
                });

                onSessionOpened();
            }

            function onChannelOpened(channel) {
                RTCDataChannels[RTCDataChannels.length] = _config.channel = channel;

                root.onopen({
                    extra: _config.extra,
                    userid: _config.userid
                });

                // connection.channels['user-id'].send(data);				
                root.channels[_config.userid] = {
                    channel: _config.channel,
                    send: function(data) {
                        root.send(data, this.channel);
                    }
                };

                if (isData(session)) onSessionOpened();
            }

            function updateSocket() {
                if (socket.userid == _config.userid)
                    return;

                socket.userid = _config.userid;
                sockets[_config.socketIndex] = socket;

                // connection.peers['user-id'].addStream({audio:true})
                root.peers[_config.userid] = {
                    socket: socket,
                    peer: peer,
                    userid: _config.userid,
                    addStream: function(session) {
                        root.addStream(session, this.socket);
                    }
                };
            }

            function onSessionOpened() {
                // original conferencing infrastructure!
                if (!session.oneway && !session.broadcast && isbroadcaster && channels.split('--').length > 3)
                    defaultSocket.send({
                        newParticipant: socket.channel,
                        userid: self.userid,
                        extra: _config.extra || { }
                    });
            }

            function socketResponse(response) {
                if (response.userid == self.userid)
                    return;

                if (response.sdp) {
                    _config.userid = response.userid;
                    _config.extra = response.extra;
                    _config.renegotiate = response.renegotiate;

                    // to make sure user-id for socket object is set
                    // even if one-way streaming
                    updateSocket();

                    sdpInvoker(response.sdp);
                }

                if (response.candidate) {
                    peer && peer.addICE({
                        sdpMLineIndex: response.candidate.sdpMLineIndex,
                        candidate: JSON.parse(response.candidate.candidate)
                    });
                }

                if (response.mute || response.unmute) {
                    log(response);
                }

                if (response.left) {
                    if (peer && peer.connection) {
                        peer.connection.close();
                        peer.connection = null;
                    }

                    if (response.closeEntireSession)
                        clearSession();
                    else if (socket) {
                        socket.send({
                            left: true,
                            extra: root.extra,
                            userid: self.userid
                        });

                        if (sockets[_config.socketIndex])
                            delete sockets[_config.socketIndex];
                        if (socketObjects[socket.channel])
                            delete socketObjects[socket.channel];

                        socket = null;
                    }

                    root.onleave({
                        userid: response.userid,
                        extra: response.extra
                    });
                }

                if (response.playRoleOfBroadcaster)
                    setTimeout(function() {
                        root.dontAttachStream = true;
                        self.userid = response.userid;
                        root.open({
                            extra: root.extra
                        });
                        sockets = sockets.swap();
                        root.dontAttachStream = false;
                    }, 600);

                if (response.suggestRenegotiation) {
                    renegotiate = response.renegotiate;
                    if (isData(renegotiate))
                        createOffer();
                    else
                        root.captureUserMedia(function(stream) {
                            peer.connection.addStream(stream);
                            createOffer();
                        }, renegotiate);

                    function createOffer() {
                        peer.recreateOffer(renegotiate, function(sdp) {
                            sendsdp({
                                sdp: sdp,
                                socket: socket,
                                renegotiate: response.renegotiate
                            });
                        });
                    }
                }
            }

            function sdpInvoker(sdp) {
                log(sdp.sdp);

                if (isofferer)
                    return peer.addAnswerSDP(sdp);
                if (!_config.renegotiate)
                    return initPeer(sdp);

                session = root.session = _config.renegotiate;
                if (session.oneway || isData(session)) {
                    createAnswer();
                } else {
                    if (_config.capturing)
                        return;
                    _config.capturing = true;

                    root.captureUserMedia(function(stream) {
                        _config.capturing = false;
                        peer.connection.addStream(stream);
                        createAnswer();
                    }, _config.renegotiate);
                }

                delete _config.renegotiate;

                function createAnswer() {
                    peer.recreateAnswer(sdp, session, function(_sdp) {
                        sendsdp({
                            sdp: _sdp,
                            socket: socket
                        });
                    });
                }
            }
        }

        function sendsdp(e) {
            e.socket.send({
                userid: self.userid,
                sdp: e.sdp,
                extra: root.extra,
                renegotiate: e.renegotiate ? e.renegotiate : false
            });
        }

        function onNewParticipant(channel, extra) {
            if (!channel || channels.indexOf(channel) != -1 || channel == self.userid)
                return;
            channels += channel + '--';

            var new_channel = root.token();
            newPrivateSocket({
                channel: new_channel,
                closeSocket: true,
                extra: extra || { }
            });

            defaultSocket.send({
                participant: true,
                userid: self.userid,
                targetUser: channel,
                channel: new_channel,
                extra: root.extra
            });
        }

        function clearSession(channel) {
            var alert = {
                left: true,
                extra: root.extra,
                userid: self.userid
            };

            if (isbroadcaster) {
                if (root.autoCloseEntireSession)
                    alert.closeEntireSession = true;
                else
                    sockets[0] && sockets[0].send({
                        playRoleOfBroadcaster: true,
                        userid: self.userid
                    });
            }

            if (!channel) {
                var length = sockets.length;
                for (var i = 0; i < length; i++) {
                    socket = sockets[i];
                    if (socket) {
                        socket.send(alert);
                        if (socketObjects[socket.channel])
                            delete socketObjects[socket.channel];
                        delete sockets[i];
                    }
                }
            }

            // eject a specific user!
            if (channel) {
                socket = socketObjects[channel];
                if (socket) {
                    socket.send(alert);
                    if (sockets[socket.index])
                        delete sockets[socket.index];
                    delete socketObjects[channel];
                }
            }

            sockets = sockets.swap();
        }

        window.onbeforeunload = function() {
            clearSession();
        };

        window.onkeyup = function(e) {
            if (e.keyCode == 116)
                clearSession();
        };

        var anchors = document.querySelectorAll('a'),
            length = anchors.length;
        for (var i = 0; i < length; i++) {
            var a = anchors[i];
            if (a.href.indexOf('#') !== 0 && a.getAttribute('target') != '_blank')
                a.onclick = function() {
                    clearSession();
                };
        }

        var that = this,
            defaultSocket = root.openSignalingChannel({
                onmessage: function(response) {
                    if (response.userid == self.userid)
                        return;
                    if (isAcceptNewSession && response.sessionid && response.userid) {
                        session = root.session = response.session;
                        config.onNewSession(response);
                    }

                    if (response.newParticipant && self.joinedARoom && self.broadcasterid === response.userid)
                        onNewParticipant(response.newParticipant, response.extra);
                    if (response.userid && response.targetUser == self.userid && response.participant && channels.indexOf(response.userid) == -1) {
                        channels += response.userid + '--';
                        newPrivateSocket({
                            isofferer: true,
                            channel: response.channel || response.userid,
                            closeSocket: true,
                            extra: response.extra
                        });
                    }
                },
                callback: function(socket) {
                    defaultSocket = socket;
                }
            });

        this.initSession = function() {
            isbroadcaster = true;
            isAcceptNewSession = false;
            (function transmit() {
                defaultSocket && defaultSocket.send({
                    sessionid: self.sessionid,
                    userid: self.userid,
                    session: session,
                    extra: root.extra
                });

                if (!root.transmitRoomOnce && !that.leaving)
                    setTimeout(transmit, root.interval || 3000);
            })();
        };

        this.joinSession = function(_config) {
            _config = _config || { };

            session = _config.session;

            self.joinedARoom = true;

            if (_config.sessionid)
                self.sessionid = _config.sessionid;

            isAcceptNewSession = false;

            newPrivateSocket({
                channel: self.userid,
                extra: _config.extra
            });

            defaultSocket.send({
                participant: true,
                userid: self.userid,
                targetUser: _config.userid,
                extra: root.extra
            });

            self.broadcasterid = _config.userid;
        };

        this.send = function(message, _channel) {
            var _channels = RTCDataChannels,
                data, length = _channels.length;
            if (!length)
                return;

            if (moz && message.file)
                data = message.file;
            else
                data = JSON.stringify(message);

            if (_channel)
                _channel.send(data);
            else
                for (var i = 0; i < length; i++)
                    _channels[i].send(data);
        };

        this.leave = function(userid) {
            clearSession(userid);

            if (!userid) {
                self.joinedARoom = isbroadcaster = false;
                isAcceptNewSession = true;
            }
        };

        this.addStream = function(e) {
            session = e.renegotiate;

            if (e.socket)
                addStream(e.socket);
            else
                for (var i = 0; i < sockets.length; i++)
                    addStream(sockets[i]);

            function addStream(socket) {
                peer = root.peers[socket.userid];

                if (!peer)
                    throw 'No such peer exists.';

                peer = peer.peer;

                // if offerer; renegotiate
                if (peer.connection.localDescription.type == 'offer') {
                    if (session.audio || session.video)
                        peer.connection.addStream(e.stream);

                    peer.recreateOffer(session, function(sdp) {
                        sendsdp({
                            sdp: sdp,
                            socket: socket,
                            renegotiate: session
                        });
                    });
                } else {
                    // otherwise; suggest other user to play role of renegotiator
                    socket.send({
                        userid: self.userid,
                        renegotiate: session,
                        suggestRenegotiation: true
                    });
                }
            }
        };
    }

    var FileSender = {
        send: function(config) {
            var channel = config.channel;
            var file = config.file;
            var _channel = config._channel;

            if (moz) {
                channel.send({
                    fileName: file.name,
                    type: 'file'
                }, _channel);

                channel.send({
                    file: file
                }, _channel);

                config.onFileSent(file);
            }

            if (!moz) {
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

                config.onFileProgress({
                    remaining: packets--,
                    length: numberOfPackets,
                    sent: numberOfPackets - packets
                });

                if (text.length > packetSize)
                    data.message = text.slice(0, packetSize);
                else {
                    data.message = text;
                    data.last = true;
                    data.name = file.name;

                    config.onFileSent(file);
                }

                channel.send(data, _channel);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length)
                    setTimeout(function() {
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

        this.receive = function(e) {
            var data = e.data;
            var connection = e.connection;

            if (moz) {
                if (data.fileName)
                    fileName = data.fileName;

                if (data.size) {
                    var reader = new window.FileReader();
                    reader.readAsDataURL(data);
                    reader.onload = function(event) {
                        FileSaver.SaveToDisk({
                            fileURL: event.target.result,
                            fileName: fileName
                        });
                        connection.onFileReceived(fileName);
                    };
                }
            }

            if (!moz) {
                if (data.packets)
                    numberOfPackets = packets = parseInt(data.packets);

                if (connection.onFileProgress)
                    connection.onFileProgress({
                        remaining: packets--,
                        length: numberOfPackets,
                        received: numberOfPackets - packets
                    });

                content.push(data.message);

                if (data.last) {
                    FileSaver.SaveToDisk({
                        fileURL: content.join(''),
                        fileName: data.name
                    });
                    connection.onFileReceived(data.name);
                    content = [];
                }
            }
        };
    }

    var TextSender = {
        send: function(config) {
            var channel = config.channel,
                initialText = config.text,
                packetSize = 1000,
                textToTransfer = '',
                _channel = config._channel;

            if (typeof initialText !== 'string')
                initialText = JSON.stringify(initialText);

            if (moz || initialText.length <= packetSize)
                channel.send(config.text, _channel);
            else
                sendText(initialText);

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
                }

                channel.send(data, _channel);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length)
                    setTimeout(function() {
                        sendText(null, textToTransfer);
                    }, 500);
            }
        }
    };

    function TextReceiver() {
        var content = [];

        function receive(e) {
            data = e.data;
            connection = e.connection;

            content.push(data.message);
            if (data.last) {
                connection.onmessage(content.join(''));
                content = [];
            }
        }

        return {
            receive: receive
        };
    }

    var FileSaver = {
        SaveToDisk: function(e) {
            var save = document.createElement('a');
            save.href = e.fileURL;
            save.target = '_blank';
            save.download = e.fileName || e.fileURL;

            var evt = document.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

            save.dispatchEvent(evt);
            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        }
    };

    window.MediaStream = window.MediaStream || window.webkitMediaStream;

    window.moz = !!navigator.mozGetUserMedia;
    var RTCPeerConnection = function(options) {
        var w = window,
            PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
            SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
            IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

        var STUN = {
            url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
        };

        var TURN = {
            url: 'turn:homeo@turn.bistri.com:80',
            credential: 'homeo'
        };

        var iceServers = {
            iceServers: options.iceServers || [STUN]
        };

        if (!moz && !options.iceServers) {
            if (parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]) >= 28)
                TURN = {
                    url: 'turn:turn.bistri.com:80',
                    credential: 'homeo',
                    username: 'homeo'
                };

            // No STUN to make sure it works all the time!
            iceServers.iceServers = [STUN, TURN];
        }

        var optional = {
            optional: []
        };

        if (!moz) {
            optional.optional = [{
                DtlsSrtpKeyAgreement: true
            }];

            if (options.onmessage)
                optional.optional = [{
                    RtpDataChannels: true
                }];
        }

        var peer = new PeerConnection(iceServers, optional);

        openOffererChannel();

        peer.onicecandidate = function(event) {
            if (event && event.candidate && !options.renegotiate)
                options.onICE(event.candidate);
        };

        if (options.attachStream)
            peer.addStream(options.attachStream);
        peer.onaddstream = function(event) {
            log('on:add:stream', event.stream);

            if (!event || !options.onstream)
                return;
            options.onstream(event.stream);
            options.renegotiate = false;
        };

        var constraints;

        function setConstraints() {
            var session = options.session;
            constraints = options.constraints || {
                optional: [],
                mandatory: {
                    OfferToReceiveAudio: !!session.audio,
                    OfferToReceiveVideo: !!session.video || !!session.screen
                }
            };
        }

        setConstraints();

        function createOffer() {
            if (!options.onOfferSDP)
                return;

            peer.createOffer(function(sessionDescription) {
                sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
                peer.setLocalDescription(sessionDescription);
                options.onOfferSDP(sessionDescription);
            }, null, constraints);
        }

        function createAnswer() {
            if (!options.onAnswerSDP)
                return;

            options.offerSDP = new SessionDescription(options.offerSDP);
            peer.setRemoteDescription(options.offerSDP);

            peer.createAnswer(function(sessionDescription) {
                sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
                peer.setLocalDescription(sessionDescription);
                options.onAnswerSDP(sessionDescription);
            }, null, constraints);
        }

        if ((options.onmessage && !moz) || !options.onmessage) {
            createOffer();
            createAnswer();
        }

        var bandwidth = options.bandwidth;

        function setBandwidth(sdp) {
            // Firefox has no support of "b=AS"
            if (moz) return sdp;

            // remove existing bandwidth lines
            sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');

            sdp = sdp.replace( /a=mid:audio\r\n/g , 'a=mid:audio\r\nb=AS:' + (bandwidth.audio || 50) + '\r\n');
            sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\nb=AS:' + (bandwidth.video || 256) + '\r\n');
            sdp = sdp.replace( /a=mid:data\r\n/g , 'a=mid:data\r\nb=AS:' + (bandwidth.data || 1638400) + '\r\n');

            return sdp;
        }

        var channel;

        function openOffererChannel() {
            if (!options.onmessage || (moz && !options.onOfferSDP))
                return;

            _openOffererChannel();

            if (moz && !options.attachStream) {
                navigator.mozGetUserMedia({
                        audio: true,
                        fake: true
                    }, function(stream) {
                        peer.addStream(stream);
                        createOffer();
                    }, useless);
            }
        }

        function _openOffererChannel() {
            channel = peer.createDataChannel(options.channel || 'RTCDataChannel', moz ? { } : {
                reliable: false
            });

            if (moz)
                channel.binaryType = 'blob';
            setChannelEvents();
        }

        function setChannelEvents() {
            channel.onmessage = options.onmessage;
            channel.onopen = function() {
                options.onopen(channel);
            };
            channel.onclose = options.onclose;
            channel.onerror = options.onerror;
        }

        if (options.onAnswerSDP && moz)
            openAnswererChannel();

        function openAnswererChannel() {
            peer.ondatachannel = function(event) {
                channel = event.channel;
                channel.binaryType = 'blob';
                setChannelEvents();
            };

            if (moz && !options.attachStream) {
                navigator.mozGetUserMedia({
                        audio: true,
                        fake: true
                    }, function(stream) {
                        peer.addStream(stream);
                        createAnswer();
                    }, useless);
            }
        }

        function useless() {
        }

        return {
            connection: peer,
            addAnswerSDP: function(sdp) {
                peer.setRemoteDescription(new SessionDescription(sdp));
            },
            addICE: function(candidate) {
                peer.addIceCandidate(new IceCandidate({
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: candidate.candidate
                }));
            },
            recreateAnswer: function(sdp, session, callback) {
                options.renegotiate = true;

                options.session = session;
                setConstraints();

                options.onAnswerSDP = callback;
                options.offerSDP = sdp;
                createAnswer();
            },
            recreateOffer: function(session, callback) {
                options.renegotiate = true;

                options.session = session;
                setConstraints();

                options.onOfferSDP = callback;
                createOffer();
            }
        };
    };

    var video_constraints = {
        mandatory: { },
        optional: []
    };

    /* by @FreCap pull request #41 */
    var currentUserMediaRequest = {
        streams: [],
        mutex: false,
        queueRequests: []
    };

    function getUserMedia(options) {
        if (currentUserMediaRequest.mutex === true) {
            currentUserMediaRequest.queueRequests.push(options);
            return;
        }
        currentUserMediaRequest.mutex = true;
        var n = navigator,
            resourcesNeeded = options.constraints || {
                audio: true,
                video: video_constraints
            };

        // easy way to match 
        var idInstance = JSON.stringify(resourcesNeeded);

        function streaming(stream) {
            var video = options.video;
            if (video) {
                video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
                video.play();
            }

            options.onsuccess(stream);
            currentUserMediaRequest.streams[idInstance] = stream;
            currentUserMediaRequest.mutex = false;
            if (currentUserMediaRequest.queueRequests.length)
                getUserMedia(currentUserMediaRequest.queueRequests.shift());
        }

        if (currentUserMediaRequest.streams[idInstance])
            streaming(currentUserMediaRequest.streams[idInstance]);
        else {
            n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
            n.getMedia(resourcesNeeded, streaming, options.onerror || function(e) {
                console.error(e);
            });
        }
    }

    function isData(session) {
        return !session.audio && !session.video && !session.screen && session.data;
    }

    Array.prototype.swap = function() {
        var swapped = [],
            arr = this,
            length = arr.length;
        for (var i = 0; i < length; i++)
            if (arr[i] && arr[i] !== true)
                swapped[swapped.length] = arr[i];
        return swapped;
    };

    function log(a, b, c, d, e, f) {
        if (f)
            console.log(a, b, c, d, e, f);
        else if (e)
            console.log(a, b, c, d, e);
        else if (d)
            console.log(a, b, c, d);
        else if (c)
            console.log(a, b, c);
        else if (b)
            console.log(a, b);
        else if (a)
            console.log(a);
    }

    function Defaulter(self) {
        self.onmessage = function(e) {
            log(e.userid, 'posted', e.data);
        };

        self.onopen = function(e) {
            log('Data connection is opened between you and', e.userid);
        };

        self.onerror = function(e) {
            console.error('Error in data connection between you and', e.userid, e);
        };

        self.onclose = function(e) {
            console.warn('Data connection between you and', e.userid, 'is closed.', e);
        };

        self.onFileReceived = function(fileName) {
            log('File <', fileName, '> received successfully.');
        };

        self.onFileSent = function(file) {
            log('File <', file.name, '> sent successfully.');
        };

        self.onFileProgress = function(packets) {
            log('<', packets.remaining, '> items remaining.');
        };

        self.onstream = function(stream) {
            log('stream:', stream);
        };

        self.onleave = function(e) {
            log(e.userid, 'left!');
        };

        self.onstreamended = function(e) {
            log('onstreamended', e);
        };

        self.peers = { };
        self.streams = { };
        self.channels = { };
        self.extra = { };

        self.session = {
            audio: true,
            video: true,
            data: true
        };

        self.bandwidth = {
            audio: 50,
            video: 256,
            data: 1638400
        };

        self._getStream = function(e) {
            return {
                stream: e.stream,
                userid: e.userid,
                socket: e.socket,
                mute: function(session) {
                    this._private(session, true);
                },
                unmute: function(session) {
                    this._private(session, false);
                },
                _private: function(session, enabled) {
                    var stream = this.stream;

                    if (e.socket)
                        e.socket.send({
                            userid: this.userid,
                            mute: !!enabled,
                            unmute: !enabled
                        });

                        // for local streams only
                    else
                        log('No socket to send mute/unmute notification message.');

                    session = session || {
                        audio: true,
                        video: true
                    };

                    if (session.audio) {
                        var audioTracks = stream.getAudioTracks()[0];
                        if (audioTracks)
                            audioTracks.enabled = !enabled;
                    }

                    if (session.video) {
                        var videoTracks = stream.getVideoTracks()[0];
                        if (videoTracks)
                            videoTracks.enabled = !enabled;
                    }
                }
            };
        };

        self.token = function() {
            return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
        };
    }
})();
