var signalingChannel = 'cross-browser-screen-sharing';
var config = {
    openSocket: function (config) {
        var socket = io.connect('https://pubsub.pubnub.com/' + signalingChannel, {
            publish_key: 'pub-c-ed2bf8af-1921-4b22-b53e-ecb2670ca60c',
            subscribe_key: 'sub-c-f990bbb4-7263-11e2-8b02-12313f022c90',
            channel: config.channel || signalingChannel,
            ssl: true
        });
        config.onopen && socket.on('connect', config.onopen);
        socket.on('message', config.onmessage);
        return socket;
    }
};

function broadcastScreen(stream) {
	config.attachStream = stream;
	ScreenSharing(config).shareScreen();
}

var isStopBroadcasting = false;
var ScreenSharing = function (config) {
    var self = { userToken: uniqueToken() },
        channels = '--',
        publicSocket = {};

    function openPublicSocket() {
        publicSocket = config.openSocket({onmessage: onPublicSocketResponse});
    }

    function onPublicSocketResponse(response) {
        if (response.userToken == self.userToken) return;
        if (response.userToken && response.joinUser == self.userToken && response.participant && channels.indexOf(response.userToken) == -1) {
            channels += response.userToken + '--';
            openSubSocket({
                channel: response.channel || response.userToken,
                closeSocket: true
            });
        }
    }

    function openSubSocket(_config) {
        if (!_config.channel) return;
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse,
            onopen: function () {
                peer = RTCPeerConnection(peerConfig);
            }
        };

        var socket = config.openSocket(socketConfig), inner = {}, peer;
        var peerConfig = {
            attachStream: config.attachStream,
			onOfferSDP: sendsdp,
            onICE: function (candidate) {
                socket && socket.send({
                    userToken: self.userToken,
                    candidate: {
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        candidate: JSON.stringify(candidate.candidate)
                    }
                });
            },
			onRemoteStream: function() {
				webkitNotifications.createHTMLNotification('extras/participant.html').show();
			}
        };

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
                firstPart: firstPart
            });

            socket.send({
                userToken: self.userToken,
                secondPart: secondPart
            });

            socket.send({
                userToken: self.userToken,
                thirdPart: thirdPart
            });
        }

        function socketResponse(response) {
            if (response.userToken == self.userToken) return;
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

            if (response.candidate) {
                peer && peer.addICE({
                    sdpMLineIndex: response.candidate.sdpMLineIndex,
                    candidate: JSON.parse(response.candidate.candidate)
                });
            }
        }
        var invokedOnce = false;
        function selfInvoker() {
            if (invokedOnce) return;
            invokedOnce = true;
            inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);
            peer.addAnswerSDP(inner.sdp);
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
	
    function uniqueToken() {
        var s4 = function () {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }
	
	openPublicSocket();
    return {
        shareScreen: function () {
			self.roomToken = uniqueToken();
            self.roomName = prompt('Enter room name', self.roomToken) || self.roomToken;
            startBroadcasting();
        }
    };
};