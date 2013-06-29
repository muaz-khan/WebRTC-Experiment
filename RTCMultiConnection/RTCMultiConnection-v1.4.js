// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

(function() {

    // a middle-agent between public API and the Signaler object

    window.RTCMultiConnection = function(channel) {
        var signaler, self = this;

        this.channel = channel || location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
        this.userid = getToken();

        // on each new session
        this.onNewSession = function(session) {
            if (self._roomid && self._roomid != session.roomid)
                return;

            if (self.detectedRoom)
                return;
            self.detectedRoom = true;

            self.join(session);
        };

        function initSignaler() {
            signaler = new Signaler(self);
        }

        function captureUserMedia(callback) {
            var session = self.session,
                constraints = {
                    audio: true,
                    video: true
                };

            console.debug(JSON.stringify(session, null, '\t'));

            // using "noMediaStream" instead of "dontAttachStream"
            // using "stream" instead of "attachStream"
            if (self.noMediaStream || self.stream)
                return callback();

            if (isData(session)) {
                self.stream = null;
                return callback();
            }

            if (session.audio && !session.video) {
                constraints = {
                    audio: true,
                    video: false
                };
            } else if (session.screen) {
                var screen_constraints = {
                    mandatory: {
                        chromeMediaSource: 'screen'
                    },
                    optional: []
                };
                constraints = {
                    audio: false,
                    video: screen_constraints
                };
            } else if (session.video && !session.audio) {
                var video_constraints = {
                    mandatory: { },
                    optional: []
                };
                constraints = {
                    audio: false,
                    video: video_constraints
                };
            }

            navigator.getUserMedia(constraints, onstream, mediaError);

            function onstream(stream) {
                var mediaElement = getMediaElement(stream, session);

                // preferred to set "true"
                mediaElement.muted = true;

                var streamid = getToken();

                // if local stream is stopped
                stream.onended = function() {
                    if (self.onstreamended)
                        self.onstreamended(streamOutput);
                };

                var streamOutput = {
                    mediaElement: mediaElement,
                    stream: stream,
                    userid: 'self',
                    extra: self.extra || { },
                    streamid: streamid,
                    session: self.session,
                    type: 'local'
                };

                self.onstream(streamOutput);

                if (!self.streams)
                    self.streams = { };
                self.streams[streamid] = getStream(stream);

                self.stream = stream;
                callback(stream);
            }
        }

        // it is used to capture renegotiation streams
        this.captureUserMedia = captureUserMedia;

        // open new connection
        this.open = function(roomid) {
            self.detectedRoom = true;
            captureUserMedia(function() {
                !signaler && initSignaler();
                signaler.broadcast({
                    roomid: roomid
                });
            });
        };

        // join pre-created data connection
        this.join = function(room) {
            // if room is shared oneway; don't capture self-media
            if (this.session.oneway)
                join();
            else
                captureUserMedia(join);

            function join() {
                !signaler && initSignaler();
                signaler.join({
                    to: room.userid,
                    roomid: room.roomid
                });
            }
        };

        this.send = function(data, _channel) {
            if (!data)
                throw 'No file, data or text message to share.';
            if (data.size)
                FileSender.send({
                    file: data,
                    root: self,
                    channel: _channel,
                    userid: self.userid,
                    extra: self.extra
                });
            else
                TextSender.send({
                    text: data,
                    root: self,
                    channel: _channel,
                    userid: self.userid,
                    extra: self.extra
                });
        };

        this.connect = function(roomid) {
            if (roomid)
                self._roomid = roomid;
            initSignaler();
        };

        this.session = {
            audio: true,
            video: true,
            data: true
        };

        this.maxParticipantsAllowed = 10;
    };

    // it is the backbone object in RTCMultiConnection.js library

    function Signaler(root) {
        // unique identifier for the current user
        var userid = root.userid || getToken();

        // self instance
        var signaler = this;

        var session = root.session;

        // object to store all connected peers
        var peers = { };

        // object to store all connected users' ids
        root.users = { };

        // object to allow mute/unmute/stop any stream
        root.streams = { }; // it is called when your signaling implementation fires "onmessage"
        this.onmessage = function(message) {
            // if new room detected
            if (message.roomid && message.broadcasting) {
                // one user can participate in one room at a time
                if (!signaler.sentParticipationRequest) {
                    // broadcaster's and participant's session must be identical
                    root.session = message.session;
                    root.onNewSession(message);
                }
            } else
                // for pretty logging
                console.debug(JSON.stringify(message, function(key, value) {
                    if (value && value.sdp) {
                        console.log(value.sdp.type, '————', value.sdp.sdp);
                        return '';
                    } else
                        return value;
                }, '————'));

            // if someone shared SDP
            if (message.sdp && message.to == userid)
                this.onsdp(message);

            // if someone shared ICE
            if (message.candidate && message.to == userid)
                this.onice(message);

            // if someone sent participation request
            if (message.participationRequest
                && message.to == userid

                    // make sure it is absolute "NEW" user
                    && !!root.users[message.userid] == false

                        // number of participants must be less than or
                        // equal to maximum participants allowed.
                        && getLength(root.users) < root.maxParticipantsAllowed) {

                root.users[message.userid] = merge(usersArrayOptions, {
                    userid: message.userid
                });

                participationRequest(message);
            }

            // session initiator transmitted new participant's details
            // it is useful for multi-users connectivity
            if (message.conferencing
                // make sure "newcomer" is not "he", himself
                && message.newcomer != userid

                    // make sure it is absolute "NEW" user for him
                    && !!root.users[message.newcomer] == false) {

                root.users[message.newcomer] = merge(usersArrayOptions, {
                    userid: message.newcomer
                });

                root.stream && signaler.signal({
                    participationRequest: true,
                    to: message.newcomer
                });
            }

            // if current user is suggested to play role of broadcaster
            // to keep session "active" all the time; event if session initiator leaves
            if (message.playRoleOfBroadcaster === userid)
                this.broadcast({
                    roomid: signaler.roomid
                });

            // broadcaster forced this user to leave the room!
            if (message.getOut && message.who == userid)
                leave();

            if (message.renegotiate /* && message.to == userid */) {
                addStream(message.session, function() {
                    signaler.signal({
                        readyForRenegotation: true,
                        to: message.userid
                    });
                });
            }

            if (message.readyForRenegotation && message.to == userid) renegotiate(message.userid);
        };

        // it is appeared that 10 or more users can send 
        // participation requests concurrently
        // onicecandidate fails in such case
        // that's why timeout "intervals" used for loop-back

        function participationRequest(message) {
            if (!signaler.creatingOffer) {
                signaler.creatingOffer = true;
                createOffer(message);
                setTimeout(function() {
                    signaler.creatingOffer = false;
                    if (signaler.participants &&
                        signaler.participants.length)
                        repeatedlyCreateOffer();
                }, 5000);
            } else {
                if (!signaler.participants)
                    signaler.participants = [];
                signaler.participants[signaler.participants.length] = message;
            }
        }

        // reusable function to create new offer

        function createOffer(message) {
            var _options = merge(options, {
                to: message.userid,
                extra: message.extra,
                stream: root.stream
            });
            peers[message.userid] = Offer.createOffer(_options);
        }

        // reusable function to create new offer repeatedly

        function repeatedlyCreateOffer() {
            var firstParticipant = signaler.participants[0];
            if (!firstParticipant)
                return;

            signaler.creatingOffer = true;
            createOffer(firstParticipant);

            // delete "firstParticipant" and swap array
            delete signaler.participants[0];
            signaler.participants = swap(signaler.participants);

            setTimeout(function() {
                signaler.creatingOffer = false;
                if (signaler.participants[0])
                    repeatedlyCreateOffer();
            }, 5000);
        }

        // if someone shared SDP
        this.onsdp = function(message) {
            var sdp = message.sdp;

            if (sdp.type == 'offer') {
                var _options = merge(options, {
                    to: message.userid,
                    extra: message.extra,
                    stream: root.stream,
                    sdp: sdp
                });
                peers[message.userid] = Answer.createAnswer(_options);
            }

            if (sdp.type == 'answer') {
                peers[message.userid].setRemoteDescription(sdp);
            }
        };

        // if someone shared ICE
        this.onice = function(message) {
            var peer = peers[message.userid];
            if (peer)
                peer.addIceCandidate(message.candidate);
        };

        // it is passed over Offer/Answer objects for reusability
        var options = {
            onsdp: function(e) {
                signaler.signal({
                    sdp: e.sdp,
                    to: e.userid,
                    extra: e.extra
                });
            },
            onicecandidate: function(e) {
                signaler.signal({
                    candidate: e.candidate,
                    to: e.userid,
                    extra: e.extra
                });
            },
            onstream: function(e) {
                var stream = e.stream;

                console.debug('onaddstream', '>>>>>>', stream);

                // stream-id allows you stop/mute/unmute any stream
                var streamid = getToken();

                // HTMLAudioElement or HTMLVideoElement
                var mediaElement = getMediaElement(stream, session);

                function onRemoteStreamStartsFlowing() {
                    if (!(mediaElement.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || mediaElement.paused || mediaElement.currentTime <= 0)) {
                        afterRemoteStreamStartedFlowing();
                    } else
                        setTimeout(onRemoteStreamStartsFlowing, 300);
                }

                function afterRemoteStreamStartedFlowing() {
                    if (!root.onstream)
                        return;

                    // preferred to set "true"
                    mediaElement.muted = true;

                    var streamOutput = {
                        mediaElement: mediaElement,
                        stream: stream,
                        userid: e.userid,
                        extra: e.extra,
                        streamid: streamid,
                        session: session,
                        type: 'remote'
                    };

                    // if stream stopped
                    stream.onended = function() {
                        if (root.onstreamended)
                            root.onstreamended(streamOutput);
                    };

                    root.onstream(streamOutput);
                    root.streams[streamid] = getStream(stream);

                    if (!e.renegotiated) forwardParticipant(e);
                }

                // check whether audio-only streaming
                if (session.audio && !session.video)
                    mediaElement.addEventListener('play', function() {
                        setTimeout(function() {
                            mediaElement.muted = false;
                            mediaElement.volume = 1;
                            afterRemoteStreamStartedFlowing();
                        }, 3000);
                    }, false);
                else
                    onRemoteStreamStartsFlowing();
            },
            onopen: function(e) {
                if (!root.channels)
                    root.channels = { };
                root.channels[e.userid] = {
                    send: function(message) {
                        root.send(message, this.channel);
                    },
                    channel: e.channel
                };
                if (root.onopen)
                    root.onopen(e);

                // for data-only sessions
                if (isData(session) && !e.renegotiated)
                    forwardParticipant(e);
            },
            onmessage: function(e) {
                var message = e.data;

                if (!message.size)
                    message = JSON.parse(message);

                if (message.type === 'text')
                    textReceiver.receive({
                        data: message,
                        root: root,
                        userid: e.userid,
                        extra: e.extra
                    });

                else if (message.size || message.type === 'file')
                    fileReceiver.receive({
                        data: message,
                        root: root,
                        userid: e.userid,
                        extra: e.extra
                    });
                else if (root.onmessage)
                    root.onmessage({
                        data: message,
                        userid: e.userid,
                        extra: e.extra
                    });
            },
            onclose: function(e) {
                if (root.onclose)
                    root.onclose(e);

                var myChannels = root.channels,
                    closedChannel = e.currentTarget;

                for (var _userid in myChannels) {
                    if (closedChannel === myChannels[_userid].channel)
                        delete root.channels[_userid];
                }
            },
            onerror: function(e) {
                if (root.onerror)
                    root.onerror(e);
            },
            session: session,
            bandwidth: root.bandwidth,
            framerate: root.framerate,
            bitrate: root.bitrate
        };

        function forwardParticipant(e) {
            if (session.broadcast || session.oneway)
                return;

            // for multi-users connectivity
            // i.e. video-conferencing
            signaler.isbroadcaster &&
                signaler.signal({
                    conferencing: true,
                    newcomer: e.userid,
                    extra: e.extra
                });
        }

        if (session.data) {
            var textReceiver = new TextReceiver();
            var fileReceiver = new FileReceiver();
        }

        if (session.data && isChrome)
            optionalArgument.optional = [{
                RtpDataChannels: true
            }];

        // call only for session initiator
        this.broadcast = function(_config) {
            _config = _config || { };
            signaler.roomid = _config.roomid || getToken();
            signaler.isbroadcaster = true;

            // share room details in a loop
            (function transmit() {
                // number of participants must not exceed participants allowed.
                if (getLength(root.users) < root.maxParticipantsAllowed) {
                    signaler.signal({
                        roomid: signaler.roomid,
                        broadcasting: true,
                        session: session,
                        extra: root.extra || { }
                    });
                }

                // !signaler.left: make sure session initiator has not left the room
                if (!root.transmitRoomOnce && !signaler.left) {
                    setTimeout(transmit, root.interval || 3000);
                }
            })();

            // if broadcaster leaves; clear all JSON files from Firebase servers
            // it is useless in current implementation because 
            // we are using "snap.ref().remove()" to behave like "socket.io"
            if (socket.onDisconnect)
                socket.onDisconnect().remove();
        };

        // called for each new participant
        this.join = function(_config) {
            signaler.roomid = _config.roomid;
            this.signal({
                participationRequest: true,
                to: _config.to,
                extra: root.extra || { }
            });
            signaler.sentParticipationRequest = true;
        };

        function leave() {
            // for firebase; again, it is useless out of "socket.io" behavior of firebase
            if (socket.remove) socket.remove();

            // let other users know you're leaving
            signaler.signal({
                leaving: true,

                // is he session initiator?
                broadcaster: !!signaler.broadcaster,

                // is he willing to close the entire session
                forceClosingTheEntireSession: !!root.autoCloseEntireSession
            });

            // if broadcaster leaves; don't close the entire session
            if (signaler.isbroadcaster && !root.autoCloseEntireSession) {
                var gotFirstParticipant;
                for (var participant in root.users) {
                    if (gotFirstParticipant) break;
                    gotFirstParticipant = true;

                    // tell him that now you're "broadcaster"!
                    signaler.signal({
                        playRoleOfBroadcaster: root.users[participant].userid
                    });
                }
            }

            root.users = { };

            // close all connected peers
            for (var peer in peers) {
                peer = peers[peer];
                if (peer.peer)
                    peer.peer.close();
            }
            peers = { };

            signaler.left = true;

            // so, he can join other rooms without page reload
            root.detectedRoom = false;
        }

        // currently you can't eject any user
        // however, you can leave the entire session
        root.eject = root.leave = function(_userid) {
            if (!_userid)
                return leave();

            // broadcaster can throw any user out of the room
            signaler.broadcaster
                && signaler.signal({
                    getOut: true,
                    who: _userid
                });
        };

        // close/leave entire session
        root.close = function() {
            root.autoCloseEntireSession = true;
            root.leave();
        };

        // if someone closes the window or tab
        window.onbeforeunload = function() {
            leave();
            // return 'You left the session.';
        };

        // if someone pressed "F5" key to refresh the page
        window.onkeyup = function(e) {
            if (e.keyCode == 116)
                leave();
        };

        // if someone leaves via <a href>
        var anchors = document.querySelectorAll('a'),
            length = anchors.length;
        for (var i = 0; i < length; i++) {
            var a = anchors[i];
            if (a.href.indexOf('#') !== 0 && a.getAttribute('target') != '_blank')
                a.onclick = function() {
                    leave();
                };
        }

        // this function is used only by offerer

        function renegotiate(_userid) {
            if (!signaler.isbroadcaster)
                throw 'Renegotiation priviliges are given only to session initiator. '
                    + 'Don\'t try to renegotiate streams from participants\' side.';

            console.log('<renegotiation process started>');

            var _session = merge(options, {
                session: session
            });

            var peer = peers[_userid];
            if (!peer) throw 'No such peer exists. Renegotiation process failed. User-id "' + _userid + '" is either removed or invalid.';
            peer.renegotiate(_session);

            console.log('</renegotiation process completed>');
        }

        function addStream(_session, callback) {
            if (!_session)
                throw '"session" parameter is mandatory.';

            var _userid = this.userid;

            // old sessions are replaced.
            root.session = session = _session;

            // old stream is removed; ..to make sure new stream is prompted.
            root.stream = null;

            // if user is "participant" and session is "oneway"
            if (callback && session.oneway) callback();

                // otherise, streaming is "two-way"
            else
                root.captureUserMedia(function() {
                    // renegotiation priviliges are given only to session initiator
                    if (signaler.isbroadcaster) {
                        var _options = merge(options, {
                            renegotiate: true,
                            session: session,
                            stream: root.stream,
                            to: _userid
                        });
                        signaler.signal(_options);
                    } else if (callback) callback();
                });
        }

        // helper for "root.users" array
        var usersArrayOptions = {
        // rengotiation of streams
            addStream: addStream
        };

        // handling socket messages

        function onSocketMessage(data) {
            // don't get self-sent data
            if (data.userid == userid)
                return false;

            // if it is not a leaving alert
            if (!data.leaving)
                return signaler.onmessage(data);

            // below code is executed only if "data.leaving" is true
            // i.e. someone is leaving

            if (root.onleave) {
                root.onleave({
                    userid: data.userid,
                    extra: data.extra
                });
            }

            // if room owner requested to leave his room
            if (data.broadcaster && data.forceClosingTheEntireSession) {
                leave();
            }

            // closing peer connection
            var peer = peers[data.userid];
            if (peer && peer.peer) {
                try {
                    peer.peer.close();
                } catch(e) {
                    console.error('This <peer.close> error must be fixed.', e);
                }
                delete peers[data.userid];
            }
        }

        // signaling implementation
        // if no custom signaling channel is provided; use Firebase
        if (!root.openSignalingChannel) {
            if (!window.Firebase)
                throw 'You must link <https://cdn.firebase.com/v0/firebase.js> file.';

            // Firebase is capable to store data in JSON format
            // root.transmitRoomOnce = true;
            // but "socket.io" behavior is preferred; that's why above line is commented.
            var socket = new window.Firebase('https://' + (root.firebase || 'chat') + '.firebaseIO.com/' + root.channel);
            socket.on('child_added', function(snap) {
                data = snap.val();
                onSocketMessage(data);

                // we want socket.io behavior; 
                // that's why data is removed from firebase servers 
                // as soon as it is received.
                snap.ref().remove();
            });

            // method to signal the data
            this.signal = function(data) {
                data.userid = userid;
                data.extra = data.extra || { };

                // "set" allow us overwrite old data
                // it "was" preferred to use "set" instead of "push"
                // however, this library demands something like "push"!
                socket.push(data);
            };

        } else {
            // custom signaling implementations
            // e.g. WebSocket, Socket.io, SignalR, WebSync, HTTP-based POST/GET, Long-Polling etc.
            // sketch: connection.openSignalingChannel = function(callback) {}
            var socket = root.openSignalingChannel(function(message) {
                message = JSON.parse(message);
                onSocketMessage(message);
            });

            // method to signal the data
            this.signal = function(data) {
                data.userid = userid;
                data.extra = data.extra || { };
                socket.send(JSON.stringify(data));
            };
        }
    }

    // var offer = Offer.createOffer({stream, session, onicecandidate, onsdp, onstream});
    // offer.setRemoteDescription(sdp);
    // offer.addIceCandidate(candidate);

    var Offer = {
        createOffer: function(config) {
            var renegotiating = !!this.peer;

            // if not renegotiating
            if (!renegotiating)
                var peer = new RTCPeerConnection(iceServers, optionalArgument);

                // if renegotiating
            else
                var peer = this.peer;

            var session = config.session;

            if (session.data)
                DataChannel.createDataChannel(peer, config);

            function sdpCallback() {
                config.onsdp({
                    sdp: peer.localDescription,
                    userid: config.to,
                    extra: config.extra
                });
            }

            if (config.stream)
                peer.addStream(config.stream);

            peer.onaddstream = function(event) {
                config.onstream({
                    stream: event.stream,
                    userid: config.to,
                    extra: config.extra,

                    // used to make sure we're not forwaring
                    // details of renegotiated streams
                    renegotiated: !!config.renegotiated
                });
            };

            peer.onicecandidate = function(event) {
                if (!event.candidate && !renegotiating) sdpCallback();
            };

            peer.ongatheringchange = function(event) {
                if (event.currentTarget && event.currentTarget.iceGatheringState === 'complete')
                    sdpCallback();
            };

            if (isChrome || !session.data) {

                peer.createOffer(function(sdp) {
                    sdp = serializeSdp(sdp, config);
                    peer.setLocalDescription(sdp);
                    if (renegotiating) sdpCallback();
                }, null, offerAnswerConstraints);

            } else if (isFirefox && session.data) {
                navigator.mozGetUserMedia({
                        audio: true,
                        fake: true
                    }, function(stream) {
                        peer.addStream(stream);
                        peer.createOffer(function(sdp) {
                            peer.setLocalDescription(sdp);
                            config.onsdp({
                                sdp: sdp,
                                userid: config.to,
                                extra: config.extra,

                                // used to make sure we're not forwaring
                                // details of renegotiated streams
                                renegotiated: !!config.renegotiated
                            });
                        }, null, offerAnswerConstraints);

                    }, mediaError);
            }

            this.peer = peer;

            return this;
        },
        setRemoteDescription: function(sdp) {
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp));
        },
        addIceCandidate: function(candidate) {
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        },
        renegotiate: function(config) {
            config.renegotiated = true;
            this.createOffer(config);
        }
    };

    // var answer = Answer.createAnswer({stream, session, onicecandidate, onsdp, onstream});
    // answer.setRemoteDescription(sdp);
    // answer.addIceCandidate(candidate);

    var Answer = {
        createAnswer: function(config) {
            var renegotiating = !!this.peer;

            // if not renegotiating
            if (!renegotiating)
                var peer = new RTCPeerConnection(iceServers, optionalArgument), channel;

                // if renegotiating
            else
                var peer = this.peer;

            var session = config.session;

            if (isChrome && session.data) {
                DataChannel.createDataChannel(peer, config);
            } else if (isFirefox && session.data) {
                peer.ondatachannel = function(event) {
                    channel = event.channel;
                    channel.binaryType = 'blob';
                    DataChannel.setChannelEvents(channel, config);
                };

                navigator.mozGetUserMedia({
                        audio: true,
                        fake: true
                    }, function(stream) {

                        peer.addStream(stream);
                        peer.setRemoteDescription(new RTCSessionDescription(config.sdp));
                        peer.createAnswer(function(sdp) {
                            peer.setLocalDescription(sdp);
                            if (config.onsdp)
                                config.onsdp({
                                    sdp: sdp,
                                    userid: config.to,
                                    extra: config.extra
                                });
                        }, null, offerAnswerConstraints);
                    }, mediaError);
            }

            if (config.stream)
                peer.addStream(config.stream);

            peer.onaddstream = function(event) {
                config.onstream({
                    stream: event.stream,
                    userid: config.to,
                    extra: config.extra
                });
            };

            peer.onicecandidate = function(event) {
                if (!renegotiating)
                    config.onicecandidate({
                        candidate: event.candidate,
                        userid: config.to,
                        extra: config.extra
                    });
            };

            if (isChrome || !session.data) {
                peer.setRemoteDescription(new RTCSessionDescription(config.sdp));
                peer.createAnswer(function(sdp) {
                    sdp = serializeSdp(sdp, config);

                    peer.setLocalDescription(sdp);

                    config.onsdp({
                        sdp: sdp,
                        userid: config.to,
                        extra: config.extra
                    });
                }, null, offerAnswerConstraints);
            }

            this.peer = peer;

            return this;
        },
        addIceCandidate: function(candidate) {
            this.peer.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        }
    };

    var RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.webkitURL || window.URL;

    var isFirefox = !!navigator.mozGetUserMedia;
    var isChrome = !!navigator.webkitGetUserMedia;

    var STUN = {
        url: isChrome ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
    };

    // old TURN syntax
    var TURN = {
        url: 'turn:webrtc%40live.com@numb.viagenie.ca',
        credential: 'muazkh'
    };

    var iceServers = {
        iceServers: [STUN]
    };

    if (isChrome) {
        // in chrome M29 and higher
        if (parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]) >= 28)
            TURN = {
                url: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            };

        // No STUN to make sure it works all the time!
        iceServers.iceServers = [TURN];
    }

    var optionalArgument = {
        optional: [{
            DtlsSrtpKeyAgreement: true
        }]
    };

    var offerAnswerConstraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    function getToken() {
        return Math.round(Math.random() * 60535) + 5000;
    }

    function setBandwidth(sdp, bandwidth) {
        bandwidth = bandwidth || { };

        // remove existing bandwidth lines
        sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');

        sdp = sdp.replace( /a=mid:audio\r\n/g , 'a=mid:audio\r\nb=AS:' + (bandwidth.audio || 50) + '\r\n');
        sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\nb=AS:' + (bandwidth.video || 256) + '\r\n');
        sdp = sdp.replace( /a=mid:data\r\n/g , 'a=mid:data\r\nb=AS:' + (bandwidth.data || 1638400) + '\r\n');

        return sdp;
    }

    function setBitrate(sdp /*, bitrate*/) {
        // sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\na=rtpmap:120 VP8/90000\r\na=fmtp:120 x-google-min-bitrate=' + (bitrate || 10) + '\r\n');
        return sdp;
    }

    function setFramerate(sdp, framerate) {
        framerate = framerate || { };
        sdp = sdp.replace('a=fmtp:111 minptime=10', 'a=fmtp:111 minptime=' + (framerate.minptime || 10));
        sdp = sdp.replace('a=maxptime:60', 'a=maxptime:' + (framerate.maxptime || 60));
        return sdp;
    }

    function serializeSdp(sessionDescription, config) {
        if (isFirefox)
            return sessionDescription;

        var sdp = sessionDescription.sdp;
        sdp = setBandwidth(sdp, config.bandwidth);
        sdp = setFramerate(sdp, config.framerate);
        sdp = setBitrate(sdp, config.bitrate);
        sessionDescription.sdp = sdp;
        return sessionDescription;
    }

    function swap(arr) {
        var swapped = [],
            length = arr.length;
        for (var i = 0; i < length; i++)
            if (arr[i] && arr[i] !== true)
                swapped[swapped.length] = arr[i];
        return swapped;
    }

    function merge(mergein, mergeto) {
        for (var item in mergeto) {
            mergein[item] = mergeto[item];
        }
        return mergein;
    }

    function getLength(obj) {
        var length = 0;
        for (var o in obj) length++;
        return length;
    }

    // is data-only session

    function isData(session) {
        return !session.audio && !session.video && !session.screen && session.data;
    }

    // Get HTMLAudioElement/HTMLVideoElement accordingly

    function getMediaElement(stream, session) {
        var mediaElement = document.createElement(session.audio && !session.video ? 'audio' : 'video');
        mediaElement[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);
        mediaElement.autoplay = true;
        mediaElement.controls = true;
        mediaElement.play();
        return mediaElement;
    }

    function mediaError(e) {
        var error = 'Either Microphone/Webcam access is denied.\r\n\r\n';
        error += 'For screen sharing; <HTTPS> is <temporarily> mandatory.\r\n\r\n';
        error += 'Also, make sure that you are not making multiple screen capturing requests and you have enabled the appropriate flag.';

        console.error(error, e);
    }

    // help mute/unmute streams individually

    function getStream(stream) {
        return {
            stream: stream,
            stop: function() {
                var stream = this.stream;
                if (stream && stream.stop)
                    stream.stop();
            },
            mute: function(session) {
                this._private(session, true);
            },
            unmute: function(session) {
                this._private(session, false);
            },
            _private: function(session, enabled) {
                var stream = this.stream;

                session = session || {
                    audio: true,
                    video: true
                };

                if (session.audio) {
                    var audioTracks = stream.getAudioTracks()[0];
                    if (audioTracks)
                        audioTracks.enabled = !enabled;
                }

                if (session.video) {
                    var videoTracks = stream.getVideoTracks()[0];
                    if (videoTracks)
                        videoTracks.enabled = !enabled;
                }
            }
        };
    }

    // DataChannel.createDataChannel(peer, config);
    // DataChannel.setChannelEvents(channel, config);

    var DataChannel = {
        createDataChannel: function(peer, config) {
            // in renegotiation process; don't create data channels multiple times
            if (peer.localDescription && peer.localDescription.sdp.indexOf('a=mid:data') !== -1) return;

            var channel = peer.createDataChannel('channel', { reliable: false });
            this.setChannelEvents(channel, config);
        },
        setChannelEvents: function(channel, config) {
            channel.onopen = function() {
                config.onopen({
                    channel: channel,
                    userid: config.to,
                    extra: config.extra,

                    // used to make sure we're not forwaring
                    // details of renegotiated streams
                    renegotiated: !!config.renegotiated
                });
            };

            channel.onmessage = function(e) {
                config.onmessage({
                    data: e.data,
                    userid: config.to,
                    extra: config.extra
                });
            };

            channel.onclose = function(event) {
                config.onclose({
                    event: event,
                    userid: config.to,
                    extra: config.extra
                });
            };

            channel.onerror = function(event) {
                config.onerror({
                    event: event,
                    userid: config.to,
                    extra: config.extra
                });
            };
        }
    };

    // FileSender.send(config);

    var FileSender = {
        send: function(config) {
            var root = config.root;
            var file = config.file;

            function send(message) {
                if (isChrome) message = JSON.stringify(message);

                // share data between two unique users i.e. direct messages
                if (config.channel) return config.channel.send(message);

                // share data with all connected users
                var channels = root.channels || { };
                for (var channel in channels) {
                    channels[channel].channel.send(message);
                }
            }

            if (isFirefox) {
                send(JSON.stringify({
                    fileName: file.name,
                    type: 'file'
                }));
                send(file);
                if (root.onFileSent)
                    root.onFileSent({
                        file: file,
                        userid: config.userid,
                        extra: config.extra
                    });
            }

            if (isChrome) {
                var reader = new window.FileReader();
                reader.readAsDataURL(file);
                reader.onload = onReadAsDataURL;
            }

            var packetSize = 1000,
                textToTransfer = '',
                numberOfPackets = 0,
                packets = 0;

            function onReadAsDataURL(event, text) {
                var data = {
                    type: 'file'
                };

                if (event) {
                    text = event.target.result;
                    numberOfPackets = packets = data.packets = parseInt(text.length / packetSize);
                }

                if (root.onFileProgress)
                    root.onFileProgress({
                        remaining: packets--,
                        length: numberOfPackets,
                        sent: numberOfPackets - packets,
                        userid: config.userid,
                        extra: config.extra
                    });

                if (text.length > packetSize)
                    data.message = text.slice(0, packetSize);
                else {
                    data.message = text;
                    data.last = true;
                    data.name = file.name;

                    if (root.onFileSent)
                        root.onFileSent({
                            file: file,
                            userid: config.userid,
                            extra: config.extra
                        });
                }

                send(data);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length)
                    setTimeout(function() {
                        onReadAsDataURL(null, textToTransfer);
                    }, 500);
            }
        }
    };


    // new FileReceiver().receive(config);

    function FileReceiver() {
        var content = [],
            fileName = '',
            packets = 0,
            numberOfPackets = 0;

        this.receive = function(config) {
            var root = config.root;
            var data = config.data;

            if (isFirefox) {
                if (data.fileName)
                    fileName = data.fileName;

                if (data.size) {
                    var reader = new window.FileReader();
                    reader.readAsDataURL(data);
                    reader.onload = function(event) {
                        FileSaver.SaveToDisk({
                            fileURL: event.target.result,
                            fileName: fileName
                        });

                        if (root.onFileReceived)
                            root.onFileReceived({
                                fileName: fileName,
                                userid: config.userid,
                                extra: config.extra
                            });
                    };
                }
            }

            if (isChrome) {
                if (data.packets)
                    numberOfPackets = packets = parseInt(data.packets);

                if (root.onFileProgress)
                    root.onFileProgress({
                        remaining: packets--,
                        length: numberOfPackets,
                        received: numberOfPackets - packets,
                        userid: config.userid,
                        extra: config.extra
                    });

                content.push(data.message);

                if (data.last) {
                    FileSaver.SaveToDisk({
                        fileURL: content.join(''),
                        fileName: data.name
                    });

                    if (root.onFileReceived)
                        root.onFileReceived({
                            fileName: data.name,
                            userid: config.userid,
                            extra: config.extra
                        });
                    content = [];
                }
            }
        };
    }

    // TextSender.send(config);

    var TextSender = {
        send: function(config) {
            var root = config.root;

            function send(message) {
                message = JSON.stringify(message);

                // share data between two unique users i.e. direct messages
                if (config.channel) return config.channel.send(message);

                // share data with all connected users
                var channels = root.channels || { };
                for (var channel in channels) {
                    channels[channel].channel.send(message);
                }
            }


            var initialText = config.text,
                packetSize = 1000,
                textToTransfer = '';

            if (typeof initialText !== 'string')
                initialText = JSON.stringify(initialText);

            if (isFirefox || initialText.length <= packetSize)
                send(config.text);
            else
                sendText(initialText);

            function sendText(textMessage, text) {
                var data = {
                    type: 'text'
                };

                if (textMessage) {
                    text = textMessage;
                    data.packets = parseInt(text.length / packetSize);
                }

                if (text.length > packetSize)
                    data.message = text.slice(0, packetSize);
                else {
                    data.message = text;
                    data.last = true;
                }

                send(data);

                textToTransfer = text.slice(data.message.length);

                if (textToTransfer.length)
                    setTimeout(function() {
                        sendText(null, textToTransfer);
                    }, 500);
            }
        }
    };

    // new TextReceiver().receive(config);

    function TextReceiver() {
        var content = [];

        function receive(config) {
            var root = config.root;
            var data = config.data;

            content.push(data.message);
            if (data.last) {
                if (root.onmessage)
                    root.onmessage({
                        data: content.join(''),
                        userid: config.userid,
                        extra: config.extra
                    });
                content = [];
            }
        }

        return {
            receive: receive
        };
    }

    // FileSaver.SaveToDisk({fileName,fileURL});

    var FileSaver = {
        SaveToDisk: function(e) {
            var save = document.createElement('a');
            save.href = e.fileURL;
            save.target = '_blank';
            save.download = e.fileName || e.fileURL;

            var evt = document.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

            save.dispatchEvent(evt);
            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        }
    };
})();
