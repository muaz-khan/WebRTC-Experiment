var fs = require('fs');
var express = require('express');

var app = express();

app.configure(function () {
    var hourMs = 1000 * 60 * 60;
    app.use(express.static('static', {
        maxAge: hourMs
    }));
    app.use(express.directory('static'));
    app.use(express.errorHandler());
});

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(8888);

// ----------------------------------socket.io

var channels = {};

// sometimes it helps!
// io.set('transports', ['xhr-polling']);

io.sockets.on('connection', function (socket) {
    var initiatorChannel = '';
    if (!io.isConnected) {
        io.isConnected = true;
    }

    socket.on('new-channel', function (data) {
        if (!channels[data.channel]) {
            initiatorChannel = data.channel;
        }

        channels[data.channel] = data.channel;
        onNewNamespace(data.channel, data.sender);
    });

    socket.on('presence', function (channel) {
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
    });

    socket.on('disconnect', function (channel) {
        if (initiatorChannel) {
            delete channels[initiatorChannel];
        }
    });
});

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            if (data.sender == sender)
                socket.broadcast.emit('message', data.data);
        });
    });
}
