var defaultChannel = location.hash.replace('#', '') || window.defaultChannel || 'file-hangout';
var config = {
    openSocket: function (config) {
        if (!window.io) return false;

        if (!window.socket_config)
            window.socket_config = {
                publish_key: 'demo',
                subscribe_key: 'demo',
                ssl: true
            };

        socket_config.channel = config.channel || defaultChannel;
        var socket = io.connect('https://pubsub.pubnub.com/' + defaultChannel, socket_config);
        config.onopen && socket.on('connect', config.onopen);
        socket.on('message', config.onmessage);
        return socket;
    },
    onRoomFound: function (room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        var roomsList = document.getElementById('rooms-list') || document.body;

		var tr = document.createElement('tr');
		tr.setAttribute('id', room.broadcaster);
		tr.style.fontSize = '.8em';
        tr.innerHTML = '<td>' + room.roomName + '</td>' +
					   '<td><a href="#" class="join" id="' + room.roomToken + '">Join</a></td>';

        roomsList.insertBefore(tr, roomsList.childNodes[0]);
		
		tr.onclick = function () {
            hangoutUI.joinRoom({
                roomToken: tr.querySelector('.join').id,
                joinUser: tr.id,
                userName: prompt('Enter your name', 'Anonymous')
            });
            hideUnnecessaryStuff();
        };
    },
    onChannelOpened: function (/* channel */) {
        unnecessaryStuffVisible && hideUnnecessaryStuff();
		if(fileElement) fileElement.removeAttribute('disabled');
    },
    onChannelMessage: function (data) {
		if(data.sender && participants) {
			var tr = document.createElement('tr');
			tr.innerHTML = '<td>' + data.sender + ' is ready to receive files!</td>';
			participants.insertBefore(tr, participants.childNodes[0]);
		}
		else onMessageCallback(data);
    }
};

function createButtonClickHandler() {
    hangoutUI.createRoom({
        userName: prompt('Enter your name', 'Anonymous'),
        roomName: ((document.getElementById('conference-name') || { value: null }).value || 'Anonymous') + ' // shared via ' + (navigator.vendor ? 'Google Chrome (Stable/Canary)' : 'Mozilla Firefox (Aurora/Nightly)')
    });
	hideUnnecessaryStuff();
}


/* on page load: get public rooms */
var hangoutUI = hangout(config);

/* UI specific */
var startConferencing = document.getElementById('start-conferencing');
if (startConferencing) startConferencing.onclick = createButtonClickHandler;
var participants =  document.getElementById('participants');

var chatOutput = document.getElementById('chat-output');

var unnecessaryStuffVisible = true;
function hideUnnecessaryStuff() {
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;

    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
    unnecessaryStuffVisible = false;
	if (startConferencing) startConferencing.style.display = 'none';
}

var chatMessage = document.getElementById('chat-message');
if (chatMessage)
    chatMessage.onchange = function() {
        hangoutUI.send(chatMessage.value);
		chatMessage.value = '';
    };
	

/* ---------------------------------------- */	
/* file sharing stuff */
/* ---------------------------------------- */	

var content = [];
var moz = !!navigator.mozGetUserMedia;
var lastFileName = ''; /* Direct file blob sharing using Firefox Nightly */

function onMessageCallback(data) {
    /* if firefox nightly & file blob shared */
    if (data.size && moz) {
        var reader = new window.FileReader();
        reader.readAsDataURL(data);
        reader.onload = function (event) {
            saveToDisk(event.target.result, lastFileName);
            quickOutput(lastFileName, 'received successfully!');
            disable(false);
        };
        return;
    }

    /* if firefox nightly & file blob shared */
    if (data.lastFileName) {
        lastFileName = data.lastFileName;
        quickOutput(lastFileName, 'is ready to transfer.');
        disable(true);
        return;
    }

	if(data.connected) 
	{
		quickOutput('Your friend is connected to you.');
		return;
	}
	
	disable(true);
	
    if (data.packets) packets = parseInt(data.packets);
	updateStatus();
	
    content.push(data.message);
	
	if(data.last) {
		saveToDisk(content.join(''), data.name);
        quickOutput(data.name, 'received successfully!');
		disable(false);
		content = [];
    }
}

// getting file from user's system
var file, fileElement = document.getElementById('file');
fileElement.onchange = function() {
    file = fileElement.files[0];
    if (!file) return;

    /* if firefox nightly: share file blob directly */
    if (moz) {
        hangoutUI.send(JSON.stringify({ lastFileName: file.name }));
        quickOutput(file.name, 'shared successfully!');
		setTimeout(function() {
			if(fileElement) fileElement.value = '';
		}, 0);
        return hangoutUI.send(file);
    }

    var reader = new window.FileReader();
    reader.readAsDataURL(file);
    reader.onload = onReadAsDataURL;

    disable(true);
};

var packetSize = 1000, textToTransfer = '', packets = 0;
function onReadAsDataURL(evt, text) {
    var data = {};

    if (evt) {
        text = evt.target.result;
        packets = data.packets = parseInt(text.length / packetSize);
    }

    updateStatus();

    if (text.length > packetSize) {
        data.message = text.slice(0, packetSize);
    } else {
        data.message = text;
        data.last = true;
		data.name = file.name;

        quickOutput(file.name, 'shared successfully!');

        disable(false);
		setTimeout(function() {
			if(fileElement) fileElement.value = '';
		}, 0);
    }
	hangoutUI.send(JSON.stringify(data));
	
	textToTransfer = text.slice(data.message.length);

	if (textToTransfer.length)
	    setTimeout(function() {
	        onReadAsDataURL(null, textToTransfer);
	    }, 500);
}

function saveToDisk(fileUrl, fileName) {
    var save = document.createElement("a");
    save.href = fileUrl;
    save.target = "_blank";
    save.download = fileName || fileUrl;

    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

    save.dispatchEvent(evt);

    window.URL.revokeObjectURL(save.href);
}

// UI
var outputPanel = document.getElementById('output-panel');
function quickOutput(message, message2) {
    if (!outputPanel) return;	
	if(message2) message = '<strong>' + message + '</strong> ' + message2;
	
	var tr = document.createElement('tr');
	tr.innerHTML = '<td style="width:80%;">' + message + '</td>';
	outputPanel.insertBefore(tr, outputPanel.childNodes[0]);
}

var statusDiv = document.getElementById('status');
function updateStatus() {	
	packets--;
	if(statusDiv) statusDiv.innerHTML = packets + ' items remaining.';
	if(packets <= 0) statusDiv.innerHTML = '';
}

(function() {
	var uniqueToken = document.getElementById('unique-token');
	if (uniqueToken)
		uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = (function () {
			return "#private-" + ("" + 1e10).replace(/[018]/g, function (a) {
				return (a ^ Math.random() * 16 >> a / 4).toString(16);
			});
		})();
})();

function disable(_disable)
{
	if(!fileElement) return;
	if(!_disable) fileElement.removeAttribute('disabled');
	else fileElement.setAttribute('disabled', true);
}