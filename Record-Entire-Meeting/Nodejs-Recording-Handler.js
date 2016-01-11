module.exports = exports = function(app, successCallback) {
    var io = require('socket.io')(app, {
        log: false,
        origins: '*:*'
    });

    io.on('connection', SocketExtender);
};


// this lib is used to create directories
var mkdirp = require('mkdirp');
var fs = require('fs');
var isWindows = !!process.platform.match(/^win/);

var WriteToDisk = require('./Write-Recordings-To-Disk.js');
var ConcatenateRecordings = require('./Concatenate-Recordings.js');

// each room is having a unique directory
// this object stores those info
// e.g.
// roomsDirs[roomid] = {
//    usersIndexed: {
//        interval: currentInterval,  // that are uploaded to server
//        fileName: hisUniqueFileName // it is "userid" though
//    }
// };
var roomsDirs = {};

function SocketExtender(socket) {
    // reading io.connect('/?query=parameter&other=value');
    var params = socket.handshake.query;

    // used to invoke ffmpeg via bash in windows

    // all recorded blobs are passed here
    // it is a function because we need to make sure
    // 1) directory is either empty or NOT exists
    // 2) if directory exists, then delete all nested files & directory itself
    // 3) use loop-back until directory is empty of the existing files
    function onGettingRecordedMessages(data, callback) {
        // blobs that are uploaded from client
        // 1) audio-blob
        // 2) video-blob
        var files = JSON.parse(data);

        // this user is having unique roomid
        // it is used to understand "room-directory"
        socket.roomId = files.roomId;

        // this user is having unique userid
        // it is used to understand "file-name"
        socket.userId = files.userId;

        // if global-variable isn't having "roomid"
        // todo: merely this code is checking to see if directory exists or NOT.
        //       try to check directory-presence outside of this block as well.
        if (!roomsDirs[files.roomId]) {
            // default values for room
            roomsDirs[files.roomId] = {
                usersIndexed: {}
            };

            console.log('dev-logs', 'roomsDirs: ' + files.roomId);

            // if directory doesn't exists, then create it
            // todo: follow this pattern
            //       1) check to see if directory exists, delete it first
            //       2) remove all nested files from existing directory
            //       3) create new directory
            //       4) make sure that this stuff is handled above of this block (so that it works for all the codes)
            if (!fs.existsSync('./uploads/' + files.roomId)) {
                createNewDir('./uploads/' + files.roomId, data, onGettingRecordedMessages, callback);
                return;
            }

            // loop-back: this time "if-block" will be skipped because "roomsDirs" is now having "roomid"
            onGettingRecordedMessages(data, callback);
            return;
        }

        // if user doesn't exists in the global-variable
        // todo: if user exists and interval is "1" then what??
        //       suggestion: delete all user's existing files
        if (!roomsDirs[files.roomId].usersIndexed[files.userId]) {
            console.log('dev-logs', 'roomsDirs - setting userid: ' + files.userId);

            // user's defaults
            roomsDirs[files.roomId].usersIndexed[files.userId] = {
                interval: files.interval,
                fileName: files.fileName
            };
        }

        // interval is set on each upload
        roomsDirs[files.roomId].usersIndexed[files.userId].interval = files.interval;

        // write files to disk
        WriteToDisk(files, socket);

        // let client know that his blobs are successfully uploaded
        callback();
    }

    // this event is used to get uploaded blobs from client
    socket.on('recording-message', onGettingRecordedMessages);

    // all these three events are used to detect if "recording-is-ended"
    // todo: setTimeout should be added in "disconnect" event
    //       and all other events should be removed???
    // socket.on('disconnect', onRecordingStopped);
    socket.on('stream-stopped', onRecordingStopped);

    function onRecordingStopped() {
        // 1) if directory doesn't exists
        // 2) if user doesn't exists
        // then, simply skip the rest
        if (!roomsDirs[socket.roomId] || !roomsDirs[socket.roomId].usersIndexed[socket.userId]) {
            return;
        }

        // get the user (file-name, interval)
        var user = roomsDirs[socket.roomId].usersIndexed[socket.userId];

        
        /*
        files.lastIndex = files.interval + 1;
        ConcatenateRecordings(files, socket);
        */

        ConcatenateRecordings({
            fileName: user.fileName,
            lastIndex: user.interval + 1,
            roomId: socket.roomId,
            userId: socket.userId,
            interval: user.interval
        }, socket);

        // delete users index so that he can record again
        if (!!roomsDirs[socket.roomId] && !!roomsDirs[socket.roomId].usersIndexed[socket.userId]) {
            delete roomsDirs[socket.roomId].usersIndexed[socket.userId];
        }

        // if he is the alone user in this room
        // delete room from global-variable
        // todo???? delete room-directory as well???
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