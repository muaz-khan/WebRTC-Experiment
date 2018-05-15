var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

function setSdpConstraints(config) {
    var sdpConstraints = {
        OfferToReceiveAudio: !!config.OfferToReceiveAudio,
        OfferToReceiveVideo: !!config.OfferToReceiveVideo
    };

    if (adapter.browserDetails.browser === 'chrome' || adapter.browserDetails.browser === 'safari') {
        sdpConstraints = {
            mandatory: sdpConstraints,
            optional: []
        };
    }

    return sdpConstraints;
}

function PeerConnection() {
    return {
        create: function(type, options) {
            merge(this, options);

            var self = this;

            this.type = type;
            this.init();
            this.attachMediaStreams();

            if (isFirefox && this.session.data) {
                if (this.session.data && type == 'offer') {
                    this.createDataChannel();
                }

                this.getLocalDescription(type);

                if (this.session.data && type == 'answer') {
                    this.createDataChannel();
                }
            } else self.getLocalDescription(type);

            return this;
        },
        getLocalDescription: function(createType) {
            log('(getLocalDescription) peer createType is', createType);

            if (this.session.inactive && isNull(this.rtcMultiConnection.waitUntilRemoteStreamStartsFlowing)) {
                // inactive session returns blank-stream
                this.rtcMultiConnection.waitUntilRemoteStreamStartsFlowing = false;
            }

            var self = this;

            if (createType == 'answer') {
                this.setRemoteDescription(this.offerDescription, createDescription);
            } else createDescription();

            function createDescription() {
                self.connection[createType == 'offer' ? 'createOffer' : 'createAnswer'](self.constraints).then(function(sessionDescription) {
                    sessionDescription.sdp = self.serializeSdp(sessionDescription.sdp, createType);
                    self.connection.setLocalDescription(sessionDescription).then(function() {
                        if (self.trickleIce) {
                            self.onSessionDescription(sessionDescription, self.streaminfo);
                        }

                        if (sessionDescription.type == 'offer') {
                            log('offer sdp', sessionDescription.sdp);
                        }

                        self.prevCreateType = createType;
                    }).catch(self.onSdpError);
                }).catch(self.onSdpError);
            }
        },
        serializeSdp: function(sdp, createType) {
            // it is "connection.processSdp=function(sdp){return sdp;}"
            sdp = this.processSdp(sdp);

            if (isFirefox) return sdp;

            if (this.session.inactive && !this.holdMLine) {
                this.hold = true;
                if ((this.session.screen || this.session.video) && this.session.audio) {
                    this.holdMLine = 'both';
                } else if (this.session.screen || this.session.video) {
                    this.holdMLine = 'video';
                } else if (this.session.audio) {
                    this.holdMLine = 'audio';
                }
            }

            sdp = this.setBandwidth(sdp);
            if (this.holdMLine == 'both') {
                if (this.hold) {
                    this.prevSDP = sdp;
                    sdp = sdp.replace(/a=sendonly|a=recvonly|a=sendrecv/g, 'a=inactive');
                } else if (this.prevSDP) {
                    if (!this.session.inactive) {
                        // it means that DTSL key exchange already happened for single or multiple media lines.
                        // this block checks, key-exchange must be happened for all media lines.
                        sdp = this.prevSDP;

                        // todo: test it: makes sense?
                        if (chromeVersion <= 35) {
                            return sdp;
                        }
                    }
                }
            } else if (this.holdMLine == 'audio' || this.holdMLine == 'video') {
                sdp = sdp.split('m=');

                var audio = '';
                var video = '';

                if (sdp[1] && sdp[1].indexOf('audio') == 0) {
                    audio = 'm=' + sdp[1];
                }
                if (sdp[2] && sdp[2].indexOf('audio') == 0) {
                    audio = 'm=' + sdp[2];
                }

                if (sdp[1] && sdp[1].indexOf('video') == 0) {
                    video = 'm=' + sdp[1];
                }
                if (sdp[2] && sdp[2].indexOf('video') == 0) {
                    video = 'm=' + sdp[2];
                }

                if (this.holdMLine == 'audio') {
                    if (this.hold) {
                        this.prevSDP = sdp[0] + audio + video;
                        sdp = sdp[0] + audio.replace(/a=sendonly|a=recvonly|a=sendrecv/g, 'a=inactive') + video;
                    } else if (this.prevSDP) {
                        sdp = this.prevSDP;
                    }
                }

                if (this.holdMLine == 'video') {
                    if (this.hold) {
                        this.prevSDP = sdp[0] + audio + video;
                        sdp = sdp[0] + audio + video.replace(/a=sendonly|a=recvonly|a=sendrecv/g, 'a=inactive');
                    } else if (this.prevSDP) {
                        sdp = this.prevSDP;
                    }
                }
            }

            if (!this.hold && this.session.inactive) {
                // transport.cc&l=852 - http://goo.gl/0FxxqG
                // dtlstransport.h&l=234 - http://goo.gl/7E4sYF
                // http://tools.ietf.org/html/rfc4340

                // From RFC 4145, SDP setup attribute values.
                // http://goo.gl/xETJEp && http://goo.gl/3Wgcau
                if (createType == 'offer') {
                    sdp = sdp.replace(/a=setup:passive|a=setup:active|a=setup:holdconn/g, 'a=setup:actpass');
                } else {
                    sdp = sdp.replace(/a=setup:actpass|a=setup:passive|a=setup:holdconn/g, 'a=setup:active');
                }

                // whilst doing handshake, either media lines were "inactive"
                // or no media lines were present
                sdp = sdp.replace(/a=inactive/g, 'a=sendrecv');
            }
            // this.session.inactive = false;
            return sdp;
        },
        init: function() {
            this.setConstraints();
            this.connection = new RTCPeerConnection(this.iceServers, this.optionalArgument);

            if (this.session.data) {
                log('invoked: createDataChannel');
                this.createDataChannel();
            }

            this.connection.onicecandidate = function(event) {
                if (!event.candidate) {
                    if (!self.trickleIce) {
                        returnSDP();
                    }

                    return;
                }

                if (!self.trickleIce) return;

                self.onicecandidate(event.candidate);
            };

            function returnSDP() {
                if (self.returnedSDP) {
                    self.returnedSDP = false;
                    return;
                };
                self.returnedSDP = true;

                self.onSessionDescription(self.connection.localDescription, self.streaminfo);
            }

            if ('addStream' in this.connection) {
                this.connection.onaddstream = function(e) {
                    log('onaddstream', toStr(e.stream));

                    self.onaddstream(e.stream, self.session);
                };

                this.connection.onremovestream = function(e) {
                    self.onremovestream(e.stream);
                };
            } else if ('addTrack' in this.connection) {
                peer.onaddtrack = function(event) {

                };

                this.connection.onaddtrack = function(e) {
                    event.stream = event.streams.pop();

                    if (self.dontDuplicateOnAddTrack[event.stream.id] && adapter.browserDetails.browser !== 'safari') return;
                    self.dontDuplicateOnAddTrack[event.stream.id] = true;

                    log('onaddstream', toStr(e.stream));

                    self.onaddstream(e.stream, self.session);
                };
            } else {
                throw new Error('WebRTC addStream/addTrack is not supported.');
            }

            this.connection.onsignalingstatechange = function() {
                self.connection && self.oniceconnectionstatechange({
                    iceConnectionState: self.connection.iceConnectionState,
                    iceGatheringState: self.connection.iceGatheringState,
                    signalingState: self.connection.signalingState
                });
            };

            this.connection.oniceconnectionstatechange = function() {
                if (!self.connection) return;

                self.oniceconnectionstatechange({
                    iceConnectionState: self.connection.iceConnectionState,
                    iceGatheringState: self.connection.iceGatheringState,
                    signalingState: self.connection.signalingState
                });

                if (self.trickleIce) return;

                if (self.connection.iceGatheringState == 'complete') {
                    log('iceGatheringState', self.connection.iceGatheringState);
                    returnSDP();
                }
            };

            var self = this;
        },
        dontDuplicateOnAddTrack: {},
        setBandwidth: function(sdp) {
            if (isMobileDevice || isFirefox || !this.bandwidth) return sdp;

            var bandwidth = this.bandwidth;

            if (this.session.screen) {
                if (!bandwidth.screen) {
                    warn('It seems that you are not using bandwidth for screen. Screen sharing is expected to fail.');
                } else if (bandwidth.screen < 300) {
                    warn('It seems that you are using wrong bandwidth value for screen. Screen sharing is expected to fail.');
                }
            }

            // if screen; must use at least 300kbs
            if (bandwidth.screen && this.session.screen) {
                sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
                sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.screen + '\r\n');
            }

            // remove existing bandwidth lines
            if (bandwidth.audio || bandwidth.video || bandwidth.data) {
                sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
            }

            if (bandwidth.audio) {
                sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
            }

            if (bandwidth.video) {
                sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + (this.session.screen ? bandwidth.screen : bandwidth.video) + '\r\n');
            }

            if (bandwidth.data && !this.preferSCTP) {
                sdp = sdp.replace(/a=mid:data\r\n/g, 'a=mid:data\r\nb=AS:' + bandwidth.data + '\r\n');
            }

            return sdp;
        },
        setConstraints: function() {
            var sdpConstraints = setSdpConstraints({
                OfferToReceiveAudio: !!this.session.audio,
                OfferToReceiveVideo: !!this.session.video || !!this.session.screen
            });

            if (this.sdpConstraints.mandatory) {
                sdpConstraints = setSdpConstraints(this.sdpConstraints.mandatory);
            }

            this.constraints = sdpConstraints;

            if (this.constraints) {
                log('sdp-constraints', toStr(this.constraints));
            }

            this.optionalArgument = {
                optional: this.optionalArgument.optional || [],
                mandatory: this.optionalArgument.mandatory || {}
            };

            if (!this.preferSCTP) {
                this.optionalArgument.optional.push({
                    RtpDataChannels: true
                });
            }

            log('optional-argument', toStr(this.optionalArgument));

            if (!isNull(this.iceServers)) {
                var iceCandidates = this.rtcMultiConnection.candidates;

                var stun = iceCandidates.stun;
                var turn = iceCandidates.turn;
                var host = iceCandidates.host;

                if (!isNull(iceCandidates.reflexive)) stun = iceCandidates.reflexive;
                if (!isNull(iceCandidates.relay)) turn = iceCandidates.relay;

                if (!host && !stun && turn) {
                    this.rtcConfiguration.iceTransports = 'relay';
                } else if (!host && !stun && !turn) {
                    this.rtcConfiguration.iceTransports = 'none';
                }

                this.iceServers = {
                    iceServers: this.iceServers,
                    iceTransportPolicy: this.rtcConfiguration.iceTransports,
                    bundlePolicy: 'max-bundle',
                    iceCandidatePoolSize: 0
                };
            } else this.iceServers = null;

            log('rtc-configuration', toStr(this.iceServers));
        },
        onSdpError: function(e) {
            var message = toStr(e);

            if (message && message.indexOf('RTP/SAVPF Expects at least 4 fields') != -1) {
                message = 'It seems that you are trying to interop RTP-datachannels with SCTP. It is not supported!';
            }
            error('onSdpError:', message);
        },
        onSdpSuccess: function() {
            log('sdp success');
        },
        onMediaError: function(err) {
            error(toStr(err));
        },
        setRemoteDescription: function(sessionDescription, onSdpSuccess) {
            if (!sessionDescription) throw 'Remote session description should NOT be NULL.';

            if (!this.connection) return;

            log('setting remote description', sessionDescription.type, sessionDescription.sdp);

            var self = this;
            this.connection.setRemoteDescription(new RTCSessionDescription(sessionDescription)).then(onSdpSuccess || this.onSdpSuccess).catch(function(error) {
                if (error.search(/STATE_SENTINITIATE|STATE_INPROGRESS/gi) == -1) {
                    self.onSdpError(error);
                }
            });
        },
        addIceCandidate: function(candidate) {
            this.connection.addIceCandidate(new RTCIceCandidate(candidate)).then(function() {
                log('added:', candidate.sdpMid, candidate.candidate);
            }).catch(function() {
                error('onIceFailure', arguments, candidate.candidate);
            });
        },
        createDataChannel: function(channelIdentifier) {
            // skip 2nd invocation of createDataChannel
            if (this.channels && this.channels.length) return;

            var self = this;

            if (!this.channels) this.channels = [];

            // protocol: 'text/chat', preset: true, stream: 16
            // maxRetransmits:0 && ordered:false && outOfOrderAllowed: false
            var dataChannelDict = {};

            if (this.dataChannelDict) dataChannelDict = this.dataChannelDict;

            if (isChrome && !this.preferSCTP) {
                dataChannelDict.reliable = false; // Deprecated!
            }

            log('dataChannelDict', toStr(dataChannelDict));

            if (this.type == 'answer' || isFirefox) {
                this.connection.ondatachannel = function(event) {
                    self.setChannelEvents(event.channel);
                };
            }

            if ((isChrome && this.type == 'offer') || isFirefox) {
                this.setChannelEvents(
                    this.connection.createDataChannel(channelIdentifier || 'channel', dataChannelDict)
                );
            }
        },
        setChannelEvents: function(channel) {
            var self = this;

            channel.binaryType = 'arraybuffer';

            if (this.dataChannelDict.binaryType) {
                channel.binaryType = this.dataChannelDict.binaryType;
            }

            channel.onmessage = function(event) {
                self.onmessage(event.data);
            };

            var numberOfTimes = 0;
            channel.onopen = function() {
                channel.push = channel.send;
                channel.send = function(data) {
                    if (self.connection.iceConnectionState == 'disconnected') {
                        return;
                    }

                    if (channel.readyState.search(/closing|closed/g) != -1) {
                        return;
                    }

                    if (channel.readyState.search(/connecting|open/g) == -1) {
                        return;
                    }

                    if (channel.readyState == 'connecting') {
                        numberOfTimes++;
                        return setTimeout(function() {
                            if (numberOfTimes < 20) {
                                channel.send(data);
                            } else throw 'Number of times exceeded to wait for WebRTC data connection to be opened.';
                        }, 1000);
                    }
                    try {
                        channel.push(data);
                    } catch (e) {
                        numberOfTimes++;
                        warn('Data transmission failed. Re-transmitting..', numberOfTimes, toStr(e));
                        if (numberOfTimes >= 20) throw 'Number of times exceeded to resend data packets over WebRTC data channels.';
                        setTimeout(function() {
                            channel.send(data);
                        }, 100);
                    }
                };
                self.onopen(channel);
            };

            channel.onerror = function(event) {
                self.onerror(event);
            };

            channel.onclose = function(event) {
                self.onclose(event);
            };

            this.channels.push(channel);
        },
        addStream: function(stream) {
            if (!stream.streamid) {
                stream.streamid = getRandomString();
            }

            // todo: maybe need to add isAudio/isVideo/isScreen if missing?
            var self = this;

            log('attaching stream:', stream.streamid, toStr(stream));

            if ('addStream' in this.connection) {
                this.connection.addStream(stream);
            } else if ('addTrack' in this.connection) {
                stream.getTracks().forEach(function(track) {
                    self.connection.addTrack(track, stream);
                });
            } else {
                throw new Error('WebRTC addStream/addTrack is not supported.');
            }

            this.sendStreamId(stream);
            this.getStreamInfo();
        },
        attachMediaStreams: function() {
            var streams = this.attachStreams;
            for (var i = 0; i < streams.length; i++) {
                // "addStream" method above is handling "addTrack"
                this.addStream(streams[i]);
            }
        },
        getStreamInfo: function() {
            this.streaminfo = '';
            var streams = this.connection.getLocalStreams();
            for (var i = 0; i < streams.length; i++) {
                if (i == 0) {
                    this.streaminfo = JSON.stringify({
                        streamid: streams[i].streamid || '',
                        isScreen: !!streams[i].isScreen,
                        isAudio: !!streams[i].isAudio,
                        isVideo: !!streams[i].isVideo,
                        preMuted: streams[i].preMuted || {}
                    });
                } else {
                    this.streaminfo += '----' + JSON.stringify({
                        streamid: streams[i].streamid || '',
                        isScreen: !!streams[i].isScreen,
                        isAudio: !!streams[i].isAudio,
                        isVideo: !!streams[i].isVideo,
                        preMuted: streams[i].preMuted || {}
                    });
                }
            }
        },
        recreateOffer: function(renegotiate, callback) {
            log('recreating offer');

            this.type = 'offer';
            this.session = renegotiate;

            // todo: make sure this doesn't affect renegotiation scenarios
            // this.setConstraints();

            this.onSessionDescription = callback;
            this.getStreamInfo();

            // one can renegotiate data connection in existing audio/video/screen connection!
            if (this.session.data) {
                this.createDataChannel();
            }

            this.getLocalDescription('offer');
        },
        recreateAnswer: function(sdp, session, callback) {
            // if(isFirefox) this.create(this.type, this);

            log('recreating answer');

            this.type = 'answer';
            this.session = session;

            // todo: make sure this doesn't affect renegotiation scenarios
            // this.setConstraints();

            this.onSessionDescription = callback;
            this.offerDescription = sdp;
            this.getStreamInfo();

            // one can renegotiate data connection in existing audio/video/screen connection!
            if (this.session.data) {
                this.createDataChannel();
            }

            this.getLocalDescription('answer');
        }
    };
}
