// Last time updated at July 22, 2014, 08:32:23

// Latest file can be found here: https://cdn.webrtc-experiment.com/meeting.js

// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/meeting

// __________
// meeting.js

(function () {

    // a middle-agent between public API and the Signaler object
    window.Meeting = function (channel) {
        var signaler, self = this;
        this.channel = channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');

        // get alerted for each new meeting
        this.onmeeting = function (room) {
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
                video: true
            };

            navigator.getUserMedia(constraints, onstream, onerror);

            function onstream(stream) {
                stream.onended = function () {
                    if (self.onuserleft) self.onuserleft('self');
                };

                self.stream = stream;

                var video = document.createElement('video');
                video.id = 'self';
                video[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
                video.autoplay = true;
                video.controls = true;
                video.muted = true;
                video.volume = 0;
                video.play();

                self.onaddstream({
                    video: video,
                    stream: stream,
                    userid: 'self',
                    type: 'local'
                });

                callback(stream);
            }

            function onerror(e) {
                console.error(e);
            }
        }

        // setup new meeting room
        this.setup = function (roomid) {
            captureUserMedia(function () {
                !signaler && initSignaler();
                signaler.broadcast({
                    roomid: roomid || self.channel
                });
            });
        };

        // join pre-created meeting room
        this.meet = function (room) {
            captureUserMedia(function () {
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
        // unique identifier for the current user
        var userid = root.userid || getToken();

        // self instance
        var signaler = this;

        // object to store all connected peers
        var peers = {};

        // object to store all connected participants's ids
        var participants = {};

        // it is called when your signaling implementation fires "onmessage"
        this.onmessage = function (message) {
            // if new room detected
            if (message.roomid && message.broadcasting && !signaler.sentParticipationRequest)
                root.onmeeting(message);

            else
            // for pretty logging
                console.debug(JSON.stringify(message, function (key, value) {
                if (value && value.sdp) {
                    console.log(value.sdp.type, '---', value.sdp.sdp);
                    return '';
                } else return value;
            }, '---'));

            // if someone shared SDP
            if (message.sdp && message.to == userid) {
                this.onsdp(message);
            }

            // if someone shared ICE
            if (message.candidate && message.to == userid)
                this.onice(message);

            // if someone sent participation request
            if (message.participationRequest && message.to == userid) {
                participationRequest(message.userid);
            }

            // session initiator transmitted new participant's details
            // it is useful for multi-user connectivity
            if (message.conferencing && message.newcomer != userid && !!participants[message.newcomer] == false) {
                participants[message.newcomer] = message.newcomer;
                root.stream && signaler.signal({
                    participationRequest: true,
                    to: message.newcomer
                });
            }
        };

        function participationRequest(_userid) {
            // it is appeared that 10 or more users can send 
            // participation requests concurrently
            // onicecandidate fails in such case
            if (!signaler.creatingOffer) {
                signaler.creatingOffer = true;
                createOffer(_userid);
                setTimeout(function () {
                    signaler.creatingOffer = false;
                    if (signaler.participants &&
                        signaler.participants.length) repeatedlyCreateOffer();
                }, 1000);
            } else {
                if (!signaler.participants) signaler.participants = [];
                signaler.participants[signaler.participants.length] = _userid;
            }
        }

        // reusable function to create new offer

        function createOffer(to) {
            var _options = options;
            _options.to = to;
            _options.stream = root.stream;
            peers[to] = Offer.createOffer(_options);
        }

        // reusable function to create new offer repeatedly

        function repeatedlyCreateOffer() {
            var firstParticipant = signaler.participants[0];
            if (!firstParticipant) return;

            signaler.creatingOffer = true;
            createOffer(firstParticipant);

            // delete "firstParticipant" and swap array
            delete signaler.participants[0];
            signaler.participants = swap(signaler.participants);

            setTimeout(function () {
                signaler.creatingOffer = false;
                if (signaler.participants[0])
                    repeatedlyCreateOffer();
            }, 1000);
        }

        // if someone shared SDP
        this.onsdp = function (message) {
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

        var candidates = [];
        // if someone shared ICE
        this.onice = function (message) {
            var peer = peers[message.userid];
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
            onsdp: function (sdp, to) {
                signaler.signal({
                    sdp: sdp,
                    to: to
                });
            },
            onicecandidate: function (candidate, to) {
                signaler.signal({
                    candidate: candidate,
                    to: to
                });
            },
            onaddstream: function (stream, _userid) {
                console.debug('onaddstream', '>>>>>>', stream);

                stream.onended = function () {
                    if (root.onuserleft) root.onuserleft(_userid);
                };

                var video = document.createElement('video');
                video.id = _userid;
                video[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
                video.autoplay = true;
                video.controls = true;
                video.play();

                function onRemoteStreamStartsFlowing() {
                    // chrome for android may have some features missing
                    if (navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i)) {
                        return afterRemoteStreamStartedFlowing();
                    }

                    if (!(video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || video.paused || video.currentTime <= 0)) {
                        afterRemoteStreamStartedFlowing();
                    } else
                        setTimeout(onRemoteStreamStartsFlowing, 300);
                }

                function afterRemoteStreamStartedFlowing() {
                    // for video conferencing
                    signaler.isbroadcaster &&
                        signaler.signal({
                            conferencing: true,
                            newcomer: _userid
                        });

                    if (!root.onaddstream) return;
                    root.onaddstream({
                        video: video,
                        stream: stream,
                        userid: _userid,
                        type: 'remote'
                    });
                }

                onRemoteStreamStartsFlowing();
            }
        };

        // call only for session initiator
        this.broadcast = function (_config) {
            signaler.roomid = _config.roomid || getToken();
            signaler.isbroadcaster = true;
            (function transmit() {
                signaler.signal({
                    roomid: signaler.roomid,
                    broadcasting: true
                });

                if (!signaler.stopBroadcasting && !root.transmitOnce)
                    setTimeout(transmit, 3000);
            })();

            // if broadcaster leaves; clear all JSON files from Firebase servers
            if (socket.onDisconnect) socket.onDisconnect().remove();
        };

        // called for each new participant
        this.join = function (_config) {
            signaler.roomid = _config.roomid;
            this.signal({
                participationRequest: true,
                to: _config.to
            });
            signaler.sentParticipationRequest = true;
        };

        window.onbeforeunload = function () {
            leaveRoom();
            // return 'You\'re leaving the session.';
        };

        window.onkeyup = function (e) {
            if (e.keyCode == 116)
                leaveRoom();
        };

        function leaveRoom() {
            signaler.signal({
                leaving: true
            });

            // stop broadcasting room
            if (signaler.isbroadcaster) signaler.stopBroadcasting = true;

            // leave user media resources
            if (root.stream) root.stream.stop();

            // if firebase; remove data from their servers
            if (window.Firebase) socket.remove();
        }
        root.leave = leaveRoom;

        var socket;

        // signaling implementation
        // if no custom signaling channel is provided; use Firebase
        if (!root.openSignalingChannel) {
            if (!window.Firebase) throw 'You must link <https://cdn.firebase.com/v0/firebase.js> file.';

            // Firebase is capable to store data in JSON format
            // root.transmitOnce = true;
            socket = new window.Firebase('https://' + (root.firebase || 'signaling') + '.firebaseIO.com/' + root.channel);
            socket.on('child_added', function (snap) {
                var data = snap.val();

                if (data.userid != userid) {
                    if (!data.leaving) signaler.onmessage(data);
                    else if (root.onuserleft) root.onuserleft(data.userid);
                }

                // we want socket.io behavior; 
                // that's why data is removed from firebase servers 
                // as soon as it is received
                // data.userid != userid && 
                if (data.userid != userid) snap.ref().remove();
            });

            // method to signal the data
            this.signal = function (data) {
                data.userid = userid;
                socket.push(data);
            };
        } else {
            // custom signaling implementations
            // e.g. WebSocket, Socket.io, SignalR, WebSycn, XMLHttpRequest, Long-Polling etc.
            socket = root.openSignalingChannel(function (message) {
                message = JSON.parse(message);
                if (message.userid != userid) {
                    if (!message.leaving) signaler.onmessage(message);
                    else if (root.onuserleft) root.onuserleft(message.userid);
                }
            });

            // method to signal the data
            this.signal = function (data) {
                data.userid = userid;
                socket.send(JSON.stringify(data));
            };
        }
    }

    // reusable stuff
    var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.webkitURL || window.URL;

    var isFirefox = !!navigator.mozGetUserMedia;
    var isChrome = !!navigator.webkitGetUserMedia;

    var iceServers = [];

    iceServers.push({
        url: 'stun:stun.l.google.com:19302'
    });

    iceServers.push({
        url: 'stun:stun.anyfirewall.com:3478'
    });

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

    var iceServersObject = {
        iceServers: iceServers
    };

    loadIceFrame(function (iceServers) {
        iceServersObject.iceServers = iceServersObject.iceServers.concat(iceServers);
    });

    var iceFrame, loadedIceFrame;

    function loadIceFrame(callback, skip) {
        if (loadedIceFrame) return;
        if (!skip) return loadIceFrame(callback, true);

        loadedIceFrame = true;

        var iframe = document.createElement('iframe');
        iframe.onload = function () {
            iframe.isLoaded = true;

            window.addEventListener('message', function (event) {
                if (!event.data || !event.data.iceServers) return;
                callback(event.data.iceServers);
            });

            iframe.contentWindow.postMessage('get-ice-servers', '*');
        };
        iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
        iframe.style.display = 'none';
        (document.body || document.documentElement).appendChild(iframe);
    };

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
        return Math.round(Math.random() * 9999999999) + 9999999999;
    }

    function onSdpSuccess() {}

    function onSdpError(e) {
        console.error('sdp error:', JSON.stringify(e, null, '\t'));
    }

    // var offer = Offer.createOffer(config);
    // offer.setRemoteDescription(sdp);
    // offer.addIceCandidate(candidate);
    var Offer = {
        createOffer: function (config) {
            var peer = new RTCPeerConnection(iceServersObject, optionalArgument);

            if (config.stream) peer.addStream(config.stream);

            peer.onaddstream = function (event) {
                config.onaddstream(event.stream, config.to);
            };

            peer.onicecandidate = function (event) {
                config.onicecandidate(event.candidate, config.to);
            };

            peer.createOffer(function (sdp) {
                peer.setLocalDescription(sdp);
                config.onsdp(sdp, config.to);
            }, onSdpError, offerAnswerConstraints);

            function sdpCallback() {
                config.onsdp(peer.localDescription, config.to);
            }

            this.peer = peer;

            return this;
        },
        setRemoteDescription: function (sdp) {
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp), onSdpSuccess, onSdpError);
        },
        addIceCandidate: function (candidate) {
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };

    // var answer = Answer.createAnswer(config);
    // answer.setRemoteDescription(sdp);
    // answer.addIceCandidate(candidate);
    var Answer = {
        createAnswer: function (config) {
            var peer = new RTCPeerConnection(iceServersObject, optionalArgument);

            if (config.stream) peer.addStream(config.stream);

            peer.onaddstream = function (event) {
                config.onaddstream(event.stream, config.to);
            };

            peer.onicecandidate = function (event) {
                config.onicecandidate(event.candidate, config.to);
            };

            peer.setRemoteDescription(new RTCSessionDescription(config.sdp), onSdpSuccess, onSdpError);
            peer.createAnswer(function (sdp) {
                peer.setLocalDescription(sdp);
                config.onsdp(sdp, config.to);
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

    // swap arrays

    function swap(arr) {
        var swapped = [],
            length = arr.length;
        for (var i = 0; i < length; i++)
            if (arr[i] && arr[i] !== true)
                swapped[swapped.length] = arr[i];
        return swapped;
    }
})();
