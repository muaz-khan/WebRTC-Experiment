// RMC == RTCMultiConnection
// usually page-URL is used as channel-id
// you can always override it!
// www.RTCMultiConnection.org/docs/channel-id/
window.RMCDefaultChannel = location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('');

// www.RTCMultiConnection.org/docs/constructor/
window.RTCMultiConnection = function(channel) {
    // an instance of constructor
    var connection = this;

    // a reference to RTCMultiSession
    var rtcMultiSession;

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

        if (!connection.sessionid) connection.sessionid = connection.channel;
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
        initRTCMultiSession(function() {
            // "captureUserMediaOnDemand" is disabled by default.
            // invoke "getUserMedia" only when first participant found.
            rtcMultiSession.captureUserMediaOnDemand = args ? !!args.captureUserMediaOnDemand : false;

            if (args && args.onMediaCaptured) {
                connection.onMediaCaptured = args.onMediaCaptured;
            }

            // for session-initiator, user-media is captured as soon as "open" is invoked.
            if (!rtcMultiSession.captureUserMediaOnDemand) captureUserMedia(function() {
                rtcMultiSession.initSession({
                    sessionDescription: connection.sessionDescription,
                    dontTransmit: dontTransmit
                });

                invokeMediaCaptured(connection);
            });

            if (rtcMultiSession.captureUserMediaOnDemand) {
                rtcMultiSession.initSession({
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
        initRTCMultiSession(function() {
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
        if (!data)
            throw 'No file, data or text message to share.';

        // connection.send([file1, file2, file3])
        // you can share multiple files, strings or data objects using "send" method!
        if (data instanceof Array && !isNull(data[0].size) && !isNull(data[0].type)) {
            // this mechanism can cause failure for subsequent packets/data 
            // on Firefox especially; and on chrome as well!
            // todo: need to use setTimeout instead.
            for (var i = 0; i < data.length; i++) {
                data[i].size && data[i].type && connection.send(data[i], _channel);
            }
            return;
        }

        // File or Blob object MUST have "type" and "size" properties
        if (!isNull(data.size) && !isNull(data.type)) {
            if (!connection.enableFileSharing) {
                throw '"enableFileSharing" boolean MUST be "true" to support file sharing.';
            }

            if (!rtcMultiSession.fileBufferReader) {
                initFileBufferReader(connection, function(fbr) {
                    rtcMultiSession.fileBufferReader = fbr;
                    connection.send(data, _channel);
                });
                return;
            }

            var extra = merge({
                userid: connection.userid
            }, data.extra || connection.extra);

            rtcMultiSession.fileBufferReader.readAsArrayBuffer(data, function(uuid) {
                rtcMultiSession.fileBufferReader.getNextChunk(uuid, function(nextChunk, isLastChunk, extra) {
                    if (_channel) _channel.send(nextChunk);
                    else rtcMultiSession.send(nextChunk);
                });
            }, extra);
        } else {
            // to allow longest string messages
            // and largest data objects
            // or anything of any size!
            // to send multiple data objects concurrently!

            TextSender.send({
                text: data,
                channel: rtcMultiSession,
                _channel: _channel,
                connection: connection
            });
        }
    };

    function initRTCMultiSession(onSignalingReady) {
        if (screenFrame) {
            loadScreenFrame();
        }

        // RTCMultiSession is the backbone object;
        // this object MUST be initialized once!
        if (rtcMultiSession) return onSignalingReady();

        // your everything is passed over RTCMultiSession constructor!
        rtcMultiSession = new RTCMultiSession(connection, onSignalingReady);
    }

    connection.disconnect = function() {
        if (rtcMultiSession) rtcMultiSession.disconnect();
        rtcMultiSession = null;
    };

    function joinSession(session, joinAs) {
        if (isString(session)) {
            connection.skipOnNewSession = true;
        }

        if (!rtcMultiSession) {
            log('Signaling channel is not ready. Connecting...');
            // connect with signaling channel
            initRTCMultiSession(function() {
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
            } else
                return setTimeout(function() {
                    log('Session-Descriptions not found. Rechecking..');
                    joinSession(session, joinAs);
                }, 1000);
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

            var error = 'Invalid data passed over "connection.join" method.';
            connection.onstatechange({
                userid: 'browser',
                extra: {},
                name: 'Unexpected data detected.',
                reason: error
            });

            throw error;
        }

        if (!connection.dontOverrideSession) {
            connection.session = session.session;
        }

        var extra = connection.extra || session.extra || {};

        // todo: need to verify that if-block statement works as expected.
        // expectations: if it is oneway streaming; or if it is data-only connection
        // then, it shouldn't capture user-media on participant's side.
        if (session.oneway || isData(session)) {
            rtcMultiSession.joinSession(session, extra);
        } else {
            captureUserMedia(function() {
                rtcMultiSession.joinSession(session, extra);
            });
        }
    }

    var isFirstSession = true;

    // www.RTCMultiConnection.org/docs/captureUserMedia/

    function captureUserMedia(callback, _session, dontCheckChromExtension) {
        // capture user's media resources
        var session = _session || connection.session;

        if (isEmpty(session)) {
            if (callback) callback();
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
            audio: !!session.audio ? {
                mandatory: {},
                optional: [{
                    chromeRenderToAssociatedSink: true
                }]
            } : false,
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

        var screen_constraints = {
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

        if (isFirefox && session.screen) {
            if (location.protocol !== 'https:') {
                return error(SCREEN_COMMON_FAILURE);
            }
            warn(Firefox_Screen_Capturing_Warning);

            screen_constraints.video = merge(screen_constraints.video.mandatory, {
                mozMediaSource: 'window', // mozMediaSource is redundant here
                mediaSource: 'window' // 'screen' || 'window'
            });

            // Firefox is supporting audio+screen from single getUserMedia request
            // audio+video+screen will become audio+screen for Firefox
            // because Firefox isn't supporting multi-streams feature version < 38
            // version >38 supports multi-stream sharing.
            // we can use:  firefoxVersion < 38
            // however capturing audio and screen using single getUserMedia is a better option
            if (constraints.audio /* && !session.video */ ) {
                screen_constraints.audio = true;
                constraints = {};
            }

            delete screen_constraints.video.chromeMediaSource;
        }

        // if screen is prompted
        if (session.screen) {
            if (isChrome && DetectRTC.screen.extensionid != ReservedExtensionID) {
                useCustomChromeExtensionForScreenCapturing = true;
            }

            if (isChrome && !useCustomChromeExtensionForScreenCapturing && !dontCheckChromExtension && !DetectRTC.screen.sourceId) {
                listenEventHandler('message', onIFrameCallback);

                function onIFrameCallback(event) {
                    if (event.data && event.data.chromeMediaSourceId) {
                        // this event listener is no more needed
                        window.removeEventListener('message', onIFrameCallback);

                        var sourceId = event.data.chromeMediaSourceId;

                        DetectRTC.screen.sourceId = sourceId;
                        DetectRTC.screen.chromeMediaSource = 'desktop';

                        if (sourceId == 'PermissionDeniedError') {
                            var mediaStreamError = {
                                message: location.protocol == 'https:' ? 'User denied to share content of his screen.' : SCREEN_COMMON_FAILURE,
                                name: 'PermissionDeniedError',
                                constraintName: screen_constraints,
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

                if (!screenFrame) {
                    loadScreenFrame();
                }

                screenFrame.postMessage();
                return;
            }

            // check if screen capturing extension is installed.
            if (isChrome && useCustomChromeExtensionForScreenCapturing && !dontCheckChromExtension && DetectRTC.screen.chromeMediaSource == 'screen' && DetectRTC.screen.extensionid) {
                if (DetectRTC.screen.extensionid == ReservedExtensionID && document.domain.indexOf('webrtc-experiment.com') == -1) {
                    return captureUserMedia(callback, _session, true);
                }

                log('checking if chrome extension is installed.');
                DetectRTC.screen.getChromeExtensionStatus(function(status) {
                    if (status == 'installed-enabled') {
                        DetectRTC.screen.chromeMediaSource = 'desktop';
                    }

                    captureUserMedia(callback, _session, true);
                    log('chrome extension is installed?', DetectRTC.screen.chromeMediaSource == 'desktop');
                });
                return;
            }

            if (isChrome && useCustomChromeExtensionForScreenCapturing && DetectRTC.screen.chromeMediaSource == 'desktop' && !DetectRTC.screen.sourceId) {
                DetectRTC.screen.getSourceId(function(sourceId) {
                    if (sourceId == 'PermissionDeniedError') {
                        var mediaStreamError = {
                            message: 'User denied to share content of his screen.',
                            name: 'PermissionDeniedError',
                            constraintName: screen_constraints,
                            session: session
                        };
                        currentUserMediaRequest.mutex = false;
                        DetectRTC.screen.chromeMediaSource = 'desktop';
                        return connection.onMediaError(mediaStreamError);
                    }

                    if (sourceId == 'No-Response') {
                        error('Chrome extension seems not available. Make sure that manifest.json#L16 has valid content-script matches pointing to your URL.');
                        DetectRTC.screen.chromeMediaSource = 'screen';
                        return captureUserMedia(callback, _session, true);
                    }

                    captureUserMedia(callback, _session, true);
                });
                return;
            }

            if (isChrome && DetectRTC.screen.chromeMediaSource == 'desktop') {
                screen_constraints.video.mandatory.chromeMediaSourceId = DetectRTC.screen.sourceId;
            }

            var _isFirstSession = isFirstSession;

            _captureUserMedia(screen_constraints, constraints.audio || constraints.video ? function() {

                if (_isFirstSession) isFirstSession = true;

                _captureUserMedia(constraints, callback);
            } : callback);
        } else _captureUserMedia(constraints, callback, session.audio && !session.video);

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
                    onStreamSuccessCallback(stream, returnBack, idInstance, streamid, forcedConstraints, forcedCallback, isRemoveVideoTracks, screen_constraints, constraints, session);
                },
                onerror: function(e, constraintUsed) {
                    // http://goo.gl/hrwF1a
                    if (isFirefox) {
                        if (e == 'PERMISSION_DENIED') {
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
                            message: Firefox_Screen_Capturing_Warning,
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
                    if (e.name && (e.name == 'PermissionDeniedError' || e.name == 'DevicesNotFoundError')) {
                        var mediaStreamError = 'Either: ';
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

                    if (e.name && e.name == 'ConstraintNotSatisfiedError') {
                        var mediaStreamError = 'Either: ';
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
                            error(Firefox_Screen_Capturing_Warning);
                        } else if (location.protocol !== 'https:') {
                            if (!isNodeWebkit && (location.protocol == 'file:' || location.protocol == 'http:')) {
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

    function onStreamSuccessCallback(stream, returnBack, idInstance, streamid, forcedConstraints, forcedCallback, isRemoveVideoTracks, screen_constraints, constraints, session) {
        if (!streamid) streamid = getRandomString();

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
                if (_stream == stream) {
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
                    socket.send({
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
        };

        if (!isIE) {
            stream.streamid = streamid;
            stream.isScreen = forcedConstraints == screen_constraints;
            stream.isVideo = forcedConstraints == constraints && !!constraints.video;
            stream.isAudio = forcedConstraints == constraints && !!constraints.audio && !constraints.video;

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

        if (forcedCallback) forcedCallback(stream, streamedObject);

        if (connection.onspeaking) {
            initHark({
                stream: stream,
                streamedObject: streamedObject,
                connection: connection
            });
        }
    }

    // www.RTCMultiConnection.org/docs/captureUserMedia/
    connection.captureUserMedia = captureUserMedia;

    // www.RTCMultiConnection.org/docs/leave/
    connection.leave = function(userid) {
        if (!rtcMultiSession) return;

        isFirstSession = true;

        if (userid) {
            connection.eject(userid);
            return;
        }

        rtcMultiSession.leave();
    };

    // www.RTCMultiConnection.org/docs/eject/
    connection.eject = function(userid) {
        if (!connection.isInitiator) throw 'Only session-initiator can eject a user.';
        if (!connection.peers[userid]) throw 'You ejected invalid user.';
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

        rtcMultiSession.addStream({
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

        var screen_constraints = {
            video: {
                chromeMediaSource: 'fake'
            }
        };
        var forcedConstraints = isScreen ? screen_constraints : constraints;
        onStreamSuccessCallback(stream, false, '', null, forcedConstraints, false, false, screen_constraints, constraints, constraints);
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
        } else addStream();

        function addStream(stream) {
            rtcMultiSession.addStream({
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

        if (!streamid) streamid = 'all';
        if (!isString(streamid) || streamid.search(/all|audio|video|screen/gi) != -1) {
            function _detachStream(_stream, config) {
                if (config.local && _stream.type != 'local') return;
                if (config.remote && _stream.type != 'remote') return;

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

                if (connection.detachStreams.indexOf(_stream.streamid) != -1) {
                    log('removing stream', _stream.streamid);
                    onStreamEndedHandler(_stream, connection);

                    if (config.stop) {
                        connection.stopMediaStream(_stream.stream);
                    }
                }
            }

            for (var stream in connection.streams) {
                if (connection._skip.indexOf(stream) == -1) {
                    _stream = connection.streams[stream];

                    if (streamid == 'all') _detachStream(_stream, {
                        audio: true,
                        video: true,
                        screen: true
                    });

                    else if (isString(streamid)) {
                        // connection.removeStream('screen');
                        var config = {};
                        config[streamid] = true;
                        _detachStream(_stream, config);
                    } else _detachStream(_stream, streamid);
                }
            }

            if (!dontRenegotiate && connection.detachStreams.length) {
                connection.renegotiate();
            }

            return;
        }

        var stream = connection.streams[streamid];

        // detach pre-attached streams
        if (!stream) return warn('No such stream exists. Stream-id:', streamid);

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
        if (!rtcMultiSession || !rtcMultiSession.defaultSocket) {
            return setTimeout(function() {
                connection.sendCustomMessage(message);
            }, 1000);
        }

        rtcMultiSession.defaultSocket.send({
            customMessage: true,
            message: message
        });
    };

    // set RTCMultiConnection defaults on constructor invocation
    setDefaults(connection);
};
