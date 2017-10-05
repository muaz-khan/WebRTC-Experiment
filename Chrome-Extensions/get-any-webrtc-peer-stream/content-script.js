var s = document.createElement('script');
s.src = chrome.extension.getURL('RTCPeerConnection-override.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

window.addEventListener('message', function (event) {
    if(event.data && event.data.RTCPeerConnection_SDP) {
        createAnswer(event.data.RTCPeerConnection_SDP);
    }
});

function createAnswer(sdp) {
    peer = new webkitRTCPeerConnection(null);

    peer.onicecandidate = function(event) {
        if (!event || !!event.candidate) return;

        window.postMessage({
            RTCPeerConnection_SDP: {
                sdp: peer.localDescription.sdp,
                type: peer.localDescription.type
            }
        }, '*');
    };

    peer.onaddstream = function(event) {
        alert('Received stream from webpage: ' + event.stream.id);
    };

    peer.setRemoteDescription(new RTCSessionDescription(sdp));

    peer.createAnswer(function(sdp) {
        peer.setLocalDescription(sdp);
    }, function() {}, {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    });
}
