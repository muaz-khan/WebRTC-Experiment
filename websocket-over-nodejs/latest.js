// 2013, @muazkh » https://github.com/muaz-khan
// MIT License   » https://www.webrtc-experiment.com/licence/
// Documentation » https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs
// Demo          » https://www.webrtc-experiment.com/websocket/

// Open          » http://localhost:1337/

var WebSocketServer = require('websocket').server;
var https = require('https');
var fs = require('fs');

var privateKey = fs.readFileSync('fakekeys/privatekey.pem').toString(),
    certificate = fs.readFileSync('fakekeys/certificate.pem').toString();
	
var SSL_Credentials = {
	    key: privateKey,
	    cert: certificate
	};

var server = https.createServer(SSL_Credentials, function(request, response) { });
server.listen(1337);

// create the server
wsServer = new WebSocketServer({
    httpServer: server,
	autoAcceptConnections: false
});

var clients = [];

wsServer.on('request', function(socket) {
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
});


function removeUser(websocket) {
	var newClientsArray = [];
	for(var i = 0; i < clients.length; i++) {
		var previousSocket = clients[i];
		if(previousSocket != websocket) newClientsArray.push(previousSocket);
	}
    clients = newClientsArray;
}
