function AntMediaWrapper() {
    var callbacks = {
        onopen: function() {},
        onclose: function() {},
        onerror: function() {},
        publish_callback: function() {},
        receive_callback: function() {},
        streamInfo_callback: function() {}
    };

    var websocket = new WebSocket('ws://webrtcweb.com:5080/WebRTCAppEE/websocket');
    websocket.userid = (Math.random() * 100).toString().replace('.', '');
    websocket._send = websocket.send;
    websocket.send = function(data) {
        websocket._send(JSON.stringify(data));
    };
    websocket.onopen = function() {
        callbacks.onopen();
    };
    websocket.onclose = function() {
        callbacks.onclose();
    };
    websocket.onerror = function() {
        callbacks.onerror();
    };
    websocket.onmessage = function(event) {
        var data = JSON.parse(event.data);

        if(data.command === 'streamInformation') {
            // audioBitrate, videoBitrate, streamHeight, streamWidth
            callbacks.streamInfo_callback(data.streamInfo[0]);
        }

        if(data.command === 'error') {
            if(data.definition === 'no_stream_exist') {
                callbacks.receive_callback(null, data.streamId + ': 404 not found. No such stream exist.');
                callbacks.streamInfo_callback(null, data.streamId + ': 404 not found. No such stream exist.');
            }

            if(data.definition === 'noStreamNameSpecified') {
                alert('Please pass stream-id.');
            }
        }
        
        if(data.command === 'start') {
            rtc.createOffer(rtc.stream, function(response) {
                if(response.sdp) {
                    websocket.send({
                        command: 'takeConfiguration',
                        streamId: rtc.streamId,
                        type: response.type,
                        sdp: response.sdp
                    });
                }

                if(response.candidate) {
                    websocket.send({
                        command: 'takeCandidate',
                        streamId: rtc.streamId,
                        candidate: response.candidate,
                        label: response.label,
                        id: response.sdpMid
                    });
                }

                if(response.stream) {
                    callbacks.receive_callback(response.stream);
                }
            });
        }

        if(data.command === 'notification') {
            if(data.definition === 'publish_started') {
                callbacks.publish_callback(true);
            }

            if(data.definition === 'play_started') {
                // 
            }

            if(data.definition === 'joined') {
                rtc.isOfferer = true;
                rtc.createOffer(rtc.stream, function(response) {
                    if(response.sdp) {
                        websocket.send({
                            command: 'takeConfiguration',
                            streamId: rtc.streamId,
                            type: response.type,
                            sdp: response.sdp
                        });
                    }

                    if(response.candidate) {
                        websocket.send({
                            command: 'takeCandidate',
                            streamId: rtc.streamId,
                            candidate: response.candidate,
                            label: response.label,
                            id: response.sdpMid
                        });
                    }

                    if(response.stream) {
                        callbacks.receive_callback(response.stream);
                    }
                });
            }

            if(data.definition === 'joinedTheRoom') {
                // rtc.streamId = data.streamId;
                websocket.send({
                    command : "publish",
                    streamId: rtc.streamId,
                    token : websocket.userid,
                    video: true,
                    audio: true
                });
            }
        }

        if(data.command === 'takeCandidate') {
            rtc.addIceCandidate({
                label: data.label,
                candidate: data.candidate,
                id: data.id
            });
        }

        if(data.command === 'takeConfiguration') {
            data.type === 'answer' && rtc.setRemoteDescription({
                type: data.type,
                sdp: data.sdp
            });

            data.type === 'offer' && rtc.createAnswer({
                sdp: data.sdp,
                type: data.type
            }, function(response) {
                if(response.sdp) {
                    websocket.send({
                        command: 'takeConfiguration',
                        streamId: rtc.streamId,
                        type: response.type,
                        sdp: response.sdp
                    });
                }

                if(response.candidate) {
                    websocket.send({
                        command: 'takeCandidate',
                        streamId: rtc.streamId,
                        candidate: response.candidate,
                        label: response.label,
                        id: response.sdpMid
                    });
                }

                if(response.stream) {
                    callbacks.receive_callback(response.stream);
                }
            });
        }
    };

    var rtc = new webrtcHandler();

    function stopPublishingStream() {
        websocket.send({
            command : "stop",
            streamId: rtc.streamId
        });
    }

    function receiveStream() {
        websocket.send({
            command : "play",
            streamId : rtc.streamId,
            token : websocket.userid
        });
    }

    function publishStream() {
        websocket.send({
            command : "publish",
            streamId: rtc.streamId,
            token : websocket.userid,
            video: isTrackExist('video', rtc.stream),
            audio: isTrackExist('audio', rtc.stream)
        });
    }

    function getStreamInfo() {
        websocket.send({
            command : "getStreamInfo",
            streamId: rtc.streamId
        });
    }

    function isTrackExist(kind, stream) {
        if(!stream) return false;

        var found = false;
        stream.getTracks().forEach(function(track) {
            if(track.kind === kind && track.readyState === 'live') {
                found = true;
            }
        });
        return found;
    }

    return {
        publish: function(stream, streamId, callback) {
            rtc.stream = stream;
            rtc.streamId = streamId;
            callbacks.publish_callback = callback;
            publishStream();
        },
        receive: function(streamId, callback) {
            rtc.streamId = streamId;
            callbacks.receive_callback = callback;
            receiveStream();
        },
        getStreamInfo: function(streamId, callback) {
            rtc.streamId = streamId;
            callbacks.streamInfo_callback = callback;
            getStreamInfo();
        },
        callbacks: function(id, callback) {
            callbacks[id] = callback;
        }
    }
}

function webrtcHandler() {
    return {
        createOffer: function(stream, callback) {
            var peer = this.getPeer();

            if(stream) {
                if ('addStream' in peer) {
                    peer.addStream(stream);
                } else {
                    stream.getTracks().forEach(function(track) {
                        peer.addTrack(track, stream);
                    });
                }
            }

            peer.onicecandidate = function(event) {
                if (!event || !event.candidate) {
                    return;
                }

                callback({
                    candidate: event.candidate.candidate,
                    label: event.candidate.sdpMLineIndex,
                    sdpMid: event.candidate.sdpMid
                });
            };
            peer.createOffer({
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            }).then(function(sdp) {
                peer.setLocalDescription(sdp);
                callback({
                    sdp: peer.localDescription.sdp,
                    type: peer.localDescription.type
                });
            });

            if ('onaddstream' in peer) {
                peer.onaddstream = function(event) {
                    callback({
                        stream: event.stream
                    });
                };
            } else if ('track' in peer) {
                peer.ontrack = function(event) {
                    callback({
                        stream: event.stream
                    });
                };
            } else {
                peer.onaddtrack = function(event) {
                    callback({
                        stream: event.streams[0]
                    });
                };
            }
        },
        addIceCandidate: function(candidate) {
            this.peer.addIceCandidate(new RTCIceCandidate({
                candidate: candidate.candidate,
                sdpMLineIndex: candidate.label,
                sdpMid: candidate.id
            }));
        },
        setRemoteDescription: function(sdp) {
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
        },
        createAnswer: function(sdp, callback) {
            var peer = this.getPeer();
            peer.onicecandidate = function(event) {
                if (!event || !event.candidate) {
                    return;
                }

                callback({
                    candidate: event.candidate.candidate,
                    label: event.candidate.sdpMLineIndex,
                    sdpMid: event.candidate.sdpMid
                });
            };
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp)).then(function() {
                peer.createAnswer({
                    OfferToReceiveAudio: true,
                    OfferToReceiveVideo: true
                }).then(function(sdp) {
                    peer.setLocalDescription(sdp);
                    callback({
                        sdp: peer.localDescription.sdp,
                        type: peer.localDescription.type
                    });
                });
            });

            if ('onaddstream' in peer) {
                peer.onaddstream = function(event) {
                    callback({
                        stream: event.stream
                    });
                };
            } else if ('track' in peer) {
                peer.ontrack = function(event) {
                    callback({
                        stream: event.stream
                    });
                };
            } else {
                peer.onaddtrack = function(event) {
                    callback({
                        stream: event.streams[0]
                    });
                };
            }
        },
        getParams: function() {
            // rtcpMuxPolicy: require or negotitate
            // bundlePolicy: max-bundle
            // iceCandidatePoolSize: 0
            return params = {
                iceServers: IceServersHandler.getIceServers(),
                iceTransportPolicy: 'all'
            };
        },
        getPeer: function() {
            var WebRTC_Native_Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
            var peer = new WebRTC_Native_Peer(this.getParams());
            this.peer = peer;
            return peer;
        }
    };
}

// IceServersHandler.js

var IceServersHandler = (function() {
    function getIceServers(connection) {
        return [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun2.l.google.com:19302' }];
    }

    return {
        getIceServers: getIceServers
    };
})();
