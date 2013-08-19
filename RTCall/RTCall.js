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
            this.callerid = Math.round(Math.random() * 60535) + 5000000;

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
                        if (response.customer && root.admin) root.oncustomer(response);
                        if (response.request && response.receiverid == root.callerid) root.onincomingcall(response);
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

                            if (response.candidate) {
                                peer && peer.addICE({
                                        sdpMLineIndex: response.candidate.sdpMLineIndex,
                                        candidate: JSON.parse(response.candidate.candidate)
                                    });
                            }
                        },
                        onconnection: function (socket) {
                            getUserMedia({
                                    onsuccess: function (stream) {
                                        peer = new RTCall.PeerConnection({
                                                onRemoteStream: onRemoteStream,
                                                attachStream: stream,
                                                onICE: function (candidate) {
                                                    socket.send({
                                                            candidate: {
                                                                sdpMLineIndex: candidate.sdpMLineIndex,
                                                                candidate: JSON.stringify(candidate.candidate)
                                                            }
                                                        });
                                                },
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
                                                    onICE: function (candidate) {
                                                        socket.send({
                                                                candidate: {
                                                                    sdpMLineIndex: candidate.sdpMLineIndex,
                                                                    candidate: JSON.stringify(candidate.candidate)
                                                                }
                                                            });
                                                    },
                                                    onAnswerSDP: function (sdp) {
                                                        socket.send({
                                                                sdp: sdp
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
                        audio.muted = true;
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
                SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
                IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

            STUN = {
                url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
            };

            TURN = {
				url: 'turn:homeo@turn.bistri.com:80',
				credential: 'homeo'
			};

            iceServers = {
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

            peerConnection.onicecandidate = function (event) {
                if (event && event.candidate) options.onICE(event.candidate);
            };

            peerConnection.addStream(options.attachStream);
            peerConnection.onaddstream = onaddstream;

            function onaddstream(event) {
                console.debug('on:add:stream:', event.stream);
                options.onRemoteStream(event.stream);
            }

            constraints = {
                optional: [],
                mandatory: {
                    OfferToReceiveAudio: true,
                    OfferToReceiveVideo: false
                }
            };

            function createOffer() {
                if (!options.onOfferSDP) return;

                peerConnection.createOffer(function (sessionDescription) {
                        peerConnection.setLocalDescription(sessionDescription);
                        options.onOfferSDP(sessionDescription);
                    }, null, constraints);
            }

            function createAnswer() {
                if (!options.onAnswerSDP) return;

                peerConnection.setRemoteDescription(new SessionDescription(options.offerSDP));
                peerConnection.createAnswer(function (sessionDescription) {
                        peerConnection.setLocalDescription(sessionDescription);
                        options.onAnswerSDP(sessionDescription);
                    }, null, constraints);
            }

            createOffer();
            createAnswer();

            return {
                addAnswerSDP: function (sdp) {
                    peerConnection.setRemoteDescription(new SessionDescription(sdp));
                    console.debug('remoteDescription', peerConnection.remoteDescription.sdp);
                },
                addICE: function (candidate) {
                    peerConnection.addIceCandidate(new IceCandidate({
                                sdpMLineIndex: candidate.sdpMLineIndex,
                                candidate: candidate.candidate
                            }));
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
