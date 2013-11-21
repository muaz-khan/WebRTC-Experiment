/* MIT License: https://webrtc-experiment.appspot.com/licence/ */

window.moz = !!navigator.mozGetUserMedia;
var RTCPeerConnection = function (options) {
    var w = window,
        PeerConnection = w.webkitRTCPeerConnection || w.mozRTCPeerConnection,
        SessionDescription = w.RTCSessionDescription,
        IceCandidate = w.RTCIceCandidate || w.mozRTCIceCandidate;

    var STUN = { iceServers: [{ url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'}] },
        TURN = { iceServers: [{ url: "turn:webrtc%40live.com@numb.viagenie.ca", credential: "muazkh"}] };

    var constraints = options.constraints || { mandatory: { OfferToReceiveAudio: true, OfferToReceiveVideo: true} },
        optional = options.onChannelMessage ? options.optional || { optional: [{ RtpDataChannels: true}]} : {};

    var peerConnection = new PeerConnection(location.search.indexOf('turn=true') !== -1 ? TURN : STUN, optional);

    openOffererChannel();

    if (!moz) peerConnection.onicecandidate = onicecandidate;

    if (options.attachStream) {
        peerConnection.onaddstream = onaddstream;
        peerConnection.addStream(options.attachStream);
    }

    function onicecandidate(event) {
        if (!event.candidate || !peerConnection) return;
        if (options.onICE) options.onICE(event.candidate);
    }

    function onaddstream(event) {
        event && options.onRemoteStream && options.onRemoteStream(event.stream);
    }

    function createOffer() {
        if (!options.onOfferSDP) return;

        peerConnection.createOffer(function (sessionDescription) {
            peerConnection.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);
        }, null, constraints);
    }

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        if (!moz) options.offerSDP = new SessionDescription(options.offerSDP);
        peerConnection.setRemoteDescription(options.offerSDP);

        peerConnection.createAnswer(function (sessionDescription) {
            peerConnection.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);

            setTimeout(function () {
                moz && peerConnection.connectDataConnection(5001, 5000);
            }, 300);
        }, null, constraints);
    }

    if ((options.onChannelMessage && !moz) || !options.onChannelMessage) {
        createOffer();
        createAnswer();
    }

    var channel;
    function openOffererChannel() {
        if (!options.onChannelMessage || (moz && !options.onOfferSDP)) return;

        if (!moz) _openOffererChannel();
        else peerConnection.onconnection = _openOffererChannel;

        if (moz && !options.attachStream) {
            navigator.mozGetUserMedia({ audio: true, fake: true }, function (stream) {
                peerConnection.addStream(stream);
                createOffer();
            }, useless);
        }
    }
    
    function _openOffererChannel() {
        channel = peerConnection.createDataChannel(options.channel || 'RTCDataChannel', moz ? {} : { reliable: false });
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

    if (options.onAnswerSDP && moz && options.onChannelMessage) openAnswererChannel();

    function openAnswererChannel() {
        peerConnection.ondatachannel = function (_channel) {
            channel = _channel;
            channel.binaryType = 'blob';
            setChannelEvents();
        };

        if (moz && !options.attachStream) {
            navigator.mozGetUserMedia({ audio: true, fake: true }, function (stream) {
                peerConnection.addStream(stream);
                createAnswer();
            }, useless);
        }
    }

    function useless() { }

    return {
        addAnswerSDP: function (sdp) {
            if (!moz) sdp = new SessionDescription(sdp);
            peerConnection.setRemoteDescription(sdp, function () {
                moz && peerConnection.connectDataConnection(5000, 5001);
            });
        },
        addICE: function (candidate) {
            !moz && peerConnection.addIceCandidate(new IceCandidate({
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

var video_constraints = true;
if (location.search.indexOf('hd=true') !== -1)
    video_constraints = {
        'mandatory': {
            minHeight: 720,
            minWidth: 1280,
            maxAspectRatio: 1.778,
            minAspectRatio: 1.777
        },
        'optional': []
    };

function getUserMedia(options) {
    var n = navigator;
    n.capturer = n.webkitGetUserMedia || n.mozGetUserMedia;
    n.capturer(options.constraints || { audio: true, video: video_constraints },
        function (stream) {
            var video = options.video;
            if (video) {
                video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : webkitURL.createObjectURL(stream);
                video.play();
            }
            options.onsuccess && options.onsuccess(stream);

            return stream;
        }, options.onerror);
}