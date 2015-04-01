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
        send: function(data) {
            var that = this;

            if (!isNull(data.size) && !isNull(data.type)) {
                self.shareFile(data);
                return;
            }

            if (data.type !== 'text' && !(data instanceof ArrayBuffer) && !(data instanceof DataView)) {
                TextSender.send({
                    text: data,
                    channel: this,
                    connection: connection
                });
                return;
            }

            if (data.type === 'text') {
                data = JSON.stringify(data);
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
                if(localCandidate) {
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
                        connection.peers[remoteUserId].peer.channel.send(nextChunk);
                    });
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

                if (states.iceConnectionState.search(/disconnected|closed/gi) !== -1) {
                    console.error('Peer connection is closed between you & ', remoteUserId);
                }
                
                if (states.iceConnectionState.search(/disconnected|closed|failed/gi) !== -1) {
                    self.onUserLeft(remoteUserId);
                    self.disconnectWith(remoteUserId);
                }
            },
            processSdp: connection.processSdp
        };
    };

    this.createNewPeer = function(remoteUserId, userPreferences) {
        userPreferences = userPreferences || {};
        if (!userPreferences.isOneWay && !isData(connection.session)) {
            userPreferences.isOneWay = true;
            this.onNegotiationNeeded({
                enableMedia: true,
                userPreferences: userPreferences
            }, remoteUserId);
            return;
        }

        var localConfig = this.getLocalConfig(null, remoteUserId, userPreferences);
        connection.peers[remoteUserId] = new PeerInitiator(localConfig);
    };

    this.createAnsweringPeer = function(remoteSdp, remoteUserId, userPreferences) {
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

    this.onNegotiationNeeded = function(message, remoteUserId) {};
    this.addNegotiatedMessage = function(message, remoteUserId) {
        if (message.type && message.sdp) {
            if (message.type == 'answer') {
                connection.peers[remoteUserId].addRemoteSdp(message);
            }

            if (message.type == 'offer') {
                if (message.renegotiatingPeer) {
                    this.renegotiatePeer(remoteUserId, null, message);
                } else {
                    this.createAnsweringPeer(message, remoteUserId);
                }
            }
            return;
        }

        if (message.candidate) {
            connection.peers[remoteUserId].addRemoteCandidate(message);
            return;
        }

        if (message.enableMedia) {
            if (connection.attachStreams.length) {
                self.onNegotiationNeeded({
                    readyForOffer: true,
                    userPreferences: message.userPreferences
                }, remoteUserId);
                return;
            }

            getUserMedia({
                onGettingLocalMedia: function(localStream) {
                    self.onGettingLocalMedia(localStream);
                    self.onNegotiationNeeded({
                        readyForOffer: true,
                        userPreferences: message.userPreferences
                    }, remoteUserId);
                },
                onLocalMediaError: this.onLocalMediaError,
                localMediaConstraints: connection.mediaConstraints
            });
        }

        if (message.readyForOffer) {
            this.createNewPeer(remoteUserId, message.userPreferences);
        }
    };

    this.onGettingRemoteMedia = function(stream, remoteUserId) {};
    this.onRemovingRemoteMedia = function(stream, remoteUserId) {};
    this.onGettingLocalMedia = function(localStream) {};
    this.onLocalMediaError = function(error) {
        console.error('onLocalMediaError', error);
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

    this.shareFile = function(file) {
        if(!connection.enableFileSharing) {
            throw '"connection.enableFileSharing" is false.';
        }
        
        initFileBufferReader();

        fbr.readAsArrayBuffer(file, function(uuid) {
            fbr.getNextChunk(uuid, function(nextChunk, isLastChunk) {
                connection.peers.send(nextChunk);
            });
        });
    };

    if (window.TextReceiver) {
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

    this.onPeerStateChanged = function(states) {};
    this.onNegotiationStarted = function(remoteUserId, states) {};
    this.onNegotiationCompleted = function(remoteUserId, states) {};

    this.getRemoteStreams = function(remoteUserId) {
        remoteUserId = remoteUserId || connection.peers.getAllParticipants()[0];
        return connection.peers[remoteUserId] ? connection.peers[remoteUserId].streams : [];
    };

    this.isPluginRTC = connection.isPluginRTC = isPluginRTC;
}
