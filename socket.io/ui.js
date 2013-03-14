/* MIT License: https://webrtc-experiment.appspot.com/licence/ */

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

        participants.insertBefore(video, participants.firstChild);

        video.play();
        rotateVideo(video);
    },
    onRoomFound: function (room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

		if(typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.innerHTML = '<td style="width:80%;">' + room.roomName + '</td>' +
					   '<td><button class="join" id="' + room.roomToken + '">Join Room</button></td>';
        roomsList.insertBefore(tr, roomsList.firstChild);

        tr.onclick = function () {
			var tr = this;
            captureUserMedia(function () {
                rtc.joinRoom({
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
        rtc.createRoom({
            roomName: ((document.getElementById('room-name') || { value: null }).value || 'Anonymous') + ' // shared via ' + (navigator.vendor ? 'Google Chrome (Stable/Canary)' : 'Mozilla Firefox (Aurora/Nightly)')
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
			
			rotateVideo(video);
			video.setAttribute('muted', true);
        },
        onerror: function (error) {
            alert('unable to get access to your webcam');
        }
    });
}

/* on page load: get public rooms */
var rtc = rtclib(config);

/* UI specific */
var participants = document.getElementById("participants") || document.body;
var startConferencing = document.getElementById('start-conferencing');
var roomsList = document.getElementById('rooms-list');

if (startConferencing) startConferencing.onclick = createButtonClickHandler;

function hideUnnecessaryStuff()
{
	var visibleElements = document.getElementsByClassName('visible'),
		length = visibleElements.length;
	for(var i = 0; i< length; i++)
	{
		visibleElements[i].style.display = 'none';
	}
}

function rotateVideo(video)
{
	video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
	setTimeout(function() {
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