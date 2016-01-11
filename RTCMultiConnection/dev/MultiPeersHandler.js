// MultiPeersHandler.js

function MultiPeers(connection) {
    var self = this;

    var skipPeers = ['getAllParticipants', 'getLength', 'selectFirst', 'streams', 'send', 'forEach'];
    connection.peers = {
        getLength: function() {
            var numberOfPeers = 0;
            for (var peer in this) {
                if (skipPeers.indexOf(peer) == -1) {
                    numberOfPeers++;
                }
            }
            return numberOfPeers;
        },
        selectFirst: function() {
            var firstPeer;
            for (var peer in this) {
                if (skipPeers.indexOf(peer) == -1) {
                    firstPeer = this[peer];
                }
            }
            return firstPeer;
        },
        getAllParticipants: function(sender) {
            var allPeers = [];
            for (var peer in this) {
                if (skipPeers.indexOf(peer) == -1 && peer != sender) {
                    allPeers.push(peer);
                }
            }
            return allPeers;
        },
        forEach: function(callbcak) {
            this.getAllParticipants().forEach(function(participant) {
                callbcak(connection.peers[participant]);
            });
        },
        send: function(data, remoteUserId) {
            var that = this;

            if (!isNull(data.size) && !isNull(data.type)) {
                self.shareFile(data, remoteUserId);
                return;
            }

            if (data.type !== 'text' && !(data instanceof ArrayBuffer) && !(data instanceof DataView)) {
                TextSender.send({
                    text: data,
                    channel: this,
                    connection: connection,
                    remoteUserId: remoteUserId
                });
                return;
            }

            if (data.type === 'text') {
                data = JSON.stringify(data);
            }

            if (remoteUserId) {
                var remoteUser = connection.peers[remoteUserId];
                if (remoteUser) {
                    remoteUser.channels.forEach(function(channel) {
                        channel.send(data);
                    });
                    return;
                }
            }

            this.getAllParticipants().forEach(function(participant) {
                that[participant].channels.forEach(function(channel) {
                    channel.send(data);
                });
            });
        }
    };

    this.uuid = connection.userid;

    this.getLocalConfig = function(remoteSdp, remoteUserId, userPreferences) {
        if (!userPreferences) {
            userPreferences = {};
        }

        return {
            streamsToShare: userPreferences.streamsToShare || {},
            session: connection.session,
            rtcMultiConnection: connection,
            connectionDescription: userPreferences.connectionDescription,
            remoteUserId: remoteUserId,
            localPeerSdpConstraints: userPreferences.localPeerSdpConstraints,
            remotePeerSdpConstraints: userPreferences.remotePeerSdpConstraints,
            dontGetRemoteStream: !!userPreferences.dontGetRemoteStream,
            dontAttachLocalStream: !!userPreferences.dontAttachLocalStream,
            optionalArgument: connection.optionalArgument,
            iceServers: connection.iceServers,
            renegotiatingPeer: !!userPreferences.renegotiatingPeer,
            peerRef: userPreferences.peerRef,
            enableDataChannels: !!connection.session.data,
            localStreams: connection.attachStreams,
            removeStreams: connection.removeStreams,
            onLocalSdp: function(localSdp) {
                self.onNegotiationNeeded(localSdp, remoteUserId);
            },
            onLocalCandidate: function(localCandidate) {
                localCandidate = OnIceCandidateHandler.processCandidates(connection, localCandidate)
                if (localCandidate) {
                    self.onNegotiationNeeded(localCandidate, remoteUserId);
                }
            },
            remoteSdp: remoteSdp,
            onDataChannelMessage: function(message) {
                if (!fbr && connection.enableFileSharing) initFileBufferReader();

                if (typeof message == 'string' || !connection.enableFileSharing) {
                    self.onDataChannelMessage(message, remoteUserId);
                    return;
                }

                var that = this;

                if (message instanceof ArrayBuffer || message instanceof DataView) {
                    fbr.convertToObject(message, function(object) {
                        that.onDataChannelMessage(object);
                    });
                    return;
                }

                if (message.readyForNextChunk) {
                    fbr.getNextChunk(message.uuid, function(nextChunk, isLastChunk) {
                        connection.peers[remoteUserId].channels.forEach(function(channel) {
                            channel.send(nextChunk);
                        });
                    }, remoteUserId);
                    return;
                }

                fbr.addChunk(message, function(promptNextChunk) {
                    connection.peers[remoteUserId].peer.channel.send(promptNextChunk);
                });
            },
            onDataChannelError: function(error) {
                self.onDataChannelError(error, remoteUserId);
            },
            onDataChannelOpened: function(channel) {
                self.onDataChannelOpened(channel, remoteUserId);
            },
            onDataChannelClosed: function(event) {
                self.onDataChannelClosed(event, remoteUserId);
            },
            onRemoteStream: function(stream) {
                connection.peers[remoteUserId].streams.push(stream);

                if (isPluginRTC) {
                    var mediaElement = document.createElement('video');
                    var body = (document.body || document.documentElement);
                    body.insertBefore(mediaElement, body.firstChild);

                    setTimeout(function() {
                        Plugin.attachMediaStream(mediaElement, stream);

                        self.onGettingRemoteMedia(mediaElement, remoteUserId);
                    }, 3000);
                    return;
                }

                self.onGettingRemoteMedia(stream, remoteUserId);
            },
            onRemoteStreamRemoved: function(stream) {
                self.onRemovingRemoteMedia(stream, remoteUserId);
            },
            onPeerStateChanged: function(states) {
                self.onPeerStateChanged(states);

                if (states.iceConnectionState === 'new') {
                    self.onNegotiationStarted(remoteUserId, states);
                }

                if (states.iceConnectionState === 'connected') {
                    self.onNegotiationCompleted(remoteUserId, states);
                }

                if (states.iceConnectionState.search(/closed|failed/gi) !== -1) {
                    self.onUserLeft(remoteUserId);
                    self.disconnectWith(remoteUserId);
                }
            },
            processSdp: connection.processSdp
        };
    };

    this.createNewPeer = function(remoteUserId, userPreferences) {
        if (connection.maxParticipantsAllowed <= connection.getAllParticipants().length) {
            return;
        }

        userPreferences = userPreferences || {};

        if (!userPreferences.isOneWay && !userPreferences.isDataOnly) {
            userPreferences.isOneWay = true;
            this.onNegotiationNeeded({
                enableMedia: true,
                userPreferences: userPreferences
            }, remoteUserId);
            return;
        }

        userPreferences = connection.setUserPreferences(userPreferences);

        var localConfig = this.getLocalConfig(null, remoteUserId, userPreferences);
        connection.peers[remoteUserId] = new PeerInitiator(localConfig);
    };

    this.createAnsweringPeer = function(remoteSdp, remoteUserId, userPreferences) {
        userPreferences = connection.setUserPreferences(userPreferences || {});

        var localConfig = this.getLocalConfig(remoteSdp, remoteUserId, userPreferences);
        connection.peers[remoteUserId] = new PeerInitiator(localConfig);
    };

    this.renegotiatePeer = function(remoteUserId, userPreferences, remoteSdp) {
        if (!connection.peers[remoteUserId]) {
            throw 'This peer (' + remoteUserId + ') does not exists.';
        }

        if (!userPreferences) {
            userPreferences = {};
        }

        userPreferences.renegotiatingPeer = true;
        userPreferences.peerRef = connection.peers[remoteUserId].peer;

        var localConfig = this.getLocalConfig(remoteSdp, remoteUserId, userPreferences);

        connection.peers[remoteUserId] = new PeerInitiator(localConfig);
    };

    this.replaceTrack = function(track, remoteUserId, isVideoTrack) {
        if (!connection.peers[remoteUserId]) {
            throw 'This peer (' + remoteUserId + ') does not exists.';
        }

        var peer = connection.peers[remoteUserId].peer;

        if (!!peer.getSenders && typeof peer.getSenders === 'function' && peer.getSenders().length) {
            peer.getSenders().forEach(function(rtpSender) {
                if (isVideoTrack && rtpSender.track instanceof VideoStreamTrack) {
                    rtpSender.replaceTrack(track);
                }

                if (!isVideoTrack && rtpSender.track instanceof AudioStreamTrack) {
                    rtpSender.replaceTrack(track);
                }
            });
            return;
        }

        console.warn('RTPSender.replaceTrack is NOT supported.');
        this.renegotiatePeer(remoteUserId);
    };

    this.onNegotiationNeeded = function(message, remoteUserId) {};
    this.addNegotiatedMessage = function(message, remoteUserId) {
        if (message.type && message.sdp) {
            if (message.type == 'answer') {
                if (connection.peers[remoteUserId]) {
                    connection.peers[remoteUserId].addRemoteSdp(message);
                }
            }

            if (message.type == 'offer') {
                if (message.renegotiatingPeer) {
                    this.renegotiatePeer(remoteUserId, null, message);
                } else {
                    this.createAnsweringPeer(message, remoteUserId);
                }
            }

            if (connection.enableLogs) {
                console.log('Remote peer\'s sdp:', message.sdp);
            }
            return;
        }

        if (message.candidate) {
            if (connection.peers[remoteUserId]) {
                connection.peers[remoteUserId].addRemoteCandidate(message);
            }

            if (connection.enableLogs) {
                console.log('Remote peer\'s candidate pairs:', message.candidate);
            }
            return;
        }

        if (message.enableMedia) {
            if (connection.attachStreams.length) {
                var streamsToShare = {};
                connection.attachStreams.forEach(function(stream) {
                    streamsToShare[stream.streamid] = {
                        isAudio: !!stream.isAudio,
                        isVideo: !!stream.isVideo,
                        isScreen: !!stream.isScreen
                    };
                });
                message.userPreferences.streamsToShare = streamsToShare;

                self.onNegotiationNeeded({
                    readyForOffer: true,
                    userPreferences: message.userPreferences
                }, remoteUserId);
                return;
            }

            var localMediaConstraints = {};
            var userPreferences = message.userPreferences;
            if (userPreferences.localPeerSdpConstraints.OfferToReceiveAudio) {
                localMediaConstraints.audio = connection.mediaConstraints.audio;
            }

            if (userPreferences.localPeerSdpConstraints.OfferToReceiveVideo) {
                localMediaConstraints.video = connection.mediaConstraints.video;
            }

            getUserMediaHandler({
                onGettingLocalMedia: function(localStream) {
                    self.onGettingLocalMedia(localStream);

                    var streamsToShare = {};
                    connection.attachStreams.forEach(function(stream) {
                        streamsToShare[stream.streamid] = {
                            isAudio: !!stream.isAudio,
                            isVideo: !!stream.isVideo,
                            isScreen: !!stream.isScreen
                        };
                    });
                    message.userPreferences.streamsToShare = streamsToShare;

                    self.onNegotiationNeeded({
                        readyForOffer: true,
                        userPreferences: message.userPreferences
                    }, remoteUserId);
                },
                onLocalMediaError: function(error) {
                    self.onLocalMediaError(error);
                    self.onNegotiationNeeded({
                        readyForOffer: true,
                        userPreferences: message.userPreferences
                    }, remoteUserId);
                },
                localMediaConstraints: localMediaConstraints
            });
        }

        if (message.readyForOffer) {
            connection.onReadyForOffer(remoteUserId, message.userPreferences);
        }
    };

    this.onGettingRemoteMedia = function(stream, remoteUserId) {};
    this.onRemovingRemoteMedia = function(stream, remoteUserId) {};
    this.onGettingLocalMedia = function(localStream) {};
    this.onLocalMediaError = function(error) {
        if (!!connection.enableLogs) {
            console.error('onLocalMediaError', JSON.stringify(error, null, '\t'));
        }
        connection.onMediaError(error);
    };

    var fbr;

    function initFileBufferReader() {
        fbr = new FileBufferReader();
        fbr.onProgress = function(chunk) {
            connection.onFileProgress(chunk);
        };
        fbr.onBegin = function(file) {
            connection.onFileStart(file);
        };
        fbr.onEnd = function(file) {
            connection.onFileEnd(file);
        };
    }

    this.shareFile = function(file, remoteUserId) {
        if (!connection.enableFileSharing) {
            throw '"connection.enableFileSharing" is false.';
        }

        initFileBufferReader();

        fbr.readAsArrayBuffer(file, function(uuid) {
            var arrayOfUsers = connection.getAllParticipants();

            if (remoteUserId) {
                arrayOfUsers = [remoteUserId];
            }

            arrayOfUsers.forEach(function(participant) {
                fbr.getNextChunk(uuid, function(nextChunk) {
                    connection.peers[participant].channels.forEach(function(channel) {
                        channel.send(nextChunk);
                    });
                }, participant);
            });
        }, {
            userid: connection.userid,
            // extra: connection.extra,
            chunkSize: connection.chunkSize || 0
        });
    };

    if (typeof 'TextReceiver' !== 'undefined') {
        var textReceiver = new TextReceiver(connection);
    }

    this.onDataChannelMessage = function(message, remoteUserId) {
        textReceiver.receive(JSON.parse(message), remoteUserId, connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {});
    };

    this.onDataChannelClosed = function(event, remoteUserId) {
        event.userid = remoteUserId;
        event.extra = connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {};
        connection.onclose(event);
    };

    this.onDataChannelError = function(error, remoteUserId) {
        error.userid = remoteUserId;
        event.extra = connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {};
        connection.onerror(error);
    };

    this.onDataChannelOpened = function(channel, remoteUserId) {
        connection.peers[remoteUserId].channels.push(channel);
        connection.onopen({
            userid: remoteUserId,
            extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra : {},
            channel: channel
        });
    };

    this.onPeerStateChanged = function(state) {
        if (connection.enableLogs) {
            if (state.iceConnectionState.search(/disconnected|closed|failed/gi) !== -1) {
                console.error('Peer connection is closed between you & ', state.userid, state.extra, 'state:', state.iceConnectionState);
            }
        }
    };

    this.onNegotiationStarted = function(remoteUserId, states) {};
    this.onNegotiationCompleted = function(remoteUserId, states) {};

    this.getRemoteStreams = function(remoteUserId) {
        remoteUserId = remoteUserId || connection.peers.getAllParticipants()[0];
        return connection.peers[remoteUserId] ? connection.peers[remoteUserId].streams : [];
    };

    this.isPluginRTC = connection.isPluginRTC = isPluginRTC;
}
