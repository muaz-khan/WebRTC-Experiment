// Muaz Khan     - github.com/muaz-khan
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection

window.moz = !!navigator.mozGetUserMedia;

function RTCPeerConnection(options) {
    var w = window,
        PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
        SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
        IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

    var iceServers = [];

    if (!moz && parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]) >= 28) {
        iceServers.push({
            url: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'
        });
    }

    iceServers.push({ url: 'stun:23.21.150.121:3478' }, { url: 'stun:216.93.246.18:3478' }, { url: 'stun:66.228.45.110:3478' }, { url: 'stun:173.194.78.127:19302' });
    iceServers.push({ url: 'stun:74.125.142.127:19302' }, { url: 'stun:provserver.televolution.net' }, { url: 'stun:sip1.lakedestiny.cordiaip.com' }, { url: 'stun:stun1.voiceeclipse.net' }, { url: 'stun:stun01.sipphone.com' }, { url: 'stun:stun.callwithus.com' }, { url: 'stun:stun.counterpath.net' }, { url: 'stun:stun.endigovoip.com' });

    if (options.iceServers) iceServers = options.iceServers;

    iceServers = {
        iceServers: iceServers
    };

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

    var peer = new PeerConnection(iceServers, optional);

    openOffererChannel();

    peer.onicecandidate = function(event) {
        if (event.candidate)
            options.onICE(event.candidate);
    };

    // attachStream = MediaStream;
    if (options.attachStream) peer.addStream(options.attachStream);

    // attachStreams[0] = audio-stream;
    // attachStreams[1] = video-stream;
    // attachStreams[2] = screen-capturing-stream;
    if (options.attachStreams && options.attachStream.length) {
        var streams = options.attachStreams;
        for (var i = 0; i < streams.length; i++) {
            peer.addStream(streams[i]);
        }
    }

    peer.onaddstream = function(event) {
        var remoteMediaStream = event.stream;

        // onRemoteStreamEnded(MediaStream)
        remoteMediaStream.onended = function() {
            if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
        };

        // onRemoteStream(MediaStream)
        if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

        console.debug('on:add:stream', remoteMediaStream);
    };

    var constraints = options.constraints || {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    // onOfferSDP(RTCSessionDescription)

    function createOffer() {
        if (!options.onOfferSDP) return;

        peer.createOffer(function(sessionDescription) {
            peer.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);
        }, onSdpError, constraints);
    }

    // onAnswerSDP(RTCSessionDescription)

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        //options.offerSDP.sdp = addStereo(options.offerSDP.sdp);
        peer.setRemoteDescription(new SessionDescription(options.offerSDP), onSdpSuccess, onSdpError);
        peer.createAnswer(function(sessionDescription) {
            peer.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);
        }, onSdpError, constraints);
    }

    // if Mozilla Firefox & DataChannel; offer/answer will be created later
    if ((options.onChannelMessage && !moz) || !options.onChannelMessage) {
        createOffer();
        createAnswer();
    }

    // DataChannel management
    var channel;

    function openOffererChannel() {
        if (!options.onChannelMessage || (moz && !options.onOfferSDP))
            return;

        _openOffererChannel();

        if (!moz) return;
        navigator.mozGetUserMedia({
                audio: true,
                fake: true
            }, function(stream) {
                peer.addStream(stream);
                createOffer();
            }, useless);
    }

    function _openOffererChannel() {
        channel = peer.createDataChannel(options.channel || 'RTCDataChannel', moz ? { } : {
            reliable: false
        });

        if (moz) channel.binaryType = 'blob';

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

    if (options.onAnswerSDP && moz && options.onChannelMessage)
        openAnswererChannel();

    function openAnswererChannel() {
        peer.ondatachannel = function(event) {
            channel = event.channel;
            channel.binaryType = 'blob';
            setChannelEvents();
        };

        if (!moz) return;
        navigator.mozGetUserMedia({
                audio: true,
                fake: true
            }, function(stream) {
                peer.addStream(stream);
                createAnswer();
            }, useless);
    }

    // fake:true is also available on chrome under a flag!

    function useless() {
        log('Error in fake:true');
    }

    function onSdpSuccess() {
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
            peer.setRemoteDescription(new SessionDescription(sdp), onSdpSuccess, onSdpError);
        },
        addICE: function(candidate) {
            peer.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
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
