function PubNubConnection(connection, connectCallback) {
    var channelId = connection.channel;

    var pub = 'pub-c-3c0fc243-9892-4858-aa38-1445e58b4ecb';
    var sub = 'sub-c-d0c386c6-7263-11e2-8b02-12313f022c90';

    WebSocket = PUBNUB.ws;
    var socket = new WebSocket('wss://pubsub.pubnub.com/' + pub + '/' + sub + '/' + channelId);

    socket.onmessage = function(e) {
        var data = JSON.parse(e.data);

        if (data.eventName === connection.socketMessageEvent) {
            onMessagesCallback(data.data);
        }

        if (data.eventName === 'presence') {
            data = data.data;
            if (data.userid === connection.userid) return;
            connection.onUserStatusChanged({
                userid: data.userid,
                status: data.isOnline === true ? 'online' : 'offline',
                extra: connection.peers[data.userid] ? connection.peers[data.userid].extra : {}
            });
        }
    };

    socket.onerror = function() {
        console.error('Socket connection is failed.');
    };

    socket.onclose = function() {
        console.warn('Socket connection is closed.');
    };

    socket.onopen = function() {
        // if connection.enableLogs
        console.info('socket.io connection is opened.');
        if (connectCallback) connectCallback(socket);

        socket.emit('presence', {
            userid: connection.userid,
            isOnline: true
        });
    };

    socket.emit = function(eventName, data, callback) {
        socket.send(JSON.stringify({
            eventName: eventName,
            data: data
        }));
    };

    var mPeer = connection.multiPeersHandler;

    function onMessagesCallback(message) {
        if (message.remoteUserId != connection.userid) return;

        if (connection.enableLogs) {
            console.debug(message.sender, message.message);
        }

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
            mPeer.onUserLeft(message.sender);

            if (!!message.message.autoCloseEntireSession) {
                connection.leave();
            }

            return;
        }

        mPeer.addNegotiatedMessage(message.message, message.sender);
    }

    window.addEventListener('beforeunload', function() {
        socket.emit('presence', {
            userid: connection.userid,
            isOnline: false
        });
    }, false);

    return socket;
}
