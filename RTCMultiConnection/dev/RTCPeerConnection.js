// RTCPeerConnection.js

var defaults = {};

function setSdpConstraints(config) {
    var sdpConstraints = {
        OfferToReceiveAudio: !!config.OfferToReceiveAudio,
        OfferToReceiveVideo: !!config.OfferToReceiveVideo
    };

    var oldBrowser = !window.enableAdapter;

    if (DetectRTC.browser.name === 'Chrome' && DetectRTC.browser.version >= 60) {
        // oldBrowser = false;
    }

    if (DetectRTC.browser.name === 'Firefox' && DetectRTC.browser.version >= 54) {
        oldBrowser = false;
    }

    if (oldBrowser) {
        sdpConstraints = {
            mandatory: sdpConstraints,
            optional: [{
                VoiceActivityDetection: false
            }]
        };
    }

    return sdpConstraints;
}

var RTCPeerConnection;
if (typeof window.RTCPeerConnection !== 'undefined') {
    RTCPeerConnection = window.RTCPeerConnection;
} else if (typeof mozRTCPeerConnection !== 'undefined') {
    RTCPeerConnection = mozRTCPeerConnection;
} else if (typeof webkitRTCPeerConnection !== 'undefined') {
    RTCPeerConnection = webkitRTCPeerConnection;
}

var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
var MediaStreamTrack = window.MediaStreamTrack;

function PeerInitiator(config) {
    if (typeof window.RTCPeerConnection !== 'undefined') {
        RTCPeerConnection = window.RTCPeerConnection;
    } else if (typeof mozRTCPeerConnection !== 'undefined') {
        RTCPeerConnection = mozRTCPeerConnection;
    } else if (typeof webkitRTCPeerConnection !== 'undefined') {
        RTCPeerConnection = webkitRTCPeerConnection;
    }

    RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
    RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
    MediaStreamTrack = window.MediaStreamTrack;

    if (!RTCPeerConnection) {
        throw 'WebRTC 1.0 (RTCPeerConnection) API are NOT available in this browser.';
    }

    var connection = config.rtcMultiConnection;

    this.extra = config.remoteSdp ? config.remoteSdp.extra : connection.extra;
    this.userid = config.userid;
    this.streams = [];
    this.channels = config.channels || [];
    this.connectionDescription = config.connectionDescription;

    this.addStream = function(session) {
        connection.addStream(session, self.userid);
    };

    this.removeStream = function(streamid) {
        connection.removeStream(streamid, self.userid);
    };

    var self = this;

    if (config.remoteSdp) {
        this.connectionDescription = config.remoteSdp.connectionDescription;
    }

    var allRemoteStreams = {};

    defaults.sdpConstraints = setSdpConstraints({
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    });

    var peer;

    var renegotiatingPeer = !!config.renegotiatingPeer;
    if (config.remoteSdp) {
        renegotiatingPeer = !!config.remoteSdp.renegotiatingPeer;
    }

    var localStreams = [];
    connection.attachStreams.forEach(function(stream) {
        if (!!stream) {
            localStreams.push(stream);
        }
    });

    if (!renegotiatingPeer) {
        var iceTransports = 'all';
        if (connection.candidates.turn || connection.candidates.relay) {
            if (!connection.candidates.stun && !connection.candidates.reflexive && !connection.candidates.host) {
                iceTransports = 'relay';
            }
        }

        try {
            var params = {};

            if (DetectRTC.browser.name !== 'Chrome') {
                params.iceServers = connection.iceServers;
            }

            if (DetectRTC.browser.name === 'Chrome') {
                params = {
                    iceServers: connection.iceServers,
                    iceTransportPolicy: connection.iceTransportPolicy || iceTransports,
                    // rtcpMuxPolicy: connection.rtcpMuxPolicy || 'require', // or negotiate
                    bundlePolicy: 'max-bundle',
                    iceCandidatePoolSize: connection.iceCandidatePoolSize || 0
                };
            }

            if (!connection.iceServers.length) {
                params = null;
                connection.optionalArgument = null;
            }

            peer = new RTCPeerConnection(params, connection.optionalArgument);
        } catch (e) {
            try {
                var params = {
                    iceServers: connection.iceServers
                };

                peer = new RTCPeerConnection(params);
            } catch (e) {
                peer = new RTCPeerConnection();
            }
        }
    } else {
        peer = config.peerRef;
    }

    function getLocalStreams() {
        // if-block is temporarily disabled
        if (typeof window.InstallTrigger !== 'undefined' && 'getSenders' in peer && typeof peer.getSenders === 'function') {
            var streamObject2 = new MediaStream();
            peer.getSenders().forEach(function(sender) {
                streamObject2.addTrack(sender.track);
            });
            return streamObject2;
        }

        return peer.getLocalStreams();
    }

    peer.onicecandidate = function(event) {
        if (!event.candidate) {
            if (!connection.trickleIce) {
                var localSdp = peer.localDescription;
                config.onLocalSdp({
                    type: localSdp.type,
                    sdp: localSdp.sdp,
                    remotePeerSdpConstraints: config.remotePeerSdpConstraints || false,
                    renegotiatingPeer: !!config.renegotiatingPeer || false,
                    connectionDescription: self.connectionDescription,
                    dontGetRemoteStream: !!config.dontGetRemoteStream,
                    extra: connection ? connection.extra : {},
                    streamsToShare: streamsToShare
                });
            }
            return;
        }

        if (!connection.trickleIce) return;
        config.onLocalCandidate({
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex
        });
    };

    localStreams.forEach(function(localStream) {
        if (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.dontGetRemoteStream) {
            return;
        }

        if (config.dontAttachLocalStream) {
            return;
        }

        localStream = connection.beforeAddingStream(localStream, self);

        if (!localStream) return;

        if (getLocalStreams().forEach) {
            getLocalStreams().forEach(function(stream) {
                if (localStream && stream.id == localStream.id) {
                    localStream = null;
                }
            });
        }

        if (localStream && typeof peer.addTrack === 'function') {
            localStream.getTracks().forEach(function(track) {
                peer.addTrack(track, localStream);
            });
        } else if (localStream && typeof peer.addStream === 'function') {
            peer.addStream(localStream);
        } else {
            try {
                peer.addStream(localStream);
            } catch (e) {
                localStream && localStream.getTracks().forEach(function(track) {
                    peer.addTrack(track, localStream);
                });
            }
        }
    });

    peer.oniceconnectionstatechange = peer.onsignalingstatechange = function() {
        var extra = self.extra;
        if (connection.peers[self.userid]) {
            extra = connection.peers[self.userid].extra || extra;
        }

        if (!peer) {
            return;
        }

        config.onPeerStateChanged({
            iceConnectionState: peer.iceConnectionState,
            iceGatheringState: peer.iceGatheringState,
            signalingState: peer.signalingState,
            extra: extra,
            userid: self.userid
        });

        if (peer && peer.iceConnectionState && peer.iceConnectionState.search(/closed|failed/gi) !== -1 && self.streams instanceof Array) {
            self.streams.forEach(function(stream) {
                var streamEvent = connection.streamEvents[stream.id] || {
                    streamid: stream.id,
                    stream: stream,
                    type: 'remote'
                };

                connection.onstreamended(streamEvent);
            });
        }
    };

    var sdpConstraints = {
        OfferToReceiveAudio: !!localStreams.length,
        OfferToReceiveVideo: !!localStreams.length
    };

    if (config.localPeerSdpConstraints) sdpConstraints = config.localPeerSdpConstraints;

    defaults.sdpConstraints = setSdpConstraints(sdpConstraints);

    var streamObject;
    var dontDuplicate = {};

    var incomingStreamEvent = 'track';

    if (!window.enableAdapter) {
        incomingStreamEvent = 'addstream';
    }

    peer.addEventListener(incomingStreamEvent, function(event) {
        if (!event) return;

        if (incomingStreamEvent === 'track') {
            event.stream = event.streams[event.streams.length - 1];
        }

        if (dontDuplicate[event.stream.id]) return;
        dontDuplicate[event.stream.id] = event.stream.id;

        var streamsToShare = {};
        if (config.remoteSdp && config.remoteSdp.streamsToShare) {
            streamsToShare = config.remoteSdp.streamsToShare;
        } else if (config.streamsToShare) {
            streamsToShare = config.streamsToShare;
        }

        var streamToShare = streamsToShare[event.stream.id];
        if (streamToShare) {
            event.stream.isAudio = streamToShare.isAudio;
            event.stream.isVideo = streamToShare.isVideo;
            event.stream.isScreen = streamToShare.isScreen;
        } else {
            event.stream.isVideo = !!event.stream.getVideoTracks().length;
            event.stream.isAudio = !event.stream.isVideo;
            event.stream.isScreen = false;
        }

        event.stream.streamid = event.stream.id;
        if (DetectRTC.browser.name == 'Firefox' || !event.stream.stop) {
            event.stream.stop = function() {
                var streamEndedEvent = 'ended';

                if ('oninactive' in event.stream) {
                    streamEndedEvent = 'inactive';
                }
                fireEvent(event.stream, streamEndedEvent);
            };
        }
        allRemoteStreams[event.stream.id] = event.stream;
        config.onRemoteStream(event.stream);
    }, false);

    peer.onremovestream = function(event) {
        // this event doesn't works anymore
        event.stream.streamid = event.stream.id;

        if (allRemoteStreams[event.stream.id]) {
            delete allRemoteStreams[event.stream.id];
        }

        config.onRemoteStreamRemoved(event.stream);
    };

    this.addRemoteCandidate = function(remoteCandidate) {
        peer.addIceCandidate(new RTCIceCandidate(remoteCandidate));
    };

    function oldAddRemoteSdp(remoteSdp, cb) {
        cb = cb || function() {};

        remoteSdp.sdp = connection.processSdp(remoteSdp.sdp);
        peer.setRemoteDescription(new RTCSessionDescription(remoteSdp), cb, function(error) {
            if (!!connection.enableLogs) {
                console.error('setRemoteDescription failed', '\n', error, '\n', remoteSdp.sdp);
            }

            cb();
        });
    }

    this.addRemoteSdp = function(remoteSdp, cb) {
        cb = cb || function() {};

        if (!window.enableAdapter) {
            return oldAddRemoteSdp(remoteSdp, cb);
        }

        remoteSdp.sdp = connection.processSdp(remoteSdp.sdp);
        peer.setRemoteDescription(new RTCSessionDescription(remoteSdp)).then(cb, function(error) {
            if (!!connection.enableLogs) {
                console.error('setRemoteDescription failed', '\n', error, '\n', remoteSdp.sdp);
            }

            cb();
        });
    };

    var isOfferer = true;

    if (config.remoteSdp) {
        isOfferer = false;
    }

    this.createDataChannel = function() {
        var channel = peer.createDataChannel('sctp', {});
        setChannelEvents(channel);
    };

    if (connection.session.data === true && !renegotiatingPeer) {
        if (!isOfferer) {
            peer.ondatachannel = function(event) {
                var channel = event.channel;
                setChannelEvents(channel);
            };
        } else {
            this.createDataChannel();
        }
    }

    if (config.remoteSdp) {
        if (config.remoteSdp.remotePeerSdpConstraints) {
            sdpConstraints = config.remoteSdp.remotePeerSdpConstraints;
        }
        defaults.sdpConstraints = setSdpConstraints(sdpConstraints);
        this.addRemoteSdp(config.remoteSdp, function() {
            createOfferOrAnswer('createAnswer');
        });
    }

    function setChannelEvents(channel) {
        // force ArrayBuffer in Firefox; which uses "Blob" by default.
        channel.binaryType = 'arraybuffer';

        channel.onmessage = function(event) {
            config.onDataChannelMessage(event.data);
        };

        channel.onopen = function() {
            config.onDataChannelOpened(channel);
        };

        channel.onerror = function(error) {
            config.onDataChannelError(error);
        };

        channel.onclose = function(event) {
            config.onDataChannelClosed(event);
        };

        channel.internalSend = channel.send;
        channel.send = function(data) {
            if (channel.readyState !== 'open') {
                return;
            }

            channel.internalSend(data);
        };

        peer.channel = channel;
    }

    if (connection.session.audio == 'two-way' || connection.session.video == 'two-way' || connection.session.screen == 'two-way') {
        defaults.sdpConstraints = setSdpConstraints({
            OfferToReceiveAudio: connection.session.audio == 'two-way' || (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.OfferToReceiveAudio),
            OfferToReceiveVideo: connection.session.video == 'two-way' || connection.session.screen == 'two-way' || (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.OfferToReceiveAudio)
        });
    }

    var streamsToShare = {};
    if (getLocalStreams().forEach) {
        getLocalStreams().forEach(function(stream) {
            streamsToShare[stream.streamid] = {
                isAudio: !!stream.isAudio,
                isVideo: !!stream.isVideo,
                isScreen: !!stream.isScreen
            };
        });
    }

    function oldCreateOfferOrAnswer(_method) {
        peer[_method](function(localSdp) {
            localSdp.sdp = connection.processSdp(localSdp.sdp);
            peer.setLocalDescription(localSdp, function() {
                if (!connection.trickleIce) return;

                config.onLocalSdp({
                    type: localSdp.type,
                    sdp: localSdp.sdp,
                    remotePeerSdpConstraints: config.remotePeerSdpConstraints || false,
                    renegotiatingPeer: !!config.renegotiatingPeer || false,
                    connectionDescription: self.connectionDescription,
                    dontGetRemoteStream: !!config.dontGetRemoteStream,
                    extra: connection ? connection.extra : {},
                    streamsToShare: streamsToShare
                });

                connection.onSettingLocalDescription(self);
            }, function(error) {
                if (!!connection.enableLogs) {
                    console.error('setLocalDescription-error', error);
                }
            });
        }, function(error) {
            if (!!connection.enableLogs) {
                console.error('sdp-' + _method + '-error', error);
            }
        }, defaults.sdpConstraints);
    }

    function createOfferOrAnswer(_method) {
        if (!window.enableAdapter) {
            return oldCreateOfferOrAnswer(_method);
        }

        peer[_method](defaults.sdpConstraints).then(function(localSdp) {
            localSdp.sdp = connection.processSdp(localSdp.sdp);
            peer.setLocalDescription(localSdp).then(function() {
                if (!connection.trickleIce) return;

                config.onLocalSdp({
                    type: localSdp.type,
                    sdp: localSdp.sdp,
                    remotePeerSdpConstraints: config.remotePeerSdpConstraints || false,
                    renegotiatingPeer: !!config.renegotiatingPeer || false,
                    connectionDescription: self.connectionDescription,
                    dontGetRemoteStream: !!config.dontGetRemoteStream,
                    extra: connection ? connection.extra : {},
                    streamsToShare: streamsToShare
                });

                connection.onSettingLocalDescription(self);
            }, function(error) {
                if (!connection.enableLogs) return;
                console.error('setLocalDescription error', error);
            });
        }, function(error) {
            if (!!connection.enableLogs) {
                console.error('sdp-error', error);
            }
        });
    }

    if (isOfferer) {
        createOfferOrAnswer('createOffer');
    }

    peer.nativeClose = peer.close;
    peer.close = function() {
        if (!peer) {
            return;
        }

        try {
            if (peer.iceConnectionState.search(/closed|failed/gi) === -1) {
                peer.getRemoteStreams().forEach(function(stream) {
                    var streamEndedEvent = 'ended';

                    if ('oninactive' in stream) {
                        streamEndedEvent = 'inactive';
                    }

                    fireEvent(stream, streamEndedEvent);
                });
            }
            peer.nativeClose();
        } catch (e) {}

        peer = null;
        self.peer = null;
    };

    this.peer = peer;
}
