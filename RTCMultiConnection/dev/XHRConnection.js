function XHRConnection(connection, connectCallback) {
    connection.socket = {
        send: function(data) {
            data = {
                message: data,
                sender: connection.userid
            };

            // posting data to server
            // data is also JSON-ified.
            xhr('/Home/PostData', null, JSON.stringify(data));
        }
    };

    // a simple function to make XMLHttpRequests
    function xhr(url, callback, data) {
        if (!window.XMLHttpRequest || !window.JSON) return;

        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (callback && request.readyState == 4 && request.status == 200) {
                // server MUST return JSON text
                callback(JSON.parse(request.responseText));
            }
        };
        request.open('POST', url);

        var formData = new FormData();

        // you're passing "message" parameter
        formData.append('message', data);

        request.send(formData);
    }

    // this object is used to make sure identical messages are not used multiple times
    var messagesReceived = {};

    function repeatedlyCheck() {
        xhr('/Home/GetData', function(data) {
            // if server says nothing; wait.
            if (data == false) return setTimeout(repeatedlyCheck, 400);

            // if already receied same message; skip.
            if (messagesReceived[data.ID]) return setTimeout(repeatedlyCheck, 400);
            messagesReceived[data.ID] = data.Message;

            // "Message" property is JSON-ified in "openSignalingChannel handler
            data = JSON.parse(data.Message);

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

            // repeatedly check the database
            setTimeout(repeatedlyCheck, 1);
        });
    }

    repeatedlyCheck();

    setTimeout(function() {
        if (connection.enableLogs) {
            console.info('XHR connection is opened.');
        }

        connection.socket.emit('presence', {
            userid: connection.userid,
            isOnline: true
        });

        if (connectCallback) connectCallback(connection.socket);
    }, 2000);

    connection.socket.emit = function(eventName, data, callback) {
        if (eventName === 'changed-uuid') return;
        if (data.message && data.message.shiftedModerationControl) return;

        connection.socket.send({
            eventName: eventName,
            data: data
        });

        if (callback) {
            callback();
        }
    };

    var mPeer = connection.multiPeersHandler;

    function onMessagesCallback(message) {
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
        connection.socket.emit('presence', {
            userid: connection.userid,
            isOnline: false
        });
    }, false);
}
