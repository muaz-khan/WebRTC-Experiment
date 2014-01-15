// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/WebRTC-Experiment/tree/master/WebRTC-File-Sharing

// _______
// PeerConnection.js
(function () {

    window.PeerConnection = function (socketURL, userid) {
        this.userid = userid || getToken();
        this.peers = {};

        if (!socketURL) throw 'Socket-URL is mandatory.';

        var signaler = new Signaler(this, socketURL);

        var that = this;
        this.send = function (data) {
            var channel = answererDataChannel || offererDataChannel;

            if (channel.readyState != 'open')
                return setTimeout(function () {
                    that.send(data);
                }, 1000);
            channel.send(data);
        };

        signaler.ondata = function (data) {
            if (that.ondata) that.ondata(data);
        };

        this.onopen = function () {
            console.log('DataChannel Opened.');
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
                    sdp: sdp
                }));
            }

            if (sdp.type == 'answer') {
                root.peers[message.userid].setRemoteDescription(sdp);
            }
        };

        root.acceptRequest = function (userid) {
            root.peers[userid] = Offer.createOffer(options);
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
            askToCreateDataChannel: function () {
                socket.send({
                    userid: root.userid,
                    to: root.participant,
                    isCreateDataChannel: true
                });
            },
            ondata: function (data) {
                self.ondata(data);
            },
            onopen: function () {
                root.onopen();
            },
            onclose: function (e) {
                if (root.onclose) root.onclose(e);
            },
            onerror: function (e) {
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

        root.close = function () {
            socket.send({
                userLeft: true,
                userid: root.userid,
                to: root.participant
            });
            closePeerConnections();
        };

        window.onbeforeunload = function () {
            root.close();
        };

        window.onkeyup = function (e) {
            if (e.keyCode == 116)
                root.close();
        };

        // users who broadcasts themselves
        var invokers = {}, peer;
        
        function onmessage(e) {
            var message = JSON.parse(e.data);

            if (message.userid == root.userid) return;
            root.participant = message.userid;

            // for pretty logging
            message.sdp && console.debug(JSON.stringify(message, function (key, value) {
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

            // if offerer asked to create data channel
            if (message.isCreateDataChannel && message.to == root.userid) {
                peer = root.peers[message.userid];
                if (peer && isFirefox) peer.createDataChannel();
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
            socket.send = function (data) {
                if (socket.readyState != 1)
                    return setTimeout(function () {
                        socket.send(data);
                    }, 1000);

                socket.push(JSON.stringify(data));
            };

            socket.onopen = function () {
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

    var iceServers = [];

        if (isChrome && parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]) >= 28) {
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
        }

        iceServers.push({ url: 'stun:stun.l.google.com:19302' }, { url: 'stun:stun.sipgate.net' }, { url: 'stun:217.10.68.152' }, { url: 'stun:stun.sipgate.net:10000' }, { url: 'stun:217.10.68.152:10000' });
        iceServers.push({ url: 'stun:23.21.150.121:3478' }, { url: 'stun:216.93.246.18:3478' }, { url: 'stun:66.228.45.110:3478' }, { url: 'stun:173.194.78.127:19302' });
        iceServers.push({ url: 'stun:74.125.142.127:19302' }, { url: 'stun:provserver.televolution.net' }, { url: 'stun:sip1.lakedestiny.cordiaip.com' }, { url: 'stun:stun1.voiceeclipse.net' }, { url: 'stun:stun01.sipphone.com' }, { url: 'stun:stun.callwithus.com' }, { url: 'stun:stun.counterpath.net' }, { url: 'stun:stun.endigovoip.com' });

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
            OfferToReceiveAudio: !!isFirefox,
            OfferToReceiveVideo: !!isFirefox
        }
    };

    function getToken() {
        return Math.round(Math.random() * 9999999999) + 9999999999;
    }

    function setChannelEvents(channel, config) {
        channel.onmessage = function (event) {
            var data = JSON.parse(event.data);
            config.ondata(data);
        };
        channel.onopen = function () {
            config.onopen();

            channel.push = channel.send;
            channel.send = function (data) {
                channel.push(JSON.stringify(data));
            };
        };

        channel.onerror = function (e) {
            console.error('channel.onerror', JSON.stringify(e, null, '\t'));
            config.onerror(e);
        };

        channel.onclose = function (e) {
            console.warn('channel.onclose', JSON.stringify(e, null, '\t'));
            config.onclose(e);
        };
    }

    var dataChannelDict = {};
    var offererDataChannel;

    var Offer = {
        createOffer: function (config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            var self = this;
            self.config = config;

            peer.ongatheringchange = function (event) {
                if (event.currentTarget && event.currentTarget.iceGatheringState === 'complete') returnSDP();
            };

            function returnSDP() {
                console.debug('sharing localDescription', peer.localDescription);
                config.onsdp(peer.localDescription);
            }

            if (isFirefox) {
                peer.ondatachannel = function (event) {
                    offererDataChannel = event.channel;
                    setChannelEvents(offererDataChannel, config);
                };

                peer.onconnection = function () {
                    config.askToCreateDataChannel();
                };
            }

            peer.onicecandidate = function (event) {
                if (!event.candidate) returnSDP();
                else console.debug('injecting ice in sdp:', event.candidate.candidate);
            };

            peer.onsignalingstatechange = function () {
                console.log('onsignalingstatechange:', JSON.stringify({
                    iceGatheringState: peer.iceGatheringState,
                    signalingState: peer.signalingState
                }));
            };
            peer.oniceconnectionstatechange = function () {
                console.log('oniceconnectionstatechange:', JSON.stringify({
                    iceGatheringState: peer.iceGatheringState,
                    signalingState: peer.signalingState
                }));
            };

            if (isFirefox) {
                navigator.mozGetUserMedia({
                    audio: true,
                    fake: true
                }, function (stream) {
                    peer.addStream(stream);
                    createOffer();
                }, useless);
            } else createOffer();

            function createOffer() {
                self.createDataChannel(peer);

                window.peer = peer;
                peer.createOffer(function (sdp) {
                    if (isFirefox) config.onsdp(sdp);
                    peer.setLocalDescription(sdp);
                }, onSdpError, isFirefox ? offerAnswerConstraints : null);

                self.peer = peer;
            }

            return self;
        },
        setRemoteDescription: function (sdp) {
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
        },
        addIceCandidate: function (candidate) {
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        },
        createDataChannel: function (peer) {
            offererDataChannel = (this.peer || peer).createDataChannel('channel', dataChannelDict);
            setChannelEvents(offererDataChannel, this.config);
        }
    };

    var answererDataChannel;

    var Answer = {
        createAnswer: function (config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            var self = this;
            self.config = config;

            peer.ondatachannel = function (event) {
                answererDataChannel = event.channel;
                setChannelEvents(answererDataChannel, config);
            };

            peer.onicecandidate = function (event) {
                if (event.candidate)
                    config.onicecandidate(event.candidate);
            };

            peer.onsignalingstatechange = function () {
                console.log('onsignalingstatechange:', JSON.stringify({
                    iceGatheringState: peer.iceGatheringState,
                    signalingState: peer.signalingState
                }));
            };
            peer.oniceconnectionstatechange = function () {
                console.log('oniceconnectionstatechange:', JSON.stringify({
                    iceGatheringState: peer.iceGatheringState,
                    signalingState: peer.signalingState
                }));
            };

            if (isFirefox) {
                navigator.mozGetUserMedia({
                    audio: true,
                    fake: true
                }, function (stream) {
                    peer.addStream(stream);
                    createAnswer();
                }, useless);
            } else createAnswer();

            function createAnswer() {
                peer.setRemoteDescription(new RTCSessionDescription(config.sdp));
                peer.createAnswer(function (sdp) {
                    config.onsdp(sdp);
                    peer.setLocalDescription(sdp);
                }, onSdpError, isFirefox ? offerAnswerConstraints : null);

                self.peer = peer;
            }

            return self;
        },
        addIceCandidate: function (candidate) {
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        },
        createDataChannel: function (peer) {
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

    function useless() {
    }

    function onSdpError(e) {
        console.error(e);
    }
})();
