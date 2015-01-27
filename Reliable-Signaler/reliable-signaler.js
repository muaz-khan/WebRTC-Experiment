// This file handles socket.io based reliable signaling

// require('reliable-signaler')(httpServer || expressServer || portNumber);

exports.ReliableSignaler = ReliableSignaler;

function ReliableSignaler(app, socketCallback) {
    var io = require('socket.io').listen(app, {
        log: false,
        origins: '*:*'
    });

    var listOfRooms = {};

    io.on('connection', function(socket) {
        var currentUser = socket;

        socket.on('keep-in-server', function(roomid, callback) {
            listOfRooms[roomid] = roomid;
            currentUser.roomid = roomid;
            if(callback) callback();
        });

        socket.on('get-session-info', function(roomid, callback) {
            if (!!listOfRooms[roomid]) {
                callback(listOfRooms[roomid]);
                return;
            }

            (function recursive() {
                if (currentUser && listOfRooms[roomid]) {
                    callback(listOfRooms[roomid]);
                    return
                }
                setTimeout(recursive, 1000);
            })();
        });

        socket.on('message', function(message) {
            socket.broadcast.emit('message', message);
        });

        socket.on('disconnect', function() {
            if (!currentUser) return;

            // autoCloseEntireSession = true;
            if (currentUser && currentUser.roomid && listOfRooms[currentUser.roomid]) {
                delete listOfRooms[currentUser.roomid];
            }

            currentUser = null;
        });
        
        if(socketCallback) {
            socketCallback(socket);
        }
    });
}
