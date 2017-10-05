var peer = this;

if (arguments[0] instanceof RTCPeerConnection) {
    peer = arguments[0];

    if (!!navigator.mozGetUserMedia) {
        mediaStreamTrack = arguments[1];
        callback = arguments[2];
        interval = arguments[3];
    }

    if (!(mediaStreamTrack instanceof MediaStreamTrack) && !!navigator.mozGetUserMedia) {
        throw '2nd argument is not instance of MediaStreamTrack.';
    }
} else if (!(mediaStreamTrack instanceof MediaStreamTrack) && !!navigator.mozGetUserMedia) {
    throw '1st argument is not instance of MediaStreamTrack.';
}
