// BandwidthHandler.js

var BandwidthHandler = (function() {
    var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);
    if (typeof cordova !== 'undefined') {
        isMobileDevice = true;
    }

    if (navigator && navigator.userAgent && navigator.userAgent.indexOf('Crosswalk') !== -1) {
        isMobileDevice = true;
    }

    function setBAS(sdp, bandwidth, isScreen) {
        if (!bandwidth) {
            return sdp;
        }

        if (typeof isFirefox !== 'undefined' && isFirefox) {
            return sdp;
        }

        if (isMobileDevice) {
            return sdp;
        }

        if (isScreen) {
            if (!bandwidth.screen) {
                console.warn('It seems that you are not using bandwidth for screen. Screen sharing is expected to fail.');
            } else if (bandwidth.screen < 300) {
                console.warn('It seems that you are using wrong bandwidth value for screen. Screen sharing is expected to fail.');
            }
        }

        // if screen; must use at least 300kbs
        if (bandwidth.screen && isScreen) {
            sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
            sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.screen + '\r\n');
        }

        // remove existing bandwidth lines
        if (bandwidth.audio || bandwidth.video || bandwidth.data) {
            sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
        }

        if (bandwidth.audio) {
            sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
        }

        if (bandwidth.video) {
            sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + (isScreen ? bandwidth.screen : bandwidth.video) + '\r\n');
        }

        return sdp;
    }

    // Find the line in sdpLines that starts with |prefix|, and, if specified,
    // contains |substr| (case-insensitive search).
    function findLine(sdpLines, prefix, substr) {
        return findLineInRange(sdpLines, 0, -1, prefix, substr);
    }

    // Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
    // and, if specified, contains |substr| (case-insensitive search).
    function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
        var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
        for (var i = startLine; i < realEndLine; ++i) {
            if (sdpLines[i].indexOf(prefix) === 0) {
                if (!substr ||
                    sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                    return i;
                }
            }
        }
        return null;
    }

    // Gets the codec payload type from an a=rtpmap:X line.
    function getCodecPayloadType(sdpLine) {
        var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
        var result = sdpLine.match(pattern);
        return (result && result.length === 2) ? result[1] : null;
    }

    function setVideoBitrates(sdp, params) {
        if (isMobileDevice) {
            return sdp;
        }

        params = params || {};
        var xgoogle_min_bitrate = params.min;
        var xgoogle_max_bitrate = params.max;

        var sdpLines = sdp.split('\r\n');

        // VP8
        var vp8Index = findLine(sdpLines, 'a=rtpmap', 'VP8/90000');
        var vp8Payload;
        if (vp8Index) {
            vp8Payload = getCodecPayloadType(sdpLines[vp8Index]);
        }

        if (!vp8Payload) {
            return sdp;
        }

        var rtxIndex = findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
        var rtxPayload;
        if (rtxIndex) {
            rtxPayload = getCodecPayloadType(sdpLines[rtxIndex]);
        }

        if (!rtxIndex) {
            return sdp;
        }

        var rtxFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString());
        if (rtxFmtpLineIndex !== null) {
            var appendrtxNext = '\r\n';
            appendrtxNext += 'a=fmtp:' + vp8Payload + ' x-google-min-bitrate=' + (xgoogle_min_bitrate || '228') + '; x-google-max-bitrate=' + (xgoogle_max_bitrate || '228');
            sdpLines[rtxFmtpLineIndex] = sdpLines[rtxFmtpLineIndex].concat(appendrtxNext);
            sdp = sdpLines.join('\r\n');
        }

        return sdp;
    }

    function setOpusAttributes(sdp, params) {
        if (isMobileDevice) {
            return sdp;
        }

        params = params || {};

        var sdpLines = sdp.split('\r\n');

        // Opus
        var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000');
        var opusPayload;
        if (opusIndex) {
            opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
        }

        if (!opusPayload) {
            return sdp;
        }

        var opusFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
        if (opusFmtpLineIndex === null) {
            return sdp;
        }

        var appendOpusNext = '';
        appendOpusNext += '; stereo=' + (typeof params.stereo != 'undefined' ? params.stereo : '1');
        appendOpusNext += '; sprop-stereo=' + (typeof params['sprop-stereo'] != 'undefined' ? params['sprop-stereo'] : '1');

        if (typeof params.maxaveragebitrate != 'undefined') {
            appendOpusNext += '; maxaveragebitrate=' + (params.maxaveragebitrate || 128 * 1024 * 8);
        }

        if (typeof params.maxplaybackrate != 'undefined') {
            appendOpusNext += '; maxplaybackrate=' + (params.maxplaybackrate || 128 * 1024 * 8);
        }

        if (typeof params.cbr != 'undefined') {
            appendOpusNext += '; cbr=' + (typeof params.cbr != 'undefined' ? params.cbr : '1');
        }

        if (typeof params.useinbandfec != 'undefined') {
            appendOpusNext += '; useinbandfec=' + params.useinbandfec;
        }

        if (typeof params.usedtx != 'undefined') {
            appendOpusNext += '; usedtx=' + params.usedtx;
        }

        if (typeof params.maxptime != 'undefined') {
            appendOpusNext += '\r\na=maxptime:' + params.maxptime;
        }

        sdpLines[opusFmtpLineIndex] = sdpLines[opusFmtpLineIndex].concat(appendOpusNext);

        sdp = sdpLines.join('\r\n');
        return sdp;
    }

    return {
        setApplicationSpecificBandwidth: function(sdp, bandwidth, isScreen) {
            return setBAS(sdp, bandwidth, isScreen);
        },
        setVideoBitrates: function(sdp, params) {
            return setVideoBitrates(sdp, params);
        },
        setOpusAttributes: function(sdp, params) {
            return setOpusAttributes(sdp, params);
        }
    };
})();
