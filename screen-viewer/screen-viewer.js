/* MIT License: https://webrtc-experiment.appspot.com/licence/ */

var config = {
    openSocket: function (config) {
        var socket = io.connect('https://pubsub.pubnub.com/webrtc-experiment', {
            publish_key: 'pub-f986077a-73bd-4c28-8e50-2e44076a84e0',
            subscribe_key: 'sub-b8f4c07a-352e-11e2-bb9d-c7df1d04ae4a',
            channel: config.channel || 'WebRTC screen Broadcast',
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
        var alreadyExist = document.getElementById(room.ownerToken);
        if (alreadyExist) return;
		
		if(typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.ownerToken);
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
            var firstPart = sdp.substr(0, 700), secondPart = sdp.substr(701, sdp.length - 1);
				
			socket && socket.send({
				userToken: self.userToken,
				firstPart: firstPart
			});
			socket && socket.send({
				userToken: self.userToken,
				secondPart: secondPart
			});
        }

        function socketResponse(response) {
            if (response.userToken == self.userToken) return;
			
            if (response.firstPart || response.secondPart) {
                if (response.firstPart) {
                    inner.firstPart = response.firstPart;
                    if (inner.secondPart) selfInvoker();
                }
                if (response.secondPart) {
                    inner.secondPart = response.secondPart;
                    if (inner.firstPart) selfInvoker();
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
            inner.sdp = JSON.parse(inner.firstPart + inner.secondPart);
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
                forUser: _config.joinUser
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