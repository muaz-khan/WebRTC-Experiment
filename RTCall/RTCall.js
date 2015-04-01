// Muaz Khan     - wwww.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCall

(function() {
    window.RTCall = function(channel) {
        this.channel = channel || document.domain.replace( /\/|:|#|%|\.|\[|\]/g , '');

        this.onincomingcall = function(_caller) {
            self.receive(_caller.receiverid);
        };

        this.oncustomer = function(customer) {
            self.call(customer.callerid);
        };

        this.call = function(callerid) {
            caller.call(callerid);
        };

        this.receive = function(receiverid) {
            caller.receive(receiverid);
        };

        this.onstream = function(e) {
            audio = e.audio;
            audio.play();
            document.documentElement.appendChild(audio, document.documentElement.firstChild);
        };

        var self = this;
        this.callerid = Math.round(Math.random() * 546565) + 5000000;

        var caller;
        this.init = function() {
            if (!self.openSignalingChannel) {
                // if no signaling channel is provided; use websockets
                setupSignalingChannel();
                caller = new RTCall.Caller(self);
            }

                // for custom signaling channel; e.g. socket.io; just use it!
            else caller = new RTCall.Caller(self);
        };

        function setupSignalingChannel() {
            var SIGNALING_SERVER = 'https://signaling-muazkh.c9.io:443/';
            self.openSignalingChannel = function(config) {
                var channel = config.channel || this.channel || 'default-namespace';
                var sender = Math.round(Math.random() * 9999999999) + 9999999999;

                io.connect(SIGNALING_SERVER).emit('new-channel', {
                    channel: channel,
                    sender: sender
                });

                var socket = io.connect(SIGNALING_SERVER + channel);
                socket.channel = channel;

                socket.on('connect', function() {
                    if (config.callback) config.callback(socket);
                });

                socket.send = function(message) {
                    socket.emit('message', {
                        sender: sender,
                        data: message
                    });
                };

                socket.on('message', config.onmessage);
            };
        }
    };

    window.RTCall.Caller = function(root) {
        var self = this;

        var defaultSocket;
        root.openSignalingChannel({
            onmessage: function(response) {
                if (response.callerid == root.callerid) return;

                if (response.customer && root.admin) root.oncustomer(response);
                if (response.request && response.receiverid == root.callerid) root.onincomingcall(response);
            },
            callback: function(socket) {
                defaultSocket = socket;
                if (!root.admin)
                    socket.send({
                        customer: true,
                        callerid: root.callerid
                    });
            }
        });

        this.receive = function(receiverid) {
            var peer;
            root.openSignalingChannel({
                channel: receiverid,
                onmessage: function(response) {
                    if (response.callerid == root.callerid) return;

                    if (response.sdp) {
                        self.callerid = response.callerid;
                        peer.addAnswerSDP(response.sdp);
                    }

                    if (response.candidate) {
                        peer && peer.addICE({
                            sdpMLineIndex: response.candidate.sdpMLineIndex,
                            candidate: JSON.parse(response.candidate.candidate)
                        });
                    }
                },
                callback: function(socket) {
                    getUserMedia({
                        onsuccess: function(stream) {
                            peer = new RTCall.PeerConnection({
                                onRemoteStream: onRemoteStream,
                                attachStream: stream,
                                onICE: function(candidate) {
                                    socket.send({
                                        candidate: {
                                            sdpMLineIndex: candidate.sdpMLineIndex,
                                            candidate: JSON.stringify(candidate.candidate)
                                        },
                                        callerid: root.callerid
                                    });
                                },
                                onOfferSDP: function(sdp) {
                                    socket.send({
                                        sdp: sdp,
                                        callerid: root.callerid
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
                onmessage: function(response) {
                    if (response.callerid == root.callerid) return;

                    if (response.sdp) {
                        self.callerid = response.callerid;
                        getUserMedia({
                            onsuccess: function(stream) {
                                peer = new RTCall.PeerConnection({
                                    onRemoteStream: onRemoteStream,
                                    attachStream: stream,
                                    offerSDP: response.sdp,
                                    onICE: function(candidate) {
                                        socket && socket.send({
                                            candidate: {
                                                sdpMLineIndex: candidate.sdpMLineIndex,
                                                candidate: JSON.stringify(candidate.candidate)
                                            },
                                            callerid: root.callerid
                                        });
                                    },
                                    onAnswerSDP: function(sdp) {
                                        socket.send({
                                            sdp: sdp,
                                            callerid: root.callerid
                                        });
                                    }
                                });
                            }
                        });
                    }

                    if (response.candidate) {
                        peer && peer.addICE({
                            sdpMLineIndex: response.candidate.sdpMLineIndex,
                            candidate: JSON.parse(response.candidate.candidate)
                        });
                    }
                },
                callback: function(_socket) {
                    socket = _socket;
                }
            });
        }

        this.call = function(callerid) {
            defaultSocket.send({
                request: true,
                receiverid: callerid,
                callerid: root.callerid
            });

            waitForResponse(callerid);
        };

        function onRemoteStream(stream) {
            var audio = document.createElement('audio');
            if (!moz) audio.src = window.webkitURL.createObjectURL(stream);
            else audio.mozSrcObject = stream;

            audio.controls = true;
            audio.autoplay = true;
            audio.play();

            setTimeout(function() {
                audio.volume = 1;
                root.onstream({
                    audio: audio,
                    stream: stream,
                    callerid: self.callerid
                });
            }, 3000);
        }
    };

    window.moz = !!navigator.mozGetUserMedia;
    window.RTCall.PeerConnection = function(options) {
        var w = window,
            PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
            SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
            IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

        var STUN = {
            url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
        };

        var TURN = {
            url: 'turn:homeo@turn.bistri.com:80',
            credential: 'homeo'
        };

        var iceServers = {
            iceServers: options.iceServers || [STUN]
        };

        if (!moz && !options.iceServers) {
            if (parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]) >= 28)
                TURN = {
                    url: 'turn:turn.bistri.com:80',
                    credential: 'homeo',
                    username: 'homeo'
                };

            iceServers.iceServers = [STUN, TURN];
        }

        optional = {
            optional: []
        };

        if (!moz) {
            optional.optional = [{
                DtlsSrtpKeyAgreement: true
            }];
        }

        var peerConnection = new PeerConnection(iceServers, optional);

        peerConnection.onicecandidate = function(event) {
            if (event && event.candidate) options.onICE(event.candidate);
        };

        peerConnection.addStream(options.attachStream);
        peerConnection.onaddstream = onaddstream;

        function onaddstream(event) {
            console.debug('on:add:stream:', event.stream);
            options.onRemoteStream(event.stream);
        }

        var constraints = {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: false
            }
        };

        function createOffer() {
            if (!options.onOfferSDP) return;

            peerConnection.createOffer(function(sessionDescription) {
                peerConnection.setLocalDescription(sessionDescription);
                options.onOfferSDP(sessionDescription);
            }, onSdpError, constraints);
        }

        function createAnswer() {
            if (!options.onAnswerSDP) return;

            peerConnection.setRemoteDescription(new SessionDescription(options.offerSDP), onSdpSuccess, onSdpError);
            peerConnection.createAnswer(function(sessionDescription) {
                peerConnection.setLocalDescription(sessionDescription);
                options.onAnswerSDP(sessionDescription);
            }, onSdpError, constraints);
        }

        createOffer();
        createAnswer();

        function onSdpError(e) {
            console.error(JSON.stringify(e));
        }

        function onSdpSuccess() {
        }

        return {
            addAnswerSDP: function(sdp) {
                peerConnection.setRemoteDescription(new SessionDescription(sdp), onSdpSuccess, onSdpError);
                console.debug('remoteDescription', peerConnection.remoteDescription.sdp);
            },
            addICE: function(candidate) {
                peerConnection.addIceCandidate(new IceCandidate({
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: candidate.candidate
                }));
            },
            connection: peerConnection
        };
    };

    window.getUserMedia = function(options) {
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
            console.error(JSON.stringify(e));
            if (options.onerror) options.onerror(e);
        }
    };
})();
