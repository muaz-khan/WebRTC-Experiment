/* MIT License: https://webrtc-experiment.appspot.com/licence/ */

var config = {
    openSocket: function (config) {
        var channel = config.channel || location.hash.substr(1) || 'audio-only-calls';
        var socket = new Firebase('https://webrtc-experiment.firebaseIO.com/' + channel);
        socket.channel = channel;
        socket.on('child_added', function (data) {
            config.onmessage(data.val());
        });
        socket.send = function (data) {
            this.push(data);
        }
        config.onopen && setTimeout(config.onopen, 1);
        socket.onDisconnect().remove();
        return socket;
    },
    onRemoteStream: function (media) {
        var audio = media.audio;
        audio.setAttribute('controls', true);
        audio.setAttribute('autoplay', true);

        participants.insertBefore(audio, participants.firstChild);

        audio.play();
        rotateAudio(audio);

        if (saveRecordedStreams) saveRecordedStreams.style.display = '';

        /* recording remote stream using RecordRTC
        if (typeof remoteStreamRecorder === 'undefined') window.remoteStreamRecorder = null;
        remoteStreamRecorder = RecordRTC(stream);
        remoteStreamRecorder.startRecording();

        if (saveRemoteStream) saveRemoteStream.style.display = '';
		*/
    },
    onRoomFound: function (room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        if (typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.innerHTML = '<td>' + room.roomName + ' is calling you!</td>' +
            '<td><button class="join" id="' + room.roomToken + '">Receive Call</button></td>';
        roomsList.insertBefore(tr, roomsList.firstChild);

        tr.onclick = function () {
            var tr = this;
            captureUserMedia(function () {
                callerUI.joinRoom({
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
        callerUI.createRoom({
            roomName: (document.getElementById('caller-name') || {}).value || 'Anonymous'
        });
    });
    hideUnnecessaryStuff();
}

function captureUserMedia(callback) {
    var audio = document.createElement('audio');
    audio.setAttribute('autoplay', true);
    audio.setAttribute('controls', true);
    participants.insertBefore(audio, participants.firstChild);

    getUserMedia({
        video: audio,
        constraints: {
            audio: true,
            video: false
        },
        onsuccess: function (stream) {
            config.attachStream = stream;

            audio.setAttribute('muted', true);
            rotateAudio(audio);

            // recording local stream using RecordRTC
            if (typeof localStreamRecorder === 'undefined') window.localStreamRecorder = null;
            localStreamRecorder = RecordRTC(stream);
            localStreamRecorder.startRecording();
            if (saveLocalStream) saveLocalStream.style.display = '';

            callback && callback();
        },
        onerror: function () {
            alert('unable to get access to your microphone.');
        }
    });
}

/* on page load: get public rooms */
var callerUI = CallInitiator(config);

/* UI specific */
var participants = document.getElementById("participants") || document.body;
var call = document.getElementById('start-calling');
var roomsList = document.getElementById('rooms-list');
var saveRecordedStreams = document.getElementById('save-recorded-streams');

if (call) call.onclick = createButtonClickHandler;

/* saving recorded local/remove audio streams */

var saveRemoteStream = document.getElementById('save-remote-stream'),
    saveLocalStream = document.getElementById('save-local-stream');

if (saveRemoteStream) saveRemoteStream.onclick = function () {
    if (remoteStreamRecorder) remoteStreamRecorder.stopRecording(insertRecordedFileURL);
    this.parentNode.removeChild(this);
};

if (saveLocalStream) saveLocalStream.onclick = function () {
    if (localStreamRecorder) localStreamRecorder.stopRecording(insertRecordedFileURL);
    this.parentNode.removeChild(this);
};

var remoteStreamRecorder, localStreamRecorder;

function insertRecordedFileURL(recordedFileURL) {
	roomsList.style.display = '';
	
	var tr = document.createElement('tr');
	tr.innerHTML = '<td>Open/Save recorded audio file</td><td><a href="' + recordedFileURL + '" target="_blank">OPEN</a></td>';
	roomsList.insertBefore(tr, roomsList.firstChild);
}

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
    if (uniqueToken) if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
    else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
})();