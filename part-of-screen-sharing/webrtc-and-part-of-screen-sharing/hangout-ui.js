/* MIT License: https://webrtc-experiment.appspot.com/licence/ */

var hangoutUI = hangout({
    openSocket: function (config) {
        if (!window.Firebase) return;
        var channel = config.channel || location.hash.replace('#', '') || 'webrtc-sharing-part-of-screen';
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
        startSendingImage();
        hideUnnecessaryStuff();
    },
    onChannelMessage: function (data) {
        onMessage(data);
    }
});

if (!moz) alert('Please test this demo on Firefox (aurora/nightly/stable).');

var startConferencing = document.getElementById('start-conferencing');
if (startConferencing) {
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