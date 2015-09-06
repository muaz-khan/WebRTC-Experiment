// RMC === RTCMultiConnection
// usually page-URL is used as channel-id
// you can always override it!
// www.RTCMultiConnection.org/docs/channel-id/
window.RMCDefaultChannel = location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('');

// www.RTCMultiConnection.org/docs/constructor/
window.RTCMultiConnection = function(channel) {
    // an instance of constructor
    var connection = this;

    // a reference to SignalingHandler
    var signalingHandler;

    // setting default channel or channel passed through constructor
    connection.channel = channel || RMCDefaultChannel;

    // to allow single user to join multiple rooms;
    // you can change this property at runtime!
    connection.isAcceptNewSession = true;

    // www.RTCMultiConnection.org/docs/open/
    connection.open = function(args) {
        connection.isAcceptNewSession = false;

        // www.RTCMultiConnection.org/docs/session-initiator/
        // you can always use this property to determine room owner!
        connection.isInitiator = true;

        var dontTransmit = false;

        // a channel can contain multiple rooms i.e. sessions
        if (args) {
            if (isString(args)) {
                connection.sessionid = args;
            } else {
                if (!isNull(args.transmitRoomOnce)) {
                    connection.transmitRoomOnce = args.transmitRoomOnce;
                }

                if (!isNull(args.dontTransmit)) {
                    dontTransmit = args.dontTransmit;
                }

                if (!isNull(args.sessionid)) {
                    connection.sessionid = args.sessionid;
                }
            }
        }

        // if firebase && if session initiator
        if (connection.socket && connection.socket.remove) {
            connection.socket.remove();
        }

        if (!connection.sessionid) {
            connection.sessionid = connection.channel;
        }

        connection.sessionDescription = {
            sessionid: connection.sessionid,
            userid: connection.userid,
            session: connection.session,
            extra: connection.extra
        };

        if (!connection.sessionDescriptions[connection.sessionDescription.sessionid]) {
            connection.numberOfSessions++;
            connection.sessionDescriptions[connection.sessionDescription.sessionid] = connection.sessionDescription;
        }

        // connect with signaling channel
        initSignalingHandler(function() {
            // "captureUserMediaOnDemand" is disabled by default.
            // invoke "getUserMedia" only when first participant found.
            signalingHandler.captureUserMediaOnDemand = args ? !!args.captureUserMediaOnDemand : false;

            if (args && args.onMediaCaptured) {
                connection.onMediaCaptured = args.onMediaCaptured;
            }

            // for session-initiator, user-media is captured as soon as "open" is invoked.
            if (!signalingHandler.captureUserMediaOnDemand) {
                captureUserMedia(function() {
                    signalingHandler.initSession({
                        sessionDescription: connection.sessionDescription,
                        dontTransmit: dontTransmit
                    });

                    invokeMediaCaptured(connection);
                });
            }

            if (signalingHandler.captureUserMediaOnDemand) {
                signalingHandler.initSession({
                    sessionDescription: connection.sessionDescription,
                    dontTransmit: dontTransmit
                });
            }
        });
        return connection.sessionDescription;
    };

    // www.RTCMultiConnection.org/docs/connect/
    connection.connect = function(sessionid) {
        // a channel can contain multiple rooms i.e. sessions
        if (sessionid) {
            connection.sessionid = sessionid;
        }

        // connect with signaling channel
        initSignalingHandler(function() {
            log('Signaling channel is ready.');
        });

        return this;
    };

    // www.RTCMultiConnection.org/docs/join/
    connection.join = joinSession;

    // www.RTCMultiConnection.org/docs/send/
    connection.send = function(data, _channel) {
        if (connection.numberOfConnectedUsers <= 0) {
            // no connections
            setTimeout(function() {
                // try again
                connection.send(data, _channel);
            }, 1000);
            return;
        }

        // send file/data or /text
        if (!data) {
            throw 'No file, data or text message to share.';
        }

        // connection.send([file1, file2, file3])
        // you can share multiple files, strings or data objects using "send" method!
        if (data instanceof Array && !isNull(data[0].size) && !isNull(data[0].type)) {
            // this mechanism can cause failure for subsequent packets/data 
            // on Firefox especially; and on chrome as well!
            // todo: need to use setTimeout instead.
            for (var i = 0; i < data.length; i++) {
                if (data[i].size && data[i].type) {
                    connection.send(data[i], _channel);
                }
            }
            return;
        }

        // File or Blob object MUST have "type" and "size" properties
        if (!isNull(data.size) && !isNull(data.type)) {
            if (!connection.enableFileSharing) {
                throw '"enableFileSharing" boolean MUST be "true" to support file sharing.';
            }

            if (!signalingHandler.fileBufferReader) {
                initFileBufferReader(connection, function(fbr) {
                    signalingHandler.fileBufferReader = fbr;
                    connection.send(data, _channel);
                });
                return;
            }

            var extra = merge({
                userid: connection.userid
            }, data.extra || connection.extra);

            signalingHandler.fileBufferReader.readAsArrayBuffer(data, function(uuid) {
                signalingHandler.fileBufferReader.getNextChunk(uuid, function(nextChunk) {
                    if (_channel) {
                        _channel.send(nextChunk);
                    } else {
                        signalingHandler.send(nextChunk);
                    }
                });
            }, extra);
        } else {
            // to allow longest string messages
            // and largest data objects
            // or anything of any size!
            // to send multiple data objects concurrently!

            TextSender.send({
                text: data,
                channel: signalingHandler,
                _channel: _channel,
                connection: connection
            });
        }
    };

    function initSignalingHandler(onSignalingReady) {
        if (screenFrame) {
            loadScreenFrame();
        }

        // SignalingHandler is the backbone object;
        // this object MUST be initialized once!
        if (signalingHandler) {
            return onSignalingReady();
        }

        // your everything is passed over SignalingHandler constructor!
        signalingHandler = new SignalingHandler(connection, onSignalingReady);
    }

    connection.disconnect = function() {
        if (signalingHandler) {
            signalingHandler.disconnect();
        }
        signalingHandler = null;
    };

    function joinSession(session, joinAs) {
        if (isString(session)) {
            connection.skipOnNewSession = true;
        }

        if (!signalingHandler) {
            log('Signaling channel is not ready. Connecting...');
            // connect with signaling channel
            initSignalingHandler(function() {
                log('Signaling channel is connected. Joining the session again...');
                setTimeout(function() {
                    joinSession(session, joinAs);
                }, 1000);
            });
            return;
        }

        // connection.join('sessionid');
        if (isString(session)) {
            if (connection.sessionDescriptions[session]) {
                session = connection.sessionDescriptions[session];
            } else {
                return setTimeout(function() {
                    log('Session-Descriptions not found. Rechecking..');
                    joinSession(session, joinAs);
                }, 1000);
            }
        }

        // connection.join('sessionid', { audio: true });
        if (joinAs) {
            return captureUserMedia(function() {
                session.oneway = true;
                joinSession(session);
            }, joinAs);
        }

        if (!session || !session.userid || !session.sessionid) {
            error('missing arguments', arguments);

            var err = 'Invalid data passed over "connection.join" method.';
            connection.onstatechange({
                userid: 'browser',
                extra: {},
                name: 'Unexpected data detected.',
                reason: err
            });

            throw err;
        }

        if (!connection.dontOverrideSession) {
            connection.session = session.session;
        }

        var extra = connection.extra || session.extra || {};

        // todo: need to verify that if-block statement works as expected.
        // expectations: if it is oneway streaming; or if it is data-only connection
        // then, it shouldn't capture user-media on participant's side.
        if (session.oneway || isData(session)) {
            signalingHandler.joinSession(session, extra);
        } else {
            captureUserMedia(function() {
                signalingHandler.joinSession(session, extra);
            });
        }
    }

    var isFirstSession = true;

    // www.RTCMultiConnection.org/docs/captureUserMedia/

    function captureUserMedia(callback, _session, dontCheckChromExtension) {
        // capture user's media resources
        var session = _session || connection.session;

        if (isEmpty(session)) {
            if (callback) {
                callback();
            }
            return;
        }

        // you can force to skip media capturing!
        if (connection.dontCaptureUserMedia) {
            return callback();
        }

        // if it is data-only connection
        // if it is one-way connection and current user is participant
        if (isData(session) || (!connection.isInitiator && session.oneway)) {
            // www.RTCMultiConnection.org/docs/attachStreams/
            connection.attachStreams = [];
            return callback();
        }

        var constraints = {
            audio: !!session.audio ? connection.mediaConstraints.audio : false,
            video: !!session.video
        };

        // if custom audio device is selected
        if (connection._mediaSources.audio) {
            constraints.audio.optional.push({
                sourceId: connection._mediaSources.audio
            });
        }

        // if custom video device is selected
        if (connection._mediaSources.video) {
            constraints.video = {
                optional: [{
                    sourceId: connection._mediaSources.video
                }]
            };
        }

        // for connection.session = {};
        if (!session.screen && !constraints.audio && !constraints.video) {
            return callback();
        }

        var screenConstraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: DetectRTC.screen.chromeMediaSource,
                    maxWidth: screen.width > 1920 ? screen.width : 1920,
                    maxHeight: screen.height > 1080 ? screen.height : 1080
                },
                optional: []
            }
        };

        function onIFrameCallback(event) {
            if (event.data && event.data.chromeMediaSourceId) {
                // this event listener is no more needed
                window.removeEventListener('message', onIFrameCallback);

                var sourceId = event.data.chromeMediaSourceId;

                DetectRTC.screen.sourceId = sourceId;
                DetectRTC.screen.chromeMediaSource = 'desktop';

                if (sourceId === 'PermissionDeniedError') {
                    var mediaStreamError = {
                        message: location.protocol === 'https:' ? 'User denied to share content of his screen.' : SCREEN_COMMON_FAILURE,
                        name: 'PermissionDeniedError',
                        constraintName: screenConstraints,
                        session: session
                    };
                    currentUserMediaRequest.mutex = false;
                    DetectRTC.screen.sourceId = null;
                    return connection.onMediaError(mediaStreamError);
                }

                captureUserMedia(callback, _session);
            }

            if (event.data && event.data.chromeExtensionStatus) {
                warn('Screen capturing extension status is:', event.data.chromeExtensionStatus);
                DetectRTC.screen.chromeMediaSource = 'screen';
                captureUserMedia(callback, _session, true);
            }
        }

        if (isFirefox && session.screen) {
            if (location.protocol !== 'https:') {
                return error(SCREEN_COMMON_FAILURE);
            }
            warn(firefoxScreenCapturingWarning);

            screenConstraints.video = merge(screenConstraints.video.mandatory, {
                mozMediaSource: 'window', // mozMediaSource is redundant here
                mediaSource: 'window' // 'screen' || 'window'
            });

            // Firefox is supporting audio+screen from single getUserMedia request
            // audio+video+screen will become audio+screen for Firefox
            // because Firefox isn't supporting multi-streams feature
            if (constraints.audio /* && !session.video */ ) {
                screenConstraints.audio = true;
                constraints = {};
            }

            delete screenConstraints.video.chromeMediaSource;
        }

        // if screen is prompted
        if (session.screen) {
            if (isChrome && DetectRTC.screen.extensionid !== ReservedExtensionID) {
                useCustomChromeExtensionForScreenCapturing = true;
            }

            if (isChrome && !useCustomChromeExtensionForScreenCapturing && !dontCheckChromExtension && !DetectRTC.screen.sourceId) {
                listenEventHandler('message', onIFrameCallback);

                if (!screenFrame) {
                    loadScreenFrame();
                }

                screenFrame.postMessage();
                return;
            }

            // check if screen capturing extension is installed.
            if (isChrome && useCustomChromeExtensionForScreenCapturing && !dontCheckChromExtension && DetectRTC.screen.chromeMediaSource === 'screen' && DetectRTC.screen.extensionid) {
                if (DetectRTC.screen.extensionid === ReservedExtensionID && document.domain.indexOf('webrtc-experiment.com') === -1) {
                    return captureUserMedia(callback, _session, true);
                }

                log('checking if chrome extension is installed.');
                DetectRTC.screen.getChromeExtensionStatus(function(status) {
                    if (status === 'installed-enabled') {
                        DetectRTC.screen.chromeMediaSource = 'desktop';
                    }

                    captureUserMedia(callback, _session, true);
                    log('chrome extension is installed?', DetectRTC.screen.chromeMediaSource === 'desktop');
                });
                return;
            }

            if (isChrome && useCustomChromeExtensionForScreenCapturing && DetectRTC.screen.chromeMediaSource === 'desktop' && !DetectRTC.screen.sourceId) {
                DetectRTC.screen.getSourceId(function(sourceId) {
                    if (sourceId === 'PermissionDeniedError') {
                        var mediaStreamError = {
                            message: 'User denied to share content of his screen.',
                            name: 'PermissionDeniedError',
                            constraintName: screenConstraints,
                            session: session
                        };
                        currentUserMediaRequest.mutex = false;
                        DetectRTC.screen.chromeMediaSource = 'desktop';
                        return connection.onMediaError(mediaStreamError);
                    }

                    if (sourceId === 'No-Response') {
                        error('Chrome extension seems not available. Make sure that manifest.json#L16 has valid content-script matches pointing to your URL.');
                        DetectRTC.screen.chromeMediaSource = 'screen';
                        return captureUserMedia(callback, _session, true);
                    }

                    captureUserMedia(callback, _session, true);
                });
                return;
            }

            if (isChrome && DetectRTC.screen.chromeMediaSource === 'desktop') {
                screenConstraints.video.mandatory.chromeMediaSourceId = DetectRTC.screen.sourceId;
            }

            var _isFirstSession = isFirstSession;

            _captureUserMedia(screenConstraints, constraints.audio || constraints.video ? function() {

                if (_isFirstSession) {
                    isFirstSession = true;
                }

                _captureUserMedia(constraints, callback);
            } : callback);
        } else {
            _captureUserMedia(constraints, callback, session.audio && !session.video);
        }

        function _captureUserMedia(forcedConstraints, forcedCallback, isRemoveVideoTracks, dontPreventSSLAutoAllowed) {
            connection.onstatechange({
                userid: 'browser',
                extra: {},
                name: 'fetching-usermedia',
                reason: 'About to capture user-media with constraints: ' + toStr(forcedConstraints)
            });


            if (connection.preventSSLAutoAllowed && !dontPreventSSLAutoAllowed && isChrome) {
                // if navigator.customGetUserMediaBar.js is missing
                if (!navigator.customGetUserMediaBar) {
                    loadScript(connection.resources.customGetUserMediaBar, function() {
                        _captureUserMedia(forcedConstraints, forcedCallback, isRemoveVideoTracks, dontPreventSSLAutoAllowed);
                    });
                    return;
                }

                navigator.customGetUserMediaBar(forcedConstraints, function() {
                    _captureUserMedia(forcedConstraints, forcedCallback, isRemoveVideoTracks, true);
                }, function() {
                    connection.onMediaError({
                        name: 'PermissionDeniedError',
                        message: 'User denied permission.',
                        constraintName: forcedConstraints,
                        session: session
                    });
                });
                return;
            }

            var mediaConfig = {
                onsuccess: function(stream, returnBack, idInstance, streamid) {
                    onStreamSuccessCallback(stream, returnBack, idInstance, streamid, forcedConstraints, forcedCallback, isRemoveVideoTracks, screenConstraints, constraints, session);
                },
                onerror: function(e, constraintUsed) {
                    var mediaStreamError;

                    // http://goo.gl/hrwF1a
                    if (isFirefox) {
                        if (e === 'PERMISSION_DENIED') {
                            e = {
                                message: '',
                                name: 'PermissionDeniedError',
                                constraintName: constraintUsed,
                                session: session
                            };
                        }
                    }

                    if (isFirefox && constraintUsed.video && constraintUsed.video.mozMediaSource) {
                        mediaStreamError = {
                            message: firefoxScreenCapturingWarning,
                            name: e.name || 'PermissionDeniedError',
                            constraintName: constraintUsed,
                            session: session
                        };

                        connection.onMediaError(mediaStreamError);
                        return;
                    }

                    if (isString(e)) {
                        return connection.onMediaError({
                            message: 'Unknown Error',
                            name: e,
                            constraintName: constraintUsed,
                            session: session
                        });
                    }

                    // it seems that chrome 35+ throws "DevicesNotFoundError" exception 
                    // when any of the requested media is either denied or absent
                    if (e.name && (e.name === 'PermissionDeniedError' || e.name === 'DevicesNotFoundError')) {
                        mediaStreamError = 'Either: ';
                        mediaStreamError += '\n Media resolutions are not permitted.';
                        mediaStreamError += '\n Another application is using same media device.';
                        mediaStreamError += '\n Media device is not attached or drivers not installed.';
                        mediaStreamError += '\n You denied access once and it is still denied.';

                        if (e.message && e.message.length) {
                            mediaStreamError += '\n ' + e.message;
                        }

                        mediaStreamError = {
                            message: mediaStreamError,
                            name: e.name,
                            constraintName: constraintUsed,
                            session: session
                        };

                        connection.onMediaError(mediaStreamError);

                        if (isChrome && (session.audio || session.video)) {
                            // todo: this snippet fails if user has two or more 
                            // microphone/webcam attached.
                            DetectRTC.load(function() {
                                // it is possible to check presence of the microphone before using it!
                                if (session.audio && !DetectRTC.hasMicrophone) {
                                    warn('It seems that you have no microphone attached to your device/system.');
                                    session.audio = session.audio = false;

                                    if (!session.video) {
                                        alert('It seems that you are capturing microphone and there is no device available or access is denied. Reloading...');
                                        location.reload();
                                    }
                                }

                                // it is possible to check presence of the webcam before using it!
                                if (session.video && !DetectRTC.hasWebcam) {
                                    warn('It seems that you have no webcam attached to your device/system.');
                                    session.video = session.video = false;

                                    if (!session.audio) {
                                        alert('It seems that you are capturing webcam and there is no device available or access is denied. Reloading...');
                                        location.reload();
                                    }
                                }

                                if (!DetectRTC.hasMicrophone && !DetectRTC.hasWebcam) {
                                    alert('It seems that either both microphone/webcam are not available or access is denied. Reloading...');
                                    location.reload();
                                } else if (!connection.getUserMediaPromptedOnce) {
                                    // make maximum two tries!
                                    connection.getUserMediaPromptedOnce = true;
                                    captureUserMedia(callback, session);
                                }
                            });
                        }
                    }

                    if (e.name && e.name === 'ConstraintNotSatisfiedError') {
                        mediaStreamError = 'Either: ';
                        mediaStreamError += '\n You are prompting unknown media resolutions.';
                        mediaStreamError += '\n You are using invalid media constraints.';

                        if (e.message && e.message.length) {
                            mediaStreamError += '\n ' + e.message;
                        }

                        mediaStreamError = {
                            message: mediaStreamError,
                            name: e.name,
                            constraintName: constraintUsed,
                            session: session
                        };

                        connection.onMediaError(mediaStreamError);
                    }

                    if (session.screen) {
                        if (isFirefox) {
                            error(firefoxScreenCapturingWarning);
                        } else if (location.protocol !== 'https:') {
                            if (!isNodeWebkit && (location.protocol === 'file:' || location.protocol === 'http:')) {
                                error('You cannot use HTTP or file protocol for screen capturing. You must either use HTTPs or chrome extension page or Node-Webkit page.');
                            }
                        } else {
                            error('Unable to detect actual issue. Maybe "deprecated" screen capturing flag was not set using command line or maybe you clicked "No" button or maybe chrome extension returned invalid "sourceId". Please install chrome-extension: http://bit.ly/webrtc-screen-extension');
                        }
                    }

                    currentUserMediaRequest.mutex = false;

                    // to make sure same stream can be captured again!
                    var idInstance = JSON.stringify(constraintUsed);
                    if (currentUserMediaRequest.streams[idInstance]) {
                        delete currentUserMediaRequest.streams[idInstance];
                    }
                },
                mediaConstraints: connection.mediaConstraints || {}
            };

            mediaConfig.constraints = forcedConstraints || constraints;
            mediaConfig.connection = connection;
            getUserMedia(mediaConfig);
        }
    }

    function onStreamSuccessCallback(stream, returnBack, idInstance, streamid, forcedConstraints, forcedCallback, isRemoveVideoTracks, screenConstraints, constraints, session) {
        if (!streamid) {
            streamid = getRandomString();
        }

        connection.onstatechange({
            userid: 'browser',
            extra: {},
            name: 'usermedia-fetched',
            reason: 'Captured user media using constraints: ' + toStr(forcedConstraints)
        });

        if (isRemoveVideoTracks) {
            stream = convertToAudioStream(stream);
        }

        connection.localStreamids.push(streamid);
        stream.onended = function() {
            if (streamedObject.mediaElement && !streamedObject.mediaElement.parentNode && document.getElementById(stream.streamid)) {
                streamedObject.mediaElement = document.getElementById(stream.streamid);
            }

            // when a stream is stopped; it must be removed from "attachStreams" array
            connection.attachStreams.forEach(function(_stream, index) {
                if (_stream === stream) {
                    delete connection.attachStreams[index];
                    connection.attachStreams = swap(connection.attachStreams);
                }
            });

            onStreamEndedHandler(streamedObject, connection);

            if (connection.streams[streamid]) {
                connection.removeStream(streamid);
            }

            // if user clicks "stop" button to close screen sharing
            var _stream = connection.streams[streamid];
            if (_stream && _stream.sockets.length) {
                _stream.sockets.forEach(function(socket) {
                    socket.send2({
                        streamid: _stream.streamid,
                        stopped: true
                    });
                });
            }

            currentUserMediaRequest.mutex = false;
            // to make sure same stream can be captured again!
            if (currentUserMediaRequest.streams[idInstance]) {
                delete currentUserMediaRequest.streams[idInstance];
            }

            // to allow re-capturing of the screen
            DetectRTC.screen.sourceId = null;

            if (harker) {
                harker.stop();
            }
        };

        if (!isIE) {
            stream.streamid = streamid;
            stream.isScreen = forcedConstraints === screenConstraints;
            stream.isVideo = forcedConstraints === constraints && !!constraints.video;
            stream.isAudio = forcedConstraints === constraints && !!constraints.audio && !constraints.video;

            // if muted stream is negotiated
            stream.preMuted = {
                audio: stream.getAudioTracks().length && !stream.getAudioTracks()[0].enabled,
                video: stream.getVideoTracks().length && !stream.getVideoTracks()[0].enabled
            };
        }

        var mediaElement = createMediaElement(stream, session);
        mediaElement.muted = true;

        var streamedObject = {
            stream: stream,
            streamid: streamid,
            mediaElement: mediaElement,
            blobURL: mediaElement.mozSrcObject ? URL.createObjectURL(stream) : mediaElement.src,
            type: 'local',
            userid: connection.userid,
            extra: connection.extra,
            session: session,
            isVideo: !!stream.isVideo,
            isAudio: !!stream.isAudio,
            isScreen: !!stream.isScreen,
            isInitiator: !!connection.isInitiator,
            rtcMultiConnection: connection
        };

        if (isFirstSession) {
            connection.attachStreams.push(stream);
        }
        isFirstSession = false;

        connection.streams[streamid] = connection._getStream(streamedObject);

        if (!returnBack) {
            connection.onstream(streamedObject);
        }

        if (connection.setDefaultEventsForMediaElement) {
            connection.setDefaultEventsForMediaElement(mediaElement, streamid);
        }

        if (forcedCallback) {
            forcedCallback(stream, streamedObject);
        }

        var harker;
        if (connection.onspeaking) {
            initHark({
                stream: stream,
                streamedObject: streamedObject,
                connection: connection
            }, function(_harker) {
                harker = _harker;
            });
        }
    }

    // www.RTCMultiConnection.org/docs/captureUserMedia/
    connection.captureUserMedia = captureUserMedia;

    // www.RTCMultiConnection.org/docs/leave/
    connection.leave = function(userid) {
        if (!signalingHandler) {
            return;
        }

        isFirstSession = true;

        if (userid) {
            connection.eject(userid);
            return;
        }

        signalingHandler.leave();
    };

    // www.RTCMultiConnection.org/docs/eject/
    connection.eject = function(userid) {
        if (!connection.isInitiator) {
            throw 'Only session-initiator can eject a user.';
        }

        if (!connection.peers[userid]) {
            throw 'You ejected invalid user.';
        }

        connection.peers[userid].sendCustomMessage({
            ejected: true
        });
    };

    // www.RTCMultiConnection.org/docs/close/
    connection.close = function() {
        // close entire session
        connection.autoCloseEntireSession = true;
        connection.leave();
    };

    // www.RTCMultiConnection.org/docs/renegotiate/
    connection.renegotiate = function(stream, session) {
        if (connection.numberOfConnectedUsers <= 0) {
            // no connections
            setTimeout(function() {
                // try again
                connection.renegotiate(stream, session);
            }, 1000);
            return;
        }

        signalingHandler.addStream({
            renegotiate: session || merge({
                oneway: true
            }, connection.session),
            stream: stream
        });
    };

    connection.attachExternalStream = function(stream, isScreen) {
        var constraints = {};
        if (stream.getAudioTracks && stream.getAudioTracks().length) {
            constraints.audio = true;
        }
        if (stream.getVideoTracks && stream.getVideoTracks().length) {
            constraints.video = true;
        }

        var screenConstraints = {
            video: {
                chromeMediaSource: 'external-stream'
            }
        };
        var forcedConstraints = isScreen ? screenConstraints : constraints;
        onStreamSuccessCallback(stream, false, '', null, forcedConstraints, false, false, screenConstraints, constraints, constraints);
    };

    // www.RTCMultiConnection.org/docs/addStream/
    connection.addStream = function(session, socket) {
        // www.RTCMultiConnection.org/docs/renegotiation/

        if (connection.numberOfConnectedUsers <= 0) {
            // no connections
            setTimeout(function() {
                // try again
                connection.addStream(session, socket);
            }, 1000);
            return;
        }

        // renegotiate new media stream
        if (session) {
            var isOneWayStreamFromParticipant;
            if (!connection.isInitiator && session.oneway) {
                session.oneway = false;
                isOneWayStreamFromParticipant = true;
            }

            captureUserMedia(function(stream) {
                if (isOneWayStreamFromParticipant) {
                    session.oneway = true;
                }
                addStream(stream);
            }, session);
        } else {
            addStream();
        }

        function addStream(stream) {
            signalingHandler.addStream({
                stream: stream,
                renegotiate: session || connection.session,
                socket: socket
            });
        }
    };

    // www.RTCMultiConnection.org/docs/removeStream/
    connection.removeStream = function(streamid, dontRenegotiate) {
        if (connection.numberOfConnectedUsers <= 0) {
            // no connections
            setTimeout(function() {
                // try again
                connection.removeStream(streamid, dontRenegotiate);
            }, 1000);
            return;
        }

        function _detachStream(_stream, config) {
            if (config.local && _stream.type !== 'local') {
                return;
            }

            if (config.remote && _stream.type !== 'remote') {
                return;
            }

            // connection.removeStream({screen:true});
            if (config.screen && !!_stream.isScreen) {
                connection.detachStreams.push(_stream.streamid);
            }

            // connection.removeStream({audio:true});
            if (config.audio && !!_stream.isAudio) {
                connection.detachStreams.push(_stream.streamid);
            }

            // connection.removeStream({video:true});
            if (config.video && !!_stream.isVideo) {
                connection.detachStreams.push(_stream.streamid);
            }

            // connection.removeStream({});
            if (!config.audio && !config.video && !config.screen) {
                connection.detachStreams.push(_stream.streamid);
            }

            if (connection.detachStreams.indexOf(_stream.streamid) !== -1) {
                log('removing stream', _stream.streamid);
                onStreamEndedHandler(_stream, connection);

                if (config.stop) {
                    connection.stopMediaStream(_stream.stream);
                }
            }
        }

        if (!streamid) {
            streamid = 'all';
        }

        var stream;
        if (!isString(streamid) || streamid.search(/all|audio|video|screen/gi) !== -1) {
            for (stream in connection.streams) {
                if (connection._skip.indexOf(stream) === -1) {
                    var _stream = connection.streams[stream];

                    if (streamid === 'all') {
                        _detachStream(_stream, {
                            audio: true,
                            video: true,
                            screen: true
                        });
                    } else if (isString(streamid)) {
                        // connection.removeStream('screen');
                        var config = {};
                        config[streamid] = true;
                        _detachStream(_stream, config);
                    } else {
                        _detachStream(_stream, streamid);
                    }
                }
            }

            if (!dontRenegotiate && connection.detachStreams.length) {
                connection.renegotiate();
            }
            return;
        }

        stream = connection.streams[streamid];

        // detach pre-attached streams
        if (!stream) {
            return warn('No such stream exists. Stream-id:', streamid);
        }

        // www.RTCMultiConnection.org/docs/detachStreams/
        connection.detachStreams.push(stream.streamid);

        log('removing stream', stream.streamid);
        onStreamEndedHandler(stream, connection);

        // todo: how to allow "stop" function?
        // connection.stopMediaStream(stream.stream)

        if (!dontRenegotiate) {
            connection.renegotiate();
        }
    };

    connection.switchStream = function(session) {
        if (connection.numberOfConnectedUsers <= 0) {
            // no connections
            setTimeout(function() {
                // try again
                connection.switchStream(session);
            }, 1000);
            return;
        }

        connection.removeStream('all', true);
        connection.addStream(session);
    };

    // www.RTCMultiConnection.org/docs/sendCustomMessage/
    connection.sendCustomMessage = function(message) {
        if (!connection.socket) {
            return setTimeout(function() {
                connection.sendCustomMessage(message);
            }, 1000);
        }

        connection.socket.send({
            customMessage: true,
            message: message
        });
    };

    // www.RTCMultiConnection.org/docs/userid/
    connection.userid = getRandomString();

    // www.RTCMultiConnection.org/docs/session/
    connection.session = {
        audio: true,
        video: true
    };

    // www.RTCMultiConnection.org/docs/maxParticipantsAllowed/
    connection.maxParticipantsAllowed = 256;

    // www.RTCMultiConnection.org/docs/direction/
    // 'many-to-many' / 'one-to-many' / 'one-to-one' / 'one-way'
    connection.direction = 'many-to-many';

    // www.RTCMultiConnection.org/docs/mediaConstraints/
    connection.mediaConstraints = {
        mandatory: {}, // kept for backward compatibility
        optional: [], // kept for backward compatibility
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

    // www.RTCMultiConnection.org/docs/candidates/
    connection.candidates = {
        host: true,
        stun: true,
        turn: true
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

    connection.privileges = {
        canStopRemoteStream: false, // user can stop remote streams
        canMuteRemoteStream: false // user can mute remote streams
    };

    connection.iceProtocols = {
        tcp: true,
        udp: true
    };

    // www.RTCMultiConnection.org/docs/preferSCTP/
    connection.preferSCTP = isFirefox || chromeVersion >= 32 ? true : false;
    connection.chunkInterval = isFirefox || chromeVersion >= 32 ? 100 : 500; // 500ms for RTP and 100ms for SCTP
    connection.chunkSize = isFirefox || chromeVersion >= 32 ? 13 * 1000 : 1000; // 1000 chars for RTP and 13000 chars for SCTP

    // www.RTCMultiConnection.org/docs/fakeDataChannels/
    connection.fakeDataChannels = false;

    connection.waitUntilRemoteStreamStartsFlowing = null; // NULL === true

    // auto leave on page unload
    connection.leaveOnPageUnload = true;

    // get ICE-servers from XirSys
    connection.getExternalIceServers = isChrome;

    // www.RTCMultiConnection.org/docs/UA/
    connection.UA = {
        isFirefox: isFirefox,
        isChrome: isChrome,
        isMobileDevice: isMobileDevice,
        version: isChrome ? chromeVersion : firefoxVersion,
        isNodeWebkit: isNodeWebkit,
        isSafari: isSafari,
        isIE: isIE,
        isOpera: isOpera
    };

    // file queue: to store previous file objects in memory;
    // and stream over newly connected peers
    // www.RTCMultiConnection.org/docs/fileQueue/
    connection.fileQueue = {};

    // this array is aimed to store all renegotiated streams' session-types
    connection.renegotiatedSessions = {};

    // www.RTCMultiConnection.org/docs/channels/
    connection.channels = {};

    // www.RTCMultiConnection.org/docs/extra/
    connection.extra = {};

    // www.RTCMultiConnection.org/docs/bandwidth/
    connection.bandwidth = {
        screen: 300 // 300kbps (dirty workaround)
    };

    // www.RTCMultiConnection.org/docs/caniuse/
    connection.caniuse = {
        RTCPeerConnection: DetectRTC.isWebRTCSupported,
        getUserMedia: !!navigator.webkitGetUserMedia || !!navigator.mozGetUserMedia,
        AudioContext: DetectRTC.isAudioContextSupported,

        // there is no way to check whether "getUserMedia" flag is enabled or not!
        ScreenSharing: DetectRTC.isScreenCapturingSupported,
        RtpDataChannels: DetectRTC.isRtpDataChannelsSupported,
        SctpDataChannels: DetectRTC.isSctpDataChannelsSupported
    };

    // www.RTCMultiConnection.org/docs/snapshots/
    connection.snapshots = {};

    // www.WebRTC-Experiment.com/demos/MediaStreamTrack.getSources.html
    connection._mediaSources = {};

    // www.RTCMultiConnection.org/docs/devices/
    connection.devices = {};

    // www.RTCMultiConnection.org/docs/language/ (to see list of all supported languages)
    connection.language = 'en';

    // www.RTCMultiConnection.org/docs/autoTranslateText/
    connection.autoTranslateText = false;

    // please use your own Google Translate API key
    // Google Translate is a paid service.
    connection.googKey = 'AIzaSyCgB5hmFY74WYB-EoWkhr9cAGr6TiTHrEE';

    connection.localStreamids = [];
    connection.localStreams = {};

    // this object stores pre-recorded media streaming uids
    // multiple pre-recorded media files can be streamed concurrently.
    connection.preRecordedMedias = {};

    // www.RTCMultiConnection.org/docs/attachStreams/
    connection.attachStreams = [];

    // www.RTCMultiConnection.org/docs/detachStreams/
    connection.detachStreams = [];

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

    connection.dataChannelDict = {};

    // www.RTCMultiConnection.org/docs/dontAttachStream/
    connection.dontAttachStream = false;

    // www.RTCMultiConnection.org/docs/dontCaptureUserMedia/
    connection.dontCaptureUserMedia = false;

    // this feature added to keep users privacy and 
    // make sure HTTPs pages NEVER auto capture users media
    // isChrome && location.protocol === 'https:'
    connection.preventSSLAutoAllowed = false;

    connection.autoReDialOnFailure = true;
    connection.isInitiator = false;

    // access DetectRTC.js features directly!
    connection.DetectRTC = DetectRTC;

    // you can falsify it to merge all ICE in SDP and share only SDP!
    // such mechanism is useful for SIP/XMPP and XMLHttpRequest signaling
    // bug: renegotiation fails if "trickleIce" is false
    connection.trickleIce = true;

    // this object stores list of all sessions in current channel
    connection.sessionDescriptions = {};

    // this object stores current user's session-description
    // it is set only for initiator
    // it is set as soon as "open" method is invoked.
    connection.sessionDescription = null;

    // resources used in RTCMultiConnection
    connection.resources = {
        RecordRTC: 'https://cdn.webrtc-experiment.com/RecordRTC.js',
        PreRecordedMediaStreamer: 'https://cdn.webrtc-experiment.com/PreRecordedMediaStreamer.js',
        customGetUserMediaBar: 'https://cdn.webrtc-experiment.com/navigator.customGetUserMediaBar.js',
        html2canvas: 'https://cdn.webrtc-experiment.com/screenshot.js',
        hark: 'https://cdn.webrtc-experiment.com/hark.js',
        firebase: 'https://cdn.webrtc-experiment.com/firebase.js',
        firebaseio: 'https://webrtc-experiment.firebaseIO.com/',
        muted: 'https://cdn.webrtc-experiment.com/images/muted.png',
        getConnectionStats: 'https://cdn.webrtc-experiment.com/getConnectionStats.js',
        FileBufferReader: 'https://cdn.webrtc-experiment.com/FileBufferReader.js'
    };

    // www.RTCMultiConnection.org/docs/body/
    connection.body = document.body || document.documentElement;

    // www.RTCMultiConnection.org/docs/peers/
    connection.peers = {};

    // www.RTCMultiConnection.org/docs/firebase/
    connection.firebase = 'chat';

    connection.numberOfSessions = 0;
    connection.numberOfConnectedUsers = 0;

    // by default, data-connections will always be getting
    // FileBufferReader.js if absent.
    connection.enableFileSharing = true;

    // www.RTCMultiConnection.org/docs/autoSaveToDisk/
    // to make sure file-saver dialog is not invoked.
    connection.autoSaveToDisk = false;

    connection.processSdp = function(sdp) {
        // process sdp here
        return sdp;
    };

    // www.RTCMultiConnection.org/docs/onmessage/
    connection.onmessage = function(e) {
        log('onmessage', toStr(e));
    };

    // www.RTCMultiConnection.org/docs/onopen/
    connection.onopen = function(e) {
        log('Data connection is opened between you and', e.userid);
    };

    // www.RTCMultiConnection.org/docs/onerror/
    connection.onerror = function(e) {
        error(onerror, toStr(e));
    };

    // www.RTCMultiConnection.org/docs/onclose/
    connection.onclose = function(e) {
        warn('onclose', toStr(e));

        // todo: should we use "stop" or "remove"?
        // BTW, it is remote user!
        connection.streams.remove({
            userid: e.userid
        });
    };

    var progressHelper = {};

    // www.RTCMultiConnection.org/docs/onFileStart/
    connection.onFileStart = function(file) {
        var div = document.createElement('div');
        div.title = file.name;
        div.innerHTML = '<label>0%</label> <progress></progress>';
        connection.body.insertBefore(div, connection.body.firstChild);
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
        if (progressHelper[file.uuid]) {
            progressHelper[file.uuid].div.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';
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

    // www.RTCMultiConnection.org/docs/onstream/
    connection.onstream = function(e) {
        connection.body.insertBefore(e.mediaElement, connection.body.firstChild);
    };

    // www.RTCMultiConnection.org/docs/onStreamEndedHandler/
    connection.onstreamended = function(e) {
        log('onStreamEndedHandler:', e);

        if (!e.mediaElement) {
            return warn('Event.mediaElement is undefined', e);
        }
        if (!e.mediaElement.parentNode) {
            e.mediaElement = document.getElementById(e.streamid);

            if (!e.mediaElement) {
                return warn('Event.mediaElement is undefined', e);
            }

            if (!e.mediaElement.parentNode) {
                return warn('Event.mediElement.parentNode is null.', e);
            }
        }

        e.mediaElement.parentNode.removeChild(e.mediaElement);
    };

    // todo: need to write documentation link
    connection.onSessionClosed = function(session) {
        if (session.isEjected) {
            warn(session.userid, 'ejected you.');
        } else {
            warn('Session has been closed.', session);
        }
    };

    // www.RTCMultiConnection.org/docs/onmute/
    connection.onmute = function(e) {
        if (e.isVideo && e.mediaElement) {
            e.mediaElement.pause();
            e.mediaElement.setAttribute('poster', e.snapshot || connection.resources.muted);
        }
        if (e.isAudio && e.mediaElement) {
            e.mediaElement.muted = true;
        }
    };

    // www.RTCMultiConnection.org/docs/onunmute/
    connection.onunmute = function(e) {
        if (e.isVideo && e.mediaElement) {
            e.mediaElement.play();
            e.mediaElement.removeAttribute('poster');
        }
        if (e.isAudio && e.mediaElement) {
            e.mediaElement.muted = false;
        }
    };

    // www.RTCMultiConnection.org/docs/onleave/
    connection.onleave = function(e) {
        log('onleave', toStr(e));
    };

    connection.token = getRandomString;

    connection.peers[connection.userid] = {
        drop: function() {
            connection.drop();
        },
        renegotiate: function() {},
        addStream: function() {},
        hold: function() {},
        unhold: function() {},
        changeBandwidth: function() {},
        sharePartOfScreen: function() {}
    };

    connection._skip = ['stop', 'mute', 'unmute', '_private', '_selectStreams', 'selectFirst', 'selectAll', 'remove'];

    // www.RTCMultiConnection.org/docs/streams/
    connection.streams = {
        mute: function(session) {
            this._private(session, true);
        },
        unmute: function(session) {
            this._private(session, false);
        },
        _private: function(session, enabled) {
            function _muteOrUnMute(stream, session, isMute) {
                if (session.local && stream.type !== 'local') {
                    return;
                }
                if (session.remote && stream.type !== 'remote') {
                    return;
                }

                if (session.screen && !stream.isScreen) {
                    return;
                }

                // stream.getAudioTracks().length ?
                if (session.audio && !stream.isAudio) {
                    return;
                }

                if (session.video && !stream.isVideo) {
                    return;
                }

                if (isMute) {
                    stream.mute(session);
                } else {
                    stream.unmute(session);
                }
            }

            var stream;

            if (session && !isString(session)) {
                for (stream in this) {
                    if (connection._skip.indexOf(stream) === -1) {
                        _muteOrUnMute(this[stream], session, enabled);
                    }
                }
                return;
            }

            // implementation from #68
            for (stream in this) {
                if (connection._skip.indexOf(stream) === -1) {
                    this[stream]._private(session, enabled);
                }
            }
        },
        stop: function(type) {
            var _stream;
            for (var stream in this) {
                if (connection._skip.indexOf(stream) === -1) {
                    _stream = this[stream];

                    if (!type) {
                        _stream.stop();
                    } else if (isString(type)) {
                        // connection.streams.stop('screen');
                        var config = {};
                        config[type] = true;
                        _stopStream(_stream, config);
                    } else {
                        _stopStream(_stream, type);
                    }
                }
            }

            function _stopStream(_stream, config) {
                // connection.streams.stop({ remote: true, userid: 'remote-userid' });
                if (config.userid && _stream.userid !== config.userid) {
                    return;
                }

                if (config.local && _stream.type !== 'local') {
                    return;
                }
                if (config.remote && _stream.type !== 'remote') {
                    return;
                }

                if (config.screen && !!_stream.isScreen) {
                    _stream.stop();
                }

                if (config.audio && !!_stream.isAudio) {
                    _stream.stop();
                }

                if (config.video && !!_stream.isVideo) {
                    _stream.stop();
                }

                // connection.streams.stop('local');
                if (!config.audio && !config.video && !config.screen) {
                    _stream.stop();
                }
            }
        },
        remove: function(type) {
            var _stream;
            for (var stream in this) {
                if (connection._skip.indexOf(stream) === -1) {
                    _stream = this[stream];

                    if (!type) {
                        _stopAndRemoveStream(_stream, {
                            local: true,
                            remote: true
                        });
                    } else if (isString(type)) {
                        // connection.streams.stop('screen');
                        var config = {};
                        config[type] = true;
                        _stopAndRemoveStream(_stream, config);
                    } else {
                        _stopAndRemoveStream(_stream, type);
                    }
                }
            }

            function _stopAndRemoveStream(_stream, config) {
                // connection.streams.remove({ remote: true, userid: 'remote-userid' });
                if (config.userid && _stream.userid !== config.userid) {
                    return;
                }

                if (config.local && _stream.type !== 'local') {
                    return;
                }
                if (config.remote && _stream.type !== 'remote') {
                    return;
                }

                if (config.screen && !!_stream.isScreen) {
                    endStream(_stream);
                }

                if (config.audio && !!_stream.isAudio) {
                    endStream(_stream);
                }

                if (config.video && !!_stream.isVideo) {
                    endStream(_stream);
                }

                // connection.streams.remove('local');
                if (!config.audio && !config.video && !config.screen) {
                    endStream(_stream);
                }
            }

            function endStream(_stream) {
                onStreamEndedHandler(_stream, connection);
                delete connection.streams[_stream.streamid];
            }
        },
        selectFirst: function(args) {
            return this._selectStreams(args, false);
        },
        selectAll: function(args) {
            return this._selectStreams(args, true);
        },
        _selectStreams: function(args, all) {
            if (!args || isString(args) || isEmpty(args)) {
                throw 'Invalid arguments.';
            }

            // if userid is used then both local/remote shouldn't be auto-set
            if (isNull(args.local) && isNull(args.remote) && isNull(args.userid)) {
                args.local = args.remote = true;
            }

            if (!args.isAudio && !args.isVideo && !args.isScreen) {
                args.isAudio = args.isVideo = args.isScreen = true;
            }

            var selectedStreams = [];
            for (var stream in this) {
                if (connection._skip.indexOf(stream) === -1 && (stream = this[stream]) && ((args.local && stream.type === 'local') || (args.remote && stream.type === 'remote') || (args.userid && stream.userid === args.userid))) {
                    if (args.isVideo && stream.isVideo) {
                        selectedStreams.push(stream);
                    }

                    if (args.isAudio && stream.isAudio) {
                        selectedStreams.push(stream);
                    }

                    if (args.isScreen && stream.isScreen) {
                        selectedStreams.push(stream);
                    }
                }
            }

            return !!all ? selectedStreams : selectedStreams[0];
        }
    };

    var iceServers = [];

    iceServers.push({
        url: 'stun:stun.l.google.com:19302'
    });

    iceServers.push({
        url: 'stun:stun.anyfirewall.com:3478'
    });

    iceServers.push({
        url: 'turn:turn.bistri.com:80',
        credential: 'homeo',
        username: 'homeo'
    });

    iceServers.push({
        url: 'turn:turn.anyfirewall.com:443?transport=tcp',
        credential: 'webrtc',
        username: 'webrtc'
    });

    connection.iceServers = iceServers;

    connection.rtcConfiguration = {
        iceServers: null,
        iceTransports: 'all', // none || relay || all - ref: http://goo.gl/40I39K
        peerIdentity: false
    };

    // www.RTCMultiConnection.org/docs/media/
    connection.media = {
        min: function(width, height) {
            if (!connection.mediaConstraints.video) {
                return;
            }

            if (!connection.mediaConstraints.video.mandatory) {
                connection.mediaConstraints.video.mandatory = {};
            }
            connection.mediaConstraints.video.mandatory.minWidth = width;
            connection.mediaConstraints.video.mandatory.minHeight = height;
        },
        max: function(width, height) {
            if (!connection.mediaConstraints.video) {
                return;
            }

            if (!connection.mediaConstraints.video.mandatory) {
                connection.mediaConstraints.video.mandatory = {};
            }

            connection.mediaConstraints.video.mandatory.maxWidth = width;
            connection.mediaConstraints.video.mandatory.maxHeight = height;
        }
    };

    connection._getStream = function(event) {
        var resultingObject = merge({
            sockets: event.socket ? [event.socket] : []
        }, event);

        resultingObject.stop = function() {
            var self = this;

            self.sockets.forEach(function(socket) {
                if (self.type === 'local') {
                    socket.send2({
                        streamid: self.streamid,
                        stopped: true
                    });
                }

                if (self.type === 'remote') {
                    socket.send2({
                        promptStreamStop: true,
                        streamid: self.streamid
                    });
                }
            });

            if (self.type === 'remote') {
                return;
            }

            var stream = self.stream;
            if (stream) {
                self.rtcMultiConnection.stopMediaStream(stream);
            }
        };

        resultingObject.mute = function(session) {
            this.muted = true;
            this._private(session, true);
        };

        resultingObject.unmute = function(session) {
            this.muted = false;
            this._private(session, false);
        };

        function muteOrUnmuteLocally(isPause, mediaElement) {
            if (!mediaElement) {
                return;
            }

            var lastPauseState = mediaElement.onpause;
            var lastPlayState = mediaElement.onplay;
            mediaElement.onpause = mediaElement.onplay = function() {};

            if (isPause) {
                mediaElement.pause();
            } else {
                mediaElement.play();
            }

            mediaElement.onpause = lastPauseState;
            mediaElement.onplay = lastPlayState;
        }

        resultingObject._private = function(session, enabled) {
            if (session && !isNull(session.sync) && session.sync === false) {
                muteOrUnmuteLocally(enabled, this.mediaElement);
                return;
            }

            muteOrUnmute({
                root: this,
                session: session,
                enabled: enabled,
                stream: this.stream
            });
        };

        resultingObject.startRecording = function(session) {
            var self = this;

            if (!session) {
                session = {
                    audio: true,
                    video: true
                };
            }

            if (isString(session)) {
                session = {
                    audio: session === 'audio',
                    video: session === 'video'
                };
            }

            if (!window.RecordRTC) {
                return loadScript(self.rtcMultiConnection.resources.RecordRTC, function() {
                    self.startRecording(session);
                });
            }

            log('started recording session', session);

            self.videoRecorder = self.audioRecorder = null;

            if (isFirefox) {
                // firefox supports both audio/video recording in single webm file
                if (session.video) {
                    self.videoRecorder = new window.RecordRTC(self.stream, {
                        type: 'video'
                    });
                } else if (session.audio) {
                    self.audioRecorder = new window.RecordRTC(self.stream, {
                        type: 'audio'
                    });
                }
            } else if (isChrome) {
                // chrome supports recording in two separate files: WAV and WebM
                if (session.video) {
                    self.videoRecorder = new window.RecordRTC(self.stream, {
                        type: 'video'
                    });
                }

                if (session.audio) {
                    self.audioRecorder = new window.RecordRTC(self.stream, {
                        type: 'audio'
                    });
                }
            }

            if (self.audioRecorder) {
                self.audioRecorder.startRecording();
            }

            if (self.videoRecorder) {
                self.videoRecorder.startRecording();
            }
        };

        resultingObject.stopRecording = function(callback, session) {
            if (!session) {
                session = {
                    audio: true,
                    video: true
                };
            }

            if (isString(session)) {
                session = {
                    audio: session === 'audio',
                    video: session === 'video'
                };
            }

            log('stopped recording session', session);

            var self = this;

            if (session.audio && self.audioRecorder) {
                self.audioRecorder.stopRecording(function() {
                    if (session.video && self.videoRecorder) {
                        self.videoRecorder.stopRecording(function() {
                            callback({
                                audio: self.audioRecorder.getBlob(),
                                video: self.videoRecorder.getBlob()
                            });
                        });
                    } else {
                        callback({
                            audio: self.audioRecorder.getBlob()
                        });
                    }
                });
            } else if (session.video && self.videoRecorder) {
                self.videoRecorder.stopRecording(function() {
                    callback({
                        video: self.videoRecorder.getBlob()
                    });
                });
            }
        };

        resultingObject.takeSnapshot = function(callback) {
            takeSnapshot({
                mediaElement: this.mediaElement,
                userid: this.userid,
                connection: connection,
                callback: callback
            });
        };

        // redundant: kept only for backward compatibility
        resultingObject.streamObject = resultingObject;

        return resultingObject;
    };

    // new RTCMultiConnection().set({properties}).connect()
    connection.set = function(properties) {
        for (var property in properties) {
            this[property] = properties[property];
        }
        return this;
    };

    // www.RTCMultiConnection.org/docs/onMediaError/
    connection.onMediaError = function(event) {
        error('name', event.name);
        error('constraintName', toStr(event.constraintName));
        error('message', event.message);
        error('original session', event.session);
    };

    // www.RTCMultiConnection.org/docs/takeSnapshot/
    connection.takeSnapshot = function(userid, callback) {
        takeSnapshot({
            userid: userid,
            connection: connection,
            callback: callback
        });
    };

    connection.saveToDisk = function(blob, fileName) {
        if (blob.size && blob.type) {
            FileSaver.SaveToDisk(URL.createObjectURL(blob), fileName || blob.name || blob.type.replace('/', '-') + blob.type.split('/')[1]);
        } else {
            FileSaver.SaveToDisk(blob, fileName);
        }
    };

    // www.RTCMultiConnection.org/docs/selectDevices/
    connection.selectDevices = function(device1, device2) {
        if (device1) {
            select(this.devices[device1]);
        }

        if (device2) {
            select(this.devices[device2]);
        }

        function select(device) {
            if (!device) {
                return;
            }
            connection._mediaSources[device.kind] = device.id;
        }
    };

    // www.RTCMultiConnection.org/docs/getDevices/
    connection.getDevices = function(callback) {
        // if, not yet fetched.
        if (!DetectRTC.MediaDevices.length) {
            return setTimeout(function() {
                connection.getDevices(callback);
            }, 1000);
        }

        // loop over all audio/video input/output devices
        DetectRTC.MediaDevices.forEach(function(device) {
            connection.devices[device.deviceId] = device;
        });

        if (callback) {
            callback(connection.devices);
        }
    };

    connection.getMediaDevices = connection.enumerateDevices = function(callback) {
        if (!callback) {
            throw 'callback is mandatory.';
        }
        connection.getDevices(function() {
            callback(connection.DetectRTC.MediaDevices);
        });
    };

    // www.RTCMultiConnection.org/docs/onCustomMessage/
    connection.onCustomMessage = function(message) {
        log('Custom message', message);
    };

    // www.RTCMultiConnection.org/docs/ondrop/
    connection.ondrop = function(droppedBy) {
        log('Media connection is dropped by ' + droppedBy);
    };

    // www.RTCMultiConnection.org/docs/drop/
    connection.drop = function(config) {
        config = config || {};
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

        // www.RTCMultiConnection.org/docs/sendCustomMessage/
        connection.sendCustomMessage({
            drop: true,
            dontRenegotiate: isNull(config.renegotiate) ? true : config.renegotiate
        });
    };

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

    // you can easily override it by setting it NULL!
    connection.setDefaultEventsForMediaElement = function(mediaElement, streamid) {
        mediaElement.onpause = function() {
            if (connection.streams[streamid] && !connection.streams[streamid].muted) {
                connection.streams[streamid].mute();
            }
        };

        // todo: need to make sure that "onplay" EVENT doesn't play self-voice!
        mediaElement.onplay = function() {
            if (connection.streams[streamid] && connection.streams[streamid].muted) {
                connection.streams[streamid].unmute();
            }
        };

        var volumeChangeEventFired = false;
        mediaElement.onvolumechange = function() {
            if (!!volumeChangeEventFired) {
                return;
            }

            volumeChangeEventFired = true;

            if (!connection.streams[streamid]) {
                return;
            }

            setTimeout(function() {
                var root = connection.streams[streamid];
                connection.streams[streamid].sockets.forEach(function(socket) {
                    socket.send2({
                        streamid: root.streamid,
                        isVolumeChanged: true,
                        volume: mediaElement.volume
                    });
                });
                volumeChangeEventFired = false;
            }, 2000);
        };
    };

    // www.RTCMultiConnection.org/docs/onMediaFile/
    connection.onMediaFile = function(e) {
        log('onMediaFile', e);
        connection.body.appendChild(e.mediaElement);
    };

    // www.RTCMultiConnection.org/docs/shareMediaFile/
    // this method handles pre-recorded media streaming
    connection.shareMediaFile = function(file, video, streamerid) {
        streamerid = streamerid || connection.token();

        if (!window.PreRecordedMediaStreamer) {
            loadScript(connection.resources.PreRecordedMediaStreamer, function() {
                connection.shareMediaFile(file, video, streamerid);
            });
            return streamerid;
        }

        return window.PreRecordedMediaStreamer.shareMediaFile({
            file: file,
            video: video,
            streamerid: streamerid,
            connection: connection
        });
    };

    // www.RTCMultiConnection.org/docs/onpartofscreen/
    connection.onpartofscreen = function(e) {
        var image = document.createElement('img');
        image.src = e.screenshot;
        connection.body.appendChild(image);
    };

    connection.skipLogs = function() {
        log = error = warn = function() {};
    };

    // www.RTCMultiConnection.org/docs/hold/
    connection.hold = function(mLine) {
        for (var peer in connection.peers) {
            connection.peers[peer].hold(mLine);
        }
    };

    // www.RTCMultiConnection.org/docs/onhold/
    connection.onhold = function(track) {
        log('onhold', track);

        if (track.kind !== 'audio') {
            track.mediaElement.pause();
            track.mediaElement.setAttribute('poster', track.screenshot || connection.resources.muted);
        }
        if (track.kind === 'audio') {
            track.mediaElement.muted = true;
        }
    };

    // www.RTCMultiConnection.org/docs/unhold/
    connection.unhold = function(mLine) {
        for (var peer in connection.peers) {
            connection.peers[peer].unhold(mLine);
        }
    };

    // www.RTCMultiConnection.org/docs/onunhold/
    connection.onunhold = function(track) {
        log('onunhold', track);

        if (track.kind !== 'audio') {
            track.mediaElement.play();
            track.mediaElement.removeAttribute('poster');
        }
        if (track.kind !== 'audio') {
            track.mediaElement.muted = false;
        }
    };

    connection.sharePartOfScreen = function(args) {
        var lastScreenshot = '';

        function partOfScreenCapturer() {
            // if stopped
            if (connection.partOfScreen && !connection.partOfScreen.sharing) {
                return;
            }

            capturePartOfScreen({
                element: args.element,
                connection: connection,
                callback: function(screenshot) {
                    // don't share repeated content
                    if (screenshot !== lastScreenshot) {
                        lastScreenshot = screenshot;

                        for (var channel in connection.channels) {
                            connection.channels[channel].send({
                                screenshot: screenshot,
                                isPartOfScreen: true
                            });
                        }
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

        connection.partOfScreen = merge({
            sharing: true
        }, args);
    };

    connection.pausePartOfScreenSharing = function() {
        for (var peer in connection.peers) {
            connection.peers[peer].pausePartOfScreenSharing = true;
        }

        if (connection.partOfScreen) {
            connection.partOfScreen.sharing = false;
        }
    };

    connection.resumePartOfScreenSharing = function() {
        for (var peer in connection.peers) {
            connection.peers[peer].pausePartOfScreenSharing = false;
        }

        if (connection.partOfScreen) {
            connection.partOfScreen.sharing = true;
        }
    };

    connection.stopPartOfScreenSharing = function() {
        for (var peer in connection.peers) {
            connection.peers[peer].stopPartOfScreenSharing = true;
        }

        if (connection.partOfScreen) {
            connection.partOfScreen.sharing = false;
        }
    };

    connection.takeScreenshot = function(element, callback) {
        if (!element || !callback) {
            throw 'Invalid number of arguments.';
        }

        if (!window.html2canvas) {
            return loadScript(connection.resources.html2canvas, function() {
                connection.takeScreenshot(element);
            });
        }

        if (isString(element)) {
            element = document.querySelector(element);
            if (!element) {
                element = document.getElementById(element);
            }
        }
        if (!element) {
            throw 'HTML Element is inaccessible!';
        }

        // html2canvas.js is used to take screenshots
        window.html2canvas(element, {
            onrendered: function(canvas) {
                callback(canvas.toDataURL());
            }
        });
    };

    // this event is fired when RTCMultiConnection detects that chrome extension
    // for screen capturing is installed and available
    connection.onScreenCapturingExtensionAvailable = function() {
        log('It seems that screen capturing extension is installed and available on your system!');
    };

    if (!isPluginRTC && DetectRTC.screen.onScreenCapturingExtensionAvailable) {
        DetectRTC.screen.onScreenCapturingExtensionAvailable = function() {
            connection.onScreenCapturingExtensionAvailable();
        };
    }

    connection.changeBandwidth = function(bandwidth) {
        for (var peer in connection.peers) {
            connection.peers[peer].changeBandwidth(bandwidth);
        }
    };

    connection.convertToAudioStream = function(mediaStream) {
        convertToAudioStream(mediaStream);
    };

    connection.onstatechange = function(state) {
        log('on:state:change (' + state.userid + '):', state.name + ':', state.reason || '');
    };

    connection.onfailed = function(event) {
        if (!event.peer.numOfRetries) {
            event.peer.numOfRetries = 0;
        }

        event.peer.numOfRetries++;

        if (event.peer.numOfRetries > 2) {
            event.peer.numOfRetries = 0;
            return;
        }

        if (isFirefox || event.targetuser.browser === 'firefox') {
            error('ICE connectivity check is failed. Re-establishing peer connection.');
            event.peer.redial();
        } else {
            error('ICE connectivity check is failed. Renegotiating peer connection.');
            event.peer.renegotiate();
        }
    };

    connection.onconnected = function(event) {
        // event.peer.addStream || event.peer.getConnectionStats
        log('Peer connection has been established between you and', event.userid);
    };

    connection.ondisconnected = function(event) {
        error('Peer connection seems has been disconnected between you and', event.userid);

        if (isEmpty(connection.channels)) {
            return;
        }
        if (!connection.channels[event.userid]) {
            return;
        }

        // use WebRTC data channels to detect user's presence
        connection.channels[event.userid].send({
            checkingPresence: true
        });

        // wait 5 seconds, if target peer didn't response, simply disconnect
        setTimeout(function() {
            // iceConnectionState === 'disconnected' occurred out of low-bandwidth
            // or internet connectivity issues
            if (connection.peers[event.userid].connected) {
                delete connection.peers[event.userid].connected;
                return;
            }

            // to make sure this user's all remote streams are removed.
            connection.streams.remove({
                remote: true,
                userid: event.userid
            });

            connection.remove(event.userid);
        }, 3000);
    };

    connection.onstreamid = function(event) {
        // event.isScreen || event.isVideo || event.isAudio
        log('got remote streamid', event.streamid, 'from', event.userid);
    };

    connection.stopMediaStream = function(mediaStream) {
        if (!mediaStream) {
            throw 'MediaStream argument is mandatory.';
        }

        if (connection.keepStreamsOpened) {
            if (mediaStream.onended) {
                mediaStream.onended();
            }
            return;
        }

        // remove stream from "localStreams" object
        // when native-stop method invoked.
        if (connection.localStreams[mediaStream.streamid]) {
            delete connection.localStreams[mediaStream.streamid];
        }

        if (isFirefox) {
            // Firefox don't yet support onended for any stream (remote/local)
            if (mediaStream.onended) {
                mediaStream.onended();
            }
        }

        // Latest firefox does support mediaStream.getAudioTrack but doesn't support stop on MediaStreamTrack
        var checkForMediaStreamTrackStop = Boolean(
            (mediaStream.getAudioTracks || mediaStream.getVideoTracks) && (
                (mediaStream.getAudioTracks()[0] && !mediaStream.getAudioTracks()[0].stop) ||
                (mediaStream.getVideoTracks()[0] && !mediaStream.getVideoTracks()[0].stop)
            )
        );

        if (!mediaStream.getAudioTracks || checkForMediaStreamTrackStop) {
            if (mediaStream.stop) {
                mediaStream.stop();
            }
            return;
        }

        if (mediaStream.getAudioTracks().length && mediaStream.getAudioTracks()[0].stop) {
            mediaStream.getAudioTracks().forEach(function(track) {
                track.stop();
            });
        }

        if (mediaStream.getVideoTracks().length && mediaStream.getVideoTracks()[0].stop) {
            mediaStream.getVideoTracks().forEach(function(track) {
                track.stop();
            });
        }
    };

    connection.changeBandwidth = function(bandwidth) {
        if (!bandwidth || isString(bandwidth) || isEmpty(bandwidth)) {
            throw 'Invalid "bandwidth" arguments.';
        }

        forEach(connection.peers, function(peer) {
            peer.peer.bandwidth = bandwidth;
        });

        connection.renegotiate();
    };

    // www.RTCMultiConnection.org/docs/openSignalingChannel/
    // http://goo.gl/uvoIcZ
    connection.openSignalingChannel = function(config) {
        // make sure firebase.js is loaded
        if (!window.Firebase) {
            return loadScript(connection.resources.firebase, function() {
                connection.openSignalingChannel(config);
            });
        }

        var channel = config.channel || connection.channel;

        if (connection.firebase) {
            // for custom firebase instances
            connection.resources.firebaseio = connection.resources.firebaseio.replace('//chat.', '//' + connection.firebase + '.');
        }

        var firebase = new window.Firebase(connection.resources.firebaseio + channel);
        firebase.channel = channel;
        firebase.on('child_added', function(data) {
            config.onmessage(data.val());
        });

        firebase.send = function(data) {
            // a quick dirty workaround to make sure firebase
            // shouldn't fail for NULL values.
            for (var prop in data) {
                if (isNull(data[prop]) || typeof data[prop] === 'function') {
                    data[prop] = false;
                }
            }

            this.push(data);
        };

        if (!connection.socket) {
            connection.socket = firebase;
        }

        firebase.onDisconnect().remove();

        setTimeout(function() {
            config.callback(firebase);
        }, 1);
    };

    connection.Plugin = Plugin;
};
