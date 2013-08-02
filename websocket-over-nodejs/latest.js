// 2013, @muazkh » https://github.com/muaz-khan
// MIT License   » https://www.webrtc-experiment.com/licence/
// Documentation » https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs
// Demo          » https://www.webrtc-experiment.com/websocket/

// Non-SSL URL   » ws ://localhost:1338/
// SSL URL       » wss://localhost:1337/

var WebSocketServer = require('websocket').server;
var fs = require('fs');

// Non-SSL stuff
var http = require('http');

var simple_server = http.createServer();

simple_server.listen(1338);

new WebSocketServer({
    httpServer: simple_server,
    autoAcceptConnections: false
}).on('request', onRequest);

// SSL stuff
var https = require('https');
var SSL_Credentials = {
	    key: fs.readFileSync('fakekeys/privatekey.pem').toString(),
	    cert: fs.readFileSync('fakekeys/certificate.pem').toString()
	};

var ssl_server = https.createServer(SSL_Credentials, function() {});

ssl_server.listen(1337);

new WebSocketServer({
    httpServer: ssl_server,
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
            clients.forEach(function (previousSocket) {
                if (previousSocket != websocket) previousSocket.sendUTF(message.utf8Data);
            });
        }
        else if (message.type === 'binary') {
			console.log('binary', message.binaryData);
			clients.forEach(function (previousSocket) {
                if (previousSocket != websocket) previousSocket.sendBytes(message.binaryData);
            });
        }
    });
    
    websocket.on('close', function(_websocket) {
		removeUser(websocket);
    });
}


function removeUser(websocket) {
	var newClientsArray = [];
	for(var i = 0; i < clients.length; i++) {
		var previousSocket = clients[i];
		if(previousSocket != websocket) newClientsArray.push(previousSocket);
	}
    clients = newClientsArray;
}