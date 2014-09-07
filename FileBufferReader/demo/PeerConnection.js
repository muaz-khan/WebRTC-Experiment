// Last time updated at Sep 06, 2014, 08:32:23

// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - https://github.com/muaz-khan/FileBufferReader.js

// _________________
// PeerConnection.js

(function() {

    window.PeerConnection = function(socketURL, userid) {
        this.userid = userid || getToken();
        this.peers = {};

        if (!socketURL) throw 'Socket-URL is mandatory.';

        var signaler = new Signaler(this, socketURL);

        var that = this;
        this.send = function(data) {
            var channel = answererDataChannel || offererDataChannel;

            if (channel.readyState != 'open')
                return setTimeout(function() {
                    that.send(data);
                }, 1000);
            channel.send(data);
        };

        signaler.ondata = function(data) {
            if (that.ondata) that.ondata(data);
        };

        this.onopen = function() {
            console.log('DataChannel Opened.');
        };
    };

    function Signaler(root, socketURL) {
        var self = this;

        root.startBroadcasting = function() {
            (function transmit() {
                socket.send({
                    userid: root.userid,
                    broadcasting: true
                });

                !self.participantFound && !self.stopBroadcasting &&
                    setTimeout(transmit, 3000);
            })();
        };

        root.sendParticipationRequest = function(userid) {
            socket.send({
                participationRequest: true,
                userid: root.userid,
                to: userid
            });
        };

        // if someone shared SDP
        this.onsdp = function(message) {
            var sdp = message.sdp;

            if (sdp.type == 'offer') {
                root.peers[message.userid] = Answer.createAnswer(merge(options, {
                    sdp: sdp
                }));
            }

            if (sdp.type == 'answer') {
                root.peers[message.userid].setRemoteDescription(sdp);
            }
        };

        root.acceptRequest = function(userid) {
            root.peers[userid] = Offer.createOffer(options);
        };

        // it is passed over Offer/Answer objects for reusability
        var options = {
            onsdp: function(sdp) {
                socket.send({
                    userid: root.userid,
                    sdp: sdp,
                    to: root.participant
                });
            },
            onicecandidate: function(candidate) {
                socket.send({
                    userid: root.userid,
                    candidate: candidate,
                    to: root.participant
                });
            },
            ondata: function(data) {
                self.ondata(data);
            },
            onopen: function() {
                root.onopen();
            },
            onclose: function(e) {
                if (root.onclose) root.onclose(e);
            },
            onerror: function(e) {
                if (root.onerror) root.onerror(e);
            }
        };

        function closePeerConnections() {
            self.stopBroadcasting = true;

            for (var userid in root.peers) {
                root.peers[userid].peer.close();
            }
            root.peers = {};
        }

        root.close = function() {
            socket.send({
                userLeft: true,
                userid: root.userid,
                to: root.participant
            });
            closePeerConnections();
        };

        window.onbeforeunload = function() {
            root.close();
        };

        window.onkeyup = function(e) {
            if (e.keyCode == 116)
                root.close();
        };

        // users who broadcasts themselves
        var invokers = {},
            peer;

        function onmessage(e) {
            var message = JSON.parse(e.data);

            if (message.userid == root.userid) return;
            root.participant = message.userid;

            // for pretty logging
            message.sdp && console.debug(JSON.stringify(message, function(key, value) {
                console.log(value.sdp.type, '---', value.sdp.sdp);
            }, '---'));

            // if someone shared SDP
            if (message.sdp && message.to == root.userid) {
                self.onsdp(message);
            }

            // if someone shared ICE
            if (message.candidate && message.to == root.userid) {
                peer = root.peers[message.userid];
                if (peer) peer.addIceCandidate(message.candidate);
            }

            // if someone sent participation request
            if (message.participationRequest && message.to == root.userid) {
                self.participantFound = true;

                if (root.onParticipationRequest) {
                    root.onParticipationRequest(message.userid);
                } else root.acceptRequest(message.userid);
            }

            // if someone is broadcasting himself!
            if (message.broadcasting) {
                if (!invokers[message.userid]) {
                    invokers[message.userid] = message;
                    if (root.onuserfound)
                        root.onuserfound(message.userid);
                    else
                        root.sendParticipationRequest(message.userid);
                }
            }

            if (message.userLeft && message.to == root.userid) {
                closePeerConnections();
            }
        }

        var socket = socketURL;
        if (typeof socketURL == 'string') {
            socket = new WebSocket(socketURL);
            socket.push = socket.send;
            socket.send = function(data) {
                if (socket.readyState != 1)
                    return setTimeout(function() {
                        socket.send(data);
                    }, 1000);

                socket.push(JSON.stringify(data));
            };

            socket.onopen = function() {
                console.log('websocket connection opened.');
            };
        }
        socket.onmessage = onmessage;
    }

    var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

    window.URL = window.webkitURL || window.URL;

    var isChrome = !!navigator.webkitGetUserMedia;

    var iceServers = [];

    iceServers.push({
        url: 'turn:turn.bistri.com:80',
        credential: 'homeo',
        username: 'homeo'
    });

    iceServers.push({
        url: 'turn:turn.anyfirewall.com:443?transport=tcp',
        credential: 'webrtc',
        username: 'webrtc'
    });

    iceServers.push({
        url: 'stun:stun.l.google.com:19302'
    });

    iceServers = {
        iceServers: iceServers
    };

    var optionalArgument = {
        optional: [{
            DtlsSrtpKeyAgreement: true
        }]
    };

    var offerAnswerConstraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    };

    function getToken() {
        return Math.round(Math.random() * 9999999999) + 9999999999;
    }

    function setChannelEvents(channel, config) {
        channel.binaryType = 'arraybuffer';
        channel.onmessage = function(event) {
            config.ondata(event.data);
        };
        channel.onopen = function() {
            config.onopen();
        };

        channel.onerror = function(e) {
            console.error('channel.onerror', JSON.stringify(e, null, '\t'));
            config.onerror(e);
        };

        channel.onclose = function(e) {
            console.warn('channel.onclose', JSON.stringify(e, null, '\t'));
            config.onclose(e);
        };
    }

    var dataChannelDict = {};
    var offererDataChannel;

    var Offer = {
        createOffer: function(config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            var self = this;
            self.config = config;

            peer.onicecandidate = function(event) {
                if (event.candidate)
                    config.onicecandidate(event.candidate);
            };

            peer.onsignalingstatechange = function() {
                console.log('onsignalingstatechange:', JSON.stringify({
                    iceGatheringState: peer.iceGatheringState,
                    signalingState: peer.signalingState
                }));
            };
            peer.oniceconnectionstatechange = function() {
                console.log('oniceconnectionstatechange:', JSON.stringify({
                    iceGatheringState: peer.iceGatheringState,
                    signalingState: peer.signalingState
                }));
            };

            this.createDataChannel(peer);

            window.peer = peer;
            peer.createOffer(function(sdp) {
                peer.setLocalDescription(sdp);
                config.onsdp(sdp);
            }, onSdpError, offerAnswerConstraints);

            this.peer = peer;

            return this;
        },
        setRemoteDescription: function(sdp) {
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
        },
        addIceCandidate: function(candidate) {
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        },
        createDataChannel: function(peer) {
            offererDataChannel = (this.peer || peer).createDataChannel('channel', dataChannelDict);
            setChannelEvents(offererDataChannel, this.config);
        }
    };

    var answererDataChannel;

    var Answer = {
        createAnswer: function(config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            var self = this;
            self.config = config;

            peer.ondatachannel = function(event) {
                answererDataChannel = event.channel;
                setChannelEvents(answererDataChannel, config);
            };

            peer.onicecandidate = function(event) {
                if (event.candidate)
                    config.onicecandidate(event.candidate);
            };

            peer.onsignalingstatechange = function() {
                console.log('onsignalingstatechange:', JSON.stringify({
                    iceGatheringState: peer.iceGatheringState,
                    signalingState: peer.signalingState
                }));
            };
            peer.oniceconnectionstatechange = function() {
                console.log('oniceconnectionstatechange:', JSON.stringify({
                    iceGatheringState: peer.iceGatheringState,
                    signalingState: peer.signalingState
                }));
            };

            peer.setRemoteDescription(new RTCSessionDescription(config.sdp));
            peer.createAnswer(function(sdp) {
                peer.setLocalDescription(sdp);
                config.onsdp(sdp);
            }, onSdpError, offerAnswerConstraints);

            this.peer = peer;

            return self;
        },
        addIceCandidate: function(candidate) {
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        },
        createDataChannel: function(peer) {
            answererDataChannel = (this.peer || peer).createDataChannel('channel', dataChannelDict);
            setChannelEvents(answererDataChannel, this.config);
        }
    };

    function merge(mergein, mergeto) {
        for (var t in mergeto) {
            mergein[t] = mergeto[t];
        }
        return mergein;
    }

    function useless() {}

    function onSdpError(e) {
        console.error(e);
    }
})();
