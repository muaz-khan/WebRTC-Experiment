// Renegotiation now works in FF 38 and 39 (and multiple streams as well)
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
            
            if (window.StreamsHandler) {
                StreamsHandler.setHandlers(stream);
            }

            connection.onstream({
                stream: stream,
                type: 'local',
                mediaElement: mediaElement,
                userid: connection.userid,
                extra: connection.extra,
                streamid: stream.streamid
            });
        });
    };

    mPeer.onGettingRemoteMedia = function(stream, remoteUserId) {
        getMediaElement(stream, function(mediaElement) {
            mediaElement.id = stream.streamid;
            stream.mediaElement = mediaElement;
            
            if (window.StreamsHandler) {
                StreamsHandler.setHandlers(stream, false);
            }
            connection.onstream({
                stream: stream,
                type: 'remote',
                userid: remoteUserId,
                extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {},
                mediaElement: mediaElement,
                streamid: stream.streamid
            });
        });
    };

    mPeer.onRemovingRemoteMedia = function(stream, remoteUserId) {
        connection.onstreamended({
            stream: stream,
            type: 'remote',
            userid: remoteUserId,
            extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {},
            streamid: stream.streamid,
            mediaElement: stream.mediaElement
        });
    };

    mPeer.onNegotiationNeeded = function(message, remoteUserId) {
        socket.emit('message', {
            remoteUserId: remoteUserId,
            message: message,
            sender: connection.userid
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
    mPeer.disconnectWith = function(remoteUserId) {
        socket.emit('disconnect-with', remoteUserId);
        
        if(connection.peers[remoteUserId]) {
            delete connection.peers[remoteUserId];
        }
    };

    connection.broadcasters = [];

    var socket;

    function connectSocket(connectCallback) {
        if (socket) { // todo: check here readySate/etc. to make sure socket is still opened
            connectCallback();
            return;
        }

        socket = io.connect('/?userid=' + connection.userid);

        socket.on('extra-data-updated', function(remoteUserId, extra) {
            if (!connection.peers[remoteUserId]) return;
            connection.peers[remoteUserId].extra = extra;
        });

        socket.on('message', function(message) {
            if (message.remoteUserId != connection.userid) return;

            if (connection.peers[message.sender] && connection.peers[message.sender].extra != message.extra) {
                connection.peers[message.sender].extra = message.extra;
                connection.onExtraDataUpdated({
                    userid: message.sender,
                    extr: message.extra
                });
            }

            if (message.message.streamSyncNeeded && connection.peers[message.sender]) {
                var remoteStreams = connection.peers[message.sender].streams;
                var stream = remoteStreams.getStreamById(message.message.streamid);
                if (!!stream && !!stream[message.message.action]) {
                    stream[message.message.action](message.message.type != 'both' ? message.message.type : null);
                }
                return;
            }

            if (message.message === 'connectWithAllParticipants') {
                if (connection.broadcasters.indexOf(message.sender) === -1) {
                    connection.broadcasters.push(message.sender);
                }

                socket.emit('message', {
                    remoteUserId: message.sender,
                    message: {
                        allParticipants: connection.peers.getAllParticipants(message.sender)
                    },
                    sender: connection.userid
                });
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
                if(message.message.newParticipant == connection.userid) return;
                if (!!connection.peers[message.message.newParticipant]) return;
                connection.onNewParticipant(message.message.newParticipant, message.message.userPreferences);
                return;
            }

            if (message.message.readyForOffer) {
                connection.addNewBroadcaster(message.sender);
            }

            if (message.message.newParticipationRequest) {
                if (connection.peers[message.sender]) {
                    if(connection.peers[message.sender].peer) {
                        connection.peers[message.sender].peer.close();
                        connection.peers[message.sender].peer = null;
                    }
                    delete connection.peers[message.sender];
                }

                var userPreferences = {
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
                    connectionDescription: message
                };

                mPeer.createNewPeer(message.sender, userPreferences);

                // if its oneway----- todo: THIS SEEMS NOT IMPORTANT.
                if (typeof message.message.isOneWay !== 'undefined' ? message.message.isOneWay : !!connection.session.oneway || connection.direction === 'one-way') {
                    connection.addNewBroadcaster(message.sender, userPreferences);
                }

                if (!!connection.session.oneway || connection.direction === 'one-way' || isData(connection.session)) {
                    connection.addNewBroadcaster(message.sender, userPreferences);
                }
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
            connection.onleave(userid);
        });

        socket.on('connect', function() {
            console.info('socket.io connection is opened.');
            socket.emit('extra-data-updated', connection.extra);
            if (connectCallback) connectCallback();
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
            if(connection.peers[remoteUserId] && connection.peers[remoteUserId].peer) {
                connection.peers[remoteUserId].peer.close();
                delete connection.peers[remoteUserId];
            }
        });
    }

    connection.openOrJoin = function(localUserid, password) {
        connectSocket(function() {
            socket.emit('message', {
                remoteUserId: 'system',
                sender: connection.userid,
                message: {
                    detectPresence: true,
                    userid: localUserid || connection.sessionid
                }
            }, function(isRoomExists, roomid) {
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

                    socket.emit('message', connectionDescription);
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
        if(!connectionDescription) {
            connectionDescription = {
                remoteUserId: connection.sessionid,
                message: {
                    newParticipationRequest: true,
                    isOneWay: typeof connection.session.oneway != 'undefined' ? connection.session.oneway : connection.direction == 'one-way',
                    isDataOnly: isData(connection.session),
                    localPeerSdpConstraints: connection.mediaConstraints,
                    remotePeerSdpConstraints: connection.mediaConstraints
                },
                sender: connection.userid
            };
        }
        
        if(connection.peers[connectionDescription.remoteUserId]) {
            delete connection.peers[connectionDescription.remoteUserId];
        }
        
        socket.emit('message', connectionDescription);
    };

    connection.join = connection.connect = function(remoteUserId) {
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
            }

            localPeerSdpConstraints = {
                OfferToReceiveAudio: isOneWay ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                OfferToReceiveVideo: isOneWay ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
            }
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
            sender: connection.userid
        };

        connectSocket(function() {
            if (!!connection.peers[connection.sessionid]) {
                // on socket disconnect & reconnect
                return;
            }

            socket.emit('message', connectionDescription);
        });

        return connectionDescription;
    };

    connection.connectWithAllParticipants = function(remoteUserId) {
        socket.emit('message', {
            remoteUserId: remoteUserId || connection.sessionid,
            message: 'connectWithAllParticipants',
            sender: connection.userid
        });
    };

    connection.removeFromBroadcastersList = function(remoteUserId) {
        socket.emit('message', {
            remoteUserId: remoteUserId || connection.sessionid,
            message: 'removeFromBroadcastersList',
            sender: connection.userid
        });

        connection.peers.getAllParticipants(remoteUserId || connection.sessionid).forEach(function(participant) {
            socket.emit('message', {
                remoteUserId: participant,
                message: 'dropPeerConnection',
                sender: connection.userid
            });

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

        function invokeGetUserMedia(localMediaConstraints, getUserMedia_callback) {
            getUserMedia({
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
            socket.emit('message', {
                remoteUserId: participant,
                message: {
                    userLeft: true,
                    autoCloseEntireSession: !!connection.autoCloseEntireSession
                },
                sender: connection.userid
            });
            
            if(connection.peers[participant] && connection.peers[participant].peer) {
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

    connection.error = function(error) {
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
            getUserMedia({
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

                        connection.onstreamended({
                            stream: change.object[change.name],
                            streamid: change.object[change.name].streamid,
                            type: 'local',
                            userid: connection.userid,
                            extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {},
                            mediaElement: change.object[change.name].mediaElement
                        });
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
            socket.emit('message', {
                remoteUserId: broadcaster,
                message: {
                    newParticipant: broadcasterId,
                    userPreferences: userPreferences || false
                },
                sender: connection.userid
            });
        });

        if (!connection.session.oneway && connection.direction === 'many-to-many' && connection.broadcasters.indexOf(broadcasterId) === -1) {
            connection.broadcasters.push(broadcasterId);
        }
    };

    connection.body = connection.filesContainer = document.body || document.documentElement;
    connection.isInitiator = false;

    var progressHelper = {};

    // www.RTCMultiConnection.org/docs/onFileStart/
    connection.onFileStart = function(file) {
        var div = document.createElement('div');
        div.title = file.name;
        div.innerHTML = '<label>0%</label> <progress></progress>';
        connection.filesContainer.insertBefore(div, connection.filesContainer.firstChild);
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
        if (!helper) {
            return;
        }
        helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
        updateLabel(helper.progress, helper.label);
    };

    // www.RTCMultiConnection.org/docs/onFileEnd/
    connection.onFileEnd = function(file) {
        if (!progressHelper[file.uuid]) {
            console.error('No such progress-helper element exists.', file);
            return;
        }

        var div = progressHelper[file.uuid].div;
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

    connection.shareFile = mPeer.shareFile;

    connection.autoCloseEntireSession = false;
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

    connection.token = getRandomString;

    connection.onNewParticipant = function(participantId, userPreferences) {
        connection.acceptParticipationRequest(participantId, userPreferences);
    };

    connection.acceptParticipationRequest = function(participantId, userPreferences) {
        mPeer.createNewPeer(participantId, userPreferences || {
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
    };

    connection.onShiftedModerationControl = function(sender, existingBroadcasters) {
        connection.acceptModerationControl(sender, existingBroadcasters);
    };

    connection.acceptModerationControl = function(sender, existingBroadcasters) {
        connection.isInitiator = true; // NEW initiator!

        connection.broadcasters = existingBroadcasters;
        connection.peers.getAllParticipants().forEach(function(participant) {
            socket.emit('message', {
                remoteUserId: participant,
                message: {
                    changedUUID: sender,
                    oldUUID: connection.userid,
                    newUUID: sender
                },
                sender: connection.userid
            });
        });
        connection.userid = sender;
        socket.emit('changed-uuid', connection.userid);
    };

    connection.shiftModerationControl = function(remoteUserId, existingBroadcasters, firedOnLeave, overrideSender) {
        socket.emit('message', {
            remoteUserId: remoteUserId,
            message: {
                shiftedModerationControl: true,
                broadcasters: existingBroadcasters,
                firedOnLeave: !!firedOnLeave
            },
            sender: overrideSender || connection.userid
        });
    };

    connection.processSdp = function(sdp) {
        sdp = BandwidthHandler.setApplicationSpecificBandwidth(sdp, connection.bandwidth, !!connection.session.screen);
        sdp = BandwidthHandler.setVideoBitrates(sdp, {
            min: 512,
            max: 2048
        });
        sdp = BandwidthHandler.setOpusAttributes(sdp);
        return sdp;
    };

    connection.bandwidth = {
        screen: 2048, // 300kbps minimum
        audio: 128,
        video: 512
    };

    connection.onleave = function(userid) {};

    connection.invokeSelectFileDialog = function(callback) {
        var selector = new FileSelector();
        selector.selectSingleFile(callback);
    };

    connection.getPublicRooms = function(callback) {
        connectSocket(function() {
            socket.emit('message', {
                remoteUserId: 'system',
                sender: connection.userid,
                message: {
                    getPublicUsers: true
                }
            }, function(listOfPublicUsers) {
                callback(listOfPublicUsers);
            });
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

    if (window.StreamsHandler) {
        StreamsHandler.onSyncNeeded = function(streamid, action, type) {
            connection.peers.getAllParticipants().forEach(function(participant) {
                socket.emit('message', {
                    remoteUserId: participant,
                    sender: connection.userid,
                    message: {
                        streamid: streamid,
                        action: action,
                        streamSyncNeeded: true,
                        type: type || 'both'
                    }
                });
            });
        };
    }

    connection.getRemoteStreams = mPeer.getRemoteStreams;
    connection.autoReDialOnFailure = true;
}
