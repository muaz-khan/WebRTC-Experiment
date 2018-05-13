// Last updated On: May 13, 2018
// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/WebRTC-Experiment/tree/master/Pluginfree-Screen-Sharing
var isbroadcaster = false;
var conference = function(config) {
    if (typeof adapter === 'undefined' || typeof adapter.browserDetails === 'undefined') {
        // https://webrtc.github.io/adapter/adapter-latest.js
        console.warn('adapter.js is recommended.');
    } else {
        window.adapter = {
            browserDetails: {
                browser: 'chrome'
            }
        };
    }

    var self = {
            userToken: uniqueToken()
        },
        channels = '--',
        isGetNewRoom = true,
        participants = 0,
        defaultSocket = {};

    var sockets = [];

    function openDefaultSocket() {
        defaultSocket = config.openSocket({
            onmessage: defaultSocketResponse,
            callback: function(socket) {
                defaultSocket = socket;
            }
        });
    }

    function defaultSocketResponse(response) {
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

    function openSubSocket(_config) {
        if (!_config.channel) return;
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse,
            onopen: function() {
                if (isofferer && !peer) initPeer();
                sockets[sockets.length] = socket;
            }
        };

        socketConfig.callback = function(_socket) {
            socket = _socket;
            this.onopen();
        };

        var socket = config.openSocket(socketConfig),
            isofferer = _config.isofferer,
            gotstream,
            htmlElement = document.createElement('video'),
            inner = {},
            peer;

        var peerConfig = {
            oniceconnectionstatechange: function(p) {
                if (!isofferer || peer.firedOnce) return;

                // if (p && p.iceConnectionState && p.iceConnectionState.search(/disconnected|closed|failed/gi) !== -1) {
                if (p && p.iceConnectionState && p.iceConnectionState.search(/failed/gi) !== -1) {
                    peer.firedOnce = true;
                    config.oniceconnectionstatechange('failed');
                }

                if (p.iceConnectionState == 'connected' && p.iceGatheringState == 'complete' && p.signalingState == 'stable') {
                    peer.firedOnce = true;
                    config.oniceconnectionstatechange('connected');
                }
            },
            attachStream: config.attachStream,
            onICE: function(candidate) {
                socket && socket.send({
                    userToken: self.userToken,
                    candidate: {
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        candidate: JSON.stringify(candidate.candidate)
                    }
                });
            },
            onRemoteStream: function(stream) {
                if (isbroadcaster) return;

                try {
                    htmlElement.setAttributeNode(document.createAttribute('autoplay'));
                    htmlElement.setAttributeNode(document.createAttribute('playsinline'));
                    htmlElement.setAttributeNode(document.createAttribute('controls'));
                } catch (e) {
                    htmlElement.setAttribute('autoplay', true);
                    htmlElement.setAttribute('playsinline', true);
                    htmlElement.setAttribute('controls', true);
                }

                htmlElement.srcObject = stream;

                _config.stream = stream;
                afterRemoteStreamStartedFlowing();
            }
        };

        function initPeer(offerSDP) {
            if (!offerSDP) peerConfig.onOfferSDP = sendsdp;
            else {
                peerConfig.offerSDP = offerSDP;
                peerConfig.onAnswerSDP = sendsdp;
            }
            peer = RTCPeerConnectionHandler(peerConfig);
        }

        function afterRemoteStreamStartedFlowing() {
            gotstream = true;

            config.onRemoteStream({
                video: htmlElement
            });

            /* closing sub-socket here on the offerer side */
            if (_config.closeSocket) socket = null;
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

            socket && socket.send({
                userToken: self.userToken,
                firstPart: firstPart
            });

            socket && socket.send({
                userToken: self.userToken,
                secondPart: secondPart
            });

            socket && socket.send({
                userToken: self.userToken,
                thirdPart: thirdPart
            });
        }

        function socketResponse(response) {
            if (response.userToken == self.userToken) return;
            if (response.firstPart || response.secondPart || response.thirdPart) {
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

            if (response.left) {
                participants--;
                if (isofferer && config.onNewParticipant) config.onNewParticipant(participants);

                if (peer && peer.peer) {
                    peer.peer.close();
                    peer.peer = null;
                }
            }
        }

        var invokedOnce = false;

        function selfInvoker() {
            if (invokedOnce) return;

            invokedOnce = true;

            inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);
            if (isofferer && inner.sdp.type == 'answer') {
                peer.addAnswerSDP(inner.sdp);
                participants++;
                if (config.onNewParticipant) config.onNewParticipant(participants);
            } else initPeer(inner.sdp);
        }
    }

    function leave() {
        var length = sockets.length;
        for (var i = 0; i < length; i++) {
            var socket = sockets[i];
            if (socket) {
                socket.send({
                    left: true,
                    userToken: self.userToken
                });
                delete sockets[i];
            }
        }

        // if owner leaves; try to remove his room from all other users side
        if (isbroadcaster) {
            defaultSocket.send({
                left: true,
                userToken: self.userToken,
                roomToken: self.roomToken
            });
        }

        if (config.attachStream) config.attachStream.stop();
    }

    window.addEventListener('beforeunload', function() {
        leave();
    }, false);

    window.addEventListener('keyup', function(e) {
        if (e.keyCode == 116)
            leave();
    }, false);

    function startBroadcasting() {
        defaultSocket && defaultSocket.send({
            roomToken: self.roomToken,
            roomName: self.roomName,
            broadcaster: self.userToken
        });
        setTimeout(startBroadcasting, 3000);
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
        return Math.random().toString(36).substr(2, 35);
    }

    openDefaultSocket();
    return {
        createRoom: function(_config) {
            self.roomName = _config.roomName || 'Anonymous';
            self.roomToken = uniqueToken();

            isbroadcaster = true;
            isGetNewRoom = false;
            startBroadcasting();
        },
        joinRoom: function(_config) {
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
        }
    };
};

// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection
// RTCPeerConnection-v1.5.js

var iceServers = [];

if (typeof IceServersHandler !== 'undefined') {
    iceServers = IceServersHandler.getIceServers();
}

iceServers = {
    iceServers: iceServers,
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    iceCandidatePoolSize: 0
};

if (adapter.browserDetails.browser !== 'chrome') {
    iceServers = {
        iceServers: iceServers.iceServers
    };
}

var dontDuplicateOnAddTrack = {};

function RTCPeerConnectionHandler(options) {
    var w = window,
        PeerConnection = w.RTCPeerConnection || w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
        SessionDescription = w.RTCSessionDescription || w.mozRTCSessionDescription,
        IceCandidate = w.RTCIceCandidate || w.mozRTCIceCandidate;

    var peer = new PeerConnection(iceServers);

    peer.onicecandidate = function(event) {
        if (event.candidate)
            options.onICE(event.candidate);
    };

    // attachStream = MediaStream;
    if (options.attachStream) {
        if ('addStream' in peer) {
            peer.addStream(options.attachStream);
        } else if ('addTrack' in peer) {
            options.attachStream.getTracks().forEach(function(track) {
                peer.addTrack(track, options.attachStream);
            });
        } else {
            throw new Error('WebRTC addStream/addTrack is not supported.');
        }
    }

    // attachStreams[0] = audio-stream;
    // attachStreams[1] = video-stream;
    // attachStreams[2] = screen-capturing-stream;
    if (options.attachStreams && options.attachStream.length) {
        var streams = options.attachStreams;
        for (var i = 0; i < streams.length; i++) {
            var stream = streams[i];

            if ('addStream' in peer) {
                peer.addStream(stream);
            } else if ('addTrack' in peer) {
                stream.getTracks().forEach(function(track) {
                    peer.addTrack(track, stream);
                });
            } else {
                throw new Error('WebRTC addStream/addTrack is not supported.');
            }
        }
    }

    if ('addStream' in peer) {
        peer.onaddstream = function(event) {
            var remoteMediaStream = event.stream;

            // onRemoteStreamEnded(MediaStream)
            addStreamStopListener(remoteMediaStream, function() {
                if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
            });

            // onRemoteStream(MediaStream)
            if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

            console.debug('on:add:stream', remoteMediaStream);
        };
    } else if ('addTrack' in peer) {
        peer.onaddtrack = function(event) {
            event.stream = event.streams.pop();

            if (dontDuplicateOnAddTrack[event.stream.id] && adapter.browserDetails.browser !== 'safari') return;
            dontDuplicateOnAddTrack[event.stream.id] = true;


            var remoteMediaStream = event.stream;

            // onRemoteStreamEnded(MediaStream)
            addStreamStopListener(remoteMediaStream, function() {
                if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
            });

            // onRemoteStream(MediaStream)
            if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

            console.debug('on:add:stream', remoteMediaStream);
        };
    } else {
        throw new Error('WebRTC addStream/addTrack is not supported.');
    }

    var sdpConstraints = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };

    if (isbroadcaster) {
        sdpConstraints = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        };
    }

    if (adapter.browserDetails.browser === 'chrome' || adapter.browserDetails.browser === 'safari') {
        sdpConstraints = {
            mandatory: sdpConstraints,
            optional: []
        };
    }

    // onOfferSDP(RTCSessionDescription)

    function createOffer() {
        if (!options.onOfferSDP) return;

        peer.createOffer(sdpConstraints).then(function(sessionDescription) {
            sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
            peer.setLocalDescription(sessionDescription).then(function() {
                options.onOfferSDP(sessionDescription);
            }).catch(onSdpError);
        }).catch(onSdpError);
    }

    // onAnswerSDP(RTCSessionDescription)

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        //options.offerSDP.sdp = addStereo(options.offerSDP.sdp);
        peer.setRemoteDescription(new SessionDescription(options.offerSDP)).then(function() {
            peer.createAnswer(sdpConstraints).then(function(sessionDescription) {
                sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
                peer.setLocalDescription(sessionDescription).then(function() {
                    options.onAnswerSDP(sessionDescription);
                }).catch(onSdpError);
            }).catch(onSdpError);
        }).catch(onSdpError);
    }

    function setBandwidth(sdp) {
        if (adapter.browserDetails.browser === 'firefox') return sdp;
        if (adapter.browserDetails.browser === 'safari') return sdp;
        if (isEdge) return sdp;

        // https://github.com/muaz-khan/RTCMultiConnection/blob/master/dev/CodecsHandler.js
        if (typeof CodecsHandler !== 'undefined') {
            sdp = CodecsHandler.preferCodec(sdp, 'vp9');
        }

        // https://github.com/muaz-khan/RTCMultiConnection/blob/master/dev/BandwidthHandler.js
        if (typeof BandwidthHandler !== 'undefined') {
            window.isFirefox = adapter.browserDetails.browser === 'firefox';

            var bandwidth = {
                screen: 300, // 300kbits minimum
                video: 256 // 256kbits (both min-max)
            };
            var isScreenSharing = false;

            sdp = BandwidthHandler.setApplicationSpecificBandwidth(sdp, bandwidth, isScreenSharing);
            sdp = BandwidthHandler.setVideoBitrates(sdp, {
                min: bandwidth.video,
                max: bandwidth.video
            });
            return sdp;
        }

        // removing existing bandwidth lines
        sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');

        // "300kbit/s" for screen sharing
        sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:300\r\n');

        return sdp;
    }

    peer.oniceconnectionstatechange = function() {
        options.oniceconnectionstatechange(peer);
    };

    createOffer();
    createAnswer();

    function onSdpError(e) {
        console.error('sdp error:', JSON.stringify(e, null, '\t'));
    }

    return {
        addAnswerSDP: function(sdp) {
            console.log('setting remote description', sdp.sdp);
            peer.setRemoteDescription(new SessionDescription(sdp)).catch(onSdpError);
        },
        addICE: function(candidate) {
            console.log('adding candidate', candidate.candidate);

            peer.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        },

        peer: peer
    };
}

var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);

// getUserMedia
var video_constraints = {
    mandatory: {},
    optional: []
};

function getUserMedia(options) {
    function streaming(stream) {
        if (typeof options.onsuccess === 'function') {
            options.onsuccess(stream);
        }

        media = stream;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(options.constraints || {
            audio: false,
            video: video_constraints
        }).then(streaming).catch(options.onerror || function(e) {
            console.error(e);
        });
        return;
    }

    var n = navigator,
        media;
    n.getMedia = n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia;
    n.getMedia(options.constraints || {
        audio: true,
        video: video_constraints
    }, streaming, options.onerror || function(e) {
        console.error(e);
    });

    return media;
}

function addStreamStopListener(stream, callback) {
    var streamEndedEvent = 'ended';
    if ('oninactive' in stream) {
        streamEndedEvent = 'inactive';
    }
    stream.addEventListener(streamEndedEvent, function() {
        callback();
        callback = function() {};
    }, false);
    stream.getAudioTracks().forEach(function(track) {
        track.addEventListener(streamEndedEvent, function() {
            callback();
            callback = function() {};
        }, false);
    });
    stream.getVideoTracks().forEach(function(track) {
        track.addEventListener(streamEndedEvent, function() {
            callback();
            callback = function() {};
        }, false);
    });
}
