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
if (typeof mozRTCPeerConnection !== 'undefined') {
    RTCPeerConnection = mozRTCPeerConnection;
} else if (typeof webkitRTCPeerConnection !== 'undefined') {
    RTCPeerConnection = webkitRTCPeerConnection;
} else if (typeof window.RTCPeerConnection !== 'undefined') {
    RTCPeerConnection = window.RTCPeerConnection;
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
    if (!RTCPeerConnection) {
        throw 'WebRTC 1.0 (RTCPeerConnection) API are NOT available in this browser.';
    }

    var connection = config.rtcMultiConnection;

    this.extra = config.remoteSdp ? config.remoteSdp.extra : connection.extra;
    this.userid = config.userid;
    this.streams = [];
    this.channels = [];
    this.connectionDescription = config.connectionDescription;

    var that = this;

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
        if (!!stream) localStreams.push(stream);
    });

    if (!renegotiatingPeer) {
        peer = new RTCPeerConnection(navigator.onLine ? {
            iceServers: connection.iceServers,
            iceTransports: 'all'
        } : null, window.PluginRTC ? null : connection.optionalArgument);
    } else {
        peer = config.peerRef;

        peer.getLocalStreams().forEach(function(stream) {
            localStreams.forEach(function(localStream, index) {
                if (stream == localStream) {
                    delete localStreams[index];
                }
            });

            connection.removeStreams.forEach(function(streamToRemove, index) {
                if (stream === streamToRemove) {
                    stream = connection.beforeRemovingStream(stream);
                    if (stream && !!peer.removeStream) {
                        peer.removeStream(stream);
                    }

                    localStreams.forEach(function(localStream, index) {
                        if (streamToRemove == localStream) {
                            delete localStreams[index];
                        }
                    });
                }
            });
        });
    }

    if (connection.DetectRTC.browser.name === 'Firefox') {
        peer.removeStream = function(stream) {
            stream.mute();
            connection.StreamsHandler.onSyncNeeded(stream.streamid, 'stream-removed');
        };
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
                    connectionDescription: that.connectionDescription,
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

        localStream = connection.beforeAddingStream(localStream);
        if (localStream) {
            peer.addStream(localStream);
        }
    });

    peer.oniceconnectionstatechange = peer.onsignalingstatechange = function() {
        var extra = that.extra;
        if (connection.peers[that.userid]) {
            extra = connection.peers[that.userid].extra || extra;
        }

        if (!peer) {
            return;
        }

        config.onPeerStateChanged({
            iceConnectionState: peer.iceConnectionState,
            iceGatheringState: peer.iceGatheringState,
            signalingState: peer.signalingState,
            extra: extra,
            userid: that.userid
        });
    };

    var sdpConstraints = {
        OfferToReceiveAudio: !!localStreams.length,
        OfferToReceiveVideo: !!localStreams.length
    };

    if (config.localPeerSdpConstraints) sdpConstraints = config.localPeerSdpConstraints;

    defaults.sdpConstraints = setSdpConstraints(sdpConstraints);

    peer.onaddstream = function(event) {
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
        if (!event.stream.stop) {
            event.stream.stop = function() {
                if (isFirefox) {
                    fireEvent(this, 'ended');
                }
            };
        }
        allRemoteStreams[event.stream.id] = event.stream;
        config.onRemoteStream(event.stream);
    };

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

    this.addRemoteSdp = function(remoteSdp) {
        remoteSdp.sdp = connection.processSdp(remoteSdp.sdp);
        peer.setRemoteDescription(new RTCSessionDescription(remoteSdp), function() {}, function(error) {
            if (!!connection.enableLogs) {
                console.error(JSON.stringify(error, null, '\t'), '\n', remoteSdp.type, remoteSdp.sdp);
            }
        });
    };

    var isOfferer = true;

    if (config.remoteSdp) {
        isOfferer = false;
    }

    if (connection.session.data === true) {
        createDataChannel();
    }

    if (config.remoteSdp) {
        if (config.remoteSdp.remotePeerSdpConstraints) {
            sdpConstraints = config.remoteSdp.remotePeerSdpConstraints;
        }
        defaults.sdpConstraints = setSdpConstraints(sdpConstraints);
        this.addRemoteSdp(config.remoteSdp);
    }

    function createDataChannel() {
        if (!isOfferer) {
            peer.ondatachannel = function(event) {
                var channel = event.channel;
                setChannelEvents(channel);
            };
            return;
        }

        var channel = peer.createDataChannel('RTCDataChannel', {});
        setChannelEvents(channel);
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
    peer.getLocalStreams().forEach(function(stream) {
        streamsToShare[stream.streamid] = {
            isAudio: !!stream.isAudio,
            isVideo: !!stream.isVideo,
            isScreen: !!stream.isScreen
        };
    });

    peer[isOfferer ? 'createOffer' : 'createAnswer'](function(localSdp) {
        localSdp.sdp = connection.processSdp(localSdp.sdp);
        peer.setLocalDescription(localSdp);

        if (!connection.trickleIce) return;
        config.onLocalSdp({
            type: localSdp.type,
            sdp: localSdp.sdp,
            remotePeerSdpConstraints: config.remotePeerSdpConstraints || false,
            renegotiatingPeer: !!config.renegotiatingPeer || false,
            connectionDescription: that.connectionDescription,
            dontGetRemoteStream: !!config.dontGetRemoteStream,
            extra: connection ? connection.extra : {},
            streamsToShare: streamsToShare,
            isFirefoxOffered: isFirefox
        });
    }, function(error) {
        if (!!connection.enableLogs) {
            console.error('sdp-error', error);
        }
    }, defaults.sdpConstraints);

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
        that.peer = null;
    };

    this.peer = peer;
}
