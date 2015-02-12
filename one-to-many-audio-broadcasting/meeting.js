// 2013, @muazkh - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/audio-broadcast

(function() {

    // a middle-agent between public API and the Signaler object
    window.Meeting = function(channel) {
        var signaler, self = this;
        this.channel = channel;

        // get alerted for each new meeting
        this.onmeeting = function(room) {
            if (self.detectedRoom) return;
            self.detectedRoom = true;

            self.meet(room);
        };

        function initSignaler() {
            signaler = new Signaler(self);
        }

        function captureUserMedia(callback) {
            var constraints = {
                audio: true,
                video: false
            };

            navigator.getUserMedia(constraints, onstream, onerror);

            function onstream(stream) {
                self.stream = stream;
                callback(stream);

                var audio = document.createElement('audio');
                audio.id = 'self';
                audio[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
                audio.autoplay = true;
                audio.controls = true;
                audio.play();

                self.onaddstream({
                    audio: audio,
                    stream: stream,
                    userid: 'self',
                    type: 'local'
                });
            }

            function onerror(e) {
                console.error(e);
            }
        }

        // setup new meeting room
        this.setup = function(roomid) {
            captureUserMedia(function() {
                !signaler && initSignaler();
                signaler.broadcast({
                    roomid: roomid || self.channel
                });
            });
        };

        // join pre-created meeting room
        this.meet = function(room) {
            captureUserMedia(function() {
                !signaler && initSignaler();
                signaler.join({
                    to: room.userid,
                    roomid: room.roomid
                });
            });
        };

        // check pre-created meeting rooms
        this.check = initSignaler;
    };

    // it is a backbone object

    function Signaler(root) {
        // unique session-id
        var channel = root.channel;

        // signalling implementation
        // if no custom signalling channel is provided; use Firebase
        if (!root.openSignalingChannel) {
            if (!window.Firebase) throw 'You must link <https://cdn.firebase.com/v0/firebase.js> file.';

            // Firebase is capable to store data in JSON format
            // root.transmitOnce = true;
            var socket = new window.Firebase('https://' + (root.firebase || 'signaling') + '.firebaseIO.com/' + channel);
            socket.on('child_added', function(snap) {
                var data = snap.val();
                if (data.userid != userid) {
                    if (data.leaving && root.onuserleft) root.onuserleft(data.userid);
                    else signaler.onmessage(data);
                }

                // we want socket.io behavior; 
                // that's why data is removed from firebase servers 
                // as soon as it is received
                // data.userid != userid && 
                if (data.userid != userid) snap.ref().remove();
            });

            // method to signal the data
            this.signal = function(data) {
                data.userid = userid;
                socket.push(data);
            };
        } else {
            // custom signalling implementations
            // e.g. WebSocket, Socket.io, SignalR, WebSycn, XMLHttpRequest, Long-Polling etc.
            var socket = root.openSignalingChannel(function(message) {
                message = JSON.parse(message);
                if (message.userid != userid) {
                    if (message.leaving && root.onuserleft) root.onuserleft(message.userid);
                    else signaler.onmessage(message);
                }
            });

            // method to signal the data
            this.signal = function(data) {
                data.userid = userid;
                socket.send(JSON.stringify(data));
            };
        }

        // unique identifier for the current user
        var userid = root.userid || getToken();

        // self instance
        var signaler = this;

        // object to store all connected peers
        var peers = { };

        // object to store ICE candidates for answerer
        var candidates = { };

        // it is called when your signalling implementation fires "onmessage"
        this.onmessage = function(message) {
            // if new room detected
            if (message.roomid && message.broadcasting && !signaler.sentParticipationRequest)
                root.onmeeting(message);

            else
                // for pretty logging
                console.debug(JSON.stringify(message, function(key, value) {
                    if (value.sdp) {
                        console.log(value.sdp.type, '————', value.sdp.sdp);
                        return '';
                    } else return value;
                }, '————'));

            // if someone shared SDP
            if (message.sdp && message.to == userid)
                this.onsdp(message);

            // if someone shared ICE
            if (message.candidate && message.to == userid)
                this.onice(message);

            // if someone sent participation request
            if (message.participationRequest && message.to == userid) {
                var _options = options;
                _options.to = message.userid;
                _options.stream = root.stream;
                peers[message.userid] = Offer.createOffer(_options);
            }
        };

        // if someone shared SDP
        this.onsdp = function(message) {
            var sdp = message.sdp;

            if (sdp.type == 'offer') {
                var _options = options;
                _options.stream = root.stream;
                _options.sdp = sdp;
                _options.to = message.userid;
                peers[message.userid] = Answer.createAnswer(_options);
            }

            if (sdp.type == 'answer') {
                peers[message.userid].setRemoteDescription(sdp);
            }
        };

        // if someone shared ICE
        this.onice = function(message) {
            var peer = peers[message.userid];
            if (!peer) {
                var candidate = candidates[message.userid];
                if (candidate) candidates[message.userid][candidate.length] = message.candidate;
                else candidates[message.userid] = [message.candidate];
            } else {
                peer.addIceCandidate(message.candidate);

                var _candidates = candidates[message.userid] || [];
                if (_candidates.length) {
                    for (var i = 0; i < _candidates.length; i++) {
                        peer.addIceCandidate(_candidates[i]);
                    }
                    candidates[message.userid] = [];
                }
            }
        };

        // it is passed over Offer/Answer objects for reusability
        var options = {
            onsdp: function(sdp, to) {
                signaler.signal({
                    sdp: sdp,
                    to: to
                });
            },
            onicecandidate: function(candidate, to) {
                signaler.signal({
                    candidate: candidate,
                    to: to
                });
            },
            onaddstream: function(stream, _userid) {
                console.debug('onaddstream', '>>>>>>', stream);

                var audio = document.createElement('audio');
                audio.id = _userid;
                audio[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
                audio.autoplay = true;
                audio.controls = true;

                audio.addEventListener('play', function() {
                    setTimeout(function() {
                        audio.muted = false;
                        audio.volume = 1;
                        afterRemoteStreamStartedFlowing();
                    }, 3000);
                }, false);

                audio.play();

                function afterRemoteStreamStartedFlowing() {
                    if (!root.onaddstream) return;
                    root.onaddstream({
                        audio: audio,
                        stream: stream,
                        userid: _userid,
                        type: 'remote'
                    });
                }
            }
        };

        // call only for session initiator
        this.broadcast = function(_config) {
            signaler.roomid = _config.roomid || getToken();
            signaler.isbroadcaster = true;
            (function transmit() {
                signaler.signal({
                    roomid: signaler.roomid,
                    broadcasting: true
                });

                !root.transmitOnce && setTimeout(transmit, 3000);
            })();

            // if broadcaster leaves; clear all JSON files from Firebase servers
            if (socket.onDisconnect) socket.onDisconnect().remove();
        };

        // called for each new participant
        this.join = function(_config) {
            signaler.roomid = _config.roomid;
            this.signal({
                participationRequest: true,
                to: _config.to
            });
            signaler.sentParticipationRequest = true;
        };

        unloadHandler(userid, signaler);
    }

    // reusable stuff
    var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.webkitURL || window.URL;

    var isFirefox = !!navigator.mozGetUserMedia;
    var isChrome = !!navigator.webkitGetUserMedia;

    var STUN = {
        url: isChrome ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
    };

    var TURN = {
        url: 'turn:webrtc%40live.com@numb.viagenie.ca',
        credential: 'muazkh'
    };

    var iceServers = {
        iceServers: [STUN]
    };

    if (isChrome) {
        if (parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]) >= 28)
            TURN = {
                url: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
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
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    function getToken() {
        return (Math.random() * new Date().getTime()).toString(36).replace( /\./g , '');
    }
	
	function onSdpSuccess() {}

    function onSdpError(e) {
        console.error('sdp error:', e.name, e.message);
    }

    // var offer = Offer.createOffer(config);
    // offer.setRemoteDescription(sdp);
    // offer.addIceCandidate(candidate);
    
    var Offer = {
        createOffer: function(config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            if (config.stream) peer.addStream(config.stream);
            if (config.onaddstream)
                peer.onaddstream = function(event) {
                    config.onaddstream(event.stream, config.to);
                };
            if (config.onicecandidate)
                peer.onicecandidate = function(event) {
                    if (event.candidate) config.onicecandidate(event.candidate, config.to);
                };

            peer.createOffer(function(sdp) {
                peer.setLocalDescription(sdp);
                if (config.onsdp) config.onsdp(sdp, config.to);
            }, onSdpError, offerAnswerConstraints);

            this.peer = peer;

            return this;
        },
        setRemoteDescription: function(sdp) {
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp), onSdpSuccess, onSdpError);
        },
        addIceCandidate: function(candidate) {
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };

    // var answer = Answer.createAnswer(config);
    // answer.setRemoteDescription(sdp);
    //answer.addIceCandidate(candidate);
    
    var Answer = {
        createAnswer: function(config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            if (config.stream) peer.addStream(config.stream);
            if (config.onaddstream)
                peer.onaddstream = function(event) {
                    config.onaddstream(event.stream, config.to);
                };
            if (config.onicecandidate)
                peer.onicecandidate = function(event) {
                    if (event.candidate) config.onicecandidate(event.candidate, config.to);
                };

            peer.setRemoteDescription(new RTCSessionDescription(config.sdp), onSdpSuccess, onSdpError);
            peer.createAnswer(function(sdp) {
                peer.setLocalDescription(sdp);
                if (config.onsdp) config.onsdp(sdp, config.to);
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

    function unloadHandler(userid, signaler) {
        window.onbeforeunload = function() {
            leaveRoom();
            // return 'You\'re leaving the session.';
        };

        window.onkeyup = function(e) {
            if (e.keyCode == 116)
                leaveRoom();
        };

        var anchors = document.querySelectorAll('a'),
            length = anchors.length;
        for (var i = 0; i < length; i++) {
            var a = anchors[i];
            if (a.href.indexOf('#') !== 0 && a.getAttribute('target') != '_blank')
                a.onclick = function() {
                    leaveRoom();
                };
        }

        function leaveRoom() {
            signaler.signal({
                leaving: true
            });
        }
    }
})();
