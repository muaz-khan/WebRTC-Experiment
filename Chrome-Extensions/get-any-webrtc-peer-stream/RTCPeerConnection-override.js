var nativePeer;

(function looper() {
    var RTC = window.RTCPeerConnection || window.webkitRTCPeerConnection;

    if (typeof RTC.prototype.addTrack !== 'undefined' && isFuncNative(RTC.prototype.addTrack)) {
        RTC.prototype._addTrack = RTC.prototype.addTrack;
        RTC.prototype.addTrack = function(track, stream) {
            nativePeer = this;
            nativePeer.streamEvent = 'track';
            this._addTrack(track, stream);
        };
    } else if (typeof RTC.prototype.addStream !== 'undefined' && isFuncNative(RTC.prototype.addStream)) {
        RTC.prototype._addStream = RTC.prototype.addStream;
        RTC.prototype.addStream = function(stream) {
            nativePeer = this;
            nativePeer.streamEvent = 'addstream';
            this._addStream(stream);
        };
    }

    if (typeof nativePeer === 'undefined' || typeof nativePeer.streamEvent === 'undefined') {
        // console.error('looper');
        setTimeout(looper, 1); // recheck
        return;
    }

    var dontDuplicate = {};
    nativePeer.addEventListener(nativePeer.streamEvent, function(event) {
        if (nativePeer.streamEvent === 'track') {
            event.stream = event.streams[0];
        }

        if(dontDuplicate[event.stream.id]) return;
        dontDuplicate[event.stream.id] = true;

        alert('Goto remote stream, creating offer');

        createOffer(event.stream);
    }, false);
})();

function isFuncNative(f) {
    return !!f && (typeof f).toLowerCase() == 'function' &&
        (f === Function.prototype ||
            /^\s*function\s*(\b[a-z$_][a-z0-9$_]*\b)*\s*\((|([a-z$_][a-z0-9$_]*)(\s*,[a-z$_][a-z0-9$_]*)*)\)\s*{\s*\[native code\]\s*}\s*$/i.test(String(f)));
}

window.addEventListener('message', function (event) {
    if(event.data && event.data.RTCPeerConnection_SDP) {
        peer.setRemoteDescription(new RTCSessionDescription(event.data.RTCPeerConnection_SDP));
    }
});

function createOffer(stream) {
    peer = new webkitRTCPeerConnection(null);
    peer.addStream(stream);

    peer.onicecandidate = function(event) {
        if (!event || !!event.candidate) return;

        window.postMessage({
            RTCPeerConnection_SDP: {
                sdp: peer.localDescription.sdp,
                type: peer.localDescription.type
            }
        }, '*');
    };

    peer.createOffer(function(sdp) {
        peer.setLocalDescription(sdp);
    }, function() {}, {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    });
}
