#### Using [Socket.io over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs) for WebRTC Signaling / [Demo](http://webrtc-signaling.jit.su/)

This directory contains only one file: [signaler.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs/webrtc-signaling/signaler.js) / socket.io main script

=

#### [signaler.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs/webrtc-signaling/signaler.js)

It listens/publishes/creates `dynamic namespaces`.

Here is `signaler.js`'s socket.io part:

```javascript
var port = 8888;

var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(port);

io.sockets.on('connection', function (socket) {
    if (!io.connected) io.connected = true;

    socket.on('new-channel', function (data) {
        onNewNamespace(data.channel, data.sender);
    });
});

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            if (data.sender == sender) socket.broadcast.emit('message', data.data);
        });
    });
}
```

=

#### License

[WebRTC Experiments](https://github.com/muaz-khan/WebRTC-Experiment) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
