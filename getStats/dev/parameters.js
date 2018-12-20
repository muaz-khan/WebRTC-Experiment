var peer = this;

if (!(arguments[0] instanceof RTCPeerConnection)) {
    throw '1st argument is not instance of RTCPeerConnection.';
}

peer = arguments[0];

if (arguments[1] instanceof MediaStreamTrack) {
    mediaStreamTrack = arguments[1]; // redundant on non-safari
    callback = arguments[2];
    interval = arguments[3];
}
