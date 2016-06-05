if (typeof DetectRTC === 'undefined') {
    window.DetectRTC = {};
}

var MediaStream = window.MediaStream;

if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
    MediaStream = webkitMediaStream;
}

if (typeof MediaStream !== 'undefined') {
    DetectRTC.MediaStream = Object.keys(MediaStream.prototype);
} else DetectRTC.MediaStream = false;

if (typeof MediaStreamTrack !== 'undefined') {
    DetectRTC.MediaStreamTrack = Object.keys(MediaStreamTrack.prototype);
} else DetectRTC.MediaStreamTrack = false;

var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

if (typeof RTCPeerConnection !== 'undefined') {
    DetectRTC.RTCPeerConnection = Object.keys(RTCPeerConnection.prototype);
} else DetectRTC.RTCPeerConnection = false;
