window.DataChannel = function(channel, extras) {
    if (channel) {
        this.automatic = true;
    }

    this.channel = channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');

    extras = extras || {};

    var self = this;
    var dataConnector;
    var fileReceiver;
    var textReceiver;

    this.onmessage = function(message, userid) {
        console.debug(userid, 'sent message:', message);
    };

    this.channels = {};
    this.onopen = function(userid) {
        console.debug(userid, 'is connected with you.');
    };

    this.onclose = function(event) {
        console.error('data channel closed:', event);
    };

    this.onerror = function(event) {
        console.error('data channel error:', event);
    };

    // by default; received file will be auto-saved to disk
    this.autoSaveToDisk = true;
    this.onFileReceived = function(fileName) {
        console.debug('File <', fileName, '> received successfully.');
    };

    this.onFileSent = function(file) {
        console.debug('File <', file.name, '> sent successfully.');
    };

    this.onFileProgress = function(packets) {
        console.debug('<', packets.remaining, '> items remaining.');
    };

    function prepareInit(callback) {
        for (var extra in extras) {
            self[extra] = extras[extra];
        }
        self.direction = self.direction || 'many-to-many';
        if (self.userid) {
            window.userid = self.userid;
        }

        if (!self.openSignalingChannel) {
            if (typeof self.transmitRoomOnce === 'undefined') {
                self.transmitRoomOnce = true;
            }

            // socket.io over node.js: https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md
            self.openSignalingChannel = function(config) {
                config = config || {};

                channel = config.channel || self.channel || 'default-channel';
                var socket = new window.Firebase('https://' + (self.firebase || 'webrtc-experiment') + '.firebaseIO.com/' + channel);
                socket.channel = channel;

                socket.on('child_added', function(data) {
                    config.onmessage(data.val());
                });

                socket.send = function(data) {
                    this.push(data);
                };

                if (!self.socket) {
                    self.socket = socket;
                }

                if (channel !== self.channel || (self.isInitiator && channel === self.channel)) {
                    socket.onDisconnect().remove();
                }

                if (config.onopen) {
                    setTimeout(config.onopen, 1);
                }

                return socket;
            };

            if (!window.Firebase) {
                var script = document.createElement('script');
                script.src = 'https://cdn.webrtc-experiment.com/firebase.js';
                script.onload = callback;
                document.documentElement.appendChild(script);
            } else {
                callback();
            }
        } else {
            callback();
        }
    }

    function init() {
        if (self.config) {
            return;
        }

        self.config = {
            ondatachannel: function(room) {
                if (!dataConnector) {
                    self.room = room;
                    return;
                }

                var tempRoom = {
                    id: room.roomToken,
                    owner: room.broadcaster
                };

                if (self.ondatachannel) {
                    return self.ondatachannel(tempRoom);
                }

                if (self.joinedARoom) {
                    return;
                }

                self.joinedARoom = true;

                self.join(tempRoom);
            },
            onopen: function(userid, _channel) {
                self.onopen(userid, _channel);
                self.channels[userid] = {
                    channel: _channel,
                    send: function(data) {
                        self.send(data, this.channel);
                    }
                };
            },
            onmessage: function(data, userid) {
                if (IsDataChannelSupported && !data.size) {
                    data = JSON.parse(data);
                }

                if (!IsDataChannelSupported) {
                    if (data.userid === window.userid) {
                        return;
                    }

                    data = data.message;
                }

                if (data.type === 'text') {
                    textReceiver.receive(data, self.onmessage, userid);
                } else if (typeof data.maxChunks !== 'undefined') {
                    fileReceiver.receive(data, self);
                } else {
                    self.onmessage(data, userid);
                }
            },
            onclose: function(event) {
                var myChannels = self.channels;
                var closedChannel = event.currentTarget;

                for (var userid in myChannels) {
                    if (closedChannel === myChannels[userid].channel) {
                        delete myChannels[userid];
                    }
                }

                self.onclose(event);
            },
            openSignalingChannel: self.openSignalingChannel
        };

        dataConnector = IsDataChannelSupported ?
            new DataConnector(self, self.config) :
            new SocketConnector(self.channel, self.config);

        fileReceiver = new FileReceiver(self);
        textReceiver = new TextReceiver(self);

        if (self.room) {
            self.config.ondatachannel(self.room);
        }
    }

    this.open = function(_channel) {
        self.joinedARoom = true;

        if (self.socket) {
            self.socket.onDisconnect().remove();
        } else {
            self.isInitiator = true;
        }

        if (_channel) {
            self.channel = _channel;
        }

        prepareInit(function() {
            init();
            if (IsDataChannelSupported) {
                dataConnector.createRoom(_channel);
            }
        });
    };

    this.connect = function(_channel) {
        if (_channel) {
            self.channel = _channel;
        }

        prepareInit(init);
    };

    // manually join a room
    this.join = function(room) {
        if (!room.id || !room.owner) {
            throw 'Invalid room info passed.';
        }

        if (!dataConnector) {
            init();
        }

        if (!dataConnector.joinRoom) {
            return;
        }

        dataConnector.joinRoom({
            roomToken: room.id,
            joinUser: room.owner
        });
    };

    this.send = function(data, _channel) {
        if (!data) {
            throw 'No file, data or text message to share.';
        }

        if (typeof data.size !== 'undefined' && typeof data.type !== 'undefined') {
            FileSender.send({
                file: data,
                channel: dataConnector,
                onFileSent: function(file) {
                    self.onFileSent(file);
                },
                onFileProgress: function(packets, uuid) {
                    self.onFileProgress(packets, uuid);
                },

                _channel: _channel,
                root: self
            });

            return;
        }
        TextSender.send({
            text: data,
            channel: dataConnector,
            _channel: _channel,
            root: self
        });
    };

    this.onleave = function(userid) {
        console.debug(userid, 'left!');
    };

    this.leave = this.eject = function(userid) {
        dataConnector.leave(userid, self.autoCloseEntireSession);
    };

    this.openNewSession = function(isOpenNewSession, isNonFirebaseClient) {
        if (isOpenNewSession) {
            if (self.isNewSessionOpened) {
                return;
            }
            self.isNewSessionOpened = true;

            if (!self.joinedARoom) {
                self.open();
            }
        }

        if (!isOpenNewSession || isNonFirebaseClient) {
            self.connect();
        }

        if (!isNonFirebaseClient) {
            return;
        }

        // for non-firebase clients

        setTimeout(function() {
            self.openNewSession(true);
        }, 5000);
    };

    if (typeof this.preferSCTP === 'undefined') {
        this.preferSCTP = isFirefox || chromeVersion >= 32 ? true : false;
    }

    if (typeof this.chunkSize === 'undefined') {
        this.chunkSize = isFirefox || chromeVersion >= 32 ? 13 * 1000 : 1000; // 1000 chars for RTP and 13000 chars for SCTP
    }

    if (typeof this.chunkInterval === 'undefined') {
        this.chunkInterval = isFirefox || chromeVersion >= 32 ? 100 : 500; // 500ms for RTP and 100ms for SCTP
    }

    if (self.automatic) {
        if (window.Firebase) {
            console.debug('checking presence of the room..');
            new window.Firebase('https://' + (extras.firebase || self.firebase || 'webrtc-experiment') + '.firebaseIO.com/' + self.channel).once('value', function(data) {
                console.debug('room is present?', data.val() !== null);
                self.openNewSession(data.val() === null);
            });
        } else {
            self.openNewSession(false, true);
        }
    }
};
