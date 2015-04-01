var SIGNALING_SERVER = 'https://signaling-muazkh.c9.io:443/';
var channel = location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');

var sender = Math.round(Math.random() * 9999999999) + 9999999999;
io.connect(SIGNALING_SERVER).emit('new-channel', {
    channel: channel,
    sender : sender
});

var socket = io.connect(SIGNALING_SERVER + channel);

socket.send = function (message) {
    socket.emit('message', {
        sender: sender,
        data  : message
    });
};

socket.on('message', function(data) {
    signaler.emit('message', data);
});

var signaler = new Signaler();
signaler.on('message', function(message) {
    socket.emit('message', {
        sender: sender,
        data  : message
    });
});