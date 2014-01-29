// Last time updated at 29 January 2014, 05:46:23

// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Experiments    - github.com/muaz-khan/WebRTC-Experiment
// RecordRTC      - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC

// RecordRTC over 
// Socket.io      - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-over-Socketio

var fs = require('fs'),
    sys = require('sys'),
    exec = require('child_process').exec;

var app = require('http').createServer(handler),
    io = require('socket.io').listen(app);

function handler(req, res) {
    res.writeHead(200);
    res.end("welcome sir!");
}

io.sockets.on('connection', function(socket) {
    socket.on('message', function(data) {
        console.log('writing to disk');
        writeToDisk(data.audio.dataURL, data.audio.name);
        writeToDisk(data.video.dataURL, data.video.name);

        merge(socket, data.audio.name, data.video.name);
    });
});

app.listen(8888);

function writeToDisk(dataURL, fileName) {
    var fileExtension = fileName.split('.').pop(),
        fileRootNameWithBase = './uploads/' + fileName,
        filePath = fileRootNameWithBase,
        fileID = 2,
        fileBuffer;

    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }

    dataURL = dataURL.split(',').pop();
    fileBuffer = new Buffer(dataURL, 'base64');
    fs.writeFileSync(filePath, fileBuffer);

    console.log('filePath', filePath);
}

function merge(socket, audioName, videoName) {
    // detect the current operating system
    var isWin = !!process.platform.match( /^win/ );

    if (isWin) {
        ifWin(socket, audioName, videoName);
    } else {
        ifMac(socket, audioName, videoName);
    }
}

function ifWin(socket, audioName, videoName) {
    // following command tries to merge wav/webm files using ffmpeg
    var merger = __dirname + '\\merger.bat';
    var audioFile = __dirname + '\\uploads\\' + audioName;
    var videoFile = __dirname + '\\uploads\\' + videoName;
    var mergedFile = __dirname + '\\uploads\\' + audioName.split('.')[0] + '-merged.webm';

    // if a "directory" has space in its name; below command will fail
    // e.g. "c:\\dir name\\uploads" will fail.
    // it must be like this: "c:\\dir-name\\uploads"
    var command = merger + ', ' + videoFile + " " + audioFile + " " + mergedFile + '';
    var cmd = exec(command, function(error) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            console.log('Signal received: ' + error.signal);
        } else {
            socket.emit('merged', audioName.split('.')[0] + '-merged.webm');

            // removing audio/video files
            fs.unlink(audioFile);
            fs.unlink(videoFile);

            // auto delete file after 1-minute
            setTimeout(function() {
                fs.unlink(mergedFile);
            }, 60 * 1000);
        }
    });
}

function ifMac(response, audioName, videoName) {
    // its probably *nix, assume ffmpeg is available
    var audioFile = __dirname + '/uploads/' + audioName;
    var videoFile = __dirname + '/uploads/' + videoName;
    var mergedFile = __dirname + '/uploads/' + audioName.split('.')[0] + '-merged.webm';
    var util = require('util'),
        exec = require('child_process').exec;
    //child_process = require('child_process');

    var command = "ffmpeg -i " + videoFile + " -i " + audioFile + " -map 0:0 -map 1:0 " + mergedFile;

    var child = exec(command, function(error) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: ' + error.code);
            console.log('Signal received: ' + error.signal);

        } else {
            socket.emit('merged', audioName.split('.')[0] + '-merged.webm');

            // removing audio/video files
            fs.unlink(audioFile);
            fs.unlink(videoFile);

            // auto delete file after 1-minute
            setTimeout(function() {
                fs.unlink(mergedFile);
            }, 60 * 1000);

        }
    });
}
