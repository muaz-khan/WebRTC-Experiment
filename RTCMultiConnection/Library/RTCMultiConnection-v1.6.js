// Last time updated at 24 Feb 2014, 11:32:23
// Latest file can be found here: https://www.webrtc-experiment.com/RTCMultiConnection-v1.6.js

// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - www.RTCMultiConnection.org/docs
// FAQ               - www.RTCMultiConnection.org/FAQ
// v1.6 changes log  - www.RTCMultiConnection.org/changes-log/#v1.6
// _______________________
// RTCMultiConnection-v1.6

/* issues/features need to be fixed & implemented:

-. hold/unhold of audio or video track instead of "all tracks".
-. "channel" object in the openSignalingChannel shouldn't be mandatory!
-. JSON parse/stringify options for data transmitted using data-channels; e.g. connection.preferJSON = true; (not-implemented)
-. "onspeaking" and "onsilence" fires too often! (not-fixed)
-. removeTrack() and addTracks() instead of "stop" (not-implemented)
-. session-duration & statistics (not-implemented)

// via http://www.slideshare.net/MuazKhan/echo-in-webrtc-why
var audio_constraints =  {
mandatory: {
googEchoCancellation: true,
googAutoGainControl: true,
googNoiseSuppression: true,
googHighpassFilter: true,
googNoiseReduction: true,
}
};
*/

(function() {
    // www.RTCMultiConnection.org/docs/
    window.RTCMultiConnection = function(channel) {
        // www.RTCMultiConnection.org/docs/channel-id/
        this.channel = channel || location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');

        // www.RTCMultiConnection.org/docs/open/
        this.open = function(_channel) {
            self.joinedARoom = true;

            if (_channel)
                self.channel = _channel;

            // if firebase && if session initiator
            if (self.socket && self.socket.onDisconnect)
                self.socket.onDisconnect().remove();

            // www.RTCMultiConnection.org/docs/session-initiator/
            self.isInitiator = true;

            prepareInit(function() {
                init();
                captureUserMedia(rtcSession.initSession);
            });
        };

        // www.RTCMultiConnection.org/docs/connect/
        this.connect = function(_channel) {
            if (_channel)
                self.channel = _channel;

            prepareInit(init);

            return this;
        };

        // www.RTCMultiConnection.org/docs/join/
        this.join = joinSession;

        // www.RTCMultiConnection.org/docs/send/
        this.send = function(data, _channel) {
            // send file/data or /text
            if (!data)
                throw 'No file, data or text message to share.';

            // connection.send([file1, file2, file3])
            if (!!data.forEach) {
                for (var i = 0; i < data.length; i++) {
                    self.send(data[i], _channel);
                }
                return;
            }

            if (typeof data.size != 'undefined' && typeof data.type != 'undefined') {
                FileSender.send({
                    file: data,
                    channel: rtcSession,
                    _channel: _channel,
                    root: self
                });
            } else {
                TextSender.send({
                    text: data,
                    channel: rtcSession,
                    _channel: _channel,
                    root: self
                });
            }
        };

        var self = this;
        var rtcSession;

        function prepareInit(callback) {
            if (self.openSignalingChannel) return callback();

            // make sure firebase.js is loaded before using their JavaScript API
            if (!window.Firebase) {
                return loadScript('//www.webrtc-experiment.com/firebase.js', function() {
                    prepareInit(callback);
                });
            }

            // Single socket is a preferred solution!
            var socketCallbacks = { };
            var firebase = new Firebase('//' + self.firebase + '.firebaseio.com/' + self.channel);
            firebase.on('child_added', function(snap) {
                var data = snap.val();
                if (data.sender == self.userid) return;

                if (socketCallbacks[data.channel]) {
                    socketCallbacks[data.channel](data.message);
                }
                snap.ref().remove();
            });

            // www.RTCMultiConnection.org/docs/openSignalingChannel/
            // github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md
            self.openSignalingChannel = function(args) {
                var callbackid = args.channel || self.channel;
                socketCallbacks[callbackid] = args.onmessage;

                if (args.onopen) setTimeout(args.onopen, 1000);
                return {
                    send: function(message) {
                        firebase.push({
                            sender: self.userid,
                            channel: callbackid,
                            message: message
                        });
                    },
                    channel: channel /* todo: remove this "channel" object */
                };
            };

            firebase.onDisconnect().remove();

            callback();
        }

        // initializing RTCMultiSession

        function init() {
            if (rtcSession) return;

            rtcSession = new RTCMultiSession(self);
        }

        function joinSession(session) {
            if (!session || !session.userid || !session.sessionid)
                throw 'invalid data passed over "join" method';

            self.session = session.session;

            extra = self.extra || session.extra || { };

            if (session.oneway || session.data) {
                rtcSession.joinSession(session, extra);
            } else {
                captureUserMedia(function() {
                    rtcSession.joinSession(session, extra);
                });
            }
        }

        // www.RTCMultiConnection.org/docs/captureUserMedia/

        function captureUserMedia(callback, _session) {
            // capture user's media resources
            var session = _session || self.session;

            if (isEmpty(session)) {
                if (callback) callback();
                return;
            }

            if (self.dontAttachStream)
                return callback();

            if (isData(session) || (!self.isInitiator && session.oneway)) {
                // www.RTCMultiConnection.org/docs/attachStreams/
                self.attachStreams = [];
                return callback();
            }

            var constraints = {
                audio: !!session.audio,
                video: !!session.video
            };

            // if custom audio device is selected
            if (self._mediaSources.audio) {
                constraints.audio = {
                    optional: [{
                        sourceId: self._mediaSources.audio
                    }]
                };
            }

            // if custom video device is selected
            if (self._mediaSources.video) {
                constraints.video = {
                    optional: [{
                        sourceId: self._mediaSources.video
                    }]
                };
            }

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
                    onsuccess: function(stream, returnBack, idInstance) {
                        if (returnBack) return forcedCallback && forcedCallback(stream);

                        if (isRemoveVideoTracks && isChrome) {
                            stream = new window.webkitMediaStream(stream.getAudioTracks());
                        }

                        var mediaElement = createMediaElement(stream, session);
                        mediaElement.muted = true;

                        stream.onended = function() {
                            self.onstreamended(streamedObject);

                            // if user clicks "stop" button to close screen sharing
                            var _stream = self.streams[streamid];
                            if (_stream && _stream.socket) {
                                _stream.socket.send({
                                    userid: self.userid,
                                    streamid: _stream.streamid,
                                    stopped: true
                                });
                            }

                            // to make sure same stream can be captured again!
                            if (currentUserMediaRequest.streams[idInstance]) {
                                delete currentUserMediaRequest.streams[idInstance];
                            }
                        };

                        var streamid = getRandomString();

                        stream.streamid = streamid;

                        var streamedObject = {
                            stream: stream,
                            streamid: streamid,
                            mediaElement: mediaElement,
                            blobURL: mediaElement.mozSrcObject || mediaElement.src,
                            type: 'local',
                            userid: self.userid || 'self',
                            extra: self.extra,
                            session: session
                        };

                        var sObject = {
                            stream: stream,
                            userid: self.userid || 'self',
                            streamid: streamid,
                            type: 'local',
                            streamObject: streamedObject,
                            mediaElement: mediaElement,
                            rtcMultiConnection: self
                        };

                        self.attachStreams.push(stream);
                        self.__attachStreams.push(sObject);

                        self.streams[streamid] = self._getStream(sObject);

                        self.onstream(streamedObject);
                        if (forcedCallback) forcedCallback(stream);

                        if (self.onspeaking) {
                            var soundMeter = new SoundMeter({
                                context: self._audioContext,
                                root: self,
                                event: streamedObject
                            });
                            soundMeter.connectToSource(stream);
                        }
                    },
                    onerror: function(e) {
                        self.onMediaError(toStr(e));

                        if (session.audio) {
                            self.onMediaError('Maybe microphone access is denied.');
                        }

                        if (session.video) {
                            self.onMediaError('Maybe webcam access is denied.');
                        }

                        if (session.screen) {
                            if (isFirefox) {
                                self.onMediaError('Firefox has not yet released their screen capturing modules. Still work in progress! Please try chrome for now!');
                            } else if (location.protocol !== 'https:') {
                                self.onMediaError('<https> is mandatory to capture screen.');
                            } else {
                                self.onMediaError('Unable to detect actual issue. Trying to check availability of screen sharing flag.');

                                self.caniuse.checkIfScreenSharingFlagEnabled(function(isFlagEnabled, warning) {
                                    if (isFlagEnabled) {
                                        if (chromeVersion < 31) {
                                            self.onMediaError('Multi-capturing of screen is not allowed. Capturing process is denied. Try chrome >= M31.');
                                        } else {
                                            self.onMediaError('Unknown screen capturing error.');
                                        }
                                    }

                                    if (warning) self.onMediaError(warning);

                                    if (!warning) {
                                        self.onMediaError('It seems that "chrome://flags/#enable-usermedia-screen-capture" flag is not enabled.');
                                    }
                                });
                            }
                        }
                    },
                    mediaConstraints: self.mediaConstraints || { }
                };

                mediaConfig.constraints = forcedConstraints || constraints;
                mediaConfig.media = self.media;
                getUserMedia(mediaConfig);
            }
        }

        // www.RTCMultiConnection.org/docs/captureUserMedia/
        this.captureUserMedia = captureUserMedia;

        // www.RTCMultiConnection.org/docs/leave/
        this.leave = function(userid) {
            // eject a user; or leave the session
            rtcSession.leave(userid);

            if (!userid) {
                var streams = self.attachStreams;
                for (var i = 0; i < streams.length; i++) {
                    stopTracks(streams[i]);
                }
                currentUserMediaRequest.streams = [];
                self.attachStreams = [];
            }

            // if firebase; remove data from firebase servers
            if (self.isInitiator && !!self.socket && !!self.socket.remove) {
                self.socket.remove();
            }
        };

        // www.RTCMultiConnection.org/docs/eject/
        this.eject = function(userid) {
            if (!connection.isInitiator) throw 'Only session-initiator can eject a user.';
            this.leave(userid);
        };

        // www.RTCMultiConnection.org/docs/close/
        this.close = function() {
            // close entire session
            self.autoCloseEntireSession = true;
            rtcSession.leave();
        };

        // www.RTCMultiConnection.org/docs/renegotiate/
        this.renegotiate = function(stream) {
            rtcSession.addStream({
                renegotiate: {
                    oneway: true,
                    audio: true,
                    video: true
                },
                stream: stream
            });
        };

        // www.RTCMultiConnection.org/docs/addStream/
        this.addStream = function(session, socket) {
            // www.RTCMultiConnection.org/docs/renegotiation/

            // renegotiate new media stream
            if (session) {
                var isOneWayStreamFromParticipant;
                if (!self.isInitiator && session.oneway) {
                    session.oneway = false;
                    isOneWayStreamFromParticipant = true;
                }

                captureUserMedia(function(stream) {
                    if (isOneWayStreamFromParticipant) {
                        session.oneway = true;
                    }
                    addStream(stream);
                }, session);
            } else addStream();

            function addStream(stream) {
                rtcSession.addStream({
                    stream: stream,
                    renegotiate: session || self.session,
                    socket: socket
                });
            }
        };

        // www.RTCMultiConnection.org/docs/removeStream/
        this.removeStream = function(streamid) {
            // detach pre-attached streams
            if (!this.streams[streamid]) return warn('No such stream exists. Stream-id:', streamid);

            // www.RTCMultiConnection.org/docs/detachStreams/
            this.detachStreams.push(streamid);
        };

        // set RTCMultiConnection defaults on constructor invocation
        setDefaults(this);

        this.__attachStreams = [];
    };

    function RTCMultiSession(root) {
        var fileReceiver = new FileReceiver(root);
        var textReceiver = new TextReceiver(root);

        function onDataChannelMessage(e) {
            if (!e) return;

            e = JSON.parse(e);

            if (e.data.type === 'text') {
                textReceiver.receive(e.data, e.userid, e.extra);
            } else if (typeof e.data.maxChunks != 'undefined') {
                fileReceiver.receive(e.data);
            } else {
                if (root.autoTranslateText) {
                    e.original = e.data;
                    root.Translator.TranslateText(e.data, function(translatedText) {
                        e.data = translatedText;
                        root.onmessage(e);
                    });
                } else root.onmessage(e);
            }
        }

        function onNewSession(session) {
            if (root.onNewSession) {
                session.join = function(forceSession) {
                    if (!forceSession) return root.join(session);

                    for (var f in forceSession) {
                        session.session[f] = forceSession[f];
                    }

                    // keeping previous state
                    var isDontAttachStream = root.dontAttachStream;

                    root.dontAttachStream = false;
                    root.captureUserMedia(function() {
                        root.dontAttachStream = true;
                        root.join(session);

                        // returning back previous state
                        root.dontAttachStream = isDontAttachStream;
                    }, forceSession);
                };
                return root.onNewSession(session);
            }

            // user is already connected to a session
            if (root.joinedARoom) return;

            root.joinedARoom = true;

            root.join(session);
        }

        var self = { };
        var socketObjects = { };
        var sockets = [];

        self.userid = root.userid = root.userid || root.token();
        self.sessionid = root.channel;

        var participants = { };
        var isAcceptNewSession = true;

        function updateSocketForLocalStreams(socket) {
            for (var i = 0; i < root.__attachStreams.length; i++) {
                var streamid = root.__attachStreams[i].streamid;
                if (root.streams[streamid]) root.streams[streamid].socket = socket;
            }
            root.__attachStreams = [];
        }

        function newPrivateSocket(_config) {
            var socketConfig = {
                channel: _config.channel,
                onmessage: socketResponse,
                onopen: function(_socket) {
                    if (_socket) socket = _socket;

                    if (isofferer && !peer) {
                        peerConfig.session = _config.session || root.session;
                        if (!peer) peer = new PeerConnection();
                        peer.create('offer', peerConfig);
                    }

                    _config.socketIndex = socket.index = sockets.length;
                    socketObjects[socketConfig.channel] = socket;
                    sockets[_config.socketIndex] = socket;

                    updateSocketForLocalStreams(socket);
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
                onicecandidate: function(candidate) {
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
                onmessage: onDataChannelMessage,
                onaddstream: function(stream) {
                    if (isData(root.session) && isFirefox) return;

                    if (_config.streaminfo) {
                        var streaminfo = _config.streaminfo.split('----');
                        if (streaminfo[0]) {
                            stream.streamid = streaminfo[0];
                            delete streaminfo[0];
                            _config.streaminfo = swap(streaminfo).join('----');
                        }
                    }

                    var __session = _config.session || root.session;
                    __session.remote = true;

                    var mediaElement = createMediaElement(stream, __session);

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

                onremovestream: function(event) {
                    warn('onremovestream', event);
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

                oniceconnectionstatechange: function(event) {
                    return log('oniceconnectionstatechange', toStr(event));

                    // auto redial feature is temporarily disabled because it affects renegotiation process
                    // when we renegotiate streams; it fires ice-connection-state == 'disconnected'
                    // so it is not easy to distinguish between peers failure or renegotiation.

                    // if you want to enable auto-redial feature; then omit word "return" from above statement.

                    if (!root.peers[_config.userid]) return;

                    if (root.peers[_config.userid].peer.connection.iceConnectionState != 'disconnected') {
                        self.redialing = false;
                    }

                    if (root.peers[_config.userid].peer.connection.iceConnectionState == 'disconnected' && !self.redialing) {
                        self.redialing = true;

                        error('Peer connection is closed.', toStr(root.peers[_config.userid].peer.connection));
                        root.peers[_config.userid].redial();
                    }
                },

                onsignalingstatechange: function(event) {
                    log('onsignalingstatechange', toStr(event));
                },

                attachStreams: root.attachStreams,
                iceServers: root.iceServers,
                bandwidth: root.bandwidth,
                sdpConstraints: root.sdpConstraints,
                optionalArgument: root.optionalArgument,
                disableDtlsSrtp: root.disableDtlsSrtp,
                dataChannelDict: root.dataChannelDict,
                preferSCTP: root.preferSCTP,

                onSessionDescription: function(sessionDescription, streaminfo) {
                    sendsdp({
                        sdp: sessionDescription,
                        socket: socket,
                        streaminfo: streaminfo
                    });
                },

                socket: socket,
                selfUserid: root.userid
            };

            function waitUntilRemoteStreamStartsFlowing(mediaElement) {
                if (!(mediaElement.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || mediaElement.paused || mediaElement.currentTime <= 0)) {
                    afterRemoteStreamStartedFlowing(mediaElement);
                } else
                    setTimeout(function() {
                        waitUntilRemoteStreamStartsFlowing(mediaElement);
                    }, 50);
            }

            function initFakeChannel() {
                if (!root.fakeDataChannels || root.channels[_config.userid]) return;

                // for non-data connections; allow fake data sender!
                if (!root.session.data) {
                    var fakeChannel = {
                        send: function(data) {
                            socket.send({
                                fakeData: data
                            });
                        },
                        readyState: 'open'
                    };
                    // connection.channels['user-id'].send(data);
                    root.channels[_config.userid] = {
                        channel: fakeChannel,
                        send: function(data) {
                            this.channel.send(data);
                        }
                    };
                    peerConfig.onopen(fakeChannel);
                }
            }

            function afterRemoteStreamStartedFlowing(mediaElement) {
                var stream = _config.stream;

                stream.onended = function() {
                    root.onstreamended(streamedObject);
                };

                var streamedObject = {
                    mediaElement: mediaElement,

                    stream: stream,
                    streamid: stream.streamid,
                    session: root.session,

                    blobURL: mediaElement.mozSrcObject || mediaElement.src,
                    type: 'remote',

                    extra: _config.extra,
                    userid: _config.userid
                };

                // connection.streams['stream-id'].mute({audio:true})
                root.streams[stream.streamid] = root._getStream({
                    stream: stream,
                    userid: _config.userid,
                    streamid: stream.streamid,
                    socket: socket,
                    type: 'remote',
                    streamObject: streamedObject,
                    mediaElement: mediaElement,
                    rtcMultiConnection: root
                });

                root.onstream(streamedObject);

                onSessionOpened();

                if (root.onspeaking) {
                    var soundMeter = new SoundMeter({
                        context: root._audioContext,
                        root: root,
                        event: streamedObject
                    });
                    soundMeter.connectToSource(stream);
                }
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

                if (isData(root.session)) onSessionOpened();
            }

            function updateSocket() {
                // todo: need to check following {if-block} MUST not affect "redial" process
                if (socket.userid == _config.userid)
                    return;

                socket.userid = _config.userid;
                sockets[_config.socketIndex] = socket;

                // connection.peers['user-id'].addStream({audio:true})
                root.peers[_config.userid] = {
                    socket: socket,
                    peer: peer,
                    userid: _config.userid,
                    extra: _config.extra,
                    addStream: function(session00) {
                        // connection.peers['user-id'].addStream({audio: true, video: true);

                        root.addStream(session00, this.socket);
                    },
                    renegotiate: function(stream) {
                        // connection.peers['user-id'].renegotiate();

                        root.renegotiate(stream);
                    },
                    changeBandwidth: function(bandwidth) {
                        // connection.peers['user-id'].changeBandwidth();

                        if (!bandwidth) throw 'You MUST pass bandwidth object.';
                        if (typeof bandwidth == 'string') throw 'Pass object for bandwidth instead of string; e.g. {audio:10, video:20}';

                        // set bandwidth for self
                        this.peer.bandwidth = bandwidth;

                        // ask remote user to synchronize bandwidth
                        this.socket.send({
                            userid: root.userid,
                            extra: root.extra || { },
                            changeBandwidth: true,
                            bandwidth: bandwidth
                        });
                    },
                    sendCustomMessage: function(message) {
                        // connection.peers['user-id'].sendCustomMessage();

                        this.socket.send({
                            userid: root.userid,
                            extra: root.extra || { },
                            customMessage: true,
                            message: message
                        });
                    },
                    onCustomMessage: function(message) {
                        log('Received "private" message from', this.userid,
                            typeof message == 'string' ? message : toStr(message));
                    },
                    drop: function(dontSendMessage) {
                        // connection.peers['user-id'].drop();

                        for (var stream in root.streams) {
                            if (root._skip.indexOf(stream) == -1) {
                                stream = root.streams[stream];

                                if (stream.userid == root.userid && stream.type == 'local') {
                                    this.peer.connection.removeStream(stream.stream);
                                    root.onstreamended(stream.streamObject);
                                }

                                if (stream.type == 'remote' && stream.userid == this.userid) {
                                    root.onstreamended(stream.streamObject);
                                }
                            }
                        }

                        !dontSendMessage && this.socket.send({
                            userid: root.userid,
                            extra: root.extra || { },
                            drop: true
                        });
                    },
                    hold: function() {
                        // connection.peers['user-id'].hold();

                        this.peer.hold = true;
                        this.socket.send({
                            userid: root.userid,
                            extra: root.extra || { },
                            hold: true
                        });
                    },
                    unhold: function() {
                        // connection.peers['user-id'].unhold();

                        this.peer.hold = false;
                        this.socket.send({
                            userid: root.userid,
                            extra: root.extra || { },
                            unhold: true
                        });
                    },
                    fireHoldUnHoldEvents: function(hold) {
                        for (var stream in root.streams) {
                            if (root._skip.indexOf(stream) == -1) {
                                stream = root.streams[stream];

                                if (stream.userid == root.userid && stream.type == 'local') {
                                    this.peer.connection.removeStream(stream.stream);
                                }

                                // www.RTCMultiConnection.org/docs/onhold/
                                if (hold && root.onhold) root.onhold(stream.streamObject);

                                // www.RTCMultiConnection.org/docs/onunhold/
                                if (hold && root.onunhold) root.onunhold(stream.streamObject);
                            }
                        }
                    },
                    redial: function() {
                        // connection.peers['user-id'].redial();

                        // 1st of all; remove all relevant remote media streams
                        for (var stream in root.streams) {
                            if (root._skip.indexOf(stream) == -1) {
                                stream = root.streams[stream];

                                if (stream.userid == this.userid && stream.type == 'remote') {
                                    root.onstreamended(stream.streamObject);
                                }
                            }
                        }

                        log('ReDialing...');

                        socket.send({
                            userid: root.userid,
                            extra: root.extra,
                            recreatePeer: true
                        });

                        peer = new PeerConnection();
                        peer.create('offer', peerConfig);
                    }
                };
            }

            function onSessionOpened() {
                // admin/guest is one-to-one relationship
                if (root.userType && root.direction !== 'many-to-many') return;

                // original conferencing infrastructure!
                if (!root.session.oneway && !root.session.broadcast && root.isInitiator && getLength(participants) > 1 && getLength(participants) <= root.maxParticipantsAllowed) {
                    defaultSocket.send({
                        newParticipant: _config.userid || socket.channel,
                        userid: self.userid,
                        extra: _config.extra || { }
                    });
                }
            }

            function socketResponse(response) {
                if (response.userid == root.userid)
                    return;

                if (response.sdp) {
                    _config.userid = response.userid;
                    _config.extra = response.extra || { };
                    _config.renegotiate = response.renegotiate;
                    _config.streaminfo = response.streaminfo;

                    var sdp = JSON.parse(response.sdp);

                    if (sdp.type == 'offer') {
                        // to synchronize SCTP or RTP
                        peerConfig.preferSCTP = !!response.preferSCTP;
                        root.fakeDataChannels = !!response.fakeDataChannels;
                    }

                    // initializing fake channel
                    initFakeChannel();

                    sdpInvoker(sdp, response.labels);
                }

                if (response.candidate) {
                    peer && peer.addIceCandidate({
                        sdpMLineIndex: response.candidate.sdpMLineIndex,
                        candidate: JSON.parse(response.candidate.candidate)
                    });
                }

                if (response.mute || response.unmute) {
                    if (response.promptMuteUnmute) {
                        if (response.mute) root.streams[response.streamid].mute(response.session);
                        if (response.unmute) root.streams[response.streamid].unmute(response.session);
                    } else {
                        if (root.streams[response.streamid])
                            response.mediaElement = root.streams[response.streamid].mediaElement;

                        if (response.mute) root.onmute(response);
                        if (response.unmute) root.onunmute(response);
                    }
                }

                // to stop local stream
                if (response.stopped) {
                    if (root.streams[response.streamid])
                        response.mediaElement = root.streams[response.streamid].mediaElement;

                    root.onstreamended(response);
                }

                // to stop remote stream
                if (response.promptStreamStop && !root.isInitiator) {
                    warn('What if initiator invoked stream.stop for remote user?');
                    // todo: need to stop stream; however "close" or "leave" method MUST not affect it.
                    // if (root.streams[response.streamid]) root.streams[response.streamid].stop();
                }

                if (response.left) {
                    // firefox is unable to stop remote streams
                    // firefox doesn't auto stop streams when peer.close() is called.
                    if (isFirefox) {
                        var userLeft = response.userid;
                        for (var stream in root.streams) {
                            stream = root.streams[stream];
                            if (stream.userid == userLeft) {
                                stopTracks(stream);
                                stream.stream.onended(stream.streamObject);
                            }
                        }
                    }

                    if (peer && peer.connection) {
                        peer.connection.close();
                        peer.connection = null;
                    }

                    if (response.closeEntireSession) {
                        root.close();
                        root.refresh();
                    } else if (socket && response.ejected) {
                        // if user is ejected; his stream MUST be removed
                        // from all other users' side
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

                    root.remove(response.userid);

                    if (participants[response.userid]) delete participants[response.userid];

                    root.onleave({
                        userid: response.userid,
                        extra: response.extra
                    });

                    if (root.userType) root.busy = false;
                }

                // keeping session active even if initiator leaves
                if (response.playRoleOfBroadcaster) {
                    if (response.extra) {
                        root.extra = merge(root.extra, response.extra);
                    }
                    setTimeout(root.playRoleOfInitiator, 2000);
                }

                if (response.isCreateDataChannel) {
                    if (isFirefox) {
                        peer.createDataChannel();
                    }
                }

                if (response.changeBandwidth) {
                    if (!root.peers[response.userid]) throw 'No such peer exists.';

                    // synchronize bandwidth
                    root.peers[response.userid].peer.bandwidth = response.bandwidth;

                    // renegotiate to apply bandwidth
                    root.peers[response.userid].renegotiate();
                }

                if (response.customMessage) {
                    if (!root.peers[response.userid]) throw 'No such peer exists.';
                    root.peers[response.userid].onCustomMessage(response.message);
                }

                if (response.drop) {
                    if (!root.peers[response.userid]) throw 'No such peer exists.';
                    root.peers[response.userid].drop(true);
                    root.peers[response.userid].renegotiate();

                    root.ondrop(response.userid);
                }

                if (response.hold) {
                    if (!root.peers[response.userid]) throw 'No such peer exists.';
                    root.peers[response.userid].peer.hold = true;
                    root.peers[response.userid].renegotiate();
                }

                if (response.unhold) {
                    if (!root.peers[response.userid]) throw 'No such peer exists.';
                    root.peers[response.userid].peer.hold = false;
                    root.peers[response.userid].renegotiate();
                }

                // fake data channels!
                if (response.fakeData) {
                    peerConfig.onmessage(response.fakeData);
                }

                if (response.recreatePeer) {
                    peer = new PeerConnection();
                }
            }

            root.playRoleOfInitiator = function() {
                root.dontAttachStream = true;
                root.open();
                sockets = swap(sockets);
                root.dontAttachStream = false;
            };

            function sdpInvoker(sdp, labels) {
                log(sdp.type, sdp.sdp);

                if (sdp.type == 'answer') {
                    peer.setRemoteDescription(sdp);
                    updateSocket();
                    return;
                }
                if (!_config.renegotiate && sdp.type == 'offer') {
                    peerConfig.offerDescription = sdp;
                    peerConfig.session = _config.session || root.session;
                    if (!peer) peer = new PeerConnection();
                    peer.create('answer', peerConfig);

                    updateSocket();
                    return;
                }

                root.session = _config.renegotiate;
                // detach streams
                detachMediaStream(labels, peer.connection);

                if (root.session.oneway || isData(root.session)) {
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
                    peer.recreateAnswer(sdp, root.session, function(_sdp, streaminfo) {
                        sendsdp({
                            sdp: _sdp,
                            socket: socket,
                            streaminfo: streaminfo
                        });
                    });
                }
            }
        }

        function detachMediaStream(labels, peer) {
            if (!labels) return;
            for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                if (root.streams[label]) {
                    peer.removeStream(root.streams[label].stream);
                }
            }
        }

        function sendsdp(e) {
            e.socket.send({
                userid: self.userid,
                sdp: JSON.stringify(e.sdp),
                extra: root.extra,
                renegotiate: !!e.renegotiate ? e.renegotiate : false,
                streaminfo: e.streaminfo || '',
                labels: e.labels || [],
                preferSCTP: !!root.preferSCTP,
                fakeDataChannels: !!root.fakeDataChannels
            });
        }

        // sharing new user with existing participants

        function onNewParticipant(response) {
            var channel = response.newParticipant;

            if (!channel || !!participants[channel] || channel == self.userid)
                return;

            participants[channel] = channel;

            var new_channel = root.token();
            newPrivateSocket({
                channel: new_channel,
                extra: response.extra || { },
                userid: response.userid
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

            if (root.isInitiator) {
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
                    alert.ejected = true;
                    socket.send(alert);

                    if (sockets[socket.index])
                        delete sockets[socket.index];

                    delete socketObjects[channel];
                }
            }

            sockets = swap(sockets);
        }

        // www.RTCMultiConnection.org/docs/remove/
        root.remove = function(userid) {
            if (self.requestsFrom && self.requestsFrom[userid]) delete self.requestsFrom[userid];

            if (root.peers[userid]) {
                if (root.peers[userid].peer && root.peers[userid].peer.connection) {
                    root.peers[userid].peer.connection.close();
                    root.peers[userid].peer.connection = null;
                }
                delete root.peers[userid];
            }
            if (participants[userid]) {
                delete participants[userid];
            }
            for (var stream in root.streams) {
                stream = root.streams[stream];
                if (stream.userid == userid) {
                    root.onstreamended(stream.streamObject);
                    if (stream.stop) stream.stop();
                    delete root.streams[stream];
                }
            }
            if (socketObjects[userid]) {
                delete socketObjects[userid];
            }
        };

        // www.RTCMultiConnection.org/docs/refresh/
        root.refresh = function() {
            participants = [];
            root.joinedARoom = self.joinedARoom = false;
            isAcceptNewSession = true;
            root.busy = false;

            // to stop/remove self streams
            for (var i = 0; i < root.attachStreams.length; i++) {
                stopTracks(root.attachStreams[i]);
            }
            root.attachStreams = [];

            // to allow capturing of identical streams
            currentUserMediaRequest = {
                streams: [],
                mutex: false,
                queueRequests: []
            };
            that.isOwnerLeaving = true;
            root.isInitiator = false;
        };

        // www.RTCMultiConnection.org/docs/reject/
        root.reject = function(userid) {
            if (typeof userid != 'string') userid = userid.userid;
            defaultSocket.send({
                rejectedRequestOf: userid,
                userid: root.userid,
                extra: root.extra || { }
            });
        };

        window.addEventListener('beforeunload', function() {
            clearSession();
        }, false);

        window.addEventListener('keydown', function(e) {
            if (e.keyCode == 116)
                clearSession();
        }, false);

        function initDefaultSocket() {
            defaultSocket = root.openSignalingChannel({
                onmessage: function(response) {
                    if (response.userid == self.userid) return;

                    if (isAcceptNewSession && response.sessionid && response.userid) {
                        root.session = response.session;
                        onNewSession(response);
                    }

                    if (response.newParticipant && self.joinedARoom && self.broadcasterid === response.userid) {
                        onNewParticipant(response);
                    }

                    if (getLength(participants) < root.maxParticipantsAllowed && response.userid && response.targetUser == self.userid && response.participant && !participants[response.userid]) {
                        acceptRequest(response);
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
                                root.reject(response.userid);
                            }
                        }
                    }

                    if (response.acceptedRequestOf == self.userid) {
                        if (root.onstats) root.onstats('accepted', response);
                    }

                    if (response.rejectedRequestOf == self.userid) {
                        if (root.onstats) root.onstats(root.userType ? 'busy' : 'rejected', response);
                        sendRequest();
                    }

                    if (response.customMessage) {
                        if (response.message.drop) {
                            root.ondrop(response.userid);

                            root.attachStreams = [];
                            // "drop" should detach all local streams
                            for (var stream in root.streams) {
                                if (root._skip.indexOf(stream) == -1) {
                                    stream = root.streams[stream];
                                    if (stream.type == 'local') {
                                        root.detachStreams.push(stream.streamid);
                                        root.onstreamended(stream.streamObject);
                                    } else root.onstreamended(stream.streamObject);
                                }
                            }

                            if (response.message.renegotiate) {
                                // renegotiate; so "peer.removeStream" happens.
                                root.addStream();
                            }
                        } else if (root.onCustomMessage) {
                            root.onCustomMessage(response.message);
                        }
                    }
                },
                callback: function(socket) {
                    if (socket) defaultSocket = socket;
                    if (root.userType) sendRequest(socket || defaultSocket);
                },
                onopen: function(socket) {
                    if (socket) defaultSocket = socket;
                    if (root.userType) sendRequest(socket || defaultSocket);
                }
            });
        }

        var that = this,
            defaultSocket;

        initDefaultSocket();

        function sendRequest(socket) {
            if (!socket) {
                return setTimeout(function() {
                    sendRequest(defaultSocket);
                }, 1000);
            }

            socket.send({
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
                if (!root.maxParticipantsAllowed || root.maxParticipantsAllowed == 1) {
                    root.maxParticipantsAllowed = 256;
                }
            }
        }

        // open new session
        this.initSession = function() {
            that.isOwnerLeaving = false;
            root.isInitiator = true;

            setDirections();
            participants = { };

            self.sessionid = root.sessionid || root.channel;

            this.isOwnerLeaving = isAcceptNewSession = false;
            self.joinedARoom = true;

            (function transmit() {
                if (getLength(participants) < root.maxParticipantsAllowed && !that.isOwnerLeaving) {
                    defaultSocket && defaultSocket.send({
                        sessionid: self.sessionid,
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
        this.joinSession = function(_config) {
            _config = _config || { };
            participants = { };
            root.session = _config.session || { };
            self.broadcasterid = _config.userid;

            if (_config.sessionid)
                self.sessionid = _config.sessionid;

            isAcceptNewSession = false;
            self.joinedARoom = true;

            var channel = getRandomString();
            newPrivateSocket({
                channel: channel,
                extra: _config.extra || { },
                userid: _config.userid
            });

            defaultSocket.send({
                participant: true,
                userid: self.userid,
                channel: channel,
                targetUser: _config.userid,
                extra: root.extra,
                session: root.session
            });
        };

        // send file/data or text message
        this.send = function(message, _channel) {
            message = JSON.stringify({
                extra: root.extra,
                userid: root.userid,
                data: message
            });

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

            if (root.isInitiator) {
                that.isOwnerLeaving = true;
                root.isInitiator = false;
            }

            // to stop/remove self streams
            for (var i = 0; i < root.attachStreams.length; i++) {
                stopTracks(root.attachStreams[i]);
            }
            root.attachStreams = [];

            // to allow capturing of identical streams
            currentUserMediaRequest = {
                streams: [],
                mutex: false,
                queueRequests: []
            };

            if (!userid) {
                root.joinedARoom = self.joinedARoom = false;
                isAcceptNewSession = true;
            }

            root.busy = false;
        };

        // renegotiate new stream
        this.addStream = function(e) {
            root.session = e.renegotiate;

            if (e.socket) {
                addStream(root.peers[e.socket.userid]);
            } else {
                for (var peer in root.peers) {
                    addStream(root.peers[peer]);
                }
            }

            function addStream(peer00) {
                var socket = peer00.socket;
                if (!socket) {
                    warn(peer00, 'doesn\'t has socket.');
                    return;
                }

                updateSocketForLocalStreams(socket);

                if (!peer00 || !peer00.peer) {
                    throw 'No peer to renegotiate.';
                }

                peer00 = peer00.peer;

                // detaching old streams
                detachMediaStream(root.detachStreams, peer00.connection);

                if (e.stream && (root.session.audio || root.session.video || root.session.screen)) {
                    peer00.connection.addStream(e.stream);
                }

                peer00.recreateOffer(root.session, function(sdp, streaminfo) {
                    sendsdp({
                        sdp: sdp,
                        socket: socket,
                        renegotiate: root.session,
                        labels: root.detachStreams,
                        streaminfo: streaminfo
                    });
                    root.detachStreams = [];
                });
            }
        };

        // www.RTCMultiConnection.org/docs/request/
        root.request = function(userid, extra) {
            if (root.direction === 'many-to-many') root.busy = true;

            root.captureUserMedia(function() {
                // open private socket that will be used to receive offer-sdp
                newPrivateSocket({
                    channel: root.userid,
                    extra: extra || { },
                    userid: userid
                });

                // ask other user to create offer-sdp
                defaultSocket.send({
                    participant: true,
                    userid: root.userid,
                    extra: root.extra || { },
                    targetUser: userid
                });
            });
        };

        function acceptRequest(response) {
            if (!self.requestsFrom) self.requestsFrom = { };
            if (root.busy || self.requestsFrom[response.userid]) return;

            var obj = {
                userid: response.userid,
                extra: response.extra,
                channel: response.channel || response.userid,
                session: response.session || root.session
            };

            self.requestsFrom[response.userid] = obj;

            // www.RTCMultiConnection.org/docs/onRequest/
            if (root.onRequest) {
                root.onRequest(obj);
            } else _accept(obj);
        }

        function _accept(e) {
            if (root.userType) {
                if (root.direction === 'many-to-many') root.busy = true;
                defaultSocket.send({
                    acceptedRequestOf: e.userid,
                    userid: self.userid,
                    extra: root.extra || { }
                });
            }

            participants[e.userid] = e.userid;
            newPrivateSocket({
                isofferer: true,
                userid: e.userid,
                channel: e.channel,
                extra: e.extra || { },
                session: e.session || root.session
            });
        }

        // www.RTCMultiConnection.org/docs/sendMessage/
        root.sendCustomMessage = function(message) {
            if (!defaultSocket) {
                return setTimeout(function() {
                    root.sendMessage(message);
                }, 1000);
            }

            defaultSocket.send({
                userid: root.userid,
                customMessage: true,
                message: message
            });
        };

        // www.RTCMultiConnection.org/docs/accept/
        root.accept = function(e) {
            // for backward compatibility
            if (arguments.length > 1 && typeof arguments[0] == 'string') {
                e = { };
                if (arguments[0]) e.userid = arguments[0];
                if (arguments[1]) e.extra = arguments[1];
                if (arguments[2]) e.channel = arguments[2];
            }

            root.captureUserMedia(function() {
                _accept(e);
            });
        };
    }

    var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

    function PeerConnection() {
        return {
            create: function(type, options) {
                merge(this, options);

                var self = this;

                this.type = type;
                this.init();
                this.attachMediaStreams();

                if (isData(this.session) && isFirefox) {
                    navigator.mozGetUserMedia({
                            audio: true,
                            fake: true
                        }, function(stream) {
                            self.connection.addStream(stream);

                            if (type == 'offer') {
                                self.createDataChannel();
                            }

                            self.getLocalDescription(type);

                            if (type == 'answer') {
                                self.createDataChannel();
                            }
                        }, this.onMediaError);
                }

                if (!isData(this.session) && isFirefox) {
                    if (this.session.data && type == 'offer') {
                        this.createDataChannel();
                    }

                    this.getLocalDescription(type);

                    if (this.session.data && type == 'answer') {
                        this.createDataChannel();
                    }
                }

                isChrome && self.getLocalDescription(type);
                return this;
            },
            getLocalDescription: function(type) {
                log('peer type is', type);

                if (type == 'answer') {
                    this.setRemoteDescription(this.offerDescription);
                }

                var self = this;
                this.connection[type == 'offer' ? 'createOffer' : 'createAnswer'](function(sessionDescription) {
                    sessionDescription.sdp = self.serializeSdp(sessionDescription.sdp);
                    self.connection.setLocalDescription(sessionDescription);
                    self.onSessionDescription(sessionDescription, self.streaminfo);
                }, this.onSdpError, this.constraints);
            },
            serializeSdp: function(sdp) {
                sdp = this.setBandwidth(sdp);
                if (this.hold) {
                    sdp = sdp.replace( /sendonly|recvonly|sendrecv/g , 'inactive');
                } else if (this.prevSDP) {
                    sdp = sdp.replace( /inactive/g , 'sendrecv');
                }
                return sdp;
            },
            init: function() {
                this.setConstraints();
                this.connection = new RTCPeerConnection(this.iceServers, this.optionalArgument);

                if (this.session.data && isChrome) {
                    this.createDataChannel();
                }

                this.connection.onicecandidate = function(event) {
                    if (event.candidate) {
                        self.onicecandidate(event.candidate);
                    }
                };

                this.connection.onaddstream = function(e) {
                    log('onaddstream', e.stream);

                    self.onaddstream(e.stream);
                };

                this.connection.onremovestream = function(e) {
                    self.onremovestream(e.stream);
                };

                this.connection.onsignalingstatechange = function() {
                    self.connection && self.oniceconnectionstatechange({
                        iceConnectionState: self.connection.iceConnectionState,
                        iceGatheringState: self.connection.iceGatheringState,
                        signalingState: self.connection.signalingState
                    });
                };

                this.connection.oniceconnectionstatechange = function() {
                    self.connection && self.oniceconnectionstatechange({
                        iceConnectionState: self.connection.iceConnectionState,
                        iceGatheringState: self.connection.iceGatheringState,
                        signalingState: self.connection.signalingState
                    });
                };
                var self = this;
            },
            setBandwidth: function(sdp) {
                // sdp.replace( /a=sendrecv\r\n/g , 'a=sendrecv\r\nb=AS:50\r\n');

                if (isMobileDevice || isFirefox || !this.bandwidth) return sdp;

                var bandwidth = this.bandwidth;

                // if screen; must use at least 300kbs
                if (this.session.screen && isEmpty(bandwidth)) {
                    sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');
                    sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\nb=AS:300\r\n');
                }

                // remove existing bandwidth lines
                if (bandwidth.audio || bandwidth.video || bandwidth.data) {
                    sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');
                }

                if (bandwidth.audio) {
                    sdp = sdp.replace( /a=mid:audio\r\n/g , 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
                }

                if (bandwidth.video) {
                    sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\nb=AS:' + (this.session.screen ? '300' : bandwidth.video) + '\r\n');
                }

                if (bandwidth.data && !this.preferSCTP) {
                    sdp = sdp.replace( /a=mid:data\r\n/g , 'a=mid:data\r\nb=AS:' + bandwidth.data + '\r\n');
                }

                return sdp;
            },
            setConstraints: function() {
                this.constraints = {
                    optional: this.sdpConstraints.optional || [],
                    mandatory: this.sdpConstraints.mandatory || {
                        OfferToReceiveAudio: !!this.session.audio,
                        OfferToReceiveVideo: !!this.session.video || !!this.session.screen
                    }
                };

                // workaround for older firefox
                if (this.session.data && isFirefox && this.constraints.mandatory) {
                    this.constraints.mandatory.OfferToReceiveAudio = true;
                }

                log('sdp-constraints', toStr(this.constraints.mandatory));

                this.optionalArgument = {
                    optional: this.optionalArgument.optional || [{
                        DtlsSrtpKeyAgreement: true
                    }],
                    mandatory: this.optionalArgument.mandatory || { }
                };

                if (isChrome && chromeVersion >= 32) {
                    this.optionalArgument.optional.push({
                        googIPv6: true
                    });
                    // this.optionalArgument.optional.push({ googDscp: true });
                }

                if (!this.preferSCTP) {
                    this.optionalArgument.optional.push({
                        RtpDataChannels: true
                    });
                }

                log('optional-argument', toStr(this.optionalArgument.optional));

                this.iceServers = {
                    iceServers: this.iceServers
                };

                log('ice-servers', toStr(this.iceServers.iceServers));
            },
            onSdpError: function(e) {
                var message = toStr(e);

                if (message && message.indexOf('RTP/SAVPF Expects at least 4 fields') != -1) {
                    message = 'It seems that you are trying to interop RTP-datachannels with SCTP. It is not supported!';
                }
                error('onSdpError:', message);
            },
            onMediaError: function(err) {
                error(toStr(err));
            },
            setRemoteDescription: function(sessionDescription) {
                if (!sessionDescription) throw 'Remote session description should NOT be NULL.';

                log('setting remote description', sessionDescription.type, sessionDescription.sdp);
                this.connection.setRemoteDescription(
                    new RTCSessionDescription(sessionDescription)
                );
            },
            addIceCandidate: function(candidate) {
                this.connection.addIceCandidate(new RTCIceCandidate({
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: candidate.candidate
                }));
            },
            createDataChannel: function(channelIdentifier) {
                if (!this.channels) this.channels = [];

                // protocol: 'text/chat', preset: true, stream: 16
                // maxRetransmits:0 && ordered:false
                var dataChannelDict = { };

                if (this.dataChannelDict) dataChannelDict = this.dataChannelDict;

                if (isChrome && !this.preferSCTP) {
                    dataChannelDict.reliable = false; // Deprecated!
                }

                log('dataChannelDict', toStr(dataChannelDict));

                if (isFirefox) {
                    this.connection.onconnection = function() {
                        self.socket.send({
                            userid: self.selfUserid,
                            isCreateDataChannel: true
                        });
                    };
                }

                if (this.type == 'answer' || isFirefox) {
                    this.connection.ondatachannel = function(event) {
                        self.setChannelEvents(event.channel);
                    };
                }

                if ((isChrome && this.type == 'offer') || isFirefox) {
                    this.setChannelEvents(
                        this.connection.createDataChannel(channelIdentifier || 'channel', dataChannelDict)
                    );
                }

                var self = this;
            },
            setChannelEvents: function(channel) {
                var self = this;
                channel.onmessage = function(event) {
                    self.onmessage(event.data);
                };
                channel.onopen = function() {
                    channel.push = channel.send;
                    channel.send = function(data) {
                        if (channel.readyState != 'open') {
                            return setTimeout(function() {
                                channel.send(data);
                            }, 1000);
                        }
                        try {
                            channel.push(data);
                        } catch(e) {
                            warn('Data transmission failed. Re-transmitting..', toStr(e));
                            return setTimeout(function() {
                                channel.send(data);
                            }, 100);
                        }
                    };
                    self.onopen(channel);
                };

                channel.onerror = function(event) {
                    self.onerror(event);
                };

                channel.onclose = function(event) {
                    self.onclose(event);
                };

                this.channels.push(channel);
            },
            attachMediaStreams: function() {
                var streams = this.attachStreams;
                for (var i = 0; i < streams.length; i++) {
                    log('attaching stream:', streams[i].streamid);
                    this.connection.addStream(streams[i]);
                }
                this.attachStreams = [];
                this.getStreamInfo();
            },
            getStreamInfo: function() {
                this.streaminfo = '';
                var streams = this.connection.getLocalStreams();
                for (var i = 0; i < streams.length; i++) {
                    if (i == 0) {
                        this.streaminfo = streams[i].streamid;
                    } else {
                        this.streaminfo += '----' + streams[i].streamid;
                    }
                }
            },
            recreateOffer: function(renegotiate, callback) {
                // if(isFirefox) this.create(this.type, this);

                log('recreating offer');

                this.type = 'offer';
                this.renegotiate = true;
                this.session = renegotiate;
                this.setConstraints();

                this.onSessionDescription = callback;
                this.getStreamInfo();

                // one can renegotiate data connection in existing audio/video/screen connection!
                if (this.session.data && isChrome) {
                    this.createDataChannel();
                }

                this.getLocalDescription('offer');
            },
            recreateAnswer: function(sdp, session, callback) {
                // if(isFirefox) this.create(this.type, this);

                log('recreating answer');

                this.type = 'answer';
                this.renegotiate = true;
                this.session = session;
                this.setConstraints();

                this.onSessionDescription = callback;
                this.offerDescription = sdp;
                this.getStreamInfo();

                // one can renegotiate data connection in existing audio/video/screen connection!
                if (this.session.data && isChrome) {
                    this.createDataChannel();
                }

                this.getLocalDescription('answer');
            }
        };
    }

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

        // tools.ietf.org/html/draft-alvestrand-constraints-resolution-00
        var mediaConstraints = options.mediaConstraints || { };
        var n = navigator,
            hints = options.constraints || {
                audio: true,
                video: video_constraints
            };

        if (hints.video == true) hints.video = video_constraints;

        // connection.mediaConstraints.audio = false;
        if (typeof mediaConstraints.audio != 'undefined') {
            hints.audio = mediaConstraints.audio;
        }

        // connection.media.min(320,180);
        // connection.media.max(1920,1080);
        var media = options.media;
        if (isChrome) {
            var mandatory = {
                minWidth: media.minWidth,
                minHeight: media.minHeight,
                maxWidth: media.maxWidth,
                maxHeight: media.maxHeight,
                minAspectRatio: media.minAspectRatio
            };

            // code.google.com/p/chromium/issues/detail?id=143631#c9
            var allowed = ['1920:1080', '1280:720', '960:720', '640:360', '640:480', '320:240', '320:180'];

            if (allowed.indexOf(mandatory.minWidth + ':' + mandatory.minHeight) == -1 ||
                allowed.indexOf(mandatory.maxWidth + ':' + mandatory.maxHeight) == -1) {
                error('The min/max width/height constraints you passed "seems" NOT supported.', toStr(mandatory));
            }

            if (mandatory.minWidth > mandatory.maxWidth || mandatory.minHeight > mandatory.maxHeight) {
                error('Minimum value must not exceed maximum value.', toStr(mandatory));
            }

            if (mandatory.minWidth >= 1280 && mandatory.minHeight >= 720) {
                warn('Enjoy HD video! min/' + mandatory.minWidth + ':' + mandatory.minHeight + ', max/' + mandatory.maxWidth + ':' + mandatory.maxHeight);
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
                video[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
                video.play();
            }

            options.onsuccess(stream, returnBack, idInstance);
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
                error(toStr(e));
            });
        }
    }

    var FileSender = {
        send: function(config) {
            var root = config.root;
            var channel = config.channel;
            var privateChannel = config._channel;
            var file = config.file;

            if (!config.file) {
                console.error('You must attach/select a file.');
                return;
            }

            // max chunk sending limit on chrome is 64k
            // max chunk receiving limit on firefox is 16k
            var packetSize = (!!navigator.mozGetUserMedia || root.preferSCTP) ? 15 * 1000 : 1 * 1000;

            if (root.chunkSize) {
                packetSize = root.chunkSize;
            }

            var textToTransfer = '';
            var numberOfPackets = 0;
            var packets = 0;

            file.uuid = getRandomString();

            function processInWebWorker() {
                var blob = URL.createObjectURL(new Blob(['function readFile(_file) {postMessage(new FileReaderSync().readAsDataURL(_file));};this.onmessage =  function (e) {readFile(e.data);}'], {
                    type: 'application/javascript'
                }));

                var worker = new Worker(blob);
                URL.revokeObjectURL(blob);
                return worker;
            }

            if (!!window.Worker && !isMobileDevice) {
                var webWorker = processInWebWorker();

                webWorker.onmessage = function(event) {
                    onReadAsDataURL(event.data);
                };

                webWorker.postMessage(file);
            } else {
                var reader = new FileReader();
                reader.onload = function(e) {
                    onReadAsDataURL(e.target.result);
                };
                reader.readAsDataURL(file);
            }

            function onReadAsDataURL(dataURL, text) {
                var data = {
                    type: 'file',
                    uuid: file.uuid,
                    maxChunks: numberOfPackets,
                    currentPosition: numberOfPackets - packets,
                    name: file.name,
                    fileType: file.type,
                    size: file.size
                };

                if (dataURL) {
                    text = dataURL;
                    numberOfPackets = packets = data.packets = parseInt(text.length / packetSize);

                    file.maxChunks = data.maxChunks = numberOfPackets;
                    data.currentPosition = numberOfPackets - packets;

                    root.onFileStart(file);
                }

                root.onFileProgress({
                    remaining: packets--,
                    length: numberOfPackets,
                    sent: numberOfPackets - packets,

                    maxChunks: numberOfPackets,
                    uuid: file.uuid,
                    currentPosition: numberOfPackets - packets
                }, file.uuid);

                if (text.length > packetSize) data.message = text.slice(0, packetSize);
                else {
                    data.message = text;
                    data.last = true;
                    data.name = file.name;
                    data.extra = root.extra || { };

                    file.url = URL.createObjectURL(file);
                    root.onFileEnd(file);
                }

                channel.send(data, privateChannel);

                textToTransfer = text.slice(data.message.length);
                if (textToTransfer.length) {
                    setTimeout(function() {
                        onReadAsDataURL(null, textToTransfer);
                    }, root.chunkInterval || 100);
                }
            }
        }
    };

    function FileReceiver(root) {
        var content = { },
            packets = { },
            numberOfPackets = { };

        function receive(data) {
            var uuid = data.uuid;

            if (typeof data.packets !== 'undefined') {
                numberOfPackets[uuid] = packets[uuid] = parseInt(data.packets);
                root.onFileStart(data);
            }

            root.onFileProgress({
                remaining: packets[uuid]--,
                length: numberOfPackets[uuid],
                received: numberOfPackets[uuid] - packets[uuid],

                maxChunks: numberOfPackets[uuid],
                uuid: uuid,
                currentPosition: numberOfPackets[uuid] - packets[uuid]
            }, uuid);

            if (!content[uuid]) content[uuid] = [];

            content[uuid].push(data.message);

            if (data.last) {
                var dataURL = content[uuid].join('');

                FileConverter.DataURLToBlob(dataURL, data.fileType, function(blob) {
                    blob.uuid = uuid;
                    blob.name = data.name;
                    blob.type = data.fileType;
                    blob.extra = data.extra || { };

                    blob.url = (window.URL || window.webkitURL).createObjectURL(blob);

                    if (root.autoSaveToDisk) {
                        FileSaver.SaveToDisk(blob.url, data.name);
                    }

                    root.onFileEnd(blob);

                    delete content[uuid];
                });
            }
        }

        return {
            receive: receive
        };
    }

    var FileSaver = {
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

    var FileConverter = {
        DataURLToBlob: function(dataURL, fileType, callback) {

            function processInWebWorker() {
                var blob = URL.createObjectURL(new Blob(['function getBlob(_dataURL, _fileType) {var binary = atob(_dataURL.substr(_dataURL.indexOf(",") + 1)),i = binary.length,view = new Uint8Array(i);while (i--) {view[i] = binary.charCodeAt(i);};postMessage(new Blob([view], {type: _fileType}));};this.onmessage =  function (e) {var data = JSON.parse(e.data); getBlob(data.dataURL, data.fileType);}'], {
                    type: 'application/javascript'
                }));

                var worker = new Worker(blob);
                URL.revokeObjectURL(blob);
                return worker;
            }

            if (!!window.Worker && !isMobileDevice) {
                var webWorker = processInWebWorker();

                webWorker.onmessage = function(event) {
                    callback(event.data);
                };

                webWorker.postMessage(JSON.stringify({
                    dataURL: dataURL,
                    fileType: fileType
                }));
            } else {
                var binary = atob(dataURL.substr(dataURL.indexOf(',') + 1)),
                    i = binary.length,
                    view = new Uint8Array(i);

                while (i--) {
                    view[i] = binary.charCodeAt(i);
                }

                callback(new Blob([view]));
            }
        }
    };

    var TextSender = {
        send: function(config) {
            var root = config.root;

            var channel = config.channel,
                _channel = config._channel,
                initialText = config.text,
                packetSize = root.chunkSize || 1000,
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
                    setTimeout(function() {
                        sendText(null, textToTransfer);
                    }, root.chunkInterval || 100);
                }
            }
        }
    };

    // _______________
    // TextReceiver.js

    function TextReceiver(root) {
        var content = { };

        function receive(data, userid, extra) {
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

                var e = {
                    data: message,
                    userid: userid,
                    extra: extra,
                    latency: latency
                };

                if (root.autoTranslateText) {
                    e.original = e.data;
                    root.Translator.TranslateText(e.data, function(translatedText) {
                        e.data = translatedText;
                        root.onmessage(e);
                    });
                } else root.onmessage(e);

                delete content[uuid];
            }
        }

        return {
            receive: receive
        };
    }

    // Sound meter is used to detect speaker
    // SoundMeter.js copyright goes to someone else!

    function SoundMeter(config) {
        var root = config.root;
        var context = config.context;
        this.context = context;
        this.volume = 0.0;
        this.slow_volume = 0.0;
        this.clip = 0.0;

        // Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384)
        this.script = context.createScriptProcessor(256, 1, 1);
        that = this;

        this.script.onaudioprocess = function(event) {
            var input = event.inputBuffer.getChannelData(0);
            var i;
            var sum = 0.0;
            var clipcount = 0;
            for (i = 0; i < input.length; ++i) {
                sum += input[i] * input[i];
                if (Math.abs(input[i]) > 0.99) {
                    clipcount += 1;
                }
            }
            that.volume = Math.sqrt(sum / input.length);

            var volume = that.volume.toFixed(2);

            if (volume >= .1 && root.onspeaking) {
                root.onspeaking(config.event);
            }

            if (volume < .1 && root.onsilence) {
                root.onsilence(config.event);
            }
        };
    }

    SoundMeter.prototype.connectToSource = function(stream) {
        this.mic = this.context.createMediaStreamSource(stream);
        this.mic.connect(this.script);
        this.script.connect(this.context.destination);
    };

    SoundMeter.prototype.stop = function() {
        this.mic.disconnect();
        this.script.disconnect();
    };


    var isChrome = !!navigator.webkitGetUserMedia;
    var isFirefox = !!navigator.mozGetUserMedia;
    var isMobileDevice = navigator.userAgent.match( /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i );

    window.MediaStream = window.MediaStream || window.webkitMediaStream;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    function getRandomString() {
        return (Math.random() * new Date().getTime()).toString(36).replace( /\./g , '');
    }

    var chromeVersion = !!navigator.mozGetUserMedia ? 0 : parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]);

    function isData(session) {
        return !session.audio && !session.video && !session.screen && session.data;
    }

    function isEmpty(session) {
        var length = 0;
        for (var s in session) {
            length++;
        }
        return length == 0;
    }

    function swap(arr) {
        var swapped = [],
            length = arr.length;
        for (var i = 0; i < length; i++)
            if (arr[i] && arr[i] !== true)
                swapped.push(arr[i]);
        return swapped;
    }

    function log() {
        if (window.skipRTCMultiConnectionLogs) return;
        console.log(Array.prototype.slice.call(arguments).join('\n'));
    }

    function error() {
        console.error(Array.prototype.slice.call(arguments).join('\n'));
    }

    function warn() {
        if (window.skipRTCMultiConnectionLogs) return;
        console.warn(Array.prototype.slice.call(arguments).join('\n'));
    }

    function toStr(obj) {
        return JSON.stringify(obj, function(key, value) {
            if (value && value.sdp) {
                console.log(value.sdp.type, '\t', value.sdp.sdp);
                return '';
            } else return value;
        }, '\t');
    }

    function getLength(obj) {
        var length = 0;
        for (var o in obj)
            if (o) length++;
        return length;
    }

    // Get HTMLAudioElement/HTMLVideoElement accordingly

    function createMediaElement(stream, session) {
        var isAudio = session.audio && !session.video && !session.screen;
        if (isChrome && stream.getAudioTracks && stream.getVideoTracks) {
            isAudio = stream.getAudioTracks().length && !stream.getVideoTracks().length;
        }

        var mediaElement = document.createElement(isAudio ? 'audio' : 'video');

        // "mozSrcObject" is always preferred over "src"!!
        mediaElement[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);

        mediaElement.controls = true;
        mediaElement.autoplay = !!session.remote;
        mediaElement.volume = session.remote ? 1 : 0;

        if (!session.remote) {
            mediaElement.muted = true;
        }

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
        if (root.socket) {
            if (root.type == 'local')
                root.socket.send({
                    userid: root.rtcMultiConnection.userid,
                    streamid: root.streamid,
                    mute: !!enabled,
                    unmute: !enabled,
                    session: session
                });

            if (root.type == 'remote')
                root.socket.send({
                    userid: root.rtcMultiConnection.userid,
                    promptMuteUnmute: true,
                    streamid: root.streamid,
                    mute: !!enabled,
                    unmute: !enabled,
                    session: session
                });
        }

        // According to issue #135, onmute/onumute must be fired for self
        root.streamObject.session = session;
        if (!!enabled) {
            root.rtcMultiConnection.onmute(root.streamObject);
        }

        if (!enabled) {
            root.rtcMultiConnection.onunmute(root.streamObject);
        }
    }

    function stopTracks(mediaStream) {
        // if getAudioTracks is not implemented
        if ((!mediaStream.getAudioTracks || !mediaStream.getVideoTracks) && mediaStream.stop) {
            mediaStream.stop();
            return;
        }

        var fallback = false,
            i;

        // MediaStream.stop should be avoided. It still exist and works but 
        // it is removed from the spec and instead MediaStreamTrack.stop should be used
        var audioTracks = mediaStream.getAudioTracks();
        var videoTracks = mediaStream.getVideoTracks();

        for (i = 0; i < audioTracks.length; i++) {
            if (audioTracks[i].stop) {
                // for chrome canary; which has "stop" method; however not functional yet!
                try {
                    audioTracks[i].stop();
                } catch(e) {
                    fallback = true;
                    continue;
                }
            } else {
                fallback = true;
                continue;
            }
        }

        for (i = 0; i < videoTracks.length; i++) {
            if (videoTracks[i].stop) {
                // for chrome canary; which has "stop" method; however not functional yet!
                try {
                    videoTracks[i].stop();
                } catch(e) {
                    fallback = true;
                    continue;
                }
            } else {
                fallback = true;
                continue;
            }
        }

        if (fallback && mediaStream.stop) mediaStream.stop();
    }


    function setDefaults(connection) {
        // www.RTCMultiConnection.org/docs/onmessage/
        connection.onmessage = function(e) {
            log('onmessage', toStr(e));
        };

        // www.RTCMultiConnection.org/docs/onopen/
        connection.onopen = function(e) {
            log('Data connection is opened between you and', e.userid);
        };

        // www.RTCMultiConnection.org/docs/onerror/
        connection.onerror = function(e) {
            error(onerror, toStr(e));
        };

        // www.RTCMultiConnection.org/docs/onclose/
        connection.onclose = function(e) {
            warn('onclose', toStr(e));
        };

        var progressHelper = { };

        // www.RTCMultiConnection.org/docs/body/
        connection.body = document.body;

        // www.RTCMultiConnection.org/docs/autoSaveToDisk/
        // to make sure file-saver dialog is not invoked.
        connection.autoSaveToDisk = false;

        // www.RTCMultiConnection.org/docs/onFileStart/
        connection.onFileStart = function(file) {
            var div = document.createElement('div');
            div.title = file.name;
            div.innerHTML = '<label>0%</label> <progress></progress>';
            connection.body.insertBefore(div, connection.body.firstChild);
            progressHelper[file.uuid] = {
                div: div,
                progress: div.querySelector('progress'),
                label: div.querySelector('label')
            };
            progressHelper[file.uuid].progress.max = file.maxChunks;
        };

        // www.RTCMultiConnection.org/docs/onFileProgress/
        connection.onFileProgress = function(chunk) {
            var helper = progressHelper[chunk.uuid];
            if (!helper) return;
            helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
            updateLabel(helper.progress, helper.label);
        };

        // www.RTCMultiConnection.org/docs/onFileEnd/
        connection.onFileEnd = function(file) {
            if (progressHelper[file.uuid]) progressHelper[file.uuid].div.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';

            // for backward compatibility
            if (connection.onFileSent || connection.onFileReceived) {
                warn('Now, "autoSaveToDisk" is false. Read more here: http://www.RTCMultiConnection.org/docs/autoSaveToDisk/');
                if (connection.onFileSent) connection.onFileSent(file, file.uuid);
                if (connection.onFileReceived) connection.onFileReceived(file.name, file);
            }
        };

        function updateLabel(progress, label) {
            if (progress.position == -1) return;
            var position = +progress.position.toFixed(2).split('.')[1] || 100;
            label.innerHTML = position + '%';
        }

        // www.RTCMultiConnection.org/docs/dontAttachStream/
        connection.dontAttachStream = false;

        // www.RTCMultiConnection.org/docs/onstream/
        connection.onstream = function(e) {
            connection.body.insertBefore(e.mediaElement, connection.body.firstChild);
        };

        // www.RTCMultiConnection.org/docs/onstreamended/
        connection.onstreamended = function(e) {
            if (e.mediaElement && e.mediaElement.parentNode) {
                e.mediaElement.parentNode.removeChild(e.mediaElement);
            }
        };

        // www.RTCMultiConnection.org/docs/onmute/
        connection.onmute = function(e) {
            if (e.session.video) {
                e.mediaElement.setAttribute('poster', '//www.webrtc-experiment.com/images/muted.png');
            }
        };

        // www.RTCMultiConnection.org/docs/onunmute/
        connection.onunmute = function(e) {
            if (e.session.video && e.mediaElement) {
                e.mediaElement.removeAttribute('poster');
            }
        };

        // www.RTCMultiConnection.org/docs/onleave/
        connection.onleave = function(e) {
            log('onleave', toStr(e));
        };

        connection.token = function() {
            // suggested by @rvulpescu from #154
            if (window.crypto) {
                var a = window.crypto.getRandomValues(new Uint32Array(3)),
                    token = '';
                for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
                return token;
            } else {
                return (Math.random() * new Date().getTime()).toString(36).replace( /\./g , '');
            }
        };

        // www.RTCMultiConnection.org/docs/userid/
        connection.userid = connection.token();

        // www.RTCMultiConnection.org/docs/peers/
        connection.peers = { };
        connection.peers[connection.userid] = {
            drop: function() {
                connection.drop();
            }
        };

        connection._skip = ['stop', 'mute', 'unmute', '_private'];

        // www.RTCMultiConnection.org/docs/streams/
        connection.streams = {
            mute: function(session) {
                this._private(session, true);
            },
            unmute: function(session) {
                this._private(session, false);
            },
            _private: function(session, enabled) {
                // implementation from #68
                for (var stream in this) {
                    if (connection._skip.indexOf(stream) == -1) {
                        this[stream]._private(session, enabled);
                    }
                }
            },
            stop: function(type) {
                // connection.streams.stop('local');
                var _stream;
                for (var stream in this) {
                    if (stream != 'stop' && stream != 'mute' && stream != 'unmute' && stream != '_private') {
                        _stream = this[stream];

                        if (!type) _stream.stop();

                        if (type == 'local' && _stream.type == 'local')
                            _stream.stop();

                        if (type == 'remote' && _stream.type == 'remote')
                            _stream.stop();
                    }
                }
            }
        };

        // www.RTCMultiConnection.org/docs/channels/
        connection.channels = { };

        // www.RTCMultiConnection.org/docs/extra/
        connection.extra = { };

        // www.RTCMultiConnection.org/docs/session/
        connection.session = {
            audio: true,
            video: true
        };

        // www.RTCMultiConnection.org/docs/bandwidth/
        connection.bandwidth = { };

        connection.sdpConstraints = { };
        connection.mediaConstraints = { };
        connection.optionalArgument = { };
        connection.dataChannelDict = { };

        var iceServers = [];

        if (isFirefox) {
            iceServers.push({
                url: 'stun:23.21.150.121'
            });

            iceServers.push({
                url: 'stun:stun.services.mozilla.com'
            });
        }

        if (isChrome) {
            iceServers.push({
                url: 'stun:stun.l.google.com:19302'
            });

            iceServers.push({
                url: 'stun:stun.anyfirewall.com:3478'
            });
        }

        if (isChrome && chromeVersion < 28) {
            iceServers.push({
                url: 'turn:homeo@turn.bistri.com:80?transport=udp',
                credential: 'homeo'
            });
            iceServers.push({
                url: 'turn:homeo@turn.bistri.com:80?transport=tcp',
                credential: 'homeo'
            });
        }

        if (isChrome && chromeVersion >= 28) {
            iceServers.push({
                url: 'turn:turn.bistri.com:80?transport=udp',
                credential: 'homeo',
                username: 'homeo'
            });
            iceServers.push({
                url: 'turn:turn.bistri.com:80?transport=tcp',
                credential: 'homeo',
                username: 'homeo'
            });

            iceServers.push({
                url: 'turn:turn.anyfirewall.com:443?transport=tcp',
                credential: 'webrtc',
                username: 'webrtc'
            });
        }
        connection.iceServers = iceServers;

        // www.RTCMultiConnection.org/docs/preferSCTP/
        connection.preferSCTP = chromeVersion >= 32 ? true : false;
        connection.chunkInterval = chromeVersion >= 32 ? 100 : 500; // 500ms for RTP and 100ms for SCTP
        connection.chunkSize = chromeVersion >= 32 ? 13 * 1000 : 1000; // 1000 chars for RTP and 13000 chars for SCTP

        if (isFirefox) {
            connection.preferSCTP = true; // FF supports only SCTP!
        }

        // www.RTCMultiConnection.org/docs/fakeDataChannels/
        connection.fakeDataChannels = false;

        // www.RTCMultiConnection.org/docs/UA/
        connection.UA = {
            Firefox: isFirefox,
            Chrome: isChrome,
            Mobile: isMobileDevice,
            Version: chromeVersion
        };

        // file queue: to store previous file objects in memory;
        // and stream over newly connected peers
        // www.RTCMultiConnection.org/docs/fileQueue/
        connection.fileQueue = { };

        // www.RTCMultiConnection.org/docs/media/
        connection.media = {
            min: function(width, height) {
                this.minWidth = width;
                this.minHeight = height;
            },
            minWidth: 640,
            minHeight: 360,
            max: function(width, height) {
                this.maxWidth = width;
                this.maxHeight = height;
            },
            maxWidth: 1280,
            maxHeight: 720,
            bandwidth: 256,
            minFrameRate: 1,
            maxFrameRate: 30,
            minAspectRatio: 1.77
        };

        // www.RTCMultiConnection.org/docs/candidates/
        connection.candidates = {
            host: true,
            relay: true,
            reflexive: true
        };

        // www.RTCMultiConnection.org/docs/attachStreams/
        connection.attachStreams = [];

        // www.RTCMultiConnection.org/docs/detachStreams/
        connection.detachStreams = [];

        // www.RTCMultiConnection.org/docs/maxParticipantsAllowed/
        connection.maxParticipantsAllowed = 256;

        // www.RTCMultiConnection.org/docs/direction/
        // 'many-to-many' / 'one-to-many' / 'one-to-one' / 'one-way'
        connection.direction = 'many-to-many';

        connection._getStream = function(e) {
            return {
                rtcMultiConnection: e.rtcMultiConnection,
                streamObject: e.streamObject,
                stream: e.stream,
                userid: e.userid,
                streamid: e.streamid,
                socket: e.socket,
                type: e.type,
                mediaElement: e.mediaElement,
                stop: function() {
                    if (this.socket) {
                        if (this.type == 'local')
                            this.socket.send({
                                userid: this.rtcMultiConnection.userid,
                                streamid: this.streamid,
                                stopped: true
                            });

                        if (this.type == 'remote')
                            this.socket.send({
                                userid: this.rtcMultiConnection.userid,
                                promptStreamStop: true,
                                streamid: this.streamid
                            });
                    }

                    var stream = this.stream;
                    if (stream && stream.stop) {
                        stopTracks(stream);
                    }
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
                    if (!session)
                        session = {
                            audio: true,
                            video: true
                        };

                    if (isFirefox) {
                        // https://www.webrtc-experiment.com/RecordRTC/AudioVideo-on-Firefox.html
                        session = { audio: true };
                    }

                    if (!window.RecordRTC) {
                        var self = this;
                        return loadScript('//www.webrtc-experiment.com/RecordRTC.js', function() {
                            self.startRecording(session);
                        });
                    }

                    this.recorder = new MRecordRTC();
                    this.recorder.mediaType = session;
                    this.recorder.addStream(this.stream);
                    this.recorder.startRecording();
                },
                stopRecording: function(callback) {
                    this.recorder.stopRecording();
                    this.recorder.getBlob(function(blob) {
                        callback(blob.audio || blob.video, blob.video);
                    });
                }
            };
        };

        // new RTCMultiConnection().set({properties}).connect()
        connection.set = function(properties) {
            for (var property in properties) {
                this[property] = properties[property];
            }
            return this;
        };

        // www.RTCMultiConnection.org/docs/firebase/
        connection.firebase = 'rtcweb';

        // www.RTCMultiConnection.org/docs/onMediaError/
        connection.onMediaError = function(_error) {
            error(_error);
        };

        // www.RTCMultiConnection.org/docs/stats/
        connection.stats = { };

        // www.RTCMultiConnection.org/docs/getStats/
        connection.getStats = function(callback) {
            var numberOfConnectedUsers = 0;
            for (var peer in this.peers) {
                numberOfConnectedUsers++;
            }

            this.stats.numberOfConnectedUsers = numberOfConnectedUsers;

            // numberOfSessions

            if (callback) callback(this.stats);
        };

        // www.RTCMultiConnection.org/docs/caniuse/
        connection.caniuse = {
            RTCPeerConnection: !!RTCPeerConnection,
            getUserMedia: !!getUserMedia,
            AudioContext: !!AudioContext,

            // there is no way to check whether "getUserMedia" flag is enabled or not!
            ScreenSharing: isChrome && chromeVersion >= 26 && location.protocol == 'https:',
            checkIfScreenSharingFlagEnabled: function(callback) {
                var warning;
                if (isFirefox) {
                    warning = 'Screen sharing is NOT supported on Firefox.';
                    error(warning);
                    if (callback) callback(false);
                }

                if (location.protocol !== 'https:') {
                    warning = 'Screen sharing is NOT supported on ' + location.protocol + ' Try https!';
                    error(warning);
                    if (callback) return callback(false);
                }

                if (chromeVersion < 26) {
                    warning = 'Screen sharing support is suspicious!';
                    warn(warning);
                }

                var screen_constraints = {
                    video: {
                        mandatory: {
                            chromeMediaSource: 'screen'
                        }
                    }
                };

                var invocationInterval = 0,
                    stop;
                (function selfInvoker() {
                    invocationInterval++;
                    if (!stop) setTimeout(selfInvoker, 10);
                })();

                navigator.webkitGetUserMedia(screen_constraints, onsuccess, onfailure);

                function onsuccess(stream) {
                    if (stream.stop) {
                        stream.stop();
                    }

                    if (callback) {
                        callback(true);
                    }
                }

                function onfailure() {
                    stop = true;
                    if (callback) callback(invocationInterval > 5, warning);
                }
            },

            RtpDataChannels: isChrome && chromeVersion >= 25,
            SctpDataChannels: isChrome && chromeVersion >= 31
        };

        // www.RTCMultiConnection.org/docs/snapshots/
        connection.snapshots = { };

        // www.RTCMultiConnection.org/docs/takeSnapshot/
        connection.takeSnapshot = function(userid, callback) {
            for (var stream in this.streams) {
                stream = this.streams[stream];
                if (stream.userid == userid) {
                    var video = stream.streamObject.mediaElement;
                    var canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth || video.clientWidth;
                    canvas.height = video.videoHeight || video.clientHeight;

                    var context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    this.snapshots[userid] = canvas.toDataURL();
                    callback && callback(this.snapshots[userid]);
                    continue;
                }
            }
        };

        connection.saveToDisk = function(blob, fileName) {
            if (blob.size && blob.type) FileSaver.SaveToDisk(URL.createObjectURL(blob), fileName || blob.name || blob.type.replace('/', '-') + blob.type.split('/')[1]);
            else FileSaver.SaveToDisk(blob, fileName);
        };

        // www.WebRTC-Experiment.com/demos/MediaStreamTrack.getSources.html
        connection._mediaSources = { };

        // www.RTCMultiConnection.org/docs/selectDevices/
        connection.selectDevices = function(device1, device2) {
            if (device1) select(this.devices[device1]);
            if (device2) select(this.devices[device2]);

            function select(device) {
                if (!device) return;
                connection._mediaSources[device.kind] = device.id;
            }
        };

        // www.RTCMultiConnection.org/docs/devices/
        connection.devices = { };

        // www.RTCMultiConnection.org/docs/getDevices/
        connection.getDevices = function(callback) {
            if (!!window.MediaStreamTrack && !!MediaStreamTrack.getSources) {
                MediaStreamTrack.getSources(function(media_sources) {
                    var sources = [];
                    for (var i = 0; i < media_sources.length; i++) {
                        sources.push(media_sources[i]);
                    }

                    getAllUserMedias(sources);

                    if (callback) callback(connection.devices);
                });

                var index = 0;

                function getAllUserMedias(media_sources) {
                    var media_source = media_sources[index];
                    if (!media_source) return;

                    connection.devices[media_source.id] = media_source;

                    index++;
                    getAllUserMedias(media_sources);
                }
            }
        };

        // www.RTCMultiConnection.org/docs/onCustomMessage/
        connection.onCustomMessage = function(message) {
            log('Custom message', message);
        };

        // www.RTCMultiConnection.org/docs/ondrop/
        connection.ondrop = function(droppedBy) {
            log('Media connection is dropped by ' + droppedBy);
        };

        // www.RTCMultiConnection.org/docs/drop/
        connection.drop = function(config) {
            config = config || { };
            this.attachStreams = [];

            // "drop" should detach all local streams
            for (var stream in this.streams) {
                if (this._skip.indexOf(stream) == -1) {
                    stream = this.streams[stream];
                    if (stream.type == 'local') {
                        this.detachStreams.push(stream.streamid);
                        this.onstreamended(stream.streamObject);
                    } else this.onstreamended(stream.streamObject);
                }
            }

            // www.RTCMultiConnection.org/docs/sendCustomMessage/
            this.sendCustomMessage({
                drop: true,
                dontRenegotiate: typeof config.renegotiate == 'undefined' ? true : config.renegotiate
            });
        };

        // used for SoundMeter
        if (!!window.AudioContext) {
            connection._audioContext = new AudioContext();
        }

        // www.RTCMultiConnection.org/docs/language/ (to see list of all supported languages)
        connection.language = 'en';

        // www.RTCMultiConnection.org/docs/autoTranslateText/
        connection.autoTranslateText = false;

        // please use your own API key; if possible
        connection.googKey = 'AIzaSyCUmCjvKRb-kOYrnoL2xaXb8I-_JJeKpf0';

        // www.RTCMultiConnection.org/docs/Translator/
        connection.Translator = {
            TranslateText: function(text, callback) {
                // if(location.protocol === 'https:') return callback(text);

                var newScript = document.createElement('script');
                newScript.type = 'text/javascript';

                var sourceText = encodeURIComponent(text); // escape

                var randomNumber = 'method' + connection.token();
                window[randomNumber] = function(response) {
                    if (response.data && response.data.translations[0] && callback) {
                        callback(response.data.translations[0].translatedText);
                    }
                };

                var source = 'https://www.googleapis.com/language/translate/v2?key=' + connection.googKey + '&target=' + (connection.language || 'en-US') + '&callback=window.' + randomNumber + '&q=' + sourceText;
                newScript.src = source;
                document.getElementsByTagName('head')[0].appendChild(newScript);
            }
        };
    }
})();
