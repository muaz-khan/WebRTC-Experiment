// Last time updated at March 06, 2015, 08:32:23

// Latest file can be found here: https://cdn.webrtc-experiment.com/screen.js

// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/screen-sharing

(function() {

    // a middle-agent between public API and the Signaler object
    window.Screen = function(channel) {
        var signaler, self = this;
        this.channel = channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');

        // get alerted for each new meeting
        this.onscreen = function(screen) {
            if (self.detectedRoom) return;
            self.detectedRoom = true;

            self.view(screen);
        };

        function initSignaler(roomid) {
            signaler = new Signaler(self, (roomid && roomid.length) || self.channel);
        }

        function captureUserMedia(callback, extensionAvailable) {
            getScreenId(function(error, sourceId, screen_constraints) {
                console.log('screen_constraints', JSON.stringify(screen_constraints, null, '\t'));
                navigator.getUserMedia(screen_constraints, function(stream) {
                    stream.onended = function() {
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
                }, function(error) {
                    if (isChrome && location.protocol === 'http:') {
                        alert('You\'re not testing it on SSL origin (HTTPS domain) otherwise you didn\'t enable --allow-http-screen-capture command-line flag on canary.');
                    } else if (isChrome) {
                        alert('Screen capturing is either denied or not supported. Please install chrome extension for screen capturing or run chrome with command-line flag: --enable-usermedia-screen-capturing');
                    } else if (isFirefox) {
                        alert(Firefox_Screen_Capturing_Warning);
                    }

                    console.error(e);
                });
            });
        }

        var Firefox_Screen_Capturing_Warning = 'Make sure that you are using Firefox Nightly and you enabled: media.getusermedia.screensharing.enabled flag from about:config page. You also need to add your domain in "media.getusermedia.screensharing.allowed_domains" flag.';

        // share new screen
        this.share = function(roomid) {
            captureUserMedia(function() {
                !signaler && initSignaler(roomid);
                signaler.broadcast({
                    roomid: (roomid && roomid.length) || self.channel,
                    userid: self.userid
                });
            });
        };

        // view pre-shared screens
        this.view = function(room) {
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
        this.onmessage = function(message) {
            // if new room detected
            if (message.roomid == roomid && message.broadcasting && !signaler.sentParticipationRequest)
                root.onscreen(message);

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

                numberOfParticipants++;

                if (root.onNumberOfParticipantsChnaged) root.onNumberOfParticipantsChnaged(numberOfParticipants);
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

                stream.onended = function() {
                    if (root.onuserleft) root.onuserleft(_userid);
                };

                var video = document.createElement('video');
                video.id = _userid;
                video[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
                video.autoplay = true;
                video.controls = true;
                video.play();

                function onRemoteStreamStartsFlowing() {
                    if(isMobileDevice) {
                        return afterRemoteStreamStartedFlowing();
                    }
                    
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
        this.broadcast = function(_config) {
            signaler.roomid = _config.roomid || getToken();

            if (_config.userid) {
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
        this.join = function(_config) {
            signaler.roomid = _config.roomid;
            this.signal({
                participationRequest: true,
                to: _config.to
            });
            signaler.sentParticipationRequest = true;
        };

        window.addEventListener('beforeunload', function() {
            leaveRoom();
        }, false);

        window.addEventListener('keyup', function(e) {
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
            socket = new window.Firebase('https://' + (root.firebase || 'signaling') + '.firebaseIO.com/' + root.channel);
            socket.on('child_added', function(snap) {
                var data = snap.val();
                if (data.userid != userid) {
                    if (!data.leaving) signaler.onmessage(data);
                    else {
                        numberOfParticipants--;
                        if (root.onNumberOfParticipantsChnaged) root.onNumberOfParticipantsChnaged(numberOfParticipants);

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
            this.signal = function(data) {
                data.userid = userid;
                socket.push(data);
            };
        } else {
            // custom signaling implementations
            // e.g. WebSocket, Socket.io, SignalR, WebSycn, XMLHttpRequest, Long-Polling etc.
            socket = root.openSignalingChannel(function(message) {
                message = JSON.parse(message);
                if (message.userid != userid) {
                    if (!message.leaving) signaler.onmessage(message);
                    else {
                        root.onuserleft(message.userid);
                        numberOfParticipants--;
                        if (root.onNumberOfParticipantsChnaged) root.onNumberOfParticipantsChnaged(numberOfParticipants);
                    }
                }
            });

            // method to signal the data
            this.signal = function(data) {
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
    var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);

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

    iceServers = {
        iceServers: iceServers
    };

    var iceFrame, loadedIceFrame;

    function loadIceFrame(callback, skip) {
        if (loadedIceFrame) return;
        if (!skip) return loadIceFrame(callback, true);

        loadedIceFrame = true;

        var iframe = document.createElement('iframe');
        iframe.onload = function() {
            iframe.isLoaded = true;

            window.addEventListener('message', function(event) {
                window.iceServers = event.data.iceServers;

                if (!event.data || !event.data.iceServers) return;
                callback(event.data.iceServers);
            });

            iframe.contentWindow.postMessage('get-ice-servers', '*');
        };
        iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
        iframe.style.display = 'none';
        (document.body || document.documentElement).appendChild(iframe);
    };

    loadIceFrame(function(_iceServers) {
        iceServers.iceServers = iceServers.iceServers.concat(_iceServers);
        console.log('iceServers', JSON.stringify(iceServers.iceServers, null, '\t'));
    });

    var optionalArgument = {
        optional: [{
            DtlsSrtpKeyAgreement: true
        }]
    };

    function getToken() {
        return Math.round(Math.random() * 9999999999) + 9999999999;
    }

    function onSdpSuccess() {}

    function onSdpError(e) {
        console.error('sdp error:', e);
    }

    // var offer = Offer.createOffer(config);
    // offer.setRemoteDescription(sdp);
    // offer.addIceCandidate(candidate);
    var offerConstraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        }
    };
    
    var Offer = {
        createOffer: function(config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            peer.addStream(config.stream);
            peer.onicecandidate = function(event) {
                if (event.candidate) config.onicecandidate(event.candidate, config.to);
            };

            peer.createOffer(function(sdp) {
                sdp.sdp = setBandwidth(sdp.sdp);
                peer.setLocalDescription(sdp);
                config.onsdp(sdp, config.to);
            }, onSdpError, offerConstraints);

            this.peer = peer;

            return this;
        },
        setRemoteDescription: function(sdp) {
            console.log('setting remote descriptions', sdp.sdp);
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp), onSdpSuccess, onSdpError);
        },
        addIceCandidate: function(candidate) {
            console.log('adding ice', candidate.candidate);
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };

    // var answer = Answer.createAnswer(config);
    // answer.setRemoteDescription(sdp);
    // answer.addIceCandidate(candidate);
    var answerConstraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: true
        }
    };
    var Answer = {
        createAnswer: function(config) {
            var peer = new RTCPeerConnection(iceServers, optionalArgument);

            peer.onaddstream = function(event) {
                config.onaddstream(event.stream, config.to);
            };
            peer.onicecandidate = function(event) {
                if (event.candidate) config.onicecandidate(event.candidate, config.to);
            };

            console.log('setting remote descriptions', config.sdp.sdp);
            peer.setRemoteDescription(new RTCSessionDescription(config.sdp), onSdpSuccess, onSdpError);
            peer.createAnswer(function(sdp) {
                sdp.sdp = setBandwidth(sdp.sdp);
                peer.setLocalDescription(sdp);
                config.onsdp(sdp, config.to);
            }, onSdpError, answerConstraints);

            this.peer = peer;

            return this;
        },
        addIceCandidate: function(candidate) {
            console.log('adding ice', candidate.candidate);
        
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };
    
    function setBandwidth(sdp) {
        if (isFirefox) return sdp;
        if (isMobileDevice) return sdp;

        // removing existing bandwidth lines
        sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');

        // "300kbit/s" for screen sharing
        sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:300\r\n');

        return sdp;
    }

    // getScreenId.js - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/getScreenId.js

    function loadScript(src, onload) {
        var script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.documentElement.appendChild(script);
        console.log('loaded', src);
    }

    !window.getScreenId && loadScript('https://cdn.webrtc-experiment.com/getScreenId.js');
})();
