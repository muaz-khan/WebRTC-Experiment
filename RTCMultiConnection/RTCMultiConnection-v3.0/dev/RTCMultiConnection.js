// RTCMultiConnection.js

function RTCMultiConnection(roomid) {
    var connection = this;

    connection.channel = connection.sessionid = (roomid || location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('')) + '';

    var mPeer = new MultiPeers(connection);

    mPeer.onGettingLocalMedia = function(stream) {
        getMediaElement(stream, function(mediaElement) {
            mediaElement.id = stream.streamid;
            mediaElement.muted = true;
            mediaElement.volume = 0;

            stream.mediaElement = mediaElement;
            connection.attachStreams.push(stream);

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
        connectSocket(function() {
            mPeer.onNegotiationNeeded({
                detectPresence: true,
                userid: (localUserid || connection.sessionid) + ''
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
                connection.userid = connection.userid + '';

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
        });
    };

    connection.open = function(localUserid, isPublicUser) {
        var oldUserId = connection.userid;
        connection.userid = connection.sessionid = localUserid || connection.sessionid;
        connection.userid = connection.userid + '';

        connection.isInitiator = true;

        connectSocket(function() {
            socket.emit('changed-uuid', connection.userid);

            if (typeof isPublicUser == 'undefined' || isPublicUser == true) {
                socket.emit('become-a-public-user');
            }
        });

        if (isData(connection.session)) {
            if (typeof isPublicUser === 'function') {
                isPublicUser();
            }
            return;
        }

        connection.captureUserMedia(typeof isPublicUser === 'function' ? isPublicUser : null);
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

    function applyConstraints(stream, mediaConstraints) {
        if (!stream) {
            console.error('No stream to applyConstraints.');
            return;
        }

        if (mediaConstraints.audio) {
            stream.getAudioTracks().forEach(function(track) {
                track.applyConstraints(mediaConstraints.audio);
            });
            console.log('Applied audio constraints', mediaConstraints.audio);
        }

        if (mediaConstraints.video) {
            stream.getVideoTracks().forEach(function(track) {
                track.applyConstraints(mediaConstraints.video);
            });
            console.log('Applied video constraints', mediaConstraints.video);
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

    function replaceTrack(track, remoteUserId) {
        if (remoteUserId) {
            mPeer.replaceTrack(track, remoteUserId);
            return;
        }

        connection.peers.getAllParticipants().forEach(function(participant) {
            mPeer.replaceTrack(track, participant);
        });
    }

    connection.replaceTrack = function(session) {
        session = session || {};

        if (!RTCPeerConnection.prototype.getSenders) {
            this.addStream(session);
            return;
        }

        if (session instanceof MediaStreamTrack) {
            replaceTrack(session);
            return;
        }

        if (session instanceof MediaStream) {
            replaceTrack(session.getVideoTracks()[0]);
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

                    connection.replaceTrack(stream);
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
    connection.socketURL = '/';
    connection.socketMessageEvent = 'RTCMultiConnection-Message';
    connection.DetectRTC = DetectRTC;

    connection.onUserStatusChanged = function(event) {
        console.log(event.userid, event.status);
    };

    connection.getUserMediaHandler = getUserMediaHandler;
    connection.multiPeersHandler = mPeer;
    connection.enableLogs = false;
    connection.setCustomSocketHandler = function(customSocketHandler) {
        if (typeof SocketConnection !== 'undefined') {
            SocketConnection = customSocketHandler;
        }
    };

    // default value is 15k because Firefox's receiving limit is 16k!
    // however 64k works chrome-to-chrome
    connection.chunkSize = 15 * 1000;
}
