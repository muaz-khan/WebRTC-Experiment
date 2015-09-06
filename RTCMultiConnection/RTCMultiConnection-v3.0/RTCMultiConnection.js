// Last time updated at Sep 06, 2015, 08:32:23

// ______________________________
// RTCMultiConnection-v3.0 (Beta)

'use strict';

(function() {

    // Renegotiation now works in FF 38 and 39 (and multiple streams as well)
    // Firefox is supporting navigator.mediaDevices.getMediaDevices as well.
    // Firefox is supporting canvas.captureStream as well. Though still can't be used as input source for RTCPeerConnection.

    // RTCMultiConnection.js

    function RTCMultiConnection(roomid) {
        var connection = this;

        connection.sessionid = roomid || location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('');

        var mPeer = new MultiPeers(connection);

        mPeer.onGettingLocalMedia = function(stream) {
            getMediaElement(stream, function(mediaElement) {
                mediaElement.id = stream.streamid;
                mediaElement.muted = true;
                mediaElement.volume = 0;

                stream.mediaElement = mediaElement;
                connection.attachStreams.push(stream);

                if (typeof StreamsHandler !== 'undefined') {
                    StreamsHandler.setHandlers(stream);
                }

                connection.streamEvents[stream.streamid] = {
                    stream: stream,
                    type: 'local',
                    mediaElement: mediaElement,
                    userid: connection.userid,
                    extra: connection.extra,
                    streamid: stream.streamid,
                    blobURL: mediaElement.src || URL.createObjectURL(stream)
                };

                setHarkEvents(connection, connection.streamEvents[stream.streamid]);
                setMuteHandlers(connection, connection.streamEvents[stream.streamid]);

                connection.onstream(connection.streamEvents[stream.streamid]);
            });
        };

        mPeer.onGettingRemoteMedia = function(stream, remoteUserId) {
            getMediaElement(stream, function(mediaElement) {
                mediaElement.id = stream.streamid;
                stream.mediaElement = mediaElement;

                if (typeof StreamsHandler !== 'undefined') {
                    StreamsHandler.setHandlers(stream, false);
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
                    mediaElement: stream.mediaElement
                };
            }

            connection.onstreamended(streamEvent);

            delete connection.streamEvents[stream.streamid];
        };

        mPeer.onNegotiationNeeded = function(message, remoteUserId, callback) {
            socket.emit(connection.socketMessageEvent, 'password' in message ? message : {
                remoteUserId: message.remoteUserId || remoteUserId,
                message: message,
                sender: connection.userid
            }, callback || function() {});
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
        mPeer.disconnectWith = function(remoteUserId) {
            socket.emit('disconnect-with', remoteUserId);

            if (connection.peers[remoteUserId]) {
                delete connection.peers[remoteUserId];
            }
        };

        connection.broadcasters = [];

        var socket;

        function connectSocket(connectCallback) {
            if (socket) { // todo: check here readySate/etc. to make sure socket is still opened
                if (connectCallback) connectCallback(socket);
                return;
            }

            socket = io.connect((connection.socketURL || '/') + '?userid=' + connection.userid + '&msgEvent=' + connection.socketMessageEvent);

            socket.on('extra-data-updated', function(remoteUserId, extra) {
                if (!connection.peers[remoteUserId]) return;
                connection.peers[remoteUserId].extra = extra;
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

                if (message.message.readyForOffer) {
                    connection.addNewBroadcaster(message.sender);
                }

                if (message.message.newParticipationRequest) {
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
                    onUserLeft(message.sender);

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

                // todo: ???
                connection.onleave({
                    userid: userid
                });
            });

            socket.on('connect', function() {
                console.info('socket.io connection is opened.');
                socket.emit('extra-data-updated', connection.extra);
                if (connectCallback) connectCallback(socket);
            });

            socket.on('disconnect', function() {
                socket = null;
                connectSocket();
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
        }

        connection.openOrJoin = function(localUserid, password) {
            connectSocket(function() {
                mPeer.onNegotiationNeeded({
                    detectPresence: true,
                    userid: localUserid || connection.sessionid
                }, 'system', function(isRoomExists, roomid) {
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

                    socket.emit('change-userid', {
                        oldUserId: oldUserId,
                        newUserId: connection.userid
                    });

                    if (password) {
                        socket.emit('set-password', password);
                    }

                    connection.isInitiator = true;

                    if (isData(connection.session)) {
                        return;
                    }

                    connection.captureUserMedia();
                });
            });
        };

        connection.open = function(localUserid, isPublicUser) {
            var oldUserId = connection.userid;
            connection.userid = connection.sessionid = localUserid || connection.sessionid;

            connection.isInitiator = true;

            connectSocket(function() {
                socket.emit('change-userid', {
                    oldUserId: oldUserId,
                    newUserId: connection.userid
                });

                if (typeof isPublicUser == 'undefined' || isPublicUser == true) {
                    socket.emit('become-a-public-user');
                }
            });

            if (isData(connection.session)) {
                return;
            }

            connection.captureUserMedia();
        };

        connection.rejoin = function(connectionDescription) {
            if (!connectionDescription) {
                connectionDescription = {
                    remoteUserId: connection.sessionid,
                    message: {
                        newParticipationRequest: true,
                        isOneWay: typeof connection.session.oneway != 'undefined' ? connection.session.oneway : connection.direction == 'one-way',
                        isDataOnly: isData(connection.session),
                        localPeerSdpConstraints: connection.mediaConstraints,
                        remotePeerSdpConstraints: connection.mediaConstraints
                    },
                    sender: connection.userid,
                    password: false
                };
            }

            if (connection.peers[connectionDescription.remoteUserId]) {
                delete connection.peers[connectionDescription.remoteUserId];
            }

            mPeer.onNegotiationNeeded(connectionDescription);
        };

        connection.join = connection.connect = function(remoteUserId, options) {
            connection.sessionid = (remoteUserId ? remoteUserId.sessionid || remoteUserId.remoteUserId || remoteUserId : false) || connection.sessionid;

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

            if (isData(session)) {
                return;
            }

            if (session.audio || session.video || session.screen) {
                if (session.screen) {
                    getScreenConstraints(function(error, screen_constraints) {
                        if (error) {
                            throw error;
                        }

                        invokeGetUserMedia({
                            video: screen_constraints
                        }, session.audio || session.video ? invokeGetUserMedia : false);
                    });
                } else if (session.audio || session.video) {
                    invokeGetUserMedia();
                }
            }

            function invokeGetUserMedia(localMediaConstraints, getUserMedia_callback) {
                getUserMediaHandler({
                    onGettingLocalMedia: function(stream) {
                        mPeer.onGettingLocalMedia(stream);

                        if (getUserMedia_callback) {
                            return getUserMedia_callback();
                        }

                        if (callback) {
                            callback(stream);
                        }
                    },
                    onLocalMediaError: mPeer.onLocalMediaError,
                    localMediaConstraints: localMediaConstraints || {
                        audio: !!session.audio ? connection.mediaConstraints.audio : false,
                        video: !!session.video ? connection.mediaConstraints.video : false
                    }
                });
            }
        };

        function beforeUnload(shiftModerationControlOnLeave) {
            connection.peers.getAllParticipants().forEach(function(participant) {
                mPeer.onNegotiationNeeded({
                    userLeft: true,
                    autoCloseEntireSession: !!connection.autoCloseEntireSession
                }, participant);

                if (connection.peers[participant] && connection.peers[participant].peer) {
                    connection.peers[participant].peer.close();
                }
            });

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

        window.addEventListener('beforeunload', beforeUnload, false);

        connection.userid = getRandomString();
        connection.extra = {};
        if (Object.observe) {
            Object.observe(connection.extra, function(changes) {
                changes.forEach(function(change) {
                    socket.emit('extra-data-updated', connection.extra);
                });
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
                optional: [{
                    chromeRenderToAssociatedSink: true
                }]
            },
            video: {
                mandatory: {},
                optional: []
            }
        };

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

        connection.iceServers = IceServersHandler.getIceServers();

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
            console.info('Data connection has been opened between you & ', event.userid);
        };

        connection.onclose = function(event) {
            console.warn('Data connection has been closed between you & ', event.userid);
        };

        connection.onerror = function(error) {
            console.error(error.userid, 'data-error', error);
        };

        connection.onmessage = function(event) {
            console.debug('data-message', event.userid, event.data);
        };

        connection.send = function(data) {
            connection.peers.send(data);
        };

        connection.close = connection.disconnect = connection.leave = function() {
            beforeUnload(false);
        };

        connection.onstream = function(e) {
            var parentNode = (document.body || document.documentElement);
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
                        mPeer.onGettingLocalMedia(stream);

                        if (callback) {
                            return callback();
                        }

                        connection.renegotiate();
                    },
                    onLocalMediaError: mPeer.onLocalMediaError,
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

        if (Object.observe) {
            Object.observe(connection.attachStreams, function(changes) {
                changes.forEach(function(change) {
                    if (change.type === 'add') {
                        change.object[change.name].addEventListener('ended', function() {
                            delete connection.attachStreams[connection.attachStreams.indexOf(change.object[change.name])];

                            if (connection.removeStreams.indexOf(change.object[change.name]) === -1) {
                                connection.removeStreams.push(change.object[change.name]);
                            }

                            connection.attachStreams = removeNullEntries(connection.attachStreams);
                            connection.removeStreams = removeNullEntries(connection.removeStreams);

                            // connection.renegotiate();

                            var streamEvent = connection.streamEvents[change.object[change.name]];
                            if (!streamEvent) {
                                streamEvent = {
                                    stream: change.object[change.name],
                                    streamid: change.object[change.name].streamid,
                                    type: 'local',
                                    userid: connection.userid,
                                    extra: connection.extra,
                                    mediaElement: change.object[change.name].mediaElement
                                };
                            }
                            connection.onstreamended(streamEvent);

                            delete connection.streamEvents[change.object[change.name]];
                        }, false);
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
            console.error(error);
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

        connection.body = connection.filesContainer = document.body || document.documentElement;
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

        connection.shiftModerationControl = function(remoteUserId, existingBroadcasters, firedOnLeave, overrideSender) {
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

        connection.getPublicRooms = function(callback) {
            connectSocket(function() {
                mPeer.onNegotiationNeeded({
                    getPublicUsers: true
                }, 'system', callback);
            });
        };

        connection.onExtraDataUpdated = function(event) {};

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
                connectSocket();
            }

            return socket;
        };

        connection.getRemoteStreams = mPeer.getRemoteStreams;
        connection.autoReDialOnFailure = true;

        connection.streamEvents = {};
        connection.socketURL = '/';
        connection.socketMessageEvent = 'RTCMultiConnection-Message';
        connection.DetectRTC = DetectRTC;

        connection.onUserStatusChanged = function(event) {
            console.log(event.userid, event.status);
        };

        connection.getUserMediaHandler = getUserMediaHandler;
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
            send: function(data) {
                var that = this;

                if (!isNull(data.size) && !isNull(data.type)) {
                    self.shareFile(data);
                    return;
                }

                if (data.type !== 'text' && !(data instanceof ArrayBuffer) && !(data instanceof DataView)) {
                    TextSender.send({
                        text: data,
                        channel: this,
                        connection: connection
                    });
                    return;
                }

                if (data.type === 'text') {
                    data = JSON.stringify(data);
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

                    if (states.iceConnectionState.search(/disconnected|closed/gi) !== -1) {
                        console.error('Peer connection is closed between you & ', remoteUserId);
                    }

                    if (states.iceConnectionState.search(/disconnected|closed|failed/gi) !== -1) {
                        self.onUserLeft(remoteUserId);
                        self.disconnectWith(remoteUserId);
                    }
                },
                processSdp: connection.processSdp
            };
        };

        this.createNewPeer = function(remoteUserId, userPreferences) {
            userPreferences = userPreferences || {};

            if (!userPreferences.isOneWay && !userPreferences.isDataOnly) {
                userPreferences.isOneWay = true;
                this.onNegotiationNeeded({
                    enableMedia: true,
                    userPreferences: userPreferences
                }, remoteUserId);
                return;
            }

            var localConfig = this.getLocalConfig(null, remoteUserId, userPreferences);
            connection.peers[remoteUserId] = new PeerInitiator(localConfig);
        };

        this.createAnsweringPeer = function(remoteSdp, remoteUserId, userPreferences) {
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

        this.onNegotiationNeeded = function(message, remoteUserId) {};
        this.addNegotiatedMessage = function(message, remoteUserId) {
            if (message.type && message.sdp) {
                if (message.type == 'answer') {
                    connection.peers[remoteUserId].addRemoteSdp(message);
                }

                if (message.type == 'offer') {
                    if (message.renegotiatingPeer) {
                        this.renegotiatePeer(remoteUserId, null, message);
                    } else {
                        this.createAnsweringPeer(message, remoteUserId);
                    }
                }
                return;
            }

            if (message.candidate) {
                connection.peers[remoteUserId].addRemoteCandidate(message);
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
                    onLocalMediaError: this.onLocalMediaError,
                    localMediaConstraints: localMediaConstraints
                });
            }

            if (message.readyForOffer) {
                this.createNewPeer(remoteUserId, message.userPreferences);
            }
        };

        this.onGettingRemoteMedia = function(stream, remoteUserId) {};
        this.onRemovingRemoteMedia = function(stream, remoteUserId) {};
        this.onGettingLocalMedia = function(localStream) {};
        this.onLocalMediaError = function(error) {
            console.error('onLocalMediaError', error);
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

        this.shareFile = function(file) {
            if (!connection.enableFileSharing) {
                throw '"connection.enableFileSharing" is false.';
            }

            initFileBufferReader();

            fbr.readAsArrayBuffer(file, function(uuid) {
                fbr.setMultipleUsers(uuid, connection.getAllParticipants());

                connection.getAllParticipants().forEach(function(participant) {
                    fbr.getNextChunk(uuid, function(nextChunk, isLastChunk) {
                        connection.peers[participant].channels.forEach(function(channel) {
                            channel.send(nextChunk);
                        });
                    }, participant);
                });
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

        this.onPeerStateChanged = function(states) {};
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
            streamEvent.session = {
                audio: event.type === 'audio' || event.type === 'both' || event.type === null,
                video: event.type === 'video' || event.type === 'both' || event.ype === null
            };
            if (connection.onmute) {
                connection.onmute(streamEvent);
            }
        }, false);

        streamEvent.stream.addEventListener('unmute', function(event) {
            streamEvent.session = {
                audio: event.type === 'audio' || event.type === 'both' || event.type === null,
                video: event.type === 'video' || event.type === 'both' || event.type === null
            };
            if (connection.onunmute) {
                connection.onunmute(streamEvent);
            }
        }, false);

        connection.onmute = function(e) {
            if (e.stream.isVideo && e.mediaElement) {
                e.mediaElement.pause();
                e.mediaElement.setAttribute('poster', e.snapshot || 'https://cdn.webrtc-experiment.com/images/muted.png');
            }
            if (e.stream.isAudio && e.mediaElement) {
                e.mediaElement.muted = true;
            }
        };

        connection.onunmute = function(e) {
            if (e.stream.isVideo && e.mediaElement) {
                e.mediaElement.play();
                e.mediaElement.removeAttribute('poster');
            }
            if (e.stream.isAudio && e.mediaElement) {
                e.mediaElement.muted = false;
            }
        };
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

    function getMediaElement(stream, callback) {
        var isAudioOnly = false;
        if (!stream.getVideoTracks().length) {
            isAudioOnly = true;
        }

        var mediaElement = document.createElement(isAudioOnly ? 'audio' : 'video');

        if (isPluginRTC) {
            (document.body || document.documentElement).insertBefore(mediaElement, body.firstChild);

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
                stream.onended();
            }, false);
        }

        mediaElement.play();
        callback(mediaElement);
    }

    var loadedIceFrame;

    function loadIceFrame(callback, skip) {
        if (loadedIceFrame) {
            return;
        }
        if (!skip) {
            return loadIceFrame(callback, true);
        }

        loadedIceFrame = true;

        var iframe = document.createElement('iframe');
        iframe.onload = function() {
            iframe.isLoaded = true;

            listenEventHandler('message', iFrameLoaderCallback);

            function iFrameLoaderCallback(event) {
                if (!event.data || !event.data.iceServers) {
                    return;
                }
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

    var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
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
            peer = new RTCPeerConnection({
                iceServers: config.iceServers,
                iceTransports: 'all'
            }, config.optionalArgument);
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

        localStreams.forEach(function(localStream) {
            if (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.dontGetRemoteStream) {
                return;
            }

            // dontAttachLocalStream
            if (config.dontAttachLocalStream) {
                return;
            }

            peer.addStream(localStream);
        });

        peer.oniceconnectionstatechange = peer.onsignalingstatechange = function() {
            config.onPeerStateChanged({
                iceConnectionState: peer.iceConnectionState,
                iceGatheringState: peer.iceGatheringState,
                signalingState: peer.signalingState
            });

            if (peer.iceConnectionState.search(/disconnected|closed/gi) !== -1) {
                if (peer.firedOnce) return;
                peer.firedOnce = true;

                for (var id in allRemoteStreams) {
                    config.onRemoteStreamRemoved(allRemoteStreams[id]);
                }
                allRemoteStreams = {};

                if (that.connectionDescription && config.rtcMultiConnection.userid == that.connectionDescription.sender && !!config.rtcMultiConnection.autoReDialOnFailure) {
                    setTimeout(function() {
                        config.rtcMultiConnection.rejoin(that.connectionDescription);
                    }, 2000);
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
                console.error(JSON.stringify(error, null, '\t'));
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
                streamsToShare: streamsToShare
            });
        }, function(error) {
            console.error('sdp-error', error);
        }, defaults.sdpConstraints);

        peer.nativeClose = peer.close;
        peer.close = function() {
            if (peer && peer.signalingState !== 'closed') {
                peer.nativeClose();
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

    var IceServersHandler = (function(connection) {
        function getIceServers(iceServers) {
            iceServers = iceServers || [];

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
            return iceServers;
        }

        return {
            getIceServers: getIceServers
        };
    })();

    // BandwidthHandler.js

    var BandwidthHandler = (function() {
        function setBAS(sdp, bandwidth, isScreen) {
            if (isMobileDevice || isFirefox || !bandwidth) {
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
                if (!stream.stop) {
                    stream.stop = function() {
                        fireEvent(stream, 'ended');
                    };
                }
                streaming(stream);
            }, function(error) {
                options.onLocalMediaError(error, options.localMediaConstraints);
            });
        }
    }

    // StreamsHandler.js

    var StreamsHandler = (function() {
        function handleType(type) {
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

            return undefined;
        }

        function setHandlers(stream, syncAction) {
            stream.mute = function(type) {
                type = handleType(type);

                if (typeof type == 'undefined' || type == 'audio') {
                    stream.getAudioTracks().forEach(function(track) {
                        track.enabled = false;
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

                fireEvent(stream, 'mute', type);
            };

            stream.unmute = function(type) {
                type = handleType(type);

                graduallyIncreaseVolume();

                if (typeof type == 'undefined' || type == 'audio') {
                    stream.getAudioTracks().forEach(function(track) {
                        track.enabled = true;
                    });
                }

                if (typeof type == 'undefined' || type == 'video') {
                    stream.getVideoTracks().forEach(function(track) {
                        track.enabled = true;
                    });
                }

                if (typeof syncAction == 'undefined' || syncAction == true) {
                    StreamsHandler.onSyncNeeded(stream.streamid, 'unmute', type);
                }

                fireEvent(stream, 'unmute', type);
            };

            function graduallyIncreaseVolume() {
                var mediaElement = stream.mediaElement;
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

    // Last time updated at August 17, 2015, 08:32:23

    // Latest file can be found here: https://cdn.webrtc-experiment.com/DetectRTC.js

    // Muaz Khan     - www.MuazKhan.com
    // MIT License   - www.WebRTC-Experiment.com/licence
    // Documentation - github.com/muaz-khan/DetectRTC
    // ____________
    // DetectRTC.js

    // DetectRTC.hasWebcam (has webcam device!)
    // DetectRTC.hasMicrophone (has microphone device!)
    // DetectRTC.hasSpeakers (has speakers!)
    // DetectRTC.isScreenCapturingSupported
    // DetectRTC.isSctpDataChannelsSupported
    // DetectRTC.isRtpDataChannelsSupported
    // DetectRTC.isAudioContextSupported
    // DetectRTC.isWebRTCSupported
    // DetectRTC.isDesktopCapturingSupported
    // DetectRTC.isMobileDevice
    // DetectRTC.isWebSocketsSupported

    // DetectRTC.DetectLocalIPAddress(callback)

    // ----------todo: add
    // DetectRTC.videoResolutions
    // DetectRTC.screenResolutions

    (function() {
        'use strict';

        function warn(log) {
            if (window.console && typeof window.console.warn !== 'undefined') {
                console.warn(log);
            }
        }

        // detect node-webkit
        var browser = getBrowserInfo();

        // is this a chromium browser (opera or chrome)
        var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        var isFirefox = typeof InstallTrigger !== 'undefined';
        var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        var isChrome = !!window.chrome && !isOpera;
        var isIE = !!document.documentMode;

        var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);

        // detect node-webkit
        var isNodeWebkit = !!(window.process && (typeof window.process === 'object') && window.process.versions && window.process.versions['node-webkit']);

        var isHTTPs = location.protocol === 'https:';

        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            // Firefox 38+ seems having support of enumerateDevices
            // Thanks @xdumaine/enumerateDevices
            navigator.enumerateDevices = function(callback) {
                navigator.mediaDevices.enumerateDevices().then(callback);
            };
        }

        window.DetectRTC = {
            browser: browser,
            hasMicrophone: navigator.enumerateDevices ? false : 'unable to detect',
            hasSpeakers: navigator.enumerateDevices ? false : 'unable to detect',
            hasWebcam: navigator.enumerateDevices ? false : 'unable to detect',

            isWebRTCSupported: !!window.webkitRTCPeerConnection || !!window.mozRTCPeerConnection,
            isAudioContextSupported: (!!window.AudioContext && !!window.AudioContext.prototype.createMediaStreamSource) || (!!window.webkitAudioContext && !!window.webkitAudioContext.prototype.createMediaStreamSource),

            isScreenCapturingSupported: (isFirefox && browser.version >= 33) ||
                (isChrome && browser.version >= 26 && (isNodeWebkit ? true : location.protocol === 'https:')),

            isDesktopCapturingSupported: isHTTPs && ((isFirefox && browser.version >= 33) || (isChrome && browser.version >= 34) || isNodeWebkit || false),

            isSctpDataChannelsSupported: isFirefox || (isChrome && browser.version >= 25),
            isRtpDataChannelsSupported: isChrome && browser.version >= 31,
            isMobileDevice: !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i),
            isWebSocketsSupported: 'WebSocket' in window && 2 === window.WebSocket.CLOSING,
            isCanvasCaptureStreamSupported: false,
            isVideoCaptureStreamSupported: false
        };

        (function detectCanvasCaptureStream() {
            // latest Firefox nighly is supporting this "awesome" feature!
            var canvas = document.createElement('canvas');

            if (typeof canvas.captureStream === 'function') {
                DetectRTC.isCanvasCaptureStreamSupported = true;
            } else if (typeof canvas.mozCaptureStream === 'function') {
                DetectRTC.isCanvasCaptureStreamSupported = true;
            } else if (typeof canvas.webkitCaptureStream === 'function') {
                DetectRTC.isCanvasCaptureStreamSupported = true;
            }
        })();

        (function detectVideoCaptureStream() {
            var video = document.createElement('video');
            if (typeof video.captureStream === 'function') {
                DetectRTC.isVideoCaptureStreamSupported = true;
            } else if (typeof video.mozCaptureStream === 'function') {
                DetectRTC.isVideoCaptureStreamSupported = true;
            } else if (typeof video.webkitCaptureStream === 'function') {
                DetectRTC.isVideoCaptureStreamSupported = true;
            }
        })();

        if (!isHTTPs) {
            window.DetectRTC.isScreenCapturingSupported =
                window.DetectRTC.isDesktopCapturingSupported = 'Requires HTTPs.';
        }

        DetectRTC.browser = {
            isFirefox: isFirefox,
            isChrome: isChrome,
            isMobileDevice: isMobileDevice,
            isNodeWebkit: isNodeWebkit,
            isSafari: isSafari,
            isIE: isIE,
            isOpera: isOpera,
            name: browser.name,
            version: browser.version
        };

        var osName = 'Unknown OS';

        if (navigator.appVersion.indexOf('Win') !== -1) {
            osName = 'Windows';
        }

        if (navigator.appVersion.indexOf('Mac') !== -1) {
            osName = 'MacOS';
        }

        if (navigator.appVersion.indexOf('X11') !== -1) {
            osName = 'UNIX';
        }

        if (navigator.appVersion.indexOf('Linux') !== -1) {
            osName = 'Linux';
        }

        DetectRTC.osName = osName;

        DetectRTC.MediaDevices = [];

        if (!navigator.enumerateDevices) {
            warn('navigator.enumerateDevices API are not available.');
        }

        if (!navigator.enumerateDevices && (!window.MediaStreamTrack || !window.MediaStreamTrack.getSources)) {
            warn('MediaStreamTrack.getSources are not available.');
        }

        // http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediadevices
        // todo: switch to enumerateDevices when landed in canary.
        function CheckDeviceSupport(callback) {
            // This method is useful only for Chrome!

            if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
                navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
            }

            if (!navigator.enumerateDevices && navigator.enumerateDevices) {
                navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
            }

            if (!navigator.enumerateDevices) {
                warn('navigator.enumerateDevices is undefined.');
                // assuming that it is older chrome or chromium implementation
                if (isChrome) {
                    DetectRTC.hasMicrophone = true;
                    DetectRTC.hasSpeakers = true;
                    DetectRTC.hasWebcam = true;
                }

                if (callback) {
                    callback();
                }
                return;
            }

            DetectRTC.MediaDevices = [];
            navigator.enumerateDevices(function(devices) {
                devices.forEach(function(_device) {
                    var device = {};
                    for (var d in _device) {
                        device[d] = _device[d];
                    }

                    var skip;
                    DetectRTC.MediaDevices.forEach(function(d) {
                        if (d.id === device.id) {
                            skip = true;
                        }
                    });

                    if (skip) {
                        return;
                    }

                    // if it is MediaStreamTrack.getSources
                    if (device.kind === 'audio') {
                        device.kind = 'audioinput';
                    }

                    if (device.kind === 'video') {
                        device.kind = 'videoinput';
                    }

                    if (!device.deviceId) {
                        device.deviceId = device.id;
                    }

                    if (!device.id) {
                        device.id = device.deviceId;
                    }

                    if (!device.label) {
                        device.label = 'Please invoke getUserMedia once.';
                    }

                    if (device.kind === 'audioinput' || device.kind === 'audio') {
                        DetectRTC.hasMicrophone = true;
                    }

                    if (device.kind === 'audiooutput') {
                        DetectRTC.hasSpeakers = true;
                    }

                    if (device.kind === 'videoinput' || device.kind === 'video') {
                        DetectRTC.hasWebcam = true;
                    }

                    // there is no 'videoouput' in the spec.

                    DetectRTC.MediaDevices.push(device);
                });

                if (callback) {
                    callback();
                }
            });
        }

        // check for microphone/camera support!
        new CheckDeviceSupport();
        DetectRTC.load = CheckDeviceSupport;

        function getBrowserInfo() {
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;
            var browserName = navigator.appName;
            var fullVersion = '' + parseFloat(navigator.appVersion);
            var majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset, verOffset, ix;

            // In Opera, the true version is after 'Opera' or after 'Version'
            if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
                browserName = 'Opera';
                fullVersion = nAgt.substring(verOffset + 6);

                if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                    fullVersion = nAgt.substring(verOffset + 8);
                }
            }
            // In MSIE, the true version is after 'MSIE' in userAgent
            else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
                browserName = 'IE';
                fullVersion = nAgt.substring(verOffset + 5);
            }
            // In Chrome, the true version is after 'Chrome' 
            else if ((verOffset = nAgt.indexOf('Chrome')) !== -1) {
                browserName = 'Chrome';
                fullVersion = nAgt.substring(verOffset + 7);
            }
            // In Safari, the true version is after 'Safari' or after 'Version' 
            else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
                browserName = 'Safari';
                fullVersion = nAgt.substring(verOffset + 7);

                if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                    fullVersion = nAgt.substring(verOffset + 8);
                }
            }
            // In Firefox, the true version is after 'Firefox' 
            else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
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
                name: browserName
            };
        }

        // via: https://github.com/diafygi/webrtc-ips
        DetectRTC.DetectLocalIPAddress = function(callback) {
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
        };

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
            }

            //construct a new RTCPeerConnection
            var pc = new RTCPeerConnection(servers, mediaConstraints);

            function handleCandidate(candidate) {
                //match just the IP address
                var ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                var ipAddress = ipRegex.exec(candidate)[1];

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
    })();

    // Last time updated at June 02, 2015, 08:32:23

    // Latest file can be found here: https://cdn.webrtc-experiment.com/getScreenId.js

    // Muaz Khan         - www.MuazKhan.com
    // MIT License       - www.WebRTC-Experiment.com/licence
    // Documentation     - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/getScreenId.js

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
            if (!iframe.isLoaded) {
                setTimeout(postMessage, 100);
                return;
            }

            iframe.contentWindow.postMessage({
                captureSourceId: true
            }, '*');
        }

        var iframe;

        // this function is used in v3.0
        window.getScreenConstraints = function(callback) {
            iframe = document.createElement('iframe');
            iframe.onload = function() {
                iframe.isLoaded = true;

                getScreenId(function(error, sourceId, screen_constraints) {
                    callback(error, screen_constraints.video);
                });
            };
            iframe.src = 'https://www.webrtc-experiment.com/getSourceId/';
            iframe.style.display = 'none';
            (document.body || document.documentElement).appendChild(iframe);
        };
    })();

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
                _channel = config._channel,
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

                channel.send(data, _channel);

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

                // for backward compatibility
                if (connection.onFileSent || connection.onFileReceived) {
                    if (connection.onFileSent) {
                        connection.onFileSent(file, file.uuid);
                    }

                    if (connection.onFileReceived) {
                        connection.onFileReceived(file.name, file);
                    }
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
