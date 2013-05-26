/*
 2013, @muazkh » github.com/muaz-khan
 MIT License » https://webrtc-experiment.appspot.com/licence/
 Documentation » https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCall
*/
(function () {
    window.RTCall = function (channel) {
        this.channel = channel || document.domain.replace(/(.|\/)/g, '');

        this.onincomingcall = function (caller) {
            self.receive(caller.receiverid);
        };

        this.oncustomer = function (customer) {
            self.call(customer.callerid);
        };

        this.call = function (callerid) {
            caller.call(callerid);
        };

        this.receive = function (receiverid) {
            caller.receive(receiverid);
        };

        this.onstream = function (e) {
            audio = e.audio;
            audio.play();
            document.documentElement.appendChild(audio, document.documentElement.firstChild);
        };

        var self = this;
        this.callerid = (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');

        var caller;
        this.init = function () {
            if (!self.openSignalingChannel) {
                // if no signaling channel is provided; use firebase
                firebaseSignalingChannel();

                // if no firebase file linked; download one from their servers
                if (!window.Firebase) {
                    script = document.createElement('script');
                    script.src = 'https://cdn.firebase.com/v0/firebase.js';
                    script.onload = function () {
                        caller = new RTCall.Caller(self);
                    };
                    document.documentElement.appendChild(script);
                }

                // if firebase.js is already linked; don't download it again
                else caller = new RTCall.Caller(self);
            }

            // for custom signaling channel; e.g. socket.io; just use it!
            else caller = new RTCall.Caller(self);
        };

        function firebaseSignalingChannel() {
            self.openSignalingChannel = function (config) {
                channel = config.channel || self.channel;
                socket = new window.Firebase('https://' + (self.firebase || 'chat') + '.firebaseIO.com/' + channel);

                socket.on('child_added', function (data) {
                    var value = data.val();
                    if (value.callerid != self.callerid) config.onmessage(value);
                });

                socket.send = function (data) {
                    data.callerid = self.callerid;
                    this.push(data);
                };

                // if((channel == self.channel && self.admin) || channel != self.channel) 
                socket.onDisconnect().remove();
                setTimeout(function () {
                    config.onconnection(socket);
                }, 1);
            };
        }
    };

    window.RTCall.Caller = function (root) {
        self = this;

        var defaultSocket;
        root.openSignalingChannel({
            onmessage: function (response) {
                if (response.customer) root.oncustomer(response);
                if (response.request) root.onincomingcall(response);
            },
            onconnection: function (socket) {
                defaultSocket = socket;
                if (!root.admin)
                    socket.send({
                        customer: true
                    });
            }
        });

        this.receive = function (receiverid) {
            var peer;
            root.openSignalingChannel({
                channel: receiverid,
                onmessage: function (response) {
                    if (response.sdp) {
                        self.callerid = response.callerid;
                        peer.addAnswerSDP(response.sdp);
                    }
                },
                onconnection: function (socket) {
                    getUserMedia({
                        onsuccess: function (stream) {
                            peer = new RTCall.PeerConnection({
                                onRemoteStream: onRemoteStream,
                                attachStream: stream,
                                onOfferSDP: function (sdp) {
                                    socket.send({
                                        sdp: sdp
                                    });
                                }
                            });
                        }
                    });
                }
            });
        };

        function waitForResponse(callerid) {
            var socket, peer;
            root.openSignalingChannel({
                channel: callerid,
                onmessage: function (response) {
                    if (response.sdp) {
                        self.callerid = response.callerid;
                        getUserMedia({
                            onsuccess: function (stream) {
                                peer = new RTCall.PeerConnection({
                                    onRemoteStream: onRemoteStream,
                                    attachStream: stream,
                                    offerSDP: response.sdp,
                                    onAnswerSDP: function (sdp) {
                                        socket.send({
                                            sdp: sdp
                                        });
                                    }
                                });
                            }
                        });
                    }
                },
                onconnection: function (_socket) {
                    socket = _socket;
                }
            });
        }

        this.call = function (callerid) {
            defaultSocket.send({
                request: true,
                receiverid: callerid
            });

            waitForResponse(callerid);
        };

        function onRemoteStream(stream) {
            var audio = document.createElement('audio');
            if (!moz) audio.src = window.webkitURL.createObjectURL(stream);
            else audio.mozSrcObject = stream;

            audio.volume = 0;
            audio.controls = true;
            audio.autoplay = true;
            audio.play();

            setTimeout(function () {
                audio.muted = false;
                audio.volume = 1;
                audio.pause();
                root.onstream({
                    audio: audio,
                    stream: stream,
                    callerid: self.callerid
                });
            }, 3000);
        }
    };

    window.moz = !! navigator.mozGetUserMedia;
    window.RTCall.PeerConnection = function (options) {
        var w = window,
            PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
            SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription;

        STUN = {
            url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
        };

        TURN = {
            url: 'turn:webrtc%40live.com@numb.viagenie.ca',
            credential: 'muazkh'
        };

        iceServers = {
            iceServers: options.iceServers || [STUN]
        };

        if (!moz && !options.iceServers) iceServers.iceServers = [TURN, STUN];

        optional = {
            optional: []
        };

        if (!moz) optional.optional = [{
                    DtlsSrtpKeyAgreement: true
                }
            ];

        var peerConnection = new PeerConnection(iceServers, optional);

        peerConnection.onicecandidate = function (event) {
            if (!event.candidate) returnSDP();
            else console.debug('injecting ice in sdp:', event.candidate);
        };

        peerConnection.addStream(options.attachStream);
        peerConnection.onaddstream = onaddstream;

        function onaddstream(event) {
            console.debug('on:add:stream:', event.stream);
            options.onRemoteStream(event.stream);
        }

        peerConnection.ongatheringchange = function (event) {
            if (event.currentTarget.iceGatheringState === 'complete') returnSDP();
        };

        function returnSDP() {
            console.debug('sharing localDescription', peerConnection.localDescription.sdp);

            if (options.onOfferSDP) options.onOfferSDP(peerConnection.localDescription);
            else options.onAnswerSDP(peerConnection.localDescription);
        }

        constraints = {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: false
            }
        };

        if (moz) constraints.mandatory.MozDontOfferDataChannel = true;

        function createOffer() {
            if (!options.onOfferSDP) return;

            peerConnection.createOffer(function (sessionDescription) {
                peerConnection.setLocalDescription(sessionDescription);
                if (moz) options.onOfferSDP(sessionDescription);
            }, null, constraints);
        }

        function createAnswer() {
            if (!options.onAnswerSDP) return;

            peerConnection.setRemoteDescription(new SessionDescription(options.offerSDP));
            peerConnection.createAnswer(function (sessionDescription) {
                peerConnection.setLocalDescription(sessionDescription);
                if (moz) options.onAnswerSDP(sessionDescription);
            }, null, constraints);
        }

        createOffer();
        createAnswer();

        return {
            addAnswerSDP: function (sdp) {
                peerConnection.setRemoteDescription(new SessionDescription(sdp));
                console.debug('remoteDescription', peerConnection.remoteDescription.sdp);
            },
            connection: peerConnection
        };
    };

    window.getUserMedia = function (options) {
        navigator.getMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        navigator.getMedia({
            audio: true,
            video: false
        }, streaming, onerror);

        function streaming(stream) {
            audio = options.audio;
            if (audio) {
                audio[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
                audio.play();
            }
            options.onsuccess(stream);
        }

        function onerror(e) {
            console.error(e);
            if (options.onerror) options.onerror(e);
        }
    }
})();