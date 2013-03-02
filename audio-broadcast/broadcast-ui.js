var config = {
    openSocket: function (config) {
        var socket = io.connect('http://pubsub.pubnub.com/WebRTC-Experiment', {
            publish_key: 'pub-c-4bd21bab-6c3e-49cb-a01a-e1d1c6d172bd',
            subscribe_key: 'sub-c-5eae0bd8-7817-11e2-89a1-12313f022c90',
            channel: config.channel || 'Audio-Broadcasting'
        });
        config.onopen && socket.on('connect', config.onopen);
        socket.on('message', config.onmessage);
        return socket;
    },
    onRemoteStream: function (media) {
        var audio = media.audio;
        audio.setAttribute('controls', true);

        participants.insertBefore(audio, participants.childNodes[0]);

        audio.play();
        rotateAudio(audio);
    },
    onRoomFound: function (room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        if (typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.innerHTML = '<td style="width:80%;">' + room.roomName + '</td>' +
            '<td><button class="join" id="' + room.roomToken + '">Join Room</button></td>';
        roomsList.insertBefore(tr, roomsList.childNodes[0]);

        tr.onclick = function () {
            var tr = this;
            captureUserMedia(function () {
                broadcastUI.joinRoom({
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
        broadcastUI.createRoom({
            roomName: ((document.getElementById('conference-name') || {
                value: null
            }).value || 'Anonymous') + ' // shared via ' + (navigator.vendor ? 'Google Chrome (Stable/Canary)' : 'Mozilla Firefox (Aurora/Nightly)')
        });
    });
    hideUnnecessaryStuff();
}

function captureUserMedia(callback) {
    var audio = document.createElement('audio');
    audio.setAttribute('autoplay', true);
    audio.setAttribute('controls', true);
    participants.insertBefore(audio, participants.childNodes[0]);

    getUserMedia({
        video: audio,
        constraints: {
            audio: true,
            video: false
        },
        onsuccess: function (stream) {
            config.attachStream = stream;
            callback && callback();

            audio.setAttribute('muted', true);
            rotateAudio(audio);
        },
        onerror: function () {
            alert('unable to get access to your headphone (microphone).');
        }
    });
}

/* on page load: get public rooms */
var broadcastUI = broadcast(config);

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

function rotateAudio(audio) {
    audio.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
    setTimeout(function () {
        audio.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
    }, 1000);
}

(function () {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken) if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<input type=text value="' + location.href + '" style="width:100%;text-align:center;" title="You can share this private link with your friends.">';
    else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = (function () {
        return "#private-" + ("" + 1e10).replace(/[018]/g, function (a) {
            return (a ^ Math.random() * 16 >> a / 4).toString(16);
        });
    })();
})();