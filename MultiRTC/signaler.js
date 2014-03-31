var port80 = 12034;  // change it to 80
var port443 = 12034; // change it to 443

var fs = require('fs');

var _static = require('node-static');
var file = new _static.Server('./public');

var options = {
    key: fs.readFileSync('privatekey.pem'),
    cert: fs.readFileSync('certificate.pem')
};

var http = require('http').createServer(function(request, response) {
    request.addListener('end', function() {
        if (request.url.search( /.png|.gif|.js|.css/g ) == -1) {
            file.serveFile('/index.html', 402, { }, request, response);
        } else file.serve(request, response);
    }).resume();
}).listen(port80);

var https = require('https').createServer(options, function(request, response) {
    request.addListener('end', function() {
        if (request.url.search( /.png|.gif|.js|.css/g ) == -1) {
            file.serveFile('/index.html', 402, { }, request, response);
        } else file.serve(request, response);
    }).resume();
}).listen(port443);

// socket.io implementation
var io = require('socket.io');

var https_io = io.listen(https);
var http_io = io.listen(http);

var channels = { };

// socket.io on port 443
captureEvents(https_io);

// socket.io on port 80
captureEvents(http_io);

function captureEvents(_io) {
    _io.sockets.on('connection', function(socket) {
        var userid = socket.handshake.query.userid;
        
        var room = socket.handshake.query.room;
        
        socket.emit('room-found', channels[room]);
        
        var firstChannel;
        if(!channels[room]) firstChannel = room;
        channels[room] = room;
        onNewNamespace(room, userid);
        
        socket.on('session-description', function(sessionDescription) {
            channels[room] = sessionDescription;
        });
        
        socket.on('new-channel', function(data) {
            if(data.sender == userid) {
                channels[data.channel] = data.channel;
                onNewNamespace(data.channel, data.sender);
            }
        });
        
        socket.on('disconnect', function() {
            socket.broadcast.emit('user-left', userid);
            if(firstChannel && channels[firstChannel]) {
                if(_io.sockets && _io.sockets.manager && _io.sockets.manager.namespaces && _io.sockets.manager.namespaces[firstChannel]){
                    delete _io.sockets.manager.namespaces[firstChannel];
                }
                delete channels[firstChannel];
            }
            if(_io.sockets && _io.sockets[socket.id]){
                delete _io.sockets[socket.id];
            }
            
            if(_io.sockets && _io.sockets.clients && _io.sockets.clients(socket.id)) {
                delete _io.sockets.clients(socket.id);
            }
            
            socket.broadcast.emit('user-left', {
                userid: userid,
                room: room
            });
        });
        
        socket.on('playRoleOfInitiator', function(_userid) {
            if(_userid == userid) {
                firstChannel = room;
            }
        });
        
        function onNewNamespace(channel, sender) {
            _io.of('/' + channel).on('connection', function(socket) {
                socket.on('message', function(data) {
                    if (data.sender == sender) {
                        socket.broadcast.emit('message', data.data);
                    }
                });
            });
        }
    });
}
