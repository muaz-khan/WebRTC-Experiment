// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.webrtc-experiment.com/licence
// Documentation - github.com/streamproc/MediaStreamRecorder
module.exports = exports = function(socket) {
    SocketExtender(socket);
};

var mkdirp = require('mkdirp');
var fs = require('fs');

var WriteToDisk = require('./Write-Recordings-To-Disk.js');
var ConcatenateRecordings = require('./Concatenate-Recordings.js');

var roomsDirs = {};

function SocketExtender(socket) {
    var params = socket.handshake.query;

    function onGettingRecordedMessages(data, callback) {
        var file = JSON.parse(data);

        socket.roomId = file.roomId;
        socket.userId = file.userId;

        if (!roomsDirs[file.roomId]) {
            roomsDirs[file.roomId] = {
                usersIndexed: {}
            };

            if (!fs.existsSync('./uploads/' + file.roomId)) {
                createNewDir('./uploads/' + file.roomId, data, onGettingRecordedMessages, callback);
                return;
            }

            onGettingRecordedMessages(data, callback);
            return;
        }

        if (!roomsDirs[file.roomId].usersIndexed[file.userId]) {
            roomsDirs[file.roomId].usersIndexed[file.userId] = {
                interval: file.interval,
                fileName: file.fileName
            };
        }

        roomsDirs[file.roomId].usersIndexed[file.userId].interval = file.interval;

        console.log('writing file do disk', file.interval);

        WriteToDisk(file, socket);

        callback();
    }

    socket.on('recording-message', onGettingRecordedMessages);
    socket.on('stream-stopped', onRecordingStopped);
    socket.on('disconnect', onRecordingStopped);

    function onRecordingStopped() {
        if (!socket.roomId || !socket.userId) return;

        console.log('onRecordingStopped');

        if (!roomsDirs[socket.roomId] || !roomsDirs[socket.roomId].usersIndexed[socket.userId]) {
            console.log('skipped', socket.roomId, socket.userId);
            return;
        }

        var user = roomsDirs[socket.roomId].usersIndexed[socket.userId];

        ConcatenateRecordings({
            fileName: user.fileName,
            lastIndex: user.interval + 1,
            roomId: socket.roomId,
            userId: socket.userId,
            interval: user.interval
        }, socket);

        if (!!roomsDirs[socket.roomId] && !!roomsDirs[socket.roomId].usersIndexed[socket.userId]) {
            delete roomsDirs[socket.roomId].usersIndexed[socket.userId];
        }

        if (!!roomsDirs[socket.roomId] && Object.keys(roomsDirs[socket.roomId].usersIndexed).length <= 1) {
            delete roomsDirs[socket.roomId];
        }
    }

}

// FUNCTION used to create room-directory
function createNewDir(path, data, onGettingRecordedMessages, callback) {
    mkdirp(path, function(err) {
        if (err) {
            return setTimeout(createNewDir, 1000);
        }
        onGettingRecordedMessages(data, callback);
    });
}
