/* MIT License: https://webrtc-experiment.appspot.com/licence/ 
    It is recommended to use RTCMultiConnection.js for audio/video/screen sharing: <http://bit.ly/RTCMultiConnection-Documentation>
*/

var config = {
    openSocket: function (config) {
        var socket = io.connect('http://webrtc-signaling.jit.su');
        socket.channel = config.channel || location.hash.replace('#', '') || 'webrtc-signaling-using-socketio-one-to-one';
        socket.on('message', function (message) {
            console.log(message);
            config.onmessage(message);
        });
        socket.send = function (data) {
            socket.emit('message', data);
        };
        if (config.onopen) setTimeout(config.onopen, 1);
        return socket;
    },
    onRemoteStream: function (media) {
        var video = media.video;
        video.setAttribute('controls', true);

        participants.insertBefore(video, participants.firstChild);

        video.play();
        rotateVideo(video);
    },
    onRoomFound: function (room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        if (typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.innerHTML = '<td>' + room.roomName + '</td>' +
            '<td><button class="join" id="' + room.roomToken + '">Join Room</button></td>';
        roomsList.insertBefore(tr, roomsList.firstChild);

        tr.onclick = function () {
            var tr = this;
            captureUserMedia(function () {
                conferenceUI.joinRoom({
                    roomToken: tr.querySelector('.join').id,
                    joinUser: tr.id
                });
            });
            hideUnnecessaryStuff();
        };
    }
};

function createButtonClickHandler() {
    captureUserMedia(function () {
        conferenceUI.createRoom({
            roomName: ((document.getElementById('conference-name') || {
                value: null
            }).value || 'Anonymous') + ' // shared via ' + (navigator.vendor ? 'Google Chrome (Stable/Canary)' : 'Mozilla Firefox (Aurora/Nightly)')
        });
    });
    hideUnnecessaryStuff();
}

function captureUserMedia(callback) {
    var video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.setAttribute('controls', true);
    participants.insertBefore(video, participants.firstChild);

    getUserMedia({
        video: video,
        onsuccess: function (stream) {
            config.attachStream = stream;
            callback && callback();

            video.setAttribute('muted', true);
            rotateVideo(video);
        },
        onerror: function () {
            alert('unable to get access to your webcam');
            callback && callback();
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

(function () {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken) if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">You can share this private link with your friends.</a></h2>';
    else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = (function () {
        return "#private-" + ("" + 1e10).replace(/[018]/g, function (a) {
            return (a ^ Math.random() * 16 >> a / 4).toString(16);
        });
    })();
})();