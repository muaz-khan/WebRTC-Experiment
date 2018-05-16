// Last updated On: May 15, 2018
// Muaz Khan     - github.com/muaz-khan
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection
var dontDuplicateOnAddTrack = {};
var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);

function RTCPeerConnection5(options) {
    // reusable stuff
    var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
    var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

    var iceServers = [];

    if (typeof IceServersHandler !== 'undefined') {
        iceServers = IceServersHandler.getIceServers();
    }

    var rtcConfiguration = {
        iceServers: iceServers,
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        iceCandidatePoolSize: 0,
        sdpSemantics: 'plan-b' // 'unified-plan'
    };

    if (adapter.browserDetails.browser !== 'chrome') {
        rtcConfiguration = {
            iceServers: iceServers
        };
    }

    console.debug('rtc-configuration', JSON.stringify(rtcConfiguration, null, '\t'));

    var peer = new RTCPeerConnection(rtcConfiguration);

    openOffererChannel();

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
            var strem = streams[i];
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
            peer.remoteMediaStream = event.stream;

            // onRemoteStream(MediaStream)
            if (options.onRemoteStream) options.onRemoteStream(peer.remoteMediaStream);

            console.debug('on:add:stream', peer.remoteMediaStream);
        };
    } else if ('addTrack' in peer) {
        peer.onaddtrack = function(event) {
            event.stream = event.streams.pop();

            if (dontDuplicateOnAddTrack[event.stream.id] && adapter.browserDetails.browser !== 'safari') return;
            dontDuplicateOnAddTrack[event.stream.id] = true;

            peer.remoteMediaStream = event.stream;

            // onRemoteStream(MediaStream)
            if (options.onRemoteStream) options.onRemoteStream(peer.remoteMediaStream);

            console.debug('on:add:stream', peer.remoteMediaStream);
        };
    } else {
        throw new Error('WebRTC addStream/addTrack is not supported.');
    }

    peer.oniceconnectionstatechange = peer.onsignalingstatechange = function() {
        if (peer && peer.iceConnectionState && peer.iceConnectionState.search(/disconnected|closed|failed/gi) !== -1) {
            if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(peer.remoteMediaStream);
        }
    };

    var constraints = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };

    if (adapter.browserDetails.browser === 'chrome' || adapter.browserDetails.browser === 'safari') {
        constraints = {
            mandatory: constraints,
            optional: []
        };
    }

    console.debug('sdp-constraints', JSON.stringify(constraints, null, '\t'));

    // onOfferSDP(RTCSessionDescription)

    function createOffer() {
        if (!options.onOfferSDP) return;

        peer.createOffer(constraints).then(function(sessionDescription) {
            if (typeof CodecsHandler !== 'undefined') {
                // sessionDescription.sdp = CodecsHandler.preferCodec(sessionDescription.sdp, 'vp9');
            }

            peer.setLocalDescription(sessionDescription).then(function() {
                options.onOfferSDP(sessionDescription);
                console.debug('offer-sdp', sessionDescription.sdp);
            }).catch(onSdpError);
        }).catch(onSdpError);
    }

    // onAnswerSDP(RTCSessionDescription)

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        //options.offerSDP.sdp = addStereo(options.offerSDP.sdp);
        console.debug('offer-sdp', options.offerSDP.sdp);
        peer.setRemoteDescription(new RTCSessionDescription(options.offerSDP)).then(function() {
            peer.createAnswer(constraints).then(function(sessionDescription) {
                if (typeof CodecsHandler !== 'undefined') {
                    // sessionDescription.sdp = CodecsHandler.preferCodec(sessionDescription.sdp, 'vp9');
                }

                peer.setLocalDescription(sessionDescription).then(function() {
                    options.onAnswerSDP(sessionDescription);
                    console.debug('answer-sdp', sessionDescription.sdp);
                }).catch(onSdpError);
            }).catch(onSdpError);
        }).catch(onSdpError);
    }

    // if Mozilla Firefox & DataChannel; offer/answer will be created later
    if ((options.onChannelMessage && adapter.browserDetails.browser !== 'firefox') || !options.onChannelMessage) {
        createOffer();
        createAnswer();
    }

    // DataChannel management
    var channel;

    function openOffererChannel() {
        if (!options.onChannelMessage)
            return;

        _openOffererChannel();
    }

    function _openOffererChannel() {
        // protocol: 'text/chat', preset: true, stream: 16
        // maxRetransmits:0 && ordered:false
        var dataChannelDict = {};
        channel = peer.createDataChannel(options.channel || 'sctp-channel', dataChannelDict);
        setChannelEvents();
    }

    function setChannelEvents() {
        channel.onmessage = function(event) {
            if (options.onChannelMessage) options.onChannelMessage(event);
        };

        channel.onopen = function() {
            if (options.onChannelOpened) options.onChannelOpened(channel);
        };
        channel.onclose = function(event) {
            if (options.onChannelClosed) options.onChannelClosed(event);

            console.warn('WebRTC DataChannel closed', event);
        };
        channel.onerror = function(event) {
            if (options.onChannelError) options.onChannelError(event);

            console.error('WebRTC DataChannel error', event);
        };
    }

    if (options.onAnswerSDP && options.onChannelMessage) {
        openAnswererChannel();
    }

    function openAnswererChannel() {
        peer.ondatachannel = function(event) {
            channel = event.channel;
            setChannelEvents();
        };
    }

    function onSdpError(e) {
        var message = JSON.stringify(e, null, '\t');

        if (message.indexOf('RTP/SAVPF Expects at least 4 fields') != -1) {
            message = 'It seems that you are trying to interop RTP-datachannels with SCTP. It is not supported!';
        }

        console.error('onSdpError:', message);
    }

    return {
        addAnswerSDP: function(sdp) {
            console.debug('adding answer-sdp', sdp.sdp);
            peer.setRemoteDescription(new RTCSessionDescription(sdp)).catch(onSdpError);
        },
        addICE: function(candidate) {
            peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));

            console.debug('adding-ice', candidate.candidate);
        },

        peer: peer,
        channel: channel,
        sendData: function(message) {
            channel && channel.send(message);
        }
    };
}

// getUserMedia
var video_constraints = {
    mandatory: {},
    optional: []
};

function getUserMedia(options) {
    function streaming(stream) {
        var video = options.video;
        if (video) {
            video.srcObject = stream;
        }
        options.onsuccess && options.onsuccess(stream);
        media = stream;
    }

    if (!!navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(options.constraints || {
            audio: true,
            video: true
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
