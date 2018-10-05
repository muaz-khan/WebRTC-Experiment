function SocketConnection(connection, connectCallback) {
    var parameters = '';

    parameters += '?userid=' + connection.userid;
    parameters += '&sessionid=' + connection.sessionid;
    parameters += '&msgEvent=' + connection.socketMessageEvent;
    parameters += '&socketCustomEvent=' + connection.socketCustomEvent;
    parameters += '&autoCloseEntireSession=' + !!connection.autoCloseEntireSession;

    if (connection.session.broadcast === true) {
        parameters += '&oneToMany=true';
    }

    parameters += '&maxParticipantsAllowed=' + connection.maxParticipantsAllowed;

    if (connection.enableScalableBroadcast) {
        parameters += '&enableScalableBroadcast=true';
        parameters += '&maxRelayLimitPerUser=' + (connection.maxRelayLimitPerUser || 2);
    }

    if (connection.socketCustomParameters) {
        parameters += connection.socketCustomParameters;
    }

    try {
        io.sockets = {};
    } catch (e) {};

    if (!connection.socketURL) {
        connection.socketURL = '/';
    }

    if (connection.socketURL.substr(connection.socketURL.length - 1, 1) != '/') {
        // connection.socketURL = 'https://domain.com:9001/';
        throw '"socketURL" MUST end with a slash.';
    }

    if (connection.enableLogs) {
        if (connection.socketURL == '/') {
            console.info('socket.io is connected at: ', location.origin + '/');
        } else {
            console.info('socket.io is connected at: ', connection.socketURL);
        }
    }

    try {
        connection.socket = io(connection.socketURL + parameters);
    } catch (e) {
        connection.socket = io.connect(connection.socketURL + parameters, connection.socketOptions);
    }

    // detect signaling medium
    connection.socket.isIO = true;

    var mPeer = connection.multiPeersHandler;

    connection.socket.on('extra-data-updated', function(remoteUserId, extra) {
        if (!connection.peers[remoteUserId]) return;
        connection.peers[remoteUserId].extra = extra;

        connection.onExtraDataUpdated({
            userid: remoteUserId,
            extra: extra
        });

        updateExtraBackup(remoteUserId, extra);
    });

    function updateExtraBackup(remoteUserId, extra) {
        if (!connection.peersBackup[remoteUserId]) {
            connection.peersBackup[remoteUserId] = {
                userid: remoteUserId,
                extra: {}
            };
        }

        connection.peersBackup[remoteUserId].extra = extra;
    }

    function onMessageEvent(message) {
        if (message.remoteUserId != connection.userid) return;

        if (connection.peers[message.sender] && connection.peers[message.sender].extra != message.message.extra) {
            connection.peers[message.sender].extra = message.extra;
            connection.onExtraDataUpdated({
                userid: message.sender,
                extra: message.extra
            });

            updateExtraBackup(message.sender, message.extra);
        }

        if (message.message.streamSyncNeeded && connection.peers[message.sender]) {
            var stream = connection.streamEvents[message.message.streamid];
            if (!stream || !stream.stream) {
                return;
            }

            var action = message.message.action;

            if (action === 'ended' || action === 'inactive' || action === 'stream-removed') {
                if (connection.peersBackup[stream.userid]) {
                    stream.extra = connection.peersBackup[stream.userid].extra;
                }
                connection.onstreamended(stream);
                return;
            }

            var type = message.message.type != 'both' ? message.message.type : null;

            if (typeof stream.stream[action] == 'function') {
                stream.stream[action](type);
            }
            return;
        }

        if (message.message === 'dropPeerConnection') {
            connection.deletePeer(message.sender);
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
            if (connection.attachStreams.length) {
                connection.waitingForLocalMedia = false;
            }

            if (connection.waitingForLocalMedia) {
                // if someone is waiting to join you
                // make sure that we've local media before making a handshake
                setTimeout(function() {
                    onMessageEvent(message);
                }, 1);
                return;
            }
        }

        if (message.message.newParticipationRequest && message.sender !== connection.userid) {
            if (connection.peers[message.sender]) {
                connection.deletePeer(message.sender);
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
                successCallback: function() {}
            };

            connection.onNewParticipant(message.sender, userPreferences);
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
    }

    connection.socket.on(connection.socketMessageEvent, onMessageEvent);

    var alreadyConnected = false;

    connection.socket.resetProps = function() {
        alreadyConnected = false;
    };

    connection.socket.on('connect', function() {
        if (alreadyConnected) {
            return;
        }
        alreadyConnected = true;

        if (connection.enableLogs) {
            console.info('socket.io connection is opened.');
        }

        setTimeout(function() {
            connection.socket.emit('extra-data-updated', connection.extra);

            if (connectCallback) {
                connectCallback(connection.socket);
            }
        }, 1000);
    });

    connection.socket.on('disconnect', function() {
        if (connection.enableLogs) {
            console.warn('socket.io connection is closed');
        }
    });

    connection.socket.on('join-with-password', function(remoteUserId) {
        connection.onJoinWithPassword(remoteUserId);
    });

    connection.socket.on('invalid-password', function(remoteUserId, oldPassword) {
        connection.onInvalidPassword(remoteUserId, oldPassword);
    });

    connection.socket.on('password-max-tries-over', function(remoteUserId) {
        connection.onPasswordMaxTriesOver(remoteUserId);
    });

    connection.socket.on('user-disconnected', function(remoteUserId) {
        if (remoteUserId === connection.userid) {
            return;
        }

        connection.onUserStatusChanged({
            userid: remoteUserId,
            status: 'offline',
            extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra || {} : {}
        });

        connection.deletePeer(remoteUserId);
    });

    connection.socket.on('user-connected', function(userid) {
        if (userid === connection.userid) {
            return;
        }

        connection.onUserStatusChanged({
            userid: userid,
            status: 'online',
            extra: connection.peers[userid] ? connection.peers[userid].extra || {} : {}
        });
    });

    connection.socket.on('closed-entire-session', function(sessionid, extra) {
        connection.leave();
        connection.onEntireSessionClosed({
            sessionid: sessionid,
            userid: sessionid,
            extra: extra
        });
    });

    connection.socket.on('userid-already-taken', function(useridAlreadyTaken, yourNewUserId) {
        connection.isInitiator = false;
        connection.userid = yourNewUserId;

        connection.onUserIdAlreadyTaken(useridAlreadyTaken, yourNewUserId);
    })

    connection.socket.on('logs', function(log) {
        if (!connection.enableLogs) return;
        console.debug('server-logs', log);
    });

    connection.socket.on('number-of-broadcast-viewers-updated', function(data) {
        connection.onNumberOfBroadcastViewersUpdated(data);
    });

    connection.socket.on('room-full', function(roomid) {
        connection.onRoomFull(roomid);
    });

    connection.socket.on('become-next-modrator', function(sessionid) {
        if (sessionid != connection.sessionid) return;
        connection.isInitiator = true;
    });
}
