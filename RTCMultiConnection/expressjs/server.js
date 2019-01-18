// http://127.0.0.1:9001
// http://localhost:9001

const ioServer = require('socket.io');
const RTCMultiConnectionServer = require('rtcmulticonnection-server');

const port = process.env.PORT || 9001;

const express = require('express');
const app = express();
const path = require('path');
const server = require('http');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

var httpServer = server.createServer(app);

httpServer.listen(port, process.env.IP || "0.0.0.0", function() {
    console.log('Server is running on port ' + port);
});

// --------------------------
// socket.io codes goes below

ioServer(httpServer).on('connection', function(socket) {
    RTCMultiConnectionServer.addSocket(socket);

    // ----------------------
    // below code is optional

    const params = socket.handshake.query;

    if (!params.socketCustomEvent) {
        params.socketCustomEvent = 'custom-message';
    }

    socket.on(params.socketCustomEvent, function(message) {
        socket.broadcast.emit(params.socketCustomEvent, message);
    });
});
