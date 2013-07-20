// 2013, @muazkh » github.com/muaz-khan
// MIT License » https://webrtc-experiment.appspot.com/licence/
// Documentation » https://github.com/muaz-khan/WebRTC-Experiment/tree/master/webrtc-broadcasting

var config = {
    openSocket: function (config) {
        var SIGNALING_SERVER = 'https://www.webrtc-experiment.com:8553/',
            defaultChannel = location.hash.substr(1) || 'video-oneway-broadcasting';

        var channel = config.channel || defaultChannel;
        var sender = Math.round(Math.random() * 999999999) + 999999999;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: channel,
            sender: sender
        });

        var socket = io.connect(SIGNALING_SERVER + channel);
        socket.channel = channel;
        socket.on('connect', function() {
            if (config.callback) config.callback(socket);
        });

        socket.send = function(message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    },
    onRemoteStream: function (htmlElement) {
        htmlElement.setAttribute('controls', true);
        participants.insertBefore(htmlElement, participants.firstChild);
        htmlElement.play();
        rotateInCircle(htmlElement);
    },
    onRoomFound: function (room) {
        var hash = location.hash.replace('#', '').length;
        if (!hash) {
            var alreadyExist = document.getElementById(room.broadcaster);
            if (alreadyExist) return;

            if (typeof roomsList === 'undefined') roomsList = document.body;

            var tr = document.createElement('tr');
            tr.setAttribute('id', room.broadcaster);

            if (room.isAudio) tr.setAttribute('accesskey', room.isAudio);

            tr.innerHTML = '<td>' + room.roomName + '</td>' +
                '<td><button class="join" id="' + room.roomToken + '">View Anonymously</button></td>';
            roomsList.insertBefore(tr, roomsList.firstChild);

            tr.onclick = function () {
                tr = this;
                broadcastUI.joinRoom({
                    roomToken: tr.querySelector('.join').id,
                    joinUser: tr.id,
                    isAudio: tr.getAttribute('accesskey')
                });
                hideUnnecessaryStuff();
            };
        } else {
            /* auto join privately shared room */
            config.attachStream = null;
            broadcastUI.joinRoom({
                roomToken: room.roomToken,
                joinUser: room.broadcaster,
                isAudio: room.isAudio
            });
            hideUnnecessaryStuff();
        }
    },
    onNewParticipant: function (participants) {
        var numberOfParticipants = document.getElementById('number-of-participants');
        if (!numberOfParticipants) return;
        numberOfParticipants.innerHTML = participants + ' room participants';
    }
};

function createButtonClickHandler() {
    captureUserMedia(function () {
        var shared = 'video';
        if (window.option == 'Only Audio') shared = 'audio';
        if (window.option == 'Screen') shared = 'screen';
        broadcastUI.createRoom({
            roomName: (document.getElementById('conference-name') || {}).value || 'Anonymous',
            isAudio: shared === 'audio'
        });
    });
    hideUnnecessaryStuff();
}

function captureUserMedia(callback) {
    var constraints = null;
    window.option = broadcastingOption ? broadcastingOption.value : '';
    if (option === 'Only Audio') {
        constraints = {
            audio: true,
            video: false
        };
    }
    if (option === 'Screen') {		
        var video_constraints = {
            mandatory: {
                chromeMediaSource: 'screen'
            },
            optional: []
        };
        constraints = {
            audio: false,
            video: video_constraints
        };
    }

    var htmlElement = document.createElement(option === 'Only Audio' ? 'audio' : 'video');
    htmlElement.setAttribute('autoplay', true);
    htmlElement.setAttribute('controls', true);
    participants.insertBefore(htmlElement, participants.firstChild);

    var mediaConfig = {
        video: htmlElement,
        onsuccess: function (stream) {
            config.attachStream = stream;
            callback && callback();

            htmlElement.setAttribute('muted', true);
            rotateInCircle(htmlElement);
        },
        onerror: function () {
			if (option === 'Only Audio') alert('unable to get access to your microphone');
			else if(option === 'Screen') {
				if(location.protocol === 'http:') alert('Please test this WebRTC experiment on HTTPS.');
				else alert('Screen capturing is either denied or not supported. Are you enabled flag: "Enable screen capture support in getUserMedia"?');
			}
			else alert('unable to get access to your webcam');
        }
    };
    if (constraints) mediaConfig.constraints = constraints;
    getUserMedia(mediaConfig);
}

/* on page load: get public rooms */
var broadcastUI = broadcast(config);

/* UI specific */
var participants = document.getElementById("participants") || document.body;
var startConferencing = document.getElementById('start-conferencing');
var roomsList = document.getElementById('rooms-list');

var broadcastingOption = document.getElementById('broadcasting-option');

if (startConferencing) startConferencing.onclick = createButtonClickHandler;

function hideUnnecessaryStuff() {
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;
    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
}

function rotateInCircle(video) {
    video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
    setTimeout(function () {
        video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
    }, 1000);
}

(function () {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken) if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
    else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
})();