var config = {
    openSocket: function (config) {
        var socket = io.connect('https://pubsub.pubnub.com/socket-io', {
            publish_key: 'pub-c-4bd21bab-6c3e-49cb-a01a-e1d1c6d172bd',
            subscribe_key: 'sub-c-5eae0bd8-7817-11e2-89a1-12313f022c90',
            channel: config.channel || location.hash.replace('#', '') || 'rtc-socket-io',
            ssl: true
        });
        config.onopen && socket.on('connect', config.onopen);
        socket.on('message', config.onmessage);
        return socket;
    },
    onRemoteStream: function (media) {
        var video = media.video;
        video.setAttribute('controls', true);

        participants.insertBefore(video, participants.childNodes[0]);

        video.play();
        rotateVideo(video);
    },
    onRoomFound: function (room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        var roomsList = document.getElementById('rooms-list') || document.body;

        var blockquote = document.createElement('blockquote');
        blockquote.setAttribute('id', room.broadcaster);
        blockquote.innerHTML = room.roomName + '<button class="join" id="' + room.roomToken + '">Join Room</button>';
        roomsList.insertBefore(blockquote, roomsList.childNodes[0]);

        blockquote.onclick = function () {
            captureUserMedia(function () {
                rtc.joinRoom({
                    roomToken: blockquote.querySelector('.join').id,
                    joinUser: blockquote.id
                });
            });
            hideUnnecessaryStuff();
        };
    }
};

function createButtonClickHandler() {
    captureUserMedia(function () {
        rtc.createRoom({
            roomName: ((document.getElementById('room-name') || {
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

    participants.insertBefore(video, participants.childNodes[0]);

    getUserMedia({
        video: video,
        onsuccess: function (stream) {
            config.attachStream = stream;
            callback && callback();

            rotateVideo(video);
            video.setAttribute('muted', true);
        },
        onerror: function (error) {
            alert(error);
        }
    });
}

/* on page load: get public rooms */
var rtc = rtclib(config);

/* UI specific */
var participants = document.getElementById("participants") || document.body;
var startConferencing = document.getElementById('start-conferencing');

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
    if (uniqueToken) {
        if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<input type=text value="' + location.href + '" style="width:100%;text-align:center;" title="You can share this private link with your friends.">';
        else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = (function () {
            return "#private-" + ("" + 1e10).replace(/[018]/g, function (a) {
                return (a ^ Math.random() * 16 >> a / 4).toString(16);
            });
        })();
    }
})();