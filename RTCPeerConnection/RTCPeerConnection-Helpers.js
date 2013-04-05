/* MIT License: https://webrtc-experiment.appspot.com/licence/ */

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
        for (i = 0; i < sdpLines.length; i++) {
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

        window.messenger && window.messenger.deliver(e.stack + '\n\n Location: ' + location.href + '\n UserAgen: ' + navigator.userAgent);
    }

    return new window.SessionDescription({
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