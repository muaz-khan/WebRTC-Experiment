// Last time updated at Sep 15, 2014, 08:32:23

// Latest file can be found here: https://cdn.webrtc-experiment.com/conversation.js

// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// _______________
// Conversation.js

/*
-. Signaler object added. See below for how to use it.

var signaler = new Signaler();
signaler.on('message', function(message) {
    socket.send(message);
});

socket.on('message', function(message) {
    signaler.emit('message', message);
});

var user = new User();

signaler.connect(user);
*/

(function() {
    window.Signaler = function() {
        var signaler = this;
        var users = [];
        signaler.connect = function(user) {
            user.signaler = signaler;
            user.emit('--signaler-connected');
            users.push(user);
        };

        signaler.send = function(data) {
            signaler.emit('--message', data);
        };

        signaler.events = {};
        signaler.on = function(event, callback) {
            signaler.events[event] = callback;
        };

        signaler.emit = function() {
            if (!arguments[0]) throw 'At least one argument is mandatory.';

            var internalevent = arguments[0].indexOf('--') == 0;
            if (!internalevent) {
                if (arguments[0] == 'message') {
                    var message = arguments[1];
                    users.forEach(function(user) {
                        user.onsignalingmessage(message);
                    });
                }

                return;
            }

            if (internalevent) {
                arguments[0] = arguments[0].replace('--', '');
            }

            if (!signaler.events[arguments[0]]) {
                var warning = 'Event name "' + arguments[0] + '" doesn\'t exists.';
                if (arguments[1]) warning += ' Values: ' + JSON.stringify(arguments[1], null, '\t');
                console.warn(warning);

            } else signaler.events[arguments[0]](arguments[1], arguments[2], arguments[3], arguments[4]);
        };
    };

    window.User = function(_defaults) {
        var user = this;

        user.randomstring = function() {
            // suggested by @rvulpescu from #154
            if (window.crypto && crypto.getRandomValues && navigator.userAgent.indexOf('Safari') == -1) {
                var a = window.crypto.getRandomValues(new Uint32Array(3)),
                    token = '';
                for (var i = 0, l = a.length; i < l; i++) {
                    token += a[i].toString(36);
                }
                return token;
            } else {
                return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
            }
        };

        user.defaults = {};
        user.username = user.randomstring();
        user.status = 'online';

        user.openconversationwith = function(targetuser) {
            var conversation = new Conversation(user, targetuser);

            // check who is online
            user.emit('signal', {
                whoisonline: true,
                responsefor: targetuser
            });
        };

        user.onmessagecallbacks = {};
        user.onsignalingmessage = function(message) {
            if (message.isrtcmulticonnectioninnermessage && user.onmessagecallbacks[message.channel]) {
                return user.onmessagecallbacks[message.channel](message.message);
            }

            if (message.searchuser) {
                if (user.status === 'online') {
                    user.emit('signal', {
                        useronline: true,
                        responsefor: message.sender
                    });
                }
                return;
            }

            if (message.useronline && message.responsefor == user.username) {
                user.emit('--search', {
                    username: message.sender
                });
                return;
            }

            if (message.whoisonline && message.responsefor == user.username && user.status == 'online') {
                user.emit('--friend-request', {
                    accept: function() {
                        if (!user.peers[message.sender]) {
                            var randomchannel = user.randomstring();
                            user.emit('signal', {
                                iamonline: true,
                                responsefor: message.sender,
                                randomchannel: randomchannel
                            });

                            var conversation = new Conversation(user, message.sender);

                            conversation.addnewrtcmulticonnectionpeer({
                                targetuser: message.sender,
                                channel: randomchannel
                            });
                        }

                        user.emit('signal', {
                            requestaccepted: true,
                            sender: user.username,
                            responsefor: message.sender
                        });
                    },
                    reject: function() {
                        user.emit('signal', {
                            requestrejected: true,
                            sender: user.username,
                            responsefor: message.sender
                        });
                    },
                    sender: message.sender
                });
            }

            if (message.requestaccepted && message.responsefor == user.username) {
                user.emit('--request-status', {
                    status: 'accepted',
                    sender: message.sender
                });
            }

            if (message.requestrejected && message.responsefor == user.username) {
                user.emit('--request-status', {
                    status: 'accepted',
                    sender: message.sender
                });
            }

            if (message.iamonline && message.responsefor == user.username) {
                if (!user.peers[message.sender]) {
                    user.conversations[message.sender].addnewrtcmulticonnectionpeer({
                        targetuser: message.sender,
                        channel: message.randomchannel,
                        isInitiator: true
                    });
                }
            }

            if (message.sessionDescription && message.responsefor == user.username) {
                user.peers[message.sender].join(message.sessionDescription);
            }
        }

        // reference to all RTCMultiConnection peers
        user.peers = {
            emit: function(eventName, value) {
                for (var conversation in user.conversations) {
                    user.conversations[conversation].emit(eventName, value);
                }
            },
            length: 0
        };

        // reference to all Conversation objects
        user.conversations = {};

        // reference to all local media streams
        user.localstreams = {};

        user.events = {};
        user.on = function(event, callback) {
            user.events[event] = callback;
        };

        user.emit = function() {
            if (!arguments[0]) throw 'At least one argument is mandatory.';

            var internalevent = arguments[0].indexOf('--') == 0;
            if (!internalevent) {
                if (arguments[0] == 'search') {
                    user.emit('signal', {
                        searchuser: arguments[1]
                    });
                }

                if (arguments[0] == 'signal') {
                    var data = arguments[1];
                    data.sender = user.username;
                    user.signaler.emit('--message', data);
                }

                return;
            }

            if (internalevent) {
                arguments[0] = arguments[0].replace('--', '');
                if (arguments[0] == 'log' && user.defaults.log == false) return;
            }

            if (!user.events[arguments[0]]) {
                var warning = 'Event name "' + arguments[0] + '" doesn\'t exists.';
                if (arguments[1]) warning += ' Values: ' + JSON.stringify(arguments[1], null, '\t');
                console.warn(warning);

            } else user.events[arguments[0]](arguments[1], arguments[2], arguments[3], arguments[4]);
        };

        // defaults
        user.on('request-status', function(request) {
            user.emit('--log', request.sender + ' ' + request.status + ' your request.');
        });

        user.on('friend-request', function(request) {
            request.accept();
        });

        user.on('signaler-connected', function() {
            user.emit('--log', 'Signaling medium is ready for pub/sub.');
        });

        user.on('log', function(message) {
            console.log(message);
        });

        for (var data in _defaults || {}) {
            user.defaults[data] = _defaults[data];
        }

        if (_defaults) {
            user.emit('signaler', 'start');
        }
    };

    function Conversation(user, targetuser) {
        var conversation = this;

        function sendmessage(data) {
            conversation.peer.send(data);
        }

        function enablemicrophone() {
            if (user.localstreams.microphone) return;

            conversation.peer.captureUserMedia(function(stream) {
                user.localstreams.microphone = stream;

                conversation.peer.peers[targetuser].peer.connection.addStream(stream);

                conversation.peer.send({
                    signalingmessage: true,
                    hasmicrophone: true,
                    streamavailable: true,
                    sender: user.username,
                    type: 'audio'
                });
            }, {
                audio: true
            });
        }

        function enablecamera() {
            if (user.localstreams.camera) return;

            conversation.peer.captureUserMedia(function(stream) {
                user.localstreams.camera = stream;
                conversation.peer.peers[targetuser].peer.connection.addStream(stream);

                conversation.peer.send({
                    signalingmessage: true,
                    hascamera: true,
                    streamavailable: true,
                    sender: user.username,
                    type: 'video'
                });
            }, {
                audio: true,
                video: true
            });
        }

        function enablescreen() {
            if (user.localstreams.screen) return;

            conversation.peer.captureUserMedia(function(stream) {
                user.localstreams.screen = stream;

                conversation.peer.peers[targetuser].peer.connection.addStream(stream);

                conversation.peer.send({
                    signalingmessage: true,
                    hasscreen: true,
                    streamavailable: true,
                    sender: user.username,
                    type: 'screen'
                });
            }, {
                screen: true
            });
        };

        conversation.attachie = {
            files: {},
            messages: {}
        };

        conversation.addnewrtcmulticonnectionpeer = function(args) {
            var connection = new RTCMultiConnection(args.channel);

            for (var d in user.defaults) {
                if (typeof connection[d] !== 'undefined' /* && typeof connection[d] !== 'function' */ ) {
                    connection[d] = user.defaults[d];
                }
            }

            // workaround for RTCMultiConnection-v1.8 or older
            if (user.defaults.log == false) {
                connection.skipLogs();
            }

            connection.userid = user.username;

            // v1.9 and onwards supports "onlog" event.
            connection.onlog = function(message) {
                user.emit('--log', JSON.stringify(message, null, '\t'));
            };

            connection.session = {
                data: true
            };

            connection.onopen = function() {
                conversation.targetuser = args.targetuser;
                user.emit('--conversation-opened', conversation);
            };

            connection.onmessage = function(event) {
                if (event.data.signalingmessage) {
                    var data = event.data;

                    if (data.streamavailable) {
                        data.emit = function(first, second) {
                            if (first == 'join-with' && second == 'nothing') {
                                preview();
                            }

                            if (first == 'join-with' && second == 'microphone') {
                                joinwithmicrophone();
                            }

                            if (first == 'join-with' && second == 'camera') {
                                joinwithcamera();
                            }

                            if (first == 'join-with' && second == 'screen') {
                                joinwithscreen();
                            }
                        };

                        function preview() {
                            connection.send({
                                signalingmessage: true,
                                shareoneway: true,
                                hasmicrophone: !!data.hasmicrophone,
                                hascamera: !!data.hascamera,
                                hasscreen: !!data.hasscreen
                            });
                        }

                        function joinwithmicrophone() {
                            conversation.peer.peers[targetuser].addStream({
                                audio: true,
                                oneway: true
                            });
                        }

                        function joinwithcamera() {
                            conversation.peer.peers[targetuser].addStream({
                                audio: true,
                                video: true,
                                oneway: true
                            });
                        }

                        function joinwithscreen() {
                            conversation.peer.peers[targetuser].addStream({
                                screen: true,
                                oneway: true
                            });
                        }

                        conversation.emit('--media-enabled', event.data);
                    }

                    if (data.shareoneway) {
                        if (data.hasmicrophone) {
                            if (!user.localstreams.microphone) throw 'You have not allowed microphone.';
                            connection.renegotiate();
                        }

                        if (data.hascamera) {
                            if (!user.localstreams.camera) throw 'You have not allowed camera.';
                            connection.renegotiate();
                        }

                        if (data.hasscreen) {
                            if (!user.localstreams.screen) throw 'You have not allowed screen.';
                            connection.renegotiate();
                        }
                    }

                    if (data.addedfile) {
                        var filesinfo = data.filesinfo;
                        if (filesinfo.size && filesinfo.type) {
                            filesinfo = eventHanlders(filesinfo);
                            conversation.emit('--add-file', filesinfo);
                        } else {
                            for (var file in filesinfo) {
                                filesinfo[file] = eventHanlders(filesinfo[file]);
                                conversation.emit('--add-file', filesinfo[file]);
                            }
                        }

                        function eventHanlders(file) {
                            file.sender = targetuser;

                            file.download = function() {
                                conversation.peer.send({
                                    signalingmessage: true,
                                    download: true,
                                    sender: user.username,
                                    file: {
                                        size: file.size,
                                        type: file.type,
                                        name: file.name,
                                        lastModifiedDate: file.lastModifiedDate,
                                        uuid: file.uuid
                                    }
                                });
                            };

                            file.cancel = function() {
                                conversation.peer.send({
                                    signalingmessage: true,
                                    download: false,
                                    sender: user.username,
                                    file: {
                                        size: file.size,
                                        type: file.type,
                                        name: file.name,
                                        lastModifiedDate: file.lastModifiedDate,
                                        uuid: file.uuid
                                    }
                                });
                            };

                            return file;
                        }
                    }

                    if (data.file) {
                        if (data.download) {
                            var file = conversation.attachie.files[data.file.name];
                            if ((file.item && file.length && file[0] && file[0].lastModifiedDate) || file.forEach) {
                                Array.prototype.slice.call(file).forEach(function(f) {
                                    conversation.peer.send(f);
                                });
                            } else conversation.peer.send(file);
                        } else {
                            var file = conversation.attachie.files[data.file.name];
                            conversation.emit('--file-cancelled', file);
                        }
                    }
                } else {
                    event.username = conversation.targetuser;
                    conversation.emit('--message', event);
                }
            };

            // overriding "openSignalingChannel" method
            connection.openSignalingChannel = function(config) {
                var channel = config.channel || this.channel;

                user.onmessagecallbacks[channel] = config.onmessage;

                if (config.onopen) setTimeout(config.onopen, 1000);

                // directly returning socket object using "return" statement
                return {
                    send: function(message) {
                        user.emit('signal', {
                            message: message,
                            isrtcmulticonnectioninnermessage: true,
                            channel: channel
                        });
                    },
                    channel: channel
                };
            };

            // todo: renegotiation doesn't work if trickleIce=false
            // need to fix it.
            // connection.trickleIce = false;

            connection.sdpConstraints.mandatory = {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            };

            connection.autoSaveToDisk = false;

            connection.onFileEnd = function(file) {
                if (conversation.attachie.files[file.name]) {
                    conversation.emit('--file-sent', file);
                    return;
                }

                file.savetodisk = function(filename) {
                    connection.saveToDisk(file, filename || file.name || file.type);
                };

                file.sender = file.userid;

                conversation.emit('--file-downloaded', file);
            };

            connection.onFileProgress = function(chunk) {
                var progress = {
                    percentage: Math.round((chunk.currentPosition / chunk.maxChunks) * 100),
                    uuid: chunk.uuid,
                    file: chunk,
                    sender: chunk.userid
                };

                if (progress.percentage > 100) progress.percentage = 100;

                conversation.emit('--file-progress', progress);
            };

            connection.onFileStart = function() {};

            connection.onstreamid = function(event) {
                conversation.emit('--stream-clue', event);
            };

            connection.onstream = function(event) {
                conversation.emit('--stream', event);
            };

            connection.onstreamended = function(event) {
                conversation.emit('--stream-ended', event);
            };

            if (args.isInitiator) {
                connection.open({
                    dontTransmit: true
                });
            }

            user.peers[args.targetuser] = connection;

            user.peers.length++;
            connection.onleave = function() {
                user.peers.length--;
            };

            user.emit('signal', {
                joinRoom: true,
                responsefor: args.targetuser,
                sessionDescription: connection.sessionDescription
            });

            conversation.peer = connection;
        }

        function addfile(file) {
            var filesinfo = {};

            // seems array of files
            if ((file.item && file.length && file[0] && file[0].lastModifiedDate) || file.forEach) {
                Array.prototype.slice.call(file).forEach(function(f) {
                    if (!f.uuid) f.uuid = user.randomstring();
                    filesinfo[file.name] = {
                        size: f.size,
                        type: f.type,
                        name: f.name,
                        lastModifiedDate: f.lastModifiedDate,
                        uuid: f.uuid
                    };
                    conversation.attachie.files[f.name] = f;
                });
            } else {
                if (!file.uuid) file.uuid = user.randomstring();
                filesinfo[file.name] = {
                    size: file.size,
                    type: file.type,
                    name: file.name,
                    lastModifiedDate: file.lastModifiedDate,
                    uuid: file.uuid
                };

                conversation.attachie.files[file.name] = file;
            }

            conversation.peer.send({
                addedfile: true,
                filesinfo: filesinfo,
                signalingmessage: true,
                sender: user.username
            });
        }

        // custom events

        conversation.events = {};
        conversation.on = function(event, callback) {
            conversation.events[event] = callback;
        };

        conversation.emit = function() {
            if (!arguments[0]) throw 'At least one argument is mandatory.';

            var internalevent = arguments[0].indexOf('--') == 0;
            if (!internalevent) {
                if (arguments[0] == 'message') {
                    sendmessage(arguments[1]);
                }

                if (arguments[0] == 'add-file' && arguments[1]) {
                    addfile(arguments[1]);
                }

                if (arguments[0] == 'enable') {
                    if (arguments[1] == 'microphone') {
                        enablemicrophone();
                    }

                    if (arguments[1] == 'camera') {
                        enablecamera();
                    }

                    if (arguments[1] == 'screen') {
                        enablescreen();
                    }
                }

                if (arguments[0] == 'end') {
                    conversation.peer.close();
                    user.emit('--ended');
                }

                return;
            }

            if (internalevent) {
                arguments[0] = arguments[0].replace('--', '');
            }

            if (!conversation.events[arguments[0]]) {
                var warning = 'Event name "' + arguments[0] + '" doesn\'t exists.';
                if (arguments[1]) warning += ' Values: ' + JSON.stringify(arguments[1], null, '\t');
                console.warn(warning);

            } else conversation.events[arguments[0]](arguments[1], arguments[2], arguments[3], arguments[4]);
        };

        conversation.on('add-file', function(file) {
            file.download();
        });

        conversation.on('file-downloaded', function(file) {
            file.savetodisk();
        });

        conversation.on('media-enabled', function(media) {
            if (media.hasmicrophone) {
                media.emit('join-with', 'microphone');
            }

            if (media.hascamera) {
                media.emit('join-with', 'camera');
            }

            if (media.hasscreen) {
                media.emit('join-with', 'nothing');
            }
        });

        conversation.on('stream-clue', function(stream) {
            user.emit('--log', 'stream-clue: ' + stream.streamid);
        });

        conversation.on('stream', function(stream) {
            user.emit('--log', 'stream: ' + stream.streamid);

            conversation.peer.body.insertBefore(stream.mediaElement, conversation.peer.body.firstChild);
        });

        conversation.on('stream-ended', function(stream) {
            user.emit('--log', 'stream-ended: ' + stream.streamid);

            if (stream.mediaElement && stream.mediaElement.parentNode) {
                stream.mediaElement.parentNode.removeChild(stream.mediaElement);
            }
        });

        user.conversations[targetuser] = conversation;
    }
})();
