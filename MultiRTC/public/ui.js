// Last time updated at 04 Feb 2014, 05:46:23

// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence

// RTCMultiConnection
// Documentation  - www.RTCMultiConnection.org/docs

// MultiRTC       - npmjs.org/package/multirtc

var rtcMultiConnection = new RTCMultiConnection();

rtcMultiConnection.session = {
    audio: false,
    video: false,
    screen: false,
    data: true
};

var channels = {};

// var signaling_url = 'https://www.webrtc-experiment.com:12034';
var signaling_url = '/';

var socketio = io.connect(signaling_url);

socketio.on('message', function (data) {
    if (data.sender == rtcMultiConnection.userid) return;

    if (channels[data.channel] && channels[data.channel].onmessage) {
        channels[data.channel].onmessage(data.message);
    }
});

// overriding "openSignalingChannel" method
rtcMultiConnection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    channels[channel] = config;

    if (config.onopen) setTimeout(config.onopen, 1000);
    return {
        send: function (message) {
            socketio.emit('message', {
                sender: rtcMultiConnection.userid,
                channel: channel,
                message: message
            });
        },
        channel: channel
    };
};

var textarea = document.querySelector('textarea');

var checkboxes = document.querySelectorAll('input[type=checkbox]');
for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].onchange = function () {
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
rtcMultiConnection.onstream = function (e) {
    var mediaElement = getMediaElement(e.mediaElement, {
        width: rightPanel.clientWidth - 20,
        buttons: ['full-screen'],
        enableTooltip: false,
        showOnMouseEnter: false,
        onZoomin: function () {
            mediaElement.style.left = 0;
            mediaElement.style.top = 0;
            mediaElement.style.bottom = 0;
            mediaElement.style.right = 0;
        },
        onZoomout: resizeVideos
    });

    rightPanel.insertBefore(mediaElement, rightPanel.firstChild);

    !rtcMultiConnection.snapshots[e.userid] && e.stream.getVideoTracks().length && setTimeout(function () {
        rtcMultiConnection.takeSnapshot(e.userid, function (snapshot) {
            if (e.type == 'local') {
                store('user-image', snapshot);
                document.querySelector('#user-image').src = snapshot;
            }

            if (e.type == 'remote') {
                appendUser(e.userid, snapshot);
                getNumberOfUsers();
            }
        });
    }, 2000);

    resizeVideos();
};

rtcMultiConnection.onopen = function (e) {
    appendUser(e.userid, rtcMultiConnection.snapshots[e.userid]);
    getNumberOfUsers();

    shareFilesButton.disabled = false;
};

rtcMultiConnection.onstreamended = function (e) {
    if (e.mediaElement.parentNode && e.mediaElement.parentNode.parentNode && e.mediaElement.parentNode.parentNode.parentNode) {
        e.mediaElement.parentNode.parentNode.parentNode.removeChild(e.mediaElement.parentNode.parentNode);
    }

    resizeVideos();
};

rtcMultiConnection.onNewSession = function (session) {
    rtcMultiConnection.join(session);
    init();
    notificationTone();
};

rtcMultiConnection.onRequest = function (e) {
    notificationTone();
    rtcMultiConnection.accept(e);
};

var leftPanel = document.querySelector('.left-panel');
var rightPanel = document.querySelector('.right-panel');

var startWebrtcSession = document.querySelector('#start-webrtc-session');
startWebrtcSession.onclick = function () {
    init();

    rtcMultiConnection.open();
};

function init() {
    var isData = rtcMultiConnection.session.data;

    document.querySelector('.right-panel').innerHTML = '';
    startWebrtcSession.disabled = true;
    setTimeout(function () {
        leftPanel.removeChild(startWebrtcSession);
    }, 1000);

    var shareLink = document.querySelector('.share-link');
    shareLink.style.opacity = 0;
    setTimeout(function () {
        leftPanel.removeChild(shareLink);
    }, 1000);

    leftPanel.style.width = isData ? '20%' : '1%';
    leftPanel.style.height = isData ? '95%' : '100%';

    document.querySelector('footer').style.height = isData ? '5%' : 0;

    document.querySelector('.right-panel').style.marginLeft = 0;
    document.querySelector('.right-panel').style.height = isData ? '95%' : '100%';

    textarea.onkeyup = function (e) {
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

rtcMultiConnection.onmessage = function (e) {
    appendDIV(e.data, rtcMultiConnection.snapshots[e.userid] || 'images/user.png');
};

var shareFilesButton = document.querySelector('#share-files');
shareFilesButton.onclick = function () {
    var file = document.createElement('input');
    file.type = 'file';

    file.onchange = function () {
        rtcMultiConnection.send(this.files[0]);
    };
    fireClickEvent(file);
};

var usersButton = document.querySelector('#users-button');
var usersPanel = document.querySelector('.users-panel');
usersButton.onclick = function () {
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
    image.src = snapshot || rtcMultiConnection.snapshots[rtcMultiConnection.userid] || get('user-image') || document.querySelector('#user-image').src;
    image.style.float = 'left';
    leftPanel.appendChild(image);

    var div = document.createElement('div');
    div.innerHTML = linkify(value);

    leftPanel.appendChild(div);

    div.tabIndex = 0;
    div.focus();
    textarea.focus();
}

/*
rtcMultiConnection.onspeaking = function (e) {
    var div = e.mediaElement.parentNode.parentNode;

    rightPanel.insertBefore(div, rightPanel.firstChild);
    if (div.querySelector('video')) {
        div.querySelector('video').play();
    }
    if (div.querySelector('audio')) {
        div.querySelector('audio').play();
    }
    resizeVideos(div);
};

*/
function resizeVideos(div) {
    var videos = document.querySelectorAll('.media-container');
    var length = videos.length;

    for (var i = 0; i < length; i++) {
        videos[i].onclick = function () {
            rightPanel.insertBefore(div, rightPanel.firstChild);
            if (div.querySelector('video')) {
                div.querySelector('video').play();
            }
            if (div.querySelector('audio')) {
                div.querySelector('audio').play();
            }
            resizeVideos();
        };
    }

    if (length >= 1) {
        var isData = rtcMultiConnection.session.data;
        videos[0].style.width = isData ? '77%' : '97%';
        videos[0].style.bottom = isData ? '6%' : '1%';
        videos[0].style.right = 0;
        videos[0].style.left = isData ? '22%' : '1%';
        videos[0].style.top = isData ? '10px' : '1%';
    }

    if (length >= 2) {
        videos[1].style.width = '20%';
        videos[1].style.bottom = isData ? '6%' : '2%';
        videos[1].style.right = 0;
        videos[1].style.left = 'auto';
        videos[1].style.top = 'auto';
    }

    if (length >= 3) {
        videos[2].style.width = '20%';
        videos[2].style.top = 0;
        videos[2].style.right = 0;
        videos[2].style.left = 'auto';
        videos[2].style.bottom = 'auto';
    }

    if (length >= 4) {
        videos[3].style.width = '20%';
        videos[3].style.top = 0;
        videos[3].style.right = 'auto';
        videos[3].style.left = '22%';
        videos[3].style.bottom = 'auto';
    }

    if (length >= 5) {
        videos[4].style.width = '20%';
        videos[4].style.top = 'auto';
        videos[4].style.right = 'auto';
        videos[4].style.left = '22%';
        videos[4].style.bottom = isData ? '6%' : '2%';
    }

    if (length >= 6) {
        videos[4].style.width = '20%';
        videos[4].style.top = 0;
        videos[4].style.right = 'auto';
        videos[4].style.left = '0';
        videos[4].style.bottom = 'auto';
    }
}

window.onresize = resizeVideos;

function appendUser(userid, snapshot) {
    if (document.getElementById(userid)) return;

    var div = document.createElement('div');
    div.innerHTML = '<img src="' + (snapshot || get('user-image') || 'images/user.png') + '">' + userid;
    div.id = userid;

    usersPanel.appendChild(div);
}

rtcMultiConnection.onleave = function (e) {
    var div = document.getElementById(e.userid);
    if (div && div.parentNode) {
        div.parentNode.removeChild(div);
    }
    getNumberOfUsers();
};

if (!get('userid')) {
    store('userid', prompt('You doesn\'t have userid. Please set one!') || rtcMultiConnection.userid);
}

rtcMultiConnection.userid = get('userid');
if (get('user-image')) {
    document.querySelector('#user-image').src = get('user-image');
}

appendUser(rtcMultiConnection.userid);

var numberOfUsers = document.querySelector('#number-of-users');

function getNumberOfUsers() {
    numberOfUsers.innerHTML = document.querySelectorAll('.users-panel div').length;
    if (document.title.indexOf('users /') == -1) {
        document.title = numberOfUsers.innerHTML + ' users / ' + document.title;
    } else document.title = numberOfUsers.innerHTML + ' users / ' + document.title.replace(' users / ', '');
}

function store(item, value) {
    localStorage.setItem(item, value);
}

function get(item) {
    return localStorage.getItem(item);
}

var renegotiationButton = document.getElementById('renegotiate');
var renegotiationPanel = document.querySelector('.renegotiation-panel');
renegotiationButton.onclick = function () {
    var renegotiationOptions = document.getElementById('renegotiation-options').value;
    var renegotiationDirection = document.getElementById('renegotiation-direction').value;

    var renegotiate = {};
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
document.querySelector('#link-to-share').innerHTML = location.href.replace(signaling_url, 'MultiRTC');

var splitted = document.querySelector('#link-to-share').innerHTML.split('/');
document.title = splitted[splitted.length - 1].replace(/%20/g, ' ').replace(/\+/g, ' ') + ' @ ' + document.title;

getNumberOfUsers();

rtcMultiConnection.connect();
