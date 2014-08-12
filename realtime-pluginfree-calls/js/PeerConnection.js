// WebRTC realtime Calls!!! (part of WebRTC Experiments by Muaz Khan!) @WebRTCWeb

// https://wwww.webrtc-experiment.com/

// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.webrtc-experiment.com/licence
// Experiments   - github.com/muaz-khan/WebRTC-Experiment

(function () {

    window.PeerConnection = function (socketURL, userid) {
        this.userid = userid || getToken();
        this.peers = {};

        if (!socketURL) throw 'Socket-URL is mandatory.';

        Signaler(this, socketURL);

        this.addStream = function (stream) {
            this.MediaStream = stream;
        };
    };

    function Signaler(root, socketURL) {
        var self = this;

        root.startBroadcasting = function () {
            (function transmit() {
                socket.send({
                    userid: root.userid,
                    broadcasting: true
                });

                !self.participantFound && !self.stopBroadcasting &&
                    setTimeout(transmit, 3000);
            })();
        };

        root.sendParticipationRequest = function (userid) {
            socket.send({
                participationRequest: true,
                userid: root.userid,
                to: userid
            });
        };

        // if someone shared SDP
        this.onsdp = function (message) {
            var sdp = message.sdp;

            if (sdp.type == 'offer') {
                root.peers[message.userid] = Answer.createAnswer(merge(options, {
                    MediaStream: root.MediaStream,
                    sdp: sdp
                }));
            }

            if (sdp.type == 'answer') {
                root.peers[message.userid].setRemoteDescription(sdp);
            }
        };

        root.acceptRequest = function (userid) {
            root.peers[userid] = Offer.createOffer(merge(options, {
                MediaStream: root.MediaStream
            }));
        };

        var candidates = [];
        // if someone shared ICE
        this.onice = function (message) {
            var peer = root.peers[message.userid];
            if (peer) {
                peer.addIceCandidate(message.candidate);
                for (var i = 0; i < candidates.length; i++) {
                    peer.addIceCandidate(candidates[i]);
                }
                candidates = [];
            } else candidates.push(candidates);
        };

        // it is passed over Offer/Answer objects for reusability
        var options = {
            onsdp: function (sdp) {
                socket.send({
                    userid: root.userid,
                    sdp: sdp,
                    to: root.participant
                });
            },
            onicecandidate: function (candidate) {
                socket.send({
                    userid: root.userid,
                    candidate: candidate,
                    to: root.participant
                });
            },
            onStreamAdded: function (stream) {
                console.debug('onStreamAdded', '>>>>>>', stream);

                stream.onended = function () {
                    if (root.onStreamEnded) root.onStreamEnded(streamObject);
                };

                var mediaElement = document.createElement(root.MediaStream.getVideoTracks().length ? 'video' : 'audio');
                mediaElement.id = root.participant;
                mediaElement[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
                mediaElement.autoplay = true;
                mediaElement.play();

                var streamObject = {
                    mediaElement: mediaElement,
                    stream: stream,
                    userid: root.participant,
                    type: 'remote'
                };

                function afterRemoteStreamStartedFlowing() {
                    if (!root.onStreamAdded) return;
                    root.onStreamAdded(streamObject);
                }

                afterRemoteStreamStartedFlowing();
            }
        };

        function closePeerConnections() {
            self.stopBroadcasting = true;
            if (root.MediaStream) root.MediaStream.stop();

            for (var userid in root.peers) {
                root.peers[userid].peer.close();
            }
            root.peers = {};
        }

        root.close = function () {
            socket.send({
                userLeft: true,
                userid: root.userid,
                to: root.participant
            });
            closePeerConnections();
        };

        window.addEventListener('beforeunload', function () {
            root.close();
        }, false);

        window.addEventListener('keyup', function (e) {
            if (e.keyCode == 116) {
                root.close();
            }
        }, false);

        function onmessage(message) {
            // if (message.userid == root.userid) return;

            if (message.customMessage) {
                if (root.onCustomMessage) root.onCustomMessage(message);
                return;
            }

            if (!root.participant) {
                root.participant = message.userid;
            }

            // for pretty logging
            console.debug(JSON.stringify(message, function (key, value) {
                if (value && value.sdp) {
                    console.log(value.sdp.type, '---', value.sdp.sdp);
                    return '';
                } else return value;
            }, '---'));

            // if someone shared SDP
            if (message.sdp && message.to == root.userid) {
                self.onsdp(message);
            }

            // if someone shared ICE
            if (message.candidate && message.to == root.userid) {
                self.onice(message);
            }

            // if someone sent participation request
            if (message.participationRequest && message.to == root.userid) {
                self.participantFound = true;

                if (root.onParticipationRequest) {
                    root.onParticipationRequest(message.userid);
                } else root.acceptRequest(message.userid);
            }

            // if someone is broadcasting himself!
            if (message.broadcasting && root.onUserFound) {
                root.onUserFound(message.userid);
            }

            if (message.userLeft && message.to == root.userid) {
                closePeerConnections();
            }
        }

        var socket = socketURL;
        if (typeof socketURL == 'string') {
            var socket = io.connect(socketURL);
            socket.send = function (data) {
                socket.emit(socketEvent, data);
            };
        }
        socket.on('message', function (data) {
            onmessage(data);
        });
    }

    var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.webkitURL || window.URL;

    var isFirefox = !! navigator.mozGetUserMedia;
    var isChrome = !! navigator.webkitGetUserMedia;

    var STUN = {
        url: isChrome ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
    };

    var TURN = {
        url: 'turn:homeo@turn.bistri.com:80',
        credential: 'homeo'
    };

    var iceServers = {
        iceServers: [STUN]
    };

    if (isChrome) {
        if (parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) >= 28) {
            TURN = {
                url: 'turn:turn.bistri.com:80',
                credential: 'homeo',
                username: 'homeo'
            };
        }

        iceServers.iceServers = [STUN, TURN];
    }

    if (isFirefox) {
        iceServers.iceServers = [STUN, {
            url: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'
        }];
    }

    var optionalArgument = {
        optional: [{
            DtlsSrtpKeyAgreement: true
        }]
    };

    var offerAnswerConstraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    function getToken() {
        if (window.crypto) {
            var a = window.crypto.getRandomValues(new Uint32Array(3)),
                token = '';
            for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
            return token;
        } else {
            return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
        }
    }

    function setBandwidth(sdp) {
        if (isFirefox) return sdp;

        // remove existing bandwidth lines
        sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
        sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:128\r\n'); // 128kbs
        sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:512\r\n'); // 512kbs

        return sdp;
    }

    var Offer = {
        createOffer: function (config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            if (config.MediaStream) peer.addStream(config.MediaStream);
            peer.onaddstream = function (event) {
                config.onStreamAdded(event.stream);
            };

            peer.onicecandidate = function (event) {
                config.onicecandidate(event.candidate);
            };
            
            peer.oniceconnectionstatechange = function() {
                console.log('oniceconnectionstatechange', JSON.stringify({
                    iceConnectionState: peer.iceConnectionState,
                    iceGatheringState: peer.iceGatheringState,
                    signalingState: peer.signalingState
                }, null, '\t'));
            };

            peer.createOffer(function (sdp) {
                sdp.sdp = setBandwidth(sdp.sdp);
                peer.setLocalDescription(sdp);
                config.onsdp(sdp);
            }, onSdpError, offerAnswerConstraints);

            this.peer = peer;

            return this;
        },
        setRemoteDescription: function (sdp) {
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
        },
        addIceCandidate: function (candidate) {
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };

    var Answer = {
        createAnswer: function (config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            if (config.MediaStream) peer.addStream(config.MediaStream);
            peer.onaddstream = function (event) {
                config.onStreamAdded(event.stream);
            };

            peer.onicecandidate = function (event) {
                config.onicecandidate(event.candidate);
            };
            
            peer.oniceconnectionstatechange = function() {
                console.log('oniceconnectionstatechange', JSON.stringify({
                    iceConnectionState: peer.iceConnectionState,
                    iceGatheringState: peer.iceGatheringState,
                    signalingState: peer.signalingState
                }, null, '\t'));
            };

            peer.setRemoteDescription(new RTCSessionDescription(config.sdp));
            peer.createAnswer(function (sdp) {
                sdp.sdp = setBandwidth(sdp.sdp);
                peer.setLocalDescription(sdp);
                config.onsdp(sdp);
            }, onSdpError, offerAnswerConstraints);

            this.peer = peer;

            return this;
        },
        addIceCandidate: function (candidate) {
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };

    function merge(mergein, mergeto) {
        for (var t in mergeto) {
            mergein[t] = mergeto[t];
        }
        return mergein;
    }

    function onSdpError() {}

    window.URL = window.webkitURL || window.URL;
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
})();
