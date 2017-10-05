// ios-hacks.js

function setCordovaAPIs() {
    // if (DetectRTC.osName !== 'iOS') return;
    if (typeof cordova === 'undefined' || typeof cordova.plugins === 'undefined' || typeof cordova.plugins.iosrtc === 'undefined') return;

    var iosrtc = cordova.plugins.iosrtc;
    window.webkitRTCPeerConnection = iosrtc.RTCPeerConnection;
    window.RTCSessionDescription = iosrtc.RTCSessionDescription;
    window.RTCIceCandidate = iosrtc.RTCIceCandidate;
    window.MediaStream = iosrtc.MediaStream;
    window.MediaStreamTrack = iosrtc.MediaStreamTrack;
    navigator.getUserMedia = navigator.webkitGetUserMedia = iosrtc.getUserMedia;

    iosrtc.debug.enable('iosrtc*');
    if (typeof iosrtc.selectAudioOutput == 'function') {
        iosrtc.selectAudioOutput(window.iOSDefaultAudioOutputDevice || 'speaker'); // earpiece or speaker
    }
    iosrtc.registerGlobals();
}

document.addEventListener('deviceready', setCordovaAPIs, false);
setCordovaAPIs();
