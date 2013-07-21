// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

// RTCMultiConnection-v1.4
(function() {
    window.RTCMultiConnection = function(channel) {
        this.channel = channel;

        this.open = function(_channel) {
            if (_channel)
                self.channel = _channel;

            if (self.socket && self.socket.onDisconnect)
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
                        textReceiver.receive(e.data, self.onmessage, e.userid, e.extra);

                    else if (e.data.size || e.data.type === 'file')
                        fileReceiver.receive(e.data, self);
                    else
                        self.onmessage(e);
                }
            };
            rtcSession = new RTCMultiSession(self);
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
            var session = _session || self.session;

            if (self.dontAttachStream)
                return callback();

            if (isData(session) || (!self.isInitiator && session.oneway)) {
                self.attachStreams = [];
                return callback();
            }

            var constraints = {
                audio: !!session.audio,
                video: !!session.video
            };
            var screen_constraints = {
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'screen'
                    },
                    optional: []
                }
            };

            if (session.screen)
                _captureUserMedia(screen_constraints, function() {
                    _captureUserMedia(constraints, callback);
                });
            else _captureUserMedia(constraints, callback, session.audio && !session.video);

            function _captureUserMedia(forcedConstraints, forcedCallback, isRemoveVideoTracks) {
                var mediaConfig = {
                    onsuccess: function(stream, returnBack) {
                        if (returnBack) return forcedCallback && forcedCallback(stream);

                        if (isRemoveVideoTracks && !moz) {
                            stream = new webkitMediaStream(stream.getAudioTracks());
                        }

                        var mediaElement = getMediaElement(stream, session);
                        mediaElement.muted = true;

                        stream.onended = function() {
                            if (self.onstreamended)
                                self.onstreamended(streamedObject);
                        };

                        self.attachStreams.push(stream);
                        var streamid = self.token();

                        var streamedObject = {
                            stream: stream,
                            streamid: streamid,
                            mediaElement: mediaElement,
                            blobURL: mediaElement.mozSrcObject || mediaElement.src,
                            type: 'local'
                        };

                        self.onstream(streamedObject);

                        self.streams[streamid] = self._getStream({
                            stream: stream,
                            userid: self.userid,
                            type: 'local'
                        });

                        if (forcedCallback) forcedCallback(stream);
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
                    },
                    mediaConstraints: self.mediaConstraints || { }
                };

                mediaConfig.constraints = forcedConstraints || constraints;
                getUserMedia(mediaConfig);
            }
        }

        this.captureUserMedia = captureUserMedia;

        this.leave = this.eject = function(userid) {
            rtcSession.leave(userid);
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

        var participants = { },
            isbroadcaster,
            isAcceptNewSession = true;

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
                isofferer = _config.isofferer, peer;

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
                    var mediaElement = getMediaElement(stream, session);

                    _config.stream = stream;
                    if (mediaElement.tagName.toLowerCase() == 'audio')
                        mediaElement.addEventListener('play', function() {
                            setTimeout(function() {
                                mediaElement.muted = false;
                                mediaElement.volume = 1;
                                afterRemoteStreamStartedFlowing(mediaElement);
                            }, 3000);
                        }, false);
                    else
                        afterRemoteStreamStartedFlowing(mediaElement);
                },

                onclose: function(e) {
                    e.extra = _config.extra;
                    e.userid = _config.userid;
                    root.onclose(e);

                    // suggested in #71 by "efaj"
                    if (root.channels[e.userid])
                        delete root.channels[e.userid];
                },
                onerror: function(e) {
                    e.extra = _config.extra;
                    e.userid = _config.userid;
                    root.onerror(e);
                },

                attachStreams: root.attachStreams,
                iceServers: root.iceServers,
                bandwidth: root.bandwidth,
                sdpConstraints: root.sdpConstraints || { }
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

            function afterRemoteStreamStartedFlowing(mediaElement) {
                _config.stream.onended = function() {
                    root.onstreamended(streamedObject);
                };

                var streamid = root.token();

                _config.stream.onended = function() {
                    if (root.onstreamended)
                        root.onstreamended(streamedObject);
                };

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
                    socket: socket,
                    type: 'remote'
                });

                onSessionOpened();
            }

            function onChannelOpened(channel) {
                _config.channel = channel;

                // connection.channels['user-id'].send(data);				
                root.channels[_config.userid] = {
                    channel: _config.channel,
                    send: function(data) {
                        root.send(data, this.channel);
                    }
                };
				
                root.onopen({
                    extra: _config.extra,
                    userid: _config.userid
                });

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
                if (!session.oneway && !session.broadcast && isbroadcaster && getLength(participants) > 1 && getLength(participants) <= root.maxParticipantsAllowed) {
                    defaultSocket.send({
                        newParticipant: socket.channel,
                        userid: self.userid,
                        extra: _config.extra || { }
                    });
                }
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

                    if (participants[response.userid]) delete participants[response.userid];

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

                session = _config.renegotiate;
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
            if (!channel || !!participants[channel] || channel == self.userid)
                return;

            participants[channel] = channel;

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
                        root.session = session = response.session;
                        config.onNewSession(response);
                    }
                    if (response.newParticipant && self.joinedARoom && self.broadcasterid === response.userid)
                        onNewParticipant(response.newParticipant, response.extra);
                    if (getLength(participants) < root.maxParticipantsAllowed && response.userid && response.targetUser == self.userid && response.participant && !participants[response.userid]) {
                        participants[response.userid] = response.userid;
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
            this.isOwnerLeaving = isAcceptNewSession = false;
            (function transmit() {
                if (getLength(participants) < root.maxParticipantsAllowed) {
                    defaultSocket && defaultSocket.send({
                        sessionid: self.sessionid,
                        userid: self.userid,
                        session: session,
                        extra: root.extra
                    });
                }

                if (!root.transmitRoomOnce && !that.isOwnerLeaving)
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
            var data;

            if (moz && message.file)
                data = message.file;
            else
                data = JSON.stringify(message);

            if (_channel)
                _channel.send(data);
            else
                for (_channel in root.channels)
                    root.channels[_channel].channel.send(data);
        };

        this.leave = function(userid) {
            clearSession(userid);

            if (!userid) {
                self.userid = root.userid = root.token();
                root.joinedARoom = self.joinedARoom = isbroadcaster = false;
                isAcceptNewSession = true;
            }

            if (isbroadcaster) {
                this.isOwnerLeaving = true;
                root.isInitiator = false;
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

    function getRandomString() {
        return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
    }

    var FileSender = {
        send: function(config) {
            var channel = config.channel,
                _channel = config._channel,
                file = config.file;

            /* if firefox nightly: share file blob directly */
            if (moz) {
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

            var packetSize = 1000,
                textToTransfer = '',
                numberOfPackets = 0,
                packets = 0;

            // uuid is used to uniquely identify sending instance
            var uuid = getRandomString();

            /* if chrome */
            if (!moz) {
                var reader = new window.FileReader();
                reader.readAsDataURL(file);
                reader.onload = onReadAsDataURL;
            }

            function onReadAsDataURL(event, text) {
                var data = {
                    type: 'file',
                    uuid: uuid
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
                    }, uuid);

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
                    setTimeout(function() {
                        onReadAsDataURL(null, textToTransfer);
                    }, 500);
            }
        }
    };

    function FileReceiver() {
        var content = { },
            fileName = '',
            packets = { },
            numberOfPackets = { };

        function receive(data, config) {
            // uuid is used to uniquely identify sending instance
            var uuid = data.uuid;

            /* if firefox nightly & file blob shared */
            if (moz) {
                if (data.fileName) fileName = data.fileName;
                if (data.size) {
                    var reader = new window.FileReader();
                    reader.readAsDataURL(data);
                    reader.onload = function(event) {
                        FileSaver.SaveToDisk(event.target.result, fileName);
                        if (config.onFileReceived) config.onFileReceived(fileName);
                    };
                }
            }

            if (!moz) {
                if (data.packets) numberOfPackets[uuid] = packets[uuid] = parseInt(data.packets);

                if (config.onFileProgress)
                    config.onFileProgress({
                        remaining: packets[uuid]--,
                        length: numberOfPackets[uuid],
                        received: numberOfPackets[uuid] - packets[uuid]
                    }, uuid);

                if (!content[uuid]) content[uuid] = [];

                content[uuid].push(data.message);

                if (data.last) {
                    FileSaver.SaveToDisk(content[uuid].join(''), data.name);
                    if (config.onFileReceived) config.onFileReceived(data.name);
                    delete content[uuid];
                }
            }
        }

        return {
            receive: receive
        };
    }

    var FileSaver = {
        SaveToDisk: function(fileUrl, fileName) {
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
        send: function(config) {
            var channel = config.channel,
                _channel = config._channel,
                initialText = config.text,
                packetSize = 1000 /* chars */,
                textToTransfer = '',
                isobject = false;

            if (typeof initialText !== 'string') {
                isobject = true;
                initialText = JSON.stringify(initialText);
            }

            // uuid is used to uniquely identify sending instance
            var uuid = getRandomString();
            var sendingTime = new Date().getTime();

            if (moz) channel.send(config.text, _channel);
            else sendText(initialText);

            function sendText(textMessage, text) {
                var data = {
                    type: 'text',
                    uuid: uuid,
                    sendingTime: sendingTime
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
                    setTimeout(function() {
                        sendText(null, textToTransfer);
                    }, 500);
            }
        }
    };

    function TextReceiver() {
        var content = { };

        function receive(data, onmessage, userid, extra) {
            // uuid is used to uniquely identify sending instance
            var uuid = data.uuid;
            if (!content[uuid]) content[uuid] = [];

            content[uuid].push(data.message);
            if (data.last) {
                var message = content[uuid].join('');
                if (data.isobject) message = JSON.parse(message);

                // latency detection
                var receivingTime = new Date().getTime();
                var latency = receivingTime - data.sendingTime;

                if (onmessage)
                    onmessage({
                        data: message,
                        userid: userid,
                        extra: extra,
                        latency: latency
                    });

                delete content[uuid];
            }
        }

        return {
            receive: receive
        };
    }

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

        if (options.attachStreams && options.attachStreams.length) {
            var streams = options.attachStreams;
            for (var i = 0; i < streams.length; i++) {
                peer.addStream(streams[i]);
            }
        }

        peer.onaddstream = function(event) {
            log('on:add:stream', event.stream);

            if (!event || !options.onstream) return;

            options.onstream(event.stream);
            options.renegotiate = false;
        };

        var constraints;

        function setConstraints() {
            var session = options.session;

            var sdpConstraints = options.sdpConstraints;
            constraints = options.constraints || {
                optional: [],
                mandatory: {
                    OfferToReceiveAudio: !!session.audio,
                    OfferToReceiveVideo: !!session.video || !!session.screen
                }
            };

            if (sdpConstraints.mandatory)
                constraints.mandatory = merge(constraints.mandatory, sdpConstraints.mandatory);

            if (sdpConstraints.optional)
                constraints.optional[0] = merge({ }, sdpConstraints.optional);
        }

        setConstraints();

        function createOffer() {
            if (!options.onOfferSDP)
                return;

            peer.createOffer(function(sessionDescription) {
                sessionDescription.sdp = serializeSdp(sessionDescription.sdp);
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
                sessionDescription.sdp = serializeSdp(sessionDescription.sdp);
                peer.setLocalDescription(sessionDescription);
                options.onAnswerSDP(sessionDescription);
            }, null, constraints);
        }

        if ((options.onmessage && !moz) || !options.onmessage) {
            createOffer();
            createAnswer();
        }

        var bandwidth = options.bandwidth || { };

        function setBandwidth(sdp) {
            // remove existing bandwidth lines
            sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');

            sdp = sdp.replace( /a=mid:audio\r\n/g , 'a=mid:audio\r\nb=AS:' + (bandwidth.audio || 50) + '\r\n');
            sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\nb=AS:' + (bandwidth.video || 256) + '\r\n');
            sdp = sdp.replace( /a=mid:data\r\n/g , 'a=mid:data\r\nb=AS:' + (bandwidth.data || 1638400) + '\r\n');

            return sdp;
        }

        // var bitrate = options.bitrate || {};

        function setBitrate(sdp) {
            // sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\na=rtpmap:120 VP8/90000\r\na=fmtp:120 x-google-min-bitrate=' + (bitrate || 10) + '\r\n');
            return sdp;
        }

        var framerate = options.framerate || { };

        function setFramerate(sdp) {
            sdp = sdp.replace('a=fmtp:111 minptime=10', 'a=fmtp:111 minptime=' + (framerate.minptime || 10));
            sdp = sdp.replace('a=maxptime:60', 'a=maxptime:' + (framerate.maxptime || 60));
            return sdp;
        }

        function getInteropSDP(sdp) {
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
                extractedChars = '';

            function getChars() {
                extractedChars += chars[parseInt(Math.random() * 40)] || '';
                if (extractedChars.length < 40)
                    getChars();

                return extractedChars;
            }

            // for audio-only streaming: multiple-crypto lines are not allowed
            if (options.onAnswerSDP)
                sdp = sdp.replace( /(a=crypto:0 AES_CM_128_HMAC_SHA1_32)(.*?)(\r\n)/g , '');

            var inline = getChars() + '\r\n' + (extractedChars = '');
            sdp = sdp.indexOf('a=crypto') == -1 ? sdp.replace( /c=IN/g ,
                'a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:' + inline +
                    'c=IN') : sdp;

            return sdp;
        }

        function serializeSdp(sdp) {
            if (moz) return sdp;
            sdp = setBandwidth(sdp);
            sdp = setFramerate(sdp);
            sdp = setBitrate(sdp);
            sdp = getInteropSDP(sdp);
            return sdp;
        }

        var channel;

        function openOffererChannel() {
            if (!options.onmessage || (moz && !options.onOfferSDP))
                return;

            _openOffererChannel();

            if (moz) {
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

            if (moz) {
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

        // http://tools.ietf.org/html/draft-alvestrand-constraints-resolution-00
        var mediaConstraints = options.mediaConstraints || { };
        var n = navigator,
            resourcesNeeded = options.constraints || {
                audio: true,
                video: video_constraints
            };

        if (resourcesNeeded.video == true) resourcesNeeded.video = video_constraints;

        // connection.mediaConstraints.audio = false;
        if (typeof mediaConstraints.audio != 'undefined')
            resourcesNeeded.audio = mediaConstraints.audio;

        // connection.mediaConstraints.mandatory = {minFrameRate:10};
        if (mediaConstraints.mandatory)
            resourcesNeeded.video.mandatory = merge(resourcesNeeded.video.mandatory, mediaConstraints.mandatory);

        // mediaConstraints.optional.bandwidth = 10000;
        if (mediaConstraints.optional)
            resourcesNeeded.video.optional[0] = merge({ }, mediaConstraints.optional);

        log('resources-needed:', JSON.stringify(resourcesNeeded, null, '\t'));

        // easy way to match 
        var idInstance = JSON.stringify(resourcesNeeded);

        function streaming(stream, returnBack) {
            var video = options.video;
            if (video) {
                video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
                video.play();
            }

            options.onsuccess(stream, returnBack);
            currentUserMediaRequest.streams[idInstance] = stream;
            currentUserMediaRequest.mutex = false;
            if (currentUserMediaRequest.queueRequests.length)
                getUserMedia(currentUserMediaRequest.queueRequests.shift());
        }

        if (currentUserMediaRequest.streams[idInstance]) {
            streaming(currentUserMediaRequest.streams[idInstance], true);
        } else {
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

        self.streams = {
            mute: function(session) {
                this._private(session, true);
            },
            unmute: function(session) {
                this._private(session, false);
            },
            _private: function(session, enabled) {
                // implementation from #68
                for (var stream in this) {
                    if (stream != 'mute' && stream != 'unmute' && stream != '_private') {
                        var root = this[stream];
                        muteOrUnmute({
                            root: root,
                            session: session,
                            stream: root.stream,
                            enabled: enabled
                        });
                    }
                }
            }
        };
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

        self.mediaConstraints = { };
        self.sdpConstraints = { };

        self.attachStreams = [];

        self.maxParticipantsAllowed = 10;

        self._getStream = function(e) {
            return {
                stream: e.stream,
                userid: e.userid,
                socket: e.socket,
                type: e.type,
                stop: function() {
                    var stream = this.stream;
                    if (stream && stream.stop)
                        stream.stop();
                },
                mute: function(session) {
                    this._private(session, true);
                },
                unmute: function(session) {
                    this._private(session, false);
                },
                _private: function(session, enabled) {
                    muteOrUnmute({
                        root: this,
                        session: session,
                        enabled: enabled,
                        stream: this.stream
                    });
                }
            };
        };

        self.token = function() {
            return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
        };
    }

    function muteOrUnmute(e) {
        var stream = e.stream,
            root = e.root,
            session = e.session || { },
            enabled = e.enabled;

        if (!session.audio && !session.video) {
            session = merge(session, {
                audio: true,
                video: true
            });
        }

        // implementation from #68
        if (session.type) {
            if (session.type == 'remote' && root.type != 'remote') return;
            if (session.type == 'local' && root.type != 'local') return;
        }

        console.log('session', JSON.stringify(session, null, '\t'));

        // enable/disable audio/video tracks

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

        // socket message to change media element look
        if (root.socket)
            root.socket.send({
                userid: root.userid,
                mute: !!enabled,
                unmute: !enabled
            });
    }

    function getLength(obj) {
        var length = 0;
        for (var o in obj) length++;
        return length;
    }

    // Get HTMLAudioElement/HTMLVideoElement accordingly

    function getMediaElement(stream, session) {
        var isAudio = session.audio && !session.video && !session.screen;
        if (!moz && stream.getAudioTracks && stream.getVideoTracks) {
            isAudio = stream.getAudioTracks().length && !stream.getVideoTracks().length;
        }

        var mediaElement = document.createElement(isAudio ? 'audio' : 'video');
        mediaElement[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
        mediaElement.autoplay = true;
        mediaElement.controls = true;
        mediaElement.play();
        return mediaElement;
    }

    function merge(mergein, mergeto) {
        for (var item in mergeto) {
            mergein[item] = mergeto[item];
        }
        return mergein;
    }
})();
