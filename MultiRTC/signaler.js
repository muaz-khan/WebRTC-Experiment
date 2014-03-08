// https://www.webrtc-experiment.com:12034/

var fs = require('fs');

var _static = require('node-static');
var file = new _static.Server('./public');


/*
// HTTP server
var app = require('http').createServer(function(request, response) {
    request.addListener('end', function() {
        if (request.url.search( /.png|.gif|.js|.css/g ) == -1) {
            file.serveFile('/index.html', 402, { }, request, response);
        } else file.serve(request, response);
    }).resume();
});
*/


var options = {
    key: fs.readFileSync('privatekey.pem'),
    cert: fs.readFileSync('certificate.pem')
};

// HTTPs server
var app = require('https').createServer(options, function(request, response) {
    request.addListener('end', function() {
        if (request.url.search( /.png|.gif|.js|.css/g ) == -1) {
            file.serveFile('/index.html', 402, { }, request, response);
        } else file.serve(request, response);
    }).resume();
});

// socket.io implementation
var io = require('socket.io').listen(app);

var rooms = {};

io.sockets.on('connection', function(socket) {
    var room = socket.handshake.query.room;
    var userid = socket.handshake.query.userid;
	var isRoomExists = !!rooms[room];
	
	socket.emit('room-found', isRoomExists);
	
    if(!isRoomExists) {
        rooms[room] = {
            room: room,
            users: [userid]
        };
    }
    else rooms[room].users.push(userid);
    
    socket.on('message', function(data) {
        socket.broadcast.emit('message', data);
    });
    
    socket.on('playRoleOfInitiator', function(_userid) {
        if(_userid == userid) {
            isRoomExists = false;
        }
    });
    
    socket.on('disconnect', function() {
		if(!isRoomExists && rooms[room]) {
            if(rooms[room].users.length > 1) {
                delete rooms[room].users[0];
                rooms[room].users = swap(rooms[room].users);
                
                socket.broadcast.emit('playRoleOfInitiator', rooms[room].users[0]);
            }
            else delete rooms[room];
        }
        else {
            var length = rooms[room].users.length;
            for(var i = 0; i < length; i++) {
                var user = rooms[room].users[i];
                if(user == userid) {
                    delete rooms[room].users[i];
                }
            }
            rooms[room].users = swap(rooms[room].users);
        }
		
        socket.broadcast.emit('user-left', {
            userid: userid,
            room: room
        });
    });
});

function swap(arr) {
        var swapped = [],
            length = arr.length;
        for (var i = 0; i < length; i++)
            if (arr[i] && arr[i] !== true)
                swapped.push(arr[i]);
        return swapped;
    }

app.listen(12034);

console.log('https://localhost:12034/');
