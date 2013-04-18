/*  MIT License: https://webrtc-experiment.appspot.com/licence/ 
    2013, Muaz Khan<muazkh>--[github.com/muaz-khan] 
    
	https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection */

function RTCMultiConnection(channel) {
    this.channel = channel;
    var self = this,
        rtcSession, fileReceiver, textReceiver;

    self.onmessage = function (message) {
        console.debug('DataChannel message:', message);
    };

    self.onopen = function (_channel) {
        _channel.send('First text message!');
    };

    self.onFileReceived = function (fileName) {
        console.debug('File <', fileName, '> received successfully.');
    };

    self.onFileSent = function (file) {
        console.debug('File <', file.name, '> sent successfully.');
    };
    self.onFileProgress = function (packets) {
        console.debug('<', packets.remaining, '> items remaining.');
    };
    self.session = Session.AudioVideo;
    self.direction = Direction.ManyToMany;

    function prepareInit(callback) {
        if (!self.openSignalingChannel) {
            self.openSignalingChannel = function (config) {
                config = config || {};
                channel = config.channel || self.channel || 'default-channel';
                var socket = new window.Firebase('https://chat.firebaseIO.com/' + channel);
                socket.channel = channel;
                socket.on('child_added', function (data) {
                    config.onmessage && config.onmessage(data.val());
                });
                socket.send = function (data) {
                    this.push(data);
                };
                config.onopen && setTimeout(config.onopen, 1);
                socket.onDisconnect().remove();
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
        self.direction = self.direction.lowercase();
        self.session = self.session.lowercase();

        self.config = {
            openSignalingChannel: function (config) {
                return self.openSignalingChannel(config);
            },
            onNewSession: function (session) {
                if (self.channel !== session.sessionid) return;

                if (self.joinedARoom) return;
                self.joinedARoom = true;

                self.session = session.session;
                self.direction = session.direction;

                if (session.direction === Direction.OneWay || session.session === Session.Data)
                    joinSession(session);
                else
                    captureUserMedia(function () {
                        joinSession(session);
                    });
            },
            onChannelOpened: function () {
                self.onopen(self);
            },
            onChannelMessage: function (data) {
                if (!data.size) data = JSON.parse(data);

                if (data.type === 'text')
                    textReceiver.receive(data, self.onmessage);
                else if (data.size || data.type === 'file')
                    fileReceiver.receive(data, self.config);
                else self.onmessage(data);
            },
            onChannelClosed: self.onclose,
            onChannelError: self.onerror,
            onFileReceived: self.onFileReceived,
            onFileProgress: self.onFileProgress,
            iceServers: self.iceServers,

            attachStream: self.attachStream,
            onRemoteStream: self.onstream,

            direction: self.direction,
            session: self.session,
            channel: self.channel
        };
        rtcSession = new RTCMultiSession(self.config);
        fileReceiver = new FileReceiver();
        textReceiver = new TextReceiver();
    }

    function joinSession(session) {
        if (!session || !session.userid || !session.sessionid)
            throw 'invalid data passed.';

        rtcSession.joinSession(session);
    }

    self.open = function (_channel) {
        if (_channel) self.channel = _channel;
        prepareInit(function () {
            init();
            captureUserMedia(rtcSession.initSession);
        });
    };
    self.close = function () {
        self.config.attachStream.stop();
        rtcSession.close();
    };
    self.connect = function (_channel) {
        if (_channel) self.channel = _channel;
        prepareInit(init);
    };
    self.onstream = function (stream) {
        console.debug('stream:', stream);
    };
    self.send = function (data) {
        if (!data) throw 'No file, data or text message to share.';
        if (data.size)
            FileSender.send({
                file: data,
                channel: rtcSession,
                onFileSent: self.onFileSent,
                onFileProgress: self.onFileProgress
            });
        else
            TextSender.send({
                text: data,
                channel: rtcSession
            });
    };

    function captureUserMedia(callback) {
        var constraints, session = self.session;

        if (session === Session.Data || self.dontAttachStream)
            return callback();

        if (self.attachStream) {
            self.config.attachStream = self.attachStream;
            return callback();
        }

        if (session.isAudio()) {
            constraints = {
                audio: true,
                video: false
            };
        }
        if (session.isScreen()) {
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
            var video_constraints = {
                mandatory: {},
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
            onsuccess: function (stream) {
                self.config.attachStream = stream;
                callback && callback();

                self.onstream({
                    stream: stream,
                    mediaElement: mediaElement,
                    blobURL: mediaElement.mozSrcObject || mediaElement.src,
                    type: 'local'
                });
            },
            onerror: function () {
                if (session.isAudio())
                    throw 'unable to get access to your microphone';
                else if (session.isScreen()) {
                    if (location.protocol === 'http:') {
                        throw 'Please test this WebRTC experiment on HTTPS.';
                    } else {
                        throw 'Screen capturing is either denied or not supported.';
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
}

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

var Direction = {
    OneWay: 'oneway',
    OneToOne: 'onetoone',
    OneToMany: 'onetomany',
    ManyToMany: 'manytomany'
};

String.prototype.isAudio = function () {
    var session = this + '';
    return session === Session.Audio || session === Session.AudioData;
};

String.prototype.isScreen = function () {
    var session = this + '';
    return session === Session.Screen || session === Session.ScreenData;
};

String.prototype.lowercase = function () {
    var str = this + '';
    return str.toLowerCase().replace(/-|( )|\+|only|and/g, '');
};

window.MediaStream = window.MediaStream || window.webkitMediaStream;

window.moz = !!navigator.mozGetUserMedia;
var RTCPeerConnection = function (options) {
    var w = window,
        PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
        SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
        IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

    var STUN = {
        url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
    };
    var TURN = {
        url: 'turn:webrtc%40live.com@numb.viagenie.ca',
        credential: 'muazkh'
    };
    var iceServers = {
        iceServers: options.iceServers || [STUN]
    };
    if (!moz && !options.iceServers) iceServers.iceServers[1] = TURN;

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

    function getInteropSDP(sdp) {
        var inline = getChars() + '\r\n' + (extractedChars = '');
        sdp = sdp.indexOf('a=crypto') == -1 ? sdp.replace(/c=IN/g,
            'a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:' + inline +
                'c=IN') : sdp;

        return sdp;
    }

    if (moz && !options.onChannelMessage)
        constraints.mandatory.MozDontOfferDataChannel = true;

    function createOffer() {
        if (!options.onOfferSDP)
            return;

        peerConnection.createOffer(function (sessionDescription) {
            sessionDescription.sdp = getInteropSDP(sessionDescription.sdp);
            peerConnection.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);
        }, null, constraints);
    }

    function createAnswer() {
        if (!options.onAnswerSDP)
            return;

        options.offerSDP = new SessionDescription(options.offerSDP);
        peerConnection.setRemoteDescription(options.offerSDP);

        peerConnection.createAnswer(function (sessionDescription) {
            sessionDescription.sdp = getInteropSDP(sessionDescription.sdp);
            peerConnection.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);
        }, null, constraints);
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
            }, function (stream) {
                peerConnection.addStream(stream);
                createOffer();
            }, useless);
        }
    }

    function _openOffererChannel() {
        channel = peerConnection.createDataChannel(
            options.channel || 'RTCDataChannel',
            moz ? {} : {
                reliable: false
            });

        if (moz) channel.binaryType = 'blob';
        setChannelEvents();
    }

    function setChannelEvents() {
        channel.onmessage = function (event) {
            if (options.onChannelMessage)
                options.onChannelMessage(event);
        };

        channel.onopen = function () {
            if (options.onChannelOpened)
                options.onChannelOpened(channel);
        };
        channel.onclose = function (event) {
            if (options.onChannelClosed)
                options.onChannelClosed(event);
        };
        channel.onerror = function (event) {
            if (options.onChannelError)
                options.onChannelError(event);
            console.error('WebRTC Data Channel error:', event);
        };
    }

    if (options.onAnswerSDP && moz)
        openAnswererChannel();

    function openAnswererChannel() {
        peerConnection.ondatachannel = function (event) {
            channel = event.channel;
            channel.binaryType = 'blob';
            setChannelEvents();
        };

        if (moz && !options.attachStream) {
            navigator.mozGetUserMedia({
                audio: true,
                fake: true
            }, function (stream) {
                peerConnection.addStream(stream);
                createAnswer();
            }, useless);
        }
    }

    function useless() {
    }

    return {
        addAnswerSDP: function (sdp) {
            sdp = new SessionDescription(sdp);
            peerConnection.setRemoteDescription(sdp);
        },
        addICE: function (candidate) {
            peerConnection.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        },

        peer: peerConnection,
        channel: channel,
        sendData: function (message) {
            channel && channel.send(message);
        },
        close: function() {
            peerConnection.close();
        }
    };
};

var video_constraints = {
    mandatory: {},
    optional: []
};

function getUserMedia(options) {
    var n = navigator,
        media;
    n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
    n.getMedia(options.constraints || {
        audio: true,
        video: video_constraints
    }, streaming, options.onerror || function (e) {
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
            sessionid: config.channel
        },
        channels = '--',
        isbroadcaster,
        isAcceptNewSession = true,
        defaultSocket = {}, RTCDataChannels = [], RTCPeerConnections = [];

    function openDefaultSocket() {
        defaultSocket = config.openSignalingChannel({
            onmessage: onDefaultSocketResponse
        });
    }

    function onDefaultSocketResponse(response) {
        if (response.userid == self.id)
            return;

        if (isAcceptNewSession && response.sessionid && response.userid)
            if (config.onNewSession)
                config.onNewSession(response);

        if (response.newParticipant)
            onNewParticipant(response.newParticipant);

        if (response.userid && response.targetUser == self.id && response.participant && channels.indexOf(response.userid) == -1) {
            channels += response.userid + '--';
            openSubSocket({
                isofferer: true,
                channel: response.channel || response.userid,
                closeSocket: true
            });
        }
    }

    function openSubSocket(_config) {
        if (!_config.channel)
            return;
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse,
            onopen: function () {
                if (isofferer && !peer)
                    initPeer();
            }
        };

        var socket = config.openSignalingChannel(socketConfig),
            isofferer = _config.isofferer,
            isGotRemoteStream,
            inner = {},
            mediaElement = document.createElement(session.isAudio() ? 'audio' : 'video'),
            peer;

        var peerConfig = {
            onICE: function (candidate) {
                socket.send({
                    id: self.id,
                    candidate: {
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        candidate: JSON.stringify(candidate.candidate)
                    }
                });
            },
            onChannelOpened: onChannelOpened,
            onChannelMessage: function (event) {
                if (config.onChannelMessage)
                    config.onChannelMessage(event.data);
            },
            attachStream: config.attachStream,
            onRemoteStream: function (stream) {
                mediaElement[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
                mediaElement.play();

                _config.stream = stream;
                if (session.isAudio()) {
                    mediaElement.addEventListener('play', function () {
                        this.muted = false;
                        this.volume = 1;
                        afterRemoteStreamStartedFlowing();
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

            peer = RTCPeerConnection(peerConfig);
            RTCPeerConnections[RTCPeerConnections.length] = peer;
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
                    type: 'remote'
                });

            onSessionOpened();
        }

        function onChannelOpened(channel) {
            RTCDataChannels[RTCDataChannels.length] = channel;
            if (config.onChannelOpened) config.onChannelOpened(channel);
            onSessionOpened();
        }

        function onSessionOpened() {
            if (isGotRemoteStream) return;
            window.isFirstConnectionOpened = isGotRemoteStream = true;

            if (direction === Direction.ManyToMany && isbroadcaster && channels.split('--').length > 3) {
                defaultSocket.send({
                    newParticipant: socket.channel,
                    userid: self.id
                });
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

    function startBroadcasting() {
        defaultSocket.send({
            sessionid: self.sessionid,
            userid: self.id,
            session: config.session,
            direction: config.direction
        });

        if (config.direction === Direction.OneToOne) {
            if (!window.isFirstConnectionOpened)
                setTimeout(startBroadcasting, 3000);
        } else
            setTimeout(startBroadcasting, 3000);
    }

    function onNewParticipant(channel) {
        if (!channel || channels.indexOf(channel) != -1 || channel == self.id)
            return;
        channels += channel + '--';

        var new_channel = uniqueToken();
        openSubSocket({
            channel: new_channel,
            closeSocket: true
        });

        defaultSocket.send({
            participant: true,
            userid: self.id,
            targetUser: channel,
            channel: new_channel
        });
    }

    function uniqueToken() {
        var s4 = function () {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    openDefaultSocket();
    return {
        initSession: function () {
            isbroadcaster = true;
            isAcceptNewSession = false;
            startBroadcasting();
        },
        joinSession: function (_config) {
            _config = _config || {};

            session = _config.session;
            direction = _config.direction;

            if (_config.sessionid) self.sessionid = _config.sessionid;
            isAcceptNewSession = false;

            openSubSocket({
                channel: self.id
            });

            defaultSocket.send({
                participant: true,
                userid: self.id,
                targetUser: _config.userid
            });
        },
        send: function (message) {
            var _channels = RTCDataChannels,
                data, length = _channels.length;
            if (!length) return;

            if (moz && message.file) data = message.file;
            else data = JSON.stringify(message);

            for (var i = 0; i < length; i++)
                _channels[i].send(data);
        },
        getSession: function () {
            return {
                userid: self.id,
                sessionid: self.sessionid,
                session: session,
                direction: direction
            };
        },
        close: function () {
            for (var i = 0; i < RTCPeerConnections.length; i++) {
                RTCPeerConnections[i].close();
            }
        }
    };
}

var FileSender = {
    send: function (config) {
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
                setTimeout(function () {
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
                reader.onload = function (event) {
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
    send: function (config) {
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
                setTimeout(function () {
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
    SaveToDisk: function (fileUrl, fileName) {
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