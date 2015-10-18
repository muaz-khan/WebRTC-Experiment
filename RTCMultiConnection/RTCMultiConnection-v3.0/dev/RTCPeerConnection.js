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

var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
var MediaStreamTrack = window.MediaStreamTrack;

var Plugin = {};

function onPluginRTCInitialized(pluginRTCObject) {
    Plugin = pluginRTCObject;
    MediaStreamTrack = Plugin.MediaStreamTrack;
    RTCPeerConnection = Plugin.RTCPeerConnection;
    RTCIceCandidate = Plugin.RTCIceCandidate;
    RTCSessionDescription = Plugin.RTCSessionDescription;
}
if (typeof PluginRTC !== 'undefined') onPluginRTCInitialized(PluginRTC);

var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
var isIE = !!document.documentMode;
var isPluginRTC = isSafari || isIE;

function PeerInitiator(config) {
    this.extra = config.remoteSdp ? config.remoteSdp.extra : config.rtcMultiConnection.extra;
    this.remoteUserId = config.remoteUserId;
    this.streams = [];
    this.channels = [];
    this.connectionDescription = config.connectionDescription;

    var that = this;

    if (config.remoteSdp) {
        this.connectionDescription = config.remoteSdp.connectionDescription;
    }

    var allRemoteStreams = {};

    if (Object.observe) {
        var that = this;
        Object.observe(this.channels, function(changes) {
            changes.forEach(function(change) {
                if (change.type === 'add') {
                    change.object[change.name].addEventListener('close', function() {
                        delete that.channels[that.channels.indexOf(change.object[change.name])];
                        that.channels = removeNullEntries(that.channels);
                    }, false);
                }
                if (change.type === 'remove' || change.type === 'delete') {
                    if (that.channels.indexOf(change.object[change.name]) !== -1) {
                        delete that.channels.indexOf(change.object[change.name]);
                    }
                }

                that.channels = removeNullEntries(that.channels);
            });
        });
    }

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
    config.localStreams.forEach(function(stream) {
        if (!!stream) localStreams.push(stream);
    });

    if (!renegotiatingPeer) {
        peer = new RTCPeerConnection(navigator.onLine ? {
            iceServers: config.iceServers,
            iceTransports: 'all'
        } : null, config.optionalArgument);
    } else {
        peer = config.peerRef;

        peer.getLocalStreams().forEach(function(stream) {
            localStreams.forEach(function(localStream, index) {
                if (stream == localStream) {
                    delete localStreams[index];
                }
            });

            config.removeStreams.forEach(function(streamToRemove, index) {
                if (stream === streamToRemove) {
                    if (!!peer.removeStream) {
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

    peer.onicecandidate = function(event) {
        if (!event.candidate) return;
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

        // dontAttachLocalStream
        if (config.dontAttachLocalStream) {
            return;
        }

        peer.addStream(localStream);
    });

    peer.oniceconnectionstatechange = peer.onsignalingstatechange = function() {
        config.onPeerStateChanged({
            iceConnectionState: peer.iceConnectionState,
            iceGatheringState: peer.iceGatheringState,
            signalingState: peer.signalingState
        });

        if (peer.iceConnectionState.search(/disconnected|closed/gi) !== -1) {
            if (peer.firedOnce) return;
            peer.firedOnce = true;

            for (var id in allRemoteStreams) {
                config.onRemoteStreamRemoved(allRemoteStreams[id]);
            }
            allRemoteStreams = {};

            if (that.connectionDescription && config.rtcMultiConnection.userid == that.connectionDescription.sender && !!config.rtcMultiConnection.autoReDialOnFailure) {
                setTimeout(function() {
                    config.rtcMultiConnection.rejoin(that.connectionDescription);
                }, 2000);
            }
        }
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
                fireEvent(event.stream, 'ended', event);
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
        peer.setRemoteDescription(new RTCSessionDescription(remoteSdp), function() {}, function(error) {
            console.error(JSON.stringify(error, null, '\t'));
        });
    };

    var isOfferer = true;

    if (config.remoteSdp) {
        isOfferer = false;
    }

    if (config.enableDataChannels === true) {
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

        peer.channel = channel;
    }

    if (config.session.audio == 'two-way' || config.session.video == 'two-way' || config.session.screen == 'two-way') {
        defaults.sdpConstraints = setSdpConstraints({
            OfferToReceiveAudio: config.session.audio == 'two-way' || (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.OfferToReceiveAudio),
            OfferToReceiveVideo: config.session.video == 'two-way' || config.session.screen == 'two-way' || (config.remoteSdp && config.remoteSdp.remotePeerSdpConstraints && config.remoteSdp.remotePeerSdpConstraints.OfferToReceiveAudio)
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
        localSdp.sdp = config.processSdp(localSdp.sdp);
        peer.setLocalDescription(localSdp);
        config.onLocalSdp({
            type: localSdp.type,
            sdp: localSdp.sdp,
            remotePeerSdpConstraints: config.remotePeerSdpConstraints || false,
            renegotiatingPeer: !!config.renegotiatingPeer || false,
            connectionDescription: that.connectionDescription,
            dontGetRemoteStream: !!config.dontGetRemoteStream,
            extra: config.rtcMultiConnection ? config.rtcMultiConnection.extra : {},
            streamsToShare: streamsToShare
        });
    }, function(error) {
        console.error('sdp-error', error);
    }, defaults.sdpConstraints);

    peer.nativeClose = peer.close;
    peer.close = function() {
        if (peer && peer.signalingState !== 'closed') {
            peer.nativeClose();
        }
    };

    this.peer = peer;
}
