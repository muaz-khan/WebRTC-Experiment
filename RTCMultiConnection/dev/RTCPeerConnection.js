// RTCPeerConnection.js

var defaults = {};

function setSdpConstraints(config) {
    var sdpConstraints;

    var sdpConstraints_mandatory = {
        OfferToReceiveAudio: !!config.OfferToReceiveAudio,
        OfferToReceiveVideo: !!config.OfferToReceiveVideo
    };

    sdpConstraints = {
        mandatory: sdpConstraints_mandatory,
        optional: [{
            VoiceActivityDetection: false
        }]
    };

    if (!!navigator.mozGetUserMedia && firefoxVersion > 34) {
        sdpConstraints = {
            OfferToReceiveAudio: !!config.OfferToReceiveAudio,
            OfferToReceiveVideo: !!config.OfferToReceiveVideo
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

window.onPluginRTCInitialized = function() {
    MediaStreamTrack = window.PluginRTC.MediaStreamTrack;
    RTCPeerConnection = window.PluginRTC.RTCPeerConnection;
    RTCIceCandidate = window.PluginRTC.RTCIceCandidate;
    RTCSessionDescription = window.PluginRTC.RTCSessionDescription;
}

if (typeof window.PluginRTC !== 'undefined') {
    window.onPluginRTCInitialized();
}

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
        connection.addStream(session, this.userid);
    };

    this.removeStream = function(streamid) {
        connection.removeStream(streamid, this.userid);
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
            peer = new RTCPeerConnection(navigator.onLine ? {
                iceServers: connection.iceServers,
                iceTransportPolicy: connection.iceTransportPolicy || iceTransports,
                // rtcpMuxPolicy: connection.rtcpMuxPolicy || 'negotiate'
            } : null, window.PluginRTC ? null : connection.optionalArgument);
        } catch (e) {
            try {
                peer = new RTCPeerConnection({
                    iceServers: connection.iceServers
                });
            } catch (e) {
                peer = new RTCPeerConnection();
            }
        }

        if (!connection.iceServers.length) {
            peer = new RTCPeerConnection(null, null);
        }
    } else {
        peer = config.peerRef;
    }

    function getLocalStreams() {
        // if-block is temporarily disabled
        if (false && 'getSenders' in peer && typeof peer.getSenders === 'function') {
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
                    streamsToShare: streamsToShare,
                    isFirefoxOffered: isFirefox
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

    var isFirefoxOffered = !isFirefox;
    if (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.isFirefoxOffered) {
        isFirefoxOffered = true;
    }

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

        if (localStream) {
            peer.addStream(localStream);
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

    var remoteStreamAddEvent = 'addstream';
    if ('ontrack' in peer) {
        // temporarily disabled
        // remoteStreamAddEvent = 'track';
    }

    var streamObject;
    peer.addEventListener(remoteStreamAddEvent, function(event) {
        if (!event) return;
        if (event.streams && event.streams.length && !event.stream) {
            if (!streamObject) {
                streamObject = new MediaStream();
                return;
            }

            event.streams.forEach(function(stream) {
                if (stream.getVideoTracks().length) {
                    streamObject.addTrack(stream.getVideoTracks()[0]);
                }
                if (stream.getAudioTracks().length) {
                    streamObject.addTrack(stream.getAudioTracks()[0]);
                }
            });
            event.stream = streamObject;

            if (connection.session.audio && connection.session.video && (!streamObject.getVideoTracks().length || !streamObject.getAudioTracks().length)) {
                return;
            }

            streamObject = null;
        }

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
        }
        event.stream.streamid = event.stream.id;
        if (isFirefox || !event.stream.stop) {
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
        event.stream.streamid = event.stream.id;

        if (allRemoteStreams[event.stream.id]) {
            delete allRemoteStreams[event.stream.id];
        }

        config.onRemoteStreamRemoved(event.stream);
    };

    this.addRemoteCandidate = function(remoteCandidate) {
        peer.addIceCandidate(new RTCIceCandidate(remoteCandidate));
    };

    this.addRemoteSdp = function(remoteSdp, cb) {
        remoteSdp.sdp = connection.processSdp(remoteSdp.sdp);
        peer.setRemoteDescription(new RTCSessionDescription(remoteSdp), cb || function() {}, function(error) {
            if (!!connection.enableLogs) {
                console.error(JSON.stringify(error, null, '\t'), '\n', remoteSdp.type, remoteSdp.sdp);
            }
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

    function createOfferOrAnswer(_method) {
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
                    streamsToShare: streamsToShare,
                    isFirefoxOffered: isFirefox
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
        }, defaults.sdpConstraints);
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
                    stream.stop();
                });
            }
            peer.nativeClose();
        } catch (e) {}

        peer = null;
        self.peer = null;
    };

    this.peer = peer;
}
