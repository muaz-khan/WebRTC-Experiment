function enableV2Api(connection) {
    // support sendCustomMessage+onCustomMessage
    if (typeof connection.sendCustomMessage === 'undefined') {
        connection.sendCustomMessage = function(message) {
            connection.socket.emit(connection.socketCustomEvent, message);
        };

        connection.connectSocket(function() {
            connection.socket.on(connection.socketCustomEvent, function(message) {
                if (typeof connection.onCustomMessage === 'function') {
                    connection.onCustomMessage(message);
                } else {
                    console.log('onCustomMessage: ' + message);
                }
            });
        });
    }

    // support "connection.streams"
    connection.streams = {};
    (function looper() {
        connection.streams = connection.streamEvents;

        Object.keys(connection.streamEvents).forEach(function(sid) {
            if (connection.streams[sid]) return;
            var event = connection.streamEvents[sid];

            // http://www.rtcmulticonnection.org/docs/streamEvents/
            // implement selectFirst/selectAll according to v2 API (below)
            connection.streams[sid] = {
                type: event.type,
                stream: event.stream,
                mediaElement: event.mediaElement,
                blobURL: '',
                userid: event.userid,
                exra: event.exra,
                selectFirst: event.selectFirst,
                selectAll: event.selectAll,
                isAudio: event.stream.isAudio,
                isVideo: event.stream.isVideo,
                isScreen: event.stream.isScreen
            };
        });

        Object.keys(connection.peers).forEach(function(uid) {
            if (!connection.peers[uid] || !connection.peers[uid].peer) return;
            if (connection.peers[uid].peer.connection) return;
            connection.peers[uid].peer.connection = connection.peers[uid].peer;
        });

        setTimeout(looper, 3000);
    })();

    // override open method
    connection.nativeOpen = connection.open;
    connection.open = function() {
        connection.nativeOpen(connection.channel);
    };

    // override join method
    connection.nativeJoin = connection.join;
    connection.join = function() {
        connection.nativeJoin(connection.channel);
    };

    // override connect method
    connection.connect = function() {
        connection.checkPresence(connection.channel, function(isRoomExist) {
            if (isRoomExist === true) {
                connection.join();
                return;
            }

            connection.connect();
        });
    };

    if (connection.session.data && typeof FileBufferReader !== 'undefined') {
        connection.enableFileSharing = true;
    }

    if (!connection.filesContainer) {
        connection.filesContainer = connection.body || document.body || document.documentElement;
    }

    if (!connection.videosContainer) {
        connection.videosContainer = connection.body || document.body || document.documentElement;
    }

    // support "openSignalingChannel"
    connection.setCustomSocketHandler(openSignalingChannel);
}

function openSignalingChannel(connection, connectCallback) {
    function isData(session) {
        return !session.audio && !session.video && !session.screen && session.data;
    }

    connection.socketMessageEvent = 'message';

    console.log('calling openSignalingChannel');
    connection.openSignalingChannel({
        channel: connection.channel,
        callback: function(socket) {
            console.log('Signaling socket is opened.');
            connection.socket = socket;

            if (!connection.socket.emit) {
                connection.socket.emit = function(eventName, data, callback) {
                    if (eventName === 'changed-uuid') return;
                    if (data.message && data.message.shiftedModerationControl) return;

                    console.error('sent', {
                        eventName: eventName,
                        data: data
                    });

                    connection.socket.send({
                        eventName: eventName,
                        data: data
                    });

                    if (callback) {
                        callback();
                    }
                };
            }

            if (connectCallback) connectCallback(connection.socket);
        },
        onmessage: function(data) {
            console.error('onmessage', data);

            if (data.eventName === connection.socketMessageEvent) {
                onMessagesCallback(data.data);
            }
        }
    });

    var mPeer = connection.multiPeersHandler;

    function onMessagesCallback(message) {
        if (message.remoteUserId != connection.userid) return;

        if (connection.peers[message.sender] && connection.peers[message.sender].extra != message.message.extra) {
            connection.peers[message.sender].extra = message.message.extra;
            connection.onExtraDataUpdated({
                userid: message.sender,
                extra: message.message.extra
            });
        }

        if (message.message.streamSyncNeeded && connection.peers[message.sender]) {
            var stream = connection.streamEvents[message.message.streamid];
            if (!stream || !stream.stream) {
                return;
            }

            var action = message.message.action;

            if (action === 'ended' || action === 'stream-removed') {
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
                allParticipants: connection.getAllParticipants(message.sender)
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

        if (message.message.readyForOffer || message.message.addMeAsBroadcaster) {
            connection.addNewBroadcaster(message.sender);
        }

        if (message.message.newParticipationRequest && message.sender !== connection.userid) {
            if (connection.peers[message.sender]) {
                connection.deletePeer(message.sender);
            }

            var userPreferences = {
                extra: message.message.extra || {},
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
}
