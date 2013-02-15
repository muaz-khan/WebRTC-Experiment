var config = {
    openSocket: function (config) {
        var socket = io.connect('https://pubsub.pubnub.com/broadcast', {
            publish_key: 'demo',
            subscribe_key: 'demo',
            channel: config.channel || 'video-broadcast',
            ssl: true
        });
        config.onopen && socket.on('connect', config.onopen);
        socket.on('message', config.onmessage);
        return socket;
    },
    onRemoteStream: function (htmlElement) {
        htmlElement.setAttribute('controls', true);
        participants.insertBefore(htmlElement, participants.childNodes[0]);
        htmlElement.onclick = function () {
            requestFullScreen(this);
        };
        htmlElement.play();
        rotateInCircle(htmlElement);
    },
    onRoomFound: function (room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        if (typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);

        if (room.isAudio)
            tr.setAttribute('accesskey', room.isAudio);

        tr.innerHTML = '<td style="width:80%;">' + room.roomName + '</td>' +
            '<td><button class="join" id="' + room.roomToken + '">Join</button></td>';
        roomsList.insertBefore(tr, roomsList.childNodes[0]);

        tr.onclick = function () {
            var tr = this;
            broadcastUI.joinRoom({
                roomToken: tr.querySelector('.join').id,
                joinUser: tr.id,
                isAudio: tr.getAttribute('accesskey')
            });
            hideUnnecessaryStuff();
        };
    }
};

function createButtonClickHandler() {
    captureUserMedia(function () {
        var shared = 'video';
        if (window.option == 'Only Audio') shared = 'audio';
        if (window.option == 'Screen') shared = 'screen';
        broadcastUI.createRoom({
            roomName: ((document.getElementById('conference-name') || {
                value: null
            }).value || 'Anonymous') + ' // shared <span style="color:red;">' + shared + '</span> via ' + (navigator.vendor ? 'Chrome' : 'Firefox'),
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
    participants.insertBefore(htmlElement, participants.childNodes[0]);

    var mediaConfig = {
        video: htmlElement,
        onsuccess: function (stream) {
            config.attachStream = stream;
            callback && callback();

            htmlElement.setAttribute('muted', true);
            rotateInCircle(htmlElement);
        },
        onerror: function () {
            alert('unable to get access to your webcam');
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
    if (uniqueToken) if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<input type=text value="' + location.href + '" style="width:100%;text-align:center;" title="You can share this private link with your friends.">';
    else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = (function () {
        return "#private-" + ("" + 1e10).replace(/[018]/g, function (a) {
            return (a ^ Math.random() * 16 >> a / 4).toString(16);
        });
    })();
})();

function requestFullScreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
}