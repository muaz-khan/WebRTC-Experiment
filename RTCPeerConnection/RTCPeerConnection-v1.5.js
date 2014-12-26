// Last time updated at Dec 26, 2014, 08:32:23
// Muaz Khan     - github.com/muaz-khan
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection

// TODO: Fix: It creates multiple data channels. It MUST create merely single channel.
 
window.moz = !!navigator.mozGetUserMedia;
var chromeVersion = !!navigator.mozGetUserMedia ? 0 : parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);

(function() {
    window.RTCPeerConnection = function(options) {
        var w = window,
            PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
            SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
            IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

        var iceServers = {
            iceServers: RTCPeerConnection.iceServers
        };

        console.debug('ice-servers', JSON.stringify(iceServers.iceServers, null, '\t'));

        var optional = {
            optional: []
        };

        console.debug('optional-arguments', JSON.stringify(optional.optional, null, '\t'));

        var peer = new PeerConnection(iceServers, optional);

        peer.onicecandidate = function(event) {
            if (event.candidate) {
                options.onICE(event.candidate);
            }
        };

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
            setTimeout(function() {
                var remoteMediaStream = event.stream;

                // onRemoteStreamEnded(MediaStream)
                remoteMediaStream.onended = function() {
                    if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
                };

                // onRemoteStream(MediaStream)
                if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

                console.debug('on:add:stream', remoteMediaStream);
            }, 2000);
        };
        
        var OfferToReceiveAudio = false;
        var OfferToReceiveVideo = false;
        if(peer.getLocalStreams()[0] && peer.getLocalStreams()[0].getAudioTracks().length) {
            OfferToReceiveAudio = true;
        }
        
        if(peer.getLocalStreams()[0] && peer.getLocalStreams()[0].getVideoTracks().length) {
            OfferToReceiveVideo = true;
        }
        
        var firefoxVersion = 50;
        matchArray = navigator.userAgent.match(/Firefox\/(.*)/);
        if (moz && matchArray && matchArray[1]) {
            firefoxVersion = parseInt(matchArray[1], 10);
        }
        
        var sdpConstraints = options.constraints || {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: OfferToReceiveAudio,
                OfferToReceiveVideo: OfferToReceiveVideo
            }
        };
        
        if(moz && firefoxVersion > 34) {
            sdpConstraints = {
                OfferToReceiveAudio: OfferToReceiveAudio,
                OfferToReceiveVideo: OfferToReceiveVideo
            };
        }
        
        console.debug('sdp-constraints', JSON.stringify(sdpConstraints, null, '\t'));

        // onOfferSDP(RTCSessionDescription)

        function createOffer() {
            if (!options.onOfferSDP) return;

            peer.createOffer(function(sessionDescription) {
                sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
                peer.setLocalDescription(sessionDescription);
                options.onOfferSDP(sessionDescription);

                console.debug('offer-sdp', sessionDescription.sdp);
            }, onSdpError, sdpConstraints);
        }

        // onAnswerSDP(RTCSessionDescription)

        function createAnswer() {
            if (!options.onAnswerSDP) return;

            //options.offerSDP.sdp = addStereo(options.offerSDP.sdp);
            console.debug('offer-sdp', options.offerSDP.sdp);
            peer.setRemoteDescription(new SessionDescription(options.offerSDP), onSdpSuccess, onSdpError);
            peer.createAnswer(function(sessionDescription) {
                sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
                peer.setLocalDescription(sessionDescription);
                options.onAnswerSDP(sessionDescription);
                console.debug('answer-sdp', sessionDescription.sdp);
            }, onSdpError, sdpConstraints);
        }

        // options.bandwidth = { audio: 50, video: 256, data: 30 * 1000 * 1000 }
        var bandwidth = options.bandwidth;

        function setBandwidth(sdp) {
            if (moz || !bandwidth /* || navigator.userAgent.match( /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i ) */ ) return sdp;

            // remove existing bandwidth lines
            sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');

            if (bandwidth.audio) {
                sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
            }

            if (bandwidth.video) {
                sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.video + '\r\n');
            }

            if (bandwidth.data) {
                sdp = sdp.replace(/a=mid:data\r\n/g, 'a=mid:data\r\nb=AS:' + bandwidth.data + '\r\n');
            }

            return sdp;
        }

        // DataChannel management
        var channel;

        if (!!options.onChannelMessage) {
            peer.ondatachannel = function(event) {
                channel = event.channel;
                setChannelEvents();
            };
            openOffererChannel();
        }
        
        createOffer();
        createAnswer();

        function openOffererChannel() {
            channel = peer.createDataChannel(options.channel || 'RTCDataChannel', {});
            setChannelEvents();
        }

        function setChannelEvents() {
            channel.onmessage = function(event) {
                if (options.onChannelMessage) options.onChannelMessage(event);
            };

            channel.onopen = function() {
                if (options.onChannelOpened && !options.onChannelOpenInvoked) {
                    options.onChannelOpenInvoked = true;
                    options.onChannelOpened(channel);
                }
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

        function onSdpSuccess() {}

        function onSdpError(e) {
            console.error('onSdpError:', JSON.stringify(e, null, '\t'));
        }

        return {
            addAnswerSDP: function(sdp) {
                console.debug('adding answer-sdp', sdp.sdp);
                peer.setRemoteDescription(new SessionDescription(sdp), onSdpSuccess, onSdpError);
            },
            addICE: function(candidate) {
                peer.addIceCandidate(new IceCandidate({
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
        mandatory: {},
        optional: []
    };

    window.getUserMedia = function(options) {
        var n = navigator,
            media;
        n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
        n.getMedia(options.constraints || {
            audio: true,
            video: video_constraints
        }, streaming, options.onerror || function(e) {
            console.error(e);
        });

        function streaming(stream) {
            var video = options.video;
            if (video) {
                video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
                video.play();
            }
            options.onsuccess && options.onsuccess(stream);
            media = stream;
        }

        return media;
    }
})();

function listenEventHandler(eventName, eventHandler) {
    window.removeEventListener(eventName, eventHandler);
    window.addEventListener(eventName, eventHandler, false);
}

var loadedIceFrame;

function loadIceFrame(callback) {
    if (loadedIceFrame) {
        return;
    }

    loadedIceFrame = true;

    var iframe = document.createElement('iframe');
    iframe.onload = function() {
        iframe.isLoaded = true;

        listenEventHandler('message', iFrameLoaderCallback);

        function iFrameLoaderCallback(event) {
            if (!event.data || !event.data.iceServers) {
                return;
            }
            callback(event.data.iceServers);

            // this event listener is no more needed
            window.removeEventListener('message', iFrameLoaderCallback);
        }

        iframe.contentWindow.postMessage('get-ice-servers', '*');
    };
    iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
    iframe.style.display = 'none';
    (document.body || document.documentElement).appendChild(iframe);
}

RTCPeerConnection.iceServers = [];

RTCPeerConnection.iceServers.push({
    url: 'stun:stun.l.google.com:19302'
});

RTCPeerConnection.iceServers.push({
    url: 'stun:stun.anyfirewall.com:3478'
});

RTCPeerConnection.iceServers.push({
    url: 'turn:turn.bistri.com:80',
    credential: 'homeo',
    username: 'homeo'
});

RTCPeerConnection.iceServers.push({
    url: 'turn:turn.anyfirewall.com:443?transport=tcp',
    credential: 'webrtc',
    username: 'webrtc'
});

loadIceFrame(function(servers) {
    RTCPeerConnection.iceServers = RTCPeerConnection.iceServers.concat(servers);
});
