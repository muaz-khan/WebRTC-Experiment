function setDefaults(connection) {
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
        audio: true,
        video: true
    };

    // www.RTCMultiConnection.org/docs/candidates/
    connection.candidates = {
        host: true,
        stun: true,
        turn: true
    };

    connection.sdpConstraints = {};

    // as @serhanters proposed in #225
    // it will auto fix "all" renegotiation scenarios
    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
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
    connection.preferSCTP = true;
    connection.chunkInterval = 100; // 500ms for RTP and 100ms for SCTP
    connection.chunkSize = 60 * 1000; // 1000 chars for RTP and 13000 chars for SCTP

    // www.RTCMultiConnection.org/docs/fakeDataChannels/
    connection.fakeDataChannels = false;

    connection.waitUntilRemoteStreamStartsFlowing = null; // NULL == true

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
        optional: [],
        mandatory: {}
    };

    connection.dataChannelDict = {};

    // www.RTCMultiConnection.org/docs/dontAttachStream/
    connection.dontAttachStream = false;

    // www.RTCMultiConnection.org/docs/dontCaptureUserMedia/
    connection.dontCaptureUserMedia = false;

    // this feature added to keep users privacy and 
    // make sure HTTPs pages NEVER auto capture users media
    // isChrome && location.protocol == 'https:'
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
        firebaseio: 'https://webrtc.firebaseIO.com/',
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
        if (!helper) return;
        helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
        updateLabel(helper.progress, helper.label);
    };

    // www.RTCMultiConnection.org/docs/onFileEnd/
    connection.onFileEnd = function(file) {
        if (progressHelper[file.uuid]) progressHelper[file.uuid].div.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';

        // for backward compatibility
        if (connection.onFileSent || connection.onFileReceived) {
            if (connection.onFileSent) connection.onFileSent(file, file.uuid);
            if (connection.onFileReceived) connection.onFileReceived(file.name, file);
        }
    };

    function updateLabel(progress, label) {
        if (progress.position == -1) return;
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
        } else warn('Session has been closed.', session);
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
            if (session && !isString(session)) {
                for (var stream in this) {
                    if (connection._skip.indexOf(stream) == -1) {
                        _muteOrUnMute(this[stream], session, enabled);
                    }
                }

                function _muteOrUnMute(stream, session, isMute) {
                    if (session.local && stream.type != 'local') return;
                    if (session.remote && stream.type != 'remote') return;

                    if (session.isScreen && !stream.isScreen) return;
                    if (session.isAudio && !stream.isAudio) return;
                    if (session.isVideo && !stream.isVideo) return;

                    if (isMute) stream.mute(session);
                    else stream.unmute(session);
                }
                return;
            }

            // implementation from #68
            for (var stream in this) {
                if (connection._skip.indexOf(stream) == -1) {
                    this[stream]._private(session, enabled);
                }
            }
        },
        stop: function(type) {
            var _stream;
            for (var stream in this) {
                if (connection._skip.indexOf(stream) == -1) {
                    _stream = this[stream];

                    if (!type) _stream.stop();

                    else if (isString(type)) {
                        // connection.streams.stop('screen');
                        var config = {};
                        config[type] = true;
                        _stopStream(_stream, config);
                    } else _stopStream(_stream, type);
                }
            }

            function _stopStream(_stream, config) {
                // connection.streams.stop({ remote: true, userid: 'remote-userid' });
                if (config.userid && _stream.userid != config.userid) return;

                if (config.local && _stream.type != 'local') return;
                if (config.remote && _stream.type != 'remote') return;

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
                if (connection._skip.indexOf(stream) == -1) {
                    _stream = this[stream];

                    if (!type) _stopAndRemoveStream(_stream, {
                        local: true,
                        remote: true
                    });

                    else if (isString(type)) {
                        // connection.streams.stop('screen');
                        var config = {};
                        config[type] = true;
                        _stopAndRemoveStream(_stream, config);
                    } else _stopAndRemoveStream(_stream, type);
                }
            }

            function _stopAndRemoveStream(_stream, config) {
                // connection.streams.remove({ remote: true, userid: 'remote-userid' });
                if (config.userid && _stream.userid != config.userid) return;

                if (config.local && _stream.type != 'local') return;
                if (config.remote && _stream.type != 'remote') return;

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
            if (!args || isString(args) || isEmpty(args)) throw 'Invalid arguments.';

            // if userid is used then both local/remote shouldn't be auto-set
            if (isNull(args.local) && isNull(args.remote) && isNull(args.userid)) {
                args.local = args.remote = true;
            }

            if (!args.isAudio && !args.isVideo && !args.isScreen) {
                args.isAudio = args.isVideo = args.isScreen = true;
            }

            var selectedStreams = [];
            for (var stream in this) {
                if (connection._skip.indexOf(stream) == -1 && (stream = this[stream]) && ((args.local && stream.type == 'local') || (args.remote && stream.type == 'remote') || (args.userid && stream.userid == args.userid))) {
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

    connection.iceServers = [];
    if (typeof IceServersHandler !== 'undefined') {
        connection.iceServers = IceServersHandler.getIceServers();
    }

    connection.rtcConfiguration = {
        iceServers: [],
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        iceCandidatePoolSize: 0
    };

    // www.RTCMultiConnection.org/docs/media/
    connection.media = {
        min: function(width, height) {
            console.warn('connection.media method is deprecated. Please manually set the "connection.mediaConstraints" object.');
        },
        max: function(width, height) {
            console.warn('connection.media method is deprecated. Please manually set the "connection.mediaConstraints" object.');
        }
    };

    connection._getStream = function(event) {
        var resultingObject = merge({
            sockets: event.socket ? [event.socket] : []
        }, event);

        resultingObject.stop = function() {
            var self = this;

            self.sockets.forEach(function(socket) {
                if (self.type == 'local') {
                    socket.send({
                        streamid: self.streamid,
                        stopped: true
                    });
                }

                if (self.type == 'remote') {
                    socket.send({
                        promptStreamStop: true,
                        streamid: self.streamid
                    });
                }
            });

            if (self.type == 'remote') return;

            var stream = self.stream;
            if (stream) self.rtcMultiConnection.stopMediaStream(stream);
        };

        resultingObject.mute = function(session) {
            this.muted = true;
            this._private(session, true);
        };

        resultingObject.unmute = function(session) {
            this.muted = false;
            this._private(session, false);
        };

        function muteOrUnmuteLocally(session, isPause, mediaElement) {
            if (!mediaElement) return;
            var lastPauseState = mediaElement.onpause;
            var lastPlayState = mediaElement.onplay;
            mediaElement.onpause = mediaElement.onplay = function() {};

            if (isPause) mediaElement.pause();
            else mediaElement.play();

            mediaElement.onpause = lastPauseState;
            mediaElement.onplay = lastPlayState;
        }

        resultingObject._private = function(session, enabled) {
            if (session && !isNull(session.sync) && session.sync == false) {
                muteOrUnmuteLocally(session, enabled, this.mediaElement);
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
                    audio: session == 'audio',
                    video: session == 'video'
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
                if (self.stream.getAudioTracks().length && self.stream.getVideoTracks().length) {
                    self.videoRecorder = RecordRTC(self.stream, {
                        type: 'video'
                    });
                } else if (session.video) {
                    self.videoRecorder = RecordRTC(self.stream, {
                        type: 'video'
                    });
                } else if (session.audio) {
                    self.audioRecorder = RecordRTC(self.stream, {
                        type: 'audio'
                    });
                }
            } else if (isChrome) {
                // chrome >= 48 supports MediaRecorder API
                // MediaRecorder API can record remote audio+video streams as well!

                if (isMediaRecorderCompatible() && connection.DetectRTC.browser.version >= 50 && self.stream.getAudioTracks().length && self.stream.getVideoTracks().length) {
                    self.videoRecorder = RecordRTC(self.stream, {
                        type: 'video'
                    });
                } else if (isMediaRecorderCompatible() && connection.DetectRTC.browser.version >= 50) {
                    if (session.video) {
                        self.videoRecorder = RecordRTC(self.stream, {
                            type: 'video'
                        });
                    } else if (session.audio) {
                        self.audioRecorder = RecordRTC(self.stream, {
                            type: 'audio'
                        });
                    }
                } else {
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
            }

            if (self.audioRecorder) {
                self.audioRecorder.startRecording();
            }

            if (self.videoRecorder) self.videoRecorder.startRecording();
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
                    audio: session == 'audio',
                    video: session == 'video'
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
                    } else callback({
                        audio: self.audioRecorder.getBlob()
                    });
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
        if (blob.size && blob.type) FileSaver.SaveToDisk(URL.createObjectURL(blob), fileName || blob.name || blob.type.replace('/', '-') + blob.type.split('/')[1]);
        else FileSaver.SaveToDisk(blob, fileName);
    };

    // www.RTCMultiConnection.org/docs/selectDevices/
    connection.selectDevices = function(device1, device2) {
        if (device1) select(this.devices[device1]);
        if (device2) select(this.devices[device2]);

        function select(device) {
            if (!device) return;
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

        if (callback) callback(connection.devices);
    };

    connection.getMediaDevices = connection.enumerateDevices = function(callback) {
        if (!callback) throw 'callback is mandatory.';
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
            if (connection._skip.indexOf(stream) == -1) {
                stream = connection.streams[stream];
                if (stream.type == 'local') {
                    connection.detachStreams.push(stream.streamid);
                    onStreamEndedHandler(stream, connection);
                } else onStreamEndedHandler(stream, connection);
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

                if (response.error && response.error.message == 'Daily Limit Exceeded') {
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
            if (!volumeChangeEventFired) {
                volumeChangeEventFired = true;
                connection.streams[streamid] && setTimeout(function() {
                    var root = connection.streams[streamid];
                    connection.streams[streamid].sockets.forEach(function(socket) {
                        socket.send({
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

    // www.RTCMultiConnection.org/docs/onMediaFile/
    connection.onMediaFile = function(e) {
        log('onMediaFile', e);
        connection.body.appendChild(e.mediaElement);
    };

    // www.RTCMultiConnection.org/docs/shareMediaFile/
    // this method handles pre-recorded media streaming
    connection.shareMediaFile = function(file, video, streamerid) {
        streamerid = streamerid || connection.token();

        if (!PreRecordedMediaStreamer) {
            loadScript(connection.resources.PreRecordedMediaStreamer, function() {
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

        if (track.kind != 'audio') {
            track.mediaElement.pause();
            track.mediaElement.setAttribute('poster', track.screenshot || connection.resources.muted);
        }
        if (track.kind == 'audio') {
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

        if (track.kind != 'audio') {
            track.mediaElement.play();
            track.mediaElement.removeAttribute('poster');
        }
        if (track.kind != 'audio') {
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
                    if (screenshot != lastScreenshot) {
                        lastScreenshot = screenshot;

                        for (var channel in connection.channels) {
                            connection.channels[channel].send({
                                screenshot: screenshot,
                                isPartOfScreen: true
                            });
                        }
                    }

                    // "once" can be used to share single screenshot
                    !args.once && setTimeout(partOfScreenCapturer, args.interval || 200);
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
        if (!element || !callback) throw 'Invalid number of arguments.';

        if (!window.html2canvas) {
            return loadScript(connection.resources.html2canvas, function() {
                connection.takeScreenshot(element);
            });
        }

        if (isString(element)) {
            element = document.querySelector(element);
            if (!element) element = document.getElementById(element);
        }
        if (!element) throw 'HTML Element is inaccessible!';

        // html2canvas.js is used to take screenshots
        html2canvas(element, {
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

    if (DetectRTC.screen.onScreenCapturingExtensionAvailable) {
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
        if (!event.peer.numOfRetries) event.peer.numOfRetries = 0;
        event.peer.numOfRetries++;

        error('ICE connectivity check is failed. Renegotiating peer connection.');
        event.peer.numOfRetries < 2 && event.peer.renegotiate();

        if (event.peer.numOfRetries >= 2) event.peer.numOfRetries = 0;
    };

    connection.onconnected = function(event) {
        // event.peer.addStream || event.peer.getConnectionStats
        log('Peer connection has been established between you and', event.userid);
    };

    connection.ondisconnected = function(event) {
        error('Peer connection seems has been disconnected between you and', event.userid);

        if (isEmpty(connection.channels)) return;
        if (!connection.channels[event.userid]) return;

        // use WebRTC data channels to detect user's presence
        connection.channels[event.userid].send({
            checkingPresence: true
        });

        // wait 5 seconds, if target peer didn't response, simply disconnect
        setTimeout(function() {
            // iceConnectionState == 'disconnected' occurred out of low-bandwidth
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
        if (!mediaStream) throw 'MediaStream argument is mandatory.';

        if (connection.keepStreamsOpened) {
            addStreamStopListener(mediaStream, mediaStream.onended || function() {});
            return;
        }

        // remove stream from "localStreams" object
        // when native-stop method invoked.
        if (connection.localStreams[mediaStream.streamid]) {
            delete connection.localStreams[mediaStream.streamid];
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

        var firebase = new Firebase(connection.resources.firebaseio + channel);
        firebase.channel = channel;
        firebase.on('child_added', function(data) {
            config.onmessage(data.val());
        });

        firebase.send = function(data) {
            // a quick dirty workaround to make sure firebase
            // shouldn't fail for NULL values.
            for (var prop in data) {
                if (isNull(data[prop]) || typeof data[prop] == 'function') {
                    data[prop] = false;
                }
            }

            this.push(data);
        };

        if (!connection.socket)
            connection.socket = firebase;

        firebase.onDisconnect().remove();

        setTimeout(function() {
            config.callback(firebase);
        }, 1);
    };

    connection.Plugin = Plugin;

    connection.resetScreen = function() {
        sourceId = null;
        if (DetectRTC && DetectRTC.screen) {
            delete DetectRTC.screen.sourceId;
        }

        currentUserMediaRequest = {
            streams: [],
            mutex: false,
            queueRequests: []
        };
    };
}
