// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.WebRTC-Experiment.com/licence/
// Source Code   - https://github.com/muaz-khan/Chrome-Extensions

var runtimePort = chrome.runtime.connect({name:'mycontentscript'});

var peer;

runtimePort.onMessage.addListener(function(message) {
    if (!message || !message.messageFromContentScript1234) {
        return;
    }

    if(message.sdp){
        peer.setRemoteDescription(new RTCSessionDescription(message.sdp));
    }

    if(message.stopStream && stream) {
        stream.getAudioTracks()[0].stop();
        stream = null;

        if(audioPlayer) {
            audioPlayer = null;
        }

        if(peer) {
            peer.close();
            peer = null;
        }
    }
});

var stream, audioPlayer;

navigator.webkitGetUserMedia({audio:true}, function(s) {
    stream = s;

    audioPlayer = document.createElement('audio');
    audioPlayer.muted = true;
    audioPlayer.volume = 0;
    audioPlayer.src = URL.createObjectURL(stream);

    peer = new webkitRTCPeerConnection(null);
    
    peer.addStream(stream);

    peer.onicecandidate = function(event) {
        if (!event || !!event.candidate) return;
        
        runtimePort.postMessage({
            sdp: peer.localDescription,
            messageFromContentScript1234: true
        });
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
}, function() {});
