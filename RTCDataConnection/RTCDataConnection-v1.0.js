/*  MIT License: https://webrtc-experiment.appspot.com/licence/ 
	2013, Muaz Khan<muazkh>--[ github.com/muaz-khan ]
	
	For documentation and examples: http://bit.ly/RTCDataConnection */
function RTCDataConnection(configuration) {
    var config = {
        openSocket: configuration.openSignalingChannel,
        onRoomFound: function (room) {
            if (configuration.onNewConnection)
                configuration.onNewConnection({
                    id: room.broadcaster,
                    session: room.roomToken
                });
            else
                ConnectorUI.joinRoom({
                    roomToken: room.roomToken,
                    joinUser: room.broadcaster
                });
        },
        onChannelOpened: function (channel) {
            console.debug('WebRTC Data Connection Opened.');
            if (configuration.onopen) configuration.onopen(channel);
        },
        onChannelMessage: function (data) {
            if (!data.size) data = JSON.parse(data);

            if (data.type === 'text')
                textReceiver.receive(data, configuration.onmessage);
            else if (data.size || data.type === 'file')
                fileReceiver.receive(data, config);
            else if (configuration.onmessage)
                configuration.onmessage(data);
        },
        direction: configuration.direction || 'many-to-many',
        onChannelClosed: function (e) {
            if (configuration.onclose) configuration.onclose(e);
        },
        onChannelError: function (e) {
            if (configuration.onerror) configuration.onerror(e);
        },
        onFileReceived: function (fileName) {
            console.debug('File <' + fileName + '> received successfully.');
            if (configuration.onFileReceived) configuration.onFileReceived(fileName);
        },
        getFileStats: function (data) {
            console.log(data.items + ' items remaining.');
            if (configuration.getFileStats) configuration.getFileStats(data);
        }
    };

    var ConnectorUI = new Connector(config),
        fileReceiver = new FileReceiver(),
        textReceiver = new TextReceiver();

    function joinUser(user) {
        if (!user || !user.id || !user.session) throw 'invalid data passed.';
        ConnectorUI.joinRoom({
            roomToken: user.session,
            joinUser: user.id
        });
    }

    return {
        initDataConnection: function () {
            ConnectorUI.createRoom();
        },
        connect: joinUser,
        send: function (data) {
			if (!data) throw 'No file, data or text message to share.';
            if (data.size) FileSender.send({
                    file: data,
                    channel: ConnectorUI,
                    onFileSent: configuration.onFileSent
                });
            else 
                TextSender.send({
                    text: data,
                    channel: ConnectorUI
                });
        }
    };
}

window.moz = !! navigator.mozGetUserMedia;

/* RTCPeerConnection is a wrapper for RTCWeb APIs */
function RTCPeerConnection(options) {
    var w = window,
        PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
        SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
        IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

    var STUN = {
        iceServers: [{
                url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
            }
        ]
    },
        TURN = {
            iceServers: [{
                    url: 'turn:webrtc%40live.com@numb.viagenie.ca',
                    credential: 'muazkh'
                }
            ]
        };

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

    var peerConnection = new PeerConnection(location.search.indexOf('turn=true') !== -1 ? TURN : STUN, optional);

    var dataPorts = getPorts();
    openOffererChannel();

    peerConnection.onicecandidate = onicecandidate;

    function onicecandidate(event) {
        if (!event.candidate || !peerConnection) return;
        if (options.onICE) options.onICE(event.candidate);
    }

    var constraints = options.constraints || {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: !! moz,
            OfferToReceiveVideo: !! moz
        }
    };

    function createOffer() {
        if (!options.onOfferSDP) return;

        peerConnection.createOffer(function (sessionDescription) {
            peerConnection.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);
        }, null, constraints);
    }

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        options.offerSDP = new SessionDescription(options.offerSDP);
        peerConnection.setRemoteDescription(options.offerSDP);

        peerConnection.createAnswer(function (sessionDescription) {
            peerConnection.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);

            /* signaling method MUST be faster; otherwise increase "300" */
            moz && options.onChannelMessage && setTimeout(function () {
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
        if (!options.onChannelMessage || (moz && !options.onOfferSDP)) return;

        if (!moz) _openOffererChannel();
        else peerConnection.onconnection = _openOffererChannel;

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
        setChannelEvents();
    }

    function setChannelEvents() {
        channel.onmessage = function (event) {
            if (options.onChannelMessage) options.onChannelMessage(event);
        };

        channel.onopen = function () {
            if (options.onChannelOpened) options.onChannelOpened(channel);
        };
        channel.onclose = function (event) {
            if (options.onChannelClosed) options.onChannelClosed(event);
        };
        channel.onerror = function (event) {
            console.error(event);
            if (options.onChannelError) options.onChannelError(event);
        };
    }

    if (options.onAnswerSDP && moz) openAnswererChannel();

    function openAnswererChannel() {
        peerConnection.ondatachannel = function (_channel) {
            channel = _channel;
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

    function useless() {}

    function getPorts(ports) {
        if (!moz || !options.onChannelMessage) return false;
        ports = ports || options.dataPorts || [5000, 5001];
        console.log('--------using data ports: ', ports[0], ' and ', ports[1]);
        return ports;
    }

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

    return {
        addAnswerSDP: function (sdp, _dataPorts) {
            sdp = new SessionDescription(sdp);
            peerConnection.setRemoteDescription(sdp, function () {
                if (moz && options.onChannelMessage) {
                    var ports = getPorts(_dataPorts);
                    peerConnection.connectDataConnection(ports[1], ports[0]);
                }
            });
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
        }
    };
}

function Connector(config) {
    var self = {
        userToken: uniqueToken(),
        userName: 'Anonymous'
    },
        channels = '--',
        isbroadcaster,
        isGetNewRoom = true,
        defaultSocket = {}, RTCDataChannels = [];

    function openDefaultSocket() {
        defaultSocket = config.openSocket({
            onmessage: onDefaultSocketResponse
        });
    }

    function onDefaultSocketResponse(response) {
        if (response.userToken == self.userToken) return;

        if (isGetNewRoom && response.roomToken && response.broadcaster) config.onRoomFound(response);

        if (response.newParticipant) onNewParticipant(response.newParticipant);

        if (response.userToken && response.joinUser == self.userToken && response.participant && channels.indexOf(response.userToken) == -1) {
            channels += response.userToken + '--';
            openSubSocket({
                isofferer: true,
                channel: response.channel || response.userToken,
                closeSocket: true
            });
        }
    }

    function getPort() {
        return Math.random() * 1000 << 10;
    }

    function openSubSocket(_config) {
        if (!_config.channel) return;
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse,
            onopen: function () {
                if (isofferer && !peer) initPeer();
            }
        };

        var socket = config.openSocket(socketConfig),
            isofferer = _config.isofferer,
            gotstream,
            inner = {},
            dataPorts = [getPort(), getPort()],
            peer;

        var peerConfig = {
            onICE: function (candidate) {
                socket.send({
                    userToken: self.userToken,
                    candidate: {
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        candidate: JSON.stringify(candidate.candidate)
                    }
                });
            },
            onChannelOpened: onChannelOpened,
            onChannelMessage: function (event) {
                if(config.onChannelMessage) config.onChannelMessage(event.data);
            }
        };

        function initPeer(offerSDP) {
            if (!offerSDP) {
                peerConfig.onOfferSDP = sendsdp;
            } else {
                peerConfig.offerSDP = offerSDP;
                peerConfig.onAnswerSDP = sendsdp;
                peerConfig.dataPorts = dataPorts;
            }

            peer = RTCPeerConnection(peerConfig);
        }

        function onChannelOpened(channel) {
            RTCDataChannels[RTCDataChannels.length] = channel;
            if (config.onChannelOpened) config.onChannelOpened(channel);

            if (config.direction === 'many-to-many' && isbroadcaster && channels.split('--').length > 3) {
                /* broadcasting newly connected participant for video-conferencing! */
                defaultSocket.send({
                    newParticipant: socket.channel,
                    userToken: self.userToken
                });
            }

            /* closing subsocket here on the offerer side */
            if (_config.closeSocket) socket = null;

            window.isFirstConnectionOpened = gotstream = true;
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
                userToken: self.userToken,
                firstPart: firstPart,

                /* sending RTCDataChannel ports alongwith sdp */
                dataPorts: dataPorts
            });

            socket.send({
                userToken: self.userToken,
                secondPart: secondPart
            });

            socket.send({
                userToken: self.userToken,
                thirdPart: thirdPart
            });
        }

        function socketResponse(response) {
            if (response.userToken == self.userToken) return;

            if (response.firstPart || response.secondPart || response.thirdPart) {
                if (response.dataPorts) inner.dataPorts = response.dataPorts;
                if (response.firstPart) {
                    inner.firstPart = response.firstPart;
                    if (inner.secondPart && inner.thirdPart) selfInvoker();
                }
                if (response.secondPart) {
                    inner.secondPart = response.secondPart;
                    if (inner.firstPart && inner.thirdPart) selfInvoker();
                }

                if (response.thirdPart) {
                    inner.thirdPart = response.thirdPart;
                    if (inner.firstPart && inner.secondPart) selfInvoker();
                }
            }

            if (response.candidate && !gotstream) {
                peer && peer.addICE({
                    sdpMLineIndex: response.candidate.sdpMLineIndex,
                    candidate: JSON.parse(response.candidate.candidate)
                });
            }
        }

        var invokedOnce = false;

        function selfInvoker() {
            if (invokedOnce) return;

            invokedOnce = true;

            inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);

            /* using random data ports to support wide connection on firefox! */
            if (isofferer) peer.addAnswerSDP(inner.sdp, inner.dataPorts);
            else initPeer(inner.sdp);
        }
    }

    function startBroadcasting() {
        defaultSocket.send({
            roomToken: self.roomToken,
            broadcaster: self.userToken
        });

        if (config.direction === 'one-to-one') {
            if (!window.isFirstConnectionOpened) setTimeout(startBroadcasting, 3000);
        } else setTimeout(startBroadcasting, 3000);
    }

    function onNewParticipant(channel) {
        if (!channel || channels.indexOf(channel) != -1 || channel == self.userToken) return;
        channels += channel + '--';

        var new_channel = uniqueToken();
        openSubSocket({
            channel: new_channel,
            closeSocket: true
        });

        defaultSocket.send({
            participant: true,
            userToken: self.userToken,
            joinUser: channel,
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
        createRoom: function (_config) {
            self.roomToken = uniqueToken();

            isbroadcaster = true;
            isGetNewRoom = false;
            startBroadcasting();
        },
        joinRoom: function (_config) {
            self.roomToken = _config.roomToken;
            isGetNewRoom = false;

            openSubSocket({
                channel: self.userToken
            });

            defaultSocket.send({
                participant: true,
                userToken: self.userToken,
                joinUser: _config.joinUser
            });
        },
        send: function (message) {
            var channels = RTCDataChannels,
                data, length = channels.length;
            if (!length) return;

            if (moz && message.file) data = message.file;
            else data = JSON.stringify(message);

            for (var i = 0; i < length; i++)
                channels[i].send(data);
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

            /* sending entire file at once */
            channel.send({
                file: file
            });

            if (config.onFileSent) config.onFileSent(file);
        }

        /* if chrome */
        if (!moz) {
            var reader = new window.FileReader();
            reader.readAsDataURL(file);
            reader.onload = onReadAsDataURL;
        }

        var packetSize = 1000,
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
			
			if (config.getFileStats)
                config.getFileStats({
                    remaining: packets--,
                    length: numberOfPackets,
                    sent: numberOfPackets - packets
                });

            if (text.length > packetSize) data.message = text.slice(0, packetSize);
            else {
                data.message = text;
                data.last = true;
                data.name = file.name;

                if (config.onFileSent) config.onFileSent(file);
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
            if (data.fileName) fileName = data.fileName;
            if (data.size) {
                var reader = new window.FileReader();
                reader.readAsDataURL(data);
                reader.onload = function (event) {
                    FileSaver.SaveToDisk(event.target.result, fileName);
                    if (config.onFileReceived) config.onFileReceived(fileName);
                };
            }
        }

        if (!moz) {
            if (data.packets) numberOfPackets = packets = parseInt(data.packets);

			if (config.getFileStats)
                config.getFileStats({
                    remaining: packets--,
                    length: numberOfPackets,
                    received: numberOfPackets - packets
                });

            content.push(data.message);

            if (data.last) {
                FileSaver.SaveToDisk(content.join(''), data.name);
                if (config.onFileReceived) config.onFileReceived(data.name);
                content = [];
            }
        }
    }

    return {
        receive: receive
    };
}

var FileSaver = {
    SaveToDisk: function (fileUrl, fileName) {
        var save = document.createElement("a");
        save.href = fileUrl;
        save.target = "_blank";
        save.download = fileName || fileUrl;

        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

        save.dispatchEvent(evt);

        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    }
};

var TextSender = {
    send: function (config) {
        var channel = config.channel,
            initialText = config.text
            packetSize = 1000 /* chars */ ,
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