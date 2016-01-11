// Last time updated at Monday, January 11th, 2016, 4:20:40 PM 

// ______________________________
// RTCMultiConnection-v3.0 (Beta)

'use strict';

(function() {

    // RTCMultiConnection.js

    function RTCMultiConnection(roomid) {
        var connection = this;

        connection.channel = connection.sessionid = (roomid || location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('')) + '';

        var mPeer = new MultiPeers(connection);

        mPeer.onGettingLocalMedia = function(stream) {
            setStreamEndHandler(stream);

            getRMCMediaElement(stream, function(mediaElement) {
                mediaElement.id = stream.streamid;
                mediaElement.muted = true;
                mediaElement.volume = 0;

                if (connection.attachStreams.indexOf(stream) === -1) {
                    connection.attachStreams.push(stream);
                }

                if (typeof StreamsHandler !== 'undefined') {
                    StreamsHandler.setHandlers(stream, true, connection);
                }

                connection.streamEvents[stream.streamid] = {
                    stream: stream,
                    type: 'local',
                    mediaElement: mediaElement,
                    userid: connection.userid,
                    extra: connection.extra,
                    streamid: stream.streamid,
                    blobURL: mediaElement.src || URL.createObjectURL(stream),
                    isAudioMuted: true
                };

                setHarkEvents(connection, connection.streamEvents[stream.streamid]);
                setMuteHandlers(connection, connection.streamEvents[stream.streamid]);

                connection.onstream(connection.streamEvents[stream.streamid]);
            });
        };

        mPeer.onGettingRemoteMedia = function(stream, remoteUserId) {
            getRMCMediaElement(stream, function(mediaElement) {
                mediaElement.id = stream.streamid;

                if (typeof StreamsHandler !== 'undefined') {
                    StreamsHandler.setHandlers(stream, false, connection);
                }

                connection.streamEvents[stream.streamid] = {
                    stream: stream,
                    type: 'remote',
                    userid: remoteUserId,
                    extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {},
                    mediaElement: mediaElement,
                    streamid: stream.streamid,
                    blobURL: mediaElement.src || URL.createObjectURL(stream)
                };

                setMuteHandlers(connection, connection.streamEvents[stream.streamid]);

                connection.onstream(connection.streamEvents[stream.streamid]);
            });
        };

        mPeer.onRemovingRemoteMedia = function(stream, remoteUserId) {
            var streamEvent = connection.streamEvents[stream.streamid];
            if (!streamEvent) {
                streamEvent = {
                    stream: stream,
                    type: 'remote',
                    userid: remoteUserId,
                    extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {},
                    streamid: stream.streamid,
                    mediaElement: connection.streamEvents[stream.streamid] ? connection.streamEvents[stream.streamid].mediaElement : null
                };
            }

            connection.onstreamended(streamEvent);

            delete connection.streamEvents[stream.streamid];
        };

        mPeer.onNegotiationNeeded = function(message, remoteUserId, callback) {
            connectSocket(function() {
                socket.emit(connection.socketMessageEvent, 'password' in message ? message : {
                    remoteUserId: message.remoteUserId || remoteUserId,
                    message: message,
                    sender: connection.userid
                }, callback || function() {});
            });
        };

        function onUserLeft(remoteUserId) {
            if (connection.peers[remoteUserId] && connection.peers[remoteUserId].peer) {
                connection.peers[remoteUserId].streams.forEach(function(stream) {
                    stream.stop();
                });

                connection.peers[remoteUserId].peer.close();
                connection.peers[remoteUserId].peer = null;

                connection.onleave({
                    userid: remoteUserId,
                    extra: connection.peers[remoteUserId].extra
                });
            }

            delete connection.peers[remoteUserId];
        }
        mPeer.onUserLeft = onUserLeft;
        mPeer.disconnectWith = function(remoteUserId, callback) {
            if (socket) {
                socket.emit('disconnect-with', remoteUserId, callback || function() {});
            }

            if (connection.peers[remoteUserId]) {
                if (connection.peers[remoteUserId].peer) {
                    connection.peers[remoteUserId].peer.close();
                }

                delete connection.peers[remoteUserId];
            }
        };

        connection.broadcasters = [];

        connection.socketOptions = {
            // 'force new connection': true, // For SocketIO version < 1.0
            // 'forceNew': true, // For SocketIO version >= 1.0
            'transport': 'polling' // fixing transport:unknown issues
        };

        var socket;

        function connectSocket(connectCallback) {
            if (socket) { // todo: check here readySate/etc. to make sure socket is still opened
                if (connectCallback) {
                    connectCallback(socket);
                }
                return;
            }

            if (typeof SocketConnection === 'undefined') {
                if (typeof FirebaseConnection !== 'undefined') {
                    window.SocketConnection = FirebaseConnection;
                } else if (typeof PubNubConnection !== 'undefined') {
                    window.SocketConnection = PubNubConnection;
                } else {
                    throw 'SocketConnection.js seems missed.';
                }
            }

            socket = new SocketConnection(connection, function(s) {
                socket = s;
                if (connectCallback) {
                    connectCallback(socket);
                }
            });
        }

        connection.openOrJoin = function(localUserid, password) {
            connection.checkPresence(localUserid, function(isRoomExists, roomid) {
                if (typeof password === 'function') {
                    password(isRoomExists, roomid);
                    password = null;
                }

                if (isRoomExists) {
                    connection.sessionid = roomid;

                    var localPeerSdpConstraints = false;
                    var remotePeerSdpConstraints = false;
                    var isOneWay = !!connection.session.oneway;
                    var isDataOnly = isData(connection.session);

                    remotePeerSdpConstraints = {
                        OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    }

                    localPeerSdpConstraints = {
                        OfferToReceiveAudio: isOneWay ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: isOneWay ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    }

                    var connectionDescription = {
                        remoteUserId: connection.sessionid,
                        message: {
                            newParticipationRequest: true,
                            isOneWay: isOneWay,
                            isDataOnly: isDataOnly,
                            localPeerSdpConstraints: localPeerSdpConstraints,
                            remotePeerSdpConstraints: remotePeerSdpConstraints
                        },
                        sender: connection.userid,
                        password: password || false
                    };

                    mPeer.onNegotiationNeeded(connectionDescription);
                    return;
                }

                var oldUserId = connection.userid;
                connection.userid = connection.sessionid = localUserid || connection.sessionid;
                connection.userid += '';

                socket.emit('changed-uuid', connection.userid);

                if (password) {
                    socket.emit('set-password', password);
                }

                connection.isInitiator = true;

                if (isData(connection.session)) {
                    return;
                }

                connection.captureUserMedia();
            });
        };

        connection.open = function(localUserid, isPublicModerator) {
            var oldUserId = connection.userid;
            connection.userid = connection.sessionid = localUserid || connection.sessionid;
            connection.userid += '';

            connection.isInitiator = true;

            connectSocket(function() {
                socket.emit('changed-uuid', connection.userid);

                if (isPublicModerator == true) {
                    connection.becomePublicModerator();
                }
            });

            if (isData(connection.session)) {
                if (typeof isPublicModerator === 'function') {
                    isPublicModerator();
                }
                return;
            }

            connection.captureUserMedia(typeof isPublicModerator === 'function' ? isPublicModerator : null);
        };

        connection.becomePublicModerator = function() {
            if (!connection.isInitiator) return;
            socket.emit('become-a-public-moderator');
        };

        connection.rejoin = function(connectionDescription) {
            if (connection.isInitiator) {
                return;
            }

            var extra = {};

            if (connection.peers[connectionDescription.remoteUserId]) {
                extra = connection.peers[connectionDescription.remoteUserId].extra;
                if (connection.peers[connectionDescription.remoteUserId].peer) {
                    connection.peers[connectionDescription.remoteUserId].peer = null;
                }
                delete connection.peers[connectionDescription.remoteUserId];
            }

            if (connectionDescription && connectionDescription.remoteUserId) {
                connection.join(connectionDescription.remoteUserId);

                connection.onReConnecting({
                    userid: connectionDescription.remoteUserId,
                    extra: extra
                });
            }
        };

        connection.join = connection.connect = function(remoteUserId, options) {
            connection.sessionid = (remoteUserId ? remoteUserId.sessionid || remoteUserId.remoteUserId || remoteUserId : false) || connection.sessionid;
            connection.sessionid += '';

            var localPeerSdpConstraints = false;
            var remotePeerSdpConstraints = false;
            var isOneWay = false;
            var isDataOnly = false;

            if ((remoteUserId && remoteUserId.session) || !remoteUserId || typeof remoteUserId === 'string') {
                var session = remoteUserId ? remoteUserId.session || connection.session : connection.session;

                isOneWay = !!session.oneway;
                isDataOnly = isData(session);

                remotePeerSdpConstraints = {
                    OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                    OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                };

                localPeerSdpConstraints = {
                    OfferToReceiveAudio: isOneWay ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                    OfferToReceiveVideo: isOneWay ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                };
            }

            options = options || {};
            if (typeof options.localPeerSdpConstraints !== 'undefined') {
                localPeerSdpConstraints = options.localPeerSdpConstraints;
            }

            if (typeof options.remotePeerSdpConstraints !== 'undefined') {
                remotePeerSdpConstraints = options.remotePeerSdpConstraints;
            }

            if (typeof options.isOneWay !== 'undefined') {
                isOneWay = options.isOneWay;
            }

            if (typeof options.isDataOnly !== 'undefined') {
                isDataOnly = options.isDataOnly;
            }

            var connectionDescription = {
                remoteUserId: connection.sessionid,
                message: {
                    newParticipationRequest: true,
                    isOneWay: isOneWay,
                    isDataOnly: isDataOnly,
                    localPeerSdpConstraints: localPeerSdpConstraints,
                    remotePeerSdpConstraints: remotePeerSdpConstraints
                },
                sender: connection.userid,
                password: false
            };

            connectSocket(function() {
                if (!!connection.peers[connection.sessionid]) {
                    // on socket disconnect & reconnect
                    return;
                }

                mPeer.onNegotiationNeeded(connectionDescription);
            });

            return connectionDescription;
        };

        connection.connectWithAllParticipants = function(remoteUserId) {
            mPeer.onNegotiationNeeded('connectWithAllParticipants', remoteUserId || connection.sessionid);
        };

        connection.removeFromBroadcastersList = function(remoteUserId) {
            mPeer.onNegotiationNeeded('removeFromBroadcastersList', remoteUserId || connection.sessionid);

            connection.peers.getAllParticipants(remoteUserId || connection.sessionid).forEach(function(participant) {
                mPeer.onNegotiationNeeded('dropPeerConnection', participant);

                connection.peers[participant].peer.close();
                connection.peers[participant].peer = null;
                delete connection.peers[participant];
            });

            connection.attachStreams.forEach(function(stream) {
                stream.addEventListener('ended', function() {
                    connection.renegotiate(remoteUserId || connection.sessionid);
                }, false);
                stream.stop();
            });
        };

        connection.getUserMedia = connection.captureUserMedia = function(callback, session) {
            session = session || connection.session;

            if (connection.dontCaptureUserMedia || isData(session)) {
                if (callback) {
                    callback();
                }
                return;
            }

            if (session.audio || session.video || session.screen) {
                if (session.screen) {
                    getScreenConstraints(function(error, screen_constraints) {
                        if (error) {
                            throw error;
                        }

                        invokeGetUserMedia({
                            video: screen_constraints,
                            isScreen: true
                        }, session.audio || session.video ? invokeGetUserMedia : false);
                    });
                } else if (session.audio || session.video) {
                    invokeGetUserMedia();
                }
            }

            function invokeGetUserMedia(localMediaConstraints, getUserMedia_callback) {
                var isScreen = false;
                if (localMediaConstraints) {
                    isScreen = localMediaConstraints.isScreen;
                    delete localMediaConstraints.isScreen;
                }

                getUserMediaHandler({
                    onGettingLocalMedia: function(stream) {
                        stream.isAudio = stream.isVideo = stream.isScreen = false;

                        if (isScreen) {
                            stream.isScreen = true;
                        } else if (session.audio && session.video) {
                            stream.isVideo = true;
                        } else if (session.audio) {
                            stream.isAudio = true;
                        }

                        mPeer.onGettingLocalMedia(stream);

                        if (getUserMedia_callback) {
                            return getUserMedia_callback();
                        }

                        if (callback) {
                            callback(stream);
                        }
                    },
                    onLocalMediaError: function(error) {
                        mPeer.onLocalMediaError(error);
                        if (callback) {
                            callback();
                        }
                    },
                    localMediaConstraints: localMediaConstraints || {
                        audio: !!session.audio ? connection.mediaConstraints.audio : false,
                        video: !!session.video ? connection.mediaConstraints.video : false
                    }
                });
            }
        };

        function beforeUnload(shiftModerationControlOnLeave) {
            if (!connection.closeBeforeUnload) {
                return;
            }
            connection.peers.getAllParticipants().forEach(function(participant) {
                mPeer.onNegotiationNeeded({
                    userLeft: true,
                    autoCloseEntireSession: !!connection.autoCloseEntireSession
                }, participant);

                if (connection.peers[participant] && connection.peers[participant].peer) {
                    connection.peers[participant].peer.close();
                }
            });

            if (socket) {
                if (typeof socket.disconnect !== 'undefined') {
                    connection.autoReDialOnFailure = false; // Prevent reconnection     
                    socket.disconnect();
                }
                socket = null;
            }

            // equivalent of connection.isInitiator
            if (!connection.broadcasters.length || !!connection.autoCloseEntireSession) return;

            var firstBroadcaster = connection.broadcasters[0];
            var otherBroadcasters = [];
            connection.broadcasters.forEach(function(broadcaster) {
                if (broadcaster !== firstBroadcaster) {
                    otherBroadcasters.push(broadcaster);
                }
            });

            connection.shiftModerationControl(firstBroadcaster, otherBroadcasters, typeof shiftModerationControlOnLeave != 'undefined' ? shiftModerationControlOnLeave : true);

            connection.broadcasters = [];
            connection.isInitiator = false;
        }

        connection.closeBeforeUnload = true;
        window.addEventListener('beforeunload', beforeUnload, false);

        connection.userid = getRandomString();
        connection.changeUserId = function(newUserId) {
            connection.userid = newUserId || getRandomString();
            socket.emit('changed-uuid', connection.userid);
        };

        connection.extra = {};
        if (Object.observe) {
            Object.observe(connection.extra, function(changes) {
                socket.emit('extra-data-updated', connection.extra);
            });
        }

        connection.session = {
            audio: true,
            video: true
        };

        connection.enableFileSharing = false;

        connection.mediaConstraints = {
            audio: {
                mandatory: {},
                optional: []
            },
            video: {
                mandatory: {},
                optional: []
            }
        };

        DetectRTC.load(function() {
            // it will force RTCMultiConnection to capture last-devices
            // i.e. if external microphone is attached to system, we should prefer it over built-in devices.
            DetectRTC.MediaDevices.forEach(function(device) {
                if (device.kind === 'audioinput') {
                    connection.mediaConstraints.audio = {
                        optional: [{
                            sourceId: device.id
                        }],
                        mandatory: {}
                    };

                    if (isFirefox) {
                        connection.mediaConstraints.audio = {
                            deviceId: device.id
                        };
                    }
                }

                if (device.kind === 'videoinput') {
                    connection.mediaConstraints.video = {
                        optional: [{
                            sourceId: device.id
                        }],
                        mandatory: {}
                    };

                    if (isFirefox) {
                        connection.mediaConstraints.video = {
                            deviceId: device.id
                        };
                    }
                }
            })
        });

        connection.sdpConstraints = {
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            },
            optional: [{
                VoiceActivityDetection: false
            }]
        };

        connection.optionalArgument = {
            optional: [{
                DtlsSrtpKeyAgreement: true
            }, {
                googImprovedWifiBwe: true
            }, {
                googScreencastMinBitrate: 300
            }],
            mandatory: {}
        };

        connection.iceServers = IceServersHandler.getIceServers(connection);

        connection.candidates = {
            host: true,
            stun: true,
            turn: true
        };

        connection.iceProtocols = {
            tcp: true,
            udp: true
        };

        // EVENTs
        connection.onopen = function(event) {
            if (!!connection.enableLogs) {
                console.info('Data connection has been opened between you & ', event.userid);
            }
        };

        connection.onclose = function(event) {
            if (!!connection.enableLogs) {
                console.warn('Data connection has been closed between you & ', event.userid);
            }
        };

        connection.onerror = function(error) {
            if (!!connection.enableLogs) {
                console.error(error.userid, 'data-error', error);
            }
        };

        connection.onmessage = function(event) {
            if (!!connection.enableLogs) {
                console.debug('data-message', event.userid, event.data);
            }
        };

        connection.send = function(data, remoteUserId) {
            connection.peers.send(data, remoteUserId);
        };

        connection.close = connection.disconnect = connection.leave = function() {
            beforeUnload(false);
        };

        connection.onstream = function(e) {
            var parentNode = connection.videosContainer;
            parentNode.insertBefore(e.mediaElement, parentNode.firstChild);
        };

        connection.onstreamended = function(e) {
            if (!e.mediaElement) {
                e.mediaElement = document.getElementById(e.streamid);
            }

            if (!e.mediaElement || !e.mediaElement.parentNode) {
                return;
            }

            e.mediaElement.parentNode.removeChild(e.mediaElement);
        };

        connection.direction = 'many-to-many';
        connection.attachStreams = [];
        connection.removeStreams = [];

        Array.prototype.getStreamById = function(streamid) {
            var stream;
            this.forEach(function(_stream) {
                if (_stream.streamid == streamid) stream = _stream;
            });
            return stream;
        };

        connection.removeStream = function(streamid) {
            var stream;
            connection.attachStreams.forEach(function(localStream) {
                if (localStream.id === streamid) {
                    stream = localStream;
                }
            });

            if (!stream) {
                console.warn('No such stream exists.', streamid);
                return;
            }

            if (connection.removeStreams.indexOf(stream) === -1) {
                connection.removeStreams.push(stream);
                connection.peers.getAllParticipants().forEach(function(participant) {
                    mPeer.renegotiatePeer(participant);
                });
            }
        };

        connection.addStream = function(session) {
            if (isData(session)) {
                connection.renegotiate();
                return;
            }

            if (!session.audio || session.video || session.screen) {
                if (session.screen) {
                    getScreenConstraints(function(error, screen_constraints) {
                        if (error) {
                            return alert(error);
                        }

                        invokeGetUserMedia({
                            video: screen_constraints
                        }, session.audio || session.video ? invokeGetUserMedia : false);
                    });
                } else if (session.audio || session.video) {
                    invokeGetUserMedia();
                }
            }

            function invokeGetUserMedia(localMediaConstraints, callback) {
                getUserMediaHandler({
                    onGettingLocalMedia: function(stream) {
                        var videoConstraints = localMediaConstraints ? localMediaConstraints.video : connection.mediaConstraints;
                        if (videoConstraints) {
                            if (videoConstraints.mediaSource || videoConstraints.mozMediaSource) {
                                stream.isScreen = true;
                            } else if (videoConstraints.mandatory && videoConstraints.mandatory.chromeMediaSource) {
                                stream.isScreen = true;
                            }
                        }

                        if (!stream.isScreen) {
                            stream.isVideo = stream.getVideoTracks().length;
                            stream.isAudio = !stream.isVideo && stream.getAudioTracks().length;
                        }

                        mPeer.onGettingLocalMedia(stream);

                        if (session.streamCallback) {
                            session.streamCallback(stream);
                        }

                        if (callback) {
                            return callback();
                        }

                        connection.renegotiate();
                    },
                    onLocalMediaError: function(error) {
                        mPeer.onLocalMediaError(error);
                        if (callback) {
                            return callback();
                        }

                        connection.renegotiate();
                    },
                    localMediaConstraints: localMediaConstraints || {
                        audio: session.audio ? connection.mediaConstraints.audio : false,
                        video: session.video ? connection.mediaConstraints.video : false
                    }
                });
            }
        };

        function applyConstraints(stream, mediaConstraints) {
            if (!stream) {
                if (!!connection.enableLogs) {
                    console.error('No stream to applyConstraints.');
                }
                return;
            }

            if (mediaConstraints.audio) {
                stream.getAudioTracks().forEach(function(track) {
                    track.applyConstraints(mediaConstraints.audio);
                });
            }

            if (mediaConstraints.video) {
                stream.getVideoTracks().forEach(function(track) {
                    track.applyConstraints(mediaConstraints.video);
                });
            }
        }

        connection.applyConstraints = function(mediaConstraints, streamid) {
            if (!MediaStreamTrack || !MediaStreamTrack.prototype.applyConstraints) {
                alert('track.applyConstraints is NOT supported in your browser.');
                return;
            }

            if (streamid) {
                var streams;
                if (connection.streamEvents[streamid]) {
                    stream = connection.streamEvents[streamid].stream;
                }
                applyConstraints(stream, mediaConstraints);
                return;
            }

            connection.attachStreams.forEach(function(stream) {
                applyConstraints(stream, mediaConstraints);
            });
        };

        function replaceTrack(track, remoteUserId, isVideoTrack) {
            if (remoteUserId) {
                mPeer.replaceTrack(track, remoteUserId, isVideoTrack);
                return;
            }

            connection.peers.getAllParticipants().forEach(function(participant) {
                mPeer.replaceTrack(track, participant, isVideoTrack);
            });
        }

        connection.replaceTrack = function(session, remoteUserId, isVideoTrack) {
            session = session || {};

            if (!RTCPeerConnection.prototype.getSenders) {
                this.addStream(session);
                return;
            }

            if (session instanceof MediaStreamTrack) {
                replaceTrack(session, remoteUserId, isVideoTrack);
                return;
            }

            if (session instanceof MediaStream) {
                replaceTrack(session.getVideoTracks()[0], remoteUserId, isVideoTrack);
                return;
            }

            if (isData(session)) {
                throw 'connection.replaceTrack requires audio and/or video and/or screen.';
                return;
            }

            if (!session.audio || session.video || session.screen) {
                if (session.screen) {
                    getScreenConstraints(function(error, screen_constraints) {
                        if (error) {
                            return alert(error);
                        }

                        invokeGetUserMedia({
                            video: screen_constraints
                        }, session.audio || session.video ? invokeGetUserMedia : false);
                    });
                } else if (session.audio || session.video) {
                    invokeGetUserMedia();
                }
            }

            function invokeGetUserMedia(localMediaConstraints, callback) {
                getUserMediaHandler({
                    onGettingLocalMedia: function(stream) {
                        mPeer.onGettingLocalMedia(stream);

                        if (callback) {
                            return callback();
                        }

                        connection.replaceTrack(stream, remoteUserId, isVideoTrack || session.video || session.screen);
                    },
                    onLocalMediaError: function(error) {
                        mPeer.onLocalMediaError(error);

                        if (callback) {
                            callback();
                        }
                    },
                    localMediaConstraints: localMediaConstraints || {
                        audio: session.audio ? connection.mediaConstraints.audio : false,
                        video: session.video ? connection.mediaConstraints.video : false
                    }
                });
            }
        };

        connection.renegotiate = function(remoteUserId) {
            if (remoteUserId) {
                mPeer.renegotiatePeer(remoteUserId);
                return;
            }

            connection.peers.getAllParticipants().forEach(function(participant) {
                mPeer.renegotiatePeer(participant);
            });
        };

        function setStreamEndHandler(stream) {
            if (stream.alreadySetEndHandler) {
                return;
            }
            stream.alreadySetEndHandler = true;

            stream.addEventListener('ended', function() {
                delete connection.attachStreams[connection.attachStreams.indexOf(stream)];

                if (connection.removeStreams.indexOf(stream) === -1) {
                    connection.removeStreams.push(stream);
                }

                connection.attachStreams = removeNullEntries(connection.attachStreams);
                connection.removeStreams = removeNullEntries(connection.removeStreams);

                // connection.renegotiate();

                var streamEvent = connection.streamEvents[stream];
                if (!streamEvent) {
                    streamEvent = {
                        stream: stream,
                        streamid: stream.streamid,
                        type: 'local',
                        userid: connection.userid,
                        extra: connection.extra,
                        mediaElement: connection.streamEvents[stream.streamid] ? connection.streamEvents[stream.streamid].mediaElement : null
                    };
                }
                connection.onstreamended(streamEvent);

                delete connection.streamEvents[stream.streamid];
            }, false);
        }

        if (Object.observe) {
            Object.observe(connection.attachStreams, function(changes) {
                changes.forEach(function(change) {
                    if (change.type === 'add') {
                        setStreamEndHandler(change.object[change.name]);
                    }

                    if (change.type === 'remove' || change.type === 'delete') {
                        if (connection.removeStreams.indexOf(change.object[change.name]) === -1) {
                            connection.removeStreams.push(change.object[change.name]);
                        }
                    }

                    connection.attachStreams = removeNullEntries(connection.attachStreams);
                    connection.removeStreams = removeNullEntries(connection.removeStreams);
                });
            });
        }

        connection.onMediaError = function(error) {
            if (!!connection.enableLogs) {
                console.error(error);
            }
        };

        connection.addNewBroadcaster = function(broadcasterId, userPreferences) {
            connection.broadcasters.forEach(function(broadcaster) {
                mPeer.onNegotiationNeeded({
                    newParticipant: broadcasterId,
                    userPreferences: userPreferences || false
                }, broadcaster);
            });

            if (!connection.session.oneway && connection.direction === 'many-to-many' && connection.broadcasters.indexOf(broadcasterId) === -1) {
                connection.broadcasters.push(broadcasterId);
            }
        };

        connection.filesContainer = connection.videosContainer = document.body || document.documentElement;
        connection.isInitiator = false;

        connection.shareFile = mPeer.shareFile;
        if (typeof FileProgressBarHandler !== 'undefined') {
            FileProgressBarHandler.handle(connection);
        }

        connection.autoCloseEntireSession = false;

        if (typeof TranslationHandler !== 'undefined') {
            TranslationHandler.handle(connection);
        }

        connection.token = getRandomString;

        connection.onNewParticipant = function(participantId, userPreferences) {
            connection.acceptParticipationRequest(participantId, userPreferences);
        };

        connection.acceptParticipationRequest = function(participantId, userPreferences) {
            if (userPreferences.successCallback) {
                userPreferences.successCallback();
                delete userPreferences.successCallback;
            }

            mPeer.createNewPeer(participantId, userPreferences);
        };

        connection.onShiftedModerationControl = function(sender, existingBroadcasters) {
            connection.acceptModerationControl(sender, existingBroadcasters);
        };

        connection.acceptModerationControl = function(sender, existingBroadcasters) {
            connection.isInitiator = true; // NEW initiator!

            connection.broadcasters = existingBroadcasters;
            connection.peers.getAllParticipants().forEach(function(participant) {
                mPeer.onNegotiationNeeded({
                    changedUUID: sender,
                    oldUUID: connection.userid,
                    newUUID: sender
                }, participant);
            });
            connection.userid = sender;
            socket.emit('changed-uuid', connection.userid);
        };

        connection.shiftModerationControl = function(remoteUserId, existingBroadcasters, firedOnLeave) {
            mPeer.onNegotiationNeeded({
                shiftedModerationControl: true,
                broadcasters: existingBroadcasters,
                firedOnLeave: !!firedOnLeave
            }, remoteUserId);
        };

        connection.processSdp = function(sdp) {
            sdp = BandwidthHandler.setApplicationSpecificBandwidth(sdp, connection.bandwidth, !!connection.session.screen);
            sdp = BandwidthHandler.setVideoBitrates(sdp, {
                min: connection.bandwidth.video,
                max: connection.bandwidth.video
            });
            sdp = BandwidthHandler.setOpusAttributes(sdp);
            return sdp;
        };

        if (typeof BandwidthHandler !== 'undefined') {
            connection.BandwidthHandler = BandwidthHandler;
        }

        connection.bandwidth = {
            screen: 300, // 300kbps minimum
            audio: 50,
            video: 256
        };

        connection.onleave = function(userid) {};

        connection.invokeSelectFileDialog = function(callback) {
            var selector = new FileSelector();
            selector.selectSingleFile(callback);
        };

        connection.getPublicModerators = function(userIdStartsWith, callback) {
            if (typeof userIdStartsWith === 'function') {
                callback = userIdStartsWith;
            }

            connectSocket(function(socket) {
                socket.emit(
                    'get-public-moderators',
                    typeof userIdStartsWith === 'string' ? userIdStartsWith : '',
                    callback
                );
            });
        };

        connection.onmute = function(e) {
            if (!e.mediaElement) {
                return;
            }

            if (e.stream.isVideo || e.stream.isScreen) {
                e.mediaElement.pause();
                e.mediaElement.setAttribute('poster', e.snapshot || 'https://cdn.webrtc-experiment.com/images/muted.png');
            }
            if (e.stream.isAudio) {
                e.mediaElement.muted = true;
            }
        };

        connection.onunmute = function(e) {
            if (!e.mediaElement) {
                return;
            }

            if (e.stream.isVideo || e.stream.isScreen) {
                e.mediaElement.play();
                e.mediaElement.removeAttribute('poster');
            }
            if (e.stream.isAudio) {
                e.mediaElement.muted = false;
            }
        };

        connection.onExtraDataUpdated = function(event) {
            event.status = 'online';
            connection.onUserStatusChanged(event, true);
        };

        connection.onJoinWithPassword = function(remoteUserId) {
            console.warn(remoteUserId, 'is password protected. Please join with password.');
        };

        connection.onInvalidPassword = function(remoteUserId, oldPassword) {
            console.warn(remoteUserId, 'is password protected. Please join with valid password. Your old password', oldPassword, 'is wrong.');
        };

        connection.onPasswordMaxTriesOver = function(remoteUserId) {
            console.warn(remoteUserId, 'is password protected. Your max password tries exceeded the limit.');
        };

        connection.getAllParticipants = function() {
            return connection.peers.getAllParticipants();
        };

        if (typeof StreamsHandler !== 'undefined') {
            StreamsHandler.onSyncNeeded = function(streamid, action, type) {
                connection.peers.getAllParticipants().forEach(function(participant) {
                    mPeer.onNegotiationNeeded({
                        streamid: streamid,
                        action: action,
                        streamSyncNeeded: true,
                        type: type || 'both'
                    }, participant);
                });
            };
        }

        connection.getAllVideos = function(remoteUserId) {
            var videos = [];
            Array.prototype.slice.call(document.querySelectorAll('video')).forEach(function(video) {
                if (video.getAttribute('data-userid') === remoteUserId) {
                    videos.push(video);
                }
            });
            return videos;
        }

        connection.connectSocket = function(callback) {
            connectSocket(callback);
        };

        connection.getSocket = function(callback) {
            if (!socket) {
                connectSocket(callback);
            } else if (callback) {
                callback(socket);
            }

            return socket;
        };

        connection.getRemoteStreams = mPeer.getRemoteStreams;
        connection.autoReDialOnFailure = true;

        var skipStreams = ['selectFirst', 'selectAll', 'forEach'];

        connection.streamEvents = {
            selectFirst: function(options) {
                if (!options) {
                    // in normal conferencing, it will always be "local-stream"
                    var firstStream;
                    for (var str in connection.streamEvents) {
                        if (skipStreams.indexOf(str) === -1 && !firstStream) {
                            firstStream = connection.streamEvents[str];
                            continue;
                        }
                    }
                    return firstStream;
                }
            },
            selectAll: function() {}
        };

        connection.socketURL = '/'; // generated via config.json
        connection.socketMessageEvent = 'RTCMultiConnection-Message'; // generated via config.json
        connection.socketCustomEvent = 'RTCMultiConnection-Custom-Message'; // generated via config.json
        connection.DetectRTC = DetectRTC;

        connection.onUserStatusChanged = function(event, dontWriteLogs) {
            if (!!connection.enableLogs && !dontWriteLogs) {
                console.info(event.userid, event.status);
            }
        };

        connection.getUserMediaHandler = getUserMediaHandler;
        connection.multiPeersHandler = mPeer;
        connection.enableLogs = true;
        connection.setCustomSocketHandler = function(customSocketHandler) {
            if (typeof SocketConnection !== 'undefined') {
                SocketConnection = customSocketHandler;
            }
        };

        // default value is 15k because Firefox's receiving limit is 16k!
        // however 64k works chrome-to-chrome
        connection.chunkSize = 15 * 1000;

        connection.maxParticipantsAllowed = 1000;

        // eject or leave single user
        connection.disconnectWith = mPeer.disconnectWith;

        connection.checkPresence = function(remoteUserId, callback) {
            mPeer.onNegotiationNeeded({
                detectPresence: true,
                userid: (remoteUserId || connection.sessionid) + ''
            }, 'system', callback);
        };

        connection.onReadyForOffer = function(remoteUserId, userPreferences) {
            connection.multiPeersHandler.createNewPeer(remoteUserId, userPreferences);
        };

        connection.setUserPreferences = function(userPreferences) {
            if (connection.dontAttachStream) {
                userPreferences.dontAttachLocalStream = true;
            }

            if (connection.dontGetRemoteStream) {
                userPreferences.dontGetRemoteStream = true;
            }

            return userPreferences;
        };

        connection.updateExtraData = function() {
            socket.emit('extra-data-updated', connection.extra);
        };

        connection.enableScalableBroadcast = false;
        connection.singleBroadcastAttendees = 3; // each broadcast should serve only 3 users

        connection.dontCaptureUserMedia = false;
        connection.dontAttachStream = false;
        connection.dontGetRemoteStream = false;

        connection.onReConnecting = function(event) {
            if (connection.enableLogs) {
                console.info('ReConnecting with', event.userid, '...');
            }
        }
    }

    function SocketConnection(connection, connectCallback) {
        var parameters = '';

        parameters += '?userid=' + connection.userid;
        parameters += '&msgEvent=' + connection.socketMessageEvent;
        parameters += '&socketCustomEvent=' + connection.socketCustomEvent;

        if (connection.enableScalableBroadcast) {
            parameters += '&enableScalableBroadcast=true';
            parameters += '&singleBroadcastAttendees=' + connection.singleBroadcastAttendees;
        }

        var socket = io.connect((connection.socketURL || '/') + parameters, connection.socketOptions);

        var mPeer = connection.multiPeersHandler;

        socket.on('extra-data-updated', function(remoteUserId, extra) {
            if (!connection.peers[remoteUserId]) return;
            connection.peers[remoteUserId].extra = extra;

            connection.onExtraDataUpdated({
                userid: remoteUserId,
                extra: extra
            });
        });

        socket.on(connection.socketMessageEvent, function(message) {
            if (message.remoteUserId != connection.userid) return;

            if (connection.peers[message.sender] && connection.peers[message.sender].extra != message.extra) {
                connection.peers[message.sender].extra = message.extra;
                connection.onExtraDataUpdated({
                    userid: message.sender,
                    extra: message.extra
                });
            }

            if (message.message.streamSyncNeeded && connection.peers[message.sender]) {
                var stream = connection.streamEvents[message.message.streamid];
                if (!stream || !stream.stream) {
                    return;
                }

                var action = message.message.action;

                if (action === 'ended') {
                    connection.onstreamended(stream);
                    return;
                }

                var type = message.message.type != 'both' ? message.message.type : null;
                stream.stream[action](type);
                return;
            }

            if (message.message === 'connectWithAllParticipants') {
                if (connection.broadcasters.indexOf(message.sender) === -1) {
                    connection.broadcasters.push(message.sender);
                }

                mPeer.onNegotiationNeeded({
                    allParticipants: connection.peers.getAllParticipants(message.sender)
                }, message.sender);
                return;
            }

            if (message.message === 'removeFromBroadcastersList') {
                if (connection.broadcasters.indexOf(message.sender) !== -1) {
                    delete connection.broadcasters[connection.broadcasters.indexOf(message.sender)];
                    connection.broadcasters = removeNullEntries(connection.broadcasters);
                }
                return;
            }

            if (message.message === 'dropPeerConnection') {
                if (connection.peers[message.sender]) {
                    connection.peers[message.sender].peer.close();
                    connection.peers[message.sender].peer = null;
                    delete connection.peers[message.sender];
                }
                return;
            }

            if (message.message.allParticipants) {
                if (message.message.allParticipants.indexOf(message.sender) === -1) {
                    message.message.allParticipants.push(message.sender);
                }

                message.message.allParticipants.forEach(function(participant) {
                    mPeer[!connection.peers[participant] ? 'createNewPeer' : 'renegotiatePeer'](participant, {
                        localPeerSdpConstraints: {
                            OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                            OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                        },
                        remotePeerSdpConstraints: {
                            OfferToReceiveAudio: connection.session.oneway ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                            OfferToReceiveVideo: connection.session.oneway ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                        },
                        isOneWay: !!connection.session.oneway || connection.direction === 'one-way',
                        isDataOnly: isData(connection.session)
                    });
                });
                return;
            }

            if (message.message.newParticipant) {
                if (message.message.newParticipant == connection.userid) return;
                if (!!connection.peers[message.message.newParticipant]) return;

                mPeer.createNewPeer(message.message.newParticipant, message.message.userPreferences || {
                    localPeerSdpConstraints: {
                        OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    },
                    remotePeerSdpConstraints: {
                        OfferToReceiveAudio: connection.session.oneway ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: connection.session.oneway ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    },
                    isOneWay: !!connection.session.oneway || connection.direction === 'one-way',
                    isDataOnly: isData(connection.session)
                });
                return;
            }

            if (message.message.readyForOffer || message.message.addMeAsBroadcaster) {
                connection.addNewBroadcaster(message.sender);
            }

            if (message.message.newParticipationRequest && message.sender !== connection.userid) {
                if (connection.peers[message.sender]) {
                    if (connection.peers[message.sender].peer) {
                        connection.peers[message.sender].peer.close();
                        connection.peers[message.sender].peer = null;
                    }
                    delete connection.peers[message.sender];
                }

                var userPreferences = {
                    extra: message.extra || {},
                    localPeerSdpConstraints: message.message.remotePeerSdpConstraints || {
                        OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    },
                    remotePeerSdpConstraints: message.message.localPeerSdpConstraints || {
                        OfferToReceiveAudio: connection.session.oneway ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: connection.session.oneway ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    },
                    isOneWay: typeof message.message.isOneWay !== 'undefined' ? message.message.isOneWay : !!connection.session.oneway || connection.direction === 'one-way',
                    isDataOnly: typeof message.message.isDataOnly !== 'undefined' ? message.message.isDataOnly : isData(connection.session),
                    dontGetRemoteStream: typeof message.message.isOneWay !== 'undefined' ? message.message.isOneWay : !!connection.session.oneway || connection.direction === 'one-way',
                    dontAttachLocalStream: !!message.message.dontGetRemoteStream,
                    connectionDescription: message,
                    successCallback: function() {
                        // if its oneway----- todo: THIS SEEMS NOT IMPORTANT.
                        if (typeof message.message.isOneWay !== 'undefined' ? message.message.isOneWay : !!connection.session.oneway || connection.direction === 'one-way') {
                            connection.addNewBroadcaster(message.sender, userPreferences);
                        }

                        if (!!connection.session.oneway || connection.direction === 'one-way' || isData(connection.session)) {
                            connection.addNewBroadcaster(message.sender, userPreferences);
                        }
                    }
                };

                connection.onNewParticipant(message.sender, userPreferences);
                return;
            }

            if (message.message.shiftedModerationControl) {
                connection.onShiftedModerationControl(message.sender, message.message.broadcasters);
                return;
            }

            if (message.message.changedUUID) {
                if (connection.peers[message.message.oldUUID]) {
                    connection.peers[message.message.newUUID] = connection.peers[message.message.oldUUID];
                    delete connection.peers[message.message.oldUUID];
                }
            }

            if (message.message.userLeft) {
                mPeer.onUserLeft(message.sender);

                if (!!message.message.autoCloseEntireSession) {
                    connection.leave();
                }

                return;
            }

            mPeer.addNegotiatedMessage(message.message, message.sender);
        });

        socket.on('user-left', function(userid) {
            onUserLeft(userid);

            connection.onUserStatusChanged({
                userid: userid,
                status: 'offline',
                extra: connection.peers[userid] ? connection.peers[userid].extra || {} : {}
            });

            connection.onleave({
                userid: userid,
                extra: {}
            });
        });

        socket.on('connect', function() {
            if (connection.enableLogs) {
                console.info('socket.io connection is opened.');
            }

            socket.emit('extra-data-updated', connection.extra);

            if (connectCallback) connectCallback(socket);
        });

        socket.on('disconnect', function() {
            if (connection.enableLogs) {
                console.info('socket.io connection is closed');
                console.warn('socket.io reconnecting');
            }
        });

        socket.on('join-with-password', function(remoteUserId) {
            connection.onJoinWithPassword(remoteUserId);
        });

        socket.on('invalid-password', function(remoteUserId, oldPassword) {
            connection.onInvalidPassword(remoteUserId, oldPassword);
        });

        socket.on('password-max-tries-over', function(remoteUserId) {
            connection.onPasswordMaxTriesOver(remoteUserId);
        });

        socket.on('user-disconnected', function(remoteUserId) {
            if (remoteUserId === connection.userid) {
                return;
            }

            connection.onUserStatusChanged({
                userid: remoteUserId,
                status: 'offline',
                extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra || {} : {}
            });

            if (connection.peers[remoteUserId] && connection.peers[remoteUserId].peer) {
                connection.peers[remoteUserId].peer.close();
                delete connection.peers[remoteUserId];
            }
        });

        socket.on('user-connected', function(userid) {
            if (userid === connection.userid) {
                return;
            }

            connection.onUserStatusChanged({
                userid: userid,
                status: 'online',
                extra: connection.peers[userid] ? connection.peers[userid].extra || {} : {}
            });
        });

        socket.on('logs', function(log) {
            if (!connection.enableLogs) return;
            console.debug('server-logs', log);
        });

        return socket;
    }

    // MultiPeersHandler.js

    function MultiPeers(connection) {
        var self = this;

        var skipPeers = ['getAllParticipants', 'getLength', 'selectFirst', 'streams', 'send', 'forEach'];
        connection.peers = {
            getLength: function() {
                var numberOfPeers = 0;
                for (var peer in this) {
                    if (skipPeers.indexOf(peer) == -1) {
                        numberOfPeers++;
                    }
                }
                return numberOfPeers;
            },
            selectFirst: function() {
                var firstPeer;
                for (var peer in this) {
                    if (skipPeers.indexOf(peer) == -1) {
                        firstPeer = this[peer];
                    }
                }
                return firstPeer;
            },
            getAllParticipants: function(sender) {
                var allPeers = [];
                for (var peer in this) {
                    if (skipPeers.indexOf(peer) == -1 && peer != sender) {
                        allPeers.push(peer);
                    }
                }
                return allPeers;
            },
            forEach: function(callbcak) {
                this.getAllParticipants().forEach(function(participant) {
                    callbcak(connection.peers[participant]);
                });
            },
            send: function(data, remoteUserId) {
                var that = this;

                if (!isNull(data.size) && !isNull(data.type)) {
                    self.shareFile(data, remoteUserId);
                    return;
                }

                if (data.type !== 'text' && !(data instanceof ArrayBuffer) && !(data instanceof DataView)) {
                    TextSender.send({
                        text: data,
                        channel: this,
                        connection: connection,
                        remoteUserId: remoteUserId
                    });
                    return;
                }

                if (data.type === 'text') {
                    data = JSON.stringify(data);
                }

                if (remoteUserId) {
                    var remoteUser = connection.peers[remoteUserId];
                    if (remoteUser) {
                        remoteUser.channels.forEach(function(channel) {
                            channel.send(data);
                        });
                        return;
                    }
                }

                this.getAllParticipants().forEach(function(participant) {
                    that[participant].channels.forEach(function(channel) {
                        channel.send(data);
                    });
                });
            }
        };

        this.uuid = connection.userid;

        this.getLocalConfig = function(remoteSdp, remoteUserId, userPreferences) {
            if (!userPreferences) {
                userPreferences = {};
            }

            return {
                streamsToShare: userPreferences.streamsToShare || {},
                session: connection.session,
                rtcMultiConnection: connection,
                connectionDescription: userPreferences.connectionDescription,
                remoteUserId: remoteUserId,
                localPeerSdpConstraints: userPreferences.localPeerSdpConstraints,
                remotePeerSdpConstraints: userPreferences.remotePeerSdpConstraints,
                dontGetRemoteStream: !!userPreferences.dontGetRemoteStream,
                dontAttachLocalStream: !!userPreferences.dontAttachLocalStream,
                optionalArgument: connection.optionalArgument,
                iceServers: connection.iceServers,
                renegotiatingPeer: !!userPreferences.renegotiatingPeer,
                peerRef: userPreferences.peerRef,
                enableDataChannels: !!connection.session.data,
                localStreams: connection.attachStreams,
                removeStreams: connection.removeStreams,
                onLocalSdp: function(localSdp) {
                    self.onNegotiationNeeded(localSdp, remoteUserId);
                },
                onLocalCandidate: function(localCandidate) {
                    localCandidate = OnIceCandidateHandler.processCandidates(connection, localCandidate)
                    if (localCandidate) {
                        self.onNegotiationNeeded(localCandidate, remoteUserId);
                    }
                },
                remoteSdp: remoteSdp,
                onDataChannelMessage: function(message) {
                    if (!fbr && connection.enableFileSharing) initFileBufferReader();

                    if (typeof message == 'string' || !connection.enableFileSharing) {
                        self.onDataChannelMessage(message, remoteUserId);
                        return;
                    }

                    var that = this;

                    if (message instanceof ArrayBuffer || message instanceof DataView) {
                        fbr.convertToObject(message, function(object) {
                            that.onDataChannelMessage(object);
                        });
                        return;
                    }

                    if (message.readyForNextChunk) {
                        fbr.getNextChunk(message.uuid, function(nextChunk, isLastChunk) {
                            connection.peers[remoteUserId].channels.forEach(function(channel) {
                                channel.send(nextChunk);
                            });
                        }, remoteUserId);
                        return;
                    }

                    fbr.addChunk(message, function(promptNextChunk) {
                        connection.peers[remoteUserId].peer.channel.send(promptNextChunk);
                    });
                },
                onDataChannelError: function(error) {
                    self.onDataChannelError(error, remoteUserId);
                },
                onDataChannelOpened: function(channel) {
                    self.onDataChannelOpened(channel, remoteUserId);
                },
                onDataChannelClosed: function(event) {
                    self.onDataChannelClosed(event, remoteUserId);
                },
                onRemoteStream: function(stream) {
                    connection.peers[remoteUserId].streams.push(stream);

                    if (isPluginRTC) {
                        var mediaElement = document.createElement('video');
                        var body = (document.body || document.documentElement);
                        body.insertBefore(mediaElement, body.firstChild);

                        setTimeout(function() {
                            Plugin.attachMediaStream(mediaElement, stream);

                            self.onGettingRemoteMedia(mediaElement, remoteUserId);
                        }, 3000);
                        return;
                    }

                    self.onGettingRemoteMedia(stream, remoteUserId);
                },
                onRemoteStreamRemoved: function(stream) {
                    self.onRemovingRemoteMedia(stream, remoteUserId);
                },
                onPeerStateChanged: function(states) {
                    self.onPeerStateChanged(states);

                    if (states.iceConnectionState === 'new') {
                        self.onNegotiationStarted(remoteUserId, states);
                    }

                    if (states.iceConnectionState === 'connected') {
                        self.onNegotiationCompleted(remoteUserId, states);
                    }

                    if (states.iceConnectionState.search(/closed|failed/gi) !== -1) {
                        self.onUserLeft(remoteUserId);
                        self.disconnectWith(remoteUserId);
                    }
                },
                processSdp: connection.processSdp
            };
        };

        this.createNewPeer = function(remoteUserId, userPreferences) {
            if (connection.maxParticipantsAllowed <= connection.getAllParticipants().length) {
                return;
            }

            userPreferences = userPreferences || {};

            if (!userPreferences.isOneWay && !userPreferences.isDataOnly) {
                userPreferences.isOneWay = true;
                this.onNegotiationNeeded({
                    enableMedia: true,
                    userPreferences: userPreferences
                }, remoteUserId);
                return;
            }

            userPreferences = connection.setUserPreferences(userPreferences);

            var localConfig = this.getLocalConfig(null, remoteUserId, userPreferences);
            connection.peers[remoteUserId] = new PeerInitiator(localConfig);
        };

        this.createAnsweringPeer = function(remoteSdp, remoteUserId, userPreferences) {
            userPreferences = connection.setUserPreferences(userPreferences || {});

            var localConfig = this.getLocalConfig(remoteSdp, remoteUserId, userPreferences);
            connection.peers[remoteUserId] = new PeerInitiator(localConfig);
        };

        this.renegotiatePeer = function(remoteUserId, userPreferences, remoteSdp) {
            if (!connection.peers[remoteUserId]) {
                throw 'This peer (' + remoteUserId + ') does not exists.';
            }

            if (!userPreferences) {
                userPreferences = {};
            }

            userPreferences.renegotiatingPeer = true;
            userPreferences.peerRef = connection.peers[remoteUserId].peer;

            var localConfig = this.getLocalConfig(remoteSdp, remoteUserId, userPreferences);

            connection.peers[remoteUserId] = new PeerInitiator(localConfig);
        };

        this.replaceTrack = function(track, remoteUserId, isVideoTrack) {
            if (!connection.peers[remoteUserId]) {
                throw 'This peer (' + remoteUserId + ') does not exists.';
            }

            var peer = connection.peers[remoteUserId].peer;

            if (!!peer.getSenders && typeof peer.getSenders === 'function' && peer.getSenders().length) {
                peer.getSenders().forEach(function(rtpSender) {
                    if (isVideoTrack && rtpSender.track instanceof VideoStreamTrack) {
                        rtpSender.replaceTrack(track);
                    }

                    if (!isVideoTrack && rtpSender.track instanceof AudioStreamTrack) {
                        rtpSender.replaceTrack(track);
                    }
                });
                return;
            }

            console.warn('RTPSender.replaceTrack is NOT supported.');
            this.renegotiatePeer(remoteUserId);
        };

        this.onNegotiationNeeded = function(message, remoteUserId) {};
        this.addNegotiatedMessage = function(message, remoteUserId) {
            if (message.type && message.sdp) {
                if (message.type == 'answer') {
                    if (connection.peers[remoteUserId]) {
                        connection.peers[remoteUserId].addRemoteSdp(message);
                    }
                }

                if (message.type == 'offer') {
                    if (message.renegotiatingPeer) {
                        this.renegotiatePeer(remoteUserId, null, message);
                    } else {
                        this.createAnsweringPeer(message, remoteUserId);
                    }
                }

                if (connection.enableLogs) {
                    console.log('Remote peer\'s sdp:', message.sdp);
                }
                return;
            }

            if (message.candidate) {
                if (connection.peers[remoteUserId]) {
                    connection.peers[remoteUserId].addRemoteCandidate(message);
                }

                if (connection.enableLogs) {
                    console.log('Remote peer\'s candidate pairs:', message.candidate);
                }
                return;
            }

            if (message.enableMedia) {
                if (connection.attachStreams.length) {
                    var streamsToShare = {};
                    connection.attachStreams.forEach(function(stream) {
                        streamsToShare[stream.streamid] = {
                            isAudio: !!stream.isAudio,
                            isVideo: !!stream.isVideo,
                            isScreen: !!stream.isScreen
                        };
                    });
                    message.userPreferences.streamsToShare = streamsToShare;

                    self.onNegotiationNeeded({
                        readyForOffer: true,
                        userPreferences: message.userPreferences
                    }, remoteUserId);
                    return;
                }

                var localMediaConstraints = {};
                var userPreferences = message.userPreferences;
                if (userPreferences.localPeerSdpConstraints.OfferToReceiveAudio) {
                    localMediaConstraints.audio = connection.mediaConstraints.audio;
                }

                if (userPreferences.localPeerSdpConstraints.OfferToReceiveVideo) {
                    localMediaConstraints.video = connection.mediaConstraints.video;
                }

                getUserMediaHandler({
                    onGettingLocalMedia: function(localStream) {
                        self.onGettingLocalMedia(localStream);

                        var streamsToShare = {};
                        connection.attachStreams.forEach(function(stream) {
                            streamsToShare[stream.streamid] = {
                                isAudio: !!stream.isAudio,
                                isVideo: !!stream.isVideo,
                                isScreen: !!stream.isScreen
                            };
                        });
                        message.userPreferences.streamsToShare = streamsToShare;

                        self.onNegotiationNeeded({
                            readyForOffer: true,
                            userPreferences: message.userPreferences
                        }, remoteUserId);
                    },
                    onLocalMediaError: function(error) {
                        self.onLocalMediaError(error);
                        self.onNegotiationNeeded({
                            readyForOffer: true,
                            userPreferences: message.userPreferences
                        }, remoteUserId);
                    },
                    localMediaConstraints: localMediaConstraints
                });
            }

            if (message.readyForOffer) {
                connection.onReadyForOffer(remoteUserId, message.userPreferences);
            }
        };

        this.onGettingRemoteMedia = function(stream, remoteUserId) {};
        this.onRemovingRemoteMedia = function(stream, remoteUserId) {};
        this.onGettingLocalMedia = function(localStream) {};
        this.onLocalMediaError = function(error) {
            if (!!connection.enableLogs) {
                console.error('onLocalMediaError', JSON.stringify(error, null, '\t'));
            }
            connection.onMediaError(error);
        };

        var fbr;

        function initFileBufferReader() {
            fbr = new FileBufferReader();
            fbr.onProgress = function(chunk) {
                connection.onFileProgress(chunk);
            };
            fbr.onBegin = function(file) {
                connection.onFileStart(file);
            };
            fbr.onEnd = function(file) {
                connection.onFileEnd(file);
            };
        }

        this.shareFile = function(file, remoteUserId) {
            if (!connection.enableFileSharing) {
                throw '"connection.enableFileSharing" is false.';
            }

            initFileBufferReader();

            fbr.readAsArrayBuffer(file, function(uuid) {
                var arrayOfUsers = connection.getAllParticipants();

                if (remoteUserId) {
                    arrayOfUsers = [remoteUserId];
                }

                arrayOfUsers.forEach(function(participant) {
                    fbr.getNextChunk(uuid, function(nextChunk) {
                        connection.peers[participant].channels.forEach(function(channel) {
                            channel.send(nextChunk);
                        });
                    }, participant);
                });
            }, {
                userid: connection.userid,
                // extra: connection.extra,
                chunkSize: connection.chunkSize || 0
            });
        };

        if (typeof 'TextReceiver' !== 'undefined') {
            var textReceiver = new TextReceiver(connection);
        }

        this.onDataChannelMessage = function(message, remoteUserId) {
            textReceiver.receive(JSON.parse(message), remoteUserId, connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {});
        };

        this.onDataChannelClosed = function(event, remoteUserId) {
            event.userid = remoteUserId;
            event.extra = connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {};
            connection.onclose(event);
        };

        this.onDataChannelError = function(error, remoteUserId) {
            error.userid = remoteUserId;
            event.extra = connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {};
            connection.onerror(error);
        };

        this.onDataChannelOpened = function(channel, remoteUserId) {
            connection.peers[remoteUserId].channels.push(channel);
            connection.onopen({
                userid: remoteUserId,
                extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {},
                channel: channel
            });
        };

        this.onPeerStateChanged = function(state) {
            if (connection.enableLogs) {
                if (state.iceConnectionState.search(/disconnected|closed|failed/gi) !== -1) {
                    console.error('Peer connection is closed between you & ', state.userid, state.extra, 'state:', state.iceConnectionState);
                }
            }
        };

        this.onNegotiationStarted = function(remoteUserId, states) {};
        this.onNegotiationCompleted = function(remoteUserId, states) {};

        this.getRemoteStreams = function(remoteUserId) {
            remoteUserId = remoteUserId || connection.peers.getAllParticipants()[0];
            return connection.peers[remoteUserId] ? connection.peers[remoteUserId].streams : [];
        };

        this.isPluginRTC = connection.isPluginRTC = isPluginRTC;
    }

    // globals.js

    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof window.InstallTrigger !== 'undefined';
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    var isChrome = !!window.chrome && !isOpera;
    var isIE = !!document.documentMode;

    var isPluginRTC = isSafari || isIE;

    var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);

    // detect node-webkit
    var isNodeWebkit = !!(window.process && (typeof window.process === 'object') && window.process.versions && window.process.versions['node-webkit']);


    var chromeVersion = 50;
    var matchArray = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    if (isChrome && matchArray && matchArray[2]) {
        chromeVersion = parseInt(matchArray[2], 10);
    }

    var firefoxVersion = 50;
    matchArray = navigator.userAgent.match(/Firefox\/(.*)/);
    if (isFirefox && matchArray && matchArray[1]) {
        firefoxVersion = parseInt(matchArray[1], 10);
    }

    function fireEvent(obj, eventName, args) {
        if (typeof CustomEvent === 'undefined') {
            return;
        }

        var eventDetail = {
            arguments: args,
            __exposedProps__: args
        };

        var event = new CustomEvent(eventName, eventDetail);
        obj.dispatchEvent(event);
    }

    function setHarkEvents(connection, streamEvent) {
        if (!connection || !streamEvent) {
            throw 'Both arguments are required.';
        }

        if (!connection.onspeaking || !connection.onsilence) {
            return;
        }

        if (typeof hark === 'undefined') {
            throw 'hark.js not found.';
        }

        hark(streamEvent.stream, {
            onspeaking: function() {
                connection.onspeaking(streamEvent);
            },
            onsilence: function() {
                connection.onsilence(streamEvent);
            },
            onvolumechange: function(volume, threshold) {
                if (!connection.onvolumechange) {
                    return;
                }
                connection.onvolumechange(merge({
                    volume: volume,
                    threshold: threshold
                }, streamEvent));
            }
        });
    }

    function setMuteHandlers(connection, streamEvent) {
        streamEvent.stream.addEventListener('mute', function(event) {
            event = connection.streamEvents[event.target.streamid];

            event.session = {
                audio: event.muteType === 'audio',
                video: event.muteType === 'video'
            };

            connection.onmute(event);
        }, false);

        streamEvent.stream.addEventListener('unmute', function(event) {
            event = connection.streamEvents[event.target.streamid];

            event.session = {
                audio: event.unmuteType === 'audio',
                video: event.unmuteType === 'video'
            };

            connection.onunmute(event);
        }, false);
    }

    function getRandomString() {
        if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
            var a = window.crypto.getRandomValues(new Uint32Array(3)),
                token = '';
            for (var i = 0, l = a.length; i < l; i++) {
                token += a[i].toString(36);
            }
            return token;
        } else {
            return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
        }
    }

    // Get HTMLAudioElement/HTMLVideoElement accordingly

    function getRMCMediaElement(stream, callback) {
        var isAudioOnly = false;
        if (!stream.getVideoTracks().length) {
            isAudioOnly = true;
        }

        var mediaElement = document.createElement(isAudioOnly ? 'audio' : 'video');

        if (isPluginRTC) {
            connection.videosContainer.insertBefore(mediaElement, connection.videosContainer.firstChild);

            setTimeout(function() {
                Plugin.attachMediaStream(mediaElement, stream);
                callback(mediaElement);
            }, 1000);

            return;
        }

        // "mozSrcObject" is always preferred over "src"!!
        mediaElement[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.URL.createObjectURL(stream);

        mediaElement.controls = true;

        // http://goo.gl/WZ5nFl
        // Firefox don't yet support onended for any stream (remote/local)
        if (isFirefox) {
            mediaElement.addEventListener('ended', function() {
                if (stream.onended) {
                    stream.onended();
                }
                fireEvent(stream, 'ended', stream.type);
            }, false);
        }

        mediaElement.play();
        callback(mediaElement);
    }

    // if IE
    if (!window.addEventListener) {
        window.addEventListener = function(el, eventName, eventHandler) {
            if (!el.attachEvent) {
                return;
            }
            el.attachEvent('on' + eventName, eventHandler);
        };
    }

    function listenEventHandler(eventName, eventHandler) {
        window.removeEventListener(eventName, eventHandler);
        window.addEventListener(eventName, eventHandler, false);
    }

    window.attachEventListener = function(video, type, listener, useCapture) {
        video.addEventListener(type, listener, useCapture);
    };

    function removeNullEntries(array) {
        var newArray = [];
        array.forEach(function(item) {
            if (item) {
                newArray.push(item);
            }
        });
        return newArray;
    }


    function isData(session) {
        return !session.audio && !session.video && !session.screen && session.data;
    }

    function isNull(obj) {
        return typeof obj === 'undefined';
    }

    function isString(obj) {
        return typeof obj === 'string';
    }

    var MediaStream = window.MediaStream;

    if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
        MediaStream = webkitMediaStream;
    }

    /*global MediaStream:true */
    if (typeof MediaStream !== 'undefined' && !('stop' in MediaStream.prototype)) {
        MediaStream.prototype.stop = function() {
            this.getAudioTracks().forEach(function(track) {
                track.stop();
            });

            this.getVideoTracks().forEach(function(track) {
                track.stop();
            });

            fireEvent(this, 'ended');
        };
    }

    // Last time updated at Feb 08, 2015, 08:32:23

    // Latest file can be found here: https://cdn.webrtc-experiment.com/Plugin.EveryWhere.js

    // Muaz Khan         - www.MuazKhan.com
    // MIT License       - www.WebRTC-Experiment.com/licence
    // Source Codes      - https://github.com/muaz-khan/PluginRTC

    // _____________________
    // Plugin.EveryWhere.js

    // Original Source: https://github.com/sarandogou/webrtc-everywhere#downloads

    (function() {
        var ua = navigator.userAgent.toLowerCase();
        var isSafari = ua.indexOf('safari') != -1 && ua.indexOf('chrome') == -1;
        var isIE = !!((Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(window, "ActiveXObject")) || ("ActiveXObject" in window));

        if (!(isSafari || isIE)) return;

        function LoadPluginRTC() {
            window.PluginRTC = {};

            var extractPluginObj = function(elt) {
                return elt.isWebRtcPlugin ? elt : elt.pluginObj;
            }
            var attachEventListener = function(elt, type, listener, useCapture) {
                var _pluginObj = extractPluginObj(elt);
                if (_pluginObj) {
                    _pluginObj.bindEventListener(type, listener, useCapture);
                } else {
                    if (typeof elt.addEventListener !== "undefined") {
                        elt.addEventListener(type, listener, useCapture);
                    } else if (typeof elt.addEvent !== "undefined") {
                        elt.addEventListener("on" + type, listener, useCapture);
                    }
                }
            }

            function getPlugin() {
                return document.getElementById('WebrtcEverywherePluginId');
            }

            var installPlugin = function() {
                if (document.getElementById('WebrtcEverywherePluginId')) {
                    return;
                }

                var pluginObj = document.createElement('object');
                if (isIE) {
                    pluginObj.setAttribute('classid', 'CLSID:7FD49E23-C8D7-4C4F-93A1-F7EACFA1EC53');
                } else {
                    pluginObj.setAttribute('type', 'application/webrtc-everywhere');
                }
                pluginObj.setAttribute('id', 'WebrtcEverywherePluginId');
                (document.body || document.documentElement).appendChild(pluginObj);
                pluginObj.setAttribute('width', '0');
                pluginObj.setAttribute('height', '0');
            }

            if (document.body) {
                installPlugin();
            } else {
                attachEventListener(window, 'load', function() {
                    installPlugin();
                });
                attachEventListener(document, 'readystatechange', function() {
                    if (document.readyState == 'complete') {
                        installPlugin();
                    }
                });
            }

            var getUserMediaDelayed;
            window.PluginRTC.getUserMedia = navigator.getUserMedia = function(constraints, successCallback, errorCallback) {
                if (document.readyState !== 'complete') {
                    if (!getUserMediaDelayed) {
                        getUserMediaDelayed = true;
                        attachEventListener(document, 'readystatechange', function() {
                            if (getUserMediaDelayed && document.readyState == 'complete') {
                                getUserMediaDelayed = false;
                                getPlugin().getUserMedia(constraints, successCallback, errorCallback);
                            }
                        });
                    }
                } else getPlugin().getUserMedia(constraints, successCallback, errorCallback);
            }

            window.PluginRTC.attachMediaStream = function(element, stream) {
                if (element.isWebRtcPlugin) {
                    element.src = stream;
                    return element;
                } else if (element.nodeName.toLowerCase() === 'video') {
                    if (!element.pluginObj && stream) {
                        var _pluginObj = document.createElement('object');
                        var _isIE = (Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(window, "ActiveXObject")) || ("ActiveXObject" in window);
                        if (_isIE) {
                            _pluginObj.setAttribute('classid', 'CLSID:7FD49E23-C8D7-4C4F-93A1-F7EACFA1EC53');
                        } else {
                            _pluginObj.setAttribute('type', 'application/webrtc-everywhere');
                        }
                        element.pluginObj = _pluginObj;

                        _pluginObj.setAttribute('className', element.className);
                        _pluginObj.setAttribute('innerHTML', element.innerHTML);
                        var width = element.getAttribute('width');
                        var height = element.getAttribute('height');
                        var bounds = element.getBoundingClientRect();
                        if (!width) width = bounds.right - bounds.left;
                        if (!height) height = bounds.bottom - bounds.top;

                        if ('getComputedStyle' in window) {
                            var computedStyle = window.getComputedStyle(element, null);
                            if (!width && computedStyle.width != 'auto' && computedStyle.width != '0px') {
                                width = computedStyle.width;
                            }
                            if (!height && computedStyle.height != 'auto' && computedStyle.height != '0px') {
                                height = computedStyle.height;
                            }
                        }
                        if (width) _pluginObj.setAttribute('width', width);
                        else _pluginObj.setAttribute('autowidth', true);

                        if (height) _pluginObj.setAttribute('height', height);
                        else _pluginObj.setAttribute('autoheight', true);

                        (document.body || document.documentElement).appendChild(_pluginObj);
                        if (element.parentNode) {
                            element.parentNode.replaceChild(_pluginObj, element); // replace (and remove) element

                            document.body.appendChild(element);
                            element.style.visibility = 'hidden';
                        }
                    }

                    if (element.pluginObj) {
                        element.pluginObj.bindEventListener('play', function(objvid) {
                            if (element.pluginObj) {
                                if (element.pluginObj.getAttribute('autowidth') && objvid.videoWidth) {
                                    element.pluginObj.setAttribute('width', objvid.videoWidth /* + "px"*/ );
                                }
                                if (element.pluginObj.getAttribute('autoheight') && objvid.videoHeight) {
                                    element.pluginObj.setAttribute('height', objvid.videoHeight /* + "px"*/ );
                                }
                            }
                        });
                        element.pluginObj.src = stream;
                    }

                    return element.pluginObj;
                } else if (element.nodeName.toLowerCase() === 'audio') {
                    return element;
                }
            };

            window.PluginRTC.MediaStreamTrack = {};
            var getSourcesDelayed;
            window.PluginRTC.MediaStreamTrack.getSources = function(gotSources) {
                if (document.readyState !== 'complete') {
                    if (!getSourcesDelayed) {
                        getSourcesDelayed = true;
                        attachEventListener(document, 'readystatechange', function() {
                            if (getSourcesDelayed && document.readyState == "complete") {
                                getSourcesDelayed = false;
                                getPlugin().getSources(gotSources);
                            }
                        });
                    }
                } else {
                    getPlugin().getSources(gotSources);
                }
            };

            window.PluginRTC.RTCPeerConnection = function(configuration, constraints) {
                return getPlugin().createPeerConnection(configuration, constraints);
            };

            window.PluginRTC.RTCIceCandidate = function(RTCIceCandidateInit) {
                return getPlugin().createIceCandidate(RTCIceCandidateInit);
            };

            window.PluginRTC.RTCSessionDescription = function(RTCSessionDescriptionInit) {
                return getPlugin().createSessionDescription(RTCSessionDescriptionInit);
            };

            if (window.onPluginRTCInitialized) {
                window.onPluginRTCInitialized(window.PluginRTC);
            }
        }

        window.addEventListener('load', LoadPluginRTC, false);
    })();

    // RTCPeerConnection.js

    var defaults = {};

    function setSdpConstraints(config) {
        var sdpConstraints;

        var sdpConstraints_mandatory = {
            OfferToReceiveAudio: !!config.OfferToReceiveAudio,
            OfferToReceiveVideo: !!config.OfferToReceiveVideo
        };

        sdpConstraints = {
            mandatory: sdpConstraints_mandatory,
            optional: [{
                VoiceActivityDetection: false
            }]
        };

        if (!!navigator.mozGetUserMedia && firefoxVersion > 34) {
            sdpConstraints = {
                OfferToReceiveAudio: !!config.OfferToReceiveAudio,
                OfferToReceiveVideo: !!config.OfferToReceiveVideo
            };
        }

        return sdpConstraints;
    }

    var RTCPeerConnection;
    if (typeof mozRTCPeerConnection !== 'undefined') {
        RTCPeerConnection = mozRTCPeerConnection;
    } else if (typeof webkitRTCPeerConnection !== 'undefined') {
        RTCPeerConnection = webkitRTCPeerConnection;
    } else if (typeof window.RTCPeerConnection !== 'undefined') {
        RTCPeerConnection = window.RTCPeerConnection;
    } else {
        console.error('WebRTC 1.0 (RTCPeerConnection) API are NOT available in this browser.');
        RTCPeerConnection = window.RTCSessionDescription = window.RTCIceCandidate = function() {};
    }

    var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
    var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
    var MediaStreamTrack = window.MediaStreamTrack;

    var Plugin = {};

    function onPluginRTCInitialized(pluginRTCObject) {
        Plugin = pluginRTCObject;
        MediaStreamTrack = Plugin.MediaStreamTrack;
        RTCPeerConnection = Plugin.RTCPeerConnection;
        RTCIceCandidate = Plugin.RTCIceCandidate;
        RTCSessionDescription = Plugin.RTCSessionDescription;
    }
    if (typeof PluginRTC !== 'undefined') onPluginRTCInitialized(PluginRTC);

    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    var isIE = !!document.documentMode;
    var isPluginRTC = isSafari || isIE;

    function PeerInitiator(config) {
        this.extra = config.remoteSdp ? config.remoteSdp.extra : config.rtcMultiConnection.extra;
        this.remoteUserId = config.remoteUserId;
        this.streams = [];
        this.channels = [];
        this.connectionDescription = config.connectionDescription;

        var that = this;

        if (config.remoteSdp) {
            this.connectionDescription = config.remoteSdp.connectionDescription;
        }

        var allRemoteStreams = {};

        if (Object.observe) {
            var that = this;
            Object.observe(this.channels, function(changes) {
                changes.forEach(function(change) {
                    if (change.type === 'add') {
                        change.object[change.name].addEventListener('close', function() {
                            delete that.channels[that.channels.indexOf(change.object[change.name])];
                            that.channels = removeNullEntries(that.channels);
                        }, false);
                    }
                    if (change.type === 'remove' || change.type === 'delete') {
                        if (that.channels.indexOf(change.object[change.name]) !== -1) {
                            delete that.channels.indexOf(change.object[change.name]);
                        }
                    }

                    that.channels = removeNullEntries(that.channels);
                });
            });
        }

        defaults.sdpConstraints = setSdpConstraints({
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        });

        var peer;

        var renegotiatingPeer = !!config.renegotiatingPeer;
        if (config.remoteSdp) {
            renegotiatingPeer = !!config.remoteSdp.renegotiatingPeer;
        }

        var localStreams = [];
        config.localStreams.forEach(function(stream) {
            if (!!stream) localStreams.push(stream);
        });

        if (!renegotiatingPeer) {
            peer = new RTCPeerConnection(navigator.onLine ? {
                iceServers: config.iceServers,
                iceTransports: 'all'
            } : null, config.optionalArgument);
        } else {
            peer = config.peerRef;

            peer.getLocalStreams().forEach(function(stream) {
                localStreams.forEach(function(localStream, index) {
                    if (stream == localStream) {
                        delete localStreams[index];
                    }
                });

                config.removeStreams.forEach(function(streamToRemove, index) {
                    if (stream === streamToRemove) {
                        if (!!peer.removeStream) {
                            peer.removeStream(stream);
                        }

                        localStreams.forEach(function(localStream, index) {
                            if (streamToRemove == localStream) {
                                delete localStreams[index];
                            }
                        });
                    }
                });
            });
        }

        peer.onicecandidate = function(event) {
            if (!event.candidate) return;
            config.onLocalCandidate({
                candidate: event.candidate.candidate,
                sdpMid: event.candidate.sdpMid,
                sdpMLineIndex: event.candidate.sdpMLineIndex
            });
        };

        var isFirefoxOffered = !isFirefox;
        if (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.isFirefoxOffered) {
            isFirefoxOffered = true;
        }

        localStreams.forEach(function(localStream) {
            if (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.dontGetRemoteStream) {
                return;
            }

            if (config.dontAttachLocalStream) {
                return;
            }

            peer.addStream(localStream);
        });

        peer.oniceconnectionstatechange = peer.onsignalingstatechange = function() {
            config.onPeerStateChanged({
                iceConnectionState: peer.iceConnectionState,
                iceGatheringState: peer.iceGatheringState,
                signalingState: peer.signalingState,
                extra: that.extra,
                userid: that.remoteUserId
            });

            if (peer.iceConnectionState.search(/disconnected|closed|failed/gi) !== -1) {
                if (peer.firedOnce) return;
                peer.firedOnce = true;

                for (var id in allRemoteStreams) {
                    config.onRemoteStreamRemoved(allRemoteStreams[id]);
                }
                allRemoteStreams = {};

                if (that.connectionDescription && config.rtcMultiConnection.userid == that.connectionDescription.sender && !!config.rtcMultiConnection.autoReDialOnFailure) {
                    setTimeout(function() {
                        if (peer.iceConnectionState.search(/disconnected|closed|failed/gi) !== -1) {
                            config.rtcMultiConnection.rejoin(that.connectionDescription);
                            peer.firedOnce = false;
                        }
                    }, 5000);
                }
            }
        };

        var sdpConstraints = {
            OfferToReceiveAudio: !!localStreams.length,
            OfferToReceiveVideo: !!localStreams.length
        };

        if (config.localPeerSdpConstraints) sdpConstraints = config.localPeerSdpConstraints;

        defaults.sdpConstraints = setSdpConstraints(sdpConstraints);

        peer.onaddstream = function(event) {
            var streamsToShare = {};
            if (config.remoteSdp && config.remoteSdp.streamsToShare) {
                streamsToShare = config.remoteSdp.streamsToShare;
            } else if (config.streamsToShare) {
                streamsToShare = config.streamsToShare;
            }

            var streamToShare = streamsToShare[event.stream.id];
            if (streamToShare) {
                event.stream.isAudio = streamToShare.isAudio;
                event.stream.isVideo = streamToShare.isVideo;
                event.stream.isScreen = streamToShare.isScreen;
            }

            event.stream.streamid = event.stream.id;
            if (!event.stream.stop) {
                event.stream.stop = function() {
                    fireEvent(event.stream, 'ended', event);
                };
            }
            allRemoteStreams[event.stream.id] = event.stream;
            config.onRemoteStream(event.stream);
        };

        peer.onremovestream = function(event) {
            event.stream.streamid = event.stream.id;

            if (allRemoteStreams[event.stream.id]) {
                delete allRemoteStreams[event.stream.id];
            }

            config.onRemoteStreamRemoved(event.stream);
        };

        this.addRemoteCandidate = function(remoteCandidate) {
            peer.addIceCandidate(new RTCIceCandidate(remoteCandidate));
        };

        this.addRemoteSdp = function(remoteSdp) {
            peer.setRemoteDescription(new RTCSessionDescription(remoteSdp), function() {}, function(error) {
                if (!!config.rtcMultiConnection.enableLogs) {
                    console.error(JSON.stringify(error, null, '\t'));
                }

                if (!!config.rtcMultiConnection.autoReDialOnFailure) {
                    setTimeout(function() {
                        config.rtcMultiConnection.rejoin(that.connectionDescription);
                    }, 2000);
                }
            });
        };

        var isOfferer = true;

        if (config.remoteSdp) {
            isOfferer = false;
        }

        if (config.enableDataChannels === true) {
            createDataChannel();
        }

        if (config.remoteSdp) {
            if (config.remoteSdp.remotePeerSdpConstraints) {
                sdpConstraints = config.remoteSdp.remotePeerSdpConstraints;
            }
            defaults.sdpConstraints = setSdpConstraints(sdpConstraints);
            this.addRemoteSdp(config.remoteSdp);
        }

        function createDataChannel() {
            if (!isOfferer) {
                peer.ondatachannel = function(event) {
                    var channel = event.channel;
                    setChannelEvents(channel);
                };
                return;
            }

            var channel = peer.createDataChannel('RTCDataChannel', {});
            setChannelEvents(channel);
        }

        function setChannelEvents(channel) {
            // force ArrayBuffer in Firefox; which uses "Blob" by default.
            channel.binaryType = 'arraybuffer';

            channel.onmessage = function(event) {
                config.onDataChannelMessage(event.data);
            };

            channel.onopen = function() {
                config.onDataChannelOpened(channel);
            };

            channel.onerror = function(error) {
                config.onDataChannelError(error);
            };

            channel.onclose = function(event) {
                config.onDataChannelClosed(event);
            };

            channel.internalSend = channel.send;
            channel.send = function(data) {
                if (channel.readyState !== 'open') {
                    return;
                }

                channel.internalSend(data);
            };

            peer.channel = channel;
        }

        if (config.session.audio == 'two-way' || config.session.video == 'two-way' || config.session.screen == 'two-way') {
            defaults.sdpConstraints = setSdpConstraints({
                OfferToReceiveAudio: config.session.audio == 'two-way' || (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.OfferToReceiveAudio),
                OfferToReceiveVideo: config.session.video == 'two-way' || config.session.screen == 'two-way' || (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.OfferToReceiveAudio)
            });
        }

        var streamsToShare = {};
        peer.getLocalStreams().forEach(function(stream) {
            streamsToShare[stream.streamid] = {
                isAudio: !!stream.isAudio,
                isVideo: !!stream.isVideo,
                isScreen: !!stream.isScreen
            };
        });

        peer[isOfferer ? 'createOffer' : 'createAnswer'](function(localSdp) {
            localSdp.sdp = config.processSdp(localSdp.sdp);
            peer.setLocalDescription(localSdp);
            config.onLocalSdp({
                type: localSdp.type,
                sdp: localSdp.sdp,
                remotePeerSdpConstraints: config.remotePeerSdpConstraints || false,
                renegotiatingPeer: !!config.renegotiatingPeer || false,
                connectionDescription: that.connectionDescription,
                dontGetRemoteStream: !!config.dontGetRemoteStream,
                extra: config.rtcMultiConnection ? config.rtcMultiConnection.extra : {},
                streamsToShare: streamsToShare,
                isFirefoxOffered: isFirefox
            });
        }, function(error) {
            if (!!config.rtcMultiConnection.enableLogs) {
                console.error('sdp-error', error);
            }

            if (!!config.rtcMultiConnection.autoReDialOnFailure && !isFirefox && !isFirefoxOffered) {
                setTimeout(function() {
                    config.rtcMultiConnection.rejoin(that.connectionDescription);
                }, 2000);
            }
        }, defaults.sdpConstraints);

        peer.nativeClose = peer.close;
        peer.close = function() {
            if (peer && peer.iceConnectionState === 'connected') {
                peer.nativeClose();
                peer = null;
            }
        };

        this.peer = peer;
    }

    // OnIceCandidateHandler.js

    var OnIceCandidateHandler = (function() {
        function processCandidates(connection, icePair) {
            var candidate = icePair.candidate;

            var iceRestrictions = connection.candidates;
            var stun = iceRestrictions.stun;
            var turn = iceRestrictions.turn;

            if (!isNull(iceRestrictions.reflexive)) {
                stun = iceRestrictions.reflexive;
            }

            if (!isNull(iceRestrictions.relay)) {
                turn = iceRestrictions.relay;
            }

            if (!iceRestrictions.host && !!candidate.match(/typ host/g)) {
                return;
            }

            if (!turn && !!candidate.match(/typ relay/g)) {
                return;
            }

            if (!stun && !!candidate.match(/typ srflx/g)) {
                return;
            }

            var protocol = connection.iceProtocols;

            if (!protocol.udp && !!candidate.match(/ udp /g)) {
                return;
            }

            if (!protocol.tcp && !!candidate.match(/ tcp /g)) {
                return;
            }

            if (connection.enableLogs) {
                console.debug('Your candidate pairs:', candidate);
            }

            return {
                candidate: candidate,
                sdpMid: icePair.sdpMid,
                sdpMLineIndex: icePair.sdpMLineIndex
            };
        }

        return {
            processCandidates: processCandidates
        };
    })();

    // IceServersHandler.js
    // note: "urls" doesn't works in old-firefox.

    var iceFrame, loadedIceFrame;

    function loadIceFrame(callback, skip) {
        if (loadedIceFrame) return;
        if (!skip) return loadIceFrame(callback, true);

        loadedIceFrame = true;

        var iframe = document.createElement('iframe');
        iframe.onload = function() {
            iframe.isLoaded = true;

            listenEventHandler('message', iFrameLoaderCallback);

            function iFrameLoaderCallback(event) {
                if (!event.data || !event.data.iceServers) return;
                callback(event.data.iceServers);

                // this event listener is no more needed
                window.removeEventListener('message', iFrameLoaderCallback);
            }

            iframe.contentWindow.postMessage('get-ice-servers', '*');
        };
        iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
        iframe.style.display = 'none';
        (document.body || document.documentElement).appendChild(iframe);
    }

    if (typeof window.getExternalIceServers === 'undefined' || window.getExternalIceServers == true) {
        loadIceFrame(function(externalIceServers) {
            if (!externalIceServers || !externalIceServers.length) return;
            window.RMCExternalIceServers = externalIceServers;

            if (window.iceServersLoadCallback && typeof window.iceServersLoadCallback === 'function') {
                window.iceServersLoadCallback(externalIceServers);
            }
        });
    }

    var IceServersHandler = (function() {
        function getIceServers(connection) {
            var iceServers = [];

            // Firefox <= 37 doesn't understands "urls"

            iceServers.push({
                urls: 'stun:stun.l.google.com:19302'
            });

            iceServers.push({
                urls: 'stun:stun.anyfirewall.com:3478'
            });

            iceServers.push({
                urls: 'turn:turn.bistri.com:80',
                credential: 'homeo',
                username: 'homeo'
            });

            iceServers.push({
                urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
                credential: 'webrtc',
                username: 'webrtc'
            });

            if (window.RMCExternalIceServers) {
                iceServers = window.RMCExternalIceServers.concat(iceServers);
                connection.iceServers = iceServers;
            } else if (typeof window.getExternalIceServers === 'undefined' || window.getExternalIceServers == true) {
                window.iceServersLoadCallback = function() {
                    iceServers = window.RMCExternalIceServers.concat(iceServers);
                    connection.iceServers = iceServers;
                };
            } else {
                iceServers.push({
                    urls: 'turn:turn.anyfirewall.com:443?transport=udp',
                    credential: 'webrtc',
                    username: 'webrtc'
                });
            }

            return iceServers;
        }

        return {
            getIceServers: getIceServers
        };
    })();

    // BandwidthHandler.js

    var BandwidthHandler = (function() {
        function setBAS(sdp, bandwidth, isScreen) {
            if (!bandwidth) {
                return sdp;
            }

            if (typeof isFirefox !== 'undefined' && isFirefox) {
                return sdp;
            }

            if (isScreen) {
                if (!bandwidth.screen) {
                    console.warn('It seems that you are not using bandwidth for screen. Screen sharing is expected to fail.');
                } else if (bandwidth.screen < 300) {
                    console.warn('It seems that you are using wrong bandwidth value for screen. Screen sharing is expected to fail.');
                }
            }

            // if screen; must use at least 300kbs
            if (bandwidth.screen && isScreen) {
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
                sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + (isScreen ? bandwidth.screen : bandwidth.video) + '\r\n');
            }

            return sdp;
        }

        // Find the line in sdpLines that starts with |prefix|, and, if specified,
        // contains |substr| (case-insensitive search).
        function findLine(sdpLines, prefix, substr) {
            return findLineInRange(sdpLines, 0, -1, prefix, substr);
        }

        // Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
        // and, if specified, contains |substr| (case-insensitive search).
        function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
            var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
            for (var i = startLine; i < realEndLine; ++i) {
                if (sdpLines[i].indexOf(prefix) === 0) {
                    if (!substr ||
                        sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                        return i;
                    }
                }
            }
            return null;
        }

        // Gets the codec payload type from an a=rtpmap:X line.
        function getCodecPayloadType(sdpLine) {
            var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
            var result = sdpLine.match(pattern);
            return (result && result.length === 2) ? result[1] : null;
        }

        function setVideoBitrates(sdp, params) {
            params = params || {};
            var xgoogle_min_bitrate = params.min;
            var xgoogle_max_bitrate = params.max;

            var sdpLines = sdp.split('\r\n');

            // VP8
            var vp8Index = findLine(sdpLines, 'a=rtpmap', 'VP8/90000');
            var vp8Payload;
            if (vp8Index) {
                vp8Payload = getCodecPayloadType(sdpLines[vp8Index]);
            }

            if (!vp8Payload) {
                return sdp;
            }

            var rtxIndex = findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
            var rtxPayload;
            if (rtxIndex) {
                rtxPayload = getCodecPayloadType(sdpLines[rtxIndex]);
            }

            if (!rtxIndex) {
                return sdp;
            }

            var rtxFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString());
            if (rtxFmtpLineIndex !== null) {
                var appendrtxNext = '\r\n';
                appendrtxNext += 'a=fmtp:' + vp8Payload + ' x-google-min-bitrate=' + (xgoogle_min_bitrate || '228') + '; x-google-max-bitrate=' + (xgoogle_max_bitrate || '228');
                sdpLines[rtxFmtpLineIndex] = sdpLines[rtxFmtpLineIndex].concat(appendrtxNext);
                sdp = sdpLines.join('\r\n');
            }

            return sdp;
        }

        function setOpusAttributes(sdp, params) {
            params = params || {};

            var sdpLines = sdp.split('\r\n');

            // Opus
            var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000');
            var opusPayload;
            if (opusIndex) {
                opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
            }

            if (!opusPayload) {
                return sdp;
            }

            var opusFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
            if (opusFmtpLineIndex === null) {
                return sdp;
            }

            var appendOpusNext = '';
            appendOpusNext += '; stereo=' + (typeof params.stereo != 'undefined' ? params.stereo : '1');
            appendOpusNext += '; sprop-stereo=' + (typeof params['sprop-stereo'] != 'undefined' ? params['sprop-stereo'] : '1');

            if (typeof params.maxaveragebitrate != 'undefined') {
                appendOpusNext += '; maxaveragebitrate=' + (params.maxaveragebitrate || 128 * 1024 * 8);
            }

            if (typeof params.maxplaybackrate != 'undefined') {
                appendOpusNext += '; maxplaybackrate=' + (params.maxplaybackrate || 128 * 1024 * 8);
            }

            if (typeof params.cbr != 'undefined') {
                appendOpusNext += '; cbr=' + (typeof params.cbr != 'undefined' ? params.cbr : '1');
            }

            if (typeof params.useinbandfec != 'undefined') {
                appendOpusNext += '; useinbandfec=' + params.useinbandfec;
            }

            if (typeof params.usedtx != 'undefined') {
                appendOpusNext += '; usedtx=' + params.usedtx;
            }

            if (typeof params.maxptime != 'undefined') {
                appendOpusNext += '\r\na=maxptime:' + params.maxptime;
            }

            sdpLines[opusFmtpLineIndex] = sdpLines[opusFmtpLineIndex].concat(appendOpusNext);

            sdp = sdpLines.join('\r\n');
            return sdp;
        }

        return {
            setApplicationSpecificBandwidth: function(sdp, bandwidth, isScreen) {
                return setBAS(sdp, bandwidth, isScreen);
            },
            setVideoBitrates: function(sdp, params) {
                return setVideoBitrates(sdp, params);
            },
            setOpusAttributes: function(sdp, params) {
                return setOpusAttributes(sdp, params);
            }
        };
    })();

    // getUserMediaHandler.js

    function setStreamType(constraints, stream) {
        if (constraints.mandatory && constraints.mandatory.chromeMediaSource) {
            stream.isScreen = true;
        } else if (constraints.mozMediaSource || constraints.mediaSource) {
            stream.isScreen = true;
        } else if (constraints.video) {
            stream.isVideo = true;
        } else if (constraints.audio) {
            stream.isAudio = true;
        }
    }
    var currentUserMediaRequest = {
        streams: [],
        mutex: false,
        queueRequests: []
    };

    function getUserMediaHandler(options) {
        if (currentUserMediaRequest.mutex === true) {
            currentUserMediaRequest.queueRequests.push(options);
            return;
        }
        currentUserMediaRequest.mutex = true;

        // easy way to match 
        var idInstance = JSON.stringify(options.localMediaConstraints);

        function streaming(stream, returnBack) {
            setStreamType(options.localMediaConstraints, stream);
            options.onGettingLocalMedia(stream, returnBack);

            stream.addEventListener('ended', function() {
                delete currentUserMediaRequest.streams[idInstance];

                currentUserMediaRequest.mutex = false;
                if (currentUserMediaRequest.queueRequests.indexOf(options)) {
                    delete currentUserMediaRequest.queueRequests[currentUserMediaRequest.queueRequests.indexOf(options)];
                    currentUserMediaRequest.queueRequests = removeNullEntries(currentUserMediaRequest.queueRequests);
                }
            }, false);

            currentUserMediaRequest.streams[idInstance] = {
                stream: stream
            };
            currentUserMediaRequest.mutex = false;

            if (currentUserMediaRequest.queueRequests.length) {
                getUserMediaHandler(currentUserMediaRequest.queueRequests.shift());
            }
        }

        if (currentUserMediaRequest.streams[idInstance]) {
            streaming(currentUserMediaRequest.streams[idInstance].stream, true);
        } else {
            if (isPluginRTC) {
                var mediaElement = document.createElement('video');
                Plugin.getUserMedia({
                    audio: true,
                    video: true
                }, function(stream) {
                    stream.streamid = stream.id || getRandomString();
                    streaming(stream);
                }, function(error) {});

                return;
            }

            navigator.getMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            if (typeof DetectRTC !== 'undefined') {
                if (!DetectRTC.hasMicrophone) {
                    options.localMediaConstraints.audio = false;
                }

                if (!DetectRTC.hasWebcam) {
                    options.localMediaConstraints.video = false;
                }
            }

            navigator.getMedia(options.localMediaConstraints, function(stream) {
                stream.streamid = stream.id || getRandomString();
                streaming(stream);
            }, function(error) {
                options.onLocalMediaError(error, options.localMediaConstraints);
            });
        }
    }

    // StreamsHandler.js

    var StreamsHandler = (function() {
        function handleType(type) {
            if (!type) {
                return;
            }

            if (typeof type === 'string' || typeof type === 'undefined') {
                return type;
            }

            if (type.audio && type.video) {
                return null;
            }

            if (type.audio) {
                return 'audio';
            }

            if (type.video) {
                return 'video';
            }

            return;
        }

        function setHandlers(stream, syncAction, connection) {
            if (typeof syncAction == 'undefined' || syncAction == true) {
                stream.addEventListener('ended', function() {
                    StreamsHandler.onSyncNeeded(stream.streamid, 'ended');
                }, false);
            }

            stream.mute = function(type, isSyncAction) {
                type = handleType(type);

                if (typeof isSyncAction !== 'undefined') {
                    syncAction = isSyncAction;
                }

                if (typeof type == 'undefined' || type == 'audio') {
                    stream.getAudioTracks().forEach(function(track) {
                        track.enabled = false;
                        connection.streamEvents[stream.streamid].isAudioMuted = true;
                    });
                }

                if (typeof type == 'undefined' || type == 'video') {
                    stream.getVideoTracks().forEach(function(track) {
                        track.enabled = false;
                    });
                }

                if (typeof syncAction == 'undefined' || syncAction == true) {
                    StreamsHandler.onSyncNeeded(stream.streamid, 'mute', type);
                }

                connection.streamEvents[stream.streamid].muteType = type;

                fireEvent(stream, 'mute', type);
            };

            stream.unmute = function(type, isSyncAction) {
                type = handleType(type);

                if (typeof isSyncAction !== 'undefined') {
                    syncAction = isSyncAction;
                }

                graduallyIncreaseVolume();

                if (typeof type == 'undefined' || type == 'audio') {
                    stream.getAudioTracks().forEach(function(track) {
                        track.enabled = true;
                        connection.streamEvents[stream.streamid].isAudioMuted = false;
                    });
                }

                if (typeof type == 'undefined' || type == 'video') {
                    stream.getVideoTracks().forEach(function(track) {
                        track.enabled = true;
                    });

                    // make sure that video unmute doesn't affects audio
                    if (typeof type !== 'undefined' && type == 'video' && connection.streamEvents[stream.streamid].isAudioMuted) {
                        (function looper(times) {
                            if (!times) {
                                times = 0;
                            }

                            times++;

                            // check until five-seconds
                            if (times < 100 && connection.streamEvents[stream.streamid].isAudioMuted) {
                                stream.mute('audio');

                                setTimeout(function() {
                                    looper(times);
                                }, 50);
                            }
                        })();
                    }
                }

                if (typeof syncAction == 'undefined' || syncAction == true) {
                    StreamsHandler.onSyncNeeded(stream.streamid, 'unmute', type);
                }

                connection.streamEvents[stream.streamid].unmuteType = type;

                fireEvent(stream, 'unmute', type);
            };

            function graduallyIncreaseVolume() {
                if (!connection.streamEvents[stream.streamid].mediaElement) {
                    return;
                }

                var mediaElement = connection.streamEvents[stream.streamid].mediaElement;
                mediaElement.volume = 0;
                afterEach(200, 5, function() {
                    mediaElement.volume += .20;
                });
            }
        }

        function afterEach(setTimeoutInteval, numberOfTimes, callback, startedTimes) {
            startedTimes = (startedTimes || 0) + 1;
            if (startedTimes >= numberOfTimes) return;

            setTimeout(function() {
                callback();
                afterEach(setTimeoutInteval, numberOfTimes, callback, startedTimes);
            }, setTimeoutInteval);
        }

        return {
            setHandlers: setHandlers,
            onSyncNeeded: function(streamid, action, type) {}
        };
    })();

    // Last time updated at Monday, January 4th, 2016, 1:17:50 PM 

    // Latest file can be found here: https://cdn.webrtc-experiment.com/DetectRTC.js

    // Muaz Khan     - www.MuazKhan.com
    // MIT License   - www.WebRTC-Experiment.com/licence
    // Documentation - github.com/muaz-khan/DetectRTC
    // ____________
    // DetectRTC.js

    // DetectRTC.hasWebcam (has webcam device!)
    // DetectRTC.hasMicrophone (has microphone device!)
    // DetectRTC.hasSpeakers (has speakers!)

    (function() {

        'use strict';

        var navigator = window.navigator;

        if (typeof navigator !== 'undefined') {
            if (typeof navigator.webkitGetUserMedia !== 'undefined') {
                navigator.getUserMedia = navigator.webkitGetUserMedia;
            }

            if (typeof navigator.mozGetUserMedia !== 'undefined') {
                navigator.getUserMedia = navigator.mozGetUserMedia;
            }
        } else {
            navigator = {
                getUserMedia: function() {},
                userAgent: 'Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45'
            };
        }

        var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);
        var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);

        var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        var isFirefox = typeof window.InstallTrigger !== 'undefined';
        var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        var isChrome = !!window.chrome && !isOpera;
        var isIE = !!document.documentMode && !isEdge;

        // this one can also be used:
        // https://www.websocket.org/js/stuff.js (DetectBrowser.js)

        function getBrowserInfo() {
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;
            var browserName = navigator.appName;
            var fullVersion = '' + parseFloat(navigator.appVersion);
            var majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset, verOffset, ix;

            // In Opera, the true version is after 'Opera' or after 'Version'
            if (isOpera) {
                browserName = 'Opera';
                try {
                    fullVersion = navigator.userAgent.split('OPR/')[1].split(' ')[0];
                    majorVersion = fullVersion.split('.')[0];
                } catch (e) {
                    fullVersion = '0.0.0.0';
                    majorVersion = 0;
                }
            }
            // In MSIE, the true version is after 'MSIE' in userAgent
            else if (isIE) {
                verOffset = nAgt.indexOf('MSIE');
                browserName = 'IE';
                fullVersion = nAgt.substring(verOffset + 5);
            }
            // In Chrome, the true version is after 'Chrome' 
            else if (isChrome) {
                verOffset = nAgt.indexOf('Chrome');
                browserName = 'Chrome';
                fullVersion = nAgt.substring(verOffset + 7);
            }
            // In Safari, the true version is after 'Safari' or after 'Version' 
            else if (isSafari) {
                verOffset = nAgt.indexOf('Safari');
                browserName = 'Safari';
                fullVersion = nAgt.substring(verOffset + 7);

                if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                    fullVersion = nAgt.substring(verOffset + 8);
                }
            }
            // In Firefox, the true version is after 'Firefox' 
            else if (isFirefox) {
                verOffset = nAgt.indexOf('Firefox');
                browserName = 'Firefox';
                fullVersion = nAgt.substring(verOffset + 8);
            }

            // In most other browsers, 'name/version' is at the end of userAgent 
            else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                browserName = nAgt.substring(nameOffset, verOffset);
                fullVersion = nAgt.substring(verOffset + 1);

                if (browserName.toLowerCase() === browserName.toUpperCase()) {
                    browserName = navigator.appName;
                }
            }

            if (isEdge) {
                browserName = 'Edge';
                // fullVersion = navigator.userAgent.split('Edge/')[1];
                fullVersion = parseInt(navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)[2], 10).toString();
            }

            // trim the fullVersion string at semicolon/space if present
            if ((ix = fullVersion.indexOf(';')) !== -1) {
                fullVersion = fullVersion.substring(0, ix);
            }

            if ((ix = fullVersion.indexOf(' ')) !== -1) {
                fullVersion = fullVersion.substring(0, ix);
            }

            majorVersion = parseInt('' + fullVersion, 10);

            if (isNaN(majorVersion)) {
                fullVersion = '' + parseFloat(navigator.appVersion);
                majorVersion = parseInt(navigator.appVersion, 10);
            }

            return {
                fullVersion: fullVersion,
                version: majorVersion,
                name: browserName,
                isPrivateBrowsing: false
            };
        }

        // via: https://gist.github.com/cou929/7973956

        function retry(isDone, next) {
            var currentTrial = 0,
                maxRetry = 50,
                interval = 10,
                isTimeout = false;
            var id = window.setInterval(
                function() {
                    if (isDone()) {
                        window.clearInterval(id);
                        next(isTimeout);
                    }
                    if (currentTrial++ > maxRetry) {
                        window.clearInterval(id);
                        isTimeout = true;
                        next(isTimeout);
                    }
                },
                10
            );
        }

        function isIE10OrLater(userAgent) {
            var ua = userAgent.toLowerCase();
            if (ua.indexOf('msie') === 0 && ua.indexOf('trident') === 0) {
                return false;
            }
            var match = /(?:msie|rv:)\s?([\d\.]+)/.exec(ua);
            if (match && parseInt(match[1], 10) >= 10) {
                return true;
            }
            return false;
        }

        function detectPrivateMode(callback) {
            var isPrivate;

            if (window.webkitRequestFileSystem) {
                window.webkitRequestFileSystem(
                    window.TEMPORARY, 1,
                    function() {
                        isPrivate = false;
                    },
                    function(e) {
                        console.log(e);
                        isPrivate = true;
                    }
                );
            } else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
                var db;
                try {
                    db = window.indexedDB.open('test');
                } catch (e) {
                    isPrivate = true;
                }

                if (typeof isPrivate === 'undefined') {
                    retry(
                        function isDone() {
                            return db.readyState === 'done' ? true : false;
                        },
                        function next(isTimeout) {
                            if (!isTimeout) {
                                isPrivate = db.result ? false : true;
                            }
                        }
                    );
                }
            } else if (isIE10OrLater(window.navigator.userAgent)) {
                isPrivate = false;
                try {
                    if (!window.indexedDB) {
                        isPrivate = true;
                    }
                } catch (e) {
                    isPrivate = true;
                }
            } else if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
                try {
                    window.localStorage.setItem('test', 1);
                } catch (e) {
                    isPrivate = true;
                }

                if (typeof isPrivate === 'undefined') {
                    isPrivate = false;
                    window.localStorage.removeItem('test');
                }
            }

            retry(
                function isDone() {
                    return typeof isPrivate !== 'undefined' ? true : false;
                },
                function next(isTimeout) {
                    callback(isPrivate);
                }
            );
        }

        var isMobile = {
            Android: function() {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: function() {
                return navigator.userAgent.match(/IEMobile/i);
            },
            any: function() {
                return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
            },
            getOsName: function() {
                var osName = 'Unknown OS';
                if (isMobile.Android()) {
                    osName = 'Android';
                }

                if (isMobile.BlackBerry()) {
                    osName = 'BlackBerry';
                }

                if (isMobile.iOS()) {
                    osName = 'iOS';
                }

                if (isMobile.Opera()) {
                    osName = 'Opera Mini';
                }

                if (isMobile.Windows()) {
                    osName = 'Windows';
                }

                return osName;
            }
        };

        // via: http://jsfiddle.net/ChristianL/AVyND/
        function detectDesktopOS() {
            var unknown = '-';

            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;

            var os = unknown;
            var clientStrings = [{
                s: 'Windows 10',
                r: /(Windows 10.0|Windows NT 10.0)/
            }, {
                s: 'Windows 8.1',
                r: /(Windows 8.1|Windows NT 6.3)/
            }, {
                s: 'Windows 8',
                r: /(Windows 8|Windows NT 6.2)/
            }, {
                s: 'Windows 7',
                r: /(Windows 7|Windows NT 6.1)/
            }, {
                s: 'Windows Vista',
                r: /Windows NT 6.0/
            }, {
                s: 'Windows Server 2003',
                r: /Windows NT 5.2/
            }, {
                s: 'Windows XP',
                r: /(Windows NT 5.1|Windows XP)/
            }, {
                s: 'Windows 2000',
                r: /(Windows NT 5.0|Windows 2000)/
            }, {
                s: 'Windows ME',
                r: /(Win 9x 4.90|Windows ME)/
            }, {
                s: 'Windows 98',
                r: /(Windows 98|Win98)/
            }, {
                s: 'Windows 95',
                r: /(Windows 95|Win95|Windows_95)/
            }, {
                s: 'Windows NT 4.0',
                r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/
            }, {
                s: 'Windows CE',
                r: /Windows CE/
            }, {
                s: 'Windows 3.11',
                r: /Win16/
            }, {
                s: 'Android',
                r: /Android/
            }, {
                s: 'Open BSD',
                r: /OpenBSD/
            }, {
                s: 'Sun OS',
                r: /SunOS/
            }, {
                s: 'Linux',
                r: /(Linux|X11)/
            }, {
                s: 'iOS',
                r: /(iPhone|iPad|iPod)/
            }, {
                s: 'Mac OS X',
                r: /Mac OS X/
            }, {
                s: 'Mac OS',
                r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/
            }, {
                s: 'QNX',
                r: /QNX/
            }, {
                s: 'UNIX',
                r: /UNIX/
            }, {
                s: 'BeOS',
                r: /BeOS/
            }, {
                s: 'OS/2',
                r: /OS\/2/
            }, {
                s: 'Search Bot',
                r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
            }];
            for (var id in clientStrings) {
                var cs = clientStrings[id];
                if (cs.r.test(nAgt)) {
                    os = cs.s;
                    break;
                }
            }

            var osVersion = unknown;

            if (/Windows/.test(os)) {
                osVersion = /Windows (.*)/.exec(os)[1];
                os = 'Windows';
            }

            switch (os) {
                case 'Mac OS X':
                    osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                    break;

                case 'Android':
                    osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                    break;

                case 'iOS':
                    osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                    osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                    break;
            }

            return {
                osName: os,
                osVersion: osVersion
            };
        }

        var osName = 'Unknown OS';
        var osVersion = 'Unknown OS Version';

        if (isMobile.any()) {
            osName = isMobile.getOsName();
        } else {
            var osInfo = detectDesktopOS();
            osName = osInfo.osName;
            osVersion = osInfo.osVersion;
        }

        var isCanvasSupportsStreamCapturing = false;
        var isVideoSupportsStreamCapturing = false;
        ['captureStream', 'mozCaptureStream', 'webkitCaptureStream'].forEach(function(item) {
            if (!isCanvasSupportsStreamCapturing && item in document.createElement('canvas')) {
                isCanvasSupportsStreamCapturing = true;
            }

            if (!isVideoSupportsStreamCapturing && item in document.createElement('video')) {
                isVideoSupportsStreamCapturing = true;
            }
        });

        // via: https://github.com/diafygi/webrtc-ips
        function DetectLocalIPAddress(callback) {
            if (!DetectRTC.isWebRTCSupported) {
                return;
            }

            if (DetectRTC.isORTCSupported) {
                return;
            }

            getIPs(function(ip) {
                //local IPs
                if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
                    callback('Local: ' + ip);
                }

                //assume the rest are public IPs
                else {
                    callback('Public: ' + ip);
                }
            });
        }

        //get the IP addresses associated with an account
        function getIPs(callback) {
            var ipDuplicates = {};

            //compatibility for firefox and chrome
            var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
            var useWebKit = !!window.webkitRTCPeerConnection;

            // bypass naive webrtc blocking using an iframe
            if (!RTCPeerConnection) {
                var iframe = document.getElementById('iframe');
                if (!iframe) {
                    //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
                    throw 'NOTE: you need to have an iframe in the page right above the script tag.';
                }
                var win = iframe.contentWindow;
                RTCPeerConnection = win.RTCPeerConnection || win.mozRTCPeerConnection || win.webkitRTCPeerConnection;
                useWebKit = !!win.webkitRTCPeerConnection;
            }

            // if still no RTCPeerConnection then it is not supported by the browser so just return
            if (!RTCPeerConnection) {
                return;
            }

            //minimal requirements for data connection
            var mediaConstraints = {
                optional: [{
                    RtpDataChannels: true
                }]
            };

            //firefox already has a default stun server in about:config
            //    media.peerconnection.default_iceservers =
            //    [{"url": "stun:stun.services.mozilla.com"}]
            var servers;

            //add same stun server for chrome
            if (useWebKit) {
                servers = {
                    iceServers: [{
                        urls: 'stun:stun.services.mozilla.com'
                    }]
                };

                if (typeof DetectRTC !== 'undefined' && DetectRTC.browser.isFirefox && DetectRTC.browser.version <= 38) {
                    servers[0] = {
                        url: servers[0].urls
                    };
                }
            }

            //construct a new RTCPeerConnection
            var pc = new RTCPeerConnection(servers, mediaConstraints);

            function handleCandidate(candidate) {
                //match just the IP address
                var ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                var match = ipRegex.exec(candidate);
                if (!match) {
                    console.warn('Could not match IP address in', candidate);
                    return;
                }
                var ipAddress = match[1];

                //remove duplicates
                if (ipDuplicates[ipAddress] === undefined) {
                    callback(ipAddress);
                }

                ipDuplicates[ipAddress] = true;
            }

            //listen for candidate events
            pc.onicecandidate = function(ice) {
                //skip non-candidate events
                if (ice.candidate) {
                    handleCandidate(ice.candidate.candidate);
                }
            };

            //create a bogus data channel
            pc.createDataChannel('');

            //create an offer sdp
            pc.createOffer(function(result) {

                //trigger the stun server request
                pc.setLocalDescription(result, function() {}, function() {});

            }, function() {});

            //wait for a while to let everything done
            setTimeout(function() {
                //read candidate info from local description
                var lines = pc.localDescription.sdp.split('\n');

                lines.forEach(function(line) {
                    if (line.indexOf('a=candidate:') === 0) {
                        handleCandidate(line);
                    }
                });
            }, 1000);
        }

        var MediaDevices = [];

        var audioInputDevices = [];
        var audioOutputDevices = [];
        var videoInputDevices = [];

        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            // Firefox 38+ seems having support of enumerateDevices
            // Thanks @xdumaine/enumerateDevices
            navigator.enumerateDevices = function(callback) {
                navigator.mediaDevices.enumerateDevices().then(callback);
            };
        }

        // ---------- Media Devices detection
        var canEnumerate = false;

        /*global MediaStreamTrack:true */
        if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
            canEnumerate = true;
        } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
            canEnumerate = true;
        }

        var hasMicrophone = false;
        var hasSpeakers = false;
        var hasWebcam = false;

        var isWebsiteHasMicrophonePermissions = false;
        var isWebsiteHasWebcamPermissions = false;

        // http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediadevices
        // todo: switch to enumerateDevices when landed in canary.
        function checkDeviceSupport(callback) {
            if (!canEnumerate) {
                return;
            }

            // This method is useful only for Chrome!

            if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
                navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
            }

            if (!navigator.enumerateDevices && navigator.enumerateDevices) {
                navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
            }

            if (!navigator.enumerateDevices) {
                if (callback) {
                    callback();
                }
                return;
            }

            MediaDevices = [];

            audioInputDevices = [];
            audioOutputDevices = [];
            videoInputDevices = [];

            navigator.enumerateDevices(function(devices) {
                devices.forEach(function(_device) {
                    var device = {};
                    for (var d in _device) {
                        device[d] = _device[d];
                    }

                    // if it is MediaStreamTrack.getSources
                    if (device.kind === 'audio') {
                        device.kind = 'audioinput';
                    }

                    if (device.kind === 'video') {
                        device.kind = 'videoinput';
                    }

                    var skip;
                    MediaDevices.forEach(function(d) {
                        if (d.id === device.id && d.kind === device.kind) {
                            skip = true;
                        }
                    });

                    if (skip) {
                        return;
                    }

                    if (!device.deviceId) {
                        device.deviceId = device.id;
                    }

                    if (!device.id) {
                        device.id = device.deviceId;
                    }

                    if (!device.label) {
                        device.label = 'Please invoke getUserMedia once.';
                        if (location.protocol !== 'https:') {
                            device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
                        }
                    } else {
                        if (device.kind === 'videoinput' && !isWebsiteHasWebcamPermissions) {
                            isWebsiteHasWebcamPermissions = true;
                        }

                        if (device.kind === 'audioinput' && !isWebsiteHasMicrophonePermissions) {
                            isWebsiteHasMicrophonePermissions = true;
                        }
                    }

                    if (device.kind === 'audioinput') {
                        hasMicrophone = true;

                        if (audioInputDevices.indexOf(device) === -1) {
                            audioInputDevices.push(device);
                        }
                    }

                    if (device.kind === 'audiooutput') {
                        hasSpeakers = true;

                        if (audioOutputDevices.indexOf(device) === -1) {
                            audioOutputDevices.push(device);
                        }
                    }

                    if (device.kind === 'videoinput') {
                        hasWebcam = true;

                        if (videoInputDevices.indexOf(device) === -1) {
                            videoInputDevices.push(device);
                        }
                    }

                    // there is no 'videoouput' in the spec.

                    if (MediaDevices.indexOf(device) === -1) {
                        MediaDevices.push(device);
                    }
                });

                if (typeof DetectRTC !== 'undefined') {
                    // to sync latest outputs
                    DetectRTC.MediaDevices = MediaDevices;
                    DetectRTC.hasMicrophone = hasMicrophone;
                    DetectRTC.hasSpeakers = hasSpeakers;
                    DetectRTC.hasWebcam = hasWebcam;

                    DetectRTC.isWebsiteHasWebcamPermissions = isWebsiteHasWebcamPermissions;
                    DetectRTC.isWebsiteHasMicrophonePermissions = isWebsiteHasMicrophonePermissions;

                    DetectRTC.audioInputDevices = audioInputDevices;
                    DetectRTC.audioOutputDevices = audioOutputDevices;
                    DetectRTC.videoInputDevices = videoInputDevices;
                }

                if (callback) {
                    callback();
                }
            });
        }

        // check for microphone/camera support!
        checkDeviceSupport();

        var DetectRTC = window.DetectRTC || {};

        // ----------
        // DetectRTC.browser.name || DetectRTC.browser.version || DetectRTC.browser.fullVersion
        DetectRTC.browser = getBrowserInfo();

        detectPrivateMode(function(isPrivateBrowsing) {
            DetectRTC.browser.isPrivateBrowsing = !!isPrivateBrowsing;
        });

        // DetectRTC.isChrome || DetectRTC.isFirefox || DetectRTC.isEdge
        DetectRTC.browser['is' + DetectRTC.browser.name] = true;

        var isNodeWebkit = !!(window.process && (typeof window.process === 'object') && window.process.versions && window.process.versions['node-webkit']);

        // --------- Detect if system supports WebRTC 1.0 or WebRTC 1.1.
        var isWebRTCSupported = false;
        ['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection', 'RTCIceGatherer'].forEach(function(item) {
            if (isWebRTCSupported) {
                return;
            }

            if (item in window) {
                isWebRTCSupported = true;
            }
        });
        DetectRTC.isWebRTCSupported = isWebRTCSupported;

        //-------
        DetectRTC.isORTCSupported = typeof RTCIceGatherer !== 'undefined';

        // --------- Detect if system supports screen capturing API
        var isScreenCapturingSupported = false;
        if (DetectRTC.browser.isChrome && DetectRTC.browser.version >= 35) {
            isScreenCapturingSupported = true;
        } else if (DetectRTC.browser.isFirefox && DetectRTC.browser.version >= 34) {
            isScreenCapturingSupported = true;
        }

        if (location.protocol !== 'https:') {
            isScreenCapturingSupported = false;
        }
        DetectRTC.isScreenCapturingSupported = isScreenCapturingSupported;

        // --------- Detect if WebAudio API are supported
        var webAudio = {
            isSupported: false,
            isCreateMediaStreamSourceSupported: false
        };

        ['AudioContext', 'webkitAudioContext', 'mozAudioContext', 'msAudioContext'].forEach(function(item) {
            if (webAudio.isSupported) {
                return;
            }

            if (item in window) {
                webAudio.isSupported = true;

                if ('createMediaStreamSource' in window[item].prototype) {
                    webAudio.isCreateMediaStreamSourceSupported = true;
                }
            }
        });
        DetectRTC.isAudioContextSupported = webAudio.isSupported;
        DetectRTC.isCreateMediaStreamSourceSupported = webAudio.isCreateMediaStreamSourceSupported;

        // ---------- Detect if SCTP/RTP channels are supported.

        var isRtpDataChannelsSupported = false;
        if (DetectRTC.browser.isChrome && DetectRTC.browser.version > 31) {
            isRtpDataChannelsSupported = true;
        }
        DetectRTC.isRtpDataChannelsSupported = isRtpDataChannelsSupported;

        var isSCTPSupportd = false;
        if (DetectRTC.browser.isFirefox && DetectRTC.browser.version > 28) {
            isSCTPSupportd = true;
        } else if (DetectRTC.browser.isChrome && DetectRTC.browser.version > 25) {
            isSCTPSupportd = true;
        } else if (DetectRTC.browser.isOpera && DetectRTC.browser.version >= 11) {
            isSCTPSupportd = true;
        }
        DetectRTC.isSctpDataChannelsSupported = isSCTPSupportd;

        // ---------

        DetectRTC.isMobileDevice = isMobileDevice; // "isMobileDevice" boolean is defined in "getBrowserInfo.js"

        // ------
        var isGetUserMediaSupported = false;
        if (navigator.getUserMedia) {
            isGetUserMediaSupported = true;
        } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            isGetUserMediaSupported = true;
        }
        if (DetectRTC.browser.isChrome && DetectRTC.browser.version >= 46 && location.protocol !== 'https:') {
            DetectRTC.isGetUserMediaSupported = 'Requires HTTPs';
        }
        DetectRTC.isGetUserMediaSupported = isGetUserMediaSupported;

        // -----------
        DetectRTC.osName = osName;
        DetectRTC.osVersion = osVersion;

        var displayResolution = '';
        if (screen.width) {
            var width = (screen.width) ? screen.width : '';
            var height = (screen.height) ? screen.height : '';
            displayResolution += '' + width + ' x ' + height;
        }
        DetectRTC.displayResolution = displayResolution;

        // ----------
        DetectRTC.isCanvasSupportsStreamCapturing = isCanvasSupportsStreamCapturing;
        DetectRTC.isVideoSupportsStreamCapturing = isVideoSupportsStreamCapturing;

        // ------
        DetectRTC.DetectLocalIPAddress = DetectLocalIPAddress;

        DetectRTC.isWebSocketsSupported = 'WebSocket' in window && 2 === window.WebSocket.CLOSING;
        DetectRTC.isWebSocketsBlocked = !DetectRTC.isWebSocketsSupported;

        DetectRTC.checkWebSocketsSupport = function(callback) {
            callback = callback || function() {};
            try {
                var websocket = new WebSocket('wss://echo.websocket.org:443/');
                websocket.onopen = function() {
                    DetectRTC.isWebSocketsBlocked = false;
                    callback();
                    websocket.close();
                    websocket = null;
                };
                websocket.onerror = function() {
                    DetectRTC.isWebSocketsBlocked = true;
                    callback();
                };
            } catch (e) {
                DetectRTC.isWebSocketsBlocked = true;
                callback();
            }
        };

        // -------
        DetectRTC.load = function(callback) {
            callback = callback || function() {};
            checkDeviceSupport(callback);
        };

        DetectRTC.MediaDevices = MediaDevices;
        DetectRTC.hasMicrophone = hasMicrophone;
        DetectRTC.hasSpeakers = hasSpeakers;
        DetectRTC.hasWebcam = hasWebcam;

        DetectRTC.isWebsiteHasWebcamPermissions = isWebsiteHasWebcamPermissions;
        DetectRTC.isWebsiteHasMicrophonePermissions = isWebsiteHasMicrophonePermissions;

        DetectRTC.audioInputDevices = audioInputDevices;
        DetectRTC.audioOutputDevices = audioOutputDevices;
        DetectRTC.videoInputDevices = videoInputDevices;

        // ------
        var isSetSinkIdSupported = false;
        if ('setSinkId' in document.createElement('video')) {
            isSetSinkIdSupported = true;
        }
        DetectRTC.isSetSinkIdSupported = isSetSinkIdSupported;

        // -----
        var isRTPSenderReplaceTracksSupported = false;
        if (DetectRTC.browser.isFirefox /*&& DetectRTC.browser.version > 39*/ ) {
            /*global mozRTCPeerConnection:true */
            if ('getSenders' in mozRTCPeerConnection.prototype) {
                isRTPSenderReplaceTracksSupported = true;
            }
        } else if (DetectRTC.browser.isChrome) {
            /*global webkitRTCPeerConnection:true */
            if ('getSenders' in webkitRTCPeerConnection.prototype) {
                isRTPSenderReplaceTracksSupported = true;
            }
        }
        DetectRTC.isRTPSenderReplaceTracksSupported = isRTPSenderReplaceTracksSupported;

        //------
        var isRemoteStreamProcessingSupported = false;
        if (DetectRTC.browser.isFirefox && DetectRTC.browser.version > 38) {
            isRemoteStreamProcessingSupported = true;
        }
        DetectRTC.isRemoteStreamProcessingSupported = isRemoteStreamProcessingSupported;

        //-------
        var isApplyConstraintsSupported = false;

        /*global MediaStreamTrack:true */
        if (typeof MediaStreamTrack !== 'undefined' && 'applyConstraints' in MediaStreamTrack.prototype) {
            isApplyConstraintsSupported = true;
        }
        DetectRTC.isApplyConstraintsSupported = isApplyConstraintsSupported;

        //-------
        var isMultiMonitorScreenCapturingSupported = false;
        if (DetectRTC.browser.isFirefox && DetectRTC.browser.version >= 43) {
            // version 43 merely supports platforms for multi-monitors
            // version 44 will support exact multi-monitor selection i.e. you can select any monitor for screen capturing.
            isMultiMonitorScreenCapturingSupported = true;
        }
        DetectRTC.isMultiMonitorScreenCapturingSupported = isMultiMonitorScreenCapturingSupported;

        window.DetectRTC = DetectRTC;

    })();

    // Last time updated at Oct 24, 2015, 08:32:23

    // Latest file can be found here: https://cdn.webrtc-experiment.com/getScreenId.js

    // Muaz Khan         - www.MuazKhan.com
    // MIT License       - www.WebRTC-Experiment.com/licence
    // Documentation     - https://github.com/muaz-khan/getScreenId.

    // ______________
    // getScreenId.js

    /*
    getScreenId(function (error, sourceId, screen_constraints) {
        // error    == null || 'permission-denied' || 'not-installed' || 'installed-disabled' || 'not-chrome'
        // sourceId == null || 'string' || 'firefox'
        
        if(sourceId == 'firefox') {
            navigator.mozGetUserMedia(screen_constraints, onSuccess, onFailure);
        }
        else navigator.webkitGetUserMedia(screen_constraints, onSuccess, onFailure);
    });
    */

    (function() {
        window.getScreenId = function(callback) {
            // for Firefox:
            // sourceId == 'firefox'
            // screen_constraints = {...}
            if (!!navigator.mozGetUserMedia) {
                callback(null, 'firefox', {
                    video: {
                        mozMediaSource: 'window',
                        mediaSource: 'window'
                    }
                });
                return;
            }

            postMessage();

            window.addEventListener('message', onIFrameCallback);

            function onIFrameCallback(event) {
                if (!event.data) return;

                if (event.data.chromeMediaSourceId) {
                    if (event.data.chromeMediaSourceId === 'PermissionDeniedError') {
                        callback('permission-denied');
                    } else callback(null, event.data.chromeMediaSourceId, getScreenConstraints(null, event.data.chromeMediaSourceId));
                }

                if (event.data.chromeExtensionStatus) {
                    callback(event.data.chromeExtensionStatus, null, getScreenConstraints(event.data.chromeExtensionStatus));
                }

                // this event listener is no more needed
                window.removeEventListener('message', onIFrameCallback);
            }
        };

        function getScreenConstraints(error, sourceId) {
            var screen_constraints = {
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: error ? 'screen' : 'desktop',
                        maxWidth: window.screen.width > 1920 ? window.screen.width : 1920,
                        maxHeight: window.screen.height > 1080 ? window.screen.height : 1080
                    },
                    optional: []
                }
            };

            if (sourceId) {
                screen_constraints.video.mandatory.chromeMediaSourceId = sourceId;
            }

            return screen_constraints;
        }

        function postMessage() {
            if (!iframe) {
                loadIFrame(postMessage);
                return;
            }

            if (!iframe.isLoaded) {
                setTimeout(postMessage, 100);
                return;
            }

            iframe.contentWindow.postMessage({
                captureSourceId: true
            }, '*');
        }

        function loadIFrame(loadCallback) {
            if (iframe) {
                loadCallback();
                return;
            }

            iframe = document.createElement('iframe');
            iframe.onload = function() {
                iframe.isLoaded = true;

                loadCallback();
            };
            iframe.src = 'https://www.webrtc-experiment.com/getSourceId/'; // https://wwww.yourdomain.com/getScreenId.html
            iframe.style.display = 'none';
            (document.body || document.documentElement).appendChild(iframe);
        }

        var iframe;

        // this function is used in v3.0
        window.getScreenConstraints = function(callback) {
            loadIFrame(function() {
                getScreenId(function(error, sourceId, screen_constraints) {
                    callback(error, screen_constraints.video);
                });
            });
        };
    })();

    (function() {
        if (document.domain.indexOf('webrtc-experiment.com') === -1) {
            return;
        }

        window.getScreenId = function(callback) {
            // for Firefox:
            // sourceId == 'firefox'
            // screen_constraints = {...}
            if (!!navigator.mozGetUserMedia) {
                callback(null, 'firefox', {
                    video: {
                        mozMediaSource: 'window',
                        mediaSource: 'window'
                    }
                });
                return;
            }

            postMessage();

            window.addEventListener('message', onIFrameCallback);

            function onIFrameCallback(event) {
                if (!event.data) return;

                if (event.data.chromeMediaSourceId) {
                    if (event.data.chromeMediaSourceId === 'PermissionDeniedError') {
                        callback('permission-denied');
                    } else callback(null, event.data.chromeMediaSourceId, getScreenConstraints(null, event.data.chromeMediaSourceId));
                }

                if (event.data.chromeExtensionStatus) {
                    callback(event.data.chromeExtensionStatus, null, getScreenConstraints(event.data.chromeExtensionStatus));
                }

                // this event listener is no more needed
                window.removeEventListener('message', onIFrameCallback);
            }
        };

        function getScreenConstraints(error, sourceId) {
            var screen_constraints = {
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: error ? 'screen' : 'desktop',
                        maxWidth: window.screen.width > 1920 ? window.screen.width : 1920,
                        maxHeight: window.screen.height > 1080 ? window.screen.height : 1080
                    },
                    optional: []
                }
            };

            if (sourceId) {
                screen_constraints.video.mandatory.chromeMediaSourceId = sourceId;
            }

            return screen_constraints;
        }

        function postMessage() {
            if (!iframe) {
                loadIFrame(postMessage);
                return;
            }

            if (!iframe.isLoaded) {
                setTimeout(postMessage, 100);
                return;
            }

            iframe.contentWindow.postMessage({
                captureSourceId: true
            }, '*');
        }

        function loadIFrame(loadCallback) {
            if (iframe) {
                loadCallback();
                return;
            }

            iframe = document.createElement('iframe');
            iframe.onload = function() {
                iframe.isLoaded = true;

                loadCallback();
            };
            iframe.src = 'https://www.webrtc-experiment.com/getSourceId/'; // https://wwww.yourdomain.com/getScreenId.html
            iframe.style.display = 'none';
            (document.body || document.documentElement).appendChild(iframe);
        }

        var iframe;

        // this function is used in v3.0
        window.getScreenConstraints = function(callback) {
            loadIFrame(function() {
                getScreenId(function(error, sourceId, screen_constraints) {
                    callback(error, screen_constraints.video);
                });
            });
        };
    })();

    // TextReceiver.js & TextSender.js

    function TextReceiver(connection) {
        var content = {};

        function receive(data, userid, extra) {
            // uuid is used to uniquely identify sending instance
            var uuid = data.uuid;
            if (!content[uuid]) {
                content[uuid] = [];
            }

            content[uuid].push(data.message);

            if (data.last) {
                var message = content[uuid].join('');
                if (data.isobject) {
                    message = JSON.parse(message);
                }

                // latency detection
                var receivingTime = new Date().getTime();
                var latency = receivingTime - data.sendingTime;

                var e = {
                    data: message,
                    userid: userid,
                    extra: extra,
                    latency: latency
                };

                if (connection.autoTranslateText) {
                    e.original = e.data;
                    connection.Translator.TranslateText(e.data, function(translatedText) {
                        e.data = translatedText;
                        connection.onmessage(e);
                    });
                } else {
                    connection.onmessage(e);
                }

                delete content[uuid];
            }
        }

        return {
            receive: receive
        };
    }

    // TextSender.js
    var TextSender = {
        send: function(config) {
            var connection = config.connection;

            var channel = config.channel,
                remoteUserId = config.remoteUserId,
                initialText = config.text,
                packetSize = connection.chunkSize || 1000,
                textToTransfer = '',
                isobject = false;

            if (!isString(initialText)) {
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

                if (text.length > packetSize) {
                    data.message = text.slice(0, packetSize);
                } else {
                    data.message = text;
                    data.last = true;
                    data.isobject = isobject;
                }

                channel.send(data, remoteUserId);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length) {
                    setTimeout(function() {
                        sendText(null, textToTransfer);
                    }, connection.chunkInterval || 100);
                }
            }
        }
    };

    // FileProgressBarHandler.js

    var FileProgressBarHandler = (function() {
        function handle(connection) {
            var progressHelper = {};

            // www.RTCMultiConnection.org/docs/onFileStart/
            connection.onFileStart = function(file) {
                var div = document.createElement('div');
                div.title = file.name;
                div.innerHTML = '<label>0%</label> <progress></progress>';

                if (file.remoteUserId) {
                    div.innerHTML += ' (Sharing with:' + file.remoteUserId + ')';
                }

                if (!connection.filesContainer) {
                    connection.filesContainer = document.body || document.documentElement;
                }

                connection.filesContainer.insertBefore(div, connection.filesContainer.firstChild);

                if (!file.remoteUserId) {
                    progressHelper[file.uuid] = {
                        div: div,
                        progress: div.querySelector('progress'),
                        label: div.querySelector('label')
                    };
                    progressHelper[file.uuid].progress.max = file.maxChunks;
                    return;
                }

                if (!progressHelper[file.uuid]) {
                    progressHelper[file.uuid] = {};
                }

                progressHelper[file.uuid][file.remoteUserId] = {
                    div: div,
                    progress: div.querySelector('progress'),
                    label: div.querySelector('label')
                };
                progressHelper[file.uuid][file.remoteUserId].progress.max = file.maxChunks;
            };

            // www.RTCMultiConnection.org/docs/onFileProgress/
            connection.onFileProgress = function(chunk) {
                var helper = progressHelper[chunk.uuid];
                if (!helper) {
                    return;
                }
                if (chunk.remoteUserId) {
                    helper = progressHelper[chunk.uuid][chunk.remoteUserId];
                    if (!helper) {
                        return;
                    }
                }

                helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
                updateLabel(helper.progress, helper.label);
            };

            // www.RTCMultiConnection.org/docs/onFileEnd/
            connection.onFileEnd = function(file) {
                var helper = progressHelper[file.uuid];
                if (!helper) {
                    console.error('No such progress-helper element exists.', file);
                    return;
                }

                if (file.remoteUserId) {
                    helper = progressHelper[file.uuid][file.remoteUserId];
                    if (!helper) {
                        return;
                    }
                }

                var div = helper.div;
                if (file.type.indexOf('image') != -1) {
                    div.innerHTML = '<a href="' + file.url + '" download="' + file.name + '">Download <strong style="color:red;">' + file.name + '</strong> </a><br /><img src="' + file.url + '" title="' + file.name + '" style="max-width: 80%;">';
                } else {
                    div.innerHTML = '<a href="' + file.url + '" download="' + file.name + '">Download <strong style="color:red;">' + file.name + '</strong> </a><br /><iframe src="' + file.url + '" title="' + file.name + '" style="width: 80%;border: 0;height: inherit;margin-top:1em;"></iframe>';
                }
            };

            function updateLabel(progress, label) {
                if (progress.position === -1) {
                    return;
                }

                var position = +progress.position.toFixed(2).split('.')[1] || 100;
                label.innerHTML = position + '%';
            }
        }

        return {
            handle: handle
        };
    })();

    // TranslationHandler.js

    var TranslationHandler = (function() {
        function handle(connection) {
            connection.autoTranslateText = false;
            connection.language = 'en';
            connection.googKey = 'AIzaSyCgB5hmFY74WYB-EoWkhr9cAGr6TiTHrEE';

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

                        if (response.error && response.error.message === 'Daily Limit Exceeded') {
                            warn('Text translation failed. Error message: "Daily Limit Exceeded."');

                            // returning original text
                            callback(text);
                        }
                    };

                    var source = 'https://www.googleapis.com/language/translate/v2?key=' + connection.googKey + '&target=' + (connection.language || 'en-US') + '&callback=window.' + randomNumber + '&q=' + sourceText;
                    newScript.src = source;
                    document.getElementsByTagName('head')[0].appendChild(newScript);
                }
            };
        }

        return {
            handle: handle
        };
    })();

    window.RTCMultiConnection = RTCMultiConnection;
})();
