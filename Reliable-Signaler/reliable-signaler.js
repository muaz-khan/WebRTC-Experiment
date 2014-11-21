// This file handles socket.io based reliable signaling

// require('reliable-signaler')(httpServer || expressServer || portNumber);

exports.ReliableSignaler = ReliableSignaler;

function ReliableSignaler(app) {
    var io = require('socket.io').listen(app, {
        log: false,
        origins: '*:*'
    });

    var listOfSessions = {};

    io.on('connection', function(socket) {
        var currentUser = socket;

        socket.on('keep-in-server', function(sessionDescription) {
            listOfSessions[sessionDescription.sessionid] = sessionDescription;
            currentUser.session = sessionDescription;
        });

        socket.on('get-session-info', function(sessionid, callback) {
            if (!!listOfSessions[sessionid]) {
                callback(listOfSessions[sessionid]);
                return;
            }

            (function recursive() {
                if (currentUser && listOfSessions[sessionid]) {
                    callback(listOfSessions[sessionid]);
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
            if (currentUser && currentUser.session && listOfSessions[currentUser.session]) {
                delete listOfSessions[currentUser.session];
            }

            currentUser = null;
        });
    });
}
