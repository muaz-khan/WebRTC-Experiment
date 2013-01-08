window.PeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
window.SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
window.IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;

window.defaults = {
    iceServers: { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] },
    constraints: { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
};

var RTCPeerConnection = function(options) {

    var iceServers = options.iceServers || defaults.iceServers;
    var constraints = options.constraints || defaults.constraints;

    var peerConnection = new PeerConnection(iceServers);

    peerConnection.onicecandidate = onicecandidate;
    peerConnection.onaddstream = onaddstream;
    peerConnection.addStream(options.stream);

    function onicecandidate(event) {
        if (!event.candidate || !peerConnection) return;
        if (options.getice) options.getice(event.candidate);
    }

    function onaddstream(event) {
        options.gotstream && options.gotstream(event);
    }

    function createOffer() {
        if (!options.onoffer) return;

        peerConnection.createOffer(function(sessionDescription) {

            /* opus? use it dear! */
            options.isopus && (sessionDescription = codecs.opus(sessionDescription));

            peerConnection.setLocalDescription(sessionDescription);
            options.onoffer(sessionDescription);

        }, null, constraints);
    }

    createOffer();

    function createAnswer() {
        if (!options.onanswer) return;

        peerConnection.setRemoteDescription(new SessionDescription(options.offer));
        peerConnection.createAnswer(function(sessionDescription) {

            /* opus? use it dear! */
            options.isopus && (sessionDescription = codecs.opus(sessionDescription));

            peerConnection.setLocalDescription(sessionDescription);
            options.onanswer(sessionDescription);

        }, null, constraints);
    }

    createAnswer();

    return {
        /* offerer got answer sdp; MUST pass sdp over this function */
        onanswer: function(sdp) {
            peerConnection.setRemoteDescription(new SessionDescription(sdp));
        },
        
        /* got ICE from other end; MUST pass those candidates over this function */
        addice: function(candidate) {
            peerConnection.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };
};

function getUserMedia(options) {
    var URL = window.webkitURL || window.URL;
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

    navigator.getUserMedia(options.constraints || { audio: true, video: true },
        function (stream) {

            if (options.video)
                if (!navigator.mozGetUserMedia) options.video.src = URL.createObjectURL(stream);
                else options.video.mozSrcObject = stream;

            options.onsuccess && options.onsuccess(stream);

            return stream;
        }, options.onerror);
}
		
var codecs = {};

/* this function credit goes to Google Chrome WebRTC team! */
codecs.opus = function (sessionDescription) {

    /* no opus? use other codec! */
    if (!isopus) return sessionDescription;

    var sdp = sessionDescription.sdp;

    /* Opus? use it! */
    function preferOpus() {
        var sdpLines = sdp.split('\r\n');

        // Search for m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                var mLineIndex = i;
                break;
            }
        }
        if (mLineIndex === null)
            return sdp;

        // If Opus is available, set it as the default in m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('opus/48000') !== -1) {
                var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                if (opusPayload)
                    sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                break;
            }
        }

        // Remove CN in m line and sdp.
        sdpLines = removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');
        return sdp;
    }

    function extractSdp(sdpLine, pattern) {
        var _result = sdpLine.match(pattern);
        return (_result && _result.length == 2) ? _result[1] : null;
    }

    // Set the selected codec to the first in m line.
    function setDefaultCodec(mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = new Array();
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
            if (index === 3) // Format of media starts from the fourth.
                newLine[index++] = payload; // Put target payload to the first.
            if (elements[i] !== payload)
                newLine[index++] = elements[i];
        }
        return newLine.join(' ');
    }

    // Strip CN from sdp before CN constraints is ready.
    function removeCN(sdpLines, mLineIndex) {
        var mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length - 1; i >= 0; i--) {
            var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
                var cnPos = mLineElements.indexOf(payload);
                if (cnPos !== -1) {
                    // Remove CN payload from m line.
                    mLineElements.splice(cnPos, 1);
                }
                // Remove CN line in sdp
                sdpLines.splice(i, 1);
            }
        }

        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
    }


    var result;

    /* in case of error; use default codec; otherwise use opus */
    try {
        result = preferOpus();
        console.log('using opus codec!');
    }
    catch (e) {
        console.error(e);
        result = sessionDescription.sdp;
    }

    return new SessionDescription({
        sdp: result,
        type: sessionDescription.type
    });
};

/* check support of opus codec */
codecs.isopus = function () {
    var result = true;
    new PeerConnection(defaults.iceServers).createOffer(function (sessionDescription) {
        result = sessionDescription.sdp.indexOf('opus') !== -1;
    }, null, defaults.constraints);
    return result;
};

/* used to know opus codec support */
var isopus = !!codecs.isopus();