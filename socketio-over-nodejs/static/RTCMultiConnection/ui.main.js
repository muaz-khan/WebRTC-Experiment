// https://www.webrtc-experiment.com:12034/

function getElement(selector) {
    return document.querySelector(selector);
}

var main = getElement('.main');

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function addNewMessage(args) {
    var newMessageDIV = document.createElement('div');
    newMessageDIV.className = 'new-message';

    var userinfoDIV = document.createElement('div');
    userinfoDIV.className = 'user-info';
    userinfoDIV.innerHTML = args.userinfo || '<img src="//www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/images/user.png">';
	
	userinfoDIV.style.background = args.color || rtcMultiConnection.extra.color || getRandomColor();

    newMessageDIV.appendChild(userinfoDIV);

    var userActivityDIV = document.createElement('div');
    userActivityDIV.className = 'user-activity';

    userActivityDIV.innerHTML = '<h2 class="header">' + args.header + '</h2>';

    var p = document.createElement('p');
    p.className = 'message';
    userActivityDIV.appendChild(p);
    p.innerHTML = args.message;

    newMessageDIV.appendChild(userActivityDIV);

    main.insertBefore(newMessageDIV, main.firstChild);

    userinfoDIV.style.height = newMessageDIV.clientHeight + 'px';

    if (args.callback) {
        args.callback(newMessageDIV);
    }

    document.querySelector('#message-sound').play();
}

main.querySelector('input').onkeyup = function(e) {
    if (e.keyCode != 13) return;
    main.querySelector('button').onclick();
};

main.querySelector('button').onclick = function() {
    var input = this.parentNode.querySelector('input');
    input.disabled = this.disabled = true;

    var username = input.value || 'Anonymous';

	rtcMultiConnection.extra = {
        username: username,
		color: getRandomColor()
    };
    
    addNewMessage({
        header: username,
        message: 'Searching for existing rooms...',
        userinfo: '<img src="//www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/images/action-needed.png">'
    });
    
    var SIGNALING_SERVER = '/';
    var socket = io.connect(SIGNALING_SERVER);
    socket.on('presence', function (isChannelPresent) {
        if (!isChannelPresent) {
            addNewMessage({
                header: username,
                message: 'No room found. Creating new room...<br /><br />You can share following link with your friends:<br /><a href="' + location.href + '">' + location.href + '</a>',
                userinfo: '<img src="//www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/images/action-needed.png">'
            });
            rtcMultiConnection.open();
        }
        else {
            addNewMessage({
                header: username,
                message: 'Room found. Joining the room...',
                userinfo: '<img src="//www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/images/action-needed.png">'
            });
            rtcMultiConnection.connect();
        }
    });
    socket.emit('presence', rtcMultiConnection.channel);
    
    rtcMultiConnection.openSignalingChannel = function(config) {   
       var channel = config.channel || this.channel;

       io.connect(SIGNALING_SERVER).emit('new-channel', {
          channel: channel,
          sender : rtcMultiConnection.userid
       });

       var socket = io.connect(SIGNALING_SERVER + channel);
       socket.channel = channel;

       socket.on('connect', function () {
          if (config.callback) config.callback(socket);
       });

       socket.send = function (message) {
            socket.emit('message', {
                sender: rtcMultiConnection.userid,
                data  : message
            });
        };

       socket.on('message', config.onmessage);
    };
};

function getUserinfo(blobURL, imageURL) {
    return blobURL ? '<video src="' + blobURL + '" autoplay></vide>' : '<img src="' + imageURL + '">';
}

var isShiftKeyPressed = false;

getElement('.main-input-box textarea').onkeydown = function(e) {
	if(e.keyCode == 16) {
		isShiftKeyPressed = true;
	}
};

var numberOfKeys = 0;
getElement('.main-input-box textarea').onkeyup = function(e) {
    numberOfKeys++;
    if(numberOfKeys > 3) numberOfKeys = 0;
    
    if(!numberOfKeys) {
        if(e.keyCode == 8) {
            return rtcMultiConnection.send({
                stoppedTyping: true
            });
        }
    
        rtcMultiConnection.send({
            typing: true
        });
    }
	
	if(isShiftKeyPressed) {
		if(e.keyCode == 16) {
			isShiftKeyPressed = false;
		}
		return;
	}
	
	
    if (e.keyCode != 13) return;

    addNewMessage({
        header: rtcMultiConnection.extra.username,
        message: 'Your Message:<br /><br />' + linkify(this.value),
        userinfo: getUserinfo(rtcMultiConnection.blobURLs[rtcMultiConnection.userid], '//www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/images/chat-message.png'),
		color: rtcMultiConnection.extra.color
    });

    rtcMultiConnection.send(this.value);

    this.value = '';
};

getElement('#allow-webcam').onclick = function() {
    this.disabled = true;
    
	var session = {audio: true, video: true};
    
    rtcMultiConnection.captureUserMedia(function(stream) {
		var streamid = rtcMultiConnection.token();
		rtcMultiConnection.customStreams[streamid] = stream;
		
		rtcMultiConnection.sendMessage({
			hasCamera: true,
			streamid : streamid,
			session: session
		});
    }, session);
};

getElement('#allow-mic').onclick = function() {
    this.disabled = true;
    var session = {audio: true};
    
    rtcMultiConnection.captureUserMedia(function(stream) {
		var streamid = rtcMultiConnection.token();
		rtcMultiConnection.customStreams[streamid] = stream;
		
		rtcMultiConnection.sendMessage({
			hasMic: true,
			streamid : streamid,
			session: session
		});
    }, session);
};

getElement('#allow-screen').onclick = function() {
    this.disabled = true;
    var session = {screen: true};
    
    rtcMultiConnection.captureUserMedia(function(stream) {
		var streamid = rtcMultiConnection.token();
		rtcMultiConnection.customStreams[streamid] = stream;
		
		rtcMultiConnection.sendMessage({
			hasScreen: true,
			streamid : streamid,
			session: session
		});
    }, session);
};

getElement('#share-files').onclick = function() {
    var file = document.createElement('input');
    file.type = 'file';

    file.onchange = function() {
        rtcMultiConnection.send(this.files[0]);
    };
    fireClickEvent(file);
};

function fireClickEvent(element) {
    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    element.dispatchEvent(evt);
}

getElement('#self-url').innerHTML = getElement('#self-url').href = location.href;

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
