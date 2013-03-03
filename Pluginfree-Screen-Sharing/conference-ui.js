var config = {
    openSocket: function (config) {
		/* Using Firebase for Signaling; see other signaling methods: http://bit.ly/webrtc-signaling */
        var channel = config.channel || location.hash.replace('#', '') || 'pluginfree-screen-sharing';
        var socket = new Firebase('https://chat.firebaseIO.com/' + channel);
        socket.channel = channel;
        socket.on('child_added', function (data) {
            config.onmessage && config.onmessage(data.val());
        });
        socket.send = function (data) {
            this.push(data);
        }
        config.onopen && setTimeout(config.onopen, 1);
        socket.onDisconnect().remove();
        return socket;
    },
    onRemoteStream: function (media) {
        var video = media.video;
        video.setAttribute('controls', true);
        video.onclick = function () {
            requestFullScreen(this);
        };

        participants.insertBefore(video, participants.childNodes[0]);

        video.play();
        rotateVideo(video);
    },
    onRoomFound: function (room) {
        var hash = location.hash.replace('#', '').length;
        if (!hash) {
            var alreadyExist = document.getElementById(room.broadcaster);
            if (alreadyExist) return;

            if (typeof roomsList === 'undefined') roomsList = document.body;

            var tr = document.createElement('tr');
            tr.setAttribute('id', room.broadcaster);
            tr.innerHTML = '<td style="width:80%;">' + room.roomName + '</td>' +
                '<td><button class="join" id="' + room.roomToken + '">Open Screen</button></td>';
            roomsList.insertBefore(tr, roomsList.childNodes[0]);

            tr.onclick = function () {
                var tr = this;
                config.attachStream = null;
                conferenceUI.joinRoom({
                    roomToken: tr.querySelector('.join').id,
                    joinUser: tr.id
                });
                hideUnnecessaryStuff();
            };
        } else {
            /* auto join privately shared room */
            config.attachStream = null;
            conferenceUI.joinRoom({
                roomToken: room.roomToken,
                joinUser: room.broadcaster
            });
            hideUnnecessaryStuff();
        }
    }
};

function createButtonClickHandler() {
    captureUserMedia(function () {
        conferenceUI.createRoom({
            roomName: ((document.getElementById('conference-name') || {
                value: null
            }).value || 'Anonymous') + ' shared screen with you'
        });
    });
    hideUnnecessaryStuff();
}

function captureUserMedia(callback) {
    var video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.setAttribute('controls', true);
    participants.insertBefore(video, participants.childNodes[0]);

    video.onlick = function () {
        requestFullScreen(this);
    };

	/* constraint to get captured screen */
    var screen_constraints = {
        mandatory: {
            chromeMediaSource: 'screen'
        },
        optional: []
    };
    var constraints = {
        audio: false, /* audio must be false */
        video: screen_constraints
    };
    getUserMedia({
        video: video,
        constraints: constraints,
        onsuccess: function (stream) {
            config.attachStream = stream;
            callback && callback();

            video.setAttribute('muted', true);
            rotateVideo(video);
        },
        onerror: function () {
            alert('Please use HTTPS and Enable screen capture support in getUserMedia() in latest chrome canary using chrome://flags');
        }
    });
}

/* on page load: get public rooms */
var conferenceUI = conference(config);

/* UI specific */
var participants = document.getElementById("participants") || document.body;
var startConferencing = document.getElementById('start-conferencing');
var roomsList = document.getElementById('rooms-list');

if (startConferencing) startConferencing.onclick = createButtonClickHandler;

function hideUnnecessaryStuff() {
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;
    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
}

function rotateVideo(video) {
    video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
    setTimeout(function () {
        video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
    }, 1000);
}

/* creating unique hash token for private rooms */
(function () {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken) if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<input type=text value="' + location.href + '" style="width:100%;text-align:center;" title="You can share this private link with your friends.">';
    else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href =
        '#' + Math.random().toString(36).substr(2, 35).toUpperCase()
})();

/* requesting full screen on video click event handler */
function requestFullScreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
}