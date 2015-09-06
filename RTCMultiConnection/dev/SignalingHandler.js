function SignalingHandler(connection, callbackForSignalingReady) {
    var signalingHandler = this;
    var participants = {};

    if (!signalingHandler.fileBufferReader && connection.session.data && connection.enableFileSharing) {
        initFileBufferReader(connection, function(fbr) {
            signalingHandler.fileBufferReader = fbr;
        });
    }

    var textReceiver = new TextReceiver(connection);

    function onDataChannelMessage(e) {
        if (e.data.checkingPresence && connection.channels[e.userid]) {
            connection.channels[e.userid].send({
                presenceDetected: true
            });
            return;
        }

        if (e.data.presenceDetected && connection.peers[e.userid]) {
            connection.peers[e.userid].connected = true;
            return;
        }

        if (e.data.type === 'text') {
            textReceiver.receive(e.data, e.userid, e.extra);
        } else {
            if (connection.autoTranslateText) {
                e.original = e.data;
                connection.Translator.TranslateText(e.data, function(translatedText) {
                    e.data = translatedText;
                    connection.onmessage(e);
                });
            } else {
                connection.onmessage(e);
            }
        }
    }

    function onNewSession(session) {
        if (connection.skipOnNewSession) {
            return;
        }

        if (!session.session) {
            session.session = {};
        }

        if (!session.extra) {
            session.extra = {};
        }

        // todo: make sure this works as expected.
        // i.e. "onNewSession" should be fired only for 
        // sessionid that is passed over "connect" method.
        if (connection.sessionid && session.sessionid !== connection.sessionid) {
            return;
        }

        if (connection.onNewSession) {
            session.join = function(forceSession) {
                if (!forceSession) {
                    return connection.join(session);
                }

                for (var f in forceSession) {
                    session.session[f] = forceSession[f];
                }

                // keeping previous state
                var isDontCaptureUserMedia = connection.dontCaptureUserMedia;

                connection.dontCaptureUserMedia = false;
                connection.captureUserMedia(function() {
                    connection.dontCaptureUserMedia = true;
                    connection.join(session);

                    // returning back previous state
                    connection.dontCaptureUserMedia = isDontCaptureUserMedia;
                }, forceSession);
            };

            if (!session.extra) {
                session.extra = {};
            }

            return connection.onNewSession(session);
        }

        connection.join(session);
    }

    function updateSocketForLocalStreams(socket) {
        for (var i = 0; i < connection.localStreamids.length; i++) {
            var streamid = connection.localStreamids[i];
            if (connection.streams[streamid]) {
                // using "sockets" array to keep references of all sockets using 
                // this media stream; so we can fire "onStreamEndedHandler" among all users.
                connection.streams[streamid].sockets.push(socket);
            }
        }
    }

    var peerNegotiationHandler = {};

    function handlePeersNegotiation(_config) {
        var socket = connection.socket;
        socket.send2 = function(message) {
            message.channel = _config.channel;
            socket.send(message);
        };

        peerNegotiationHandler[_config.channel] = socketResponse;

        var isCreateOffer = _config.isCreateOffer,
            peer;

        var peerConfig = {
            onopen: onChannelOpened,
            onicecandidate: function(candidate) {
                if (!connection.candidates) {
                    throw 'ICE candidates are mandatory.';
                }

                if (!connection.iceProtocols) {
                    throw 'At least one must be true; UDP or TCP.';
                }

                var iceCandidates = connection.candidates;

                var stun = iceCandidates.stun;
                var turn = iceCandidates.turn;

                if (!isNull(iceCandidates.reflexive)) {
                    stun = iceCandidates.reflexive;
                }

                if (!isNull(iceCandidates.relay)) {
                    turn = iceCandidates.relay;
                }

                if (!iceCandidates.host && !!candidate.candidate.match(/typ host/g)) {
                    return;
                }

                if (!turn && !!candidate.candidate.match(/typ relay/g)) {
                    return;
                }

                if (!stun && !!candidate.candidate.match(/typ srflx/g)) {
                    return;
                }

                var protocol = connection.iceProtocols;

                if (!protocol.udp && !!candidate.candidate.match(/ udp /g)) {
                    return;
                }

                if (!protocol.tcp && !!candidate.candidate.match(/ tcp /g)) {
                    return;
                }

                if (!window.selfNPObject) {
                    window.selfNPObject = candidate;
                }

                if (!socket) {
                    return;
                }

                socket.send2({
                    candidate: JSON.stringify({
                        candidate: candidate.candidate,
                        sdpMid: candidate.sdpMid,
                        sdpMLineIndex: candidate.sdpMLineIndex
                    })
                });
            },
            onmessage: function(data) {
                if (!data) {
                    return;
                }

                var abToStr = ab2str(data);
                if (abToStr.indexOf('"userid":') !== -1) {
                    abToStr = JSON.parse(abToStr);
                    onDataChannelMessage(abToStr);
                } else if (data instanceof ArrayBuffer || data instanceof DataView) {
                    if (!connection.enableFileSharing) {
                        throw 'It seems that receiving data is either "Blob" or "File" but file sharing is disabled.';
                    }

                    if (!signalingHandler.fileBufferReader) {
                        var that = this;
                        initFileBufferReader(connection, function(fbr) {
                            signalingHandler.fileBufferReader = fbr;
                            that.onmessage(data);
                        });
                        return;
                    }

                    var fileBufferReader = signalingHandler.fileBufferReader;

                    fileBufferReader.convertToObject(data, function(chunk) {
                        if (chunk.maxChunks || chunk.readyForNextChunk) {
                            // if target peer requested next chunk
                            if (chunk.readyForNextChunk) {
                                fileBufferReader.getNextChunk(chunk.uuid, function(nextChunk) {
                                    signalingHandler.send(nextChunk);
                                });
                                return;
                            }

                            // if chunk is received
                            fileBufferReader.addChunk(chunk, function(promptNextChunk) {
                                // request next chunk
                                signalingHandler.send(promptNextChunk);
                            });
                            return;
                        }

                        connection.onmessage({
                            data: chunk,
                            userid: _config.userid,
                            extra: _config.extra
                        });
                    });
                    return;
                }
            },
            onaddstream: function(stream, session) {
                session = session || _config.renegotiate || connection.session;

                // if it is Firefox; then return.
                if (isData(session)) {
                    return;
                }

                if (session.screen && (session.audio || session.video)) {
                    if (!_config.gotAudioOrVideo) {
                        // audio/video are fired earlier than screen
                        _config.gotAudioOrVideo = true;
                        session.screen = false;
                    } else {
                        // screen stream is always fired later
                        session.audio = false;
                        session.video = false;
                    }
                }

                var preMuted = {};

                function eventListener() {
                    setTimeout(function() {
                        mediaElement.muted = false;
                        afterRemoteStreamStartedFlowing({
                            mediaElement: mediaElement,
                            session: session,
                            stream: stream,
                            preMuted: preMuted
                        });
                    }, 3000);

                    mediaElement.removeEventListener('play', eventListener);
                }

                if (_config.streaminfo) {
                    var streaminfo = _config.streaminfo.split('----');
                    var strInfo = JSON.parse(streaminfo[streaminfo.length - 1]);

                    if (!isIE) {
                        stream.streamid = strInfo.streamid;
                        stream.isScreen = !!strInfo.isScreen;
                        stream.isVideo = !!strInfo.isVideo;
                        stream.isAudio = !!strInfo.isAudio;
                        preMuted = strInfo.preMuted;
                    }

                    streaminfo.pop();
                    _config.streaminfo = streaminfo.join('----');
                }

                var mediaElement = createMediaElement(stream, merge({
                    remote: true
                }, session));

                if (connection.setDefaultEventsForMediaElement) {
                    connection.setDefaultEventsForMediaElement(mediaElement, stream.streamid);
                }

                if (!isPluginRTC && !stream.getVideoTracks().length) {
                    return mediaElement.addEventListener('play', eventListener, false);
                }

                waitUntilRemoteStreamStartsFlowing({
                    mediaElement: mediaElement,
                    session: session,
                    stream: stream,
                    preMuted: preMuted
                });
            },

            onremovestream: function(stream) {
                if (stream && stream.streamid) {
                    stream = connection.streams[stream.streamid];
                    if (stream) {
                        log('on:stream:ended via on:remove:stream', stream);
                        onStreamEndedHandler(stream, connection);
                    }
                } else {
                    log('on:remove:stream', stream);
                }
            },

            onclose: function(e) {
                e.extra = _config.extra;
                e.userid = _config.userid;
                connection.onclose(e);

                // suggested in #71 by "efaj"
                if (connection.channels[e.userid]) {
                    delete connection.channels[e.userid];
                }
            },
            onerror: function(e) {
                e.extra = _config.extra;
                e.userid = _config.userid;
                connection.onerror(e);
            },

            oniceconnectionstatechange: function(event) {
                log('oniceconnectionstatechange', toStr(event));

                if (peer.connection && peer.connection.iceConnectionState === 'connected' && peer.connection.iceGatheringState === 'complete' && peer.connection.signalingState === 'stable' && connection.numberOfConnectedUsers === 1) {
                    connection.onconnected({
                        userid: _config.userid,
                        extra: _config.extra,
                        peer: connection.peers[_config.userid],
                        targetuser: _config.userinfo
                    });
                }

                if (!connection.isInitiator && peer.connection && peer.connection.iceConnectionState === 'connected' && peer.connection.iceGatheringState === 'complete' && peer.connection.signalingState === 'stable' && connection.numberOfConnectedUsers === 1) {
                    connection.onstatechange({
                        userid: _config.userid,
                        extra: _config.extra,
                        name: 'connected-with-initiator',
                        reason: 'ICE connection state seems connected; gathering state is completed; and signaling state is stable.'
                    });
                }

                if (connection.peers[_config.userid] && connection.peers[_config.userid].oniceconnectionstatechange) {
                    connection.peers[_config.userid].oniceconnectionstatechange(event);
                }

                // if ICE connectivity check is failed; renegotiate or redial
                if (connection.peers[_config.userid] && connection.peers[_config.userid].peer && connection.peers[_config.userid].peer.connection.iceConnectionState === 'failed') {
                    connection.onfailed({
                        userid: _config.userid,
                        extra: _config.extra,
                        peer: connection.peers[_config.userid],
                        targetuser: _config.userinfo
                    });
                }

                if (connection.peers[_config.userid] && connection.peers[_config.userid].peer.connection.iceConnectionState === 'disconnected') {
                    if (!peer.connection.renegotiate) {
                        connection.ondisconnected({
                            userid: _config.userid,
                            extra: _config.extra,
                            peer: connection.peers[_config.userid],
                            targetuser: _config.userinfo
                        });
                    }
                    peer.connection.renegotiate = false;
                }

                if (!connection.autoReDialOnFailure) {
                    return;
                }

                if (connection.peers[_config.userid]) {
                    if (connection.peers[_config.userid].peer.connection.iceConnectionState !== 'disconnected') {
                        _config.redialing = false;
                    }

                    if (connection.peers[_config.userid].peer.connection.iceConnectionState === 'disconnected' && !_config.redialing) {
                        _config.redialing = true;
                        warn('Peer connection is closed.', toStr(connection.peers[_config.userid].peer.connection), 'ReDialing..');
                        connection.peers[_config.userid].socket.send2({
                            redial: true
                        });

                        // to make sure all old "remote" streams are also removed!
                        connection.streams.remove({
                            remote: true,
                            userid: _config.userid
                        });
                    }
                }
            },

            onsignalingstatechange: function(event) {
                log('onsignalingstatechange', toStr(event));
            },

            attachStreams: connection.dontAttachStream ? [] : connection.attachStreams,
            iceServers: connection.iceServers,
            rtcConfiguration: connection.rtcConfiguration,
            bandwidth: connection.bandwidth,
            sdpConstraints: connection.sdpConstraints,
            optionalArgument: connection.optionalArgument,
            disableDtlsSrtp: connection.disableDtlsSrtp,
            dataChannelDict: connection.dataChannelDict,
            preferSCTP: connection.preferSCTP,

            onSessionDescription: function(sessionDescription, streaminfo) {
                sendsdp({
                    sdp: sessionDescription,
                    socket: socket,
                    streaminfo: streaminfo
                });
            },
            trickleIce: connection.trickleIce,
            processSdp: connection.processSdp,
            sendStreamId: function(stream) {
                if (!socket) {
                    return;
                }

                socket.send2({
                    streamid: stream.streamid,
                    isScreen: !!stream.isScreen,
                    isAudio: !!stream.isAudio,
                    isVideo: !!stream.isVideo
                });
            },
            rtcMultiConnection: connection
        };

        function waitUntilRemoteStreamStartsFlowing(args) {
            // chrome for android may have some features missing
            if (isMobileDevice || isPluginRTC || (!isNull(connection.waitUntilRemoteStreamStartsFlowing) && connection.waitUntilRemoteStreamStartsFlowing === false)) {
                return afterRemoteStreamStartedFlowing(args);
            }

            if (!args.numberOfTimes) {
                args.numberOfTimes = 0;
            }

            args.numberOfTimes++;

            if (!(args.mediaElement.readyState <= window.HTMLMediaElement.HAVE_CURRENT_DATA || args.mediaElement.paused || args.mediaElement.currentTime <= 0)) {
                return afterRemoteStreamStartedFlowing(args);
            }

            if (args.numberOfTimes >= 60) { // wait 60 seconds while video is delivered!
                return socket.send2({
                    failedToReceiveRemoteVideo: true,
                    streamid: args.stream.streamid
                });
            }

            setTimeout(function() {
                log('Waiting for incoming remote stream to be started flowing: ' + args.numberOfTimes + ' seconds.');
                waitUntilRemoteStreamStartsFlowing(args);
            }, 900);
        }

        function initFakeChannel() {
            if (!connection.fakeDataChannels || connection.channels[_config.userid]) {
                return;
            }

            // for non-data connections; allow fake data sender!
            if (!connection.session.data) {
                var fakeChannel = {
                    send: function(data) {
                        socket.send2({
                            fakeData: data
                        });
                    },
                    readyState: 'open'
                };
                // connection.channels['user-id'].send(data);
                connection.channels[_config.userid] = {
                    channel: fakeChannel,
                    send: function(data) {
                        this.channel.send(data);
                    }
                };
                peerConfig.onopen(fakeChannel);
            }
        }

        function afterRemoteStreamStartedFlowing(args) {
            var mediaElement = args.mediaElement;
            var session = args.session;
            var stream = args.stream;

            stream.onended = function() {
                if (streamedObject.mediaElement && !streamedObject.mediaElement.parentNode && document.getElementById(stream.streamid)) {
                    streamedObject.mediaElement = document.getElementById(stream.streamid);
                }

                onStreamEndedHandler(streamedObject, connection);

                if (harker) {
                    harker.stop();
                }
            };

            var streamedObject = {
                mediaElement: mediaElement,

                stream: stream,
                streamid: stream.streamid,
                session: session || connection.session,

                blobURL: isPluginRTC ? '' : mediaElement.mozSrcObject ? URL.createObjectURL(stream) : mediaElement.src,
                type: 'remote',

                extra: _config.extra,
                userid: _config.userid,

                isVideo: isPluginRTC ? !!session.video : !!stream.isVideo,
                isAudio: isPluginRTC ? !!session.audio && !session.video : !!stream.isAudio,
                isScreen: !!stream.isScreen,
                isInitiator: !!_config.isInitiator,

                rtcMultiConnection: connection,
                socket: socket
            };

            // connection.streams['stream-id'].mute({audio:true})
            connection.streams[stream.streamid] = connection._getStream(streamedObject);
            connection.onstream(streamedObject);

            if (!isEmpty(args.preMuted) && (args.preMuted.audio || args.preMuted.video)) {
                var fakeObject = merge({}, streamedObject);
                fakeObject.session = merge(fakeObject.session, args.preMuted);

                fakeObject.isAudio = !!fakeObject.session.audio && !fakeObject.session.video;
                fakeObject.isVideo = !!fakeObject.session.video;
                fakeObject.isScreen = false;

                connection.onmute(fakeObject);
            }

            log('on:add:stream', streamedObject);

            onSessionOpened();

            var harker;
            if (connection.onspeaking && false) { // temporarily disabled
                initHark({
                    stream: stream,
                    streamedObject: streamedObject,
                    connection: connection
                }, function(_harker) {
                    harker = _harker;
                });
            }
        }

        function onChannelOpened(channel) {
            _config.datachannel = channel;

            // connection.channels['user-id'].send(data);
            connection.channels[_config.userid] = {
                channel: _config.datachannel,
                send: function(data) {
                    connection.send(data, this.channel);
                }
            };

            connection.onopen({
                extra: _config.extra,
                userid: _config.userid,
                channel: channel
            });

            // fetch files from file-queue
            for (var q in connection.fileQueue) {
                connection.send(connection.fileQueue[q], channel);
            }

            if (isData(connection.session)) {
                onSessionOpened();
            }

            if (connection.partOfScreen && connection.partOfScreen.sharing) {
                connection.peers[_config.userid].sharePartOfScreen(connection.partOfScreen);
            }
        }

        function updateSocket() {
            // todo: need to check following {if-block} MUST not affect "redial" process
            if (socket.userid === _config.userid) {
                return;
            }

            socket.userid = _config.userid;

            connection.numberOfConnectedUsers++;
            // connection.peers['user-id'].addStream({audio:true})
            connection.peers[_config.userid] = {
                socket: socket,
                peer: peer,
                userid: _config.userid,
                extra: _config.extra,
                userinfo: _config.userinfo,
                addStream: function(session00) {
                    // connection.peers['user-id'].addStream({audio: true, video: true);

                    connection.addStream(session00, this.socket);
                },
                removeStream: function(streamid) {
                    if (!connection.streams[streamid]) {
                        return warn('No such stream exists. Stream-id:', streamid);
                    }

                    this.peer.connection.removeStream(connection.streams[streamid].stream);
                    this.renegotiate();
                },
                renegotiate: function(stream, session) {
                    // connection.peers['user-id'].renegotiate();

                    connection.renegotiate(stream, session);
                },
                changeBandwidth: function(bandwidth) {
                    // connection.peers['user-id'].changeBandwidth();

                    if (!bandwidth) {
                        throw 'You MUST pass bandwidth object.';
                    }

                    if (isString(bandwidth)) {
                        throw 'Pass object for bandwidth instead of string; e.g. {audio:10, video:20}';
                    }

                    // set bandwidth for self
                    this.peer.bandwidth = bandwidth;

                    // ask remote user to synchronize bandwidth
                    this.socket.send2({
                        changeBandwidth: true,
                        bandwidth: bandwidth
                    });
                },
                sendCustomMessage: function(message) {
                    // connection.peers['user-id'].sendCustomMessage();

                    this.socket.send2({
                        customMessage: true,
                        message: message
                    });
                },
                onCustomMessage: function(message) {
                    log('Received "private" message from', this.userid,
                        isString(message) ? message : toStr(message));
                },
                drop: function(dontSendMessage) {
                    // connection.peers['user-id'].drop();

                    for (var stream in connection.streams) {
                        if (connection._skip.indexOf(stream) === -1) {
                            stream = connection.streams[stream];

                            if (stream.userid === connection.userid && stream.type === 'local') {
                                this.peer.connection.removeStream(stream.stream);
                                onStreamEndedHandler(stream, connection);
                            }

                            if (stream.type === 'remote' && stream.userid === this.userid) {
                                onStreamEndedHandler(stream, connection);
                            }
                        }
                    }

                    if (!!dontSendMessage) {
                        return;
                    }

                    this.socket.send2({
                        drop: true
                    });
                },
                hold: function(holdMLine) {
                    // connection.peers['user-id'].hold();

                    if (peer.prevCreateType === 'answer') {
                        this.socket.send2({
                            unhold: true,
                            holdMLine: holdMLine || 'both',
                            takeAction: true
                        });
                        return;
                    }

                    this.socket.send2({
                        hold: true,
                        holdMLine: holdMLine || 'both'
                    });

                    this.peer.hold = true;
                    this.fireHoldUnHoldEvents({
                        kind: holdMLine,
                        isHold: true,
                        userid: connection.userid,
                        remoteUser: this.userid
                    });
                },
                unhold: function(holdMLine) {
                    // connection.peers['user-id'].unhold();

                    if (peer.prevCreateType === 'answer') {
                        this.socket.send2({
                            unhold: true,
                            holdMLine: holdMLine || 'both',
                            takeAction: true
                        });
                        return;
                    }

                    this.socket.send2({
                        unhold: true,
                        holdMLine: holdMLine || 'both'
                    });

                    this.peer.hold = false;
                    this.fireHoldUnHoldEvents({
                        kind: holdMLine,
                        isHold: false,
                        userid: connection.userid,
                        remoteUser: this.userid
                    });
                },
                fireHoldUnHoldEvents: function(e) {
                    // this method is for inner usages only!

                    var isHold = e.isHold;
                    var kind = e.kind;
                    var userid = e.remoteUser || e.userid;

                    // hold means inactive a specific media line!
                    // a media line can contain multiple synced sources (ssrc)
                    // i.e. a media line can reference multiple tracks!
                    // that's why hold will affect all relevant tracks in a specific media line!
                    for (var stream in connection.streams) {
                        if (connection._skip.indexOf(stream) === -1) {
                            stream = connection.streams[stream];

                            if (stream.userid === userid) {
                                // www.RTCMultiConnection.org/docs/onhold/
                                if (isHold) {
                                    connection.onhold(merge({
                                        kind: kind
                                    }, stream));
                                }

                                // www.RTCMultiConnection.org/docs/onunhold/
                                if (!isHold) {
                                    connection.onunhold(merge({
                                        kind: kind
                                    }, stream));
                                }
                            }
                        }
                    }
                },
                redial: function() {
                    // connection.peers['user-id'].redial();

                    // 1st of all; remove all relevant remote media streams
                    for (var stream in connection.streams) {
                        if (connection._skip.indexOf(stream) === -1) {
                            stream = connection.streams[stream];

                            if (stream.userid === this.userid && stream.type === 'remote') {
                                onStreamEndedHandler(stream, connection);
                            }
                        }
                    }

                    log('ReDialing...');

                    socket.send2({
                        recreatePeer: true
                    });

                    peerConfig.attachStreams = connection.attachStreams;
                    peer = new RTCPeerConnectionHandler();
                    peer.create('offer', peerConfig);
                },
                sharePartOfScreen: function(args) {
                    // www.RTCMultiConnection.org/docs/onpartofscreen/
                    var that = this;
                    var lastScreenshot = '';

                    function partOfScreenCapturer() {
                        // if stopped
                        if (that.stopPartOfScreenSharing) {
                            that.stopPartOfScreenSharing = false;

                            if (connection.onpartofscreenstopped) {
                                connection.onpartofscreenstopped();
                            }
                            return;
                        }

                        // if paused
                        if (that.pausePartOfScreenSharing) {
                            if (connection.onpartofscreenpaused) {
                                connection.onpartofscreenpaused();
                            }

                            return setTimeout(partOfScreenCapturer, args.interval || 200);
                        }

                        capturePartOfScreen({
                            element: args.element,
                            connection: connection,
                            callback: function(screenshot) {
                                if (!connection.channels[that.userid]) {
                                    throw 'No such data channel exists.';
                                }

                                // don't share repeated content
                                if (screenshot !== lastScreenshot) {
                                    lastScreenshot = screenshot;
                                    connection.channels[that.userid].send({
                                        screenshot: screenshot,
                                        isPartOfScreen: true
                                    });
                                }

                                // "once" can be used to share single screenshot
                                if (!!args.once) {
                                    return;
                                }

                                setTimeout(partOfScreenCapturer, args.interval || 200);
                            }
                        });
                    }

                    partOfScreenCapturer();
                },
                getConnectionStats: function(callback, interval) {
                    if (!callback) {
                        throw 'callback is mandatory.';
                    }

                    if (!window.getConnectionStats) {
                        loadScript(connection.resources.getConnectionStats, invoker);
                    } else {
                        invoker();
                    }

                    function invoker() {
                        RTCPeerConnection.prototype.getConnectionStats = window.getConnectionStats;
                        if (!peer.connection) {
                            return;
                        }
                        peer.connection.getConnectionStats(callback, interval);
                    }
                },
                takeSnapshot: function(callback) {
                    takeSnapshot({
                        userid: this.userid,
                        connection: connection,
                        callback: callback
                    });
                }
            };
        }

        function onSessionOpened() {
            // original conferencing infrastructure!
            if (connection.isInitiator && getLength(participants) && getLength(participants) <= connection.maxParticipantsAllowed) {
                if (!connection.session.oneway && !connection.session.broadcast) {
                    connection.socket.send({
                        sessionid: connection.sessionid,
                        newParticipant: _config.userid || socket.channel,
                        userData: {
                            userid: _config.userid || socket.channel,
                            extra: _config.extra
                        }
                    });
                }
            }

            // 1st: renegotiation is supported only on chrome
            // 2nd: must not renegotiate same media multiple times
            // 3rd: todo: make sure that target-user has no such "renegotiated" media.
            if (_config.userinfo.browser === 'chrome' && !_config.renegotiatedOnce) {
                // this code snippet is added to make sure that "previously-renegotiated" streams are also 
                // renegotiated to this new user
                for (var rSession in connection.renegotiatedSessions) {
                    _config.renegotiatedOnce = true;

                    if (connection.renegotiatedSessions[rSession] && connection.renegotiatedSessions[rSession].stream) {
                        connection.peers[_config.userid].renegotiate(connection.renegotiatedSessions[rSession].stream, connection.renegotiatedSessions[rSession].session);
                    }
                }
            }
        }

        if (isCreateOffer && !peer) {
            peerConfig.session = connection.session;
            if (!peer) {
                peer = new RTCPeerConnectionHandler();
            }

            peer.create('offer', peerConfig);
        }

        updateSocketForLocalStreams(socket);

        function socketResponse(response) {
            if (isSignalingHandlerDeleted) {
                return;
            }

            if (response.userid === connection.userid) {
                return;
            }

            if (response.sdp) {
                _config.userid = response.userid;
                _config.extra = response.extra || {};
                _config.renegotiate = response.renegotiate;
                _config.streaminfo = response.streaminfo;
                _config.isInitiator = response.isInitiator;
                _config.userinfo = response.userinfo;

                var sdp = JSON.parse(response.sdp);

                if (sdp.type === 'offer') {
                    // to synchronize SCTP or RTP
                    peerConfig.preferSCTP = !!response.preferSCTP;
                    connection.fakeDataChannels = !!response.fakeDataChannels;
                }

                // initializing fake channel
                initFakeChannel();

                sdpInvoker(sdp, response.labels);
            }

            if (response.candidate && peer) {
                peer.addIceCandidate(JSON.parse(response.candidate));
            }

            if (response.streamid) {
                if (!signalingHandler.streamids) {
                    signalingHandler.streamids = {};
                }
                if (!signalingHandler.streamids[response.streamid]) {
                    signalingHandler.streamids[response.streamid] = response.streamid;
                    connection.onstreamid(response);
                }
            }

            if (response.mute || response.unmute) {
                if (response.promptMuteUnmute) {
                    if (!connection.privileges.canMuteRemoteStream) {
                        connection.onstatechange({
                            userid: response.userid,
                            extra: response.extra,
                            name: 'mute-request-denied',
                            reason: response.userid + ' tried to mute your stream; however "privileges.canMuteRemoteStream" is "false".'
                        });
                        return;
                    }

                    if (connection.streams[response.streamid]) {
                        if (response.mute && !connection.streams[response.streamid].muted) {
                            connection.streams[response.streamid].mute(response.session);
                        }
                        if (response.unmute && connection.streams[response.streamid].muted) {
                            connection.streams[response.streamid].unmute(response.session);
                        }
                    }
                } else {
                    var streamObject = {};
                    if (connection.streams[response.streamid]) {
                        streamObject = connection.streams[response.streamid];
                    }

                    var session = response.session;
                    var fakeObject = merge({}, streamObject);
                    fakeObject.session = session;

                    fakeObject.isAudio = !!fakeObject.session.audio && !fakeObject.session.video;
                    fakeObject.isVideo = !!fakeObject.session.video;
                    fakeObject.isScreen = !!fakeObject.session.screen;

                    if (response.mute) {
                        connection.onmute(fakeObject || response);
                    }

                    if (response.unmute) {
                        connection.onunmute(fakeObject || response);
                    }
                }
            }

            if (response.isVolumeChanged) {
                log('Volume of stream: ' + response.streamid + ' has changed to: ' + response.volume);
                if (connection.streams[response.streamid]) {
                    var mediaElement = connection.streams[response.streamid].mediaElement;
                    if (mediaElement) {
                        mediaElement.volume = response.volume;
                    }
                }
            }

            // to stop local stream
            if (response.stopped) {
                if (connection.streams[response.streamid]) {
                    onStreamEndedHandler(connection.streams[response.streamid], connection);
                }
            }

            // to stop remote stream
            if (response.promptStreamStop /* && !connection.isInitiator */ ) {
                if (!connection.privileges.canStopRemoteStream) {
                    connection.onstatechange({
                        userid: response.userid,
                        extra: response.extra,
                        name: 'stop-request-denied',
                        reason: response.userid + ' tried to stop your stream; however "privileges.canStopRemoteStream" is "false".'
                    });
                    return;
                }
                warn('Remote stream has been manually stopped!');
                if (connection.streams[response.streamid]) {
                    connection.streams[response.streamid].stop();
                }
            }

            if (response.left) {
                // firefox is unable to stop remote streams
                // firefox doesn't auto stop streams when peer.close() is called.
                if (isFirefox) {
                    var userLeft = response.userid;
                    for (var stream in connection.streams) {
                        stream = connection.streams[stream];
                        if (stream.userid === userLeft) {
                            connection.stopMediaStream(stream);
                            onStreamEndedHandler(stream, connection);
                        }
                    }
                }

                if (peer && peer.connection) {
                    // todo: verify if-block's 2nd condition
                    if (peer.connection.signalingState !== 'closed' && peer.connection.iceConnectionState.search(/disconnected|failed/gi) === -1) {
                        peer.connection.close();
                    }
                    peer.connection = null;
                }

                if (participants[response.userid]) {
                    delete participants[response.userid];
                }

                if (response.closeEntireSession) {
                    connection.onSessionClosed(response);
                    connection.leave();
                    return;
                }

                connection.remove(response.userid);

                onLeaveHandler({
                    userid: response.userid,
                    extra: response.extra || {},
                    entireSessionClosed: !!response.closeEntireSession
                }, connection);

                if (peerNegotiationHandler[_config.channel]) {
                    delete peerNegotiationHandler[_config.channel];
                }
            }

            if (response.changeBandwidth) {
                if (!connection.peers[response.userid]) {
                    throw 'No such peer exists.';
                }

                // synchronize bandwidth
                connection.peers[response.userid].peer.bandwidth = response.bandwidth;

                // renegotiate to apply bandwidth
                connection.peers[response.userid].renegotiate();
            }

            if (response.customMessage) {
                if (!connection.peers[response.userid]) {
                    throw 'No such peer exists.';
                }

                if (response.message.ejected) {
                    if (connection.sessionDescriptions[connection.sessionid].userid !== response.userid) {
                        throw 'only initiator can eject a user.';
                    }
                    // initiator ejected this user
                    connection.leave();

                    connection.onSessionClosed({
                        userid: response.userid,
                        extra: response.extra || _config.extra,
                        isEjected: true
                    });
                } else {
                    connection.peers[response.userid].onCustomMessage(response.message);
                }
            }

            if (response.drop) {
                if (!connection.peers[response.userid]) {
                    throw 'No such peer exists.';
                }

                connection.peers[response.userid].drop(true);
                connection.peers[response.userid].renegotiate();

                connection.ondrop(response.userid);
            }

            if (response.hold || response.unhold) {
                if (!connection.peers[response.userid]) {
                    throw 'No such peer exists.';
                }

                if (response.takeAction) {
                    connection.peers[response.userid][!!response.hold ? 'hold' : 'unhold'](response.holdMLine);
                    return;
                }

                connection.peers[response.userid].peer.hold = !!response.hold;
                connection.peers[response.userid].peer.holdMLine = response.holdMLine;

                socket.send2({
                    isRenegotiate: true
                });

                connection.peers[response.userid].fireHoldUnHoldEvents({
                    kind: response.holdMLine,
                    isHold: !!response.hold,
                    userid: response.userid
                });
            }

            if (response.isRenegotiate) {
                connection.peers[response.userid].renegotiate(null, connection.peers[response.userid].peer.session);
            }

            // fake data channels!
            if (response.fakeData) {
                peerConfig.onmessage(response.fakeData);
            }

            // sometimes we don't need to renegotiate e.g. when peers are disconnected
            // or if it is Firefox
            if (response.recreatePeer) {
                if (peer && peer.connection) {
                    peer.connection.close();
                }
                peerConfig.attachStreams = connection.attachStreams;
                peer = new RTCPeerConnectionHandler();
            }

            // remote video failed either out of ICE gathering process or ICE connectivity check-up
            // or IceAgent was unable to locate valid candidates/ports.
            if (response.failedToReceiveRemoteVideo) {
                log('Remote peer hasn\'t received stream: ' + response.streamid + '. Renegotiating...');
                if (connection.peers[response.userid]) {
                    connection.peers[response.userid].renegotiate();
                }
            }

            if (response.redial) {
                if (connection.peers[response.userid]) {
                    if (connection.peers[response.userid].peer.connection.iceConnectionState !== 'disconnected') {
                        _config.redialing = false;
                    }

                    if (connection.peers[response.userid].peer.connection.iceConnectionState === 'disconnected' && !_config.redialing) {
                        _config.redialing = true;

                        warn('Peer connection is closed. ReDialing..');
                        connection.peers[response.userid].redial();
                    }
                }
            }
        }

        function sdpInvoker(sdp, labels) {
            if (sdp.type === 'answer') {
                peer.setRemoteDescription(sdp);
                updateSocket();
                return;
            }
            if (!_config.renegotiate && sdp.type === 'offer') {
                peerConfig.offerDescription = sdp;

                peerConfig.session = connection.session;

                if (!peer) {
                    peerConfig.attachStreams = connection.attachStreams;
                    peer = new RTCPeerConnectionHandler();
                }

                peer.create('answer', peerConfig);

                updateSocket();
                return;
            }

            var session = _config.renegotiate;
            // detach streams
            detachMediaStream(labels, peer.connection);

            if (session.oneway || isData(session)) {
                createAnswer();
                delete _config.renegotiate;
            } else {
                if (_config.capturing) {
                    return;
                }

                _config.capturing = true;

                connection.captureUserMedia(function(stream) {
                    _config.capturing = false;

                    if (isChrome || (isFirefox && !peer.connection.getLocalStreams().length)) {
                        peer.addStream(stream);
                    }

                    connection.renegotiatedSessions[JSON.stringify(_config.renegotiate)] = {
                        session: _config.renegotiate,
                        stream: stream
                    };

                    delete _config.renegotiate;

                    createAnswer();
                }, _config.renegotiate);
            }

            function createAnswer() {
                // because Firefox has no support of renegotiation yet;
                // so both chrome and firefox should redial instead of renegotiate!
                if (isFirefox || _config.userinfo.browser === 'firefox') {
                    if (connection.peers[_config.userid]) {
                        connection.peers[_config.userid].redial();
                    }
                    return;
                }

                peer.recreateAnswer(sdp, session, function(_sdp, streaminfo) {
                    sendsdp({
                        sdp: _sdp,
                        socket: socket,
                        streaminfo: streaminfo
                    });
                    connection.detachStreams = [];
                });
            }
        }
    }

    connection.playRoleOfInitiator = function() {
        connection.dontCaptureUserMedia = true;
        connection.open();
        connection.dontCaptureUserMedia = false;
    };

    connection.askToShareParticipants = function() {
        if (!connection.socket) {
            return;
        }

        connection.socket.send({
            askToShareParticipants: true
        });
    };

    connection.shareParticipants = function(args) {
        var message = {
            joinUsers: participants,
            userid: connection.userid,
            extra: connection.extra
        };

        if (args) {
            if (args.dontShareWith) {
                message.dontShareWith = args.dontShareWith;
            }

            if (args.shareWith) {
                message.shareWith = args.shareWith;
            }
        }

        connection.socket.send(message);
    };



    function detachMediaStream(labels, peer) {
        if (!labels || isFirefox) {
            return;
        }

        for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            if (connection.streams[label]) {
                peer.removeStream(connection.streams[label].stream);
            }
        }
    }

    function sendsdp(e) {
        e.socket.send2({
            sdp: JSON.stringify({
                sdp: e.sdp.sdp,
                type: e.sdp.type
            }),
            renegotiate: !!e.renegotiate ? e.renegotiate : false,
            streaminfo: e.streaminfo || '',
            labels: e.labels || [],
            preferSCTP: !!connection.preferSCTP,
            fakeDataChannels: !!connection.fakeDataChannels,
            isInitiator: !!connection.isInitiator,
            userinfo: {
                browser: isFirefox ? 'firefox' : 'chrome'
            }
        });
    }

    // sharing new user with existing participants

    function onNewParticipant(response) {
        var channel = response.newParticipant;

        if (!channel || !!participants[channel] || channel === connection.userid) {
            return;
        }

        var newChannel = connection.token();
        handlePeersNegotiation({
            channel: newChannel,
            extra: response.userData ? response.userData.extra : response.extra,
            userid: response.userData ? response.userData.userid : response.userid
        });

        connection.socket.send({
            participant: true,
            targetUser: channel,
            channel: newChannel
        });
    }

    // if a user leaves

    function clearSession() {
        if (connection.isInitiator && connection.socket) {
            connection.socket.send({
                sessionClosed: true,
                session: connection.sessionDescription
            });
        }

        var alertMessage = {
            left: true,
            extra: connection.extra || {},
            userid: connection.userid,
            sessionid: connection.sessionid
        };

        if (connection.isInitiator) {
            // if initiator wants to close entire session
            if (connection.autoCloseEntireSession) {
                alertMessage.closeEntireSession = true;
            } else {
                var firstPeer;
                for (var peer in connection.peers) {
                    if (peer !== connection.userid) {
                        firstPeer = connection.peers[peer];
                        continue;
                    }
                }
                if (firstPeer && firstPeer.socket) {
                    // shift initiation control to another user
                    firstPeer.socket.send2({
                        isPlayRoleOfInitiator: true,
                        messageFor: firstPeer.userid,
                        userid: connection.userid,
                        extra: connection.extra,
                        participants: participants
                    });
                }
            }
        }

        if (connection.socket) {
            connection.socket.send(alertMessage);
        }

        connection.refresh();

        webAudioMediaStreamSources.forEach(function(mediaStreamSource) {
            // if source is connected; then chrome will crash on unload.
            mediaStreamSource.disconnect();
        });

        webAudioMediaStreamSources = [];
    }

    // www.RTCMultiConnection.org/docs/remove/
    connection.remove = function(userid) {
        if (signalingHandler.requestsFrom && signalingHandler.requestsFrom[userid]) {
            delete signalingHandler.requestsFrom[userid];
        }

        if (connection.peers[userid]) {
            if (connection.peers[userid].peer && connection.peers[userid].peer.connection) {
                if (connection.peers[userid].peer.connection.signalingState !== 'closed') {
                    connection.peers[userid].peer.connection.close();
                }
                connection.peers[userid].peer.connection = null;
            }
            delete connection.peers[userid];
        }
        if (participants[userid]) {
            delete participants[userid];
        }

        for (var streamid in connection.streams) {
            var stream = connection.streams[streamid];
            if (stream.userid === userid) {
                onStreamEndedHandler(stream, connection);
                delete connection.streams[streamid];
            }
        }
    };

    // www.RTCMultiConnection.org/docs/refresh/
    connection.refresh = function() {
        // if firebase; remove data from firebase servers
        if (connection.isInitiator && !!connection.socket && !!connection.socket.remove) {
            connection.socket.remove();
        }

        participants = {};

        // to stop/remove self streams
        for (var i = 0; i < connection.attachStreams.length; i++) {
            connection.stopMediaStream(connection.attachStreams[i]);
        }

        // to allow capturing of identical streams
        currentUserMediaRequest = {
            streams: [],
            mutex: false,
            queueRequests: []
        };

        signalingHandler.isOwnerLeaving = true;

        connection.isInitiator = false;
        connection.isAcceptNewSession = true;
        connection.attachMediaStreams = [];
        connection.sessionDescription = null;
        connection.sessionDescriptions = {};
        connection.localStreamids = [];
        connection.preRecordedMedias = {};
        connection.snapshots = {};

        connection.numberOfConnectedUsers = 0;
        connection.numberOfSessions = 0;

        connection.attachStreams = [];
        connection.detachStreams = [];
        connection.fileQueue = {};
        connection.channels = {};
        connection.renegotiatedSessions = {};

        for (var peer in connection.peers) {
            if (peer !== connection.userid) {
                delete connection.peers[peer];
            }
        }

        // to make sure remote streams are also removed!
        for (var stream in connection.streams) {
            if (connection._skip.indexOf(stream) === -1) {
                onStreamEndedHandler(connection.streams[stream], connection);
                delete connection.streams[stream];
            }
        }

        participants = {};
    };

    // www.RTCMultiConnection.org/docs/reject/
    connection.reject = function(userid) {
        if (!isString(userid)) {
            userid = userid.userid;
        }

        connection.socket.send({
            rejectedRequestOf: userid
        });

        // remove relevant data to allow him join again
        connection.remove(userid);
    };

    signalingHandler.leaveHandler = function(e) {
        if (!connection.leaveOnPageUnload) {
            return;
        }

        if (isNull(e.keyCode)) {
            return clearSession();
        }

        if (e.keyCode === 116) {
            clearSession();
        }
    };

    listenEventHandler('beforeunload', signalingHandler.leaveHandler);
    listenEventHandler('keyup', signalingHandler.leaveHandler);

    function onSignalingReady() {
        if (signalingHandler.signalingReady) {
            return;
        }

        signalingHandler.signalingReady = true;
        setTimeout(callbackForSignalingReady, 1000);
    }

    function joinParticipants(joinUsers) {
        for (var user in joinUsers) {
            if (!participants[joinUsers[user]]) {
                onNewParticipant({
                    sessionid: connection.sessionid,
                    newParticipant: joinUsers[user],
                    userid: connection.userid,
                    extra: connection.extra
                });
            }
        }
    }

    // default-socket is a common socket shared among all users in a specific channel;
    // to share participation requests; room descriptions; and other stuff.
    connection.socket = connection.openSignalingChannel({
        onmessage: function(response) {
            if (peerNegotiationHandler[response.channel]) {
                return peerNegotiationHandler[response.channel](response);
            }

            // if message is sent by same user
            if (response.userid === connection.userid) {
                return;
            }

            if (isSignalingHandlerDeleted) {
                return;
            }

            if (response.sessionid && response.userid) {
                if (!connection.sessionDescriptions[response.sessionid]) {
                    connection.numberOfSessions++;
                    connection.sessionDescriptions[response.sessionid] = response;

                    // fire "onNewSession" only if:
                    // 1) "isAcceptNewSession" boolean is true
                    // 2) "sessionDescriptions" object isn't having same session i.e. to prevent duplicate invocations
                    if (connection.isAcceptNewSession) {

                        if (!connection.dontOverrideSession) {
                            connection.session = response.session;
                        }

                        onNewSession(response);
                    }
                }
            }

            if (response.newParticipant && !connection.isAcceptNewSession && signalingHandler.broadcasterid === response.userid) {
                if (response.newParticipant !== connection.userid) {
                    onNewParticipant(response);
                }
            }

            if (getLength(participants) < connection.maxParticipantsAllowed && response.targetUser === connection.userid && response.participant) {
                if (connection.peers[response.userid] && !connection.peers[response.userid].peer) {
                    delete participants[response.userid];
                    delete connection.peers[response.userid];
                    connection.isAcceptNewSession = true;
                    return acceptRequest(response);
                }

                if (!participants[response.userid]) {
                    acceptRequest(response);
                }
            }

            if (response.acceptedRequestOf === connection.userid) {
                connection.onstatechange({
                    userid: response.userid,
                    extra: response.extra,
                    name: 'request-accepted',
                    reason: response.userid + ' accepted your participation request.'
                });
            }

            if (response.rejectedRequestOf === connection.userid) {
                connection.onstatechange({
                    userid: response.userid,
                    extra: response.extra,
                    name: 'request-rejected',
                    reason: response.userid + ' rejected your participation request.'
                });
            }

            if (response.customMessage) {
                if (response.message.drop) {
                    connection.ondrop(response.userid);

                    connection.attachStreams = [];
                    // "drop" should detach all local streams
                    for (var stream in connection.streams) {
                        if (connection._skip.indexOf(stream) === -1) {
                            stream = connection.streams[stream];
                            if (stream.type === 'local') {
                                connection.detachStreams.push(stream.streamid);
                                onStreamEndedHandler(stream, connection);
                            } else {
                                onStreamEndedHandler(stream, connection);
                            }
                        }
                    }

                    if (response.message.renegotiate) {
                        // renegotiate; so "peer.removeStream" happens.
                        connection.renegotiate();
                    }
                } else if (connection.onCustomMessage) {
                    connection.onCustomMessage(response.message);
                }
            }

            if (response.sessionDescription && response.responseFor === connection.userid) {
                var sessionDescription = response.sessionDescription;
                if (!connection.sessionDescriptions[sessionDescription.sessionid]) {
                    connection.numberOfSessions++;
                    connection.sessionDescriptions[sessionDescription.sessionid] = sessionDescription;
                }
            }

            if (connection.isInitiator && response.askToShareParticipants && connection.socket) {
                connection.shareParticipants({
                    shareWith: response.userid
                });
            }

            // participants are shared with single user
            if (response.shareWith === connection.userid && response.dontShareWith !== connection.userid && response.joinUsers) {
                joinParticipants(response.joinUsers);
            }

            // participants are shared with all users
            if (!response.shareWith && response.joinUsers) {
                if (response.dontShareWith) {
                    if (connection.userid !== response.dontShareWith) {
                        joinParticipants(response.joinUsers);
                    }
                } else {
                    joinParticipants(response.joinUsers);
                }
            }

            if (response.messageFor === connection.userid && response.presenceState) {
                if (response.presenceState === 'checking') {
                    connection.socket.send({
                        messageFor: response.userid,
                        presenceState: 'available',
                        _config: response._config
                    });
                    log('participant asked for availability');
                }

                if (response.presenceState === 'available') {
                    signalingHandler.presenceState = 'available';

                    connection.onstatechange({
                        userid: 'browser',
                        extra: {},
                        name: 'room-available',
                        reason: 'Initiator is available and room is active.'
                    });

                    joinSession(response._config);
                }
            }

            if (response.donotJoin && response.messageFor === connection.userid) {
                log(response.userid, 'is not joining your room.');
            }

            // if initiator disconnects sockets, participants should also disconnect
            if (response.isDisconnectSockets) {
                log('Disconnecting your sockets because initiator also disconnected his sockets.');
                connection.disconnect();
            }

            // keeping session active even if initiator leaves
            if (response.isPlayRoleOfInitiator && response.messageFor === connection.userid) {
                if (response.extra) {
                    // clone extra-data from initial moderator
                    connection.extra = merge(connection.extra, response.extra);
                }
                if (response.participants) {
                    participants = response.participants;

                    // make sure that if 2nd initiator leaves; control is shifted to 3rd person.
                    if (participants[connection.userid]) {
                        delete participants[connection.userid];
                    }
                }

                setTimeout(connection.playRoleOfInitiator, 2000);
            }

            if (response.sessionClosed) {
                connection.onSessionClosed(response);
            }
        },
        callback: function(socket) {
            if (!socket) {
                return;
            }

            this.onopen(socket);
        },
        onopen: function(socket) {
            if (socket) {
                connection.socket = socket;
            }

            if (onSignalingReady) {
                onSignalingReady();
            }

            if (!connection.socket.__push) {
                connection.socket.__push = connection.socket.send;
                connection.socket.send = function(message) {
                    message.userid = message.userid || connection.userid;
                    message.extra = message.extra || connection.extra || {};

                    connection.socket.__push(message);
                };
            }
        }
    });

    if (connection.socket && onSignalingReady) {
        setTimeout(onSignalingReady, 2000);
    }

    if (connection.session.screen) {
        loadScreenFrame();
    }

    if (connection.getExternalIceServers) {
        loadIceFrame(function(iceServers) {
            connection.iceServers = connection.iceServers.concat(iceServers);
        });
    }

    if (connection.log === false) {
        connection.skipLogs();
    }

    if (connection.onlog) {
        log = warn = error = function() {
            var log = {};
            var index = 0;
            Array.prototype.slice.call(arguments).forEach(function(argument) {
                log[index++] = toStr(argument);
            });
            toStr = function(str) {
                return str;
            };
            connection.onlog(log);
        };
    }

    function setDirections() {
        var userMaxParticipantsAllowed = 0;

        // if user has set a custom max participant setting, remember it
        if (connection.maxParticipantsAllowed !== 256) {
            userMaxParticipantsAllowed = connection.maxParticipantsAllowed;
        }

        if (connection.direction === 'one-way') {
            connection.session.oneway = true;
        }

        if (connection.direction === 'one-to-one') {
            connection.maxParticipantsAllowed = 1;
        }

        if (connection.direction === 'one-to-many') {
            connection.session.broadcast = true;
        }

        if (connection.direction === 'many-to-many') {
            if (!connection.maxParticipantsAllowed || connection.maxParticipantsAllowed === 1) {
                connection.maxParticipantsAllowed = 256;
            }
        }

        // if user has set a custom max participant setting, set it back
        if (userMaxParticipantsAllowed && connection.maxParticipantsAllowed !== 1) {
            connection.maxParticipantsAllowed = userMaxParticipantsAllowed;
        }
    }

    // open new session
    this.initSession = function(args) {
        signalingHandler.isOwnerLeaving = false;

        setDirections();
        participants = {};

        signalingHandler.isOwnerLeaving = false;

        if (!isNull(args.transmitRoomOnce)) {
            connection.transmitRoomOnce = args.transmitRoomOnce;
        }

        function transmit() {
            if (connection.socket && getLength(participants) < connection.maxParticipantsAllowed && !signalingHandler.isOwnerLeaving) {
                connection.socket.send(connection.sessionDescription);
            }

            if (!connection.transmitRoomOnce && !signalingHandler.isOwnerLeaving) {
                setTimeout(transmit, connection.interval || 3000);
            }
        }

        // todo: test and fix next line.
        if (!args.dontTransmit /* || connection.transmitRoomOnce */ ) {
            transmit();
        }
    };

    function joinSession(_config) {
        if (signalingHandler.donotJoin && signalingHandler.donotJoin === _config.sessionid) {
            return;
        }

        // dontOverrideSession allows you force RTCMultiConnection
        // to not override default session for participants;
        // by default, session is always overridden and set to the session coming from initiator!
        if (!connection.dontOverrideSession) {
            connection.session = _config.session || {};
        }

        // make sure that inappropriate users shouldn't receive onNewSession event
        signalingHandler.broadcasterid = _config.userid;

        if (_config.sessionid) {
            // used later to prevent external rooms messages to be used by this user!
            connection.sessionid = _config.sessionid;
        }

        connection.isAcceptNewSession = false;

        var channel = getRandomString();
        handlePeersNegotiation({
            channel: channel,
            extra: _config.extra || {},
            userid: _config.userid
        });

        var offers = {};
        if (connection.attachStreams.length) {
            var stream = connection.attachStreams[connection.attachStreams.length - 1];
            if (!!stream.getAudioTracks && stream.getAudioTracks().length) {
                offers.audio = true;
            }
            if (stream.getVideoTracks().length) {
                offers.video = true;
            }
        }

        if (!isEmpty(offers)) {
            log(toStr(offers));
        } else {
            log('Seems data-only connection.');
        }

        connection.onstatechange({
            userid: _config.userid,
            extra: {},
            name: 'connecting-with-initiator',
            reason: 'Checking presence of the initiator; and the room.'
        });

        connection.socket.send({
            participant: true,
            channel: channel,
            targetUser: _config.userid,
            session: connection.session,
            offers: {
                audio: !!offers.audio,
                video: !!offers.video
            }
        });

        connection.skipOnNewSession = false;
        invokeMediaCaptured(connection);
    }

    // join existing session
    this.joinSession = function(_config) {
        if (!connection.socket) {
            return setTimeout(function() {
                warn('Default-Socket is not yet initialized.');
                signalingHandler.joinSession(_config);
            }, 1000);
        }

        _config = _config || {};
        participants = {};

        signalingHandler.presenceState = 'checking';

        connection.onstatechange({
            userid: _config.userid,
            extra: _config.extra || {},
            name: 'detecting-room-presence',
            reason: 'Checking presence of the room.'
        });

        function contactInitiator() {
            connection.socket.send({
                messageFor: _config.userid,
                presenceState: signalingHandler.presenceState,
                _config: {
                    userid: _config.userid,
                    extra: _config.extra || {},
                    sessionid: _config.sessionid,
                    session: _config.session || false
                }
            });
        }
        contactInitiator();

        function checker() {
            if (signalingHandler.presenceState === 'checking') {
                warn('Unable to reach initiator. Trying again...');
                contactInitiator();
                setTimeout(function() {
                    if (signalingHandler.presenceState === 'checking') {
                        connection.onstatechange({
                            userid: _config.userid,
                            extra: _config.extra || {},
                            name: 'room-not-available',
                            reason: 'Initiator seems absent. Waiting for someone to open the room.'
                        });

                        connection.isAcceptNewSession = true;
                        setTimeout(checker, 2000);
                    }
                }, 2000);
            }
        }

        setTimeout(checker, 3000);
    };

    connection.donotJoin = function(sessionid) {
        signalingHandler.donotJoin = sessionid;

        var session = connection.sessionDescriptions[sessionid];
        if (!session) {
            return;
        }

        connection.socket.send({
            donotJoin: true,
            messageFor: session.userid,
            sessionid: sessionid
        });

        participants = {};
        connection.isAcceptNewSession = true;
        connection.sessionid = null;
    };

    // send file/data or text message
    this.send = function(message, _channel) {
        if (!(message instanceof ArrayBuffer || message instanceof DataView)) {
            message = str2ab({
                extra: connection.extra,
                userid: connection.userid,
                data: message
            });
        }

        if (_channel) {
            if (_channel.readyState === 'open') {
                _channel.send(message);
            }
            return;
        }

        for (var dataChannel in connection.channels) {
            var channel = connection.channels[dataChannel].channel;
            if (channel.readyState === 'open') {
                channel.send(message);
            }
        }
    };

    // leave session
    this.leave = function() {
        clearSession();
    };

    // renegotiate new stream
    this.addStream = function(e) {
        var session = e.renegotiate;

        if (!connection.renegotiatedSessions[JSON.stringify(e.renegotiate)]) {
            connection.renegotiatedSessions[JSON.stringify(e.renegotiate)] = {
                session: e.renegotiate,
                stream: e.stream
            };
        }

        if (e.socket) {
            if (e.socket.userid !== connection.userid) {
                addStream(connection.peers[e.socket.userid]);
            }
        } else {
            for (var peer in connection.peers) {
                if (peer !== connection.userid) {
                    addStream(connection.peers[peer]);
                }
            }
        }

        function addStream(_peer) {
            var socket = _peer.socket;

            if (!socket) {
                warn(_peer, 'doesn\'t has socket.');
                return;
            }

            updateSocketForLocalStreams(socket);

            if (!_peer || !_peer.peer) {
                throw 'No peer to renegotiate.';
            }

            var peer = _peer.peer;

            if (e.stream) {
                peer.attachStreams = [e.stream];
            }

            // detaching old streams
            detachMediaStream(connection.detachStreams, peer.connection);

            if (e.stream && (session.audio || session.video || session.screen)) {
                // removeStream is not yet implemented in Firefox
                // if(isFirefox) peer.connection.removeStream(e.stream);

                if (isChrome || (isFirefox && !peer.connection.getLocalStreams().length)) {
                    peer.addStream(e.stream);
                }
            }

            // because Firefox has no support of renegotiation yet;
            // so both chrome and firefox should redial instead of renegotiate!
            if (isFirefox || _peer.userinfo.browser === 'firefox') {
                if (connection.attachStreams[0] && connection.attachStreams[0] !== e.stream) {
                    connection.stopMediaStream(connection.attachStreams[0]);
                }

                connection.attachStreams = [e.stream].concat(connection.attachStreams);
                if (_peer.connection) {
                    _peer.connection.close();
                }
                return _peer.redial();
            }

            peer.recreateOffer(session, function(sdp, streaminfo) {
                sendsdp({
                    sdp: sdp,
                    socket: socket,
                    renegotiate: session,
                    labels: connection.detachStreams,
                    streaminfo: streaminfo
                });
                connection.detachStreams = [];
            });
        }
    };

    function acceptRequest(response) {
        if (!signalingHandler.requestsFrom) {
            signalingHandler.requestsFrom = {};
        }

        if (signalingHandler.requestsFrom[response.userid]) {
            return;
        }

        var obj = {
            userid: response.userid,
            extra: response.extra,
            channel: response.channel || response.userid,
            session: response.session || connection.session
        };

        // check how participant is willing to join
        if (response.offers) {
            if (response.offers.audio && response.offers.video) {
                log('target user has both audio/video streams.');
            } else if (response.offers.audio && !response.offers.video) {
                log('target user has only audio stream.');
            } else if (!response.offers.audio && response.offers.video) {
                log('target user has only video stream.');
            } else {
                log('target user has no stream; it seems one-way streaming or data-only connection.');
            }

            var mandatory = connection.sdpConstraints.mandatory;
            if (isNull(mandatory.OfferToReceiveAudio)) {
                connection.sdpConstraints.mandatory.OfferToReceiveAudio = !!response.offers.audio;
            }
            if (isNull(mandatory.OfferToReceiveVideo)) {
                connection.sdpConstraints.mandatory.OfferToReceiveVideo = !!response.offers.video;
            }

            log('target user\'s SDP has?', toStr(connection.sdpConstraints.mandatory));
        }

        signalingHandler.requestsFrom[response.userid] = obj;

        // www.RTCMultiConnection.org/docs/onRequest/
        if (connection.onRequest && connection.isInitiator) {
            connection.onRequest(obj);
        } else {
            _accept(obj);
        }
    }

    function _accept(e) {
        if (signalingHandler.captureUserMediaOnDemand) {
            signalingHandler.captureUserMediaOnDemand = false;
            connection.captureUserMedia(function() {
                _accept(e);

                invokeMediaCaptured(connection);
            });
            return;
        }

        log('accepting request from', e.userid);

        participants[e.userid] = e.userid;
        handlePeersNegotiation({
            isCreateOffer: true,
            userid: e.userid,
            channel: e.channel,
            extra: e.extra || {},
            session: e.session || connection.session
        });

        connection.socket.send({
            acceptedRequestOf: e.userid
        });
    }

    // www.RTCMultiConnection.org/docs/accept/
    connection.accept = function(e) {
        // for backward compatibility
        if (arguments.length > 1 && isString(arguments[0])) {
            e = {};
            if (arguments[0]) {
                e.userid = arguments[0];
            }
            if (arguments[1]) {
                e.extra = arguments[1];
            }
            if (arguments[2]) {
                e.channel = arguments[2];
            }
        }

        connection.captureUserMedia(function() {
            _accept(e);
        });
    };

    var isSignalingHandlerDeleted = false;
    this.disconnect = function() {
        this.isOwnerLeaving = true;

        if (!connection.keepStreamsOpened) {
            for (var streamid in connection.localStreams) {
                connection.localStreams[streamid].stop();
            }
            connection.localStreams = {};

            currentUserMediaRequest = {
                streams: [],
                mutex: false,
                queueRequests: []
            };
        }

        if (connection.isInitiator) {
            connection.socket.send({
                isDisconnectSockets: true
            });
        }

        connection.refresh();

        connection.socket = null;
        isSignalingHandlerDeleted = true;

        connection.ondisconnected({
            userid: connection.userid,
            extra: connection.extra,
            peer: connection.peers[connection.userid],
            isSocketsDisconnected: true
        });

        // if there is any peer still opened; close it.
        connection.close();

        window.removeEventListener('beforeunload', signalingHandler.leaveHandler);
        window.removeEventListener('keyup', signalingHandler.leaveHandler);

        log('Disconnected your sockets, peers, streams and everything except RTCMultiConnection object.');
    };
}
