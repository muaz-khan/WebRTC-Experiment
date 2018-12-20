// Last time updated at November 17, 2018

// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - https://github.com/muaz-khan/FileBufferReader.js

// _________________
// PeerConnection.js

(function() {

    window.PeerConnection = function(socketURL, userid) {
        this.userid = userid || getToken();
        this.peers = {};

        if (!socketURL) throw 'Socket-URL is required.';

        var signaler = new Signaler(this, socketURL);

        var that = this;
        this.send = function(data) {
            var channel = answererDataChannel || offererDataChannel;

            if (channel.readyState != 'open') {
                return setTimeout(function() {
                    that.send(data);
                }, 1000);
            }
            channel.send(data);
        };

        signaler.ondata = function(data) {
            if (that.ondata) {
                that.ondata(data);
            }
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

                !self.participantFound && !self.stopBroadcasting && setTimeout(transmit, 3000);
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
                if(root.peers[userid] && root.peers[userid].peer) {
                    root.peers[userid].peer.close();
                }
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
            if (e.keyCode == 116) {
                root.close();
            }
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

    var RTCPeerConnection;
    if (typeof window.RTCPeerConnection !== 'undefined') {
        RTCPeerConnection = window.RTCPeerConnection;
    } else if (typeof mozRTCPeerConnection !== 'undefined') {
        RTCPeerConnection = mozRTCPeerConnection;
    } else if (typeof webkitRTCPeerConnection !== 'undefined') {
        RTCPeerConnection = webkitRTCPeerConnection;
    }

    var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
    var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

    var isChrome = !!navigator.webkitGetUserMedia;

    var iceServers = {
        iceServers: IceServersHandler.getIceServers(),
        iceTransportPolicy: 'all'
    };

    var optionalArgument = {
        optional: [{
            DtlsSrtpKeyAgreement: true
        }, {
            googImprovedWifiBwe: true
        }, {
            googScreencastMinBitrate: 300
        }, {
            googIPv6: true
        }, {
            googDscp: true
        }, {
            googCpuUnderuseThreshold: 55
        }, {
            googCpuOveruseThreshold: 85
        }, {
            googSuspendBelowMinBitrate: true
        }, {
            googCpuOveruseDetection: true
        }],
        mandatory: {}
    };

    var offerAnswerConstraints = {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false,

        optional: [],
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    };

    function getToken() {
        if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
            var a = window.crypto.getRandomValues(new Uint32Array(3)),
                token = '';
            for (var i = 0, l = a.length; i < l; i++) {
                token += a[i].toString(36);
            }
            return token;
        } else {
            return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
        }
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
            config.onerror(e);
        };

        channel.onclose = function(e) {
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
                if (event.candidate && event.candidate.candidate) {
                    config.onicecandidate(event.candidate);
                }
            };

            peer.onsignalingstatechange = function() {
                console.log('onsignalingstatechange:', JSON.stringify({
                    iceGatheringState: peer.iceGatheringState,
                    signalingState: peer.signalingState,
                    iceConnectionState: peer.iceConnectionState
                }));

                if (peer.iceConnectionState.search(/closed|failed/gi) !== -1) {
                    config.onclose();
                }
            };
            
            peer.oniceconnectionstatechange = function() {
                console.log('oniceconnectionstatechange:', JSON.stringify({
                    iceGatheringState: peer.iceGatheringState,
                    signalingState: peer.signalingState,
                    iceConnectionState: peer.iceConnectionState
                }));

                if (peer.iceConnectionState.search(/closed|failed/gi) !== -1) {
                    config.onclose();
                }
            };

            this.createDataChannel(peer);

            window.peer = peer;
            peer.createOffer(offerAnswerConstraints).then(function(sdp) {
                peer.setLocalDescription(sdp).then(function() {
                    config.onsdp(sdp);
                });
            }).catch(onSdpError);

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

            peer.setRemoteDescription(new RTCSessionDescription(config.sdp)).then(function() {
                peer.createAnswer(offerAnswerConstraints).then(function(sdp) {
                    peer.setLocalDescription(sdp).then(function() {
                        config.onsdp(sdp);
                    });
                }).catch(onSdpError);
            });

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
