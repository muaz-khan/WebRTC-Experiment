window.PeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
window.SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
window.IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;

window.defaults = {
    iceServers: { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] },
    constraints: { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } },
    optional: { optional: [{ RtpDataChannels: true}] }
};

var RTCPeerConnection = function (options) {

    var iceServers = options.iceServers || defaults.iceServers;
    var constraints = options.constraints || defaults.constraints;
    var optional = options.optional || defaults.optional;

    var moz = !!navigator.mozGetUserMedia;

    var peerConnection = new PeerConnection(iceServers, optional);

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

            /* opus? use it dear! */
            !moz && options.isopus && (sessionDescription = codecs.opus(sessionDescription));

            peerConnection.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);
        }, null, constraints);
    }

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        if (!moz) options.offerSDP = new SessionDescription(options.offerSDP);
        peerConnection.setRemoteDescription(options.offerSDP);
        peerConnection.createAnswer(function (sessionDescription) {
            /* opus? use it dear! */
            !moz && options.isopus && (sessionDescription = codecs.opus(sessionDescription));

            peerConnection.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);

            setTimeout(function () {
                moz && peerConnection.connectDataConnection(5001, 5000);
            }, 300);
        }, null, constraints);
    }

	if((options.onChannelMessage && !moz) || !options.onChannelMessage)
	{
		createOffer();
		createAnswer();
	}

    var channel;
    function openOffererChannel() {
        if (!options.onChannelMessage || (moz && !options.onOfferSDP)) return;

        if (!peerConnection || typeof peerConnection.createDataChannel == 'undefined') {
            if (options.onChannelMessage) {
                var error = 'RTCDataChannel is not enabled. Use Chrome Canary and enable this flag via chrome://flags';
                console.error(error);
                alert(error);
                window.messenger && window.messenger.deliver(error + '<br /><br /> <strong>Location:</strong> ' + location.href + '<br /><br /> <strong>UserAgen: ( ' + (navigator.vendor || 'Mozilla Firefox') + ' ) </strong> ' + navigator.userAgent);
            }
            return;
        }

        if (!moz) _openOffererChannel();
        else peerConnection.onconnection = _openOffererChannel;

        if (moz && !options.attachStream) {
            navigator.mozGetUserMedia({ audio: true, fake: true }, function (stream) {
                peerConnection.addStream(stream);
                createOffer();
            }, function () { });
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
            console.log('RTCDataChannel opened.');
            if (options.onChannelOpened) options.onChannelOpened(channel);
        };
        channel.onclose = function (event) {
            console.log('RTCDataChannel closed.');
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
            navigator.mozGetUserMedia({ audio: true, fake: true }, function (stream) {
                peerConnection.addStream(stream);
                createAnswer();
            }, function () {});
        }
    }

    return {
        /* offerer got answer sdp; MUST pass sdp over this function */
        addAnswerSDP: function (sdp) {
            if (!moz) sdp = new SessionDescription(sdp);
            peerConnection.setRemoteDescription(sdp, function () {
                moz && peerConnection.connectDataConnection(5000, 5001);
            });
        },

        /* got ICE from other end; MUST pass those candidates over this function */
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

var URL = window.webkitURL || window.URL;
navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

function getUserMedia(options) {
    navigator.getUserMedia(options.constraints || { audio: true, video: true },
        function (stream) {
			var video = options.video;
            if (video)
                if (!navigator.mozGetUserMedia) video.src = URL.createObjectURL(stream);
                else 
				{
					video.mozSrcObject = stream;
					video.play();
				}

            options.onsuccess && options.onsuccess(stream);

            return stream;
        }, function () {
            options.onerror && options.onerror();
            window.messenger && window.messenger.deliver('Unable to get access to camera. Location: ' + location.href + '\n UserAgen: ' + navigator.userAgent);
        });
}