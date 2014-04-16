// Last time updated at April 16, 2014, 08:00:23
// Latest file can be found here: https://www.webrtc-experiment.com/RTCMultiConnection-v1.7.js

// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - www.RTCMultiConnection.org/docs
// FAQ               - www.RTCMultiConnection.org/FAQ
// v1.7 changes log  - www.RTCMultiConnection.org/changes-log/#v1.7
// Demos             - www.WebRTC-Experiment.com/RTCMultiConnection
// _______________________
// RTCMultiConnection-v1.7

/* issues/features need to be fixed & implemented:

-. make sure peer.connection.signalingState != 'closed' is a valid statement.

-. if system doesn't support audio; auto join with only video
-. if system doesn't support video; auto join with only audio

-. "channel" object in the openSignalingChannel shouldn't be mandatory!
-. JSON parse/stringify options for data transmitted using data-channels; e.g. connection.preferJSON = true;
-. "onspeaking" and "onsilence" fires too often!
-. removeTrack() and addTracks() instead of "stop"
-. voice translation using Translator.js
*/

(function () {
    // www.RTCMultiConnection.org/docs/constructor/
    window.RTCMultiConnection = function (channel) {
        // a reference to your constructor!
        var connection = this;

        // www.RTCMultiConnection.org/docs/channel-id/
        connection.channel = channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');

        var rtcMultiSession; // a reference to backbone object i.e. RTCMultiSession!

        // to allow single user to join multiple rooms;
        // you can change this property at runtime!
        connection.isAcceptNewSession = true;

        // www.RTCMultiConnection.org/docs/open/
        connection.open = function (args) {
            connection.isAcceptNewSession = false;

            // www.RTCMultiConnection.org/docs/session-initiator/
            // you can always use this property to determine room owner!
            connection.isInitiator = true;

            var dontTransmit = false;

            // a channel can contain multiple rooms i.e. sessions
            if (args) {
                if (typeof args == 'string') {
                    connection.sessionid = args;
                } else {
                    if (typeof args.transmitRoomOnce != 'undefined') {
                        connection.transmitRoomOnce = args.transmitRoomOnce;
                    }

                    if (typeof args.dontTransmit != 'undefined') {
                        dontTransmit = args.dontTransmit;
                    }

                    if (typeof args.sessionid != 'undefined') {
                        connection.sessionid = args.sessionid;
                    }
                }
            }

            // if firebase && if session initiator
            if (connection.socket && connection.socket.remove) {
                connection.socket.remove();
            }

            if (!connection.sessionid) connection.sessionid = connection.channel;
            connection.sessionDescription = {
                sessionid: connection.sessionid,
                userid: connection.userid,
                session: connection.session,
                extra: connection.extra
            };

            if (!connection.stats.sessions[connection.sessionDescription.sessionid]) {
                connection.stats.numberOfSessions++;
                connection.stats.sessions[connection.sessionDescription.sessionid] = connection.sessionDescription;
            }

            // verify to see if "openSignalingChannel" exists!
            prepareSignalingChannel(function () {
                // connect with signaling channel
                initRTCMultiSession(function () {
                    // for session-initiator, user-media is captured as soon as "open" is invoked.
                    captureUserMedia(function () {
                        rtcMultiSession.initSession({
                            sessionDescription: connection.sessionDescription,
                            dontTransmit: dontTransmit
                        });
                    });
                });
            });
            return connection.sessionDescription;
        };

        // www.RTCMultiConnection.org/docs/connect/
        this.connect = function (sessionid) {
            // a channel can contain multiple rooms i.e. sessions
            if (sessionid) {
                connection.sessionid = sessionid;
            }

            // verify to see if "openSignalingChannel" exists!
            prepareSignalingChannel(function () {
                // connect with signaling channel
                initRTCMultiSession(function () {
                    log('Signaling channel is ready.');
                });
            });

            return this;
        };

        // www.RTCMultiConnection.org/docs/join/
        this.join = joinSession;

        // www.RTCMultiConnection.org/docs/send/
        this.send = function (data, _channel) {
            // send file/data or /text
            if (!data)
                throw 'No file, data or text message to share.';

            // connection.send([file1, file2, file3])
            // you can share multiple files, strings or data objects using "send" method!
            if (!!data.forEach) {
                // this mechanism can cause failure for subsequent packets/data 
                // on Firefox especially; and on chrome as well!
                // todo: need to use setTimeout instead.
                for (var i = 0; i < data.length; i++) {
                    connection.send(data[i], _channel);
                }
                return;
            }

            // File or Blob object MUST have "type" and "size" properties
            if (typeof data.size != 'undefined' && typeof data.type != 'undefined') {
                // to send multiple files concurrently!
                // file of any size; maximum length: 1GB
                FileSender.send({
                    file: data,
                    channel: rtcMultiSession,
                    _channel: _channel,
                    connection: connection
                });
            } else {
                // to allow longest string messages
                // and largest data objects
                // or anything of any size!
                // to send multiple data objects concurrently!
                TextSender.send({
                    text: data,
                    channel: rtcMultiSession,
                    _channel: _channel,
                    connection: connection
                });
            }
        };

        // this method checks to verify "openSignalingChannel" method
        // github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md

        function prepareSignalingChannel(callback) {
            if (connection.openSignalingChannel) return callback();

            // make sure firebase.js is loaded before using their JavaScript API
            if (!window.Firebase) {
                return loadScript('https://www.webrtc-experiment.com/firebase.js', function () {
                    prepareSignalingChannel(callback);
                });
            }

            // Single socket is a preferred solution!
            var socketCallbacks = {};
            var firebase = new Firebase('https://' + connection.firebase + '.firebaseio.com/' + connection.channel);
            firebase.on('child_added', function (snap) {
                var data = snap.val();
                if (data.sender == connection.userid) return;

                if (socketCallbacks[data.channel]) {
                    socketCallbacks[data.channel](data.message);
                }
                snap.ref().remove();
            });

            // www.RTCMultiConnection.org/docs/openSignalingChannel/
            connection.openSignalingChannel = function (args) {
                var callbackid = args.channel || connection.channel;
                socketCallbacks[callbackid] = args.onmessage;

                if (args.onopen) setTimeout(args.onopen, 1000);
                return {
                    send: function (message) {
                        firebase.push({
                            sender: connection.userid,
                            channel: callbackid,
                            message: message
                        });
                    },
                    channel: channel // todo: remove this "channel" object
                };
            };

            callback();
        }

        function initRTCMultiSession(onSignalingReady) {
            // RTCMultiSession is the backbone object;
            // this object MUST be initialized once!
            if (rtcMultiSession) return onSignalingReady();

            // your everything is passed over RTCMultiSession constructor!
            rtcMultiSession = new RTCMultiSession(connection, onSignalingReady);
        }

        function joinSession(session) {
            if (!rtcMultiSession) {
                log('Signaling channel is not ready. Connecting...');
                // verify to see if "openSignalingChannel" exists!
                prepareSignalingChannel(function () {
                    // connect with signaling channel
                    initRTCMultiSession(function () {
                        log('Signaling channel is connected. Joining the session again...');
                        setTimeout(function () {
                            joinSession(session);
                        }, 1000);
                    });
                });
                return;
            }

            // connection.join('sessionid');
            if (typeof session == 'string') {
                if (connection.stats.sessions[session]) {
                    session = connection.stats.sessions[session];
                } else
                    return setTimeout(function () {
                        log('Session-Descriptions not found. Rechecking..');
                        joinSession(session);
                    }, 1000);
            }

            if (!session || !session.userid || !session.sessionid)
                throw 'invalid data passed over "join" method';

            if (!connection.dontOverrideSession) {
                connection.session = session.session;
            }

            extra = connection.extra || session.extra || {};

            // todo: need to verify that if-block statement works as expected.
            // expectations: if it is oneway streaming; or if it is data-only connection
            // then, it shouldn't capture user-media on participant's side.
            if (session.oneway || isData(session)) {
                rtcMultiSession.joinSession(session, extra);
            } else {
                captureUserMedia(function () {
                    rtcMultiSession.joinSession(session, extra);
                });
            }
        }

        var isFirstSession = true;

        // www.RTCMultiConnection.org/docs/captureUserMedia/

        function captureUserMedia(callback, _session) {
            // capture user's media resources
            var session = _session || connection.session;

            if (isEmpty(session)) {
                if (callback) callback();
                return;
            }

            // you can force to skip media capturing!
            if (connection.dontAttachStream)
                return callback();

            // if it is data-only connection
            // if it is one-way connection and current user is participant
            if (isData(session) || (!connection.isInitiator && session.oneway)) {
                // www.RTCMultiConnection.org/docs/attachStreams/
                connection.attachStreams = [];
                return callback();
            }

            var constraints = {
                audio: !!session.audio,
                video: !!session.video
            };

            // if custom audio device is selected
            if (connection._mediaSources.audio) {
                constraints.audio = {
                    optional: [{
                        sourceId: connection._mediaSources.audio
                    }]
                };
            }

            // if custom video device is selected
            if (connection._mediaSources.video) {
                constraints.video = {
                    optional: [{
                        sourceId: connection._mediaSources.video
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

            // if screen is prompted
            if (session.screen) {
                var _isFirstSession = isFirstSession;

                _captureUserMedia(screen_constraints, constraints.audio || constraints.video ? function () {

                    if (_isFirstSession) isFirstSession = true;

                    _captureUserMedia(constraints, callback);
                } : callback);
            } else _captureUserMedia(constraints, callback, session.audio && !session.video);

            function _captureUserMedia(forcedConstraints, forcedCallback, isRemoveVideoTracks) {
                var mediaConfig = {
                    onsuccess: function (stream, returnBack, idInstance, streamid) {
                        if (isRemoveVideoTracks && isChrome) {
                            stream = new window.webkitMediaStream(stream.getAudioTracks());
                        }

                        // var streamid = getRandomString();
                        connection.localStreamids.push(streamid);
                        stream.onended = function () {
                            connection.onstreamended(streamedObject);

                            // if user clicks "stop" button to close screen sharing
                            var _stream = connection.streams[streamid];
                            if (_stream && _stream.sockets.length) {
                                _stream.sockets.forEach(function (socket) {
                                    socket.send({
                                        streamid: _stream.streamid,
                                        userid: _stream.rtcMultiConnection.userid,
                                        extra: _stream.rtcMultiConnection.extra,
                                        stopped: true
                                    });
                                });
                            }

                            currentUserMediaRequest.mutex = false;
                            // to make sure same stream can be captured again!
                            if (currentUserMediaRequest.streams[idInstance]) {
                                delete currentUserMediaRequest.streams[idInstance];
                            }
                        };

                        var mediaElement = createMediaElement(stream, session);

                        mediaElement.muted = true;

                        stream.streamid = streamid;

                        var streamedObject = {
                            stream: stream,
                            streamid: streamid,
                            mediaElement: mediaElement,
                            blobURL: mediaElement.mozSrcObject || mediaElement.src,
                            type: 'local',
                            userid: connection.userid,
                            extra: connection.extra,
                            session: session,
                            isVideo: stream.getVideoTracks().length > 0,
                            isAudio: !stream.getVideoTracks().length && stream.getAudioTracks().length > 0,
                            isInitiator: !!connection.isInitiator
                        };

                        var sObject = {
                            stream: stream,
                            userid: connection.userid,
                            streamid: streamid,
                            session: session,
                            type: 'local',
                            streamObject: streamedObject,
                            mediaElement: mediaElement,
                            rtcMultiConnection: connection
                        };

                        if (isFirstSession) {
                            connection.attachStreams.push(stream);
                        }
                        isFirstSession = false;

                        connection.streams[streamid] = connection._getStream(sObject);

                        if (!returnBack) {
                            connection.onstream(streamedObject);
                        }

                        if (connection.setDefaultEventsForMediaElement) {
                            connection.setDefaultEventsForMediaElement(mediaElement, streamid);
                        }

                        if (forcedCallback) forcedCallback(stream, streamedObject);

                        if (connection.onspeaking) {
                            var soundMeter = new SoundMeter({
                                context: connection._audioContext,
                                connection: connection,
                                event: streamedObject
                            });
                            soundMeter.connectToSource(stream);
                        }
                    },
                    onerror: function (e, idInstance) {
                        connection.onMediaError(toStr(e));

                        if (session.audio) {
                            connection.onMediaError('Maybe microphone access is denied.');
                        }

                        if (session.video) {
                            connection.onMediaError('Maybe webcam access is denied.');
                        }

                        if (session.screen) {
                            if (isFirefox) {
                                connection.onMediaError('Firefox has not yet released their screen capturing modules. Still work in progress! Please try chrome for now!');
                            } else if (location.protocol !== 'https:') {
                                connection.onMediaError('<https> is mandatory to capture screen.');
                            } else {
                                connection.onMediaError('Unable to detect actual issue. Maybe "deprecated" screen capturing flag is not enabled or maybe you clicked "No" button.');
                            }

                            currentUserMediaRequest.mutex = false;

                            // to make sure same stream can be captured again!
                            if (currentUserMediaRequest.streams[idInstance]) {
                                delete currentUserMediaRequest.streams[idInstance];
                            }
                        }
                    },
                    mediaConstraints: connection.mediaConstraints || {}
                };

                mediaConfig.constraints = forcedConstraints || constraints;
                mediaConfig.media = connection.media;
                getUserMedia(mediaConfig);
            }
        }

        // www.RTCMultiConnection.org/docs/captureUserMedia/
        this.captureUserMedia = captureUserMedia;

        // www.RTCMultiConnection.org/docs/leave/
        this.leave = function (userid) {
            isFirstSession = true;

            // eject a user; or leave the session
            rtcMultiSession.leave(userid);
        };

        // www.RTCMultiConnection.org/docs/eject/
        this.eject = function (userid) {
            if (!connection.isInitiator) throw 'Only session-initiator can eject a user.';
            connection.leave(userid);
        };

        // www.RTCMultiConnection.org/docs/close/
        this.close = function () {
            // close entire session
            connection.autoCloseEntireSession = true;
            connection.leave();
        };

        // www.RTCMultiConnection.org/docs/renegotiate/
        this.renegotiate = function (stream, session) {
            rtcMultiSession.addStream({
                renegotiate: session || {
                    oneway: true,
                    audio: true,
                    video: true
                },
                stream: stream
            });
        };

        // www.RTCMultiConnection.org/docs/addStream/
        this.addStream = function (session, socket) {
            // www.RTCMultiConnection.org/docs/renegotiation/

            // renegotiate new media stream
            if (session) {
                var isOneWayStreamFromParticipant;
                if (!connection.isInitiator && session.oneway) {
                    session.oneway = false;
                    isOneWayStreamFromParticipant = true;
                }

                captureUserMedia(function (stream) {
                    if (isOneWayStreamFromParticipant) {
                        session.oneway = true;
                    }
                    addStream(stream);
                }, session);
            } else addStream();

            function addStream(stream) {
                rtcMultiSession.addStream({
                    stream: stream,
                    renegotiate: session || connection.session,
                    socket: socket
                });
            }
        };

        // www.RTCMultiConnection.org/docs/removeStream/
        this.removeStream = function (streamid) {
            // detach pre-attached streams
            if (!this.streams[streamid]) return warn('No such stream exists. Stream-id:', streamid);

            // www.RTCMultiConnection.org/docs/detachStreams/
            this.detachStreams.push(streamid);
            this.renegotiate();
        };

        // set RTCMultiConnection defaults on constructor invocation
        setDefaults(this);
    };

    function RTCMultiSession(connection, callbackForSignalingReady) {
        var fileReceiver = new FileReceiver(connection);
        var textReceiver = new TextReceiver(connection);

        function onDataChannelMessage(e) {
            if (!e) return;

            e = JSON.parse(e);

            if (e.data.type === 'text') {
                textReceiver.receive(e.data, e.userid, e.extra);
            } else if (typeof e.data.maxChunks != 'undefined') {
                fileReceiver.receive(e.data);
            } else {
                if (connection.autoTranslateText) {
                    e.original = e.data;
                    connection.Translator.TranslateText(e.data, function (translatedText) {
                        e.data = translatedText;
                        connection.onmessage(e);
                    });
                } else connection.onmessage(e);
            }
        }

        function onNewSession(session) {
            // todo: make sure this works as expected.
            // i.e. "onNewSession" should be fired only for 
            // sessionid that is passed over "connect" method.
            if (connection.sessionid && session.sessionid != connection.sessionid) return;

            if (connection.onNewSession) {
                session.join = function (forceSession) {
                    if (!forceSession) return connection.join(session);

                    for (var f in forceSession) {
                        session.session[f] = forceSession[f];
                    }

                    // keeping previous state
                    var isDontAttachStream = connection.dontAttachStream;

                    connection.dontAttachStream = false;
                    connection.captureUserMedia(function () {
                        connection.dontAttachStream = true;
                        connection.join(session);

                        // returning back previous state
                        connection.dontAttachStream = isDontAttachStream;
                    }, forceSession);
                };
                if (!session.extra) session.extra = {};

                return connection.onNewSession(session);
            }

            connection.join(session);
        }

        var socketObjects = {};
        var sockets = [];

        var rtcMultiSession = this;

        var participants = {};

        function updateSocketForLocalStreams(socket) {
            for (var i = 0; i < connection.localStreamids.length; i++) {
                var streamid = connection.localStreamids[i];
                if (connection.streams[streamid]) {
                    // using "sockets" array to keep references of all sockets using 
                    // this media stream; so we can fire "onstreamended" among all users.
                    connection.streams[streamid].sockets.push(socket);
                }
            }
        }

        function newPrivateSocket(_config) {
            var socketConfig = {
                channel: _config.channel,
                onmessage: socketResponse,
                onopen: function (_socket) {
                    if (_socket) socket = _socket;

                    if (isofferer && !peer) {
                        peerConfig.session = connection.session;
                        if (!peer) peer = new PeerConnection();
                        peer.create('offer', peerConfig);
                    }

                    _config.socketIndex = socket.index = sockets.length;
                    socketObjects[socketConfig.channel] = socket;
                    sockets[_config.socketIndex] = socket;

                    updateSocketForLocalStreams(socket);
                }
            };

            socketConfig.callback = function (_socket) {
                socket = _socket;
                socketConfig.onopen();
            };

            var socket = connection.openSignalingChannel(socketConfig),
                isofferer = _config.isofferer,
                peer;

            var peerConfig = {
                onopen: onChannelOpened,
                onicecandidate: function (candidate) {
                    if (!connection.candidates) throw 'ICE candidates are mandatory.';
                    if (!connection.candidates.host && candidate.candidate.indexOf('typ host') != -1) return;
                    if (!connection.candidates.relay && candidate.candidate.indexOf('relay') != -1) return;
                    if (!connection.candidates.reflexive && candidate.candidate.indexOf('srflx') != -1) return;

                    log(candidate.candidate);

                    socket && socket.send({
                        userid: connection.userid,
                        candidate: {
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            candidate: JSON.stringify(candidate.candidate)
                        }
                    });
                },
                onmessage: onDataChannelMessage,
                onaddstream: function (stream, session) {
                    session = session || _config.renegotiate || connection.session;

                    // if it is Firefox; then return.
                    if (isData(session)) return;

                    if (_config.streaminfo) {
                        var streaminfo = _config.streaminfo.split('----');
                        for (var i = 0; i < streaminfo.length; i++) {
                            stream.streamid = streaminfo[i];
                        }

                        _config.streaminfo = swap(streaminfo.pop()).join('----');
                    }

                    var mediaElement = createMediaElement(stream, merge({ remote: true }, session));
                    _config.stream = stream;

                    if (!stream.getVideoTracks().length)
                        mediaElement.addEventListener('play', function () {
                            setTimeout(function () {
                                mediaElement.muted = false;
                                afterRemoteStreamStartedFlowing(mediaElement, session);
                            }, 3000);
                        }, false);
                    else
                        waitUntilRemoteStreamStartsFlowing(mediaElement, session);

                    if (connection.setDefaultEventsForMediaElement) {
                        connection.setDefaultEventsForMediaElement(mediaElement, stream.streamid);
                    }

                    // to allow this user join all existing users!
                    if (connection.isInitiator && getLength(participants) > 1 && getLength(participants) <= connection.maxParticipantsAllowed) {
                        if (!connection.session.oneway && !connection.session.broadcast) {
                            defaultSocket.send({
                                joinUsers: participants,
                                userid: connection.userid,
                                extra: connection.extra
                            });
                        }
                    }
                },

                onremovestream: function (event) {
                    warn('onremovestream', event);
                },

                onclose: function (e) {
                    e.extra = _config.extra;
                    e.userid = _config.userid;
                    connection.onclose(e);

                    // suggested in #71 by "efaj"
                    if (connection.channels[e.userid])
                        delete connection.channels[e.userid];
                },
                onerror: function (e) {
                    e.extra = _config.extra;
                    e.userid = _config.userid;
                    connection.onerror(e);
                },

                oniceconnectionstatechange: function (event) {
                    log('oniceconnectionstatechange', toStr(event));
                    if (connection.peers[_config.userid] && connection.peers[_config.userid].oniceconnectionstatechange) {
                        connection.peers[_config.userid].oniceconnectionstatechange(event);
                    }

                    if (!connection.autoReDialOnFailure) return;

                    if (connection.peers[_config.userid]) {
                        if (connection.peers[_config.userid].peer.connection.iceConnectionState != 'disconnected') {
                            _config.redialing = false;
                        }

                        if (connection.peers[_config.userid].peer.connection.iceConnectionState == 'disconnected' && !_config.redialing) {
                            _config.redialing = true;
                            warn('Peer connection is closed.', toStr(connection.peers[_config.userid].peer.connection), 'ReDialing..');
                            connection.peers[_config.userid].socket.send({
                                userid: connection.userid,
                                extra: connection.extra || {},
                                redial: true
                            });

                            // to make sure all old "remote" streams are also removed!
                            for (var stream in connection.streams) {
                                stream = connection.streams[stream];
                                if (stream.userid == _config.userid && stream.type == 'remote') {
                                    connection.onstreamended(stream.streamObject);
                                }
                            }
                        }
                    }
                },

                onsignalingstatechange: function (event) {
                    log('onsignalingstatechange', toStr(event));
                },

                attachStreams: connection.attachStreams,
                iceServers: connection.iceServers,
                bandwidth: connection.bandwidth,
                sdpConstraints: connection.sdpConstraints,
                optionalArgument: connection.optionalArgument,
                disableDtlsSrtp: connection.disableDtlsSrtp,
                dataChannelDict: connection.dataChannelDict,
                preferSCTP: connection.preferSCTP,

                onSessionDescription: function (sessionDescription, streaminfo) {
                    sendsdp({
                        sdp: sessionDescription,
                        socket: socket,
                        streaminfo: streaminfo
                    });
                },

                socket: socket,
                selfUserid: connection.userid
            };

            function waitUntilRemoteStreamStartsFlowing(mediaElement, session, numberOfTimes) {
                if (!numberOfTimes) numberOfTimes = 0;
                numberOfTimes++;

                if (!(mediaElement.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || mediaElement.paused || mediaElement.currentTime <= 0)) {
                    afterRemoteStreamStartedFlowing(mediaElement, session);
                } else {
                    if (numberOfTimes >= 60 * 2) { // wait 2 minutes while video is delivered!
                        socket.send({
                            userid: connection.userid,
                            extra: connection.extra,
                            failedToReceiveRemoteVideo: true,
                            streamid: _config.stream.streamid
                        });
                    } else
                        setTimeout(function () {
                            log('waiting for remote video to play: ' + numberOfTimes);
                            waitUntilRemoteStreamStartsFlowing(mediaElement, session, numberOfTimes);
                        }, 1000);
                }
            }

            function initFakeChannel() {
                if (!connection.fakeDataChannels || connection.channels[_config.userid]) return;

                // for non-data connections; allow fake data sender!
                if (!connection.session.data) {
                    var fakeChannel = {
                        send: function (data) {
                            socket.send({
                                fakeData: data
                            });
                        },
                        readyState: 'open'
                    };
                    // connection.channels['user-id'].send(data);
                    connection.channels[_config.userid] = {
                        channel: fakeChannel,
                        send: function (data) {
                            this.channel.send(data);
                        }
                    };
                    peerConfig.onopen(fakeChannel);
                }
            }

            function afterRemoteStreamStartedFlowing(mediaElement, session) {
                var stream = _config.stream;

                stream.onended = function () {
                    connection.onstreamended(streamedObject);
                };

                var streamedObject = {
                    mediaElement: mediaElement,

                    stream: stream,
                    streamid: stream.streamid,
                    session: session || connection.session,

                    blobURL: mediaElement.mozSrcObject || mediaElement.src,
                    type: 'remote',

                    extra: _config.extra,
                    userid: _config.userid,

                    isVideo: stream.getVideoTracks().length > 0,
                    isAudio: !stream.getVideoTracks().length && stream.getAudioTracks().length > 0,
                    isInitiator: !!_config.isInitiator
                };

                // connection.streams['stream-id'].mute({audio:true})
                connection.streams[stream.streamid] = connection._getStream({
                    stream: stream,
                    userid: _config.userid,
                    streamid: stream.streamid,
                    socket: socket,
                    type: 'remote',
                    streamObject: streamedObject,
                    mediaElement: mediaElement,
                    rtcMultiConnection: connection,
                    session: session || connection.session
                });

                connection.onstream(streamedObject);

                onSessionOpened();

                if (connection.onspeaking) {
                    var soundMeter = new SoundMeter({
                        context: connection._audioContext,
                        connection: connection,
                        event: streamedObject
                    });
                    soundMeter.connectToSource(stream);
                }
            }

            function onChannelOpened(channel) {
                _config.channel = channel;

                // connection.channels['user-id'].send(data);
                connection.channels[_config.userid] = {
                    channel: _config.channel,
                    send: function (data) {
                        connection.send(data, this.channel);
                    }
                };

                connection.onopen({
                    extra: _config.extra,
                    userid: _config.userid
                });

                // fetch files from file-queue
                for (var q in connection.fileQueue) {
                    connection.send(connection.fileQueue[q], channel);
                }

                if (isData(connection.session)) onSessionOpened();
            }

            function updateSocket() {
                // todo: need to check following {if-block} MUST not affect "redial" process
                if (socket.userid == _config.userid)
                    return;

                socket.userid = _config.userid;
                sockets[_config.socketIndex] = socket;

                connection.stats.numberOfConnectedUsers++;
                // connection.peers['user-id'].addStream({audio:true})
                connection.peers[_config.userid] = {
                    socket: socket,
                    peer: peer,
                    userid: _config.userid,
                    extra: _config.extra,
                    addStream: function (session00) {
                        // connection.peers['user-id'].addStream({audio: true, video: true);

                        connection.addStream(session00, this.socket);
                    },
                    removeStream: function (streamid) {
                        if (!connection.streams[streamid])
                            return warn('No such stream exists. Stream-id:', streamid);

                        this.peer.connection.removeStream(connection.streams[streamid].stream);
                        this.renegotiate();
                    },
                    renegotiate: function (stream, session) {
                        // connection.peers['user-id'].renegotiate();

                        connection.renegotiate(stream, session);
                    },
                    changeBandwidth: function (bandwidth) {
                        // connection.peers['user-id'].changeBandwidth();

                        if (!bandwidth) throw 'You MUST pass bandwidth object.';
                        if (typeof bandwidth == 'string') throw 'Pass object for bandwidth instead of string; e.g. {audio:10, video:20}';

                        // set bandwidth for self
                        this.peer.bandwidth = bandwidth;

                        // ask remote user to synchronize bandwidth
                        this.socket.send({
                            userid: connection.userid,
                            extra: connection.extra || {},
                            changeBandwidth: true,
                            bandwidth: bandwidth
                        });
                    },
                    sendCustomMessage: function (message) {
                        // connection.peers['user-id'].sendCustomMessage();

                        this.socket.send({
                            userid: connection.userid,
                            extra: connection.extra || {},
                            customMessage: true,
                            message: message
                        });
                    },
                    onCustomMessage: function (message) {
                        log('Received "private" message from', this.userid,
                            typeof message == 'string' ? message : toStr(message));
                    },
                    drop: function (dontSendMessage) {
                        // connection.peers['user-id'].drop();

                        for (var stream in connection.streams) {
                            if (connection._skip.indexOf(stream) == -1) {
                                stream = connection.streams[stream];

                                if (stream.userid == connection.userid && stream.type == 'local') {
                                    this.peer.connection.removeStream(stream.stream);
                                    connection.onstreamended(stream.streamObject);
                                }

                                if (stream.type == 'remote' && stream.userid == this.userid) {
                                    connection.onstreamended(stream.streamObject);
                                }
                            }
                        }

                        !dontSendMessage && this.socket.send({
                            userid: connection.userid,
                            extra: connection.extra || {},
                            drop: true
                        });
                    },
                    hold: function (holdMLine) {
                        // connection.peers['user-id'].hold();

                        this.socket.send({
                            userid: connection.userid,
                            extra: connection.extra || {},
                            hold: true,
                            holdMLine: holdMLine || 'both'
                        });

                        this.peer.hold = true;
                        this.fireHoldUnHoldEvents({
                            kind: holdMLine,
                            isHold: true,
                            userid: connection.userid,
                            remoteUser: this.userid
                        });
                    },
                    unhold: function (holdMLine) {
                        // connection.peers['user-id'].unhold();

                        this.socket.send({
                            userid: connection.userid,
                            extra: connection.extra || {},
                            unhold: true,
                            holdMLine: holdMLine || 'both'
                        });

                        this.peer.hold = false;
                        this.fireHoldUnHoldEvents({
                            kind: holdMLine,
                            isHold: false,
                            userid: connection.userid,
                            remoteUser: this.userid
                        });
                    },
                    fireHoldUnHoldEvents: function (e) {
                        // this method is for inner usages only!

                        var isHold = e.isHold;
                        var kind = e.kind;
                        var userid = e.remoteUser || e.userid;

                        // hold means inactive a specific media line!
                        // a media line can contain multiple synced sources (ssrc)
                        // i.e. a media line can reference multiple tracks!
                        // that's why hold will affect all relevant tracks in a specific media line!
                        for (var stream in connection.streams) {
                            if (connection._skip.indexOf(stream) == -1) {
                                stream = connection.streams[stream];

                                if (stream.userid == userid) {
                                    // www.RTCMultiConnection.org/docs/onhold/
                                    if (isHold)
                                        connection.onhold(merge({
                                            kind: kind
                                        }, stream.streamObject));

                                    // www.RTCMultiConnection.org/docs/onunhold/
                                    if (!isHold)
                                        connection.onunhold(merge({
                                            kind: kind
                                        }, stream.streamObject));
                                }
                            }
                        }
                    },
                    redial: function () {
                        // connection.peers['user-id'].redial();

                        // 1st of all; remove all relevant remote media streams
                        for (var stream in connection.streams) {
                            if (connection._skip.indexOf(stream) == -1) {
                                stream = connection.streams[stream];

                                if (stream.userid == this.userid && stream.type == 'remote') {
                                    connection.onstreamended(stream.streamObject);
                                }
                            }
                        }

                        log('ReDialing...');

                        socket.send({
                            userid: connection.userid,
                            extra: connection.extra,
                            recreatePeer: true
                        });

                        peer = new PeerConnection();
                        peer.create('offer', peerConfig);
                    },
                    sharePartOfScreen: function (args) {
                        // www.RTCMultiConnection.org/docs/onpartofscreen/

                        var element = args.element;
                        var that = this;

                        if (!window.html2canvas) {
                            return loadScript('https://www.webrtc-experiment.com/screenshot.js', function () {
                                that.sharePartOfScreen(args);
                            });
                        }

                        if (typeof element == 'string') {
                            element = document.querySelector(element);
                            if (!element) element = document.getElementById(element);
                        }
                        if (!element) throw 'HTML Element is inaccessible!';

                        function partOfScreenCapturer() {
                            // if stopped
                            if (that.stopPartOfScreenSharing) {
                                that.stopPartOfScreenSharing = false;

                                if (connection.onpartofscreenstopped) {
                                    connection.onpartofscreenstopped();
                                }
                                return;
                            }

                            // if paused
                            if (that.pausePartOfScreenSharing) {
                                if (connection.onpartofscreenpaused) {
                                    connection.onpartofscreenpaused();
                                }

                                return setTimeout(partOfScreenCapturer, args.interval || 200);
                            }

                            // html2canvas.js is used to take screenshots
                            html2canvas(element, {
                                onrendered: function (canvas) {
                                    var screenshot = canvas.toDataURL();

                                    if (!connection.channels[that.userid]) {
                                        throw 'No such data channel exists.';
                                    }

                                    connection.channels[that.userid].send({
                                        userid: connection.userid,
                                        extra: connection.extra,
                                        screenshot: screenshot,
                                        isPartOfScreen: true
                                    });

                                    // "once" can be used to share single screenshot
                                    !args.once && setTimeout(partOfScreenCapturer, args.interval || 200);
                                }
                            });
                        }

                        partOfScreenCapturer();
                    }
                };
            }

            function onSessionOpened() {
                // original conferencing infrastructure!
                if (connection.isInitiator && getLength(participants) && getLength(participants) <= connection.maxParticipantsAllowed) {
                    if (!connection.session.oneway && !connection.session.broadcast) {
                        defaultSocket.send({
                            sessionid: connection.sessionid,
                            newParticipant: _config.userid || socket.channel,
                            userid: connection.userid,
                            extra: connection.extra,
                            userData: {
                                userid: _config.userid || socket.channel,
                                extra: _config.extra
                            }
                        });
                    }
                }

                // this code snippet is added to make sure that "previously-renegotiated" streams are also 
                // renegotiated to this new user
                // todo: currently renegotiating only one stream; need renegotiate all.
                if (connection.renegotiatedSessions[0]) {
                    connection.peers[_config.userid].renegotiate(connection.renegotiatedSessions[0].stream, connection.renegotiatedSessions[0].session);
                }
            }

            function socketResponse(response) {
                if (response.userid == connection.userid)
                    return;

                if (response.sdp) {
                    _config.userid = response.userid;
                    _config.extra = response.extra || {};
                    _config.renegotiate = response.renegotiate;
                    _config.streaminfo = response.streaminfo;
                    _config.isInitiator = response.isInitiator;

                    var sdp = JSON.parse(response.sdp);

                    if (sdp.type == 'offer') {
                        // to synchronize SCTP or RTP
                        peerConfig.preferSCTP = !!response.preferSCTP;
                        connection.fakeDataChannels = !!response.fakeDataChannels;
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
                        if (connection.streams[response.streamid]) {
                            if (response.mute && !connection.streams[response.streamid].muted) {
                                connection.streams[response.streamid].mute(response.session);
                            }
                            if (response.unmute && connection.streams[response.streamid].muted) {
                                connection.streams[response.streamid].unmute(response.session);
                            }
                        }
                    } else {
                        var streamObject = {};
                        if (connection.streams[response.streamid]) {
                            streamObject = connection.streams[response.streamid].streamObject;
                        }

                        var session = response.session;
                        var fakeObject = merge({}, streamObject);
                        fakeObject.session = session;
                        fakeObject.isAudio = session.audio && !session.video;
                        fakeObject.isVideo = (!session.audio && session.video) || (session.audio && session.video);

                        if (response.mute) connection.onmute(fakeObject || response);
                        if (response.unmute) connection.onunmute(fakeObject || response);
                    }
                }

                if (response.isVolumeChanged) {
                    log('Volume of stream: ' + response.streamid + ' has changed to: ' + response.volume);
                    if (connection.streams[response.streamid]) {
                        var mediaElement = connection.streams[response.streamid].mediaElement;
                        if (mediaElement) mediaElement.volume = response.volume;
                    }
                }

                // to stop local stream
                if (response.stopped) {
                    if (connection.streams[response.streamid]) {
                        connection.onstreamended(connection.streams[response.streamid].streamObject);
                    }
                }

                // to stop remote stream
                if (response.promptStreamStop /* && !connection.isInitiator */) {
                    // var forceToStopRemoteStream = true;
                    // connection.streams['remote-stream-id'].stop( forceToStopRemoteStream );
                    warn('Remote stream has been manually stopped!');
                    if (connection.streams[response.streamid]) {
                        connection.streams[response.streamid].stop();
                    }
                }

                if (response.left) {
                    // firefox is unable to stop remote streams
                    // firefox doesn't auto stop streams when peer.close() is called.
                    if (isFirefox) {
                        var userLeft = response.userid;
                        for (var stream in connection.streams) {
                            stream = connection.streams[stream];
                            if (stream.userid == userLeft) {
                                stopTracks(stream);
                                stream.stream.onended(stream.streamObject);
                            }
                        }
                    }

                    if (peer && peer.connection) {
                        if (peer.connection.signalingState != 'closed') {
                            peer.connection.close();
                        }
                        peer.connection = null;
                    }

                    if (response.closeEntireSession) {
                        connection.close();
                        connection.refresh();
                    } else if (socket && response.ejected) {
                        // if user is ejected; his stream MUST be removed
                        // from all other users' side
                        socket.send({
                            left: true,
                            extra: connection.extra,
                            userid: connection.userid
                        });

                        if (sockets[_config.socketIndex])
                            delete sockets[_config.socketIndex];
                        if (socketObjects[socket.channel])
                            delete socketObjects[socket.channel];

                        socket = null;
                    }

                    connection.remove(response.userid);

                    if (participants[response.userid]) delete participants[response.userid];

                    connection.onleave({
                        userid: response.userid,
                        extra: response.extra,
                        entireSessionClosed: !!response.closeEntireSession
                    });
                }

                // keeping session active even if initiator leaves
                if (response.playRoleOfBroadcaster) {
                    if (response.extra) {
                        connection.extra = merge(connection.extra, response.extra);
                    }
                    setTimeout(connection.playRoleOfInitiator, 2000);
                }

                if (response.isCreateDataChannel) {
                    if (isFirefox) {
                        peer.createDataChannel();
                    }
                }

                if (response.changeBandwidth) {
                    if (!connection.peers[response.userid]) throw 'No such peer exists.';

                    // synchronize bandwidth
                    connection.peers[response.userid].peer.bandwidth = response.bandwidth;

                    // renegotiate to apply bandwidth
                    connection.peers[response.userid].renegotiate();
                }

                if (response.customMessage) {
                    if (!connection.peers[response.userid]) throw 'No such peer exists.';
                    connection.peers[response.userid].onCustomMessage(response.message);
                }

                if (response.drop) {
                    if (!connection.peers[response.userid]) throw 'No such peer exists.';
                    connection.peers[response.userid].drop(true);
                    connection.peers[response.userid].renegotiate();

                    connection.ondrop(response.userid);
                }

                if (response.hold) {
                    if (!connection.peers[response.userid]) throw 'No such peer exists.';
                    connection.peers[response.userid].peer.hold = true;
                    connection.peers[response.userid].peer.holdMLine = response.holdMLine;
                    connection.peers[response.userid].renegotiate();

                    connection.peers[response.userid].fireHoldUnHoldEvents({
                        kind: response.holdMLine,
                        isHold: true,
                        userid: response.userid
                    });
                }

                if (response.unhold) {
                    if (!connection.peers[response.userid]) throw 'No such peer exists.';
                    connection.peers[response.userid].peer.hold = false;
                    connection.peers[response.userid].peer.holdMLine = response.holdMLine;
                    connection.peers[response.userid].renegotiate();

                    connection.peers[response.userid].fireHoldUnHoldEvents({
                        kind: response.holdMLine,
                        isHold: false,
                        userid: response.userid
                    });
                }

                // fake data channels!
                if (response.fakeData) {
                    peerConfig.onmessage(response.fakeData);
                }

                // sometimes we don't need to renegotiate e.g. when peers are disconnected
                // or if it is firefox
                if (response.recreatePeer) {
                    peer = new PeerConnection();
                }

                // remote video failed either out of ICE gathering process or ICE connectivity check-up
                // or IceAgent was unable to locate valid candidates/ports.
                if (response.failedToReceiveRemoteVideo) {
                    log('Remote peer hasn\'t received stream: ' + response.streamid + '. Renegotiating...');
                    if (connection.peers[response.userid]) {
                        connection.peers[response.userid].renegotiate();
                    }
                }

                if (response.redial) {
                    if (connection.peers[response.userid]) {
                        if (connection.peers[response.userid].peer.connection.iceConnectionState != 'disconnected') {
                            _config.redialing = false;
                        }

                        if (connection.peers[response.userid].peer.connection.iceConnectionState == 'disconnected' && !_config.redialing) {
                            _config.redialing = true;

                            warn('Peer connection is closed.', toStr(connection.peers[response.userid].peer.connection), 'ReDialing..');
                            connection.peers[response.userid].redial();
                        }
                    }
                }
            }

            connection.playRoleOfInitiator = function () {
                connection.dontAttachStream = true;
                connection.open();
                sockets = swap(sockets);
                connection.dontAttachStream = false;
            };

            connection.askToShareParticipants = function () {
                defaultSocket && defaultSocket.send({
                    userid: connection.userid,
                    extra: connection.extra,
                    askToShareParticipants: true
                });
            };

            connection.shareParticipants = function (args) {
                var message = {
                    joinUsers: participants,
                    userid: connection.userid,
                    extra: connection.extra
                };

                if (args) {
                    if (args.dontShareWith) message.dontShareWith = args.dontShareWith;
                    if (args.shareWith) message.shareWith = args.shareWith;
                }
                defaultSocket.send(message);
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
                    peerConfig.session = connection.session;
                    if (!peer) peer = new PeerConnection();
                    peer.create('answer', peerConfig);

                    updateSocket();
                    return;
                }

                var session = _config.renegotiate;
                // detach streams
                detachMediaStream(labels, peer.connection);

                if (session.oneway || isData(session)) {
                    createAnswer();
                } else {
                    if (_config.capturing)
                        return;

                    _config.capturing = true;

                    connection.captureUserMedia(function (stream) {
                        _config.capturing = false;

                        if (isChrome || (isFirefox && !peer.connection.getLocalStreams().length)) {
                            peer.connection.addStream(stream);
                        }
                        createAnswer();
                    }, _config.renegotiate);
                }

                delete _config.renegotiate;

                function createAnswer() {
                    if (isFirefox) {
                        if (connection.peers[_config.userid]) {
                            connection.peers[_config.userid].redial();
                        }
                        return;
                    }

                    peer.recreateAnswer(sdp, session, function (_sdp, streaminfo) {
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
                if (connection.streams[label]) {
                    peer.removeStream(connection.streams[label].stream);
                }
            }
        }

        function sendsdp(e) {
            e.socket.send({
                userid: connection.userid,
                sdp: JSON.stringify(e.sdp),
                extra: connection.extra,
                renegotiate: !!e.renegotiate ? e.renegotiate : false,
                streaminfo: e.streaminfo || '',
                labels: e.labels || [],
                preferSCTP: !!connection.preferSCTP,
                fakeDataChannels: !!connection.fakeDataChannels,
                isInitiator: !!connection.isInitiator
            });
        }

        // sharing new user with existing participants

        function onNewParticipant(response) {
            // todo: make sure this works as expected.
            // if(connection.sessionid && response.sessionid != connection.sessionid) return;

            var channel = response.newParticipant;

            if (!channel || !!participants[channel] || channel == connection.userid)
                return;

            participants[channel] = channel;

            var new_channel = connection.token();
            newPrivateSocket({
                channel: new_channel,
                extra: response.userData ? response.userData.extra : response.extra,
                userid: response.userData ? response.userData.userid : response.userid
            });

            defaultSocket.send({
                participant: true,
                userid: connection.userid,
                targetUser: channel,
                channel: new_channel,
                extra: connection.extra
            });
        }

        // if a user leaves

        function clearSession(channel) {
            connection.stats.numberOfConnectedUsers--;

            var alert = {
                left: true,
                extra: connection.extra,
                userid: connection.userid,
                sessionid: connection.sessionid
            };

            if (connection.isInitiator) {
                if (connection.autoCloseEntireSession) {
                    alert.closeEntireSession = true;
                } else if (sockets[0]) {
                    sockets[0].send({
                        playRoleOfBroadcaster: true,
                        userid: connection.userid
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
        connection.remove = function (userid) {
            if (rtcMultiSession.requestsFrom && rtcMultiSession.requestsFrom[userid]) delete rtcMultiSession.requestsFrom[userid];

            if (connection.peers[userid]) {
                if (connection.peers[userid].peer && connection.peers[userid].peer.connection) {
                    if (connection.peers[userid].peer.connection.signalingState != 'closed') {
                        connection.peers[userid].peer.connection.close();
                    }
                    connection.peers[userid].peer.connection = null;
                }
                delete connection.peers[userid];
            }
            if (participants[userid]) {
                delete participants[userid];
            }

            for (var stream in connection.streams) {
                stream = connection.streams[stream];
                if (stream.userid == userid) {
                    connection.onstreamended(stream.streamObject);
                    if (stream.stop) stream.stop();
                    delete connection.streams[stream];
                }
            }

            if (socketObjects[userid]) {
                delete socketObjects[userid];
            }
        };

        // www.RTCMultiConnection.org/docs/refresh/
        connection.refresh = function () {
            // if firebase; remove data from firebase servers
            if (connection.isInitiator && !!connection.socket && !!connection.socket.remove) {
                connection.socket.remove();
            }

            participants = [];
            connection.isAcceptNewSession = true;

            // to stop/remove self streams
            for (var i = 0; i < connection.attachStreams.length; i++) {
                stopTracks(connection.attachStreams[i]);
            }
            connection.attachStreams = [];

            // to allow capturing of identical streams
            currentUserMediaRequest = {
                streams: [],
                mutex: false,
                queueRequests: []
            };

            // to make sure remote streams are also removed!
            for (var stream in connection.streams) {
                if (connection._skip.indexOf(stream) == -1) {
                    connection.onstreamended(connection.streams[stream].streamObject);
                    delete connection.streams[stream];
                }
            }

            rtcMultiSession.isOwnerLeaving = true;
            connection.isInitiator = false;
        };

        // www.RTCMultiConnection.org/docs/reject/
        connection.reject = function (userid) {
            if (typeof userid != 'string') userid = userid.userid;
            defaultSocket.send({
                rejectedRequestOf: userid,
                userid: connection.userid,
                extra: connection.extra || {}
            });
        };

        window.addEventListener('beforeunload', function () {
            clearSession();
        }, false);

        window.addEventListener('keyup', function (e) {
            if (e.keyCode == 116)
                clearSession();
        }, false);

        function onSignalingReady() {
            if (rtcMultiSession.signalingReady) return;
            rtcMultiSession.signalingReady = true;

            setTimeout(callbackForSignalingReady, 1000);

            if (!connection.isInitiator) {
                // as soon as signaling gateway is connected;
                // user should check existing rooms!
                defaultSocket.send({
                    userid: connection.userid,
                    extra: connection.extra,
                    searchingForRooms: true
                });
            }
        }

        function joinParticipants(joinUsers) {
            for (var user in joinUsers) {
                if (!participants[joinUsers[user]]) {
                    onNewParticipant({
                        sessionid: connection.sessionid,
                        newParticipant: joinUsers[user],
                        userid: connection.userid,
                        extra: connection.extra
                    });
                }
            }
        }

        // default-socket is a common socket shared among all users in a specific channel;
        // to share participation requests; room descriptions; and other stuff.
        var defaultSocket = connection.openSignalingChannel({
            onmessage: function (response) {
                if (response.userid == connection.userid) return;

                if (response.sessionid && response.userid) {
                    if (!connection.stats.sessions[response.sessionid]) {
                        connection.stats.numberOfSessions++;
                        connection.stats.sessions[response.sessionid] = response;
                    }
                }

                if (connection.isAcceptNewSession && response.sessionid && response.userid) {
                    if (!connection.dontOverrideSession) {
                        connection.session = response.session;
                    }

                    onNewSession(response);
                }

                if (response.newParticipant && !connection.isAcceptNewSession && rtcMultiSession.broadcasterid === response.userid) {
                    onNewParticipant(response);
                }

                if (getLength(participants) < connection.maxParticipantsAllowed && response.userid && response.targetUser == connection.userid && response.participant && !participants[response.userid]) {
                    // because broadcaster already have anonymous user in "participants" array
                    // that's why this code isn't executed!
                    acceptRequest(response);
                }

                if (response.acceptedRequestOf == connection.userid) {
                    if (connection.onstats) connection.onstats('accepted', response);
                }

                if (response.rejectedRequestOf == connection.userid) {
                    if (connection.onstats) connection.onstats('rejected', response);
                }

                if (response.customMessage) {
                    if (response.message.drop) {
                        connection.ondrop(response.userid);

                        connection.attachStreams = [];
                        // "drop" should detach all local streams
                        for (var stream in connection.streams) {
                            if (connection._skip.indexOf(stream) == -1) {
                                stream = connection.streams[stream];
                                if (stream.type == 'local') {
                                    connection.detachStreams.push(stream.streamid);
                                    connection.onstreamended(stream.streamObject);
                                } else connection.onstreamended(stream.streamObject);
                            }
                        }

                        if (response.message.renegotiate) {
                            // renegotiate; so "peer.removeStream" happens.
                            connection.addStream();
                        }
                    } else if (connection.onCustomMessage) {
                        connection.onCustomMessage(response.message);
                    }
                }

                if (connection.isInitiator && response.searchingForRooms) {
                    defaultSocket.send({
                        userid: connection.userid,
                        extra: connection.extra,
                        sessionDescription: connection.sessionDescription,
                        responseFor: response.userid
                    });
                }

                if (response.sessionDescription && response.responseFor == connection.userid) {
                    var sessionDescription = response.sessionDescription;
                    if (!connection.stats.sessions[sessionDescription.sessionid]) {
                        connection.stats.numberOfSessions++;
                        connection.stats.sessions[sessionDescription.sessionid] = sessionDescription;
                    }
                }

                if (connection.isInitiator && response.askToShareParticipants) {
                    connection.shareParticipants({
                        shareWith: response.userid
                    });
                }

                // participants are shared with single user
                if (response.shareWith == connection.userid && response.dontShareWith != connection.userid && response.joinUsers) {
                    joinParticipants(response.joinUsers);
                }

                // participants are shared with all users
                if (!response.shareWith && response.joinUsers) {
                    if (response.dontShareWith && connection.userid != response.dontShareWith) {
                        joinParticipants(response.joinUsers);
                    }
                }
            },
            callback: function (socket) {
                if (socket) defaultSocket = socket;
                if (onSignalingReady) onSignalingReady();
            },
            onopen: function (socket) {
                if (socket) defaultSocket = socket;
                if (onSignalingReady) onSignalingReady();
            }
        });

        if (defaultSocket && onSignalingReady) onSignalingReady();

        function setDirections() {
            var userMaxParticipantsAllowed = 0;

            // if user has set a custom max participant setting, remember it
            if (connection.maxParticipantsAllowed != 256) {
                userMaxParticipantsAllowed = connection.maxParticipantsAllowed;
            }

            if (connection.direction == 'one-way') connection.session.oneway = true;
            if (connection.direction == 'one-to-one') connection.maxParticipantsAllowed = 1;
            if (connection.direction == 'one-to-many') connection.session.broadcast = true;
            if (connection.direction == 'many-to-many') {
                if (!connection.maxParticipantsAllowed || connection.maxParticipantsAllowed == 1) {
                    connection.maxParticipantsAllowed = 256;
                }
            }

            // if user has set a custom max participant setting, set it back
            if (userMaxParticipantsAllowed && connection.maxParticipantsAllowed != 1) {
                connection.maxParticipantsAllowed = userMaxParticipantsAllowed;
            }
        }

        // open new session
        this.initSession = function (args) {
            rtcMultiSession.isOwnerLeaving = false;

            setDirections();
            participants = {};

            rtcMultiSession.isOwnerLeaving = false;

            if (typeof args.transmitRoomOnce != 'undefined') {
                connection.transmitRoomOnce = args.transmitRoomOnce;
            }

            function transmit() {
                if (defaultSocket && getLength(participants) < connection.maxParticipantsAllowed && !rtcMultiSession.isOwnerLeaving) {
                    defaultSocket.send(connection.sessionDescription);
                }

                if (!connection.transmitRoomOnce && !rtcMultiSession.isOwnerLeaving)
                    setTimeout(transmit, connection.interval || 3000);
            }

            // todo: test and fix next line.
            if (!args.dontTransmit /* || connection.transmitRoomOnce */) transmit();
        };

        // join existing session
        this.joinSession = function (_config) {
            if (!defaultSocket)
                return setTimeout(function () {
                    warn('Default-Socket is not yet initialized.');
                    rtcMultiSession.joinSession(_config);
                }, 1000);

            _config = _config || {};
            participants = {};

            // dont-override-session allows you force RTCMultiConnection
            // to not override default session of participants;
            // by default, session is always overridden and set to the session coming from initiator!
            if (!connection.dontOverrideSession) {
                connection.session = _config.session || {};
            }

            rtcMultiSession.broadcasterid = _config.userid;

            if (_config.sessionid) {
                // used later to prevent external rooms messages to be used by this user!
                connection.sessionid = _config.sessionid;
            }

            connection.isAcceptNewSession = false;

            var channel = getRandomString();
            newPrivateSocket({
                channel: channel,
                extra: _config.extra || {},
                userid: _config.userid
            });

            defaultSocket.send({
                participant: true,
                userid: connection.userid,
                channel: channel,
                targetUser: _config.userid,
                extra: connection.extra,
                session: connection.session
            });
        };

        // send file/data or text message
        this.send = function (message, _channel) {
            message = JSON.stringify({
                extra: connection.extra,
                userid: connection.userid,
                data: message
            });

            if (_channel) {
                if (_channel.readyState == 'open') {
                    _channel.send(message);
                }
                return;
            }

            for (var dataChannel in connection.channels) {
                var channel = connection.channels[dataChannel].channel;
                if (channel.readyState == 'open') {
                    channel.send(message);
                }
            }
        };

        // leave session
        this.leave = function (userid) {
            clearSession(userid);
            connection.refresh();
        };

        // renegotiate new stream
        this.addStream = function (e) {
            var session = e.renegotiate;

            connection.renegotiatedSessions.push({
                session: e.renegotiate,
                stream: e.stream
            });

            if (e.socket) {
                addStream(connection.peers[e.socket.userid]);
            } else {
                for (var peer in connection.peers) {
                    addStream(connection.peers[peer]);
                }
            }

            function addStream(_peer) {
                var socket = _peer.socket;
                if (!socket) {
                    warn(_peer, 'doesn\'t has socket.');
                    return;
                }

                updateSocketForLocalStreams(socket);

                if (!_peer || !_peer.peer) {
                    throw 'No peer to renegotiate.';
                }

                var peer = _peer.peer;

                if (e.stream) {
                    peer.attachStreams = [e.stream];
                }

                // detaching old streams
                detachMediaStream(connection.detachStreams, peer.connection);

                if (e.stream && (session.audio || session.video || session.screen)) {
                    // removeStream is not yet implemented in Firefox
                    // if(isFirefox) peer.connection.removeStream(e.stream);

                    if (isChrome || (isFirefox && !peer.connection.getLocalStreams().length)) {
                        peer.connection.addStream(e.stream);
                    }
                }

                // if isFirefox, try to create peer connection again!
                if (isFirefox) {
                    return _peer.redial();
                }

                peer.recreateOffer(session, function (sdp, streaminfo) {
                    sendsdp({
                        sdp: sdp,
                        socket: socket,
                        renegotiate: session,
                        labels: connection.detachStreams,
                        streaminfo: streaminfo
                    });
                    connection.detachStreams = [];
                });
            }
        };

        // www.RTCMultiConnection.org/docs/request/
        connection.request = function (userid, extra) {
            connection.captureUserMedia(function () {
                // open private socket that will be used to receive offer-sdp
                newPrivateSocket({
                    channel: connection.userid,
                    extra: extra || {},
                    userid: userid
                });

                // ask other user to create offer-sdp
                defaultSocket.send({
                    participant: true,
                    userid: connection.userid,
                    extra: connection.extra || {},
                    targetUser: userid
                });
            });
        };

        function acceptRequest(response) {
            if (!rtcMultiSession.requestsFrom) rtcMultiSession.requestsFrom = {};
            if (rtcMultiSession.requestsFrom[response.userid]) return;

            var obj = {
                userid: response.userid,
                extra: response.extra,
                channel: response.channel || response.userid,
                session: response.session || connection.session
            };

            rtcMultiSession.requestsFrom[response.userid] = obj;

            // www.RTCMultiConnection.org/docs/onRequest/
            if (connection.onRequest && connection.isInitiator) {
                connection.onRequest(obj);
            } else _accept(obj);
        }

        function _accept(e) {
            participants[e.userid] = e.userid;
            newPrivateSocket({
                isofferer: true,
                userid: e.userid,
                channel: e.channel,
                extra: e.extra || {},
                session: e.session || connection.session
            });
        }

        // www.RTCMultiConnection.org/docs/sendMessage/
        connection.sendCustomMessage = function (message) {
            if (!defaultSocket) {
                return setTimeout(function () {
                    connection.sendMessage(message);
                }, 1000);
            }

            defaultSocket.send({
                userid: connection.userid,
                customMessage: true,
                message: message
            });
        };

        // www.RTCMultiConnection.org/docs/accept/
        connection.accept = function (e) {
            // for backward compatibility
            if (arguments.length > 1 && typeof arguments[0] == 'string') {
                e = {};
                if (arguments[0]) e.userid = arguments[0];
                if (arguments[1]) e.extra = arguments[1];
                if (arguments[2]) e.channel = arguments[2];
            }

            connection.captureUserMedia(function () {
                _accept(e);
            });
        };
    }

    var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

    function PeerConnection() {
        return {
            create: function (type, options) {
                merge(this, options);

                var self = this;

                this.type = type;
                this.init();
                this.attachMediaStreams();

                if (isData(this.session) && isFirefox) {
                    navigator.mozGetUserMedia({
                        audio: true,
                        fake: true
                    }, function (stream) {
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
            getLocalDescription: function (type) {
                log('peer type is', type);

                if (type == 'answer') {
                    this.setRemoteDescription(this.offerDescription);
                }

                var self = this;
                this.connection[type == 'offer' ? 'createOffer' : 'createAnswer'](function (sessionDescription) {
                    sessionDescription.sdp = self.serializeSdp(sessionDescription.sdp);
                    self.connection.setLocalDescription(sessionDescription);
                    self.onSessionDescription(sessionDescription, self.streaminfo);
                }, this.onSdpError, this.constraints);
            },
            serializeSdp: function (sdp) {
                sdp = this.setBandwidth(sdp);
                if (this.holdMLine == 'both') {
                    if (this.hold) {
                        this.prevSDP = sdp;
                        sdp = sdp.replace(/sendonly|recvonly|sendrecv/g, 'inactive');
                    } else if (this.prevSDP) {
                        // sdp = sdp.replace(/inactive/g, 'sendrecv');
                        sdp = this.prevSDP;
                    }
                } else if (this.holdMLine == 'audio' || this.holdMLine == 'video') {
                    sdp = sdp.split('m=');

                    var audio = '';
                    var video = '';

                    if (sdp[1] && sdp[1].indexOf('audio') == 0) {
                        audio = 'm=' + sdp[1];
                    }
                    if (sdp[2] && sdp[2].indexOf('audio') == 0) {
                        audio = 'm=' + sdp[2];
                    }

                    if (sdp[1] && sdp[1].indexOf('video') == 0) {
                        video = 'm=' + sdp[1];
                    }
                    if (sdp[2] && sdp[2].indexOf('video') == 0) {
                        video = 'm=' + sdp[2];
                    }

                    if (this.holdMLine == 'audio') {
                        if (this.hold) {
                            this.prevSDP = sdp[0] + audio + video;
                            sdp = sdp[0] + audio.replace(/sendonly|recvonly|sendrecv/g, 'inactive') + video;
                        } else if (this.prevSDP) {
                            // sdp = sdp[0] + audio.replace(/inactive/g, 'sendrecv') + video;
                            sdp = this.prevSDP;
                        }
                    }

                    if (this.holdMLine == 'video') {
                        if (this.hold) {
                            this.prevSDP = sdp[0] + audio + video;
                            sdp = sdp[0] + audio + video.replace(/sendonly|recvonly|sendrecv/g, 'inactive');
                        } else if (this.prevSDP) {
                            // sdp = sdp[0] + audio + video.replace(/inactive/g, 'sendrecv');
                            sdp = this.prevSDP;
                        }
                    }
                }
                return sdp;
            },
            init: function () {
                this.setConstraints();
                this.connection = new RTCPeerConnection(this.iceServers, this.optionalArgument);

                if (this.session.data && isChrome) {
                    this.createDataChannel();
                }

                this.connection.onicecandidate = function (event) {
                    if (event.candidate) {
                        self.onicecandidate(event.candidate);
                    }
                };

                this.connection.onaddstream = function (e) {
                    self.onaddstream(e.stream, self.session);

                    log('onaddstream', toStr(e.stream));
                };

                this.connection.onremovestream = function (e) {
                    self.onremovestream(e.stream);
                };

                this.connection.onsignalingstatechange = function () {
                    self.connection && self.oniceconnectionstatechange({
                        iceConnectionState: self.connection.iceConnectionState,
                        iceGatheringState: self.connection.iceGatheringState,
                        signalingState: self.connection.signalingState
                    });
                };

                this.connection.oniceconnectionstatechange = function () {
                    self.connection && self.oniceconnectionstatechange({
                        iceConnectionState: self.connection.iceConnectionState,
                        iceGatheringState: self.connection.iceGatheringState,
                        signalingState: self.connection.signalingState
                    });
                };
                var self = this;
            },
            setBandwidth: function (sdp) {
                // sdp.replace( /a=sendrecv\r\n/g , 'a=sendrecv\r\nb=AS:50\r\n');

                if (isMobileDevice || isFirefox || !this.bandwidth) return sdp;

                var bandwidth = this.bandwidth;

                // if screen; must use at least 300kbs
                if (bandwidth.screen && this.session.screen && isEmpty(bandwidth)) {
                    sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
                    sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.screen + '\r\n');
                }

                // remove existing bandwidth lines
                if (bandwidth.audio || bandwidth.video || bandwidth.data) {
                    sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
                }

                if (bandwidth.audio) {
                    sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
                }

                if (bandwidth.video) {
                    sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + (bandwidth.screen || bandwidth.video) + '\r\n');
                }

                if (bandwidth.data && !this.preferSCTP) {
                    sdp = sdp.replace(/a=mid:data\r\n/g, 'a=mid:data\r\nb=AS:' + bandwidth.data + '\r\n');
                }

                return sdp;
            },
            setConstraints: function () {
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
                    mandatory: this.optionalArgument.mandatory || {}
                };

                if (isChrome && chromeVersion >= 32 && !isNodeWebkit) {
                    this.optionalArgument.optional.push({
                        googIPv6: true
                    });
                    this.optionalArgument.optional.push({ googDscp: true });
                }

                if (!this.preferSCTP) {
                    this.optionalArgument.optional.push({
                        RtpDataChannels: true
                    });
                }

                log('optional-argument', toStr(this.optionalArgument.optional));

                if (typeof this.iceServers != 'undefined') {
                    this.iceServers = {
                        iceServers: this.iceServers
                    };
                } else this.iceServers = null;

                log('ice-servers', toStr(this.iceServers.iceServers));
            },
            onSdpError: function (e) {
                var message = toStr(e);

                if (message && message.indexOf('RTP/SAVPF Expects at least 4 fields') != -1) {
                    message = 'It seems that you are trying to interop RTP-datachannels with SCTP. It is not supported!';
                }
                error('onSdpError:', message);
            },
            onMediaError: function (err) {
                error(toStr(err));
            },
            setRemoteDescription: function (sessionDescription) {
                if (!sessionDescription) throw 'Remote session description should NOT be NULL.';

                log('setting remote description', sessionDescription.type, sessionDescription.sdp);
                this.connection.setRemoteDescription(
                    new RTCSessionDescription(sessionDescription)
                );
            },
            addIceCandidate: function (candidate) {
                var iceCandidate = new RTCIceCandidate({
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: candidate.candidate
                });

                if (isNodeWebkit) {
                    this.connection.addIceCandidate(iceCandidate);
                } else {
                    // landed in chrome M33
                    // node-webkit doesn't support this format yet!
                    this.connection.addIceCandidate(iceCandidate, this.onIceSuccess, this.onIceFailure);
                }
            },
            onIceSuccess: function () {
                log('ice success', toStr(arguments));
            },
            onIceFailure: function () {
                warn('ice failure', toStr(arguments));
            },
            createDataChannel: function (channelIdentifier) {
                if (!this.channels) this.channels = [];

                // protocol: 'text/chat', preset: true, stream: 16
                // maxRetransmits:0 && ordered:false
                var dataChannelDict = {};

                if (this.dataChannelDict) dataChannelDict = this.dataChannelDict;

                if (isChrome && !this.preferSCTP) {
                    dataChannelDict.reliable = false; // Deprecated!
                }

                log('dataChannelDict', toStr(dataChannelDict));

                if (isFirefox) {
                    this.connection.onconnection = function () {
                        self.socket.send({
                            userid: self.selfUserid,
                            isCreateDataChannel: true
                        });
                    };
                }

                if (this.type == 'answer' || isFirefox) {
                    this.connection.ondatachannel = function (event) {
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
            setChannelEvents: function (channel) {
                var self = this;
                channel.onmessage = function (event) {
                    self.onmessage(event.data);
                };

                var numberOfTimes = 0;
                channel.onopen = function () {
                    channel.push = channel.send;
                    channel.send = function (data) {
                        if (channel.readyState != 'open') {
                            numberOfTimes++;
                            return setTimeout(function () {
                                if (numberOfTimes < 20) {
                                    channel.send(data);
                                } else throw 'Number of times exceeded to wait for WebRTC data connection to be opened.';
                            }, 1000);
                        }
                        try {
                            channel.push(data);
                        } catch (e) {
                            numberOfTimes++;
                            warn('Data transmission failed. Re-transmitting..', numberOfTimes, toStr(e));
                            if (numberOfTimes >= 20) throw 'Number of times exceeded to resend data packets over WebRTC data channels.';
                            setTimeout(function () {
                                channel.send(data);
                            }, 100);
                        }
                    };
                    self.onopen(channel);
                };

                channel.onerror = function (event) {
                    self.onerror(event);
                };

                channel.onclose = function (event) {
                    self.onclose(event);
                };

                this.channels.push(channel);
            },
            attachMediaStreams: function () {
                var streams = this.attachStreams;
                for (var i = 0; i < streams.length; i++) {
                    log('attaching stream:', streams[i].streamid);
                    this.connection.addStream(streams[i]);
                }
                this.getStreamInfo();
            },
            getStreamInfo: function () {
                this.streaminfo = '';
                var streams = this.attachStreams;
                for (var i = 0; i < streams.length; i++) {
                    if (i == 0) {
                        this.streaminfo = streams[i].streamid;
                    } else {
                        this.streaminfo += '----' + streams[i].streamid;
                    }
                }
                this.attachStreams = [];
            },
            recreateOffer: function (renegotiate, callback) {
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
            recreateAnswer: function (sdp, session, callback) {
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
        mandatory: {},
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
        var mediaConstraints = options.mediaConstraints || {};
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
            hints.video.optional[0] = merge({}, mediaConstraints.optional);

        log('media hints:', toStr(hints));

        // easy way to match 
        var idInstance = JSON.stringify(hints);

        function streaming(stream, returnBack, streamid) {
            if (!streamid) streamid = getRandomString();

            var video = options.video;
            if (video) {
                video[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
                video.play();
            }

            options.onsuccess(stream, returnBack, idInstance, streamid);
            currentUserMediaRequest.streams[idInstance] = {
                stream: stream,
                streamid: streamid
            };
            currentUserMediaRequest.mutex = false;
            if (currentUserMediaRequest.queueRequests.length)
                getUserMedia(currentUserMediaRequest.queueRequests.shift());
        }

        if (currentUserMediaRequest.streams[idInstance]) {
            streaming(currentUserMediaRequest.streams[idInstance].stream, true, currentUserMediaRequest.streams[idInstance].streamid);
        } else {
            n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
            n.getMedia(hints, streaming, function (err) {
                if (options.onerror) options.onerror(err, idInstance);
                else error(toStr(err));
            });
        }
    }

    var FileSender = {
        send: function (config) {
            var connection = config.connection;
            var channel = config.channel;
            var privateChannel = config._channel;
            var file = config.file;

            if (!config.file) {
                error('You must attach/select a file.');
                return;
            }

            // max chunk sending limit on chrome is 64k
            // max chunk receiving limit on firefox is 16k
            var packetSize = (!!navigator.mozGetUserMedia || connection.preferSCTP) ? 15 * 1000 : 1 * 1000;

            if (connection.chunkSize) {
                packetSize = connection.chunkSize;
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

                webWorker.onmessage = function (event) {
                    onReadAsDataURL(event.data);
                };

                webWorker.postMessage(file);
            } else {
                var reader = new FileReader();
                reader.onload = function (e) {
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
                    size: file.size,

                    userid: connection.userid,
                    extra: connection.extra
                };

                if (dataURL) {
                    text = dataURL;
                    numberOfPackets = packets = data.packets = parseInt(text.length / packetSize);

                    file.maxChunks = data.maxChunks = numberOfPackets;
                    data.currentPosition = numberOfPackets - packets;

                    file.userid = connection.userid;
                    file.extra = connection.extra;
                    file.sending = true;
                    connection.onFileStart(file);
                }

                connection.onFileProgress({
                    remaining: packets--,
                    length: numberOfPackets,
                    sent: numberOfPackets - packets,

                    maxChunks: numberOfPackets,
                    uuid: file.uuid,
                    currentPosition: numberOfPackets - packets,

                    sending: true
                }, file.uuid);

                if (text.length > packetSize) data.message = text.slice(0, packetSize);
                else {
                    data.message = text;
                    data.last = true;
                    data.name = file.name;

                    file.url = URL.createObjectURL(file);
                    file.userid = connection.userid;
                    file.extra = connection.extra;
                    file.sending = true;
                    connection.onFileEnd(file);
                }

                channel.send(data, privateChannel);

                textToTransfer = text.slice(data.message.length);
                if (textToTransfer.length) {
                    setTimeout(function () {
                        onReadAsDataURL(null, textToTransfer);
                    }, connection.chunkInterval || 100);
                }
            }
        }
    };

    function FileReceiver(connection) {
        var content = {},
            packets = {},
            numberOfPackets = {};

        function receive(data) {
            var uuid = data.uuid;

            if (typeof data.packets !== 'undefined') {
                numberOfPackets[uuid] = packets[uuid] = parseInt(data.packets);
                data.sending = false;
                connection.onFileStart(data);
            }

            connection.onFileProgress({
                remaining: packets[uuid]--,
                length: numberOfPackets[uuid],
                received: numberOfPackets[uuid] - packets[uuid],

                maxChunks: numberOfPackets[uuid],
                uuid: uuid,
                currentPosition: numberOfPackets[uuid] - packets[uuid],

                sending: false
            }, uuid);

            if (!content[uuid]) content[uuid] = [];

            content[uuid].push(data.message);

            if (data.last) {
                var dataURL = content[uuid].join('');

                FileConverter.DataURLToBlob(dataURL, data.fileType, function (blob) {
                    blob.uuid = uuid;
                    blob.name = data.name;
                    blob.type = data.fileType;

                    blob.url = (window.URL || window.webkitURL).createObjectURL(blob);

                    blob.sending = false;
                    blob.userid = data.userid || connection.userid;
                    blob.extra = data.extra || connection.extra;
                    connection.onFileEnd(blob);

                    if (connection.autoSaveToDisk) {
                        FileSaver.SaveToDisk(blob.url, data.name);
                    }

                    delete content[uuid];
                });
            }
        }

        return {
            receive: receive
        };
    }

    var FileSaver = {
        SaveToDisk: function (fileUrl, fileName) {
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

            // (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
        }
    };

    var FileConverter = {
        DataURLToBlob: function (dataURL, fileType, callback) {

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

                webWorker.onmessage = function (event) {
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
        send: function (config) {
            var connection = config.connection;

            var channel = config.channel,
                _channel = config._channel,
                initialText = config.text,
                packetSize = connection.chunkSize || 1000,
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
                    setTimeout(function () {
                        sendText(null, textToTransfer);
                    }, connection.chunkInterval || 100);
                }
            }
        }
    };

    // _______________
    // TextReceiver.js

    function TextReceiver(connection) {
        var content = {};

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

                if (message.preRecordedMediaChunk) {
                    if (!connection.preRecordedMedias[message.streamerid]) {
                        connection.shareMediaFile(null, null, message.streamerid);
                    }
                    connection.preRecordedMedias[message.streamerid].onData(message.chunk);
                } else if (connection.autoTranslateText) {
                    e.original = e.data;
                    connection.Translator.TranslateText(e.data, function (translatedText) {
                        e.data = translatedText;
                        connection.onmessage(e);
                    });
                } else if (message.isPartOfScreen) {
                    connection.onpartofscreen(message);
                } else connection.onmessage(e);

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
        var connection = config.connection;
        var context = config.context;
        this.context = context;
        this.volume = 0.0;
        this.slow_volume = 0.0;
        this.clip = 0.0;

        // Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384)
        this.script = context.createScriptProcessor(256, 1, 1);
        that = this;

        this.script.onaudioprocess = function (event) {
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

            if (volume >= .1 && connection.onspeaking) {
                connection.onspeaking(config.event);
            }

            if (volume < .1 && connection.onsilence) {
                connection.onsilence(config.event);
            }
        };
    }

    SoundMeter.prototype.connectToSource = function (stream) {
        this.mic = this.context.createMediaStreamSource(stream);
        this.mic.connect(this.script);
        this.script.connect(this.context.destination);
    };

    SoundMeter.prototype.stop = function () {
        this.mic.disconnect();
        this.script.disconnect();
    };


    var isChrome = !!navigator.webkitGetUserMedia;
    var isFirefox = !!navigator.mozGetUserMedia;
    var isMobileDevice = navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);

    // detect node-webkit
    var isNodeWebkit = window.process && (typeof window.process == 'object') && window.process.versions && window.process.versions['node-webkit'];

    window.MediaStream = window.MediaStream || window.webkitMediaStream;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    function getRandomString() {
        return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
    }

    var chromeVersion = !!navigator.mozGetUserMedia ? 0 : parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);

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

    var log = console.log.bind(console);
    var error = console.error.bind(console);
    var warn = console.warn.bind(console);

    function toStr(obj) {
        return JSON.stringify(obj, function (key, value) {
            if (value && value.sdp) {
                log(value.sdp.type, '\t', value.sdp.sdp);
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
        mediaElement.muted = session.remote ? false : true;

        mediaElement.play();

        return mediaElement;
    }

    function merge(mergein, mergeto) {
        if (!mergein) mergein = {};
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
            session = e.session || {},
            enabled = e.enabled;

        if (!session.audio && !session.video) {
            if (typeof session != 'string') {
                session = merge(session, {
                    audio: true,
                    video: true
                });
            } else {
                session = {
                    audio: true,
                    video: true
                };
            }
        }

        // implementation from #68
        if (session.type) {
            if (session.type == 'remote' && root.type != 'remote') return;
            if (session.type == 'local' && root.type != 'local') return;
        }

        log(enabled ? 'mute' : 'unmute', 'session', session);

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

        root.sockets.forEach(function (socket) {
            if (root.type == 'local')
                socket.send({
                    userid: root.rtcMultiConnection.userid,
                    streamid: root.streamid,
                    mute: !!enabled,
                    unmute: !enabled,
                    session: session
                });

            if (root.type == 'remote')
                socket.send({
                    userid: root.rtcMultiConnection.userid,
                    promptMuteUnmute: true,
                    streamid: root.streamid,
                    mute: !!enabled,
                    unmute: !enabled,
                    session: session
                });
        });

        // According to issue #135, onmute/onumute must be fired for self
        // "fakeObject" is used because we need to keep session for renegotiated streams; 
        // and MUST pass accurate session over "onstreamended" event.
        var fakeObject = merge({}, root.streamObject);
        fakeObject.session = session;
        fakeObject.isAudio = session.audio && !session.video;
        fakeObject.isVideo = (!session.audio && session.video) || (session.audio && session.video);
        if (!!enabled) {
            root.rtcMultiConnection.onmute(fakeObject);
        }

        if (!enabled) {
            root.rtcMultiConnection.onunmute(fakeObject);
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
                } catch (e) {
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
                } catch (e) {
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

    // this object is used for pre-recorded media streaming!

    function Streamer(connection) {
        var prefix = !!navigator.webkitGetUserMedia ? '' : 'moz';
        var self = this;

        self.stream = streamPreRecordedMedia;

        window.MediaSource = window.MediaSource || window.WebKitMediaSource;
        if (!window.MediaSource) throw 'Chrome >=M28 (or Firefox with flag "media.mediasource.enabled=true") is mandatory to test this experiment.';

        function streamPreRecordedMedia(file) {
            if (!self.push) throw '<push> method is mandatory.';

            var reader = new window.FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = function (e) {
                startStreaming(new window.Blob([new window.Uint8Array(e.target.result)]));
            };

            var sourceBuffer, mediaSource = new MediaSource();
            mediaSource.addEventListener(prefix + 'sourceopen', function () {
                sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
                log('MediaSource readyState: <', this.readyState, '>');
            }, false);

            mediaSource.addEventListener(prefix + 'sourceended', function () {
                log('MediaSource readyState: <', this.readyState, '>');
            }, false);

            function startStreaming(blob) {
                if (!blob) return;
                var size = blob.size,
                    startIndex = 0,
                    plus = 3000;

                log('one chunk size: <', plus, '>');

                function inner_streamer() {
                    reader = new window.FileReader();
                    reader.onload = function (e) {
                        self.push(new window.Uint8Array(e.target.result));

                        startIndex += plus;
                        if (startIndex <= size) {
                            setTimeout(inner_streamer, connection.chunkInterval || 100);
                        } else {
                            self.push({
                                end: true
                            });
                        }
                    };
                    reader.readAsArrayBuffer(blob.slice(startIndex, startIndex + plus));
                }

                inner_streamer();
            }

            startStreaming();
        }

        self.receive = receive;

        function receive() {
            var mediaSource = new MediaSource();

            self.video.src = window.URL.createObjectURL(mediaSource);
            mediaSource.addEventListener(prefix + 'sourceopen', function () {
                self.receiver = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
                self.mediaSource = mediaSource;

                log('MediaSource readyState: <', this.readyState, '>');
            }, false);


            mediaSource.addEventListener(prefix + 'sourceended', function () {
                warn('MediaSource readyState: <', this.readyState, '>');
            }, false);
        }

        this.append = function (data) {
            var that = this;
            if (!self.receiver)
                return setTimeout(function () {
                    that.append(data);
                });

            try {
                var uint8array = new window.Uint8Array(data);
                self.receiver.appendBuffer(uint8array);
            } catch (e) {
                error('Pre-recorded media streaming:', e);
            }
        };

        this.end = function () {
            self.mediaSource.endOfStream();
        };
    }

    function setDefaults(connection) {
        // www.RTCMultiConnection.org/docs/onmessage/
        connection.onmessage = function (e) {
            log('onmessage', toStr(e));
        };

        // www.RTCMultiConnection.org/docs/onopen/
        connection.onopen = function (e) {
            log('Data connection is opened between you and', e.userid);
        };

        // www.RTCMultiConnection.org/docs/onerror/
        connection.onerror = function (e) {
            error(onerror, toStr(e));
        };

        // www.RTCMultiConnection.org/docs/onclose/
        connection.onclose = function (e) {
            warn('onclose', toStr(e));
        };

        var progressHelper = {};

        // www.RTCMultiConnection.org/docs/body/
        connection.body = document.body || document.documentElement;

        // www.RTCMultiConnection.org/docs/autoSaveToDisk/
        // to make sure file-saver dialog is not invoked.
        connection.autoSaveToDisk = false;

        // www.RTCMultiConnection.org/docs/onFileStart/
        connection.onFileStart = function (file) {
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
        connection.onFileProgress = function (chunk) {
            var helper = progressHelper[chunk.uuid];
            if (!helper) return;
            helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
            updateLabel(helper.progress, helper.label);
        };

        // www.RTCMultiConnection.org/docs/onFileEnd/
        connection.onFileEnd = function (file) {
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
        connection.onstream = function (e) {
            connection.body.insertBefore(e.mediaElement, connection.body.firstChild);
        };

        // www.RTCMultiConnection.org/docs/onstreamended/
        connection.onstreamended = function (e) {
            if (e.mediaElement && e.mediaElement.parentNode) {
                e.mediaElement.parentNode.removeChild(e.mediaElement);
            }
        };

        // www.RTCMultiConnection.org/docs/onmute/
        connection.onmute = function (e) {
            log('onmute', e);
            if (e.isVideo && e.mediaElement) {
                e.mediaElement.pause();
                e.mediaElement.setAttribute('poster', e.snapshot || 'https://www.webrtc-experiment.com/images/muted.png');
            }
            if (e.isAudio && e.mediaElement) {
                e.mediaElement.muted = true;
            }
        };

        // www.RTCMultiConnection.org/docs/onunmute/
        connection.onunmute = function (e) {
            log('onunmute', e);
            if (e.isVideo && e.mediaElement) {
                e.mediaElement.play();
                e.mediaElement.removeAttribute('poster');
            }
            if (e.isAudio && e.mediaElement) {
                e.mediaElement.muted = false;
            }
        };

        // www.RTCMultiConnection.org/docs/onleave/
        connection.onleave = function (e) {
            log('onleave', toStr(e));
        };

        connection.token = function () {
            // suggested by @rvulpescu from #154
            if (window.crypto) {
                var a = window.crypto.getRandomValues(new Uint32Array(3)),
                    token = '';
                for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
                return token;
            } else {
                return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
            }
        };

        // www.RTCMultiConnection.org/docs/userid/
        connection.userid = connection.token();

        // www.RTCMultiConnection.org/docs/peers/
        connection.peers = {};
        connection.peers[connection.userid] = {
            drop: function () {
                connection.drop();
            },
            renegotiate: function () {
            },
            addStream: function () {
            },
            hold: function () {
            },
            unhold: function () {
            },
            changeBandwidth: function () {
            },
            sharePartOfScreen: function () {
            }
        };

        connection._skip = ['stop', 'mute', 'unmute', '_private'];

        // www.RTCMultiConnection.org/docs/streams/
        connection.streams = {
            mute: function (session) {
                this._private(session, true);
            },
            unmute: function (session) {
                this._private(session, false);
            },
            _private: function (session, enabled) {
                // implementation from #68
                for (var stream in this) {
                    if (connection._skip.indexOf(stream) == -1) {
                        this[stream]._private(session, enabled);
                    }
                }
            },
            stop: function (type) {
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

        // this array is aimed to store all renegotiated streams' session-types
        connection.renegotiatedSessions = [];

        // www.RTCMultiConnection.org/docs/channels/
        connection.channels = {};

        // www.RTCMultiConnection.org/docs/extra/
        connection.extra = {};

        // www.RTCMultiConnection.org/docs/session/
        connection.session = {
            audio: true,
            video: true
        };

        // www.RTCMultiConnection.org/docs/bandwidth/
        connection.bandwidth = {
            screen: 300 // 300kbps (old workaround!)
        };

        connection.sdpConstraints = {};
        connection.mediaConstraints = {};
        connection.optionalArgument = {};
        connection.dataChannelDict = {};

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
        connection.preferSCTP = isFirefox || chromeVersion >= 32 ? true : false;
        connection.chunkInterval = isFirefox || chromeVersion >= 32 ? 100 : 500; // 500ms for RTP and 100ms for SCTP
        connection.chunkSize = isFirefox || chromeVersion >= 32 ? 13 * 1000 : 1000; // 1000 chars for RTP and 13000 chars for SCTP

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
            Version: chromeVersion,
            NodeWebkit: isNodeWebkit
        };

        // file queue: to store previous file objects in memory;
        // and stream over newly connected peers
        // www.RTCMultiConnection.org/docs/fileQueue/
        connection.fileQueue = {};

        // www.RTCMultiConnection.org/docs/media/
        connection.media = {
            min: function (width, height) {
                this.minWidth = width;
                this.minHeight = height;
            },
            minWidth: 640,
            minHeight: 360,
            max: function (width, height) {
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

        connection._getStream = function (e) {
            return {
                rtcMultiConnection: e.rtcMultiConnection,
                streamObject: e.streamObject,
                stream: e.stream,
                session: e.session,
                userid: e.userid,
                streamid: e.streamid,
                sockets: e.socket ? [e.socket] : [],
                type: e.type,
                mediaElement: e.mediaElement,
                stop: function (forceToStopRemoteStream) {
                    this.sockets.forEach(function (socket) {
                        if (this.type == 'local') {
                            socket.send({
                                userid: this.rtcMultiConnection.userid,
                                extra: this.rtcMultiConnection.extra,
                                streamid: this.streamid,
                                stopped: true
                            });
                        }

                        if (this.type == 'remote' && !!forceToStopRemoteStream) {
                            socket.send({
                                userid: this.rtcMultiConnection.userid,
                                promptStreamStop: true,
                                streamid: this.streamid
                            });
                        }
                    });

                    var stream = this.stream;
                    if (stream && stream.stop) {
                        stopTracks(stream);
                    }
                },
                mute: function (session) {
                    this.muted = true;
                    this._private(session, true);
                },
                unmute: function (session) {
                    this.muted = false;
                    this._private(session, false);
                },
                _private: function (session, enabled) {
                    muteOrUnmute({
                        root: this,
                        session: session,
                        enabled: enabled,
                        stream: this.stream
                    });
                },
                startRecording: function (session) {
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
                        return loadScript('https://www.webrtc-experiment.com/RecordRTC.js', function () {
                            self.startRecording(session);
                        });
                    }

                    this.recorder = new MRecordRTC();
                    this.recorder.mediaType = session;
                    this.recorder.addStream(this.stream);
                    this.recorder.startRecording();
                },
                stopRecording: function (callback) {
                    this.recorder.stopRecording();
                    this.recorder.getBlob(function (blob) {
                        callback(blob.audio || blob.video, blob.video);
                    });
                }
            };
        };

        // new RTCMultiConnection().set({properties}).connect()
        connection.set = function (properties) {
            for (var property in properties) {
                this[property] = properties[property];
            }
            return this;
        };

        // www.RTCMultiConnection.org/docs/firebase/
        connection.firebase = 'chat';

        // www.RTCMultiConnection.org/docs/onMediaError/
        connection.onMediaError = function (_error) {
            error(_error);
        };

        // www.RTCMultiConnection.org/docs/stats/
        connection.stats = {
            numberOfConnectedUsers: 0,
            numberOfSessions: 0,
            sessions: {}
        };

        // www.RTCMultiConnection.org/docs/getStats/
        connection.getStats = function (callback) {
            var numberOfConnectedUsers = 0;
            for (var peer in connection.peers) {
                numberOfConnectedUsers++;
            }

            connection.stats.numberOfConnectedUsers = numberOfConnectedUsers;

            if (callback) callback(connection.stats);
        };

        // www.RTCMultiConnection.org/docs/caniuse/
        connection.caniuse = {
            RTCPeerConnection: !!RTCPeerConnection,
            getUserMedia: !!getUserMedia,
            AudioContext: !!AudioContext,

            // there is no way to check whether "getUserMedia" flag is enabled or not!
            ScreenSharing: isChrome && chromeVersion >= 26 && location.protocol == 'https:',
            checkIfScreenSharingFlagEnabled: function (callback) {
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
        connection.snapshots = {};

        // www.RTCMultiConnection.org/docs/takeSnapshot/
        connection.takeSnapshot = function (userid, callback) {
            for (var stream in connection.streams) {
                stream = connection.streams[stream];
                if (stream.userid == userid && stream.stream && stream.stream.getVideoTracks && stream.stream.getVideoTracks().length) {
                    var video = stream.streamObject.mediaElement;
                    var canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth || video.clientWidth;
                    canvas.height = video.videoHeight || video.clientHeight;

                    var context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    connection.snapshots[userid] = canvas.toDataURL();
                    callback && callback(connection.snapshots[userid]);
                    continue;
                }
            }
        };

        connection.saveToDisk = function (blob, fileName) {
            if (blob.size && blob.type) FileSaver.SaveToDisk(URL.createObjectURL(blob), fileName || blob.name || blob.type.replace('/', '-') + blob.type.split('/')[1]);
            else FileSaver.SaveToDisk(blob, fileName);
        };

        // www.WebRTC-Experiment.com/demos/MediaStreamTrack.getSources.html
        connection._mediaSources = {};

        // www.RTCMultiConnection.org/docs/selectDevices/
        connection.selectDevices = function (device1, device2) {
            if (device1) select(this.devices[device1]);
            if (device2) select(this.devices[device2]);

            function select(device) {
                if (!device) return;
                connection._mediaSources[device.kind] = device.id;
            }
        };

        // www.RTCMultiConnection.org/docs/devices/
        connection.devices = {};

        // www.RTCMultiConnection.org/docs/getDevices/
        connection.getDevices = function (callback) {
            if (!!window.MediaStreamTrack && !!MediaStreamTrack.getSources) {
                MediaStreamTrack.getSources(function (media_sources) {
                    var sources = [];
                    for (var i = 0; i < media_sources.length; i++) {
                        sources.push(media_sources[i]);
                    }

                    getAllUserMedias(sources);

                    if (callback) callback(connection.devices);
                });

                var index = 0;

                var devicesFetched = {};

                function getAllUserMedias(media_sources) {
                    var media_source = media_sources[index];
                    if (!media_source) return;

                    // to prevent duplicated devices to be fetched.
                    if (devicesFetched[media_source.id]) {
                        index++;
                        return getAllUserMedias(media_sources);
                    }
                    devicesFetched[media_source.id] = media_source;

                    connection.devices[media_source.id] = media_source;

                    index++;
                    getAllUserMedias(media_sources);
                }
            }
        };

        // www.RTCMultiConnection.org/docs/onCustomMessage/
        connection.onCustomMessage = function (message) {
            log('Custom message', message);
        };

        // www.RTCMultiConnection.org/docs/ondrop/
        connection.ondrop = function (droppedBy) {
            log('Media connection is dropped by ' + droppedBy);
        };

        // www.RTCMultiConnection.org/docs/drop/
        connection.drop = function (config) {
            config = config || {};
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
            TranslateText: function (text, callback) {
                // if(location.protocol === 'https:') return callback(text);

                var newScript = document.createElement('script');
                newScript.type = 'text/javascript';

                var sourceText = encodeURIComponent(text); // escape

                var randomNumber = 'method' + connection.token();
                window[randomNumber] = function (response) {
                    if (response.data && response.data.translations[0] && callback) {
                        callback(response.data.translations[0].translatedText);
                    }
                };

                var source = 'https://www.googleapis.com/language/translate/v2?key=' + connection.googKey + '&target=' + (connection.language || 'en-US') + '&callback=window.' + randomNumber + '&q=' + sourceText;
                newScript.src = source;
                document.getElementsByTagName('head')[0].appendChild(newScript);
            }
        };

        // you can easily override it by setting it NULL!
        connection.setDefaultEventsForMediaElement = function (mediaElement, streamid) {
            mediaElement.onpause = function () {
                if (connection.streams[streamid] && !connection.streams[streamid].muted) {
                    connection.streams[streamid].mute();
                }
            };

            // todo: need to make sure that "onplay" EVENT doesn't play self-voice!
            mediaElement.onplay = function () {
                if (connection.streams[streamid] && connection.streams[streamid].muted) {
                    connection.streams[streamid].unmute();
                }
            };

            var volumeChangeEventFired = false;
            mediaElement.onvolumechange = function () {
                if (!volumeChangeEventFired) {
                    volumeChangeEventFired = true;
                    setTimeout(function () {
                        var root = connection.streams[streamid];
                        connection.streams[streamid].sockets.forEach(function (socket) {
                            socket.send({
                                userid: connection.userid,
                                streamid: root.streamid,
                                isVolumeChanged: true,
                                volume: mediaElement.volume
                            });
                        });
                        volumeChangeEventFired = false;
                    }, 2000);
                }
            };
        };

        connection.localStreamids = [];

        // www.RTCMultiConnection.org/docs/onMediaFile/
        connection.onMediaFile = function (e) {
            log('onMediaFile', e);
            connection.body.appendChild(e.mediaElement);
        };

        // this object stores pre-recorded media streaming uids
        // multiple pre-recorded media files can be streamed concurrently.
        connection.preRecordedMedias = {};

        // www.RTCMultiConnection.org/docs/shareMediaFile/
        // this method handles pre-recorded media streaming
        connection.shareMediaFile = function (file, video, streamerid) {
            if (file && (typeof file.size == 'undefined' || typeof file.type == 'undefined')) throw 'You MUST attach file using input[type=file] or pass a Blob.';

            warn('Pre-recorded media streaming is added as experimental feature.');

            video = video || document.createElement('video');

            video.autoplay = true;
            video.controls = true;

            streamerid = streamerid || connection.token();

            var streamer = new Streamer(this);

            streamer.push = function (chunk) {
                connection.send({
                    preRecordedMediaChunk: true,
                    chunk: chunk,
                    streamerid: streamerid
                });
            };

            if (file) {
                streamer.stream(file);
            }

            streamer.video = video;

            streamer.receive();

            connection.preRecordedMedias[streamerid] = {
                video: video,
                streamer: streamer,
                onData: function (data) {
                    if (data.end) this.streamer.end();
                    else this.streamer.append(data);
                }
            };

            connection.onMediaFile({
                mediaElement: video,
                userid: connection.userid,
                extra: connection.extra
            });

            return streamerid;
        };

        // www.RTCMultiConnection.org/docs/onpartofscreen/
        connection.onpartofscreen = function (e) {
            var image = document.createElement('img');
            image.src = e.screenshot;
            connection.body.appendChild(image);
        };

        connection.skipLogs = function () {
            log = error = warn = function () {
            };
        };

        // www.RTCMultiConnection.org/docs/hold/
        connection.hold = function (mLine) {
            for (var peer in connection.peers) {
                connection.peers[peer].hold(mLine);
            }
        };

        // www.RTCMultiConnection.org/docs/onhold/
        connection.onhold = function (track) {
            log('onhold', track);

            if (track.kind != 'audio') {
                track.mediaElement.pause();
                track.mediaElement.setAttribute('poster', track.screenshot || 'https://www.webrtc-experiment.com/images/muted.png');
            }
            if (track.kind == 'audio') {
                track.mediaElement.muted = true;
            }
        };

        // www.RTCMultiConnection.org/docs/unhold/
        connection.unhold = function (mLine) {
            for (var peer in connection.peers) {
                connection.peers[peer].unhold(mLine);
            }
        };

        // www.RTCMultiConnection.org/docs/onunhold/
        connection.onunhold = function (track) {
            log('onunhold', track);

            if (track.kind != 'audio') {
                track.mediaElement.play();
                track.mediaElement.removeAttribute('poster');
            }
            if (track.kind != 'audio') {
                track.mediaElement.muted = false;
            }
        };

        connection.sharePartOfScreen = function (args) {
            for (var peer in connection.peers) {
                connection.peers[peer].sharePartOfScreen(args);
            }
        };

        connection.pausePartOfScreenSharing = function () {
            for (var peer in connection.peers) {
                connection.peers[peer].pausePartOfScreenSharing = true;
            }
        };

        connection.stopPartOfScreenSharing = function () {
            for (var peer in connection.peers) {
                connection.peers[peer].stopPartOfScreenSharing = true;
            }
        };

        // it is false because workaround that is used to capture connections' failures
        // affects renegotiation scenarios!
        // todo: fix it!
        connection.autoReDialOnFailure = false;

        connection.isInitiator = false;
    }
})();
