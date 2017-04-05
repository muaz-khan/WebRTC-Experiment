(function(connection) {
    forceOptions = forceOptions || {
        useDefaultDevices: true
    };

    connection.channel = connection.sessionid = (roomid || location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('')) + '';

    var mPeer = new MultiPeers(connection);

    var preventDuplicateOnStreamEvents = {};
    mPeer.onGettingLocalMedia = function(stream) {
        if (preventDuplicateOnStreamEvents[stream.streamid]) {
            return;
        }
        preventDuplicateOnStreamEvents[stream.streamid] = true;

        try {
            stream.type = 'local';
        } catch (e) {}

        connection.setStreamEndHandler(stream);

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
        }, connection);
    };

    mPeer.onGettingRemoteMedia = function(stream, remoteUserId) {
        try {
            stream.type = 'remote';
        } catch (e) {}

        connection.setStreamEndHandler(stream, 'remote-stream');

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
        }, connection);
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

        if (connection.peersBackup[streamEvent.userid]) {
            streamEvent.extra = connection.peersBackup[streamEvent.userid].extra;
        }

        connection.onstreamended(streamEvent);

        delete connection.streamEvents[stream.streamid];
    };

    mPeer.onNegotiationNeeded = function(message, remoteUserId, callback) {
        connectSocket(function() {
            connection.socket.emit(connection.socketMessageEvent, 'password' in message ? message : {
                remoteUserId: message.remoteUserId || remoteUserId,
                message: message,
                sender: connection.userid
            }, callback || function() {});
        });
    };

    function onUserLeft(remoteUserId) {
        connection.deletePeer(remoteUserId);
    }

    mPeer.onUserLeft = onUserLeft;
    mPeer.disconnectWith = function(remoteUserId, callback) {
        if (connection.socket) {
            connection.socket.emit('disconnect-with', remoteUserId, callback || function() {});
        }

        connection.deletePeer(remoteUserId);
    };

    connection.broadcasters = [];

    connection.socketOptions = {
        // 'force new connection': true, // For SocketIO version < 1.0
        // 'forceNew': true, // For SocketIO version >= 1.0
        'transport': 'polling' // fixing transport:unknown issues
    };

    function connectSocket(connectCallback) {
        connection.socketAutoReConnect = true;

        if (connection.socket) { // todo: check here readySate/etc. to make sure socket is still opened
            if (connectCallback) {
                connectCallback(connection.socket);
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

        new SocketConnection(connection, function(s) {
            if (connectCallback) {
                connectCallback(connection.socket);
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

                beforeJoin(connectionDescription.message, function() {
                    mPeer.onNegotiationNeeded(connectionDescription);
                });
                return;
            }

            var oldUserId = connection.userid;
            connection.userid = connection.sessionid = localUserid || connection.sessionid;
            connection.userid += '';

            connection.socket.emit('changed-uuid', connection.userid);

            if (password) {
                connection.socket.emit('set-password', password);
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
            connection.socket.emit('changed-uuid', connection.userid);

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
        connection.socket.emit('become-a-public-moderator');
    };

    connection.dontMakeMeModerator = function() {
        connection.socket.emit('dont-make-me-moderator');
    };

    connection.deletePeer = function(remoteUserId) {
        if (!remoteUserId) {
            return;
        }

        var eventObject = {
            userid: remoteUserId,
            extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {}
        };

        if (connection.peersBackup[eventObject.userid]) {
            eventObject.extra = connection.peersBackup[eventObject.userid].extra;
        }

        connection.onleave(eventObject);

        if (!!connection.peers[remoteUserId]) {
            connection.peers[remoteUserId].streams.forEach(function(stream) {
                stream.stop();
            });

            var peer = connection.peers[remoteUserId].peer;
            if (peer && peer.iceConnectionState !== 'closed') {
                try {
                    peer.close();
                } catch (e) {}
            }

            if (connection.peers[remoteUserId]) {
                connection.peers[remoteUserId].peer = null;
                delete connection.peers[remoteUserId];
            }
        }

        if (connection.broadcasters.indexOf(remoteUserId) !== -1) {
            var newArray = [];
            connection.broadcasters.forEach(function(broadcaster) {
                if (broadcaster !== remoteUserId) {
                    newArray.push(broadcaster);
                }
            });
            connection.broadcasters = newArray;
            keepNextBroadcasterOnServer();
        }
    }

    connection.rejoin = function(connectionDescription) {
        if (connection.isInitiator || !connectionDescription || !Object.keys(connectionDescription).length) {
            return;
        }

        var extra = {};

        if (connection.peers[connectionDescription.remoteUserId]) {
            extra = connection.peers[connectionDescription.remoteUserId].extra;
            connection.deletePeer(connectionDescription.remoteUserId);
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

        var cb = function() {};
        if (typeof options === 'function') {
            cb = options;
            options = {};
        }

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

        beforeJoin(connectionDescription.message, function() {
            connectSocket(function() {
                if (!!connection.peers[connection.sessionid]) {
                    // on socket disconnect & reconnect
                    return;
                }

                mPeer.onNegotiationNeeded(connectionDescription);
                cb();
            });
        });
        return connectionDescription;
    };

    function beforeJoin(userPreferences, callback) {
        if (connection.dontCaptureUserMedia || userPreferences.isDataOnly) {
            callback();
            return;
        }

        var localMediaConstraints = {};

        if (userPreferences.localPeerSdpConstraints.OfferToReceiveAudio) {
            localMediaConstraints.audio = connection.mediaConstraints.audio;
        }

        if (userPreferences.localPeerSdpConstraints.OfferToReceiveVideo) {
            localMediaConstraints.video = connection.mediaConstraints.video;
        }

        var session = userPreferences.session || connection.session;

        if (session.oneway && session.audio !== 'two-way' && session.video !== 'two-way' && session.screen !== 'two-way') {
            callback();
            return;
        }

        if (session.oneway && session.audio && session.audio === 'two-way') {
            session = {
                audio: true
            };
        }

        if (session.audio || session.video || session.screen) {
            if (session.screen) {
                connection.getScreenConstraints(function(error, screen_constraints) {
                    connection.invokeGetUserMedia({
                        audio: isAudioPlusTab(connection) ? getAudioScreenConstraints(screen_constraints) : false,
                        video: screen_constraints,
                        isScreen: true
                    }, (session.audio || session.video) && !isAudioPlusTab(connection) ? connection.invokeGetUserMedia(null, callback) : callback);
                });
            } else if (session.audio || session.video) {
                connection.invokeGetUserMedia(null, callback, session);
            }
        }
    }

    connection.connectWithAllParticipants = function(remoteUserId) {
        mPeer.onNegotiationNeeded('connectWithAllParticipants', remoteUserId || connection.sessionid);
    };

    connection.removeFromBroadcastersList = function(remoteUserId) {
        mPeer.onNegotiationNeeded('removeFromBroadcastersList', remoteUserId || connection.sessionid);

        connection.peers.getAllParticipants(remoteUserId || connection.sessionid).forEach(function(participant) {
            mPeer.onNegotiationNeeded('dropPeerConnection', participant);
            connection.deletePeer(participant);
        });

        connection.attachStreams.forEach(function(stream) {
            stream.stop();
        });
    };

    connection.getUserMedia = connection.captureUserMedia = function(callback, sessionForced) {
        callback = callback || function() {};
        var session = sessionForced || connection.session;

        if (connection.dontCaptureUserMedia || isData(session)) {
            callback();
            return;
        }

        if (session.audio || session.video || session.screen) {
            if (session.screen) {
                connection.getScreenConstraints(function(error, screen_constraints) {
                    if (error) {
                        throw error;
                    }

                    connection.invokeGetUserMedia({
                        audio: isAudioPlusTab(connection) ? getAudioScreenConstraints(screen_constraints) : false,
                        video: screen_constraints,
                        isScreen: true
                    }, function(stream) {
                        if ((session.audio || session.video) && !isAudioPlusTab(connection)) {
                            var nonScreenSession = {};
                            for (var s in session) {
                                if (s !== 'screen') {
                                    nonScreenSession[s] = session[s];
                                }
                            }
                            connection.invokeGetUserMedia(sessionForced, callback, nonScreenSession);
                            return;
                        }
                        callback(stream);
                    });
                });
            } else if (session.audio || session.video) {
                connection.invokeGetUserMedia(sessionForced, callback, session);
            }
        }
    };

    function beforeUnload(shiftModerationControlOnLeave, dontCloseSocket) {
        if (!connection.closeBeforeUnload) {
            return;
        }

        if (connection.isInitiator === true) {
            connection.dontMakeMeModerator();
        }

        connection.peers.getAllParticipants().forEach(function(participant) {
            mPeer.onNegotiationNeeded({
                userLeft: true
            }, participant);

            if (connection.peers[participant] && connection.peers[participant].peer) {
                connection.peers[participant].peer.close();
            }

            delete connection.peers[participant];
        });

        if (!dontCloseSocket) {
            connection.closeSocket();
        }

        connection.broadcasters = [];
        connection.isInitiator = false;
    }

    connection.closeBeforeUnload = true;
    window.addEventListener('beforeunload', beforeUnload, false);

    connection.userid = getRandomString();
    connection.changeUserId = function(newUserId, callback) {
        callback = callback || function() {};
        connection.userid = newUserId || getRandomString();
        connection.socket.emit('changed-uuid', connection.userid, callback);
    };

    connection.extra = {};
    connection.attachStreams = [];

    connection.session = {
        audio: true,
        video: true
    };

    connection.enableFileSharing = false;

    // all values in kbps
    connection.bandwidth = {
        screen: 512,
        audio: 128,
        video: 512
    };

    connection.codecs = {
        audio: 'opus',
        video: 'VP9'
    };

    connection.processSdp = function(sdp) {
        if (isMobileDevice || isFirefox) {
            return sdp;
        }

        sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, connection.bandwidth, !!connection.session.screen);
        sdp = CodecsHandler.setVideoBitrates(sdp, {
            min: connection.bandwidth.video * 8 * 1024,
            max: connection.bandwidth.video * 8 * 1024
        });
        sdp = CodecsHandler.setOpusAttributes(sdp, {
            maxaveragebitrate: connection.bandwidth.audio * 8 * 1024,
            maxplaybackrate: connection.bandwidth.audio * 8 * 1024,
            stereo: 1,
            maxptime: 3
        });

        if (connection.codecs.video === 'VP9') {
            sdp = CodecsHandler.preferVP9(sdp);
        }

        if (connection.codecs.video === 'H264') {
            sdp = CodecsHandler.removeVPX(sdp);
        }

        if (connection.codecs.audio === 'G722') {
            sdp = CodecsHandler.removeNonG722(sdp);
        }

        return sdp;
    };

    if (typeof CodecsHandler !== 'undefined') {
        connection.BandwidthHandler = connection.CodecsHandler = CodecsHandler;
    }

    connection.mediaConstraints = {
        audio: {
            mandatory: {},
            optional: [{
                bandwidth: connection.bandwidth.audio * 8 * 1024 || 128 * 8 * 1024
            }]
        },
        video: {
            mandatory: {},
            optional: [{
                bandwidth: connection.bandwidth.video * 8 * 1024 || 128 * 8 * 1024
            }, {
                facingMode: 'user'
            }]
        }
    };

    if (isFirefox) {
        connection.mediaConstraints = {
            audio: true,
            video: true
        };
    }

    if (!forceOptions.useDefaultDevices && !isMobileDevice) {
        DetectRTC.load(function() {
            var lastAudioDevice, lastVideoDevice;
            // it will force RTCMultiConnection to capture last-devices
            // i.e. if external microphone is attached to system, we should prefer it over built-in devices.
            DetectRTC.MediaDevices.forEach(function(device) {
                if (device.kind === 'audioinput' && connection.mediaConstraints.audio !== false) {
                    lastAudioDevice = device;
                }

                if (device.kind === 'videoinput' && connection.mediaConstraints.video !== false) {
                    lastVideoDevice = device;
                }
            });

            if (lastAudioDevice) {
                if (isFirefox) {
                    if (connection.mediaConstraints.audio !== true) {
                        connection.mediaConstraints.audio.deviceId = lastAudioDevice.id;
                    } else {
                        connection.mediaConstraints.audio = {
                            deviceId: lastAudioDevice.id
                        }
                    }
                    return;
                }

                if (connection.mediaConstraints.audio == true) {
                    connection.mediaConstraints.audio = {
                        mandatory: {},
                        optional: []
                    }
                }

                if (!connection.mediaConstraints.audio.optional) {
                    connection.mediaConstraints.audio.optional = [];
                }

                var optional = [{
                    sourceId: lastAudioDevice.id
                }];

                connection.mediaConstraints.audio.optional = optional.concat(connection.mediaConstraints.audio.optional);
            }

            if (lastVideoDevice) {
                if (isFirefox) {
                    if (connection.mediaConstraints.video !== true) {
                        connection.mediaConstraints.video.deviceId = lastVideoDevice.id;
                    } else {
                        connection.mediaConstraints.video = {
                            deviceId: lastVideoDevice.id
                        }
                    }
                    return;
                }

                if (connection.mediaConstraints.video == true) {
                    connection.mediaConstraints.video = {
                        mandatory: {},
                        optional: []
                    }
                }

                if (!connection.mediaConstraints.video.optional) {
                    connection.mediaConstraints.video.optional = [];
                }

                var optional = [{
                    sourceId: lastVideoDevice.id
                }];

                connection.mediaConstraints.video.optional = optional.concat(connection.mediaConstraints.video.optional);
            }
        });
    }

    connection.sdpConstraints = {
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        },
        optional: [{
            VoiceActivityDetection: false
        }]
    };

    connection.rtcpMuxPolicy = 'negotiate'; // or "required"
    connection.iceTransportPolicy = null; // "relay" or "all"
    connection.optionalArgument = {
        optional: [{
            DtlsSrtpKeyAgreement: true
        }, {
            googImprovedWifiBwe: true
        }, {
            googScreencastMinBitrate: 300
        }, {
            googIPv6: true
        }, {
            googDscp: true
        }, {
            googCpuUnderuseThreshold: 55
        }, {
            googCpuOveruseThreshold: 85
        }, {
            googSuspendBelowMinBitrate: true
        }, {
            googCpuOveruseDetection: true
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
        beforeUnload(false, true);
    };

    connection.closeEntireSession = function(callback) {
        callback = callback || function() {};
        connection.socket.emit('close-entire-session', function looper() {
            if (connection.getAllParticipants().length) {
                setTimeout(looper, 100);
                return;
            }

            connection.onEntireSessionClosed({
                sessionid: connection.sessionid,
                userid: connection.userid,
                extra: connection.extra
            });

            connection.changeUserId(null, function() {
                connection.close();
                callback();
            });
        });
    };

    connection.onEntireSessionClosed = function(event) {
        if (!connection.enableLogs) return;
        console.info('Entire session is closed: ', event.sessionid, event.extra);
    };

    connection.onstream = function(e) {
        var parentNode = connection.videosContainer;
        parentNode.insertBefore(e.mediaElement, parentNode.firstChild);
        e.mediaElement.play();
        setTimeout(function() {
            e.mediaElement.play();
        }, 5000);
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

    connection.removeStream = function(streamid, remoteUserId) {
        var stream;
        connection.attachStreams.forEach(function(localStream) {
            if (localStream.id === streamid) {
                stream = localStream;
            }
        });

        if (!stream) {
            console.warn('No such stream exist.', streamid);
            return;
        }

        connection.peers.getAllParticipants().forEach(function(participant) {
            if (remoteUserId && participant !== remoteUserId) {
                return;
            }

            var user = connection.peers[participant];
            try {
                user.peer.removeStream(stream);
            } catch (e) {}
        });

        connection.renegotiate();
    };

    connection.addStream = function(session, remoteUserId) {
        if (!!session.getAudioTracks) {
            if (connection.attachStreams.indexOf(session) === -1) {
                if (!session.streamid) {
                    session.streamid = session.id;
                }

                connection.attachStreams.push(session);
            }
            connection.renegotiate(remoteUserId);
            return;
        }

        if (isData(session)) {
            connection.renegotiate(remoteUserId);
            return;
        }

        if (session.audio || session.video || session.screen) {
            if (session.screen) {
                connection.getScreenConstraints(function(error, screen_constraints) {
                    if (error) {
                        if (error === 'PermissionDeniedError') {
                            if (session.streamCallback) {
                                session.streamCallback(null);
                            }
                            if (connection.enableLogs) {
                                console.error('User rejected to share his screen.');
                            }
                            return;
                        }
                        return alert(error);
                    }

                    connection.invokeGetUserMedia({
                        audio: isAudioPlusTab(connection) ? getAudioScreenConstraints(screen_constraints) : false,
                        video: screen_constraints,
                        isScreen: true
                    }, (session.audio || session.video) && !isAudioPlusTab(connection) ? connection.invokeGetUserMedia(null, gumCallback) : gumCallback);
                });
            } else if (session.audio || session.video) {
                connection.invokeGetUserMedia(null, gumCallback);
            }
        }

        function gumCallback(stream) {
            if (session.streamCallback) {
                session.streamCallback(stream);
            }

            connection.renegotiate(remoteUserId);
        }
    };

    connection.invokeGetUserMedia = function(localMediaConstraints, callback, session) {
        if (!session) {
            session = connection.session;
        }

        if (!localMediaConstraints) {
            localMediaConstraints = connection.mediaConstraints;
        }

        getUserMediaHandler({
            onGettingLocalMedia: function(stream) {
                var videoConstraints = localMediaConstraints.video;
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

                if (callback) {
                    callback(stream);
                }
            },
            onLocalMediaError: function(error, constraints) {
                mPeer.onLocalMediaError(error, constraints);
            },
            localMediaConstraints: localMediaConstraints || {
                audio: session.audio ? localMediaConstraints.audio : false,
                video: session.video ? localMediaConstraints.video : false
            }
        });
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
            var stream;
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
            connection.addStream(session);
            return;
        }

        if (session instanceof MediaStreamTrack) {
            replaceTrack(session, remoteUserId, isVideoTrack);
            return;
        }

        if (session instanceof MediaStream) {
            if (session.getVideoTracks().length) {
                replaceTrack(session.getVideoTracks()[0], remoteUserId, true);
            }

            if (session.getAudioTracks().length) {
                replaceTrack(session.getAudioTracks()[0], remoteUserId, false);
            }
            return;
        }

        if (isData(session)) {
            throw 'connection.replaceTrack requires audio and/or video and/or screen.';
            return;
        }

        if (session.audio || session.video || session.screen) {
            if (session.screen) {
                connection.getScreenConstraints(function(error, screen_constraints) {
                    if (error) {
                        return alert(error);
                    }

                    connection.invokeGetUserMedia({
                        audio: isAudioPlusTab(connection) ? getAudioScreenConstraints(screen_constraints) : false,
                        video: screen_constraints,
                        isScreen: true
                    }, (session.audio || session.video) && !isAudioPlusTab(connection) ? connection.invokeGetUserMedia(null, gumCallback) : gumCallback);
                });
            } else if (session.audio || session.video) {
                connection.invokeGetUserMedia(null, gumCallback);
            }
        }

        function gumCallback(stream) {
            connection.replaceTrack(stream, remoteUserId, isVideoTrack || session.video || session.screen);
        }
    };

    connection.resetTrack = function(remoteUsersIds, isVideoTrack) {
        if (!remoteUsersIds) {
            remoteUsersIds = connection.getAllParticipants();
        }

        if (typeof remoteUsersIds == 'string') {
            remoteUsersIds = [remoteUsersIds];
        }

        remoteUsersIds.forEach(function(participant) {
            var peer = connection.peers[participant].peer;

            if ((typeof isVideoTrack === 'undefined' || isVideoTrack === true) && peer.lastVideoTrack) {
                connection.replaceTrack(peer.lastVideoTrack, participant, true);
            }

            if ((typeof isVideoTrack === 'undefined' || isVideoTrack === false) && peer.lastAudioTrack) {
                connection.replaceTrack(peer.lastAudioTrack, participant, false);
            }
        });
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

    connection.setStreamEndHandler = function(stream, isRemote) {
        if (!stream || !stream.addEventListener) return;

        isRemote = !!isRemote;

        if (stream.alreadySetEndHandler) {
            return;
        }
        stream.alreadySetEndHandler = true;

        var streamEndedEvent = 'ended';

        if ('oninactive' in stream) {
            streamEndedEvent = 'inactive';
        }

        stream.addEventListener(streamEndedEvent, function() {
            if (stream.idInstance) {
                currentUserMediaRequest.remove(stream.idInstance);
            }

            if (!isRemote) {
                // reset attachStreams
                var streams = [];
                connection.attachStreams.forEach(function(s) {
                    if (s.id != stream.id) {
                        streams.push(s);
                    }
                });
                connection.attachStreams = streams;
            }

            // connection.renegotiate();

            var streamEvent = connection.streamEvents[stream.streamid];
            if (!streamEvent) {
                streamEvent = {
                    stream: stream,
                    streamid: stream.streamid,
                    type: isRemote ? 'remote' : 'local',
                    userid: connection.userid,
                    extra: connection.extra,
                    mediaElement: connection.streamEvents[stream.streamid] ? connection.streamEvents[stream.streamid].mediaElement : null
                };
            }

            if (isRemote && connection.peers[streamEvent.userid]) {
                // reset remote "streams"
                var peer = connection.peers[streamEvent.userid].peer;
                var streams = [];
                peer.getRemoteStreams().forEach(function(s) {
                    if (s.id != stream.id) {
                        streams.push(s);
                    }
                });
                connection.peers[streamEvent.userid].streams = streams;
            }

            if (streamEvent.userid === connection.userid && streamEvent.type === 'remote') {
                return;
            }

            if (connection.peersBackup[streamEvent.userid]) {
                streamEvent.extra = connection.peersBackup[streamEvent.userid].extra;
            }

            connection.onstreamended(streamEvent);

            delete connection.streamEvents[stream.streamid];
        }, false);
    };

    connection.onMediaError = function(error, constraints) {
        if (!!connection.enableLogs) {
            console.error(error, constraints);
        }
    };

    connection.addNewBroadcaster = function(broadcasterId, userPreferences) {
        if (connection.socket.isIO) {
            return;
        }

        if (connection.broadcasters.length) {
            setTimeout(function() {
                mPeer.connectNewParticipantWithAllBroadcasters(broadcasterId, userPreferences, connection.broadcasters.join('|-,-|'));
            }, 10 * 1000);
        }

        if (!connection.session.oneway && !connection.session.broadcast && connection.direction === 'many-to-many' && connection.broadcasters.indexOf(broadcasterId) === -1) {
            connection.broadcasters.push(broadcasterId);
            keepNextBroadcasterOnServer();
        }
    };

    connection.autoCloseEntireSession = false;

    function keepNextBroadcasterOnServer() {
        if (!connection.isInitiator) return;

        if (connection.session.oneway || connection.session.broadcast || connection.direction !== 'many-to-many') {
            return;
        }

        var firstBroadcaster = connection.broadcasters[0];
        var otherBroadcasters = [];
        connection.broadcasters.forEach(function(broadcaster) {
            if (broadcaster !== firstBroadcaster) {
                otherBroadcasters.push(broadcaster);
            }
        });

        if (connection.autoCloseEntireSession) return;
        connection.shiftModerationControl(firstBroadcaster, otherBroadcasters, true);
    };

    connection.filesContainer = connection.videosContainer = document.body || document.documentElement;
    connection.isInitiator = false;

    connection.shareFile = mPeer.shareFile;
    if (typeof FileProgressBarHandler !== 'undefined') {
        FileProgressBarHandler.handle(connection);
    }

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
        connection.changeUserId(connection.userid);
    };

    connection.shiftModerationControl = function(remoteUserId, existingBroadcasters, firedOnLeave) {
        mPeer.onNegotiationNeeded({
            shiftedModerationControl: true,
            broadcasters: existingBroadcasters,
            firedOnLeave: !!firedOnLeave
        }, remoteUserId);
    };

    if (typeof StreamsHandler !== 'undefined') {
        connection.StreamsHandler = StreamsHandler;
    }

    connection.onleave = function(userid) {};

    connection.invokeSelectFileDialog = function(callback) {
        var selector = new FileSelector();
        selector.accept = '*.*';
        selector.selectSingleFile(callback);
    };

    connection.getPublicModerators = function(userIdStartsWith, callback) {
        if (typeof userIdStartsWith === 'function') {
            callback = userIdStartsWith;
        }

        connectSocket(function() {
            connection.socket.emit(
                'get-public-moderators',
                typeof userIdStartsWith === 'string' ? userIdStartsWith : '',
                callback
            );
        });
    };

    connection.onmute = function(e) {
        if (!e || !e.mediaElement) {
            return;
        }

        if (e.muteType === 'both' || e.muteType === 'video') {
            e.mediaElement.src = null;
            e.mediaElement.pause();
            e.mediaElement.poster = e.snapshot || 'https://cdn.webrtc-experiment.com/images/muted.png';
        } else if (e.muteType === 'audio') {
            e.mediaElement.muted = true;
        }
    };

    connection.onunmute = function(e) {
        if (!e || !e.mediaElement || !e.stream) {
            return;
        }

        if (e.unmuteType === 'both' || e.unmuteType === 'video') {
            e.mediaElement.poster = null;
            e.mediaElement.src = URL.createObjectURL(e.stream);
            e.mediaElement.play();
        } else if (e.unmuteType === 'audio') {
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

    connection.getAllParticipants = function(sender) {
        return connection.peers.getAllParticipants(sender);
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

    connection.connectSocket = function(callback) {
        connectSocket(callback);
    };

    connection.closeSocket = function() {
        try {
            io.sockets = {};
        } catch (e) {};

        if (!connection.socket) return;

        if (typeof connection.socket.disconnect === 'function') {
            connection.socket.disconnect();
        }

        if (typeof connection.socket.resetProps === 'function') {
            connection.socket.resetProps();
        }

        connection.socket = null;
    };

    connection.getSocket = function(callback) {
        if (!connection.socket) {
            connectSocket(callback);
        } else if (callback) {
            callback(connection.socket);
        }

        return connection.socket;
    };

    connection.getRemoteStreams = mPeer.getRemoteStreams;

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

    connection.socketURL = '@@socketURL'; // generated via config.json
    connection.socketMessageEvent = '@@socketMessageEvent'; // generated via config.json
    connection.socketCustomEvent = '@@socketCustomEvent'; // generated via config.json
    connection.DetectRTC = DetectRTC;

    connection.setCustomSocketEvent = function(customEvent) {
        if (customEvent) {
            connection.socketCustomEvent = customEvent;
        }

        if (!connection.socket) {
            return;
        }

        connection.socket.emit('set-custom-socket-event-listener', connection.socketCustomEvent);
    };

    connection.getNumberOfBroadcastViewers = function(broadcastId, callback) {
        if (!connection.socket || !broadcastId || !callback) return;

        connection.socket.emit('get-number-of-users-in-specific-broadcast', broadcastId, callback);
    };

    connection.onNumberOfBroadcastViewersUpdated = function(event) {
        if (!connection.enableLogs || !connection.isInitiator) return;
        console.info('Number of broadcast (', event.broadcastId, ') viewers', event.numberOfBroadcastViewers);
    };

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
    connection.chunkSize = 65 * 1000;

    connection.maxParticipantsAllowed = 1000;

    // eject or leave single user
    connection.disconnectWith = mPeer.disconnectWith;

    connection.checkPresence = function(remoteUserId, callback) {
        if (!connection.socket) {
            connection.connectSocket(function() {
                connection.checkPresence(remoteUserId, callback);
            });
            return;
        }
        connection.socket.emit('check-presence', (remoteUserId || connection.sessionid) + '', callback);
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
        connection.socket.emit('extra-data-updated', connection.extra);
    };

    connection.enableScalableBroadcast = false;
    connection.maxRelayLimitPerUser = 3; // each broadcast should serve only 3 users

    connection.dontCaptureUserMedia = false;
    connection.dontAttachStream = false;
    connection.dontGetRemoteStream = false;

    connection.onReConnecting = function(event) {
        if (connection.enableLogs) {
            console.info('ReConnecting with', event.userid, '...');
        }
    };

    connection.beforeAddingStream = function(stream) {
        return stream;
    };

    connection.beforeRemovingStream = function(stream) {
        return stream;
    };

    if (typeof isChromeExtensionAvailable !== 'undefined') {
        connection.checkIfChromeExtensionAvailable = isChromeExtensionAvailable;
    }

    if (typeof isFirefoxExtensionAvailable !== 'undefined') {
        connection.checkIfChromeExtensionAvailable = isFirefoxExtensionAvailable;
    }

    if (typeof getChromeExtensionStatus !== 'undefined') {
        connection.getChromeExtensionStatus = getChromeExtensionStatus;
    }

    connection.getScreenConstraints = function(callback, audioPlusTab) {
        if (isAudioPlusTab(connection, audioPlusTab)) {
            audioPlusTab = true;
        }

        getScreenConstraints(function(error, screen_constraints) {
            if (!error) {
                screen_constraints = connection.modifyScreenConstraints(screen_constraints);
                callback(error, screen_constraints);
            }
        }, audioPlusTab);
    };

    connection.modifyScreenConstraints = function(screen_constraints) {
        return screen_constraints;
    };

    connection.onPeerStateChanged = function(state) {
        if (connection.enableLogs) {
            if (state.iceConnectionState.search(/closed|failed/gi) !== -1) {
                console.error('Peer connection is closed between you & ', state.userid, state.extra, 'state:', state.iceConnectionState);
            }
        }
    };

    connection.isOnline = true;

    listenEventHandler('online', function() {
        connection.isOnline = true;
    });

    listenEventHandler('offline', function() {
        connection.isOnline = false;
    });

    connection.isLowBandwidth = false;
    if (navigator && navigator.connection && navigator.connection.type) {
        connection.isLowBandwidth = navigator.connection.type.toString().toLowerCase().search(/wifi|cell/g) !== -1;
        if (connection.isLowBandwidth) {
            connection.bandwidth = {
                audio: 30,
                video: 30,
                screen: 30
            };

            if (connection.mediaConstraints.audio && connection.mediaConstraints.audio.optional && connection.mediaConstraints.audio.optional.length) {
                var newArray = [];
                connection.mediaConstraints.audio.optional.forEach(function(opt) {
                    if (typeof opt.bandwidth === 'undefined') {
                        newArray.push(opt);
                    }
                });
                connection.mediaConstraints.audio.optional = newArray;
            }

            if (connection.mediaConstraints.video && connection.mediaConstraints.video.optional && connection.mediaConstraints.video.optional.length) {
                var newArray = [];
                connection.mediaConstraints.video.optional.forEach(function(opt) {
                    if (typeof opt.bandwidth === 'undefined') {
                        newArray.push(opt);
                    }
                });
                connection.mediaConstraints.video.optional = newArray;
            }
        }
    }

    connection.getExtraData = function(remoteUserId) {
        if (!remoteUserId) throw 'remoteUserId is required.';
        if (!connection.peers[remoteUserId]) return {};
        return connection.peers[remoteUserId].extra;
    };

    if (!!forceOptions.autoOpenOrJoin) {
        connection.openOrJoin(connection.sessionid);
    }

    connection.onUserIdAlreadyTaken = function(useridAlreadyTaken, yourNewUserId) {
        if (connection.enableLogs) {
            console.warn('Userid already taken.', useridAlreadyTaken, 'Your new userid:', yourNewUserId);
        }

        connection.join(useridAlreadyTaken);
    };

    connection.onRoomFull = function(roomid) {
        if (connection.enableLogs) {
            console.warn(roomid, 'is full.');
        }
    };

    connection.trickleIce = true;
    connection.version = '@@version';

    connection.onSettingLocalDescription = function(event) {
        if (connection.enableLogs) {
            console.info('Set local description for remote user', event.userid);
        }
    };

    connection.oneRoomAlreadyExist = function(roomid) {
        if (connection.enableLogs) {
            console.info('Server says "Room ', roomid, 'already exist. Joining instead.');
        }
        connection.join(roomid);
    };
})(this);
