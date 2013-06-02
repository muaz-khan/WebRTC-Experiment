/*  MIT License: https://webrtc-experiment.appspot.com/licence/ 
 2013, Muaz Khan<muazkh>--[github.com/muaz-khan]

 Demo & Documentation: http://bit.ly/RTCPeerConnection-Documentation */

window.moz = !!navigator.mozGetUserMedia;
var RTCPeerConnection = function (options) {
    var w = window,
        PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
        SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
        IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

    STUN = {
        url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
    };

    TURN1 = {
        url: 'turn:73922577-1368147610@108.59.80.54',
        credential: 'b3f7d809d443a34b715945977907f80a'
    };

    TURN2 = {
        url: 'turn:webrtc%40live.com@numb.viagenie.ca',
        credential: 'muazkh'
    };

    iceServers = {
        iceServers: options.iceServers || [STUN]
    };

    if (!moz && !options.iceServers) {
        iceServers.iceServers[1] = TURN1;
        iceServers.iceServers[2] = TURN2;
    }

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
    if (options.attachStream) peerConnection.addStream(options.attachStream);
    peerConnection.onaddstream = onaddstream;

    function onicecandidate(event) {
        if (!event.candidate || !peerConnection) return;
        if (options.onICE) options.onICE(event.candidate);
    }

    var remoteStreamEventFired = false;

    function onaddstream(event) {
        info('------------onaddstream');
        if (remoteStreamEventFired || !event || !options.onRemoteStream) return;
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
        if (extractedChars.length < 40) getChars();

        return extractedChars;
    }

    function getInteropSDP(sdp) {
        // for audio-only streaming: multiple-crypto lines are not allowed
        if (options.onAnswerSDP)
            sdp = sdp.replace(/(a=crypto:0 AES_CM_128_HMAC_SHA1_32)(.*?)(\r\n)/g, '');


        var inline = getChars() + '\r\n' + (extractedChars = '');
        sdp = sdp.indexOf('a=crypto') == -1 ? sdp.replace(/c=IN/g,
            'a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:' + inline +
                'c=IN') : sdp;

        if (options.offerSDP) {
            info('\n--------offer sdp provided by offerer\n');
            info(options.offerSDP.sdp);
        }

        info(options.onOfferSDP ? '\n--------offer\n' : '\n--------answer\n');
        info('sdp: ' + sdp);

        return sdp;
    }

    if (moz && !options.onChannelMessage) constraints.mandatory.MozDontOfferDataChannel = true;

    function createOffer() {
        if (!options.onOfferSDP) return;

        peerConnection.createOffer(function (sessionDescription) {
            sessionDescription.sdp = getInteropSDP(sessionDescription.sdp);
            peerConnection.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);
        }, null, constraints);
    }

    function createAnswer() {
        if (!options.onAnswerSDP) return;

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
        if (!options.onChannelMessage || (moz && !options.onOfferSDP)) return;

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

    function useless() {
    }

    function info(information) {
        console.log(information);
    }

    return {
        addAnswerSDP: function (sdp) {
            info('--------adding answer sdp:');
            info(sdp.sdp);

            sdp = new SessionDescription(sdp);
            peerConnection.setRemoteDescription(sdp);
        },
        addICE: function (candidate) {
            info(candidate.candidate);
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
};

var video_constraints = {
    mandatory: {},
    optional: []
};

function getUserMedia(options) {
    var n = navigator, media;
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