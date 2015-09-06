// Last time updated at May 31, 2015, 08:32:23

// Quick-Demo for newbies: http://jsfiddle.net/c46de0L8/
// Another simple demo: http://jsfiddle.net/zar6fg60/

// Latest file can be found here: https://cdn.webrtc-experiment.com/RTCMultiConnection.js

// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - www.RTCMultiConnection.org/docs
// FAQ           - www.RTCMultiConnection.org/FAQ
// Changes log   - www.RTCMultiConnection.org/changes-log/
// Demos         - www.WebRTC-Experiment.com/RTCMultiConnection

// _________________________
// RTCMultiConnection-v2.2.5

/* issues/features need to be fixed & implemented:

-. v2.2.* changes-log here: http://www.rtcmulticonnection.org/changes-log/#v2.2
-. Fixed: https://github.com/muaz-khan/WebRTC-Experiment/issues/321
*/

'use strict';

(function() {
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
    var webAudioMediaStreamSources = [];

    function convertToAudioStream(mediaStream) {
        if (!mediaStream) {
            throw 'MediaStream is mandatory.';
        }

        if (mediaStream.getVideoTracks && !mediaStream.getVideoTracks().length) {
            return mediaStream;
        }

        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(mediaStream);

        var destination = context.createMediaStreamDestination();
        mediaStreamSource.connect(destination);

        webAudioMediaStreamSources.push(mediaStreamSource);

        return destination.stream;
    }

    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof window.InstallTrigger !== 'undefined';
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    var isChrome = !!window.chrome && !isOpera;
    var isIE = !!document.documentMode;

    var isPluginRTC = isSafari || isIE;

    var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);

    // detect node-webkit
    var isNodeWebkit = !!(window.process && (typeof window.process === 'object') && window.process.versions && window.process.versions['node-webkit']);

    window.MediaStream = window.MediaStream || window.webkitMediaStream;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    function getRandomString() {
        // suggested by @rvulpescu from #154
        if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
            var a = window.crypto.getRandomValues(new Uint32Array(3)),
                token = '';
            for (var i = 0, l = a.length; i < l; i++) {
                token += a[i].toString(36);
            }
            return token;
        } else {
            return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
        }
    }

    var chromeVersion = 50;
    var matchArray = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    if (isChrome && matchArray && matchArray[2]) {
        chromeVersion = parseInt(matchArray[2], 10);
    }

    var firefoxVersion = 50;
    matchArray = navigator.userAgent.match(/Firefox\/(.*)/);
    if (isFirefox && matchArray && matchArray[1]) {
        firefoxVersion = parseInt(matchArray[1], 10);
    }

    function isData(session) {
        return !session.audio && !session.video && !session.screen && session.data;
    }

    function isNull(obj) {
        return typeof obj === 'undefined';
    }

    function isString(obj) {
        return typeof obj === 'string';
    }

    function isEmpty(session) {
        if (!session) {
            throw 'Parameter is requried.';
        }

        var stringified = JSON.stringify(session);
        if (stringified === '{}' || !stringified.split(',').length) {
            return true;
        }
        return false;
    }

    // this method converts array-buffer into string
    function ab2str(buf) {
        var result = '';
        try {
            result = String.fromCharCode.apply(null, new Uint16Array(buf));
        } catch (e) {}
        return result;
    }

    // this method converts string into array-buffer
    function str2ab(str) {
        if (!isString(str)) {
            str = JSON.stringify(str);
        }

        var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    function swap(arr) {
        var swapped = [],
            length = arr.length;
        for (var i = 0; i < length; i++) {
            if (arr[i] && arr[i] !== true) {
                swapped.push(arr[i]);
            }
        }
        return swapped;
    }

    function forEach(obj, callback) {
        for (var item in obj) {
            callback(obj[item], item);
        }
    }

    var console = window.console || {
        log: function() {},
        error: function() {},
        warn: function() {}
    };

    var log = function() {
        console.log(arguments);
    };

    var error = function() {
        console.error(arguments);
    };

    var warn = function() {
        console.warn(arguments);
    };

    if (isChrome || isFirefox || isSafari) {
        log = console.log.bind(console);
        error = console.error.bind(console);
        warn = console.warn.bind(console);
    }

    function toStr(obj) {
        return JSON.stringify(obj, function(key, value) {
            key = key;
            if (value && value.sdp && value.sdp.type) {
                log(value.sdp.type, '\t', value.sdp.sdp);
                return '';
            } else {
                return value;
            }
        }, '\t');
    }

    function getLength(obj) {
        if (typeof obj !== 'object') {
            throw 'Invalid data-type: ' + (typeof obj) + '; expected: object';
        }

        var stringified = JSON.stringify(obj);
        if (stringified === '{}' || !stringified.split(',').length) {
            return 0;
        }
        return stringified.split(',').length;
    }

    // Get HTMLAudioElement/HTMLVideoElement accordingly

    function createMediaElement(stream, session) {
        if (!stream.isAudio && stream.getVideoTracks && !stream.getVideoTracks().length) {
            stream.isAudio = true;
            session.video = session.screen = stream.isVideo = stream.isScreen = false;
        }

        if (stream.isAudio && stream.getAudioTracks && !stream.getAudioTracks().length) {
            session.audio = stream.isAudio = false;

            if (!stream.isScreen) {
                stream.isVideo = true;
            }
        }

        var mediaElement = document.createElement(stream.isAudio ? 'audio' : 'video');
        mediaElement.id = stream.streamid;

        if (isPluginRTC) {
            var body = (document.body || document.documentElement);
            body.insertBefore(mediaElement, body.firstChild);

            setTimeout(function() {
                Plugin.attachMediaStream(mediaElement, stream);
            }, 1000);

            return Plugin.attachMediaStream(mediaElement, stream);
        }

        // "mozSrcObject" is always preferred over "src"!!
        mediaElement[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);

        mediaElement.controls = true;
        mediaElement.autoplay = !!session.remote;
        mediaElement.muted = session.remote ? false : true;

        // http://goo.gl/WZ5nFl
        // Firefox don't yet support onended for any stream (remote/local)
        if (isFirefox) {
            mediaElement.addEventListener('ended', function() {
                stream.onended();
            }, false);
        }

        mediaElement.play();

        return mediaElement;
    }

    var onStreamEndedHandlerFiredFor = {};

    function onStreamEndedHandler(streamedObject, connection) {
        if (streamedObject.mediaElement && !streamedObject.mediaElement.parentNode) {
            return;
        }

        if (onStreamEndedHandlerFiredFor[streamedObject.streamid]) {
            return;
        }
        onStreamEndedHandlerFiredFor[streamedObject.streamid] = streamedObject;
        connection.onstreamended(streamedObject);
    }

    var onLeaveHandlerFiredFor = {};

    function onLeaveHandler(event, connection) {
        if (onLeaveHandlerFiredFor[event.userid]) {
            return;
        }
        onLeaveHandlerFiredFor[event.userid] = event;
        connection.onleave(event);

        connection.numberOfConnectedUsers--;
    }

    function takeSnapshot(args) {
        var userid = args.userid;
        var connection = args.connection;

        function dataURItoBlob(dataURI, dataTYPE) {
            var binary = atob(dataURI.split(',')[1]),
                array = [];

            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }

            return new Blob([new Uint8Array(array)], {
                type: dataTYPE
            });
        }

        function _takeSnapshot(video) {
            var canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || video.clientWidth;
            canvas.height = video.videoHeight || video.clientHeight;

            var context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            connection.snapshots[userid] = canvas.toDataURL('image/png');

            if (!args.callback) {
                return;
            }

            var blob = dataURItoBlob(connection.snapshots[userid], 'image/png');
            args.callback(connection.snapshots[userid], blob);
        }

        if (args.mediaElement) {
            return _takeSnapshot(args.mediaElement);
        }

        for (var stream in connection.streams) {
            stream = connection.streams[stream];
            if (stream.userid === userid && stream.stream && stream.stream.getVideoTracks && stream.stream.getVideoTracks().length) {
                _takeSnapshot(stream.mediaElement);
                continue;
            }
        }
    }

    function invokeMediaCaptured(connection) {
        // to let user know that media resource has been captured
        // now, he can share "sessionDescription" using sockets
        if (connection.onMediaCaptured) {
            connection.onMediaCaptured();
            delete connection.onMediaCaptured;
        }
    }

    function merge(mergein, mergeto) {
        if (!mergein) {
            mergein = {};
        }

        if (!mergeto) {
            return mergein;
        }

        for (var item in mergeto) {
            mergein[item] = mergeto[item];
        }
        return mergein;
    }

    function loadScript(src, onload) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = function() {
            log('loaded resource:', src);
            if (onload) {
                onload();
            }
        };
        document.documentElement.appendChild(script);
    }

    function capturePartOfScreen(args) {
        var connection = args.connection;
        var element = args.element;

        if (!window.html2canvas) {
            return loadScript(connection.resources.html2canvas, function() {
                capturePartOfScreen(args);
            });
        }

        if (isString(element)) {
            element = document.querySelector(element);
            if (!element) {
                element = document.getElementById(element);
            }
        }
        if (!element) {
            throw 'HTML DOM Element is not accessible!';
        }

        // todo: store DOM element somewhere to minimize DOM querying issues

        // html2canvas.js is used to take screenshots
        window.html2canvas(element, {
            onrendered: function(canvas) {
                args.callback(canvas.toDataURL());
            }
        });
    }

    function initFileBufferReader(connection, callback) {
        if (!window.FileBufferReader) {
            loadScript(connection.resources.FileBufferReader, function() {
                initFileBufferReader(connection, callback);
            });
            return;
        }

        function _private(chunk) {
            chunk.userid = chunk.extra.userid;
            return chunk;
        }

        var fileBufferReader = new window.FileBufferReader();
        fileBufferReader.onProgress = function(chunk) {
            connection.onFileProgress(_private(chunk), chunk.uuid);
        };

        fileBufferReader.onBegin = function(file) {
            connection.onFileStart(_private(file));
        };

        fileBufferReader.onEnd = function(file) {
            connection.onFileEnd(_private(file));
        };

        callback(fileBufferReader);
    }

    var screenFrame, loadedScreenFrame;

    function loadScreenFrame(skip) {
        if (DetectRTC.screen.extensionid !== ReservedExtensionID) {
            return;
        }

        if (loadedScreenFrame) {
            return;
        }

        if (!skip) {
            return loadScreenFrame(true);
        }

        loadedScreenFrame = true;

        var iframe = document.createElement('iframe');
        iframe.onload = function() {
            iframe.isLoaded = true;
            log('Screen Capturing frame is loaded.');
        };
        iframe.src = 'https://www.webrtc-experiment.com/getSourceId/';
        iframe.style.display = 'none';
        (document.body || document.documentElement).appendChild(iframe);

        screenFrame = {
            postMessage: function() {
                if (!iframe.isLoaded) {
                    setTimeout(screenFrame.postMessage, 100);
                    return;
                }
                iframe.contentWindow.postMessage({
                    captureSourceId: true
                }, '*');
            }
        };
    }

    var loadedIceFrame;

    function loadIceFrame(callback, skip) {
        if (loadedIceFrame) {
            return;
        }
        if (!skip) {
            return loadIceFrame(callback, true);
        }

        loadedIceFrame = true;

        var iframe = document.createElement('iframe');
        iframe.onload = function() {
            iframe.isLoaded = true;

            listenEventHandler('message', iFrameLoaderCallback);

            function iFrameLoaderCallback(event) {
                if (!event.data || !event.data.iceServers) {
                    return;
                }
                callback(event.data.iceServers);

                // this event listener is no more needed
                window.removeEventListener('message', iFrameLoaderCallback);
            }

            iframe.contentWindow.postMessage('get-ice-servers', '*');
        };
        iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
        iframe.style.display = 'none';
        (document.body || document.documentElement).appendChild(iframe);
    }

    function muteOrUnmute(e) {
        var stream = e.stream,
            root = e.root,
            session = e.session || {},
            enabled = e.enabled;

        if (!session.audio && !session.video) {
            if (!isString(session)) {
                session = merge(session, {
                    audio: true,
                    video: true
                });
            } else {
                session = {
                    audio: true,
                    video: true
                };
            }
        }

        // implementation from #68
        if (session.type) {
            if (session.type === 'remote' && root.type !== 'remote') {
                return;
            }
            if (session.type === 'local' && root.type !== 'local') {
                return;
            }
        }

        log(enabled ? 'Muting' : 'UnMuting', 'session', toStr(session));

        // enable/disable audio/video tracks

        if (root.type === 'local' && session.audio && !!stream.getAudioTracks) {
            var audioTracks = stream.getAudioTracks()[0];
            if (audioTracks) {
                audioTracks.enabled = !enabled;
            }
        }

        if (root.type === 'local' && (session.video || session.screen) && !!stream.getVideoTracks) {
            var videoTracks = stream.getVideoTracks()[0];
            if (videoTracks) {
                videoTracks.enabled = !enabled;
            }
        }

        root.sockets.forEach(function(socket) {
            if (root.type === 'local') {
                socket.send2({
                    streamid: root.streamid,
                    mute: !!enabled,
                    unmute: !enabled,
                    session: session
                });
            }

            if (root.type === 'remote') {
                socket.send2({
                    promptMuteUnmute: true,
                    streamid: root.streamid,
                    mute: !!enabled,
                    unmute: !enabled,
                    session: session
                });
            }
        });

        if (root.type === 'remote') {
            return;
        }

        // According to issue #135, onmute/onumute must be fired for self
        // "fakeObject" is used because we need to keep session for renegotiated streams; 
        // and MUST pass exact session over onStreamEndedHandler/onmute/onhold/etc. events.
        var fakeObject = merge({}, root);
        fakeObject.session = session;

        fakeObject.isAudio = !!fakeObject.session.audio && !fakeObject.session.video;
        fakeObject.isVideo = !!fakeObject.session.video;
        fakeObject.isScreen = !!fakeObject.session.screen;

        if (!!enabled) {
            // if muted stream is negotiated
            stream.preMuted = {
                audio: stream.getAudioTracks().length && !stream.getAudioTracks()[0].enabled,
                video: stream.getVideoTracks().length && !stream.getVideoTracks()[0].enabled
            };
            root.rtcMultiConnection.onmute(fakeObject);
        }

        if (!enabled) {
            stream.preMuted = {};
            root.rtcMultiConnection.onunmute(fakeObject);
        }
    }

    var firefoxScreenCapturingWarning = 'Make sure that you are using Firefox Nightly and you enabled: media.getusermedia.screensharing.enabled flag from about:config page. You also need to add your domain in "media.getusermedia.screensharing.allowed_domains" flag. If you are using WinXP then also enable "media.getusermedia.screensharing.allow_on_old_platforms" flag. NEVER forget to use "only" HTTPs for screen capturing!';
    var SCREEN_COMMON_FAILURE = 'HTTPs i.e. SSL-based URI is mandatory to use screen capturing.';
    var ReservedExtensionID = 'ajhifddimkapgcifgcodmmfdlknahffk';

    // if application-developer deployed his own extension on Google App Store
    var useCustomChromeExtensionForScreenCapturing = document.domain.indexOf('webrtc-experiment.com') !== -1;

    var MediaStreamTrack = window.MediaStreamTrack;

    // if IE
    if (!window.addEventListener) {
        window.addEventListener = function(el, eventName, eventHandler) {
            if (!el.attachEvent) {
                return;
            }
            el.attachEvent('on' + eventName, eventHandler);
        };
    }

    function listenEventHandler(eventName, eventHandler) {
        window.removeEventListener(eventName, eventHandler);
        window.addEventListener(eventName, eventHandler, false);
    }

    function initHark(args, callback) {
        if (!window.hark) {
            loadScript(args.connection.resources.hark, function() {
                initHark(args);
            });
            return;
        }

        var connection = args.connection;

        callback(window.hark(args.stream, {
            onspeaking: function() {
                if (!connection.onspeaking) {
                    return;
                }
                connection.onspeaking(args.streamedObject);
            },
            onsilence: function() {
                if (!connection.onsilence) {
                    return;
                }
                connection.onsilence(args.streamedObject);
            },
            onvolumechange: function(volume, threshold) {
                if (!connection.onvolumechange) {
                    return;
                }
                connection.onvolumechange(merge({
                    volume: volume,
                    threshold: threshold
                }, args.streamedObject));
            }
        }));
    }

    window.attachEventListener = function(video, type, listener, useCapture) {
        video.addEventListener(type, listener, useCapture);
    };

    var Plugin = window.PluginRTC || {};
    window.onPluginRTCInitialized = function(pluginRTCObject) {
        Plugin = pluginRTCObject;
        MediaStreamTrack = Plugin.MediaStreamTrack;
        RTCPeerConnection = Plugin.RTCPeerConnection;
        RTCIceCandidate = Plugin.RTCIceCandidate;
        RTCSessionDescription = Plugin.RTCSessionDescription;

        log(isPluginRTC ? 'Java-Applet' : 'ActiveX', 'plugin has been loaded.');
    };
    if (!isEmpty(Plugin)) {
        window.onPluginRTCInitialized(Plugin);
    }

    // if IE or Safari
    if (isPluginRTC) {
        loadScript('https://cdn.webrtc-experiment.com/Plugin.EveryWhere.js');
        // loadScript('https://cdn.webrtc-experiment.com/Plugin.Temasys.js');
    }
    var defaultConstraints = {
        mandatory: {},
        optional: []
    };

    /* by @FreCap pull request #41 */
    var currentUserMediaRequest = {
        streams: [],
        mutex: false,
        queueRequests: []
    };

    function getUserMedia(options) {
        if (isPluginRTC) {
            if (!Plugin.getUserMedia) {
                setTimeout(function() {
                    getUserMedia(options);
                }, 1000);
                return;
            }

            return Plugin.getUserMedia(options.constraints || {
                audio: true,
                video: true
            }, options.onsuccess, options.onerror);
        }

        if (currentUserMediaRequest.mutex === true) {
            currentUserMediaRequest.queueRequests.push(options);
            return;
        }
        currentUserMediaRequest.mutex = true;

        var connection = options.connection;

        // tools.ietf.org/html/draft-alvestrand-constraints-resolution-00
        var mediaConstraints = options.mediaConstraints || {};
        var videoConstraints = typeof mediaConstraints.video === 'boolean' ? mediaConstraints.video : mediaConstraints.video || mediaConstraints;
        var audioConstraints = typeof mediaConstraints.audio === 'boolean' ? mediaConstraints.audio : mediaConstraints.audio || defaultConstraints;

        var n = navigator;
        var hints = options.constraints || {
            audio: defaultConstraints,
            video: defaultConstraints
        };

        if (hints.video && hints.video.mozMediaSource) {
            // "mozMediaSource" is redundant
            // need to check "mediaSource" instead.
            videoConstraints = {};
        }

        if (hints.video === true) {
            hints.video = defaultConstraints;
        }

        if (hints.audio === true) {
            hints.audio = defaultConstraints;
        }

        // connection.mediaConstraints.audio = false;
        if (typeof audioConstraints === 'boolean' && hints.audio) {
            hints.audio = audioConstraints;
        }

        // connection.mediaConstraints.video = false;
        if (typeof videoConstraints === 'boolean' && hints.video) {
            hints.video = videoConstraints;
        }

        // connection.mediaConstraints.audio.mandatory = {prop:true};
        var audioMandatoryConstraints = audioConstraints.mandatory;
        if (audioMandatoryConstraints && !isEmpty(audioMandatoryConstraints) && hints.audio) {
            hints.audio.mandatory = merge(hints.audio.mandatory, audioMandatoryConstraints);
        }

        if (hints.video !== false && typeof hints.video !== 'boolean') {
            // connection.media.min(320,180);
            // connection.media.max(1920,1080);
            var videoMandatoryConstraints = videoConstraints.mandatory;
            if (videoMandatoryConstraints) {
                var mandatory = {};

                if (videoMandatoryConstraints.minWidth) {
                    mandatory.minWidth = videoMandatoryConstraints.minWidth;
                }

                if (videoMandatoryConstraints.minHeight) {
                    mandatory.minHeight = videoMandatoryConstraints.minHeight;
                }

                if (videoMandatoryConstraints.maxWidth) {
                    mandatory.maxWidth = videoMandatoryConstraints.maxWidth;
                }

                if (videoMandatoryConstraints.maxHeight) {
                    mandatory.maxHeight = videoMandatoryConstraints.maxHeight;
                }

                if (videoMandatoryConstraints.minAspectRatio) {
                    mandatory.minAspectRatio = videoMandatoryConstraints.minAspectRatio;
                }

                if (videoMandatoryConstraints.maxFrameRate) {
                    mandatory.maxFrameRate = videoMandatoryConstraints.maxFrameRate;
                }

                if (videoMandatoryConstraints.minFrameRate) {
                    mandatory.minFrameRate = videoMandatoryConstraints.minFrameRate;
                }

                if (mandatory.minWidth && mandatory.minHeight) {
                    // http://goo.gl/IZVYsj
                    var allowed = ['1920:1080', '1280:720', '960:720', '640:360', '640:480', '320:240', '320:180'];

                    if (allowed.indexOf(mandatory.minWidth + ':' + mandatory.minHeight) === -1 ||
                        allowed.indexOf(mandatory.maxWidth + ':' + mandatory.maxHeight) === -1) {
                        error('The min/max width/height constraints you passed "seems" NOT supported.', toStr(mandatory));
                    }

                    if (mandatory.minWidth > mandatory.maxWidth || mandatory.minHeight > mandatory.maxHeight) {
                        error('Minimum value must not exceed maximum value.', toStr(mandatory));
                    }

                    if (mandatory.minWidth >= 1280 && mandatory.minHeight >= 720) {
                        warn('Enjoy HD video! min/' + mandatory.minWidth + ':' + mandatory.minHeight + ', max/' + mandatory.maxWidth + ':' + mandatory.maxHeight);
                    }
                }

                hints.video.mandatory = merge(hints.video.mandatory, mandatory);
            }

            if (videoMandatoryConstraints && hints.video) {
                hints.video.mandatory = merge(hints.video.mandatory, videoMandatoryConstraints);
            }

            // videoConstraints.optional = [{prop:true}];
            if (hints.video && videoConstraints.optional && videoConstraints.optional instanceof Array && videoConstraints.optional.length) {
                hints.video.optional = hints.video.optional ? hints.video.optional.concat(videoConstraints.optional) : videoConstraints.optional;
            }

            if (hints.video && hints.video.mandatory && !isEmpty(hints.video.mandatory) && connection._mediaSources.video) {
                hints.video.optional.forEach(function(video, index) {
                    if (video.sourceId === connection._mediaSources.video) {
                        delete hints.video.optional[index];
                    }
                });

                hints.video.optional = swap(hints.video.optional);

                hints.video.optional.push({
                    sourceId: connection._mediaSources.video
                });
            }

            if (hints.video && !hints.video.mozMediaSource && hints.video.optional && hints.video.mandatory) {
                if (!hints.video.optional.length && hints.video.mandatory && isEmpty(hints.video.mandatory)) {
                    hints.video = true;
                }
            }
        }

        // audioConstraints.optional = [{prop:true}];
        if (audioConstraints.optional && audioConstraints.optional instanceof Array && audioConstraints.optional.length && hints.audio) {
            hints.audio.optional = hints.audio.optional ? hints.audio.optional.concat(audioConstraints.optional) : audioConstraints.optional;
        }

        if (hints.audio && hints.audio.optional && hints.audio.optional instanceof Array && connection._mediaSources.audio) {
            hints.audio.optional.forEach(function(audio, index) {
                if (audio.sourceId === connection._mediaSources.audio) {
                    delete hints.audio.optional[index];
                }
            });

            hints.audio.optional = swap(hints.audio.optional);

            hints.audio.optional.push({
                sourceId: connection._mediaSources.audio
            });
        }

        if (isMobileDevice) {
            // Android fails for some constraints
            // so need to force {audio:true,video:true}
            hints = {
                audio: !!hints.audio,
                video: !!hints.video
            };
        }

        // connection.mediaConstraints always overrides constraints
        // passed from "captureUserMedia" function.
        // todo: need to verify all possible situations
        log('invoked getUserMedia with constraints:', toStr(hints));

        // easy way to match 
        var idInstance = JSON.stringify(hints);

        function streaming(stream, returnBack, streamid) {
            if (!streamid) {
                streamid = getRandomString();
            }

            // localStreams object will store stream
            // until it is removed using native-stop method.
            connection.localStreams[streamid] = stream;

            var video = options.video;
            if (video) {
                video[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
                video.play();
            }

            options.onsuccess(stream, returnBack, idInstance, streamid);
            currentUserMediaRequest.streams[idInstance] = {
                stream: stream,
                streamid: streamid
            };
            currentUserMediaRequest.mutex = false;

            if (currentUserMediaRequest.queueRequests.length) {
                getUserMedia(currentUserMediaRequest.queueRequests.shift());
            }
        }

        if (currentUserMediaRequest.streams[idInstance]) {
            streaming(currentUserMediaRequest.streams[idInstance].stream, true, currentUserMediaRequest.streams[idInstance].streamid);
        } else {
            n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;

            // http://goo.gl/eETIK4
            n.getMedia(hints, streaming, function(error) {
                options.onerror(error, hints);
            });
        }
    }
    var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

    function RTCPeerConnectionHandler() {
        return {
            create: function(type, options) {
                merge(this, options);

                var self = this;

                this.type = type;
                this.init();
                this.attachMediaStreams();

                if (isFirefox && this.session.data) {
                    if (this.session.data && type === 'offer') {
                        this.createDataChannel();
                    }

                    this.getLocalDescription(type);

                    if (this.session.data && type === 'answer') {
                        this.createDataChannel();
                    }
                } else {
                    self.getLocalDescription(type);
                }

                return this;
            },
            getLocalDescription: function(createType) {
                log('(getLocalDescription) peer createType is', createType);

                if (this.session.inactive && isNull(this.rtcMultiConnection.waitUntilRemoteStreamStartsFlowing)) {
                    // inactive session returns blank-stream
                    this.rtcMultiConnection.waitUntilRemoteStreamStartsFlowing = false;
                }

                var self = this;

                if (createType === 'answer') {
                    this.setRemoteDescription(this.offerDescription, createDescription);
                } else {
                    createDescription();
                }

                function createDescription() {
                    self.connection[createType === 'offer' ? 'createOffer' : 'createAnswer'](function(sessionDescription) {
                        sessionDescription.sdp = self.serializeSdp(sessionDescription.sdp, createType);
                        self.connection.setLocalDescription(sessionDescription);

                        if (self.trickleIce) {
                            self.onSessionDescription(sessionDescription, self.streaminfo);
                        }

                        if (sessionDescription.type === 'offer') {
                            log('offer sdp', sessionDescription.sdp);
                        }

                        self.prevCreateType = createType;
                    }, self.onSdpError, self.constraints);
                }
            },
            serializeSdp: function(sdp, createType) {
                // it is "connection.processSdp=function(sdp){return sdp;}"
                sdp = this.processSdp(sdp);

                if (isFirefox) {
                    return sdp;
                }

                if (this.session.inactive && !this.holdMLine) {
                    this.hold = true;
                    if ((this.session.screen || this.session.video) && this.session.audio) {
                        this.holdMLine = 'both';
                    } else if (this.session.screen || this.session.video) {
                        this.holdMLine = 'video';
                    } else if (this.session.audio) {
                        this.holdMLine = 'audio';
                    }
                }

                sdp = this.setBandwidth(sdp);
                if (this.holdMLine === 'both') {
                    if (this.hold) {
                        this.prevSDP = sdp;
                        sdp = sdp.replace(/a=sendonly|a=recvonly|a=sendrecv/g, 'a=inactive');
                    } else if (this.prevSDP) {
                        if (!this.session.inactive) {
                            // it means that DTSL key exchange already happened for single or multiple media lines.
                            // this block checks, key-exchange must be happened for all media lines.
                            sdp = this.prevSDP;

                            // todo: test it: makes sense?
                            if (chromeVersion <= 35) {
                                return sdp;
                            }
                        }
                    }
                } else if (this.holdMLine === 'audio' || this.holdMLine === 'video') {
                    sdp = sdp.split('m=');

                    var audio = '';
                    var video = '';

                    if (sdp[1] && sdp[1].indexOf('audio') === 0) {
                        audio = 'm=' + sdp[1];
                    }
                    if (sdp[2] && sdp[2].indexOf('audio') === 0) {
                        audio = 'm=' + sdp[2];
                    }

                    if (sdp[1] && sdp[1].indexOf('video') === 0) {
                        video = 'm=' + sdp[1];
                    }
                    if (sdp[2] && sdp[2].indexOf('video') === 0) {
                        video = 'm=' + sdp[2];
                    }

                    if (this.holdMLine === 'audio') {
                        if (this.hold) {
                            this.prevSDP = sdp[0] + audio + video;
                            sdp = sdp[0] + audio.replace(/a=sendonly|a=recvonly|a=sendrecv/g, 'a=inactive') + video;
                        } else if (this.prevSDP) {
                            sdp = this.prevSDP;
                        }
                    }

                    if (this.holdMLine === 'video') {
                        if (this.hold) {
                            this.prevSDP = sdp[0] + audio + video;
                            sdp = sdp[0] + audio + video.replace(/a=sendonly|a=recvonly|a=sendrecv/g, 'a=inactive');
                        } else if (this.prevSDP) {
                            sdp = this.prevSDP;
                        }
                    }
                }

                if (!this.hold && this.session.inactive) {
                    // transport.cc&l=852 - http://goo.gl/0FxxqG
                    // dtlstransport.h&l=234 - http://goo.gl/7E4sYF
                    // http://tools.ietf.org/html/rfc4340

                    // From RFC 4145, SDP setup attribute values.
                    // http://goo.gl/xETJEp && http://goo.gl/3Wgcau
                    if (createType === 'offer') {
                        sdp = sdp.replace(/a=setup:passive|a=setup:active|a=setup:holdconn/g, 'a=setup:actpass');
                    } else {
                        sdp = sdp.replace(/a=setup:actpass|a=setup:passive|a=setup:holdconn/g, 'a=setup:active');
                    }

                    // whilst doing handshake, either media lines were "inactive"
                    // or no media lines were present
                    sdp = sdp.replace(/a=inactive/g, 'a=sendrecv');
                }
                // this.session.inactive = false;
                return sdp;
            },
            init: function() {
                this.setConstraints();
                this.connection = new RTCPeerConnection(this.rtcConfiguration, this.optionalArgument);

                if (this.session.data) {
                    log('invoked: createDataChannel');
                    this.createDataChannel();
                }

                this.connection.onicecandidate = function(event) {
                    if (!event.candidate) {
                        if (!self.trickleIce) {
                            returnSDP();
                        }

                        return;
                    }

                    if (!self.trickleIce) {
                        return;
                    }

                    self.onicecandidate(event.candidate);
                };

                function returnSDP() {
                    if (self.returnedSDP) {
                        self.returnedSDP = false;
                        return;
                    }
                    self.returnedSDP = true;

                    self.onSessionDescription(self.connection.localDescription, self.streaminfo);
                }

                this.connection.onaddstream = function(e) {
                    log('onaddstream', isPluginRTC ? e.stream : toStr(e.stream));

                    self.onaddstream(e.stream, self.session);
                };

                this.connection.onremovestream = function(e) {
                    self.onremovestream(e.stream);
                };

                this.connection.onsignalingstatechange = function() {
                    if (!self.connection) {
                        return;
                    }
                    self.oniceconnectionstatechange({
                        iceConnectionState: self.connection.iceConnectionState,
                        iceGatheringState: self.connection.iceGatheringState,
                        signalingState: self.connection.signalingState
                    });
                };

                this.connection.oniceconnectionstatechange = function() {
                    if (!self.connection) {
                        return;
                    }
                    self.oniceconnectionstatechange({
                        iceConnectionState: self.connection.iceConnectionState,
                        iceGatheringState: self.connection.iceGatheringState,
                        signalingState: self.connection.signalingState
                    });

                    if (self.trickleIce) {
                        return;
                    }

                    if (self.connection.iceGatheringState === 'complete') {
                        log('iceGatheringState', self.connection.iceGatheringState);
                        returnSDP();
                    }
                };

                var self = this;
            },
            setBandwidth: function(sdp) {
                if (isMobileDevice || isFirefox || !this.bandwidth) {
                    return sdp;
                }

                var bandwidth = this.bandwidth;

                if (this.session.screen) {
                    if (!bandwidth.screen) {
                        warn('It seems that you are not using bandwidth for screen. Screen sharing is expected to fail.');
                    } else if (bandwidth.screen < 300) {
                        warn('It seems that you are using wrong bandwidth value for screen. Screen sharing is expected to fail.');
                    }
                }

                // if screen; must use at least 300kbs
                if (bandwidth.screen && this.session.screen) {
                    sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
                    sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.screen + '\r\n');
                }

                // remove existing bandwidth lines
                if (bandwidth.audio || bandwidth.video || bandwidth.data) {
                    sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
                }

                if (bandwidth.audio) {
                    sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
                }

                if (bandwidth.video) {
                    sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + (this.session.screen ? bandwidth.screen : bandwidth.video) + '\r\n');
                }

                if (bandwidth.data && !this.preferSCTP) {
                    sdp = sdp.replace(/a=mid:data\r\n/g, 'a=mid:data\r\nb=AS:' + bandwidth.data + '\r\n');
                }

                return sdp;
            },
            setConstraints: function() {
                this.constraints = {
                    optional: this.sdpConstraints.optional || [],
                    mandatory: this.sdpConstraints.mandatory || {
                        OfferToReceiveAudio: !!this.session.audio,
                        OfferToReceiveVideo: !!this.session.video || !!this.session.screen
                    }
                };

                log('sdp-constraints', toStr(this.constraints));

                this.optionalArgument = {
                    optional: this.optionalArgument.optional || [],
                    mandatory: this.optionalArgument.mandatory || {}
                };

                if (!this.preferSCTP) {
                    this.optionalArgument.optional.push({
                        RtpDataChannels: true
                    });
                }

                log('optional-argument', toStr(this.optionalArgument));

                if (!isNull(this.rtcConfiguration) && !isNull(this.iceServers)) {
                    var iceCandidates = this.rtcMultiConnection.candidates;

                    var stun = iceCandidates.stun;
                    var turn = iceCandidates.turn;
                    var host = iceCandidates.host;

                    if (!isNull(iceCandidates.reflexive)) {
                        stun = iceCandidates.reflexive;
                    }
                    if (!isNull(iceCandidates.relay)) {
                        turn = iceCandidates.relay;
                    }

                    if (!host && !stun && turn) {
                        this.rtcConfiguration.iceTransports = 'relay';
                    } else if (!host && !stun && !turn) {
                        this.rtcConfiguration.iceTransports = 'none';
                    }

                    this.rtcConfiguration = {
                        iceServers: this.iceServers,
                        iceTransports: this.rtcConfiguration.iceTransports
                    };
                } else {
                    this.rtcConfiguration = null;
                }

                log('rtc-configuration', toStr(this.rtcConfiguration));
            },
            onSdpError: function(e) {
                var message = toStr(e);

                if (message && message.indexOf('RTP/SAVPF Expects at least 4 fields') !== -1) {
                    message = 'It seems that you are trying to interop RTP-datachannels with SCTP. It is not supported!';
                }
                error('onSdpError:', message);
            },
            onSdpSuccess: function() {
                log('sdp success');
            },
            onMediaError: function(err) {
                error(toStr(err));
            },
            setRemoteDescription: function(sessionDescription, onSdpSuccess) {
                if (!sessionDescription) {
                    throw 'Remote session description should NOT be NULL.';
                }

                if (!this.connection) {
                    return;
                }

                log('setting remote description', sessionDescription.type, sessionDescription.sdp);

                var self = this;
                this.connection.setRemoteDescription(
                    new RTCSessionDescription(sessionDescription),
                    onSdpSuccess || this.onSdpSuccess,
                    function(error) {
                        if (error.search(/STATE_SENTINITIATE|STATE_INPROGRESS/gi) === -1) {
                            self.onSdpError(error);
                        }
                    }
                );
            },
            addIceCandidate: function(candidate) {
                var self = this;
                if (isPluginRTC) {
                    new RTCIceCandidate(candidate, function(iceCandidate) {
                        onAddIceCandidate(iceCandidate);
                    });
                } else {
                    onAddIceCandidate(new RTCIceCandidate(candidate));
                }

                function onAddIceCandidate(iceCandidate) {
                    if (!self.connection) {
                        return;
                    }

                    self.connection.addIceCandidate(iceCandidate, function() {
                        log('added:', candidate.sdpMid, candidate.candidate);
                    }, function() {
                        error('onIceFailure', arguments, candidate.candidate);
                    });
                }
            },
            createDataChannel: function(channelIdentifier) {
                // skip 2nd invocation of createDataChannel
                if (this.channels && this.channels.length) {
                    return;
                }

                var self = this;

                if (!this.channels) {
                    this.channels = [];
                }

                // protocol: 'text/chat', preset: true, stream: 16
                // maxRetransmits:0 && ordered:false && outOfOrderAllowed: false
                var dataChannelDict = {};

                if (this.dataChannelDict) {
                    dataChannelDict = this.dataChannelDict;
                }

                if (isChrome && !this.preferSCTP) {
                    dataChannelDict.reliable = false; // Deprecated!
                }

                log('dataChannelDict', toStr(dataChannelDict));

                if (this.type === 'answer' || isFirefox) {
                    this.connection.ondatachannel = function(event) {
                        self.setChannelEvents(event.channel);
                    };
                }

                if ((isChrome && this.type === 'offer') || isFirefox) {
                    this.setChannelEvents(
                        this.connection.createDataChannel(channelIdentifier || 'channel', dataChannelDict)
                    );
                }
            },
            setChannelEvents: function(channel) {
                var self = this;

                channel.binaryType = 'arraybuffer';

                if (this.dataChannelDict.binaryType) {
                    channel.binaryType = this.dataChannelDict.binaryType;
                }

                channel.onmessage = function(event) {
                    self.onmessage(event.data);
                };

                var numberOfTimes = 0;
                channel.onopen = function() {
                    channel.push = channel.send;
                    channel.send = function(data) {
                        if (self.connection.iceConnectionState === 'disconnected') {
                            return;
                        }

                        if (channel.readyState.search(/closing|closed/g) !== -1) {
                            return;
                        }

                        if (channel.readyState.search(/connecting|open/g) === -1) {
                            return;
                        }

                        if (channel.readyState === 'connecting') {
                            numberOfTimes++;
                            return setTimeout(function() {
                                if (numberOfTimes < 20) {
                                    channel.send(data);
                                } else {
                                    throw 'Number of times exceeded to wait for WebRTC data connection to be opened.';
                                }
                            }, 1000);
                        }
                        try {
                            channel.push(data);
                        } catch (e) {
                            numberOfTimes++;
                            warn('Data transmission failed. Re-transmitting..', numberOfTimes, toStr(e));
                            if (numberOfTimes >= 20) {
                                throw 'Number of times exceeded to resend data packets over WebRTC data channels.';
                            }
                            setTimeout(function() {
                                channel.send(data);
                            }, 100);
                        }
                    };
                    self.onopen(channel);
                };

                channel.onerror = function(event) {
                    self.onerror(event);
                };

                channel.onclose = function(event) {
                    self.onclose(event);
                };

                this.channels.push(channel);
            },
            addStream: function(stream) {
                if (!stream.streamid && !isIE) {
                    stream.streamid = getRandomString();
                }

                // todo: maybe need to add isAudio/isVideo/isScreen if missing?

                log('attaching stream:', stream.streamid, isPluginRTC ? stream : toStr(stream));

                this.connection.addStream(stream);

                this.sendStreamId(stream);
                this.getStreamInfo();
            },
            attachMediaStreams: function() {
                var streams = this.attachStreams;

                if (isFirefox) {
                    if (streams[0]) {
                        this.addStream(streams[0]);
                    }
                    return;
                }

                for (var i = 0; i < streams.length; i++) {
                    this.addStream(streams[i]);
                }
            },
            getStreamInfo: function() {
                this.streaminfo = '';
                var streams = this.connection.getLocalStreams();
                for (var i = 0; i < streams.length; i++) {
                    if (i === 0) {
                        this.streaminfo = JSON.stringify({
                            streamid: streams[i].streamid || '',
                            isScreen: !!streams[i].isScreen,
                            isAudio: !!streams[i].isAudio,
                            isVideo: !!streams[i].isVideo,
                            preMuted: streams[i].preMuted || {}
                        });
                    } else {
                        this.streaminfo += '----' + JSON.stringify({
                            streamid: streams[i].streamid || '',
                            isScreen: !!streams[i].isScreen,
                            isAudio: !!streams[i].isAudio,
                            isVideo: !!streams[i].isVideo,
                            preMuted: streams[i].preMuted || {}
                        });
                    }
                }
            },
            recreateOffer: function(renegotiate, callback) {
                // if(isFirefox) this.create(this.type, this);

                log('recreating offer');

                this.type = 'offer';
                this.renegotiate = true;
                this.session = renegotiate;

                // todo: make sure this doesn't affect renegotiation scenarios
                // this.setConstraints();

                this.onSessionDescription = callback;
                this.getStreamInfo();

                // one can renegotiate data connection in existing audio/video/screen connection!
                if (this.session.data) {
                    this.createDataChannel();
                }

                this.getLocalDescription('offer');
            },
            recreateAnswer: function(sdp, session, callback) {
                // if(isFirefox) this.create(this.type, this);

                log('recreating answer');

                this.type = 'answer';
                this.renegotiate = true;
                this.session = session;

                // todo: make sure this doesn't affect renegotiation scenarios
                // this.setConstraints();

                this.onSessionDescription = callback;
                this.offerDescription = sdp;
                this.getStreamInfo();

                // one can renegotiate data connection in existing audio/video/screen connection!
                if (this.session.data) {
                    this.createDataChannel();
                }

                this.getLocalDescription('answer');
            }
        };
    }
    var FileSaver = {
        SaveToDisk: function(fileUrl, fileName) {
            var hyperlink = document.createElement('a');
            hyperlink.href = fileUrl;
            hyperlink.target = '_blank';
            hyperlink.download = fileName || fileUrl;

            var mouseEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });

            hyperlink.dispatchEvent(mouseEvent);

            // (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
        }
    };

    function TextReceiver(connection) {
        var content = {};

        function receive(data, userid, extra) {
            // uuid is used to uniquely identify sending instance
            var uuid = data.uuid;
            if (!content[uuid]) {
                content[uuid] = [];
            }

            content[uuid].push(data.message);
            if (data.last) {
                var message = content[uuid].join('');
                if (data.isobject) {
                    message = JSON.parse(message);
                }

                // latency detection
                var receivingTime = new Date().getTime();
                var latency = receivingTime - data.sendingTime;

                var e = {
                    data: message,
                    userid: userid,
                    extra: extra,
                    latency: latency
                };

                if (message.preRecordedMediaChunk) {
                    if (!connection.preRecordedMedias[message.streamerid]) {
                        connection.shareMediaFile(null, null, message.streamerid);
                    }
                    connection.preRecordedMedias[message.streamerid].onData(message.chunk);
                } else if (connection.autoTranslateText) {
                    e.original = e.data;
                    connection.Translator.TranslateText(e.data, function(translatedText) {
                        e.data = translatedText;
                        connection.onmessage(e);
                    });
                } else if (message.isPartOfScreen) {
                    connection.onpartofscreen(message);
                } else {
                    connection.onmessage(e);
                }

                delete content[uuid];
            }
        }

        return {
            receive: receive
        };
    }
    var TextSender = {
        send: function(config) {
            var connection = config.connection;

            if (config.text instanceof ArrayBuffer || config.text instanceof DataView) {
                return config.channel.send(config.text, config._channel);
            }

            var channel = config.channel,
                _channel = config._channel,
                initialText = config.text,
                packetSize = connection.chunkSize || 1000,
                textToTransfer = '',
                isobject = false;

            if (!isString(initialText)) {
                isobject = true;
                initialText = JSON.stringify(initialText);
            }

            // uuid is used to uniquely identify sending instance
            var uuid = getRandomString();
            var sendingTime = new Date().getTime();

            sendText(initialText);

            function sendText(textMessage, text) {
                var data = {
                    type: 'text',
                    uuid: uuid,
                    sendingTime: sendingTime
                };

                if (textMessage) {
                    text = textMessage;
                    data.packets = parseInt(text.length / packetSize);
                }

                if (text.length > packetSize) {
                    data.message = text.slice(0, packetSize);
                } else {
                    data.message = text;
                    data.last = true;
                    data.isobject = isobject;
                }

                channel.send(data, _channel);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length) {
                    setTimeout(function() {
                        sendText(null, textToTransfer);
                    }, connection.chunkInterval || 100);
                }
            }
        }
    };
    (function() {

        function warn(log) {
            if (window.console && typeof window.console.warn !== 'undefined') {
                console.warn(log);
            }
        }

        // detect node-webkit
        var browser = getBrowserInfo();

        // is this a chromium browser (opera or chrome)
        var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        var isFirefox = typeof InstallTrigger !== 'undefined';
        var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        var isChrome = !!window.chrome && !isOpera;
        var isIE = !!document.documentMode;

        var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);

        // detect node-webkit
        var isNodeWebkit = !!(window.process && (typeof window.process === 'object') && window.process.versions && window.process.versions['node-webkit']);

        var isHTTPs = location.protocol === 'https:';

        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            // Firefox 38+ seems having support of enumerateDevices
            // Thanks @xdumaine/enumerateDevices
            navigator.enumerateDevices = function(callback) {
                navigator.mediaDevices.enumerateDevices().then(callback);
            };
        }

        window.DetectRTC = {
            browser: browser,
            hasMicrophone: navigator.getMediaDevices || navigator.enumerateDevices ? false : 'unable to detect',
            hasSpeakers: navigator.getMediaDevices || navigator.enumerateDevices ? false : 'unable to detect',
            hasWebcam: navigator.getMediaDevices || navigator.enumerateDevices ? false : 'unable to detect',

            isWebRTCSupported: !!window.webkitRTCPeerConnection || !!window.mozRTCPeerConnection,
            isAudioContextSupported: (!!window.AudioContext && !!window.AudioContext.prototype.createMediaStreamSource) || (!!window.webkitAudioContext && !!window.webkitAudioContext.prototype.createMediaStreamSource),

            isScreenCapturingSupported: (isFirefox && browser.version >= 33) ||
                (isChrome && browser.version >= 26 && (isNodeWebkit ? true : location.protocol === 'https:')),

            isDesktopCapturingSupported: isHTTPs && ((isFirefox && browser.version >= 33) || (isChrome && browser.version >= 34) || isNodeWebkit || false),

            isSctpDataChannelsSupported: isFirefox || (isChrome && browser.version >= 25),
            isRtpDataChannelsSupported: isChrome && browser.version >= 31,
            isMobileDevice: !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i),
            isWebSocketsSupported: 'WebSocket' in window && 2 === window.WebSocket.CLOSING
        };

        if (!isHTTPs) {
            window.DetectRTC.isScreenCapturingSupported =
                window.DetectRTC.isDesktopCapturingSupported = 'Requires HTTPs.';
        }

        DetectRTC.browser = {
            isFirefox: isFirefox,
            isChrome: isChrome,
            isMobileDevice: isMobileDevice,
            isNodeWebkit: isNodeWebkit,
            isSafari: isSafari,
            isIE: isIE,
            isOpera: isOpera,
            name: browser.name,
            version: browser.version
        };

        var osName = 'Unknown OS';

        if (navigator.appVersion.indexOf('Win') !== -1) {
            osName = 'Windows';
        }

        if (navigator.appVersion.indexOf('Mac') !== -1) {
            osName = 'MacOS';
        }

        if (navigator.appVersion.indexOf('X11') !== -1) {
            osName = 'UNIX';
        }

        if (navigator.appVersion.indexOf('Linux') !== -1) {
            osName = 'Linux';
        }

        DetectRTC.osName = osName;

        DetectRTC.MediaDevices = [];

        if (!navigator.getMediaDevices) {
            warn('navigator.getMediaDevices API are not available.');
        }

        if (!navigator.enumerateDevices) {
            warn('navigator.enumerateDevices API are not available.');
        }

        if (!window.MediaStreamTrack || !window.MediaStreamTrack.getSources) {
            warn('MediaStreamTrack.getSources are not available.');
        }

        // http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediadevices
        // todo: switch to enumerateDevices when landed in canary.
        function CheckDeviceSupport(callback) {
            // This method is useful only for Chrome!

            if (!navigator.getMediaDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
                navigator.getMediaDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
            }

            if (!navigator.getMediaDevices && navigator.enumerateDevices) {
                navigator.getMediaDevices = navigator.enumerateDevices.bind(navigator);
            }

            // if still no 'getMediaDevices'; it MUST be Firefox!
            if (!navigator.getMediaDevices) {
                warn('navigator.getMediaDevices is undefined.');
                // assuming that it is older chrome or chromium implementation
                if (isChrome) {
                    DetectRTC.hasMicrophone = true;
                    DetectRTC.hasSpeakers = true;
                    DetectRTC.hasWebcam = true;
                }

                if (callback) {
                    callback();
                }
                return;
            }

            DetectRTC.MediaDevices = [];
            navigator.getMediaDevices(function(devices) {
                devices.forEach(function(_device) {
                    var device = {};
                    for (var d in _device) {
                        device[d] = _device[d];
                    }

                    var skip;
                    DetectRTC.MediaDevices.forEach(function(d) {
                        if (d.id === device.id) {
                            skip = true;
                        }
                    });

                    if (skip) {
                        return;
                    }

                    // if it is MediaStreamTrack.getSources
                    if (device.kind === 'audio') {
                        device.kind = 'audioinput';
                    }

                    if (device.kind === 'video') {
                        device.kind = 'videoinput';
                    }

                    if (!device.deviceId) {
                        device.deviceId = device.id;
                    }

                    if (!device.id) {
                        device.id = device.deviceId;
                    }

                    if (!device.label) {
                        device.label = 'Please invoke getUserMedia once.';
                    }

                    if (device.kind === 'audioinput' || device.kind === 'audio') {
                        DetectRTC.hasMicrophone = true;
                    }

                    if (device.kind === 'audiooutput') {
                        DetectRTC.hasSpeakers = true;
                    }

                    if (device.kind === 'videoinput' || device.kind === 'video') {
                        DetectRTC.hasWebcam = true;
                    }

                    // there is no 'videoouput' in the spec.

                    DetectRTC.MediaDevices.push(device);
                });

                if (callback) {
                    callback();
                }
            });
        }

        // check for microphone/camera support!
        new CheckDeviceSupport();
        DetectRTC.load = CheckDeviceSupport;

        function getBrowserInfo() {
            var nAgt = navigator.userAgent;
            var browserName = navigator.appName;
            var fullVersion = '' + parseFloat(navigator.appVersion);
            var majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset, verOffset, ix;

            // In Opera, the true version is after 'Opera' or after 'Version'
            if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
                browserName = 'Opera';
                fullVersion = nAgt.substring(verOffset + 6);

                if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                    fullVersion = nAgt.substring(verOffset + 8);
                }
            }
            // In MSIE, the true version is after 'MSIE' in userAgent
            else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
                browserName = 'IE';
                fullVersion = nAgt.substring(verOffset + 5);
            }
            // In Chrome, the true version is after 'Chrome' 
            else if ((verOffset = nAgt.indexOf('Chrome')) !== -1) {
                browserName = 'Chrome';
                fullVersion = nAgt.substring(verOffset + 7);
            }
            // In Safari, the true version is after 'Safari' or after 'Version' 
            else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
                browserName = 'Safari';
                fullVersion = nAgt.substring(verOffset + 7);

                if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                    fullVersion = nAgt.substring(verOffset + 8);
                }
            }
            // In Firefox, the true version is after 'Firefox' 
            else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
                browserName = 'Firefox';
                fullVersion = nAgt.substring(verOffset + 8);
            }
            // In most other browsers, 'name/version' is at the end of userAgent 
            else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
                browserName = nAgt.substring(nameOffset, verOffset);
                fullVersion = nAgt.substring(verOffset + 1);

                if (browserName.toLowerCase() === browserName.toUpperCase()) {
                    browserName = navigator.appName;
                }
            }
            // trim the fullVersion string at semicolon/space if present
            if ((ix = fullVersion.indexOf(';')) !== -1) {
                fullVersion = fullVersion.substring(0, ix);
            }

            if ((ix = fullVersion.indexOf(' ')) !== -1) {
                fullVersion = fullVersion.substring(0, ix);
            }

            majorVersion = parseInt('' + fullVersion, 10);

            if (isNaN(majorVersion)) {
                fullVersion = '' + parseFloat(navigator.appVersion);
                majorVersion = parseInt(navigator.appVersion, 10);
            }

            return {
                fullVersion: fullVersion,
                version: majorVersion,
                name: browserName
            };
        }

        // via: https://github.com/diafygi/webrtc-ips
        DetectRTC.DetectLocalIPAddress = function(callback) {
            getIPs(function(ip) {
                //local IPs
                if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
                    callback('Local: ' + ip);
                }

                //assume the rest are public IPs
                else {
                    callback('Public: ' + ip);
                }
            });
        };

        //get the IP addresses associated with an account
        function getIPs(callback) {
            var ipDuplicates = {};

            //compatibility for firefox and chrome
            var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
            var useWebKit = !!window.webkitRTCPeerConnection;

            // bypass naive webrtc blocking using an iframe
            if (!RTCPeerConnection) {
                var iframe = document.getElementById('iframe');
                if (!iframe) {
                    //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
                    throw 'NOTE: you need to have an iframe in the page right above the script tag.';
                }
                var win = iframe.contentWindow;
                RTCPeerConnection = win.RTCPeerConnection || win.mozRTCPeerConnection || win.webkitRTCPeerConnection;
                useWebKit = !!win.webkitRTCPeerConnection;
            }

            //minimal requirements for data connection
            var mediaConstraints = {
                optional: [{
                    RtpDataChannels: true
                }]
            };

            //firefox already has a default stun server in about:config
            //    media.peerconnection.default_iceservers =
            //    [{"url": "stun:stun.services.mozilla.com"}]
            var servers;

            //add same stun server for chrome
            if (useWebKit) {
                servers = {
                    iceServers: [{
                        urls: 'stun:stun.services.mozilla.com'
                    }]
                };
            }

            //construct a new RTCPeerConnection
            var pc = new RTCPeerConnection(servers, mediaConstraints);

            function handleCandidate(candidate) {
                //match just the IP address
                var ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                var ipAddress = ipRegex.exec(candidate)[1];

                //remove duplicates
                if (ipDuplicates[ipAddress] === undefined) {
                    callback(ipAddress);
                }

                ipDuplicates[ipAddress] = true;
            }

            //listen for candidate events
            pc.onicecandidate = function(ice) {
                //skip non-candidate events
                if (ice.candidate) {
                    handleCandidate(ice.candidate.candidate);
                }
            };

            //create a bogus data channel
            pc.createDataChannel('');

            //create an offer sdp
            pc.createOffer(function(result) {

                //trigger the stun server request
                pc.setLocalDescription(result, function() {}, function() {});

            }, function() {});

            //wait for a while to let everything done
            setTimeout(function() {
                //read candidate info from local description
                var lines = pc.localDescription.sdp.split('\n');

                lines.forEach(function(line) {
                    if (line.indexOf('a=candidate:') === 0) {
                        handleCandidate(line);
                    }
                });
            }, 1000);
        }
    })();

    var DetectRTC = window.DetectRTC;
})();
