// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/screen-sharing
(function () {

    // a middle-agent between public API and the Signaler object
    window.Screen = function (channel) {
        var signaler, self = this;
        this.channel = channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');

        // get alerted for each new meeting
        this.onscreen = function (screen) {
            if (self.detectedRoom) return;
            self.detectedRoom = true;

            self.view(screen);
        };

        function initSignaler(roomid) {
            signaler = new Signaler(self, (roomid && roomid.length) || self.channel);
        }

        function captureUserMedia(callback, extensionAvailable) {
            var screen_constraints = {
                mandatory: {
                    chromeMediaSource: DetectRTC.screen.chromeMediaSource,
                    maxWidth: 1920,
                    maxHeight: 1080,
                    minAspectRatio: 1.77
                },
                optional: []
            };

            // try to check if extension is installed.
            if (typeof extensionAvailable == 'undefined' && DetectRTC.screen.chromeMediaSource != 'desktop') {
                DetectRTC.screen.isChromeExtensionAvailable(function (available) {
                    captureUserMedia(callback, available);
                });
                return;
            }

            if (DetectRTC.screen.chromeMediaSource == 'desktop' && !DetectRTC.screen.sourceId) {
                DetectRTC.screen.getSourceId(function (error) {
                    if (error && error == 'PermissionDeniedError') {
                        alert('PermissionDeniedError: User denied to share content of his screen.');
                    }

                    captureUserMedia(callback);
                });
                return;
            }

            if (DetectRTC.screen.chromeMediaSource == 'desktop') {
                screen_constraints.mandatory.chromeMediaSourceId = DetectRTC.screen.sourceId;
            }
            
            console.log('screen_constraints', JSON.stringify(screen_constraints, null, '\t'));

            var constraints = {
                audio: false,
                video: screen_constraints
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
                if (location.protocol === 'http:') {
                    alert('You\'re not testing it on SSL origin (HTTPS domain) otherwise you didn\'t enable --allow-http-screen-capture command-line flag on canary.');
                } else {
                    alert('Screen capturing is either denied or not supported. Please install chrome extension for screen capturing or run chrome with command-line flag: --enable-usermedia-screen-capturing');
                }
                console.error(e);
            }
        }

        // share new screen
        this.share = function (roomid) {
            captureUserMedia(function () {
                !signaler && initSignaler(roomid);
                signaler.broadcast({
                    roomid: (roomid && roomid.length) || self.channel,
                    userid: screen.userid
                });
            });
        };

        // view pre-shared screens
        this.view = function (room) {
            !signaler && initSignaler();
            signaler.join({
                to: room.userid,
                roomid: room.roomid
            });
        };

        // check pre-shared screens
        this.check = initSignaler;
    };

    // it is a backbone object

    function Signaler(root, roomid) {
        var socket;

        // unique identifier for the current user
        var userid = root.userid || getToken();

        // self instance
        var signaler = this;

        // object to store all connected peers
        var peers = {};

        // object to store ICE candidates for answerer
        var candidates = {};
        
        var numberOfParticipants = 0;

        // it is called when your signaling implementation fires "onmessage"
        this.onmessage = function (message) {
            // if new room detected
            if (message.roomid == roomid && message.broadcasting && !signaler.sentParticipationRequest)
                root.onscreen(message);

            else
            // for pretty logging
                console.debug(JSON.stringify(message, function (key, value) {
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
                
                numberOfParticipants++;
                
                if(root.onNumberOfParticipantsChnaged) root.onNumberOfParticipantsChnaged(numberOfParticipants);
            }
        };

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

        // if someone shared ICE
        this.onice = function (message) {
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
                    if (!(video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || video.paused || video.currentTime <= 0)) {
                        afterRemoteStreamStartedFlowing();
                    } else
                        setTimeout(onRemoteStreamStartsFlowing, 300);
                }

                function afterRemoteStreamStartedFlowing() {
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
            
            if(_config.userid) {
                userid = _config.userid;
            }
            
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
        
        window.addEventListener('beforeunload', function () {
            leaveRoom();
        }, false);

        window.addEventListener('keyup', function (e) {
            if (e.keyCode == 116) {
                leaveRoom();
            }
        }, false);

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

        // signaling implementation
        // if no custom signaling channel is provided; use Firebase
        if (!root.openSignalingChannel) {
            if (!window.Firebase) throw 'You must link <https://cdn.firebase.com/v0/firebase.js> file.';

            // Firebase is capable to store data in JSON format
            // root.transmitOnce = true;
            socket = new window.Firebase('https://' + (root.firebase || 'chat') + '.firebaseIO.com/' + root.channel);
            socket.on('child_added', function (snap) {
                var data = snap.val();
                if (data.userid != userid) {
                    if (!data.leaving) signaler.onmessage(data);
                    else {
                        numberOfParticipants--;
                        if(root.onNumberOfParticipantsChnaged) root.onNumberOfParticipantsChnaged( numberOfParticipants );
                        
                        root.onuserleft(data.userid);
                    }
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
                    else {
                        root.onuserleft(data.userid);
                        numberOfParticipants--;
                        if(root.onNumberOfParticipantsChnaged) root.onNumberOfParticipantsChnaged( numberOfParticipants );
                    }
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
        if (parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) >= 28)
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
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: true
        }
    };

    function getToken() {
        return Math.round(Math.random() * 9999999999) + 9999999999;
    }

    function onSdpSuccess() {}

    function onSdpError(e) {
        console.error('sdp error:', e.name, e.message);
    }

    // var offer = Offer.createOffer(config);
    // offer.setRemoteDescription(sdp);
    // offer.addIceCandidate(candidate);
    var Offer = {
        createOffer: function (config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            if (config.stream) peer.addStream(config.stream);
            if (config.onaddstream)
                peer.onaddstream = function (event) {
                    config.onaddstream(event.stream, config.to);
                };
            if (config.onicecandidate)
                peer.onicecandidate = function (event) {
                    if (event.candidate) config.onicecandidate(event.candidate, config.to);
                };

            peer.createOffer(function (sdp) {
                peer.setLocalDescription(sdp);
                if (config.onsdp) config.onsdp(sdp, config.to);
            }, onSdpError, offerAnswerConstraints);

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
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            if (config.stream) peer.addStream(config.stream);
            if (config.onaddstream)
                peer.onaddstream = function (event) {
                    config.onaddstream(event.stream, config.to);
                };
            if (config.onicecandidate)
                peer.onicecandidate = function (event) {
                    if (event.candidate) config.onicecandidate(event.candidate, config.to);
                };

            peer.setRemoteDescription(new RTCSessionDescription(config.sdp), onSdpSuccess, onSdpError);
            peer.createAnswer(function (sdp) {
                peer.setLocalDescription(sdp);
                if (config.onsdp) config.onsdp(sdp, config.to);
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

    // todo: need to check exact chrome browser because opera also uses chromium framework
    var isChrome = !!navigator.webkitGetUserMedia;

    // DetectRTC.js - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC
    // Below code is taken from RTCMultiConnection-v1.8.js (http://www.rtcmulticonnection.org/changes-log/#v1.8)
    var DetectRTC = {};

    (function () {

        function CheckDeviceSupport(callback) {
            // This method is useful only for Chrome!

            // 1st step: verify "MediaStreamTrack" support.
            if (!window.MediaStreamTrack && !navigator.getMediaDevices) {
                return;
            }

            if (!window.MediaStreamTrack && navigator.getMediaDevices) {
                window.MediaStreamTrack = {};
            }

            // 2nd step: verify "getSources" support which is planned to be removed soon!
            // "getSources" will be replaced with "getMediaDevices"
            if (!MediaStreamTrack.getSources) {
                MediaStreamTrack.getSources = MediaStreamTrack.getMediaDevices;
            }

            // todo: need to verify if this trick works
            // via: https://code.google.com/p/chromium/issues/detail?id=338511
            if (!MediaStreamTrack.getSources && navigator.getMediaDevices) {
                MediaStreamTrack.getSources = navigator.getMediaDevices.bind(navigator);
            }

            // if still no "getSources"; it MUST be firefox!
            if (!MediaStreamTrack.getSources) {
                // assuming that it is older chrome or chromium implementation
                if (isChrome) {
                    DetectRTC.hasMicrophone = true;
                    DetectRTC.hasWebcam = true;
                }

                return;
            }

            // loop over all audio/video input/output devices
            MediaStreamTrack.getSources(function (sources) {
                var result = {};

                for (var i = 0; i < sources.length; i++) {
                    result[sources[i].kind] = true;
                }

                DetectRTC.hasMicrophone = result.audio;
                DetectRTC.hasWebcam = result.video;

                if (callback) callback();
            });
        }

        // check for microphone/webcam support!
        CheckDeviceSupport();
        DetectRTC.load = CheckDeviceSupport;

        var screenCallback;

        DetectRTC.screen = {
            chromeMediaSource: 'screen',
            getSourceId: function (callback) {
                if (!callback) throw '"callback" parameter is mandatory.';
                screenCallback = callback;
                window.postMessage('get-sourceId', '*');
            },
            isChromeExtensionAvailable: function (callback) {
                if (!callback) return;

                if (DetectRTC.screen.chromeMediaSource == 'desktop') callback(true);

                // ask extension if it is available
                window.postMessage('are-you-there', '*');

                setTimeout(function () {
                    if (DetectRTC.screen.chromeMediaSource == 'screen') {
                        callback(false);
                    } else callback(true);
                }, 2000);
            },
            onMessageCallback: function (data) {
                console.log('chrome message', data);

                // "cancel" button is clicked
                if (data == 'PermissionDeniedError') {
                    DetectRTC.screen.chromeMediaSource = 'PermissionDeniedError';
                    if (screenCallback) return screenCallback('PermissionDeniedError');
                    else throw new Error('PermissionDeniedError');
                }

                // extension notified his presence
                if (data == 'rtcmulticonnection-extension-loaded') {
                    if (document.getElementById('install-button')) {
                        document.getElementById('install-button').parentNode.innerHTML = '<strong>Great!</strong> <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk" target="_blank">Google chrome extension</a> is installed.';
                    }
                    DetectRTC.screen.chromeMediaSource = 'desktop';
                }

                // extension shared temp sourceId
                if (data.sourceId) {
                    DetectRTC.screen.sourceId = data.sourceId;
                    if (screenCallback) screenCallback(DetectRTC.screen.sourceId);
                }
            }
        };

        // check if desktop-capture extension installed.
        if (window.postMessage && isChrome) {
            DetectRTC.screen.isChromeExtensionAvailable();
        }
    })();

    window.addEventListener('message', function (event) {
        if (event.origin != window.location.origin) {
            return;
        }

        DetectRTC.screen.onMessageCallback(event.data);
    });

    console.log('current chromeMediaSource', DetectRTC.screen.chromeMediaSource);
})();
