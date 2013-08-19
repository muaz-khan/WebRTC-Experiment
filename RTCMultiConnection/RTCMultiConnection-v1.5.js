// 2013, @muazkh - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

// RTCMultiConnection-v1.5
(function() {
    window.RTCMultiConnection = function() {
        this.sessionid = location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');

        this.open = function(sessionid) {
            self.joinedRoom = true;

            if (sessionid)
                self.sessionid = sessionid;

            if (self.socket && self.socket.onDisconnect)
                self.socket.onDisconnect().remove();

            self.isInitiator = true;

            prepareInit(function() {
                init();
                captureUserMedia(rtcSession.initSession);
            });
        };

        this.connect = function(sessionid) {
            if (sessionid)
                self.sessionid = sessionid;

            prepareInit(init);
        };

        this.join = joinSession;

        this.send = function(data, channel) {
            if (!data)
                throw 'No file, data or text message to share.';

            if (data.size)
                FileSender.send({
                    file: data,
                    channel: rtcSession,
                    onFileSent: self.onFileSent,
                    onFileProgress: self.onFileProgress,
                    _channel: channel
                });
            else
                TextSender.send({
                    text: data,
                    channel: rtcSession,
                    _channel: channel
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
                    var firebase = new window.Firebase('https://' + (self.firebase || 'chat') + '.firebaseIO.com/' + config.channel);
                    firebase.on('child_added', function(data) {
                        config.onmessage(data.val());
                    });

                    firebase.send = function(data) {
                        this.push(data);
                    };

                    if (!self.socket) self.socket = firebase;
                    if (self.isInitiator) firebase.onDisconnect().remove();

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
                    if (self.sessionid !== session.sessionid)
                        return false;

                    if (!rtcSession) {
                        self._session = session;
                        return false;
                    }

                    if (self.onNewSession)
                        return self.onNewSession(session);

                    if (self.joinedRoom)
                        return false;
                    self.joinedRoom = true;

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

        function captureUserMedia(callback, session) {
            session = session || self.session;

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
            var screenConstraints = {
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'screen'
                    },
                    optional: []
                }
            };

            if (session.screen)
                captureUserMedia00(screenConstraints, function() {
                    captureUserMedia00(constraints, callback);
                });
            else captureUserMedia00(constraints, callback, session.audio && !session.video);

            function captureUserMedia00(forcedConstraints, forcedCallback, isRemoveVideoTracks) {
                var mediaConfig = {
                    onsuccess: function(stream, returnBack) {
                        if (returnBack) return forcedCallback && forcedCallback(stream);

                        if (isRemoveVideoTracks && !moz) {
                            stream = new MediaStream(stream.getAudioTracks());
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
                            type: 'local',
                            userid: self.userid || 'self',
                            extra: self.extra
                        };

                        self.onstream(streamedObject);

                        self.streams[streamid] = self._getStream({
                            stream: stream,
                            userid: self.userid,
                            type: 'local'
                        });

                        if (forcedCallback) forcedCallback(stream);
                        return false;
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

            return false;
        }

        this.captureUserMedia = captureUserMedia;

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
			
            // if firebase; remove data from firebase servers
            if(self.isInitiator && !!self.socket && !!self.socket.remove) {
                self.socket.remove();
            }
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

        DefaultSettings(self);
    };

    function RTCMultiSession(root) {
        var socketObjects = { }, sockets = [];
        var participants = { }, joinedRoom, isbroadcaster, isAcceptNewSession = true;
        var onSocketResponseInvokers = [], onUserLeaveInvokers = [];

        root.userid = root.userid || root.token();

        function privateHandler(config) {
            var isofferer = config.isofferer,
                peer;

            var targetUser = config.targetUser;

            config.socketIndex = socket.index = sockets.length;
            socketObjects[config.channel] = socket;
            sockets[config.socketIndex] = socket;

            var peerConfig = {
                onopen: onChannelOpened,
                onICE: function(candidate) {
                    socket && socket.send({
                        userid: root.userid,
                        candidate: {
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            candidate: JSON.stringify(candidate.candidate)
                        },
                        targetUser: targetUser
                    });
                },
                onmessage: function(event) {
                    root.config.onmessage({
                        data: event.data,
                        userid: config.userid,
                        extra: config.extra
                    });
                },
                onstream: function(stream) {
                    var mediaElement = getMediaElement(stream, root.session);

                    config.stream = stream;
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
                    e.extra = config.extra;
                    e.userid = config.userid;
                    root.onclose(e);

                    // suggested in #71 by "efaj"
                    if (root.channels[e.userid])
                        delete root.channels[e.userid];
                },
                onerror: function(e) {
                    e.extra = config.extra;
                    e.userid = config.userid;
                    root.onerror(e);
                },

                attachStreams: root.attachStreams,
                iceServers: root.iceServers,
                bandwidth: root.bandwidth,
                sdpConstraints: root.sdpConstraints || { }
            };

            function initPeer(offerSdp) {
                if (!offerSdp)
                    peerConfig.onOfferSDP = function(sdp) {
                        sendsdp({
                            sdp: sdp,
                            socket: socket,
                            targetUser: targetUser
                        });
                    };
                else {
                    peerConfig.offerSDP = offerSdp;
                    peerConfig.onAnswerSDP = function(sdp) {
                        sendsdp({
                            sdp: sdp,
                            socket: socket,
                            targetUser: targetUser
                        });
                    };
                }

                if (!root.session.data)
                    peerConfig.onmessage = null;

                peerConfig.session = root.session;
                peer = new RTCPeerConnection(peerConfig);
            }

            function afterRemoteStreamStartedFlowing(mediaElement) {
                config.stream.onended = function() {
                    root.onstreamended(streamedObject);
                };

                var streamid = root.token();

                config.stream.onended = function() {
                    if (root.onstreamended)
                        root.onstreamended(streamedObject);
                };

                var streamedObject = {
                    mediaElement: mediaElement,

                    stream: config.stream,
                    streamid: streamid,
                    session: root.session,

                    blobURL: mediaElement.mozSrcObject || mediaElement.src,
                    type: 'remote',

                    extra: config.extra,
                    userid: config.userid
                };
                root.onstream(streamedObject);

                // connection.streams['stream-id'].mute({audio:true})
                root.streams[streamid] = root._getStream({
                    stream: config.stream,
                    userid: config.userid,
                    socket: socket,
                    type: 'remote'
                });

                onSessionOpened();
            }

            function onChannelOpened(channel) {
                config.channel = channel;

                // connection.channels['user-id'].send(data);				
                root.channels[config.userid] = {
                    channel: config.channel,
                    send: function(data) {
                        root.send(data, this.channel);
                    }
                };

                root.onopen({
                    extra: config.extra,
                    userid: config.userid
                });

                if (isData(root.session)) onSessionOpened();
            }

            function updateSocket() {
                if (socket.userid == config.userid)
                    return;

                socket.userid = config.userid;
                sockets[config.socketIndex] = socket;

                // connection.peers['user-id'].addStream({audio:true})
                root.peers[config.userid] = {
                    socket: socket,
                    peer: peer,
                    userid: config.userid,
                    addStream: function(session) {
                        root.addStream(session, this.socket);
                    }
                };
            }

            function onSessionOpened() {
                // admin/guest is one-to-one relationship
                if (root.userType && !root.session['many-to-many']) return;

                /*// original conferencing infrastructure!
                if (!root.session.oneway && !root.session.broadcast && isbroadcaster && getLength(participants) > 1 && getLength(participants) <= root.maxParticipantsAllowed) {
                socket.send({
                newParticipant: config.channel,
                userid: root.userid,
                extra: config.extra || {}
                });
                }
                */
            }

            onSocketResponseInvokers[onSocketResponseInvokers.length] = socketResponse;

            function socketResponse(response) {
                if (response.targetUser != root.userid) return;

                if (response.sdp) {
                    config.userid = response.userid;
                    config.extra = response.extra;
                    config.renegotiate = response.renegotiate;

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
                            userid: root.userid,
                            targetUser: targetUser
                        });

                        if (sockets[config.socketIndex])
                            delete sockets[config.socketIndex];
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
                        root.userid = response.userid;
                        root.open({
                            extra: root.extra
                        });
                        sockets = sockets.swap();
                        root.dontAttachStream = false;
                    }, 600);

                // if renegotiation process initiated by answerer
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

            onUserLeaveInvokers[onUserLeaveInvokers.length] = onLeft;

            function onLeft(channel) {
                var alert = {
                    left: true,
                    extra: root.extra,
                    userid: root.userid,
                    targetUser: targetUser
                };

                if (isbroadcaster) {
                    if (root.autoCloseEntireSession) {
                        alert.closeEntireSession = true;
                    } else if (sockets[0]) {
                        sockets[0].send({
                            playRoleOfBroadcaster: true,
                            userid: root.userid,
                            targetUser: targetUser
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

                sockets = sockets.swap();
            }

            function sdpInvoker(sdp) {
                log(sdp.sdp);

                if (isofferer)
                    return peer.addAnswerSDP(sdp);
                if (!config.renegotiate)
                    return initPeer(sdp);

                root.session = config.renegotiate;
                if (root.session.oneway || isData(root.session)) {
                    createAnswer();
                } else {
                    if (config.capturing)
                        return false;

                    config.capturing = true;

                    root.captureUserMedia(function(stream) {
                        config.capturing = false;
                        peer.connection.addStream(stream);
                        createAnswer();
                    }, config.renegotiate);
                }

                delete config.renegotiate;

                function createAnswer() {
                    peer.recreateAnswer(sdp, root.session, function(sdp00) {
                        sendsdp({
                            sdp: sdp00,
                            socket: socket
                        });
                    });
                }

                return false;
            }

            if (isofferer && !peer) initPeer();
        }

        // for PHP-based socket.io; split SDP in parts here

        function sendsdp(e) {
            e.socket.send({
                userid: root.userid,
                sdp: e.sdp,
                extra: root.extra,
                renegotiate: e.renegotiate ? e.renegotiate : false,
                targetUser: e.targetUser
            });
        }

        // sharing new user with existing participants

        function onNewParticipant(channel, extra) {
            if (!channel || !!participants[channel] || channel == root.userid)
                return;

            participants[channel] = channel;

            var newChannel = root.token();
            privateHandler({
                channel: newChannel,
                extra: extra || { },
                targetUser: channel
            });

            socket.send({
                participant: true,
                userid: root.userid,
                targetUser: channel,
                channel: newChannel,
                extra: root.extra
            });
        }

        // if a user leaves

        function clearSession(channel) {
            for (var i = 0; i < onUserLeaveInvokers.length; i++) {
                onUserLeaveInvokers[i](channel);
            }
        }

        window.onbeforeunload = function() {
            clearSession();
        };

        window.onkeyup = function(e) {
            if (e.keyCode == 116)
                clearSession();
        };

        var that = this,
            socket = root.openSignalingChannel({
                onmessage: function(response) {
                    if (response.userid == root.userid)
                        return;

                    for (var i = 0; i < onSocketResponseInvokers.length; i++) {
                        onSocketResponseInvokers[i](response);
                    }

                    if (isAcceptNewSession && response.sessionid && response.userid) {
                        root.session = response.session;
                        root.config.onNewSession(response);
                    }
                    if (response.newParticipant && joinedRoom && root.broadcasterid === response.userid)
                        onNewParticipant(response.newParticipant, response.extra);

                    if (getLength(participants) < root.maxParticipantsAllowed && response.userid && response.targetUser == root.userid && response.participant && !participants[response.userid]) {
                        acceptRequest(response.channel || response.userid, response.extra);
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
                                socket.send({
                                    rejectedRequestOf: response.userid,
                                    userid: root.userid,
                                    extra: root.extra || { }
                                });
                            }
                        }
                    }

                    if (response.acceptedRequestOf == root.userid) {
                        if (root.onstats) root.onstats('accepted', response);
                    }

                    if (response.rejectedRequestOf == root.userid) {
                        if (root.onstats) root.onstats('busy', response);
                        sendRequest();
                    }
                }
            });

        function sendRequest() {
            socket.send({
                userType: root.userType,
                userid: root.userid,
                extra: root.extra || { }
            });
        }

        // open new session
        this.initSession = function() {
            isbroadcaster = true;
            this.isOwnerLeaving = isAcceptNewSession = false;
            (function transmit() {
                if (getLength(participants) < root.maxParticipantsAllowed) {
                    socket && socket.send({
                        sessionid: root.sessionid,
                        userid: root.userid,
                        session: root.session,
                        extra: root.extra
                    });
                }

                if (!root.transmitRoomOnce && !that.isOwnerLeaving)
                    setTimeout(transmit, root.interval || 3000);
            })();
        };

        // join existing session
        this.joinSession = function(config) {
            config = config || { };

            root.session = config.session;

            joinedRoom = true;

            if (config.sessionid)
                root.sessionid = config.sessionid;

            isAcceptNewSession = false;

            privateHandler({
                channel: root.userid,
                extra: root.extra,
                targetUser: config.userid
            });

            socket.send({
                participant: true,
                userid: root.userid,
                targetUser: config.userid,
                extra: root.extra
            });

            root.broadcasterid = config.userid;
        };

        // send file/data or text message
        this.send = function(message, channel) {
            message = JSON.stringify(message);

            if (channel) {
                if (channel.readyState == 'open') {
                    channel.send(message);
                }
                return;
            }

            for (var dataChannel in root.channels) {
                channel = root.channels[dataChannel].channel;
                if (channel.readyState == 'open') {
                    channel.send(message);
                }
            }
        };

        // leave session
        this.leave = function(userid) {
            clearSession(userid);

            if (!userid) {
                root.userid = root.userid = root.token();
                joinedRoom = root.joinedRoom = isbroadcaster = false;
                isAcceptNewSession = true;
            }

            if (isbroadcaster) {
                this.isOwnerLeaving = true;
                root.isInitiator = false;
            }

            root.busy = false;
        };

        // renegotiate new stream
        this.addStream = function(e) {
            root.session = e.renegotiate;

            if (e.socket)
                addStream(e.socket);
            else
                for (var i = 0; i < sockets.length; i++)
                    addStream(sockets[i]);

            function addStream(socket00) {
                peer = root.peers[socket00.userid];

                if (!peer)
                    throw 'No such peer exists.';

                peer = peer.peer;

                // if offerer; renegotiate
                if (peer.connection.localDescription.type == 'offer') {
                    if (root.session.audio || root.session.video)
                        peer.connection.addStream(e.stream);

                    peer.recreateOffer(root.session, function(sdp) {
                        sendsdp({
                            sdp: sdp,
                            socket: socket00,
                            renegotiate: root.session
                        });
                    });
                } else {
                    // otherwise; suggest other user to play role of renegotiator
                    socket00.send({
                        userid: root.userid,
                        renegotiate: root.session,
                        suggestRenegotiation: true
                    });
                }
            }
        };

        root.request = function(userid) {
            if(!root.session['many-to-many']) root.busy = true;

            root.captureUserMedia(function() {
                // open private socket that will be used to receive offer-sdp
                privateHandler({
                    channel: root.userid,
                    extra: root.extra || { },
                    targetUser: userid
                });

                // ask other user to create offer-sdp
                socket.send({
                    participant: true,
                    userid: root.userid,
                    extra: root.extra || { },
                    targetUser: userid
                });
            });
        };

        function acceptRequest(userid, extra) {
            if (root.userType && !root.busy) {
                if (root.onRequest) root.onRequest(userid, extra);
                else accept00(userid, extra);
            }

            if (!root.userType) accept00(userid, extra);
        }

        function accept00(userid, extra) {
            if (root.userType) {
                if(!root.session['many-to-many']) root.busy = true;
                socket.send({
                    acceptedRequestOf: userid,
                    userid: root.userid,
                    extra: root.extra || { }
                });
            }

            participants[userid] = userid;
            privateHandler({
                isofferer: true,
                channel: userid,
                extra: extra || { },
                targetUser: userid
            });
        }

        root.accept = function(userid, extra) {
            root.captureUserMedia(function() {
                accept00(userid, extra);
            });
        };
    }

    function getRandomString() {
        return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
    }

    var FileSender = {
        send: function(config) {
            var channel = config.channel,
                directChannel = config._channel,
                file = config.file;

            var packetSize = 1000,
                textToTransfer = '',
                numberOfPackets = 0,
                packets = 0;

            // uuid is used to uniquely identify sending instance
            var uuid = getRandomString();

            var reader = new window.FileReader();
            reader.readAsDataURL(file);
            reader.onload = onReadAsDataURL;

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

                channel.send(data, directChannel);
                textToTransfer = text.slice(data.message.length);
                if (textToTransfer.length)
                    setTimeout(function() {
                        onReadAsDataURL(null, textToTransfer);
                    }, moz ? 1 : 500);
            }
        }
    };

    function FileReceiver() {
        var content = { },
            packets = { },
            numberOfPackets = { };

        function receive(data, config) {
            // uuid is used to uniquely identify sending instance
            var uuid = data.uuid;

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

            var evt = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });

            save.dispatchEvent(evt);

            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        }
    };

    var TextSender = {
        send: function(config) {
            var channel = config.channel,
                directChannel = config._channel,
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

                channel.send(data, directChannel);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length)
                    setTimeout(function() {
                        sendText(null, textToTransfer);
                    }, moz ? 1 : 500);
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

        if (moz) console.warn('Should we use "stun:stun.services.mozilla.com"?');

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

            iceServers.iceServers = [STUN,TURN];
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

        if (!navigator.onLine) {
            iceServers = null;
            console.warn('No internet connection detected. No STUN/TURN server is used to make sure local/host candidates are used for peers connection.');
        }

        var peer = new PeerConnection(iceServers, optional);

        openOffererChannel();

        peer.onicecandidate = function(event) {
            if (event.candidate && !options.renegotiate)
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
            sdp = sdp.replace( /a=mid:data\r\n/g , 'a=mid:data\r\nb=AS:' + (bandwidth.data || 102400) + '\r\n'); // 100 Mbps

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
            // var serializer = new SdpSerializer(sdp);
            // serializer.video.payload(100).newLine('a=fmtp:100 x-google-min-bitrate=' + (bitrate.min || 10));
            // serializer.audio.payload(111).newLine('a=fmtp:111 minptime=' + (framerate.minptime || 10));
            // serializer.audio.payload(111).newLine('a=maxptime:' + (framerate.maxptime || 10));
            // serializer.video.crypto().newLine('a=crypto:0 AES_CM_128_HMAC_SHA1_32 inline:XXXXXXXXXXXXXXXXXX');
            // serializer.video.crypto(80).remove();
            // sdp = serializer.deserialize();
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

            if (moz) channel.binaryType = 'blob';

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

        if (options.onAnswerSDP && options.onmessage && moz)
            openAnswererChannel();

        function openAnswererChannel() {
            peer.ondatachannel = function(event) {
                channel = event.channel;
                channel.binaryType = 'blob';
                setChannelEvents();
            };

            navigator.mozGetUserMedia({
                    audio: true,
                    fake: true
                }, function(stream) {
                    peer.addStream(stream);
                    createAnswer();
                }, useless);
        }

        function useless() {
            log('error in fake:true');
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

        // connection.mediaConstraints.mandatory = {minFrameRate:10}
        if (mediaConstraints.mandatory)
            resourcesNeeded.video.mandatory = merge(resourcesNeeded.video.mandatory, mediaConstraints.mandatory);

        // mediaConstraints.optional.bandwidth = 1638400;
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

    function DefaultSettings(self) {
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

        self.onstream = function(e) {
            log(e.type, e.stream);
        };

        self.onleave = function(e) {
            log(e.userid, 'left!');
        };

        self.onstreamended = function(e) {
            log(e.type, e.stream);
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

        self.maxParticipantsAllowed = 256;

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
            return (Math.random() * new Date().getTime()).toString(36).replace( /\./g , '');
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
