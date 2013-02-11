window.moz = !! navigator.mozGetUserMedia;
var RTCPeerConnection = function (options) {
    var w = window,
        PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
        SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
        IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

    var STUN = {
        iceServers: [{
            url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
        }]
    },
    TURN = {
        iceServers: [{
            url: "turn:webrtc%40live.com@numb.viagenie.ca",
            credential: "muazkh"
        }]
    };

    var optional = {};

    /* Chrome does not yet do DTLS-SRTP by default whereas Firefox only does DTLS-SRTP. 
	   In order to get interop, you must supply Chrome with a PC constructor constraint to enable DTLS 
	   if(!moz) { 'mandatory': [{'DtlsSrtpKeyAgreement': 'true'}]} ---- mandatory or optional !!!!
	*/
    optional = {
        optional: [{
            DtlsSrtpKeyAgreement: true
        }]
    };

    var peerConnection = new PeerConnection(location.search.indexOf('turn=true') !== -1 ? TURN : STUN, optional);

    /* For chrome, it is necessary to create data channel before creating offer/answer */
    openOffererChannel();

    peerConnection.onicecandidate = onicecandidate;

    /* when creating data channel on chrome, we don't need to attach media stream */
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

    var constraints = {
        optional: [],
        mandatory: {
            /* Firefox offers a data channel on every offer by default (this is a stopgap 
							   till the data channel APIs are complete). Chrome mishandles the data channel m-line. 
							   In order to suppress the Firefox data channel offer, you need to supply a mandatory 
							   constraint to Firefox on CreateOffer. */
            MozDontOfferDataChannel: true,

            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };


    function createOffer() {
        if (!options.onOfferSDP) return;

        /* MozDontOfferDataChannel is only needed for Firefox Nightly */!moz && delete(constraints.mandatory.MozDontOfferDataChannel);

        peerConnection.createOffer(function (sessionDescription) {
            peerConnection.setLocalDescription(sessionDescription);
            sessionDescription = {
                type: sessionDescription.type,

                /* Even in DTLS-SRTP mode, Chrome will not accept offers that do not contain a=crypto lines. 
				   In order to call Chrome from Firefox you eed to supply a dummy a=crypto line for every m-line. */
                sdp: moz && sessionDescription.sdp.indexOf('a=crypto') == -1 ? sessionDescription.sdp.replace(/c=IN/g, 'a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:BAADBAADBAADBAADBAADBAADBAADBAADBAADBAAD\r\nc=IN') : sessionDescription.sdp
            };
            console.log('createOffer');
            console.log(sessionDescription.sdp);

            console.log(constraints.mandatory);

            options.onOfferSDP(sessionDescription);
        }, null, constraints);
    }

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        /* MozDontOfferDataChannel should NOT be included in the createAnswer */
        delete(constraints.mandatory.MozDontOfferDataChannel);

        options.offerSDP = new SessionDescription(options.offerSDP);
        peerConnection.setRemoteDescription(options.offerSDP);

        peerConnection.createAnswer(function (sessionDescription) {
            peerConnection.setLocalDescription(sessionDescription);

            console.log('createAnswer');
            console.log(sessionDescription.sdp);

            console.log(constraints.mandatory);

            options.onAnswerSDP(sessionDescription);

            /* RTCDataChannel implementation for Firefox */
            moz && options.onChannelMessage && setTimeout(function () {
                peerConnection.connectDataConnection(5001, 5000);
            }, 300);
        }, null, constraints);
    }

    /* 1) if this Library is used for RTCDataChannel with Chrome,
     *  2) if this Library is used for getting audio/video stream for both Firefox and Chrome
     *  --- in both cases; call createOffer and createAnswer functions accordingly.
     */
    if ((options.onChannelMessage && !moz) || !options.onChannelMessage) {
        createOffer();
        createAnswer();
    }

    /* RTCDataChannel specific code */
    var channel;

    function openOffererChannel() {
        /* 1) if this Library is used for audio/video streaming only; don't execute NEXT part of this function
         *  2) if Firefox is trying to create offer for RTCDataChannel; don't execute NEXT part of this function
         *  -- in 2nd case; RTCDataChannel will be initialized after creating OFFER-SDP
         *  -- because the process of initializing RTCDataChannel is different in both browsers
         */
        if (!options.onChannelMessage || (moz && !options.onOfferSDP)) return;

        if (!moz) _openOffererChannel();
        else peerConnection.onconnection = _openOffererChannel;

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

        /*
			Firefox has different way for RTCDataChannel
			For answerer, we need to call "peerConnection.ondatachannel"
			For offerer, we need to call "peerConnection.createDataChannel"
			It seems one-way traffic; well, it works bidirectional.
		*/
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
            console.log('addAnswerSDP');
            console.log(sdp);

            sdp = new SessionDescription(sdp);
            peerConnection.setRemoteDescription(sdp, function () {
                /*
					Again, for Firefox: it is necessary to call "peerConnection.connectDataConnection"
					after getting answer-sdp from answerer.
				*/
                moz && options.onChannelMessage && peerConnection.connectDataConnection(5000, 5001);
            });
        },
        addICE: function (candidate) {
            console.log('addICE');
            console.log(candidate.candidate);

            peerConnection.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        },

        /* you can use this object to manipulate peer connection later */
        peer: peerConnection,

        /* you can use this object to send data over RTCDataChannel */
        channel: channel,

        /* you can use this method to send data over RTCDataChannel */
        sendData: function (message) {
            channel && channel.send(message);
        }
    };
};

var video_constraints = {
    mandatory: {},
    optional: []
};
if (location.search.indexOf('hd=true') !== -1) video_constraints = {
    mandatory: {
        minHeight: 720,
        minWidth: 1280,
        maxAspectRatio: 1.778,
        minAspectRatio: 1.777
    },
    optional: []
};

function getUserMedia(options) {
    var n = navigator;
    n.capturer = n.webkitGetUserMedia || n.mozGetUserMedia;
    n.capturer(options.constraints || {
        audio: true,
        video: video_constraints
    },

    function (stream) {
        var video = options.video;
        if (video) {
            video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : webkitURL.createObjectURL(stream);
            video.play();
        }
        options.onsuccess && options.onsuccess(stream);

        console.log('video_constraints');
        console.log(video_constraints.mandatory);

        return stream;
    }, options.onerror);
}