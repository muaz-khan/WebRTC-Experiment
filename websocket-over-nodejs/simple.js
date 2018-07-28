// https://www.webrtc-experiment.com/

// Dependencies:
// 1. WebSocket
// 2. Node-Static

// Features:
// 1. WebSocket over Nodejs connection
// 2. Now rooms; it is a simple implementation!

var fs = require('fs');

var _static = require('node-static');
var file = new _static.Server('./public');

// HTTP server
var app = require('http').createServer(function(request, response) {
    request.addListener('end', function() {
        file.serve(request, response);
    }).resume();
});

var WebSocketServer = require('websocket').server;

new WebSocketServer({
    httpServer: app,
    autoAcceptConnections: false
}).on('request', onRequest);

// shared stuff

var clients = [];

function onRequest(socket) {
    var origin = socket.origin + socket.resource;
    console.log('origin', origin);

    var websocket = socket.accept(null, origin);
    clients.push(websocket);

    websocket.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('utf8', message.utf8Data);
            clients.forEach(function(previousSocket) {
                if (previousSocket != websocket) previousSocket.sendUTF(message.utf8Data);
            });
        } else if (message.type === 'binary') {
            console.log('binary', message.binaryData);
            clients.forEach(function(previousSocket) {
                if (previousSocket != websocket) previousSocket.sendBytes(message.binaryData);
            });
        }
    });

    websocket.on('close', function() {
        removeUser(websocket);
    });
}


function removeUser(websocket) {
    var newClientsArray = [];
    for (var i = 0; i < clients.length; i++) {
        var previousSocket = clients[i];
        if (previousSocket != websocket) newClientsArray.push(previousSocket);
    }
    clients = newClientsArray;
}

app.listen(process.env.PORT || 12034);

console.log('Please open NON-SSL URL: http://localhost:12034/');
