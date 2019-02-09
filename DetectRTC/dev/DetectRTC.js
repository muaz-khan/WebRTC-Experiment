var DetectRTC = window.DetectRTC || {};

// ----------
// DetectRTC.browser.name || DetectRTC.browser.version || DetectRTC.browser.fullVersion
DetectRTC.browser = getBrowserInfo();

detectPrivateMode(function(isPrivateBrowsing) {
    DetectRTC.browser.isPrivateBrowsing = !!isPrivateBrowsing;
});

// DetectRTC.isChrome || DetectRTC.isFirefox || DetectRTC.isEdge
DetectRTC.browser['is' + DetectRTC.browser.name] = true;

// -----------
DetectRTC.osName = osName;
DetectRTC.osVersion = osVersion;

var isNodeWebkit = typeof process === 'object' && typeof process.versions === 'object' && process.versions['node-webkit'];

// --------- Detect if system supports WebRTC 1.0 or WebRTC 1.1.
var isWebRTCSupported = false;
['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection', 'RTCIceGatherer'].forEach(function(item) {
    if (isWebRTCSupported) {
        return;
    }

    if (item in window) {
        isWebRTCSupported = true;
    }
});
DetectRTC.isWebRTCSupported = isWebRTCSupported;

//-------
DetectRTC.isORTCSupported = typeof RTCIceGatherer !== 'undefined';

// --------- Detect if system supports screen capturing API
var isScreenCapturingSupported = false;
if (DetectRTC.browser.isChrome && DetectRTC.browser.version >= 35) {
    isScreenCapturingSupported = true;
} else if (DetectRTC.browser.isFirefox && DetectRTC.browser.version >= 34) {
    isScreenCapturingSupported = true;
} else if (DetectRTC.browser.isEdge && DetectRTC.browser.version >= 17) {
    isScreenCapturingSupported = true;
} else if (DetectRTC.osName === 'Android' && DetectRTC.browser.isChrome) {
    isScreenCapturingSupported = true;
}

if(!!navigator.getDisplayMedia || (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {
    isScreenCapturingSupported = true;
}

if (!/^(https:|chrome-extension:)$/g.test(location.protocol || '')) {
    var isNonLocalHost = typeof document !== 'undefined' && typeof document.domain === 'string' && document.domain.search && document.domain.search(/localhost|127.0./g) === -1;
    if (isNonLocalHost && (DetectRTC.browser.isChrome || DetectRTC.browser.isEdge || DetectRTC.browser.isOpera)) {
        isScreenCapturingSupported = false;
    } else if (DetectRTC.browser.isFirefox) {
        isScreenCapturingSupported = false;
    }
}
DetectRTC.isScreenCapturingSupported = isScreenCapturingSupported;

// --------- Detect if WebAudio API are supported
var webAudio = {
    isSupported: false,
    isCreateMediaStreamSourceSupported: false
};

['AudioContext', 'webkitAudioContext', 'mozAudioContext', 'msAudioContext'].forEach(function(item) {
    if (webAudio.isSupported) {
        return;
    }

    if (item in window) {
        webAudio.isSupported = true;

        if (window[item] && 'createMediaStreamSource' in window[item].prototype) {
            webAudio.isCreateMediaStreamSourceSupported = true;
        }
    }
});
DetectRTC.isAudioContextSupported = webAudio.isSupported;
DetectRTC.isCreateMediaStreamSourceSupported = webAudio.isCreateMediaStreamSourceSupported;

// ---------- Detect if SCTP/RTP channels are supported.

var isRtpDataChannelsSupported = false;
if (DetectRTC.browser.isChrome && DetectRTC.browser.version > 31) {
    isRtpDataChannelsSupported = true;
}
DetectRTC.isRtpDataChannelsSupported = isRtpDataChannelsSupported;

var isSCTPSupportd = false;
if (DetectRTC.browser.isFirefox && DetectRTC.browser.version > 28) {
    isSCTPSupportd = true;
} else if (DetectRTC.browser.isChrome && DetectRTC.browser.version > 25) {
    isSCTPSupportd = true;
} else if (DetectRTC.browser.isOpera && DetectRTC.browser.version >= 11) {
    isSCTPSupportd = true;
}
DetectRTC.isSctpDataChannelsSupported = isSCTPSupportd;

// ---------

DetectRTC.isMobileDevice = isMobileDevice; // "isMobileDevice" boolean is defined in "getBrowserInfo.js"

// ------
var isGetUserMediaSupported = false;
if (navigator.getUserMedia) {
    isGetUserMediaSupported = true;
} else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    isGetUserMediaSupported = true;
}

if (DetectRTC.browser.isChrome && DetectRTC.browser.version >= 46 && !/^(https:|chrome-extension:)$/g.test(location.protocol || '')) {
    if (typeof document !== 'undefined' && typeof document.domain === 'string' && document.domain.search && document.domain.search(/localhost|127.0./g) === -1) {
        isGetUserMediaSupported = 'Requires HTTPs';
    }
}

if (DetectRTC.osName === 'Nodejs') {
    isGetUserMediaSupported = false;
}
DetectRTC.isGetUserMediaSupported = isGetUserMediaSupported;

var displayResolution = '';
if (screen.width) {
    var width = (screen.width) ? screen.width : '';
    var height = (screen.height) ? screen.height : '';
    displayResolution += '' + width + ' x ' + height;
}
DetectRTC.displayResolution = displayResolution;

function getAspectRatio(w, h) {
    function gcd(a, b) {
        return (b == 0) ? a : gcd(b, a % b);
    }
    var r = gcd(w, h);
    return (w / r) / (h / r);
}

DetectRTC.displayAspectRatio = getAspectRatio(screen.width, screen.height).toFixed(2);

// ----------
DetectRTC.isCanvasSupportsStreamCapturing = isCanvasSupportsStreamCapturing;
DetectRTC.isVideoSupportsStreamCapturing = isVideoSupportsStreamCapturing;

if (DetectRTC.browser.name == 'Chrome' && DetectRTC.browser.version >= 53) {
    if (!DetectRTC.isCanvasSupportsStreamCapturing) {
        DetectRTC.isCanvasSupportsStreamCapturing = 'Requires chrome flag: enable-experimental-web-platform-features';
    }

    if (!DetectRTC.isVideoSupportsStreamCapturing) {
        DetectRTC.isVideoSupportsStreamCapturing = 'Requires chrome flag: enable-experimental-web-platform-features';
    }
}

// ------
DetectRTC.DetectLocalIPAddress = DetectLocalIPAddress;

DetectRTC.isWebSocketsSupported = 'WebSocket' in window && 2 === window.WebSocket.CLOSING;
DetectRTC.isWebSocketsBlocked = !DetectRTC.isWebSocketsSupported;

if (DetectRTC.osName === 'Nodejs') {
    DetectRTC.isWebSocketsSupported = true;
    DetectRTC.isWebSocketsBlocked = false;
}

DetectRTC.checkWebSocketsSupport = function(callback) {
    callback = callback || function() {};
    try {
        var starttime;
        var websocket = new WebSocket('wss://echo.websocket.org:443/');
        websocket.onopen = function() {
            DetectRTC.isWebSocketsBlocked = false;
            starttime = (new Date).getTime();
            websocket.send('ping');
        };
        websocket.onmessage = function() {
            DetectRTC.WebsocketLatency = (new Date).getTime() - starttime + 'ms';
            callback();
            websocket.close();
            websocket = null;
        };
        websocket.onerror = function() {
            DetectRTC.isWebSocketsBlocked = true;
            callback();
        };
    } catch (e) {
        DetectRTC.isWebSocketsBlocked = true;
        callback();
    }
};

// -------
DetectRTC.load = function(callback) {
    callback = callback || function() {};
    checkDeviceSupport(callback);
};

// check for microphone/camera support!
if (typeof checkDeviceSupport === 'function') {
    // checkDeviceSupport();
}

if (typeof MediaDevices !== 'undefined') {
    DetectRTC.MediaDevices = MediaDevices;
} else {
    DetectRTC.MediaDevices = [];
}

DetectRTC.hasMicrophone = hasMicrophone;
DetectRTC.hasSpeakers = hasSpeakers;
DetectRTC.hasWebcam = hasWebcam;

DetectRTC.isWebsiteHasWebcamPermissions = isWebsiteHasWebcamPermissions;
DetectRTC.isWebsiteHasMicrophonePermissions = isWebsiteHasMicrophonePermissions;

DetectRTC.audioInputDevices = audioInputDevices;
DetectRTC.audioOutputDevices = audioOutputDevices;
DetectRTC.videoInputDevices = videoInputDevices;

// ------
var isSetSinkIdSupported = false;
if (typeof document !== 'undefined' && typeof document.createElement === 'function' && 'setSinkId' in document.createElement('video')) {
    isSetSinkIdSupported = true;
}
DetectRTC.isSetSinkIdSupported = isSetSinkIdSupported;

// -----
var isRTPSenderReplaceTracksSupported = false;
if (DetectRTC.browser.isFirefox && typeof mozRTCPeerConnection !== 'undefined' /*&& DetectRTC.browser.version > 39*/ ) {
    /*global mozRTCPeerConnection:true */
    if ('getSenders' in mozRTCPeerConnection.prototype) {
        isRTPSenderReplaceTracksSupported = true;
    }
} else if (DetectRTC.browser.isChrome && typeof webkitRTCPeerConnection !== 'undefined') {
    /*global webkitRTCPeerConnection:true */
    if ('getSenders' in webkitRTCPeerConnection.prototype) {
        isRTPSenderReplaceTracksSupported = true;
    }
}
DetectRTC.isRTPSenderReplaceTracksSupported = isRTPSenderReplaceTracksSupported;

//------
var isRemoteStreamProcessingSupported = false;
if (DetectRTC.browser.isFirefox && DetectRTC.browser.version > 38) {
    isRemoteStreamProcessingSupported = true;
}
DetectRTC.isRemoteStreamProcessingSupported = isRemoteStreamProcessingSupported;

//-------
var isApplyConstraintsSupported = false;

/*global MediaStreamTrack:true */
if (typeof MediaStreamTrack !== 'undefined' && 'applyConstraints' in MediaStreamTrack.prototype) {
    isApplyConstraintsSupported = true;
}
DetectRTC.isApplyConstraintsSupported = isApplyConstraintsSupported;

//-------
var isMultiMonitorScreenCapturingSupported = false;
if (DetectRTC.browser.isFirefox && DetectRTC.browser.version >= 43) {
    // version 43 merely supports platforms for multi-monitors
    // version 44 will support exact multi-monitor selection i.e. you can select any monitor for screen capturing.
    isMultiMonitorScreenCapturingSupported = true;
}
DetectRTC.isMultiMonitorScreenCapturingSupported = isMultiMonitorScreenCapturingSupported;

DetectRTC.isPromisesSupported = !!('Promise' in window);

// version is generated by "grunt"
DetectRTC.version = '@@version';
