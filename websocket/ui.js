var uniqueChannelForYourSite = 'one-to-one-video-chat-using-websocket';
var config = {
    openSocket: function (config) {
		"use strict";
		var socket = new WebSocket('wss://pubsub.pubnub.com/' + (window.publish_key || 'demo') + '/' + (window.subscribe_key || 'demo') + '/' + uniqueChannelForYourSite);
		socket.onmessage = function (evt) {
			config.onmessage(evt.data);
		};
		if(config.onopen) socket.onopen = config.onopen;	
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
        blockquote.innerHTML = room.roomName + '<a href="#" class="join" id="' + room.roomToken + '">Join Room</a>';
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
            roomName: ((document.getElementById('room-name') || { value: null }).value || 'Anonymous') + ' // shared via ' + (navigator.vendor ? 'Google Chrome (Stable/Canary)' : 'Mozilla Firefox (Aurora/Nightly)')
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