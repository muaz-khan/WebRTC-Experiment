// Last time updated at 08 Feb 2014, 19:46:23

// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence

// RTCMultiConnection
// Documentation  - www.RTCMultiConnection.org/docs

// MultiRTC       - npmjs.org/package/multirtc

var rtcMultiConnection = new RTCMultiConnection();

rtcMultiConnection.session = {
    audio: true,
    video: true,
    screen: false,
    data: true
};

var textarea = document.querySelector('textarea');

var checkboxes = document.querySelectorAll('input[type=checkbox]');
for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].onchange = function() {
        var span = this.parentNode.querySelector('span').innerHTML.toLowerCase().replace('?', '');

        if (this.className == 'direction') {
            uncheckAllDirections();
            this.checked = true;

            rtcMultiConnection.direction = span;
        } else {
            if (span == 'text/file') {
                rtcMultiConnection.session.data = !!this.checked;
            } else {
                rtcMultiConnection.session[this.id] = !!this.checked;
            }
        }
    };
}

function uncheckAllDirections() {
    var checkboxes = document.querySelectorAll('.direction');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
}

rtcMultiConnection.body = document.querySelector('.left-panel');

// www.RTCMultiConnection.org/docs/onstream/
rtcMultiConnection.onstream = function(e) {
    var mediaElement = getMediaElement(e.mediaElement, {
        title: e.userid,
        width: rightPanel.clientWidth / 2 - 20,
        buttons: ['mute-audio', 'mute-video', 'record-audio', 'record-video', 'full-screen', 'volume-slider', 'stop', 'take-snapshot'],
        toggle: e.type == 'local' ? ['mute-audio'] : [],
        onMuted: function(type) {
            // www.RTCMultiConnection.org/docs/mute/
            rtcMultiConnection.streams[e.streamid].mute({
                audio: type == 'audio',
                video: type == 'video'
            });
        },
        onUnMuted: function(type) {
            // www.RTCMultiConnection.org/docs/unmute/
            rtcMultiConnection.streams[e.streamid].unmute({
                audio: type == 'audio',
                video: type == 'video'
            });
        },
        onRecordingStarted: function(type) {
            // www.RTCMultiConnection.org/docs/startRecording/
            rtcMultiConnection.streams[e.streamid].startRecording({
                audio: type == 'audio',
                video: type == 'video'
            });
        },
        onRecordingStopped: function(type) {
            // www.RTCMultiConnection.org/docs/stopRecording/
            rtcMultiConnection.streams[e.streamid].stopRecording(function(blob) {
                if (blob.audio) rtcMultiConnection.saveToDisk(blob.audio);
                else if (blob.video) rtcMultiConnection.saveToDisk(blob.audio);
                else rtcMultiConnection.saveToDisk(blob);
            }, type);
        },
        onStopped: function() {
            rtcMultiConnection.peers[e.userid].drop();
        },
        onTakeSnapshot: function() {
            if (!e.stream.getVideoTracks().length) return;

            // www.RTCMultiConnection.org/docs/takeSnapshot/
            rtcMultiConnection.takeSnapshot(e.userid, function(snapshot) {
                if (e.type == 'local') {
                    document.querySelector('#user-image').src = snapshot;
                }
                if (e.type == 'remote') {
                    appendUser(e.userid, snapshot);
                    getNumberOfUsers();
                }

                if (document.getElementById(e.userid) && document.getElementById(e.userid).querySelector('img')) {
                    document.getElementById(e.userid).querySelector('img').src = snapshot;
                }
            });
        },
        onZoomout: resizeVideos
    });

    rightPanel.insertBefore(mediaElement, rightPanel.firstChild);

    if (e.type == 'local') {
        mediaElement.media.muted = true;
        mediaElement.media.volume = 0;
    }

    if (e.type == 'remote') {
        bandWidthPanel.style.visibility = 'visible';
        bandWidthPanel.style.opacity = 1;
    }

    resizeVideos();
};

function resizeVideos() {
    var length = document.querySelectorAll('.media-container').length;
    if (length > 2) {
        changeWidth(rightPanel.clientWidth / 3 - 20);
    }
}

window.addEventListener('resize', resizeVideos);

function changeWidth(width) {
    var videos = document.querySelectorAll('.media-container');
    var length = videos.length;

    for (var i = 0; i < length; i++) {
        videos[i].style.width = width + 'px';
    }
}

// www.RTCMultiConnection.org/docs/onopen/
rtcMultiConnection.onopen = function(e) {
    appendUser(e.userid, rtcMultiConnection.snapshots[e.userid]);
    getNumberOfUsers();

    shareFilesButton.disabled = false;
};

// www.RTCMultiConnection.org/docs/onstreamended/
rtcMultiConnection.onstreamended = function(e) {
    if (e.mediaElement.parentNode && e.mediaElement.parentNode.parentNode && e.mediaElement.parentNode.parentNode.parentNode) {
        e.mediaElement.parentNode.parentNode.parentNode.removeChild(e.mediaElement.parentNode.parentNode);
    }
    resizeVideos();
};

rtcMultiConnection.onNewSession = function(session) {
    rtcMultiConnection.join(session);
    init();
    notificationTone();
};

rtcMultiConnection.onRequest = function(e) {
    notificationTone();
    rtcMultiConnection.accept(e);
};

var leftPanel = document.querySelector('.left-panel');
var rightPanel = document.querySelector('.right-panel');

var startWebrtcSession = document.querySelector('#start-webrtc-session');
startWebrtcSession.onclick = function() {
    init();

    rtcMultiConnection.open();
};

function init() {
    var isData = rtcMultiConnection.session.data;

    document.querySelector('.right-panel').innerHTML = '';
    startWebrtcSession.disabled = true;
    setTimeout(function() {
        leftPanel.removeChild(startWebrtcSession);
    }, 1000);

    var shareLink = document.querySelector('.share-link');
    shareLink.style.opacity = 0;
    setTimeout(function() {
        leftPanel.removeChild(shareLink);
    }, 1000);

    leftPanel.style.width = isData ? '20%' : '1%';
    leftPanel.style.height = isData ? '95%' : '100%';

    document.querySelector('footer').style.height = isData ? '5%' : 0;

    document.querySelector('.right-panel').style.marginLeft = 0;
    document.querySelector('.right-panel').style.height = isData ? '95%' : '100%';

    textarea.onkeyup = function(e) {
        if (e.keyCode != 13) return;
        if (textarea.value && textarea.value.trim().length > 0) {
            appendDIV(textarea.value);
            rtcMultiConnection.send(textarea.value);
            textarea.value = '';
        }
    };

    textarea.value = '';
    textarea.placeholder = 'Type text chatting messages here!';
    textarea.removeAttribute('readonly');

    if (isData) {
        shareFilesButton.style.display = '';
        usersButton.style.right = '55px';
        usersPanel.style.right = '55px';
    }

    renegotiationPanel.style.visibility = 'visible';
    renegotiationPanel.style.opacity = 1;
}

var bandWidthPanel = document.querySelector('.bandwidth-panel');

document.querySelector('#set-bandwidth').onchange = function() {
    var audio = this.value.split(', ')[0].split('kbs')[0];
    var video = this.value.split(', ')[1].split('kbs')[0];
    for (var peer in rtcMultiConnection.peers) {
        rtcMultiConnection.peers[peer].changeBandwidth({
            audio: audio,
            video: video
        });
    }
};

rtcMultiConnection.onmessage = function(e) {
    appendDIV(e.data, rtcMultiConnection.snapshots[e.userid] || 'images/user.png');
};

var shareFilesButton = document.querySelector('#share-files');
shareFilesButton.onclick = function() {
    var file = document.createElement('input');
    file.type = 'file';

    file.onchange = function() {
        rtcMultiConnection.send(this.files[0]);
    };
    fireClickEvent(file);
};

var usersButton = document.querySelector('#users-button');
var usersPanel = document.querySelector('.users-panel');
usersButton.onclick = function() {
    if (!usersPanel.style.visibility || usersPanel.style.visibility == 'hidden') {
        usersPanel.style.visibility = 'visible';
        usersPanel.style.maxHeight = innerHeight;
    } else {
        usersPanel.style.maxHeight = 0;
        usersPanel.style.visibility = 'hidden';
    }
};

function fireClickEvent(element) {
    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    element.dispatchEvent(evt);
}

function appendDIV(value, snapshot) {
    var image = new Image();
    image.src = snapshot || rtcMultiConnection.snapshots[rtcMultiConnection.userid] || document.querySelector('#user-image').src;
    image.style.float = 'left';
    leftPanel.appendChild(image);

    var div = document.createElement('div');
    div.innerHTML = linkify(value);

    leftPanel.appendChild(div);

    div.tabIndex = 0;
    div.focus();
    textarea.focus();
}

function appendUser(userid, snapshot) {
    if (document.getElementById(userid)) return;

    var div = document.createElement('div');
    div.innerHTML = '<img src="' + (snapshot || 'images/user.png') + '">' + userid;
    div.id = userid;

    usersPanel.appendChild(div);
}

rtcMultiConnection.onleave = function(e) {
    var div = document.getElementById(e.userid);
    if (div && div.parentNode) {
        div.parentNode.removeChild(div);
    }
    getNumberOfUsers();
};

appendUser(rtcMultiConnection.userid);

var numberOfUsers = document.querySelector('#number-of-users');

function getNumberOfUsers() {
    numberOfUsers.innerHTML = document.querySelectorAll('.users-panel div').length;
    if (document.title.indexOf('users /') == -1) {
        document.title = numberOfUsers.innerHTML + ' users / ' + document.title;
    } else document.title = numberOfUsers.innerHTML + ' users / ' + document.title.replace(' users / ', '');
}

var renegotiationButton = document.getElementById('renegotiate');
var renegotiationPanel = document.querySelector('.renegotiation-panel');
renegotiationButton.onclick = function() {
    var renegotiationOptions = document.getElementById('renegotiation-options').value;
    var renegotiationDirection = document.getElementById('renegotiation-direction').value;

    var renegotiate = { };
    if (renegotiationDirection == 'One-Way') {
        renegotiate.oneway = true;
    }

    renegotiationOptions = renegotiationOptions.toLowerCase().split('+');
    for (var i = 0; i < renegotiationOptions.length; i++) {
        renegotiate[renegotiationOptions[i]] = true;
    }

    rtcMultiConnection.addStream(renegotiate);
};

function notificationTone() {
    document.querySelector('#IM_sound').play();
}

document.querySelector('#link-to-share').href = location.href;
document.querySelector('#link-to-share').innerHTML = 'MultiRTC/' + location.href.split('/').pop();

var splitted = document.querySelector('#link-to-share').innerHTML.split('/');
document.title = splitted[splitted.length - 1].replace( /%20/g , ' ').replace( /\+/g , ' ') + ' @ ' + document.title;

getNumberOfUsers();

var channels = { };

// var signaling_url = 'https://www.webrtc-experiment.com:12034';
var signaling_url = '/?userid=' + rtcMultiConnection.userid + '&room=' + location.href.split('/').pop();

var socketio = io.connect(signaling_url);

socketio.on('message', function(data) {
    if (data.sender == rtcMultiConnection.userid) return;

    if (channels[data.channel] && channels[data.channel].onmessage) {
        channels[data.channel].onmessage(data.message);
    }
});

socketio.on('user-left', function(e) {
    if (e.room != location.href.split('/').pop()) return;
    console.log('user left', e.userid);

    for (var stream in rtcMultiConnection.streams) {
        stream = rtcMultiConnection.streams[stream];
        if (stream.userid == e.userid) {
            stream.stop();
            rtcMultiConnection.onstreamended(stream.streamObject);
            delete rtcMultiConnection.streams[stream];
        }
    }
});

// overriding "openSignalingChannel" method
rtcMultiConnection.openSignalingChannel = function(config) {
    var channel = config.channel || this.channel;
    channels[channel] = config;

    if (config.onopen) setTimeout(config.onopen, 1000);
    return {
        send: function(message) {
            socketio.emit('message', {
                sender: rtcMultiConnection.userid,
                channel: channel,
                message: message
            });
        },
        channel: channel
    };
};

rtcMultiConnection.connect();
