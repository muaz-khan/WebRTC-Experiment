/* MIT License: https://webrtc-experiment.appspot.com/licence/ 
    It is recommended to use DataChannel.js for text/file/data sharing: <http://bit.ly/DataChannel-Documentation>
*/

var config = {
    openSocket: function (config) {
        if (!window.Firebase) return;
        var channel = config.channel || location.hash.replace('#', '') || 'chat-hangout';
        var socket = new Firebase('https://chat.firebaseIO.com/' + channel);
        socket.channel = channel;
        socket.on("child_added", function (data) {
            config.onmessage && config.onmessage(data.val());
        });
        socket.send = function (data) {
            this.push(data);
        }
        config.onopen && setTimeout(config.onopen, 1);
        socket.onDisconnect().remove();
        return socket;
    },
    onRoomFound: function (room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        if (typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.innerHTML = '<td style="width:80%;">' + room.roomName + '</td>' +
					   '<td><button class="join" id="' + room.roomToken + '">Join Room</button></td>';

        roomsList.insertBefore(tr, roomsList.firstChild);

        tr.onclick = function () {
            var tr = this;
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

        chatOutput.insertBefore(tr, chatOutput.firstChild);
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
var roomsList = document.getElementById('rooms-list');

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
    chatMessage.onchange = function () {
        hangoutUI.send(chatMessage.value);
        var tr = document.createElement('tr');
        tr.innerHTML =
                '<td style="width:40%;">You:</td>' +
                '<td>' + chatMessage.value + '</td>';

        chatOutput.insertBefore(tr, chatOutput.firstChild);
        chatMessage.value = '';
    };


(function () {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken) if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">You can share this private link with your friends.</a></h2>';
    else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = (function () {
        return "#private-" + ("" + 1e10).replace(/[018]/g, function (a) {
            return (a ^ Math.random() * 16 >> a / 4).toString(16);
        });
    })();
})();