// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - www.RTCMultiConnection.org

// _______________________
// RTCMultiConnection-v1.4

(function() {
    window.RTCMultiConnection = function(channel) {
        this.channel = channel || location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');

        this.open = function(_channel) {
            self.joinedARoom = true;

            if (_channel)
                self.channel = _channel;

            self.isInitiator = true;

            prepareInit(function() {
                init();
                captureUserMedia(rtcSession.initSession);
            });
        };

        // check pre-opened connections
        this.connect = function(_channel) {
            if (_channel)
                self.channel = _channel;

            prepareInit(init);
        };

        // join a session
        this.join = joinSession;

        // send file/data or /text
        this.send = function(data, _channel) {
            if (!data)
                throw 'No file, data or text message to share.';

            if (!!data.forEach) {
                for (var i = 0; i < data.length; i++) {
                    self.send(data[i], _channel);
                }
                return;
            }

            if (data.size) {
                FileSender.send({
                    file: data,
                    channel: rtcSession,
                    _channel: _channel,
                    root: self
                });
            } else
                TextSender.send({
                    text: data,
                    channel: rtcSession,
                    _channel: _channel,
                    preferSCTP: self.preferSCTP
                });
        };

        var self = this,
            rtcSession, fileReceiver, textReceiver;

        // verify openSignalingChannel method's presence

        function prepareInit(callback) {
            if (!self.openSignalingChannel) {
                // https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs
                // https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs
                self.openSignalingChannel = function(config) {
                    config.channel = config.channel || self.channel || location.hash.substr(1);
                    var websocket = new WebSocket('wss://www.webrtc-experiment.com:8563');
                    websocket.channel = config.channel;
                    websocket.onopen = function() {
                        websocket.push(JSON.stringify({
                            open: true,
                            channel: config.channel
                        }));
                        if (config.callback) config.callback(websocket);
                    };

                    websocket.onmessage = function(event) {
                        config.onmessage(JSON.parse(event.data));
                    };
                    websocket.push = websocket.send;
                    websocket.send = function(data) {
                        if (websocket.readyState != 1)
                            return setTimeout(function() {
                                websocket.send(data);
                            }, 500);

                        websocket.push(JSON.stringify({
                            data: data,
                            channel: config.channel
                        }));
                    };
                };
                callback();
            } else
                callback();
        }

        // set config passed over RTCMultiSession

        function init() {
            if (self.config)
                return;

            self.config = {
                onNewSession: function(session) {
                    if (!rtcSession) {
                        self._session = session;
                        return;
                    }

                    if (self.onNewSession)
                        return self.onNewSession(session);

                    if (self.joinedARoom) return;

                    self.joinedARoom = true;

                    return joinSession(session);
                },
                onmessage: function(e) {
                    if (!e.data.size)
                        e.data = JSON.parse(e.data);

                    if (e.data.type === 'text')
                        textReceiver.receive(e.data, self.onmessage, e.userid, e.extra);

                    else if (e.data.maxChunks)
                        fileReceiver.receive(e.data);
                    else
                        self.onmessage(e);
                }
            };
            rtcSession = new RTCMultiSession(self);
            fileReceiver = new FileReceiver(self);
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

        // capture user's media resources

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

            if (session.screen) {
                _captureUserMedia(screen_constraints, constraints.audio || constraints.video ? function() {
                    _captureUserMedia(constraints, callback);
                } : callback);
            } else _captureUserMedia(constraints, callback, session.audio && !session.video);

            function _captureUserMedia(forcedConstraints, forcedCallback, isRemoveVideoTracks) {
                var mediaConfig = {
                    onsuccess: function(stream, returnBack) {
                        if (returnBack) return forcedCallback && forcedCallback(stream);

                        if (isRemoveVideoTracks && !moz) {
                            stream = new window.webkitMediaStream(stream.getAudioTracks());
                        }

                        var mediaElement = getMediaElement(stream, session);
                        mediaElement.muted = true;

                        stream.onended = function() {
                            if (self.onstreamended)
                                self.onstreamended(streamedObject);
                            else if (mediaElement.parentNode)
                                mediaElement.parentNode.removeChild(mediaElement);
                        };

                        var streamedObject = {
                            stream: stream,
                            streamid: stream.label,
                            mediaElement: mediaElement,
                            blobURL: mediaElement.mozSrcObject || mediaElement.src,
                            type: 'local',
                            userid: self.userid || 'self',
                            extra: self.extra
                        };

                        var sObject = {
                            stream: stream,
                            userid: self.userid,
                            type: 'local',
                            streamObject: streamedObject,
                            mediaElement: mediaElement
                        };

                        self.attachStreams.push(stream);
                        self.__attachStreams.push(sObject);

                        self.streams[stream.label] = self._getStream(sObject);

                        self.onstream(streamedObject);
                        if (forcedCallback) forcedCallback(stream);
                    },
                    onerror: function() {
                        var error;

                        if (session.audio && !session.video)
                            error = 'Microphone access is denied.';
                        else if (session.screen) {
                            if (location.protocol === 'http:')
                                error = '<https> is mandatory to capture screen.';
                            else
                                error = 'Multi-capturing of screen is not allowed. Capturing process is denied. Are you enabled flag: "Enable screen capture support in getUserMedia"?';
                        } else
                            error = 'Webcam access is denied.';

                        if (!self.onMediaError) throw error;

                        self.onMediaError(error);
                    },
                    mediaConstraints: self.mediaConstraints || { }
                };

                mediaConfig.constraints = forcedConstraints || constraints;
                mediaConfig.media = self.media;
                getUserMedia(mediaConfig);
            }
        }

        this.captureUserMedia = captureUserMedia;

        // eject a user; or leave the session
        this.leave = this.eject = function(userid) {
            rtcSession.leave(userid);

            if (!userid) {
                var streams = self.attachStreams;
                for (var i = 0; i < streams.length; i++) {
                    streams[i].stop();
                }
                currentUserMediaRequest.streams = [];
                self.attachStreams = [];
            }
        };

        // close entire session
        this.close = function() {
            self.autoCloseEntireSession = true;
            rtcSession.leave();
        };

        // renegotiate new media stream
        this.addStream = function(session, socket) {
            captureUserMedia(function(stream) {
                rtcSession.addStream({
                    stream: stream,
                    renegotiate: session,
                    socket: socket
                });
            }, session);
        };

        // detach pre-attached streams
        this.removeStream = function(streamid) {
            if (!this.streams[streamid]) return console.warn('No such stream exists. Stream-id:', streamid);
            this.detachStreams.push(streamid);
        };

        // set RTCMultiConnection defaults on constructor invocation
        this.setDefaults();

        this.__attachStreams = [];
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

                    for (var i = 0; i < root.__attachStreams.length; i++) {
                        var label = root.__attachStreams[i].stream.label;
                        if (root.streams[label]) root.streams[label].socket = socket;
                    }
                    root.__attachStreams = [];
                }
            };

            socketConfig.callback = function(_socket) {
                socket = _socket;
                socketConfig.onopen();
            };

            var socket = root.openSignalingChannel(socketConfig),
                isofferer = _config.isofferer,
                peer;

            var peerConfig = {
                onopen: onChannelOpened,
                onICE: function(candidate) {
                    if (!root.candidates) throw 'ICE candidates are mandatory.';
                    if (!root.candidates.host && candidate.candidate.indexOf('typ host') != -1) return;
                    if (!root.candidates.relay && candidate.candidate.indexOf('relay') != -1) return;
                    if (!root.candidates.reflexive && candidate.candidate.indexOf('srflx') != -1) return;

                    log(candidate.candidate);
                    socket && socket.send({
                        userid: self.userid,
                        candidate: {
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            candidate: JSON.stringify(candidate.candidate)
                        }
                    });
                },
                onmessage: function(data) {
                    config.onmessage({
                        data: data,
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
                                afterRemoteStreamStartedFlowing(mediaElement);
                            }, 3000);
                        }, false);
                    else
                        waitUntilRemoteStreamStartsFlowing(mediaElement);
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
                sdpConstraints: root.sdpConstraints || { },
                disableDtlsSrtp: root.disableDtlsSrtp,
                preferSCTP: !!root.preferSCTP
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

                if (!session.data) peerConfig.onmessage = null;
                peerConfig.session = session;
                peer = new RTCPeerConnection(peerConfig);
            }

            function waitUntilRemoteStreamStartsFlowing(mediaElement) {
                if (!(mediaElement.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA
                    || mediaElement.paused || mediaElement.currentTime <= 0)) {
                    afterRemoteStreamStartedFlowing(mediaElement);
                } else
                    setTimeout(function() {
                        waitUntilRemoteStreamStartsFlowing(mediaElement);
                    }, 50);
            }

            function afterRemoteStreamStartedFlowing(mediaElement) {
                (function setVolume() {
                    mediaElement.volume += .1;
                    if (mediaElement.volume < .9) setTimeout(setVolume, 600);
                    else mediaElement.volume = 1;
                })();

                var stream = _config.stream;
                stream.onended = function() {
                    if (root.onstreamended)
                        root.onstreamended(streamedObject);
                    else if (mediaElement.parentNode)
                        mediaElement.parentNode.removeChild(mediaElement);
                };

                var streamedObject = {
                    mediaElement: mediaElement,

                    stream: stream,
                    streamid: stream.label,
                    session: session,

                    blobURL: mediaElement.mozSrcObject || mediaElement.src,
                    type: 'remote',

                    extra: _config.extra,
                    userid: _config.userid
                };

                // connection.streams['stream-id'].mute({audio:true})
                root.streams[stream.label] = root._getStream({
                    stream: stream,
                    userid: _config.userid,
                    socket: socket,
                    type: 'remote',
                    streamObject: streamedObject,
                    mediaElement: mediaElement
                });

                root.onstream(streamedObject);

                onSessionOpened();

                // mic/speaker activity detection
                // voiceActivityDetection(peer.connection);
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

                // fetch files from file-queue
                for (var q in root.fileQueue) {
                    root.send(root.fileQueue[q], channel);
                }

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
                    addStream: function(session00) {
                        root.addStream(session00, this.socket);
                    }
                };
            }

            function onSessionOpened() {
                // admin/guest is one-to-one relationship
                if (root.userType && !root.session['many-to-many']) return;

                // original conferencing infrastructure!
                if (!session.oneway && !session.broadcast && isbroadcaster && getLength(participants) > 1 && getLength(participants) <= root.maxParticipantsAllowed) {
                    defaultSocket.send({
                        newParticipant: _config.userid || socket.channel,
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

                    sdpInvoker(response.sdp, response.labels);
                }

                if (response.candidate) {
                    peer && peer.addICE({
                        sdpMLineIndex: response.candidate.sdpMLineIndex,
                        candidate: JSON.parse(response.candidate.candidate)
                    });
                }

                if (response.mute || response.unmute) {
                    response.mediaElement = root.streams[response.streamid].mediaElement;

                    if (response.mute && root.onmute) root.onmute(response);
                    if (response.unmute && root.onunmute) root.onunmute(response);
                }

                if (response.left) {
                    if (peer && peer.connection) {
                        peer.connection.close();
                        peer.connection = null;

                        // firefox is unable to stop remote streams
                        // firefox doesn't auto stop streams when peer.close() is called.
                        if (moz) {
                            var userLeft = response.userid;
                            for (var stream in root.streams) {
                                stream = root.streams[stream];
                                if (stream.userid == userLeft) {
                                    stream.stop();
                                    stream.stream.onended(stream.streamObject);
                                }
                            }
                        }
                    }

                    if (response.closeEntireSession) {
                        root.leave();
							
                    } else if (socket) {
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

                    if (root.userType) root.busy = false;
                }

                // keeping session active even if initiator leaves
                if (response.playRoleOfBroadcaster)
                    setTimeout(function() {
                        root.dontAttachStream = true;
                        self.userid = response.userid;
                        root.open({
                            extra: root.extra
                        });
                        sockets = swap(sockets);
                        root.dontAttachStream = false;
                    }, 600);

                // if renegotiation process initiated by answerer
                if (response.suggestRenegotiation) {
                    renegotiate = response.renegotiate;

                    // detaching old streams
                    detachMediaStream(root.detachStreams, peer.connection);

                    if (isData(renegotiate))
                        createOffer();
                    else
                        root.captureUserMedia(function(stream00) {
                            peer.connection.addStream(stream00);
                            createOffer();
                        }, renegotiate);

                    function createOffer() {
                        peer.recreateOffer(renegotiate, function(sdp) {
                            sendsdp({
                                sdp: sdp,
                                socket: socket,
                                renegotiate: response.renegotiate,
                                labels: root.detachStreams
                            });
                            root.detachStreams = [];
                        });
                    }
                }
            }

            function sdpInvoker(sdp, labels) {
                log(sdp.sdp);

                if (isofferer)
                    return peer.addAnswerSDP(sdp);
                if (!_config.renegotiate)
                    return initPeer(sdp);

                session = _config.renegotiate;
                // detach streams
                detachMediaStream(labels, peer.connection);

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

        function detachMediaStream(labels, peer) {
            for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                if (root.streams[label]) {
                    var stream = root.streams[label].stream;
                    stream.stop();
                    peer.removeStream(stream);
                }
            }
        }

        function sendsdp(e) {
            e.socket.send({
                userid: self.userid,
                sdp: e.sdp,
                extra: root.extra,
                renegotiate: e.renegotiate ? e.renegotiate : false,
                labels: e.labels || []
            });
        }

        // sharing new user with existing participants

        function onNewParticipant(channel, extra) {
            if (!channel || !!participants[channel] || channel == self.userid)
                return;

            participants[channel] = channel;

            var new_channel = root.token();
            newPrivateSocket({
                channel: new_channel,
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

        // if a user leaves

        function clearSession(channel) {
            var alert = {
                left: true,
                extra: root.extra,
                userid: self.userid,
                sessionid: self.sessionid
            };

            if (isbroadcaster) {
                if (root.autoCloseEntireSession) {
                    alert.closeEntireSession = true;
                } else if (sockets[0]) {
                    sockets[0].send({
                        playRoleOfBroadcaster: true,
                        userid: self.userid
                    });
                }
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

            sockets = swap(sockets);
        }

        window.onbeforeunload = function() {
            clearSession();
        };

        window.onkeyup = function(e) {
            if (e.keyCode == 116)
                clearSession();
        };

        function initDefaultSocket() {
            defaultSocket = root.openSignalingChannel({
                onmessage: function(response) {
                    if (response.userid == self.userid) return;

                    if (isAcceptNewSession && response.sessionid && response.userid) {
                        root.session = session = response.session;
                        config.onNewSession(response);
                    }
                    if (response.newParticipant && self.joinedARoom && self.broadcasterid === response.userid)
                        onNewParticipant(response.newParticipant, response.extra);

                    if (getLength(participants) < root.maxParticipantsAllowed && response.userid && response.targetUser == self.userid && response.participant && !participants[response.userid]) {
                        acceptRequest(response.channel || response.userid, response.extra, response.userid);
                    }

                    if (response.userType && response.userType != root.userType) {
                        if (!root.busy) {
                            if (response.userType == 'admin') {
                                if (root.onAdmin) root.onAdmin(response);
                                else root.accept(response.userid);
                            }
                            if (response.userType == 'guest') {
                                if (root.onGuest) root.onGuest(response);
                                else root.accept(response.userid);
                            }
                        } else {
                            if (response.userType != root.userType) {
                                defaultSocket.send({
                                    rejectedRequestOf: response.userid,
                                    userid: self.userid,
                                    extra: root.extra || { }
                                });
                            }
                        }
                    }

                    if (response.acceptedRequestOf == self.userid) {
                        if (root.onstats) root.onstats('accepted', response);
                    }

                    if (response.rejectedRequestOf == self.userid) {
                        if (root.onstats) root.onstats('busy', response);
                        sendRequest();
                    }
                },
                callback: function(socket) {
                    defaultSocket = socket;
                    if (root.userType) sendRequest();
                }
            });
        }

        var that = this, defaultSocket;

        initDefaultSocket();

        function sendRequest() {
            defaultSocket.send({
                userType: root.userType,
                userid: root.userid,
                extra: root.extra || { }
            });
        }

        function setDirections() {
            if (root.direction == 'one-way') root.session.oneway = true;
            if (root.direction == 'one-to-one') root.maxParticipantsAllowed = 1;
            if (root.direction == 'one-to-many') root.session.broadcast = true;
            if (root.direction == 'many-to-many') {
                root.maxParticipantsAllowed = 256;
            }
        }

        // open new session
        this.initSession = function() {
            that.isOwnerLeaving = false;
            root.isInitiator = true;

            setDirections();
            session = root.session;

            isbroadcaster = true;
            participants = { };

            self.sessionid = root.sessionid || root.channel;

            this.isOwnerLeaving = isAcceptNewSession = false;

            (function transmit() {
                if (getLength(participants) < root.maxParticipantsAllowed && !that.isOwnerLeaving) {
                    defaultSocket && defaultSocket.send({
                        sessionid: self.sessionid,
                        userid: root.userid,
                        session: session,
                        extra: root.extra
                    });
                }

                if (!root.transmitRoomOnce && !that.isOwnerLeaving)
                    setTimeout(transmit, root.interval || 3000);
            })();
        };

        // join existing session
        this.joinSession = function(_config) {
            _config = _config || { };

            participants = { };

            session = _config.session;

            self.joinedARoom = true;
            self.broadcasterid = _config.userid;

            if (_config.sessionid)
                self.sessionid = _config.sessionid;

            isAcceptNewSession = false;

            var channel = getRandomString();
            newPrivateSocket({
                channel: channel,
                extra: root.extra
            });

            defaultSocket.send({
                participant: true,
                userid: self.userid,
                channel: channel,
                targetUser: _config.userid,
                extra: root.extra
            });
        };

        // send file/data or text message
        this.send = function(message, _channel) {
            message = JSON.stringify(message);

            if (_channel) {
                if (_channel.readyState == 'open') {
                    _channel.send(message);
                }
                return;
            }

            for (var dataChannel in root.channels) {
                var channel = root.channels[dataChannel].channel;
                if (channel.readyState == 'open') {
                    channel.send(message);
                }
            }
        };

        // leave session
        this.leave = function(userid) {
            clearSession(userid);

            if (isbroadcaster) {
                that.isOwnerLeaving = true;
                root.isInitiator = false;
            }

            // to stop/remove self streams
            for (var i = 0; i < root.attachStreams.length; i++) {
                root.attachStreams[i].stop();
            }
            root.attachStreams = [];

            // to allow capturing of identical streams
            currentUserMediaRequest = {
                streams: [],
                mutex: false,
                queueRequests: []
            };

            if (!userid) {
                // self.userid = root.userid = root.token();
                root.joinedARoom = self.joinedARoom = isbroadcaster = false;
                isAcceptNewSession = true;
            }

            root.busy = false;
        };

        // renegotiate new stream
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
                if (peer && peer.connection.localDescription.type == 'offer') {
                    // detaching old streams
                    detachMediaStream(root.detachStreams, peer.connection);

                    if (session.audio || session.video || session.screen)
                        peer.connection.addStream(e.stream);

                    peer.recreateOffer(session, function(sdp) {
                        sendsdp({
                            sdp: sdp,
                            socket: socket,
                            renegotiate: session,
                            labels: root.detachStreams
                        });
                        root.detachStreams = [];
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

        root.request = function(userid) {
            if (!root.session['many-to-many']) root.busy = true;

            root.captureUserMedia(function() {
                // open private socket that will be used to receive offer-sdp
                newPrivateSocket({
                    channel: self.userid,
                    extra: root.extra || { }
                });

                // ask other user to create offer-sdp
                defaultSocket.send({
                    participant: true,
                    userid: self.userid,
                    extra: root.extra || { },
                    targetUser: userid
                });
            });
        };

        function acceptRequest(channel, extra, userid) {
            if (root.busy) return;

            if (root.onRequest) root.onRequest(channel, extra, userid);
            else _accept(channel, extra, userid);
        }

        function _accept(channel, extra, userid) {
            if (root.userType) {
                if (!root.session['many-to-many']) root.busy = true;
                defaultSocket.send({
                    acceptedRequestOf: userid,
                    userid: self.userid,
                    extra: root.extra || { }
                });
            }

            participants[userid] = userid;
            newPrivateSocket({
                isofferer: true,
                userid: userid,
                channel: channel,
                extra: extra || { }
            });
        }

        root.accept = function(userid, extra) {
            root.captureUserMedia(function() {
                _accept(userid, extra);
            });
        };
    }

    function getRandomString() {
        return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
    }

    // _______
    // File.js

    var File = {
        Send: function(config) {
            var file = config.file;
            var socket = config.channel;

            var chunkSize = config.chunkSize || 40 * 1000; // 64k max sctp limit (AFAIK!)
            var sliceId = 0;
            var cacheSize = chunkSize;

            var chunksPerSlice = Math.floor(Math.min(100000000, cacheSize) / chunkSize);
            var sliceSize = chunksPerSlice * chunkSize;
            var maxChunks = Math.ceil(file.size / chunkSize);

            // uuid is used to uniquely identify sending instance
            var uuid = (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');

            socket.send({
                uuid: uuid,
                maxChunks: maxChunks,
                size: file.size,
                name: file.name,
                lastModifiedDate: file.lastModifiedDate,
                type: file.type,
                start: true
            }, config.extra);

            file.maxChunks = maxChunks;
            file.uuid = uuid;
            if (config.onBegin) config.onBegin(file);

            var blob, reader = new FileReader();
            reader.onloadend = function(evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    addChunks(file.name, evt.target.result, function() {
                        sliceId++;
                        if ((sliceId + 1) * sliceSize < file.size) {
                            blob = file.slice(sliceId * sliceSize, (sliceId + 1) * sliceSize);
                            reader.readAsArrayBuffer(blob);
                        } else if (sliceId * sliceSize < file.size) {
                            blob = file.slice(sliceId * sliceSize, file.size);
                            reader.readAsArrayBuffer(blob);
                        } else {
                            socket.send({
                                uuid: uuid,
                                maxChunks: maxChunks,
                                size: file.size,
                                name: file.name,
                                lastModifiedDate: file.lastModifiedDate,
                                type: file.type,
                                end: true
                            }, config.extra);

                            file.url = URL.createObjectURL(file);
                            if (config.onEnd) config.onEnd(file);
                        }
                    });
                }
            };

            blob = file.slice(sliceId * sliceSize, (sliceId + 1) * sliceSize);
            reader.readAsArrayBuffer(blob);

            var numOfChunksInSlice;
            var currentPosition = 0;
            var hasEntireFile;
            var chunks = [];

            function addChunks(fileName, binarySlice, callback) {
                numOfChunksInSlice = Math.ceil(binarySlice.byteLength / chunkSize);
                for (var i = 0; i < numOfChunksInSlice; i++) {
                    var start = i * chunkSize;
                    chunks[currentPosition] = binarySlice.slice(start, Math.min(start + chunkSize, binarySlice.byteLength));

                    FileConverter.ArrayBufferToDataURL(chunks[currentPosition], function(str) {
                        socket.send({
                            uuid: uuid,
                            value: str,
                            currentPosition: currentPosition,
                            maxChunks: maxChunks
                        }, config.extra);
                    });

                    currentPosition++;
                }

                if (config.onProgress) {
                    config.onProgress({
                        currentPosition: currentPosition,
                        maxChunks: maxChunks,
                        uuid: uuid
                    });
                }

                if (currentPosition == maxChunks) {
                    hasEntireFile = true;
                }

                if (config.interval == 0 || typeof config.interval == 'undefined')
                    callback();
                else
                    setTimeout(callback, config.interval);
            }
        },

        Receiver: function(config) {
            var packets = { };

            function receive(chunk) {
                if (chunk.start && !packets[chunk.uuid]) {
                    packets[chunk.uuid] = [];
                    if (config.onBegin) config.onBegin(chunk);
                }

                if (!chunk.end && chunk.value) packets[chunk.uuid].push(chunk.value);

                if (chunk.end) {
                    var _packets = packets[chunk.uuid];
                    var finalArray = [], length = _packets.length;

                    for (var i = 0; i < length; i++) {
                        if (!!_packets[i]) {
                            FileConverter.DataURLToBlob(_packets[i], function(buffer) {
                                finalArray.push(buffer);
                            });
                        }
                    }

                    var blob = new Blob(finalArray, { type: chunk.type });
                    blob = merge(blob, chunk);
                    blob.url = URL.createObjectURL(blob);
                    blob.uuid = chunk.uuid;

                    if (!blob.size) console.error('Something went wrong. Blob Size is 0.');

                    if (config.onEnd) config.onEnd(blob);
                }

                if (config.onProgress) config.onProgress(chunk);
            }

            return {
                receive: receive
            };
        },
        SaveToDisk: function(fileUrl, fileName) {
            var hyperlink = document.createElement('a');
            hyperlink.href = fileUrl;
            hyperlink.target = '_blank';
            hyperlink.download = fileName || fileUrl;

            var mouseEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });

            hyperlink.dispatchEvent(mouseEvent);
            (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
        }
    };

    // ________________
    // FileConverter.js
    var FileConverter = {
        ArrayBufferToDataURL: function(buffer, callback) {
            window.BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;

            // getting blob from array-buffer
            var blob = new Blob([buffer]);

            // reading file as binary-string
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                callback(e.target.result);
            };
            fileReader.readAsDataURL(blob);
        },
        DataURLToBlob: function(dataURL, callback) {
            var binary = atob(dataURL.substr(dataURL.indexOf(',') + 1)),
                i = binary.length,
                view = new Uint8Array(i);

            while (i--) {
                view[i] = binary.charCodeAt(i);
            }

            callback(new Blob([view]));
        }
    };

    // _____________
    // FileSender.js
    var FileSender = {
        send: function(config) {
            var root = config.root;

            var interval = 100;
            if (!root.preferSCTP && !moz) interval = 500;

            // using File.js to send files
            File.Send({
                channel: config.channel,
                extra: config._channel,
                file: config.file,
                interval: interval,
				chunkSize: config.preferSCTP ? 40 * 1000 : 1000, // 64k max sctp limit (AFAIK!)
                onProgress: function(file) {
                    if (root.onFileProgress) {
                        root.onFileProgress({
                        // old one; for backward compatibility
                            remaining: file.maxChunks - file.currentPosition,
                            length: file.maxChunks,
                            sent: file.currentPosition,

                            // NEW properties
                            maxChunks: file.maxChunks,
                            currentPosition: file.currentPosition,
                            uuid: file.uuid
                        }, file.uuid);
                    }
                },
                onBegin: root.onFileStart,
                onEnd: function(file) {
                    if (root.onFileSent) {
                        root.onFileSent(file, file.uuid);
                    }

                    if (!root.fileQueue[file.name])
                        root.fileQueue[file.name] = file;
                }
            });
        }
    };

    // _______________
    // FileReceiver.js

    function FileReceiver(root) {
        var receiver = new File.Receiver({
            onProgress: function(file) {
                if (root.onFileProgress) {
                    root.onFileProgress({
                    // old one; for backward compatibility
                        remaining: file.maxChunks - file.currentPosition,
                        length: file.maxChunks,
                        received: file.currentPosition,

                        // NEW properties
                        maxChunks: file.maxChunks,
                        currentPosition: file.currentPosition,
                        uuid: file.uuid
                    }, file.uuid);
                }
            },
            onBegin: root.onFileStart,
            onEnd: function(file) {
                if (root.autoSaveToDisk) {
                    File.SaveToDisk(file.dataURL, file.name);
                }

                if (root.onFileReceived) {
                    root.onFileReceived(file.name, file);
                }
            }
        });

        return {
            receive: function(data) {
                receiver.receive(data);
            }
        };
    }

    // _____________
    // TextSender.js
    var TextSender = {
        send: function(config) {
            var channel = config.channel,
                _channel = config._channel,
                initialText = config.text,
                packetSize = 1000,
                textToTransfer = '',
                isobject = false;

            if (typeof initialText !== 'string') {
                isobject = true;
                initialText = JSON.stringify(initialText);
            }

            // uuid is used to uniquely identify sending instance
            var uuid = getRandomString();
            var sendingTime = new Date().getTime();

            sendText(initialText);

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

                if (textToTransfer.length) {
                    if (config.preferSCTP || moz) {
                        setTimeout(function() {
                            sendText(null, textToTransfer);
                        }, 100);
                    } else
                        setTimeout(function() {
                            sendText(null, textToTransfer);
                        }, 500);
                }
            }
        }
    };

    // _______________
    // TextReceiver.js

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

        // protocol: 'text/chat', preset: true, stream: 16
        var dataChannelDict = { };

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

            if (options.disableDtlsSrtp)
                optional = {
                    optional: []
                };

            if (options.onmessage && !options.preferSCTP)
                optional.optional = [{
                    RtpDataChannels: true
                }];
        }

        // local/host candidates can also be used for peer connection
        if (!navigator.onLine) {
            iceServers = null;
            console.warn('No internet connection detected. No STUN/TURN server is used to make sure local/host candidates are used for peers connection.');
        } else log('iceServers', JSON.stringify(iceServers, null, '\t'));

        var peer = new PeerConnection(iceServers, optional);

        openOffererChannel();

        peer.onicecandidate = function(event) {
            if (event.candidate)
                options.onICE(event.candidate);
        };

        // adding media streams to the PeerConnection
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

        peer.onsignalingstatechange = function() {
            log('onsignalingstatechange:', toStr({
                iceGatheringState: peer.iceGatheringState,
                signalingState: peer.signalingState
            }));
        };
        peer.oniceconnectionstatechange = function() {
            log('oniceconnectionstatechange:', toStr({
                iceGatheringState: peer.iceGatheringState,
                signalingState: peer.signalingState
            }));
        };

        peer.onremoveStream = function(event) {
            log('on:remove:stream', event.stream);
        };

        peer.onconnecting = function(event) {
            log('on:connecting', event);
        };

        peer.onnegotiationneeded = function(event) {
            log('on:negotiation:needed', event);
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

            log('sdp constraints', JSON.stringify(constraints, null, '\t'));
        }

        setConstraints();

        function createOffer() {
            if (!options.onOfferSDP)
                return;

            peer.createOffer(function(sessionDescription) {
                sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
                peer.setLocalDescription(sessionDescription);
                options.onOfferSDP(sessionDescription);
            }, onSdpError, constraints);
        }

        function createAnswer() {
            if (!options.onAnswerSDP)
                return;

            options.offerSDP = new SessionDescription(options.offerSDP, onSdpSuccess, onSdpError);
            peer.setRemoteDescription(options.offerSDP);

            peer.createAnswer(function(sessionDescription) {
                sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
                peer.setLocalDescription(sessionDescription);
                options.onAnswerSDP(sessionDescription);
            }, onSdpError, constraints);
        }

        createOffer();
        createAnswer();
		
		if (options.preferSCTP || (options.onAnswerSDP && options.onmessage && moz))
            openAnswererChannel();

        var bandwidth = options.bandwidth;

        function setBandwidth(sdp) {
            if (!bandwidth) return;

            // remove existing bandwidth lines
            sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');

            if (bandwidth.audio) {
                sdp = sdp.replace( /a=mid:audio\r\n/g , 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
            }

            if (bandwidth.video) {
                sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\nb=AS:' + bandwidth.video + '\r\n');
            }

            if (bandwidth.data && !options.preferSCTP) {
                sdp = sdp.replace( /a=mid:data\r\n/g , 'a=mid:data\r\nb=AS:' + bandwidth.data + '\r\n');
            }

            return sdp;
        }

        var channel;

        function openOffererChannel() {
            if (!options.onmessage || (moz && !options.onOfferSDP))
                return;

            _openOffererChannel();

            if (!moz) return;
            navigator.mozGetUserMedia({
                    audio: true,
                    fake: true
                }, function(stream) {
                    peer.addStream(stream);
                }, useless);
        }

        function _openOffererChannel() {
            if (!options.preferSCTP) dataChannelDict.reliable = false;

            channel = peer.createDataChannel(options.channel || 'data-channel', dataChannelDict);
            setChannelEvents();
        }

        function setChannelEvents() {
            channel.onmessage = function(event) {
                options.onmessage(event.data);
            };
            channel.onopen = function() {
                options.onopen(channel);
            };

            channel.onerror = function(e) {
                options.onerror(e);
            };

            channel.onclose = function(e) {
                options.onclose(e);
            };

            channel.push = channel.send;
            channel.send = function(data) {
                try {
                    channel.push(data);
                } catch(e) {
                    setTimeout(function() {
                        channel.send(data);
                    }, 1);
                }
            };
        }

        function openAnswererChannel() {
            peer.ondatachannel = function(event) {
                channel = event.channel;
                setChannelEvents();
            };

            if (!moz) return;
            navigator.mozGetUserMedia({
                    audio: true,
                    fake: true
                }, function(stream) {
                    peer.addStream(stream);
                }, useless);
        }

        function useless() {
            log('Error in fake:true');
        }

        function onSdpSuccess() {
        }

        function onSdpError(e) {
            console.error('sdp error:', e.name, e.message);
        }

        return {
            connection: peer,
            addAnswerSDP: function(sdp) {
                peer.setRemoteDescription(new SessionDescription(sdp), onSdpSuccess, onSdpError);
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
            hints = options.constraints || {
                audio: true,
                video: video_constraints
            };

        if (hints.video == true) hints.video = video_constraints;

        // connection.mediaConstraints.audio = false;
        if (typeof mediaConstraints.audio != 'undefined')
            hints.audio = mediaConstraints.audio;

        // connection.media.min(320,180);
        // connection.media.max(1920,1080);
        var media = options.media;
        if (!moz) {
            var mandatory = {
                minWidth: media.minWidth,
                minHeight: media.minHeight,
                maxWidth: media.maxWidth,
                maxHeight: media.maxHeight,
                minAspectRatio: media.minAspectRatio
            };

            // https://code.google.com/p/chromium/issues/detail?id=143631#c9
            var allowed = ['1920:1080', '1280:720', '960:720', '640:360', '640:480', '320:240', '320:180'];

            if (allowed.indexOf(mandatory.minWidth + ':' + mandatory.minHeight) == -1 ||
                allowed.indexOf(mandatory.maxWidth + ':' + mandatory.maxHeight) == -1) {
                console.error('The min/max width/height constraints you passed "seems" NOT supported.', toStr(mandatory));
            }

            if (mandatory.minWidth > mandatory.maxWidth || mandatory.minHeight > mandatory.maxHeight) {
                console.error('Minimum value must not exceed maximum value.', toStr(mandatory));
            }

            if (mandatory.minWidth >= 1280 && mandatory.minHeight >= 720) {
                console.info('Enjoy HD video! min/' + mandatory.minWidth + ':' + mandatory.minHeight + ', max/' + mandatory.maxWidth + ':' + mandatory.maxHeight);
            }

            hints.video.mandatory = merge(hints.video.mandatory, mandatory);
        }

        if (mediaConstraints.mandatory)
            hints.video.mandatory = merge(hints.video.mandatory, mediaConstraints.mandatory);

        // mediaConstraints.optional.bandwidth = 1638400;
        if (mediaConstraints.optional)
            hints.video.optional[0] = merge({ }, mediaConstraints.optional);

        log('media hints:', toStr(hints));

        // easy way to match 
        var idInstance = JSON.stringify(hints);

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
            n.getMedia(hints, streaming, options.onerror || function(e) {
                console.error(e);
            });
        }
    }

    function isData(session) {
        return !session.audio && !session.video && !session.screen && session.data;
    }

    function swap(arr) {
        var swapped = [],
            length = arr.length;
        for (var i = 0; i < length; i++)
            if (arr[i] && arr[i] !== true)
                swapped.push(arr[i]);
        return swapped;
    }

    function log(a, b, c, d, e, f) {
        if (window.skipRTCMultiConnectionLogs) return;
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

    function toStr(obj) {
        return JSON.stringify(obj, function(key, value) {
            if (value && value.sdp) {
                console.log(value.sdp.type, '---', value.sdp.sdp);
                return '';
            } else return value;
        }, '---');
    }

    function getLength(obj) {
        var length = 0;
        for (var o in obj)
            if (o) length++;
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
        mediaElement.volume = .1;
        mediaElement.play();
        return mediaElement;
    }

    function merge(mergein, mergeto) {
        if (!mergein) mergein = { };
        if (!mergeto) return mergein;

        for (var item in mergeto) {
            mergein[item] = mergeto[item];
        }
        return mergein;
    }

    // the purpose of this method is to detect mic/speaker activity

    function voiceActivityDetection(peer) {
        if (moz) return;

        peer.getStats(function(stats) {
            var output = { };
            var sr = stats.result();
            for (var i = 0; i < sr.length; i++) {
                var obj = sr[i].remote;
                if (obj) {
                    var nspk = 0.0;
                    var nmic = 0.0;
                    if (obj.stat('audioInputLevel')) {
                        nmic = obj.stat('audioInputLevel');
                    }
                    if (nmic > 0.0) {
                        output.mic = Math.floor(Math.max((Math.LOG2E * Math.log(nmic) - 4.0), 0.0));
                    }
                    if (obj.stat('audioOutputLevel')) {
                        nspk = obj.stat('audioOutputLevel');
                    }
                    if (nspk > 0.0) {
                        output.speaker = Math.floor(Math.max((Math.LOG2E * Math.log(nspk) - 4.0), 0.0));
                    }
                }
            }
            log('mic intensity:', output.mic);
            log('speaker intensity:', output.speaker);
            log('Type <window.skipRTCMultiConnectionLogs=true> to stop this logger.');
        });

        if (!window.skipRTCMultiConnectionLogs)
            setTimeout(function() {
                voiceActivityDetection(peer);
            }, 2000);
    }

    function loadScript(src, onload) {
        var script = document.createElement('script');
        script.src = src;
        if (onload) script.onload = onload;
        document.documentElement.appendChild(script);
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

        log('session', JSON.stringify(session, null, '\t'));

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
                streamid: stream.label,
                mute: !!enabled,
                unmute: !enabled
            });
    }

    RTCMultiConnection.prototype.setDefaults = DefaultSettings;

    function DefaultSettings() {
        this.onmessage = function(e) {
            log(e.userid, 'posted', e.data);
        };

        this.onopen = function(e) {
            log('Data connection is opened between you and', e.userid);
        };

        this.onerror = function(e) {
            console.error('Error in data connection between you and', e.userid, e);
        };

        this.onclose = function(e) {
            console.warn('Data connection between you and', e.userid, 'is closed.', e);
        };

        this.onFileReceived = function(fileName) {
            log('File <', fileName, '> received successfully.');
        };

        this.onFileSent = function(file) {
            log('File <', file.name, '> sent successfully.');
        };

        this.onFileProgress = function(packets) {
            log('<', packets.remaining, '> items remaining.');
        };

        this.onstream = function(e) {
            log('on:add:stream', e.stream);
        };

        this.onleave = function(e) {
            log(e.userid, 'left!');
        };

        this.peers = { };

        this.streams = {
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
        this.channels = { };
        this.extra = { };

        this.session = {
            audio: true,
            video: true
        };

        this.bandwidth = {
            data: 1638400
        };

        // preferring SCTP data channels!
        this.preferSCTP = false;

        // file queue: to store previous file objects in memory;
        // and stream over newly connected peers
        this.fileQueue = { };

        this.media = {
            min: function(width, height) {
                this.minWidth = width;
                this.minHeight = height;
            },
            minWidth: 640, //  1920 
            minHeight: 360, // 1080  
            max: function(width, height) {
                this.maxWidth = width;
                this.maxHeight = height;
            },
            maxWidth: 1920,
            maxHeight: 1080,
            bandwidth: 256,
            minFrameRate: 32,
            minAspectRatio: 1.77
        };

        this.candidates = {
            host: true,
            relay: true,
            reflexive: true
        };

        this.mediaConstraints = { };
        this.sdpConstraints = { };

        this.attachStreams = [];
        this.detachStreams = [];

        this.maxParticipantsAllowed = 256;
        this.autoSaveToDisk = true;

        // 'many-to-many' / 'one-to-many' / 'one-to-one' / 'one-way'
        this.direction = 'many-to-many';

        this._getStream = function(e) {
            return {
                stream: e.stream,
                userid: e.userid,
                socket: e.socket,
                type: e.type,
                mediaElement: e.mediaElement,
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
                },
                startRecording: function(session) {
                    if (!session) session = { audio: true, video: true };
                    if (!window.RecordRTC) {
                        var self = this;
                        return loadScript('https://www.webrtc-experiment.com/RecordRTC.js', function() {
                            self.startRecording(session);
                        });
                    }

                    var stream = this.stream;
                    if (session.audio) {
                        this.recordAudio = RecordRTC(stream, session);
                        this.recordAudio.startRecording();
                    }

                    // video recording on firefox has some issues
                    if (!moz && session.video) {
                        this.recordVideo = RecordRTC(stream, merge(session, {
                            type: 'video'
                        }));
                        this.recordVideo.startRecording();
                    }
                },
                stopRecording: function(onBlob, session) {
                    if (!session) session = { audio: true, video: true };
                    else
                        session = {
                            audio: session == 'audio',
                            video: session == 'video'
                        };

                    if (session.audio && this.recordAudio) {
                        this.recordAudio.stopRecording();

                        var blob = this.recordAudio.getBlob();
                        blob.recordingType = 'audio';
                        if (onBlob) onBlob(blob);
                    }

                    if (!moz && session.video && this.recordVideo) {
                        this.recordVideo.stopRecording();

                        blob = this.recordVideo.getBlob();
                        blob.recordingType = 'video';
                        if (onBlob) onBlob(blob);
                    }
                }
            };
        };

        this.token = function() {
            return (Math.random() * new Date().getTime()).toString(36).replace( /\./g , '');
        };
    }
})();
