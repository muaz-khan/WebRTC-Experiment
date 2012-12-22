var codecs = {};

/* this function credit goes to Google Chrome WebRTC team! */
codecs.opus = (function (sdp) {
    var i, result = preferOpus();

    /* Opus? use it! */
    function preferOpus() {
        var sdpLines = sdp.split('\r\n');

        /* m-line for audio tracks */
        for (i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                var mLineIndex = i;
                break;
            }
        }

        if (mLineIndex === null) return sdp;

        /* Opus? is should be at default audio-track */
        for (i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('opus/48000') !== -1) {
                var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                if (opusPayload)
                    sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                break;
            }
        }

        /* Remove CN in m line and sdp. */
        sdpLines = removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');
        return sdp;
    }

    function extractSdp(sdpLine, pattern) {
        var response = sdpLine.match(pattern);
        return (response && response.length == 2) ? response[1] : null;
    }

    function setDefaultCodec(mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = new Array();
        var index = 0;
        for (i = 0; i < elements.length; i++) {

            /* Format of media starts from the fourth. */
            if (index === 3) {

                /* Put target payload to the first. */
                newLine[index++] = payload;
            }
            if (elements[i] !== payload) newLine[index++] = elements[i];
        }
        return newLine.join(' ');
    }

    /* Strip CN from sdp before CN constraints is ready. */
    function removeCN(sdpLines, mLineIndex) {
        var mLineElements = sdpLines[mLineIndex].split(' ');

        /* Scan from end for the convenience of removing an item. */
        for (i = sdpLines.length - 1; i >= 0; i--) {
            var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
                var cnPos = mLineElements.indexOf(payload);
                if (cnPos !== -1) {
                    
                    /*Remove CN payload from m line. */
                    mLineElements.splice(cnPos, 1);
                }

                /* Remove CN line in sdp */
                sdpLines.splice(i, 1);
            }
        }

        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
    }

    return result;
})();