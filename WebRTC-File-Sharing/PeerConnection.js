// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/WebRTC-Experiment/tree/master/WebRTC-File-Sharing

// _______
// PeerConnection.js
(function() {

    window.PeerConnection = function(socketURL, userid) {
        this.userid = userid || getToken();
        this.peers = { };

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

        var candidates = [];
        // if someone shared ICE
        this.onice = function(message) {
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
            root.peers = { };
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
        var invokers = { };

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

    var isFirefox = !!navigator.mozGetUserMedia;
    var isChrome = !!navigator.webkitGetUserMedia;

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
        if (parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]) >= 28)
            TURN = {
                url: 'turn:turn.bistri.com:80',
                credential: 'homeo',
                username: 'homeo'
            };

        iceServers.iceServers = [STUN, TURN];
    }

    var optionalArgument = {
        optional: [{
            DtlsSrtpKeyAgreement: true
        }]
    };

    var offerAnswerConstraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: !!isFirefox,
            OfferToReceiveVideo: !!isFirefox
        }
    };

    function getToken() {
        return Math.round(Math.random() * 9999999999) + 9999999999;
    }

    function setChannelEvents(channel, config) {
        channel.onmessage = function(event) {
            var data = JSON.parse(event.data);
            config.ondata(data);
        };
        channel.onopen = function() {
            config.onopen();

            channel.push = channel.send;
            channel.send = function(data) {
                channel.push(JSON.stringify(data));
            };
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

    var dataChannelDict = {
        
    //protocol: 'text/chat',
    //preset: true,
    //stream: 16
    };

    var offererDataChannel;

    var Offer = {
        createOffer: function(config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            if (isFirefox) {
                navigator.mozGetUserMedia({
                        audio: true,
                        fake: true
                    }, function(stream) {
                        peer.addStream(stream);
                    }, useless);
            }

            offererDataChannel = peer.createDataChannel('channel', dataChannelDict);
            setChannelEvents(offererDataChannel, config);

            peer.onicecandidate = function(event) {
                if (event.candidate)
                    config.onicecandidate(event.candidate);
            };

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
        }
    };

    var answererDataChannel;

    var Answer = {
        createAnswer: function(config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);
            peer.ondatachannel = function(event) {
                answererDataChannel = event.channel;
                setChannelEvents(answererDataChannel, config);
            };

            peer.onicecandidate = function(event) {
                if (event.candidate)
                    config.onicecandidate(event.candidate);
            };

            if (isFirefox) {
                navigator.mozGetUserMedia({
                        audio: true,
                        fake: true
                    }, function(stream) {
                        peer.addStream(stream);
                    }, useless);
            }

            peer.setRemoteDescription(new RTCSessionDescription(config.sdp));
            peer.createAnswer(function(sdp) {
                peer.setLocalDescription(sdp);
                config.onsdp(sdp);
            }, onSdpError, offerAnswerConstraints);

            this.peer = peer;

            return this;
        },
        addIceCandidate: function(candidate) {
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

    function useless() {}

    function onSdpError() {}
})();
