// Last time updated at July 18, 2014, 08:32:23

// Latest file can be found here: https://cdn.webrtc-experiment.com/RTCMultiConnection.js

// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - www.RTCMultiConnection.org/docs
// FAQ               - www.RTCMultiConnection.org/FAQ
// v1.9 changes log  - www.RTCMultiConnection.org/changes-log/#v1.9
// Demos             - www.WebRTC-Experiment.com/RTCMultiConnection

// _______________________
// RTCMultiConnection-v1.9

/* issues/features need to be fixed & implemented:

-. todo: add connection.switchStream(session) to remove old ones, and add new stream(s)

-. todo: add connection.keepStreamsOpened
-. support inactive at initial handshake
-. todo: sharePartOfScreen must be fixed for "performance" when sharing over all users.
-. todo: connection.playRoleOfInitiator must have extra-data as well.
-. audio+video recording must support single-file for Firefox.
-. need to use maxaveragebitrate for audio bandwidth.
-. need to add LAN connectivity support.
-. (demos needed) Temasys/EasyRTC plugins for IE/Safari.
-. todo: add mp3-live streaming support
-. todo: add mozCaptureStreamUntilEnded streaming support.
-. todo: Fix "disconnected" which happens often. Need to use WebRTC data channels for dirty workaround whenever possible; currently we're relying on signaling medium.
-. todo: check if stream.onended is fired on Firefox.
-. todo: add removeStream workaround for Firefox.
-. todo: auto fallback to part-of-screen option for Firefox.
-. todo-fix: trickleIce & renegotiation fails.
-. "channel" object in the openSignalingChannel shouldn't be mandatory!
-. JSON parse/stringify options for data transmitted using data-channels; e.g. connection.preferJSON = true;
-. removeTrack() and addTracks() instead of "stop"
-. voice translation using Translator.js
*/

(function () {
    // www.RTCMultiConnection.org/docs/constructor/
    window.RTCMultiConnection = function (channel) {
        // a reference to your constructor!
        var connection = this;

        // www.RTCMultiConnection.org/docs/channel-id/
        connection.channel = channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');

        var rtcMultiSession; // a reference to backbone object i.e. RTCMultiSession!

        // to allow single user to join multiple rooms;
        // you can change this property at runtime!
        connection.isAcceptNewSession = true;

        // www.RTCMultiConnection.org/docs/open/
        connection.open = function (args) {
            connection.isAcceptNewSession = false;

            // www.RTCMultiConnection.org/docs/session-initiator/
            // you can always use this property to determine room owner!
            connection.isInitiator = true;

            var dontTransmit = false;

            // a channel can contain multiple rooms i.e. sessions
            if (args) {
                if (typeof args == 'string') {
                    connection.sessionid = args;
                } else {
                    if (typeof args.transmitRoomOnce != 'undefined') {
                        connection.transmitRoomOnce = args.transmitRoomOnce;
                    }

                    if (typeof args.dontTransmit != 'undefined') {
                        dontTransmit = args.dontTransmit;
                    }

                    if (typeof args.sessionid != 'undefined') {
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

            if (!connection.stats.sessions[connection.sessionDescription.sessionid]) {
                connection.stats.numberOfSessions++;
                connection.stats.sessions[connection.sessionDescription.sessionid] = connection.sessionDescription;
            }

            // connect with signaling channel
            initRTCMultiSession(function () {
                // "captureUserMediaOnDemand" is disabled by default.
                // invoke "getUserMedia" only when first participant found.
                rtcMultiSession.captureUserMediaOnDemand = args ? !!args.captureUserMediaOnDemand : false;

                if (args && args.onMediaCaptured) {
                    rtcMultiSession.onMediaCaptured = args.onMediaCaptured;
                }

                // for session-initiator, user-media is captured as soon as "open" is invoked.
                if (!rtcMultiSession.captureUserMediaOnDemand) captureUserMedia(function () {
                    rtcMultiSession.initSession({
                        sessionDescription: connection.sessionDescription,
                        dontTransmit: dontTransmit
                    });

                    // to let user know that media resource has been captured
                    // now, he can share "sessionDescription" using sockets
                    if (rtcMultiSession.onMediaCaptured) rtcMultiSession.onMediaCaptured();
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
        connection.connect = function (sessionid) {
            // a channel can contain multiple rooms i.e. sessions
            if (sessionid) {
                connection.sessionid = sessionid;
            }

            // connect with signaling channel
            initRTCMultiSession(function () {
                log('Signaling channel is ready.');
            });

            return this;
        };

        // www.RTCMultiConnection.org/docs/join/
        connection.join = joinSession;

        // www.RTCMultiConnection.org/docs/send/
        connection.send = function (data, _channel) {
            // send file/data or /text
            if (!data)
                throw 'No file, data or text message to share.';

            // connection.send([file1, file2, file3])
            // you can share multiple files, strings or data objects using "send" method!
            if (!!data.forEach) {
                // this mechanism can cause failure for subsequent packets/data 
                // on Firefox especially; and on chrome as well!
                // todo: need to use setTimeout instead.
                for (var i = 0; i < data.length; i++) {
                    connection.send(data[i], _channel);
                }
                return;
            }

            // File or Blob object MUST have "type" and "size" properties
            if (typeof data.size != 'undefined' && typeof data.type != 'undefined') {
                // to send multiple files concurrently!
                // file of any size; maximum length: 1GB
                FileSender.send({
                    file: data,
                    channel: rtcMultiSession,
                    _channel: _channel,
                    connection: connection
                });
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

        function joinSession(session, joinAs) {
            if (typeof session == 'string') {
                connection.skipOnNewSession = true;
            }

            if (!rtcMultiSession) {
                log('Signaling channel is not ready. Connecting...');
                // connect with signaling channel
                initRTCMultiSession(function () {
                    log('Signaling channel is connected. Joining the session again...');
                    setTimeout(function () {
                        joinSession(session, joinAs);
                    }, 1000);
                });
                return;
            }

            // connection.join('sessionid');
            if (typeof session == 'string') {
                if (connection.stats.sessions[session]) {
                    session = connection.stats.sessions[session];
                } else
                    return setTimeout(function () {
                        log('Session-Descriptions not found. Rechecking..');
                        joinSession(session, joinAs);
                    }, 1000);
            }

            // connection.join('sessionid', { audio: true });
            if (joinAs) {
                return captureUserMedia(function () {
                    session.oneway = true;
                    joinSession(session);
                }, joinAs);
            }

            if (!session || !session.userid || !session.sessionid) {
                error('missing arguments', arguments);

                var error = 'invalid data passed over "join" method';
                connection.onstatechange('failed', error);

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
                captureUserMedia(function () {
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
            if (connection.dontAttachStream)
                return callback();

            // if it is data-only connection
            // if it is one-way connection and current user is participant
            if (isData(session) || (!connection.isInitiator && session.oneway)) {
                // www.RTCMultiConnection.org/docs/attachStreams/
                connection.attachStreams = [];
                return callback();
            }

            var constraints = {
                audio: !!session.audio,
                video: !!session.video
            };

            // if custom audio device is selected
            if (connection._mediaSources.audio) {
                constraints.audio = {
                    optional: [{
                        sourceId: connection._mediaSources.audio
                    }]
                };
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
            if(!session.screen && !constraints.audio && !constraints.video) {
                return callback();
            }

            var screen_constraints = {
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: DetectRTC.screen.chromeMediaSource,
                        maxWidth: 1920,
                        maxHeight: 1080,
                        minAspectRatio: 1.77
                    },
                    optional: []
                }
            };

            // if screen is prompted
            if (session.screen) {
                if(DetectRTC.screen.extensionid != ReservedExtensionID) {
                    connection.useCustomChromeExtensionForScreenCapturing = true;
                }
                
                if (!connection.useCustomChromeExtensionForScreenCapturing && !dontCheckChromExtension && !DetectRTC.screen.sourceId) {
                    window.addEventListener('message', function (event) {
                        if (event.data && event.data.chromeMediaSourceId) {
                            var sourceId = event.data.chromeMediaSourceId;

                            DetectRTC.screen.sourceId = sourceId;
                            DetectRTC.screen.chromeMediaSource = 'desktop';

                            if (sourceId == 'PermissionDeniedError') {
                                var mediaStreamError = {
                                    message: 'User denied to share content of his screen.',
                                    name: 'PermissionDeniedError',
                                    constraintName: screen_constraints,
                                    session: session
                                };
                                currentUserMediaRequest.mutex = false;
                                return connection.onMediaError(mediaStreamError);
                            }

                            captureUserMedia(callback, _session);
                        }
                        
                        if(event.data && event.data.chromeExtensionStatus) {
                            warn('Screen capturing extension status is:', event.data.chromeExtensionStatus);
                            DetectRTC.screen.chromeMediaSource = 'screen';
                            captureUserMedia(callback, _session, true);
                        }
                    });

                    if(!screenFrame) {
                        loadScreenFrame();
                    }
                    
                    screenFrame.postMessage();
                    return;
                }
                
                // check if screen capturing extension is installed.
                if(connection.useCustomChromeExtensionForScreenCapturing && !dontCheckChromExtension && DetectRTC.screen.chromeMediaSource == 'screen' && DetectRTC.screen.extensionid) {
                    if(DetectRTC.screen.extensionid == ReservedExtensionID && document.domain.indexOf('webrtc-experiment.com') == -1) {
                        log('Please pass valid extension-id whilst using useCustomChromeExtensionForScreenCapturing boolean.');
                        return captureUserMedia(callback, _session, true);
                    }
                    
                    log('checking if chrome extension is installed.');
                    DetectRTC.screen.getChromeExtensionStatus(DetectRTC.screen.extensionid, function(status) {
                        if(status == 'installed-enabled') {
                            DetectRTC.screen.chromeMediaSource = 'desktop';
                        }
                        
                        captureUserMedia(callback, _session, true);
                        log('chrome extension is installed?', DetectRTC.screen.chromeMediaSource == 'desktop');
                    });
                    return;
                }
                
                if (connection.useCustomChromeExtensionForScreenCapturing && DetectRTC.screen.chromeMediaSource == 'desktop' && !DetectRTC.screen.sourceId) {
                    DetectRTC.screen.getSourceId(function (sourceId) {
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
                        
                        if(sourceId == 'No-Response') {
                            error('Chrome extension did not responded. Make sure that manifest.json#L16 has valid content-script matches pointing to your URL.');
                            DetectRTC.screen.chromeMediaSource = 'screen';
                            return captureUserMedia(callback, _session, true);
                        }

                        captureUserMedia(callback, _session, true);
                    });
                    return;
                }

                if (DetectRTC.screen.chromeMediaSource == 'desktop') {
                    screen_constraints.video.mandatory.chromeMediaSourceId = DetectRTC.screen.sourceId;
                } else log('You can install screen capturing chrome extension from this link: https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk');

                var _isFirstSession = isFirstSession;

                _captureUserMedia(screen_constraints, constraints.audio || constraints.video ? function () {

                    if (_isFirstSession) isFirstSession = true;

                    _captureUserMedia(constraints, callback);
                } : callback);
            } else _captureUserMedia(constraints, callback, session.audio && !session.video);

            connection.onstatechange('fetching-usermedia');

            function _captureUserMedia(forcedConstraints, forcedCallback, isRemoveVideoTracks, dontPreventSSLAutoAllowed) {

                if (connection.preventSSLAutoAllowed && !dontPreventSSLAutoAllowed && isChrome) {
                    // if navigator.customGetUserMediaBar.js is missing
                    if (!navigator.customGetUserMediaBar) {
                        loadScript(connection.resources.customGetUserMediaBar, function () {
                            _captureUserMedia(forcedConstraints, forcedCallback, isRemoveVideoTracks, dontPreventSSLAutoAllowed);
                        });
                        return;
                    }

                    navigator.customGetUserMediaBar(forcedConstraints, function () {
                        _captureUserMedia(forcedConstraints, forcedCallback, isRemoveVideoTracks, true);
                    }, function () {
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
                    onsuccess: function (stream, returnBack, idInstance, streamid) {
                        connection.onstatechange('usermedia-fetched');

                        if (isRemoveVideoTracks) {
                            stream = convertToAudioStream(stream);
                        }

                        connection.localStreamids.push(streamid);
                        stream.onended = function () {
                            connection.onstreamended(streamedObject);

                            // if user clicks "stop" button to close screen sharing
                            var _stream = connection.streams[streamid];
                            if (_stream && _stream.sockets.length) {
                                _stream.sockets.forEach(function (socket) {
                                    socket.send({
                                        streamid: _stream.streamid,
                                        userid: _stream.rtcMultiConnection.userid,
                                        extra: _stream.rtcMultiConnection.extra,
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

                        var mediaElement = createMediaElement(stream, session);

                        mediaElement.muted = true;

                        stream.streamid = streamid;

                        var streamedObject = {
                            stream: stream,
                            streamid: streamid,
                            mediaElement: mediaElement,
                            blobURL: mediaElement.mozSrcObject ? URL.createObjectURL(stream) : mediaElement.src,
                            type: 'local',
                            userid: connection.userid,
                            extra: connection.extra,
                            session: session,
                            isVideo: stream.getVideoTracks().length > 0,
                            isAudio: !stream.getVideoTracks().length && stream.getAudioTracks().length > 0,
                            isScreen: forcedConstraints == screen_constraints,
                            isInitiator: !!connection.isInitiator
                        };

                        var sObject = {
                            stream: stream,
                            blobURL: streamedObject.blobURL,
                            userid: connection.userid,
                            streamid: streamid,
                            session: session,
                            type: 'local',
                            streamObject: streamedObject,
                            mediaElement: mediaElement,
                            rtcMultiConnection: connection
                        };

                        if (isFirstSession) {
                            connection.attachStreams.push(stream);
                        }
                        isFirstSession = false;

                        connection.streams[streamid] = connection._getStream(sObject);

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
                    },
                    onerror: function (e, constraintUsed) {
                        // http://dev.w3.org/2011/webrtc/editor/getusermedia.html#h2_error-handling
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

                        if (typeof e == 'string') {
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
                                DetectRTC.load(function () {
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
                                error('Firefox has not yet released their screen capturing modules. Still work in progress! Please try chrome for now!');
                            } else if (location.protocol !== 'https:') {
                                if (!isNodeWebkit && (location.protocol == 'file:' || location.protocol == 'http:')) {
                                    error('You cannot use HTTP or file protocol for screen capturing. You must either use HTTPs or chrome extension page or Node-Webkit page.');
                                }
                            } else {
                                error('Unable to detect actual issue. Maybe "deprecated" screen capturing flag was not set using command line or maybe you clicked "No" button or maybe chrome extension returned invalid "sourceId".');
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

        // www.RTCMultiConnection.org/docs/captureUserMedia/
        connection.captureUserMedia = captureUserMedia;

        // www.RTCMultiConnection.org/docs/leave/
        connection.leave = function (userid) {
            isFirstSession = true;

            // eject a user; or leave the session
            rtcMultiSession.leave(userid);
        };

        // www.RTCMultiConnection.org/docs/eject/
        connection.eject = function (userid) {
            if (!connection.isInitiator) throw 'Only session-initiator can eject a user.';
            connection.leave(userid);
        };

        // www.RTCMultiConnection.org/docs/close/
        connection.close = function () {
            // close entire session
            connection.autoCloseEntireSession = true;
            connection.leave();
        };

        // www.RTCMultiConnection.org/docs/renegotiate/
        connection.renegotiate = function (stream, session) {
            rtcMultiSession.addStream({
                renegotiate: session || {
                    oneway: true,
                    audio: true,
                    video: true
                },
                stream: stream
            });
        };

        // www.RTCMultiConnection.org/docs/addStream/
        connection.addStream = function (session, socket) {
            // www.RTCMultiConnection.org/docs/renegotiation/

            // renegotiate new media stream
            if (session) {
                var isOneWayStreamFromParticipant;
                if (!connection.isInitiator && session.oneway) {
                    session.oneway = false;
                    isOneWayStreamFromParticipant = true;
                }

                captureUserMedia(function (stream) {
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
        connection.removeStream = function (streamid) {
            // detach pre-attached streams
            if (!connection.streams[streamid]) return warn('No such stream exists. Stream-id:', streamid);

            // www.RTCMultiConnection.org/docs/detachStreams/
            connection.detachStreams.push(streamid);
            connection.renegotiate();
        };

        // set RTCMultiConnection defaults on constructor invocation
        setDefaults(connection);
    };

    function RTCMultiSession(connection, callbackForSignalingReady) {
        var fileReceiver = new FileReceiver(connection);
        var textReceiver = new TextReceiver(connection);

        function onDataChannelMessage(e) {
            if (!e) return;

            e = JSON.parse(e);

            if (e.data.type === 'text') {
                textReceiver.receive(e.data, e.userid, e.extra);
            } else if (typeof e.data.maxChunks != 'undefined') {
                fileReceiver.receive(e.data);
            } else {
                if (connection.autoTranslateText) {
                    e.original = e.data;
                    connection.Translator.TranslateText(e.data, function (translatedText) {
                        e.data = translatedText;
                        connection.onmessage(e);
                    });
                } else connection.onmessage(e);
            }
        }

        function onNewSession(session) {
            if (connection.skipOnNewSession) return;
            
            if(!session.session) session.session = {};
            if(!session.extra) session.extra = {};

            // todo: make sure this works as expected.
            // i.e. "onNewSession" should be fired only for 
            // sessionid that is passed over "connect" method.
            if (connection.sessionid && session.sessionid != connection.sessionid) return;

            if (connection.onNewSession) {
                session.join = function (forceSession) {
                    if (!forceSession) return connection.join(session);

                    for (var f in forceSession) {
                        session.session[f] = forceSession[f];
                    }

                    // keeping previous state
                    var isDontAttachStream = connection.dontAttachStream;

                    connection.dontAttachStream = false;
                    connection.captureUserMedia(function () {
                        connection.dontAttachStream = true;
                        connection.join(session);

                        // returning back previous state
                        connection.dontAttachStream = isDontAttachStream;
                    }, forceSession);
                };
                if (!session.extra) session.extra = {};

                return connection.onNewSession(session);
            }

            connection.join(session);
        }

        var socketObjects = {};
        var sockets = [];

        var rtcMultiSession = this;

        var participants = {};

        function updateSocketForLocalStreams(socket) {
            for (var i = 0; i < connection.localStreamids.length; i++) {
                var streamid = connection.localStreamids[i];
                if (connection.streams[streamid]) {
                    // using "sockets" array to keep references of all sockets using 
                    // this media stream; so we can fire "onstreamended" among all users.
                    connection.streams[streamid].sockets.push(socket);
                }
            }
        }

        function newPrivateSocket(_config) {
            var socketConfig = {
                channel: _config.channel,
                onmessage: socketResponse,
                onopen: function (_socket) {
                    if (_socket) socket = _socket;

                    if (isofferer && !peer) {
                        peerConfig.session = connection.session;
                        if (!peer) peer = new PeerConnection();
                        peer.create('offer', peerConfig);
                    }

                    _config.socketIndex = socket.index = sockets.length;
                    socketObjects[socketConfig.channel] = socket;
                    sockets[_config.socketIndex] = socket;

                    updateSocketForLocalStreams(socket);
                }
            };

            socketConfig.callback = function (_socket) {
                socket = _socket;
                socketConfig.onopen();
            };

            var socket = connection.openSignalingChannel(socketConfig),
                isofferer = _config.isofferer,
                peer;

            var peerConfig = {
                onopen: onChannelOpened,
                onicecandidate: function (candidate) {
                    if (!connection.candidates) throw 'ICE candidates are mandatory.';
                    if(!connection.iceProtocols) throw 'At least one must be true; UDP or TCP.';
                    
                    if (!connection.candidates.host && candidate.candidate.indexOf('typ host') != -1) return;
                    if (!connection.candidates.relay && candidate.candidate.indexOf('typ relay') != -1) return;
                    if (!connection.candidates.reflexive && candidate.candidate.indexOf('typ srflx') != -1) return;
                    
                    if (!connection.iceProtocols.udp && candidate.candidate.indexOf(' udp ') != -1) return;
                    if (!connection.iceProtocols.tcp && candidate.candidate.indexOf(' tcp ') != -1) return;

                    log(candidate.candidate);

                    socket && socket.send({
                        userid: connection.userid,
                        candidate: {
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            candidate: JSON.stringify(candidate.candidate)
                        }
                    });
                },
                onmessage: onDataChannelMessage,
                onaddstream: function (stream, _session) {
                    var session = {};
                    
                    if(_session) session = merge(session, _session);
                    else if(_config.renegotiate) session = merge(session, _config.renegotiate);
                    else session = merge(session, connection.session);

                    // if it is Firefox; then return.
                    if (isData(session)) return;
                    
                    if(session.screen && (session.audio || session.video)) {
                        if(!_config.gotAudioOrVideo) {
                            // audio/video are fired earlier than screen
                            _config.gotAudioOrVideo = true;
                            session.screen = false;
                        }
                        else {
                            // screen stream is always fired later
                            session.audio = false;
                            session.video = false;
                        }
                    }

                    if (_config.streaminfo) {
                        var streaminfo = _config.streaminfo.split('----');
                        for (var i = 0; i < streaminfo.length; i++) {
                            stream.streamid = streaminfo[i];
                        }

                        _config.streaminfo = swap(streaminfo.pop()).join('----');
                    }

                    var mediaElement = createMediaElement(stream, merge({
                        remote: true
                    }, _session));
                    _config.stream = stream;

                    if (!stream.getVideoTracks().length)
                        mediaElement.addEventListener('play', function () {
                            setTimeout(function () {
                                mediaElement.muted = false;
                                afterRemoteStreamStartedFlowing(mediaElement, session, _session);
                            }, 3000);
                        }, false);
                    else
                        waitUntilRemoteStreamStartsFlowing(mediaElement, session, _session);

                    if (connection.setDefaultEventsForMediaElement) {
                        connection.setDefaultEventsForMediaElement(mediaElement, stream.streamid);
                    }
                },

                onremovestream: function (event) {
                    warn('onremovestream', event);
                },

                onclose: function (e) {
                    e.extra = _config.extra;
                    e.userid = _config.userid;
                    connection.onclose(e);

                    // suggested in #71 by "efaj"
                    if (connection.channels[e.userid])
                        delete connection.channels[e.userid];
                },
                onerror: function (e) {
                    e.extra = _config.extra;
                    e.userid = _config.userid;
                    connection.onerror(e);
                },

                oniceconnectionstatechange: function (event) {

                    log('oniceconnectionstatechange', toStr(event));

                    if (!connection.isInitiator && peer.connection && peer.connection.iceConnectionState == 'connected' && peer.connection.iceGatheringState == 'complete' && peer.connection.signalingState == 'stable' && connection.stats.numberOfConnectedUsers == 1) {
                        connection.onstatechange('connected-with-initiator');
                    }

                    if (connection.peers[_config.userid] && connection.peers[_config.userid].oniceconnectionstatechange) {
                        connection.peers[_config.userid].oniceconnectionstatechange(event);
                    }

                    // if ICE connectivity check is failed; renegotiate or redial
                    if (connection.peers[_config.userid] && connection.peers[_config.userid].peer.connection.iceConnectionState == 'failed') {
                        if (isFirefox || _config.userinfo.browser == 'firefox') {
                            warn('ICE connectivity check is failed. Re-establishing peer connection.');
                            connection.peers[_config.userid].redial();
                        } else {
                            warn('ICE connectivity check is failed. Renegotiating peer connection.');
                            connection.peers[_config.userid].renegotiate();
                        }
                    }

                    if (connection.peers[_config.userid] && connection.peers[_config.userid].peer.connection.iceConnectionState == 'disconnected') {
                        connection.peers[_config.userid].connected = false;

                        socket.send({
                            userid: connection.userid,
                            extra: connection.extra,
                            question: 'are-you-there'
                        });

                        // wait 5 seconds, if target peer didn't response, simply disconnect
                        setTimeout(function () {
                            // iceConnectionState == 'disconnected' occurred out of low-bandwidth
                            // or internet connectivity issues
                            if (connection.peers[_config.userid].connected) return;

                            // to make sure this user's all remote streams are removed.
                            for (var stream in connection.streams) {
                                stream = connection.streams[stream];
                                if (stream.userid == _config.userid && stream.type == 'remote') {
                                    connection.onstreamended(stream.streamObject);
                                }
                            }

                            connection.remove(_config.userid);
                        }, 5000);
                    }

                    if (!connection.autoReDialOnFailure) return;

                    if (connection.peers[_config.userid]) {
                        if (connection.peers[_config.userid].peer.connection.iceConnectionState != 'disconnected') {
                            _config.redialing = false;
                        }

                        if (connection.peers[_config.userid].peer.connection.iceConnectionState == 'disconnected' && !_config.redialing) {
                            _config.redialing = true;
                            warn('Peer connection is closed.', toStr(connection.peers[_config.userid].peer.connection), 'ReDialing..');
                            connection.peers[_config.userid].socket.send({
                                userid: connection.userid,
                                extra: connection.extra || {},
                                redial: true
                            });

                            // to make sure all old "remote" streams are also removed!
                            for (var stream in connection.streams) {
                                stream = connection.streams[stream];
                                if (stream.userid == _config.userid && stream.type == 'remote') {
                                    connection.onstreamended(stream.streamObject);
                                }
                            }
                        }
                    }
                },

                onsignalingstatechange: function (event) {
                    log('onsignalingstatechange', toStr(event));
                },

                attachStreams: connection.attachStreams,
                iceServers: connection.iceServers,
                bandwidth: connection.bandwidth,
                sdpConstraints: connection.sdpConstraints,
                optionalArgument: connection.optionalArgument,
                disableDtlsSrtp: connection.disableDtlsSrtp,
                dataChannelDict: connection.dataChannelDict,
                preferSCTP: connection.preferSCTP,

                onSessionDescription: function (sessionDescription, streaminfo) {
                    sendsdp({
                        sdp: sessionDescription,
                        socket: socket,
                        streaminfo: streaminfo
                    });
                },
                trickleIce: connection.trickleIce,
                processSdp: connection.processSdp
            };

            function waitUntilRemoteStreamStartsFlowing(mediaElement, session, _session, numberOfTimes) {
                // chrome for android may have some features missing
                if (isMobileDevice) {
                    return afterRemoteStreamStartedFlowing(mediaElement, session, _session);
                }

                if (!numberOfTimes) numberOfTimes = 0;
                numberOfTimes++;

                if (!(mediaElement.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || mediaElement.paused || mediaElement.currentTime <= 0)) {
                    afterRemoteStreamStartedFlowing(mediaElement, session, _session);
                } else {
                    if (numberOfTimes >= 60) { // wait 60 seconds while video is delivered!
                        socket.send({
                            userid: connection.userid,
                            extra: connection.extra,
                            failedToReceiveRemoteVideo: true,
                            streamid: _config.stream.streamid
                        });
                    } else
                        setTimeout(function () {
                            log('Waiting for incoming remote stream to be started flowing: ' + numberOfTimes + ' seconds.');
                            waitUntilRemoteStreamStartsFlowing(mediaElement, session, _session, numberOfTimes);
                        }, 900);
                }
            }

            function initFakeChannel() {
                if (!connection.fakeDataChannels || connection.channels[_config.userid]) return;

                // for non-data connections; allow fake data sender!
                if (!connection.session.data) {
                    var fakeChannel = {
                        send: function (data) {
                            socket.send({
                                fakeData: data
                            });
                        },
                        readyState: 'open'
                    };
                    // connection.channels['user-id'].send(data);
                    connection.channels[_config.userid] = {
                        channel: fakeChannel,
                        send: function (data) {
                            this.channel.send(data);
                        }
                    };
                    peerConfig.onopen(fakeChannel);
                }
            }

            function afterRemoteStreamStartedFlowing(mediaElement, _session, session) {
                var stream = _config.stream;

                stream.onended = function () {
                    connection.onstreamended(streamedObject);
                };

                var streamedObject = {
                    mediaElement: mediaElement,

                    stream: stream,
                    streamid: stream.streamid,
                    session: session || connection.session,

                    blobURL: mediaElement.mozSrcObject ? URL.createObjectURL(stream) : mediaElement.src,
                    type: 'remote',

                    extra: _config.extra,
                    userid: _config.userid,

                    isVideo: stream.getVideoTracks().length > 0,
                    isAudio: !stream.getVideoTracks().length && stream.getAudioTracks().length > 0,
                    isScreen: !!_session.screen,
                    isInitiator: !!_config.isInitiator
                };

                // connection.streams['stream-id'].mute({audio:true})
                connection.streams[stream.streamid] = connection._getStream({
                    stream: stream,
                    blobURL: streamedObject.blobURL,
                    userid: _config.userid,
                    streamid: stream.streamid,
                    socket: socket,
                    type: 'remote',
                    streamObject: streamedObject,
                    mediaElement: mediaElement,
                    rtcMultiConnection: connection,
                    session: session || connection.session
                });

                connection.onstream(streamedObject);

                onSessionOpened();

                if (connection.onspeaking) {
                    initHark({
                        stream: stream,
                        streamedObject: streamedObject,
                        connection: connection
                    });
                }
            }

            function onChannelOpened(channel) {
                _config.channel = channel;

                // connection.channels['user-id'].send(data);
                connection.channels[_config.userid] = {
                    channel: _config.channel,
                    send: function (data) {
                        connection.send(data, this.channel);
                    }
                };

                connection.onopen({
                    extra: _config.extra,
                    userid: _config.userid
                });

                // fetch files from file-queue
                for (var q in connection.fileQueue) {
                    connection.send(connection.fileQueue[q], channel);
                }

                if (isData(connection.session)) onSessionOpened();

                if (connection.partOfScreen && connection.partOfScreen.sharing) {
                    connection.peers[_config.userid].sharePartOfScreen(connection.partOfScreen);
                }
            }

            function updateSocket() {
                // todo: need to check following {if-block} MUST not affect "redial" process
                if (socket.userid == _config.userid)
                    return;

                socket.userid = _config.userid;
                sockets[_config.socketIndex] = socket;

                connection.stats.numberOfConnectedUsers++;
                // connection.peers['user-id'].addStream({audio:true})
                connection.peers[_config.userid] = {
                    socket: socket,
                    peer: peer,
                    userid: _config.userid,
                    extra: _config.extra,
                    userinfo: _config.userinfo,
                    addStream: function (session00) {
                        // connection.peers['user-id'].addStream({audio: true, video: true);

                        connection.addStream(session00, this.socket);
                    },
                    removeStream: function (streamid) {
                        if (!connection.streams[streamid])
                            return warn('No such stream exists. Stream-id:', streamid);

                        this.peer.connection.removeStream(connection.streams[streamid].stream);
                        this.renegotiate();
                    },
                    renegotiate: function (stream, session) {
                        // connection.peers['user-id'].renegotiate();

                        connection.renegotiate(stream, session);
                    },
                    changeBandwidth: function (bandwidth) {
                        // connection.peers['user-id'].changeBandwidth();

                        if (!bandwidth) throw 'You MUST pass bandwidth object.';
                        if (typeof bandwidth == 'string') throw 'Pass object for bandwidth instead of string; e.g. {audio:10, video:20}';

                        // set bandwidth for self
                        this.peer.bandwidth = bandwidth;

                        // ask remote user to synchronize bandwidth
                        this.socket.send({
                            userid: connection.userid,
                            extra: connection.extra || {},
                            changeBandwidth: true,
                            bandwidth: bandwidth
                        });
                    },
                    sendCustomMessage: function (message) {
                        // connection.peers['user-id'].sendCustomMessage();

                        this.socket.send({
                            userid: connection.userid,
                            extra: connection.extra || {},
                            customMessage: true,
                            message: message
                        });
                    },
                    onCustomMessage: function (message) {
                        log('Received "private" message from', this.userid,
                            typeof message == 'string' ? message : toStr(message));
                    },
                    drop: function (dontSendMessage) {
                        // connection.peers['user-id'].drop();

                        for (var stream in connection.streams) {
                            if (connection._skip.indexOf(stream) == -1) {
                                stream = connection.streams[stream];

                                if (stream.userid == connection.userid && stream.type == 'local') {
                                    this.peer.connection.removeStream(stream.stream);
                                    connection.onstreamended(stream.streamObject);
                                }

                                if (stream.type == 'remote' && stream.userid == this.userid) {
                                    connection.onstreamended(stream.streamObject);
                                }
                            }
                        }

                        !dontSendMessage && this.socket.send({
                            userid: connection.userid,
                            extra: connection.extra || {},
                            drop: true
                        });
                    },
                    hold: function (holdMLine) {
                        // connection.peers['user-id'].hold();

                        this.socket.send({
                            userid: connection.userid,
                            extra: connection.extra || {},
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
                    unhold: function (holdMLine) {
                        // connection.peers['user-id'].unhold();

                        this.socket.send({
                            userid: connection.userid,
                            extra: connection.extra || {},
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
                    fireHoldUnHoldEvents: function (e) {
                        // this method is for inner usages only!

                        var isHold = e.isHold;
                        var kind = e.kind;
                        var userid = e.remoteUser || e.userid;

                        // hold means inactive a specific media line!
                        // a media line can contain multiple synced sources (ssrc)
                        // i.e. a media line can reference multiple tracks!
                        // that's why hold will affect all relevant tracks in a specific media line!
                        for (var stream in connection.streams) {
                            if (connection._skip.indexOf(stream) == -1) {
                                stream = connection.streams[stream];

                                if (stream.userid == userid) {
                                    // www.RTCMultiConnection.org/docs/onhold/
                                    if (isHold)
                                        connection.onhold(merge({
                                            kind: kind
                                        }, stream.streamObject));

                                    // www.RTCMultiConnection.org/docs/onunhold/
                                    if (!isHold)
                                        connection.onunhold(merge({
                                            kind: kind
                                        }, stream.streamObject));
                                }
                            }
                        }
                    },
                    redial: function () {
                        // connection.peers['user-id'].redial();

                        // 1st of all; remove all relevant remote media streams
                        for (var stream in connection.streams) {
                            if (connection._skip.indexOf(stream) == -1) {
                                stream = connection.streams[stream];

                                if (stream.userid == this.userid && stream.type == 'remote') {
                                    connection.onstreamended(stream.streamObject);
                                }
                            }
                        }

                        log('ReDialing...');

                        socket.send({
                            userid: connection.userid,
                            extra: connection.extra,
                            recreatePeer: true
                        });

                        peer = new PeerConnection();
                        peer.create('offer', peerConfig);
                    },
                    sharePartOfScreen: function (args) {
                        // www.RTCMultiConnection.org/docs/onpartofscreen/

                        var element = args.element;
                        var that = this;

                        if (!window.html2canvas) {
                            return loadScript(connection.resources.html2canvas, function () {
                                that.sharePartOfScreen(args);
                            });
                        }

                        if (typeof element == 'string') {
                            element = document.querySelector(element);
                            if (!element) element = document.getElementById(element);
                        }
                        if (!element) throw 'HTML Element is inaccessible!';

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

                            // html2canvas.js is used to take screenshots
                            html2canvas(element, {
                                onrendered: function (canvas) {
                                    var screenshot = canvas.toDataURL();

                                    if (!connection.channels[that.userid]) {
                                        throw 'No such data channel exists.';
                                    }

                                    // don't share repeated content
                                    if (screenshot != lastScreenshot) {
                                        lastScreenshot = screenshot;
                                        connection.channels[that.userid].send({
                                            userid: connection.userid,
                                            extra: connection.extra,
                                            screenshot: screenshot,
                                            isPartOfScreen: true
                                        });
                                    }

                                    // "once" can be used to share single screenshot
                                    !args.once && setTimeout(partOfScreenCapturer, args.interval || 200);
                                }
                            });
                        }

                        partOfScreenCapturer();
                    }
                };
            }

            function onSessionOpened() {
                // original conferencing infrastructure!
                if (connection.isInitiator && getLength(participants) && getLength(participants) <= connection.maxParticipantsAllowed) {
                    log('syncing participants', participants);
                    log('inner-config-object', _config);
                    if (!connection.session.oneway && !connection.session.broadcast) {
                        defaultSocket.send({
                            sessionid: connection.sessionid,
                            newParticipant: _config.userid || socket.channel,
                            userid: connection.userid,
                            extra: connection.extra,
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
                if (_config.userinfo.browser == 'chrome' && !_config.renegotiatedOnce) {
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

            function socketResponse(response) {
                if (response.userid == connection.userid)
                    return;

                if (response.sdp) {
                    _config.userid = response.userid;
                    _config.extra = response.extra || {};
                    _config.renegotiate = response.renegotiate;
                    _config.streaminfo = response.streaminfo;
                    _config.isInitiator = response.isInitiator;
                    _config.userinfo = response.userinfo;

                    var sdp = JSON.parse(response.sdp);

                    if (sdp.type == 'offer') {
                        // to synchronize SCTP or RTP
                        peerConfig.preferSCTP = !!response.preferSCTP;
                        connection.fakeDataChannels = !!response.fakeDataChannels;
                    }

                    // initializing fake channel
                    initFakeChannel();

                    sdpInvoker(sdp, response.labels);
                }

                if (response.candidate) {
                    peer && peer.addIceCandidate({
                        sdpMLineIndex: response.candidate.sdpMLineIndex,
                        candidate: JSON.parse(response.candidate.candidate)
                    });
                }

                if (response.mute || response.unmute) {
                    if (response.promptMuteUnmute) {
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
                            streamObject = connection.streams[response.streamid].streamObject;
                        }

                        var session = response.session;
                        var fakeObject = merge({}, streamObject);
                        fakeObject.session = session;
                        fakeObject.isAudio = session.audio && !session.video;
                        fakeObject.isVideo = (!session.audio && session.video) || (session.audio && session.video);

                        if (response.mute) connection.onmute(fakeObject || response);
                        if (response.unmute) connection.onunmute(fakeObject || response);
                    }
                }

                if (response.isVolumeChanged) {
                    log('Volume of stream: ' + response.streamid + ' has changed to: ' + response.volume);
                    if (connection.streams[response.streamid]) {
                        var mediaElement = connection.streams[response.streamid].mediaElement;
                        if (mediaElement) mediaElement.volume = response.volume;
                    }
                }

                // to stop local stream
                if (response.stopped) {
                    if (connection.streams[response.streamid]) {
                        connection.onstreamended(connection.streams[response.streamid].streamObject);
                    }
                }

                // to stop remote stream
                if (response.promptStreamStop /* && !connection.isInitiator */ ) {
                    // var forceToStopRemoteStream = true;
                    // connection.streams['remote-stream-id'].stop( forceToStopRemoteStream );
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
                            if (stream.userid == userLeft) {
                                stopTracks(stream);
                                stream.stream.onended(stream.streamObject);
                            }
                        }
                    }

                    if (peer && peer.connection) {
                        if (peer.connection.signalingState != 'closed') {
                            peer.connection.close();
                        }
                        peer.connection = null;
                    }

                    if (response.closeEntireSession) {
                        connection.close();
                        connection.refresh();
                    } else if (socket && response.ejected) {
                        // if user is ejected; his stream MUST be removed
                        // from all other users' side
                        socket.send({
                            left: true,
                            extra: connection.extra,
                            userid: connection.userid
                        });

                        if (sockets[_config.socketIndex])
                            delete sockets[_config.socketIndex];
                        if (socketObjects[socket.channel])
                            delete socketObjects[socket.channel];

                        socket = null;
                    }

                    connection.remove(response.userid);

                    if (participants[response.userid]) delete participants[response.userid];
                    
                    if(response.closeEntireSession) {
                        connection.onSessionClosed(response);
                    }

                    connection.onleave({
                        userid: response.userid,
                        extra: response.extra,
                        entireSessionClosed: !!response.closeEntireSession
                    });
                }

                // keeping session active even if initiator leaves
                if (response.playRoleOfBroadcaster) {
                    if (response.extra) {
                        connection.extra = merge(connection.extra, response.extra);
                    }
                    setTimeout(connection.playRoleOfInitiator, 2000);
                }

                if (response.changeBandwidth) {
                    if (!connection.peers[response.userid]) throw 'No such peer exists.';

                    // synchronize bandwidth
                    connection.peers[response.userid].peer.bandwidth = response.bandwidth;

                    // renegotiate to apply bandwidth
                    connection.peers[response.userid].renegotiate();
                }

                if (response.customMessage) {
                    if (!connection.peers[response.userid]) throw 'No such peer exists.';
                    connection.peers[response.userid].onCustomMessage(response.message);
                }

                if (response.drop) {
                    if (!connection.peers[response.userid]) throw 'No such peer exists.';
                    connection.peers[response.userid].drop(true);
                    connection.peers[response.userid].renegotiate();

                    connection.ondrop(response.userid);
                }

                if (response.hold) {
                    if (!connection.peers[response.userid]) throw 'No such peer exists.';
                    connection.peers[response.userid].peer.hold = true;
                    connection.peers[response.userid].peer.holdMLine = response.holdMLine;
                    connection.peers[response.userid].renegotiate();

                    connection.peers[response.userid].fireHoldUnHoldEvents({
                        kind: response.holdMLine,
                        isHold: true,
                        userid: response.userid
                    });
                }

                if (response.unhold) {
                    if (!connection.peers[response.userid]) throw 'No such peer exists.';
                    connection.peers[response.userid].peer.hold = false;
                    connection.peers[response.userid].peer.holdMLine = response.holdMLine;
                    connection.peers[response.userid].renegotiate();

                    connection.peers[response.userid].fireHoldUnHoldEvents({
                        kind: response.holdMLine,
                        isHold: false,
                        userid: response.userid
                    });
                }

                // fake data channels!
                if (response.fakeData) {
                    peerConfig.onmessage(response.fakeData);
                }

                // sometimes we don't need to renegotiate e.g. when peers are disconnected
                // or if it is firefox
                if (response.recreatePeer) {
                    peer = new PeerConnection();
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
                        if (connection.peers[response.userid].peer.connection.iceConnectionState != 'disconnected') {
                            _config.redialing = false;
                        }

                        if (connection.peers[response.userid].peer.connection.iceConnectionState == 'disconnected' && !_config.redialing) {
                            _config.redialing = true;

                            warn('Peer connection is closed.', toStr(connection.peers[response.userid].peer.connection), 'ReDialing..');
                            connection.peers[response.userid].redial();
                        }
                    }
                }

                if (response.question == 'are-you-there') {
                    socket.send({
                        userid: connection.userid,
                        extra: connection.extra,
                        answer: 'yes-iam-connected'
                    });
                }

                if (response.answer == 'yes-iam-connected' && connection.peers[_config.userid]) {
                    connection.peers[_config.userid].connected = true;
                }
            }

            connection.playRoleOfInitiator = function () {
                connection.dontAttachStream = true;
                connection.open();
                sockets = swap(sockets);
                connection.dontAttachStream = false;
            };

            connection.askToShareParticipants = function () {
                defaultSocket && defaultSocket.send({
                    userid: connection.userid,
                    extra: connection.extra,
                    askToShareParticipants: true
                });
            };

            connection.shareParticipants = function (args) {
                var message = {
                    joinUsers: participants,
                    userid: connection.userid,
                    extra: connection.extra
                };

                if (args) {
                    if (args.dontShareWith) message.dontShareWith = args.dontShareWith;
                    if (args.shareWith) message.shareWith = args.shareWith;
                }

                defaultSocket.send(message);
            };

            function sdpInvoker(sdp, labels) {
                if (sdp.type == 'answer') {
                    peer.setRemoteDescription(sdp);
                    updateSocket();
                    return;
                }
                if (!_config.renegotiate && sdp.type == 'offer') {
                    peerConfig.offerDescription = sdp;

                    peerConfig.session = connection.session;
                    if (!peer) peer = new PeerConnection();
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
                    if (_config.capturing)
                        return;

                    _config.capturing = true;

                    connection.captureUserMedia(function (stream) {
                        _config.capturing = false;

                        if (isChrome || (isFirefox && !peer.connection.getLocalStreams().length)) {
                            peer.connection.addStream(stream);
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
                    if (isFirefox || _config.userinfo.browser == 'firefox') {
                        if (connection.peers[_config.userid]) {
                            connection.peers[_config.userid].redial();
                        }
                        return;
                    }

                    peer.recreateAnswer(sdp, session, function (_sdp, streaminfo) {
                        sendsdp({
                            sdp: _sdp,
                            socket: socket,
                            streaminfo: streaminfo
                        });
                    });
                }
            }
        }

        function detachMediaStream(labels, peer) {
            if (!labels) return;
            for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                if (connection.streams[label]) {
                    peer.removeStream(connection.streams[label].stream);
                }
            }
        }

        function sendsdp(e) {
            e.socket.send({
                userid: connection.userid,
                sdp: JSON.stringify(e.sdp),
                extra: connection.extra,
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

            if (!channel || !!participants[channel] || channel == connection.userid)
                return;

            var new_channel = connection.token();
            newPrivateSocket({
                channel: new_channel,
                extra: response.userData ? response.userData.extra : response.extra,
                userid: response.userData ? response.userData.userid : response.userid
            });

            defaultSocket.send({
                participant: true,
                userid: connection.userid,
                targetUser: channel,
                channel: new_channel,
                extra: connection.extra
            });
        }

        // if a user leaves

        function clearSession(channel) {
            connection.stats.numberOfConnectedUsers--;

            var alert = {
                left: true,
                extra: connection.extra,
                userid: connection.userid,
                sessionid: connection.sessionid
            };

            if (connection.isInitiator) {
                if (connection.autoCloseEntireSession) {
                    alert.closeEntireSession = true;
                } else if (sockets[0]) {
                    sockets[0].send({
                        playRoleOfBroadcaster: true,
                        userid: connection.userid
                    });
                }
            }

            if (!channel) {
                var length = sockets.length;
                for (var i = 0; i < length; i++) {
                    var socket = sockets[i];
                    if (socket) {
                        socket.send(alert);

                        if (socketObjects[socket.channel])
                            delete socketObjects[socket.channel];

                        delete sockets[i];
                    }
                }
            }

            // eject a specific user!
            if (channel) {
                socket = socketObjects[channel];
                if (socket) {
                    alert.ejected = true;
                    socket.send(alert);

                    if (sockets[socket.index])
                        delete sockets[socket.index];

                    delete socketObjects[channel];
                }
            }

            sockets = swap(sockets);
        }

        // www.RTCMultiConnection.org/docs/remove/
        connection.remove = function (userid) {
            if (rtcMultiSession.requestsFrom && rtcMultiSession.requestsFrom[userid]) delete rtcMultiSession.requestsFrom[userid];

            if (connection.peers[userid]) {
                if (connection.peers[userid].peer && connection.peers[userid].peer.connection) {
                    if (connection.peers[userid].peer.connection.signalingState != 'closed') {
                        connection.peers[userid].peer.connection.close();
                    }
                    connection.peers[userid].peer.connection = null;
                }
                delete connection.peers[userid];
            }
            if (participants[userid]) {
                delete participants[userid];
            }

            for (var stream in connection.streams) {
                stream = connection.streams[stream];
                if (stream.userid == userid) {
                    connection.onstreamended(stream.streamObject);
                    if (stream.stop) stream.stop();
                    delete connection.streams[stream];
                }
            }

            if (socketObjects[userid]) {
                delete socketObjects[userid];
            }
        };

        // www.RTCMultiConnection.org/docs/refresh/
        connection.refresh = function () {
            // if firebase; remove data from firebase servers
            if (connection.isInitiator && !!connection.socket && !!connection.socket.remove) {
                connection.socket.remove();
            }

            participants = {};

            // to stop/remove self streams
            for (var i = 0; i < connection.attachStreams.length; i++) {
                stopTracks(connection.attachStreams[i]);
            }

            // to allow capturing of identical streams
            currentUserMediaRequest = {
                streams: [],
                mutex: false,
                queueRequests: []
            };

            // to make sure remote streams are also removed!
            for (var stream in connection.streams) {
                if (connection._skip.indexOf(stream) == -1) {
                    connection.onstreamended(connection.streams[stream].streamObject);
                    delete connection.streams[stream];
                }
            }

            rtcMultiSession.isOwnerLeaving = true;
            
            connection.isInitiator = false;
            connection.isAcceptNewSession = true;
            connection.attachMediaStreams = [];
            connection.sessionDescription = null;
            connection.sessionDescriptions = {};
            connection.localStreamids = [];
            connection.preRecordedMedias = {};
            connection.snapshots = {};
            
            connection.stats = {
                numberOfConnectedUsers: 0,
                numberOfSessions: 0,
                sessions: {}
            };
            
            connection.attachStreams = [];
            connection.detachStreams = [];
            connection.fileQueue = {};
            connection.channels = {};
            connection.renegotiatedSessions = {};
            
            for(var peer in connection.peers) {
                if(peer != connection.userid) {
                    delete connection.peers[peer];
                }
            }
            
            for(var stream in connection.streams) {
                if (connection._skip.indexOf(stream) == -1) {
                    delete connection.streams[stream];
                }
            }
            
            socketObjects = {};
            sockets = [];
            participants = {};
        };

        // www.RTCMultiConnection.org/docs/reject/
        connection.reject = function (userid) {
            if (typeof userid != 'string') userid = userid.userid;
            defaultSocket.send({
                rejectedRequestOf: userid,
                userid: connection.userid,
                extra: connection.extra || {}
            });

            // remove relevant data to allow him join again
            connection.remove(userid);
        };

        window.addEventListener('beforeunload', function () {
            if (!connection.leaveOnPageUnload) return;

            clearSession();
        }, false);

        window.addEventListener('keyup', function (e) {
            if (!connection.leaveOnPageUnload) return;

            if (e.keyCode == 116) {
                clearSession();
            }
        }, false);

        function onSignalingReady() {
            if (rtcMultiSession.signalingReady) return;
            rtcMultiSession.signalingReady = true;

            setTimeout(callbackForSignalingReady, 1000);

            if (!connection.isInitiator) {
                // as soon as signaling gateway is connected;
                // user should check existing rooms!
                defaultSocket.send({
                    userid: connection.userid,
                    extra: connection.extra,
                    searchingForRooms: true
                });
            }
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
        var defaultSocket = connection.openSignalingChannel({
            onmessage: function (response) {
                if (response.userid == connection.userid) return;

                if (response.sessionid && response.userid) {
                    if (!connection.stats.sessions[response.sessionid]) {
                        connection.stats.numberOfSessions++;
                        connection.stats.sessions[response.sessionid] = response;
                    }
                }

                if (connection.isAcceptNewSession && response.sessionid && response.userid && !connection.sessionDescriptions[response.sessionid]) {
                    connection.sessionDescriptions[response.sessionid] = response;

                    if (!connection.dontOverrideSession) {
                        connection.session = response.session;
                    }

                    onNewSession(response);
                }

                if (response.newParticipant && !connection.isAcceptNewSession && rtcMultiSession.broadcasterid === response.userid) {
                    if (response.newParticipant != connection.userid) {
                        onNewParticipant(response);
                    }
                }

                if (getLength(participants) < connection.maxParticipantsAllowed && response.targetUser == connection.userid && response.participant && !participants[response.userid]) {
                    acceptRequest(response);
                }

                if (response.acceptedRequestOf == connection.userid) {
                    connection.onstatechange('request-accepted');
                }

                if (response.rejectedRequestOf == connection.userid) {
                    connection.onstatechange('request-rejected');
                }

                if (response.customMessage) {
                    if (response.message.drop) {
                        connection.ondrop(response.userid);

                        connection.attachStreams = [];
                        // "drop" should detach all local streams
                        for (var stream in connection.streams) {
                            if (connection._skip.indexOf(stream) == -1) {
                                stream = connection.streams[stream];
                                if (stream.type == 'local') {
                                    connection.detachStreams.push(stream.streamid);
                                    connection.onstreamended(stream.streamObject);
                                } else connection.onstreamended(stream.streamObject);
                            }
                        }

                        if (response.message.renegotiate) {
                            // renegotiate; so "peer.removeStream" happens.
                            connection.addStream();
                        }
                    } else if (connection.onCustomMessage) {
                        connection.onCustomMessage(response.message);
                    }
                }

                if (connection.isInitiator && response.searchingForRooms) {
                    defaultSocket && defaultSocket.send({
                        userid: connection.userid,
                        extra: connection.extra,
                        sessionDescription: connection.sessionDescription,
                        responseFor: response.userid
                    });
                }

                if (response.sessionDescription && response.responseFor == connection.userid) {
                    var sessionDescription = response.sessionDescription;
                    if (!connection.stats.sessions[sessionDescription.sessionid]) {
                        connection.stats.numberOfSessions++;
                        connection.stats.sessions[sessionDescription.sessionid] = sessionDescription;
                    }
                }

                if (connection.isInitiator && response.askToShareParticipants && defaultSocket) {
                    connection.shareParticipants({
                        shareWith: response.userid
                    });
                }

                // participants are shared with single user
                if (response.shareWith == connection.userid && response.dontShareWith != connection.userid && response.joinUsers) {
                    log('shareWith:joinUsers', response.joinUsers);
                    joinParticipants(response.joinUsers);
                }

                // participants are shared with all users
                if (!response.shareWith && response.joinUsers) {
                    log('all:joinUsers', response.joinUsers);
                    if (response.dontShareWith) {
                        if (connection.userid != response.dontShareWith) {
                            joinParticipants(response.joinUsers);
                        }
                    } else joinParticipants(response.joinUsers);
                }

                if (response.messageFor == connection.userid && response.presenceState) {
                    if (response.presenceState == 'checking') {
                        defaultSocket.send({
                            userid: connection.userid,
                            extra: connection.extra,
                            messageFor: response.userid,
                            presenceState: 'available',
                            _config: response._config
                        });
                    }

                    if (response.presenceState == 'available') {
                        joinSession(response._config);
                    }
                }

                if (response.donotJoin && response.messageFor == connection.userid) {
                    log(response.userid, 'is not joining your room.');
                }
            },
            callback: function (socket) {
                if (socket) defaultSocket = socket;
                if (onSignalingReady) onSignalingReady();
            },
            onopen: function (socket) {
                if (socket) defaultSocket = socket;
                if (onSignalingReady) onSignalingReady();
            }
        });

        if (defaultSocket && onSignalingReady) setTimeout(onSignalingReady, 2000);
        
        if(connection.session.screen) {
            loadScreenFrame();
        }
        
        connection.getExternalIceServers && loadIceFrame(function(iceServers) {
            connection.iceServers = connection.iceServers.concat(iceServers);
        });

        function setDirections() {
            var userMaxParticipantsAllowed = 0;

            // if user has set a custom max participant setting, remember it
            if (connection.maxParticipantsAllowed != 256) {
                userMaxParticipantsAllowed = connection.maxParticipantsAllowed;
            }

            if (connection.direction == 'one-way') connection.session.oneway = true;
            if (connection.direction == 'one-to-one') connection.maxParticipantsAllowed = 1;
            if (connection.direction == 'one-to-many') connection.session.broadcast = true;
            if (connection.direction == 'many-to-many') {
                if (!connection.maxParticipantsAllowed || connection.maxParticipantsAllowed == 1) {
                    connection.maxParticipantsAllowed = 256;
                }
            }

            // if user has set a custom max participant setting, set it back
            if (userMaxParticipantsAllowed && connection.maxParticipantsAllowed != 1) {
                connection.maxParticipantsAllowed = userMaxParticipantsAllowed;
            }
        }

        // open new session
        this.initSession = function (args) {
            rtcMultiSession.isOwnerLeaving = false;

            setDirections();
            participants = {};

            rtcMultiSession.isOwnerLeaving = false;

            if (typeof args.transmitRoomOnce != 'undefined') {
                connection.transmitRoomOnce = args.transmitRoomOnce;
            }

            function transmit() {
                if (defaultSocket && getLength(participants) < connection.maxParticipantsAllowed && !rtcMultiSession.isOwnerLeaving) {
                    defaultSocket.send(connection.sessionDescription);
                }

                if (!connection.transmitRoomOnce && !rtcMultiSession.isOwnerLeaving)
                    setTimeout(transmit, connection.interval || 3000);
            }

            // todo: test and fix next line.
            if (!args.dontTransmit /* || connection.transmitRoomOnce */ ) transmit();
        };

        function joinSession(_config) {
            if (rtcMultiSession.donotJoin && rtcMultiSession.donotJoin == _config.sessionid) {
                return;
            }

            rtcMultiSession.presenceState = 'available';
            connection.onstatechange('room-available');

            // dontOverrideSession allows you force RTCMultiConnection
            // to not override default session of participants;
            // by default, session is always overridden and set to the session coming from initiator!
            if (!connection.dontOverrideSession) {
                connection.session = _config.session || {};
            }

            rtcMultiSession.broadcasterid = _config.userid;

            if (_config.sessionid) {
                // used later to prevent external rooms messages to be used by this user!
                connection.sessionid = _config.sessionid;
            }

            connection.isAcceptNewSession = false;

            var channel = getRandomString();
            newPrivateSocket({
                channel: channel,
                extra: _config.extra || {},
                userid: _config.userid
            });

            var mandatory = connection.sdpConstraints.mandatory;
            if (typeof mandatory.OfferToReceiveAudio == 'undefined') {
                connection.sdpConstraints.mandatory.OfferToReceiveAudio = !!connection.session.audio;
            }
            if (typeof mandatory.OfferToReceiveVideo == 'undefined') {
                connection.sdpConstraints.mandatory.OfferToReceiveVideo = !!connection.session.video || !!connection.session.screen;
            }

            log(toStr(connection.sdpConstraints.mandatory));

            var offers = {};
            if (connection.attachStreams.length) {
                var stream = connection.attachStreams[connection.attachStreams.length - 1];
                if (stream.getAudioTracks().length) {
                    offers.audio = true;
                }
                if (stream.getVideoTracks().length) {
                    offers.video = true;
                }
            }

            log(toStr(offers));

            connection.onstatechange('connecting-with-initiator');
            defaultSocket.send({
                participant: true,
                userid: connection.userid,
                channel: channel,
                targetUser: _config.userid,
                extra: connection.extra,
                session: connection.session,
                offers: {
                    audio: !!offers.audio,
                    video: !!offers.video
                }
            });

            connection.skipOnNewSession = false;
        }

        // join existing session
        this.joinSession = function (_config) {
            if (!defaultSocket)
                return setTimeout(function () {
                    warn('Default-Socket is not yet initialized.');
                    rtcMultiSession.joinSession(_config);
                }, 1000);

            _config = _config || {};
            participants = {};

            rtcMultiSession.presenceState = 'checking';

            connection.onstatechange('detecting-room-presence');

            defaultSocket.send({
                userid: connection.userid,
                extra: connection.extra,
                messageFor: _config.userid,
                presenceState: rtcMultiSession.presenceState,
                _config: {
                    userid: _config.userid,
                    extra: _config.extra || {},
                    sessionid: _config.sessionid,
                    session: _config.session || false
                }
            });

            setTimeout(function () {
                if (rtcMultiSession.presenceState == 'checking') {
                    connection.onstatechange('room-not-available', 'Unable to reach session initiator.');
                    joinSession(_config)
                }
            }, 3000);
        };

        connection.donotJoin = function (sessionid) {
            rtcMultiSession.donotJoin = sessionid;

            var session = connection.sessionDescriptions[sessionid];
            if (!session) return;

            defaultSocket.send({
                userid: connection.userid,
                extra: connection.extra,
                donotJoin: true,
                messageFor: session.userid,
                sessionid: sessionid
            });

            participants = {};
            connection.isAcceptNewSession = true;
            connection.sessionid = null;
        };

        // send file/data or text message
        this.send = function (message, _channel) {
            message = JSON.stringify({
                extra: connection.extra,
                userid: connection.userid,
                data: message
            });

            if (_channel) {
                if (_channel.readyState == 'open') {
                    _channel.send(message);
                }
                return;
            }

            for (var dataChannel in connection.channels) {
                var channel = connection.channels[dataChannel].channel;
                if (channel.readyState == 'open') {
                    channel.send(message);
                }
            }
        };

        // leave session
        this.leave = function (userid) {
            clearSession(userid);
            connection.refresh();
        };

        // renegotiate new stream
        this.addStream = function (e) {
            var session = e.renegotiate;

            if (!connection.renegotiatedSessions[JSON.stringify(e.renegotiate)]) {
                connection.renegotiatedSessions[JSON.stringify(e.renegotiate)] = {
                    session: e.renegotiate,
                    stream: e.stream
                };
            }

            if (e.socket) {
                if (e.socket.userid != connection.userid) {
                    addStream(connection.peers[e.socket.userid]);
                }
            } else {
                for (var peer in connection.peers) {
                    if (peer != connection.userid) {
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
                        peer.connection.addStream(e.stream);
                    }
                }

                // because Firefox has no support of renegotiation yet;
                // so both chrome and firefox should redial instead of renegotiate!
                if (isFirefox || _peer.userinfo.browser == 'firefox') {
                    return _peer.redial();
                }

                peer.recreateOffer(session, function (sdp, streaminfo) {
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

        // www.RTCMultiConnection.org/docs/request/
        connection.request = function (userid, extra) {
            connection.captureUserMedia(function () {
                // open private socket that will be used to receive offer-sdp
                newPrivateSocket({
                    channel: connection.userid,
                    extra: extra || {},
                    userid: userid
                });

                // ask other user to create offer-sdp
                defaultSocket.send({
                    participant: true,
                    userid: connection.userid,
                    extra: connection.extra || {},
                    targetUser: userid
                });
            });
        };

        function acceptRequest(response) {
            if (!rtcMultiSession.requestsFrom) rtcMultiSession.requestsFrom = {};
            if (rtcMultiSession.requestsFrom[response.userid]) return;

            var obj = {
                userid: response.userid,
                extra: response.extra,
                channel: response.channel || response.userid,
                session: response.session || connection.session
            };

            // check how participant is willing to join
            if (response.offers) {
                if(response.offers.audio && response.offers.video) {
                    log('target user has both audio/video streams.');
                }
                else if(response.offers.audio && !response.offers.video) {
                    log('target user has only audio stream.');
                }
                else if(!response.offers.audio && response.offers.video) {
                    log('target user has only video stream.');
                }
                else {
                    log('target user has no stream; it seems one-way streaming.');
                }

                var mandatory = connection.sdpConstraints.mandatory;
                if (typeof mandatory.OfferToReceiveAudio == 'undefined') {
                    connection.sdpConstraints.mandatory.OfferToReceiveAudio = !!response.offers.audio;
                }
                if (typeof mandatory.OfferToReceiveVideo == 'undefined') {
                    connection.sdpConstraints.mandatory.OfferToReceiveVideo = !!response.offers.video;
                }

                log('target user\'s SDP has?', toStr(connection.sdpConstraints.mandatory));
            }

            rtcMultiSession.requestsFrom[response.userid] = obj;

            // www.RTCMultiConnection.org/docs/onRequest/
            if (connection.onRequest && connection.isInitiator) {
                connection.onRequest(obj);
            } else _accept(obj);
        }

        function _accept(e) {
            if (rtcMultiSession.captureUserMediaOnDemand) {
                rtcMultiSession.captureUserMediaOnDemand = false;
                connection.captureUserMedia(function () {
                    _accept(e);

                    // to let user know that media resource has been captured
                    if (rtcMultiSession.onMediaCaptured) rtcMultiSession.onMediaCaptured();
                });
                return;
            }

            log('accepting request from', e.userid);
            participants[e.userid] = e.userid;
            newPrivateSocket({
                isofferer: true,
                userid: e.userid,
                channel: e.channel,
                extra: e.extra || {},
                session: e.session || connection.session
            });
        }

        // www.RTCMultiConnection.org/docs/sendCustomMessage/
        connection.sendCustomMessage = function (message) {
            if (!defaultSocket) {
                return setTimeout(function () {
                    connection.sendCustomMessage(message);
                }, 1000);
            }

            defaultSocket.send({
                userid: connection.userid,
                customMessage: true,
                message: message
            });
        };

        // www.RTCMultiConnection.org/docs/accept/
        connection.accept = function (e) {
            // for backward compatibility
            if (arguments.length > 1 && typeof arguments[0] == 'string') {
                e = {};
                if (arguments[0]) e.userid = arguments[0];
                if (arguments[1]) e.extra = arguments[1];
                if (arguments[2]) e.channel = arguments[2];
            }

            connection.captureUserMedia(function () {
                _accept(e);
            });
        };
    }

    var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

    function PeerConnection() {
        return {
            create: function (type, options) {
                merge(this, options);

                var self = this;

                this.type = type;
                this.init();
                this.attachMediaStreams();

                if (isFirefox && this.session.data) {
                    if (this.session.data && type == 'offer') {
                        this.createDataChannel();
                    }

                    this.getLocalDescription(type);

                    if (this.session.data && type == 'answer') {
                        this.createDataChannel();
                    }
                } else self.getLocalDescription(type);

                return this;
            },
            getLocalDescription: function (type) {
                log('peer type is', type);

                if (type == 'answer') {
                    this.setRemoteDescription(this.offerDescription);
                }

                var self = this;
                this.connection[type == 'offer' ? 'createOffer' : 'createAnswer'](function (sessionDescription) {
                    sessionDescription.sdp = self.serializeSdp(sessionDescription.sdp);
                    self.connection.setLocalDescription(sessionDescription);

                    if (self.trickleIce) {
                        self.onSessionDescription(sessionDescription, self.streaminfo);
                    }

                    if (sessionDescription.type == 'offer') {
                        log('offer sdp', sessionDescription.sdp);
                    }
                }, this.onSdpError, this.constraints);
            },
            serializeSdp: function (sdp) {
                // it is "connection.processSdp"
                sdp = this.processSdp(sdp);

                if (isFirefox) return sdp;

                sdp = this.setBandwidth(sdp);
                if (this.holdMLine == 'both') {
                    if (this.hold) {
                        this.prevSDP = sdp;
                        sdp = sdp.replace(/sendonly|recvonly|sendrecv/g, 'inactive');
                    } else if (this.prevSDP) {
                        sdp = this.prevSDP;
                    }
                } else if (this.holdMLine == 'audio' || this.holdMLine == 'video') {
                    sdp = sdp.split('m=');

                    var audio = '';
                    var video = '';

                    if (sdp[1] && sdp[1].indexOf('audio') == 0) {
                        audio = 'm=' + sdp[1];
                    }
                    if (sdp[2] && sdp[2].indexOf('audio') == 0) {
                        audio = 'm=' + sdp[2];
                    }

                    if (sdp[1] && sdp[1].indexOf('video') == 0) {
                        video = 'm=' + sdp[1];
                    }
                    if (sdp[2] && sdp[2].indexOf('video') == 0) {
                        video = 'm=' + sdp[2];
                    }

                    if (this.holdMLine == 'audio') {
                        if (this.hold) {
                            this.prevSDP = sdp[0] + audio + video;
                            sdp = sdp[0] + audio.replace(/sendonly|recvonly|sendrecv/g, 'inactive') + video;
                        } else if (this.prevSDP) {
                            sdp = this.prevSDP;
                        }
                    }

                    if (this.holdMLine == 'video') {
                        if (this.hold) {
                            this.prevSDP = sdp[0] + audio + video;
                            sdp = sdp[0] + audio + video.replace(/sendonly|recvonly|sendrecv/g, 'inactive');
                        } else if (this.prevSDP) {
                            sdp = this.prevSDP;
                        }
                    }
                }
                return sdp;
            },
            init: function () {
                this.setConstraints();
                this.connection = new RTCPeerConnection(this.iceServers, this.optionalArgument);

                if (this.session.data) {
                    log('invoked: createDataChannel');
                    this.createDataChannel();
                }

                this.connection.onicecandidate = function (event) {
                    if (!event.candidate) {
                        if (!self.trickleIce) {
                            returnSDP();
                        }

                        return;
                    }

                    if (!self.trickleIce) return;
                    self.onicecandidate(event.candidate);
                };

                this.connection.ongatheringchange = function () {
                    // this method is usually not fired.
                    // todo: need to fix event listeners
                    log('iceGatheringState', self.connection.iceGatheringState);

                    if (self.trickleIce) return;
                    if (self.connection.iceGatheringState == 'complete') {
                        returnSDP();
                    }
                };

                function returnSDP() {
                    self.onSessionDescription(self.connection.localDescription, self.streaminfo);
                }

                this.connection.onaddstream = function (e) {
                    log('onaddstream', toStr(e.stream));

                    self.onaddstream(e.stream, self.session);
                };

                this.connection.onremovestream = function (e) {
                    self.onremovestream(e.stream);
                };

                this.connection.onsignalingstatechange = function () {
                    self.connection && self.oniceconnectionstatechange({
                        iceConnectionState: self.connection.iceConnectionState,
                        iceGatheringState: self.connection.iceGatheringState,
                        signalingState: self.connection.signalingState
                    });
                };

                this.connection.oniceconnectionstatechange = function () {
                    self.connection && self.oniceconnectionstatechange({
                        iceConnectionState: self.connection.iceConnectionState,
                        iceGatheringState: self.connection.iceGatheringState,
                        signalingState: self.connection.signalingState
                    });
                };
                var self = this;
            },
            setBandwidth: function (sdp) {
                if (isMobileDevice || isFirefox || !this.bandwidth) return sdp;

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
            setConstraints: function () {
                this.constraints = {
                    optional: this.sdpConstraints.optional || isChrome ? [{
                        VoiceActivityDetection: false
                    }] : [],
                    mandatory: this.sdpConstraints.mandatory || {
                        OfferToReceiveAudio: !!this.session.audio,
                        OfferToReceiveVideo: !!this.session.video || !!this.session.screen
                    }
                };

                if (this.constraints.mandatory) {
                    log('sdp-mandatory-constraints', toStr(this.constraints.mandatory));
                }

                if (this.constraints.optional) {
                    log('sdp-optional-constraints', toStr(this.constraints.optional));
                }

                this.optionalArgument = {
                    optional: this.optionalArgument.optional || [{
                        DtlsSrtpKeyAgreement: true
                    }],
                    mandatory: this.optionalArgument.mandatory || {}
                };

                if (!this.preferSCTP) {
                    this.optionalArgument.optional.push({
                        RtpDataChannels: true
                    });
                }

                log('optional-argument', toStr(this.optionalArgument.optional));

                if (typeof this.iceServers != 'undefined') {
                    this.iceServers = {
                        iceServers: this.iceServers
                    };
                } else this.iceServers = null;

                log('ice-servers', toStr(this.iceServers.iceServers));
            },
            onSdpError: function (e) {
                var message = toStr(e);

                if (message && message.indexOf('RTP/SAVPF Expects at least 4 fields') != -1) {
                    message = 'It seems that you are trying to interop RTP-datachannels with SCTP. It is not supported!';
                }
                error('onSdpError:', message);
            },
            onSdpSuccess: function () {
                log('sdp success');
            },
            onMediaError: function (err) {
                error(toStr(err));
            },
            setRemoteDescription: function (sessionDescription) {
                if (!sessionDescription) throw 'Remote session description should NOT be NULL.';

                log('setting remote description', sessionDescription.type, sessionDescription.sdp);
                this.connection.setRemoteDescription(
                    new RTCSessionDescription(sessionDescription),
                    this.onSdpSuccess, this.onSdpError
                );
            },
            addIceCandidate: function (candidate) {
                var iceCandidate = new RTCIceCandidate({
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: candidate.candidate
                });

                this.connection.addIceCandidate(iceCandidate, function () {}, function () {
                    error('onIceFailure', arguments, candidate.candidate);
                });
            },
            createDataChannel: function (channelIdentifier) {
                if (!this.channels) this.channels = [];

                // protocol: 'text/chat', preset: true, stream: 16
                // maxRetransmits:0 && ordered:false
                var dataChannelDict = {};

                if (this.dataChannelDict) dataChannelDict = this.dataChannelDict;

                if (isChrome && !this.preferSCTP) {
                    dataChannelDict.reliable = false; // Deprecated!
                }

                log('dataChannelDict', toStr(dataChannelDict));

                if (this.type == 'answer' || isFirefox) {
                    this.connection.ondatachannel = function (event) {
                        self.setChannelEvents(event.channel);
                    };
                }

                if ((isChrome && this.type == 'offer') || isFirefox) {
                    this.setChannelEvents(
                        this.connection.createDataChannel(channelIdentifier || 'channel', dataChannelDict)
                    );
                }

                var self = this;
            },
            setChannelEvents: function (channel) {
                var self = this;
                channel.onmessage = function (event) {
                    self.onmessage(event.data);
                };

                var numberOfTimes = 0;
                channel.onopen = function () {
                    channel.push = channel.send;
                    channel.send = function (data) {
                        if (channel.readyState != 'open') {
                            numberOfTimes++;
                            return setTimeout(function () {
                                if (numberOfTimes < 20) {
                                    channel.send(data);
                                } else throw 'Number of times exceeded to wait for WebRTC data connection to be opened.';
                            }, 1000);
                        }
                        try {
                            channel.push(data);
                        } catch (e) {
                            numberOfTimes++;
                            warn('Data transmission failed. Re-transmitting..', numberOfTimes, toStr(e));
                            if (numberOfTimes >= 20) throw 'Number of times exceeded to resend data packets over WebRTC data channels.';
                            setTimeout(function () {
                                channel.send(data);
                            }, 100);
                        }
                    };
                    self.onopen(channel);
                };

                channel.onerror = function (event) {
                    self.onerror(event);
                };

                channel.onclose = function (event) {
                    self.onclose(event);
                };

                this.channels.push(channel);
            },
            attachMediaStreams: function () {
                var streams = this.attachStreams;
                for (var i = 0; i < streams.length; i++) {
                    log('attaching stream:', streams[i].streamid);
                    this.connection.addStream(streams[i]);
                }
                this.getStreamInfo();
            },
            getStreamInfo: function () {
                this.streaminfo = '';
                var streams = this.attachStreams;
                for (var i = 0; i < streams.length; i++) {
                    if (i == 0) {
                        this.streaminfo = streams[i].streamid;
                    } else {
                        this.streaminfo += '----' + streams[i].streamid;
                    }
                }
                this.attachStreams = [];
            },
            recreateOffer: function (renegotiate, callback) {
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
            recreateAnswer: function (sdp, session, callback) {
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

    var video_constraints = {
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
        if (currentUserMediaRequest.mutex === true) {
            currentUserMediaRequest.queueRequests.push(options);
            return;
        }
        currentUserMediaRequest.mutex = true;

        var connection = options.connection;

        // tools.ietf.org/html/draft-alvestrand-constraints-resolution-00
        var mediaConstraints = options.mediaConstraints || {};
        var n = navigator,
            hints = options.constraints || {
                audio: true,
                video: video_constraints
            };

        if (hints.video == true) hints.video = video_constraints;

        // connection.mediaConstraints.audio = false;
        if (typeof mediaConstraints.audio != 'undefined') {
            hints.audio = mediaConstraints.audio;
        }

        // connection.mediaConstraints.video = false;
        if (typeof mediaConstraints.video != 'undefined' && hints.video) {
            hints.video = merge(hints.video, mediaConstraints.video);
        }

        // connection.media.min(320,180);
        // connection.media.max(1920,1080);
        var mandatoryConstraints = mediaConstraints.mandatory;
        if (isChrome && mandatoryConstraints) {
            var mandatory = {};

            if (mandatoryConstraints.minWidth) {
                mandatory.minWidth = mandatoryConstraints.minWidth;
            }

            if (mandatoryConstraints.minHeight) {
                mandatory.minHeight = mandatoryConstraints.minHeight;
            }

            if (mandatoryConstraints.maxWidth) {
                mandatory.maxWidth = mandatoryConstraints.maxWidth;
            }

            if (mandatoryConstraints.maxHeight) {
                mandatory.maxHeight = mandatoryConstraints.maxHeight;
            }

            if (mandatoryConstraints.minAspectRatio) {
                mandatory.minAspectRatio = mandatoryConstraints.minAspectRatio;
            }

            if (mandatoryConstraints.maxFrameRate) {
                mandatory.maxFrameRate = mandatoryConstraints.maxFrameRate;
            }

            if (mandatoryConstraints.minFrameRate) {
                mandatory.minFrameRate = mandatoryConstraints.minFrameRate;
            }

            if (mandatory.minWidth && mandatory.minHeight) {
                // code.google.com/p/chromium/issues/detail?id=143631#c9
                var allowed = ['1920:1080', '1280:720', '960:720', '640:360', '640:480', '320:240', '320:180'];

                if (allowed.indexOf(mandatory.minWidth + ':' + mandatory.minHeight) == -1 ||
                    allowed.indexOf(mandatory.maxWidth + ':' + mandatory.maxHeight) == -1) {
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

        if (mediaConstraints.mandatory) {
            hints.video.mandatory = merge(hints.video.mandatory, mediaConstraints.mandatory);
        }

        // mediaConstraints.optional.bandwidth = 1638400;
        if (mediaConstraints.optional && mediaConstraints.optional.forEach) {
            hints.video.optional = mediaConstraints.optional;
        }

        if (hints.video.mandatory && !isEmpty(hints.video.mandatory) && connection._mediaSources.video) {
            hints.video.optional.forEach(function (video, index) {
                if (video.sourceId == connection._mediaSources.video) {
                    delete hints.video.optional[index];
                }
            });

            hints.video.optional = swap(hints.video.optional);

            hints.video.optional.push({
                sourceId: connection._mediaSources.video
            });
        }

        if (hints.audio.mandatory && !isEmpty(hints.audio.mandatory) && connection._mediaSources.audio) {
            hints.audio.optional.forEach(function (audio, index) {
                if (audio.sourceId == connection._mediaSources.audio) {
                    delete hints.audio.optional[index];
                }
            });

            hints.audio.optional = swap(hints.audio.optional);

            hints.audio.optional.push({
                sourceId: connection._mediaSources.audio
            });
        }

        if (hints.video && hints.video.optional && hints.video.mandatory) {
            if (!hints.video.optional.length && isEmpty(hints.video.mandatory)) {
                hints.video = true;
            }
        }

        log('media hints:', toStr(hints));

        // easy way to match 
        var idInstance = JSON.stringify(hints);

        function streaming(stream, returnBack, streamid) {
            if (!streamid) streamid = getRandomString();

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
            if (currentUserMediaRequest.queueRequests.length)
                getUserMedia(currentUserMediaRequest.queueRequests.shift());
        }

        if (currentUserMediaRequest.streams[idInstance]) {
            streaming(currentUserMediaRequest.streams[idInstance].stream, true, currentUserMediaRequest.streams[idInstance].streamid);
        } else {
            n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;

            // http://dev.w3.org/2011/webrtc/editor/getusermedia.html#navigatorusermedia-interface-extensions
            n.getMedia(hints, streaming, function (error) {
                options.onerror(error, hints);
            });
        }
    }

    var FileSender = {
        send: function (config) {
            var connection = config.connection;
            var channel = config.channel;
            var privateChannel = config._channel;
            var file = config.file;

            if (!config.file) {
                error('You must select a file or pass Blob.');
                return;
            }

            // max chunk sending limit on chrome is 64k
            // max chunk receiving limit on firefox is 16k
            var packetSize = (!!navigator.mozGetUserMedia || connection.preferSCTP) ? 15 * 1000 : 1 * 1000;

            if (connection.chunkSize) {
                packetSize = connection.chunkSize;
            }

            var textToTransfer = '';
            var numberOfPackets = 0;
            var packets = 0;

            file.uuid = getRandomString();

            function processInWebWorker() {
                var blob = URL.createObjectURL(new Blob(['function readFile(_file) {postMessage(new FileReaderSync().readAsDataURL(_file));};this.onmessage =  function (e) {readFile(e.data);}'], {
                    type: 'application/javascript'
                }));

                var worker = new Worker(blob);
                URL.revokeObjectURL(blob);
                return worker;
            }

            if (!!window.Worker && !isMobileDevice) {
                var webWorker = processInWebWorker();

                webWorker.onmessage = function (event) {
                    onReadAsDataURL(event.data);
                };

                webWorker.postMessage(file);
            } else {
                var reader = new FileReader();
                reader.onload = function (e) {
                    onReadAsDataURL(e.target.result);
                };
                reader.readAsDataURL(file);
            }

            function onReadAsDataURL(dataURL, text) {
                var data = {
                    type: 'file',
                    uuid: file.uuid,
                    maxChunks: numberOfPackets,
                    currentPosition: numberOfPackets - packets,
                    name: file.name,
                    fileType: file.type,
                    size: file.size,

                    userid: connection.userid,
                    extra: connection.extra
                };

                if (dataURL) {
                    text = dataURL;
                    numberOfPackets = packets = data.packets = parseInt(text.length / packetSize);

                    file.maxChunks = data.maxChunks = numberOfPackets;
                    data.currentPosition = numberOfPackets - packets;

                    file.userid = connection.userid;
                    file.extra = connection.extra;
                    file.sending = true;
                    connection.onFileStart(file);
                }

                connection.onFileProgress({
                    remaining: packets--,
                    length: numberOfPackets,
                    sent: numberOfPackets - packets,

                    maxChunks: numberOfPackets,
                    uuid: file.uuid,
                    currentPosition: numberOfPackets - packets,

                    sending: true
                }, file.uuid);

                if (text.length > packetSize) data.message = text.slice(0, packetSize);
                else {
                    data.message = text;
                    data.last = true;
                    data.name = file.name;

                    file.url = URL.createObjectURL(file);
                    file.userid = connection.userid;
                    file.extra = connection.extra;
                    file.sending = true;
                    connection.onFileEnd(file);
                }

                channel.send(data, privateChannel);

                textToTransfer = text.slice(data.message.length);
                if (textToTransfer.length) {
                    setTimeout(function () {
                        onReadAsDataURL(null, textToTransfer);
                    }, connection.chunkInterval || 100);
                }
            }
        }
    };

    function FileReceiver(connection) {
        var content = {},
            packets = {},
            numberOfPackets = {};

        function receive(data) {
            var uuid = data.uuid;

            if (typeof data.packets !== 'undefined') {
                numberOfPackets[uuid] = packets[uuid] = parseInt(data.packets);
                data.sending = false;
                connection.onFileStart(data);
            }

            connection.onFileProgress({
                remaining: packets[uuid]--,
                length: numberOfPackets[uuid],
                received: numberOfPackets[uuid] - packets[uuid],

                maxChunks: numberOfPackets[uuid],
                uuid: uuid,
                currentPosition: numberOfPackets[uuid] - packets[uuid],

                sending: false
            }, uuid);

            if (!content[uuid]) content[uuid] = [];

            content[uuid].push(data.message);

            if (data.last) {
                var dataURL = content[uuid].join('');

                FileConverter.DataURLToBlob(dataURL, data.fileType, function (blob) {
                    blob.uuid = uuid;
                    blob.name = data.name;
                    blob.type = data.fileType;

                    blob.url = (window.URL || window.webkitURL).createObjectURL(blob);

                    blob.sending = false;
                    blob.userid = data.userid || connection.userid;
                    blob.extra = data.extra || connection.extra;
                    connection.onFileEnd(blob);

                    if (connection.autoSaveToDisk) {
                        FileSaver.SaveToDisk(blob.url, data.name);
                    }

                    delete content[uuid];
                });
            }
        }

        return {
            receive: receive
        };
    }

    var FileSaver = {
        SaveToDisk: function (fileUrl, fileName) {
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

    var FileConverter = {
        DataURLToBlob: function (dataURL, fileType, callback) {

            function processInWebWorker() {
                var blob = URL.createObjectURL(new Blob(['function getBlob(_dataURL, _fileType) {var binary = atob(_dataURL.substr(_dataURL.indexOf(",") + 1)),i = binary.length,view = new Uint8Array(i);while (i--) {view[i] = binary.charCodeAt(i);};postMessage(new Blob([view], {type: _fileType}));};this.onmessage =  function (e) {var data = JSON.parse(e.data); getBlob(data.dataURL, data.fileType);}'], {
                    type: 'application/javascript'
                }));

                var worker = new Worker(blob);
                URL.revokeObjectURL(blob);
                return worker;
            }

            if (!!window.Worker && !isMobileDevice) {
                var webWorker = processInWebWorker();

                webWorker.onmessage = function (event) {
                    callback(event.data);
                };

                webWorker.postMessage(JSON.stringify({
                    dataURL: dataURL,
                    fileType: fileType
                }));
            } else {
                var binary = atob(dataURL.substr(dataURL.indexOf(',') + 1)),
                    i = binary.length,
                    view = new Uint8Array(i);

                while (i--) {
                    view[i] = binary.charCodeAt(i);
                }

                callback(new Blob([view]));
            }
        }
    };

    var TextSender = {
        send: function (config) {
            var connection = config.connection;

            var channel = config.channel,
                _channel = config._channel,
                initialText = config.text,
                packetSize = connection.chunkSize || 1000,
                textToTransfer = '',
                isobject = false;

            if (typeof initialText !== 'string') {
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

                if (text.length > packetSize)
                    data.message = text.slice(0, packetSize);
                else {
                    data.message = text;
                    data.last = true;
                    data.isobject = isobject;
                }

                channel.send(data, _channel);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length) {
                    setTimeout(function () {
                        sendText(null, textToTransfer);
                    }, connection.chunkInterval || 100);
                }
            }
        }
    };

    function TextReceiver(connection) {
        var content = {};

        function receive(data, userid, extra) {
            // uuid is used to uniquely identify sending instance
            var uuid = data.uuid;
            if (!content[uuid]) content[uuid] = [];

            content[uuid].push(data.message);
            if (data.last) {
                var message = content[uuid].join('');
                if (data.isobject) message = JSON.parse(message);

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
                    connection.Translator.TranslateText(e.data, function (translatedText) {
                        e.data = translatedText;
                        connection.onmessage(e);
                    });
                } else if (message.isPartOfScreen) {
                    connection.onpartofscreen(message);
                } else connection.onmessage(e);

                delete content[uuid];
            }
        }

        return {
            receive: receive
        };
    }

    function convertToAudioStream(mediaStream) {
        if (!mediaStream) throw 'MediaStream is mandatory.';

        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(mediaStream);

        var destination = context.createMediaStreamDestination();
        mediaStreamSource.connect(destination);

        return destination.stream;
    }

    var isChrome = !!navigator.webkitGetUserMedia;
    var isFirefox = !!navigator.mozGetUserMedia;
    var isMobileDevice = navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);

    // detect node-webkit
    var isNodeWebkit = window.process && (typeof window.process == 'object') && window.process.versions && window.process.versions['node-webkit'];

    window.MediaStream = window.MediaStream || window.webkitMediaStream;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    function getRandomString() {
        return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
    }

    var chromeVersion = 50;
    if (isChrome && navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) {
        chromeVersion = parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10);
    }

    function isData(session) {
        return !session.audio && !session.video && !session.screen && session.data;
    }

    function isEmpty(session) {
        var length = 0;
        for (var s in session) {
            length++;
        }
        return length == 0;
    }

    function swap(arr) {
        var swapped = [],
            length = arr.length;
        for (var i = 0; i < length; i++)
            if (arr[i] && arr[i] !== true)
                swapped.push(arr[i]);
        return swapped;
    }

    if (isChrome || isFirefox) {
        var log = console.log.bind(console);
        var error = console.error.bind(console);
        var warn = console.warn.bind(console);
    } else {
        function log() {
            console.log(arguments);
        }

        function error() {
            console.error(arguments);
        }

        function warn() {
            console.warn(arguments);
        }
    }

    function toStr(obj) {
        return JSON.stringify(obj, function (key, value) {
            if (value && value.sdp) {
                log(value.sdp.type, '\t', value.sdp.sdp);
                return '';
            } else return value;
        }, '\t');
    }

    function getLength(obj) {
        var length = 0;
        for (var o in obj)
            if (o) length++;
        return length;
    }

    // Get HTMLAudioElement/HTMLVideoElement accordingly

    function createMediaElement(stream, session) {
        var isAudio = session.audio && !session.video && !session.screen;
        if (isChrome && stream.getAudioTracks && stream.getVideoTracks) {
            isAudio = stream.getAudioTracks().length && !stream.getVideoTracks().length;
        }

        var mediaElement = document.createElement(isAudio ? 'audio' : 'video');

        // "mozSrcObject" is always preferred over "src"!!
        mediaElement[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);

        mediaElement.controls = true;
        mediaElement.autoplay = !!session.remote;
        mediaElement.muted = session.remote ? false : true;

        mediaElement.play();

        return mediaElement;
    }

    function merge(mergein, mergeto) {
        if (!mergein) mergein = {};
        if (!mergeto) return mergein;

        for (var item in mergeto) {
            mergein[item] = mergeto[item];
        }
        return mergein;
    }

    function loadScript(src, onload) {
        var script = document.createElement('script');
        script.src = src;
        if (onload) script.onload = onload;
        document.documentElement.appendChild(script);
    }
    
    var screenFrame, loadedScreenFrame;

    function loadScreenFrame(skip) {
        if(DetectRTC.screen.extensionid != ReservedExtensionID) {
            return;
        }
        
        if(loadedScreenFrame) return;
        if(!skip) return loadScreenFrame(true);

        loadedScreenFrame = true;

        var iframe = document.createElement('iframe');
        iframe.onload = function () {
            iframe.isLoaded = true;
            log('Screen Capturing frame is loaded.');
        };
        iframe.src = 'https://www.webrtc-experiment.com/getSourceId/';
        iframe.style.display = 'none';
        (document.body || document.documentElement).appendChild(iframe);

        screenFrame = {
            postMessage: function () {
                if (!iframe.isLoaded) {
                    setTimeout(screenFrame.postMessage, 100);
                    return;
                }
                iframe.contentWindow.postMessage({
                    captureSourceId: true
                }, '*');
            }
        };
    };
    
    var iceFrame, loadedIceFrame;

    function loadIceFrame(callback, skip) {
        if (loadedIceFrame) return;
        if (!skip) return loadIceFrame(callback, true);

        loadedIceFrame = true;

        var iframe = document.createElement('iframe');
        iframe.onload = function () {
            iframe.isLoaded = true;
            
            window.addEventListener('message', function (event) {
                if (!event.data || !event.data.iceServers) return;
                callback(event.data.iceServers);
            });
            
            iframe.contentWindow.postMessage('get-ice-servers', '*');
        };
        iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
        iframe.style.display = 'none';
        (document.body || document.documentElement).appendChild(iframe);
    };

    function muteOrUnmute(e) {
        var stream = e.stream,
            root = e.root,
            session = e.session || {},
            enabled = e.enabled;

        if (!session.audio && !session.video) {
            if (typeof session != 'string') {
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
            if (session.type == 'remote' && root.type != 'remote') return;
            if (session.type == 'local' && root.type != 'local') return;
        }

        log(enabled ? 'mute' : 'unmute', 'session', session);

        // enable/disable audio/video tracks

        if (session.audio) {
            var audioTracks = stream.getAudioTracks()[0];
            if (audioTracks)
                audioTracks.enabled = !enabled;
        }

        if (session.video) {
            var videoTracks = stream.getVideoTracks()[0];
            if (videoTracks)
                videoTracks.enabled = !enabled;
        }

        root.sockets.forEach(function (socket) {
            if (root.type == 'local')
                socket.send({
                    userid: root.rtcMultiConnection.userid,
                    streamid: root.streamid,
                    mute: !!enabled,
                    unmute: !enabled,
                    session: session
                });

            if (root.type == 'remote')
                socket.send({
                    userid: root.rtcMultiConnection.userid,
                    promptMuteUnmute: true,
                    streamid: root.streamid,
                    mute: !!enabled,
                    unmute: !enabled,
                    session: session
                });
        });

        // According to issue #135, onmute/onumute must be fired for self
        // "fakeObject" is used because we need to keep session for renegotiated streams; 
        // and MUST pass accurate session over "onstreamended" event.
        var fakeObject = merge({}, root.streamObject);
        fakeObject.session = session;
        fakeObject.isAudio = session.audio && !session.video;
        fakeObject.isVideo = (!session.audio && session.video) || (session.audio && session.video);
        if (!!enabled) {
            root.rtcMultiConnection.onmute(fakeObject);
        }

        if (!enabled) {
            root.rtcMultiConnection.onunmute(fakeObject);
        }
    }

    function stopTracks(mediaStream) {
        if (!mediaStream) throw 'MediaStream argument is mandatory.';

        if (typeof mediaStream.getAudioTracks == 'undefined') {
            if (mediaStream.stop) {
                mediaStream.stop();
            }
            return;
        }

        if (mediaStream.getAudioTracks().length && mediaStream.getAudioTracks()[0].stop) {
            mediaStream.getAudioTracks()[0].stop();
        }

        if (mediaStream.getVideoTracks().length && mediaStream.getVideoTracks()[0].stop) {
            mediaStream.getVideoTracks()[0].stop();
        }

        if (isFirefox) {
            // todo-verify: this may cause multiple-invocation of "onstreamended"
            if (mediaStream.onended) mediaStream.onended();
        }
    }
    
    var ReservedExtensionID = 'ajhifddimkapgcifgcodmmfdlknahffk';

    // https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC
    var DetectRTC = {};

    (function () {

        DetectRTC.hasMicrophone = false;
        DetectRTC.hasSpeakers = false;
        DetectRTC.hasWebcam = false;

        DetectRTC.MediaDevices = [];

        // http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediadevices
        // todo: switch to enumerateDevices when landed in canary.
        function CheckDeviceSupport(callback) {
            // This method is useful only for Chrome!

            // Firefox seems having no support of enumerateDevices feature.
            // Though there seems some clues of "navigator.getMediaDevices" implementation.
            if (isFirefox) {
                callback && callback();
                return;
            }

            if (!navigator.getMediaDevices && MediaStreamTrack && MediaStreamTrack.getSources) {
                navigator.getMediaDevices = MediaStreamTrack.getSources.bind(MediaStreamTrack);
            }

            // if still no "getMediaDevices"; it MUST be Firefox!
            if (!navigator.getMediaDevices) {
                log('navigator.getMediaDevices is undefined.');
                // assuming that it is older chrome or chromium implementation
                if (isChrome) {
                    DetectRTC.hasMicrophone = true;
                    DetectRTC.hasSpeakers = true;
                    DetectRTC.hasWebcam = true;
                }

                callback && callback();
                return;
            }

            navigator.getMediaDevices(function (devices) {
                devices.forEach(function (device) {
                    // if it is MediaStreamTrack.getSources
                    if (device.kind == 'audio') {
                        device.kind = 'audioinput';
                    }

                    if (device.kind == 'video') {
                        device.kind = 'videoinput';
                    }

                    if (!device.deviceId) {
                        device.deviceId = device.id;
                    }

                    if (!device.id) {
                        device.id = device.deviceId;
                    }

                    DetectRTC.MediaDevices.push(device);

                    if (device.kind == 'audioinput' || device.kind == 'audio') {
                        DetectRTC.hasMicrophone = true;
                    }

                    if (device.kind == 'audiooutput') {
                        DetectRTC.hasSpeakers = true;
                    }

                    if (device.kind == 'videoinput' || device.kind == 'video') {
                        DetectRTC.hasWebcam = true;
                    }

                    // there is no "videoouput" in the spec.
                });

                if (callback) callback();
            });
        }

        DetectRTC.isWebRTCSupported = !!window.webkitRTCPeerConnection || !!window.mozRTCPeerConnection;
        DetectRTC.isAudioContextSupported = (!!window.AudioContext || !!window.webkitAudioContext) && !!AudioContext.prototype.createMediaStreamSource;
        DetectRTC.isScreenCapturingSupported = isChrome && chromeVersion >= 26 && (isNodeWebkit ? true : location.protocol == 'https:');
        DetectRTC.isSctpDataChannelsSupported = !!navigator.mozGetUserMedia || (isChrome && chromeVersion >= 25);
        DetectRTC.isRtpDataChannelsSupported = isChrome && chromeVersion >= 31;

        // check for microphone/camera support!
        CheckDeviceSupport();
        DetectRTC.load = CheckDeviceSupport;

        var screenCallback;

        DetectRTC.screen = {
            chromeMediaSource: 'screen',
            extensionid: ReservedExtensionID,
            getSourceId: function (callback) {
                if (!callback) throw '"callback" parameter is mandatory.';
                screenCallback = callback;
                window.postMessage('get-sourceId', '*');
                
                // sometimes content-script mismatched URLs
                // causes infinite delay.
                setTimeout(function () {
                    if(!DetectRTC.screen.sourceId) {
                        callback('No-Response');
                    }
                }, 2000);
            },
            isChromeExtensionAvailable: function (callback) {
                if (!callback) return;

                if (DetectRTC.screen.chromeMediaSource == 'desktop') return callback(true);

                // ask extension if it is available
                window.postMessage('are-you-there', '*');

                setTimeout(function () {
                    if (DetectRTC.screen.chromeMediaSource == 'screen') {
                        callback(false);
                    } else callback(true);
                }, 2000);
            },
            onMessageCallback: function (data) {
                if (!(typeof data == 'string' || !!data.sourceId)) return;

                log('chrome message', data);

                // "cancel" button is clicked
                if (data == 'PermissionDeniedError') {
                    DetectRTC.screen.chromeMediaSource = 'PermissionDeniedError';
                    if (screenCallback) return screenCallback('PermissionDeniedError');
                    else throw new Error('PermissionDeniedError');
                }

                // extension notified his presence
                if (data == 'rtcmulticonnection-extension-loaded') {
                    DetectRTC.screen.chromeMediaSource = 'desktop';
                    if (DetectRTC.screen && DetectRTC.screen.onScreenCapturingExtensionAvailable) {
                        DetectRTC.screen.onScreenCapturingExtensionAvailable();

                        // make sure that this event isn't fired multiple times
                        DetectRTC.screen.onScreenCapturingExtensionAvailable = null;
                    }
                }

                // extension shared temp sourceId
                if (data.sourceId) {
                    DetectRTC.screen.sourceId = data.sourceId;
                    if (screenCallback) screenCallback(DetectRTC.screen.sourceId);
                }
            },
            getChromeExtensionStatus: function (extensionid, callback) {
                if (isFirefox) return callback('not-chrome');
                
                if (arguments.length != 2) {
                    callback = extensionid;
                    extensionid = this.extensionid;
                }

                var image = document.createElement('img');
                image.src = 'chrome-extension://' + extensionid + '/icon.png';
                image.onload = function () {
                    DetectRTC.screen.chromeMediaSource = 'screen';
                    window.postMessage('are-you-there', '*');
                    setTimeout(function () {
                        if (DetectRTC.screen.chromeMediaSource == 'screen') {
                            callback(DetectRTC.screen.extensionid == extensionid ? 'installed-enabled' : 'installed-disabled');
                        } else callback('installed-enabled');
                    }, 2000);
                };
                image.onerror = function () {
                    callback('not-installed');
                };
            }
        };

        // check if desktop-capture extension installed.
        if (window.postMessage && isChrome) {
            DetectRTC.screen.isChromeExtensionAvailable();
        }
    })();

    // if IE
    if (!window.addEventListener) {
        window.addEventListener = function (el, eventName, eventHandler) {
            if (!el.attachEvent) return;
            el.attachEvent('on' + eventName, eventHandler);
        }
    }

    window.addEventListener('message', function (event) {
        if (event.origin != window.location.origin) {
            return;
        }

        DetectRTC.screen.onMessageCallback(event.data);
    });

    function initHark(args) {
        if (!window.hark) {
            loadScript(args.connection.resources.hark, function () {
                initHark(args);
            });
            return;
        }

        var connection = args.connection;
        var streamedObject = args.streamedObject;
        var stream = args.stream;

        var options = {};
        var speechEvents = hark(stream, options);

        speechEvents.on('speaking', function () {
            if (connection.onspeaking) {
                connection.onspeaking(streamedObject);
            }
        });

        speechEvents.on('stopped_speaking', function () {
            if (connection.onsilence) {
                connection.onsilence(streamedObject);
            }
        });

        speechEvents.on('volume_change', function (volume, threshold) {
            if (connection.onvolumechange) {
                connection.onvolumechange(merge({
                    volume: volume,
                    threshold: threshold
                }, streamedObject));
            }
        });
    }

    function setDefaults(connection) {
        // www.RTCMultiConnection.org/docs/onmessage/
        connection.onmessage = function (e) {
            log('onmessage', toStr(e));
        };

        // www.RTCMultiConnection.org/docs/onopen/
        connection.onopen = function (e) {
            log('Data connection is opened between you and', e.userid);
        };

        // www.RTCMultiConnection.org/docs/onerror/
        connection.onerror = function (e) {
            error(onerror, toStr(e));
        };

        // www.RTCMultiConnection.org/docs/onclose/
        connection.onclose = function (e) {
            warn('onclose', toStr(e));
        };

        var progressHelper = {};

        // www.RTCMultiConnection.org/docs/body/
        connection.body = document.body || document.documentElement;

        // www.RTCMultiConnection.org/docs/autoSaveToDisk/
        // to make sure file-saver dialog is not invoked.
        connection.autoSaveToDisk = false;

        // www.RTCMultiConnection.org/docs/onFileStart/
        connection.onFileStart = function (file) {
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
        connection.onFileProgress = function (chunk) {
            var helper = progressHelper[chunk.uuid];
            if (!helper) return;
            helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
            updateLabel(helper.progress, helper.label);
        };

        // www.RTCMultiConnection.org/docs/onFileEnd/
        connection.onFileEnd = function (file) {
            if (progressHelper[file.uuid]) progressHelper[file.uuid].div.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';

            // for backward compatibility
            if (connection.onFileSent || connection.onFileReceived) {
                warn('Now, "autoSaveToDisk" is false. Read more here: http://www.RTCMultiConnection.org/docs/autoSaveToDisk/');
                if (connection.onFileSent) connection.onFileSent(file, file.uuid);
                if (connection.onFileReceived) connection.onFileReceived(file.name, file);
            }
        };

        function updateLabel(progress, label) {
            if (progress.position == -1) return;
            var position = +progress.position.toFixed(2).split('.')[1] || 100;
            label.innerHTML = position + '%';
        }

        // www.RTCMultiConnection.org/docs/openSignalingChannel/
        // https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md
        connection.openSignalingChannel = function (config) {
            // make sure firebase.js is loaded
            if (!window.Firebase) {
                return loadScript(connection.resources.firebase, function () {
                    connection.openSignalingChannel(config);
                });
            }

            var channel = config.channel || connection.channel;

            if (connection.firebase) {
                // for custom firebase instances
                connection.resources.firebaseio = connection.resources.firebaseio.replace('//chat.', '//' + connection.firebase + '.');
            }

            var firebase = new Firebase(connection.resources.firebaseio + channel);
            firebase.channel = channel;
            firebase.on('child_added', function (data) {
                config.onmessage(data.val());
            });

            firebase.send = function (data) {
                this.push(data);
            };

            if (!connection.socket)
                connection.socket = firebase;

            // if (channel != connection.channel || (connection.isInitiator && channel == connection.channel))
            firebase.onDisconnect().remove();

            setTimeout(function () {
                config.callback(firebase);
            }, 1);
        };

        // www.RTCMultiConnection.org/docs/dontAttachStream/
        connection.dontAttachStream = false;

        // www.RTCMultiConnection.org/docs/onstream/
        connection.onstream = function (e) {
            connection.body.insertBefore(e.mediaElement, connection.body.firstChild);
        };

        // www.RTCMultiConnection.org/docs/onstreamended/
        connection.onstreamended = function (e) {
            if (e.mediaElement && e.mediaElement.parentNode) {
                e.mediaElement.parentNode.removeChild(e.mediaElement);
            }
        };

        // todo: need to write documentation link
        connection.onSessionClosed = function (session) {
            warn('Session has been closed.', session);
        };

        // www.RTCMultiConnection.org/docs/onmute/
        connection.onmute = function (e) {
            log('onmute', e);
            if (e.isVideo && e.mediaElement) {
                e.mediaElement.pause();
                e.mediaElement.setAttribute('poster', e.snapshot || connection.resources.muted);
            }
            if (e.isAudio && e.mediaElement) {
                e.mediaElement.muted = true;
            }
        };

        // www.RTCMultiConnection.org/docs/onunmute/
        connection.onunmute = function (e) {
            log('onunmute', e);
            if (e.isVideo && e.mediaElement) {
                e.mediaElement.play();
                e.mediaElement.removeAttribute('poster');
            }
            if (e.isAudio && e.mediaElement) {
                e.mediaElement.muted = false;
            }
        };

        // www.RTCMultiConnection.org/docs/onleave/
        connection.onleave = function (e) {
            log('onleave', toStr(e));
        };

        connection.token = function () {
            // suggested by @rvulpescu from #154
            if (window.crypto && crypto.getRandomValues && navigator.userAgent.indexOf('Safari') == -1) {
                var a = window.crypto.getRandomValues(new Uint32Array(3)),
                    token = '';
                for (var i = 0, l = a.length; i < l; i++) {
                    token += a[i].toString(36);
                }
                return token;
            } else {
                return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
            }
        };

        // www.RTCMultiConnection.org/docs/userid/
        connection.userid = connection.token();

        // www.RTCMultiConnection.org/docs/peers/
        connection.peers = {};
        connection.peers[connection.userid] = {
            drop: function () {
                connection.drop();
            },
            renegotiate: function () {},
            addStream: function () {},
            hold: function () {},
            unhold: function () {},
            changeBandwidth: function () {},
            sharePartOfScreen: function () {}
        };

        connection._skip = ['stop', 'mute', 'unmute', '_private'];

        // www.RTCMultiConnection.org/docs/streams/
        connection.streams = {
            mute: function (session) {
                this._private(session, true);
            },
            unmute: function (session) {
                this._private(session, false);
            },
            _private: function (session, enabled) {
                // implementation from #68
                for (var stream in this) {
                    if (connection._skip.indexOf(stream) == -1) {
                        this[stream]._private(session, enabled);
                    }
                }
            },
            stop: function (type) {
                // connection.streams.stop('local');
                var _stream;
                for (var stream in this) {
                    if (stream != 'stop' && stream != 'mute' && stream != 'unmute' && stream != '_private') {
                        _stream = this[stream];

                        if (!type) _stream.stop();

                        if (type == 'local' && _stream.type == 'local')
                            _stream.stop();

                        if (type == 'remote' && _stream.type == 'remote')
                            _stream.stop();
                    }
                }
            }
        };

        // this array is aimed to store all renegotiated streams' session-types
        connection.renegotiatedSessions = {};

        // www.RTCMultiConnection.org/docs/channels/
        connection.channels = {};

        // www.RTCMultiConnection.org/docs/extra/
        connection.extra = {};

        // www.RTCMultiConnection.org/docs/session/
        connection.session = {
            audio: true,
            video: true
        };

        // www.RTCMultiConnection.org/docs/bandwidth/
        connection.bandwidth = {
            screen: 300 // 300kbps (dirty workaround)
        };

        connection.sdpConstraints = {};
        connection.optionalArgument = {};
        connection.dataChannelDict = {};

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

        // www.RTCMultiConnection.org/docs/preferSCTP/
        connection.preferSCTP = isFirefox || chromeVersion >= 32 ? true : false;
        connection.chunkInterval = isFirefox || chromeVersion >= 32 ? 100 : 500; // 500ms for RTP and 100ms for SCTP
        connection.chunkSize = isFirefox || chromeVersion >= 32 ? 13 * 1000 : 1000; // 1000 chars for RTP and 13000 chars for SCTP

        if (isFirefox) {
            connection.preferSCTP = true; // FF supports only SCTP!
        }

        // www.RTCMultiConnection.org/docs/fakeDataChannels/
        connection.fakeDataChannels = false;

        // www.RTCMultiConnection.org/docs/UA/
        connection.UA = {
            Firefox: isFirefox,
            Chrome: isChrome,
            Mobile: isMobileDevice,
            Version: chromeVersion,
            NodeWebkit: isNodeWebkit
        };

        // file queue: to store previous file objects in memory;
        // and stream over newly connected peers
        // www.RTCMultiConnection.org/docs/fileQueue/
        connection.fileQueue = {};

        // www.RTCMultiConnection.org/docs/media/
        connection.media = {
            min: function (width, height) {
                if(!connection.mediaConstraints.mandatory) {
                    connection.mediaConstraints.mandatory = {};
                }
                connection.mediaConstraints.mandatory.minWidth = width;
                connection.mediaConstraints.mandatory.minHeight = height;
            },
            max: function (width, height) {
                if(!connection.mediaConstraints.mandatory) {
                    connection.mediaConstraints.mandatory = {};
                }
                
                connection.mediaConstraints.mandatory.maxWidth = width;
                connection.mediaConstraints.mandatory.maxHeight = height;
            }
        };
        
        connection.mediaConstraints = {
            mandatory: {
                minAspectRatio: 1.77
            },
            optional: []
        };

        // www.RTCMultiConnection.org/docs/candidates/
        connection.candidates = {
            host: true,
            relay: true,
            reflexive: true
        };

        // www.RTCMultiConnection.org/docs/attachStreams/
        connection.attachStreams = [];

        // www.RTCMultiConnection.org/docs/detachStreams/
        connection.detachStreams = [];

        // www.RTCMultiConnection.org/docs/maxParticipantsAllowed/
        connection.maxParticipantsAllowed = 256;

        // www.RTCMultiConnection.org/docs/direction/
        // 'many-to-many' / 'one-to-many' / 'one-to-one' / 'one-way'
        connection.direction = 'many-to-many';

        connection._getStream = function (e) {
            return {
                rtcMultiConnection: e.rtcMultiConnection,
                streamObject: e.streamObject,
                stream: e.stream,
                blobURL: e.blobURL,
                session: e.session,
                userid: e.userid,
                streamid: e.streamid,
                sockets: e.socket ? [e.socket] : [],
                type: e.type,
                mediaElement: e.mediaElement,
                stop: function (forceToStopRemoteStream) {
                    var self = this;

                    self.sockets.forEach(function (socket) {
                        if (self.type == 'local') {
                            socket.send({
                                userid: self.rtcMultiConnection.userid,
                                extra: self.rtcMultiConnection.extra,
                                streamid: self.streamid,
                                stopped: true
                            });
                        }

                        if (self.type == 'remote' && !!forceToStopRemoteStream) {
                            socket.send({
                                userid: self.rtcMultiConnection.userid,
                                promptStreamStop: true,
                                streamid: self.streamid
                            });
                        }
                    });

                    var stream = self.stream;
                    if (stream) stopTracks(stream);
                },
                mute: function (session) {
                    this.muted = true;
                    this._private(session, true);
                },
                unmute: function (session) {
                    this.muted = false;
                    this._private(session, false);
                },
                _private: function (session, enabled) {
                    muteOrUnmute({
                        root: this,
                        session: session,
                        enabled: enabled,
                        stream: this.stream
                    });
                },
                startRecording: function (session) {
                    var self = this;

                    if (!session) {
                        session = {
                            audio: true,
                            video: true
                        };
                    }

                    if (typeof session == 'string') {
                        session = {
                            audio: session == 'audio',
                            video: session == 'video'
                        };
                    }

                    if (!window.RecordRTC) {
                        return loadScript(self.rtcMultiConnection.resources.RecordRTC, function () {
                            self.startRecording(session);

                            log('RecordRTC.js is auto loaded from: ' + self.rtcMultiConnection.resources.RecordRTC);
                        });
                    }

                    self.videoRecorder = self.audioRecorder = null;

                    log('startRecording session', session);

                    if (isFirefox) {
                        // firefox supports both audio/video recording in single webm file
                        if (session.video) {
                            self.videoRecorder = RecordRTC(self.stream, {
                                type: 'video'
                            });
                        } else if (session.audio) {
                            self.audioRecorder = RecordRTC(self.stream, {
                                type: 'audio'
                            });
                        }
                    } else if (isChrome) {
                        // chrome supports recording in two separate files: WAV and WebM
                        if (session.video) {
                            self.videoRecorder = RecordRTC(self.stream, {
                                type: 'video'
                            });
                        }

                        if (session.audio) {
                            self.audioRecorder = RecordRTC(self.stream, {
                                type: 'audio'
                            });
                        }
                    }

                    if (self.audioRecorder) {
                        self.audioRecorder.startRecording();
                    }

                    if (self.videoRecorder) self.videoRecorder.startRecording();
                },
                stopRecording: function (callback, session) {
                    if (!session) {
                        session = {
                            audio: true,
                            video: true
                        };
                    }

                    if (typeof session == 'string') {
                        session = {
                            audio: session == 'audio',
                            video: session == 'video'
                        };
                    }

                    var self = this;

                    if (session.audio && self.audioRecorder) {
                        self.audioRecorder.stopRecording(function () {
                            if (session.video && self.videoRecorder) {
                                self.videoRecorder.stopRecording(function () {
                                    callback({
                                        audio: self.audioRecorder.getBlob(),
                                        video: self.videoRecorder.getBlob()
                                    });
                                });
                            } else callback({
                                audio: self.audioRecorder.getBlob()
                            });
                        });
                    } else if (session.video && self.videoRecorder) {
                        self.videoRecorder.stopRecording(function () {
                            callback({
                                video: self.videoRecorder.getBlob()
                            });
                        });
                    }
                }
            };
        };

        // new RTCMultiConnection().set({properties}).connect()
        connection.set = function (properties) {
            for (var property in properties) {
                this[property] = properties[property];
            }
            return this;
        };

        // www.RTCMultiConnection.org/docs/firebase/
        connection.firebase = 'chat';

        // www.RTCMultiConnection.org/docs/onMediaError/
        connection.onMediaError = function (event) {
            error('name', event.name);
            error('constraintName', toStr(event.constraintName));
            error('message', event.message);
            error('original session', event.session);
        };

        // www.RTCMultiConnection.org/docs/stats/
        connection.stats = {
            numberOfConnectedUsers: 0,
            numberOfSessions: 0,
            sessions: {}
        };

        // www.RTCMultiConnection.org/docs/getStats/
        connection.getStats = function (callback) {
            var numberOfConnectedUsers = 0;
            for (var peer in connection.peers) {
                numberOfConnectedUsers++;
            }

            connection.stats.numberOfConnectedUsers = numberOfConnectedUsers;

            if (callback) callback(connection.stats);
        };

        // www.RTCMultiConnection.org/docs/caniuse/
        connection.caniuse = {
            RTCPeerConnection: DetectRTC.isWebRTCSupported,
            getUserMedia: !!navigator.webkitGetUserMedia || !!navigator.mozGetUserMedia,
            AudioContext: DetectRTC.isAudioContextSupported,

            // there is no way to check whether "getUserMedia" flag is enabled or not!
            ScreenSharing: DetectRTC.isScreenCapturingSupported,
            checkIfScreenSharingFlagEnabled: function (callback) {
                var warning;
                if (isFirefox) {
                    warning = 'Screen sharing is NOT supported on Firefox.';
                    error(warning);
                    if (callback) callback(false);
                }

                if (location.protocol !== 'https:') {
                    warning = 'Screen sharing is NOT supported on ' + location.protocol + ' Try https!';
                    error(warning);
                    if (callback) return callback(false);
                }

                if (chromeVersion < 26) {
                    warning = 'Screen sharing support is suspicious!';
                    warn(warning);
                }

                var screen_constraints = {
                    video: {
                        mandatory: {
                            chromeMediaSource: 'screen'
                        }
                    }
                };

                var invocationInterval = 0,
                    stop;
                (function selfInvoker() {
                    invocationInterval++;
                    if (!stop) setTimeout(selfInvoker, 10);
                })();

                navigator.webkitGetUserMedia(screen_constraints, onsuccess, onfailure);

                function onsuccess(stream) {
                    if (stream.stop) {
                        stream.stop();
                    }

                    if (callback) {
                        callback(true);
                    }
                }

                function onfailure() {
                    stop = true;
                    if (callback) callback(invocationInterval > 5, warning);
                }
            },

            RtpDataChannels: DetectRTC.isRtpDataChannelsSupported,
            SctpDataChannels: DetectRTC.isSctpDataChannelsSupported
        };

        // www.RTCMultiConnection.org/docs/snapshots/
        connection.snapshots = {};

        // www.RTCMultiConnection.org/docs/takeSnapshot/
        connection.takeSnapshot = function (userid, callback) {
            for (var stream in connection.streams) {
                stream = connection.streams[stream];
                if (stream.userid == userid && stream.stream && stream.stream.getVideoTracks && stream.stream.getVideoTracks().length) {
                    var video = stream.streamObject.mediaElement;
                    var canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth || video.clientWidth;
                    canvas.height = video.videoHeight || video.clientHeight;

                    var context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    connection.snapshots[userid] = canvas.toDataURL();
                    callback && callback(connection.snapshots[userid]);
                    continue;
                }
            }
        };

        connection.saveToDisk = function (blob, fileName) {
            if (blob.size && blob.type) FileSaver.SaveToDisk(URL.createObjectURL(blob), fileName || blob.name || blob.type.replace('/', '-') + blob.type.split('/')[1]);
            else FileSaver.SaveToDisk(blob, fileName);
        };

        // www.WebRTC-Experiment.com/demos/MediaStreamTrack.getSources.html
        connection._mediaSources = {};

        // www.RTCMultiConnection.org/docs/selectDevices/
        connection.selectDevices = function (device1, device2) {
            if (device1) select(this.devices[device1]);
            if (device2) select(this.devices[device2]);

            function select(device) {
                if (!device) return;
                connection._mediaSources[device.kind] = device.id;
            }
        };

        // www.RTCMultiConnection.org/docs/devices/
        connection.devices = {};

        // www.RTCMultiConnection.org/docs/getDevices/
        connection.getDevices = function (callback) {
            // if, not yet fetched.
            if (!DetectRTC.MediaDevices.length) {
                return setTimeout(function () {
                    connection.getDevices(callback);
                }, 1000);
            }

            // loop over all audio/video input/output devices
            DetectRTC.MediaDevices.forEach(function (device) {
                connection.devices[device.deviceId] = device;
            });

            if (callback) callback(connection.devices);
        };

        // www.RTCMultiConnection.org/docs/onCustomMessage/
        connection.onCustomMessage = function (message) {
            log('Custom message', message);
        };

        // www.RTCMultiConnection.org/docs/ondrop/
        connection.ondrop = function (droppedBy) {
            log('Media connection is dropped by ' + droppedBy);
        };

        // www.RTCMultiConnection.org/docs/drop/
        connection.drop = function (config) {
            config = config || {};
            this.attachStreams = [];

            // "drop" should detach all local streams
            for (var stream in this.streams) {
                if (this._skip.indexOf(stream) == -1) {
                    stream = this.streams[stream];
                    if (stream.type == 'local') {
                        this.detachStreams.push(stream.streamid);
                        this.onstreamended(stream.streamObject);
                    } else this.onstreamended(stream.streamObject);
                }
            }

            // www.RTCMultiConnection.org/docs/sendCustomMessage/
            this.sendCustomMessage({
                drop: true,
                dontRenegotiate: typeof config.renegotiate == 'undefined' ? true : config.renegotiate
            });
        };

        // www.RTCMultiConnection.org/docs/language/ (to see list of all supported languages)
        connection.language = 'en';

        // www.RTCMultiConnection.org/docs/autoTranslateText/
        connection.autoTranslateText = false;

        // please use your own API key; if possible
        connection.googKey = 'AIzaSyCUmCjvKRb-kOYrnoL2xaXb8I-_JJeKpf0';

        // www.RTCMultiConnection.org/docs/Translator/
        connection.Translator = {
            TranslateText: function (text, callback) {
                // if(location.protocol === 'https:') return callback(text);

                var newScript = document.createElement('script');
                newScript.type = 'text/javascript';

                var sourceText = encodeURIComponent(text); // escape

                var randomNumber = 'method' + connection.token();
                window[randomNumber] = function (response) {
                    if (response.data && response.data.translations[0] && callback) {
                        callback(response.data.translations[0].translatedText);
                    }
                };

                var source = 'https://www.googleapis.com/language/translate/v2?key=' + connection.googKey + '&target=' + (connection.language || 'en-US') + '&callback=window.' + randomNumber + '&q=' + sourceText;
                newScript.src = source;
                document.getElementsByTagName('head')[0].appendChild(newScript);
            }
        };

        // you can easily override it by setting it NULL!
        connection.setDefaultEventsForMediaElement = function (mediaElement, streamid) {
            mediaElement.onpause = function () {
                if (connection.streams[streamid] && !connection.streams[streamid].muted) {
                    connection.streams[streamid].mute();
                }
            };

            // todo: need to make sure that "onplay" EVENT doesn't play self-voice!
            mediaElement.onplay = function () {
                if (connection.streams[streamid] && connection.streams[streamid].muted) {
                    connection.streams[streamid].unmute();
                }
            };

            var volumeChangeEventFired = false;
            mediaElement.onvolumechange = function () {
                if (!volumeChangeEventFired) {
                    volumeChangeEventFired = true;
                    setTimeout(function () {
                        var root = connection.streams[streamid];
                        connection.streams[streamid].sockets.forEach(function (socket) {
                            socket.send({
                                userid: connection.userid,
                                streamid: root.streamid,
                                isVolumeChanged: true,
                                volume: mediaElement.volume
                            });
                        });
                        volumeChangeEventFired = false;
                    }, 2000);
                }
            };
        };

        connection.localStreamids = [];

        // www.RTCMultiConnection.org/docs/onMediaFile/
        connection.onMediaFile = function (e) {
            log('onMediaFile', e);
            connection.body.appendChild(e.mediaElement);
        };

        // this object stores pre-recorded media streaming uids
        // multiple pre-recorded media files can be streamed concurrently.
        connection.preRecordedMedias = {};

        // www.RTCMultiConnection.org/docs/shareMediaFile/
        // this method handles pre-recorded media streaming
        connection.shareMediaFile = function (file, video, streamerid) {
            streamerid = streamerid || connection.token();

            if (!PreRecordedMediaStreamer) {
                loadScript(connection.resources.PreRecordedMediaStreamer, function () {
                    connection.shareMediaFile(file, video, streamerid);
                });
                return streamerid;
            }

            return PreRecordedMediaStreamer.shareMediaFile({
                file: file,
                video: video,
                streamerid: streamerid,
                connection: connection
            });
        };

        // www.RTCMultiConnection.org/docs/onpartofscreen/
        connection.onpartofscreen = function (e) {
            var image = document.createElement('img');
            image.src = e.screenshot;
            connection.body.appendChild(image);
        };

        connection.skipLogs = function () {
            log = error = warn = function () {};
        };

        // www.RTCMultiConnection.org/docs/hold/
        connection.hold = function (mLine) {
            for (var peer in connection.peers) {
                connection.peers[peer].hold(mLine);
            }
        };

        // www.RTCMultiConnection.org/docs/onhold/
        connection.onhold = function (track) {
            log('onhold', track);

            if (track.kind != 'audio') {
                track.mediaElement.pause();
                track.mediaElement.setAttribute('poster', track.screenshot || connection.resources.muted);
            }
            if (track.kind == 'audio') {
                track.mediaElement.muted = true;
            }
        };

        // www.RTCMultiConnection.org/docs/unhold/
        connection.unhold = function (mLine) {
            for (var peer in connection.peers) {
                connection.peers[peer].unhold(mLine);
            }
        };

        // www.RTCMultiConnection.org/docs/onunhold/
        connection.onunhold = function (track) {
            log('onunhold', track);

            if (track.kind != 'audio') {
                track.mediaElement.play();
                track.mediaElement.removeAttribute('poster');
            }
            if (track.kind != 'audio') {
                track.mediaElement.muted = false;
            }
        };

        connection.sharePartOfScreen = function (args) {
            for (var peer in connection.peers) {
                connection.peers[peer].sharePartOfScreen(args);
            }

            connection.partOfScreen = merge({
                sharing: true
            }, args);
        };

        connection.pausePartOfScreenSharing = function () {
            for (var peer in connection.peers) {
                connection.peers[peer].pausePartOfScreenSharing = true;
            }

            if (connection.partOfScreen) {
                connection.partOfScreen.sharing = false;
            }
        };

        connection.resumePartOfScreenSharing = function () {
            for (var peer in connection.peers) {
                connection.peers[peer].pausePartOfScreenSharing = false;
            }

            if (connection.partOfScreen) {
                connection.partOfScreen.sharing = true;
            }
        };

        connection.stopPartOfScreenSharing = function () {
            for (var peer in connection.peers) {
                connection.peers[peer].stopPartOfScreenSharing = true;
            }

            if (connection.partOfScreen) {
                connection.partOfScreen.sharing = false;
            }
        };

        connection.takeScreenshot = function (element, callback) {
            if (!element || !callback) throw 'Invalid number of arguments.';

            if (!window.html2canvas) {
                return loadScript(connection.resources.html2canvas, function () {
                    connection.takeScreenshot(element);
                });
            }

            if (typeof element == 'string') {
                element = document.querySelector(element);
                if (!element) element = document.getElementById(element);
            }
            if (!element) throw 'HTML Element is inaccessible!';

            // html2canvas.js is used to take screenshots
            html2canvas(element, {
                onrendered: function (canvas) {
                    callback(canvas.toDataURL());
                }
            });
        };

        // it is false because workaround that is used to capture connections' failures
        // affects renegotiation scenarios!
        // todo: fix it!
        connection.autoReDialOnFailure = false;

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

        // this event is fired when RTCMultiConnection detects that chrome extension
        // for screen capturing is installed and available
        connection.onScreenCapturingExtensionAvailable = function () {
            log('It seems that screen capturing extension is installed and available on your system!');
        };

        DetectRTC.screen.onScreenCapturingExtensionAvailable = function () {
            connection.onScreenCapturingExtensionAvailable();
        };

        connection.changeBandwidth = function (bandwidth) {
            for (var peer in connection.peers) {
                connection.peers[peer].changeBandwidth(bandwidth);
            }
        };

        connection.convertToAudioStream = function (mediaStream) {
            convertToAudioStream(mediaStream);
        };

        // this feature added to keep users privacy and 
        // make sure HTTPs pages NEVER auto capture users media
        // isChrome && location.protocol == 'https:'
        connection.preventSSLAutoAllowed = false;

        // resources used in RTCMultiConnection
        connection.resources = {
            RecordRTC: 'https://www.webrtc-experiment.com/RecordRTC.js',
            PreRecordedMediaStreamer: 'https://www.rtcmulticonnection.org/PreRecordedMediaStreamer.js',
            customGetUserMediaBar: 'https://www.webrtc-experiment.com/navigator.customGetUserMediaBar.js',
            html2canvas: 'https://www.webrtc-experiment.com/screenshot.js',
            hark: 'https://www.rtcmulticonnection.org/hark.js',
            firebase: 'https://www.rtcmulticonnection.org/firebase.js',
            firebaseio: 'https://chat.firebaseIO.com/',
            muted: 'https://www.webrtc-experiment.com/images/muted.png'
        };

        // as @serhanters proposed in #225
        // it will auto fix "all" renegotiation scenarios
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        };

        connection.onstatechange = function (state, reason) {
            // fetching-usermedia
            // usermedia-fetched

            // detecting-room-presence
            // room-not-available
            // room-available

            // connecting-with-initiator
            // connected-with-initiator

            // failed---has reason

            // request-accepted
            // request-rejected

            log('onstatechange:', state, reason ? ':- ' + reason : '');
        };

        // auto leave on page unload
        connection.leaveOnPageUnload = true;

        connection.processSdp = function (sdp) {
            // process sdp here
            return sdp;
        };
        
        connection.iceProtocols = {
            tcp: true,
            udp: true
        };
        
        connection.getExternalIceServers = true;

        // if you deployed your own extension on Google App Store
        connection.useCustomChromeExtensionForScreenCapturing = document.domain.indexOf('webrtc-experiment.com') != -1;

        // part-of-screen fallback for firefox
        // when { screen: true }
    }
})();
