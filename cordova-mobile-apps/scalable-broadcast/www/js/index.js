var app = {
    initialize: function() {
        console.error = window.onerror = function() {
            if (JSON.stringify(arguments).indexOf('iosrtc') !== -1) {
                return;
            }

            if (JSON.stringify(arguments).indexOf('No Content-Security-Policy') !== -1) {
                return;
            }

            if (JSON.stringify(arguments).indexOf('<') !== -1) {
                return;
            }

            alert(JSON.stringify(arguments, null, ' '));
        };

        app.bindEvents();
    },
    checkAndroidPermissions: function(callback) {
        if (device.platform !== 'Android') {
            callback();
            return;
        }

        var permissions = cordova.plugins.permissions;

        var arr = [
            permissions.CAMERA,
            permissions.RECORD_AUDIO,
            permissions.MODIFY_AUDIO_SETTINGS
        ];

        permissions.hasPermission(arr, function(status) {
            if (status.hasPermission) {
                callback();
                return;
            }

            permissions.requestPermissions(arr, function(status) {
                if (status.hasPermission) {
                    callback();
                    return;
                }
                alert('Please manually enable camera and microphone permissions.');
            }, function() {
                alert('Please manually enable camera and microphone permissions.');
            });
        }, function() {
            alert('Please manually enable camera and microphone permissions.');
        });
    },
    bindEvents: function() {
        document.addEventListener('deviceready', app.onDeviceReady, false);
        document.addEventListener('resume', function() {
            if (window.connection && connection.getAllParticipants().length) {
                return;
            }
            // location.reload();
        }, false);

        document.addEventListener('online', function() {
            // location.reload();
        }, false);

        document.addEventListener('offline', function() {
            alert('Seems disconnected.');
        }, false);

        document.querySelector('.btn-leave-room').onclick = function() {
            if(window.connection) {
                try {
                    window.connection.attachStreams.forEach(function(stream) {
                        stream.stop();
                    });

                    window.connection.close();
                }
                catch(e){}

                window.connection = null;
            }
            document.getElementById('video-preview').pause();
            document.getElementById('video-preview').src = null;
            location.reload();
        };
    },
    loadDevices: function() {
        var listOfCameras = document.getElementById('list-of-cameras');
        DetectRTC.load(function() {
            listOfCameras.innerHTML = '';

            var deviceId;
            DetectRTC.videoInputDevices.forEach(function(device, idx) {
                var option = document.createElement('option');
                option.value = device.deviceId;
                option.innerHTML = device.label || ('Camera ' + (idx + 1));
                listOfCameras.appendChild(option);
            });
        });
    },
    onDeviceReady: function() {
        cordova.plugins && cordova.plugins.permissions && ['CAMERA', 'MICROPHONE', 'MODIFY_AUDIO_SETTINGS', 'RECORD_AUDIO'].forEach(function(p) {
            var permission = cordova.plugins.permissions[p];
            if(!permission) return;
            cordova.plugins.permissions.hasPermission(permission, function(status) {
                if(status.hasPermission) {
                    return;
                }

                cordova.plugins.permissions.requestPermission(permission, function() {}, function() {});
            }, function() {})
        });

        var connection = new RTCMultiConnection();

        app.loadDevices();

        connection.onNumberOfBroadcastViewersUpdated = function(event) {
            if (!connection.isInitiator) return;

            document.getElementById('broadcast-viewers-counter').innerHTML = 'Number of broadcast viewers: <b>' + event.numberOfBroadcastViewers + '</b>';
            document.getElementById('broadcast-viewers-counter').style = event.numberOfBroadcastViewers > 0 ? 'block' : 'none';
        };

        // its mandatory in v3
        connection.enableScalableBroadcast = true;

        // each relaying-user should serve only 1 users
        connection.maxRelayLimitPerUser = 1;

        // we don't need to keep room-opened
        // scalable-broadcast.js will handle stuff itself.
        connection.autoCloseEntireSession = true;

        // by default, socket.io server is assumed to be deployed on your own URL
        // connection.socketURL = '/';

        // comment-out below line if you do not have your own socket.io server
        connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

        connection.socketMessageEvent = 'scalable-media-broadcast-demo';

        // document.getElementById('broadcast-id').value = connection.userid;

        // user need to connect server, so that others can reach him.
        connection.connectSocket(function(socket) {
            socket.on('logs', function(log) {
                document.querySelector('h1').innerHTML = log.replace(/</g, '----').replace(/>/g, '___').replace(/----/g, '(<span style="color:red;">').replace(/___/g, '</span>)');
            });

            // this event is emitted when a broadcast is already created.
            socket.on('join-broadcaster', function(hintsToJoinBroadcast) {
                console.log('join-broadcaster', hintsToJoinBroadcast);

                connection.session = hintsToJoinBroadcast.typeOfStreams;
                connection.sdpConstraints.mandatory = {
                    OfferToReceiveVideo: !!connection.session.video,
                    OfferToReceiveAudio: !!connection.session.audio
                };

                var listOfCameras = document.getElementById('list-of-cameras');

                connection.mediaConstraints.video = {
                            mandatory: {
                                sourceId: listOfCameras.value
                            },
                            optional: []
                        };

                    listOfCameras.disabled = true;
                        
                    connection.join(hintsToJoinBroadcast.userid);
            });

            socket.on('rejoin-broadcast', function(broadcastId) {
                console.log('rejoin-broadcast', broadcastId);

                connection.attachStreams = [];
                socket.emit('check-broadcast-presence', broadcastId, function(isBroadcastExists) {
                    if (!isBroadcastExists) {
                        // the first person (i.e. real-broadcaster) MUST set his user-id
                        connection.userid = broadcastId;
                    }

                    socket.emit('join-broadcast', {
                        broadcastId: broadcastId,
                        userid: connection.userid,
                        typeOfStreams: connection.session
                    });
                });
            });

            socket.on('broadcast-stopped', function(broadcastId) {
                // alert('Broadcast has been stopped.');
                // location.reload();
                console.error('broadcast-stopped', broadcastId);
                alert('This broadcast has been stopped.');
            });

            // this event is emitted when a broadcast is absent.
            socket.on('start-broadcasting', function(typeOfStreams) {
                console.log('start-broadcasting', typeOfStreams);

                // host i.e. sender should always use this!
                connection.sdpConstraints.mandatory = {
                    OfferToReceiveVideo: false,
                    OfferToReceiveAudio: false
                };
                connection.session = typeOfStreams;

                app.checkAndroidPermissions(function() {
                    var listOfCameras = document.getElementById('list-of-cameras');
                    connection.mediaConstraints.video = {
                                mandatory: {
                                    sourceId: listOfCameras.value
                                },
                                optional: []
                            };

                        listOfCameras.disabled = true;

                        // "open" method here will capture media-stream
                        // we can skip this function always; it is totally optional here.
                        // we can use "connection.getUserMediaHandler" instead
                        connection.open(connection.userid);
                });
            });
        });

        window.onbeforeunload = function() {
            // Firefox is ugly.
            document.getElementById('open-or-join').disabled = false;
        };

        var videoPreview = document.getElementById('video-preview');

        connection.onstream = function(event) {
            if (connection.isInitiator && event.type !== 'local') {
                return;
            }

            if (event.mediaElement) {
                event.mediaElement.pause();
                delete event.mediaElement;
            }

            videoPreview.src = URL.createObjectURL(event.stream);
            videoPreview.play();

            videoPreview.userid = event.userid;

            if (event.type === 'local') {
                videoPreview.muted = true;
            }

            if (connection.isInitiator == false && event.type === 'remote') {
                // he is merely relaying the media
                connection.dontCaptureUserMedia = true;
                connection.attachStreams = [event.stream];
                connection.sdpConstraints.mandatory = {
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: false
                };

                var socket = connection.getSocket();
                socket.emit('can-relay-broadcast');

                if (connection.DetectRTC.browser.name === 'Chrome') {
                    connection.getAllParticipants().forEach(function(p) {
                        if (p + '' != event.userid + '') {
                            var peer = connection.peers[p].peer;
                            peer.getLocalStreams().forEach(function(localStream) {
                                peer.removeStream(localStream);
                            });
                            peer.addStream(event.stream);
                            connection.dontAttachStream = true;
                            connection.renegotiate(p);
                            connection.dontAttachStream = false;
                        }
                    });
                }

                if (connection.DetectRTC.browser.name === 'Firefox') {
                    // Firefox is NOT supporting removeStream method
                    // that's why using alternative hack.
                    // NOTE: Firefox seems unable to replace-tracks of the remote-media-stream
                    // need to ask all deeper nodes to rejoin
                    connection.getAllParticipants().forEach(function(p) {
                        if (p + '' != event.userid + '') {
                            connection.replaceTrack(event.stream, p);
                        }
                    });
                }
            }
        };

        // ask node.js server to look for a broadcast
        // if broadcast is available, simply join it. i.e. "join-broadcaster" event should be emitted.
        // if broadcast is absent, simply create it. i.e. "start-broadcasting" event should be fired.
        document.getElementById('open-or-join').onclick = function() {
            var broadcastId = document.getElementById('broadcast-id').value;
            if (broadcastId.replace(/^\s+|\s+$/g, '').length <= 0) {
                alert('Please enter broadcast-id');
                document.getElementById('broadcast-id').focus();
                return;
            }

            document.getElementById('open-or-join').disabled = true;

            connection.session = {
                audio: true,
                video: true,
                oneway: true
            };

            var socket = connection.getSocket();

            socket.emit('check-broadcast-presence', broadcastId, function(isBroadcastExists) {
                if (!isBroadcastExists) {
                    // the first person (i.e. real-broadcaster) MUST set his user-id
                    connection.userid = broadcastId;
                }

                console.log('check-broadcast-presence', broadcastId, isBroadcastExists);

                socket.emit('join-broadcast', {
                    broadcastId: broadcastId,
                    userid: connection.userid,
                    typeOfStreams: connection.session
                });
            });
        };

        connection.onstreamended = function() {};

        connection.onleave = function(event) {
            if (event.userid !== videoPreview.userid) return;

            var socket = connection.getSocket();
            socket.emit('can-not-relay-broadcast');
        };

        function disableInputButtons() {
            document.getElementById('open-or-join').disabled = true;
            document.getElementById('broadcast-id').disabled = true;
        }

        // ......................................................
        // ......................Handling broadcast-id...........
        // ......................................................

        var broadcastId = '';
        if (localStorage.getItem(connection.socketMessageEvent)) {
            broadcastId = localStorage.getItem(connection.socketMessageEvent);
        } else {
            broadcastId = connection.token();
        }
        document.getElementById('broadcast-id').value = broadcastId;
        document.getElementById('broadcast-id').onkeyup = function() {
            localStorage.setItem(connection.socketMessageEvent, this.value);
        };
    }
};

app.initialize();
