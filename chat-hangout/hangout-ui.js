var config = {
    openSocket: function (config) {
        if (!window.io) return false;

        if (!window.socket_config)
            window.socket_config = {
                publish_key: 'demo',
                subscribe_key: 'demo',
                ssl: true
            };

        socket_config.channel = config.channel || 'chat-hangout';
        var socket = io.connect('https://pubsub.pubnub.com/hangout', socket_config);
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
        tr.innerHTML = '<td style="width:80%;">' + room.roomName + '</td>' +
					   '<td><a href="#" class="join" id="' + room.roomToken + '">Join Room</a></td>';

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
    },
    onChannelMessage: function (data) {
        if (!chatOutput) {
            console.log(message);
            return;
        }

        var tr = document.createElement('tr');
        tr.innerHTML =
                '<td style="width:40%;">' + data.sender + '</td>' +
                '<td>' + data.message + '</td>';

        chatOutput.insertBefore(tr, chatOutput.childNodes[0]);
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

var chatOutput = document.getElementById('chat-output');

var unnecessaryStuffVisible = true;
function hideUnnecessaryStuff() {
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;

    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
    unnecessaryStuffVisible = false;

    var chatTable = document.getElementById('chat-table');
    if (chatTable) chatTable.style.display = 'block';
    if (chatOutput) chatOutput.style.display = 'block';
}

var chatMessage = document.getElementById('chat-message');
if (chatMessage)
    chatMessage.onchange = function() {
        hangoutUI.send(chatMessage.value);
		chatMessage.value = '';
    };