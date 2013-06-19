/*
     2013, @muazkh - github.com/muaz-khan
     MIT License - https://webrtc-experiment.appspot.com/licence/
     Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection
*/

window.moz = !! navigator.mozGetUserMedia;
var RTCPeerConnection = function (options) {
    var w = window,
        PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
        SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription;

    isDataChannel = !! options.onChannelMessage;

    STUN = {
        url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
    };

    TURN = {
        url: 'turn:webrtc%40live.com@numb.viagenie.ca',
        credential: 'muazkh'
    };

    iceServers = {
        iceServers: options.iceServers || [STUN]
    };

    if (!moz && !options.iceServers) {
        if (parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) >= 28)
            TURN = {
                url: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            };

        // No STUN to make sure it works all the time!
        iceServers.iceServers = [TURN];
    }

    optional = {
        optional: []
    };

    if (!moz) {
        optional.optional = [{
            DtlsSrtpKeyAgreement: true
        }];

        if (isDataChannel)
            optional.optional = [{
                RtpDataChannels: true
            }];
    }

    var peerConnection = new PeerConnection(iceServers, optional);

    openOffererChannel();

    peerConnection.onicecandidate = function (event) {
        if (!event.candidate) returnSDP();
        else console.debug('injecting ice in sdp:', event.candidate);
    };

    if (options.attachStream)
        peerConnection.addStream(options.attachStream);

    peerConnection.onaddstream = onaddstream;

    function onaddstream(event) {
        console.debug('on:add:stream:', event.stream);
        if (options.onRemoteStream) options.onRemoteStream(event.stream);
    }

    peerConnection.ongatheringchange = function (event) {
        if (event.currentTarget && event.currentTarget.iceGatheringState === 'complete') returnSDP();
    };

    function returnSDP() {
        console.debug('sharing localDescription', peerConnection.localDescription);

        if (options.onOfferSDP) options.onOfferSDP(peerConnection.localDescription);
        else options.onAnswerSDP(peerConnection.localDescription);
    }

    constraints = options.constraints || {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    if (!moz && isDataChannel && !options.attachStream) constraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    };

    function createOffer() {
        if (!options.onOfferSDP) return;

        peerConnection.createOffer(function (sessionDescription) {
            sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
            peerConnection.setLocalDescription(sessionDescription);
            if (moz) options.onOfferSDP(sessionDescription);
        }, null, constraints);
    }

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        peerConnection.setRemoteDescription(new SessionDescription(options.offerSDP));
        peerConnection.createAnswer(function (sessionDescription) {
            sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
            peerConnection.setLocalDescription(sessionDescription);
            if (moz) options.onAnswerSDP(sessionDescription);
        }, null, constraints);
    }

    function setBandwidth(sdp) {
        // Firefox has no support of "b=AS"
        if (moz) return sdp;

        // remove existing bandwidth lines
        sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');

        sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:50\r\n');
        sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:256\r\n');
        sdp = sdp.replace(/a=mid:data\r\n/g, 'a=mid:data\r\nb=AS:1638400\r\n');

        return sdp;
    }

    if ((isDataChannel && !moz) || !isDataChannel) {
        createOffer();
        createAnswer();
    }

    var channel;

    function openOffererChannel() {
        if (!isDataChannel || (moz && !options.onOfferSDP)) return;

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
            if (isDataChannel) options.onChannelMessage(event);
        };

        channel.onopen = function () {
            if (options.onChannelOpened) options.onChannelOpened(channel);
        };
        channel.onclose = function (event) {
            if (options.onChannelClosed) options.onChannelClosed(event);

            console.warn('WebRTC DataChannel closed', event);
        };
        channel.onerror = function (event) {
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

    return {
        addAnswerSDP: function (sdp) {
            peerConnection.setRemoteDescription(new SessionDescription(sdp));
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
