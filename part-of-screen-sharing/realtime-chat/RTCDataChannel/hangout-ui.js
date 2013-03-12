var hangoutUI = hangout({
    openSocket: function (config) {
        if (!window.Firebase) return;
        var channel = config.channel || location.hash.replace('#', '') || 'realtime-text-chat';
        console.log('using channel: ' + channel);
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
        hangoutUI.joinRoom({
            roomToken: room.roomToken,
            joinUser: room.broadcaster,
            userName: Math.random().toString(36).substr(2, 35)
        });
        hideUnnecessaryStuff();
    },
    onChannelOpened: function () {
        hideUnnecessaryStuff();
        startSendingImage();
    },
    onChannelMessage: function (data) {
        onMessage(data);
    }
});

var startConferencing = document.getElementById('start-conferencing');
if (startConferencing) {
    if (location.hash) startConferencing.innerHTML = 'Start Realtime Private Chat';
    startConferencing.onclick = function () {
        hangoutUI.createRoom({
            userName: Math.random().toString(36).substr(2, 35),
            roomName: (document.getElementById('conference-name') || {}).value || 'Anonymous'
        });
        hideUnnecessaryStuff();
    };
}

function hideUnnecessaryStuff() {
    startConferencing.style.display = 'none';
    var hideMeLater = document.getElementById('hide-me-later');
    if (hideMeLater) hideMeLater.style.display = 'none';
}

(function () {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken) {
        if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = 'You can share <a href="' + location.href + '" target="_blank">this private room</a> with your friends.';
        else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = (function () {
            return "#private-" + ("" + 1e10).replace(/[018]/g, function (a) {
                return (a ^ Math.random() * 16 >> a / 4).toString(16);
            });
        })();
    }
})();