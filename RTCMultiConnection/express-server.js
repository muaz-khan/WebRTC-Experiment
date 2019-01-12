const express = require('express');
const path = require('path');

const httpApp = express();
const server = require('http').Server(httpApp);

const ioServer = require('socket.io');
const RTCMultiConnectionServer = require('rtcmulticonnection-server');

ioServer(httpApp).on('connection', function(socket) {
    RTCMultiConnectionServer.addSocket(socket, config);

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
