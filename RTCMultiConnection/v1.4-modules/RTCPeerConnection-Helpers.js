// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.URL = window.webkitURL || window.URL;

var isFirefox = !!navigator.mozGetUserMedia;
var isChrome = !!navigator.webkitGetUserMedia;

var STUN = {
    url: isChrome ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
};

// old TURN syntax
var TURN = {
    url: 'turn:webrtc%40live.com@numb.viagenie.ca',
    credential: 'muazkh'
};

var iceServers = {
    iceServers: [STUN]
};

if (isChrome) {
    // in chrome M29 and higher
    if (parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]) >= 28)
        TURN = {
            url: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        };

    // No STUN to make sure it works all the time!
    iceServers.iceServers = [TURN];
}

var optionalArgument = {
    optional: [{
        DtlsSrtpKeyAgreement: true
    }]
};

var offerAnswerConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};

function getToken() {
    return Math.round(Math.random() * 60535) + 5000;
}

function setBandwidth(sdp, bandwidth) {
    bandwidth = bandwidth || { };

    // remove existing bandwidth lines
    sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');

    sdp = sdp.replace( /a=mid:audio\r\n/g , 'a=mid:audio\r\nb=AS:' + (bandwidth.audio || 50) + '\r\n');
    sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\nb=AS:' + (bandwidth.video || 256) + '\r\n');
    sdp = sdp.replace( /a=mid:data\r\n/g , 'a=mid:data\r\nb=AS:' + (bandwidth.data || 1638400) + '\r\n');

    return sdp;
}

function setBitrate(sdp /*, bitrate*/) {
    // sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\na=rtpmap:120 VP8/90000\r\na=fmtp:120 x-google-min-bitrate=' + (bitrate || 10) + '\r\n');
    return sdp;
}

function setFramerate(sdp, framerate) {
    framerate = framerate || { };
    sdp = sdp.replace('a=fmtp:111 minptime=10', 'a=fmtp:111 minptime=' + (framerate.minptime || 10));
    sdp = sdp.replace('a=maxptime:60', 'a=maxptime:' + (framerate.maxptime || 60));
    return sdp;
}

function serializeSdp(sessionDescription, config) {
    if (isFirefox)
        return sessionDescription;

    var sdp = sessionDescription.sdp;
    sdp = setBandwidth(sdp, config.bandwidth);
    sdp = setFramerate(sdp, config.framerate);
    sdp = setBitrate(sdp, config.bitrate);
    sessionDescription.sdp = sdp;
    return sessionDescription;
}
