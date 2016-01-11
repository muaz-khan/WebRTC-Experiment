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
