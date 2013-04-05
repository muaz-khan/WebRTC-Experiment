/*  MIT License: https://webrtc-experiment.appspot.com/licence/ 
   2013, Muaz Khan<muazkh>--[github.com/muaz-khan]
   
   For documentation and examples: http://bit.ly/RTCMultiConnection */
function RTCMultiConnection(configuration) {
    configuration = configuration || {};
    var config = {
        openSignalingChannel: configuration.openSignalingChannel,
        onNewSession: function(session) {
            config.session = session.session;
            config.direction = session.direction;

            if (configuration.onNewSession)
                configuration.onNewSession(session);
            else {
                if (configuration.joinedASession) return;
                configuration.joinedASession = true;

                if (session.direction === Direction.OneWay || session.session === Session.Data)
                    joinSession(session);
                else
                    captureUserMedia(function() {
                        joinSession(session);
                    });
            }
        },
        onChannelOpened: function(channel) {
            if (configuration.onopen)
                configuration.onopen(channel);
        },
        onChannelMessage: function(data) {
            if (!data.size) data = JSON.parse(data);

            if (data.type === 'text')
                textReceiver.receive(data, configuration.onmessage);
            else if (data.size || data.type === 'file')
                fileReceiver.receive(data, config);
            else if (configuration.onmessage)
                configuration.onmessage(data);
        },
        direction: configuration.direction || Direction.ManyToMany,
        session: configuration.session || Session.AudioVideo,
        onChannelClosed: function(e) {
            if (configuration.onclose)
                configuration.onclose(e);
        },
        onChannelError: function(e) {
            if (configuration.onerror)
                configuration.onerror(e);
        },
        onFileReceived: function(fileName) {
            if (configuration.onFileReceived)
                configuration.onFileReceived(fileName);
        },
        onFileProgress: function(packets) {
            if (configuration.onFileProgress)
                configuration.onFileProgress(packets);
        },
        iceServers: configuration.iceServers,
        attachStream: configuration.attachStream
    };
    if (!configuration.openSignalingChannel)
        throw 'openSignalingChannel is mandatory.';

    if (configuration.onRemoteStream)
        config.onRemoteStream = configuration.onRemoteStream;

    var rtcSession = new RTCMultiSession(config),
        fileReceiver = new FileReceiver(),
        textReceiver = new TextReceiver();

    function joinSession(session) {
        if (!session || !session.userid || !session.sessionid)
            throw 'invalid data passed.';

        rtcSession.joinSession(session);
    }

    function captureUserMedia(callback) {
        var constraints, session = config.session;

        if (session === Session.Data || config.attachStream)
            return callback();

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
            onsuccess: function(stream) {
                config.attachStream = stream;
                callback && callback();

                if (configuration.onLocalStream)
                    configuration.onLocalStream({
                        stream: stream,
                        mediaElement: mediaElement,
                        blobURL: mediaElement.mozSrcObject || mediaElement.src
                    });
            },
            onerror: function() {
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

    return {
        initSession: function(options) {
            options = options || {};
            captureUserMedia(function() {
                rtcSession.initSession({
                    direction: configuration.direction,
                    session: configuration.session,
                    sessionid: options.sessionid,
                    userid: options.userid
                });
                if (options.callback) options.callback(rtcSession.getSession());
            });
        },
        connectSession: function(session) {
            if (configuration.joinedASession)
                return;
            configuration.joinedASession = true;

            if (session.direction === Direction.OneWay)
                joinSession(session);
            else
                captureUserMedia(function() {
                    joinSession(session);
                });
        },
        send: function(data) {
            if (!data) throw 'No file, data or text message to share.';
            if (data.size)
                FileSender.send({
                    file: data,
                    channel: rtcSession,
                    onFileSent: configuration.onFileSent,
                    onFileProgress: configuration.onFileProgress
                });
            else
                TextSender.send({
                    text: data,
                    channel: rtcSession
                });
        }
    };
}

var Session = {
    AudioVideoData: 'AudioVideoData',
    AudioVideo: 'AudioVideo',
    AudioData: 'AudioData',
    VideoData: 'VideoData',
    Audio: 'Audio',
    Video: 'Video',
    Data: 'Data',
    ScreenData: 'ScreenData',
    Screen: 'Screen'
};

var Direction = {
    OneWay: 'OneWay',
    OneToOne: 'OneToOne',
    OneToMany: 'OneToMany',
    ManyToMany: 'ManyToMany'
};

String.prototype.isAudio = function() {
    var session = this + '';
    return session === Session.Audio || session === Session.AudioData;
};

String.prototype.isScreen = function() {
    var session = this + '';
    return session === Session.Screen || session === Session.ScreenData;
};

/* RTCPeerConnection object is a wrapper for RTCWeb APIs */
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
            }
        ];
        if (options.onChannelMessage)
            optional.optional = [{
                    RtpDataChannels: true
                }
            ];
    }

    var peerConnection = new PeerConnection(iceServers, optional);

    var dataPorts = getPorts();
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

        peerConnection.createOffer(function(sessionDescription) {
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

        peerConnection.createAnswer(function(sessionDescription) {
            sessionDescription.sdp = getInteropSDP(sessionDescription.sdp);
            peerConnection.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);

            /* signaling method MUST be faster; otherwise increase "300" */
            moz && options.onChannelMessage && setTimeout(function() {
                peerConnection.connectDataConnection(dataPorts[0], dataPorts[1]);
            }, 300);
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

        if (!moz)
            _openOffererChannel();
        else
            peerConnection.onconnection = _openOffererChannel;

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
            moz ? {} : {
                reliable: false
            });
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

    if (options.onAnswerSDP && moz)
        openAnswererChannel();

    function openAnswererChannel() {
        peerConnection.ondatachannel = function(_channel) {
            channel = _channel;
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

    function getPorts(ports) {
        if (!moz || !options.onChannelMessage)
            return false;
        ports = ports || options.dataPorts || [5000, 5001];
        return ports;
    }

    return {
        addAnswerSDP: function(sdp, _dataPorts) {
            sdp = new SessionDescription(sdp);
            peerConnection.setRemoteDescription(sdp, function() {
                if (moz && options.onChannelMessage) {
                    var ports = getPorts(_dataPorts);
                    peerConnection.connectDataConnection(ports[1], ports[0]);
                }
            });
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
    var session = config.session || '',
        direction = config.direction || '',
        self = {
            id: uniqueToken()
        },
        channels = '--',
        isbroadcaster,
        isAcceptNewSession = true,
        defaultSocket = {}, RTCDataChannels = [];

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

    function getPort() {
        return Math.random() * 1000 << 1000;
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
            }
        };

        var socket = config.openSignalingChannel(socketConfig),
            isofferer = _config.isofferer,
            isGotRemoteStream,
            inner = {},
            dataPorts = [getPort(), getPort()],
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
                mediaElement.play();

                _config.stream = stream;
                if (session.isAudio()) {
                    mediaElement.addEventListener('play', function() {
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
                peerConfig.dataPorts = dataPorts;
            }

            if (session.indexOf('Data') === -1)
                peerConfig.onChannelMessage = null;

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
                    blobURL: mediaElement.mozSrcObject || mediaElement.src
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

            // if (_config.closeSocket && socket) socket = null;
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
                firstPart: firstPart,

                /* sending RTCDataChannel ports alongwith sdp */
                dataPorts: dataPorts
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

            if (response.dataPorts)
                inner.dataPorts = response.dataPorts;

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
                peer.addAnswerSDP(inner.sdp, inner.dataPorts);
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
        var s4 = function() {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    openDefaultSocket();
    return {
        initSession: function(_config) {
            self.sessionid = _config.sessionid || uniqueToken();

            if (_config.session)
                session = _config.session;

            if (_config.direction)
                direction = _config.direction;

            if (_config.userid)
                self.id = _config.userid;

            isbroadcaster = true;
            isAcceptNewSession = false;
            startBroadcasting();
        },
        joinSession: function(_config) {
            self.sessionid = _config.sessionid;

            if (_config.session)
                session = _config.session;
            if (_config.direction)
                direction = _config.direction;

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