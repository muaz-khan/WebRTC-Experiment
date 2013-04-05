/*  MIT License: https://webrtc-experiment.appspot.com/licence/ 
    2013, Muaz Khan<muazkh>--[github.com/muaz-khan] 
    
    Demo & Documentation: http://bit.ly/RTCPeerConnection-Documentation */

var RTCPeerConnection = function(options) {
    var w = window,
        PeerConnection = w.webkitRTCPeerConnection,
        SessionDescription = w.RTCSessionDescription,
        IceCandidate = w.RTCIceCandidate;

    var iceServers = {
        iceServers: [{
            url: 'stun:stun.l.google.com:19302'
        }]
    };

    var optional = {
        optional: [{
            DtlsSrtpKeyAgreement: true
        }]
    };

    var peerConnection = new PeerConnection(iceServers, optional);

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

    function createOffer() {
        if (!options.onOfferSDP) return;

        peerConnection.createOffer(function(sessionDescription) {
            sessionDescription.sdp = getInteropSDP(sessionDescription.sdp);
            peerConnection.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);
        }, null, constraints);
    }

    createOffer();

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        options.offerSDP = new SessionDescription(options.offerSDP);
        peerConnection.setRemoteDescription(options.offerSDP);

        peerConnection.createAnswer(function(sessionDescription) {
            sessionDescription.sdp = getInteropSDP(sessionDescription.sdp);
            peerConnection.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);
        }, null, constraints);
    }

    createAnswer();

    function info(information) {
        console.log(information);
    }

    return {
        addAnswerSDP: function(sdp) {
            info('--------adding answer sdp:');
            info(sdp.sdp);

            sdp = new SessionDescription(sdp);
            peerConnection.setRemoteDescription(sdp);
        },
        addICE: function(candidate) {
            info(candidate.candidate);
            peerConnection.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };
};