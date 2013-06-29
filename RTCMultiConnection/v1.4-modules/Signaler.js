// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

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
