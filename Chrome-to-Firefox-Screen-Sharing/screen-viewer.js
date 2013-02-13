var signalingChannel = 'cross-browser-screen-sharing';
var config = {
    openSocket: function (config) {
		var socket = io.connect('https://pubsub.pubnub.com/' + signalingChannel, {
            publish_key: 'pub-c-ed2bf8af-1921-4b22-b53e-ecb2670ca60c',
            subscribe_key: 'sub-c-f990bbb4-7263-11e2-8b02-12313f022c90',
            channel: config.channel || signalingChannel,
            ssl: true
        });
        config.onopen 		&& socket.on('connect', config.onopen);
        config.onmessage 	&& socket.on('message', config.onmessage);
        return socket;
    },
    onRemoteStream: function (media) {
		var screenPreview = document.getElementById("screen-preview");
		if(!screenPreview) return console.error('No <video> element to preview screen.');
		
		screenPreview.onclick = function () { requestFullScreen(this); };
		
		screenPreview.style.display = 'block';
		screenPreview[moz ? 'mozSrcObject' : 'src'] = moz ? media.stream : webkitURL.createObjectURL(media.stream);
        
		// rotate video
		screenPreview.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
		setTimeout(function() {
			screenPreview.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
		}, 1000);
    },
    onRoomFound: function (room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;
		
		if(typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.innerHTML = '<td style="width:80%;">' + room.roomName + '</td>' +
					   '<td><button class="join" id="' + room.roomToken + '">Open Shared Screen</button></td>';

        roomsList.insertBefore(tr, roomsList.childNodes[0]);

        tr.onclick = function () {
			var tr = this;
			
			// one way stream is not working; that's why using two way stream as workaround!
			getUserMedia({
				onsuccess: function (stream) {
					config.attachStream = stream;
					
					// joining the shared screen
					screenViewer.joinScreen({
						roomToken: tr.querySelector('.join').id,
						joinUser: tr.id
					});
				}
			});
			roomsList.style.display = 'none';
        };
    }
};

var roomsList = document.getElementById('rooms-list');

/* ScreenViewer object's original code */
var ScreenViewer = function (config) {
    var self = { userToken: uniqueToken() }, isGetNewRoom = true, publicSocket = { };

    function onPublicSocketResponse(response) {
        if (response.userToken == self.userToken) return;
        if (isGetNewRoom && response.roomToken) config.onRoomFound(response);
    }

    function openSubSocket(_config) {
        if (!_config.channel) return;
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse
        };

        var socket = config.openSocket(socketConfig), gotstream, video = document.createElement('video'), inner = {}, peer;

        var peerConfig = {
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

                video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : webkitURL.createObjectURL(stream);
                video.play();

                _config.stream = stream;
                onRemoteStreamStartsFlowing();
            }
        };

        function initPeer(offerSDP) {
			peerConfig.offerSDP = offerSDP;
			peerConfig.onAnswerSDP = sendsdp;
            peer = RTCPeerConnection(peerConfig);
        }

        function onRemoteStreamStartsFlowing() {
            if (!(video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || video.paused || video.currentTime <= 0)) {
                gotstream = true;
                config.onRemoteStream({
                    video: video,
                    stream: _config.stream
                });
            } else setTimeout(onRemoteStreamStartsFlowing, 50);
        }

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

            if (response.candidate && !gotstream) {
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
            initPeer(inner.sdp);
        }
    }

    function uniqueToken() {
        var s4 = function () {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

	publicSocket = config.openSocket({onmessage: onPublicSocketResponse});
	
    return {
        joinScreen: function (_config) {
            self.roomToken = _config.roomToken;
            isGetNewRoom = false;
			
            publicSocket.send({
                participant: true,
                userToken: self.userToken,
                joinUser: _config.joinUser
            });
			
			openSubSocket({ channel: self.userToken });
        }
    };
};

// initializing the ScreenViewer object to capture shared screen!
var screenViewer = ScreenViewer(config);

function requestFullScreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
}