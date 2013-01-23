var publicSocket = { };
var conference = function (config) {
    var self = {
        userToken: uniqueToken(),
        publicChannel: config.publicChannel || 'video-conferencing'
    },
        channels = '--',
        isbroadcaster,
        isGetNewRoom = true;

    function openPublicSocket() {
        var socketConfig = {
            channel: self.publicChannel,
            onmessage: onPublicSocketResponse
        };
        publicSocket = config.openSocket(socketConfig);
    }

    window.onload = openPublicSocket;

    function onPublicSocketResponse(response) {
        if (response.userToken == self.userToken) return;

        if (isGetNewRoom && response.roomToken && response.broadcaster) config.onRoomFound(response);

        if (response.newParticipant) onNewParticipant(response.newParticipant);

        if (response.userToken && response.joinUser == self.userToken && response.participant && channels.indexOf(response.userToken) == -1) {
            channels += response.userToken + '--';
            openSubSocket({
                isofferer: true,
                channel: response.channel || response.userToken,
                closeSocket: true
            });
        }
    }

    /*********************/
    /* CLOSURES / PRIVATE stuff */
    /*********************/

    function openSubSocket(_config) {
        if (!_config.channel) return;
        console.log('openSubSocket --- channel: ' + _config.channel);
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse,
            onopen: function () {
                if (isofferer && !peer) initPeer();
            }
        };

        var socket = config.openSocket(socketConfig),
            isofferer = _config.isofferer,
            isopus = window.isopus,
            gotstream,
            video = document.createElement('video'),
            inner = {},
            peer;

        var peerConfig = {
            iceServers: window.iceServers,
            attachStream: config.attachStream,
            onICE: function (candidate) {
                socket.send({
                    userToken: self.userToken,
                    candidate: {
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        candidate: JSON.stringify(candidate.candidate)
                    }
                });
            },
            onRemoteStream: function (stream) {
                if (!stream) return;

                console.log('onRemoteStream');

                video[navigator.mozGetUserMedia ? 'mozSrcObject' : 'src'] = navigator.mozGetUserMedia ? stream : URL.createObjectURL(stream);
                video.play();

                self.stream = stream;
                onRemoteStreamStartsFlowing();
            },
            isopus: isopus
        };

        function initPeer(offerSDP) {
            console.log('initPeer');
            if (!offerSDP) {
                peerConfig.onOfferSDP = sendsdp;
                console.log('peerConfig.onOfferSDP = sendsdp;');
            } else {
                peerConfig.offerSDP = offerSDP;
                peerConfig.onAnswerSDP = sendsdp;
                console.log('peerConfig.onAnswerSDP = sendsdp;');
            }

            peer = RTCPeerConnection(peerConfig);
        }

        function onRemoteStreamStartsFlowing() {
            if (!(video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || video.paused || video.currentTime <= 0)) {
                gotstream = true;

                config.onRemoteStream({
                    video: video,
                    stream: self.stream
                });

                if (isbroadcaster && channels.split('--').length > 3) {
                    /* broadcasting newly connected participant for video-conferencing! */
                    publicSocket.send({
                        newParticipant: socket.channel,
                        userToken: self.userToken
                    });
                    console.log('broadcasting newly connected participant for video-conferencing!');
                }

                /* closing subsocket here on the offerer side */
                if(_config.closeSocket) socket = null;

            } else setTimeout(onRemoteStreamStartsFlowing, 50);
        }

        /*********************/
        /* sendsdp // sendice */
        /*********************/

        function sendsdp(sdp) {
            sdp = JSON.stringify(sdp);
            var part = parseInt(sdp.length / 3);

            var firstPart = sdp.slice(0, part),
                secondPart = sdp.slice(part, sdp.length - 1),
                thirdPart = '';

            if (sdp.length > part + part) {
                secondPart = sdp.slice(part, part + part);
                thirdPart = sdp.slice(part + part, sdp.length);
            }

            socket.send({
                userToken: self.userToken,
                firstPart: firstPart,
                isopus: isopus
            });

            socket.send({
                userToken: self.userToken,
                secondPart: secondPart,
                isopus: isopus
            });

            socket.send({
                userToken: self.userToken,
                thirdPart: thirdPart,
                isopus: isopus
            });
        }

        /*********************/
        /* socket response */
        /*********************/

        function socketResponse(response) {
            if (response.userToken == self.userToken) return;

            response.isopus !== 'undefined' && (isopus = response.isopus && isopus);

            if (response.firstPart || response.secondPart || response.thirdPart) {
                if (response.firstPart) {
                    inner.firstPart = response.firstPart;
                    if (inner.secondPart && inner.thirdPart) selfInvoker();
                }
                if (response.secondPart) {
                    inner.secondPart = response.secondPart;
                    if (inner.firstPart && inner.thirdPart) selfInvoker();
                }

                if (response.thirdPart) {
                    inner.thirdPart = response.thirdPart;
                    if (inner.firstPart && inner.secondPart) selfInvoker();
                }
            }

            if (response.candidate && !gotstream) {
                peer && peer.addICE({
                    sdpMLineIndex: response.candidate.sdpMLineIndex,
                    candidate: JSON.parse(response.candidate.candidate)
                });
            }
        }

        /*********************/
        /* socket response */
        /*********************/
        var invokedOnce = false;

        function selfInvoker() {
            if (invokedOnce) return;

            invokedOnce = true;

            inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);
            if (isofferer) peer.addAnswerSDP(inner.sdp);
            else initPeer(inner.sdp);
        }
    }

    function startBroadcasting() {
        publicSocket.send({
            roomToken: self.roomToken,
            roomName: self.roomName,
            broadcaster: self.userToken
        });
        setTimeout(startBroadcasting, 3000);
    }

    function onNewParticipant(channel) {
        if (!channel || channels.indexOf(channel) != -1 || channel == self.userToken) return;
        channels += channel + '--';

        console.log('onNewParticipant');

        var new_channel = uniqueToken();
        openSubSocket({
            isopus: window.isopus,
            channel: new_channel,
            closeSocket: true
        });

        publicSocket.send({
            participant: true,
            userToken: self.userToken,
            joinUser: channel,
            channel: new_channel
        });

        console.log('publicSocket.send');
    }

    /*********************/
    /* HELPERS */
    /*********************/

    function uniqueToken() {
        var s4 = function () {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    return {
        createRoom: function (_config) {
            self.roomName = _config.roomName || 'Anonymous';
            self.roomToken = uniqueToken();

            isbroadcaster = true;
            isGetNewRoom = false;
            startBroadcasting();
        },
        joinRoom: function (_config) {
            self.roomToken = _config.roomToken;
            isGetNewRoom = false;

            openSubSocket({
                isopus: window.isopus,
                channel: self.userToken
            });

            publicSocket.send({
                participant: true,
                userToken: self.userToken,
                joinUser: _config.joinUser
            });
        }
    };
};