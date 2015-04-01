// WebRTC realtime Calls!!! (part of WebRTC Experiments by Muaz Khan!) @WebRTCWeb

// https://wwww.webrtc-experiment.com/

// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.webrtc-experiment.com/licence
// Experiments   - github.com/muaz-khan/WebRTC-Experiment

// loading larger images as data-URLs across domains.
var imageURL = getBackgroundImage();
var imgElephant = document.getElementById("images-video-container-png");
imgElephant.setAttribute('src', imageURL);

var chatSection = getElement('.chat-section'),
    chatOutput = getElement('.chat-output'),
    chatInput = getElement('.chat-input input');

var channel = location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
var sender = Math.round(Math.random() * 999999999) + 999999999;

var SIGNALING_SERVER = 'https://signaling-muazkh.c9.io:443/';

io.connect(SIGNALING_SERVER).emit('new-channel', {
    channel: channel,
    sender: sender
});

var socket = io.connect(SIGNALING_SERVER + channel);
socket.on('connect', function () {
    chatInput.disabled = false;
    appendMessage('Socket.io connection is opened.', 'System', 'System');
});

socket.on('disconnect', function() {
    chatInput.disabled = true;
    appendMessage('Socket.io connection is disconnected.', 'System', 'System');
});

socket.on('error', function () {
    appendMessage('Socket.io connection failed.', 'System', 'System');
});

socket.send = function (message) {
    socket.emit('message', {
        sender: sender,
        data: message
    });
};

var isGecko = !! navigator.mozGetUserMedia;

function store(item, value) {
    localStorage.setItem(item, value);
}

function get(item) {
    return localStorage.getItem(item);
}

function isSelected(element) {
    return element.className.indexOf('selected') != -1;
}

function unSelect(element) {
    element.className = element.className.replace(/( selected|selected)/g, '');
}

function getElement(selector) {
    return document.querySelector(selector);
}

function getUserMedia(mediaType, callback) {
    var hints = {};
    if (mediaType == 'audio') {
        hints.audio = true;
        window.mediaType = 'audio';
    } else window.mediaType = 'video';

    // ['1920:1080', '1280:720', '960:720', '640:360', '640:480', '320:240', '320:180'];
    if (mediaType == 'video') {
        hints = {
            audio: true,
            video: {
                optional: [],
                mandatory: {}
            }
        };
    }

    if (mediaType == 'screen') {
        hints = {
            audio: false,
            video: !!navigator.webkitGetUserMedia ? {
                optional: [],
                mandatory: {
                    maxWidth: 1920,
                    maxHeight: 1080,
                    chromeMediaSource: 'screen'
                }
            } : {
                mozMediaSource: 'window',
                mediaSource: 'window',
                maxWidth: 1920,
                maxHeight: 1080
            }
        };
    }

    navigator.getUserMedia(hints, function (stream) {
        if (peer) peer.mediaType = mediaType == 'audio' ? 'audio' : 'video';

        callback(stream);

        var mediaElement = document.createElement(mediaType == 'audio' ? 'audio' : 'video');
        mediaElement[isGecko ? 'mozSrcObject' : 'src'] = isGecko ? stream : window.webkitURL.createObjectURL(stream);

        mediaElement.volume = 0;
        mainPreview.innerHTML = '<img src="' + imageURL + '">';
        mainPreview.appendChild(mediaElement);
        mediaElement.play();

        if (mediaType == 'audio') mediaElement.controls = true;
        else takeSnapshot(peer.userid, mediaElement);
    }, function(error) {
        alert( JSON.stringify(error, null, '\t') );
    });
}

var toolBoxCameraIcon = getElement('.camera-icon'),
    toolBoxVoiceIcon = getElement('.voice-icon'),
    toolBoxScreenIcon = getElement('.screen-icon');

function leaveCamera() {
    // leave camera
    if (peer && peer.MediaStream) {
        peer.MediaStream.stop();
        peer.MediaStream = null;
    }

    mainPreview.innerHTML = '<img src="' + imageURL + '">';
}

toolBoxCameraIcon.onclick = function () {
    if (isSelected(this)) {
        unSelect(this);
        leaveCamera();
    } else {
        this.className += ' selected';
        getUserMedia('video', function (stream) {
            if (peer) peer.addStream(stream);
        });
    }
};

toolBoxVoiceIcon.onclick = function () {
    if (isSelected(this)) {
        unSelect(this);
        leaveCamera();
    } else {
        this.className += ' selected';
        getUserMedia('audio', function (stream) {
            if (peer) peer.addStream(stream);
        });
    }
};

toolBoxScreenIcon.onclick = function () {
    if (isSelected(this)) {
        unSelect(this);
    } else {
        this.className += ' selected';
        getUserMedia('screen', function (stream) {
            if (peer) peer.addStream(stream);
        });
    }
};

function appendMessage(message, className, userid) {
    if (!message.length) return;

    var div = document.createElement('div');
    div.className = className;
    div.innerHTML = '<img src="' + ((peer.userid == userid ? snapshots.userSnapshot : snapshots.targetUserSnapshot) || '/calls/images/user.png') + '"><span>' + linkify(message) + '</span>';
    chatOutput.appendChild(div);

    div.tabIndex = 0;
    div.style.opacity = 1;
    div.focus();
    chatInput.focus();
}

chatInput.onkeyup = function (e) {
    if (e.keyCode != 13) return;

    socket.send({
        userid: peer.userid,
        customMessage: true,
        textChat: this.value
    });

    appendMessage(this.value, 'You', peer.userid);

    this.value = '';
};


var alertMessages = {
    'on-page-load': '<h2>Setup your userid:</h2> \
		<div> \
			<label for="user-id">Enter Unique UserName</label> \
			<input type="text" autofocus value="' + (get('userid') || '') + '"> \
		</div> \
		<p> \
			Other users can call you using your user-id. \
		</p> \
		<hr><button>Save User-id</button>',

    'on-saving-user-id': '<h2>Make a Call</h2> \
		<div> \
			<label for="user-id">Enter UserName to Call</label> \
			<input type="text" autofocus value="' + (get('target-userid') || '') + '"> \
		</div> \
		<p> \
			You can call any user using his user-id. \
		</p> \
		<hr><button>Call Him</button><button style="margin-left:1em;" id="skip">Skip</button>'
};

var alertBox = getElement('.alert-box'),
    alertBoxContent = getElement('.alert-box-content'),
    closeAlertBox = getElement('.alert-box-close-button');

closeAlertBox.onclick = function () {
    rotateAlertBox({
        opacity: 0
    });
};

alertBoxContent.innerHTML = alertMessages['on-page-load'];

function merge(mergein, mergeto) {
    for (var t in mergeto) {
        mergein[t] = mergeto[t];
    }
    return mergein;
}

var prevDegree = -360;

function rotateAlertBox(additional) {
    if (prevDegree == -360) prevDegree = 360;
    else prevDegree = -360;

    merge(alertBox.style, {
        '-webkit-transform': 'rotate(' + prevDegree + 'deg)',
        'transform': 'rotate(' + prevDegree + 'deg)',
        opacity: 1
    });
    if (additional) {
        merge(alertBox.style, additional);
    }
}

rotateAlertBox();

function fireClickEvent(element) {
    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    element.dispatchEvent(evt);
}

function setupEnterKey() {
    var inputElement = alertBoxContent.querySelector('input');
    if (!inputElement) return;
    inputElement.onkeyup = function (e) {
        if (e.keyCode != 13) return;
        var button = this.parentNode.parentNode.querySelector('button');
        if (button) fireClickEvent(button);
    };
}

setupEnterKey();
alertBoxContent.querySelector('button').onclick = function () {
    var inputBox = alertBoxContent.querySelector('input');
    if (!inputBox.value) return;
    peer.userid = inputBox.value;

    store('userid', peer.userid);

    this.disabled = true;
    rotateAlertBox();

    alertBoxContent.innerHTML = alertMessages['on-saving-user-id'];
    setupEnterKey();

    alertBoxContent.querySelector('button').onclick = function () {
        if (!peer.MediaStream) return alert("As a caller, you MUST select camera or microphone. Please use top-left tool-box.");

        inputBox = alertBoxContent.querySelector('input');
        if (!inputBox.value) return;

        alertBoxContent.querySelector('button').disabled = true;

        peer.sendParticipationRequest(inputBox.value);
        store('target-userid', inputBox.value);
        fireClickEvent(closeAlertBox);
    };

    alertBoxContent.querySelector('#skip').onclick = function () {
        fireClickEvent(closeAlertBox);
    };
};

var smallPreview = getElement('.smaller-preview');
var mainPreview = getElement('.main-preview');

var peer = new PeerConnection(socket);

if (get('userid')) {
    peer.userid = get('userid');
}

peer.onParticipationRequest = function (targetUserid) {
    playMessageSound();

    alertBoxContent.innerHTML = '<h2>A person is calling you</h2> \
			<p> \
				A person whose user-id is ' + targetUserid + ', is calling. \
			</p> \
			<hr><button id="' + targetUserid + '">Receive His Call</button>';

    rotateAlertBox({
        opacity: 1
    });

    alertBoxContent.querySelector('button').onclick = function () {
        // if (!peer.MediaStream) return alert("You've not allowed camera/mic. Please use top-left tool-box.");

        socket.send({
            userid: peer.userid,
            customMessage: true,
            mediaType: window.mediaType
        });

        this.disabled = true;
        rotateAlertBox();
        fireClickEvent(closeAlertBox);
        peer.acceptRequest(this.id);
    };
};

peer.onStreamAdded = function (e) {
    var smallPreview = getElement('.smaller-preview');
    var mainPreview = getElement('.main-preview');

    smallPreview.innerHTML = '';

    var mediaElementInMainPreviewBox = mainPreview.querySelector(peer.mediaType);
    if (mediaElementInMainPreviewBox) {
        smallPreview.appendChild(mediaElementInMainPreviewBox);
        mediaElementInMainPreviewBox.play();
    }

    mainPreview.appendChild(e.mediaElement);

    if (peer.mediaType != 'audio') {
        takeSnapshot(e.userid, e.mediaElement);
    }

    setTimeout(askForSnapshot, 3000);
    if (peer.mediaType == 'audio') e.mediaElement.controls = true;
};

peer.onStreamEnded = function () {
    mainPreview.appendChild(smallPreview.querySelector(peer.mediaType));

    smallPreview.innerHTML = '<img src="images/call-button-bigger.png">';
};

peer.onCustomMessage = function (data) {
    if (data.textChat) {
        playMessageSound();
        appendMessage(data.textChat, 'He', data.userid);
    }

    if (data.mediaType) {
        peer.mediaType = data.mediaType;
    }

    var mediaElement = mainPreview.querySelector('audio') || mainPreview.querySelector('video');

    if (data.muted) {
        if (data.mediaType == 'video') {
            mediaElement.poster = 'images/call-button-bigger.png';
        }

        if (data.mediaType == 'all' || data.mediaType == 'audio') {
            mediaElement.muted = true;
            mediaElement.volume = 0;
        }
    }

    if (data.unmuted) {
        if (data.mediaType == 'video') {
            mediaElement.poster = '';
        }

        if (data.mediaType == 'all' || data.mediaType == 'audio') {
            mediaElement.muted = false;
            mediaElement.volume = 1;
        }

        mediaElement.play();
    }

    if (data.sendYourSnapshot) {
        socket.send({
            userid: peer.userid,
            customMessage: true,
            snapshot: snapshots.userSnapshot || false
        });
    }

    if (data.snapshot) {
        snapshots.targetUserSnapshot = data.snapshot;
    }
};

function askForSnapshot() {
    socket.send({
        userid: peer.userid,
        customMessage: true,
        sendYourSnapshot: true
    });
}

var muteUnmuteVoice = getElement('.call-control-section .voice'),
    muteUnmuteVideo = getElement('.call-control-section .video');

muteUnmuteVoice.onclick = function () {
    if (this.className.indexOf('no-voice') == -1) {
        this.className += ' selected';
        this.className = this.className.replace('voice', 'no-voice');
        socket.send({
            userid: peer.userid,
            customMessage: true,
            mediaType: 'audio',
            muted: true
        });

        if (peer) {
            if (peer.MediaStream.getAudioTracks()[0]) {
                peer.MediaStream.getAudioTracks()[0].enabled = false;
            }
        }
    } else {
        unSelect(this);
        this.className = this.className.replace('no-voice', 'voice');
        socket.send({
            userid: peer.userid,
            customMessage: true,
            mediaType: 'audio',
            unmuted: true
        });

        if (peer) {
            if (peer.MediaStream.getAudioTracks()[0]) {
                peer.MediaStream.getAudioTracks()[0].enabled = true;
            }
        }
    }
};

muteUnmuteVideo.onclick = function () {
    if (this.className.indexOf('no-video') == -1) {
        this.className += ' selected';
        this.className = this.className.replace('video', 'no-video');
        socket.send({
            userid: peer.userid,
            customMessage: true,
            mediaType: 'video',
            muted: true
        });

        if (peer) {
            peer.MediaStream.getVideoTracks()[0].enabled = false;
        }
    } else {
        unSelect(this);
        this.className = this.className.replace('no-video', 'video');
        socket.send({
            userid: peer.userid,
            customMessage: true,
            mediaType: 'video',
            unmuted: true
        });

        if (peer) {
            peer.MediaStream.getVideoTracks()[0].enabled = true;
        }
    }
};

function takeSnapshot(userid, video) {
    setTimeout(function () {
        var canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || video.clientWidth;
        canvas.height = video.videoHeight || video.clientHeight;

        var context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        snapshots[userid] = canvas.toDataURL();
        if (userid == peer.userid) {
            snapshots.userSnapshot = canvas.toDataURL();
            store('user-snapshot', canvas.toDataURL());
        } else {
            snapshots.targetUserSnapshot = canvas.toDataURL();
            store('target-user-snapshot', snapshots[userid]);
        }
    }, 2000);
}

var snapshots = {
    userSnapshot: get('user-snapshot'),
    targetUserSnapshot: get('target-user-snapshot')
};

askForSnapshot();

var messageSound = document.querySelector('#message-sound');

function playMessageSound() {
    messageSound.play();
}
