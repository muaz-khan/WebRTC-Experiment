// Last time updated on: Dec 22, 2018

// Muaz Khan     - github.com/muaz-khan
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection

if (typeof window.RTCPeerConnection !== 'undefined') {
    window.RTCPeerConnection00 = window.RTCPeerConnection;
} else if (typeof mozRTCPeerConnection !== 'undefined') {
    window.RTCPeerConnection00 = mozRTCPeerConnection;
} else if (typeof webkitRTCPeerConnection !== 'undefined') {
    window.RTCPeerConnection00 = webkitRTCPeerConnection;
}

var RTCPeerConnection = function (options) {
    var w = window;

    var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
    var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
    var MediaStreamTrack = window.MediaStreamTrack;

    var peer = new RTCPeerConnection00({
        iceServers: IceServersHandler.getIceServers()
    });

    openOffererChannel();

    peer.onicecandidate = function(event) {
        if (event.candidate)
            options.onICE(event.candidate);
    };

    if(peer.addTrack === 'function') {
        // attachStream = MediaStream;
        if (options.attachStream) {
            options.attachStream.getTracks().forEach(function(track) {
                peer.addTrack(track, options.attachStream);
            });
        }

        // attachStreams[0] = audio-stream;
        // attachStreams[1] = video-stream;
        // attachStreams[2] = screen-capturing-stream;
        if (options.attachStreams && options.attachStream.length) {
            var streams = options.attachStreams;
            for (var i = 0; i < streams.length; i++) {
                streams[i].getTracks().forEach(function(track) {
                    peer.addTrack(track, streams[i]);
                });
            }
        }

        var dontDuplicate = {};
        peer.ontrack = function(event) {
            var remoteMediaStream = event.streams[0];
            
            if(dontDuplicate[remoteMediaStream.id]) return;
            dontDuplicate[remoteMediaStream.id] = true;

            // onRemoteStreamEnded(MediaStream)
            remoteMediaStream.onended = remoteMediaStream.oninactive = function() {
                if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
            };

            // onRemoteStream(MediaStream)
            if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

            console.debug('on:add:stream', remoteMediaStream);
        };
    }
    else {
        // attachStream = MediaStream;
        if (options.attachStream) peer.addStream(options.attachStream);

        // attachStreams[0] = audio-stream;
        // attachStreams[1] = video-stream;
        // attachStreams[2] = screen-capturing-stream;
        if (options.attachStreams && options.attachStream.length) {
            var streams = options.attachStreams;
            for (var i = 0; i < streams.length; i++) {
                peer.addStream(streams[i]);
            }
        }

        peer.onaddstream = function(event) {
            var remoteMediaStream = event.stream;

            // onRemoteStreamEnded(MediaStream)
            remoteMediaStream.onended = function() {
                if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
            };

            // onRemoteStream(MediaStream)
            if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

            console.debug('on:add:stream', remoteMediaStream);
        };
    }

    var constraints = options.constraints || {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    console.debug('sdp-constraints', JSON.stringify(constraints.mandatory, null, '\t'));

    // onOfferSDP(RTCSessionDescription)

    function createOffer() {
        if (!options.onOfferSDP) return;

        peer.createOffer(constraints).then(function(sessionDescription) {
            peer.setLocalDescription(sessionDescription).then(function() {
                options.onOfferSDP(sessionDescription);
                console.debug('offer-sdp', sessionDescription.sdp);
            });
        }).catch(onSdpError);
    }

    // onAnswerSDP(RTCSessionDescription)

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        //options.offerSDP.sdp = addStereo(options.offerSDP.sdp);
        console.debug('offer-sdp', options.offerSDP.sdp);
        peer.setRemoteDescription(new RTCSessionDescription(options.offerSDP)).then(function() {
            peer.createAnswer(constraints).then(function(sessionDescription) {
                peer.setLocalDescription(sessionDescription).then(function() {
                    options.onAnswerSDP(sessionDescription);
                    console.debug('answer-sdp', sessionDescription.sdp);
                });
            }).catch(onSdpError);
        }).catch(onSdpError);
    }

    // if Mozilla Firefox & DataChannel; offer/answer will be created later
    if ((options.onChannelMessage && !moz) || !options.onChannelMessage) {
        createOffer();
        createAnswer();
    }

    // DataChannel management
    var channel;

    function openOffererChannel() {
        if (!options.onChannelMessage)
            return;

        _openOffererChannel();
    }

    function _openOffererChannel() {
        // protocol: 'text/chat', preset: true, stream: 16
        // maxRetransmits:0 && ordered:false
        var dataChannelDict = { };
        channel = peer.createDataChannel(options.channel || 'sctp-channel', dataChannelDict);
        setChannelEvents();
    }

    function setChannelEvents() {
        channel.onmessage = function(event) {
            if (options.onChannelMessage) options.onChannelMessage(event);
        };

        channel.onopen = function() {
            if (options.onChannelOpened) options.onChannelOpened(channel);
        };
        channel.onclose = function(event) {
            if (options.onChannelClosed) options.onChannelClosed(event);

            console.warn('WebRTC DataChannel closed', event);
        };
        channel.onerror = function(event) {
            if (options.onChannelError) options.onChannelError(event);

            console.error('WebRTC DataChannel error', event);
        };
    }

    if (options.onAnswerSDP && options.onChannelMessage) {
        openAnswererChannel();
    }

    function openAnswererChannel() {
        peer.ondatachannel = function(event) {
            channel = event.channel;
            setChannelEvents();
        };
    }

    // fake:true is also available on chrome under a flag!

    function useless() {
        console.error('Error in fake:true');
    }

    function onSdpSuccess() {
    }

    function onSdpError(e) {
        var message = JSON.stringify(e, null, '\t');

        if (message.indexOf('RTP/SAVPF Expects at least 4 fields') != -1) {
            message = 'It seems that you are trying to interop RTP-datachannels with SCTP. It is not supported!';
        }

        console.error('onSdpError:', message);
    }

    return {
        addAnswerSDP: function(sdp) {
            console.debug('adding answer-sdp', sdp.sdp);
            peer.setRemoteDescription(new RTCSessionDescription(sdp));
        },
        addICE: function(candidate) {
            peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));

            console.debug('adding-ice', candidate.candidate);
        },

        peer: peer,
        channel: channel,
        sendData: function(message) {
            channel && channel.send(message);
        }
    };
}

// getUserMedia
var video_constraints = {
    mandatory: { },
    optional: []
};

function getUserMedia(options) {
    navigator.mediaDevices.getUserMedia(options.constraints || {
            audio: true,
            video: video_constraints
        }).then(function(stream) {
            var video = options.video;
            if (video) {
                video.srcObject = stream;
                video.play();
            }
            options.onsuccess && options.onsuccess(stream);
        }).catch(function(e) {
            alert(e.message || JSON.stringify(e));
        });
}

window.moz = !!navigator.mozGetUserMedia;
var chromeVersion = 70;
try {
    chromeVersion = !!navigator.mozGetUserMedia ? 0 : parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]);
}
catch(e) {}

// IceServersHandler.js

var IceServersHandler = (function() {
    function getIceServers(connection) {
        // resiprocate: 3344+4433
        // pions: 7575
        var iceServers = [{
                'urls': [
                    'stun:webrtcweb.com:7788', // coTURN
                    'stun:webrtcweb.com:7788?transport=udp', // coTURN
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            },
            {
                'urls': [
                    'turn:webrtcweb.com:7788', // coTURN 7788+8877
                    'turn:webrtcweb.com:4455?transport=udp', // restund udp

                    'turn:webrtcweb.com:8877?transport=udp', // coTURN udp
                    'turn:webrtcweb.com:8877?transport=tcp', // coTURN tcp
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            },
            {
                'urls': [
                    'stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302',
                    'stun:stun.l.google.com:19302?transport=udp',
                ]
            }
        ];

        if (typeof window.InstallTrigger !== 'undefined') {
            iceServers = [{
                'urls': [
                    'turn:webrtcweb.com:7788',
                    'stun:webrtcweb.com:7788',
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            }];
        }

        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();
