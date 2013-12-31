// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - www.RTCMultiConnection.org/docs/

// FAQ               - www.RTCMultiConnection.org/FAQ/
// Development News  - trello.com/b/8bhi1G6n/RTCMultiConnection

// v1.2 changes log  - www.RTCMultiConnection.org/changes-log/#v1.2
// _______________________
// RTCMultiConnection-v1.2

(function() {
    window.RTCMultiConnection = function(channel, extras) {
        extras = extras || { };
        this.channel = channel;
        var self = this,
            rtcSession, fileReceiver, textReceiver;

        self.onmessage = function(message) {
            console.debug('DataChannel message:', message);
        };

        self.onopen = function() {
            console.debug('Data connection opened.');
        };

        self.onFileReceived = function(fileName) {
            console.debug('File <', fileName, '> received successfully.');
        };

        self.onFileSent = function(file) {
            console.debug('File <', file.name, '> sent successfully.');
        };

        self.onFileProgress = function(packets) {
            console.debug('<', packets.remaining, '> items remaining.');
        };

        self.session = extras.session || Session.AudioVideo;
        self.direction = extras.direction || Direction.ManyToMany;

        function prepareInit(callback) {
            if (!self.openSignalingChannel) {
                if (typeof self.transmitRoomOnce == 'undefined') self.transmitRoomOnce = true;

                // socket.io over node.js: https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs
                self.openSignalingChannel = function(config) {
                    config = config || { };

                    channel = config.channel || self.channel || 'default-channel';
                    var socket = new window.Firebase('https://' + (self.firebase || 'chat') + '.firebaseIO.com/' + channel);
                    socket.channel = channel;
                    socket.on('child_added', function(data) {
                        var value = data.val();
                        config.onmessage(value);
                    });

                    socket.send = function(data) {
                        this.push(data);
                    };

                    if (!self.socket) self.socket = socket;
                    if (channel != self.channel || (self.isInitiator && channel == self.channel))
                        socket.onDisconnect().remove();

                    if (config.onopen) setTimeout(config.onopen, 1);
                    return socket;
                };

                if (!window.Firebase) {
                    var script = document.createElement('script');
                    script.src = 'https://cdn.firebase.com/v0/firebase.js';
                    script.onload = callback;
                    document.documentElement.appendChild(script);
                } else callback();
            } else callback();
        }

        function init() {
            if (self.config) return;

            self.direction = self.direction.lowercase();
            self.session = self.session.lowercase();

            self.config = {
                openSignalingChannel: function(config) {
                    return self.openSignalingChannel(config);
                },
                onNewSession: function(session) {
                    if (self.channel !== session.sessionid) return false;

                    if (!rtcSession) {
                        self._session = session;
                        return;
                    }

                    if (self.onNewSession) return self.onNewSession(session);

                    if (self.joinedARoom) return false;
                    self.joinedARoom = true;

                    return joinSession(session, session.extra);
                },
                onChannelOpened: function(userid) {
                    self.onopen(userid);
                },
                onChannelMessage: function(data) {
                    if (!data.size) data = JSON.parse(data);

                    if (data.type === 'text')
                        textReceiver.receive(data, self.onmessage);
                    else if (data.size || data.type === 'file')
                        fileReceiver.receive(data, self.config);
                    else self.onmessage(data);
                },
                onChannelClosed: function(event) {
                    self.onclose(event);
                },
                onChannelError: function(event) {
                    self.onerror(event);
                },
                onFileReceived: function(fileName) {
                    self.onFileReceived(fileName);
                },
                onFileProgress: function(packets) {
                    self.onFileProgress(packets);
                },
                iceServers: self.iceServers,
                attachStream: self.attachStream,
                onRemoteStream: function(stream) {
                    self.onstream(stream);
                },
                onleave: function(userid, extra) {
                    self.onleave(userid, extra);
                },
                direction: self.direction.lowercase(),
                session: self.session.lowercase(),
                channel: self.channel,
                transmitRoomOnce: self.transmitRoomOnce,
                autoCloseEntireSession: typeof self.autoCloseEntireSession == 'undefined' ? false : self.autoCloseEntireSession,
                connection: self
            };
            rtcSession = new RTCMultiSession(self.config);

            // bug: these two must be fixed. Must be able to receive many files concurrently.
            fileReceiver = new FileReceiver();
            textReceiver = new TextReceiver();

            if (self._session) self.config.onNewSession(self._session);
        }

        function joinSession(session, extra) {
            if (!session || !session.userid || !session.sessionid)
                throw 'invalid data passed.';

            self.session = session.session;
            self.direction = session.direction;

            if (session.direction === Direction.OneWay || session.session === Session.Data)
                rtcSession.joinSession(session, extra || { });
            else
                captureUserMedia(function() {
                    rtcSession.joinSession(session, extra || { });
                });
        }

        self.join = joinSession;

        self.open = function(_channel, extra) {
            if (self.socket) self.socket.onDisconnect().remove();

            self.isInitiator = true;

            if (typeof _channel === 'string') {
                if (_channel) self.channel = _channel;
                extra = extra || { };
            } else extra = _channel || { };

            prepareInit(function() {
                init();
                captureUserMedia(function() {
                    rtcSession.initSession(extra);
                });
            });
        };

        self.connect = function(_channel) {
            if (_channel) self.channel = _channel;

            prepareInit(init);
        };

        self.onstream = function(stream) {
            console.debug('stream:', stream);
        };

        self.send = function(data) {
            if (!data) throw 'No file, data or text message to share.';
            if (data.size)
                FileSender.send({
                    file: data,
                    channel: rtcSession,
                    onFileSent: function(file) {
                        self.onFileSent(file);
                    },
                    onFileProgress: function(packets) {
                        self.onFileProgress(packets);
                    }
                });
            else
                TextSender.send({
                    text: data,
                    channel: rtcSession
                });
        };

        function captureUserMedia(callback) {
            var constraints, session = self.session;

            if (session === Session.Data || self.dontAttachStream || self.config.attachStream)
                return callback();

            if (self.attachStream) {
                self.config.attachStream = self.attachStream;
                return callback();
            }

            if (session.isAudio()) {
                console.debug('audio-only session');
                constraints = {
                    audio: true,
                    video: false
                };
            }

            if (session.isScreen()) {
                console.debug('screen-only session');
                video_constraints = {
                    mandatory: {
                        chromeMediaSource: 'screen'
                    },
                    optional: []
                };
                constraints = {
                    audio: false,
                    video: video_constraints
                };
            }

            if (session === Session.Video || session === Session.VideoData) {
                console.debug('audio-less video-only session.');
                video_constraints = {
                    mandatory: { },
                    optional: []
                };
                constraints = {
                    audio: false,
                    video: video_constraints
                };
            }
            var mediaElement = document.createElement(session.isAudio() ? 'audio' : 'video');
            var mediaConfig = {
                video: mediaElement,
                onsuccess: function(stream) {
                    self.config.attachStream = stream;
                    callback && callback();

                    // issue #37: Sometimes Firefox crashes while echoing and you have to hard reboot your PC ( Ubuntu 13.04, FF 21 )
                    mediaElement.muted = true;
                    self.onstream({
                        stream: stream,
                        mediaElement: mediaElement,
                        blobURL: mediaElement.mozSrcObject || mediaElement.src,
                        type: 'local'
                    });
                },
                onerror: function() {
                    if (session.isAudio())
                        throw 'Unable to get access to your microphone';
                    else if (session.isScreen()) {
                        if (location.protocol === 'http:') {
                            throw 'Please test this WebRTC experiment on HTTPS.';
                        } else {
                            throw 'Screen capturing is either denied or not supported. Are you enabled flag: "Enable screen capture support in getUserMedia"?';
                        }
                    } else {
                        throw 'Unable to get access to your webcam';
                    }
                }
            };
            if (constraints)
                mediaConfig.constraints = constraints;

            getUserMedia(mediaConfig);
            return true;
        }

        this.onUserLeft = function(userid /*, extra */) {
            console.debug(userid, 'left!');
        };

        this.onleave = function(userid, extra) {
            self.onUserLeft(userid, extra);
        };

        this.leave = function(userid) {
            rtcSession.leave(userid, self.autoCloseEntireSession);
        };

        this.eject = function(userid) {
            if (!userid) throw '"user-id" is mandatory.';
            rtcSession.leave(userid, self.autoCloseEntireSession);
        };

        for (var extra in extras) {
            this[extra] = extras[extra];
        }

        if (self.channel) self.connect();
    };

    var Session = {
        AudioVideoData: 'audiovideodata',
        AudioVideo: 'audiovideo',
        AudioData: 'audiodata',
        VideoData: 'videodata',
        Audio: 'audio',
        Video: 'video',
        Data: 'data',
        ScreenData: 'screendata',
        Screen: 'screen'
    };
    window.RTCSession = Session;

    var Direction = {
        OneWay: 'oneway',
        OneToOne: 'onetoone',
        OneToMany: 'onetomany',
        ManyToMany: 'manytomany'
    };
    window.RTCDirection = Direction;

    String.prototype.isAudio = function() {
        var session = this + '';
        return session === Session.Audio || session === Session.AudioData;
    };

    String.prototype.isScreen = function() {
        var session = this + '';
        return session === Session.Screen || session === Session.ScreenData;
    };

    String.prototype.lowercase = function() {
        var str = this + '';
        return str.toLowerCase().replace( /-|( )|\+|only|and/g , '');
    };

    Array.prototype.swap = function() {
        var swapped = [],
            arr = this,
            length = arr.length;
        for (var i = 0; i < length; i++) {
            if (arr[i]) swapped[swapped.length] = arr[i];
        }
        return swapped;
    };

    window.MediaStream = window.MediaStream || window.webkitMediaStream;

    window.moz = !!navigator.mozGetUserMedia;
    var RTCPeerConnection = function(options) {
        var w = window,
            PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
            SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
            IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

        var STUN = {
            url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
        };

        var TURN = {
            url: 'turn:homeo@turn.bistri.com:80',
            credential: 'homeo'
        };

        var iceServers = {
            iceServers: options.iceServers || [STUN]
        };

        if (!moz && !options.iceServers) {
            if (parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]) >= 28)
                TURN = {
                    url: 'turn:turn.bistri.com:80',
                    credential: 'homeo',
                    username: 'homeo'
                };

            // No STUN to make sure it works all the time!
            iceServers.iceServers = [STUN, TURN];
        }

        var optional = {
            optional: []
        };

        if (!moz) {
            optional.optional = [{
                DtlsSrtpKeyAgreement: true
            }];
            if (options.onChannelMessage)
                optional.optional = [{
                    RtpDataChannels: true
                }];
        }

        var peerConnection = new PeerConnection(iceServers, optional);

        openOffererChannel();

        peerConnection.onicecandidate = onicecandidate;
        if (options.attachStream)
            peerConnection.addStream(options.attachStream);
        peerConnection.onaddstream = onaddstream;

        function onicecandidate(event) {
            if (!event.candidate || !peerConnection)
                return;
            if (options.onICE)
                options.onICE(event.candidate);
        }

        var remoteStreamEventFired = false;

        function onaddstream(event) {
            if (remoteStreamEventFired || !event || !options.onRemoteStream)
                return;
            remoteStreamEventFired = true;
            options.onRemoteStream(event.stream);
        }

        var constraints = options.constraints || {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }
        };

        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
            extractedChars = '';

        function getChars() {
            extractedChars += chars[parseInt(Math.random() * 40)] || '';
            if (extractedChars.length < 40)
                getChars();

            return extractedChars;
        }

        function createOffer() {
            if (!options.onOfferSDP)
                return;

            peerConnection.createOffer(function(sessionDescription) {
                peerConnection.setLocalDescription(sessionDescription);
                options.onOfferSDP(sessionDescription);
            }, onSdpError, constraints);
        }

        function createAnswer() {
            if (!options.onAnswerSDP)
                return;

            options.offerSDP = new SessionDescription(options.offerSDP);
            peerConnection.setRemoteDescription(options.offerSDP, onSdpSuccess, onSdpError);

            peerConnection.createAnswer(function(sessionDescription) {
                peerConnection.setLocalDescription(sessionDescription);
                options.onAnswerSDP(sessionDescription);
            }, onSdpError, constraints);
        }

        if ((options.onChannelMessage && !moz) || !options.onChannelMessage) {
            createOffer();
            createAnswer();
        }

        var channel;

        function openOffererChannel() {
            if (!options.onChannelMessage || (moz && !options.onOfferSDP))
                return;

            _openOffererChannel();

            if (moz && !options.attachStream) {
                navigator.mozGetUserMedia({
                        audio: true,
                        fake: true
                    }, function(stream) {
                        peerConnection.addStream(stream);
                        createOffer();
                    }, useless);
            }
        }

        function _openOffererChannel() {
            channel = peerConnection.createDataChannel(
                options.channel || 'RTCDataChannel',
                moz ? { } : {
                    reliable: false
                });

            if (moz) channel.binaryType = 'blob';
            setChannelEvents();
        }

        function setChannelEvents() {
            channel.onmessage = function(event) {
                if (options.onChannelMessage)
                    options.onChannelMessage(event);
            };

            channel.onopen = function() {
                if (options.onChannelOpened)
                    options.onChannelOpened(channel);
            };
            channel.onclose = function(event) {
                if (options.onChannelClosed)
                    options.onChannelClosed(event);
                console.warn('WebRTC Data Channel closed.', event);
            };
            channel.onerror = function(event) {
                if (options.onChannelError)
                    options.onChannelError(event);
                console.error('WebRTC Data Channel error:', event);
            };
        }

        if (options.onAnswerSDP && moz && options.onChannelMessage)
            openAnswererChannel();

        function openAnswererChannel() {
            peerConnection.ondatachannel = function(event) {
                channel = event.channel;
                channel.binaryType = 'blob';
                setChannelEvents();
            };

            if (moz && !options.attachStream) {
                navigator.mozGetUserMedia({
                        audio: true,
                        fake: true
                    }, function(stream) {
                        peerConnection.addStream(stream);
                        createAnswer();
                    }, useless);
            }
        }

        function useless() {
        }

        function onSdpSuccess() {
        }

        function onSdpError(e) {
            console.error('sdp error:', e.name, e.message);
        }

        return {
            addAnswerSDP: function(sdp) {
                sdp = new SessionDescription(sdp);
                peerConnection.setRemoteDescription(sdp, onSdpSuccess, onSdpError);
            },
            addICE: function(candidate) {
                peerConnection.addIceCandidate(new IceCandidate({
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: candidate.candidate
                }));
            },

            peer: peerConnection,
            channel: channel,
            sendData: function(message) {
                channel && channel.send(message);
            }
        };
    };

    var video_constraints = {
        mandatory: { },
        optional: []
    };

    function getUserMedia(options) {
        var n = navigator,
            media;
        n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
        n.getMedia(options.constraints || {
                audio: true,
                video: video_constraints
            }, streaming, options.onerror || function(e) {
                console.error(e);
            });

        function streaming(stream) {
            var video = options.video;
            if (video) {
                video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
                video.play();
            }
            options.onsuccess && options.onsuccess(stream);
            media = stream;
        }

        return media;
    }

    function RTCMultiSession(config) {
        var session = config.session || Session.AudioVideo,
            direction = config.direction || Direction.ManyToMany,
            self = {
                id: uniqueToken(),
                sessionid: config.channel,
                sockets: [],
                socketObjects: { }
            },
            channels = '--',
            isbroadcaster,
            isAcceptNewSession = true,
            defaultSocket = { }, RTCDataChannels = [];

        function openDefaultSocket() {
            defaultSocket = config.openSignalingChannel({
                onmessage: onDefaultSocketResponse,
                callback: function(socket) {
                    defaultSocket = socket;
                }
            });
        }

        function onDefaultSocketResponse(response) {
            if (response.userid == self.id)
                return;

            if (isAcceptNewSession && response.sessionid && response.userid)
                if (config.onNewSession)
                    config.onNewSession(response);

            if (response.newParticipant && self.joinedARoom && self.broadcasterid === response.userid)
                onNewParticipant(response.newParticipant, response.extra);

            if (response.userid && response.targetUser == self.id && response.participant && channels.indexOf(response.userid) == -1) {
                channels += response.userid + '--';
                openSubSocket({
                    isofferer: true,
                    channel: response.channel || response.userid,
                    closeSocket: true,
                    extra: response.extra
                });
            }
        }

        function openSubSocket(_config) {
            if (!_config.channel)
                return;
            var socketConfig = {
                channel: _config.channel,
                onmessage: socketResponse,
                onopen: function() {
                    if (isofferer && !peer)
                        initPeer();

                    _config.socketIndex = socket.index = self.sockets.length;
                    self.socketObjects[socketConfig.channel] = socket;
                    self.sockets[_config.socketIndex] = socket;
                }
            };

            socketConfig.callback = function(_socket) {
                socket = _socket;
                this.onopen();
            };

            var socket = config.openSignalingChannel(socketConfig),
                isofferer = _config.isofferer,
                extra = _config.extra || { },
                isGotRemoteStream,
                inner = { },
                mediaElement = document.createElement(session.isAudio() ? 'audio' : 'video'),
                peer;

            var peerConfig = {
                onICE: function(candidate) {
                    socket.send({
                        id: self.id,
                        candidate: {
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            candidate: JSON.stringify(candidate.candidate)
                        }
                    });
                },
                onChannelOpened: onChannelOpened,
                onChannelMessage: function(event) {
                    if (config.onChannelMessage)
                        config.onChannelMessage(event.data);
                },
                attachStream: config.attachStream,
                onRemoteStream: function(stream) {
                    mediaElement[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
                    mediaElement.autoplay = true;
                    mediaElement.controls = true;
                    mediaElement.play();

                    _config.stream = stream;
                    if (session.isAudio()) {
                        mediaElement.addEventListener('play', function() {
                            setTimeout(function() {
                                mediaElement.muted = false;
                                mediaElement.volume = 1;
                                window.audio = mediaElement;
                                afterRemoteStreamStartedFlowing();
                            }, 3000);
                        }, false);
                    } else
                        onRemoteStreamStartsFlowing();
                },
                iceServers: config.iceServers,
                session: session
            };

            function initPeer(offerSDP) {
                if (direction === Direction.OneToOne && window.isFirstConnectionOpened)
                    return;
                if (!offerSDP) {
                    peerConfig.onOfferSDP = sendsdp;
                } else {
                    peerConfig.offerSDP = offerSDP;
                    peerConfig.onAnswerSDP = sendsdp;
                }

                if (session.indexOf('data') === -1)
                    peerConfig.onChannelMessage = null;

                if (session.isAudio()) {
                    /* OfferToReceiveVideo MUST be false for audio-only streaming */
                    peerConfig.constraints = {
                        optional: [],
                        mandatory: {
                            OfferToReceiveAudio: true,
                            OfferToReceiveVideo: false
                        }
                    };
                }

                peer = RTCPeerConnection(peerConfig);
            }

            function onRemoteStreamStartsFlowing() {
                if (!(mediaElement.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || mediaElement.paused || mediaElement.currentTime <= 0)) {
                    afterRemoteStreamStartedFlowing();
                } else
                    setTimeout(onRemoteStreamStartsFlowing, 300);
            }

            function afterRemoteStreamStartedFlowing() {
                if (config.onRemoteStream)
                    config.onRemoteStream({
                        mediaElement: mediaElement,
                        stream: _config.stream,
                        session: session,
                        direction: direction,
                        blobURL: mediaElement.mozSrcObject || mediaElement.src,
                        type: 'remote',
                        extra: extra || { },
                        userid: _config.userid
                    });

                onSessionOpened();
            }

            function onChannelOpened(channel) {
                RTCDataChannels[RTCDataChannels.length] = channel;
                if (config.onChannelOpened) config.onChannelOpened(extra);
                onSessionOpened();
            }

            function onSessionOpened() {
                if (isGotRemoteStream) return;
                window.isFirstConnectionOpened = isGotRemoteStream = true;

                if (direction === Direction.ManyToMany && isbroadcaster && channels.split('--').length > 3) {
                    if (!_config.alreadySentDetails) {
                        _config.alreadySentDetails = true;
                        defaultSocket.send({
                            newParticipant: socket.channel,
                            userid: self.id,
                            extra: extra
                        });
                    }
                }
            }

            function sendsdp(sdp) {
                sdp = JSON.stringify(sdp);
                var part = parseInt(sdp.length / 3);

                var firstPart = sdp.slice(0, part),
                    secondPart = sdp.slice(part, sdp.length - 1),
                    thirdPart = '';

                if (sdp.length > part + part) {
                    secondPart = sdp.slice(part, part + part);
                    thirdPart = sdp.slice(part + part, sdp.length);
                }

                socket.send({
                    id: self.id,
                    firstPart: firstPart
                });

                socket.send({
                    id: self.id,
                    secondPart: secondPart
                });

                socket.send({
                    id: self.id,
                    thirdPart: thirdPart
                });
            }

            function socketResponse(response) {
                if (response.id == self.id)
                    return;

                if (response.firstPart || response.secondPart || response.thirdPart) {
                    if (response.firstPart) {
                        // sdp sender's user id passed over onRemoteStream and onopen
                        _config.userid = response.id;

                        inner.firstPart = response.firstPart;
                        if (inner.secondPart && inner.thirdPart)
                            selfInvoker();
                    }
                    if (response.secondPart) {
                        inner.secondPart = response.secondPart;
                        if (inner.firstPart && inner.thirdPart)
                            selfInvoker();
                    }

                    if (response.thirdPart) {
                        inner.thirdPart = response.thirdPart;
                        if (inner.firstPart && inner.secondPart)
                            selfInvoker();
                    }
                }

                if (response.candidate && !isGotRemoteStream) {
                    peer && peer.addICE({
                        sdpMLineIndex: response.candidate.sdpMLineIndex,
                        candidate: JSON.parse(response.candidate.candidate)
                    });
                }

                if (response.left) {
                    if (peer && peer.peer) {
                        peer.peer.close();
                        peer.peer = null;
                    }

                    if (response.closeEntireSession) {
                        // room owner asked me to leave his room
                        leaveARoom();
                    } else if (socket) {
                        socket.send({
                            left: true,
                            extra: self.extra,
                            id: self.id
                        });

                        if (self.sockets[_config.socketIndex]) delete self.sockets[_config.socketIndex];
                        if (self.socketObjects[socket.channel]) delete self.socketObjects[socket.channel];

                        socket = null;
                    }

                    if (config.onleave) config.onleave(response.id, response.extra);
                }

                if (response.playRoleOfBroadcaster)
                    setTimeout(function() {
                        self.id = response.id;
                        config.connection.open({
                            extra: self.extra
                        });
                        self.sockets = self.sockets.swap();
                    }, 600);
            }

            var invokedOnce = false;

            function selfInvoker() {
                if (invokedOnce)
                    return;

                invokedOnce = true;
                inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);
                if (isofferer)
                    peer.addAnswerSDP(inner.sdp);
                else
                    initPeer(inner.sdp);
            }
        }

        function onNewParticipant(channel, extra) {
            if (!channel || channels.indexOf(channel) != -1 || channel == self.id)
                return;
            channels += channel + '--';

            var new_channel = uniqueToken();
            openSubSocket({
                channel: new_channel,
                closeSocket: true,
                extra: extra || { }
            });

            defaultSocket.send({
                participant: true,
                userid: self.id,
                targetUser: channel,
                channel: new_channel,
                extra: self.extra
            });
        }

        function uniqueToken() {
            return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
        }

        function leaveARoom(channel) {
            var alert = {
                left: true,
                extra: self.extra || { },
                id: self.id
            };

            // if room initiator is leaving the room; close the entire session
            if (isbroadcaster) {
                if (config.autoCloseEntireSession) alert.closeEntireSession = true;
                else
                    self.sockets[0].send({
                        playRoleOfBroadcaster: true,
                        id: self.id
                    });
            }

            if (!channel) {
                // closing all sockets
                var sockets = self.sockets,
                    length = sockets.length;

                for (var i = 0; i < length; i++) {
                    var socket = sockets[i];
                    if (socket) {
                        socket.send(alert);

                        if (self.socketObjects[socket.channel])
                            delete self.socketObjects[socket.channel];

                        delete sockets[i];
                    }
                }

                that.left = true;
            }

            // eject a specific user!
            if (channel) {
                socket = self.socketObjects[channel];
                if (socket) {
                    socket.send(alert);

                    if (self.sockets[socket.index])
                        delete self.sockets[socket.index];

                    delete self.socketObjects[channel];
                }
            }
            self.sockets = self.sockets.swap();
        }

        var that = this;

        window.onbeforeunload = function() {
            leaveARoom();
        };

        window.onkeyup = function(e) {
            if (e.keyCode == 116) leaveARoom();
        };

        (function() {
            var anchors = document.querySelectorAll('a'),
                length = anchors.length;
            for (var i = 0; i < length; i++) {
                a = anchors[i];
                if (a.href.indexOf('#') !== 0 && a.getAttribute('target') != '_blank')
                    a.onclick = function() {
                        leaveARoom();
                    };
            }
        })();

        openDefaultSocket();
        return {
            initSession: function(extra) {
                isbroadcaster = true;
                isAcceptNewSession = false;

                extra = extra || { };

                extra.interval = extra.interval || 3000;
                self.extra = extra.extra = extra.extra || { };

                (function transmit() {
                    defaultSocket && defaultSocket.send({
                        sessionid: self.sessionid,
                        userid: self.id,
                        session: config.session,
                        direction: config.direction,
                        extra: extra.extra
                    });

                    if (!config.transmitRoomOnce && !that.leaving) {
                        if (config.direction === Direction.OneToOne) {
                            if (!window.isFirstConnectionOpened)
                                setTimeout(transmit, extra.interval);
                        } else
                            setTimeout(transmit, extra.interval);
                    }
                })();

                self.extra = extra;
            },
            joinSession: function(_config, extra) {
                _config = _config || { };
                self.extra = extra;

                session = _config.session;
                direction = _config.direction;

                self.joinedARoom = true;

                if (_config.sessionid) self.sessionid = _config.sessionid;
                isAcceptNewSession = false;

                openSubSocket({
                    channel: self.id,
                    extra: _config.extra || { }
                });

                defaultSocket.send({
                    participant: true,
                    userid: self.id,
                    targetUser: _config.userid,
                    extra: extra || { }
                });

                // used to make sure each room's messages must be stay in the same room
                // outsiders must be unable to acess them
                self.broadcasterid = _config.userid;
            },
            send: function(message) {
                var _channels = RTCDataChannels,
                    data, length = _channels.length;
                if (!length) return;

                if (moz && message.file) data = message.file;
                else data = JSON.stringify(message);

                for (var i = 0; i < length; i++)
                    _channels[i].send(data);
            },
            getSession: function() {
                return {
                    userid: self.id,
                    sessionid: self.sessionid,
                    session: session,
                    direction: direction
                };
            },
            leave: function(userid, autoCloseEntireSession) {
                if (autoCloseEntireSession) config.autoCloseEntireSession = true;
                leaveARoom(userid);
                if (!userid) {
                    self.joinedARoom = isbroadcaster = false;
                    isAcceptNewSession = true;
                }
            }
        };
    }

    var FileSender = {
        send: function(config) {
            var channel = config.channel,
                file = config.file;

            /* if firefox nightly: share file blob directly */
            if (moz) {
                /* used on the receiver side to set received file name */
                channel.send({
                    fileName: file.name,
                    type: 'file'
                });

                /* sending the entire file at once */
                channel.send({
                    file: file
                });

                if (config.onFileSent)
                    config.onFileSent(file);
            }

            /* if chrome */
            if (!moz) {
                var reader = new window.FileReader();
                reader.readAsDataURL(file);
                reader.onload = onReadAsDataURL;
            }

            var packetSize = 1000 /* chars */,
                textToTransfer = '',
                numberOfPackets = 0,
                packets = 0;

            function onReadAsDataURL(event, text) {
                var data = {
                    type: 'file'
                };

                if (event) {
                    text = event.target.result;
                    numberOfPackets = packets = data.packets = parseInt(text.length / packetSize);
                }

                if (config.onFileProgress)
                    config.onFileProgress({
                        remaining: packets--,
                        length: numberOfPackets,
                        sent: numberOfPackets - packets
                    });

                if (text.length > packetSize)
                    data.message = text.slice(0, packetSize);
                else {
                    data.message = text;
                    data.last = true;
                    data.name = file.name;

                    if (config.onFileSent)
                        config.onFileSent(file);
                }

                channel.send(data);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length)
                    setTimeout(function() {
                        onReadAsDataURL(null, textToTransfer);
                    }, 500);
            }
        }
    };

    function FileReceiver() {
        var content = [],
            fileName = '',
            packets = 0,
            numberOfPackets = 0;

        function receive(data, config) {
            /* if firefox nightly & file blob shared */
            if (moz) {
                if (data.fileName)
                    fileName = data.fileName;
                if (data.size) {
                    var reader = new window.FileReader();
                    reader.readAsDataURL(data);
                    reader.onload = function(event) {
                        FileSaver.SaveToDisk(event.target.result, fileName);
                        if (config.onFileReceived)
                            config.onFileReceived(fileName);
                    };
                }
            }

            if (!moz) {
                if (data.packets)
                    numberOfPackets = packets = parseInt(data.packets);

                if (config.onFileProgress)
                    config.onFileProgress({
                        remaining: packets--,
                        length: numberOfPackets,
                        received: numberOfPackets - packets
                    });

                content.push(data.message);

                if (data.last) {
                    FileSaver.SaveToDisk(content.join(''), data.name);
                    if (config.onFileReceived)
                        config.onFileReceived(data.name);
                    content = [];
                }
            }
        }

        return {
            receive: receive
        };
    }

    var TextSender = {
        send: function(config) {
            var channel = config.channel,
                initialText = config.text,
                packetSize = 1000 /* chars */,
                textToTransfer = '';

            if (typeof initialText !== 'string') initialText = JSON.stringify(initialText);

            if (moz || initialText.length <= packetSize) channel.send(config.text);
            else sendText(initialText);

            function sendText(textMessage, text) {
                var data = {
                    type: 'text'
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
                }

                channel.send(data);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length)
                    setTimeout(function() {
                        sendText(null, textToTransfer);
                    }, 500);
            }
        }
    };

    function TextReceiver() {
        var content = [];

        function receive(data, onmessage) {
            content.push(data.message);
            if (data.last) {
                if (onmessage) onmessage(content.join(''));
                content = [];
            }
        }

        return {
            receive: receive
        };
    }

    var FileSaver = {
        SaveToDisk: function(fileUrl, fileName) {
            var save = document.createElement('a');
            save.href = fileUrl;
            save.target = '_blank';
            save.download = fileName || fileUrl;

            var evt = document.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

            save.dispatchEvent(evt);

            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        }
    };
})();
